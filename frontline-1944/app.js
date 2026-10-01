"use strict";

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const USERS_KEY="frontline_1944_users_v1";
const SESSION_KEY="frontline_1944_session_v1";
let authMode="login";
let currentUser=localStorage.getItem(SESSION_KEY)||"";
let state=null;

function clone(v){return JSON.parse(JSON.stringify(v))}
function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,Math.round(v)))}
function campaignKey(){return "frontline_1944_campaign_v03_"+String(currentUser||"guest").toLowerCase()}

function freshState(){
  return{
    sceneId:"opening",
    resources:clone(FRONTLINE_DATA.resources),
    formations:clone(FRONTLINE_DATA.formations),
    log:[],
    decisionResult:null,
    nextScene:null,
    path:[],
    dossierSeen:false,
    chapterCompleted:false,
    updatedAt:Date.now()
  };
}
function loadCampaign(){
  try{
    const raw=localStorage.getItem(campaignKey());
    return raw?JSON.parse(raw):null;
  }catch{return null}
}
function saveCampaign(){
  if(!state||!currentUser)return;
  state.updatedAt=Date.now();
  localStorage.setItem(campaignKey(),JSON.stringify(state));
}
function getUsers(){
  try{return JSON.parse(localStorage.getItem(USERS_KEY)||"{}")}catch{return{}}
}
function saveUsers(users){localStorage.setItem(USERS_KEY,JSON.stringify(users))}
async function passwordHash(value){
  if(globalThis.crypto?.subtle){
    const bytes=new TextEncoder().encode("frontline1944|"+value);
    const digest=await crypto.subtle.digest("SHA-256",bytes);
    return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
  }
  let h=2166136261;
  for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
  return String(h>>>0);
}

function setAuthMode(mode){
  authMode=mode;
  $("#login-tab").classList.toggle("active",mode==="login");
  $("#register-tab").classList.toggle("active",mode==="register");
  $("#confirm-row").classList.toggle("hidden",mode!=="register");
  $("#auth-submit").textContent=mode==="login"?"ENTRAR AL CUARTEL GENERAL":"CREAR PERFIL DE MANDO";
  $("#auth-password").autocomplete=mode==="login"?"current-password":"new-password";
  clearNotice();
}
function clearNotice(){
  const n=$("#auth-notice");
  n.textContent="";
  n.className="notice hidden";
}
function notice(text,type="error"){
  const n=$("#auth-notice");
  n.textContent=text;
  n.className="notice"+(type==="success"?" success":"");
}
async function submitAuth(event){
  event.preventDefault();
  clearNotice();
  const username=$("#auth-username").value.trim();
  const password=$("#auth-password").value;
  const confirm=$("#auth-confirm").value;
  if(username.length<3){notice("El usuario debe tener al menos 3 caracteres.");return}
  if(password.length<4){notice("La contraseña debe tener al menos 4 caracteres.");return}
  const users=getUsers();
  const key=username.toLowerCase();

  if(authMode==="register"){
    if(password!==confirm){notice("Las contraseñas no coinciden.");return}
    if(users[key]){notice("Ese usuario ya existe en este navegador.");return}
    users[key]={username,hash:await passwordHash(password),createdAt:Date.now()};
    saveUsers(users);
    currentUser=username;
    localStorage.setItem(SESSION_KEY,currentUser);
    notice("Perfil creado.","success");
    setTimeout(showMenu,180);
    return;
  }

  if(!users[key]){notice("Usuario no encontrado. Puedes registrarlo en la pestaña REGISTRO.");return}
  if(users[key].hash!==await passwordHash(password)){notice("Contraseña incorrecta.");return}
  currentUser=users[key].username;
  localStorage.setItem(SESSION_KEY,currentUser);
  showMenu();
}

function showAuth(){
  $("#auth-view").classList.remove("hidden");
  $("#menu-view").classList.add("hidden");
  $("#game-view").classList.add("hidden");
  $("#auth-password").value="";
  $("#auth-confirm").value="";
}
function showMenu(){
  $("#auth-view").classList.add("hidden");
  $("#game-view").classList.add("hidden");
  $("#menu-view").classList.remove("hidden");
  $("#menu-username").textContent=currentUser||"Comandante";
  const saved=loadCampaign();
  const cont=$("#continue-campaign");
  cont.disabled=!saved;
  if(!saved){
    $("#campaign-status").textContent="No existe una campaña guardada. Inicia el Capítulo I.";
  }else if(saved.chapterCompleted){
    $("#campaign-status").textContent="Capítulo I completado. Puedes revisar la campaña o comenzar de nuevo.";
    cont.textContent="REVISAR CAMPAÑA";
  }else{
    const scene=FRONTLINE_DATA.scenes[saved.sceneId];
    $("#campaign-status").textContent="Partida guardada · "+(scene?.date||"1939")+" · "+(scene?.time||"");
    cont.textContent="CONTINUAR";
  }
}
function startNewCampaign(){
  state=freshState();
  saveCampaign();
  enterGame();
}
function continueCampaign(){
  state=loadCampaign()||freshState();
  enterGame();
}
function enterGame(){
  $("#auth-view").classList.add("hidden");
  $("#menu-view").classList.add("hidden");
  $("#game-view").classList.remove("hidden");
  $("#game-username").textContent=currentUser.toUpperCase();
  renderGame();
  window.scrollTo(0,0);
}
function returnToMenu(){
  saveCampaign();
  showMenu();
  window.scrollTo(0,0);
}
function logout(){
  saveCampaign();
  currentUser="";
  state=null;
  localStorage.removeItem(SESSION_KEY);
  showAuth();
}

function renderGame(){
  if(!state)state=loadCampaign()||freshState();
  renderCampaignMeta();
  renderResources();
  renderFormations();
  renderDossier();
  renderScene();
  renderMap();
  renderStaff();
  renderIntel();
  renderLog();
  renderSources();
  saveCampaign();
}

function renderCampaignMeta(){
  const c=FRONTLINE_DATA.campaign;
  $("#commander-name").textContent=c.commander;
  $("#commander-command").textContent=c.subtitle;
  $("#theater-label").textContent=c.title+" · "+c.operation;
  $("#chief-of-staff").textContent="JEFE DE ESTADO MAYOR · "+c.chiefOfStaff.toUpperCase();
  $("#campaign-mode").textContent=c.mode;
  $("#chapter-label").textContent=c.chapter+" · "+c.title;
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
  $("#formations-list").innerHTML=state.formations.map(f=>
    '<article class="formation">'+
      '<div class="formation-head"><strong>'+f.name+'</strong><span>'+f.certainty.toUpperCase()+'</span></div>'+
      '<small>'+f.commander+'</small>'+
      '<small>'+f.sector+'</small>'+
      '<small>'+f.status+'</small>'+
      '<div class="formation-bars">'+
        '<div class="mini-bar" title="Preparación"><i style="width:'+clamp(f.readiness)+'%"></i></div>'+
        '<div class="mini-bar" title="Abastecimiento"><i style="width:'+clamp(f.supply)+'%"></i></div>'+
      '</div>'+
    '</article>'
  ).join("");
}

function renderDossier(){
  $("#campaign-context").innerHTML=FRONTLINE_DATA.campaign.context.map(p=>"<p>"+p+"</p>").join("");
  $("#dossier-panel").classList.toggle("hidden",state.dossierSeen);
  $("#situation-panel").classList.toggle("hidden",!state.dossierSeen);
}

function openFirstReport(){
  state.dossierSeen=true;
  saveCampaign();
  renderGame();
}

function renderScene(){
  const scene=FRONTLINE_DATA.scenes[state.sceneId];
  if(!scene)return;

  $("#campaign-date").textContent=scene.date+" · "+scene.time;
  $("#scene-title").textContent=scene.title;
  $("#scene-date").textContent=scene.date;
  $("#scene-time").textContent=scene.time;
  $("#scene-from").textContent=scene.from;
  $("#scene-urgency").textContent=scene.urgency;
  $("#scene-classification").textContent=scene.classification;
  $("#scene-body").innerHTML=scene.body.map(p=>"<p>"+p+"</p>").join("");
  $("#historical-facts").innerHTML=scene.historical.map(p=>"<p>"+p+"</p>").join("");

  const choices=$("#choices");
  const result=$("#decision-result");

  if(state.decisionResult){
    choices.innerHTML="";
    result.classList.remove("hidden");
    result.innerHTML=
      "<strong>ORDEN REGISTRADA</strong><br>"+state.decisionResult+
      (state.nextScene?'<button id="continue-button" class="continue-button">CONTINUAR</button>':"");
    $("#continue-button")?.addEventListener("click",continueScene);
    return;
  }

  result.classList.add("hidden");
  result.innerHTML="";

  if(!scene.choices.length){
    state.chapterCompleted=true;
    choices.innerHTML=
      '<div class="decision-result"><strong>CAPÍTULO I COMPLETADO</strong><br>'+
      'El perfil de tus decisiones ha quedado guardado para futuras campañas.'+
      '<button id="chapter-menu-button" class="continue-button">VOLVER AL MENÚ PRINCIPAL</button></div>';
    $("#chapter-menu-button")?.addEventListener("click",returnToMenu);
    return;
  }

  choices.innerHTML=scene.choices.map(c=>
    '<button class="choice" data-choice="'+c.id+'">'+
      '<div><strong>'+c.title+'</strong><p>'+c.desc+'</p></div>'+
      '<em>'+c.tag+'</em>'+
    '</button>'
  ).join("");
  $$(".choice").forEach(btn=>btn.addEventListener("click",()=>choose(btn.dataset.choice)));
}

function choose(choiceId){
  const scene=FRONTLINE_DATA.scenes[state.sceneId];
  const choice=scene?.choices.find(c=>c.id===choiceId);
  if(!choice)return;

  const before=clone(state.resources);
  applyEffects(choice.effects||{});
  applyFormationConsequences(choiceId);
  const changes=describeEffects(before,state.resources);

  state.path.push({scene:scene.id,choice:choice.id,title:choice.title,date:scene.date,time:scene.time});
  state.log.push({date:scene.date,time:scene.time,title:choice.title,text:choice.result,effects:changes});
  state.decisionResult=choice.result+(changes?'<br><br><span class="effects">'+changes+"</span>":"");
  state.nextScene=choice.next||null;
  saveCampaign();
  renderGame();
}

function continueScene(){
  if(!state.nextScene)return;
  state.sceneId=state.nextScene;
  state.nextScene=null;
  state.decisionResult=null;
  if(state.sceneId==="chapter_end")state.chapterCompleted=true;
  saveCampaign();
  renderGame();
  $("#situation-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
}

function applyEffects(effects){
  for(const [key,value] of Object.entries(effects)){
    if(!(key in state.resources))continue;
    const max=key==="command"?9:100;
    state.resources[key]=clamp(Number(state.resources[key]||0)+Number(value||0),0,max);
  }
}

function applyFormationConsequences(id){
  const byId=x=>state.formations.find(f=>f.id===x);
  if(id==="center_mass"){
    const f=byId("10A");if(f){f.status="Prioridad logística y de movimiento";f.readiness=clamp(f.readiness+2);f.supply=clamp(f.supply+2)}
  }
  if(id==="balanced_wings"){
    state.formations.forEach(f=>{f.supply=clamp(f.supply+1)});
  }
  if(id==="reserve_first"){
    const f=byId("reserve");if(f){f.status="Reserva protegida por orden del Grupo de Ejércitos";f.readiness=clamp(f.readiness+2)}
  }
  if(id==="tempo"){
    ["8A","10A","14A"].forEach(x=>{const f=byId(x);if(f){f.readiness=clamp(f.readiness-2);f.supply=clamp(f.supply-4)}});
  }
  if(id==="supply_pause"){
    state.formations.forEach(f=>{f.supply=clamp(f.supply+5);f.readiness=clamp(f.readiness+1)});
  }
  if(id==="recon_priority"){
    state.formations.forEach(f=>{f.readiness=clamp(f.readiness+1)});
  }
  if(id==="accelerate"){
    const f=byId("10A");if(f){f.status="Explotación acelerada hacia el Vístula";f.supply=clamp(f.supply-5)}
  }
  if(id==="preserve"){
    const f=byId("reserve");if(f){f.readiness=clamp(f.readiness+4);f.supply=clamp(f.supply+3)}
  }
  if(id==="assault"){
    const f=byId("10A");if(f){f.status="Comprometido en los accesos de Varsovia";f.readiness=clamp(f.readiness-7);f.supply=clamp(f.supply-7)}
  }
  if(id==="encircle"){
    const f=byId("10A");if(f){f.status="Reorganizando fuegos y aislamiento de Varsovia";f.supply=clamp(f.supply+2)}
  }
  if(id==="flank_security"){
    const f=byId("8A");if(f){f.status="Refuerzo de seguridad del flanco norte";f.readiness=clamp(f.readiness+4)}
  }
  if(id==="strict_boundaries"){
    state.formations.forEach(f=>{f.status=f.id==="reserve"?"Preparando redistribución":"Operaciones sujetas a límites del Alto Mando"});
  }
  if(id==="reorganize"){
    state.formations.forEach(f=>{f.readiness=clamp(f.readiness+4);f.supply=clamp(f.supply+5)});
  }
}

function describeEffects(before,after){
  const labels={command:"Mando",communications:"Comunicaciones",logistics:"Logística",fuel:"Combustible",ammunition:"Munición",reserves:"Reservas",morale:"Moral",intelligence:"Inteligencia"};
  const parts=[];
  Object.keys(labels).forEach(k=>{
    const delta=Math.round(after[k]-before[k]);
    if(delta)parts.push(labels[k]+" "+(delta>0?"+":"")+delta);
  });
  return parts.join(" · ");
}

function renderMap(){
  const byId=Object.fromEntries(FRONTLINE_DATA.map.map(p=>[p.id,p]));
  $("#map-links").innerHTML=FRONTLINE_DATA.links.map(([a,b])=>{
    const p1=byId[a],p2=byId[b];
    return '<line class="map-link" x1="'+p1.x+'" y1="'+p1.y+'" x2="'+p2.x+'" y2="'+p2.y+'"></line>';
  }).join("");

  const pulseByScene={
    opening:["czest","katowice"],
    first_reports:["lodz","kielce"],
    western_war:["lodz","kielce"],
    warsaw:["warsaw"],
    soviet_entry:["warsaw"],
    chapter_end:[]
  };
  const pulse=new Set(pulseByScene[state.sceneId]||[]);

  $("#map-points").innerHTML=FRONTLINE_DATA.map.map(p=>
    '<g class="map-point '+p.state+(pulse.has(p.id)?" pulse":"")+'" transform="translate('+p.x+','+p.y+')">'+
      '<circle r="28"></circle>'+
      '<text y="-2">'+p.name+'</text>'+
      '<text class="intel" y="13">'+p.intel+'</text>'+
    '</g>'
  ).join("");
}

function renderStaff(){
  const r=state.resources;
  $("#staff-list").innerHTML=FRONTLINE_DATA.staff.map(s=>{
    let note=s.note;
    if(s.id==="manstein"&&r.reserves<55)note="La reserva está cayendo. Manstein recomienda no convertir cada éxito local en una nueva obligación operacional.";
    if(s.id==="signals"&&r.communications<65)note="Keller informa de una degradación seria de los enlaces. Algunas órdenes pueden tardar más en alcanzar a los mandos subordinados.";
    if(s.id==="quartermaster"&&r.logistics<65)note="Reinhardt advierte que el ritmo de consumo está superando la comodidad de los escalones logísticos.";
    const marker=s.historical?"HISTÓRICO":"FICTICIO";
    return '<article class="staff-card">'+
      '<span>'+s.rank+' · '+s.role+' · '+marker+'</span>'+
      '<strong>'+s.name+'</strong>'+
      '<p>'+note+'</p>'+
      '<div class="staff-trust">Confianza profesional: '+s.trust+'/100</div>'+
    '</article>';
  }).join("");
}

function renderIntel(){
  const v=clamp(state.resources.intelligence);
  $("#intel-reliability").textContent=v+"%";
  const text={
    opening:"Los informes de la primera mañana todavía están incompletos. El mapa refleja objetivos y contactos comunicados, no la posición exacta de todas las fuerzas polacas.",
    first_reports:"La velocidad del avance hace que algunos partes queden obsoletos antes de llegar al Estado Mayor. La ubicación de fuerzas enemigas puede tener varias horas de retraso.",
    western_war:"La declaración de guerra británica y francesa amplía el problema estratégico. Tu cuadro operacional inmediato sigue siendo Polonia.",
    warsaw:"La presencia alemana en los accesos de Varsovia está confirmada. La resistencia urbana y la situación de los flancos requieren una valoración separada del simple avance sobre el mapa.",
    soviet_entry:"La entrada soviética en el este está confirmada por el Alto Mando. Las líneas de demarcación y las bolsas de resistencia todavía generan incertidumbre operacional.",
    chapter_end:"La campaña termina. El archivo conserva tanto los hechos históricos como el registro de tus decisiones alternativas."
  };
  $("#intel-text").textContent=text[state.sceneId]||text.opening;
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

$("#login-tab").addEventListener("click",()=>setAuthMode("login"));
$("#register-tab").addEventListener("click",()=>setAuthMode("register"));
$("#auth-form").addEventListener("submit",submitAuth);
$("#new-campaign").addEventListener("click",startNewCampaign);
$("#continue-campaign").addEventListener("click",continueCampaign);
$("#archive-button").addEventListener("click",()=>$("#archive-dialog").showModal());
$("#logout-button").addEventListener("click",logout);
$("#menu-button").addEventListener("click",returnToMenu);
$("#save-menu-button").addEventListener("click",returnToMenu);
$("#sources-button").addEventListener("click",()=>$("#sources-dialog").showModal());
$("#close-dossier").addEventListener("click",openFirstReport);
$$(".dialog-close").forEach(btn=>btn.addEventListener("click",()=>$("#"+btn.dataset.close).close()));
["archive-dialog","sources-dialog"].forEach(id=>{
  $("#"+id).addEventListener("click",e=>{if(e.target===$("#"+id))$("#"+id).close()});
});

if(currentUser&&getUsers()[currentUser.toLowerCase()]){
  showMenu();
}else{
  currentUser="";
  localStorage.removeItem(SESSION_KEY);
  showAuth();
}
