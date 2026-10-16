-- Marca las RPC públicas de gift_card como excepción escrita a la regla "anon no
-- ejecuta funciones SECURITY DEFINER". Justificación en
-- docs/Seguridad/Excepción - gift_card RPC públicas.md. Solo añade comentarios.

comment on function gift_card.get_shared_card(uuid) is
  'excepcion: Excepción - gift_card RPC públicas';
comment on function gift_card.create_shared_card(uuid, text, text, numeric, bigint, text, text, jsonb) is
  'excepcion: Excepción - gift_card RPC públicas';
comment on function gift_card.add_shared_expense(uuid, text, uuid, numeric, bigint) is
  'excepcion: Excepción - gift_card RPC públicas';
comment on function gift_card.remove_shared_expense(uuid, text, uuid) is
  'excepcion: Excepción - gift_card RPC públicas';
comment on function gift_card.update_shared_card_color(uuid, text, text) is
  'excepcion: Excepción - gift_card RPC públicas';
comment on function gift_card.claim_shared_card(uuid, text) is
  'excepcion: Excepción - gift_card RPC públicas';
