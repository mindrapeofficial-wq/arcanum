"use strict";

const ARCHMAGE_LEVEL_CAP = 50;
const ARCHMAGE_ATTRIBUTE_CAP = 20;
const ARCHMAGE_BASE_ATTRIBUTE = 1;
const ARCHMAGE_POINTS_PER_LEVEL = 1;

const ARCHMAGE_STAT_KEYS = Object.freeze([
  "arcane_power",
  "knowledge",
  "willpower",
  "influence"
]);

const ARCHMAGE_STAT_META = Object.freeze({
  arcane_power:{label:"Poder Arcano",description:"Potencia personal aplicada a hechizos y efectos arcanos."},
  knowledge:{label:"Conocimiento",description:"Dominio del saber, investigación y futuros desafíos de exploración."},
  willpower:{label:"Voluntad",description:"Resistencia frente a presión, corrupción y efectos mágicos."},
  influence:{label:"Influencia",description:"Peso personal en diplomacia, liderazgo y futuras interacciones sociales."}
});

const ARCHMAGE_IDENTITY_META = Object.freeze({
  arcane_power:{title:"Dominio Arcano",description:"Tu desarrollo se inclina hacia la potencia mágica y el control de fuerzas arcanas."},
  knowledge:{title:"Mente Erudita",description:"Tu desarrollo se inclina hacia el estudio, la investigación y la comprensión de lo desconocido."},
  willpower:{title:"Voluntad Inquebrantable",description:"Tu desarrollo se inclina hacia la resistencia mental, la disciplina y el dominio propio."},
  influence:{title:"Voz del Cónclave",description:"Tu desarrollo se inclina hacia el liderazgo, la diplomacia y el peso de tu palabra."},
  hybrid:{title:"Sendero Híbrido",description:"Tus mayores aptitudes están repartidas entre varios caminos arcanos."},
  balanced:{title:"Equilibrio Arcano",description:"Tus cuatro aptitudes avanzan en equilibrio, sin que ninguna domine todavía."}
});

function archmageIdentityFromProgression(progression){
  if(!progression?.stats)return null;
  const values=ARCHMAGE_STAT_KEYS.map(key=>[key,Number(progression.stats[key])||0]);
  const max=Math.max(...values.map(([,value])=>value));
  const leaders=values.filter(([,value])=>value===max).map(([key])=>key);
  const key=leaders.length===ARCHMAGE_STAT_KEYS.length?"balanced":leaders.length>1?"hybrid":leaders[0];
  const meta=ARCHMAGE_IDENTITY_META[key];
  return Object.freeze({key,title:meta.title,description:meta.description,leaders:Object.freeze(leaders)});
}

function archmageXpForNextLevel(level){
  const current=Math.max(1,Math.min(ARCHMAGE_LEVEL_CAP,Math.floor(Number(level)||1)));
  if(current>=ARCHMAGE_LEVEL_CAP)return 0;
  const x=current-1;
  return Math.round((100+(45*x)+(2*x*x))/10)*10;
}

function archmageTotalXpForLevel(level){
  const target=Math.max(1,Math.min(ARCHMAGE_LEVEL_CAP,Math.floor(Number(level)||1)));
  let total=0;
  for(let current=1;current<target;current++)total+=archmageXpForNextLevel(current);
  return total;
}

function archmageProgressFromTotalXp(totalXp){
  const total=Math.max(0,Math.floor(Number(totalXp)||0));
  let level=1;
  let floorXp=0;
  while(level<ARCHMAGE_LEVEL_CAP){
    const needed=archmageXpForNextLevel(level);
    if(total<floorXp+needed)break;
    floorXp+=needed;
    level++;
  }
  const xp=level>=ARCHMAGE_LEVEL_CAP?0:Math.max(0,total-floorXp);
  const xpNext=archmageXpForNextLevel(level);
  return Object.freeze({
    level,
    totalXp:total,
    xp,
    xpNext,
    xpRatio:level>=ARCHMAGE_LEVEL_CAP?1:Math.min(1,xp/xpNext)
  });
}

function archmageEarnedAttributePoints(level){
  const current=Math.max(1,Math.min(ARCHMAGE_LEVEL_CAP,Math.floor(Number(level)||1)));
  return (current-1)*ARCHMAGE_POINTS_PER_LEVEL;
}

function hasArchmageProgression(profile){
  if(!profile || typeof profile!=="object")return false;
  const hasStats=ARCHMAGE_STAT_KEYS.every(key=>Number.isFinite(Number(profile[key])));
  const hasCanonicalXp=Number.isFinite(Number(profile.archmage_total_xp));
  const hasLegacyXp=["archmage_level","archmage_xp","archmage_xp_next"].every(key=>Number.isFinite(Number(profile[key])));
  return hasStats&&(hasCanonicalXp||hasLegacyXp);
}

function archmageProgressionFromProfile(profile){
  if(!hasArchmageProgression(profile))return null;

  let progress;
  if(Number.isFinite(Number(profile.archmage_total_xp))){
    progress=archmageProgressFromTotalXp(profile.archmage_total_xp);
  }else{
    const level=Math.max(1,Math.min(ARCHMAGE_LEVEL_CAP,Math.floor(Number(profile.archmage_level))));
    const xp=Math.max(0,Math.floor(Number(profile.archmage_xp)));
    const xpNext=level>=ARCHMAGE_LEVEL_CAP?0:Math.max(1,Math.floor(Number(profile.archmage_xp_next)));
    progress=Object.freeze({
      level,
      totalXp:null,
      xp:level>=ARCHMAGE_LEVEL_CAP?0:xp,
      xpNext,
      xpRatio:level>=ARCHMAGE_LEVEL_CAP?1:Math.min(1,xp/xpNext)
    });
  }

  const stats=Object.fromEntries(ARCHMAGE_STAT_KEYS.map(key=>[
    key,
    Math.max(ARCHMAGE_BASE_ATTRIBUTE,Math.min(ARCHMAGE_ATTRIBUTE_CAP,Math.floor(Number(profile[key]))))
  ]));

  return Object.freeze({
    ...progress,
    attributePoints:Math.max(0,Math.floor(Number(profile.attribute_points||0))),
    stats:Object.freeze(stats)
  });
}
