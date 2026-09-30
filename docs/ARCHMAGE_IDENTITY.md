# ARCANUM — Canonical Archmage Identity

Status: Consolidation 0.3.3 / Point 3.

## Core principle

The player **is the Archmage**. The realm is the Archmage's domain, not a separate protagonist.

Every system that needs to describe the player character must resolve the same canonical identity.

## Archmage Snapshot

Authenticated endpoint:

`GET /functions/v1/arcanum-state/archmage/:mage_name`

The snapshot aggregates server-authoritative state into one read model:

- Core public player profile and realm identity.
- Archmage level, XP and four personal aptitudes.
- Persistent duel characteristics.
- Duel weapon, traits, abilities and evolution choices.
- Verified inventory and equipped items.
- Arena rating and record.
- Active relics and linked relics.
- Recent personal chronicle assembled from Arena, relic history and, for the owner, strategic battle reports.
- Source/authority metadata.

The UI must not reconstruct a second Archmage independently when this snapshot is available.

## Two stat layers

ARCANUM currently has two legitimate character layers. They are not synonyms.

### Aptitudes of the Archmage
Persistent development in the wider world:
- Arcane Power
- Knowledge
- Willpower
- Influence

These are level/XP progression attributes owned by Core.

### Duel characteristics
Persistent fighting identity:
- Vitality
- Strength
- Agility
- Speed
- Endurance
- Precision
- Will
- Fortune

These describe how the same Archmage performs in automated personal combat.

The UI names the layers explicitly to avoid presenting two different systems as competing "attributes".

## Equipment visibility

The owner receives the complete server inventory.

Other players receive only:
- equipped slot IDs,
- the equipped item records required to render those slots,
- total item count/equipment power metadata where appropriate.

The contents of another player's unequipped inventory are not exposed by the Archmage Snapshot.

## Relics

Named relic ownership is part of the Archmage identity and is visible in the character sheet.

Relics remain mechanically distinct from procedural inventory until Consolidation Point 4. The character sheet may display both, but must not pretend they are already one equipment model.

## Duel weapon vs inventory weapon

The combat profile currently owns a persistent **Duel Weapon**, inherited from the El Bruto-inspired identity/evolution system.

The procedural inventory also contains a physical weapon slot.

Until Point 4 merges the object model:
- "Duel Weapon" means the innate/evolutionary combat identity weapon.
- "Equipment weapon" means the procedural item occupying the inventory weapon slot.

The UI must never call both simply "equipped weapon".

## Renown

Renown is a derived summary of persistent accomplishments, not a currency and not a source of combat power.

Current inputs include:
- Archmage level,
- Arena victories,
- Arena rating above the baseline,
- owned relics,
- extra weight for World Unique relics.

The server returns both the score and its breakdown. The value has no mechanical effect in 0.3.3.

## Chronicle

The personal chronicle is a unified read model, not a new mutable authority.

It merges:
- Arena events,
- relic events,
- strategic battle reports available to the owner.

Future PvE and Era events should add canonical event records to the same conceptual chronicle.

## Consumers

### Player profile
Uses Archmage Snapshot as its primary identity payload.

### Arena
Uses the same Archmage Snapshot for player identity, level, combat profile and verified equipment. Arena-specific detailed history may still use its dedicated endpoint.

### Social surfaces
Profile links resolve into the same canonical character sheet.

## Point 4 integration

The canonical item model is now defined in `docs/ITEM_MODEL.md`.

The Archmage identity consumes seven equipment slots:
Weapon, Robe, Amulet, Ring I, Ring II, Focus and Relic.

The Duel Weapon remains an intrinsic combat identity rather than a physical inventory item.
