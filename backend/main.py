import os
import time
import logging
from collections import defaultdict
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

from backend.logging_config import setup_logging
from backend.routers import dataset, article, report, model, export, argilla

load_dotenv()
setup_logging()

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Rate Limit Middleware
# ---------------------------------------------------------------------------
class RateLimitMiddleware(BaseHTTPMiddleware):
    """Limits each IP to 60 requests per 60-second sliding window."""

    LIMIT = 60
    WINDOW = 60  # seconds

    def __init__(self, app):
        super().__init__(app)
        self._requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - self.WINDOW

        # Purge timestamps outside the current window
        self._requests[ip] = [t for t in self._requests[ip] if t > window_start]

        if len(self._requests[ip]) >= self.LIMIT:
            return Response(
                content='{"detail":"Too many requests. Please slow down."}',
                status_code=429,
                media_type="application/json",
            )

        self._requests[ip].append(now)
        return await call_next(request)


# ---------------------------------------------------------------------------
# Security Headers Middleware
# ---------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds defensive HTTP security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response


# ---------------------------------------------------------------------------
# Request Logging Middleware
# ---------------------------------------------------------------------------
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs method, path, status code, and duration for every request."""

    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        duration_ms = (time.time() - start) * 1000
        logger.info(
            "method=%s path=%s status_code=%d duration_ms=%.1f",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Análisis de Sentimientos - IMDb",
    description="API para análisis de sentimientos en reseñas de películas IMDb",
    version="1.0.0",
)

# CORS (must be registered before other middleware so preflight passes through)
origins = os.getenv("CORS_ORIGINS", "http://localhost:4200").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware (outermost → innermost order via add_middleware stack)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# Routers
app.include_router(dataset.router)
app.include_router(article.router)
app.include_router(report.router)
app.include_router(model.router)
app.include_router(export.router)
app.include_router(argilla.router)


@app.get("/")
def root():
    """Endpoint raiz con informacion basica de la API y enlace a la documentacion."""
    return {
        "message": "API de Análisis de Sentimientos - IMDb Movie Reviews",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health():
    """Health check para verificar que el servidor esta activo."""
    return {"status": "ok"}
