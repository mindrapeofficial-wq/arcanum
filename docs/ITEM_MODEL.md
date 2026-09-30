# ARCANUM — Canonical Item Model

Status: beta 0.3.5 / Consolidation Point 4.

## Principle

Every physical object owned or equipped by an Archmage belongs to one canonical item model.

The combat profile's Duel Weapon is **not** a physical inventory object. It is an intrinsic combat identity/evolution choice. This prevents the El Bruto-inspired progression from competing with the physical weapon slot.

## Item kinds

### Gear
Procedurally generated, rolled equipment stored in the verified inventory.

Slots:
- weapon
- robe
- amulet
- ring1
- ring2
- focus

Gear can have rarity, item power, level, affinity, implicit modifiers and rolled affixes.

### Relic
Named world objects with fixed identity, lore, provenance and server history.

Slot:
- relic

Only one Relic can be active at a time.

Categories remain:
- minor
- school
- cursed
- unique

A World Unique remains globally singular while active in the world.

### Duel Weapon
Not an item kind.

It belongs to the intrinsic combat profile:
- seeded combat identity,
- level evolution,
- abilities and traits.

The UI must call it **Arma de Duelo**, never simply "equipped weapon".

## Seven canonical equipment slots

1. Weapon
2. Robe
3. Amulet
4. Ring I
5. Ring II
6. Focus
7. Relic

The old procedural `artifact` slot is migrated automatically to `focus`.

## Inventory migration

Inventory schema version 2:
- converts item slot `artifact` -> `focus`,
- converts equipment key `artifact` -> `focus`,
- preserves item IDs, affixes, rolls, power and creation timestamps,
- accepts the beta-era local inventory v1 key for one-time server migration.

No existing procedural object should be deleted because of this terminology change.

## Canonical item API

`GET /functions/v1/arcanum-state/items`

Returns one read model containing:
- Gear,
- Relics,
- all seven slots,
- bag count/capacity,
- verified equipment power.

Mutation lifecycle:

`POST /items/equip`
- `kind: gear`
- `kind: relic`

`POST /items/unequip`
- one canonical slot name.

The old specialized endpoints remain compatibility surfaces while the game migrates, but new UI code should use the canonical item lifecycle.

## Visibility

Owner:
- receives the complete Gear bag,
- receives owned Relics,
- sees all equipped slots.

Other players:
- receive only equipped Gear records needed to render public slots,
- can see the active Relic,
- do not receive unequipped Gear bag contents.

## Mechanical scopes

Unification does not mean every item affects every subsystem.

### Gear
Currently affects personal combat through verified equipment bonuses:
- HP,
- attack,
- armor,
- speed,
- critical chance,
- dodge,
- block,
- regeneration,
- accuracy,
- related combat values.

### Relics
Relics keep semantic scopes.

Personal-combat-compatible Relics may affect Arena/personal combat. Examples currently wired include:
- Mirror Shard: dodge,
- Storm Bottle: offensive power,
- Dragon Scale: physical defense,
- Glass Eye: accuracy,
- school combat Relics,
- selected Cursed Relics,
- selected World Uniques.

Economy, exploration, recruitment, army, construction, ritual or loot effects are not silently converted into Arena stats. Their own subsystem must consume them explicitly.

This is a hard rule against hidden cross-system bonuses.

## Arena

Arena now combines:
- intrinsic combat identity,
- procedural Gear bonuses,
- the one active Relic's compatible personal-combat modifiers.

All values are resolved server-side.

## Relic market

Relic trade still uses Relic ownership/history tables because World Uniques and provenance require transactional history.

A Relic offered on the market must be unequipped first. The canonical Relic slot writes to the same authoritative `equipped` flag, so market and character equipment cannot disagree.

## Future extension

The canonical item model is intentionally compatible with:
- PvE personal combat drops,
- crafting,
- item locking,
- stash expansion,
- Gear trading,
- set items,
- durability if ever desired,
- seasonal/era item rules.

Any future physical object must declare:
1. item kind,
2. valid slot or bag-only status,
3. authority,
4. mechanical scope,
5. trade/destruction rules.


## Verified acquisition

Procedural Gear acquisition is defined by `docs/LOOT_LOOP.md`.

Normal play must not grant Gear by directly mutating the browser inventory. Exploration, ranked Arena and World Boss rewards now use server-authoritative, idempotent claims.

Each newly generated Gear item records its gameplay provenance. If inventory is full, the generated reward remains reserved on the claim until it can be delivered.
