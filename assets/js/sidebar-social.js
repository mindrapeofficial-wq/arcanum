"use strict";

let sidebarPresenceTimer=null;
let sidebarPresenceBusy=false;
let directChatTimer=null;
let directChatName="";
let directChatSignature="";

function sidebarFriendNames(inbox){
  return new Set((inbox?.friends||[]).map(x=>String(x.mage_name||"").toLowerCase()));
}
function sidebarOnlineRow(player,friends){
  const username=String(player?.username||"").trim();
  const school=String(player?.school_code||"");
  const isFriend=friends.has(username.toLowerCase());
  return '<div class="sidebar-online-row">'+
    '<button class="sidebar-online-player" type="button" data-profile="'+esc(username)+'" title="Ver ficha de '+esc(username)+'">'+
      '<span class="presence-dot" aria-hidden="true"></span>'+
      '<span class="school-dot '+esc(school)+'" aria-hidden="true"></span>'+
      '<span class="sidebar-online-copy"><strong>'+esc(username)+'</strong><small>'+esc(profileSchoolName(school))+(isFriend?' · AMIGO':'')+'</small></span>'+
    '</button>'+
    (isFriend?'<button class="sidebar-dm-button" type="button" data-direct-chat="'+esc(username)+'" title="Chat privado con '+esc(username)+'" aria-label="Abrir chat privado con '+esc(username)+'">✉</button>':'')+
  '</div>';
}
async function refreshSidebarPresence(){
  const host=$("#sidebar-online-list"),count=$("#sidebar-online-count");
  if(!host||!count||sidebarPresenceBusy||!realmState?.realm)return;
  sidebarPresenceBusy=true;
  try{
    const [presence,inbox]=await Promise.all([
      communityApi("/presence",{method:"POST"}),
      rpc("social_inbox")
    ]);
    const me=String(realmState.realm.mage_name||"").toLowerCase();
    const friends=sidebarFriendNames(inbox);
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
    count.textContent=String(online.length);
    host.innerHTML=online.length
      ?online.map(x=>sidebarOnlineRow(x,friends)).join("")
      :'<div class="sidebar-online-empty">Ningún otro Archimago conectado.</div>';
  }catch(e){
    count.textContent="—";
    host.innerHTML='<div class="sidebar-online-empty">Presencia no disponible.</div>';
  }finally{sidebarPresenceBusy=false;}
}
function startSidebarSocial(){
  stopSidebarSocial(false);
  refreshSidebarPresence();
  sidebarPresenceTimer=setInterval(refreshSidebarPresence,15000);
}
function stopSidebarSocial(closeChat=true){
  clearInterval(sidebarPresenceTimer);
  sidebarPresenceTimer=null;
  if(closeChat)closeDirectChatWindow();
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
      '<button id="direct-chat-profile" class="direct-chat-profile" type="button"><span class="presence-dot"></span><span><strong id="direct-chat-name">Chat privado</strong><small id="direct-chat-school">Archimago</small></span></button>'+
      '<button id="direct-chat-close" class="direct-chat-close" type="button" aria-label="Cerrar chat privado">×</button>'+
    '</header>'+
    '<div id="direct-chat-messages" class="direct-chat-messages"><div class="empty">Abriendo canal privado…</div></div>'+
    '<form id="direct-chat-form" class="direct-chat-form">'+
      '<textarea id="direct-chat-input" maxlength="1000" placeholder="Escribe un mensaje privado…" required></textarea>'+
      '<button id="direct-chat-send" class="profile-action" type="submit">ENVIAR</button>'+
    '</form>';
  document.body.appendChild(shell);
  $("#direct-chat-close",shell).addEventListener("click",closeDirectChatWindow);
  $("#direct-chat-profile",shell).addEventListener("click",()=>{if(directChatName)openPlayerProfile(directChatName);});
  $("#direct-chat-form",shell).addEventListener("submit",sendDirectChatMessage);
  return shell;
}
function renderDirectChatMessages(messages){
  const host=$("#direct-chat-messages");if(!host)return;
  const rows=messages||[];
  host.innerHTML=rows.length?rows.map(m=>
    '<div class="dm-message '+(m.mine?"mine":"theirs")+'"><p>'+esc(m.body)+'</p><small>'+new Date(m.created_at).toLocaleString("es-ES")+'</small></div>'
  ).join(""):'<div class="empty">No hay mensajes todavía. Puedes abrir la conversación.</div>';
  host.scrollTop=host.scrollHeight;
}
async function refreshDirectChat(quiet=true){
  if(!directChatName)return;
  try{
    const data=await rpc("conversation_with",{p_mage_name:directChatName,p_limit:80});
    const messages=data?.messages||[];
    const sig=messages.map(m=>String(m.id||"")+":"+String(m.created_at||"")+":"+String(m.body||"")).join("|");
    if(quiet&&sig===directChatSignature)return;
    directChatSignature=sig;
    renderDirectChatMessages(messages);
  }catch(e){
    if(!quiet){
      const host=$("#direct-chat-messages");
      if(host)host.innerHTML='<div class="empty">'+esc(humanError(e))+'</div>';
    }
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
    directChatName=target;
    directChatSignature="";
    $("#direct-chat-name",shell).textContent=target;
    $("#direct-chat-school",shell).textContent=profileSchoolName(profile.school_code);
    $("#direct-chat-messages",shell).innerHTML='<div class="empty">Abriendo canal privado…</div>';
    shell.classList.remove("hidden");
    hide($("#modal"));
    clearInterval(directChatTimer);
    await refreshDirectChat(false);
    directChatTimer=setInterval(()=>refreshDirectChat(true),4000);
    setTimeout(()=>$("#direct-chat-input",shell)?.focus(),0);
  }catch(e){toast(humanError(e),"error");}
}
function closeDirectChatWindow(){
  clearInterval(directChatTimer);directChatTimer=null;directChatName="";directChatSignature="";
  $("#direct-chat-window")?.classList.add("hidden");
}
async function sendDirectChatMessage(e){
  e.preventDefault();
  if(!directChatName)return;
  const input=$("#direct-chat-input"),btn=$("#direct-chat-send"),body=String(input?.value||"").trim();
  if(!body)return;
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
  const dm=e.target.closest("[data-direct-chat]");
  if(dm){
    e.preventDefault();
    e.stopPropagation();
    openDirectChatWindow(dm.dataset.directChat);
  }
});
