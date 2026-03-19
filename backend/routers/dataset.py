import logging
from fastapi import APIRouter, HTTPException
from backend.services.dataset_service import get_dataset_stats, get_sample_reviews

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/dataset", tags=["dataset"])


@router.get("/stats")
def dataset_stats():
    """Retorna estadisticas generales del dataset IMDb (total, train, test, balance, vocabulario)."""
    try:
        return get_dataset_stats()
    except Exception as e:
        logger.error("Error in dataset_stats: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/samples")
def dataset_samples(limit: int = 8):
    """Retorna resenas de ejemplo del dataset con predicciones de cada modelo (NB, LR, SVM)."""
    try:
        return get_sample_reviews(limit)
    except Exception as e:
        logger.error("Error in dataset_samples: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")
