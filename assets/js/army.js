"use strict";

const ARMY_ART_API="https://aihorde.net/api/v2";
const ARMY_ART_ANON_KEY="0000000000";
const ARMY_ART_CLIENT="ARCANUM:0.2.19:https://arcanum-las-cinco-escuelas.onrender.com";
let armyArtJob=null;
let armyArtAutoTimer=null;

function armyArtSignature(army){
  return (army||[]).map(a=>`${a.unit_id}:${Math.max(0,Math.floor(Number(a.quantity)||0))}`).sort().join("|");
}
function armyArtHash(value){
  let h=2166136261;
  for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
  return (h>>>0).toString(36);
}
function armyArtCacheKey(signature){
  const mage=String(realmState?.realm?.mage_name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_");
  return `arcanum_army_art_v1_${mage}_${armyArtHash(signature)}`;
}
function loadArmyArtCache(signature){
  try{const raw=localStorage.getItem(armyArtCacheKey(signature));if(!raw)return null;const data=JSON.parse(raw);return data?.url?data:null;}catch{return null;}
}
function saveArmyArtCache(signature,data){try{localStorage.setItem(armyArtCacheKey(signature),JSON.stringify(data));}catch{}}
function clearArmyArtCache(signature){try{localStorage.removeItem(armyArtCacheKey(signature));}catch{}}
function armyArtTotal(army){return (army||[]).reduce((sum,a)=>sum+Math.max(0,Math.floor(Number(a.quantity)||0)),0);}
function armyArtScale(total){
  if(total<=8)return "a tiny patrol";
  if(total<=30)return "a compact warband";
  if(total<=100)return "a disciplined company";
  if(total<=300)return "a dense battalion";
  if(total<=1000)return "a large regiment";
  if(total<=3000)return "a full field army";
  if(total<=10000)return "a vast host filling the battlefield";
  return "an immense host stretching toward the horizon";
}
function armyArtRole(unit,name){
  const s=String(name||"").toLowerCase();
  if(/milic|infanter|soldad|guard|legion/.test(s))return "medieval infantry with spears, shields and practical armor";
  if(/arqu|ballest|tirador|ranger|bow/.test(s))return "ranged troops with bows or crossbows";
  if(/caball|jinete|knight|palad|caval/.test(s))return "armored cavalry and mounted warriors";
  if(/golem|construct|aut[oó]mat/.test(s))return "massive magical constructs";
  if(/drag[oó]n|drac/.test(s))return "towering dragons and draconic beasts";
  if(/demon|infer|diabl/.test(s))return "demonic shock troops with infernal silhouettes";
  if(/angel|seraf|celest/.test(s))return "radiant celestial warriors";
  if(/espect|fantasm|wraith|shade|sombra/.test(s))return "spectral warriors formed from mist and cold light";
  if(/element|esp[ií]ritu/.test(s))return "elemental or spirit creatures";
  if(unit?.natural_flying)return "flying fantasy troops above the main formation";
  if(unit?.natural_ranged)return "ranged fantasy troops behind the front line";
  return "ground fantasy warriors in battle formation";
}
function armyArtSchoolTheme(code){
  return ({ascendant:"ivory, pale gold and radiant celestial light, disciplined sacred banners",verdant:"deep forest green, living vines, ancient wood and emerald natural magic",eradication:"crimson cloth, blackened iron, sparks, embers and aggressive firelight",abyssal:"violet and black, eldritch mist, obsidian details and unsettling arcane glow",phantasm:"cold blue, silver, spectral fog, translucent magic and moonlit atmosphere"})[code]||"dark iron, worn leather and muted heraldic colors";
}
function armyArtPrompt(army,unitById){
  const sorted=[...(army||[])].filter(a=>Number(a.quantity)>0).sort((a,b)=>Number(b.quantity)-Number(a.quantity));
  const total=armyArtTotal(sorted);
  const composition=sorted.slice(0,10).map(a=>{const u=unitById[a.unit_id]||{};const name=a.name_es||u.name_es||a.unit_id;return `${Math.floor(Number(a.quantity)||0)} ${name} (${armyArtRole(u,name)})`;}).join("; ");
  const extras=sorted.length>10?`; plus ${sorted.length-10} additional minor formations`:"";
  const theme=armyArtSchoolTheme(realmState?.realm?.school_code);
  return ["Epic dark high-fantasy collectible trading-card illustration for the strategy game ARCANUM.",`Depict ${armyArtScale(total)} representing exactly ${total} total units.`,`Army composition: ${composition}${extras}.`,"The visual density and relative formation sizes should follow those quantities: the most numerous unit type dominates the scene, smaller stacks appear as smaller supporting groups.",`School aesthetic: ${theme}.`,"Painterly realism, intricate armor and creature detail, dramatic chiaroscuro, cinematic battlefield depth, rich oil-paint texture, premium classic fantasy card artwork, heroic but ominous mood, cohesive army formation, no graphic frame.","Do not print the unit counts inside the artwork."].join(" ")+" ### text, typography, letters, numbers, logo, watermark, card frame, user interface, modern firearms, science fiction, gore, dismemberment, blurry, low detail, deformed anatomy, duplicated limbs";
}
function armyArtSummary(army){return [...(army||[])].filter(a=>Number(a.quantity)>0).sort((a,b)=>Number(b.quantity)-Number(a.quantity)).slice(0,7).map(a=>`<span><b>${n(a.quantity)}</b> ${esc(a.name_es||a.unit_id)}</span>`).join("");}
function armyArtNormalizeImage(raw){const value=String(raw||"").trim();if(!value)return "";if(/^https?:\/\//i.test(value)||value.startsWith("data:"))return value;return `data:image/webp;base64,${value}`;}
function armyArtSetBusy(busy){const btn=$("#army-art-regenerate");if(btn){btn.disabled=busy;btn.textContent=busy?"GENERANDO…":"REGENERAR ARTE";}$("#army-art-loading")?.classList.toggle("hidden",!busy);}
function armyArtSetStatus(message,check=null){
  const status=$("#army-art-status");if(status)status.textContent=message;
  const queue=$("#army-art-queue");if(queue){if(check&&Number.isFinite(Number(check.wait_time))){const wait=Math.max(0,Math.round(Number(check.wait_time)));const pos=Number.isFinite(Number(check.queue_position))?` · cola ${Math.max(0,Math.round(Number(check.queue_position)))}`:"";queue.textContent=`Espera estimada ${wait}s${pos}`;}else queue.textContent="Generación comunitaria gratuita · puede tardar";}
}
function showArmyArtResult(signature,data){
  const host=$("[data-army-art-signature]");if(!host||host.dataset.armyArtSignature!==signature)return;
  const img=$("#army-art-image");if(img&&data?.url){img.src=data.url;img.classList.remove("hidden");}
  const meta=$("#army-art-meta");if(meta)meta.textContent=data?.model?`IA comunitaria · ${data.model}`:"IA comunitaria · retrato generado";
  armyArtSetStatus("Retrato actualizado con la composición actual de tu ejército.");armyArtSetBusy(false);
}
function armyArtSleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function armyArtFetch(path,options={}){const res=await fetch(`${ARMY_ART_API}${path}`,options);const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data?.message||`AI Horde ${res.status}`);return data;}
async function generateArmyArt(army,unitById,force=false){
  const signature=armyArtSignature(army);if(!signature||armyArtTotal(army)<1)return;
  if(armyArtJob?.signature===signature){toast("Ya hay un retrato de este ejército en la cola.","success",2200);return armyArtJob.promise;}
  if(!force){const cached=loadArmyArtCache(signature);if(cached){showArmyArtResult(signature,cached);return cached;}}else clearArmyArtCache(signature);
  const job={signature,requestId:null,promise:null};
  const task=(async()=>{
    armyArtSetBusy(true);armyArtSetStatus("El cronista visual está reuniendo tus formaciones…");
    const seed=force?String(Math.floor(Math.random()*2147483646)+1):String(parseInt(armyArtHash(`${signature}|${realmState?.realm?.school_code||"plain"}`),36)%2147483646+1);
    const queued=await armyArtFetch("/generate/async",{method:"POST",headers:{"Content-Type":"application/json","apikey":ARMY_ART_ANON_KEY,"Client-Agent":ARMY_ART_CLIENT},body:JSON.stringify({prompt:armyArtPrompt(army,unitById),params:{sampler_name:"k_euler_a",cfg_scale:6.5,seed,width:768,height:512,steps:24,n:1,karras:true},nsfw:false,censor_nsfw:true,trusted_workers:false,slow_workers:true,allow_downgrade:true,replacement_filter:true,r2:true,shared:true})});
    if(!queued?.id)throw new Error(queued?.message||"La red de generación no devolvió un identificador.");
    job.requestId=queued.id;armyArtSetStatus("Retrato solicitado. Esperando a un ilustrador de la red…");
    let check=null;const deadline=Date.now()+9*60*1000;
    while(Date.now()<deadline){await armyArtSleep(5000);check=await armyArtFetch(`/generate/check/${encodeURIComponent(queued.id)}`);if(check?.faulted)throw new Error("La generación ha fallado en la red comunitaria.");if(check?.done)break;const waiting=Number(check?.waiting)||0,processing=Number(check?.processing)||0;armyArtSetStatus(processing>0?"La ilustración está siendo pintada…":waiting>0?"Esperando turno en la cola de ilustración…":"Preparando la ilustración…",check);}
    if(!check?.done)throw new Error("La cola gratuita está tardando demasiado. Puedes volver a intentarlo más tarde.");
    const result=await armyArtFetch(`/generate/status/${encodeURIComponent(queued.id)}`);
    const generation=(result?.generations||[]).find(g=>g?.img&&!g?.censored)||(result?.generations||[]).find(g=>g?.img);
    if(!generation?.img||generation?.censored)throw new Error("La red no ha devuelto una imagen utilizable.");
    const url=armyArtNormalizeImage(generation.img);if(!url)throw new Error("La red devolvió una imagen vacía.");
    const data={url,model:generation.model||"AI Horde",seed:generation.seed||seed,createdAt:Date.now()};
    if(url.startsWith("https://")||url.startsWith("http://"))saveArmyArtCache(signature,data);
    showArmyArtResult(signature,data);return data;
  })().catch(err=>{armyArtSetBusy(false);armyArtSetStatus("No se pudo generar el retrato ahora. La cola comunitaria puede estar saturada.");const meta=$("#army-art-meta");if(meta)meta.textContent=humanError(err);return null;}).finally(()=>{if(armyArtJob===job)armyArtJob=null;});
  job.promise=task;armyArtJob=job;return task;
}
function scheduleArmyArt(army,unitById){
  clearTimeout(armyArtAutoTimer);const signature=armyArtSignature(army);if(!signature||armyArtTotal(army)<1)return;
  const cached=loadArmyArtCache(signature);if(cached){showArmyArtResult(signature,cached);return;}
  if(armyArtJob?.signature===signature){armyArtSetBusy(true);armyArtSetStatus("El retrato de este ejército sigue en proceso…");return;}
  armyArtAutoTimer=setTimeout(()=>generateArmyArt(army,unitById,false),1600);
}

async function renderArmy(){
  const army=await rpc("my_army");const r=realmState.realm;const compatible=catalogs.units.filter(u=>u.acquisition==="recruit"&&(u.school_code==="plain"||u.school_code===r.school_code));const unitById=Object.fromEntries(catalogs.units.map(u=>[u.id,u]));
  const armyRows=army.length?army.map(a=>{const u=unitById[a.unit_id]||{};return `<div class="army-row"><div><strong>${esc(a.name_es)}</strong><small>${u.natural_flying?"Volador":u.natural_ranged?"A distancia":"Terrestre"} · PR ${n(u.power_rank)}</small></div><div><small>UNIDADES</small><strong>${n(a.quantity)}</strong></div><div><small>STACK NP</small><strong>${n(a.stack_np)}</strong></div>${u.undisbandable?`<span class="tag">INDISOLUBLE</span>`:`<button class="small-action disband-btn" data-unit="${esc(a.unit_id)}" data-max="${esc(a.quantity)}">DISOLVER</button>`}</div>`;}).join(""):`<div class="empty">Aún no tienes tropas.</div>`;
  const known=new Set(realmState.known_spells.map(s=>s.spell_id));const summons=catalogs.summons.filter(s=>known.has(s.spell_id)).map(p=>{const sp=catalogs.spells.find(x=>x.id===p.spell_id),u=unitById[p.unit_id];return `<div class="stat-card"><small>INVOCACIÓN</small><strong>${esc(u?.name_es||p.unit_id)}</strong><em>${esc(sp?.name_es||p.spell_id)} · ${n(sp?.base_mana_cost)} maná base · ${n(sp?.cast_turns)} turnos</em><button class="small-action summon-btn" data-spell="${esc(p.spell_id)}" style="margin-top:10px">INVOCAR</button></div>`;}).join("");
  const signature=armyArtSignature(army),total=armyArtTotal(army),cached=signature?loadArmyArtCache(signature):null;
  const armyArt=army.length?`<section class="army-art-panel" data-army-art-signature="${esc(signature)}"><div class="army-art-copy"><span class="section-kicker">VISIÓN DEL EJÉRCITO</span><h3>Retrato de tus fuerzas</h3><p>ARCANUM construye un prompt con tus tipos de unidad y sus cantidades. Si cambia la composición, el retrato se vuelve a generar.</p><div class="army-art-total"><small>FUERZA REPRESENTADA</small><strong>${n(total)}</strong><span>unidades</span></div><div class="army-art-chips">${armyArtSummary(army)}</div><div class="army-art-actions"><button class="small-action" id="army-art-regenerate" type="button">REGENERAR ARTE</button><small id="army-art-queue">Generación comunitaria gratuita · puede tardar</small></div></div><div class="army-art-visual"><img id="army-art-image" class="${cached?.url?"":"hidden"}" ${cached?.url?`src="${esc(cached.url)}"`:""} alt="Representación generada de la composición actual del ejército" /><div id="army-art-loading" class="army-art-loading ${cached?.url?"hidden":""}"><span></span><strong id="army-art-status">Preparando el retrato de tus fuerzas…</strong></div><div class="army-art-vignette" aria-hidden="true"></div><div class="army-art-caption"><span id="army-art-meta">${cached?.model?`IA comunitaria · ${esc(cached.model)}`:"Arte dinámico según composición"}</span><b>${esc(profileSchoolName(r.school_code))}</b></div></div></section>`:`<section class="army-art-panel army-art-empty"><div class="army-art-copy"><span class="section-kicker">VISIÓN DEL EJÉRCITO</span><h3>Tu lienzo está vacío</h3><p>Cuando reclutes tu primera formación, ARCANUM generará automáticamente una ilustración de tus fuerzas.</p></div><div class="army-art-empty-mark">⚔</div></section>`;
  $("#view-host").innerHTML=`${viewHeader("LEGIONES","Ejército","Recluta, invoca y ordena las fuerzas de tu reino.")}${armyArt}<div class="panel" style="margin-bottom:14px"><h3>Formaciones</h3><div class="army-list">${armyRows}</div></div><div class="grid-2"><div class="panel"><h3>Reclutamiento</h3>${compatible.length?`<label class="field-caption">Unidad<select id="recruit-unit">${compatible.map(u=>`<option value="${esc(u.id)}">${esc(u.name_es)} · ${n(u.recruit_gold)} oro/u</option>`).join("")}</select></label><label class="field-caption" style="display:grid;gap:6px;margin-top:10px">Turnos<input id="recruit-turns" type="number" min="1" max="50" value="1"></label><button id="recruit-button" class="primary-action" style="width:100%;margin-top:12px">⚔ RECLUTAR</button>`:`<div class="empty">No hay unidades reclutables compatibles.</div>`}</div><div class="panel"><h3>Invocaciones conocidas</h3>${summons?`<div class="grid-2">${summons}</div>`:`<div class="empty">Aprende hechizos de invocación para traer criaturas a tu ejército.</div>`}</div></div>`;
  $("#recruit-button")?.addEventListener("click",()=>doRecruit($("#recruit-button")));$$(".summon-btn").forEach(b=>b.addEventListener("click",()=>doSummon(b.dataset.spell,b)));$$(".disband-btn").forEach(b=>b.addEventListener("click",()=>doDisband(b.dataset.unit,Number(b.dataset.max),b)));
  $("#army-art-regenerate")?.addEventListener("click",()=>generateArmyArt(army,unitById,true));
  $("#army-art-image")?.addEventListener("error",()=>{clearArmyArtCache(signature);$("#army-art-image")?.classList.add("hidden");armyArtSetStatus("La imagen anterior ya no está disponible. Pulsa REGENERAR ARTE.");});
  scheduleArmyArt(army,unitById);
}
async function doRecruit(btn){const unit=$("#recruit-unit").value,turns=Math.max(1,Math.min(50,Number($("#recruit-turns").value)||1));await actionCall(btn,()=>rpc("recruit_units",{p_unit_id:unit,p_turns:turns}),null,res=>`Reclutadas ${n(res.recruited)} unidades.`);}
async function doSummon(spell,btn){await actionCall(btn,()=>rpc("cast_summon",{p_spell_id:spell}),null,res=>res.success?`Invocación exitosa: ${n(res.summoned)} criaturas.`:"La invocación ha fallado. El coste se ha consumido.");}
async function doDisband(unit,max,btn){const raw=prompt(`¿Cuántas unidades quieres disolver? Máximo ${n(max)}`,String(max));if(raw===null)return;const qty=Math.floor(Number(raw));if(!qty||qty<1||qty>max){toast("Cantidad no válida.","error");return;}await actionCall(btn,()=>rpc("disband_units",{p_unit_id:unit,p_quantity:qty}),`Has disuelto ${n(qty)} unidades.`);}
