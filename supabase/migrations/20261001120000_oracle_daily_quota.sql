-- Per-user daily quota for paid Oracle (Astrael) model calls.
-- Only the service role (the arcanum-oracle Edge Function) can touch it.

create table if not exists private.oracle_usage (
  user_id uuid not null,
  day date not null,
  calls integer not null default 0,
  primary key (user_id, day)
);

alter table private.oracle_usage enable row level security;

-- Atomically consumes one call. Returns true if it was within the daily limit.
create or replace function public.arcanum_oracle_consume(p_user_id uuid, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = private, public
as $$
declare
  v_calls integer;
begin
  insert into private.oracle_usage as u (user_id, day, calls)
  values (p_user_id, (now() at time zone 'Europe/Madrid')::date, 1)
  on conflict (user_id, day) do update set calls = u.calls + 1
  returning u.calls into v_calls;

  -- Cheap housekeeping: keep a week of history.
  delete from private.oracle_usage where day < (now() at time zone 'Europe/Madrid')::date - 7;

  return v_calls <= greatest(p_limit, 0);
end;
$$;

-- Not callable through the public API by players.
revoke all on function public.arcanum_oracle_consume(uuid, integer) from public, anon, authenticated;
grant execute on function public.arcanum_oracle_consume(uuid, integer) to service_role;
