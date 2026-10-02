import test from 'node:test';
import assert from 'node:assert/strict';
import type { Mage } from 'shared/src/mage';
import { ARCANUM_SCHOOLS, toArcanumDomain, toEngineBuildingPlan } from '../src/arcanum-domain';

const emptyMagicRecord = {
  ascendant: [],
  verdant: [],
  eradication: [],
  nether: [],
  phantasm: [],
};

const emptyResearch = {
  ascendant: null,
  verdant: null,
  eradication: null,
  nether: null,
  phantasm: null,
};

function sampleMage(magic: Mage['magic']): Mage {
  return {
    id: 7,
    name: 'DOMINIO_TEST',
    rank: 1,
    status: 'alive',
    type: '',
    magic,
    testingSpellLevel: 0,
    adjacent: [],
    opposite: [],
    spellbook: { ...emptyMagicRecord },
    currentResearch: { ...emptyResearch },
    focusResearch: false,
    netPower: 0,
    currentTurn: 42,
    maxTurn: 200,
    turnsUsed: 18,
    currentPopulation: 12345,
    currentMana: 6789,
    currentGeld: 543210,
    farms: 10,
    towns: 8,
    workshops: 4,
    nodes: 3,
    barracks: 2,
    guilds: 5,
    forts: 1,
    barriers: 1,
    wilderness: 50,
    assignment: {
      spellId: '',
      spellCondition: -1,
      itemId: '',
      itemCondition: -1,
    },
    recruitments: [],
    army: [],
    items: {},
    heroes: [],
    enchantments: [],
    skillPoints: 3,
    skills: {},
  };
}

test('maps every inherited magic id to an ARCANUM school', () => {
  assert.deepEqual(ARCANUM_SCHOOLS, {
    ascendant: { code: 'aurea', name: 'Aurea' },
    verdant: { code: 'viridia', name: 'Viridia' },
    eradication: { code: 'cineria', name: 'Cineria' },
    nether: { code: 'nadir', name: 'Nadir' },
    phantasm: { code: 'oneiria', name: 'Oneiria' },
  });
});

test('Domain view exposes ARCANUM vocabulary and preserves engine values', () => {
  const domain = toArcanumDomain(sampleMage('nether'));

  assert.equal(domain.school.code, 'nadir');
  assert.equal(domain.school.name, 'Nadir');
  assert.equal(domain.resources.gold, 543210);
  assert.equal(domain.resources.mana, 6789);
  assert.equal(domain.turns.current, 42);
  assert.equal(domain.territory.total, 84);
  assert.equal(domain.territory.buildings.fortresses, 1);

  const serialized = JSON.stringify(domain).toLowerCase();
  assert.equal(serialized.includes('geld'), false);
  assert.equal(serialized.includes('nether'), false);
  assert.equal(serialized.includes('archmage'), false);
});


test('building plans translate ARCANUM fortress naming and fill original zero fields', () => {
  assert.deepEqual(toEngineBuildingPlan({ farms: 2, fortresses: 1, barriers: 3 }), {
    farms: 2,
    towns: 0,
    workshops: 0,
    barracks: 0,
    nodes: 0,
    guilds: 0,
    forts: 1,
    barriers: 3,
  });
});

test('Domain view exposes original engine rates without browser reimplementation', () => {
  const domain = toArcanumDomain(sampleMage('ascendant'));

  assert.equal(domain.rates.goldPerTurn, 13345);
  assert.equal(domain.rates.populationPerTurn, Math.floor(12345 * 0.015 + 50));
  assert.equal(domain.rates.researchPerTurn, Math.floor(Math.sqrt(5) * 20));
  assert.equal(domain.resources.manaCapacity, 3000);

  const fortress = domain.territory.buildingCatalog.find(row => row.id === 'fortresses');
  const barrier = domain.territory.buildingCatalog.find(row => row.id === 'barriers');
  assert.equal(fortress?.goldCost, 3000);
  assert.equal(fortress?.maxPerTurn, (4 + 1) / 300);
  assert.equal(barrier?.maxPerTurn, 1);
});
