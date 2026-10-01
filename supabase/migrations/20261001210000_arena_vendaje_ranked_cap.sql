-- Vendaje de Savia (duel ability) grants +2 ranked Arena duels per day (6 -> 8).
-- The Archon energy cost (2 per ranked duel) still applies, so energy remains the real throttle.
--
-- IMPORTANT: apply this migration BEFORE deploying the arcanum-state edge function that
-- allows ranked_used up to 8; otherwise the update of ranked_used = 7 or 8 violates the old CHECK.

alter table public.arcanum_arena_state
  drop constraint if exists arcanum_arena_state_ranked_used_check;

alter table public.arcanum_arena_state
  add constraint arcanum_arena_state_ranked_used_check
  check (ranked_used between 0 and 8);
