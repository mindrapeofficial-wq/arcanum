"use strict";

const ADMIN_API="https://mrmvmoyysxuopqexbxfk.supabase.co/functions/v1/arcanum-admin";
let adminReady=false;
let adminDenied=false; // a 403 is final for this session: stop probing the admin endpoint
let adminPlayersCache=[];
let adminModerationCache=null;

async function adminApi(path,{method="GET",body}={}){
  const s=getSession(); if(!s?.access_token) throw new Error("UNAUTHORIZED");
  const r=await fetch(ADMIN_API+path,{method,headers:{Authorization:`Bearer ${s.access_token}`,...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined,cache:"no-store"});
  const data=await r.json().catch(()=>({})); if(!r.ok) throw new Error(data?.error||"ADMIN_API_ERROR"); return data;
}
function adminSchool(code){return schoolName(code||"plain")}
function adminDate(v){try{return new Date(v).toLocaleString("es-ES")}catch{return "—"}}
function adminEsc(v){return esc(v??"")}
function adminConfirm(text){return window.confirm(text)}
async function adminPublicStatus(){
  try{
    const r=await fetch(ADMIN_API+"/public-status",{cache:"no-store"});
    return r.ok?await r.json():{maintenance:{enabled:false}};
  }catch{return {maintenance:{enabled:false}}}
}
async function enforceMaintenance(){
  const data=await adminPublicStatus();
  const maintenance=data?.maintenance||{enabled:false};
  if(!maintenance.enabled)return false;
  const session=getSession();
  if(session?.access_token){
    try{const me=await adminApi("/me");if(me?.admin){adminReady=true;document.querySelectorAll(".admin-nav-button").forEach(x=>x.classList.remove("hidden"));return false}}catch{}
  }
  hide($("#game-view"));hide($("#create-view"));show($("#auth-view"));
  switchAuthMode("login");
  setNotice($("#auth-notice"),String(maintenance.message||"ARCANUM está en mantenimiento. Vuelve en unos minutos."),"error");
  return true;
}
async function adminAction(payload,success="Acción completada"){
  await adminApi("/action",{method:"POST",body:payload}); toast(success,"success"); await renderAdminPanel();
}
async function probeAdmin(){
  if(adminReady)return true;
  if(adminDenied)return false;
  try{
    const me=await adminApi("/me");
    if(!me?.admin){adminDenied=true;return false}
    adminReady=true;
    document.querySelectorAll(".admin-nav-button").forEach(x=>x.classList.remove("hidden"));
    return true;
  }catch(e){
    if(String(e?.message||e).includes("FORBIDDEN"))adminDenied=true;
    return false;
  }
}
async function renderAdminPanel(){
  const ok=await probeAdmin(); const host=$("#view-host");
  if(!ok){host.innerHTML='<div class="panel"><h2>Acceso restringido</h2><p>Esta sección solo está disponible para administración.</p></div>';return}
  host.innerHTML=`<div class="admin-shell">
    <div class="view-header admin-head"><div><span class="section-kicker">CENTRO DE CONTROL</span><h1>Administración avanzada</h1><p>Operaciones server-side, moderación, Arena, PvE, inventario, eventos y auditoría.</p></div><button class="ghost-button" id="admin-refresh">↻ ACTUALIZAR</button></div>
    <div class="admin-tabs">
      <button data-admin-tab="overview" class="active">Resumen</button>
      <button data-admin-tab="players">Jugadores</button>
      <button data-admin-tab="moderation">Moderación</button>
      <button data-admin-tab="events">Eventos</button>
      <button data-admin-tab="audit">Auditoría</button>
    </div>
    <div id="admin-content"><div class="panel">Cargando consola…</div></div>
  </div>`;
  $("#admin-refresh").onclick=()=>renderAdminPanel();
  document.querySelectorAll("[data-admin-tab]").forEach(b=>b.onclick=()=>adminTab(b.dataset.adminTab));
  await adminTab("overview");
}
async function adminTab(tab){
  document.querySelectorAll("[data-admin-tab]").forEach(b=>b.classList.toggle("active",b.dataset.adminTab===tab));
  const content=$("#admin-content"); content.innerHTML='<div class="panel">Consultando datos…</div>';
  try{
    if(tab==="overview")return adminOverview(content);
    if(tab==="players")return adminPlayers(content);
    if(tab==="moderation")return adminModeration(content);
    if(tab==="events")return adminEvents(content);
    if(tab==="audit")return adminAudit(content);
  }catch(e){content.innerHTML=`<div class="panel"><div class="notice error">${adminEsc(humanError(e))}</div></div>`}
}
async function adminOverview(content){
  const data=await adminApi("/summary"),c=data.counts||{},m=data.maintenance?.value||{enabled:false};
  content.innerHTML=`
    <div class="admin-kpis">
      <div><small>Conectados registrados</small><strong>${c.arcanum_presence||0}</strong></div>
      <div><small>Perfiles de combate</small><strong>${c.arcanum_combat_profiles||0}</strong></div>
      <div><small>Combates Arena</small><strong>${c.arcanum_arena_matches||0}</strong></div>
      <div><small>Expediciones</small><strong>${c.arcanum_pve_runs||0}</strong></div>
      <div><small>Reliquias activas</small><strong>${c.arcanum_player_artifacts||0}</strong></div>
      <div><small>Ofertas Mercado</small><strong>${c.arcanum_market_offers||0}</strong></div>
    </div>
    <div class="admin-grid-two">
      <section class="panel admin-section">
        <div class="admin-section-head"><div><span class="section-kicker">SISTEMA</span><h3>Modo mantenimiento</h3></div><span class="admin-status ${m.enabled?"danger":"ok"}">${m.enabled?"ACTIVO":"ONLINE"}</span></div>
        <label class="admin-field"><span>Mensaje</span><textarea id="admin-maintenance-message" maxlength="240">${adminEsc(m.message||"ARCANUM está en mantenimiento. Vuelve en unos minutos.")}</textarea></label>
        <div class="admin-actions"><button class="primary-action" id="admin-maint-on">ACTIVAR</button><button class="ghost-button" id="admin-maint-off">DESACTIVAR</button></div>
      </section>
      <section class="panel admin-section">
        <div class="admin-section-head"><div><span class="section-kicker">BOSS</span><h3>Eventos recientes</h3></div></div>
        <div class="admin-list">${(data.boss||[]).map(b=>`<div class="admin-row"><div><strong>${adminEsc(b.boss_name)}</strong><small>${adminEsc(b.event_id)} · ${adminEsc(b.status)}</small></div><b>${n(b.current_hp)} / ${n(b.max_hp)}</b></div>`).join("")||"<p>Sin eventos.</p>"}</div>
      </section>
    </div>`;
  $("#admin-maint-on").onclick=()=>adminAction({action:"maintenance:set",enabled:true,message:$("#admin-maintenance-message").value},"Mantenimiento activado");
  $("#admin-maint-off").onclick=()=>adminAction({action:"maintenance:set",enabled:false,message:$("#admin-maintenance-message").value},"Mantenimiento desactivado");
}
async function adminPlayers(content){
  const data=await adminApi("/players"); adminPlayersCache=data.players||[];
  content.innerHTML=`
    <section class="panel admin-section">
      <div class="admin-toolbar"><input id="admin-player-search" type="search" placeholder="Buscar jugador o dominio…"><span>${adminPlayersCache.length} perfiles detectados</span></div>
      <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Jugador</th><th>Escuela</th><th>Dominio</th><th>Arena</th><th>Inventario</th><th>PvE</th><th>Última presencia</th><th></th></tr></thead><tbody id="admin-player-rows"></tbody></table></div>
    </section>`;
  const draw=(q="")=>{
    const needle=q.trim().toLowerCase();
    $("#admin-player-rows").innerHTML=adminPlayersCache.filter(p=>!needle||[p.username,p.domain_name,p.school_code].some(x=>String(x||"").toLowerCase().includes(needle))).map(p=>`
      <tr><td><strong>${adminEsc(p.username)}</strong><small>${adminEsc(p.user_id||"sin id local")}</small></td><td>${adminEsc(adminSchool(p.school_code))}</td><td>${adminEsc(p.domain_name||"—")}</td>
      <td>${p.arena?`${p.arena.rating} · ${p.arena.wins}V/${p.arena.losses}D · ${p.arena.seals_remaining} sellos`:"—"}</td>
      <td>${p.inventory_count??0} objetos · ${p.artifact_count??0} reliquias</td><td>${p.pve?adminEsc(p.pve.status)+" · sala "+p.pve.stage:"—"}</td><td>${p.last_seen?adminDate(p.last_seen):"—"}</td>
      <td><button class="ghost-button admin-open-player" data-player="${adminEsc(p.username)}">GESTIONAR</button></td></tr>`).join("");
    document.querySelectorAll(".admin-open-player").forEach(b=>b.onclick=()=>adminPlayerModal(b.dataset.player));
  };
  draw(); $("#admin-player-search").oninput=e=>draw(e.target.value);
}
function adminPlayerModal(name){
  const p=adminPlayersCache.find(x=>x.username===name)||{username:name},a=p.arena||{};
  $("#modal-content").innerHTML=`<div class="admin-player-modal">
    <span class="section-kicker">GESTIÓN DE JUGADOR</span><h2>${adminEsc(name)}</h2>
    <div class="admin-form-grid">
      <label class="admin-field"><span>Rating Arena</span><input id="adm-rating" type="number" min="100" value="${a.rating??1000}"></label>
      <label class="admin-field"><span>Sellos</span><input id="adm-seals" type="number" min="0" max="6" value="${a.seals_remaining??6}"></label>
      <label class="admin-field"><span>Victorias</span><input id="adm-wins" type="number" min="0" value="${a.wins??0}"></label>
      <label class="admin-field"><span>Derrotas</span><input id="adm-losses" type="number" min="0" value="${a.losses??0}"></label>
    </div>
    <div class="admin-actions"><button class="primary-action" id="adm-save-arena">GUARDAR ARENA</button></div>
    <div class="admin-danger-zone"><strong>Operaciones delicadas</strong><div class="admin-actions">
      <button class="ghost-button" data-danger="pve">Abortar PvE</button><button class="ghost-button" data-danger="relic">Desequipar reliquias</button><button class="ghost-button" data-danger="presence">Expulsar presencia</button>
      <button class="ghost-button danger" data-danger="combat">Regenerar perfil combate</button><button class="ghost-button danger" data-danger="inventory">Vaciar inventario</button>
    </div></div>
  </div>`;
  show($("#modal"));
  $("#adm-save-arena").onclick=async()=>{await adminAction({action:"arena:update",target:name,rating:$("#adm-rating").value,seals:$("#adm-seals").value,wins:$("#adm-wins").value,losses:$("#adm-losses").value},"Arena actualizada");hide($("#modal"))};
  document.querySelectorAll("[data-danger]").forEach(b=>b.onclick=async()=>{
    const kind=b.dataset.danger,map={pve:["pve:abort","abortar su expedición activa"],relic:["artifact:unequip","desequipar todas sus reliquias"],presence:["presence:kick","retirar su presencia online"],combat:["combat:reset","regenerar su perfil de combate"],inventory:["inventory:clear","VACIAR su inventario"]};
    const [action,label]=map[kind]; if(!adminConfirm(`¿Confirmas ${label} para ${name}?`))return; await adminAction({action,target:name},"Operación completada"); hide($("#modal"));
  });
}
async function adminModeration(content){
  adminModerationCache=await adminApi("/moderation"); const d=adminModerationCache;
  content.innerHTML=`<div class="admin-grid-two">
    <section class="panel admin-section"><div class="admin-section-head"><h3>Chat reciente</h3></div><div class="admin-list">${(d.chat||[]).map(x=>`<div class="admin-row"><div><strong>${adminEsc(x.username)}</strong><small>${adminEsc(x.message)} · ${adminDate(x.created_at)}</small></div><button class="ghost-button admin-chat-delete" data-id="${x.id}" ${x.deleted_at?"disabled":""}>BORRAR</button></div>`).join("")||"Sin mensajes"}</div></section>
    <section class="panel admin-section"><div class="admin-section-head"><h3>Tablón</h3></div><div class="admin-list">${(d.board||[]).map(x=>`<div class="admin-row"><div><strong>${adminEsc(x.title)}</strong><small>${adminEsc(x.username)} · ${adminEsc(x.category)}</small></div><button class="ghost-button admin-board-delete" data-id="${x.id}">ELIMINAR</button></div>`).join("")||"Sin publicaciones"}</div></section>
    <section class="panel admin-section admin-span"><div class="admin-section-head"><h3>Mercado</h3></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Jugador</th><th>Entrega</th><th>Pide</th><th>Estado</th><th></th></tr></thead><tbody>${(d.market||[]).map(x=>`<tr><td>${adminEsc(x.username)}</td><td>${n(x.offer_amount)} ${adminEsc(x.offer_resource)}</td><td>${n(x.want_amount)} ${adminEsc(x.want_resource)}</td><td>${adminEsc(x.status)}</td><td><button class="ghost-button admin-market-cancel" data-id="${x.id}" ${x.status!=="open"?"disabled":""}>CANCELAR</button></td></tr>`).join("")}</tbody></table></div></section>
  </div>`;
  document.querySelectorAll(".admin-chat-delete").forEach(b=>b.onclick=()=>adminConfirm("¿Borrar este mensaje?")&&adminAction({action:"chat:delete",target:b.dataset.id},"Mensaje retirado"));
  document.querySelectorAll(".admin-board-delete").forEach(b=>b.onclick=()=>adminConfirm("¿Eliminar esta publicación?")&&adminAction({action:"board:delete",target:b.dataset.id},"Publicación eliminada"));
  document.querySelectorAll(".admin-market-cancel").forEach(b=>b.onclick=()=>adminConfirm("¿Cancelar esta oferta?")&&adminAction({action:"market:cancel",target:b.dataset.id},"Oferta cancelada"));
}
async function adminEvents(content){
  const d=adminModerationCache||await adminApi("/moderation");
  content.innerHTML=`<section class="panel admin-section"><div class="admin-section-head"><div><span class="section-kicker">EVENTOS GLOBALES</span><h3>World Boss</h3></div></div>
    <div class="admin-list">${(d.boss||[]).map(b=>`<div class="admin-boss-card"><div><strong>${adminEsc(b.boss_name)}</strong><small>${adminEsc(b.event_id)} · ${adminEsc(b.status)} · ${adminDate(b.starts_at)} → ${adminDate(b.ends_at)}</small></div><div class="admin-form-grid"><label class="admin-field"><span>HP actual</span><input type="number" min="0" max="${b.max_hp}" value="${b.current_hp}" data-boss-hp="${b.event_id}"></label><label class="admin-field"><span>Estado</span><select data-boss-status="${b.event_id}"><option value="scheduled" ${b.status==="scheduled"?"selected":""}>scheduled</option><option value="active" ${b.status==="active"?"selected":""}>active</option><option value="defeated" ${b.status==="defeated"?"selected":""}>defeated</option><option value="ended" ${b.status==="ended"?"selected":""}>ended</option></select></label></div><button class="primary-action admin-boss-save" data-id="${b.event_id}">GUARDAR EVENTO</button></div>`).join("")||"No hay eventos."}</div>
  </section>`;
  document.querySelectorAll(".admin-boss-save").forEach(btn=>btn.onclick=()=>{const id=btn.dataset.id;return adminAction({action:"boss:update",target:id,current_hp:document.querySelector(`[data-boss-hp="${id}"]`).value,status:document.querySelector(`[data-boss-status="${id}"]`).value},"Evento actualizado")});
}
async function adminAudit(content){
  const d=adminModerationCache||await adminApi("/moderation");
  content.innerHTML=`<section class="panel admin-section"><div class="admin-section-head"><div><span class="section-kicker">TRAZABILIDAD</span><h3>Registro administrativo</h3></div></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Fecha</th><th>Actor</th><th>Acción</th><th>Objetivo</th><th>Payload</th></tr></thead><tbody>${(d.audit||[]).map(x=>`<tr><td>${adminDate(x.created_at)}</td><td>${adminEsc(x.actor_username)}</td><td>${adminEsc(x.action)}</td><td>${adminEsc(x.target_type||"")} · ${adminEsc(x.target_id||"")}</td><td><code>${adminEsc(JSON.stringify(x.payload||{}))}</code></td></tr>`).join("")}</tbody></table></div></section>`;
}
setInterval(()=>{if(!adminReady&&!adminDenied&&!$("#game-view")?.classList.contains("hidden"))probeAdmin()},2500);
globalThis.renderAdminPanel=renderAdminPanel;
globalThis.enforceMaintenance=enforceMaintenance;
