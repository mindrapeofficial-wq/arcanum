"use strict";

/* Suerte de Lady Luck, estatus de apoyo y vínculo con Discord.
   Todo el estado es del servidor (my_luck_status, my_supporter_status, my_discord_link, notas de apoyo);
   este módulo solo lo muestra y llama a RPCs de lectura o de gestión de la propia cuenta.
   Sin almacenamiento en el navegador: nada de esto es una preferencia local. Mientras las RPCs no existan en el servidor,
   el botón permanece oculto. */

const LUCK_REFRESH_MS = 60000;
const LUCK_BOOT_RETRY_MS = 4000;
const SUPPORT_NOTES_MAX = 4000;
const DISCORD_INVITE_URL = ""; // pon aquí la invitación pública del Discord de Arcanum para mostrar el enlace
let luckSupportState = null;
let luckSupportTimer = null;
let luckSupportBooted = false;
const SUPPORTER_CACHE_MS = 300000;
const SUPPORTER_BATCH = 150;
const supporterCache = new Map(); // lower-case mage name -> {tier, at}
let supporterDecorateTimer = null;

function luckTimeLeftText(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  if (s <= 0) return "0 min";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h <= 0) return `${Math.max(1, m)} min`;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

function supporterTierLabel(tier) {
  return tier === "patron" ? "Mecenas" : tier === "supporter" ? "Colaborador" : "Sin estatus de apoyo";
}

function luckBonusLines(bonuses) {
  const lines = [];
  const summon = Number(bonuses?.summon_success_points) || 0;
  const explore = Number(bonuses?.explore_land_percent) || 0;
  if (summon > 0) lines.push(`+${summon} % de éxito al invocar`);
  if (explore > 0) lines.push(`+${explore} % de tierra al explorar`);
  return lines;
}

function luckSupportError(error) {
  const m = String(error?.message || error || "");
  const map = [
    ["ALREADY_LINKED", "Tu Arconte ya está vinculado a Discord."],
    ["RATE_LIMIT", "Espera unos segundos antes de pedir otro código."],
    ["SUPPORTER_REQUIRED", "Esta herramienta es para quienes apoyan el proyecto."],
    ["NOTES_TOO_LONG", `Las notas admiten hasta ${SUPPORT_NOTES_MAX} caracteres.`],
    ["AUTH_REQUIRED", "Tu sesión ha caducado. Entra de nuevo."],
  ];
  for (const [code, text] of map) if (m.includes(code)) return text;
  return typeof humanError === "function" ? humanError(error) : "No se ha podido completar la acción.";
}

async function loadLuckSupportState() {
  const [luck, supporter, discord] = await Promise.all([
    rpc("my_luck_status"),
    rpc("my_supporter_status"),
    rpc("my_discord_link"),
  ]);
  return { luck, supporter, discord };
}

function updateLuckButton() {
  const button = $("#luck-support-button");
  if (!button) return;
  if (!luckSupportState) { button.classList.add("hidden"); return; }
  button.classList.remove("hidden");
  const luck = luckSupportState.luck;
  const label = $("#luck-support-label");
  if (label) label.textContent = luck?.active ? `SUERTE ACTIVA · ${luckTimeLeftText(luck.seconds_left)}` : "SUERTE Y APOYO";
  button.classList.toggle("luck-active", !!luck?.active);
}

async function refreshLuckSupport() {
  if (!realmState?.realm) return;
  try {
    luckSupportState = await loadLuckSupportState();
  } catch (_) {
    luckSupportState = null; // RPCs not deployed yet or session expired: keep the button hidden
  }
  updateLuckButton();
}

function startLuckSupport() {
  if (luckSupportBooted) return;
  luckSupportBooted = true;
  const boot = () => {
    if (!realmState?.realm) { setTimeout(boot, LUCK_BOOT_RETRY_MS); return; }
    refreshLuckSupport();
    clearInterval(luckSupportTimer);
    luckSupportTimer = setInterval(refreshLuckSupport, LUCK_REFRESH_MS);
  };
  boot();
}

function luckSectionHtml(state) {
  const luck = state.luck || {};
  const lines = luckBonusLines(luck.bonuses);
  const status = luck.active
    ? `<strong class="luck-on">ACTIVA</strong><small>Quedan ${esc(luckTimeLeftText(luck.seconds_left))}</small>`
    : `<strong>INACTIVA</strong><small>Reclámala con <code>/suerte</code> en el Discord de Arcanum (una vez al día).</small>`;
  return `<section class="luck-section"><span class="section-kicker">LADY LUCK</span>
    <div class="luck-status">${status}</div>
    <ul class="luck-bonuses">${(lines.length ? lines : ["+5 % de éxito al invocar", "+10 % de tierra al explorar"]).map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    <p class="tools-note">Dura 24 horas y los efectos no se acumulan. Reclamar de nuevo mientras está activa solo la renueva.</p></section>`;
}

function discordSectionHtml(state) {
  const link = state.discord || {};
  if (link.linked) {
    return `<section class="luck-section"><span class="section-kicker">DISCORD</span>
      <div class="luck-status"><strong class="luck-on">VINCULADO</strong><small>${esc(link.discord_name || "Cuenta de Discord")}</small></div>
      <div class="luck-actions"><button class="small-action" id="discord-unlink" type="button">DESVINCULAR</button></div></section>`;
  }
  const invite = DISCORD_INVITE_URL ? `<a class="support-link" href="${esc(DISCORD_INVITE_URL)}" target="_blank" rel="noopener noreferrer">Unirme al Discord</a>` : "";
  return `<section class="luck-section"><span class="section-kicker">DISCORD</span>
    <p class="tools-note">Vincula tu cuenta para reclamar la suerte desde Discord. Genera un código aquí y escribe <code>/vincular</code> con él en el servidor.</p>
    <div id="discord-code-box" class="luck-code hidden"></div>
    <div class="luck-actions"><button class="small-action" id="discord-code" type="button">GENERAR CÓDIGO</button>${invite}</div></section>`;
}

function supporterSectionHtml(state) {
  const sup = state.supporter || {};
  const perks = [["badge", "Insignia de apoyo"], ["notes", "Notas privadas en el servidor"], ["discord_role", "Rol de apoyo en Discord"]];
  const have = new Set(Array.isArray(sup.perks) ? sup.perks : []);
  const list = perks.map(([id, text]) => `<li class="${have.has(id) ? "perk-on" : "perk-off"}">${have.has(id) ? "✦" : "·"} ${esc(text)}</li>`).join("");
  const help = sup.supporter ? "" : `<p class="tools-note">El apoyo nunca da poder en el juego: son comodidades e identidad. Tras tu aportación, un administrador te asigna puntos de apoyo (2 = Colaborador, 15 = Mecenas).</p>
    <div class="luck-actions"><a class="support-link" href="https://paypal.me/mindrapecorp" target="_blank" rel="noopener noreferrer">✦ Apoyar el proyecto</a></div>`;
  return `<section class="luck-section"><span class="section-kicker">ESTATUS DE APOYO</span>
    <div class="luck-status"><strong class="${sup.supporter ? "luck-on" : ""}">${esc(supporterTierLabel(sup.tier).toUpperCase())}</strong><small>${n(sup.credit_points || 0)} puntos de apoyo</small></div>
    <ul class="luck-perks">${list}</ul>${sup.supporter ? `<label class="luck-switch"><input id="supporter-badge-visible" type="checkbox" ${sup.badge_visible ? "checked" : ""}> Mostrar mi insignia a los demás jugadores</label>` : ""}${help}</section>`;
}

function notesSectionHtml(state) {
  if (!state.supporter?.supporter) return "";
  return `<section class="luck-section"><span class="section-kicker">NOTAS PRIVADAS</span>
    <textarea id="support-notes" class="luck-notes" maxlength="${SUPPORT_NOTES_MAX}" rows="6" placeholder="Objetivos, rivales, ideas de formación…" aria-label="Notas privadas"></textarea>
    <div class="luck-actions"><button class="small-action" id="support-notes-save" type="button">GUARDAR NOTAS</button><small id="support-notes-count" class="tools-note"></small></div></section>`;
}

async function openLuckSupport() {
  $("#modal-content").innerHTML = '<div class="profile-loading">Consultando la fortuna…</div>';
  show($("#modal"));
  try {
    luckSupportState = await loadLuckSupportState();
  } catch (error) {
    $("#modal-content").innerHTML = `<div class="empty">${esc(luckSupportError(error))}</div>`;
    return;
  }
  updateLuckButton();
  renderLuckSupportModal();
}

function renderLuckSupportModal() {
  const state = luckSupportState;
  $("#modal-content").innerHTML = `<span class="section-kicker">FAVOR Y APOYO</span><h3>✦ Suerte y Apoyo</h3>
    <div class="luck-grid">${luckSectionHtml(state)}${discordSectionHtml(state)}${supporterSectionHtml(state)}${notesSectionHtml(state)}</div>`;
  wireLuckSupportModal();
  if (state.supporter?.supporter) loadSupportNotes();
}

function wireLuckSupportModal() {
  $("#discord-code")?.addEventListener("click", async (event) => {
    const btn = event.currentTarget; btn.disabled = true;
    try {
      const res = await rpc("create_discord_link_code");
      const box = $("#discord-code-box");
      if (box) {
        const minutes = Math.max(1, Math.round((Date.parse(res.expires_at) - Date.now()) / 60000));
        box.classList.remove("hidden");
        box.innerHTML = `<small>Escribe en Discord (caduca en ${n(minutes)} min):</small><code>/vincular codigo:${esc(res.code)}</code>`;
      }
    } catch (error) { toast(luckSupportError(error), "error"); }
    finally { btn.disabled = false; }
  });
  $("#discord-unlink")?.addEventListener("click", async (event) => {
    if (!window.confirm("¿Desvincular tu cuenta de Discord? Podrás volver a vincularla cuando quieras.")) return;
    const btn = event.currentTarget; btn.disabled = true;
    try { await rpc("unlink_discord"); await openLuckSupport(); }
    catch (error) { toast(luckSupportError(error), "error"); btn.disabled = false; }
  });
  $("#supporter-badge-visible")?.addEventListener("change", toggleSupporterBadge);
  $("#support-notes-save")?.addEventListener("click", saveSupportNotes);
  $("#support-notes")?.addEventListener("input", updateNotesCount);
}

function updateNotesCount() {
  const area = $("#support-notes"), count = $("#support-notes-count");
  if (area && count) count.textContent = `${n(area.value.length)} / ${n(SUPPORT_NOTES_MAX)}`;
}

async function loadSupportNotes() {
  try {
    const res = await rpc("get_my_notes");
    const area = $("#support-notes");
    if (area) { area.value = String(res?.body || ""); updateNotesCount(); }
  } catch (error) { toast(luckSupportError(error), "error"); }
}

async function saveSupportNotes(event) {
  const btn = event.currentTarget; btn.disabled = true;
  try {
    await rpc("save_my_notes", { p_body: String($("#support-notes")?.value || "").slice(0, SUPPORT_NOTES_MAX) });
    toast("Notas guardadas.", "success", 2200);
  } catch (error) { toast(luckSupportError(error), "error"); }
  finally { btn.disabled = false; }
}

document.addEventListener("DOMContentLoaded", () => {
  $("#luck-support-button")?.addEventListener("click", openLuckSupport);
  startLuckSupport();
});

/* ---------- Insignia de apoyo visible para los demás ---------- */
function supporterBadgeTitle(tier){
  return tier === "patron" ? "Mecenas de ARCANUM" : "Colaborador de ARCANUM";
}
function collectProfileNames(root){
  const names = new Set();
  root.querySelectorAll("[data-profile]").forEach(el => {
    if (el.dataset.supporterChecked) return;
    const name = String(el.dataset.profile || "").trim();
    if (name) names.add(name);
  });
  return [...names];
}
function applySupporterBadges(root, tiers) {
  root.querySelectorAll("[data-profile]").forEach(el => {
    if (el.dataset.supporterChecked) return;
    const tier = tiers.get(String(el.dataset.profile || "").trim().toLowerCase());
    el.dataset.supporterChecked = "1";
    if (!tier) return;
    const badge = document.createElement("span");
    badge.className = "supporter-badge " + tier;
    badge.textContent = "✦";
    badge.title = supporterBadgeTitle(tier);
    badge.setAttribute("aria-label", supporterBadgeTitle(tier));
    el.insertAdjacentElement("afterend", badge);
  });
}
async function decorateSupporterBadges(root) {
  if (!root || !realmState?.realm) return;
  const names = collectProfileNames(root);
  if (!names.length) return;
  const now = Date.now();
  const tiers = new Map();
  const missing = [];
  for (const name of names) {
    const key = name.toLowerCase();
    const cached = supporterCache.get(key);
    if (cached && now - cached.at < SUPPORTER_CACHE_MS) { if (cached.tier) tiers.set(key, cached.tier); }
    else missing.push(name);
  }
  for (let i = 0; i < missing.length; i += SUPPORTER_BATCH) {
    const batch = missing.slice(i, i + SUPPORTER_BATCH);
    try {
      const res = await rpc("supporters_among", { p_names: batch });
      for (const name of batch) {
        const tier = res?.[name.toLowerCase()] || null;
        supporterCache.set(name.toLowerCase(), { tier, at: now });
        if (tier) tiers.set(name.toLowerCase(), tier);
      }
    } catch (_) { return; } // RPC not deployed yet: no badges, no errors
  }
  applySupporterBadges(root, tiers);
}
function queueSupporterDecoration() {
  clearTimeout(supporterDecorateTimer);
  supporterDecorateTimer = setTimeout(() => {
    for (const id of ["view-host", "modal-content"]) decorateSupporterBadges(document.getElementById(id));
  }, 400);
}
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(queueSupporterDecoration);
  for (const id of ["view-host", "modal-content"]) {
    const el = document.getElementById(id);
    if (el) observer.observe(el, { subtree: true, childList: true });
  }
});

async function toggleSupporterBadge(event) {
  const box = event.currentTarget; box.disabled = true;
  try {
    await rpc("set_supporter_badge_visible", { p_visible: box.checked });
    supporterCache.clear();
    toast(box.checked ? "Tu insignia es visible para los demás." : "Tu insignia está oculta.", "success", 2400);
  } catch (error) { box.checked = !box.checked; toast(luckSupportError(error), "error"); }
  finally { box.disabled = false; }
}
