---
name: nxt-docs
description: "Genera documentos profesionales en formato Word (.docx) siguiendo
los estándares de NXT. Usa este skill para crear PRDs, documentos de
arquitectura, reportes de QA, briefs de proyecto, y cualquier documentación
formal del proyecto."
---

# NXT Docs Skill

## Propósito
Generar documentos Word profesionales con formato consistente para todos
los entregables del framework NXT.

## Cuándo se Activa
- Crear PRD
- Crear documento de arquitectura
- Crear project brief
- Crear QA report
- Cualquier documento formal .docx

## Instrucciones

### 1. Formato Estándar NXT
- Fuente: Calibri 11pt para cuerpo
- Títulos: Calibri Bold, jerarquía clara
- Márgenes: 2.5cm todos los lados
- Numeración de páginas: inferior derecha
- Header: Logo NXT (si disponible) + nombre del proyecto

### 2. Estructura de Documentos

#### PRD
1. Portada con metadata
2. Tabla de contenidos
3. Secciones numeradas
4. Tablas para requisitos
5. Firma/aprobación al final

#### Architecture Document
1. Portada
2. Diagrams embebidos
3. Tablas de tech stack
4. Secciones técnicas
5. ADRs como anexos

#### QA Report
1. Resumen ejecutivo
2. Métricas visuales
3. Tablas de bugs
4. Veredicto destacado

### 3. Proceso de Generación
1. Recopilar contenido de los documentos fuente
2. Aplicar template correspondiente
3. Generar .docx con estructura apropiada
4. Guardar en docs/[fase]/

### 4. Tipos de Documentos Soportados

| Tipo | Ubicación | Template |
|------|-----------|----------|
| Project Brief | docs/1-analysis/ | brief-template |
| Market Research | docs/1-analysis/ | research-template |
| PRD | docs/2-planning/ | prd-template |
| Architecture | docs/3-solutioning/ | arch-template |
| Tech Spec | docs/3-solutioning/tech-specs/ | techspec-template |
| QA Report | docs/4-implementation/ | qa-template |

## Ejemplos de Uso

```
"Crea el PRD en formato Word"
"Genera el documento de arquitectura como .docx"
"Crea el QA report del sprint 1"
"Exporta el project brief a Word"
```

## Metadatos del Documento

Cada documento generado debe incluir:
- Título del proyecto
- Versión del documento
- Fecha de creación
- Autor (NXT + rol del agente)
- Estado (Draft/Review/Approved)
