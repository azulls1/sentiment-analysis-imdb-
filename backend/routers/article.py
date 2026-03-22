"""Router for scientific article summary endpoint."""

import logging
from fastapi import APIRouter, HTTPException, Response
from backend.data.article_data import ARTICLE_SUMMARY

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/article", tags=["article"])


@router.get("/summary")
def article_summary(response: Response) -> dict:
    """Return the structured summary of Keerthi Kumar & Harish (2019).

    Rate limit recommendation: 60 req/min (immutable static data).
    """
    try:
        response.headers["Cache-Control"] = "public, max-age=86400, immutable"
        return ARTICLE_SUMMARY
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        logger.error("Error in article_summary: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")
