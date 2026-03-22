# Capacity Planning

Resource allocation, load estimates, and scaling guidance for the IMDb Sentiment Analysis application.

---

## Current Resource Allocation

### Docker Compose Defaults

| Service | Memory Limit | CPU Limit | Workers | Notes |
|---------|-------------|-----------|---------|-------|
| **Backend (FastAPI)** | 2 GB | 1.0 CPU | 4 Uvicorn workers | Includes ML model in memory (~500 MB for SVM + TF-IDF) |
| **Frontend (nginx)** | 512 MB | 0.5 CPU | nginx master + workers | Serves static Angular SPA assets |

### Memory Breakdown (Backend)

| Component | Estimated Memory |
|-----------|-----------------|
| Python runtime + FastAPI | ~100 MB |
| SVM model (joblib) | ~200 MB |
| TF-IDF vectorizer (joblib) | ~300 MB |
| Per-worker overhead (x4) | ~100 MB each |
| Rate limiter + metrics | ~20 MB |
| **Total estimated** | **~1.0-1.5 GB** |

Headroom: ~500 MB to 1 GB available for burst traffic and temporary allocations (PDF generation, large prediction batches).

### Memory Breakdown (Frontend)

| Component | Estimated Memory |
|-----------|-----------------|
| nginx master process | ~5 MB |
| nginx worker processes | ~20 MB |
| Static file cache | ~50 MB |
| **Total estimated** | **~75 MB** |

Headroom: ~437 MB available. The frontend is over-provisioned for reliability.

---

## Load Testing Baseline

### Estimated Requests Per Second (RPS) by Endpoint

These estimates assume a single backend instance with 4 Uvicorn workers on 1 CPU / 2 GB:

| Endpoint | Method | Estimated RPS | Avg Latency | Notes |
|----------|--------|--------------|-------------|-------|
| `GET /api/health` | GET | 500+ | < 5 ms | No computation, instant response |
| `GET /api/v1/datasets/stats` | GET | 200+ | < 10 ms | In-memory / cached data |
| `GET /api/v1/datasets/samples` | GET | 150+ | < 20 ms | Returns sample records |
| `GET /api/v1/model/results` | GET | 200+ | < 10 ms | Pre-computed results |
| `POST /api/v1/model/predict` | POST | 20-40 | 50-200 ms | ML inference (SVM + TF-IDF vectorization) |
| `GET /api/v1/report/content` | GET | 100+ | < 15 ms | Static content serving |
| `POST /api/v1/export/pdf` | POST | 2-5 | 1-5 s | PDF generation (CPU + memory intensive) |
| `POST /api/v1/export/notebook` | POST | 5-10 | 500 ms-2 s | Notebook generation |
| `GET /api/v1/metrics` | GET | 300+ | < 10 ms | In-memory metrics export |

### Bottlenecks

1. **ML Prediction** (`/predict`): TF-IDF vectorization + SVM inference is CPU-bound. Each prediction takes 50-200 ms.
2. **PDF Export** (`/export/pdf`): WeasyPrint/xhtml2pdf is memory-intensive. Concurrent PDF generation can spike memory.
3. **Rate Limiter**: Global per-IP limit of 200 req/60s protects against abuse but may throttle legitimate high-frequency clients.

---

## Scaling Triggers

### When to Scale Vertically (Bigger Instance)

| Indicator | Threshold | Action |
|-----------|-----------|--------|
| Memory usage | > 80% of limit (1.6 GB) | Increase to 4 GB |
| CPU usage | > 70% sustained for 5 min | Increase to 2 CPUs |
| p95 latency (predict) | > 500 ms sustained | Add more workers or CPU |
| PDF generation failures | OOM errors in logs | Increase memory to 4 GB |

### When to Scale Horizontally (More Replicas)

| Indicator | Threshold | Action |
|-----------|-----------|--------|
| Prediction RPS | > 30 sustained | Add 2nd backend replica |
| Overall RPS | > 100 sustained | Add 2nd backend replica |
| Concurrent PDF exports | > 3 simultaneous | Add dedicated export worker |
| Error rate | > 5% for 5 min | Add replica + investigate |

### Prerequisites for Horizontal Scaling

Before adding replicas, migrate stateful components:

1. **Rate limiter**: Move from in-memory `defaultdict` to **Redis** for shared state.
2. **Prediction cache**: Move from in-memory LRU to **Redis** for shared cache.
3. **Load balancer**: Add nginx upstream with multiple backend targets, or use cloud LB.
4. **Health checks**: Ensure each replica has independent `/api/health` checks.

---

## Resource Headroom Analysis

### Current Capacity (Single Instance)

| Resource | Allocated | Estimated Usage | Headroom | Status |
|----------|-----------|----------------|----------|--------|
| Backend Memory | 2 GB | ~1.2 GB (peak) | ~800 MB (40%) | OK |
| Backend CPU | 1.0 | ~0.3 (idle), ~0.8 (load) | ~0.2 | Tight under load |
| Frontend Memory | 512 MB | ~75 MB | ~437 MB (85%) | Over-provisioned |
| Frontend CPU | 0.5 | ~0.05 (idle) | ~0.45 | Over-provisioned |

### Recommendations

- **Backend CPU** is the tightest resource. Under sustained prediction load, consider increasing to 2 CPUs.
- **Frontend** is significantly over-provisioned. In cost-sensitive environments, reduce to 256 MB / 0.25 CPU.
- **Model data volume** (`model-data`) stores ~50 MB of joblib files. No disk pressure concern.

---

## Growth Projections

### Academic Use (Current)

- **Users**: 1-5 concurrent (instructor + students reviewing the project)
- **RPS**: < 5 average, < 20 peak
- **Duration**: Short bursts during evaluation periods
- **Verdict**: Current single-instance setup is more than sufficient.

### Demo / Presentation Use

- **Users**: 10-30 concurrent (classroom demo, conference)
- **RPS**: 10-50 average, 100 peak
- **Duration**: 1-2 hour sessions
- **Verdict**: Current setup handles this. Monitor latency on `/predict`.

### Small Production Use

- **Users**: 50-200 concurrent
- **RPS**: 50-200 average
- **Duration**: Continuous
- **Requirements**:
  - 2 backend replicas (behind load balancer)
  - Redis for rate limiter + cache
  - Increase backend memory to 4 GB per replica
  - Add Prometheus + Grafana monitoring
  - Estimated monthly cost: $40-80 (cloud VMs)

### Medium Production Use

- **Users**: 500+ concurrent
- **RPS**: 500+
- **Requirements**:
  - 4+ backend replicas with auto-scaling
  - Dedicated model serving (TorchServe or ONNX Runtime)
  - Redis cluster for shared state
  - CDN for frontend assets
  - Database connection pooling
  - Estimated monthly cost: $200-500

---

## Load Testing Commands

Use [k6](https://k6.io/) or [locust](https://locust.io/) to validate capacity estimates:

```bash
# Quick smoke test with curl
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" http://localhost:8000/api/health
done

# Prediction load test (requires k6)
# k6 run --vus 10 --duration 30s load-test-predict.js
```

Sample k6 script (`load-test-predict.js`):

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const payload = JSON.stringify({ text: 'This movie was absolutely fantastic!' });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post('http://localhost:8000/api/v1/model/predict', payload, params);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.5);
}
```
