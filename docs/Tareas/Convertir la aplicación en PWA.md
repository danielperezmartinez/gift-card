---
Nombre: Convertir la aplicación en PWA
Estado: Hecha
Resumen: Incorporar manifiesto, service worker, caché de producción e iconos instalables a la aplicación Angular, y verificar build y tests.
Decisiones: ['[[../Decisiones visuales/Icono instalable de tarjetas regalo]]']
Bloqueada: []
Fecha de creación: 2026-08-23T20:17:47+02:00
Última modificación: 2026-08-23T20:24:48+02:00
---

# Convertir la aplicación en PWA

## Alcance

- Añadir el soporte PWA oficial de Angular.
- Definir los metadatos de instalación y los iconos requeridos.
- Habilitar el service worker y una estrategia de caché adecuada para los
  recursos de la aplicación.
- Verificar la compilación de producción y la suite de tests.

## Resultado

- Integrado `@angular/service-worker` 21.2.10 y su proveedor solo para
  producción.
- Añadidos `ngsw-config.json`, el manifiesto localizado al español y metadatos
  de instalación/tema.
- Sustituidos los iconos genéricos por nueve tamaños del icono propio, incluido
  el recurso de 180 px para Apple.
- Corregido `angular.json` para declarar pnpm como gestor del workspace.

## Verificación

- `pnpm run build`: correcto; genera `ngsw-worker.js`, `ngsw.json`, manifiesto e
  iconos. Persiste un aviso previo de presupuesto CSS en
  `gift-card-detail.component.ts` (4,96 kB frente a 4 kB).
- `pnpm test`: 1 fichero y 1 test superados.
- Validación de artefactos: JSON válido, nueve iconos con dimensiones reales
  coincidentes, manifiesto incluido en la caché y ausencia del original de alta
  resolución no referenciado en el paquete final.
