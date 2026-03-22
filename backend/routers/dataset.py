"""Router for dataset statistics and sample review endpoints."""

import logging
from fastapi import APIRouter, HTTPException, Query, Response
from backend.services.dataset_service import get_dataset_stats, get_sample_reviews

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/dataset", tags=["dataset"])


@router.get(
    "/stats",
    responses={
        200: {
            "description": "Dataset statistics retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "total_reviews": 50000,
                        "train_size": 25000,
                        "test_size": 25000,
                        "positive_ratio": 0.5,
                        "negative_ratio": 0.5,
                        "vocabulary_size": 74849,
                    }
                }
            },
        }
    },
)
def dataset_stats(response: Response) -> dict:
    """Return general statistics for the IMDb dataset (total, train, test, balance, vocabulary).

    Rate limit recommendation: 60 req/min (immutable data).
    """
    try:
        response.headers["Cache-Control"] = "public, max-age=3600, immutable"
        return get_dataset_stats()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        logger.error("Error in dataset_stats: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get(
    "/samples",
    responses={
        200: {
            "description": "Paginated sample reviews with model predictions",
            "content": {
                "application/json": {
                    "example": {
                        "data": [
                            {
                                "text": "A wonderful film with great performances...",
                                "true_label": "positive",
                                "nb_pred": "positive",
                                "lr_pred": "positive",
                                "svm_pred": "positive",
                            }
                        ],
                        "pagination": {
                            "total": 100,
                            "page": 1,
                            "per_page": 8,
                            "has_next": True,
                        },
                    }
                }
            },
        }
    },
)
def dataset_samples(
    response: Response,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    per_page: int = Query(8, ge=1, le=50, description="Items per page"),
) -> dict:
    """Return sample reviews with predictions from each model (NB, LR, SVM).

    Supports pagination via ``page`` and ``per_page`` query parameters.
    Rate limit recommendation: 30 req/min.
    """
    try:
        all_reviews = get_sample_reviews(limit=None)
        total = len(all_reviews)
        start = (page - 1) * per_page
        end = start + per_page
        items = all_reviews[start:end]
        has_next = end < total

        response.headers["Cache-Control"] = "public, max-age=600"
        return {
            "data": items,
            "pagination": {
                "total": total,
                "page": page,
                "per_page": per_page,
                "has_next": has_next,
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        logger.error("Error in dataset_samples: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")
