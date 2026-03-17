# Analisis de Sentimientos - IMDb Movie Reviews

Proyecto academico para la asignatura **Procesamiento de Lenguaje Natural (PLN)** del Master en Inteligencia Artificial de la **UNIR** (Actividad 2).

Replica y extiende el articulo de **Keerthi Kumar & Harish (2019)** aplicando tres clasificadores (Naive Bayes, Regresion Logistica, SVM) sobre el dataset IMDb Movie Reviews (50,000 resenas) con representacion TF-IDF.

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| **Backend** | Python 3.x, FastAPI, Uvicorn |
| **Frontend** | Angular 19, Tailwind CSS v4, Forest Design System |
| **Base de datos** | Supabase (PostgreSQL) con fallback local |
| **PDF/Notebook** | WeasyPrint + Jinja2, nbformat |
| **Cola de tareas** | Celery + Redis (configurado) |

## Arquitectura

```
frontend (Angular 19)       backend (FastAPI)
    :4200        ──HTTP──>      :8000
                                  │
                    ┌─────────────┼─────────────────┐
                    │             │                  │
              Supabase      model_results.py    WeasyPrint
              (PostgreSQL)  (datos pre-calc)    (PDF gen)
```

- **14 REST endpoints** en 5 routers: dataset, article, report, model, export
- **9 vistas frontend** con lazy loading y standalone components
- **Dual data layer**: Supabase-first con fallback local via `db_service.py`

## Resultados de Modelos

| Modelo | Accuracy | F1-Score | Tiempo Entrenamiento |
|--------|----------|----------|---------------------|
| Naive Bayes | 85.12% | 0.85 | 1.23s |
| Regresion Logistica | 89.36% | 0.89 | 5.67s |
| **SVM** | **89.68%** | **0.90** | 142.35s |
| Referencia (articulo) | 88.75% | — | — |

## Inicio Rapido

### Requisitos previos

- Python 3.10+
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### 1. Configurar entorno

```bash
# Clonar y entrar al proyecto
cd "Actividad 2"

# Crear entorno virtual Python
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias backend
pip install -r requirements.txt

# Instalar dependencias frontend
cd frontend
npm install
cd ..
```

### 2. Configurar variables de entorno

```bash
# Copiar plantilla
cp .env.example .env

# Editar .env con tus credenciales de Supabase
```

### 3. Levantar servicios

```bash
# Terminal 1 - Backend
python -m uvicorn backend.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
ng serve
```

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **Swagger docs**: http://localhost:8000/docs

## Estructura del Proyecto

```
Actividad 2/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── routers/                # 5 routers (dataset, article, report, model, export)
│   ├── services/               # 7 servicios (db, model, pdf, notebook, supabase, etc.)
│   ├── data/                   # Datos pre-calculados (model_results, report_content)
│   └── templates/              # Plantillas Jinja2 para PDF
├── frontend/
│   ├── src/app/
│   │   ├── features/           # 9 componentes de pagina
│   │   ├── core/services/      # 7 servicios Angular
│   │   └── shared/components/  # Componentes reutilizables
│   └── src/environments/       # Configuracion de entorno
├── forest-design-system/       # CSS-only design system (8 modulos)
├── requirements.txt            # Dependencias Python
├── .env.example                # Plantilla de variables de entorno
└── README.md                   # Este archivo
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

## Referencia

> Keerthi Kumar, H. M., & Harish, B. S. (2019). *Sentiment Analysis on IMDb Movie Reviews Using Hybrid Feature Extraction Method*. International Journal of Interactive Multimedia and Artificial Intelligence, 5(5), 109-114.

---

*UNIR - Master en Inteligencia Artificial - PLN - Actividad 2*
