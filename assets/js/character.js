"use strict";

function characterProgression(profile){
  try{return typeof archmageProgressionFromProfile==="function"?archmageProgressionFromProfile(profile):null}
  catch{return null}
}
function characterCombat(profile,snapshot){
  const raw=typeof getCombatProfile==="function"?getCombatProfile(profile):null;
  const derived=snapshot?.combat?.derived||(typeof combatDerived==="function"?combatDerived(profile):null);
  return {raw,derived};
}
function characterSchoolLabel(code){
  if(typeof profileSchoolName==="function")return profileSchoolName(code);
  return String(code||"Escuela");
}
function characterRankTitle(progression){
  try{
    const identity=progression&&typeof archmageIdentityFromProgression==="function"?archmageIdentityFromProgression(progression):null;
    return identity?.title||"Archimago";
  }catch{return "Archimago"}
}
function characterSpriteMarkup(profile){
  if(typeof arenaSpriteHtml==="function")return arenaSpriteHtml(profile.school_code,"character-sheet-sprite");
  return '<div class="character-symbol-fallback">'+esc((typeof symbols!=="undefined"&&symbols[profile.school_code])||"✦")+'</div>';
}
function characterPercent(v){
  return Number.isFinite(Number(v))?Math.round(Number(v)*100)+"%":"—";
}
function characterNumber(v,decimals=0){
  if(!Number.isFinite(Number(v)))return "—";
  return decimals?Number(v).toFixed(decimals):n(Number(v));
}
function characterCombatStats(raw){
  if(!raw?.stats)return '<div class="character-empty">No hay atributos de duelo disponibles.</div>';
  return Object.entries(raw.stats).map(([key,value])=>{
    const label=typeof COMBAT_STAT_META!=="undefined"&&COMBAT_STAT_META[key]?COMBAT_STAT_META[key]:key;
    return '<article class="character-duel-stat"><small>'+esc(label)+'</small><strong>'+n(value)+'</strong></article>';
  }).join("");
}
function characterDevelopmentStats(profile,progression){
  if(!progression)return '<div class="character-empty">La progresión personal todavía no está disponible.</div>';
  const keys=typeof ARCHMAGE_STAT_KEYS!=="undefined"?ARCHMAGE_STAT_KEYS:[];
  const cap=typeof ARCHMAGE_ATTRIBUTE_CAP!=="undefined"?ARCHMAGE_ATTRIBUTE_CAP:999;
  const metaMap=typeof ARCHMAGE_STAT_META!=="undefined"?ARCHMAGE_STAT_META:{};
  const canSpend=Boolean(profile?.is_self)&&Number(progression.attributePoints||0)>0;
  return keys.map(key=>{
    const meta=metaMap[key]||{label:key,description:""};
    const value=Number(progression.stats?.[key]||0);
    const plus=canSpend&&value<cap
      ?'<button class="character-stat-plus" type="button" data-archmage-attribute="'+esc(key)+'" aria-label="Subir '+esc(meta.label)+'">＋</button>'
      :"";
    return '<article class="character-development-stat"><div><small>'+esc(meta.label)+'</small><strong>'+n(value)+'</strong>'+plus+'</div><p>'+esc(meta.description||"")+'</p></article>';
  }).join("");
}
function characterTraits(raw){
  const traits=[raw?.trait].concat(raw?.bonusTraits||[]).filter(Boolean);
  if(!traits.length)return '<div class="character-empty compact">Sin rasgos activos.</div>';
  return traits.map(t=>'<article class="character-trait-card"><strong>'+esc(t.name||"Rasgo")+'</strong><p>'+esc(t.desc||"")+'</p></article>').join("");
}
function characterAbilities(raw){
  const rows=raw?.abilities||[];
  if(!rows.length)return '<div class="character-empty">Aún no hay habilidades de combate.</div>';
  return rows.map((a,index)=>'<article class="character-ability-card"><span>'+String(index+1).padStart(2,"0")+'</span><div><strong>'+esc(a.name||"Habilidad")+'</strong><p>'+esc(a.desc||"")+'</p></div></article>').join("");
}
function characterHistory(snapshot){
  const rows=(snapshot?.history||[]).slice(0,6);
  if(!rows.length)return '<div class="character-empty compact">Todavía no hay hitos registrados.</div>';
  const labels={arena:"ARENA",artifact:"RELIQUIA",war:"GUERRA"};
  return rows.map(row=>'<article class="character-history-row '+esc(row.outcome||"info")+'"><span>'+esc(labels[row.type]||"HITO")+'</span><div><strong>'+esc(row.title||"Acontecimiento")+'</strong><p>'+esc(row.detail||"")+'</p></div><time>'+new Date(row.created_at).toLocaleDateString("es-ES")+'</time></article>').join("");
}
function characterGear(profile){
  if(typeof lootLoad!=="function")return '<div class="character-empty">El inventario no está disponible.</div>';
  const state=lootLoad(profile);
  const total=typeof lootEffectiveStats==="function"?lootEffectiveStats(state):{};
  const equipment=typeof ARCANUM_EQUIP_SLOTS!=="undefined"&&typeof lootEquipmentCard==="function"
    ?ARCANUM_EQUIP_SLOTS.map(slot=>lootEquipmentCard(slot,state)).join("")
    :"";
  const relicSlot=typeof canonicalRelicEquipmentCard==="function"?canonicalRelicEquipmentCard():"";
  const items=state.items?.length&&typeof lootItemCard==="function"
    ?state.items.map(lootItemCard).join("")
    :'<div class="character-empty">Tu inventario está vacío.</div>';
  const relics=typeof canonicalRelicInventoryCards==="function"?canonicalRelicInventoryCards():'<div class="character-empty">No hay reliquias disponibles.</div>';
  const cap=typeof ARCANUM_INVENTORY_CAP!=="undefined"?ARCANUM_INVENTORY_CAP:20;

  return '<div class="character-gear-root" data-loot-root>'+
    '<section class="character-panel character-equipment-panel">'+
      '<div class="character-panel-title"><div><span class="section-kicker">EQUIPO</span><h3>Equipo activo</h3></div><small>Los objetos equipados modifican directamente tus valores de combate.</small></div>'+
      '<div class="character-gear-bonuses">'+
        '<div><small>PODER DE EQUIPO</small><strong>'+n(total.power||0)+'</strong></div>'+
        '<div><small>PODER ARCANO</small><strong>+'+n(total.arcane_power||0)+'</strong></div>'+
        '<div><small>VIDA POR EQUIPO</small><strong>+'+n(total.life||0)+'</strong></div>'+
        '<div><small>MANÁ POR EQUIPO</small><strong>+'+n(total.mana||0)+'</strong></div>'+
      '</div>'+
      '<div class="loot-equipment character-equipment-grid">'+equipment+relicSlot+'</div>'+
    '</section>'+
    '<section class="character-panel character-inventory-panel">'+
      '<div class="character-panel-title"><div><span class="section-kicker">INVENTARIO</span><h3>Mochila</h3></div><small>'+n(state.items?.length||0)+' / '+n(cap)+' objetos</small></div>'+
      '<p class="character-section-help">Botín obtenido en Expediciones, Arena y eventos. Equípalo para modificar las estadísticas del Archimago.</p>'+
      '<div class="loot-grid character-inventory-grid">'+items+'</div>'+
      '<div class="character-relic-divider"></div>'+
      '<div class="character-panel-title compact"><div><span class="section-kicker">RELIQUIAS</span><h3>Reliquias disponibles</h3></div><small>Una puede permanecer vinculada.</small></div>'+
      '<div class="loot-grid relic-inventory-grid">'+relics+'</div>'+
    '</section>'+
  '</div>';
}
function renderCharacterLayout(profile,snapshot){
  const progression=characterProgression(profile);
  const {raw,derived}=characterCombat(profile,snapshot);
  const arena=snapshot?.arena||{};
  const level=Number(progression?.level||snapshot?.identity?.level||profile?.archmage_level||1);
  const xp=Number(progression?.xp||0);
  const xpNext=Number(progression?.xpNext||0);
  const xpRatio=Math.max(0,Math.min(1,Number(progression?.xpRatio||0)));
  const equipmentPower=Number(snapshot?.inventory?.equipment_power||derived?.equipmentPower||0);
  const school=characterSchoolLabel(profile.school_code);
  const title=characterRankTitle(progression);
  const division=typeof arenaDivision==="function"?arenaDivision(Number(arena.rating||1000)):"Arena";
  const weapon=raw?.weapon||{};
  const evolution=typeof renderCombatEvolution==="function"?renderCombatEvolution(profile):"";

  return '<section class="character-page-v2">'+
    '<header class="character-page-heading">'+
      '<div><span class="section-kicker">ARCHIMAGO</span><h2>Personaje</h2><p>Esta es la ficha del Archimago jugable. No representa tu perfil social ni tu Dominio.</p></div>'+
      '<div class="character-page-shortcuts">'+
        '<button type="button" data-character-nav="arena">ARENA</button>'+
        '<button type="button" data-character-nav="pve">EXPEDICIONES</button>'+
        '<button type="button" data-character-nav="research">GRIMORIO</button>'+
        '<button type="button" data-character-nav="artifacts">ARTEFACTOS</button>'+
      '</div>'+
    '</header>'+

    '<section class="character-core">'+
      '<div class="character-avatar-stage"><div class="character-avatar-ring">'+characterSpriteMarkup(profile)+'</div><small>'+esc(school)+'</small></div>'+
      '<div class="character-core-identity">'+
        '<span>'+esc(title)+'</span>'+
        '<h1>'+esc(profile.mage_name)+'</h1>'+
        '<div class="character-level-line"><strong>NIVEL '+n(level)+'</strong><b>'+n(progression?.attributePoints||0)+' PUNTOS DE APTITUD</b></div>'+
        '<div class="character-xp"><div><span>EXPERIENCIA</span><b>'+(xpNext?n(xp)+' / '+n(xpNext):n(xp))+'</b></div><div class="character-xp-track"><i style="width:'+Math.round(xpRatio*100)+'%"></i></div></div>'+
        '<p>Tu Escuela, nivel, decisiones de evolución, atributos de duelo y equipo determinan cómo combate este Archimago.</p>'+
      '</div>'+
      '<div class="character-core-record">'+
        '<div><small>RATING</small><strong>'+n(arena.rating||1000)+'</strong><span>'+esc(division)+'</span></div>'+
        '<div><small>RÉCORD</small><strong>'+n(arena.wins||0)+'V · '+n(arena.losses||0)+'D</strong><span>Arena</span></div>'+
        '<div><small>EQUIPO</small><strong>'+n(equipmentPower)+' iP</strong><span>Poder equipado</span></div>'+
      '</div>'+
    '</section>'+

    '<section class="character-combat-overview">'+
      '<article><small>VIDA MÁXIMA</small><strong>'+characterNumber(derived?.maxHp)+'</strong><span>supervivencia</span></article>'+
      '<article><small>ATAQUE</small><strong>'+characterNumber(derived?.attack)+'</strong><span>daño base</span></article>'+
      '<article><small>ARMADURA</small><strong>'+characterNumber(derived?.armor)+'</strong><span>defensa</span></article>'+
      '<article><small>VELOCIDAD</small><strong>'+characterNumber(derived?.speed,1)+'</strong><span>ritmo de acción</span></article>'+
      '<article><small>CRÍTICO</small><strong>'+characterPercent(derived?.crit)+'</strong><span>golpe crítico</span></article>'+
      '<article><small>ESQUIVA</small><strong>'+characterPercent(derived?.dodge)+'</strong><span>evasión</span></article>'+
    '</section>'+

    '<div class="character-two-column">'+
      '<section class="character-panel">'+
        '<div class="character-panel-title"><div><span class="section-kicker">DUELO</span><h3>Atributos de combate</h3></div><small>Son los valores persistentes usados por Arena y combate individual.</small></div>'+
        '<div class="character-duel-stats">'+characterCombatStats(raw)+'</div>'+
        '<div class="character-weapon-block"><div><small>ARMA DE DUELO</small><strong>'+esc(weapon.name||"Sin arma")+'</strong></div><span>'+esc(weapon.type||"")+(weapon.min!=null?' · '+weapon.min+'–'+weapon.max+' daño':"")+(weapon.effect?' · '+esc(weapon.effect):"")+'</span></div>'+
        '<div class="character-subtitle">RASGOS</div>'+
        '<div class="character-traits-grid">'+characterTraits(raw)+'</div>'+
      '</section>'+
      '<section class="character-panel">'+
        '<div class="character-panel-title"><div><span class="section-kicker">PROGRESIÓN</span><h3>Aptitudes del Archimago</h3></div><small>Se mejoran con los puntos obtenidos al progresar.</small></div>'+
        '<div class="character-development-grid">'+characterDevelopmentStats(profile,progression)+'</div>'+
      '</section>'+
    '</div>'+

    '<section class="character-panel character-abilities-panel">'+
      '<div class="character-panel-title"><div><span class="section-kicker">HABILIDADES</span><h3>Kit de combate</h3></div><small>Habilidades propias del personaje que se activan automáticamente durante los duelos.</small></div>'+
      '<div class="character-abilities-grid">'+characterAbilities(raw)+'</div>'+
    '</section>'+

    (evolution?'<section class="character-panel character-evolution-panel"><div class="character-panel-title"><div><span class="section-kicker">EVOLUCIÓN</span><h3>Decisiones de desarrollo</h3></div><small>Las elecciones cambian permanentemente el personaje.</small></div>'+evolution+'</section>':"")+

    characterGear(profile)+

    '<section class="character-panel character-trajectory-panel">'+
      '<div class="character-panel-title"><div><span class="section-kicker">TRAYECTORIA</span><h3>Hitos recientes</h3></div><small>Registro del Archimago en combate, reliquias y acontecimientos personales.</small></div>'+
      '<div class="character-history-list">'+characterHistory(snapshot)+'</div>'+
    '</section>'+
  '</section>';
}
function wireCharacterPage(profile){
  const root=document.querySelector(".character-page-v2");
  if(!root)return;
  root.querySelectorAll("[data-character-nav]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.characterNav)));
  root.querySelectorAll("[data-archmage-attribute]").forEach(btn=>btn.addEventListener("click",()=>spendArchmageAttribute(btn.dataset.archmageAttribute,profile)));
  if(typeof wireInventoryPanel==="function")wireInventoryPanel(profile);
  if(typeof wireCombatEvolution==="function")wireCombatEvolution(profile);
}
async function renderCharacterPage(){
  const host=$("#view-host");
  const mageName=String(realmState?.realm?.mage_name||ownProfileBadge?.mage_name||"").trim();
  if(!host)return;
  if(!mageName){
    host.innerHTML='<div class="view-header"><div><span class="section-kicker">ARCHIMAGO</span><h2>Personaje</h2><p>No se ha podido identificar al Archimago.</p></div></div>';
    return;
  }
  host.innerHTML='<div class="character-page-loading"><span class="section-kicker">ARCHIMAGO</span><strong>Preparando ficha de personaje…</strong></div>';
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
    }catch(e){console.warn("Character hydration failed",e)}
    ownProfileBadge=profile;
    renderOwnProfileBadge();
    host.innerHTML=renderCharacterLayout(profile,snapshot);
    wireCharacterPage(profile);
    if(typeof arenaHydrateSprites==="function")arenaHydrateSprites(host);
  }catch(e){
    host.innerHTML='<div class="view-header"><div><span class="section-kicker">ARCHIMAGO</span><h2>Error de personaje</h2><p>'+esc(humanError(e))+'</p></div></div>';
  }
}
globalThis.renderCharacterPage=renderCharacterPage;
