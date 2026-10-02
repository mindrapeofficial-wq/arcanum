import type { AllowedMagic } from 'shared/src/common';
import type { Mage } from 'shared/src/mage';
import type { BuildPayload, DestroyPayload } from 'shared/src/api';
import { currentSpellLevel, totalLand, totalNetPower } from 'engine/src/base/mage';
import {
  buildingRate,
  buildingTypes,
  explorationRate,
  geldIncome,
  populationIncome,
} from 'engine/src/interior';
import {
  castingCost,
  dispelEnchantment,
  manaIncome,
  maxMana,
  researchPoints,
  successCastingRate,
} from 'engine/src/magic';
import {
  getItemById,
  getSpellById,
  getUnitById,
} from 'engine/src/base/references';

export const ARCANUM_SCHOOLS = Object.freeze({
  ascendant: { code: 'aurea', name: 'Aurea' },
  verdant: { code: 'viridia', name: 'Viridia' },
  eradication: { code: 'cineria', name: 'Cineria' },
  nether: { code: 'nadir', name: 'Nadir' },
  phantasm: { code: 'oneiria', name: 'Oneiria' },
} as const satisfies Record<AllowedMagic, { code: string; name: string }>);

const ARCANUM_BUILDINGS = Object.freeze({
  farms: { id: 'farms', name: 'Granjas' },
  towns: { id: 'towns', name: 'Pueblos' },
  workshops: { id: 'workshops', name: 'Talleres' },
  nodes: { id: 'nodes', name: 'Nodos' },
  barracks: { id: 'barracks', name: 'Cuarteles' },
  guilds: { id: 'guilds', name: 'Gremios' },
  forts: { id: 'fortresses', name: 'Fortalezas' },
  barriers: { id: 'barriers', name: 'Barreras' },
} as const);

export type ArcanumSchoolCode =
  (typeof ARCANUM_SCHOOLS)[keyof typeof ARCANUM_SCHOOLS]['code'];

export function arcanumSchool(magic: AllowedMagic) {
  return ARCANUM_SCHOOLS[magic];
}

export function engineSchool(code: string): AllowedMagic {
  const normalized = String(code || '').trim().toLowerCase();
  for (const [magic, school] of Object.entries(ARCANUM_SCHOOLS)) {
    if (school.code === normalized || magic === normalized) return magic as AllowedMagic;
  }
  throw new Error(`Unknown ARCANUM school: ${code}`);
}

export function toArcanumRank(row: {
  id: number;
  name: string;
  magic: string;
  rank: number;
  status: string;
  land: number;
  netPower: number;
  forts: number;
}) {
  return {
    id: row.id,
    name: row.name,
    school: arcanumSchool(engineSchool(row.magic)),
    rank: row.rank,
    status: row.status,
    land: row.land,
    power: row.netPower,
    fortresses: row.forts,
  };
}

export function toArcanumMagicState(mage: Mage) {
  const spells = Object.values(mage.spellbook)
    .flat()
    .map(id => {
      const spell = getSpellById(id);
      return {
        id: spell.id,
        name: spell.name,
        description: spell.description,
        school: arcanumSchool(spell.magic),
        rank: spell.rank,
        attributes: spell.attributes,
        castingTurns: spell.castingTurn,
        manaCost: castingCost(mage, spell.id),
        baseManaCost: spell.castingCost,
        successRate: successCastingRate(mage, spell.id),
        life: spell.life ?? null,
        upkeep: spell.upkeep,
      };
    });

  const items = Object.entries(mage.items)
    .filter(([, amount]) => amount > 0)
    .map(([id, amount]) => {
      const item = getItemById(id);
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        attributes: item.attributes,
        amount,
        upkeep: item.upkeep,
      };
    });

  const enchantments = mage.enchantments
    .filter(enchantment => enchantment.isActive)
    .map(enchantment => ({
      id: enchantment.id,
      spellId: enchantment.spellId,
      spellName: getSpellById(enchantment.spellId).name,
      school: arcanumSchool(enchantment.casterMagic),
      casterId: enchantment.casterId,
      targetId: enchantment.targetId,
      spellLevel: enchantment.spellLevel,
      permanent: enchantment.isPermanent,
      life: enchantment.life,
      selfCast: enchantment.casterId === mage.id,
    }));

  return {
    spells,
    items,
    enchantments,
    mana: {
      current: mage.currentMana,
      capacity: maxMana(mage),
      incomePerTurn: manaIncome(mage),
    },
    spellLevel: currentSpellLevel(mage),
  };
}

export function toArcanumDispelPreview(mage: Mage, enchantId: string, mana: number) {
  const enchantment = mage.enchantments.find(row => row.id === enchantId);
  if (!enchantment) return null;
  return {
    enchantmentId: enchantId,
    mana,
    probability: dispelEnchantment(mage, enchantment, mana),
  };
}

export function describeMarketAsset(priceId: string, type: string) {
  try {
    if (type === 'item') {
      const item = getItemById(priceId);
      return { id: item.id, name: item.name, description: item.description, type };
    }
    if (type === 'spell') {
      const spell = getSpellById(priceId);
      return {
        id: spell.id,
        name: spell.name,
        description: spell.description,
        type,
        school: arcanumSchool(spell.magic),
        rank: spell.rank,
      };
    }
    if (type === 'unit') {
      const unit = getUnitById(priceId);
      return {
        id: unit.id,
        name: unit.name,
        description: unit.description,
        type,
        school: unit.magic === 'plain' ? null : arcanumSchool(unit.magic),
        power: unit.powerRank,
      };
    }
  } catch {
    // Keep stable engine identifiers even if a market row outlives catalog data.
  }
  return { id: priceId, name: priceId, description: '', type };
}

export function toEngineBuildingPlan(
  input: Record<string, unknown> | null | undefined,
): BuildPayload & DestroyPayload {
  const source = input ?? {};
  const plan: Record<string, number> = {};

  for (const building of buildingTypes) {
    const publicId = ARCANUM_BUILDINGS[building.id as keyof typeof ARCANUM_BUILDINGS]?.id ?? building.id;
    const raw = source[publicId] ?? source[building.id] ?? 0;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
      throw new Error(`Invalid building amount for ${publicId}`);
    }
    plan[building.id] = amount;
  }

  return plan;
}

export function toArcanumDomain(mage: Mage) {
  const school = arcanumSchool(mage.magic);
  const unitCount = mage.army.reduce((sum, stack) => sum + stack.size, 0);
  const land = totalLand(mage);

  return {
    id: mage.id,
    name: mage.name,
    status: mage.status,
    school,
    turns: {
      current: mage.currentTurn,
      max: mage.maxTurn,
      used: mage.turnsUsed,
    },
    resources: {
      gold: mage.currentGeld,
      mana: mage.currentMana,
      manaCapacity: maxMana(mage),
      population: mage.currentPopulation,
    },
    rates: {
      explorationPerTurn: explorationRate(mage),
      goldPerTurn: geldIncome(mage),
      manaPerTurn: manaIncome(mage),
      populationPerTurn: populationIncome(mage),
      researchPerTurn: researchPoints(mage),
    },
    territory: {
      total: land,
      wilderness: mage.wilderness,
      buildings: {
        farms: mage.farms,
        towns: mage.towns,
        workshops: mage.workshops,
        nodes: mage.nodes,
        barracks: mage.barracks,
        guilds: mage.guilds,
        fortresses: mage.forts,
        barriers: mage.barriers,
      },
      buildingCatalog: buildingTypes.map(building => {
        const display = ARCANUM_BUILDINGS[building.id as keyof typeof ARCANUM_BUILDINGS] ?? {
          id: building.id,
          name: building.id,
        };
        const rate = buildingRate(mage, building.id);
        return {
          id: display.id,
          name: display.name,
          current: Number((mage as any)[building.id] ?? 0),
          percentOfLand: land > 0 ? (100 * Number((mage as any)[building.id] ?? 0)) / land : 0,
          goldCost: building.geldCost,
          manaCost: building.manaCost,
          maxPerTurn: rate,
          turnsPerUnit: rate > 0 ? 1 / rate : null,
          upkeep: {
            gold: building.upkeep.geld,
            mana: building.upkeep.mana,
            population: building.upkeep.population,
          },
        };
      }),
    },
    progression: {
      spellLevel: currentSpellLevel(mage),
      skillPoints: mage.skillPoints,
      focusResearch: mage.focusResearch,
      research: Object.fromEntries(
        Object.entries(mage.currentResearch).map(([magic, item]) => [
          arcanumSchool(engineSchool(magic)).code,
          item ? {
            spellId: item.id,
            remainingCost: item.remainingCost,
            active: item.active,
          } : null,
        ]),
      ),
      knownSpells: Object.fromEntries(
        Object.entries(mage.spellbook).map(([magic, spellIds]) => [
          arcanumSchool(engineSchool(magic)).code,
          spellIds,
        ]),
      ),
    },
    army: {
      stacks: mage.army.length,
      units: unitCount,
      formations: mage.army.map(stack => ({ id: stack.id, size: stack.size })),
      recruitments: mage.recruitments.map(stack => ({ id: stack.id, size: stack.size })),
    },
    power: totalNetPower(mage),
  };
}
