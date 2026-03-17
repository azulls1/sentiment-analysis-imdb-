"""
Capa de abstracción para la base de datos.
Intenta leer de Supabase; si falla, usa datos locales como fallback.
"""
from backend.services import supabase_client as sb
from backend.data.report_content import REPORT_BLOCKS, REPORT_METADATA
from backend.data.model_results import (
    MODEL_RESULTS,
    DATASET_STATS,
    SAMPLE_REVIEWS,
    COMPARISON_TABLE,
)
from backend.data.article_data import ARTICLE_INFO, ARTICLE_SUMMARY


def get_report_sections() -> dict:
    """Retorna las secciones del informe desde datos locales (fuente de verdad)."""
    return {
        key: {"titulo": block["titulo"], "contenido": block["contenido"]}
        for key, block in REPORT_BLOCKS.items()
    }


def get_report_metadata() -> dict:
    """Retorna metadatos del informe desde datos locales (fuente de verdad)."""
    return REPORT_METADATA


def get_model_results() -> dict:
    """Retorna resultados de modelos. Intenta Supabase, fallback a local."""
    if sb.is_configured():
        rows = sb.select("analisis_sentimi_model_results")
        if rows:
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
    return MODEL_RESULTS


def get_dataset_stats() -> dict:
    """Retorna estadísticas del dataset. Intenta Supabase, fallback a local."""
    if sb.is_configured():
        rows = sb.select("analisis_sentimi_dataset_stats")
        if rows:
            return {row["key"]: row["value"] for row in rows}
    return DATASET_STATS


def get_sample_reviews() -> list[dict]:
    """Retorna reseñas de muestra. Intenta Supabase, fallback a local."""
    if sb.is_configured():
        rows = sb.select("analisis_sentimi_sample_reviews")
        if rows:
            return rows
    return SAMPLE_REVIEWS


def get_article_info() -> dict:
    """Retorna datos del artículo. Intenta Supabase, fallback a local."""
    if sb.is_configured():
        rows = sb.select("analisis_sentimi_article")
        if rows:
            return {row["key"]: row["value"] for row in rows}
    return ARTICLE_INFO
