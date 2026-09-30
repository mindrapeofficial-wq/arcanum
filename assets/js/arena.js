"use strict";

const ARENA_DAILY_SEALS=6;
const ARENA_TRAITS={
  verdant:{name:"Verdante",mark:"♧",skill:"Savia Ancestral"},
  ascendant:{name:"Ascendente",mark:"✦",skill:"Égida Solar"},
  eradication:{name:"Erradicación",mark:"✹",skill:"Ruptura Ígnea"},
  abyssal:{name:"Abisal",mark:"◆",skill:"Pacto Sombrío"},
  phantasm:{name:"Fantasma",mark:"◌",skill:"Paso Irreal"}
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
function arenaReplayEvents(rec){
  var log=Array.isArray(rec.log)?rec.log:[];
  var me=String(rec.playerName||realmState?.realm?.mage_name||"Archimago");
  var foe=String(rec.opponent||"Rival");
  var events=[];
  log.forEach(function(line){
    if(events.length>=7)return;
    var t=String(line||"");
    if(!/golpea|crítico|inflige|contraataca|desata|pronuncia|muerde|ataque|golpe/i.test(t))return;
    if(t.indexOf(me)!==-1)events.push("player");
    else if(t.indexOf(foe)!==-1)events.push("enemy");
  });
  if(!events.length)events=["player","enemy","player"];
  var winner=rec.won?"player":"enemy";
  if(events[events.length-1]!==winner)events.push(winner);
  return events.slice(0,8);
}
function arenaRunReplay(rec){
  var token=++arenaReplayToken;
  var root=$("#arena-duel-stage"),player=$("#arena-duelist-player"),enemy=$("#arena-duelist-enemy");
  var result=$("#arena-result-panel"),log=$("#arena-log-panel");
  if(!root||!player||!enemy)return;
  var events=arenaReplayEvents(rec),step=0;
  function clearState(){
    [player,enemy].forEach(function(x){if(x)x.classList.remove("is-attacking","is-hit")});
  }
  function next(){
    if(token!==arenaReplayToken||!document.body.contains(root))return;
    clearState();
    if(step>=events.length){
      (rec.won?enemy:player).classList.add("is-ko");
      root.classList.add("is-finished");
      if(result)result.classList.add("is-visible");
      if(log)log.classList.add("is-visible");
      return;
    }
    var attacker=events[step]==="enemy"?enemy:player;
    var defender=attacker===player?enemy:player;
    attacker.classList.add("is-attacking");
    setTimeout(function(){
      if(token!==arenaReplayToken||!document.body.contains(root))return;
      defender.classList.add("is-hit");
    },220);
    setTimeout(function(){
      if(token!==arenaReplayToken||!document.body.contains(root))return;
      step++;
      next();
    },610);
  }
  setTimeout(next,300);
}
function arenaOpen(rec){
  var ps=String(rec.playerSchool||realmState?.realm?.school_code||"ascendant");
  var os=String(rec.opponentSchool||"ascendant");
  var playerName=String(rec.playerName||realmState?.realm?.mage_name||"Archimago");
  $("#modal-content").innerHTML=
    '<span class="section-kicker">ARENA ARCANA</span>'+
    '<h3>'+(rec.won?"Victoria":"Derrota")+' contra '+esc(rec.opponent)+'</h3>'+
    '<div class="arena-duel-stage" id="arena-duel-stage">'+
      '<div class="arena-duelist" id="arena-duelist-player"><div class="arena-fighter-shell">'+arenaSpriteHtml(ps,"arena-sprite--duel")+'</div><strong>'+esc(playerName)+'</strong><small>'+esc(arenaTrait(ps).name)+'</small></div>'+
      '<b>VS</b>'+
      '<div class="arena-duelist enemy" id="arena-duelist-enemy"><div class="arena-fighter-shell">'+arenaSpriteHtml(os,"arena-sprite--duel")+'</div><strong>'+esc(rec.opponent)+'</strong><small>'+esc(arenaTrait(os).name)+'</small></div>'+
    '</div>'+
    '<div class="arena-result '+(rec.won?"win":"loss")+'" id="arena-result-panel"><strong>'+
      (rec.won?"EL CÍRCULO TE RECONOCE":"EL RIVAL SE IMPONE")+
    '</strong><span>'+
      (rec.mode==="ranked"?"Rating "+(rec.delta>=0?"+":"")+rec.delta+" · total "+n(rec.rating):"Duelo amistoso · sin cambios de rating")+
    '</span></div>'+
    '<div class="arena-log" id="arena-log-panel">'+(rec.log||[]).map(function(x,i){
      return '<p><small>'+String(i+1).padStart(2,"0")+'</small>'+esc(x)+'</p>';
    }).join("")+'</div>';
  arenaHydrateSprites($("#modal-content")).then(function(){arenaRunReplay(rec)});
  show($("#modal"));
}

async function renderArena(){
  const selfProfile=await rpc("player_profile",{p_mage_name:realmState.realm.mage_name});
  if(typeof combatHydrateProfile==="function")await combatHydrateProfile(selfProfile);
  if(typeof lootHydrateProfile==="function")await lootHydrateProfile(selfProfile);

  const [arenaData,rows]=await Promise.all([
    stateApi("/arena"),
    rpc("leaderboard",{p_limit:100}).catch(()=>[])
  ]);

  const data=arenaData?.arena||{rating:1000,wins:0,losses:0,seals_remaining:0};
  const history=(arenaData?.history||[]).map(arenaHistoryRecord);
  const targets=arenaTargets(rows);
  const combat=typeof getCombatProfile==="function"?getCombatProfile(selfProfile):null;
  const gear=typeof lootCombatBonuses==="function"?lootCombatBonuses(selfProfile):{};
  const trait=arenaTrait(selfProfile.school_code);
  const level=typeof combatCurrentLevel==="function"?combatCurrentLevel(selfProfile):Math.max(1,Number(selfProfile.archmage_level||1));

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
          '<button class="small-action arena-fight" data-target="'+esc(t.mage_name)+'" data-mode="ranked" '+(Number(data.seals_remaining)<=0?"disabled":"")+'>DUELO</button>'+
          '<button class="small-action arena-fight alt" data-target="'+esc(t.mage_name)+'" data-mode="friendly">AMISTOSO</button></div></article>';
      }).join(""):'<div class="empty">No hay rivales disponibles.</div>')+'</div></section>'+
      '<section class="panel"><div class="arena-title"><span class="section-kicker">CRÓNICAS</span><h3>Últimos duelos</h3></div>'+
      '<div class="arena-history">'+(history.length?history.slice(0,8).map(function(h){
        return '<button class="arena-history-row" data-id="'+esc(h.id)+'"><span class="tag '+(h.won?"win":"loss")+'">'+(h.won?"VICTORIA":"DERROTA")+'</span>'+
          '<span><strong>'+esc(h.opponent)+'</strong><small>'+new Date(h.at).toLocaleString("es-ES")+'</small></span><b>'+(h.delta>0?"+":"")+h.delta+'</b></button>';
      }).join(""):'<div class="empty">Aún no has combatido en la Arena.</div>')+'</div></section></div>';

  $$(".arena-fight").forEach(btn=>btn.addEventListener("click",()=>arenaFight(btn.dataset.target,btn.dataset.mode,btn)));
  $(".arena-history-row").forEach(btn=>btn.addEventListener("click",()=>{
    const rec=history.find(x=>x.id===btn.dataset.id);if(rec)arenaOpen(rec);
  }));
  arenaHydrateSprites($("#view-host"));
}

async function arenaFight(name,mode,btn){
  if(!name)return;
  const old=btn?.textContent;
  if(btn){btn.disabled=true;btn.textContent="COMBATIENDO…";}
  try{
    const data=await stateApi("/arena/fight",{method:"POST",body:{target:name,mode:mode}});
    const rec=data?.match;
    if(!rec)throw new Error("ARENA_RESULT_MISSING");
    arenaOpen(rec);
    await renderArena();
  }catch(e){
    toast(humanError(e),"error");
    if(btn&&document.body.contains(btn)){btn.disabled=false;btn.textContent=old||"DUELO";}
  }
}

globalThis.renderArena=renderArena;
