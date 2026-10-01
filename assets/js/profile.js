"use strict";

let ownProfileBadge=null;
let activeProfileName=null;

function profileAvatarUrl(path){
  if(!path)return "";
  return SUPABASE_URL+"/storage/v1/object/public/avatars/"+String(path).split("/").map(encodeURIComponent).join("/");
}
function profileSchoolName(code){
  return typeof schoolName==="function"?schoolName(code):(catalogs.schools.find(s=>s.code===code)?.name_es||code||"Escuela");
}
function profileDefaultPortraitUrl(profile){
  if(profile?.school_code==="verdant")return "assets/art/characters/verdante/verdante-level-1.png?v=0.2.11";
  if(profile?.school_code==="eradication")return "assets/art/characters/eradication/thanitos-level-1.png?v=0.2.35";
  return "";
}
function profileAvatarMarkup(profile,large=false){
  const cls=large?"profile-avatar profile-avatar-large":"profile-avatar";
  const src=profile?.avatar_path?profileAvatarUrl(profile.avatar_path):profileDefaultPortraitUrl(profile);
  if(src){
    return '<span class="'+cls+'"><img src="'+esc(src)+'" alt="Avatar de '+esc(profile?.mage_name||"Arconte")+'" /></span>';
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
  $("#modal-content").innerHTML='<div class="profile-loading">Abriendo identidad canónica de '+esc(activeProfileName)+'…</div>';
  show($("#modal"));
  try{
    let snapshot=typeof loadArchmageSnapshot==="function"
      ?await loadArchmageSnapshot(activeProfileName,{force:true})
      :{profile:await rpc("player_profile",{p_mage_name:activeProfileName})};
    let profile=snapshot.profile;
    if(profile.is_self){
      // Compatibility bridge for beta-era local choices. After importing, the unified
      // snapshot is fetched again and remains the only data rendered by the sheet.
      try{
        if(typeof combatHydrateProfile==="function")await combatHydrateProfile(profile);
        if(typeof lootHydrateProfile==="function")await lootHydrateProfile(profile);
        if(typeof loadArchmageSnapshot==="function"){
          snapshot=await loadArchmageSnapshot(activeProfileName,{force:true});
          profile=snapshot.profile;
        }
      }catch(e){console.warn("Legacy character migration check failed",e)}
    }
    const inbox=profile.is_self?await rpc("social_inbox"):null;
    if(profile.is_self)ownProfileBadge=profile;
    renderPlayerProfile(profile,inbox,snapshot);
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
function renderArchmageXpGuide(){
  const researchMin=archmageResearchXp("simple"),researchMax=archmageResearchXp("ultimate");
  return '<div class="archmage-xp-guide">'+
    '<div class="profile-section-title"><span>FUENTES DE EXPERIENCIA</span><small>progresión protegida contra farmeo</small></div>'+
    '<div class="archmage-xp-sources">'+
      '<div><strong>Conocimiento Arcano</strong><span>'+n(researchMin)+'–'+n(researchMax)+' XP</span><small>Solo al aprender un hechizo nuevo.</small></div>'+
      '<div><strong>Descubrimiento PvE</strong><span>'+n(ARCHMAGE_XP_RULES.pve_first_clear.xp)+' XP</span><small>Primera victoria de una expedición.</small></div>'+
      '<div><strong>Jefes PvE</strong><span>'+n(ARCHMAGE_XP_RULES.pve_boss.xp)+' XP</span><small>Primera derrota de cada jefe.</small></div>'+
      '<div><strong>PvP cualificado</strong><span>'+n(ARCHMAGE_XP_RULES.pvp_qualified.xp)+' + '+n(ARCHMAGE_XP_RULES.pvp_qualified.victoryBonus)+' XP</span><small>Combate válido + bonus por victoria.</small></div>'+
    '</div>'+
    '<p class="archmage-xp-rule-note">Construcción, economía y exploración territorial repetitiva no otorgarán XP. Las acciones repetibles tendrán límites diarios y controles contra rivales repetidos.</p>'+
  '</div>';
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
    '<div class="archmage-aptitude-label"><b>APTITUDES DEL ARCHIMAGO</b><span>Definen cómo se desarrolla en el mundo; no son las estadísticas de duelo.</span></div><div class="archmage-attributes">'+stats+'</div>'+
    renderArchmageXpGuide()+
    '</section>';
}

function archmageArtifactDisplayName(id){
  if(typeof artifactDef==="function"){
    const def=artifactDef(id);if(def?.name)return def.name;
  }
  return String(id||"Reliquia").split("_").map(x=>x?x[0].toUpperCase()+x.slice(1):"").join(" ");
}
function archmageArtifactCategoryLabel(code){
  if(typeof artifactCategoryLabel==="function")return artifactCategoryLabel(code);
  return ({minor:"Artefacto menor",school:"Reliquia de Escuela",cursed:"Artefacto maldito",unique:"Único mundial"})[code]||String(code||"Reliquia");
}
function renderCanonicalEquipment(snapshot,profile){
  if(profile.is_self&&typeof renderArchmageInventory==="function")return renderArchmageInventory(profile);
  const model=snapshot?.items;
  if(!model)return '<div class="player-sheet-remote-note"><b>EQUIPO</b><span>No hay datos de equipo disponibles.</span></div>';
  const labels={weapon:"ARMA",robe:"TÚNICA",amulet:"AMULETO",ring1:"ANILLO I",ring2:"ANILLO II",focus:"FOCO ARCANO",relic:"RELIQUIA"};
  const rows=Object.entries(labels).map(([slot,label])=>{
    const item=model.equipment?.[slot]||null;
    if(!item)return '<div class="canonical-equipment-slot empty"><small>'+label+'</small><strong>Vacío</strong><span>Sin objeto equipado</span></div>';
    const name=item.kind==="relic"?archmageArtifactDisplayName(item.artifact_id):(item.name||item.raw?.name||"Objeto equipado");
    const meta=item.kind==="relic"
      ?archmageArtifactCategoryLabel(item.category)
      :(String(item.rarity_label||item.rarity||"")+' · iP '+n(item.power||0));
    return '<div class="canonical-equipment-slot equipped '+(item.kind==="relic"?"relic":"")+'"><small>'+label+'</small><strong>'+esc(name)+'</strong><span>'+esc(meta)+'</span></div>';
  }).join("");
  return '<section class="canonical-equipment-public"><div class="canonical-equipment-grid">'+rows+'</div><p>La ficha pública muestra los siete slots activos. La mochila no equipada permanece privada.</p></section>';
}
function renderCanonicalArtifacts(snapshot){
  const data=snapshot?.artifacts||{},items=data.items||[];
  const equipped=new Set((data.equipped||[]).map(x=>String(x.id)));
  if(!items.length)return '<section class="canonical-relics"><div class="profile-section-title"><span>RELIQUIAS</span><small>0 vinculadas</small></div><div class="empty">Este Archimago todavía no custodia reliquias.</div></section>';
  return '<section class="canonical-relics"><div class="profile-section-title"><span>RELIQUIAS</span><small>'+n(data.count||items.length)+' vinculadas</small></div><div class="canonical-relic-grid">'+items.slice(0,12).map(x=>
    '<article class="canonical-relic '+(equipped.has(String(x.id))?'equipped':'')+'"><small>'+esc(archmageArtifactCategoryLabel(x.category))+'</small><strong>'+esc(archmageArtifactDisplayName(x.artifact_id))+'</strong><span>'+esc(x.source||"origen desconocido")+(equipped.has(String(x.id))?' · VINCULADA':'')+'</span></article>'
  ).join("")+'</div></section>';
}
function renderCanonicalTrajectory(snapshot){
  const t=snapshot?.trajectory||{},a=snapshot?.arena||{},renown=t.renown||{score:0,title:"Desconocido"};
  return '<section class="canonical-trajectory"><div class="profile-section-title"><span>TRAYECTORIA</span><small>historial del mismo Archimago</small></div>'+
    '<div class="canonical-renown"><div><small>RENOMBRE</small><strong>'+n(renown.score||0)+'</strong></div><span>'+esc(renown.title||"Desconocido")+' · indicador derivado, sin efecto mecánico</span></div>'+
    '<div class="canonical-trajectory-grid">'+
      '<div><small>RATING ARENA</small><strong>'+n(a.rating||1000)+'</strong></div>'+
      '<div><small>ARENA</small><strong>'+n(a.wins||0)+'V · '+n(a.losses||0)+'D</strong></div>'+
      '<div><small>RELIQUIAS</small><strong>'+n(t.artifact_count||0)+'</strong></div>'+
      '<div><small>EQUIPO</small><strong>'+n(snapshot?.inventory?.equipment_power||0)+' iP</strong></div>'+
      '<div><small>NIVEL MÁGICO</small><strong>'+n(t.spell_level||0)+'</strong></div>'+
      '<div><small>BATALLAS REG.</small><strong>'+(t.recorded_battles===null||t.recorded_battles===undefined?'—':n(t.recorded_battles))+'</strong></div>'+
    '</div></section>';
}
function renderCanonicalHistory(snapshot){
  const rows=snapshot?.history||[];
  const typeLabel={arena:"ARENA",artifact:"RELIQUIA",war:"GUERRA"};
  if(!rows.length)return '<section class="canonical-history"><div class="profile-section-title"><span>CRÓNICA PERSONAL</span><small>0 eventos</small></div><div class="empty">Aún no hay hechos registrados para esta ficha.</div></section>';
  return '<section class="canonical-history"><div class="profile-section-title"><span>CRÓNICA PERSONAL</span><small>'+n(rows.length)+' eventos recientes</small></div><div class="canonical-history-list">'+rows.map(x=>
    '<article class="canonical-history-row '+esc(x.outcome||"info")+'"><span>'+esc(typeLabel[x.type]||"EVENTO")+'</span><div><strong>'+esc(x.title||"Acontecimiento")+'</strong><p>'+esc(x.detail||"")+'</p></div><time>'+new Date(x.created_at).toLocaleString("es-ES")+'</time></article>'
  ).join("")+'</div></section>';
}

function renderPlayerProfile(profile,inbox=null,snapshot=null,target=null){
  const sheetHost=target||$("#modal-content");
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
  const playerLevel=Number(snapshot?.identity?.level||(typeof combatCurrentLevel==="function"?combatCurrentLevel(profile):(profile.archmage_level||1)));
  const combat=(typeof renderCombatIdentity==="function"?renderCombatIdentity(profile,snapshot?.combat?.derived||null):"");
  const equipment=renderCanonicalEquipment(snapshot,profile);
  const arena=snapshot?.arena||{};
  const relicCount=Number(snapshot?.artifacts?.count||0);
  const equipmentPower=Number(snapshot?.inventory?.equipment_power||0);
  const renown=Number(snapshot?.trajectory?.renown?.score||0);

  sheetHost.innerHTML=
    '<section class="character-sheet player-character-sheet canonical-archmage-sheet">'+
      '<div class="profile-hero player-sheet-hero">'+profileAvatarMarkup(profile,true)+'<div class="profile-identity"><span class="section-kicker">'+(profile.is_npc?"ARCHIMAGO NPC":"IDENTIDAD CANÓNICA")+'</span><h3>'+esc(profile.mage_name)+'</h3><div class="profile-subline">'+esc(profileSchoolName(profile.school_code))+' · Nivel '+n(playerLevel)+' '+(profile.is_npc?'<span class="tag npc-tag">NPC</span>':"")+' '+allianceBadge+'</div><p class="player-sheet-purpose">Una sola persona detrás del reino: progresión, combate, siete slots de equipo, reliquias, Arena y crónica comparten esta identidad persistente.</p></div><div class="canonical-authority"><small>FUENTE</small><strong>SERVIDOR</strong></div></div>'+
      '<div class="profile-stats player-sheet-kingdom-stats canonical-summary-stats">'+
        '<div><small>ASCENDENCIA DEL REINO</small><strong>'+n(profile.net_power)+'</strong></div>'+
        '<div><small>TIERRAS</small><strong>'+n(profile.land)+'</strong></div>'+
        '<div><small>RATING ARENA</small><strong>'+n(arena.rating||1000)+'</strong></div>'+
        '<div><small>RENOMBRE</small><strong>'+n(renown)+'</strong></div>'+
        '<div><small>RELIQUIAS</small><strong>'+n(relicCount)+'</strong></div>'+
        '<div><small>ESTADO</small><strong>'+esc(profile.status)+'</strong></div>'+
      '</div>'+
      '<nav class="player-sheet-nav canonical-sheet-nav" aria-label="Secciones de la ficha"><span>IDENTIDAD</span><span>APTITUDES</span><span>COMBATE</span><span>EQUIPO</span><span>RELIQUIAS</span><span>CRÓNICA</span></nav>'+
      '<div class="player-sheet-development"><div class="player-sheet-block-title"><b>PROGRESIÓN Y APTITUDES</b><small>Nivel, experiencia y desarrollo personal del Archimago</small></div>'+renderArchmageProgression(profile)+'</div>'+
      '<div class="player-sheet-layout">'+
        '<div class="player-sheet-main"><div class="player-sheet-block-title"><b>CARACTERÍSTICAS DE COMBATE</b><small>La forma en que este mismo Archimago pelea</small></div>'+combat+'</div>'+
        '<div class="player-sheet-side"><div class="player-sheet-block-title"><b>EQUIPO'+(profile.is_self?' E INVENTARIO':' ACTIVO')+'</b><small>'+(profile.is_self?'Cámara privada y objetos equipados':'Sólo equipamiento público')+'</small></div>'+equipment+'</div>'+
      '</div>'+
      renderCanonicalArtifacts(snapshot)+
      renderCanonicalTrajectory(snapshot)+
      renderCanonicalHistory(snapshot)+
      '<div class="profile-bio-block"><div class="profile-section-title"><span>BIOGRAFÍA</span>'+(profile.is_self?'<small>máx. 500 caracteres</small>':"")+'</div>'+bioBlock+'</div>'+
      actions+
      (profile.is_npc?'<div class="profile-system-note">Este dominio está controlado por ARCANUM. Las acciones sociales están desactivadas para NPC.</div>':"")+
      (profile.is_self?renderOwnSocial(profile,inbox):"")+
      '<div id="profile-social-detail"></div>'+
    '</section>';
  wireProfileSheet(profile);
}
async function renderCharacterPage(){
  const host=$("#view-host");
  const mageName=String(realmState?.realm?.mage_name||ownProfileBadge?.mage_name||"").trim();
  if(!host)return;
  if(!mageName){
    host.innerHTML='<div class="view-header"><div><span class="section-kicker">ARCHIMAGO</span><h2>Personaje</h2><p>No se ha podido identificar a tu Archimago.</p></div></div>';
    return;
  }
  activeProfileName=mageName;
  host.innerHTML='<div class="profile-loading character-page-loading">Abriendo ficha canónica de '+esc(mageName)+'…</div>';
  try{
    let snapshot=typeof loadArchmageSnapshot==="function"
      ?await loadArchmageSnapshot(mageName,{force:true})
      :{profile:await rpc("player_profile",{p_mage_name:mageName})};
    let profile=snapshot.profile;
    try{
      if(typeof combatHydrateProfile==="function")await combatHydrateProfile(profile);
      if(typeof lootHydrateProfile==="function")await lootHydrateProfile(profile);
      if(typeof loadArchmageSnapshot==="function"){
        snapshot=await loadArchmageSnapshot(mageName,{force:true});
        profile=snapshot.profile;
      }
    }catch(e){console.warn("Character page migration check failed",e)}
    const inbox=await rpc("social_inbox");
    ownProfileBadge=profile;
    renderOwnProfileBadge();
    renderPlayerProfile(profile,inbox,snapshot,host);
    host.querySelector(".canonical-archmage-sheet")?.classList.add("character-page-sheet");
  }catch(e){
    host.innerHTML='<div class="view-header"><div><span class="section-kicker">ARCHIMAGO</span><h2>Error de personaje</h2><p>'+esc(humanError(e))+'</p></div></div>';
  }
}
globalThis.renderCharacterPage=renderCharacterPage;

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
  if(typeof wireInventoryPanel==="function")wireInventoryPanel(profile);
  if(typeof wireCombatEvolution==="function")wireCombatEvolution(profile);
  document.querySelectorAll("[data-archmage-attribute]").forEach(b=>b.addEventListener("click",()=>spendArchmageAttribute(b.dataset.archmageAttribute,profile)));
  $("#profile-save-bio")?.addEventListener("click",()=>saveOwnProfile(profile));
  $("#profile-avatar-file")?.addEventListener("change",e=>startProfileAvatarCrop(e.target.files?.[0],profile));
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

function startProfileAvatarCrop(file,profile){
  if(!file)return;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)){toast("Usa una imagen JPG, PNG o WebP.","error");return;}
  if(file.size>2*1024*1024){toast("La imagen no puede superar 2 MB.","error");return;}
  const url=URL.createObjectURL(file);
  const overlay=document.createElement("div");
  overlay.className="avatar-crop-overlay";
  overlay.innerHTML=
    '<div class="avatar-crop-dialog" role="dialog" aria-modal="true" aria-label="Ajustar imagen de perfil">'+
      '<div class="avatar-crop-head"><div><span class="section-kicker">IMAGEN DE PERFIL</span><h3>Ajusta el encuadre</h3></div><button class="avatar-crop-close" type="button" aria-label="Cerrar">×</button></div>'+
      '<div class="avatar-crop-stage"><div class="avatar-crop-frame"><img alt="Vista previa del avatar" draggable="false"></div><div class="avatar-crop-hint">El rombo muestra exactamente el encuadre final · arrastra para centrar</div></div>'+
      '<div class="avatar-crop-controls"><label><span>ZOOM</span><input class="avatar-crop-zoom" type="range" min="1" max="3" step="0.01" value="1"></label></div>'+
      '<div class="avatar-crop-actions"><button class="profile-action secondary avatar-crop-cancel" type="button">CANCELAR</button><button class="profile-action avatar-crop-save" type="button">USAR ESTA IMAGEN</button></div>'+
    '</div>';
  document.body.appendChild(overlay);
  const img=overlay.querySelector("img");
  const frame=overlay.querySelector(".avatar-crop-frame");
  const zoom=overlay.querySelector(".avatar-crop-zoom");
  let naturalW=1,naturalH=1,baseScale=1,scale=1,offsetX=0,offsetY=0;
  let dragging=false,startX=0,startY=0,startOffsetX=0,startOffsetY=0;

  function frameSize(){return frame.getBoundingClientRect().width||320;}
  function clampOffsets(){
    const size=frameSize();
    const w=naturalW*scale,h=naturalH*scale;
    const limX=Math.max(0,(w-size)/2),limY=Math.max(0,(h-size)/2);
    offsetX=Math.max(-limX,Math.min(limX,offsetX));
    offsetY=Math.max(-limY,Math.min(limY,offsetY));
  }
  function paint(){
    clampOffsets();
    img.style.width=(naturalW*scale)+"px";
    img.style.height=(naturalH*scale)+"px";
    img.style.transform="translate(calc(-50% + "+offsetX+"px),calc(-50% + "+offsetY+"px))";
  }
  function resetScale(){
    const size=frameSize();
    baseScale=Math.max(size/naturalW,size/naturalH);
    scale=baseScale*Number(zoom.value||1);
    paint();
  }
  function close(){
    URL.revokeObjectURL(url);
    overlay.remove();
  }
  img.addEventListener("load",()=>{
    naturalW=img.naturalWidth||1;
    naturalH=img.naturalHeight||1;
    resetScale();
  },{once:true});
  img.src=url;
  zoom.addEventListener("input",()=>{scale=baseScale*Number(zoom.value||1);paint();});
  frame.addEventListener("pointerdown",e=>{
    dragging=true;startX=e.clientX;startY=e.clientY;startOffsetX=offsetX;startOffsetY=offsetY;
    frame.setPointerCapture?.(e.pointerId);
    frame.classList.add("dragging");
  });
  frame.addEventListener("pointermove",e=>{
    if(!dragging)return;
    offsetX=startOffsetX+(e.clientX-startX);
    offsetY=startOffsetY+(e.clientY-startY);
    paint();
  });
  const stopDrag=e=>{dragging=false;frame.classList.remove("dragging");try{frame.releasePointerCapture?.(e.pointerId);}catch{}};
  frame.addEventListener("pointerup",stopDrag);
  frame.addEventListener("pointercancel",stopDrag);
  overlay.querySelector(".avatar-crop-close").addEventListener("click",close);
  overlay.querySelector(".avatar-crop-cancel").addEventListener("click",close);
  overlay.addEventListener("click",e=>{if(e.target===overlay)close();});
  overlay.querySelector(".avatar-crop-save").addEventListener("click",async()=>{
    const btn=overlay.querySelector(".avatar-crop-save");
    btn.disabled=true;btn.textContent="PROCESANDO…";
    try{
      const out=512;
      const canvas=document.createElement("canvas");
      canvas.width=out;canvas.height=out;
      const ctx=canvas.getContext("2d");
      const size=frameSize();
      const factor=out/size;
      const drawW=naturalW*scale*factor,drawH=naturalH*scale*factor;
      const dx=(out-drawW)/2+offsetX*factor;
      const dy=(out-drawH)/2+offsetY*factor;
      ctx.drawImage(img,dx,dy,drawW,drawH);
      const mime=file.type==="image/png"?"image/png":"image/webp";
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("No se pudo preparar la imagen.")),mime,.9));
      const ext=mime==="image/png"?"png":"webp";
      const cropped=new File([blob],"avatar-recortado."+ext,{type:mime});
      close();
      await uploadProfileAvatar(cropped,profile);
    }catch(err){
      toast(humanError(err),"error");
      btn.disabled=false;btn.textContent="USAR ESTA IMAGEN";
    }
  });
  window.addEventListener("resize",resetScale,{once:true});
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
