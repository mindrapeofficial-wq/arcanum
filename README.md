# ARCANUM: Las Cinco Escuelas

Persistent browser strategy/RPG in public beta.

- Production beta: https://arcanum-las-cinco-escuelas.onrender.com/
- Current release metadata: `version.json`
- Canonical AI/developer handoff: `CLAUDE.md`
- Backend authority: ARCANUM Supabase project configured in `assets/js/state.js`
- Android wrapper: Capacitor
- Deployment: Render

## Product model

The player is the **Arconte**. The Arconte has personal progression, equipment and personal combat. The **Domain/Reino** is the Arconte's persistent strategic realm, with economy, construction, army, war and reports.

The project deliberately keeps personal power and realm strategy as connected but distinct layers.

## Repository shape

- `index.html` — main application shell and production-sensitive markup
- `assets/js/` — client systems
- `assets/css/` — UI styles
- `assets/art/`, `assets/ui/`, `assets/audio/` — production assets
- `supabase/functions/` — Edge Functions
- `supabase/migrations/` — backend schema/rules evolution
- `supabase/tests/` — SQL/core verification
- `tests/` — smoke, live and Playwright tests
- `docs/` — canonical gameplay/architecture contracts
- `docs/reference/` — snapshots imported from the project's Google Drive for historical/design context

## Before changing anything

Read `CLAUDE.md`.

For product-level decisions, also read `docs/PRODUCT_DECISIONS.md` and `docs/CONTEXT_SOURCES.md`.

For stateful gameplay, use the canonical contracts in `docs/`; do not reconstruct rules from old UI strings or historical snapshots.

## Tests

```bash
npm test
npm run test:e2e
```

Android:

```bash
npm run mobile:prepare
npm run android:sync
npm run android:build
```

## Context rule

The reference snapshots under `docs/reference/` are intentionally kept in the repository so cloud coding agents can understand the project's older design material without access to the user's Drive. They are **reference**, not automatic authority. Newer migrations, current runtime contracts, `CLAUDE.md`, and canonical docs win when there is a conflict.
