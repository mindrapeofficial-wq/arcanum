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
| Realm | gold, mana, population, land, turns, buildings, research, army, war | ARCANUM Supabase | SERVER_CANONICAL |
| Archmage progression | XP, level, four core attributes, attribute points | ARCANUM Supabase | SERVER_CANONICAL |
| Market | offers and resource settlement | ARCANUM Supabase RPC | SERVER_CANONICAL |
| Community | chat, board, presence | ARCANUM Supabase | SERVER_CANONICAL |
| Social | friends, DMs, alliances, profile/bio | ARCANUM Supabase | SERVER_CANONICAL |
| Artifacts | ownership, unique relics, artifact market/history | ARCANUM Supabase | SERVER_CANONICAL |
| World Boss | event state, attacks, participants | ARCANUM Supabase | SERVER_CANONICAL |
| Combat identity | base stats, weapon, trait, abilities, evolution choices | ARCANUM Supabase / arcanum-state | SERVER_CANONICAL since 0.3.0 |
| Arena | daily seals, rating, wins/losses, history, duel result | ARCANUM Supabase / arcanum-state | SERVER_CANONICAL since 0.3.0 |
| Combat derived stats | HP, attack, armor, speed, crit, dodge, block | Recalculated from combat profile | DERIVED |
| Passive resource animation | interpolated per-second display | Browser cache | DERIVED / presentation only |
| Lady Luck (expiry, source, log) | 24 h favour granted by Discord/admin; modifies summoning and exploration in the Core | ARCANUM Supabase (`arcanum_luck`) | SERVER_CANONICAL since 0.3.39 |
| Supporting status | credit points, tier, ledger, private notes | ARCANUM Supabase (`arcanum_supporters`, `arcanum_player_notes`) | SERVER_CANONICAL since 0.3.39 |
| Discord link | Discord id ↔ Arconte, one-time link codes, daily claim day | ARCANUM Supabase (`arcanum_discord_links`) | SERVER_CANONICAL since 0.3.39 |
| Shields (damage protection, meditation) | 24 h shield after >30% army loss; 3-day opt-in meditation, 14-day cooldown | ARCANUM Supabase (`realm_shields`) | SERVER_CANONICAL since 0.3.40 |
| Procedural inventory | items, equipment, loot rolls | ARCANUM Supabase / arcanum-state | SERVER_CANONICAL since 0.3.1 |
| Mana crisis rule and losses | ruleset flag, removed stacks, ledger/event rows | Core Supabase (`rulesets.config`, `economy_ledger`, `realm_events`) | SERVER_CANONICAL since 0.3.45 |
| Supporter badge visibility | `arcanum_supporters.badge_hidden` | Core Supabase | SERVER_CANONICAL since 0.3.45 |
| Last seen mana-crisis event id | avoids repeating the toast | Browser localStorage | LOCAL_ONLY |
| Audio settings | volumes, mute | Browser localStorage | LOCAL_ONLY |
| Tutorial completed | tutorial marker | Browser localStorage | LOCAL_ONLY |
| Online panel collapsed | UI preference | Browser localStorage | LOCAL_ONLY |
| Oracle/AI history cache | local convenience cache | Browser localStorage | LOCAL_ONLY / cache |
| Army generated art cache | image cache | Browser localStorage | LOCAL_ONLY / cache |
| Recruit replenishment plan | personal targets (fixed / % of army) used only to compute a shortfall; executing it calls the server `recruit_units` | Browser localStorage | LOCAL_ONLY / preference |
| War messages | up to 10 saved phrases (140 chars); one may be sent as a direct message after an attack the player confirmed | Browser localStorage | LOCAL_ONLY / preference |
| Formation calculator | what-if totals from the unit catalogue | Browser memory | DERIVED |
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

## Inventory migration status

The procedural inventory migration described in older Point 1 notes is **complete** in the current beta line. Inventory, equipment mutations and verified Gear acquisition are server-authoritative through ARCANUM Supabase / `arcanum-state`.

Do not reintroduce localStorage as gameplay authority. Legacy local inventory keys may exist only as one-time migration inputs where the server explicitly validates/imports them.

## 0.3.3 canonical Archmage identity

The character sheet and Arena now consume a unified server read model, `Archmage Snapshot`.

This does not replace the individual authorities. Instead it composes them without creating a new client-side truth:
- progression remains Core authority,
- combat remains arcanum-state authority,
- inventory remains arcanum-state authority,
- Arena remains arcanum-state authority,
- named relics remain Nexo/community authority,
- the chronicle is a derived server aggregation.

Remote profiles expose equipped procedural items, not the owner's full inventory.
