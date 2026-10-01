-- Split the reused umbra-001 boss id into two real instances.
-- The first instance was defeated exactly at 250,000 total damage on 2026-09-30.
-- The boss HP was then reset without changing event_id; all attacks after the cutoff
-- belong to the current instance.

do $$
declare
  v_cutoff timestamptz := '2026-09-30 20:53:31.986228+00';
  v_new_id text := 'umbra-20261001-01';
  v_max_hp bigint := 250000;
  v_new_damage bigint := 0;
  v_new_hp bigint := 250000;
  v_new_status text := 'active';
  v_new_defeated_at timestamptz := null;
  v_old public.arcanum_world_boss_events%rowtype;
begin
  select * into v_old
  from public.arcanum_world_boss_events
  where event_id='umbra-001'
  for update;

  if not found then
    raise exception 'BOSS_EVENT_UMBRA_001_NOT_FOUND';
  end if;

  create temporary table if not exists tmp_arcanum_boss_participants_split
  on commit drop
  as
  select *
  from public.arcanum_world_boss_participants
  where event_id in ('umbra-001', v_new_id);

  insert into public.arcanum_world_boss_events(
    event_id,boss_name,max_hp,current_hp,status,starts_at,ends_at,defeated_at
  )
  values(
    v_new_id,
    v_old.boss_name,
    v_max_hp,
    v_max_hp,
    'active',
    '2026-10-01 00:00:00+00',
    v_old.ends_at,
    null
  )
  on conflict (event_id) do nothing;

  update public.arcanum_world_boss_attacks
  set event_id=v_new_id
  where event_id='umbra-001'
    and created_at > v_cutoff;

  select coalesce(sum(damage),0)
    into v_new_damage
  from public.arcanum_world_boss_attacks
  where event_id=v_new_id;

  v_new_hp := greatest(0, v_max_hp-v_new_damage);
  if v_new_hp=0 then
    v_new_status := 'defeated';
    select max(created_at) into v_new_defeated_at
    from public.arcanum_world_boss_attacks
    where event_id=v_new_id;
  end if;

  update public.arcanum_world_boss_events
  set current_hp=v_new_hp,
      status=v_new_status,
      defeated_at=v_new_defeated_at
  where event_id=v_new_id;

  update public.arcanum_world_boss_events
  set current_hp=0,
      status='defeated',
      defeated_at=v_cutoff,
      ends_at=v_cutoff
  where event_id='umbra-001';

  delete from public.arcanum_world_boss_participants
  where event_id in ('umbra-001',v_new_id);

  insert into public.arcanum_world_boss_participants(
    event_id,user_id,username,school_code,damage,attacks,last_attack_at,
    reward_tier,reward_fragments,reward_granted_at
  )
  select
    a.event_id,
    a.user_id,
    (array_agg(a.username order by a.created_at desc))[1],
    coalesce(
      (select t.school_code
       from tmp_arcanum_boss_participants_split t
       where t.user_id=a.user_id
       order by t.last_attack_at desc nulls last
       limit 1),
      'unknown'
    ),
    sum(a.damage)::bigint,
    count(*)::integer,
    max(a.created_at),
    case when a.event_id='umbra-001' then
      (select t.reward_tier
       from tmp_arcanum_boss_participants_split t
       where t.user_id=a.user_id and t.event_id='umbra-001'
       limit 1)
    else null end,
    case when a.event_id='umbra-001' then
      coalesce((select t.reward_fragments
       from tmp_arcanum_boss_participants_split t
       where t.user_id=a.user_id and t.event_id='umbra-001'
       limit 1),0)
    else 0 end,
    case when a.event_id='umbra-001' then
      (select t.reward_granted_at
       from tmp_arcanum_boss_participants_split t
       where t.user_id=a.user_id and t.event_id='umbra-001'
       limit 1)
    else null end
  from public.arcanum_world_boss_attacks a
  where a.event_id in ('umbra-001',v_new_id)
  group by a.event_id,a.user_id;

end $$;
