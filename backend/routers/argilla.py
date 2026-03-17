from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.argilla_service import classify_zero_shot

router = APIRouter(prefix="/api/argilla", tags=["argilla"])


class ZeroShotRequest(BaseModel):
    text: str
    labels: list[str] | None = None


@router.post("/classify")
def zero_shot_classify(request: ZeroShotRequest):
    """Clasifica texto usando zero-shot classification (facebook/bart-large-mnli)."""
    return classify_zero_shot(request.text, request.labels)


@router.get("/health")
def argilla_health():
    """Verifica si el servicio zero-shot esta disponible (requiere transformers + torch)."""
    try:
        from transformers import pipeline as _  # noqa: F401
        return {"status": "available", "model": "facebook/bart-large-mnli"}
    except ImportError:
        return {"status": "unavailable", "reason": "transformers not installed"}
