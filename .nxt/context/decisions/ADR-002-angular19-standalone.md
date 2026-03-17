# ADR-002: Angular 19 con Standalone Components

**Fecha:** 2026-02-01
**Estado:** Accepted

## Contexto

Necesitamos un frontend interactivo con 9 vistas para presentar datos academicos de analisis de sentimientos: dashboard, dataset explorer, modelos, pipeline NLP, articulo, retos, Argilla, informe y entregables.

## Decision

Usar **Angular 19** con standalone components y lazy loading por ruta, sin NgModules tradicionales.

## Estructura

```
frontend/src/app/
  features/           # 9 componentes de pagina (lazy loaded)
    dashboard/        # Metricas, carousel, prediccion rapida
    dataset/          # Exploracion IMDb dataset
    modelo/           # Comparativa 3 modelos, matrices confusion
    pipeline/         # 7 etapas NLP interactivas
    articulo/         # Resumen paper referencia
    retos/            # 7 retos TSA
    argilla/          # Tutorial anotacion
    informe/          # Preview HTML informe
    entregables/      # Descarga PDF, notebook, ZIP
  core/
    services/         # 7 servicios Angular (api, dataset, model, report, article, export)
    models/           # TypeScript interfaces (index.ts)
  shared/
    components/       # header, sidebar, loading-spinner, metric-card, info-modal
```

## Consecuencias

### Positivas
- Tree-shaking optimo por standalone components
- Lazy loading reduce bundle inicial
- TypeScript interfaces (8 interfaces en models/index.ts) para type safety
- Tailwind CSS v4 + Forest Design System para estilos

### Negativas
- Requiere Node.js 18+ y Angular CLI
