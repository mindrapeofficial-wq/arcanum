"use strict";

async function renderWar(){
  const [targets,npcs,shield]=await Promise.all([rpc("attack_targets",{p_limit:100}),rpc("npc_directory"),rpc("my_shield_status").catch(()=>null)]);
  const npcMap=new Map((npcs||[]).map(x=>[String(x.mage_name).toLowerCase(),x]));
  const rows=targets.length?targets.map(t=>{const npc=npcMap.get(String(t.mage_name).toLowerCase());return `<div class="target-row"><div><strong><span class="school-dot ${esc(t.school_code)}"></span><button class="player-link" data-profile="${esc(t.mage_name)}">${esc(t.mage_name)}</button> ${npc?'<span class="tag npc-tag">NPC</span>':''}</strong><small>${esc(catalogs.schools.find(s=>s.code===t.school_code)?.name_es||t.school_code)}${npc?` · ${esc(npc.archetype)}`:''}</small></div><div><small>TIERRAS</small><strong>${n(t.land)}</strong></div><div><small>ASCENDENCIA</small><strong>${n(t.net_power)}</strong></div><div class="action-buttons">${t.can_attack?`<button class="small-action attack-btn" data-target="${esc(t.mage_name)}" data-mode="REGULAR" data-npc="${npc?1:0}">ATACAR</button><button class="small-action attack-btn" data-target="${esc(t.mage_name)}" data-mode="SIEGE" data-npc="${npc?1:0}">ASEDIO</button><button class="small-action attack-btn" data-target="${esc(t.mage_name)}" data-mode="PILLAGE" data-npc="${npc?1:0}" title="No conquista tierra: quema parte de los edificios productivos del rival">SAQUEAR</button>`:`<span class="tag">NO ATACABLE</span>`}</div></div>`}).join(""):`<div class="empty">Aún no hay otros Arcontes en esta temporada.</div>`;
  $("#view-host").innerHTML=`<div class="view-header"><div><span class="section-kicker">CONFLICTO ENTRE DOMINIOS</span><h2>Guerra</h2><p>Cada ataque consume 2 turnos.</p></div></div>${shieldPanelHtml(shield)}<div class="panel"><div class="target-list">${rows}</div></div>${warPhrasesPanelHtml()}`;
  $("#meditate-btn")?.addEventListener("click",e=>confirmMeditation(e.currentTarget));
  $$(".attack-btn").forEach(b=>b.addEventListener("click",()=>confirmAttack(b.dataset.target,b.dataset.mode,b)));
  wireWarPhrases();
}
function battleModeLabel(mode){return mode==="SIEGE"?"Asedio":mode==="PILLAGE"?"Saqueo":"Ataque regular";}
function shieldPanelHtml(s){
  if(!s)return "";
  const fmt=d=>new Date(d).toLocaleString("es-ES");
  let status="Sin protección activa.";
  if(s.meditation_until)status=`<strong class="luck-on">MEDITACIÓN</strong> hasta ${esc(fmt(s.meditation_until))}. No puedes atacar ni ser atacado.`;
  else if(s.damage_shield_until)status=`<strong class="luck-on">PROTEGIDO</strong> hasta ${esc(fmt(s.damage_shield_until))} tras sufrir grandes pérdidas. Solo pueden atacarte quienes hayan sido atacados por ti en las últimas 24 h.`;
  const action=s.can_meditate?`<button class="small-action" id="meditate-btn" type="button">MEDITAR 3 DÍAS</button>`:(s.meditation_available_at?`<small class="tools-note">Podrás volver a meditar el ${esc(fmt(s.meditation_available_at))}.</small>`:"");
  return `<div class="panel shield-panel"><div class="luck-status"><span>${status}</span></div>${action}</div>`;
}
async function confirmMeditation(btn){
  if(!confirm("Meditar durante 3 días: no podrás atacar ni ser atacado, y no podrás volver a meditar en 14 días. Tus turnos seguirán acumulándose. ¿Continuar?"))return;
  try{await actionCall(btn,()=>rpc("start_meditation"),null,()=>"Tu Arconte entra en meditación.");await renderWar();}catch(e){toast(humanError(e),"error");}
}
/* ---------- Mensajes de guerra (LOCAL_ONLY) ----------
   attack_mage no admite texto: la frase elegida se envía como mensaje directo (send_direct_message)
   solo cuando el jugador la selecciona, tras confirmar el ataque. Los NPC no reciben mensajes. */
const WAR_PHRASES_PREFIX="arcanum_war_phrases_v1_";
const WAR_PHRASES_MAX=10;
const WAR_PHRASE_MAX_CHARS=140;
let warPhraseSelected="";
function sanitizeWarPhrases(raw){
  if(!Array.isArray(raw))return [];
  const out=[];
  for(const item of raw){
    const text=String(item??"").replace(/\s+/g," ").trim().slice(0,WAR_PHRASE_MAX_CHARS);
    if(text&&!out.includes(text))out.push(text);
    if(out.length>=WAR_PHRASES_MAX)break;
  }
  return out;
}
function warPhrasesKey(){
  const mage=String(realmState?.realm?.mage_name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_");
  return WAR_PHRASES_PREFIX+mage;
}
function loadWarPhrases(){try{return sanitizeWarPhrases(JSON.parse(localStorage.getItem(warPhrasesKey())||"[]"));}catch{return [];}}
function saveWarPhrases(list){try{localStorage.setItem(warPhrasesKey(),JSON.stringify(sanitizeWarPhrases(list)));}catch{}}
function warPhrasesPanelHtml(){
  const phrases=loadWarPhrases();
  if(!phrases.includes(warPhraseSelected))warPhraseSelected="";
  const list=phrases.length?phrases.map((p,i)=>`<div class="war-phrase-row"><span>${esc(p)}</span><button class="small-action" type="button" data-war-phrase-remove="${i}" aria-label="Quitar mensaje">✕</button></div>`).join(""):`<div class="empty">Sin mensajes guardados.</div>`;
  const options=phrases.map((p,i)=>`<option value="${i}" ${p===warPhraseSelected?"selected":""}>${esc(p.length>60?p.slice(0,57)+"…":p)}</option>`).join("");
  return `<div class="panel war-phrases" style="margin-top:14px"><h3>Frases para tus ataques</h3><p class="tools-note">Guarda frases (máx. ${WAR_PHRASES_MAX}, ${WAR_PHRASE_MAX_CHARS} caracteres) en este navegador. Si eliges una, se enviará como mensaje directo al rival después de atacar; el rival no recibe nada si no la seleccionas. Los NPC no reciben mensajes.</p><div class="war-phrase-form"><input id="war-phrase-input" type="text" maxlength="${WAR_PHRASE_MAX_CHARS}" placeholder="Escribe un mensaje" aria-label="Nuevo mensaje de guerra" /><button id="war-phrase-add" class="small-action" type="button">GUARDAR</button></div><div class="war-phrase-list">${list}</div><label class="field-caption">Enviar tras el próximo ataque<select id="war-phrase-select"><option value="">Ninguno</option>${options}</select></label></div>`;
}
function wireWarPhrases(){
  const rerender=()=>{const host=$(".war-phrases");if(!host)return;host.outerHTML=warPhrasesPanelHtml();wireWarPhrases();};
  $("#war-phrase-add")?.addEventListener("click",()=>{
    const text=String($("#war-phrase-input")?.value||"").replace(/\s+/g," ").trim();
    if(!text){toast("Escribe un mensaje.","error");return;}
    const list=loadWarPhrases();
    if(list.length>=WAR_PHRASES_MAX&&!list.includes(text)){toast(`Máximo ${WAR_PHRASES_MAX} mensajes.`,"error");return;}
    saveWarPhrases([...list.filter(p=>p!==text),text]);rerender();
  });
  $$("[data-war-phrase-remove]").forEach(b=>b.addEventListener("click",()=>{
    const index=Number(b.dataset.warPhraseRemove);
    const list=loadWarPhrases();const removed=list[index];
    saveWarPhrases(list.filter((_,i)=>i!==index));
    if(removed===warPhraseSelected)warPhraseSelected="";
    rerender();
  }));
  $("#war-phrase-select")?.addEventListener("change",e=>{warPhraseSelected=e.target.value===""?"":(loadWarPhrases()[Number(e.target.value)]||"");});
}
async function sendWarPhrase(target,phrase){
  try{await rpc("send_direct_message",{p_mage_name:target,p_body:phrase});toast(`Mensaje de guerra enviado a ${target}.`,"success",3000);}
  catch(e){toast(`El ataque se completó, pero el mensaje no se pudo enviar: ${humanError(e)}`,"error",6000);}
}
async function confirmAttack(target,mode,btn){
  const isNpc=btn?.dataset?.npc==="1";
  const phrase=(!isNpc&&loadWarPhrases().includes(warPhraseSelected))?warPhraseSelected:"";
  const phraseNote=phrase?`\n\nTras el ataque se enviará a ${target} este mensaje: «${phrase}»`:"";
  if(!confirm(`${mode==="SIEGE"?"Asediar":mode==="PILLAGE"?"Saquear":"Atacar"} a ${target}? Las bajas y el gasto de guerra serán permanentes.${phraseNote}`))return;
  try{
    const res=await actionCall(btn,()=>rpc("attack_mage",{p_target_mage_name:target,p_mode:mode}),null,res=>res.attacker_victory?(mode==="PILLAGE"?`Saqueo exitoso. Edificios productivos destruidos: ${n(res.pillage?.total||0)}.`:`Victoria. Has conquistado ${n(res.land_gained)} acres.`):`El ataque no ha logrado la victoria. Pérdidas: ${(Number(res.attacker_loss_bp)/100).toFixed(2)}%.`);
    if(phrase)await sendWarPhrase(target,phrase);
    openImmediateBattleResult(target,mode,res);
    let battleId=res?.battle_id;
    if(!battleId){
      try{
        const reports=await rpc("my_battle_reports",{p_limit:5});
        battleId=(reports||[]).find(r=>String(r.opponent_mage_name).toLowerCase()===String(target).toLowerCase())?.battle_id||(reports||[])[0]?.battle_id;
      }catch(e){}
    }
    if(battleId){
      if(res?.attacker_victory && typeof artifactClaimPvp==="function"){ // only a win can drop loot; a defeat just earns a pointless 409
        try{await artifactClaimPvp(battleId);}catch(e){}
      }
      try{await openBattleReport(battleId,true);}catch(e){}
    }
  }catch(e){toast(humanError(e),"error");}
}

function openImmediateBattleResult(target,mode,res){
  const b={
    mode,
    attacker_victory:!!res?.attacker_victory,
    attacker_loss_bp:Number(res?.attacker_loss_bp||0),
    defender_loss_bp:Number(res?.defender_loss_bp||0),
    land_gained:Number(res?.land_gained||0)
  };
  const chronicle=battleNarrative(b,[],[]);
  $("#modal-content").innerHTML=`<span class="section-kicker">CRÓNICA INMEDIATA</span><h3>${battleModeLabel(mode)} contra ${esc(target)} · ${b.attacker_victory?"Victoria":"Derrota"}</h3><div class="battle-chronicle"><div class="battle-chronicle-head"><span>✦</span><div><small>RELATO DEL CAMPO</small><strong>${b.attacker_victory?"La ofensiva quebró la resistencia":"La defensa sostuvo la línea"}</strong></div></div><p>${esc(chronicle.opening)}</p><p>${esc(chronicle.middle)}</p><p>${esc(chronicle.ending)}</p><div class="battle-verdict"><small>CLAVES DEL DESENLACE</small><ul>${chronicle.keys.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div><div class="grid-3"><div class="stat-card"><small>Pérdidas atacante</small><strong>${(Number(b.attacker_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Pérdidas defensor</small><strong>${(Number(b.defender_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Tierra conquistada</small><strong>${n(b.land_gained)}</strong></div></div><p class="battle-detail-note">El informe técnico completo se añadirá aquí si el registro detallado de la batalla está disponible.</p>`;
  show($("#modal"));
}

function battleNarrative(b,units,events){
  const attackerLoss=Number(b.attacker_loss_bp||0)/100;
  const defenderLoss=Number(b.defender_loss_bp||0)/100;
  const land=Number(b.land_gained||0);
  const siege=b.mode==="SIEGE";
  const won=!!b.attacker_victory;
  const rows=units||[];
  const sideStats=side=>{
    const sideRows=rows.filter(u=>u.side===side);
    const initial=sideRows.reduce((s,u)=>s+Number(u.initial_quantity||0),0);
    const final=sideRows.reduce((s,u)=>s+Number(u.final_quantity||0),0);
    const recovered=sideRows.reduce((s,u)=>s+Number(u.recovered||0),0);
    const worst=sideRows.map(u=>({...u,lost:Math.max(0,Number(u.initial_quantity||0)-Number(u.final_quantity||0))})).sort((a,z)=>z.lost-a.lost)[0];
    return {initial,final,recovered,worst};
  };
  const a=sideStats("attacker"),d=sideStats("defender");
  const margin=Math.abs(defenderLoss-attackerLoss);
  const opening=siege
    ?"La batalla comenzó bajo el peso de un asedio. Las formaciones avanzaron contra una defensa preparada para convertir cada palmo de terreno en un precio de sangre."
    :"El choque fue rápido y frontal. Ambos ejércitos buscaron quebrar la línea rival antes de que el desgaste convirtiera la ofensiva en una guerra de resistencia.";
  let middle;
  if(margin<2) middle="Durante buena parte del combate ninguna fuerza logró imponerse con claridad. Las pérdidas avanzaron casi en paralelo y el desenlace quedó suspendido en un margen estrecho.";
  else if(defenderLoss>attackerLoss) middle=`El equilibrio terminó inclinándose hacia el atacante. La defensa sufrió ${defenderLoss.toFixed(2)}% de pérdidas frente al ${attackerLoss.toFixed(2)}% atacante, una diferencia de ${margin.toFixed(2)} puntos que abrió la brecha decisiva.`;
  else middle=`La ofensiva empezó a perder impulso. El atacante sufrió ${attackerLoss.toFixed(2)}% de pérdidas frente al ${defenderLoss.toFixed(2)}% defensor, y esa diferencia de ${margin.toFixed(2)} puntos fue erosionando su capacidad de continuar el avance.`;
  let ending;
  if(b.mode==="PILLAGE") ending=won?"El saqueo tuvo éxito: los atacantes prendieron fuego a granjas, aldeas y talleres rivales, pero ni un acre cambió de manos.":"Los defensores impidieron el saqueo y las llamas no llegaron a los campos.";
  else if(won&&land>0) ending=`Cuando el campo quedó en silencio, la iniciativa seguía en manos del atacante. La victoria permitió arrancar ${n(land)} acres al dominio rival y convertir el resultado militar en una ganancia territorial real.`;
  else if(won) ending="El atacante conservó la iniciativa hasta el final y obtuvo la victoria, aunque el combate no produjo una ganancia territorial significativa.";
  else ending="La defensa resistió lo suficiente para romper la ofensiva. El atacante tuvo que retirarse sin convertir el combate en conquista territorial.";
  const keys=[];
  if(defenderLoss>attackerLoss+0.5)keys.push(`Desgaste favorable al atacante: ${defenderLoss.toFixed(2)}% de pérdidas defensoras frente a ${attackerLoss.toFixed(2)}% atacantes.`);
  else if(attackerLoss>defenderLoss+0.5)keys.push(`Desgaste favorable al defensor: ${attackerLoss.toFixed(2)}% de pérdidas atacantes frente a ${defenderLoss.toFixed(2)}% defensoras.`);
  else keys.push("El intercambio de bajas fue muy equilibrado; el resultado se decidió por un margen reducido.");
  if(a.recovered||d.recovered)keys.push(`La recuperación posterior devolvió ${n(a.recovered)} unidades al atacante y ${n(d.recovered)} al defensor, reduciendo parte de las bajas brutas.`);
  if(a.worst?.lost>0)keys.push(`La formación atacante más castigada fue ${a.worst.name_es}, con ${n(a.worst.lost)} efectivos perdidos antes de la recuperación.`);
  if(d.worst?.lost>0)keys.push(`La formación defensora más castigada fue ${d.worst.name_es}, con ${n(d.worst.lost)} efectivos perdidos antes de la recuperación.`);
  if(siege)keys.push("El modo Asedio hizo que la resistencia territorial y las fortificaciones formasen parte central del desenlace.");
  if(won&&land>0)keys.push(`La superioridad final fue suficiente para conquistar ${n(land)} acres.`);
  else if(!won)keys.push("La ofensiva no alcanzó el umbral necesario para transformar el choque en victoria atacante.");
  return {opening,middle,ending,keys:keys.slice(0,5)};
}

async function renderRanking(){
  const [realmRowsRaw,pvpData,warRowsRaw]=await Promise.all([
    rpc("realm_ranking").catch(()=>[]),
    stateApi("/arena/ranking").catch(()=>({ranking:[]})),
    rpc("war_ranking").catch(()=>[])
  ]);
  const mine=String(realmState.realm.mage_name||"").trim().toLowerCase();
  const realmRows=Array.isArray(realmRowsRaw)?realmRowsRaw:[];
  const warRows=Array.isArray(warRowsRaw)?warRowsRaw:[];
  const pvpRows=Array.isArray(pvpData?.ranking)?pvpData.ranking:[];
  const schoolName=code=>catalogs.schools.find(s=>s.code===code)?.name_es||code||"—";

  const realmBody=realmRows.length?realmRows.map((x,index)=>`<tr class="${String(x.username).trim().toLowerCase()===mine?"rank-me":""}"><td>${n(index+1)}</td><td><strong><button class="player-link" data-profile="${esc(x.username)}">${esc(x.username)}</button></strong></td><td><span class="school-dot ${esc(x.school_code)}"></span>${esc(schoolName(x.school_code))}</td><td>${n(x.land)}</td><td><strong>${n(x.realm_score)}</strong></td></tr>`).join(""):`<tr><td colspan="5"><div class="empty">Todavía no hay reinos humanos clasificados.</div></td></tr>`;

  const warBody=warRows.length?warRows.map((x,index)=>{
    const name=String(x.username||x.mage_name||"");
    const balance=Number(x.net_land||0);
    return `<tr class="${name.trim().toLowerCase()===mine?"rank-me":""}"><td>${n(index+1)}</td><td><strong><button class="player-link" data-profile="${esc(name)}">${esc(name)}</button></strong></td><td><span class="school-dot ${esc(x.school_code)}"></span>${esc(schoolName(x.school_code))}</td><td><strong>${n(x.wins||0)}</strong></td><td>${n(x.losses||0)}</td><td>${n(x.battles||0)}</td><td>${balance>0?"+":""}${n(balance)}</td></tr>`;
  }).join(""):`<tr><td colspan="7"><div class="empty">Todavía no hay guerras resueltas entre jugadores.</div></td></tr>`;

  const pvpBody=pvpRows.length?pvpRows.map((x,index)=>{
    const name=String(x.username||x.mage_name||"");
    const rate=(Number(x.wins||0)+Number(x.losses||0))?Math.round(Number(x.wins||0)*100/(Number(x.wins||0)+Number(x.losses||0))):0;
    return `<tr class="${name.trim().toLowerCase()===mine?"rank-me":""}"><td>${n(x.position||index+1)}</td><td><strong><button class="player-link" data-profile="${esc(name)}">${esc(name)}</button></strong></td><td>${n(x.wins||0)}</td><td>${n(x.losses||0)}</td><td>${rate}%</td><td><strong>${n(x.rating||1000)}</strong></td></tr>`;
  }).join(""):`<tr><td colspan="6"><div class="empty">Todavía no hay jugadores con clasificación de Arena.</div></td></tr>`;

  $("#view-host").innerHTML=`
    <div class="ranking-tabs" role="tablist" aria-label="Listas de clasificación">
      <button class="ranking-tab active" type="button" data-rank-tab="realm">Reino</button>
      <button class="ranking-tab" type="button" data-rank-tab="war">Guerra</button>
      <button class="ranking-tab" type="button" data-rank-tab="arena">Arena</button>
    </div>
    <section class="ranking-panel active" data-rank-panel="realm">
      <div class="ranking-panel-head"><div><span class="section-kicker">DOMINIOS</span><h3>Ranking de Reino</h3></div><p>Puntuación estratégica de territorio, infraestructura, ejército y desarrollo mágico. No equivale al Poder Neto.</p></div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Arconte</th><th>Escuela</th><th>Tierras</th><th>Puntuación Reino</th></tr></thead><tbody>${realmBody}</tbody></table></div>
    </section>
    <section class="ranking-panel" data-rank-panel="war">
      <div class="ranking-panel-head"><div><span class="section-kicker">CAMPAÑAS</span><h3>Ranking de Guerra</h3></div><p>Victorias militares. En empate cuentan el balance territorial, las derrotas y la actividad.</p></div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Arconte</th><th>Escuela</th><th>V</th><th>D</th><th>Batallas</th><th>Tierra +/-</th></tr></thead><tbody>${warBody}</tbody></table></div>
    </section>
    <section class="ranking-panel" data-rank-panel="arena">
      <div class="ranking-panel-head"><div><span class="section-kicker">ARENA</span><h3>Ranking de Arena</h3></div><p>Clasificación competitiva personal por ELO y récord de Arena.</p></div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Arconte</th><th>Victorias</th><th>Derrotas</th><th>Ratio</th><th>ELO</th></tr></thead><tbody>${pvpBody}</tbody></table></div>
    </section>`;

  $$(".ranking-tab").forEach(btn=>btn.addEventListener("click",()=>{
    const tab=btn.dataset.rankTab;
    $$(".ranking-tab").forEach(x=>x.classList.toggle("active",x===btn));
    $$(".ranking-panel").forEach(x=>x.classList.toggle("active",x.dataset.rankPanel===tab));
  }));
}

async function renderBattles(){
  const reports=await rpc("my_battle_reports",{p_limit:50});
  const rows=reports.length?reports.map(r=>`<div class="battle-row"><div><span class="tag ${r.result==="VICTORY"?"win":"loss"}">${r.result==="VICTORY"?"VICTORIA":"DERROTA"}</span></div><div><strong><button class="player-link" data-profile="${esc(r.opponent_mage_name)}">${esc(r.opponent_mage_name)}</button></strong><small>${new Date(r.created_at).toLocaleString("es-ES")} · ${r.mode==="SIEGE"?"Asedio":r.mode==="PILLAGE"?"Saqueo":"Ataque"}</small></div><div><small>TU PÉRDIDA</small><strong>${(Number(r.my_loss_bp)/100).toFixed(2)}%</strong></div><div><small>TIERRA</small><strong>${Number(r.land_change)>=0?"+":""}${n(r.land_change)}</strong></div><button class="small-action report-btn" data-battle="${esc(r.battle_id)}">INFORME</button></div>`).join(""):`<div class="empty">Todavía no has participado en ninguna batalla.</div>`;
  $("#view-host").innerHTML=`<div class="panel"><div class="battle-list">${rows}</div></div>`;
  $$(".report-btn").forEach(b=>b.addEventListener("click",()=>openBattleReport(b.dataset.battle)));
}
const BATTLE_EVENT_LABELS={PRIMARY:"Ataque",COUNTER:"Contraataque"};
function battleUnitNames(units){const names={};for(const u of units||[])names[u.unit_id]=u.name_es;return names;}
function battleWarExpenseRows(expense){
  const labels={gold:"Oro",mana:"Maná",population:"Población"};
  return Object.entries(labels).map(([key,label])=>({key,label,value:Math.max(0,Math.floor(Number(expense?.[key])||0))})).filter(r=>r.value>0);
}
function battleSideTotals(units,side){
  const rows=(units||[]).filter(u=>u.side===side);
  const initial=rows.reduce((sum,u)=>sum+Math.max(0,Number(u.initial_quantity)||0),0);
  const final=rows.reduce((sum,u)=>sum+Math.max(0,Number(u.final_quantity)||0),0);
  const recovered=rows.reduce((sum,u)=>sum+Math.max(0,Number(u.recovered)||0),0);
  return {initial,final,recovered,lost:Math.max(0,initial-final)};
}
function battleAggregateEvents(events,units){
  const names=battleUnitNames(units);
  const groups=new Map();
  for(const e of events||[]){
    const key=[e.type,e.actor_side,e.actor_unit_id,e.target_side,e.target_unit_id].join("|");
    const current=groups.get(key)||{type:e.type,actor_side:e.actor_side,actor:names[e.actor_unit_id]||e.actor_unit_id||"—",target:names[e.target_unit_id]||e.target_unit_id||"",kills:0,hits:0,first:Number(e.sequence)||0};
    current.kills+=Math.max(0,Number(e.kills)||0);
    current.hits+=1;
    groups.set(key,current);
  }
  return [...groups.values()].sort((a,z)=>z.kills-a.kills||a.first-z.first);
}
function battleSideLabel(side){return side==="attacker"?"Atacante":"Defensor";}
function battleReportHtml(d){
  const b=d.battle||{},units=d.units||[],events=d.events||[];
  const names=battleUnitNames(units);
  const chronicle=battleNarrative(b,units,events);
  const unitRows=units.map(u=>{const lost=Math.max(0,Number(u.initial_quantity||0)-Number(u.final_quantity||0));return `<tr><td>${esc(battleSideLabel(u.side))}</td><td>${esc(u.name_es)}</td><td>${n(u.initial_quantity)}</td><td>${n(u.final_quantity)}</td><td>${n(lost)}</td><td>${n(u.recovered)}</td></tr>`;}).join("");
  const totals=["attacker","defender"].map(side=>({side,t:battleSideTotals(units,side)})).filter(x=>x.t.initial>0).map(({side,t})=>`<tr class="battle-total"><td>${esc(battleSideLabel(side))}</td><td><b>Total</b></td><td>${n(t.initial)}</td><td>${n(t.final)}</td><td>${n(t.lost)}</td><td>${n(t.recovered)}</td></tr>`).join("");
  const summary=battleAggregateEvents(events,units).slice(0,12).map(g=>`<div class="battle-event wide"><span>${esc(BATTLE_EVENT_LABELS[g.type]||g.type)}</span><div><b>${esc(g.actor)}</b> (${esc(battleSideLabel(g.actor_side))}) ${g.target?`→ ${esc(g.target)}`:""}</div><span>${g.kills?`${n(g.kills)} bajas`:"sin bajas"} · ${n(g.hits)} ${g.hits===1?"golpe":"golpes"}</span></div>`).join("");
  const sequence=events.map(e=>`<div class="battle-event"><span>#${n(e.sequence)}</span><div><b>${esc(names[e.actor_unit_id]||e.actor_unit_id||e.type)}</b> ${e.target_unit_id?`→ ${esc(names[e.target_unit_id]||e.target_unit_id)}`:""}</div><span>${e.kills?`${n(e.kills)} bajas`:esc(BATTLE_EVENT_LABELS[e.type]||e.type)}</span></div>`).join("");
  const expense=battleWarExpenseRows(b.war_expense);
  const extra=[];
  if(Number(b.land_destroyed)>0)extra.push(`<div class="stat-card"><small>Tierra destruida</small><strong>${n(b.land_destroyed)}</strong></div>`);
  if(Number(b.fortresses_destroyed)>0)extra.push(`<div class="stat-card"><small>Fortalezas destruidas</small><strong>${n(b.fortresses_destroyed)}</strong></div>`);
  if(Number(b.fortresses_captured)>0)extra.push(`<div class="stat-card"><small>Fortalezas capturadas</small><strong>${n(b.fortresses_captured)}</strong></div>`);
  if(expense.length)extra.push(`<div class="stat-card"><small>Gasto de guerra (atacante)</small><strong>${expense.map(r=>`${n(r.value)} ${esc(r.label.toLowerCase())}`).join(" · ")}</strong></div>`);
  if(Number(b.attacker_initial_np)>0||Number(b.defender_initial_np)>0)extra.push(`<div class="stat-card"><small>Poder atacante</small><strong>${n(b.attacker_initial_np)} → ${n(b.attacker_final_np)}</strong></div><div class="stat-card"><small>Poder defensor</small><strong>${n(b.defender_initial_np)} → ${n(b.defender_final_np)}</strong></div>`);
  return `<span class="section-kicker">INFORME COMPLETO</span><h3>${battleModeLabel(b.mode)} · ${b.attacker_victory?"Victoria atacante":"Defensa exitosa"}</h3><div class="battle-chronicle"><div class="battle-chronicle-head"><span>✦</span><div><small>CRÓNICA DEL COMBATE</small><strong>${b.attacker_victory?"El campo cedió ante la ofensiva":"La línea defensiva no se quebró"}</strong></div></div><p>${esc(chronicle.opening)}</p><p>${esc(chronicle.middle)}</p><p>${esc(chronicle.ending)}</p><div class="battle-verdict"><small>CLAVES DEL DESENLACE</small><ul>${chronicle.keys.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div><div class="grid-3"><div class="stat-card"><small>Pérdidas atacante</small><strong>${(Number(b.attacker_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Pérdidas defensor</small><strong>${(Number(b.defender_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Tierra conquistada</small><strong>${n(b.land_gained)}</strong></div>${extra.join("")}</div><h3>Formaciones</h3><div class="table-wrap"><table><thead><tr><th>Bando</th><th>Unidad</th><th>Inicio</th><th>Final</th><th>Bajas</th><th>Recuperadas</th></tr></thead><tbody>${unitRows}${totals}</tbody></table></div><h3>Golpes principales</h3><div>${summary||'<div class="empty">Sin eventos.</div>'}</div><details class="battle-sequence"><summary>Secuencia completa (${n(events.length)} eventos)</summary><div>${sequence||'<div class="empty">Sin eventos.</div>'}</div></details>`;
}
async function openBattleReport(id,silent=false){
  try{
    const d=await rpc("battle_report_detail",{p_battle_id:id});
    $("#modal-content").innerHTML=battleReportHtml(d);
    show($("#modal"));
  }catch(e){if(!silent)toast(humanError(e),"error"); throw e;}
}
