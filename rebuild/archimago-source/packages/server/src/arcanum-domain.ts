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
  manaIncome,
  maxMana,
  researchPoints,
} from 'engine/src/magic';

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
    },
    army: {
      stacks: mage.army.length,
      units: unitCount,
    },
    power: totalNetPower(mage),
  };
}
