"""
Zero-shot classification service using the Hugging Face transformers pipeline.

This is an **optional** service -- it requires ``transformers`` and ``torch``
to be installed.  When unavailable it returns a graceful fallback response.

Circuit-breaker states (FIX 10):
- CLOSED: normal operation, requests pass through.
- OPEN: too many failures; all requests are rejected immediately.
- HALF_OPEN: cooldown expired; ONE probe request is allowed through.
  If it succeeds the circuit closes; if it fails the circuit re-opens.
"""

import enum
import logging
import threading
import time
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

_classifier_cache: Dict[str, object] = {"instance": None, "loaded": False}
_lock = threading.Lock()

# Auto-unload idle model after 5 minutes to free ~500MB RAM
_last_used_time: float = 0.0
_IDLE_TIMEOUT: float = 300.0  # 5 minutes

# ---------------------------------------------------------------------------
# Circuit breaker with HALF_OPEN state (FIX 10)
# ---------------------------------------------------------------------------


class _CircuitState(enum.Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


_circuit_breaker_lock = threading.Lock()
_circuit_state: _CircuitState = _CircuitState.CLOSED
_consecutive_failures: int = 0
_circuit_open_until: float = 0.0
_MAX_CONSECUTIVE_FAILURES = 3
_CIRCUIT_OPEN_DURATION = 300  # 5 minutes
_MODEL_LOAD_TIMEOUT = 60  # seconds


def _is_circuit_open() -> bool:
    """Return True when the circuit is OPEN and should reject requests.

    When the cooldown has elapsed the state transitions to HALF_OPEN,
    allowing exactly one probe request through.
    """
    global _circuit_state
    with _circuit_breaker_lock:
        if _circuit_state == _CircuitState.CLOSED:
            return False
        if _circuit_state == _CircuitState.OPEN:
            if time.time() >= _circuit_open_until:
                # Cooldown expired — transition to HALF_OPEN for a probe
                _circuit_state = _CircuitState.HALF_OPEN
                logger.info(
                    "Circuit breaker HALF_OPEN: allowing one probe request"
                )
                return False  # let the probe through
            return True  # still in cooldown
        # HALF_OPEN — allow the probe request
        return False


def _record_failure() -> None:
    """Record a failure and transition the circuit breaker accordingly."""
    global _consecutive_failures, _circuit_open_until, _circuit_state
    with _circuit_breaker_lock:
        _consecutive_failures += 1
        if _circuit_state == _CircuitState.HALF_OPEN:
            # Probe failed — re-open for another cooldown period
            _circuit_state = _CircuitState.OPEN
            _circuit_open_until = time.time() + _CIRCUIT_OPEN_DURATION
            logger.warning(
                "Circuit breaker re-OPEN (probe failed): "
                "will retry after %d seconds.",
                _CIRCUIT_OPEN_DURATION,
            )
        elif _consecutive_failures >= _MAX_CONSECUTIVE_FAILURES:
            _circuit_state = _CircuitState.OPEN
            _circuit_open_until = time.time() + _CIRCUIT_OPEN_DURATION
            logger.warning(
                "Circuit breaker OPEN: %d consecutive failures. "
                "Will retry after %d seconds.",
                _consecutive_failures,
                _CIRCUIT_OPEN_DURATION,
            )


def _record_success() -> None:
    """Reset the circuit breaker to CLOSED on a successful request."""
    global _consecutive_failures, _circuit_open_until, _circuit_state
    with _circuit_breaker_lock:
        if _circuit_state == _CircuitState.HALF_OPEN:
            logger.info("Circuit breaker CLOSED (probe succeeded)")
        _consecutive_failures = 0
        _circuit_open_until = 0.0
        _circuit_state = _CircuitState.CLOSED


def _reset_circuit_breaker_unlocked() -> None:
    """Reset circuit breaker state (caller must hold _circuit_breaker_lock)."""
    global _consecutive_failures, _circuit_open_until, _circuit_state
    _consecutive_failures = 0
    _circuit_open_until = 0.0
    _circuit_state = _CircuitState.CLOSED


def _check_idle_unload() -> None:
    """Check if the model has been idle longer than _IDLE_TIMEOUT and unload it.

    Called before each classification to reclaim memory from idle models.
    The ~500MB transformer model should not sit in RAM indefinitely.
    """
    global _last_used_time
    if not _classifier_cache["loaded"] or _classifier_cache["instance"] is None:
        return
    if _last_used_time > 0 and (time.time() - _last_used_time) > _IDLE_TIMEOUT:
        logger.info(
            "Zero-shot model idle for >%.0f seconds, unloading to free memory.",
            _IDLE_TIMEOUT,
        )
        _classifier_cache["instance"] = None
        _classifier_cache["loaded"] = False
        _last_used_time = 0.0


def unload_model() -> None:
    """Unload the cached model to free memory."""
    global _last_used_time
    with _lock:
        _classifier_cache["instance"] = None
        _classifier_cache["loaded"] = False
        _last_used_time = 0.0
    logger.info("Zero-shot model unloaded to free memory.")


def classify_zero_shot(
    text: str,
    labels: Optional[List[str]] = None,
) -> Dict:
    """Classify *text* against candidate *labels* using zero-shot inference.

    The underlying model is ``facebook/bart-large-mnli`` loaded via the
    ``transformers`` ``pipeline`` API.  The model is cached after the first
    invocation so subsequent calls are faster.

    Includes circuit breaker: after 3 consecutive failures, stops trying
    for 5 minutes to avoid repeated slow timeouts.

    Args:
        text: The text to classify.
        labels: Candidate label strings.  Defaults to
                ``["positive", "negative", "positivo", "negativo"]``.

    Returns:
        Dictionary with ``texto``, ``labels``, ``scores``,
        ``mejor_label`` and ``confianza``.  If the pipeline is
        unavailable an ``error`` key is included instead.
    """
    global _last_used_time

    if labels is None:
        labels = ["positive", "negative", "positivo", "negativo"]

    # Auto-unload idle model before attempting classification
    with _lock:
        _check_idle_unload()

    # Check circuit breaker
    if _is_circuit_open():
        return {
            "texto": text,
            "error": "Zero-shot classification temporarily unavailable (circuit breaker open)",
            "labels": labels,
            "scores": [0.5] * len(labels),
            "mejor_label": labels[0],
            "confianza": 0.5,
        }

    try:
        with _lock:
            if not _classifier_cache["loaded"]:
                logger.info("Loading zero-shot classification pipeline (bart-large-mnli)...")
                import signal
                import functools

                from transformers import pipeline

                # Use a thread with timeout to guard model loading
                load_result: Dict = {"instance": None, "error": None}

                def _do_load():
                    try:
                        load_result["instance"] = pipeline(
                            "zero-shot-classification",
                            model="facebook/bart-large-mnli",
                        )
                    except Exception as e:
                        load_result["error"] = e

                loader = threading.Thread(target=_do_load, daemon=True)
                loader.start()
                loader.join(timeout=_MODEL_LOAD_TIMEOUT)

                if loader.is_alive():
                    raise TimeoutError(
                        f"Model loading timed out after {_MODEL_LOAD_TIMEOUT}s"
                    )
                if load_result["error"] is not None:
                    raise load_result["error"]

                _classifier_cache["instance"] = load_result["instance"]
                _classifier_cache["loaded"] = True
                logger.info("Zero-shot pipeline loaded successfully.")
            classifier = _classifier_cache["instance"]

        result = classifier(text, labels)
        _record_success()
        _last_used_time = time.time()
        logger.debug("Zero-shot prediction: best_label=%s", result["labels"][0])
        return {
            "texto": text,
            "labels": result["labels"],
            "scores": [round(s, 4) for s in result["scores"]],
            "mejor_label": result["labels"][0],
            "confianza": round(result["scores"][0], 4),
        }
    except Exception:
        _record_failure()
        logger.warning("Zero-shot classification unavailable.", exc_info=True)
        return {
            "texto": text,
            "error": "Zero-shot classification not available",
            "labels": labels,
            "scores": [0.5] * len(labels),
            "mejor_label": labels[0],
            "confianza": 0.5,
        }
