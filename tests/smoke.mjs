import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read=p=>fs.readFileSync(new URL("../"+p, import.meta.url),"utf8");
const html=read("index.html");
const version=JSON.parse(read("version.json"));
const jsFiles=[
  "assets/js/state.js","assets/js/auth.js","assets/js/realm-state.js","assets/js/router.js",
  "assets/js/community.js","assets/js/realm.js","assets/js/economy.js","assets/js/construction.js",
  "assets/js/magic.js","assets/js/army.js","assets/js/war.js","assets/js/tutorial.js","assets/js/ui.js"
];
const js=jsFiles.map(read).join("\n");

test("HTML is shell-only and references external assets",()=>{
  assert.match(html,/assets\/css\/arcanum\.css/);
  for(const file of jsFiles) assert.match(html,new RegExp(file.replaceAll("/","\\/").replace(".","\\.")));
  assert.doesNotMatch(html,/<style>[\s\S]*<\/style>/);
  assert.doesNotMatch(html,/<script>[\s\S]*<\/script>/);
});

test("all JavaScript modules parse",()=>{
  for(const file of jsFiles) assert.doesNotThrow(()=>new vm.Script(read(file),{filename:file}));
});

test("no single-element selector is iterated with forEach",()=>{
  assert.doesNotMatch(js,/(^|[^$])\$\([^)]*\)\.forEach/m);
});

test("critical game flows remain wired",()=>{
  for(const token of [
    "signInAccount","my_realm_state","rpc(\"explore\"","rpc(\"build\"","rpc(\"research\"",
    "rpc(\"recruit_units\"","attack_targets","renderCommunity","COMMUNITY_API","startTutorial","tutorialSteps","npc_directory"
  ]) assert.ok(js.includes(token),`Missing critical flow: ${token}`);
});

test("build version matches version manifest",()=>{
  const m=js.match(/const BUILD_VERSION = "([^"]+)"/);
  assert.ok(m,"BUILD_VERSION missing");
  assert.equal(m[1],version.version);
});
