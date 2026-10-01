-- ARCANUM Lady Luck / Supporters / Discord suite.
-- Run AFTER migration 20261001180000_luck_supporters_discord.sql, with the same SQL runner used for combat_core.sql.
-- It always ends by raising an exception, so nothing it touches is ever committed:
-- it works on an alive NPC realm, links a fake Discord id, grants fake credit and explores 100 turns, then rolls back.

do $test$
declare
  v_uid uuid; v_realm uuid; v_report text := ''; v_code text; r jsonb; v_exp timestamptz; v_exp2 timestamptz;
  v_nolucky int; v_lucky int; v_floor_sum int := 0; el jsonb; v_gain int; v_land int; v_roll int; v_before int; v_factor numeric; v_fl int;
  t text;
begin
  -- Structure: row level security on, players can never read the raw tables, service-only RPCs are not callable by players.
  foreach t in array array['arcanum_luck','arcanum_luck_log','arcanum_discord_links','arcanum_discord_link_codes','arcanum_supporters','arcanum_supporter_ledger','arcanum_player_notes'] loop
    assert (select relrowsecurity from pg_class where oid = ('public.'||t)::regclass), 'RLS off on '||t;
    assert not has_table_privilege('authenticated', 'public.'||t, 'select'), 'players can read '||t;
    assert not has_table_privilege('anon', 'public.'||t, 'select'), 'anon can read '||t;
  end loop;
  assert not has_function_privilege('authenticated','public.redeem_discord_link(text,text,text)','execute'), 'redeem callable by players';
  assert not has_function_privilege('authenticated','public.discord_claim_luck(text)','execute'), 'claim callable by players';
  assert not has_function_privilege('authenticated','public.admin_grant_supporter_credit(uuid,integer,text,uuid)','execute'), 'grant callable by players';
  assert not has_function_privilege('anon','public.my_luck_status()','execute'), 'anon can call my_luck_status';
  assert has_function_privilege('authenticated','public.my_luck_status()','execute'), 'players cannot call my_luck_status';
  assert has_function_privilege('service_role','public.discord_claim_luck(text)','execute'), 'service cannot claim';
  assert position('luck_active' in pg_get_functiondef('private.explore_impl(integer)'::regprocedure))>0, 'explore not patched';
  assert position('luck_active' in pg_get_functiondef('private.cast_summon_impl(text)'::regprocedure))>0, 'summon not patched';
  v_report := v_report || 'structure+grants OK; ';

  select r2.player_id, r2.id into v_uid, v_realm
  from public.realms r2 join private.npc_controllers n on n.user_id = r2.player_id
  where r2.status = 'alive' order by r2.id limit 1;
  assert v_uid is not null, 'no npc realm to test with';
  perform set_config('request.jwt.claims', json_build_object('sub', v_uid::text, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v_uid::text, true);

  -- Lady Luck: 24h, never shortened, source is validated.
  assert not private.luck_active(v_uid), 'luck at start';
  assert (public.my_luck_status()->>'active')::boolean = false, 'status active at start';
  v_exp := private.grant_luck_impl(v_uid,'admin',24);
  assert private.luck_active(v_uid), 'luck not active after grant';
  v_exp2 := private.grant_luck_impl(v_uid,'event',1);
  assert v_exp2 >= v_exp - interval '1 second', 'luck shortened';
  assert (public.my_luck_status()->'bonuses'->>'explore_land_percent')::int = 10, 'bonus json';
  begin perform private.grant_luck_impl(v_uid,'bogus',24); raise exception 'bogus accepted'; exception when others then assert sqlerrm='INVALID_LUCK_SOURCE', sqlerrm; end;
  v_report := v_report || 'luck OK; ';

  -- Discord: code, rate limit, redeem, one link per account, daily claim.
  r := public.create_discord_link_code(); v_code := r->>'code';
  assert length(v_code)=8, 'code length';
  begin perform public.create_discord_link_code(); raise exception 'no ratelimit'; exception when others then assert sqlerrm='RATE_LIMIT', sqlerrm; end;
  begin perform public.redeem_discord_link('BADCODE1','123456789012345678','x'); raise exception 'bad code accepted'; exception when others then assert sqlerrm='INVALID_OR_EXPIRED_CODE', sqlerrm; end;
  r := public.redeem_discord_link(v_code,'123456789012345678','Tester#0001');
  assert (r->>'linked')::boolean, 'not linked';
  assert (public.my_discord_link()->>'linked')::boolean, 'my link';
  begin perform public.create_discord_link_code(); raise exception 'second link allowed'; exception when others then assert sqlerrm='ALREADY_LINKED', sqlerrm; end;
  update public.arcanum_luck set expires_at = now() - interval '1 hour' where user_id = v_uid;
  r := public.discord_claim_luck('123456789012345678'); assert (r->>'granted')::boolean, 'claim not granted';
  assert private.luck_active(v_uid), 'claim did not grant luck';
  r := public.discord_claim_luck('123456789012345678'); assert not (r->>'granted')::boolean and r->>'reason'='ALREADY_CLAIMED_TODAY', 'second claim allowed';
  begin perform public.discord_claim_luck('999999999999999999'); raise exception 'unlinked claim'; exception when others then assert sqlerrm='NOT_LINKED', sqlerrm; end;
  assert (public.discord_status('123456789012345678')->>'luck_active')::boolean, 'status luck';
  v_report := v_report || 'discord OK; ';

  -- Supporters: tiers at 2 and 15 credit points, notes gated, credit never negative.
  assert (public.my_supporter_status()->>'supporter')::boolean = false, 'supporter at start';
  begin perform public.get_my_notes(); raise exception 'notes open'; exception when others then assert sqlerrm='SUPPORTER_REQUIRED', sqlerrm; end;
  r := public.admin_grant_supporter_credit(v_uid,2,'test',null); assert r->>'tier'='supporter', 'tier 2';
  assert (public.my_supporter_status()->>'supporter')::boolean, 'supporter after grant';
  perform public.save_my_notes('hola'); assert public.get_my_notes()->>'body'='hola', 'notes roundtrip';
  r := public.admin_grant_supporter_credit(v_uid,13,'test',null); assert r->>'tier'='patron', 'tier 15';
  r := public.admin_grant_supporter_credit(v_uid,-100,'test',null); assert (r->>'credit_points')::int=0 and r->>'tier' is null, 'floor at 0';
  v_report := v_report || 'supporters OK; ';

  -- Exploration: luck never lowers a roll and the total is never below the unlucky floors.
  update public.arcanum_luck set expires_at = now() - interval '1 hour' where user_id = v_uid;
  update public.realms set turns = 50 where id = v_realm;
  r := private.explore_impl(50);
  v_nolucky := (r->>'land_gained')::int;
  perform private.grant_luck_impl(v_uid,'admin',24);
  update public.realms set turns = 50 where id = v_realm;
  r := private.explore_impl(50);
  v_lucky := (r->>'land_gained')::int;
  for el in select * from jsonb_array_elements(r->'rolls') loop
    v_gain := (el->>'land_gain')::int; v_land := (el->>'land_after')::int; v_roll := (el->>'roll')::int;
    v_before := v_land - v_gain;
    v_factor := greatest(0, least(1, (3500 - v_before)::numeric / 3300));
    v_fl := case when v_before >= 3500 then 0 else floor(v_roll * v_factor)::int end;
    assert v_gain >= v_fl, 'luck lowered a roll';
    v_floor_sum := v_floor_sum + v_fl;
  end loop;
  assert v_lucky >= v_floor_sum, 'lucky total below floors';
  v_report := v_report || format('explore nolucky=%s lucky=%s floors=%s; ', v_nolucky, v_lucky, v_floor_sum);

  raise exception E'ARCANUM LUCK TESTS PASSED (rolled back): %', v_report;
end
$test$;
