# ADR-008: Docker Compose para Orquestacion

**Fecha:** 2026-03-01
**Estado:** Accepted

## Contexto

Necesitamos un metodo reproducible para desplegar los 3 componentes del proyecto: backend Python, frontend Angular, y Redis para Celery.

## Decision

Docker Compose con 3 servicios:

```yaml
services:
  backend:   # Python 3.12-slim + WeasyPrint deps + uvicorn
    ports: 8000:8000
    depends_on: redis
  frontend:  # Node 20 build + Nginx alpine serve
    ports: 80:80
    depends_on: backend
  redis:     # Redis 7-alpine
    ports: 6379:6379
```

## Dockerfiles

### Backend (backend/Dockerfile)
- Base: `python:3.12-slim`
- System deps: libpango (WeasyPrint)
- CMD: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

### Frontend (frontend/Dockerfile)
- Build stage: `node:20-alpine` con `ng build --configuration=production`
- Serve stage: `nginx:alpine` sirviendo dist/frontend/browser

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):
- Backend tests: Python 3.11 + 3.12 matrix
- Frontend lint: Node 20, `ng build --configuration=production`

## Consecuencias

### Positivas
- Un comando: `docker compose up`
- CI reproducible
- Multi-stage build reduce tamano de imagen frontend

### Negativas
- WeasyPrint requiere dependencias de sistema en Docker
