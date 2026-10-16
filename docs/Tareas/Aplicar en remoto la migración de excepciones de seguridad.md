---
Nombre: Aplicar en remoto la migración de excepciones de seguridad
Estado: Pendiente
Resumen: La migración 20261016200000 solo añade comentarios de excepción a las seis RPC públicas de gift_card. Está probada en local; falta aplicarla al proyecto compartido devappsdpm-db con el OK del usuario.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-16T21:45:00+02:00
---

# Aplicar en remoto la migración de excepciones de seguridad

## Contexto

Al montar el sistema de seguridad, el check 5 del test de catálogo exige que
las funciones `SECURITY DEFINER` ejecutables por `anon` tengan una excepción
escrita. Ver [[Excepción - gift_card RPC públicas]].

## Alcance

- Aplicar `supabase/migrations/20261016200000_gift_card_security_exceptions.sql`
  al proyecto remoto, solo con aprobación explícita, y comprobar que figura en
  `supabase_migrations.schema_migrations`.

## Verificación

Consulta de solo lectura de `obj_description` de las seis funciones en el
remoto.
