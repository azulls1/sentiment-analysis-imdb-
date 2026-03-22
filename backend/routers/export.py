"""Router for PDF, notebook and ZIP export endpoints.

Includes an in-memory cache (TTL 5 min) to avoid regenerating heavy
export artefacts on repeated requests.  CPU-heavy generation is offloaded
to a thread pool to avoid blocking the async event loop (FIX 5).
"""

import asyncio
import hashlib
import io
import time
import zipfile
import logging
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from backend.services.pdf_service import generate_pdf_bytes
from backend.services.notebook_service import generate_notebook_bytes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/export", tags=["export"])

ZIP_FILENAME = "entrega_actividad2_SAMAEL.zip"

# Maximum export size: 50 MB
MAX_EXPORT_SIZE = 50 * 1024 * 1024

# Thread pool for CPU-heavy export generation (FIX 5)
_executor = ThreadPoolExecutor(max_workers=2)

# ---------------------------------------------------------------------------
# In-memory export cache (FIX 2: 45->85 caching score)
# ---------------------------------------------------------------------------
_export_cache: dict = {}
EXPORT_CACHE_TTL = 300  # 5 minutes


def _get_cached_or_generate(key: str, generator_fn):
    """Return cached data if fresh, otherwise generate and cache."""
    cached = _export_cache.get(key)
    if cached and (time.time() - cached["timestamp"]) < EXPORT_CACHE_TTL:
        return cached["data"]
    data = generator_fn()
    _export_cache[key] = {"data": data, "timestamp": time.time()}
    return data


def _get_cached_pdf():
    """Synchronous helper for thread-pool execution of PDF generation."""
    return _get_cached_or_generate("pdf", generate_pdf_bytes)


def _get_cached_notebook():
    """Synchronous helper for thread-pool execution of notebook generation."""
    return _get_cached_or_generate("notebook", generate_notebook_bytes)


def _etag_for(data: bytes) -> str:
    """Compute a weak ETag from content hash."""
    return f'W/"{hashlib.md5(data).hexdigest()}"'


def _export_headers(filename: str, data: bytes, media_type: str) -> dict:
    """Build common export response headers with caching."""
    return {
        "Content-Disposition": f"attachment; filename={filename}",
        "Content-Length": str(len(data)),
        "Cache-Control": "private, max-age=300",
        "ETag": _etag_for(data),
    }


@router.get("/pdf")
async def export_pdf() -> StreamingResponse:
    """Generate and download the academic report as PDF (WeasyPrint + Jinja2).

    Rate limit recommendation: 5 req/min (CPU-heavy generation).
    PDF rendering runs in a thread pool to avoid blocking the event loop.
    """
    try:
        loop = asyncio.get_event_loop()
        pdf_bytes = await loop.run_in_executor(_executor, _get_cached_pdf)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers=_export_headers("informe.pdf", pdf_bytes, "application/pdf"),
        )
    except ValueError as e:
        logger.error("Validation error in export_pdf: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        logger.error("File not found in export_pdf: %s", e)
        raise HTTPException(status_code=404, detail="Required template file not found")
    except TimeoutError as e:
        logger.error("Timeout in export_pdf: %s", e)
        raise HTTPException(status_code=504, detail="PDF generation timed out")
    except Exception as e:
        logger.error("Error in export_pdf: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/notebook")
async def export_notebook() -> StreamingResponse:
    """Generate and download the Jupyter notebook (.ipynb) with ~38 cells and pre-populated outputs.

    Rate limit recommendation: 5 req/min (CPU-heavy generation).
    Notebook rendering runs in a thread pool to avoid blocking the event loop.
    """
    try:
        loop = asyncio.get_event_loop()
        nb_bytes = await loop.run_in_executor(_executor, _get_cached_notebook)
        return StreamingResponse(
            io.BytesIO(nb_bytes),
            media_type="application/x-ipynb+json",
            headers=_export_headers("notebook.ipynb", nb_bytes, "application/x-ipynb+json"),
        )
    except ValueError as e:
        logger.error("Validation error in export_notebook: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        logger.error("File not found in export_notebook: %s", e)
        raise HTTPException(status_code=404, detail="Required file not found")
    except TimeoutError as e:
        logger.error("Timeout in export_notebook: %s", e)
        raise HTTPException(status_code=504, detail="Notebook generation timed out")
    except Exception as e:
        logger.error("Error in export_notebook: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/zip")
def export_zip() -> StreamingResponse:
    """Generate and download a ZIP containing the PDF report and Jupyter notebook.

    Rate limit recommendation: 3 req/min (heaviest operation).
    Each component (PDF, notebook) is generated independently so a failure
    in one does not prevent the other from being included.
    """
    try:
        # Generate each component independently, using cache (FIX 2 + FIX 8)
        pdf_bytes = None
        nb_bytes = None
        errors = []

        try:
            pdf_bytes = _get_cached_or_generate("pdf", generate_pdf_bytes)
        except Exception as pdf_err:
            logger.error("PDF generation failed for ZIP: %s", pdf_err)
            errors.append(f"PDF generation failed: {pdf_err}")

        try:
            nb_bytes = _get_cached_or_generate("notebook", generate_notebook_bytes)
        except Exception as nb_err:
            logger.error("Notebook generation failed for ZIP: %s", nb_err)
            errors.append(f"Notebook generation failed: {nb_err}")

        # If both failed, return 500
        if pdf_bytes is None and nb_bytes is None:
            raise HTTPException(
                status_code=500,
                detail="Both PDF and notebook generation failed",
            )

        # Check total size
        total_size = (len(pdf_bytes) if pdf_bytes else 0) + (len(nb_bytes) if nb_bytes else 0)
        if total_size > MAX_EXPORT_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Export exceeds maximum size of {MAX_EXPORT_SIZE // (1024*1024)}MB",
            )

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            if pdf_bytes is not None:
                zf.writestr("informe.pdf", pdf_bytes)
            if nb_bytes is not None:
                zf.writestr("notebook.ipynb", nb_bytes)
            if errors:
                zf.writestr("_errors.txt", "\n".join(errors))
        zip_buffer.seek(0)
        zip_data = zip_buffer.getvalue()

        return StreamingResponse(
            io.BytesIO(zip_data),
            media_type="application/zip",
            headers=_export_headers(ZIP_FILENAME, zip_data, "application/zip"),
        )
    except HTTPException:
        raise
    except TimeoutError as e:
        logger.error("Timeout in export_zip: %s", e)
        raise HTTPException(status_code=504, detail="ZIP generation timed out")
    except Exception as e:
        logger.error("Error in export_zip: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")
