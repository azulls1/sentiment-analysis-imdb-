# Monitoring Configuration

This document describes how to connect monitoring tools to the IMDb Sentiment Analysis API and configure alerting.

---

## Prometheus Integration

### Metrics Endpoint

The API exposes metrics at:

```
GET /api/v1/metrics?format=prometheus
```

- **Default format**: JSON (`?format=json`)
- **Prometheus format**: Plain text (`?format=prometheus`)
- **Authentication**: When `API_KEY` is configured, requests must include the `X-API-Key` header.

### Prometheus Scrape Configuration

Add the following job to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'imdb-sentiment-api'
    scrape_interval: 15s
    metrics_path: '/api/v1/metrics'
    params:
      format: ['prometheus']
    # Uncomment if API_KEY is set:
    # authorization:
    #   type: 'ApiKey'
    #   credentials_file: '/etc/prometheus/api_key.txt'
    # Or use custom headers via a reverse proxy
    static_configs:
      - targets: ['backend:8000']
        labels:
          environment: 'production'
          service: 'imdb-sentiment'
```

---

## Available Metrics

### HTTP Request Metrics (MetricsCollector)

| Metric | Type | Description |
|--------|------|-------------|
| `app_uptime_seconds` | gauge | Time since application start in seconds |
| `app_requests_total` | counter | Total HTTP requests processed |
| `app_errors_total` | counter | Total HTTP error responses (4xx/5xx) |
| `app_request_duration_seconds_bucket` | histogram | Request duration histogram with buckets at 5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s |
| `app_request_duration_seconds_sum` | histogram | Sum of all request durations per endpoint |
| `app_request_duration_seconds_count` | histogram | Count of requests per endpoint |
| `app_endpoint_errors_total` | counter | Error count per endpoint |

### ML Prediction Metrics (PredictionTracker)

| Metric | Type | Description |
|--------|------|-------------|
| `ml_predictions_total` | counter | Total ML predictions made |
| `ml_positive_ratio` | gauge | Ratio of positive predictions in sliding window (last 1000) |
| `ml_avg_confidence` | gauge | Average prediction confidence score in sliding window |
| `ml_model_usage_ratio{model="svm-tfidf"}` | gauge | Ratio of SVM-TF-IDF model usage |
| `ml_model_usage_ratio{model="keyword-heuristic"}` | gauge | Ratio of keyword heuristic fallback usage |
| `ml_language_ratio{lang="en"}` | gauge | Ratio of English language predictions |
| `ml_language_ratio{lang="es"}` | gauge | Ratio of Spanish language predictions |
| `ml_drift_alert` | gauge | Whether prediction drift has been detected (1=yes, 0=no) |

### JSON Metrics (additional fields)

When requesting `?format=json`, the response includes additional computed fields:

- `uptime_seconds`: Process uptime
- `total_requests` / `total_errors`: Aggregate counters
- `error_rate`: Computed error ratio (0.0 to 1.0)
- `endpoints`: Per-endpoint breakdown with status code distribution
- `latency`: Per-endpoint latency summaries (min, max, avg, p50, p95, p99 in milliseconds)
- `predictions`: Full prediction tracker state including drift details

---

## Grafana Dashboard Setup

### Prerequisites

- Grafana 9+ with Prometheus data source configured
- Prometheus scraping the `/api/v1/metrics` endpoint

### Recommended Dashboard Panels

#### 1. Request Rate (Requests/sec)

```promql
rate(app_requests_total[5m])
```

**Panel type**: Time series / Stat

#### 2. Error Rate (%)

```promql
rate(app_errors_total[5m]) / rate(app_requests_total[5m]) * 100
```

**Panel type**: Gauge (thresholds: green < 1%, yellow < 5%, red >= 5%)

#### 3. Request Latency (p95)

```promql
histogram_quantile(0.95, rate(app_request_duration_seconds_bucket[5m]))
```

**Panel type**: Time series

#### 4. ML Prediction Drift

```promql
ml_drift_alert
```

**Panel type**: Stat (thresholds: green = 0, red = 1)

#### 5. Model Usage Distribution

```promql
ml_model_usage_ratio
```

**Panel type**: Pie chart (labels by `model`)

#### 6. Prediction Confidence

```promql
ml_avg_confidence
```

**Panel type**: Gauge (thresholds: red < 0.6, yellow < 0.8, green >= 0.8)

### Import Instructions

1. Open Grafana and navigate to **Dashboards > New > Import**.
2. Create panels using the PromQL queries above.
3. Set the Prometheus data source to your configured instance.
4. Set refresh interval to 15s to match the scrape interval.

---

## Alert Thresholds and Escalation

### Recommended Alert Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | `error_rate > 0.05` for 5 minutes | P2 - High | Investigate logs, check Supabase connectivity |
| Very High Error Rate | `error_rate > 0.20` for 2 minutes | P1 - Critical | Immediate investigation, consider restart |
| High Latency (p95) | `p95 > 2s` for 5 minutes | P3 - Medium | Check backend resources, model loading |
| Backend Down | Health check fails 3 consecutive times | P1 - Critical | Restart container, check infrastructure |
| ML Drift Detected | `ml_drift_alert == 1` for 10 minutes | P3 - Medium | Review prediction data, check input distribution |
| Low Confidence | `ml_avg_confidence < 0.6` for 15 minutes | P3 - Medium | Review input quality, check model state |
| High Heuristic Usage | `ml_model_usage_ratio{model="keyword-heuristic"} > 0.3` for 10 minutes | P3 - Medium | ML model may have failed to load |

### Escalation Path

1. **P3 (Medium)**: Logged and reviewed during next business day.
2. **P2 (High)**: On-call engineer notified within 1 hour.
3. **P1 (Critical)**: Immediate notification; requires response within 15 minutes.

### Notification Channels

Configure in Grafana under **Alerting > Contact Points**:

- **Slack**: `#alerts-imdb-sentiment` channel
- **Email**: Team distribution list
- **PagerDuty**: For P1/P2 alerts in production environments
