"use strict";

async function renderWar(){
  const [targets,npcs]=await Promise.all([rpc("attack_targets",{p_limit:100}),rpc("npc_directory")]);
  const npcMap=new Map((npcs||[]).map(x=>[String(x.mage_name).toLowerCase(),x]));
  const rows=targets.length?targets.map(t=>{const npc=npcMap.get(String(t.mage_name).toLowerCase());return `<div class="target-row"><div><strong><span class="school-dot ${esc(t.school_code)}"></span><button class="player-link" data-profile="${esc(t.mage_name)}">${esc(t.mage_name)}</button> ${npc?'<span class="tag npc-tag">NPC</span>':''}</strong><small>${esc(catalogs.schools.find(s=>s.code===t.school_code)?.name_es||t.school_code)}${npc?` · ${esc(npc.archetype)}`:''}</small></div><div><small>TIERRAS</small><strong>${n(t.land)}</strong></div><div><small>ASCENDENCIA</small><strong>${n(t.net_power)}</strong></div><div class="action-buttons">${t.can_attack?`<button class="small-action attack-btn" data-target="${esc(t.mage_name)}" data-mode="REGULAR">ATACAR</button><button class="small-action attack-btn" data-target="${esc(t.mage_name)}" data-mode="SIEGE">ASEDIO</button>`:`<span class="tag">NO ATACABLE</span>`}</div></div>`}).join(""):`<div class="empty">Aún no hay otros Arcontes en esta temporada.</div>`;
  $("#view-host").innerHTML=`<div class="view-header"><div><p>Cada ataque consume 2 turnos.</p></div></div><div class="panel"><div class="target-list">${rows}</div></div>`;
  $$(".attack-btn").forEach(b=>b.addEventListener("click",()=>confirmAttack(b.dataset.target,b.dataset.mode,b)));
}
async function confirmAttack(target,mode,btn){
  if(!confirm(`${mode==="SIEGE"?"Asediar":"Atacar"} a ${target}? Las bajas y el gasto de guerra serán permanentes.`))return;
  try{
    const res=await actionCall(btn,()=>rpc("attack_mage",{p_target_mage_name:target,p_mode:mode}),null,res=>res.attacker_victory?`Victoria. Has conquistado ${n(res.land_gained)} acres.`:`El ataque no ha logrado la victoria. Pérdidas: ${(Number(res.attacker_loss_bp)/100).toFixed(2)}%.`);
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
  $("#modal-content").innerHTML=`<span class="section-kicker">CRÓNICA INMEDIATA</span><h3>${mode==="SIEGE"?"Asedio":"Ataque regular"} contra ${esc(target)} · ${b.attacker_victory?"Victoria":"Derrota"}</h3><div class="battle-chronicle"><div class="battle-chronicle-head"><span>✦</span><div><small>RELATO DEL CAMPO</small><strong>${b.attacker_victory?"La ofensiva quebró la resistencia":"La defensa sostuvo la línea"}</strong></div></div><p>${esc(chronicle.opening)}</p><p>${esc(chronicle.middle)}</p><p>${esc(chronicle.ending)}</p><div class="battle-verdict"><small>CLAVES DEL DESENLACE</small><ul>${chronicle.keys.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div><div class="grid-3"><div class="stat-card"><small>Pérdidas atacante</small><strong>${(Number(b.attacker_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Pérdidas defensor</small><strong>${(Number(b.defender_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Tierra conquistada</small><strong>${n(b.land_gained)}</strong></div></div><p class="battle-detail-note">El informe técnico completo se añadirá aquí si el registro detallado de la batalla está disponible.</p>`;
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
  if(won&&land>0) ending=`Cuando el campo quedó en silencio, la iniciativa seguía en manos del atacante. La victoria permitió arrancar ${n(land)} acres al dominio rival y convertir el resultado militar en una ganancia territorial real.`;
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
  const rows=reports.length?reports.map(r=>`<div class="battle-row"><div><span class="tag ${r.result==="VICTORY"?"win":"loss"}">${r.result==="VICTORY"?"VICTORIA":"DERROTA"}</span></div><div><strong><button class="player-link" data-profile="${esc(r.opponent_mage_name)}">${esc(r.opponent_mage_name)}</button></strong><small>${new Date(r.created_at).toLocaleString("es-ES")} · ${r.mode==="SIEGE"?"Asedio":"Ataque"}</small></div><div><small>TU PÉRDIDA</small><strong>${(Number(r.my_loss_bp)/100).toFixed(2)}%</strong></div><div><small>TIERRA</small><strong>${Number(r.land_change)>=0?"+":""}${n(r.land_change)}</strong></div><button class="small-action report-btn" data-battle="${esc(r.battle_id)}">INFORME</button></div>`).join(""):`<div class="empty">Todavía no has participado en ninguna batalla.</div>`;
  $("#view-host").innerHTML=`<div class="panel"><div class="battle-list">${rows}</div></div>`;
  $$(".report-btn").forEach(b=>b.addEventListener("click",()=>openBattleReport(b.dataset.battle)));
}
async function openBattleReport(id,silent=false){
  try{
    const d=await rpc("battle_report_detail",{p_battle_id:id}); const b=d.battle;
    const unitRows=(d.units||[]).map(u=>`<tr><td>${esc(u.side==="attacker"?"Atacante":"Defensor")}</td><td>${esc(u.name_es)}</td><td>${n(u.initial_quantity)}</td><td>${n(u.final_quantity)}</td><td>${n(u.recovered)}</td></tr>`).join("");
    const events=(d.events||[]).map(e=>`<div class="battle-event"><span>#${n(e.sequence)}</span><div><b>${esc(e.actor_unit_id||e.type)}</b> ${e.target_unit_id?`→ ${esc(e.target_unit_id)}`:""}</div><span>${e.kills?`${n(e.kills)} bajas`:esc(e.type)}</span></div>`).join("");
    const chronicle=battleNarrative(b,d.units||[],d.events||[]);
    $("#modal-content").innerHTML=`<span class="section-kicker">INFORME COMPLETO</span><h3>${b.mode==="SIEGE"?"Asedio":"Ataque regular"} · ${b.attacker_victory?"Victoria atacante":"Defensa exitosa"}</h3><div class="battle-chronicle"><div class="battle-chronicle-head"><span>✦</span><div><small>CRÓNICA DEL COMBATE</small><strong>${b.attacker_victory?"El campo cedió ante la ofensiva":"La línea defensiva no se quebró"}</strong></div></div><p>${esc(chronicle.opening)}</p><p>${esc(chronicle.middle)}</p><p>${esc(chronicle.ending)}</p><div class="battle-verdict"><small>CLAVES DEL DESENLACE</small><ul>${chronicle.keys.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div><div class="grid-3"><div class="stat-card"><small>Pérdidas atacante</small><strong>${(Number(b.attacker_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Pérdidas defensor</small><strong>${(Number(b.defender_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Tierra conquistada</small><strong>${n(b.land_gained)}</strong></div></div><h3>Formaciones</h3><div class="table-wrap"><table><thead><tr><th>Bando</th><th>Unidad</th><th>Inicio</th><th>Final</th><th>Recuperadas</th></tr></thead><tbody>${unitRows}</tbody></table></div><h3>Secuencia</h3><div>${events||'<div class="empty">Sin eventos.</div>'}</div>`;
    show($("#modal"));
  }catch(e){if(!silent)toast(humanError(e),"error"); throw e;}
}