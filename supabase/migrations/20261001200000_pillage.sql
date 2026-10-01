-- Reincarnation roadmap phase 2a: Pillage. See docs/REINCARNATION_ROADMAP.md.
--
-- Third attack mode for attack_mage: PILLAGE. Same combat engine, victory rule and cost (2 turns) as REGULAR,
-- but no land changes hands. A victorious pillage burns part of the target's productive buildings
-- (farms, towns, workshops, guilds). Land is conserved: burned buildings become wilderness, which keeps the
-- invariant land = wilderness + all buildings. Barracks, fortresses, barriers and nodes are never touched,
-- so a pillage can never kill a mage.
--
--   * Burn per building type: ceil(count * 5% * occupation), occupation = min(1, survivors / (land * 2.5)),
--     the same occupation factor REGULAR uses for land.
--   * Cap: at most 10 pillages against the same target per 24 h (wiki number, not verified in play).
--   * Honors damage protection and meditation through private.attack_shield_allows (migration 20261001190000).
--
-- Patches the deployed attack_mage_impl and aborts if its text moved. Idempotent.

alter table public.battle_reports drop constraint if exists battle_reports_mode_check;
alter table public.battle_reports
  add constraint battle_reports_mode_check check (mode = any (array['REGULAR'::text,'SIEGE'::text,'PILLAGE'::text]));

create or replace function private.apply_pillage(p_realm uuid, p_survivors bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.realm_buildings%rowtype;
  v_land integer;
  v_occ numeric;
  v_farms integer; v_towns integer; v_workshops integer; v_guilds integer;
  v_total integer;
begin
  select * into b from public.realm_buildings where realm_id = p_realm for update;
  select land into v_land from public.realms where id = p_realm;
  if b.realm_id is null or v_land is null then return '{}'::jsonb; end if;

  v_occ := least(1::numeric, p_survivors::numeric / greatest(1::numeric, v_land::numeric * 2.5));
  v_farms     := least(b.farms,     ceil(b.farms::numeric     * 0.05 * v_occ)::integer);
  v_towns     := least(b.towns,     ceil(b.towns::numeric     * 0.05 * v_occ)::integer);
  v_workshops := least(b.workshops, ceil(b.workshops::numeric * 0.05 * v_occ)::integer);
  v_guilds    := least(b.guilds,    ceil(b.guilds::numeric    * 0.05 * v_occ)::integer);
  v_total := v_farms + v_towns + v_workshops + v_guilds;

  if v_total > 0 then
    update public.realm_buildings
    set farms = farms - v_farms, towns = towns - v_towns,
        workshops = workshops - v_workshops, guilds = guilds - v_guilds,
        updated_at = now()
    where realm_id = p_realm;
    update public.realms set wilderness = wilderness + v_total, updated_at = now() where id = p_realm;
  end if;

  return jsonb_build_object('farms', v_farms, 'towns', v_towns, 'workshops', v_workshops,
                            'guilds', v_guilds, 'total', v_total);
end;
$$;

revoke all on function private.apply_pillage(uuid, bigint) from public, anon, authenticated;

do $m$
declare
  d text;
  r record;
begin
  select pg_get_functiondef('private.attack_mage_impl(text,text)'::regprocedure) into d;
  if position('apply_pillage' in d) > 0 then return; end if;

  for r in select * from (values
    (E'if v_mode not in (''REGULAR'',''SIEGE'') then',
     E'if v_mode not in (''REGULAR'',''SIEGE'',''PILLAGE'') then'),
    (E'  v_att_survivors bigint:=0;\n',
     E'  v_att_survivors bigint:=0;\n  v_pillage jsonb:=''{}''::jsonb;\n'),
    (E'  v_turn_cost:=2;\n',
     E'  if v_mode=''PILLAGE'' and (\n'
     || E'    select count(*) from public.battle_reports br0\n'
     || E'    where br0.defender_realm_id=dr.id and br0.mode=''PILLAGE'' and br0.created_at>now()-interval ''24 hours''\n'
     || E'  )>=10 then raise exception ''PILLAGE_LIMIT_REACHED''; end if;\n\n  v_turn_cost:=2;\n'),
    (E'(case when v_mode=''REGULAR'' then 500 else 1000 end)::numeric /10000',
     E'(case when v_mode=''REGULAR'' then 500 when v_mode=''PILLAGE'' then 0 else 1000 end)::numeric /10000'),
    (E'  -- Commit surviving armies to persistent realm state.\n',
     E'  if v_victory and v_mode=''PILLAGE'' then\n    v_pillage:=private.apply_pillage(dr.id,v_att_survivors);\n  end if;\n\n  -- Commit surviving armies to persistent realm state.\n'),
    (E'        ''event_count'',v_seq\n',
     E'        ''event_count'',v_seq,\n        ''pillage'',v_pillage\n'),
    (E'    ''turns_spent'',v_turn_cost,\n',
     E'    ''turns_spent'',v_turn_cost,\n    ''pillage'',v_pillage,\n')
  ) as t(old_text,new_text) loop
    if position(r.old_text in d) = 0 then
      raise exception 'private.attack_mage_impl text moved (%); not patching', left(r.old_text, 40);
    end if;
    d := replace(d, r.old_text, r.new_text);
  end loop;
  execute d;
end
$m$;
