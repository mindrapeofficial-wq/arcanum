"use strict";

function buildTurnLabel(key){
  if(key==="barriers") return "1 turno por unidad";
  return "Variable · Talleres reducen";
}
function renderBuild(){
  const b=realmState.buildings,r=realmState.realm;
  const rows=Object.entries(buildMeta).map(([key,[name,desc,cost]])=>`<div class="building-row"><div><strong>${esc(name)}</strong><small>${esc(desc)}</small></div><div><small>ACTUAL</small><strong>${n(b[key])}</strong></div><div><small>COSTE ${esc(cost)}</small><small class="build-turn-cost">TURNOS · ${esc(buildTurnLabel(key))}</small><input data-building="${key}" type="number" min="0" max="9999" value="0" inputmode="numeric"></div></div>`).join("");
  $("#view-host").innerHTML=`${viewHeader("ARQUITECTURA","Construcción",`Transforma tus ${n(r.wilderness)} acres salvajes en infraestructura.`)}<div class="panel"><div class="building-list">${rows}</div><div class="build-turn-note"><strong>Gasto de turnos</strong><span>Las Barreras consumen 1 turno por unidad. En el resto de edificios el gasto depende del tamaño total del lote y de tus Talleres, que aceleran la construcción. Al terminar se mostrará el gasto real de turnos.</span></div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button id="build-button" class="primary-action">✦ CONSTRUIR LOTE</button></div></div>`;
  $("#build-button").addEventListener("click",()=>doBuild($("#build-button")));
}
async function doBuild(btn){
  const plan={}; $$('[data-building]').forEach(i=>{const q=Math.max(0,Math.floor(Number(i.value)||0)); if(q)plan[i.dataset.building]=q;});
  if(!Object.keys(plan).length){toast("Indica al menos un edificio.","error");return;}
  if(plan.barriers && Object.keys(plan).some(k=>k!=="barriers")){toast("Las Barreras deben construirse en una orden separada.","error");return;}
  await actionCall(btn,()=>rpc("build",{p_plan:plan}),null,res=>`Construcción completada. ${n(res.turns_spent)} turnos consumidos.`);
}
