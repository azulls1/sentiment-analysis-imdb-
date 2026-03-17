# ADR-001: FastAPI como Framework Backend

**Fecha:** 2026-02-01
**Estado:** Accepted

## Contexto

Se necesita una API REST para servir datos de analisis de sentimientos (dataset stats, resultados de modelos, predicciones, exportaciones) a un frontend Angular 19. El framework debe soportar generacion de PDF (WeasyPrint), notebooks (nbformat), y prediccion ML en tiempo real.

## Decision

Usar **FastAPI** como framework backend por:
- Tipado automatico con Pydantic y documentacion OpenAPI/Swagger
- Alto rendimiento async-ready
- Soporte nativo para streaming responses (PDF, ZIP)
- Inyeccion de dependencias
- TestClient integrado para testing

## Estructura

```
backend/
  main.py              # App entry point, CORS, routers
  routers/             # 6 routers (dataset, article, report, model, export, argilla)
  services/            # 7 servicios (model, dataset, db, pdf, notebook, supabase, argilla)
  data/                # Datos pre-calculados
  tests/               # 47 tests (pytest + TestClient)
```

## Consecuencias

### Positivas
- Swagger en /docs automatico
- Validacion con Pydantic (PredictRequest, ZeroShotRequest)
- StreamingResponse para PDF/ZIP/Notebook
- CORS configurable via .env

### Negativas
- Requiere ASGI server (uvicorn)
- WeasyPrint necesita dependencias de sistema (libpango, etc.)
