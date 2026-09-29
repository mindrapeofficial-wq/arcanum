"use strict";

function renderEconomy(){
  const r=realmState.realm,c=realmState.capacities;
  $("#view-host").innerHTML=`${viewHeader("TESORERÍA","Economía","Convierte turnos en crecimiento, oro y maná.")}
  <div class="grid-3" style="margin-bottom:14px"><div class="stat-card"><small>Oro</small><strong>${n(r.gold)}</strong></div><div class="stat-card"><small>Maná</small><strong>${n(r.mana)} / ${n(c.mana)}</strong></div><div class="stat-card"><small>Población</small><strong>${n(r.population)} / ${n(Math.min(c.food,c.residential))}</strong></div></div>
  <div class="panel"><h3>Procesar turnos económicos</h3><div class="action-panel"><label>Turnos<input id="econ-turns" type="number" min="1" max="50" value="1"></label><div class="action-buttons"><button class="small-action econ-action" data-action="NONE">NORMAL</button><button class="small-action econ-action" data-action="TAX">RECAUDAR IMPUESTOS</button><button class="small-action econ-action" data-action="MP_CHARGE">CARGAR MANÁ</button></div></div></div>
  <div class="panel" style="margin-top:14px"><h3>Exploración</h3><p class="intro" style="margin:0 0 12px;text-align:left">Busca nuevas tierras. El rendimiento decrece conforme tu reino se acerca a 3.500 acres.</p><div class="action-panel"><label>Turnos<input id="explore-turns" type="number" min="1" max="50" value="1"></label><button id="explore-button" class="primary-action">✦ EXPLORAR</button></div></div>`;
  $$(".econ-action").forEach(btn=>btn.addEventListener("click",()=>doEconomy(btn.dataset.action,btn)));
  $("#explore-button").addEventListener("click",()=>doExplore($("#explore-button")));
}
async function doEconomy(action,btn){ const turns=Math.max(1,Math.min(50,Number($("#econ-turns").value)||1)); await actionCall(btn,()=>rpc("run_economy",{p_action:action,p_turns:turns}),`Se han procesado ${turns} turno${turns===1?"":"s"}.`); }
async function doExplore(btn,inputId="explore-turns"){ const turns=Math.max(1,Math.min(50,Number($("#"+inputId).value)||1)); await actionCall(btn,()=>rpc("explore",{p_turns:turns}),null,(res)=>`Exploración completada: +${n(res.land_gained)} acres.`); }
