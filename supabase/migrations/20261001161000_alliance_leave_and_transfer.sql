-- Alliance lifecycle: members can leave, solo leaders can disband,
-- and leaders with other members must transfer leadership first.

create or replace function public.leave_alliance()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_alliance uuid;
  v_role text;
  v_name text;
  v_tag text;
  v_members integer;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  select am.alliance_id, am.role, a.name, a.tag
    into v_alliance, v_role, v_name, v_tag
  from private.alliance_members am
  join private.alliances a on a.id = am.alliance_id
  where am.user_id = v_uid
  for update of am;

  if v_alliance is null then raise exception 'NOT_IN_ALLIANCE'; end if;

  select count(*) into v_members
  from private.alliance_members
  where alliance_id = v_alliance;

  if v_role = 'leader' and v_members > 1 then
    raise exception 'ALLIANCE_TRANSFER_REQUIRED';
  end if;

  if v_role = 'leader' then
    delete from private.alliance_invites where alliance_id = v_alliance;
    delete from private.alliance_members where alliance_id = v_alliance;
    delete from private.alliances where id = v_alliance;
    return jsonb_build_object('status','disbanded','name',v_name,'tag',v_tag);
  end if;

  delete from private.alliance_members where user_id = v_uid;
  update private.alliance_invites
     set status='declined', responded_at=coalesce(responded_at,now())
   where invitee_id=v_uid and status='pending';

  return jsonb_build_object('status','left','name',v_name,'tag',v_tag);
end;
$$;

create or replace function public.transfer_alliance_leadership(p_mage_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_alliance uuid;
  v_role text;
  v_target uuid;
  v_target_name text;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  select alliance_id, role into v_alliance, v_role
  from private.alliance_members
  where user_id=v_uid
  for update;

  if v_alliance is null then raise exception 'NOT_IN_ALLIANCE'; end if;
  if v_role <> 'leader' then raise exception 'ALLIANCE_LEADER_REQUIRED'; end if;

  select r.player_id, r.mage_name
    into v_target, v_target_name
  from public.realms r
  join public.seasons s on s.id=r.season_id
  where lower(r.mage_name)=lower(btrim(coalesce(p_mage_name,'')))
    and s.status in ('setup','active','armageddon')
  order by s.created_at desc
  limit 1;

  if v_target is null then raise exception 'PLAYER_NOT_FOUND'; end if;
  if v_target=v_uid then raise exception 'CANNOT_TRANSFER_TO_SELF'; end if;
  if not exists(
    select 1 from private.alliance_members
    where alliance_id=v_alliance and user_id=v_target
  ) then raise exception 'TARGET_NOT_ALLIANCE_MEMBER'; end if;

  update private.alliance_members
     set role='member'
   where alliance_id=v_alliance and user_id=v_uid;

  update private.alliance_members
     set role='leader'
   where alliance_id=v_alliance and user_id=v_target;

  update private.alliances
     set owner_id=v_target
   where id=v_alliance;

  return jsonb_build_object('status','transferred','new_leader',v_target_name);
end;
$$;

revoke all on function public.leave_alliance() from public, anon;
revoke all on function public.transfer_alliance_leadership(text) from public, anon;
grant execute on function public.leave_alliance() to authenticated;
grant execute on function public.transfer_alliance_leadership(text) to authenticated;
