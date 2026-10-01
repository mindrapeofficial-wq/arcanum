"use strict";

const ARCANUM_INVENTORY_VERSION=2;
const ARCANUM_INVENTORY_CAP=20;
const ARCANUM_EQUIP_SLOTS=Object.freeze([
  {key:"weapon",label:"Arma"},
  {key:"robe",label:"Túnica"},
  {key:"amulet",label:"Amuleto"},
  {key:"ring1",label:"Anillo I"},
  {key:"ring2",label:"Anillo II"},
  {key:"focus",label:"Foco Arcano"}
]);

const LOOT_RARITIES=Object.freeze([
  {key:"common",label:"Común",weight:5200,affixes:1,power:1},
  {key:"uncommon",label:"Poco común",weight:2800,affixes:2,power:1.08},
  {key:"rare",label:"Raro",weight:1400,affixes:3,power:1.2},
  {key:"epic",label:"Épico",weight:500,affixes:4,power:1.38},
  {key:"legendary",label:"Legendario",weight:90,affixes:5,power:1.65},
  {key:"arcane",label:"Arcano",weight:10,affixes:6,power:2.05}
]);

const LOOT_BASES=Object.freeze([
  {id:"ash_staff",slot:"weapon",name:"Báculo de Fresno",minLevel:1,implicit:{arcane_power:[1,4]}},
  {id:"bone_wand",slot:"weapon",name:"Vara de Hueso",minLevel:1,implicit:{knowledge:[1,3]}},
  {id:"thorn_scepter",slot:"weapon",name:"Cetro de Espinas",minLevel:5,implicit:{willpower:[2,5]}},
  {id:"astral_rod",slot:"weapon",name:"Vara Astral",minLevel:10,implicit:{arcane_power:[3,7]}},
  {id:"novice_robe",slot:"robe",name:"Túnica del Iniciado",minLevel:1,implicit:{willpower:[1,4]}},
  {id:"veil_mantle",slot:"robe",name:"Manto del Velo",minLevel:5,implicit:{knowledge:[2,5]}},
  {id:"war_mantle",slot:"robe",name:"Manto del Conjurador",minLevel:10,implicit:{arcane_power:[2,6]}},
  {id:"amber_eye",slot:"amulet",name:"Ojo de Ámbar",minLevel:1,implicit:{knowledge:[1,4]}},
  {id:"moon_charm",slot:"amulet",name:"Talismán Lunar",minLevel:5,implicit:{willpower:[1,5]}},
  {id:"five_schools_medal",slot:"amulet",name:"Medallón de las Cinco Escuelas",minLevel:12,implicit:{influence:[2,6]}},
  {id:"iron_ring",slot:"ring",name:"Anillo de Hierro Negro",minLevel:1,implicit:{willpower:[1,3]}},
  {id:"obsidian_ring",slot:"ring",name:"Anillo de Obsidiana",minLevel:4,implicit:{arcane_power:[1,4]}},
  {id:"sigil_ring",slot:"ring",name:"Sello del Cónclave",minLevel:9,implicit:{influence:[2,5]}},
  {id:"root_heart",slot:"focus",name:"Corazón de Raíz",minLevel:1,implicit:{willpower:[2,4]}},
  {id:"glass_orb",slot:"focus",name:"Orbe de Vidrio Estelar",minLevel:6,implicit:{knowledge:[2,5]}},
  {id:"sealed_reliquary",slot:"focus",name:"Relicario Sellado",minLevel:12,implicit:{arcane_power:[3,6]}}
]);

const LOOT_AFFIXES=Object.freeze([
  {id:"arcane",kind:"prefix",name:"Arcano",stat:"arcane_power",slots:["weapon","robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"learned",kind:"prefix",name:"Erudito",stat:"knowledge",slots:["weapon","robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"unyielding",kind:"prefix",name:"Inquebrantable",stat:"willpower",slots:["robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"sovereign",kind:"prefix",name:"Soberano",stat:"influence",slots:["amulet","ring","focus"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"vital",kind:"suffix",name:"de la Vitalidad",stat:"life",slots:["robe","amulet","ring","focus"],tiers:[[4,8],[8,15],[15,24],[24,36],[36,52]],schools:null},
  {id:"mana",kind:"suffix",name:"del Manantial",stat:"mana",slots:["weapon","robe","amulet","ring","focus"],tiers:[[5,10],[10,18],[18,30],[30,45],[45,65]],schools:null},
  {id:"critical",kind:"suffix",name:"del Ojo Certero",stat:"critical",slots:["weapon","amulet","ring"],tiers:[[1,2],[2,3],[3,5],[5,7],[7,9]],schools:null},
  {id:"ward",kind:"suffix",name:"de la Barrera",stat:"ward",slots:["robe","amulet","focus"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["ascendant","phantasm"]},
  {id:"growth",kind:"suffix",name:"del Brote Eterno",stat:"regen",slots:["weapon","robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,6],[6,9],[9,13]],schools:["verdant"]},
  {id:"cinders",kind:"suffix",name:"de las Cenizas",stat:"school_damage",slots:["weapon","amulet","ring","focus"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["eradication"]},
  {id:"abyss",kind:"suffix",name:"del Abismo Susurrante",stat:"school_damage",slots:["weapon","amulet","ring","focus"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["abyssal"]},
  {id:"mirage",kind:"suffix",name:"del Espejismo",stat:"evasion",slots:["robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,6],[6,9],[9,13]],schools:["phantasm"]},
  {id:"radiance",kind:"suffix",name:"de la Radiancia",stat:"ward",slots:["robe","amulet","focus"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["ascendant"]}
]);

const LOOT_STAT_LABELS=Object.freeze({
  arcane_power:"Poder Arcano",knowledge:"Conocimiento",willpower:"Voluntad",influence:"Influencia",
  life:"Vida",mana:"Maná",critical:"Crítico",ward:"Barrera",regen:"Regeneración",school_damage:"Daño de Escuela",evasion:"Evasión"
});

function lootClamp(v,min,max){return Math.max(min,Math.min(max,v));}
function lootRandInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function lootPick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function lootWeighted(items){
  const total=items.reduce((s,x)=>s+x.weight,0);
  let roll=Math.random()*total;
  for(const item of items){roll-=item.weight;if(roll<=0)return item;}
  return items[items.length-1];
}
const lootServerCache=new Map();
function lootMageKey(profile){
  return "arcanum_inventory_v"+ARCANUM_INVENTORY_VERSION+"_"+String(profile?.mage_name||realmState?.realm?.mage_name||"unknown").toLowerCase();
}
function lootNameKey(profile){return String(profile?.mage_name||realmState?.realm?.mage_name||"unknown").trim().toLowerCase()}
function lootItemOriginSource(item){
  return String(item?.origin?.source||item?.raw?.origin?.source||item?.source||"").trim();
}
function lootIsLegacyItem(item){
  return lootItemOriginSource(item)==="legacy_beta";
}
function lootRemoveLegacyItems(state){
  const clean=lootNormalizeV2(state);
  const removed=new Set((clean.items||[]).filter(lootIsLegacyItem).map(item=>String(item.id)));
  clean.items=(clean.items||[]).filter(item=>!lootIsLegacyItem(item));
  Object.keys(clean.equipment||{}).forEach(slot=>{
    if(removed.has(String(clean.equipment[slot]||"")))clean.equipment[slot]=null;
  });
  return clean;
}
function lootEmptyState(){
  return {version:ARCANUM_INVENTORY_VERSION,items:[],equipment:{weapon:null,robe:null,amulet:null,ring1:null,ring2:null,focus:null},found:0,legacy_imported:false};
}
function lootNormalizeV2(input){
  const state=JSON.parse(JSON.stringify(input||lootEmptyState()));
  const old=state.equipment||{};
  state.items=(Array.isArray(state.items)?state.items:[]).map(item=>({...item,slot:item.slot==="artifact"?"focus":item.slot}));
  state.equipment={...lootEmptyState().equipment,...old};
  if(old.artifact&&!state.equipment.focus)state.equipment.focus=old.artifact;
  delete state.equipment.artifact;
  state.version=ARCANUM_INVENTORY_VERSION;
  return state;
}
function lootLegacyLoad(profile){
  try{
    const mage=String(profile?.mage_name||realmState?.realm?.mage_name||"unknown").toLowerCase();
    const raw=localStorage.getItem(lootMageKey(profile))||localStorage.getItem("arcanum_inventory_v1_"+mage);
    const parsed=raw?JSON.parse(raw):null;
    return parsed&&(parsed.version===1||parsed.version===2)?lootNormalizeV2(parsed):null;
  }catch{return null;}
}
function lootLoad(profile){
  const parsed=lootServerCache.get(lootNameKey(profile));
  if(!parsed)return lootEmptyState();
  const state=lootRemoveLegacyItems(parsed);
  state.items=Array.isArray(state.items)?state.items.slice(0,ARCANUM_INVENTORY_CAP):[];
  state.equipment={...lootEmptyState().equipment,...(state.equipment||{})};
  return state;
}
function lootSave(profile,state){
  lootServerCache.set(lootNameKey(profile),JSON.parse(JSON.stringify(state)));
  return state;
}
async function lootHydrateProfile(profile){
  if(!profile?.is_self)return lootLoad(profile);
  const data=await stateApi("/inventory");
  const state=lootRemoveLegacyItems(data?.inventory||lootEmptyState());
  lootSave(profile,state);
  return state;
}
function lootTierForLevel(level){
  if(level>=40)return 5;if(level>=28)return 4;if(level>=16)return 3;if(level>=7)return 2;return 1;
}
function lootRollRange(range){return lootRandInt(range[0],range[1]);}
function lootAffinity(profile){
  const school=profile?.school_code||realmState?.realm?.school_code||"plain";
  if(Math.random()<.22)return "plain";
  return school;
}
function lootGenerate(profile,forcedRarity=null){
  const progression=typeof archmageProgressionFromProfile==="function"?archmageProgressionFromProfile(profile):null;
  const level=lootClamp(Number(progression?.level||profile?.archmage_level||1),1,50);
  const eligible=LOOT_BASES.filter(x=>x.minLevel<=level);
  const base=lootPick(eligible.length?eligible:LOOT_BASES);
  const rarity=forcedRarity?LOOT_RARITIES.find(x=>x.key===forcedRarity)||LOOT_RARITIES[0]:lootWeighted(LOOT_RARITIES);
  const affinity=lootAffinity(profile);
  const maxTier=lootTierForLevel(level);
  const affixPool=LOOT_AFFIXES.filter(a=>a.slots.includes(base.slot)&&(!a.schools||a.schools.includes(affinity)));
  const picked=[];
  const shuffled=[...affixPool].sort(()=>Math.random()-.5);
  for(const a of shuffled){
    if(picked.length>=rarity.affixes)break;
    if(picked.some(x=>x.id===a.id))continue;
    const tier=lootClamp(lootRandInt(Math.max(1,maxTier-1),maxTier),1,a.tiers.length);
    const range=a.tiers[tier-1];
    picked.push({id:a.id,kind:a.kind,name:a.name,stat:a.stat,tier,value:lootRollRange(range),rollMin:range[0],rollMax:range[1]});
  }
  const implicit=Object.entries(base.implicit||{}).map(([stat,range])=>({stat,value:lootRollRange(range),rollMin:range[0],rollMax:range[1]}));
  const prefix=picked.find(x=>x.kind==="prefix")?.name||"";
  const suffix=picked.find(x=>x.kind==="suffix")?.name||"";
  const name=[prefix,base.name,suffix].filter(Boolean).join(" ");
  const rawPower=implicit.reduce((s,x)=>s+x.value*2,0)+picked.reduce((s,x)=>s+x.value*(x.stat==="critical"?6:3)+x.tier*7,0)+level*2;
  return {
    id:"loot_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8),
    baseId:base.id,baseName:base.name,slot:base.slot,name,rarity:rarity.key,rarityLabel:rarity.label,
    affinity,level,implicit,affixes:picked,power:Math.max(1,Math.round(rawPower*rarity.power)),createdAt:new Date().toISOString()
  };
}
function lootSchoolLabel(code){
  return ({ascendant:"Aurea",verdant:"Viridia",eradication:"Cineria",abyssal:"Nadir",phantasm:"Oneiria",plain:"Neutral"})[code]||code;
}
function lootSlotLabel(slot){
  return ({weapon:"Arma",robe:"Túnica",amulet:"Amuleto",ring:"Anillo",focus:"Foco Arcano"})[slot]||slot;
}
function lootItemStats(item){
  const rows=[];
  (item.implicit||[]).forEach(x=>rows.push({label:LOOT_STAT_LABELS[x.stat]||x.stat,value:x.value,implicit:true}));
  (item.affixes||[]).forEach(x=>rows.push({label:LOOT_STAT_LABELS[x.stat]||x.stat,value:x.value,tier:x.tier,rollMin:x.rollMin,rollMax:x.rollMax}));
  return rows;
}
function lootEquippedSlotForItem(item,state){
  if(!item||!state?.equipment)return "";
  const hit=Object.entries(state.equipment).find(([,id])=>String(id||"")===String(item.id||""));
  return hit?.[0]||"";
}
function lootItemCard(item,state=null){
  const stats=lootItemStats(item).map(x=>'<li><span>+'+n(x.value)+' '+esc(x.label)+'</span>'+(x.tier?'<small>T'+x.tier+' · '+x.rollMin+'–'+x.rollMax+'</small>':'<small>implícito</small>')+'</li>').join("");
  const origin=typeof canonicalLootOriginText==="function"?canonicalLootOriginText(item):"Origen desconocido";
  const equippedSlot=lootEquippedSlotForItem(item,state);
  const equipped=Boolean(equippedSlot);
  const actions=equipped
    ?'<button class="small-action" type="button" data-loot-unequip="'+esc(equippedSlot)+'">DESEQUIPAR</button>'
    :'<button class="small-action" type="button" data-loot-equip="'+esc(item.id)+'">EQUIPAR</button><button class="ghost-button" type="button" data-loot-destroy="'+esc(item.id)+'">DESTRUIR</button>';
  return '<article class="loot-item rarity-'+esc(item.rarity)+(equipped?' is-equipped':'')+'" data-loot-id="'+esc(item.id)+'">'+
    '<header><span class="loot-rarity">'+esc(item.rarityLabel)+'</span><b>'+(equipped?'EQUIPADO · ':'')+'iP '+n(item.power)+'</b></header>'+
    '<h4>'+esc(item.name)+'</h4><div class="loot-meta">'+esc(lootSlotLabel(item.slot))+' · Nv. '+n(item.level)+' · '+esc(lootSchoolLabel(item.affinity))+'</div>'+
    '<div class="loot-origin"><small>ORIGEN</small><span>'+esc(origin)+'</span></div>'+
    '<ul>'+stats+'</ul><div class="loot-actions">'+actions+'</div>'+
  '</article>';
}
function lootEffectiveStats(state){
  const total={arcane_power:0,knowledge:0,willpower:0,influence:0,life:0,mana:0,critical:0,ward:0,regen:0,school_damage:0,evasion:0,power:0};
  Object.values(state.equipment||{}).forEach(id=>{
    const item=state.items.find(x=>x.id===id);if(!item)return;
    total.power+=Number(item.power)||0;
    lootItemStats(item).forEach(x=>{total[x.label]=total[x.label]||0;});
    [...(item.implicit||[]),...(item.affixes||[])].forEach(x=>{total[x.stat]=(total[x.stat]||0)+(Number(x.value)||0);});
  });
  return total;
}
function lootCombatBonuses(profile){
  const state=lootLoad(profile);
  const total=lootEffectiveStats(state);
  return {
    maxHp:Math.max(0,Number(total.life)||0),
    attack:Math.max(0,(Number(total.arcane_power)||0)*1.6+(Number(total.school_damage)||0)*1.25),
    armor:Math.max(0,(Number(total.willpower)||0)*1.25+(Number(total.ward)||0)*1.1),
    speed:Math.max(0,(Number(total.knowledge)||0)*0.08),
    crit:Math.max(0,(Number(total.critical)||0)/100),
    dodge:Math.max(0,(Number(total.evasion)||0)/100),
    block:Math.max(0,(Number(total.ward)||0)*0.0015),
    regen:Math.max(0,(Number(total.regen)||0)/100),
    accuracy:Math.max(0,(Number(total.knowledge)||0)*0.002),
    fortune:Math.max(0,(Number(total.influence)||0)*0.003),
    mana:Math.max(0,Number(total.mana)||0),
    equipmentPower:Math.max(0,Number(total.power)||0)
  };
}

function lootEquipmentCard(slot,state){
  const itemId=state.equipment[slot.key],item=state.items.find(x=>x.id===itemId);
  if(!item)return '<div class="loot-equip-slot"><small>'+esc(slot.label)+'</small><span>Vacío</span></div>';
  return '<div class="loot-equip-slot filled rarity-'+esc(item.rarity)+'"><small>'+esc(slot.label)+'</small><strong>'+esc(item.name)+'</strong><span>iP '+n(item.power)+'</span><button class="loot-unequip" type="button" data-loot-unequip="'+esc(slot.key)+'">×</button></div>';
}
function canonicalRelicEquipmentCard(){
  const rawRelic=typeof canonicalEquippedRelic==="function"?canonicalEquippedRelic():null;
  const relic=rawRelic&&!lootIsLegacyItem(rawRelic)?rawRelic:null;
  if(!relic)return '<div class="loot-equip-slot relic-slot"><small>Reliquia</small><span>Vacío</span></div>';
  const name=typeof canonicalItemDisplayName==="function"?canonicalItemDisplayName(relic):(typeof artifactDef==="function"?artifactDef(relic.artifact_id)?.name:relic.artifact_id);
  return '<div class="loot-equip-slot filled relic-slot"><small>Reliquia</small><strong>'+esc(name||"Reliquia")+'</strong><span>'+esc((relic.category||"reliquia").toUpperCase())+'</span><button class="loot-unequip" type="button" data-relic-unequip="relic">×</button></div>';
}
function canonicalRelicInventoryCards(){
  const model=typeof getCanonicalItems==="function"?getCanonicalItems():null;
  const relics=(model?.items||[]).filter(item=>item.kind==="relic"&&!lootIsLegacyItem(item));
  const activeId=String(model?.equipment?.relic?.id||"");
  if(!relics.length)return '<div class="empty">Todavía no custodias ninguna Reliquia.</div>';
  return relics.map(item=>{
    const active=String(item.id)===activeId||item.equipped;
    const name=typeof canonicalItemDisplayName==="function"?canonicalItemDisplayName(item):(item.artifact_id||"Reliquia");
    const category=typeof artifactCategoryLabel==="function"?artifactCategoryLabel(item.category):(item.category||"Reliquia");
    const effect=typeof artifactDef==="function"?artifactDef(item.artifact_id)?.effect||"":"";
    return '<article class="loot-item relic-inventory-card '+(active?'is-equipped':'')+'">'+
      '<header><span class="loot-rarity">'+esc(category)+'</span><b>'+(active?'VINCULADA':'RELIQUIA')+'</b></header>'+
      '<h4>'+esc(name)+'</h4>'+
      (effect?'<p class="relic-inventory-effect">'+esc(effect)+'</p>':"")+
      '<div class="loot-actions">'+
        (active
          ?'<button class="ghost-button" type="button" data-relic-unequip-card="'+esc(item.id)+'">DESVINCULAR</button>'
          :'<button class="small-action" type="button" data-relic-equip="'+esc(item.id)+'">VINCULAR</button>')+
      '</div>'+
    '</article>';
  }).join("");
}

function renderArchmageInventory(profile){
  if(!profile?.is_self)return "";
  const state=lootLoad(profile);
  const total=lootEffectiveStats(state);
  return '<section class="archmage-inventory" data-loot-root>'+
    '<div class="profile-section-title"><span>INVENTARIO DEL ARCHIMAGO</span><small>'+state.items.length+' / '+ARCANUM_INVENTORY_CAP+' huecos</small></div>'+
    '<div class="loot-summary"><div><small>PODER DE EQUIPO</small><strong>'+n(total.power)+'</strong></div><div><small>PODER ARCANO</small><strong>+'+n(total.arcane_power)+'</strong></div><div><small>VIDA</small><strong>+'+n(total.life)+'</strong></div><div><small>MANÁ</small><strong>+'+n(total.mana)+'</strong></div></div>'+
    '<div class="loot-equipment">'+ARCANUM_EQUIP_SLOTS.map(slot=>lootEquipmentCard(slot,state)).join("")+canonicalRelicEquipmentCard()+'</div>'+
    '<div class="loot-toolbar"><div><strong>Mochila</strong><small>Botín obtenido en Exploración, Arena y eventos verificados por servidor.</small></div></div>'+
    '<div class="loot-grid">'+(state.items.length?state.items.map(item=>lootItemCard(item,state)).join(""):'<div class="empty">Tu inventario está vacío.</div>')+'</div>'+
    '<div class="loot-relic-vault"><div class="loot-toolbar"><div><strong>Reliquias custodiadas</strong><small>Objetos con nombre, procedencia e historia. Sólo una puede estar vinculada.</small></div></div><div class="loot-grid relic-inventory-grid">'+canonicalRelicInventoryCards()+'</div></div>'+
    '<p class="loot-beta-note">Gear procedural y Reliquias comparten ahora el mismo modelo de equipamiento. La Biblioteca conserva el catálogo, lore e historia mundial.</p>'+
  '</section>';
}
function lootCanEquipInSlot(item,slotKey){
  if(item.slot==="ring")return slotKey==="ring1"||slotKey==="ring2";
  return item.slot===slotKey;
}
function lootPreferredSlot(item,state){
  if(item.slot!=="ring")return item.slot;
  if(!state.equipment.ring1)return "ring1";
  if(!state.equipment.ring2)return "ring2";
  const a=state.items.find(x=>x.id===state.equipment.ring1),b=state.items.find(x=>x.id===state.equipment.ring2);
  return (Number(a?.power)||0)<=(Number(b?.power)||0)?"ring1":"ring2";
}
function lootRefreshProfile(profile){
  if(typeof currentView!=="undefined"&&currentView==="character"&&typeof renderCharacterPage==="function"){
    renderCharacterPage();
    return;
  }
  const host=document.querySelector("[data-loot-root]");
  if(!host)return;
  const wrap=document.createElement("div");
  wrap.innerHTML=renderArchmageInventory(profile);
  host.replaceWith(wrap.firstElementChild);
  wireInventoryPanel(profile);
}
function wireInventoryPanel(profile){
  const root=document.querySelector("[data-loot-root]");if(!root||!profile?.is_self)return;

  root.querySelectorAll("[data-loot-equip]").forEach(btn=>btn.addEventListener("click",async()=>{
    btn.disabled=true;
    try{
      const data=typeof equipCanonicalItem==="function"
        ?await equipCanonicalItem("gear",btn.dataset.lootEquip)
        :await stateApi("/inventory/equip",{method:"POST",body:{item_id:btn.dataset.lootEquip}});
      if(data.inventory)lootSave(profile,data.inventory);lootRefreshProfile(profile);toast((data.item?.name||"Objeto")+" equipado.");
    }catch(e){toast(humanError(e),"error");btn.disabled=false}
  }));

  root.querySelectorAll("[data-loot-unequip]").forEach(btn=>btn.addEventListener("click",async()=>{
    btn.disabled=true;
    try{
      const data=typeof unequipCanonicalSlot==="function"
        ?await unequipCanonicalSlot(btn.dataset.lootUnequip)
        :await stateApi("/inventory/unequip",{method:"POST",body:{slot:btn.dataset.lootUnequip}});
      if(data.inventory)lootSave(profile,data.inventory);lootRefreshProfile(profile);
    }catch(e){toast(humanError(e),"error");btn.disabled=false}
  }));

  root.querySelectorAll("[data-relic-equip]").forEach(btn=>btn.addEventListener("click",async()=>{
    btn.disabled=true;
    try{
      if(typeof equipCanonicalItem!=="function")throw new Error("Sistema canónico de objetos no disponible.");
      await equipCanonicalItem("relic",btn.dataset.relicEquip);
      lootRefreshProfile(profile);
      toast("Reliquia vinculada.");
    }catch(e){toast(humanError(e),"error");btn.disabled=false}
  }));

  root.querySelectorAll("[data-relic-unequip-card]").forEach(btn=>btn.addEventListener("click",async()=>{
    btn.disabled=true;
    try{
      if(typeof unequipCanonicalSlot!=="function")throw new Error("Sistema canónico de objetos no disponible.");
      await unequipCanonicalSlot("relic");
      lootRefreshProfile(profile);
      toast("Reliquia desvinculada.");
    }catch(e){toast(humanError(e),"error");btn.disabled=false}
  }));

  root.querySelector("[data-relic-unequip]")?.addEventListener("click",async btnEvent=>{
    const btn=btnEvent.currentTarget;btn.disabled=true;
    try{
      if(typeof unequipCanonicalSlot==="function")await unequipCanonicalSlot("relic");
      lootRefreshProfile(profile);
      toast("Reliquia desvinculada.");
    }catch(e){toast(humanError(e),"error");btn.disabled=false}
  });

  root.querySelectorAll("[data-loot-destroy]").forEach(btn=>btn.addEventListener("click",async()=>{
    const state=lootLoad(profile),id=btn.dataset.lootDestroy,item=state.items.find(x=>x.id===id);if(!item)return;
    if(!confirm("¿Destruir "+item.name+"?"))return;
    btn.disabled=true;
    try{
      const data=await stateApi("/inventory/destroy",{method:"POST",body:{item_id:id}});
      lootSave(profile,data.inventory);lootRefreshProfile(profile);toast("Objeto destruido.");
    }catch(e){toast(humanError(e),"error");btn.disabled=false}
  }));
}


globalThis.lootCombatBonuses=lootCombatBonuses;
globalThis.lootIsLegacyItem=lootIsLegacyItem;
globalThis.lootHydrateProfile=lootHydrateProfile;
globalThis.lootCacheState=function(profile,state){return lootSave(profile,state);};
