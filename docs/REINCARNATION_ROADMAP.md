# ARCANUM — What is left of The Reincarnation, and how it would fit

Companion to `LUCK_AND_SUPPORT.md` (phase 1, implemented). Every row below changes Core rules, so each one needs its own migration, dry-run and PR. Facts come from hands-on play of the Guildwar server and its public wiki (2026-10-01); numbers marked *wiki* were read there and not verified in play.

## Already covered
Turns as an action budget, exploration with diminishing returns, workshops/libraries multipliers, unit upkeep in gold/mana/population (Core charges it in `run_economy_impl`), Regular and Siege attacks, accuracy/threshold combat engine, apprentice-style protection, alliances, market, PvE, Arena.

## Proposed phases (recommended order)

| # | System | Reincarnation rule | Proposal for Arcanum | Core change |
| --- | --- | --- | --- | --- |
| 2a | **Pillage** | Third attack type, 2 turns, burns farms/towns/workshops/guilds instead of taking land; max 10 pillages per target per 24 h (*wiki*) | Add `PILLAGE` mode to `attack_mage`: no land transfer, destroys a % of productive buildings, daily cap per target | combat + buildings |
| 2b | **Damage protection** | After losing >30% of net power in battles over 24 h the mage gets a "D" shield: no new attacks, counters still allowed (*wiki*) | `protection` column + check in `attack_targets`; shown in the war list (already has `can_attack`) | combat |
| 2c | **Meditation** | 3 days + up to 1 h, cannot be attacked or targeted, turns keep accumulating, own enchantments are cancelled on exit (*wiki*) | Opt-in vacation mode with a cooldown, so inactive players are not farmed | realm status |
| 2d | **Defense assignment** | Pick a spell and an item that auto-fire when an enemy over X% of your power attacks (25/50/100/150/200%) | `realm_defense` row (spell, item, threshold) consumed by the combat engine | combat |
| 3 | **Heroes** | Bought at the Tavern (auction), level 8–17, xp = 1,000 × level, leads a stack of its own race/colour (+efficiency % = level), dies if its stack is wiped and leftover damage exceeds its HP (*wiki*) | Needs the auction market first; heroes are a unit-like record with abilities and upkeep | market + combat |
| 3 | **Auction market** | Pre-paid deposit, no cancel, +5% minimum, 30-minute extending clock, 1 turn per bid, locked to new players | See `REINCARNATION_INSPIRATION.md` §3; also the gold sink Arcanum lacks | new tables + RPCs |
| 4 | **Gods and the Altar** | Donate gold ≥ 10% of your gold (and ≥ 15 M) to a god after 1.5× max turns; 60% chance of *Favoured* for 48 h; Nature +farms/towns, Sun +3% accuracy, Moon +mana, Magic −cost +SL, Science ×2 items, Satan −upkeep, Lucifer +summon/attack; disfavour is the opposite and hatred doubles it; jealousy between gods; Most Favoured / Patron tiers (*wiki*) | A gold sink with risk, lore and a long-term goal. Needs the economy stable first; reuse the luck table pattern for timed favours | economy |
| 4 | **Skills ranks** | 20 ranks per skill, cost of rank *n* = *n* skill points, off-colour costs double, points accrue passively with guilds (*wiki*) | Arcanum already has research points; skills would be a second spend of RP | research |
| 5 | **Enchantments and offensive spells** | Offensive magic unlocks after 400 spent turns; dispel odds depend on mana spent; enchantments need upkeep | Only after Pillage/protection exist, otherwise magic harassment has no counter | magic |
| 5 | **Armageddon** | End-of-season event cast by a team of 7; sealed countdown ("sixth seal broken") | Fits the existing World Boss/Event system | events |

## Not planned
- Paying for power (supporting stays convenience and identity only).
- Voting luck on third-party sites (kept as a `vote` source in the table; no endpoint).
- Scripts/bots rule: in Reincarnation it is forbidden to contact the game with scripts; Arcanum should publish its own automation policy before adding public APIs.
