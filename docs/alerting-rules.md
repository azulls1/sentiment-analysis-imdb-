# Alerting Rules

## Overview

This document defines the alerting rules for the IMDb Sentiment Analysis
application.  Corresponding Prometheus alerting rules are in
[`prometheus-alerts.yml`](prometheus-alerts.yml).

---

## Alert Definitions

### 1. High Error Rate

| Field | Value |
|-------|-------|
| **Name** | `HighErrorRate` |
| **Condition** | > 5 % of requests return 5xx within a 5-minute window |
| **Severity** | Critical |
| **Action** | Page on-call; check `/api/v1/metrics` for failing endpoints, inspect container logs |
| **Prometheus expr** | `rate(app_errors_total[5m]) / rate(app_requests_total[5m]) > 0.05` |

### 2. High Latency

| Field | Value |
|-------|-------|
| **Name** | `HighLatency` |
| **Condition** | P95 response time > 2 s for 5 consecutive minutes |
| **Severity** | Warning |
| **Action** | Check resource limits, Supabase connectivity, model loading times |
| **Prometheus expr** | `histogram_quantile(0.95, rate(app_request_duration_seconds_bucket[5m])) > 2` |

### 3. ML Prediction Drift

| Field | Value |
|-------|-------|
| **Name** | `MLDrift` |
| **Condition** | Positive prediction ratio deviates > 15 % from 50 % baseline over 1000 predictions |
| **Severity** | Warning |
| **Action** | Investigate input distribution; retrain model if drift is persistent |
| **Prometheus expr** | `abs(ml_positive_ratio - 0.50) > 0.15` |

### 4. Health Check Failure

| Field | Value |
|-------|-------|
| **Name** | `HealthCheckFailure` |
| **Condition** | 3 consecutive health check failures |
| **Severity** | Critical |
| **Action** | Restart container; if persistent, check Docker daemon and host resources |
| **Prometheus expr** | `probe_success == 0` (blackbox exporter) or Docker healthcheck status |

### 5. High Memory Usage

| Field | Value |
|-------|-------|
| **Name** | `HighMemoryUsage` |
| **Condition** | Container memory usage > 85 % of its limit for 5 minutes |
| **Severity** | Warning |
| **Action** | Check for memory leaks; consider increasing container memory limit or reducing worker count |
| **Prometheus expr** | `container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.85` |

---

## Notification Channels

| Channel | Used For |
|---------|----------|
| Email | All severities |
| Slack `#alerts` | Critical and Warning |
| PagerDuty (optional) | Critical only |

## Silencing & Maintenance

During planned maintenance windows, silence `HighErrorRate` and
`HealthCheckFailure` alerts.  See Prometheus Alertmanager docs for
inhibition rules.
