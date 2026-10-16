---
Nombre: Proteger los datos guardados en localStorage
Estado: Pendiente
Resumen: Las tarjetas, sus códigos y el token de edición se guardan en claro en localStorage. Decidir qué se guarda y si se cifra o se minimiza, y documentarlo en la política de privacidad.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T21:45:00+02:00
Última modificación: 2026-10-16T21:45:00+02:00
---

# Proteger los datos guardados en localStorage

## Contexto

Pendiente de la auditoría del 2026-10-16. `gift_cards_data` guarda en claro
los datos de las tarjetas y el `editToken` de las compartidas. Cualquier script
que se ejecute en el origen (p. ej. por un XSS) puede leerlos.

## Alcance

- Inventario de lo que se guarda y por qué.
- Minimizar o proteger los datos sensibles (códigos, token) y revisar la
  Content-Security-Policy.
- Reflejarlo en [[Publicar aviso legal y política de privacidad]].

## Verificación

`pnpm test`, más la compuerta de [[README#Seguridad, coste y cumplimiento]].
