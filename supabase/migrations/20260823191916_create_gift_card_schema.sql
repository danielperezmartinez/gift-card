-- Esquema inicial de Gift Card en el proyecto Supabase compartido (devappsdpm-db).
-- Reconstruido el 2026-10-16 a partir del estado remoto: esta versión ya figura en
-- supabase_migrations.schema_migrations y no se vuelve a aplicar.
-- La exposición del esquema en PostgREST (pgrst.db_schemas) la gestiona nocendland.

create schema if not exists gift_card;

grant usage on schema gift_card to anon, authenticated, service_role;

create table gift_card.shared_cards (
  id uuid primary key,
  name text not null,
  description text not null,
  initial_amount numeric not null check (initial_amount >= 0),
  balance numeric not null,
  created_at bigint not null,
  color text
);

create table gift_card.shared_expenses (
  id uuid primary key,
  card_id uuid not null references gift_card.shared_cards (id) on delete cascade,
  amount numeric not null check (amount > 0),
  date bigint not null
);

create index shared_expenses_card_id_date_idx
  on gift_card.shared_expenses (card_id, date desc);

alter table gift_card.shared_cards enable row level security;
alter table gift_card.shared_expenses enable row level security;

grant select, insert, update on gift_card.shared_cards to anon, authenticated;
grant select, insert, update, delete on gift_card.shared_expenses to anon, authenticated;
grant all on gift_card.shared_cards, gift_card.shared_expenses to service_role;

create policy "Public links can read shared cards" on gift_card.shared_cards
  for select to anon, authenticated using (true);
create policy "Clients can create shared cards" on gift_card.shared_cards
  for insert to anon, authenticated with check (true);
create policy "Clients can update shared cards" on gift_card.shared_cards
  for update to anon, authenticated using (true) with check (true);

create policy "Public links can read shared expenses" on gift_card.shared_expenses
  for select to anon, authenticated using (true);
create policy "Clients can create shared expenses" on gift_card.shared_expenses
  for insert to anon, authenticated with check (true);
create policy "Clients can update shared expenses" on gift_card.shared_expenses
  for update to anon, authenticated using (true) with check (true);
create policy "Clients can delete shared expenses" on gift_card.shared_expenses
  for delete to anon, authenticated using (true);

alter publication supabase_realtime add table gift_card.shared_cards, gift_card.shared_expenses;
