"use strict";

function stopCommunityPolling(){ clearInterval(communityPollTimer); communityPollTimer=null; communityBusy=false; }
function startCommunityPolling(){
  stopCommunityPolling();
  if(currentView!=="community" || !["chat","school"].includes(communityMode))return;
  communityPollTimer=setInterval(()=>{ if(currentView==="community" && ["chat","school"].includes(communityMode)){ loadChatMessages(true); loadPresence(); } },COMMUNITY_POLL_MS);
}
async function navigate(view){
  if(currentView==="tavern" && view!=="tavern" && typeof stopTavern==="function")stopTavern();
  currentView=view;
  document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  if(view!=="community")stopCommunityPolling();
  return renderView(view);
}
async function renderView(view){
  const host=$("#view-host"); host.innerHTML=`<div class="skeleton" style="width:180px;height:9px;margin-bottom:10px"></div><div class="skeleton" style="width:55%;height:34px;margin-bottom:22px"></div><div class="panel"><div class="skeleton"></div></div>`;
  try{
    if(view==="realm"){
      renderRealm();
      host.querySelector(".view-header")?.remove();
    } else if(view==="economy") renderEconomy(); else if(view==="market") await renderMarket(); else if(view==="build") renderBuild(); else if(view==="research") renderResearch(); else if(view==="army") await renderArmy(); else if(view==="war") await renderWar(); else if(view==="event") renderEvent(); else if(view==="ranking") await renderRanking(); else if(view==="battles") await renderBattles(); else if(view==="community") await renderCommunity(); else if(view==="tavern") await renderTavern();
  }catch(e){ host.innerHTML=`<div class="view-header"><div><span class="section-kicker">ARCANUM</span><h2>Error del grimorio</h2><p>${esc(humanError(e))}</p></div></div>`; }
}
function viewHeader(kicker,title,desc){return `<div class="view-header"><div><span class="section-kicker">${esc(kicker)}</span><h2>${esc(title)}</h2><p>${esc(desc)}</p></div></div>`;}
