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
  const school=profileSchoolName(realmState?.realm?.school_code);
  $("#view-host").innerHTML=`
    <div class="community-tabs">
      <button class="community-tab ${communityMode==="chat"?"active":""}" data-community-tab="chat">CHAT GLOBAL</button>
      <button class="community-tab ${communityMode==="school"?"active":""}" data-community-tab="school">MI ESCUELA</button>
      <button class="community-tab ${communityMode==="players"?"active":""}" data-community-tab="players">ARCHIMAGOS</button>
      <button class="community-tab ${communityMode==="board"?"active":""}" data-community-tab="board">TABLÓN</button>
    </div>
    <div id="community-content"></div>`;
  document.querySelectorAll("[data-community-tab]").forEach(btn=>btn.addEventListener("click",async()=>{
    communityMode=btn.dataset.communityTab;
    stopCommunityPolling();
    await renderCommunity();
  }));
  if(communityMode==="chat" || communityMode==="school"){
    renderChatShell(communityMode==="school",school);
    await Promise.all([loadChatMessages(false),loadPresence()]);
    startCommunityPolling();
  }else if(communityMode==="players"){
    stopCommunityPolling();
    renderPlayersShell();
    await Promise.all([loadPresence(),loadPlayerDirectory()]);
  }else{
    stopCommunityPolling();
    renderBoardShell();
    await loadBoardPosts();
  }
}
function renderChatShell(isSchool=false,school=""){
  const title=isSchool?`ESTANCIA DE ${school.toUpperCase()}`:"CANAL MUNDIAL";
  const note=isSchool
    ?`Zona común exclusiva de ${school}. Una pequeña sala de casa: conversación, identidad y camaradería de Escuela.`
    :"Chat público de la temporada. Máximo 300 caracteres por mensaje.";
  $("#community-content").innerHTML=`
    <div class="community-social-grid">
      <div class="panel">
        <div class="community-room-head"><div><span class="section-kicker">${title}</span><p class="community-note">${esc(note)}</p></div><span class="school-room-sigil ${esc(realmState?.realm?.school_code||"")}">${symbols[realmState?.realm?.school_code]||"✦"}</span></div>
        <div class="chat-shell">
          <div id="chat-messages" class="chat-messages"><div class="empty">Abriendo el canal arcano…</div></div>
          <form id="chat-form">
            <div class="chat-compose">
              <input id="chat-input" maxlength="300" autocomplete="off" placeholder="${isSchool?"Habla con tu Escuela…":"Escribe un mensaje al mundo…"}" />
              <button class="primary-action" id="chat-send" type="submit">ENVIAR</button>
            </div>
            <div class="chat-status"><span id="chat-count">0 / 300</span> · Los mensajes antiguos se eliminan automáticamente.</div>
          </form>
        </div>
      </div>
      <aside class="panel online-panel">
        <div class="online-head"><div><span class="section-kicker">PRESENCIA</span><h3>Conectados ahora</h3></div><strong id="online-count">0</strong></div>
        <div id="online-list" class="online-list"><div class="empty">Consultando presencias…</div></div>
      </aside>
    </div>`;
  $("#chat-input").addEventListener("input",e=>$("#chat-count").textContent=`${e.target.value.length} / 300`);
  $("#chat-form").addEventListener("submit",sendChatMessage);
}
function renderPlayersShell(){
  $("#community-content").innerHTML=`
    <div class="community-social-grid">
      <div class="panel">
        <span class="section-kicker">DIRECTORIO DEL MUNDO</span>
        <h3>Buscar Archimago</h3>
        <p class="community-note">Busca por nombre. Desde la ficha puedes agregar amistad, enviar mensaje o invitar a una alianza.</p>
        <div class="player-search"><input id="player-search-input" maxlength="40" autocomplete="off" placeholder="Nombre del Archimago…" /><button class="primary-action" id="player-search-button" type="button">BUSCAR</button></div>
        <div id="player-search-results" class="player-directory"><div class="empty">Escribe un nombre para buscar entre los Archimagos de la temporada.</div></div>
      </div>
      <aside class="panel online-panel">
        <div class="online-head"><div><span class="section-kicker">PRESENCIA</span><h3>Conectados ahora</h3></div><strong id="online-count">0</strong></div>
        <div id="online-list" class="online-list"><div class="empty">Consultando presencias…</div></div>
      </aside>
    </div>`;
  $("#player-search-input").addEventListener("input",()=>filterPlayerDirectory());
  $("#player-search-input").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();filterPlayerDirectory();}});
  $("#player-search-button").addEventListener("click",filterPlayerDirectory);
}
let communityDirectory=[];
let communityDirectoryPromise=null;

async function ensurePlayerDirectory(){
  if(communityDirectory.length)return communityDirectory;
  if(communityDirectoryPromise)return communityDirectoryPromise;
  communityDirectoryPromise=(async()=>{
    const [rows,npcs]=await Promise.all([rpc("leaderboard",{p_limit:100}),rpc("npc_directory")]);
    const npcNames=new Set((npcs||[]).map(x=>String(x.mage_name).toLowerCase()));
    communityDirectory=(rows||[]).filter(x=>!npcNames.has(String(x.mage_name).toLowerCase()));
    return communityDirectory;
  })();
  try{return await communityDirectoryPromise;}
  finally{communityDirectoryPromise=null;}
}

function topPlayerSearchRows(q){
  const needle=String(q||"").trim().toLowerCase();
  if(!needle)return [];
  return communityDirectory
    .filter(x=>String(x.mage_name).toLowerCase().includes(needle))
    .sort((a,b)=>{
      const an=String(a.mage_name).toLowerCase(),bn=String(b.mage_name).toLowerCase();
      const ae=an===needle,be=bn===needle;
      if(ae!==be)return ae?-1:1;
      const as=an.startsWith(needle),bs=bn.startsWith(needle);
      if(as!==bs)return as?-1:1;
      return Number(b.net_power||0)-Number(a.net_power||0);
    })
    .slice(0,6);
}

function renderTopPlayerSearch(){
  const input=$("#top-player-search-input"),host=$("#top-player-search-results");
  if(!input||!host)return;
  const q=input.value.trim();
  if(!q){host.classList.add("hidden");host.innerHTML="";return;}
  const rows=topPlayerSearchRows(q);
  host.innerHTML=rows.length?rows.map(x=>`
    <button class="top-player-search-row" type="button" data-profile="${esc(x.mage_name)}">
      <span class="school-dot ${esc(x.school_code)}"></span>
      <span><strong>${esc(x.mage_name)}</strong><small>${esc(profileSchoolName(x.school_code))}</small></span>
      <span><small>PODER</small><strong>${n(x.net_power)}</strong></span>
    </button>`).join(""):'<div class="top-player-search-empty">No se encontró ningún Archimago.</div>';
  host.classList.remove("hidden");
}

async function runTopPlayerSearch(){
  const input=$("#top-player-search-input"),host=$("#top-player-search-results");
  if(!input||!host)return;
  const q=input.value.trim();
  if(!q){renderTopPlayerSearch();return;}
  host.classList.remove("hidden");
  host.innerHTML='<div class="top-player-search-empty">Consultando el grimorio…</div>';
  try{await ensurePlayerDirectory();renderTopPlayerSearch();}
  catch(e){host.innerHTML=`<div class="top-player-search-empty">${esc(humanError(e))}</div>`;}
}

function wireTopPlayerSearch(){
  const shell=$("#top-player-search"),input=$("#top-player-search-input"),host=$("#top-player-search-results");
  if(!shell||!input||!host)return;
  let timer=null;
  input.addEventListener("input",()=>{
    clearTimeout(timer);
    timer=setTimeout(runTopPlayerSearch,120);
  });
  input.addEventListener("keydown",e=>{
    if(e.key==="Escape"){host.classList.add("hidden");input.blur();}
    if(e.key==="Enter"){
      e.preventDefault();
      const first=host.querySelector("[data-profile]");
      if(first){host.classList.add("hidden");openPlayerProfile(first.dataset.profile);}
    }
  });
  input.addEventListener("focus",()=>{if(input.value.trim())runTopPlayerSearch();});
  host.addEventListener("click",()=>host.classList.add("hidden"));
  document.addEventListener("click",e=>{if(!shell.contains(e.target))host.classList.add("hidden");});
}

async function loadPlayerDirectory(){
  const host=$("#player-search-results"); if(!host)return;
  try{
    await ensurePlayerDirectory();
    filterPlayerDirectory();
  }catch(e){host.innerHTML=`<div class="empty">${esc(humanError(e))}</div>`;}
}
function filterPlayerDirectory(){
  const host=$("#player-search-results"); if(!host)return;
  const q=String($("#player-search-input")?.value||"").trim().toLowerCase();
  if(!q){host.innerHTML='<div class="empty">Escribe un nombre para buscar entre los Archimagos de la temporada.</div>';return;}
  const rows=communityDirectory.filter(x=>String(x.mage_name).toLowerCase().includes(q)).slice(0,30);
  host.innerHTML=rows.length?rows.map(x=>`
    <button class="player-directory-row" data-profile="${esc(x.mage_name)}">
      <span class="school-dot ${esc(x.school_code)}"></span>
      <span><strong>${esc(x.mage_name)}</strong><small>${esc(profileSchoolName(x.school_code))}</small></span>
      <span><small>PODER</small><strong>${n(x.net_power)}</strong></span>
      <span>VER FICHA ›</span>
    </button>`).join(""):'<div class="empty">No hay ningún Archimago con ese nombre.</div>';
}
async function loadPresence(){
  const host=$("#online-list"); if(!host)return;
  try{
    const data=await communityApi("/presence",{method:"POST"});
    let online=data.online||[];
    if(communityMode==="school")online=online.filter(x=>x.school_code===realmState?.realm?.school_code);
    $("#online-count").textContent=String(online.length);
    host.innerHTML=online.length?online.map(x=>`
      <button class="online-player" data-profile="${esc(x.username)}">
        <span class="presence-dot"></span><span class="school-dot ${esc(x.school_code)}"></span>
        <span><strong>${esc(x.username)}</strong><small>${esc(profileSchoolName(x.school_code))}</small></span>
      </button>`).join(""):'<div class="empty">No hay otros Archimagos visibles ahora.</div>';
  }catch(e){host.innerHTML=`<div class="empty">${esc(humanError(e))}</div>`;}
}
async function loadChatMessages(quiet=false){
  if(communityBusy || currentView!=="community" || communityMode!=="chat")return;
  communityBusy=true;
  try{
    const channel=communityMode==="school"?"school":"global";
    const data=await communityApi(`/messages?channel=${channel}`);
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
    await communityApi("/messages",{method:"POST",body:{message,channel:communityMode==="school"?"school":"global"}});
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
