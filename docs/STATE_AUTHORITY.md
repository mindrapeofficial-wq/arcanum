# ARCANUM — State Authority Map

Status: Consolidation 0.3.0

## Rule

Every datum belongs to exactly one of three classes:

1. **SERVER_CANONICAL** — progression, economy, ownership, competitive state, rewards, social state, world state.
2. **DERIVED** — values that can be deterministically recalculated from canonical state and rules.
3. **LOCAL_ONLY** — presentation preferences, caches and tutorial/UI state. Losing these must never change the player's power or possessions.

The browser is never allowed to be the source of truth for progression or competition.

## Current map

| Domain | Data | Authority | Status |
| --- | --- | --- | --- |
| Realm | gold, mana, population, land, turns, buildings, research, army, war | Core Supabase | SERVER_CANONICAL |
| Archmage progression | XP, level, four core attributes, attribute points | Core Supabase | SERVER_CANONICAL |
| Market | offers and resource settlement | Core Supabase RPC | SERVER_CANONICAL |
| Community | chat, board, presence | Nexo Supabase | SERVER_CANONICAL |
| Social | friends, DMs, alliances, profile/bio | Core Supabase | SERVER_CANONICAL |
| Artifacts | ownership, unique relics, artifact market/history | Nexo Supabase | SERVER_CANONICAL |
| World Boss | event state, attacks, participants | Nexo Supabase | SERVER_CANONICAL |
| Combat identity | base stats, weapon, trait, abilities, evolution choices | Nexo Supabase / arcanum-state | SERVER_CANONICAL since 0.3.0 |
| Arena | daily seals, rating, wins/losses, history, duel result | Nexo Supabase / arcanum-state | SERVER_CANONICAL since 0.3.0 |
| Combat derived stats | HP, attack, armor, speed, crit, dodge, block | Recalculated from combat profile | DERIVED |
| Passive resource animation | interpolated per-second display | Browser cache | DERIVED / presentation only |
| Procedural inventory | items, equipment, loot rolls | Nexo Supabase / arcanum-state | SERVER_CANONICAL since 0.3.1 |
| Audio settings | volumes, mute | Browser localStorage | LOCAL_ONLY |
| Tutorial completed | tutorial marker | Browser localStorage | LOCAL_ONLY |
| Online panel collapsed | UI preference | Browser localStorage | LOCAL_ONLY |
| Oracle/AI history cache | local convenience cache | Browser localStorage | LOCAL_ONLY / cache |
| Army generated art cache | image cache | Browser localStorage | LOCAL_ONLY / cache |
| Auth session | access/refresh token | Browser localStorage | Authentication transport, not game authority |

## 0.3.0 changes

- Added protected server tables for combat profiles, Arena state and Arena matches.
- Added the `arcanum-state` Edge Function with custom validation against the Core ARCANUM identity.
- Combat base generation now has a canonical server implementation.
- Evolution choices are validated and written by the server.
- Existing local evolution choices can be imported once, but only when their option IDs match the deterministic server choices for that level.
- Arena daily reset uses server time in Europe/Madrid, not the player's device clock.
- Ranked and friendly duel outcomes are simulated on the server with a stored deterministic match seed.
- Rating, record, seals and combat history are now server data.
- The client no longer writes Arena progression to localStorage.
- `combat-profile.js` uses server state as its runtime authority. The former localStorage profile is read only as a one-time migration source.

## Next migration inside Point 1

**Procedural inventory is the remaining critical local authority.**

It currently changes combat statistics while items, rolls and equipment are stored in localStorage. It must be migrated before equipment is allowed to affect authoritative ranked combat.

Required next steps:

1. Server tables for inventory items and equipped slots.
2. Server-side item generation / roll validation.
3. One-time beta migration policy for existing local items.
4. Equip, unequip and destroy as authenticated server mutations.
5. Arena reads equipment bonuses only from verified server inventory.
6. Remove all inventory writes to localStorage.

After inventory, audit any remaining gameplay-changing local state and enforce a CI test that fails when new gameplay code introduces localStorage as an authority.
