---
Nombre: Icono instalable de tarjetas regalo
Estado: Aceptada
Ámbito: Tema
Resumen: La PWA usa un icono propio con una tarjeta regalo y la paleta violeta del producto, centrado dentro de una zona segura para funcionar en recortes maskable y en tamaños pequeños.
Fecha: 2026-08-23
Última modificación: 2026-08-23T20:24:48+02:00
---

# Icono instalable de tarjetas regalo

## Contexto

El soporte PWA requiere iconos identificables en lanzadores, pantallas de inicio
y diálogos de instalación. Los recursos genéricos de Angular no representan el
dominio de la aplicación.

## Decisión

- Representar una tarjeta regalo con cinta como símbolo principal.
- Mantener la paleta violeta del producto y el color primario `#A29BFE`.
- Centrar el símbolo con margen suficiente para admitir recortes circulares y
  de esquinas redondeadas (`maskable`).
- Exportar los tamaños declarados por el manifiesto a partir de un mismo diseño
  para mantener consistencia visual.

## Consecuencias

- Los iconos de `public/icons/` constituyen la familia de iconos instalables de
  la PWA.
- Cualquier sustitución futura debe conservar legibilidad a 72 px, zona segura
  maskable y correspondencia exacta entre dimensiones reales y manifiesto.

## Referencia

Tarea [[../Tareas/Convertir la aplicación en PWA]].
