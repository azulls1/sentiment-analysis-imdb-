"""Router for academic report content endpoints."""

import logging
from fastapi import APIRouter, HTTPException, Response
from backend.services.db_service import get_report_sections, get_report_metadata

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/report", tags=["report"])


@router.get("/content")
def report_content(response: Response) -> dict:
    """Return academic report content (metadata + 8 HTML sections) from Supabase or local.

    Rate limit recommendation: 30 req/min.
    """
    try:
        response.headers["Cache-Control"] = "public, max-age=1800"
        return {
            "metadata": get_report_metadata(),
            "blocks": get_report_sections(),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail="Report content not found")
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        logger.error("Error in report_content: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")
