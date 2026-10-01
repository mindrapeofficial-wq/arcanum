-- Correct the realm leaderboard after system-account exclusion:
-- NPC realms, Astrael and system accounts must all stay out of human competition.

create or replace function private.leaderboard_impl(p_limit integer)
returns table(rank bigint, mage_name text, school_code text, land integer, net_power bigint, status text)
language sql
security definer
set search_path = ''
as $$
  with current_season as (
    select s.id
    from public.seasons s
    join public.rulesets rs on rs.id=s.ruleset_id
    where rs.is_active=true and s.status in ('setup','active','armageddon')
    order by s.created_at desc
    limit 1
  ),
  scores as (
    select
      r.mage_name,
      r.school_code,
      r.land,
      private.calculate_realm_net_power(r.id) as np,
      r.status
    from public.realms r
    join current_season cs on cs.id=r.season_id
    left join private.npc_controllers n on n.realm_id=r.id
    left join public.astrael_agent_state a
      on a.singleton=true and lower(a.username)=lower(r.mage_name)
    left join public.arcanum_system_accounts sys
      on sys.player_id=r.player_id and sys.excluded_from_rankings=true
    where n.realm_id is null
      and a.username is null
      and sys.player_id is null
  )
  select
    row_number() over(order by np desc,land desc,lower(mage_name)) as rank,
    mage_name,school_code,land,np,status
  from scores
  order by rank
  limit greatest(1,least(coalesce(p_limit,100),250));
$$;
