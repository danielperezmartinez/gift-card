---
Nombre: Eliminar flash de tema al cargar
Estado: Aceptada
Ámbito: Tema
Resumen: Las transiciones CSS de tema se acotan a un scope específico y color-scheme se sincroniza en index.html antes de que Angular arranque, para eliminar el parpadeo de tema (FOUC) al cargar la página.
Fecha: 2026-04-25
Última modificación: 2026-10-17T10:30:00+02:00
---

# Eliminar flash de tema al cargar

## Contexto

Al cargar la aplicación se producía un parpadeo visible (flash) entre el tema
claro y oscuro, porque las transiciones CSS globales se aplicaban antes de que
`ThemeService` sincronizara el tema real del usuario.

## Decisión

- Acotar (`scope`) las transiciones de tema a las reglas CSS que realmente lo
  necesitan, en vez de aplicarlas globalmente.
- Sincronizar la propiedad `color-scheme` directamente en `src/index.html`,
  antes del arranque de Angular, para que el navegador pinte con el tema
  correcto desde el primer frame.
- `ThemeService` mantiene la fuente de verdad del tema en tiempo de ejecución;
  `index.html` solo hace la sincronización inicial para evitar el flash.

## Consecuencias

- El tema debe seguir persistiendo entre rutas de forma consistente con esta
  sincronización inicial (ver también el toggle de tema añadido a la página de
  detalle en el commit `7d3e949`).
- Cualquier cambio futuro en cómo se aplica el tema debe preservar que el
  `color-scheme` inicial se resuelva antes del primer render.
- Desde el 2026-10-17 la sincronización inicial vive en `public/theme-init.js`,
  cargado de forma síncrona desde `index.html` (sin script en línea), para que
  la Content-Security-Policy pueda limitarse a `script-src 'self'`. Por lo
  mismo, el build de producción no inlinea CSS crítico (`inlineCritical: false`).

## Referencia

Commit `b432e77` — fix: eliminate theme flash on load by scoping transitions
and syncing color-scheme.
