import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read=p=>fs.readFileSync(new URL("../"+p, import.meta.url),"utf8");
const html=read("index.html");
const version=JSON.parse(read("version.json"));
const jsFiles=[
  "assets/js/immersive.js","assets/js/state.js","assets/js/auth.js","assets/js/archmage.js","assets/js/combat-profile.js","assets/js/items.js","assets/js/inventory.js","assets/js/archmage-sheet.js","assets/js/profile.js","assets/js/realm-state.js","assets/js/router.js",
  "assets/js/community.js","assets/js/realm.js","assets/js/economy.js","assets/js/construction.js",
  "assets/js/magic.js","assets/js/army.js","assets/js/war.js","assets/js/arena.js","assets/js/pve.js","assets/js/tutorial.js","assets/js/ui.js"
];
const js=jsFiles.map(read).join("\n");
const uiAssets=[
  "assets/ui/nav/reino.png","assets/ui/nav/economia.png","assets/ui/nav/construccion.png","assets/ui/nav/investigacion.png",
  "assets/ui/nav/ejercito.png","assets/ui/nav/guerra.png","assets/ui/nav/clasificacion.png","assets/ui/nav/informes.png","assets/ui/nav/comunidad.png",
  "assets/ui/resources/oro.png","assets/ui/resources/mana.png","assets/ui/resources/poblacion.png"
];

test("HTML is shell-only and references external assets",()=>{
  assert.match(html,/assets\/css\/arcanum\.css/);
  for(const file of jsFiles) assert.match(html,new RegExp(file.replaceAll("/","\\/").replace(".","\\.")));
  assert.doesNotMatch(html,/<style>[\s\S]*<\/style>/);
  assert.doesNotMatch(html,/<script>[\s\S]*<\/script>/);
});

test("literal escaped newlines never leak into HTML",()=>{
  assert.doesNotMatch(html,/\\n/, "index.html contains a literal \\n text node");
  assert.doesNotMatch(read("version.json"),/\\n/, "version.json contains a literal \\n suffix");
});

test("all JavaScript modules parse",()=>{
  for(const file of jsFiles) assert.doesNotThrow(()=>new vm.Script(read(file),{filename:file}));
});

test("Archmage progression curve is deterministic and capped",()=>{
  const context={};
  vm.createContext(context);
  vm.runInContext(read("assets/js/archmage.js"),context);
  assert.equal(vm.runInContext("ARCHMAGE_LEVEL_CAP",context),50);
  assert.equal(vm.runInContext("ARCHMAGE_ATTRIBUTE_CAP",context),20);
  assert.equal(vm.runInContext("archmageXpForNextLevel(1)",context),100);
  assert.equal(vm.runInContext("archmageXpForNextLevel(10)",context),670);
  assert.equal(vm.runInContext("archmageXpForNextLevel(49)",context),6870);
  assert.equal(vm.runInContext("archmageXpForNextLevel(50)",context),0);
  assert.equal(vm.runInContext("archmageTotalXpForLevel(50)",context),133890);
  assert.equal(vm.runInContext("archmageProgressFromTotalXp(100).level",context),2);
  assert.equal(vm.runInContext("archmageProgressFromTotalXp(133890).level",context),50);
  assert.equal(vm.runInContext("archmageEarnedAttributePoints(50)",context),49);
  assert.equal(vm.runInContext("archmageProgressionFromProfile({archmage_total_xp:520,arcane_power:99,knowledge:4,willpower:2,influence:1,attribute_points:3}).stats.arcane_power",context),20);
  assert.equal(vm.runInContext("archmageIdentityFromProgression({stats:{arcane_power:2,knowledge:2,willpower:1,influence:1}}).key",context),"hybrid");
  assert.equal(vm.runInContext("archmageIdentityFromProgression({stats:{arcane_power:2,knowledge:3,willpower:1,influence:1}}).title",context),"Mente Erudita");
  assert.equal(vm.runInContext("archmageIdentityFromProgression({stats:{arcane_power:2,knowledge:2,willpower:2,influence:2}}).key",context),"balanced");
  assert.equal(vm.runInContext("archmageResearchXp('simple')",context),20);
  assert.equal(vm.runInContext("archmageResearchXp('ultimate')",context),90);
  assert.equal(vm.runInContext("archmageXpRule('pve_first_clear').xp",context),25);
  assert.equal(vm.runInContext("archmageXpRule('pvp_qualified').dailyCap",context),60);
});

test("no single-element selector is iterated with forEach",()=>{
  assert.doesNotMatch(js,/(^|[^$])\$\([^)]*\)\.forEach/m);
});

test("critical game flows remain wired",()=>{
  for(const token of [
    "signInAccount","my_realm_state","rpc(\"explore\"","rpc(\"build\"","rpc(\"research\"",
    "rpc(\"recruit_units\"","attack_targets","renderCommunity","COMMUNITY_API","startTutorial","tutorialSteps","npc_directory","openPlayerProfile","player_profile","send_direct_message","create_alliance","loadPresence","loadPlayerDirectory","communityMode===\"school\"","archmageProgressionFromProfile","ARCHMAGE_STAT_KEYS","spend_archmage_attribute"
  ]) assert.ok(js.includes(token),`Missing critical flow: ${token}`);
});

test("build version matches version manifest",()=>{
  const m=js.match(/const BUILD_VERSION = "([^"]+)"/);
  assert.ok(m,"BUILD_VERSION missing");
  assert.equal(m[1],version.version);
});

test("art project UI icons are present and wired",()=>{
  for(const file of uiAssets) assert.ok(fs.existsSync(new URL("../"+file,import.meta.url)),`Missing art asset: ${file}`);
  assert.match(html,/assets\/ui\/nav\/reino\.png/);
  assert.match(read("assets/js/realm-state.js"),/assets\/ui\/resources\/oro\.png/);
  assert.ok(fs.existsSync(new URL("../assets/art/characters/verdante/viridia-level-1.webp",import.meta.url)),"Missing Verdante level 1 portrait");
  assert.match(read("assets/js/profile.js"),/viridia-level-1\.webp/);
});


test("competitive state is not written to localStorage",()=>{
  const arena=read("assets/js/arena.js");
  const combat=read("assets/js/combat-profile.js");
  const inventory=read("assets/js/inventory.js");
  assert.doesNotMatch(arena,/localStorage\.setItem/,"Arena must be server-authoritative");
  assert.doesNotMatch(combat,/localStorage\.setItem/,"Combat progression must be server-authoritative");
  assert.doesNotMatch(inventory,/localStorage\.setItem/,"Inventory must be server-authoritative");
  assert.match(combat,/stateApi\("\/combat\/evolve"/);
  assert.match(inventory,/stateApi\("\/inventory\/equip"/);
  assert.match(arena,/stateApi\("\/arena\/fight"/);
});


test("economy semantics stay canonical",()=>{
  const realmStateJs=read("assets/js/realm-state.js");
  const economyJs=read("assets/js/economy.js");
  assert.match(realmStateJs,/function passiveFallbackYield\(\)[\s\S]*gold:0,mana:0,population:0/);
  assert.doesNotMatch(realmStateJs,/Math\.pow\(power,0\.55\)/,"Client must not invent production from Ascendancy");
  assert.match(realmStateJs,/Math\.min\(foodCapacity,residentialCapacity\)/);
  assert.match(realmStateJs,/Math\.floor\(Math\.sqrt\(guilds\)\*3\.5\)/);
  assert.match(realmStateJs,/Alimento es capacidad, no un stock consumible/);
  assert.match(realmStateJs,/Los RP no se acumulan pasivamente/);
  assert.match(economyJs,/ALIMENTO · CAPACIDAD/);
  assert.match(economyJs,/INVESTIGACIÓN · FLUJO/);
  assert.match(economyJs,/ASCENDENCIA[\s\S]*indicador, no recurso gastable/);
});


test("canonical Archmage identity uses one snapshot",()=>{
  const sheet=read("assets/js/archmage-sheet.js");
  const profile=read("assets/js/profile.js");
  const arena=read("assets/js/arena.js");
  assert.match(sheet,/stateApi\("\/archmage\/"\+encodeURIComponent/);
  assert.match(profile,/loadArchmageSnapshot\(activeProfileName/);
  assert.match(profile,/identidad canónica/i);
  assert.match(profile,/APTITUDES DEL ARCHIMAGO/);
  assert.match(profile,/CRÓNICA PERSONAL/);
  assert.match(profile,/RENOMBRE/);
  assert.doesNotMatch(profile,/La sincronización pública del inventario se activará/);
  assert.match(arena,/loadArchmageSnapshot\(realmState\.realm\.mage_name/);
  assert.match(arena,/const selfProfile=snapshot\.profile/);
});


test("Tavern and PvE consume canonical Archmage identity",()=>{
  const tavern=read("assets/js/tavern.js");
  const event=read("assets/js/event.js");
  assert.match(tavern,/loadArchmageSnapshot\(realmState\?\.realm\?\.mage_name/);
  assert.match(tavern,/level:rt\.player\.level,renown:rt\.player\.renown/);
  assert.match(event,/loadArchmageSnapshot\(realmState\?\.realm\?\.mage_name/);
  assert.match(event,/bossArchmageSnapshot\?\.identity\?\.level/);
});


test("canonical item model separates Focus, Relic and Duel Weapon",()=>{
  const items=read("assets/js/items.js");
  const inventory=read("assets/js/inventory.js");
  const profile=read("assets/js/profile.js");
  const combat=read("assets/js/combat-profile.js");
  assert.match(items,/key:"focus",label:"Foco Arcano"/);
  assert.match(items,/key:"relic",label:"Reliquia"/);
  assert.match(items,/stateApi\("\/items\/equip"/);
  assert.match(inventory,/ARCANUM_INVENTORY_VERSION=2/);
  assert.match(inventory,/key:"focus",label:"Foco Arcano"/);
  assert.doesNotMatch(inventory,/key:"artifact",label:"Artefacto"/);
  assert.match(profile,/focus:"FOCO ARCANO",relic:"RELIQUIA"/);
  assert.match(combat,/ARMA DE DUELO/);
});

test("relic equipment uses canonical item lifecycle",()=>{
  const artifacts=read("assets/js/artifacts.js");
  assert.match(artifacts,/equipCanonicalItem\("relic",id\)/);
  assert.match(artifacts,/unequipCanonicalSlot\("relic"\)/);
});


test("inventory v1 migration remains supported",()=>{
  const inventory=read("assets/js/inventory.js");
  assert.match(inventory,/arcanum_inventory_v1_/);
  assert.match(inventory,/item\.slot==="artifact"\?"focus":item\.slot/);
  assert.match(inventory,/old\.artifact&&!state\.equipment\.focus/);
});


test("inventory surfaces owned Relics through canonical lifecycle",()=>{
  const inventory=read("assets/js/inventory.js");
  assert.match(inventory,/Reliquias custodiadas/);
  assert.match(inventory,/data-relic-equip/);
  assert.match(inventory,/equipCanonicalItem\("relic",btn\.dataset\.relicEquip\)/);
  assert.match(inventory,/data-relic-unequip-card/);
  assert.match(inventory,/unequipCanonicalSlot\("relic"\)/);
});


test("verified Gear comes from gameplay instead of debug drops",()=>{
  const items=read("assets/js/items.js");
  const inventory=read("assets/js/inventory.js");
  const economy=read("assets/js/economy.js");
  const arena=read("assets/js/arena.js");
  const event=read("assets/js/event.js");
  assert.doesNotMatch(inventory,/HALLAZGO DE PRUEBA/);
  assert.doesNotMatch(inventory,/data-loot-test-drop/);
  assert.match(inventory,/canonicalLootOriginText/);
  assert.match(items,/stateApi\("\/loot\/exploration\/start"/);
  assert.match(items,/stateApi\("\/loot\/exploration\/complete"/);
  assert.match(items,/stateApi\("\/loot\/arena\/claim"/);
  assert.match(items,/stateApi\("\/loot\/boss\/claim"/);
  assert.match(economy,/startLootExplorationClaim/);
  assert.match(economy,/completeLootExplorationClaim/);
  assert.match(arena,/loot_reward/);
  assert.match(arena,/announceCanonicalLootReward/);
  assert.match(event,/claimWorldBossGear/);
  assert.match(event,/bossGearRewardCache/);
});

test("Gear provenance is visible to the player",()=>{
  const items=read("assets/js/items.js");
  const inventory=read("assets/js/inventory.js");
  assert.match(items,/exploration:"Exploración"/);
  assert.match(items,/arena:"Arena clasificada"/);
  assert.match(items,/world_boss:"Boss mundial"/);
  assert.match(inventory,/ORIGEN/);
});


test("personal PvE expeditions are server-authoritative and persistent",()=>{
  const pve=read("assets/js/pve.js");
  const router=read("assets/js/router.js");
  assert.match(html,/data-view="pve"/);
  assert.match(router,/pve:\{name:"renderPve"/);
  assert.match(router,/view==="pve"\) await renderPve/);
  assert.match(pve,/stateApi\("\/pve\/start"/);
  assert.match(pve,/stateApi\("\/pve\/fight"/);
  assert.match(pve,/stateApi\("\/pve\/retreat"/);
  assert.match(pve,/stateApi\("\/pve\/choose"/);
  assert.match(pve,/VIDA DEL ARCHIMAGO/);
  assert.match(pve,/pve-room-track/);
  assert.match(pve,/Botín de expedición/);
  assert.doesNotMatch(pve,/localStorage\.setItem/);
});

test("PvE Gear provenance is part of canonical item vocabulary",()=>{
  const items=read("assets/js/items.js");
  assert.match(items,/pve:"Expedición PvE"/);
  assert.match(items,/pve_boss:"Jefe de expedición"/);
  assert.match(items,/pve_boss_abyss:"Jefe del Abismo"/);
});


test("PvE between-room choices are explicit and consequential",()=>{
  const pve=read("assets/js/pve.js");
  assert.match(pve,/DECISIÓN DEL UMBRAL/);
  assert.match(pve,/data-pve-choice/);
  assert.match(pve,/SIN COSTE DE TURNO/);
});


test("Edge Function security patches stay in place",()=>{
  const state=read("supabase/functions/arcanum-state/index.ts");
  const admin=read("supabase/functions/arcanum-admin/index.ts");
  assert.match(state,/LEGACY_IMPORT_CLOSED/,"inventory legacy import must stay closed");
  assert.match(state,/\.eq\("seals_remaining",arena\.seals_remaining\)/,"arena seals must be reserved atomically");
  assert.doesNotMatch(admin,/ADMIN_NAMES/,"admin must not be identified by display name");
  assert.match(admin,/ADMIN_USER_IDS\.has\(userId\)/);
});


test("Community function keeps relic claims safe",()=>{
  const c=read("supabase/functions/arcanum-community/index.ts");
  assert.doesNotMatch(c,/beta_discovery/,"QA discovery must not grant relics");
  assert.match(c,/DISCOVERY_CLOSED/);
  assert.match(c,/\.is\("completed_at",\s*null\)/,"exploration claims must be locked atomically");
  assert.match(c,/claimInsertError/,"pvp claim insert result must be checked");
});


test("Oracle model calls are capped per user",()=>{
  const o=read("supabase/functions/arcanum-oracle/index.ts");
  const m=read("supabase/migrations/20261001120000_oracle_daily_quota.sql");
  assert.match(o,/arcanum_oracle_consume/);
  assert.match(o,/withinQuota/);
  assert.match(m,/revoke all on function public\.arcanum_oracle_consume/);
  assert.match(m,/to service_role/);
});


test("AI features use a configurable free-tier provider, not paid OpenAI",()=>{
  for(const name of ["arcanum-oracle","astrael-player"]){
    const src=read("supabase/functions/"+name+"/index.ts");
    assert.doesNotMatch(src,/api\.openai\.com/,name+" must not call OpenAI directly");
    assert.doesNotMatch(src,/OPENAI_API_KEY/,name+" must not read the OpenAI key");
    assert.match(src,/ORACLE_BASE_URL/);
    assert.match(src,/ORACLE_API_KEY/);
  }
});


test("Combat migrations and SQL suite are present and keep their safety guards",()=>{
  const suite=read("supabase/tests/combat_core.sql");
  assert.match(suite,/raise exception E'ARCANUM COMBAT TESTS/,"the SQL suite must always end by rolling back");
  assert.doesNotMatch(suite,/\bcommit\b/i);
  const t=read("supabase/migrations/20261001130000_combat_victory_threshold.sql");
  assert.match(t,/v_threshold_bp:=1000;/);
  assert.match(t,/not patching/,"must abort on unexpected function text");
  const c=read("supabase/migrations/20261001130100_combat_accuracy_curve.sql");
  assert.match(c,/accuracy_apply_curve/);
  assert.match(c,/revoke all on function private\.accuracy_apply_curve/);
  assert.match(c,/not patching/);
  const o=read("supabase/migrations/20261001130200_combat_target_order.sql");
  assert.match(o,/battle_choose_target/);
  assert.match(o,/not patching/);
});


test("PvP ranking is routed, server-authoritative and shows competitive stats",()=>{
  const router=read("assets/js/router.js");
  const ranking=read("assets/js/pvp-ranking.js");
  const stateFn=read("supabase/functions/arcanum-state/index.ts");
  assert.match(html,/data-view="pvp-ranking"/);
  assert.match(router,/"pvp-ranking":\{name:"renderPvpRanking"/);
  assert.match(router,/view==="pvp-ranking"\) await renderPvpRanking/);
  assert.doesNotThrow(()=>new vm.Script(ranking,{filename:"assets/js/pvp-ranking.js"}));
  assert.match(ranking,/stateApi\("\/arena\/ranking"\)/);
  assert.match(ranking,/VICTORIAS/);
  assert.match(ranking,/DERROTAS/);
  assert.match(ranking,/ELO/);
  assert.match(stateFn,/p\[0\]==="arena"&&p\[1\]==="ranking"/);
  assert.match(stateFn,/defender_user_id:String\(targetRealm\.player_id\)/);
  assert.match(stateFn,/defenderUpdate\[sim\.won\?"losses":"wins"\]/);
});


test("turn-spending actions require confirmation before execution",()=>{
  const economy=read("assets/js/economy.js");
  const construction=read("assets/js/construction.js");
  const army=read("assets/js/army.js");
  assert.match(economy,/window\.confirm\([\s\S]*Explorar nuevas tierras gastará/);
  assert.match(construction,/window\.confirm\([\s\S]*Construir este lote/);
  assert.match(army,/window\.confirm\([\s\S]*Reclutar/);
});

test("inactive application roots stay out of the accessibility tree",()=>{
  assert.match(html,/<main id="auth-view"[^>]*hidden[^>]*aria-hidden="true"[^>]*inert/);
  assert.match(html,/<main id="create-view"[^>]*hidden[^>]*aria-hidden="true"[^>]*inert/);
  assert.match(html,/<main id="game-view"[^>]*hidden[^>]*aria-hidden="true"[^>]*inert/);
  const state=read("assets/js/state.js");
  assert.match(state,/el\.setAttribute\("hidden",""\)/);
  assert.match(state,/el\.removeAttribute\("hidden"\)/);
});

test("Ascendencia is authoritative and not passively interpolated",()=>{
  const realmState=read("assets/js/realm-state.js");
  const passiveBlock=realmState.match(/const PASSIVE_RESOURCE_FIELDS=\{([\s\S]*?)\};/)?.[1]||"";
  assert.doesNotMatch(passiveBlock,/net_power/);
  assert.match(realmState,/data-live-resource="net_power"/);
});

test("early economy migration adds land-based subsistence food capacity",()=>{
  const migration=read("supabase/migrations/20261001142500_add_early_food_headroom.sql");
  assert.match(migration,/base_food_per_land/);
  assert.match(migration,/r\.land::bigint/);
});

test("closed-beta polish stays in place",()=>{
  const army=read("assets/js/army.js");
  assert.doesNotMatch(army,/setTimeout\(\(\)=>generateArmyArt\(army,unitById,false\)/,"army portraits must stay opt-in (external AI Horde service)");
  assert.match(army,/GENERAR RETRATO/);
  const war=read("assets/js/war.js");
  assert.match(war,/botNames=new Set\(\["astrael"\]\)/,"Astrael is not a human and must stay out of the human ranking");
  assert.match(war,/res\?\.attacker_victory && typeof artifactClaimPvp/,"relic loot is only claimed after a win");
  const magic=read("assets/js/magic.js");
  assert.match(magic,/spellIsAdjacent/,"adjacent-school research cost must be flagged as higher than the base cost");
  assert.match(read("assets/js/economy.js"),/Se \$\{turns===1\?"ha":"han"\} procesado/);
  assert.match(read("assets/js/construction.js"),/coste base ≈/);
  assert.match(read("assets/js/tutorial.js"),/Equípate antes de combatir/);
  const reg=read("supabase/functions/register/index.ts");
  assert.match(reg,/reservedExact/);
  assert.match(reg,/"galante", "astrael"/);
});

test("boss attack and relic swap database functions are restored and not callable by players",()=>{
  const m=read("supabase/migrations/20261001140000_restore_boss_attack_and_artifact_swap.sql");
  assert.match(m,/function public\.arcanum_world_boss_apply_attack/);
  assert.match(m,/function public\.arcanum_artifact_swap/);
  assert.match(m,/revoke all on function public\.arcanum_world_boss_apply_attack[^;]+from public, anon, authenticated/);
  assert.match(m,/revoke all on function public\.arcanum_artifact_swap[^;]+from public, anon, authenticated/);
  assert.match(m,/to service_role/);
  assert.match(m,/setval\(pg_get_serial_sequence/,"identity counters must be repaired");
  // every RPC the Edge Functions call must exist in a migration in this repo
  const fnDir="supabase/functions/";
  for(const name of ["arcanum-boss","arcanum-community","arcanum-state","arcanum-oracle"]){
    const src=read(fnDir+name+"/index.ts");
    for(const match of src.matchAll(/\.rpc\(\s*"([a-z_0-9]+)"/g)){
      const rpc=match[1];
      const all=fs.readdirSync(new URL("../supabase/migrations/",import.meta.url)).map(f=>read("supabase/migrations/"+f)).join("\n");
      if(rpc==="arena_pvp_ranking")continue; // created directly in the project, not in this repo yet
      assert.match(all,new RegExp("function public\\."+rpc+"\\b"),"Edge Function "+name+" calls rpc "+rpc+" but no migration defines it");
    }
  }
});

test("regular Ranking and Construction pages keep their render contracts",()=>{
  const construction=read("assets/js/construction.js");
  const war=read("assets/js/war.js");
  assert.doesNotMatch(construction,/(^|[^$])\$\("\[data-building\]"\)\.forEach/m,
    "Construction must iterate building inputs with $$, not $");
  assert.doesNotMatch(war,/players\.\\n\s+const botNames/,
    "Regular Ranking must not contain escaped newlines that comment out its variables");
  assert.match(war,/const botNames=new Set\(\["astrael"\]\);\s+const humanRows=/);
});

test("Construction never references an undefined $$$ selector",()=>{
  const construction=read("assets/js/construction.js");
  assert.doesNotMatch(construction,/\$\$\$\(/,
    "Construction must use $$ for selector lists; $$$ is undefined");
});

