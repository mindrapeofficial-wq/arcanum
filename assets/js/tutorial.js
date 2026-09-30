"use strict";

const TUTORIAL_VERSION = "1";
let tutorialActive = false;
let tutorialIndex = 0;
let tutorialTarget = null;

const tutorialSteps = [
  {view:"realm",target:".realm-banner-2",kicker:"PASO 1 · TU DOMINIO",title:"Este es tu dominio",text:"El panel Dominio resume el estado de tu Arconte: tierras, poder, nivel mágico y situación general. Si alguna vez te pierdes, vuelve aquí."},
  {view:"realm",target:"#resource-strip",kicker:"PASO 2 · RECURSOS",title:"Mira esta franja antes de actuar",text:"Turnos, oro, maná, población y tierras son el combustible del dominio. Los turnos se regeneran y casi todas las decisiones importantes los consumen."},
  {view:"realm",target:".realm-command",kicker:"PASO 3 · CONSEJO ARCANO",title:"El juego ya te sugiere un siguiente paso",text:"Consejo Arcano analiza tu situación y te propone una prioridad. No es una orden: úsalo como brújula mientras aprendes."},
  {view:"economy",target:".action-panel",kicker:"PASO 4 · ECONOMÍA",title:"Convierte turnos en recursos",text:"En Economía puedes procesar turnos de forma normal, recaudar impuestos para obtener más oro o cargar maná. También puedes explorar nuevas tierras."},
  {view:"build",target:".building-list",kicker:"PASO 5 · CONSTRUCCIÓN",title:"La tierra salvaje no produce nada por sí sola",text:"Construye Granjas, Pueblos y Nodos para sostener el dominio. Después añade Gremios, Cuarteles, Fortalezas y Barreras según tu estrategia."},
  {view:"research",target:"#research-button",kicker:"PASO 6 · MAGIA",title:"Los Gremios alimentan tu grimorio",text:"Los Gremios generan puntos de conocimiento arcano. Investiga hechizos para ampliar tus opciones y aumentar tu Nivel Mágico. Tu Escuela determina tus afinidades."},
  {view:"army",target:"#view-host .grid-2",kicker:"PASO 7 · EJÉRCITO",title:"Primero Cuarteles, después tropas",text:"Recluta unidades compatibles con tu Escuela e invoca criaturas cuando conozcas los hechizos adecuados. Un ejército grande también exige una economía capaz de mantenerlo."},
  {view:"war",target:"#view-host .panel",kicker:"PASO 8 · GUERRA",title:"Atacar tiene consecuencias",text:"Los ataques gastan turnos, recursos y tropas. Revisa siempre tu ejército y tu economía antes de combatir. Las victorias pueden darte territorio."},
  {view:"community",target:".community-tabs",kicker:"PASO 9 · COMUNIDAD",title:"No estás solo en ARCANUM",text:"El Chat Global sirve para hablar con otros Arcontes. El Tablón permite publicar anuncios de diplomacia, comercio, reclutamiento o guerra."},
  {view:"realm",target:"#manual-top-button",kicker:"PASO 10 · LISTO",title:"Tu grimorio queda abierto",text:"Puedes consultar el Manual Básico con el botón ? y repetir este tutorial cuando quieras desde el propio Manual o desde el menú lateral."}
];

function tutorialStorageKey(){
  const session=getSession();
  const who=session?.user?.id || realmState?.realm?.mage_name || "mage";
  const season=realmState?.season?.id || realmState?.season?.name || "season";
  return "arcanum_tutorial_v"+TUTORIAL_VERSION+":"+String(who)+":"+String(season);
}
function tutorialCompleted(){try{return localStorage.getItem(tutorialStorageKey())==="done";}catch{return false;}}
function tutorialMarkCompleted(){try{localStorage.setItem(tutorialStorageKey(),"done");}catch{}}
function tutorialFindTarget(selector){
  if(!selector)return null;
  return Array.from(document.querySelectorAll(selector)).find(el=>{
    const r=el.getBoundingClientRect(),s=getComputedStyle(el);
    return r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden";
  })||null;
}
function tutorialGetLayer(){
  let layer=$("#tutorial-layer");
  if(layer)return layer;
  layer=document.createElement("div");
  layer.id="tutorial-layer";
  layer.className="tutorial-layer hidden";
  layer.innerHTML='<div class="tutorial-shield" aria-hidden="true"></div><div class="tutorial-focus" id="tutorial-focus" aria-hidden="true"></div><section class="tutorial-card" id="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="tutorial-title"><div class="tutorial-card-head"><span class="section-kicker" id="tutorial-kicker"></span><button class="tutorial-skip" id="tutorial-skip" type="button">SALTAR</button></div><h3 id="tutorial-title"></h3><p id="tutorial-text"></p><div class="tutorial-progress"><span id="tutorial-progress-bar"></span></div><div class="tutorial-card-foot"><small id="tutorial-counter"></small><div><button class="ghost-button" id="tutorial-back" type="button">ATRÁS</button><button class="small-action" id="tutorial-next" type="button">SIGUIENTE</button></div></div></section>';
  document.body.appendChild(layer);
  $("#tutorial-skip").addEventListener("click",()=>tutorialEnd(true));
  $("#tutorial-back").addEventListener("click",()=>tutorialMove(-1));
  $("#tutorial-next").addEventListener("click",()=>tutorialMove(1));
  return layer;
}
function tutorialPosition(){
  if(!tutorialActive)return;
  const focus=$("#tutorial-focus"),card=$("#tutorial-card");
  if(!focus||!card)return;
  if(!tutorialTarget){
    focus.classList.add("hidden");card.classList.add("tutorial-card-centered");card.style.left="";card.style.top="";return;
  }
  focus.classList.remove("hidden");card.classList.remove("tutorial-card-centered");
  const r=tutorialTarget.getBoundingClientRect(),pad=7;
  focus.style.left=Math.max(6,r.left-pad)+"px";
  focus.style.top=Math.max(6,r.top-pad)+"px";
  focus.style.width=Math.min(innerWidth-12,r.width+pad*2)+"px";
  focus.style.height=Math.min(innerHeight-12,r.height+pad*2)+"px";
  if(innerWidth<=760){card.style.left="12px";card.style.top="";return;}
  const cw=Math.min(390,innerWidth-24),ch=card.offsetHeight||250;
  let left=Math.min(Math.max(12,r.left),innerWidth-cw-12),top=r.bottom+16;
  if(top+ch>innerHeight-12)top=Math.max(12,r.top-ch-16);
  card.style.left=left+"px";card.style.top=top+"px";
}
async function tutorialRender(){
  if(!tutorialActive)return;
  const step=tutorialSteps[tutorialIndex];
  await navigate(step.view);
  await new Promise(resolve=>setTimeout(resolve,70));
  tutorialTarget=tutorialFindTarget(step.target);
  if(tutorialTarget){try{tutorialTarget.scrollIntoView({block:"center",inline:"nearest"});}catch{} await new Promise(resolve=>setTimeout(resolve,40));}
  const layer=tutorialGetLayer();
  $("#tutorial-kicker").textContent=step.kicker;
  $("#tutorial-title").textContent=step.title;
  $("#tutorial-text").textContent=step.text;
  $("#tutorial-counter").textContent=(tutorialIndex+1)+" / "+tutorialSteps.length;
  $("#tutorial-progress-bar").style.width=Math.round(((tutorialIndex+1)/tutorialSteps.length)*100)+"%";
  $("#tutorial-back").disabled=tutorialIndex===0;
  $("#tutorial-next").textContent=tutorialIndex===tutorialSteps.length-1?"TERMINAR":"SIGUIENTE";
  show(layer);
  requestAnimationFrame(tutorialPosition);
}
async function tutorialMove(delta){
  if(!tutorialActive)return;
  if(delta>0&&tutorialIndex===tutorialSteps.length-1){tutorialEnd(true);return;}
  tutorialIndex=Math.max(0,Math.min(tutorialSteps.length-1,tutorialIndex+delta));
  await tutorialRender();
}
async function startTutorial(force=true){
  if(tutorialActive)return;
  if(!force&&tutorialCompleted())return;
  hide($("#modal"));
  tutorialActive=true;tutorialIndex=0;
  document.body.classList.add("tutorial-running");
  window.addEventListener("resize",tutorialPosition,{passive:true});
  window.addEventListener("scroll",tutorialPosition,true);
  await tutorialRender();
}
function tutorialEnd(completed=true){
  if(!tutorialActive)return;
  tutorialActive=false;tutorialTarget=null;
  if(completed)tutorialMarkCompleted();
  hide($("#tutorial-layer"));
  document.body.classList.remove("tutorial-running");
  window.removeEventListener("resize",tutorialPosition);
  window.removeEventListener("scroll",tutorialPosition,true);
  navigate("realm");
  if(completed)toast("Tutorial completado. El dominio ya es tuyo.","success");
}
