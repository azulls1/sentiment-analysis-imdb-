"""
Database abstraction layer.

Attempts to read from Supabase; falls back to local pre-computed data
when the remote is unavailable or unconfigured.
"""

import logging
from typing import Dict, List

from backend.services import supabase_client as sb
from backend.data.report_content import REPORT_BLOCKS, REPORT_METADATA
from backend.data.model_results import (
    MODEL_RESULTS,
    DATASET_STATS,
    SAMPLE_REVIEWS,
    COMPARISON_TABLE,
)
from backend.data.article_data import ARTICLE_INFO, ARTICLE_SUMMARY

logger = logging.getLogger(__name__)


def get_report_sections() -> Dict[str, Dict[str, str]]:
    """Return academic-report sections from local data (source of truth).

    Returns:
        Dictionary keyed by section slug, each value containing
        ``titulo`` and ``contenido`` (HTML string).
    """
    logger.debug("Returning %d report sections from local data.", len(REPORT_BLOCKS))
    return {
        key: {"titulo": block["titulo"], "contenido": block["contenido"]}
        for key, block in REPORT_BLOCKS.items()
    }


def get_report_metadata() -> Dict[str, str]:
    """Return report metadata (title, author, date, etc.) from local data.

    Returns:
        Flat dictionary with metadata fields such as ``titulo``,
        ``autor``, ``universidad``, ``fecha``.
    """
    return REPORT_METADATA


def get_model_results() -> Dict:
    """Return per-model evaluation metrics.

    Tries Supabase first; falls back to local ``MODEL_RESULTS`` on failure.

    Returns:
        Dictionary keyed by model name with accuracy, precision, recall,
        F1, training time, confusion matrix and classification report.
    """
    if sb.is_configured():
        rows = sb.select("analisis_sentimi_model_results")
        if rows:
            logger.info("Loaded model results from Supabase (%d rows).", len(rows))
            return {
                row["model_key"]: {
                    "nombre": row["nombre"],
                    "nombre_corto": row.get("nombre_corto"),
                    "accuracy": row["accuracy"],
                    "precision_macro": row["precision_macro"],
                    "recall_macro": row["recall_macro"],
                    "f1_macro": row["f1_macro"],
                    "tiempo_entrenamiento": row["tiempo_entrenamiento"],
                    "confusion_matrix": row.get("confusion_matrix"),
                    "classification_report": row.get("classification_report"),
                }
                for row in rows
            }
    logger.debug("Returning local model results.")
    return MODEL_RESULTS


def get_dataset_stats() -> Dict:
    """Return dataset statistics.

    Tries Supabase first; falls back to local ``DATASET_STATS``.

    Returns:
        Dictionary with ``total``, ``train``, ``test``, ``clases``, etc.
    """
    if sb.is_configured():
        rows = sb.select("analisis_sentimi_dataset_stats")
        if rows:
            logger.info("Loaded dataset stats from Supabase.")
            return {row["key"]: row["value"] for row in rows}
    logger.debug("Returning local dataset stats.")
    return DATASET_STATS


def get_sample_reviews() -> List[Dict]:
    """Return sample reviews with predictions.

    Tries Supabase first; falls back to local ``SAMPLE_REVIEWS``.

    Returns:
        List of review dictionaries.
    """
    if sb.is_configured():
        rows = sb.select("analisis_sentimi_sample_reviews")
        if rows:
            logger.info("Loaded sample reviews from Supabase (%d rows).", len(rows))
            return rows
    logger.debug("Returning local sample reviews.")
    return SAMPLE_REVIEWS


def get_article_info() -> Dict:
    """Return article metadata.

    Tries Supabase first; falls back to local ``ARTICLE_INFO``.

    Returns:
        Dictionary with article bibliographic data.
    """
    if sb.is_configured():
        rows = sb.select("analisis_sentimi_article")
        if rows:
            logger.info("Loaded article info from Supabase.")
            return {row["key"]: row["value"] for row in rows}
    logger.debug("Returning local article info.")
    return ARTICLE_INFO
