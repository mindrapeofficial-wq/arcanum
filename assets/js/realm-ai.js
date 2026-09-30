"use strict";

const REALM_ART_API="https://aihorde.net/api/v2";
const REALM_ART_ANON_KEY="0000000000";
const REALM_ART_CLIENT="ARCANUM:0.2.36:https://arcanum-las-cinco-escuelas.onrender.com";
const REALM_ART_SCENE_MS=5*60*1000;
const REALM_ART_ACTIVITY_MS=20*60*1000;
const REALM_ART_CYCLE_CHECK_MS=15000;

const realmAiMemory=new Map();
let realmAiInFlight=null;
let realmAiCycleTimer=null;

function realmAiTimeSlot(){return Math.floor(Date.now()/REALM_ART_SCENE_MS);}
function realmAiTimeOfDay(){
  const h=new Date().getHours();
  if(h<6)return "deep night, moonlit and quiet";
  if(h<9)return "cold early morning, first light";
  if(h<13)return "clear late morning";
  if(h<18)return "afternoon";
  if(h<21)return "sunset and early evening";
  return "night, torchlight and arcane lamps";
}
function realmAiActivityStorageKey(){
  const mage=String(realmState?.realm?.mage_name||"anonymous").toLowerCase().replace(/[^a-z0-9_-]+/g,"_");
  return "arcanum_realm_activity_v3_"+mage;
}
function realmAiReadActivity(){
  try{
    const raw=localStorage.getItem(realmAiActivityStorageKey());
    if(!raw)return {kind:"idle",label:"VIDA DEL REINO",detail:"The archmage is overseeing the realm between major actions.",at:0};
    const data=JSON.parse(raw);
    if(!data?.kind||Date.now()-Number(data.at||0)>REALM_ART_ACTIVITY_MS)return {kind:"idle",label:"VIDA DEL REINO",detail:"The archmage is overseeing the realm between major actions.",at:0};
    return data;
  }catch{return {kind:"idle",label:"VIDA DEL REINO",detail:"The archmage is overseeing the realm between major actions.",at:0};}
}
function realmAiWriteActivity(activity){try{localStorage.setItem(realmAiActivityStorageKey(),JSON.stringify(activity));}catch{}}
function realmAiSelectedText(selector){
  const el=document.querySelector(selector);
  return String(el?.selectedOptions?.[0]?.textContent||el?.value||"").trim();
}
function realmAiCaptureAction(btn){
  if(!btn)return {view:typeof currentView==="string"?currentView:"",id:"",text:"",dataset:{}};
  const dataset={...btn.dataset};
  const buildings=[];
  document.querySelectorAll("[data-building]").forEach(input=>{
    const qty=Math.max(0,Math.floor(Number(input.value)||0));
    if(!qty)return;
    const key=input.dataset.building;
    const name=(typeof buildMeta!=="undefined"&&buildMeta?.[key]?.[0])||key;
    buildings.push({key,name,qty});
  });
  return {
    view:typeof currentView==="string"?currentView:"",
    id:String(btn.id||""),
    text:String(btn.textContent||"").replace(/\s+/g," ").trim(),
    className:String(btn.className||""),
    dataset,
    buildings,
    research:realmAiSelectedText("#research-spell"),
    recruit:realmAiSelectedText("#recruit-unit"),
    turns:Number(document.querySelector("#econ-turns")?.value||document.querySelector("#research-turns")?.value||document.querySelector("#recruit-turns")?.value||document.querySelector("#explore-turns")?.value||document.querySelector("#realm-explore-turns")?.value||0)
  };
}
function realmAiRecordAction(context={},result={}){
  const id=String(context.id||"").toLowerCase();
  const text=String(context.text||"").toUpperCase();
  const cls=String(context.className||"").toLowerCase();
  const ds=context.dataset||{};
  let kind="realm",label="VIDA DEL REINO",detail="The archmage is actively administering the realm.";

  if(id.includes("explore")||text.includes("EXPLORAR")){
    const gained=Number(result?.land_gained||0);
    kind="explore";label="EXPLORACIÓN";
    detail="The archmage is personally surveying a newly discovered frontier with scouts, mapmakers and a small expedition"+(gained?", after claiming "+gained+" new acres":"")+".";
  }else if(id==="build-button"||text.includes("CONSTRUIR")){
    const plan=(context.buildings||[]).map(x=>x.qty+" "+x.name).join(", ");
    kind="build";label="CONSTRUCCIÓN";
    detail="The archmage is supervising active construction works across the realm"+(plan?", especially "+plan:"")+", with workers, scaffolds, carts, stone and timber visible.";
  }else if(id==="research-button"||text.includes("INVESTIGAR")){
    kind="research";label="INVESTIGACIÓN";
    detail="The archmage is studying magic inside an arcane library and ritual chamber"+(context.research?", researching "+context.research:"")+", surrounded by grimoires, diagrams, candles and restrained magical light.";
  }else if(id==="recruit-button"||text.includes("RECLUTAR")){
    kind="recruit";label="RECLUTAMIENTO";
    detail="The archmage is inspecting fresh military recruits in a fortified training yard"+(context.recruit?", with the new formation based on "+context.recruit:"")+".";
  }else if(cls.includes("summon-btn")||text.includes("INVOCAR")){
    const success=Boolean(result?.success);
    kind="summon";label="INVOCACIÓN";
    detail=success?"The archmage has just completed a successful summoning ritual, with newly summoned creatures emerging through controlled magical energy.":"The archmage stands in the aftermath of a failed summoning ritual, with dissipating runes and scorched ritual markings.";
  }else if(cls.includes("disband-btn")||text.includes("DISOLVER")){
    kind="army";label="EJÉRCITO";
    detail="The archmage is reorganizing military formations in the mustering grounds while veterans depart and officers redraw the ranks.";
  }else if(cls.includes("attack-btn")||text.includes("ATACAR")||text.includes("ASEDIO")){
    const won=Boolean(result?.attacker_victory),land=Number(result?.land_gained||0),target=ds.target||"a rival realm";
    kind=won?"battle_victory":"battle_defeat";
    label=won?"REGRESO VICTORIOSO":"REGRESO DE BATALLA";
    detail=won?"The archmage is returning from battle against "+target+" with a worn but victorious host"+(land?", carrying standards from "+land+" conquered acres":"")+".":"The archmage is returning from a hard battle against "+target+"; the army is battered and disciplined, with healers and damaged equipment visible, but no graphic gore.";
  }else if(cls.includes("econ-action")||context.view==="economy"){
    const action=String(ds.action||"").toUpperCase();
    if(action==="TAX"){
      kind="economy_tax";label="RECAUDACIÓN";
      detail="The archmage is overseeing the realm treasury and tax convoys in a busy medieval market district, with ledgers, guarded coin chests and merchants.";
    }else if(action==="MP_CHARGE"){
      kind="economy_mana";label="CARGA DE MANÁ";
      detail="The archmage is directing mana collection at glowing arcane nodes, with disciplined mages channeling energy into the realm reserves.";
    }else{
      kind="economy";label="ECONOMÍA";
      detail="The archmage is overseeing everyday production, trade, farms, workshops and supply carts as the realm works through a productive cycle.";
    }
  }
  const activity={kind,label,detail,at:Date.now()};
  realmAiWriteActivity(activity);
  return activity;
}
function realmAiAvatarUrl(){
  let path="";
  if(typeof ownProfileBadge!=="undefined"&&ownProfileBadge?.avatar_path&&typeof profileAvatarUrl==="function")path=profileAvatarUrl(ownProfileBadge.avatar_path);
  else if(typeof profileDefaultPortraitUrl==="function"&&realmState?.realm)path=profileDefaultPortraitUrl({school_code:realmState.realm.school_code});
  if(!path)return "";
  try{return new URL(path,location.href).href;}catch{return path;}
}
async function realmAiAvatarBase64(){
  const url=realmAiAvatarUrl();
  if(!url)return "";
  try{
    const res=await fetch(url,{mode:"cors",cache:"force-cache"});
    if(!res.ok)return "";
    const blob=await res.blob();
    if(!/^image\//i.test(blob.type)||blob.size>2.5*1024*1024)return "";
    const buf=new Uint8Array(await blob.arrayBuffer());
    let binary="";
    const chunk=0x8000;
    for(let i=0;i<buf.length;i+=chunk)binary+=String.fromCharCode(...buf.subarray(i,i+chunk));
    return btoa(binary);
  }catch{return "";}
}
function realmAiKingdomSignature(){
  const b=realmState?.buildings||{};
  return Object.keys(b).sort().map(k=>k+":"+Number(b[k]||0)).join(",");
}
function realmAiKingdomDescription(){
  const r=realmState?.realm||{},b=realmState?.buildings||{};
  const names={farms:"farms",towns:"town districts",nodes:"arcane mana nodes",workshops:"workshops",guilds:"mage guild halls",barracks:"barracks",fortresses:"fortresses",barriers:"arcane barriers"};
  const developed=Object.entries(b).filter(([,v])=>Number(v||0)>0).sort((a,z)=>Number(z[1]||0)-Number(a[1]||0)).slice(0,6).map(([k,v])=>String(v)+" "+(names[k]||k)).join(", ");
  const damage=Number(r.pending_territory_damage||0);
  return [
    developed?("Visible realm infrastructure includes "+developed+"."):"The realm is young, sparse and only lightly developed.",
    damage>0?("The realm shows signs of recent territorial damage affecting about "+damage+" acres, with repairs underway."):"",
    Number(b.fortresses||0)>0?"Fortified architecture is visible but does not dominate the whole landscape.":"Defenses are still modest and improvised."
  ].filter(Boolean).join(" ");
}
function realmAiDefaultCharacter(){
  const code=realmState?.realm?.school_code;
  const presets={
    verdant:"a Verdant archmage in deep forest robes, living-vine ornaments, botanical sigils and restrained emerald magic",
    eradication:"an Eradication archmage in dark severe robes with ember-like sigils, scorched metal details and restrained destructive magic",
    ascendant:"an Ascendant archmage in pale ceremonial robes, sun-metal details and disciplined luminous warding magic",
    abyssal:"an Abyssal archmage in shadowed ritual garments, obsidian ornaments and controlled violet-black occult energy",
    phantasm:"a Phantasm archmage in layered scholar robes, mirrored charms and subtle blue-violet illusion magic"
  };
  return presets[code]||"a mysterious archmage whose clothing and magic reflect their arcane school";
}
function realmAiCacheKey(){
  const r=realmState?.realm||{};
  const avatar=(typeof ownProfileBadge!=="undefined"&&ownProfileBadge?.avatar_path)||"default";
  const activity=realmAiReadActivity();
  return [r.mage_name,r.school_code,r.spell_level,r.land,r.net_power,avatar,realmAiKingdomSignature(),activity.kind,Math.floor(Number(activity.at||0)/REALM_ART_SCENE_MS),realmAiTimeSlot()].join("|");
}
function realmAiHash(value){
  let hash=2166136261;
  for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return Math.abs(hash>>>0).toString(36);
}
function realmAiCacheStorageKey(key){
  const mage=String(realmState?.realm?.mage_name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_");
  return "arcanum_realm_art_v2_"+mage+"_"+realmAiHash(key);
}
function realmAiLoadCache(key){
  if(realmAiMemory.has(key))return realmAiMemory.get(key);
  try{
    const raw=localStorage.getItem(realmAiCacheStorageKey(key));
    if(!raw)return null;
    const data=JSON.parse(raw);
    if(data?.url){realmAiMemory.set(key,data);return data;}
  }catch{}
  return null;
}
function realmAiSaveCache(key,data){
  realmAiMemory.set(key,data);
  try{if(data?.url&&(/^https?:\/\//i).test(data.url))localStorage.setItem(realmAiCacheStorageKey(key),JSON.stringify(data));}catch{}
}
function realmAiNormalizeImage(raw){
  const value=String(raw||"").trim();
  if(!value)return "";
  if((/^https?:\/\//i).test(value)||value.startsWith("data:"))return value;
  return "data:image/webp;base64,"+value;
}
function realmAiBasePrompt(){
  const r=realmState.realm;
  const school=typeof profileSchoolName==="function"?profileSchoolName(r.school_code):(r.school_code||"arcane");
  const progression=typeof realmProgressLabel==="function"?realmProgressLabel(r.land):{name:"growing realm"};
  const activity=realmAiReadActivity();
  return [
    "Wide cinematic dark-fantasy illustration for the strategy game ARCANUM, approximately 16:7 aspect ratio.",
    "Show one main archmage as the protagonist, "+realmAiDefaultCharacter()+".",
    "Current action: "+activity.detail,
    "Magic school: "+school+". Magical level: "+String(r.spell_level||0)+".",
    "Realm stage: "+progression.name+", approximately "+String(r.land||0)+" acres and net power "+String(r.net_power||0)+".",
    realmAiKingdomDescription(),
    "Time of day: "+realmAiTimeOfDay()+". Daily activity and lighting must make sense for that hour.",
    "The archmage belongs in the left-to-center foreground or middle ground while the kingdom expands toward the center and right.",
    "Keep the far-left background darker and simpler because interface text is overlaid there. Place the brightest environmental detail center-right.",
    "Painterly premium fantasy trading-card atmosphere, grounded medieval materials, dramatic chiaroscuro, atmospheric perspective, rich oil-paint texture, detailed environment, restrained believable magic.",
    "If an image reference is supplied, preserve the main subject's recognizable silhouette, face structure, hairstyle, clothing palette and visible accessories while transforming them naturally into this fantasy scene.",
    "No text, no logo, no frame, no UI, no modern objects, no duplicate main character, no giant close-up face, no gore."
  ].join(" ");
}
function realmAiSetStatus(text,tone=""){
  const el=document.querySelector("[data-realm-ai-status]");
  if(!el)return;
  el.textContent=text;
  el.dataset.tone=tone;
}
function realmAiApplyImage(src){
  const img=document.querySelector(".realm-kingdom-image");
  if(!img||!src)return false;
  img.src=src;
  img.classList.add("realm-ai-image");
  img.alt="Escena dinámica del Archimago y su reino generada por IA";
  img.removeAttribute("aria-hidden");
  return true;
}
function realmAiSleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function realmAiFetch(path,options={}){
  const res=await fetch(REALM_ART_API+path,options);
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data?.message||("AI Horde "+res.status));
  return data;
}
function realmAiEnsureCycle(){
  if(realmAiCycleTimer)return;
  realmAiCycleTimer=setInterval(()=>{
    if(document.visibilityState!=="visible")return;
    if(typeof currentView!=="undefined"&&currentView!=="realm")return;
    if(!document.querySelector(".realm-kingdom-image"))return;
    ensureRealmAiArtwork();
  },REALM_ART_CYCLE_CHECK_MS);
}
async function ensureRealmAiArtwork({force=false}={}){
  const img=document.querySelector(".realm-kingdom-image");
  if(!img||!realmState?.realm)return;
  realmAiEnsureCycle();

  const key=realmAiCacheKey();
  const activity=realmAiReadActivity();
  const cached=!force?realmAiLoadCache(key):null;
  if(cached?.url){
    realmAiApplyImage(cached.url);
    realmAiSetStatus("REINO · "+activity.label+" · ARTE IA","ready");
    return cached.url;
  }

  if(realmAiInFlight?.key===key)return realmAiInFlight.promise;
  if(realmAiInFlight)return realmAiInFlight.promise;

  realmAiSetStatus("FORJANDO "+activity.label+" CON IA COMUNITARIA…","loading");

  const job={key,promise:null,requestId:null};
  const task=(async()=>{
    const sourceImage=await realmAiAvatarBase64();
    const seed=String(parseInt(realmAiHash(key),36)%2147483646+1);
    const body={
      prompt:realmAiBasePrompt()+" ### text, typography, letters, numbers, logo, watermark, frame, user interface, modern objects, science fiction, gore, dismemberment, blurry, low detail, deformed anatomy, duplicated limbs",
      params:{sampler_name:"k_euler_a",cfg_scale:6.5,seed,width:1024,height:448,steps:24,n:1,karras:true},
      nsfw:false,censor_nsfw:true,trusted_workers:false,slow_workers:true,allow_downgrade:true,replacement_filter:true,r2:true,shared:true
    };
    if(sourceImage){
      body.source_image=sourceImage;
      body.source_processing="img2img";
      body.params.denoising_strength=.72;
    }
    const queued=await realmAiFetch("/generate/async",{method:"POST",headers:{"Content-Type":"application/json","apikey":REALM_ART_ANON_KEY,"Client-Agent":REALM_ART_CLIENT},body:JSON.stringify(body)});
    if(!queued?.id)throw new Error("La red comunitaria no aceptó la solicitud.");
    job.requestId=queued.id;
    realmAiSetStatus("ESCENA SOLICITADA · ESPERANDO ILUSTRADOR…","loading");

    const deadline=Date.now()+4*60*1000;
    let check=null;
    while(Date.now()<deadline){
      await realmAiSleep(5000);
      check=await realmAiFetch("/generate/check/"+encodeURIComponent(queued.id));
      if(check?.faulted)throw new Error("La generación ha fallado en la red comunitaria.");
      if(check?.done)break;
      const waiting=Number(check?.waiting)||0,processing=Number(check?.processing)||0;
      realmAiSetStatus(processing>0?"PINTANDO LA ESCENA DEL REINO…":waiting>0?"ARTE IA · EN COLA COMUNITARIA…":"PREPARANDO LA ESCENA…","loading");
    }
    if(!check?.done)throw new Error("La generación tardó demasiado.");
    const result=await realmAiFetch("/generate/status/"+encodeURIComponent(queued.id));
    const generation=Array.isArray(result?.generations)?result.generations[0]:null;
    if(!generation?.img||generation?.censored)throw new Error("La red no devolvió una imagen utilizable.");
    const url=realmAiNormalizeImage(generation.img);
    if(!url)throw new Error("La red devolvió una imagen vacía.");
    const data={url,at:Date.now(),model:generation.model||"stable_diffusion",activity:activity.kind};
    realmAiSaveCache(key,data);

    if(document.querySelector(".realm-kingdom-image")&&realmAiCacheKey()===key){
      realmAiApplyImage(url);
      realmAiSetStatus("REINO · "+activity.label+" · IA COMUNITARIA","ready");
    }
    return url;
  })().catch(error=>{
    console.warn("ARCANUM realm community art:",error);
    realmAiSetStatus("REINO · ARTE BASE · IA EN ESPERA","error");
    return "";
  }).finally(()=>{if(realmAiInFlight===job)realmAiInFlight=null;});

  job.promise=task;
  realmAiInFlight=job;
  return task;
}

window.realmAiCaptureAction=realmAiCaptureAction;
window.realmAiRecordAction=realmAiRecordAction;
window.ensureRealmAiArtwork=ensureRealmAiArtwork;
