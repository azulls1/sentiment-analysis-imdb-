from fastapi import APIRouter, HTTPException
from backend.data.article_data import ARTICLE_SUMMARY

router = APIRouter(prefix="/api/article", tags=["article"])


@router.get("/summary")
def article_summary():
    """Retorna el resumen estructurado del articulo de Keerthi Kumar & Harish (2019)."""
    try:
        return ARTICLE_SUMMARY
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving article: {str(e)}")
