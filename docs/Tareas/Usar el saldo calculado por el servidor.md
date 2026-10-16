---
Nombre: Usar el saldo calculado por el servidor
Estado: Pendiente
Resumen: Al añadir o borrar gastos de una tarjeta compartida, la app recalcula el saldo en el cliente e ignora el que devuelven las RPC; debe adoptar el saldo del servidor como fuente de verdad.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-16T21:45:00+02:00
---

# Usar el saldo calculado por el servidor

## Contexto

Pendiente de la auditoría del 2026-10-16. `add_shared_expense` y
`remove_shared_expense` devuelven el saldo recalculado en la base, pero
`GiftCardService` calcula `card.balance ± amount` en local y descarta ese valor.
Si dos dispositivos editan a la vez, el saldo local puede divergir.

## Alcance

- En tarjetas compartidas, sustituir el saldo optimista por el que devuelve la
  RPC (o por el de `get_shared_card` tras el aviso de Realtime).
- Tests unitarios del servicio.

## Verificación

`pnpm test`, más la compuerta de [[README#Seguridad, coste y cumplimiento]].
