-- Chat and board limits were checked in the edge function with "read last row, then insert".
-- Two requests sent at the same time both passed the check (double posts, a 6th board post).
-- These triggers enforce the same limits inside the insert, serialised per player with an
-- advisory lock, so concurrent requests cannot slip through. The edge function keeps its own
-- checks as a fast path and maps the RATE_LIMIT / POST_LIMIT errors raised here.

create or replace function public.arcanum_chat_enforce_rate_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('arcanum_chat:' || new.user_id || ':' || coalesce(new.channel, 'global')));
  if exists (
    select 1 from public.arcanum_chat_messages
    where user_id = new.user_id
      and channel = coalesce(new.channel, 'global')
      and deleted_at is null
      and created_at > now() - interval '1400 milliseconds'
  ) then
    raise exception 'RATE_LIMIT';
  end if;
  return new;
end;
$$;

drop trigger if exists arcanum_chat_rate_limit on public.arcanum_chat_messages;
create trigger arcanum_chat_rate_limit
  before insert on public.arcanum_chat_messages
  for each row execute function public.arcanum_chat_enforce_rate_limit();

create or replace function public.arcanum_board_enforce_limits()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('arcanum_board:' || new.user_id));
  if exists (
    select 1 from public.arcanum_board_posts
    where user_id = new.user_id
      and deleted_at is null
      and created_at > now() - interval '10 seconds'
  ) then
    raise exception 'RATE_LIMIT';
  end if;
  if (
    select count(*) from public.arcanum_board_posts
    where user_id = new.user_id
      and deleted_at is null
      and expires_at > now()
  ) >= 5 then
    raise exception 'POST_LIMIT';
  end if;
  return new;
end;
$$;

drop trigger if exists arcanum_board_limits on public.arcanum_board_posts;
create trigger arcanum_board_limits
  before insert on public.arcanum_board_posts
  for each row execute function public.arcanum_board_enforce_limits();

revoke all on function public.arcanum_chat_enforce_rate_limit() from public, anon, authenticated;
revoke all on function public.arcanum_board_enforce_limits() from public, anon, authenticated;
