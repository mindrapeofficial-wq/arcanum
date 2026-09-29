"use strict";

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

function hasArchmageProgression(profile){
  if(!profile || typeof profile!=="object")return false;
  const required=["archmage_level","archmage_xp","archmage_xp_next",...ARCHMAGE_STAT_KEYS];
  return required.every(key=>Number.isFinite(Number(profile[key])));
}

function archmageProgressionFromProfile(profile){
  if(!hasArchmageProgression(profile))return null;
  const level=Math.max(1,Math.floor(Number(profile.archmage_level)));
  const xp=Math.max(0,Math.floor(Number(profile.archmage_xp)));
  const xpNext=Math.max(1,Math.floor(Number(profile.archmage_xp_next)));
  const stats=Object.fromEntries(ARCHMAGE_STAT_KEYS.map(key=>[
    key,
    Math.max(0,Math.floor(Number(profile[key])))
  ]));
  return Object.freeze({
    level,
    xp,
    xpNext,
    xpRatio:Math.min(1,xp/xpNext),
    attributePoints:Math.max(0,Math.floor(Number(profile.attribute_points||0))),
    stats:Object.freeze(stats)
  });
}
