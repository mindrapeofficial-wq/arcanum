"use strict";

const SUPABASE_URL = "https://mrmvmoyysxuopqexbxfk.supabase.co";
const SUPABASE_KEY = "sb_publishable_tZEPJi2v7Tp-xDuVa0qWRw_geizIGoD";
const SESSION_KEY = "arcanum_session_v2";
const BUILD_VERSION = "0.2.71";
const VERSION_CHECK_INTERVAL_MS = 60000;
const COMMUNITY_API = "https://smynvbrkgffpepbhrpxt.supabase.co/functions/v1/arcanum-community";
const ORACLE_API = "https://smynvbrkgffpepbhrpxt.supabase.co/functions/v1/arcanum-oracle";
const BOSS_API = "https://smynvbrkgffpepbhrpxt.supabase.co/functions/v1/arcanum-boss";
const STATE_API = "https://smynvbrkgffpepbhrpxt.supabase.co/functions/v1/arcanum-state";
const COMMUNITY_POLL_MS = 2500;


const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const fmt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });
const symbols = { ascendant:"✦", verdant:"♧", eradication:"✹", abyssal:"◆", phantasm:"◌", plain:"⚔" };
const rankNames = { simple:"Simple", average:"Medio", complex:"Complejo", ultimate:"Supremo", ancient:"Antiguo" };
const buildMeta = {
  farms:["Granjas","Alimentos + población","5"], towns:["Pueblos","Población + oro","30"], nodes:["Nodos","Producción y capacidad de maná","30"],
  workshops:["Talleres","Aceleran la construcción futura","10"], guilds:["Gremios","Generan investigación","20"], barracks:["Cuarteles","Permiten reclutar tropas","5"],
  fortresses:["Fortalezas","Defensa y supervivencia del Archimago","300"], barriers:["Barreras","Defensa arcana · 1 por turno","1 turno"]
};

let mode = "login";
let selectedSchool = null;
let realmState = null;
let catalogs = { schools:[], spells:[], units:[], summons:[] };
let currentView = "realm";
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

function humanError(error){
  const m=String(error?.message || error || "Error desconocido");
  const map=[
    ["BUYER_NOT_ENOUGH_GOLD","No tienes oro suficiente para aceptar este contrato."],["BUYER_NOT_ENOUGH_MANA","No tienes maná suficiente para aceptar este contrato."],["BUYER_NOT_ENOUGH_POPULATION","No tienes población suficiente para aceptar este contrato."],
    ["SELLER_NOT_ENOUGH_GOLD","El vendedor ya no dispone del oro comprometido."],["SELLER_NOT_ENOUGH_MANA","El vendedor ya no dispone del maná comprometido."],["SELLER_NOT_ENOUGH_POPULATION","El vendedor ya no dispone de la población comprometida."],
    ["MARKET_OFFER_EXPIRED","Este contrato ya ha caducado."],["MARKET_OFFER_NOT_OPEN","Este contrato ya no está disponible."],["MARKET_OFFER_NOT_FOUND","No se ha encontrado este contrato."],
    ["CANNOT_ACCEPT_OWN_OFFER","No puedes aceptar tu propio contrato."],["MARKET_SEASON_MISMATCH","El contrato pertenece a otra temporada."],["MARKET_SELLER_NOT_ALIVE","El reino vendedor ya no puede comerciar."],
    ["MARKET_OFFER_LIMIT","Ya tienes 8 contratos activos."],["MARKET_OPERATION_FAILED","No se pudo completar la operación del mercado."],
    ["NOT_ENOUGH_TURNS","No tienes turnos suficientes."],["NOT_ENOUGH_WILDERNESS","No tienes terreno salvaje suficiente."],
    ["NOT_ENOUGH_GOLD","No tienes oro suficiente."],["NOT_ENOUGH_MANA","No tienes maná suficiente."],["NOT_ENOUGH_POPULATION","No tienes población suficiente."],
    ["NO_RESEARCH_PRODUCTION","Necesitas al menos un Gremio para investigar."],["SPELL_NOT_RESEARCHABLE","Ese hechizo no puede investigarse con tu Escuela."],
    ["RESEARCH_QUEUE_MUST_START_WITH_CURRENT","Debes terminar primero la investigación actual."],["NO_BARRACKS","Necesitas Cuarteles para reclutar."],
    ["ATTACKER_HAS_NO_ARMY","Necesitas un ejército antes de atacar."],["TARGET_HAS_NO_ARMY","Ese objetivo no tiene ejército disponible para esta beta."],
    ["NOT_ENOUGH_RESOURCES_FOR_WAR_EXPENSE","No puedes pagar el gasto de guerra de tu ejército."],["BARRIERS_REQUIRE_EXCLUSIVE_BUILD","Las Barreras deben construirse en una orden separada."],
    ["BUILD_BATCH_TOO_LARGE","Ese lote de construcción requiere más de 50 turnos. Reduce la cantidad."],["REALM_ALREADY_EXISTS","Ya tienes un reino en esta temporada."],
    ["INVITE_REQUIRED","Esta cuenta no tiene una invitación válida de ARCANUM."],["MAGE_NOT_ALIVE","Este Archimago ya no está vivo."],
    ["TARGET_NOT_FOUND","No se ha encontrado al Archimago objetivo."],["TARGET_NOT_ALIVE","Ese Archimago ya ha caído."],
    ["UNRESOLVED_TERRITORY_DAMAGE","Tu reino tiene daño territorial pendiente de resolver."],["INVALID_BUILD_PLAN","El plan de construcción no es válido."],
    ["UNIT_UNDISBANDABLE","Esta unidad no puede ser disuelta."],["SPELL_NOT_KNOWN","Aún no conoces ese hechizo."],
    ["NO_ATTRIBUTE_POINTS","No tienes puntos de atributo disponibles."],["ATTRIBUTE_AT_CAP","Ese atributo ya ha alcanzado el máximo de esta beta."],["INVALID_ATTRIBUTE","Ese atributo no es válido."],
    ["REALM_NOT_FOUND","Aún no has fundado un reino."],["ARENA_NO_SEALS","Has gastado los 6 Sellos de Arena de hoy."],["CANNOT_FIGHT_SELF","No puedes combatir contra tu propio Archimago."],["EVOLUTION_LEVEL_LOCKED","Ese nivel todavía no está disponible."],["EVOLUTION_ALREADY_CHOSEN","Ese destino ya fue elegido."],["EVOLUTION_ORDER_REQUIRED","Debes resolver primero la evolución pendiente anterior."],["EVOLUTION_OPTION_INVALID","La opción de evolución ya no es válida."]
  ];
  for(const [k,v] of map) if(m.includes(k)) return v;
  if(m.includes("duplicate key") || m.includes("unique")) return "Ese nombre ya está ocupado.";
  if(m.includes("Invalid login credentials")) return "Usuario o contraseña incorrectos.";
  if(m.includes("JWT") || m.includes("token")) return "Tu sesión ha caducado. Vuelve a entrar.";
  return m.replace(/^.*?message[:=]\s*/i,"").slice(0,260);
}
