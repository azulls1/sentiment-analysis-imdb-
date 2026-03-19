import io
import zipfile
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from backend.services.pdf_service import generate_pdf_bytes
from backend.services.notebook_service import generate_notebook_bytes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/export", tags=["export"])

ZIP_FILENAME = "entrega_actividad2_SAMAEL.zip"


@router.get("/pdf")
def export_pdf():
    """Genera y descarga el informe academico en formato PDF (WeasyPrint + Jinja2)."""
    try:
        pdf_bytes = generate_pdf_bytes()
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=informe.pdf"},
        )
    except Exception as e:
        logger.error("Error in export_pdf: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/notebook")
def export_notebook():
    """Genera y descarga el notebook Jupyter (.ipynb) con 38 celdas y outputs pre-poblados."""
    try:
        nb_bytes = generate_notebook_bytes()
        return StreamingResponse(
            io.BytesIO(nb_bytes),
            media_type="application/x-ipynb+json",
            headers={"Content-Disposition": "attachment; filename=notebook.ipynb"},
        )
    except Exception as e:
        logger.error("Error in export_notebook: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")


@router.get("/zip")
def export_zip():
    """Genera y descarga un ZIP con el informe PDF y el notebook Jupyter para entrega."""
    try:
        pdf_bytes = generate_pdf_bytes()
        nb_bytes = generate_notebook_bytes()

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("informe.pdf", pdf_bytes)
            zf.writestr("notebook.ipynb", nb_bytes)
        zip_buffer.seek(0)

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={ZIP_FILENAME}"},
        )
    except Exception as e:
        logger.error("Error in export_zip: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error processing request")
