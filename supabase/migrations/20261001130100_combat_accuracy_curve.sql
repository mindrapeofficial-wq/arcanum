-- Biblia sec.34: strong accuracy penalties have diminishing returns instead of a linear clamp.
--
-- Anchors from the Biblia, as nominal penalty (points off the attacker's base accuracy) -> real accuracy,
-- for the normal 30% base:  20 -> 12%,  30 -> 6%,  40 -> 4%,  50 -> 2%,  60 -> 0%.
-- ASSUMPTION (not stated in the Biblia): a penalty of 10 points keeps the linear value (20%), and values
-- between anchors are interpolated linearly. Penalties are measured against the unit's own base
-- (30% normally, 20% for non-flying attackers in a siege), so the same shape scales with the base.
-- Bonuses above the base stay linear, capped at 100%.
--
-- All integer math (basis points), so results are exact: e.g. nominal 10% from a 30% base -> 12.00%.

create or replace function private.accuracy_apply_curve(p_nominal integer, p_base integer)
returns integer
language plpgsql
immutable
set search_path to ''
as $fn$
declare
  -- real accuracy as fifteenths of the base at penalty = 0, 1/3, 2/3, 1, 4/3, 5/3, 2 bases
  u constant integer[] := array[15, 10, 6, 3, 2, 1, 0];
  pen integer;
  k integer;
  rem integer;
begin
  if p_base <= 0 then
    return greatest(0, least(10000, p_nominal));
  end if;
  if p_nominal >= p_base then
    return least(10000, p_nominal);
  end if;
  pen := p_base - p_nominal;
  k := (3 * pen) / p_base;      -- segment 0..5, 6 or more means zero accuracy
  if k >= 6 then
    return 0;
  end if;
  rem := 3 * pen - k * p_base;  -- position inside the segment, 0 .. p_base-1
  return greatest(0, (u[k + 1] * p_base + (u[k + 2] - u[k + 1]) * rem) / 15);
end
$fn$;

revoke all on function private.accuracy_apply_curve(integer, integer) from public, anon, authenticated;

-- Hook it into the engine by patching the deployed text (aborts if the text is not what we expect).
do $m$
declare
  d text;
  decl_old  constant text := 'v_accuracy integer:=3000;';
  decl_new  constant text := E'v_accuracy integer:=3000;\n  v_accuracy_base integer:=3000;';
  mark_old  constant text := 'if au.abilities @> ''["Clumsiness"]''::jsonb then v_accuracy:=v_accuracy-1000; end if;';
  mark_new  constant text := E'v_accuracy_base:=v_accuracy;\n  if au.abilities @> ''["Clumsiness"]''::jsonb then v_accuracy:=v_accuracy-1000; end if;';
  clamp_old constant text := 'v_accuracy:=greatest(0,least(10000,v_accuracy));';
  clamp_new constant text := 'v_accuracy:=private.accuracy_apply_curve(v_accuracy,v_accuracy_base);';
begin
  select pg_get_functiondef('private.battle_damage_event(uuid,integer,text,text,text,text,text,integer)'::regprocedure) into d;
  if position('accuracy_apply_curve' in d) > 0 then
    return; -- already applied
  end if;
  if position(decl_old in d) = 0 or position(mark_old in d) = 0 or position(clamp_old in d) = 0 then
    raise exception 'private.battle_damage_event does not contain the expected accuracy lines; not patching';
  end if;
  d := replace(d, decl_old, decl_new);
  d := replace(d, mark_old, mark_new);
  d := replace(d, clamp_old, clamp_new);
  execute d;
end
$m$;
