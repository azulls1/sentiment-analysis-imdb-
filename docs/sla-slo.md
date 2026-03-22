# Service Level Agreements & Objectives

## Scope

This document defines the availability and performance targets for the
IMDb Sentiment Analysis API.  The application is an **academic deployment**;
targets are set accordingly.

---

## 1. Service Level Objectives (SLOs)

| SLO | Target | Measurement Window |
|-----|--------|--------------------|
| **Availability** | 99.5 % | Rolling 30 days |
| **GET latency** (P95) | < 500 ms | Rolling 1 hour |
| **POST /predict latency** (P95) | < 2 000 ms | Rolling 1 hour |
| **Error rate** (5xx) | < 1 % of requests | Rolling 1 hour |
| **Recovery time** (MTTR) | < 5 minutes | Per incident |

### Availability budget

- 99.5 % over 30 days = **~3.6 hours** of allowed downtime per month.
- Scheduled maintenance windows do **not** count against the budget when
  announced 24 hours in advance.

## 2. Monitoring Endpoints

| Endpoint | Purpose | Auth Required |
|----------|---------|---------------|
| `GET /api/health` | Liveness probe (returns `{"status":"ok"}`) | No |
| `GET /api/health?detail=true` | Readiness probe (models + Supabase) | API key |
| `GET /api/v1/metrics` | Request counters, latency histograms | API key |
| `GET /api/v1/metrics?format=prometheus` | Prometheus scrape target | API key |

## 3. Alerting Thresholds

Alerts are defined in `docs/alerting-rules.md` and the corresponding
Prometheus rules live in `docs/prometheus-alerts.yml`.

| Alert | Condition | Severity |
|-------|-----------|----------|
| HighErrorRate | > 5 % 5xx in 5 min | Critical |
| HighLatency | P95 > 2 s for 5 min | Warning |
| MLDrift | positive ratio deviates > 15 % from 50 % baseline | Warning |
| HealthCheckFailure | 3 consecutive failures | Critical |
| HighMemoryUsage | > 85 % of container limit | Warning |

## 4. Incident Response

| Severity | Response Time | Resolution Target |
|----------|---------------|-------------------|
| Critical (service down) | 15 minutes | 1 hour |
| High (degraded) | 30 minutes | 4 hours |
| Medium (non-critical) | 4 hours | Next business day |
| Low (cosmetic) | Next business day | Next release |

## 5. Reporting

- Uptime and latency metrics are exported via the `/api/v1/metrics` endpoint.
- Monthly SLO compliance reports can be generated from Prometheus data or
  the JSON metrics export.
