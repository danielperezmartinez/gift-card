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
- Accesibilidad: debe pasar todas las comprobaciones AXE y cumplir WCAG AA
  (foco, contraste, ARIA).
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
