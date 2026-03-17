# BMAD Method v6 - Modulo Base

> **NOTA**: Este directorio contiene el modulo BMAD base para referencia y compatibilidad.
> Para el framework principal, usa los componentes en la raiz del proyecto.

## Estado

| Componente | Ubicacion Principal | Este Modulo (Referencia) |
|------------|---------------------|--------------------------|
| Config | `.nxt/nxt.config.yaml` | ~~`_cfg/`~~ (eliminado) |
| Agentes | `agentes/nxt-*.md` | `method/agents/` |
| Skills | `skills/**/*.md` | `skills/*/SKILL.md` |
| Workflows | `workflows/*/*.md` | `method/workflows/` |

## Cuando Usar Este Modulo

### Usar para:
- Workflows avanzados de BMAD (brownfield, etc.)
- Checklists de calidad detallados
- Templates BMAD originales
- Referencia de la metodologia BMAD v6

### NO usar para:
- Configuracion (usar `.nxt/`)
- Agentes principales (usar `agentes/`)
- Skills con integraciones (usar `skills/`)

## Estructura

```
nxt/
├── core/                  # Motor base BMAD
│   ├── README.md
│   └── orchestrator.md
├── method/                # Metodologia BMAD
│   ├── agents/            # 12 agentes BMAD
│   │   ├── analysis/      # analyst, researcher
│   │   ├── planning/      # pm, po
│   │   ├── solutioning/   # architect, ux, tech-lead, test-architect
│   │   └── implementation/# sm, dev, reviewer, qa
│   ├── workflows/         # Workflows detallados
│   │   ├── 1-analysis/
│   │   ├── 2-planning/
│   │   ├── 3-solutioning/
│   │   ├── 4-implementation/
│   │   └── brownfield/    # Workflows para proyectos existentes
│   ├── checklists/        # Checklists de calidad
│   │   ├── prd-checklist.md
│   │   ├── architecture-checklist.md
│   │   ├── story-checklist.md
│   │   ├── code-review-checklist.md
│   │   └── qa-checklist.md
│   └── templates/         # Templates BMAD
├── skills/                # Skills BMAD originales
│   ├── nxt-docs/
│   ├── nxt-presentations/
│   ├── nxt-spreadsheets/
│   ├── nxt-diagrams/
│   ├── nxt-code/
│   └── nxt-testing/
├── builder/               # Para crear custom agents
│   ├── README.md
│   └── templates/
└── prompts/               # Prompts del sistema
    └── master-prompt.md
```

## Agentes BMAD (Referencia)

### Fase 1: Analysis
- `analyst.agent.md` - Investigacion y brainstorming
- `researcher.agent.md` - Investigacion tecnica/mercado

### Fase 2: Planning
- `pm.agent.md` - Product Manager
- `po.agent.md` - Product Owner

### Fase 3: Solutioning
- `architect.agent.md` - Arquitecto de software
- `ux.agent.md` - Disenador UX
- `tech-lead.agent.md` - Lider tecnico
- `test-architect.agent.md` - Arquitecto de testing

### Fase 4: Implementation
- `sm.agent.md` - Scrum Master
- `dev.agent.md` - Desarrollador
- `reviewer.agent.md` - Revisor de codigo
- `qa.agent.md` - Quality Assurance

## Checklists Disponibles

Los checklists en `method/checklists/` son utiles para validacion:

| Checklist | Uso |
|-----------|-----|
| `prd-checklist.md` | Validar PRD completo |
| `architecture-checklist.md` | Validar arquitectura |
| `story-checklist.md` | Validar stories |
| `code-review-checklist.md` | Revision de codigo |
| `qa-checklist.md` | Validacion QA |

## Workflows Brownfield

Para proyectos existentes, usa los workflows en `method/workflows/brownfield/`:

```
*document-project     -> Documentar proyecto existente
*analyze-codebase     -> Analizar codigo existente
*risk-assessment      -> Evaluar riesgos
*regression-testing   -> Tests de regresion
```

## Basado en

- [BMAD-METHOD v6 Alpha](https://github.com/bmad-code-org/BMAD-METHOD)
- [Anthropic Skills](https://github.com/anthropics/skills)

---

**Modulo base BMAD - Para referencia y compatibilidad**
