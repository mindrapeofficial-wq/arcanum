-- Biblia sec.27 and T009: targets are ordered by BattlePositionScore = Stack% x modifier
-- (flying 2.25, ground not ranged 1.50, ranged 1.00) and nothing else.
-- battle_choose_target had an extra rule for ranged and flying attackers: "flying targets first, always",
-- which is not in the Biblia (a ranged attacker would hit the Dominion, score 22.5, before the Knight, 37.5).
-- Ground melee attackers still cannot reach flying targets (sec.29), and that branch is unchanged.
--
-- What this does NOT do: full pairing (sec.28), where each formation is assigned a counterpart using relative
-- position and the assignments already made. Today every attacker still focuses the best-scoring reachable
-- formation. The Biblia says there are two historical variants (PAIRING_CLASSIC, PAIRING_TR_2010_PLUS) and does
-- not define either one, so it needs a product decision before it is implemented.
--
-- Patches the deployed text and aborts if it is not what we expect. Safe to run twice.

do $m$
declare
  d text;
  old_part constant text := 'case when u.natural_flying then 0 else 1 end,';
begin
  select pg_get_functiondef('private.battle_choose_target(uuid,text,text)'::regprocedure) into d;
  if position(old_part in d) = 0 then
    if position('natural_flying then 2.25' in d) > 0 then
      return; -- already applied
    end if;
    raise exception 'private.battle_choose_target does not contain the expected ordering; not patching';
  end if;
  execute replace(d, old_part, '');
end
$m$;
