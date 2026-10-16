-- gift_card: acceso solo mediante funciones RPC; la edición exige un token secreto.
-- Afecta solo al esquema gift_card y a su presencia en la publicación supabase_realtime.

-- 1. Cerrar el acceso directo a las tablas
drop policy "Public links can read shared cards" on gift_card.shared_cards;
drop policy "Clients can create shared cards" on gift_card.shared_cards;
drop policy "Clients can update shared cards" on gift_card.shared_cards;
drop policy "Public links can read shared expenses" on gift_card.shared_expenses;
drop policy "Clients can create shared expenses" on gift_card.shared_expenses;
drop policy "Clients can update shared expenses" on gift_card.shared_expenses;
drop policy "Clients can delete shared expenses" on gift_card.shared_expenses;

revoke all on gift_card.shared_cards, gift_card.shared_expenses from anon, authenticated;

alter publication supabase_realtime drop table gift_card.shared_cards, gift_card.shared_expenses;

comment on table gift_card.shared_cards is
  'RLS activo sin políticas a propósito: el acceso es solo por funciones RPC SECURITY DEFINER.';
comment on table gift_card.shared_expenses is
  'RLS activo sin políticas a propósito: el acceso es solo por funciones RPC SECURITY DEFINER.';

-- 2. Propiedad y límites
alter table gift_card.shared_cards
  add column edit_token_hash bytea,
  add column shared_at timestamptz not null default now(),
  add constraint shared_cards_name_length check (char_length(name) between 1 and 100),
  add constraint shared_cards_description_length check (char_length(description) <= 500),
  add constraint shared_cards_color_format check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint shared_cards_initial_amount_max check (initial_amount <= 100000);

alter table gift_card.shared_expenses
  add constraint shared_expenses_amount_max check (amount <= 100000);

create index shared_cards_shared_at_idx on gift_card.shared_cards (shared_at);

-- 3. Funciones internas (sin permiso de ejecución para la API)
create function gift_card.assert_card_owner(p_card_id uuid, p_edit_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_edit_token is null or not exists (
    select 1
    from gift_card.shared_cards
    where id = p_card_id
      and edit_token_hash = sha256(convert_to(p_edit_token, 'UTF8'))
  ) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
end;
$$;

create function gift_card.recalculate_balance(p_card_id uuid)
returns numeric
language sql
security definer
set search_path = ''
as $$
  update gift_card.shared_cards c
  set balance = c.initial_amount - coalesce(
    (select sum(e.amount) from gift_card.shared_expenses e where e.card_id = c.id), 0)
  where c.id = p_card_id
  returning c.balance;
$$;

create function gift_card.broadcast_card_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card_id uuid;
begin
  if tg_table_name = 'shared_cards' then
    v_card_id := coalesce(new.id, old.id);
  else
    v_card_id := coalesce(new.card_id, old.card_id);
  end if;
  -- Payload vacío: el cliente solo recibe el aviso y vuelve a pedir la tarjeta por RPC.
  perform realtime.send('{}'::jsonb, 'changed', 'gift_card:' || v_card_id, false);
  return null;
end;
$$;

create trigger shared_cards_broadcast
  after insert or update or delete on gift_card.shared_cards
  for each row execute function gift_card.broadcast_card_change();

create trigger shared_expenses_broadcast
  after insert or update or delete on gift_card.shared_expenses
  for each row execute function gift_card.broadcast_card_change();

-- 4. API pública
create function gift_card.get_shared_card(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'description', c.description,
    'initial_amount', c.initial_amount,
    'balance', c.balance,
    'created_at', c.created_at,
    'color', c.color,
    'expenses', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', e.id, 'amount', e.amount, 'date', e.date)
        order by e.date desc)
      from gift_card.shared_expenses e
      where e.card_id = c.id), '[]'::jsonb))
  from gift_card.shared_cards c
  where c.id = p_id;
$$;

create function gift_card.create_shared_card(
  p_id uuid,
  p_name text,
  p_description text,
  p_initial_amount numeric,
  p_created_at bigint,
  p_color text,
  p_edit_token text,
  p_expenses jsonb default '[]'::jsonb
)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(coalesce(p_edit_token, '')) not between 32 and 128 then
    raise exception 'invalid edit token' using errcode = '22023';
  end if;
  if jsonb_typeof(p_expenses) is distinct from 'array' or jsonb_array_length(p_expenses) > 200 then
    raise exception 'invalid expenses' using errcode = '22023';
  end if;

  -- Límite global: protege el tamaño de la base compartida con otras aplicaciones.
  perform pg_advisory_xact_lock(hashtext('gift_card.create_shared_card'));
  if (select count(*) from gift_card.shared_cards where shared_at > now() - interval '1 hour') >= 50
     or (select count(*) from gift_card.shared_cards) >= 2000 then
    raise exception 'sharing limit reached' using errcode = '54000';
  end if;

  -- Un id existente provoca unique_violation: nunca se sobrescribe una tarjeta ajena.
  insert into gift_card.shared_cards
    (id, name, description, initial_amount, balance, created_at, color, edit_token_hash)
  values
    (p_id, p_name, p_description, p_initial_amount, p_initial_amount, p_created_at, p_color,
     sha256(convert_to(p_edit_token, 'UTF8')));

  insert into gift_card.shared_expenses (id, card_id, amount, date)
  select (e->>'id')::uuid, p_id, (e->>'amount')::numeric, (e->>'date')::bigint
  from jsonb_array_elements(p_expenses) e;

  return gift_card.recalculate_balance(p_id);
end;
$$;

create function gift_card.add_shared_expense(
  p_card_id uuid,
  p_edit_token text,
  p_expense_id uuid,
  p_amount numeric,
  p_date bigint
)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform gift_card.assert_card_owner(p_card_id, p_edit_token);
  if (select count(*) from gift_card.shared_expenses where card_id = p_card_id) >= 200 then
    raise exception 'too many expenses' using errcode = '54000';
  end if;

  insert into gift_card.shared_expenses (id, card_id, amount, date)
  values (p_expense_id, p_card_id, p_amount, p_date);

  return gift_card.recalculate_balance(p_card_id);
end;
$$;

create function gift_card.remove_shared_expense(
  p_card_id uuid,
  p_edit_token text,
  p_expense_id uuid
)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform gift_card.assert_card_owner(p_card_id, p_edit_token);
  delete from gift_card.shared_expenses where id = p_expense_id and card_id = p_card_id;
  return gift_card.recalculate_balance(p_card_id);
end;
$$;

create function gift_card.update_shared_card_color(
  p_card_id uuid,
  p_edit_token text,
  p_color text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform gift_card.assert_card_owner(p_card_id, p_edit_token);
  update gift_card.shared_cards set color = p_color where id = p_card_id;
end;
$$;

-- Tarjetas compartidas antes de esta migración: el primer dispositivo que las tenga
-- marcadas como compartidas reclama su propiedad. Solo hasta fin de 2026.
create function gift_card.claim_shared_card(p_card_id uuid, p_edit_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(coalesce(p_edit_token, '')) not between 32 and 128 then
    raise exception 'invalid edit token' using errcode = '22023';
  end if;

  update gift_card.shared_cards
  set edit_token_hash = sha256(convert_to(p_edit_token, 'UTF8'))
  where id = p_card_id
    and edit_token_hash is null
    and now() < timestamptz '2027-01-01 00:00:00+00';

  return found;
end;
$$;

-- 5. Permisos de ejecución
revoke all on function
  gift_card.assert_card_owner(uuid, text),
  gift_card.recalculate_balance(uuid),
  gift_card.broadcast_card_change(),
  gift_card.get_shared_card(uuid),
  gift_card.create_shared_card(uuid, text, text, numeric, bigint, text, text, jsonb),
  gift_card.add_shared_expense(uuid, text, uuid, numeric, bigint),
  gift_card.remove_shared_expense(uuid, text, uuid),
  gift_card.update_shared_card_color(uuid, text, text),
  gift_card.claim_shared_card(uuid, text)
from public, anon, authenticated;

grant execute on function
  gift_card.get_shared_card(uuid),
  gift_card.create_shared_card(uuid, text, text, numeric, bigint, text, text, jsonb),
  gift_card.add_shared_expense(uuid, text, uuid, numeric, bigint),
  gift_card.remove_shared_expense(uuid, text, uuid),
  gift_card.update_shared_card_color(uuid, text, text),
  gift_card.claim_shared_card(uuid, text)
to anon, authenticated;

notify pgrst, 'reload schema';
