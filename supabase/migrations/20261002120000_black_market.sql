-- Reincarnation roadmap: Black Market (Mercado de las Sombras), phase 1. See docs/REINCARNATION_BLACK_MARKET.md.
--
-- Server-authoritative auctions for units and spells:
--   * Deposit up front, bids cannot be cancelled, the previous top bidder is refunded when outbid.
--   * Minimum raise 5 % over the current price (or the lot's minimum price for the first bid).
--   * First bid opens the countdown (30 min); any bid in the last 30 min resets it to 30 min.
--   * One turn per order, plus one turn per extra distinct lot reference (TR: "2 turns for a Carpet and an Oil Flask").
--   * Lazy settlement (private.bm_settle_due) on every read/bid; winner receives the goods in the same transaction.
--   * Feature flag rulesets.config.black_market.enabled (absent = OFF). Lots are created only by private.bm_spawn_lot
--     (service role / SQL), never by clients. Tables have RLS on and no policies: clients use the RPCs only.
-- Idempotent. Does not touch existing functions.

create table if not exists public.bm_lots (
  id bigint generated always as identity primary key,
  season_id uuid not null references public.seasons(id),
  kind text not null check (kind in ('unit','spell')),
  ref text not null,
  qty bigint not null default 1 check (qty > 0),
  min_price bigint not null check (min_price > 0),
  current_price bigint not null default 0,
  current_bidder uuid references public.realms(id),
  listed_until timestamptz not null,
  ends_at timestamptz,
  settled_at timestamptz,
  status text not null default 'open' check (status in ('open','sold','expired')),
  created_at timestamptz not null default now()
);
create index if not exists bm_lots_open_idx on public.bm_lots (season_id, status, ends_at);

create table if not exists public.bm_bids (
  id bigint generated always as identity primary key,
  lot_id bigint not null references public.bm_lots(id),
  realm_id uuid not null references public.realms(id),
  amount bigint not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index if not exists bm_bids_realm_idx on public.bm_bids (realm_id, created_at desc);

alter table public.bm_lots enable row level security;
alter table public.bm_bids enable row level security;
revoke all on public.bm_lots, public.bm_bids from anon, authenticated;

create or replace function private.bm_enabled()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select rs.config->'black_market'->>'enabled' from public.rulesets rs
                   where rs.is_active order by rs.created_at desc limit 1), 'false') = 'true';
$$;
revoke all on function private.bm_enabled() from public, anon, authenticated;

-- Lots are created by operators only (service role / SQL editor).
create or replace function private.bm_spawn_lot(p_kind text, p_ref text, p_qty bigint, p_min_price bigint, p_hours integer default 6)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_season uuid;
  v_id bigint;
begin
  select id into v_season from public.seasons where status in ('setup','active') order by created_at desc limit 1;
  if v_season is null then raise exception 'NO_ACTIVE_SEASON'; end if;
  if p_kind = 'unit' and not exists (select 1 from public.unit_catalog where id = p_ref) then raise exception 'UNIT_NOT_FOUND'; end if;
  if p_kind = 'spell' and not exists (select 1 from public.spell_catalog where id = p_ref) then raise exception 'SPELL_NOT_FOUND'; end if;
  insert into public.bm_lots(season_id, kind, ref, qty, min_price, current_price, listed_until)
  values (v_season, p_kind, p_ref, case when p_kind = 'spell' then 1 else p_qty end, p_min_price, 0,
          now() + make_interval(hours => greatest(1, p_hours)))
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function private.bm_spawn_lot(text, text, bigint, bigint, integer) from public, anon, authenticated;

create or replace function private.bm_settle_due()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  l public.bm_lots%rowtype;
  v_n integer := 0;
begin
  for l in
    select * from public.bm_lots
    where status = 'open' and ((ends_at is not null and ends_at <= now()) or (ends_at is null and listed_until <= now()))
    order by id
    for update skip locked
  loop
    if l.current_bidder is null then
      update public.bm_lots set status = 'expired', settled_at = now() where id = l.id;
    else
      if l.kind = 'unit' then
        insert into public.realm_army(realm_id, unit_id, quantity) values (l.current_bidder, l.ref, l.qty)
        on conflict (realm_id, unit_id) do update set quantity = public.realm_army.quantity + excluded.quantity, updated_at = now();
      else
        insert into public.realm_known_spells(realm_id, spell_id, learned_via) values (l.current_bidder, l.ref, 'black_market')
        on conflict do nothing;
      end if;
      update public.bm_lots set status = 'sold', settled_at = now() where id = l.id;
      insert into public.realm_events(realm_id, action_type, turns_spent, payload, result)
      values (l.current_bidder, 'BM_WON', 0,
              jsonb_build_object('lot_id', l.id, 'kind', l.kind, 'ref', l.ref),
              jsonb_build_object('qty', l.qty, 'price', l.current_price));
    end if;
    v_n := v_n + 1;
  end loop;
  return v_n;
end;
$$;
revoke all on function private.bm_settle_due() from public, anon, authenticated;

create or replace function private.bm_place_bids_impl(p_bids jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  r public.realms%rowtype;
  l public.bm_lots%rowtype;
  v_item jsonb;
  v_lot_id bigint;
  v_amount bigint;
  v_min bigint;
  v_refs text[] := '{}';
  v_turns integer;
  v_spent bigint := 0;
  v_placed jsonb := '[]'::jsonb;
  v_ids bigint[] := '{}';
  v_prev uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not private.bm_enabled() then raise exception 'BLACK_MARKET_DISABLED'; end if;
  if p_bids is null or jsonb_typeof(p_bids) <> 'array' or jsonb_array_length(p_bids) < 1 or jsonb_array_length(p_bids) > 20 then
    raise exception 'INVALID_BIDS';
  end if;

  perform * from private.sync_my_turns_impl();
  perform private.bm_settle_due();

  select rr.* into r
  from public.realms rr join public.seasons ss on ss.id = rr.season_id
  where rr.player_id = v_uid and ss.status in ('setup','active')
  order by ss.created_at desc limit 1;
  if r.id is null then raise exception 'REALM_NOT_FOUND'; end if;
  if r.status <> 'alive' then raise exception 'MAGE_NOT_ALIVE'; end if;

  -- Collect distinct lot ids (sorted, to take locks in a stable order) and the turn cost.
  for v_item in select * from jsonb_array_elements(p_bids) loop
    v_lot_id := (v_item->>'lot_id')::bigint;
    if v_lot_id is null or v_lot_id = any(v_ids) then raise exception 'INVALID_BIDS'; end if;
    v_ids := v_ids || v_lot_id;
  end loop;
  select coalesce(array_agg(distinct ref), '{}') into v_refs from public.bm_lots where id = any(v_ids);
  v_turns := greatest(1, coalesce(array_length(v_refs, 1), 0));

  -- Lock every involved realm (bidder + current top bidders) in id order, then the lots.
  perform 1 from public.realms
   where id in (select r.id union select current_bidder from public.bm_lots where id = any(v_ids) and current_bidder is not null)
   order by id for update;
  select * into r from public.realms where id = r.id;
  if r.turns < v_turns then raise exception 'NOT_ENOUGH_TURNS'; end if;

  for v_item in select * from jsonb_array_elements(p_bids) loop
    v_lot_id := (v_item->>'lot_id')::bigint;
    v_amount := (v_item->>'amount')::bigint;
    select * into l from public.bm_lots where id = v_lot_id for update;
    if l.id is null or l.season_id <> r.season_id then raise exception 'LOT_NOT_FOUND'; end if;
    if l.status <> 'open' or (l.ends_at is not null and l.ends_at <= now()) or (l.ends_at is null and l.listed_until <= now()) then
      raise exception 'LOT_CLOSED';
    end if;
    if l.current_bidder = r.id then raise exception 'ALREADY_TOP_BIDDER'; end if;
    if l.kind = 'spell' and exists (select 1 from public.realm_known_spells k where k.realm_id = r.id and k.spell_id = l.ref) then
      raise exception 'SPELL_ALREADY_KNOWN';
    end if;
    v_min := case when l.current_bidder is null then l.min_price else ceil(l.current_price::numeric * 1.05)::bigint end;
    if v_amount is null or v_amount < v_min then raise exception 'BID_TOO_LOW'; end if;
    if r.gold < v_amount then raise exception 'NOT_ENOUGH_GOLD'; end if;

    -- Deposit from the bidder, refund to the outbid realm.
    update public.realms set gold = gold - v_amount, updated_at = now() where id = r.id returning * into r;
    v_prev := l.current_bidder;
    if v_prev is not null then
      update public.realms set gold = gold + l.current_price, updated_at = now() where id = v_prev;
    end if;

    update public.bm_lots
    set current_price = v_amount, current_bidder = r.id,
        ends_at = case when ends_at is null or ends_at - now() < interval '30 minutes' then now() + interval '30 minutes' else ends_at end
    where id = l.id;
    insert into public.bm_bids(lot_id, realm_id, amount) values (l.id, r.id, v_amount);
    v_spent := v_spent + v_amount;
    v_placed := v_placed || jsonb_build_object('lot_id', l.id, 'kind', l.kind, 'ref', l.ref, 'amount', v_amount);
  end loop;

  update public.realms set turns = turns - v_turns, updated_at = now() where id = r.id returning * into r;
  insert into public.realm_events(realm_id, action_type, turns_spent, payload, result)
  values (r.id, 'BM_BID', v_turns, jsonb_build_object('bids', v_placed),
          jsonb_build_object('deposited', v_spent, 'turns_remaining', r.turns, 'gold', r.gold));

  return jsonb_build_object('placed', v_placed, 'deposited', v_spent, 'turns_spent', v_turns,
                            'turns_remaining', r.turns, 'gold', r.gold);
end;
$$;
revoke all on function private.bm_place_bids_impl(jsonb) from public, anon, authenticated;

create or replace function private.bm_list_lots_impl(p_kind text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_realm uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not private.bm_enabled() then return jsonb_build_object('enabled', false, 'lots', '[]'::jsonb); end if;
  perform private.bm_settle_due();
  v_realm := private.my_realm_id();
  return jsonb_build_object(
    'enabled', true,
    'lots', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id, 'kind', l.kind, 'ref', l.ref, 'qty', l.qty,
        'name', coalesce(u.name_es, s.name_es, l.ref),
        'min_price', l.min_price, 'current_price', l.current_price,
        'next_min_bid', case when l.current_bidder is null then l.min_price else ceil(l.current_price::numeric * 1.05)::bigint end,
        'minutes_left', ceil(extract(epoch from (coalesce(l.ends_at, l.listed_until) - now())) / 60)::integer,
        'countdown_started', l.ends_at is not null,
        'is_mine', l.current_bidder = v_realm,
        'has_bids', l.current_bidder is not null) order by coalesce(l.ends_at, l.listed_until), l.id)
      from public.bm_lots l
      left join public.unit_catalog u on l.kind = 'unit' and u.id = l.ref
      left join public.spell_catalog s on l.kind = 'spell' and s.id = l.ref
      where l.status = 'open' and (p_kind is null or l.kind = p_kind)
        and l.season_id = (select season_id from public.realms where id = v_realm)
    ), '[]'::jsonb));
end;
$$;
revoke all on function private.bm_list_lots_impl(text) from public, anon, authenticated;

create or replace function private.bm_my_bids_impl()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_realm uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not private.bm_enabled() then return jsonb_build_object('enabled', false, 'bids', '[]'::jsonb); end if;
  perform private.bm_settle_due();
  v_realm := private.my_realm_id();
  return jsonb_build_object('enabled', true, 'bids', coalesce((
    select jsonb_agg(jsonb_build_object(
      'lot_id', l.id, 'kind', l.kind, 'ref', l.ref, 'qty', l.qty, 'status', l.status,
      'my_amount', (select max(b.amount) from public.bm_bids b where b.lot_id = l.id and b.realm_id = v_realm),
      'current_price', l.current_price, 'winning', l.current_bidder = v_realm,
      'minutes_left', greatest(0, ceil(extract(epoch from (coalesce(l.ends_at, l.listed_until) - now())) / 60)::integer)
    ) order by l.id desc)
    from public.bm_lots l
    where l.id in (select b.lot_id from public.bm_bids b where b.realm_id = v_realm)
      and (l.status = 'open' or l.settled_at > now() - interval '24 hours')
  ), '[]'::jsonb));
end;
$$;
revoke all on function private.bm_my_bids_impl() from public, anon, authenticated;

create or replace function public.bm_list_lots(p_kind text default null)
returns jsonb language sql set search_path = '' as $$ select private.bm_list_lots_impl(p_kind); $$;
create or replace function public.bm_place_bids(p_bids jsonb)
returns jsonb language sql set search_path = '' as $$ select private.bm_place_bids_impl(p_bids); $$;
create or replace function public.bm_my_bids()
returns jsonb language sql set search_path = '' as $$ select private.bm_my_bids_impl(); $$;

revoke all on function public.bm_list_lots(text), public.bm_place_bids(jsonb), public.bm_my_bids() from public, anon;
grant execute on function public.bm_list_lots(text), public.bm_place_bids(jsonb), public.bm_my_bids() to authenticated;
