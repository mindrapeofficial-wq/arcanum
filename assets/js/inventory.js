"use strict";

const ARCANUM_INVENTORY_VERSION=1;
const ARCANUM_INVENTORY_CAP=20;
const ARCANUM_EQUIP_SLOTS=Object.freeze([
  {key:"weapon",label:"Arma"},
  {key:"robe",label:"Túnica"},
  {key:"amulet",label:"Amuleto"},
  {key:"ring1",label:"Anillo I"},
  {key:"ring2",label:"Anillo II"},
  {key:"artifact",label:"Artefacto"}
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
  {id:"root_heart",slot:"artifact",name:"Corazón de Raíz",minLevel:1,implicit:{willpower:[2,4]}},
  {id:"glass_orb",slot:"artifact",name:"Orbe de Vidrio Estelar",minLevel:6,implicit:{knowledge:[2,5]}},
  {id:"sealed_reliquary",slot:"artifact",name:"Relicario Sellado",minLevel:12,implicit:{arcane_power:[3,6]}}
]);

const LOOT_AFFIXES=Object.freeze([
  {id:"arcane",kind:"prefix",name:"Arcano",stat:"arcane_power",slots:["weapon","robe","amulet","ring","artifact"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"learned",kind:"prefix",name:"Erudito",stat:"knowledge",slots:["weapon","robe","amulet","ring","artifact"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"unyielding",kind:"prefix",name:"Inquebrantable",stat:"willpower",slots:["robe","amulet","ring","artifact"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"sovereign",kind:"prefix",name:"Soberano",stat:"influence",slots:["amulet","ring","artifact"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"vital",kind:"suffix",name:"de la Vitalidad",stat:"life",slots:["robe","amulet","ring","artifact"],tiers:[[4,8],[8,15],[15,24],[24,36],[36,52]],schools:null},
  {id:"mana",kind:"suffix",name:"del Manantial",stat:"mana",slots:["weapon","robe","amulet","ring","artifact"],tiers:[[5,10],[10,18],[18,30],[30,45],[45,65]],schools:null},
  {id:"critical",kind:"suffix",name:"del Ojo Certero",stat:"critical",slots:["weapon","amulet","ring"],tiers:[[1,2],[2,3],[3,5],[5,7],[7,9]],schools:null},
  {id:"ward",kind:"suffix",name:"de la Barrera",stat:"ward",slots:["robe","amulet","artifact"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["ascendant","phantasm"]},
  {id:"growth",kind:"suffix",name:"del Brote Eterno",stat:"regen",slots:["weapon","robe","amulet","ring","artifact"],tiers:[[1,2],[2,4],[4,6],[6,9],[9,13]],schools:["verdant"]},
  {id:"cinders",kind:"suffix",name:"de las Cenizas",stat:"school_damage",slots:["weapon","amulet","ring","artifact"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["eradication"]},
  {id:"abyss",kind:"suffix",name:"del Abismo Susurrante",stat:"school_damage",slots:["weapon","amulet","ring","artifact"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["abyssal"]},
  {id:"mirage",kind:"suffix",name:"del Espejismo",stat:"evasion",slots:["robe","amulet","ring","artifact"],tiers:[[1,2],[2,4],[4,6],[6,9],[9,13]],schools:["phantasm"]},
  {id:"radiance",kind:"suffix",name:"de la Radiancia",stat:"ward",slots:["robe","amulet","artifact"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["ascendant"]}
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
function lootMageKey(profile){
  return "arcanum_inventory_v"+ARCANUM_INVENTORY_VERSION+"_"+String(profile?.mage_name||realmState?.realm?.mage_name||"unknown").toLowerCase();
}
function lootEmptyState(){
  return {version:ARCANUM_INVENTORY_VERSION,items:[],equipment:{weapon:null,robe:null,amulet:null,ring1:null,ring2:null,artifact:null},found:0};
}
function lootLoad(profile){
  try{
    const raw=localStorage.getItem(lootMageKey(profile));
    const parsed=raw?JSON.parse(raw):lootEmptyState();
    if(!parsed||parsed.version!==ARCANUM_INVENTORY_VERSION)return lootEmptyState();
    parsed.items=Array.isArray(parsed.items)?parsed.items.slice(0,ARCANUM_INVENTORY_CAP):[];
    parsed.equipment={...lootEmptyState().equipment,...(parsed.equipment||{})};
    return parsed;
  }catch{return lootEmptyState();}
}
function lootSave(profile,state){
  localStorage.setItem(lootMageKey(profile),JSON.stringify(state));
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
  return ({ascendant:"Ascendente",verdant:"Verdante",eradication:"Erradicación",abyssal:"Abisal",phantasm:"Fantasma",plain:"Neutral"})[code]||code;
}
function lootSlotLabel(slot){
  return ({weapon:"Arma",robe:"Túnica",amulet:"Amuleto",ring:"Anillo",artifact:"Artefacto"})[slot]||slot;
}
function lootItemStats(item){
  const rows=[];
  (item.implicit||[]).forEach(x=>rows.push({label:LOOT_STAT_LABELS[x.stat]||x.stat,value:x.value,implicit:true}));
  (item.affixes||[]).forEach(x=>rows.push({label:LOOT_STAT_LABELS[x.stat]||x.stat,value:x.value,tier:x.tier,rollMin:x.rollMin,rollMax:x.rollMax}));
  return rows;
}
function lootItemCard(item){
  const stats=lootItemStats(item).map(x=>'<li><span>+'+n(x.value)+' '+esc(x.label)+'</span>'+(x.tier?'<small>T'+x.tier+' · '+x.rollMin+'–'+x.rollMax+'</small>':'<small>implícito</small>')+'</li>').join("");
  return '<article class="loot-item rarity-'+esc(item.rarity)+'" data-loot-id="'+esc(item.id)+'">'+
    '<header><span class="loot-rarity">'+esc(item.rarityLabel)+'</span><b>iP '+n(item.power)+'</b></header>'+
    '<h4>'+esc(item.name)+'</h4><div class="loot-meta">'+esc(lootSlotLabel(item.slot))+' · Nv. '+n(item.level)+' · '+esc(lootSchoolLabel(item.affinity))+'</div>'+
    '<ul>'+stats+'</ul><div class="loot-actions"><button class="small-action" type="button" data-loot-equip="'+esc(item.id)+'">EQUIPAR</button><button class="ghost-button" type="button" data-loot-destroy="'+esc(item.id)+'">DESTRUIR</button></div>'+
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
function lootEquipmentCard(slot,state){
  const itemId=state.equipment[slot.key],item=state.items.find(x=>x.id===itemId);
  if(!item)return '<div class="loot-equip-slot"><small>'+esc(slot.label)+'</small><span>Vacío</span></div>';
  return '<div class="loot-equip-slot filled rarity-'+esc(item.rarity)+'"><small>'+esc(slot.label)+'</small><strong>'+esc(item.name)+'</strong><span>iP '+n(item.power)+'</span><button class="loot-unequip" type="button" data-loot-unequip="'+esc(slot.key)+'">×</button></div>';
}
function renderArchmageInventory(profile){
  if(!profile?.is_self)return "";
  let state=lootLoad(profile);
  if(!state.items.length){
    state.items=[lootGenerate(profile,"common"),lootGenerate(profile,"uncommon"),lootGenerate(profile,"rare")];
    lootSave(profile,state);
  }
  const total=lootEffectiveStats(state);
  return '<section class="archmage-inventory" data-loot-root>'+
    '<div class="profile-section-title"><span>INVENTARIO DEL ARCHIMAGO</span><small>'+state.items.length+' / '+ARCANUM_INVENTORY_CAP+' huecos</small></div>'+
    '<div class="loot-summary"><div><small>PODER DE EQUIPO</small><strong>'+n(total.power)+'</strong></div><div><small>PODER ARCANO</small><strong>+'+n(total.arcane_power)+'</strong></div><div><small>VIDA</small><strong>+'+n(total.life)+'</strong></div><div><small>MANÁ</small><strong>+'+n(total.mana)+'</strong></div></div>'+
    '<div class="loot-equipment">'+ARCANUM_EQUIP_SLOTS.map(slot=>lootEquipmentCard(slot,state)).join("")+'</div>'+
    '<div class="loot-toolbar"><div><strong>Cámara del Archimago</strong><small>Botín procedural controlado · cada pieza nace con rolls propios.</small></div><button class="profile-action" type="button" data-loot-test-drop '+(state.items.length>=ARCANUM_INVENTORY_CAP?'disabled':'')+'>✦ HALLAZGO DE PRUEBA</button></div>'+
    '<div class="loot-grid">'+(state.items.length?state.items.map(lootItemCard).join(""):'<div class="empty">Tu Cámara está vacía.</div>')+'</div>'+
    '<p class="loot-beta-note">Prueba de beta: el botón de hallazgo permite validar rarezas, afijos, tiers y equipamiento. Cuando activemos PvE, esta generación pasará a expediciones, jefes y eventos.</p>'+
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
  const host=document.querySelector("[data-loot-root]");
  if(!host)return;
  const wrap=document.createElement("div");
  wrap.innerHTML=renderArchmageInventory(profile);
  host.replaceWith(wrap.firstElementChild);
  wireInventoryPanel(profile);
}
function wireInventoryPanel(profile){
  const root=document.querySelector("[data-loot-root]");if(!root||!profile?.is_self)return;
  root.querySelector("[data-loot-test-drop]")?.addEventListener("click",()=>{
    const state=lootLoad(profile);
    if(state.items.length>=ARCANUM_INVENTORY_CAP){toast("Tu inventario está lleno.","error");return;}
    const item=lootGenerate(profile);
    state.items.push(item);state.found=(state.found||0)+1;lootSave(profile,state);
    toast("Has encontrado: "+item.name+" · "+item.rarityLabel);
    lootRefreshProfile(profile);
  });
  root.querySelectorAll("[data-loot-equip]").forEach(btn=>btn.addEventListener("click",()=>{
    const state=lootLoad(profile),item=state.items.find(x=>x.id===btn.dataset.lootEquip);if(!item)return;
    const slot=lootPreferredSlot(item,state);if(!lootCanEquipInSlot(item,slot))return;
    state.equipment[slot]=item.id;lootSave(profile,state);lootRefreshProfile(profile);toast(item.name+" equipado.");
  }));
  root.querySelectorAll("[data-loot-unequip]").forEach(btn=>btn.addEventListener("click",()=>{
    const state=lootLoad(profile);state.equipment[btn.dataset.lootUnequip]=null;lootSave(profile,state);lootRefreshProfile(profile);
  }));
  root.querySelectorAll("[data-loot-destroy]").forEach(btn=>btn.addEventListener("click",()=>{
    const state=lootLoad(profile),id=btn.dataset.lootDestroy,item=state.items.find(x=>x.id===id);if(!item)return;
    if(!confirm("¿Destruir "+item.name+"?"))return;
    Object.keys(state.equipment).forEach(k=>{if(state.equipment[k]===id)state.equipment[k]=null;});
    state.items=state.items.filter(x=>x.id!==id);lootSave(profile,state);lootRefreshProfile(profile);toast("Objeto destruido.");
  }));
}
