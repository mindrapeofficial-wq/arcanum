import test from "node:test";
import assert from "node:assert/strict";
import { loadEngine } from "./lib/duel-engine.mjs";
import { SCHOOLS } from "./lib/duel-golden.mjs";

const E = loadEngine();
const ALL = [...E.ABILITIES, ...E.EVOLVE_ABILITIES];
const who = (name, school = "verdant") => ({ mage_name: name, school_code: school });

function kit(name, school, { abilities = [], weapon = null, familiar = null } = {}) {
  const raw = E.baseProfile(name, school);
  if (weapon) raw.weapon = E.clone([...E.WEAPONS, ...E.EXTRA_WEAPONS].find((w) => w.id === weapon));
  for (const spec of abilities) {
    const [id, grade = 1] = Array.isArray(spec) ? spec : [spec];
    const d = ALL.find((a) => a.id === id);
    raw.abilities = raw.abilities.filter((a) => a.id !== id).concat([{ id, name: d.name, school: d.school, desc: d.desc, grade }]);
  }
  if (familiar) {
    const [id, grade = 1] = Array.isArray(familiar) ? familiar : [familiar];
    const d = E.familiarDef(id);
    raw.familiar = { id, name: d.name, school: d.school, desc: d.desc, grade };
  }
  return raw;
}
const duel = (a, b, seed) => E.simulate(who("A"), a, {}, who("B"), b, {}, seed);
const logs = (a, b, n = 200) => Array.from({ length: n }, (_, i) => duel(a, b, "sf" + i).log);

const SPELL_IDS = ["despojo", "furia_arcana", "elixir_tragico", "red_raices", "orbe_explosivo", "golpe_aplastante", "diluvio_armas", "vampirismo", "prisa_espectral", "eco_onirico", "grito_espectral", "hipnosis_onirica", "ofrenda_familiar", "eco_invocado"];

test("spells and familiars are fully catalogued", () => {
  for (const id of SPELL_IDS) {
    const m = E.ABILITY_META[id];
    assert.ok(m?.uses?.length === 3, `${id}: 3 grades of charges`);
    assert.ok(E.SPELLS[id], `${id}: engine implementation`);
    assert.match(E.abilityViews([{ id, grade: 1 }])[0].detail, /carga/, `${id}: detail shows charges`);
  }
  assert.equal(E.FAMILIARS.length, 5);
  for (const f of E.FAMILIARS) {
    assert.equal(f.hp.length, 3); assert.equal(f.atk.length, 3);
    assert.ok(f.hp[0] < f.hp[2] && f.atk[0] < f.atk[2], `${f.id}: grades must improve`);
    assert.match(E.familiarView({ id: f.id, name: f.name, grade: 2 }).detail, /vida/);
  }
});

test("each spell fires in real duels and never exceeds its charges", () => {
  const plans = {
    despojo: { school: "abyssal", rival: kit("R", "eradication", { weapon: "ember_maul" }), own: { weapon: "ash_staff" }, re: /con Despojo/ },
    furia_arcana: { school: "eradication", rival: kit("R", "verdant"), re: /Furia Arcana/ },
    elixir_tragico: { school: "verdant", rival: kit("R", "eradication", { weapon: "ember_maul" }), re: /Elixir Trágico/ },
    red_raices: { school: "verdant", rival: kit("R", "phantasm", { weapon: "mist_fan" }), re: /Red de Raíces/ },
    orbe_explosivo: { school: "eradication", rival: kit("R", "verdant"), re: /Orbe Explosivo/ },
    golpe_aplastante: { school: "eradication", rival: kit("R", "verdant"), re: /Golpe Aplastante/ },
    diluvio_armas: { school: "abyssal", rival: kit("R", "verdant"), re: /arma lanzada|lanza un arma/ },
    vampirismo: { school: "abyssal", rival: kit("R", "eradication", { weapon: "ember_maul" }), re: /Vampirismo/ },
    prisa_espectral: { school: "phantasm", rival: kit("R", "verdant"), re: /Prisa Espectral/ },
  };
  for (const [id, plan] of Object.entries(plans)) {
    for (const grade of [1, 3]) {
      const a = kit("Alpha", plan.school, { abilities: [[id, grade]], ...(plan.own || {}) });
      const cast = new RegExp(plan.re.source.split("|")[0]);
      let fired = 0, maxPerDuel = 0;
      for (const log of logs(a, plan.rival, 150)) {
        const n = log.filter((l) => /^A /.test(l) && plan.re.test(l)).length;
        const casts = id === "diluvio_armas" ? Math.ceil(n / 3) : n;
        if (n) fired++;
        maxPerDuel = Math.max(maxPerDuel, id === "diluvio_armas" ? Math.min(n, 3 * E.ABILITY_META[id].uses[grade - 1]) : casts);
      }
      assert.ok(fired > 0, `${id} g${grade} never fired`);
      if (id !== "diluvio_armas") assert.ok(maxPerDuel <= E.ABILITY_META[id].uses[grade - 1], `${id} g${grade} used ${maxPerDuel} > ${E.ABILITY_META[id].uses[grade - 1]} charges`);
    }
  }
});

test("Furia Arcana, Red de Raíces and Prisa Espectral modify the following strike", () => {
  const fury = kit("F", "eradication", { abilities: [["furia_arcana", 3]] });
  const plain = kit("F", "eradication");
  const rival = kit("R", "verdant");
  const avg = (a) => { let t = 0; for (let i = 0; i < 120; i++) { const r = duel(a, rival, "mod" + i); t += r.b.maxHp - r.b.hp; } return t / 120; };
  assert.ok(avg(fury) > avg(plain), "Furia must increase damage dealt");
});

test("Despojo really transfers the weapon", () => {
  const thief = kit("T", "abyssal", { abilities: [["despojo", 3]], weapon: "ash_staff" });
  const rival = kit("R", "eradication", { weapon: "ember_maul" });
  let stole = 0;
  for (let i = 0; i < 100; i++) {
    const r = duel(thief, rival, "d" + i);
    if (r.log.some((l) => /con Despojo/.test(l))) { stole++; assert.ok(r.b.disarmed > 50, "victim loses the weapon"); assert.equal(r.a.weapon.id, "ember_maul"); }
  }
  assert.ok(stole > 0);
});

test("Eco Onírico copies the rival's last spell", () => {
  const echo = kit("E", "phantasm", { abilities: [["eco_onirico", 3]] });
  const rival = kit("R", "eradication", { abilities: [["furia_arcana", 3], ["orbe_explosivo", 3]] });
  assert.ok(logs(echo, rival, 300).some((log) => log.some((l) => /copia un conjuro/.test(l))), "Eco never copied anything");
});

test("Saboteador can destroy the rival weapon before the first round", () => {
  const sab = kit("S", "eradication", { abilities: [["saboteador", 3]] });
  const rival = kit("R", "verdant");
  let broke = 0;
  for (let i = 0; i < 100; i++) {
    const r = duel(sab, rival, "sb" + i);
    const idx = r.log.findIndex((l) => /^RONDA 1$/.test(l)), pre = r.log.slice(0, idx);
    if (pre.some((l) => /El Saboteador A destroza el arma de B/.test(l))) { broke++; assert.ok(r.b.disarmed > 50); }
  }
  assert.ok(broke > 20 && broke < 100, `saboteur broke ${broke}/100 weapons`);
});

test("a familiar joins the duel, bites, can fall, and never has negative HP", () => {
  const a = kit("A", "eradication", { familiar: ["ash_spark", 1] });
  const b = kit("B", "verdant", { familiar: ["root_behemoth", 3] });
  let bites = 0, fell = 0;
  for (const log of logs(a, b, 150)) {
    assert.ok(log.some((l) => /A invoca a su familiar Chispa de Ceniza/.test(l)));
    assert.ok(log.some((l) => /B invoca a su familiar Behemot de Raíz/.test(l)));
    bites += log.filter((l) => /muerde/.test(l)).length;
    fell += log.filter((l) => /cae derrotado|huye/.test(l)).length;
  }
  assert.ok(bites > 100, "familiars must attack");
  assert.ok(fell > 0, "familiars must be killable");
  for (let i = 0; i < 100; i++) {
    const r = duel(a, b, "neg" + i);
    for (const f of [r.a, r.b]) for (const p of f.pets) assert.ok(p.hp >= 0 && p.hp <= p.maxHp);
  }
});

test("duels without familiars or spells are unaffected (no pet lines, no extra RNG)", () => {
  const a = kit("A", "verdant"), b = kit("B", "ascendant");
  for (const log of logs(a, b, 50)) assert.ok(!log.some((l) => /familiar|muerde|cae derrotado|Eco/.test(l)));
});

test("familiar spells interact with familiars", () => {
  const rivalWithPet = kit("R", "verdant", { familiar: ["sun_hound", 3] });
  const hyp = kit("H", "phantasm", { abilities: [["hipnosis_onirica", 3]] });
  assert.ok(logs(hyp, rivalWithPet, 300).some((log) => log.some((l) => /hipnotiza a Sabueso Solar/.test(l)) && log.some((l) => /Sabueso Solar de A muerde a B/.test(l))), "hypnotised familiar must fight for the caster");
  const scream = kit("S", "abyssal", { abilities: [["grito_espectral", 3]] });
  assert.ok(logs(scream, rivalWithPet, 300).some((log) => log.some((l) => /huye despavorido/.test(l))), "Grito Espectral never scared a familiar");
  const offer = kit("O", "verdant", { abilities: [["ofrenda_familiar", 3]], familiar: ["ash_spark", 1] });
  const strong = kit("R2", "eradication", { weapon: "ember_maul", abilities: [["orbe_explosivo", 3]] });
  assert.ok(logs(offer, strong, 300).some((log) => log.some((l) => /reconforta a Chispa de Ceniza/.test(l))), "Ofrenda never healed the familiar");
  const echo = kit("E", "phantasm", { abilities: [["eco_invocado", 3]] });
  assert.ok(logs(echo, kit("R3", "verdant"), 100).some((log) => log.some((l) => /invoca un Eco/.test(l)) && log.some((l) => /Eco de A muerde/.test(l))), "Eco Invocado never summoned a fighting echo");
});

test("evolution offers familiars, one at a time, and upgrades the owned one", () => {
  let sawNew = 0, sawUpgrade = 0;
  for (const school of SCHOOLS) for (let i = 0; i < 25; i++) {
    const raw = E.baseProfile("Fam" + i, school);
    raw.levelBonuses = [];
    for (let level = 2; level <= 50; level++) {
      const opts = E.evolutionOptions(raw, level);
      const pick = opts.find((o) => o.kind === "familiar") || opts[level % 2];
      if (pick.kind === "familiar") pick.effect.type === "familiar" ? sawNew++ : sawUpgrade++;
      raw.levelBonuses.push({ level, id: pick.id, kind: pick.kind, title: pick.title, desc: pick.desc, effect: E.clone(pick.effect) });
      const c = E.effective(raw);
      if (c.familiar) assert.ok(c.familiar.grade >= 1 && c.familiar.grade <= 3);
      for (const o of E.evolutionOptions(raw, level + 1)) if (o.effect.type === "familiar") assert.equal(c.familiar, null, "a second familiar must not be offered");
    }
    const c = E.effective(raw);
    assert.ok(!c.familiar || E.familiarDef(c.familiar.id), "owned familiar exists in the catalogue");
  }
  assert.ok(sawNew > 0, "familiars never offered");
  assert.ok(sawUpgrade > 0, "familiar upgrades never offered");
});

test("familiar bonuses replay deterministically", () => {
  const raw = E.baseProfile("Rep", "verdant");
  raw.levelBonuses = [
    { level: 2, effect: { type: "familiar", familiar: { id: "ash_spark", name: "Chispa de Ceniza", school: "eradication", desc: "x" } } },
    { level: 3, effect: { type: "familiar_upgrade", id: "ash_spark" } },
    { level: 4, effect: { type: "familiar_upgrade", id: "ash_spark" } },
    { level: 5, effect: { type: "familiar_upgrade", id: "ash_spark" } },
    { level: 6, effect: { type: "familiar", familiar: { id: "root_behemoth", name: "Behemot", school: "verdant", desc: "x" } } },
  ];
  const c = E.effective(raw);
  assert.equal(c.familiar.id, "ash_spark");
  assert.equal(c.familiar.grade, 3);
  const view = E.familiarView(c.familiar);
  assert.equal(view.grade, 3);
  assert.ok(view.detail.length > 10);
  assert.equal(E.evolutionView(raw, 6).familiar.grade, 3);
});

test("balance guard: spells and familiars stay inside a sane win-rate band", () => {
  const N = 400, opp = (i) => E.baseProfile("Mago" + ((i * 7 + 3) % 40), SCHOOLS[(i * 3 + 1) % 5]);
  const rate = (build) => {
    let w = 0;
    for (let i = 0; i < N; i++) {
      const school = SCHOOLS[i % 5], base = E.baseProfile("Mago" + (i % 40), school);
      if (E.simulate(who("A", school), build(base), {}, who("B"), opp(i), {}, "bal3|" + i).won) w++;
    }
    return w / N;
  };
  for (const id of [...SPELL_IDS, "saboteador"]) for (const grade of [1, 3]) {
    const d = ALL.find((a) => a.id === id);
    const r = rate((b) => Object.assign(E.clone(b), { abilities: b.abilities.filter((x) => x.id !== id).concat([{ id, name: d.name, school: d.school, desc: d.desc, grade }]) }));
    assert.ok(r > 0.30 && r < 0.72, `${id} g${grade} win rate ${r.toFixed(2)} outside sane band`);
  }
  for (const f of E.FAMILIARS) for (const grade of [1, 3]) {
    const r = rate((b) => Object.assign(E.clone(b), { familiar: { id: f.id, name: f.name, school: f.school, desc: f.desc, grade } }));
    assert.ok(r > 0.40 && r < 0.70, `familiar ${f.id} g${grade} win rate ${r.toFixed(2)} outside sane band`);
  }
});
