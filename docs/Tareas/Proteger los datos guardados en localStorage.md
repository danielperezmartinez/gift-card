---
Nombre: Proteger los datos guardados en localStorage
Estado: Hecha
Resumen: Se descartó cifrar localStorage (la clave viviría junto a los datos). Se cierra la vía XSS con una Content-Security-Policy estricta en vercel.json (script-src 'self', sin scripts en línea) y se informa del almacenamiento local en la política de privacidad.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-17T10:30:00+02:00
---

# Proteger los datos guardados en localStorage

## Contexto

Pendiente de la auditoría del 2026-10-16. `gift_cards_data` guarda en claro
los datos de las tarjetas y el `editToken` de las compartidas. Cualquier script
que se ejecute en el origen (p. ej. por un XSS) puede leerlos.

## Decisión (usuario, 2026-10-17)

CSP y documentación en vez de cifrado: cifrar en el navegador sin un secreto
del usuario no protege frente a un XSS, que es la amenaza real.

## Alcance

- `vercel.json`: CSP (`default-src 'self'`, `script-src 'self'`, `connect-src`
  solo al proyecto Supabase, `object-src 'none'`, `frame-ancestors 'none'`…),
  `nosniff`, `Referrer-Policy` y `Permissions-Policy`.
  `style-src` permite `'unsafe-inline'` porque Angular inyecta los estilos de
  los componentes.
- Script de tema movido a `public/theme-init.js` e `inlineCritical: false`
  para no necesitar código en línea. Ver
  [[Eliminar flash de tema al cargar]].
- Solo se guarda lo imprescindible; el token de edición nunca sale del
  dispositivo (al servidor va su SHA-256).
- Explicado en la [[Publicar aviso legal y política de privacidad|política de privacidad]].

## Verificación

- Build de producción servido en local con las cabeceras de `vercel.json`: sin
  violaciones de CSP ni errores de consola en `/`, `/card/:id`, `/shared/:id`
  (con RPC simulada) y `/privacidad`, y el tema oscuro se aplica antes del
  arranque (2026-10-17).
- Pendiente: comprobar las cabeceras en producción tras el despliegue.
