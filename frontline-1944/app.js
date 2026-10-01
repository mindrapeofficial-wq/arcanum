"use strict";

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const SAVE_KEY = "frontline_1944_narrative_v02";

function clone(v){ return JSON.parse(JSON.stringify(v)); }
function clamp(v,min=0,max=100){ return Math.max(min,Math.min(max,Math.round(v))); }

function freshState(){
  return {
    sceneId:"airborne_reports",
    resources:clone(FRONTLINE_DATA.resources),
    formations:clone(FRONTLINE_DATA.formations),
    log:[],
    decisionResult:null,
    nextScene:null,
    path:[]
  };
}

function loadState(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch{
    return null;
  }
}
function saveState(){ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }

let state = loadState() || freshState();

function render(){
  renderCampaign();
  renderResources();
  renderFormations();
  renderScene();
  renderMap();
  renderStaff();
  renderIntel();
  renderLog();
  renderSources();
  saveState();
}

function renderCampaign(){
  const c=FRONTLINE_DATA.campaign;
  $("#commander-name").textContent=c.commander;
  $("#commander-command").textContent=c.subtitle;
  $("#theater-label").textContent=c.title;
  $("#campaign-mode").textContent=c.mode;
}

function renderResources(){
  const r=state.resources;
  $("#res-command").textContent=clamp(r.command,0,9);
  $("#res-communications").textContent=clamp(r.communications)+"%";
  $("#res-logistics").textContent=clamp(r.logistics)+"%";
  $("#res-fuel").textContent=clamp(r.fuel)+"%";
  $("#res-ammunition").textContent=clamp(r.ammunition)+"%";
  $("#res-reserves").textContent=clamp(r.reserves)+"%";
  $("#res-morale").textContent=clamp(r.morale)+"%";
  $("#res-intelligence").textContent=clamp(r.intelligence)+"%";
}

function renderFormations(){
  $("#formations-list").innerHTML=state.formations.map(f=>{
    return '<article class="formation">'+
      '<div class="formation-head"><strong>'+f.name+'</strong><span>'+f.certainty.toUpperCase()+'</span></div>'+
      '<small>'+f.sector+'</small>'+
      '<small>'+f.status+'</small>'+
      '<div class="formation-bars">'+
        '<div class="mini-bar" title="Preparación"><i style="width:'+clamp(f.readiness)+'%"></i></div>'+
        '<div class="mini-bar" title="Abastecimiento"><i style="width:'+clamp(f.supply)+'%"></i></div>'+
      '</div>'+
    '</article>';
  }).join("");
}

function renderScene(){
  const scene=FRONTLINE_DATA.scenes[state.sceneId];
  if(!scene) return;

  $("#campaign-date").textContent=scene.date+" · "+scene.time;
  $("#scene-title").textContent=scene.title;
  $("#scene-date").textContent=scene.date;
  $("#scene-time").textContent=scene.time;
  $("#scene-from").textContent=scene.from;
  $("#scene-urgency").textContent=scene.urgency;
  $("#scene-classification").textContent=scene.classification;

  $("#scene-body").innerHTML=scene.body.map(p=>"<p>"+p+"</p>").join("");
  $("#historical-facts").innerHTML=scene.historical.map(p=>"<p>"+p+"</p>").join("");

  const result=$("#decision-result");
  const choices=$("#choices");

  if(state.decisionResult){
    choices.innerHTML="";
    result.classList.remove("hidden");
    result.innerHTML=
      "<strong>ORDEN EMITIDA</strong><br>"+
      state.decisionResult+
      (state.nextScene ? '<button id="continue-button" class="continue-button">CONTINUAR LA CAMPAÑA</button>' : "");
    $("#continue-button")?.addEventListener("click", continueScene);
  }else{
    result.classList.add("hidden");
    result.innerHTML="";
    if(!scene.choices.length){
      choices.innerHTML='<div class="decision-result">Fin del vertical slice histórico 0.2. Tus decisiones han quedado registradas.</div>';
    }else{
      choices.innerHTML=scene.choices.map(c=>
        '<button class="choice" data-choice="'+c.id+'">'+
          '<div><strong>'+c.title+'</strong><p>'+c.desc+'</p></div>'+
          '<em>'+c.tag+'</em>'+
        '</button>'
      ).join("");
      $$(".choice").forEach(btn=>btn.addEventListener("click",()=>choose(btn.dataset.choice)));
    }
  }
}

function choose(choiceId){
  const scene=FRONTLINE_DATA.scenes[state.sceneId];
  const choice=scene.choices.find(c=>c.id===choiceId);
  if(!choice) return;

  const before=clone(state.resources);
  applyEffects(choice.effects||{});
  applyFormationConsequences(choiceId);

  const changes=describeEffects(before,state.resources);
  state.path.push({scene:scene.id,choice:choice.id,title:choice.title,time:scene.time});
  state.log.push({
    time:scene.time,
    date:scene.date,
    title:choice.title,
    text:choice.result,
    effects:changes
  });

  state.decisionResult=choice.result+(changes ? "<br><br><span class=\"effects\">"+changes+"</span>" : "");
  state.nextScene=choice.next||null;
  render();
}

function continueScene(){
  if(!state.nextScene) return;
  state.sceneId=state.nextScene;
  state.nextScene=null;
  state.decisionResult=null;
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}

function applyEffects(effects){
  for(const [key,value] of Object.entries(effects)){
    if(!(key in state.resources)) continue;
    const max=key==="command" ? 9 : 100;
    state.resources[key]=clamp(Number(state.resources[key]||0)+Number(value||0),0,max);
  }
}

function applyFormationConsequences(choiceId){
  const byId=id=>state.formations.find(f=>f.id===id);
  if(choiceId==="historical_carentan"){
    const r=byId("915"); if(r){r.sector="En marcha hacia Carentan";r.status="Comprometido por orden del cuerpo";r.readiness=76;r.supply=72;}
  }
  if(choiceId==="hold_reserve"){
    const r=byId("915"); if(r){r.status="Reserva retenida a la espera de confirmación";r.readiness=84;}
  }
  if(choiceId==="split_reserve"){
    const r=byId("915"); if(r){r.sector="Destacamentos hacia Carentan y Bayeux";r.status="Cohesión reducida";r.readiness=69;r.supply=68;}
  }
  if(choiceId==="full_alert"){
    state.formations.forEach(f=>{f.readiness=clamp(f.readiness+5);f.supply=clamp(f.supply-2);});
  }
  if(choiceId==="protect_network"){
    state.formations.forEach(f=>{f.supply=clamp(f.supply+3);});
  }
  if(choiceId==="cotentin_priority"){
    ["709","243","91","915"].forEach(id=>{const f=byId(id);if(f)f.readiness=clamp(f.readiness+4);});
  }
  if(choiceId==="caen_priority"){
    ["352","716"].forEach(id=>{const f=byId(id);if(f)f.readiness=clamp(f.readiness+5);});
  }
  if(choiceId==="elastic_defense"){
    state.formations.forEach(f=>{f.readiness=clamp(f.readiness+2);});
  }
}

function describeEffects(before,after){
  const labels={
    command:"Mando",communications:"Comunicaciones",logistics:"Logística",fuel:"Combustible",
    ammunition:"Munición",reserves:"Reservas",morale:"Moral",intelligence:"Inteligencia"
  };
  const parts=[];
  Object.keys(labels).forEach(k=>{
    const delta=Math.round(after[k]-before[k]);
    if(delta) parts.push(labels[k]+" "+(delta>0?"+":"")+delta);
  });
  return parts.join(" · ");
}

function renderMap(){
  const links=$("#map-links");
  const points=$("#map-points");
  const pointById=Object.fromEntries(FRONTLINE_DATA.map.map(p=>[p.id,p]));
  links.innerHTML=FRONTLINE_DATA.links.map(([a,b])=>{
    const p1=pointById[a],p2=pointById[b];
    return '<line class="map-link" x1="'+p1.x+'" y1="'+p1.y+'" x2="'+p2.x+'" y2="'+p2.y+'"></line>';
  }).join("");

  const current=state.sceneId;
  points.innerHTML=FRONTLINE_DATA.map.map(p=>{
    let pulse="";
    if(current==="airborne_reports" && (p.id==="sme"||p.id==="caen")) pulse=" pulse";
    if(current==="naval_reports" && (p.id==="cherbourg"||p.id==="caen")) pulse=" pulse";
    if(current==="landings" && (p.id==="omaha"||p.id==="caen"||p.id==="carentan")) pulse=" pulse";
    const intelLabel={
      airborne:"AEROTRANSPORTADO",
      critical:"NODO CRÍTICO",
      coastal:"COSTA",
      uncertain:"INCIERTO",
      quiet:"SIN NOVEDAD",
      hq:"CUARTEL GENERAL"
    }[p.intel]||"";
    return '<g class="map-point '+p.state+pulse+'" transform="translate('+p.x+','+p.y+')">'+
      '<circle r="29"></circle>'+
      '<text y="-2">'+p.name+'</text>'+
      '<text class="intel" y="13">'+intelLabel+'</text>'+
    '</g>';
  }).join("");
}

function renderStaff(){
  const res=state.resources;
  $("#staff-list").innerHTML=FRONTLINE_DATA.staff.map(s=>{
    let note=s.note;
    if(s.id==="ops" && res.reserves<50) note="La reserva se está reduciendo. Keller insiste en que cualquier nuevo compromiso debe tener un objetivo preciso.";
    if(s.id==="intel" && res.intelligence>50) note="La imagen de inteligencia empieza a aclararse, aunque Brenner sigue advirtiendo contra las cifras demasiado exactas.";
    if(s.id==="log" && res.logistics<60) note="Reimann informa de creciente fricción en carreteras y abastecimiento. Recomienda reducir movimientos simultáneos.";
    return '<article class="staff-card">'+
      '<span>'+s.rank+' · '+s.role+'</span>'+
      '<strong>'+s.name+(s.fictional?' <small>· personaje ficticio</small>':'')+'</strong>'+
      '<p>'+note+'</p>'+
      '<div class="staff-trust">Confianza profesional: '+s.trust+'/100</div>'+
    '</article>';
  }).join("");
}

function renderIntel(){
  const v=clamp(state.resources.intelligence);
  $("#intel-reliability").textContent=v+"%";
  let text="Los informes son fragmentarios. No existe todavía una imagen fiable de la magnitud del ataque.";
  if(state.sceneId==="naval_reports") text="Hay indicios claros de una operación marítima de gran escala, pero la distribución y fuerza exacta de los desembarcos siguen sin estar confirmadas.";
  if(state.sceneId==="landings") text="Los desembarcos anfibios están confirmados. La cuestión ya no es si existe una invasión, sino dónde está su esfuerzo principal y qué reservas puede comprometer el cuerpo.";
  if(state.sceneId==="demo_end") text="El sistema conservará informes con hora, procedencia, fiabilidad y obsolescencia. Una posición enemiga conocida puede dejar de ser cierta minutos después.";
  $("#intel-text").textContent=text;
}

function renderLog(){
  const host=$("#decision-log");
  if(!state.log.length){
    host.innerHTML='<div class="log-entry">Todavía no has emitido ninguna orden operacional.</div>';
    return;
  }
  host.innerHTML=state.log.slice().reverse().map(item=>
    '<div class="log-entry"><b>'+item.date+' · '+item.time+'</b><br>'+item.title+
    '<span class="effects">'+item.effects+'</span></div>'
  ).join("");
}

function renderSources(){
  $("#sources-list").innerHTML=FRONTLINE_DATA.sources.map(s=>
    '<a class="source-card" href="'+s.url+'" target="_blank" rel="noopener noreferrer">'+
      '<strong>'+s.short+'</strong><small>'+s.title+' · '+s.publisher+'</small>'+
    '</a>'
  ).join("");
}

$("#sources-button").addEventListener("click",()=>$("#sources-dialog").showModal());
$("#close-sources").addEventListener("click",()=>$("#sources-dialog").close());
$("#sources-dialog").addEventListener("click",e=>{ if(e.target===$("#sources-dialog")) $("#sources-dialog").close(); });
$("#reset-game").addEventListener("click",()=>{
  if(confirm("¿Reiniciar la campaña narrativa desde el primer informe?")){
    localStorage.removeItem(SAVE_KEY);
    state=freshState();
    render();
  }
});

render();
