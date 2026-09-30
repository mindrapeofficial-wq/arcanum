# ARCANUM — Verified Gear Reward Loop

Status: beta 0.3.6.

## Goal

Procedural Gear must come from real gameplay, not from a client-side or debug grant.

Canonical flow:

1. A real game action happens.
2. The server verifies the authoritative result.
3. One idempotent reward claim is created for that source.
4. The server rolls whether Gear drops.
5. If it drops, rarity and item rolls are generated server-side.
6. The item is stamped with provenance and delivered to the verified inventory.
7. If the bag is full, the reward is preserved as pending instead of being lost.

The browser never decides whether the action was valid, whether the player won, or what rarity was granted.

## Reward claims

Table: `arcanum_loot_claims`.

A claim records:
- user,
- source,
- source reference,
- status,
- reward tier,
- generated item snapshot,
- metadata used to verify the reward,
- timestamps.

A unique constraint on `user_id + source + source_ref` prevents the same event from granting Gear twice.

Statuses:
- `started`
- `processing`
- `pending_inventory`
- `delivering`
- `completed`
- `no_drop`
- `rejected`

Interrupted processing and delivery can be reconciled. A reward already present in inventory is marked completed instead of duplicated.

## Provenance

Every newly generated reward carries an `origin` object:
- `source`
- `source_ref`
- `reward_tier`
- `claimed_at`

Visible player labels currently include:
- Legado inicial
- Beta anterior
- Exploración
- Arena clasificada
- Boss mundial
- Evento

Existing beta inventory without provenance is preserved and marked as legacy rather than deleted.

## Exploration

Exploration uses a two-step claim.

### Start
Before the core `explore` RPC runs, `arcanum-state` snapshots:
- requested turns,
- turns before,
- land before.

### Complete
After the core action, `arcanum-state` verifies:
- land actually increased,
- the requested turns were actually consumed.

Only then does the reward roll happen.

Drop chance grows with committed turns and verified land gain, capped at 68%.

Reward bands:
- 1–3 turns: Scouting
- 4–9 turns: Expedition
- 10+ turns: Deep Exploration

Deeper exploration shifts rarity weight away from Common and toward Rare/Epic.

## Ranked Arena

Only a verified ranked victory can roll Gear.

Friendly duels do not grant Gear.
Ranked defeats do not grant Gear.

The Arena match row is the source of truth. The reward claim is tied to the match UUID.

Base drop chance after a ranked victory: 55%.

Rarity bands depend on rating after the match:
- below 1200: Arena Victory
- 1200–1499: Arena Veteran
- 1500+: Arena Elite

This uses the existing daily Seal limit as a natural anti-farm boundary.

If reward delivery fails after the match is already recorded, the match remains valid and the reward can be reclaimed idempotently.

## World Boss

A World Boss Gear claim requires:
- an existing boss event,
- the boss to be defeated,
- verified participant damage greater than zero.

Contribution bands:
- participant: 45% Gear chance,
- 3,000+ damage: 80%,
- 15,000+ damage: guaranteed,
- 50,000+ damage: guaranteed with strongly improved rarity weights.

Gear is additional to the existing Fragment and Relic reward systems. Those systems remain separate because they represent different object/economy layers.

A participant does not need to land the killing blow. Returning to the event after the boss is defeated is enough to recover the idempotent reward.

## Full inventory

A full bag never destroys an earned Gear reward.

The item is generated once and stored on the claim with status `pending_inventory`.

After the player frees space, opening canonical inventory or the own Archmage sheet attempts delivery again.

## Debug Gear

The old visible “Hallazgo de prueba” control has been removed.

The legacy backend test-drop route is disabled unless the server explicitly sets:
`ARCANUM_ALLOW_TEST_LOOT=true`.

This keeps the debugging hook available for controlled development without exposing free Gear in normal play.

## Future sources

New reward sources should use the same claim pipeline instead of writing directly into inventory.

Planned compatible sources:
- personal PvE expeditions,
- dungeon/encounter first clears,
- seasonal events,
- military PvP where appropriate,
- crafting outcomes that create new item instances.

Each new source must declare:
1. authoritative verification source,
2. unique source reference,
3. eligibility,
4. drop chance,
5. rarity weights,
6. reward tier label,
7. anti-farm rule.
