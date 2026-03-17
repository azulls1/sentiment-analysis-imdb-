from fastapi import APIRouter, HTTPException
from backend.services.db_service import get_report_sections, get_report_metadata

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
        raise HTTPException(status_code=500, detail=f"Error retrieving report content: {str(e)}")
