"use strict";

function realmPercent(value,max){
  const a=Number(value||0), b=Number(max||0);
  if(b<=0)return 0;
  return Math.max(0,Math.min(100,Math.round(a/b*100)));
}
function realmTone(pct,{dangerBelow=20,warnBelow=45,dangerAbove=null,warnAbove=null}={}){
  if(dangerAbove!==null && pct>=dangerAbove)return "danger";
  if(warnAbove!==null && pct>=warnAbove)return "warn";
  if(pct<=dangerBelow)return "danger";
  if(pct<=warnBelow)return "warn";
  return "good";
}
function realmBar(label,value,max,options={}){
  const pct=realmPercent(value,max), tone=realmTone(pct,options);
  return `<div class="realm-meter">
    <div class="realm-meter-head"><span>${esc(label)}</span><strong>${n(value)} / ${n(max)}</strong></div>
    <div class="realm-meter-track"><span class="${tone}" style="width:${pct}%"></span></div>
    <small>${pct}%</small>
  </div>`;
}
function realmAlerts(){
  const r=realmState.realm,b=realmState.buildings,c=realmState.capacities;
  const alerts=[];
  const popCap=Math.min(Number(c.food||0),Number(c.residential||0));
  const manaPct=realmPercent(r.mana,c.mana), popPct=realmPercent(r.population,popCap), turnsPct=realmPercent(r.turns,r.max_turns);
  if(Number(r.pending_territory_damage||0)>0)alerts.push({tone:"danger",title:"Daño territorial pendiente",text:`${n(r.pending_territory_damage)} acres requieren resolución. Algunas acciones pueden estar bloqueadas.`});
  if(Number(b.fortresses||0)<=0)alerts.push({tone:"danger",title:"Sin fortalezas",text:"Tu Arconte necesita al menos una Fortaleza para asegurar la supervivencia del dominio."});
  if(turnsPct>=90)alerts.push({tone:"warn",title:"Reserva de turnos casi llena",text:"Gasta turnos pronto para no desperdiciar regeneración."});
  if(manaPct>=90)alerts.push({tone:"warn",title:"Maná cerca del límite",text:"Convierte parte del maná acumulado en conocimiento arcano, invocaciones o magia útil."});
  if(popPct>=92)alerts.push({tone:"warn",title:"Población cerca del límite",text:"Amplía Granjas o Pueblos para evitar estancamiento demográfico."});
  if(Number(r.wilderness||0)>=100)alerts.push({tone:"info",title:"Terreno sin desarrollar",text:`Tienes ${n(r.wilderness)} acres salvajes listos para construir.`});
  if(Number(b.guilds||0)<5)alerts.push({tone:"info",title:"Conocimiento Arcano débil",text:"Tus Gremios aún son escasos. Desarrollarlos acelerará el acceso a nuevos hechizos."});
  if(!alerts.length)alerts.push({tone:"good",title:"Dominio estable",text:"No hay alertas críticas. Es un buen momento para crecer según tu estrategia."});
  return alerts.slice(0,4);
}
function realmProgressLabel(land){
  const x=Number(land||0);
  if(x<500)return {name:"Dominio naciente",next:500,level:0};
  if(x<1000)return {name:"Dominio en expansión",next:1000,level:1};
  if(x<2000)return {name:"Potencia regional",next:2000,level:2};
  if(x<3500)return {name:"Gran dominio",next:3500,level:3};
  return {name:"Imperio arcano",next:3500,level:4};
}

let realmDomainRecord=null;
let realmDomainLoad=null;

async function loadRealmDomain(force=false){
  if(realmDomainRecord&&!force)return realmDomainRecord;
  if(realmDomainLoad&&!force)return realmDomainLoad;
  realmDomainLoad=(async()=>{
    const data=await domainApi();
    realmDomainRecord=data?.domain||null;
    return realmDomainRecord;
  })();
  try{return await realmDomainLoad;}finally{realmDomainLoad=null;}
}
function paintRealmDomainIdentity(){
  const title=$("#realm-domain-name");
  const character=$("#realm-character-name");
  if(title)title.textContent=realmDomainRecord?.domain_name||realmState?.realm?.mage_name||"Dominio";
  if(character)character.textContent="ARCHIMAGO · "+(realmState?.realm?.mage_name||"");
}
async function editRealmDomainName(){
  const current=realmDomainRecord?.domain_name||realmState?.realm?.mage_name||"";
  const next=prompt("Nuevo nombre del Dominio",current);
  if(next===null)return;
  const clean=next.normalize("NFKC").replace(/\s+/g," ").trim();
  if(clean===current)return;
  try{
    const data=await domainApi({method:"POST",body:{domain_name:clean}});
    realmDomainRecord=data?.domain||realmDomainRecord;
    paintRealmDomainIdentity();
    toast("El Dominio ahora se llama "+realmDomainRecord.domain_name+".","success");
  }catch(error){toast(humanError(error),"error");}
}

function renderRealm(){
  const r=realmState.realm,b=realmState.buildings,c=realmState.capacities;
  const school=catalogs.schools.find(s=>s.code===r.school_code);
  const popCap=Math.min(Number(c.food||0),Number(c.residential||0));
  const built=Math.max(0,Number(r.land||0)-Number(r.wilderness||0));
  const landPct=realmPercent(built,r.land);
  const turnPct=realmPercent(r.turns,r.max_turns);
  const progression=realmProgressLabel(r.land);
  const progressionPct=progression.level>=4?100:realmPercent(r.land,progression.next);
  const alerts=realmAlerts();
  const domainName=realmDomainRecord?.domain_name||r.mage_name;
  const researchRate=Math.floor(Math.sqrt(Math.max(0,Number(b.guilds)||0))*3.5);
  const totalBuilt=Object.values(b||{}).reduce((sum,value)=>sum+Math.max(0,Number(value)||0),0);
  const buildingKeys=["farms","towns","nodes","workshops","guilds","barracks","fortresses","barriers"];
  const buildingNames={farms:"Granjas",towns:"Pueblos",nodes:"Nodos",workshops:"Talleres",guilds:"Gremios",barracks:"Cuarteles",fortresses:"Fortalezas",barriers:"Barreras"};
  const buildingCards=buildingKeys.map(key=>{
    const meta=buildMeta[key]||[buildingNames[key]||key,"",0];
    return `<article class="building-card domain-building-card">
      <div class="domain-building-copy"><small>${esc(buildingNames[key]||meta[0])}</small><strong>${n(b[key]||0)}</strong><span>${esc(meta[1]||"")}</span></div>
      <label class="domain-building-order"><span>LEVANTAR</span><input data-building="${esc(key)}" type="number" min="0" max="9999" step="1" value="0" inputmode="numeric" aria-label="Construir ${esc(buildingNames[key]||meta[0])}"></label>
    </article>`;
  }).join("");

  $("#view-host").innerHTML=`<div class="realm-dashboard domain-command-center">
    <section class="realm-banner realm-banner-2 domain-focus-banner">
      <img class="realm-kingdom-image" src="assets/art/kingdom-level-00.svg?v=0.2.9" alt="" aria-hidden="true" />
      <div class="realm-banner-shade" aria-hidden="true"></div>
      <div class="realm-banner-content">
        <span class="section-kicker">${esc(school?.name_es||r.school_code)} · DOMINIO</span>
        <div class="domain-title-row">
          <h2 id="realm-domain-name">${esc(domainName)}</h2>
          <button id="realm-domain-edit" class="small-action" type="button" title="Editar nombre del Dominio" aria-label="Editar nombre del Dominio">✎ EDITAR</button>
        </div>
        <div id="realm-character-name" class="domain-ruler-name">ARCONTE · ${esc(r.mage_name)}</div>
        <p>${esc(progression.name)} · ${n(r.land)} acres · Nivel Mágico ${n(r.spell_level)} · ${n(realmState.known_spells.length)} hechizos conocidos</p>
        <div class="domain-jump-nav" aria-label="Áreas del Dominio">
          <button class="small-action" type="button" data-domain-jump="domain-governance">GOBIERNO</button>
          <button class="small-action" type="button" data-domain-jump="domain-construction">CONSTRUCCIÓN</button>
          <button class="small-action" type="button" data-domain-jump="domain-expansion">EXPANSIÓN</button>
        </div>
      </div>
      <small class="realm-art-label">CENTRO DE MANDO · REINO NIVEL ${n(progression.level||1)}</small>
    </section>
  </div>

  <section class="domain-ledger" aria-label="Estado del Dominio">
    <article class="domain-ledger-card primary"><small>TURNOS</small><strong>${n(r.turns)} / ${n(r.max_turns)}</strong><div class="mini-track"><span style="width:${turnPct}%"></span></div><em>Presupuesto de acciones</em></article>
    <article class="domain-ledger-card"><small>ORO</small><strong>${n(r.gold)}</strong><em>Tesoro disponible</em></article>
    <article class="domain-ledger-card"><small>MANÁ</small><strong>${n(r.mana)} / ${n(c.mana)}</strong><em>Reserva arcana</em></article>
    <article class="domain-ledger-card"><small>POBLACIÓN</small><strong>${n(r.population)} / ${n(popCap)}</strong><em>Sustento y vivienda</em></article>
    <article class="domain-ledger-card"><small>TIERRAS</small><strong>${n(r.land)}</strong><em>${n(r.wilderness)} salvajes · ${landPct}% desarrollado</em></article>
    <article class="domain-ledger-card"><small>ASCENDENCIA</small><strong>${n(r.net_power)}</strong><em>Fuerza global del reino</em></article>
  </section>

  <section class="panel domain-governance" id="domain-governance">
    <div class="panel-title-row domain-section-head">
      <div><span class="section-kicker">GOBIERNO DEL DOMINIO</span><h3>Ordena cómo emplear los turnos</h3><p>Las órdenes económicas se resuelven en servidor. Elige cuántos turnos gastar y qué prioridad debe seguir el reino.</p></div>
      <label class="domain-turn-picker">TURNOS<input id="econ-turns" type="number" min="1" max="50" value="1" inputmode="numeric"></label>
    </div>
    <div class="domain-order-grid">
      <button class="domain-order-card" type="button" data-domain-econ="NONE"><span>◈</span><div><strong>Administrar reino</strong><small>Desarrollo equilibrado sin forzar una prioridad extraordinaria.</small></div><b>NORMAL</b></button>
      <button class="domain-order-card" type="button" data-domain-econ="TAX"><span>¤</span><div><strong>Recaudar impuestos</strong><small>Concentra la actividad del dominio en aumentar el tesoro de Oro.</small></div><b>ORO</b></button>
      <button class="domain-order-card" type="button" data-domain-econ="MP_CHARGE"><span>✦</span><div><strong>Canalizar maná</strong><small>Concentra la actividad del dominio en recuperar la reserva arcana.</small></div><b>MANÁ</b></button>
    </div>
    <div class="domain-rule-strip">
      <span><small>INVESTIGACIÓN</small><strong>${n(researchRate)} RP/t</strong><em>con ${n(b.guilds)} Gremios</em></span>
      <span><small>EDIFICIOS</small><strong>${n(totalBuilt)}</strong><em>estructuras levantadas</em></span>
      <span><small>TIERRA LIBRE</small><strong>${n(r.wilderness)}</strong><em>acres para construir</em></span>
      <span><small>FORTALEZAS</small><strong>${n(b.fortresses)}</strong><em>${Number(b.fortresses||0)>0?"defensa activa":"prioridad crítica"}</em></span>
    </div>
  </section>

  <section class="panel domain-construction" id="domain-construction">
    <div class="panel-title-row domain-section-head">
      <div><span class="section-kicker">CONSTRUCCIÓN</span><h3>Levanta la infraestructura del reino</h3><p>Convierte tierra salvaje en capacidad económica, investigación y defensa. Los Talleres reducen el coste efectivo de futuras obras.</p></div>
      <div class="domain-construction-metric"><small>TIERRA SALVAJE</small><strong>${n(r.wilderness)}</strong></div>
    </div>
    <div class="domain-building-grid">${buildingCards}</div>
    <div id="build-plan-warning" class="notice error hidden construction-warning">Las Barreras deben construirse en una orden separada.</div>
    <div class="domain-build-actionbar">
      <div id="build-plan-summary" class="build-plan-summary"><span>LOTE PREPARADO</span><strong>Sin selección</strong><small>Indica cuántos edificios quieres levantar.</small></div>
      <button id="build-button" class="primary-action build-submit" disabled>✦ CONSTRUIR LOTE</button>
    </div>
  </section>

  <div class="realm-lower-grid domain-status-grid">
    <section class="panel realm-capacity-panel">
      <div class="panel-title-row"><div><span class="section-kicker">CAPACIDAD</span><h3>Límites del reino</h3></div><span class="muted">Estado actual</span></div>
      ${realmBar("Población",r.population,popCap,{dangerBelow:15,warnBelow:30,dangerAbove:98,warnAbove:90})}
      ${realmBar("Maná",r.mana,c.mana,{dangerBelow:10,warnBelow:25,dangerAbove:98,warnAbove:90})}
      ${realmBar("Terreno desarrollado",built,r.land,{dangerBelow:20,warnBelow:45})}
      <div class="realm-cap-grid">
        <div><small>Residencial</small><strong>${n(c.residential)}</strong></div>
        <div><small>Alimentos</small><strong>${n(c.food)}</strong></div>
        <div><small>Cap. maná</small><strong>${n(c.mana)}</strong></div>
      </div>
    </section>
    <section class="panel realm-alert-panel">
      <div class="panel-title-row"><div><span class="section-kicker">VIGILANCIA</span><h3>Problemas que requieren atención</h3></div><span class="alert-count">${alerts.length}</span></div>
      <div class="realm-alert-list">${alerts.map(a=>`<article class="realm-alert ${a.tone}"><span></span><div><strong>${esc(a.title)}</strong><p>${esc(a.text)}</p></div></article>`).join("")}</div>
    </section>
  </div>

  <section class="panel realm-growth-panel domain-expansion" id="domain-expansion">
    <div class="panel-title-row domain-section-head">
      <div><span class="section-kicker">EXPANSIÓN TERRITORIAL</span><h3>Explora más allá de tus fronteras</h3><p>Explorar gasta turnos y añade tierra salvaje. Después tendrás que construir sobre ella para que produzca.</p></div>
      <strong class="growth-stage">${esc(progression.name)}</strong>
    </div>
    <div class="growth-track"><span style="width:${progressionPct}%"></span></div>
    <div class="growth-meta"><span>${n(r.land)} acres actuales</span><span>${progression.level>=4?"Máximo de exploración alcanzado":`Siguiente hito: ${n(progression.next)} acres`}</span></div>
    <div class="action-panel realm-explore-panel domain-explore-action">
      <label>TURNOS<input id="realm-explore-turns" type="number" min="1" max="50" value="1" inputmode="numeric"></label>
      <button id="realm-explore-button" class="primary-action">✦ EXPLORAR NUEVAS TIERRAS</button>
    </div>
  </section>`;

  $$("[data-domain-jump]").forEach(btn=>btn.addEventListener("click",()=>{
    document.getElementById(btn.dataset.domainJump)?.scrollIntoView({behavior:"smooth",block:"start"});
  }));
  $$("[data-domain-econ]").forEach(btn=>btn.addEventListener("click",()=>{
    if(typeof doEconomy==="function")doEconomy(btn.dataset.domainEcon,btn);
  }));
  $("#realm-explore-button")?.addEventListener("click",()=>doExplore($("#realm-explore-button"),"realm-explore-turns"));
  $("#realm-domain-edit")?.addEventListener("click",editRealmDomainName);
  $$("[data-building]").forEach(input=>input.addEventListener("input",()=>{if(typeof refreshBuildPlan==="function")refreshBuildPlan();}));
  $("#build-button")?.addEventListener("click",()=>{if(typeof doBuild==="function")doBuild($("#build-button"));});
  if(typeof refreshBuildPlan==="function")refreshBuildPlan();

  loadRealmDomain().then(()=>{
    if(currentView==="realm")paintRealmDomainIdentity();
  }).catch(()=>{});
}
