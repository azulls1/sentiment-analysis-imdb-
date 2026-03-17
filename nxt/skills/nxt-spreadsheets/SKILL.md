---
name: nxt-spreadsheets
description: "Genera hojas de cálculo Excel (.xlsx) para backlogs, sprint
planning, tracking de bugs, métricas, y cualquier dato tabular del proyecto."
---

# NXT Spreadsheets Skill

## Propósito
Crear spreadsheets Excel para gestión de proyecto y tracking.

## Cuándo se Activa
- Crear backlog de producto
- Sprint planning
- Bug tracking
- Métricas y dashboards
- Estimaciones
- Reportes de progreso

## Instrucciones

### 1. Templates Disponibles

#### Backlog de Producto
| Columna | Descripción |
|---------|-------------|
| ID | Identificador único (EPIC-001, STORY-001-01) |
| Epic | Nombre del epic |
| Story Title | Título de la historia |
| Description | Descripción breve |
| Priority | MoSCoW (Must/Should/Could/Won't) |
| Story Points | Estimación en puntos |
| Sprint | Número de sprint asignado |
| Status | New/Ready/In Progress/Done |
| Assignee | Responsable |
| Notes | Notas adicionales |

#### Sprint Planning
| Columna | Descripción |
|---------|-------------|
| Sprint # | Número del sprint |
| Goal | Objetivo del sprint |
| Start Date | Fecha de inicio |
| End Date | Fecha de fin |
| Capacity | Capacidad del equipo (puntos) |
| Committed | Puntos comprometidos |
| Completed | Puntos completados |
| Velocity | Velocidad calculada |
| Status | Planning/Active/Completed |

#### Bug Tracking
| Columna | Descripción |
|---------|-------------|
| Bug ID | Identificador (BUG-001) |
| Title | Título descriptivo |
| Severity | Critical/High/Medium/Low |
| Related Story | Story donde se encontró |
| Status | Open/In Progress/Fixed/Verified/Closed |
| Found By | Quien lo encontró |
| Fixed By | Quien lo arregló |
| Date Found | Fecha de descubrimiento |
| Date Fixed | Fecha de fix |
| Description | Descripción del bug |

#### Test Cases
| Columna | Descripción |
|---------|-------------|
| TC ID | Identificador (TC-001) |
| Feature | Feature que testea |
| Scenario | Escenario de prueba |
| Steps | Pasos para reproducir |
| Expected Result | Resultado esperado |
| Actual Result | Resultado actual |
| Status | Pass/Fail/Blocked/Not Run |
| Priority | High/Medium/Low |

#### Risk Register
| Columna | Descripción |
|---------|-------------|
| Risk ID | Identificador (RISK-001) |
| Description | Descripción del riesgo |
| Category | Technical/Schedule/Resource/External |
| Probability | High/Medium/Low |
| Impact | High/Medium/Low |
| Score | Probability x Impact |
| Mitigation | Plan de mitigación |
| Owner | Responsable |
| Status | Open/Mitigated/Closed |

### 2. Formato Estándar

#### Estilos de Celda
- **Header**: Fondo #3B82F6 (azul), texto blanco, negrita
- **Subtotal**: Fondo #E5E7EB (gris claro), negrita
- **Total**: Fondo #1F2937 (gris oscuro), texto blanco
- **Alternating rows**: Fondo #F9FAFB para mejor legibilidad

#### Funcionalidades
- Filtros automáticos en headers
- Congelar primera fila
- Anchos de columna automáticos
- Validación de datos donde aplique
- Formato condicional para estados

### 3. Fórmulas Comunes

```excel
# Velocidad promedio
=AVERAGE(Completed)

# Burndown
=SUM(StoryPoints) - SUMIF(Status,"Done",StoryPoints)

# Bug rate
=COUNTIF(Severity,"Critical") + COUNTIF(Severity,"High")

# Sprint progress
=SUMIF(Status,"Done",Points)/SUM(Points)*100
```

### 4. Dashboards

#### Sprint Dashboard
```
┌──────────────────────────────────────────────┐
│ Sprint [N] Dashboard                          │
├──────────────────┬───────────────────────────┤
│ Velocity: [X]    │ ████████░░ 80% Complete   │
├──────────────────┼───────────────────────────┤
│ Stories: [X/Y]   │ Bugs: [Critical: X]       │
│ Points: [X/Y]    │       [High: X]           │
└──────────────────┴───────────────────────────┘
```

## Ejemplos de Uso

```
"Crea el backlog en Excel"
"Genera el sprint planning spreadsheet"
"Crea un tracker de bugs"
"Exporta las métricas del proyecto a Excel"
"Crea el risk register del proyecto"
```

## Output
- Archivo .xlsx en docs/[fase]/
- Naming: [proyecto]-[tipo]-[fecha].xlsx
