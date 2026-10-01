# ARCANUM — Context Sources and Precedence

Last consolidated: 2026-10-01.

Cloud coding agents do not automatically have access to the user's ChatGPT project or Google Drive. This repository therefore carries both canonical docs and imported Drive snapshots.

## Precedence when sources disagree

Use this order:

1. **Current server implementation and newest Supabase migrations/functions**
2. **Current runtime client contract/configuration**
3. **`CLAUDE.md` and canonical docs under `docs/`**
4. **`docs/PRODUCT_DECISIONS.md`**
5. **Newest repository commit/release notes**
6. **Drive snapshots under `docs/reference/`**
7. Old UI labels, comments, abandoned functions or historical assumptions

Do not silently merge contradictory rules. Resolve the conflict, update the stale doc, and keep one source of truth.

## Google Drive project source

Folder: **ARCANUM - Las Cinco Escuelas**

https://drive.google.com/drive/folders/14MyjZBzQO_w_T3XEQlUYq1ausGVTjSEj

### Imported text snapshots

- `docs/reference/GAME_BIBLE_DRIVE_SNAPSHOT.md`
  - Source: “00 - Biblia de ARCANUM - Reglas y Mecánicas”
  - https://docs.google.com/document/d/1b-Qu17_mGLNgBfOsa9WiHBCl1yuv0BNp7zEWm7OcEzs/edit
- `docs/reference/CORE_TEST_SUITE_DRIVE_SNAPSHOT.md`
  - Source: “01 - Test Suite de ARCANUM Core Rules”
  - https://docs.google.com/document/d/1fPnBYLLOiGBBo8oDWValeJBKEJuUpgfwjAbTRX5rENY/edit
- `docs/reference/ART_BIBLE_DRIVE_SNAPSHOT.md`
  - Source: “00 - Art Bible de ARCANUM - Dirección de Arte”
  - https://docs.google.com/document/d/1RBb8EcEaMygOfB_v2c4y-S62SlU_Fxoh84xRB-s7H54/edit
- `docs/reference/SIMULATOR_ECONOMY_DRIVE_SNAPSHOT.md`
  - Source: “Economy Simulator v0.2 - Estado técnico”
- `docs/reference/SIMULATOR_BATTLE_DRIVE_SNAPSHOT.md`
  - Source: “Battle Simulator v0.5 - Estado técnico”
- `docs/reference/SIMULATOR_REALM_DRIVE_SNAPSHOT.md`
  - Source: “Realm Simulator v0.6 - Estado técnico”
- `docs/reference/CHANGELOG_2026-10-01_DRIVE_SNAPSHOT.md`
  - Source: “2026-10-01 - Registro de cambios desde la última sincronización”
- `docs/reference/ART_ASSET_CATALOG_2026-10-01_DRIVE_SNAPSHOT.md`
  - Source: “2026-10-01 - Catálogo de nuevos recursos gráficos”

These are snapshots for continuity. They are not live-synced automatically.

## Assets

The Drive project also contains the approved logo, school sigils, construction icons, resource icons and character art. Most of the production assets are already represented under `assets/` in this repository. Prefer repository assets in code so cloud sessions remain self-contained.
