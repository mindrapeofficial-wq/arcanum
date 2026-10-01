"use strict";

function economyActionCard(action,title,description,icon,label){
  return `<button class="economy-action-card econ-action" data-action="${esc(action)}" type="button">
    <img src="${esc(icon)}" alt="" aria-hidden="true" loading="lazy">
    <span><strong>${esc(title)}</strong><small>${esc(description)}</small></span>
    <b>${esc(label)}</b>
  </button>`;
}

function economyPressure(value,cap){
  value=Math.max(0,Number(value)||0);cap=Math.max(0,Number(cap)||0);
  if(!cap)return 0;
  return Math.max(0,Math.min(100,Math.round(value/cap*100)));
}
function economyHealth(contract){
  const notes=[];
  const popPct=economyPressure(contract.population.value,contract.population.cap);
  const manaPct=economyPressure(contract.mana.value,contract.mana.cap);
  if(contract.population.cap<=0)notes.push({tone:"danger",title:"Sin capacidad poblacional",text:"Necesitas sustento y vivienda para que el dominio pueda mantener habitantes."});
  else if(popPct>=95)notes.push({tone:"danger",title:"Población bloqueada",text:"Estás prácticamente en el límite de sustento o vivienda. Granjas o Pueblos deben crecer antes que la población."});
  else if(popPct>=80)notes.push({tone:"warn",title:"Población cerca del techo",text:`Quedan ${n(contract.population.headroom)} plazas antes de alcanzar el límite actual.`});
  if(contract.food.margin<=Math.max(5,contract.population.value*.05))notes.push({tone:"warn",title:"Sustento ajustado",text:`El margen alimentario es de ${n(contract.food.margin)}. Las Granjas son el cuello de botella si este margen llega a cero.`});
  if(contract.housing.margin<=Math.max(5,contract.population.value*.05))notes.push({tone:"warn",title:"Vivienda ajustada",text:`El margen residencial es de ${n(contract.housing.margin)}. Los Pueblos son el cuello de botella si llega a cero.`});
  if(manaPct>=95)notes.push({tone:"info",title:"Reserva arcana casi llena",text:"Gastar o comerciar Maná evita desperdiciar capacidad de tus Nodos."});
  if(contract.research.value<=0)notes.push({tone:"info",title:"Sin flujo de Investigación",text:"Construye Gremios. Sin ellos, dedicar turnos a investigar no genera RP."});
  if(contract.land.wilderness>0)notes.push({tone:"good",title:"Terreno disponible",text:`Tienes ${n(contract.land.wilderness)} acres salvajes que todavía pueden convertirse en infraestructura.`});
  if(!notes.length)notes.push({tone:"good",title:"Economía estable",text:"No hay un cuello de botella evidente. Decide si priorizas tesoro, reserva arcana, investigación o expansión."});
  return notes.slice(0,4);
}
function economyBuildingCard(key,label,contract){
  const row=contract.buildings[key];
  return `<article class="economy-building-card"><div><small>${esc(label)}</small><strong>${n(row.count)}</strong></div><p>${esc(row.role)}</p></article>`;
}

function renderEconomy(){
  const r=realmState.realm,c=realmState.capacities;
  const contract=typeof economyContract==="function"?economyContract(realmState):null;
  const popCap=contract?.population?.cap??Math.min(c.food,c.residential);
  const food=foodResourceInfo(realmState), research=researchResourceInfo(realmState);
  const health=contract?economyHealth(contract):[];

  $("#view-host").innerHTML=`
    <section class="economy-contract-banner">
      <div><span class="section-kicker">REGLA ECONÓMICA 0.3</span><h3>Cada cifra tiene una función distinta</h3><p><b>Oro, Maná y Población</b> son reservas. <b>Alimento</b> es capacidad de sustento. <b>Investigación</b> es un ritmo de producción al gastar turnos investigando. <b>Tierras</b> son espacio físico y <b>Ascendencia</b> sólo mide fuerza global.</p></div>
      <span class="economy-contract-seal">CANÓNICO</span>
    </section>

    <div class="economy-resource-grid">
      <div class="economy-resource-card">
        <img src="assets/ui/resources/oro.png?v=${BUILD_VERSION}" alt="" aria-hidden="true">
        <div><small>ORO · RESERVA</small><strong><span data-live-resource="gold">${n(r.gold)}</span></strong><span>Liquidez para reclutamiento, mercado y costes económicos o militares. No define por sí sola tu crecimiento.</span></div>
      </div>
      <div class="economy-resource-card">
        <img src="assets/ui/resources/mana.png?v=${BUILD_VERSION}" alt="" aria-hidden="true">
        <div><small>MANÁ · RESERVA</small><strong><span data-live-resource="mana">${n(r.mana)}</span> <em>/ ${n(c.mana)}</em></strong><span>Reserva arcana limitada por tus Nodos. Se emplea en invocaciones, unidades mágicas, comercio y otros costes arcanos.</span></div>
      </div>
      <div class="economy-resource-card">
        <img src="assets/ui/resources/poblacion.png?v=${BUILD_VERSION}" alt="" aria-hidden="true">
        <div><small>POBLACIÓN · RESERVA</small><strong><span data-live-resource="population">${n(r.population)}</span> <em>/ ${n(popCap)}</em></strong><span>Habitantes disponibles. El máximo siempre es el menor entre capacidad alimentaria y residencial.</span></div>
      </div>
      <div class="economy-resource-card" title="${esc(food.title)}">
        <img src="assets/ui/resources/poblacion.png?v=${BUILD_VERSION}" alt="" aria-hidden="true">
        <div><small>ALIMENTO · CAPACIDAD</small><strong>${food.text}</strong><span>${food.stored?"Reserva alimentaria reportada por el servidor.":"No se almacena ni se gasta como una moneda: marca cuánta población pueden sostener tus Granjas."}</span></div>
      </div>
      <div class="economy-resource-card" title="${esc(research.title)}">
        <img src="assets/ui/nav/investigacion.png?v=${BUILD_VERSION}" alt="" aria-hidden="true">
        <div><small>INVESTIGACIÓN · FLUJO</small><strong>${research.text}</strong><span>${research.stored?"Puntos de Investigación reportados por el servidor.":"Tus Gremios determinan los RP producidos por cada turno que dedicas a investigar. No se acumulan estando inactivo."}</span></div>
      </div>
    </div>

    ${contract?`<section class="economy-ledger">
      <div class="economy-ledger-head"><div><span class="section-kicker">BALANCE DEL DOMINIO</span><h3>Cuellos de botella actuales</h3></div><small>lectura derivada del estado canónico</small></div>
      <div class="economy-ledger-grid">
        <div><small>SUSTENTO LIBRE</small><strong>${n(contract.food.margin)}</strong><span>capacidad antes del límite alimentario</span></div>
        <div><small>VIVIENDA LIBRE</small><strong>${n(contract.housing.margin)}</strong><span>capacidad antes del límite residencial</span></div>
        <div><small>ESPACIO DE MANÁ</small><strong>${n(contract.mana.headroom)}</strong><span>hasta llenar los Nodos</span></div>
        <div><small>TIERRA SALVAJE</small><strong>${n(contract.land.wilderness)}</strong><span>acres aún sin desarrollar</span></div>
        <div><small>RITMO DE INVESTIGACIÓN</small><strong>${n(contract.research.value)} RP/t</strong><span>por turno dedicado a investigar</span></div>
        <div><small>ASCENDENCIA</small><strong>${n(contract.ascendancy.value)}</strong><span>indicador, no recurso gastable</span></div>
      </div>
      <div class="economy-health-list">${health.map(x=>`<article class="economy-health ${x.tone}"><span></span><div><strong>${esc(x.title)}</strong><p>${esc(x.text)}</p></div></article>`).join("")}</div>
    </section>`:""}

    <section class="economy-section">
      <div class="economy-section-head">
        <div><span class="section-kicker">ADMINISTRACIÓN DEL REINO</span><h3>¿Cómo quieres emplear tus turnos?</h3><p>Los turnos son presupuesto de acciones. El servidor aplica el resultado real de cada acción y la interfaz sólo representa los valores confirmados.</p></div>
        <label class="economy-turn-picker">TURNOS<input id="econ-turns" type="number" min="1" max="50" value="1" inputmode="numeric"></label>
      </div>
      <div class="economy-action-grid">
        ${economyActionCard("NONE","Desarrollo equilibrado","Procesa turnos sin forzar una prioridad extraordinaria. Úsalo cuando no necesites concentrar la economía.","assets/ui/resources/poblacion.png?v="+BUILD_VERSION,"NORMAL")}
        ${economyActionCard("TAX","Recaudar impuestos","Orienta la acción económica hacia el Oro. Útil antes de reclutar, comerciar o afrontar gastos militares.","assets/ui/resources/oro.png?v="+BUILD_VERSION,"RECAUDAR")}
        ${economyActionCard("MP_CHARGE","Cargar maná","Orienta la acción económica hacia la reserva de Maná para invocaciones, unidades mágicas y comercio.","assets/ui/resources/mana.png?v="+BUILD_VERSION,"CARGAR MANÁ")}
      </div>
    </section>

    ${contract?`<section class="economy-building-section">
      <div class="economy-ledger-head"><div><span class="section-kicker">INFRAESTRUCTURA</span><h3>Qué hace cada edificio</h3></div><small>una función principal por estructura</small></div>
      <div class="economy-building-grid">
        ${economyBuildingCard("farms","GRANJAS",contract)}
        ${economyBuildingCard("towns","PUEBLOS",contract)}
        ${economyBuildingCard("nodes","NODOS",contract)}
        ${economyBuildingCard("workshops","TALLERES",contract)}
        ${economyBuildingCard("guilds","GREMIOS",contract)}
        ${economyBuildingCard("barracks","CUARTELES",contract)}
        ${economyBuildingCard("fortresses","FORTALEZAS",contract)}
        ${economyBuildingCard("barriers","BARRERAS",contract)}
      </div>
    </section>`:""}

    <section class="economy-explore-card">
      <div class="economy-explore-visual"><img src="assets/ui/nav/reino.png?v=${BUILD_VERSION}" alt="" aria-hidden="true"></div>
      <div class="economy-explore-copy">
        <span class="section-kicker">EXPANSIÓN TERRITORIAL</span>
        <h3>Explorar nuevas tierras</h3>
        <p>Explorar convierte <b>turnos</b> en <b>tierra salvaje</b>. Esa tierra todavía no produce nada: sólo adquiere función cuando la conviertes en edificios. El rendimiento disminuye al acercarte a <b>3.500 acres</b>.</p>
        <div class="economy-explore-tip">Cadena económica: <b>Explorar → Tierra salvaje → Construir → Capacidad/producción → Gastar en magia, ejército o comercio.</b></div>
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
  await actionCall(btn,()=>rpc("run_economy",{p_action:action,p_turns:turns}),`Se ${turns===1?"ha":"han"} procesado ${turns} turno${turns===1?"":"s"}.`);
}

async function doExplore(btn,inputId="explore-turns"){
  const turns=Math.max(1,Math.min(50,Number($("#"+inputId).value)||1));
  const turnWord=turns===1?"turno":"turnos";
  if(!window.confirm(`Explorar nuevas tierras gastará ${turns} ${turnWord}. ¿Quieres continuar?`))return null;
  const artifactClaim=typeof artifactStartExplorationClaim==="function"
    ?await artifactStartExplorationClaim(turns).catch(()=>null)
    :null;
    :null;

  const res=await actionCall(btn,()=>rpc("explore",{p_turns:turns}),null,(result)=>`Exploración completada: +${n(result.land_gained)} acres.`);

  if(artifactClaim&&typeof artifactCompleteExplorationClaim==="function"){
    await artifactCompleteExplorationClaim(artifactClaim).catch(error=>console.warn("Relic exploration claim failed",error));
  }
  }
  return res;
}
