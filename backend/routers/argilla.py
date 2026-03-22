"""Router for zero-shot classification (Argilla-style) endpoints."""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from backend.services.argilla_service import classify_zero_shot

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/argilla", tags=["argilla"])


class ZeroShotRequest(BaseModel):
    """Payload for the zero-shot classification endpoint."""

    text: str = Field(..., min_length=1, max_length=10000)
    labels: list[str] | None = None

    @field_validator("labels")
    @classmethod
    def validate_labels(cls, v: list[str] | None) -> list[str] | None:
        """Ensure label list has between 1 and 20 entries, each <= 100 chars."""
        if v is not None:
            if not (1 <= len(v) <= 20):
                raise ValueError("labels must contain between 1 and 20 items")
            for label in v:
                if len(label) > 100:
                    raise ValueError("each label must be at most 100 characters")
        return v


@router.post("/classify", status_code=201)
def zero_shot_classify(request: ZeroShotRequest) -> dict:
    """Classify text using zero-shot classification (facebook/bart-large-mnli).

    Rate limit recommendation: 5 req/min (GPU/CPU-heavy inference).
    """
    try:
        return classify_zero_shot(request.text, request.labels)
    except ValueError as e:
        logger.error("Validation error in zero_shot_classify: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        logger.error("File not found in zero_shot_classify: %s", e)
        raise HTTPException(status_code=404, detail="Required model file not found")
    except TimeoutError as e:
        logger.error("Timeout in zero_shot_classify: %s", e)
        raise HTTPException(status_code=504, detail="Classification timed out")
    except Exception as e:
        logger.error("Error in zero_shot_classify: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/health")
def argilla_health() -> dict:
    """Check whether the zero-shot service is available (requires transformers + torch).

    Rate limit recommendation: 60 req/min.
    """
    try:
        from transformers import pipeline as _  # noqa: F401
        return {"status": "available", "model": "facebook/bart-large-mnli"}
    except ImportError:
        return {"status": "unavailable", "reason": "transformers not installed"}
