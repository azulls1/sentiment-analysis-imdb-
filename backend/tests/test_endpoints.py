"""Integration tests for all FastAPI endpoints."""
import html


class TestRootEndpoints:
    def test_root(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["version"] == "1.0.0"

    def test_health(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestDatasetEndpoints:
    def test_stats(self, client):
        response = client.get("/api/dataset/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 50000
        assert data["train"] == 25000
        assert data["test"] == 25000
        assert "clases" in data

    def test_samples_default(self, client):
        response = client.get("/api/dataset/samples")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "pagination" in data
        assert isinstance(data["data"], list)
        assert len(data["data"]) == 8

    def test_samples_with_per_page(self, client):
        response = client.get("/api/dataset/samples?per_page=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 3

    def test_sample_structure(self, client):
        response = client.get("/api/dataset/samples?per_page=1")
        sample = response.json()["data"][0]
        assert "texto" in sample
        assert "sentimiento" in sample
        assert "confianza" in sample
        assert "prediccion_nb" in sample
        assert "prediccion_lr" in sample
        assert "prediccion_svm" in sample

    def test_samples_pagination_metadata(self, client):
        """Samples should include pagination metadata."""
        response = client.get("/api/dataset/samples?page=1&per_page=3")
        assert response.status_code == 200
        data = response.json()
        pag = data["pagination"]
        assert "total" in pag
        assert "page" in pag
        assert pag["page"] == 1
        assert "per_page" in pag
        assert pag["per_page"] == 3
        assert "has_next" in pag
        assert isinstance(pag["has_next"], bool)

    def test_samples_pagination_page_2(self, client):
        """Page 2 should return different items than page 1."""
        r1 = client.get("/api/dataset/samples?page=1&per_page=2")
        r2 = client.get("/api/dataset/samples?page=2&per_page=2")
        d1 = r1.json()["data"]
        d2 = r2.json()["data"]
        # If enough data exists, page 2 items differ from page 1
        if d2:
            assert d1[0] != d2[0]


class TestArticleEndpoints:
    def test_summary(self, client):
        response = client.get("/api/article/summary")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestModelEndpoints:
    def test_results(self, client):
        response = client.get("/api/model/results")
        assert response.status_code == 200
        data = response.json()
        assert "naive_bayes" in data
        assert "logistic_regression" in data
        assert "svm" in data

    def test_model_has_metrics(self, client):
        response = client.get("/api/model/results")
        svm = response.json()["svm"]
        assert "accuracy" in svm
        assert "confusion_matrix" in svm
        assert "tiempo_entrenamiento" in svm
        assert svm["accuracy"] == 0.8968

    def test_comparison(self, client):
        response = client.get("/api/model/comparison")
        assert response.status_code == 200
        data = response.json()
        assert data["mejor_modelo"] == "SVM"
        assert data["mejor_accuracy"] == 0.8968
        assert len(data["modelos"]) == 5  # 2 baselines + 3 models

    def test_status(self, client):
        response = client.get("/api/model/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["progress"] == 100

    def test_train(self, client):
        response = client.post("/api/model/train")
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "completed"

    def test_predict_positive(self, client):
        response = client.post("/api/model/predict", json={"text": "This movie was great and amazing"})
        assert response.status_code == 201
        data = response.json()
        assert data["sentimiento"] == "positivo"
        assert "confianza" in data
        assert "scores" in data

    def test_predict_negative(self, client):
        response = client.post("/api/model/predict", json={"text": "Terrible awful boring waste of time"})
        assert response.status_code == 201
        data = response.json()
        assert data["sentimiento"] == "negativo"

    def test_predict_empty_text(self, client):
        response = client.post("/api/model/predict", json={"text": "   "})
        assert response.status_code == 400

    def test_predict_no_keywords(self, client):
        response = client.post("/api/model/predict", json={"text": "The sky is blue today"})
        assert response.status_code == 201
        data = response.json()
        assert "sentimiento" in data
        assert 0 < data["confianza"] <= 1

    def test_predict_with_negation(self, client):
        response = client.post("/api/model/predict", json={"text": "This movie is not good at all"})
        assert response.status_code == 201
        data = response.json()
        assert data["sentimiento"] == "negativo"

    def test_predict_returns_201(self, client):
        """POST /predict should return 201 (resource created)."""
        response = client.post("/api/model/predict", json={"text": "good movie"})
        assert response.status_code == 201


class TestReportEndpoints:
    def test_content(self, client):
        response = client.get("/api/report/content")
        assert response.status_code == 200
        data = response.json()
        assert "metadata" in data
        assert "blocks" in data


class TestExportEndpoints:
    def test_notebook(self, client):
        response = client.get("/api/export/notebook")
        assert response.status_code == 200
        assert "ipynb" in response.headers.get("content-disposition", "")

    def test_pdf(self, client):
        response = client.get("/api/export/pdf")
        assert response.status_code == 200
        assert "pdf" in response.headers.get("content-disposition", "")

    def test_zip(self, client):
        response = client.get("/api/export/zip")
        assert response.status_code == 200
        assert "zip" in response.headers.get("content-disposition", "")


class TestArgillaEndpoints:
    def test_health(self, client):
        response = client.get("/api/argilla/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data

    def test_classify(self, client):
        response = client.post(
            "/api/argilla/classify",
            json={"text": "I love this movie", "labels": ["positive", "negative"]},
        )
        assert response.status_code == 201
        data = response.json()
        assert "texto" in data
        assert "mejor_label" in data
        assert "confianza" in data

    def test_classify_returns_201(self, client):
        """POST /classify should return 201."""
        response = client.post(
            "/api/argilla/classify",
            json={"text": "test", "labels": ["a", "b"]},
        )
        assert response.status_code == 201


class TestInputValidation:
    def test_predict_too_long_text(self, client):
        """Reject text over 10000 characters."""
        long_text = "great " * 2000  # 12000 chars
        response = client.post("/api/model/predict", json={"text": long_text})
        assert response.status_code == 422  # Pydantic validation

    def test_predict_missing_text(self, client):
        """Reject request without text field."""
        response = client.post("/api/model/predict", json={})
        assert response.status_code == 422

    def test_predict_unicode_text(self, client):
        """Handle Unicode text correctly."""
        response = client.post("/api/model/predict", json={"text": "Esta pelicula fue increible"})
        assert response.status_code == 201
        data = response.json()
        assert "sentimiento" in data

    def test_predict_html_text(self, client):
        """Handle HTML in text without breaking."""
        response = client.post("/api/model/predict", json={"text": "<script>alert('xss')</script> great movie"})
        assert response.status_code == 201

    def test_predict_only_whitespace(self, client):
        """Reject whitespace-only text."""
        response = client.post("/api/model/predict", json={"text": "   \n\t  "})
        assert response.status_code == 400


class TestExportValidation:
    def test_pdf_content_type(self, client):
        """PDF should return correct content type."""
        response = client.get("/api/export/pdf")
        assert response.status_code == 200
        assert "application/pdf" in response.headers.get("content-type", "")

    def test_notebook_content_type(self, client):
        """Notebook should return correct content type."""
        response = client.get("/api/export/notebook")
        assert response.status_code == 200
        assert "ipynb" in response.headers.get("content-type", "") or "json" in response.headers.get("content-type", "")

    def test_zip_content_type(self, client):
        """ZIP should return correct content type."""
        response = client.get("/api/export/zip")
        assert response.status_code == 200
        assert "zip" in response.headers.get("content-type", "")

    def test_pdf_not_empty(self, client):
        """PDF should have content."""
        response = client.get("/api/export/pdf")
        assert len(response.content) > 100

    def test_notebook_valid_json(self, client):
        """Notebook should be valid JSON."""
        import json
        response = client.get("/api/export/notebook")
        nb = json.loads(response.content)
        assert "cells" in nb
        assert "metadata" in nb
        assert len(nb["cells"]) >= 30

    def test_zip_contains_files(self, client):
        """ZIP should contain pdf and notebook."""
        import zipfile
        import io
        response = client.get("/api/export/zip")
        with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
            names = zf.namelist()
            assert "informe.pdf" in names
            assert "notebook.ipynb" in names


class TestModelDetails:
    def test_each_model_has_confusion_matrix(self, client):
        """Each model should have a confusion matrix."""
        response = client.get("/api/model/results")
        data = response.json()
        for model_name in ["naive_bayes", "logistic_regression", "svm"]:
            assert "confusion_matrix" in data[model_name], f"{model_name} missing confusion_matrix"
            cm = data[model_name]["confusion_matrix"]
            assert len(cm) == 2
            assert len(cm[0]) == 2

    def test_accuracy_within_range(self, client):
        """All accuracies should be between 0 and 1."""
        response = client.get("/api/model/results")
        data = response.json()
        for model_name in ["naive_bayes", "logistic_regression", "svm"]:
            acc = data[model_name]["accuracy"]
            assert 0.5 <= acc <= 1.0, f"{model_name} accuracy {acc} out of range"

    def test_svm_is_best_model(self, client):
        """SVM should have the highest accuracy."""
        response = client.get("/api/model/results")
        data = response.json()
        assert data["svm"]["accuracy"] >= data["naive_bayes"]["accuracy"]
        assert data["svm"]["accuracy"] >= data["logistic_regression"]["accuracy"]

    def test_comparison_has_analysis(self, client):
        """Comparison should include analysis text."""
        response = client.get("/api/model/comparison")
        data = response.json()
        assert "analisis" in data
        assert len(data["analisis"]) > 20

    def test_results_cache_control(self, client):
        """Model results should have Cache-Control header."""
        response = client.get("/api/model/results")
        assert "max-age" in response.headers.get("cache-control", "")

    def test_comparison_cache_control(self, client):
        """Model comparison should have Cache-Control header."""
        response = client.get("/api/model/comparison")
        assert "immutable" in response.headers.get("cache-control", "")


class TestSecurityHeaders:
    def test_security_headers_present(self, client):
        """All responses should include security headers."""
        response = client.get("/api/health")
        assert response.headers.get("x-content-type-options") == "nosniff"
        assert response.headers.get("x-frame-options") == "DENY"
        assert response.headers.get("x-xss-protection") == "1; mode=block"
        assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"

    def test_security_headers_on_error(self, client):
        """Security headers should be present even on error responses."""
        response = client.post("/api/model/predict", json={"text": "   "})
        assert response.status_code == 400
        assert response.headers.get("x-content-type-options") == "nosniff"

    def test_hsts_header_present(self, client):
        """Strict-Transport-Security header should be present."""
        response = client.get("/api/health")
        hsts = response.headers.get("strict-transport-security", "")
        assert "max-age=" in hsts


class TestRequestIDTracking:
    def test_request_id_generated(self, client):
        """Response should contain X-Request-ID header."""
        response = client.get("/api/health")
        request_id = response.headers.get("x-request-id")
        assert request_id is not None
        assert len(request_id) > 10  # UUID is 36 chars

    def test_request_id_echoed(self, client):
        """When X-Request-ID is provided, the same value should be echoed."""
        custom_id = "my-custom-request-id-123"
        response = client.get("/api/health", headers={"X-Request-ID": custom_id})
        assert response.headers.get("x-request-id") == custom_id

    def test_request_id_on_v1_endpoints(self, client):
        """V1 endpoints should also include X-Request-ID."""
        response = client.get("/api/dataset/stats")
        assert response.headers.get("x-request-id") is not None


class TestAPIKeyAuth:
    def test_no_key_when_not_configured(self, client):
        """When API_KEY is not set, all endpoints are accessible."""
        response = client.get("/api/dataset/stats")
        assert response.status_code == 200

    def test_401_without_key(self, unauthed_client):
        """When API_KEY is set, requests without key get 401."""
        response = unauthed_client.get("/api/dataset/stats")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "code" in data

    def test_200_with_correct_key(self, authed_client):
        """When API_KEY is set, requests with correct key succeed."""
        response = authed_client.get("/api/dataset/stats")
        assert response.status_code == 200

    def test_health_exempt(self, unauthed_client):
        """Health endpoints should not require auth."""
        response = unauthed_client.get("/api/health")
        assert response.status_code == 200

    def test_root_exempt(self, unauthed_client):
        """Root endpoint should not require auth."""
        response = unauthed_client.get("/")
        assert response.status_code == 200


class TestHTMLSanitization:
    def test_predict_sanitizes_html_in_output(self, client):
        """Prediction output should have HTML-escaped text."""
        xss_text = '<script>alert("xss")</script> great movie'
        response = client.post("/api/model/predict", json={"text": xss_text})
        assert response.status_code == 201
        data = response.json()
        # The output text should be HTML-escaped
        assert "<script>" not in data["texto"]
        assert "&lt;script&gt;" in data["texto"]

    def test_sanitization_preserves_meaning(self, client):
        """Sanitization should not break sentiment detection."""
        response = client.post("/api/model/predict", json={"text": "great <b>movie</b>"})
        assert response.status_code == 201
        data = response.json()
        assert data["sentimiento"] == "positivo"


class TestErrorSafety:
    def test_error_does_not_leak_internals(self, client):
        """Error responses should not expose internal details."""
        response = client.post("/api/model/predict", json={})
        # Should get validation error, not internal stack trace
        assert response.status_code == 422

    def test_argilla_validation_empty_labels(self, client):
        """Argilla should reject empty labels list."""
        response = client.post(
            "/api/argilla/classify",
            json={"text": "test", "labels": []},
        )
        assert response.status_code == 422

    def test_argilla_validation_too_many_labels(self, client):
        """Argilla should reject more than 20 labels."""
        labels = [f"label_{i}" for i in range(25)]
        response = client.post(
            "/api/argilla/classify",
            json={"text": "test", "labels": labels},
        )
        assert response.status_code == 422

    def test_argilla_validation_long_label(self, client):
        """Argilla should reject labels longer than 100 chars."""
        response = client.post(
            "/api/argilla/classify",
            json={"text": "test", "labels": ["x" * 150]},
        )
        assert response.status_code == 422

    def test_standardized_error_format(self, unauthed_client):
        """Error responses should follow {detail, code} format."""
        response = unauthed_client.get("/api/dataset/stats")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "code" in data


class TestConfigValidation:
    def test_settings_loads(self):
        """Settings should load without errors."""
        from backend.config import get_settings
        settings = get_settings()
        assert settings.app_version == "1.0.0"
        assert settings.rate_limit_requests > 0
        assert settings.rate_limit_window > 0

    def test_settings_cors_origins(self):
        """CORS origins should parse correctly."""
        from backend.config import get_settings
        settings = get_settings()
        origins = settings.get_cors_origins()
        assert isinstance(origins, list)
        assert len(origins) >= 1

    def test_settings_random_seed(self):
        """Random seed should have a default."""
        from backend.config import get_settings
        settings = get_settings()
        assert settings.random_seed == 42


class TestRateLimiting:
    def test_rate_limit_returns_429(self, client, monkeypatch):
        """After exceeding the limit, 429 should be returned."""
        from backend.config import _settings
        from backend.main import _rate_limit_store

        # Clear any accumulated rate limiter state from previous tests
        _rate_limit_store.clear()

        # Set a very low limit for testing
        monkeypatch.setattr(_settings, "rate_limit_requests", 2)
        monkeypatch.setattr(_settings, "rate_limit_window", 60)

        # First two should succeed
        r1 = client.get("/api/health")
        r2 = client.get("/api/health")
        # Third should be rate limited
        r3 = client.get("/api/health")

        assert r1.status_code == 200
        assert r2.status_code == 200
        assert r3.status_code == 429
        data = r3.json()
        assert "detail" in data
        assert "code" in data

    def test_rate_limit_thread_safety(self, client, monkeypatch):
        """Rate limiter lock should prevent race conditions."""
        from backend.main import _rate_limit_store, _rate_limit_lock

        _rate_limit_store.clear()
        # Verify lock exists and is a threading.Lock
        import threading
        assert isinstance(_rate_limit_lock, type(threading.Lock()))

    def test_rate_limit_max_ips_eviction(self, client, monkeypatch):
        """Rate limiter should evict oldest IPs when max_ips is exceeded."""
        import time
        from backend.config import _settings
        from backend.main import _rate_limit_store, _rate_limit_lock

        _rate_limit_store.clear()
        monkeypatch.setattr(_settings, "max_rate_limit_ips", 5)
        monkeypatch.setattr(_settings, "rate_limit_requests", 1000)
        monkeypatch.setattr(_settings, "rate_limit_window", 60)

        # Manually inject many IPs to exceed the limit
        now = time.time()
        with _rate_limit_lock:
            for i in range(10):
                _rate_limit_store[f"10.0.0.{i}"] = [now - 120]  # stale entries

        # Make a request which triggers eviction
        response = client.get("/api/health")
        assert response.status_code == 200

        # After eviction, store should have been cleaned up
        with _rate_limit_lock:
            assert len(_rate_limit_store) <= 6  # max_ips + 1 for testclient IP


class TestHealthCheckDetail:
    def test_health_basic(self, client):
        """Basic health check returns simple ok."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data == {"status": "ok"}

    def test_health_with_detail(self, client):
        """Health check with detail=true returns dependency info."""
        response = client.get("/api/health?detail=true")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "models" in data
        assert "supabase" in data
        assert "svm_tfidf" in data["models"]


class TestMiddlewareErrorHandling:
    def test_request_id_on_error_response(self, client):
        """X-Request-ID should be present even on error responses."""
        response = client.post("/api/model/predict", json={"text": "   "})
        assert response.status_code == 400
        assert response.headers.get("x-request-id") is not None

    def test_security_headers_on_all_responses(self, client):
        """Security headers should be on every response including errors."""
        response = client.post("/api/model/predict", json={})
        assert response.status_code == 422
        assert response.headers.get("x-content-type-options") == "nosniff"
        assert response.headers.get("x-frame-options") == "DENY"

    def test_custom_request_id_preserved_on_error(self, client):
        """Custom X-Request-ID should be echoed back even on error."""
        custom_id = "test-error-req-id-456"
        response = client.post(
            "/api/model/predict",
            json={"text": "   "},
            headers={"X-Request-ID": custom_id},
        )
        assert response.status_code == 400
        assert response.headers.get("x-request-id") == custom_id


class TestModelPreloading:
    def test_model_loaded_flag_set(self):
        """After app startup, ML models should have been attempted."""
        from backend.services.model_service import _ml_models
        # The lifespan should have called _load_ml_models()
        assert _ml_models["loaded"] is True


class TestEdgeCaseEndpoints:
    """Edge case and negative tests for improved test coverage."""

    def test_predict_unicode_chinese(self, client):
        """Prediction should handle Chinese Unicode text gracefully."""
        response = client.post("/api/model/predict", json={"text": "这部电影非常精彩，我很喜欢"})
        assert response.status_code == 201
        data = response.json()
        assert "sentimiento" in data
        assert "confianza" in data
        assert 0 < data["confianza"] <= 1

    def test_predict_unicode_arabic(self, client):
        """Prediction should handle Arabic Unicode text gracefully."""
        response = client.post("/api/model/predict", json={"text": "هذا الفيلم كان رائعا جدا"})
        assert response.status_code == 201
        data = response.json()
        assert "sentimiento" in data

    def test_predict_unicode_emoji(self, client):
        """Prediction should handle emoji-heavy text gracefully."""
        response = client.post(
            "/api/model/predict",
            json={"text": "Great movie! 🎬🍿👍 Loved it! ❤️🔥"},
        )
        assert response.status_code == 201
        data = response.json()
        assert "sentimiento" in data

    def test_predict_near_max_length(self, client):
        """Prediction should accept text just under the 10000 char limit."""
        # Build text of exactly 9999 chars
        text = ("great " * 1667)[:9999]
        response = client.post("/api/model/predict", json={"text": text})
        assert response.status_code == 201
        data = response.json()
        assert "sentimiento" in data

    def test_samples_page_beyond_total(self, client):
        """Requesting a page beyond total pages should return empty data."""
        response = client.get("/api/dataset/samples?page=99999&per_page=8")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)
        assert len(data["data"]) == 0

    def test_export_pdf_accept_header(self, client):
        """PDF export should work regardless of Accept header."""
        response = client.get(
            "/api/export/pdf",
            headers={"Accept": "text/html"},
        )
        assert response.status_code == 200
        assert "pdf" in response.headers.get("content-type", "")

    def test_export_notebook_accept_json(self, client):
        """Notebook export should work with Accept: application/json."""
        response = client.get(
            "/api/export/notebook",
            headers={"Accept": "application/json"},
        )
        assert response.status_code == 200

    def test_health_detail_requires_key_when_configured(self, unauthed_client):
        """Health detail should return 401 when API_KEY is set but not provided."""
        response = unauthed_client.get("/api/health?detail=true")
        assert response.status_code == 401
        data = response.json()
        assert "code" in data
        assert data["code"] == "AUTH_REQUIRED"

    def test_health_detail_with_correct_key(self, authed_client):
        """Health detail should return dependency info with correct API key."""
        response = authed_client.get("/api/health?detail=true")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "models" in data

    def test_metrics_endpoint_exists(self, client):
        """Metrics endpoint should return collected metrics."""
        response = client.get("/api/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "total_requests" in data
        assert "uptime_seconds" in data

    def test_metrics_prometheus_format(self, client):
        """Metrics endpoint should support Prometheus format."""
        response = client.get("/api/metrics?format=prometheus")
        assert response.status_code == 200
        body = response.text
        assert "app_uptime_seconds" in body
        assert "app_requests_total" in body

    def test_metrics_requires_key_when_configured(self, unauthed_client):
        """Metrics should return 401 when API_KEY is set but not provided."""
        response = unauthed_client.get("/api/metrics")
        assert response.status_code == 401


class TestConfigAdditions:
    def test_request_timeout_setting(self):
        """Settings should have request_timeout field."""
        from backend.config import get_settings
        s = get_settings()
        assert hasattr(s, "request_timeout")
        assert s.request_timeout == 30

    def test_max_rate_limit_ips_setting(self):
        """Settings should have max_rate_limit_ips field."""
        from backend.config import get_settings
        s = get_settings()
        assert hasattr(s, "max_rate_limit_ips")
        assert s.max_rate_limit_ips == 10000

    def test_app_env_setting(self):
        """Settings should have app_env field."""
        from backend.config import get_settings
        s = get_settings()
        assert hasattr(s, "app_env")
        assert isinstance(s.app_env, str)
