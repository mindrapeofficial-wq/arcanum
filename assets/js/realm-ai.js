"use strict";

const REALM_AI_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const REALM_AI_VISION_MODEL = "gpt-5.6-luna";
const REALM_AI_SCENE_MS = 5 * 60 * 1000;
const REALM_AI_ACTIVITY_MS = 20 * 60 * 1000;
const REALM_AI_CYCLE_CHECK_MS = 15000;

const realmAiMemory = new Map();
const realmAiAvatarDescriptions = new Map();
let realmAiInFlight = null;
let realmAiCycleTimer = null;

function realmAiTimeSlot(){
  return Math.floor(Date.now()/REALM_AI_SCENE_MS);
}

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
  return "arcanum_realm_activity_v2_"+mage;
}

function realmAiReadActivity(){
  try{
    const raw=localStorage.getItem(realmAiActivityStorageKey());
    if(!raw)return {kind:"idle",label:"VIDA DEL REINO",detail:"The archmage is overseeing the realm between major actions.",at:0};
    const data=JSON.parse(raw);
    if(!data?.kind || Date.now()-Number(data.at||0)>REALM_AI_ACTIVITY_MS){
      return {kind:"idle",label:"VIDA DEL REINO",detail:"The archmage is overseeing the realm between major actions.",at:0};
    }
    return data;
  }catch{
    return {kind:"idle",label:"VIDA DEL REINO",detail:"The archmage is overseeing the realm between major actions.",at:0};
  }
}

function realmAiWriteActivity(activity){
  try{localStorage.setItem(realmAiActivityStorageKey(),JSON.stringify(activity));}catch{}
}

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
    detail=success
      ?"The archmage has just completed a successful summoning ritual, with newly summoned creatures emerging through controlled magical energy."
      :"The archmage stands in the aftermath of a failed summoning ritual, with dissipating runes and scorched ritual markings.";
  }else if(cls.includes("disband-btn")||text.includes("DISOLVER")){
    kind="army";label="EJÉRCITO";
    detail="The archmage is reorganizing military formations in the mustering grounds while veterans depart and officers redraw the ranks.";
  }else if(cls.includes("attack-btn")||text.includes("ATACAR")||text.includes("ASEDIO")){
    const won=Boolean(result?.attacker_victory),land=Number(result?.land_gained||0),target=ds.target||"a rival realm";
    kind=won?"battle_victory":"battle_defeat";
    label=won?"REGRESO VICTORIOSO":"REGRESO DE BATALLA";
    detail=won
      ?"The archmage is returning from battle against "+target+" with a worn but victorious host"+(land?", carrying standards from "+land+" conquered acres":"")+"."
      :"The archmage is returning from a hard battle against "+target+"; the army is battered and disciplined, with healers and damaged equipment visible, but no graphic gore.";
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
  if(typeof ownProfileBadge!=="undefined" && ownProfileBadge?.avatar_path && typeof profileAvatarUrl==="function"){
    path=profileAvatarUrl(ownProfileBadge.avatar_path);
  }else if(typeof profileDefaultPortraitUrl==="function" && realmState?.realm){
    path=profileDefaultPortraitUrl({school_code:realmState.realm.school_code});
  }
  if(!path)return "";
  try{return new URL(path,location.href).href;}catch{return path;}
}

function realmAiKingdomSignature(){
  const b=realmState?.buildings||{};
  return Object.keys(b).sort().map(k=>k+":"+Number(b[k]||0)).join(",");
}

function realmAiKingdomDescription(){
  const r=realmState?.realm||{},b=realmState?.buildings||{};
  const names={
    farms:"farms",towns:"town districts",nodes:"arcane mana nodes",workshops:"workshops",
    guilds:"mage guild halls",barracks:"barracks",fortresses:"fortresses",barriers:"arcane barriers"
  };
  const developed=Object.entries(b)
    .filter(([,v])=>Number(v||0)>0)
    .sort((a,z)=>Number(z[1]||0)-Number(a[1]||0))
    .slice(0,6)
    .map(([k,v])=>String(v)+" "+(names[k]||k))
    .join(", ");
  const damage=Number(r.pending_territory_damage||0);
  return [
    developed?("Visible realm infrastructure includes "+developed+"."):"The realm is young, sparse and only lightly developed.",
    damage>0?("The realm shows signs of recent territorial damage affecting about "+damage+" acres, with repairs underway."):"",
    Number(b.fortresses||0)>0?"Fortified architecture is visible but does not dominate the whole landscape.":"Defenses are still modest and improvised."
  ].filter(Boolean).join(" ");
}

function realmAiCacheKey(){
  const r=realmState?.realm||{};
  const avatar=(typeof ownProfileBadge!=="undefined" && ownProfileBadge?.avatar_path)||"default";
  const activity=realmAiReadActivity();
  return [
    r.mage_name,r.school_code,r.spell_level,r.land,r.net_power,
    avatar,realmAiKingdomSignature(),activity.kind,Math.floor(Number(activity.at||0)/REALM_AI_SCENE_MS),
    realmAiTimeSlot()
  ].join("|");
}

function realmAiSeed(text){
  let hash=2166136261;
  for(let i=0;i<text.length;i++){
    hash^=text.charCodeAt(i);
    hash=Math.imul(hash,16777619);
  }
  return Math.abs(hash>>>0)%2147483647;
}

function realmAiResponseText(response){
  if(typeof response==="string")return response.trim();
  if(response?.message?.content && typeof response.message.content==="string")return response.message.content.trim();
  if(typeof response?.content==="string")return response.content.trim();
  if(Array.isArray(response?.message?.content)){
    return response.message.content.map(x=>x?.text||x?.content||"").join(" ").trim();
  }
  return "";
}

async function realmAiDescribeAvatar(avatarUrl){
  if(!avatarUrl || !window.puter?.ai?.chat)return "";
  if(realmAiAvatarDescriptions.has(avatarUrl))return realmAiAvatarDescriptions.get(avatarUrl);
  const request=[
    "Describe only visible, non-sensitive visual details of this fantasy character reference for an image-generation prompt.",
    "Focus on hairstyle, facial hair if visible, clothing, armor, silhouette, colors, accessories, magical motifs, lighting and pose.",
    "Do not identify the person and do not infer ethnicity, age, health, personality, occupation, religion, politics or other sensitive traits.",
    "Return one concise English paragraph with no preamble."
  ].join(" ");
  try{
    const response=await puter.ai.chat(request,avatarUrl,{model:REALM_AI_VISION_MODEL});
    const description=realmAiResponseText(response).slice(0,1000);
    if(description)realmAiAvatarDescriptions.set(avatarUrl,description);
    return description;
  }catch(error){
    console.warn("ARCANUM avatar description:",error);
    return "";
  }
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

function realmAiActivityScene(activity){
  if(activity?.detail)return activity.detail;
  return "The archmage is overseeing the realm between major actions.";
}

function realmAiBasePrompt(referenceDescription){
  const r=realmState.realm;
  const school=typeof profileSchoolName==="function"?profileSchoolName(r.school_code):(r.school_code||"arcane");
  const progression=typeof realmProgressLabel==="function"?realmProgressLabel(r.land):{name:"growing realm"};
  const activity=realmAiReadActivity();
  const character=referenceDescription||realmAiDefaultCharacter();

  return [
    "Wide cinematic dark-fantasy game banner, approximately 12:5 aspect ratio, no text, no logo, no frame and no game UI.",
    "This is a living snapshot of the player's current moment, not a static character portrait.",
    "Main character visual reference: "+character+". Preserve the recognizable clothing palette, silhouette and visible accessories from the reference description.",
    "Current action: "+realmAiActivityScene(activity),
    "Magic school: "+school+". Magical level: "+String(r.spell_level||0)+".",
    "Realm stage: "+progression.name+", approximately "+String(r.land||0)+" acres and net power "+String(r.net_power||0)+".",
    realmAiKingdomDescription(),
    "Time of day: "+realmAiTimeOfDay()+". The lighting and daily activity must make sense for that hour.",
    "Compose the archmage in the left-to-center foreground or middle ground, with the kingdom unfolding toward the center and right.",
    "Keep the far-left background darker and simpler because interface text will be drawn over it. Put the brightest landscape detail toward the center-right.",
    "Painterly premium fantasy trading-card atmosphere, grounded medieval materials, dramatic volumetric light, atmospheric perspective, detailed environment, restrained believable magic.",
    "Show only one main archmage. Secondary soldiers, workers, scouts or citizens may appear when the current action calls for them.",
    "Avoid modern objects, readable lettering, watermarks, duplicate main characters, extra limbs, distorted hands, giant close-up faces, excessive glow, gore or horror."
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

function realmAiPruneMemory(){
  if(realmAiMemory.size<=4)return;
  const entries=[...realmAiMemory.entries()].sort((a,z)=>Number(z[1]?.at||0)-Number(a[1]?.at||0));
  realmAiMemory.clear();
  entries.slice(0,4).forEach(([k,v])=>realmAiMemory.set(k,v));
}

function realmAiEnsureCycle(){
  if(realmAiCycleTimer)return;
  realmAiCycleTimer=setInterval(()=>{
    if(document.visibilityState!=="visible")return;
    if(typeof currentView!=="undefined" && currentView!=="realm")return;
    if(!document.querySelector(".realm-kingdom-image"))return;
    ensureRealmAiArtwork();
  },REALM_AI_CYCLE_CHECK_MS);
}

async function ensureRealmAiArtwork({force=false}={}){
  const img=document.querySelector(".realm-kingdom-image");
  if(!img||!realmState?.realm)return;
  realmAiEnsureCycle();

  if(!window.puter?.ai?.txt2img){
    realmAiSetStatus("REINO · ARTE DINÁMICO NO DISPONIBLE","error");
    return;
  }

  const key=realmAiCacheKey();
  const activity=realmAiReadActivity();
  const cached=realmAiMemory.get(key);
  if(!force && cached){
    realmAiApplyImage(cached.src);
    realmAiSetStatus("REINO · "+activity.label+" · ARTE IA","ready");
    return;
  }

  if(realmAiInFlight){
    realmAiSetStatus("FORJANDO ESCENA CON IA…","loading");
    return realmAiInFlight;
  }

  realmAiSetStatus("FORJANDO "+activity.label+" CON IA…","loading");

  const task=(async()=>{
    const avatarUrl=realmAiAvatarUrl();
    const description=await realmAiDescribeAvatar(avatarUrl);
    const prompt=realmAiBasePrompt(description);
    const generated=await puter.ai.txt2img(prompt,{
      model:REALM_AI_MODEL,
      width:1536,
      height:640,
      steps:20,
      guidance:7,
      seed:realmAiSeed(key),
      negative_prompt:"text, logo, watermark, frame, UI, modern objects, duplicate main character, extra limbs, deformed hands, giant face, gore, low detail, blurry"
    });
    const src=generated?.src||generated?.url||"";
    if(!src)throw new Error("La IA no devolvió una imagen utilizable.");
    realmAiMemory.set(key,{src,at:Date.now(),prompt,activity});
    realmAiPruneMemory();

    if(document.querySelector(".realm-kingdom-image") && realmAiCacheKey()===key){
      realmAiApplyImage(src);
      realmAiSetStatus("REINO · "+activity.label+" · ARTE IA","ready");
    }
    return src;
  })();

  realmAiInFlight=task;
  try{
    return await task;
  }catch(error){
    console.warn("ARCANUM realm AI art:",error);
    realmAiSetStatus("REINO · ARTE BASE","error");
    return "";
  }finally{
    if(realmAiInFlight===task)realmAiInFlight=null;
  }
}

window.realmAiCaptureAction=realmAiCaptureAction;
window.realmAiRecordAction=realmAiRecordAction;
window.ensureRealmAiArtwork=ensureRealmAiArtwork;
