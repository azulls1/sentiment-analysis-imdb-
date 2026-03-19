import os
import re
import threading
from backend.data.model_results import (
    MODEL_RESULTS,
    COMPARISON_TABLE,
    TRAINING_PROGRESS_FINAL,
    TFIDF_PARAMS,
)

# In-memory state for training simulation
_training_state = {
    "status": "idle",
    "progress": 0,
    "task_id": None,
}

# Lazy-loaded ML models
_ml_models = {
    "vectorizer": None,
    "svm": None,
    "loaded": False,
    "available": False,
}

_ml_lock = threading.Lock()


def _load_ml_models():
    """Try to load serialized ML models from backend/models/. Only attempts once."""
    with _ml_lock:
        if _ml_models["loaded"]:
            return _ml_models["available"]

        _ml_models["loaded"] = True
        models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
        vectorizer_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")
        svm_path = os.path.join(models_dir, "svm.joblib")

        if not os.path.exists(vectorizer_path) or not os.path.exists(svm_path):
            return False

        try:
            import joblib
            _ml_models["vectorizer"] = joblib.load(vectorizer_path)
            _ml_models["svm"] = joblib.load(svm_path)
            _ml_models["available"] = True
            return True
        except Exception:
            return False


def get_model_results() -> dict:
    """Retorna metricas detalladas de cada modelo incluyendo matrices de confusion."""
    return MODEL_RESULTS


def get_comparison() -> dict:
    """Retorna tabla comparativa de los tres modelos."""
    return COMPARISON_TABLE


def get_tfidf_params() -> dict:
    """Retorna parametros de configuracion del vectorizador TF-IDF."""
    return TFIDF_PARAMS


def get_training_status() -> dict:
    """Retorna el estado actual del entrenamiento."""
    return TRAINING_PROGRESS_FINAL


def start_training() -> dict:
    """Inicia entrenamiento (datos pre-calculados disponibles)."""
    return {
        "message": "Entrenamiento iniciado (datos pre-calculados disponibles)",
        "status": "completed",
        "task_id": "precalculated",
    }


def predict_sentiment(text: str) -> dict:
    """Predict sentiment using real SVM model if available, fallback to keyword heuristic."""
    lang = _detect_language(text)
    # Only use ML model for English (trained on English data only)
    if lang == "en" and _load_ml_models():
        result = _predict_with_ml(text)
        result["idioma"] = lang
        return result
    return _predict_with_heuristic(text)


def _predict_with_ml(text: str) -> dict:
    """Predict using the trained SVM model with TF-IDF vectorizer."""
    vectorizer = _ml_models["vectorizer"]
    svm = _ml_models["svm"]

    X = vectorizer.transform([text])
    prediction = svm.predict(X)[0]

    # Get decision function for confidence score
    decision = svm.decision_function(X)[0]
    # Convert decision function to probability-like score using sigmoid
    import math
    confidence = 1 / (1 + math.exp(-abs(decision)))
    confidence = min(0.99, max(0.51, confidence))

    sentiment = "positivo" if prediction == 1 else "negativo"
    pos_score = confidence if prediction == 1 else 1 - confidence
    neg_score = 1 - pos_score

    return {
        "texto": text,
        "sentimiento": sentiment,
        "confianza": round(confidence, 4),
        "scores": {
            "positivo": round(pos_score, 4),
            "negativo": round(neg_score, 4),
        },
        "modelo": "svm-tfidf",
    }


def _detect_language(text: str) -> str:
    """Detect if text is Spanish or English based on common words."""
    text_lower = text.lower()
    es_markers = {"el", "la", "los", "las", "es", "una", "uno", "del", "que", "por",
                  "con", "para", "como", "pero", "muy", "más", "esta", "este",
                  "película", "pelicula", "fue", "tiene", "hace", "bien", "mal"}
    en_markers = {"the", "is", "are", "was", "were", "have", "has", "this", "that",
                  "with", "for", "but", "movie", "film", "very", "really", "just"}
    words = set(re.sub(r"[^a-záéíóúñü\s]", "", text_lower).split())
    es_count = len(words & es_markers)
    en_count = len(words & en_markers)
    return "es" if es_count > en_count else "en"


def _predict_with_heuristic(text: str) -> dict:
    """Fallback: keyword-based prediction when ML models are not available."""
    text_lower = text.lower()
    lang = _detect_language(text)
    text_clean = re.sub(r"[^a-záéíóúñü\s]", "", text_lower)

    positive_words_en = {
        "good", "great", "excellent", "amazing", "wonderful", "fantastic",
        "brilliant", "outstanding", "superb", "love", "loved", "enjoy",
        "enjoyed", "best", "beautiful", "perfect", "recommend", "recommended",
        "entertaining", "fun", "masterpiece", "incredible", "impressive",
        "heartwarming", "stunning", "powerful", "engaging", "captivating",
    }
    negative_words_en = {
        "bad", "terrible", "awful", "horrible", "worst", "hate", "hated",
        "boring", "waste", "poor", "disappointing", "disappointed",
        "poorly", "dull", "stupid", "ridiculous", "pointless", "mediocre",
        "annoying", "cringe", "pretentious", "overrated", "forgettable",
        "tedious", "unoriginal", "unwatchable", "atrocious",
    }
    negation_words_en = {"not", "no", "never", "neither", "nobody", "nothing",
                         "hardly", "barely", "dont", "doesnt", "didnt", "wasnt",
                         "werent", "isnt", "arent"}

    positive_words_es = {
        "buena", "bueno", "excelente", "increíble", "increible", "maravillosa",
        "maravilloso", "fantástica", "fantastica", "fantástico", "fantastico",
        "brillante", "genial", "magnífica", "magnifica", "sobresaliente",
        "encanta", "encantó", "encanto", "disfruté", "disfrute", "disfrutar",
        "mejor", "hermosa", "hermoso", "perfecta", "perfecto", "recomiendo",
        "recomendable", "entretenida", "entretenido", "divertida", "divertido",
        "obra maestra", "impresionante", "cautivadora", "cautivador",
        "emotiva", "emotivo", "espectacular", "sublime", "extraordinaria",
        "extraordinario", "fascinante", "conmovedora", "conmovedor",
        "adoré", "adore", "gran", "grandiosa", "grandioso", "memorable",
        "emocionante", "preciosa", "precioso", "bonita", "bonito",
    }
    negative_words_es = {
        "mala", "malo", "terrible", "horrible", "pésima", "pesima", "pésimo",
        "pesimo", "peor", "odio", "odié", "odie", "aburrida", "aburrido",
        "desperdicio", "decepcionante", "decepcionada", "decepcionado",
        "mediocre", "tonta", "tonto", "ridícula", "ridicula", "ridículo",
        "ridiculo", "absurda", "absurdo", "insoportable", "pretenciosa",
        "pretencioso", "olvidable", "tediosa", "tedioso", "floja", "flojo",
        "pobre", "basura", "asco", "patética", "patetica", "patético",
        "patetico", "infumable", "desastrosa", "desastroso", "lamentable",
        "insulsa", "insulso", "predecible", "malísima", "malisima",
    }
    negation_words_es = {"no", "nunca", "jamás", "jamas", "ni", "nadie", "nada",
                         "tampoco", "ningún", "ningun", "ninguna", "apenas"}

    if lang == "es":
        positive_words = positive_words_es
        negative_words = negative_words_es
        negation_words = negation_words_es
    else:
        positive_words = positive_words_en
        negative_words = negative_words_en
        negation_words = negation_words_en

    words = text_clean.split()
    pos_score = 0
    neg_score = 0

    for i, word in enumerate(words):
        has_negation = any(words[j] in negation_words for j in range(max(0, i - 2), i))
        if word in positive_words:
            if has_negation:
                neg_score += 1
            else:
                pos_score += 1
        elif word in negative_words:
            if has_negation:
                pos_score += 1
            else:
                neg_score += 1

    total = pos_score + neg_score
    if total == 0:
        return {
            "texto": text,
            "sentimiento": "positivo",
            "confianza": 0.52,
            "scores": {"positivo": 0.52, "negativo": 0.48},
            "modelo": "keyword-heuristic",
            "idioma": lang,
        }

    pos_ratio = pos_score / total
    sentiment = "positivo" if pos_ratio >= 0.5 else "negativo"
    confidence = max(pos_ratio, 1 - pos_ratio)
    confidence = min(0.98, max(0.55, confidence * 0.85 + 0.15))

    return {
        "texto": text,
        "sentimiento": sentiment,
        "confianza": round(confidence, 4),
        "scores": {
            "positivo": round(pos_ratio * 0.85 + 0.15 if sentiment == "positivo" else (1 - confidence), 4),
            "negativo": round((1 - pos_ratio) * 0.85 + 0.15 if sentiment == "negativo" else (1 - confidence), 4),
        },
        "modelo": "keyword-heuristic",
        "idioma": lang,
    }
