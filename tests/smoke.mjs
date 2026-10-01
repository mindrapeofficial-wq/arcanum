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
  "assets/js/magic.js","assets/js/army.js","assets/js/edition.js","assets/js/realm-tools.js","assets/js/luck-support.js","assets/js/war.js","assets/js/arena.js","assets/js/pve.js","assets/js/tutorial.js","assets/js/ui.js"
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
  assert.match(profile,/APTITUDES DEL ARCONTE/);
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
  assert.match(items,/stateApi\("\/loot\/arena\/claim"/);
  assert.match(items,/stateApi\("\/loot\/boss\/claim"/);
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
  assert.match(pve,/VIDA DEL ARCONTE/);
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
  assert.match(pve,/SIN COSTE DE ENERGÍA/);
});


test("Edge Function security patches stay in place",()=>{
  const state=read("supabase/functions/arcanum-state/index.ts");
  const admin=read("supabase/functions/arcanum-admin/index.ts");
  assert.match(state,/LEGACY_IMPORT_CLOSED/,"inventory legacy import must stay closed");
  assert.match(state,/spendArchonEnergy\(who\.userId,ARCHON_ENERGY_ARENA_RANKED_COST\)/,"ranked Arena must spend Arconte energy on the server");
  const energySql=read("supabase/migrations/20261001153000_archon_energy.sql");
  assert.match(energySql,/from public\.arcanum_archon_energy\s+where user_id = p_user_id\s+for update/,"energy spending must lock the row atomically");
  assert.match(energySql,/revoke all on function public\.spend_archon_energy\(uuid, integer\) from public, anon, authenticated/,"players must not call spend_archon_energy directly");
  assert.match(energySql,/grant execute on function public\.spend_archon_energy\(uuid, integer\) to service_role/);
  assert.doesNotMatch(admin,/ADMIN_NAMES/,"admin must not be identified by display name");
  assert.match(admin,/from\("arcanum_admin_users"\)\.select\("role,active"\)\.eq\("user_id",userId\)/,"admin must be resolved by user id in the admin table");
  assert.match(admin,/if\(!admin\?\.active\) throw new Error\("FORBIDDEN"\)/);
  const adminSql=read("supabase/migrations/20261001162000_admin_and_system_accounts.sql");
  assert.match(adminSql,/alter table public\.arcanum_admin_users enable row level security/);
  assert.match(adminSql,/revoke all on table public\.arcanum_admin_users from public, anon, authenticated/);
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
  for(const name of ["arcanum-oracle"]){
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
  assert.match(war,/rpc\("war_ranking"\)/,"human war ranking must come from the canonical server RPC");
  assert.doesNotMatch(war,/botNames/,"bot filtering must live on the server, not in the client");
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
  assert.match(war,/rpc\("realm_ranking"\)/);
  assert.match(war,/const warRows=Array\.isArray\(warRowsRaw\)/);
});

test("Construction never references an undefined $$$ selector",()=>{
  const construction=read("assets/js/construction.js");
  assert.doesNotMatch(construction,/\$\$\$\(/,
    "Construction must use $$ for selector lists; $$$ is undefined");
});

test("planning tools: mana alert only reacts to a negative known flow",()=>{
  const context={};
  vm.createContext(context);
  vm.runInContext(read("assets/js/realm-tools.js"),context);
  assert.equal(vm.runInContext("manaFlowAlert(1000,0)",context),null);
  assert.equal(vm.runInContext("manaFlowAlert(1000,60)",context),null);
  assert.equal(vm.runInContext("manaFlowAlert(1000,undefined)",context),null);
  assert.equal(vm.runInContext("manaFlowAlert(1000,NaN)",context),null);
  assert.equal(vm.runInContext("manaFlowAlert(10532,-700).turnsLeft",context),15);
  assert.equal(vm.runInContext("manaFlowAlert(10532,-700).critical",context),false);
  assert.equal(vm.runInContext("manaFlowAlert(2432,-241).critical",context),true);
  assert.equal(vm.runInContext("manaFlowAlert(0,-5).turnsLeft",context),0);
});

test("planning tools: recruit plan shortfall for fixed and percentage targets",()=>{
  const context={};
  vm.createContext(context);
  vm.runInContext(read("assets/js/realm-tools.js"),context);
  context.army=[{unit_id:"a",quantity:300},{unit_id:"b",quantity:700}];
  context.plan=[{unit_id:"a",mode:"count",value:500},{unit_id:"b",mode:"count",value:100},{unit_id:"c",mode:"percent",value:20}];
  const rows=JSON.parse(vm.runInContext("JSON.stringify(recruitPlanShortfall(plan,army))",context));
  assert.equal(rows[0].missing,200);
  assert.equal(rows[1].missing,0);
  // 20% de 1000 + c: c=0.2*(1000)/(0.8)=250 y 250/1250=20%
  assert.equal(rows[2].goal,250);
  assert.equal(rows[2].missing,250);
});

test("planning tools: recruit plan sanitization is bounded and LOCAL_ONLY",()=>{
  const context={};
  vm.createContext(context);
  vm.runInContext(read("assets/js/realm-tools.js"),context);
  const out=vm.runInContext("sanitizeRecruitPlan([{unit_id:\"a\",mode:\"percent\",value:500},{unit_id:\"a\",mode:\"count\",value:3},{unit_id:\"\",value:3},{unit_id:\"b\",value:0},{unit_id:\"c\",mode:\"bogus\",value:7}])",context);
  assert.equal(out.length,2);
  assert.equal(out[0].value,90);
  assert.equal(out[1].mode,"count");
  const src=read("assets/js/realm-tools.js");
  assert.doesNotMatch(src,/rpc\("(?!recruit_units|my_realm_state)/,"Planning tools may only call recruit_units and my_realm_state");
});

test("planning tools: formation calculator is derived and never invents power",()=>{
  const context={};
  vm.createContext(context);
  vm.runInContext(read("assets/js/realm-tools.js"),context);
  context.units={a:{recruit_gold:10,recruit_mana:1,recruit_population:1,upkeep_gold:0.5,upkeep_mana:0.25,upkeep_population:0,natural_flying:true},b:{recruit_gold:20,recruit_mana:0,recruit_population:2,upkeep_gold:1,upkeep_mana:0,upkeep_population:0,natural_ranged:true}};
  context.rows=[{unit_id:"a",quantity:100},{unit_id:"b",quantity:50},{unit_id:"x",quantity:99},{unit_id:"a",quantity:-5}];
  const t=JSON.parse(vm.runInContext("JSON.stringify(formationTotals(rows,units))",context));
  assert.equal(t.units,150);
  assert.equal(t.flying,100);
  assert.equal(t.ranged,50);
  assert.equal(t.recruit_gold,2000);
  assert.equal(t.upkeep_gold,100);
  assert.equal(t.upkeep_mana,25);
  assert.equal(Object.keys(t).some(k=>/power|np|ascend/i.test(k)),false);
});

test("war: battle report aggregates events and war expense without inventing data",()=>{
  const context={n:x=>String(x),esc:x=>String(x)};
  vm.createContext(context);
  vm.runInContext(read("assets/js/war.js"),context);
  context.units=[{side:"attacker",unit_id:"a",name_es:"Gorila",initial_quantity:100,final_quantity:90,recovered:2},{side:"defender",unit_id:"d",name_es:"Milicia",initial_quantity:500,final_quantity:200,recovered:0}];
  context.events=[{sequence:1,type:"PRIMARY",actor_side:"attacker",actor_unit_id:"a",target_side:"defender",target_unit_id:"d",kills:100},{sequence:2,type:"COUNTER",actor_side:"defender",actor_unit_id:"d",target_side:"attacker",target_unit_id:"a",kills:5},{sequence:3,type:"PRIMARY",actor_side:"attacker",actor_unit_id:"a",target_side:"defender",target_unit_id:"d",kills:50}];
  const groups=JSON.parse(vm.runInContext("JSON.stringify(battleAggregateEvents(events,units))",context));
  assert.equal(groups.length,2);
  assert.equal(groups[0].kills,150);
  assert.equal(groups[0].hits,2);
  assert.equal(groups[0].actor,"Gorila");
  assert.equal(groups[0].target,"Milicia");
  const totals=JSON.parse(vm.runInContext("JSON.stringify(battleSideTotals(units,'defender'))",context));
  assert.equal(totals.lost,300);
  const expense=JSON.parse(vm.runInContext("JSON.stringify(battleWarExpenseRows({gold:6986,mana:242,population:0,junk:9}))",context));
  assert.deepEqual(expense.map(r=>r.key),["gold","mana"]);
  assert.equal(vm.runInContext("battleWarExpenseRows(null).length",context),0);
  const html=vm.runInContext("battleReportHtml({battle:{mode:'SIEGE',attacker_victory:true,attacker_loss_bp:70,defender_loss_bp:7300,land_gained:42,land_destroyed:84,war_expense:{gold:6986,mana:242}},units,events})",context);
  assert.match(html,/Tierra destruida/);
  assert.match(html,/Gasto de guerra/);
  assert.match(html,/Golpes principales/);
});

test("war: war phrases are LOCAL_ONLY, bounded and sent only through send_direct_message",()=>{
  const context={};
  vm.createContext(context);
  vm.runInContext(read("assets/js/war.js"),context);
  const out=JSON.parse(vm.runInContext("JSON.stringify(sanitizeWarPhrases(['  hola   mundo ','hola mundo','',null,'x'.repeat(500),...Array.from({length:20},(_,i)=>'f'+i)]))",context));
  assert.equal(out.length,10);
  assert.equal(out[0],"hola mundo");
  assert.equal(out[1].length,140);
  const src=read("assets/js/war.js");
  assert.match(src,/rpc\("send_direct_message"/);
  assert.match(src,/data-npc/,"NPC targets must be flagged so no message is sent to them");
  assert.match(src,/Tras el ataque se enviará/,"the player must see the message in the attack confirmation");
  assert.doesNotMatch(src,/attack_mage",\{[^}]*p_message/,"attack_mage has no message parameter");
});

test("audio uses local CC0 interface samples with documented provenance",()=>{
  const audio=read("assets/js/audio.js");
  const sources=read("assets/audio/SOURCES.md");
  assert.match(audio,/assets\/audio\/sfx\/ui-select\.wav\.b64/);
  assert.match(audio,/assets\/audio\/sfx\/ui-confirm-1\.wav\.b64/);
  assert.match(audio,/assets\/audio\/sfx\/ui-error\.wav\.b64/);
  assert.match(audio,/b64ToBlobUrl/);
  assert.match(sources,/Kenney Interface Sounds/);
  assert.match(sources,/CC0 1\.0/);
  for(const name of [
    "ui-select.wav.b64",
    "ui-confirm-1.wav.b64",
    "ui-confirm-2.wav.b64",
    "ui-open.wav.b64",
    "ui-error.wav.b64"
  ]){
    assert.ok(read("assets/audio/sfx/"+name).length>1000,name+" should contain an imported audio payload");
  }
});

test("Lady Luck client helpers format time, tier and bonuses",()=>{
  const context={document:{addEventListener(){}}};
  vm.createContext(context);
  vm.runInContext(read("assets/js/luck-support.js"),context);
  assert.equal(vm.runInContext("luckTimeLeftText(0)",context),"0 min");
  assert.equal(vm.runInContext("luckTimeLeftText(59)",context),"1 min");
  assert.equal(vm.runInContext("luckTimeLeftText(3600)",context),"1 h");
  assert.equal(vm.runInContext("luckTimeLeftText(86399)",context),"23 h 59 min");
  assert.equal(vm.runInContext("luckTimeLeftText(-5)",context),"0 min");
  assert.equal(vm.runInContext("supporterTierLabel('patron')",context),"Mecenas");
  assert.equal(vm.runInContext("supporterTierLabel('supporter')",context),"Colaborador");
  assert.equal(vm.runInContext("supporterTierLabel(null)",context),"Sin estatus de apoyo");
  const lines=JSON.parse(vm.runInContext("JSON.stringify(luckBonusLines({summon_success_points:5,explore_land_percent:10}))",context));
  assert.deepEqual(lines,["+5 % de éxito al invocar","+10 % de tierra al explorar"]);
  assert.equal(vm.runInContext("luckBonusLines({}).length",context),0);
});

test("Lady Luck client only reads server state and never stores it locally",()=>{
  const src=read("assets/js/luck-support.js");
  assert.doesNotMatch(src,/localStorage|sessionStorage/,"luck and supporter state are server canonical");
  const allowed=new Set(["my_luck_status","my_supporter_status","my_discord_link","create_discord_link_code","unlink_discord","get_my_notes","save_my_notes"]);
  const used=[...src.matchAll(/rpc\("([a-z_]+)"/g)].map(m=>m[1]);
  assert.ok(used.length>=7);
  for(const name of used)assert.ok(allowed.has(name),"unexpected RPC: "+name);
  assert.match(html,/id="luck-support-button"[^>]*class|class="[^"]*luck-support-button[^"]*hidden/,"the button stays hidden until the server answers");
  assert.match(html,/assets\/js\/luck-support\.js/);
});

test("Lady Luck migration keeps tables private and effects server-side",()=>{
  const sql=read("supabase/migrations/20261001180000_luck_supporters_discord.sql");
  const tables=[...sql.matchAll(/create table if not exists public\.(\w+)/g)].map(m=>m[1]);
  assert.deepEqual(tables.sort(),["arcanum_discord_link_codes","arcanum_discord_links","arcanum_luck","arcanum_luck_log","arcanum_player_notes","arcanum_supporter_ledger","arcanum_supporters"]);
  for(const t of tables){
    assert.match(sql,new RegExp("alter table public\\."+t+" enable row level security"),t+" must enable RLS");
    assert.match(sql,new RegExp("revoke all on table public\\."+t+" from public, anon, authenticated"),t+" must be closed to players");
  }
  for(const fn of ["redeem_discord_link(text, text, text)","discord_claim_luck(text)","discord_status(text)","admin_grant_supporter_credit(uuid, integer, text, uuid)","admin_grant_luck(uuid, integer)"]){
    assert.ok(sql.includes("revoke all on function public."+fn+" from public, anon, authenticated"),fn+" must not be callable by players");
    assert.ok(sql.includes("grant execute on function public."+fn+" to service_role"),fn+" must be callable by the service role");
  }
  assert.match(sql,/greatest\(public\.arcanum_luck\.expires_at, excluded\.expires_at\)/,"luck must not stack or shorten");
  assert.match(sql,/v_chance_bp\+500/,"+5 points of summoning success");
  assert.match(sql,/v_roll::numeric \* v_factor \* 1\.10/,"+10% exploration land");
  assert.match(sql,/not patching/,"patches must abort when the Core text moved");
  assert.match(sql,/Europe\/Madrid/,"the daily claim uses the Madrid day like the Arena");
  assert.match(sql,/supporter_tier[\s\S]*>= 15 then 'patron'[\s\S]*>= 2 then 'supporter'/);
});

test("Discord endpoint authenticates every request by Ed25519 signature",()=>{
  const src=read("supabase/functions/arcanum-discord/index.ts");
  assert.match(src,/x-signature-ed25519/);
  assert.match(src,/x-signature-timestamp/);
  assert.match(src,/name: "Ed25519"/);
  assert.match(src,/MAX_SKEW_SECONDS/,"stale timestamps must be rejected");
  assert.match(src,/status: 401/);
  assert.match(src,/flags: 64/,"replies are ephemeral");
  assert.match(src,/allowed_mentions/);
  assert.doesNotMatch(src,/Authorization.*(req\.headers|Bearer \$\{token\})/,"Discord calls carry no player JWT");
  for(const rpc of ["redeem_discord_link","discord_claim_luck","discord_status"])assert.match(src,new RegExp(rpc));
  const script=read("scripts/register-discord-commands.mjs");
  for(const name of ["vincular","suerte","estado"])assert.match(script,new RegExp('name: "'+name+'"'));
});

test("Admin can grant supporter credit and luck, always audited",()=>{
  const src=read("supabase/functions/arcanum-admin/index.ts");
  assert.match(src,/action==="supporter:grant"/);
  assert.match(src,/action==="luck:grant"/);
  assert.match(src,/rpc\("admin_grant_supporter_credit"/);
  assert.match(src,/rpc\("admin_grant_luck"/);
  const block=src.slice(src.indexOf('action==="supporter:grant"'),src.indexOf("async function userIdByMageName"));
  assert.equal((block.match(/await audit\(/g)||[]).length,2,"both grants must write an audit row");
});

test("war view exposes shield/meditation state from the server and keeps versions in sync", () => {
  const war = read("assets/js/war.js");
  const state = read("assets/js/state.js");
  const html = read("index.html");
  assert.match(war, /rpc\("my_shield_status"\)\.catch\(\(\)=>null\)/, "hidden until the RPC exists");
  assert.match(war, /rpc\("start_meditation"\)/);
  for (const code of ["TARGET_IN_MEDITATION", "TARGET_DAMAGE_PROTECTED", "ATTACKER_IN_MEDITATION", "MEDITATION_COOLDOWN"]) {
    assert.match(state, new RegExp(code), `${code} needs a human message`);
  }
  const escapedVersion = String(version.version).replaceAll(".", "\\.");
  assert.match(html, new RegExp(`war\\.js\\?v=${escapedVersion}`));
  assert.match(html, new RegExp(`state\\.js\\?v=${escapedVersion}`));
  assert.match(state, new RegExp(`BUILD_VERSION = "${escapedVersion}"`));
});

test("Pillage is a third attack mode, server-driven and never a land grab", () => {
  const war = read("assets/js/war.js");
  const state = read("assets/js/state.js");
  const sql = read("supabase/migrations/20261001200000_pillage.sql");
  assert.match(war, /data-mode="PILLAGE"/);
  assert.match(war, /res\.pillage\?\.total/, "burned buildings come from the server result");
  assert.match(state, /PILLAGE_LIMIT_REACHED/);
  assert.match(sql, /abort|text moved/i, "the Core patch must abort if the deployed text moved");
  assert.match(sql, /when v_mode=''PILLAGE'' then 0/, "no land changes hands in a pillage");
  assert.doesNotMatch(sql, /barracks\s*=\s*barracks\s*-|fortresses\s*=\s*fortresses\s*-|barriers\s*=\s*barriers\s*-/, "military buildings are never burned");
});


test("navigation is grouped into Arconte, Reino and Comunidad",()=>{
  const html=read("index.html");
  for(const group of ["arconte","reino","comunidad"]){
    assert.match(html,new RegExp(`data-nav-group="${group}"`));
    assert.match(html,new RegExp(`data-nav-group-trigger="${group}"`));
    assert.match(html,new RegExp(`data-mobile-nav-group="${group}"`));
  }
  assert.match(read("assets/js/router.js"),/NAV_GROUP_BY_VIEW/);
  assert.match(read("assets/js/ui.js"),/toggleMobileNavGroup/);
});

test("character combat preparation is readable and mobile-first",()=>{
  const src=read("assets/js/character.js");
  const css=read("assets/css/character.css");
  assert.match(src,/PREPARACIÓN PARA EL DUELO/);
  assert.match(src,/Equipo equipado/);
  assert.match(src,/Dones y habilidades/);
  assert.match(css,/\.character-center-column\{order:1\}/);
  assert.match(css,/\.character-ability-list/);
});

test("players table is not writable by signed-in players",()=>{
  const dir=new URL("../supabase/migrations/",import.meta.url);
  const all=fs.readdirSync(dir).filter(f=>f.endsWith(".sql")).sort().map(f=>read("supabase/migrations/"+f)).join("\n");
  assert.match(all,/revoke insert, update, delete, truncate on public\.players from anon, authenticated/);
  assert.match(all,/drop policy if exists players_update_own on public\.players/);
  // the client must keep going through RPCs / Edge Functions: it never PATCHes players over REST
  for(const f of fs.readdirSync(new URL("../assets/js/",import.meta.url)).filter(f=>f.endsWith(".js"))){
    const src=read("assets/js/"+f);
    assert.doesNotMatch(src,/\/rest\/v1\/players/,f+" must not write to the players table directly");
  }
});

test("Classic edition helpers hide the role-playing layer and keep the Reino",()=>{
  const context={};
  vm.createContext(context);
  vm.runInContext(read("assets/js/edition.js"),context);
  assert.equal(vm.runInContext("ARCANUM_EDITION",context),"standard","the default edition is the full game");
  for(const hidden of ["character","artifacts","arena","pve","event","tavern","pvp-ranking"])
    assert.equal(vm.runInContext(`classicViewAllowed(${JSON.stringify(hidden)})`,context),false,hidden+" must be hidden");
  for(const shown of ["realm","build","economy","research","market","army","war","battles","community","ranking","admin"])
    assert.equal(vm.runInContext(`classicViewAllowed(${JSON.stringify(shown)})`,context),true,shown+" must stay");
  assert.equal(vm.runInContext("classicText('Los Arcontes y el ARCONTE; tu Arconte')",context),"Los Arcontes y el ARCONTE; tu Arconte","Classic keeps ARCANUM's own vocabulary (no Archimago rewrite)");
  assert.equal(vm.runInContext("classicText('Arconteado')",context),"Arconteado","vocabulary is left untouched");
  assert.equal(vm.runInContext("classicNavGroup('research','arconte')",context),"reino","the grimoire lives in the Reino");
  assert.equal(vm.runInContext("classicNavGroup('unknown','arconte')",context),"reino");
  assert.equal(vm.runInContext("classicNavGroup('ranking','comunidad')",context),"comunidad");
  context.steps=[{view:"realm",kicker:"PASO 1 · A"},{view:"character",kicker:"PASO 2 · B"},{view:"war",kicker:"PASO 3 · C"},{view:"realm",kicker:"PASO 4 · D"}];
  const steps=JSON.parse(vm.runInContext("JSON.stringify(classicTutorialSteps(steps))",context));
  assert.deepEqual(steps.map(s=>s.kicker),["PASO 1 · A","PASO 2 · C","PASO 3 · D"],"tutorial steps are filtered and renumbered");
});

test("Classic edition never calls the Arconte backend and only activates on its own flag",()=>{
  const src=read("assets/js/edition.js");
  assert.doesNotMatch(src,/stateApi\(|arcanum-state|COMBAT|STATE_API/,"Classic must not depend on arcanum-state");
  assert.match(src,/loadArchmageSnapshot = async name => \(\{ profile: await rpc\("player_profile"/);
  assert.doesNotMatch(src,/localStorage|sessionStorage/);
  assert.match(src,/if \(ARCANUM_IS_CLASSIC\) document\.addEventListener\("DOMContentLoaded", startClassicEdition\)/,"the standard edition must stay untouched");
  const css=read("assets/css/classic.css").replace(/\/\*[\s\S]*?\*\//g,"");
  const classicSelectors=css.split("}").map(block=>block.split("{")[0]).join(",").split(",").map(s=>s.trim()).filter(Boolean);
  assert.ok(classicSelectors.length>0,"classic.css has at least one rule");
  for(const selector of classicSelectors)
    assert.match(selector,/^html\[data-edition="classic"\]/,"every Classic rule is scoped to the edition");
  assert.match(html,/assets\/js\/edition\.js/);
  assert.match(html,/assets\/css\/classic\.css/);
});

test("Classic build injects the edition flag and keeps the ARCANUM identity",async()=>{
  const { classicIndexHtml, classicManifest }=await import("../scripts/build-classic.mjs");
  const out=classicIndexHtml(html);
  assert.match(out,/<script>window\.ARCANUM_EDITION="classic";<\/script>\s*<script defer src="assets\/js\/edition\.js/,"the flag precedes edition.js");
  assert.match(out,/<title>ARCANUM<\/title>/,"the product keeps the ARCANUM name (Classic is only the internal model)");
  assert.doesNotMatch(out,/ARCANUM Classic/,"no visible Classic branding");
  assert.doesNotMatch(html,/ARCANUM_EDITION="classic"/,"the source index.html stays the standard edition");
  const manifest=JSON.parse(classicManifest(read("manifest.webmanifest")));
  assert.equal(manifest.name,"ARCANUM: Las Cinco Escuelas");
  assert.throws(()=>classicIndexHtml("<html><title>ARCANUM</title></html>"),/edition\.js/);
});
