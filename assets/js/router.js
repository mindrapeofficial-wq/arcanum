"use strict";

const VIEW_RENDERERS={
  character:{name:"renderCharacterPage",src:"assets/js/character.js?v=0.3.16"},
  army:{name:"renderArmy",src:"assets/js/army.js?v=0.3.16"},
  community:{name:"renderCommunity",src:"assets/js/community.js?v=0.3.16"},
  market:{name:"renderMarket",src:"assets/js/market.js?v=0.2.60"},
  artifacts:{name:"renderArtifactLibrary",src:"assets/js/artifacts.js?v=0.2.60"},
  arena:{name:"renderArena",src:"assets/js/arena.js?v=0.3.6"},
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
async function navigate(view){
  if(currentView==="tavern" && view!=="tavern" && typeof stopTavern==="function")stopTavern();
  if(currentView==="event" && view!=="event" && typeof stopBossPolling==="function")stopBossPolling();
  currentView=view;
  document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  if(view!=="community")stopCommunityPolling();
  return renderView(view);
}
async function renderView(view){
  const host=$("#view-host"); host.innerHTML=`<div class="skeleton" style="width:180px;height:9px;margin-bottom:10px"></div><div class="skeleton" style="width:55%;height:34px;margin-bottom:22px"></div><div class="panel"><div class="skeleton"></div></div>`;
  try{
    await ensureViewRenderer(view);
    if(view==="character") await renderCharacterPage(); else if(view==="realm"){
      renderRealm();
      host.querySelector(".view-header")?.remove();
    } else if(view==="economy") renderEconomy(); else if(view==="market") await renderMarket(); else if(view==="artifacts") await renderArtifactLibrary(); else if(view==="build") renderBuild(); else if(view==="research") renderResearch(); else if(view==="army") await renderArmy(); else if(view==="war") await renderWar(); else if(view==="arena") await renderArena(); else if(view==="pvp-ranking") await renderPvpRanking(); else if(view==="pve") await renderPve(); else if(view==="event") await renderEvent(); else if(view==="ranking") await renderRanking(); else if(view==="battles") await renderBattles(); else if(view==="community") await renderCommunity(); else if(view==="tavern") await renderTavern(); else if(view==="lore") renderLore(); else if(view==="admin") await renderAdminPanel();
  }catch(e){ host.innerHTML=`<div class="view-header"><div><span class="section-kicker">ARCANUM</span><h2>Error del grimorio</h2><p>${esc(humanError(e))}</p></div></div>`; }
}
function viewHeader(kicker,title,desc){return `<div class="view-header"><div><span class="section-kicker">${esc(kicker)}</span><h2>${esc(title)}</h2><p>${esc(desc)}</p></div></div>`;}
