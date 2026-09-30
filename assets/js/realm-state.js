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
  const icon=(data)=>`data:image/png;base64,${data}`;
  $("#resource-strip").innerHTML=`
    <div class="resource-item turns has-icon"><img class="resource-icon" src="${icon("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")}" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Turnos</small><strong><span id="turn-count">${n(r.turns)}</span> / ${n(r.max_turns)}</strong></span></div>
    <div class="resource-item has-icon"><img class="resource-icon" src="${icon("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")}" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Próximo</small><strong id="next-turn">${r.turns>=r.max_turns?"MÁXIMO":"--:--"}</strong></span></div>
    <div class="resource-item has-icon"><img class="resource-icon" src="assets/ui/resources/oro.png?v=0.2.9" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Oro</small><strong data-live-resource="gold">${n(r.gold)}</strong></span></div>
    <div class="resource-item has-icon"><img class="resource-icon" src="assets/ui/resources/mana.png?v=0.2.9" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Maná</small><strong data-live-resource="mana">${n(r.mana)}</strong></span></div>
    <div class="resource-item has-icon"><img class="resource-icon" src="assets/ui/resources/poblacion.png?v=0.2.9" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Población</small><strong data-live-resource="population">${n(r.population)}</strong></span></div>
    <div class="resource-item has-icon"><img class="resource-icon" src="${icon("iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAwFBMVEX3uSvlpSbonBvSmSjckCHdiBbPjCu8ii/QfRy9fCfHbxK7bBeveSuadBWhayGvYhygYiCWYh6KYBSaVxaJWBiOShR+Whd5TxJtVA90SiB2QxpdRAx9OA1sOBZfOxddMh1SOA1GOQhRMhFDLwdlJgtVJw5MKRNMIg9CKgk/Iw4/GgkzLAUtJAM0HQslHQQuFggsDwUYDwQdBgELBAAEAwACAQABAgEBAQEBAQAAAQAYAAEFAAACAAABAAAAAAEAAABZ2ej0AAADV0lEQVR42u2V23qqOhSFQQSUM0QkacCACCIngeBeKKW8/1ttbGsPq+1e7b5eueTjzxgZc2aGGX+4mL/A+9X9XGH4AXAa27I9D98FumGkxIya7v57wDCe61gU3B394OpT4PRQIyIwRuyldBiGPwK/WopYIAgiid2ofXif1idAOzY7UfCWAuvFsZtSOgXwJdB14z9jrNm6oeksZ8THfYT8+q0G81upWtokBuuZK1NgVoQUzUZ0cf5Gg3mffYnzwFwoCJaaogOSHjzBPLhuPvn8BOhGii2MLUu8C0sP7aOtb6wEmxQ7u3zReAO0XQ1DmGdqoKqqhZMCGXOlIPbd4WCBqOt+B6a4A8sPsiws7TW/gNhQDJEc4mO0D3PbaZ+JF6A7lxjC2lezoAzLRFaWGlmhOE6SMvPjaFc9m7oB7fmoclaew6z2aRCUnOhnGMY4xEHubIrIBcVTuMwtn4vLLaEKcTjtGOQ1tjRtnUFrtXIcnOEwtAB9JJjn//M1uBNnsxkvyaoVlr4DfUHA1nLOziVgh1lig213ugHdWKqc6CAgy9KMYWYzebEQOA0vGYbh+Tm/AIEfuWF/s9T9qk0OZlh1dP6qocNM4zgIJpS/fpi2IZ6TNo+9zjwaOgJWMYM8y5CJNgg6JqPkpc5Pa8YvJElyijhKq/amcBrrnXsQWNnyIbYWKlTXlqCskC1PhHT9PyiOEzC8WDr5ipLYClEYjmFVP8VgOq0grjYrXZYkEGRV2lTN8FqHPrLtdIcKInAwBFNW7NW+JOsbvLGt0F/Du6bv37TG0F+aJo2ODg5TecbPp4MuFgsJWLJXbrfE1DTdbcb7N5Xu+p72JRJ8ommmfvUhTfvD3JF1Zx0TdPDAng7Du146t+FSRIdiu1UUDQCgg3WY5y7LLtOCpETfNU/N9NqtNDXEuIIwJwRB34RBghRpLuzSiFZp1dx/uA8dTfcNEZGb7Mm2JAghBelzhnf3SX3p6Wn4eB+aujT12CuOhnhIDpNEEZtL20UgOXVfDIFJPLWLxvaOR6RoRlAgL93VFX34fGpMovcNbeipqWiFCLkr0mtHjH339Vw6n0c6FXIcL7SpqiZNL83lv0flU9jdxPSXy3hP+z8P4+FVbbi+D8O3X6Bh+Puw/1/gX6Oiwnq+5xG8AAAAAElFTkSuQmCC")}" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Tierras</small><strong data-live-resource="land">${n(r.land)}</strong></span></div>
    <div class="resource-item has-icon"><img class="resource-icon" src="${icon("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")}" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Poder Neto</small><strong data-live-resource="net_power">${n(r.net_power)}</strong></span></div>`;
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
