"use strict";

/* Herramientas de planificación inspiradas en The Reincarnation (Guildwar).
   - Alerta de maná en negativo (usa el flujo por turno ya conocido, nunca inventa producción).
   - Coste y mantenimiento por unidad (valores del catálogo, informativos).
   - Plan de reposición: preferencia LOCAL_ONLY; ejecutar el plan lanza reclutamientos reales y validados por el Core.
   - Calculadora de formaciones: indicador DERIVED, sin coste ni efecto sobre el estado. */

const RECRUIT_PLAN_PREFIX="arcanum_recruit_plan_v1_";
const RECRUIT_PLAN_MAX_ENTRIES=8;
const RECRUIT_PLAN_MAX_PERCENT=90;
const RECRUIT_PLAN_MAX_TURNS=50;
const MANA_ALERT_CRITICAL_TURNS=12;
let manaAlertToastShown=false;

function toolsNum(value,decimals=2){
  return Number(value||0).toLocaleString("es-ES",{maximumFractionDigits:decimals});
}

/* ---------- Maná en negativo ---------- */
function manaFlowAlert(mana,perTurn,criticalTurns=MANA_ALERT_CRITICAL_TURNS){
  const flow=Number(perTurn);
  if(!Number.isFinite(flow)||flow>=0)return null;
  const turnsLeft=Math.floor(Math.max(0,Number(mana)||0)/-flow);
  return {perTurn:flow,turnsLeft,critical:turnsLeft<=criticalTurns};
}
function applyManaAlert(){
  const item=document.querySelector("#resource-strip .resource-mana");
  const realm=realmState?.realm;
  if(!item||!realm)return;
  const alert=manaFlowAlert(realm.mana,passiveResourceFlow?.yieldPerTurn?.mana);
  item.classList.toggle("resource-warning",!!alert);
  item.classList.toggle("resource-critical",!!alert?.critical);
  item.querySelector(".resource-alert")?.remove();
  if(!alert){manaAlertToastShown=false;return;}
  const copy=item.querySelector(".resource-copy");
  if(copy){
    const badge=document.createElement("small");
    badge.className="resource-alert";
    badge.textContent=alert.turnsLeft<=0?"⚠ sin maná":`⚠ ${toolsNum(alert.perTurn,0)}/turno · ~${toolsNum(alert.turnsLeft,0)} t`;
    copy.appendChild(badge);
  }
  if(alert.critical&&!manaAlertToastShown){
    manaAlertToastShown=true;
    toast(`Tu maná baja ${toolsNum(-alert.perTurn,0)} por turno y se agotará en ~${toolsNum(alert.turnsLeft,0)} turnos.`,"error",6000);
  }
}

/* ---------- Costes de unidad ---------- */
function unitCostText(u){
  return `${toolsNum(u?.recruit_gold)} oro · ${toolsNum(u?.recruit_mana)} maná · ${toolsNum(u?.recruit_population)} pob`;
}
function unitUpkeepText(u){
  return `${toolsNum(u?.upkeep_gold)} oro · ${toolsNum(u?.upkeep_mana)} maná · ${toolsNum(u?.upkeep_population)} pob`;
}

/* ---------- Calculadora de formaciones (DERIVED) ---------- */
function formationTotals(rows,unitById){
  const t={units:0,flying:0,ranged:0,recruit_gold:0,recruit_mana:0,recruit_population:0,upkeep_gold:0,upkeep_mana:0,upkeep_population:0};
  for(const row of rows||[]){
    const q=Math.max(0,Math.floor(Number(row?.quantity)||0));
    const u=unitById?.[row?.unit_id];
    if(!q||!u)continue;
    t.units+=q;
    if(u.natural_flying)t.flying+=q;
    if(u.natural_ranged)t.ranged+=q;
    for(const key of ["recruit_gold","recruit_mana","recruit_population","upkeep_gold","upkeep_mana","upkeep_population"])t[key]+=q*(Number(u[key])||0);
  }
  return t;
}
function formationTotalsHtml(t){
  const share=count=>t.units?`${toolsNum(count*100/t.units,0)}%`:"0%";
  return `<div class="formation-totals">
    <div><small>UNIDADES</small><strong>${toolsNum(t.units,0)}</strong><span>${share(t.flying)} voladoras · ${share(t.ranged)} a distancia</span></div>
    <div><small>COSTE DE RECLUTAR / INVOCAR</small><strong>${toolsNum(t.recruit_gold,0)} oro</strong><span>${toolsNum(t.recruit_mana,0)} maná · ${toolsNum(t.recruit_population,0)} pob</span></div>
    <div><small>MANTENIMIENTO SEGÚN CATÁLOGO</small><strong>${toolsNum(t.upkeep_gold,0)} oro</strong><span>${toolsNum(t.upkeep_mana,0)} maná · ${toolsNum(t.upkeep_population,0)} pob</span></div>
  </div>`;
}
function readCalculatorRows(){
  return $$("[data-calc-unit]").map(input=>({unit_id:input.dataset.calcUnit,quantity:input.value}));
}
function refreshFormationCalculator(unitById){
  const host=$("#formation-calc-result");
  if(host)host.innerHTML=formationTotalsHtml(formationTotals(readCalculatorRows(),unitById));
}

/* ---------- Plan de reposición (LOCAL_ONLY) ---------- */
function recruitPlanKey(){
  const mage=String(realmState?.realm?.mage_name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_");
  return RECRUIT_PLAN_PREFIX+mage;
}
function sanitizeRecruitPlan(raw,allowedUnits=null){
  if(!Array.isArray(raw))return [];
  const out=[],seen=new Set();
  for(const e of raw){
    const unit_id=String(e?.unit_id||"");
    const mode=e?.mode==="percent"?"percent":"count";
    let value=Math.floor(Number(e?.value)||0);
    if(!unit_id||seen.has(unit_id)||value<1)continue;
    if(allowedUnits&&!allowedUnits.has(unit_id))continue;
    value=mode==="percent"?Math.min(RECRUIT_PLAN_MAX_PERCENT,value):Math.min(10000000,value);
    seen.add(unit_id);out.push({unit_id,mode,value});
    if(out.length>=RECRUIT_PLAN_MAX_ENTRIES)break;
  }
  return out;
}
function loadRecruitPlan(allowedUnits=null){
  try{return sanitizeRecruitPlan(JSON.parse(localStorage.getItem(recruitPlanKey())||"[]"),allowedUnits);}catch{return [];}
}
function saveRecruitPlan(plan){
  try{localStorage.setItem(recruitPlanKey(),JSON.stringify(sanitizeRecruitPlan(plan)));}catch{}
}
function recruitPlanShortfall(plan,army){
  const have={};let total=0;
  for(const a of army||[]){const q=Math.max(0,Math.floor(Number(a?.quantity)||0));have[a.unit_id]=(have[a.unit_id]||0)+q;total+=q;}
  return (plan||[]).map(p=>{
    const current=have[p.unit_id]||0;
    const goal=p.mode==="percent"?Math.ceil(p.value*(total-current)/(100-p.value)):p.value;
    return {...p,current,goal,missing:Math.max(0,goal-current)};
  });
}
function recruitPlanLabel(entry,unitById){
  const name=unitById?.[entry.unit_id]?.name_es||entry.unit_id;
  return entry.mode==="percent"?`${name} · ${entry.value}% del ejército`:`${name} · mantener ${toolsNum(entry.value,0)}`;
}
function recruitPlanRowsHtml(rows,unitById){
  if(!rows.length)return `<div class="empty">Sin plan. Añade una unidad para que ARCANUM te avise cuando las bajas la dejen por debajo del objetivo.</div>`;
  return rows.map(r=>`<div class="recruit-plan-row ${r.missing>0?"short":"ok"}">
    <div><strong>${esc(recruitPlanLabel(r,unitById))}</strong><small>Tienes ${toolsNum(r.current,0)} · objetivo ${toolsNum(r.goal,0)}</small></div>
    <span class="tag">${r.missing>0?`FALTAN ${toolsNum(r.missing,0)}`:"AL DÍA"}</span>
    <button class="small-action" type="button" data-plan-remove="${esc(r.unit_id)}" aria-label="Quitar del plan">✕</button>
  </div>`).join("");
}

async function runRecruitPlan(btn,army,unitById,allowedUnits){
  const maxTurns=Math.max(1,Math.min(RECRUIT_PLAN_MAX_TURNS,Math.floor(Number($("#plan-max-turns")?.value)||1)));
  const rows=recruitPlanShortfall(loadRecruitPlan(allowedUnits),army).filter(r=>r.missing>0);
  if(!rows.length){toast("Tu plan ya está cubierto.","success",2600);return;}
  const needed=rows.map(r=>`${toolsNum(r.missing,0)} ${unitById?.[r.unit_id]?.name_es||r.unit_id}`).join(", ");
  if(!window.confirm(`Reponer el plan reclutará hasta cubrir ${needed} y gastará como máximo ${maxTurns} ${maxTurns===1?"turno":"turnos"}. ¿Quieres continuar?`))return;
  const old=btn.innerHTML;btn.disabled=true;btn.textContent="REPONIENDO…";
  let spent=0,recruited=0,failure=null;
  try{
    for(const r of rows){
      let missing=r.missing;
      while(missing>0&&spent<maxTurns){
        const res=await rpc("recruit_units",{p_unit_id:r.unit_id,p_turns:1});
        spent+=1;
        const got=Math.max(0,Math.floor(Number(res?.recruited)||0));
        if(!got)break;
        recruited+=got;missing-=got;
      }
      if(spent>=maxTurns)break;
    }
  }catch(error){failure=error;}
  try{realmState=await rpc("my_realm_state");renderChrome();await renderView(currentView);}catch{}
  btn.disabled=false;btn.innerHTML=old;
  if(failure)toast(`Reposición interrumpida: ${humanError(failure)}`,"error",6000);
  else toast(`Plan aplicado: ${toolsNum(recruited,0)} unidades reclutadas en ${toolsNum(spent,0)} ${spent===1?"turno":"turnos"}.`,"success");
}

/* ---------- Render en la vista de Ejército ---------- */
function renderRealmTools(army,unitById,compatible){
  const known=new Map();
  for(const u of compatible||[])known.set(u.id,u);
  for(const a of army||[]){const u=unitById[a.unit_id];if(u)known.set(u.id,u);}
  const unitOptions=[...known.values()].map(u=>`<option value="${esc(u.id)}">${esc(u.name_es)}</option>`).join("");
  const recruitOptions=(compatible||[]).map(u=>`<option value="${esc(u.id)}">${esc(u.name_es)}</option>`).join("");
  const rows=recruitPlanShortfall(loadRecruitPlan(new Set((compatible||[]).map(u=>u.id))),army);
  const short=rows.filter(r=>r.missing>0).length;
  const calcRows=[...known.values()].map(u=>`<label class="calc-row"><span>${esc(u.name_es)}</span><input type="number" min="0" max="10000000" step="1" value="0" inputmode="numeric" data-calc-unit="${esc(u.id)}" aria-label="Cantidad de ${esc(u.name_es)}" /></label>`).join("");
  return `<div class="grid-2 realm-tools" style="margin-top:14px">
    <div class="panel" id="recruit-plan-panel">
      <h3>Plan de reposición ${short?`<span class="tag plan-alert">${short} bajo objetivo</span>`:""}</h3>
      <p class="tools-note">Fija cuántas unidades quieres mantener (número fijo o % de tu ejército). El plan se guarda solo en este navegador; al pulsar REPONER se lanzan reclutamientos reales de 1 turno validados por el servidor.</p>
      ${compatible?.length?`<div class="recruit-plan-form">
        <select id="plan-unit" aria-label="Unidad del plan">${recruitOptions}</select>
        <select id="plan-mode" aria-label="Modo"><option value="count">Mantener #</option><option value="percent">Mantener %</option></select>
        <input id="plan-value" type="number" min="1" step="1" value="100" inputmode="numeric" aria-label="Valor objetivo" />
        <button id="plan-add" class="small-action" type="button">AÑADIR</button>
      </div>`:""}
      <div id="recruit-plan-list">${recruitPlanRowsHtml(rows,unitById)}</div>
      <div class="recruit-plan-run">
        <label class="field-caption">Turnos máximos<input id="plan-max-turns" type="number" min="1" max="${RECRUIT_PLAN_MAX_TURNS}" value="10" inputmode="numeric" /></label>
        <button id="plan-run" class="primary-action" type="button" ${short?"":"disabled"}>⚔ REPONER BAJAS</button>
      </div>
    </div>
    <div class="panel" id="formation-calc-panel">
      <h3>Calculadora de formaciones</h3>
      <p class="tools-note">Herramienta gratuita y sin efecto sobre tu reino: prueba una composición y consulta cuánto costaría y cuánto mantenimiento tendría según el catálogo. El coste y el ingreso reales los confirma siempre el servidor.</p>
      <div class="calc-grid">${calcRows||`<div class="empty">Sin unidades disponibles.</div>`}</div>
      <div class="calc-actions"><button id="calc-load" class="small-action" type="button">CARGAR MI EJÉRCITO</button><button id="calc-clear" class="small-action" type="button">LIMPIAR</button></div>
      <div id="formation-calc-result">${formationTotalsHtml(formationTotals([],unitById))}</div>
    </div>
  </div>`;
}
function wireRealmTools(army,unitById,compatible){
  const allowed=new Set((compatible||[]).map(u=>u.id));
  const rerenderPlan=()=>{
    const rows=recruitPlanShortfall(loadRecruitPlan(allowed),army);
    const list=$("#recruit-plan-list");if(list)list.innerHTML=recruitPlanRowsHtml(rows,unitById);
    const run=$("#plan-run");if(run)run.disabled=!rows.some(r=>r.missing>0);
    $$("[data-plan-remove]").forEach(b=>b.addEventListener("click",()=>{saveRecruitPlan(loadRecruitPlan(allowed).filter(p=>p.unit_id!==b.dataset.planRemove));rerenderPlan();}));
  };
  $("#plan-add")?.addEventListener("click",()=>{
    const unit_id=$("#plan-unit")?.value,mode=$("#plan-mode")?.value,value=Number($("#plan-value")?.value);
    if(!unit_id||!(value>=1)){toast("Indica un objetivo válido.","error");return;}
    const plan=loadRecruitPlan(allowed).filter(p=>p.unit_id!==unit_id);
    if(plan.length>=RECRUIT_PLAN_MAX_ENTRIES){toast(`El plan admite hasta ${RECRUIT_PLAN_MAX_ENTRIES} unidades.`,"error");return;}
    plan.push({unit_id,mode,value});saveRecruitPlan(plan);rerenderPlan();
  });
  $("#plan-run")?.addEventListener("click",()=>runRecruitPlan($("#plan-run"),army,unitById,allowed));
  rerenderPlan();
  $$("[data-calc-unit]").forEach(input=>input.addEventListener("input",()=>refreshFormationCalculator(unitById)));
  $("#calc-load")?.addEventListener("click",()=>{
    const have={};for(const a of army||[])have[a.unit_id]=Math.max(0,Math.floor(Number(a.quantity)||0));
    $$("[data-calc-unit]").forEach(input=>{input.value=have[input.dataset.calcUnit]||0;});
    refreshFormationCalculator(unitById);
  });
  $("#calc-clear")?.addEventListener("click",()=>{$$("[data-calc-unit]").forEach(input=>{input.value=0;});refreshFormationCalculator(unitById);});
}
function recruitUnitInfoHtml(u){
  if(!u)return "";
  return `<small class="recruit-unit-info"><b>Coste por unidad:</b> ${esc(unitCostText(u))}<br><b>Mantenimiento (catálogo):</b> ${esc(unitUpkeepText(u))}</small>`;
}
