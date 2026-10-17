---
Nombre: Implantar el flujo de publicación por pull request
Estado: Hecha
Resumen: El código se publica por PR contra master con los checks de seguridad obligatorios (strict) y la versión subida en la PR; los cambios de solo docs/ van por push directo y Vercel no los construye. Comprobado en producción con un push de solo docs/.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-17T16:45:00+02:00
Última modificación: 2026-10-17T17:00:00+02:00
---

# Implantar el flujo de publicación por pull request

## Contexto

Flujo común acordado para los cuatro repos del usuario. En gift-card no había
regla de publicación escrita: la regla 3 de [[README#Reglas fundamentales del proyecto]]
pasa a ser su fuente única.

## Hecho

- PR #4 (squash `edd4610`, versión `0.1.1`): regla 3 del README,
  `ignoreCommand` en `vercel.json` y la protección en la
  [[Seguridad/Checklist de lanzamiento|checklist de lanzamiento]].
- Protección de `master`: los tres jobs de `seguridad.yml` obligatorios con
  `strict`, `enforce_admins` desactivado, sin force push ni borrado.
- Ledger de `devappsdpm-db`: las cuatro migraciones de `supabase/migrations/`
  coinciden con las versiones registradas.
- `remote.origin.push` no está definido: un `git push` sin argumentos no empuja
  `master` por sorpresa.

## Verificación

- Checks de la PR #4 en verde; producción `READY` en Vercel para `edd4610` y la
  web responde con sus cabeceras de seguridad.
- `ignoreCommand` probado en local: un commit de solo `docs/` devuelve 0 y uno
  de código devuelve 1. En la PR, la preview del último commit (solo `docs/`)
  quedó omitida («Canceled by Ignored Build Step»).
- El push directo de esta nota a `master` (`36faa6c`) quedó omitido en
  producción («Canceled by Ignored Build Step»); sigue sirviendo `edd4610`.

## Limitación conocida

`ignoreCommand` solo mira el último commit (`HEAD^..HEAD`). En `master` no
importa porque cada PR llega como un único commit *squash*; en las previews de
una PR, si el último commit solo toca `docs/`, la preview no se construye.
