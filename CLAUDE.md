# CLAUDE.md — ARCANUM technical reference

> **Read this file before changing ARCANUM.**
>
> This document is the project-level context and change contract for Claude/AI-assisted development. It is intentionally concise enough to read on every task and points to deeper canonical docs where needed.

## 1. Project identity

ARCANUM is a persistent browser strategy/RPG with two connected layers:

- **The Arconte (player character):** personal progression, equipment, Arena/PvP, Expeditions/PvE, Events and discovered relics.
- **The Domain (realm):** economy, construction, resources, army, war and strategic reports.

These are related, but **the character and the Domain are not the same entity**. Never use the character name as a substitute for the Domain name or vice versa.

The player **is the Arconte**. The Domain belongs to that Arconte.

## 2. Current navigation/product direction

The intended hierarchy is:

1. **ARCONTE**
   - Personaje
   - Grimorio
   - Artefactos
2. **AVENTURA Y COMBATE**
   - Arena
   - Expediciones
   - Eventos
3. **REINO**
   - Dominio
   - Construcción
   - Economía
   - Mercado
   - Ejército
   - Guerra
   - Informes
4. **COMUNIDAD**
   - Comunidad
   - Ranking

Current product decisions:

- **Personaje is the default/main in-game page.**
- The old social profile and the character sheet are separate concepts. Do not collapse them into one screen.
- **Crónica is removed as a standalone navigation section.** Chronicle-like data may still exist as a derived/read model inside the character identity.
- **Taberna is intentionally hidden until its gameplay implementation is ready.** Do not re-enable it merely because code/assets still exist.
- Ranking should represent human players, not NPCs/bots, unless a future explicit design change says otherwise.


## 2A. Current product constraints

Read `docs/PRODUCT_DECISIONS.md` before changing authentication, onboarding, deployment assumptions, navigation, visual identity, or world/map direction.

Key constraints:

- immediate priority is a stable, playable public beta;
- registration is normal username + email + password, with **no invitation requirement**;
- entry screen primary actions are **ENTRAR** and **REGISTRO**;
- production deployment is Render;
- imported Drive documents under `docs/reference/` are continuity snapshots, not automatic authority;
- source precedence is defined in `docs/CONTEXT_SOURCES.md`.

## 3. Character art rules

ARCANUM uses five schools:

- **VIRIDIA** — green
- **AUREA** — white/light
- **CINERIA** — red
- **NADIR** — dark purple
- **ONEIRIA** — blue

Important distinctions:

- **Character body art** is used where a full character/sprite is appropriate.
- **Face portrait art** is used in profile/avatar/sidebar/social portrait contexts.
- Do not substitute a full-body image where the UI expects the face portrait.
- Player-uploaded profile art is not the current canonical direction for character identity. Prefer the school/level portrait system.
- Do not add experimental generated art into production unless the task explicitly asks for it and it has been validated visually.
- Preserve transparent backgrounds where assets were designed that way.

## 4. Relics / artifacts

Relics are intentionally mysterious.

- The player should not see a complete catalogue of undiscovered relics.
- Show discovered/owned relics and information legitimately revealed by gameplay.
- Do not expose a full spoiler list in normal player UI.
- Named relics and procedural inventory are distinct systems unless/until the canonical item model explicitly merges them.

See:
- `docs/ITEM_MODEL.md`
- `docs/LOOT_LOOP.md`
- `docs/ARCHMAGE_IDENTITY.md`

## 5. State authority: never invent client-side truth

The browser must **not** become the source of truth for progression, economy, possessions, ranked combat, rewards or competitive state.

Before changing stateful gameplay, read:

- `docs/STATE_AUTHORITY.md`
- `docs/ECONOMY_CONTRACT.md`
- `docs/ARCHMAGE_IDENTITY.md`

Rules:

1. Gameplay-changing data is server canonical unless explicitly documented otherwise.
2. Derived values may be recalculated in the client only when deterministic from canonical state.
3. `localStorage` is for UI preferences/cache/migrations only, never new gameplay authority.
4. Do not create a second independent player/Arconte model when the canonical server read model is available.
5. Do not guess resource production, rewards, combat results or inventory ownership in UI code.

### Supabase warning

ARCANUM has completed the critical Supabase separation work. The current runtime configuration in `assets/js/state.js` points ARCANUM APIs to project ref `mrmvmoyysxuopqexbxfk`.

**Do not trust an old hard-coded project URL, “Core/Nexo” ownership label, or stale historical documentation. NEXO is not a current ARCANUM backend/source of truth.** Before adding or changing any Supabase call:

- inspect `assets/js/state.js` and the existing API client,
- verify the current ARCANUM Edge Function/RPC that owns the endpoint,
- reuse the existing canonical client/configuration,
- never copy credentials or endpoints from another project.

## 6. Economy contract

Do not reinterpret resource semantics in the UI.

Canonical categories include:

- Turns = action budget
- Gold = reserve
- Mana = reserve + cap
- Population = reserve + capacity constraints
- Food = capacity, not an accumulating stock
- Research = action-driven flow, not passive inventory
- Land = space
- Ascendancy = derived indicator, not spendable

Read `docs/ECONOMY_CONTRACT.md` before changing the HUD, economy, construction, exploration, research or resource animations.

## 7. Character identity contract

Before touching Personaje, Arena, social profile links, equipment or combat identity, read `docs/ARCHMAGE_IDENTITY.md`.

Maintain these distinctions:

- Arconte aptitudes/progression vs duel combat characteristics.
- Duel Weapon vs physical inventory weapon.
- Character/Arconte identity vs Domain identity.
- Full inventory for owner vs limited equipped/public data for other players.
- Named relics vs procedural equipment until the canonical model says otherwise.

## 8. UI and regression discipline

ARCANUM is currently a tightly coupled client with a large `index.html` and production-sensitive interactions. A “small” edit can break unrelated screens.

For every meaningful UI/code change:

1. Inspect the existing implementation before editing.
2. Reuse current helpers/components/styles rather than creating a parallel system.
3. Keep desktop and mobile navigation in sync.
4. Check authenticated and unauthenticated/loading states where relevant.
5. Do not remove IDs/classes/functions without searching for all references.
6. Avoid broad search-and-replace edits on `index.html`.
7. Preserve accessibility labels and button semantics.
8. Verify that hidden/disabled product sections stay hidden/disabled.
9. Never ship literal escaped text such as `/n` or `\\n` into visible UI.
10. Do not add placeholder buttons that appear functional but have no working action.

## 9. Tests required before considering a change complete

The repository already contains smoke and Playwright tests.

Run, as appropriate:

```bash
npm test
npm run test:e2e
```

For live/deployment-sensitive work, also inspect the relevant live test in `tests/live.e2e.spec.mjs`.

A change is not complete just because the modified screen renders. Check for regressions in at least:

- Personaje
- Arena
- Expediciones
- Eventos
- Comunidad/social surfaces
- Dominio
- Mercado
- Ejército
- navigation/mobile layout

When the task fixes a regression, add or strengthen a test when practical.

## 10. Versioning, cache and deployment

ARCANUM uses explicit version/cache busting in production assets and has `version.json` plus package versioning.

When publishing a production-facing change:

- follow the repository's existing version/cache-bump convention,
- do not leave HTML/JS/CSS referencing inconsistent asset versions,
- avoid unnecessary multiple “release/bump/fix” commits for one logical change when one coherent commit is possible,
- confirm the deployed build actually contains the intended commit.

Production deployment for this project is **Render**, not Vercel, unless the infrastructure is deliberately changed later.

## 11. Mobile / APK

The project uses Capacitor for Android.

Relevant scripts:

```bash
npm run mobile:prepare
npm run android:sync
npm run android:build
```

Do not break browser behavior while fixing APK behavior, or vice versa. Mobile fullscreen/system-bar handling needs to be validated on-device or with the closest available Android verification path.

## 12. Change protocol for Claude

Before changing code:

1. Read this file.
2. Inspect the current code paths involved.
3. Read the relevant canonical document(s) in `docs/`.
4. Inspect recent commits if the area has been actively modified.
5. Identify which state is authoritative before writing data.

While changing code:

- make the smallest coherent change,
- preserve existing working behavior outside scope,
- do not silently resurrect removed/hidden features,
- do not invent new game rules to fill missing backend behavior,
- do not overwrite user-approved art with generated placeholders.

After changing code:

- run relevant tests,
- inspect the exact diff,
- verify no unrelated files changed,
- verify version/cache behavior if production-facing,
- summarize what changed and any unresolved risk.

## 13. Canonical documentation index

Read these instead of reverse-engineering game rules from UI labels:

- `docs/STATE_AUTHORITY.md` — ownership/source of truth for state
- `docs/ECONOMY_CONTRACT.md` — resource and economy semantics
- `docs/ARCHMAGE_IDENTITY.md` — canonical player/character identity
- `docs/ITEM_MODEL.md` — item/equipment model
- `docs/LOOT_LOOP.md` — loot progression loop
- `docs/PVE_EXPEDITIONS.md` — PvE/Expeditions
- `docs/archmage-progression.md` — progression details
- `docs/PRODUCT_DECISIONS.md` — explicit current product decisions and handoff context
- `docs/CONTEXT_SOURCES.md` — source precedence and imported Drive snapshot index
- `docs/reference/` — historical/design snapshots imported from the ARCANUM Drive project

If code and documentation conflict, **do not guess**. Prefer the newest explicit product decision plus the current server contract, then update the stale documentation as part of the same change.

## 14. High-risk areas

Treat these as regression-prone:

- Supabase project/function routing
- authentication/session-dependent requests
- Personaje vs social-profile routing
- school/level portrait selection
- Arena authoritative state
- inventory/equipment
- resource HUD/economy calculations
- mobile navigation/fullscreen behavior
- cache-busted asset paths
- large edits to `index.html`

When working in one of these areas, inspect recent commits first.

---

**Last project-context refresh:** 2026-10-01.

This file should evolve with ARCANUM. When a product or architecture decision becomes stable, update this reference in the same pull request/commit so future agents do not work from archaeological sediment.
