-- Realm ranking is deliberately separate from Net Power.
-- Net Power remains an internal estimate used by combat/targeting systems.
-- Realm Score measures broad strategic development for the Realm leaderboard.
--
-- Exploration is also reduced from 18-26 base land per turn to 4-8.
-- The existing diminishing factor toward 3500 land remains unchanged.

create or replace function public.realm_ranking()
returns table(
  player_id text,
  username text,
  school_code text,
  land integer,
  realm_score bigint
)
language sql
security definer
set search_path = ''
as $$
  with current_season as (
    select s.id
    from public.seasons s
    join public.rulesets rs on rs.id=s.ruleset_id
    where rs.is_active=true
      and s.status in ('setup','active','armageddon')
    order by s.created_at desc
    limit 1
  ),
  scores as (
    select
      r.player_id,
      r.mage_name,
      r.school_code,
      r.land,
      (
        r.land::bigint * 250
        + b.farms::bigint * 100
        + b.towns::bigint * 300
        + b.nodes::bigint * 300
        + b.workshops::bigint * 250
        + b.guilds::bigint * 300
        + b.barracks::bigint * 150
        + b.fortresses::bigint * 7500
        + b.barriers::bigint * 1000
        + coalesce((
            select sum(a.quantity::bigint * u.power_rank::bigint) * 5
            from public.realm_army a
            join public.unit_catalog u on u.id=a.unit_id
            where a.realm_id=r.id
          ),0)
        + r.spell_level::bigint * 1500
        + floor(r.mana::numeric / 100)::bigint
        + floor(r.population::numeric / 100)::bigint
        + floor(r.gold::numeric / 10000)::bigint
      )::bigint as realm_score
    from public.realms r
    join current_season cs on cs.id=r.season_id
    join public.realm_buildings b on b.realm_id=r.id
    left join private.npc_controllers n on n.realm_id=r.id
    left join public.astrael_agent_state ast
      on ast.singleton=true and lower(ast.username)=lower(r.mage_name)
    left join public.arcanum_system_accounts sys
      on sys.player_id=r.player_id and sys.excluded_from_rankings=true
    where r.status='alive'
      and n.realm_id is null
      and ast.username is null
      and sys.player_id is null
  )
  select
    player_id::text,
    mage_name,
    school_code,
    land,
    realm_score
  from scores
  order by realm_score desc, land desc, lower(mage_name);
$$;

revoke all on function public.realm_ranking() from public, anon;
grant execute on function public.realm_ranking() to authenticated;


create or replace function private.explore_impl(p_turns integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  r public.realms%rowtype;
  i integer;
  v_roll integer;
  v_gain integer;
  v_total_gain integer := 0;
  v_event_no bigint;
  v_factor numeric;
  v_rolls jsonb := '[]'::jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_turns is null or p_turns < 1 or p_turns > 50 then
    raise exception 'INVALID_TURN_COUNT';
  end if;

  perform * from private.sync_my_turns_impl();

  select rr.* into r
  from public.realms rr
  join public.seasons ss on ss.id=rr.season_id
  where rr.player_id=v_uid
    and ss.status in ('setup','active')
  order by ss.created_at desc
  limit 1
  for update of rr;

  if r.id is null then raise exception 'REALM_NOT_FOUND'; end if;
  if r.status <> 'alive' then raise exception 'MAGE_NOT_ALIVE'; end if;
  if r.pending_territory_damage > 0 then
    raise exception 'UNRESOLVED_TERRITORY_DAMAGE';
  end if;
  if r.turns < p_turns then raise exception 'NOT_ENOUGH_TURNS'; end if;

  select coalesce(max(id),0)+1
  into v_event_no
  from public.realm_events
  where realm_id=r.id;

  for i in 1..p_turns loop
    perform private.run_economy_impl('NONE',1);

    v_roll :=
      4 + (
        (
          (hashtextextended(r.id::text || ':' || v_event_no::text || ':' || i::text,0) % 5)
          + 5
        ) % 5
      )::integer;

    if r.land >= 3500 then
      v_gain := 0;
    else
      v_factor := greatest(
        0::numeric,
        least(
          1::numeric,
          (3500::numeric-r.land::numeric)/(3500::numeric-200::numeric)
        )
      );
      v_gain := floor(v_roll::numeric * v_factor)::integer;
    end if;

    update public.realms
    set land=land+v_gain,
        wilderness=wilderness+v_gain,
        updated_at=now()
    where id=r.id
    returning * into r;

    v_total_gain := v_total_gain + v_gain;
    v_rolls := v_rolls || jsonb_build_array(
      jsonb_build_object(
        'turn',i,
        'roll',v_roll,
        'land_gain',v_gain,
        'land_after',r.land
      )
    );
  end loop;

  insert into public.realm_events(
    realm_id,action_type,turns_spent,payload,result
  ) values (
    r.id,
    'EXPLORE',
    p_turns,
    jsonb_build_object('model','DIMINISHING_4_8_TO_ZERO_V2'),
    jsonb_build_object(
      'land_gained',v_total_gain,
      'land',r.land,
      'wilderness',r.wilderness,
      'turns_remaining',r.turns,
      'rolls',v_rolls
    )
  );

  return jsonb_build_object(
    'realm_id',r.id,
    'turns_spent',p_turns,
    'land_gained',v_total_gain,
    'land',r.land,
    'wilderness',r.wilderness,
    'turns_remaining',r.turns,
    'rolls',v_rolls
  );
end;
$$;
