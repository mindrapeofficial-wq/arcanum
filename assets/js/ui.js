"use strict";

function manualNextStep(){
  const r=realmState?.realm||{}, b=realmState?.buildings||{};
  const turns=Number(r.turns||0), wilderness=Number(r.wilderness||0), barracks=Number(b.barracks||0), guilds=Number(b.guilds||0);
  if(turns<=0) return {title:"Deja que el tiempo trabaje",text:"No tienes turnos disponibles. Cuando se regenere el siguiente, podrás volver a expandirte, producir o investigar."};
  if(wilderness>=80) return {title:"Convierte terreno salvaje en poder",text:`Tienes ${n(wilderness)} acres sin construir. Invierte parte en Pueblos, Granjas, Nodos y los edificios que necesite tu estrategia.`};
  if(guilds<5) return {title:"Refuerza tu investigación",text:"Construye algunos Gremios. Son la base para generar investigación y ampliar tu grimorio."};
  if(barracks<1) return {title:"Prepara un ejército",text:"Aún no tienes Cuarteles. Construye al menos uno para comenzar a reclutar unidades."};
  if(turns>=20 && Number(r.land||0)<3500) return {title:"Explora nuevas tierras",text:`Tienes ${n(turns)} turnos disponibles. Explorar puede darte nuevos acres para seguir desarrollando el reino.`};
  return {title:"Equilibra crecimiento y defensa",text:"Revisa Economía, Investigación y Ejército. Intenta no acumular recursos sin convertirlos en crecimiento, magia o capacidad militar."};
}
function openManual(){
  const tip=manualNextStep();
  $("#modal-content").innerHTML=`
    <span class="section-kicker">GRIMORIO DEL APRENDIZ</span>
    <h3>Manual básico de ARCANUM</h3>
    <p class="manual-intro">Una guía rápida para entender el reino sin tener que estudiar un tomo de ochocientas páginas antes de tu primer turno.</p>
    <div class="manual-now"><small>¿QUÉ HAGO AHORA?</small><strong>${esc(tip.title)}</strong><p>${esc(tip.text)}</p></div>
    <div class="manual-grid">
      <details class="manual-section" open><summary>Objetivo y Poder Neto</summary><p>Haz crecer tu reino, desarrolla tu Escuela, forma un ejército y compite con otros Archimagos. El <b>Poder Neto</b> resume la fuerza global de tu dominio y sirve para compararte en la clasificación.</p></details>
      <details class="manual-section"><summary>Turnos</summary><p>Los turnos son el motor del juego. Se regeneran automáticamente y se gastan al explorar, producir, construir, investigar, reclutar y realizar otras acciones.</p></details>
      <details class="manual-section"><summary>Recursos</summary><ul><li><b>Oro:</b> sostiene la economía, edificios y tropas.</li><li><b>Maná:</b> alimenta la magia y las invocaciones.</li><li><b>Población:</b> mantiene la actividad del reino y parte de su fuerza militar.</li><li><b>Tierras:</b> determinan cuánto puedes desarrollar.</li></ul></details>
      <details class="manual-section"><summary>Exploración</summary><p>Convierte turnos en nuevas tierras. El rendimiento disminuye conforme tu reino se aproxima a <b>3.500 acres</b>, por lo que más adelante la expansión dependerá cada vez más de otras vías.</p></details>
      <details class="manual-section"><summary>Construcción</summary><p>Convierte terreno salvaje en infraestructura.</p><ul><li><b>Granjas:</b> alimentos y población.</li><li><b>Pueblos:</b> población y oro.</li><li><b>Nodos:</b> producción y capacidad de maná.</li><li><b>Talleres:</b> mejoran la construcción.</li><li><b>Gremios:</b> generan investigación.</li><li><b>Cuarteles:</b> permiten reclutar.</li><li><b>Fortalezas y Barreras:</b> defensa del reino.</li></ul></details>
      <details class="manual-section"><summary>Magia e Investigación</summary><p>Tu Escuela marca tus afinidades. Los Gremios generan investigación y permiten descubrir nuevos hechizos. Algunas magias serán más accesibles para tu Escuela que otras.</p></details>
      <details class="manual-section"><summary>Ejército</summary><p>Los Cuarteles permiten reclutar unidades. También existen criaturas obtenidas mediante hechizos de invocación. Mantener un ejército cuesta recursos, así que tamaño y economía deben crecer juntos.</p></details>
      <details class="manual-section"><summary>Guerra</summary><p>Los ataques consumen turnos y pueden causar bajas y cambios territoriales. Antes de combatir, asegúrate de poder mantener el gasto de guerra y de no dejar tu reino indefenso.</p></details>
      <details class="manual-section"><summary>Mercado</summary><p>El Mercado permite publicar contratos de intercambio de <b>oro, maná y población</b>, consultar ofertas de otros Archimagos y abrir su ficha para negociar. Las ofertas duran 3 días y puedes retirar las tuyas cuando quieras. La liquidación automática entre inventarios se activará cuando el núcleo económico pueda cerrar operaciones de forma atómica.</p></details>
      <details class="manual-section"><summary>Comunidad</summary><p>El <b>Chat global</b> conecta a los Archimagos casi en tiempo real. El <b>Tablón</b> sirve para anuncios de diplomacia, reclutamiento, comercio, guerra y asuntos generales. Puedes borrar tus propios mensajes y anuncios.</p></details>
    </div>
    <div class="manual-steps"><b>Primeros pasos:</b> explora algunas tierras → construye una economía básica → levanta Gremios → investiga magia → crea Cuarteles y ejército → empieza a competir con otros reinos.</div>
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
    if(password.length<4){setNotice($("#auth-notice"),"La contraseña debe tener al menos 4 caracteres.");return;}
    btn.disabled=true; $("#submit-label").textContent=registering?"CREANDO CUENTA...":"ENTRANDO...";
    try{
      if(registering){
        if(password!==$("#confirm-password").value)throw new Error("Las contraseñas no coinciden.");
        await registerAccount(username,password);
      }
      await signInAccount(username,password);
      await bootGame();
    }catch(err){setNotice($("#auth-notice"),humanError(err));}
    finally{btn.disabled=false;$("#submit-label").textContent=registering?"CREAR CUENTA":"ENTRAR";}
  });
  $("#create-form").addEventListener("submit",async e=>{
    e.preventDefault(); clearNotice($("#create-notice")); const username=String(getSession()?.user?.user_metadata?.username||"").trim(); if(!username){setNotice($("#create-notice"),"No se ha podido recuperar tu nombre de usuario. Vuelve a iniciar sesión.");return;} if(!selectedSchool){setNotice($("#create-notice"),"Elige una de las Cinco Escuelas.");return;} const btn=$("#create-button"); btn.disabled=true;
    try{await rpc("create_archmage",{p_display_name:username,p_mage_name:username,p_school_code:selectedSchool}); toast("Tu reino ha sido fundado."); realmState=await rpc("my_realm_state"); showGame(); setTimeout(()=>startTutorial(false),450);}
    catch(err){setNotice($("#create-notice"),humanError(err));} finally{btn.disabled=false;}
  });
  $("#creation-logout").addEventListener("click",signOut); $("#logout-button").addEventListener("click",signOut); $("#refresh-button").addEventListener("click",()=>refreshState(false));
  $("#manual-top-button").addEventListener("click",openManual); $("#manual-side-button").addEventListener("click",openManual); $("#tutorial-side-button")?.addEventListener("click",()=>startTutorial(true));
  $("#main-nav").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)navigate(b.dataset.view);}); $("#mobile-nav").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)navigate(b.dataset.view);});
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
  const session=await validSession(); if(session)await bootGame(); else showAuth();
}
window.addEventListener("DOMContentLoaded",init);
