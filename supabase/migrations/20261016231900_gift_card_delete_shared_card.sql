-- Permite al dueño de una tarjeta compartida dejar de compartirla: borra la copia
-- remota (y sus gastos, por la FK en cascada) y el enlace deja de funcionar.
-- Afecta solo al esquema gift_card.

create function gift_card.delete_shared_card(p_card_id uuid, p_edit_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform gift_card.assert_card_owner(p_card_id, p_edit_token);
  delete from gift_card.shared_cards where id = p_card_id;
end;
$$;

revoke all on function gift_card.delete_shared_card(uuid, text) from public, anon, authenticated;
grant execute on function gift_card.delete_shared_card(uuid, text) to anon, authenticated;

comment on function gift_card.delete_shared_card(uuid, text) is
  'excepcion: Excepción - gift_card RPC públicas';

notify pgrst, 'reload schema';
