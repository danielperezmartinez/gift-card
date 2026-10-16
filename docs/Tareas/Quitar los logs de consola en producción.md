---
Nombre: Quitar los logs de consola en producción
Estado: Hecha
Resumen: Todos los errores de la app pasan por logError (src/app/services/logger.ts), que solo escribe en consola en modo desarrollo; el script de tema ya no registra nada. Queda solo el console.error de un fallo de arranque en main.ts.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-17T10:30:00+02:00
---

# Quitar los logs de consola en producción

## Contexto

Pendiente de la auditoría del 2026-10-16. Había `console.*` en
`gift-card.service.ts`, `theme.service.ts`, `gift-card-detail.component.ts`,
`shared-card.component.ts` e `index.html`.

## Alcance

- `logError()` con `isDevMode()`: silencioso en producción. Los fallos que
  afectan al usuario se le muestran (alertas en compartir, dejar de compartir
  y eliminar).
- Se mantiene a propósito el `console.error` de `main.ts`: solo salta si la app
  no puede arrancar y no lleva datos de tarjetas.

## Verificación

- `grep -rn "console\." src` solo encuentra `logger.ts` y `main.ts`.
- `pnpm run build` correcto; `ng test` 6/6. Sin errores de consola al recorrer
  `/`, `/card/:id`, `/shared/:id` y `/privacidad` con el build de producción
  (2026-10-17).
