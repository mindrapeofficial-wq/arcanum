"use strict";

const archmageSnapshotCache=new Map();

function archmageSnapshotKey(name){return String(name||"").trim().toLowerCase()}

function applyArchmageSnapshot(snapshot){
  if(!snapshot?.profile)return snapshot;
  const profile=snapshot.profile;
  if(snapshot.combat?.raw&&typeof combatCacheProfile==="function"){
    combatCacheProfile(snapshot.combat.raw);
  }
  if(snapshot.inventory&&typeof lootCacheState==="function"){
    lootCacheState(profile,snapshot.inventory);
  }
  if(snapshot.items&&typeof cacheCanonicalItems==="function"){
    cacheCanonicalItems(snapshot.items);
  }
  archmageSnapshotCache.set(archmageSnapshotKey(profile.mage_name),snapshot);
  return snapshot;
}

async function loadArchmageSnapshot(name,{force=true}={}){
  const key=archmageSnapshotKey(name);
  if(!force&&archmageSnapshotCache.has(key))return archmageSnapshotCache.get(key);
  const snapshot=await stateApi("/archmage/"+encodeURIComponent(String(name||"").trim()));
  return applyArchmageSnapshot(snapshot);
}

function getArchmageSnapshot(name){
  return archmageSnapshotCache.get(archmageSnapshotKey(name))||null;
}

globalThis.loadArchmageSnapshot=loadArchmageSnapshot;
globalThis.getArchmageSnapshot=getArchmageSnapshot;
globalThis.applyArchmageSnapshot=applyArchmageSnapshot;
