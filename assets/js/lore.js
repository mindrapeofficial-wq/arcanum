"use strict";

const ARCANUM_LORE = {
  eras: [
    {
      id:"before",
      mark:"I",
      title:"Antes del Nombre",
      subtitle:"Cuando el mundo aún no sabía que era un mundo.",
      text:[
        "Los textos más antiguos no hablan de reyes, continentes ni dioses. Hablan del Silencio: una extensión sin tiempo atravesada por cinco impulsos primordiales. No eran escuelas de magia, porque todavía no existía nadie capaz de estudiarlas. Eran maneras distintas de obligar a la realidad a existir.",
        "La tradición de Aurea llama a esos impulsos las Cinco Leyes. Viridia los recuerda como las Cinco Raíces. Para Nadir fueron Cinco Hambres. Ninguna versión ha podido imponerse. Lo único común a todos los códices es que, cuando las cinco fuerzas coincidieron por primera vez, apareció Arcanum."
      ],
      quote:"«Antes de la primera palabra hubo cinco respuestas a una pregunta que nadie había formulado.» — Fragmento de la Tabla de Ceniza"
    },
    {
      id:"awakening",
      mark:"II",
      title:"El Despertar de los Arcontes",
      subtitle:"La magia encontró voluntad.",
      text:[
        "Durante edades incontables, la magia atravesó Arcanum sin dueño. Cambiaba montañas, enfermaba bosques, levantaba ciudades de cristal que desaparecían antes de ser vistas. El equilibrio terminó con el nacimiento de los primeros seres capaces de retener poder arcano sin ser consumidos por él: los Arcontes.",
        "Los primeros Arcontes no gobernaban dominios. Eran catástrofes con memoria. Donde caminaban, la geografía aprendía nuevas reglas. Sus disputas dieron forma a ríos, desiertos y regiones enteras. Con el tiempo comprendieron que la magia no podía acumularse indefinidamente en un solo ser. Para sobrevivir, comenzaron a anclar parte de su poder en tierras, fortalezas, artefactos y seguidores. Así nació el concepto de Dominio."
      ],
      quote:"«Un dominio no es tierra. Es la sombra que proyecta la voluntad de un Arconte sobre la realidad.» — Maestre Oryn, Crónicas del Primer Dominio"
    },
    {
      id:"five",
      mark:"III",
      title:"La Ruptura de las Cinco Escuelas",
      subtitle:"Una sola magia se convirtió en cinco doctrinas irreconciliables.",
      text:[
        "La primera gran comunidad de Arcontes fue el Cónclave de Aster. Su propósito era estudiar la Fuente, el punto teórico del que emanaba toda la magia. El Cónclave sobrevivió tres siglos, hasta que cinco maestros demostraron simultáneamente cinco explicaciones incompatibles sobre la naturaleza del poder.",
        "La discusión se convirtió en cisma. El cisma, en guerra. Cada fundador abandonó Aster con sus discípulos y convirtió su interpretación en una doctrina completa. De aquella fractura surgieron Aurea, Viridia, Cineria, Nadir y Oneiria. Desde entonces, todo Arconte manifiesta afinidad con una de esas cinco corrientes, aunque nadie sabe si las Escuelas descubrieron las divisiones de la magia o si las crearon."
      ],
      quote:"«Cinco maestros entraron en la cámara. Ninguno salió creyendo en el mismo universo.» — Anales prohibidos de Aster"
    },
    {
      id:"war",
      mark:"IV",
      title:"La Guerra de los Cien Sellos",
      subtitle:"La edad en que los Arcontes intentaron convertirse en dioses.",
      text:[
        "La expansión de los dominios hizo inevitable el conflicto. Los territorios con alta densidad arcana se volvieron más valiosos que el oro, y las fronteras comenzaron a desplazarse al ritmo de conjuros, asedios y pactos rotos. Los mayores Arcontes desarrollaron Sellos Mayores, rituales capaces de alterar leyes fundamentales dentro de un territorio.",
        "Cuando se activó el centésimo sello, la realidad cedió. Durante nueve días coexistieron versiones contradictorias de las mismas ciudades. Ejércitos enteros regresaron de batallas que todavía no habían ocurrido. El colapso terminó con la desaparición de Aster y con la aparición de las Cicatrices, regiones donde las reglas del mundo siguen siendo inestables.",
        "Tras la guerra se fundó el Pacto de las Cenizas. Ninguna Escuela volvió a aceptar una autoridad única. La política de Arcanum quedó basada en alianzas temporales, rivalidades persistentes y un principio incómodo: ningún Arconte debe acumular poder suficiente para repetir los Cien Sellos."
      ],
      quote:"«Ganamos la guerra. El problema es que ya no existe el mundo por el que empezamos a luchar.» — General Sael, último registro antes de la Caída de Aster"
    },
    {
      id:"now",
      mark:"V",
      title:"La Era de los Dominios",
      subtitle:"Tu época.",
      text:[
        "Siglos después del Pacto, Arcanum vuelve a llenarse de jóvenes Arcontes. Viejas fortalezas despiertan, artefactos desaparecidos reaparecen en mercados y ruinas, y las Cicatrices muestran una actividad que no se registraba desde la Guerra de los Cien Sellos.",
        "Las cinco Escuelas mantienen una paz funcional, pero ninguna confía realmente en las demás. Los dominios compiten por tierras, recursos, conocimiento y prestigio. Los monstruos que habitan más allá de las fronteras civilizadas parecen organizarse. Algunos cronistas sostienen que los nuevos Arcontes no son una generación cualquiera, sino la respuesta de Arcanum a una amenaza todavía desconocida.",
        "Aquí comienza la historia jugable. Cada dominio fundado, guerra declarada, alianza, artefacto recuperado y gran evento puede convertirse en parte de la crónica viva del mundo."
      ],
      quote:"«Las crónicas dejan de estar escritas a partir de aquí.» — Inscripción en la puerta de la Biblioteca Infinita"
    }
  ],
  schools:[
    {key:"ascendant",name:"Aurea",sigil:"✦",creed:"Orden, perfección y dominio de la forma.",body:"Los Arcontes de Aurea creen que la realidad posee una arquitectura ideal y que la magia permite aproximarla a esa perfección. Sus grandes órdenes estudian geometrías sagradas, barreras, luz y transmutaciones de precisión. Para sus detractores, confunden armonía con control. Sus textos más radicales hablan de una futura ‘Última Forma’, un estado en el que todo azar desaparecería del mundo."},
    {key:"verdant",name:"Viridia",sigil:"❧",creed:"La vida no se gobierna: se cultiva.",body:"Viridia entiende el poder como un ecosistema. Sus Arcontes fortalecen tierras, aceleran ciclos naturales y crean simbiosis entre dominio y habitantes. No veneran necesariamente a la naturaleza: la consideran una inteligencia distribuida. Existen círculos de Viridia que sospechan que Arcanum está vivo y que los Arcontes son parte de su sistema inmunitario."},
    {key:"eradication",name:"Cineria",sigil:"◆",creed:"Todo obstáculo tiene un punto de ruptura.",body:"Cineria surgió de quienes veían la destrucción como una herramienta de verdad. El fuego, la fuerza y la desintegración eliminan lo superfluo hasta dejar solo aquello capaz de resistir. Sus legiones produjeron algunos de los mayores conquistadores de la historia. La Escuela insiste en que destruir no es odiar: es decidir qué merece permanecer."},
    {key:"abyssal",name:"Nadir",sigil:"◉",creed:"El poder vive también en aquello que el mundo teme mirar.",body:"Los Arcontes de Nadir estudian vacíos, pactos, muerte, corrupción y entidades exteriores. Sus archivos están llenos de advertencias escritas por sus propios maestros. El principio central de la Escuela sostiene que prohibir un conocimiento no hace que deje de existir, solo garantiza que lo encuentre primero alguien menos preparado. Algunos artefactos de Nadir parecen recordar propietarios anteriores."},
    {key:"phantasm",name:"Oneiria",sigil:"◇",creed:"La percepción es la frontera más vulnerable de la realidad.",body:"Los Arcontes de Oneiria dominan ilusión, mente, secreto, sueño y desplazamiento. Sus Arcontes afirman que toda experiencia del mundo llega filtrada por la conciencia y que, por tanto, controlar la percepción equivale a intervenir la realidad. Sus monasterios conservan mapas de lugares que solo existen mientras alguien sueña con ellos."}
  ],
  factions:[
    ["El Pacto de las Cenizas","La red diplomática que impide una nueva guerra total. No posee ejército permanente; su poder reside en juramentos arcanos capaces de castigar a quienes rompen determinados tratados."],
    ["La Biblioteca Infinita","Un archivo neutral construido alrededor de una anomalía espacial. Sus corredores contienen más salas por dentro que volumen existe por fuera. Nadie ha encontrado el último estante."],
    ["Los Cartógrafos del Umbral","Exploradores que estudian Cicatrices, portales y territorios alterados. Sus mapas envejecen mal porque algunos lugares cambian cuando dejan de ser observados."],
    ["La Corte sin Rostro","Una red atribuida a Oneiria, aunque esa Escuela niega dirigirla. Compra secretos, identidades y recuerdos. Se dice que algunos de sus agentes no saben que trabajan para ella."],
    ["Custodios del Último Sello","Orden interescuelas fundada tras la guerra. Su misión es localizar rituales comparables a los Cien Sellos y destruirlos antes de que puedan completarse."]
  ],
  mysteries:[
    ["¿Qué ocurrió realmente con Aster?","La versión oficial afirma que la ciudad fue destruida. Sin embargo, expediciones recientes han escuchado campanas bajo la zona donde estuvo su capital."],
    ["El Sexto Patrón","En excavaciones muy anteriores al Cónclave aparecen símbolos que no corresponden a ninguna de las Cinco Escuelas. Los académicos los consideran errores de clasificación. Otros no."],
    ["Los Arcontes sin nacimiento","Algunos registros históricos describen personajes importantes sin infancia, familia ni primer testimonio. Simplemente aparecen un día, ya adultos, con recuerdos coherentes."],
    ["La Luna Negra","No existe en el cielo, pero aparece en pinturas de culturas separadas por miles de años. Siempre está representada justo antes de una gran catástrofe."],
    ["El Nombre de Arcanum","Ningún texto explica quién dio nombre al mundo. En lenguas arcaicas distintas, ‘Arcanum’ aparece con exactamente la misma pronunciación."]
  ]
};

function renderLore(){
  const host=document.querySelector("#view-host");
  if(!host)return;
  host.innerHTML=`
    <div class="lore-shell">
      <section class="lore-hero">
        <span class="section-kicker">ARCHIVOS DE LA BIBLIOTECA INFINITA</span>
        <h2>Crónica de Arcanum</h2>
        <p>Historia, doctrinas y secretos de un mundo construido por Arcontes. Algunas entradas son conocimiento público. Otras quizá deberían haber permanecido selladas.</p>
        <div class="lore-seal">A</div>
      </section>
      <nav class="lore-tabs" aria-label="Capítulos del lore">
        <button class="active" data-lore-tab="chronicle">CRÓNICA</button>
        <button data-lore-tab="schools">LAS CINCO ESCUELAS</button>
        <button data-lore-tab="factions">ÓRDENES Y FACCIONES</button>
        <button data-lore-tab="mysteries">MISTERIOS</button>
      </nav>
      <div id="lore-content"></div>
    </div>`;
  host.querySelectorAll("[data-lore-tab]").forEach(btn=>btn.addEventListener("click",()=>{
    host.querySelectorAll("[data-lore-tab]").forEach(b=>b.classList.toggle("active",b===btn));
    renderLoreChapter(btn.dataset.loreTab);
  }));
  renderLoreChapter("chronicle");
}

function renderLoreChapter(tab){
  const box=document.querySelector("#lore-content");
  if(!box)return;
  if(tab==="chronicle"){
    box.innerHTML=`<div class="lore-timeline">${ARCANUM_LORE.eras.map((era,i)=>`
      <article class="lore-era">
        <div class="lore-era-mark"><b>${era.mark}</b><span>${String(i+1).padStart(2,"0")}</span></div>
        <div class="lore-era-body">
          <span class="lore-overline">ERA ${era.mark}</span>
          <h3>${era.title}</h3>
          <h4>${era.subtitle}</h4>
          ${era.text.map(p=>`<p>${p}</p>`).join("")}
          <blockquote>${era.quote}</blockquote>
        </div>
      </article>`).join("")}</div>`;
  } else if(tab==="schools"){
    box.innerHTML=`<div class="lore-school-grid">${ARCANUM_LORE.schools.map(s=>`
      <article class="lore-school ${s.key}">
        <div class="lore-school-sigil">${s.sigil}</div>
        <span class="lore-overline">DOCTRINA ARCANA</span>
        <h3>${s.name}</h3>
        <strong>${s.creed}</strong>
        <p>${s.body}</p>
      </article>`).join("")}</div>`;
  } else if(tab==="factions"){
    box.innerHTML=`<div class="lore-card-list">${ARCANUM_LORE.factions.map((f,i)=>`
      <article class="lore-index-card"><span>${String(i+1).padStart(2,"0")}</span><div><h3>${f[0]}</h3><p>${f[1]}</p></div></article>`).join("")}</div>`;
  } else {
    box.innerHTML=`<div class="lore-warning">EXPEDIENTES INCOMPLETOS · La Biblioteca no garantiza que estas anotaciones sean seguras, verdaderas o mutuamente compatibles.</div>
    <div class="lore-card-list mysteries">${ARCANUM_LORE.mysteries.map((m,i)=>`
      <article class="lore-index-card"><span>?</span><div><h3>${m[0]}</h3><p>${m[1]}</p></div></article>`).join("")}</div>`;
  }
}
