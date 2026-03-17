# ADR-003: Datos Pre-calculados con Prediccion en Vivo

**Fecha:** 2026-02-01
**Estado:** Accepted

## Contexto

El entrenamiento de 3 modelos ML (NB, LR, SVM) sobre 50,000 resenas IMDb toma varios minutos. Sin embargo, el dashboard y las metricas deben cargarse instantaneamente. Ademas, necesitamos prediccion en tiempo real para textos individuales.

## Decision

Modelo hibrido:
1. **Datos pre-calculados** en `backend/data/model_results.py`: Resultados de NB (85.12%), LR (89.36%), SVM (89.68%), matrices de confusion, classification reports, comparison table
2. **Prediccion en vivo** en `backend/services/model_service.py`: Carga SVM serializado via joblib, fallback a keyword heuristic

## Datos Pre-calculados

- `DATASET_STATS`: 50,000 resenas, train/test 25,000/25,000
- `SAMPLE_REVIEWS`: 8 resenas con predicciones de 3 modelos
- `MODEL_RESULTS`: Metricas completas de NB, LR, SVM
- `COMPARISON_TABLE`: Tabla comparativa con analisis
- `TFIDF_PARAMS`: max_features=50,000, ngram_range=(1,2)
- `TRAINING_PROGRESS_FINAL`: Simulacion de 9 pasos completados

## Consecuencias

### Positivas
- API responde en <50ms para dashboard y metricas
- Prediccion real disponible con modelo SVM serializado (backend/models/*.joblib)
- Fallback a heuristica garantiza funcionamiento sin modelos serializados

### Negativas
- Los datos pre-calculados deben actualizarse si se re-entrena
