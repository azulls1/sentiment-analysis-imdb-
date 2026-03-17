# NXT Builder

## Propósito

NXT Builder permite crear agentes personalizados para necesidades específicas
del proyecto o empresa.

## Crear un Custom Agent

### 1. Estructura del Agente

```markdown
# [Nombre] Agent

## Identidad
Eres **[Nombre]**, [rol en el equipo].

## Fase
**[FASE]** (Fase [N])

## Personalidad
"[Nombre corto]" - [3-4 características de personalidad]

## Responsabilidades

1. **[Responsabilidad 1]**
   - [Tarea]
   - [Tarea]

2. **[Responsabilidad 2]**
   - [Tarea]
   - [Tarea]

## Workflows

| Comando | Descripción |
|---------|-------------|
| `*[comando]` | [Descripción] |

## Outputs

- `[path/to/output]`

## Activación

> "*agent [nombre]"
> "*[comando-principal]"

## Transición
→ Siguiente: **[Agente siguiente]**
```

### 2. Ubicación

Guarda tu agente en:
```
nxt/method/agents/[fase]/[nombre].agent.md
```

### 3. Registro

Agrega el agente a `nxt/_cfg/nxt.config.yaml`:

```yaml
agents:
  [fase]:
    - [nombre-existente]
    - [tu-nuevo-agente]  # Agregar aquí
```

## Ejemplos de Custom Agents

### DevOps Agent
Para equipos que necesitan automatización de infraestructura.

### Security Agent
Para proyectos con requisitos de seguridad especiales.

### Data Analyst Agent
Para proyectos con fuerte componente de datos.

### Documentation Agent
Para proyectos que requieren documentación extensa.

## Buenas Prácticas

1. **Personalidad distintiva**: Dale una personalidad que lo haga memorable
2. **Responsabilidades claras**: Evita solapamiento con agentes existentes
3. **Workflows específicos**: Comandos únicos para sus tareas
4. **Outputs definidos**: Qué documentos/artefactos genera
5. **Transiciones claras**: Cómo se conecta con otros agentes

## Template Completo

Ver `nxt/builder/templates/agent-template.md` para un template completo.

---

## Sistema Sidecar (BMAD v6 Alpha)

El sistema Sidecar permite personalizar agentes existentes sin modificar
los archivos originales. Es ideal para:

- Agregar convenciones de tu equipo
- Definir stack tecnológico preferido
- Incluir contexto específico del proyecto

### Crear un Sidecar

```bash
# Crear sidecar para un agente
touch agentes/nxt-dev.sidecar.md
```

### Contenido del Sidecar

```markdown
# Sidecar: NXT Dev

## Extensiones
- Stack preferido
- Templates adicionales
- Convenciones de código

## Restricciones
- Lo que NO debe hacer el agente

## Contexto
- Información específica del proyecto
```

**Documentación completa:** Ver `nxt/builder/sidecar-system.md`
