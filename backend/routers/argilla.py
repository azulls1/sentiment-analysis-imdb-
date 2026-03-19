import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from backend.services.argilla_service import classify_zero_shot

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/argilla", tags=["argilla"])


class ZeroShotRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    labels: list[str] | None = None

    @field_validator("labels")
    @classmethod
    def validate_labels(cls, v):
        if v is not None:
            if not (1 <= len(v) <= 20):
                raise ValueError("labels must contain between 1 and 20 items")
            for label in v:
                if len(label) > 100:
                    raise ValueError("each label must be at most 100 characters")
        return v


@router.post("/classify")
def zero_shot_classify(request: ZeroShotRequest):
    """Clasifica texto usando zero-shot classification (facebook/bart-large-mnli)."""
    try:
        return classify_zero_shot(request.text, request.labels)
    except Exception as e:
        logger.error("Error in zero_shot_classify: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/health")
def argilla_health():
    """Verifica si el servicio zero-shot esta disponible (requiere transformers + torch)."""
    try:
        from transformers import pipeline as _  # noqa: F401
        return {"status": "available", "model": "facebook/bart-large-mnli"}
    except ImportError:
        return {"status": "unavailable", "reason": "transformers not installed"}
