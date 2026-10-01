// Deterministic fingerprint of the *existing* duel behaviour (base profiles + simulated duels).
// Used to prove that extending the engine does not change results for kits that only use
// the original weapons, traits and abilities.
import { loadEngine } from "./duel-engine.mjs";

export const SCHOOLS = ["verdant", "ascendant", "eradication", "abyssal", "phantasm"];
export const NAMES = ["Aldric", "Brisa", "Cael", "Dunya", "Eirene"];

export function profiles(engine) {
  const out = [];
  for (const school of SCHOOLS) for (const name of NAMES) out.push({ name, school, raw: engine.baseProfile(name, school) });
  return out;
}

export function fingerprint(engine = loadEngine()) {
  const ps = profiles(engine);
  const base = ps.map((p) => engine.hash(JSON.stringify(p.raw)));
  const duels = [];
  for (let i = 0; i < ps.length; i++) {
    for (const step of [1, 7, 13, 19, 24, 3]) {
      const a = ps[i], b = ps[(i + step) % ps.length];
      const sim = engine.simulate({ mage_name: a.name, school_code: a.school }, a.raw, {}, { mage_name: b.name, school_code: b.school }, b.raw, {}, `golden|${i}|${step}`);
      duels.push(engine.hash(JSON.stringify({ won: sim.won, log: sim.log, ah: sim.a.hp, bh: sim.b.hp })));
    }
  }
  return { base, duels };
}
