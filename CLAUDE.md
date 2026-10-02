# CLAUDE.md — ARCANUM rebuild technical reference

> Read this file before changing ARCANUM on the rebuild branch.
>
> This branch replaces the previous character-centric product direction. If an older document conflicts with this file or `docs/REBUILD_ARCHIMAGO.md`, the rebuild direction wins.

## 1. Product identity

ARCANUM is a persistent browser strategy game centred on the player's **Domain**.

The player is still an **Arconte** in the fiction, but there is no standalone character-progression product layer in this rebuild. The strategic Domain is the canonical gameplay surface.

Five schools remain canonical:

- VIRIDIA — green
- AUREA — white/light
- CINERIA — red
- NADIR — dark purple
- ONEIRIA — blue

Player-facing terminology must use ARCANUM names. Legacy Archimago identifiers may survive internally only when required for compatibility and must never leak into visible UI.

## 2. Rebuild source and architecture

The functional source is `mindrapeofficial-wq/archimago`, fixed initially at commit:

`e84237e6a7624c0be71cce6a92cbabbe81471a9f`

A staged snapshot lives under:

`rebuild/archimago-source/`

Imported core packages:

- `packages/shared`
- `packages/data`
- `packages/data-adapter`
- `packages/engine`
- `packages/server`

The source project is TypeScript with a Vue 3 client. ARCANUM may reuse its functionality, data model and engine while presenting it through ARCANUM's own visual language.

## 3. Navigation and product direction

**Dominio is the main/default in-game page.**

Target top-level surfaces:

1. Dominio
2. Economía
3. Construcción
4. Exploración
5. Investigación
6. Magia
7. Ejército
8. Mercado
9. Clasificación
10. Comunidad
11. Chat

Additional pages are allowed when required to expose imported systems completely, but they must fit this Domain-first hierarchy.

## 4. Explicitly removed systems

Do not restore or rebuild these as player-facing features:

- Personaje page
- character equipment/progression layer
- Arena
- duels
- individual PvP
- ELO for individual PvP
- direct player-vs-player attack preparation/results flows
- character portrait/profile mechanics as a gameplay requirement

The imported battle engine is **not deleted**. Keep it available for non-individual-PvP use such as PvE, world encounters, domain wars, alliance conflict or future strategic combat.

Legacy code or docs describing Personaje/Arena may remain temporarily during migration, but they are non-authoritative and should not be reconnected to navigation.

## 5. Systems to reach functional parity with the imported engine

Preserve and integrate, unless explicitly excluded above:

- turns
- land/exploration
- economy and reserves
- construction/destruction
- mana generation/storage
- research
- spells and dispels
- army recruitment/disbanding
- units
- items
- unique items/relic equivalents
- defensive configuration where useful outside individual PvP
- market
- kingdom/domain status
- rankings that do not rank individual PvP performance
- server/API
- persistence/data adapter
- engine tests and deterministic calculations

## 6. Rebranding contract

All player-facing inherited terminology must be rewritten into original ARCANUM terminology, including:

- world terms
- school names
- units
- spells
- items
- unique items/relics
- buildings when appropriate
- events
- resources where ARCANUM already has canonical terms
- categories
- help/guide text
- server messages
- route/page labels

Do not perform unsafe blind search-and-replace on internal identifiers. Prefer display-name maps or data migration when internal IDs are referenced by engine logic.

Canonical ARCANUM economy concepts currently include:

- Turns = action budget
- Gold = reserve
- Mana = reserve + cap
- Population = reserve + capacity constraints
- Food = capacity
- Research = action-driven flow
- Land = space
- Ascendancy = derived indicator, not spendable

For example, the imported visible term “Geld” should map to ARCANUM's canonical Gold economy rather than creating a new resource.

## 7. Relics and items

Relics remain intentionally mysterious.

- Do not expose a complete spoiler catalogue of undiscovered relics in normal player UI.
- Imported unique items can provide mechanics, but their visible names/lore must become ARCANUM originals.
- Preserve discovered/owned-only presentation for named relics unless a later explicit design change says otherwise.

Relevant legacy docs such as `docs/ITEM_MODEL.md` and `docs/LOOT_LOOP.md` may still contain useful constraints, but character-layer assumptions are superseded by this rebuild.

## 8. State authority

The browser must not become the source of truth for progression, economy, possessions, rewards or competitive state.

Rules:

1. Gameplay-changing data is server canonical unless explicitly documented otherwise.
2. Derived values may be recalculated client-side only when deterministic from canonical state.
3. `localStorage` is for UI preferences/cache/migrations only.
4. Reuse one canonical Domain/player state model; do not create parallel gameplay truth.
5. Do not guess resource production, rewards, combat results or inventory ownership in UI code.

ARCANUM's existing Supabase history must not be copied blindly into the imported engine. Verify the active backend strategy before wiring production persistence.

## 9. Community and chat

Community and Chat are retained from ARCANUM.

The imported Archimago client/server does not replace them. Integrate them with the rebuilt navigation and authentication/state layer without bringing back the retired social-character/PvP model.

## 10. UI and assets

ARCANUM branding has priority:

- keep the ARCANUM name and logo;
- keep useful existing ARCANUM layout/components;
- prefer ARCANUM assets over imported generic images;
- use imported Vue screens as functional references, not as final art direction;
- add pages needed for parity rather than hiding engine functionality.

Do not ship source-project branding or visible legacy terminology.

## 11. Tests and CI

Existing ARCANUM smoke tests remain relevant while legacy code is present.

The rebuild branch also validates the imported workspace in `.github/workflows/core-ci.yml`.

Before treating a migration step as complete:

- run/inspect existing ARCANUM tests;
- typecheck the imported core;
- add parity tests for migrated mechanics;
- verify the relevant UI route;
- do not merge the rebuild PR until the replacement path is coherent.

## 12. Deployment

Production deployment remains Render unless deliberately changed.

Do not deploy the rebuild branch over production merely because an individual subsystem compiles. PR #51 stays the integration boundary until the Domain-first replacement is ready.

## 13. Canonical rebuild docs

Read together:

- `docs/REBUILD_ARCHIMAGO.md`
- `docs/ARCHIMAGO_PARITY_MATRIX.md` once present
- this file

These documents override older product-direction statements about Personaje, Arena or individual PvP on the rebuild branch.
