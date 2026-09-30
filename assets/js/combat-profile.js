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
function combatProfileKey(name){return "arcanum_combat_profile_v1_"+String(name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_")}
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
    weapon:weapon,
    trait:trait,
    abilities:[a1,a2],
    levelBonuses:[]
  };
}
function getCombatProfile(profileOrRealm){
  const src=profileOrRealm||realmState?.realm||{};
  const name=src.mage_name||realmState?.realm?.mage_name||"Archimago";
  const school=src.school_code||realmState?.realm?.school_code||"ascendant";
  let data=null;
  try{data=JSON.parse(localStorage.getItem(combatProfileKey(name))||"null")}catch(e){}
  if(!data||data.version!==1||data.school!==school){
    data=combatBaseProfile(name,school);
    try{localStorage.setItem(combatProfileKey(name),JSON.stringify(data))}catch(e){}
  }
  return data;
}
function combatDerived(profile){
  const c=getCombatProfile(profile),s=c.stats,w=c.weapon,t=c.trait?.mods||{};
  const maxHp=Math.round((115+s.vitality*12+s.endurance*4)*(1+(t.hp||0)));
  const attack=Math.round(s.strength*3.1+s.precision*1.1+(w.min+w.max)/2);
  const armor=Math.round(s.endurance*2.8+s.will*1.2);
  const speed=Math.max(1,s.speed*1.25+s.agility*.55+w.speed);
  const crit=Math.min(.4,.03+s.fortune*.007+s.precision*.003+(t.crit||0));
  const dodge=Math.min(.35,.02+s.agility*.008+s.speed*.003+(t.dodge||0));
  const block=Math.min(.35,w.block*.01+s.endurance*.002+(t.block||0));
  return {maxHp,attack,armor,speed,crit,dodge,block,regen:t.regen||0,lifesteal:t.lifesteal||0,secondWind:!!t.secondWind,accuracy:t.accuracy||0,fortune:t.fortune||0};
}
function renderCombatIdentity(profile){
  const c=getCombatProfile(profile),d=combatDerived(profile);
  const stats=Object.entries(c.stats).map(function(entry){return '<div class="combat-stat"><small>'+esc(COMBAT_STAT_META[entry[0]])+'</small><strong>'+n(entry[1])+'</strong></div>'}).join("");
  const abilities=c.abilities.map(function(a){return '<div class="combat-ability"><strong>'+esc(a.name)+'</strong><span>'+esc(a.desc)+'</span></div>'}).join("");
  return '<section class="combat-identity"><div class="profile-section-title"><span>IDENTIDAD DE COMBATE</span><small>semilla permanente #'+c.seed+'</small></div>'+
    '<div class="combat-summary"><div class="combat-weapon"><small>ARMA INICIAL</small><strong>'+esc(c.weapon.name)+'</strong><span>'+esc(c.weapon.type)+' · '+c.weapon.min+'–'+c.weapon.max+' daño · '+esc(c.weapon.effect)+'</span></div><div class="combat-trait"><small>RASGO</small><strong>'+esc(c.trait.name)+'</strong><span>'+esc(c.trait.desc)+'</span></div></div>'+
    '<div class="combat-stats">'+stats+'</div>'+
    '<div class="combat-derived"><span>❤ '+n(d.maxHp)+'</span><span>⚔ '+n(d.attack)+'</span><span>◆ '+n(d.armor)+'</span><span>⌁ '+d.speed.toFixed(1)+'</span><span>✦ '+Math.round(d.crit*100)+'% crítico</span><span>◌ '+Math.round(d.dodge*100)+'% esquiva</span></div>'+
    '<div class="profile-section-title combat-abilities-title"><span>HABILIDADES</span><small>activación automática en combate</small></div><div class="combat-abilities">'+abilities+'</div></section>';
}
globalThis.getCombatProfile=getCombatProfile;
globalThis.combatDerived=combatDerived;
globalThis.renderCombatIdentity=renderCombatIdentity;
