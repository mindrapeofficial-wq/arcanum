const FRONTLINE_DATA = {
  campaign: {
    id:"fall-weiss-1939",
    chapter:"CAPÍTULO I",
    title:"POLONIA 1939",
    operation:"FALL WEISS",
    subtitle:"Heeresgruppe Süd · Heer",
    commander:"Generaloberst Gerd von Rundstedt",
    chiefOfStaff:"Generalmajor Erich von Manstein",
    start:"1 SEP 1939 · 04:30",
    theater:"Silesia y frontera sur de Polonia",
    mode:"HISTÓRICO · TIERRA",
    context:[
      "El 23 de agosto de 1939 Alemania y la Unión Soviética firmaron el pacto germano-soviético. Un protocolo secreto contemplaba la partición de Polonia en esferas de influencia.",
      "En la madrugada del 1 de septiembre de 1939 Alemania invadió Polonia. El ataque inició la guerra en Europa.",
      "Heeresgruppe Süd, al mando de Gerd von Rundstedt, agrupaba a los ejércitos 8.º, 10.º y 14.º. El esfuerzo principal debía avanzar desde Silesia hacia el interior de Polonia.",
      "Este capítulo separa los hechos documentados de las decisiones contrafactuales del jugador."
    ]
  },

  resources:{
    command:8,
    communications:76,
    logistics:78,
    fuel:82,
    ammunition:86,
    reserves:74,
    morale:81,
    intelligence:64
  },

  formations:[
    {id:"8A",name:"8. Armee",commander:"General Johannes Blaskowitz",sector:"Ala izquierda · Silesia central",status:"Avance iniciado",readiness:86,supply:84,certainty:"confirmado"},
    {id:"10A",name:"10. Armee",commander:"General Walther von Reichenau",sector:"Centro · esfuerzo principal",status:"Concentración móvil principal",readiness:91,supply:88,certainty:"confirmado"},
    {id:"14A",name:"14. Armee",commander:"General Wilhelm List",sector:"Ala derecha · Silesia/área eslovaca",status:"Avance iniciado",readiness:84,supply:82,certainty:"confirmado"},
    {id:"reserve",name:"Reserva de Heeresgruppe Süd",commander:"Estado Mayor del Grupo de Ejércitos",sector:"Retaguardia operacional",status:"Disponible parcialmente",readiness:88,supply:90,certainty:"confirmado"}
  ],

  map:[
    {id:"breslau",name:"BRESLAU",x:190,y:150,state:"hq",intel:"CUARTEL GENERAL"},
    {id:"oppeln",name:"OPPELN",x:260,y:245,state:"german",intel:"8./10. ARMEE"},
    {id:"czest",name:"CZĘSTOCHOWA",x:385,y:245,state:"contact",intel:"CONTACTO"},
    {id:"katowice",name:"KATOWICE",x:305,y:365,state:"german",intel:"EJE DE AVANCE"},
    {id:"krakow",name:"KRAKÓW",x:455,y:420,state:"unknown",intel:"OBJETIVO OPERACIONAL"},
    {id:"lodz",name:"ŁÓDŹ",x:520,y:220,state:"unknown",intel:"INFORMACIÓN PARCIAL"},
    {id:"kielce",name:"KIELCE",x:555,y:350,state:"unknown",intel:"INFORMACIÓN PARCIAL"},
    {id:"warsaw",name:"VARSOVIA",x:700,y:205,state:"unknown",intel:"OBJETIVO ESTRATÉGICO"},
    {id:"radom",name:"RADOM",x:650,y:330,state:"unknown",intel:"INFORMACIÓN PARCIAL"}
  ],

  links:[
    ["breslau","oppeln"],["oppeln","czest"],["oppeln","katowice"],["czest","lodz"],
    ["katowice","krakow"],["czest","kielce"],["lodz","warsaw"],["kielce","radom"],["radom","warsaw"]
  ],

  staff:[
    {id:"manstein",rank:"Generalmajor",name:"Erich von Manstein",role:"Jefe de Estado Mayor",historical:true,trust:78,note:"Coordina el cuadro operacional del Grupo de Ejércitos y exige que el esfuerzo principal conserve concentración y libertad de maniobra."},
    {id:"blumentritt",rank:"Oberst",name:"Günther Blumentritt",role:"Operaciones",historical:true,trust:74,note:"Mantiene el seguimiento de los ejércitos subordinados y el ritmo de avance previsto por Fall Weiss."},
    {id:"signals",rank:"Hauptmann",name:"Friedrich Keller",role:"Enlace y transmisiones",historical:false,trust:65,note:"Personaje ficticio. Informa de congestión, retrasos de mensajeros y fiabilidad de las comunicaciones de campaña."},
    {id:"quartermaster",rank:"Major",name:"Otto Reinhardt",role:"Intendencia",historical:false,trust:68,note:"Personaje ficticio. Supervisa combustible, munición, transporte y capacidad de reabastecimiento."}
  ],

  scenes:{
    opening:{
      id:"opening",
      time:"04:30",
      date:"1 SEP 1939",
      urgency:"ORDEN DE OPERACIONES",
      from:"Cuartel General · Heeresgruppe Süd",
      title:"Fall Weiss entra en ejecución",
      classification:"HECHO HISTÓRICO + DECISIÓN DEL JUGADOR",
      body:[
        "Las unidades de Heeresgruppe Süd han comenzado a cruzar la frontera. El plan exige velocidad, concentración y una ruptura profunda desde Silesia, mientras los ejércitos de las alas protegen los flancos del esfuerzo principal.",
        "Como comandante del Grupo de Ejércitos, no diriges cada compañía. Tu trabajo es decidir prioridades, conservar reservas, resolver fricciones entre ejércitos y mantener el sistema logístico que permite que la operación continúe.",
        "Los primeros informes aún son incompletos. El mapa de situación representa únicamente la información que ha llegado al puesto de mando."
      ],
      historical:[
        "Alemania invadió Polonia el 1 de septiembre de 1939, iniciando la Segunda Guerra Mundial en Europa.",
        "Heeresgruppe Süd estaba bajo Gerd von Rundstedt y comprendía los ejércitos 8.º, 10.º y 14.º.",
        "El esfuerzo principal del grupo meridional recaía en el sector central, con un avance desde Silesia hacia el interior de Polonia."
      ],
      choices:[
        {id:"center_mass",title:"CONCENTRAR EL ESFUERZO EN EL 10.º EJÉRCITO",tag:"CONCENTRACIÓN",desc:"Dar prioridad de carreteras, combustible y enlaces al eje principal de Reichenau.",effects:{command:-1,fuel:-5,logistics:-3,reserves:-4,morale:+2},next:"first_reports",result:"El Estado Mayor prioriza el eje central. La punta de lanza gana impulso, pero las alas dispondrán de menos margen si la resistencia obliga a improvisar."},
        {id:"balanced_wings",title:"MANTENER EQUILIBRIO ENTRE LOS TRES EJÉRCITOS",tag:"PRUDENTE",desc:"Evitar que el esfuerzo principal absorba demasiada logística y conservar cohesión en las alas.",effects:{command:-1,logistics:+3,reserves:+2,fuel:-2},next:"first_reports",result:"El avance queda más equilibrado. Pierdes algo de velocidad potencial en el centro, pero reduces el riesgo de que una fricción local desordene al conjunto."},
        {id:"reserve_first",title:"PROTEGER LA RESERVA OPERACIONAL",tag:"CONSERVADOR",desc:"Limitar compromisos iniciales y mantener fuerzas disponibles para responder a una reacción polaca inesperada.",effects:{command:-1,reserves:+7,morale:-1,intelligence:+2},next:"first_reports",result:"La reserva queda protegida. Tus subordinados reciben menos apoyo inmediato, a cambio de conservar una herramienta para reaccionar cuando el cuadro sea más claro."}
      ]
    },

    first_reports:{
      id:"first_reports",
      time:"12:20",
      date:"1 SEP 1939",
      urgency:"PARTE DE SITUACIÓN",
      from:"Sección de Operaciones",
      title:"Velocidad contra fricción",
      classification:"RECONSTRUCCIÓN NARRATIVA SOBRE MARCO HISTÓRICO",
      body:[
        "Los partes de las primeras horas confirman avances en varios sectores, pero también empiezan a aparecer los problemas que no existen sobre un mapa limpio: columnas mezcladas, carreteras saturadas, retrasos en combustible y posiciones polacas que obligan a desplegar antes de lo previsto.",
        "Manstein insiste en que una operación móvil pierde su ventaja cuando los escalones logísticos no pueden seguir a las unidades de cabeza. Blumentritt, por su parte, pide no frenar el esfuerzo principal mientras la iniciativa siga siendo alemana."
      ],
      historical:[
        "La campaña alemana combinó fuerzas blindadas y aéreas con una amplia ofensiva terrestre y avanzó rápidamente desde el norte y desde Silesia y Eslovaquia en el sur.",
        "La rapidez operacional no eliminaba las limitaciones de transporte, abastecimiento, comunicaciones y terreno."
      ],
      choices:[
        {id:"tempo",title:"MANTENER EL TEMPO OPERACIONAL",tag:"AGRESIVO",desc:"Aceptar mayor desgaste logístico para explotar la iniciativa de las primeras horas.",effects:{command:-1,fuel:-7,ammunition:-4,logistics:-6,morale:+3},next:"western_war",result:"El mensaje a los ejércitos es inequívoco: avanzar mientras exista oportunidad. Las columnas de cabeza ganan libertad, pero la retaguardia empieza a trabajar por encima de su margen cómodo."},
        {id:"supply_pause",title:"ORDENAR PAUSAS LOGÍSTICAS ESCALONADAS",tag:"LOGÍSTICA",desc:"Reorganizar convoyes y asegurar que combustible y munición alcancen a los elementos avanzados.",effects:{command:-1,logistics:+8,fuel:+3,ammunition:+3,morale:-1},next:"western_war",result:"Los escalones de suministro recuperan orden. Algunos mandos protestan por la pérdida de impulso, pero el Grupo de Ejércitos reduce el riesgo de una crisis de abastecimiento prematura."},
        {id:"recon_priority",title:"PRIORIZAR RECONOCIMIENTO Y ENLACES",tag:"INFORMACIÓN",desc:"Aumentar el esfuerzo de inteligencia antes de comprometer nuevas reservas.",effects:{command:-2,intelligence:+9,communications:+5,reserves:+2},next:"western_war",result:"Se refuerzan enlaces y reconocimiento. El avance no se detiene, pero las reservas quedan sujetas a confirmación antes de recibir nuevas misiones."}
      ]
    },

    western_war:{
      id:"western_war",
      time:"12:10",
      date:"3 SEP 1939",
      urgency:"CAMBIO ESTRATÉGICO",
      from:"OKH · Comunicación prioritaria",
      title:"Gran Bretaña y Francia entran en guerra",
      classification:"HECHO HISTÓRICO + DECISIÓN DEL JUGADOR",
      body:[
        "Llega la confirmación: Gran Bretaña y Francia han declarado la guerra a Alemania. La campaña polaca continúa, pero el conflicto ya no puede considerarse aislado.",
        "Tu autoridad sigue limitada a Heeresgruppe Süd. No decides la estrategia occidental, pero sí puedes ajustar cuánto riesgo estás dispuesto a asumir en Polonia ante la posibilidad de nuevas exigencias del Alto Mando."
      ],
      historical:[
        "Gran Bretaña y Francia declararon la guerra a Alemania el 3 de septiembre de 1939, dos días después de la invasión de Polonia.",
        "En los primeros meses, el frente occidental permaneció relativamente limitado mientras la campaña en Polonia continuaba."
      ],
      choices:[
        {id:"accelerate",title:"ACELERAR LA CAMPAÑA EN EL ESTE",tag:"PRESIÓN",desc:"Buscar una conclusión rápida antes de que la situación occidental exija recursos adicionales.",effects:{command:-2,fuel:-6,ammunition:-5,reserves:-5,morale:+2},next:"warsaw",result:"Las órdenes favorecen velocidad y explotación. La presión aumenta sobre logística y reservas, pero el objetivo político-militar es reducir cuanto antes la duración de la campaña."},
        {id:"preserve",title:"CONSERVAR CAPACIDAD OPERACIONAL",tag:"PRUDENTE",desc:"Evitar que la campaña consuma las reservas y el material que podrían ser necesarios después.",effects:{command:-1,reserves:+6,logistics:+4,morale:-1},next:"warsaw",result:"El Grupo de Ejércitos recibe una directiva más contenida. Se exige avanzar, pero sin gastar reservas por objetivos locales que no cambien la situación operacional."},
        {id:"intel_west",title:"SOLICITAR UNA VALORACIÓN DEL FRENTE OCCIDENTAL",tag:"ESTADO MAYOR",desc:"Pedir al OKH mayor claridad antes de modificar el ritmo de la campaña.",effects:{command:-1,intelligence:+5,communications:+3},next:"warsaw",result:"Tu Estado Mayor eleva la petición. No obtienes control sobre el oeste, pero reduces parte de la incertidumbre estratégica antes de comprometer la reserva."}
      ]
    },

    warsaw:{
      id:"warsaw",
      time:"20:30",
      date:"8 SEP 1939",
      urgency:"INFORME DEL 10.º EJÉRCITO",
      from:"10. Armee · Canal operacional",
      title:"Las avanzadas alcanzan Varsovia",
      classification:"HECHO HISTÓRICO + DECISIÓN DEL JUGADOR",
      body:[
        "Las fuerzas blindadas del 10.º Ejército han alcanzado los accesos de Varsovia. Los primeros intentos de penetrar directamente encuentran una defensa mucho más firme de lo esperado.",
        "El avance de los últimos días ha sido extraordinariamente rápido, pero la ciudad transforma el problema: entrar inmediatamente, preparar un cerco o proteger antes los flancos frente a fuerzas polacas todavía activas."
      ],
      historical:[
        "El 8 de septiembre unidades blindadas alemanas alcanzaron las afueras de Varsovia.",
        "Los ataques alemanes de los días 8 y 9 encontraron una resistencia polaca fuerte y fueron rechazados."
      ],
      choices:[
        {id:"assault",title:"INSISTIR EN EL ASALTO INMEDIATO",tag:"ALTO RIESGO",desc:"Buscar una ruptura rápida antes de que la defensa de la capital pueda consolidarse.",effects:{command:-2,ammunition:-9,fuel:-5,morale:-3,reserves:-4},next:"soviet_entry",result:"Autorizas una postura agresiva. La posibilidad de un resultado rápido existe, pero la defensa urbana y antitanque puede convertir la velocidad en pérdidas sin una preparación suficiente."},
        {id:"encircle",title:"PREPARAR CERCO Y APOYO DE FUEGOS",tag:"METÓDICO",desc:"Evitar un asalto precipitado y organizar artillería, abastecimiento y aislamiento de la capital.",effects:{command:-1,ammunition:-4,logistics:+3,reserves:+2,intelligence:+3},next:"soviet_entry",result:"Se ordena contener y preparar. El ritmo visual del avance disminuye, pero las unidades ganan tiempo para reorganizar apoyo y abastecimiento."},
        {id:"flank_security",title:"PRIORIZAR LOS FLANCOS DEL 10.º EJÉRCITO",tag:"OPERACIONAL",desc:"No permitir que la atracción de Varsovia deje expuesta la maniobra del Grupo de Ejércitos.",effects:{command:-1,reserves:-2,intelligence:+4,communications:+3},next:"soviet_entry",result:"La capital deja de ser el único centro de gravedad. Parte de la atención vuelve a las fuerzas polacas que aún pueden amenazar las líneas de avance."}
      ]
    },

    soviet_entry:{
      id:"soviet_entry",
      time:"09:30",
      date:"17 SEP 1939",
      urgency:"NUEVA SITUACIÓN ESTRATÉGICA",
      from:"OKH · Parte de situación",
      title:"La Unión Soviética entra en Polonia",
      classification:"HECHO HISTÓRICO + DECISIÓN DEL JUGADOR",
      body:[
        "Fuerzas soviéticas han cruzado la frontera oriental de Polonia. La campaña entra en una nueva fase política y militar.",
        "El Alto Mando transmite nuevas delimitaciones y exige disciplina en los movimientos hacia el este. Para tu Grupo de Ejércitos el problema inmediato es terminar las operaciones pendientes sin generar fricción innecesaria en las zonas de contacto."
      ],
      historical:[
        "La Unión Soviética invadió el este de Polonia el 17 de septiembre de 1939.",
        "La acción se produjo dentro del marco del protocolo secreto del pacto germano-soviético, que había definido esferas de influencia en Europa oriental."
      ],
      choices:[
        {id:"strict_boundaries",title:"IMPONER LÍMITES DE OPERACIONES ESTRICTOS",tag:"CONTROL",desc:"Evitar movimientos ambiguos y concentrar al Grupo de Ejércitos en los objetivos asignados.",effects:{command:-1,communications:+5,logistics:+2,morale:-1},next:"chapter_end",result:"Las órdenes de delimitación se repiten a los ejércitos. La claridad reduce el riesgo de incidentes, aunque limita la libertad táctica de algunas formaciones."},
        {id:"finish_pockets",title:"PRIORIZAR BOLSAS DE RESISTENCIA",tag:"OPERACIONAL",desc:"Concentrar el esfuerzo en terminar combates pendientes antes de reorganizar el dispositivo.",effects:{command:-1,ammunition:-4,fuel:-3,reserves:-3},next:"chapter_end",result:"El Grupo de Ejércitos mantiene la presión sobre focos de resistencia. La campaña consume algunos recursos adicionales antes de iniciar la reorganización."},
        {id:"reorganize",title:"EMPEZAR LA REORGANIZACIÓN DE POSGUERRA",tag:"LOGÍSTICA",desc:"Preparar descanso, mantenimiento, inventario y redistribución de las unidades que ya no están comprometidas.",effects:{command:-1,logistics:+6,fuel:+4,reserves:+4,morale:+2},next:"chapter_end",result:"La retaguardia empieza a ordenar el caos acumulado por semanas de movimiento. La prioridad pasa gradualmente de avanzar a recuperar capacidad operacional."}
      ]
    },

    chapter_end:{
      id:"chapter_end",
      time:"18:00",
      date:"6 OCT 1939",
      urgency:"CIERRE DE CAPÍTULO",
      from:"Archivo de Campaña",
      title:"Polonia: balance de la primera campaña",
      classification:"HECHO HISTÓRICO + BALANCE DEL JUGADOR",
      body:[
        "La campaña principal ha terminado. Varsovia capituló a finales de septiembre y la última gran formación operacional polaca se rindió el 6 de octubre.",
        "El resultado histórico de la campaña no borra sus consecuencias: Polonia fue ocupada y dividida, y comenzó una guerra europea que crecería hasta convertirse en un conflicto mundial.",
        "Tus decisiones no sustituyen la historia documentada. El juego registra cómo administraste mando, logística, reservas e información dentro de ese marco y utilizará ese perfil en los capítulos siguientes."
      ],
      historical:[
        "Varsovia se rindió a finales de septiembre de 1939 tras bombardeos y combates intensos.",
        "La última unidad operacional polaca se rindió el 6 de octubre de 1939.",
        "Alemania y la Unión Soviética dividieron el territorio polaco conforme a los acuerdos secretos vinculados al pacto de no agresión."
      ],
      choices:[]
    }
  },

  sources:[
    {short:"USHMM · Invasión de Polonia",title:"Invasión de Polonia, otoño de 1939",publisher:"United States Holocaust Memorial Museum",url:"https://encyclopedia.ushmm.org/content/es/article/invasion-of-poland-fall-1939"},
    {short:"USHMM · Pacto germano-soviético",title:"Pacto Alemán-Soviético",publisher:"United States Holocaust Memorial Museum",url:"https://encyclopedia.ushmm.org/content/es/article/german-soviet-pact"},
    {short:"U.S. Army · European War Review",title:"The European War · Military Review, December 1939",publisher:"U.S. Army",url:"https://www.armyupress.army.mil/Portals/7/online-publications/documents/the-european-war-military-review-december-1939.pdf"},
    {short:"NBP · September 1939",title:"September 1939 – Warszawa, Wieluń, Westerplatte",publisher:"Narodowy Bank Polski",url:"https://nbp.pl/wp-content/uploads/2022/11/2009_10___wrzesien_1939_en.pdf"}
  ]
};