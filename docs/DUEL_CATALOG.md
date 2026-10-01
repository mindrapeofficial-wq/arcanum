# ARCANUM — Duel catalogue (abilities, weapons, grades)

Status: beta 0.3.40. Source of truth: `supabase/functions/arcanum-state/index.ts`, between the `// @duel-engine:begin/end` markers.

This extends the El Bruto-inspired Duel Weapon / ability / evolution system described in `docs/ARCHMAGE_IDENTITY.md` and `docs/ITEM_MODEL.md`. It does **not** change the Archmage aptitudes, the inventory model or the Arena rules.

## What exists

| Element | Count | Where |
|---|---:|---|
| Starter abilities (`ABILITIES`) | 14 | seeded by `baseProfile` |
| Evolution-only abilities (`EVOLVE_ABILITIES`) | 38 | reachable only through level-up evolution |
| Starter weapons (`WEAPONS`) | 10 | seeded by `baseProfile` |
| Evolution-only weapons (`EXTRA_WEAPONS`) | 21 | reachable only through level-up evolution |

`ABILITY_META` holds, for every ability: `odds` (relative draw weight), `p` / `q` (value per grade I/II/III), `fmt` (the text shown to the player) and optional `maxGrade`.

### Grades (Grado I–III)
Evolution can offer an ability the Archmage already owns. Taking it **upgrades its grade** (stored as an `ability_upgrade` level bonus, replayed by `effective()`), up to III. Maxed abilities leave the pool. When no ability can be offered the ability option falls back to **+1/+1 on two different stats** (`stats2` effect).

Option payloads expose `rarity` (Común / Poco común / Rara / Muy rara) and `chance` (% share of the current pool), shown in the evolution UI.

### Evolution-only abilities (23)
Numbers (grade I → III) are in `ABILITY_META`; the in-game text is generated from them.

- Stat boosters: Fuerza Ancestral, Gracia Arcana, Pulso Veloz, Savia Vital, Cuerpo Imperecedero, Visión Premonitoria
- Weapon/armour: Puño Arcano, Coraza de Ceniza, Brazo de Titán, Huesos de Plomo
- Combat rules: Voluntad Inquebrantable, Danza del Velo, Determinación, Piel de Roca, Cráneo de Basalto, Cadena de Trueno, Savia Acelerada, Agarre Rúnico, Camino del Monje, Sexto Sentido, Represalia, Sabotaje Arcano, Impostor de Armas

Each is locked to a school or neutral; the pool filter is the existing `!school || school === archmage.school` rule.

### Weapon modifiers
Weapons may carry `mods` (`crit`, `accuracy`, `dodge`, `block`, `regen`, `lifesteal`, `combo`, `poison`, `first`, `armor`, `disarm`) read by `derived()`. The original ten weapons still use their id-based effects. `heavy` / `blunt` flags (or the weapon `type`) feed Brazo de Titán and Huesos de Plomo.

## Spells with charges (phase 3)

Abilities with `uses` in `ABILITY_META` are **spells**: each duel the fighter gets `uses[grade-1]` charges (`fighter().charges`). Before attacking, `hit()` calls `chooseSpell()`: for each owned spell with charges and a true `SPELLS[id].cond(a,b)`, it casts with 35 % probability. `cast()` returns `"act"` (the spell spends the action) or `"attack"` (it sets `strikeMods` and the normal attack follows in the same action).

Spells: Despojo, Furia Arcana, Elixir Trágico, Red de Raíces, Orbe Explosivo, Golpe Aplastante, Diluvio de Armas, Vampirismo, Prisa Espectral, Eco Onírico (copies the rival's last spell), and the familiar spells Grito Espectral, Hipnosis Onírica, Ofrenda al Familiar, Eco Invocado. Saboteador is a start-of-duel talent (`prepareDuel`).

## Familiars (phase 4)

`FAMILIARS` (5) are a third combatant. Stats are fractions of the owner's `maxHp` / `attack` per grade. They are obtained through the same evolution pool as abilities (kind `familiar`, own-school emblem weighs x3) and **only one familiar can be owned**: once owned, only that familiar can be offered, to upgrade it (`familiar_upgrade`).

In `duelRounds`, familiars are summoned after `prepareDuel`, act right after their owner, and are targeted by the rival 10 % of the time while alive. They never decide the duel: victory is still decided by the Archmages' HP. `reportFallen()` logs their death, and a fallen familiar stays out of the duel. Familiars of owners without one never exist, so duels without familiars or spells consume exactly the same random numbers as before (golden test).

`evolution_view.familiar` and `combatPublicState().familiar` expose `{id,name,school,desc,grade,max_grade,detail}`.

## Compatibility rules (do not break)

1. **`baseProfile` must keep producing the same kit.** It draws only from `WEAPONS`, `TRAITS` and `ABILITIES`, with a seeded RNG. Never add entries to those arrays and never change their order; new content goes in `EVOLVE_ABILITIES` / `EXTRA_WEAPONS`. `tests/duel-engine.mjs` compares 25 base profiles and 150 full duel logs with `tests/fixtures/duel-golden.json`.
2. **Profile `version` stays 1.** Grades are additive: an ability without `grade` is grade I. No migration is needed and no Archmage loses evolutions.
3. **Evolution options are server-computed.** The server returns `evolution_view = { abilities, pending: { level, remaining, options } }` in `GET /snapshot`, `GET /combat/:name` and `POST /combat/evolve`. The client uses those options verbatim and no longer recomputes them (`combatEvolutionOptions`). `POST /combat/evolve` still validates the chosen id against `evolutionOptions`.
4. **Options are deterministic per level** (`seed|evolution|level|two-paths-v1`), but changing the pool changes them. Archmages with an unresolved level at deploy time may see different options after the deploy; already chosen bonuses are stored with their full effect and never change.
5. New RNG draws must sit behind `has(fighter, id)`, so duels without the new abilities consume exactly the same random numbers as before.

## Adding an ability or weapon
1. Add the entry to `EVOLVE_ABILITIES` / `EXTRA_WEAPONS` and, for abilities, to `ABILITY_META` (3 grades + `fmt`).
2. Implement its effect in `derived()` (numbers) or `prelude()` / `strike()` / `hit()` / `duelRounds()` (rules).
3. Add a trigger test in `tests/duel-engine.mjs` and run the balance guard.
4. Keep each new item inside the balance band: win rate between ~0.40 and ~0.62 against the same baseline (`balance guard` test enforces a wider sanity band).

## Tests
```bash
npm test            # smoke + duel engine + client + golden
npm run test:e2e    # includes "Personaje ofrece las opciones de evolución del servidor…"
```
`tests/lib/duel-engine.mjs` extracts the engine regions from the edge function and runs them in Node (the function itself needs Deno + Supabase).

## Not implemented yet
Thrown-weapon skills (Desvío Arcano, Lanzador Sombrío), Vendaje (+2 duels/day: touches the Arena quota), Ascensión, Banquete de Almas, Camino del Monje variations, and multiple simultaneous familiars.
