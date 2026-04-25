
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Instrucciones de desarrollo

- Uso estricto de variables (CSS/Estilos): Antes de aplicar valores estáticos (hardcoded) para colores, espaciados, bordes o tipografías, revisa el archivo de estilos globales. Debes utilizar obligatoriamente las variables CSS/tokens de diseño existentes para mantener la consistencia visual. Solo añade valores nuevos si es absolutamente indispensable y no hay una variable que cubra el caso de uso.
- Priorizar la reutilización: Antes de crear un nuevo componente visual, hook o función utilitaria desde cero, analiza el código existente para verificar si ya hay algo similar que se pueda reutilizar o extender fácilmente.
- Comentarios con propósito: No comentes el qué hace el código si es evidente leyéndolo. Usa los comentarios exclusivamente para explicar el por qué detrás de decisiones de diseño, lógicas complejas o soluciones a casos atípicos (edge cases).
- Manejo de errores proactivo: Al escribir lógica de negocio, llamadas a APIs o funciones complejas, asume que las cosas pueden fallar. Implementa siempre un manejo de errores robusto (ej. bloques try/catch, validaciones tempranas) y evita suprimir errores silenciosamente.
- Simplicidad y modularidad: Prioriza funciones y componentes pequeños, de responsabilidad única (Single Responsibility Principle). Si un archivo o función empieza a crecer demasiado, proponme una forma de refactorizarlo y dividirlo.