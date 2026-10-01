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
  assert.ok(fs.existsSync(new URL("../assets/art/characters/verdante/verdante-level-1.png",import.meta.url)),"Missing Verdante level 1 portrait");
  assert.match(read("assets/js/profile.js"),/verdante-level-1\.png/);
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
  assert.match(profile,/IDENTIDAD CANÓNICA/);
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
  assert.match(pve,/Forzar el Umbral/);
});
