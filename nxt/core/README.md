# NXT-CORE

## Filosofía

NXT-CORE (Next-generation eXtended Team) es el motor de orquestación que
permite a UN SOLO DESARROLLADOR trabajar como un EQUIPO COMPLETO.

## Principio Fundamental

> "No reemplazamos al desarrollador, lo AMPLIFICAMOS"

El framework NO automatiza todo. El desarrollador mantiene el control y
la toma de decisiones. Los agentes AI actúan como:
- Consultores especializados
- Revisores de calidad
- Generadores de documentación
- Aceleradores de tareas repetitivas

## Componentes

1. **Orchestrator**: Coordina agentes y detecta tipo de proyecto
2. **Workflow Engine**: Ejecuta workflows adaptativos
3. **Config System**: Gestiona configuración persistente
4. **Context Manager**: Mantiene contexto entre sesiones
5. **Skill Loader**: Carga skills de Claude dinámicamente

## Comandos Base

| Comando | Descripción |
|---------|-------------|
| `/nxt/init` | Inicializa NXT en un proyecto |
| `/nxt/status` | Muestra estado actual del proyecto |
| `/nxt/help` | Muestra ayuda contextual |
| `/nxt/[agente]` | Activa un agente específico |

## Detección de Proyecto

NXT detecta automáticamente si es:
- **Greenfield**: Proyecto nuevo desde cero
- **Brownfield**: Proyecto existente a modificar/extender

Criterios de detección:
- Existencia de código fuente
- Presencia de package.json, requirements.txt, etc.
- Documentación existente
- Historial de git
