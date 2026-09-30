"use strict";

const FIRST_BOSS_EVENT = Object.freeze({
  id:"umbra-001",
  name:"El Devorador del Umbral",
  subtitle:"Primera incursión de ARCANUM",
  maxHp:250000,
  turnCost:3,
  startsAt:"2026-09-30T00:00:00+02:00",
  endsAt:"2026-10-07T23:59:59+02:00"
});

function bossStorageKey(){
  const mage=String(realmState?.realm?.mage_name||"unknown").toLowerCase();
  return `arcanum_boss_${FIRST_BOSS_EVENT.id}_${mage}`;
}
function readBossRun(){
  try{
    const raw=JSON.parse(localStorage.getItem(bossStorageKey())||"{}");
    return {damage:Math.max(0,Number(raw.damage)||0),attacks:Math.max(0,Number(raw.attacks)||0),claimed:!!raw.claimed,lastHit:Number(raw.lastHit)||0};
  }catch{return {damage:0,attacks:0,claimed:false,lastHit:0};}
}
function writeBossRun(run){ localStorage.setItem(bossStorageKey(),JSON.stringify(run)); }
function bossDamageForRealm(){
  const p=Math.max(1,Number(realmState?.realm?.net_power||realmState?.realm?.power||1));
  return Math.max(650,Math.round(500+Math.sqrt(p)*24));
}
function bossPhase(hpPct){ return hpPct>66?"I · HAMBRE":hpPct>33?"II · FRACTURA":"III · ECLIPSE"; }
function bossRemaining(){
  return Math.max(0,new Date(FIRST_BOSS_EVENT.endsAt).getTime()-Date.now());
}
function bossTimeText(){
  const ms=bossRemaining();
  if(ms<=0)return "EVENTO FINALIZADO";
  const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);
  return `${d}d ${h}h ${m}m`;
}
function renderEvent(){
  const run=readBossRun();
  const hp=Math.max(0,FIRST_BOSS_EVENT.maxHp-run.damage);
  const pct=Math.max(0,Math.min(100,hp/FIRST_BOSS_EVENT.maxHp*100));
  const dmg=bossDamageForRealm();
  const ended=bossRemaining()<=0;
  const defeated=hp<=0;
  const reward=run.damage>=50000?"Reliquia del Umbral + cofre mayor":run.damage>=15000?"Cofre arcano mayor":run.damage>=3000?"Cofre arcano":"Participa para desbloquear recompensa";
  $("#view-host").innerHTML=`
    ${viewHeader("EVENTO MUNDIAL","La Brecha del Umbral","Una entidad ha atravesado las fronteras mágicas. Cada Archimago dispone de su propia incursión durante esta primera prueba PvE.")}
    <section class="boss-hero">
      <div class="boss-aura"></div>
      <div class="boss-copy">
        <span class="boss-live">${ended?"CERRADO":"● EVENTO ACTIVO"}</span>
        <h3>${FIRST_BOSS_EVENT.name}</h3>
        <p>Una criatura nacida entre escuelas consume maná, memoria y territorio. Golpéala antes de que la brecha se cierre.</p>
        <div class="boss-meta"><span>${bossPhase(pct)}</span><span>TERMINA EN <b id="boss-clock">${bossTimeText()}</b></span></div>
      </div>
      <div class="boss-sigil-art" aria-hidden="true"><span>◈</span><i></i><b>✦</b></div>
    </section>
    <section class="boss-panel">
      <div class="boss-health-head"><div><small>VIDA DEL BOSS</small><strong>${n(hp)} / ${n(FIRST_BOSS_EVENT.maxHp)}</strong></div><b>${pct.toFixed(1)}%</b></div>
      <div class="boss-health"><span style="width:${pct}%"></span></div>
      <div class="boss-stats">
        <div><small>TU DAÑO</small><strong>${n(run.damage)}</strong></div>
        <div><small>INCURSIONES</small><strong>${n(run.attacks)}</strong></div>
        <div><small>DAÑO ESTIMADO</small><strong>~${n(dmg)}</strong></div>
        <div><small>RECOMPENSA</small><strong>${esc(reward)}</strong></div>
      </div>
      <div class="boss-action-row">
        <div><small>COSTE DE INCURSIÓN</small><strong>${FIRST_BOSS_EVENT.turnCost} turnos</strong><p>Esta primera versión registra el progreso de la incursión por personaje mientras terminamos la sincronización mundial del backend.</p></div>
        <button class="primary-action boss-attack" id="boss-attack" ${ended||defeated?"disabled":""}>⚔ ${defeated?"BOSS DERROTADO":ended?"EVENTO CERRADO":"ATACAR AL BOSS"}</button>
      </div>
    </section>
    <section class="boss-lore-grid">
      <article><span>01</span><h4>Hambre</h4><p>El Devorador absorbe energía arcana y comienza con una defensa enorme.</p></article>
      <article><span>02</span><h4>Fractura</h4><p>Por debajo del 66% su caparazón se rompe y las heridas empiezan a multiplicarse.</p></article>
      <article><span>03</span><h4>Eclipse</h4><p>Por debajo del 33% entra en su fase final. Aquí se deciden las mejores recompensas.</p></article>
    </section>`;
  $("#boss-attack")?.addEventListener("click",attackFirstBoss);
}
async function attackFirstBoss(){
  const btn=$("#boss-attack");
  const run=readBossRun();
  if(Number(realmState?.realm?.turns||0)<FIRST_BOSS_EVENT.turnCost){toast("Necesitas al menos 3 turnos para iniciar una incursión.","error");return;}
  const damage=bossDamageForRealm();
  btn.disabled=true; btn.textContent="ABRIENDO LA BRECHA...";
  try{
    await rpc("run_economy",{p_action:"NONE",p_turns:FIRST_BOSS_EVENT.turnCost});
    const variance=0.88+Math.random()*0.24;
    const hit=Math.max(1,Math.round(damage*variance));
    run.damage=Math.min(FIRST_BOSS_EVENT.maxHp,run.damage+hit);
    run.attacks+=1; run.lastHit=hit;
    writeBossRun(run);
    realmState=await rpc("my_realm_state");
    renderChrome();
    toast(`Has infligido ${n(hit)} de daño al Devorador.`,"success");
    renderEvent();
  }catch(e){toast(humanError(e),"error"); renderEvent();}
}
