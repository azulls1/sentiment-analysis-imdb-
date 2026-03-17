# ADR-007: SVM Real con Fallback Heuristica

**Fecha:** 2026-03-01
**Estado:** Accepted

## Contexto

La prediccion de sentimiento inicialmente usaba solo una heuristica basada en keywords positivas/negativas con deteccion de negacion. Esto funciona para demos pero no es un modelo ML real.

## Decision

Implementar carga lazy de modelo SVM serializado con fallback a heuristica:

```python
# model_service.py
def predict_sentiment(text):
    if _load_ml_models():  # Intenta cargar SVM + vectorizer de backend/models/
        return _predict_with_ml(text)   # SVM real via joblib
    return _predict_with_heuristic(text)  # Keyword heuristic fallback
```

## Modelos Serializados

```
backend/models/
  tfidf_vectorizer.joblib  # TF-IDF vectorizer entrenado
  svm.joblib               # LinearSVC entrenado
  .gitkeep
```

## Script de Entrenamiento

`backend/scripts/train_and_save.py` entrena y serializa los modelos.

## Consecuencias

### Positivas
- Prediccion real con SVM entrenado (accuracy 89.68%)
- Confidence score via sigmoid de decision function
- Graceful degradation: si no hay modelos, usa heuristica
- Modelos excluidos de git (.gitignore: *.joblib)

### Negativas
- Archivos joblib pueden ser grandes (~100MB para vectorizer)
- Primera prediccion tiene latencia de carga
