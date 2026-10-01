-- ARCANUM pillage suite (roadmap 2a). Run AFTER 20261001190000 and 20261001200000.
-- Two independent blocks: run them as SEPARATE statements (a combined run exceeded a 60 s SQL-runner limit).
-- Each ends by raising ALL_PASSED_ROLLBACK, so nothing is committed.

-- Block 1: a decisive pillage moves no land, burns <=5% of productive buildings, never touches military ones.
do $test$
declare
  va uuid; ra uuid; rb uuid; r jsonb; la0 int; lb0 int; la1 int; lb1 int; bb0 int[]; bb1 int[];
begin
  assert position('apply_pillage' in pg_get_functiondef('private.attack_mage_impl(text,text)'::regprocedure))>0, 'attack not patched';
  assert not has_function_privilege('authenticated','private.apply_pillage(uuid,bigint)','execute'), 'apply_pillage exposed';
  select a.player_id, a.id, b.id into va, ra, rb
  from public.realms a join private.npc_controllers na on na.user_id=a.player_id
  join public.realms b on b.season_id=a.season_id and b.id<>a.id
  join private.npc_controllers nb on nb.user_id=b.player_id
  where a.status='alive' and b.status='alive' and b.wilderness>=80
    and exists(select 1 from public.realm_army x where x.realm_id=a.id and x.quantity>0)
    and exists(select 1 from public.realm_army x where x.realm_id=b.id and x.quantity>0)
  order by a.id, b.id limit 1;
  assert ra is not null, 'need two npc realms, target with 80+ wilderness';
  update public.realm_buildings set farms=farms+40, towns=towns+20, workshops=workshops+10, guilds=guilds+10 where realm_id=rb;
  update public.realms set wilderness=wilderness-80 where id=rb;
  update public.realms set turns=100, gold=10000000000000, mana=10000000000000, population=10000000000000 where id=ra;
  update public.realm_army set quantity=quantity*200 where realm_id=ra;
  perform set_config('request.jwt.claims', json_build_object('sub', va::text, 'role','authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', va::text, true);
  select land into la0 from public.realms where id=ra;
  select land into lb0 from public.realms where id=rb;
  select array[farms,towns,workshops,guilds,barracks,fortresses,barriers,nodes] into bb0 from public.realm_buildings where realm_id=rb;
  r := public.attack_mage((select mage_name from public.realms where id=rb),'PILLAGE');
  select land into la1 from public.realms where id=ra;
  select land into lb1 from public.realms where id=rb;
  select array[farms,towns,workshops,guilds,barracks,fortresses,barriers,nodes] into bb1 from public.realm_buildings where realm_id=rb;
  assert r->>'mode'='PILLAGE', 'mode lost';
  assert (r->>'attacker_victory')::boolean, 'decisive army did not win: '||r::text;
  assert la0=la1 and lb0=lb1, 'land moved in a pillage';
  assert (r->>'land_gained')::int=0 and (r->>'land_lost')::int=0, 'land reported';
  assert (r->'pillage'->>'total')::int > 0, 'victory burned nothing';
  assert bb1[1]=bb0[1]-(r->'pillage'->>'farms')::int, 'farm count mismatch';
  assert bb1[5:8]=bb0[5:8], 'military buildings touched';
  assert (r->'pillage'->>'farms')::int <= ceil(bb0[1]*0.05)::int, 'burn above 5%';
  assert (select mode from public.battle_reports where id=(r->>'battle_id')::uuid)='PILLAGE', 'report mode';
  assert (select land = wilderness + b.farms+b.towns+b.nodes+b.workshops+b.guilds+b.barracks+b.fortresses+b.barriers
          from public.realms r2 join public.realm_buildings b on b.realm_id=r2.id where r2.id=rb), 'land invariant after attack';
  assert (select status from public.realms where id=rb)='alive', 'pillage killed a mage';
  raise exception 'ALL_PASSED_ROLLBACK burned=%', r->'pillage';
end
$test$;

-- Block 2: unknown modes are rejected; the cap is 10 pillages per target per 24 h (9 do not trip it, 10 do).
do $test$
declare va uuid; ra uuid; rb uuid; v_season uuid; v_err text;
begin
  select a.player_id, a.id, b.id, a.season_id into va, ra, rb, v_season
  from public.realms a join private.npc_controllers na on na.user_id=a.player_id
  join public.realms b on b.season_id=a.season_id and b.id<>a.id
  join private.npc_controllers nb on nb.user_id=b.player_id
  where a.status='alive' and b.status='alive'
    and exists(select 1 from public.realm_army x where x.realm_id=a.id and x.quantity>0)
    and exists(select 1 from public.realm_army x where x.realm_id=b.id and x.quantity>0)
  order by a.id, b.id limit 1;
  update public.realms set turns=100 where id=ra;
  perform set_config('request.jwt.claims', json_build_object('sub', va::text, 'role','authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', va::text, true);
  begin perform public.attack_mage((select mage_name from public.realms where id=rb),'RAID'); assert false, 'bad mode';
  exception when others then get stacked diagnostics v_err = message_text; assert v_err='INVALID_ATTACK_MODE', v_err; end;
  insert into public.battle_reports(season_id,attacker_realm_id,defender_realm_id,mode,seed,war_expense,status,resolved_at)
  select v_season,ra,rb,'PILLAGE',100+g,'{}'::jsonb,'resolved',now() from generate_series(1,9) g;
  begin perform public.attack_mage((select mage_name from public.realms where id=rb),'PILLAGE');
  exception when others then get stacked diagnostics v_err = message_text; assert v_err<>'PILLAGE_LIMIT_REACHED', 'cap hit at 9'; end;
  insert into public.battle_reports(season_id,attacker_realm_id,defender_realm_id,mode,seed,war_expense,status,resolved_at)
  select v_season,ra,rb,'PILLAGE',200+g,'{}'::jsonb,'resolved',now() from generate_series(1,10) g;
  begin perform public.attack_mage((select mage_name from public.realms where id=rb),'PILLAGE'); assert false, 'cap ignored';
  exception when others then get stacked diagnostics v_err = message_text; assert v_err='PILLAGE_LIMIT_REACHED', v_err; end;
  raise exception 'ALL_PASSED_ROLLBACK';
end $test$;
