# Story Checklist (INVEST)

Use esta checklist para validar que cada story cumple con los criterios INVEST.

## I - Independent (Independiente)

- [ ] Puede desarrollarse independiente de otras stories
- [ ] No tiene dependencias bloqueantes activas
- [ ] Si tiene dependencias, están documentadas y resueltas
- [ ] Puede ser priorizada y movida en el backlog libremente

## N - Negotiable (Negociable)

- [ ] Describe QUÉ se necesita, no CÓMO hacerlo
- [ ] Deja espacio para decisiones técnicas
- [ ] No prescribe implementación específica
- [ ] Permite flexibilidad en el approach

## V - Valuable (Valiosa)

- [ ] Entrega valor al usuario o al negocio
- [ ] El valor es claro y articulable
- [ ] El stakeholder puede entender el beneficio
- [ ] No es solo "tarea técnica" sin valor visible

## E - Estimable (Estimable)

- [ ] El equipo puede estimar el esfuerzo
- [ ] No hay incertidumbre técnica bloqueante
- [ ] El scope es claro
- [ ] Si hay spike necesario, está identificado

## S - Small (Pequeña)

- [ ] Completable en un sprint
- [ ] Idealmente 1-3 días de trabajo
- [ ] Si tiene más de 8 puntos, considerar dividir
- [ ] No intenta hacer demasiado

## T - Testable (Testeable)

- [ ] Criterios de aceptación claros
- [ ] Cada criterio es verificable objetivamente
- [ ] Define comportamiento esperado específico
- [ ] QA puede validar sin ambigüedad

---

## Formato de la Story

### User Story
- [ ] Formato "Como [rol] quiero [funcionalidad] para [beneficio]"
- [ ] Rol es específico (no "usuario genérico")
- [ ] Funcionalidad es clara
- [ ] Beneficio explica el "por qué"

### Criterios de Aceptación
- [ ] Formato Given-When-Then
- [ ] Entre 3-7 criterios (ni muy pocos ni demasiados)
- [ ] Incluye happy path
- [ ] Incluye edge cases principales
- [ ] Cada criterio es atómico (una sola validación)

### Metadata
- [ ] Tiene ID único
- [ ] Epic asignado
- [ ] Prioridad definida (MoSCoW)
- [ ] Estimación en puntos
- [ ] Sprint asignado (o en Backlog)

### Información Adicional
- [ ] Notas técnicas relevantes
- [ ] Referencias a mockups/wireframes (si hay UI)
- [ ] Dependencias documentadas
- [ ] Definition of Done claro

---

## Story Context (si aplica)

- [ ] Story context generado (*story-context)
- [ ] Archivos a modificar identificados
- [ ] Archivos a crear identificados
- [ ] Patrones a seguir documentados
- [ ] Código de referencia incluido

---

## Red Flags - Story Necesita Refinamiento

- ⚠️ Estimación > 8 puntos (dividir)
- ⚠️ Más de 7 criterios de aceptación (dividir)
- ⚠️ Palabras vagas: "mejorar", "optimizar", "flexible"
- ⚠️ No hay criterios de aceptación
- ⚠️ Criterios de aceptación no son verificables
- ⚠️ Depende de otra story no completada
- ⚠️ Scope no claro ("hacer el módulo de usuarios")

---

## Notas de Uso

- Usar esta checklist en refinement
- Una story no está "Ready" hasta cumplir INVEST
- Mejor dividir que tener stories grandes
- Discutir red flags con el equipo
