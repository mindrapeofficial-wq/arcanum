# ARCANUM — Design inputs from The Reincarnation (Guildwar)

Status: proposal + record of what shipped. Source: hands-on play of the Guildwar server (2026.2) and its public wiki.
Research notes live outside the repo (`notas-reincarnation.md`, `diseno-inspiracion-reincarnation.md`).

## Shipped in 0.3.38 (client only) — war

| Idea | Where | Authority |
| --- | --- | --- |
| Richer battle report: top blows aggregated by unit with names, losses per side, land conquered/destroyed, fortresses, war expense, collapsible full sequence | `battleReportHtml` in `war.js` | read model from `battle_report_detail` (no new data) |
| War messages (Reincarnation "arrow") | Guerra view panel | LOCAL_ONLY phrases; sent via the existing `send_direct_message` after a confirmed attack; `attack_mage` has no message parameter, NPCs are skipped by the server |

## Shipped in 0.3.38 (client only) — army planning

| Idea | Where | Authority |
| --- | --- | --- |
| Negative mana alert in the HUD | `realm-tools.js` → `applyManaAlert`, called from `renderResourceStrip` | uses the already-known per-turn flow; no new data |
| Cost + upkeep per unit when recruiting | `recruitUnitInfoHtml` in the Army view | unit catalogue (`recruit_*`, `upkeep_*`) |
| Replenishment plan (Fixed / Maintain %) | `recruit-plan-panel` in the Army view | LOCAL_ONLY preference; executes server `recruit_units` |
| Formation calculator | `formation-calc-panel` in the Army view | DERIVED from the catalogue |

Already present before this change (do not duplicate): build-batch turn preview, mixed-batch (barriers) warning and workshop-reduction note in Construction.

## Needs Core / backend work (not implemented in the client)

These must be server rules. The client must not fake them (see `STATE_AUTHORITY.md` and `ECONOMY_CONTRACT.md`).

### 1. Three-resource upkeep per turn — ALREADY IMPLEMENTED IN CORE
Reincarnation charges units, buildings and heroes in **gold / mana / population every turn**; this is what makes magical armies strangle mana and physical armies strangle gold (e.g. Nymph 0 g / 0.15 m, Gorilla 2.7 g / 0.04 m, Unicorn 48 g / 0.8 m).
Verified against the live Core function `private.run_economy_impl` (project Arcanum, read-only, 2026-10-01):
- Each processed turn charges **army upkeep** = ceil(sum(quantity × `upkeep_gold|mana|population`)) from `unit_catalog`, plus **fortress upkeep** = 240×f + 30×f×(f+1) gold. Other buildings (farms, towns, workshops, guilds, barracks, nodes, barriers) have **no upkeep**.
- Order per turn: population growth → gross gold/mana → TAX/MP_CHARGE bonus → mana capped at `nodes×1000` → upkeep subtracted; gold, mana and population are floored at 0.
- A shortfall is **not punished yet**: it is recorded in `economy_ledger.crisis_events` as `GOLD_SHORTFALL` / `MANA_SHORTFALL` / `POPULATION_SHORTFALL` with resolution `DEFERRED_UNTIL_CRISIS_PRIORITY_IS_VERSIONED`.
- `run_economy` returns `army_gold_upkeep`, `army_mana_upkeep`, `army_population_upkeep` for the processed turn.
- Consequence for the client: the catalogue upkeep shown in Army is accurate; the HUD mana alert reflects a real drain.
- Implemented (flag OFF) in `20261001210000_mana_crisis_and_supporter_badge.sql`; see `docs/MANA_CRISIS.md`. The criterion is the stack's **total** mana drain, not the per-unit upkeep.
- **Reference behaviour (Reincarnation, observed 2026-10-01):** when mana upkeep cannot be paid, the game removes an **entire unit stack** ("Insufficient Mana: Lost 347 Unicorns!") and the net mana flow recovers. In the test, 6 turns took mana from 2,068 to 60 with a net of −427/turn; at turn 206 the whole Unicorn stack (0.8 mana per unit, 347 units, ~600k gold of investment) was lost while Naga Queens (5.5 mana per unit) were kept. There was no warning besides a "−" sign in the header. If Arcanum adopts a similar rule, the HUD mana alert shipped here becomes the minimum warning, and purchases that add mana upkeep (market, summons) should show the new net mana flow *before* confirming.

### 2. Barrier mana upkeep
Reincarnation: barrier resistance = barriers / land × 3000% (cap 75%), costing 60 mana per barrier per turn. 20 barriers on 1,124 acres gave 53% resistance and −1,200 mana/turn. It is a clear defence ↔ economy trade-off.
- Today barriers have **no upkeep** in Core (verified in `run_economy_impl`). Adopting it would be a Core rule (add `barriers×60` to mana upkeep) and the Construction card should then state the per-turn mana cost.

### 3. Auction market (Black Market model)
Rules observed: pre-paid deposit, **no cancellation**, minimum **+5%** over the current price, 30-minute countdown that restarts on any bid in the last 30 minutes, the outbid deposit is refunded, each bid order costs 1 turn, and the market is closed to new players during the protection phase (first 120 turns).
Lots: items, mercenaries, summonable units, off-colour spells and heroes. Prices observed are 0.5–2.6 M gold, which turns the late-game gold surplus into a sink.
- Requires server tables for lots, bids and settlement and atomic RPCs (`place_bid`, `settle_lot`). It cannot be a client feature.
- Suggested first scope: one lot type (off-colour spells), bid + settle only.

### 4. Battle simulator
Reincarnation locks its simulator and stack calculator behind paid "supporting" status. For ARCANUM a free basic version is desirable, but outcomes are decided by the server (`attack_targets`, arena seeds). A faithful simulator needs the server to expose a deterministic `simulate_battle` RPC (same engine, no side effects). The client formation calculator deliberately stops at costs and upkeep.

## Other observations worth keeping
- Protection for new realms lasts exactly 120 spent turns and the status flips automatically.
- Libraries cut both research and skill-training turns: a hidden multiplier that rewards discovery.
- Build turn cost per building uses different rates (farms ≈30/turn, barriers 1/turn, fortress 0.5/turn); a batch costs the sum of `ceil(quantity / rate)` per type.
- Recruiting is a background queue in Reincarnation (does not spend turns by itself); in ARCANUM it spends turns explicitly, which is clearer. The replenishment plan keeps that explicitness.
- Monetisation by convenience (calculators), not power.
