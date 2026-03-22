"""
Supabase REST client.

Uses ``httpx`` for direct HTTP calls to the Supabase PostgREST API.
Falls back silently when credentials are not configured.
"""

import logging
import os
import time
from typing import Dict, List, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

_REST_SUFFIX = "/rest/v1"

_MAX_RETRIES = 3  # total attempts (1 initial + 2 retries)
_MAX_BACKOFF = 8  # seconds — cap for exponential delay

# ---------------------------------------------------------------------------
# Connection-pooled HTTP client (FIX 6: reuse connections across requests)
# ---------------------------------------------------------------------------
_http_client = httpx.Client(
    timeout=30,
    limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
)


def _get_headers(use_service_key: bool = False) -> Dict[str, str]:
    """Build authorisation headers for the Supabase REST API.

    Args:
        use_service_key: When ``True`` use the service-role key (bypasses RLS).

    Returns:
        Dictionary of HTTP headers.
    """
    key = SUPABASE_SERVICE_KEY if use_service_key else SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _base_url() -> str:
    """Return the base PostgREST URL."""
    return f"{SUPABASE_URL}{_REST_SUFFIX}"


def is_configured() -> bool:
    """Return ``True`` if Supabase URL and anon key are set."""
    return bool(SUPABASE_URL and SUPABASE_ANON_KEY)


def select(table: str, params: Optional[Dict] = None) -> List[Dict]:
    """SELECT rows from a Supabase table.

    Args:
        table: Table name.
        params: Optional query-string parameters (filters, ordering).

    Returns:
        List of row dictionaries, or an empty list on failure.
    """
    if not is_configured():
        return []
    url = f"{_base_url()}/{table}"

    for attempt in range(_MAX_RETRIES):
        try:
            r = _http_client.get(url, headers=_get_headers(), params=params or {}, timeout=10)
            r.raise_for_status()
            return r.json()
        except (httpx.TimeoutException, httpx.ConnectError) as exc:
            delay = min(2 ** attempt, _MAX_BACKOFF)
            if attempt < _MAX_RETRIES - 1:
                logger.warning(
                    "Supabase SELECT retry %d/%d for table '%s' after %s (backoff %ds): %s",
                    attempt + 1,
                    _MAX_RETRIES,
                    table,
                    type(exc).__name__,
                    delay,
                    exc,
                )
                time.sleep(delay)
                continue
            logger.error(
                "Supabase SELECT failed for table '%s' after %d retries: %s",
                table,
                _MAX_RETRIES,
                exc,
            )
        except httpx.HTTPStatusError as exc:
            logger.error(
                "Supabase SELECT HTTP error for table '%s': %s",
                table,
                exc,
            )
            return []
        except Exception as exc:
            logger.error(
                "Supabase SELECT unexpected error for table '%s': %s",
                table,
                exc,
                exc_info=True,
            )
            return []
    return []


def upsert(
    table: str,
    rows: List[Dict],
    on_conflict: str = "key",
    use_service_key: bool = True,
) -> List[Dict]:
    """UPSERT rows into a Supabase table.

    Args:
        table: Target table name.
        rows: List of row dictionaries to upsert.
        on_conflict: Column(s) used for conflict resolution.
        use_service_key: Use the service-role key to bypass RLS.

    Returns:
        List of upserted rows, or an empty list on failure.
    """
    if not is_configured():
        return []
    url = f"{_base_url()}/{table}"
    headers = _get_headers(use_service_key=use_service_key)
    headers["Prefer"] = "resolution=merge-duplicates,return=representation"
    params = {"on_conflict": on_conflict}

    for attempt in range(_MAX_RETRIES):
        try:
            r = _http_client.post(url, headers=headers, json=rows, params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except (httpx.TimeoutException, httpx.ConnectError) as exc:
            delay = min(2 ** attempt, _MAX_BACKOFF)
            if attempt < _MAX_RETRIES - 1:
                logger.warning(
                    "Supabase UPSERT retry %d/%d for table '%s' after %s (backoff %ds): %s",
                    attempt + 1,
                    _MAX_RETRIES,
                    table,
                    type(exc).__name__,
                    delay,
                    exc,
                )
                time.sleep(delay)
                continue
            logger.error(
                "Supabase UPSERT failed for table '%s' after %d retries: %s",
                table,
                _MAX_RETRIES,
                exc,
            )
        except httpx.HTTPStatusError as exc:
            logger.error(
                "Supabase UPSERT HTTP error for table '%s': %s",
                table,
                exc,
            )
            return []
        except Exception as exc:
            logger.error(
                "Supabase UPSERT unexpected error for table '%s': %s",
                table,
                exc,
                exc_info=True,
            )
            return []
    return []


def insert(table: str, rows: List[Dict], use_service_key: bool = True) -> List[Dict]:
    """INSERT rows into a Supabase table.

    Args:
        table: Target table name.
        rows: List of row dictionaries to insert.
        use_service_key: Use the service-role key to bypass RLS.

    Returns:
        List of inserted rows, or an empty list on failure.
    """
    if not is_configured():
        return []
    url = f"{_base_url()}/{table}"
    headers = _get_headers(use_service_key=use_service_key)

    for attempt in range(_MAX_RETRIES):
        try:
            r = _http_client.post(url, headers=headers, json=rows, timeout=30)
            r.raise_for_status()
            return r.json()
        except (httpx.TimeoutException, httpx.ConnectError) as exc:
            delay = min(2 ** attempt, _MAX_BACKOFF)
            if attempt < _MAX_RETRIES - 1:
                logger.warning(
                    "Supabase INSERT retry %d/%d for table '%s' after %s (backoff %ds): %s",
                    attempt + 1,
                    _MAX_RETRIES,
                    table,
                    type(exc).__name__,
                    delay,
                    exc,
                )
                time.sleep(delay)
                continue
            logger.error(
                "Supabase INSERT failed for table '%s' after %d retries: %s",
                table,
                _MAX_RETRIES,
                exc,
            )
        except httpx.HTTPStatusError as exc:
            logger.error(
                "Supabase INSERT HTTP error for table '%s': %s",
                table,
                exc,
            )
            return []
        except Exception as exc:
            logger.error(
                "Supabase INSERT unexpected error for table '%s': %s",
                table,
                exc,
                exc_info=True,
            )
            return []
    return []
