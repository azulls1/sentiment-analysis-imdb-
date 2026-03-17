"""Unit tests for backend services."""
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
        assert len(comp["accuracy"]) == 3

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
        result = predict_sentiment("Esta película fue increíble y maravillosa")
        assert "idioma" in result
        assert result["idioma"] == "es"


class TestSpanishPrediction:
    def test_detect_language_english(self):
        assert _detect_language("This movie was great") == "en"

    def test_detect_language_spanish(self):
        assert _detect_language("Esta película fue increíble") == "es"

    def test_positive_spanish(self):
        result = _predict_with_heuristic("Esta película fue maravillosa y excelente")
        assert result["sentimiento"] == "positivo"
        assert result["idioma"] == "es"

    def test_negative_spanish(self):
        result = _predict_with_heuristic("La película fue terrible y aburrida, una basura")
        assert result["sentimiento"] == "negativo"
        assert result["idioma"] == "es"

    def test_spanish_negation(self):
        result = _predict_with_heuristic("Esta película no es buena para nada")
        assert result["sentimiento"] == "negativo"

    def test_spanish_confidence_range(self):
        result = _predict_with_heuristic("Una película increíble, fascinante y espectacular")
        assert 0.5 <= result["confianza"] <= 1.0

    def test_spanish_scores_add_to_approximately_one(self):
        result = _predict_with_heuristic("Excelente película, la mejor que he visto")
        scores = result["scores"]
        total = scores["positivo"] + scores["negativo"]
        assert 0.9 <= total <= 1.1

    def test_spanish_uses_heuristic(self):
        result = predict_sentiment("Esta película es genial y fantástica")
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
        result = _detect_language("This película is very buena")
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
