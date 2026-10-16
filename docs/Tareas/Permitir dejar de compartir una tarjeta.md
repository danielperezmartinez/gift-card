---
Nombre: Permitir dejar de compartir una tarjeta
Estado: Pendiente
Resumen: Al borrar una tarjeta compartida en local, su copia en gift_card sigue accesible por el enlace. Hace falta una RPC con token de edición para dejar de compartirla o borrarla en remoto, y que la app la use.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-16T21:45:00+02:00
---

# Permitir dejar de compartir una tarjeta

## Contexto

Pendiente de la auditoría del 2026-10-16. `deleteCard` solo borra la tarjeta del
`localStorage`; la fila de `gift_card.shared_cards` y sus gastos quedan
públicos para quien tenga el enlace. Ver
[[Proteger tarjetas compartidas en Supabase]].

## Alcance

- Nueva RPC (p. ej. `gift_card.delete_shared_card(p_card_id, p_edit_token)`)
  que exige el token, en una migración de `supabase/migrations/`, con su test
  en `supabase/tests/` y añadida a [[Excepción - gift_card RPC públicas]].
- En la app: opción de dejar de compartir y borrado remoto al eliminar una
  tarjeta compartida.

## Verificación

Según la compuerta de [[README#Seguridad, coste y cumplimiento]]:
`supabase test db` y AXE en verde.
