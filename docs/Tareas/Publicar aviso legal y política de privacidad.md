---
Nombre: Publicar aviso legal y política de privacidad
Estado: Pendiente
Resumen: La app es pública y guarda datos en Supabase (tarjetas compartidas) y en el dispositivo, pero no tiene aviso legal (LSSI-CE) ni política de privacidad (RGPD) enlazados desde todas las páginas.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-16T21:45:00+02:00
---

# Publicar aviso legal y política de privacidad

## Contexto

Pendiente de la auditoría del 2026-10-16. Lo exige el apartado "Legal y
privacidad" de [[README#Seguridad, coste y cumplimiento]].

## Alcance

- Rutas de aviso legal y política de privacidad, enlazadas desde todas las
  páginas y añadidas a `e2e/a11y.spec.ts`.
- Terceros que reciben datos: Supabase (proyecto compartido devappsdpm-db) y
  Vercel, con la región de los datos. Qué se guarda en `localStorage`.
- Confirmar que no hacen falta cookies no técnicas (sin banner).

## Verificación

AXE en verde con las rutas nuevas y el apartado legal de la
[[Seguridad/Checklist de lanzamiento|checklist de lanzamiento]] marcado.
