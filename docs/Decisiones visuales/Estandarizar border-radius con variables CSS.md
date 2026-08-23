---
Nombre: Estandarizar border-radius con variables CSS
Estado: Aceptada
Ámbito: Tokens
Resumen: Los border-radius de las tarjetas y el toggle de tema se fijan con variables CSS en styles.css en vez de valores hardcodeados, para eliminar inconsistencias visuales entre componentes.
Fecha: 2026-04-25
Última modificación: 2026-04-25T12:51:31+02:00
---

# Estandarizar border-radius con variables CSS

## Contexto

`gift-card-detail`, `gift-card-form`, `gift-card-list` y `theme-toggle` fijaban
el `border-radius` con valores distintos y hardcodeados, lo que producía
inconsistencia visual entre componentes (incluida una inconsistencia en el
selector de color).

## Decisión

Definir variables CSS de border-radius en `src/styles.css` y hacer que todos los
componentes de tarjeta y el toggle de tema las consuman, en vez de declarar
valores propios.

## Consecuencias

- Cualquier cambio futuro de border-radius se hace en un único punto
  (`src/styles.css`).
- Antes de introducir un nuevo valor de borde en un componente, se debe revisar
  primero si una variable existente lo cubre (ver regla en
  [[../README#Reglas fundamentales del proyecto|Reglas fundamentales]], sección
  "Estilo de trabajo").

## Referencia

Commit `dc1559f` — style: standardize border-radius using CSS variables and fix
color selector inconsistency.
