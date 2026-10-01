# ARCANUM — Economy Contract 0.3

Status: canonical semantic contract for Consolidation Point 2.

## Core rule

A number shown in the HUD must belong to one clear economic category:

- **Reserve**: stored and spendable.
- **Capacity**: a limit, not a stock.
- **Flow**: generated only when the relevant action is performed.
- **Space**: physical room for infrastructure.
- **Derived indicator**: calculated from other state and never spent directly.
- **Action budget**: regenerated over time and consumed by actions.

The UI must never present one category as another.

## Resources

### Turns — ACTION BUDGET
- Regenerate over time.
- Current cadence: one turn every five minutes.
- Spent on economy, exploration, construction, research, recruitment and warfare according to each action.
- Buildings do not create turns.
- When the turn reserve reaches its maximum, further regeneration is wasted until turns are spent.

### Gold — RESERVE
- Stored liquid resource.
- Primary uses: recruitment, market operations and economic/military costs exposed by the Core rules.
- TAX is the economy action that prioritizes Gold.
- Gold must never be inferred client-side.

### Mana — RESERVE + CAP
- Stored arcane resource with a maximum capacity.
- Nodes are the infrastructure associated with Mana capacity/economy.
- MP_CHARGE is the economy action that prioritizes Mana.
- Used by summoning, magical units, market operations and other arcane costs defined by Core.

### Population — RESERVE + DUAL CAP
- Stored available inhabitants/workforce.
- Population capacity is always:
  `min(food_capacity, residential_capacity)`
- Recruitment and other Core actions may spend Population.
- Population growth cannot exceed either sustenance or housing.

### Food — CAPACITY
- In the current Core rules Food is a sustenance capacity, not an accumulating inventory.
- Farms raise the kingdom's ability to sustain Population.
- The meaningful quantity is the margin:
  `food_capacity - population`
- When this margin reaches zero, Food becomes the population bottleneck.
- There is no starvation drain mechanic in the current contract. If one is added later it must be a server rule, not a UI fiction.

### Research — FLOW
- Research is not a passive stored currency in the current contract.
- Guilds determine RP generated **per turn spent researching**.
- Current client-visible formula:
  `RP_per_research_turn = floor(sqrt(guilds) * 3.5)`
- RP are applied directly to the selected spell.
- No research turn, no RP generation.
- No passive offline accumulation is displayed.

### Land — SPACE
- Total Land is the physical size of the realm.
- Wilderness is Land not yet converted into infrastructure.
- Developed land:
  `land - wilderness`
- Exploration converts Turns into new Wilderness.
- Construction converts Wilderness into buildings.
- War can transfer Land according to Core battle rules.
- Base Exploration yield is 4-8 Wilderness per Turn.\n- Exploration yield declines as a realm approaches 3,500 acres.

### Ascendancy — DERIVED INDICATOR
- Measures total strength for comparison/ranking.
- It is not spendable.
- It must never be used by the browser as a substitute formula for Gold, Mana or Population production.

## Buildings

| Building | Primary economic identity | Base turn cost shown by current client |
| --- | --- | ---: |
| Farms | Increase sustenance capacity | 5 |
| Towns | Increase residential capacity and support Gold economy | 30 |
| Nodes | Support Mana capacity/economy | 30 |
| Workshops | Reduce effective turn cost of future construction | 10 |
| Guilds | Produce RP when research turns are spent | 20 |
| Barracks | Unlock recruitment | 5 |
| Fortresses | Strategic survival and defence | 300 |
| Barriers | Specialized arcane defence | 1 per barrier |

Workshop reductions are applied by Core. The client must display base cost plus the fact that a reduction is active unless Core exposes an exact preview.

## Economic actions

- **NONE / Balanced development**: normal Core economy processing.
- **TAX / Collect taxes**: prioritizes Gold.
- **MP_CHARGE / Charge Mana**: prioritizes Mana.
- The client does not invent hidden penalties or bonuses. Exact outcomes are whatever the Core RPC confirms.

## Passive display rule

The client may visually interpolate a resource between server refreshes only when:
1. the server explicitly provides a per-turn production value, or
2. a completed turn has allowed the client to observe a real delta for the same building configuration.

There is no fallback formula based on Ascendancy or any other proxy.

If production is unknown, the correct visual fallback is **zero interpolation**, not a guessed income.

## Lady Luck modifiers (0.3.39)

Lady Luck is a **server-side modifier**, not a resource. While `arcanum_luck.expires_at > now()`:
- `cast_summon_impl` adds 5 points to the success chance (cap 100%).
- `explore_impl` multiplies each turn's land gain by 1.10 with probabilistic rounding.

The client may display the status and the bonus list returned by `my_luck_status()`; it must never apply the bonuses to its own estimates. Luck does not stack and is never a spendable amount. See `docs/LUCK_AND_SUPPORT.md`.

## Economy loop

`Turns -> Economy / Exploration / Research / Recruitment / War`

`Exploration -> Wilderness -> Construction -> Capacity / Production / Unlocks`

`Capacity + Reserves -> Army / Magic / Market / Expansion`

This loop is the reference for future systems. A new resource should not be added unless it has a source, sink and meaningful consequence.
