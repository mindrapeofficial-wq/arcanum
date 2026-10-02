import type { AllowedMagic } from 'shared/src/common';
import type { Mage } from 'shared/src/mage';
import { currentSpellLevel, totalLand, totalNetPower } from 'engine/src/base/mage';

export const ARCANUM_SCHOOLS = Object.freeze({
  ascendant: { code: 'aurea', name: 'Aurea' },
  verdant: { code: 'viridia', name: 'Viridia' },
  eradication: { code: 'cineria', name: 'Cineria' },
  nether: { code: 'nadir', name: 'Nadir' },
  phantasm: { code: 'oneiria', name: 'Oneiria' },
} as const satisfies Record<AllowedMagic, { code: string; name: string }>);

export type ArcanumSchoolCode =
  (typeof ARCANUM_SCHOOLS)[keyof typeof ARCANUM_SCHOOLS]['code'];

export function arcanumSchool(magic: AllowedMagic) {
  return ARCANUM_SCHOOLS[magic];
}

export function toArcanumDomain(mage: Mage) {
  const school = arcanumSchool(mage.magic);
  const unitCount = mage.army.reduce((sum, stack) => sum + stack.size, 0);

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
      population: mage.currentPopulation,
    },
    territory: {
      total: totalLand(mage),
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
