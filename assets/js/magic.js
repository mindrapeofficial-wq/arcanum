"use strict";

function spellEligible(spell){
  if(!spell.researchable || spell.rank==="ancient")return false; const mine=realmState.realm.school_code; if(spell.school_code===mine)return true;
  const school=catalogs.schools.find(s=>s.code===mine); const adjacent=(school?.adjacent_codes||[]).includes(spell.school_code);
  if(mine==="phantasm")return ["simple","average","complex"].includes(spell.rank);
  if(adjacent)return ["simple","average","complex"].includes(spell.rank);
  return ["simple","average"].includes(spell.rank);
}
// The server raises the research cost of an adjacent school (e.g. 500 -> 881 RP); the catalog only knows the base cost.
function spellIsAdjacent(spell){
  const mine=realmState.realm.school_code; if(!spell||spell.school_code===mine)return false;
  const school=catalogs.schools.find(s=>s.code===mine); return (school?.adjacent_codes||[]).includes(spell.school_code);
}
function renderResearch(){
  const known=new Set(realmState.known_spells.map(s=>s.spell_id)); const st=realmState.research||{}; const guilds=Number(realmState.buildings.guilds||0); const ppt=Math.floor(Math.sqrt(guilds)*3.5);
  const eligible=catalogs.spells.filter(s=>spellEligible(s)&&!known.has(s.id));
  let current=null; if(st.current_spell_id)current=catalogs.spells.find(s=>s.id===st.current_spell_id);
  const cards=catalogs.spells.filter(s=>s.researchable).map(s=>`<div class="spell-card ${known.has(s.id)?"known":""}"><span class="school-dot ${esc(s.school_code)}"></span><strong>${esc(s.name_es)}</strong><small>${esc(rankNames[s.rank]||s.rank)} · ${esc(catalogs.schools.find(x=>x.code===s.school_code)?.name_es||s.school_code)}</small><div class="spell-meta"><span>${known.has(s.id)?"APRENDIDO":spellEligible(s)?`${n(s.research_cost)} RP${spellIsAdjacent(s)?" base":""}`:"NO AFIN"}</span><span>+${n(s.spell_level_gain)} NM</span></div></div>`).join("");
  const prog=current&&st.effective_cost?Math.max(0,Math.min(100,100-(Number(st.remaining_points||0)/Number(st.effective_cost))*100)):0;
  $("#view-host").innerHTML=`${viewHeader("GRIMORIO","Conocimiento Arcano",`${n(guilds)} Gremios generan ${n(ppt)} puntos de conocimiento arcano por turno.`)}
  <div class="grid-2" style="margin-bottom:14px"><div class="panel"><h3>Conocimiento Arcano actual</h3>${current?`<strong>${esc(current.name_es)}</strong><p class="intro" style="text-align:left;margin:6px 0">Quedan ${n(st.remaining_points)} de ${n(st.effective_cost)} RP</p><div class="research-progress"><span style="width:${prog}%"></span></div>`:`<div class="empty">No estás investigando ningún hechizo.</div>`}</div><div class="panel"><h3>Investigar</h3><label class="field-caption">Hechizo<select id="research-spell" ${current?"disabled":""}>${current?`<option value="${esc(current.id)}">${esc(current.name_es)}</option>`:eligible.map(s=>`<option value="${esc(s.id)}">${esc(s.name_es)} · ${esc(rankNames[s.rank])} · ${n(s.research_cost)} RP${spellIsAdjacent(s)?" base · adyacente, cuesta más":""}</option>`).join("")}</select></label><label class="field-caption" style="display:grid;gap:6px;margin-top:10px">Turnos<input id="research-turns" type="number" min="1" max="50" value="1"></label><button id="research-button" class="primary-action" style="width:100%;margin-top:12px" ${ppt<1||(!current&&!eligible.length)?"disabled":""}>✦ INVESTIGAR</button></div></div>
  <div class="panel"><h3>Catálogo mágico</h3><div class="spell-grid">${cards}</div></div>`;
  $("#research-button")?.addEventListener("click",()=>doResearch($("#research-button")));
}
async function doResearch(btn){ const id=$("#research-spell")?.value; if(!id)return; const turns=Math.max(1,Math.min(50,Number($("#research-turns").value)||1)); await actionCall(btn,()=>rpc("research",{p_spell_ids:[id],p_turns:turns}),null,res=>res.completed?.length?`Has aprendido ${res.completed.map(x=>x.name_es).join(", ")}.`:`Conocimiento Arcano avanzado ${n(res.total_points_generated)} RP.`); }
