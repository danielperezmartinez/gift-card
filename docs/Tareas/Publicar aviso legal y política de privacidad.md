---
Nombre: Publicar aviso legal y política de privacidad
Estado: En curso
Resumen: Creadas /aviso-legal y /privacidad (titular Daniel Pérez Martínez, dlperezmartinez@gmail.com), enlazadas desde el pie de todas las páginas y cubiertas por AXE. Falta publicarlas con el despliegue y comprobarlas en producción.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-17T10:30:00+02:00
---

# Publicar aviso legal y política de privacidad

## Contexto

Pendiente de la auditoría del 2026-10-16. Lo exige el apartado "Legal y
privacidad" de [[README#Seguridad, coste y cumplimiento]].

## Alcance

- Páginas `LegalNoticeComponent` y `PrivacyPolicyComponent`; los datos del
  titular salen de `src/app/models/legal.ts`. Datos indicados por el usuario el
  2026-10-17 (sin NIF ni domicilio: proyecto personal y gratuito).
- Política: qué se guarda en el dispositivo, qué se envía al compartir y cuánto
  se conserva, datos técnicos del alojamiento, base jurídica, proveedores
  (Supabase en `eu-central-1`, Fráncfort; Vercel en EE. UU.) y derechos.
- Sin cookies no técnicas, así que no hay banner.

## Verificación

- AXE 14/14, incluidas las dos páginas (2026-10-17). Sin violaciones de CSP en
  `/privacidad`.
- Pendiente: comprobar en producción y marcar el apartado legal de la
  [[Seguridad/Checklist de lanzamiento|checklist de lanzamiento]].
