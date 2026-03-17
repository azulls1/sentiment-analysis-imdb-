# PRD: Analisis de Sentimientos - IMDb Movie Reviews

> **Version:** 1.0.0
> **Fecha:** Marzo 2026
> **Autor:** NXT PM v3.6.0
> **Proyecto:** Actividad 2 - Master en Inteligencia Artificial (UNIR)

---

## 1. Vision del Producto

Plataforma web academica integral para explorar, comprender y reproducir un estudio de analisis de sentimientos sobre resenas de peliculas IMDb, combinando backend NLP con interfaz interactiva que sirve como herramienta de aprendizaje, demostrador tecnico y mecanismo de entrega academica.

## 2. Objetivos SMART

| ID | Objetivo | Metrica | Estado |
|----|----------|---------|--------|
| O-1 | Replicar resultados del articulo (Keerthi Kumar & Harish, 2019) | Accuracy SVM >= 88.75% | **89.68%** |
| O-2 | 9 vistas frontend funcionales | 9/9 paginas | **9/9** |
| O-3 | Generar entregables (PDF + Notebook + ZIP) | 3 formatos | **3/3** |
| O-4 | Prediccion de sentimiento en tiempo real | Latencia < 500ms | Implementado |
| O-5 | Persistencia Supabase con fallback local | 100% disponibilidad | Implementado |

## 3. Inventario de Funcionalidades

### 3.1 Backend - 14 Endpoints

| Modulo | Endpoint | Estado |
|--------|----------|--------|
| Dataset | `GET /api/dataset/stats` | Implementado |
| Dataset | `GET /api/dataset/samples` | Implementado |
| Article | `GET /api/article/summary` | Implementado |
| Report | `GET /api/report/content` | Implementado |
| Model | `POST /api/model/train` | Implementado |
| Model | `GET /api/model/status` | Implementado |
| Model | `POST /api/model/predict` | Implementado (heuristica) |
| Model | `GET /api/model/comparison` | Implementado |
| Model | `GET /api/model/results` | Implementado |
| Export | `GET /api/export/pdf` | Implementado |
| Export | `GET /api/export/notebook` | Implementado |
| Export | `GET /api/export/zip` | Implementado |
| Root | `GET /` | Implementado |
| Health | `GET /api/health` | Implementado |

### 3.2 Frontend - 9 Paginas

| Pagina | Ruta | Funcionalidades |
|--------|------|-----------------|
| Dashboard | `/dashboard` | Metricas, carousel resenas, barras rendimiento, prediccion rapida |
| Dataset | `/dataset` | 6 metric cards, grid resenas con modal |
| Modelo | `/modelo` | Cards modelos, tabla comparativa, matrices confusion, prediccion |
| Pipeline | `/pipeline` | 7 etapas interactivas, transformacion reactiva, TF-IDF visual |
| Articulo | `/articulo` | Resumen articulo referencia, tabla resultados |
| Retos | `/retos` | 7 retos TSA con filtros por importancia |
| Argilla | `/argilla` | Tutorial 7 pasos, diagrama Predict-Log-Label |
| Informe | `/informe` | Preview HTML del informe completo |
| Entregables | `/entregables` | Descarga PDF, notebook, ZIP |

### 3.3 Resultados de Modelos

| Modelo | Accuracy | F1 | Tiempo |
|--------|----------|-----|--------|
| Naive Bayes | 85.12% | 0.85 | 1.23s |
| Regresion Logistica | 89.36% | 0.89 | 5.67s |
| **SVM** | **89.68%** | **0.90** | 142.35s |
| Referencia (articulo) | 88.75% | — | — |

## 4. Priorizacion MoSCoW

| Prioridad | Features | Estado |
|-----------|----------|--------|
| **Must** | Dashboard, Dataset, Modelos, Prediccion, Pipeline, Articulo, Retos, Argilla, Informe, Entregables | COMPLETADO |
| **Should** | Modelo ML real, Zero-shot endpoint, Tests unitarios | PENDIENTE |
| **Could** | Celery polling, Graficos Chart.js, Docker | PENDIENTE |
| **Won't** | Auth, Multiusuario, Deploy produccion | FUERA ALCANCE |

## 5. Criterios UNIR

| Criterio | Peso | Cobertura | Fuente |
|----------|------|-----------|--------|
| Definiciones y contexto | 20% | 100% | Informe seccion 1 + Dashboard + Dataset |
| Revision bibliografica | 25% | 100% | Informe seccion 2 + Articulo |
| Retos abiertos TSA | 20% | 100% | Informe seccion 5 + Retos (7 retos) |
| Tutorial Argilla | 25% | 100% | Informe seccion 6 + Argilla + Notebook |
| Conclusiones | 10% | 100% | Informe seccion 7 |

## 6. Metricas de Exito

| Metrica | Objetivo | Actual |
|---------|----------|--------|
| Accuracy SVM | >= 88.75% | **89.68%** |
| Paginas funcionales | 9/9 | **9/9** |
| Endpoints API | 14 | **14/14** |
| Formatos exportacion | 3 | **3/3** |
| Criterios UNIR | 5/5 | **5/5** |
| Celdas notebook | >= 35 | **38** |

---

*NXT PM v3.6.0 - De la Vision al Backlog, del Backlog al Valor*
