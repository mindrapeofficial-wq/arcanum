# ARCANUM — Current Product Decisions

Last consolidated: 2026-10-01.

This file records explicit product decisions and continuation context that cloud coding agents should preserve.

## Priority

The immediate priority is a **playable, stable public beta**. Do not divert the project into a Codex/wiki, lore browser, redesign exercise, or speculative rewrite while core beta flows still need work.

The essential loop is:

`enter -> authenticate -> create/load Arconte + Domain -> understand state -> spend/regenerate turns -> economy/construction/research -> recruit/army -> personal or realm combat -> leave -> return with persistent state intact`

## Identity

- Product name: **ARCANUM: Las Cinco Escuelas**.
- The player **is the Arconte**.
- The Domain/Reino belongs to the Arconte. Character identity and realm identity are not interchangeable.
- Five schools remain core to the product.
- Personaje is the default/main in-game page unless a later explicit decision changes it.

## Authentication and entry screen

Current product requirement:

- Normal registration, **no invitation requirement**.
- Registration fields: **Nombre de Usuario, email, contraseña**.
- Entry screen should expose the two primary actions **ENTRAR** and **REGISTRO**.
- Do not restore invitation gating or removed narrative copy just because old code/functions still exist.
- `supabase/functions/register-with-invite/` is legacy material unless explicitly reactivated by a later product decision.

## Backend and persistence

ARCANUM currently uses its own Supabase project, configured in `assets/js/state.js`.

Current project ref:

`mrmvmoyysxuopqexbxfk`

All current ARCANUM APIs in the runtime config point to this project. **NEXO is not a current ARCANUM backend/source of truth.** Any older documentation that labels ARCANUM systems as being owned by “Nexo Supabase” is stale and must be interpreted as historical pre-separation language.

Never introduce a second backend authority for the same state domain.

## Deployment

- Production beta is hosted on **Render**.
- Public beta URL: https://arcanum-las-cinco-escuelas.onrender.com/
- Do not switch deployment assumptions to Vercel unless deliberately requested.

## Visual identity

- Canonical logo direction is the transparent ARCANUM logo. The repository already contains `logo.png`; do not replace approved art with generated placeholders.
- Preserve the five-school color/portrait rules documented in `CLAUDE.md` and the Art Bible snapshot.
- Full-body character art and face/profile portrait art are separate uses.

## Navigation and hidden systems

Preserve the current hierarchy in `CLAUDE.md`.

Important current constraints:

- Crónica is not a standalone navigation section.
- Taberna remains hidden until its gameplay is genuinely ready.
- Ranking should represent human players, not NPC/system accounts.
- Social profile and character sheet remain distinct concepts even when they share canonical Arconte identity data.

## World/map direction

A larger persistent-world/map direction is being explored. A **450 × 450 ARCANUM map** has been explicitly discussed/requested, but its exact grid rules, travel model and strategic consequences are not yet a canonical gameplay contract in this repository.

Treat 450 × 450 as a design target/context note, not permission to invent movement, tile ownership, travel timers or procedural-world rules without an explicit design decision and tests.

## Development behavior expected from cloud agents

Before implementing a feature:

1. Inspect current code and recent migrations/commits.
2. Identify the authoritative server state.
3. Read the relevant canonical docs.
4. Prefer small coherent changes over parallel systems.
5. Preserve working beta behavior outside scope.
6. Add/strengthen tests for regressions where practical.
7. Update documentation when a decision becomes canonical.

When information is missing, mark the gap instead of inventing game rules.
