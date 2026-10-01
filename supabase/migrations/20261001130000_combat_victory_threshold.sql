-- Biblia sec.39: the attacker must destroy at least 10% of the defender's permanent army to win.
-- The engine used 5% for REGULAR attacks (the 5% / 10% pair belongs to the maximum land conquered, sec.40).
-- Only the victory threshold changes; land conquest limits stay 5% regular / 10% siege.
--
-- Patches the deployed function text instead of re-declaring 17 KB, and aborts if the text is not
-- what we expect, so it can never half-apply. Safe to run twice.

do $m$
declare
  d text;
  old_line constant text := 'v_threshold_bp:=case when v_mode=''REGULAR'' then 500 else 1000 end;';
  new_line constant text := 'v_threshold_bp:=1000;';
begin
  select pg_get_functiondef('private.attack_mage_impl(text,text)'::regprocedure) into d;
  if position(new_line in d) > 0 and position(old_line in d) = 0 then
    return; -- already applied
  end if;
  if position(old_line in d) = 0 then
    raise exception 'private.attack_mage_impl does not contain the expected threshold line; not patching';
  end if;
  execute replace(d, old_line, new_line);
end
$m$;
