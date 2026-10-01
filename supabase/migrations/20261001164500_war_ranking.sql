-- Canonical war ranking for human realms.
-- Rankings are intentionally separated: Realm, War, Arena.

create or replace function public.war_ranking()
returns table(
  player_id text,
  username text,
  school_code text,
  battles integer,
  wins integer,
  losses integer,
  land_won integer,
  land_lost integer,
  net_land integer
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
  human_realms as (
    select r.id,r.player_id,r.mage_name,r.school_code
    from public.realms r
    join current_season cs on cs.id=r.season_id
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
    h.player_id::text,
    h.mage_name,
    h.school_code,
    count(br.id) filter(where br.status='resolved')::integer as battles,
    count(br.id) filter(
      where br.status='resolved'
        and (
          (br.attacker_realm_id=h.id and br.attacker_victory)
          or (br.defender_realm_id=h.id and not br.attacker_victory)
        )
    )::integer as wins,
    count(br.id) filter(
      where br.status='resolved'
        and (
          (br.attacker_realm_id=h.id and not br.attacker_victory)
          or (br.defender_realm_id=h.id and br.attacker_victory)
        )
    )::integer as losses,
    coalesce(sum(
      case when br.status='resolved' and br.attacker_realm_id=h.id
        then br.land_gained else 0 end
    ),0)::integer as land_won,
    coalesce(sum(
      case when br.status='resolved' and br.defender_realm_id=h.id
        then br.land_lost else 0 end
    ),0)::integer as land_lost,
    (
      coalesce(sum(
        case when br.status='resolved' and br.attacker_realm_id=h.id
          then br.land_gained else 0 end
      ),0)
      -
      coalesce(sum(
        case when br.status='resolved' and br.defender_realm_id=h.id
          then br.land_lost else 0 end
      ),0)
    )::integer as net_land
  from human_realms h
  left join public.battle_reports br
    on br.attacker_realm_id=h.id or br.defender_realm_id=h.id
  group by h.id,h.player_id,h.mage_name,h.school_code
  order by
    wins desc,
    net_land desc,
    losses asc,
    battles desc,
    lower(h.mage_name);
$$;

revoke all on function public.war_ranking() from public, anon;
grant execute on function public.war_ranking() to authenticated;
