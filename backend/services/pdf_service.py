"""
Servicio de generación de PDF con xhtml2pdf/WeasyPrint y Jinja2.
Genera un informe académico con formato UNIR, máximo 12 páginas.
"""
import io
from jinja2 import Template
from backend.data.report_content import REPORT_BLOCKS, REPORT_METADATA

PDF_HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    @page {
        size: A4;
        margin: 1.8cm 1.8cm 2cm 1.8cm;
    }
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 9pt;
        line-height: 1.35;
        color: #333;
    }

    /* Cover page */
    .cover {
        page-break-after: always;
        text-align: center;
        padding-top: 140px;
    }
    .cover-university {
        color: #04202C;
        font-size: 16pt;
        font-weight: bold;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .cover-program {
        color: #304040;
        font-size: 12pt;
        margin-bottom: 60px;
    }
    .cover-line {
        width: 60%;
        border: none;
        border-top: 3px solid #04202C;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 40px;
    }
    .cover-title {
        color: #04202C;
        font-size: 20pt;
        font-weight: bold;
        margin-bottom: 15px;
        line-height: 1.3;
    }
    .cover-subtitle {
        color: #5B7065;
        font-size: 13pt;
        font-style: italic;
        margin-bottom: 60px;
    }
    .cover-info {
        font-size: 11pt;
        color: #304040;
        line-height: 2;
    }
    .cover-info strong {
        color: #04202C;
    }

    /* Content sections */
    .section {
        margin-bottom: 8px;
    }
    h2 {
        color: #04202C;
        font-size: 11pt;
        border-bottom: 2px solid #04202C;
        padding-bottom: 2px;
        margin-bottom: 4px;
        margin-top: 10px;
    }
    h3 {
        color: #04202C;
        font-size: 9.5pt;
        margin-bottom: 3px;
        margin-top: 7px;
    }
    p {
        text-align: justify;
        margin-bottom: 4px;
    }
    ol, ul {
        margin-left: 16px;
        margin-bottom: 4px;
    }
    li {
        margin-bottom: 1px;
    }
    code {
        background: #f4f4f4;
        padding: 1px 3px;
        font-size: 9pt;
        font-family: 'Courier New', monospace;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 5px 0;
        font-size: 8.5pt;
    }
    th {
        background: #04202C;
        color: white;
        padding: 5px 8px;
        text-align: left;
        font-weight: bold;
    }
    td {
        padding: 4px 8px;
        border-bottom: 1px solid #ddd;
    }
    em {
        color: #666;
        font-size: 9pt;
    }
    div.referencias p {
        font-size: 8.5pt;
        line-height: 1.4;
        margin-bottom: 3px;
        padding-left: 30px;
        text-indent: -30px;
        text-align: left;
    }
    a {
        color: #04202C;
        text-decoration: none;
    }
    .page-footer {
        font-size: 8pt;
        color: #999;
        text-align: center;
        margin-top: 30px;
    }
</style>
</head>
<body>

<!-- PORTADA -->
<div class="cover">
    <div class="cover-university">{{ meta.universidad }}</div>
    <div class="cover-program">{{ meta.programa }}</div>
    <hr class="cover-line">
    <div class="cover-title">{{ meta.titulo }}</div>
    <div class="cover-subtitle">{{ meta.subtitulo }}</div>
    <div class="cover-info">
        <strong>Asignatura:</strong> {{ meta.asignatura }}<br>
        <strong>Actividad:</strong> {{ meta.actividad }}<br>
        <strong>Autor:</strong> {{ meta.autor }}<br>
        <strong>Fecha:</strong> {{ meta.fecha }}
    </div>
</div>

<!-- CONTENIDO -->
{% for key, block in blocks.items() %}
<div class="section">
    <h2>{{ block.titulo }}</h2>
    {{ block.contenido }}
</div>
{% endfor %}

</body>
</html>
"""


def generate_pdf_bytes() -> bytes:
    """Genera el PDF del informe como bytes."""
    template = Template(PDF_HTML_TEMPLATE)
    html_content = template.render(
        meta=REPORT_METADATA,
        blocks=REPORT_BLOCKS,
    )
    # Try xhtml2pdf first (pure Python, works everywhere)
    try:
        from xhtml2pdf import pisa
        buf = io.BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=buf)
        if not pisa_status.err:
            return buf.getvalue()
    except ImportError:
        pass
    except Exception:
        pass
    # Try WeasyPrint (needs GTK on Windows)
    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except ImportError:
        pass
    except Exception:
        pass
    return _generate_fallback_pdf()


def generate_html_preview() -> str:
    """Genera el HTML del informe para preview."""
    template = Template(PDF_HTML_TEMPLATE)
    return template.render(
        meta=REPORT_METADATA,
        blocks=REPORT_BLOCKS,
    )


def _generate_fallback_pdf() -> bytes:
    """Genera un PDF mínimo si WeasyPrint no está disponible."""
    # Minimal valid PDF
    content = (
        "%PDF-1.4\n"
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        "4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 100 700 Td (Informe - Analisis de Sentimientos) Tj ET\nendstream\nendobj\n"
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        "xref\n0 6\n"
        "0000000000 65535 f \n"
        "0000000009 00000 n \n"
        "0000000058 00000 n \n"
        "0000000115 00000 n \n"
        "0000000266 00000 n \n"
        "0000000360 00000 n \n"
        "trailer\n<< /Size 6 /Root 1 0 R >>\n"
        "startxref\n441\n%%EOF"
    )
    return content.encode("latin-1")
