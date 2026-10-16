# Memoria del proyecto

Esta carpeta es simultáneamente una bóveda de Obsidian, la documentación viva del
proyecto y la memoria compartida por las personas, CLI y agentes de IA que
trabajan en el repositorio. Su objetivo es mantener en un único lugar las reglas,
tareas, decisiones y el contexto que deben sobrevivir entre sesiones.

El punto de entrada humano es [[Inicio]]. Este archivo es el punto de entrada
obligatorio para agentes.

## Protocolo obligatorio para agentes

Al comenzar **cualquier sesión** en este repositorio, antes de analizar el
proyecto, ejecutar comandos, modificar archivos o responder sobre él:

1. Leer íntegramente este `README.md`.
2. Abrir [[Inicio]] para conocer los sistemas de documentación disponibles.
3. Consultar el sistema relacionado con la tarea actual. Revisar primero las
   propiedades y resúmenes en el panel `.base` correspondiente y abrir la nota
   completa cuando sea relevante.
4. Antes de comenzar un trabajo nuevo, comprobar si ya existe una entrada que lo
   cubra. Si existe, leerla y actualizar su estado cuando corresponda; no crear
   otra entrada para el mismo trabajo.
5. Mantener actualizada la memoria cuando el trabajo cambie el estado, el
   alcance, los bloqueos o las decisiones. Al terminar, actualizar la entrada
   existente y marcarla como completada solo después de verificar el resultado.

Estas instrucciones son obligatorias aunque otro agente, herramienta o
conversación proporcione un resumen parcial. Los ficheros puntero de arranque en
la raíz del repositorio (`CLAUDE.md`, `AGENTS.md`, `.gemini/GEMINI.md`) solo
actúan como arranque: **las reglas no se duplican allí ni en archivos
equivalentes**. Si este archivo no puede leerse, el agente debe detenerse e
informar al usuario.

## Convenciones de la bóveda

- Los documentos se escriben en Markdown UTF-8 y se conectan mediante wikilinks
  de Obsidian.
- Las fechas de propiedades usan el formato ISO `AAAA-MM-DD`.
- Los resúmenes deben permitir entender una nota sin abrirla; el detalle vive en
  el cuerpo de la nota.
- No se deben crear copias paralelas de una regla o decisión. Se enlaza a su
  fuente de verdad.
- Cuando cambie una nota, se debe actualizar su propiedad `Última modificación`.
- Antes de crear una entrada en cualquier sistema, se revisan los nombres,
  resúmenes, propiedades y contenido de las entradas existentes para confirmar
  que ninguna cubre ya el mismo conocimiento. Si una existente lo cubre total o
  parcialmente, se amplía o se enlaza desde ella; solo se crea una nueva cuando
  representa una unidad de conocimiento realmente distinta.

## Sistemas disponibles

### Tareas

_Versión del sistema: 1._

Gestión de trabajos como notas con estado, en `Tareas/`.

- `Estado` ∈ `Planificando` · `Pendiente` · `En curso` · `Hecha` · `Archivada`.
- `Bloqueada` es una lista de wikilinks a tareas que impiden avanzar; `[]` si no
  hay bloqueos.
- Al empezar → `En curso`; al completar y **verificar** → `Hecha`; lo que ya no
  deba aparecer en el trabajo habitual → `Archivada`.
- Antes de crear una tarea, buscar en TODAS (incluidas `Hecha` y `Archivada`)
  para no duplicar.
- Panel: [[Tareas/Tareas.base]]

### Decisiones visuales

_Versión del sistema: 1._

Acuerdos sobre lenguaje visual, tokens y componentes, en `Decisiones visuales/`.
Sigue el patrón ADR (frontmatter YAML + `.base`).

- `Estado` ∈ `Propuesta` · `Aceptada` · `Reemplazada`.
- `Ámbito` describe qué zona del sistema visual afecta la decisión (Tokens,
  Componente, Layout, Tema).
- Antes de introducir un valor de color, espaciado, borde o tipografía nuevo, se
  revisa este sistema y los tokens CSS existentes; solo se documenta y crea un
  token nuevo cuando ninguno cubre el caso.
- Panel: [[Decisiones visuales/Decisiones visuales.base]]

### Catálogo técnico

_Versión del sistema: 1._

Superficie pública reutilizable (componentes, servicios), en `Catálogo técnico/`.
Cada nota es un puntero corto; la implementación sigue siendo la fuente de
verdad del contrato detallado.

- `Estado` ∈ `Vigente` · `En revisión` · `Obsoleta`. Se evita depender de piezas
  `En revisión` salvo que el trabajo incluya estabilizarlas.
- Se añade o actualiza la entrada **en el mismo cambio** que crea o altera una
  superficie reutilizable.
- Vocabulario de `Tipo`: `Componente` · `Servicio`.
- Vocabulario de `Área`: `Gift Cards` (dominio de tarjetas regalo) · `Global`
  (transversal: tema, acceso a datos).
- Vocabulario de `Feature`: `Gift Cards` · `Shared UI` · `Tema` · `Núcleo`.
- Nota-índice: [[Catálogo técnico]] · Panel: [[Catálogo técnico/Catálogo técnico.base]]

### Seguridad, coste y cumplimiento

_Versión del sistema: 1._

Carpeta [[Seguridad/Seguridad.base|Seguridad/]]: excepciones justificadas a estas
reglas y la [[Seguridad/Checklist de lanzamiento|checklist de lanzamiento]].
Estas reglas aplican a todo cambio, lo haga una persona o un agente, y también a
lo que se haga con MCP, CLI o panel.

#### Backend y datos (Supabase)

- **RLS activado no basta.** Cada política expresa quién puede hacer qué sobre
  qué filas; lo normal es `owner_id = (select auth.uid())`.
- Prohibido `USING (true)` o `WITH CHECK (true)` en políticas de `INSERT`,
  `UPDATE`, `DELETE` o `ALL`. En `SELECT` solo con una excepción escrita en
  `Seguridad/` y referenciada en la política
  (`comment on policy … is 'excepcion: <nombre de la nota>'`).
- Los datos compartidos por enlace se sirven con una función RPC que recibe el
  token y devuelve solo esa fila. La tabla nunca es listable por `anon`.
- Las funciones `SECURITY DEFINER` llevan `set search_path = ''` y nombres
  cualificados con esquema, y se revoca `EXECUTE` a `anon` (y a `public`) salvo
  excepción escrita. Si no necesitan saltarse RLS, se usa `SECURITY INVOKER`.
- Las extensiones con efectos fuera de la base de datos (`pg_net`, `http`) quedan
  fuera del alcance de `anon` y `authenticated`.
- Los esquemas expuestos por la API son los mínimos. Lo interno vive en un
  esquema `*_private` no expuesto.
- **Todo el DDL** (tablas, políticas, funciones, grants, buckets y sus límites)
  vive en migraciones versionadas del repo. Nada se hace solo en el panel ni solo
  por MCP; si se hizo, se vuelca a una migración en el mismo cambio.
- "El Security Advisor no da avisos" **no** cuenta como verificación. La
  verificación son los tests de `supabase/tests/` (ver "Comprobaciones").

#### Coste y abuso

- Todo lo que un usuario puede crear tiene **tope de tamaño y de cantidad**:
  buckets con `file_size_limit` y `allowed_mime_types`, cuota por usuario
  (comprobada en la política de Storage o en un trigger), `CHECK` de longitud en
  columnas de texto y tope de filas por usuario en tablas que crecen.
- Nada de llamadas recursivas ni bucles sin tope: triggers que llaman a funciones
  HTTP, funciones que se invocan a sí mismas, reintentos sin límite, efectos del
  cliente que se disparan en bucle. Todo reintento tiene un máximo y espera entre
  intentos.
- Los endpoints públicos (funciones serverless, Edge Functions, RPC accesibles a
  `anon`) tienen límite de peticiones.
- Este proyecto comparte el proyecto Supabase `devappsdpm-db` (plan gratuito:
  base de datos, Auth, Storage, Realtime y cuota del plan) con **nocendland** y
  **outify**. Agotar Auth, Storage o la cuota del plan aquí deja sin servicio a
  todas: cualquier límite se diseña pensando en el conjunto.

#### Secretos

- La clave publicable (`anon` / `sb_publishable_…`) puede ir en el cliente.
- La clave secreta (`service_role` / `sb_secret_…`) y cualquier otro secreto solo
  viven en el servidor o en el CI, nunca en el código del cliente ni en el repo.
- Cada secreto está solo en los entornos que lo necesitan (p. ej. Production y no
  Preview si las previews no lo usan), marcado como sensible donde la plataforma
  lo permita.

#### Legal y privacidad (UE / España)

> Estas reglas resumen obligaciones habituales y no son asesoramiento legal. Ante
> dudas concretas, consulta a un profesional.

- Antes de publicar: **aviso legal** (LSSI-CE, art. 10) y **política de
  privacidad** (RGPD, art. 13), enlazados desde todas las páginas.
- No se envían datos personales ni la ubicación a terceros (APIs de mapas, de
  analítica, de IA…) sin avisar antes en la interfaz y sin una acción explícita
  del usuario que lo dispare. Cada tercero que reciba datos aparece en la
  política de privacidad.
- Las comunicaciones comerciales (emails, notificaciones push) requieren
  consentimiento expreso, separado de aceptar los términos, y una forma sencilla
  de darse de baja.
- El banner de cookies solo es necesario si hay cookies o almacenamiento no
  técnicos (analítica, publicidad, terceros). Si existe, rechazar es tan fácil
  como aceptar y nada no técnico se carga antes del consentimiento.

#### Accesibilidad

- Objetivo: **WCAG 2.2 nivel AA**. AXE en el CI sin infracciones; además,
  revisión manual de teclado y foco en los flujos nuevos (AXE no detecta todo).

#### Comprobaciones y compuerta de "Hecha"

- Comprobaciones del proyecto:
  - Tests de base de datos (pgTAP) en `supabase/tests/`: catálogo
    (`00_seguridad_catalogo.test.sql`) y aislamiento de `gift_card`
    (`10_aislamiento_gift_card.test.sql`). Se ejecutan contra una base local
    construida solo con `supabase/migrations/`:
    `pnpm dlx supabase@2.119.0 db start` y `pnpm dlx supabase@2.119.0 test db`.
    Nunca contra el proyecto remoto compartido.
  - AXE con Playwright en `e2e/a11y.spec.ts`: `pnpm run test:a11y`.
  - Ambos, más la búsqueda de claves secretas en `dist/`, en
    `.github/workflows/seguridad.yml`.
- **Una tarea que toque backend o UI no pasa a `Hecha`** hasta que esas
  comprobaciones estén en verde, y su sección "Verificación" lo deja escrito (qué
  se ejecutó y dónde). Si el cambio añade tablas, políticas, funciones o rutas,
  añade también su test en el mismo cambio.
- Una excepción a estas reglas es una nota `Excepción` en `Seguridad/` con su
  justificación. Sin nota, no hay excepción.
- `Estado` de una excepción ∈ `Vigente` · `Retirada`. Al retirar una excepción se
  quita también el comentario `excepcion:` del objeto. Una excepción vencida
  (`Revisar antes de` en el pasado) se revisa antes de cualquier otro cambio
  sobre ese objeto.

## Reglas fundamentales del proyecto

### 1. Gestor de paquetes y su política

- **pnpm** es obligatorio (`packageManager: pnpm@10.33.2` en `package.json`).
  Prohibido usar `npm` o `yarn` para instalar o modificar dependencias.
- El script `preinstall` (`npx only-allow pnpm`) hace cumplir esto: cualquier
  intento de `npm install` falla automáticamente.
- Comandos: `pnpm install` para dependencias; `ng serve`, `ng build`, `ng test`
  para desarrollo, build y tests respectivamente.

### 2. Framework/stack y sus reglas

- **Angular 21** con componentes standalone y Signals. No usar NgModules.
- No fijar `standalone: true` en los decoradores: es el valor por defecto desde
  Angular v20+.
- Usar Signals para estado local; `computed()` para estado derivado. No usar
  `mutate` sobre signals — usar `update()` o `set()`.
- Usar `input()` y `output()` en vez de los decoradores `@Input`/`@Output`.
- No usar `@HostBinding`/`@HostListener`: usar el objeto `host` del decorador
  `@Component`/`@Directive`.
- `changeDetection: ChangeDetectionStrategy.OnPush` en todos los componentes.
- Usar control de flujo nativo en plantillas (`@if`, `@for`, `@switch`), nunca
  `*ngIf`/`*ngFor`/`*ngSwitch`. Tampoco `ngClass`/`ngStyle`: usar bindings de
  `class`/`style`.
- Formularios reactivos en vez de template-driven.
- `inject()` en vez de inyección por constructor; `providedIn: 'root'` para
  servicios singleton.
- Los servicios de Supabase encapsulan todo acceso a la base de datos — no se
  hacen llamadas directas a Supabase desde componentes.
- **Supabase** para auth y base de datos PostgreSQL. Las credenciales van en
  `src/environments/environment.ts` (no se commitea).
- Accesibilidad: ver el apartado "Accesibilidad" de
  [[#Seguridad, coste y cumplimiento]].
- **TypeScript 5.9** en modo estricto. Evitar `any`; usar `unknown` cuando el
  tipo sea incierto. Preferir inferencia de tipos cuando sea evidente.
- **Vitest** como test runner (`ng test`). **Prettier** para formateo.

### 3. Versionado y despliegue

- Versión actual: `0.1.0` (SemVer) en `package.json`.
- Build de producción con `ng build` → `dist/gift-card/`.
- Si se modifica el schema de Supabase, regenerar tipos con
  `supabase gen types typescript --project-id <id> > src/app/models/database.ts`.

### 4. Idioma de código y documentación

- Identificadores de código (clases, variables, selectores) en inglés, siguiendo
  las convenciones de Angular.
- Documentación de proyecto y mensajes al usuario en español.
- Comentarios en el código: no describir el qué (el código ya lo dice); usarlos
  solo para el porqué — una restricción oculta, un workaround, una decisión no
  obvia.

### 5. Estilo de trabajo

- **Variables CSS/tokens de diseño**: antes de aplicar valores estáticos de
  color, espaciado, borde o tipografía, revisar los estilos globales y usar los
  tokens existentes. Solo añadir un valor nuevo si ningún token cubre el caso
  (documentarlo entonces en [[Decisiones visuales/Decisiones visuales.base|Decisiones visuales]]).
- **Reutilización primero**: antes de crear un componente, hook o utilidad desde
  cero, revisar el [[Catálogo técnico]] y el código existente.
- **Manejo de errores proactivo**: en lógica de negocio y llamadas a Supabase,
  asumir que pueden fallar; usar `try/catch` y validaciones tempranas, sin
  suprimir errores en silencio.
- **Simplicidad y modularidad**: componentes y funciones pequeños, de
  responsabilidad única. Si un fichero crece demasiado, proponer cómo dividirlo
  antes de seguir añadiendo código.

## Propósito del proyecto

Aplicación Angular para gestionar tarjetas regalo (gift cards): crearlas,
editarlas, ver su detalle y compartirlas en tiempo real entre usuarios usando
Supabase Realtime. Incluye selector de color por tarjeta y tema claro/oscuro.

## Arquitectura objetivo

```
src/app/
├── components/
│   ├── gift-card-detail/   # Vista detalle de una tarjeta
│   ├── gift-card-form/     # Formulario crear/editar
│   ├── gift-card-list/     # Listado de tarjetas
│   ├── shared-card/        # Componente de tarjeta reutilizable (vista compartida)
│   └── theme-toggle/       # Toggle claro/oscuro
├── models/                 # Tipos e interfaces de dominio (incluye database.ts generado)
└── services/                # GiftCardService, SupabaseService, ThemeService
```

Reglas de dependencia: los componentes de `components/` consumen los servicios
de `services/`; ningún componente accede a Supabase directamente, siempre a
través de `SupabaseService` o `GiftCardService`. Los modelos de dominio viven en
`models/` y son la única fuente de tipos compartidos entre servicios y
componentes.
