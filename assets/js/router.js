"use strict";
currentView="realm";

const VIEW_RENDERERS={
  character:{name:"renderCharacterPage",src:"assets/js/character.js?v=0.3.43"},
  army:{name:"renderArmy",src:"assets/js/army.js?v=0.3.44"},
  community:{name:"renderCommunity",src:"assets/js/community.js?v=0.3.16"},
  market:{name:"renderMarket",src:"assets/js/market.js?v=0.2.60"},
  artifacts:{name:"renderArtifactLibrary",src:"assets/js/artifacts.js?v=0.2.60"},
  arena:{name:"renderArena",src:"assets/js/arena.js?v=0.3.38"},
  "pvp-ranking":{name:"renderPvpRanking",src:"assets/js/pvp-ranking.js?v=0.3.27"},
  pve:{name:"renderPve",src:"assets/js/pve.js?v=0.3.7"},
  admin:{name:"renderAdminPanel",src:"assets/js/admin.js?v=0.3.22"}
};

async function ensureViewRenderer(view){
  const feature=VIEW_RENDERERS[view];
  if(!feature)return;
  if(typeof globalThis[feature.name]==="function")return;

  const existing=[...document.scripts].find(s=>s.src&&s.src.includes(feature.src.split("?")[0]));
  if(existing){
    await new Promise(resolve=>setTimeout(resolve,0));
    if(typeof globalThis[feature.name]==="function")return;
  }

  await new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    script.src=feature.src+"&retry="+Date.now();
    script.defer=false;
    script.async=false;
    script.onload=resolve;
    script.onerror=()=>reject(new Error("No se pudo cargar el módulo "+feature.name));
    document.head.appendChild(script);
  });

  if(typeof globalThis[feature.name]!=="function"){
    throw new Error("No se pudo iniciar "+feature.name);
  }
}

function stopCommunityPolling(){ clearInterval(communityPollTimer); communityPollTimer=null; communityBusy=false; }
function startCommunityPolling(){
  stopCommunityPolling();
  if(currentView!=="community" || !["chat","school"].includes(communityMode))return;
  communityPollTimer=setInterval(()=>{ if(currentView==="community" && ["chat","school"].includes(communityMode)){ loadChatMessages(true); loadPresence(); } },COMMUNITY_POLL_MS);
}
const NAV_GROUP_BY_VIEW=Object.freeze({
  character:"arconte",research:"arconte",artifacts:"arconte",arena:"arconte",pve:"arconte",event:"arconte",
  realm:"reino",build:"reino",economy:"reino",market:"reino",army:"reino",war:"reino",battles:"reino",
  tavern:"comunidad",community:"comunidad",ranking:"comunidad",admin:"comunidad"
});
const NAV_GROUP_LABELS=Object.freeze({arconte:"Personaje",reino:"Reino",comunidad:"Comunidad"});
function navGroupForView(view){return NAV_GROUP_BY_VIEW[view]||"arconte"}
function closeMobileNavMenu(){
  const menu=document.getElementById("mobile-nav-menu");if(!menu)return;
  menu.classList.add("hidden");menu.setAttribute("aria-hidden","true");
  document.querySelectorAll("[data-nav-group-trigger]").forEach(btn=>btn.setAttribute("aria-expanded","false"));
}
function toggleMobileNavGroup(group){
  const menu=document.getElementById("mobile-nav-menu");if(!menu)return;
  const sameOpen=!menu.classList.contains("hidden")&&menu.dataset.group===group;
  if(sameOpen){closeMobileNavMenu();return}
  menu.dataset.group=group;menu.classList.remove("hidden");menu.setAttribute("aria-hidden","false");
  const title=document.getElementById("mobile-nav-menu-title");if(title)title.textContent=NAV_GROUP_LABELS[group]||"Navegación";
  menu.querySelectorAll("[data-mobile-nav-group]").forEach(panel=>panel.classList.toggle("hidden",panel.dataset.mobileNavGroup!==group));
  document.querySelectorAll("[data-nav-group-trigger]").forEach(btn=>btn.setAttribute("aria-expanded",btn.dataset.navGroupTrigger===group?"true":"false"));
}
function syncNavigationGroup(view){
  const group=navGroupForView(view);
  const mainNav=document.getElementById("main-nav");
  const reinoSection=mainNav?.querySelector('details[data-nav-group="reino"]');
  const personajeSection=mainNav?.querySelector('details[data-nav-group="arconte"]');
  if(mainNav&&reinoSection&&personajeSection){
    mainNav.insertBefore(reinoSection,personajeSection);
    const title=personajeSection.querySelector("summary span:first-child");
    if(title)title.textContent="PERSONAJE";
  }
  const mobileNav=document.getElementById("mobile-nav");
  const reinoTrigger=mobileNav?.querySelector('[data-nav-group-trigger="reino"]');
  const personajeTrigger=mobileNav?.querySelector('[data-nav-group-trigger="arconte"]');
  if(mobileNav&&reinoTrigger&&personajeTrigger){
    mobileNav.insertBefore(reinoTrigger,personajeTrigger);
    const label=personajeTrigger.querySelector("small");
    if(label)label.textContent="Personaje";
  }
  document.querySelectorAll("[data-nav-group-trigger]").forEach(btn=>btn.classList.toggle("active",btn.dataset.navGroupTrigger===group));
  document.querySelectorAll("#main-nav details[data-nav-group]").forEach(section=>{section.open=section.dataset.navGroup===group});
}
syncNavigationGroup(currentView);

async function navigate(view){
  if(currentView==="tavern" && view!=="tavern" && typeof stopTavern==="function")stopTavern();
  if(currentView==="event" && view!=="event" && typeof stopBossPolling==="function")stopBossPolling();
  currentView=view;
  document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  syncNavigationGroup(view);
  if(view!=="community")stopCommunityPolling();
  return renderView(view);
}
let viewRenderSeq=0;
async function renderView(view){
  const seq=++viewRenderSeq;
  const host=$("#view-host"); host.innerHTML=`<div class="skeleton" style="width:180px;height:9px;margin-bottom:10px"></div><div class="skeleton" style="width:55%;height:34px;margin-bottom:22px"></div><div class="panel"><div class="skeleton"></div></div>`;
  try{
    await ensureViewRenderer(view);
    if(view==="character") await renderCharacterPage(); else if(view==="realm"){
      renderRealm();
      host.querySelector(".view-header")?.remove();
    } else if(view==="economy") renderEconomy(); else if(view==="market") await renderMarket(); else if(view==="artifacts") await renderArtifactLibrary(); else if(view==="build") renderBuild(); else if(view==="research") renderResearch(); else if(view==="army") await renderArmy(); else if(view==="war") await renderWar(); else if(view==="arena") await renderArena(); else if(view==="pvp-ranking") await renderPvpRanking(); else if(view==="pve") await renderPve(); else if(view==="event") await renderEvent(); else if(view==="ranking") await renderRanking(); else if(view==="battles") await renderBattles(); else if(view==="community") await renderCommunity(); else if(view==="tavern") await renderTavern(); else if(view==="lore") renderLore(); else if(view==="admin") await renderAdminPanel();
  }catch(e){ if(seq===viewRenderSeq) host.innerHTML=`<div class="view-header"><div><span class="section-kicker">ARCANUM</span><h2>Error del grimorio</h2><p>${esc(humanError(e))}</p></div></div>`; }
  // A slow renderer from an earlier navigation (Personaje loads async) may have just overwritten the
  // view the player is on now; draw the current view again instead of leaving the wrong content.
  if(seq!==viewRenderSeq && currentView!==view) return renderView(currentView);
}
function viewHeader(kicker,title,desc){return `<div class="view-header"><div><span class="section-kicker">${esc(kicker)}</span><h2>${esc(title)}</h2><p>${esc(desc)}</p></div></div>`;}
