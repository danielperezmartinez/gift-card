---
Nombre: Permitir dejar de compartir una tarjeta
Estado: En curso
Resumen: Añadidos la RPC gift_card.delete_shared_card (exige el token), el botón «Dejar de compartir» en el detalle y el borrado remoto al eliminar una tarjeta compartida. Probado en local; falta aplicar la migración en el remoto y verificarlo en producción.
Decisiones: []
Bloqueada: ["[[Aplicar en remoto la migración de excepciones de seguridad]]"]
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-17T10:30:00+02:00
---

# Permitir dejar de compartir una tarjeta

## Contexto

Pendiente de la auditoría del 2026-10-16. `deleteCard` solo borraba la tarjeta
del `localStorage`; la fila de `gift_card.shared_cards` y sus gastos seguían
públicos para quien tuviera el enlace. Ver
[[Proteger tarjetas compartidas en Supabase]].

## Decisión (usuario, 2026-10-17)

Botón «Dejar de compartir» que borra la copia remota y deja la tarjeta solo
en local; eliminar una tarjeta compartida también la borra en remoto. En
ambos casos se avisa de que el enlace dejará de funcionar.

## Alcance

- `supabase/migrations/20261017090000_gift_card_delete_shared_card.sql`:
  `delete_shared_card(p_card_id, p_edit_token)` (`SECURITY DEFINER`,
  `search_path = ''`, comentario de excepción), añadida a
  [[Excepción - gift_card RPC públicas]].
- `GiftCardService.unshareCard` y `deleteCard` (borra en remoto primero y no
  elimina en local si eso falla); cancela la suscripción Realtime.

## Verificación

- `supabase test db` 29/29 en local (2026-10-17): sin token no se deja de
  compartir, con token sí, y después el enlace no devuelve nada.
- Pendiente: aplicar la migración en devappsdpm-db y probar en producción
  compartir → dejar de compartir → enlace sin datos.
