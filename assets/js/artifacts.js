"use strict";

const ARCANUM_ARTIFACT_CATALOG=Object.freeze([
  {id:"ember_vial",name:"Ampolla de Brasa Eterna",category:"minor",effect:"+4% daño de hechizos durante campañas ofensivas.",lore:"Una brasa que nunca termina de consumir su cristal."},
  {id:"moon_salt",name:"Sal de Luna",category:"minor",effect:"+5% regeneración de maná.",lore:"Cristales recogidos donde la luz lunar toca piedra encantada."},
  {id:"mirror_shard",name:"Fragmento de Espejo Oracular",category:"minor",effect:"+3% evasión y detección de ilusiones.",lore:"Devuelve un reflejo que siempre llega un instante tarde."},
  {id:"war_drum",name:"Tambor de Guerra Rúnico",category:"minor",effect:"+4% moral del ejército.",lore:"Su piel vibra incluso antes de que comience una batalla."},
  {id:"mana_crystal",name:"Cristal de Maná Denso",category:"minor",effect:"+60 capacidad de maná.",lore:"Una veta de magia solidificada en azul profundo."},
  {id:"oracle_dice",name:"Dados del Oráculo",category:"minor",effect:"+3% fortuna en hallazgos.",lore:"Nunca muestran dos veces la misma combinación."},
  {id:"black_candle",name:"Vela Negra de Vigilia",category:"minor",effect:"+5% resistencia a magia Nadir.",lore:"Su llama oscura ilumina aquello que desea permanecer oculto."},
  {id:"pilgrim_map",name:"Mapa del Peregrino Perdido",category:"minor",effect:"+4% rendimiento de exploración.",lore:"Añade caminos que no estaban dibujados la noche anterior."},
  {id:"griffin_feather",name:"Pluma de Grifo",category:"minor",effect:"+3% velocidad de tropas.",lore:"Aún conserva el impulso de una criatura nacida sobre las nubes."},
  {id:"sealed_letter",name:"Carta del Rey Sin Nombre",category:"minor",effect:"+5 Influencia.",lore:"El sello no pertenece a ningún dominio conocido."},
  {id:"star_ink",name:"Tinta Estelar",category:"minor",effect:"+4% conocimiento arcano.",lore:"Los glifos escritos con ella brillan al pronunciarse."},
  {id:"obsidian_key",name:"Llave de Obsidiana",category:"minor",effect:"+4% probabilidad de botín en ruinas.",lore:"Abre cerraduras que todavía no han sido construidas."},
  {id:"silver_hourglass",name:"Reloj de Arena de Plata",category:"minor",effect:"-3% tiempo de construcción.",lore:"La arena asciende cuando nadie la observa."},
  {id:"witch_bell",name:"Campana de la Bruja",category:"minor",effect:"+4% defensa contra invocaciones.",lore:"Su tañido se oye mejor bajo tierra."},
  {id:"hollow_coin",name:"Moneda Hueca",category:"minor",effect:"+3% oro de economía activa.",lore:"Pesa menos que el aire y siempre cae de canto."},
  {id:"thorn_seed",name:"Semilla de Espino Carmesí",category:"minor",effect:"+4% defensa territorial.",lore:"Germina únicamente después de una batalla."},
  {id:"storm_bottle",name:"Botella de Tormenta",category:"minor",effect:"+4% poder arcano ofensivo.",lore:"Dentro ruge una tormenta demasiado grande para su recipiente."},
  {id:"dream_lens",name:"Lente de Sueño",category:"minor",effect:"+5 Conocimiento.",lore:"Permite leer palabras olvidadas al cerrar los ojos."},
  {id:"phoenix_ash",name:"Ceniza de Fénix",category:"minor",effect:"+5% recuperación tras derrota.",lore:"Se mantiene tibia siglos después de extinguirse."},
  {id:"rune_nail",name:"Clavo Rúnico",category:"minor",effect:"+4% fortificación.",lore:"Fue forjado para sujetar puertas contra cosas que no debían entrar."},
  {id:"siren_shell",name:"Caracola de Sirena",category:"minor",effect:"+4 Influencia y comercio.",lore:"Susurra ofertas imposibles de rechazar."},
  {id:"dragon_scale",name:"Escama de Dragón Antiguo",category:"minor",effect:"+5% resistencia física.",lore:"Ni el tiempo ha logrado opacar su borde."},
  {id:"sun_compass",name:"Brújula Solar",category:"minor",effect:"+4% exploración diurna.",lore:"No señala el norte, sino aquello que el portador necesita encontrar."},
  {id:"grave_lantern",name:"Farol de Sepultura",category:"minor",effect:"+5% resistencia a maldiciones.",lore:"Su luz tiembla cuando un juramento roto está cerca."},
  {id:"saint_thread",name:"Hilo del Santo Errante",category:"minor",effect:"+4 Voluntad.",lore:"Un hilo blanco que no puede cortarse con acero."},
  {id:"glass_eye",name:"Ojo de Vidrio Vivo",category:"minor",effect:"+3% precisión mágica.",lore:"Parpadea cuando detecta una mentira."},
  {id:"blood_quill",name:"Pluma de Sangre",category:"minor",effect:"+4% potencia de rituales.",lore:"Escribe sin tinta cuando el precio ha sido pagado."},
  {id:"winter_rose",name:"Rosa de Invierno",category:"minor",effect:"+5% regeneración fuera de combate.",lore:"Florece congelada y jamás pierde un pétalo."},
  {id:"cinder_mask",name:"Máscara de Ceniza",category:"minor",effect:"+4% resistencia al fuego.",lore:"El rostro interior cambia después de cada incendio."},
  {id:"echo_flute",name:"Flauta del Eco",category:"minor",effect:"+3% poder de invocación.",lore:"Repite notas que aún no han sido tocadas."},

  {id:"verdant_crown",name:"Corona del Bosque Primigenio",category:"school",school:"verdant",effect:"+12% regeneración y +8% producción de alimentos.",lore:"Las ramas que la forman siguen creciendo alrededor de su portador."},
  {id:"verdant_codex",name:"Códice de las Mil Raíces",category:"school",school:"verdant",effect:"+10% conocimiento arcano Viridia.",lore:"Cada página contiene el mapa de un bosque distinto."},
  {id:"verdant_seedheart",name:"Corazón Semilla",category:"school",school:"verdant",effect:"+10% vida del Arconte y +6% defensa.",lore:"Late lentamente bajo una corteza de oro verde."},

  {id:"eradication_brand",name:"Marca del Sol Quebrado",category:"school",school:"eradication",effect:"+12% daño de Escuela.",lore:"El metal permanece rojo aunque repose sobre hielo."},
  {id:"eradication_furnace",name:"Núcleo de la Forja Roja",category:"school",school:"eradication",effect:"+9% poder ofensivo y +5% reclutamiento.",lore:"Un pequeño horno que devora brasas y devuelve guerra."},
  {id:"eradication_banner",name:"Estandarte de la Última Carga",category:"school",school:"eradication",effect:"+10% moral y +6% daño de ejército.",lore:"No puede caer mientras alguien siga combatiendo."},

  {id:"ascendant_halo",name:"Halo del Mediodía",category:"school",school:"ascendant",effect:"+12% Barrera.",lore:"Una circunferencia de luz flota detrás del elegido."},
  {id:"ascendant_chalice",name:"Cáliz de Alba",category:"school",school:"ascendant",effect:"+10% maná y +6 Voluntad.",lore:"Siempre contiene una gota de luz líquida."},
  {id:"ascendant_sunstone",name:"Piedra del Sol Quieto",category:"school",school:"ascendant",effect:"+9% defensa mágica.",lore:"Proyecta sombra incluso dentro de la oscuridad absoluta."},

  {id:"abyssal_eye",name:"Ojo del Fondo",category:"school",school:"abyssal",effect:"+12% daño Nadir.",lore:"Algo al otro lado mira de vuelta."},
  {id:"abyssal_chain",name:"Cadena del Vacío",category:"school",school:"abyssal",effect:"+9% control de invocaciones.",lore:"Uno de sus extremos no existe en este mundo."},
  {id:"abyssal_whisper",name:"Susurro Encapsulado",category:"school",school:"abyssal",effect:"+8 Conocimiento y +6% rituales.",lore:"El cristal habla únicamente cuando la habitación queda vacía."},

  {id:"phantasm_mask",name:"Máscara de las Cien Caras",category:"school",school:"phantasm",effect:"+12% evasión.",lore:"Nunca presenta el mismo rostro dos veces."},
  {id:"phantasm_prism",name:"Prisma de la Mentira Perfecta",category:"school",school:"phantasm",effect:"+10% poder de ilusiones.",lore:"Divide la realidad en posibilidades igualmente convincentes."},
  {id:"phantasm_veil",name:"Velo del Ausente",category:"school",school:"phantasm",effect:"+8% defensa y +5 Influencia.",lore:"Quien lo lleva parece estar siempre a punto de desaparecer."},

  {id:"cursed_ledger",name:"Libro Mayor del Usurero Muerto",category:"cursed",effect:"+18% oro. Maldición: -8% producción de maná.",lore:"Cada ganancia escribe un nuevo nombre en sus páginas."},
  {id:"widows_ring",name:"Anillo de la Viuda",category:"cursed",effect:"+16% poder arcano. Maldición: -10% vida.",lore:"Aprieta un poco más después de cada victoria."},
  {id:"hunger_idol",name:"Ídolo del Hambre",category:"cursed",effect:"+20% botín. Maldición: +12% costes económicos.",lore:"La boca de piedra nunca termina de cerrarse."},
  {id:"broken_crown",name:"Corona Rota de Vael",category:"cursed",effect:"+14% Influencia. Maldición: -8% defensa.",lore:"Sus puntas siempre encuentran la piel."},
  {id:"black_mirror",name:"Espejo Negro",category:"cursed",effect:"+18% daño mágico. Maldición: -10% regeneración.",lore:"Refleja al portador como será después de perderlo todo."},

  {id:"crown_five_voices",name:"Corona de las Cinco Voces",category:"unique",effect:"+15% poder mágico global y afinidad ampliada.",lore:"Cinco metales imposibles cantan cuando las Escuelas entran en conflicto."},
  {id:"eryndor_chalice",name:"Cáliz de Eryndor",category:"unique",effect:"+20% regeneración de maná y +10 Voluntad.",lore:"El agua servida en él recuerda a todos sus propietarios."},
  {id:"staff_first_archmage",name:"Báculo del Primer Arconte",category:"unique",effect:"+18 Poder Arcano y +12 Conocimiento.",lore:"Nadie sabe quién fue el primero, pero el báculo sí."},
  {id:"sword_last_dawn",name:"Espada del Último Amanecer",category:"unique",effect:"+20% daño de ejército y +10% moral.",lore:"Su filo refleja un amanecer que todavía no ha sucedido."},
  {id:"atlas_unwritten",name:"Atlas de lo No Escrito",category:"unique",effect:"+20% exploración y revela rutas excepcionales.",lore:"Sus mapas aparecen justo antes de que el mundo cambie."},
  {id:"throne_ashes",name:"Trono de Cenizas Portátil",category:"unique",effect:"+15% oro, +15 Influencia.",lore:"Un fragmento del asiento de un imperio borrado de los registros."},
  {id:"orb_ninth_moon",name:"Orbe de la Novena Luna",category:"unique",effect:"+20% capacidad de maná y +10% conocimiento arcano.",lore:"Contiene una luna que ningún astrónomo ha visto."},
  {id:"bell_worlds_end",name:"Campana del Fin del Mundo",category:"unique",effect:"+18% poder de rituales y +12% defensa mágica.",lore:"Su sonido ha terminado guerras antes de empezar."},
  {id:"key_underworld",name:"Llave del Dominio Inferior",category:"unique",effect:"+20% botín de jefes y acceso a encuentros raros.",lore:"No abre una puerta. Decide dónde aparece."},
  {id:"heart_arcanum",name:"Corazón de ARCANUM",category:"unique",effect:"+10% a producción, magia y defensa.",lore:"Una gema imposible cuya pulsación parece acompasarse con el servidor."}
]);

let artifactFilter="all";
function artifactDef(id){return ARCANUM_ARTIFACT_CATALOG.find(x=>x.id===id);}
function artifactCategoryLabel(c){return ({minor:"Artefacto menor",school:"Reliquia de Escuela",cursed:"Artefacto maldito",unique:"Único mundial"})[c]||c;}
function artifactSchoolLabel(s){return ({verdant:"Viridia",eradication:"Cineria",ascendant:"Aurea",abyssal:"Nadir",phantasm:"Oneiria"})[s]||"";}
function artifactOwnedMap(rows){const m=new Map();(rows||[]).forEach(x=>{if(!m.has(x.artifact_id))m.set(x.artifact_id,[]);m.get(x.artifact_id).push(x);});return m;}

async function renderArtifactLibrary(){
  const host=$("#view-host");
  host.innerHTML=`
    <section class="artifact-hero">
      <div><span class="section-kicker">BIBLIOTECA DEL CÓNCLAVE</span><h2>Artefactos de ARCANUM</h2><p>60 reliquias con identidad propia. Los Únicos Mundiales sólo pueden tener un poseedor activo en todo el servidor.</p></div>
      <button id="artifact-refresh" class="primary-action" type="button">↻ ACTUALIZAR RELICARIO</button>
    </section>
    <section class="artifact-world-panel"><div><small>ÚNICOS MUNDIALES</small><strong id="artifact-world-count">—</strong></div><p id="artifact-world-note">Consultando custodios del servidor…</p></section>
    <div class="artifact-toolbar">
      <button data-artifact-filter="all" class="active">TODOS</button>
      <button data-artifact-filter="minor">MENORES</button>
      <button data-artifact-filter="school">ESCUELA</button>
      <button data-artifact-filter="cursed">MALDITOS</button>
      <button data-artifact-filter="unique">ÚNICOS</button>
      <span id="artifact-owned-count"></span>
    </div>
    <div id="artifact-grid" class="artifact-grid"><div class="empty">Abriendo el relicario…</div></div><div id="artifact-market-root" class="artifact-market-root"></div>`;
  document.querySelectorAll("[data-artifact-filter]").forEach(b=>b.addEventListener("click",()=>{
    artifactFilter=b.dataset.artifactFilter;
    document.querySelectorAll("[data-artifact-filter]").forEach(x=>x.classList.toggle("active",x===b));
    loadArtifactLibrary();
  }));
  $("#artifact-refresh")?.addEventListener("click",loadArtifactLibrary);
  await loadArtifactLibrary();
}

async function loadArtifactLibrary(){
  const grid=$("#artifact-grid"); if(!grid)return;
  try{
    const data=await communityApi("/artifacts");
    const mine=artifactOwnedMap(data.mine||[]);
    const uniqueOwners=new Map((data.uniques||[]).map(x=>[x.artifact_id,x]));
    const filtered=ARCANUM_ARTIFACT_CATALOG.filter(a=>artifactFilter==="all"||a.category===artifactFilter);
    $("#artifact-world-count").textContent=(data.uniques||[]).length+" / 10 encontrados";
    $("#artifact-world-note").textContent=(data.uniques||[]).length?"Algunas reliquias ya tienen custodio. Su historia queda registrada para siempre.":"Los diez Únicos Mundiales siguen perdidos.";
    $("#artifact-owned-count").textContent=(data.mine||[]).length+" en tu relicario";
    grid.innerHTML=filtered.map(a=>{
      const owned=mine.get(a.id)||[];
      const owner=uniqueOwners.get(a.id);
      const equipped=owned.find(x=>x.equipped);
      const school=a.school?'<span class="artifact-school '+esc(a.school)+'">'+esc(artifactSchoolLabel(a.school))+'</span>':"";
      const uniqueState=a.category==="unique"
        ?(owner?'<div class="artifact-owner">CUSTODIO: <strong>'+esc(owner.username)+'</strong></div>':'<div class="artifact-owner free">PERDIDO EN EL MUNDO</div>')
        :"";
      const ownState=owned.length
        ?'<div class="artifact-owned">POSEES '+owned.length+(equipped?' · EQUIPADO':'')+'</div>'
        :"";
      const equipButton=owned.length
        ?(equipped
          ?'<button class="ghost-button" data-artifact-unequip="'+esc(equipped.id)+'">DESVINCULAR</button>'
          :'<button class="small-action" data-artifact-equip="'+esc(owned[0].id)+'">VINCULAR</button>')
        :"";
      const historyButton=a.category==="unique"?'<button class="ghost-button" data-artifact-history="'+esc(a.id)+'">HISTORIA</button>':"";
      return '<article class="artifact-card artifact-'+esc(a.category)+' '+(owned.length?'is-owned':'')+'">'+
        '<header><span>'+esc(artifactCategoryLabel(a.category))+'</span>'+school+'</header>'+
        '<h3>'+esc(a.name)+'</h3><p class="artifact-effect">'+esc(a.effect)+'</p>'+
        '<p class="artifact-lore">'+esc(a.lore)+'</p>'+uniqueState+ownState+
        '<div class="artifact-actions">'+equipButton+historyButton+'</div></article>';
    }).join("");
    grid.querySelectorAll("[data-artifact-equip]").forEach(b=>b.addEventListener("click",()=>equipNamedArtifact(b.dataset.artifactEquip)));
    grid.querySelectorAll("[data-artifact-unequip]").forEach(b=>b.addEventListener("click",()=>unequipNamedArtifact()));
    grid.querySelectorAll("[data-artifact-history]").forEach(b=>b.addEventListener("click",()=>showArtifactHistory(b.dataset.artifactHistory)));
    if(typeof renderArtifactMarketPanel==="function")await renderArtifactMarketPanel(data);
  }catch(e){grid.innerHTML='<div class="empty">'+esc(humanError(e))+'</div>';}
}

async function discoverNamedArtifact(){
  const btn=$("#artifact-discover"); if(!btn)return;
  const old=btn.innerHTML;btn.disabled=true;btn.textContent="BUSCANDO…";
  try{
    const data=await communityApi("/artifacts/discover",{method:"POST",body:{}});
    const def=artifactDef(data.artifact?.artifact_id);
    toast("Has descubierto: "+(def?.name||"una reliquia"));
    await loadArtifactLibrary();
  }catch(e){
    const msg=String(e?.message||e);
    if(msg.includes("ARTIFACT_DISCOVERY_COOLDOWN"))toast("El relicario necesita 30 segundos antes de otro hallazgo de prueba.","error");
    else toast(humanError(e),"error");
  }finally{btn.disabled=false;btn.innerHTML=old;}
}

async function equipNamedArtifact(id){
  try{
    if(typeof equipCanonicalItem==="function")await equipCanonicalItem("relic",id);
    else await communityApi("/artifacts/equip/"+encodeURIComponent(id),{method:"POST",body:{}});
    toast("Reliquia vinculada al slot canónico.");
    await loadArtifactLibrary();
  }catch(e){toast(humanError(e),"error");}
}
async function unequipNamedArtifact(){
  try{
    if(typeof unequipCanonicalSlot==="function")await unequipCanonicalSlot("relic");
    toast("Reliquia desvinculada.");
    await loadArtifactLibrary();
  }catch(e){toast(humanError(e),"error");}
}

async function showArtifactHistory(artifactId){
  const def=artifactDef(artifactId);
  try{
    const data=await communityApi("/artifacts/history/"+encodeURIComponent(artifactId));
    const rows=data.history||[];
    $("#modal-content").innerHTML='<section class="artifact-history"><span class="section-kicker">CRÓNICA DEL SERVIDOR</span><h3>'+esc(def?.name||artifactId)+'</h3>'+
      (rows.length?rows.map(r=>'<div class="artifact-history-row"><strong>'+esc(r.username||"Desconocido")+'</strong><span>'+esc(r.event_type)+'</span><small>'+new Date(r.created_at).toLocaleString("es-ES")+'</small></div>').join(""):'<div class="empty">Este artefacto todavía no tiene historia.</div>')+
      '</section>';
    show($("#modal"));
  }catch(e){toast(humanError(e),"error");}
}

// Explicit global export for router/runtime recovery.
globalThis.renderArtifactLibrary=renderArtifactLibrary;
