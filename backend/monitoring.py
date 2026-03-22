"""
Application metrics collector for monitoring and alerting.

Provides in-memory metrics collection with Prometheus-compatible text export.
Designed to be lightweight with no external dependencies beyond the stdlib.

Usage:
    from backend.monitoring import metrics

    # Record a request
    metrics.record_request("/api/v1/predict", "POST", 201, 0.150)

    # Get metrics as dict
    data = metrics.export()

    # Get Prometheus text format
    text = metrics.export_prometheus()
"""

import threading
import time
from collections import defaultdict
from typing import Dict, List, Optional


class MetricsCollector:
    """In-memory metrics collector with thread-safe counters and histograms.

    Tracks:
    - request_count: Total requests by endpoint, method, and status code
    - error_count: Total error responses (4xx/5xx) by endpoint
    - latency: Request duration histograms by endpoint
    - uptime: Time since collector initialization
    """

    # Histogram bucket boundaries in seconds
    LATENCY_BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._start_time = time.time()

        # Counters: {(endpoint, method, status): count}
        self._request_counts: Dict[tuple, int] = defaultdict(int)

        # Error counters: {endpoint: count}
        self._error_counts: Dict[str, int] = defaultdict(int)

        # Latency tracking: {endpoint: [durations]}
        self._latencies: Dict[str, List[float]] = defaultdict(list)

        # Total counters
        self._total_requests = 0
        self._total_errors = 0

        # Max latencies stored per endpoint to bound memory
        self._max_latency_samples = 1000

    def record_request(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        duration_seconds: float,
    ) -> None:
        """Record a completed HTTP request.

        Args:
            endpoint: The URL path (e.g. "/api/v1/predict")
            method: HTTP method (e.g. "POST")
            status_code: HTTP response status code
            duration_seconds: Request duration in seconds
        """
        with self._lock:
            self._request_counts[(endpoint, method, status_code)] += 1
            self._total_requests += 1

            if status_code >= 400:
                self._error_counts[endpoint] += 1
                self._total_errors += 1

            latencies = self._latencies[endpoint]
            latencies.append(duration_seconds)
            # Bound memory: keep only the most recent samples
            if len(latencies) > self._max_latency_samples:
                self._latencies[endpoint] = latencies[-self._max_latency_samples:]

    def export(self) -> Dict:
        """Export all metrics as a JSON-serializable dictionary.

        Returns:
            Dict with uptime, counters, error rates, and latency summaries.
        """
        with self._lock:
            uptime = time.time() - self._start_time

            # Build per-endpoint summaries
            endpoint_stats = {}
            for (ep, method, status), count in self._request_counts.items():
                key = f"{method} {ep}"
                if key not in endpoint_stats:
                    endpoint_stats[key] = {"total": 0, "by_status": {}}
                endpoint_stats[key]["total"] += count
                endpoint_stats[key]["by_status"][str(status)] = (
                    endpoint_stats[key]["by_status"].get(str(status), 0) + count
                )

            # Latency summaries
            latency_summaries = {}
            for ep, durations in self._latencies.items():
                if durations:
                    sorted_d = sorted(durations)
                    n = len(sorted_d)
                    latency_summaries[ep] = {
                        "count": n,
                        "min_ms": round(sorted_d[0] * 1000, 2),
                        "max_ms": round(sorted_d[-1] * 1000, 2),
                        "avg_ms": round(sum(sorted_d) / n * 1000, 2),
                        "p50_ms": round(sorted_d[n // 2] * 1000, 2),
                        "p95_ms": round(sorted_d[int(n * 0.95)] * 1000, 2),
                        "p99_ms": round(sorted_d[int(n * 0.99)] * 1000, 2),
                    }

            error_rate = (
                round(self._total_errors / self._total_requests, 4)
                if self._total_requests > 0
                else 0.0
            )

            return {
                "uptime_seconds": round(uptime, 1),
                "total_requests": self._total_requests,
                "total_errors": self._total_errors,
                "error_rate": error_rate,
                "endpoints": endpoint_stats,
                "latency": latency_summaries,
            }

    def export_prometheus(self) -> str:
        """Export metrics in Prometheus text exposition format.

        Returns:
            Multi-line string in Prometheus text format.
        """
        lines: List[str] = []
        with self._lock:
            uptime = time.time() - self._start_time

            lines.append("# HELP app_uptime_seconds Time since application start")
            lines.append("# TYPE app_uptime_seconds gauge")
            lines.append(f"app_uptime_seconds {uptime:.1f}")

            lines.append("# HELP app_requests_total Total HTTP requests")
            lines.append("# TYPE app_requests_total counter")
            lines.append(f"app_requests_total {self._total_requests}")

            lines.append("# HELP app_errors_total Total HTTP error responses")
            lines.append("# TYPE app_errors_total counter")
            lines.append(f"app_errors_total {self._total_errors}")

            lines.append("# HELP app_request_duration_seconds Request duration histogram")
            lines.append("# TYPE app_request_duration_seconds histogram")
            for ep, durations in self._latencies.items():
                if not durations:
                    continue
                safe_ep = ep.replace('"', '\\"')
                sorted_d = sorted(durations)
                total = sum(sorted_d)
                count = len(sorted_d)

                for bucket in self.LATENCY_BUCKETS:
                    bucket_count = sum(1 for d in sorted_d if d <= bucket)
                    lines.append(
                        f'app_request_duration_seconds_bucket{{endpoint="{safe_ep}",le="{bucket}"}} {bucket_count}'
                    )
                lines.append(
                    f'app_request_duration_seconds_bucket{{endpoint="{safe_ep}",le="+Inf"}} {count}'
                )
                lines.append(
                    f'app_request_duration_seconds_sum{{endpoint="{safe_ep}"}} {total:.6f}'
                )
                lines.append(
                    f'app_request_duration_seconds_count{{endpoint="{safe_ep}"}} {count}'
                )

            # Per-endpoint error counts
            lines.append("# HELP app_endpoint_errors_total Errors per endpoint")
            lines.append("# TYPE app_endpoint_errors_total counter")
            for ep, count in self._error_counts.items():
                safe_ep = ep.replace('"', '\\"')
                lines.append(f'app_endpoint_errors_total{{endpoint="{safe_ep}"}} {count}')

        lines.append("")  # trailing newline
        return "\n".join(lines)

    def reset(self) -> None:
        """Reset all metrics (useful for testing)."""
        with self._lock:
            self._request_counts.clear()
            self._error_counts.clear()
            self._latencies.clear()
            self._total_requests = 0
            self._total_errors = 0
            self._start_time = time.time()


class PredictionTracker:
    """Track ML prediction metrics for drift detection and monitoring.

    Maintains a sliding window of the last 1000 predictions to compute:
    - Total prediction count
    - Positive/negative ratio
    - Average confidence score
    - ML vs heuristic usage ratio
    - Language distribution (en/es)
    - Drift alert when positive ratio deviates >10% from baseline (50%)
    """

    WINDOW_SIZE = 1000
    BASELINE_POSITIVE_RATIO = 0.50
    DRIFT_THRESHOLD = 0.10  # 10% deviation from baseline

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._total_predictions: int = 0
        # Sliding window of recent predictions
        self._recent_sentiments: List[str] = []  # "positivo" or "negativo"
        self._recent_confidences: List[float] = []
        self._recent_models: List[str] = []  # "svm-tfidf" or "keyword-heuristic"
        self._recent_languages: List[str] = []  # "en" or "es"

    def record(
        self,
        sentiment: str,
        confidence: float,
        model: str,
        language: str,
    ) -> None:
        """Record a single prediction result.

        Args:
            sentiment: Predicted sentiment ("positivo" or "negativo").
            confidence: Confidence score (0-1).
            model: Model used ("svm-tfidf" or "keyword-heuristic").
            language: Detected language ("en" or "es").
        """
        with self._lock:
            self._total_predictions += 1
            self._recent_sentiments.append(sentiment)
            self._recent_confidences.append(confidence)
            self._recent_models.append(model)
            self._recent_languages.append(language)
            # Enforce sliding window
            if len(self._recent_sentiments) > self.WINDOW_SIZE:
                self._recent_sentiments = self._recent_sentiments[-self.WINDOW_SIZE:]
                self._recent_confidences = self._recent_confidences[-self.WINDOW_SIZE:]
                self._recent_models = self._recent_models[-self.WINDOW_SIZE:]
                self._recent_languages = self._recent_languages[-self.WINDOW_SIZE:]

    def export(self) -> Dict:
        """Export prediction tracking metrics.

        Returns:
            Dictionary with total count, ratios, averages, and drift status.
        """
        with self._lock:
            n = len(self._recent_sentiments)
            if n == 0:
                return {
                    "total_predictions": 0,
                    "positive_ratio": 0.0,
                    "negative_ratio": 0.0,
                    "avg_confidence": 0.0,
                    "ml_ratio": 0.0,
                    "heuristic_ratio": 0.0,
                    "en_ratio": 0.0,
                    "es_ratio": 0.0,
                    "drift_alert": False,
                    "drift_detail": None,
                }

            pos_count = sum(1 for s in self._recent_sentiments if s == "positivo")
            pos_ratio = pos_count / n
            neg_ratio = 1.0 - pos_ratio

            avg_conf = sum(self._recent_confidences) / n

            ml_count = sum(1 for m in self._recent_models if m == "svm-tfidf")
            ml_ratio = ml_count / n
            heuristic_ratio = 1.0 - ml_ratio

            en_count = sum(1 for lang in self._recent_languages if lang == "en")
            en_ratio = en_count / n
            es_ratio = 1.0 - en_ratio

            # Drift detection: positive ratio deviates >10% from baseline 50%
            drift_deviation = abs(pos_ratio - self.BASELINE_POSITIVE_RATIO)
            drift_alert = drift_deviation > self.DRIFT_THRESHOLD
            drift_detail = None
            if drift_alert:
                drift_detail = (
                    f"Positive ratio {pos_ratio:.2%} deviates "
                    f"{drift_deviation:.2%} from baseline "
                    f"{self.BASELINE_POSITIVE_RATIO:.0%} "
                    f"(threshold: {self.DRIFT_THRESHOLD:.0%})"
                )

            return {
                "total_predictions": self._total_predictions,
                "window_size": n,
                "positive_ratio": round(pos_ratio, 4),
                "negative_ratio": round(neg_ratio, 4),
                "avg_confidence": round(avg_conf, 4),
                "ml_ratio": round(ml_ratio, 4),
                "heuristic_ratio": round(heuristic_ratio, 4),
                "en_ratio": round(en_ratio, 4),
                "es_ratio": round(es_ratio, 4),
                "drift_alert": drift_alert,
                "drift_detail": drift_detail,
            }

    def export_prometheus(self) -> str:
        """Export prediction metrics in Prometheus text format."""
        data = self.export()
        lines: List[str] = []
        lines.append("# HELP ml_predictions_total Total ML predictions")
        lines.append("# TYPE ml_predictions_total counter")
        lines.append(f'ml_predictions_total {data["total_predictions"]}')

        lines.append("# HELP ml_positive_ratio Ratio of positive predictions in sliding window")
        lines.append("# TYPE ml_positive_ratio gauge")
        lines.append(f'ml_positive_ratio {data["positive_ratio"]}')

        lines.append("# HELP ml_avg_confidence Average prediction confidence in sliding window")
        lines.append("# TYPE ml_avg_confidence gauge")
        lines.append(f'ml_avg_confidence {data["avg_confidence"]}')

        lines.append("# HELP ml_model_usage_ratio Ratio of ML model vs heuristic usage")
        lines.append("# TYPE ml_model_usage_ratio gauge")
        lines.append(f'ml_model_usage_ratio{{model="svm-tfidf"}} {data["ml_ratio"]}')
        lines.append(f'ml_model_usage_ratio{{model="keyword-heuristic"}} {data["heuristic_ratio"]}')

        lines.append("# HELP ml_language_ratio Language distribution in predictions")
        lines.append("# TYPE ml_language_ratio gauge")
        lines.append(f'ml_language_ratio{{lang="en"}} {data["en_ratio"]}')
        lines.append(f'ml_language_ratio{{lang="es"}} {data["es_ratio"]}')

        lines.append("# HELP ml_drift_alert Whether prediction drift has been detected (1=yes)")
        lines.append("# TYPE ml_drift_alert gauge")
        lines.append(f'ml_drift_alert {1 if data["drift_alert"] else 0}')

        return "\n".join(lines)

    def check_drift(self) -> Dict:
        """Return a structured drift analysis report.

        Compares the current sliding-window statistics against expected
        baselines and returns a recommendation (``ok``, ``investigate``,
        or ``retrain``).

        Returns:
            Dictionary with drift metrics, trend indicators and a
            human-readable recommendation.
        """
        with self._lock:
            n = len(self._recent_sentiments)
            if n == 0:
                return {
                    "status": "no_data",
                    "window_size": 0,
                    "recommendation": "ok",
                    "detail": "No predictions recorded yet.",
                }

            # --- Positive ratio vs baseline ---
            pos_count = sum(1 for s in self._recent_sentiments if s == "positivo")
            pos_ratio = pos_count / n
            ratio_deviation = abs(pos_ratio - self.BASELINE_POSITIVE_RATIO)

            # --- Confidence trend (compare first half vs second half) ---
            mid = n // 2
            if mid > 0:
                first_half_avg = sum(self._recent_confidences[:mid]) / mid
                second_half_avg = sum(self._recent_confidences[mid:]) / (n - mid)
                confidence_delta = second_half_avg - first_half_avg
                if confidence_delta > 0.03:
                    confidence_trend = "rising"
                elif confidence_delta < -0.03:
                    confidence_trend = "falling"
                else:
                    confidence_trend = "stable"
            else:
                confidence_delta = 0.0
                confidence_trend = "insufficient_data"

            # --- Language distribution shift ---
            en_count = sum(1 for lang in self._recent_languages if lang == "en")
            en_ratio = en_count / n
            es_ratio = 1.0 - en_ratio

            # --- Recommendation logic ---
            if ratio_deviation > 0.20:
                recommendation = "retrain"
                detail = (
                    f"Severe drift: positive ratio {pos_ratio:.2%} deviates "
                    f"{ratio_deviation:.2%} from baseline {self.BASELINE_POSITIVE_RATIO:.0%}. "
                    "Retraining is recommended."
                )
            elif ratio_deviation > self.DRIFT_THRESHOLD or confidence_trend == "falling":
                recommendation = "investigate"
                detail = (
                    f"Moderate drift detected: positive ratio {pos_ratio:.2%} "
                    f"(deviation {ratio_deviation:.2%}), "
                    f"confidence trend {confidence_trend}. "
                    "Investigate input distribution for potential issues."
                )
            else:
                recommendation = "ok"
                detail = (
                    f"Metrics within normal range: positive ratio {pos_ratio:.2%}, "
                    f"confidence trend {confidence_trend}."
                )

            return {
                "status": "drift_detected" if recommendation != "ok" else "healthy",
                "window_size": n,
                "total_predictions": self._total_predictions,
                "current_positive_ratio": round(pos_ratio, 4),
                "baseline_positive_ratio": self.BASELINE_POSITIVE_RATIO,
                "ratio_deviation": round(ratio_deviation, 4),
                "confidence_trend": confidence_trend,
                "confidence_delta": round(confidence_delta, 4),
                "language_distribution": {
                    "en": round(en_ratio, 4),
                    "es": round(es_ratio, 4),
                },
                "recommendation": recommendation,
                "detail": detail,
            }

    def reset(self) -> None:
        """Reset all prediction tracking metrics (useful for testing)."""
        with self._lock:
            self._total_predictions = 0
            self._recent_sentiments.clear()
            self._recent_confidences.clear()
            self._recent_models.clear()
            self._recent_languages.clear()


# Singleton instances used throughout the application
metrics = MetricsCollector()
prediction_tracker = PredictionTracker()
