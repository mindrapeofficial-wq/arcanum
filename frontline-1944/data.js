const FRONTLINE_DATA = {
  campaign: {
    id: "normandy-1944",
    title: "NORMANDÍA 1944",
    subtitle: "LXXXIV Armeekorps · Heer",
    commander: "General der Artillerie Erich Marcks",
    start: "6 JUN 1944 · 03:40",
    theater: "Francia ocupada · Normandía",
    mode: "HISTÓRICO · TIERRA"
  },

  resources: {
    command: 7,
    communications: 74,
    logistics: 68,
    fuel: 61,
    ammunition: 72,
    reserves: 63,
    morale: 67,
    intelligence: 41
  },

  formations: [
    { id:"709", name:"709. Infanterie-Division", sector:"Cotentin oriental", status:"En posiciones costeras", readiness:66, supply:62, certainty:"confirmado" },
    { id:"243", name:"243. Infanterie-Division", sector:"Cotentin occidental", status:"Reserva territorial", readiness:58, supply:64, certainty:"confirmado" },
    { id:"91", name:"91. Luftlande-Infanterie-Division", sector:"Carentan · Valognes", status:"Movilidad limitada", readiness:71, supply:69, certainty:"confirmado" },
    { id:"352", name:"352. Infanterie-Division", sector:"Bayeux · litoral occidental", status:"En alerta", readiness:77, supply:74, certainty:"confirmado" },
    { id:"716", name:"716. Infanterie-Division", sector:"Caen · litoral oriental", status:"En alerta", readiness:63, supply:61, certainty:"confirmado" },
    { id:"915", name:"Grenadier-Regiment 915", sector:"Reserva del cuerpo", status:"Disponible para orden inmediata", readiness:82, supply:76, certainty:"confirmado" }
  ],

  map: [
    { id:"cherbourg", name:"CHERBOURG", x:160, y:90, state:"german", intel:"quiet" },
    { id:"valognes", name:"VALOGNES", x:180, y:185, state:"german", intel:"uncertain" },
    { id:"sme", name:"STE-MÈRE-ÉGLISE", x:260, y:235, state:"contact", intel:"airborne" },
    { id:"carentan", name:"CARENTAN", x:315, y:315, state:"german", intel:"critical" },
    { id:"omaha", name:"OMAHA", x:425, y:250, state:"unknown", intel:"coastal" },
    { id:"bayeux", name:"BAYEUX", x:500, y:305, state:"german", intel:"uncertain" },
    { id:"saintlo", name:"ST-LÔ", x:420, y:420, state:"hq", intel:"hq" },
    { id:"caen", name:"CAEN", x:680, y:300, state:"contact", intel:"airborne" }
  ],

  links: [
    ["cherbourg","valognes"],["valognes","sme"],["sme","carentan"],["carentan","saintlo"],
    ["carentan","omaha"],["omaha","bayeux"],["bayeux","saintlo"],["bayeux","caen"],["saintlo","caen"]
  ],

  staff: [
    { id:"ops", rank:"Oberst i.G.", name:"Hans Keller", role:"Ia · Operaciones", fictional:true, trust:72, note:"Metódico. Prefiere conservar una reserva central hasta que el cuadro sea más claro." },
    { id:"intel", rank:"Major i.G.", name:"Walter Brenner", role:"Ic · Inteligencia", fictional:true, trust:66, note:"Insiste en que los informes aerotransportados no permiten todavía medir el tamaño del desembarco." },
    { id:"log", rank:"Oberstleutnant", name:"Otto Reimann", role:"Qu · Intendencia", fictional:true, trust:69, note:"Advierte que mover fuerzas de noche por carreteras saturadas puede romper el calendario logístico." }
  ],

  scenes: {
    airborne_reports: {
      id:"airborne_reports",
      time:"03:40",
      date:"6 JUN 1944",
      urgency:"PRIORIDAD MÁXIMA",
      from:"Sección de Operaciones · LXXXIV Armeekorps",
      title:"Paracaidistas sobre Normandía",
      classification:"HECHO HISTÓRICO + DECISIÓN DEL JUGADOR",
      body:[
        "Durante las últimas horas han llegado informes de tropas aerotransportadas aliadas en varios puntos de Normandía. Los partes son fragmentarios y algunos se contradicen.",
        "El cuadro que está tomando forma señala dos focos importantes: el área de Caen y el entorno de Sainte-Mère-Église. El mando del cuerpo debe decidir ahora qué hacer con su reserva inmediata.",
        "El Grenadier-Regiment 915 permanece disponible. Una orden prematura puede dejar otro sector sin reserva; esperar demasiado puede permitir que las fuerzas aerotransportadas consoliden sus posiciones."
      ],
      historical:[
        "A las 01:30 del 6 de junio, el Séptimo Ejército recibió del LXXXIV Cuerpo informes de desembarcos aerotransportados.",
        "Hacia las 02:30 el Séptimo Ejército situó los focos principales en la desembocadura del Orne y en el sector de Sainte-Mère-Église.",
        "A las 04:00 Marcks confirmó la impresión de que los focos estaban en Caen y Sainte-Mère-Église y comunicó el empleo de la reserva del cuerpo hacia Carentan."
      ],
      choices:[
        {
          id:"historical_carentan",
          title:"ENVIAR EL 915.º HACIA CARENTAN",
          tag:"CURSO HISTÓRICO",
          desc:"Concentrar la reserva en el nudo de comunicaciones de Carentan.",
          effects:{ command:-1,reserves:-18,communications:-2,intelligence:+3 },
          next:"naval_reports",
          result:"La orden sale por radio y teléfono. El 915.º inicia su movimiento hacia Carentan. El cuerpo gana una respuesta inmediata en el Cotentin, pero pierde parte de su reserva flexible."
        },
        {
          id:"hold_reserve",
          title:"MANTENER LA RESERVA EN EL CENTRO",
          tag:"DIVERGENCIA",
          desc:"Esperar confirmación de desembarcos anfibios antes de comprometer el regimiento.",
          effects:{ command:-1,reserves:+7,intelligence:+1,morale:-1 },
          next:"naval_reports",
          result:"La reserva permanece concentrada. Ganas libertad de maniobra, aunque los mandos del norte reciben la noticia con inquietud y piden una decisión rápida."
        },
        {
          id:"split_reserve",
          title:"DIVIDIR LA RESERVA",
          tag:"DIVERGENCIA",
          desc:"Enviar una parte a Carentan y mantener otra hacia Bayeux.",
          effects:{ command:-2,reserves:-9,communications:-6,logistics:-4,intelligence:+2 },
          next:"naval_reports",
          result:"La reserva se divide. Cubres más direcciones, pero introduces fricción de mando y complicas el abastecimiento nocturno."
        }
      ]
    },

    naval_reports: {
      id:"naval_reports",
      time:"04:50",
      date:"6 JUN 1944",
      urgency:"URGENTE",
      from:"Ic · Inteligencia del Cuerpo",
      title:"Movimiento naval frente a la costa",
      classification:"HECHO HISTÓRICO + RECONSTRUCCIÓN NARRATIVA",
      body:[
        "Las estaciones costeras han comunicado tráfico marítimo al este de Cherbourg y al norte de Caen. No existe todavía una imagen completa del tamaño de la operación.",
        "Los enlaces telefónicos con varias posiciones costeras son irregulares. La aviación aliada dificulta el movimiento y la observación. El Estado Mayor solicita una directiva general antes del amanecer."
      ],
      historical:[
        "Fuentes alemanas resumidas por el U.S. Army Center of Military History registran informes de movimiento marítimo hacia las 02:50 al este de Cherbourg y al norte de Caen.",
        "La información que llegaba a los mandos alemanes durante las primeras horas era incompleta y contenía informes erróneos."
      ],
      choices:[
        {
          id:"full_alert",
          title:"ALERTA MÁXIMA EN TODO EL CUERPO",
          tag:"AGRESIVO",
          desc:"Elevar preparación y mover enlaces de mando a puestos avanzados.",
          effects:{ command:-2,communications:+4,ammunition:-3,morale:+3,logistics:-3 },
          next:"landings",
          result:"Las divisiones reciben orden de máxima alerta. Aumenta la preparación, pero el tráfico de órdenes y movimientos empieza a cargar la red de comunicaciones."
        },
        {
          id:"protect_network",
          title:"PRIORIZAR COMUNICACIONES Y LOGÍSTICA",
          tag:"PRUDENTE",
          desc:"Mantener reservas y asegurar carreteras, teléfonos y centros de abastecimiento.",
          effects:{ command:-1,communications:+9,logistics:+7,reserves:+3,morale:-1 },
          next:"landings",
          result:"El cuerpo refuerza enlaces y circulación logística. La estructura de mando mejora, aunque algunos comandantes costeros consideran que la respuesta es demasiado contenida."
        },
        {
          id:"request_panzer",
          title:"SOLICITAR RESERVAS BLINDADAS",
          tag:"ESCALADA",
          desc:"Elevar al mando superior una petición inmediata de fuerzas móviles.",
          effects:{ command:-2,intelligence:+2,reserves:+2,communications:-2 },
          next:"landings",
          result:"La petición sube por la cadena de mando. No controlas cuándo, ni si, las reservas blindadas serán liberadas. Has empleado tiempo y capital de mando en forzar la cuestión."
        }
      ]
    },

    landings: {
      id:"landings",
      time:"06:35",
      date:"6 JUN 1944",
      urgency:"ALARMA GENERAL",
      from:"Red de puestos costeros",
      title:"Desembarcos anfibios confirmados",
      classification:"HECHO HISTÓRICO + DECISIÓN DEL JUGADOR",
      body:[
        "Ya no hay duda: fuerzas aliadas están desembarcando en varios puntos de la costa. El bombardeo naval y aéreo dificulta una evaluación limpia.",
        "Tu Estado Mayor necesita una prioridad operacional. No dispones de una imagen completa de la magnitud de cada desembarco y no puedes reforzar todos los sectores a la vez."
      ],
      historical:[
        "Las fuerzas estadounidenses comenzaron sus asaltos anfibios en Normandía a las 06:30.",
        "La invasión combinó desembarcos anfibios, fuerzas aerotransportadas y un enorme esfuerzo naval y aéreo aliado."
      ],
      choices:[
        {
          id:"cotentin_priority",
          title:"PRIORIDAD: COTENTIN Y CARENTAN",
          tag:"OPERACIONAL",
          desc:"Evitar que se corte la península y proteger las comunicaciones hacia Cherbourg.",
          effects:{ command:-2,reserves:-7,fuel:-5,morale:+2 },
          next:"demo_end",
          result:"El esfuerzo principal se desplaza hacia el Cotentin. El resto del frente tendrá que ganar tiempo con sus propios medios."
        },
        {
          id:"caen_priority",
          title:"PRIORIDAD: EJE CAEN-BAYEUX",
          tag:"OPERACIONAL",
          desc:"Concentrar recursos sobre el sector oriental y proteger el acceso al interior.",
          effects:{ command:-2,reserves:-8,fuel:-7,ammunition:-4 },
          next:"demo_end",
          result:"El cuerpo orienta reservas y munición hacia el este. El Cotentin queda más expuesto a una evolución rápida de la situación."
        },
        {
          id:"elastic_defense",
          title:"DEFENSA ELÁSTICA Y RESERVA CENTRAL",
          tag:"CONSERVADOR",
          desc:"Evitar comprometer todo el cuerpo antes de identificar el esfuerzo principal aliado.",
          effects:{ command:-1,reserves:+5,morale:-2,intelligence:+3 },
          next:"demo_end",
          result:"Ordenas contener, informar y conservar capacidad de reacción. El riesgo es conceder espacio antes de comprender dónde se producirá la ruptura."
        }
      ]
    },

    demo_end: {
      id:"demo_end",
      time:"07:10",
      date:"6 JUN 1944",
      urgency:"FIN DEL PRIMER PROTOTIPO",
      from:"Estado Mayor",
      title:"La batalla apenas comienza",
      classification:"PROTOTIPO",
      body:[
        "Tus primeras órdenes ya han alterado la disponibilidad de reservas, la red de comunicaciones y la situación logística.",
        "La versión siguiente convertirá estas decisiones en una campaña continua: informes de subordinados, órdenes superiores, fuerzas con organización histórica, pérdidas, consumo realista, comunicaciones imperfectas y consecuencias que pueden aparecer horas o días después."
      ],
      historical:[
        "A partir de este punto el prototipo detiene deliberadamente la cronología para no presentar como verificados acontecimientos que todavía no se han documentado dentro del sistema de fuentes del juego."
      ],
      choices:[]
    }
  },

  sources: [
    {
      short:"CMH · Omaha Beachhead",
      title:"Omaha Beachhead, 6 June–13 June 1944",
      publisher:"U.S. Army Center of Military History",
      url:"https://history.army.mil/portals/143/Images/Publications/catalog/100-11-1.pdf"
    },
    {
      short:"CMH · WWII European Theater",
      title:"World War II - European-African-Middle Eastern Theater",
      publisher:"U.S. Army Center of Military History",
      url:"https://history.army.mil/Research/Reference-Topics/Army-Campaigns/Brief-Summaries/World-War-II/World-War-II-European-African-Middle-Eastern-Theater/"
    }
  ]
};