-- Lady Luck, Supporting status and Discord linking.
--
-- Inspired by The Reincarnation (Guildwar):
--   * Lady Luck's favour lasts 24 hours and does not stack. Here it is granted by a once-a-day
--     Discord command (guaranteed), and the table also accepts 'vote', 'event' and 'admin' sources.
--   * Effects implemented in the Core: +5 points of summoning success and +10% land per exploration turn.
--   * Supporting status is derived from credit points granted by admins after a donation.
--     It is convenience/identity only (badge, private notes, Discord role); it never sells power.
--
-- Everything here is server canonical. Players only get read RPCs for their own state plus the
-- link-code flow. Granting luck, redeeming Discord links and granting credit are service-role only.

-- ---------------------------------------------------------------------------
-- 1. Lady Luck
-- ---------------------------------------------------------------------------
create table if not exists public.arcanum_luck (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  source text not null default 'discord' check (source in ('discord','vote','event','admin')),
  updated_at timestamptz not null default now()
);

create table if not exists public.arcanum_luck_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists arcanum_luck_log_user_idx on public.arcanum_luck_log(user_id, granted_at desc);

alter table public.arcanum_luck enable row level security;
alter table public.arcanum_luck_log enable row level security;
revoke all on table public.arcanum_luck from public, anon, authenticated;
revoke all on table public.arcanum_luck_log from public, anon, authenticated;
grant select, insert, update on table public.arcanum_luck to service_role;
grant select, insert on table public.arcanum_luck_log to service_role;

create or replace function private.luck_active(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.arcanum_luck l
    where l.user_id = p_user_id and l.expires_at > now()
  );
$$;

create or replace function private.grant_luck_impl(p_user_id uuid, p_source text, p_hours integer default 24)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hours integer := greatest(1, least(72, coalesce(p_hours, 24)));
  v_exp timestamptz := now() + make_interval(hours => v_hours);
  v_result timestamptz;
begin
  if p_user_id is null then raise exception 'INVALID_USER'; end if;
  if p_source not in ('discord','vote','event','admin') then raise exception 'INVALID_LUCK_SOURCE'; end if;

  -- Effects do not stack: a new grant only ever extends the current expiry up to now()+hours.
  insert into public.arcanum_luck(user_id, expires_at, source)
  values (p_user_id, v_exp, p_source)
  on conflict (user_id) do update
    set expires_at = greatest(public.arcanum_luck.expires_at, excluded.expires_at),
        source = excluded.source,
        updated_at = now()
  returning expires_at into v_result;

  insert into public.arcanum_luck_log(user_id, source, expires_at)
  values (p_user_id, p_source, v_result);

  return v_result;
end;
$$;

create or replace function public.my_luck_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.arcanum_luck%rowtype;
  v_active boolean;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_row from public.arcanum_luck where user_id = v_uid;
  v_active := v_row.user_id is not null and v_row.expires_at > now();
  return jsonb_build_object(
    'active', v_active,
    'expires_at', case when v_active then v_row.expires_at else null end,
    'seconds_left', case when v_active then greatest(0, floor(extract(epoch from (v_row.expires_at - now())))::integer) else 0 end,
    'source', case when v_active then v_row.source else null end,
    'bonuses', case when v_active
      then jsonb_build_object('summon_success_points', 5, 'explore_land_percent', 10)
      else '{}'::jsonb end
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Discord linking
-- ---------------------------------------------------------------------------
create table if not exists public.arcanum_discord_links (
  discord_id text primary key check (discord_id ~ '^[0-9]{5,25}$'),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  discord_name text check (discord_name is null or char_length(discord_name) <= 80),
  linked_at timestamptz not null default now(),
  last_luck_day date
);

create table if not exists public.arcanum_discord_link_codes (
  code text primary key check (code ~ '^[A-Z0-9]{8}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists arcanum_discord_link_codes_user_idx on public.arcanum_discord_link_codes(user_id, created_at desc);

alter table public.arcanum_discord_links enable row level security;
alter table public.arcanum_discord_link_codes enable row level security;
revoke all on table public.arcanum_discord_links from public, anon, authenticated;
revoke all on table public.arcanum_discord_link_codes from public, anon, authenticated;
grant select, insert, update, delete on table public.arcanum_discord_links to service_role;
grant select, insert, update, delete on table public.arcanum_discord_link_codes to service_role;

-- A player asks for a short-lived code in the game and types /vincular <code> in Discord.
create or replace function public.create_discord_link_code()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_exp timestamptz := now() + interval '15 minutes';
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if exists(select 1 from public.arcanum_discord_links where user_id = v_uid) then
    raise exception 'ALREADY_LINKED';
  end if;
  if exists(
    select 1 from public.arcanum_discord_link_codes
    where user_id = v_uid and created_at > now() - interval '10 seconds'
  ) then raise exception 'RATE_LIMIT'; end if;

  delete from public.arcanum_discord_link_codes where user_id = v_uid or expires_at < now();

  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into public.arcanum_discord_link_codes(code, user_id, expires_at) values (v_code, v_uid, v_exp);
  return jsonb_build_object('code', v_code, 'expires_at', v_exp);
end;
$$;

create or replace function public.my_discord_link()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.arcanum_discord_links%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_row from public.arcanum_discord_links where user_id = v_uid;
  return jsonb_build_object(
    'linked', v_row.user_id is not null,
    'discord_name', v_row.discord_name,
    'linked_at', v_row.linked_at
  );
end;
$$;

create or replace function public.unlink_discord()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  delete from public.arcanum_discord_links where user_id = v_uid;
  delete from public.arcanum_discord_link_codes where user_id = v_uid;
  return jsonb_build_object('linked', false);
end;
$$;

-- Service role only: called by the arcanum-discord Edge Function after verifying Discord's signature.
create or replace function public.redeem_discord_link(p_code text, p_discord_id text, p_discord_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code public.arcanum_discord_link_codes%rowtype;
  v_mage text;
begin
  if p_discord_id is null or p_discord_id !~ '^[0-9]{5,25}$' then raise exception 'INVALID_DISCORD_ID'; end if;

  select * into v_code
  from public.arcanum_discord_link_codes
  where code = upper(btrim(coalesce(p_code, ''))) and expires_at > now()
  for update;
  if v_code.code is null then raise exception 'INVALID_OR_EXPIRED_CODE'; end if;

  if exists(select 1 from public.arcanum_discord_links where discord_id = p_discord_id) then
    raise exception 'DISCORD_ALREADY_LINKED';
  end if;
  if exists(select 1 from public.arcanum_discord_links where user_id = v_code.user_id) then
    raise exception 'USER_ALREADY_LINKED';
  end if;

  insert into public.arcanum_discord_links(discord_id, user_id, discord_name)
  values (p_discord_id, v_code.user_id, left(nullif(btrim(p_discord_name), ''), 80));
  delete from public.arcanum_discord_link_codes where code = v_code.code;

  select r.mage_name into v_mage
  from public.realms r
  join public.seasons s on s.id = r.season_id
  where r.player_id = v_code.user_id and s.status in ('setup','active')
  order by s.created_at desc limit 1;

  return jsonb_build_object('linked', true, 'mage_name', v_mage);
end;
$$;

-- Daily guaranteed luck (Madrid day boundary, like the Arena daily reset).
create or replace function public.discord_claim_luck(p_discord_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link public.arcanum_discord_links%rowtype;
  v_today date := (now() at time zone 'Europe/Madrid')::date;
  v_next timestamptz;
  v_exp timestamptz;
begin
  select * into v_link from public.arcanum_discord_links where discord_id = p_discord_id for update;
  if v_link.discord_id is null then raise exception 'NOT_LINKED'; end if;

  if v_link.last_luck_day is not null and v_link.last_luck_day >= v_today then
    v_next := ((v_today + 1)::timestamp at time zone 'Europe/Madrid');
    return jsonb_build_object('granted', false, 'reason', 'ALREADY_CLAIMED_TODAY', 'next_at', v_next);
  end if;

  v_exp := private.grant_luck_impl(v_link.user_id, 'discord', 24);
  update public.arcanum_discord_links set last_luck_day = v_today where discord_id = p_discord_id;
  return jsonb_build_object('granted', true, 'expires_at', v_exp);
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Supporting status (convenience and identity, never power)
-- ---------------------------------------------------------------------------
create table if not exists public.arcanum_supporters (
  user_id uuid primary key references auth.users(id) on delete cascade,
  credit_points integer not null default 0 check (credit_points >= 0),
  since timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.arcanum_supporter_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason text check (reason is null or char_length(reason) <= 200),
  granted_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists arcanum_supporter_ledger_user_idx on public.arcanum_supporter_ledger(user_id, created_at desc);

create table if not exists public.arcanum_player_notes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 4000),
  updated_at timestamptz not null default now()
);

alter table public.arcanum_supporters enable row level security;
alter table public.arcanum_supporter_ledger enable row level security;
alter table public.arcanum_player_notes enable row level security;
revoke all on table public.arcanum_supporters from public, anon, authenticated;
revoke all on table public.arcanum_supporter_ledger from public, anon, authenticated;
revoke all on table public.arcanum_player_notes from public, anon, authenticated;
grant select, insert, update on table public.arcanum_supporters to service_role;
grant select, insert on table public.arcanum_supporter_ledger to service_role;
grant select, insert, update on table public.arcanum_player_notes to service_role;

-- Tiers: 2 credit points = supporter (the same threshold Reincarnation uses for a supporting mage),
-- 15 credit points = patron (its supporting-guild threshold).
create or replace function private.supporter_tier(p_points integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when coalesce(p_points, 0) >= 15 then 'patron'
    when coalesce(p_points, 0) >= 2 then 'supporter'
    else null
  end;
$$;

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
    'perks', case when v_tier is null then '[]'::jsonb
                  else jsonb_build_array('badge', 'notes', 'discord_role') end
  );
end;
$$;

create or replace function public.get_my_notes()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_points integer;
  v_row public.arcanum_player_notes%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select credit_points into v_points from public.arcanum_supporters where user_id = v_uid;
  if private.supporter_tier(v_points) is null then raise exception 'SUPPORTER_REQUIRED'; end if;
  select * into v_row from public.arcanum_player_notes where user_id = v_uid;
  return jsonb_build_object('body', coalesce(v_row.body, ''), 'updated_at', v_row.updated_at);
end;
$$;

create or replace function public.save_my_notes(p_body text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_points integer;
  v_body text := coalesce(p_body, '');
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(v_body) > 4000 then raise exception 'NOTES_TOO_LONG'; end if;
  select credit_points into v_points from public.arcanum_supporters where user_id = v_uid;
  if private.supporter_tier(v_points) is null then raise exception 'SUPPORTER_REQUIRED'; end if;
  insert into public.arcanum_player_notes(user_id, body) values (v_uid, v_body)
  on conflict (user_id) do update set body = excluded.body, updated_at = now();
  return jsonb_build_object('saved', true);
end;
$$;

-- Service role only: called by the arcanum-admin Edge Function (which audits every grant).
create or replace function public.admin_grant_supporter_credit(p_user_id uuid, p_delta integer, p_reason text, p_actor uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
begin
  if p_user_id is null then raise exception 'INVALID_USER'; end if;
  if p_delta is null or p_delta = 0 or abs(p_delta) > 1000 then raise exception 'INVALID_CREDIT_DELTA'; end if;

  insert into public.arcanum_supporters(user_id, credit_points)
  values (p_user_id, greatest(0, p_delta))
  on conflict (user_id) do update
    set credit_points = greatest(0, public.arcanum_supporters.credit_points + p_delta),
        updated_at = now()
  returning credit_points into v_total;

  insert into public.arcanum_supporter_ledger(user_id, delta, reason, granted_by)
  values (p_user_id, p_delta, left(p_reason, 200), p_actor);

  return jsonb_build_object('credit_points', v_total, 'tier', private.supporter_tier(v_total));
end;
$$;

-- Service role only: lets the Discord bot show status and sync the supporter role.
create or replace function public.discord_status(p_discord_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link public.arcanum_discord_links%rowtype;
  v_mage text;
  v_luck public.arcanum_luck%rowtype;
  v_points integer;
begin
  select * into v_link from public.arcanum_discord_links where discord_id = p_discord_id;
  if v_link.discord_id is null then raise exception 'NOT_LINKED'; end if;

  select r.mage_name into v_mage
  from public.realms r
  join public.seasons s on s.id = r.season_id
  where r.player_id = v_link.user_id and s.status in ('setup','active')
  order by s.created_at desc limit 1;

  select * into v_luck from public.arcanum_luck where user_id = v_link.user_id;
  select credit_points into v_points from public.arcanum_supporters where user_id = v_link.user_id;

  return jsonb_build_object(
    'mage_name', v_mage,
    'luck_active', v_luck.user_id is not null and v_luck.expires_at > now(),
    'luck_expires_at', case when v_luck.expires_at > now() then v_luck.expires_at else null end,
    'tier', private.supporter_tier(v_points),
    'last_luck_day', v_link.last_luck_day
  );
end;
$$;

-- Service role only: lets the arcanum-admin Edge Function grant luck (private schema is not exposed to PostgREST).
create or replace function public.admin_grant_luck(p_user_id uuid, p_hours integer default 24)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object('expires_at', private.grant_luck_impl(p_user_id, 'admin', p_hours));
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Permissions
-- ---------------------------------------------------------------------------
revoke all on function private.luck_active(uuid) from public, anon, authenticated;
revoke all on function private.grant_luck_impl(uuid, text, integer) from public, anon, authenticated;

revoke all on function public.my_luck_status() from public, anon;
revoke all on function public.create_discord_link_code() from public, anon;
revoke all on function public.my_discord_link() from public, anon;
revoke all on function public.unlink_discord() from public, anon;
revoke all on function public.my_supporter_status() from public, anon;
revoke all on function public.get_my_notes() from public, anon;
revoke all on function public.save_my_notes(text) from public, anon;
grant execute on function public.my_luck_status() to authenticated;
grant execute on function public.create_discord_link_code() to authenticated;
grant execute on function public.my_discord_link() to authenticated;
grant execute on function public.unlink_discord() to authenticated;
grant execute on function public.my_supporter_status() to authenticated;
grant execute on function public.get_my_notes() to authenticated;
grant execute on function public.save_my_notes(text) to authenticated;

revoke all on function public.redeem_discord_link(text, text, text) from public, anon, authenticated;
revoke all on function public.discord_claim_luck(text) from public, anon, authenticated;
revoke all on function public.discord_status(text) from public, anon, authenticated;
revoke all on function public.admin_grant_supporter_credit(uuid, integer, text, uuid) from public, anon, authenticated;
revoke all on function public.admin_grant_luck(uuid, integer) from public, anon, authenticated;
grant execute on function public.admin_grant_luck(uuid, integer) to service_role;
grant execute on function public.redeem_discord_link(text, text, text) to service_role;
grant execute on function public.discord_claim_luck(text) to service_role;
grant execute on function public.discord_status(text) to service_role;
grant execute on function public.admin_grant_supporter_credit(uuid, integer, text, uuid) to service_role;
grant execute on function private.grant_luck_impl(uuid, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Core effects of Lady Luck (patched like the earlier migrations: abort if the text moved)
-- ---------------------------------------------------------------------------
do $migration$
declare
  v_def text;
begin
  -- 5a. Summoning: +5 points of success chance while Lady Luck smiles (capped at 100%).
  select pg_get_functiondef(p.oid) into v_def
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'private' and p.proname = 'cast_summon_impl' and p.prokind = 'f'
  limit 1;

  if v_def is null then raise exception 'cast_summon_impl not found'; end if;

  if position('luck_active' in v_def) = 0 then
    if position('v_chance_bp:=least(10000,greatest(0,v_chance_bp));' in v_def) = 0 then
      raise exception 'cast_summon_impl chance anchor not found; not patching';
    end if;
    v_def := replace(
      v_def,
      'v_chance_bp:=least(10000,greatest(0,v_chance_bp));',
      $r$v_chance_bp:=least(10000,greatest(0,v_chance_bp));
  if private.luck_active(v_uid) then v_chance_bp:=least(10000,v_chance_bp+500); end if;$r$
    );
    execute v_def;
  end if;

  -- 5b. Exploration: +10% land per turn, with probabilistic rounding so the bonus is real on small rolls.
  select pg_get_functiondef(p.oid) into v_def
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'private' and p.proname = 'explore_impl' and p.prokind = 'f'
  limit 1;

  if v_def is null then raise exception 'explore_impl not found'; end if;

  if position('luck_active' in v_def) = 0 then
    if position('v_rolls jsonb := ''[]''::jsonb;' in v_def) = 0
       or position('for i in 1..p_turns loop' in v_def) = 0
       or position('v_gain := floor(v_roll::numeric * v_factor)::integer;' in v_def) = 0 then
      raise exception 'explore_impl anchors not found; not patching';
    end if;

    v_def := replace(
      v_def,
      'v_rolls jsonb := ''[]''::jsonb;',
      $r$v_rolls jsonb := '[]'::jsonb;
  v_luck boolean := false;
  v_exact numeric;$r$
    );
    v_def := replace(
      v_def,
      'for i in 1..p_turns loop',
      $r$v_luck := private.luck_active(v_uid);
  for i in 1..p_turns loop$r$
    );
    v_def := replace(
      v_def,
      'v_gain := floor(v_roll::numeric * v_factor)::integer;',
      $r$v_gain := floor(v_roll::numeric * v_factor)::integer;
      if v_luck then
        v_exact := v_roll::numeric * v_factor * 1.10;
        v_gain := floor(v_exact)::integer + (
          case when (((hashtextextended(r.id::text || ':luck:' || v_event_no::text || ':' || i::text, 0) % 1000) + 1000) % 1000)
                    < floor((v_exact - floor(v_exact)) * 1000)
               then 1 else 0 end
        );
      end if;$r$
    );
    execute v_def;
  end if;
end
$migration$;
