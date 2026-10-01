-- ARCANUM mana crisis + supporter badge suite.
-- Run AFTER migration 20261001210000_mana_crisis_and_supporter_badge.sql (and after the luck migration 20261001180000).
-- It always ends by raising an exception, so nothing it touches is ever committed: it works on an alive NPC realm,
-- rewrites its army and buildings, switches the ruleset flag on and runs the economy, then rolls everything back.

do $test$
declare
  v_uid uuid; v_realm uuid; v_season uuid; v_ruleset uuid; v_mage text; v_report text := ''; r jsonb; v_q bigint; v_cnt int; v_mana bigint;
begin
  assert not has_function_privilege('anon','public.supporters_among(text[])','execute'), 'anon can call supporters_among';
  assert has_function_privilege('authenticated','public.supporters_among(text[])','execute'), 'players cannot call supporters_among';
  assert not has_function_privilege('anon','public.my_recent_mana_crisis()','execute'), 'anon can call my_recent_mana_crisis';
  assert not has_function_privilege('authenticated','private.resolve_mana_crisis(uuid,bigint)','execute'), 'players can resolve crisis';
  assert position('resolve_mana_crisis' in pg_get_functiondef('private.run_economy_impl(text,integer)'::regprocedure))>0, 'economy not patched';
  assert position('mana_crisis' in pg_get_functiondef('private.run_economy_impl(text,integer)'::regprocedure))>0, 'return key';
  v_report := v_report || 'structure OK; ';

  select r2.player_id, r2.id, r2.season_id, r2.mage_name into v_uid, v_realm, v_season, v_mage
  from public.realms r2 join private.npc_controllers n on n.user_id=r2.player_id where r2.status='alive' order by r2.id limit 1;
  assert v_uid is not null, 'no npc realm';
  select ruleset_id into v_ruleset from public.seasons where id=v_season;
  perform set_config('request.jwt.claims', json_build_object('sub', v_uid::text, 'role','authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_uid::text, true);

  assert coalesce((select config->>'mana_crisis' from public.rulesets where id=v_ruleset),'off')='off', 'the flag must start off (the owner switches it on)';

  update public.realms set turns=50, mana=0 where id=v_realm;
  update public.realm_buildings set nodes=0 where realm_id=v_realm;
  delete from public.realm_army where realm_id=v_realm;
  insert into public.realm_army(realm_id,unit_id,quantity) values (v_realm,'treant',1000),(v_realm,'archangel',100);

  -- A: flag off keeps the old behaviour (shortfall only recorded)
  r := private.run_economy_impl('NONE',1);
  assert r->'mana_crisis' = '[]'::jsonb, 'flag off must not remove units: '||(r->'mana_crisis')::text;
  select quantity into v_q from public.realm_army where realm_id=v_realm and unit_id='treant';
  assert v_q=1000, 'treant touched with flag off';
  assert exists(select 1 from public.economy_ledger l where l.realm_id=v_realm and l.crisis_events::text like '%MANA_SHORTFALL%'), 'shortfall not recorded';
  assert (public.mana_crisis_preview()->>'enabled')::boolean = false, 'preview enabled while off';
  assert public.mana_crisis_preview()->'would_lose_first'->0->>'unit_id'='treant', 'preview order';
  v_report := v_report || 'flag off OK; ';

  -- B: flag on, full deficit -> both stacks go, largest total drain first
  update public.rulesets set config = jsonb_set(config,'{mana_crisis}','"on"') where id=v_ruleset;
  update public.realms set mana=0, turns=50 where id=v_realm;
  r := private.run_economy_impl('NONE',1);
  assert jsonb_array_length(r->'mana_crisis')=2, 'two stacks expected: '||(r->'mana_crisis')::text;
  assert r->'mana_crisis'->0->>'unit_id'='treant', 'largest total drain first';
  select count(*) into v_cnt from public.realm_army where realm_id=v_realm and quantity>0 and unit_id in ('treant','archangel');
  assert v_cnt=0, 'stacks not removed';
  assert exists(select 1 from public.economy_ledger l where l.realm_id=v_realm and l.crisis_events::text like '%MANA_CRISIS%'), 'ledger crisis missing';
  assert exists(select 1 from public.realm_events e where e.realm_id=v_realm and e.action_type='MANA_CRISIS'), 'event missing';
  assert (public.mana_crisis_preview()->>'enabled')::boolean = true, 'preview not enabled';
  assert jsonb_array_length(public.my_recent_mana_crisis()) >= 1, 'recent crisis not listed';
  v_report := v_report || 'flag on full OK; ';

  -- C: partial deficit -> only the largest stack is removed
  delete from public.realm_army where realm_id=v_realm;
  insert into public.realm_army(realm_id,unit_id,quantity) values (v_realm,'treant',1000),(v_realm,'archangel',100);
  update public.realm_buildings set nodes=1 where realm_id=v_realm;
  update public.realms set mana=500, turns=50 where id=v_realm;
  r := private.run_economy_impl('NONE',1);
  assert jsonb_array_length(r->'mana_crisis')=1 and r->'mana_crisis'->0->>'unit_id'='treant', 'partial: only treant: '||(r->'mana_crisis')::text;
  select quantity into v_q from public.realm_army where realm_id=v_realm and unit_id='archangel';
  assert v_q=100, 'archangel must survive';
  select mana into v_mana from public.realms where id=v_realm;
  assert v_mana >= 0, 'negative mana';
  v_report := v_report || format('partial OK (mana after=%s); ', v_mana);

  -- D: enough mana -> nothing happens even with the flag on
  delete from public.realm_army where realm_id=v_realm;
  insert into public.realm_army(realm_id,unit_id,quantity) values (v_realm,'treant',10);
  update public.realms set mana=900, turns=50 where id=v_realm;
  r := private.run_economy_impl('NONE',1);
  assert r->'mana_crisis'='[]'::jsonb, 'no crisis when mana is enough';
  v_report := v_report || 'enough mana OK; ';

  -- Supporter badge: visible by default, can be hidden, bounded lookup
  begin perform public.set_supporter_badge_visible(true); raise exception 'non supporter allowed'; exception when others then assert sqlerrm='SUPPORTER_REQUIRED', sqlerrm; end;
  assert public.supporters_among(array[v_mage]) = '{}'::jsonb, 'non supporter listed';
  perform public.admin_grant_supporter_credit(v_uid,2,'test',null);
  assert public.supporters_among(array[upper(v_mage),'nobody-here'])->>lower(v_mage) = 'supporter', 'supporter not listed';
  assert (public.my_supporter_status()->>'badge_visible')::boolean, 'badge_visible default';
  perform public.set_supporter_badge_visible(false);
  assert public.supporters_among(array[v_mage]) = '{}'::jsonb, 'hidden badge listed';
  assert (public.my_supporter_status()->>'badge_visible')::boolean = false, 'badge_visible false';
  perform public.set_supporter_badge_visible(true);
  perform public.admin_grant_supporter_credit(v_uid,13,'test',null);
  assert public.supporters_among(array[v_mage])->>lower(v_mage) = 'patron', 'patron tier';
  begin perform public.supporters_among((select array_agg(g::text) from generate_series(1,201) g)); raise exception 'too many accepted'; exception when others then assert sqlerrm='TOO_MANY_NAMES', sqlerrm; end;
  v_report := v_report || 'badge OK; ';

  raise exception E'ARCANUM MANA CRISIS TESTS PASSED (rolled back): %', v_report;
end
$test$;
