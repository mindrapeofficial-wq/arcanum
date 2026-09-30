"use strict";

const PASSIVE_TURN_MS=5*60*1000;
const PASSIVE_RESOURCE_FIELDS={
  gold:{label:"Oro",aliases:["gold","oro"]},
  mana:{label:"Maná",aliases:["mana"]},
  population:{label:"Población",aliases:["population","poblacion","population_gain"]},
  land:{label:"Tierras",aliases:["land","tierras"]},
  net_power:{label:"Poder Neto",aliases:["net_power","poder_neto","power"]}
};
let passiveResourceFlow=null;

function passiveBuildingSignature(state=realmState){
  const b=state?.buildings||{};
  return Object.keys(b).sort().map(k=>`${k}:${Number(b[k]||0)}`).join("|");
}
function passiveCacheKey(state=realmState){
  const mage=String(state?.realm?.mage_name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_");
  return `arcanum_passive_yield_v1_${mage}_${passiveBuildingSignature(state)}`;
}
function passiveReadCache(state=realmState){
  try{
    const raw=localStorage.getItem(passiveCacheKey(state));
    if(!raw)return null;
    const data=JSON.parse(raw);
    return data&&typeof data==="object"?data:null;
  }catch{return null;}
}
function passiveWriteCache(state,yieldPerTurn){
  try{localStorage.setItem(passiveCacheKey(state),JSON.stringify(yieldPerTurn));}catch{}
}
function passiveServerYield(state=realmState){
  const candidates=[
    state?.passive_yield,
    state?.passive_per_turn,
    state?.production_per_turn,
    state?.economy?.passive_yield,
    state?.economy?.passive_per_turn,
    state?.economy?.production_per_turn,
    state?.production
  ].filter(Boolean);
  for(const source of candidates){
    const out={}; let found=false;
    for(const [field,meta] of Object.entries(PASSIVE_RESOURCE_FIELDS)){
      for(const alias of meta.aliases){
        const value=Number(source?.[alias]);
        if(Number.isFinite(value)){out[field]=value;found=true;break;}
      }
    }
    if(found)return out;
  }
  return null;
}
function passiveSnapshot(state=realmState){
  const r=state?.realm||{};
  const values={};
  for(const field of Object.keys(PASSIVE_RESOURCE_FIELDS))values[field]=Number(r[field]||0);
  return {
    values,
    turns:Number(r.turns||0),
    maxTurns:Number(r.max_turns||0),
    nextTurnAt:r.next_turn_at?new Date(r.next_turn_at).getTime():0,
    buildingSignature:passiveBuildingSignature(state)
  };
}
function syncPassiveResourceFlow(state=realmState){
  if(!state?.realm)return;
  const now=Date.now(), current=passiveSnapshot(state), previous=passiveResourceFlow?.snapshot||null;
  const sameSignature=!!previous&&previous.buildingSignature===current.buildingSignature;
  let yieldPerTurn=passiveServerYield(state)||passiveReadCache(state)||(sameSignature?passiveResourceFlow?.yieldPerTurn:null)||{};

  if(previous && sameSignature){
    const turnsGained=current.turns-previous.turns;
    const scheduleAdvanced=current.nextTurnAt>previous.nextTurnAt+PASSIVE_TURN_MS*0.45;
    if(turnsGained>0 && scheduleAdvanced){
      const learned={};
      for(const field of Object.keys(PASSIVE_RESOURCE_FIELDS)){
        learned[field]=(current.values[field]-previous.values[field])/turnsGained;
      }
      yieldPerTurn={...yieldPerTurn,...learned};
      passiveWriteCache(state,yieldPerTurn);
    }
  }

  const phaseAtSync=current.nextTurnAt
    ?Math.max(0,Math.min(1,1-((current.nextTurnAt-now)/PASSIVE_TURN_MS)))
    :0;
  passiveResourceFlow={snapshot:current,yieldPerTurn,syncedAt:now,phaseAtSync};
}
function passiveDisplayedValue(field){
  const r=realmState?.realm;
  if(!r)return 0;
  const base=Number(r[field]||0), flow=passiveResourceFlow;
  if(!flow||!flow.snapshot?.nextTurnAt||Number(r.turns||0)>=Number(r.max_turns||0))return base;
  const perTurn=Number(flow.yieldPerTurn?.[field]);
  if(!Number.isFinite(perTurn)||perTurn===0)return base;
  const phaseNow=Math.max(0,Math.min(1,1-((flow.snapshot.nextTurnAt-Date.now())/PASSIVE_TURN_MS)));
  const progress=Math.max(0,phaseNow-Number(flow.phaseAtSync||0));
  let value=base+(perTurn*progress);
  if(field==="mana"){
    const cap=Number(realmState?.capacities?.mana||0);
    if(cap>0)value=Math.min(value,cap);
  }
  if(field==="population"){
    const cap=Math.min(Number(realmState?.capacities?.food||0),Number(realmState?.capacities?.residential||0));
    if(cap>0)value=Math.min(value,cap);
  }
  return value;
}
function passiveRateTitle(field){
  const perTurn=Number(passiveResourceFlow?.yieldPerTurn?.[field]);
  if(!Number.isFinite(perTurn)||perTurn===0)return "";
  const sign=perTurn>0?"+":"";
  const perSecond=perTurn/(PASSIVE_TURN_MS/1000);
  return `${PASSIVE_RESOURCE_FIELDS[field]?.label||field}: ${sign}${n(perTurn)} por turno · ${sign}${perSecond.toLocaleString("es-ES",{maximumFractionDigits:2})}/s`;
}
function updatePassiveResourceDisplay(){
  if(!realmState?.realm)return;
  for(const field of Object.keys(PASSIVE_RESOURCE_FIELDS)){
    const el=document.querySelector(`[data-live-resource="${field}"]`);
    if(!el)continue;
    el.textContent=n(passiveDisplayedValue(field));
    const item=el.closest(".resource-item");
    if(item){
      const title=passiveRateTitle(field);
      if(title)item.title=title; else item.removeAttribute("title");
    }
  }
}

async function loadCatalogs(){
  if(catalogs.schools.length) return;
  const [schools,spells,units,summons]=await Promise.all([
    rest("schools","select=code,name_es,color_key,description_es,adjacent_codes,opposite_codes&order=name_es"),
    rest("spell_catalog","select=id,school_code,name_es,rank,research_cost,spell_level_gain,cast_turns,base_mana_cost,researchable,effect_key&order=school_code,rank,name_es"),
    rest("unit_catalog","select=id,school_code,name_es,acquisition,power_rank,recruit_gold,recruit_mana,recruit_population,upkeep_gold,upkeep_mana,upkeep_population,natural_flying,natural_ranged,undisbandable,related_spell_id&order=school_code,power_rank"),
    rest("summon_profiles","select=spell_id,unit_id,reference_spell_level,reference_min_yield,reference_max_yield,reference_alignment")
  ]);
  catalogs={schools,spells,units,summons};
}

async function bootGame(){
  hide($("#auth-view")); hide($("#create-view")); hide($("#game-view")); show($("#boot"));
  try{
    await loadCatalogs();
    realmState=await rpc("my_realm_state");
    showGame();
  }catch(error){
    const raw=String(error?.message||error);
    if(raw.includes("REALM_NOT_FOUND")){
      showCreateRealm();
      return;
    }
    if(raw.includes("JWT")||raw.includes("token")||raw.includes("Unauthorized")){ saveSession(null); showAuth(); setNotice($("#auth-notice"),"Tu sesión ha caducado. Entra de nuevo."); return; }
    saveSession(null); showAuth(); setNotice($("#auth-notice"),humanError(error));
  }
}
function showAuth(){ if(typeof stopSidebarSocial==="function")stopSidebarSocial(true); hide($("#boot")); hide($("#create-view")); hide($("#game-view")); show($("#auth-view")); }
function showCreateRealm(){ hide($("#boot")); hide($("#auth-view")); hide($("#game-view")); show($("#create-view")); const username=getSession()?.user?.user_metadata?.username||""; $("#realm-name-preview").textContent=username; renderSchools(); }
function showGame(){
  hide($("#boot")); hide($("#auth-view")); hide($("#create-view")); show($("#game-view"));
  renderChrome(); navigate("realm");
  if(typeof refreshOwnProfileBadge==="function")refreshOwnProfileBadge(true);
  if(typeof startSidebarSocial==="function")startSidebarSocial();
  clearInterval(periodicTimer); periodicTimer=setInterval(()=>refreshState(true),45000);
  clearInterval(countdownTimer); countdownTimer=setInterval(updateTurnCountdown,1000); updateTurnCountdown();
}

function renderSchools(){
  const descriptions={ascendant:"Luz, protección y resurrección.",verdant:"Naturaleza, crecimiento y regeneración.",eradication:"Fuego, destrucción y poder directo.",abyssal:"Muerte, demonios y corrupción.",phantasm:"Ilusión, conocimiento y manipulación."};
  const schoolIcons={ascendant:"school-ascendente.png",verdant:"school-verdante.png",eradication:"school-erradicacion.png",abyssal:"school-abisal.png",phantasm:"school-fantasma.png"};
  $("#school-grid").innerHTML=catalogs.schools.map(s=>`<button type="button" class="school-card" data-school="${esc(s.code)}"><img class="school-symbol-image" src="assets/art/sigils/${schoolIcons[s.code]||"school-ascendente.png"}?v=0.2.30" alt="" aria-hidden="true" decoding="async" /><strong>${esc(s.name_es)}</strong><small>${esc(descriptions[s.code]||s.description_es||"")}</small></button>`).join("");
  $$(".school-card").forEach(btn=>btn.addEventListener("click",()=>{selectedSchool=btn.dataset.school; $$(".school-card").forEach(x=>x.classList.toggle("selected",x===btn));}));
}
function renderChrome(){
  const r=realmState.realm; const school=catalogs.schools.find(s=>s.code===r.school_code);
  $("#mage-title").textContent=r.mage_name; $("#mage-school").textContent=school?.name_es||r.school_code;
  $("#mage-card-button").dataset.profile=r.mage_name;
  if(typeof renderOwnProfileBadge==="function")renderOwnProfileBadge(); else $("#mage-sigil").textContent=symbols[r.school_code]||"✦";
  $("#season-badge").textContent=`v${BUILD_VERSION}`;
  syncPassiveResourceFlow(realmState);
  renderResourceStrip();
}
function renderResourceStrip(){
  const r=realmState?.realm; if(!r)return; nextTurnAt=r.next_turn_at?new Date(r.next_turn_at):null;
  $("#resource-strip").innerHTML=`
    <div class="resource-item turns has-icon resource-turns"><img class="resource-icon" src="data:image/png;base64,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" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Turnos</small><strong><span id="turn-count">${n(r.turns)}</span> / ${n(r.max_turns)}</strong></span></div>
    <div class="resource-item has-icon resource-next"><img class="resource-icon" src="assets/ui/resources/tiempo.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Próximo</small><strong id="next-turn">${r.turns>=r.max_turns?"MÁXIMO":"--:--"}</strong></span></div>
    <div class="resource-item has-icon resource-gold"><img class="resource-icon" src="assets/ui/resources/oro.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Oro</small><strong data-live-resource="gold">${n(r.gold)}</strong></span></div>
    <div class="resource-item has-icon resource-mana"><img class="resource-icon" src="assets/ui/resources/mana.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Maná</small><strong data-live-resource="mana">${n(r.mana)}</strong></span></div>
    <div class="resource-item has-icon resource-population"><img class="resource-icon" src="assets/ui/resources/poblacion.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Población</small><strong data-live-resource="population">${n(r.population)}</strong></span></div>
    <div class="resource-item has-icon resource-land"><img class="resource-icon" src="assets/ui/resources/tierras.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Tierras</small><strong data-live-resource="land">${n(r.land)}</strong></span></div>
    <div class="resource-item has-icon resource-power"><img class="resource-icon" src="assets/ui/resources/poder-neto.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Poder Neto</small><strong data-live-resource="net_power">${n(r.net_power)}</strong></span></div>`;
  updatePassiveResourceDisplay();
}
function updateTurnCountdown(){
  updatePassiveResourceDisplay();
  if(!realmState?.realm)return; const el=$("#next-turn"); if(!el)return;
  const r=realmState.realm; if(r.turns>=r.max_turns || !nextTurnAt){el.textContent="MÁXIMO";return;}
  const d=nextTurnAt.getTime()-Date.now();
  if(d<=0){el.textContent="00:00"; if(!turnRefreshPending){turnRefreshPending=true; refreshState(true).finally(()=>turnRefreshPending=false);} return;}
  const s=Math.ceil(d/1000); el.textContent=`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}
async function refreshState(quiet=false){
  try{ realmState=await rpc("my_realm_state"); renderChrome(); if(["realm","economy","build","research","army"].includes(currentView)) await renderView(currentView); if(!quiet)toast("Reino actualizado."); }
  catch(e){ if(!quiet)toast(humanError(e),"error"); }
}
