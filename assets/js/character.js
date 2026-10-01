"use strict";

function characterProgressionData(profile){
  try{return typeof archmageProgressionFromProfile==="function"?archmageProgressionFromProfile(profile):null}catch{return null}
}
function characterCombatData(profile,snapshot){
  const combat=typeof getCombatProfile==="function"?getCombatProfile(profile):null;
  const derived=snapshot?.combat?.derived||(typeof combatDerived==="function"?combatDerived(profile):null);
  return {combat,derived};
}
function characterIdentityTitle(progression){
  try{
    const identity=progression&&typeof archmageIdentityFromProgression==="function"?archmageIdentityFromProgression(progression):null;
    return identity?.title||"Archimago";
  }catch{return "Archimago"}
}
function characterAptitudesMarkup(profile,progression){
  if(!progression)return '<div class="character-empty">La progresión todavía no está disponible.</div>';
  const keys=typeof ARCHMAGE_STAT_KEYS!=="undefined"?ARCHMAGE_STAT_KEYS:[];
  const cap=typeof ARCHMAGE_ATTRIBUTE_CAP!=="undefined"?ARCHMAGE_ATTRIBUTE_CAP:999;
  const canSpend=Boolean(profile?.is_self)&&Number(progression.attributePoints||0)>0;
  return keys.map(key=>{
    const meta=ARCHMAGE_STAT_META?.[key]||{label:key,description:""};
    const value=Number(progression.stats?.[key]||0);
    const upgrade=canSpend&&value<cap
      ?'<button class="character-stat-plus" type="button" data-archmage-attribute="'+esc(key)+'" title="Invertir 1 punto en '+esc(meta.label)+'">＋</button>'
      :"";
    return '<article class="character-aptitude"><small>'+esc(meta.label)+'</small><div><strong>'+n(value)+'</strong>'+upgrade+'</div><p>'+esc(meta.description||"")+'</p></article>';
  }).join("");
}
function characterCombatStatsMarkup(combat){
  if(!combat?.stats)return '<div class="character-empty">No hay estadísticas de combate disponibles.</div>';
  return Object.entries(combat.stats).map(([key,value])=>{
    const label=(typeof COMBAT_STAT_META!=="undefined"&&COMBAT_STAT_META[key])?COMBAT_STAT_META[key]:key;
    return '<div class="character-combat-stat"><small>'+esc(label)+'</small><strong>'+n(value)+'</strong></div>';
  }).join("");
}
function characterAbilitiesMarkup(combat){
  const abilities=combat?.abilities||[];
  if(!abilities.length)return '<div class="character-empty">Aún no hay habilidades aprendidas.</div>';
  return abilities.map(a=>'<article class="character-ability"><strong>'+esc(a.name||"Habilidad")+'</strong><p>'+esc(a.desc||"")+'</p></article>').join("");
}
function characterTraitsMarkup(combat){
  const traits=[combat?.trait].concat(combat?.bonusTraits||[]).filter(Boolean);
  if(!traits.length)return '<span class="muted">Sin rasgos.</span>';
  return traits.map(t=>'<span class="character-trait"><b>'+esc(t.name||"Rasgo")+'</b><small>'+esc(t.desc||"")+'</small></span>').join("");
}
function characterVital(label,value,detail=""){
  return '<article class="character-vital"><small>'+esc(label)+'</small><strong>'+esc(String(value))+'</strong>'+(detail?'<span>'+esc(detail)+'</span>':"")+'</article>';
}
function characterEquipmentPreview(snapshot){
  const model=snapshot?.items||{};
  const slots=[
    ["weapon","ARMA"],["robe","TÚNICA"],["amulet","AMULETO"],["ring1","ANILLO I"],
    ["ring2","ANILLO II"],["focus","FOCO"],["relic","RELIQUIA"]
  ];
  return slots.map(([key,label])=>{
    const item=model.equipment?.[key]||null;
    const name=item
      ?(item.kind==="relic"&&typeof archmageArtifactDisplayName==="function"
          ?archmageArtifactDisplayName(item.artifact_id)
          :(item.name||item.raw?.name||"Objeto equipado"))
      :"Vacío";
    return '<div class="character-equip-slot '+(item?"filled":"empty")+'"><small>'+label+'</small><strong>'+esc(name)+'</strong></div>';
  }).join("");
}
function renderCharacterPageLayout(profile,snapshot){
  const progression=characterProgressionData(profile);
  const {combat,derived}=characterCombatData(profile,snapshot);
  const level=Number(progression?.level||snapshot?.identity?.level||profile?.archmage_level||1);
  const xp=Number(progression?.xp||0),xpNext=Number(progression?.xpNext||0);
  const xpPct=level>=100?100:Math.max(0,Math.min(100,Math.round(Number(progression?.xpRatio||0)*100)));
  const arena=snapshot?.arena||{};
  const portrait=profileAvatarMarkup(profile,true);
  const school=profileSchoolName(profile.school_code);
  const weapon=combat?.weapon||{};
  const equipmentPower=Number(snapshot?.inventory?.equipment_power||derived?.equipmentPower||0);
  const relicCount=Number(snapshot?.artifacts?.count||0);
  const identityTitle=characterIdentityTitle(progression);
  const evolution=typeof renderCombatEvolution==="function"?renderCombatEvolution(profile):"";
  const inventory=typeof renderArchmageInventory==="function"?renderArchmageInventory(profile):'<div class="character-empty">Inventario no disponible.</div>';

  return '<section class="character-page">'+
    '<header class="character-page-header"><div><span class="section-kicker">ARCHIMAGO</span><h2>Personaje</h2><p>Tu Archimago es una entidad distinta de tu Dominio. Aquí viven su progresión personal, combate, habilidades, equipo e inventario.</p></div></header>'+
    '<section class="character-hero">'+
      '<div class="character-portrait-wrap">'+portrait+'<label class="character-portrait-action">CAMBIAR RETRATO<input id="character-avatar-file" type="file" accept="image/png,image/jpeg,image/webp" hidden></label></div>'+
      '<div class="character-identity">'+
        '<span class="character-school">'+esc(school)+'</span>'+
        '<h1>'+esc(profile.mage_name)+'</h1>'+
        '<strong>'+esc(identityTitle)+' · Nivel '+n(level)+'</strong>'+
        '<div class="character-xp-line"><span>EXPERIENCIA</span><b>'+(xpNext?n(xp)+' / '+n(xpNext):n(xp))+'</b></div>'+
        '<div class="character-xp-track"><i style="width:'+xpPct+'%"></i></div>'+
        '<div class="character-hero-actions">'+
          '<button type="button" data-character-nav="arena">IR A ARENA</button>'+
          '<button type="button" data-character-nav="pve">EXPEDICIONES</button>'+
          '<button type="button" data-character-nav="artifacts">ARTEFACTOS</button>'+
          '<button type="button" data-character-nav="research">GRIMORIO</button>'+
        '</div>'+
      '</div>'+
      '<div class="character-hero-summary">'+
        '<div><small>PUNTOS DISPONIBLES</small><strong>'+n(progression?.attributePoints||0)+'</strong></div>'+
        '<div><small>RATING ARENA</small><strong>'+n(arena.rating||1000)+'</strong></div>'+
        '<div><small>PODER DE EQUIPO</small><strong>'+n(equipmentPower)+'</strong></div>'+
        '<div><small>RELIQUIAS</small><strong>'+n(relicCount)+'</strong></div>'+
      '</div>'+
    '</section>'+
    '<section class="character-vitals">'+
      characterVital("VIDA MÁXIMA",derived?.maxHp??"—","resistencia en combate")+
      characterVital("ATAQUE",derived?.attack??"—","daño base derivado")+
      characterVital("ARMADURA",derived?.armor??"—","mitigación defensiva")+
      characterVital("VELOCIDAD",Number.isFinite(Number(derived?.speed))?Number(derived.speed).toFixed(1):"—","ritmo de actuación")+
      characterVital("CRÍTICO",Number.isFinite(Number(derived?.crit))?Math.round(Number(derived.crit)*100)+"%":"—","probabilidad crítica")+
      characterVital("ESQUIVA",Number.isFinite(Number(derived?.dodge))?Math.round(Number(derived.dodge)*100)+"%":"—","probabilidad de esquiva")+
    '</section>'+
    '<div class="character-main-grid">'+
      '<section class="character-panel character-combat-panel">'+
        '<div class="character-panel-head"><div><span class="section-kicker">COMBATE</span><h3>Estadísticas del Archimago</h3></div><small>Estas estadísticas pertenecen al personaje, no al reino.</small></div>'+
        '<div class="character-combat-stats">'+characterCombatStatsMarkup(combat)+'</div>'+
        '<div class="character-weapon"><small>ARMA DE DUELO</small><strong>'+esc(weapon.name||"Sin arma")+'</strong><span>'+esc(weapon.type||"")+(weapon.min!=null?' · '+weapon.min+'–'+weapon.max+' daño':"")+(weapon.effect?' · '+esc(weapon.effect):"")+'</span></div>'+
        '<div class="character-traits"><small>RASGOS</small><div>'+characterTraitsMarkup(combat)+'</div></div>'+
      '</section>'+
      '<section class="character-panel">'+
        '<div class="character-panel-head"><div><span class="section-kicker">DESARROLLO</span><h3>Aptitudes personales</h3></div><small>Invierte puntos al subir de nivel.</small></div>'+
        '<div class="character-aptitudes">'+characterAptitudesMarkup(profile,progression)+'</div>'+
      '</section>'+
    '</div>'+
    '<section class="character-panel character-abilities-panel">'+
      '<div class="character-panel-head"><div><span class="section-kicker">HABILIDADES</span><h3>Técnicas de combate</h3></div><small>Se activan durante los duelos.</small></div>'+
      '<div class="character-abilities">'+characterAbilitiesMarkup(combat)+'</div>'+
      (evolution?'<div class="character-evolution">'+evolution+'</div>':"")+
    '</section>'+
    '<section class="character-panel character-equipment-preview">'+
      '<div class="character-panel-head"><div><span class="section-kicker">EQUIPO</span><h3>Equipo activo</h3></div><small>Siete espacios vinculados al mismo personaje.</small></div>'+
      '<div class="character-equip-grid">'+characterEquipmentPreview(snapshot)+'</div>'+
    '</section>'+
    '<section class="character-panel character-bio-panel">'+
      '<div class="character-panel-head"><div><span class="section-kicker">IDENTIDAD</span><h3>Biografía</h3></div><small>Máximo 500 caracteres.</small></div>'+
      '<textarea id="profile-bio-input" maxlength="500" placeholder="Historia, carácter o ambiciones de tu Archimago…">'+esc(profile.bio||"")+'</textarea>'+
      '<div class="character-bio-actions"><button class="profile-action" id="profile-save-bio" type="button">GUARDAR BIOGRAFÍA</button></div>'+
    '</section>'+
    '<section class="character-panel character-inventory-panel">'+
      '<div class="character-panel-head"><div><span class="section-kicker">INVENTARIO</span><h3>Objetos del personaje</h3></div><small>Equipo, mochila y reliquias custodiadas.</small></div>'+
      inventory+
    '</section>'+
  '</section>';
}
function wireCharacterPage(profile){
  const root=document.querySelector(".character-page");
  if(!root)return;
  root.querySelectorAll("[data-character-nav]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.characterNav)));
  root.querySelectorAll("[data-archmage-attribute]").forEach(btn=>btn.addEventListener("click",()=>spendArchmageAttribute(btn.dataset.archmageAttribute,profile)));
  root.querySelector("#character-avatar-file")?.addEventListener("change",e=>startProfileAvatarCrop(e.target.files?.[0],profile));
  root.querySelector("#profile-save-bio")?.addEventListener("click",()=>saveOwnProfile(profile));
  if(typeof wireInventoryPanel==="function")wireInventoryPanel(profile);
  if(typeof wireCombatEvolution==="function")wireCombatEvolution(profile);
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
  host.innerHTML='<div class="character-page-loading"><span class="section-kicker">ARCHIMAGO</span><strong>Preparando tu personaje…</strong></div>';
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
    }catch(e){console.warn("Character page hydration failed",e)}
    ownProfileBadge=profile;
    renderOwnProfileBadge();
    host.innerHTML=renderCharacterPageLayout(profile,snapshot);
    wireCharacterPage(profile);
  }catch(e){
    host.innerHTML='<div class="view-header"><div><span class="section-kicker">ARCHIMAGO</span><h2>Error de personaje</h2><p>'+esc(humanError(e))+'</p></div></div>';
  }
}
globalThis.renderCharacterPage=renderCharacterPage;
