"""Router for ML model training, prediction and comparison endpoints."""

import logging
import time
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field
from backend.services.model_service import (
    get_model_results,
    get_comparison,
    get_training_status,
    start_training,
    predict_sentiment,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/model", tags=["model"])


class PredictScores(BaseModel):
    """Score breakdown for each sentiment class."""

    positivo: float = Field(..., ge=0, le=1, description="Positive sentiment score")
    negativo: float = Field(..., ge=0, le=1, description="Negative sentiment score")


class PredictResponse(BaseModel):
    """Response schema for the prediction endpoint."""

    texto: str = Field(..., description="Sanitized input text")
    sentimiento: str = Field(..., description="Predicted sentiment label (positivo/negativo)")
    confianza: float = Field(..., ge=0, le=1, description="Confidence score between 0 and 1")
    scores: PredictScores = Field(..., description="Per-class score breakdown")
    modelo: str = Field(..., description="Model used for prediction (e.g. svm-tfidf, keyword-heuristic)")
    idioma: str = Field(..., description="Detected language of the input text (en/es)")
    inference_time_ms: float = Field(
        default=0.0,
        ge=0,
        description="Inference wall-clock time in milliseconds",
    )


class PredictRequest(BaseModel):
    """Payload for the prediction endpoint."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Text to analyze (1-10000 chars)",
        json_schema_extra={"examples": ["This movie was absolutely fantastic! Great acting and plot."]},
    )


@router.post("/train", status_code=201)
def train_models() -> dict:
    """Start training of the three classifiers (NB, LR, SVM). Returns pre-calculated data.

    Rate limit recommendation: 5 req/min (heavy operation).
    """
    try:
        return start_training()
    except ValueError as e:
        logger.error("Validation error in train_models: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        logger.error("File not found in train_models: %s", e)
        raise HTTPException(status_code=404, detail="Required model file not found")
    except TimeoutError as e:
        logger.error("Timeout in train_models: %s", e)
        raise HTTPException(status_code=504, detail="Training timed out")
    except Exception as e:
        logger.error("Error in train_models: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/status")
def training_status() -> dict:
    """Return current training status (completed steps, progress, results).

    Rate limit recommendation: 30 req/min.
    """
    try:
        return get_training_status()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        logger.error("Error in training_status: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.post("/predict", status_code=201, response_model=PredictResponse)
def predict(request: PredictRequest) -> dict:
    """Predict the sentiment of an English/Spanish text using SVM or keyword heuristic.

    Rate limit recommendation: 20 req/min.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        start = time.perf_counter()
        result = predict_sentiment(request.text)
        result["inference_time_ms"] = round((time.perf_counter() - start) * 1000, 2)
        return result
    except ValueError as e:
        logger.error("Validation error in predict: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        logger.error("File not found in predict: %s", e)
        raise HTTPException(status_code=404, detail="Required model file not found")
    except TimeoutError as e:
        logger.error("Timeout in predict: %s", e)
        raise HTTPException(status_code=504, detail="Prediction timed out")
    except Exception as e:
        logger.error("Error in predict: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/comparison")
def model_comparison(response: Response) -> dict:
    """Return a comparison table of the three models (accuracy, precision, recall, F1, time).

    Rate limit recommendation: 60 req/min (cached / immutable data).
    """
    try:
        response.headers["Cache-Control"] = "public, max-age=3600, immutable"
        return get_comparison()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        logger.error("Error in model_comparison: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/results")
def model_results(response: Response) -> dict:
    """Return detailed metrics for each model including confusion matrices.

    Rate limit recommendation: 60 req/min (cached / immutable data).
    """
    try:
        response.headers["Cache-Control"] = "public, max-age=3600, immutable"
        return get_model_results()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        logger.error("Error in model_results: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")
