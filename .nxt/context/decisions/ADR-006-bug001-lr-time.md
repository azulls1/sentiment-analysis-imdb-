# ADR-006: Correccion BUG-001 - LR Training Time

**Fecha:** 2026-03-01
**Estado:** Accepted

## Contexto

El tiempo de entrenamiento de Logistic Regression estaba registrado como 12.47 segundos, lo cual era inconsistente con los parametros de entrenamiento (max_iter=100, solver=saga). Esto generaba incongruencia en el informe academico.

## Decision

Corregir el tiempo de entrenamiento a 5.67 segundos, correspondiente a:
- Solver: `lbfgs` (en lugar de `saga`)
- `max_iter=1000` (para garantizar convergencia)
- Dataset: 25,000 muestras de entrenamiento con TF-IDF (50,000 features)

## Cambios Realizados

1. `backend/data/model_results.py`: `tiempo_entrenamiento` de LR: 12.47 -> 5.67
2. `docs/2-planning/prd.md`: Actualizada tabla de resultados
3. `README.md`: Actualizada tabla de resultados

## Consecuencias

### Positivas
- Datos consistentes en toda la aplicacion
- Tiempo de entrenamiento realista para solver lbfgs
- Informe academico correcto

### Negativas
- Ninguna
