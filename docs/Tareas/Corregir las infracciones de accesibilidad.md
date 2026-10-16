---
Nombre: Corregir las infracciones de accesibilidad
Estado: Pendiente
Resumen: AXE falla en 7 de 8 vistas (listado, detalle y vista compartida, en tema claro y oscuro) por contraste insuficiente (entre otros, #FF9500 y #34C759) y por botones y controles sin nombre accesible, incluido el selector de color.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-16T21:45:00+02:00
---

# Corregir las infracciones de accesibilidad

## Contexto

Pendiente de la auditoría del 2026-10-16. La regla de WCAG AA existía sin
ninguna comprobación. La primera ejecución de `pnpm run test:a11y`
(`e2e/a11y.spec.ts`), el 2026-10-16, dio 7 fallos y 1 éxito (el detalle en tema
oscuro). Reglas de AXE infringidas: `color-contrast` y `button-name`, con botones
o controles que no tienen nombre accesible por ninguna vía (label explícito o
implícito, `aria-label`, `aria-labelledby`).

## Alcance

- Nombres accesibles en los botones de icono y en las muestras del selector de
  color (`aria-label`, `aria-pressed`).
- Labels asociados a todos los campos del formulario.
- Contraste AA de los colores de tarjeta y de estado (`#FF9500`, `#34C759`):
  ajustar los tokens y documentarlo en
  [[Decisiones visuales/Decisiones visuales.base|Decisiones visuales]].
- Revisión manual de teclado y foco.

## Verificación

`pnpm run test:a11y` sin infracciones y el job `Seguridad` en verde. Después,
marcar el job como obligatorio en `master`
([[Seguridad/Checklist de lanzamiento|checklist]]).
