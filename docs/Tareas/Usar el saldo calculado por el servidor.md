---
Nombre: Usar el saldo calculado por el servidor
Estado: Hecha
Resumen: En tarjetas compartidas, el saldo optimista local se sustituye por el que devuelven add_shared_expense y remove_shared_expense; si la RPC falla, la tarjeta se vuelve a sincronizar desde get_shared_card.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-17T10:30:00+02:00
---

# Usar el saldo calculado por el servidor

## Contexto

Pendiente de la auditoría del 2026-10-16. Las RPC de gastos devuelven el saldo
recalculado en la base, pero `GiftCardService` calculaba `card.balance ± amount`
en local y descartaba ese valor.

## Alcance

- `addExpense` y `deleteExpense` aplican el saldo devuelto por la RPC; ante un
  error, `syncSharedCard` recupera el estado remoto en vez de dejar el saldo
  optimista.

## Verificación

- El test de aislamiento comprueba que el saldo lo calcula el servidor
  (90 tras crear con un gasto de 10; 75 tras otro de 15). `supabase test db`
  29/29 y `ng test` 6/6 (2026-10-17).
- Pendiente de comprobar en producción junto con el despliegue de la rama.
