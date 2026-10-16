---
Nombre: Quitar los logs de consola en producción
Estado: Pendiente
Resumen: Hay llamadas a console en servicios y componentes que también se ejecutan en producción y pueden mostrar ids de tarjetas y errores internos. Sustituirlas por un manejo de errores visible al usuario o silenciarlas fuera de desarrollo.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-16T21:45:00+02:00
---

# Quitar los logs de consola en producción

## Contexto

Pendiente de la auditoría del 2026-10-16. Hay `console.*` en
`gift-card.service.ts`, `theme.service.ts`, `gift-card-detail.component.ts` y
`shared-card.component.ts`.

## Alcance

- Un punto único de registro que no escriba en consola en producción, sin
  ocultar los errores al usuario (regla de manejo de errores del README).

## Verificación

`pnpm run build`, `pnpm test` y búsqueda de `console.` en `dist/`.
