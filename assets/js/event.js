"use strict";

let bossPollTimer=null;
let bossRenderBusy=false;

function bossPhase(hpPct,status){
  if(status==="defeated")return "BOSS DERROTADO";
  if(status==="closed")return "BRECHA CERRADA";
  return hpPct>66?"I · HAMBRE":hpPct>33?"II · FRACTURA":"III · ECLIPSE";
}
function bossTimeText(endsAt){
  const ms=Math.max(0,new Date(endsAt).getTime()-Date.now());
  if(ms<=0)return "EVENTO FINALIZADO";
  const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);
  return `${d}d ${h}h ${m}m`;
}
function bossDamageEstimate(){
  const p=Math.max(1,Number(realmState?.realm?.net_power||1));
  return Math.max(650,Math.min(25000,Math.round(500+Math.sqrt(p)*24)));
}
function bossRequestId(){
  if(crypto?.randomUUID)return crypto.randomUUID();
  const a=crypto.getRandomValues(new Uint8Array(16));
  a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
  const h=[...a].map(x=>x.toString(16).padStart(2,"0"));
  return `${h.slice(0,4).join("")}-${h.slice(4,6).join("")}-${h.slice(6,8).join("")}-${h.slice(8,10).join("")}-${h.slice(10).join("")}`;
}
async function bossApi(path="",{method="GET",body}={}){
  const session=await validSession();
  if(!session?.access_token)throw new Error("Tu sesión ha caducado. Vuelve a entrar.");
  const res=await fetch(BOSS_API+path,{
    method,
    headers:{
      Authorization:`Bearer ${session.access_token}`,
      ...(body?{"Content-Type":"application/json"}:{})
    },
    body:body?JSON.stringify(body):undefined,
    cache:"no-store"
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok){
    const code=String(data?.error||"BOSS_ERROR");
    const map={
      NOT_ENOUGH_TURNS:"Necesitas al menos 3 turnos para abrir la brecha.",
      BOSS_NOT_ACTIVE:"El Devorador ya no puede ser atacado.",
      BOSS_NOT_STARTED:"La Brecha todavía no se ha abierto.",
      BOSS_EVENT_ENDED:"La Brecha del Umbral ya se ha cerrado.",
      REALM_REQUIRED:"Necesitas un reino activo para participar.",
      UNAUTHORIZED:"Tu sesión ha caducado. Vuelve a entrar.",
      INVALID_REQUEST_ID:"No se pudo identificar la incursión. Inténtalo de nuevo.",
      REQUEST_ID_CONFLICT:"La incursión no pudo validarse. Inténtalo de nuevo."
    };
    throw new Error(map[code]||code);
  }
  return data;
}
function bossRewardText(me,boss,artifactReward=null){
  if(boss.status==="defeated"){
    if(me?.reward_granted_at){const relic=artifactReward?` · Reliquia: ${esc(typeof artifactGameplayName==="function"?artifactGameplayName(artifactReward.artifact_id):artifactReward.artifact_id)}`:"";return `${n(me.reward_fragments)} Fragmentos del Umbral · ${esc(me.reward_tier||"PARTICIPACIÓN")}${relic}`;}
    return "Sin recompensa: era necesario participar antes de la derrota.";
  }
  const damage=Number(me?.damage||0);
  if(damage>=50000)return "Reliquia asegurada si el Boss cae · 300 fragmentos";
  if(damage>=15000)return `${n(50000-damage)} daño para Reliquia · premio actual: 150 fragmentos`;
  if(damage>=3000)return `${n(15000-damage)} daño para Cofre Mayor · premio actual: 75 fragmentos`;
  if(damage>0)return `${n(3000-damage)} daño para Cofre Arcano · participación: 30 fragmentos`;
  return "Participa para desbloquear 30 Fragmentos del Umbral.";
}
function bossSchoolName(code){
  return catalogs.schools.find(s=>s.code===code)?.name_es||code||"—";
}
function stopBossPolling(){
  clearInterval(bossPollTimer);
  bossPollTimer=null;
}
function startBossPolling(){
  if(bossPollTimer)return;
  bossPollTimer=setInterval(async()=>{
    if(currentView!=="event"){stopBossPolling();return;}
    try{await refreshBossView(true);}catch{}
  },5000);
}
function bossStatusLabel(status){
  return status==="defeated"?"DERROTADO":status==="closed"?"CERRADO":"● EVENTO ACTIVO";
}
let bossArtDataUrl=null;
let bossArtLoading=null;
async function hydrateBossArt(){
  const img=$("#boss-art-image");
  if(!img)return;
  try{
    if(!bossArtDataUrl){
      if(!bossArtLoading)bossArtLoading=fetch("assets/art/boss_devorador_umbral.b64?v=0.2.56",{cache:"force-cache"})
        .then(r=>{if(!r.ok)throw new Error("BOSS_ART");return r.text();})
        .then(text=>bossArtDataUrl="data:image/webp;base64,"+text.trim())
        .finally(()=>bossArtLoading=null);
      await bossArtLoading;
    }
    if($("#boss-art-image"))$("#boss-art-image").src=bossArtDataUrl;
  }catch{}
}
function drawBoss(data){
  if(currentView!=="event")return;
  const boss=data?.boss||{};
  const me=data?.me||null;
  const artifactReward=data?.artifact_reward||null;
  const top=Array.isArray(data?.top)?data.top:[];
  const maxHp=Math.max(1,Number(boss.max_hp||1));
  const hp=Math.max(0,Number(boss.current_hp||0));
  const pct=Math.max(0,Math.min(100,hp/maxHp*100));
  const defeated=boss.status==="defeated"||hp<=0;
  const ended=boss.status==="closed"||Date.now()>=new Date(boss.ends_at).getTime();
  const turnCost=Number(data?.turn_cost||3);
  const rankRows=top.length?top.map((x,i)=>`
    <tr class="${me?.user_id===x.user_id?"rank-me":""}">
      <td>#${i+1}</td>
      <td><button class="player-link" data-profile="${esc(x.username)}">${esc(x.username)}</button></td>
      <td><span class="school-dot ${esc(x.school_code)}"></span>${esc(bossSchoolName(x.school_code))}</td>
      <td><strong>${n(x.damage)}</strong></td>
      <td>${n(x.attacks)}</td>
    </tr>`).join(""):`<tr><td colspan="5"><div class="empty">Todavía nadie ha herido al Devorador.</div></td></tr>`;

  $("#view-host").innerHTML=`
        <section class="boss-hero">
      <div class="boss-aura"></div>
      <div class="boss-copy">
        <span class="boss-live ${defeated?"boss-live-defeated":""}">${bossStatusLabel(boss.status)}</span>
        <h3>${esc(boss.boss_name||"El Devorador del Umbral")}</h3>
        <p>Una criatura nacida entre escuelas consume maná, memoria y territorio. La única forma de cerrarle el paso es que los reinos golpeen la misma brecha.</p>
        <div class="boss-meta"><span>${bossPhase(pct,boss.status)}</span><span>TERMINA EN <b id="boss-clock">${bossTimeText(boss.ends_at)}</b></span><span>VIDA MUNDIAL SINCRONIZADA</span></div>
      </div>
      <div class="boss-sigil-art boss-portrait" aria-hidden="true"><img id="boss-art-image" alt="" decoding="async" /><span class="boss-portrait-vignette"></span></div>
    </section>
    <section class="boss-panel">
      <div class="boss-health-head"><div><small>VIDA MUNDIAL DEL BOSS</small><strong>${n(hp)} / ${n(maxHp)}</strong></div><b>${pct.toFixed(1)}%</b></div>
      <div class="boss-health"><span style="width:${pct}%"></span></div>
      <div class="boss-stats">
        <div><small>TU DAÑO</small><strong>${n(me?.damage||0)}</strong></div>
        <div><small>TUS INCURSIONES</small><strong>${n(me?.attacks||0)}</strong></div>
        <div><small>POSICIÓN</small><strong>${me?.rank?"#"+n(me.rank):"—"}</strong></div>
        <div><small>DAÑO ESTIMADO</small><strong>~${n(bossDamageEstimate())}</strong></div>
      </div>
      <div class="boss-reward-strip"><span>RECOMPENSA DE EVENTO</span><strong>${bossRewardText(me,boss,artifactReward)}</strong></div>
      <div class="boss-action-row">
        <div><small>COSTE DE INCURSIÓN</small><strong>${turnCost} turnos</strong><p>El servidor valida tu reino, descuenta los turnos y calcula el golpe a partir de tu Poder Neto. El navegador no decide el daño.</p></div>
        <button class="primary-action boss-attack" id="boss-attack" ${ended||defeated?"disabled":""}>⚔ ${defeated?"BOSS DERROTADO":ended?"EVENTO CERRADO":"ATACAR AL BOSS"}</button>
      </div>
    </section>
    <section class="panel boss-ranking-panel">
      <div class="boss-ranking-head"><div><span class="section-kicker">CONTRIBUCIÓN MUNDIAL</span><h3>Ranking del Devorador</h3><p>Clasificación por daño acumulado. Se actualiza automáticamente mientras mantengas abierto el evento.</p></div><span class="boss-sync-dot">● EN VIVO</span></div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Archimago</th><th>Escuela</th><th>Daño</th><th>Incursiones</th></tr></thead><tbody>${rankRows}</tbody></table></div>
    </section>
    <section class="boss-lore-grid">
      <article><span>01</span><h4>Hambre</h4><p>Por encima del 66%, su caparazón sigue entero y la brecha absorbe la energía de las Cinco Escuelas.</p></article>
      <article><span>02</span><h4>Fractura</h4><p>Al caer del 66%, la coraza se rompe y el mundo puede ver cómo el daño colectivo empieza a abrir grietas.</p></article>
      <article><span>03</span><h4>Eclipse</h4><p>Por debajo del 33%, comienza la fase final. Si cae, el servidor reparte automáticamente Fragmentos del Umbral según contribución.</p></article>
    </section>`;
  hydrateBossArt();
  $("#boss-attack")?.addEventListener("click",attackWorldBoss);
}
async function refreshBossView(silent=false){
  if(bossRenderBusy)return;
  bossRenderBusy=true;
  try{
    const data=await bossApi("");
    drawBoss(data);
    startBossPolling();
  }catch(e){
    if(!silent && currentView==="event"){
      $("#view-host").innerHTML=`<div class="panel"><div class="empty">${esc(humanError(e))}</div></div>`;
    }
    throw e;
  }finally{bossRenderBusy=false;}
}
async function renderEvent(){
  stopBossPolling();
  await refreshBossView(false);
}
async function attackWorldBoss(){
  const btn=$("#boss-attack");
  if(!btn)return;
  if(Number(realmState?.realm?.turns||0)<3){toast("Necesitas al menos 3 turnos para iniciar una incursión.","error");return;}
  btn.disabled=true;
  btn.textContent="ABRIENDO LA BRECHA...";
  try{
    const data=await bossApi("/attack",{method:"POST",body:{request_id:bossRequestId()}});
    realmState=await rpc("my_realm_state");
    renderChrome();
    const hit=Number(data?.attack?.damage||0);
    if(data?.boss?.status==="defeated"){toast(`¡El Devorador ha caído! Tu último golpe infligió ${n(hit)} de daño.`,"success",6500);if(typeof artifactGameplayDrop==="function")artifactGameplayDrop(data,"recompensa del Boss mundial");}
    else toast(`Has infligido ${n(hit)} de daño al Devorador mundial.`,"success");
    drawBoss(data);
    startBossPolling();
  }catch(e){
    toast(humanError(e),"error");
    try{await refreshBossView(true);}catch{}
  }
}
