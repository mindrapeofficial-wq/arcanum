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

/* Primeros pasos: a guided path to the first victory. Every check is derived from canonical
   server state (my_realm_state and the arena record); nothing here grants rewards. */
let onboardingArenaWins=null;
function onboardingSteps(){
  const r=realmState?.realm||{}, b=realmState?.buildings||{};
  const hasArmy=(realmState?.army||[]).some(u=>Number(u.quantity||0)>0);
  return [
    {done:Number(b.farms||0)>0&&Number(b.towns||0)>0,view:"build",title:"Construye una Granja y un Pueblo",text:"Las Granjas alimentan y los Pueblos alojan a tu población: sin ellos el dominio no crece."},
    {done:Number(b.guilds||0)>0,view:"build",title:"Levanta tu primer Gremio",text:"Los Gremios producen la investigación con la que aprenderás hechizos."},
    {done:(realmState?.known_spells||[]).length>0,view:"research",title:"Aprende tu primer hechizo",text:"Dedica turnos a investigar en el Grimorio hasta completar un hechizo de tu Escuela."},
    {done:Number(b.barracks||0)>0,view:"build",title:"Construye Cuarteles",text:"Sin Cuarteles no puedes reclutar tropas."},
    {done:hasArmy,view:"army",title:"Recluta tu primer ejército",text:"Un dominio sin tropas es un blanco fácil."},
    {done:Number(r.land||0)>200,view:"realm",title:"Explora nuevas tierras",text:"Gasta algunos turnos en explorar para ganar acres donde seguir construyendo."},
    {done:Number(onboardingArenaWins||0)>0,view:"arena",title:"Gana tu primer duelo en la Arena",text:"Prepara a tu Arconte y vence a un rival. ¡Tu primera victoria!"}
  ];
}
function onboardingPanelHtml(){
  const steps=onboardingSteps(), done=steps.filter(s=>s.done).length;
  if(done===steps.length)return "";
  const next=steps.findIndex(s=>!s.done);
  return `<section class="panel onboarding-panel" id="onboarding-panel" aria-label="Primeros pasos">
    <div class="panel-title-row"><div><span class="section-kicker">PRIMEROS PASOS</span><h3>Tu camino hacia la primera victoria</h3></div><strong class="onboarding-count">${done} / ${steps.length}</strong></div>
    <div class="growth-track onboarding-track"><span style="width:${Math.round(done/steps.length*100)}%"></span></div>
    <ol class="onboarding-steps">${steps.map((s,i)=>`<li class="${s.done?"done":i===next?"next":""}">
      <button type="button" data-onboarding-view="${esc(s.view)}" ${s.done?'aria-disabled="true"':""}>
        <span class="onboarding-mark" aria-hidden="true">${s.done?"✓":i+1}</span>
        <span><strong>${esc(s.title)}</strong>${i===next?`<small>${esc(s.text)}</small>`:""}</span>
      </button></li>`).join("")}</ol>
  </section>`;
}
function wireOnboardingPanel(){
  document.querySelectorAll("[data-onboarding-view]").forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.getAttribute("aria-disabled")==="true")return;
    const view=btn.dataset.onboardingView;
    if(view==="realm"){$("#realm-explore-turns")?.focus();$("#realm-explore-button")?.scrollIntoView({behavior:"smooth",block:"center"});return;}
    navigate(view);
  }));
}
async function refreshOnboardingArena(){
  if(Number(onboardingArenaWins||0)>0||typeof stateApi!=="function")return;
  if(!onboardingSteps().slice(0,6).every(s=>s.done))return;
  try{
    const data=await stateApi("/arena");
    onboardingArenaWins=Number(data?.wins||0);
  }catch{return;}
  const panel=$("#onboarding-panel");
  if(panel&&currentView==="realm"){
    const html=onboardingPanelHtml();
    if(html){panel.outerHTML=html;wireOnboardingPanel();}else panel.remove();
  }
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
  const tip=manualNextStep();
  const popCap=Math.min(Number(c.food||0),Number(c.residential||0));
  const built=Math.max(0,Number(r.land||0)-Number(r.wilderness||0));
  const landPct=realmPercent(built,r.land);
  const turnPct=realmPercent(r.turns,r.max_turns);
  const progression=realmProgressLabel(r.land);
  const progressionPct=progression.level>=4?100:realmPercent(r.land,progression.next);
  const alerts=realmAlerts();
  const domainName=realmDomainRecord?.domain_name||r.mage_name;

  $("#view-host").innerHTML=`<div class="realm-dashboard">
    <section class="realm-banner realm-banner-2">
      <img class="realm-kingdom-image" src="assets/art/kingdom-level-00.jpg?v=0.3.46" alt="" aria-hidden="true" decoding="async" />
      <div class="realm-banner-shade" aria-hidden="true"></div>
      <div class="realm-banner-content">
        <span class="section-kicker">${esc(school?.name_es||r.school_code)}</span>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <h2 id="realm-domain-name" style="margin:0">${esc(domainName)}</h2>
          <button id="realm-domain-edit" class="small-action" type="button" title="Editar nombre del Dominio" aria-label="Editar nombre del Dominio">✎ EDITAR</button>
        </div>
        <div id="realm-character-name" style="margin-top:7px;font-size:11px;letter-spacing:.14em;color:rgba(236,216,174,.72)">ARCHIMAGO · ${esc(r.mage_name)}</div>
        <p>${esc(progression.name)} · ${n(r.land)} acres · Nivel Mágico ${n(r.spell_level)}</p>
        <div class="realm-status-line"><span>${n(realmState.known_spells.length)} hechizos conocidos</span></div>
        <div class="quick-actions">
          <button class="small-action" data-quick="economy">ECONOMÍA</button>
          <button class="small-action" data-quick="build">CONSTRUIR</button>
          <button class="small-action" data-quick="research">MAGIA</button>
          <button class="small-action" data-quick="war">GUERRA</button>
        </div>
      </div>
      <small class="realm-art-label">DOMINIO · REINO NIVEL 1</small>
    </section>

    <section class="realm-command panel">
      <div class="realm-command-head"><div><span class="section-kicker">CONSEJO ARCANO</span><h3>¿Qué hago ahora?</h3></div><span class="realm-command-mark">✦</span></div>
      <strong>${esc(tip.title)}</strong>
      <p>${esc(tip.text)}</p>
      <button class="small-action" id="realm-tip-action">VER RECOMENDACIÓN</button>
    </section>
  </div>

  ${onboardingPanelHtml()}

  <div class="realm-vitals">
    <div class="realm-vital-card"><small>Ascendencia</small><strong>${n(r.net_power)}</strong><em>Fuerza global del dominio</em></div>
    <div class="realm-vital-card"><small>Turnos</small><strong>${n(r.turns)} / ${n(r.max_turns)}</strong><div class="mini-track"><span style="width:${turnPct}%"></span></div></div>
    <div class="realm-vital-card"><small>Terreno desarrollado</small><strong>${n(built)} / ${n(r.land)}</strong><em>${landPct}% construido · ${n(r.wilderness)} salvaje</em></div>
    <div class="realm-vital-card"><small>Fortalezas</small><strong>${n(b.fortresses)}</strong><em>${Number(b.fortresses||0)>0?"Defensa vital activa":"Prioridad crítica"}</em></div>
  </div>

  <div class="realm-lower-grid">
    <section class="panel realm-capacity-panel">
      <div class="panel-title-row"><div><span class="section-kicker">CAPACIDAD DEL DOMINIO</span><h3>Reservas y límites</h3></div><span class="muted">Actualizado ahora</span></div>
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
      <div class="panel-title-row"><div><span class="section-kicker">VIGILANCIA</span><h3>Alertas del dominio</h3></div><span class="alert-count">${alerts.length}</span></div>
      <div class="realm-alert-list">${alerts.map(a=>`<article class="realm-alert ${a.tone}"><span></span><div><strong>${esc(a.title)}</strong><p>${esc(a.text)}</p></div></article>`).join("")}</div>
    </section>
  </div>

  <section class="panel realm-growth-panel">
    <div class="panel-title-row">
      <div><span class="section-kicker">EXPANSIÓN</span><h3>Progreso del dominio</h3></div>
      <strong class="growth-stage">${esc(progression.name)}</strong>
    </div>
    <div class="growth-track"><span style="width:${progressionPct}%"></span></div>
    <div class="growth-meta"><span>${n(r.land)} acres actuales</span><span>${progression.level>=4?"Máximo de exploración alcanzado":`Siguiente hito: ${n(progression.next)} acres`}</span></div>
    <div class="action-panel realm-explore-panel">
      <label>Turnos para explorar<input id="realm-explore-turns" type="number" min="1" max="50" value="1"></label>
      <button id="realm-explore-button" class="primary-action">✦ EXPLORAR NUEVAS TIERRAS</button>
    </div>
  </section>`;

  document.querySelectorAll("[data-quick]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.quick)));
  $("#realm-explore-button").addEventListener("click",()=>doExplore($("#realm-explore-button"),"realm-explore-turns"));
  $("#realm-domain-edit")?.addEventListener("click",editRealmDomainName);
  wireOnboardingPanel();
  refreshOnboardingArena();
  loadRealmDomain().then(()=>{
    if(currentView==="realm")paintRealmDomainIdentity();
  }).catch(()=>{});

  $("#realm-tip-action").addEventListener("click",()=>{
    const target=Number(r.wilderness||0)>=80?"build":Number(b.guilds||0)<5?"build":Number(b.barracks||0)<1?"build":Number(r.turns||0)>=20&&Number(r.land||0)<3500?"economy":"economy";
    navigate(target);
  });
}
