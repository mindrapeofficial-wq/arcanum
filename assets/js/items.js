"use strict";

const ARCANUM_ITEM_MODEL_VERSION=1;
const ARCANUM_ITEM_SLOTS=Object.freeze([
  {key:"weapon",label:"Arma",kind:"gear"},
  {key:"robe",label:"Túnica",kind:"gear"},
  {key:"amulet",label:"Amuleto",kind:"gear"},
  {key:"ring1",label:"Anillo I",kind:"gear"},
  {key:"ring2",label:"Anillo II",kind:"gear"},
  {key:"focus",label:"Foco Arcano",kind:"gear"},
  {key:"relic",label:"Reliquia",kind:"relic"}
]);
let canonicalItemState=null;

function cacheCanonicalItems(state){
  if(state&&typeof state==="object")canonicalItemState=JSON.parse(JSON.stringify(state));
  return canonicalItemState;
}
function getCanonicalItems(){return canonicalItemState?JSON.parse(JSON.stringify(canonicalItemState)):null}
async function loadCanonicalItems(){
  const data=await stateApi("/items");
  cacheCanonicalItems(data?.items||null);
  if(data?.inventory&&typeof lootCacheState==="function"){
    const profile=globalThis.ownProfileBadge||{mage_name:realmState?.realm?.mage_name,is_self:true};
    lootCacheState(profile,data.inventory);
  }
  return data;
}
async function equipCanonicalItem(kind,itemId){
  const data=await stateApi("/items/equip",{method:"POST",body:{kind,item_id:itemId}});
  cacheCanonicalItems(data?.items||null);
  return data;
}
async function unequipCanonicalSlot(slot){
  const data=await stateApi("/items/unequip",{method:"POST",body:{slot}});
  cacheCanonicalItems(data?.items||null);
  return data;
}
function canonicalEquippedRelic(){
  return canonicalItemState?.equipment?.relic||null;
}
function canonicalItemDisplayName(item){
  if(!item)return "Vacío";
  if(item.kind==="relic"&&typeof artifactDef==="function"){
    return artifactDef(item.artifact_id)?.name||item.artifact_id||"Reliquia";
  }
  return item.name||item.raw?.name||"Objeto";
}

globalThis.cacheCanonicalItems=cacheCanonicalItems;
globalThis.getCanonicalItems=getCanonicalItems;
globalThis.loadCanonicalItems=loadCanonicalItems;
globalThis.equipCanonicalItem=equipCanonicalItem;
globalThis.unequipCanonicalSlot=unequipCanonicalSlot;
globalThis.canonicalEquippedRelic=canonicalEquippedRelic;
globalThis.canonicalItemDisplayName=canonicalItemDisplayName;
