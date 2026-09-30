"use strict";

const COMBAT_STAT_META = Object.freeze({
  vitality:"Vida",
  strength:"Fuerza",
  agility:"Agilidad",
  speed:"Velocidad",
  endurance:"Resistencia",
  precision:"Precisión",
  will:"Voluntad",
  fortune:"Fortuna"
});

const COMBAT_WEAPONS = Object.freeze([
  {id:"ash_staff",name:"Bastón de Fresno",type:"Bastón",min:7,max:11,speed:0,block:4,school:"verdant",effect:"Regeneración +3%"},
  {id:"sun_blade",name:"Espada Solar",type:"Espada",min:8,max:13,speed:1,block:3,school:"ascendant",effect:"Precisión +4%"},
  {id:"ember_maul",name:"Martillo de Ascua",type:"Martillo",min:11,max:17,speed:-2,block:1,school:"eradication",effect:"Crítico +5%"},
  {id:"void_scythe",name:"Guadaña del Vacío",type:"Guadaña",min:9,max:15,speed:-1,block:2,school:"abyssal",effect:"Robo de vida +6%"},
  {id:"glass_daggers",name:"Dagas de Cristal",type:"Dagas",min:6,max:10,speed:3,block:0,school:"phantasm",effect:"Ataque doble +8%"},
  {id:"iron_sword",name:"Espada de Hierro",type:"Espada",min:8,max:12,speed:0,block:2,school:null,effect:"Equilibrada"},
  {id:"war_axe",name:"Hacha de Guerra",type:"Hacha",min:10,max:16,speed:-1,block:1,school:null,effect:"Daño alto"},
  {id:"hunter_bow",name:"Arco del Cazador",type:"Arco",min:7,max:12,speed:2,block:0,school:null,effect:"Primer golpe +10%"},
  {id:"arcane_tome",name:"Grimorio Menor",type:"Grimorio",min:5,max:9,speed:0,block:1,school:null,effect:"Voluntad +2"},
  {id:"thorn_sickle",name:"Hoz de Espinas",type:"Hoz",min:8,max:14,speed:1,block:1,school:"verdant",effect:"Veneno +6%"}
]);

const COMBAT_TRAITS = Object.freeze([
  {id:"forest_blood",name:"Sangre del Bosque",school:"verdant",desc:"+8% regeneración.",mods:{regen:.08}},
  {id:"solar_guard",name:"Guardia Solar",school:"ascendant",desc:"+8% bloqueo.",mods:{block:.08}},
  {id:"destructor",name:"Instinto Destructor",school:"eradication",desc:"+7% crítico.",mods:{crit:.07}},
  {id:"void_hunger",name:"Hambre del Vacío",school:"abyssal",desc:"+8% robo de vida.",mods:{lifesteal:.08}},
  {id:"ethereal",name:"Paso Etéreo",school:"phantasm",desc:"+7% esquiva.",mods:{dodge:.07}},
  {id:"colossus",name:"Coloso",school:null,desc:"+18% vida, -8% velocidad.",mods:{hp:.18,speed:-.08}},
  {id:"duelist",name:"Duelista",school:null,desc:"+5% crítico y +5% precisión.",mods:{crit:.05,accuracy:.05}},
  {id:"iron_skin",name:"Piel de Hierro",school:null,desc:"+10% resistencia.",mods:{armor:.10}},
  {id:"lucky",name:"Nacido con Fortuna",school:null,desc:"+10% Fortuna.",mods:{fortune:.10}},
  {id:"second_wind",name:"Segundo Aliento",school:null,desc:"Una vez por combate puede recuperar vida.",mods:{secondWind:true}}
]);

const COMBAT_ABILITIES = Object.freeze([
  {id:"roots",name:"Raíces",school:"verdant",desc:"Puede inmovilizar y retrasar al rival."},
  {id:"toxic_spores",name:"Esporas Tóxicas",school:"verdant",desc:"Los impactos pueden aplicar veneno."},
  {id:"solar_aegis",name:"Égida Solar",school:"ascendant",desc:"Genera un escudo periódico."},
  {id:"judgement",name:"Juicio Radiante",school:"ascendant",desc:"Golpe preciso con bonificación contra rivales heridos."},
  {id:"flame_break",name:"Ruptura Ígnea",school:"eradication",desc:"Golpe explosivo de alto daño."},
  {id:"execution",name:"Ejecución",school:"eradication",desc:"Aumenta el daño contra objetivos con poca vida."},
  {id:"dark_pact",name:"Pacto Sombrío",school:"abyssal",desc:"Convierte parte del daño en curación."},
  {id:"soul_bite",name:"Mordisco del Alma",school:"abyssal",desc:"Reduce temporalmente la voluntad rival."},
  {id:"phase_step",name:"Paso Irreal",school:"phantasm",desc:"Puede evitar por completo un ataque."},
  {id:"mirror_strike",name:"Golpe Espejo",school:"phantasm",desc:"Puede repetir un ataque con daño reducido."},
  {id:"disarm",name:"Desarme",school:null,desc:"Pequeña probabilidad de reducir el daño del arma rival."},
  {id:"counter",name:"Contraataque",school:null,desc:"Puede responder inmediatamente tras bloquear."},
  {id:"weapon_master",name:"Maestro de Armas",school:null,desc:"+10% eficacia del arma equipada."},
  {id:"last_word",name:"Última Palabra",school:null,desc:"Pequeña probabilidad de atacar al caer."}
]);

function combatHash(str){
  let h=2166136261;
  for(const ch of String(str)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
  return h>>>0;
}
function combatRng(seed){
  let x=combatHash(seed)||0x9e3779b9;
  return function(){x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
function combatPick(rng,arr){return arr[Math.floor(rng()*arr.length)]}
function combatClone(value){return JSON.parse(JSON.stringify(value))}
const combatServerCache=new Map();
function combatNameKey(name){return String(name||"anon").trim().toLowerCase()}
function combatProfileKey(name){return "arcanum_combat_profile_v1_"+combatNameKey(name).replace(/[^a-z0-9_-]+/g,"_")}
function combatCurrentLevel(profile){
  try{
    const p=typeof archmageProgressionFromProfile==="function"?archmageProgressionFromProfile(profile):null;
    if(p?.level)return Math.max(1,Number(p.level)||1);
  }catch(e){}
  return Math.max(1,Number(profile?.archmage_level||1));
}
function combatLegacyRaw(name){
  try{return JSON.parse(localStorage.getItem(combatProfileKey(name))||"null")}catch(e){return null}
}
function combatCacheProfile(data){
  if(data?.name)combatServerCache.set(combatNameKey(data.name),combatClone(data));
  return data;
}
async function combatHydrateProfile(profile){
  const name=profile?.mage_name||realmState?.realm?.mage_name||"";
  if(!name)return null;
  if(profile?.is_self){
    const snap=await stateApi("/snapshot");
    let combat=combatCacheProfile(snap?.combat);
    const legacy=combatLegacyRaw(name);
    if((combat?.levelBonuses||[]).length===0&&(legacy?.levelBonuses||[]).length){
      const choices=(legacy.levelBonuses||[]).map(function(x){return {level:Number(x.level),option_id:String(x.id||"")}}).filter(function(x){return x.level>=2&&x.option_id});
      if(choices.length){
        const migrated=await stateApi("/combat/import-legacy",{method:"POST",body:{choices:choices}});
        combat=combatCacheProfile(migrated?.combat||combat);
      }
    }
    return combat;
  }
  const data=await stateApi("/combat/"+encodeURIComponent(name));
  return combatCacheProfile(data?.combat);
}
function combatBaseProfile(name,school){
  const rng=combatRng("ARCANUM|"+String(name).toLowerCase()+"|"+String(school)+"|combat-v1");
  const stats={};
  Object.keys(COMBAT_STAT_META).forEach(function(k){stats[k]=4+Math.floor(rng()*8)});
  stats.vitality+=2+Math.floor(rng()*4);
  const affinity={
    verdant:["vitality","endurance","will"],
    ascendant:["precision","will","endurance"],
    eradication:["strength","fortune","precision"],
    abyssal:["will","strength","vitality"],
    phantasm:["agility","speed","precision"]
  }[school]||[];
  affinity.forEach(function(k){stats[k]+=2+Math.floor(rng()*3)});
  const weaponPool=COMBAT_WEAPONS.filter(function(w){return !w.school||w.school===school});
  const weighted=weaponPool.concat(weaponPool.filter(function(w){return w.school===school}),weaponPool.filter(function(w){return w.school===school}));
  const weapon=combatPick(rng,weighted);
  const traitPool=COMBAT_TRAITS.filter(function(t){return !t.school||t.school===school});
  const traitWeighted=traitPool.concat(traitPool.filter(function(t){return t.school===school}));
  const trait=combatPick(rng,traitWeighted);
  const schoolAbilities=COMBAT_ABILITIES.filter(function(a){return a.school===school});
  const genericAbilities=COMBAT_ABILITIES.filter(function(a){return !a.school});
  const a1=combatPick(rng,schoolAbilities);
  let a2=combatPick(rng,genericAbilities.concat(schoolAbilities));
  if(a2.id===a1.id)a2=combatPick(rng,genericAbilities);
  return {
    version:1,
    seed:combatHash(String(name)+"|"+school+"|combat-v1"),
    generatedAt:"permanent",
    name:String(name),
    school:String(school),
    stats:stats,
    weapon:combatClone(weapon),
    trait:combatClone(trait),
    bonusTraits:[],
    abilities:[combatClone(a1),combatClone(a2)],
    levelBonuses:[]
  };
}
function combatLoadRaw(profileOrRealm){
  const src=profileOrRealm||realmState?.realm||{};
  const name=src.mage_name||realmState?.realm?.mage_name||"Arconte";
  const school=src.school_code||realmState?.realm?.school_code||"ascendant";
  let data=combatServerCache.get(combatNameKey(name))||null;
  if(!data||data.version!==1||data.school!==school)data=combatBaseProfile(name,school);
  data=combatClone(data);
  data.stats=data.stats||{};
  data.weapon=data.weapon||combatBaseProfile(name,school).weapon;
  data.trait=data.trait||combatBaseProfile(name,school).trait;
  data.bonusTraits=Array.isArray(data.bonusTraits)?data.bonusTraits:[];
  data.abilities=Array.isArray(data.abilities)?data.abilities:[];
  data.levelBonuses=Array.isArray(data.levelBonuses)?data.levelBonuses:[];
  return data;
}
function combatSaveRaw(data){
  combatCacheProfile(data);
}
function combatApplyBonus(state,bonus){
  const effect=bonus?.effect||{};
  if(effect.type==="stat"&&COMBAT_STAT_META[effect.stat]){
    state.stats[effect.stat]=Number(state.stats[effect.stat]||0)+Number(effect.amount||0);
  }else if(effect.type==="ability"&&effect.ability){
    if(!state.abilities.some(function(x){return x.id===effect.ability.id}))state.abilities.push(combatClone(effect.ability));
  }else if(effect.type==="weapon"&&effect.weapon){
    state.weapon=combatClone(effect.weapon);
  }else if(effect.type==="trait"&&effect.trait){
    if(state.trait?.id!==effect.trait.id&&!state.bonusTraits.some(function(x){return x.id===effect.trait.id}))state.bonusTraits.push(combatClone(effect.trait));
  }
}
function combatEffective(raw,maxLevel=Infinity){
  const state=combatClone(raw);
  state.bonusTraits=Array.isArray(state.bonusTraits)?state.bonusTraits:[];
  state.levelBonuses=[];
  (raw.levelBonuses||[]).slice().sort(function(a,b){return a.level-b.level}).forEach(function(bonus){
    if(Number(bonus.level)<=maxLevel){
      combatApplyBonus(state,bonus);
      state.levelBonuses.push(combatClone(bonus));
    }
  });
  return state;
}
function getCombatProfile(profileOrRealm){
  return combatEffective(combatLoadRaw(profileOrRealm));
}
function combatTraitMods(c){
  const traits=[c.trait].concat(c.bonusTraits||[]).filter(Boolean);
  const mods={hp:0,speed:0,crit:0,dodge:0,block:0,regen:0,lifesteal:0,armor:0,accuracy:0,fortune:0,secondWind:false};
  traits.forEach(function(t){
    const m=t.mods||{};
    ["hp","speed","crit","dodge","block","regen","lifesteal","armor","accuracy","fortune"].forEach(function(k){mods[k]+=Number(m[k]||0)});
    if(m.secondWind)mods.secondWind=true;
  });
  return mods;
}
function combatDerived(profile){
  const c=getCombatProfile(profile),s=c.stats,w=c.weapon,t=combatTraitMods(c);
  const abilityIds=new Set((c.abilities||[]).map(function(a){return a.id}));
  let maxHp=Math.round((115+s.vitality*12+s.endurance*4)*(1+t.hp));
  let attack=Math.round(s.strength*3.1+s.precision*1.1+(w.min+w.max)/2);
  let armor=Math.round((s.endurance*2.8+s.will*1.2)*(1+t.armor));
  let speed=Math.max(1,(s.speed*1.25+s.agility*.55+w.speed)*(1+t.speed));
  let crit=.03+s.fortune*.007+s.precision*.003+t.crit;
  let dodge=.02+s.agility*.008+s.speed*.003+t.dodge;
  let block=w.block*.01+s.endurance*.002+t.block;
  let regen=t.regen, lifesteal=t.lifesteal, accuracy=t.accuracy;
  let doubleStrike=0,weaponPoison=0,firstStrike=0;
  if(w.id==="ash_staff")regen+=.03;
  if(w.id==="sun_blade")accuracy+=.04;
  if(w.id==="ember_maul")crit+=.05;
  if(w.id==="void_scythe")lifesteal+=.06;
  if(w.id==="glass_daggers")doubleStrike+=.08;
  if(w.id==="hunter_bow")firstStrike+=.10;
  if(w.id==="thorn_sickle")weaponPoison+=.06;
  if(w.id==="arcane_tome")armor+=2.4;
  if(abilityIds.has("weapon_master"))attack=Math.round(attack*1.10);
  const gear=(typeof lootCombatBonuses==="function"?lootCombatBonuses(profile):null)||{};
  maxHp+=Math.round(Number(gear.maxHp)||0);
  attack+=Math.round(Number(gear.attack)||0);
  armor+=Math.round(Number(gear.armor)||0);
  speed+=Number(gear.speed)||0;
  crit+=Number(gear.crit)||0;
  dodge+=Number(gear.dodge)||0;
  block+=Number(gear.block)||0;
  regen+=Number(gear.regen)||0;
  accuracy+=Number(gear.accuracy)||0;
  return {
    maxHp,
    attack,
    armor,
    speed,
    crit:Math.min(.45,crit),
    dodge:Math.min(.38,dodge),
    block:Math.min(.38,block),
    regen:Math.min(.25,regen),
    lifesteal:Math.min(.30,lifesteal),
    secondWind:t.secondWind,
    accuracy,
    fortune:t.fortune+(Number(gear.fortune)||0),
    doubleStrike,
    weaponPoison,
    firstStrike,
    equipmentPower:Number(gear.equipmentPower)||0,
    equipmentMana:Number(gear.mana)||0
  };
}

function combatStatEvolution(rng,level){
  const keys=Object.keys(COMBAT_STAT_META);
  const stat=combatPick(rng,keys);
  const amount=level%5===0?3:2;
  return {
    id:"L"+level+"-stat-"+stat+"-"+amount,
    kind:"stat",
    icon:"＋",
    title:"+"+amount+" "+COMBAT_STAT_META[stat],
    desc:"Tu cuerpo arcano se adapta permanentemente.",
    effect:{type:"stat",stat:stat,amount:amount}
  };
}
function combatAbilityEvolution(rng,raw,state,level){
  const pool=COMBAT_ABILITIES.filter(function(a){return (!a.school||a.school===raw.school)&&!state.abilities.some(function(x){return x.id===a.id})});
  if(!pool.length)return combatStatEvolution(rng,level);
  const ability=combatClone(combatPick(rng,pool));
  return {id:"L"+level+"-ability-"+ability.id,kind:"ability",icon:"✦",title:ability.name,desc:ability.desc,effect:{type:"ability",ability:ability}};
}
function combatTraitEvolution(rng,raw,state,level){
  const owned=new Set([state.trait?.id].concat((state.bonusTraits||[]).map(function(x){return x.id})));
  const pool=COMBAT_TRAITS.filter(function(t){return (!t.school||t.school===raw.school)&&!owned.has(t.id)});
  if(!pool.length)return combatStatEvolution(rng,level);
  const trait=combatClone(combatPick(rng,pool));
  return {id:"L"+level+"-trait-"+trait.id,kind:"trait",icon:"◆",title:trait.name,desc:trait.desc,effect:{type:"trait",trait:trait}};
}
function combatWeaponEvolution(rng,raw,state,level){
  const pool=COMBAT_WEAPONS.filter(function(w){return (!w.school||w.school===raw.school)&&w.id!==state.weapon?.id});
  if(!pool.length)return combatStatEvolution(rng,level);
  const base=combatClone(combatPick(rng,pool));
  const bonus=1+Math.floor(level/5);
  base.min+=bonus;
  base.max+=bonus*2;
  base.evolutionLevel=level;
  base.effect=base.effect+" · Forjada en nivel "+level;
  return {
    id:"L"+level+"-weapon-"+base.id+"-"+bonus,
    kind:"weapon",
    icon:"⚔",
    title:base.name,
    desc:base.type+" · "+base.min+"–"+base.max+" daño · "+base.effect,
    effect:{type:"weapon",weapon:base}
  };
}
function combatEvolutionOptions(profile,level){
  const raw=combatLoadRaw(profile);
  const before=combatEffective(raw,Number(level)-1);
  const rng=combatRng(raw.seed+"|evolution|"+level+"|two-paths-v1");
  const factories=[
    combatStatEvolution,
    combatAbilityEvolution,
    combatTraitEvolution,
    combatWeaponEvolution
  ];
  const firstFactory=factories[Math.floor(rng()*factories.length)];
  let secondFactory=factories[Math.floor(rng()*factories.length)];
  if(secondFactory===firstFactory)secondFactory=factories[(factories.indexOf(firstFactory)+1+Math.floor(rng()*3))%factories.length];
  const make=function(factory){return factory===combatStatEvolution?factory(rng,level):factory(rng,raw,before,level)};
  let a=make(firstFactory),b=make(secondFactory);
  if(b.id===a.id)b=combatStatEvolution(rng,level);
  return [a,b];
}
function combatPendingLevel(profile){
  const level=combatCurrentLevel(profile);
  const raw=combatLoadRaw(profile);
  const chosen=new Set((raw.levelBonuses||[]).map(function(x){return Number(x.level)}));
  for(let l=2;l<=level;l++)if(!chosen.has(l))return l;
  return null;
}
async function combatChooseEvolution(profile,level,optionId){
  if(!profile?.is_self)throw new Error("Solo puedes evolucionar tu propio Arconte.");
  const currentLevel=combatCurrentLevel(profile);
  level=Number(level);
  if(level<2||level>currentLevel)throw new Error("Ese nivel todavía no está disponible.");
  const option=combatEvolutionOptions(profile,level).find(function(x){return x.id===optionId});
  if(!option)throw new Error("La opción de evolución ya no es válida.");
  const data=await stateApi("/combat/evolve",{method:"POST",body:{level:level,option_id:optionId}});
  combatCacheProfile(data?.combat);
  return data?.chosen||option;
}
function renderCombatEvolution(profile){
  if(!profile?.is_self)return "";
  const raw=combatLoadRaw(profile);
  const level=combatCurrentLevel(profile);
  const pending=combatPendingLevel(profile);
  const history=(raw.levelBonuses||[]).slice().sort(function(a,b){return b.level-a.level}).slice(0,6);
  let choice="";
  if(pending){
    const options=combatEvolutionOptions(profile,pending);
    choice='<section class="combat-evolution pending"><div class="profile-section-title"><span>EVOLUCIÓN PENDIENTE · NIVEL '+pending+'</span><small>'+(level-pending+1)+' elección'+(level-pending+1===1?"":"es")+' pendiente'+(level-pending+1===1?"":"s")+'</small></div>'+
      '<p class="combat-evolution-intro">Elige un destino. La otra posibilidad desaparecerá para este Arconte.</p>'+
      '<div class="combat-choice-grid">'+options.map(function(o){
        return '<button type="button" class="combat-choice" data-combat-evolution="'+esc(o.id)+'" data-combat-level="'+pending+'"><i>'+esc(o.icon)+'</i><span><small>'+esc(o.kind.toUpperCase())+'</small><strong>'+esc(o.title)+'</strong><em>'+esc(o.desc)+'</em></span><b>ELEGIR</b></button>';
      }).join("")+'</div></section>';
  }else if(level>=2){
    choice='<section class="combat-evolution complete"><div class="profile-section-title"><span>EVOLUCIÓN</span><small>destinos al día</small></div><p class="combat-evolution-intro">Has resuelto todas las elecciones disponibles hasta el nivel '+level+'.</p></section>';
  }
  const historyHtml=history.length?'<div class="combat-evolution-history"><div class="profile-section-title"><span>HUELLAS DE EVOLUCIÓN</span><small>'+raw.levelBonuses.length+' decisiones</small></div>'+history.map(function(h){
    return '<div><span>NIVEL '+h.level+'</span><strong>'+esc(h.title)+'</strong><small>'+esc(h.desc||"")+'</small></div>';
  }).join("")+'</div>':"";
  return choice+historyHtml;
}
function renderCombatIdentity(profile){
  const c=getCombatProfile(profile),d=combatDerived(profile);
  const stats=Object.entries(c.stats).map(function(entry){return '<div class="combat-stat"><small>'+esc(COMBAT_STAT_META[entry[0]])+'</small><strong>'+n(entry[1])+'</strong></div>'}).join("");
  const abilities=c.abilities.map(function(a){return '<div class="combat-ability"><strong>'+esc(a.name)+'</strong><span>'+esc(a.desc)+'</span></div>'}).join("");
  const traits=[c.trait].concat(c.bonusTraits||[]).filter(Boolean);
  const traitText=traits.map(function(t){return '<span class="combat-trait-chip"><b>'+esc(t.name)+'</b><small>'+esc(t.desc)+'</small></span>'}).join("");
  return '<section class="combat-identity"><div class="profile-section-title"><span>IDENTIDAD DE COMBATE</span><small>semilla permanente #'+c.seed+'</small></div>'+
    '<div class="combat-summary"><div class="combat-weapon"><small>ARMA EQUIPADA</small><strong>'+esc(c.weapon.name)+'</strong><span>'+esc(c.weapon.type)+' · '+c.weapon.min+'–'+c.weapon.max+' daño · '+esc(c.weapon.effect)+'</span></div><div class="combat-trait"><small>RASGOS</small><div class="combat-trait-list">'+traitText+'</div></div></div>'+
    '<div class="combat-stats">'+stats+'</div>'+
    '<div class="combat-derived"><span>❤ '+n(d.maxHp)+'</span><span>⚔ '+n(d.attack)+'</span><span>◆ '+n(d.armor)+'</span><span>⌁ '+d.speed.toFixed(1)+'</span><span>✦ '+Math.round(d.crit*100)+'% crítico</span><span>◌ '+Math.round(d.dodge*100)+'% esquiva</span>'+(d.equipmentPower?'<span class="combat-gear-power">⬡ '+n(d.equipmentPower)+' poder de equipo</span>':'')+'</div>'+
    '<div class="profile-section-title combat-abilities-title"><span>HABILIDADES</span><small>activación automática en combate</small></div><div class="combat-abilities">'+abilities+'</div>'+
    renderCombatEvolution(profile)+'</section>';
}
function wireCombatEvolution(profile){
  document.querySelectorAll("[data-combat-evolution]").forEach(function(btn){
    btn.addEventListener("click",async function(){
      const level=Number(btn.dataset.combatLevel),id=btn.dataset.combatEvolution;
      const option=combatEvolutionOptions(profile,level).find(function(x){return x.id===id});
      if(!option)return;
      if(!confirm("¿Elegir “"+option.title+"” para el nivel "+level+"? La otra opción desaparecerá."))return;
      const old=btn.innerHTML;btn.disabled=true;
      try{
        const chosen=await combatChooseEvolution(profile,level,id);
        toast("Evolución elegida: "+(chosen?.title||option.title)+".","success");
        await openPlayerProfile(profile.mage_name);
      }catch(e){toast(humanError(e),"error");btn.disabled=false;btn.innerHTML=old}
    });
  });
}

globalThis.getCombatProfile=getCombatProfile;
globalThis.combatDerived=combatDerived;
globalThis.renderCombatIdentity=renderCombatIdentity;
globalThis.wireCombatEvolution=wireCombatEvolution;
globalThis.combatEvolutionOptions=combatEvolutionOptions;
globalThis.combatHydrateProfile=combatHydrateProfile;
globalThis.combatCacheProfile=combatCacheProfile;
