-- ARCANUM damage protection / meditation suite (roadmap 2b + 2c).
-- Run AFTER migration 20261001190000_damage_protection_meditation.sql. Always ends by raising an exception,
-- so nothing it touches is committed. Uses two alive NPC realms of the same season.

do $test$
declare
  va uuid; vb uuid; ra uuid; rb uuid; v_season uuid; v_err text; v_rep uuid; r jsonb;
begin
  assert (select relrowsecurity from pg_class where oid='public.realm_shields'::regclass), 'RLS off';
  assert not has_table_privilege('authenticated','public.realm_shields','select'), 'players read shields';
  assert not has_function_privilege('anon','public.start_meditation()','execute'), 'anon meditates';
  assert has_function_privilege('authenticated','public.start_meditation()','execute'), 'players cannot meditate';
  assert not has_function_privilege('authenticated','private.attack_shield_allows(uuid,uuid)','execute'), 'private exposed';
  assert position('apply_damage_protection' in pg_get_functiondef('private.attack_mage_impl(text,text)'::regprocedure))>0, 'attack not patched';
  assert position('attack_shield_allows' in pg_get_functiondef('private.attack_targets_impl(integer)'::regprocedure))>0, 'targets not patched';

  select a.player_id, a.id, b.player_id, b.id, a.season_id into va, ra, vb, rb, v_season
  from public.realms a join private.npc_controllers na on na.user_id=a.player_id
  join public.realms b on b.season_id=a.season_id and b.id<>a.id
  join private.npc_controllers nb on nb.user_id=b.player_id
  where a.status='alive' and b.status='alive'
    and exists(select 1 from public.realm_army x where x.realm_id=a.id and x.quantity>0)
    and exists(select 1 from public.realm_army x where x.realm_id=b.id and x.quantity>0)
  order by a.id, b.id limit 1;
  assert ra is not null, 'need two npc realms';
  update public.realms set turns=100 where id in (ra, rb);

  assert private.attack_shield_allows(ra, rb), 'open by default';

  -- Meditation (as B)
  perform set_config('request.jwt.claims', json_build_object('sub', vb::text, 'role','authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', vb::text, true);
  assert (public.my_shield_status()->>'can_meditate')::boolean, 'cannot meditate at start';
  perform public.start_meditation();
  assert private.realm_shield_state(rb)='meditation', 'not meditating';
  begin perform public.start_meditation(); assert false, 'double meditate';
  exception when others then get stacked diagnostics v_err = message_text; assert v_err='ALREADY_MEDITATING', v_err; end;
  assert not private.attack_shield_allows(ra, rb), 'attackable while meditating';
  assert not private.attack_shield_allows(rb, ra), 'meditator can attack';
  begin perform public.attack_mage((select mage_name from public.realms where id=ra),'REGULAR'); assert false, 'meditator attacked';
  exception when others then get stacked diagnostics v_err = message_text; assert v_err='ATTACKER_IN_MEDITATION', v_err; end;

  perform set_config('request.jwt.claims', json_build_object('sub', va::text, 'role','authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', va::text, true);
  begin perform public.attack_mage((select mage_name from public.realms where id=rb),'REGULAR'); assert false, 'hit meditator';
  exception when others then get stacked diagnostics v_err = message_text; assert v_err='TARGET_IN_MEDITATION', v_err; end;
  assert not exists(select 1 from public.attack_targets(250) t where t.mage_name=(select mage_name from public.realms where id=rb) and t.can_attack), 'list allows meditator';

  -- Cooldown after meditation ends
  update public.realm_shields set meditation_until=now()-interval '1 minute' where realm_id=rb;
  assert private.attack_shield_allows(ra, rb), 'still shielded after meditation';
  perform set_config('request.jwt.claims', json_build_object('sub', vb::text, 'role','authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', vb::text, true);
  begin perform public.start_meditation(); assert false, 'no cooldown';
  exception when others then get stacked diagnostics v_err = message_text; assert v_err='MEDITATION_COOLDOWN', v_err; end;

  -- Damage protection: 40% loss opens the shield, 20% does not
  insert into public.battle_reports(season_id,attacker_realm_id,defender_realm_id,mode,seed,war_expense,
    status,defender_initial_np,defender_final_np,attacker_initial_np,attacker_final_np,resolved_at)
  values (v_season,ra,rb,'REGULAR',1,'{}'::jsonb,'resolved',1000,800,1000,1000,now());
  perform private.apply_damage_protection(rb);
  assert private.realm_shield_state(rb) is null, '20% opened shield';
  insert into public.battle_reports(season_id,attacker_realm_id,defender_realm_id,mode,seed,war_expense,
    status,defender_initial_np,defender_final_np,attacker_initial_np,attacker_final_np,resolved_at)
  values (v_season,ra,rb,'REGULAR',2,'{}'::jsonb,'resolved',800,600,1000,1000,now());
  perform private.apply_damage_protection(rb);
  assert private.realm_shield_state(rb)='damage', '40% cumulative did not open shield';
  assert not private.attack_shield_allows(ra, rb), 'shielded realm attackable';
  perform set_config('request.jwt.claims', json_build_object('sub', va::text, 'role','authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', va::text, true);
  begin perform public.attack_mage((select mage_name from public.realms where id=rb),'REGULAR'); assert false, 'hit shielded';
  exception when others then get stacked diagnostics v_err = message_text; assert v_err='TARGET_DAMAGE_PROTECTED', v_err; end;
  -- Counter: B attacked A recently, so B may be hit back by A? (A attacked B above) -> A is the one allowed to counter B only if B attacked A
  insert into public.battle_reports(season_id,attacker_realm_id,defender_realm_id,mode,seed,war_expense,status,resolved_at)
  values (v_season,rb,ra,'REGULAR',3,'{}'::jsonb,'resolved',now());
  assert private.attack_shield_allows(ra, rb), 'counter blocked by shield';
  -- Shield is not re-opened by the same losses
  perform private.apply_damage_protection(rb);
  assert (select damage_shield_until from public.realm_shields where realm_id=rb) < now()+interval '24 hours'+interval '1 second', 'bad shield duration';

  raise exception 'ALL_PASSED_ROLLBACK';
end
$test$;
