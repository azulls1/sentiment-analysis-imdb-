# Incident Response Runbook

Procedures for detecting, responding to, and resolving incidents in the IMDb Sentiment Analysis application.

---

## Incident Severity Levels

| Severity | Name | Description | Examples |
|----------|------|-------------|----------|
| **P1** | Critical | Service is completely down or data loss is occurring | Backend unresponsive, all requests failing, container crash loop |
| **P2** | High | Major feature is broken, significant user impact | Predictions returning errors, PDF export failing, error rate > 20% |
| **P3** | Medium | Degraded performance or minor feature broken | High latency (> 2s p95), ML drift detected, single endpoint failing |
| **P4** | Low | Cosmetic issue or minor inconvenience | Logging anomaly, stale metrics, non-critical warning in logs |

---

## Response Times

| Severity | Acknowledge | Begin Investigation | Resolution Target |
|----------|-------------|--------------------|--------------------|
| **P1** | 15 minutes | Immediately | 1 hour |
| **P2** | 1 hour | Within 1 hour | 4 hours |
| **P3** | 4 hours | Next business day | 1 week |
| **P4** | 1 business day | Next sprint | Next release |

---

## Escalation Path

```
1. On-call engineer (first responder)
   |
2. Tech lead / senior engineer
   |
3. Project owner (shernandez@iagentek.com.mx)
   |
4. Infrastructure team (if hosting/cloud issue)
```

### Escalation Triggers

- **P1 not resolved in 30 min**: Escalate to tech lead.
- **P1 not resolved in 1 hour**: Escalate to project owner.
- **P2 not resolved in 2 hours**: Escalate to tech lead.
- **Any data loss suspected**: Escalate to project owner immediately.

---

## Common Incidents and Resolution Steps

### 1. Backend Unresponsive

**Symptoms**: Health check fails, frontend shows "API no disponible", nginx returns 502/503.

**Diagnosis**:
```bash
# Check container status
docker compose ps

# Check backend logs
docker compose logs backend --tail=100

# Check health endpoint directly
curl -v http://localhost:8000/api/health

# Check resource usage
docker stats --no-stream
```

**Resolution**:
```bash
# Step 1: Restart backend container
docker compose restart backend

# Step 2: If restart fails, check logs for OOM or crash
docker compose logs backend --tail=200 | grep -i "error\|killed\|oom"

# Step 3: If OOM, increase memory limit in docker-compose.yml
# deploy.resources.limits.memory: 4G

# Step 4: Full rebuild if persistent
docker compose down
docker compose up --build -d
```

**Root causes**: Out of memory (ML model loading), dependency failure (Supabase), Python exception in startup.

---

### 2. High Error Rate

**Symptoms**: Error rate > 5% in metrics, multiple 500 responses in logs.

**Diagnosis**:
```bash
# Check metrics endpoint
curl http://localhost:8000/api/v1/metrics?format=json | python -m json.tool

# Check recent errors in logs
docker compose logs backend --tail=500 | grep "status_code=5"

# Check Supabase connectivity
curl http://localhost:8000/api/health?detail=true
```

**Resolution**:
```bash
# Step 1: Identify failing endpoint from metrics
curl http://localhost:8000/api/v1/metrics | python -m json.tool | grep -A5 "errors"

# Step 2: If Supabase-related, verify credentials
# Check .env for SUPABASE_URL, SUPABASE_ANON_KEY

# Step 3: If model-related, check model files
docker compose exec backend ls -la backend/models/

# Step 4: Restart if transient
docker compose restart backend
```

**Root causes**: Supabase connection failure, corrupted model files, input validation gaps.

---

### 3. ML Drift Detected

**Symptoms**: `ml_drift_alert` = 1 in metrics, positive ratio deviates > 10% from 50% baseline.

**Diagnosis**:
```bash
# Check prediction tracker metrics
curl http://localhost:8000/api/v1/metrics?format=json | python -c "
import json, sys
data = json.load(sys.stdin)
preds = data.get('predictions', {})
print(f'Total predictions: {preds.get(\"total_predictions\", 0)}')
print(f'Positive ratio: {preds.get(\"positive_ratio\", 0):.2%}')
print(f'Avg confidence: {preds.get(\"avg_confidence\", 0):.2%}')
print(f'ML ratio: {preds.get(\"ml_ratio\", 0):.2%}')
print(f'Drift alert: {preds.get(\"drift_alert\", False)}')
print(f'Drift detail: {preds.get(\"drift_detail\", \"N/A\")}')
"
```

**Resolution**:

1. **If input distribution changed**: This is expected if users are testing with biased data. Monitor but no action needed.
2. **If model degraded**: Retrain models with `python -m backend.scripts.train_and_save`.
3. **If heuristic fallback is dominating** (`ml_ratio` < 0.7): ML model may have failed to load. Restart backend.

**Root causes**: Biased user input, model file corruption, ML model load failure causing heuristic fallback.

---

### 4. Export Failures (PDF / Notebook)

**Symptoms**: PDF download returns 500, timeout on export endpoints.

**Diagnosis**:
```bash
# Check backend logs for export errors
docker compose logs backend --tail=200 | grep -i "export\|pdf\|weasyprint\|xhtml2pdf"

# Check memory usage (PDF gen is memory-intensive)
docker stats --no-stream

# Test export directly
curl -v -X POST http://localhost:8000/api/v1/export/pdf -o /dev/null
```

**Resolution**:
```bash
# Step 1: If OOM, increase backend memory
# Edit docker-compose.yml: memory: 4G

# Step 2: If WeasyPrint missing deps
docker compose exec backend python -c "import weasyprint; print('OK')"

# Step 3: If xhtml2pdf works but WeasyPrint fails, it will auto-fallback
# Check logs for "Using xhtml2pdf as fallback"

# Step 4: Restart and retry
docker compose restart backend
```

**Root causes**: Out of memory during PDF rendering, missing GTK/Pango dependencies, template rendering error.

---

### 5. Frontend Not Loading

**Symptoms**: Blank page, nginx 404, static assets not found.

**Diagnosis**:
```bash
# Check frontend container
docker compose ps frontend
docker compose logs frontend --tail=50

# Check nginx config
docker compose exec frontend nginx -t

# Check static files exist
docker compose exec frontend ls /usr/share/nginx/html/
```

**Resolution**:
```bash
# Step 1: Rebuild frontend
docker compose up --build -d frontend

# Step 2: If build fails, check Angular build
cd frontend && npx ng build --configuration=production

# Step 3: Check nginx config syntax
docker compose exec frontend nginx -t
```

---

### 6. Rate Limiting Issues

**Symptoms**: Legitimate users getting 429 responses, rate limit too aggressive or too lenient.

**Diagnosis**:
```bash
# Check current rate limit config
grep RATE_LIMIT .env

# Check rate limit headers in response
curl -v http://localhost:8000/api/health 2>&1 | grep -i "ratelimit"
```

**Resolution**:
```bash
# Adjust in .env:
# RATE_LIMIT_REQUESTS=200  (default: 200 per window)
# RATE_LIMIT_WINDOW=60     (default: 60 seconds)

# Restart to apply
docker compose restart backend
```

---

## Post-Mortem Process

After resolving any P1 or P2 incident:

1. Create a post-mortem document using `docs/postmortem-template.md`.
2. Schedule a review meeting within 3 business days.
3. Document action items with owners and deadlines.
4. Track action items to completion.

---

## Monitoring Quick Reference

| Check | Command |
|-------|---------|
| Service status | `docker compose ps` |
| Backend health | `curl http://localhost:8000/api/health` |
| Detailed health | `curl http://localhost:8000/api/health?detail=true` |
| Metrics (JSON) | `curl http://localhost:8000/api/v1/metrics` |
| Metrics (Prometheus) | `curl http://localhost:8000/api/v1/metrics?format=prometheus` |
| Backend logs | `docker compose logs backend --tail=100 -f` |
| Frontend logs | `docker compose logs frontend --tail=100 -f` |
| Resource usage | `docker stats --no-stream` |
| Restart backend | `docker compose restart backend` |
| Full rebuild | `docker compose down && docker compose up --build -d` |
