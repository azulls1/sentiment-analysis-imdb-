"""
Zero-shot classification using transformers pipeline.
Optional service - requires transformers + torch.
"""

import threading

_classifier_cache = {"instance": None, "loaded": False}
_lock = threading.Lock()


def classify_zero_shot(text: str, labels: list[str] = None) -> dict:
    """Classify text using zero-shot classification pipeline."""
    if labels is None:
        labels = ["positive", "negative", "positivo", "negativo"]

    try:
        with _lock:
            if not _classifier_cache["loaded"]:
                from transformers import pipeline
                _classifier_cache["instance"] = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",
                )
                _classifier_cache["loaded"] = True
            classifier = _classifier_cache["instance"]

        result = classifier(text, labels)
        return {
            "texto": text,
            "labels": result["labels"],
            "scores": [round(s, 4) for s in result["scores"]],
            "mejor_label": result["labels"][0],
            "confianza": round(result["scores"][0], 4),
        }
    except Exception as e:
        return {
            "texto": text,
            "error": f"Zero-shot classification not available: {str(e)}",
            "labels": labels,
            "scores": [0.5] * len(labels),
            "mejor_label": labels[0],
            "confianza": 0.5,
        }
