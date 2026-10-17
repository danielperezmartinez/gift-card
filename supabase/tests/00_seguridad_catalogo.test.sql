-- Revisa el catálogo y falla ante los patrones prohibidos por el sistema
-- "Seguridad, coste y cumplimiento" (docs/README.md). Se ejecuta con
-- `supabase test db` contra la base local construida con supabase/migrations/.
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

create temp table _esquemas(nombre text) on commit drop;
insert into _esquemas values ('gift_card');

-- 1. Toda tabla propia tiene RLS activado.
select is_empty($$
  select n.nspname || '.' || c.relname
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r', 'p')
    and n.nspname in (select nombre from _esquemas)
    and not c.relrowsecurity
$$, 'Toda tabla propia tiene RLS activado');

-- 2. Ninguna política de escritura es USING/WITH CHECK (true).
select is_empty($$
  select n.nspname || '.' || c.relname || ' · ' || p.polname
  from pg_policy p
  join pg_class c on c.oid = p.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in (select nombre from _esquemas)
    and p.polcmd in ('a', 'w', 'd', '*')
    and (pg_get_expr(p.polqual, p.polrelid) in ('true', '(true)')
      or pg_get_expr(p.polwithcheck, p.polrelid) in ('true', '(true)'))
$$, 'Ninguna política de INSERT/UPDATE/DELETE/ALL es (true)');

-- 3. Una política SELECT (true) solo existe con excepción escrita.
select is_empty($$
  select n.nspname || '.' || c.relname || ' · ' || p.polname
  from pg_policy p
  join pg_class c on c.oid = p.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in (select nombre from _esquemas)
    and p.polcmd = 'r'
    and pg_get_expr(p.polqual, p.polrelid) in ('true', '(true)')
    and coalesce(obj_description(p.oid, 'pg_policy'), '') not like 'excepcion:%'
$$, 'Las políticas SELECT (true) tienen excepción escrita');

-- 4. Toda función SECURITY DEFINER fija search_path vacío.
select is_empty($$
  select p.oid::regprocedure::text
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where p.prosecdef
    and n.nspname in (select nombre from _esquemas)
    and not exists (
      select 1 from unnest(coalesce(p.proconfig, '{}')) cfg
      where cfg in ('search_path=""', 'search_path=')
    )
$$, 'Las funciones SECURITY DEFINER tienen search_path vacío');

-- 5. anon no ejecuta funciones SECURITY DEFINER salvo excepción escrita.
select is_empty($$
  select p.oid::regprocedure::text
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where p.prosecdef
    and n.nspname in (select nombre from _esquemas)
    and has_function_privilege('anon', p.oid, 'EXECUTE')
    and coalesce(obj_description(p.oid, 'pg_proc'), '') not like 'excepcion:%'
$$, 'anon no ejecuta funciones SECURITY DEFINER sin excepción');

-- 6. Extensiones con salida a red fuera del alcance de anon y authenticated.
--    Si pg_net se instala, Supabase concede acceso a anon y authenticated por
--    defecto: una migración debe revocarlo.
select is_empty($$
  select r.rolname || ' → ' || p.oid::regprocedure::text
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  cross join (values ('anon'), ('authenticated')) r(rolname)
  where n.nspname in ('net', 'http')
    and has_schema_privilege(r.rolname, n.oid, 'USAGE')
    and has_function_privilege(r.rolname, p.oid, 'EXECUTE')
$$, 'pg_net/http no son ejecutables por anon ni authenticated');

-- 7. Todo bucket tiene límite de tamaño.
select is_empty($$
  select id from storage.buckets where file_size_limit is null
$$, 'Todo bucket tiene file_size_limit');

select * from finish();
rollback;
