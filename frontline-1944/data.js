const FRONTLINE_DATA={provinces:[
{id:"cherbourg",name:"Cherbourg",x:190,y:110,owner:"allies",terrain:"Puerto",logistics:5,defense:26,rail:true,visibility:"Alta"},
{id:"carentan",name:"Carentan",x:265,y:220,owner:"allies",terrain:"Marismas",logistics:4,defense:31,rail:true,visibility:"Media"},
{id:"bayeux",name:"Bayeux",x:410,y:190,owner:"allies",terrain:"Bocage",logistics:3,defense:34,rail:true,visibility:"Media"},
{id:"saintlo",name:"Saint-Lô",x:365,y:330,owner:"allies",terrain:"Bocage",logistics:4,defense:35,rail:true,visibility:"Media"},
{id:"caen",name:"Caen",x:555,y:205,owner:"axis",terrain:"Urbano",logistics:5,defense:43,rail:true,visibility:"Alta"},
{id:"vire",name:"Vire",x:455,y:445,owner:"axis",terrain:"Colinas",logistics:3,defense:39,rail:false,visibility:"Baja"},
{id:"falaise",name:"Falaise",x:640,y:355,owner:"axis",terrain:"Colinas",logistics:4,defense:42,rail:true,visibility:"Media"},
{id:"avranches",name:"Avranches",x:280,y:500,owner:"axis",terrain:"Bocage",logistics:3,defense:33,rail:true,visibility:"Media"},
{id:"argentan",name:"Argentan",x:700,y:485,owner:"axis",terrain:"Llanura",logistics:4,defense:30,rail:true,visibility:"Alta"}],
routes:[["cherbourg","carentan"],["carentan","bayeux"],["carentan","saintlo"],["bayeux","saintlo"],["bayeux","caen"],["saintlo","vire"],["saintlo","avranches"],["caen","falaise"],["vire","falaise"],["vire","avranches"],["vire","argentan"],["falaise","argentan"]],
units:{allies:[
{id:"a1",name:"1.ª División de Infantería",type:"Infantería",province:"bayeux",strength:91,readiness:84,attack:58,defense:69,mobility:42,supply:86,fuel:0},
{id:"a2",name:"2.º Grupo Blindado",type:"Blindados",province:"saintlo",strength:84,readiness:79,attack:82,defense:61,mobility:72,supply:78,fuel:76},
{id:"a3",name:"82.ª División Aerotransportada",type:"Aerotransportada",province:"carentan",strength:76,readiness:88,attack:66,defense:63,mobility:58,supply:67,fuel:8},
{id:"a4",name:"7.º Grupo de Artillería",type:"Artillería",province:"bayeux",strength:88,readiness:73,attack:72,defense:40,mobility:31,supply:82,fuel:24}],
axis:[
{id:"x1",name:"352.ª División de Infantería",type:"Infantería",province:"caen",strength:82,readiness:76,attack:55,defense:72,mobility:35,supply:66,fuel:0},
{id:"x2",name:"21.º Grupo Panzer",type:"Blindados",province:"falaise",strength:79,readiness:80,attack:84,defense:65,mobility:70,supply:61,fuel:58},
{id:"x3",name:"Grupo de Combate Lehr",type:"Mecanizada",province:"vire",strength:73,readiness:71,attack:78,defense:68,mobility:63,supply:57,fuel:52},
{id:"x4",name:"3.º Grupo de Artillería",type:"Artillería",province:"argentan",strength:86,readiness:74,attack:70,defense:38,mobility:29,supply:69,fuel:20}]}};