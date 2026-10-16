---
Nombre: Proteger tarjetas compartidas en Supabase
Estado: En curso
Resumen: Cerrado el acceso directo a gift_card con la clave publicable; lectura por id solo vía RPC, edición con token secreto, Realtime por broadcast sin datos, límites de tamaño y migraciones versionadas en supabase/migrations.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-10-16T20:20:00+02:00
Última modificación: 2026-10-16T20:40:00+02:00
---

# Proteger tarjetas compartidas en Supabase

## Contexto

Una auditoría de seguridad detectó que las políticas RLS de
`gift_card.shared_cards` y `gift_card.shared_expenses` eran `true` para `anon`:
con la clave publicable se podía listar todas las tarjetas, modificar su saldo y
borrar gastos ajenos. Además Realtime emitía los cambios de cualquier tarjeta,
no había límites de tamaño en una base compartida con otras aplicaciones y el
esquema no estaba versionado. Ver [[Migrar Gift Card a base compartida]].

## Alcance

- Retirar las políticas abiertas y los permisos de tabla de `anon` y
  `authenticated`; RLS queda activo sin políticas.
- Acceso solo por funciones `SECURITY DEFINER`: `get_shared_card` (por id
  exacto), `create_shared_card`, `add_shared_expense`, `remove_shared_expense`,
  `update_shared_card_color` y `claim_shared_card`.
- Propiedad mediante token de edición: el cliente lo genera, lo guarda solo en
  local y la base almacena su SHA-256. Se descartó la autenticación anónima
  porque es un ajuste global del proyecto compartido.
- Realtime: las tablas salen de `supabase_realtime`; un trigger emite un aviso
  vacío al canal público `gift_card:<id>` y el cliente vuelve a pedir la tarjeta.
- Límites: nombre ≤ 100, descripción ≤ 500, color `#RRGGBB`, importes
  ≤ 100 000, 200 gastos por tarjeta, 50 tarjetas compartidas por hora y 2000 en
  total.
- Saldo calculado en el servidor.
- Tarjetas compartidas antes del cambio: el primer dispositivo que las tenga las
  reclama con `claim_shared_card` (permitido hasta el 2026-12-31).
- Migraciones en `supabase/migrations/` de este repositorio (como hace outify):
  la base reconstruida `20260823191916` y `20261016182923_gift_card_secure_sharing`.

## Verificación

- `pnpm run build` y `pnpm test`: correctos.
- REST con la clave publicable: listar, `PATCH`, `DELETE` e `INSERT` directos
  devuelven 42501; funciones internas sin permiso; crear con un id existente
  devuelve 23505; textos fuera de límite devuelven 23514; editar sin token
  válido devuelve `not allowed`.
- Flujo RPC completo con token correcto y broadcast recibido con payload vacío
  (el primer aviso tras arrancar el canal en frío puede perderse).
- App local: reclamo automático de una tarjeta antigua, compartir desde el
  detalle y vista `/shared/:id` actualizada en directo al añadir un gasto.
  Tarjetas de prueba borradas después.
- Security Advisor: avisos esperados `rls_enabled_no_policy` (INFO) y
  `*_security_definer_function_executable` (WARN) para las seis funciones
  públicas; son la API intencionada y validan id o token internamente.

## Pendiente

- Desplegar el cliente nuevo: el desplegado en producción usa las tablas
  directamente y no puede compartir ni sincronizar hasta entonces.
