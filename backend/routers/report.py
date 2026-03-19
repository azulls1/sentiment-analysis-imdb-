import logging
from fastapi import APIRouter, HTTPException
from backend.services.db_service import get_report_sections, get_report_metadata

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/report", tags=["report"])


@router.get("/content")
def report_content():
    """Retorna el contenido del informe academico (metadata + 8 secciones HTML) desde Supabase o local."""
    try:
        return {
            "metadata": get_report_metadata(),
            "blocks": get_report_sections(),
        }
    except Exception as e:
        logger.error("Error in report_content: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")
