"""Shared fixtures for backend tests."""

import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app


@pytest.fixture
def client():
    """FastAPI test client fixture."""
    return TestClient(app)


@pytest.fixture
def authed_client(monkeypatch):
    """FastAPI test client with API_KEY set and X-API-Key header injected.

    Patches the settings object so the middleware sees an active API key,
    then returns a thin wrapper that always sends the correct header.
    """
    from backend.config import _settings

    test_key = "test-secret-key-12345"
    monkeypatch.setattr(_settings, "api_key", test_key)

    raw_client = TestClient(app)

    class _AuthedClient:
        """Wraps TestClient and injects X-API-Key on every request."""

        def __init__(self, inner, key):
            self._inner = inner
            self._key = key

        def _headers(self, extra=None):
            h = {"X-API-Key": self._key}
            if extra:
                h.update(extra)
            return h

        def get(self, url, **kw):
            kw.setdefault("headers", {}).update(self._headers())
            return self._inner.get(url, **kw)

        def post(self, url, **kw):
            kw.setdefault("headers", {}).update(self._headers())
            return self._inner.post(url, **kw)

    return _AuthedClient(raw_client, test_key)


@pytest.fixture
def unauthed_client(monkeypatch):
    """Client where API_KEY is set but the request does NOT carry the key."""
    from backend.config import _settings

    test_key = "test-secret-key-12345"
    monkeypatch.setattr(_settings, "api_key", test_key)
    return TestClient(app)
