---
Nombre: Excepción - gift_card RPC públicas
Tipo: Excepción
Estado: Vigente
Regla: Las funciones SECURITY DEFINER no son ejecutables por anon salvo excepción escrita.
Objeto: gift_card.get_shared_card(uuid), create_shared_card(…), add_shared_expense(…), remove_shared_expense(…), update_shared_card_color(…), claim_shared_card(uuid, text)
Resumen: Las seis RPC son la única API de las tarjetas compartidas (la app no tiene Auth); anon las ejecuta a propósito. Leen por id exacto, editan solo con el token cuyo hash coincide y tienen límites de tamaño y cantidad.
Revisar antes de: 2027-01-01
Última modificación: 2026-10-16T21:30:00+02:00
---

# Excepción - gift_card RPC públicas

## Justificación

Gift Card no tiene inicio de sesión: quien comparte una tarjeta es un
dispositivo anónimo. Las tablas `gift_card.shared_cards` y
`gift_card.shared_expenses` tienen RLS activo sin políticas y sin permisos para
`anon` ni `authenticated`; el único acceso es por estas funciones
`SECURITY DEFINER` con `search_path = ''`, creadas en
`supabase/migrations/20261016182923_gift_card_secure_sharing.sql`. Ver
[[Proteger tarjetas compartidas en Supabase]].

Se descartó la autenticación anónima porque es un ajuste global del proyecto
compartido con nocendland y outify.

Qué exponen:

- `get_shared_card(p_id)`: una tarjeta y sus gastos, solo si se conoce su id
  (UUID del enlace). No permite listar.
- `create_shared_card`, `add_shared_expense`, `remove_shared_expense` y
  `update_shared_card_color`: crean o editan solo con el token de edición cuyo
  SHA-256 está guardado; un id existente nunca se sobrescribe.
- `claim_shared_card`: reclamo de tarjetas compartidas antes del token; solo
  funciona sobre tarjetas sin token y hasta el 2026-12-31. Retirarla después.

## Mitigaciones

- Límites: nombre ≤ 100, descripción ≤ 500, color `#RRGGBB`, importes
  ≤ 100 000, 200 gastos por tarjeta, 50 tarjetas compartidas por hora y 2000
  en total.
- Las funciones internas (`assert_card_owner`, `recalculate_balance`,
  `broadcast_card_change`) no son ejecutables por la API.
- Cada función lleva `comment on function … is 'excepcion: Excepción -
  gift_card RPC públicas'`
  (`supabase/migrations/20261016200000_gift_card_security_exceptions.sql`).
- Comprobado por `supabase/tests/10_aislamiento_gift_card.test.sql`.
