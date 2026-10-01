-- PvP ladder: make ranked duels two-sided and expose a service-role-only ranking.
-- Backfill defender records from already stored ranked matches exactly once by using defender_user_id as the marker.

do $m$
declare
  v_day date := (now() at time zone 'Europe/Madrid')::date;
begin
  insert into public.arcanum_arena_state(user_id,username,rating,wins,losses,seal_day,seals_remaining)
  select distinct r.player_id::text,r.mage_name,1000,0,0,v_day,6
  from public.arcanum_arena_matches m
  join public.realms r on lower(r.mage_name)=lower(m.defender_username)
  where m.mode='ranked' and m.defender_user_id is null
  on conflict (user_id) do nothing;

  with agg as (
    select r.player_id::text as user_id,
           coalesce(sum(m.rating_delta),0)::integer as attacker_delta_sum,
           count(*) filter (where not m.attacker_won)::integer as defender_wins,
           count(*) filter (where m.attacker_won)::integer as defender_losses
    from public.arcanum_arena_matches m
    join public.realms r on lower(r.mage_name)=lower(m.defender_username)
    where m.mode='ranked' and m.defender_user_id is null
    group by r.player_id
  )
  update public.arcanum_arena_state s
  set rating=greatest(100,s.rating-a.attacker_delta_sum),
      wins=s.wins+a.defender_wins,
      losses=s.losses+a.defender_losses,
      updated_at=now()
  from agg a
  where s.user_id=a.user_id;

  update public.arcanum_arena_matches m
  set defender_user_id=r.player_id::text
  from public.realms r
  where m.mode='ranked'
    and m.defender_user_id is null
    and lower(r.mage_name)=lower(m.defender_username);
end
$m$;

create or replace function public.arena_pvp_ranking()
returns table(
  player_id text,
  username text,
  school_code text,
  rating integer,
  wins integer,
  losses integer,
  games integer,
  win_rate numeric
)
language sql
security definer
set search_path = public, private
as $fn$
  select
    r.player_id::text,
    r.mage_name,
    r.school_code,
    coalesce(s.rating,1000)::integer,
    coalesce(s.wins,0)::integer,
    coalesce(s.losses,0)::integer,
    (coalesce(s.wins,0)+coalesce(s.losses,0))::integer,
    case
      when coalesce(s.wins,0)+coalesce(s.losses,0)=0 then 0::numeric
      else round((coalesce(s.wins,0)::numeric*100)/(s.wins+s.losses),1)
    end
  from public.realms r
  left join public.arcanum_arena_state s on s.user_id=r.player_id::text
  left join private.npc_controllers n on n.realm_id=r.id
  left join public.astrael_agent_state a
    on a.singleton=true and lower(a.username)=lower(r.mage_name)
  where r.status='alive'
    and n.realm_id is null
    and a.username is null
  order by coalesce(s.rating,1000) desc,coalesce(s.wins,0) desc,coalesce(s.losses,0) asc,r.mage_name asc;
$fn$;

revoke all on function public.arena_pvp_ranking() from public,anon,authenticated;
grant execute on function public.arena_pvp_ranking() to service_role;
