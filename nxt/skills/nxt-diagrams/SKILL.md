---
name: nxt-diagrams
description: "Genera diagramas técnicos para arquitectura, flujos de usuario,
ERDs, y visualizaciones del sistema usando Mermaid, SVG, o HTML."
---

# NXT Diagrams Skill

## Propósito
Crear diagramas técnicos claros y profesionales.

## Cuándo se Activa
- Diagramas de arquitectura (C4)
- Sequence diagrams
- Flowcharts
- Entity Relationship Diagrams
- User flows
- State diagrams
- Deployment diagrams

## Instrucciones

### 1. Tipos de Diagramas

#### C4 Model (Arquitectura)

**Level 1: System Context**
```mermaid
graph TB
    subgraph "System Context"
        User[("👤 User")]
        System["🖥️ Our System"]
        External["📦 External System"]

        User --> System
        System --> External
    end
```

**Level 2: Container Diagram**
```mermaid
graph TB
    subgraph "Containers"
        WebApp["🌐 Web App<br/>React"]
        API["⚙️ API<br/>Node.js"]
        DB[("🗄️ Database<br/>PostgreSQL")]
        Cache["💾 Cache<br/>Redis"]

        WebApp --> API
        API --> DB
        API --> Cache
    end
```

**Level 3: Component Diagram**
```mermaid
graph TB
    subgraph "API Components"
        Controller["📥 Controllers"]
        Service["⚙️ Services"]
        Repository["📚 Repositories"]

        Controller --> Service
        Service --> Repository
    end
```

#### Sequence Diagrams
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Click Login
    F->>A: POST /auth/login
    A->>D: Query user
    D-->>A: User data
    A-->>F: JWT Token
    F-->>U: Redirect to Dashboard
```

#### Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"

    USER {
        int id PK
        string email UK
        string password_hash
        datetime created_at
    }

    ORDER {
        int id PK
        int user_id FK
        decimal total
        string status
        datetime created_at
    }
```

#### Flowcharts
```mermaid
flowchart TD
    A[Start] --> B{Is user logged in?}
    B -->|Yes| C[Show Dashboard]
    B -->|No| D[Show Login Form]
    D --> E[Submit Credentials]
    E --> F{Valid?}
    F -->|Yes| C
    F -->|No| G[Show Error]
    G --> D
```

#### State Diagrams
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review: Submit
    Review --> Approved: Approve
    Review --> Draft: Request Changes
    Approved --> Published: Publish
    Published --> [*]
```

### 2. Paleta de Colores NXT

| Color | Hex | Uso |
|-------|-----|-----|
| Primary Blue | #3B82F6 | Elementos principales |
| Secondary Orange | #F97316 | Acciones, CTAs |
| Accent Purple | #8B5CF6 | Destacados |
| Success Green | #10B981 | Estados positivos |
| Warning Yellow | #F59E0B | Alertas |
| Error Red | #EF4444 | Errores |
| Neutral Gray | #6B7280 | Texto secundario |
| Background | #F9FAFB | Fondos |

### 3. Estilo de Diagramas

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#3B82F6',
    'primaryTextColor': '#FFFFFF',
    'primaryBorderColor': '#2563EB',
    'lineColor': '#6B7280',
    'secondaryColor': '#F97316',
    'tertiaryColor': '#F9FAFB'
  }
}}%%
```

### 4. Convenciones

#### Naming
- Nodos: PascalCase o descriptivo
- Conexiones: verbos en minúscula
- Subgraphs: Títulos descriptivos

#### Iconos Comunes
- 👤 Usuario
- 🖥️ Sistema/Aplicación
- 🌐 Web
- ⚙️ API/Backend
- 🗄️ Base de datos
- 💾 Cache
- 📦 Servicio externo
- 📱 Mobile

### 5. Output

#### Formatos Disponibles
- **Mermaid**: Embebido en Markdown (preferido)
- **SVG**: Para documentos Word/PDF
- **PNG**: Para presentaciones
- **HTML**: Para diagramas interactivos

#### Ubicación
- `docs/diagrams/` - Diagramas generales
- `docs/3-solutioning/diagrams/` - Arquitectura
- Embebidos en documentos `.md`

## Ejemplos de Uso

```
"Crea un diagrama de arquitectura C4 nivel 2"
"Genera el ERD de la base de datos"
"Crea un sequence diagram del flujo de autenticación"
"Diseña el user flow para el proceso de checkout"
"Crea un state diagram para el ciclo de vida de un pedido"
"Genera el deployment diagram de la infraestructura"
```

## Buenas Prácticas

1. **Simplicidad**: No más de 7-10 elementos por diagrama
2. **Consistencia**: Usar mismos símbolos para mismos conceptos
3. **Jerarquía**: De lo general a lo específico
4. **Etiquetas**: Claras y concisas
5. **Dirección**: Flujo de arriba a abajo o izquierda a derecha
