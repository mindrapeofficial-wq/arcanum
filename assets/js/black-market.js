"use strict";

/* Mercado de las Sombras (subastas de unidades y hechizos). Ver docs/REINCARNATION_BLACK_MARKET.md.
   Todo el estado es del servidor (bm_list_lots, bm_place_bids, bm_my_bids): este módulo solo lo muestra y envía
   lot_id + importe. Sin almacenamiento en el navegador. Mientras la bandera del servidor esté apagada (o las RPCs
   no existan) el botón permanece oculto. */

const BM_REFRESH_MS = 60000;
const BM_BOOT_RETRY_MS = 4000;
let bmState = null;
let bmTimer = null;
let bmBooted = false;

function bmNumber(value) {
  return Math.max(0, Math.floor(Number(value) || 0)).toLocaleString("es-ES");
}

function bmMinutesText(minutes) {
  const m = Math.max(0, Math.floor(Number(minutes) || 0));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}

function bmError(error) {
  const m = String(error?.message || error || "");
  const map = [
    ["BLACK_MARKET_DISABLED", "El Mercado de las Sombras está cerrado por ahora."],
    ["BID_TOO_LOW", "Tu puja debe superar el precio actual en al menos un 5 %."],
    ["NOT_ENOUGH_GOLD", "No tienes oro suficiente para el depósito."],
    ["NOT_ENOUGH_TURNS", "No tienes turnos suficientes para pujar."],
    ["ALREADY_TOP_BIDDER", "Ya eres el mejor postor de ese lote."],
    ["LOT_CLOSED", "Ese lote ya ha cerrado."],
    ["LOT_NOT_FOUND", "Ese lote ya no existe."],
    ["SPELL_ALREADY_KNOWN", "Ya conoces ese hechizo."],
    ["INVALID_BIDS", "La puja no es válida."],
    ["AUTH_REQUIRED", "Tu sesión ha caducado. Entra de nuevo."],
  ];
  for (const [code, text] of map) if (m.includes(code)) return text;
  return typeof humanError === "function" ? humanError(error) : "No se ha podido completar la acción.";
}

function bmKindLabel(kind) {
  return kind === "spell" ? "Hechizo" : "Unidades";
}

async function refreshBlackMarket() {
  if (!realmState?.realm) return;
  try {
    const data = await rpc("bm_list_lots", { p_kind: null });
    bmState = data?.enabled ? data : null;
  } catch (_) {
    bmState = null; // RPCs not deployed yet or session expired: keep the button hidden
  }
  const button = $("#black-market-button");
  if (button) button.classList.toggle("hidden", !bmState);
}

function startBlackMarket() {
  if (bmBooted) return;
  bmBooted = true;
  const boot = () => {
    if (!realmState?.realm) { setTimeout(boot, BM_BOOT_RETRY_MS); return; }
    refreshBlackMarket();
    bmTimer = setInterval(refreshBlackMarket, BM_REFRESH_MS);
  };
  boot();
}

function bmLotRowHtml(lot) {
  const state = lot.is_mine ? '<span class="bm-tag bm-mine">Vas ganando</span>' : lot.has_bids ? '<span class="bm-tag">Con pujas</span>' : '<span class="bm-tag">Sin pujas</span>';
  const clock = lot.countdown_started ? `Cierra en ${bmMinutesText(lot.minutes_left)}` : `Sale a subasta hasta en ${bmMinutesText(lot.minutes_left)}`;
  return `<tr data-lot="${Number(lot.id)}">
    <td><strong>${esc(lot.name)}</strong><small> ${esc(bmKindLabel(lot.kind))}${lot.kind === "unit" ? ` × ${bmNumber(lot.qty)}` : ""}</small></td>
    <td>${bmNumber(lot.current_price || lot.min_price)}</td>
    <td>${esc(clock)} ${state}</td>
    <td><input class="bm-amount" type="number" inputmode="numeric" min="${Number(lot.next_min_bid)}" placeholder="${bmNumber(lot.next_min_bid)}" aria-label="Puja por ${esc(lot.name)}" ${lot.is_mine ? "disabled" : ""}></td>
  </tr>`;
}

function renderBlackMarketModal(myBids) {
  const lots = bmState?.lots || [];
  const bids = myBids?.bids || [];
  $("#modal-content").innerHTML = `<span class="section-kicker">SUBASTAS</span><h3>Mercado de las Sombras</h3>
    <p class="bm-rules">Pagas el depósito al pujar y <strong>no se puede cancelar</strong>; si te superan, tu oro vuelve. Cada puja sube al menos un 5 %. En los últimos 30 min, cada puja reinicia la cuenta atrás. Una orden cuesta 1 turno (más 1 por cada lote distinto adicional).</p>
    ${lots.length ? `<table class="bm-table"><thead><tr><th>Lote</th><th>Precio</th><th>Reloj</th><th>Tu puja</th></tr></thead><tbody>${lots.map(bmLotRowHtml).join("")}</tbody></table>
    <div class="bm-actions"><button type="button" class="primary-button" id="bm-submit">Pujar</button> <span id="bm-feedback" role="status"></span></div>` : '<div class="empty">No hay lotes en subasta ahora mismo.</div>'}
    <h4>Mis pujas</h4>
    ${bids.length ? `<ul class="bm-mybids">${bids.map((b) => `<li>${esc(b.kind === "spell" ? "Hechizo" : "Unidades")} <strong>${esc(b.ref)}</strong>: ${bmNumber(b.my_amount)} · ${b.status === "open" ? (b.winning ? "vas ganando" : "superada") : b.status === "sold" ? (b.winning ? "ganada" : "perdida") : "caducada"}</li>`).join("")}</ul>` : '<p class="muted">Sin pujas recientes.</p>'}`;
  $("#bm-submit")?.addEventListener("click", submitBlackMarketBids);
}

async function openBlackMarket() {
  $("#modal-content").innerHTML = '<div class="profile-loading">Abriendo el mercado…</div>';
  show($("#modal"));
  try {
    const [lots, myBids] = await Promise.all([rpc("bm_list_lots", { p_kind: null }), rpc("bm_my_bids")]);
    bmState = lots?.enabled ? lots : null;
    renderBlackMarketModal(myBids);
  } catch (error) {
    $("#modal-content").innerHTML = `<div class="empty">${esc(bmError(error))}</div>`;
  }
}

async function submitBlackMarketBids(event) {
  const button = event.currentTarget;
  const feedback = $("#bm-feedback");
  const bids = [...document.querySelectorAll(".bm-table tr[data-lot]")]
    .map((row) => ({ lot_id: Number(row.dataset.lot), amount: Math.floor(Number(row.querySelector(".bm-amount")?.value) || 0) }))
    .filter((b) => b.amount > 0);
  if (!bids.length) { if (feedback) feedback.textContent = "Escribe al menos un importe."; return; }
  button.disabled = true;
  try {
    const res = await rpc("bm_place_bids", { p_bids: bids });
    if (typeof loadRealmDomain === "function") loadRealmDomain(true);
    await openBlackMarket();
    const done = $("#bm-feedback");
    if (done) done.textContent = `Pujas enviadas: ${bmNumber(res?.deposited)} de oro en depósito, ${Number(res?.turns_spent) || 0} turno(s).`;
  } catch (error) {
    if (feedback) feedback.textContent = bmError(error);
    button.disabled = false;
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    $("#black-market-button")?.addEventListener("click", openBlackMarket);
    startBlackMarket();
  });
}
