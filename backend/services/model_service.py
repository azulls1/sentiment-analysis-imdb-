"""
Service layer for ML model inference and pre-calculated results.

Provides functions to retrieve stored training metrics, start
(simulated) training, and predict sentiment via a real SVM model
or a keyword-based heuristic fallback.
"""

import hashlib
import html
import json
import logging
import math
import os
import re
import threading
import time
from typing import Dict, List, Optional, Set

from backend.data.model_results import (
    MODEL_RESULTS,
    COMPARISON_TABLE,
    TRAINING_PROGRESS_FINAL,
    TFIDF_PARAMS,
)
from backend.monitoring import prediction_tracker

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Load sentiment lexicons from external JSON config (FIX 1)
# ---------------------------------------------------------------------------
_LEXICONS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sentiment_lexicons.json")
with open(_LEXICONS_PATH, encoding="utf-8") as _f:
    LEXICONS: Dict = json.load(_f)

# In-memory state for training simulation
_training_state: Dict[str, object] = {
    "status": "idle",
    "progress": 0,
    "task_id": None,
}

# Lazy-loaded ML models
_ml_models: Dict[str, object] = {
    "vectorizer": None,
    "svm": None,
    "loaded": False,
    "available": False,
}

_ml_lock = threading.Lock()

# ---------------------------------------------------------------------------
# Prediction cache (LRU with TTL)
# ---------------------------------------------------------------------------

_prediction_cache: Dict[str, Dict] = {}
_prediction_cache_timestamps: Dict[str, float] = {}
MAX_PREDICTION_CACHE = 100
PREDICTION_CACHE_TTL = 600  # 10 minutes


def _cache_key(text: str) -> str:
    """Generate a cache key from input text using MD5 hash."""
    return hashlib.md5(text.encode()).hexdigest()


def _prediction_cache_cleanup() -> None:
    """Evict expired entries and enforce LRU max-size limit.

    Removes entries older than ``PREDICTION_CACHE_TTL`` seconds first,
    then if the cache still exceeds ``MAX_PREDICTION_CACHE``, removes
    the oldest entries by timestamp until the limit is met.
    """
    now = time.time()
    # 1. Remove expired entries
    expired_keys = [
        k for k, ts in _prediction_cache_timestamps.items()
        if now - ts > PREDICTION_CACHE_TTL
    ]
    for k in expired_keys:
        _prediction_cache.pop(k, None)
        _prediction_cache_timestamps.pop(k, None)
    if expired_keys:
        logger.debug("Prediction cache: evicted %d expired entries", len(expired_keys))

    # 2. Enforce max size (LRU by oldest timestamp)
    if len(_prediction_cache) > MAX_PREDICTION_CACHE:
        sorted_keys = sorted(
            _prediction_cache_timestamps, key=_prediction_cache_timestamps.get  # type: ignore[arg-type]
        )
        evict_count = len(_prediction_cache) - MAX_PREDICTION_CACHE
        for k in sorted_keys[:evict_count]:
            _prediction_cache.pop(k, None)
            _prediction_cache_timestamps.pop(k, None)
        logger.debug("Prediction cache: evicted %d entries (LRU)", evict_count)


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

def _load_ml_models() -> bool:
    """Attempt to load serialised ML artefacts from ``backend/models/``.

    The loading is performed at most once (guarded by ``_ml_lock``).
    The ``loaded`` flag is set **last** so that concurrent threads never
    see a partially-initialised state.

    Returns:
        ``True`` if both the TF-IDF vectorizer and SVM model were loaded
        successfully, ``False`` otherwise.
    """
    with _ml_lock:
        # 1. Check if already loaded — return cached result
        if _ml_models["loaded"]:
            return bool(_ml_models["available"])

        models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
        vectorizer_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")
        svm_path = os.path.join(models_dir, "svm.joblib")

        if not os.path.exists(vectorizer_path) or not os.path.exists(svm_path):
            logger.info("ML model files not found at %s; falling back to heuristic.", models_dir)
            _ml_models["loaded"] = True  # mark attempted
            return False

        try:
            import joblib
            # 2. Load vectorizer
            _ml_models["vectorizer"] = joblib.load(vectorizer_path)
            # 3. Load SVM
            _ml_models["svm"] = joblib.load(svm_path)
            # 4. Mark available AFTER both models loaded
            _ml_models["available"] = True
            # 5. Mark loaded LAST
            _ml_models["loaded"] = True
            logger.info("ML models loaded successfully from %s", models_dir)
            return True
        except Exception:
            logger.warning("Failed to load ML models from %s", models_dir, exc_info=True)
            _ml_models["loaded"] = True  # mark attempted even on failure
            return False


# ---------------------------------------------------------------------------
# Public query helpers
# ---------------------------------------------------------------------------

def get_model_results() -> Dict:
    """Return detailed per-model metrics including confusion matrices.

    Returns:
        Dictionary keyed by model name (``naive_bayes``, ``logistic_regression``,
        ``svm``) with accuracy, precision, recall, F1 and confusion-matrix data.
    """
    return MODEL_RESULTS


def get_comparison() -> Dict:
    """Return a comparison table for all three models.

    Returns:
        Dictionary with ``mejor_modelo``, ``mejor_accuracy``, per-metric
        lists and an analysis paragraph.
    """
    return COMPARISON_TABLE


def get_tfidf_params() -> Dict:
    """Return TF-IDF vectorizer configuration parameters.

    Returns:
        Dictionary with keys such as ``max_features``, ``ngram_range``,
        ``sublinear_tf``, etc.
    """
    return TFIDF_PARAMS


def get_training_status() -> Dict:
    """Return the current training progress / status.

    Returns:
        Dictionary with ``status``, ``progress`` (0-100) and step details.
    """
    return TRAINING_PROGRESS_FINAL


def start_training() -> Dict:
    """Trigger model training (returns pre-calculated results immediately).

    Returns:
        Dictionary with a ``message``, ``status`` and ``task_id``.
    """
    logger.info("Training triggered (pre-calculated data returned).")
    return {
        "message": "Entrenamiento iniciado (datos pre-calculados disponibles)",
        "status": "completed",
        "task_id": "precalculated",
    }


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

def predict_sentiment(text: str) -> Dict:
    """Predict sentiment for the given *text*.

    Results are cached (LRU, max 100 entries, TTL 10 min) to avoid
    redundant ML inference or heuristic computation for repeated inputs.

    Strategy:
    1. Check prediction cache -- return immediately on hit.
    2. If the text is detected as English **and** the serialised SVM model
       is available, use :func:`_predict_with_ml`.
    3. Otherwise fall back to :func:`_predict_with_heuristic`.

    Args:
        text: Free-form review text (English or Spanish).

    Returns:
        Dictionary with ``texto``, ``sentimiento``, ``confianza``,
        ``scores``, ``modelo`` and ``idioma``.
    """
    # --- Cache lookup ---
    key = _cache_key(text)
    cached = _prediction_cache.get(key)
    if cached is not None:
        ts = _prediction_cache_timestamps.get(key, 0)
        if time.time() - ts <= PREDICTION_CACHE_TTL:
            logger.debug("Prediction cache HIT for key=%s", key[:8])
            # Update timestamp on access (LRU refresh)
            _prediction_cache_timestamps[key] = time.time()
            return cached
        else:
            # Expired entry -- remove
            _prediction_cache.pop(key, None)
            _prediction_cache_timestamps.pop(key, None)

    logger.debug("Prediction cache MISS for key=%s", key[:8])

    # Sanitize text for safe downstream embedding (PDF / notebook templates)
    safe_text = html.escape(text)
    lang = _detect_language(text)

    # Only use ML model for English (trained on English data only)
    if lang == "en" and _load_ml_models():
        logger.debug("Using ML model for prediction (lang=%s)", lang)
        result = _predict_with_ml(text)
        result["idioma"] = lang
        result["texto"] = safe_text
    else:
        logger.debug("Using heuristic for prediction (lang=%s)", lang)
        result = _predict_with_heuristic(text)
        result["texto"] = safe_text

    # --- Track prediction for drift detection and monitoring ---
    prediction_tracker.record(
        sentiment=result.get("sentimiento", ""),
        confidence=result.get("confianza", 0.0),
        model=result.get("modelo", ""),
        language=result.get("idioma", ""),
    )

    # --- Store in cache ---
    _prediction_cache[key] = result
    _prediction_cache_timestamps[key] = time.time()
    _prediction_cache_cleanup()

    return result


def _predict_with_ml(text: str) -> Dict:
    """Predict using the trained SVM model with TF-IDF vectorizer.

    Applies a sigmoid function to the SVM decision-function value to
    produce a probability-like confidence score.

    Args:
        text: Raw review text (English).

    Returns:
        Prediction dictionary (without ``idioma`` -- caller adds it).
    """
    vectorizer = _ml_models["vectorizer"]
    svm = _ml_models["svm"]

    X = vectorizer.transform([text])
    prediction: int = svm.predict(X)[0]

    # Convert decision function to probability-like score via sigmoid
    decision: float = svm.decision_function(X)[0]
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


# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

def _detect_language(text: str) -> str:
    """Detect whether *text* is Spanish or English based on common marker words.

    Uses simple word-overlap counting -- no external library needed.

    Args:
        text: Input text.

    Returns:
        ``"es"`` for Spanish, ``"en"`` for English (default).
    """
    text_lower = text.lower()
    es_markers: Set[str] = {
        "el", "la", "los", "las", "es", "una", "uno", "del", "que", "por",
        "con", "para", "como", "pero", "muy", "más", "esta", "este",
        "película", "pelicula", "fue", "tiene", "hace", "bien", "mal",
    }
    en_markers: Set[str] = {
        "the", "is", "are", "was", "were", "have", "has", "this", "that",
        "with", "for", "but", "movie", "film", "very", "really", "just",
    }
    words: Set[str] = set(re.sub(r"[^a-záéíóúñü\s]", "", text_lower).split())
    es_count = len(words & es_markers)
    en_count = len(words & en_markers)
    return "es" if es_count > en_count else "en"


# ---------------------------------------------------------------------------
# Heuristic fallback
# ---------------------------------------------------------------------------

def _score_words(words: List[str], lang: str) -> tuple:
    """Score word list against lexicons, returning (pos_score, neg_score).

    Applies negation awareness (3-word window) and intensifier detection
    (2-word window) from the loaded ``LEXICONS`` config.

    Args:
        words: Cleaned, lowercased word tokens.
        lang: Language code (``"en"`` or ``"es"``).

    Returns:
        Tuple of ``(positive_score, negative_score)``.
    """
    lex = LEXICONS.get(lang, LEXICONS["en"])
    positive_words: Set[str] = set(lex["positive"])
    negative_words: Set[str] = set(lex["negative"])
    negation_words: Set[str] = set(lex["negation"])
    intensifiers: Set[str] = set(lex["intensifiers"])

    pos_score: float = 0.0
    neg_score: float = 0.0

    for i, word in enumerate(words):
        has_negation = any(words[j] in negation_words for j in range(max(0, i - 3), i))
        has_intensifier = any(words[j] in intensifiers for j in range(max(0, i - 2), i))
        multiplier = 1.5 if has_intensifier else 1.0

        if word in positive_words:
            if has_negation:
                neg_score += 1.0 * multiplier
            else:
                pos_score += 1.0 * multiplier
        elif word in negative_words:
            if has_negation:
                pos_score += 1.0 * multiplier
            else:
                neg_score += 1.0 * multiplier

    return pos_score, neg_score


def _build_heuristic_result(
    text: str, sentiment: str, confidence: float, pos_ratio: float, lang: str,
) -> Dict:
    """Build a standardised prediction result dictionary for the heuristic model.

    Args:
        text: Original input text.
        sentiment: Predicted sentiment label (``"positivo"`` / ``"negativo"``).
        confidence: Clamped confidence score.
        pos_ratio: Ratio of positive score to total score.
        lang: Detected language code.

    Returns:
        Prediction dictionary ready to return from the heuristic endpoint.
    """
    return {
        "texto": text,
        "sentimiento": sentiment,
        "confianza": round(confidence, 4),
        "scores": {
            "positivo": round(
                pos_ratio * 0.85 + 0.15 if sentiment == "positivo" else (1 - confidence), 4,
            ),
            "negativo": round(
                (1 - pos_ratio) * 0.85 + 0.15 if sentiment == "negativo" else (1 - confidence), 4,
            ),
        },
        "modelo": "keyword-heuristic",
        "idioma": lang,
    }


def _predict_with_heuristic(text: str) -> Dict:
    """Keyword-based sentiment prediction (fallback when ML models are absent).

    Handles both English and Spanish text with negation awareness
    (checks up to 3 words before the current word for negation markers).
    Word lists are loaded from ``backend/data/sentiment_lexicons.json``.

    Args:
        text: Raw review text.

    Returns:
        Prediction dictionary with ``texto``, ``sentimiento``, ``confianza``,
        ``scores``, ``modelo`` and ``idioma``.
    """
    lang = _detect_language(text)
    text_clean = re.sub(r"[^a-záéíóúñü\s]", "", text.lower())
    words: List[str] = text_clean.split()

    pos_score, neg_score = _score_words(words, lang)
    total = pos_score + neg_score

    if total == 0:
        return _build_heuristic_result(text, "positivo", 0.52, 0.52, lang)

    pos_ratio = pos_score / total
    sentiment = "positivo" if pos_ratio >= 0.5 else "negativo"
    confidence = max(pos_ratio, 1 - pos_ratio)
    confidence = min(0.98, max(0.55, confidence * 0.85 + 0.15))

    return _build_heuristic_result(text, sentiment, confidence, pos_ratio, lang)
