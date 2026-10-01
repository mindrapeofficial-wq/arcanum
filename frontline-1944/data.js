const FRONTLINE_DATA = {
  build: "0.3.0",

  assets: {
    heroPhoto: "https://upload.wikimedia.org/wikipedia/commons/d/df/Bundesarchiv_Bild_101I-012-0035-11A%2C_Polen%2C_Panzer_I_und_Infanterie.jpg",
    campaignMap: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Poland1939_GermanPlanMap.jpg",
    staffPhoto: "https://upload.wikimedia.org/wikipedia/commons/9/99/Bundesarchiv_Bild_101I-001-0256-31%2C_Warschau%2C_Generale_v._Weichs%2C_Blaskowitz.jpg"
  },

  chapters: [
    {id:"ch1",number:"I",year:"1939",title:"FALL WEISS",subtitle:"Polonia",status:"available"},
    {id:"ch2",number:"II",year:"1940",title:"WESERÜBUNG",subtitle:"Dinamarca y Noruega",status:"locked"},
    {id:"ch3",number:"III",year:"1940",title:"FALL GELB",subtitle:"Francia y Países Bajos",status:"locked"},
    {id:"ch4",number:"IV",year:"1941",title:"BARBAROSSA",subtitle:"Unión Soviética",status:"locked"},
    {id:"ch5",number:"V",year:"1942",title:"EL ESTE",subtitle:"Desgaste y profundidad",status:"locked"},
    {id:"ch6",number:"VI",year:"1943",title:"LA INICIATIVA",subtitle:"Defensa y retirada",status:"locked"},
    {id:"ch7",number:"VII",year:"1944",title:"FRONTLINE 1944",subtitle:"Normandía y colapso del frente",status:"locked"}
  ],

  chapter1: {
    title:"CAPÍTULO I · FALL WEISS",
    subtitle:"Polonia · 1 de septiembre de 1939",
    protagonist:"General der Panzertruppe Heinz Guderian",
    command:"XIX. Armeekorps (mot.) · 4. Armee · Heeresgruppe Nord",
    dossier:[
      "Alemania invade Polonia en la madrugada del 1 de septiembre de 1939. El ataque no es una respuesta defensiva: la justificación propagandística alemana se apoya, entre otros elementos, en un ataque fingido contra la emisora de Gleiwitz.",
      "Tu mando es el XIX. Armeekorps motorizado. Su función inicial dentro del 4.º Ejército es contribuir a cortar el Corredor Polaco y avanzar hacia el Vístula.",
      "Bajo el cuerpo se encuentran la 3. Panzer-Division, la 2. Infanterie-Division (mot.) y la 20. Infanterie-Division (mot.). La velocidad importa, pero también el combustible, los puentes, las carreteras, la niebla, el tráfico y la cohesión entre columnas."
    ],
    resources:{
      command:8,
      communications:78,
      fuel:86,
      ammunition:88,
      movement:82,
      cohesion:84,
      reconnaissance:49,
      fatigue:8
    },
    formations:[
      {id:"3pz",name:"3. Panzer-Division",commander:"Generalleutnant Leo Geyr von Schweppenburg",role:"Schwerpunkt blindado",readiness:90,supply:89,position:"Frontera de Pomerania"},
      {id:"2mot",name:"2. Infanterie-Division (mot.)",commander:"Generalleutnant Paul Bader",role:"Infantería motorizada",readiness:86,supply:91,position:"Centro del dispositivo"},
      {id:"20mot",name:"20. Infanterie-Division (mot.)",commander:"Generalleutnant Mauritz von Wiktorin",role:"Ala septentrional",readiness:84,supply:88,position:"Norte del dispositivo"}
    ],
    staff:[
      {id:"ia",rank:"Oberst i.G.",name:"Friedrich Keller",role:"Ia · Operaciones",fictional:true,trust:70,note:"Insiste en preservar el ritmo de marcha y evitar que las columnas se mezclen en los cruces."},
      {id:"ic",rank:"Major i.G.",name:"Ernst Weber",role:"Ic · Inteligencia",fictional:true,trust:65,note:"La información sobre las posiciones polacas al otro lado de la frontera es incompleta y envejece rápido."},
      {id:"qu",rank:"Oberstleutnant",name:"Otto Hartmann",role:"Qu · Logística",fictional:true,trust:72,note:"Advierte que velocidad y combustible no son lo mismo: una columna detenida también consume tiempo y capacidad de transporte."}
    ]
  },

  scenes:{
    briefing:{
      id:"briefing",
      date:"31 AGO 1939",
      time:"23:35",
      urgency:"GEHEIME KOMMANDOSACHE",
      from:"4. Armee · Estado Mayor",
      title:"La orden entra en vigor",
      classification:"HECHO HISTÓRICO + RECONSTRUCCIÓN NARRATIVA",
      body:[
        "Las órdenes están confirmadas. El ataque comenzará a las 04:45. La misión del 4.º Ejército es romper el Corredor Polaco y establecer la conexión operativa hacia Prusia Oriental.",
        "Tu cuerpo motorizado debe mantener velocidad y cohesión. Las carreteras son limitadas y el movimiento simultáneo de blindados, infantería motorizada, artillería y trenes logísticos puede crear sus propios atascos.",
        "No dispones de un mapa omnisciente. Lo que tienes sobre la mesa son partes de reconocimiento, estimaciones y horarios."
      ],
      historical:[
        "Alemania atacó Polonia el 1 de septiembre de 1939, iniciando la Segunda Guerra Mundial en Europa.",
        "El XIX Cuerpo motorizado de Guderian estaba subordinado al 4.º Ejército del Grupo de Ejércitos Norte y participó en el ataque para cortar el Corredor Polaco.",
        "La hora de ataque fijada para el 1 de septiembre fue las 04:45."
      ],
      choices:[
        {id:"forward_hq",title:"PUESTO DE MANDO MUY ADELANTADO",tag:"AGRESIVO",desc:"Seguir de cerca al Schwerpunkt para reducir retrasos de mando.",effects:{command:-1,communications:+4,movement:+2,reconnaissance:+3,fatigue:+5},next:"fog",result:"Trasladas el puesto de mando hacia delante. La imagen táctica llega antes, pero el Estado Mayor queda más expuesto al caos de las columnas y al fuego amigo."},
        {id:"mobile_hq",title:"MANDO MÓVIL ESCALONADO",tag:"EQUILIBRADO",desc:"Mantener un puesto móvil detrás de la vanguardia y enlaces adelantados.",effects:{communications:+2,cohesion:+3,movement:+1,fatigue:+2},next:"fog",result:"El Estado Mayor avanza por saltos. Pierdes algo de inmediatez a cambio de una red de mando más estable."},
        {id:"rear_hq",title:"PUESTO DE MANDO EN RETAGUARDIA",tag:"PRUDENTE",desc:"Priorizar comunicaciones y control de tráfico por encima del contacto directo.",effects:{communications:+6,cohesion:+4,reconnaissance:-3,movement:-2},next:"fog",result:"El mando conserva una red de comunicaciones ordenada, pero los informes de vanguardia tardan más en llegar."}
      ]
    },

    fog:{
      id:"fog",
      date:"1 SEP 1939",
      time:"05:20",
      urgency:"PARTE DE VANGUARDIA",
      from:"3. Panzer-Division",
      title:"Niebla, columnas y fuego propio",
      classification:"HECHO HISTÓRICO + DECISIÓN DEL JUGADOR",
      body:[
        "La madrugada está cubierta de niebla. La vanguardia informa de visibilidad reducida, caminos congestionados y contacto irregular con unidades polacas.",
        "Una batería propia ha abierto fuego demasiado cerca de elementos adelantados. El incidente revela el riesgo de llevar el mando y las columnas más rápidas por delante de la coordinación artillera.",
        "El ritmo de la operación aún no está roto, pero cada parada se propaga hacia atrás por kilómetros de carretera."
      ],
      historical:[
        "Las operaciones comenzaron el 1 de septiembre. Guderian acompañó personalmente a elementos de la 3. Panzer-Division durante el avance inicial.",
        "Relatos posteriores describen un incidente en el que su vehículo quedó bajo fuego de artillería propia en condiciones de niebla.",
        "El XIX Cuerpo estaba compuesto por la 3. Panzer-Division y las 2.ª y 20.ª divisiones de infantería motorizada."
      ],
      choices:[
        {id:"push_armor",title:"MANTENER EL RITMO BLINDADO",tag:"SCHWERPUNKT",desc:"Ordenar a la 3. Panzer-Division que preserve el impulso y resolver los atascos detrás.",effects:{movement:+6,fuel:-7,cohesion:-4,communications:-2,fatigue:+4},next:"chojnice",result:"Los blindados mantienen el ritmo. Ganas tiempo operativo, pero la cola logística se estira y las unidades de apoyo pierden contacto temporalmente."},
        {id:"traffic_control",title:"REORDENAR COLUMNAS",tag:"CONTROL",desc:"Detener brevemente sectores de la marcha para separar artillería, blindados y trenes logísticos.",effects:{movement:-4,cohesion:+8,communications:+4,fuel:-2,fatigue:+1},next:"chojnice",result:"La marcha pierde minutos, pero los itinerarios quedan más limpios. La artillería y el suministro recuperan enlaces con las formaciones de cabeza."},
        {id:"recon_first",title:"RECONOCIMIENTO ANTES DE ACELERAR",tag:"INFORMACIÓN",desc:"Utilizar elementos de reconocimiento para aclarar cruces y resistencia antes de forzar el paso.",effects:{movement:-2,reconnaissance:+9,cohesion:+3,fuel:-3},next:"chojnice",result:"El avance se hace algo más lento, pero la siguiente orden se emitirá con una imagen táctica menos borrosa."}
      ]
    },

    chojnice:{
      id:"chojnice",
      date:"1 SEP 1939",
      time:"09:45",
      urgency:"SITUATIONSMELDUNG",
      from:"Ia · XIX. Armeekorps",
      title:"El corredor empieza a cerrarse",
      classification:"HECHO HISTÓRICO + SIMULACIÓN OPERACIONAL",
      body:[
        "Las columnas avanzan hacia el interior del Corredor Polaco. La resistencia no es uniforme: algunos sectores ceden, otros obligan a desplegar desde la marcha.",
        "Tu problema ya no es únicamente romper la primera línea. Debes impedir que el cuerpo se convierta en tres divisiones avanzando a velocidades distintas y sin una reserva útil.",
        "El objetivo operacional sigue siendo cortar el corredor y alcanzar las líneas del Vístula con la mayor rapidez compatible con la cohesión."
      ],
      historical:[
        "Fuentes contemporáneas y estudios posteriores sitúan al XIX Cuerpo avanzando por el sector del Corredor Polaco durante el primer día.",
        "El 4.º Ejército había alcanzado la línea Konitz-Nakel al final del 1 de septiembre según un estudio histórico estadounidense de la campaña.",
        "La misión general del 4.º Ejército era cortar el corredor con rapidez y avanzar hacia el Vístula."
      ],
      choices:[
        {id:"concentrate",title:"CONCENTRAR EL ESFUERZO",tag:"OPERACIONAL",desc:"Reforzar el eje principal y aceptar menor presión en sectores secundarios.",effects:{command:-1,movement:+5,ammunition:-5,cohesion:+2,reconnaissance:-2},next:"brda",result:"El cuerpo concentra potencia en el eje principal. El avance gana densidad, pero la información de los flancos se vuelve más delgada."},
        {id:"broad_front",title:"MANTENER FRENTE AMPLIO",tag:"SEGURIDAD",desc:"Sostener presión simultánea para reducir sorpresas sobre los flancos.",effects:{movement:-3,cohesion:+4,reconnaissance:+5,ammunition:-3,fatigue:+2},next:"brda",result:"La presión se mantiene en una anchura mayor. El riesgo de una sorpresa disminuye, aunque el Schwerpunkt pierde algo de velocidad."},
        {id:"pause_support",title:"PAUSA DE APOYO Y REABASTECIMIENTO",tag:"LOGÍSTICA",desc:"Dar prioridad a artillería, combustible y reparación antes del siguiente salto.",effects:{movement:-6,fuel:+7,ammunition:+6,cohesion:+6,fatigue:-4},next:"brda",result:"Los trenes de apoyo alcanzan a las vanguardias. Cedes tiempo, pero el cuerpo entra en la siguiente fase con mayor capacidad de sostener combate."}
      ]
    },

    brda:{
      id:"brda",
      date:"1 SEP 1939",
      time:"18:30",
      urgency:"FIN DE JORNADA",
      from:"Estado Mayor del XIX. Armeekorps",
      title:"Primer día de guerra",
      classification:"HECHO HISTÓRICO + RESULTADO DEL JUGADOR",
      body:[
        "La luz cae sobre Pomerania. El cuerpo ha avanzado durante horas bajo presión de tiempo, tráfico y contactos dispersos.",
        "Tu Estado Mayor prepara el balance: no basta con medir kilómetros. Importa qué divisiones siguen cohesionadas, cuánto combustible queda disponible en vanguardia y cuánto tarda una orden en recorrer la columna.",
        "El primer capítulo termina aquí. El siguiente tramo continuará con la lucha en el área de los bosques de Tuchola y la carrera para cerrar el Corredor Polaco."
      ],
      historical:[
        "Al final del 1 de septiembre el 4.º Ejército había penetrado profundamente en el Corredor Polaco.",
        "En los días siguientes, el XIX Cuerpo siguió avanzando hacia el Vístula y participó en el cierre del sector septentrional del corredor."
      ],
      choices:[]
    }
  },

  sources:[
    {short:"USHMM · Invasión de Polonia",title:"Invasión de Polonia, otoño de 1939",publisher:"United States Holocaust Memorial Museum",url:"https://encyclopedia.ushmm.org/content/es/article/invasion-of-poland-fall-1939"},
    {short:"U.S. military study",title:"The German Campaign in Poland, September 1939",publisher:"Historical study preserved by HyperWar/ibiblio",url:"https://www.ibiblio.org/hyperwar/NHC/NewPDFs/GERMANY/GER%20German%20Campaign%20in%20Poland%20September%201939%2C%20Sept%201%20to%20Oct.%205.pdf"},
    {short:"German Army OOB · 1 Sep 1939",title:"German Army, 1 September 1939",publisher:"General Staff / Nafziger Collection",url:"https://www.generalstaff.org/NAF/Pt_I_1939-1940/939giaa.pdf"},
    {short:"USMA map · Poland 1939",title:"German plan of invasion of Poland, August 1939",publisher:"United States Military Academy via Wikimedia Commons",url:"https://commons.wikimedia.org/wiki/File:Poland1939_GermanPlanMap.jpg"},
    {short:"Bundesarchiv · Panzer I",title:"Polen, Panzer I und Infanterie",publisher:"Bundesarchiv via Wikimedia Commons · CC BY-SA 3.0 DE",url:"https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_101I-012-0035-11A,_Polen,_Panzer_I_und_Infanterie.jpg"},
    {short:"Bundesarchiv · Stabsoffiziere",title:"Warschau, Generale v. Weichs, Blaskowitz",publisher:"Bundesarchiv via Wikimedia Commons · CC BY-SA 3.0 DE",url:"https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_101I-001-0256-31,_Warschau,_Generale_v._Weichs,_Blaskowitz.jpg"}
  ]
};