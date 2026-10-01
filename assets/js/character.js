"use strict";

async function renderCharacterPage(){
  const host=$("#view-host");
  const mageName=String(realmState?.realm?.mage_name||ownProfileBadge?.mage_name||"").trim();
  if(!host)return;
  if(!mageName){
    host.innerHTML='<div class="view-header"><div><span class="section-kicker">PERFIL SOCIAL</span><h2>Personaje</h2><p>No se ha podido identificar al jugador.</p></div></div>';
    return;
  }

  host.innerHTML='<div class="character-page-loading"><span class="section-kicker">PERFIL SOCIAL</span><strong>Preparando tu perfil…</strong></div>';
  try{
    let snapshot=typeof loadArchmageSnapshot==="function"
      ?await loadArchmageSnapshot(mageName,{force:true})
      :{profile:await rpc("player_profile",{p_mage_name:mageName})};
    const profile=snapshot.profile;
    const inbox=await rpc("social_inbox");
    ownProfileBadge=profile;
    renderOwnProfileBadge();
    renderPlayerProfile(profile,inbox,snapshot,host);
  }catch(e){
    host.innerHTML='<div class="view-header"><div><span class="section-kicker">PERFIL SOCIAL</span><h2>Error de perfil</h2><p>'+esc(humanError(e))+'</p></div></div>';
  }
}

globalThis.renderCharacterPage=renderCharacterPage;
