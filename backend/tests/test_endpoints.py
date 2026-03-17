"""Integration tests for all FastAPI endpoints."""


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
        assert isinstance(data, list)
        assert len(data) == 8

    def test_samples_with_limit(self, client):
        response = client.get("/api/dataset/samples?limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_sample_structure(self, client):
        response = client.get("/api/dataset/samples?limit=1")
        sample = response.json()[0]
        assert "texto" in sample
        assert "sentimiento" in sample
        assert "confianza" in sample
        assert "prediccion_nb" in sample
        assert "prediccion_lr" in sample
        assert "prediccion_svm" in sample


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
        assert len(data["modelos"]) == 3

    def test_status(self, client):
        response = client.get("/api/model/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["progress"] == 100

    def test_train(self, client):
        response = client.post("/api/model/train")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"

    def test_predict_positive(self, client):
        response = client.post("/api/model/predict", json={"text": "This movie was great and amazing"})
        assert response.status_code == 200
        data = response.json()
        assert data["sentimiento"] == "positivo"
        assert "confianza" in data
        assert "scores" in data
        assert data["texto"] == "This movie was great and amazing"

    def test_predict_negative(self, client):
        response = client.post("/api/model/predict", json={"text": "Terrible awful boring waste of time"})
        assert response.status_code == 200
        data = response.json()
        assert data["sentimiento"] == "negativo"

    def test_predict_empty_text(self, client):
        response = client.post("/api/model/predict", json={"text": "   "})
        assert response.status_code == 400

    def test_predict_no_keywords(self, client):
        response = client.post("/api/model/predict", json={"text": "The sky is blue today"})
        assert response.status_code == 200
        data = response.json()
        assert "sentimiento" in data
        assert 0 < data["confianza"] <= 1

    def test_predict_with_negation(self, client):
        response = client.post("/api/model/predict", json={"text": "This movie is not good at all"})
        assert response.status_code == 200
        data = response.json()
        assert data["sentimiento"] == "negativo"


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
        assert response.status_code == 200
        data = response.json()
        assert "texto" in data
        assert "mejor_label" in data
        assert "confianza" in data


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
        response = client.post("/api/model/predict", json={"text": "Esta película fue increíble 🎬"})
        assert response.status_code == 200
        data = response.json()
        assert "sentimiento" in data

    def test_predict_html_text(self, client):
        """Handle HTML in text without breaking."""
        response = client.post("/api/model/predict", json={"text": "<script>alert('xss')</script> great movie"})
        assert response.status_code == 200

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
