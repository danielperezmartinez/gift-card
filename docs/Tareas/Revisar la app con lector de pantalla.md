---
Nombre: Revisar la app con lector de pantalla
Estado: Pendiente
Resumen: Recorrer los flujos principales con NVDA (Windows) y VoiceOver (iOS) para comprobar lo que AXE no detecta: orden de lectura, anuncios de cambios, nombres de controles y uso del diálogo y del selector de color.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-17T15:30:00+02:00
Última modificación: 2026-10-17T15:30:00+02:00
---

# Revisar la app con lector de pantalla

## Contexto

La regla de accesibilidad de [[README#Seguridad, coste y cumplimiento]] pide,
además de AXE, una revisión manual de los flujos nuevos. AXE (14/14) y la
revisión de teclado se hicieron en
[[Corregir las infracciones de accesibilidad]]; falta la prueba con lector de
pantalla, que es el último punto pendiente de accesibilidad de la
[[Seguridad/Checklist de lanzamiento|checklist de lanzamiento]].

## Alcance

Con NVDA + Chrome o Firefox en Windows y VoiceOver + Safari en iOS (la app es
una PWA instalable):

- Listado: se anuncian el nombre, la descripción y el saldo de cada tarjeta, y
  el botón «Eliminar <nombre>»; el botón «Añadir tarjeta» abre el diálogo.
- Formulario de nueva tarjeta: se anuncia como diálogo «Nueva tarjeta», el
  foco empieza en el nombre, los campos tienen etiqueta, el selector de color
  anuncia nombre y estado (pulsado o no) y Escape lo cierra.
- Detalle: compartir, «Copiar enlace» (se anuncia «Enlace copiado»), «Dejar de
  compartir», añadir y eliminar gastos, y el saldo actualizado.
- Vista compartida: orden de lectura y saldo actualizado en directo.
- Aviso legal y privacidad: encabezados y enlaces.
- Anotar lo que se oiga mal o no se anuncie y corregirlo, con su test en
  `e2e/a11y.spec.ts` cuando se pueda automatizar.

## Verificación

Notas de la sesión con cada lector (qué se probó y qué se corrigió) y AXE en
verde. Al terminar, marcar el punto de accesibilidad de la checklist.
