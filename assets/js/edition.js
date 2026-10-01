"use strict";

/* Edición del cliente.
   - "standard": ARCANUM completo (Arconte, Arena, Expediciones, Eventos, Reliquias…).
   - "classic":  ARCANUM Classic = solo el juego de Archmage: el Reino (turnos, tierra, edificios, grimorio,
                 ejército e invocaciones, guerra, mercado, alianzas, clasificación y comunidad).
   La edición no cambia ninguna regla ni dato: ambas comparten servidor, cuentas y mundo. Classic únicamente
   oculta la capa de rol y no llama a las funciones de Arconte. Se activa con window.ARCANUM_EDITION="classic"
   (lo inyecta scripts/build-classic.mjs) o, para probar en local, con ?edition=classic. */

const ARCANUM_EDITION = (() => {
  const forced = String(globalThis.ARCANUM_EDITION || "").toLowerCase();
  if (forced === "classic" || forced === "standard") return forced;
  try { if (new URLSearchParams(location.search).get("edition") === "classic") return "classic"; } catch (_) { /* no location */ }
  return "standard";
})();
const ARCANUM_IS_CLASSIC = ARCANUM_EDITION === "classic";

// Vistas de la capa de rol que no existen en Classic.
const CLASSIC_HIDDEN_VIEWS = Object.freeze(["character", "artifacts", "arena", "pve", "event", "tavern", "pvp-ranking"]);
// Classic conserva el vocabulario propio de ARCANUM (Arconte, Viridia, Aurea, Cineria,
// Nadir, Oneiria): es un juego con la mecánica del original pero identidad propia, así que
// NO se reescribe "Arconte" → "Archimago". El diccionario queda disponible por si en el
// futuro se quiere renombrar algún término concreto; vacío = sin reescrituras.
const CLASSIC_TERMS = Object.freeze([]);
const CLASSIC_SKIP_SELECTOR = "script,style,textarea,input,[data-profile],.chat-messages,.board-posts,.direct-chat-messages,.inbox-message-copy";
const CLASSIC_MANUAL_HIDE = /arena|expedici|personaje|arconte|reliquia|artefacto|duelo|evento/i;

/* ---------- helpers puros (probados) ---------- */
function classicText(value) {
  let out = String(value ?? "");
  for (const [pattern, replacement] of CLASSIC_TERMS) out = out.replace(pattern, replacement);
  return out;
}
function classicViewAllowed(view) {
  return !CLASSIC_HIDDEN_VIEWS.includes(String(view || ""));
}
function classicTutorialSteps(steps) {
  return (steps || [])
    .filter(step => classicViewAllowed(step?.view))
    .map((step, index) => ({ ...step, kicker: String(step.kicker || "").replace(/PASO \d+/, `PASO ${index + 1}`) }));
}
function classicNavGroup(view, fallbackGroup) {
  if (view === "research") return "reino";
  return fallbackGroup === "arconte" ? "reino" : fallbackGroup;
}

/* ---------- aplicación sobre el DOM ---------- */
function classicRewriteTree(root) {
  if (!root || !CLASSIC_TERMS.length) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest(CLASSIC_SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
      return /arconte/i.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const next = classicText(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  }
}

function classicTidy(root) {
  // Perfil social: el nivel del Arconte no existe en Classic.
  root.querySelectorAll?.(".profile-subline").forEach(el => {
    el.childNodes.forEach(n => { if (n.nodeType === 3) n.nodeValue = n.nodeValue.replace(/\s*·\s*Nivel\s+\d+/i, ""); });
  });
  // Manual: fuera las secciones de la capa de rol.
  root.querySelectorAll?.("details.manual-section").forEach(section => {
    const title = section.querySelector("summary")?.textContent || "";
    if (CLASSIC_MANUAL_HIDE.test(title)) section.remove();
  });
}

function classicApplyNavigation() {
  const mainNav = document.getElementById("main-nav");
  const arconteSection = mainNav?.querySelector('details[data-nav-group="arconte"]');
  const reinoPages = mainNav?.querySelector('details[data-nav-group="reino"] .nav-group-pages');
  const research = arconteSection?.querySelector('button[data-view="research"]');
  if (research && reinoPages) {
    const economy = reinoPages.querySelector('button[data-view="economy"]');
    economy ? economy.after(research) : reinoPages.appendChild(research);
  }
  arconteSection?.remove();

  const mobileReino = document.querySelector('.mobile-nav-group[data-mobile-nav-group="reino"]');
  const mobileArconte = document.querySelector('.mobile-nav-group[data-mobile-nav-group="arconte"]');
  const mobileResearch = mobileArconte?.querySelector('button[data-view="research"]');
  if (mobileResearch && mobileReino) {
    const economy = mobileReino.querySelector('button[data-view="economy"]');
    economy ? economy.after(mobileResearch) : mobileReino.appendChild(mobileResearch);
  }
  mobileArconte?.remove();
  document.querySelector('[data-nav-group-trigger="arconte"]')?.remove();

  for (const view of CLASSIC_HIDDEN_VIEWS) document.querySelectorAll(`[data-view="${view}"]`).forEach(el => el.remove());
  // El producto se llama ARCANUM; "Classic" es solo el modelo interno, no una marca visible.
  // No se añade etiqueta "CLASSIC" ni se renombra el título.
}

function classicWrapRuntime() {
  // Nunca se entra en una vista de la capa de rol (menús, enlaces o estado antiguo): se vuelve al Dominio.
  if (typeof navigate === "function") {
    const original = navigate;
    globalThis.navigate = function classicNavigate(view, ...rest) {
      return original(classicViewAllowed(view) ? view : "realm", ...rest);
    };
  }
  if (typeof navGroupForView === "function") {
    const original = navGroupForView;
    globalThis.navGroupForView = view => classicNavGroup(view, original(view));
  }
  // El perfil social solo usa la RPC del Core: Classic no llama a las funciones de Arconte (identidad, duelos, inventario).
  globalThis.loadArchmageSnapshot = async name => ({ profile: await rpc("player_profile", { p_mage_name: name }) });
  globalThis.combatHydrateProfile = undefined;
  globalThis.lootHydrateProfile = undefined;
  if (typeof tutorialSteps !== "undefined" && Array.isArray(tutorialSteps)) {
    const filtered = classicTutorialSteps(tutorialSteps);
    tutorialSteps.splice(0, tutorialSteps.length, ...filtered);
  }
}

function startClassicEdition() {
  document.documentElement.dataset.edition = "classic";
  classicApplyNavigation();
  classicWrapRuntime();
  if (typeof syncNavigationGroup === "function") syncNavigationGroup(typeof currentView === "string" ? currentView : "realm");

  const run = () => { classicRewriteTree(document.body); classicTidy(document); };
  run();
  let queued = null;
  new MutationObserver(() => { clearTimeout(queued); queued = setTimeout(run, 80); })
    .observe(document.body, { subtree: true, childList: true, characterData: false });
}

if (typeof document !== "undefined") {
  document.documentElement.dataset.edition = ARCANUM_EDITION;
  if (ARCANUM_IS_CLASSIC) document.addEventListener("DOMContentLoaded", startClassicEdition);
}
