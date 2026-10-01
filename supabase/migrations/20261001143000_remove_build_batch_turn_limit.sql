-- Remove the historical 50-turn cap for construction batches.
-- Construction is now limited only by available turns, wilderness, and existing validation rules.

create or replace function private.build_impl(p_plan jsonb)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := auth.uid();
  r public.realms%rowtype;
  b public.realm_buildings%rowtype;

  q_farms integer := coalesce((p_plan->>'farms')::integer,0);
  q_towns integer := coalesce((p_plan->>'towns')::integer,0);
  q_nodes integer := coalesce((p_plan->>'nodes')::integer,0);
  q_workshops integer := coalesce((p_plan->>'workshops')::integer,0);
  q_guilds integer := coalesce((p_plan->>'guilds')::integer,0);
  q_barracks integer := coalesce((p_plan->>'barracks')::integer,0);
  q_fortresses integer := coalesce((p_plan->>'fortresses')::integer,0);
  q_barriers integer := coalesce((p_plan->>'barriers')::integer,0);

  v_total_buildings integer;
  v_normal_buildings integer;
  v_capacity_cost integer;
  v_capacity_per_turn integer;
  v_turns_required integer;
  v_unknown jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_plan is null or jsonb_typeof(p_plan) <> 'object' then
    raise exception 'INVALID_BUILD_PLAN';
  end if;

  v_unknown :=
    p_plan
      - 'farms' - 'towns' - 'nodes' - 'workshops'
      - 'guilds' - 'barracks' - 'fortresses' - 'barriers';

  if v_unknown <> '{}'::jsonb then
    raise exception 'UNKNOWN_BUILDING';
  end if;

  if least(
    q_farms,q_towns,q_nodes,q_workshops,
    q_guilds,q_barracks,q_fortresses,q_barriers
  ) < 0 then
    raise exception 'INVALID_BUILD_QUANTITY';
  end if;

  v_total_buildings :=
    q_farms+q_towns+q_nodes+q_workshops+
    q_guilds+q_barracks+q_fortresses+q_barriers;

  if v_total_buildings < 1 then raise exception 'EMPTY_BUILD_PLAN'; end if;

  v_normal_buildings := v_total_buildings-q_barriers;
  if q_barriers > 0 and v_normal_buildings > 0 then
    raise exception 'BARRIERS_REQUIRE_EXCLUSIVE_BUILD';
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

  select * into b
  from public.realm_buildings
  where realm_id=r.id
  for update;

  if r.wilderness < v_total_buildings then
    raise exception 'NOT_ENOUGH_WILDERNESS';
  end if;

  if q_barriers > 0 then
    v_turns_required := q_barriers;
  else
    v_capacity_per_turn := b.workshops + 1;
    v_capacity_cost :=
        q_farms*5
      + q_barracks*5
      + q_workshops*10
      + q_guilds*20
      + q_towns*30
      + q_nodes*30
      + q_fortresses*300;

    v_turns_required :=
      (v_capacity_cost + v_capacity_per_turn - 1) / v_capacity_per_turn;
  end if;

  if v_turns_required < 1 then raise exception 'INVALID_BUILD_COST'; end if;
  if r.turns < v_turns_required then raise exception 'NOT_ENOUGH_TURNS'; end if;

  perform private.run_economy_impl('NONE',v_turns_required);

  update public.realm_buildings
  set farms=farms+q_farms,
      towns=towns+q_towns,
      nodes=nodes+q_nodes,
      workshops=workshops+q_workshops,
      guilds=guilds+q_guilds,
      barracks=barracks+q_barracks,
      fortresses=fortresses+q_fortresses,
      barriers=barriers+q_barriers,
      updated_at=now()
  where realm_id=r.id
  returning * into b;

  update public.realms
  set wilderness=wilderness-v_total_buildings,
      updated_at=now()
  where id=r.id
  returning * into r;

  insert into public.realm_events(
    realm_id,action_type,turns_spent,payload,result
  ) values (
    r.id,
    'BUILD',
    v_turns_required,
    p_plan,
    jsonb_build_object(
      'workshops_at_start',b.workshops-q_workshops,
      'capacity_per_turn',
        case when q_barriers>0 then null else (b.workshops-q_workshops)+1 end,
      'wilderness_after',r.wilderness,
      'buildings',jsonb_build_object(
        'farms',b.farms,
        'towns',b.towns,
        'nodes',b.nodes,
        'workshops',b.workshops,
        'guilds',b.guilds,
        'barracks',b.barracks,
        'fortresses',b.fortresses,
        'barriers',b.barriers
      )
    )
  );

  return jsonb_build_object(
    'realm_id',r.id,
    'turns_spent',v_turns_required,
    'turns_remaining',r.turns,
    'wilderness',r.wilderness,
    'built',p_plan,
    'buildings',jsonb_build_object(
      'farms',b.farms,
      'towns',b.towns,
      'nodes',b.nodes,
      'workshops',b.workshops,
      'guilds',b.guilds,
      'barracks',b.barracks,
      'fortresses',b.fortresses,
      'barriers',b.barriers
    )
  );
end;
$function$;
