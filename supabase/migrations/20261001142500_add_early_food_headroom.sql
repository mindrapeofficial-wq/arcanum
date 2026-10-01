-- Give early realms subsistence headroom from land while keeping Farms as the main food source.
update public.rulesets
set config = jsonb_set(config, '{base_food_per_land}', '2'::jsonb, true)
where is_active = true;

do $migration$
declare
  v_def text;
begin
  select pg_get_functiondef(p.oid) into v_def
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='run_economy_impl' and p.prokind='f'
  limit 1;

  if v_def is null or position('foodcap := b.farms::bigint * 500;' in v_def)=0 then
    raise exception 'run_economy_impl food capacity anchor not found';
  end if;

  v_def := replace(
    v_def,
    'foodcap := b.farms::bigint * 500;',
    'foodcap := (r.land::bigint * coalesce((rs.config->>''base_food_per_land'')::bigint,2)) + (b.farms::bigint * 500);'
  );
  execute v_def;

  select pg_get_functiondef(p.oid) into v_def
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='my_realm_state' and p.prokind='f'
  limit 1;

  if v_def is null or position('v_food:=b.farms::bigint*500;' in v_def)=0 then
    raise exception 'my_realm_state food capacity anchor not found';
  end if;

  v_def := replace(
    v_def,
    'v_food:=b.farms::bigint*500;',
    'v_food:=(r.land::bigint * coalesce((rs.config->>''base_food_per_land'')::bigint,2)) + (b.farms::bigint*500);'
  );
  execute v_def;
end
$migration$;
