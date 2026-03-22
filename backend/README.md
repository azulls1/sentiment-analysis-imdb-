# Backend - IMDb Sentiment Analysis API

FastAPI-based REST API for sentiment analysis on IMDb movie reviews using classical ML models (Naive Bayes, Logistic Regression, SVM) with TF-IDF vectorization.

## Architecture

```
backend/
├── main.py                 # FastAPI app entry point, middleware, CORS
├── logging_config.py       # Structured logging configuration
├── routers/                # API route handlers
│   ├── dataset.py          # /api/dataset/* - Dataset exploration
│   ├── model.py            # /api/model/*   - ML model operations
│   ├── article.py          # /api/article/* - Reference article data
│   ├── report.py           # /api/report/*  - Academic report content
│   ├── argilla.py          # /api/argilla/* - Zero-shot classification
│   └── export.py           # /api/export/*  - PDF/notebook/zip export
├── services/               # Business logic
│   ├── model_service.py    # ML model loading, prediction, caching
│   ├── pdf_service.py      # PDF generation (xhtml2pdf + WeasyPrint)
│   ├── notebook_service.py # Jupyter notebook generation
│   ├── argilla_service.py  # Zero-shot classification service
│   └── db_service.py       # Supabase + local fallback data layer
├── data/                   # Pre-computed data and report content
│   ├── model_results.py    # Cached model metrics for fast retrieval
│   └── report_content.py   # Academic report HTML blocks (Jinja2)
├── models/                 # Serialized ML models (*.joblib)
├── scripts/
│   └── train_and_save.py   # Train NB/LR/SVM on IMDb and serialize
├── templates/              # Jinja2 templates for PDF generation
└── tests/                  # pytest test suite
    ├── test_endpoints.py   # API endpoint tests
    └── test_services.py    # Service unit tests
```

## API Endpoints

### Health

```bash
# Health check
curl http://localhost:8000/api/health
# Response: {"status": "healthy"}
```

### Dataset (`/api/dataset`)

```bash
# Get dataset statistics (size, balance, vocabulary)
curl http://localhost:8000/api/dataset/stats

# Get sample reviews from the dataset
curl http://localhost:8000/api/dataset/samples
```

### Model (`/api/model`)

```bash
# Trigger model training (downloads IMDb dataset, trains 3 models)
curl -X POST http://localhost:8000/api/model/train

# Get model training status
curl http://localhost:8000/api/model/status

# Predict sentiment for a text
curl -X POST http://localhost:8000/api/model/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "This movie was absolutely fantastic!", "model": "svm"}'
# Response: {"sentiment": "positive", "confidence": 0.92, "model": "svm"}

# Get model comparison metrics (accuracy, F1, precision, recall)
curl http://localhost:8000/api/model/comparison

# Get detailed model results with confusion matrices
curl http://localhost:8000/api/model/results
```

### Article (`/api/article`)

```bash
# Get reference article summary (Keerthi Kumar & Harish, 2019)
curl http://localhost:8000/api/article/summary
```

### Report (`/api/report`)

```bash
# Get full academic report content (HTML blocks)
curl http://localhost:8000/api/report/content
```

### Argilla (`/api/argilla`)

```bash
# Zero-shot classification with custom labels
curl -X POST http://localhost:8000/api/argilla/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "I loved this film", "labels": ["positive", "negative", "neutral"]}'

# Argilla service health
curl http://localhost:8000/api/argilla/health
```

### Export (`/api/export`)

```bash
# Download academic report as PDF
curl -o report.pdf http://localhost:8000/api/export/pdf

# Download Jupyter notebook with analysis
curl -o analysis.ipynb http://localhost:8000/api/export/notebook

# Download all deliverables as ZIP
curl -o deliverables.zip http://localhost:8000/api/export/zip
```

## Setup

### Prerequisites

- Python 3.10+
- pip

### Installation

```bash
# From project root
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

pip install -r requirements.txt
```

### Environment Variables

See `.env.example` in the project root. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `CORS_ORIGINS` | No | Allowed origins (default: `http://localhost:4200`) |
| `SUPABASE_URL` | Yes* | Supabase project URL (*falls back to local data) |
| `SUPABASE_ANON_KEY` | Yes* | Supabase anonymous key |
| `RANDOM_SEED` | No | Seed for reproducible training (default: `42`) |
| `API_KEY` | No | API key for protected endpoints |

### Running

```bash
# Development (with auto-reload)
python -m uvicorn backend.main:app --reload --port 8000

# Production
uvicorn backend.main:app --host 0.0.0.0 --port 8000

# With Docker
docker compose up backend
```

### Training Models

```bash
# Train all 3 models on IMDb dataset (downloads ~80MB on first run)
python -m backend.scripts.train_and_save

# Output: backend/models/*.joblib (4 files)
```

## Testing

```bash
# Run all backend tests
python -m pytest backend/tests/ -v

# Run with coverage
python -m pytest backend/tests/ -v --cov=backend --cov-report=term-missing

# Run specific test file
python -m pytest backend/tests/test_endpoints.py -v
```

## Swagger Documentation

Interactive API docs are available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
