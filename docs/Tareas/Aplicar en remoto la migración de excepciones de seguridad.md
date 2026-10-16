---
Nombre: Aplicar en remoto la migración de excepciones de seguridad
Estado: Pendiente
Resumen: Aplicar al proyecto compartido devappsdpm-db, con el OK del usuario y antes del merge, las migraciones 20261016200000 (solo comentarios de excepción en las RPC públicas) y 20261017090000 (RPC delete_shared_card). Ambas están probadas en local.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-17T10:30:00+02:00
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
  - `supabase/migrations/20261016200000_gift_card_security_exceptions.sql`
  - `supabase/migrations/20261017090000_gift_card_delete_shared_card.sql`
- Comprobar que figuran en `supabase_migrations.schema_migrations`.

## Verificación

Consulta de solo lectura de `obj_description` de las siete funciones y de los
permisos de `delete_shared_card` en el remoto.
