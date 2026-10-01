import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { loadEngine } from "./lib/duel-engine.mjs";

const E = loadEngine();
const code = fs.readFileSync(new URL("../assets/js/combat-profile.js", import.meta.url), "utf8");

function sandbox(api) {
  const calls = [];
  const ctx = {
    console, Math, JSON, Number, String, Object, Array, Set, Map,
    realmState: { realm: { mage_name: "Aldric", school_code: "verdant" } },
    esc: (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
    n: (v) => String(v),
    localStorage: { getItem: () => null },
    toast: () => {}, humanError: (e) => String(e?.message || e),
    stateApi: async (path, opts) => { calls.push([path, opts]); return api(path, opts); },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx, { filename: "combat-profile.js" });
  return { ctx, calls };
}

const profile = { mage_name: "Aldric", school_code: "verdant", is_self: true, archmage_level: 3 };
function serverState() {
  const raw = E.baseProfile("Aldric", "verdant");
  raw.levelBonuses = [];
  return raw;
}

test("client hydrates server evolution view and renders its options with rarity", async () => {
  const raw = serverState();
  const view = E.evolutionView(raw, 3);
  const { ctx } = sandbox(async () => ({ combat: raw, evolution_view: view }));
  await ctx.combatHydrateProfile(profile);
  const options = ctx.combatEvolutionOptions(profile, view.pending.level);
  assert.deepEqual(JSON.parse(JSON.stringify(options)), JSON.parse(JSON.stringify(view.pending.options)), "client must use the server options verbatim");
  const html = ctx.renderCombatIdentity(profile);
  assert.match(html, /EVOLUCIÓN PENDIENTE · NIVEL 2/);
  for (const o of view.pending.options) assert.ok(html.includes(ctx.esc(o.title)), `option ${o.id} rendered`);
  if (view.pending.options.some((o) => o.rarity)) assert.match(html, /% de aparecer/);
});

test("client never recomputes evolution options locally (avoids server-rejected ids)", async () => {
  const raw = serverState();
  const { ctx } = sandbox(async () => ({ combat: raw }));
  await ctx.combatHydrateProfile(profile);
  assert.deepEqual(Array.from(ctx.combatEvolutionOptions(profile, 2)), []);
  const html = ctx.renderCombatIdentity(profile);
  assert.match(html, /No se pudieron cargar las opciones desde el servidor/);
  assert.doesNotMatch(html, /data-combat-evolution/);
});

test("abilities show their grade and numbers; upgrades rebuild locally", async () => {
  const raw = serverState();
  const first = raw.abilities[0];
  raw.levelBonuses = [{ level: 2, id: "up", kind: "ability", title: "up", desc: "", effect: { type: "ability_upgrade", id: first.id } }];
  const view = { abilities: E.abilityViews(E.effective(raw).abilities), pending: null };
  const { ctx } = sandbox(async () => ({ combat: raw, evolution_view: view }));
  await ctx.combatHydrateProfile({ ...profile, archmage_level: 2 });
  const c = ctx.getCombatProfile(profile);
  const row = c.abilities.find((a) => a.id === first.id);
  assert.equal(row.grade, 2);
  assert.ok(row.detail && row.detail.length > 3);
  const html = ctx.renderCombatIdentity({ ...profile, archmage_level: 2 });
  assert.match(html, /Grado II/);
  assert.ok(html.includes(ctx.esc(row.detail)));
});

test("choosing an option posts to the server and refreshes the cached view", async () => {
  const raw = serverState();
  const view = E.evolutionView(raw, 3);
  const choice = view.pending.options[0];
  let after = null;
  const { ctx, calls } = sandbox(async (path) => {
    if (path === "/combat/evolve") {
      const next = E.clone(raw);
      next.levelBonuses = [{ level: 2, id: choice.id, kind: choice.kind, title: choice.title, desc: choice.desc, effect: choice.effect }];
      after = E.evolutionView(next, 3);
      return { combat: next, chosen: choice, evolution_view: after };
    }
    return { combat: raw, evolution_view: view };
  });
  await ctx.combatHydrateProfile(profile);
  const chosen = await ctx.combatChooseEvolution(profile, 2, choice.id);
  assert.equal(chosen.id, choice.id);
  const post = calls.find(([p]) => p === "/combat/evolve");
  assert.deepEqual(JSON.parse(JSON.stringify(post[1].body)), { level: 2, option_id: choice.id });
  assert.equal(ctx.combatEvolutionOptions(profile, 3).length, 2, "next pending level now comes from the refreshed view");
});

test("stats2 fallback and new ability effects are applied by the client for display", async () => {
  const raw = serverState();
  const before = { ...raw.stats };
  raw.levelBonuses = [{ level: 2, id: "s", kind: "stat", title: "s", desc: "", effect: { type: "stats2", stats: [{ stat: "strength", amount: 1 }, { stat: "will", amount: 1 }] } }];
  const { ctx } = sandbox(async () => ({ combat: raw, evolution_view: { abilities: [], pending: null } }));
  await ctx.combatHydrateProfile({ ...profile, archmage_level: 2 });
  const c = ctx.getCombatProfile(profile);
  assert.equal(c.stats.strength, before.strength + 1);
  assert.equal(c.stats.will, before.will + 1);
});
