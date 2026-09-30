"use strict";

const REALM_AI_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const REALM_AI_VISION_MODEL = "openai/gpt-5.4-nano";
const REALM_AI_TTL = 30 * 60 * 1000;
const realmAiMemory = new Map();

function realmAiTimeOfDay(){
  const h=new Date().getHours();
  if(h<6)return "deep night";
  if(h<12)return "early morning";
  if(h<18)return "afternoon";
  if(h<22)return "sunset and evening";
  return "night";
}

function realmAiAvatarUrl(){
  if(typeof ownProfileBadge!=="undefined" && ownProfileBadge?.avatar_path && typeof profileAvatarUrl==="function"){
    return profileAvatarUrl(ownProfileBadge.avatar_path);
  }
  if(typeof profileDefaultPortraitUrl==="function" && realmState?.realm){
    return profileDefaultPortraitUrl({school_code:realmState.realm.school_code});
  }
  return "";
}

function realmAiCacheKey(){
  const r=realmState?.realm||{};
  const avatar=(typeof ownProfileBadge!=="undefined" && ownProfileBadge?.avatar_path)||"default";
  return [r.mage_name,r.school_code,r.spell_level,r.land,avatar].join("|");
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
  const request = [
    "Describe only the visible appearance of this fantasy character reference for use in an image-generation prompt.",
    "Focus on clothing, face, hair, silhouette, colors, magical motifs and mood.",
    "Do not identify the person, infer ethnicity, age, health, personality, or other sensitive traits.",
    "Return one concise English paragraph, no preamble."
  ].join(" ");
  try{
    const response=await puter.ai.chat(request,avatarUrl,{model:REALM_AI_VISION_MODEL});
    return realmAiResponseText(response).slice(0,900);
  }catch{
    return "";
  }
}

function realmAiBasePrompt(referenceDescription){
  const r=realmState.realm;
  const school=typeof profileSchoolName==="function"?profileSchoolName(r.school_code):(r.school_code||"arcane");
  const progression=typeof realmProgressLabel==="function"?realmProgressLabel(r.land):{name:"growing realm"};
  const character=referenceDescription||(
    r.school_code==="verdant"
      ?"a verdant archmage wearing deep forest robes, living-vine ornaments and emerald arcane details"
      : r.school_code==="eradication"
        ?"a dark eradication archmage in severe occult robes with ember-like magical accents"
        :"a mysterious archmage shaped by their magical school"
  );
  return [
    "Wide cinematic dark-fantasy game banner, 16:6 composition, no text, no logo, no UI.",
    "Show the player's archmage as the main character in the left-to-center foreground, clearly readable but naturally integrated into the landscape.",
    "Character visual reference: "+character+".",
    "School: "+school+". Magical level: "+String(r.spell_level||0)+".",
    "Realm stage: "+progression.name+", approximately "+String(r.land||0)+" acres, believable settlements, defenses and magical infrastructure matching an early evolving kingdom.",
    "Time of day: "+realmAiTimeOfDay()+".",
    "Painterly trading-card fantasy atmosphere, intricate environment, dramatic volumetric light, grounded medieval materials, restrained magic, cinematic depth, premium concept art.",
    "Leave darker negative space behind the interface text on the left; keep the brightest scenery toward the center-right.",
    "Avoid modern objects, readable lettering, frames, watermarks, duplicate characters, distorted anatomy, close-up portrait crop."
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

async function ensureRealmAiArtwork({force=false}={}){
  const img=document.querySelector(".realm-kingdom-image");
  if(!img||!realmState?.realm)return;
  if(!window.puter?.ai?.txt2img){
    realmAiSetStatus("ARTE DINÁMICO NO DISPONIBLE","error");
    return;
  }

  const key=realmAiCacheKey();
  const cached=realmAiMemory.get(key);
  if(!force && cached && Date.now()-cached.at<REALM_AI_TTL){
    realmAiApplyImage(cached.src);
    realmAiSetStatus("ARTE IA · CACHÉ LOCAL","ready");
    return;
  }

  realmAiSetStatus("FORJANDO ESCENA CON IA…","loading");
  const avatarUrl=realmAiAvatarUrl();
  const description=await realmAiDescribeAvatar(avatarUrl);
  const prompt=realmAiBasePrompt(description);

  try{
    const generated=await puter.ai.txt2img(prompt,{
      model:REALM_AI_MODEL,
      width:1536,
      height:640
    });
    const src=generated?.src||generated?.url||"";
    if(!src)throw new Error("La IA no devolvió una imagen utilizable.");
    realmAiMemory.set(key,{src,at:Date.now(),prompt});
    realmAiApplyImage(src);
    realmAiSetStatus("REINO · ARTE IA DINÁMICO","ready");
  }catch(error){
    console.warn("ARCANUM realm AI art:",error);
    realmAiSetStatus("REINO · ARTE BASE","error");
  }
}

window.ensureRealmAiArtwork=ensureRealmAiArtwork;
