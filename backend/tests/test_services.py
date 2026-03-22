"""Unit tests for backend services."""
import html as html_mod
import pytest
from backend.services.dataset_service import get_dataset_stats, get_sample_reviews
from backend.services.model_service import (
    get_model_results,
    get_comparison,
    get_tfidf_params,
    get_training_status,
    start_training,
    predict_sentiment,
    _predict_with_heuristic,
    _detect_language,
)
from backend.services.argilla_service import classify_zero_shot


class TestDatasetService:
    def test_stats_returns_dict(self):
        stats = get_dataset_stats()
        assert isinstance(stats, dict)
        assert stats["total"] == 50000

    def test_stats_has_all_fields(self):
        stats = get_dataset_stats()
        required = ["nombre", "total", "train", "test", "clases", "balance", "vocabulario_tfidf"]
        for field in required:
            assert field in stats, f"Missing field: {field}"

    def test_samples_default_limit(self):
        samples = get_sample_reviews()
        assert len(samples) == 8

    def test_samples_custom_limit(self):
        samples = get_sample_reviews(3)
        assert len(samples) == 3

    def test_samples_over_limit(self):
        samples = get_sample_reviews(100)
        assert len(samples) <= 100

    def test_samples_none_returns_all(self):
        """Passing None should return all reviews."""
        samples = get_sample_reviews(limit=None)
        assert len(samples) >= 8

    def test_sample_has_predictions(self):
        samples = get_sample_reviews(1)
        s = samples[0]
        assert s["prediccion_nb"] in ("positivo", "negativo")
        assert s["prediccion_lr"] in ("positivo", "negativo")
        assert s["prediccion_svm"] in ("positivo", "negativo")


class TestModelService:
    def test_results_has_three_models(self):
        results = get_model_results()
        assert "naive_bayes" in results
        assert "logistic_regression" in results
        assert "svm" in results

    def test_svm_is_best(self):
        results = get_model_results()
        accuracies = {k: v["accuracy"] for k, v in results.items()}
        best = max(accuracies, key=accuracies.get)
        assert best == "svm"

    def test_comparison_table(self):
        comp = get_comparison()
        assert comp["mejor_modelo"] == "SVM"
        assert len(comp["accuracy"]) == 5  # 2 baselines + 3 models

    def test_tfidf_params(self):
        params = get_tfidf_params()
        assert params["max_features"] == 50000
        assert params["sublinear_tf"] is True

    def test_training_status_completed(self):
        status = get_training_status()
        assert status["status"] == "completed"
        assert status["progress"] == 100

    def test_start_training(self):
        result = start_training()
        assert result["status"] == "completed"


class TestPrediction:
    def test_positive_text(self):
        result = _predict_with_heuristic("This movie was fantastic and amazing")
        assert result["sentimiento"] == "positivo"
        assert result["modelo"] == "keyword-heuristic"

    def test_negative_text(self):
        result = _predict_with_heuristic("Terrible waste of time, boring and awful")
        assert result["sentimiento"] == "negativo"

    def test_negation_handling(self):
        result = _predict_with_heuristic("This movie is not good")
        assert result["sentimiento"] == "negativo"

    def test_double_negation(self):
        result = _predict_with_heuristic("not bad at all")
        assert result["sentimiento"] == "positivo"

    def test_neutral_text(self):
        result = _predict_with_heuristic("The sky is blue today")
        assert result["sentimiento"] == "positivo"
        assert result["confianza"] == 0.52

    def test_confidence_range(self):
        result = _predict_with_heuristic("This is a great excellent amazing wonderful movie")
        assert 0.5 <= result["confianza"] <= 1.0

    def test_scores_add_to_approximately_one(self):
        result = _predict_with_heuristic("Great movie!")
        scores = result["scores"]
        total = scores["positivo"] + scores["negativo"]
        assert 0.9 <= total <= 1.1

    def test_predict_sentiment_returns_model_field(self):
        result = predict_sentiment("Great film")
        assert "modelo" in result
        assert result["modelo"] in ("svm-tfidf", "keyword-heuristic")

    def test_predict_mixed_sentiment(self):
        result = _predict_with_heuristic("Great acting but terrible plot and boring dialogue")
        assert result["sentimiento"] == "negativo"

    def test_predict_sentiment_includes_idioma(self):
        result = predict_sentiment("Great film")
        assert "idioma" in result
        assert result["idioma"] == "en"

    def test_predict_sentiment_spanish_includes_idioma(self):
        result = predict_sentiment("Esta pelicula fue increible y maravillosa")
        assert "idioma" in result
        assert result["idioma"] == "es"


class TestHTMLSanitizationService:
    """Tests for HTML sanitization in model_service.predict_sentiment."""

    def test_html_tags_escaped(self):
        """HTML tags in input should be escaped in output."""
        result = predict_sentiment('<script>alert("xss")</script> great movie')
        assert "<script>" not in result["texto"]
        assert "&lt;script&gt;" in result["texto"]

    def test_ampersand_escaped(self):
        """Ampersands should be escaped."""
        result = predict_sentiment("good & great movie")
        assert "&amp;" in result["texto"]

    def test_quotes_escaped(self):
        """Quotes should be escaped."""
        result = predict_sentiment('He said "great movie"')
        assert "&quot;" in result["texto"]

    def test_sanitization_does_not_affect_sentiment(self):
        """Sanitization should not change the sentiment result."""
        result = predict_sentiment("<b>excellent</b> movie")
        assert result["sentimiento"] == "positivo"


class TestSpanishPrediction:
    def test_detect_language_english(self):
        assert _detect_language("This movie was great") == "en"

    def test_detect_language_spanish(self):
        assert _detect_language("Esta pelicula fue increible") == "es"

    def test_positive_spanish(self):
        result = _predict_with_heuristic("Esta pelicula fue maravillosa y excelente")
        assert result["sentimiento"] == "positivo"
        assert result["idioma"] == "es"

    def test_negative_spanish(self):
        result = _predict_with_heuristic("La pelicula fue terrible y aburrida, una basura")
        assert result["sentimiento"] == "negativo"
        assert result["idioma"] == "es"

    def test_spanish_negation(self):
        result = _predict_with_heuristic("Esta pelicula no es buena para nada")
        assert result["sentimiento"] == "negativo"

    def test_spanish_confidence_range(self):
        result = _predict_with_heuristic("Una pelicula increible, fascinante y espectacular")
        assert 0.5 <= result["confianza"] <= 1.0

    def test_spanish_scores_add_to_approximately_one(self):
        result = _predict_with_heuristic("Excelente pelicula, la mejor que he visto")
        scores = result["scores"]
        total = scores["positivo"] + scores["negativo"]
        assert 0.9 <= total <= 1.1

    def test_spanish_uses_heuristic(self):
        result = predict_sentiment("Esta pelicula es genial y fantastica")
        assert result["modelo"] == "keyword-heuristic"
        assert result["idioma"] == "es"


class TestArgillaService:
    def test_classify_returns_result(self):
        result = classify_zero_shot("I love this movie")
        assert "texto" in result
        assert "mejor_label" in result
        assert "confianza" in result

    def test_classify_custom_labels(self):
        result = classify_zero_shot("amazing film", labels=["great", "terrible", "average"])
        assert "labels" in result
        assert len(result["labels"]) == 3

    def test_classify_default_labels(self):
        result = classify_zero_shot("test text")
        assert "labels" in result


class TestIntensifiers:
    """Tests for intensifier handling in heuristic predictions."""

    def test_very_good_higher_than_good(self):
        """'very good' should produce higher confidence than 'good' alone."""
        result_plain = _predict_with_heuristic("This movie was good")
        result_intensified = _predict_with_heuristic("This movie was very good")
        assert result_intensified["sentimiento"] == "positivo"
        assert result_plain["sentimiento"] == "positivo"
        # Intensified version should have >= confidence
        assert result_intensified["confianza"] >= result_plain["confianza"]

    def test_really_terrible_higher_than_terrible(self):
        """'really terrible' should produce higher negative confidence than 'terrible'."""
        result_plain = _predict_with_heuristic("This movie was terrible")
        result_intensified = _predict_with_heuristic("This movie was really terrible")
        assert result_intensified["sentimiento"] == "negativo"
        assert result_plain["sentimiento"] == "negativo"
        assert result_intensified["confianza"] >= result_plain["confianza"]

    def test_extremely_amazing(self):
        """'extremely amazing' should be positive with high confidence."""
        result = _predict_with_heuristic("This is extremely amazing")
        assert result["sentimiento"] == "positivo"

    def test_spanish_intensifier_muy_buena(self):
        """Spanish intensifier 'muy' should amplify sentiment."""
        result = _predict_with_heuristic("Esta pelicula fue muy buena")
        assert result["sentimiento"] == "positivo"


class TestWiderNegation:
    """Tests for wider negation window (3 words)."""

    def test_did_not_really_enjoy(self):
        """'I did not really enjoy' should be negative (3-word negation window)."""
        result = _predict_with_heuristic("I did not really enjoy this movie")
        assert result["sentimiento"] == "negativo"

    def test_never_found_it_entertaining(self):
        """'never found it entertaining' should negate 'entertaining'."""
        result = _predict_with_heuristic("I never found it entertaining")
        assert result["sentimiento"] == "negativo"

    def test_not_at_all_good(self):
        """'not at all good' should be negative (negation 3 words away)."""
        result = _predict_with_heuristic("This movie is not at all good")
        assert result["sentimiento"] == "negativo"


class TestPredictionCache:
    """Tests for prediction cache behavior."""

    def test_cache_returns_same_result(self):
        """Same text should return same cached result."""
        r1 = predict_sentiment("This is a great film")
        r2 = predict_sentiment("This is a great film")
        assert r1["sentimiento"] == r2["sentimiento"]
        assert r1["confianza"] == r2["confianza"]

    def test_different_text_different_cache_key(self):
        """Different texts should have different results."""
        r1 = predict_sentiment("This is a great film")
        r2 = predict_sentiment("This is a terrible film")
        assert r1["sentimiento"] != r2["sentimiento"]


class TestPredictionTracker:
    """Tests for the PredictionTracker in monitoring."""

    def test_tracker_records_predictions(self):
        """PredictionTracker should record predictions correctly."""
        from backend.monitoring import PredictionTracker
        tracker = PredictionTracker()
        tracker.record("positivo", 0.85, "svm-tfidf", "en")
        tracker.record("negativo", 0.92, "keyword-heuristic", "es")
        data = tracker.export()
        assert data["total_predictions"] == 2
        assert data["window_size"] == 2

    def test_tracker_positive_negative_ratio(self):
        """PredictionTracker should compute correct positive/negative ratios."""
        from backend.monitoring import PredictionTracker
        tracker = PredictionTracker()
        for _ in range(7):
            tracker.record("positivo", 0.80, "svm-tfidf", "en")
        for _ in range(3):
            tracker.record("negativo", 0.75, "keyword-heuristic", "es")
        data = tracker.export()
        assert data["positive_ratio"] == 0.7
        assert data["negative_ratio"] == 0.3

    def test_tracker_drift_alert(self):
        """PredictionTracker should flag drift when positive ratio deviates >10%."""
        from backend.monitoring import PredictionTracker
        tracker = PredictionTracker()
        # All positive — 100% positive ratio, far from 50% baseline
        for _ in range(20):
            tracker.record("positivo", 0.80, "svm-tfidf", "en")
        data = tracker.export()
        assert data["drift_alert"] is True
        assert data["drift_detail"] is not None

    def test_tracker_no_drift_when_balanced(self):
        """PredictionTracker should not flag drift when ratio is near 50%."""
        from backend.monitoring import PredictionTracker
        tracker = PredictionTracker()
        for _ in range(50):
            tracker.record("positivo", 0.80, "svm-tfidf", "en")
        for _ in range(50):
            tracker.record("negativo", 0.80, "svm-tfidf", "en")
        data = tracker.export()
        assert data["drift_alert"] is False

    def test_tracker_reset(self):
        """PredictionTracker reset should clear all data."""
        from backend.monitoring import PredictionTracker
        tracker = PredictionTracker()
        tracker.record("positivo", 0.80, "svm-tfidf", "en")
        tracker.reset()
        data = tracker.export()
        assert data["total_predictions"] == 0

    def test_tracker_ml_heuristic_ratio(self):
        """PredictionTracker should track ML vs heuristic usage ratio."""
        from backend.monitoring import PredictionTracker
        tracker = PredictionTracker()
        tracker.record("positivo", 0.80, "svm-tfidf", "en")
        tracker.record("negativo", 0.75, "keyword-heuristic", "es")
        data = tracker.export()
        assert data["ml_ratio"] == 0.5
        assert data["heuristic_ratio"] == 0.5


class TestEdgeCases:
    def test_predict_very_short_text(self):
        result = predict_sentiment("ok")
        assert "sentimiento" in result
        assert "confianza" in result

    def test_predict_repeated_words(self):
        result = _predict_with_heuristic("good good good good good")
        assert result["sentimiento"] == "positivo"
        assert result["confianza"] > 0.5

    def test_predict_all_negative(self):
        result = _predict_with_heuristic("bad terrible awful horrible boring")
        assert result["sentimiento"] == "negativo"
        assert result["confianza"] > 0.7

    def test_detect_language_mixed(self):
        """Mixed language defaults to one."""
        result = _detect_language("This pelicula is very buena")
        assert result in ("en", "es")

    def test_predict_empty_after_cleaning(self):
        """Text with only special characters."""
        result = _predict_with_heuristic("!!! @@@ ### $$$")
        assert result["sentimiento"] == "positivo"
        assert result["confianza"] == 0.52

    def test_model_results_immutable(self):
        """Results should be consistent across calls."""
        r1 = get_model_results()
        r2 = get_model_results()
        assert r1["svm"]["accuracy"] == r2["svm"]["accuracy"]


class TestSupabaseRetry:
    """Tests for retry logic in supabase_client."""

    def test_select_returns_empty_when_not_configured(self):
        """select() should return empty list when not configured."""
        from backend.services import supabase_client as sb
        # Default env usually not configured in tests
        if not sb.is_configured():
            result = sb.select("some_table")
            assert result == []

    def test_upsert_returns_empty_when_not_configured(self):
        """upsert() should return empty list when not configured."""
        from backend.services import supabase_client as sb
        if not sb.is_configured():
            result = sb.upsert("some_table", [{"key": "val"}])
            assert result == []

    def test_insert_returns_empty_when_not_configured(self):
        """insert() should return empty list when not configured."""
        from backend.services import supabase_client as sb
        if not sb.is_configured():
            result = sb.insert("some_table", [{"key": "val"}])
            assert result == []


class TestArgillaCircuitBreaker:
    """Tests for circuit breaker in argilla_service."""

    def test_circuit_breaker_functions_exist(self):
        """Circuit breaker helper functions should be importable."""
        from backend.services.argilla_service import (
            _record_failure,
            _record_success,
            _is_circuit_open,
            unload_model,
        )
        # Ensure they are callable
        assert callable(_record_failure)
        assert callable(_record_success)
        assert callable(_is_circuit_open)
        assert callable(unload_model)

    def test_circuit_breaker_opens_after_failures(self):
        """Circuit breaker should open after consecutive failures."""
        from backend.services import argilla_service as svc

        # Reset state
        svc._record_success()
        assert not svc._is_circuit_open()

        # Simulate failures
        for _ in range(svc._MAX_CONSECUTIVE_FAILURES):
            svc._record_failure()

        assert svc._is_circuit_open()

        # Reset for other tests
        svc._record_success()
        assert not svc._is_circuit_open()

    def test_unload_model_resets_cache(self):
        """unload_model should reset the classifier cache."""
        from backend.services.argilla_service import (
            _classifier_cache,
            unload_model,
        )
        unload_model()
        assert _classifier_cache["instance"] is None
        assert _classifier_cache["loaded"] is False


class TestMonitoring:
    """Tests for the monitoring metrics collector."""

    def test_metrics_collector_export(self):
        """MetricsCollector should export valid metrics dict."""
        from backend.monitoring import MetricsCollector
        mc = MetricsCollector()
        mc.record_request("/api/test", "GET", 200, 0.05)
        mc.record_request("/api/test", "GET", 500, 0.1)
        data = mc.export()
        assert data["total_requests"] == 2
        assert data["total_errors"] == 1
        assert data["error_rate"] == 0.5

    def test_metrics_prometheus_format(self):
        """Prometheus export should contain required metric names."""
        from backend.monitoring import MetricsCollector
        mc = MetricsCollector()
        mc.record_request("/api/test", "GET", 200, 0.01)
        text = mc.export_prometheus()
        assert "app_uptime_seconds" in text
        assert "app_requests_total 1" in text

    def test_metrics_reset(self):
        """Reset should clear all metrics."""
        from backend.monitoring import MetricsCollector
        mc = MetricsCollector()
        mc.record_request("/api/test", "GET", 200, 0.01)
        mc.reset()
        data = mc.export()
        assert data["total_requests"] == 0

    def test_metrics_latency_percentiles(self):
        """Latency summary should include percentile values."""
        from backend.monitoring import MetricsCollector
        mc = MetricsCollector()
        for i in range(100):
            mc.record_request("/api/test", "GET", 200, i * 0.01)
        data = mc.export()
        latency = data["latency"]["/api/test"]
        assert "p50_ms" in latency
        assert "p95_ms" in latency
        assert "p99_ms" in latency
        assert latency["count"] == 100

    def test_sentry_dsn_setting_exists(self):
        """Settings should have sentry_dsn field."""
        from backend.config import get_settings
        s = get_settings()
        assert hasattr(s, "sentry_dsn")


class TestModelLoadingRaceCondition:
    """Tests for model loading thread safety."""

    def test_loaded_flag_set_after_attempt(self):
        """_ml_models['loaded'] should be True after _load_ml_models."""
        from backend.services.model_service import _ml_models, _load_ml_models
        _load_ml_models()
        assert _ml_models["loaded"] is True

    def test_lock_exists(self):
        """Model service should have a threading lock."""
        import threading
        from backend.services.model_service import _ml_lock
        assert isinstance(_ml_lock, type(threading.Lock()))
