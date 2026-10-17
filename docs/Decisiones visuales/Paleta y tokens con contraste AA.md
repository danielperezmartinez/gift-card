---
Nombre: Paleta y tokens con contraste AA
Estado: Aceptada
Ámbito: Tokens
Resumen: Los colores de tarjeta pasan a variantes oscuras (blanco con contraste AA, también bajo el brillo de 12 %) y los antiguos se traducen al mostrarse; se añaden los tokens --on-primary, --danger, --danger-soft y --focus-ring por tema, y el primario claro pasa a #6C5CE7.
Fecha: 2026-10-17
Última modificación: 2026-10-17T10:30:00+02:00
---

# Paleta y tokens con contraste AA

## Contexto

La primera ejecución de AXE (2026-10-16) falló en 7 de 8 vistas por contraste:
texto blanco sobre `#FF9500`, `#34C759`, `#007AFF`, `#FF2D55` y sobre el
primario `#A29BFE`, y el rojo `#FF3B30` sobre blanco. Ver
[[Corregir las infracciones de accesibilidad]] y la regla de
[[README#Seguridad, coste y cumplimiento|accesibilidad]].

## Decisión

- Paleta de tarjeta única en `src/app/models/card-colors.ts` (`CARD_COLORS`,
  con nombre accesible por color): `#0040DD` azul, `#3634A3` índigo,
  `#8944AB` morado, `#D30F45` rosa, `#B33000` naranja y `#1A6E2E` verde.
  Todos dan ≥ 4,5:1 con texto blanco, también bajo el brillo `.card-glass`
  (12 % de blanco). Un test unitario lo comprueba.
- Los colores guardados con la paleta antigua (en local o en Supabase) se
  traducen a su variante al mostrarse con `resolveCardColor`; no se migran los
  datos.
- Tokens nuevos en `src/styles.css`:
  - `--primary`: `#6C5CE7` en claro; `#A29BFE` en oscuro.
  - `--on-primary`: texto sobre el primario (`#ffffff` / `#1a1a1a`).
  - `--danger` y `--danger-soft`: `#D70015` en claro, `#FF453A` en oscuro.
  - `--focus-ring`: anillo de foco visible global (`:focus-visible`).
- El chip de la tarjeta usa fondo oscuro translúcido y el texto pequeño de la
  tarjeta ya no se atenúa con `opacity`.

## Consecuencias

- Ningún color nuevo se añade a la paleta sin pasar el test de contraste.
- Amplía [[Selector de color por tarjeta]]: el color sigue siendo dato de
  dominio, pero sus valores admitidos salen de `CARD_COLORS`.
