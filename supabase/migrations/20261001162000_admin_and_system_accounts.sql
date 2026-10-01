-- Separate real admin authorization from game accounts and quarantine
-- the legacy player named "admin" from competitive rankings.

create table if not exists public.arcanum_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner','admin','moderator')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.arcanum_admin_users enable row level security;
revoke all on table public.arcanum_admin_users from public, anon, authenticated;
grant select, insert, update, delete on table public.arcanum_admin_users to service_role;

insert into public.arcanum_admin_users(user_id,role,active)
values ('4fa0b39b-620a-409a-9fda-0eb65bcb332f'::uuid,'owner',true)
on conflict (user_id) do update
set role=excluded.role,active=true,updated_at=now();

create table if not exists public.arcanum_system_accounts (
  player_id uuid primary key references public.players(id) on delete cascade,
  label text not null,
  excluded_from_rankings boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.arcanum_system_accounts enable row level security;
revoke all on table public.arcanum_system_accounts from public, anon, authenticated;
grant select, insert, update, delete on table public.arcanum_system_accounts to service_role;

insert into public.arcanum_system_accounts(player_id,label,excluded_from_rankings)
values ('ebd76d03-1687-4ddb-9d61-1ec0389d129a'::uuid,'legacy-admin',true)
on conflict (player_id) do update
set label=excluded.label,excluded_from_rankings=true;

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
    left join public.arcanum_system_accounts sys
      on sys.player_id=r.player_id and sys.excluded_from_rankings=true
    where sys.player_id is null
  )
  select
    row_number() over(order by np desc,land desc,lower(mage_name)) as rank,
    mage_name,school_code,land,np,status
  from scores
  order by rank
  limit greatest(1,least(coalesce(p_limit,100),250));
$$;

create or replace function public.arena_pvp_ranking()
returns table(player_id text, username text, school_code text, rating integer, wins integer, losses integer, games integer, win_rate numeric)
language sql
security definer
set search_path = 'public','private'
as $$
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
  left join public.arcanum_system_accounts sys
    on sys.player_id=r.player_id and sys.excluded_from_rankings=true
  where r.status='alive'
    and n.realm_id is null
    and a.username is null
    and sys.player_id is null
  order by coalesce(s.rating,1000) desc,coalesce(s.wins,0) desc,coalesce(s.losses,0) asc,r.mage_name asc;
$$;
