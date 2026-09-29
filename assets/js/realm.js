"use strict";

function renderRealm(){
  const r=realmState.realm,b=realmState.buildings,c=realmState.capacities; const school=catalogs.schools.find(s=>s.code===r.school_code);
  $("#view-host").innerHTML=`${viewHeader("DOMINIO","Tu Reino","El pulso central de tu Archimago y sus dominios.")}
  ${r.pending_territory_damage>0?`<div class="warning-box" style="margin-bottom:14px">Daño territorial pendiente: ${n(r.pending_territory_damage)} acres. Algunas acciones están bloqueadas hasta que versionemos su resolución.</div>`:""}
  <div class="realm-hero"><div class="realm-banner"><div><span class="section-kicker">${esc(school?.name_es||r.school_code)}</span><h2>${esc(r.mage_name)}</h2><p>${n(r.land)} acres · Nivel Mágico ${n(r.spell_level)} · ${r.status==="alive"?"Archimago vivo":"Archimago caído"}</p><div class="quick-actions"><button class="small-action" data-quick="economy">ECONOMÍA</button><button class="small-action" data-quick="build">CONSTRUIR</button><button class="small-action" data-quick="war">GUERRA</button></div></div></div>
  <div class="realm-side"><div class="stat-card"><small>Poder Neto</small><strong>${n(r.net_power)}</strong><em>Medida total de tu reino y ejército</em></div><div class="stat-card"><small>Terreno salvaje</small><strong>${n(r.wilderness)}</strong><em>Disponible para construir</em></div><div class="stat-card"><small>Fortalezas</small><strong>${n(b.fortresses)}</strong><em>Con 0, el Archimago muere</em></div></div></div>
  <div class="grid-4"><div class="stat-card"><small>Cap. residencial</small><strong>${n(c.residential)}</strong></div><div class="stat-card"><small>Cap. alimentos</small><strong>${n(c.food)}</strong></div><div class="stat-card"><small>Cap. maná</small><strong>${n(c.mana)}</strong></div><div class="stat-card"><small>Hechizos</small><strong>${n(realmState.known_spells.length)}</strong></div></div>
  <div class="panel" style="margin-top:14px"><h3>Explorar nuevas tierras</h3><p class="intro" style="margin:0 0 12px;text-align:left">Envía expediciones para ampliar tu reino. La exploración consume turnos y su rendimiento disminuye a medida que te acercas a 3.500 acres.</p><div class="action-panel"><label>Turnos<input id="realm-explore-turns" type="number" min="1" max="50" value="1"></label><button id="realm-explore-button" class="primary-action">✦ EXPLORAR</button></div></div>`;
  document.querySelectorAll('[data-quick]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.quick)));
  $("#realm-explore-button").addEventListener("click",()=>doExplore($("#realm-explore-button"),"realm-explore-turns"));
}
