"use strict";

const PVE_STATUS_LABELS={
  active:"EN CURSO",fighting:"COMBATE EN CURSO",completed:"COMPLETADA",
  retreated:"RETIRADA",defeated:"DERROTA",expired:"CADUCADA"
};

function pveStatusLabel(status){return PVE_STATUS_LABELS[String(status||"")]||String(status||"—").toUpperCase()}
function pveHpPct(run){
  return Math.max(0,Math.min(100,Number(run?.player_hp||0)/Math.max(1,Number(run?.player_max_hp||1))*100));
}
function pveSchoolName(code){return typeof schoolName==="function"?schoolName(code):String(code||"")}
function pveRoomTrack(run){
  const total=Math.max(1,Number(run?.room_count||4)),cleared=Math.max(0,Number(run?.rooms_cleared||0));
  return '<div class="pve-room-track">'+Array.from({length:total},(_,i)=>{
    const done=i<cleared,current=i===cleared&&run?.status==="active";
    const boss=i===total-1;
    return '<div class="pve-room-node '+(done?"done ":"")+(current?"current ":"")+(boss?"boss":"")+'">'+
      '<span>'+(done?"✓":boss?"◆":String(i+1))+'</span><small>'+(boss?"JEFE":"CÁMARA "+(i+1))+'</small>'+
    '</div>';
  }).join("")+'</div>';
}
function pveHistoryHtml(rows){
  if(!rows?.length)return '<div class="empty">Aún no hay expediciones concluidas.</div>';
  return rows.map(run=>{
    const pct=Math.round(Math.max(0,Number(run.rooms_cleared||run.stage||0))/Math.max(1,Number(run.room_count||4))*100);
    return '<article class="pve-history-row '+esc(run.status)+'">'+
      '<div><strong>'+esc(run.expedition_name||"Ruinas del Umbral")+'</strong><small>'+esc(run.difficulty_name||"")+' · '+new Date(run.started_at).toLocaleString("es-ES")+'</small></div>'+
      '<span>'+n(run.rooms_cleared||run.stage||0)+' / '+n(run.room_count||4)+' salas</span>'+
      '<b>'+esc(pveStatusLabel(run.status))+'</b>'+
      '<i><em style="width:'+pct+'%"></em></i>'+
    '</article>';
  }).join("");
}
function pveCatalogHtml(catalog){
  if(!catalog?.length)return '<div class="empty">No hay expediciones disponibles.</div>';
  return catalog.map(exp=>
    '<article class="pve-expedition-card">'+
      '<div class="pve-expedition-sigil">◇</div>'+
      '<div class="pve-expedition-copy"><span class="section-kicker">EXPEDICIÓN PERSONAL</span><h3>'+esc(exp.name)+'</h3>'+
        '<strong>'+esc(exp.subtitle||"")+'</strong><p>'+esc(exp.description||"")+'</p>'+
        '<small>'+n(exp.room_count)+' encuentros · equipo bloqueado al comenzar · vida persistente</small></div>'+
      '<div class="pve-difficulty-list">'+(exp.difficulties||[]).map(d=>
        '<button class="pve-start '+(d.unlocked?"":"locked")+'" data-pve-start="'+esc(exp.id)+'" data-pve-difficulty="'+n(d.id)+'" '+(d.unlocked?"":"disabled")+'>'+
          '<span>'+esc(d.name)+'</span><small>'+(d.unlocked?"INICIAR":"Nv. "+n(d.min_level))+'</small>'+
        '</button>'
      ).join("")+'</div>'+
    '</article>'
  ).join("");
}

function pveDecisionHtml(run){
  const decision=run?.pending_decision;
  if(!decision?.options?.length)return "";
  const room=decision.options[0]?.next_room||run.current_room||{};
  return '<section class="pve-decision-shell">'+
    '<div class="pve-decision-head"><div><span class="section-kicker">DECISIÓN DEL UMBRAL</span><h3>El siguiente paso es tuyo</h3>'+
      '<p>Has superado la cámara. Antes de entrar en <strong>'+esc(room.name||"la siguiente cámara")+'</strong>, puedes protegerte, mantener el rumbo o forzar el riesgo.</p></div>'+
      '<span class="pve-decision-lock">SIN COSTE DE TURNO</span></div>'+
    '<div class="pve-choice-grid">'+decision.options.map(option=>
      '<button class="pve-choice" data-pve-choice="'+esc(option.id)+'">'+
        '<span class="pve-choice-icon">'+esc(option.icon||"◇")+'</span>'+
        '<span class="pve-choice-body"><strong>'+esc(option.title)+'</strong><small>'+esc(option.subtitle)+'</small><em>'+esc(option.description)+'</em>'+
          '<i class="pve-choice-target">PRÓXIMO · '+esc(option.next_room?.name||"—")+'</i></span>'+
      '</button>'
    ).join("")+'</div>'+
  '</section>';
}

function pveActiveHtml(run,turnCost){
  const room=run.current_room||{},pct=pveHpPct(run),busy=run.status==="fighting";
  return '<section class="pve-active-shell">'+
    '<div class="pve-run-header"><div><span class="section-kicker">INCURSIÓN ACTIVA</span><h3>'+esc(run.expedition_name)+'</h3>'+
      '<p>'+esc(run.difficulty_name)+' · La vida restante se conserva entre cámaras. El equipo quedó sellado al iniciar.</p></div>'+
      '<span class="pve-status '+esc(run.status)+'">'+esc(pveStatusLabel(run.status))+'</span></div>'+
    '<div class="pve-vitals"><div class="pve-hp-head"><span>VIDA DEL ARCHIMAGO</span><strong>'+n(run.player_hp)+' / '+n(run.player_max_hp)+'</strong></div>'+
      '<div class="pve-hp"><i style="width:'+pct.toFixed(2)+'%"></i></div></div>'+
    pveRoomTrack(run)+
    (run.pending_decision
      ?pveDecisionHtml(run)
      :'<article class="pve-encounter '+(room.boss?"boss":"")+'>'+
        '<div class="pve-enemy-mark">'+(room.boss?"◆":"◇")+'</div>'+
        '<div><span class="section-kicker">'+(room.boss?"JEFE DE EXPEDICIÓN":"ENCUENTRO "+(Number(run.stage)+1))+'</span>'+
          '<h3>'+esc(room.name||"Cámara despejada")+'</h3><small>'+esc(pveSchoolName(room.school))+'</small><p>'+esc(room.desc||"")+'</p></div>'+
        '<div class="pve-actions">'+
          '<button class="primary-action" id="pve-fight" '+(busy||!room.id?"disabled":"")+'>'+(busy?"RESOLVIENDO…":"⚔ ENFRENTARSE · "+n(turnCost)+" TURNO")+'</button>'+
          '<button class="ghost-button" id="pve-retreat" '+(busy?"disabled":"")+'>RETIRARSE</button>'+
        '</div>'+
      '</article>')+
    (!run.pending_decision&&run.last_enemy?'<div class="pve-last-result"><span>ÚLTIMO ENCUENTRO</span><strong>'+esc(run.last_enemy.name||"")+'</strong><small>Terminaste con '+n(run.player_hp)+' de '+n(run.player_max_hp)+' de vida.</small></div>':"")+
    '<div class="pve-retreat-row"><button class="ghost-button" id="pve-retreat-bottom" '+(busy?"disabled":"")+'>'+ (run.pending_decision?"RETIRARSE DE LA EXPEDICIÓN":"ABANDONAR EXPEDICIÓN") +'</button></div>'+
  '</section>';
}
function pveFightModal(data){
  const fight=data?.fight,run=data?.run;
  if(!fight||!run)return;
  const loot=data?.loot_reward;
  const won=Boolean(fight.won);
  $("#modal-content").innerHTML=
    '<span class="section-kicker">EXPEDICIÓN · RESULTADO</span>'+
    '<div class="pve-result-title '+(won?"win":"loss")+'"><h3>'+(won?"VICTORIA":"DERROTA")+'</h3>'+
      '<p>'+esc(fight.enemy?.name||"Encuentro")+' · '+esc(pveSchoolName(fight.enemy?.school))+'</p></div>'+
    '<div class="pve-result-stats"><div><small>VIDA RESTANTE</small><strong>'+n(run.player_hp)+' / '+n(run.player_max_hp)+'</strong></div>'+
      '<div><small>PROGRESO</small><strong>'+n(run.rooms_cleared)+' / '+n(run.room_count)+'</strong></div>'+
      '<div><small>ESTADO</small><strong>'+esc(pveStatusLabel(run.status))+'</strong></div></div>'+
    (loot?.item?'<div class="pve-loot-found"><small>'+(loot.pending?"RECOMPENSA RESERVADA":"BOTÍN ENCONTRADO")+'</small><strong>'+esc(loot.item.name)+'</strong><span>'+esc(loot.item.rarityLabel||loot.item.rarity||"")+'</span></div>':
      won?'<div class="pve-no-loot">La cámara ha sido superada, pero no ha dejado Gear.</div>':"")+
    '<div class="arena-log pve-log">'+(fight.log||[]).map((line,i)=>'<p><small>'+String(i+1).padStart(2,"0")+'</small>'+esc(line)+'</p>').join("")+'</div>'+
    (run.status==="completed"?'<div class="pve-complete-banner">◆ RUINAS DEL UMBRAL COMPLETADAS</div>':"");
  show($("#modal"));
}
async function pveRefreshRealm(){
  try{realmState=await rpc("my_realm_state");renderChrome();}catch{}
}
async function pveStart(expeditionId,difficulty,btn){
  if(btn){btn.disabled=true;btn.classList.add("busy")}
  try{
    const data=await stateApi("/pve/start",{method:"POST",body:{expedition_id:expeditionId,difficulty:Number(difficulty)}});
    toast(data?.resumed?"Has retomado tu expedición.":"La entrada a las Ruinas ha quedado sellada.","success");
    await renderPve();
  }catch(e){toast(humanError(e),"error");if(btn){btn.disabled=false;btn.classList.remove("busy")}}
}
async function pveFight(){
  const btn=$("#pve-fight");if(btn){btn.disabled=true;btn.textContent="RESOLVIENDO…"}
  try{
    const data=await stateApi("/pve/fight",{method:"POST",body:{}});
    await pveRefreshRealm();
    if(data?.loot_reward&&typeof announceCanonicalLootReward==="function")announceCanonicalLootReward(data.loot_reward,"Botín de expedición");
    await renderPve();
    pveFightModal(data);
  }catch(e){toast(humanError(e),"error");await renderPve().catch(()=>{})}
}

async function pveChoose(choiceId,btn){
  Array.from(document.querySelectorAll(".pve-choice")).forEach(x=>x.disabled=true);
  try{
    const data=await stateApi("/pve/choose",{method:"POST",body:{choice_id:String(choiceId)}});
    const choice=data?.choice;
    if(choice?.hp_after>choice?.hp_before)toast("El santuario restaura parte de tu vida.","success");
    else if(choice?.choice_id==="forbidden")toast("Has forzado el Umbral. La próxima cámara será más peligrosa.","success");
    else toast("Mantienes el rumbo hacia la siguiente cámara.","success");
    await renderPve();
  }catch(e){
    toast(humanError(e),"error");
    await renderPve().catch(()=>{});
  }
}

async function pveRetreat(){
  if(!confirm("¿Retirarte de la expedición? Conservarás el Gear ya obtenido, pero esta incursión terminará."))return;
  try{
    await stateApi("/pve/retreat",{method:"POST",body:{}});
    toast("Te has retirado con vida de las Ruinas.","success");
    await renderPve();
  }catch(e){toast(humanError(e),"error")}
}
async function renderPve(){
  const data=await stateApi("/pve");
  $("#view-host").innerHTML=
    viewHeader("PVE PERSONAL","Expediciones","Entra con tu Archimago, arrastra sus heridas entre salas y decide hasta dónde merece la pena avanzar.")+
    (data.run&&["active","fighting"].includes(data.run.status)
      ?pveActiveHtml(data.run,Number(data.turn_cost_per_fight||1))
      :'<section class="pve-catalog">'+pveCatalogHtml(data.catalog)+'</section>')+
    '<section class="panel pve-history"><div class="panel-title-row"><div><span class="section-kicker">CRÓNICA DE INCURSIONES</span><h3>Expediciones recientes</h3></div></div>'+
      pveHistoryHtml(data.history)+'</section>';
  $$(".pve-start").forEach(btn=>btn.addEventListener("click",()=>pveStart(btn.dataset.pveStart,btn.dataset.pveDifficulty,btn)));
  $("#pve-fight")?.addEventListener("click",pveFight);
  $("#pve-retreat")?.addEventListener("click",pveRetreat);
  $("#pve-retreat-bottom")?.addEventListener("click",pveRetreat);
  $(".pve-choice").forEach(btn=>btn.addEventListener("click",()=>pveChoose(btn.dataset.pveChoice,btn)));
}

globalThis.renderPve=renderPve;
