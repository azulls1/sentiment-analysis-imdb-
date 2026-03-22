# Changelog

Todos los cambios notables en este proyecto seran documentados aqui.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [2.4.0] - 2026-03-22

### Added
- feat(security): Docker-secrets-first secret resolution (`_load_secret`) in `backend/config.py` — checks `/run/secrets/<name>` before env vars for `supabase_url`, `supabase_anon_key`, `supabase_service_key`, and `api_key`
- feat(resilience): Backup & recovery documentation (`docs/backup-recovery.md`) with RTO 5 min / RPO 24 h, volume snapshot scripts, and disaster recovery procedure
- feat(resilience): SLA/SLO definitions (`docs/sla-slo.md`) — 99.5% availability, P95 < 500 ms GET / < 2 s predictions, < 1% error rate
- feat(observability): Alerting rules documentation (`docs/alerting-rules.md`) — 5 alert definitions with thresholds and runbooks
- feat(observability): Prometheus alerting rules file (`docs/prometheus-alerts.yml`) — HighErrorRate, HighLatency, MLDrift, HealthCheckFailure, HighMemoryUsage
- feat(ci): Coverage threshold enforcement (>= 60%) in CI pipeline — fails build if line coverage drops below threshold
- feat(ci): Docker images tagged with git SHA and `latest` for rollback traceability
- feat(ci): Image digest summary exported to GitHub Actions step summary
- feat(docs): `docs/monitoring.md` — Prometheus integration guide, available metrics catalog (HTTP + ML), Grafana dashboard setup, alert thresholds and escalation path
- feat(docs): `docs/capacity-planning.md` — resource allocation analysis (2 GB backend, 512 MB frontend), per-endpoint RPS estimates, scaling triggers, headroom analysis, growth projections (academic through production)
- feat(docs): `docs/incident-runbook.md` — severity levels (P1-P4), response times, escalation path, step-by-step resolution for 6 common incidents (backend down, high error rate, ML drift, export failures, frontend issues, rate limiting)
- feat(docs): `docs/postmortem-template.md` — structured template with timeline, 5-Whys root cause analysis, impact assessment, and action item tracking
- feat(docs): `docs/deployment-guide.md` — local dev setup, Docker Compose deployment, cloud options (AWS EC2, DigitalOcean, Railway), environment checklist, SSL/HTTPS with Let's Encrypt, DNS configuration
- feat(frontend): `AnalyticsService` in `core/services/analytics.service.ts` — lightweight in-memory analytics tracking page views, predictions, and exports via Angular signals
- feat(frontend): Route change tracking in `AppComponent` via `NavigationEnd` events feeding `AnalyticsService.trackPageView()`
- feat(frontend): Dashboard analytics integration — `trackPageView()` on init, `trackPrediction()` after successful ML prediction
- feat(docs): Testing section in `README.md` documenting 162+ backend and 151+ frontend test specs, test types (unit, integration, edge case, security), run commands, patterns, and CI coverage

### Changed
- refactor(resilience): Supabase client retries use exponential backoff (1 s, 2 s, 4 s; max 8 s cap) instead of fixed 1 s delay; increased to 3 retry attempts
- refactor(resilience): Supabase client uses connection-pooled `httpx.Client` with keepalive for reduced latency
- refactor(resilience): Circuit breaker in `argilla_service.py` now implements HALF_OPEN state — allows one probe request after cooldown; closes on success, re-opens on failure
- refactor(resilience): Graceful shutdown handler in `backend/main.py` lifespan — flushes metrics, unloads zero-shot model, logs final request counts
- refactor(security): Updated `SECURITY.md` with Docker secrets and vault integration documentation

## [2.3.0] - 2026-03-22

### Added
- feat(legal): MIT `LICENSE` file with WeasyPrint AGPL-3.0 third-party notice
- feat(legal): `ATTRIBUTION.md` listing key dependencies and their licenses (FastAPI, Angular, scikit-learn, WeasyPrint, Tailwind CSS, IMDb dataset)
- feat(seo): Open Graph meta tags (og:title, og:description, og:type, og:url, og:locale) in `index.html`
- feat(seo): Twitter Card meta tags (summary card) in `index.html`
- feat(seo): Canonical link and enriched meta description in `index.html`
- feat(seo): `robots.txt` allowing all crawlers with sitemap reference
- feat(seo): `sitemap.xml` listing all 9 application routes with lastmod dates
- feat(frontend): "Reintentar" button on API-unavailable warning banner with `recheckApi()` in `ErrorHandlingService`
- feat(api): `tags_metadata` for Swagger UI tag organization (model, dataset, article, report, export, argilla)
- feat(api): Global `responses` parameter on FastAPI app for common error schemas (400, 401, 404, 429, 500, 504)
- feat(api): `PredictResponse` response model with typed fields (label, confidence, model, language)
- feat(api): Request/response examples on dataset `/stats` and `/samples` endpoints
- feat(api): `json_schema_extra` example on `PredictRequest.text` field
- feat(dx): `Makefile` with targets: dev, frontend, test, lint, docker, docker-down, clean, install, help
- feat(dx): `.vscode/settings.json` with Python (black), TypeScript (prettier), file associations, and search exclusions
- feat(dx): `.vscode/extensions.json` with 13 recommended extensions (Python, Angular, Tailwind, Docker, GitLens, etc.)

### Changed
- refactor(seo): `angular.json` build assets updated to include `robots.txt` and `sitemap.xml`
- refactor(api): FastAPI app description expanded with classifier and dataset details

## [2.2.0] - 2026-03-22

### Added
- feat(logging): Structured JSON logging in production via `JSONFormatter` in `backend/logging_config.py`; human-readable format preserved for development
- feat(ci): Security scanning job enabled (Trivy filesystem scan, pip-audit, npm audit) with `continue-on-error: true` so it never blocks the pipeline
- feat(ci): Job-level `timeout-minutes` on all CI jobs (5 min lint, 15 min tests, 10 min build/scan) and `fail-fast: true` on test matrix
- feat(docker): Frontend resource limits (512 MB memory, 0.5 CPU) in `docker-compose.yml`
- feat(docker): `stop_grace_period: 30s` on backend service for graceful shutdown
- feat(nginx): Upstream block with `keepalive 16` for persistent backend connections
- feat(nginx): Proxy timeout configuration (`proxy_connect_timeout 10s`, `proxy_send_timeout 30s`, `proxy_read_timeout 30s`)
- feat(nginx): `proxy_next_upstream` retry directive for automatic failover on upstream errors
- feat(nginx): `client_max_body_size 10m` and `keepalive_timeout 65s` for connection management
- feat(nginx): Reverse proxy `/api/` location block forwarding to backend upstream

### Changed
- refactor(docker): Restart policy changed from `unless-stopped` to `on-failure:5` on both services for bounded retry behavior
- refactor(docker): Frontend healthcheck switched from `curl` to `wget --spider` (available in alpine without extra packages)
- refactor(logging): `setup_logging()` now clears existing handlers to prevent duplicate log entries on repeated calls

### Fixed
- fix(resilience): Rate limiter middleware uses sliding window with proper timestamp purge
- fix(resilience): ML model cache uses `threading.Lock` to prevent race conditions on concurrent loads
- fix(resilience): All middleware dispatchers handle exceptions to prevent unhandled 500s
- fix(frontend): HTTP error interceptor prevents memory leaks from unhandled observable errors
- fix(frontend): Retry logic in HTTP interceptor for transient network failures

## [2.1.0] - 2026-03-22

### Added
- feat(ci): pip caching with actions/cache@v4 for faster CI builds (`.github/workflows/ci.yml`)
- feat(ci): pytest coverage reporting with `--cov=backend --cov-report=xml` and artifact upload (`.github/workflows/ci.yml`)
- feat(ci): flake8 linting step as separate job with bugbear plugin (`.github/workflows/ci.yml`)
- feat(ci): Docker build verification step for both backend and frontend images (`.github/workflows/ci.yml`)
- feat(ci): Security scanning placeholder with Trivy and pip-audit configuration (`.github/workflows/ci.yml`)
- feat(docker): Non-root user (`appuser`) in backend Dockerfile for security hardening (`backend/Dockerfile`)
- feat(docker): Non-root user (`nginx`) in frontend Dockerfile (`frontend/Dockerfile`)
- feat(docker): LABEL metadata (maintainer, version, description) in both Dockerfiles
- feat(docker): ARG for build-time variables in backend Dockerfile (`APP_ENV`, `PIP_NO_CACHE_DIR`)
- feat(docker): Custom bridge network (`imdb-sentiment-network`) in docker-compose.yml
- feat(docker): Named volume (`model-data`) for ML model persistence across container restarts
- feat(docker): Docker secrets documentation and placeholder configuration
- feat(docker): `version: "3.8"` field in docker-compose.yml
- feat(docker): Security headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.) in nginx.conf
- feat(docker): Static asset caching rules in nginx.conf
- feat(docs): `backend/README.md` with API endpoint listing, curl examples, setup guide, architecture overview
- feat(docs): Badges (CI status, Python, Angular, FastAPI, License) in main README.md
- feat(docs): ASCII architecture diagram in main README.md
- feat(docs): Contributing section with code style guidelines in main README.md
- feat(docs): License section in main README.md
- feat(docs): Docker Compose quick start option in main README.md
- feat(git): `.gitattributes` with line ending normalization, binary file declarations, linguist overrides
- feat(env): Comprehensive `.env.example` with REQUIRED/OPTIONAL markers, descriptions, and example values
- feat(env): New variables: `API_KEY`, `RANDOM_SEED`, `APP_ENV`, `LOG_LEVEL` in `.env.example`
- feat(ml): `RANDOM_SEED = 42` for full reproducibility in `train_and_save.py`
- feat(ml): 5-fold cross-validation with 95% confidence intervals in `train_and_save.py`
- feat(ml): Feature importance extraction (top 20 words per model) in `train_and_save.py`
- feat(ml): Model metadata JSON export (training date, versions, params, features) in `train_and_save.py`
- feat(report): Cross-validation results table (Section 4.2) in `report_content.py`
- feat(report): Confidence intervals for all three classifiers in results section
- feat(report): Reproducibility section (3.8) documenting random seed and metadata in `report_content.py`
- feat(report): Extended error analysis section (4.7) on sarcasm and negation failures in `report_content.py`

### Changed
- refactor(ci): Reorganized CI into 4 jobs: lint, test, frontend-build, docker-build with proper dependencies
- refactor(report): Renumbered results subsections (4.2-4.7) to accommodate cross-validation and error analysis
- refactor(report): Updated evaluation strategy section (3.7) to document dual approach (50/50 + CV)

## [2.0.0] - 2026-03-19

### Added
- feat(security): Rate limiting middleware (60 req/min per IP, returns 429)
- feat(security): Security headers middleware (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, CSP)
- feat(security): Request logging middleware (method, path, status_code, duration_ms)
- feat(security): Thread-safe ML model cache with threading.Lock in model_service.py and argilla_service.py
- feat(security): Input validation for Argilla: text 1-10K chars, labels 1-20 items, label max 100 chars
- feat(backend): Structured logging configuration (backend/logging_config.py)
- feat(testing): 10 new Angular test specs (pipeline, argilla, entregables, retos, modelo, informe, articulo, sidebar, header, info-modal) - 57 test cases
- feat(testing): 6 new backend security tests (security headers, error safety, argilla validation)
- feat(a11y): Skip-to-content link in app.component.ts
- feat(a11y): ARIA landmarks: aria-label on header, sidebar, modal; aria-current="page" on active nav link
- feat(a11y): Focus trap in info-modal with focus restoration on close
- feat(a11y): aria-live="polite" on prediction results for screen readers
- feat(a11y): aria-hidden="true" on decorative SVG icons
- feat(a11y): Screen-reader-only labels for form inputs
- feat(a11y): Focus-visible styles and .sr-only utility in Forest Design System
- feat(devops): HEALTHCHECK instruction in backend Dockerfile
- feat(devops): Docker logging config (json-file, 10m max, 3 files) for both services
- feat(devops): Resource limits for backend container (2G memory, 1 CPU)
- feat(frontend): HTTP error interceptor with Spanish messages (0, 429, 500+)
- feat(frontend): SEO meta description and API preconnect hint

### Changed
- refactor(security): All routers use generic error messages in HTTPException (no str(e) leaking)
- refactor(security): All routers log real errors with logger.error() before raising
- refactor(angular): skipTests changed to false in angular.json for all schematics
- perf(frontend): Error interceptor catches and maps HTTP errors globally

### Fixed
- fix(security): Error messages no longer expose internal Python exceptions to API consumers
- fix(a11y): html lang="es" attribute verified present
- fix(a11y): Form inputs now have associated labels

## [1.5.0] - 2026-03-18

### Added
- feat(report): Seccion 1.2 con objetivo general y 5 objetivos especificos (OE1-OE5) con indicadores medibles
- feat(report): Hipotesis H1/H2 en seccion de metodologia cientifica
- feat(report): Tabla de entorno experimental con versiones exactas (Python, scikit-learn, xhtml2pdf, etc.)
- feat(report): Pasos de reproducibilidad (4 comandos para replicar resultados)
- feat(report): Justificacion de estrategia de evaluacion (train/test 50/50 vs cross-validation)
- feat(report): Tabla de verificacion de hipotesis y objetivos en conclusiones (seccion 7.0)

### Changed
- refactor(report): Referencias corregidas a formato APA 7 completo: orden alfabetico, sangria francesa, "y" en vez de "&" para citas en español, volumenes en cursiva
- refactor(report): Pedregosa et al. expandido con todos los autores segun APA 7
- refactor(report): Numeracion de subsecciones corregida (7.1→7.2→7.3→7.4) y tablas (1-5)
- perf(pdf): CSS compactado para mantener contenido expandido dentro del limite de 12 paginas UNIR

### Fixed
- fix(report): Numeracion inconsistente de subsecciones y tablas en PDF

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
| Commits analizados | 40 cambios documentados |
| Entradas generadas | 40 |
| Breaking changes detectados | 0 |
| Version actual | 1.5.0 |
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
