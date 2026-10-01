"use strict";

const PASSIVE_TURN_MS=5*60*1000;
const PASSIVE_RESOURCE_FIELDS={
  gold:{label:"Oro",aliases:["gold","oro"]},
  mana:{label:"Maná",aliases:["mana"]},
  population:{label:"Población",aliases:["population","poblacion","population_gain"]},
  land:{label:"Tierras",aliases:["land","tierras"]},
  net_power:{label:"Ascendencia",aliases:["net_power","poder_neto","power"]}
};
let passiveResourceFlow=null;

function researchPointsPerTurn(state=realmState){
  const guilds=Math.max(0,Number(state?.buildings?.guilds||0));
  return Math.floor(Math.sqrt(guilds)*3.5);
}
function foodResourceInfo(state=realmState){
  const r=state?.realm||{}, c=state?.capacities||{};
  const hasStored=Object.prototype.hasOwnProperty.call(r,"food")&&Number.isFinite(Number(r.food));
  if(hasStored){
    const value=Math.max(0,Number(r.food)||0);
    return {stored:true,value,label:"Alimento",text:n(value),title:`Alimento almacenado: ${n(value)}.`};
  }
  const supply=Math.max(0,Number(c.food||0));
  const population=Math.max(0,Number(r.population||0));
  const margin=Math.max(0,supply-population);
  return {stored:false,value:supply,label:"Alimento",text:n(supply),title:`Capacidad de sustento: ${n(supply)} · población ${n(population)} · margen ${n(margin)}. El Alimento es capacidad, no un stock consumible.`};
}
function researchResourceInfo(state=realmState){
  const r=state?.realm||{};
  const hasStored=Object.prototype.hasOwnProperty.call(r,"research_points")&&Number.isFinite(Number(r.research_points));
  if(hasStored){
    const value=Math.max(0,Number(r.research_points)||0);
    return {stored:true,value,label:"Conocimiento Arcano",text:n(value),title:`Puntos de conocimiento arcano almacenados: ${n(value)} RP.`};
  }
  const ppt=researchPointsPerTurn(state);
  const current=state?.research||{};
  const progress=Number.isFinite(Number(current.effective_cost))&&Number.isFinite(Number(current.remaining_points))
    ?Math.max(0,Number(current.effective_cost)-Number(current.remaining_points))
    :null;
  const progressText=progress===null?"":` · progreso actual ${n(progress)} RP`;
  return {stored:false,value:ppt,label:"Investigación",text:`${n(ppt)} RP/t`,title:`Ritmo de investigación: ${n(ppt)} RP por turno dedicado a investigar${progressText}. Los RP no se acumulan pasivamente: se aplican directamente al hechizo en curso.`};
}

function passiveFallbackYield(){
  // Never invent economic production in the browser.
  // Until the server exposes a yield or we observe a completed turn delta,
  // the visual interpolation remains at zero.
  return {gold:0,mana:0,population:0,land:0,net_power:0};
}

function economyContract(state=realmState){
  const r=state?.realm||{}, b=state?.buildings||{}, cap=state?.capacities||{};
  const population=Math.max(0,Number(r.population||0));
  const foodCapacity=Math.max(0,Number(cap.food||0));
  const residentialCapacity=Math.max(0,Number(cap.residential||0));
  const populationCapacity=Math.max(0,Math.min(foodCapacity,residentialCapacity));
  const foodMargin=Math.max(0,foodCapacity-population);
  const housingMargin=Math.max(0,residentialCapacity-population);
  const manaCapacity=Math.max(0,Number(cap.mana||0));
  const mana=Math.max(0,Number(r.mana||0));
  const researchPerTurn=researchPointsPerTurn(state);
  const wilderness=Math.max(0,Number(r.wilderness||0));
  const land=Math.max(0,Number(r.land||0));
  return {
    turns:{
      value:Math.max(0,Number(r.turns||0)),
      cap:Math.max(0,Number(r.max_turns||0)),
      role:"Presupuesto de acciones. Se regenera con el tiempo y se consume al actuar."
    },
    gold:{
      value:Math.max(0,Number(r.gold||0)),
      role:"Liquidez del reino. Comercio, reclutamiento y costes económicos/militares."
    },
    mana:{
      value:mana,
      cap:manaCapacity,
      headroom:Math.max(0,manaCapacity-mana),
      role:"Reserva arcana. Invocaciones, unidades mágicas, comercio y otros costes arcanos."
    },
    population:{
      value:population,
      cap:populationCapacity,
      headroom:Math.max(0,populationCapacity-population),
      role:"Habitantes disponibles. Su techo es el menor entre vivienda y sustento."
    },
    food:{
      value:foodCapacity,
      margin:foodMargin,
      stored:false,
      role:"Capacidad de sustento, no stock. Si la población alcanza este límite, deja de poder crecer por alimento."
    },
    housing:{
      value:residentialCapacity,
      margin:housingMargin,
      role:"Capacidad residencial aportada principalmente por Pueblos."
    },
    research:{
      value:researchPerTurn,
      unit:"RP/turno de investigación",
      stored:false,
      role:"Flujo de conocimiento aplicado al gastar turnos investigando. No se acumula pasivamente."
    },
    land:{
      value:land,
      wilderness,
      developed:Math.max(0,land-wilderness),
      role:"Capacidad física del reino. Construir transforma tierra salvaje en infraestructura."
    },
    ascendancy:{
      value:Math.max(0,Number(r.net_power||0)),
      role:"Indicador derivado de fuerza global. No se almacena ni se gasta."
    },
    buildings:{
      farms:{count:Number(b.farms||0),role:"Aumentan la capacidad de Alimento y sostienen el crecimiento poblacional."},
      towns:{count:Number(b.towns||0),role:"Aumentan la capacidad residencial y apoyan la economía de Oro."},
      nodes:{count:Number(b.nodes||0),role:"Aumentan la capacidad y la economía de Maná."},
      workshops:{count:Number(b.workshops||0),role:"Reducen el coste efectivo en turnos de futuras construcciones."},
      guilds:{count:Number(b.guilds||0),role:"Generan RP cuando dedicas turnos a Investigación."},
      barracks:{count:Number(b.barracks||0),role:"Desbloquean el reclutamiento de unidades."},
      fortresses:{count:Number(b.fortresses||0),role:"Sostienen la supervivencia y defensa estratégica del dominio."},
      barriers:{count:Number(b.barriers||0),role:"Defensa arcana especializada."}
    }
  };
}

function passiveBuildingSignature(state=realmState){
  const b=state?.buildings||{};
  return Object.keys(b).sort().map(k=>`${k}:${Number(b[k]||0)}`).join("|");
}
function passiveCacheKey(state=realmState){
  const mage=String(state?.realm?.mage_name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_");
  return `arcanum_passive_yield_v3_${mage}_${passiveBuildingSignature(state)}`;
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
  const fallbackYield=passiveFallbackYield();
  let yieldPerTurn=passiveServerYield(state)||passiveReadCache(state)||(sameSignature?passiveResourceFlow?.yieldPerTurn:null)||fallbackYield;
  yieldPerTurn={...fallbackYield,...yieldPerTurn};

  if(previous && sameSignature){
    const turnsGained=current.turns-previous.turns;
    const scheduleAdvanced=current.nextTurnAt>previous.nextTurnAt+PASSIVE_TURN_MS*0.45;
    if(turnsGained>0 && scheduleAdvanced){
      const learned={};
      for(const field of Object.keys(PASSIVE_RESOURCE_FIELDS)){
        const delta=(current.values[field]-previous.values[field])/turnsGained;
        if(Number.isFinite(delta) && delta!==0)learned[field]=delta;
      }
      if(Object.keys(learned).length){
        yieldPerTurn={...yieldPerTurn,...learned};
        passiveWriteCache(state,yieldPerTurn);
      }
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
    const els=document.querySelectorAll(`[data-live-resource="${field}"]`);
    if(!els.length)continue;
    const value=n(passiveDisplayedValue(field));
    const title=passiveRateTitle(field);
    els.forEach(el=>{
      el.textContent=value;
      const item=el.closest(".resource-item,.economy-resource-card");
      if(item){
        if(title)item.title=title; else item.removeAttribute("title");
      }
    });
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
  catalogs={schools:schools.map(s=>({...s,name_es:schoolName(s.code)})),spells,units,summons};
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
  renderChrome(); navigate("character");
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
  const food=foodResourceInfo(realmState), research=researchResourceInfo(realmState);
  $("#resource-strip").innerHTML=`
    <div class="resource-item turns has-icon resource-turns"><span class="resource-icon resource-icon-inline" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M24 10v5M24 33v5M10 24h5M33 24h5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M17 16h14l-2.2 5.2c-.8 1.8-2.2 3-4.8 3s-4-1.2-4.8-3L17 16Zm0 16h14l-2.2-5.2c-.8-1.8-2.2-3-4.8-3s-4 1.2-4.8 3L17 32Z" fill="currentColor" opacity=".92"/></svg></span><span class="resource-copy"><small>Turnos</small><strong><span id="turn-count">${n(r.turns)}</span> / ${n(r.max_turns)}</strong></span></div>
    <div class="resource-item has-icon resource-next"><img class="resource-icon" src="assets/ui/resources/tiempo.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Próximo</small><strong id="next-turn">${r.turns>=r.max_turns?"MÁXIMO":"--:--"}</strong></span></div>
    <div class="resource-item has-icon resource-gold"><img class="resource-icon" src="assets/ui/resources/oro.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Oro</small><strong data-live-resource="gold">${n(r.gold)}</strong></span></div>
    <div class="resource-item has-icon resource-mana"><img class="resource-icon" src="assets/ui/resources/mana.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Maná</small><strong data-live-resource="mana">${n(r.mana)}</strong></span></div>
    <div class="resource-item has-icon resource-food" title="${esc(food.title)}"><img class="resource-icon" src="assets/ui/resources/poblacion.png?v=${BUILD_VERSION}" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Alimento</small><strong>${food.text}</strong></span></div>
    <div class="resource-item has-icon resource-research" title="${esc(research.title)}"><img class="resource-icon" src="assets/ui/nav/investigacion.png?v=${BUILD_VERSION}" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Conocimiento Arcano</small><strong>${research.text}</strong></span></div>
    <div class="resource-item has-icon resource-population"><img class="resource-icon" src="assets/ui/resources/poblacion.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Población</small><strong data-live-resource="population">${n(r.population)}</strong></span></div>
    <div class="resource-item has-icon resource-land"><img class="resource-icon" src="assets/ui/resources/tierras.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Tierras</small><strong data-live-resource="land">${n(r.land)}</strong></span></div>
    <div class="resource-item has-icon resource-power"><img class="resource-icon" src="assets/ui/resources/poder-neto.png?v=0.2.35" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Ascendencia</small><strong data-live-resource="net_power">${n(r.net_power)}</strong></span></div>`;
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
  try{ realmState=await rpc("my_realm_state"); renderChrome(); if(["realm","economy","build","research","army"].includes(currentView)) await renderView(currentView); if(!quiet)toast("Dominio actualizado."); }
  catch(e){ if(!quiet)toast(humanError(e),"error"); }
}


globalThis.economyContract=economyContract;
