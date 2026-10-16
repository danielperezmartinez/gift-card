---
Nombre: Corregir las infracciones de accesibilidad
Estado: Hecha
Resumen: AXE pasa sin infracciones en 14 vistas (listado, detalle, compartida, formulario y páginas legales, en claro y oscuro) tras la paleta AA, los tokens nuevos, los nombres accesibles, el label del importe, el diálogo del formulario y las tarjetas navegables con teclado.
Decisiones: ["[[Paleta y tokens con contraste AA]]"]
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-17T10:30:00+02:00
---

# Corregir las infracciones de accesibilidad

## Contexto

Pendiente de la auditoría del 2026-10-16. La primera ejecución de
`pnpm run test:a11y` dio 7 fallos de 8 (`color-contrast` y `button-name`).

## Alcance

- Contraste: [[Paleta y tokens con contraste AA]].
- Nombres accesibles en los botones de icono (eliminar, añadir, tema) y en las
  muestras de color (`aria-label` con el nombre del color y `aria-pressed`).
- Label del importe del gasto; formulario como `role="dialog"` con título,
  foco inicial y cierre con Escape.
- En el listado, la tarjeta es un enlace real y el botón de eliminar queda
  fuera de él, visible con foco y en pantallas táctiles.
- Jerarquía de encabezados (`h1` por vista) y anillo de foco global.

## Verificación

- `pnpm run test:a11y`: 14/14 sin infracciones (2026-10-17). Cada vista
  comprueba además su `h1`, para no validar una pantalla vacía o de error.
- Revisión de teclado en el build de producción: orden de tabulación tema →
  tarjeta → eliminar → añadir → enlaces legales, foco visible en todos, Enter
  abre la tarjeta, el diálogo recibe el foco y se cierra con Escape.
- Pendiente fuera del código: revisión con lector de pantalla y marcar el job
  `Seguridad` como obligatorio en `master` (ver
  [[Seguridad/Checklist de lanzamiento|checklist]]).
