"""
Script de seed para poblar las tablas de Supabase con datos del proyecto.
Ejecutar: python -m backend.scripts.seed_supabase
"""
import json
import sys
from backend.services import supabase_client as sb
from backend.data.report_content import REPORT_BLOCKS, REPORT_METADATA
from backend.data.model_results import (
    MODEL_RESULTS,
    DATASET_STATS,
    SAMPLE_REVIEWS,
)
from backend.data.article_data import ARTICLE_INFO


def seed_report_sections():
    """Poblar tabla analisis_sentimi_report_sections."""
    rows = []
    for idx, (key, block) in enumerate(REPORT_BLOCKS.items()):
        rows.append({
            "key": key,
            "titulo": block["titulo"],
            "contenido": block["contenido"],
            "sort_order": idx,
        })
    result = sb.upsert("analisis_sentimi_report_sections", rows, on_conflict="key")
    print(f"  report_sections: {len(result)} rows upserted")
    return result


def seed_model_results():
    """Poblar tabla analisis_sentimi_model_results."""
    rows = []
    for model_key, data in MODEL_RESULTS.items():
        rows.append({
            "model_key": model_key,
            "nombre": data["nombre"],
            "nombre_corto": data.get("nombre_corto"),
            "accuracy": data["accuracy"],
            "precision_macro": data["precision_macro"],
            "recall_macro": data["recall_macro"],
            "f1_macro": data["f1_macro"],
            "tiempo_entrenamiento": data["tiempo_entrenamiento"],
            "confusion_matrix": json.dumps(data["confusion_matrix"]),
            "classification_report": data["classification_report"],
        })
    result = sb.upsert("analisis_sentimi_model_results", rows, on_conflict="model_key")
    print(f"  model_results: {len(result)} rows upserted")
    return result


def seed_dataset_stats():
    """Poblar tabla analisis_sentimi_dataset_stats."""
    rows = []
    for key, value in DATASET_STATS.items():
        rows.append({
            "key": key,
            "value": json.dumps(value),
        })
    result = sb.upsert("analisis_sentimi_dataset_stats", rows)
    print(f"  dataset_stats: {len(result)} rows upserted")
    return result


def seed_sample_reviews():
    """Poblar tabla analisis_sentimi_sample_reviews."""
    rows = []
    for review in SAMPLE_REVIEWS:
        rows.append({
            "texto": review["texto"],
            "sentimiento": review["sentimiento"],
            "confianza": review["confianza"],
            "prediccion_nb": review["prediccion_nb"],
            "prediccion_lr": review["prediccion_lr"],
            "prediccion_svm": review["prediccion_svm"],
        })
    result = sb.insert("analisis_sentimi_sample_reviews", rows)
    print(f"  sample_reviews: {len(result)} rows inserted")
    return result


def seed_article():
    """Poblar tabla analisis_sentimi_article."""
    rows = []
    for key, value in ARTICLE_INFO.items():
        rows.append({
            "key": key,
            "value": json.dumps(value, ensure_ascii=False),
        })
    result = sb.upsert("analisis_sentimi_article", rows)
    print(f"  article: {len(result)} rows upserted")
    return result


def seed_report_metadata():
    """Poblar tabla analisis_sentimi_report_metadata."""
    rows = []
    for key, value in REPORT_METADATA.items():
        rows.append({
            "key": key,
            "value": value,
        })
    result = sb.upsert("analisis_sentimi_report_metadata", rows)
    print(f"  report_metadata: {len(result)} rows upserted")
    return result


def main():
    if not sb.is_configured():
        print("ERROR: Supabase no está configurado.")
        print("Configura SUPABASE_URL y SUPABASE_ANON_KEY en .env")
        sys.exit(1)

    print(f"Supabase URL: {sb.SUPABASE_URL}")
    print("Iniciando seed...\n")

    seed_report_sections()
    seed_model_results()
    seed_dataset_stats()
    seed_sample_reviews()
    seed_article()
    seed_report_metadata()

    print("\nSeed completado.")


if __name__ == "__main__":
    main()
