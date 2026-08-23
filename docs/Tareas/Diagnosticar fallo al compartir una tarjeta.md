---
Nombre: Diagnosticar fallo al compartir una tarjeta
Estado: Hecha
Resumen: Reproducido el fallo al compartir y confirmado que lo causa el proyecto Supabase inactivo al que apunta la aplicación; la recuperación depende de reanudarlo o migrar su copia de seguridad.
Decisiones: []
Bloqueada: []
Fecha de creación: 2026-08-23T20:47:54+02:00
Última modificación: 2026-08-23T20:52:15+02:00
---

# Diagnosticar fallo al compartir una tarjeta

## Alcance

- Levantar la aplicación en local.
- Crear una tarjeta si no hay ninguna y abrir su detalle desde el listado.
- Intentar compartirla desde la interfaz.
- Inspeccionar la consola y las peticiones de red para aislar la causa.
- Informar de lo que ocurre y de si existe una solución.

## Resultado

- La aplicación se levantó en `http://localhost:4201/` porque el puerto 4200
  estaba ocupado por otro proyecto.
- Se creó la tarjeta local `Tarjeta de diagnóstico`, se abrió su detalle desde
  el listado y se pulsó `Compartir`.
- La interfaz mostró la alerta genérica de error y la consola registró
  `Error compartiendo tarjeta: Object`.
- La configuración local apunta al proyecto Supabase `gift-card`
  (`edtwodosgqyjcmyznnzt`), cuyo estado remoto es `INACTIVE`.
- Una petición REST de solo lectura al mismo proyecto falló antes de obtener
  respuesta porque el host no resolvía; la inspección remota de las tablas
  terminó por timeout y no había logs API recientes.

## Diagnóstico y solución

El flujo intenta hacer `upsert` en `shared_cards`, pero el proyecto pausado no
expone la API. La excepción sube hasta el detalle, que solo presenta una alerta
genérica; por eso la UI no explica la causa real.

La solución operativa es reanudar el proyecto desde Supabase. Según la
documentación vigente, los proyectos gratuitos pausados pueden restaurarse con
`Resume project` durante 90 días. Si ese plazo ya venció, hay que descargar la
copia disponible y restaurarla en un proyecto nuevo, actualizando después la
URL y la clave pública del entorno. Tras recuperar el servicio conviene repetir
el flujo y verificar también tablas, RLS y políticas; no fue posible validarlas
mientras la base permanecía inactiva.

## Verificación

- Reproducción completa desde el listado hasta el botón `Compartir`: realizada.
- Consola del navegador: error capturado.
- Estado remoto del proyecto: `INACTIVE`.
- Resolución del endpoint REST: fallida por host desconocido.
