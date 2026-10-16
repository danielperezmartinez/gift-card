---
Nombre: Aplicar en remoto la migración de excepciones de seguridad
Estado: Hecha
Resumen: Aplicadas a devappsdpm-db con el OK del usuario (2026-10-17), antes del merge, las migraciones 20261016231856 (comentarios de excepción en las RPC públicas) y 20261016231900 (RPC delete_shared_card); los ficheros del repo llevan la versión asignada en el remoto.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-17T11:15:00+02:00
---

# Aplicar en remoto la migración de excepciones de seguridad

## Contexto

Al montar el sistema de seguridad, el check 5 del test de catálogo exige que
las funciones `SECURITY DEFINER` ejecutables por `anon` tengan una excepción
escrita. Ver [[Excepción - gift_card RPC públicas]]. El 2026-10-17 se añadió
la RPC de [[Permitir dejar de compartir una tarjeta]], que también debe estar
en el remoto antes de desplegar el cliente que la usa.

## Alcance

- Aplicar al remoto, solo con aprobación explícita y solo sobre el esquema
  `gift_card`:
  - `supabase/migrations/20261016231856_gift_card_security_exceptions.sql`
  - `supabase/migrations/20261016231900_gift_card_delete_shared_card.sql`
- Comprobar que figuran en `supabase_migrations.schema_migrations`.

## Verificación

Consulta de solo lectura de `obj_description` de las siete funciones y de los
permisos de `delete_shared_card` en el remoto.

Resultado (2026-10-17, aprobado por el usuario en la sesión):

- Aplicadas por el MCP de Supabase como `gift_card_security_exceptions`
  (`20261016231856`) y `gift_card_delete_shared_card` (`20261016231900`); los
  ficheros del repo se renombraron a esas versiones.
- Consulta de solo lectura: las siete RPC públicas son `SECURITY DEFINER` con
  `search_path=""`, ejecutables por `anon` y con el comentario
  `excepcion: Excepción - gift_card RPC públicas`; `assert_card_owner`,
  `recalculate_balance` y `broadcast_card_change` no son ejecutables por
  `anon`; `gift_card` sigue sin políticas RLS.
- No se tocó ningún otro esquema ni la configuración global del proyecto.
