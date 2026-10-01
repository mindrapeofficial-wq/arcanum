"use strict";

function manualNextStep(){
  const r=realmState?.realm||{}, b=realmState?.buildings||{};
  const turns=Number(r.turns||0), wilderness=Number(r.wilderness||0), barracks=Number(b.barracks||0), guilds=Number(b.guilds||0);
  if(turns<=0) return {title:"Deja que el tiempo trabaje",text:"No tienes turnos disponibles. Cuando se regenere el siguiente, podrás volver a expandirte, producir o investigar."};
  if(wilderness>=80) return {title:"Convierte terreno salvaje en poder",text:`Tienes ${n(wilderness)} acres sin construir. Invierte parte en Pueblos, Granjas, Nodos y los edificios que necesite tu estrategia.`};
  if(guilds<5) return {title:"Refuerza tu conocimiento arcano",text:"Construye algunos Gremios. Son la base para generar conocimiento arcano y ampliar tu grimorio."};
  if(barracks<1) return {title:"Prepara un ejército",text:"Aún no tienes Cuarteles. Construye al menos uno para comenzar a reclutar unidades."};
  if(turns>=20 && Number(r.land||0)<3500) return {title:"Explora nuevas tierras",text:`Tienes ${n(turns)} turnos disponibles. Explorar puede darte nuevos acres para seguir desarrollando el dominio.`};
  return {title:"Equilibra crecimiento y defensa",text:"Revisa Economía, Conocimiento Arcano y Ejército. Intenta no acumular recursos sin convertirlos en crecimiento, magia o capacidad militar."};
}
function openManual(){
  const tip=manualNextStep();
  $("#modal-content").innerHTML=`
    <span class="section-kicker">GRIMORIO DEL APRENDIZ</span>
    <h3>Manual básico de ARCANUM</h3>
    <p class="manual-intro">Una guía rápida para entender el dominio sin tener que estudiar un tomo de ochocientas páginas antes de tu primer turno.</p>
    <div class="manual-now"><small>¿QUÉ HAGO AHORA?</small><strong>${esc(tip.title)}</strong><p>${esc(tip.text)}</p></div>
    <div class="manual-grid">
      <details class="manual-section" open><summary>Objetivo y Ascendencia</summary><p>Haz crecer tu dominio, desarrolla tu Escuela, forma un ejército y compite con otros Arcontes. El <b>Ascendencia</b> resume la fuerza global de tu dominio y sirve para compararte en la clasificación.</p></details>
      <details class="manual-section"><summary>Turnos</summary><p>Los turnos son el motor del juego. Se regeneran automáticamente y se gastan al explorar, producir, construir, investigar, reclutar y realizar otras acciones.</p></details>
      <details class="manual-section"><summary>Economía y recursos</summary><ul><li><b>Turnos:</b> presupuesto de acciones; se regeneran con el tiempo.</li><li><b>Oro:</b> reserva líquida para comercio, reclutamiento y costes económicos o militares.</li><li><b>Maná:</b> reserva arcana limitada por tus Nodos.</li><li><b>Población:</b> habitantes disponibles; su techo es el menor entre vivienda y alimento.</li><li><b>Alimento:</b> capacidad de sustento, no una moneda almacenada.</li><li><b>Investigación:</b> RP producidos por cada turno que dedicas a investigar; no se acumulan pasivamente.</li><li><b>Tierras:</b> espacio físico; la tierra salvaje sólo adquiere función al construir.</li><li><b>Ascendencia:</b> indicador derivado de fuerza global, no recurso gastable.</li></ul></details>
      <details class="manual-section"><summary>Exploración</summary><p>Convierte turnos en nuevas tierras. El rendimiento disminuye conforme tu dominio se aproxima a <b>3.500 acres</b>, por lo que más adelante la expansión dependerá cada vez más de otras vías.</p></details>
      <details class="manual-section"><summary>Construcción</summary><p>Convierte terreno salvaje en infraestructura.</p><ul><li><b>Granjas:</b> elevan la capacidad de sustento.</li><li><b>Pueblos:</b> elevan la capacidad residencial y apoyan la economía de Oro.</li><li><b>Nodos:</b> sostienen la capacidad y economía de Maná.</li><li><b>Talleres:</b> reducen el coste efectivo en turnos de futuras obras.</li><li><b>Gremios:</b> generan RP cuando investigas.</li><li><b>Cuarteles:</b> desbloquean reclutamiento.</li><li><b>Fortalezas:</b> supervivencia y defensa estratégica.</li><li><b>Barreras:</b> defensa arcana especializada.</li></ul></details>
      <details class="manual-section"><summary>Magia e Investigación</summary><p>Tu Escuela marca tus afinidades. Los Gremios determinan cuántos RP produce cada turno que dedicas a investigar. Esos RP se aplican directamente al hechizo en curso y no forman una reserva pasiva.</p></details>
      <details class="manual-section"><summary>Ejército</summary><p>Los Cuarteles permiten reclutar unidades. También existen criaturas obtenidas mediante hechizos de invocación. Mantener un ejército cuesta recursos, así que tamaño y economía deben crecer juntos.</p></details>
      <details class="manual-section"><summary>Guerra</summary><p>Los ataques consumen turnos y pueden causar bajas y cambios territoriales. Antes de combatir, asegúrate de poder mantener el gasto de guerra y de no dejar tu dominio indefenso.</p></details>
      <details class="manual-section"><summary>Mercado</summary><p>El Mercado permite publicar contratos de intercambio de <b>oro, maná y población</b>. El Mercado de Reliquias usa trueque directo de artefacto por artefacto y ejecuta ambos cambios en una sola operación.</p></details>\n      <details class="manual-section"><summary>Artefactos</summary><p>Las reliquias pueden aparecer al explorar, caer del Boss mundial, llegar como botín PvP o cambiar de manos mediante trueques. Los <b>Únicos Mundiales</b> sólo tienen un custodio activo y pueden ser capturados excepcionalmente durante un Asedio victorioso.</p></details>
      <details class="manual-section"><summary>Comunidad</summary><p>El <b>Chat global</b> conecta a los Arcontes casi en tiempo real. El <b>Tablón</b> sirve para anuncios de diplomacia, reclutamiento, comercio, guerra y asuntos generales. Puedes borrar tus propios mensajes y anuncios.</p></details>
    </div>
    <div class="manual-steps"><b>Primeros pasos:</b> explora algunas tierras → construye una economía básica → levanta Gremios → investiga magia → crea Cuarteles y ejército → empieza a competir con otros dominios.</div>
    <div class="manual-tutorial-cta"><div><small>TUTORIAL INTERACTIVO</small><strong>Recorre el juego paso a paso</strong><p>ARCANUM cambiará de sección y señalará cada sistema directamente sobre la interfaz.</p></div><button class="primary-action" id="manual-start-tutorial" type="button">✦ INICIAR TUTORIAL</button></div>`;
  $("#manual-start-tutorial")?.addEventListener("click",()=>startTutorial(true));
  show($("#modal"));
}

async function actionCall(btn,fn,successMessage=null,messageFn=null){
  const old=btn?.innerHTML;
  const realmAiContext=typeof realmAiCaptureAction==="function"?realmAiCaptureAction(btn):null;
  if(btn){btn.disabled=true;btn.textContent="PROCESANDO...";}
  try{
    const res=await fn();
    if(typeof realmAiRecordAction==="function"&&realmAiContext)realmAiRecordAction(realmAiContext,res);
    toast(messageFn?messageFn(res):(successMessage||"Acción completada."),"success");
    realmState=await rpc("my_realm_state");
    renderChrome();
    await renderView(currentView);
    return res;
  }
  catch(e){toast(humanError(e),"error"); throw e;}
  finally{if(btn){btn.disabled=false;if(old)btn.innerHTML=old;}}
}

function wireStaticEvents(){
  wireTopPlayerSearch();
  $("#login-tab").addEventListener("click",()=>switchAuthMode("login")); $("#register-tab").addEventListener("click",()=>switchAuthMode("register"));
  $("#auth-form").addEventListener("submit",async e=>{
    e.preventDefault();
    clearNotice($("#auth-notice"));
    const username=$("#username").value.trim(),password=$("#password").value,btn=$("#submit-button");
    const registering=mode==="register";
    if(username.length<3||username.length>24){setNotice($("#auth-notice"),"El nombre de usuario debe tener entre 3 y 24 caracteres.");return;}
    // New accounts need 8+ characters; logging in keeps the old 4+ so existing short passwords still work.
    if(registering&&password.length<8){setNotice($("#auth-notice"),"La contraseña debe tener al menos 8 caracteres.");return;}
    if(password.length<4){setNotice($("#auth-notice"),"La contraseña debe tener al menos 4 caracteres.");return;}
    btn.disabled=true; $("#submit-label").textContent=registering?"CREANDO CUENTA...":"ENTRANDO...";
    try{
      if(registering){
        if(password!==$("#confirm-password").value)throw new Error("Las contraseñas no coinciden.");
        await registerAccount(username,password);
      }
      await signInAccount(username,password);
      if(typeof enforceMaintenance==="function" && await enforceMaintenance()) return;
      await bootGame();
    }catch(err){setNotice($("#auth-notice"),humanError(err));}
    finally{btn.disabled=false;$("#submit-label").textContent=registering?"CREAR CUENTA":"ENTRAR";}
  });
  $("#create-form").addEventListener("submit",async e=>{
    e.preventDefault(); clearNotice($("#create-notice")); const username=String(getSession()?.user?.user_metadata?.username||"").trim(); if(!username){setNotice($("#create-notice"),"No se ha podido recuperar tu nombre de usuario. Vuelve a iniciar sesión.");return;} if(!selectedSchool){setNotice($("#create-notice"),"Elige una de las Cinco Escuelas.");return;} const btn=$("#create-button"); btn.disabled=true;
    try{await rpc("create_archmage",{p_display_name:username,p_mage_name:username,p_school_code:selectedSchool}); toast("Tu dominio ha sido fundado."); realmState=await rpc("my_realm_state"); showGame(); setTimeout(()=>startTutorial(false),450);}
    catch(err){setNotice($("#create-notice"),humanError(err));} finally{btn.disabled=false;}
  });
  $("#creation-logout").addEventListener("click",signOut); $("#logout-button").addEventListener("click",signOut); $("#refresh-button").addEventListener("click",()=>refreshState(false));
  $("#manual-top-button").addEventListener("click",openManual); $("#manual-side-button").addEventListener("click",openManual); $("#tutorial-side-button")?.addEventListener("click",()=>startTutorial(true));
  $("#main-nav").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)navigate(b.dataset.view);}); $("#mobile-nav").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)navigate(b.dataset.view);});
  document.addEventListener("click",e=>{const b=e.target.closest("[data-open-mage-card]");if(b)$("#mage-card-button")?.click();});
  document.addEventListener("click",e=>{const p=e.target.closest("[data-profile]");if(p?.dataset.profile)openPlayerProfile(p.dataset.profile);});
  $("#modal-close").addEventListener("click",()=>hide($("#modal"))); $("#modal").addEventListener("click",e=>{if(e.target.id==="modal")hide($("#modal"));});
}

async function checkForUpdate(){
  try{
    const res=await fetch(`/version.json?ts=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-cache"}});
    if(!res.ok)return false;
    const remote=await res.json();
    const version=String(remote?.version||"").trim();
    if(!version || version===BUILD_VERSION)return false;
    const url=new URL(location.href);
    if(url.searchParams.get("v")===version)return false;
    url.searchParams.set("v",version);
    url.searchParams.set("refresh",Date.now().toString());
    try{toast(`Nueva versión ${version} disponible. Actualizando ARCANUM...`,"success",1200);}catch{}
    setTimeout(()=>location.replace(url.toString()),350);
    return true;
  }catch{return false;}
}

async function init(){
  if(await checkForUpdate())return;
  wireStaticEvents();
  setInterval(checkForUpdate,VERSION_CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkForUpdate();});
  const session=await validSession();
  if(typeof enforceMaintenance==="function" && await enforceMaintenance()) return;
  if(session)await bootGame(); else showAuth();
}
window.addEventListener("DOMContentLoaded",init);
