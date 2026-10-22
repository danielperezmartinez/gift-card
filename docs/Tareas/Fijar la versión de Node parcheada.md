---
Nombre: Fijar la versión de Node parcheada
Estado: En curso
Resumen: El CI usa node-version exacto 24.22.1 y package.json exige engines.node ">=24.22.1 <25", según la política común de versión de Node de las webs (campaña de parches de octubre de 2026).
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-23T12:00:00+02:00
Última modificación: 2026-10-23T12:00:00+02:00
---

# Fijar la versión de Node parcheada

## Contexto

Los avisos de seguridad de Node del 2026-10-21 se corrigen en la 24.22.1. El CI
usaba `node-version: 24`, que puede tomar un Node 24.x anterior de la caché del
runner. La web es estática: en producción no corre Node, solo en el build.

## Alcance

- `.github/workflows/seguridad.yml`: `node-version: '24.22.1'`, sin
  `check-latest`.
- `package.json`: `engines.node: ">=24.22.1 <25"`, para que Vercel y local
  rechacen un 24.x vulnerable.
- La CLI de Supabase no se toca en esta tarea.
- Al siguiente aviso de seguridad de Node 24.x se suben los dos a la vez.

## Verificación

Pendiente: PR en verde, integración y log de build de Vercel con Node ≥ 24.22.1.
