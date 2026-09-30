"use strict";

const ARENA_DAILY_SEALS=6;
const ARENA_TRAITS={
  verdant:{name:"Viridia",mark:"♧",skill:"Savia Ancestral"},
  ascendant:{name:"Aurea",mark:"✦",skill:"Égida Solar"},
  eradication:{name:"Cineria",mark:"✹",skill:"Ruptura Ígnea"},
  abyssal:{name:"Nadir",mark:"◆",skill:"Pacto Sombrío"},
  phantasm:{name:"Oneiria",mark:"◌",skill:"Paso Irreal"}
};

function arenaTrait(code){return ARENA_TRAITS[code]||ARENA_TRAITS.ascendant}
const ARENA_SPRITE_FILES={verdant:"assets/ui/arena/verdant.b64",ascendant:"assets/ui/arena/ascendant.b64",eradication:"assets/ui/arena/eradication.b64",abyssal:"assets/ui/arena/abyssal.b64",phantasm:"assets/ui/arena/phantasm.b64"};
const ARENA_SPRITE_CACHE={};
let arenaReplayToken=0;
function arenaSpriteHtml(code,cls){var school=ARENA_SPRITE_FILES[code]?code:"ascendant";return '<span class="arena-sprite school-'+school+' '+(cls||"")+'" data-school="'+school+'" aria-hidden="true"></span>'}
async function arenaHydrateSprites(root){var host=root||document,nodes=host.querySelectorAll?host.querySelectorAll(".arena-sprite[data-school]"):[];for(var i=0;i<nodes.length;i++){var el=nodes[i],school=el.dataset.school||"ascendant",path=ARENA_SPRITE_FILES[school]||ARENA_SPRITE_FILES.ascendant;try{if(!ARENA_SPRITE_CACHE[school])ARENA_SPRITE_CACHE[school]=fetch(path,{cache:"force-cache"}).then(function(r){if(!r.ok)throw new Error("sprite "+r.status);return r.text()}).then(function(x){return "url(data:image/webp;base64,"+x.trim()+")"});el.style.backgroundImage=await ARENA_SPRITE_CACHE[school]}catch(e){el.classList.add("arena-sprite--fallback")}}}
function arenaDivision(v){return v>=1700?"Leyenda Arcana":v>=1500?"Arconte":v>=1350?"Gran Mago":v>=1200?"Maestro":v>=1050?"Adepto":v>=900?"Aprendiz":"Iniciado"}
function arenaTargets(rows){
  const me=String(realmState?.realm?.mage_name||"").toLowerCase();
  const power=Math.max(1,Number(realmState?.realm?.net_power||1));
  return (rows||[])
    .filter(x=>String(x.mage_name||"").toLowerCase()!==me)
    .map(x=>({...x,_d:Math.abs(Math.log10(Math.max(1,Number(x.net_power||1)))-Math.log10(power))}))
    .sort((a,b)=>a._d-b._d)
    .slice(0,8);
}
function arenaHistoryRecord(row){
  return {
    id:String(row.id),
    at:row.created_at,
    opponent:String(row.defender_username||"Arconte"),
    won:Boolean(row.attacker_won),
    mode:String(row.mode||"friendly"),
    delta:Number(row.rating_delta||0),
    rating:Number(row.rating_after||1000),
    log:Array.isArray(row.combat_log)?row.combat_log:[]
  };
}
function arenaCombatStats(rec){
  var p=rec.player||{},o=rec.opponent_state||{};
  var playerMax=Math.max(1,Number(p.maxHp)||100);
  var enemyMax=Math.max(1,Number(o.maxHp)||100);
  return {
    player:{max:playerMax,final:Math.max(0,Math.min(playerMax,Number(p.hp)||0))},
    enemy:{max:enemyMax,final:Math.max(0,Math.min(enemyMax,Number(o.hp)||0))}
  };
}
function arenaSideForName(name,rec){
  var n=String(name||"").toLowerCase();
  var me=String(rec.playerName||rec.player?.name||realmState?.realm?.mage_name||"").toLowerCase();
  var foe=String(rec.opponent||rec.opponent_state?.name||"").toLowerCase();
  if(n&&me&&n.indexOf(me)!==-1)return "player";
  if(n&&foe&&n.indexOf(foe)!==-1)return "enemy";
  return null;
}
function arenaCombatTimeline(rec){
  var out=[],log=Array.isArray(rec.log)?rec.log:[];
  var me=String(rec.playerName||rec.player?.name||realmState?.realm?.mage_name||"Archimago");
  var foe=String(rec.opponent||rec.opponent_state?.name||"Rival");
  function other(side){return side==="player"?"enemy":"player"}
  log.forEach(function(line){
    if(out.length>=14)return;
    var t=String(line||""),damage=0,heal=0,actor=null,target=null,kind="event";
    var dmg=t.match(/(\d+)\s+de daño/i);
    var hp=t.match(/regenera\s+(\d+)\s+de vida/i);
    if(hp){
      actor=arenaSideForName(t.split(" regenera")[0],rec);
      if(actor){heal=Number(hp[1])||0;kind="heal"}
    }else if(/evita el ataque/i.test(t)){
      target=arenaSideForName(t.split(" evita")[0],rec);
      if(target){actor=other(target);kind="miss"}
    }else if(/bloquea con éxito/i.test(t)){
      target=arenaSideForName(t.split(" bloquea")[0],rec);
      if(target){actor=other(target);kind="block"}
    }else if(dmg){
      damage=Number(dmg[1])||0;
      if(/El veneno inflige/i.test(t)){
        target=t.toLowerCase().includes(foe.toLowerCase())?"enemy":t.toLowerCase().includes(me.toLowerCase())?"player":null;
        actor=target?other(target):null;
        kind="poison";
      }else{
        actor=t.toLowerCase().startsWith(me.toLowerCase())?"player":t.toLowerCase().startsWith(foe.toLowerCase())?"enemy":null;
        target=actor?other(actor):null;
        kind=/crítico/i.test(t)?"crit":"hit";
      }
    }
    if(actor||target)out.push({actor:actor,target:target,damage:damage,heal:heal,kind:kind,text:t});
  });
  if(!out.length){
    out=[
      {actor:"player",target:"enemy",damage:18,heal:0,kind:"hit",text:""},
      {actor:"enemy",target:"player",damage:14,heal:0,kind:"hit",text:""},
      {actor:rec.won?"player":"enemy",target:rec.won?"enemy":"player",damage:32,heal:0,kind:"crit",text:""}
    ];
  }
  return out;
}
function arenaSetLife(side,value,max){
  var bar=$("#arena-life-"+side),label=$("#arena-life-label-"+side);
  if(!bar||!label)return;
  value=Math.max(0,Math.min(max,value));
  bar.style.width=((value/max)*100).toFixed(2)+"%";
  label.textContent=Math.round(value)+" / "+Math.round(max);
  bar.closest(".arena-life")?.classList.toggle("is-low",value/max<=.28);
}
function arenaFloatCombatText(side,text,kind){
  var host=$("#arena-duelist-"+side+" .arena-float-layer");
  if(!host)return;
  var el=document.createElement("span");
  el.className="arena-float "+(kind||"");
  el.textContent=text;
  host.appendChild(el);
  setTimeout(function(){el.remove()},950);
}
function arenaRunReplay(rec){
  var token=++arenaReplayToken;
  var root=$("#arena-duel-stage"),player=$("#arena-duelist-player"),enemy=$("#arena-duelist-enemy");
  var result=$("#arena-result-panel"),log=$("#arena-log-panel");
  if(!root||!player||!enemy)return;
  var timeline=arenaCombatTimeline(rec),stats=arenaCombatStats(rec),hp={player:stats.player.max,enemy:stats.enemy.max},step=0;
  arenaSetLife("player",hp.player,stats.player.max);
  arenaSetLife("enemy",hp.enemy,stats.enemy.max);
  function fighter(side){return side==="player"?player:enemy}
  function clearState(){
    [player,enemy].forEach(function(x){if(x)x.classList.remove("is-attacking","is-hit","is-blocking","is-missing")});
    root.classList.remove("is-impact");
  }
  function finish(){
    clearState();
    hp.player=Number(rec.player?.hp);
    hp.enemy=Number(rec.opponent_state?.hp);
    if(Number.isFinite(hp.player))arenaSetLife("player",hp.player,stats.player.max);
    if(Number.isFinite(hp.enemy))arenaSetLife("enemy",hp.enemy,stats.enemy.max);
    var loser=rec.won?enemy:player;
    loser.classList.add("is-ko");
    root.classList.add("is-finished");
    setTimeout(function(){
      if(token!==arenaReplayToken)return;
      if(result)result.classList.add("is-visible");
      if(log)log.classList.add("is-visible");
    },620);
  }
  function next(){
    if(token!==arenaReplayToken||!document.body.contains(root))return;
    clearState();
    if(step>=timeline.length){finish();return}
    var ev=timeline[step],attacker=fighter(ev.actor),defender=fighter(ev.target);
    if(ev.kind==="heal"){
      if(attacker)attacker.classList.add("is-healing");
      if(ev.actor){
        hp[ev.actor]=Math.min(stats[ev.actor].max,hp[ev.actor]+ev.heal);
        arenaSetLife(ev.actor,hp[ev.actor],stats[ev.actor].max);
        arenaFloatCombatText(ev.actor,"+"+ev.heal,"heal");
      }
      setTimeout(function(){if(attacker)attacker.classList.remove("is-healing")},520);
      setTimeout(function(){step++;next()},720);
      return;
    }
    if(attacker)attacker.classList.add("is-attacking");
    if(ev.kind==="miss"&&defender)defender.classList.add("is-missing");
    if(ev.kind==="block"&&defender)defender.classList.add("is-blocking");
    setTimeout(function(){
      if(token!==arenaReplayToken||!document.body.contains(root))return;
      if(ev.damage>0&&ev.target){
        root.classList.add("is-impact");
        if(defender)defender.classList.add("is-hit");
        hp[ev.target]=Math.max(0,hp[ev.target]-ev.damage);
        arenaSetLife(ev.target,hp[ev.target],stats[ev.target].max);
        arenaFloatCombatText(ev.target,"-"+ev.damage,ev.kind==="crit"?"crit":ev.kind==="poison"?"poison":"damage");
      }else if(ev.kind==="miss"&&ev.target){
        arenaFloatCombatText(ev.target,"ESQUIVA","miss");
      }else if(ev.kind==="block"&&ev.target){
        arenaFloatCombatText(ev.target,"BLOQUEO","block");
      }
    },330);
    setTimeout(function(){root.classList.remove("is-impact")},450);
    setTimeout(function(){
      if(token!==arenaReplayToken||!document.body.contains(root))return;
      step++;next();
    },900);
  }
  setTimeout(next,520);
}
function arenaLifeHud(side,name,school,maxHp){
  return '<div class="arena-combat-hud '+side+'"><div class="arena-combat-name"><strong>'+esc(name)+'</strong><small>'+esc(arenaTrait(school).name)+'</small></div>'+
    '<div class="arena-life"><div class="arena-life-track"><i id="arena-life-'+side+'" style="width:100%"></i></div><div class="arena-life-meta"><span>VIDA</span><b id="arena-life-label-'+side+'">'+Math.round(maxHp)+' / '+Math.round(maxHp)+'</b></div></div></div>';
}
function arenaOpen(rec){
  var ps=String(rec.playerSchool||rec.player?.school||realmState?.realm?.school_code||"ascendant");
  var os=String(rec.opponentSchool||rec.opponent_state?.school||"ascendant");
  var playerName=String(rec.playerName||rec.player?.name||realmState?.realm?.mage_name||"Archimago");
  var stats=arenaCombatStats(rec);
  $("#modal-content").innerHTML=
    '<span class="section-kicker">ARENA ARCANA</span>'+
    '<div class="arena-duel-title"><h3>'+esc(playerName)+' <span>vs</span> '+esc(rec.opponent)+'</h3><small>REPETICIÓN DEL COMBATE</small></div>'+
    '<div class="arena-duel-stage" id="arena-duel-stage">'+
      '<div class="arena-hud-grid">'+arenaLifeHud("player",playerName,ps,stats.player.max)+arenaLifeHud("enemy",rec.opponent,os,stats.enemy.max)+'</div>'+
      '<div class="arena-battlefield">'+
        '<div class="arena-duelist" id="arena-duelist-player"><div class="arena-float-layer"></div><div class="arena-fighter-shell">'+arenaSpriteHtml(ps,"arena-sprite--duel")+'</div><div class="arena-ground-shadow"></div></div>'+
        '<div class="arena-versus">VS</div>'+
        '<div class="arena-duelist enemy" id="arena-duelist-enemy"><div class="arena-float-layer"></div><div class="arena-fighter-shell">'+arenaSpriteHtml(os,"arena-sprite--duel")+'</div><div class="arena-ground-shadow"></div></div>'+
      '</div>'+
    '</div>'+
    '<div class="arena-result '+(rec.won?"win":"loss")+'" id="arena-result-panel"><strong>'+
      (rec.won?"VICTORIA":"DERROTA")+
    '</strong><span>'+
      (rec.mode==="ranked"?"Rating "+(rec.delta>=0?"+":"")+rec.delta+" · total "+n(rec.rating):"Duelo amistoso · sin cambios de rating")+
    '</span></div>'+
    '<div class="arena-log" id="arena-log-panel">'+(rec.log||[]).map(function(x,i){
      return '<p><small>'+String(i+1).padStart(2,"0")+'</small>'+esc(x)+'</p>';
    }).join("")+'</div>';
  show($("#modal"));
  arenaHydrateSprites($("#modal-content")).then(function(){arenaRunReplay(rec)});
}

async function renderArena(){
  const [snapshot,arenaData,rows]=await Promise.all([
    typeof loadArchmageSnapshot==="function"
      ?loadArchmageSnapshot(realmState.realm.mage_name,{force:true})
      :rpc("player_profile",{p_mage_name:realmState.realm.mage_name}).then(profile=>({profile})),
    stateApi("/arena"),
    rpc("leaderboard",{p_limit:100}).catch(()=>[])
  ]);
  const selfProfile=snapshot.profile;
  const data=arenaData?.arena||snapshot?.arena||{rating:1000,wins:0,losses:0,seals_remaining:0};
  const history=(arenaData?.history||[]).map(arenaHistoryRecord);
  const targets=arenaTargets(rows);
  const combat=typeof getCombatProfile==="function"?getCombatProfile(selfProfile):null;
  const gear=typeof lootCombatBonuses==="function"?lootCombatBonuses(selfProfile):{equipmentPower:Number(snapshot?.inventory?.equipment_power||0)};
  const trait=arenaTrait(selfProfile.school_code);
  const level=Number(snapshot?.identity?.level||(typeof combatCurrentLevel==="function"?combatCurrentLevel(selfProfile):Math.max(1,Number(selfProfile.archmage_level||1))));

  $("#view-host").innerHTML=
    viewHeader("DUELISTAS","Arena Arcana","PvP individual automático. El resultado, los Sellos y el rating se resuelven en el servidor.")+
    '<section class="arena-hero"><div><span class="section-kicker">CÍRCULO DE DUELO</span><h3>'+esc(selfProfile.mage_name)+'</h3>'+
      '<p>Seis combates clasificatorios al día según reloj del servidor. Los amistosos son ilimitados. Perfil, equipo, Sellos, rating y resultado se validan en backend.</p>'+
      '<div class="arena-meta">'+
        '<span><small>SELLOS</small><b>'+n(data.seals_remaining)+' / '+ARENA_DAILY_SEALS+'</b></span>'+
        '<span><small>RATING</small><b>'+n(data.rating)+'</b></span>'+
        '<span><small>DIVISIÓN</small><b>'+esc(arenaDivision(Number(data.rating)))+'</b></span>'+
        '<span><small>RÉCORD</small><b>'+n(data.wins)+'V · '+n(data.losses)+'D</b></span>'+
        '<span><small>EQUIPO</small><b>'+n(gear.equipmentPower||0)+' iP</b></span>'+
      '</div></div>'+
      '<aside><div class="arena-hero-avatar">'+arenaSpriteHtml(selfProfile.school_code,"arena-sprite--hero")+'<i>'+trait.mark+'</i></div><strong>Nivel de Arena '+n(level)+'</strong><small>'+esc(trait.name)+' · '+esc(trait.skill)+'</small></aside>'+
    '</section>'+
    '<div class="arena-grid"><section class="panel"><div class="arena-title"><span class="section-kicker">RIVALES</span><h3>Contrincantes cercanos</h3></div>'+
      '<div class="arena-list">'+(targets.length?targets.map(function(t){
        const tr=arenaTrait(t.school_code);
        return '<article class="arena-row">'+arenaSpriteHtml(t.school_code,"arena-sprite--mini")+'<div><strong><button class="player-link" data-profile="'+esc(t.mage_name)+'">'+esc(t.mage_name)+'</button></strong>'+
          '<small>'+esc(tr.name)+' · Poder '+n(t.net_power)+'</small></div><div>'+
          '<button class="small-action arena-fight" data-target="'+esc(t.mage_name)+'" data-school="'+esc(t.school_code||"ascendant")+'" data-mode="ranked" '+(Number(data.seals_remaining)<=0?"disabled":"")+'>DUELO</button>'+
          '<button class="small-action arena-fight alt" data-target="'+esc(t.mage_name)+'" data-school="'+esc(t.school_code||"ascendant")+'" data-mode="friendly">AMISTOSO</button></div></article>';
      }).join(""):'<div class="empty">No hay rivales disponibles.</div>')+'</div></section>'+
      '<section class="panel"><div class="arena-title"><span class="section-kicker">CRÓNICAS</span><h3>Últimos duelos</h3></div>'+
      '<div class="arena-history">'+(history.length?history.slice(0,8).map(function(h){
        return '<button class="arena-history-row" data-id="'+esc(h.id)+'"><span class="tag '+(h.won?"win":"loss")+'">'+(h.won?"VICTORIA":"DERROTA")+'</span>'+
          '<span><strong>'+esc(h.opponent)+'</strong><small>'+new Date(h.at).toLocaleString("es-ES")+'</small></span><b>'+(h.delta>0?"+":"")+h.delta+'</b></button>';
      }).join(""):'<div class="empty">Aún no has combatido en la Arena.</div>')+'</div></section></div>';

  $$(".arena-fight").forEach(btn=>btn.addEventListener("click",()=>arenaFight(btn.dataset.target,btn.dataset.mode,btn,btn.dataset.school)));
  $$(".arena-history-row").forEach(btn=>btn.addEventListener("click",()=>{
    const rec=history.find(x=>x.id===btn.dataset.id);if(rec)arenaOpen(rec);
  }));
  arenaHydrateSprites($("#view-host"));
}

async function arenaFight(name,mode,btn,opponentSchool){
  if(!name)return;
  const old=btn?.textContent;
  if(btn){btn.disabled=true;btn.textContent="COMBATIENDO…";}
  try{
    const data=await stateApi("/arena/fight",{method:"POST",body:{target:name,mode:mode}});
    const rec=data?.match;
    if(!rec)throw new Error("ARENA_RESULT_MISSING");
    rec.playerName=String(rec.player?.name||realmState?.realm?.mage_name||"Archimago");
    rec.playerSchool=String(rec.player?.school||realmState?.realm?.school_code||"ascendant");
    rec.opponentSchool=String(rec.opponent_state?.school||opponentSchool||"ascendant");
    arenaOpen(rec);
    await renderArena();
  }catch(e){
    toast(humanError(e),"error");
    if(btn&&document.body.contains(btn)){btn.disabled=false;btn.textContent=old||"DUELO";}
  }
}

globalThis.renderArena=renderArena;
