"use strict";

let marketFilter="all";

function marketResourceLabel(code){
  return ({gold:"Oro",mana:"Maná",population:"Población"})[code]||code;
}
function marketResourceIcon(code){
  return ({gold:"assets/ui/resources/oro.png",mana:"assets/ui/resources/mana.png",population:"assets/ui/resources/poblacion.png"})[code]||"assets/ui/nav/economia.png";
}
function marketAmount(value){ return n(Math.max(0,Number(value)||0)); }

async function renderMarket(){
  $("#view-host").innerHTML=`
    <div class="market-intro">
      <section class="market-hero">
        <span class="section-kicker">BAZAR DE LOS CINCO REINOS</span>
        <h2>Mercado Arcano</h2>
        <p>Publica contratos de intercambio y encuentra Archimagos con los recursos que necesitas. Las ofertas duran 3 días y pueden retirarse en cualquier momento.</p>
      </section>
      <aside class="market-status">
        <small>FASE DE MERCADO</small>
        <strong>Contratos entre jugadores</strong>
        <p>Las ofertas son reales y compartidas. Por seguridad económica, esta fase negocia el acuerdo y abre el contacto entre jugadores; la transferencia automática de inventario se activará cuando pueda cerrarse atómicamente en el núcleo del reino.</p>
      </aside>
    </div>
    <section class="market-artifact-link"><div><span class="section-kicker">MERCADO DE RELIQUIAS</span><strong>Artefactos entre Archimagos</strong><p>Intercambia reliquias de forma atómica, incluidos los Únicos Mundiales.</p></div><button id="market-artifact-gateway" class="profile-action" type="button">ABRIR RELICARIO</button></section>\n    <div class="market-layout">
      <section class="panel">
        <span class="section-kicker">NUEVO CONTRATO</span>
        <h3>Publicar una oferta</h3>
        <p class="community-note">Puedes mantener hasta 8 contratos activos.</p>
        <form id="market-form" class="market-form">
          <div class="market-pair">
            <label>Ofrezco
              <select id="market-offer-resource">
                <option value="gold">Oro</option>
                <option value="mana">Maná</option>
                <option value="population">Población</option>
              </select>
            </label>
            <label>Cantidad<input id="market-offer-amount" type="number" min="1" max="1000000000" step="1" value="100" inputmode="numeric"></label>
          </div>
          <div class="market-pair">
            <label>Quiero
              <select id="market-want-resource">
                <option value="mana">Maná</option>
                <option value="gold">Oro</option>
                <option value="population">Población</option>
              </select>
            </label>
            <label>Cantidad<input id="market-want-amount" type="number" min="1" max="1000000000" step="1" value="100" inputmode="numeric"></label>
          </div>
          <label>Nota opcional<textarea id="market-note" maxlength="180" placeholder="Ej.: Busco intercambio rápido antes de una campaña."></textarea></label>
          <button id="market-publish" class="primary-action" type="submit">✦ PUBLICAR CONTRATO</button>
        </form>
        <div class="market-warning">El Mercado no descuenta recursos al publicar. Evita comprometer más de lo que posees mientras la liquidación automática permanece desactivada.</div>
      </section>
      <section class="panel">
        <div class="market-book-head">
          <div><span class="section-kicker">LIBRO DE OFERTAS</span><h3>Contratos activos</h3></div>
          <div class="market-book-tools">
            <select id="market-filter" class="market-filter">
              <option value="all">Todos</option>
              <option value="gold">Ofrecen oro</option>
              <option value="mana">Ofrecen maná</option>
              <option value="population">Ofrecen población</option>
            </select>
            <button id="market-refresh" class="icon-button" type="button" title="Actualizar mercado">↻</button>
          </div>
        </div>
        <div id="market-list" class="market-list"><div class="empty">Consultando el mercado…</div></div>
      </section>
    </div>`;
  $("#market-form").addEventListener("submit",publishMarketOffer);\n  $("#market-artifact-gateway")?.addEventListener("click",()=>navigate("artifacts"));
  $("#market-filter").addEventListener("change",e=>{marketFilter=e.target.value;loadMarketOffers();});
  $("#market-refresh").addEventListener("click",loadMarketOffers);
  $("#market-offer-resource").addEventListener("change",keepMarketResourcesDifferent);
  $("#market-want-resource").addEventListener("change",keepMarketResourcesDifferent);
  await loadMarketOffers();
}
function keepMarketResourcesDifferent(e){
  const offer=$("#market-offer-resource"),want=$("#market-want-resource");
  if(offer.value!==want.value)return;
  const values=["gold","mana","population"];
  if(e.target===offer)want.value=values.find(x=>x!==offer.value)||"mana";
  else offer.value=values.find(x=>x!==want.value)||"gold";
}
async function loadMarketOffers(){
  const host=$("#market-list"); if(!host)return;
  host.innerHTML='<div class="empty">Consultando el mercado…</div>';
  try{
    const data=await communityApi("/market");
    let offers=data.offers||[];
    if(marketFilter!=="all")offers=offers.filter(o=>o.offer_resource===marketFilter);
    host.innerHTML=offers.length?offers.map(o=>`
      <article class="market-offer">
        <div class="market-offer-main">
          <div class="market-offer-user"><span class="school-dot ${esc(o.school_code)}"></span><strong><button class="player-link" data-profile="${esc(o.username)}">${esc(o.username)}</button></strong></div>
          <div class="market-exchange">
            <span class="market-chip">OFRECE ${marketAmount(o.offer_amount)} ${esc(marketResourceLabel(o.offer_resource))}</span>
            <span class="market-arrow">→</span>
            <span class="market-chip">PIDE ${marketAmount(o.want_amount)} ${esc(marketResourceLabel(o.want_resource))}</span>
          </div>
          ${o.note?`<p class="market-note">${esc(o.note)}</p>`:""}
          <div class="market-meta">${communityTime(o.created_at)} · caduca ${new Date(o.expires_at).toLocaleDateString("es-ES")}</div>
        </div>
        <div class="market-actions">
          ${o.user_id===data.me
            ?`<button class="ghost-button" data-market-delete="${esc(o.id)}" type="button">RETIRAR</button>`
            :`<button class="small-action" data-profile="${esc(o.username)}" type="button">NEGOCIAR</button>`}
        </div>
      </article>`).join(""):'<div class="empty">No hay contratos activos con este filtro.</div>';
    host.querySelectorAll("[data-market-delete]").forEach(btn=>btn.addEventListener("click",()=>deleteMarketOffer(btn.dataset.marketDelete)));
  }catch(e){host.innerHTML=`<div class="empty">${esc(humanError(e))}</div>`;}
}
async function publishMarketOffer(e){
  e.preventDefault();
  const btn=$("#market-publish");
  const payload={
    offer_resource:$("#market-offer-resource").value,
    offer_amount:Math.floor(Number($("#market-offer-amount").value)||0),
    want_resource:$("#market-want-resource").value,
    want_amount:Math.floor(Number($("#market-want-amount").value)||0),
    note:$("#market-note").value.trim()
  };
  if(payload.offer_resource===payload.want_resource){toast("El recurso ofrecido y solicitado deben ser distintos.","error");return;}
  if(payload.offer_amount<1||payload.want_amount<1){toast("Las cantidades deben ser mayores que cero.","error");return;}
  const old=btn.innerHTML;btn.disabled=true;btn.textContent="PUBLICANDO…";
  try{
    await communityApi("/market",{method:"POST",body:payload});
    $("#market-note").value="";
    toast("Contrato publicado en el Mercado Arcano.");
    await loadMarketOffers();
  }catch(err){
    const msg=String(err?.message||err);
    toast(msg.includes("MARKET_OFFER_LIMIT")?"Ya tienes 8 contratos activos. Retira uno antes de publicar otro.":humanError(err),"error");
  }finally{btn.disabled=false;btn.innerHTML=old;}
}
async function deleteMarketOffer(id){
  if(!confirm("¿Retirar este contrato del mercado?"))return;
  try{
    await communityApi(`/market/${encodeURIComponent(id)}`,{method:"DELETE"});
    toast("Contrato retirado.");
    await loadMarketOffers();
  }catch(e){toast(humanError(e),"error");}
}
