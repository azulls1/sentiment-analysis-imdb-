# QA Report: [Story ID / Sprint N]

## Metadata
| Campo | Valor |
|-------|-------|
| Tipo | [Story QA / Sprint QA] |
| Fecha | [YYYY-MM-DD] |
| QA | NXT QA |
| Ambiente | [Staging/QA] |
| Versión | [Commit/Tag] |

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Stories Testeadas | [X] de [Y] |
| Criterios Validados | [X] de [Y] |
| Bugs Encontrados | [N] |
| Bugs Críticos | [N] |
| Bugs Altos | [N] |
| **Recomendación** | **[APPROVED / NOT APPROVED]** |

---

## 1. Stories Validadas

### Story [STORY-ID]: [Título]

#### Criterios de Aceptación
| AC | Descripción | Estado | Notas |
|----|-------------|--------|-------|
| AC-1 | [Descripción] | ✅ Pass | [Notas] |
| AC-2 | [Descripción] | ❌ Fail | [Notas] |
| AC-3 | [Descripción] | ⚠️ Partial | [Notas] |

#### Tests Adicionales
| Test | Estado | Notas |
|------|--------|-------|
| Happy Path | ✅/❌ | |
| Edge Cases | ✅/❌ | |
| Error Handling | ✅/❌ | |
| Responsive | ✅/❌ | |
| Cross-browser | ✅/❌ | |

#### Resultado Story
- **Estado**: [PASSED / FAILED / BLOCKED]
- **Razón**: [Si no pasó, por qué]

---

### Story [STORY-ID-2]: [Título]
[Repetir estructura]

---

## 2. Testing Exploratorio

### Hallazgos
1. **[Área]**: [Descripción del hallazgo]
2. **[Área]**: [Descripción del hallazgo]

### Áreas Exploradas
- [x] [Área 1]
- [x] [Área 2]
- [ ] [Área no explorada - razón]

---

## 3. Bugs Encontrados

### BUG-001: [Título descriptivo]
| Campo | Valor |
|-------|-------|
| Severidad | 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low |
| Story Relacionada | [STORY-ID] |
| Ambiente | [Staging] |
| Browser/Device | [Chrome 120 / Desktop] |
| Status | Open |

**Descripción:**
[Descripción detallada del bug]

**Pasos para reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado esperado:**
[Qué debería pasar]

**Resultado actual:**
[Qué pasa actualmente]

**Evidencia:**
[Screenshot/Video/Log]

---

### BUG-002: [Título]
[Repetir estructura]

---

## 4. Resumen de Bugs

| ID | Título | Severidad | Story | Status |
|----|--------|-----------|-------|--------|
| BUG-001 | [Título] | Critical | STORY-001 | Open |
| BUG-002 | [Título] | High | STORY-002 | Open |
| BUG-003 | [Título] | Medium | STORY-001 | Fixed |

### Por Severidad
| Severidad | Count | Bloqueantes |
|-----------|-------|-------------|
| 🔴 Critical | [N] | Sí |
| 🟠 High | [N] | Sí |
| 🟡 Medium | [N] | No |
| 🟢 Low | [N] | No |

---

## 5. Cobertura de Tests

### Tests Automatizados
| Tipo | Ejecutados | Pasaron | Fallaron | Skip |
|------|------------|---------|----------|------|
| Unit | [N] | [N] | [N] | [N] |
| Integration | [N] | [N] | [N] | [N] |
| E2E | [N] | [N] | [N] | [N] |

### Coverage
| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| Statements | [X]% | 80% | ✅/❌ |
| Branches | [X]% | 75% | ✅/❌ |
| Functions | [X]% | 80% | ✅/❌ |
| Lines | [X]% | 80% | ✅/❌ |

---

## 6. Performance (Si aplica)

| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| Page Load | [X]s | < 3s | ✅/❌ |
| API Response (p95) | [X]ms | < 200ms | ✅/❌ |
| Lighthouse Score | [X] | > 90 | ✅/❌ |

---

## 7. Compatibilidad

### Browsers
| Browser | Versión | Status | Notas |
|---------|---------|--------|-------|
| Chrome | 120 | ✅ | |
| Firefox | 121 | ✅ | |
| Safari | 17 | ✅ | |
| Edge | 120 | ✅ | |

### Dispositivos
| Dispositivo | Resolución | Status | Notas |
|-------------|------------|--------|-------|
| Desktop | 1920x1080 | ✅ | |
| Tablet | 768x1024 | ✅ | |
| Mobile | 375x667 | ✅ | |

---

## 8. Seguridad (Básica)

| Check | Status | Notas |
|-------|--------|-------|
| Input validation | ✅/❌ | |
| Auth required on protected routes | ✅/❌ | |
| No sensitive data in responses | ✅/❌ | |
| HTTPS enforced | ✅/❌ | |

---

## 9. Recomendaciones

### Para el Dev Team
1. [Recomendación 1]
2. [Recomendación 2]

### Para Próximo Sprint
1. [Recomendación 1]
2. [Recomendación 2]

### Mejoras de UX Observadas
1. [Observación 1]
2. [Observación 2]

---

## 10. Veredicto Final

### Resultado
| | |
|-|-|
| **Veredicto** | **[APPROVED / NOT APPROVED]** |
| **Razón** | [Justificación del veredicto] |

### Condiciones para Release (si APPROVED)
- [ ] Bugs críticos y altos resueltos
- [ ] Tests automatizados pasando
- [ ] Performance dentro de targets

### Condiciones para Re-test (si NOT APPROVED)
- [ ] [Bug crítico 1] resuelto
- [ ] [Bug crítico 2] resuelto
- [ ] [AC fallido] implementado

---

## Historial

| Fecha | Versión | Resultado | Notas |
|-------|---------|-----------|-------|
| [Fecha] | 1.0 | NOT APPROVED | [X] bugs críticos |
| [Fecha] | 1.1 | APPROVED | Bugs resueltos |

---

**QA Sign-off:**
- NXT QA: _________________ Fecha: _____________
