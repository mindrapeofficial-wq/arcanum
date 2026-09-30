"use strict";

const TAVERN_WORLD = { width: 1024, height: 768 };
const TAVERN_SPAWN = { x: 560, y: 619 };
const TAVERN_SPEED = 180;
const TAVERN_RADIUS = 13;
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

const tavernMapAsset={ready:false,canvas:null,mask:null,width:0,height:0,colors:0};

async function tavernGunzipBase64(value){
  const raw=Uint8Array.from(atob(String(value||"")),c=>c.charCodeAt(0));
  if(typeof DecompressionStream!=="function")throw new Error("Este navegador no soporta el mapa comprimido de la Taberna.");
  const stream=new Blob([raw]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function tavernPrepareMap(){
  if(tavernMapAsset.ready)return true;
  const data=window.ARCANUM_TAVERN_MAP_DATA;
  if(!data?.map||!data?.mask)throw new Error("No se ha podido cargar el mapa de la Taberna.");
  const [mapBytes,maskBytes]=await Promise.all([tavernGunzipBase64(data.map),tavernGunzipBase64(data.mask)]);
  const width=Number(data.width||128),height=Number(data.height||96),colors=Number(data.colors||32);
  const paletteBytes=colors*3;
  if(mapBytes.length<paletteBytes+width*height)throw new Error("Los datos del mapa de la Taberna están incompletos.");
  const c=document.createElement("canvas");
  c.width=width;c.height=height;
  const cx=c.getContext("2d",{alpha:false});
  const image=cx.createImageData(width,height);
  for(let i=0;i<width*height;i++){
    const pi=mapBytes[paletteBytes+i]*3,di=i*4;
    image.data[di]=mapBytes[pi]||0;
    image.data[di+1]=mapBytes[pi+1]||0;
    image.data[di+2]=mapBytes[pi+2]||0;
    image.data[di+3]=255;
  }
  cx.putImageData(image,0,0);
  tavernMapAsset.ready=true;
  tavernMapAsset.canvas=c;
  tavernMapAsset.mask=maskBytes;
  tavernMapAsset.width=width;
  tavernMapAsset.height=height;
  tavernMapAsset.colors=colors;
  return true;
}

function tavernMaskWalkable(x,y){
  if(!tavernMapAsset.ready||!tavernMapAsset.mask)return false;
  if(x<0||y<0||x>=TAVERN_WORLD.width||y>=TAVERN_WORLD.height)return false;
  const gx=Math.max(0,Math.min(tavernMapAsset.width-1,Math.floor(x/TAVERN_WORLD.width*tavernMapAsset.width)));
  const gy=Math.max(0,Math.min(tavernMapAsset.height-1,Math.floor(y/TAVERN_WORLD.height*tavernMapAsset.height)));
  const bit=gy*tavernMapAsset.width+gx;
  const byte=tavernMapAsset.mask[bit>>3]||0;
  return Boolean(byte&(1<<(7-(bit&7))));
}

function tavernCanMove(x,y){
  const r=TAVERN_RADIUS;
  const samples=[[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.72,r*.72],[r*.72,-r*.72],[-r*.72,r*.72],[-r*.72,-r*.72]];
  return samples.every(([dx,dy])=>tavernMaskWalkable(x+dx,y+dy));
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
  ctx.fillStyle="#050403";
  ctx.fillRect(0,0,TAVERN_WORLD.width,TAVERN_WORLD.height);
  if(tavernMapAsset.ready&&tavernMapAsset.canvas){
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(tavernMapAsset.canvas,0,0,tavernMapAsset.width,tavernMapAsset.height,0,0,TAVERN_WORLD.width,TAVERN_WORLD.height);
    ctx.restore();
  }
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
  rt.player.moving=true;
  rt.player.moving=true;
  const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
  const mx=dx*TAVERN_SPEED*dt,my=dy*TAVERN_SPEED*dt;
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(mx),Math.abs(my))/4));
  const sx=mx/steps,sy=my/steps;
  let moved=false;
  for(let i=0;i<steps;i++){
    const nx=rt.player.x+sx;
    if(tavernCanMove(nx,rt.player.y)){rt.player.x=nx;moved=true;}
    const ny=rt.player.y+sy;
    if(tavernCanMove(rt.player.x,ny)){rt.player.y=ny;moved=true;}
  }
  rt.player.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"up":"down");
  return moved;
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
    const p=rt.remotes.get(payload.id)||{id:payload.id,name:payload.name||"Archimago",school:payload.school||"" ,x:512,y:384};
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
  const status=document.querySelector("#tavern-status");
  if(status)status.textContent="Cargando mapa…";
  await tavernPrepareMap();
  if(status)status.textContent="Conectando…";
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
