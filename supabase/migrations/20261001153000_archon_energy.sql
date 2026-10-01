-- Shared personal action budget for Arena + PvE.
-- 12 max energy, regenerates 1 point every 2 hours.
-- RPCs are service-role only because arcanum-state is the authoritative caller.

create table if not exists public.arcanum_archon_energy (
  user_id uuid primary key references auth.users(id) on delete cascade,
  energy smallint not null default 12 check (energy between 0 and 12),
  energy_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.arcanum_archon_energy enable row level security;

revoke all on table public.arcanum_archon_energy from public, anon, authenticated;
grant select, insert, update on table public.arcanum_archon_energy to service_role;

alter table public.arcanum_arena_state
  add column if not exists ranked_day date,
  add column if not exists ranked_used smallint not null default 0 check (ranked_used between 0 and 6);

update public.arcanum_arena_state
set
  ranked_day = coalesce(ranked_day, seal_day, (now() at time zone 'Europe/Madrid')::date),
  ranked_used = greatest(
    0,
    least(
      6,
      case
        when seal_day = (now() at time zone 'Europe/Madrid')::date
          then 6 - coalesce(seals_remaining, 6)
        else 0
      end
    )
  )
where ranked_day is null;

create or replace function public.get_archon_energy(p_user_id uuid)
returns table (
  energy integer,
  next_energy_at timestamptz
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.arcanum_archon_energy%rowtype;
  v_now timestamptz := now();
  v_regen integer := 0;
  v_new_energy integer := 12;
begin
  insert into public.arcanum_archon_energy(user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select *
  into v_row
  from public.arcanum_archon_energy
  where user_id = p_user_id
  for update;

  if v_row.energy < 12 then
    v_regen := greatest(0, floor(extract(epoch from (v_now - v_row.energy_updated_at)) / 7200)::integer);
  end if;

  if v_regen > 0 then
    v_new_energy := least(12, v_row.energy + v_regen);

    update public.arcanum_archon_energy
    set
      energy = v_new_energy,
      energy_updated_at = case
        when v_new_energy >= 12 then v_now
        else v_row.energy_updated_at + (v_regen * interval '2 hours')
      end,
      updated_at = v_now
    where user_id = p_user_id
    returning * into v_row;
  end if;

  energy := v_row.energy;
  next_energy_at := case
    when v_row.energy >= 12 then null
    else v_row.energy_updated_at + interval '2 hours'
  end;
  return next;
end;
$$;

create or replace function public.spend_archon_energy(p_user_id uuid, p_amount integer)
returns table (
  spent boolean,
  energy integer,
  next_energy_at timestamptz
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.arcanum_archon_energy%rowtype;
  v_now timestamptz := now();
  v_regen integer := 0;
  v_before integer;
  v_after integer;
begin
  if p_amount is null or p_amount < 1 or p_amount > 12 then
    raise exception 'INVALID_ARCHON_ENERGY_AMOUNT';
  end if;

  insert into public.arcanum_archon_energy(user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select *
  into v_row
  from public.arcanum_archon_energy
  where user_id = p_user_id
  for update;

  if v_row.energy < 12 then
    v_regen := greatest(0, floor(extract(epoch from (v_now - v_row.energy_updated_at)) / 7200)::integer);
  end if;

  if v_regen > 0 then
    v_after := least(12, v_row.energy + v_regen);

    update public.arcanum_archon_energy
    set
      energy = v_after,
      energy_updated_at = case
        when v_after >= 12 then v_now
        else v_row.energy_updated_at + (v_regen * interval '2 hours')
      end,
      updated_at = v_now
    where user_id = p_user_id
    returning * into v_row;
  end if;

  v_before := v_row.energy;

  if v_before < p_amount then
    spent := false;
    energy := v_before;
    next_energy_at := case
      when v_before >= 12 then null
      else v_row.energy_updated_at + interval '2 hours'
    end;
    return next;
    return;
  end if;

  v_after := v_before - p_amount;

  update public.arcanum_archon_energy
  set
    energy = v_after,
    -- Spending from a full bar starts a fresh regeneration clock.
    energy_updated_at = case when v_before >= 12 then v_now else v_row.energy_updated_at end,
    updated_at = v_now
  where user_id = p_user_id
  returning * into v_row;

  spent := true;
  energy := v_row.energy;
  next_energy_at := case
    when v_row.energy >= 12 then null
    else v_row.energy_updated_at + interval '2 hours'
  end;
  return next;
end;
$$;

revoke all on function public.get_archon_energy(uuid) from public, anon, authenticated;
revoke all on function public.spend_archon_energy(uuid, integer) from public, anon, authenticated;
grant execute on function public.get_archon_energy(uuid) to service_role;
grant execute on function public.spend_archon_energy(uuid, integer) to service_role;
