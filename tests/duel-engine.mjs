import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { loadEngine } from "./lib/duel-engine.mjs";
import { fingerprint, SCHOOLS, NAMES } from "./lib/duel-golden.mjs";

const E = loadEngine();
const golden = JSON.parse(fs.readFileSync(new URL("./fixtures/duel-golden.json", import.meta.url), "utf8"));
const ALL_ABILITIES = [...E.ABILITIES, ...E.EVOLVE_ABILITIES];
const ALL_WEAPONS = [...E.WEAPONS, ...E.EXTRA_WEAPONS];

const who = (name, school = "verdant") => ({ mage_name: name, school_code: school });
function kit(name, school, { abilities = [], weapon = null, levelBonuses = null } = {}) {
  const raw = E.baseProfile(name, school);
  if (weapon) raw.weapon = E.clone(typeof weapon === "string" ? ALL_WEAPONS.find((w) => w.id === weapon) : weapon);
  for (const spec of abilities) {
    const [id, grade = 1] = Array.isArray(spec) ? spec : [spec];
    const def = ALL_ABILITIES.find((a) => a.id === id);
    raw.abilities = raw.abilities.filter((a) => a.id !== id);
    raw.abilities.push({ id: def.id, name: def.name, school: def.school, desc: def.desc, grade });
  }
  if (levelBonuses) raw.levelBonuses = levelBonuses;
  return raw;
}
const duel = (a, b, seed, na = "A", nb = "B") => E.simulate(who(na), a, {}, who(nb), b, {}, seed);

test("existing base profiles and duels are unchanged (golden)", () => {
  const fp = fingerprint(E);
  assert.deepEqual(fp.base, golden.base, "baseProfile output changed for existing Archmages");
  assert.deepEqual(fp.duels, golden.duels, "duel logs/results changed for kits using only the original catalog");
});

test("catalog data is complete and consistent", () => {
  const ids = ALL_ABILITIES.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate ability id");
  const schools = new Set([null, ...SCHOOLS]);
  for (const a of ALL_ABILITIES) {
    assert.ok(schools.has(a.school), `${a.id}: bad school`);
    assert.ok(a.name && a.desc, `${a.id}: missing text`);
    const m = E.ABILITY_META[a.id];
    assert.ok(m, `${a.id}: missing ABILITY_META`);
    assert.ok(m.odds > 0, `${a.id}: odds`);
    assert.equal(m.p.length, 3, `${a.id}: p needs 3 grades`);
    assert.equal(typeof m.fmt, "function");
    for (let g = 1; g <= 3; g++) assert.match(String(m.fmt(m.p[g - 1], m.q?.[g - 1])), /\S/, `${a.id}: empty detail`);
  }
  assert.deepEqual(Object.keys(E.ABILITY_META).sort(), ids.slice().sort(), "ABILITY_META must cover exactly the ability catalog");
  const wids = ALL_WEAPONS.map((w) => w.id);
  assert.equal(new Set(wids).size, wids.length, "duplicate weapon id");
  for (const w of E.EXTRA_WEAPONS) {
    for (const k of ["id", "name", "type", "min", "max", "speed", "block", "effect"]) assert.notEqual(w[k], undefined, `${w.id}.${k}`);
    assert.ok(w.min > 0 && w.max >= w.min, `${w.id}: damage range`);
    assert.ok(schools.has(w.school), `${w.id}: school`);
    assert.ok(w.odds > 0);
  }
});

test("baseProfile never draws from evolution-only content", () => {
  for (const school of SCHOOLS) for (const name of NAMES) {
    const p = E.baseProfile(name, school);
    assert.ok(E.ABILITIES.some((a) => a.id === p.abilities[0].id));
    assert.ok(E.WEAPONS.some((w) => w.id === p.weapon.id));
  }
});

test("owning an ability twice upgrades its grade, capped at III", () => {
  let raw = kit("Grado", "verdant", { abilities: [["roots", 1]] });
  const up = { level: 2, id: "x", effect: { type: "ability_upgrade", id: "roots" } };
  raw.levelBonuses = [up];
  assert.equal(E.gradeOf(E.effective(raw).abilities, "roots"), 2);
  raw.levelBonuses = [up, { ...up, level: 3 }, { ...up, level: 4 }, { ...up, level: 5 }];
  assert.equal(E.gradeOf(E.effective(raw).abilities, "roots"), 3);
  const view = E.abilityViews(E.effective(raw).abilities).find((a) => a.id === "roots");
  assert.equal(view.grade, 3);
  assert.match(view.detail, /20%/);
});

test("grade I of original abilities reproduces the previous constants", () => {
  const expected = { roots: .12, toxic_spores: .18, solar_aegis: .07, judgement: .18, flame_break: .16, execution: 1.25, dark_pact: .08, soul_bite: .12,
    phase_step: .08, mirror_strike: .25, disarm: .10, counter: .25, weapon_master: .10, last_word: .35 };
  for (const [id, v] of Object.entries(expected)) assert.equal(E.ABILITY_META[id].p[0], v, id);
});

test("evolution options are deterministic and well-formed for every level and school", () => {
  for (const school of SCHOOLS) for (let i = 0; i < 6; i++) {
    const raw = E.baseProfile("Evo" + i, school);
    for (let level = 2; level <= 50; level++) {
      const a = E.evolutionOptions(raw, level), b = E.evolutionOptions(raw, level);
      assert.deepEqual(a, b);
      assert.equal(a.length, 2);
      assert.notEqual(a[0].id, a[1].id);
      for (const o of a) {
        assert.ok(o.id && o.kind && o.title && o.desc && o.effect, "option shape");
        if (o.kind === "ability") {
          assert.ok(o.chance > 0 && o.chance <= 100, "ability option exposes its chance");
          assert.ok(["Común", "Poco común", "Rara", "Muy rara"].includes(o.rarity));
        }
      }
    }
  }
});

test("playing 49 random evolutions never breaks the profile (grades <= III, no duplicates, ability limits)", () => {
  for (const school of SCHOOLS) for (let i = 0; i < 20; i++) {
    const raw = E.baseProfile("Run" + i, school);
    raw.levelBonuses = [];
    for (let level = 2; level <= 50; level++) {
      const opts = E.evolutionOptions(raw, level);
      const o = opts[(i + level) % 2];
      raw.levelBonuses.push({ level, id: o.id, kind: o.kind, title: o.title, desc: o.desc, effect: E.clone(o.effect) });
    }
    const c = E.effective(raw);
    const ids = c.abilities.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length, "ability duplicated");
    for (const a of c.abilities) {
      assert.ok(a.grade >= 1 && a.grade <= 3);
      assert.ok(!a.school || a.school === school, `${a.id} is locked to another school`);
    }
    for (const v of Object.values(c.stats)) assert.ok(Number.isFinite(v));
    const d = E.derived(raw, {});
    for (const [k, v] of Object.entries(d)) if (typeof v === "number") assert.ok(Number.isFinite(v), `derived.${k}`);
  }
});

test("when every ability is exhausted the fallback is +1/+1 on two different stats", () => {
  const raw = E.baseProfile("Maxed", "phantasm");
  raw.abilities = ALL_ABILITIES.filter((a) => !a.school || a.school === "phantasm").map((a) => ({ id: a.id, name: a.name, school: a.school, desc: a.desc, grade: E.ABILITY_META[a.id].maxGrade || 3 }));
  let seen = 0;
  for (let level = 2; level <= 40; level++) for (const o of E.evolutionOptions(raw, level)) {
    assert.notEqual(o.kind === "ability", true, "no ability should be offered when all are maxed");
    if (o.effect.type === "stats2") {
      seen++;
      assert.equal(o.effect.stats.length, 2);
      assert.notEqual(o.effect.stats[0].stat, o.effect.stats[1].stat);
    }
  }
  assert.ok(seen > 0, "fallback never triggered");
});

test("pendingEvolutionFor returns the first unresolved level and its options", () => {
  const raw = E.baseProfile("Pend", "ascendant");
  raw.levelBonuses = [];
  assert.equal(E.pendingEvolutionFor(raw, 1), null);
  const p = E.pendingEvolutionFor(raw, 4);
  assert.equal(p.level, 2);
  assert.equal(p.remaining, 3);
  assert.deepEqual(p.options, E.evolutionOptions(raw, 2));
  const view = E.evolutionView(raw, 3);
  assert.equal(view.pending.level, 2);
  assert.ok(Array.isArray(view.abilities));
});

test("the same seed gives the same duel; every duel terminates with sane numbers", () => {
  const a = kit("Aldric", "eradication", { abilities: ["thunder_chain", "iron_will"], weapon: "colossus_mallet" });
  const b = kit("Brisa", "phantasm", { abilities: ["veil_dance", "sixth_sense"], weapon: "mist_fan" });
  const r1 = duel(a, b, "same"), r2 = duel(a, b, "same");
  assert.deepEqual(r1.log, r2.log);
  for (let i = 0; i < 200; i++) {
    const r = duel(a, b, "t" + i);
    assert.ok(r.log.filter((l) => l.startsWith("RONDA")).length <= 24);
    for (const f of [r.a, r.b]) assert.ok(Number.isFinite(f.hp) && f.hp >= 0 && f.hp <= f.maxHp + 1e-9);
  }
});

function logsFor(a, b, n = 300) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(duel(a, b, "m" + i).log.join("\n"));
  return out.join("\n");
}
const dummy = (school = "verdant") => kit("Dummy", school, {});

test("Voluntad Inquebrantable survives the first lethal hit once", () => {
  const f = E.fighter(who("W"), kit("W", "ascendant", { abilities: [["iron_will", 1]] }));
  f.hp = 10;
  const ev = [];
  assert.equal(E.deal(f, 500, ev), 9);
  assert.equal(f.hp, 1);
  assert.ok(f.willUsed);
  assert.match(ev.join(), /Voluntad Inquebrantable/);
  E.deal(f, 5, ev);
  assert.equal(f.hp, 0, "second lethal hit kills");
});

test("Piel de Roca caps a single hit at a fraction of max HP", () => {
  const f = E.fighter(who("S"), kit("S", "verdant", { abilities: [["stone_skin", 1]] }));
  f.hp = f.maxHp;
  const dealt = E.deal(f, f.maxHp, []);
  assert.equal(dealt, Math.round(f.maxHp * 0.25));
});

test("new passives fire in real duels", () => {
  const strong = (extra = {}) => kit("Strong", "eradication", { abilities: [], weapon: "iron_sword", ...extra });
  const checks = [
    ["veil_dance", "ascendant", /Danza del Velo/],
    ["sixth_sense", "phantasm", /Sexto Sentido/],
    ["thunder_chain", "ascendant", /Cadena de Trueno/],
    ["determination", "verdant", /Determinación/],
    ["basalt_skull", "eradication", /Cráneo de Basalto/],
    ["arcane_sabotage", "eradication", /Sabotaje Arcano/],
    ["monk_path", "ascendant", /Camino del Monje|medita/],
    ["quick_sap", "verdant", /Savia Acelerada/],
    ["weapon_swap", "phantasm", /Impostor de Armas/],
  ];
  for (const [id, school, re] of checks) {
    const a = kit("Alpha", school, { abilities: [[id, 3]], weapon: id === "weapon_swap" ? "ash_staff" : null });
    const b = kit("Beta", id === "quick_sap" ? "eradication" : "eradication", { weapon: "ember_maul" });
    const text = logsFor(a, b, 400);
    assert.ok(re.test(text), `${id} never triggered`);
  }
});

test("Agarre Rúnico protects against weapon destruction; destroyed weapons are really lost", () => {
  const saboteur = kit("Sab", "eradication", { abilities: [["arcane_sabotage", 3]], weapon: "ember_maul" });
  const plain = kit("Plain", "verdant", { weapon: "iron_sword" });
  const gripped = kit("Grip", "verdant", { abilities: [["rune_grip", 3]], weapon: "iron_sword" });
  assert.ok(/destroza el arma de B/.test(logsFor(saboteur, plain)), "Sabotaje Arcano never broke a weapon");
  const withGrip = logsFor(saboteur, gripped);
  assert.ok(/Agarre Rúnico/.test(withGrip), "Agarre Rúnico never triggered");
  const r = duel(saboteur, plain, "break-check");
  const broke = r.log.some((l) => /destroza el arma de B/.test(l));
  if (broke) assert.ok(r.b.disarmed > 50, "weapon stays broken for the rest of the duel");
});

test("Impostor de Armas swaps to a damaged copy only when the rival weapon is better", () => {
  const spy = kit("Spy", "phantasm", { abilities: [["weapon_swap", 1]], weapon: "ash_staff" });
  const heavy = kit("Heavy", "eradication", { weapon: "ember_maul" });
  const r = duel(spy, heavy, "swap");
  assert.match(r.a.weapon.name, /\(copia\)/);
  assert.equal(r.b.weapon.id, "ash_staff");
  assert.ok(r.a.weapon.max < heavy.weapon.max, "copy is weaker than the original");
  const better = kit("Spy2", "phantasm", { abilities: [["weapon_swap", 1]], weapon: "ember_maul" });
  const weak = kit("Weak", "verdant", { weapon: "arcane_tome" });
  const r2 = duel(better, weak, "noswap");
  assert.equal(r2.a.weapon.id, "ember_maul", "no swap when it would not help");
});

test("weapon mods are data-driven and reach the fighter", () => {
  const dagger = E.fighter(who("D"), kit("D", "verdant", { weapon: "obsidian_dagger" }));
  const iron = E.fighter(who("I"), kit("I", "verdant", { weapon: "iron_sword" }));
  assert.ok(dagger.crit > iron.crit - 0.0001 || dagger.dodge > iron.dodge);
  const lance = E.fighter(who("L"), kit("L", "ascendant", { weapon: "sun_lance" }));
  const base = E.derived(kit("L", "ascendant", { weapon: "sun_lance" }), {});
  assert.equal(base.accuracy, lance.accuracy);
  const trident = E.fighter(who("T"), kit("T", "abyssal", { weapon: "abyssal_trident" }));
  assert.ok(trident.weaponDisarm > 0 && trident.lifesteal > 0);
});

test("balance guard: no single new ability or weapon dominates or is useless", () => {
  const N = 400, opp = (i) => E.baseProfile("Mago" + ((i * 7 + 3) % 40), SCHOOLS[(i * 3 + 1) % 5]);
  const rate = (build) => {
    let w = 0;
    for (let i = 0; i < N; i++) {
      const school = SCHOOLS[i % 5], base = E.baseProfile("Mago" + (i % 40), school);
      if (duel(build(base, school), opp(i), "bal|" + i).won) w++;
    }
    return w / N;
  };
  const base = rate((r) => r);
  assert.ok(base > 0.40 && base < 0.55, `baseline off: ${base}`);
  for (const a of E.EVOLVE_ABILITIES) {
    for (const grade of [1, 3]) {
      const r = rate((b, school) => kit("Mago", school, { abilities: [[a.id, grade]] }) && Object.assign(E.clone(b), { abilities: b.abilities.filter((x) => x.id !== a.id).concat([{ id: a.id, name: a.name, school: a.school, desc: a.desc, grade }]) }));
      assert.ok(r > 0.22 && r < 0.72, `${a.id} grade ${grade} win rate ${r.toFixed(2)} outside sane band`);
    }
  }
  for (const w of E.EXTRA_WEAPONS) {
    const r = rate((b) => Object.assign(E.clone(b), { weapon: E.clone(w) }));
    assert.ok(r > 0.25 && r < 0.68, `${w.id} win rate ${r.toFixed(2)} outside sane band`);
  }
});
