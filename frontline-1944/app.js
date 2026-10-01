"use strict";

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const ACCOUNTS_KEY="frontline_accounts_v1";
const SESSION_KEY="frontline_session_v1";
let authMode="login";
let currentUser=null;
let state=null;

function clone(v){return JSON.parse(JSON.stringify(v));}
function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,Math.round(Number(v)||0)));}
function normalizeUser(v){return String(v||"").trim().toLowerCase().replace(/[^a-z0-9._-]/g,"");}
function stateKey(user){return "frontline_campaign_v03_"+normalizeUser(user);}

async function hashPassword(value){
  const data=new TextEncoder().encode(String(value));
  const digest=await crypto.subtle.digest("SHA-256",data);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
function getAccounts(){try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)||"{}")}catch{return{}}}
function saveAccounts(v){localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(v))}
function setSession(user){if(user)localStorage.setItem(SESSION_KEY,user);else localStorage.removeItem(SESSION_KEY)}
function getSession(){return localStorage.getItem(SESSION_KEY)}

function freshState(){
  return{
    chapter:"ch1",
    stage:"dossier",
    sceneId:"briefing",
    resources:clone(FRONTLINE_DATA.chapter1.resources),
    formations:clone(FRONTLINE_DATA.chapter1.formations),
    log:[],
    decisionResult:null,
    nextScene:null,
    path:[]
  };
}
function loadGame(user){try{return JSON.parse(localStorage.getItem(stateKey(user)))||freshState()}catch{return freshState()}}
function saveGame(){if(currentUser&&state)localStorage.setItem(stateKey(currentUser),JSON.stringify(state))}

function showAuth(){
  $("#game-shell").classList.add("hidden");
  $("#auth-shell").classList.remove("hidden");
  document.body.classList.remove("in-game");
}
function showGame(){
  $("#auth-shell").classList.add("hidden");
  $("#game-shell").classList.remove("hidden");
  document.body.classList.add("in-game");
  renderGame();
}

function setAuthMode(mode){
  authMode=mode;
  $("#login-tab").classList.toggle("active",mode==="login");
  $("#register-tab").classList.toggle("active",mode==="register");
  $("#confirm-wrap").classList.toggle("hidden",mode!=="register");
  $("#auth-submit").textContent=mode==="login"?"ENTRAR AL PUESTO DE MANDO":"CREAR CUENTA Y ENTRAR";
  $("#auth-password").autocomplete=mode==="login"?"current-password":"new-password";
  clearAuthNotice();
}
function setAuthNotice(message,success=false){
  const n=$("#auth-notice");
  n.textContent=message;
  n.classList.remove("hidden");
  n.classList.toggle("success",success);
}
function clearAuthNotice(){
  const n=$("#auth-notice");
  n.textContent="";
  n.classList.add("hidden");
  n.classList.remove("success");
}
async function handleAuth(event){
  event.preventDefault();
  clearAuthNotice();
  const rawUser=$("#auth-user").value;
  const user=normalizeUser(rawUser);
  const pass=$("#auth-password").value;
  const confirm=$("#auth-confirm").value;
  if(user.length<3){setAuthNotice("El usuario debe tener al menos 3 caracteres.");return}
  if(pass.length<4){setAuthNotice("La contraseña debe tener al menos 4 caracteres.");return}
  const accounts=getAccounts();

  if(authMode==="register"){
    if(pass!==confirm){setAuthNotice("Las contraseñas no coinciden.");return}
    if(accounts[user]){setAuthNotice("Ese usuario ya existe en este navegador.");return}
    accounts[user]={display:rawUser.trim()||user,passwordHash:await hashPassword(pass),createdAt:Date.now()};
    saveAccounts(accounts);
    setAuthNotice("Cuenta local creada.",true);
  }else{
    if(!accounts[user]){setAuthNotice("Usuario no encontrado. Puedes crear una cuenta en REGISTRO.");return}
    const hash=await hashPassword(pass);
    if(hash!==accounts[user].passwordHash){setAuthNotice("Contraseña incorrecta.");return}
  }

  currentUser=user;
  setSession(user);
  state=loadGame(user);
  showGame();
}

function applyAssets(){
  $(".auth-photo").style.backgroundImage='url("'+FRONTLINE_DATA.assets.heroPhoto+'")';
  $("#dossier-map").src=FRONTLINE_DATA.assets.campaignMap;
  $("#archive-tank-photo").src=FRONTLINE_DATA.assets.heroPhoto;
  $("#archive-staff-photo").src=FRONTLINE_DATA.assets.staffPhoto;

  const logo=window.FRONTLINE_OFFICIAL_LOGO;
  if(logo){
    $("[data-official-logo]").forEach(img=>{img.src=logo;});
    const favicon=$("#game-favicon");
    if(favicon)favicon.href=logo;
  }
}

function renderGame(){
  renderChapterChrome();
  renderResources();
  renderFormations();
  renderStaff();
  renderIntel();
  renderJournal();
  renderSources();
  renderChapters();
  renderStage();
  saveGame();
}
function renderChapterChrome(){
  const c=FRONTLINE_DATA.chapter1;
  $("#chapter-title").textContent=c.title;
  $("#chapter-subtitle").textContent=c.subtitle;
  $("#commander-name").textContent=c.protagonist;
  $("#commander-command").textContent=c.command;
}
function renderResources(){
  const r=state.resources;
  $("#res-command").textContent=clamp(r.command,0,9);
  $("#res-communications").textContent=clamp(r.communications)+"%";
  $("#res-fuel").textContent=clamp(r.fuel)+"%";
  $("#res-ammunition").textContent=clamp(r.ammunition)+"%";
  $("#res-movement").textContent=clamp(r.movement)+"%";
  $("#res-cohesion").textContent=clamp(r.cohesion)+"%";
  $("#res-reconnaissance").textContent=clamp(r.reconnaissance)+"%";
  $("#res-fatigue").textContent=clamp(r.fatigue)+"%";
}
function renderFormations(){
  $("#formations-list").innerHTML=state.formations.map(f=>
    '<article class="formation">'+
      '<strong>'+f.name+'</strong>'+
      '<span>'+f.role+'</span>'+
      '<small>'+f.commander+'</small>'+
      '<small>'+f.position+'</small>'+
      '<div class="formation-bars"><div class="mini-bar"><i style="width:'+clamp(f.readiness)+'%"></i></div><div class="mini-bar"><i style="width:'+clamp(f.supply)+'%"></i></div></div>'+
    '</article>'
  ).join("");
}
function renderStaff(){
  $("#staff-list").innerHTML=FRONTLINE_DATA.chapter1.staff.map(s=>{
    let note=s.note;
    if(state.resources.cohesion<72&&s.id==="ia")note="Las diferencias de ritmo entre las columnas empiezan a preocupar a Operaciones. Keller pide reducir órdenes simultáneas.";
    if(state.resources.reconnaissance>60&&s.id==="ic")note="La imagen táctica está mejorando. Weber recuerda que un informe correcto hace treinta minutos puede ser falso ahora.";
    if(state.resources.fuel<72&&s.id==="qu")note="La situación de combustible sigue siendo utilizable, pero Hartmann exige evitar movimientos sin objetivo operativo claro.";
    return '<article class="staff-card"><span>'+s.rank+' · '+s.role+'</span><strong>'+s.name+(s.fictional?' <small>· ficticio</small>':'')+'</strong><p>'+note+'</p><div class="staff-trust">Confianza profesional: '+s.trust+'/100</div></article>';
  }).join("");
}
function renderIntel(){
  const v=clamp(state.resources.reconnaissance);
  $("#intel-reliability").textContent=v+"%";
  let txt="La información disponible antes del cruce de frontera es incompleta y pierde valor rápidamente con el movimiento.";
  if(state.sceneId==="fog")txt="La niebla reduce la observación directa. Partes de vanguardia y radio no llegan siempre en el mismo orden en que ocurrieron los hechos.";
  if(state.sceneId==="chojnice")txt="El frente se mueve con rapidez. La posición exacta de unidades polacas puede quedar obsoleta antes de que un parte llegue al cuerpo.";
  if(state.sceneId==="brda")txt="El balance del primer día depende tanto de lo que sabes como de lo que aún ignoras sobre fuerzas polacas intentando retirarse o contraatacar.";
  $("#intel-text").textContent=txt;
}
function renderJournal(){
  const host=$("#decision-log");
  if(!state.log.length){host.innerHTML='<div class="log-entry">Todavía no has emitido ninguna decisión operacional.</div>';return}
  host.innerHTML=state.log.slice().reverse().map(x=>
    '<div class="log-entry"><b>'+x.date+' · '+x.time+'</b><br>'+x.title+'<span class="effects">'+x.effects+'</span></div>'
  ).join("");
}
function renderSources(){
  $("#sources-list").innerHTML=FRONTLINE_DATA.sources.map(s=>
    '<a class="source-card" href="'+s.url+'" target="_blank" rel="noopener noreferrer"><strong>'+s.short+'</strong><small>'+s.title+' · '+s.publisher+'</small></a>'
  ).join("");
}
function renderChapters(){
  $("#chapters-list").innerHTML=FRONTLINE_DATA.chapters.map(c=>
    '<article class="chapter-card '+(c.status==="locked"?"locked":"")+'"><div class="number">'+c.number+'</div><div><strong>'+c.year+' · '+c.title+'</strong><small>'+c.subtitle+'</small></div><em>'+(c.status==="available"?"DISPONIBLE":"EN DESARROLLO")+'</em></article>'
  ).join("");
}

function renderStage(){
  const dossier=$("#dossier-panel"),situation=$("#situation-panel");
  if(state.stage==="dossier"){
    dossier.classList.remove("hidden");
    situation.classList.add("hidden");
    $("#dossier-text").innerHTML=FRONTLINE_DATA.chapter1.dossier.map(p=>"<p>"+p+"</p>").join("");
    $("#scene-date").textContent="31 AGO 1939";
    $("#scene-time").textContent="23:35";
    return;
  }
  dossier.classList.add("hidden");
  situation.classList.remove("hidden");
  renderScene();
}

function renderScene(){
  const scene=FRONTLINE_DATA.scenes[state.sceneId];
  if(!scene)return;
  $("#scene-date").textContent=scene.date;
  $("#scene-time").textContent=scene.time;
  $("#dispatch-date").textContent=scene.date;
  $("#dispatch-time").textContent=scene.time;
  $("#scene-title").textContent=scene.title;
  $("#scene-from").textContent=scene.from;
  $("#scene-urgency").textContent=scene.urgency;
  $("#scene-classification").textContent=scene.classification;
  $("#scene-body").innerHTML=scene.body.map(p=>"<p>"+p+"</p>").join("");
  $("#historical-facts").innerHTML=scene.historical.map(p=>"<p>"+p+"</p>").join("");

  const choices=$("#choices"),result=$("#decision-result");
  if(state.decisionResult){
    choices.innerHTML="";
    result.classList.remove("hidden");
    result.innerHTML="<strong>ORDEN REGISTRADA</strong><br>"+state.decisionResult+(state.nextScene?'<button id="continue-button" class="continue-button">CONTINUAR</button>':"");
    $("#continue-button")?.addEventListener("click",continueScene);
    return;
  }

  result.classList.add("hidden");
  result.innerHTML="";
  if(!scene.choices.length){
    choices.innerHTML='<div class="decision-result"><strong>FIN DEL CAPÍTULO I · PROTOTIPO 0.3</strong><br>El siguiente tramo cubrirá los combates en los bosques de Tuchola y el cierre del Corredor Polaco.</div>';
  }else{
    choices.innerHTML=scene.choices.map(c=>
      '<button class="choice" data-choice="'+c.id+'"><div><strong>'+c.title+'</strong><p>'+c.desc+'</p></div><em>'+c.tag+'</em></button>'
    ).join("");
    $$(".choice").forEach(b=>b.addEventListener("click",()=>choose(b.dataset.choice)));
  }
}

function choose(id){
  const scene=FRONTLINE_DATA.scenes[state.sceneId];
  const choice=scene.choices.find(c=>c.id===id);
  if(!choice)return;
  const before=clone(state.resources);
  for(const [key,value] of Object.entries(choice.effects||{})){
    if(!(key in state.resources))continue;
    const max=key==="command"?9:100;
    state.resources[key]=clamp(state.resources[key]+value,0,max);
  }
  applyFormationEffects(id);
  const effects=describeEffects(before,state.resources);
  state.path.push({scene:scene.id,choice:id,date:scene.date,time:scene.time});
  state.log.push({date:scene.date,time:scene.time,title:choice.title,effects});
  state.decisionResult=choice.result+(effects?'<span class="effects">'+effects+'</span>':"");
  state.nextScene=choice.next||null;
  renderGame();
}
function continueScene(){
  if(!state.nextScene)return;
  state.sceneId=state.nextScene;
  state.nextScene=null;
  state.decisionResult=null;
  renderGame();
  window.scrollTo({top:0,behavior:"smooth"});
}
function applyFormationEffects(id){
  const byId=x=>state.formations.find(f=>f.id===x);
  if(id==="push_armor"){const f=byId("3pz");if(f){f.readiness=clamp(f.readiness-4);f.supply=clamp(f.supply-7);f.position="Vanguardia adelantada";}}
  if(id==="traffic_control"){state.formations.forEach(f=>f.readiness=clamp(f.readiness+2));}
  if(id==="recon_first"){const f=byId("3pz");if(f)f.position="Avance con reconocimiento reforzado";}
  if(id==="concentrate"){const f=byId("3pz");if(f)f.readiness=clamp(f.readiness+3);}
  if(id==="broad_front"){state.formations.forEach(f=>f.readiness=clamp(f.readiness+1));}
  if(id==="pause_support"){state.formations.forEach(f=>{f.supply=clamp(f.supply+5);f.readiness=clamp(f.readiness+2);});}
}
function describeEffects(before,after){
  const labels={command:"Mando",communications:"Comunicaciones",fuel:"Combustible",ammunition:"Munición",movement:"Ritmo",cohesion:"Cohesión",reconnaissance:"Reconocimiento",fatigue:"Fatiga"};
  const parts=[];
  for(const [key,label] of Object.entries(labels)){
    const d=Math.round(after[key]-before[key]);
    if(d)parts.push(label+" "+(d>0?"+":"")+d);
  }
  return parts.join(" · ");
}

$("#login-tab").addEventListener("click",()=>setAuthMode("login"));
$("#register-tab").addEventListener("click",()=>setAuthMode("register"));
$("#auth-form").addEventListener("submit",handleAuth);
$("#start-chapter").addEventListener("click",()=>{state.stage="scene";renderGame();window.scrollTo({top:0,behavior:"smooth"});});
$("#sources-button").addEventListener("click",()=>$("#sources-dialog").showModal());
$("#close-sources").addEventListener("click",()=>$("#sources-dialog").close());
$("#chapters-button").addEventListener("click",()=>$("#chapters-dialog").showModal());
$("#close-chapters").addEventListener("click",()=>$("#chapters-dialog").close());
$("#sources-dialog").addEventListener("click",e=>{if(e.target===$("#sources-dialog"))$("#sources-dialog").close()});
$("#chapters-dialog").addEventListener("click",e=>{if(e.target===$("#chapters-dialog"))$("#chapters-dialog").close()});
$("#logout-button").addEventListener("click",()=>{setSession(null);currentUser=null;state=null;showAuth()});

applyAssets();
setAuthMode("login");
const existing=getSession();
if(existing&&getAccounts()[existing]){
  currentUser=existing;
  state=loadGame(existing);
  showGame();
}else{
  showAuth();
}