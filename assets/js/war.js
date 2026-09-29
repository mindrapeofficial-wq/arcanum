"use strict";

async function renderWar(){
  const targets=await rpc("attack_targets",{p_limit:100});
  const rows=targets.length?targets.map(t=>`<div class="target-row"><div><strong><span class="school-dot ${esc(t.school_code)}"></span>${esc(t.mage_name)}</strong><small>${esc(catalogs.schools.find(s=>s.code===t.school_code)?.name_es||t.school_code)}</small></div><div><small>TIERRAS</small><strong>${n(t.land)}</strong></div><div><small>PODER NETO</small><strong>${n(t.net_power)}</strong></div><div class="action-buttons">${t.can_attack?`<button class="small-action attack-btn" data-target="${esc(t.mage_name)}" data-mode="REGULAR">ATACAR</button><button class="small-action attack-btn" data-target="${esc(t.mage_name)}" data-mode="SIEGE">ASEDIO</button>`:`<span class="tag">NO ATACABLE</span>`}</div></div>`).join(""):`<div class="empty">Aún no hay otros Archimagos en esta temporada.</div>`;
  $("#view-host").innerHTML=`${viewHeader("FRONTERA","Guerra","Elige un Archimago rival. Cada ataque consume 2 turnos en el ruleset actual.")}<div class="panel"><div class="target-list">${rows}</div></div>`;
  $$(".attack-btn").forEach(b=>b.addEventListener("click",()=>confirmAttack(b.dataset.target,b.dataset.mode,b)));
}
async function confirmAttack(target,mode,btn){
  if(!confirm(`${mode==="SIEGE"?"Asediar":"Atacar"} a ${target}? Las bajas y el gasto de guerra serán permanentes.`))return;
  await actionCall(btn,()=>rpc("attack_mage",{p_target_mage_name:target,p_mode:mode}),null,res=>res.attacker_victory?`Victoria. Has conquistado ${n(res.land_gained)} acres.`:`El ataque no ha logrado la victoria. Pérdidas: ${(Number(res.attacker_loss_bp)/100).toFixed(2)}%.`);
  await renderWar();
}

async function renderRanking(){
  const rows=await rpc("leaderboard",{p_limit:100}); const mine=realmState.realm.mage_name.toLowerCase();
  $("#view-host").innerHTML=`${viewHeader("MUNDO","Clasificación","Los Archimagos de la temporada ordenados por Poder Neto.")}<div class="table-wrap"><table><thead><tr><th>#</th><th>Archimago</th><th>Escuela</th><th>Tierras</th><th>Poder Neto</th><th>Estado</th></tr></thead><tbody>${rows.map(x=>`<tr class="${String(x.mage_name).toLowerCase()===mine?"rank-me":""}"><td>${n(x.rank)}</td><td><strong>${esc(x.mage_name)}</strong></td><td><span class="school-dot ${esc(x.school_code)}"></span>${esc(catalogs.schools.find(s=>s.code===x.school_code)?.name_es||x.school_code)}</td><td>${n(x.land)}</td><td>${n(x.net_power)}</td><td>${esc(x.status)}</td></tr>`).join("")}</tbody></table></div>`;
}

async function renderBattles(){
  const reports=await rpc("my_battle_reports",{p_limit:50});
  const rows=reports.length?reports.map(r=>`<div class="battle-row"><div><span class="tag ${r.result==="VICTORY"?"win":"loss"}">${r.result==="VICTORY"?"VICTORIA":"DERROTA"}</span></div><div><strong>${esc(r.opponent_mage_name)}</strong><small>${new Date(r.created_at).toLocaleString("es-ES")} · ${r.mode==="SIEGE"?"Asedio":"Ataque"}</small></div><div><small>TU PÉRDIDA</small><strong>${(Number(r.my_loss_bp)/100).toFixed(2)}%</strong></div><div><small>TIERRA</small><strong>${Number(r.land_change)>=0?"+":""}${n(r.land_change)}</strong></div><button class="small-action report-btn" data-battle="${esc(r.battle_id)}">INFORME</button></div>`).join(""):`<div class="empty">Todavía no has participado en ninguna batalla.</div>`;
  $("#view-host").innerHTML=`${viewHeader("CRÓNICAS","Informes de batalla","Cada choque queda registrado golpe a golpe.")}<div class="panel"><div class="battle-list">${rows}</div></div>`;
  $$(".report-btn").forEach(b=>b.addEventListener("click",()=>openBattleReport(b.dataset.battle)));
}
async function openBattleReport(id){
  try{
    const d=await rpc("battle_report_detail",{p_battle_id:id}); const b=d.battle;
    const unitRows=(d.units||[]).map(u=>`<tr><td>${esc(u.side==="attacker"?"Atacante":"Defensor")}</td><td>${esc(u.name_es)}</td><td>${n(u.initial_quantity)}</td><td>${n(u.final_quantity)}</td><td>${n(u.recovered)}</td></tr>`).join("");
    const events=(d.events||[]).map(e=>`<div class="battle-event"><span>#${n(e.sequence)}</span><div><b>${esc(e.actor_unit_id||e.type)}</b> ${e.target_unit_id?`→ ${esc(e.target_unit_id)}`:""}</div><span>${e.kills?`${n(e.kills)} bajas`:esc(e.type)}</span></div>`).join("");
    $("#modal-content").innerHTML=`<span class="section-kicker">INFORME COMPLETO</span><h3>${b.mode==="SIEGE"?"Asedio":"Ataque regular"} · ${b.attacker_victory?"Victoria atacante":"Defensa exitosa"}</h3><div class="grid-3"><div class="stat-card"><small>Pérdidas atacante</small><strong>${(Number(b.attacker_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Pérdidas defensor</small><strong>${(Number(b.defender_loss_bp)/100).toFixed(2)}%</strong></div><div class="stat-card"><small>Tierra conquistada</small><strong>${n(b.land_gained)}</strong></div></div><h3>Formaciones</h3><div class="table-wrap"><table><thead><tr><th>Bando</th><th>Unidad</th><th>Inicio</th><th>Final</th><th>Recuperadas</th></tr></thead><tbody>${unitRows}</tbody></table></div><h3>Secuencia</h3><div>${events||'<div class="empty">Sin eventos.</div>'}</div>`;
    show($("#modal"));
  }catch(e){toast(humanError(e),"error");}
}
