import test from "node:test";
import assert from "node:assert/strict";
import { loadEngine } from "./lib/duel-engine.mjs";
import { SCHOOLS } from "./lib/duel-golden.mjs";

const E = loadEngine();
const ALL = [...E.ABILITIES, ...E.EVOLVE_ABILITIES];
const who = (name, school = "verdant") => ({ mage_name: name, school_code: school });

function kit(name, school, { abilities = [], weapon = null, familiar = null, familiars = [] } = {}) {
  const raw = E.baseProfile(name, school);
  if (weapon) raw.weapon = E.clone([...E.WEAPONS, ...E.EXTRA_WEAPONS].find((w) => w.id === weapon));
  for (const spec of abilities) {
    const [id, grade = 1] = Array.isArray(spec) ? spec : [spec];
    const d = ALL.find((a) => a.id === id);
    raw.abilities = raw.abilities.filter((a) => a.id !== id).concat([{ id, name: d.name, school: d.school, desc: d.desc, grade }]);
  }
  for (const spec of familiar ? [familiar].concat(familiars) : familiars) {
    const [id, grade = 1] = Array.isArray(spec) ? spec : [spec];
    const d = E.familiarDef(id);
    raw.familiars = (raw.familiars || []).concat([{ id, name: d.name, school: d.school, desc: d.desc, grade }]);
  }
  return raw;
}
const duel = (a, b, seed) => E.simulate(who("A"), a, {}, who("B"), b, {}, seed);
const logs = (a, b, n = 200) => Array.from({ length: n }, (_, i) => duel(a, b, "sf" + i).log);

const SPELL_IDS = ["banquete_almas", "despojo", "furia_arcana", "elixir_tragico", "red_raices", "orbe_explosivo", "golpe_aplastante", "diluvio_armas", "vampirismo", "prisa_espectral", "eco_onirico", "grito_espectral", "hipnosis_onirica", "ofrenda_familiar", "eco_invocado"];

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

test("evolution offers familiars (up to three, all distinct) and upgrades the owned ones", () => {
  let sawNew = 0, sawUpgrade = 0, sawThree = 0;
  for (const school of SCHOOLS) for (let i = 0; i < 25; i++) {
    const raw = E.baseProfile("Fam" + i, school);
    raw.levelBonuses = [];
    for (let level = 2; level <= 50; level++) {
      const opts = E.evolutionOptions(raw, level);
      const pick = opts.find((o) => o.kind === "familiar") || opts[level % 2];
      if (pick.kind === "familiar") pick.effect.type === "familiar" ? sawNew++ : sawUpgrade++;
      raw.levelBonuses.push({ level, id: pick.id, kind: pick.kind, title: pick.title, desc: pick.desc, effect: E.clone(pick.effect) });
      const c = E.effective(raw);
      assert.ok(c.familiars.length <= 3, "never more than three familiars");
      assert.equal(new Set(c.familiars.map((x) => x.id)).size, c.familiars.length, "familiars are distinct");
      for (const x of c.familiars) assert.ok(x.grade >= 1 && x.grade <= 3);
      for (const o of E.evolutionOptions(raw, level + 1)) {
        if (o.effect.type === "familiar") { assert.ok(c.familiars.length < 3); assert.ok(!c.familiars.some((x) => x.id === o.effect.familiar.id)); }
        if (o.effect.type === "familiar_upgrade") assert.ok(c.familiars.some((x) => x.id === o.effect.id));
      }
      if (c.familiars.length === 3) sawThree++;
    }
  }
  assert.ok(sawNew > 0 && sawUpgrade > 0 && sawThree > 0, "new familiars, upgrades and a full roster must all occur");
});

test("familiar bonuses replay deterministically and respect the cap", () => {
  const raw = E.baseProfile("Rep", "verdant");
  const add = (level, id) => { const d = E.familiarDef(id); return { level, effect: { type: "familiar", familiar: { id, name: d.name, school: d.school, desc: "x" } } }; };
  raw.levelBonuses = [
    add(2, "ash_spark"),
    { level: 3, effect: { type: "familiar_upgrade", id: "ash_spark" } },
    { level: 4, effect: { type: "familiar_upgrade", id: "ash_spark" } },
    { level: 5, effect: { type: "familiar_upgrade", id: "ash_spark" } },
    add(6, "root_behemoth"), add(7, "sun_hound"), add(8, "wandering_shadow"), add(9, "ash_spark"),
  ];
  const c = E.effective(raw);
  assert.deepEqual(Array.from(c.familiars.map((x) => x.id)), ["ash_spark", "root_behemoth", "sun_hound"]);
  assert.equal(c.familiars[0].grade, 3);
  const views = E.evolutionView(raw, 9).familiars;
  assert.equal(views.length, 3);
  assert.ok(views.every((v) => v.detail.length > 10));
});

test("several familiars are summoned together and cost the owner HP", () => {
  const plain = kit("A", "verdant"), crowd = kit("A", "verdant", { familiars: ["ash_spark", "sun_hound", "root_behemoth"] });
  const dPlain = E.derived(plain, {}), dCrowd = E.derived(crowd, {});
  assert.ok(dCrowd.maxHp < dPlain.maxHp, "each familiar costs max HP");
  assert.ok(dCrowd.maxHp > dPlain.maxHp * 0.8, "but not an absurd amount");
  const r = duel(crowd, kit("B", "eradication"), "crowd");
  assert.equal(r.a.pets.length, 3);
  assert.equal(r.log.filter((l) => /^A invoca a su familiar/.test(l)).length, 3);
  assert.ok(r.log.some((l) => /muerde/.test(l)));
});

test("Banquete de Almas devours fallen familiars and heals", () => {
  const eater = kit("E", "abyssal", { abilities: [["banquete_almas", 3]] });
  const rival = kit("R", "verdant", { familiars: ["ash_spark", "sun_hound"], abilities: [["orbe_explosivo", 3], ["diluvio_armas", 3]] });
  let ate = 0;
  for (const log of logs(eater, rival, 300)) {
    const fell = log.some((l) => /cae derrotado|huye/.test(l));
    const feast = log.filter((l) => /Banquete de Almas/.test(l)).length;
    if (feast) { ate++; assert.ok(fell, "can only feast after a familiar fell"); assert.ok(feast <= 4); }
  }
  assert.ok(ate > 0, "Banquete never fired");
  const solo = logs(eater, kit("R", "verdant"), 100);
  assert.ok(solo.every((log) => !log.some((l) => /Banquete de Almas/.test(l))), "no corpses, no feast");
});

test("thrown weapons: natural throwers and Lanzador Sombrío throw, ignore block and never lose the weapon", () => {
  const stars = kit("S", "phantasm", { weapon: "crystal_stars" });
  const blocker = kit("R", "ascendant", { weapon: "reflect_disc" });
  const all = logs(stars, blocker, 200);
  assert.ok(all.some((log) => log.some((l) => /^A lanza /.test(l))), "thrown weapon is thrown");
  const lanzador = kit("L", "abyssal", { abilities: [["lanzador_sombrio", 3]], weapon: "iron_sword" });
  const lines = logs(lanzador, kit("R2", "verdant"), 200);
  assert.ok(lines.some((log) => log.some((l) => /^A lanza Espada de Hierro/.test(l))), "Lanzador throws ordinary weapons");
  for (let i = 0; i < 80; i++) { const r = duel(lanzador, kit("R2", "verdant"), "t" + i); assert.ok(!(r.a.disarmed > 0), "throwing never costs the weapon"); }
  const plainLines = logs(kit("P", "verdant"), kit("R3", "verdant"), 50);
  assert.ok(plainLines.every((log) => !log.some((l) => /^A lanza /.test(l))), "no throws without the ability or a thrown weapon");
});

test("Desvío Arcano deflects thrown weapons and adds crit; Lanzador's wearer blocks throws", () => {
  const thrower = kit("T", "phantasm", { weapon: "crystal_stars" });
  const deflector = kit("D", "phantasm", { abilities: [["desvio_arcano", 3]] });
  assert.ok(logs(thrower, deflector, 300).some((log) => log.some((l) => /desvía el arma lanzada de A con Desvío Arcano/.test(l))), "Desvío never triggered");
  assert.ok(E.derived(deflector, {}).crit > E.derived(kit("D", "phantasm"), {}).crit, "Desvío adds crit");
  const shielded = kit("S", "abyssal", { abilities: [["lanzador_sombrio", 3]] });
  assert.ok(logs(thrower, shielded, 300).some((log) => log.some((l) => /bloquea con éxito el golpe de A/.test(l))), "Lanzador's block vs throws never triggered");
});

test("Ascensión: more life and attack, but no dodge and slow", () => {
  const base = kit("A", "ascendant"), god = kit("A", "ascendant", { abilities: [["ascension", 3]] });
  const b = E.derived(base, {}), g = E.derived(god, {});
  assert.ok(g.maxHp > b.maxHp * 1.15 && g.attack > b.attack * 1.05);
  assert.equal(g.dodge, 0);
  assert.ok(g.speed <= b.speed * 0.55);
  assert.ok(logs(god, kit("R", "verdant"), 100).every((log) => !log.some((l) => /evita el ataque de B/.test(l))), "Ascensión never dodges");
});

test("Vendaje de Savia gives +2 Arena duels per day and is not offered twice", () => {
  const plain = kit("V", "verdant"), vend = kit("V", "verdant", { abilities: ["vendaje"] });
  assert.equal(E.arenaBonusFights(plain), 0);
  assert.equal(E.arenaBonusFights(vend), 2);
  assert.match(E.abilityViews(E.effective(vend).abilities).find((a) => a.id === "vendaje").detail, /\+2 combates clasificatorios/);
  assert.equal(E.ABILITY_META.vendaje.maxGrade, 1);
  for (let level = 2; level <= 50; level++) for (const o of E.evolutionOptions(vend, level)) assert.ok(!(o.effect.type === "ability" && o.effect.ability.id === "vendaje") && !(o.effect.type === "ability_upgrade" && o.effect.id === "vendaje"));
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
  for (const id of [...SPELL_IDS, "saboteador", "banquete_almas", "desvio_arcano", "lanzador_sombrio", "ascension"]) for (const grade of [1, 3]) {
    const d = ALL.find((a) => a.id === id);
    const r = rate((b) => Object.assign(E.clone(b), { abilities: b.abilities.filter((x) => x.id !== id).concat([{ id, name: d.name, school: d.school, desc: d.desc, grade }]) }));
    assert.ok(r > 0.30 && r < 0.72, `${id} g${grade} win rate ${r.toFixed(2)} outside sane band`);
  }
  for (const roster of [["ash_spark", "sun_hound"], ["ash_spark", "sun_hound", "wandering_shadow"], ["root_behemoth", "oneiric_panther", "ash_spark"]]) {
    const r = rate((b) => Object.assign(E.clone(b), { familiars: roster.map((id) => { const f = E.familiarDef(id); return { id, name: f.name, school: f.school, desc: f.desc, grade: 3 }; }) }));
    assert.ok(r > 0.40 && r < 0.78, `roster ${roster.join("+")} win rate ${r.toFixed(2)} outside sane band`);
  }
  for (const f of E.FAMILIARS) for (const grade of [1, 3]) {
    const r = rate((b) => Object.assign(E.clone(b), { familiars: [{ id: f.id, name: f.name, school: f.school, desc: f.desc, grade }] }));
    assert.ok(r > 0.40 && r < 0.70, `familiar ${f.id} g${grade} win rate ${r.toFixed(2)} outside sane band`);
  }
});
