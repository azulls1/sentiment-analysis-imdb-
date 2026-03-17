# Changelog

Todos los cambios notables en este proyecto seran documentados aqui.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [1.4.0] - 2026-03-17

### Added
- feat(ml): Modelos ML entrenados en IMDb 50K dataset real: NB 87.27%, LR 90.04%, SVM 89.80% (4 archivos .joblib)
- feat(pdf): Motor `xhtml2pdf` como alternativa pura Python a WeasyPrint (sin dependencia GTK)
- feat(frontend): Pagina `/informe` rediseñada con grid de cards interactivas y modales por seccion (8 secciones)
- feat(frontend): Pagina `/entregables` rediseñada con sistema dual de modales (entregables + criterios de evaluacion)
- feat(frontend): Navegacion prev/next con dots indicadores en todos los modales
- feat(ml): Deteccion de idioma en pipeline de prediccion (SVM real para ingles, heuristica para español)
- feat(deps): Agregadas dependencias `xhtml2pdf` y `datasets` (HuggingFace)

### Changed
- refactor(pdf): `pdf_service.py` usa xhtml2pdf como motor primario, WeasyPrint como fallback, PDF minimo como ultimo recurso
- perf(pdf): CSS del PDF optimizado (font 10pt, line-height 1.45, margenes reducidos) para caber en 12 paginas
- refactor(content): Secciones Retos y Argilla condensadas en `report_content.py` (subsecciones fusionadas)
- refactor(frontend): `informe.component.ts` expandido de 135 a ~300 lineas con sistema completo de modales
- refactor(frontend): `entregables.component.ts` expandido de 131 a ~500 lineas con cards, criterios y estructura

### Fixed
- fix(pdf): PDF generaba solo 1 pagina fallback por falta de GTK en Windows — ahora genera 10 paginas reales con xhtml2pdf
- fix(ml): Modelos `.joblib` no existian en disco — entrenados con dataset IMDb real (25K train / 25K test)
- fix(api): Endpoint `/api/model/predict` usaba heuristica de keywords — ahora usa SVM-TF-IDF real para textos en ingles

## [1.3.0] - 2026-03-16 (Session 3)

### Added
- feat(frontend): Paginas `/articulo`, `/retos`, `/argilla`, `/pipeline` mejoradas con cards clickeables y modales
- feat(frontend): Sistema de modales con backdrop blur, header sticky, contenido scrollable
- feat(frontend): Deteccion de idioma en pagina pipeline
- feat(nxt): Agentes NXT de persistencia: context, multicontext, changelog, ralph
- feat(nxt): Checkpoints de contexto en `.nxt/context/` (8 ADRs, 6 patrones, 12 preferencias)

### Changed
- refactor(frontend): Componentes Angular refactorizados con signals (`signal()`, `computed()`)
- refactor(frontend): Sintaxis de control flow Angular moderna (`@if`, `@for`)

## [1.0.0] - 2026-03-16

### Added
- feat(ml): Implementado modelo SVM real con prediccion, lazy loading y fallback heuristico (`backend/services/model_service.py` reescrito, `backend/scripts/train_and_save.py` creado, directorio `backend/models/`)
- feat(api): Creado router de Argilla exponiendo clasificacion zero-shot (`backend/routers/argilla.py`, 2 nuevos endpoints)
- feat(api): Agregados 16 docstrings a todos los endpoints de FastAPI (6 archivos de routers + `main.py`)
- feat(api): Agregado manejo de errores (try/except + HTTPException) a los 16 endpoints
- feat(frontend): Agregadas 12 interfaces TypeScript para tipado fuerte (`frontend/src/app/core/models/index.ts`)
- feat(qa): Creados 47 tests de backend (`test_endpoints.py` + `test_services.py`) - TODOS PASANDO
- feat(devops): Creado setup Docker Compose (`docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `nginx.conf`)
- feat(ci): Creado pipeline CI/CD (`.github/workflows/ci.yml`)
- feat(config): Creado `.gitignore` (Python, Node, secrets, IDE, OS, modelos ML)
- feat(config): Creado `.env.example` (template sin credenciales reales)
- feat(docs): Creado `README.md` (stack, arquitectura, instrucciones de setup, criterios UNIR)
- feat(docs): Documento PRD guardado en `docs/2-planning/prd.md`
- feat(agents): 10 agentes NXT ejecutados (orchestrator, analyst, pm, architect, design, dev, qa, docs, scrum, devops)

### Fixed
- fix(dashboard): BUG-001 - Tiempo de entrenamiento de Logistic Regression en dashboard reducido de 12.47s a 5.67s (`dashboard.component.ts:232`)

### Removed
- remove(frontend): Eliminado codigo muerto: `supabase.service.ts` borrado, claves de Supabase removidas de `environment.ts`

---

### Resumen de la Version

**Proyecto:** Analisis de Sentimientos - IMDb Movie Reviews
**Contexto:** UNIR Master's Degree - Primer Semestre - Actividad 2
**Fecha:** 2026-03-16
**Agente:** NXT Changelog v3.6.0

| Metrica | Valor |
|---------|-------|
| Commits analizados | 30 cambios documentados |
| Entradas generadas | 30 |
| Breaking changes detectados | 0 |
| Version actual | 1.4.0 |
| Errores de validacion | 0 |

**Stack tecnologico:**
- Backend: Python / FastAPI
- Frontend: Angular / TypeScript
- ML: SVM (scikit-learn) + Argilla (zero-shot)
- Infraestructura: Docker Compose + GitHub Actions CI/CD
- Base de datos: IMDb Movie Reviews dataset

**Categorias de cambios:**
- Added: 13 entradas (nuevas funcionalidades, configuracion, documentacion, tests, CI/CD)
- Fixed: 1 entrada (bug de rendimiento en dashboard)
- Removed: 1 entrada (codigo muerto de Supabase)
