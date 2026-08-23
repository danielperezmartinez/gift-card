---
Nombre: Migrar Gift Card a base compartida
Estado: Hecha
Resumen: Creado devappsdpm-db y migrado Gift Card al esquema aislado gift_card, con tablas, permisos mínimos, RLS, Realtime, tipos y cliente Angular verificados de extremo a extremo.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-08-23T21:17:43+02:00
Última modificación: 2026-08-23T21:32:25+02:00
---

# Migrar Gift Card a base compartida

## Alcance

- Crear `devappsdpm-db` en la organización `devappsdpm`, región
  `eu-central-1`, tras confirmar un coste de 0 € mensuales.
- Crear un esquema dedicado para Gift Card.
- Reconstruir `shared_cards` y `shared_expenses` con sus relaciones.
- Configurar acceso de Data API, RLS y publicación Realtime sin afectar a
  futuras aplicaciones del mismo proyecto.
- Actualizar la aplicación para usar el proyecto y esquema nuevos.
- Verificar el flujo de compartir desde la interfaz local.
- Preparar instrucciones reutilizables para migrar otras aplicaciones al mismo
  proyecto manteniendo aislamiento.

## Resultado

- Creado el proyecto Supabase `devappsdpm-db`
  (`zckqbrwdgxohdymiwbfz`) en `eu-central-1`, dentro de la organización
  `devappsdpm`, después de confirmar un coste de 0 € mensuales.
- Creado y expuesto el esquema `gift_card`, separado de `public` y de los
  futuros esquemas de otras aplicaciones.
- Creadas `gift_card.shared_cards` y `gift_card.shared_expenses`, con claves
  UUID, relación con borrado en cascada, restricciones numéricas e índice
  compuesto por `card_id` y `date`.
- Habilitado RLS y concedidos únicamente los permisos que requiere el cliente:
  las tarjetas no admiten borrado remoto y los gastos sí, de acuerdo con la
  funcionalidad existente.
- Añadidas ambas tablas a `supabase_realtime` y configurado PostgREST para
  exponer `public`, `graphql_public` y `gift_card`.
- Actualizado `SupabaseService` para usar exclusivamente `gift_card`, incluida
  la suscripción Realtime, y sustituida la configuración local por la URL y la
  clave publicable modernas del nuevo proyecto.
- Vinculado el repositorio local con el proyecto Vercel `gift-card` y desplegado
  el artefacto verificado a producción en `https://gift-card-bice.vercel.app`.
- Añadido `src/app/models/database.ts` a partir de los tipos generados y de la
  introspección del esquema personalizado. Se adapta el `null` de PostgreSQL a
  `undefined` en el modelo de dominio para `color`.

## Verificación

- Security Advisor: sin avisos.
- Performance Advisor: solo informa que el índice nuevo aún no se ha usado,
  algo esperado antes de tener historial de gastos.
- `pnpm run build`: correcto; persiste el aviso previo de presupuesto CSS en
  `gift-card-detail.component.ts`.
- `pnpm test`: 1 fichero y 1 test superados.
- Flujo local: tarjeta compartida sin alerta, enlace copiado y vista
  `/shared/:id` cargada correctamente sin errores de consola.
- Base remota: una tarjeta creada, cero gastos; ambas tablas confirmadas en la
  publicación Realtime y `gift_card` confirmado en `pgrst.db_schemas`.
- Vercel: despliegue `dpl_9HRDyG7hNzzwnhMsbc3JvcQs3eZY` en estado `READY`,
  alias de producción aplicado y sin errores de ejecución en la última hora.
- Producción: portada cargada y tarjeta de diagnóstico recuperada desde
  `/shared/2c9793cf-e264-4df1-9214-6e86da4a9338`, sin errores de consola.

## Patrón para incorporar otras aplicaciones

Cada aplicación debe obtener un esquema propio con nombre estable, conceder
permisos solo sobre sus tablas, habilitar RLS en cada tabla expuesta, añadir a
Realtime únicamente las tablas necesarias y configurar su cliente con
`db.schema`. Al exponer un esquema nuevo debe conservarse la lista existente de
`pgrst.db_schemas`; nunca debe reemplazarse omitiendo esquemas de otras
aplicaciones.
