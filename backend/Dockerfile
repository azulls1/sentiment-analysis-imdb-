FROM python:3.12-slim

WORKDIR /app

# System deps: WeasyPrint (GTK/Pango) + curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gcc build-essential pkg-config \
    libpango1.0-dev libcairo2-dev libgdk-pixbuf-2.0-dev \
    libffi-dev shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1
