# ARCANUM — Domain Core Rebuild

Status: canonical rebuild direction, 2026-10-02.

## Goal

Rebuild ARCANUM around the deep browser-strategy loop of classic Archmage-like games while preserving ARCANUM's own world, terminology, visual identity, backend, community and assets.

The external repository `mwdchang/archmage-reimagined` is a **reference for feature coverage and architecture only**. It currently declares no repository license on GitHub, so its source code, data files, names, prose and assets must not be copied into ARCANUM unless a compatible license is later verified. Mechanics and architectural ideas may be independently reimplemented.

## Product boundary

### Keep
- ARCANUM name, logo and approved visual language.
- The five schools: Viridia, Aurea, Cineria, Nadir and Oneiria.
- Existing high-quality ARCANUM assets.
- Supabase as authoritative persistent backend.
- Render production deployment.
- Community, presence and chat.
- Domain/realm identity and strategic ranking.
- Strategic realm-vs-realm war.

### Remove
- Standalone Personaje page.
- Character-sheet progression as a primary game loop.
- Individual Arena/PvP duels.
- Character ELO and duel-only ranking.
- Duel weapon/evolution systems whose only purpose is individual PvP.
- Navigation that treats Personaje as the home page.

### Rebuild / expand
- Dominio dashboard.
- Exploration and land growth.
- Construction and demolition.
- Economy and upkeep.
- Research and spellbook.
- Recruitment, army management and disbanding.
- Strategic magic and enchantments.
- Market and trade.
- Realm-vs-realm war and battle reports.
- Rankings.
- World events and PvE where they reinforce the strategic domain loop.
- Alliances/community systems.
- New pages required by these systems.

## Architecture

ARCANUM should move toward clear module boundaries:

1. **domain-data**
   - Schools, buildings, units, spells, items/relics, events and balancing tables.
   - ARCANUM-original names and descriptions only.

2. **domain-engine**
   - Pure deterministic rules: turn costs, production, upkeep, exploration, research, recruitment, combat calculations and effects.
   - Must be testable without browser or Supabase.

3. **domain-server**
   - Supabase functions/RPCs as authoritative mutation boundary.
   - Authentication, anti-cheat validation, persistence, season rules and audit trail.

4. **domain-client**
   - Existing ARCANUM interface and assets, progressively refactored.
   - The client renders state and submits intents. It must not become an alternative rules authority.

5. **community**
   - Presence, chat, social profiles and alliances remain separate from strategic simulation rules.

## Naming rule

No user-facing system should inherit Archmage Reimagined terminology by default.

Every imported *concept* receives an ARCANUM-native name before becoming canonical. This applies to:
- resources;
- buildings;
- units;
- spells;
- artifacts/relics;
- skills;
- statuses;
- battle actions;
- events;
- ranks;
- world locations;
- factions/schools.

Existing ARCANUM names have priority over newly coined terms.

## Initial navigation

### Reino
- Dominio
- Construcción
- Economía
- Mercado
- Ejército
- Grimorio / Investigación
- Guerra
- Informes
- Ranking

### Mundo
- Exploración
- Eventos
- Expediciones or successor strategic PvE page
- future world/map pages

### Comunidad
- Comunidad
- Chat
- Alianzas
- social ranking/profile surfaces where useful

Personaje and Arena are not navigation destinations.

## Migration strategy

The rebuild is incremental rather than a production rewrite.

1. Freeze old Personaje/Arena entry points.
2. Make Dominio the canonical landing page.
3. Define ARCANUM-native data catalogs and naming.
4. Extract deterministic game rules into testable modules.
5. Replace legacy browser-side authority with server-authoritative mutations.
6. Rebuild one strategic loop at a time: exploration -> economy -> construction -> research -> army -> war.
7. Integrate market, events, alliances and world systems.
8. Delete obsolete character/Arena code only after no live dependency remains.
9. Run regression tests and deploy from the rebuilt branch through normal review.

## First milestone

A player can:
- register/login;
- found a Domain and choose a School;
- land on Dominio;
- spend/regenerate turns;
- explore;
- construct;
- produce resources;
- research;
- recruit/manage an army;
- attack another Domain strategically;
- inspect reports/ranking;
- use Community/chat;
- log out and return with state intact.

That milestone is the new definition of ARCANUM's core game.
