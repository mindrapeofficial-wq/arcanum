# Deployment: Reincarnation phases 1, 2a, 2b, 2c

Status of the live ARCANUM Supabase project (`mrmvmoyysxuopqexbxfk`), 2026-10-01: **the three migrations below are applied** (by the owner, in order) and verified: 8 tables, 14 public functions, the four Core patches and the `PILLAGE` mode constraint exist; `luck_supporters.sql`, `damage_protection` and both `pillage.sql` blocks pass against production and roll back, leaving no rows.

Caveats: they were applied outside `apply_migration`, so `supabase_migrations.schema_migrations` has no entry for them (latest is `20261001144852`). Pending: Edge Functions (`arcanum-discord`, `arcanum-admin`), Discord application and secrets, and the Render deploy of 0.3.41. Note: the Supabase MCP `execute_sql`/`apply_migration` tools hang on statements containing `delete` (a confirmation that never arrives), so apply such SQL from the dashboard.

## Order (each step depends on the previous one being verified)
1. `20261001180000_luck_supporters_discord.sql` (phase 1: Lady Luck, supporters, Discord).
   Then run `supabase/tests/luck_supporters.sql` (ends by raising an exception: it never commits).
2. `20261001190000_damage_protection_meditation.sql` (2b + 2c; independent of step 1, but ship together to keep one version, 0.3.41).
   Then run `supabase/tests/damage_protection.sql` (same: always rolls back; must end with `ALL_PASSED_ROLLBACK`).
2b. `20261001200000_pillage.sql` (2a; **must come after 2b/2c**: it patches the same function and calls `attack_shield_allows`).
   Then run the two blocks of `supabase/tests/pillage.sql` as separate statements.
3. Edge Functions: `arcanum-discord` (new) and `arcanum-admin` (new actions `supporter:grant`, `luck:grant`). Secrets: see `LUCK_AND_SUPPORT.md` §4.
4. Register slash commands with `scripts/register-discord-commands.mjs`.
5. Deploy the client (Render) only after the migrations: the UI hides itself when the RPCs are missing, so order is safe, but 0.3.41 is what reads them.

## Why the migrations are safe to apply
- Both patch live function text (`attack_mage_impl`, `attack_targets_impl`, `explore_impl`, `cast_summon_impl`) and **abort without changes if the deployed text is not what they expect**. Both are idempotent.
- Both were dry-run against the live database inside a force-rolled-back transaction; nothing persisted.
- New tables have RLS and no player grants. Players only get `my_*` read RPCs, `start_meditation` and the link-code flow.

## Rollback
- 2b/2c: `drop table public.realm_shields cascade;` removes the shields; to unpatch combat, re-create `private.attack_mage_impl` / `attack_targets_impl` from the previous definition (the checks reference `private.attack_shield_allows`, which must exist while the patched text is live, so drop it last).
- Phase 1: see the migration header; luck checks in `explore_impl` / `cast_summon_impl` reference `private.luck_active`, drop it last.
- Take a `pg_get_functiondef` snapshot of the four patched functions before applying, so a rollback is a copy-paste.

## Post-deploy checks
- `select to_regclass('public.realm_shields')` is not null; `select position('apply_damage_protection' in pg_get_functiondef('private.attack_mage_impl(text,text)'::regprocedure))` > 0.
- In the game: Guerra shows the shield panel; a meditating account is not attackable and cannot attack; `/suerte` in Discord grants luck once per Madrid day.
- Confirm the Render build serves 0.3.41 (`version.json`).
