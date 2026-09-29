"use strict";

async function communityApi(path,{method="GET",body}={}){
  const session=getSession();
  if(!session?.access_token)throw new Error("Tu sesión ha caducado. Vuelve a entrar.");
  const res=await fetch(COMMUNITY_API+path,{
    method,
    headers:{
      Authorization:`Bearer ${session.access_token}`,
      ...(body?{"Content-Type":"application/json"}:{})
    },
    body:body?JSON.stringify(body):undefined,
    cache:"no-store"
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok){
    const code=String(data?.error||"COMMUNITY_ERROR");
    const map={
      RATE_LIMIT:"Espera un momento antes de volver a publicar.",
      POST_LIMIT:"Ya tienes 5 anuncios activos. Borra uno antes de publicar otro.",
      INVALID_MESSAGE:"El mensaje debe tener entre 1 y 300 caracteres.",
      INVALID_POST:"Revisa el título, la categoría y el texto del anuncio.",
      REALM_REQUIRED:"Necesitas haber fundado un reino para usar la comunidad.",
      FORBIDDEN:"No puedes borrar contenido de otro Archimago.",
      UNAUTHORIZED:"Tu sesión ha caducado. Vuelve a entrar."
    };
    throw new Error(map[code]||code);
  }
  return data;
}
function communityTime(value){
  const d=new Date(value), diff=Math.max(0,Date.now()-d.getTime()), min=Math.floor(diff/60000);
  if(min<1)return "ahora";
  if(min<60)return `hace ${min} min`;
  const h=Math.floor(min/60); if(h<24)return `hace ${h} h`;
  const days=Math.floor(h/24); if(days<7)return `hace ${days} d`;
  return d.toLocaleDateString("es-ES",{day:"2-digit",month:"short"});
}
function communityCategoryLabel(code){
  return ({general:"General",diplomacia:"Diplomacia",reclutamiento:"Reclutamiento",comercio:"Comercio",guerra:"Guerra"})[code]||code;
}
async function renderCommunity(){
  communitySignature="";
  $("#view-host").innerHTML=`${viewHeader("PLAZA ARCANA","Comunidad","Habla con otros Archimagos y publica anuncios para todo el mundo.")}
    <div class="community-tabs">
      <button class="community-tab ${communityMode==="chat"?"active":""}" data-community-tab="chat">CHAT GLOBAL</button>
      <button class="community-tab ${communityMode==="board"?"active":""}" data-community-tab="board">TABLÓN</button>
    </div>
    <div id="community-content"></div>`;
  document.querySelectorAll("[data-community-tab]").forEach(btn=>btn.addEventListener("click",async()=>{
    communityMode=btn.dataset.communityTab;
    stopCommunityPolling();
    await renderCommunity();
  }));
  if(communityMode==="chat"){
    renderChatShell();
    await loadChatMessages(false);
    startCommunityPolling();
  }else{
    stopCommunityPolling();
    renderBoardShell();
    await loadBoardPosts();
  }
}
function renderChatShell(){
  $("#community-content").innerHTML=`
    <div class="panel">
      <p class="community-note">Chat público de la temporada. Máximo 300 caracteres por mensaje.</p>
      <div class="chat-shell">
        <div id="chat-messages" class="chat-messages"><div class="empty">Abriendo el canal arcano…</div></div>
        <form id="chat-form">
          <div class="chat-compose">
            <input id="chat-input" maxlength="300" autocomplete="off" placeholder="Escribe un mensaje al mundo…" />
            <button class="primary-action" id="chat-send" type="submit">ENVIAR</button>
          </div>
          <div class="chat-status"><span id="chat-count">0 / 300</span> · Los mensajes antiguos se eliminan automáticamente.</div>
        </form>
      </div>
    </div>`;
  $("#chat-input").addEventListener("input",e=>$("#chat-count").textContent=`${e.target.value.length} / 300`);
  $("#chat-form").addEventListener("submit",sendChatMessage);
}
async function loadChatMessages(quiet=false){
  if(communityBusy || currentView!=="community" || communityMode!=="chat")return;
  communityBusy=true;
  try{
    const data=await communityApi("/messages");
    const messages=data.messages||[];
    const sig=messages.map(m=>m.id).join("|");
    if(sig===communitySignature && quiet)return;
    communitySignature=sig;
    const host=$("#chat-messages"); if(!host)return;
    const nearBottom=host.scrollHeight-host.scrollTop-host.clientHeight<90 || !quiet;
    host.innerHTML=messages.length?messages.map(m=>`
      <article class="chat-message">
        <header><strong><button class="player-link" data-profile="${esc(m.username)}">${esc(m.username)}</button></strong><time title="${esc(new Date(m.created_at).toLocaleString("es-ES"))}">${communityTime(m.created_at)}</time></header>
        <p>${esc(m.message)}</p>
        ${m.user_id===data.me?`<button class="community-delete" data-delete-chat="${esc(m.id)}" title="Borrar mensaje">×</button>`:""}
      </article>`).join(""):`<div class="empty">Todavía no hay mensajes. Sé el primero en abrir el canal.</div>`;
    document.querySelectorAll("[data-delete-chat]").forEach(b=>b.addEventListener("click",()=>deleteChatMessage(b.dataset.deleteChat)));
    if(nearBottom)host.scrollTop=host.scrollHeight;
  }catch(e){
    if(!quiet){
      const host=$("#chat-messages");
      if(host)host.innerHTML=`<div class="empty">${esc(humanError(e))}</div>`;
    }
  }finally{communityBusy=false;}
}
async function sendChatMessage(e){
  e.preventDefault();
  const input=$("#chat-input"), btn=$("#chat-send"), message=input.value.trim();
  if(!message)return;
  const old=btn.textContent; btn.disabled=true; btn.textContent="ENVIANDO…";
  try{
    await communityApi("/messages",{method:"POST",body:{message}});
    input.value=""; $("#chat-count").textContent="0 / 300";
    communitySignature="";
    await loadChatMessages(false);
    input.focus();
  }catch(err){toast(humanError(err),"error");}
  finally{btn.disabled=false;btn.textContent=old;}
}
async function deleteChatMessage(id){
  if(!confirm("¿Borrar este mensaje?"))return;
  try{
    await communityApi(`/messages/${encodeURIComponent(id)}`,{method:"DELETE"});
    communitySignature="";
    await loadChatMessages(false);
  }catch(e){toast(humanError(e),"error");}
}
function renderBoardShell(){
  $("#community-content").innerHTML=`
    <div class="board-layout">
      <div class="panel">
        <h3>Publicar anuncio</h3>
        <p class="community-note">Cada anuncio dura 14 días. Puedes mantener hasta 5 activos.</p>
        <form id="board-form" class="board-form">
          <label>Categoría
            <select id="board-category">
              <option value="general">General</option>
              <option value="diplomacia">Diplomacia</option>
              <option value="reclutamiento">Reclutamiento</option>
              <option value="comercio">Comercio</option>
              <option value="guerra">Guerra</option>
            </select>
          </label>
          <label>Título<input id="board-title" maxlength="80" placeholder="Título del anuncio" /></label>
          <label>Mensaje<textarea id="board-body" maxlength="1200" placeholder="Escribe tu anuncio…"></textarea></label>
          <button class="primary-action" id="board-publish" type="submit">PUBLICAR</button>
        </form>
      </div>
      <div class="panel">
        <div class="board-tools">
          <select id="board-filter" class="board-filter">
            <option value="">Todos los anuncios</option>
            <option value="general">General</option>
            <option value="diplomacia">Diplomacia</option>
            <option value="reclutamiento">Reclutamiento</option>
            <option value="comercio">Comercio</option>
            <option value="guerra">Guerra</option>
          </select>
          <button class="icon-button" id="board-refresh" title="Actualizar tablón">↻</button>
        </div>
        <div id="board-posts" class="board-posts"><div class="empty">Consultando el tablón…</div></div>
      </div>
    </div>`;
  $("#board-form").addEventListener("submit",publishBoardPost);
  $("#board-filter").addEventListener("change",loadBoardPosts);
  $("#board-refresh").addEventListener("click",loadBoardPosts);
}
async function loadBoardPosts(){
  const host=$("#board-posts"); if(!host)return;
  try{
    const filter=$("#board-filter")?.value||"";
    const data=await communityApi(`/posts${filter?`?category=${encodeURIComponent(filter)}`:""}`);
    const posts=data.posts||[];
    host.innerHTML=posts.length?posts.map(p=>`
      <article class="board-post">
        <div class="board-post-head"><span class="board-category">${esc(communityCategoryLabel(p.category))}</span><strong><button class="player-link" data-profile="${esc(p.username)}">${esc(p.username)}</button></strong></div>
        <h4>${esc(p.title)}</h4>
        <p>${esc(p.body)}</p>
        <div class="board-meta"><span>${communityTime(p.created_at)} · caduca ${new Date(p.expires_at).toLocaleDateString("es-ES")}</span>${p.user_id===data.me?`<button class="community-delete" data-delete-post="${esc(p.id)}">BORRAR</button>`:""}</div>
      </article>`).join(""):`<div class="empty">No hay anuncios activos en esta categoría.</div>`;
    document.querySelectorAll("[data-delete-post]").forEach(b=>b.addEventListener("click",()=>deleteBoardPost(b.dataset.deletePost)));
  }catch(e){host.innerHTML=`<div class="empty">${esc(humanError(e))}</div>`;}
}
async function publishBoardPost(e){
  e.preventDefault();
  const btn=$("#board-publish");
  const payload={category:$("#board-category").value,title:$("#board-title").value.trim(),body:$("#board-body").value.trim()};
  if(payload.title.length<3 || !payload.body){toast("Completa el título y el mensaje.","error");return;}
  const old=btn.textContent;btn.disabled=true;btn.textContent="PUBLICANDO…";
  try{
    await communityApi("/posts",{method:"POST",body:payload});
    $("#board-title").value="";$("#board-body").value="";
    toast("Anuncio publicado.");
    await loadBoardPosts();
  }catch(e){toast(humanError(e),"error");}
  finally{btn.disabled=false;btn.textContent=old;}
}
async function deleteBoardPost(id){
  if(!confirm("¿Retirar este anuncio del tablón?"))return;
  try{
    await communityApi(`/posts/${encodeURIComponent(id)}`,{method:"DELETE"});
    toast("Anuncio retirado.");
    await loadBoardPosts();
  }catch(e){toast(humanError(e),"error");}
}
