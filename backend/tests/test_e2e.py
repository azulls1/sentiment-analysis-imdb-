"""End-to-end integration tests that verify full application flows.

These tests exercise multiple endpoints in sequence to ensure the system
behaves correctly as a whole, not just at the individual endpoint level.
"""

import pytest


class TestPredictFlow:
    """Test the full prediction flow: predict -> verify format -> check metrics."""

    def test_predict_returns_valid_format(self, client):
        """Predict endpoint returns all required fields with correct types."""
        resp = client.post(
            "/api/model/predict",
            json={"text": "This movie was absolutely fantastic!"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["sentimiento"] in ("positivo", "negativo")
        assert 0 <= data["confianza"] <= 1
        assert "scores" in data
        assert "positivo" in data["scores"]
        assert "negativo" in data["scores"]
        assert data["modelo"] in ("svm-tfidf", "keyword-heuristic")
        assert data["idioma"] in ("en", "es")
        assert "inference_time_ms" in data
        assert data["inference_time_ms"] >= 0

    def test_predict_then_metrics_updated(self, client):
        """After a prediction the metrics endpoint reflects the new count."""
        # Get baseline prediction count
        metrics_before = client.get("/api/metrics").json()
        total_before = metrics_before.get("predictions", {}).get("total_predictions", 0)

        # Make a prediction
        resp = client.post(
            "/api/model/predict",
            json={"text": "Terrible movie, waste of time."},
        )
        assert resp.status_code == 201

        # Verify metrics incremented
        metrics_after = client.get("/api/metrics").json()
        total_after = metrics_after["predictions"]["total_predictions"]
        assert total_after > total_before

    def test_predict_spanish_text(self, client):
        """Prediction works for Spanish text and detects language correctly."""
        resp = client.post(
            "/api/model/predict",
            json={"text": "Esta película es absolutamente terrible y aburrida."},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["idioma"] == "es"
        assert data["modelo"] == "keyword-heuristic"


class TestExportPdfFlow:
    """Test the PDF export flow: generate -> verify content-type and length."""

    def test_export_pdf_content_type_and_length(self, client):
        """PDF export returns correct media type and non-empty content."""
        resp = client.get("/api/export/pdf")
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("application/pdf")
        # StreamingResponse may not set Content-Length; verify body is non-empty
        assert len(resp.content) > 0

    def test_export_pdf_has_etag(self, client):
        """PDF export includes an ETag for cache validation."""
        resp = client.get("/api/export/pdf")
        assert resp.status_code == 200
        assert "etag" in resp.headers


class TestHealthDetailFlow:
    """Test the health detail flow: verify model status is reported."""

    def test_health_detail_reports_model_status(self, client):
        """Detailed health check includes ML model availability info."""
        resp = client.get("/api/health", params={"detail": "true"})
        assert resp.status_code == 200
        data = resp.json()
        assert "models" in data
        assert "svm_tfidf" in data["models"]
        assert data["models"]["svm_tfidf"] in ("loaded", "not_loaded")
        assert "supabase" in data


class TestFullFlow:
    """Test a complete user journey: stats -> samples -> predict -> export."""

    def test_full_user_journey(self, client):
        """Simulate a user browsing stats, viewing samples, making a prediction,
        and downloading a report -- all in one flow."""
        # 1. Get dataset stats
        stats_resp = client.get("/api/dataset/stats")
        assert stats_resp.status_code == 200
        stats = stats_resp.json()
        assert stats["total"] == 50000

        # 2. Get sample reviews (paginated response)
        samples_resp = client.get("/api/dataset/samples")
        assert samples_resp.status_code == 200
        samples_body = samples_resp.json()
        assert "data" in samples_body
        samples = samples_body["data"]
        assert len(samples) > 0

        # 3. Make a prediction using text from the first sample
        sample_text = samples[0]["texto"]
        predict_resp = client.post(
            "/api/model/predict",
            json={"text": sample_text},
        )
        assert predict_resp.status_code == 201
        prediction = predict_resp.json()
        assert "sentimiento" in prediction

        # 4. Export PDF
        pdf_resp = client.get("/api/export/pdf")
        assert pdf_resp.status_code == 200
        assert len(pdf_resp.content) > 100  # PDF is non-trivial

    def test_comparison_and_results_consistency(self, client):
        """Model comparison and detailed results should reference the same models."""
        comparison_resp = client.get("/api/model/comparison")
        assert comparison_resp.status_code == 200
        comparison = comparison_resp.json()
        assert comparison["mejor_modelo"] == "SVM"

        results_resp = client.get("/api/model/results")
        assert results_resp.status_code == 200
        results = results_resp.json()
        assert "svm" in results
        assert "naive_bayes" in results
        assert "logistic_regression" in results

        # SVM should have the highest accuracy
        assert results["svm"]["accuracy"] >= results["naive_bayes"]["accuracy"]
        assert results["svm"]["accuracy"] >= results["logistic_regression"]["accuracy"]
