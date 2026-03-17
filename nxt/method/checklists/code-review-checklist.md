# Code Review Checklist

Use esta checklist para revisar código antes de aprobar un PR/merge.

## Funcionalidad

- [ ] ¿El código cumple con TODOS los criterios de aceptación?
- [ ] ¿Los edge cases están manejados correctamente?
- [ ] ¿El error handling es apropiado?
- [ ] ¿La funcionalidad trabaja como se espera?
- [ ] ¿No hay regresiones obvias?

## Calidad del Código

### Legibilidad
- [ ] ¿Los nombres de variables/funciones son descriptivos?
- [ ] ¿El código es autoexplicativo?
- [ ] ¿Los comentarios (si hay) son necesarios y útiles?
- [ ] ¿La estructura es clara y fácil de seguir?

### Mantenibilidad
- [ ] ¿Las funciones son pequeñas y enfocadas (<20 líneas)?
- [ ] ¿Se sigue el principio de Single Responsibility?
- [ ] ¿No hay código duplicado (DRY)?
- [ ] ¿El código es fácil de modificar/extender?

### Consistencia
- [ ] ¿Sigue las convenciones del proyecto?
- [ ] ¿El estilo es consistente con el resto del codebase?
- [ ] ¿Los imports están ordenados correctamente?
- [ ] ¿El formato es correcto (prettier/linting)?

## Tests

- [ ] ¿Hay tests para la nueva funcionalidad?
- [ ] ¿Los tests cubren happy path?
- [ ] ¿Los tests cubren edge cases?
- [ ] ¿El coverage es >80%?
- [ ] ¿Los tests son legibles y mantenibles?
- [ ] ¿Los tests pasan consistentemente (no flaky)?

## Seguridad

- [ ] ¿No hay secrets/credentials hardcodeados?
- [ ] ¿Los inputs del usuario están validados?
- [ ] ¿No hay SQL injection posible?
- [ ] ¿No hay XSS posible?
- [ ] ¿La autenticación/autorización es correcta?
- [ ] ¿Los datos sensibles están protegidos?

## Performance

- [ ] ¿No hay N+1 queries?
- [ ] ¿Se usa caching donde es apropiado?
- [ ] ¿No hay memory leaks obvios?
- [ ] ¿Los algoritmos son eficientes?
- [ ] ¿No hay operaciones bloqueantes innecesarias?

## API Design (si aplica)

- [ ] ¿Los endpoints siguen convenciones REST?
- [ ] ¿Los responses son consistentes?
- [ ] ¿Los errores devuelven información útil?
- [ ] ¿Hay validación de input?
- [ ] ¿La documentación está actualizada?

## Base de Datos (si aplica)

- [ ] ¿Las migraciones son reversibles?
- [ ] ¿Los índices necesarios están creados?
- [ ] ¿No hay cambios breaking a datos existentes?
- [ ] ¿Las queries son eficientes?

## UI/UX (si aplica)

- [ ] ¿La UI coincide con el diseño/mockup?
- [ ] ¿Es responsive?
- [ ] ¿Los estados de loading/error están manejados?
- [ ] ¿Es accesible (a11y)?
- [ ] ¿La UX es intuitiva?

---

## Tipos de Comentarios en Review

| Emoji | Tipo | Significado | Bloquea? |
|-------|------|-------------|----------|
| 🚫 | Blocker | Debe arreglarse | Sí |
| 🐛 | Bug | Error que causará problemas | Sí |
| 🔒 | Security | Problema de seguridad | Sí |
| ⚡ | Performance | Problema de rendimiento | Depende |
| 🎨 | Style | Convención de código | No |
| 💡 | Suggestion | Mejora opcional | No |
| ❓ | Question | Necesito clarificación | Depende |
| 👍 | Praise | Buen trabajo | No |
| 📝 | Nitpick | Detalle menor | No |

---

## Formato de Comentario

```markdown
[EMOJI] **[Archivo:Línea]**

[Descripción del problema o sugerencia]

**Por qué**: [Explicación]

**Sugerencia**:
```[language]
// código sugerido
```
```

---

## Decisión Final

- [ ] **APPROVE**: Todo bien, listo para merge
- [ ] **APPROVE con comentarios**: Bien, pero hay sugerencias opcionales
- [ ] **REQUEST CHANGES**: Hay blockers que resolver

---

## Notas de Uso

- Ser constructivo, no crítico
- Explicar el "por qué" de las sugerencias
- Reconocer el buen trabajo también
- Si no entiendes algo, pregunta en lugar de asumir
