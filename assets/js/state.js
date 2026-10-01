"use strict";

const SUPABASE_URL = "https://mrmvmoyysxuopqexbxfk.supabase.co";
const SUPABASE_KEY = "sb_publishable_tZEPJi2v7Tp-xDuVa0qWRw_geizIGoD";
const SESSION_KEY = "arcanum_session_v2";
const BUILD_VERSION = "0.3.24";
const VERSION_CHECK_INTERVAL_MS = 60000;
const COMMUNITY_API = "https://mrmvmoyysxuopqexbxfk.supabase.co/functions/v1/arcanum-community";
const ORACLE_API = "https://mrmvmoyysxuopqexbxfk.supabase.co/functions/v1/arcanum-oracle";
const BOSS_API = "https://mrmvmoyysxuopqexbxfk.supabase.co/functions/v1/arcanum-boss";
const STATE_API = "https://mrmvmoyysxuopqexbxfk.supabase.co/functions/v1/arcanum-state";
const DOMAIN_API = "https://mrmvmoyysxuopqexbxfk.supabase.co/functions/v1/arcanum-domain";
const COMMUNITY_POLL_MS = 2500;


const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const fmt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });
const symbols = { ascendant:"✦", verdant:"♧", eradication:"✹", abyssal:"◆", phantasm:"◌", plain:"⚔" };
const SCHOOL_NAMES = { verdant:"Viridia", ascendant:"Aurea", eradication:"Cineria", abyssal:"Nadir", phantasm:"Oneiria", plain:"Neutral" };
function schoolName(code){ return SCHOOL_NAMES[code] || code || "Escuela"; }
const rankNames = { simple:"Simple", average:"Medio", complex:"Complejo", ultimate:"Supremo", ancient:"Antiguo" };
const buildMeta = {
  farms:["Granjas","Aumentan la capacidad de sustento que limita tu población","5"],
  towns:["Pueblos","Aumentan la capacidad residencial y apoyan la economía de Oro","30"],
  nodes:["Nodos","Aumentan la capacidad y la economía de Maná","30"],
  workshops:["Talleres","Reducen el coste efectivo en turnos de futuras construcciones","10"],
  guilds:["Gremios","Generan RP cuando dedicas turnos a investigar","20"],
  barracks:["Cuarteles","Desbloquean el reclutamiento de unidades","5"],
  fortresses:["Fortalezas","Sostienen la supervivencia y la defensa estratégica del dominio","300"],
  barriers:["Barreras","Defensa arcana especializada · 1 por turno","1 turno"]
};

let mode = "login";
let selectedSchool = null;
let realmState = null;
let catalogs = { schools:[], spells:[], units:[], summons:[] };
let currentView = "character";
let nextTurnAt = null;
let turnRefreshPending = false;
let periodicTimer = null;
let countdownTimer = null;
let communityMode = "chat";
let communityPollTimer = null;
let communityBusy = false;
let communitySignature = "";

function esc(value){ return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
function n(value){ return fmt.format(Number(value || 0)); }
function show(el){ el?.classList.remove("hidden"); }
function hide(el){ el?.classList.add("hidden"); }
function setNotice(el,text,type="error"){ if(!el)return; el.textContent=text; el.className=`notice ${type}`; }
function clearNotice(el){ if(!el)return; el.textContent=""; el.className="notice hidden"; }
function toast(message,type="success",ms=4200){
  const host=$("#toast-host"); const item=document.createElement("div"); item.className=`toast ${type}`; item.textContent=message; host.appendChild(item);
  setTimeout(()=>item.remove(),ms);
}
async function stateApi(path,{method="GET",body}={}){
  const session=getSession();
  if(!session?.access_token)throw new Error("UNAUTHORIZED");
  const res=await fetch(STATE_API+path,{
    method,
    headers:{Authorization:`Bearer ${session.access_token}`,...(body?{"Content-Type":"application/json"}:{})},
    body:body?JSON.stringify(body):undefined,
    cache:"no-store"
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(String(data?.error||"STATE_API_ERROR"));
  return data;
}
async function domainApi({method="GET",body}={}){
  const session=getSession();
  if(!session?.access_token)throw new Error("UNAUTHORIZED");
  const res=await fetch(DOMAIN_API,{
    method,
    headers:{Authorization:`Bearer ${session.access_token}`,...(body?{"Content-Type":"application/json"}:{})},
    body:body?JSON.stringify(body):undefined,
    cache:"no-store"
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(String(data?.error||"DOMAIN_API_ERROR"));
  return data;
}

function humanError(error){
  const m=String(error?.message || error || "Error desconocido");
  const map=[
    ["BUYER_NOT_ENOUGH_GOLD","No tienes oro suficiente para aceptar este contrato."],["BUYER_NOT_ENOUGH_MANA","No tienes maná suficiente para aceptar este contrato."],["BUYER_NOT_ENOUGH_POPULATION","No tienes población suficiente para aceptar este contrato."],
    ["SELLER_NOT_ENOUGH_GOLD","El vendedor ya no dispone del oro comprometido."],["SELLER_NOT_ENOUGH_MANA","El vendedor ya no dispone del maná comprometido."],["SELLER_NOT_ENOUGH_POPULATION","El vendedor ya no dispone de la población comprometida."],
    ["MARKET_OFFER_EXPIRED","Este contrato ya ha caducado."],["MARKET_OFFER_NOT_OPEN","Este contrato ya no está disponible."],["MARKET_OFFER_NOT_FOUND","No se ha encontrado este contrato."],
    ["CANNOT_ACCEPT_OWN_OFFER","No puedes aceptar tu propio contrato."],["MARKET_SEASON_MISMATCH","El contrato pertenece a otra temporada."],["MARKET_SELLER_NOT_ALIVE","El dominio vendedor ya no puede comerciar."],
    ["MARKET_OFFER_LIMIT","Ya tienes 8 contratos activos."],["MARKET_OPERATION_FAILED","No se pudo completar la operación del mercado."],
    ["NOT_ENOUGH_TURNS","No tienes turnos suficientes."],["NOT_ENOUGH_WILDERNESS","No tienes terreno salvaje suficiente."],
    ["NOT_ENOUGH_GOLD","No tienes oro suficiente."],["NOT_ENOUGH_MANA","No tienes maná suficiente."],["NOT_ENOUGH_POPULATION","No tienes población suficiente."],
    ["NO_RESEARCH_PRODUCTION","Necesitas al menos un Gremio para investigar."],["SPELL_NOT_RESEARCHABLE","Ese hechizo no puede investigarse con tu Escuela."],
    ["RESEARCH_QUEUE_MUST_START_WITH_CURRENT","Debes terminar primero la conocimiento arcano actual."],["NO_BARRACKS","Necesitas Cuarteles para reclutar."],
    ["ATTACKER_HAS_NO_ARMY","Necesitas un ejército antes de atacar."],["TARGET_HAS_NO_ARMY","Ese objetivo no tiene ejército disponible para esta beta."],
    ["NOT_ENOUGH_RESOURCES_FOR_WAR_EXPENSE","No puedes pagar el gasto de guerra de tu ejército."],["BARRIERS_REQUIRE_EXCLUSIVE_BUILD","Las Barreras deben construirse en una orden separada."],
    ["BUILD_BATCH_TOO_LARGE","Ese lote de construcción requiere más de 50 turnos. Reduce la cantidad."],["REALM_ALREADY_EXISTS","Ya tienes un dominio en esta temporada."],
    ["INVITE_REQUIRED","Esta cuenta no tiene una invitación válida de ARCANUM."],["MAGE_NOT_ALIVE","Este Arconte ya no está vivo."],
    ["TARGET_NOT_FOUND","No se ha encontrado al Arconte objetivo."],["TARGET_NOT_ALIVE","Ese Arconte ya ha caído."],
    ["UNRESOLVED_TERRITORY_DAMAGE","Tu dominio tiene daño territorial pendiente de resolver."],["INVALID_BUILD_PLAN","El plan de construcción no es válido."],
    ["UNIT_UNDISBANDABLE","Esta unidad no puede ser disuelta."],["SPELL_NOT_KNOWN","Aún no conoces ese hechizo."],
    ["NO_ATTRIBUTE_POINTS","No tienes puntos de atributo disponibles."],["ATTRIBUTE_AT_CAP","Ese atributo ya ha alcanzado el máximo de esta beta."],["INVALID_ATTRIBUTE","Ese atributo no es válido."],
    ["REALM_NOT_FOUND","Aún no has fundado un dominio."],["ARENA_NO_SEALS","Has gastado los 6 Sellos de Arena de hoy."],["ARENA_BUSY","Ya hay un combate de Arena resolviéndose. Inténtalo de nuevo en un instante."],["CANNOT_FIGHT_SELF","No puedes combatir contra tu propio Arconte."],["EVOLUTION_LEVEL_LOCKED","Ese nivel todavía no está disponible."],["EVOLUTION_ALREADY_CHOSEN","Ese destino ya fue elegido."],["EVOLUTION_ORDER_REQUIRED","Debes resolver primero la evolución pendiente anterior."],["EVOLUTION_OPTION_INVALID","La opción de evolución ya no es válida."],["INVENTORY_FULL","Tu inventario está lleno."],["ITEM_NOT_FOUND","Ese objeto ya no existe."],["INVALID_EQUIP_SLOT","Ese objeto no puede equiparse en ese hueco."],["PVE_EXPEDITION_NOT_FOUND","Esa expedición no existe."],["PVE_DIFFICULTY_LOCKED","Tu Archimago todavía no puede entrar en esa dificultad."],["PVE_RUN_REQUIRED","No tienes una expedición activa."],["PVE_RUN_FINISHED","Esta expedición ya ha terminado."],["PVE_FIGHT_IN_PROGRESS","Ya hay un encuentro resolviéndose. Espera un instante."],["PVE_DECISION_REQUIRED","Debes elegir cómo continuar antes de entrar en la siguiente cámara."],["PVE_DECISION_NOT_AVAILABLE","Ahora mismo no hay ninguna decisión pendiente."],["PVE_DECISION_INVALID","Esa opción ya no es válida para esta expedición."],["PVE_DECISION_ALREADY_TAKEN","La decisión ya ha sido resuelta."],["DOMAIN_NAME_TAKEN","Ese nombre de Dominio ya pertenece a otro jugador."],["INVALID_DOMAIN_NAME","El nombre del Dominio debe tener entre 3 y 32 caracteres y usar letras, números, espacios, apóstrofes, puntos o guiones."],["DOMAIN_NAME_UNAVAILABLE","No se pudo reservar un nombre inicial para tu Dominio."]
  ];
  for(const [k,v] of map) if(m.includes(k)) return v;
  if(m.includes("duplicate key") || m.includes("unique")) return "Ese nombre ya está ocupado.";
  if(m.includes("Invalid login credentials")) return "Usuario o contraseña incorrectos.";
  if(m.includes("JWT") || m.includes("token")) return "Tu sesión ha caducado. Vuelve a entrar.";
  return m.replace(/^.*?message[:=]\s*/i,"").slice(0,260);
}


/* School-name chroma: keeps every visible school name aligned with its representative color. */
const SCHOOL_TEXT_CLASSES = {
  Viridia: "school-name school-name--viridia",
  Aurea: "school-name school-name--aurea",
  Cineria: "school-name school-name--cineria",
  Nadir: "school-name school-name--nadir",
  Oneiria: "school-name school-name--oneiria"
};
let schoolNameDecorateQueued = false;
function decorateSchoolNames(root=document){
  const scope = root?.nodeType === 1 || root?.nodeType === 9 ? root : document;
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  const pending = [];
  let node;
  while((node = walker.nextNode())){
    const parent = node.parentElement;
    if(!parent || parent.closest("script,style,textarea,input,select,option,.school-name,[contenteditable='true']")) continue;
    if(!/\b(?:Viridia|Aurea|Cineria|Nadir|Oneiria)\b/.test(node.nodeValue || "")) continue;
    pending.push(node);
  }
  for(const textNode of pending){
    const text = textNode.nodeValue || "";
    const frag = document.createDocumentFragment();
    let last = 0;
    text.replace(/\b(Viridia|Aurea|Cineria|Nadir|Oneiria)\b/g,(match,name,offset)=>{
      if(offset > last) frag.append(document.createTextNode(text.slice(last,offset)));
      const span = document.createElement("span");
      span.className = SCHOOL_TEXT_CLASSES[name];
      span.textContent = match;
      frag.append(span);
      last = offset + match.length;
      return match;
    });
    if(last < text.length) frag.append(document.createTextNode(text.slice(last)));
    textNode.replaceWith(frag);
  }
}
function queueSchoolNameDecoration(){
  if(schoolNameDecorateQueued) return;
  schoolNameDecorateQueued = true;
  requestAnimationFrame(()=>{
    schoolNameDecorateQueued = false;
    decorateSchoolNames(document);
  });
}
if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded",queueSchoolNameDecoration,{once:true});
}else{
  queueSchoolNameDecoration();
}
new MutationObserver(queueSchoolNameDecoration).observe(document.documentElement,{subtree:true,childList:true});
