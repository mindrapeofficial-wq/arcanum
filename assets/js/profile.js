"use strict";

let ownProfileBadge=null;
let activeProfileName=null;

function profileAvatarUrl(path){
  if(!path)return "";
  return SUPABASE_URL+"/storage/v1/object/public/avatars/"+String(path).split("/").map(encodeURIComponent).join("/");
}
function profileSchoolName(code){
  return catalogs.schools.find(s=>s.code===code)?.name_es||code||"Escuela";
}
function profileDefaultPortraitUrl(profile){
  if(profile?.school_code==="verdant")return "assets/art/characters/verdante/verdante-level-1.png?v=0.2.11";
  return "";
}
function profileAvatarMarkup(profile,large=false){
  const cls=large?"profile-avatar profile-avatar-large":"profile-avatar";
  const src=profile?.avatar_path?profileAvatarUrl(profile.avatar_path):profileDefaultPortraitUrl(profile);
  if(src){
    return '<span class="'+cls+'"><img src="'+esc(src)+'" alt="Avatar de '+esc(profile?.mage_name||"Archimago")+'" /></span>';
  }
  return '<span class="'+cls+' profile-avatar-fallback '+esc(profile?.school_code||"")+'">'+(symbols[profile?.school_code]||"✦")+'</span>';
}
function renderOwnProfileBadge(){
  const sigil=$("#mage-sigil");
  if(!sigil||!realmState?.realm)return;
  const schoolName=profileSchoolName(realmState.realm.school_code);
  const progression=archmageProgressionFromProfile(ownProfileBadge);
  const schoolLabel=$("#mage-school");
  if(schoolLabel)schoolLabel.textContent=progression?schoolName+" · Nivel "+progression.level:schoolName;
  const src=ownProfileBadge?.avatar_path?profileAvatarUrl(ownProfileBadge.avatar_path):profileDefaultPortraitUrl({school_code:realmState.realm.school_code});
  if(src){
    sigil.innerHTML='<img src="'+esc(src)+'" alt="" />';
    sigil.classList.add("has-avatar");
  }else{
    sigil.textContent=symbols[realmState.realm.school_code]||"✦";
    sigil.classList.remove("has-avatar");
  }
}
async function refreshOwnProfileBadge(force=false){
  if(!realmState?.realm)return;
  if(ownProfileBadge&&!force){renderOwnProfileBadge();return;}
  try{
    ownProfileBadge=await rpc("player_profile",{p_mage_name:realmState.realm.mage_name});
    renderOwnProfileBadge();
  }catch{}
}
async function openPlayerProfile(mageName){
  activeProfileName=String(mageName||"").trim();
  if(!activeProfileName)return;
  $("#modal-content").innerHTML='<div class="profile-loading">Abriendo ficha de '+esc(activeProfileName)+'…</div>';
  show($("#modal"));
  try{
    const profile=await rpc("player_profile",{p_mage_name:activeProfileName});
    const inbox=profile.is_self?await rpc("social_inbox"):null;
    if(profile.is_self)ownProfileBadge=profile;
    renderPlayerProfile(profile,inbox);
  }catch(e){
    $("#modal-content").innerHTML='<div class="empty">'+esc(humanError(e))+'</div>';
  }
}
function friendshipActions(profile){
  const f=profile.friendship||{status:"none"};
  if(f.status==="accepted")return '<button class="profile-action secondary" data-profile-friend-remove="'+esc(profile.mage_name)+'">✓ AMIGOS</button>';
  if(f.status==="pending"&&f.direction==="incoming"){
    return '<button class="profile-action" data-profile-friend-accept="'+esc(profile.mage_name)+'">ACEPTAR AMISTAD</button><button class="profile-action secondary" data-profile-friend-reject="'+esc(profile.mage_name)+'">RECHAZAR</button>';
  }
  if(f.status==="pending")return '<button class="profile-action secondary" data-profile-friend-remove="'+esc(profile.mage_name)+'">SOLICITUD ENVIADA</button>';
  return '<button class="profile-action" data-profile-friend-add="'+esc(profile.mage_name)+'">＋ AGREGAR AMIGO</button>';
}
function renderArchmageProgression(profile){
  const progression=archmageProgressionFromProfile(profile);
  if(!progression)return "";
  const canSpend=Boolean(profile.is_self)&&progression.attributePoints>0;
  const identity=archmageIdentityFromProgression(progression);
  const stats=ARCHMAGE_STAT_KEYS.map(key=>{
    const meta=ARCHMAGE_STAT_META[key];
    const canUpgrade=canSpend&&progression.stats[key]<ARCHMAGE_ATTRIBUTE_CAP;
    const upgrade=canUpgrade?'<button class="archmage-attribute-upgrade" type="button" data-archmage-attribute="'+key+'" aria-label="Subir '+esc(meta.label)+'" title="Invertir 1 punto en '+esc(meta.label)+'">＋</button>':"";
    return '<div class="archmage-attribute" data-archmage-stat="'+key+'"><small>'+esc(meta.label)+'</small><div class="archmage-attribute-value"><strong>'+n(progression.stats[key])+'</strong>'+upgrade+'</div><span>'+esc(meta.description)+'</span></div>';
  }).join("");
  const pct=Math.round(progression.xpRatio*100);
  const pointsLabel=progression.attributePoints===1?"1 punto disponible":n(progression.attributePoints)+" puntos disponibles";
  const xpText=progression.level>=ARCHMAGE_LEVEL_CAP?"NIVEL MÁXIMO":n(progression.xp)+" / "+n(progression.xpNext);
  return '<section class="archmage-progression"><div class="profile-section-title"><span>PROGRESIÓN DEL ARCHIMAGO</span><small>'+pointsLabel+'</small></div>'+
    '<div class="archmage-level-row"><div><small>NIVEL</small><strong>'+n(progression.level)+'</strong></div><div class="archmage-xp"><div><span>EXPERIENCIA</span><b>'+xpText+'</b></div><div class="archmage-xp-track"><i style="width:'+pct+'%"></i></div></div></div>'+
    (identity?'<div class="archmage-identity-card" data-archmage-identity="'+esc(identity.key)+'"><small>PERFIL ARCANO</small><strong>'+esc(identity.title)+'</strong><span>'+esc(identity.description)+'</span><em>Identidad narrativa · sin bonificación mecánica por ahora.</em></div>':"")+
    '<div class="archmage-attributes">'+stats+'</div></section>';
}

function renderPlayerProfile(profile,inbox=null){
  const alliance=profile.alliance;
  const allianceBadge=alliance?'<span class="profile-alliance-badge">['+esc(alliance.tag)+'] '+esc(alliance.name)+'</span>':"";
  let actions="";
  if(!profile.is_self&&!profile.is_npc){
    const friendshipAccepted=profile.friendship?.status==="accepted";
    actions='<div class="profile-actions">'+friendshipActions(profile)+
      (friendshipAccepted
        ?'<button class="profile-action" data-direct-chat="'+esc(profile.mage_name)+'">✉ CHAT PRIVADO</button>'
        :'<span class="profile-chat-locked">CHAT PRIVADO · SE ACTIVA AL ACEPTAR LA AMISTAD</span>')+
      (profile.can_invite_to_alliance?'<button class="profile-action" data-profile-alliance-invite="'+esc(profile.mage_name)+'">♜ INVITAR A '+esc(profile.my_alliance?.tag||"ALIANZA")+'</button>':"")+
      '</div>';
  }
  let bioBlock="";
  if(profile.is_self){
    bioBlock='<textarea id="profile-bio-input" maxlength="500" placeholder="Escribe la historia, carácter o ambiciones de tu Archimago…">'+esc(profile.bio||"")+'</textarea>'+
      '<div class="profile-edit-row"><label class="profile-action secondary profile-file-label">CAMBIAR IMAGEN<input id="profile-avatar-file" type="file" accept="image/png,image/jpeg,image/webp" hidden /></label><button class="profile-action" id="profile-save-bio">GUARDAR FICHA</button></div>'+
      '<small class="profile-upload-note">Avatar: JPG, PNG o WebP · máximo 2 MB.</small>';
  }else{
    bioBlock='<p>'+(profile.bio?esc(profile.bio):'<span class="muted">Este Archimago aún no ha escrito su biografía.</span>')+'</p>';
  }
  $("#modal-content").innerHTML=
    '<section class="character-sheet">'+
      '<div class="profile-hero">'+profileAvatarMarkup(profile,true)+'<div class="profile-identity"><span class="section-kicker">'+(profile.is_npc?"ARCHIMAGO NPC":"FICHA DE ARCHIMAGO")+'</span><h3>'+esc(profile.mage_name)+'</h3><div class="profile-subline">'+esc(profileSchoolName(profile.school_code))+' '+(profile.is_npc?'<span class="tag npc-tag">NPC</span>':"")+' '+allianceBadge+'</div></div></div>'+
      '<div class="profile-stats"><div><small>PODER NETO</small><strong>'+n(profile.net_power)+'</strong></div><div><small>TIERRAS</small><strong>'+n(profile.land)+'</strong></div><div><small>NIVEL MÁGICO</small><strong>'+n(profile.spell_level)+'</strong></div><div><small>ESTADO</small><strong>'+esc(profile.status)+'</strong></div></div>'+
      renderArchmageProgression(profile)+
      '<div class="profile-bio-block"><div class="profile-section-title"><span>BIOGRAFÍA</span>'+(profile.is_self?'<small>máx. 500 caracteres</small>':"")+'</div>'+bioBlock+'</div>'+
      actions+
      (profile.is_npc?'<div class="profile-system-note">Este reino está controlado por ARCANUM. Las acciones sociales están desactivadas para NPC.</div>':"")+
      (profile.is_self?renderOwnSocial(profile,inbox):"")+
      '<div id="profile-social-detail"></div>'+
    '</section>';
  wireProfileSheet(profile);
}
function renderOwnSocial(profile,inbox){
  const friends=inbox?.friends||[];
  const requests=inbox?.friend_requests||[];
  const invites=inbox?.alliance_invites||[];
  const alliance=profile.alliance;
  const requestHtml=requests.length?'<div class="profile-request-list">'+requests.map(x=>
    '<div class="profile-request"><button class="player-link" data-profile="'+esc(x.mage_name)+'">'+esc(x.mage_name)+'</button><div><button data-profile-friend-accept="'+esc(x.mage_name)+'">ACEPTAR</button><button data-profile-friend-reject="'+esc(x.mage_name)+'">RECHAZAR</button></div></div>'
  ).join("")+'</div>':"";
  const friendHtml=friends.length?friends.map(x=>
    '<button class="profile-friend-chip player-link" data-profile="'+esc(x.mage_name)+'"><span class="school-dot '+esc(x.school_code)+'"></span>'+esc(x.mage_name)+'</button>'
  ).join(""):'<span class="muted">Aún no has agregado amigos.</span>';
  let allianceHtml="";
  if(alliance){
    allianceHtml='<div class="alliance-current"><strong>['+esc(alliance.tag)+'] '+esc(alliance.name)+'</strong><small>Rango: '+esc(alliance.role)+'</small></div>';
  }else{
    allianceHtml='<form id="profile-alliance-create" class="alliance-create-form"><p class="muted">No perteneces a ninguna alianza. Puedes fundar una desde aquí.</p><input id="alliance-name" maxlength="40" placeholder="Nombre de la alianza" required /><input id="alliance-tag" maxlength="6" placeholder="TAG" required /><button class="profile-action" type="submit">FUNDAR ALIANZA</button></form>';
  }
  if(invites.length){
    allianceHtml+='<div class="profile-invites"><small>INVITACIONES PENDIENTES</small>'+invites.map(x=>
      '<div class="profile-request"><span><b>['+esc(x.tag)+']</b> '+esc(x.alliance_name)+'</span><div><button data-alliance-accept="'+esc(x.alliance_id)+'">ACEPTAR</button><button data-alliance-reject="'+esc(x.alliance_id)+'">RECHAZAR</button></div></div>'
    ).join("")+'</div>';
  }
  return '<div class="profile-own-grid"><section class="profile-panel"><div class="profile-section-title"><span>AMISTADES</span><small>'+friends.length+'</small></div>'+requestHtml+'<div class="profile-friend-list">'+friendHtml+'</div></section><section class="profile-panel"><div class="profile-section-title"><span>ALIANZA</span></div>'+allianceHtml+'</section></div>';
}
function wireProfileSheet(profile){
  document.querySelectorAll("[data-archmage-attribute]").forEach(b=>b.addEventListener("click",()=>spendArchmageAttribute(b.dataset.archmageAttribute,profile)));
  $("#profile-save-bio")?.addEventListener("click",()=>saveOwnProfile(profile));
  $("#profile-avatar-file")?.addEventListener("change",e=>uploadProfileAvatar(e.target.files?.[0],profile));
  $$("[data-profile-friend-add]").forEach(b=>b.addEventListener("click",()=>profileFriendRequest(b.dataset.profileFriendAdd)));
  $$("[data-profile-friend-accept]").forEach(b=>b.addEventListener("click",()=>profileFriendRespond(b.dataset.profileFriendAccept,true)));
  $$("[data-profile-friend-reject]").forEach(b=>b.addEventListener("click",()=>profileFriendRespond(b.dataset.profileFriendReject,false)));
  $$("[data-profile-friend-remove]").forEach(b=>b.addEventListener("click",()=>profileFriendRemove(b.dataset.profileFriendRemove)));
  $$("[data-profile-alliance-invite]").forEach(b=>b.addEventListener("click",()=>profileAllianceInvite(b.dataset.profileAllianceInvite)));
  $$("[data-alliance-accept]").forEach(b=>b.addEventListener("click",()=>profileAllianceRespond(b.dataset.allianceAccept,true)));
  $$("[data-alliance-reject]").forEach(b=>b.addEventListener("click",()=>profileAllianceRespond(b.dataset.allianceReject,false)));
  $("#profile-alliance-create")?.addEventListener("submit",createProfileAlliance);
}
async function spendArchmageAttribute(key,profile){
  const meta=ARCHMAGE_STAT_META[key];
  if(!profile?.is_self||!meta)return;
  if(!confirm("¿Invertir 1 punto en "+meta.label+"?"))return;
  const buttons=[...document.querySelectorAll("[data-archmage-attribute]")];
  buttons.forEach(b=>b.disabled=true);
  try{
    const result=await rpc("spend_archmage_attribute",{p_attribute:key});
    toast(meta.label+" ha aumentado a "+n(result[key])+".","success");
    await openPlayerProfile(profile.mage_name);
  }catch(e){
    toast(humanError(e),"error");
    buttons.forEach(b=>b.disabled=false);
  }
}

async function saveOwnProfile(profile){
  const bio=$("#profile-bio-input")?.value||"";
  const btn=$("#profile-save-bio"),old=btn?.textContent;
  if(btn){btn.disabled=true;btn.textContent="GUARDANDO…";}
  try{
    await rpc("update_my_profile",{p_bio:bio,p_avatar_path:profile.avatar_path||null});
    toast("Ficha de personaje actualizada.","success");
    await openPlayerProfile(profile.mage_name);
    await refreshOwnProfileBadge(true);
  }catch(e){toast(humanError(e),"error");}
  finally{if(btn){btn.disabled=false;btn.textContent=old;}}
}
async function uploadProfileAvatar(file,profile){
  if(!file)return;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)){toast("Usa una imagen JPG, PNG o WebP.","error");return;}
  if(file.size>2*1024*1024){toast("La imagen no puede superar 2 MB.","error");return;}
  const session=await validSession();
  if(!session?.access_token||!session?.user?.id){toast("Tu sesión ha caducado.","error");return;}
  const ext=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp"})[file.type];
  const path=session.user.id+"/"+Date.now()+"-avatar."+ext;
  try{
    const res=await fetch(SUPABASE_URL+"/storage/v1/object/avatars/"+path,{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+session.access_token,"Content-Type":file.type,"cache-control":"3600"},body:file});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data?.message||data?.error||"No se pudo subir el avatar.");
    const bio=$("#profile-bio-input")?.value||profile.bio||"";
    await rpc("update_my_profile",{p_bio:bio,p_avatar_path:path});
    toast("Imagen de perfil actualizada.","success");
    await openPlayerProfile(profile.mage_name);
    await refreshOwnProfileBadge(true);
  }catch(e){toast(humanError(e),"error");}
}
async function profileFriendRequest(name){
  try{
    await rpc("friend_request",{p_mage_name:name});
    toast("Solicitud de amistad enviada. El chat privado se habilitará cuando la acepte.","success");
    if(typeof refreshSidebarPresence==="function")refreshSidebarPresence();
    await openPlayerProfile(name);
  }catch(e){toast(humanError(e),"error");}
}
async function profileFriendRespond(name,accept){
  try{
    await rpc("friend_respond",{p_mage_name:name,p_accept:accept});
    toast(accept?"Amistad aceptada. Ya podéis abrir un chat privado.":"Solicitud rechazada.","success");
    if(typeof refreshSidebarPresence==="function")refreshSidebarPresence();
    await openPlayerProfile(name);
  }catch(e){toast(humanError(e),"error");}
}
async function profileFriendRemove(name){
  if(!confirm("¿Quitar o cancelar esta relación de amistad?"))return;
  try{
    await rpc("friend_remove",{p_mage_name:name});
    toast("Amistad actualizada.","success");
    if(typeof refreshSidebarPresence==="function")refreshSidebarPresence();
    if(typeof directChatName!=="undefined"&&directChatName===name&&typeof closeDirectChatWindow==="function")closeDirectChatWindow();
    await openPlayerProfile(name);
  }catch(e){toast(humanError(e),"error");}
}
async function openProfileConversation(name){
  const host=$("#profile-social-detail");if(!host)return;
  host.innerHTML='<div class="profile-loading">Abriendo conversación…</div>';
  try{
    const data=await rpc("conversation_with",{p_mage_name:name,p_limit:60});
    const messages=data.messages||[];
    const rows=messages.length?messages.map(m=>'<div class="dm-message '+(m.mine?"mine":"theirs")+'"><p>'+esc(m.body)+'</p><small>'+new Date(m.created_at).toLocaleString("es-ES")+'</small></div>').join(""):'<div class="empty">No hay mensajes todavía.</div>';
    host.innerHTML='<section class="profile-conversation"><div class="profile-section-title"><span>MENSAJES CON '+esc(name)+'</span></div><div class="dm-messages">'+rows+'</div><form id="dm-form" class="dm-form"><textarea id="dm-body" maxlength="1000" placeholder="Escribe un mensaje privado…" required></textarea><button class="profile-action" type="submit">ENVIAR</button></form></section>';
    $("#dm-form").addEventListener("submit",e=>sendProfileMessage(e,name));
    const list=$(".dm-messages");if(list)list.scrollTop=list.scrollHeight;
  }catch(e){host.innerHTML='<div class="empty">'+esc(humanError(e))+'</div>';}
}
async function sendProfileMessage(e,name){
  e.preventDefault();
  const body=$("#dm-body")?.value.trim();if(!body)return;
  const btn=e.currentTarget.querySelector("button");btn.disabled=true;
  try{await rpc("send_direct_message",{p_mage_name:name,p_body:body});await openProfileConversation(name);}catch(err){toast(humanError(err),"error");}finally{btn.disabled=false;}
}
async function createProfileAlliance(e){
  e.preventDefault();
  const name=$("#alliance-name").value.trim(),tag=$("#alliance-tag").value.trim().toUpperCase();
  try{await rpc("create_alliance",{p_name:name,p_tag:tag});toast("Alianza fundada.","success");await openPlayerProfile(realmState.realm.mage_name);}catch(err){toast(humanError(err),"error");}
}
async function profileAllianceInvite(name){
  try{await rpc("invite_to_alliance",{p_mage_name:name});toast(name+" ha recibido la invitación.","success");await openPlayerProfile(name);}catch(e){toast(humanError(e),"error");}
}
async function profileAllianceRespond(id,accept){
  try{await rpc("respond_alliance_invite",{p_alliance_id:id,p_accept:accept});toast(accept?"Te has unido a la alianza.":"Invitación rechazada.","success");await openPlayerProfile(realmState.realm.mage_name);}catch(e){toast(humanError(e),"error");}
}
