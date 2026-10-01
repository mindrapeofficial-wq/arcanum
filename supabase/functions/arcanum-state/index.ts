import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const ARCANUM_URL = "https://mrmvmoyysxuopqexbxfk.supabase.co";
const ARCANUM_KEY = "sb_publishable_tZEPJi2v7Tp-xDuVa0qWRw_geizIGoD";
const ALLOWED_ORIGINS = new Set(["https://arcanum-las-cinco-escuelas.onrender.com"]);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession:false, autoRefreshToken:false } }
);

// @duel-engine:begin
const STAT_META:any = {
  vitality:"Vida", strength:"Fuerza", agility:"Agilidad", speed:"Velocidad",
  endurance:"Resistencia", precision:"Precisión", will:"Voluntad", fortune:"Fortuna"
};

const WEAPONS:any[] = [
  {id:"ash_staff",name:"Bastón de Fresno",type:"Bastón",min:7,max:11,speed:0,block:4,school:"verdant",effect:"Regeneración +3%"},
  {id:"sun_blade",name:"Espada Solar",type:"Espada",min:8,max:13,speed:1,block:3,school:"ascendant",effect:"Precisión +4%"},
  {id:"ember_maul",name:"Martillo de Ascua",type:"Martillo",min:11,max:17,speed:-2,block:1,school:"eradication",effect:"Crítico +5%"},
  {id:"void_scythe",name:"Guadaña del Vacío",type:"Guadaña",min:9,max:15,speed:-1,block:2,school:"abyssal",effect:"Robo de vida +6%"},
  {id:"glass_daggers",name:"Dagas de Cristal",type:"Dagas",min:6,max:10,speed:3,block:0,school:"phantasm",effect:"Ataque doble +8%"},
  {id:"iron_sword",name:"Espada de Hierro",type:"Espada",min:8,max:12,speed:0,block:2,school:null,effect:"Equilibrada"},
  {id:"war_axe",name:"Hacha de Guerra",type:"Hacha",min:10,max:16,speed:-1,block:1,school:null,effect:"Daño alto"},
  {id:"hunter_bow",name:"Arco del Cazador",type:"Arco",min:7,max:12,speed:2,block:0,school:null,effect:"Primer golpe +10%"},
  {id:"arcane_tome",name:"Grimorio Menor",type:"Grimorio",min:5,max:9,speed:0,block:1,school:null,effect:"Voluntad +2"},
  {id:"thorn_sickle",name:"Hoz de Espinas",type:"Hoz",min:8,max:14,speed:1,block:1,school:"verdant",effect:"Veneno +6%"}
];

const TRAITS:any[] = [
  {id:"forest_blood",name:"Sangre del Bosque",school:"verdant",desc:"+8% regeneración.",mods:{regen:.08}},
  {id:"solar_guard",name:"Guardia Solar",school:"ascendant",desc:"+8% bloqueo.",mods:{block:.08}},
  {id:"destructor",name:"Instinto Destructor",school:"eradication",desc:"+7% crítico.",mods:{crit:.07}},
  {id:"void_hunger",name:"Hambre del Vacío",school:"abyssal",desc:"+8% robo de vida.",mods:{lifesteal:.08}},
  {id:"ethereal",name:"Paso Etéreo",school:"phantasm",desc:"+7% esquiva.",mods:{dodge:.07}},
  {id:"colossus",name:"Coloso",school:null,desc:"+18% vida, -8% velocidad.",mods:{hp:.18,speed:-.08}},
  {id:"duelist",name:"Duelista",school:null,desc:"+5% crítico y +5% precisión.",mods:{crit:.05,accuracy:.05}},
  {id:"iron_skin",name:"Piel de Hierro",school:null,desc:"+10% resistencia.",mods:{armor:.10}},
  {id:"lucky",name:"Nacido con Fortuna",school:null,desc:"+10% Fortuna.",mods:{fortune:.10}},
  {id:"second_wind",name:"Segundo Aliento",school:null,desc:"Una vez por combate puede recuperar vida.",mods:{secondWind:true}}
];

const ABILITIES:any[] = [
  {id:"roots",name:"Raíces",school:"verdant",desc:"Puede inmovilizar y retrasar al rival."},
  {id:"toxic_spores",name:"Esporas Tóxicas",school:"verdant",desc:"Los impactos pueden aplicar veneno."},
  {id:"solar_aegis",name:"Égida Solar",school:"ascendant",desc:"Genera un escudo periódico."},
  {id:"judgement",name:"Juicio Radiante",school:"ascendant",desc:"Golpe preciso con bonificación contra rivales heridos."},
  {id:"flame_break",name:"Ruptura Ígnea",school:"eradication",desc:"Golpe explosivo de alto daño."},
  {id:"execution",name:"Ejecución",school:"eradication",desc:"Aumenta el daño contra objetivos con poca vida."},
  {id:"dark_pact",name:"Pacto Sombrío",school:"abyssal",desc:"Convierte parte del daño en curación."},
  {id:"soul_bite",name:"Mordisco del Alma",school:"abyssal",desc:"Reduce temporalmente la voluntad rival."},
  {id:"phase_step",name:"Paso Irreal",school:"phantasm",desc:"Puede evitar por completo un ataque."},
  {id:"mirror_strike",name:"Golpe Espejo",school:"phantasm",desc:"Puede repetir un ataque con daño reducido."},
  {id:"disarm",name:"Desarme",school:null,desc:"Pequeña probabilidad de reducir el daño del arma rival."},
  {id:"counter",name:"Contraataque",school:null,desc:"Puede responder inmediatamente tras bloquear."},
  {id:"weapon_master",name:"Maestro de Armas",school:null,desc:"+10% eficacia del arma equipada."},
  {id:"last_word",name:"Última Palabra",school:null,desc:"Pequeña probabilidad de atacar al caer."}
];



// Duel grades (Grado I-III): picking an ability you already own upgrades it instead of duplicating it.
const MAX_GRADE=3;
const GRADE_ROMAN=["","I","II","III"];
const pc=(x:number)=>Math.round(x*100)+"%";

// Abilities only reachable through level-up evolution. They are intentionally NOT part of ABILITIES,
// because baseProfile() draws from ABILITIES with a seeded RNG and existing Archmages must keep their kits.
const EVOLVE_ABILITIES:any[] = [
  {id:"ancestral_strength",name:"Fuerza Ancestral",school:null,desc:"La fuerza de generaciones de magos de guerra fluye por tu brazo."},
  {id:"arcane_grace",name:"Gracia Arcana",school:null,desc:"Tus pasos siguen una coreografía que sólo tú conoces."},
  {id:"swift_pulse",name:"Pulso Veloz",school:null,desc:"Tu hechizo late más rápido que el de tu rival."},
  {id:"vital_sap",name:"Savia Vital",school:"verdant",desc:"La savia de la Escuela te mantiene en pie mucho más tiempo."},
  {id:"imperishable",name:"Cuerpo Imperecedero",school:"abyssal",desc:"Tu cuerpo rechaza morir, a costa de moverte con pesadez."},
  {id:"foresight",name:"Visión Premonitoria",school:"phantasm",desc:"Ves el duelo antes de que ocurra y actúas con una calma letal."},
  {id:"arcane_fist",name:"Puño Arcano",school:"ascendant",desc:"Sin arma, tus puños brillan con luz propia."},
  {id:"ash_carapace",name:"Coraza de Ceniza",school:"eradication",desc:"Una costra de ceniza endurecida te protege, pero te ralentiza."},
  {id:"titan_arm",name:"Brazo de Titán",school:"eradication",desc:"Manejas armas pesadas como si fueran plumas."},
  {id:"lead_bones",name:"Huesos de Plomo",school:"abyssal",desc:"Tu esqueleto, pesado como plomo, amortigua los golpes contundentes."},
  {id:"iron_will",name:"Voluntad Inquebrantable",school:"ascendant",desc:"El primer golpe mortal del duelo te deja en pie, con 1 de vida."},
  {id:"veil_dance",name:"Danza del Velo",school:"phantasm",desc:"El primer ataque de cada duelo nunca te alcanza."},
  {id:"determination",name:"Determinación",school:null,desc:"Si tu golpe no hiere, insistes de inmediato."},
  {id:"stone_skin",name:"Piel de Roca",school:"verdant",desc:"Ningún golpe aislado puede arrancarte más que una fracción de tu vida."},
  {id:"basalt_skull",name:"Cráneo de Basalto",school:"eradication",desc:"Quien te golpea puede perder el arma contra tu cabeza."},
  {id:"thunder_chain",name:"Cadena de Trueno",school:"ascendant",desc:"Cada tercer impacto seguido aturde al rival."},
  {id:"quick_sap",name:"Savia Acelerada",school:"verdant",desc:"Si no te hieren, tu cuerpo se regenera con rapidez al estar malherido."},
  {id:"rune_grip",name:"Agarre Rúnico",school:null,desc:"Tu arma se aferra a tu mano: es difícil desarmarte o romperla."},
  {id:"monk_path",name:"Camino del Monje",school:"ascendant",desc:"Meditas una ronda de cada tres y devuelves los golpes que te alcanzan."},
  {id:"sixth_sense",name:"Sexto Sentido",school:"phantasm",desc:"Al esquivar un ataque, a veces respondes antes de que el rival se recupere."},
  {id:"reprisal",name:"Represalia",school:"eradication",desc:"Cuando te hieren, a veces actúas primero en la siguiente ronda."},
  {id:"arcane_sabotage",name:"Sabotaje Arcano",school:"eradication",desc:"Cada impacto puede destrozar el arma del rival."},
  {id:"weapon_swap",name:"Impostor de Armas",school:"phantasm",desc:"Al comenzar el duelo cambias tu arma por una copia de la del rival."}
];

// odds = relative draw weight (like El Bruto's perk odds); p/q = value per grade (I, II, III).
// Grade I of the original abilities reproduces the constants that were hard-coded in hit()/derived().
const ABILITY_META:any = {
  roots:{odds:10,p:[.12,.16,.20],fmt:(p:number)=>pc(p)+" de inmovilizar al rival por ronda"},
  toxic_spores:{odds:10,p:[.18,.24,.30],fmt:(p:number)=>pc(p)+" de envenenar al impactar"},
  solar_aegis:{odds:8,p:[.07,.09,.11],fmt:(p:number)=>"escudo de "+pc(p)+" de la vida máxima cada 4 rondas"},
  judgement:{odds:8,p:[.18,.24,.30],fmt:(p:number)=>pc(p)+" de golpe radiante (+30%) contra rivales bajo 55% de vida"},
  flame_break:{odds:8,p:[.16,.21,.26],fmt:(p:number)=>pc(p)+" de golpe explosivo (+45% de daño)"},
  execution:{odds:8,p:[1.25,1.35,1.45],fmt:(p:number)=>"+"+Math.round((p-1)*100)+"% de daño contra rivales bajo 35% de vida"},
  dark_pact:{odds:8,p:[.08,.11,.14],fmt:(p:number)=>pc(p)+" del daño causado se convierte en curación"},
  soul_bite:{odds:8,p:[.12,.16,.20],fmt:(p:number)=>pc(p)+" de debilitar el siguiente ataque rival"},
  phase_step:{odds:8,p:[.08,.11,.14],fmt:(p:number)=>"+"+pc(p)+" de esquiva"},
  mirror_strike:{odds:8,p:[.25,.32,.39],fmt:(p:number)=>pc(p)+" de repetir el golpe con daño reducido"},
  disarm:{odds:12,p:[.10,.14,.18],fmt:(p:number)=>pc(p)+" de desarmar al rival en su próximo ataque"},
  counter:{odds:12,p:[.25,.33,.41],fmt:(p:number)=>pc(p)+" de contraatacar tras bloquear"},
  weapon_master:{odds:10,p:[.10,.14,.18],fmt:(p:number)=>"+"+pc(p)+" de ataque"},
  last_word:{odds:6,p:[.35,.45,.55],fmt:(p:number)=>pc(p)+" de atacar al caer"},
  ancestral_strength:{odds:60,p:[1,1.5,2],fmt:(p:number)=>"+"+String(p).replace(".",",")+" Fuerza"},
  arcane_grace:{odds:60,p:[2,3,4],fmt:(p:number)=>"+"+p+" Agilidad"},
  swift_pulse:{odds:60,p:[2,3,4],fmt:(p:number)=>"+"+p+" Velocidad"},
  vital_sap:{odds:60,p:[2,3,4],fmt:(p:number)=>"+"+p+" Vitalidad"},
  imperishable:{odds:1,p:[.20,.25,.30],q:[.10,.10,.10],fmt:(p:number,q:number)=>"+"+pc(p)+" de vida máxima, -"+pc(q||0)+" de ataque y velocidad"},
  foresight:{odds:6,p:[.08,.12,.16],q:[.02,.03,.04],fmt:(p:number,q:number)=>"+"+pc(p)+" de velocidad y +"+pc(q||0)+" de crítico"},
  arcane_fist:{odds:10,p:[.25,.35,.45],fmt:(p:number)=>"+"+pc(p)+" de ataque mientras estás desarmado"},
  ash_carapace:{odds:8,p:[.20,.25,.30],fmt:(p:number)=>"+"+pc(p)+" de armadura, -10% de velocidad"},
  titan_arm:{odds:8,p:[.06,.09,.12],fmt:(p:number)=>"+"+pc(p)+" de ataque con armas pesadas"},
  lead_bones:{odds:8,p:[.15,.20,.25],q:[.15,.20,.25],fmt:(p:number,q:number)=>"+"+pc(p)+" de armadura, -"+pc(q||0)+" de daño de armas contundentes, -2% de esquiva"},
  iron_will:{odds:8,p:[.10,.15,.20],fmt:(p:number)=>"sobrevives al primer golpe mortal con 1 de vida y ganas +"+pc(p)+" de esquiva y bloqueo"},
  veil_dance:{odds:8,p:[.60,.80,1],fmt:(p:number)=>pc(p)+" de esquivar automáticamente el primer ataque del duelo"},
  determination:{odds:8,p:[.30,.40,.50],fmt:(p:number)=>pc(p)+" de repetir el ataque si no hieres"},
  stone_skin:{odds:6,p:[.25,.20,.17],fmt:(p:number)=>"ningún golpe quita más de "+pc(p)+" de tu vida máxima"},
  basalt_skull:{odds:8,p:[.08,.12,.16],fmt:(p:number)=>pc(p)+" de que quien te hiere pierda su arma"},
  thunder_chain:{odds:10,p:[.40,.55,.70],fmt:(p:number)=>pc(p)+" de aturdir cada tercer impacto seguido"},
  quick_sap:{odds:10,p:[.06,.08,.10],fmt:(p:number)=>"bajo 50% de vida y sin recibir daño regeneras "+pc(p)+" (máx. 10 veces)"},
  rune_grip:{odds:10,p:[.50,.60,.70],fmt:(p:number)=>pc(p)+" de resistir desarmes y roturas de arma"},
  monk_path:{odds:4,p:[.50,.58,.66],fmt:(p:number)=>"meditas una de cada tres rondas; tras recibir un golpe contraatacas con "+pc(p)+" de probabilidad"},
  sixth_sense:{odds:20,p:[.25,.35,.45],fmt:(p:number)=>pc(p)+" de contraatacar al esquivar"},
  reprisal:{odds:10,p:[.30,.40,.50],fmt:(p:number)=>pc(p)+" de actuar primero tras recibir daño"},
  arcane_sabotage:{odds:6,p:[.06,.09,.12],fmt:(p:number)=>pc(p)+" de romper el arma rival al impactar"},
  weapon_swap:{odds:6,p:[.20,.25,.30],fmt:(p:number)=>"cambias tu arma por una copia de la rival (-"+pc(p)+" de daño) si es mejor"}
};

// Weapons only reachable through evolution (baseProfile keeps using WEAPONS). `mods` is data-driven:
// crit, accuracy, dodge, block, regen, lifesteal, combo (double strike), poison, first (first strike), armor, disarm.
const EXTRA_WEAPONS:any[] = [
  {id:"obsidian_dagger",name:"Daga de Obsidiana",type:"Daga",min:6,max:10,speed:3,block:0,school:null,effect:"Crítico +5%, esquiva +3%",odds:10,mods:{crit:.05,dodge:.03}},
  {id:"mist_fan",name:"Abanico de Bruma",type:"Abanico",min:6,max:10,speed:4,block:0,school:"phantasm",effect:"Esquiva +8%",odds:6,mods:{dodge:.08}},
  {id:"boiling_chalice",name:"Cáliz Hirviente",type:"Cáliz",min:7,max:12,speed:1,block:0,school:"verdant",effect:"Veneno +5%",odds:6,mods:{poison:.05}},
  {id:"resonant_lectern",name:"Atril Resonante",type:"Atril",min:7,max:12,speed:1,block:1,school:"ascendant",effect:"Ataque doble +6%, precisión +3%",odds:2,mods:{combo:.06,accuracy:.03}},
  {id:"mandrake_root",name:"Raíz de Mandrágora",type:"Raíz",min:6,max:12,speed:2,block:0,school:"verdant",effect:"Ataque doble +8%, regeneración +2%",odds:4,mods:{combo:.08,regen:.02}},
  {id:"sun_lance",name:"Lanza de Luz",type:"Lanza",min:9,max:13,speed:0,block:3,school:"ascendant",effect:"Precisión +4%, crítico +4%",odds:8,mods:{accuracy:.04,crit:.04}},
  {id:"abyssal_trident",name:"Tridente Abisal",type:"Tridente",min:10,max:14,speed:-1,block:2,school:"abyssal",effect:"Robo de vida +4%, desarme +5%",odds:6,mods:{lifesteal:.04,disarm:.05}},
  {id:"root_whip",name:"Látigo de Raíces",type:"Látigo",min:7,max:13,speed:1,block:0,school:"verdant",effect:"Esquiva +5%, desarme +6%",odds:4,mods:{dodge:.05,disarm:.06}},
  {id:"ember_scimitar",name:"Cimitarra Ígnea",type:"Cimitarra",min:9,max:14,speed:1,block:2,school:"eradication",effect:"Crítico +6%",odds:8,mods:{crit:.06}},
  {id:"colossus_mallet",name:"Mazo del Coloso",type:"Mazo",min:10,max:16,speed:-3,block:1,school:"eradication",effect:"Arma pesada · precisión +5%",odds:4,heavy:true,blunt:true,mods:{accuracy:.05}},
  {id:"chain_flail",name:"Mangual de Cadenas",type:"Mangual",min:10,max:15,speed:-2,block:0,school:"abyssal",effect:"Arma pesada · precisión +8%, ataque doble +6%",odds:4,heavy:true,blunt:true,mods:{accuracy:.08,combo:.06}},
  {id:"behemoth_rib",name:"Costilla de Behemot",type:"Costilla",min:10,max:15,speed:-1,block:1,school:"verdant",effect:"Arma pesada · crítico +5%, armadura +2",odds:6,heavy:true,blunt:true,mods:{crit:.05,armor:2}},
  {id:"black_cauldron",name:"Caldero de Hierro Negro",type:"Caldero",min:8,max:14,speed:-1,block:5,school:null,effect:"Arma pesada · bloqueo alto",odds:2,heavy:true,blunt:true,mods:{}},
  {id:"war_horn",name:"Cuerno de Guerra",type:"Cuerno",min:9,max:15,speed:-2,block:3,school:"ascendant",effect:"Arma pesada · desarme +8%",odds:2,heavy:true,blunt:true,mods:{disarm:.08}},
  {id:"morning_star",name:"Lucero del Alba",type:"Lucero",min:11,max:16,speed:-1,block:1,school:"eradication",effect:"Arma pesada · crítico +4%, desarme +4%",odds:6,heavy:true,blunt:true,mods:{crit:.04,disarm:.04}},
  {id:"crystal_stars",name:"Estrellas de Cristal",type:"Estrellas",min:5,max:9,speed:4,block:0,school:"phantasm",effect:"Ataque doble +10%, esquiva +5%",odds:4,mods:{combo:.10,dodge:.05}},
  {id:"light_bird",name:"Pajarillo de Luz",type:"Pajarillo",min:6,max:10,speed:4,block:0,school:"ascendant",effect:"Esquiva +8%, desarme +8%",odds:2,mods:{dodge:.08,disarm:.08}},
  {id:"mana_bowl",name:"Cuenco de Maná",type:"Cuenco",min:7,max:12,speed:2,block:0,school:null,effect:"Ataque doble +5%, precisión +3%",odds:2,mods:{combo:.05,accuracy:.03}},
  {id:"reflect_disc",name:"Disco Reflectante",type:"Disco",min:5,max:10,speed:1,block:5,school:"ascendant",effect:"Bloqueo +4%, esquiva +3%",odds:2,mods:{block:.04,dodge:.03}},
  {id:"conclave_halberd",name:"Alabarda del Cónclave",type:"Alabarda",min:10,max:15,speed:-1,block:2,school:null,effect:"Desarme +5%",odds:4,mods:{disarm:.05}}
];

const HEAVY_TYPES=["Martillo","Hacha","Guadaña"];
const BLUNT_TYPES=["Martillo"];
function isHeavy(w:any){return !!w?.heavy||HEAVY_TYPES.includes(w?.type)}
function isBlunt(w:any){return !!w?.blunt||BLUNT_TYPES.includes(w?.type)}
// @duel-engine:end
const INVENTORY_CAP=20;
const EMPTY_EQUIPMENT={weapon:null,robe:null,amulet:null,ring1:null,ring2:null,focus:null};
const LOOT_RARITIES:any[]=[
  {key:"common",label:"Común",weight:5200,affixes:1,power:1},
  {key:"uncommon",label:"Poco común",weight:2800,affixes:2,power:1.08},
  {key:"rare",label:"Raro",weight:1400,affixes:3,power:1.2},
  {key:"epic",label:"Épico",weight:500,affixes:4,power:1.38},
  {key:"legendary",label:"Legendario",weight:90,affixes:5,power:1.65},
  {key:"arcane",label:"Arcano",weight:10,affixes:6,power:2.05}
];
const LOOT_BASES:any[]=[
  {id:"ash_staff",slot:"weapon",name:"Báculo de Fresno",minLevel:1,implicit:{arcane_power:[1,4]}},
  {id:"bone_wand",slot:"weapon",name:"Vara de Hueso",minLevel:1,implicit:{knowledge:[1,3]}},
  {id:"thorn_scepter",slot:"weapon",name:"Cetro de Espinas",minLevel:5,implicit:{willpower:[2,5]}},
  {id:"astral_rod",slot:"weapon",name:"Vara Astral",minLevel:10,implicit:{arcane_power:[3,7]}},
  {id:"novice_robe",slot:"robe",name:"Túnica del Iniciado",minLevel:1,implicit:{willpower:[1,4]}},
  {id:"veil_mantle",slot:"robe",name:"Manto del Velo",minLevel:5,implicit:{knowledge:[2,5]}},
  {id:"war_mantle",slot:"robe",name:"Manto del Conjurador",minLevel:10,implicit:{arcane_power:[2,6]}},
  {id:"amber_eye",slot:"amulet",name:"Ojo de Ámbar",minLevel:1,implicit:{knowledge:[1,4]}},
  {id:"moon_charm",slot:"amulet",name:"Talismán Lunar",minLevel:5,implicit:{willpower:[1,5]}},
  {id:"five_schools_medal",slot:"amulet",name:"Medallón de las Cinco Escuelas",minLevel:12,implicit:{influence:[2,6]}},
  {id:"iron_ring",slot:"ring",name:"Anillo de Hierro Negro",minLevel:1,implicit:{willpower:[1,3]}},
  {id:"obsidian_ring",slot:"ring",name:"Anillo de Obsidiana",minLevel:4,implicit:{arcane_power:[1,4]}},
  {id:"sigil_ring",slot:"ring",name:"Sello del Cónclave",minLevel:9,implicit:{influence:[2,5]}},
  {id:"root_heart",slot:"focus",name:"Corazón de Raíz",minLevel:1,implicit:{willpower:[2,4]}},
  {id:"glass_orb",slot:"focus",name:"Orbe de Vidrio Estelar",minLevel:6,implicit:{knowledge:[2,5]}},
  {id:"sealed_reliquary",slot:"focus",name:"Relicario Sellado",minLevel:12,implicit:{arcane_power:[3,6]}}
];
const LOOT_AFFIXES:any[]=[
  {id:"arcane",kind:"prefix",name:"Arcano",stat:"arcane_power",slots:["weapon","robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"learned",kind:"prefix",name:"Erudito",stat:"knowledge",slots:["weapon","robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"unyielding",kind:"prefix",name:"Inquebrantable",stat:"willpower",slots:["robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"sovereign",kind:"prefix",name:"Soberano",stat:"influence",slots:["amulet","ring","focus"],tiers:[[1,2],[2,4],[4,7],[7,11],[11,16]],schools:null},
  {id:"vital",kind:"suffix",name:"de la Vitalidad",stat:"life",slots:["robe","amulet","ring","focus"],tiers:[[4,8],[8,15],[15,24],[24,36],[36,52]],schools:null},
  {id:"mana",kind:"suffix",name:"del Manantial",stat:"mana",slots:["weapon","robe","amulet","ring","focus"],tiers:[[5,10],[10,18],[18,30],[30,45],[45,65]],schools:null},
  {id:"critical",kind:"suffix",name:"del Ojo Certero",stat:"critical",slots:["weapon","amulet","ring"],tiers:[[1,2],[2,3],[3,5],[5,7],[7,9]],schools:null},
  {id:"ward",kind:"suffix",name:"de la Barrera",stat:"ward",slots:["robe","amulet","focus"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["ascendant","phantasm"]},
  {id:"growth",kind:"suffix",name:"del Brote Eterno",stat:"regen",slots:["weapon","robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,6],[6,9],[9,13]],schools:["verdant"]},
  {id:"cinders",kind:"suffix",name:"de las Cenizas",stat:"school_damage",slots:["weapon","amulet","ring","focus"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["eradication"]},
  {id:"abyss",kind:"suffix",name:"del Abismo Susurrante",stat:"school_damage",slots:["weapon","amulet","ring","focus"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["abyssal"]},
  {id:"mirage",kind:"suffix",name:"del Espejismo",stat:"evasion",slots:["robe","amulet","ring","focus"],tiers:[[1,2],[2,4],[4,6],[6,9],[9,13]],schools:["phantasm"]},
  {id:"radiance",kind:"suffix",name:"de la Radiancia",stat:"ward",slots:["robe","amulet","focus"],tiers:[[2,4],[4,7],[7,11],[11,16],[16,23]],schools:["ascendant"]}
];

function cors(req:Request){
  const origin=req.headers.get("origin")||"";
  return {
    "Access-Control-Allow-Origin":ALLOWED_ORIGINS.has(origin)?origin:"https://arcanum-las-cinco-escuelas.onrender.com",
    "Access-Control-Allow-Headers":"authorization, content-type",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
    "Vary":"Origin"
  };
}
function json(req:Request,data:unknown,status=200){
  return new Response(JSON.stringify(data),{status,headers:{...cors(req),"Content-Type":"application/json","Cache-Control":"no-store"}});
}
function parts(req:Request){
  const p=new URL(req.url).pathname.replace(/\/+$/,"");
  const marker="/arcanum-state";
  const tail=p.includes(marker)?p.split(marker)[1]:p;
  return tail.split("/").filter(Boolean);
}
async function coreRpc(token:string,fn:string,args:Record<string,unknown>={}){
  const resp=await fetch(`${ARCANUM_URL}/rest/v1/rpc/${fn}`,{
    method:"POST",
    headers:{apikey:ARCANUM_KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
    body:JSON.stringify(args)
  });
  const raw=await resp.text();
  if(!resp.ok)throw new Error(`CORE_${fn}: ${raw}`);
  return raw?JSON.parse(raw):null;
}
async function identity(req:Request){
  const h=req.headers.get("authorization")||"";
  if(!h.startsWith("Bearer "))throw new Error("UNAUTHORIZED");
  const token=h.slice(7).trim();
  const auth=await fetch(`${ARCANUM_URL}/auth/v1/user`,{headers:{apikey:ARCANUM_KEY,Authorization:`Bearer ${token}`}});
  if(!auth.ok)throw new Error("UNAUTHORIZED");
  const user=await auth.json();
  const state=await coreRpc(token,"my_realm_state",{});
  const username=String(state?.realm?.mage_name||"").trim();
  const schoolCode=String(state?.realm?.school_code||"").trim();
  if(!username||!schoolCode)throw new Error("REALM_REQUIRED");
  const profile=await coreRpc(token,"player_profile",{p_mage_name:username});
  return {userId:String(user.id),username,schoolCode,token,realm:state?.realm||{},profile:profile||{}};
}

// @duel-engine:begin
function clone<T>(v:T):T{return JSON.parse(JSON.stringify(v))}
function hash(str:string){
  let h=2166136261;
  for(const ch of String(str)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
  return h>>>0;
}
function rngFrom(seed:string){
  let x=hash(seed)||0x9e3779b9;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296};
}
function pick<T>(rng:()=>number,arr:T[]):T{return arr[Math.floor(rng()*arr.length)]}
function levelFromProfile(p:any){
  if(Number.isFinite(Number(p?.archmage_level)))return Math.max(1,Math.min(50,Math.floor(Number(p.archmage_level))));
  const total=Math.max(0,Math.floor(Number(p?.archmage_total_xp)||0));
  let level=1,floor=0;
  while(level<50){
    const x=level-1,need=Math.round((100+45*x+2*x*x)/10)*10;
    if(total<floor+need)break;
    floor+=need;level++;
  }
  return level;
}
function baseProfile(name:string,school:string){
  const rng=rngFrom("ARCANUM|"+name.toLowerCase()+"|"+school+"|combat-v1");
  const stats:any={};
  Object.keys(STAT_META).forEach(k=>stats[k]=4+Math.floor(rng()*8));
  stats.vitality+=2+Math.floor(rng()*4);
  const affinity:any={
    verdant:["vitality","endurance","will"],ascendant:["precision","will","endurance"],
    eradication:["strength","fortune","precision"],abyssal:["will","strength","vitality"],
    phantasm:["agility","speed","precision"]
  };
  (affinity[school]||[]).forEach((k:string)=>stats[k]+=2+Math.floor(rng()*3));
  const wp=WEAPONS.filter(w=>!w.school||w.school===school);
  const weighted=wp.concat(wp.filter(w=>w.school===school),wp.filter(w=>w.school===school));
  const weapon=pick(rng,weighted);
  const tp=TRAITS.filter(t=>!t.school||t.school===school);
  const tw=tp.concat(tp.filter(t=>t.school===school));
  const trait=pick(rng,tw);
  const sa=ABILITIES.filter(a=>a.school===school);
  const ga=ABILITIES.filter(a=>!a.school);
  const a1=pick(rng,sa);
  let a2=pick(rng,ga.concat(sa));
  if(a2.id===a1.id)a2=pick(rng,ga);
  return {version:1,seed:hash(name+"|"+school+"|combat-v1"),generatedAt:"server",name,school,stats,
    weapon:clone(weapon),trait:clone(trait),bonusTraits:[],abilities:[clone(a1),clone(a2)],levelBonuses:[]};
}
function applyBonus(state:any,bonus:any){
  const e=bonus?.effect||{};
  if(e.type==="stat"&&STAT_META[e.stat])state.stats[e.stat]=Number(state.stats[e.stat]||0)+Number(e.amount||0);
  else if(e.type==="stats2"&&Array.isArray(e.stats))e.stats.forEach((x:any)=>{if(STAT_META[x?.stat])state.stats[x.stat]=Number(state.stats[x.stat]||0)+Number(x.amount||0)});
  else if(e.type==="ability"&&e.ability&&!state.abilities.some((x:any)=>x.id===e.ability.id))state.abilities.push({...clone(e.ability),grade:1});
  else if(e.type==="ability_upgrade"){const x=state.abilities.find((a:any)=>a.id===e.id);if(x)x.grade=Math.min(abilityMaxGrade(x.id),(Number(x.grade)||1)+1)}
  else if(e.type==="weapon"&&e.weapon)state.weapon=clone(e.weapon);
  else if(e.type==="trait"&&e.trait&&state.trait?.id!==e.trait.id&&!state.bonusTraits.some((x:any)=>x.id===e.trait.id))state.bonusTraits.push(clone(e.trait));
}
function effective(raw:any,maxLevel=Infinity){
  const state=clone(raw);state.bonusTraits=Array.isArray(state.bonusTraits)?state.bonusTraits:[];state.levelBonuses=[];
  state.abilities=(Array.isArray(state.abilities)?state.abilities:[]).map((a:any)=>({...a,grade:gradeOf([a],a.id)||1}));
  (raw.levelBonuses||[]).slice().sort((a:any,b:any)=>a.level-b.level).forEach((b:any)=>{if(Number(b.level)<=maxLevel){applyBonus(state,b);state.levelBonuses.push(clone(b))}});
  return state;
}
function pickWeighted<T>(rng:()=>number,arr:T[],weight:(x:T)=>number):T{
  const total=arr.reduce((s,x)=>s+Math.max(0,weight(x)),0);
  let r=rng()*total;
  if(total<=0)return arr[Math.floor(rng()*arr.length)];
  for(const x of arr){r-=Math.max(0,weight(x));if(r<0)return x}
  return arr[arr.length-1];
}
function allAbilities():any[]{return ABILITIES.concat(EVOLVE_ABILITIES)}
function abilityOdds(a:any){return Number(ABILITY_META[a?.id]?.odds)||10}
function abilityMaxGrade(id:string){return Number(ABILITY_META[id]?.maxGrade)||MAX_GRADE}
function gradeOf(list:any[],id:string){
  const x=(list||[]).find((a:any)=>a.id===id);
  return x?Math.max(1,Math.min(MAX_GRADE,Math.floor(Number(x.grade)||1))):0;
}
function abilityParam(list:any[],id:string,key:"p"|"q"="p"){
  const k=gradeOf(list,id),m=ABILITY_META[id];
  return k&&m&&m[key]?Number(m[key][k-1])||0:0;
}
function abilityDetail(id:string,grade:number){
  const m=ABILITY_META[id];
  if(!m||!grade)return "";
  return m.fmt(m.p[grade-1],m.q?m.q[grade-1]:undefined);
}
function abilityViews(list:any[]){
  return (list||[]).map((a:any)=>{
    const grade=gradeOf([a],a.id)||1;
    return {...clone(a),grade,max_grade:abilityMaxGrade(a.id),detail:abilityDetail(a.id,grade)};
  });
}
function rarityLabel(share:number){
  if(share>=.15)return "Común";
  if(share>=.06)return "Poco común";
  if(share>=.02)return "Rara";
  return "Muy rara";
}
function dualStatEvolution(rng:()=>number,level:number){
  const keys=Object.keys(STAT_META),first=pick(rng,keys);
  let second=pick(rng,keys);
  while(second===first)second=pick(rng,keys);
  return {id:`L${level}-stats-${first}-${second}`,kind:"stat",icon:"＋",title:`+1 ${STAT_META[first]} · +1 ${STAT_META[second]}`,desc:"Tu cuerpo arcano se adapta permanentemente.",
    effect:{type:"stats2",stats:[{stat:first,amount:1},{stat:second,amount:1}]}};
}
function statEvolution(rng:()=>number,level:number){
  const keys=Object.keys(STAT_META),stat=pick(rng,keys),amount=level%5===0?3:2;
  return {id:`L${level}-stat-${stat}-${amount}`,kind:"stat",icon:"＋",title:`+${amount} ${STAT_META[stat]}`,desc:"Tu cuerpo arcano se adapta permanentemente.",effect:{type:"stat",stat,amount}};
}
function abilityEvolution(rng:()=>number,raw:any,state:any,level:number){
  const pool=allAbilities().filter(a=>(!a.school||a.school===raw.school)&&gradeOf(state.abilities,a.id)<abilityMaxGrade(a.id));
  if(!pool.length)return dualStatEvolution(rng,level);
  const total=pool.reduce((s:number,a:any)=>s+abilityOdds(a),0);
  const picked=pickWeighted(rng,pool,abilityOdds),ability={id:picked.id,name:picked.name,school:picked.school,desc:picked.desc};
  const share=abilityOdds(picked)/total,owned=gradeOf(state.abilities,ability.id);
  const meta={rarity:rarityLabel(share),chance:Math.round(share*1000)/10};
  if(owned){
    const next=owned+1;
    return {id:`L${level}-ability-${ability.id}-g${next}`,kind:"ability",icon:"✦",title:`${ability.name} · Grado ${GRADE_ROMAN[next]}`,
      desc:`Mejora: ${abilityDetail(ability.id,owned)} → ${abilityDetail(ability.id,next)}.`,grade:next,...meta,effect:{type:"ability_upgrade",id:ability.id}};
  }
  return {id:`L${level}-ability-${ability.id}`,kind:"ability",icon:"✦",title:ability.name,desc:`${ability.desc} (${abilityDetail(ability.id,1)})`,grade:1,...meta,effect:{type:"ability",ability}};
}
function traitEvolution(rng:()=>number,raw:any,state:any,level:number){
  const owned=new Set([state.trait?.id].concat((state.bonusTraits||[]).map((x:any)=>x.id)));
  const pool=TRAITS.filter(t=>(!t.school||t.school===raw.school)&&!owned.has(t.id));
  if(!pool.length)return statEvolution(rng,level);
  const trait=clone(pick(rng,pool));
  return {id:`L${level}-trait-${trait.id}`,kind:"trait",icon:"◆",title:trait.name,desc:trait.desc,effect:{type:"trait",trait}};
}
function weaponEvolution(rng:()=>number,raw:any,state:any,level:number){
  const pool=WEAPONS.concat(EXTRA_WEAPONS).filter(w=>(!w.school||w.school===raw.school)&&w.id!==state.weapon?.id);
  if(!pool.length)return statEvolution(rng,level);
  const base=clone(pickWeighted(rng,pool,(w:any)=>Number(w.odds)||10)),bonus=1+Math.floor(level/5);
  delete base.odds;
  base.min+=bonus;base.max+=bonus*2;base.evolutionLevel=level;base.effect=base.effect+" · Forjada en nivel "+level;
  return {id:`L${level}-weapon-${base.id}-${bonus}`,kind:"weapon",icon:"⚔",title:base.name,desc:`${base.type} · ${base.min}–${base.max} daño · ${base.effect}`,effect:{type:"weapon",weapon:base}};
}
function evolutionOptions(raw:any,level:number){
  const before=effective(raw,level-1),rng=rngFrom(raw.seed+"|evolution|"+level+"|two-paths-v1");
  const factories=[statEvolution,abilityEvolution,traitEvolution,weaponEvolution];
  const first=factories[Math.floor(rng()*factories.length)];
  let second=factories[Math.floor(rng()*factories.length)];
  if(second===first)second=factories[(factories.indexOf(first)+1+Math.floor(rng()*3))%factories.length];
  const make=(f:any)=>f===statEvolution?f(rng,level):f(rng,raw,before,level);
  let a=make(first),b=make(second);if(b.id===a.id)b=statEvolution(rng,level);
  return [a,b];
}
function pendingEvolutionFor(raw:any,currentLevel:number){
  const chosen=new Set((raw.levelBonuses||[]).map((x:any)=>Number(x.level)));
  for(let l=2;l<=currentLevel;l++)if(!chosen.has(l))return {level:l,remaining:currentLevel-l+1,options:evolutionOptions(raw,l)};
  return null;
}
function evolutionView(raw:any,level:number){
  return {abilities:abilityViews(effective(raw).abilities),pending:pendingEvolutionFor(raw,level)};
}
// @duel-engine:end
async function getStoredCombatByUsername(username:string){
  const {data,error}=await supabase.from("arcanum_combat_profiles").select("user_id,username,school_code,profile").ilike("username",username).maybeSingle();
  if(error)throw error; return data;
}
async function ensureCombat(who:any){
  const {data,error}=await supabase.from("arcanum_combat_profiles").select("profile,school_code").eq("user_id",who.userId).maybeSingle();
  if(error)throw error;
  let raw=data?.profile;
  if(!raw||raw.version!==1||raw.school!==who.schoolCode)raw=baseProfile(who.username,who.schoolCode);
  await supabase.from("arcanum_combat_profiles").upsert({user_id:who.userId,username:who.username,school_code:who.schoolCode,profile:raw,updated_at:new Date().toISOString()},{onConflict:"user_id"});
  return raw;
}
async function targetCombat(token:string,targetProfile:any){
  const username=String(targetProfile?.mage_name||"").trim(),school=String(targetProfile?.school_code||"ascendant");
  const stored=await getStoredCombatByUsername(username);
  return stored?.profile?.school===school?stored.profile:baseProfile(username,school);
}

function emptyInventory(){return {version:2,items:[],equipment:{...EMPTY_EQUIPMENT},found:0,legacy_imported:false}}
function lootClamp(v:number,min:number,max:number){return Math.max(min,Math.min(max,v))}
function lootRandInt(min:number,max:number){return Math.floor(Math.random()*(max-min+1))+min}
function lootPick<T>(arr:T[]):T{return arr[Math.floor(Math.random()*arr.length)]}
function lootWeighted(items:any[]){const total=items.reduce((s,x)=>s+x.weight,0);let roll=Math.random()*total;for(const item of items){roll-=item.weight;if(roll<=0)return item}return items[items.length-1]}
function lootTierForLevel(level:number){if(level>=40)return 5;if(level>=28)return 4;if(level>=16)return 3;if(level>=7)return 2;return 1}
function lootAffinity(school:string){return Math.random()<.22?"plain":school}
function generateLoot(school:string,level:number,forcedRarity:string|null=null){
  level=lootClamp(Number(level)||1,1,50);
  const eligible=LOOT_BASES.filter(x=>x.minLevel<=level),base=lootPick(eligible.length?eligible:LOOT_BASES);
  const rarity=forcedRarity?LOOT_RARITIES.find(x=>x.key===forcedRarity)||LOOT_RARITIES[0]:lootWeighted(LOOT_RARITIES);
  const affinity=lootAffinity(school),maxTier=lootTierForLevel(level);
  const pool=LOOT_AFFIXES.filter(a=>a.slots.includes(base.slot)&&(!a.schools||a.schools.includes(affinity)));
  const shuffled=[...pool].sort(()=>Math.random()-.5),picked:any[]=[];
  for(const a of shuffled){
    if(picked.length>=rarity.affixes)break;
    if(picked.some(x=>x.id===a.id))continue;
    const tier=lootClamp(lootRandInt(Math.max(1,maxTier-1),maxTier),1,a.tiers.length),range=a.tiers[tier-1];
    picked.push({id:a.id,kind:a.kind,name:a.name,stat:a.stat,tier,value:lootRandInt(range[0],range[1]),rollMin:range[0],rollMax:range[1]});
  }
  const implicit=Object.entries(base.implicit||{}).map(([stat,range]:any)=>({stat,value:lootRandInt(range[0],range[1]),rollMin:range[0],rollMax:range[1]}));
  const prefix=picked.find(x=>x.kind==="prefix")?.name||"",suffix=picked.find(x=>x.kind==="suffix")?.name||"",name=[prefix,base.name,suffix].filter(Boolean).join(" ");
  const rawPower=implicit.reduce((s:any,x:any)=>s+x.value*2,0)+picked.reduce((s:any,x:any)=>s+x.value*(x.stat==="critical"?6:3)+x.tier*7,0)+level*2;
  return {id:"loot_"+crypto.randomUUID(),baseId:base.id,baseName:base.name,slot:base.slot,name,rarity:rarity.key,rarityLabel:rarity.label,affinity,level,implicit,affixes:picked,power:Math.max(1,Math.round(rawPower*rarity.power)),createdAt:new Date().toISOString()};
}

function lootRarityFromWeights(weights:Record<string,number>){
  const options=LOOT_RARITIES
    .map((r:any)=>({key:String(r.key),weight:Math.max(0,Number(weights?.[r.key]||0))}))
    .filter((x:any)=>x.weight>0);
  const total=options.reduce((s:number,x:any)=>s+x.weight,0);
  if(!options.length||total<=0)return "common";
  let roll=Math.random()*total;
  for(const option of options){roll-=option.weight;if(roll<=0)return option.key;}
  return options[options.length-1].key;
}
function lootWithOrigin(item:any,source:string,sourceRef:string,rewardTier:string){
  return {
    ...item,
    origin:{
      source:String(source),
      source_ref:String(sourceRef),
      reward_tier:String(rewardTier),
      claimed_at:new Date().toISOString()
    }
  };
}
function lootClaimPublic(row:any){
  return row?{
    claim_key:String(row.claim_key||""),
    source:String(row.source||""),
    source_ref:String(row.source_ref||""),
    status:String(row.status||""),
    reward_tier:row.reward_tier||null,
    item_id:row.item_id||null,
    item:row.item||null,
    metadata:row.metadata||{},
    created_at:row.created_at||null,
    completed_at:row.completed_at||null
  }:null;
}
async function getLootClaim(claimKey:string){
  const {data,error}=await supabase.from("arcanum_loot_claims")
    .select("claim_key,user_id,username,school_code,source,source_ref,status,reward_tier,item_id,item,metadata,created_at,updated_at,completed_at")
    .eq("claim_key",claimKey).maybeSingle();
  if(error)throw error;return data||null;
}
async function ensureLootClaim(who:any,claimKey:string,source:string,sourceRef:string,metadata:Record<string,unknown>={}){
  const existing=await getLootClaim(claimKey);
  if(existing)return existing;
  const now=new Date().toISOString();
  const {data,error}=await supabase.from("arcanum_loot_claims").insert({
    claim_key:claimKey,user_id:who.userId,username:who.username,school_code:who.schoolCode,
    source,source_ref:sourceRef,status:"started",metadata,updated_at:now
  }).select("claim_key,user_id,username,school_code,source,source_ref,status,reward_tier,item_id,item,metadata,created_at,updated_at,completed_at").single();
  if(error){
    if(String((error as any)?.code||"")==="23505"){
      const {data:old,error:oldError}=await supabase.from("arcanum_loot_claims")
        .select("claim_key,user_id,username,school_code,source,source_ref,status,reward_tier,item_id,item,metadata,created_at,updated_at,completed_at")
        .eq("user_id",who.userId).eq("source",source).eq("source_ref",sourceRef).maybeSingle();
      if(oldError)throw oldError;
      if(old)return old;
    }
    throw error;
  }
  return data;
}
async function updateLootClaim(claimKey:string,patch:any){
  const {data,error}=await supabase.from("arcanum_loot_claims")
    .update({...patch,updated_at:new Date().toISOString()})
    .eq("claim_key",claimKey)
    .select("claim_key,user_id,username,school_code,source,source_ref,status,reward_tier,item_id,item,metadata,created_at,updated_at,completed_at")
    .maybeSingle();
  if(error)throw error;return data||null;
}
async function recoverStaleLootClaim(claim:any){
  if(!claim||!["processing","delivering"].includes(String(claim.status)))return claim;
  const age=Date.now()-new Date(claim.updated_at||claim.created_at||0).getTime();
  if(!Number.isFinite(age)||age<45000)return claim;
  const status=claim.item?"pending_inventory":"started";
  return await updateLootClaim(String(claim.claim_key),{status});
}
async function deliverStoredLootClaim(who:any,claim:any){
  claim=await recoverStaleLootClaim(claim);
  if(!claim)return {status:"missing",item:null,pending:false};
  if(claim.status==="completed")return {status:"completed",item:claim.item||null,pending:false,claim:lootClaimPublic(claim)};
  if(["no_drop","rejected"].includes(String(claim.status)))return {status:String(claim.status),item:null,pending:false,claim:lootClaimPublic(claim)};
  if(claim.status==="delivering")return {status:"delivering",item:claim.item||null,pending:true,claim:lootClaimPublic(claim)};
  if(claim.status!=="pending_inventory"||!claim.item)return {status:String(claim.status),item:claim.item||null,pending:false,claim:lootClaimPublic(claim)};

  const {data:locked,error:lockError}=await supabase.from("arcanum_loot_claims")
    .update({status:"delivering",updated_at:new Date().toISOString()})
    .eq("claim_key",claim.claim_key).eq("status","pending_inventory")
    .select("claim_key,user_id,username,school_code,source,source_ref,status,reward_tier,item_id,item,metadata,created_at,updated_at,completed_at")
    .maybeSingle();
  if(lockError)throw lockError;
  if(!locked){
    const current=await getLootClaim(String(claim.claim_key));
    return {status:String(current?.status||"processing"),item:current?.item||null,pending:true,claim:lootClaimPublic(current)};
  }

  const state=await ensureInventory(who);
  const item=locked.item;
  if((state.items||[]).some((x:any)=>String(x.id)===String(item.id))){
    const done=await updateLootClaim(String(locked.claim_key),{status:"completed",completed_at:new Date().toISOString()});
    return {status:"completed",item,pending:false,inventory:state,claim:lootClaimPublic(done)};
  }
  if((state.items||[]).length>=INVENTORY_CAP){
    const pending=await updateLootClaim(String(locked.claim_key),{status:"pending_inventory"});
    return {status:"pending_inventory",item,pending:true,inventory:state,claim:lootClaimPublic(pending)};
  }
  try{
    state.items.push(item);
    state.found=Math.max(0,Number(state.found||0))+1;
    await saveInventory(who,state);
  }catch(error){
    await updateLootClaim(String(locked.claim_key),{status:"pending_inventory"}).catch(()=>{});
    throw error;
  }
  const done=await updateLootClaim(String(locked.claim_key),{status:"completed",completed_at:new Date().toISOString()});
  return {status:"completed",item,pending:false,inventory:state,claim:lootClaimPublic(done)};
}
async function resolveLootReward(
  who:any,
  opts:{
    claimKey:string;source:string;sourceRef:string;rewardTier:string;chance:number;
    rarityWeights:Record<string,number>;metadata?:Record<string,unknown>;
  }
){
  let claim=await ensureLootClaim(who,opts.claimKey,opts.source,opts.sourceRef,opts.metadata||{});
  claim=await recoverStaleLootClaim(claim);
  if(["completed","no_drop","rejected","pending_inventory","delivering"].includes(String(claim.status))){
    const delivered=await deliverStoredLootClaim(who,claim);
    return {...delivered,chance:Number(claim.metadata?.chance??opts.chance),reward_tier:claim.reward_tier||opts.rewardTier};
  }
  if(claim.status==="processing")return {status:"processing",item:claim.item||null,pending:true,claim:lootClaimPublic(claim),chance:opts.chance,reward_tier:opts.rewardTier};

  const {data:locked,error:lockError}=await supabase.from("arcanum_loot_claims")
    .update({status:"processing",updated_at:new Date().toISOString()})
    .eq("claim_key",claim.claim_key).eq("status","started")
    .select("claim_key,user_id,username,school_code,source,source_ref,status,reward_tier,item_id,item,metadata,created_at,updated_at,completed_at")
    .maybeSingle();
  if(lockError)throw lockError;
  if(!locked){
    const current=await getLootClaim(String(claim.claim_key));
    return {status:String(current?.status||"processing"),item:current?.item||null,pending:true,claim:lootClaimPublic(current),chance:opts.chance,reward_tier:opts.rewardTier};
  }

  const chance=Math.max(0,Math.min(1,Number(opts.chance)||0));
  const metadata={...(locked.metadata||{}),...(opts.metadata||{}),chance};
  if(Math.random()>chance){
    const noDrop=await updateLootClaim(String(locked.claim_key),{
      status:"no_drop",reward_tier:opts.rewardTier,metadata,completed_at:new Date().toISOString()
    });
    return {status:"no_drop",item:null,pending:false,claim:lootClaimPublic(noDrop),chance,reward_tier:opts.rewardTier};
  }

  const rarity=lootRarityFromWeights(opts.rarityWeights);
  const rewardLevel=Math.max(1,Math.min(50,Math.floor(Number((opts as any).itemLevel||levelFromProfile(who.profile)))));
  const item=lootWithOrigin(generateLoot(who.schoolCode,rewardLevel,rarity),opts.source,opts.sourceRef,opts.rewardTier);
  const pending=await updateLootClaim(String(locked.claim_key),{
    status:"pending_inventory",reward_tier:opts.rewardTier,item_id:item.id,item,
    metadata:{...metadata,rarity}
  });
  const delivered=await deliverStoredLootClaim(who,pending);
  return {...delivered,chance,reward_tier:opts.rewardTier,rarity};
}
async function deliverPendingLoot(who:any){
  const cutoff=new Date(Date.now()-45000).toISOString();
  const {data:stale,error:staleError}=await supabase.from("arcanum_loot_claims")
    .select("claim_key,user_id,username,school_code,source,source_ref,status,reward_tier,item_id,item,metadata,created_at,updated_at,completed_at")
    .eq("user_id",who.userId).in("status",["processing","delivering"]).lt("updated_at",cutoff)
    .order("created_at",{ascending:true}).limit(20);
  if(staleError)throw staleError;
  for(const row of stale||[])await recoverStaleLootClaim(row);

  const {data:pending,error}=await supabase.from("arcanum_loot_claims")
    .select("claim_key,user_id,username,school_code,source,source_ref,status,reward_tier,item_id,item,metadata,created_at,updated_at,completed_at")
    .eq("user_id",who.userId).eq("status","pending_inventory")
    .order("created_at",{ascending:true}).limit(20);
  if(error)throw error;
  const delivered:any[]=[];
  for(const claim of pending||[]){
    const state=await ensureInventory(who);
    if((state.items||[]).length>=INVENTORY_CAP)break;
    const result=await deliverStoredLootClaim(who,claim);
    if(result.status==="completed"&&result.item)delivered.push(result.item);
  }
  return delivered;
}
async function claimArenaLoot(who:any,matchId:string){
  const {data:match,error}=await supabase.from("arcanum_arena_matches")
    .select("id,attacker_user_id,mode,attacker_won,rating_after,rating_delta,defender_username,created_at")
    .eq("id",matchId).maybeSingle();
  if(error)throw error;
  if(!match||String(match.attacker_user_id)!==String(who.userId))throw new Error("ARENA_MATCH_NOT_VERIFIED");
  if(match.mode!=="ranked"||!match.attacker_won)return {status:"ineligible",item:null,pending:false};
  const rating=Math.max(0,Number(match.rating_after||1000));
  const rewardTier=rating>=1500?"arena_elite":rating>=1200?"arena_veteran":"arena_victory";
  const rarityWeights=rating>=1500
    ?{common:5,uncommon:30,rare:38,epic:21,legendary:5.2,arcane:.8}
    :rating>=1200
      ?{common:10,uncommon:38,rare:34,epic:15,legendary:2.7,arcane:.3}
      :{common:20,uncommon:42,rare:28,epic:9,legendary:.9,arcane:.1};
  return await resolveLootReward(who,{
    claimKey:"arena:"+matchId+":"+who.userId,source:"arena",sourceRef:matchId,rewardTier,chance:.55,rarityWeights,
    metadata:{rating_after:rating,rating_delta:Number(match.rating_delta||0),opponent:String(match.defender_username||"")}
  });
}
async function claimWorldBossLoot(who:any,eventId:string){
  const [{data:event,error:eventError},{data:participant,error:partError}]=await Promise.all([
    supabase.from("arcanum_world_boss_events").select("event_id,status,current_hp,defeated_at,ends_at").eq("event_id",eventId).maybeSingle(),
    supabase.from("arcanum_world_boss_participants").select("event_id,user_id,damage,attacks,reward_tier,reward_granted_at").eq("event_id",eventId).eq("user_id",who.userId).maybeSingle()
  ]);
  if(eventError)throw eventError;if(partError)throw partError;
  if(!event||!(event.status==="defeated"||Number(event.current_hp||0)<=0))throw new Error("BOSS_NOT_DEFEATED");
  if(!participant||Number(participant.damage||0)<=0)throw new Error("BOSS_PARTICIPATION_REQUIRED");
  const damage=Math.max(0,Number(participant.damage||0));
  let rewardTier="boss_participant",chance=.45,rarityWeights:Record<string,number>={common:42,uncommon:38,rare:16,epic:3.6,legendary:.4,arcane:0};
  if(damage>=50000){
    rewardTier="boss_legend";chance=1;
    rarityWeights={common:0,uncommon:10,rare:42,epic:36,legendary:10.5,arcane:1.5};
  }else if(damage>=15000){
    rewardTier="boss_major";chance=1;
    rarityWeights={common:5,uncommon:25,rare:43,epic:23,legendary:3.6,arcane:.4};
  }else if(damage>=3000){
    rewardTier="boss_arcane";chance=.80;
    rarityWeights={common:18,uncommon:38,rare:32,epic:10.5,legendary:1.4,arcane:.1};
  }
  return await resolveLootReward(who,{
    claimKey:"world_boss:"+eventId+":"+who.userId,source:"world_boss",sourceRef:eventId,rewardTier,chance,rarityWeights,
    metadata:{damage,attacks:Number(participant.attacks||0),fragment_tier:participant.reward_tier||null}
  });
}

function normalizeInventoryV2(input:any){
  const state=clone(input||emptyInventory());
  const previousEquipment=state?.equipment||{};
  state.items=(Array.isArray(state.items)?state.items:[]).map((item:any)=>({
    ...item,
    slot:item?.slot==="artifact"?"focus":item?.slot,
    origin:item?.origin||{
      source:"legacy_beta",
      source_ref:"migration",
      reward_tier:"legacy",
      claimed_at:String(item?.createdAt||new Date().toISOString())
    }
  }));
  state.equipment={...EMPTY_EQUIPMENT,...previousEquipment};
  if(previousEquipment.artifact&&!state.equipment.focus)state.equipment.focus=previousEquipment.artifact;
  delete state.equipment.artifact;
  state.version=2;
  state.found=Math.max(0,Number(state.found||0));
  state.legacy_imported=Boolean(state.legacy_imported);
  return state;
}
function canonicalizeLegacyItem(item:any,school:string,currentLevel:number){
  const base=LOOT_BASES.find(x=>x.id===String(item?.baseId||""));if(!base)return null;
  const rarity=LOOT_RARITIES.find(x=>x.key===String(item?.rarity||""));if(!rarity)return null;
  const level=Number(item?.level);if(!Number.isInteger(level)||level<base.minLevel||level>currentLevel||level<1||level>50)return null;
  const affinity=["plain",school].includes(String(item?.affinity||""))?String(item.affinity):null;if(!affinity)return null;
  const implicit:any[]=[];
  for(const [stat,range] of Object.entries(base.implicit||{}) as any){
    const given=(Array.isArray(item?.implicit)?item.implicit:[]).find((x:any)=>x?.stat===stat);
    const value=Number(given?.value);if(!Number.isFinite(value)||value<range[0]||value>range[1])return null;
    implicit.push({stat,value:Math.floor(value),rollMin:range[0],rollMax:range[1]});
  }
  const affixes:any[]=[];const seen=new Set();const maxTier=lootTierForLevel(level);
  for(const given of (Array.isArray(item?.affixes)?item.affixes:[])){
    if(affixes.length>=rarity.affixes)return null;
    const def=LOOT_AFFIXES.find(x=>x.id===String(given?.id||""));if(!def||seen.has(def.id)||!def.slots.includes(base.slot)||def.schools&&!def.schools.includes(affinity))return null;
    const tier=Number(given?.tier);if(!Number.isInteger(tier)||tier<1||tier>Math.min(maxTier,def.tiers.length))return null;
    const range=def.tiers[tier-1],value=Number(given?.value);if(!Number.isFinite(value)||value<range[0]||value>range[1])return null;
    seen.add(def.id);affixes.push({id:def.id,kind:def.kind,name:def.name,stat:def.stat,tier,value:Math.floor(value),rollMin:range[0],rollMax:range[1]});
  }
  const prefix=affixes.find(x=>x.kind==="prefix")?.name||"",suffix=affixes.find(x=>x.kind==="suffix")?.name||"",name=[prefix,base.name,suffix].filter(Boolean).join(" ");
  const rawPower=implicit.reduce((s,x)=>s+x.value*2,0)+affixes.reduce((s,x)=>s+x.value*(x.stat==="critical"?6:3)+x.tier*7,0)+level*2;
  return {id:String(item?.id||("loot_"+crypto.randomUUID())).slice(0,100),baseId:base.id,baseName:base.name,slot:base.slot,name,rarity:rarity.key,rarityLabel:rarity.label,affinity,level,implicit,affixes,power:Math.max(1,Math.round(rawPower*rarity.power)),createdAt:String(item?.createdAt||new Date().toISOString())};
}
async function ensureInventory(who:any){
  const {data,error}=await supabase.from("arcanum_inventory_state").select("state").eq("user_id",who.userId).maybeSingle();if(error)throw error;
  if(data?.state){
    const migrated=normalizeInventoryV2(data.state);
    if(Number(data.state?.version)!==2||data.state?.equipment?.artifact||migrated.items.some((x:any)=>x.slot==="artifact")){
      await saveInventory(who,migrated);
    }
    return migrated;
  }
  const level=levelFromProfile(who.profile),state=emptyInventory();
  state.items=[
    lootWithOrigin(generateLoot(who.schoolCode,level,"common"),"starter","initial","starter"),
    lootWithOrigin(generateLoot(who.schoolCode,level,"uncommon"),"starter","initial","starter"),
    lootWithOrigin(generateLoot(who.schoolCode,level,"rare"),"starter","initial","starter")
  ];
  const {data:saved,error:saveError}=await supabase.from("arcanum_inventory_state").insert({user_id:who.userId,username:who.username,state}).select("state").single();if(saveError)throw saveError;
  return normalizeInventoryV2(saved.state);
}
async function saveInventory(who:any,state:any){
  state=normalizeInventoryV2(state);state.items=(state.items||[]).slice(0,INVENTORY_CAP);
  const {error}=await supabase.from("arcanum_inventory_state").upsert({user_id:who.userId,username:who.username,state,updated_at:new Date().toISOString()},{onConflict:"user_id"});if(error)throw error;
  return state;
}
async function inventoryByUsername(username:string){
  const {data,error}=await supabase.from("arcanum_inventory_state").select("state").ilike("username",username).maybeSingle();if(error)throw error;return normalizeInventoryV2(data?.state||emptyInventory());
}
function effectiveInventoryStats(state:any){
  const total:any={arcane_power:0,knowledge:0,willpower:0,influence:0,life:0,mana:0,critical:0,ward:0,regen:0,school_damage:0,evasion:0,power:0};
  Object.values(state?.equipment||{}).forEach((id:any)=>{const item=(state?.items||[]).find((x:any)=>x.id===id);if(!item)return;total.power+=Number(item.power)||0;[...(item.implicit||[]),...(item.affixes||[])].forEach((x:any)=>{total[x.stat]=(total[x.stat]||0)+(Number(x.value)||0)})});
  return total;
}
function inventoryCombatBonuses(state:any){
  const t=effectiveInventoryStats(state);
  return {maxHp:Math.max(0,Number(t.life)||0),attack:Math.max(0,(Number(t.arcane_power)||0)*1.6+(Number(t.school_damage)||0)*1.25),armor:Math.max(0,(Number(t.willpower)||0)*1.25+(Number(t.ward)||0)*1.1),speed:Math.max(0,(Number(t.knowledge)||0)*.08),crit:Math.max(0,(Number(t.critical)||0)/100),dodge:Math.max(0,(Number(t.evasion)||0)/100),block:Math.max(0,(Number(t.ward)||0)*.0015),regen:Math.max(0,(Number(t.regen)||0)/100),accuracy:Math.max(0,(Number(t.knowledge)||0)*.002),fortune:Math.max(0,(Number(t.influence)||0)*.003),mana:Math.max(0,Number(t.mana)||0),equipmentPower:Math.max(0,Number(t.power)||0)};
}
function preferredSlot(item:any,state:any){
  if(item.slot!=="ring")return item.slot;
  if(!state.equipment.ring1)return "ring1";if(!state.equipment.ring2)return "ring2";
  const a=state.items.find((x:any)=>x.id===state.equipment.ring1),b=state.items.find((x:any)=>x.id===state.equipment.ring2);
  return (Number(a?.power)||0)<=(Number(b?.power)||0)?"ring1":"ring2";
}


function publicInventoryState(state:any,isSelf:boolean){
  const equipment={...EMPTY_EQUIPMENT,...(state?.equipment||{})};
  const equippedIds=new Set(Object.values(equipment).filter(Boolean).map(String));
  const items=(state?.items||[]).filter((x:any)=>isSelf||equippedIds.has(String(x.id)));
  return {
    version:Number(state?.version||1),
    items:clone(items),
    equipment,
    found:isSelf?Math.max(0,Number(state?.found||0)):undefined,
    item_count:Array.isArray(state?.items)?state.items.length:0,
    equipment_power:Math.max(0,Number(effectiveInventoryStats(state).power||0))
  };
}
function combatPublicState(raw:any,inventory:any,relic:any=null){
  const c=effective(raw),d=derived(raw,mergeCombatBonuses(inventoryCombatBonuses(inventory),relicCombatBonuses(relic)));
  return {
    raw:clone(raw),
    stats:clone(c.stats||{}),
    weapon:clone(c.weapon||null),
    trait:clone(c.trait||null),
    bonusTraits:clone(c.bonusTraits||[]),
    abilities:clone(c.abilities||[]),
    abilities_view:abilityViews(c.abilities||[]),
    evolution:clone(c.levelBonuses||[]),
    derived:clone(d)
  };
}
function coreProgressionState(profile:any){
  const level=levelFromProfile(profile);
  const hasTotal=Number.isFinite(Number(profile?.archmage_total_xp));
  let floorXp=0;
  for(let current=1;current<level;current++){
    const x=current-1;floorXp+=Math.round((100+45*x+2*x*x)/10)*10;
  }
  const x=level-1;
  const calculatedNext=level>=50?0:Math.round((100+45*x+2*x*x)/10)*10;
  const xpNext=hasTotal?calculatedNext:Math.max(0,Number(profile?.archmage_xp_next||calculatedNext));
  const xp=level>=50?0:(hasTotal?Math.max(0,Number(profile.archmage_total_xp)-floorXp):Math.max(0,Number(profile?.archmage_xp||0)));
  const totalXp=hasTotal?Math.max(0,Number(profile.archmage_total_xp)):floorXp+xp;
  return {
    level,total_xp:totalXp,xp,xp_next:xpNext,
    attribute_points:Math.max(0,Number(profile?.attribute_points||0)),
    aptitudes:{
      arcane_power:Math.max(1,Number(profile?.arcane_power||1)),
      knowledge:Math.max(1,Number(profile?.knowledge||1)),
      willpower:Math.max(1,Number(profile?.willpower||1)),
      influence:Math.max(1,Number(profile?.influence||1))
    }
  };
}
async function arenaStateForTarget(who:any,target:any,isSelf:boolean){
  if(isSelf)return await ensureArena(who);
  const {data,error}=await supabase.from("arcanum_arena_state").select("username,rating,wins,losses,updated_at").ilike("username",String(target.mage_name)).maybeSingle();
  if(error)throw error;
  return data||{username:String(target.mage_name),rating:1000,wins:0,losses:0,updated_at:null};
}
async function recentArenaEvents(username:string){
  const cols="id,attacker_username,defender_username,mode,attacker_won,rating_delta,rating_after,created_at";
  const [a,d]=await Promise.all([
    supabase.from("arcanum_arena_matches").select(cols).eq("attacker_username",username).order("created_at",{ascending:false}).limit(12),
    supabase.from("arcanum_arena_matches").select(cols).eq("defender_username",username).order("created_at",{ascending:false}).limit(12)
  ]);
  if(a.error)throw a.error;if(d.error)throw d.error;
  const key=username.toLowerCase(),seen=new Set<string>(),rows=[...(a.data||[]),...(d.data||[])]
    .filter((x:any)=>{const id=String(x.id);if(seen.has(id))return false;seen.add(id);return true})
    .sort((x:any,y:any)=>new Date(y.created_at).getTime()-new Date(x.created_at).getTime()).slice(0,12);
  return rows.map((m:any)=>{
    const attacking=String(m.attacker_username||"").toLowerCase()===key;
    const won=attacking?Boolean(m.attacker_won):!Boolean(m.attacker_won);
    const opponent=attacking?m.defender_username:m.attacker_username;
    return {
      id:String(m.id),type:"arena",created_at:m.created_at,outcome:won?"win":"loss",
      title:(won?"Victoria":"Derrota")+" en Arena",
      detail:(m.mode==="ranked"?"Clasificatorio":"Amistoso")+" contra "+String(opponent||"Arconte"),
      opponent:String(opponent||""),mode:String(m.mode||"friendly"),
      rating_delta:attacking?Number(m.rating_delta||0):null,rating_after:attacking?Number(m.rating_after||0):null
    };
  });
}
async function artifactStateForTarget(username:string){
  const [owned,hist]=await Promise.all([
    supabase.from("arcanum_player_artifacts")
      .select("id,artifact_id,category,rarity,source,equipped,acquired_at")
      .eq("username",username).is("lost_at",null).order("acquired_at",{ascending:false}),
    supabase.from("arcanum_artifact_history")
      .select("id,artifact_id,event_type,source,created_at")
      .eq("username",username).order("created_at",{ascending:false}).limit(12)
  ]);
  if(owned.error)throw owned.error;if(hist.error)throw hist.error;
  return {
    items:owned.data||[],
    equipped:(owned.data||[]).filter((x:any)=>x.equipped),
    count:(owned.data||[]).length,
    history:(hist.data||[]).map((x:any)=>({
      id:"artifact-"+String(x.id),type:"artifact",created_at:x.created_at,outcome:"info",
      title:"Reliquia · "+String(x.event_type||"evento"),
      detail:String(x.artifact_id||"")+" · "+String(x.source||"mundo"),
      artifact_id:String(x.artifact_id||""),event_type:String(x.event_type||""),source:String(x.source||"")
    }))
  };
}
function archmageRenown(level:number,arena:any,artifacts:any){
  const wins=Math.max(0,Number(arena?.wins||0));
  const rating=Math.max(0,Number(arena?.rating||1000));
  const count=Math.max(0,Number(artifacts?.count||0));
  const unique=(artifacts?.items||[]).filter((x:any)=>x.category==="unique").length;
  const score=Math.max(0,Math.round(level*20+wins*5+count*12+unique*60+Math.max(0,rating-1000)/4));
  const title=score>=1400?"Nombre de Leyenda":score>=900?"Figura del Cónclave":score>=550?"Archimago Reconocido":score>=280?"Nombre Emergente":"Desconocido";
  return {score,title,mechanical_effect:false,breakdown:{level:level*20,arena_wins:wins*5,relics:count*12,world_uniques:unique*60,arena_rating:Math.round(Math.max(0,rating-1000)/4)}};
}
function archmageTrajectory(profile:any,arena:any,artifacts:any,battles:any[]){
  const level=levelFromProfile(profile);
  return {
    renown:archmageRenown(level,arena,artifacts),
    arena_wins:Math.max(0,Number(arena?.wins||0)),
    arena_losses:Math.max(0,Number(arena?.losses||0)),
    arena_rating:Math.max(0,Number(arena?.rating||1000)),
    artifact_count:Math.max(0,Number(artifacts?.count||0)),
    equipped_relics:Array.isArray(artifacts?.equipped)?artifacts.equipped.length:0,
    recorded_battles:Array.isArray(battles)?battles.length:null,
    spell_level:Math.max(0,Number(profile?.spell_level||0)),
    realm_power:Math.max(0,Number(profile?.net_power||0)),
    land:Math.max(0,Number(profile?.land||0))
  };
}
async function unifiedArchmageSnapshot(who:any,target:any){
  const isSelf=String(target?.mage_name||"").toLowerCase()===who.username.toLowerCase();
  const username=String(target.mage_name);
  if(isSelf){
    try{await deliverPendingLoot(who);}catch(error){console.error("PENDING_LOOT_DELIVERY",error);}
  }
  const [combatRaw,inventory,arena,arenaEvents,artifacts]=await Promise.all([
    isSelf?ensureCombat(who):targetCombat(who.token,target),
    isSelf?ensureInventory(who):inventoryByUsername(username),
    arenaStateForTarget(who,target,isSelf),
    recentArenaEvents(username),
    artifactStateForTarget(username)
  ]);
  let battles:any[]=[];
  if(isSelf){
    try{battles=await coreRpc(who.token,"my_battle_reports",{p_limit:12})||[]}catch(_e){battles=[]}
  }
  const battleEvents=(battles||[]).map((b:any)=>({
    id:"battle-"+String(b.battle_id||crypto.randomUUID()),type:"war",created_at:b.created_at,outcome:b.result==="VICTORY"?"win":"loss",
    title:b.result==="VICTORY"?"Victoria militar":"Derrota militar",
    detail:(b.mode==="SIEGE"?"Asedio":"Ataque")+" contra "+String(b.opponent_mage_name||"Arconte"),
    opponent:String(b.opponent_mage_name||""),mode:String(b.mode||""),land_change:Number(b.land_change||0),battle_id:b.battle_id||null
  }));
  const history=[...arenaEvents,...artifacts.history,...battleEvents]
    .sort((a:any,b:any)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,18);
  const progression=coreProgressionState(target);
  const inventoryPublic=publicInventoryState(inventory,isSelf);
  return {
    version:1,
    generated_at:new Date().toISOString(),
    profile:target,
    identity:{
      mage_name:username,school_code:String(target.school_code||""),
      status:String(target.status||""),level:progression.level,spell_level:Math.max(0,Number(target.spell_level||0)),
      alliance:target.alliance||null,is_self:isSelf,is_npc:Boolean(target.is_npc)
    },
    progression,
    combat:combatPublicState(combatRaw,inventory,artifacts.equipped?.[0]||null),
    inventory:inventoryPublic,
    items:canonicalItemsState(inventory,artifacts.items,isSelf),
    artifacts:{items:artifacts.items,equipped:artifacts.equipped,count:artifacts.count},
    arena,
    trajectory:archmageTrajectory(target,arena,artifacts,battles),
    history,
    authority:{
      profile:"core-supabase",progression:"core-supabase",combat:"arcanum-state",
      inventory:"arcanum-state",items:"arcanum-state",arena:"arcanum-state",artifacts:"arcanum-community/nexo",
      history:"aggregated-server"
    }
  };
}

async function relicsByUsername(username:string){
  const {data,error}=await supabase.from("arcanum_player_artifacts")
    .select("id,artifact_id,category,rarity,source,equipped,acquired_at")
    .ilike("username",username).is("lost_at",null).order("acquired_at",{ascending:false});
  if(error)throw error;return data||[];
}
function relicCombatBonuses(relic:any){
  const id=String(relic?.artifact_id||"");
  const map:any={
    mirror_shard:{dodge:.03},
    storm_bottle:{attackPct:.04},
    dragon_scale:{armorPct:.05},
    glass_eye:{accuracy:.03},
    verdant_crown:{regen:.12},
    verdant_seedheart:{maxHpPct:.10,armorPct:.06},
    eradication_brand:{attackPct:.12},
    eradication_furnace:{attackPct:.09},
    ascendant_halo:{armorPct:.12},
    ascendant_sunstone:{armorPct:.09},
    abyssal_eye:{attackPct:.12},
    phantasm_mask:{dodge:.12},
    phantasm_veil:{armorPct:.08},
    widows_ring:{attackPct:.16,maxHpPct:-.10},
    broken_crown:{armorPct:-.08},
    black_mirror:{attackPct:.18,regen:-.10},
    crown_five_voices:{attackPct:.15},
    staff_first_archmage:{attack:29,speed:.96,accuracy:.024},
    bell_worlds_end:{armorPct:.12},
    heart_arcanum:{attackPct:.10,armorPct:.10}
  };
  return {...(map[id]||{})};
}
function mergeCombatBonuses(...rows:any[]){
  const out:any={};
  rows.filter(Boolean).forEach(row=>Object.entries(row).forEach(([k,v])=>{if(typeof v==="number")out[k]=(Number(out[k])||0)+v}));
  return out;
}
function canonicalGearItems(state:any,isSelf=true){
  const equipment={...EMPTY_EQUIPMENT,...(state?.equipment||{})};
  const equippedIds=new Set(Object.values(equipment).filter(Boolean).map(String));
  return (state?.items||[]).filter((x:any)=>isSelf||equippedIds.has(String(x.id))).map((x:any)=>({
    kind:"gear",id:String(x.id),slot:String(x.slot),name:String(x.name||x.baseName||"Objeto"),
    rarity:String(x.rarity||"common"),rarity_label:String(x.rarityLabel||x.rarity||""),
    power:Math.max(0,Number(x.power||0)),level:Math.max(1,Number(x.level||1)),
    affinity:String(x.affinity||"plain"),
    source:String(x.origin?.source||"legacy_beta"),
    source_ref:String(x.origin?.source_ref||""),
    reward_tier:String(x.origin?.reward_tier||""),
    raw:clone(x)
  }));
}
function canonicalRelicItems(rows:any[]){
  return (rows||[]).map((x:any)=>({
    kind:"relic",id:String(x.id),slot:"relic",artifact_id:String(x.artifact_id),
    rarity:String(x.rarity||x.category||"relic"),category:String(x.category||"minor"),
    source:String(x.source||"world"),equipped:Boolean(x.equipped),acquired_at:x.acquired_at||null
  }));
}
function unifiedEquipment(state:any,relics:any[]){
  const gearItems=canonicalGearItems(state,true),gear=new Map(gearItems.map((x:any)=>[String(x.id),x]));
  const equipment:any={};
  for(const slot of Object.keys(EMPTY_EQUIPMENT)){
    const id=state?.equipment?.[slot];equipment[slot]=id?gear.get(String(id))||null:null;
  }
  const relic=(relics||[]).find((x:any)=>x.equipped)||null;
  equipment.relic=relic?canonicalRelicItems([relic])[0]:null;
  return equipment;
}
function canonicalItemsState(state:any,relics:any[],isSelf=true){
  return {
    version:1,
    slots:["weapon","robe","amulet","ring1","ring2","focus","relic"],
    inventory_version:Number(state?.version||2),
    items:[...canonicalGearItems(state,isSelf),...canonicalRelicItems(relics)],
    equipment:unifiedEquipment(state,relics),
    bag_count:Array.isArray(state?.items)?state.items.length:0,
    bag_capacity:INVENTORY_CAP,
    equipment_power:Math.max(0,Number(effectiveInventoryStats(state).power||0))
  };
}
function serverDay(){
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const values=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return values.year+"-"+values.month+"-"+values.day;
}
const ARCHON_ENERGY_MAX=12;
const ARCHON_ENERGY_REGEN_MS=2*60*60*1000;
const ARCHON_ENERGY_PVE_COST=1;
const ARCHON_ENERGY_ARENA_RANKED_COST=2;
const ARENA_DAILY_RANKED_LIMIT=6;

async function archonEnergy(userId:string){
  const {data,error}=await supabase.rpc("get_archon_energy",{p_user_id:userId});
  if(error)throw error;
  const row=Array.isArray(data)?data[0]:data;
  return {
    current:Math.max(0,Number(row?.energy??ARCHON_ENERGY_MAX)),
    max:ARCHON_ENERGY_MAX,
    next_at:row?.next_energy_at||null,
    regen_hours:2
  };
}
async function spendArchonEnergy(userId:string,amount:number){
  const {data,error}=await supabase.rpc("spend_archon_energy",{p_user_id:userId,p_amount:Math.max(1,Math.floor(amount))});
  if(error)throw error;
  const row=Array.isArray(data)?data[0]:data;
  if(!row?.spent)throw new Error("NOT_ENOUGH_ARCHON_ENERGY");
  return {
    current:Math.max(0,Number(row.energy||0)),
    max:ARCHON_ENERGY_MAX,
    next_at:row.next_energy_at||null,
    regen_hours:2
  };
}

async function ensureArenaIdentity(userId:string,username:string){
  const day=serverDay();
  const {data,error}=await supabase.from("arcanum_arena_state").select("*").eq("user_id",userId).maybeSingle();
  if(error)throw error;
  let state=data||{user_id:userId,username,rating:1000,wins:0,losses:0,ranked_day:day,ranked_used:0};
  if(String(state.ranked_day||state.seal_day)!==day){state.ranked_day=day;state.ranked_used=0}
  state.ranked_day=day;
  state.ranked_used=Math.max(0,Math.min(ARENA_DAILY_RANKED_LIMIT,Number(state.ranked_used||0)));
  state.username=username;state.updated_at=new Date().toISOString();
  const {data:saved,error:saveError}=await supabase.from("arcanum_arena_state").upsert(state,{onConflict:"user_id"}).select("*").single();
  if(saveError)throw saveError; return saved;
}
async function ensureArena(who:any){return await ensureArenaIdentity(who.userId,who.username)}
async function arenaRanking(who:any){
  const {data,error}=await supabase.rpc("arena_pvp_ranking");
  if(error)throw error;
  const rows=(data||[]).map((x:any)=>({
    username:String(x.username||"Arconte"),
    school_code:String(x.school_code||"ascendant"),
    rating:Math.max(100,Number(x.rating||1000)),
    wins:Math.max(0,Number(x.wins||0)),
    losses:Math.max(0,Number(x.losses||0)),
    games:Math.max(0,Number(x.games||0)),
    win_rate:Math.max(0,Math.min(100,Number(x.win_rate||0))),
    is_self:String(x.player_id||"")===String(who.userId)
  }));
  rows.sort((a:any,b:any)=>b.rating-a.rating||b.wins-a.wins||a.losses-b.losses||a.username.localeCompare(b.username,"es"));
  rows.forEach((x:any,i:number)=>x.position=i+1);
  const self=rows.find((x:any)=>x.is_self)||null;
  return {ranking:rows,self_position:self?.position||null,generated_at:new Date().toISOString()};
}
// @duel-engine:begin
function traitMods(c:any){
  const ts=[c.trait].concat(c.bonusTraits||[]).filter(Boolean);
  const m:any={hp:0,speed:0,crit:0,dodge:0,block:0,regen:0,lifesteal:0,armor:0,accuracy:0,fortune:0,secondWind:false};
  ts.forEach((t:any)=>{const x=t.mods||{};["hp","speed","crit","dodge","block","regen","lifesteal","armor","accuracy","fortune"].forEach(k=>m[k]+=Number(x[k]||0));if(x.secondWind)m.secondWind=true});
  return m;
}
const FIGHTER_SRC=new WeakMap<object,any>();
function derived(raw:any,gear:any={},weaponOverride:any=null){
  const c=effective(raw),s:any={...c.stats},w=weaponOverride||c.weapon,t=traitMods(c);
  const owns=(id:string)=>gradeOf(c.abilities,id)>0,P=(id:string)=>abilityParam(c.abilities,id),Q=(id:string)=>abilityParam(c.abilities,id,"q");
  s.strength+=P("ancestral_strength");s.agility+=P("arcane_grace");s.speed+=P("swift_pulse");s.vitality+=P("vital_sap");
  let maxHp=Math.round((115+s.vitality*12+s.endurance*4)*(1+t.hp));
  let attack=Math.round(s.strength*3.1+s.precision*1.1+(w.min+w.max)/2);
  let armor=Math.round((s.endurance*2.8+s.will*1.2)*(1+t.armor));
  let speed=Math.max(1,(s.speed*1.25+s.agility*.55+w.speed)*(1+t.speed));
  let crit=.03+s.fortune*.007+s.precision*.003+t.crit;
  let dodge=.02+s.agility*.008+s.speed*.003+t.dodge;
  let block=w.block*.01+s.endurance*.002+t.block,regen=t.regen,lifesteal=t.lifesteal,accuracy=t.accuracy;
  let doubleStrike=0,weaponPoison=0,firstStrike=0,weaponDisarm=0;
  if(w.id==="ash_staff")regen+=.03;if(w.id==="sun_blade")accuracy+=.04;if(w.id==="ember_maul")crit+=.05;
  if(w.id==="void_scythe")lifesteal+=.06;if(w.id==="glass_daggers")doubleStrike+=.08;if(w.id==="hunter_bow")firstStrike+=.10;
  if(w.id==="thorn_sickle")weaponPoison+=.06;if(w.id==="arcane_tome")armor+=2.4;if(owns("weapon_master"))attack=Math.round(attack*(1+P("weapon_master")));
  const wm=w.mods||{};
  crit+=Number(wm.crit)||0;accuracy+=Number(wm.accuracy)||0;dodge+=Number(wm.dodge)||0;block+=Number(wm.block)||0;regen+=Number(wm.regen)||0;
  lifesteal+=Number(wm.lifesteal)||0;doubleStrike+=Number(wm.combo)||0;weaponPoison+=Number(wm.poison)||0;firstStrike+=Number(wm.first)||0;
  armor+=Number(wm.armor)||0;weaponDisarm+=Number(wm.disarm)||0;
  if(owns("titan_arm")&&isHeavy(w))attack=Math.round(attack*(1+P("titan_arm")));
  if(owns("imperishable")){maxHp=Math.round(maxHp*(1+P("imperishable")));attack=Math.round(attack*(1-Q("imperishable")));speed=Math.max(1,speed*(1-Q("imperishable")))}
  if(owns("foresight")){speed=Math.max(1,speed*(1+P("foresight")));crit+=Q("foresight")}
  if(owns("ash_carapace")){armor=Math.round(armor*(1+P("ash_carapace")));speed=Math.max(1,speed*.9)}
  if(owns("lead_bones")){armor=Math.round(armor*(1+P("lead_bones")));dodge-=.02}
  maxHp+=Math.round(Number(gear.maxHp)||0);attack+=Math.round(Number(gear.attack)||0);armor+=Math.round(Number(gear.armor)||0);speed+=Number(gear.speed)||0;
  maxHp=Math.max(1,Math.round(maxHp*(1+(Number(gear.maxHpPct)||0))));
  attack=Math.max(1,Math.round(attack*(1+(Number(gear.attackPct)||0))));
  armor=Math.max(0,Math.round(armor*(1+(Number(gear.armorPct)||0))));
  speed=Math.max(1,speed*(1+(Number(gear.speedPct)||0)));
  crit+=Number(gear.crit)||0;dodge+=Number(gear.dodge)||0;block+=Number(gear.block)||0;regen+=Number(gear.regen)||0;accuracy+=Number(gear.accuracy)||0;
  return {maxHp,attack,armor,speed,crit:Math.min(.45,crit),dodge:Math.min(.38,Math.max(0,dodge)),block:Math.min(.38,block),regen:Math.min(.25,regen),
    lifesteal:Math.min(.30,lifesteal),secondWind:t.secondWind,accuracy,fortune:t.fortune,doubleStrike,weaponPoison,firstStrike,weaponDisarm};
}
function fighter(profile:any,raw:any,gear:any={}){
  const c=effective(raw),d=derived(raw,gear);
  const f:any={name:String(profile.mage_name),school:String(profile.school_code||"ascendant"),maxHp:d.maxHp,attack:d.attack,armor:d.armor,speed:d.speed,
    crit:d.crit,dodge:d.dodge,block:d.block,regen:d.regen,lifesteal:d.lifesteal,secondWind:d.secondWind,accuracy:d.accuracy||0,
    doubleStrike:d.doubleStrike||0,weaponPoison:d.weaponPoison||0,firstStrike:d.firstStrike||0,weaponDisarm:d.weaponDisarm||0,weapon:c.weapon,trait:c.trait,abilities:c.abilities};
  FIGHTER_SRC.set(f,{raw,gear});
  return f;
}
function has(a:any,id:string){return (a.abilities||[]).some((x:any)=>x.id===id)}
function gp(a:any,id:string){return abilityParam(a.abilities,id)}
function gq(a:any,id:string){return abilityParam(a.abilities,id,"q")}
// Single place where HP is reduced: Piel de Roca caps a hit, Voluntad Inquebrantable survives the first lethal one.
function deal(t:any,dmg:number,events:string[]){
  if(dmg<=0)return 0;
  if(has(t,"stone_skin"))dmg=Math.min(dmg,Math.max(1,Math.round(t.maxHp*gp(t,"stone_skin"))));
  if(t.hp-dmg<=0&&has(t,"iron_will")&&!t.willUsed){
    t.willUsed=true;dmg=Math.max(0,t.hp-1);
    t.dodge=Math.min(.7,t.dodge+gp(t,"iron_will"));t.block=Math.min(.7,t.block+gp(t,"iron_will"));
    events.push(t.name+" resiste con Voluntad Inquebrantable y se queda con 1 de vida.");
  }
  t.hp=Math.max(0,t.hp-dmg);
  return dmg;
}
function tryDisarm(target:any,source:any,events:string[],rng:()=>number){
  if(has(target,"rune_grip")&&rng()<gp(target,"rune_grip")){events.push(target.name+" conserva su arma gracias al Agarre Rúnico.");return}
  target.disarmed=Math.max(target.disarmed||0,1);events.push(source.name+" desarma a "+target.name+" durante su próximo ataque.");
}
function breakWeapon(target:any,events:string[],rng:()=>number,cause:string){
  if(has(target,"rune_grip")&&rng()<gp(target,"rune_grip")){events.push(target.name+" salva su arma con Agarre Rúnico.");return}
  target.disarmed=999;events.push(cause+" destroza el arma de "+target.name+".");
}
// Start-of-action effects. Returns false when the fighter loses the action (slowed).
function prelude(a:any,b:any,round:number,rng:()=>number,events:string[]){
  if(has(a,"quick_sap")&&a.hp>0&&a.hp<a.maxHp*.5&&(a.sapUses||0)<10&&a.lastHp!==undefined&&a.hp>=a.lastHp){
    const heal=Math.max(1,Math.round(a.maxHp*gp(a,"quick_sap")));a.hp=Math.min(a.maxHp,a.hp+heal);a.sapUses=(a.sapUses||0)+1;
    events.push(a.name+" se regenera con Savia Acelerada: "+heal+" de vida.");
  }
  if(a.regen>0&&round%3===0){const heal=Math.max(2,Math.round(a.maxHp*a.regen));a.hp=Math.min(a.maxHp,a.hp+heal);events.push(a.name+" regenera "+heal+" de vida.")}
  if(has(a,"solar_aegis")&&round%4===1){a.shield=(a.shield||0)+Math.round(a.maxHp*gp(a,"solar_aegis"));events.push(a.name+" alza Égida Solar ("+a.shield+" de escudo).")}
  if(has(a,"roots")&&rng()<gp(a,"roots")){b.slow=Math.max(b.slow||0,1);events.push(a.name+" atrapa a "+b.name+" con Raíces.")}
  if((a.slow||0)>0){a.slow--;events.push(a.name+" queda frenado por el control enemigo.");return false}
  return true;
}
function strike(a:any,b:any,rng:()=>number,events:string[]):"miss"|"hit"{
  if(has(a,"soul_bite")&&rng()<gp(a,"soul_bite")){b.weaken=Math.max(b.weaken||0,1);events.push(a.name+" muerde el alma de "+b.name+" y debilita su próximo ataque.")}
  if(has(b,"veil_dance")&&!b.veilUsed){b.veilUsed=true;if(rng()<gp(b,"veil_dance")){a.streak=0;events.push(b.name+" esquiva el primer ataque de "+a.name+" con la Danza del Velo.");return "miss"}}
  let effectiveDodge=Math.max(0,b.dodge-a.accuracy);if(has(b,"phase_step"))effectiveDodge=Math.min(.48,effectiveDodge+gp(b,"phase_step"));
  if(rng()<effectiveDodge){
    a.streak=0;events.push(b.name+" evita el ataque de "+a.name+".");
    if(has(b,"sixth_sense")&&b.hp>0&&rng()<gp(b,"sixth_sense")){const reply=Math.max(1,Math.round(b.attack*.35));deal(a,reply,events);events.push(b.name+" responde con Sexto Sentido e inflige "+reply+" de daño.")}
    return "miss";
  }
  if(rng()<b.block){
    a.streak=0;events.push(b.name+" bloquea con éxito el golpe de "+a.name+".");
    if(has(b,"counter")&&rng()<gp(b,"counter")){const counter=Math.max(1,Math.round(b.attack*.35));deal(a,counter,events);events.push(b.name+" contraataca e inflige "+counter+" de daño.")}
    return "miss";
  }
  const crit=rng()<a.crit;let mult=.85+rng()*.3;if((a.weaken||0)>0){mult*=.82;a.weaken--;events.push(a.name+" ataca debilitado por magia enemiga.")}
  if(has(a,"execution")&&b.hp<b.maxHp*.35)mult*=gp(a,"execution");if(has(a,"judgement")&&b.hp<b.maxHp*.55&&rng()<gp(a,"judgement")){mult*=1.30;events.push(a.name+" pronuncia Juicio Radiante.")}
  if(has(a,"flame_break")&&rng()<gp(a,"flame_break")){mult*=1.45;events.push(a.name+" desata Ruptura Ígnea.")}if(crit)mult*=1.65;
  const disarmed=(a.disarmed||0)>0;const weaponRoll=disarmed?0:Math.round(a.weapon.min+rng()*(a.weapon.max-a.weapon.min));
  if(disarmed){a.disarmed--;events.push(a.name+(a.disarmed>50?" combate sin arma.":" combate desarmado temporalmente."))}
  const atk=disarmed&&has(a,"arcane_fist")?a.attack*(1+gp(a,"arcane_fist")):a.attack;
  let dmg=Math.max(1,Math.round(atk*mult+weaponRoll-b.armor*.55));
  if(isBlunt(a.weapon)&&has(b,"lead_bones"))dmg=Math.max(1,Math.round(dmg*(1-gq(b,"lead_bones"))));
  const absorb=Math.min(Number(b.shield||0),dmg);b.shield=Math.max(0,Number(b.shield||0)-absorb);dmg-=absorb;dmg=deal(b,dmg,events);
  const steal=a.lifesteal+(has(a,"dark_pact")?gp(a,"dark_pact"):0);if(steal>0&&dmg>0)a.hp=Math.min(a.maxHp,a.hp+Math.max(1,Math.round(dmg*steal)));
  events.push(a.name+(crit?" asesta un crítico con ":" golpea con ")+(a.weapon?.name||"su arma")+" a "+b.name+": "+dmg+" de daño.");
  a.streak=(a.streak||0)+1;
  if(has(a,"thunder_chain")&&a.streak%3===0&&b.hp>0&&rng()<gp(a,"thunder_chain")){b.slow=Math.max(b.slow||0,1);events.push(a.name+" aturde a "+b.name+" con Cadena de Trueno.")}
  if(has(b,"reprisal")&&dmg>0&&b.hp>0&&rng()<gp(b,"reprisal"))b.priority=true;
  if(has(b,"monk_path")&&dmg>0&&b.hp>0&&rng()<gp(b,"monk_path")){const back=Math.max(1,Math.round(b.attack*1.1-a.armor*.4));deal(a,back,events);events.push(b.name+" devuelve el golpe desde el Camino del Monje: "+back+" de daño.")}
  if(has(b,"basalt_skull")&&a.hp>0&&rng()<gp(b,"basalt_skull"))breakWeapon(a,events,rng,"El Cráneo de Basalto de "+b.name);
  if(has(a,"arcane_sabotage")&&b.hp>0&&rng()<gp(a,"arcane_sabotage"))breakWeapon(b,events,rng,"El Sabotaje Arcano de "+a.name);
  if(has(a,"disarm")&&b.hp>0&&rng()<gp(a,"disarm"))tryDisarm(b,a,events,rng);
  if(a.weaponDisarm>0&&b.hp>0&&rng()<a.weaponDisarm)tryDisarm(b,a,events,rng);
  if((has(a,"mirror_strike")||rng()<a.doubleStrike)&&b.hp>0&&rng()<(has(a,"mirror_strike")?gp(a,"mirror_strike"):.25)){const extra=Math.max(1,Math.round(a.attack*.4));deal(b,extra,events);events.push(a.name+" encadena un segundo golpe: "+extra+" de daño.")}
  const poisonChance=(has(a,"toxic_spores")?gp(a,"toxic_spores"):0)+a.weaponPoison;if(poisonChance>0&&b.hp>0&&rng()<poisonChance){const poison=Math.max(2,Math.round(a.attack*.12));deal(b,poison,events);events.push("El veneno inflige "+poison+" de daño adicional a "+b.name+".")}
  return "hit";
}
function hit(a:any,b:any,round:number,rng:()=>number){
  const events:string[]=[];
  if(!prelude(a,b,round,rng,events)){a.lastHp=a.hp;return events}
  if(has(a,"monk_path")&&round%3===1){events.push(a.name+" medita y aguarda el golpe rival.");a.lastHp=a.hp;return events}
  const result=strike(a,b,rng,events);
  if(result==="miss"&&has(a,"determination")&&a.hp>0&&b.hp>0&&rng()<gp(a,"determination")){events.push(a.name+" no se rinde: Determinación lanza otro ataque.");strike(a,b,rng,events)}
  a.lastHp=a.hp;
  return events;
}
function refit(f:any,src:any,weapon:any){
  const d=derived(src.raw,src.gear,weapon);
  Object.assign(f,{weapon,attack:d.attack,armor:d.armor,speed:d.speed,crit:d.crit,dodge:d.dodge,block:d.block,regen:d.regen,lifesteal:d.lifesteal,
    accuracy:d.accuracy||0,doubleStrike:d.doubleStrike||0,weaponPoison:d.weaponPoison||0,firstStrike:d.firstStrike||0,weaponDisarm:d.weaponDisarm||0});
}
function swapWeapons(x:any,y:any,log:string[]){
  const sx=FIGHTER_SRC.get(x),sy=FIGHTER_SRC.get(y);
  if(!sx||!sy)return;
  const mine=x.weapon,theirs=y.weapon,cut=gp(x,"weapon_swap");
  const copy={...clone(theirs),name:theirs.name+" (copia)",min:Math.max(1,Math.round(theirs.min*(1-cut))),max:Math.max(1,Math.round(theirs.max*(1-cut)))};
  if(copy.min+copy.max<=mine.min+mine.max)return;
  refit(x,sx,copy);refit(y,sy,clone(mine));
  log.push(x.name+" se equipa con "+theirs.name+" de "+y.name+" gracias a Impostor de Armas ("+y.name+" recibe "+mine.name+").");
}
function prepareDuel(a:any,b:any,log:string[]){
  if(has(a,"weapon_swap"))swapWeapons(a,b,log);
  else if(has(b,"weapon_swap"))swapWeapons(b,a,log);
}
// Shared round loop for Arena (simulate) and PvE (simulatePersistent).
function duelRounds(a:any,b:any,rng:()=>number,log:string[]){
  prepareDuel(a,b,log);
  for(let round=1;round<=24&&a.hp>0&&b.hp>0;round++){
    log.push("RONDA "+round);
    const ai=a.speed+rng()*3+(round===1?a.firstStrike*10:0)+(a.priority?100:0),bi=b.speed+rng()*3+(round===1?b.firstStrike*10:0)+(b.priority?100:0);
    a.priority=false;b.priority=false;
    const first=ai>=bi?a:b,second=first===a?b:a;
    hit(first,second,round,rng).forEach(x=>log.push(x));if(second.hp>0)hit(second,first,round,rng).forEach(x=>log.push(x));
    [a,b].forEach((f:any)=>{const other=f===a?b:a;if(f.hp<=0&&f.secondWind&&!f.secondWindUsed){f.secondWindUsed=true;f.hp=Math.max(1,Math.round(f.maxHp*.2));log.push(f.name+" activa Segundo Aliento y vuelve al combate.")}
      if(f.hp<=0&&has(f,"last_word")&&!f.lastWordUsed&&other.hp>0&&rng()<gp(f,"last_word")){f.lastWordUsed=true;const last=Math.max(1,Math.round(f.attack*.45));other.hp=Math.max(0,other.hp-last);log.push(f.name+" pronuncia Última Palabra antes de caer: "+last+" de daño.")}});
  }
}
function simulate(aProfile:any,aRaw:any,aGear:any,bProfile:any,bRaw:any,bGear:any,seed:string){
  const rng=rngFrom(seed),a=fighter(aProfile,aRaw,aGear),b=fighter(bProfile,bRaw,bGear),log:string[]=[];
  a.hp=a.maxHp;b.hp=b.maxHp;a.shield=0;b.shield=0;a.secondWindUsed=false;b.secondWindUsed=false;a.lastWordUsed=false;b.lastWordUsed=false;
  duelRounds(a,b,rng,log);
  const won=a.hp===b.hp?rng()<.5:a.hp>b.hp;return {won,log,a,b};
}


// @duel-engine:end
const PVE_EXPEDITIONS=[
  {
    id:"ruins_threshold",
    name:"Ruinas del Umbral",
    subtitle:"Un corredor roto entre las Cinco Escuelas.",
    description:"Cuatro cámaras enlazadas. La vida del Archimago persiste entre encuentros y sólo retirarse conserva la supervivencia.",
    minLevel:1,
    rooms:[
      {id:"ash_sentinel",name:"Vigilante de Ceniza",school:"eradication",kind:"guardian",boss:false,desc:"Una armadura calcinada todavía protege el acceso a las ruinas."},
      {id:"veil_weaver",name:"Tejedora del Velo",school:"phantasm",kind:"caster",boss:false,desc:"Dobla pasillos y recuerdos hasta hacer indistinguible la salida."},
      {id:"withered_keeper",name:"Custodio Marchito",school:"verdant",kind:"warden",boss:false,desc:"Raíces muertas cubren un corazón que aún se niega a abandonar su puesto."},
      {id:"hollow_cartographer",name:"El Cartógrafo Hueco",school:"abyssal",kind:"boss",boss:true,desc:"El primer señor de las Ruinas. Dibuja caminos hacia lugares que no deberían existir."}
    ]
  }
] as const;
const PVE_DIFFICULTIES:any={
  1:{name:"I · Incursión",minLevel:1,enemyOffset:0},
  2:{name:"II · Profundidad",minLevel:5,enemyOffset:3},
  3:{name:"III · Abismo",minLevel:10,enemyOffset:6}
};
function pveExpedition(id:string){return (PVE_EXPEDITIONS as any[]).find(x=>x.id===id)||null}
function pveDifficulty(id:number){return PVE_DIFFICULTIES[Math.max(1,Math.min(3,Number(id)||1))]||PVE_DIFFICULTIES[1]}
function pveCatalog(level:number){
  return (PVE_EXPEDITIONS as any[]).map(exp=>({
    id:exp.id,name:exp.name,subtitle:exp.subtitle,description:exp.description,min_level:exp.minLevel,
    room_count:exp.rooms.length,
    difficulties:Object.entries(PVE_DIFFICULTIES).map(([key,val]:any)=>({
      id:Number(key),name:val.name,min_level:val.minLevel,unlocked:level>=val.minLevel
    }))
  }));
}

const PVE_DECISION_OPTIONS=[
  {
    id:"descend",
    title:"Descender al Umbral",
    subtitle:"Riesgo normal · Botín normal",
    description:"Mantén el plan. No altera la próxima cámara.",
    icon:"↓",
    heal_pct:0,enemy_mult:1,loot_bonus:0,rarity_bias:0
  },
  {
    id:"sanctuary",
    title:"Buscar un santuario",
    subtitle:"+18% de vida · −10 puntos de Gear",
    description:"Encuentras un refugio quebrado y recuperas parte de tu vida. El descanso reduce lo que queda por encontrar.",
    icon:"✦",
    heal_pct:.18,enemy_mult:1,loot_bonus:-.10,rarity_bias:-.08
  },
  {
    id:"forbidden",
    title:"Forzar el Umbral",
    subtitle:"+15% enemigo · +18 puntos de Gear",
    description:"Abres una puerta sellada. La próxima criatura será más peligrosa, pero el Umbral responde con mejores recompensas.",
    icon:"◆",
    heal_pct:0,enemy_mult:1.15,loot_bonus:.18,rarity_bias:.14
  }
] as const;
function pveDecisionOptions(run:any){
  const nextStage=Math.max(0,Number(run?.stage||0)),exp=pveExpedition(String(run?.expedition_id||""));
  const nextRoom=exp?.rooms?.[nextStage];
  if(!nextRoom)return [];
  return (PVE_DECISION_OPTIONS as any[]).map(x=>({
    id:x.id,title:x.title,subtitle:x.subtitle,description:x.description,icon:x.icon,
    heal_pct:x.heal_pct,enemy_mult:x.enemy_mult,loot_bonus:x.loot_bonus,rarity_bias:x.rarity_bias,
    next_room:{id:nextRoom.id,name:nextRoom.name,school:nextRoom.school,boss:Boolean(nextRoom.boss)}
  }));
}
function pveRarityAdjustedWeights(weights:any,bias:number){
  const order=["common","uncommon","rare","epic","legendary","arcane"];
  const b=Math.max(-.20,Math.min(.20,Number(bias)||0));
  if(!b)return {...weights};
  const out:any={};let total=0;
  order.forEach((key,i)=>{
    const base=Math.max(0,Number(weights?.[key]||0));
    const factor=1+b*((i-2.5)/2.5);
    out[key]=base*Math.max(.35,factor);total+=out[key];
  });
  if(total<=0)return {...weights};
  order.forEach(key=>out[key]=out[key]/total*100);
  return out;
}
function pveApplyDecisionToLoot(rule:any,modifiers:any,boss:boolean){
  const chance=Math.max(0,Math.min(1,boss?rule.chance:Number(rule.chance||0)+Number(modifiers?.loot_bonus||0)));
  return {...rule,chance,weights:pveRarityAdjustedWeights(rule.weights,Number(modifiers?.rarity_bias||0))};
}

function pveEnemyProfile(run:any,room:any){
  const baseLevel=Math.max(1,Number(run?.profile_snapshot?.level||1));
  const diff=pveDifficulty(Number(run?.difficulty||1));
  const modifiers=run?.next_modifiers||{};
  const stage=Math.max(0,Number(run?.stage||0));
  const enemyLevel=Math.max(1,Math.min(50,baseLevel+Number(diff.enemyOffset||0)+Math.floor(stage/2)+(room.boss?2:0)));
  const raw=baseProfile("PVE|"+String(run.seed)+"|"+String(room.id),String(room.school));
  const statBoost=Math.floor((enemyLevel-1)*.62)+(Number(run.difficulty||1)-1)+(room.boss?3:0);
  Object.keys(raw.stats||{}).forEach(k=>raw.stats[k]=Math.max(1,Number(raw.stats[k]||0)+statBoost));
  if(room.boss){
    raw.stats.vitality=Number(raw.stats.vitality||0)+3;
    raw.stats.endurance=Number(raw.stats.endurance||0)+2;
    raw.stats.will=Number(raw.stats.will||0)+2;
  }
  const onboardingMult=Number(run.difficulty||1)===1?(baseLevel<=1?.80:baseLevel===2?.90:1):1;
  const encounterMult=Math.max(.5,Number(modifiers?.enemy_mult||1))*onboardingMult;
  Object.keys(raw.stats||{}).forEach(k=>raw.stats[k]=Math.max(1,Math.round(Number(raw.stats[k]||0)*encounterMult)));
  raw.name=room.name;raw.school=room.school;
  return {raw,level:enemyLevel,profile:{mage_name:room.name,school_code:room.school}};
}
function simulatePersistent(aProfile:any,aRaw:any,aGear:any,aStartHp:number,bProfile:any,bRaw:any,bGear:any,seed:string){
  const rng=rngFrom(seed),a=fighter(aProfile,aRaw,aGear),b=fighter(bProfile,bRaw,bGear),log:string[]=[];
  a.hp=Math.max(1,Math.min(a.maxHp,Math.floor(Number(aStartHp)||a.maxHp)));
  b.hp=b.maxHp;a.shield=0;b.shield=0;a.secondWindUsed=false;b.secondWindUsed=false;a.lastWordUsed=false;b.lastWordUsed=false;
  duelRounds(a,b,rng,log);
  const won=a.hp===b.hp?rng()<.5:a.hp>b.hp;
  return {won,log,a,b};
}
function pveLootRule(difficulty:number,stage:number,boss:boolean,modifiers:any={}){
  const d=Math.max(1,Math.min(3,Number(difficulty)||1));
  if(boss){
    if(d===3)return {tier:"pve_boss_abyss",chance:1,weights:{common:0,uncommon:0,rare:30,epic:45,legendary:20,arcane:5}};
    if(d===2)return {tier:"pve_boss_depth",chance:1,weights:{common:0,uncommon:8,rare:48,epic:34,legendary:9,arcane:1}};
    return {tier:"pve_boss",chance:1,weights:{common:0,uncommon:20,rare:52,epic:24,legendary:3.8,arcane:.2}};
  }
  const base=[.28,.36,.48][Math.max(0,Math.min(2,stage))]||.28;
  const chance=Math.min(.90,base+(d-1)*.08);
  if(d===3)return {tier:"pve_abysm",chance,weights:{common:8,uncommon:30,rare:38,epic:19,legendary:4.5,arcane:.5}};
  if(d===2)return {tier:"pve_depth",chance,weights:{common:18,uncommon:38,rare:32,epic:10.5,legendary:1.4,arcane:.1}};
  return {tier:"pve_room",chance,weights:{common:34,uncommon:42,rare:19,epic:4.5,legendary:.5,arcane:0}};
}
async function pveRecoverLiveRun(who:any){
  const {data,error}=await supabase.from("arcanum_pve_runs")
    .select("*").eq("user_id",who.userId).in("status",["active","fighting"])
    .order("started_at",{ascending:false}).limit(1).maybeSingle();
  if(error)throw error;if(!data)return null;
  const now=Date.now(),expires=new Date(data.expires_at).getTime();
  if(Number.isFinite(expires)&&expires<=now){
    const {data:expired,error:expireError}=await supabase.from("arcanum_pve_runs")
      .update({status:"expired",completed_at:new Date().toISOString(),updated_at:new Date().toISOString()})
      .eq("id",data.id).select("*").single();
    if(expireError)throw expireError;return expired;
  }
  if(data.status==="fighting"){
    const age=now-new Date(data.updated_at||data.started_at).getTime();
    if(Number.isFinite(age)&&age>60000){
      const {data:recovered,error:recoverError}=await supabase.from("arcanum_pve_runs")
        .update({status:"active",updated_at:new Date().toISOString()})
        .eq("id",data.id).eq("status","fighting").select("*").maybeSingle();
      if(recoverError)throw recoverError;
      return recovered||data;
    }
  }
  return data;
}
function pveRunPublic(run:any){
  if(!run)return null;
  const exp=pveExpedition(String(run.expedition_id));
  const rooms=exp?.rooms||[];
  const stage=Math.max(0,Number(run.stage||0));
  const room=stage<rooms.length?rooms[stage]:null;
  return {
    id:String(run.id),expedition_id:String(run.expedition_id),
    expedition_name:exp?.name||String(run.expedition_id),
    difficulty:Number(run.difficulty||1),difficulty_name:pveDifficulty(Number(run.difficulty||1)).name,
    status:String(run.status),stage,rooms_cleared:Math.min(stage,rooms.length),room_count:rooms.length,
    player_hp:Math.max(0,Number(run.player_hp||0)),player_max_hp:Math.max(1,Number(run.player_max_hp||1)),
    current_room:room?{id:room.id,name:room.name,school:room.school,boss:Boolean(room.boss),desc:room.desc}:null,
    last_enemy:run.last_enemy||null,last_log:Array.isArray(run.last_log)?run.last_log:[],
    last_loot:run.last_loot||null,pending_decision:run.pending_decision||null,next_modifiers:run.next_modifiers||{},decision_history:Array.isArray(run.decision_history)?run.decision_history:[],started_at:run.started_at,updated_at:run.updated_at,expires_at:run.expires_at,completed_at:run.completed_at
  };
}
async function startPveRun(who:any,expeditionId:string,difficulty:number){
  const existing=await pveRecoverLiveRun(who);
  if(existing&&["active","fighting"].includes(String(existing.status)))return {run:pveRunPublic(existing),resumed:true};
  const exp=pveExpedition(expeditionId);if(!exp)throw new Error("PVE_EXPEDITION_NOT_FOUND");
  const level=levelFromProfile(who.profile),diff=pveDifficulty(difficulty);
  if(level<Number(exp.minLevel||1)||level<Number(diff.minLevel||1))throw new Error("PVE_DIFFICULTY_LOCKED");
  const [combatRaw,inventory,relics]=await Promise.all([ensureCombat(who),ensureInventory(who),relicsByUsername(who.username)]);
  const gear=mergeCombatBonuses(inventoryCombatBonuses(inventory),relicCombatBonuses(relics.find((x:any)=>x.equipped)));
  const derivedPlayer=derived(combatRaw,gear);
  const profileSnapshot={mage_name:who.username,school_code:who.schoolCode,level};
  const {data,error}=await supabase.from("arcanum_pve_runs").insert({
    user_id:who.userId,username:who.username,school_code:who.schoolCode,
    expedition_id:exp.id,difficulty:Number(difficulty),status:"active",stage:0,
    player_hp:derivedPlayer.maxHp,player_max_hp:derivedPlayer.maxHp,
    seed:crypto.randomUUID(),profile_snapshot:profileSnapshot,combat_snapshot:combatRaw,gear_snapshot:gear
  }).select("*").single();
  if(error)throw error;
  return {run:pveRunPublic(data),resumed:false};
}
async function spendPveEnergy(who:any){
  return await spendArchonEnergy(who.userId,ARCHON_ENERGY_PVE_COST);
}
async function fightPveRoom(who:any){
  let run=await pveRecoverLiveRun(who);
  if(!run||run.status!=="active")throw new Error(run?.status==="fighting"?"PVE_FIGHT_IN_PROGRESS":"PVE_RUN_REQUIRED");
  if(run.pending_decision)throw new Error("PVE_DECISION_REQUIRED");
  const exp=pveExpedition(String(run.expedition_id));if(!exp)throw new Error("PVE_EXPEDITION_NOT_FOUND");
  const stage=Math.max(0,Number(run.stage||0)),room=exp.rooms[stage];
  if(!room)throw new Error("PVE_RUN_FINISHED");

  const {data:locked,error:lockError}=await supabase.from("arcanum_pve_runs")
    .update({status:"fighting",updated_at:new Date().toISOString()})
    .eq("id",run.id).eq("user_id",who.userId).eq("status","active").eq("stage",stage)
    .select("*").maybeSingle();
  if(lockError)throw lockError;if(!locked)throw new Error("PVE_FIGHT_IN_PROGRESS");
  run=locked;

  try{
    const energy=await spendPveEnergy(who);
    const enemy=pveEnemyProfile(run,room);
    const playerProfile={mage_name:String(run.profile_snapshot?.mage_name||who.username),school_code:String(run.profile_snapshot?.school_code||who.schoolCode)};
    const sim=simulatePersistent(
      playerProfile,run.combat_snapshot,run.gear_snapshot,Number(run.player_hp),
      enemy.profile,enemy.raw,{},"pve|"+String(run.id)+"|"+stage
    );
    const enemySummary={
      id:room.id,name:room.name,school:room.school,boss:Boolean(room.boss),level:enemy.level,
      max_hp:sim.b.maxHp,hp:sim.b.hp
    };

    if(!sim.won){
      const {data:defeated,error:defeatError}=await supabase.from("arcanum_pve_runs")
        .update({
          status:"defeated",player_hp:0,last_enemy:enemySummary,last_log:sim.log,last_loot:null,
          updated_at:new Date().toISOString(),completed_at:new Date().toISOString()
        }).eq("id",run.id).select("*").single();
      if(defeatError)throw defeatError;
      return {run:pveRunPublic(defeated),fight:{won:false,log:sim.log,enemy:enemySummary,player:{max_hp:sim.a.maxHp,hp:0}},loot_reward:null,energy};
    }

    const rule=pveApplyDecisionToLoot(pveLootRule(Number(run.difficulty||1),stage,Boolean(room.boss)),run.next_modifiers||{},Boolean(room.boss));
    let lootReward:any=null;
    try{
      lootReward=await resolveLootReward(who,{
        claimKey:"pve:"+String(run.id)+":"+stage+":"+who.userId,
        source:"pve",sourceRef:String(run.id)+":"+stage,rewardTier:rule.tier,chance:rule.chance,rarityWeights:rule.weights,
        metadata:{run_id:String(run.id),expedition_id:String(run.expedition_id),stage,room_id:room.id,difficulty:Number(run.difficulty||1),boss:Boolean(room.boss)},
        itemLevel:Math.max(1,Number(run.profile_snapshot?.level||1))
      } as any);
    }catch(error){console.error("PVE_LOOT",error);}

    const nextStage=stage+1,finished=nextStage>=exp.rooms.length;
    const pendingDecision=finished?null:{
      type:"between_rooms",
      created_after_stage:stage,
      options:pveDecisionOptions({...run,stage:nextStage-1})
    };
    const {data:updated,error:updateError}=await supabase.from("arcanum_pve_runs")
      .update({
        status:finished?"completed":"active",stage:nextStage,
        player_hp:Math.max(1,Math.floor(Number(sim.a.hp)||1)),
        last_enemy:enemySummary,last_log:sim.log,last_loot:lootReward,
        pending_decision:pendingDecision,
        next_modifiers:{},
        updated_at:new Date().toISOString(),completed_at:finished?new Date().toISOString():null
      }).eq("id",run.id).eq("status","fighting").select("*").single();
    if(updateError)throw updateError;
    return {
      run:pveRunPublic(updated),
      fight:{won:true,log:sim.log,enemy:enemySummary,player:{max_hp:sim.a.maxHp,hp:sim.a.hp}},
      loot_reward:lootReward,
      energy
    };
  }catch(error){
    await supabase.from("arcanum_pve_runs")
      .update({status:"active",updated_at:new Date().toISOString()})
      .eq("id",run.id).eq("status","fighting").catch(()=>{});
    throw error;
  }
}

async function choosePveDecision(who:any,choiceId:string){
  const run=await pveRecoverLiveRun(who);
  if(!run||run.status!=="active")throw new Error("PVE_RUN_REQUIRED");
  if(!run.pending_decision)throw new Error("PVE_DECISION_NOT_AVAILABLE");
  const option=(PVE_DECISION_OPTIONS as any[]).find(x=>x.id===String(choiceId||""));
  if(!option)throw new Error("PVE_DECISION_INVALID");
  const offered=(run.pending_decision?.options||[]).some((x:any)=>x.id===option.id);
  if(!offered)throw new Error("PVE_DECISION_INVALID");
  const maxHp=Math.max(1,Number(run.player_max_hp||1)),currentHp=Math.max(1,Number(run.player_hp||1));
  const healed=Math.min(maxHp,currentHp+Math.round(maxHp*Number(option.heal_pct||0)));
  const history=Array.isArray(run.decision_history)?run.decision_history:[];
  const record={
    stage:Number(run.stage||0),
    choice_id:option.id,
    choice_title:option.title,
    hp_before:currentHp,
    hp_after:healed,
    next_room:run.pending_decision?.options?.find((x:any)=>x.id===option.id)?.next_room||null,
    modifiers:{enemy_mult:Number(option.enemy_mult||1),loot_bonus:Number(option.loot_bonus||0),rarity_bias:Number(option.rarity_bias||0)},
    chosen_at:new Date().toISOString()
  };
  const {data,error}=await supabase.from("arcanum_pve_runs")
    .update({
      player_hp:healed,
      pending_decision:null,
      next_modifiers:{enemy_mult:Number(option.enemy_mult||1),loot_bonus:Number(option.loot_bonus||0),rarity_bias:Number(option.rarity_bias||0),choice_id:option.id},
      decision_history:[...history,record],
      updated_at:new Date().toISOString()
    }).eq("id",run.id).eq("user_id",who.userId).eq("status","active").select("*").maybeSingle();
  if(error)throw error;if(!data)throw new Error("PVE_DECISION_ALREADY_TAKEN");
  return {run:pveRunPublic(data),choice:record};
}

async function retreatPveRun(who:any){
  const run=await pveRecoverLiveRun(who);
  if(!run||!["active","fighting"].includes(String(run.status)))throw new Error("PVE_RUN_REQUIRED");
  if(run.status==="fighting")throw new Error("PVE_FIGHT_IN_PROGRESS");
  const {data,error}=await supabase.from("arcanum_pve_runs")
    .update({status:"retreated",updated_at:new Date().toISOString(),completed_at:new Date().toISOString()})
    .eq("id",run.id).eq("status","active").select("*").single();
  if(error)throw error;return {run:pveRunPublic(data)};
}
async function pveOverview(who:any){
  const live=await pveRecoverLiveRun(who);
  const {data:history,error}=await supabase.from("arcanum_pve_runs")
    .select("id,expedition_id,difficulty,status,stage,player_hp,player_max_hp,last_enemy,last_loot,started_at,completed_at")
    .eq("user_id",who.userId).not("status","in","(active,fighting)")
    .order("started_at",{ascending:false}).limit(8);
  if(error)throw error;
  const liveRun=live&&["active","fighting"].includes(String(live.status))?pveRunPublic(live):null;
  return {catalog:pveCatalog(levelFromProfile(who.profile)),run:liveRun,history:(history||[]).map(pveRunPublic),energy:await archonEnergy(who.userId),energy_cost_per_fight:ARCHON_ENERGY_PVE_COST};
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
  const p=parts(req);
  if(req.method==="GET"&&p[0]==="health")return json(req,{ok:true,service:"arcanum-state",version:5});
  try{
    const who=await identity(req);

    if(req.method==="GET"&&p[0]==="archmage"&&p[1]){
      const name=decodeURIComponent(p.slice(1).join("/"));
      const target=await coreRpc(who.token,"player_profile",{p_mage_name:name});
      if(!target?.mage_name)return json(req,{error:"TARGET_NOT_FOUND"},404);
      return json(req,await unifiedArchmageSnapshot(who,target));
    }

    if(req.method==="GET"&&p[0]==="snapshot"){
      const [combat,arena,energy]=await Promise.all([ensureCombat(who),ensureArena(who),archonEnergy(who.userId)]);
      const {data:matches}=await supabase.from("arcanum_arena_matches").select("id,defender_username,mode,attacker_won,rating_delta,rating_after,combat_log,created_at").eq("attacker_user_id",who.userId).order("created_at",{ascending:false}).limit(30);
      return json(req,{combat,arena,energy,history:matches||[],server_day:serverDay(),evolution_view:evolutionView(combat,levelFromProfile(who.profile))});
    }

    if(req.method==="GET"&&p[0]==="combat"&&p[1]){
      const name=decodeURIComponent(p.slice(1).join("/"));
      const target=await coreRpc(who.token,"player_profile",{p_mage_name:name});
      if(!target?.mage_name)return json(req,{error:"TARGET_NOT_FOUND"},404);
      const combat=String(target.mage_name).toLowerCase()===who.username.toLowerCase()?await ensureCombat(who):await targetCombat(who.token,target);
      const targetLevel=levelFromProfile(target),isSelf=String(target.mage_name).toLowerCase()===who.username.toLowerCase();
      return json(req,{combat,level:targetLevel,evolution_view:isSelf?evolutionView(combat,targetLevel):{abilities:abilityViews(effective(combat).abilities),pending:null}});
    }

    if(req.method==="POST"&&p[0]==="combat"&&p[1]==="import-legacy"){
      const body=await req.json().catch(()=>({}));
      const raw=await ensureCombat(who),currentLevel=levelFromProfile(who.profile);
      if((raw.levelBonuses||[]).length)return json(req,{combat:raw,imported:0,already_server:true});
      const requested=Array.isArray(body?.choices)?body.choices:[];
      let imported=0;
      for(const choice of requested.sort((a:any,b:any)=>Number(a.level)-Number(b.level))){
        const level=Number(choice?.level);if(level<2||level>currentLevel)continue;
        if((raw.levelBonuses||[]).some((x:any)=>Number(x.level)===level))continue;
        const option=evolutionOptions(raw,level).find((x:any)=>x.id===String(choice?.option_id||""));if(!option)continue;
        raw.levelBonuses.push({level,id:option.id,kind:option.kind,title:option.title,desc:option.desc,effect:clone(option.effect),chosenAt:new Date().toISOString()});imported++;
      }
      raw.levelBonuses.sort((a:any,b:any)=>a.level-b.level);
      await supabase.from("arcanum_combat_profiles").update({profile:raw,updated_at:new Date().toISOString()}).eq("user_id",who.userId);
      return json(req,{combat:raw,imported});
    }

    if(req.method==="POST"&&p[0]==="combat"&&p[1]==="evolve"){
      const body=await req.json().catch(()=>({})),raw=await ensureCombat(who),currentLevel=levelFromProfile(who.profile),level=Number(body?.level);
      if(level<2||level>currentLevel)return json(req,{error:"EVOLUTION_LEVEL_LOCKED"},409);
      if((raw.levelBonuses||[]).some((x:any)=>Number(x.level)===level))return json(req,{error:"EVOLUTION_ALREADY_CHOSEN"},409);
      const pending=(()=>{const chosen=new Set((raw.levelBonuses||[]).map((x:any)=>Number(x.level)));for(let l=2;l<=currentLevel;l++)if(!chosen.has(l))return l;return null})();
      if(level!==pending)return json(req,{error:"EVOLUTION_ORDER_REQUIRED",pending_level:pending},409);
      const option=evolutionOptions(raw,level).find((x:any)=>x.id===String(body?.option_id||""));
      if(!option)return json(req,{error:"EVOLUTION_OPTION_INVALID"},409);
      raw.levelBonuses.push({level,id:option.id,kind:option.kind,title:option.title,desc:option.desc,effect:clone(option.effect),chosenAt:new Date().toISOString()});
      raw.levelBonuses.sort((a:any,b:any)=>a.level-b.level);
      const {error}=await supabase.from("arcanum_combat_profiles").update({profile:raw,updated_at:new Date().toISOString()}).eq("user_id",who.userId);if(error)throw error;
      return json(req,{combat:raw,chosen:option,evolution_view:evolutionView(raw,currentLevel)});
    }


    if(req.method==="GET"&&p[0]==="pve"&&p.length===1){
      return json(req,await pveOverview(who));
    }

    if(req.method==="POST"&&p[0]==="pve"&&p[1]==="start"){
      const body=await req.json().catch(()=>({}));
      const expeditionId=String(body?.expedition_id||"ruins_threshold");
      const difficulty=Math.max(1,Math.min(3,Math.floor(Number(body?.difficulty||1))));
      return json(req,await startPveRun(who,expeditionId,difficulty),201);
    }

    if(req.method==="POST"&&p[0]==="pve"&&p[1]==="choose"){
      const body=await req.json().catch(()=>({}));
      return json(req,await choosePveDecision(who,String(body?.choice_id||"")));
    }

    if(req.method==="POST"&&p[0]==="pve"&&p[1]==="fight"){
      return json(req,await fightPveRoom(who),201);
    }

    if(req.method==="POST"&&p[0]==="pve"&&p[1]==="retreat"){
      return json(req,await retreatPveRun(who));
    }

    if(req.method==="GET"&&p[0]==="items"){
      const delivered=await deliverPendingLoot(who);
      const [state,relics]=await Promise.all([ensureInventory(who),relicsByUsername(who.username)]);
      return json(req,{items:canonicalItemsState(state,relics,true),inventory:state,relics,delivered});
    }

    if(req.method==="POST"&&p[0]==="items"&&p[1]==="equip"){
      const body=await req.json().catch(()=>({})),kind=String(body?.kind||""),id=String(body?.item_id||"");
      if(kind==="gear"){
        const state=await ensureInventory(who),item=state.items.find((x:any)=>x.id===id);
        if(!item)return json(req,{error:"ITEM_NOT_FOUND"},404);
        const slot=preferredSlot(item,state);if(!slot)return json(req,{error:"INVALID_EQUIP_SLOT"},409);
        state.equipment[slot]=item.id;await saveInventory(who,state);
        const relics=await relicsByUsername(who.username);
        return json(req,{ok:true,kind,slot,item,inventory:state,items:canonicalItemsState(state,relics,true)});
      }
      if(kind==="relic"){
        const {data:row,error:findError}=await supabase.from("arcanum_player_artifacts")
          .select("id,user_id,artifact_id,category,rarity,source,equipped,acquired_at")
          .eq("id",id).is("lost_at",null).maybeSingle();
        if(findError)throw findError;if(!row)return json(req,{error:"ITEM_NOT_FOUND"},404);
        if(row.user_id!==who.userId)return json(req,{error:"FORBIDDEN"},403);
        const {error:clearError}=await supabase.from("arcanum_player_artifacts").update({equipped:false}).eq("user_id",who.userId).is("lost_at",null);if(clearError)throw clearError;
        const {error:equipError}=await supabase.from("arcanum_player_artifacts").update({equipped:true}).eq("id",id);if(equipError)throw equipError;
        await supabase.from("arcanum_artifact_history").insert({artifact_id:row.artifact_id,artifact_instance_id:row.id,user_id:who.userId,username:who.username,event_type:"equipped",source:"canonical_items"});
        const [state,relics]=await Promise.all([ensureInventory(who),relicsByUsername(who.username)]);
        return json(req,{ok:true,kind,slot:"relic",item:{...row,equipped:true},items:canonicalItemsState(state,relics,true)});
      }
      return json(req,{error:"INVALID_ITEM_KIND"},400);
    }

    if(req.method==="POST"&&p[0]==="items"&&p[1]==="unequip"){
      const body=await req.json().catch(()=>({})),slot=String(body?.slot||"");
      if(slot==="relic"){
        const current=await relicsByUsername(who.username),relic=current.find((x:any)=>x.equipped);
        const {error}=await supabase.from("arcanum_player_artifacts").update({equipped:false}).eq("user_id",who.userId).is("lost_at",null);if(error)throw error;
        if(relic)await supabase.from("arcanum_artifact_history").insert({artifact_id:relic.artifact_id,artifact_instance_id:relic.id,user_id:who.userId,username:who.username,event_type:"unequipped",source:"canonical_items"});
        const state=await ensureInventory(who),relics=await relicsByUsername(who.username);
        return json(req,{ok:true,slot,items:canonicalItemsState(state,relics,true)});
      }
      const state=await ensureInventory(who);
      if(!Object.prototype.hasOwnProperty.call(state.equipment,slot))return json(req,{error:"INVALID_EQUIP_SLOT"},400);
      state.equipment[slot]=null;await saveInventory(who,state);
      const relics=await relicsByUsername(who.username);
      return json(req,{ok:true,slot,inventory:state,items:canonicalItemsState(state,relics,true)});
    }


    if(req.method==="POST"&&p[0]==="loot"&&p[1]==="arena"&&p[2]==="claim"){
      const body=await req.json().catch(()=>({})),matchId=String(body?.match_id||"");
      if(!matchId)return json(req,{error:"MATCH_ID_REQUIRED"},400);
      return json(req,await claimArenaLoot(who,matchId));
    }

    if(req.method==="POST"&&p[0]==="loot"&&p[1]==="boss"&&p[2]==="claim"){
      const body=await req.json().catch(()=>({})),eventId=String(body?.event_id||"");
      if(!eventId)return json(req,{error:"EVENT_ID_REQUIRED"},400);
      return json(req,await claimWorldBossLoot(who,eventId));
    }

    if(req.method==="GET"&&p[0]==="loot"&&p[1]==="history"){
      const {data,error}=await supabase.from("arcanum_loot_claims")
        .select("claim_key,source,source_ref,status,reward_tier,item_id,item,metadata,created_at,completed_at")
        .eq("user_id",who.userId).order("created_at",{ascending:false}).limit(60);
      if(error)throw error;
      return json(req,{claims:(data||[]).map(lootClaimPublic)});
    }

    if(req.method==="GET"&&p[0]==="inventory"){
      const delivered=await deliverPendingLoot(who);
      const state=await ensureInventory(who);return json(req,{inventory:state,bonuses:inventoryCombatBonuses(state),delivered});
    }

    if(req.method==="POST"&&p[0]==="inventory"&&p[1]==="import-legacy"){
      return json(req,{error:"LEGACY_IMPORT_CLOSED"},410);
    }

    if(false){
      const body=await req.json().catch(()=>({})),current=await ensureInventory(who);
      if(current.legacy_imported)return json(req,{inventory:current,already_imported:true});
      const incoming=body?.state||{},level=levelFromProfile(who.profile),items:any[]=[];
      for(const rawItem of (Array.isArray(incoming?.items)?incoming.items:[]).slice(0,INVENTORY_CAP)){
        const item=canonicalizeLegacyItem(rawItem,who.schoolCode,level);if(item)items.push(item);
      }
      const equipment:any={...EMPTY_EQUIPMENT};
      for(const key of Object.keys(equipment)){
        const legacyKey=key==="focus"?"artifact":key;const id=String(incoming?.equipment?.[key]||incoming?.equipment?.[legacyKey]||"");const item=items.find(x=>x.id===id);
        if(item&&((item.slot==="ring"&&(key==="ring1"||key==="ring2"))||item.slot===key))equipment[key]=id;
      }
      if(items.length){current.items=items;current.equipment=equipment;current.found=Math.max(0,Number(incoming?.found)||items.length)}
      current.legacy_imported=true;await saveInventory(who,current);
      return json(req,{inventory:current,imported:items.length});
    }

    if(req.method==="POST"&&p[0]==="inventory"&&p[1]==="test-drop"){
      if(Deno.env.get("ARCANUM_ALLOW_TEST_LOOT")!=="true")return json(req,{error:"TEST_LOOT_DISABLED"},403);
      const state=await ensureInventory(who);if(state.items.length>=INVENTORY_CAP)return json(req,{error:"INVENTORY_FULL"},409);
      const item=lootWithOrigin(generateLoot(who.schoolCode,levelFromProfile(who.profile)),"event","debug","debug");
      state.items.push(item);state.found=Number(state.found||0)+1;await saveInventory(who,state);
      return json(req,{inventory:state,item},201);
    }

    if(req.method==="POST"&&p[0]==="inventory"&&p[1]==="equip"){
      const body=await req.json().catch(()=>({})),state=await ensureInventory(who),item=state.items.find((x:any)=>x.id===String(body?.item_id||""));
      if(!item)return json(req,{error:"ITEM_NOT_FOUND"},404);const slot=preferredSlot(item,state);
      if(!slot)return json(req,{error:"INVALID_EQUIP_SLOT"},409);state.equipment[slot]=item.id;await saveInventory(who,state);
      return json(req,{inventory:state,slot,item});
    }

    if(req.method==="POST"&&p[0]==="inventory"&&p[1]==="unequip"){
      const body=await req.json().catch(()=>({})),state=await ensureInventory(who),slot=String(body?.slot||"");
      if(!Object.prototype.hasOwnProperty.call(state.equipment,slot))return json(req,{error:"INVALID_EQUIP_SLOT"},400);
      state.equipment[slot]=null;await saveInventory(who,state);return json(req,{inventory:state});
    }

    if(req.method==="POST"&&p[0]==="inventory"&&p[1]==="destroy"){
      const body=await req.json().catch(()=>({})),state=await ensureInventory(who),id=String(body?.item_id||"");
      if(!state.items.some((x:any)=>x.id===id))return json(req,{error:"ITEM_NOT_FOUND"},404);
      Object.keys(state.equipment).forEach(k=>{if(state.equipment[k]===id)state.equipment[k]=null});state.items=state.items.filter((x:any)=>x.id!==id);await saveInventory(who,state);
      return json(req,{inventory:state});
    }

    if(req.method==="GET"&&p[0]==="arena"&&p[1]==="ranking"){
      return json(req,await arenaRanking(who));
    }

    if(req.method==="GET"&&p[0]==="arena"&&p.length===1){
      const arena=await ensureArena(who);
      const {data:history,error}=await supabase.from("arcanum_arena_matches").select("id,defender_username,mode,attacker_won,rating_delta,rating_after,combat_log,created_at").eq("attacker_user_id",who.userId).order("created_at",{ascending:false}).limit(30);
      if(error)throw error;
      const energy=await archonEnergy(who.userId);
      return json(req,{arena,energy,ranked_daily:{used:Number(arena.ranked_used||0),limit:ARENA_DAILY_RANKED_LIMIT,remaining:Math.max(0,ARENA_DAILY_RANKED_LIMIT-Number(arena.ranked_used||0))},history:history||[],server_day:serverDay()});
    }

    if(req.method==="POST"&&p[0]==="arena"&&p[1]==="fight"){
      const body=await req.json().catch(()=>({})),mode=body?.mode==="friendly"?"friendly":"ranked",targetName=String(body?.target||"").trim();
      if(!targetName)return json(req,{error:"TARGET_REQUIRED"},400);
      if(targetName.toLowerCase()===who.username.toLowerCase())return json(req,{error:"CANNOT_FIGHT_SELF"},409);
      const target=await coreRpc(who.token,"player_profile",{p_mage_name:targetName});
      if(!target?.mage_name||target?.is_npc)return json(req,{error:"TARGET_NOT_FOUND"},404);
      const {data:targetRealm,error:targetRealmError}=await supabase.from("realms").select("player_id,mage_name").ilike("mage_name",String(target.mage_name)).maybeSingle();
      if(targetRealmError)throw targetRealmError;
      if(!targetRealm?.player_id)return json(req,{error:"TARGET_NOT_FOUND"},404);
      const [arena,targetArena]=await Promise.all([
        ensureArena(who),
        ensureArenaIdentity(String(targetRealm.player_id),String(target.mage_name))
      ]);
      if(mode==="ranked"&&Number(arena.ranked_used||0)>=ARENA_DAILY_RANKED_LIMIT)return json(req,{error:"ARENA_DAILY_LIMIT"},409);
      const [myRaw,targetRaw,myInventory,targetInventory,myRelics,targetRelics]=await Promise.all([ensureCombat(who),targetCombat(who.token,target),ensureInventory(who),inventoryByUsername(String(target.mage_name)),relicsByUsername(who.username),relicsByUsername(String(target.mage_name))]);
      const myItems=mergeCombatBonuses(inventoryCombatBonuses(myInventory),relicCombatBonuses(myRelics.find((x:any)=>x.equipped)));
      const targetItems=mergeCombatBonuses(inventoryCombatBonuses(targetInventory),relicCombatBonuses(targetRelics.find((x:any)=>x.equipped)));
      let energy:any=null;
      if(mode==="ranked"){
        energy=await spendArchonEnergy(who.userId,ARCHON_ENERGY_ARENA_RANKED_COST);
        const {data:reserved,error:reserveError}=await supabase.from("arcanum_arena_state")
          .update({ranked_used:Number(arena.ranked_used||0)+1,ranked_day:serverDay(),updated_at:new Date().toISOString()})
          .eq("user_id",who.userId).eq("ranked_used",Number(arena.ranked_used||0)).select("user_id");
        if(reserveError)throw reserveError;
        if(!reserved?.length)return json(req,{error:"ARENA_BUSY"},409);
      }
      const matchId=crypto.randomUUID(),seed="arena|"+matchId+"|"+who.userId+"|"+String(target.mage_name),sim=simulate(who.profile,myRaw,myItems,target,targetRaw,targetItems,seed);
      let delta=0,ratingAfter=Number(arena.rating);
      if(mode==="ranked"){
        const targetRating=Number(targetArena?.rating||1000),expected=1/(1+Math.pow(10,(targetRating-Number(arena.rating))/400));
        delta=Math.round(28*((sim.won?1:0)-expected));ratingAfter=Math.max(100,Number(arena.rating)+delta);
        const defenderRatingAfter=Math.max(100,targetRating-delta);
        const attackerUpdate:any={rating:ratingAfter,updated_at:new Date().toISOString()};
        attackerUpdate[sim.won?"wins":"losses"]=Number(arena[sim.won?"wins":"losses"]||0)+1;
        const defenderUpdate:any={rating:defenderRatingAfter,updated_at:new Date().toISOString()};
        defenderUpdate[sim.won?"losses":"wins"]=Number(targetArena[sim.won?"losses":"wins"]||0)+1;
        const [attackerSaved,defenderSaved]=await Promise.all([
          supabase.from("arcanum_arena_state").update(attackerUpdate).eq("user_id",who.userId),
          supabase.from("arcanum_arena_state").update(defenderUpdate).eq("user_id",String(targetRealm.player_id))
        ]);
        if(attackerSaved.error)throw attackerSaved.error;
        if(defenderSaved.error)throw defenderSaved.error;
      }
      const {error:matchError}=await supabase.from("arcanum_arena_matches").insert({
        id:matchId,attacker_user_id:who.userId,attacker_username:who.username,
        defender_user_id:String(targetRealm.player_id),defender_username:String(target.mage_name),
        mode,attacker_won:sim.won,rating_delta:delta,rating_after:ratingAfter,seed,combat_log:sim.log
      });if(matchError)throw matchError;
      const fresh=await ensureArena(who);
      let lootReward:any=null;
      if(mode==="ranked"&&sim.won){
        try{lootReward=await claimArenaLoot(who,matchId);}catch(error){console.error("ARENA_LOOT",error);}
      }
      return json(req,{match:{id:matchId,opponent:String(target.mage_name),won:sim.won,mode,delta,rating:ratingAfter,log:sim.log,created_at:new Date().toISOString(),player:{name:sim.a.name,school:sim.a.school,maxHp:sim.a.maxHp,hp:sim.a.hp},opponent_state:{name:sim.b.name,school:sim.b.school,maxHp:sim.b.maxHp,hp:sim.b.hp}},arena:fresh,energy:energy||await archonEnergy(who.userId),ranked_daily:{used:Number(fresh.ranked_used||0),limit:ARENA_DAILY_RANKED_LIMIT,remaining:Math.max(0,ARENA_DAILY_RANKED_LIMIT-Number(fresh.ranked_used||0))},loot_reward:lootReward},201);
    }

    return json(req,{error:"NOT_FOUND"},404);
  }catch(error){
    console.error(error);
    const msg=String((error as any)?.message||error||"SERVER_ERROR");
    if(msg.includes("UNAUTHORIZED"))return json(req,{error:"UNAUTHORIZED"},401);
    if(msg.includes("REALM_REQUIRED"))return json(req,{error:"REALM_REQUIRED"},403);
    const known=["INVALID_LOOT_CLAIM","LOOT_CLAIM_EXPIRED","EXPLORATION_NOT_VERIFIED","ARENA_MATCH_NOT_VERIFIED","BOSS_NOT_DEFEATED","BOSS_PARTICIPATION_REQUIRED","PVE_EXPEDITION_NOT_FOUND","PVE_DIFFICULTY_LOCKED","PVE_RUN_REQUIRED","PVE_RUN_FINISHED","PVE_FIGHT_IN_PROGRESS","NOT_ENOUGH_ARCHON_ENERGY","ARENA_DAILY_LIMIT"];
    const hit=known.find(code=>msg.includes(code));
    if(hit)return json(req,{error:hit},409);
    return json(req,{error:"SERVER_ERROR"},500);
  }
});