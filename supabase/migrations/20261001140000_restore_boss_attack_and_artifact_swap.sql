-- Two database functions were not carried over when Nexo was merged into this project (only the tables were).
-- Without them:
--   * arcanum-boss /attack spends 3 turns, then fails with SERVER_ERROR because
--     arcanum_world_boss_apply_attack does not exist (the player loses the turns and deals no damage);
--   * arcanum-community artifact market swaps fail with MARKET_SWAP_FAILED.
-- Rebuilt from how the Edge Functions call them and from the table constraints. Both are called only by
-- the service role, never by players.

-- ---------------------------------------------------------------------------------------------------
-- Identity counters left behind by the data copy. Rows were inserted with explicit ids, so the next
-- generated id collided with existing ones: arcanum_artifact_history (next id 2, rows up to 5) and
-- astrael_agent_log (next id 10, rows up to 66). Writes to them failed with "duplicate key" and the
-- Edge Functions ignore those errors, so history and agent log entries were silently lost.
-- Moves every identity counter to max(id); a no-op for the ones already in sync.
-- ---------------------------------------------------------------------------------------------------
do $fix$
declare
  t record;
  mx bigint;
begin
  for t in
    select * from (values
      ('public','arcanum_artifact_history'), ('public','arcanum_admin_audit'), ('public','astrael_agent_log'),
      ('public','economy_ledger'), ('public','realm_events'),
      ('private','direct_messages'), ('private','archmage_xp_ledger')
    ) as v(s, n)
  loop
    execute format('select coalesce(max(id), 0) from %I.%I', t.s, t.n) into mx;
    if mx > 0 then
      perform setval(pg_get_serial_sequence(format('%I.%I', t.s, t.n), 'id'), mx, true);
    end if;
  end loop;
end
$fix$;

-- ---------------------------------------------------------------------------------------------------
-- World boss: apply one attack atomically and idempotently (same attack_id twice = no double damage).
-- ---------------------------------------------------------------------------------------------------
create or replace function public.arcanum_world_boss_apply_attack(
  p_attack_id uuid,
  p_event_id text,
  p_user_id text,
  p_username text,
  p_school_code text,
  p_damage bigint,
  p_net_power bigint
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.arcanum_world_boss_events%rowtype;
  v_existing public.arcanum_world_boss_attacks%rowtype;
  v_applied bigint;
  v_new_hp bigint;
begin
  select * into v_existing from public.arcanum_world_boss_attacks where attack_id = p_attack_id;
  if found then
    return jsonb_build_object('damage', v_existing.damage, 'duplicate', true);
  end if;

  -- The row lock serializes concurrent attacks on the same boss.
  select * into v_event from public.arcanum_world_boss_events where event_id = p_event_id for update;
  if not found then raise exception 'BOSS_NOT_FOUND'; end if;
  if v_event.status <> 'active' or v_event.current_hp <= 0 then raise exception 'BOSS_NOT_ACTIVE'; end if;
  if now() < v_event.starts_at then raise exception 'BOSS_NOT_STARTED'; end if;
  if now() >= v_event.ends_at then raise exception 'BOSS_EVENT_ENDED'; end if;

  -- Never record more damage than the boss had left.
  v_applied := least(greatest(coalesce(p_damage, 0), 0), v_event.current_hp);
  v_new_hp := v_event.current_hp - v_applied;

  insert into public.arcanum_world_boss_attacks (attack_id, event_id, user_id, username, damage, net_power)
  values (p_attack_id, p_event_id, p_user_id, p_username, v_applied, greatest(coalesce(p_net_power, 0), 0));

  insert into public.arcanum_world_boss_participants as p (event_id, user_id, username, school_code, damage, attacks, last_attack_at)
  values (p_event_id, p_user_id, p_username, p_school_code, v_applied, 1, now())
  on conflict (event_id, user_id) do update
    set username = excluded.username,
        school_code = excluded.school_code,
        damage = p.damage + excluded.damage,
        attacks = p.attacks + 1,
        last_attack_at = now();

  update public.arcanum_world_boss_events
     set current_hp = v_new_hp,
         status = case when v_new_hp = 0 then 'defeated' else status end,
         defeated_at = case when v_new_hp = 0 then now() else defeated_at end
   where event_id = p_event_id;

  return jsonb_build_object('damage', v_applied, 'duplicate', false, 'current_hp', v_new_hp, 'defeated', v_new_hp = 0);
end;
$$;

revoke all on function public.arcanum_world_boss_apply_attack(uuid, text, text, text, text, bigint, bigint) from public, anon, authenticated;
grant execute on function public.arcanum_world_boss_apply_attack(uuid, text, text, text, text, bigint, bigint) to service_role;

-- ---------------------------------------------------------------------------------------------------
-- Relic market: atomic artifact-for-artifact barter between a listing and a buyer's offered relic.
-- ---------------------------------------------------------------------------------------------------
create or replace function public.arcanum_artifact_swap(
  p_listing_id uuid,
  p_buyer_user_id text,
  p_buyer_username text,
  p_buyer_school_code text,
  p_offered_instance_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  l public.arcanum_artifact_market_listings%rowtype;
  sa public.arcanum_player_artifacts%rowtype;  -- the seller's relic (listed)
  ba public.arcanum_player_artifacts%rowtype;  -- the buyer's relic (offered)
begin
  select * into l from public.arcanum_artifact_market_listings where id = p_listing_id for update;
  if not found then raise exception 'LISTING_NOT_FOUND'; end if;
  if l.status <> 'open' or l.expires_at <= now() then raise exception 'LISTING_NOT_OPEN'; end if;
  if l.seller_user_id = p_buyer_user_id then raise exception 'CANNOT_BUY_OWN_LISTING'; end if;

  select * into sa from public.arcanum_player_artifacts where id = l.artifact_instance_id for update;
  if not found or sa.lost_at is not null or sa.user_id <> l.seller_user_id then raise exception 'SELLER_ARTIFACT_UNAVAILABLE'; end if;
  if sa.equipped then raise exception 'SELLER_ARTIFACT_EQUIPPED'; end if;

  select * into ba from public.arcanum_player_artifacts where id = p_offered_instance_id for update;
  if not found or ba.lost_at is not null or ba.user_id <> p_buyer_user_id then raise exception 'BUYER_ARTIFACT_UNAVAILABLE'; end if;
  if ba.equipped then raise exception 'BUYER_ARTIFACT_EQUIPPED'; end if;
  if exists (select 1 from public.arcanum_artifact_market_listings x where x.artifact_instance_id = ba.id and x.status = 'open') then
    raise exception 'BUYER_ARTIFACT_LISTED';
  end if;
  if ba.category <> l.want_category then raise exception 'WRONG_ARTIFACT_CATEGORY'; end if;

  update public.arcanum_player_artifacts
     set user_id = p_buyer_user_id, username = p_buyer_username, school_code = p_buyer_school_code,
         equipped = false, source = 'market_swap', acquired_at = now()
   where id = sa.id;
  update public.arcanum_player_artifacts
     set user_id = l.seller_user_id, username = l.seller_username, school_code = l.seller_school_code,
         equipped = false, source = 'market_swap', acquired_at = now()
   where id = ba.id;

  update public.arcanum_artifact_market_listings
     set status = 'closed', buyer_user_id = p_buyer_user_id, buyer_username = p_buyer_username,
         offered_instance_id = ba.id, closed_at = now()
   where id = l.id;

  insert into public.arcanum_artifact_history (artifact_id, artifact_instance_id, user_id, username, event_type, source) values
    (sa.artifact_id, sa.id, l.seller_user_id,  l.seller_username,  'traded_away', 'market:' || l.id::text),
    (sa.artifact_id, sa.id, p_buyer_user_id,   p_buyer_username,   'traded_for',  'market:' || l.id::text),
    (ba.artifact_id, ba.id, p_buyer_user_id,   p_buyer_username,   'traded_away', 'market:' || l.id::text),
    (ba.artifact_id, ba.id, l.seller_user_id,  l.seller_username,  'traded_for',  'market:' || l.id::text);

  return jsonb_build_object(
    'listing_id', l.id,
    'received_artifact_id', sa.artifact_id,
    'received_instance_id', sa.id,
    'given_artifact_id', ba.artifact_id,
    'given_instance_id', ba.id
  );
end;
$$;

revoke all on function public.arcanum_artifact_swap(uuid, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.arcanum_artifact_swap(uuid, text, text, text, uuid) to service_role;
