from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.services.model_service import (
    get_model_results,
    get_comparison,
    get_training_status,
    start_training,
    predict_sentiment,
)

router = APIRouter(prefix="/api/model", tags=["model"])


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to analyze (1-10000 chars)")


@router.post("/train")
def train_models():
    """Inicia el entrenamiento de los tres clasificadores (NB, LR, SVM). Retorna datos pre-calculados."""
    try:
        return start_training()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting training: {str(e)}")


@router.get("/status")
def training_status():
    """Retorna el estado actual del entrenamiento (pasos completados, progreso, resultados)."""
    try:
        return get_training_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving training status: {str(e)}")


@router.post("/predict")
def predict(request: PredictRequest):
    """Predice el sentimiento de un texto en ingles usando SVM real o heuristica de keywords."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        return predict_sentiment(request.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting sentiment: {str(e)}")


@router.get("/comparison")
def model_comparison():
    """Retorna tabla comparativa de los tres modelos (accuracy, precision, recall, F1, tiempo)."""
    try:
        return get_comparison()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving comparison: {str(e)}")


@router.get("/results")
def model_results():
    """Retorna metricas detalladas de cada modelo incluyendo matrices de confusion."""
    try:
        return get_model_results()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving results: {str(e)}")
