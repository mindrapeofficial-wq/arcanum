# ARCANUM — What is left of The Reincarnation, and how it would fit

Companion to `LUCK_AND_SUPPORT.md` (phase 1, implemented). Every row below changes Core rules, so each one needs its own migration, dry-run and PR. Facts come from hands-on play of the Guildwar server and its public wiki (2026-10-01); numbers marked *wiki* were read there and not verified in play.

## Already covered
Turns as an action budget, exploration with diminishing returns, workshops/libraries multipliers, unit upkeep in gold/mana/population (Core charges it in `run_economy_impl`), Regular and Siege attacks, accuracy/threshold combat engine, apprentice-style protection, alliances, market, PvE, Arena.

## Proposed phases (recommended order)

| # | System | Reincarnation rule | Proposal for Arcanum | Core change |
| --- | --- | --- | --- | --- |
| 2a ✅ | **Pillage** | Third attack type, 2 turns, burns farms/towns/workshops/guilds instead of taking land; max 10 pillages per target per 24 h (*wiki*) | Add `PILLAGE` mode to `attack_mage`: no land transfer, destroys a % of productive buildings, daily cap per target | combat + buildings |
| 2b ✅ | **Damage protection** | After losing >30% of net power in battles over 24 h the mage gets a "D" shield: no new attacks, counters still allowed (*wiki*) | `protection` column + check in `attack_targets`; shown in the war list (already has `can_attack`) | combat |
| 2c ✅ | **Meditation** | 3 days + up to 1 h, cannot be attacked or targeted, turns keep accumulating, own enchantments are cancelled on exit (*wiki*) | Opt-in vacation mode with a cooldown, so inactive players are not farmed | realm status |
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

## Status: phases 2b and 2c (implemented in the repo, NOT deployed)
Migration `20261001190000_damage_protection_meditation.sql`, tests `supabase/tests/damage_protection.sql` (dry-run against the live database in a force-rolled-back transaction: all assertions passed, nothing persisted).

| Rule | Value (Arcanum choices where the wiki gave none) |
| --- | --- |
| Damage protection trigger | Army power lost as defender in 24 h > 30% of the army power at the start of the window |
| Damage protection effect | 24 h shield (`realm_shields.damage_shield_until`). Target cannot be attacked (`TARGET_DAMAGE_PROTECTED`), except by a realm it attacked in the last 24 h (counter). Same losses never re-open it |
| Meditation | `start_meditation()`: 3 days, cannot attack (`ATTACKER_IN_MEDITATION`) nor be attacked (`TARGET_IN_MEDITATION`), 14 days cooldown from the start (`MEDITATION_COOLDOWN`). Turns keep accumulating. Ends by itself |
| War list | `attack_targets` folds both shields into `can_attack` (columns unchanged) |
| Client | `my_shield_status()` is ready; **no UI yet** (meditation button, shield badge in the war list) |

Not done: "up to 1 h" extra meditation time and enchantment cancelling (no enchantments exist yet). Pillage (2a) should reuse `private.attack_shield_allows`.

## Status: phase 2a Pillage (implemented in the repo, NOT deployed)
Migration `20261001200000_pillage.sql`, tests `supabase/tests/pillage.sql` (dry-run on the live database in rolled-back transactions; requires 2b/2c applied first, it reuses `private.attack_shield_allows`).

| Rule | Value (Arcanum choices; the wiki numbers are unverified) |
| --- | --- |
| Mode | `attack_mage(target, 'PILLAGE')`, 2 turns, same engine, victory threshold and war expense as REGULAR |
| Land | Never changes hands |
| Effect of a victory | Burns `ceil(count × 5% × occupation)` of farms, towns, workshops and guilds. `occupation = min(1, survivors / (land × 2.5))`, same factor REGULAR uses |
| Conservation | Burned buildings become wilderness (keeps `land = wilderness + buildings`), so the owner can rebuild |
| Untouched | Barracks, fortresses, barriers and nodes. A pillage can never kill a mage |
| Cap | 10 pillages against the same target per 24 h (`PILLAGE_LIMIT_REACHED`) |
| Shields | Honors damage protection and meditation |
| Client | **SAQUEAR** button in the war list, labels in reports and chronicle |

Not done: pillage does not yet steal or burn gold/mana, and the war ranking counts pillage wins like any other win. Both are open design questions.

## Status: mana crisis and supporter badge (implemented in the repo, NOT deployed)
Migration `20261001210000_mana_crisis_and_supporter_badge.sql`, tests `supabase/tests/mana_crisis_badge.sql`, doc `MANA_CRISIS.md`. The mana rule ships **OFF** behind `rulesets.config->>'mana_crisis'`; the badge lookup and the client panels are read-only.
