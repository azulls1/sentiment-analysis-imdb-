import logging
from fastapi import APIRouter, HTTPException
from backend.data.article_data import ARTICLE_SUMMARY

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/article", tags=["article"])


@router.get("/summary")
def article_summary():
    """Retorna el resumen estructurado del articulo de Keerthi Kumar & Harish (2019)."""
    try:
        return ARTICLE_SUMMARY
    except Exception as e:
        logger.error("Error in article_summary: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")
