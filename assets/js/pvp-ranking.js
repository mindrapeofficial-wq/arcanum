"use strict";

const PVP_RANK_SCHOOLS={
  verdant:{name:"Viridia",mark:"♧"},
  ascendant:{name:"Aurea",mark:"✦"},
  eradication:{name:"Cineria",mark:"✹"},
  abyssal:{name:"Nadir",mark:"◆"},
  phantasm:{name:"Oneiria",mark:"◌"}
};

function pvpRankSchool(code){return PVP_RANK_SCHOOLS[code]||PVP_RANK_SCHOOLS.ascendant}
function pvpRankDivision(v){
  return v>=1700?"Leyenda Arcana":v>=1500?"Arconte":v>=1350?"Gran Mago":v>=1200?"Maestro":v>=1050?"Adepto":v>=900?"Aprendiz":"Iniciado";
}
function pvpRankMedal(position){
  return position===1?"I":position===2?"II":position===3?"III":String(position);
}
function pvpRankRow(row){
  const school=pvpRankSchool(row.school_code);
  const games=Math.max(0,Number(row.games||0));
  const rate=games?Number(row.win_rate||0).toFixed(1)+"%":"—";
  return '<article class="pvp-rank-row '+(row.is_self?"is-self":"")+'">'+
    '<div class="pvp-rank-pos"><b>'+esc(pvpRankMedal(Number(row.position)))+'</b></div>'+
    '<div class="pvp-rank-player"><span class="pvp-school-mark school-'+esc(row.school_code)+'">'+school.mark+'</span><div><button class="player-link" data-profile="'+esc(row.username)+'">'+esc(row.username)+'</button><small>'+esc(school.name)+' · '+esc(pvpRankDivision(Number(row.rating)))+'</small></div></div>'+
    '<div class="pvp-rank-stat win"><small>VICTORIAS</small><b>'+n(row.wins)+'</b></div>'+
    '<div class="pvp-rank-stat loss"><small>DERROTAS</small><b>'+n(row.losses)+'</b></div>'+
    '<div class="pvp-rank-stat rate"><small>RATIO</small><b>'+rate+'</b></div>'+
    '<div class="pvp-rank-elo"><small>ELO</small><b>'+n(row.rating)+'</b></div>'+
  '</article>';
}

async function renderPvpRanking(){
  const data=await stateApi("/arena/ranking");
  const rows=Array.isArray(data?.ranking)?data.ranking:[];
  const self=rows.find(x=>x.is_self)||null;
  const leader=rows[0]||null;
  $("#view-host").innerHTML=
    '<section class="pvp-ranking-hero">'+
      '<div><span class="section-kicker">CLASIFICACIÓN DE LA ARENA</span><h3>Ranking PvP</h3><p>Clasificación competitiva por ELO. Solo aparecen jugadores reales; los duelos amistosos no alteran la tabla.</p></div>'+
      '<div class="pvp-ranking-summary">'+
        '<span><small>TU POSICIÓN</small><b>'+(self?"#"+n(self.position):"—")+'</b></span>'+
        '<span><small>TU ELO</small><b>'+(self?n(self.rating):"1000")+'</b></span>'+
        '<span><small>TU RÉCORD</small><b>'+(self?n(self.wins)+"V · "+n(self.losses)+"D":"0V · 0D")+'</b></span>'+
        '<span><small>LÍDER</small><b>'+(leader?esc(leader.username):"—")+'</b></span>'+
      '</div>'+
    '</section>'+
    '<section class="panel pvp-ranking-panel">'+
      '<div class="pvp-ranking-head"><div>#</div><div>ARCHIMAGO</div><div>V</div><div>D</div><div>RATIO</div><div>ELO</div></div>'+
      '<div class="pvp-ranking-list">'+(rows.length?rows.map(pvpRankRow).join(""):'<div class="empty">Todavía no hay jugadores clasificables.</div>')+'</div>'+
    '</section>';
}

globalThis.renderPvpRanking=renderPvpRanking;
