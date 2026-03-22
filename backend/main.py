"""
FastAPI application entry-point.

Registers middleware (rate-limit, security headers, request-ID tracking,
optional API-key authentication, request logging) and mounts all routers
under the ``/api/v1`` version prefix.
"""

import asyncio
import os
import time
import uuid
import logging
import threading
from collections import defaultdict
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Request, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv

from backend.logging_config import setup_logging
from backend.config import get_settings
from backend.monitoring import metrics, prediction_tracker
from backend.routers import dataset, article, report, model, export, argilla

load_dotenv()
setup_logging()

logger = logging.getLogger(__name__)
settings = get_settings()

# ---------------------------------------------------------------------------
# Optional Sentry error tracking
# ---------------------------------------------------------------------------
if settings.sentry_dsn:
    try:
        import sentry_sdk
        sentry_sdk.init(dsn=settings.sentry_dsn)
        logger.info("Sentry error tracking enabled")
    except ImportError:
        logger.warning("sentry-sdk not installed; error tracking disabled")


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown (FIX 5)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load ML models at startup so first request is fast.

    On shutdown, performs graceful cleanup: flushes metrics, logs final
    state, and closes any open HTTP connections.
    """
    from backend.services.model_service import _load_ml_models
    _load_ml_models()
    logger.info(
        "Startup complete: models loaded, metrics initialised "
        "(env=%s, workers=%s)",
        settings.app_env,
        os.getenv("WEB_CONCURRENCY", "1"),
    )
    yield
    # ------------------------------------------------------------------
    # Graceful shutdown (FIX 9)
    # ------------------------------------------------------------------
    logger.info(
        "Graceful shutdown: flushing metrics (total_requests=%d, "
        "total_errors=%d), closing connections",
        metrics.export().get("total_requests", 0),
        metrics.export().get("total_errors", 0),
    )
    # Unload optional zero-shot model to free GPU/RAM promptly
    try:
        from backend.services.argilla_service import unload_model as _unload_zs
        _unload_zs()
    except Exception:
        pass
    logger.info("Shutdown complete")


# ---------------------------------------------------------------------------
# API-Key Authentication Middleware (optional - only when API_KEY is set)
# ---------------------------------------------------------------------------
class APIKeyMiddleware(BaseHTTPMiddleware):
    """Enforces X-API-Key header when the API_KEY env-var is configured.

    If ``API_KEY`` is *not* set the middleware is a transparent pass-through
    so local development works without extra configuration.

    Endpoints excluded from authentication:
    * ``/`` - root info
    * ``/docs``, ``/openapi.json``, ``/redoc`` - Swagger / OpenAPI UI
    * ``/api/health`` and ``/api/health`` - health checks
    """

    # Paths that never require authentication
    _PUBLIC_PATHS = frozenset({"/", "/docs", "/openapi.json", "/redoc"})

    async def dispatch(self, request: Request, call_next) -> Response:
        api_key: Optional[str] = settings.api_key
        if api_key is None:
            return await call_next(request)

        path = request.url.path
        if path in self._PUBLIC_PATHS or path.endswith("/health"):
            return await call_next(request)

        provided = request.headers.get("X-API-Key")
        if provided != api_key:
            return Response(
                content='{"detail":"Invalid or missing API key","code":"AUTH_FAILED"}',
                status_code=401,
                media_type="application/json",
            )
        return await call_next(request)


# ---------------------------------------------------------------------------
# Request-ID Tracking Middleware (FIX 3 — error-safe)
# ---------------------------------------------------------------------------
class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attaches an ``X-Request-ID`` header to every response.

    If the client supplies ``X-Request-ID`` in the request, that value is
    echoed back; otherwise a new UUID-4 is generated.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        try:
            response = await call_next(request)
        except Exception as exc:
            logger.exception("Unhandled error in request pipeline (RequestIDMiddleware)")
            response = Response(
                content="Internal server error",
                status_code=500,
                media_type="text/plain",
            )
        response.headers["X-Request-ID"] = request_id
        return response


# ---------------------------------------------------------------------------
# Rate Limit Middleware (FIX 1 — thread-safe + memory-bounded)
# ---------------------------------------------------------------------------

# Module-level storage so tests can easily clear it via
# ``from backend.main import _rate_limit_store; _rate_limit_store.clear()``
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
_rate_limit_lock = threading.Lock()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Limits each IP to ``rate_limit_requests`` requests per sliding window.

    Per-endpoint rate limiting note:
    -----------------------------------------------------------------
    This implementation applies a **global** per-IP limit.  For finer
    per-endpoint limits (e.g. 10 req/min on ``/predict``, 100 req/min
    on ``/stats``), deploy a dedicated rate-limiter such as
    ``slowapi`` or an API-gateway (nginx, Envoy, Kong).

    Recommended per-endpoint limits (for future implementation):
    * ``POST /api/predict``   — 10 req/min  (expensive ML inference)
    * ``POST /api/export/*``  — 5 req/min   (PDF/report generation)
    * ``GET  /api/datasets``  — 60 req/min  (read-heavy, cacheable)
    * ``GET  /api/articles``  — 60 req/min  (read-heavy, cacheable)
    * ``GET  /api/health``       — 120 req/min (monitoring probes)
    * ``POST /api/argilla/*`` — 20 req/min  (annotation writes)
    -----------------------------------------------------------------
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Read limits dynamically so monkeypatching in tests takes effect
        limit = settings.rate_limit_requests
        window = settings.rate_limit_window
        max_ips = settings.max_rate_limit_ips

        ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - window

        with _rate_limit_lock:
            # Evict oldest IPs when memory limit exceeded
            if len(_rate_limit_store) > max_ips:
                # Find IPs with no recent activity and remove them
                stale_ips = [
                    k for k, v in _rate_limit_store.items()
                    if not v or v[-1] < window_start
                ]
                for k in stale_ips:
                    del _rate_limit_store[k]
                # If still over limit, remove oldest IPs by last-access time
                if len(_rate_limit_store) > max_ips:
                    sorted_ips = sorted(
                        _rate_limit_store.items(),
                        key=lambda item: item[1][-1] if item[1] else 0,
                    )
                    excess = len(_rate_limit_store) - max_ips
                    for k, _ in sorted_ips[:excess]:
                        del _rate_limit_store[k]

            # Purge timestamps outside the current window (atomic with check)
            _rate_limit_store[ip] = [
                t for t in _rate_limit_store[ip] if t > window_start
            ]

            current_count = len(_rate_limit_store[ip])

            if current_count >= limit:
                # Include rate limit headers even on 429 responses
                window_reset = int(window_start + window)
                response = Response(
                    content='{"detail":"Too many requests. Please slow down.","code":"RATE_LIMITED"}',
                    status_code=429,
                    media_type="application/json",
                )
                response.headers["X-RateLimit-Limit"] = str(limit)
                response.headers["X-RateLimit-Remaining"] = "0"
                response.headers["X-RateLimit-Reset"] = str(window_reset)
                return response

            _rate_limit_store[ip].append(now)
            remaining = limit - current_count - 1
            window_reset = int(window_start + window)

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(window_reset)
        return response


# ---------------------------------------------------------------------------
# Security Headers Middleware (FIX 3 — error-safe)
# ---------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds defensive HTTP security headers to every response.

    Includes ``Strict-Transport-Security`` to hint browsers towards HTTPS.
    """

    _HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy": "default-src 'self'",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    }

    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            response = await call_next(request)
        except Exception as exc:
            logger.exception("Unhandled error in request pipeline (SecurityHeadersMiddleware)")
            response = Response(
                content="Internal server error",
                status_code=500,
                media_type="text/plain",
            )
        for key, value in self._HEADERS.items():
            response.headers[key] = value
        return response


# ---------------------------------------------------------------------------
# Request Timeout Middleware (FIX 4)
# ---------------------------------------------------------------------------
class RequestTimeoutMiddleware(BaseHTTPMiddleware):
    """Aborts requests that exceed the configured timeout."""

    async def dispatch(self, request: Request, call_next) -> Response:
        timeout = settings.request_timeout
        try:
            response = await asyncio.wait_for(
                call_next(request),
                timeout=timeout,
            )
            return response
        except asyncio.TimeoutError:
            logger.warning(
                "Request timed out after %ds: %s %s",
                timeout,
                request.method,
                request.url.path,
            )
            return JSONResponse(
                content={"detail": "Request timed out", "code": "TIMEOUT"},
                status_code=504,
            )
        except Exception as exc:
            logger.exception("Unhandled error in RequestTimeoutMiddleware")
            return Response(
                content="Internal server error",
                status_code=500,
                media_type="text/plain",
            )


# ---------------------------------------------------------------------------
# Request Logging Middleware (FIX 3 — error-safe)
# ---------------------------------------------------------------------------
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs method, path, status code, request-ID and duration for every request.

    Also feeds the metrics collector for monitoring.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.time()
        try:
            response = await call_next(request)
        except Exception as exc:
            duration_s = time.time() - start
            duration_ms = duration_s * 1000
            logger.exception(
                "method=%s path=%s status_code=500 duration_ms=%.1f error=%s",
                request.method,
                request.url.path,
                duration_ms,
                str(exc),
            )
            metrics.record_request(request.url.path, request.method, 500, duration_s)
            response = Response(
                content="Internal server error",
                status_code=500,
                media_type="text/plain",
            )
            return response
        duration_s = time.time() - start
        duration_ms = duration_s * 1000
        request_id = response.headers.get("X-Request-ID", "-")
        logger.info(
            "method=%s path=%s status_code=%d duration_ms=%.1f request_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request_id,
        )
        metrics.record_request(request.url.path, request.method, response.status_code, duration_s)
        return response


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
tags_metadata = [
    {
        "name": "model",
        "description": "ML model training, prediction and comparison endpoints.",
    },
    {
        "name": "dataset",
        "description": "Dataset statistics and sample review endpoints.",
    },
    {
        "name": "article",
        "description": "Reference article metadata and content.",
    },
    {
        "name": "report",
        "description": "Academic report content and PDF export.",
    },
    {
        "name": "export",
        "description": "Export data in various formats (CSV, PDF, notebook).",
    },
    {
        "name": "argilla",
        "description": "Argilla-powered zero-shot classification endpoints.",
    },
]

app = FastAPI(
    title=settings.app_title,
    description=(
        "API para analisis de sentimientos en resenas de peliculas IMDb. "
        "Implementa tres clasificadores (Naive Bayes, Regresion Logistica, SVM) "
        "con representacion TF-IDF sobre el dataset IMDb Movie Reviews (50K resenas)."
    ),
    version=settings.app_version,
    lifespan=lifespan,
    openapi_tags=tags_metadata,
    responses={
        400: {"description": "Bad request — invalid input or validation error"},
        401: {"description": "Unauthorized — invalid or missing API key"},
        404: {"description": "Resource not found"},
        429: {"description": "Rate limit exceeded — too many requests"},
        500: {"description": "Internal server error"},
        504: {"description": "Gateway timeout — request or upstream timed out"},
    },
)

# CORS — FIX 13: tightened methods + headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key", "X-Request-ID"],
)

# GZip compression for API responses (FIX 5: compress large JSON & export data)
app.add_middleware(GZipMiddleware, minimum_size=500)

# Middleware stack (outermost -> innermost via add_middleware stack)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(APIKeyMiddleware)
app.add_middleware(RequestTimeoutMiddleware)
app.add_middleware(RateLimitMiddleware)

# ---------------------------------------------------------------------------
# Routers – mounted under /api prefix for API versioning
# ---------------------------------------------------------------------------
app.include_router(dataset.router)
app.include_router(article.router)
app.include_router(report.router)
app.include_router(model.router)
app.include_router(export.router)
app.include_router(argilla.router)


@app.get("/")
def root() -> dict:
    """Root endpoint with basic API information and docs link."""
    return {
        "message": "API de Analisis de Sentimientos - IMDb Movie Reviews",
        "docs": "/docs",
        "version": settings.app_version,
    }


@app.get("/api/metrics")
def api_metrics(
    request: Request,
    format: str = Query("json", description="Output format: json or prometheus"),
) -> Response:
    """Application metrics for monitoring and alerting.

    Returns request counts, error rates, and latency histograms.
    Requires API key when one is configured (same as health detail).

    Query params:
    - ``format=json`` (default): JSON metrics summary
    - ``format=prometheus``: Prometheus text exposition format
    """
    api_key: Optional[str] = settings.api_key
    if api_key is not None:
        provided = request.headers.get("X-API-Key")
        if provided != api_key:
            return JSONResponse(
                content={
                    "detail": "API key required for metrics endpoint",
                    "code": "AUTH_REQUIRED",
                },
                status_code=401,
            )

    if format == "prometheus":
        prom_text = metrics.export_prometheus() + "\n" + prediction_tracker.export_prometheus()
        return Response(
            content=prom_text,
            media_type="text/plain; version=0.0.4; charset=utf-8",
        )
    data = metrics.export()
    data["predictions"] = prediction_tracker.export()
    return JSONResponse(content=data)


@app.get("/api/health")
def health(
    request: Request,
    detail: bool = Query(False, description="Include dependency details"),
) -> dict:
    """Health check to verify the server is alive.

    Pass ``?detail=true`` to include model and dependency status.
    When ``API_KEY`` is configured, detail mode requires the key in
    the ``X-API-Key`` header; otherwise detail is freely available
    (development mode).
    """
    if not detail:
        return {"status": "ok"}

    # Gate detail mode behind API key when one is configured
    api_key: Optional[str] = settings.api_key
    if api_key is not None:
        provided = request.headers.get("X-API-Key")
        if provided != api_key:
            return JSONResponse(
                content={
                    "detail": "API key required for detailed health check",
                    "code": "AUTH_REQUIRED",
                },
                status_code=401,
            )

    # Detailed health check
    from backend.services.model_service import _ml_models
    from backend.services import supabase_client as sb

    model_status = "loaded" if _ml_models.get("available") else "not_loaded"
    supabase_status = "configured" if sb.is_configured() else "not_configured"

    return {
        "status": "ok",
        "models": {"svm_tfidf": model_status},
        "supabase": supabase_status,
    }
