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
  if(Array.isArray(data?.delivered)&&data.delivered.length){
    const names=data.delivered.slice(0,2).map(x=>x?.name).filter(Boolean);
    const extra=data.delivered.length>2?" y "+(data.delivered.length-2)+" más":"";
    toast("Recompensas pendientes entregadas: "+names.join(", ")+extra+".","success",5500);
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

function canonicalLootSourceLabel(source){
  return ({
    starter:"Legado inicial",
    legacy_beta:"Beta anterior",
    exploration:"Exploración",
    arena:"Arena clasificada",
    world_boss:"Boss mundial",
    pve:"Expedición PvE",
    event:"Evento"
  })[String(source||"")]||"Origen desconocido";
}
function canonicalLootTierLabel(tier){
  return ({
    starter:"Inicial",
    legacy:"Legado",
    scouting:"Rastreo",
    expedition:"Expedición",
    deep_exploration:"Exploración profunda",
    arena_victory:"Victoria de Arena",
    arena_veteran:"Arena veterana",
    arena_elite:"Arena élite",
    boss_participant:"Participación",
    boss_arcane:"Cofre Arcano",
    boss_major:"Cofre Mayor",
    boss_legend:"Botín legendario",
    pve_room:"Cámara",
    pve_depth:"Profundidad",
    pve_abysm:"Abismo",
    pve_boss:"Jefe de expedición",
    pve_boss_depth:"Jefe de Profundidad",
    pve_boss_abyss:"Jefe del Abismo",
    debug:"Prueba"
  })[String(tier||"")]||String(tier||"");
}
function canonicalLootOriginText(item){
  const origin=item?.origin||item?.raw?.origin||{};
  const source=canonicalLootSourceLabel(origin.source||item?.source);
  const tier=canonicalLootTierLabel(origin.reward_tier||item?.reward_tier);
  return tier&&tier!==source?source+" · "+tier:source;
}
function cacheLootRewardInventory(result){
  if(result?.inventory&&typeof lootCacheState==="function"){
    const profile=globalThis.ownProfileBadge||{mage_name:realmState?.realm?.mage_name,is_self:true};
    lootCacheState(profile,result.inventory);
  }
}
function announceCanonicalLootReward(result,context="Botín"){
  if(!result)return result;
  cacheLootRewardInventory(result);
  if(result.status==="completed"&&result.item){
    const rarity=result.item.rarityLabel||result.item.rarity||"";
    toast(context+": "+result.item.name+(rarity?" · "+rarity:"")+".","success",6000);
  }else if(result.status==="pending_inventory"&&result.item){
    toast("Has encontrado "+result.item.name+", pero la Cámara está llena. La recompensa queda reservada.","success",7000);
  }
  return result;
}
async function startLootExplorationClaim(turns){
  return stateApi("/loot/exploration/start",{method:"POST",body:{turns}});
}
async function completeLootExplorationClaim(claimKey){
  const data=await stateApi("/loot/exploration/complete",{method:"POST",body:{claim_key:claimKey}});
  return announceCanonicalLootReward(data,"Hallazgo de exploración");
}
async function claimArenaLoot(matchId){
  const data=await stateApi("/loot/arena/claim",{method:"POST",body:{match_id:matchId}});
  return data;
}
async function claimWorldBossGear(eventId){
  const data=await stateApi("/loot/boss/claim",{method:"POST",body:{event_id:eventId}});
  return data;
}

globalThis.cacheCanonicalItems=cacheCanonicalItems;
globalThis.getCanonicalItems=getCanonicalItems;
globalThis.loadCanonicalItems=loadCanonicalItems;
globalThis.equipCanonicalItem=equipCanonicalItem;
globalThis.unequipCanonicalSlot=unequipCanonicalSlot;
globalThis.canonicalEquippedRelic=canonicalEquippedRelic;
globalThis.canonicalItemDisplayName=canonicalItemDisplayName;
globalThis.canonicalLootSourceLabel=canonicalLootSourceLabel;
globalThis.canonicalLootTierLabel=canonicalLootTierLabel;
globalThis.canonicalLootOriginText=canonicalLootOriginText;
globalThis.announceCanonicalLootReward=announceCanonicalLootReward;
globalThis.startLootExplorationClaim=startLootExplorationClaim;
globalThis.completeLootExplorationClaim=completeLootExplorationClaim;
globalThis.claimArenaLoot=claimArenaLoot;
globalThis.claimWorldBossGear=claimWorldBossGear;
