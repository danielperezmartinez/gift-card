---
Nombre: Selector de color por tarjeta
Estado: Aceptada
Ámbito: Componente
Resumen: Cada gift card admite un color propio elegido por el usuario, gestionado por GiftCardService/SupabaseService y editable desde el detalle; el input de gasto se retira de la vista de invitado.
Fecha: 2026-04-25
Última modificación: 2026-04-25T14:09:46+02:00
---

# Selector de color por tarjeta

## Contexto

Las tarjetas regalo eran visualmente uniformes. Se quería permitir
personalización visual por tarjeta y, en la vista compartida con invitados,
simplificar la interfaz retirando el input de gasto (que no debía ser editable
por un invitado).

## Decisión

- Añadir un selector de color en `gift-card-detail`, persistido a través de
  `GiftCardService` y `SupabaseService` (columna de color en la tabla de gift
  cards).
- Retirar el input de gasto de `shared-card` (vista de invitado): la edición de
  gasto queda reservada al propietario desde el detalle.

## Consecuencias

- El color de una tarjeta es un dato de dominio (vive en Supabase), no un token
  de diseño global: no debe confundirse con las variables CSS de
  [[Estandarizar border-radius con variables CSS]].
- `shared-card` pasa a ser una vista de solo lectura/edición limitada para
  invitados; cualquier campo editable nuevo debe evaluarse contra este mismo
  criterio (¿lo edita el propietario o el invitado?).

## Referencia

Commit `20795e2` — feat: add color picker for cards and remove expense input
from guest view.
