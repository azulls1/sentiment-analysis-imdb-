---
name: nxt-presentations
description: "Genera presentaciones profesionales en PowerPoint (.pptx) para
pitches de producto, demos, reportes de sprint, y presentaciones a stakeholders."
---

# NXT Presentations Skill

## Propósito
Crear presentaciones PowerPoint profesionales y visualmente atractivas.

## Cuándo se Activa
- Pitch de PRD
- Demo de sprint
- Presentación a stakeholders
- Reporte ejecutivo
- Kickoff de proyecto

## Instrucciones

### 1. Estilo Visual NXT
- Colores primarios: #3B82F6 (azul), #F97316 (naranja)
- Colores secundarios: #10B981 (verde), #8B5CF6 (púrpura)
- Fondo: Blanco o gris muy claro (#F9FAFB)
- Tipografía: Sans-serif moderna (Calibri, Arial, Inter)
- Íconos: Simples y consistentes

### 2. Estructura Típica

#### PRD Pitch (5-10 slides)
1. Título + problema que resolvemos
2. Solución propuesta
3. Usuarios objetivo
4. Features principales (1-2 slides)
5. Arquitectura de alto nivel
6. Roadmap
7. Próximos pasos
8. Q&A

#### Sprint Demo (3-5 slides)
1. Objetivos del sprint
2. Lo que se completó (con screenshots)
3. Métricas y KPIs
4. Impedimentos encontrados
5. Próximo sprint

#### Kickoff de Proyecto (8-12 slides)
1. Visión del proyecto
2. Objetivos y KPIs
3. Equipo y roles
4. Timeline de alto nivel
5. Tech stack
6. Riesgos y mitigaciones
7. Comunicación y governance
8. Próximos pasos

### 3. Buenas Prácticas
- Máximo 6 bullets por slide
- Una idea principal por slide
- Imágenes > texto cuando sea posible
- Consistencia visual en toda la presentación
- Contraste adecuado para legibilidad
- Animaciones mínimas (solo transiciones suaves)

### 4. Layouts Disponibles

```
[TÍTULO]
┌────────────────────────────────────┐
│                                    │
│         TÍTULO GRANDE              │
│         Subtítulo                  │
│                                    │
└────────────────────────────────────┘

[DOS COLUMNAS]
┌────────────────────────────────────┐
│  Título del Slide                  │
├─────────────────┬──────────────────┤
│                 │                  │
│   Columna 1     │   Columna 2      │
│                 │                  │
└─────────────────┴──────────────────┘

[IMAGEN + TEXTO]
┌────────────────────────────────────┐
│  Título del Slide                  │
├──────────────────┬─────────────────┤
│                  │ • Punto 1       │
│    [IMAGEN]      │ • Punto 2       │
│                  │ • Punto 3       │
└──────────────────┴─────────────────┘

[DIAGRAMA]
┌────────────────────────────────────┐
│  Título del Slide                  │
├────────────────────────────────────┤
│                                    │
│         [DIAGRAMA MERMAID]         │
│                                    │
└────────────────────────────────────┘
```

### 5. Elementos Gráficos

#### Iconos Recomendados
- ✓ Checkmark para completado
- → Flecha para flujos
- ⚡ Rayo para performance
- 🎯 Target para objetivos
- 📈 Gráfico para métricas

#### Colores por Contexto
- Éxito/Positivo: #10B981 (verde)
- Alerta/Atención: #F59E0B (amarillo)
- Error/Crítico: #EF4444 (rojo)
- Información: #3B82F6 (azul)

## Ejemplos de Uso

```
"Crea una presentación pitch del PRD"
"Genera slides para la demo del sprint 1"
"Crea el kickoff deck del proyecto"
"Prepara una presentación ejecutiva del estado del proyecto"
```

## Output
- Archivo .pptx en docs/[fase]/
- Naming: [proyecto]-[tipo]-[fecha].pptx
