# Agent Sidecar System

> **Basado en:** BMAD v6 Alpha - Agent Sidecar Customization
> **Propósito:** Personalizar agentes sin modificar archivos core

## Concepto

El sistema Sidecar permite **extender o modificar** el comportamiento de
cualquier agente NXT sin tocar los archivos originales. Los sidecars son
archivos complementarios que se cargan junto con el agente principal.

## Estructura

```
agentes/
├── nxt-dev.md                  # Agente original (no modificar)
├── nxt-dev.sidecar.md          # Tu personalización (opcional)
├── nxt-api.md                  # Agente original
└── nxt-api.sidecar.md          # Tu personalización
```

## Cómo Funciona

1. Usuario activa `/nxt/dev`
2. Sistema carga `nxt-dev.md` (base)
3. Sistema busca `nxt-dev.sidecar.md`
4. Si existe, **merge** las instrucciones
5. Agente ejecuta con personalización

```
┌─────────────────┐     ┌─────────────────┐
│   nxt-dev.md    │  +  │ nxt-dev.sidecar │
│   (Base Agent)  │     │  (Tu Custom)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
           ┌─────────────────┐
           │  Merged Agent   │
           │ (Base + Custom) │
           └─────────────────┘
```

## Crear un Sidecar

### Paso 1: Crear el Archivo

```bash
# Crear sidecar para el agente Dev
touch agentes/nxt-dev.sidecar.md
```

### Paso 2: Definir Personalizaciones

```markdown
# Sidecar: NXT Dev

## Extensiones

### Stack Preferido
- Framework: Next.js 14+ con App Router
- Styling: Tailwind CSS
- State: Zustand
- Testing: Vitest + Playwright

### Convenciones de Código
- Usar TypeScript estricto
- Componentes funcionales siempre
- Hooks personalizados en `/hooks`
- Utils en `/lib`

### Patrones Requeridos
- Repository pattern para data access
- Factory pattern para creación de objetos
- Dependency injection con contexto

### Prohibiciones
- No usar `any` en TypeScript
- No usar CSS-in-JS (usar Tailwind)
- No usar class components
- No commitear console.log

### Templates Adicionales

#### Componente React
\`\`\`tsx
interface ${Name}Props {
  // props here
}

export function ${Name}({ }: ${Name}Props) {
  return (
    <div>
      {/* content */}
    </div>
  );
}
\`\`\`

#### Hook Custom
\`\`\`tsx
export function use${Name}() {
  const [state, setState] = useState();

  return { state };
}
\`\`\`
```

## Tipos de Personalización

### 1. Extensiones (ADD)

Agregar nuevas capacidades:

```markdown
## Extensiones

### Nuevos Comandos
| Comando | Acción |
|---------|--------|
| `*scaffold` | Generar estructura de componente |
| `*hook` | Crear hook personalizado |
```

### 2. Modificaciones (MODIFY)

Cambiar comportamiento existente:

```markdown
## Modificaciones

### Cambiar Template de Función
En lugar del template default, usar:
\`\`\`typescript
// Preferir arrow functions
const myFunction = () => {
  // ...
};
\`\`\`
```

### 3. Restricciones (RESTRICT)

Limitar comportamientos:

```markdown
## Restricciones

### NO hacer
- No generar código sin tipos
- No crear archivos .js (solo .ts/.tsx)
- No usar require() - solo import
```

### 4. Contexto (CONTEXT)

Agregar conocimiento del proyecto:

```markdown
## Contexto del Proyecto

### Arquitectura
Este proyecto usa Clean Architecture:
- `domain/` - Entidades y reglas de negocio
- `application/` - Casos de uso
- `infrastructure/` - Implementaciones externas
- `presentation/` - UI y controllers

### Dependencias Clave
- Prisma para ORM
- Zod para validación
- React Query para data fetching
```

## Ejemplos Completos

### Sidecar para Equipo Frontend

```markdown
# Sidecar: NXT UIDev - Equipo Frontend

## Contexto
Somos el equipo frontend de [Empresa].
Usamos Design System interno: `@empresa/ui`

## Stack Obligatorio
- React 18+
- TypeScript 5+
- Tailwind CSS
- @empresa/ui para componentes base

## Convenciones
- Atomic Design para estructura
- Storybook para documentación
- Testing con React Testing Library

## Templates

### Componente con Design System
\`\`\`tsx
import { Button, Card } from '@empresa/ui';

interface ${Name}Props {}

export function ${Name}({}: ${Name}Props) {
  return (
    <Card>
      <Button variant="primary">
        Action
      </Button>
    </Card>
  );
}
\`\`\`
```

### Sidecar para Proyecto Específico

```markdown
# Sidecar: NXT Dev - Proyecto E-commerce

## Contexto del Proyecto
E-commerce con:
- Next.js 14 App Router
- Stripe para pagos
- Prisma + PostgreSQL
- Redis para cache

## Módulos
- `/app/(shop)` - Tienda pública
- `/app/(admin)` - Panel de admin
- `/app/api` - API Routes

## Entidades Principales
- User, Product, Order, Cart, Payment

## Patrones Específicos
- Usar Server Components por defecto
- Client Components solo cuando necesario
- Server Actions para mutaciones
```

## Carga de Sidecars

### Automática

Los sidecars se cargan automáticamente si existen:

```
/nxt/dev
  → Carga nxt-dev.md
  → Busca nxt-dev.sidecar.md
  → Si existe, aplica extensiones
```

### Manual (Múltiples Sidecars)

```markdown
# En tu sidecar principal
## Include
- ./sidecars/typescript-strict.md
- ./sidecars/empresa-conventions.md
- ./sidecars/project-specific.md
```

## Sidecars Compartidos

Crear sidecars reutilizables:

```
agentes/sidecars/
├── typescript-strict.md      # Reglas TypeScript estrictas
├── react-patterns.md         # Patrones React
├── api-conventions.md        # Convenciones de API
└── testing-standards.md      # Estándares de testing
```

Incluir en tu sidecar:

```markdown
## Includes
- sidecars/typescript-strict.md
- sidecars/react-patterns.md
```

## Validación de Sidecars

```bash
# Validar que el sidecar es correcto
python herramientas/validate_sidecar.py agentes/nxt-dev.sidecar.md

# Output:
# ✓ Sidecar válido para nxt-dev
# ✓ 3 extensiones encontradas
# ✓ 2 restricciones encontradas
# ✓ 1 template adicional
```

## Mejores Prácticas

1. **No duplicar** - Solo agregar lo que cambia
2. **Ser específico** - Contexto claro del proyecto
3. **Mantener actualizado** - Reflejar cambios del equipo
4. **Documentar razones** - Por qué cada regla existe
5. **Versionar** - Commitear sidecars con el proyecto

---

*Agent Sidecar System - Personalización sin fragmentación*
