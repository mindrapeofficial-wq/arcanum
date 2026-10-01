// Loads the pure duel engine out of the arcanum-state edge function so it can be
// unit-tested in Node (the function itself needs Deno + Supabase to run).
// Only code between `// @duel-engine:begin` and `// @duel-engine:end` markers is used;
// those regions must stay free of imports, Deno APIs and database calls.
import fs from "node:fs";
import vm from "node:vm";
import { stripTypeScriptTypes } from "node:module";

const SOURCE = new URL("../../supabase/functions/arcanum-state/index.ts", import.meta.url);

export function extractEngineSource(text = fs.readFileSync(SOURCE, "utf8")) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let inside = false;
  for (const line of lines) {
    if (line.trim() === "// @duel-engine:begin") { inside = true; continue; }
    if (line.trim() === "// @duel-engine:end") { inside = false; continue; }
    if (inside) out.push(line);
  }
  if (inside) throw new Error("Unterminated @duel-engine region");
  return out.join("\n");
}

const EXPORTS = [
  "STAT_META", "WEAPONS", "TRAITS", "ABILITIES",
  "clone", "hash", "rngFrom", "baseProfile", "effective", "evolutionOptions",
  "traitMods", "derived", "fighter", "hit", "simulate",
];

export function loadEngine(text) {
  const src = extractEngineSource(text);
  const present = EXPORTS.filter((name) => new RegExp(`(function|const|let)\\s+${name}\\b`).test(src));
  const extra = ["EVOLVE_ABILITIES", "EXTRA_WEAPONS", "ABILITY_META", "gradeOf", "abilityParam", "abilityViews", "pendingEvolutionFor", "evolutionView", "duelRounds", "deal", "SPELLS", "FAMILIARS", "familiarView", "familiarDef", "makePet", "livePets"]
    .filter((name) => new RegExp(`(function|const|let)\\s+${name}\\b`).test(src));
  const js = stripTypeScriptTypes(src + `\n;({${present.concat(extra).join(",")}})`);
  return vm.runInNewContext(js, { Math, JSON, Number, String, Object, Array, Set, Map, Infinity, Date }, { filename: "duel-engine.js" });
}
