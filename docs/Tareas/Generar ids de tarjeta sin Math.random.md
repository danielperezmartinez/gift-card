---
Nombre: Generar ids de tarjeta sin Math.random
Estado: Hecha
Resumen: Los ids de tarjetas y gastos salen siempre de crypto (randomUUID o, fuera de contexto seguro, un UUID v4 con getRandomValues) mediante generateId en src/app/services/id.ts; se eliminó el fallback con Math.random.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-17T10:30:00+02:00
---

# Generar ids de tarjeta sin Math.random

## Contexto

Pendiente de la auditoría del 2026-10-16. En `gift-card.service.ts`, si no
había `crypto.randomUUID`, el id se generaba con `Math.random()` +
`Date.now()`. El id de una tarjeta compartida es lo único que protege su
lectura (`get_shared_card`), así que debe ser impredecible y un UUID válido.

## Alcance

- `generateId()` en `src/app/services/id.ts`: `crypto.randomUUID()` o, sin
  contexto seguro, UUID v4 con `crypto.getRandomValues()`.
- Usado para tarjetas y gastos en `GiftCardService`.

## Verificación

- `src/app/services/id.spec.ts`: formato UUID v4, fallback sin `randomUUID` y
  `Math.random` nunca llamado. `ng test`: 6/6.
- Rama `chore/sistema-seguridad` (2026-10-17): `supabase test db` 29/29 y AXE
  14/14 en local.
