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
function arenaDivision(v){return v>=1700?"Leyenda Arcana":v>=1500?"Archimago":v>=1350?"Gran Mago":v>=1200?"Maestro":v>=1050?"Adepto":v>=900?"Aprendiz":"Iniciado"}
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
    opponent:String(row.defender_username||"Archimago"),
    won:Boolean(row.attacker_won),
    mode:String(row.mode||"friendly"),
    delta:Number(row.rating_delta||0),
    rating:Number(row.rating_after||1000),
    log:Array.isArray(row.combat_log)?row.combat_log:[]
  };
}
function arenaOpen(rec){
  $("#modal-content").innerHTML=
    '<span class="section-kicker">ARENA ARCANA</span>'+
    '<h3>'+(rec.won?"Victoria":"Derrota")+' contra '+esc(rec.opponent)+'</h3>'+
    '<div class="arena-result '+(rec.won?"win":"loss")+'"><strong>'+
      (rec.won?"EL CÍRCULO TE RECONOCE":"EL RIVAL SE IMPONE")+
    '</strong><span>'+
      (rec.mode==="ranked"?"Rating "+(rec.delta>=0?"+":"")+rec.delta+" · total "+n(rec.rating):"Duelo amistoso · sin cambios de rating")+
    '</span></div>'+
    '<div class="arena-log">'+(rec.log||[]).map(function(x,i){
      return '<p><small>'+String(i+1).padStart(2,"0")+'</small>'+esc(x)+'</p>';
    }).join("")+'</div>';
  show($("#modal"));
}

async function renderArena(){
  const selfProfile=await rpc("player_profile",{p_mage_name:realmState.realm.mage_name});
  if(typeof combatHydrateProfile==="function")await combatHydrateProfile(selfProfile);

  const [arenaData,rows]=await Promise.all([
    stateApi("/arena"),
    rpc("leaderboard",{p_limit:100}).catch(()=>[])
  ]);

  const data=arenaData?.arena||{rating:1000,wins:0,losses:0,seals_remaining:0};
  const history=(arenaData?.history||[]).map(arenaHistoryRecord);
  const targets=arenaTargets(rows);
  const combat=typeof getCombatProfile==="function"?getCombatProfile(selfProfile):null;
  const derived=typeof combatDerived==="function"?combatDerived(selfProfile):null;
  const trait=arenaTrait(selfProfile.school_code);
  const level=typeof combatCurrentLevel==="function"?combatCurrentLevel(selfProfile):Math.max(1,Number(selfProfile.archmage_level||1));

  $("#view-host").innerHTML=
    viewHeader("DUELISTAS","Arena Arcana","PvP individual automático. El resultado, los Sellos y el rating se resuelven en el servidor.")+
    '<section class="arena-hero"><div><span class="section-kicker">CÍRCULO DE DUELO</span><h3>'+esc(selfProfile.mage_name)+'</h3>'+
      '<p>Seis combates clasificatorios al día según reloj del servidor. Los amistosos son ilimitados y no modifican tu rating.</p>'+
      '<div class="arena-meta">'+
        '<span><small>SELLOS</small><b>'+n(data.seals_remaining)+' / '+ARENA_DAILY_SEALS+'</b></span>'+
        '<span><small>RATING</small><b>'+n(data.rating)+'</b></span>'+
        '<span><small>DIVISIÓN</small><b>'+esc(arenaDivision(Number(data.rating)))+'</b></span>'+
        '<span><small>RÉCORD</small><b>'+n(data.wins)+'V · '+n(data.losses)+'D</b></span>'+
        '<span><small>ATAQUE</small><b>'+n(derived?.attack||0)+'</b></span>'+
      '</div></div>'+
      '<aside><i>'+trait.mark+'</i><strong>Nivel de Arena '+n(level)+'</strong><small>'+esc(trait.name)+' · '+esc(trait.skill)+'</small></aside>'+
    '</section>'+
    '<div class="arena-grid"><section class="panel"><div class="arena-title"><span class="section-kicker">RIVALES</span><h3>Contrincantes cercanos</h3></div>'+
      '<div class="arena-list">'+(targets.length?targets.map(function(t){
        const tr=arenaTrait(t.school_code);
        return '<article class="arena-row"><i>'+tr.mark+'</i><div><strong><button class="player-link" data-profile="'+esc(t.mage_name)+'">'+esc(t.mage_name)+'</button></strong>'+
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
  $$(".arena-history-row").forEach(btn=>btn.addEventListener("click",()=>{
    const rec=history.find(x=>x.id===btn.dataset.id);if(rec)arenaOpen(rec);
  }));
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
