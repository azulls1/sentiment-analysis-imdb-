FROM python:3.12-slim

# Build metadata
LABEL maintainer="Samael Hernandez <shernandez@iagentek.com.mx>"
LABEL version="2.1.0"
LABEL description="IMDb Sentiment Analysis API - FastAPI backend with ML models (NB, LR, SVM)"

ARG APP_ENV=production
ARG PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps: WeasyPrint (GTK/Pango) + curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gcc build-essential pkg-config \
    libpango1.0-dev libcairo2-dev libgdk-pixbuf-2.0-dev \
    libffi-dev shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# NOTE (FIX 7): torch (~2.5 GB) is required by transformers for the sentiment
# analysis pipeline.  A future optimisation could use torch-cpu or ONNX Runtime
# to cut the image size significantly, but the full torch package is kept for
# now to guarantee compatibility with all model operations.
RUN pip install --no-cache-dir -r requirements.txt

# Create non-root user for security
RUN useradd -m -u 1000 appuser

COPY . .

# Ensure model directory is writable by appuser
RUN mkdir -p backend/models && chown -R appuser:appuser backend/models

# Switch to non-root user
USER appuser

EXPOSE 8000

ENV APP_ENV=${APP_ENV}

# FIX 3: Run with 4 workers for better concurrency and throughput
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1
