# Analisis de Sentimientos - IMDb Movie Reviews

![CI](https://github.com/shernandez/imdb-sentiment/actions/workflows/ci.yml/badge.svg)
![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-blue)
![Angular](https://img.shields.io/badge/Angular-19-red)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

Proyecto academico para la asignatura **Procesamiento de Lenguaje Natural (PLN)** del Master en Inteligencia Artificial de la **UNIR** (Actividad 2).

Replica y extiende el articulo de **Keerthi Kumar & Harish (2019)** aplicando tres clasificadores (Naive Bayes, Regresion Logistica, SVM) sobre el dataset IMDb Movie Reviews (50,000 resenas) con representacion TF-IDF.

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **Frontend** | Angular 19, Tailwind CSS v4, Forest Design System |
| **Base de datos** | Supabase (PostgreSQL) con fallback local |
| **ML Models** | scikit-learn (NB, LR, SVM) + TF-IDF |
| **PDF/Notebook** | WeasyPrint + xhtml2pdf + Jinja2, nbformat |
| **Seguridad** | Rate limiting, API-key auth, Security headers, HSTS |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions (lint, test, coverage, Docker build) |

## Arquitectura

```
                    +------------------+
                    |   Browser/User   |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  nginx (port 80)  |
                    |  Angular 19 SPA   |
                    +--------+---------+
                             | HTTP
                    +--------v---------+
                    | FastAPI (port 8000)|
                    |  Rate Limiting     |
                    |  Security Headers  |
                    |  Request Logging   |
                    +--------+---------+
                             |
           +-----------------+------------------+
           |                 |                  |
    +------v------+  +------v-------+  +-------v------+
    |   Routers   |  |   Services   |  |   ML Models  |
    | dataset     |  | model_svc    |  | NB  (.joblib)|
    | model       |  | pdf_svc      |  | LR  (.joblib)|
    | article     |  | notebook_svc |  | SVM (.joblib)|
    | report      |  | argilla_svc  |  | TF-IDF       |
    | argilla     |  | db_svc       |  +--------------+
    | export      |  +--------------+
    +-------------+          |
                    +--------v---------+
                    |  Supabase / Local |
                    |  (PostgreSQL)     |
                    +------------------+
```

- **14 REST endpoints** en 6 routers: dataset, article, report, model, argilla, export
- **9 vistas frontend** con lazy loading y standalone components
- **Dual data layer**: Supabase-first con fallback local via `db_service.py`

## Resultados de Modelos

| Modelo | Accuracy | F1-Score | Tiempo Entrenamiento |
|--------|----------|----------|---------------------|
| Naive Bayes | 85.12% | 0.85 | 1.23s |
| Regresion Logistica | 89.36% | 0.89 | 5.67s |
| **SVM** | **89.68%** | **0.90** | 142.35s |
| Referencia (articulo) | 88.75% | -- | -- |

## Inicio Rapido

### Requisitos previos

- Python 3.10+
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)
- Docker & Docker Compose (optional, for containerized setup)

### Opcion A: Desarrollo local

```bash
# 1. Clonar y entrar al proyecto
cd "Actividad 2"

# 2. Crear entorno virtual Python
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Instalar dependencias backend
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver .env.example para documentacion)

# 5. (Opcional) Entrenar modelos ML desde cero
python -m backend.scripts.train_and_save

# 6. Levantar backend
python -m uvicorn backend.main:app --reload --port 8000

# 7. En otra terminal, instalar y levantar frontend
cd frontend
npm install
ng serve
```

### Opcion B: Docker Compose

```bash
# 1. Configurar variables de entorno
cp .env.example .env

# 2. Levantar ambos servicios
docker compose up --build

# Frontend: http://localhost
# Backend:  http://localhost:8000
# Swagger:  http://localhost:8000/docs
```

### Verificar instalacion

```bash
# Backend health check
curl http://localhost:8000/api/health

# Run backend tests
python -m pytest backend/tests/ -v

# Run frontend tests
cd frontend && npx ng test --watch=false --browsers=ChromeHeadless
```

**URLs**:
- **Frontend**: http://localhost:4200 (dev) / http://localhost (Docker)
- **Backend API**: http://localhost:8000
- **Swagger docs**: http://localhost:8000/docs

## Estructura del Proyecto

```
Actividad 2/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── routers/                # 6 routers (dataset, article, report, model, argilla, export)
│   ├── services/               # 7 servicios (db, model, pdf, notebook, argilla, etc.)
│   ├── data/                   # Datos pre-calculados (model_results, report_content)
│   ├── models/                 # Serialized ML models (*.joblib)
│   ├── scripts/                # Training scripts
│   ├── templates/              # Plantillas Jinja2 para PDF
│   └── tests/                  # pytest test suite
├── frontend/
│   ├── src/app/
│   │   ├── features/           # 9 componentes de pagina
│   │   ├── core/services/      # 7 servicios Angular
│   │   └── shared/components/  # Componentes reutilizables
│   ├── src/environments/       # Configuracion de entorno
│   ├── nginx.conf              # Production nginx config with security headers
│   └── Dockerfile              # Multi-stage build (Node + nginx)
├── forest-design-system/       # CSS-only design system (8 modulos)
├── .github/workflows/ci.yml    # CI pipeline (lint, test, coverage, Docker build)
├── docker-compose.yml          # Full-stack containerized setup
├── requirements.txt            # Python dependencies
├── .env.example                # Documented environment variables template
├── .gitattributes              # Line endings and binary file declarations
├── .gitignore                  # Ignore patterns for Python, Node, IDE, OS
└── README.md                   # This file
```

## Vistas de la Aplicacion

| Ruta | Descripcion |
|------|-------------|
| `/dashboard` | Resumen general, metricas, prediccion rapida |
| `/dataset` | Exploracion del dataset IMDb |
| `/modelo` | Metricas detalladas, matrices de confusion |
| `/pipeline` | Pipeline NLP paso a paso |
| `/articulo` | Articulo de referencia |
| `/retos` | Retos y desafios del proyecto |
| `/argilla` | Integracion con Argilla (anotacion) |
| `/informe` | Informe academico |
| `/entregables` | Descarga de PDF y notebook |

## Criterios UNIR Cubiertos

1. **Criterio 1**: Resumen del articulo y retos (vista `/articulo` + `/retos`)
2. **Criterio 2**: Presentacion del corpus IMDb (vista `/dataset`)
3. **Criterio 3**: Construccion del modelo de clasificacion (vista `/modelo` + `/pipeline`)
4. **Criterio 4**: Resultados y analisis (vista `/modelo` + `/dashboard`)
5. **Criterio 5**: Informe final y entregables (vista `/informe` + `/entregables`)

## Scaling

The application ships as a single-instance deployment suitable for academic and
small-production workloads.

### Current Architecture

- 1 FastAPI process with 4 Uvicorn workers behind nginx
- In-memory prediction cache (LRU, 100 entries, 10 min TTL)
- In-memory rate limiter (per-IP, sliding window)
- Supabase connection pooling via httpx (20 max connections, 10 keep-alive)
- CPU-heavy exports (PDF, notebook) offloaded to a 2-thread executor pool

### Scaling Roadmap

| Component | Current (1 instance) | Scale-out (N replicas) | Change Required |
|-----------|---------------------|----------------------|-----------------|
| **Rate Limiter** | In-memory dict | Redis sliding window | Replace `_rate_limit_store` with Redis |
| **Prediction Cache** | In-memory LRU (100) | Redis LRU (10K+) | Swap dict for `redis.StrictRedis` |
| **Export Cache** | In-memory dict | Redis with TTL | Use `redis.setex()` for PDF/notebook bytes |
| **Session State** | Stateless | Stateless | No change needed |
| **ML Models** | Loaded per-worker | Dedicated model server | Extract to TorchServe / Triton |
| **Load Balancer** | nginx (single) | nginx / Envoy / ALB | Add upstream block with N backends |
| **Database** | Supabase (managed) | Supabase (managed) | Connection pool already configured |
| **Monitoring** | In-memory metrics | Prometheus + Grafana | Already exports Prometheus format |

### Scaling Steps

1. **Horizontal scaling**: the backend is stateless except for the in-memory rate
   limiter and caches. Migrate both to **Redis** and the app can run behind a
   load balancer with N replicas.
2. **Model serving**: for high-throughput inference (>100 req/s), extract the ML
   models into a dedicated model server (e.g. TorchServe, Triton) and call it
   from the API via gRPC.
3. **Vertical scaling**: increase container memory (currently capped at 2 GB) to
   accommodate larger ML models or higher TF-IDF vocabulary sizes.
4. **Auto-scaling**: add `docker-compose` replica count or Kubernetes HPA based
   on CPU utilisation (target 70%) or request latency p95.

## Testing

The project maintains comprehensive test suites for both backend and frontend.

| Layer | Test Count | Framework | Command |
|-------|-----------|-----------|---------|
| **Backend** | 162+ specs | pytest | `python -m pytest backend/tests/ -v` |
| **Frontend** | 151+ specs | Karma + Jasmine | `cd frontend && npx ng test --watch=false --browsers=ChromeHeadless` |

### Test Types

- **Unit tests**: Isolated service and component tests with mocked dependencies.
- **Integration tests**: Router and endpoint tests verifying full request/response cycles.
- **Edge case tests**: Error handling, rate limiting, timeout behavior, malformed input.
- **Security tests**: Security headers, API key enforcement, input validation boundaries.

### Running Tests

```bash
# Run all tests (backend + frontend)
make test

# Backend only with coverage
python -m pytest backend/tests/ -v --cov=backend --cov-report=term-missing

# Frontend only
cd frontend && npx ng test --watch=false --browsers=ChromeHeadless
```

### Test Patterns

- **Backend**: Each router has a corresponding test file in `backend/tests/`. Services are tested in `test_services.py`. Fixtures and shared setup are in `conftest.py`.
- **Frontend**: Each component and service has a `.spec.ts` file alongside it. Tests use Angular TestBed with `HttpClientTestingModule` for HTTP mocking.
- **CI**: Tests run on every push and pull request via GitHub Actions. Coverage reports are uploaded as CI artifacts.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes following existing code style
4. Add tests for new functionality
5. Run the test suite: `python -m pytest backend/tests/ -v`
6. Commit with conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
7. Push and open a Pull Request

### Code Style

- **Python**: Follow PEP 8, max line length 120 characters, type hints encouraged
- **TypeScript**: Follow Angular style guide, use strict mode
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)

## License

This project is developed for academic purposes as part of the UNIR Master's in Artificial Intelligence program. All rights reserved.

## Referencia

> Keerthi Kumar, H. M., & Harish, B. S. (2019). *Sentiment Analysis on IMDb Movie Reviews Using Hybrid Feature Extraction Method*. International Journal of Interactive Multimedia and Artificial Intelligence, 5(5), 109-114.

---

*UNIR - Master en Inteligencia Artificial - PLN - Actividad 2*
