-- Reincarnation roadmap phases 2b (damage protection) and 2c (meditation). See docs/REINCARNATION_ROADMAP.md.
--
--   * Damage protection: a realm that loses more than 30% of its army power as defender inside 24 h gets a
--     24 h shield. Shielded realms cannot be attacked, except by a realm they attacked in the last 24 h (counter).
--   * Meditation: opt-in, 3 days, the realm cannot attack or be attacked; 14 days cooldown counted from the start.
--     Turns keep accumulating (nothing here touches turn sync).
--
-- Server canonical. The shield table has RLS and no player grants. attack_mage_impl / attack_targets_impl are
-- patched in place and the migration aborts if the deployed text moved. Safe to run twice.

create table if not exists public.realm_shields (
  realm_id uuid primary key references public.realms(id) on delete cascade,
  damage_shield_started_at timestamptz,
  damage_shield_until timestamptz,
  meditation_until timestamptz,
  meditation_cooldown_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.realm_shields enable row level security;
revoke all on table public.realm_shields from public, anon, authenticated;
grant select, insert, update on table public.realm_shields to service_role;

-- 'meditation' | 'damage' | null
create or replace function private.realm_shield_state(p_realm uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when s.meditation_until > now() then 'meditation'
    when s.damage_shield_until > now() then 'damage'
    else null end
  from public.realm_shields s where s.realm_id = p_realm;
$$;

-- May p_attacker hit p_target right now? (counter attacks pierce the damage shield, never meditation)
create or replace function private.attack_shield_allows(p_attacker uuid, p_target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.realm_shield_state(p_attacker), '') <> 'meditation'
     and case coalesce(private.realm_shield_state(p_target), '')
           when 'meditation' then false
           when 'damage' then exists(
             select 1 from public.battle_reports b
             where b.attacker_realm_id = p_target and b.defender_realm_id = p_attacker
               and b.resolved_at > now() - interval '24 hours')
           else true end;
$$;

-- Called after a battle resolves: >30% army power lost as defender in the window opens a 24 h shield.
create or replace function private.apply_damage_protection(p_realm uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_from timestamptz;
  v_lost numeric;
  v_base numeric;
begin
  select greatest(now() - interval '24 hours', coalesce(s.damage_shield_started_at, '-infinity'))
  into v_from
  from (select 1) x left join public.realm_shields s on s.realm_id = p_realm;

  select coalesce(sum(greatest(0, b.defender_initial_np - b.defender_final_np)), 0),
         coalesce((array_agg(b.defender_initial_np order by b.resolved_at))[1], 0)
  into v_lost, v_base
  from public.battle_reports b
  where b.defender_realm_id = p_realm and b.status = 'resolved' and b.resolved_at > v_from;

  if v_base > 0 and v_lost * 100 > v_base * 30 then
    insert into public.realm_shields(realm_id, damage_shield_started_at, damage_shield_until)
    values (p_realm, now(), now() + interval '24 hours')
    on conflict (realm_id) do update
      set damage_shield_started_at = now(),
          damage_shield_until = now() + interval '24 hours',
          updated_at = now();
  end if;
end;
$$;

create or replace function private.my_realm_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.realms where player_id = auth.uid() order by created_at desc limit 1;
$$;

create or replace function public.my_shield_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_realm uuid := private.my_realm_id();
  s public.realm_shields%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if v_realm is null then raise exception 'REALM_NOT_FOUND'; end if;
  select * into s from public.realm_shields where realm_id = v_realm;
  return jsonb_build_object(
    'state', private.realm_shield_state(v_realm),
    'damage_shield_until', case when s.damage_shield_until > now() then s.damage_shield_until end,
    'meditation_until', case when s.meditation_until > now() then s.meditation_until end,
    'can_meditate', coalesce(s.meditation_cooldown_until, '-infinity') <= now()
                    and coalesce(s.meditation_until, '-infinity') <= now(),
    'meditation_available_at', case when s.meditation_cooldown_until > now() then s.meditation_cooldown_until end
  );
end;
$$;

create or replace function public.start_meditation()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_realm uuid := private.my_realm_id();
  s public.realm_shields%rowtype;
  v_until timestamptz := now() + interval '3 days';
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if v_realm is null then raise exception 'REALM_NOT_FOUND'; end if;
  perform 1 from public.realms where id = v_realm and status = 'alive' for update;
  if not found then raise exception 'MAGE_NOT_ALIVE'; end if;
  select * into s from public.realm_shields where realm_id = v_realm;
  if s.meditation_until > now() then raise exception 'ALREADY_MEDITATING'; end if;
  if s.meditation_cooldown_until > now() then raise exception 'MEDITATION_COOLDOWN'; end if;

  insert into public.realm_shields(realm_id, meditation_until, meditation_cooldown_until)
  values (v_realm, v_until, now() + interval '14 days')
  on conflict (realm_id) do update
    set meditation_until = v_until,
        meditation_cooldown_until = now() + interval '14 days',
        updated_at = now();
  return jsonb_build_object('meditation_until', v_until);
end;
$$;

revoke all on function public.my_shield_status() from public, anon;
revoke all on function public.start_meditation() from public, anon;
grant execute on function public.my_shield_status() to authenticated;
grant execute on function public.start_meditation() to authenticated;
revoke all on function private.realm_shield_state(uuid) from public, anon, authenticated;
revoke all on function private.attack_shield_allows(uuid, uuid) from public, anon, authenticated;
revoke all on function private.apply_damage_protection(uuid) from public, anon, authenticated;
revoke all on function private.my_realm_id() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Core patches (abort if the deployed text moved)
-- ---------------------------------------------------------------------------
do $m$
declare
  d text;
  a1 constant text := E'  if dr.status<>''alive'' then raise exception ''TARGET_NOT_ALIVE''; end if;\n';
  b1 constant text := E'  if dr.status<>''alive'' then raise exception ''TARGET_NOT_ALIVE''; end if;\n'
    || E'  if private.realm_shield_state(ar.id)=''meditation'' then raise exception ''ATTACKER_IN_MEDITATION''; end if;\n'
    || E'  if not private.attack_shield_allows(ar.id,dr.id) then\n'
    || E'    raise exception ''%'',case when private.realm_shield_state(dr.id)=''meditation'' then ''TARGET_IN_MEDITATION'' else ''TARGET_DAMAGE_PROTECTED'' end;\n'
    || E'  end if;\n';
  a2 constant text := E'  return jsonb_build_object(\n    ''battle_id'',v_report,\n    ''mode'',v_mode,';
  b2 constant text := E'  perform private.apply_damage_protection(dr.id);\n\n' || a2;
begin
  select pg_get_functiondef('private.attack_mage_impl(text,text)'::regprocedure) into d;
  if position('apply_damage_protection' in d) > 0 then null; -- already applied
  else
    if position(a1 in d) = 0 or position(a2 in d) = 0 then
      raise exception 'private.attack_mage_impl text moved; not patching';
    end if;
    execute replace(replace(d, a1, b1), a2, b2);
  end if;

  select pg_get_functiondef('private.attack_targets_impl(integer)'::regprocedure) into d;
  if position('attack_shield_allows' in d) > 0 then return; end if;
  if position(E'      and r.id<>v_realm\n' in d) = 0 then
    raise exception 'private.attack_targets_impl text moved; not patching';
  end if;
  execute replace(d, E'      and r.id<>v_realm\n',
                     E'      and r.id<>v_realm\n      and private.attack_shield_allows(v_realm,r.id)\n');
end
$m$;
