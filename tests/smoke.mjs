import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read=p=>fs.readFileSync(new URL("../"+p, import.meta.url),"utf8");
const html=read("index.html");
const version=JSON.parse(read("version.json"));
const jsFiles=[
  "assets/js/state.js","assets/js/auth.js","assets/js/archmage.js","assets/js/combat-profile.js","assets/js/inventory.js","assets/js/profile.js","assets/js/realm-state.js","assets/js/router.js",
  "assets/js/community.js","assets/js/realm.js","assets/js/economy.js","assets/js/construction.js",
  "assets/js/magic.js","assets/js/army.js","assets/js/war.js","assets/js/arena.js","assets/js/tutorial.js","assets/js/ui.js"
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
