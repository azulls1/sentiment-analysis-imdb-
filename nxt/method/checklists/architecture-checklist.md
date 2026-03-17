# Architecture Checklist

Use esta checklist para validar que el documento de arquitectura está completo.

## Documentación Visual

- [ ] Diagrama de System Context (C4 Level 1)
- [ ] Diagrama de Containers (C4 Level 2)
- [ ] Diagrama de Components (C4 Level 3) - si es enterprise
- [ ] Diagramas son claros y legibles
- [ ] Leyenda incluida si hay símbolos especiales

## Tech Stack

### Frontend
- [ ] Framework seleccionado y justificado
- [ ] State management definido
- [ ] Solución de estilos elegida
- [ ] Build tools configurados

### Backend
- [ ] Runtime seleccionado y justificado
- [ ] Framework elegido
- [ ] ORM/Data access definido
- [ ] Estructura de proyecto clara

### Base de Datos
- [ ] Tipo de DB seleccionado (SQL/NoSQL)
- [ ] Sistema específico elegido
- [ ] Justificación de la elección
- [ ] Estrategia de migraciones

### Infraestructura
- [ ] Cloud provider seleccionado
- [ ] Servicios específicos identificados
- [ ] Estrategia de deployment
- [ ] CI/CD pipeline definido

## APIs

- [ ] Endpoints principales documentados
- [ ] Formato de request/response definido
- [ ] Autenticación especificada
- [ ] Rate limiting considerado
- [ ] Versionamiento de API definido
- [ ] OpenAPI spec creado (si aplica)

## Modelo de Datos

- [ ] ERD completo
- [ ] Entidades principales definidas
- [ ] Relaciones documentadas
- [ ] Índices recomendados
- [ ] Estrategia de soft delete (si aplica)

## Seguridad

- [ ] Autenticación definida (JWT, OAuth, etc.)
- [ ] Autorización especificada (RBAC, ABAC)
- [ ] Encriptación at rest planificada
- [ ] Encriptación in transit (HTTPS)
- [ ] Manejo de secrets definido
- [ ] OWASP top 10 considerado

## Escalabilidad

- [ ] Estrategia de escalamiento definida
- [ ] Horizontal vs Vertical justificado
- [ ] Caching strategy documentada
- [ ] Load balancing considerado
- [ ] Database scaling planificado

## Resiliencia

- [ ] Error handling strategy
- [ ] Retry policies definidas
- [ ] Circuit breaker (si aplica)
- [ ] Fallback strategies
- [ ] Health checks

## Observabilidad

- [ ] Logging strategy
- [ ] Monitoring approach
- [ ] Alerting definido
- [ ] Tracing (si microservices)

## ADRs (Architecture Decision Records)

- [ ] Decisiones importantes documentadas
- [ ] Cada ADR tiene: contexto, decisión, consecuencias
- [ ] Alternativas consideradas documentadas

## DevOps

- [ ] CI/CD pipeline definido
- [ ] Environments (dev, staging, prod)
- [ ] Deployment strategy (blue-green, canary, etc.)
- [ ] Rollback strategy

## Validación de NFRs

- [ ] Todos los NFRs del PRD tienen solución arquitectónica
- [ ] Performance requirements addressed
- [ ] Security requirements addressed
- [ ] Scalability requirements addressed

---

## Notas de Uso

- Usar esta checklist ANTES de pasar a implementation
- Items marcados N/A deben tener justificación
- Decisiones no obvias deben tener ADR
