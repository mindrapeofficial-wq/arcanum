-- ARCANUM combat core tests (subset of the Core Rules Test Suite: T001-T013 plus known deviations).
--
-- SAFE BY CONSTRUCTION: this is ONE anonymous block that always ends with RAISE EXCEPTION, so
-- Postgres rolls back everything it created (fixture units, battles, temp function). Nothing persists.
-- The "error" it returns IS the report. Run it in the Supabase SQL editor.
--
-- Statuses:  PASS       the engine matches the rule
--            FAIL       the engine breaks a rule that is meant to be correct
--            DEVIATION  the engine differs from the Biblia; fixed by a pending migration / decision
--
-- It reads two existing realms of the same season only as foreign-key anchors for the fixture battles.

do $tests$
declare
  v_report text := '';
  v_season uuid;
  v_att_realm uuid;
  v_def_realm uuid;
  v_base jsonb := '{"attack_resistances":{},"abilities":[],"natural_flying":false,"natural_ranged":false,"extra_attack_power":null,"counter_attack":0,"attack_power":100,"hit_points":100,"attack_types":["melee"]}';
  r jsonb;
  v_exp numeric;
  v_b uuid;
  v_pick text;
  v_src text;
  v_ok boolean;
begin
  select id, season_id into v_att_realm, v_season from public.realms order by created_at, id limit 1;
  select id into v_def_realm from public.realms where id<>v_att_realm and season_id=v_season order by created_at, id limit 1;
  if v_def_realm is null then raise exception 'NEED_TWO_REALMS_IN_THE_SAME_SEASON'; end if;

  -- Neutral defender: no fortresses, so effective HP equals the unit's HP (rolled back at the end).
  update public.realms set land = 10000 where id = v_def_realm;
  update public.realm_buildings set fortresses = 0 where realm_id = v_def_realm;

  -- Fixture units: copies of an existing unit row with overrides, so every NOT NULL column is filled.
  insert into public.unit_catalog
  select (jsonb_populate_record(null::public.unit_catalog,
           to_jsonb(u) || v_base || x.o || jsonb_build_object('id', x.k, 'name_es', x.k, 'name_original', x.k))).*
  from public.unit_catalog u,
       (values
         ('zt_atk',        '{"counter_attack":100}'::jsonb),
         ('zt_atk_fb',     '{"attack_types":["fire","breath"]}'::jsonb),
         ('zt_atk_fire',   '{"attack_types":["fire"]}'::jsonb),
         ('zt_atk_end',    '{"counter_attack":100,"abilities":["Endurance"]}'::jsonb),
         ('zt_atk_clumsy', '{"abilities":["Clumsiness"]}'::jsonb),
         ('zt_def',        '{}'::jsonb),
         ('zt_def_res',    '{"attack_resistances":{"fire":75,"breath":0}}'::jsonb),
         ('zt_def_ws',     '{"abilities":["Weakness: fire","Scales"]}'::jsonb),
         ('zt_def_swift',  '{"abilities":["Swift"]}'::jsonb),
         ('zt_fly',        '{"natural_flying":true,"abilities":["Flying"]}'::jsonb),
         ('zt_rng',        '{"natural_ranged":true}'::jsonb),
         ('zt_kt',         '{}'::jsonb),
         ('zt_uni',        '{}'::jsonb),
         ('zt_arch',       '{"natural_flying":true}'::jsonb),
         ('zt_dom',        '{"natural_flying":true}'::jsonb)
       ) as x(k, o)
  where u.id = 'militia';

  -- Helper: builds a one-event battle and returns what the engine did.
  execute $fn$
    create function pg_temp.zt_run(p_mode text, p_actor text, p_aq bigint, p_target text, p_tq bigint,
                                   p_event text, p_side text default 'attacker', p_eff integer default 10000)
    returns jsonb language plpgsql as $body$
    declare
      b uuid; s uuid; a uuid; d uuid; res jsonb;
      ev public.battle_events%rowtype; act public.battle_report_units%rowtype;
      t_side text := case when p_side='attacker' then 'defender' else 'attacker' end;
    begin
      select id, season_id into a, s from public.realms order by created_at, id limit 1;
      select id into d from public.realms where id<>a and season_id=s order by created_at, id limit 1;
      insert into public.battle_reports(season_id,attacker_realm_id,defender_realm_id,mode,seed)
        values (s,a,d,p_mode,777) returning id into b;
      insert into public.battle_report_units(battle_id,side,unit_id,initial_quantity,final_quantity,initial_np,efficiency_bp)
        values (b,p_side,p_actor,p_aq,p_aq,p_aq,p_eff),(b,t_side,p_target,p_tq,p_tq,p_tq,10000);
      res := private.battle_damage_event(b,1,p_side,p_actor,p_target,p_event,p_mode,0);
      select * into ev from public.battle_events where battle_id=b and sequence=1;
      select * into act from public.battle_report_units where battle_id=b and side=p_side and unit_id=p_actor;
      return jsonb_build_object('applied',res->>'applied','damage',ev.damage,'kills',ev.kills,
        'acc',ev.accuracy_bp,'rand',ev.random_bp,'res',ev.resistance_bp,'meta',ev.metadata,'eff',act.efficiency_bp);
    end $body$;
  $fn$;

  -- T001: basic damage. Attackers x AP x efficiency(1.0) x accuracy(0.30) x rand, resistance 0, kills = floor(dmg/HP).
  r := pg_temp.zt_run('REGULAR','zt_atk',1000,'zt_def',100000,'PRIMARY');
  v_exp := floor(1000::numeric*100*10000/10000*3000/10000*(r->>'rand')::numeric/10000*10000/10000);
  v_report := v_report || case when (r->>'acc')::int=3000 and (r->>'damage')::numeric=v_exp
                                and (r->>'kills')::numeric=floor(v_exp/100) then 'PASS      ' else 'FAIL      ' end
              || 'T001 basic damage: got ' || (r->>'damage') || ', expected ' || v_exp || E'\n';

  -- T002: multi-type resistance is the average (fire 75, breath 0 -> 37.5%).
  r := pg_temp.zt_run('REGULAR','zt_atk_fb',1000,'zt_def_res',100000,'PRIMARY');
  v_exp := floor(1000::numeric*100*3000/10000*(r->>'rand')::numeric/10000*(10000-3750)/10000);
  v_report := v_report || case when (r->>'res')::int=3750 and (r->>'damage')::numeric=v_exp then 'PASS      ' else 'FAIL      ' end
              || 'T002 multi-type resistance: resistance_bp ' || (r->>'res') || ' (expected 3750), damage ' || (r->>'damage') || ' vs ' || v_exp || E'\n';

  -- T003: weakness x2 and scales x0.75 as independent multipliers.
  r := pg_temp.zt_run('REGULAR','zt_atk_fire',1000,'zt_def_ws',100000,'PRIMARY');
  v_exp := floor(1000::numeric*100*3000/10000*(r->>'rand')::numeric/10000*2*0.75);
  v_report := v_report || case when (r->>'damage')::numeric=v_exp then 'PASS      ' else 'FAIL      ' end
              || 'T003 weakness + scales: damage ' || (r->>'damage') || ' vs ' || v_exp || E'\n';

  -- T004: normal fatigue. Primary 1.00 -> 0.85, then counter attempt -> 0.70.
  r := pg_temp.zt_run('REGULAR','zt_atk',1000,'zt_def',100000,'PRIMARY');
  v_report := v_report || case when (r->>'eff')::int=8500 then 'PASS      ' else 'FAIL      ' end || 'T004a after primary: ' || (r->>'eff') || ' (expected 8500)' || E'\n';
  r := pg_temp.zt_run('REGULAR','zt_atk',1000,'zt_def',100000,'COUNTER','attacker',8500);
  v_report := v_report || case when (r->>'eff')::int=7000 then 'PASS      ' else 'FAIL      ' end || 'T004b after counter attempt: ' || (r->>'eff') || ' (expected 7000)' || E'\n';

  -- T005: Endurance. Primary 1.00 -> 0.90, then counter attempt -> 0.80.
  r := pg_temp.zt_run('REGULAR','zt_atk_end',1000,'zt_def',100000,'PRIMARY');
  v_report := v_report || case when (r->>'eff')::int=9000 then 'PASS      ' else 'FAIL      ' end || 'T005a Endurance primary: ' || (r->>'eff') || ' (expected 9000)' || E'\n';
  r := pg_temp.zt_run('REGULAR','zt_atk_end',1000,'zt_def',100000,'COUNTER','attacker',9000);
  v_report := v_report || case when (r->>'eff')::int=8000 then 'PASS      ' else 'FAIL      ' end || 'T005b Endurance counter: ' || (r->>'eff') || ' (expected 8000)' || E'\n';

  -- T008: targeting. Ground melee cannot reach flying; ranged and flying attackers can.
  insert into public.battle_reports(season_id,attacker_realm_id,defender_realm_id,mode,seed)
    values (v_season,v_att_realm,v_def_realm,'REGULAR',1) returning id into v_b;
  insert into public.battle_report_units(battle_id,side,unit_id,initial_quantity,final_quantity,initial_np) values
    (v_b,'attacker','zt_atk',10,10,10),(v_b,'attacker','zt_rng',10,10,10),(v_b,'attacker','zt_fly',10,10,10),
    (v_b,'defender','zt_fly',10,10,10);
  v_report := v_report || case when private.battle_choose_target(v_b,'attacker','zt_atk') is null then 'PASS      ' else 'FAIL      ' end
              || 'T008a ground melee vs only-flying target: none reachable' || E'\n';
  v_report := v_report || case when private.battle_choose_target(v_b,'attacker','zt_rng')='zt_fly' then 'PASS      ' else 'FAIL      ' end
              || 'T008b ranged attacker can reach flying' || E'\n';
  insert into public.battle_report_units(battle_id,side,unit_id,initial_quantity,final_quantity,initial_np)
    values (v_b,'defender','zt_def',10,10,1);
  v_report := v_report || case when private.battle_choose_target(v_b,'attacker','zt_fly')='zt_fly' or private.battle_choose_target(v_b,'attacker','zt_fly')='zt_def' then 'PASS      ' else 'FAIL      ' end
              || 'T008c flying attacker can reach ground or flying' || E'\n';

  -- T009: stacking order by BattlePositionScore = Stack% x modifier (flying 2.25, ground 1.50).
  -- Stack%: Knight 25, Archangel 20, Unicorn 20, Dominion 10  ->  scores 37.5 / 45 / 30 / 22.5.
  -- Expected pick order: Archangel, Knight, Unicorn, Dominion. A ranged attacker picks the top alive each time.
  insert into public.battle_reports(season_id,attacker_realm_id,defender_realm_id,mode,seed)
    values (v_season,v_att_realm,v_def_realm,'REGULAR',2) returning id into v_b;
  insert into public.battle_report_units(battle_id,side,unit_id,initial_quantity,final_quantity,initial_np) values
    (v_b,'attacker','zt_rng',10,10,10),
    (v_b,'defender','zt_kt',10,10,25),(v_b,'defender','zt_arch',10,10,20),
    (v_b,'defender','zt_uni',10,10,20),(v_b,'defender','zt_dom',10,10,10);
  v_pick := private.battle_choose_target(v_b,'attacker','zt_rng');
  update public.battle_report_units set final_quantity=0 where battle_id=v_b and side='defender' and unit_id=v_pick;
  r := jsonb_build_object('first', v_pick, 'second', private.battle_choose_target(v_b,'attacker','zt_rng'));
  v_report := v_report || case when r->>'first'='zt_arch' and r->>'second'='zt_kt' then 'PASS      ' else 'DEVIATION ' end
              || 'T009 stacking order (Biblia: Archangel then Knight): engine picks ' || (r->>'first') || ' then ' || (r->>'second')
              || ' (ranged attackers prefer flying targets first)' || E'\n';

  -- T011-T013: fortress bonus (basis points of HP), regular and siege (x2).
  v_report := v_report || case when private.fort_bonus_bp(10000,67,'REGULAR')=1000 and private.fort_bonus_bp(10000,67,'SIEGE')=2000 then 'PASS      ' else 'FAIL      ' end || 'T011 fort bonus minimum 10% / 20%' || E'\n';
  v_report := v_report || case when private.fort_bonus_bp(10000,150,'REGULAR')=2247 and private.fort_bonus_bp(10000,150,'SIEGE')=4494 then 'PASS      ' else 'FAIL      ' end
              || 'T012 fort bonus intermediate 22.47% / 44.94%: got ' || private.fort_bonus_bp(10000,150,'REGULAR') || ' / ' || private.fort_bonus_bp(10000,150,'SIEGE') || E'\n';
  v_report := v_report || case when private.fort_bonus_bp(10000,250,'REGULAR')=3750 and private.fort_bonus_bp(10000,250,'SIEGE')=7500
                                and private.fort_bonus_bp(10000,400,'REGULAR')=3750 then 'PASS      ' else 'FAIL      ' end || 'T013 fort bonus maximum 37.5% / 75%, no extra beyond' || E'\n';

  -- Engine uses the defender realm fortress bonus when computing effective target HP.
  update public.realms set land=10000 where id=v_def_realm;
  update public.realm_buildings set fortresses=67 where realm_id=v_def_realm;
  r := pg_temp.zt_run('REGULAR','zt_atk',1000,'zt_def',100000,'PRIMARY');
  v_report := v_report || case when (r->'meta'->>'effective_target_hp')::int=110 then 'PASS      ' else 'FAIL      ' end
              || 'T014a effective HP with 67 forts in 10000 acres (regular): ' || (r->'meta'->>'effective_target_hp') || ' (expected 110)' || E'\n';
  r := pg_temp.zt_run('SIEGE','zt_atk',1000,'zt_def',100000,'PRIMARY');
  v_report := v_report || case when (r->'meta'->>'effective_target_hp')::int=120 then 'PASS      ' else 'FAIL      ' end
              || 'T014b effective HP in siege: ' || (r->'meta'->>'effective_target_hp') || ' (expected 120)' || E'\n';

  -- Accuracy: base 30%, siege 20% for non-flying attackers (flying keeps 30%).
  r := pg_temp.zt_run('SIEGE','zt_atk',1000,'zt_def',100000,'PRIMARY');
  v_report := v_report || case when (r->>'acc')::int=2000 then 'PASS      ' else 'FAIL      ' end || 'T015a siege accuracy 20%: ' || (r->>'acc') || E'\n';
  r := pg_temp.zt_run('SIEGE','zt_fly',1000,'zt_def',100000,'PRIMARY');
  v_report := v_report || case when (r->>'acc')::int=3000 then 'PASS      ' else 'FAIL      ' end || 'T015b flying attacker is exempt from the siege penalty: ' || (r->>'acc') || E'\n';

  -- Biblia sec.34: strong penalties use diminishing returns, not a linear clamp.
  -- Clumsiness (-10) vs Swift (-10) from base 30%: nominal 10% = penalty of 20 points -> real accuracy about 12%.
  r := pg_temp.zt_run('REGULAR','zt_atk_clumsy',1000,'zt_def_swift',100000,'PRIMARY');
  v_report := v_report || case when (r->>'acc')::int=1200 then 'PASS      ' else 'DEVIATION ' end
              || 'T016 accuracy curve (penalty 20 points -> 12%): engine gives ' || ((r->>'acc')::numeric/100) || '%' || E'\n';

  -- Curve function itself (Biblia sec.34 anchors from a 30% base: nominal 10% -> 12%, 0% -> 6%, -10% -> 4%, -20% -> 2%, -30% -> 0%).
  if to_regprocedure('private.accuracy_apply_curve(integer,integer)') is null then
    v_report := v_report || 'DEVIATION T016b accuracy curve function not installed yet' || E'\n';
  else
    execute 'select (private.accuracy_apply_curve(1000,3000)=1200) and (private.accuracy_apply_curve(0,3000)=600) and (private.accuracy_apply_curve(-1000,3000)=400) and (private.accuracy_apply_curve(-2000,3000)=200) and (private.accuracy_apply_curve(-3000,3000)=0) and (private.accuracy_apply_curve(2000,3000)=2000) and (private.accuracy_apply_curve(4000,3000)=4000) and (private.accuracy_apply_curve(1500,3000)=1600) and (private.accuracy_apply_curve(1000,2000)=1066)' into v_ok;
    v_report := v_report || case when v_ok then 'PASS      ' else 'FAIL      ' end || 'T016b accuracy curve anchors, linear bonus and interpolation' || E'\n';
  end if;

  -- Biblia sec.39: the attacker must destroy at least 10% of the defender's army (regular and siege).
  select pg_get_functiondef('private.attack_mage_impl(text,text)'::regprocedure) into v_src;
  v_report := v_report || case when v_src like '%v_threshold_bp:=1000;%' then 'PASS      ' else 'DEVIATION ' end
              || 'D039 victory threshold: ' || case when v_src like '%v_threshold_bp:=1000;%' then 'both modes require 10%' else 'regular victory needs only 5% (Biblia says 10%)' end || E'\n';

  raise exception E'ARCANUM COMBAT TESTS (everything rolled back)\n%', v_report;
end
$tests$;
