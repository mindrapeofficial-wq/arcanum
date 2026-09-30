"use strict";

let sidebarPresenceTimer=null;
let sidebarPresenceBusy=false;
let arcaneInboxBusy=false;
let arcaneInboxState={requests:[],conversations:[]};
let directChatTimer=null;
let directChatName="";
let directChatSignature="";
let directChatMode="player";
const ORACLE_NAME="Astrael";
const ORACLE_TITLE="Arconte IA · Consejero";
const ONLINE_PANEL_COLLAPSED_KEY="arcanum_online_panel_collapsed_v1";
let oracleHistory=[];

function isOnlinePanelCollapsed(){
  try{
    const value=localStorage.getItem(ONLINE_PANEL_COLLAPSED_KEY);
    return value===null?true:value==="1";
  }catch{return true;}
}
function setOnlinePanelCollapsed(collapsed){
  const panel=$("#sidebar-online-panel");
  const button=$("#sidebar-online-collapse");
  panel?.classList.toggle("is-collapsed",!!collapsed);
  if(button){
    button.setAttribute("aria-expanded",collapsed?"false":"true");
    button.setAttribute("aria-label",collapsed?"Expandir conectados":"Minimizar conectados");
    button.title=collapsed?"Expandir conectados":"Minimizar conectados";
    button.textContent="⌄";
  }
  try{localStorage.setItem(ONLINE_PANEL_COLLAPSED_KEY,collapsed?"1":"0");}catch{}
}
function ensureOnlinePanelCollapseButton(){
  const panel=$("#sidebar-online-panel");
  const head=panel?.querySelector(".sidebar-online-head");
  if(!panel||!head)return;
  let button=$("#sidebar-online-collapse");
  if(!button){
    button=document.createElement("button");
    button.id="sidebar-online-collapse";
    button.type="button";
    button.className="sidebar-online-collapse-button";
    button.textContent="⌄";
    button.addEventListener("click",e=>{
      e.preventDefault();
      e.stopPropagation();
      setOnlinePanelCollapsed(!panel.classList.contains("is-collapsed"));
    });
    head.appendChild(button);
  }
  setOnlinePanelCollapsed(isOnlinePanelCollapsed());
}

function sidebarFriendNames(inbox){
  return new Set((inbox?.friends||[]).map(x=>String(x.mage_name||"").toLowerCase()));
}
function oracleStorageKey(){
  const mage=String(realmState?.realm?.mage_name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_");
  return "arcanum_oracle_chat_v1_"+mage;
}
function loadOracleHistory(){
  try{
    const raw=localStorage.getItem(oracleStorageKey());
    const rows=raw?JSON.parse(raw):[];
    return Array.isArray(rows)?rows.slice(-30):[];
  }catch{return [];}
}
function saveOracleHistory(){
  try{localStorage.setItem(oracleStorageKey(),JSON.stringify(oracleHistory.slice(-30)));}catch{}
}
function sidebarOracleRow(){
  return '<div class="sidebar-online-row has-dm sidebar-oracle-row">'+
    '<button class="sidebar-online-player sidebar-oracle-player" type="button" data-oracle-chat title="Hablar con '+ORACLE_NAME+'">'+
      '<span class="presence-dot oracle-presence" aria-hidden="true"></span>'+
      '<span class="oracle-rune" aria-hidden="true">✦</span>'+
      '<span class="sidebar-online-copy"><strong>'+ORACLE_NAME+' <em>IA</em></strong><small>ARCHIVISTA ARCANO · SIEMPRE DISPONIBLE</small></span>'+
    '</button>'+
    '<button class="sidebar-dm-button oracle-dm-button" type="button" data-oracle-chat title="Preguntar a '+ORACLE_NAME+'" aria-label="Abrir chat con '+ORACLE_NAME+'">✉</button>'+
  '</div>';
}
async function oracleApi(message){
  const session=getSession();
  if(!session?.access_token)throw new Error("Tu sesión ha caducado. Vuelve a entrar.");
  const historyRows=oracleHistory.slice(-11);
  if(historyRows.length&&historyRows.at(-1)?.mine&&String(historyRows.at(-1)?.body||"")===String(message||""))historyRows.pop();
  const history=historyRows.slice(-10).map(m=>({
    role:m.mine?"user":"assistant",
    content:String(m.body||"")
  }));
  const res=await fetch(ORACLE_API,{
    method:"POST",
    headers:{Authorization:`Bearer ${session.access_token}`,"Content-Type":"application/json"},
    body:JSON.stringify({message,history}),
    cache:"no-store"
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data?.error||"No he podido consultar al Archivista.");
  return data;
}
function sidebarOnlineRow(player,friends){
  const username=String(player?.username||"").trim();
  const school=String(player?.school_code||"");
  const isFriend=friends.has(username.toLowerCase());
  return '<div class="sidebar-online-row'+(isFriend?' has-dm':'')+'">'+
    '<button class="sidebar-online-player" type="button" data-profile="'+esc(username)+'" title="Ver ficha de '+esc(username)+'">'+
      '<span class="presence-dot" aria-hidden="true"></span>'+
      '<span class="school-dot '+esc(school)+'" aria-hidden="true"></span>'+
      '<span class="sidebar-online-copy"><strong>'+esc(username)+'</strong><small>'+esc(profileSchoolName(school))+(isFriend?' · AMIGO':'')+'</small></span>'+
    '</button>'+
    (isFriend?'<button class="sidebar-dm-button" type="button" data-direct-chat="'+esc(username)+'" title="Chat privado con '+esc(username)+'" aria-label="Abrir chat privado con '+esc(username)+'">✉</button>':'')+
  '</div>';
}
function dmSeenStorageKey(){
  const mage=String(realmState?.realm?.mage_name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_");
  return "arcanum_dm_seen_v1_"+mage;
}
function readDmSeen(){
  try{
    const raw=localStorage.getItem(dmSeenStorageKey());
    const data=raw?JSON.parse(raw):{};
    return data&&typeof data==="object"?data:{};
  }catch{return {};}
}
function writeDmSeen(data){
  try{localStorage.setItem(dmSeenStorageKey(),JSON.stringify(data||{}));}catch{}
}
function messageTimestamp(message){
  const ts=new Date(message?.created_at||0).getTime();
  return Number.isFinite(ts)?ts:0;
}
function latestMessage(messages,filterFn=null){
  let best=null,bestTs=-1;
  for(const message of messages||[]){
    if(filterFn&&!filterFn(message))continue;
    const ts=messageTimestamp(message);
    if(ts>=bestTs){best=message;bestTs=ts;}
  }
  return best;
}
function inboxPreview(body){
  const text=String(body||"").replace(/\s+/g," ").trim();
  return text.length>72?text.slice(0,69)+"…":text;
}
function inboxTime(value){
  try{return typeof communityTime==="function"?communityTime(value):new Date(value).toLocaleString("es-ES");}
  catch{return "";}
}
function renderArcaneInbox(){
  const badge=$("#top-inbox-badge"),requestCount=$("#top-inbox-request-count"),unreadCount=$("#top-inbox-unread-count");
  const requestHost=$("#top-inbox-requests"),messageHost=$("#top-inbox-messages");
  if(!badge||!requestCount||!unreadCount||!requestHost||!messageHost)return;

  const requests=arcaneInboxState.requests||[];
  const conversations=arcaneInboxState.conversations||[];
  const unread=conversations.filter(x=>x.unread).length;
  const total=requests.length+unread;

  requestCount.textContent=String(requests.length);
  unreadCount.textContent=String(unread);
  badge.textContent=String(total);
  badge.classList.toggle("hidden",total<1);

  requestHost.innerHTML=requests.length?requests.map(x=>{
    const name=String(x.mage_name||x.username||"").trim();
    const school=String(x.school_code||"");
    return '<article class="inbox-request-row">'+
      '<button class="inbox-request-profile" type="button" data-profile="'+esc(name)+'">'+
        '<span class="school-dot '+esc(school)+'"></span>'+
        '<span><strong>'+esc(name)+'</strong><small>'+esc(profileSchoolName(school))+'</small></span>'+
      '</button>'+
      '<div class="inbox-request-actions">'+
        '<button type="button" data-inbox-friend-accept="'+esc(name)+'">ACEPTAR</button>'+
        '<button type="button" data-inbox-friend-reject="'+esc(name)+'">×</button>'+
      '</div>'+
    '</article>';
  }).join(""):'<div class="top-inbox-empty">No hay solicitudes pendientes.</div>';

  messageHost.innerHTML=conversations.length?conversations.map(x=>{
    const mine=!!x.latest?.mine;
    const prefix=mine?"Tú: ":"";
    return '<button class="inbox-message-row'+(x.unread?' unread':'')+'" type="button" data-inbox-chat="'+esc(x.mage_name)+'">'+
      '<span class="school-dot '+esc(x.school_code||"")+'"></span>'+
      '<span class="inbox-message-copy"><strong>'+esc(x.mage_name)+'</strong><small>'+esc(prefix+inboxPreview(x.latest?.body||""))+'</small></span>'+
      '<span class="inbox-message-meta">'+(x.unread?'<i></i>':'')+'<time>'+esc(inboxTime(x.latest?.created_at))+'</time></span>'+
    '</button>';
  }).join(""):'<div class="top-inbox-empty">No hay conversaciones todavía.</div>';
}
async function buildInboxConversations(inbox){
  const friends=(inbox?.friends||[]).slice(0,24);
  if(!friends.length)return [];
  const seen=readDmSeen();
  const results=await Promise.allSettled(friends.map(async friend=>{
    const name=String(friend?.mage_name||"").trim();
    if(!name)return null;
    const data=await rpc("conversation_with",{p_mage_name:name,p_limit:30});
    const messages=data?.messages||[];
    const latest=latestMessage(messages);
    if(!latest)return null;
    const latestInbound=latestMessage(messages,m=>!m.mine);
    const lastSeen=Number(seen[name.toLowerCase()]||0);
    const inboundTs=messageTimestamp(latestInbound);
    return {
      mage_name:name,
      school_code:String(friend?.school_code||""),
      latest,
      unread:!!latestInbound&&inboundTs>lastSeen
    };
  }));
  return results
    .filter(x=>x.status==="fulfilled"&&x.value)
    .map(x=>x.value)
    .sort((a,b)=>messageTimestamp(b.latest)-messageTimestamp(a.latest));
}
async function refreshArcaneInbox(inbox=null){
  if(arcaneInboxBusy||!realmState?.realm)return;
  arcaneInboxBusy=true;
  try{
    const data=inbox||await rpc("social_inbox");
    const conversations=await buildInboxConversations(data);
    arcaneInboxState={
      requests:data?.friend_requests||[],
      conversations
    };
    renderArcaneInbox();
  }catch(e){
    const requestHost=$("#top-inbox-requests"),messageHost=$("#top-inbox-messages");
    if(requestHost)requestHost.innerHTML='<div class="top-inbox-empty">No se pudo actualizar la bandeja.</div>';
    if(messageHost)messageHost.innerHTML='<div class="top-inbox-empty">Los mensajes no están disponibles ahora.</div>';
  }finally{arcaneInboxBusy=false;}
}
function markDirectChatRead(name,messages){
  const target=String(name||"").trim();
  if(!target)return;
  const latestInbound=latestMessage(messages,m=>!m.mine);
  if(!latestInbound)return;
  const seen=readDmSeen();
  const ts=messageTimestamp(latestInbound);
  if(ts>Number(seen[target.toLowerCase()]||0)){
    seen[target.toLowerCase()]=ts;
    writeDmSeen(seen);
  }
  const cached=arcaneInboxState.conversations.find(x=>String(x.mage_name).toLowerCase()===target.toLowerCase());
  if(cached)cached.unread=false;
  renderArcaneInbox();
}
async function inboxFriendRespond(name,accept){
  const target=String(name||"").trim();if(!target)return;
  try{
    await rpc("friend_respond",{p_mage_name:target,p_accept:!!accept});
    toast(accept?"Amistad aceptada. Ya podéis hablar en privado.":"Solicitud rechazada.","success");
    await refreshSidebarPresence(true);
  }catch(e){toast(humanError(e),"error");}
}

async function refreshSidebarPresence(force=false){
  const host=$("#sidebar-online-list"),count=$("#sidebar-online-count");
  if(!host||!count||(!force&&sidebarPresenceBusy)||!realmState?.realm)return;
  sidebarPresenceBusy=true;
  try{
    const [presenceResult,inboxResult]=await Promise.allSettled([
      communityApi("/presence",{method:"POST"}),
      rpc("social_inbox")
    ]);
    const inbox=inboxResult.status==="fulfilled"?inboxResult.value:null;
    if(inbox)refreshArcaneInbox(inbox);

    if(presenceResult.status!=="fulfilled")throw presenceResult.reason;
    const presence=presenceResult.value;
    const me=String(realmState.realm.mage_name||"").toLowerCase();
    const friends=sidebarFriendNames(inbox||{});
    const seen=new Set();
    const online=(presence?.online||[])
      .filter(x=>{
        const name=String(x?.username||"").trim();
        const key=name.toLowerCase();
        if(!name||key===me||seen.has(key))return false;
        seen.add(key);return true;
      })
      .sort((a,b)=>{
        const af=friends.has(String(a.username||"").toLowerCase());
        const bf=friends.has(String(b.username||"").toLowerCase());
        if(af!==bf)return af?-1:1;
        return String(a.username||"").localeCompare(String(b.username||""),"es");
      });
    count.textContent=String(online.length+1);
    host.innerHTML=sidebarOracleRow()+(online.length
      ?online.map(x=>sidebarOnlineRow(x,friends)).join("")
      :'<div class="sidebar-online-empty">No hay otros Arcontes conectados ahora.</div>');
  }catch(e){
    count.textContent="1";
    host.innerHTML=sidebarOracleRow()+'<div class="sidebar-online-empty">No se pudo consultar la presencia de otros Arcontes.</div>';
    if(!arcaneInboxState.requests.length&&!arcaneInboxState.conversations.length)refreshArcaneInbox();
  }finally{sidebarPresenceBusy=false;}
}
function startSidebarSocial(){
  stopSidebarSocial(false);
  ensureOnlinePanelCollapseButton();
  refreshSidebarPresence(true);
  sidebarPresenceTimer=setInterval(()=>refreshSidebarPresence(false),15000);
}
function stopSidebarSocial(closeChat=true){
  clearInterval(sidebarPresenceTimer);
  sidebarPresenceTimer=null;
  closeArcaneInbox();
  if(closeChat)closeDirectChatWindow();
}

function openArcaneInbox(){
  const panel=$("#top-inbox-panel"),button=$("#top-inbox-button");
  if(!panel||!button)return;
  panel.classList.remove("hidden");
  button.setAttribute("aria-expanded","true");
  refreshArcaneInbox();
}
function closeArcaneInbox(){
  const panel=$("#top-inbox-panel"),button=$("#top-inbox-button");
  panel?.classList.add("hidden");
  button?.setAttribute("aria-expanded","false");
}
function toggleArcaneInbox(){
  const panel=$("#top-inbox-panel");
  if(!panel)return;
  if(panel.classList.contains("hidden"))openArcaneInbox();else closeArcaneInbox();
}

function ensureDirectChatWindow(){
  let shell=$("#direct-chat-window");
  if(shell)return shell;
  shell=document.createElement("section");
  shell.id="direct-chat-window";
  shell.className="direct-chat-window hidden";
  shell.setAttribute("aria-live","polite");
  shell.innerHTML=
    '<header class="direct-chat-head">'+
      '<button id="direct-chat-profile" class="direct-chat-profile" type="button"><span class="presence-dot"></span><span><strong id="direct-chat-name">Chat privado</strong><small id="direct-chat-school">Arconte</small></span></button>'+
      '<button id="direct-chat-close" class="direct-chat-close" type="button" aria-label="Cerrar chat privado">×</button>'+
    '</header>'+
    '<div id="direct-chat-messages" class="direct-chat-messages"><div class="empty">Abriendo canal privado…</div></div>'+
    '<form id="direct-chat-form" class="direct-chat-form">'+
      '<textarea id="direct-chat-input" maxlength="1000" placeholder="Escribe un mensaje privado…" required></textarea>'+
      '<button id="direct-chat-send" class="profile-action" type="submit">ENVIAR</button>'+
    '</form>';
  document.body.appendChild(shell);
  $("#direct-chat-close",shell).addEventListener("click",closeDirectChatWindow);
  $("#direct-chat-profile",shell).addEventListener("click",()=>{if(directChatMode==="player"&&directChatName)openPlayerProfile(directChatName);});
  $("#direct-chat-form",shell).addEventListener("submit",sendDirectChatMessage);
  return shell;
}
function renderDirectChatMessages(messages){
  const host=$("#direct-chat-messages");if(!host)return;
  const rows=messages||[];
  host.innerHTML=rows.length?rows.map(m=>
    '<div class="dm-message '+(m.mine?"mine":"theirs")+(m.oracle?" oracle-message":"")+'"><p>'+esc(m.body)+'</p><small>'+new Date(m.created_at).toLocaleString("es-ES")+'</small></div>'
  ).join(""):'<div class="empty">No hay mensajes todavía. Puedes abrir la conversación.</div>';
  host.scrollTop=host.scrollHeight;
}
function oracleGreeting(){
  return {mine:false,oracle:true,body:"Soy Astrael, un Arconte controlado por IA dentro de ARCANUM. Puedo conversar contigo con profundidad sobre tu dominio, economía, construcción, conocimiento arcano, ejército, guerra, artefactos y estrategia. Mi siguiente evolución es actuar de forma autónoma como un jugador persistente dentro del mismo mundo.",created_at:new Date().toISOString()};
}
function renderOracleChat(){
  if(!oracleHistory.length)oracleHistory=[oracleGreeting()];
  renderDirectChatMessages(oracleHistory);
}
function openOracleChatWindow(){
  const shell=ensureDirectChatWindow();
  clearInterval(directChatTimer);directChatTimer=null;
  directChatMode="oracle";
  directChatName=ORACLE_NAME;
  directChatSignature="";
  oracleHistory=loadOracleHistory();
  if(!oracleHistory.length){oracleHistory=[oracleGreeting()];saveOracleHistory();}
  shell.classList.add("oracle-chat");
  $("#direct-chat-name",shell).textContent=ORACLE_NAME;
  $("#direct-chat-school",shell).textContent=ORACLE_TITLE;
  $("#direct-chat-input",shell).placeholder="Pregunta algo sobre ARCANUM…";
  $("#direct-chat-send",shell).textContent="CONSULTAR";
  shell.classList.remove("hidden");
  closeArcaneInbox();
  hide($("#modal"));
  renderOracleChat();
  setTimeout(()=>$("#direct-chat-input",shell)?.focus(),0);
}
async function sendOracleMessage(body,input,btn){
  const now=new Date().toISOString();
  oracleHistory.push({mine:true,oracle:false,body,created_at:now});
  saveOracleHistory();
  renderOracleChat();
  input.value="";
  btn.disabled=true;btn.textContent="PENSANDO…";
  const host=$("#direct-chat-messages");
  const thinking=document.createElement("div");
  thinking.className="dm-message theirs oracle-message oracle-thinking";
  thinking.innerHTML="<p>Astrael consulta el archivo arcano…</p>";
  host?.appendChild(thinking);
  if(host)host.scrollTop=host.scrollHeight;
  try{
    const data=await oracleApi(body);
    oracleHistory.push({mine:false,oracle:true,body:String(data?.answer||"No he encontrado una respuesta clara."),created_at:new Date().toISOString()});
    saveOracleHistory();
    renderOracleChat();
  }catch(err){
    thinking.remove();
    oracleHistory.push({mine:false,oracle:true,body:"Ahora mismo no consigo acceder al archivo. Inténtalo de nuevo en unos segundos.",created_at:new Date().toISOString()});
    saveOracleHistory();
    renderOracleChat();
    toast(humanError(err),"error");
  }finally{
    btn.disabled=false;btn.textContent="CONSULTAR";input.focus();
  }
}
async function refreshDirectChat(quiet=true){
  if(!directChatName)return [];
  try{
    const data=await rpc("conversation_with",{p_mage_name:directChatName,p_limit:80});
    const messages=data?.messages||[];
    const sig=messages.map(m=>String(m.id||"")+":"+String(m.created_at||"")+":"+String(m.body||"")).join("|");
    if(quiet&&sig===directChatSignature)return messages;
    directChatSignature=sig;
    renderDirectChatMessages(messages);
    if(!$("#direct-chat-window")?.classList.contains("hidden"))markDirectChatRead(directChatName,messages);
    return messages;
  }catch(e){
    if(!quiet){
      const host=$("#direct-chat-messages");
      if(host)host.innerHTML='<div class="empty">'+esc(humanError(e))+'</div>';
    }
    return [];
  }
}
async function openDirectChatWindow(name){
  const target=String(name||"").trim();if(!target)return;
  try{
    const profile=await rpc("player_profile",{p_mage_name:target});
    if(profile?.is_self||profile?.is_npc)return;
    if(profile?.friendship?.status!=="accepted"){
      toast("El chat privado se habilita cuando la amistad ha sido aceptada.","error");
      await openPlayerProfile(target);
      return;
    }
    const shell=ensureDirectChatWindow();
    directChatMode="player";
    directChatName=target;
    directChatSignature="";
    shell.classList.remove("oracle-chat");
    $("#direct-chat-name",shell).textContent=target;
    $("#direct-chat-school",shell).textContent=profileSchoolName(profile.school_code);
    $("#direct-chat-input",shell).placeholder="Escribe un mensaje privado…";
    $("#direct-chat-send",shell).textContent="ENVIAR";
    $("#direct-chat-messages",shell).innerHTML='<div class="empty">Abriendo canal privado…</div>';
    shell.classList.remove("hidden");
    closeArcaneInbox();
    hide($("#modal"));
    clearInterval(directChatTimer);
    const messages=await refreshDirectChat(false);
    markDirectChatRead(target,messages);
    directChatTimer=setInterval(()=>refreshDirectChat(true),4000);
    setTimeout(()=>$("#direct-chat-input",shell)?.focus(),0);
  }catch(e){toast(humanError(e),"error");}
}
function closeDirectChatWindow(){
  clearInterval(directChatTimer);directChatTimer=null;directChatName="";directChatSignature="";directChatMode="player";
  $("#direct-chat-window")?.classList.add("hidden");
}
async function sendDirectChatMessage(e){
  e.preventDefault();
  if(!directChatName)return;
  const input=$("#direct-chat-input"),btn=$("#direct-chat-send"),body=String(input?.value||"").trim();
  if(!body)return;
  if(directChatMode==="oracle"){
    await sendOracleMessage(body,input,btn);
    return;
  }
  btn.disabled=true;btn.textContent="ENVIANDO…";
  try{
    await rpc("send_direct_message",{p_mage_name:directChatName,p_body:body});
    input.value="";
    directChatSignature="";
    await refreshDirectChat(false);
    input.focus();
  }catch(err){toast(humanError(err),"error");}
  finally{btn.disabled=false;btn.textContent="ENVIAR";}
}

document.addEventListener("click",e=>{
  const oracle=e.target.closest("[data-oracle-chat]");
  if(oracle){
    e.preventDefault();
    e.stopPropagation();
    openOracleChatWindow();
    return;
  }
  const dm=e.target.closest("[data-direct-chat],[data-inbox-chat]");
  if(dm){
    e.preventDefault();
    e.stopPropagation();
    openDirectChatWindow(dm.dataset.directChat||dm.dataset.inboxChat);
    return;
  }
  const accept=e.target.closest("[data-inbox-friend-accept]");
  if(accept){
    e.preventDefault();e.stopPropagation();
    inboxFriendRespond(accept.dataset.inboxFriendAccept,true);
    return;
  }
  const reject=e.target.closest("[data-inbox-friend-reject]");
  if(reject){
    e.preventDefault();e.stopPropagation();
    inboxFriendRespond(reject.dataset.inboxFriendReject,false);
    return;
  }
  const shell=$("#top-inbox-shell");
  if(shell&&!shell.contains(e.target))closeArcaneInbox();
});

$("#top-inbox-button")?.addEventListener("click",e=>{e.stopPropagation();toggleArcaneInbox();});
$("#top-inbox-refresh")?.addEventListener("click",e=>{e.stopPropagation();refreshArcaneInbox();});
