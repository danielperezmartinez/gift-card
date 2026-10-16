---
Nombre: Generar ids de tarjeta sin Math.random
Estado: Pendiente
Resumen: GiftCardService usa Math.random como alternativa a crypto.randomUUID para generar ids. El id es también el enlace compartido, así que debe salir siempre de una fuente criptográfica.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-16T21:45:00+02:00
---

# Generar ids de tarjeta sin Math.random

## Contexto

Pendiente de la auditoría del 2026-10-16. En `gift-card.service.ts` (líneas
~148 y ~174), si no hay `crypto.randomUUID`, el id se genera con
`Math.random()` + `Date.now()`. El id de una tarjeta compartida es lo único que
protege su lectura (`get_shared_card`), así que debe ser impredecible y un UUID
válido.

## Alcance

- Usar `crypto.randomUUID()` o `crypto.getRandomValues()`, sin fallback
  predecible.
- Test unitario.

## Verificación

`pnpm test`, más la compuerta de [[README#Seguridad, coste y cumplimiento]].
