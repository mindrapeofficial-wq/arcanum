-- A signed-in player could rewrite their own public.players row straight through the REST API
-- (PATCH /rest/v1/players?id=eq.<uid> {"display_name": "..."}), bypassing the game entirely.
-- The client never writes to that table (names are set by server functions), so nothing legitimate depends on it.
--
-- Also removes table-level write grants on the three catalog tables that only worked "by accident" of
-- row level security having no write policy (seasons, schools, rulesets): defence in depth.
--
-- Reads and every SECURITY DEFINER game function are unaffected (validated inside a rolled-back
-- transaction by simulating a real player: reads work, my_realm_state works, UPDATE/INSERT are refused).

drop policy if exists players_update_own on public.players;
drop policy if exists players_insert_own on public.players;

revoke insert, update, delete, truncate on public.players from anon, authenticated;
revoke insert, update, delete, truncate on public.seasons, public.schools, public.rulesets from anon, authenticated;
