-- Mana crisis (feature-flagged OFF) and visible supporter badge.
--
-- 1. MANA CRISIS. Inspired by The Reincarnation: when army mana upkeep cannot be paid the game removes
--    a WHOLE unit stack ("Insufficient Mana: Lost 347 Unicorns!") and the net flow recovers.
--    In the observed case the stack lost was the one with the largest TOTAL mana drain
--    (347 x 0.8 = 278 mana) and not the one with the largest per-unit upkeep (38 x 5.5 = 209).
--    Arcanum rule: stacks with mana upkeep are removed largest total drain first until the unpaid mana is covered.
--    Until now Core only recorded MANA_SHORTFALL as DEFERRED. The rule is controlled by
--    rulesets.config->>'mana_crisis' ('on' / 'off'); this migration leaves it OFF, so it changes no behaviour
--    until the owner switches it on:
--        update public.rulesets set config = jsonb_set(config, '{mana_crisis}', '"on"') where is_active;
--
-- 2. SUPPORTER BADGE. Other players can see who supports the project through a read RPC for a list of mage
--    names. Supporters can hide their own badge. Existing ranking/profile functions are not touched.

-- ---------------------------------------------------------------------------
-- 1. Mana crisis
-- ---------------------------------------------------------------------------
create or replace function private.mana_crisis_candidates(p_realm_id uuid)
returns table (unit_id text, name_es text, quantity bigint, upkeep_mana numeric, stack_upkeep numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select a.unit_id::text, u.name_es::text, a.quantity::bigint, u.upkeep_mana::numeric,
         (a.quantity::numeric * u.upkeep_mana::numeric) as stack_upkeep
  from public.realm_army a
  join public.unit_catalog u on u.id = a.unit_id
  where a.realm_id = p_realm_id and a.quantity > 0 and u.upkeep_mana > 0
  order by (a.quantity::numeric * u.upkeep_mana::numeric) desc, u.upkeep_mana desc, a.unit_id;
$$;

create or replace function private.resolve_mana_crisis(p_realm_id uuid, p_deficit bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec record;
  v_total numeric := 0;
  v_removed jsonb := '[]'::jsonb;
begin
  for rec in select * from private.mana_crisis_candidates(p_realm_id) loop
    exit when v_total >= p_deficit;
    update public.realm_army set quantity = 0, updated_at = now()
    where realm_id = p_realm_id and unit_id = rec.unit_id;
    v_total := v_total + rec.stack_upkeep;
    v_removed := v_removed || jsonb_build_array(jsonb_build_object(
      'unit_id', rec.unit_id, 'name_es', rec.name_es, 'quantity', rec.quantity, 'mana_upkeep', ceil(rec.stack_upkeep)
    ));
  end loop;
  return jsonb_build_object('removed', v_removed, 'upkeep_removed', ceil(v_total));
end;
$$;

-- Recent crises of the caller (last 48 h, newest first, max 5), so the client can tell the player what was lost.
create or replace function public.my_recent_mana_crisis()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_realm uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select r.id into v_realm
  from public.realms r
  join public.seasons s on s.id = r.season_id
  where r.player_id = v_uid and s.status in ('setup','active')
  order by s.created_at desc limit 1;
  if v_realm is null then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', e.id, 'at', e.created_at, 'unpaid_mana', e.payload->'unpaid_mana', 'removed', e.result->'removed'
    ) order by e.id desc)
    from (
      select * from public.realm_events
      where realm_id = v_realm and action_type = 'MANA_CRISIS' and created_at > now() - interval '48 hours'
      order by id desc limit 5
    ) e
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.my_recent_mana_crisis() from public, anon;
grant execute on function public.my_recent_mana_crisis() to authenticated;

revoke all on function private.mana_crisis_candidates(uuid) from public, anon, authenticated;
revoke all on function private.resolve_mana_crisis(uuid, bigint) from public, anon, authenticated;

-- Read-only preview for the player: is the rule on, and which stacks would go first.
create or replace function public.mana_crisis_preview()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_realm uuid;
  v_mana bigint;
  v_enabled boolean;
  v_upkeep numeric;
  v_list jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  select r.id, r.mana, coalesce(rs.config->>'mana_crisis', 'off') = 'on'
  into v_realm, v_mana, v_enabled
  from public.realms r
  join public.seasons s on s.id = r.season_id
  join public.rulesets rs on rs.id = s.ruleset_id
  where r.player_id = v_uid and s.status in ('setup','active')
  order by s.created_at desc limit 1;

  if v_realm is null then raise exception 'REALM_NOT_FOUND'; end if;

  select coalesce(sum(c.stack_upkeep), 0),
         coalesce(jsonb_agg(jsonb_build_object(
           'unit_id', c.unit_id, 'name_es', c.name_es, 'quantity', c.quantity,
           'mana_upkeep', ceil(c.stack_upkeep)) order by c.stack_upkeep desc), '[]'::jsonb)
  into v_upkeep, v_list
  from private.mana_crisis_candidates(v_realm) c;

  return jsonb_build_object(
    'enabled', v_enabled,
    'mana', v_mana,
    'army_mana_upkeep', ceil(v_upkeep),
    'would_lose_first', v_list
  );
end;
$$;

revoke all on function public.mana_crisis_preview() from public, anon;
grant execute on function public.mana_crisis_preview() to authenticated;

-- Patch run_economy_impl in place; abort without changes if the deployed text moved.
do $migration$
declare
  v_def text;
  v_anchor_decl constant text := E'\n  x integer;\n';
  v_anchor_total constant text := E'\n    total_gold_upkeep := fortupkeep+army_gold_upkeep;\n';
  v_anchor_cris constant text := E'\n    cris := ''[]''::jsonb;\n';
  v_anchor_ret constant text := '''army_population_upkeep'',army_population_upkeep';
begin
  select pg_get_functiondef(p.oid) into v_def
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'private' and p.proname = 'run_economy_impl' and p.prokind = 'f'
  limit 1;

  if v_def is null then raise exception 'run_economy_impl not found'; end if;

  if position('resolve_mana_crisis' in v_def) = 0 then
    if (length(v_def) - length(replace(v_def, v_anchor_decl, ''))) / length(v_anchor_decl) <> 1
       or (length(v_def) - length(replace(v_def, v_anchor_total, ''))) / length(v_anchor_total) <> 1
       or (length(v_def) - length(replace(v_def, v_anchor_cris, ''))) / length(v_anchor_cris) <> 1
       or (length(v_def) - length(replace(v_def, v_anchor_ret, ''))) / length(v_anchor_ret) <> 1 then
      raise exception 'run_economy_impl anchors not found exactly once; not patching';
    end if;

    v_def := replace(v_def, v_anchor_decl, E'\n  x integer;\n  v_crisis jsonb;\n  v_crisis_log jsonb := ''[]''::jsonb;\n  v_deficit bigint;\n');

    v_def := replace(v_def, v_anchor_total, $r$
    v_deficit := army_mana_upkeep - least(manacap, greatest(0::bigint, r.mana+grossmana+activemana));
    if v_deficit > 0 and coalesce(rs.config->>'mana_crisis', 'off') = 'on' then
      v_crisis := private.resolve_mana_crisis(r.id, v_deficit);
      select
        coalesce(ceil(sum(a.quantity::numeric*u.upkeep_gold)),0)::bigint,
        coalesce(ceil(sum(a.quantity::numeric*u.upkeep_mana)),0)::bigint,
        coalesce(ceil(sum(a.quantity::numeric*u.upkeep_population)),0)::bigint
      into army_gold_upkeep,army_mana_upkeep,army_population_upkeep
      from public.realm_army a
      join public.unit_catalog u on u.id=a.unit_id
      where a.realm_id=r.id and a.quantity>0;
      v_crisis_log := v_crisis_log || coalesce(v_crisis->'removed','[]'::jsonb);
    end if;
    total_gold_upkeep := fortupkeep+army_gold_upkeep;
$r$);

    v_def := replace(v_def, v_anchor_cris, $r$
    cris := case when v_crisis is not null
      then jsonb_build_array(jsonb_build_object('type','MANA_CRISIS','removed',v_crisis->'removed','resolution','STACKS_LOST'))
      else '[]'::jsonb end;
    if v_crisis is not null then
      insert into public.realm_events(realm_id,action_type,turns_spent,payload,result)
      values (r.id,'MANA_CRISIS',0,
        jsonb_build_object('unpaid_mana',v_deficit),
        jsonb_build_object('removed',v_crisis->'removed'));
      v_crisis := null;
    end if;
$r$);

    v_def := replace(v_def, v_anchor_ret, $r$'army_population_upkeep',army_population_upkeep,
    'mana_crisis',v_crisis_log$r$);

    execute v_def;
  end if;
end
$migration$;

-- ---------------------------------------------------------------------------
-- 2. Supporter badge
-- ---------------------------------------------------------------------------
alter table public.arcanum_supporters add column if not exists badge_hidden boolean not null default false;

create or replace function public.my_supporter_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.arcanum_supporters%rowtype;
  v_tier text;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_row from public.arcanum_supporters where user_id = v_uid;
  v_tier := private.supporter_tier(v_row.credit_points);
  return jsonb_build_object(
    'supporter', v_tier is not null,
    'tier', v_tier,
    'credit_points', coalesce(v_row.credit_points, 0),
    'since', v_row.since,
    'badge_visible', v_tier is not null and not coalesce(v_row.badge_hidden, false),
    'perks', case when v_tier is null then '[]'::jsonb
                  else jsonb_build_array('badge', 'notes', 'discord_role') end
  );
end;
$$;

create or replace function public.set_supporter_badge_visible(p_visible boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_points integer;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select credit_points into v_points from public.arcanum_supporters where user_id = v_uid;
  if private.supporter_tier(v_points) is null then raise exception 'SUPPORTER_REQUIRED'; end if;
  update public.arcanum_supporters set badge_hidden = not coalesce(p_visible, true), updated_at = now()
  where user_id = v_uid;
  return jsonb_build_object('badge_visible', coalesce(p_visible, true));
end;
$$;

-- Returns {"<lowercase mage name>": "supporter"|"patron"} for the supporters among the given names
-- who keep their badge visible. At most 200 names per call.
create or replace function public.supporters_among(p_names text[])
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_names is null or cardinality(p_names) = 0 then return '{}'::jsonb; end if;
  if cardinality(p_names) > 200 then raise exception 'TOO_MANY_NAMES'; end if;

  select coalesce(jsonb_object_agg(lower(x.mage_name), x.tier), '{}'::jsonb)
  into v_result
  from (
    select distinct on (lower(r.mage_name)) r.mage_name, private.supporter_tier(sp.credit_points) as tier
    from public.realms r
    join public.seasons s on s.id = r.season_id and s.status in ('setup','active')
    join public.arcanum_supporters sp on sp.user_id = r.player_id
    where lower(r.mage_name) = any (select lower(n) from unnest(p_names) n)
      and not sp.badge_hidden
      and private.supporter_tier(sp.credit_points) is not null
    order by lower(r.mage_name), s.created_at desc
  ) x;

  return v_result;
end;
$$;

revoke all on function public.my_supporter_status() from public, anon;
revoke all on function public.set_supporter_badge_visible(boolean) from public, anon;
revoke all on function public.supporters_among(text[]) from public, anon;
grant execute on function public.my_supporter_status() to authenticated;
grant execute on function public.set_supporter_badge_visible(boolean) to authenticated;
grant execute on function public.supporters_among(text[]) to authenticated;
