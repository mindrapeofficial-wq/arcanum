# ARCANUM — Personal PvE Expeditions

Status: beta 0.3.7.

## Purpose

Expeditions are the repeatable personal PvE loop for the Archmage.

They use the same canonical identity as Arena:
- intrinsic combat profile,
- equipped procedural Gear,
- active compatible Relic.

There is no separate PvE character.

## First expedition

### Ruinas del Umbral

Four sequential encounters:

1. Vigilante de Ceniza — Cineria.
2. Tejedora del Velo — Oneiria.
3. Custodio Marchito — Viridia.
4. El Cartógrafo Hueco — Nadir — expedition boss.

The first implementation deliberately uses one compact expedition so balance, persistence and rewards can be validated before adding many locations.

## Persistent run state

Table: `arcanum_pve_runs`.

A run stores:
- player,
- expedition,
- difficulty,
- current stage,
- current and maximum HP,
- deterministic seed,
- frozen profile snapshot,
- frozen combat snapshot,
- frozen item/relic combat bonuses,
- last enemy,
- last combat log,
- last loot result,
- start/update/expiry/completion timestamps.

Only one live run can exist per player.

A run expires after 24 hours.

## Locked loadout

When a run starts, the server snapshots:
- combat evolution,
- Gear combat bonuses,
- compatible active Relic bonus,
- Archmage level.

Changing equipment outside the expedition does not alter a run already in progress.

This prevents:
- changing Gear between rooms to manipulate HP,
- swapping a Relic for every encounter,
- gaining a level elsewhere and retroactively improving the current run.

Gear dropped by the expedition also uses the level captured when the run began.

## Health persistence

The player begins at the authoritative maximum HP derived from the frozen loadout.

After every victory:
- remaining HP is stored,
- the next fight begins with that HP,
- enemy HP resets because each room is a new enemy.

There is no free heal between rooms.

Defeat ends the run.

Retreat ends the run voluntarily and preserves all Gear already earned.

## Turn cost

Every room attempt costs exactly 1 Turn.

Starting or retreating does not cost a Turn.

The Turn is spent server-side only after the room has been locked for combat.

## Fight locking

A live run can be:
- `active`
- `fighting`

Before combat, the server atomically changes the run from `active` to `fighting`.

Only the request that obtains this lock may spend the Turn and simulate the encounter.

This protects against:
- double clicks,
- duplicated HTTP requests,
- two tabs resolving the same room.

A stale `fighting` lock older than 60 seconds is recoverable back to `active`.

## Difficulty

### I · Incursión
Minimum level 1.

### II · Profundidad
Minimum level 5.

### III · Abismo
Minimum level 10.

Higher difficulty:
- raises enemy scaling,
- raises Gear drop chance in normal rooms,
- improves rarity weights,
- strongly improves boss rarity weights.

## Enemy generation

Enemies use the same combat engine as player duels.

Each enemy receives:
- a deterministic combat identity generated from run seed + room,
- its school,
- scaling derived from player entry level,
- difficulty offset,
- room progression,
- additional boss scaling for the final encounter.

The combat log therefore uses the same hit, dodge, block, regeneration, critical, poison, weapon and ability rules already used by the canonical combat system.

## Gear rewards

Every cleared room may create one verified `pve` loot claim.

Normal rooms:
- Chamber I: base 28% chance.
- Chamber II: base 36%.
- Chamber III: base 48%.
- difficulty adds +8 percentage points per tier above I.

Final boss:
- Gear is guaranteed.

Rarity weights rise with difficulty.

Boss rewards deliberately exclude Common items.

Every item records:
- source `pve`,
- run + room source reference,
- PvE reward tier,
- claim timestamp.

The existing pending-inventory mechanism applies. A full bag cannot delete an expedition reward.

## Initial reward tiers

- `pve_room` — normal Incursion room.
- `pve_depth` — Profundidad room.
- `pve_abysm` — Abismo room.
- `pve_boss` — Incursion boss.
- `pve_boss_depth` — Profundidad boss.
- `pve_boss_abyss` — Abismo boss.

## Server authority

Client responsibilities:
- show catalog,
- request start,
- request fight,
- request retreat,
- render result.

Server responsibilities:
- difficulty eligibility,
- one-live-run rule,
- loadout snapshot,
- persistent HP,
- room sequence,
- Turn spending,
- fight lock,
- enemy construction,
- combat result,
- Gear claim,
- item level,
- run completion.

The browser never chooses the winner, remaining HP, enemy stats, rarity or reward eligibility.

## Expansion rules

Future expeditions may add:
- branching rooms,
- camps or limited healing,
- curses,
- random encounters,
- treasure rooms,
- elite enemies,
- expedition-specific Relics,
- first-clear rewards,
- seasonal modifiers.

They must still use the canonical run state, combat identity and verified loot pipeline rather than inventing a second PvE inventory or combat model.


## Between-room decisions

After every non-boss victory, the run pauses before the next room.

The server offers exactly three explicit choices:

### Descender al Umbral
- no immediate HP change;
- normal enemy scaling;
- normal Gear chance and rarity.

### Buscar un santuario
- restore 18% of maximum HP, capped at maximum;
- next room Gear chance -10 percentage points;
- rarity weights shift slightly downward.

### Forzar el Umbral
- next enemy combat stats ×1.15;
- next room Gear chance +18 percentage points;
- rarity weights shift upward.

Choosing does not consume a Turn.

The chosen modifier is stored server-side and consumed by the next room. It cannot be edited by the browser.

The choice is recorded in `decision_history` with:
- stage,
- choice,
- HP before/after,
- next room,
- applied modifiers,
- timestamp.

The next room is previewed before the choice. This makes the trade-off legible without revealing the exact combat result.

The boss is still mandatory. The final boss has guaranteed Gear; the risk choice before it affects rarity rather than the already-guaranteed drop chance.

Design rule: the options are intentionally incomparable. Recovery sacrifices loot quality, aggression increases danger for better loot, and steady descent preserves both at baseline.
