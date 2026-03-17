# ADR-005: Forest Design System (CSS-only)

**Fecha:** 2026-02-01
**Estado:** Accepted

## Contexto

Necesitamos un sistema de diseno coherente para el frontend que soporte dark theme, sea ligero, no tenga dependencias JS, y funcione bien con Angular + Tailwind CSS v4.

## Decision

**Forest Design System**: Sistema CSS-only con 8 modulos independientes.

## Modulos

```
forest-design-system/
  css/
    forest-theme.css          # Variables CSS, colores, tipografia
    forest-components.css     # Botones, cards, modals, badges
    forest-layout.css         # Grid, flex, containers
    forest-dark-surface.css   # Dark theme surfaces
    forest-animations.css     # Transiciones y animaciones
    forest-utilities.css      # Utility classes
    forest-print.css          # Estilos para impresion
    forest.css                # Importa todos los modulos
  styles.css                  # Entry point
```

## Consecuencias

### Positivas
- Zero JS overhead (solo CSS)
- Dark theme nativo
- Print-friendly para exportacion PDF
- Compatible con Tailwind CSS v4 (utility-first complementario)

### Negativas
- Mantenimiento manual (no component library)
