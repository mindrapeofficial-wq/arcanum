"use strict";

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
function showAuth(){ hide($("#boot")); hide($("#create-view")); hide($("#game-view")); show($("#auth-view")); }
function showCreateRealm(){ hide($("#boot")); hide($("#auth-view")); hide($("#game-view")); show($("#create-view")); const username=getSession()?.user?.user_metadata?.username||""; $("#realm-name-preview").textContent=username; renderSchools(); }
function showGame(){
  hide($("#boot")); hide($("#auth-view")); hide($("#create-view")); show($("#game-view"));
  renderChrome(); navigate("realm");
  if(typeof refreshOwnProfileBadge==="function")refreshOwnProfileBadge(true);
  clearInterval(periodicTimer); periodicTimer=setInterval(()=>refreshState(true),45000);
  clearInterval(countdownTimer); countdownTimer=setInterval(updateTurnCountdown,1000); updateTurnCountdown();
}

function renderSchools(){
  const descriptions={ascendant:"Luz, protección y resurrección.",verdant:"Naturaleza, crecimiento y regeneración.",eradication:"Fuego, destrucción y poder directo.",abyssal:"Muerte, demonios y corrupción.",phantasm:"Ilusión, conocimiento y manipulación."};
  $("#school-grid").innerHTML=catalogs.schools.map(s=>`<button type="button" class="school-card" data-school="${esc(s.code)}">${s.code==="ascendant"?`<img class="school-symbol-image" src="assets/art/sigils/ascendente.webp?v=0.2.8" alt="" aria-hidden="true" />`:`<span class="school-symbol">${symbols[s.code]||"✦"}</span>`}<strong>${esc(s.name_es)}</strong><small>${esc(descriptions[s.code]||s.description_es||"")}</small></button>`).join("");
  $$(".school-card").forEach(btn=>btn.addEventListener("click",()=>{selectedSchool=btn.dataset.school; $$(".school-card").forEach(x=>x.classList.toggle("selected",x===btn));}));
}
function renderChrome(){
  const r=realmState.realm; const school=catalogs.schools.find(s=>s.code===r.school_code);
  $("#mage-title").textContent=r.mage_name; $("#mage-school").textContent=school?.name_es||r.school_code;
  $("#mage-card-button").dataset.profile=r.mage_name;
  if(typeof renderOwnProfileBadge==="function")renderOwnProfileBadge(); else $("#mage-sigil").textContent=symbols[r.school_code]||"✦";
  $("#season-badge").innerHTML=`<strong>${esc(realmState.season.name)}</strong><br>${esc(realmState.season.status)} · ${esc(realmState.season.ruleset_version)}<br><span style="opacity:.62">BETA ${BUILD_VERSION}</span>`;
  renderResourceStrip();
}
function renderResourceStrip(){
  const r=realmState?.realm; if(!r)return; nextTurnAt=r.next_turn_at?new Date(r.next_turn_at):null;
  $("#resource-strip").innerHTML=`
    <div class="resource-item turns"><small>Turnos</small><strong><span id="turn-count">${n(r.turns)}</span> / ${n(r.max_turns)}</strong></div>
    <div class="resource-item"><small>Próximo</small><strong id="next-turn">${r.turns>=r.max_turns?"MÁXIMO":"--:--"}</strong></div>
    <div class="resource-item has-icon"><img class="resource-icon" src="assets/ui/resources/oro.png?v=0.2.7" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Oro</small><strong>${n(r.gold)}</strong></span></div>
    <div class="resource-item has-icon"><img class="resource-icon" src="assets/ui/resources/mana.png?v=0.2.7" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Maná</small><strong>${n(r.mana)}</strong></span></div>
    <div class="resource-item has-icon"><img class="resource-icon" src="assets/ui/resources/poblacion.png?v=0.2.7" alt="" aria-hidden="true" decoding="async" /><span class="resource-copy"><small>Población</small><strong>${n(r.population)}</strong></span></div>
    <div class="resource-item"><small>Tierras</small><strong>${n(r.land)}</strong></div>
    <div class="resource-item"><small>Poder Neto</small><strong>${n(r.net_power)}</strong></div>`;
}
function updateTurnCountdown(){
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
