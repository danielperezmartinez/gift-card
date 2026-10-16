-- Aislamiento de gift_card: con la clave publicable (anon) o con cualquier
-- usuario autenticado no se puede listar, crear, modificar ni borrar tarjetas
-- directamente, y por RPC solo se lee por id exacto y solo edita quien tiene el
-- token. Gift Card no usa Auth: "otro usuario" es cualquier cliente sin el token.
begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

-- Acceso directo a las tablas: denegado a anon y authenticated.
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok($$ select 1 from gift_card.shared_cards $$,
  '42501', null, 'anon no lista tarjetas');
select throws_ok($$ select 1 from gift_card.shared_expenses $$,
  '42501', null, 'anon no lista gastos');
select throws_ok(
  $$ insert into gift_card.shared_cards (id, name, description, initial_amount, balance, created_at)
     values (gen_random_uuid(), 'x', '', 1, 1, 0) $$,
  '42501', null, 'anon no inserta tarjetas directamente');
select throws_ok($$ update gift_card.shared_cards set balance = 0 $$,
  '42501', null, 'anon no modifica tarjetas directamente');
select throws_ok($$ delete from gift_card.shared_expenses $$,
  '42501', null, 'anon no borra gastos directamente');
select throws_ok(
  $$ select gift_card.assert_card_owner('11111111-1111-1111-1111-111111111111', repeat('a', 40)) $$,
  '42501', null, 'anon no ejecuta funciones internas');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select throws_ok($$ select 1 from gift_card.shared_cards $$,
  '42501', null, 'authenticated no lista tarjetas');
select throws_ok($$ update gift_card.shared_expenses set amount = 1 $$,
  '42501', null, 'authenticated no modifica gastos directamente');

-- Dueño (dispositivo A, token a…) comparte una tarjeta por RPC.
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select is(
  gift_card.create_shared_card(
    '11111111-1111-1111-1111-111111111111', 'Tarjeta A', 'de A', 100, 0, '#112233',
    repeat('a', 40),
    '[{"id":"22222222-2222-2222-2222-222222222222","amount":10,"date":1}]'::jsonb),
  90::numeric, 'A comparte su tarjeta y el saldo lo calcula el servidor');

select is(
  gift_card.get_shared_card('11111111-1111-1111-1111-111111111111')->>'name',
  'Tarjeta A', 'Con el id exacto la RPC devuelve esa tarjeta');
select ok(
  gift_card.get_shared_card(gen_random_uuid()) is null,
  'Con un id inventado la RPC no devuelve nada');
select ok(
  not (gift_card.get_shared_card('11111111-1111-1111-1111-111111111111') ? 'edit_token_hash'),
  'La RPC no expone el hash del token');

-- Otro cliente (token b…) no puede tocar la tarjeta de A.
select throws_ok(
  $$ select gift_card.add_shared_expense('11111111-1111-1111-1111-111111111111',
       repeat('b', 40), gen_random_uuid(), 50, 2) $$,
  '42501', null, 'Sin el token de A no se añaden gastos');
select throws_ok(
  $$ select gift_card.remove_shared_expense('11111111-1111-1111-1111-111111111111',
       repeat('b', 40), '22222222-2222-2222-2222-222222222222') $$,
  '42501', null, 'Sin el token de A no se borran gastos');
select throws_ok(
  $$ select gift_card.update_shared_card_color('11111111-1111-1111-1111-111111111111',
       repeat('b', 40), '#000000') $$,
  '42501', null, 'Sin el token de A no se cambia el color');
select throws_ok(
  $$ select gift_card.create_shared_card('11111111-1111-1111-1111-111111111111',
       'Suplantada', '', 1, 0, null, repeat('b', 40)) $$,
  '23505', null, 'Crear con un id existente no sobrescribe la tarjeta de A');
select is(
  gift_card.claim_shared_card('11111111-1111-1111-1111-111111111111', repeat('b', 40)),
  false, 'Una tarjeta con token no se puede reclamar');
select is(
  gift_card.get_shared_card('11111111-1111-1111-1111-111111111111')->>'balance',
  '90', 'El saldo de A sigue intacto');

-- A sí puede editar su tarjeta (las RPC no son simplemente "nadie").
select is(
  gift_card.add_shared_expense('11111111-1111-1111-1111-111111111111',
    repeat('a', 40), gen_random_uuid(), 15, 3),
  75::numeric, 'Con su token A añade un gasto');

select * from finish();
rollback;
