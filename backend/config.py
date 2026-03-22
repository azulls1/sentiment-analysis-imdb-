"""
Centralised application configuration using pydantic BaseSettings.

Environment variables are loaded from .env automatically.  All settings are
validated at import-time so misconfiguration is caught early.

Secrets resolution order (FIX 1 — vault integration):
1. Docker secrets at ``/run/secrets/<name>``
2. Environment variable
3. Default value
"""

from __future__ import annotations

import os
from typing import List, Optional

from pydantic import Field, ConfigDict
from pydantic_settings import BaseSettings


def _load_secret(name: str, env_var: str, default: str = "") -> str:
    """Load a secret with Docker-secrets-first resolution.

    Resolution order:
    1. Docker secret file at ``/run/secrets/{name}``
    2. Environment variable ``env_var``
    3. Provided ``default``

    This allows seamless operation in both local dev (env vars / .env)
    and production Docker Swarm / Kubernetes (mounted secrets).
    """
    secret_path = f"/run/secrets/{name}"
    if os.path.exists(secret_path):
        try:
            with open(secret_path, "r") as fh:
                value = fh.read().strip()
            if value:
                return value
        except OSError:
            pass  # fall through to env var
    return os.getenv(env_var, default)


class Settings(BaseSettings):
    """Application settings validated from environment variables."""

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Core
    # ------------------------------------------------------------------
    app_title: str = "Analisis de Sentimientos - IMDb"
    app_version: str = "1.0.0"
    cors_origins: str = Field(
        default="http://localhost:4200",
        description="Comma-separated list of allowed CORS origins",
    )

    # ------------------------------------------------------------------
    # Security (resolved via Docker secrets -> env var -> default)
    # ------------------------------------------------------------------
    api_key: Optional[str] = Field(
        default=None,
        description="Optional API key. If set, requests must include X-API-Key header.",
    )

    # ------------------------------------------------------------------
    # Rate Limiting
    # ------------------------------------------------------------------
    rate_limit_requests: int = Field(default=200, description="Max requests per window per IP")
    rate_limit_window: int = Field(default=60, description="Sliding window in seconds")

    # ------------------------------------------------------------------
    # Database / Supabase (resolved via Docker secrets -> env var -> default)
    # ------------------------------------------------------------------
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""

    # ------------------------------------------------------------------
    # Resilience
    # ------------------------------------------------------------------
    request_timeout: int = Field(default=30, description="Request timeout in seconds")
    max_rate_limit_ips: int = Field(default=10000, description="Max unique IPs to track in rate limiter")

    # ------------------------------------------------------------------
    # Environment
    # ------------------------------------------------------------------
    app_env: str = Field(default="development", description="Application environment")

    # ------------------------------------------------------------------
    # ML
    # ------------------------------------------------------------------
    random_seed: int = Field(default=42, description="Random seed for reproducibility")

    # ------------------------------------------------------------------
    # Monitoring
    # ------------------------------------------------------------------
    sentry_dsn: Optional[str] = Field(
        default=None,
        description="Sentry DSN for error tracking. Leave empty to disable.",
    )

    # Helpers ---------------------------------------------------------------

    def get_cors_origins(self) -> List[str]:
        """Return CORS origins as a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


def _build_settings() -> Settings:
    """Build Settings with Docker-secret-aware defaults for sensitive fields.

    Pydantic still validates the final values; this just ensures Docker
    secrets are checked *before* env vars for the four sensitive fields.
    """
    overrides: dict = {}

    secret_url = _load_secret("supabase_url", "SUPABASE_URL")
    if secret_url:
        overrides["supabase_url"] = secret_url

    secret_anon = _load_secret("supabase_anon_key", "SUPABASE_ANON_KEY")
    if secret_anon:
        overrides["supabase_anon_key"] = secret_anon

    secret_svc = _load_secret("supabase_service_key", "SUPABASE_SERVICE_KEY")
    if secret_svc:
        overrides["supabase_service_key"] = secret_svc

    secret_api = _load_secret("api_key", "API_KEY")
    if secret_api:
        overrides["api_key"] = secret_api

    return Settings(**overrides)


def get_settings() -> Settings:
    """Return a cached Settings instance (created once per process)."""
    return _settings


# Eagerly validate at import time
_settings = _build_settings()
