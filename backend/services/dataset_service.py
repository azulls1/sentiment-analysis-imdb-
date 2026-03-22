"""
Service layer for IMDb dataset statistics and sample reviews.

All data is sourced from the pre-computed ``backend.data.model_results``
module so no live dataset access is required at runtime.
"""

import logging
from typing import Dict, List, Optional

from backend.data.model_results import DATASET_STATS, SAMPLE_REVIEWS

logger = logging.getLogger(__name__)


def get_dataset_stats() -> Dict:
    """Return aggregate statistics for the IMDb dataset.

    Returns:
        Dictionary containing ``nombre``, ``total``, ``train``, ``test``,
        ``clases``, ``balance`` and ``vocabulario_tfidf``.
    """
    logger.debug("Returning dataset stats (total=%s)", DATASET_STATS.get("total"))
    return DATASET_STATS


def get_sample_reviews(limit: Optional[int] = 8) -> List[Dict]:
    """Return a list of sample reviews with per-model predictions.

    Args:
        limit: Maximum number of reviews to return.
               Pass ``None`` to retrieve all available reviews.

    Returns:
        List of review dictionaries, each containing ``texto``,
        ``sentimiento``, ``confianza``, ``prediccion_nb``,
        ``prediccion_lr`` and ``prediccion_svm``.
    """
    if limit is None:
        logger.debug("Returning all %d sample reviews", len(SAMPLE_REVIEWS))
        return SAMPLE_REVIEWS
    logger.debug("Returning %d sample reviews (limit=%s)", min(limit, len(SAMPLE_REVIEWS)), limit)
    return SAMPLE_REVIEWS[:limit]
