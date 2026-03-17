# QA Validation Checklist

Use esta checklist para validar stories antes de marcarlas como Done.

## Validación de Criterios de Aceptación

Para CADA criterio de aceptación:
- [ ] Ejecutar el escenario descrito
- [ ] Verificar el resultado esperado
- [ ] Documentar resultado (Pass/Fail)
- [ ] Si Fail, crear bug report

## Testing Funcional

### Happy Path
- [ ] La funcionalidad principal funciona correctamente
- [ ] Los datos se guardan/actualizan correctamente
- [ ] Los mensajes de éxito se muestran
- [ ] La navegación es correcta

### Edge Cases
- [ ] Inputs vacíos manejados
- [ ] Inputs máximos manejados
- [ ] Caracteres especiales manejados
- [ ] Datos duplicados manejados

### Error Handling
- [ ] Errores de validación muestran mensajes claros
- [ ] Errores de servidor se manejan gracefully
- [ ] No hay crashes/exceptions no manejadas
- [ ] El usuario puede recuperarse de errores

## Testing de UI/UX

### Visual
- [ ] UI coincide con mockups/diseños
- [ ] Elementos están alineados correctamente
- [ ] Colores y fuentes son correctos
- [ ] Imágenes cargan correctamente

### Responsiveness
- [ ] Funciona en desktop (1920x1080)
- [ ] Funciona en tablet (768px)
- [ ] Funciona en mobile (375px)
- [ ] No hay elementos cortados o desbordados

### Estados
- [ ] Loading states se muestran
- [ ] Empty states se muestran
- [ ] Error states se muestran
- [ ] Disabled states funcionan

### Usabilidad
- [ ] La navegación es intuitiva
- [ ] Los botones/links son clickeables
- [ ] El feedback es inmediato
- [ ] No hay dead ends

## Testing de Integración

- [ ] APIs retornan datos correctos
- [ ] Los datos persisten en la DB
- [ ] Las integraciones externas funcionan
- [ ] Los webhooks/eventos se disparan

## Testing de Compatibilidad

### Browsers
- [ ] Chrome (última versión)
- [ ] Firefox (última versión)
- [ ] Safari (si aplica)
- [ ] Edge (si aplica)

### Dispositivos
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

## Testing de Performance

- [ ] Página carga en <3 segundos
- [ ] No hay memory leaks obvios
- [ ] No hay llamadas API innecesarias
- [ ] Las imágenes están optimizadas

## Testing de Seguridad (Básico)

- [ ] No hay datos sensibles expuestos
- [ ] Las rutas protegidas requieren auth
- [ ] No hay inyección posible en forms
- [ ] Los permisos se respetan

## Testing de Accesibilidad (Básico)

- [ ] Se puede navegar con teclado
- [ ] Contraste de colores es suficiente
- [ ] Imágenes tienen alt text
- [ ] Forms tienen labels

---

## Documentación de Resultados

### Template de QA Report por Story

```markdown
# QA Report: [STORY-ID]

## Fecha: [fecha]
## QA: NXT QA

## Criterios de Aceptación
| AC | Descripción | Estado | Notas |
|----|-------------|--------|-------|
| AC-1 | [descripción] | ✅/❌ | [notas] |
| AC-2 | [descripción] | ✅/❌ | [notas] |

## Tests Adicionales
| Test | Estado | Notas |
|------|--------|-------|
| Happy Path | ✅/❌ | |
| Edge Cases | ✅/❌ | |
| Error Handling | ✅/❌ | |
| Responsive | ✅/❌ | |
| Cross-browser | ✅/❌ | |

## Bugs Encontrados
| Bug ID | Descripción | Severidad |
|--------|-------------|-----------|
| BUG-001 | [descripción] | [Critical/High/Medium/Low] |

## Veredicto
- [ ] **APPROVED**: Todos los ACs pasan, sin bugs críticos
- [ ] **APPROVED con observaciones**: Pasa pero hay mejoras
- [ ] **NOT APPROVED**: Hay ACs que fallan o bugs críticos
```

---

## Criterios de Severidad de Bugs

| Severidad | Descripción | Ejemplo |
|-----------|-------------|---------|
| Critical | Bloquea uso, pérdida de datos | App crashes, datos se pierden |
| High | Feature principal no funciona | Login no funciona |
| Medium | Feature secundaria afectada | Filtro no funciona |
| Low | Cosmético, typos | Texto mal alineado |

---

## Notas de Uso

- Ejecutar tests en ambiente staging/QA
- Documentar pasos para reproducir bugs
- Incluir screenshots cuando sea útil
- No aprobar si hay bugs Critical o High
