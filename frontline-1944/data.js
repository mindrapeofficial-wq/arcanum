const FRONTLINE_DATA = {
  "build": "0.5.0",
  "assetBase": "https://commons.wikimedia.org/wiki/Special:Redirect/file/",
  "armory": [
    {"id":"mp40","name":"MP 40","type":"Subfusil","kind":"weapon","year":1940,"ammo":"9×19 mm Parabellum","file":"Maschinenpistole_MP40.jpg","note":"Posterior a la campaña de 1938; se desbloquea cronológicamente."},
    {"id":"p08","name":"Luger P08","type":"Pistola","kind":"weapon","year":1908,"ammo":"9×19 mm Parabellum","file":"Luger P08 1908 9mm Germany .png","note":"Arma corta ya presente en inventarios del Heer."},
    {"id":"p38","name":"Walther P38","type":"Pistola","kind":"weapon","year":1938,"ammo":"9×19 mm Parabellum","file":"Walther-p38.jpg","note":"Modelo adoptado en 1938; su presencia inicial es limitada."},
    {"id":"c96","name":"Mauser C96","type":"Pistola","kind":"weapon","year":1896,"ammo":"Según variante","file":"Pistolet Mauser C96.jpg","note":"Material heredado y no uniforme, útil para representar stocks antiguos."},
    {"id":"kar98k","name":"Karabiner 98k","type":"Fusil de cerrojo","kind":"weapon","year":1935,"ammo":"7,92×57 mm Mauser","file":"Kar 98K - AM.021488.jpg","note":"Fusil estándar del Heer en la campaña de 1938."},
    {"id":"g43","name":"Gewehr 43 / Karabiner 43","type":"Fusil semiautomático","kind":"weapon","year":1943,"ammo":"7,92×57 mm Mauser","file":"Gewehr43Rifle.jpg","note":"Posterior a 1938."},
    {"id":"fg42","name":"FG 42","type":"Fusil automático","kind":"weapon","year":1942,"ammo":"7,92×57 mm Mauser","file":"Rifle FG42 model 2.jpg","note":"Posterior a 1938; asociado a tropas aerotransportadas."},
    {"id":"stg44","name":"StG 44 / MP 44","type":"Fusil de asalto","kind":"weapon","year":1944,"ammo":"7,92×33 mm Kurz","file":"Sturmgewehr 44.jpg","note":"Muy posterior a la primera campaña."},
    {"id":"mg13","name":"MG 13","type":"Ametralladora","kind":"weapon","year":1930,"ammo":"7,92×57 mm Mauser","file":"MG-13-machine gun.jpg","note":"Modelo anterior todavía relevante para reservas y unidades de segunda línea."},
    {"id":"mg34","name":"MG 34","type":"Ametralladora de propósito general","kind":"weapon","year":1934,"ammo":"7,92×57 mm Mauser","file":"MG34.jpg","note":"Clave para la estandarización del apoyo de infantería."},
    {"id":"mg42","name":"MG 42","type":"Ametralladora de propósito general","kind":"weapon","year":1942,"ammo":"7,92×57 mm Mauser","file":"MG42 1 noBG.jpg","note":"Posterior a 1938."},
    {"id":"pzb39","name":"Panzerbüchse 39","type":"Fusil anticarro","kind":"weapon","year":1939,"ammo":"7,92×94 mm Patrone 318","file":"D. 112-1, Panzerabwehrbüchse 39.png","note":"Aparece después de la campaña de 1938."},
    {"id":"panzerfaust","name":"Panzerfaust","type":"Arma anticarro desechable","kind":"weapon","year":1943,"ammo":"Carga hueca","file":"Panzerfaust.jpg","note":"Posterior a 1938."},
    {"id":"panzerschreck","name":"Panzerschreck","type":"Lanzacohetes anticarro","kind":"weapon","year":1943,"ammo":"Cohete RPzB de 88 mm","file":"Panzerschreck.jpg","note":"Posterior a 1938."},
    {"id":"stiel24","name":"Stielhandgranate 24","type":"Granada de mano","kind":"weapon","year":1924,"ammo":"Carga explosiva integrada","file":"Stielhandgranate24 noBG.png","note":"Granada reglamentaria disponible."},
    {"id":"eih39","name":"Eihandgranate 39","type":"Granada de mano","kind":"weapon","year":1939,"ammo":"Carga explosiva integrada","file":"Eihandgranate.jpg","note":"Posterior a la campaña de 1938."},
    {"id":"legrw36","name":"5 cm leGrW 36","type":"Mortero ligero","kind":"weapon","year":1936,"ammo":"Granada de mortero de 50 mm","file":"Bundesarchiv Bild 183-2007-1005-501, Soldaten am leichten Granatwerfer.jpg","note":"Apoyo orgánico ligero disponible en 1938."},
    {"id":"grw34","name":"8 cm GrW 34","type":"Mortero medio","kind":"weapon","year":1934,"ammo":"Granada de mortero de 81 mm","file":"8 cm Schwerer Granatwerfer 34 01.JPG","note":"Pieza de apoyo de infantería disponible."},
    {"id":"grw42","name":"12 cm GrW 42","type":"Mortero pesado","kind":"weapon","year":1942,"ammo":"Granada de mortero de 120 mm","file":"Granatwerfer 42 an der Ostfront.jpg","note":"Posterior a 1938."},
    {"id":"pak36","name":"3,7 cm Pak 35/36","type":"Cañón anticarro","kind":"weapon","year":1936,"ammo":"37 mm","file":"3.7 cm Pak.jpg","note":"Principal referencia anticarro de la campaña inicial."},
    {"id":"pak38","name":"5 cm Pak 38","type":"Cañón anticarro","kind":"weapon","year":1940,"ammo":"50 mm","file":"D. 72, Hs. 5 mit 5 cm Pak 38.png","note":"Posterior a 1938."},
    {"id":"pak40","name":"7,5 cm Pak 40","type":"Cañón anticarro","kind":"weapon","year":1942,"ammo":"75 mm","file":"7.5cm Pak 40 L46.jpg","note":"Posterior a 1938."},
    {"id":"leig18","name":"7,5 cm leIG 18","type":"Cañón ligero de infantería","kind":"weapon","year":1932,"ammo":"75 mm","file":"7.5 cm leichtes Infanteriegeschütz 18.jpg","note":"Apoyo directo de infantería disponible."},
    {"id":"lefh18","name":"10,5 cm leFH 18","type":"Obús de campaña","kind":"weapon","year":1935,"ammo":"105 mm","file":"Artilleriestellung Baltikum 1943-1 by-RaBoe.jpg","note":"Pieza de artillería de campaña disponible; la foto es archivo posterior."},
    {"id":"sfh18","name":"15 cm sFH 18","type":"Obús pesado","kind":"weapon","year":1934,"ammo":"150 mm","file":"15 cm sFH 18 Sapun M 2009 G1.jpg","note":"Artillería pesada disponible."},
    {"id":"sig33","name":"15 cm sIG 33","type":"Cañón pesado de infantería","kind":"weapon","year":1936,"ammo":"150 mm","file":"Schweres Infanteriegeschütz 33 at Wehrtechnische Studiensammlung Koblenz.jpg","note":"Apoyo pesado de infantería disponible."},
    {"id":"flak88","name":"8,8 cm FlaK 18/36/37","type":"Cañón antiaéreo","kind":"weapon","year":1936,"ammo":"88 mm","file":"8.8 cm Flak.jpg","note":"Disponible en 1938; su empleo anticarro sistemático se desarrollará después."},
    {"id":"flak38","name":"2 cm FlaK 38","type":"Cañón antiaéreo ligero","kind":"weapon","year":1940,"ammo":"20 mm","file":"2-cm-Flak 38 Gatow.JPG","note":"Posterior a 1938."},
    {"id":"nebel41","name":"15 cm Nebelwerfer 41","type":"Lanzacohetes múltiple","kind":"weapon","year":1941,"ammo":"Cohete de 150 mm","file":"German Nebelwerfer 41 rocket launcher front view.jpg","note":"Posterior a 1938."},
    {"id":"ammo9","name":"9×19 mm Parabellum","type":"Munición de arma corta/subfusil","kind":"ammo","year":1902,"ammo":"P08, P38, MP38/MP40","file":"9 × 19 mm Parabellum.jpg","note":"Calibre ya disponible en 1938."},
    {"id":"ammo79257","name":"7,92×57 mm Mauser","type":"Munición de fusil/ametralladora","kind":"ammo","year":1905,"ammo":"Kar98k, MG13, MG34 y otros","file":"German 7.92x57mm Ammunition from WW2.JPG","note":"Calibre central de la estandarización logística."},
    {"id":"ammo79233","name":"7,92×33 mm Kurz","type":"Munición intermedia","kind":"ammo","year":1942,"ammo":"StG 44 / MP43-44","file":"7.92×33mm Kurz.jpg","note":"Posterior a 1938."},
    {"id":"ammo50pak","name":"5 cm Pak 38 — munición","type":"Munición anticarro","kind":"ammo","year":1940,"ammo":"Pak 38","file":"D 435-1 Die Munition der deutschen Geschtütze und Werfer, 5 cm Pak 38.png","note":"Posterior a 1938."},
    {"id":"ammo75pak","name":"7,5 cm Pak 40 — proyectiles","type":"Munición anticarro","kind":"ammo","year":1942,"ammo":"Pak 40","file":"Pak40 helsinki shells.jpg","note":"Posterior a 1938."},
    {"id":"ammo88","name":"8,8 cm Pzgr. 39","type":"Proyectil perforante","kind":"ammo","year":1940,"ammo":"Familia 8,8 cm","file":"8,8 cm Panzergranatpatrone 39 Kw.K. 36.JPG","note":"La familia de 88 mm ya existe, pero esta referencia concreta es posterior."},
    {"id":"ammosig33","name":"15 cm sIG 33 — munición","type":"Munición de apoyo pesado","kind":"ammo","year":1936,"ammo":"sIG 33","file":"Munition 15cm sIG 33 Image 02.jpg","note":"Disponible en la campaña de 1938."},
    {"id":"ammonebel","name":"15 cm Nebelwerfer 41 — cohete","type":"Cohete de artillería","kind":"ammo","year":1941,"ammo":"Nebelwerfer 41","file":"15 cm Nebelwerfer rocket Hämeenlinna.JPG","note":"Posterior a 1938."}
  ],
  "chapters": [
    {
      "id": "ch0",
      "number": "0",
      "year": "1938",
      "title": "REORGANIZACIÓN",
      "subtitle": "Prólogo · mando, Anschluss y Sudetes",
      "status": "available"
    },
    {
      "id": "ch1",
      "number": "I",
      "year": "1939",
      "title": "FALL WEISS",
      "subtitle": "Polonia",
      "status": "available"
    },
    {
      "id": "ch2",
      "number": "II",
      "year": "1940",
      "title": "WESERÜBUNG",
      "subtitle": "Dinamarca y Noruega",
      "status": "locked"
    },
    {
      "id": "ch3",
      "number": "III",
      "year": "1940",
      "title": "FALL GELB",
      "subtitle": "Francia y Países Bajos",
      "status": "locked"
    },
    {
      "id": "ch4",
      "number": "IV",
      "year": "1941",
      "title": "BARBAROSSA",
      "subtitle": "Unión Soviética",
      "status": "locked"
    },
    {
      "id": "ch5",
      "number": "V",
      "year": "1942",
      "title": "EL ESTE",
      "subtitle": "Profundidad y desgaste",
      "status": "locked"
    },
    {
      "id": "ch6",
      "number": "VI",
      "year": "1943",
      "title": "PÉRDIDA DE INICIATIVA",
      "subtitle": "Defensa y retirada",
      "status": "locked"
    },
    {
      "id": "ch7",
      "number": "VII",
      "year": "1944",
      "title": "FRONTLINE 1944",
      "subtitle": "Normandía y colapso del frente",
      "status": "locked"
    }
  ],
  "campaigns": {
    "ch0": {
      "title": "CAPÍTULO I · REORGANIZACIÓN",
      "subtitle": "Alemania · febrero-diciembre de 1938",
      "protagonist": "Generaloberst Walther von Brauchitsch",
      "command": "Oberbefehlshaber des Heeres · OKH",
      "startDate": "4 FEB 1938",
      "startTime": "12:00",
      "dossier": [
        "En 1938 todavía no hay una guerra europea abierta, pero el aparato militar alemán cambia con rapidez. La crisis Blomberg-Fritsch altera la cúpula de mando y el Heer entra en una nueva relación con el poder político.",
        "Este capítulo no trata de conquistar un mapa. Trata de construir una máquina militar: organización, entrenamiento, movilidad, comunicaciones, coordinación interarmas y logística.",
        "Las decisiones del jugador pueden modificar la preparación del Heer, pero los grandes acontecimientos históricos de 1938 siguen una cronología documentada. Cuando una fotografía procede de una fecha posterior, el juego la etiqueta como archivo retrospectivo."
      ],
      "resources": {
        "command": 7,
        "communications": 58,
        "fuel": 70,
        "ammunition": 72,
        "movement": 62,
        "cohesion": 66,
        "reconnaissance": 48,
        "fatigue": 10
      },
      "formations": [
        {
          "id": "staff",
          "name": "Generalstab des Heeres",
          "commander": "OKH",
          "role": "Planificación y doctrina",
          "readiness": 78,
          "supply": 74,
          "position": "Berlín"
        },
        {
          "id": "mobile",
          "name": "Tropas móviles y reconocimiento",
          "commander": "Inspecciones del Heer",
          "role": "Movilidad y reconocimiento",
          "readiness": 68,
          "supply": 63,
          "position": "Distritos militares"
        },
        {
          "id": "signals",
          "name": "Nachrichtentruppen",
          "commander": "Arma de transmisiones",
          "role": "Mando y comunicaciones",
          "readiness": 64,
          "supply": 69,
          "position": "Red de guarniciones"
        }
      ],
      "staff": [
        {
          "id": "ia",
          "rank": "Oberst i.G.",
          "name": "Friedrich Keller",
          "role": "Operaciones",
          "fictional": true,
          "trust": 70,
          "note": "Quiere convertir cada movimiento de 1938 en una lección de Estado Mayor."
        },
        {
          "id": "ic",
          "rank": "Major i.G.",
          "name": "Ernst Weber",
          "role": "Inteligencia",
          "fictional": true,
          "trust": 65,
          "note": "Insiste en separar lo confirmado, lo probable y lo que solo parece convincente en un mapa."
        },
        {
          "id": "qu",
          "rank": "Oberstleutnant",
          "name": "Otto Hartmann",
          "role": "Logística",
          "fictional": true,
          "trust": 72,
          "note": "Recuerda que una fuerza que crece más rápido que sus camiones, talleres y radios solo crece sobre el papel."
        }
      ],
      "startScene": "command_change",
      "assets": {
        "heroFile": "Bundesarchiv Bild 183-H03527, Berlin, Kriegsakademie.jpg",
        "campaignMapFile": "BlankMap-World-1938march.png",
        "staffFile": "Bundesarchiv Bild 183-H03528, Berlin, Kriegsakademie.jpg"
      },
      "scenes": {
        "command_change": {
          "id": "command_change",
          "date": "4 FEB 1938",
          "time": "12:00",
          "urgency": "ORDEN DE REORGANIZACIÓN",
          "from": "Oberkommando des Heeres",
          "title": "El mando cambia de manos",
          "classification": "HECHO HISTÓRICO + SIMULACIÓN DE MANDO",
          "body": [
            "La crisis en la cúpula militar termina con una reorganización profunda. Adolf Hitler asume directamente las funciones del Ministerio de Guerra, se crea el OKW y Walther von Brauchitsch pasa a dirigir el Heer.",
            "Tu primera tarea no es mover divisiones en un mapa: es decidir cómo conservar capacidad profesional de planificación dentro de una cadena de mando que acaba de cambiar."
          ],
          "historical": [
            "La crisis Blomberg-Fritsch permitió una reestructuración de la cúpula militar alemana a comienzos de 1938.",
            "Walther von Brauchitsch sustituyó a Werner von Fritsch al frente del Ejército."
          ],
          "intel": "La información es política y organizativa, no táctica. La incertidumbre reside en cómo funcionará la nueva cadena de mando.",
          "visuals": [
            {
              "file": "1938 portrait photograph of Adolf Hitler.jpg",
              "caption": "Retrato de Adolf Hitler, 1938.",
              "usage": "Presenta al actor político que concentra la autoridad suprema sobre las fuerzas armadas.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-2004-1202-504, Berlin, Adolf Hitler und Hermann Göring.jpg",
              "caption": "Hitler y Hermann Göring.",
              "usage": "Introduce la relación entre dirección política, Heer y Luftwaffe.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-H03527, Berlin, Kriegsakademie.jpg",
              "caption": "Kriegsakademie en Berlín.",
              "usage": "Sitúa el peso del Estado Mayor profesional que el jugador debe reorganizar.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "protect_staff",
              "title": "PRESERVAR AUTONOMÍA TÉCNICA",
              "tag": "ESTADO MAYOR",
              "desc": "Blindar procedimientos profesionales y exigir canales escritos.",
              "effects": {
                "command": 1,
                "communications": 4,
                "cohesion": 5,
                "movement": -2
              },
              "next": "architecture",
              "result": "El Estado Mayor gana claridad procedimental, aunque cada decisión tarda algo más en atravesar la nueva jerarquía."
            },
            {
              "id": "centralize_fast",
              "title": "CENTRALIZAR DECISIONES",
              "tag": "VELOCIDAD",
              "desc": "Adaptar el OKH a la nueva cadena y reducir escalones de consulta.",
              "effects": {
                "command": 2,
                "communications": -2,
                "movement": 4,
                "cohesion": -3
              },
              "next": "architecture",
              "result": "Las órdenes salen con rapidez, pero aumenta la dependencia de un número menor de nodos de decisión."
            }
          ]
        },
        "architecture": {
          "id": "architecture",
          "date": "10 FEB 1938",
          "time": "09:15",
          "urgency": "DENKSCHRIFT",
          "from": "Generalstab des Heeres",
          "title": "Una nueva arquitectura militar",
          "classification": "HECHO HISTÓRICO + RECONSTRUCCIÓN ORGANIZATIVA",
          "body": [
            "La reorganización no puede quedarse en nombres. Hay que revisar cuadros, tablas de organización, formación de oficiales y procedimientos para movilizar un ejército que crece deprisa.",
            "Sobre la mesa aparecen KStN, planes de instrucción y una pregunta incómoda: qué debe estandarizarse primero."
          ],
          "historical": [
            "El Heer se encontraba en una fase acelerada de expansión y profesionalización durante 1938.",
            "Las tablas KStN definían organización y dotación teórica de unidades alemanas."
          ],
          "intel": "La información sobre plantillas es fiable; la capacidad real de muchas unidades para alcanzar esas plantillas no lo es.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 183-H03528, Berlin, Kriegsakademie.jpg",
              "caption": "Kriegsakademie, Berlín.",
              "usage": "Sirve de dossier sobre formación de oficiales y doctrina.",
              "chronology": "contemporary"
            },
            {
              "file": "Kstn131b1937.jpg",
              "caption": "Tabla KStN de preguerra.",
              "usage": "Se usa como documento de organización que condiciona la decisión del jugador.",
              "chronology": "contemporary"
            },
            {
              "file": "1938 Lehmann & Wundenberg Abdruck auf Ledergurt zur Aluminiumschnalle Heer der Wehrmacht.jpg",
              "caption": "Hebilla/equipamiento del Heer, 1938.",
              "usage": "Funciona como ficha de estandarización material y uniformidad.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "standardize",
              "title": "ESTANDARIZAR PLANTILLAS",
              "tag": "ORGANIZACIÓN",
              "desc": "Priorizar tablas comunes y procedimientos repetibles.",
              "effects": {
                "cohesion": 7,
                "communications": 2,
                "movement": -2
              },
              "next": "armament_review",
              "result": "La estructura gana coherencia y facilita movilizaciones futuras."
            },
            {
              "id": "expand_first",
              "title": "EXPANDIR CUADROS PRIMERO",
              "tag": "PERSONAL",
              "desc": "Aumentar mandos y efectivos aunque existan diferencias entre unidades.",
              "effects": {
                "movement": 3,
                "cohesion": -4,
                "command": 1,
                "fatigue": 2
              },
              "next": "armament_review",
              "result": "La expansión acelera, pero aparecen más excepciones locales y cargas de coordinación."
            }
          ]
        },
        "armament_review": {
      "id": "armament_review",
      "date": "18 FEB 1938",
      "time": "08:30",
      "urgency": "RÜSTUNGSBESPRECHUNG",
      "from": "OKH · Inspección de Infantería y Waffenamt",
      "title": "Un ejército no combate con porcentajes",
      "classification": "CONTEXTO HISTÓRICO + SIMULACIÓN DE ABASTECIMIENTO",
      "body": [
        "Las nuevas plantillas exigen algo más incómodo que dibujar divisiones sobre un organigrama: hay que decidir qué armas reciben realmente las unidades y qué calibres deben sostener los depósitos.",
        "Sobre la mesa aparecen el Karabiner 98k, la MG 34, existencias antiguas de MG 13 y pistolas de distintos lotes. Cada excepción parece pequeña hasta que se multiplica por cientos de miles de hombres.",
        "El problema no es elegir el arma más impresionante. Es conseguir que cada compañía pueda recibir repuestos, cargadores, munición y personal entrenado cuando la movilización deje de ser un ejercicio."
      ],
      "historical": [
        "El Karabiner 98k había sido adoptado como fusil estándar del Heer en 1935.",
        "La MG 34 fue la ametralladora de propósito general de referencia antes de la aparición de la MG 42.",
        "El calibre 7,92×57 mm Mauser permitía compartir una familia logística entre fusiles y ametralladoras, aunque seguían existiendo armas y stocks heredados."
      ],
      "intel": "Los inventarios nominales son fiables; la disponibilidad real de repuestos, munición y personal entrenado varía mucho entre depósitos y unidades.",
      "visuals": [
        {"file":"Kar 98K - AM.021488.jpg","caption":"Karabiner 98k.","usage":"Arma estándar que permite discutir uniformidad de fusil y munición.","chronology":"contemporary"},
        {"file":"MG34.jpg","caption":"MG 34.","usage":"Representa la estandarización del apoyo automático de infantería.","chronology":"contemporary"},
        {"file":"German 7.92x57mm Ammunition from WW2.JPG","caption":"Munición 7,92×57 mm.","usage":"Convierte el calibre en una decisión logística, no en un dato decorativo.","chronology":"reference-archive"}
      ],
      "choices": [
        {
          "id":"standardize_792",
          "title":"ESTANDARIZAR 7,92 MM",
          "tag":"LOGÍSTICA",
          "desc":"Priorizar Kar98k y MG34, retirar gradualmente material heredado y simplificar depósitos.",
          "effects":{"ammunition":7,"cohesion":5,"communications":1,"movement":-2},
          "next":"antitank_review",
          "result":"La transición consume tiempo y exige inventariar material antiguo, pero las unidades empiezan a compartir una cadena de munición y repuestos más predecible."
        },
        {
          "id":"keep_mixed_stocks",
          "title":"CONSERVAR STOCKS MIXTOS",
          "tag":"CANTIDAD",
          "desc":"Mantener en servicio todo lo utilizable para acelerar la expansión de unidades.",
          "effects":{"movement":4,"ammunition":-5,"cohesion":-4,"command":1},
          "next":"antitank_review",
          "result":"La expansión inmediata resulta más fácil, pero los depósitos acumulan excepciones y las unidades dependen más de saber exactamente qué lote llevan."
        }
      ]
    },
    "antitank_review": {
      "id": "antitank_review",
      "date": "24 FEB 1938",
      "time": "16:10",
      "urgency": "WAFFENAMT · PRÜFBERICHT",
      "from": "Heereswaffenamt · Artillería e Infantería",
      "title": "El cañón adecuado para la guerra equivocada",
      "classification": "CONTEXTO HISTÓRICO + SIMULACIÓN DOCTRINAL",
      "body": [
        "El 3,7 cm Pak 35/36 es móvil, numeroso y encaja en las unidades que el Heer está construyendo. Pero los informes extranjeros insisten en que el blindaje de los carros aumenta.",
        "Al mismo tiempo, morteros de 5 y 8 cm y piezas de infantería de 7,5 y 15 cm compiten por tractores, munición, instrucción y espacio en las columnas.",
        "No puedes fabricar en febrero de 1938 las armas que existirán años después. Sí puedes decidir qué problema estudiar antes de que la experiencia de combate obligue a hacerlo."
      ],
      "historical": [
        "El 3,7 cm Pak 35/36 era el cañón anticarro estándar alemán de preguerra.",
        "El 5 cm leGrW 36, el 8 cm GrW 34 y los cañones de infantería formaban parte del sistema de apoyo terrestre de la época.",
        "Pak 38, Pak 40, Panzerschreck, Panzerfaust y otros sistemas del catálogo pertenecen a fases posteriores y permanecen bloqueados por fecha."
      ],
      "intel": "La amenaza futura de blindados más pesados es plausible, pero no existe una imagen perfecta de qué enfrentará el Heer ni cuándo.",
      "visuals": [
        {"file":"3.7 cm Pak.jpg","caption":"3,7 cm Pak 35/36.","usage":"Muestra la capacidad anticarro disponible en 1938.","chronology":"contemporary"},
        {"file":"8 cm Schwerer Granatwerfer 34 01.JPG","caption":"8 cm GrW 34.","usage":"Representa el fuego de apoyo orgánico de infantería.","chronology":"contemporary"},
        {"file":"7.5 cm leichtes Infanteriegeschütz 18.jpg","caption":"7,5 cm leIG 18.","usage":"Introduce el coste logístico de mantener distintas familias de apoyo.","chronology":"reference-archive"}
      ],
      "choices": [
        {
          "id":"train_antitank_depth",
          "title":"ENTRENAR DEFENSA ANTICARRO EN PROFUNDIDAD",
          "tag":"DOCTRINA",
          "desc":"Compensar las limitaciones del Pak 35/36 con reconocimiento, emplazamientos y fuego coordinado.",
          "effects":{"reconnaissance":6,"cohesion":3,"ammunition":-2,"fatigue":2},
          "next":"luftwaffe_day",
          "result":"No aparece mágicamente un cañón mejor. Lo que mejora es la forma de detectar, canalizar y enfrentar blindados con el material realmente disponible."
        },
        {
          "id":"support_fire_priority",
          "title":"PRIORIZAR FUEGO DE APOYO",
          "tag":"ARTILLERÍA",
          "desc":"Dedicar más instrucción y munición a morteros y piezas de infantería para sostener el avance.",
          "effects":{"ammunition":-4,"cohesion":5,"movement":2,"reconnaissance":-1},
          "next":"luftwaffe_day",
          "result":"Las unidades practican un apoyo de fuego más denso, pero consumen reservas y horas de instrucción que no pueden emplearse en otros problemas."
        }
      ]
    },
    "luftwaffe_day": {
          "id": "luftwaffe_day",
          "date": "1 MAR 1938",
          "time": "11:00",
          "urgency": "ENLACE INTERARMAS",
          "from": "OKH · Enlace Luftwaffe",
          "title": "El otro brazo del poder militar",
          "classification": "DOCUMENTACIÓN DE ÉPOCA + SIMULACIÓN INTERARMAS",
          "body": [
            "Berlín exhibe la Luftwaffe. Para el Heer, el desfile no es solo ceremonia: recuerda que reconocimiento, enlace, transporte y apoyo aéreo dependerán de mecanismos de coordinación que todavía están madurando.",
            "Debes decidir cuánto esfuerzo de Estado Mayor dedicar ya a procedimientos conjuntos."
          ],
          "historical": [
            "El Día de la Luftwaffe de marzo de 1938 dejó abundante documentación fotográfica de la fuerza aérea alemana.",
            "La coordinación aire-tierra sería un problema central de las operaciones posteriores."
          ],
          "intel": "El potencial aéreo es visible; su integración cotidiana con mandos terrestres sigue siendo menos clara.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 183-H01704, Berlin, Parade am Tag der Luftwaffe.jpg",
              "caption": "Parada del Día de la Luftwaffe, Berlín.",
              "usage": "Abre el bloque de coordinación interarmas.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-H02734, Berlin, Parade am Tag der Luftwaffe.jpg",
              "caption": "Parada de la Luftwaffe, 1938.",
              "usage": "Sirve para identificar escala, ceremonial y presencia institucional.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-H02755, Berlin, Parade zum Tag der Luftwaffe.jpg",
              "caption": "Parada del Día de la Luftwaffe.",
              "usage": "Cierra el dossier visual antes de la decisión conjunta.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "joint_cells",
              "title": "CREAR CÉLULAS DE ENLACE",
              "tag": "INTERARMAS",
              "desc": "Reservar oficiales para procedimientos comunes Heer-Luftwaffe.",
              "effects": {
                "communications": 7,
                "reconnaissance": 4,
                "command": -1
              },
              "next": "austria_planning",
              "result": "La coordinación mejora, a costa de distraer cuadros escasos."
            },
            {
              "id": "army_priority",
              "title": "PRIORIZAR EL HEER",
              "tag": "TIERRA",
              "desc": "Mantener la coordinación aérea en un nivel mínimo y concentrar cuadros en fuerzas terrestres.",
              "effects": {
                "cohesion": 3,
                "communications": -3,
                "reconnaissance": -2
              },
              "next": "austria_planning",
              "result": "El Heer conserva personal, pero la cooperación futura dependerá más de improvisación."
            }
          ]
        },
        "austria_planning": {
          "id": "austria_planning",
          "date": "10 MAR 1938",
          "time": "20:40",
          "urgency": "VORBEREITUNGSBEFEHL",
          "from": "OKH · Operaciones",
          "title": "Austria: preparar un movimiento sin campaña",
          "classification": "HECHO HISTÓRICO + SIMULACIÓN LOGÍSTICA",
          "body": [
            "La presión política sobre Austria se convierte en una necesidad militar inmediata. Las unidades deben moverse con rapidez, pero no se espera una campaña convencional.",
            "Las carreteras, el combustible y la disciplina de marcha pueden convertirse en el verdadero enemigo."
          ],
          "historical": [
            "La crisis austríaca culminó con la entrada de fuerzas alemanas el 12 de marzo de 1938.",
            "La incorporación de Austria exigió movimientos rápidos y posterior integración administrativa y militar."
          ],
          "intel": "No se espera resistencia organizada, pero los datos de tráfico, puentes y disponibilidad mecánica son incompletos.",
          "visuals": [
            {
              "file": "BlankMap-World-1938march.png",
              "caption": "Mapa mundial de marzo de 1938.",
              "usage": "Fija el contexto geopolítico previo al Anschluss.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 137-049270, Anschluss Österreich.jpg",
              "caption": "Anschluss de Austria.",
              "usage": "Se usa como avance de inteligencia visual sobre el teatro.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 137-049271, Anschluss Österreich.jpg",
              "caption": "Anschluss de Austria.",
              "usage": "Apoya la planificación de rutas y concentración.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "road_discipline",
              "title": "DISCIPLINA DE ITINERARIOS",
              "tag": "LOGÍSTICA",
              "desc": "Asignar ventanas de marcha y prioridades de carretera.",
              "effects": {
                "movement": -2,
                "fuel": 5,
                "cohesion": 7,
                "communications": 3
              },
              "next": "border_crossing",
              "result": "La marcha inicial será menos espectacular, pero más controlada."
            },
            {
              "id": "speed_columns",
              "title": "MÁXIMA VELOCIDAD",
              "tag": "RITMO",
              "desc": "Lanzar columnas tan pronto estén disponibles.",
              "effects": {
                "movement": 7,
                "fuel": -6,
                "cohesion": -5,
                "fatigue": 3
              },
              "next": "border_crossing",
              "result": "Las primeras columnas ganan tiempo, mientras la retaguardia empieza a comprimirse."
            }
          ]
        },
        "border_crossing": {
          "id": "border_crossing",
          "date": "12 MAR 1938",
          "time": "06:10",
          "urgency": "MARSCHMELDUNG",
          "from": "Unidades de vanguardia",
          "title": "Cruzar sin combatir no significa avanzar sin problemas",
          "classification": "HECHO HISTÓRICO + SIMULACIÓN DE MARCHA",
          "body": [
            "Las tropas cruzan la frontera. No hay una batalla convencional, pero sí tráfico, fallos mecánicos, multitudes y una red viaria que no fue diseñada para columnas militares continuas.",
            "El Estado Mayor debe decidir si protege el horario o la cohesión."
          ],
          "historical": [
            "Las tropas alemanas entraron en Austria el 12 de marzo de 1938 sin encontrar resistencia militar organizada.",
            "El movimiento proporcionó lecciones prácticas sobre movilidad y sostenimiento."
          ],
          "intel": "El enemigo no es una formación hostil; son los cuellos de botella y la información desfasada sobre las propias columnas.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 137-049278, Anschluss Österreich.jpg",
              "caption": "Movimiento durante el Anschluss.",
              "usage": "Ilustra la marcha terrestre y el entorno civil.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-1987-0922-503, Wien, Einmarsch deutscher Truppen, Spähpanzer.jpg",
              "caption": "Entrada de tropas y vehículo de reconocimiento en Viena.",
              "usage": "Se utiliza para discutir reconocimiento, circulación y visibilidad de las columnas.",
              "chronology": "contemporary"
            },
            {
              "file": "State of Austria within Germany 1938.png",
              "caption": "Austria incorporada a Alemania, 1938.",
              "usage": "Actualiza el mapa estratégico tras la entrada.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "repair_nodes",
              "title": "CREAR NODOS DE REPARACIÓN",
              "tag": "SOSTENIMIENTO",
              "desc": "Detener recursos móviles para recuperar vehículos averiados.",
              "effects": {
                "movement": -3,
                "fuel": 3,
                "cohesion": 5,
                "fatigue": -2
              },
              "next": "vienna",
              "result": "La columna pierde tiempo pero reduce averías acumuladas."
            },
            {
              "id": "keep_schedule",
              "title": "MANTENER EL HORARIO",
              "tag": "IMPULSO",
              "desc": "Apartar averiados y continuar con las unidades disponibles.",
              "effects": {
                "movement": 5,
                "fuel": -3,
                "cohesion": -4,
                "fatigue": 4
              },
              "next": "vienna",
              "result": "El calendario se mantiene a costa de dejar una estela logística más difícil de recomponer."
            }
          ]
        },
        "vienna": {
          "id": "vienna",
          "date": "15 MAR 1938",
          "time": "17:30",
          "urgency": "LAGEBERICHT WIEN",
          "from": "OKH · Sección de integración",
          "title": "Viena y la integración del nuevo territorio",
          "classification": "HECHO HISTÓRICO + SIMULACIÓN ADMINISTRATIVA",
          "body": [
            "La fase de movimiento deja paso a otra clase de trabajo: depósitos, mandos, personal, cuarteles, comunicaciones y formaciones austríacas deben encajar en una estructura alemana.",
            "El problema es menos visible que una columna en marcha, pero condicionará todo lo que venga después."
          ],
          "historical": [
            "La anexión fue formalizada el 13 de marzo y Hitler entró en Viena el 15 de marzo.",
            "La incorporación territorial implicó integración de instituciones y fuerzas."
          ],
          "intel": "Los inventarios llegan en formatos distintos y con niveles de fiabilidad desiguales.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 146-1972-028-14, Anschluss Österreich.jpg",
              "caption": "Austria durante el Anschluss.",
              "usage": "Contextualiza la transición de ocupación a integración.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 146-1985-083-10, Anschluss Österreich, Wien.jpg",
              "caption": "Viena durante el Anschluss.",
              "usage": "Se emplea como fondo documental del informe urbano.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 119-5243, Wien, Arthur Seyß-Inquart, Adolf Hitler.jpg",
              "caption": "Seyß-Inquart y Hitler en Viena.",
              "usage": "Identifica a la dirección política implicada en la anexión.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "audit_first",
              "title": "AUDITAR ANTES DE ABSORBER",
              "tag": "CONTROL",
              "desc": "Inventariar personal, depósitos y material antes de reasignarlos.",
              "effects": {
                "communications": 4,
                "cohesion": 6,
                "movement": -3
              },
              "next": "lessons",
              "result": "La integración es más lenta pero genera una imagen logística más fiable."
            },
            {
              "id": "absorb_fast",
              "title": "ABSORCIÓN INMEDIATA",
              "tag": "EXPANSIÓN",
              "desc": "Distribuir recursos y personal con rapidez.",
              "effects": {
                "movement": 4,
                "cohesion": -3,
                "command": 1
              },
              "next": "lessons",
              "result": "El Heer crece antes, aunque con más excepciones y datos incompletos."
            }
          ]
        },
        "lessons": {
          "id": "lessons",
          "date": "28 MAR 1938",
          "time": "10:20",
          "urgency": "NACHBESPRECHUNG",
          "from": "Generalstab des Heeres",
          "title": "Lecciones del Anschluss",
          "classification": "ANÁLISIS DE EXPERIENCIA + SIMULACIÓN",
          "body": [
            "La operación no produjo una batalla, pero sí una montaña de partes. Fallos de marcha, coordinación, mantenimiento y comunicaciones pueden convertirse en doctrina si se estudian ahora.",
            "El jugador decide qué problema recibe prioridad institucional."
          ],
          "historical": [
            "Las maniobras y movimientos de preguerra alimentaron revisiones doctrinales y logísticas.",
            "La motorización alemana coexistía todavía con grandes diferencias de movilidad entre formaciones."
          ],
          "intel": "Los partes propios son abundantes, pero tienden a describir síntomas más que causas.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 101I-001-0283-02, Wehrmachtsoldaten bei Ausbildung.jpg",
              "caption": "Soldados de la Wehrmacht durante instrucción.",
              "usage": "Convierte las lecciones de marcha en necesidades de entrenamiento.",
              "chronology": "archive-reference"
            },
            {
              "file": "Bundesarchiv Bild 101I-001-0283-03, Wehrmachtsoldaten bei Ausbildung.jpg",
              "caption": "Instrucción de soldados alemanes.",
              "usage": "Apoya el módulo de estandarización de procedimientos.",
              "chronology": "archive-reference"
            },
            {
              "file": "Bundesarchiv Bild 183-H03417, Berlin, Hitler nach Anschluß Österreichs.jpg",
              "caption": "Hitler tras el Anschluss.",
              "usage": "Sirve como cierre político del bloque y presión contextual sobre el mando.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "maintenance_doctrine",
              "title": "MANTENIMIENTO Y MARCHA",
              "tag": "LOGÍSTICA",
              "desc": "Convertir averías y tráfico en un programa de instrucción.",
              "effects": {
                "fuel": 6,
                "movement": 3,
                "cohesion": 3
              },
              "next": "mobility",
              "result": "Las unidades reciben procedimientos más claros para marchas largas."
            },
            {
              "id": "command_drills",
              "title": "MANDO Y ENLACES",
              "tag": "MANDO",
              "desc": "Priorizar ejercicios de puestos de mando y transmisión.",
              "effects": {
                "communications": 7,
                "command": 1,
                "fuel": -1
              },
              "next": "mobility",
              "result": "El mando gana disciplina en el flujo de órdenes."
            }
          ]
        },
        "mobility": {
          "id": "mobility",
          "date": "30 APR 1938",
          "time": "14:00",
          "urgency": "AUSBILDUNGSBEFEHL",
          "from": "Inspección de tropas móviles",
          "title": "Movilidad no significa solo tanques",
          "classification": "DOCTRINA + DOCUMENTACIÓN TÉCNICA",
          "body": [
            "Motorizadas, parcialmente motorizadas y ciclistas ofrecen velocidades, huellas logísticas y necesidades de carretera muy distintas.",
            "El diseño de una fuerza útil exige aceptar que no todas las unidades pueden moverse al ritmo de la vanguardia."
          ],
          "historical": [
            "El Heer combinaba unidades motorizadas, parcialmente motorizadas, ciclistas y a pie.",
            "La movilidad operacional dependía tanto de la organización como del vehículo individual."
          ],
          "intel": "Los rendimientos de ejercicios son comparables solo de forma aproximada: terreno y mantenimiento alteran los resultados.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 101I-001-0283-05, Wehrmachtsoldaten bei Ausbildung.jpg",
              "caption": "Instrucción de la Wehrmacht.",
              "usage": "Se usa para representar preparación práctica.",
              "chronology": "archive-reference"
            },
            {
              "file": "Aufklärungs-Abteilung (mot.) (Wehrmacht) 1.png",
              "caption": "Esquema de unidad de reconocimiento motorizada.",
              "usage": "Sirve como documento de composición de unidad.",
              "chronology": "contemporary"
            },
            {
              "file": "Aufklärungsabteilung (teilmot) (Wehrmacht).jpg",
              "caption": "Esquema de reconocimiento parcialmente motorizado.",
              "usage": "Permite comparar estructuras de movilidad.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "motor_core",
              "title": "NÚCLEOS MOTORIZADOS",
              "tag": "SCHWERPUNKT",
              "desc": "Concentrar vehículos en elementos de reconocimiento y ruptura.",
              "effects": {
                "movement": 7,
                "fuel": -6,
                "reconnaissance": 5
              },
              "next": "mixed_mobility",
              "result": "La fuerza móvil gana velocidad y ojos, pero consume más combustible."
            },
            {
              "id": "balanced_pool",
              "title": "PARQUE EQUILIBRADO",
              "tag": "SOSTENIBILIDAD",
              "desc": "Distribuir vehículos para reducir diferencias de velocidad.",
              "effects": {
                "movement": 3,
                "fuel": -2,
                "cohesion": 5
              },
              "next": "mixed_mobility",
              "result": "La formación completa se mueve con mayor regularidad."
            }
          ]
        },
        "mixed_mobility": {
          "id": "mixed_mobility",
          "date": "31 MAY 1938",
          "time": "08:40",
          "urgency": "ÜBUNGSPLAN",
          "from": "OKH · Instrucción",
          "title": "La columna real es heterogénea",
          "classification": "SIMULACIÓN ORGANIZATIVA",
          "body": [
            "Una orden que funciona para una unidad motorizada puede ser absurda para una unidad ciclista o parcialmente motorizada.",
            "El Estado Mayor debe diseñar horarios y reservas con velocidades diferentes."
          ],
          "historical": [
            "Las divisiones alemanas de preguerra dependían de combinaciones muy distintas de transporte.",
            "La bicicleta siguió siendo un recurso militar relevante en unidades de reconocimiento e infantería."
          ],
          "intel": "Los cuadros de velocidad nominal son fiables; la velocidad sostenida de una columna completa no.",
          "visuals": [
            {
              "file": "Radfahr-Abteilung 1 (Wehrmacht) 1.png",
              "caption": "Esquema de unidad ciclista.",
              "usage": "Se usa para calcular ritmo y consumo de carretera.",
              "chronology": "contemporary"
            },
            {
              "file": "Radfahr-Abteilung 1 (Wehrmacht) 2.png",
              "caption": "Segundo esquema de unidad ciclista.",
              "usage": "Permite comparar variantes de organización.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 101I-001-0283-06, Wehrmachtsoldaten bei Ausbildung.jpg",
              "caption": "Soldados en instrucción.",
              "usage": "Representa el entrenamiento necesario para coordinar unidades heterogéneas.",
              "chronology": "archive-reference"
            }
          ],
          "choices": [
            {
              "id": "separate_march",
              "title": "COLUMNAS POR VELOCIDAD",
              "tag": "TRÁFICO",
              "desc": "Separar itinerarios y horarios según movilidad.",
              "effects": {
                "movement": 4,
                "cohesion": 4,
                "communications": 2
              },
              "next": "signals",
              "result": "Se reducen adelantamientos y bloqueos entre unidades."
            },
            {
              "id": "combined_march",
              "title": "COLUMNAS COMBINADAS",
              "tag": "CONTROL",
              "desc": "Mantener agrupaciones tácticas completas aunque sean más lentas.",
              "effects": {
                "movement": -3,
                "cohesion": 7,
                "reconnaissance": -1
              },
              "next": "signals",
              "result": "Las unidades llegan más juntas, pero con menor ritmo."
            }
          ]
        },
        "signals": {
          "id": "signals",
          "date": "30 JUN 1938",
          "time": "16:10",
          "urgency": "NACHRICHTENLAGE",
          "from": "Nachrichtentruppen",
          "title": "La guerra que viaja por cable y radio",
          "classification": "DOCUMENTACIÓN TÉCNICA + SIMULACIÓN",
          "body": [
            "El Heer puede crecer más rápido que su capacidad para transmitir órdenes. Radio, cable, mensajeros y procedimientos de cifrado forman una red frágil.",
            "El jugador debe decidir si prioriza alcance o redundancia."
          ],
          "historical": [
            "Las tropas de transmisiones eran esenciales para el mando de unidades móviles.",
            "Las redes militares combinaban radio, telefonía de campaña y enlaces físicos."
          ],
          "intel": "Las pruebas técnicas son buenas; la saturación real en una gran operación solo puede estimarse.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 183-2006-1211-500, Wehrmacht, Fahrbare Funkstation.jpg",
              "caption": "Estación de radio móvil de la Wehrmacht.",
              "usage": "Se convierte en recurso funcional del sistema de comunicaciones.",
              "chronology": "archive-reference"
            },
            {
              "file": "Bundesarchiv Bild 183-2006-1211-501, Nachrichtentruppen, Funkstation.jpg",
              "caption": "Tropas de señales y estación de radio.",
              "usage": "Representa capacidad y vulnerabilidad de la red.",
              "chronology": "archive-reference"
            },
            {
              "file": "Bundesarchiv Bild 141-2141, Funkstelle V Fliegerkorps.jpg",
              "caption": "Puesto de radio de un cuerpo aéreo.",
              "usage": "Se usa como dossier técnico de enlace interarmas.",
              "chronology": "retrospective-archive"
            }
          ],
          "choices": [
            {
              "id": "redundancy",
              "title": "REDUNDANCIA DE RED",
              "tag": "RESILIENCIA",
              "desc": "Duplicar enlaces críticos aunque consuma personal.",
              "effects": {
                "communications": 9,
                "command": -1,
                "cohesion": 2
              },
              "next": "air_coord",
              "result": "La red tolera mejor fallos locales."
            },
            {
              "id": "long_range",
              "title": "RADIO DE LARGO ALCANCE",
              "tag": "VELOCIDAD",
              "desc": "Concentrar equipos en enlaces de mando de mayor distancia.",
              "effects": {
                "communications": 5,
                "movement": 3,
                "cohesion": -2
              },
              "next": "air_coord",
              "result": "Las órdenes viajan más lejos con rapidez, pero hay menos respaldo local."
            }
          ]
        },
        "air_coord": {
          "id": "air_coord",
          "date": "15 JUL 1938",
          "time": "13:30",
          "urgency": "BESPRECHUNG",
          "from": "OKH / RLM",
          "title": "Coordinar dos cadenas de mando",
          "classification": "HECHO INSTITUCIONAL + ARCHIVO TÉCNICO",
          "body": [
            "La Luftwaffe no pertenece al Heer. Cualquier apoyo requiere solicitudes, prioridades y enlaces entre organizaciones con culturas distintas.",
            "El ejercicio de Estado Mayor obliga a definir qué información debe compartir cada servicio."
          ],
          "historical": [
            "La Luftwaffe dependía de su propia cadena de mando y ministerio.",
            "La cooperación aire-tierra requería enlaces y procedimientos específicos."
          ],
          "intel": "El Estado Mayor conoce sus propias necesidades mejor que las limitaciones internas de la Luftwaffe.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 183-H08192, Hermann Göring und Ernst Udet.jpg",
              "caption": "Hermann Göring y Ernst Udet.",
              "usage": "Identifica actores clave del desarrollo de la Luftwaffe.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-H27413, Berlin, Reichsluftfahrtministerium.jpg",
              "caption": "Reichsluftfahrtministerium, Berlín.",
              "usage": "Sitúa institucionalmente la cadena aérea.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 101I-643-4752-30A, Rudermarkierungen.jpg",
              "caption": "Marcas de control en aeronave.",
              "usage": "Se usa como archivo técnico posterior para ilustrar estandarización y reconocimiento visual.",
              "chronology": "retrospective-archive"
            }
          ],
          "choices": [
            {
              "id": "shared_picture",
              "title": "IMAGEN DE SITUACIÓN COMPARTIDA",
              "tag": "INTELIGENCIA",
              "desc": "Establecer formatos comunes de informes.",
              "effects": {
                "communications": 6,
                "reconnaissance": 7,
                "command": -1
              },
              "next": "air_archive",
              "result": "La información aérea se vuelve más utilizable por mandos terrestres."
            },
            {
              "id": "request_channels",
              "title": "CANALES DE SOLICITUD",
              "tag": "CONTROL",
              "desc": "Priorizar un procedimiento claro para pedir apoyo.",
              "effects": {
                "communications": 5,
                "cohesion": 4,
                "reconnaissance": 2
              },
              "next": "air_archive",
              "result": "La cooperación es menos flexible pero más predecible."
            }
          ]
        },
        "air_archive": {
          "id": "air_archive",
          "date": "5 AUG 1938",
          "time": "10:00",
          "urgency": "ARCHIVMAPPE",
          "from": "OKH · Evaluación interarmas",
          "title": "Lo que todavía no existe, pero hay que prever",
          "classification": "ARCHIVO RETROSPECTIVO CLARAMENTE MARCADO",
          "body": [
            "Algunos documentos visuales conservados son posteriores a 1938. Aquí no se presentan como fotografías del ejercicio actual, sino como archivo técnico que muestra en qué desembocarán ciertas prácticas.",
            "La escena convierte esas imágenes en previsión doctrinal, no en falsa cronología."
          ],
          "historical": [
            "El material retrospectivo puede ilustrar desarrollos posteriores sin atribuirlos falsamente a 1938.",
            "La separación entre fuente contemporánea y archivo posterior forma parte del sistema documental del juego."
          ],
          "intel": "La cronología de cada imagen está marcada para evitar que el jugador confunda evidencia contemporánea con retrospectiva.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 183-2008-0909-500, Wien, Göring ehrt Gefallene des Weltkrieges.jpg",
              "caption": "Göring en Viena.",
              "usage": "Se usa como documento ceremonial vinculado a la presencia de la Luftwaffe en Austria.",
              "chronology": "archive-reference"
            },
            {
              "file": "Bundesarchiv Bild 146-1978-013-19, Luftwaffen-Helfer, Übungsalarm.jpg",
              "caption": "Personal auxiliar de la Luftwaffe durante alarma de ejercicio.",
              "usage": "Archivo posterior usado para anticipar exigencias de defensa y personal.",
              "chronology": "retrospective-archive"
            },
            {
              "file": "Aukflärungs-Abteilung (teilmot.) (Wehrmacht).png",
              "caption": "Esquema alternativo de unidad de reconocimiento.",
              "usage": "Se usa para cerrar la comparación de estructuras de reconocimiento.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "archive_discipline",
              "title": "CATALOGAR POR FECHA Y FUNCIÓN",
              "tag": "DOCUMENTACIÓN",
              "desc": "Exigir que todo archivo indique cronología y uso.",
              "effects": {
                "reconnaissance": 4,
                "communications": 2
              },
              "next": "naval_program",
              "result": "El sistema documental gana fiabilidad."
            },
            {
              "id": "practical_archive",
              "title": "CATALOGAR POR UTILIDAD",
              "tag": "OPERACIONES",
              "desc": "Priorizar lo que enseña cada documento sobre su fecha exacta.",
              "effects": {
                "movement": 2,
                "reconnaissance": 2
              },
              "next": "naval_program",
              "result": "El archivo es más ágil, pero exige más cuidado al interpretar cronologías."
            }
          ]
        },
        "naval_program": {
          "id": "naval_program",
          "date": "22 AUG 1938",
          "time": "15:20",
          "urgency": "RÜSTUNGSBESPRECHUNG",
          "from": "OKW · Reparto de recursos",
          "title": "El acero también se va al mar",
          "classification": "HECHO HISTÓRICO + SIMULACIÓN DE RECURSOS",
          "body": [
            "La botadura del Prinz Eugen simboliza una expansión naval que compite por acero, mano de obra, combustible y capacidad industrial.",
            "Desde el Heer no mandas la Kriegsmarine, pero sí sufres las consecuencias del reparto de recursos."
          ],
          "historical": [
            "El crucero pesado Prinz Eugen fue botado en 1938.",
            "El rearme alemán exigía asignar recursos entre Ejército, Luftwaffe y Kriegsmarine."
          ],
          "intel": "Los programas industriales son conocidos; su coste de oportunidad para el Heer es más difícil de cuantificar.",
          "visuals": [
            {
              "file": "Besuch vom ungar. Staatsoberhaupt Miklos von Horthy und Reichskanzler Adolf Hitler zum Stapellauf des Schweren Kreuzers PRINZ EUGEN (Kiel 53.179).jpg",
              "caption": "Botadura del Prinz Eugen con Hitler y Horthy.",
              "usage": "Ancla la escena en el programa naval de 1938.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv DVM 10 Bild-23-63-06, Panzerschiff \"Admiral Graf Spee\".jpg",
              "caption": "Admiral Graf Spee.",
              "usage": "Representa la flota existente que absorbe recursos y planificación.",
              "chronology": "contemporary"
            },
            {
              "file": "Admiral Graf Spee-A01.jpg",
              "caption": "Admiral Graf Spee.",
              "usage": "Complementa el dossier sobre capacidad naval de preguerra.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "army_industry",
              "title": "PRESIONAR POR PRIORIDAD TERRESTRE",
              "tag": "RECURSOS",
              "desc": "Solicitar más camiones, radios y repuestos para el Heer.",
              "effects": {
                "fuel": 4,
                "communications": 3,
                "movement": 4,
                "command": -1
              },
              "next": "nuremberg",
              "result": "El Ejército mejora su preparación material, pero la negociación interarmas se endurece."
            },
            {
              "id": "joint_balance",
              "title": "ACEPTAR REPARTO INTERARMAS",
              "tag": "EQUILIBRIO",
              "desc": "Mantener una distribución más uniforme.",
              "effects": {
                "cohesion": 3,
                "command": 1,
                "movement": -1
              },
              "next": "nuremberg",
              "result": "La relación interarmas es más estable, aunque el Heer recibe menos margen."
            }
          ]
        },
        "nuremberg": {
          "id": "nuremberg",
          "date": "10 SEP 1938",
          "time": "12:30",
          "urgency": "LAGE UND DARSTELLUNG",
          "from": "OKH · Inspección",
          "title": "La imagen pública del poder militar",
          "classification": "DOCUMENTACIÓN DE ÉPOCA + CONTEXTO",
          "body": [
            "El despliegue ceremonial muestra banderas, uniformes y formaciones. Para el juego, la escena sirve para distinguir símbolo, organización real y capacidad efectiva.",
            "Tu Estado Mayor debe evitar confundir apariencia de fuerza con preparación operacional."
          ],
          "historical": [
            "El régimen utilizaba grandes concentraciones y ceremonias para exhibir poder militar y político.",
            "Las banderas y estandartes tenían funciones de identificación y ceremonial."
          ],
          "intel": "La imagen pública es abundante; la disponibilidad real de unidades y recursos sigue siendo información separada.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 183-H12262, Nürnberg, Reichsparteitag, Tag der Wehrmacht.jpg",
              "caption": "Núremberg, Día de la Wehrmacht.",
              "usage": "Documenta la exhibición pública de fuerzas.",
              "chronology": "contemporary"
            },
            {
              "file": "Die Wehrmacht - Fahnen Flaggen u Standarten der deutschen Wehrmacht - Reichskriegsflagge Infanterie Kavalerie Kriegsmarine Luftwaffe Soldatenbund - Nazi Germany Armed forces Flags Colours swastika poster ca. 1936-38 No known copyright.jpg",
              "caption": "Lámina histórica de banderas y estandartes.",
              "usage": "Se usa como ficha de identificación histórica, no como decoración.",
              "chronology": "contemporary"
            },
            {
              "file": "Reibert Der Dienstunterricht im Heere Kanonier 1938 (0169) KOMMANDO- UND STABSFLAGGEN DER KRIGSMARINE DER LUFTWAFFE Wehrmacht handbook Nazi Germany Navy Air force command post staff flags standards No copyright Low-res scan.jpg",
              "caption": "Lámina de banderas de mando y Estado Mayor.",
              "usage": "Permite al jugador interpretar señales visuales en documentos de época.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "readiness_audit",
              "title": "AUDITAR PREPARACIÓN REAL",
              "tag": "REALISMO",
              "desc": "Comparar exhibición con estados de disponibilidad.",
              "effects": {
                "reconnaissance": 6,
                "cohesion": 3,
                "movement": -1
              },
              "next": "sudeten_map",
              "result": "El Estado Mayor separa mejor propaganda y capacidad operativa."
            },
            {
              "id": "mobilization_signal",
              "title": "USAR EL EVENTO COMO ENSAYO",
              "tag": "MOVILIZACIÓN",
              "desc": "Aprovechar concentraciones para probar movimientos y enlaces.",
              "effects": {
                "movement": 4,
                "communications": 4,
                "fatigue": 2
              },
              "next": "sudeten_map",
              "result": "La ceremonia deja también datos útiles de movilización."
            }
          ]
        },
        "sudeten_map": {
          "id": "sudeten_map",
          "date": "15 SEP 1938",
          "time": "19:10",
          "urgency": "KARTENLAGE",
          "from": "Generalstab des Heeres",
          "title": "Los Sudetes sobre el mapa",
          "classification": "HECHO HISTÓRICO + PLANIFICACIÓN CONTINGENTE",
          "body": [
            "La crisis checoslovaca obliga a convertir fronteras, carreteras y fortificaciones en preguntas operacionales. Todavía puede haber acuerdo diplomático o guerra.",
            "El Estado Mayor debe preparar opciones sin saber cuál será necesaria."
          ],
          "historical": [
            "La crisis de los Sudetes elevó el riesgo de una guerra europea en septiembre de 1938.",
            "Las fortificaciones fronterizas checoslovacas formaban parte esencial del problema militar."
          ],
          "intel": "Los mapas son buenos a gran escala, pero los detalles sobre fortificaciones y reacción enemiga son incompletos.",
          "visuals": [
            {
              "file": "German Map Sudeten.PNG",
              "caption": "Mapa alemán de los Sudetes.",
              "usage": "Es la pieza central de la planificación geográfica.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-H13158, Anschluss sudetendeutscher Gebiete.jpg",
              "caption": "Incorporación de zonas sudetoalemanas.",
              "usage": "Se usa como referencia visual del territorio que pronto será ocupado.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-H12951, Münchener Abkommen, Hitler nach erster Besprechnung.jpg",
              "caption": "Hitler durante la crisis de Múnich.",
              "usage": "Introduce la presión política que condiciona la planificación.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "fortification_intel",
              "title": "PRIORIZAR FORTIFICACIONES",
              "tag": "INTELIGENCIA",
              "desc": "Concentrar reconocimiento sobre posiciones defensivas.",
              "effects": {
                "reconnaissance": 9,
                "movement": -2
              },
              "next": "munich",
              "result": "Mejora la imagen de las defensas, a costa de otros sectores."
            },
            {
              "id": "routes_supply",
              "title": "PRIORIZAR RUTAS Y SUMINISTRO",
              "tag": "LOGÍSTICA",
              "desc": "Estudiar carreteras, ferrocarriles y pasos fronterizos.",
              "effects": {
                "movement": 6,
                "fuel": 3,
                "reconnaissance": 3
              },
              "next": "munich",
              "result": "La planificación de movimiento gana robustez."
            }
          ]
        },
        "munich": {
          "id": "munich",
          "date": "29 SEP 1938",
          "time": "22:15",
          "urgency": "POLITISCHE LAGE",
          "from": "OKW / OKH",
          "title": "Múnich: el plan militar queda suspendido por la política",
          "classification": "HECHO HISTÓRICO + SIMULACIÓN DE ALERTA",
          "body": [
            "Mientras los líderes políticos negocian, el Heer debe permanecer preparado para resultados incompatibles entre sí: desmovilización parcial, ocupación pactada o guerra.",
            "La dificultad es sostener alerta sin desgastar innecesariamente a las fuerzas."
          ],
          "historical": [
            "Alemania, Italia, Gran Bretaña y Francia alcanzaron el Acuerdo de Múnich el 29-30 de septiembre de 1938.",
            "Checoslovaquia no participó en las negociaciones que decidieron la cesión del territorio sudeto."
          ],
          "intel": "La información diplomática llega en fragmentos. Las órdenes militares no pueden adelantarse demasiado a una decisión política.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 183-R69173, Münchener Abkommen, Staatschefs.jpg",
              "caption": "Jefes de gobierno durante el Acuerdo de Múnich.",
              "usage": "Documenta a los participantes de la conferencia.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 146-1976-033-06, Münchener Abkommen, Unterschrift Adolf Hitler.jpg",
              "caption": "Firma vinculada al Acuerdo de Múnich.",
              "usage": "Marca el momento documental del acuerdo.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-H13039, Münchener Abkommen, Rückkehr Hitler.jpg",
              "caption": "Regreso tras Múnich.",
              "usage": "Se utiliza como transición del riesgo de guerra a la ocupación pactada.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "alert_hold",
              "title": "MANTENER ALERTA ALTA",
              "tag": "PRUDENCIA",
              "desc": "No relajar preparación hasta recibir órdenes firmes.",
              "effects": {
                "cohesion": 3,
                "fatigue": 5,
                "fuel": -2
              },
              "next": "occupation",
              "result": "Las fuerzas están listas para moverse, pero el coste humano aumenta."
            },
            {
              "id": "staged_release",
              "title": "LIBERAR ESCALONES",
              "tag": "SOSTENIBILIDAD",
              "desc": "Reducir alerta en unidades no esenciales.",
              "effects": {
                "fatigue": -4,
                "fuel": 3,
                "movement": -2
              },
              "next": "occupation",
              "result": "Se recupera capacidad, con algo menos de rapidez inmediata."
            }
          ]
        },
        "occupation": {
          "id": "occupation",
          "date": "1 OCT 1938",
          "time": "07:00",
          "urgency": "EINMARSCHBEFEHL",
          "from": "OKH · Operaciones",
          "title": "Ocupar los Sudetes sin convertirlo en una batalla",
          "classification": "HECHO HISTÓRICO + SIMULACIÓN DE MOVIMIENTO",
          "body": [
            "El acuerdo transforma una posible campaña en una ocupación escalonada. El problema operativo ahora es mover fuerzas por zonas asignadas, evitar congestión y tomar control de infraestructura.",
            "La ausencia de batalla no elimina la necesidad de disciplina."
          ],
          "historical": [
            "Las tropas alemanas ocuparon las regiones sudetas entre el 1 y el 10 de octubre de 1938.",
            "La cesión incluyó importantes posiciones defensivas fronterizas checoslovacas."
          ],
          "intel": "La resistencia militar prevista ha desaparecido, pero el detalle local de carreteras, instalaciones y fortificaciones sigue variando.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 146-2006-0015, Einmarsch Sudetenland, Leitmeritz.jpg",
              "caption": "Entrada de tropas en Leitmeritz.",
              "usage": "Ilustra la ocupación escalonada.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 146-1972-061-34, Anschluss sudetendeutscher Gebiete.jpg",
              "caption": "Incorporación de zonas sudetas.",
              "usage": "Funciona como parte fotográfico de avance.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 146-1991-075-00, Reichenau, Einmarsch deutscher Truppen.jpg",
              "caption": "Entrada de tropas alemanas en Reichenau.",
              "usage": "Se usa para comparar ritmos de entrada y control local.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "phase_zones",
              "title": "ENTRADA POR FASES",
              "tag": "CONTROL",
              "desc": "Respetar estrictamente zonas y horarios.",
              "effects": {
                "cohesion": 6,
                "movement": -2,
                "communications": 3
              },
              "next": "fortifications",
              "result": "La ocupación es ordenada y fácil de documentar."
            },
            {
              "id": "rapid_control",
              "title": "CONTROL RÁPIDO DE NODOS",
              "tag": "VELOCIDAD",
              "desc": "Priorizar carreteras, puentes y centros de mando.",
              "effects": {
                "movement": 6,
                "fuel": -3,
                "reconnaissance": 3
              },
              "next": "fortifications",
              "result": "Los nodos clave quedan bajo control antes, con más dispersión entre unidades."
            }
          ]
        },
        "fortifications": {
          "id": "fortifications",
          "date": "10 OCT 1938",
          "time": "15:45",
          "urgency": "TECHNISCHER BERICHT",
          "from": "Inspección de fortificaciones",
          "title": "Lo que habría costado atacar",
          "classification": "HECHO HISTÓRICO + ANÁLISIS TÉCNICO",
          "body": [
            "Con la ocupación completada, los ingenieros pueden examinar posiciones que días antes habrían sido objetivos de guerra.",
            "La escena obliga al jugador a convertir una fortificación capturada sin combate en conocimiento para futuras operaciones."
          ],
          "historical": [
            "Las defensas fronterizas checoslovacas formaban parte de la zona cedida.",
            "La ocupación permitió a Alemania estudiar instalaciones y posiciones defensivas."
          ],
          "intel": "La inspección física ofrece información de alta confianza, aunque no reproduce cómo habría funcionado la defensa bajo combate.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 146-2003-0038, Besetzung Sudetenland, Panzerwerk.jpg",
              "caption": "Fortificación en los Sudetes ocupados.",
              "usage": "Se convierte en dossier técnico de ingeniería.",
              "chronology": "contemporary"
            },
            {
              "file": "De1938~w.png",
              "caption": "Mapa/diagrama de Alemania en 1938.",
              "usage": "Actualiza la imagen territorial tras las anexiones.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "engineer_study",
              "title": "ESTUDIO DE INGENIERÍA",
              "tag": "FORTIFICACIÓN",
              "desc": "Catalogar soluciones constructivas y vulnerabilidades.",
              "effects": {
                "reconnaissance": 6,
                "ammunition": 3
              },
              "next": "graf_zeppelin",
              "result": "El Heer obtiene un archivo técnico de defensas modernas."
            },
            {
              "id": "mobility_study",
              "title": "ESTUDIO DE ACCESOS",
              "tag": "MOVILIDAD",
              "desc": "Centrarse en rutas, obstáculos y aproximaciones.",
              "effects": {
                "movement": 5,
                "reconnaissance": 4
              },
              "next": "graf_zeppelin",
              "result": "Las lecciones se traducen en mejores planes de aproximación."
            }
          ]
        },
        "graf_zeppelin": {
          "id": "graf_zeppelin",
          "date": "8 DEC 1938",
          "time": "14:30",
          "urgency": "RÜSTUNGSSTAND",
          "from": "OKW · Informe industrial",
          "title": "Graf Zeppelin: otra promesa del rearme",
          "classification": "HECHO HISTÓRICO + CONTEXTO INTERARMAS",
          "body": [
            "La botadura del portaaviones Graf Zeppelin cierra el año con otra demostración de ambición industrial.",
            "Para el Heer, la pregunta sigue siendo la misma: cuánto poder potencial puede financiarse al mismo tiempo sin vaciar logística y producción terrestre."
          ],
          "historical": [
            "El portaaviones Graf Zeppelin fue botado en diciembre de 1938.",
            "El programa naval competía por capacidad industrial con otras ramas de las fuerzas armadas."
          ],
          "intel": "Los calendarios de construcción son públicos dentro del aparato militar; su utilidad futura sigue siendo incierta.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 146-1984-097-36, Flugzeugträger \"Graf Zeppelin\" nach Stapellauf.jpg",
              "caption": "Graf Zeppelin tras su botadura.",
              "usage": "Documenta el hito naval de diciembre de 1938.",
              "chronology": "contemporary"
            },
            {
              "file": "Bundesarchiv Bild 183-2006-0810-500, Flugzeugträger \"Graf Zeppelin\", Hitler bei Stapellauf.jpg",
              "caption": "Hitler durante la botadura del Graf Zeppelin.",
              "usage": "Sitúa la dimensión política e industrial del programa.",
              "chronology": "contemporary"
            }
          ],
          "choices": [
            {
              "id": "land_readiness",
              "title": "CIERRE CON PRIORIDAD TERRESTRE",
              "tag": "HEER",
              "desc": "Solicitar que 1939 se enfoque en preparación terrestre.",
              "effects": {
                "movement": 4,
                "fuel": 4,
                "communications": 2
              },
              "next": "year_end_archive",
              "result": "El Heer entra en 1939 con una orientación más clara hacia movilidad y sostenimiento."
            },
            {
              "id": "balanced_rearm",
              "title": "CIERRE INTERARMAS",
              "tag": "OKW",
              "desc": "Mantener equilibrio de programas.",
              "effects": {
                "command": 1,
                "cohesion": 4,
                "movement": -1
              },
              "next": "year_end_archive",
              "result": "El reparto sigue siendo amplio, con menor margen específico para el Ejército."
            }
          ]
        },
        "year_end_archive": {
          "id": "year_end_archive",
          "date": "31 DEC 1938",
          "time": "18:00",
          "urgency": "JAHRESABSCHLUSS",
          "from": "Archiv des Generalstabs",
          "title": "1938 termina, la siguiente campaña ya se insinúa",
          "classification": "ARCHIVO RETROSPECTIVO · NO CONTEMPORÁNEO",
          "body": [
            "El archivo incorpora una fotografía posterior del Lützow como consecuencia del programa naval en marcha. No representa un hecho de 1938 y el juego lo marca de forma explícita.",
            "El Capítulo I termina con una idea: la reorganización del mando, la expansión territorial y las pruebas logísticas de 1938 han creado las condiciones de la campaña que comenzará en 1939."
          ],
          "historical": [
            "El Lützow pertenece a una fase posterior del programa naval y se muestra únicamente como archivo retrospectivo.",
            "El siguiente capítulo del juego será Fall Weiss, Polonia, septiembre de 1939."
          ],
          "intel": "El balance anual es retrospectivo y separa de forma visible hechos de 1938 de material posterior.",
          "visuals": [
            {
              "file": "Bundesarchiv Bild 101II-MN-1038-06, Kiel, Schwerer Kreuzer \"Lützow\".jpg",
              "caption": "Crucero Lützow en archivo posterior.",
              "usage": "Muestra el resultado posterior de decisiones industriales iniciadas antes; nunca se presenta como fotografía de 1938.",
              "chronology": "retrospective-archive"
            }
          ],
          "choices": [],
          "endText": "FIN DEL CAPÍTULO I · 1938\nSiguiente: FALL WEISS · Polonia, septiembre de 1939."
        }
      },
      "sources": [
        {
          "short": "USHMM · Ejército y régimen",
          "title": "Timeline of the German Military and the Nazi Regime",
          "publisher": "United States Holocaust Memorial Museum",
          "url": "https://encyclopedia.ushmm.org/content/en/article/timeline-of-the-german-military-and-the-nazi-regime"
        },
        {
          "short": "USHMM · Austria",
          "title": "German Annexation of Austria",
          "publisher": "United States Holocaust Memorial Museum",
          "url": "https://encyclopedia.ushmm.org/content/en/timeline-event/holocaust/1933-1938/german-annexation-of-austria"
        },
        {
          "short": "USHMM · Múnich",
          "title": "Munich Agreement",
          "publisher": "United States Holocaust Memorial Museum",
          "url": "https://encyclopedia.ushmm.org/content/en/timeline-event/holocaust/1933-1938/munich-agreement"
        },
        {
          "short": "Archivo visual",
          "title": "Recursos de Bundesarchiv y Wikimedia Commons usados en la campaña",
          "publisher": "Wikimedia Commons / Bundesarchiv",
          "url": "https://commons.wikimedia.org/"
        }
      ]
    },
    "ch1": {
      "title": "CAPÍTULO I · FALL WEISS",
      "subtitle": "Polonia · 1 de septiembre de 1939",
      "protagonist": "General der Panzertruppe Heinz Guderian",
      "command": "XIX. Armeekorps (mot.) · 4. Armee · Heeresgruppe Nord",
      "startDate": "31 AGO 1939",
      "startTime": "23:35",
      "startScene": "briefing",
      "assets": {
        "heroUrl": "https://upload.wikimedia.org/wikipedia/commons/d/df/Bundesarchiv_Bild_101I-012-0035-11A%2C_Polen%2C_Panzer_I_und_Infanterie.jpg",
        "campaignMapUrl": "https://upload.wikimedia.org/wikipedia/commons/8/8d/Poland1939_GermanPlanMap.jpg",
        "staffUrl": "https://upload.wikimedia.org/wikipedia/commons/9/99/Bundesarchiv_Bild_101I-001-0256-31%2C_Warschau%2C_Generale_v._Weichs%2C_Blaskowitz.jpg"
      },
      "dossier": [
        "Alemania invade Polonia en la madrugada del 1 de septiembre de 1939. El ataque no es una respuesta defensiva: la justificación propagandística alemana se apoya, entre otros elementos, en un ataque fingido contra la emisora de Gleiwitz.",
        "Tu mando es el XIX. Armeekorps motorizado. Su función inicial dentro del 4.º Ejército es contribuir a cortar el Corredor Polaco y avanzar hacia el Vístula.",
        "Bajo el cuerpo se encuentran la 3. Panzer-Division, la 2. Infanterie-Division (mot.) y la 20. Infanterie-Division (mot.). La velocidad importa, pero también el combustible, los puentes, las carreteras, la niebla, el tráfico y la cohesión entre columnas."
      ],
      "resources": {
        "command": 8,
        "communications": 78,
        "fuel": 86,
        "ammunition": 88,
        "movement": 82,
        "cohesion": 84,
        "reconnaissance": 49,
        "fatigue": 8
      },
      "formations": [
        {
          "id": "3pz",
          "name": "3. Panzer-Division",
          "commander": "Generalleutnant Leo Geyr von Schweppenburg",
          "role": "Schwerpunkt blindado",
          "readiness": 90,
          "supply": 89,
          "position": "Frontera de Pomerania"
        },
        {
          "id": "2mot",
          "name": "2. Infanterie-Division (mot.)",
          "commander": "Generalleutnant Paul Bader",
          "role": "Infantería motorizada",
          "readiness": 86,
          "supply": 91,
          "position": "Centro del dispositivo"
        },
        {
          "id": "20mot",
          "name": "20. Infanterie-Division (mot.)",
          "commander": "Generalleutnant Mauritz von Wiktorin",
          "role": "Ala septentrional",
          "readiness": 84,
          "supply": 88,
          "position": "Norte del dispositivo"
        }
      ],
      "staff": [
        {
          "id": "ia",
          "rank": "Oberst i.G.",
          "name": "Friedrich Keller",
          "role": "Ia · Operaciones",
          "fictional": true,
          "trust": 70,
          "note": "Insiste en preservar el ritmo de marcha y evitar que las columnas se mezclen en los cruces."
        },
        {
          "id": "ic",
          "rank": "Major i.G.",
          "name": "Ernst Weber",
          "role": "Ic · Inteligencia",
          "fictional": true,
          "trust": 65,
          "note": "La información sobre las posiciones polacas al otro lado de la frontera es incompleta y envejece rápido."
        },
        {
          "id": "qu",
          "rank": "Oberstleutnant",
          "name": "Otto Hartmann",
          "role": "Qu · Logística",
          "fictional": true,
          "trust": 72,
          "note": "Advierte que velocidad y combustible no son lo mismo: una columna detenida también consume tiempo y capacidad de transporte."
        }
      ],
      "scenes": {
        "briefing": {
          "id": "briefing",
          "date": "31 AGO 1939",
          "time": "23:35",
          "urgency": "GEHEIME KOMMANDOSACHE",
          "from": "4. Armee · Estado Mayor",
          "title": "La orden entra en vigor",
          "classification": "HECHO HISTÓRICO + RECONSTRUCCIÓN NARRATIVA",
          "body": [
            "Las órdenes están confirmadas. El ataque comenzará a las 04:45. La misión del 4.º Ejército es romper el Corredor Polaco y establecer la conexión operativa hacia Prusia Oriental.",
            "Tu cuerpo motorizado debe mantener velocidad y cohesión. Las carreteras son limitadas y el movimiento simultáneo de blindados, infantería motorizada, artillería y trenes logísticos puede crear sus propios atascos.",
            "No dispones de un mapa omnisciente. Lo que tienes sobre la mesa son partes de reconocimiento, estimaciones y horarios."
          ],
          "historical": [
            "Alemania atacó Polonia el 1 de septiembre de 1939, iniciando la Segunda Guerra Mundial en Europa.",
            "El XIX Cuerpo motorizado de Guderian estaba subordinado al 4.º Ejército del Grupo de Ejércitos Norte y participó en el ataque para cortar el Corredor Polaco.",
            "La hora de ataque fijada para el 1 de septiembre fue las 04:45."
          ],
          "intel": "La información disponible antes del cruce de frontera es incompleta y pierde valor rápidamente con el movimiento.",
          "visuals": [],
          "choices": [
            {
              "id": "forward_hq",
              "title": "PUESTO DE MANDO MUY ADELANTADO",
              "tag": "AGRESIVO",
              "desc": "Seguir de cerca al Schwerpunkt para reducir retrasos de mando.",
              "effects": {
                "command": -1,
                "communications": 4,
                "movement": 2,
                "reconnaissance": 3,
                "fatigue": 5
              },
              "next": "fog",
              "result": "Trasladas el puesto de mando hacia delante. La imagen táctica llega antes, pero el Estado Mayor queda más expuesto al caos de las columnas y al fuego amigo."
            },
            {
              "id": "mobile_hq",
              "title": "MANDO MÓVIL ESCALONADO",
              "tag": "EQUILIBRADO",
              "desc": "Mantener un puesto móvil detrás de la vanguardia y enlaces adelantados.",
              "effects": {
                "communications": 2,
                "cohesion": 3,
                "movement": 1,
                "fatigue": 2
              },
              "next": "fog",
              "result": "El Estado Mayor avanza por saltos. Pierdes algo de inmediatez a cambio de una red de mando más estable."
            },
            {
              "id": "rear_hq",
              "title": "PUESTO DE MANDO EN RETAGUARDIA",
              "tag": "PRUDENTE",
              "desc": "Priorizar comunicaciones y control de tráfico por encima del contacto directo.",
              "effects": {
                "communications": 6,
                "cohesion": 4,
                "reconnaissance": -3,
                "movement": -2
              },
              "next": "fog",
              "result": "El mando conserva una red de comunicaciones ordenada, pero los informes de vanguardia tardan más en llegar."
            }
          ]
        },
        "fog": {
          "id": "fog",
          "date": "1 SEP 1939",
          "time": "05:20",
          "urgency": "PARTE DE VANGUARDIA",
          "from": "3. Panzer-Division",
          "title": "Niebla, columnas y fuego propio",
          "classification": "HECHO HISTÓRICO + DECISIÓN DEL JUGADOR",
          "body": [
            "La madrugada está cubierta de niebla. La vanguardia informa de visibilidad reducida, caminos congestionados y contacto irregular con unidades polacas.",
            "Una batería propia ha abierto fuego demasiado cerca de elementos adelantados. El incidente revela el riesgo de llevar el mando y las columnas más rápidas por delante de la coordinación artillera.",
            "El ritmo de la operación aún no está roto, pero cada parada se propaga hacia atrás por kilómetros de carretera."
          ],
          "historical": [
            "Las operaciones comenzaron el 1 de septiembre. Guderian acompañó personalmente a elementos de la 3. Panzer-Division durante el avance inicial.",
            "Relatos posteriores describen un incidente en el que su vehículo quedó bajo fuego de artillería propia en condiciones de niebla.",
            "El XIX Cuerpo estaba compuesto por la 3. Panzer-Division y las 2.ª y 20.ª divisiones de infantería motorizada."
          ],
          "intel": "La niebla reduce la observación directa. Partes de vanguardia y radio no llegan siempre en el mismo orden en que ocurrieron los hechos.",
          "visuals": [],
          "choices": [
            {
              "id": "push_armor",
              "title": "MANTENER EL RITMO BLINDADO",
              "tag": "SCHWERPUNKT",
              "desc": "Ordenar a la 3. Panzer-Division que preserve el impulso y resolver los atascos detrás.",
              "effects": {
                "movement": 6,
                "fuel": -7,
                "cohesion": -4,
                "communications": -2,
                "fatigue": 4
              },
              "next": "chojnice",
              "result": "Los blindados mantienen el ritmo. Ganas tiempo operativo, pero la cola logística se estira y las unidades de apoyo pierden contacto temporalmente."
            },
            {
              "id": "traffic_control",
              "title": "REORDENAR COLUMNAS",
              "tag": "CONTROL",
              "desc": "Detener brevemente sectores de la marcha para separar artillería, blindados y trenes logísticos.",
              "effects": {
                "movement": -4,
                "cohesion": 8,
                "communications": 4,
                "fuel": -2,
                "fatigue": 1
              },
              "next": "chojnice",
              "result": "La marcha pierde minutos, pero los itinerarios quedan más limpios. La artillería y el suministro recuperan enlaces con las formaciones de cabeza."
            },
            {
              "id": "recon_first",
              "title": "RECONOCIMIENTO ANTES DE ACELERAR",
              "tag": "INFORMACIÓN",
              "desc": "Utilizar elementos de reconocimiento para aclarar cruces y resistencia antes de forzar el paso.",
              "effects": {
                "movement": -2,
                "reconnaissance": 9,
                "cohesion": 3,
                "fuel": -3
              },
              "next": "chojnice",
              "result": "El avance se hace algo más lento, pero la siguiente orden se emitirá con una imagen táctica menos borrosa."
            }
          ]
        },
        "chojnice": {
          "id": "chojnice",
          "date": "1 SEP 1939",
          "time": "09:45",
          "urgency": "SITUATIONSMELDUNG",
          "from": "Ia · XIX. Armeekorps",
          "title": "El corredor empieza a cerrarse",
          "classification": "HECHO HISTÓRICO + SIMULACIÓN OPERACIONAL",
          "body": [
            "Las columnas avanzan hacia el interior del Corredor Polaco. La resistencia no es uniforme: algunos sectores ceden, otros obligan a desplegar desde la marcha.",
            "Tu problema ya no es únicamente romper la primera línea. Debes impedir que el cuerpo se convierta en tres divisiones avanzando a velocidades distintas y sin una reserva útil.",
            "El objetivo operacional sigue siendo cortar el corredor y alcanzar las líneas del Vístula con la mayor rapidez compatible con la cohesión."
          ],
          "historical": [
            "Fuentes contemporáneas y estudios posteriores sitúan al XIX Cuerpo avanzando por el sector del Corredor Polaco durante el primer día.",
            "El 4.º Ejército había alcanzado la línea Konitz-Nakel al final del 1 de septiembre según un estudio histórico estadounidense de la campaña.",
            "La misión general del 4.º Ejército era cortar el corredor con rapidez y avanzar hacia el Vístula."
          ],
          "intel": "El frente se mueve con rapidez. La posición exacta de unidades polacas puede quedar obsoleta antes de que un parte llegue al cuerpo.",
          "visuals": [],
          "choices": [
            {
              "id": "concentrate",
              "title": "CONCENTRAR EL ESFUERZO",
              "tag": "OPERACIONAL",
              "desc": "Reforzar el eje principal y aceptar menor presión en sectores secundarios.",
              "effects": {
                "command": -1,
                "movement": 5,
                "ammunition": -5,
                "cohesion": 2,
                "reconnaissance": -2
              },
              "next": "brda",
              "result": "El cuerpo concentra potencia en el eje principal. El avance gana densidad, pero la información de los flancos se vuelve más delgada."
            },
            {
              "id": "broad_front",
              "title": "MANTENER FRENTE AMPLIO",
              "tag": "SEGURIDAD",
              "desc": "Sostener presión simultánea para reducir sorpresas sobre los flancos.",
              "effects": {
                "movement": -3,
                "cohesion": 4,
                "reconnaissance": 5,
                "ammunition": -3,
                "fatigue": 2
              },
              "next": "brda",
              "result": "La presión se mantiene en una anchura mayor. El riesgo de una sorpresa disminuye, aunque el Schwerpunkt pierde algo de velocidad."
            },
            {
              "id": "pause_support",
              "title": "PAUSA DE APOYO Y REABASTECIMIENTO",
              "tag": "LOGÍSTICA",
              "desc": "Dar prioridad a artillería, combustible y reparación antes del siguiente salto.",
              "effects": {
                "movement": -6,
                "fuel": 7,
                "ammunition": 6,
                "cohesion": 6,
                "fatigue": -4
              },
              "next": "brda",
              "result": "Los trenes de apoyo alcanzan a las vanguardias. Cedes tiempo, pero el cuerpo entra en la siguiente fase con mayor capacidad de sostener combate."
            }
          ]
        },
        "brda": {
          "id": "brda",
          "date": "1 SEP 1939",
          "time": "18:30",
          "urgency": "FIN DE JORNADA",
          "from": "Estado Mayor del XIX. Armeekorps",
          "title": "Primer día de guerra",
          "classification": "HECHO HISTÓRICO + RESULTADO DEL JUGADOR",
          "body": [
            "La luz cae sobre Pomerania. El cuerpo ha avanzado durante horas bajo presión de tiempo, tráfico y contactos dispersos.",
            "Tu Estado Mayor prepara el balance: no basta con medir kilómetros. Importa qué divisiones siguen cohesionadas, cuánto combustible queda disponible en vanguardia y cuánto tarda una orden en recorrer la columna.",
            "El primer capítulo termina aquí. El siguiente tramo continuará con la lucha en el área de los bosques de Tuchola y la carrera para cerrar el Corredor Polaco."
          ],
          "historical": [
            "Al final del 1 de septiembre el 4.º Ejército había penetrado profundamente en el Corredor Polaco.",
            "En los días siguientes, el XIX Cuerpo siguió avanzando hacia el Vístula y participó en el cierre del sector septentrional del corredor."
          ],
          "intel": "El balance del primer día depende tanto de lo que sabes como de lo que aún ignoras sobre fuerzas polacas intentando retirarse o contraatacar.",
          "visuals": [],
          "choices": [],
          "endText": "FIN DEL CAPÍTULO I · FALL WEISS\nEl siguiente tramo cubrirá los bosques de Tuchola y el cierre del Corredor Polaco."
        }
      },
      "sources": [
        {
          "short": "USHMM · Invasión de Polonia",
          "title": "Invasión de Polonia, otoño de 1939",
          "publisher": "United States Holocaust Memorial Museum",
          "url": "https://encyclopedia.ushmm.org/content/es/article/invasion-of-poland-fall-1939"
        },
        {
          "short": "U.S. military study",
          "title": "The German Campaign in Poland, September 1939",
          "publisher": "Historical study preserved by HyperWar/ibiblio",
          "url": "https://www.ibiblio.org/hyperwar/NHC/NewPDFs/GERMANY/GER%20German%20Campaign%20in%20Poland%20September%201939%2C%20Sept%201%20to%20Oct.%205.pdf"
        },
        {
          "short": "German Army OOB · 1 Sep 1939",
          "title": "German Army, 1 September 1939",
          "publisher": "General Staff / Nafziger Collection",
          "url": "https://www.generalstaff.org/NAF/Pt_I_1939-1940/939giaa.pdf"
        },
        {
          "short": "USMA map · Poland 1939",
          "title": "German plan of invasion of Poland, August 1939",
          "publisher": "United States Military Academy via Wikimedia Commons",
          "url": "https://commons.wikimedia.org/wiki/File:Poland1939_GermanPlanMap.jpg"
        },
        {
          "short": "Bundesarchiv · Panzer I",
          "title": "Polen, Panzer I und Infanterie",
          "publisher": "Bundesarchiv via Wikimedia Commons · CC BY-SA 3.0 DE",
          "url": "https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_101I-012-0035-11A,_Polen,_Panzer_I_und_Infanterie.jpg"
        },
        {
          "short": "Bundesarchiv · Stabsoffiziere",
          "title": "Warschau, Generale v. Weichs, Blaskowitz",
          "publisher": "Bundesarchiv via Wikimedia Commons · CC BY-SA 3.0 DE",
          "url": "https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_101I-001-0256-31,_Warschau,_Generale_v._Weichs,_Blaskowitz.jpg"
        }
      ]
    }
  }
};
