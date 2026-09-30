"use strict";

function economyActionCard(action,title,description,icon,label){
  return `<button class="economy-action-card econ-action" data-action="${esc(action)}" type="button">
    <img src="${esc(icon)}" alt="" aria-hidden="true" loading="lazy">
    <span><strong>${esc(title)}</strong><small>${esc(description)}</small></span>
    <b>${esc(label)}</b>
  </button>`;
}

function renderEconomy(){
  const r=realmState.realm,c=realmState.capacities;
  const popCap=Math.min(c.food,c.residential);

  $("#view-host").innerHTML=`
    <div class="economy-resource-grid">
      <div class="economy-resource-card">
        <img src="assets/ui/resources/oro.png?v=${BUILD_VERSION}" alt="" aria-hidden="true">
        <div><small>TESORO</small><strong><span data-live-resource="gold">${n(r.gold)}</span></strong><span>Oro disponible para construir, reclutar y sostener tu reino.</span></div>
      </div>
      <div class="economy-resource-card">
        <img src="assets/ui/resources/mana.png?v=${BUILD_VERSION}" alt="" aria-hidden="true">
        <div><small>RESERVA ARCANA</small><strong><span data-live-resource="mana">${n(r.mana)}</span> <em>/ ${n(c.mana)}</em></strong><span>Maná almacenado y capacidad máxima de tus Nodos.</span></div>
      </div>
      <div class="economy-resource-card">
        <img src="assets/ui/resources/poblacion.png?v=${BUILD_VERSION}" alt="" aria-hidden="true">
        <div><small>POBLACIÓN</small><strong><span data-live-resource="population">${n(r.population)}</span> <em>/ ${n(popCap)}</em></strong><span>Habitantes disponibles. Granjas y Pueblos sostienen su crecimiento.</span></div>
      </div>
    </div>

    <section class="economy-section">
      <div class="economy-section-head">
        <div><span class="section-kicker">ADMINISTRACIÓN DEL REINO</span><h3>¿Cómo quieres emplear tus turnos?</h3><p>Cada turno puede hacer avanzar tu economía de una forma distinta. Elige una prioridad según lo que necesites ahora.</p></div>
        <label class="economy-turn-picker">TURNOS<input id="econ-turns" type="number" min="1" max="50" value="1" inputmode="numeric"></label>
      </div>
      <div class="economy-action-grid">
        ${economyActionCard("NONE","Desarrollo equilibrado","Procesa el turno sin forzar una prioridad concreta. Una opción estable cuando tu reino está compensado.","assets/ui/resources/poblacion.png?v="+BUILD_VERSION,"NORMAL")}
        ${economyActionCard("TAX","Recaudar impuestos","Prioriza la obtención de oro. Útil antes de construir, reclutar tropas o afrontar gastos elevados.","assets/ui/resources/oro.png?v="+BUILD_VERSION,"RECAUDAR")}
        ${economyActionCard("MP_CHARGE","Cargar maná","Concentra el esfuerzo del reino en recuperar maná para investigación, hechizos e invocaciones.","assets/ui/resources/mana.png?v="+BUILD_VERSION,"CARGAR MANÁ")}
      </div>
    </section>

    <section class="economy-explore-card">
      <div class="economy-explore-visual"><img src="assets/ui/nav/reino.png?v=${BUILD_VERSION}" alt="" aria-hidden="true"></div>
      <div class="economy-explore-copy">
        <span class="section-kicker">EXPANSIÓN TERRITORIAL</span>
        <h3>Explorar nuevas tierras</h3>
        <p>Envía expediciones más allá de tus fronteras para conseguir acres salvajes que después podrás convertir en edificios. La exploración rinde menos conforme tu reino se aproxima a <b>3.500 acres</b>.</p>
        <div class="economy-explore-tip">Consejo: si acumulas mucha tierra salvaje, visita <b>Construcción</b> para transformarla en Granjas, Pueblos, Nodos y otras estructuras.</div>
      </div>
      <div class="economy-explore-action">
        <label>TURNOS<input id="explore-turns" type="number" min="1" max="50" value="1" inputmode="numeric"></label>
        <button id="explore-button" class="primary-action">✦ EXPLORAR</button>
      </div>
    </section>`;

  updatePassiveResourceDisplay();
  $$(".econ-action").forEach(btn=>btn.addEventListener("click",()=>doEconomy(btn.dataset.action,btn)));
  $("#explore-button").addEventListener("click",()=>doExplore($("#explore-button")));
}

async function doEconomy(action,btn){
  const turns=Math.max(1,Math.min(50,Number($("#econ-turns").value)||1));
  await actionCall(btn,()=>rpc("run_economy",{p_action:action,p_turns:turns}),`Se han procesado ${turns} turno${turns===1?"":"s"}.`);
}

async function doExplore(btn,inputId="explore-turns"){
  const turns=Math.max(1,Math.min(50,Number($("#"+inputId).value)||1));
  const artifactClaim=typeof artifactStartExplorationClaim==="function"
    ?await artifactStartExplorationClaim(turns)
    :null;
  const res=await actionCall(btn,()=>rpc("explore",{p_turns:turns}),null,(result)=>`Exploración completada: +${n(result.land_gained)} acres.`);
  if(artifactClaim&&typeof artifactCompleteExplorationClaim==="function"){
    await artifactCompleteExplorationClaim(artifactClaim);
  }
  return res;
}
