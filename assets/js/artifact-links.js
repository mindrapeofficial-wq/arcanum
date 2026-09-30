"use strict";

let artifactMarketState={listings:[],mine:[],me:null};

function artifactGameplayName(id){
  return (typeof artifactDef==="function"&&artifactDef(id)?.name)||id||"reliquia desconocida";
}

function artifactGameplayDrop(data,context){
  const drop=data?.drop||data?.artifact||data?.artifact_reward;
  if(!drop)return false;
  const name=artifactGameplayName(drop.artifact_id);
  const isUnique=drop.category==="unique";
  const prefix=data?.captured_unique?"¡ÚNICO CAPTURADO!":isUnique?"¡ÚNICO MUNDIAL!":"Reliquia obtenida";
  toast(prefix+": "+name+(context?" · "+context:""),"success",isUnique?9000:6500);
  return true;
}

async function artifactStartExplorationClaim(turns){
  try{
    const data=await communityApi("/artifacts/exploration/start",{method:"POST",body:{turns}});
    return data?.claim_key||null;
  }catch(e){
    console.warn("No se pudo abrir la reclamación de exploración",e);
    return null;
  }
}

async function artifactCompleteExplorationClaim(claimKey){
  if(!claimKey)return null;
  try{
    const data=await communityApi("/artifacts/exploration/complete",{method:"POST",body:{claim_key:claimKey}});
    artifactGameplayDrop(data,"hallada durante la expedición");
    return data;
  }catch(e){
    const msg=String(e?.message||e);
    if(!msg.includes("EXPLORATION_NOT_VERIFIED")&&!msg.includes("INVALID_EXPLORATION_CLAIM")&&!msg.includes("EXPLORATION_CLAIM_EXPIRED"))console.warn("Fallo al reclamar botín de exploración",e);
    return null;
  }
}

async function artifactClaimPvp(battleId){
  if(!battleId)return null;
  try{
    const data=await communityApi("/artifacts/pvp/claim",{method:"POST",body:{battle_id:battleId}});
    if(!data?.already_claimed)artifactGameplayDrop(data,data?.captured_unique?"arrebatado al reino rival":"botín de guerra");
    return data;
  }catch(e){
    const msg=String(e?.message||e);
    if(!msg.includes("VICTORY_REQUIRED")&&!msg.includes("BATTLE_NOT_VERIFIED"))console.warn("Fallo al reclamar botín PvP",e);
    return null;
  }
}

function artifactMarketMessage(error){
  const m=String(error?.message||error||"");
  const map=[
    ["UNEQUIP_BEFORE_MARKET","Desequipa esa reliquia antes de ofrecerla."],
    ["ARTIFACT_ALREADY_LISTED","Esa reliquia ya está publicada."],
    ["BUYER_ARTIFACT_LISTED","La reliquia que ofreces ya está publicada en otra oferta."],
    ["BUYER_ARTIFACT_EQUIPPED","Desequipa la reliquia que quieres entregar."],
    ["WRONG_ARTIFACT_CATEGORY","La reliquia ofrecida no pertenece a la categoría solicitada."],
    ["LISTING_NOT_OPEN","La oferta ya no está disponible."],
    ["CANNOT_BUY_OWN_LISTING","No puedes aceptar tu propia oferta."],
    ["SELLER_ARTIFACT_UNAVAILABLE","La reliquia del vendedor ya no está disponible."],
    ["BUYER_ARTIFACT_UNAVAILABLE","La reliquia que intentas entregar ya no está disponible."]
  ];
  for(const pair of map)if(m.includes(pair[0]))return pair[1];
  return humanError(error);
}

async function renderArtifactMarketPanel(){
  const root=$("#artifact-market-root");
  if(!root)return;
  root.innerHTML='<section class="artifact-market-shell"><div class="artifact-market-head"><div><span class="section-kicker">MERCADO DE RELIQUIAS</span><h3>Trueque entre Archimagos</h3><p>Una reliquia entra y otra sale en la misma transacción. Los Únicos Mundiales también pueden cambiar de custodio mediante un trueque.</p></div><button id="artifact-market-refresh" class="icon-button" type="button">↻</button></div><div class="empty">Consultando ofertas…</div></section>';
  try{
    artifactMarketState=await communityApi("/artifacts/market");
    paintArtifactMarketPanel();
  }catch(e){
    root.innerHTML='<section class="artifact-market-shell"><div class="empty">'+esc(humanError(e))+'</div></section>';
  }
}

function paintArtifactMarketPanel(){
  const root=$("#artifact-market-root");
  if(!root)return;
  const listings=artifactMarketState.listings||[];
  const mine=artifactMarketState.mine||[];
  const me=artifactMarketState.me;
  const listedIds=new Set(listings.map(x=>String(x.artifact_instance_id)));
  const available=mine.filter(x=>!x.equipped&&!listedIds.has(String(x.id)));
  const options=available.map(x=>'<option value="'+esc(x.id)+'">'+esc(artifactGameplayName(x.artifact_id))+' · '+esc(artifactCategoryLabel(x.category))+'</option>').join("");
  const rows=listings.length?listings.map(l=>{
    const def=artifactDef(l.artifact?.artifact_id);
    const own=l.seller_user_id===me;
    return '<article class="artifact-market-row"><div class="artifact-market-relic"><span class="artifact-market-kind">'+esc(artifactCategoryLabel(l.artifact?.category||""))+'</span><strong>'+esc(def?.name||l.artifact?.artifact_id||"Reliquia")+'</strong><small>ofrecida por '+esc(l.seller_username)+'</small></div><div class="artifact-market-want"><small>PIDE A CAMBIO</small><strong>'+esc(artifactCategoryLabel(l.want_category))+'</strong></div><div class="artifact-market-actions">'+(own?'<button class="ghost-button" data-artifact-market-cancel="'+esc(l.id)+'">RETIRAR</button>':'<button class="small-action" data-artifact-market-accept="'+esc(l.id)+'">INTERCAMBIAR</button>')+'</div></article>';
  }).join(""):'<div class="empty">Todavía no hay reliquias ofrecidas.</div>';
  root.innerHTML='<section class="artifact-market-shell"><div class="artifact-market-head"><div><span class="section-kicker">MERCADO DE RELIQUIAS</span><h3>Trueque entre Archimagos</h3><p>Intercambios atómicos de reliquia por reliquia.</p></div><button id="artifact-market-refresh" class="icon-button" type="button">↻</button></div><div class="artifact-market-create"><label>OFREZCO<select id="artifact-market-mine">'+(options||'<option value="">Sin reliquias disponibles</option>')+'</select></label><label>QUIERO<select id="artifact-market-want"><option value="minor">Artefacto menor</option><option value="school">Reliquia de Escuela</option><option value="cursed">Artefacto maldito</option><option value="unique">Único mundial</option></select></label><button id="artifact-market-publish" class="profile-action" type="button" '+(available.length?"":"disabled")+'>PUBLICAR TRUEQUE</button></div><div class="artifact-market-list">'+rows+'</div></section>';
  $("#artifact-market-refresh")?.addEventListener("click",renderArtifactMarketPanel);
  $("#artifact-market-publish")?.addEventListener("click",publishArtifactMarketListing);
  root.querySelectorAll("[data-artifact-market-cancel]").forEach(b=>b.addEventListener("click",()=>cancelArtifactMarketListing(b.dataset.artifactMarketCancel)));
  root.querySelectorAll("[data-artifact-market-accept]").forEach(b=>b.addEventListener("click",()=>openArtifactMarketSwap(b.dataset.artifactMarketAccept)));
}

async function publishArtifactMarketListing(){
  const instanceId=$("#artifact-market-mine")?.value;
  const wantCategory=$("#artifact-market-want")?.value;
  if(!instanceId)return;
  const btn=$("#artifact-market-publish");if(btn)btn.disabled=true;
  try{
    await communityApi("/artifacts/market",{method:"POST",body:{artifact_instance_id:instanceId,want_category:wantCategory}});
    toast("Reliquia publicada en el Mercado de Reliquias.");
    await renderArtifactMarketPanel();
  }catch(e){toast(artifactMarketMessage(e),"error");}
  finally{if(btn)btn.disabled=false;}
}

async function cancelArtifactMarketListing(id){
  if(!confirm("¿Retirar esta reliquia del mercado?"))return;
  try{
    await communityApi("/artifacts/market/"+encodeURIComponent(id),{method:"DELETE"});
    toast("Oferta retirada.");
    await renderArtifactMarketPanel();
  }catch(e){toast(artifactMarketMessage(e),"error");}
}

function openArtifactMarketSwap(id){
  const listing=(artifactMarketState.listings||[]).find(x=>String(x.id)===String(id));
  if(!listing)return;
  const listedIds=new Set((artifactMarketState.listings||[]).map(x=>String(x.artifact_instance_id)));
  const candidates=(artifactMarketState.mine||[]).filter(x=>x.category===listing.want_category&&!x.equipped&&!listedIds.has(String(x.id)));
  const choices=candidates.map(x=>'<option value="'+esc(x.id)+'">'+esc(artifactGameplayName(x.artifact_id))+'</option>').join("");
  $("#modal-content").innerHTML='<section class="artifact-market-dialog"><span class="section-kicker">TRUEQUE ARCANO</span><h3>'+esc(artifactGameplayName(listing.artifact?.artifact_id))+'</h3><p>'+esc(listing.seller_username)+' pide una '+esc(artifactCategoryLabel(listing.want_category))+'.</p>'+(candidates.length?'<label>TU RELIQUIA<select id="artifact-market-swap-item">'+choices+'</select></label><button id="artifact-market-swap-confirm" class="primary-action" type="button">✦ CONFIRMAR INTERCAMBIO</button>':'<div class="empty">No tienes una reliquia disponible de la categoría solicitada.</div>')+'</section>';
  $("#artifact-market-swap-confirm")?.addEventListener("click",()=>acceptArtifactMarketSwap(id,$("#artifact-market-swap-item").value));
  show($("#modal"));
}

async function acceptArtifactMarketSwap(id,offeredId){
  const btn=$("#artifact-market-swap-confirm");if(btn)btn.disabled=true;
  try{
    const data=await communityApi("/artifacts/market/"+encodeURIComponent(id)+"/accept",{method:"POST",body:{offered_instance_id:offeredId}});
    hide($("#modal"));
    toast("Trueque completado. Has recibido "+artifactGameplayName(data?.swap?.received_artifact_id)+".","success",6500);
    await loadArtifactLibrary();
  }catch(e){toast(artifactMarketMessage(e),"error");}
  finally{if(btn)btn.disabled=false;}
}
