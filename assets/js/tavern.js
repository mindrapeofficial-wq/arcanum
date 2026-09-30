"use strict";

const TAVERN_WORLD = { width: 1280, height: 820 };
const TAVERN_SPAWN = { x: 640, y: 735 };
const TAVERN_SPEED = 185;
const TAVERN_RADIUS = 14;
const TAVERN_BROADCAST_MS = 110;

let tavernRuntime = null;
const TAVERN_ASCENDANT_SPRITE = new Image();
TAVERN_ASCENDANT_SPRITE.src = "assets/art/characters/ascendant/walk.svg?v=0.2.48";

function tavernSchoolColor(code){
  return ({
    verdant:"#6fbf73",
    eradication:"#d65d4d",
    abyssal:"#9965cc",
    phantasm:"#62a5d9",
    ascendant:"#e4d7a4"
  })[code] || "#c99d5b";
}

function tavernClamp(v,min,max){ return Math.max(min,Math.min(max,v)); }

function tavernObstacles(){
  return [
    {x:0,y:0,w:1280,h:52},
    {x:0,y:0,w:42,h:820},
    {x:1238,y:0,w:42,h:820},
    {x:0,y:778,w:500,h:42},
    {x:780,y:778,w:500,h:42},
    {x:82,y:92,w:360,h:108},
    {x:838,y:82,w:350,h:132},
    {x:84,y:257,w:220,h:96},
    {x:975,y:300,w:190,h:110},
    {x:93,y:606,w:250,h:88},
    {x:930,y:600,w:260,h:92},
    {x:412,y:248,w:168,h:82},
    {x:704,y:248,w:168,h:82},
    {x:418,y:492,w:168,h:82},
    {x:698,y:492,w:168,h:82},
    {x:537,y:610,w:212,h:72}
  ];
}

function tavernCircleHitsRect(x,y,r,o){
  const cx=tavernClamp(x,o.x,o.x+o.w);
  const cy=tavernClamp(y,o.y,o.y+o.h);
  const dx=x-cx, dy=y-cy;
  return dx*dx+dy*dy < r*r;
}

function tavernCanMove(x,y){
  if(x<TAVERN_RADIUS+44 || x>TAVERN_WORLD.width-TAVERN_RADIUS-44) return false;
  if(y<TAVERN_RADIUS+54 || y>TAVERN_WORLD.height-TAVERN_RADIUS-44) return false;
  if(y>758 && (x<510 || x>770)) return false;
  return !tavernObstacles().some(o=>tavernCircleHitsRect(x,y,TAVERN_RADIUS,o));
}

function tavernDrawPixelText(ctx,text,x,y,size=14,align="center"){
  ctx.save();
  ctx.font=`700 ${size}px monospace`;
  ctx.textAlign=align;
  ctx.textBaseline="middle";
  ctx.imageSmoothingEnabled=false;
  ctx.lineWidth=4;
  ctx.strokeStyle="rgba(15,8,4,.9)";
  ctx.strokeText(text,x,y);
  ctx.fillStyle="#f4ddb0";
  ctx.fillText(text,x,y);
  ctx.restore();
}

function tavernDrawRoom(ctx){
  const w=TAVERN_WORLD.width,h=TAVERN_WORLD.height;
  ctx.fillStyle="#17100b";ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#6f452b";ctx.fillRect(42,52,w-84,h-96);

  // floor planks
  for(let y=52;y<h-44;y+=32){
    ctx.fillStyle=(Math.floor(y/32)%2)?"#5f3b25":"#694329";
    ctx.fillRect(42,y,w-84,30);
    ctx.fillStyle="rgba(33,19,11,.3)";
    ctx.fillRect(42,y+28,w-84,2);
    for(let x=52+(Math.floor(y/32)%2)*52;x<w-50;x+=104){
      ctx.fillRect(x,y,2,30);
    }
  }

  // stone entrance
  ctx.fillStyle="#6f6a5d";ctx.fillRect(500,758,280,62);
  for(let x=510;x<780;x+=45){ctx.fillStyle="#8d8675";ctx.fillRect(x,766,35,18);ctx.fillRect(x-18,790,35,18);}

  // walls
  ctx.fillStyle="#302117";ctx.fillRect(0,0,w,52);ctx.fillRect(0,0,42,h);ctx.fillRect(w-42,0,42,h);
  ctx.fillRect(0,778,500,42);ctx.fillRect(780,778,500,42);
  ctx.fillStyle="#9c7650";ctx.fillRect(0,42,w,10);ctx.fillRect(32,0,10,h);ctx.fillRect(w-42,0,10,h);

  const drawTable=(x,y,ww,hh)=>{
    ctx.fillStyle="#2c1a10";ctx.fillRect(x-8,y+8,ww+16,hh);
    ctx.fillStyle="#8c572f";ctx.fillRect(x,y,ww,hh);
    ctx.fillStyle="#a96c3a";ctx.fillRect(x+8,y+8,ww-16,10);
    ctx.fillStyle="#24150d";
    for(let i=0;i<ww;i+=38)ctx.fillRect(x+i,y+2,3,hh-4);
  };

  // bar + shelves
  ctx.fillStyle="#3a2517";ctx.fillRect(82,92,360,108);
  ctx.fillStyle="#8e5933";ctx.fillRect(94,105,336,18);
  ctx.fillStyle="#21150e";
  for(let x=110;x<415;x+=38){ctx.fillRect(x,134,18,44);ctx.fillStyle="#8b5f2f";ctx.fillRect(x+4,140,10,18);ctx.fillStyle="#21150e";}
  ctx.fillStyle="#a16838";ctx.fillRect(84,188,356,28);
  for(let x=110;x<430;x+=54){ctx.fillStyle="#4c2d1a";ctx.beginPath();ctx.arc(x,232,15,0,Math.PI*2);ctx.fill();}

  // fireplace/lounge
  ctx.fillStyle="#4b3528";ctx.fillRect(838,82,350,132);
  ctx.fillStyle="#292929";ctx.fillRect(975,99,76,88);
  ctx.fillStyle="#7d452b";ctx.fillRect(986,123,54,48);
  ctx.fillStyle="#f5aa45";ctx.beginPath();ctx.moveTo(1000,169);ctx.quadraticCurveTo(1008,130,1021,166);ctx.quadraticCurveTo(1035,145,1037,170);ctx.fill();
  ctx.fillStyle="#b58a54";ctx.fillRect(858,173,86,26);ctx.fillRect(1082,173,86,26);

  drawTable(84,257,220,96);
  drawTable(975,300,190,110);
  drawTable(93,606,250,88);
  drawTable(930,600,260,92);
  drawTable(412,248,168,82);
  drawTable(704,248,168,82);
  drawTable(418,492,168,82);
  drawTable(698,492,168,82);
  drawTable(537,610,212,72);

  // rugs / social center
  ctx.fillStyle="#263b55";ctx.fillRect(576,342,128,124);
  ctx.fillStyle="#c19a50";ctx.fillRect(586,352,108,104);
  ctx.fillStyle="#2a4564";ctx.fillRect(590,356,100,96);
  ctx.fillStyle="#cfaa5d";ctx.beginPath();ctx.arc(640,404,14,0,Math.PI*2);ctx.fill();

  // quest board
  ctx.fillStyle="#432b1a";ctx.fillRect(360,624,132,100);
  ctx.fillStyle="#9a6a3b";ctx.fillRect(370,635,112,78);
  ctx.fillStyle="#d8c28c";ctx.fillRect(381,646,30,38);ctx.fillRect(422,655,42,30);
  ctx.fillStyle="#3a281d";ctx.fillRect(387,655,18,3);ctx.fillRect(428,665,30,3);

  // bard stage
  ctx.fillStyle="#392216";ctx.fillRect(975,300,190,110);
  ctx.fillStyle="#915832";ctx.fillRect(985,312,170,82);
  ctx.fillStyle="#c89b58";ctx.beginPath();ctx.arc(1060,350,17,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#4d2b18";ctx.fillRect(1056,365,8,30);

  // lamps
  [[62,73],[1216,73],[62,755],[1216,755],[640,90],[640,550]].forEach(([x,y])=>{
    ctx.fillStyle="#321e10";ctx.fillRect(x-3,y-20,6,18);
    ctx.fillStyle="#f1b24d";ctx.fillRect(x-8,y-8,16,18);
    ctx.fillStyle="#ffe077";ctx.fillRect(x-3,y-3,6,8);
  });

  tavernDrawPixelText(ctx,"LA TABERNA DE ARCANUM",640,28,18);
}

function tavernDrawMage(ctx,p,isSelf=false){
  const color=tavernSchoolColor(p.school);
  ctx.save();
  ctx.translate(Math.round(p.x),Math.round(p.y));
  if(isSelf){ctx.fillStyle="rgba(244,221,176,.22)";ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.ellipse(0,17,18,6,0,0,Math.PI*2);ctx.fill();

  const moving=Boolean(p.moving || (p.movingUntil && p.movingUntil>Date.now()));
  const ascendant=p.school==="ascendant" && TAVERN_ASCENDANT_SPRITE.complete && TAVERN_ASCENDANT_SPRITE.naturalWidth>0;
  if(ascendant){
    const frame=moving?Math.floor(Date.now()/105)%5:0;
    const sw=128, sh=170;
    const dw=58, dh=77;
    const flip=p.dir==="left";
    ctx.save();
    if(flip)ctx.scale(-1,1);
    ctx.drawImage(TAVERN_ASCENDANT_SPRITE,frame*sw,0,sw,sh,-dw/2,-dh+20,dw,dh);
    ctx.restore();
  }else{
    ctx.fillStyle=color;ctx.fillRect(-10,-7,20,22);
    ctx.fillStyle="#d7bf9c";ctx.fillRect(-7,-18,14,12);
    ctx.fillStyle="#23140d";ctx.fillRect(-8,-20,16,4);
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-13,15);ctx.lineTo(0,-2);ctx.lineTo(13,15);ctx.closePath();ctx.fill();
    if(p.dir==="left"||p.dir==="right"){ctx.fillStyle="#d7bf9c";ctx.fillRect(p.dir==="left"?-14:10,-3,4,10);}
  }

  tavernDrawPixelText(ctx,p.name||"Archimago",0,ascendant?-67:-34,12);
  if(p.bubble && p.bubbleUntil>Date.now()){
    const txt=String(p.bubble).slice(0,42);
    ctx.font="700 12px sans-serif";
    const bw=Math.min(240,Math.max(72,ctx.measureText(txt).width+20));
    const by=ascendant?-104:-72;
    ctx.fillStyle="rgba(20,13,9,.94)";ctx.fillRect(-bw/2,by,bw,26);
    ctx.strokeStyle="#c99d5b";ctx.strokeRect(-bw/2,by,bw,26);
    ctx.fillStyle="#fff0d0";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(txt,0,by+13);
  }
  ctx.restore();
}

function tavernViewport(canvas){
  const scale=Math.min(canvas.clientWidth/TAVERN_WORLD.width, canvas.clientHeight/TAVERN_WORLD.height);
  return {scale:Math.max(.25,scale), ox:(canvas.width-TAVERN_WORLD.width*scale)/2, oy:(canvas.height-TAVERN_WORLD.height*scale)/2};
}

function tavernRenderFrame(rt){
  const canvas=rt.canvas,ctx=rt.ctx;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const rw=Math.max(320,canvas.clientWidth),rh=Math.max(360,canvas.clientHeight);
  if(canvas.width!==Math.round(rw*dpr)||canvas.height!==Math.round(rh*dpr)){canvas.width=Math.round(rw*dpr);canvas.height=Math.round(rh*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,rw,rh);
  const scale=Math.min(rw/TAVERN_WORLD.width,rh/TAVERN_WORLD.height);
  const ox=(rw-TAVERN_WORLD.width*scale)/2,oy=(rh-TAVERN_WORLD.height*scale)/2;
  ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
  ctx.imageSmoothingEnabled=false;
  tavernDrawRoom(ctx);
  [...rt.remotes.values()].forEach(p=>tavernDrawMage(ctx,p,false));
  tavernDrawMage(ctx,rt.player,true);
  ctx.restore();
}

function tavernMove(rt,dt){
  let dx=0,dy=0;
  if(rt.keys.has("ArrowLeft")||rt.keys.has("a"))dx--;
  if(rt.keys.has("ArrowRight")||rt.keys.has("d"))dx++;
  if(rt.keys.has("ArrowUp")||rt.keys.has("w"))dy--;
  if(rt.keys.has("ArrowDown")||rt.keys.has("s"))dy++;
  if(!dx&&!dy){rt.player.moving=false;return false;}
  const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
  const nx=rt.player.x+dx*TAVERN_SPEED*dt, ny=rt.player.y+dy*TAVERN_SPEED*dt;
  if(tavernCanMove(nx,rt.player.y))rt.player.x=nx;
  if(tavernCanMove(rt.player.x,ny))rt.player.y=ny;
  rt.player.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"up":"down");
  return true;
}

function tavernBroadcastPosition(rt,force=false){
  const now=Date.now();
  if(!rt.channel || !rt.connected || (!force && now-rt.lastBroadcast<TAVERN_BROADCAST_MS))return;
  rt.lastBroadcast=now;
  rt.channel.send({type:"broadcast",event:"position",payload:{
    id:rt.id,name:rt.player.name,school:rt.player.school,x:Math.round(rt.player.x),y:Math.round(rt.player.y),dir:rt.player.dir,t:now
  }}).catch(()=>{});
}

function tavernUpdateNearby(rt){
  const list=[...rt.remotes.values()]
    .map(p=>({...p,d:Math.round(Math.hypot(p.x-rt.player.x,p.y-rt.player.y))}))
    .filter(p=>p.d<290).sort((a,b)=>a.d-b.d).slice(0,8);
  const host=document.querySelector("#tavern-nearby-list");
  const count=document.querySelector("#tavern-online-count");
  if(count)count.textContent=String(rt.presenceCount||list.length+1);
  if(!host)return;
  host.innerHTML=list.length?list.map(p=>`<button type="button" class="tavern-nearby-player" data-profile="${esc(p.name)}"><span class="school-dot ${esc(p.school)}"></span><span><strong>${esc(p.name)}</strong><small>${p.d}px de distancia</small></span></button>`).join(""):'<div class="tavern-empty">No hay nadie cerca. Explora la sala.</div>';
}

function tavernLoop(rt,ts){
  if(!rt.active)return;
  const dt=Math.min(.05,(ts-(rt.lastFrame||ts))/1000);rt.lastFrame=ts;
  const moved=tavernMove(rt,dt);
  if(moved)tavernBroadcastPosition(rt);
  tavernRenderFrame(rt);
  if(ts-rt.lastNearby>500){rt.lastNearby=ts;tavernUpdateNearby(rt);}
  rt.raf=requestAnimationFrame(t=>tavernLoop(rt,t));
}

async function tavernConnect(rt){
  if(!window.supabase?.createClient){
    rt.status.textContent="Realtime no disponible";
    return;
  }
  const session=await validSession();
  if(!session?.access_token)return;
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  try{await client.realtime.setAuth(session.access_token);}catch{}
  const channel=client.channel("arcanum:tavern:v1",{config:{broadcast:{self:false,ack:false},presence:{key:rt.id}}});
  rt.client=client;rt.channel=channel;

  channel.on("broadcast",{event:"position"},({payload})=>{
    if(!payload?.id||payload.id===rt.id)return;
    const prev=rt.remotes.get(payload.id)||{};
    rt.remotes.set(payload.id,{...prev,...payload,lastSeen:Date.now()});
  });
  channel.on("broadcast",{event:"tavern_chat"},({payload})=>{
    if(!payload?.id||!payload?.text)return;
    if(payload.id===rt.id)return;
    const p=rt.remotes.get(payload.id)||{id:payload.id,name:payload.name||"Archimago",school:payload.school||"" ,x:640,y:404};
    p.bubble=String(payload.text).slice(0,120);p.bubbleUntil=Date.now()+6500;
    rt.remotes.set(payload.id,p);
    tavernAppendChat(rt,p.name,p.bubble,false);
  });
  channel.on("presence",{event:"sync"},()=>{
    const state=channel.presenceState();
    rt.presenceCount=Object.keys(state||{}).length;
  });

  channel.subscribe(async status=>{
    if(status!=="SUBSCRIBED")return;
    rt.connected=true;
    rt.status.textContent="Sala sincronizada";
    await channel.track({id:rt.id,name:rt.player.name,school:rt.player.school,joined_at:new Date().toISOString()}).catch(()=>{});
    tavernBroadcastPosition(rt,true);
  });
}

function tavernAppendChat(rt,name,text,self){
  const log=document.querySelector("#tavern-chat-log");if(!log)return;
  const item=document.createElement("div");item.className=`tavern-chat-line ${self?"self":""}`;
  item.innerHTML=`<strong>${esc(name)}</strong><span>${esc(text)}</span>`;
  log.appendChild(item);while(log.children.length>30)log.firstElementChild?.remove();log.scrollTop=log.scrollHeight;
}

function tavernSendChat(rt,text){
  const msg=String(text||"").trim().slice(0,120);if(!msg)return;
  rt.player.bubble=msg;rt.player.bubbleUntil=Date.now()+6500;
  tavernAppendChat(rt,rt.player.name,msg,true);
  if(rt.channel&&rt.connected)rt.channel.send({type:"broadcast",event:"tavern_chat",payload:{id:rt.id,name:rt.player.name,school:rt.player.school,text:msg,t:Date.now()}}).catch(()=>{});
}

function tavernWireControls(rt){
  const root=document.querySelector("#tavern-root");
  const form=root?.querySelector("#tavern-chat-form");
  const input=root?.querySelector("#tavern-chat-input");
  form?.addEventListener("submit",e=>{e.preventDefault();tavernSendChat(rt,input.value);input.value="";});
  const valid=new Set(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","w","a","s","d"]);
  rt.onKeyDown=e=>{
    if(!rt.active||e.target?.matches("input,textarea,select"))return;
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(valid.has(k)){e.preventDefault();rt.keys.add(k);}
  };
  rt.onKeyUp=e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;rt.keys.delete(k);};
  window.addEventListener("keydown",rt.onKeyDown,{passive:false});window.addEventListener("keyup",rt.onKeyUp);

  root?.querySelectorAll("[data-tavern-key]").forEach(btn=>{
    const key=btn.dataset.tavernKey;
    const down=e=>{e.preventDefault();rt.keys.add(key);btn.classList.add("pressed");};
    const up=e=>{e.preventDefault();rt.keys.delete(key);btn.classList.remove("pressed");};
    btn.addEventListener("pointerdown",down);btn.addEventListener("pointerup",up);btn.addEventListener("pointercancel",up);btn.addEventListener("pointerleave",up);
  });
}

async function renderTavern(){
  stopTavern();
  const host=document.querySelector("#view-host");
  const mage=realmState?.realm?.mage_name||"Archimago";
  const school=realmState?.realm?.school_code||"";
  host.innerHTML=`
    <div id="tavern-root" class="tavern-root">
      <div class="tavern-head">
        <div><span class="section-kicker">ZONA SOCIAL</span><h2>La Taberna</h2><p>Camina, encuentra otros Archimagos y habla con ellos en tiempo real.</p></div>
        <div class="tavern-status"><span class="presence-dot"></span><strong id="tavern-status">Conectando…</strong><small><b id="tavern-online-count">1</b> dentro</small></div>
      </div>
      <div class="tavern-layout">
        <section class="tavern-stage">
          <canvas id="tavern-canvas" aria-label="Mapa jugable de La Taberna"></canvas>
          <div class="tavern-help">WASD / flechas · En móvil usa el pad</div>
          <div class="tavern-dpad" aria-label="Controles táctiles">
            <button type="button" data-tavern-key="ArrowUp">▲</button>
            <button type="button" data-tavern-key="ArrowLeft">◀</button>
            <button type="button" data-tavern-key="ArrowDown">▼</button>
            <button type="button" data-tavern-key="ArrowRight">▶</button>
          </div>
        </section>
        <aside class="tavern-side">
          <section class="panel tavern-nearby"><div class="tavern-side-title"><span class="section-kicker">CERCA DE TI</span><strong>Archimagos</strong></div><div id="tavern-nearby-list"><div class="tavern-empty">Buscando jugadores…</div></div></section>
          <section class="panel tavern-chat"><div class="tavern-side-title"><span class="section-kicker">CONVERSACIÓN</span><strong>Chat de la sala</strong></div><div id="tavern-chat-log" class="tavern-chat-log"></div><form id="tavern-chat-form"><input id="tavern-chat-input" maxlength="120" autocomplete="off" placeholder="Di algo en la taberna…"><button type="submit">ENVIAR</button></form></section>
        </aside>
      </div>
    </div>`;

  const canvas=document.querySelector("#tavern-canvas");
  const rt={
    active:true,canvas,ctx:canvas.getContext("2d"),status:document.querySelector("#tavern-status"),
    id:String(getSession()?.user?.id||mage),player:{name:mage,school,x:TAVERN_SPAWN.x,y:TAVERN_SPAWN.y,dir:"up",moving:false,bubble:"",bubbleUntil:0},
    remotes:new Map(),keys:new Set(),lastBroadcast:0,lastNearby:0,presenceCount:1,connected:false,lastFrame:0
  };
  tavernRuntime=rt;
  tavernWireControls(rt);
  tavernConnect(rt).catch(()=>{rt.status.textContent="Modo local";});
  rt.raf=requestAnimationFrame(t=>tavernLoop(rt,t));
}

function stopTavern(){
  const rt=tavernRuntime;if(!rt)return;
  rt.active=false;if(rt.raf)cancelAnimationFrame(rt.raf);
  if(rt.onKeyDown)window.removeEventListener("keydown",rt.onKeyDown);
  if(rt.onKeyUp)window.removeEventListener("keyup",rt.onKeyUp);
  try{rt.channel?.untrack?.();}catch{}
  try{rt.client?.removeChannel?.(rt.channel);}catch{}
  tavernRuntime=null;
}
