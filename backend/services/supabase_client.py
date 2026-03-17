"""
Cliente Supabase para la conexión con la base de datos PostgreSQL.
Usa httpx para llamadas REST directas al API de Supabase.
"""
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

_REST_SUFFIX = "/rest/v1"


def _get_headers(use_service_key: bool = False) -> dict:
    key = SUPABASE_SERVICE_KEY if use_service_key else SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _base_url() -> str:
    return f"{SUPABASE_URL}{_REST_SUFFIX}"


def is_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_ANON_KEY)


def select(table: str, params: dict | None = None) -> list[dict]:
    """SELECT rows from a Supabase table. Returns list of dicts."""
    if not is_configured():
        return []
    try:
        url = f"{_base_url()}/{table}"
        r = httpx.get(url, headers=_get_headers(), params=params or {}, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception:
        return []


def upsert(
    table: str,
    rows: list[dict],
    on_conflict: str = "key",
    use_service_key: bool = True,
) -> list[dict]:
    """UPSERT rows into a Supabase table. Returns inserted rows."""
    if not is_configured():
        return []
    url = f"{_base_url()}/{table}"
    headers = _get_headers(use_service_key=use_service_key)
    headers["Prefer"] = "resolution=merge-duplicates,return=representation"
    params = {"on_conflict": on_conflict}
    try:
        r = httpx.post(url, headers=headers, json=rows, params=params, timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"[supabase] upsert error on {table}: {e}")
        return []


def insert(table: str, rows: list[dict], use_service_key: bool = True) -> list[dict]:
    """INSERT rows into a Supabase table."""
    if not is_configured():
        return []
    url = f"{_base_url()}/{table}"
    headers = _get_headers(use_service_key=use_service_key)
    try:
        r = httpx.post(url, headers=headers, json=rows, timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"[supabase] insert error on {table}: {e}")
        return []
