"use strict";

function characterProgression(profile){
  try{return typeof archmageProgressionFromProfile==="function"?archmageProgressionFromProfile(profile):null}catch{return null}
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
function characterPortraitUrl(profile){
  const code=String(profile?.school_code||"").toLowerCase();
  const aliases={
    verdant:"verdant",viridia:"verdant",
    eradication:"eradication",cineria:"eradication",
    phantasm:"phantasm",oneiria:"phantasm",
    ascendant:"ascendant",aurea:"ascendant",
    abyssal:"abyssal",nadir:"abyssal"
  };
  const school=aliases[code]||code;
  const paths={
    verdant:"assets/art/characters/verdante/viridia-level-1.webp?v=0.3.27",
    eradication:"assets/art/characters/eradication/cineria-level-1.webp?v=0.3.27",
    phantasm:"assets/art/characters/phantasm/oneiria-level-1.webp?v=0.3.27",
    ascendant:"assets/art/characters/ascendant/aurea-level-1.png?v=0.3.27",
    abyssal:"assets/art/characters/abyssal/nadir-level-1.webp?v=0.3.27"
  };
  return paths[school]||"";
}
function characterSpriteMarkup(profile){
  const portrait=characterPortraitUrl(profile)||(typeof profileDefaultPortraitUrl==="function"?profileDefaultPortraitUrl(profile):"");
  const fallback=(typeof symbols!=="undefined"&&symbols[profile?.school_code])||"✦";
  const arenaFallback=typeof arenaSpriteHtml==="function"
    ?arenaSpriteHtml(profile.school_code,"character-sheet-sprite character-portrait-fallback")
    :'<div class="character-symbol-fallback character-portrait-fallback">'+esc(fallback)+'</div>';
  if(portrait){
    const hiddenFallback=arenaFallback.includes('aria-hidden="true"')
      ?arenaFallback.replace('aria-hidden="true"','style="display:none" aria-hidden="true"')
      :arenaFallback.replace('character-portrait-fallback"','character-portrait-fallback" style="display:none"');
    return '<img class="character-level-portrait" src="'+esc(portrait)+'" alt="'+esc(characterSchoolLabel(profile.school_code))+' · personaje nivel '+n(profile?.archmage_level||1)+'" onerror="this.style.display=\'none\';if(this.nextElementSibling)this.nextElementSibling.style.display=\'block\';" />'+hiddenFallback;
  }
  return arenaFallback;
}
function characterPercent(v){return Number.isFinite(Number(v))?Math.round(Number(v)*100)+"%":"—"}
function characterNumber(v,decimals=0){
  if(!Number.isFinite(Number(v)))return "—";
  return decimals?Number(v).toFixed(decimals):n(Number(v));
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
    const plus=canSpend&&value<cap?'<button class="character-stat-plus" type="button" data-archmage-attribute="'+esc(key)+'">＋</button>':"";
    return '<article class="character-development-stat"><div><small>'+esc(meta.label)+'</small><strong>'+n(value)+'</strong>'+plus+'</div><p>'+esc(meta.description||"")+'</p></article>';
  }).join("");
}
function characterStatBars(raw){
  if(!raw?.stats)return '<div class="character-empty">No hay atributos de combate disponibles.</div>';
  return Object.entries(raw.stats).map(([key,value])=>{
    const label=typeof COMBAT_STAT_META!=="undefined"&&COMBAT_STAT_META[key]?COMBAT_STAT_META[key]:key;
    const count=12,filled=Math.max(1,Math.min(count,Math.round((Number(value)||0)/20*count)));
    return '<div class="character-stat-row"><div><small>'+esc(label)+'</small><strong>'+n(value)+'</strong></div><div class="character-pips">'+
      Array.from({length:count},(_,i)=>'<i class="'+(i<filled?"on":"")+'"></i>').join("")+
      '</div></div>';
  }).join("");
}
function characterTraits(raw){
  const traits=[raw?.trait].concat(raw?.bonusTraits||[]).filter(Boolean);
  if(!traits.length)return '<div class="character-empty compact">Sin rasgos activos.</div>';
  return traits.map((t,i)=>'<article class="character-bonus-tile"><span>'+["✦","◆","◇","✧"][i%4]+'</span><strong>'+esc(t.name||"Rasgo")+'</strong><small>'+esc(t.desc||"")+'</small></article>').join("");
}
function characterAbilities(raw){
  const rows=raw?.abilities||[];
  if(!rows.length)return '<div class="character-empty compact">Aún no hay habilidades.</div>';
  return rows.map((a,i)=>'<article class="character-bonus-tile ability"><span>'+["⚡","✹","◌","♧","✦"][i%5]+'</span><strong>'+esc(a.name||"Habilidad")+'</strong><small>'+esc(a.desc||"")+'</small></article>').join("");
}
function characterEquipmentTiles(profile){
  if(typeof lootLoad!=="function")return '<div class="character-empty compact">Equipo no disponible.</div>';
  const state=lootLoad(profile),glyph={weapon:"⚔",robe:"♜",amulet:"◇",ring1:"◌",ring2:"◌",focus:"✦"};
  const slots=typeof ARCANUM_EQUIP_SLOTS!=="undefined"?ARCANUM_EQUIP_SLOTS:[];
  const rows=slots.map(slot=>{
    const id=state.equipment?.[slot.key],item=state.items?.find(x=>x.id===id);
    return '<article class="character-loadout-tile '+(item?"filled":"empty")+' rarity-'+esc(item?.rarity||"none")+'"><span>'+glyph[slot.key]+'</span><small>'+esc(slot.label)+'</small><strong>'+esc(item?.name||"Vacío")+'</strong>'+(item?'<em>iP '+n(item.power||0)+'</em>':"")+'</article>';
  });
  const relic=typeof canonicalEquippedRelic==="function"?canonicalEquippedRelic():null;
  const relicName=relic?(typeof canonicalItemDisplayName==="function"?canonicalItemDisplayName(relic):(relic.artifact_id||"Reliquia")):"Vacío";
  rows.push('<article class="character-loadout-tile '+(relic?"filled relic":"empty")+'"><span>✧</span><small>Reliquia</small><strong>'+esc(relicName)+'</strong></article>');
  return rows.join("");
}
function characterHistory(snapshot){
  const rows=(snapshot?.history||[]).slice(0,7);
  if(!rows.length)return '<div class="character-empty compact">Todavía no hay acontecimientos registrados.</div>';
  const labels={arena:"ARENA",artifact:"RELIQUIA",war:"GUERRA"};
  return rows.map(row=>'<article class="character-event '+esc(row.outcome||"info")+'"><span>'+esc(labels[row.type]||"HITO")+'</span><div><strong>'+esc(row.title||"Acontecimiento")+'</strong><p>'+esc(row.detail||"")+'</p></div></article>').join("");
}
function characterInventory(profile){
  if(typeof lootLoad!=="function")return "";
  const state=lootLoad(profile),cap=typeof ARCANUM_INVENTORY_CAP!=="undefined"?ARCANUM_INVENTORY_CAP:20;
  const items=state.items?.length&&typeof lootItemCard==="function"?state.items.map(lootItemCard).join(""):'<div class="character-empty">Tu inventario está vacío.</div>';
  const relics=typeof canonicalRelicInventoryCards==="function"?canonicalRelicInventoryCards():'<div class="character-empty">No hay reliquias disponibles.</div>';
  return '<section class="character-bottom-panel" data-loot-root>'+
    '<div class="character-bottom-head"><div><span class="section-kicker">OBJETOS</span><h3>Inventario</h3></div><small>'+n(state.items?.length||0)+' / '+n(cap)+' objetos</small></div>'+
    '<div class="loot-grid character-inventory-grid">'+items+'</div>'+
    '<div class="character-relic-divider"></div>'+
    '<div class="character-bottom-head compact"><div><span class="section-kicker">RELIQUIAS</span><h3>Reliquias disponibles</h3></div><small>Una puede permanecer vinculada.</small></div>'+
    '<div class="loot-grid relic-inventory-grid">'+relics+'</div>'+
  '</section>';
}
function renderCharacterLayout(profile,snapshot){
  const progression=characterProgression(profile),{raw,derived}=characterCombat(profile,snapshot);
  const arena=snapshot?.arena||{},level=Number(progression?.level||snapshot?.identity?.level||profile?.archmage_level||1);
  const xp=Number(progression?.xp||0),xpNext=Number(progression?.xpNext||0),xpRatio=Math.max(0,Math.min(1,Number(progression?.xpRatio||0)));
  const school=characterSchoolLabel(profile.school_code),title=characterRankTitle(progression);
  const division=typeof arenaDivision==="function"?arenaDivision(Number(arena.rating||1000)):"Arena";
  const weapon=raw?.weapon||{},evolution=typeof renderCombatEvolution==="function"?renderCombatEvolution(profile):"";
  const equipmentPower=Number(snapshot?.inventory?.equipment_power||derived?.equipmentPower||0);

  return '<section class="character-brute-layout">'+
    '<header class="character-top-card">'+
      '<div class="character-name-block"><span class="character-rank-mark">✦</span><div><h2>'+esc(profile.mage_name)+'</h2><p>'+esc(school)+' · '+esc(title)+'</p></div></div>'+
      '<div class="character-top-record"><span>RATING <b>'+n(arena.rating||1000)+'</b></span><span>VICTORIAS <b>'+n(arena.wins||0)+'</b></span><span>DERROTAS <b>'+n(arena.losses||0)+'</b></span></div>'+
      '<div class="character-page-shortcuts"><button data-character-nav="arena">ARENA</button><button data-character-nav="pve">EXPEDICIONES</button></div>'+
    '</header>'+

    '<div class="character-brute-grid">'+
      '<aside class="character-left-column">'+
        '<section class="character-brute-panel">'+
          '<div class="character-brute-title"><span>ARSENAL Y DONES DE COMBATE</span><small>Todo lo que entra contigo al duelo</small></div>'+
          '<div class="character-loadout-grid">'+characterEquipmentTiles(profile)+'</div>'+
          '<div class="character-bonus-grid">'+characterTraits(raw)+characterAbilities(raw)+'</div>'+
        '</section>'+
      '</aside>'+

      '<main class="character-center-column">'+
        '<section class="character-character-stage">'+
          '<div class="character-level-heading"><span>NIVEL</span><strong>'+n(level)+'</strong></div>'+
          '<div class="character-level-track"><i style="width:'+Math.round(xpRatio*100)+'%"></i></div>'+
          '<div class="character-avatar-zone">'+characterSpriteMarkup(profile)+'</div>'+
          '<div class="character-combat-vitals">'+
            '<div><span>❤</span><strong>'+characterNumber(derived?.maxHp)+'</strong><small>puntos de vida</small></div>'+
            '<div><span>⚔</span><strong>'+characterNumber(derived?.attack)+'</strong><small>ataque</small></div>'+
            '<div><span>◆</span><strong>'+characterNumber(derived?.armor)+'</strong><small>armadura</small></div>'+
          '</div>'+
          '<div class="character-stat-bars">'+characterStatBars(raw)+'</div>'+
          '<div class="character-weapon-line"><span>ARMA</span><strong>'+esc(weapon.name||"Sin arma")+'</strong><small>'+esc(weapon.type||"")+(weapon.min!=null?' · '+weapon.min+'–'+weapon.max+' daño':"")+'</small></div>'+
        '</section>'+

        '<section class="character-arena-card">'+
          '<div><span class="section-kicker">ARENA</span><h3>'+esc(division)+'</h3><p>'+n(arena.wins||0)+' victorias · '+n(arena.losses||0)+' derrotas · '+n(equipmentPower)+' iP equipado</p></div>'+
          '<button type="button" data-character-nav="arena">ENTRAR EN LA ARENA</button>'+
        '</section>'+
      '</main>'+

      '<aside class="character-right-column">'+
        '<section class="character-brute-panel character-progress-panel">'+
          '<div class="character-brute-title"><span>PROGRESIÓN</span><small>'+n(progression?.attributePoints||0)+' puntos disponibles</small></div>'+
          '<div class="character-xp-summary"><span>EXPERIENCIA</span><strong>'+(xpNext?n(xp)+' / '+n(xpNext):n(xp))+'</strong></div>'+
          '<div class="character-development-grid">'+characterDevelopmentStats(profile,progression)+'</div>'+
        '</section>'+
        '<section class="character-brute-panel character-events-panel">'+
          '<div class="character-brute-title"><span>HISTORIAL DEL ARCHIMAGO</span><small>últimos acontecimientos</small></div>'+
          '<div class="character-event-list">'+characterHistory(snapshot)+'</div>'+
        '</section>'+
      '</aside>'+
    '</div>'+

    (evolution?'<section class="character-bottom-panel character-evolution-panel"><div class="character-bottom-head"><div><span class="section-kicker">EVOLUCIÓN</span><h3>Decisiones permanentes</h3></div><small>Las elecciones cambian el personaje.</small></div>'+evolution+'</section>':"")+
    characterInventory(profile)+
  '</section>';
}
function wireCharacterPage(profile){
  const root=document.querySelector(".character-brute-layout");if(!root)return;
  root.querySelectorAll("[data-character-nav]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.characterNav)));
  root.querySelectorAll("[data-archmage-attribute]").forEach(btn=>btn.addEventListener("click",()=>spendArchmageAttribute(btn.dataset.archmageAttribute,profile)));
  if(typeof wireInventoryPanel==="function")wireInventoryPanel(profile);
  if(typeof wireCombatEvolution==="function")wireCombatEvolution(profile);
}
async function renderCharacterPage(){
  const host=$("#view-host"),mageName=String(realmState?.realm?.mage_name||ownProfileBadge?.mage_name||"").trim();
  if(!host)return;
  if(!mageName){host.innerHTML='<div class="view-header"><div><span class="section-kicker">ARCHIMAGO</span><h2>Personaje</h2><p>No se ha podido identificar al Archimago.</p></div></div>';return}
  host.innerHTML='<div class="character-page-loading"><span class="section-kicker">ARCHIMAGO</span><strong>Preparando ficha de personaje…</strong></div>';
  try{
    let snapshot=typeof loadArchmageSnapshot==="function"?await loadArchmageSnapshot(mageName,{force:true}):{profile:await rpc("player_profile",{p_mage_name:mageName})};
    let profile=snapshot.profile;
    try{
      if(typeof combatHydrateProfile==="function")await combatHydrateProfile(profile);
      if(typeof lootHydrateProfile==="function")await lootHydrateProfile(profile);
      if(typeof loadArchmageSnapshot==="function"){snapshot=await loadArchmageSnapshot(mageName,{force:true});profile=snapshot.profile}
    }catch(e){console.warn("Character hydration failed",e)}
    ownProfileBadge=profile;renderOwnProfileBadge();
    host.innerHTML=renderCharacterLayout(profile,snapshot);wireCharacterPage(profile);
    if(typeof arenaHydrateSprites==="function")arenaHydrateSprites(host);
  }catch(e){
    host.innerHTML='<div class="view-header"><div><span class="section-kicker">ARCHIMAGO</span><h2>Error de personaje</h2><p>'+esc(humanError(e))+'</p></div></div>';
  }
}
globalThis.renderCharacterPage=renderCharacterPage;
