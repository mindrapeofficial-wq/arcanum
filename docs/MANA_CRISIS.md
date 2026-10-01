# ARCANUM — Mana crisis and visible supporter badge

Status: implemented in the repo, **not deployed**, and the mana rule ships **OFF**.
Migration: `supabase/migrations/20261001210000_mana_crisis_and_supporter_badge.sql`. Tests: `supabase/tests/mana_crisis_badge.sql`.

## 1. Mana crisis

### What Reincarnation does (observed 2026-10-01)
When mana cannot pay the army upkeep, a **whole unit stack** disappears ("Insufficient Mana: Lost 347 Unicorns!") and the net flow recovers. There is no warning besides a "−" next to the mana figure. In the observed case 347 Unicorns (0.8 mana each, 278 per turn in total) were lost while 38 Naga Queens (5.5 mana each, 209 per turn in total) were kept, so the criterion is the stack's **total** mana drain, not the per-unit upkeep.

### What Core did until now
`private.run_economy_impl` already charged army upkeep in gold/mana/population but, when mana was short, only recorded `MANA_SHORTFALL` with resolution `DEFERRED_UNTIL_CRISIS_PRIORITY_IS_VERSIONED`. Nothing was lost.

### The Arcanum rule
For each processed turn, if the mana left after income (capped by node capacity) is below the army mana upkeep:
1. Stacks with mana upkeep are ordered by **total drain** (`quantity × upkeep_mana`, largest first; ties by per-unit upkeep, then id).
2. Whole stacks are removed in that order **until the unpaid mana is covered** (so a small deficit costs one stack, a big one costs several).
3. Upkeep is recomputed from the remaining army, so gold/population upkeep fall too and the turn closes without a shortfall.
4. The loss is written to `economy_ledger.crisis_events` (`MANA_CRISIS`, resolution `STACKS_LOST`) and to `realm_events` (`MANA_CRISIS`), and `run_economy` returns it as `mana_crisis`.

Undisbandable stacks (Red Dragon, Demon Knight, Mind Ripper…) **can** be lost: they are the biggest drains and the player has no other way to get rid of them.

### Feature flag
`rulesets.config->>'mana_crisis'` (`'on'` / `'off'`). The migration does **not** switch it on, so applying it changes no behaviour. To enable:
```sql
update public.rulesets set config = jsonb_set(config, '{mana_crisis}', '"on"') where is_active;
```
To disable again set it to `"off"`.

### What the player sees
- `public.mana_crisis_preview()` → `{enabled, mana, army_mana_upkeep, would_lose_first[]}`. The Army view shows a **Riesgo de maná** panel only when the rule is on, listing which stacks would go first.
- The existing HUD mana alert (negative flow, turns left) keeps working.
- `public.my_recent_mana_crisis()` returns the caller's crises of the last 48 h (max 5); the client shows a toast once per event (it stores only the last seen event id, as UI state).

### Open decisions for the owner
- Switch the flag on only after players have had time to see the warning panel.
- Protecting new realms (e.g. no crisis during the first N turns) is not implemented.
- The rule can overshoot (it removes the whole stack even for a tiny deficit), exactly like the original.

## 2. Visible supporter badge
- `public.supporters_among(text[])` (≤ 200 names) returns `{lowercase mage name: tier}` for supporters who keep the badge visible. Existing ranking/profile functions are untouched.
- The client decorates every `[data-profile]` link in the view and the modal with a ✦ after one batched read (5-minute cache). No ranking or profile code was modified.
- Supporters can hide their badge: `set_supporter_badge_visible(boolean)`, a switch in **✦ Suerte y Apoyo**.
- Still not done: showing the supporter tier in the Discord roster for non-linked members, and per-guild supporting status.

## Deployment
Apply the migration after `20261001180000_luck_supporters_discord.sql`, run `supabase/tests/mana_crisis_badge.sql` (ends by raising an exception, never commits), then deploy the client. The client hides the new UI when the RPCs are missing, so the order is safe.
Rollback: `drop function` the four public RPCs and the two private helpers, and re-create `private.run_economy_impl` from the previous definition (the patch only adds the crisis block, three variables and the `mana_crisis` key).
