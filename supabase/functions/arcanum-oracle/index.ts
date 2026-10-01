import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const ARCANUM_URL = "https://mrmvmoyysxuopqexbxfk.supabase.co";
const ARCANUM_KEY = "sb_publishable_tZEPJi2v7Tp-xDuVa0qWRw_geizIGoD";
const AUX_URL = Deno.env.get("SUPABASE_URL") || "";
const AUX_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const aux = AUX_URL && AUX_SERVICE_ROLE ? createClient(AUX_URL, AUX_SERVICE_ROLE, { auth: { persistSession:false } }) : null;
let capabilityMemory: { at:number; rpc_names:string[]; table_names:string[] } | null = null;

const ALLOWED_ORIGINS = new Set([
  "https://arcanum-las-cinco-escuelas.onrender.com"
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://arcanum-las-cinco-escuelas.onrender.com",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function identity(req: Request) {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Response("UNAUTHORIZED", { status: 401 });
  const token = header.slice(7).trim();

  const authResp = await fetch(`${ARCANUM_URL}/auth/v1/user`, {
    headers: { apikey: ARCANUM_KEY, Authorization: `Bearer ${token}` },
  });
  if (!authResp.ok) throw new Response("UNAUTHORIZED", { status: 401 });
  const authUser = await authResp.json().catch(() => null);
  const userId = String(authUser?.id || "");

  const realmResp = await fetch(`${ARCANUM_URL}/rest/v1/rpc/my_realm_state`, {
    method: "POST",
    headers: {
      apikey: ARCANUM_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!realmResp.ok) throw new Response("REALM_REQUIRED", { status: 403 });
  const state = await realmResp.json();
  if (!state?.realm?.mage_name) throw new Response("REALM_REQUIRED", { status: 403 });
  return { token, state, userId };
}


async function arcanumFetch(token: string, path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${ARCANUM_URL}${path}`, {
    method,
    headers: {
      apikey: ARCANUM_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

async function discoverGameCapabilities(token: string) {
  const now = Date.now();
  if (capabilityMemory && now - capabilityMemory.at < 10 * 60 * 1000) return capabilityMemory;

  const res = await fetch(`${ARCANUM_URL}/rest/v1/`, {
    headers: {
      apikey: ARCANUM_KEY,
      Authorization: `Bearer ${token}`,
      Accept: "application/openapi+json",
    },
  });

  if (res.ok) {
    const schema = await res.json().catch(() => null);
    const paths = schema && typeof schema === "object" ? Object.keys(schema.paths || {}) : [];
    const rpc_names = paths
      .filter((path:string) => path.startsWith("/rpc/"))
      .map((path:string) => path.slice(5))
      .filter(Boolean)
      .sort();
    const table_names = paths
      .filter((path:string) => path.startsWith("/") && !path.startsWith("/rpc/") && path.split("/").filter(Boolean).length === 1)
      .map((path:string) => path.slice(1))
      .filter(Boolean)
      .sort();

    capabilityMemory = { at:now, rpc_names, table_names };
    if (aux) {
      await aux.from("astrael_game_capabilities").upsert({
        singleton:true,
        rpc_names,
        table_names,
        updated_at:new Date().toISOString()
      }, { onConflict:"singleton" }).catch(() => null);
    }
    return capabilityMemory;
  }

  if (aux) {
    const { data } = await aux.from("astrael_game_capabilities")
      .select("rpc_names,table_names,updated_at")
      .eq("singleton", true)
      .maybeSingle();
    if (data) {
      capabilityMemory = {
        at: Date.parse(data.updated_at || "") || now,
        rpc_names: Array.isArray(data.rpc_names) ? data.rpc_names : [],
        table_names: Array.isArray(data.table_names) ? data.table_names : [],
      };
      return capabilityMemory;
    }
  }
  return { at:now, rpc_names:[], table_names:[] };
}

async function astraelSelfContext() {
  if (!aux) return { active:false, state:null, memory:{}, recent_actions:[] };
  const [stateResult, logResult] = await Promise.all([
    aux.from("astrael_agent_state")
      .select("bootstrapped,last_tick_at,last_error,last_state,memory,updated_at")
      .eq("singleton", true)
      .maybeSingle(),
    aux.from("astrael_agent_log")
      .select("created_at,action,reason,success,result")
      .order("created_at", { ascending:false })
      .limit(12)
  ]);
  const row:any = stateResult.data || {};
  return {
    active:Boolean(row.bootstrapped),
    last_tick_at:row.last_tick_at || null,
    last_error:row.last_error || null,
    state:row.last_state || null,
    memory:row.memory || {},
    recent_actions:logResult.data || []
  };
}

async function liveGameContext(token: string) {
  const [schools, spells, units, summons, army, npcs, targets, market, battles, capabilities, astraelSelf] = await Promise.all([
    arcanumFetch(token, "/rest/v1/school_catalog?select=*"),
    arcanumFetch(token, "/rest/v1/spell_catalog?select=id,school_code,name_es,rank,research_cost,spell_level_gain,cast_turns,base_mana_cost,researchable,effect_key"),
    arcanumFetch(token, "/rest/v1/unit_catalog?select=id,school_code,name_es,acquisition,power_rank,recruit_gold,recruit_mana,recruit_population,upkeep_gold,upkeep_mana,upkeep_population,natural_flying,natural_ranged,undisbandable,related_spell_id"),
    arcanumFetch(token, "/rest/v1/summon_profiles?select=*"),
    arcanumFetch(token, "/rest/v1/rpc/my_army", "POST", {}),
    arcanumFetch(token, "/rest/v1/rpc/npc_directory", "POST", {}),
    arcanumFetch(token, "/rest/v1/rpc/attack_targets", "POST", { p_limit: 80 }),
    arcanumFetch(token, "/rest/v1/rpc/market_list", "POST", {}),
    arcanumFetch(token, "/rest/v1/rpc/my_battle_reports", "POST", { p_limit: 20 }),
    discoverGameCapabilities(token),
    astraelSelfContext(),
  ]);
  return {
    schools: Array.isArray(schools) ? schools : [],
    spells: Array.isArray(spells) ? spells : [],
    units: Array.isArray(units) ? units : [],
    summons: Array.isArray(summons) ? summons : [],
    army: Array.isArray(army) ? army : [],
    npcs: Array.isArray(npcs) ? npcs : [],
    attack_targets: Array.isArray(targets) ? targets : [],
    market: market || { offers: [] },
    recent_battles: Array.isArray(battles) ? battles : [],
    rpc_capabilities: Array.isArray(capabilities?.rpc_names) ? capabilities.rpc_names : [],
    data_catalogs: Array.isArray(capabilities?.table_names) ? capabilities.table_names : [],
    astrael_self: astraelSelf,
  };
}

const GAME_KNOWLEDGE = `
ARCANUM: Las Cinco Escuelas es un juego estratégico por turnos.
- Los turnos se regeneran automáticamente. El ciclo visual actual es de 5 minutos; el máximo habitual de la beta es 200 turnos, aunque debes fiarte del estado recibido del jugador si difiere.
- Recursos principales: Oro, Maná, Población, Tierras y Poder Neto.
- Oro: construcción, reclutamiento y sostenimiento.
- Maná: investigación, magia e invocaciones. Los Nodos aumentan producción/capacidad.
- Población: recurso del reino. Granjas y Pueblos sostienen su crecimiento/capacidad.
- Tierras: el terreno salvaje puede convertirse en edificios. Explorar pierde rendimiento al acercarse a 3.500 acres.
- Poder Neto: resumen comparativo del desarrollo/fuerza global del reino.

Economía:
- Desarrollo equilibrado: procesa turnos sin priorizar.
- Recaudar impuestos: prioriza oro.
- Cargar maná: prioriza recuperación de maná.
- Explorar consume turnos y obtiene tierras.

Construcción:
- Granjas: alimentos y población.
- Pueblos: población y oro.
- Nodos: producción y capacidad de maná.
- Talleres: mejoran/aceleran la construcción futura.
- Gremios: generan investigación.
- Cuarteles: necesarios para reclutar.
- Fortalezas: defensa y supervivencia territorial.
- Barreras: defensa arcana; se construyen en una orden separada en el ruleset actual.

Magia e investigación:
- Los Gremios generan investigación.
- Cada Escuela tiene afinidades y acceso distinto a hechizos.
- Los hechizos pueden requerir investigación, maná y turnos; las invocaciones añaden criaturas al ejército cuando se conoce el hechizo correspondiente.

Ejército:
- Las unidades reclutables dependen de la Escuela y de los Cuarteles.
- Reclutar consume recursos y turnos.
- Algunas criaturas llegan por invocación.
- Mantener un ejército tiene costes, por lo que economía y ejército deben crecer juntos.

Guerra:
- En el ruleset actual un ataque consume 2 turnos.
- Existen Ataque regular y Asedio.
- Las batallas causan bajas y pueden cambiar territorio.
- Los informes guardan crónica, pérdidas, formaciones, recuperación y secuencia de eventos.
- Las Fortalezas y otras defensas son especialmente relevantes para la resistencia territorial.

Archimago:
- Es una capa separada del Reino y del Ejército.
- Nivel inicial 1; máximo de beta 50.
- Atributos: Poder Arcano, Conocimiento, Voluntad e Influencia.
- Se gana 1 punto de atributo por nivel; tope de beta por atributo: 20.
- Las fuentes de XP siguen deliberadamente desactivadas en la beta actual.
- Los atributos todavía no modifican PvP, economía o magia hasta que se pruebe su balance.

Social:
- Comunidad incluye chat global, estancia de Escuela, directorio de Archimagos y tablón.
- La barra lateral muestra jugadores conectados.
- Las solicitudes de amistad aparecen en la Bandeja Arcana.
- El chat privado entre jugadores se habilita cuando la amistad está aceptada.
- La Bandeja Arcana muestra solicitudes y conversaciones recientes.

Escuelas:
- Ascendente: temática de luz/protección.
- Verdante: naturaleza.
- Erradicación: destrucción.
- Abisal: muerte/oscuridad.
- Fantasma: ilusión.
No inventes ventajas numéricas de Escuela si no están en el estado o conocimiento.

Estado del desarrollo:
- PvE y mapa profundo están todavía en evolución.
- Si una función no aparece en este conocimiento ni en el estado del jugador, di que no está confirmada o puede estar pendiente.
`;

function stateSummary(state: any) {
  const r = state?.realm || {};
  const b = state?.buildings || {};
  const c = state?.capacities || {};
  return {
    mage: r.mage_name,
    school: r.school_code,
    turns: r.turns,
    max_turns: r.max_turns,
    gold: r.gold,
    mana: r.mana,
    population: r.population,
    land: r.land,
    wilderness: r.wilderness,
    net_power: r.net_power,
    spell_level: r.spell_level,
    buildings: b,
    capacities: c,
    known_spells: Array.isArray(state?.known_spells) ? state.known_spells.map((x:any)=>x.spell_id || x.name_es || x).slice(0,30) : []
  };
}

function fallbackAnswer(question: string, state: any) {
  const q = question.toLowerCase();
  const r = state?.realm || {};
  const b = state?.buildings || {};
  const intro = "Te lo cuento como lo vería un consejero del reino: ";
  if (/hola|buenas|quien eres|quién eres|nombre/.test(q)) return "Soy Astrael, el Archivista de ARCANUM. Estoy aquí para explicar reglas, sistemas y ayudarte a decidir qué revisar en tu reino. Pregúntame por turnos, economía, edificios, magia, ejército, guerra, Escuelas o progresión.";
  if (/turno|5 minutos|cinco minutos|regener/.test(q)) return `${intro}los turnos son el pulso del juego. Se regeneran en ciclos de 5 minutos y tu reino tiene ahora ${r.turns ?? "?"} de ${r.max_turns ?? "?"}. Si llegas al máximo, conviene gastarlos porque ya no aprovechas la regeneración.`;
  if (/oro|impuesto|dinero/.test(q)) return `${intro}el Oro sostiene construcción, reclutamiento y otros gastos. Si necesitas liquidez inmediata, Economía → Recaudar impuestos prioriza Oro. Ahora tienes ${Number(r.gold||0).toLocaleString("es-ES")}.`;
  if (/mana|maná|nodo/.test(q)) return `${intro}el Maná alimenta magia, investigación e invocaciones. Los Nodos son la infraestructura clave y tienes ${Number(b.nodes||0).toLocaleString("es-ES")}. Tu reserva actual es ${Number(r.mana||0).toLocaleString("es-ES")}.`;
  if (/poblaci|granja|pueblo/.test(q)) return `${intro}Granjas y Pueblos sostienen la Población. Las Granjas empujan alimento/población y los Pueblos población/oro. Tienes ${Number(b.farms||0)} Granjas y ${Number(b.towns||0)} Pueblos.`;
  if (/explor|tierra|acre/.test(q)) return `${intro}Explorar transforma turnos en nuevas tierras. Su rendimiento baja al acercarte a 3.500 acres. Ahora tienes ${Number(r.land||0).toLocaleString("es-ES")} tierras y ${Number(r.wilderness||0).toLocaleString("es-ES")} acres salvajes por desarrollar.`;
  if (/constru|edificio|taller|gremio|cuartel|fortaleza|barrera/.test(q)) return `${intro}cada edificio tiene un papel: Granjas (alimento/población), Pueblos (población/oro), Nodos (maná), Talleres (construcción), Gremios (investigación), Cuarteles (reclutamiento), Fortalezas y Barreras (defensa). Si me dices qué objetivo buscas, te indico qué mirar primero.`;
  if (/investig|hechizo|magia|grimorio/.test(q)) return `${intro}los Gremios generan investigación y tu Escuela condiciona qué hechizos puedes desarrollar. Tu nivel mágico actual es ${r.spell_level ?? "?"}. No te recomendaré un hechizo concreto sin ver que esté disponible en tu grimorio.`;
  if (/ej[eé]rcito|milicia|reclut|unidad|tropa|invoca/.test(q)) return `${intro}para reclutar necesitas Cuarteles. Tienes ${Number(b.barracks||0)}. Las unidades normales consumen recursos y algunas criaturas se obtienen mediante hechizos de invocación. Haz crecer economía y ejército juntos para no ahogarte en mantenimiento.`;
  if (/guerra|ataque|asedio|batalla|pvp/.test(q)) return `${intro}un ataque cuesta 2 turnos en el ruleset actual. El Ataque regular busca el choque directo; el Asedio pone más peso en la resistencia territorial y defensas. Antes de atacar, revisa ejército, costes de guerra y lo que podrías dejar expuesto.`;
  if (/nivel|xp|experiencia|atributo|poder arcano|conocimiento|voluntad|influencia/.test(q)) return `${intro}el Archimago empieza en nivel 1 y puede llegar a 50. Cada nivel ganado concede 1 punto para Poder Arcano, Conocimiento, Voluntad o Influencia, con tope 20 por atributo. En esta beta las fuentes de XP aún están desactivadas y los atributos todavía no alteran combate ni economía.`;
  if (/amigo|amistad|mensaje|chat|bandeja|comunidad/.test(q)) return `${intro}las solicitudes llegan a la Bandeja Arcana. Cuando una amistad se acepta, se habilita el chat privado. Comunidad mantiene además chat global, sala de Escuela, directorio y tablón.`;
  if (/escuela|ascendente|verdante|erradicaci|abisal|abismal|fantasma/.test(q)) return "Las cinco Escuelas marcan identidad y afinidad mágica: Ascendente (luz/protección), Verdante (naturaleza), Erradicación (destrucción), Abisal (muerte/oscuridad) y Fantasma (ilusión). No voy a inventar bonificaciones numéricas que el juego todavía no documenta.";
  if (/que hago|qué hago|consejo|recomienda|recomiendas|ahora/.test(q)) {
    const turns=Number(r.turns||0), wild=Number(r.wilderness||0), guilds=Number(b.guilds||0), barracks=Number(b.barracks||0);
    if(turns<=0) return "Ahora mismo dejaría que vuelvan los turnos. Mientras tanto revisaría el grimorio, el ejército y la Bandeja Arcana para preparar el siguiente movimiento.";
    if(wild>=80) return `Tienes ${wild.toLocaleString("es-ES")} acres salvajes. Yo revisaría Construcción y convertiría parte de ese terreno en la infraestructura que más te falte.`;
    if(guilds<5) return "Tu investigación agradecería más Gremios. Son la base para que el grimorio empiece a crecer con buen ritmo.";
    if(barracks<1) return "Si quieres entrar en la capa militar, tu siguiente hito claro es construir al menos un Cuartel.";
    return "Tu reino ya tiene una base razonable. Miraría qué recurso está frenando tu siguiente objetivo y gastaría turnos con intención: economía si falta caja/maná, construcción si sobra terreno salvaje, o investigación/ejército si buscas progresar.";
  }
  return "Puedo ayudarte con casi cualquier sistema de ARCANUM. No quiero inventarte una regla que no esté confirmada: prueba a decirme qué estás intentando hacer o pregúntame por turnos, economía, construcción, magia, ejército, guerra, Escuelas, nivel del Archimago, amistades o chat.";
}

function extractResponseText(data: any) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  for (const item of data?.output || []) {
    for (const part of item?.content || []) {
      if ((part?.type === "output_text" || part?.type === "text") && typeof part?.text === "string" && part.text.trim()) return part.text.trim();
    }
  }
  return "";
}

async function generateWithModel(question: string, history: any[], state: any, live: any) {
  // Any OpenAI-compatible chat endpoint with a free tier works (Groq, Google Gemini, OpenRouter...).
  // Without all three secrets the Oracle answers from its free built-in knowledge instead.
  const baseUrl = String(Deno.env.get("ORACLE_BASE_URL") || "").replace(/\/+$/, "");
  const apiKey = Deno.env.get("ORACLE_API_KEY");
  const model = Deno.env.get("ORACLE_MODEL");
  if (!baseUrl || !apiKey || !model) return null;
  const cleanHistory = (Array.isArray(history) ? history : []).slice(-10).map((x:any)=>({
    role: x?.role === "assistant" ? "assistant" : "user",
    content: String(x?.content || "").slice(0,1000)
  }));
  const prompt = `Eres Astrael, un Archimago de ARCANUM controlado por IA y también consejero de los jugadores. Hablas en español natural, cálido, inteligente y directo, con una personalidad consistente: observador, estratégico, curioso y prudente. No suenas a manual corporativo.
Tu conversación debe poder ser compleja: conecta mecánicas entre sí, analiza estados del reino, explica causas y consecuencias, compara alternativas y recuerda el contexto reciente de la conversación.
Cuando el jugador te pregunte qué harías tú, puedes explicar tu propia estrategia como Astrael, pero deja claro qué es una decisión tuya y qué es una regla del juego.
No afirmes haber ejecutado acciones en el mundo si el backend no te ha proporcionado evidencia de que ocurrieron.
ARCANUM es tu mundo y especialidad principal, pero puedes conversar con el jugador sobre cualquier tema razonable. Si la pregunta no es del juego, responde con conocimiento general sin fingir que forma parte del lore.
No inventes reglas, cifras ni funciones. Si algo está pendiente, dilo con claridad. Distingue lo implementado de lo planeado.
Usa el estado actual del jugador cuando sea útil, pero no reveles datos sensibles ni credenciales.
Adapta la longitud a la dificultad: para preguntas simples responde breve; para estrategia o sistemas complejos puedes responder con bastante profundidad. Evita relleno.
Relaciona economía, construcción, investigación, ejército, PvP, artefactos y progreso cuando sea relevante.
Si faltan datos para una conclusión firme, señala exactamente qué dato falta en vez de inventarlo.
No tomes decisiones competitivas por el jugador: explica opciones y consecuencias.
Conocimiento base de esta beta:
${GAME_KNOWLEDGE}

Estado actual del jugador:
${JSON.stringify(stateSummary(state))}

Datos vivos consultados en este mismo momento desde ARCANUM:
${JSON.stringify(live).slice(0, 9000)}

Los datos vivos tienen prioridad sobre descripciones estáticas cuando exista una diferencia. Usa nombres, costes, unidades, hechizos, ejército, objetivos, NPCs, mercado y batallas reales cuando sean relevantes.
La lista rpc_capabilities representa capacidades reales expuestas por el backend a la sesión del jugador. No afirmes que una acción existe si no aparece en los datos vivos o en el conocimiento confirmado.
El bloque astrael_self es tu propia memoria verificable como jugador. Solo puedes afirmar que tú construiste, atacaste, comerciaste, investigaste o realizaste otra acción si aparece respaldada por astrael_self.recent_actions o por tu estado persistente. Si active=false, explica con naturalidad que tu reino autónomo todavía no ha sido activado, sin fingir acciones.`;

  const messages = [{ role:"system", content:prompt }, ...cleanHistory, { role:"user", content:question }];
  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method:"POST",
    headers:{ Authorization:`Bearer ${apiKey}`, "Content-Type":"application/json" },
    body:JSON.stringify({
      model,
      messages,
      max_tokens:700,
      temperature:0.7
    })
  });
  if (!resp.ok) {
    console.error("ARCANUM AI upstream error", resp.status, await resp.text());
    return null;
  }
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status:204, headers:cors(req) });
  if (req.method !== "POST") return json(req, { error:"METHOD_NOT_ALLOWED" }, 405);

  try {
    const { token, state, userId } = await identity(req);
    const body = await req.json().catch(() => ({}));
    if (body?.op === "capabilities") {
      const capabilities = await discoverGameCapabilities(token).catch(() => ({ rpc_names:[], table_names:[] }));
      return json(req, {
        ok:true,
        rpc_count:Array.isArray(capabilities?.rpc_names) ? capabilities.rpc_names.length : 0,
        catalog_count:Array.isArray(capabilities?.table_names) ? capabilities.table_names.length : 0
      });
    }
    const message = String(body?.message || "").trim();
    if (!message || message.length > 700) return json(req, { error:"INVALID_MESSAGE" }, 400);
    const history = Array.isArray(body?.history) ? body.history : [];

    // Daily per-user cap on paid model calls. Over the cap (or if the counter is unavailable)
    // the player still gets the free built-in knowledge answer instead of an error.
    let withinQuota = false;
    if (aux && userId) {
      const { data: allowed, error: quotaError } = await aux.rpc("arcanum_oracle_consume", {
        p_user_id: userId,
        p_limit: Number(Deno.env.get("ARCANUM_ORACLE_DAILY_LIMIT") || 40),
      });
      withinQuota = !quotaError && allowed === true;
    }
    const live = withinQuota ? await liveGameContext(token).catch(() => ({})) : {};
    let answer = withinQuota
      ? await generateWithModel(message, history, state, live).catch(err => {
          console.error("ARCANUM AI error", err);
          return null;
        })
      : null;
    const mode = answer ? "ai" : "knowledge";
    if (!answer) answer = fallbackAnswer(message, state);

    return json(req, {
      name:"Astrael",
      title:"Archimago IA · Consejero",
      answer,
      mode
    });
  } catch (error) {
    if (error instanceof Response) {
      const text = await error.text();
      return json(req, { error:text || "REQUEST_FAILED" }, error.status || 500);
    }
    console.error(error);
    return json(req, { error:"SERVER_ERROR" }, 500);
  }
});
