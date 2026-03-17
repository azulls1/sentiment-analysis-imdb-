from fastapi import APIRouter, HTTPException
from backend.services.dataset_service import get_dataset_stats, get_sample_reviews

router = APIRouter(prefix="/api/dataset", tags=["dataset"])


@router.get("/stats")
def dataset_stats():
    """Retorna estadisticas generales del dataset IMDb (total, train, test, balance, vocabulario)."""
    try:
        return get_dataset_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dataset stats: {str(e)}")


@router.get("/samples")
def dataset_samples(limit: int = 8):
    """Retorna resenas de ejemplo del dataset con predicciones de cada modelo (NB, LR, SVM)."""
    try:
        return get_sample_reviews(limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving samples: {str(e)}")
