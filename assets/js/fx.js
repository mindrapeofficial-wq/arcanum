"use strict";

/* ARCANUM · visual FX engine
   Purely cosmetic and additive. It never reads or writes gameplay state: it only
   observes what the UI already displays (school label, resource numbers, view host)
   and decorates it. Disabled automatically for prefers-reduced-motion, can be
   switched off with localStorage["arcanum.fx.v1"]="off", and pauses when the tab is hidden. */
const ArcanumFx=(()=>{
  const KEY="arcanum.fx.v1";
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse=window.matchMedia("(pointer: coarse)").matches;
  let userOff=false;
  try{userOff=localStorage.getItem(KEY)==="off";}catch{}
  const enabled=()=>!reduceMotion&&!userOff;

  /* School accent (rgb triplets) — mirrors the five-school colour rules */
  const SCHOOLS=[
    {test:/viridia|verdan|verdant/i,key:"viridia",rgb:"126,190,110"},
    {test:/aurea|ascend/i,key:"aurea",rgb:"255,226,160"},
    {test:/cineria|erradic|eradic/i,key:"cineria",rgb:"214,92,72"},
    {test:/nadir|abis|abyss/i,key:"nadir",rgb:"150,110,210"},
    {test:/oneiria|fantasm|phantasm/i,key:"oneiria",rgb:"100,160,230"}
  ];
  const DEFAULT_RGB="217,155,57";
  let accent=DEFAULT_RGB;

  function applySchool(){
    const label=document.getElementById("mage-school")?.textContent||"";
    const hit=SCHOOLS.find(s=>s.test.test(label));
    const root=document.documentElement;
    if(hit){root.dataset.school=hit.key;accent=hit.rgb;}
    else{delete root.dataset.school;accent=DEFAULT_RGB;}
    root.style.setProperty("--accent",accent);
    sprites.clear();
  }

  /* ── Particle canvas ─────────────────────────────────────────────── */
  let canvas=null,ctx=null,W=0,H=0,dpr=1,raf=0,last=0,running=false;
  const parts=[];
  const sprites=new Map();
  const MAX=coarse?18:46;
  let nextStreak=performance.now()+9000;

  function sprite(rgb){
    if(sprites.has(rgb))return sprites.get(rgb);
    const s=64,c=document.createElement("canvas");c.width=c.height=s;
    const g=c.getContext("2d"),grad=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
    grad.addColorStop(0,`rgba(${rgb},1)`);grad.addColorStop(.18,`rgba(${rgb},.7)`);
    grad.addColorStop(.5,`rgba(${rgb},.16)`);grad.addColorStop(1,`rgba(${rgb},0)`);
    g.fillStyle=grad;g.fillRect(0,0,s,s);
    sprites.set(rgb,c);return c;
  }
  function rand(a,b){return a+Math.random()*(b-a);}
  function spawnEmber(initial){
    parts.push({kind:"ember",x:rand(0,W),y:initial?rand(0,H):H+rand(4,40),vx:rand(-6,6),vy:-rand(14,38),
      size:rand(5,13),life:0,max:rand(7,15),phase:rand(0,6.28),sway:rand(8,26),rgb:Math.random()<.7?"255,176,72":"255,208,120"});
  }
  function spawnMote(initial){
    parts.push({kind:"mote",x:rand(0,W),y:initial?rand(0,H):rand(0,H),vx:rand(-5,5),vy:rand(-9,-2),
      size:rand(6,13),life:initial?rand(0,6):0,max:rand(9,18),phase:rand(0,6.28),sway:rand(10,30),rgb:null});
  }
  function burst(x,y,n=12,rgb=null){
    if(!running)return;
    for(let i=0;i<n;i++){
      const a=rand(0,6.283),sp=rand(40,150);
      parts.push({kind:"spark",x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-30,size:rand(4,9),life:0,max:rand(.45,.9),rgb:rgb||"255,214,128"});
    }
  }
  function streak(){
    const y=rand(H*.05,H*.4);
    parts.push({kind:"streak",x:rand(W*.4,W),y,vx:-rand(520,780),vy:rand(120,220),size:0,life:0,max:.9,rgb:"255,236,190"});
  }
  function fit(){
    dpr=Math.min(window.devicePixelRatio||1,1.5);
    W=window.innerWidth;H=window.innerHeight;
    canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);
    canvas.style.width=W+"px";canvas.style.height=H+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function frame(now){
    raf=requestAnimationFrame(frame);
    if(document.hidden)return;
    const dt=Math.min(.05,(now-last)/1000||.016);last=now;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation="lighter";
    let embers=0,motes=0;
    for(let i=parts.length-1;i>=0;i--){
      const p=parts[i];p.life+=dt;
      if(p.life>=p.max||p.y<-60||p.x<-80||p.x>W+80){parts.splice(i,1);continue;}
      const k=p.life/p.max;
      if(p.kind==="streak"){
        p.x+=p.vx*dt;p.y+=p.vy*dt;
        const len=150,ang=Math.atan2(p.vy,p.vx),a=(1-k)*.55;
        const g=ctx.createLinearGradient(p.x,p.y,p.x-Math.cos(ang)*len,p.y-Math.sin(ang)*len);
        g.addColorStop(0,`rgba(${p.rgb},${a})`);g.addColorStop(1,`rgba(${p.rgb},0)`);
        ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(p.x,p.y);
        ctx.lineTo(p.x-Math.cos(ang)*len,p.y-Math.sin(ang)*len);ctx.stroke();
        continue;
      }
      if(p.kind==="spark"){p.vy+=260*dt;p.vx*=.985;}
      else{p.x+=Math.sin(p.life*.9+p.phase)*p.sway*dt;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      const fade=p.kind==="spark"?(1-k):Math.min(1,k*5)*Math.min(1,(1-k)*3);
      const base=p.kind==="mote"?.26:p.kind==="ember"?.62:.95;
      let size=p.size*(p.kind==="spark"?(1-k*.6):1);
      if(p.kind==="ember"){embers++;size*=.7+.3*Math.sin(p.life*7+p.phase);}else if(p.kind==="mote")motes++;
      ctx.globalAlpha=Math.max(0,fade*base);
      ctx.drawImage(sprite(p.rgb||accent),p.x-size,p.y-size,size*2,size*2);
    }
    ctx.globalAlpha=1;
    if(embers<MAX*.55&&Math.random()<dt*MAX*.35)spawnEmber(false);
    if(motes<MAX*.45&&Math.random()<dt*MAX*.18)spawnMote(false);
    if(now>nextStreak){streak();nextStreak=now+rand(14000,30000);}
  }
  function start(){
    if(running||!enabled())return;
    canvas=document.createElement("canvas");canvas.id="fx-canvas";canvas.setAttribute("aria-hidden","true");
    document.body.appendChild(canvas);ctx=canvas.getContext("2d");fit();
    for(let i=0;i<MAX*.5;i++)spawnEmber(true);
    for(let i=0;i<MAX*.4;i++)spawnMote(true);
    running=true;last=performance.now();raf=requestAnimationFrame(frame);
    window.addEventListener("resize",fit,{passive:true});
  }

  /* ── Interaction FX ──────────────────────────────────────────────── */
  function wirePointer(){
    document.addEventListener("pointerdown",e=>{
      if(!running||e.button>0)return;
      const hit=e.target.closest?.("button:not(:disabled),a,[data-view],.school-card,.primary-action");
      if(hit)burst(e.clientX,e.clientY,hit.classList.contains("primary-action")?18:10,hit.classList.contains("primary-action")?null:accent);
    },{capture:true,passive:true});
    if(coarse)return;
    let pending=null,ticking=false;
    const flush=()=>{
      ticking=false;if(!pending)return;
      const {x,y,target}=pending;pending=null;
      const card=target.closest?.(".panel,.realm-vital-card,.realm-banner-2");
      if(card){const r=card.getBoundingClientRect();card.style.setProperty("--mx",(x-r.left)+"px");card.style.setProperty("--my",(y-r.top)+"px");}
      const ambient=document.getElementById("ambient");
      if(ambient&&!document.getElementById("auth-view")?.hidden){
        ambient.style.setProperty("--px",((x/W)*2-1).toFixed(3));ambient.style.setProperty("--py",((y/H)*2-1).toFixed(3));
      }
    };
    document.addEventListener("pointermove",e=>{
      pending={x:e.clientX,y:e.clientY,target:e.target};
      if(!ticking){ticking=true;requestAnimationFrame(flush);}
    },{passive:true});
  }

  /* ── Staggered entrance when the player switches section ─────────── */
  let animatedView=null,revealTimer=0;
  function reveal(host){
    const kids=[...host.children].filter(el=>!el.classList.contains("skeleton"));
    kids.slice(0,10).forEach((el,i)=>{
      el.style.setProperty("--i",i);
      el.classList.remove("fx-in");void el.offsetWidth;el.classList.add("fx-in");
      el.addEventListener("animationend",()=>{el.classList.remove("fx-in");el.style.removeProperty("--i");},{once:true});
    });
  }
  function wireViewHost(){
    const host=document.getElementById("view-host");if(!host)return;
    new MutationObserver(()=>{
      if(host.querySelector(".skeleton")){animatedView=null;return;}
      clearTimeout(revealTimer);
      revealTimer=setTimeout(()=>{
        const view=typeof currentView!=="undefined"?currentView:"";
        if(!enabled()||animatedView===view||!host.children.length)return;
        animatedView=view;reveal(host);
        window.scrollTo({top:0,behavior:"smooth"});
      },70);
    }).observe(host,{childList:true});
  }

  /* ── HUD: flash a resource when its displayed value moves ────────── */
  function wireResources(){
    const strip=document.querySelector(".resource-strip");if(!strip)return;
    const seen=new WeakMap();
    const parse=t=>{
      if(/[:a-z]/i.test(t.replace(/\s/g,"")))return null;
      const n=Number(t.replace(/[^\d-]/g,""));return Number.isFinite(n)&&/\d/.test(t)?n:null;
    };
    const check=()=>strip.querySelectorAll(".resource-copy strong").forEach(el=>{
      const v=parse(el.textContent||"");if(v===null)return;
      const prev=seen.get(el);seen.set(el,v);
      if(prev===undefined||prev===v)return;
      const cls=v>prev?"fx-up":"fx-down";
      el.classList.remove("fx-up","fx-down");void el.offsetWidth;el.classList.add(cls);
      setTimeout(()=>el.classList.remove(cls),1100);
    });
    new MutationObserver(()=>requestAnimationFrame(check)).observe(strip,{childList:true,subtree:true,characterData:true});
    check();
  }

  /* ── Scroll: progress line, topbar depth and hero parallax ───────── */
  function wireScroll(){
    const bar=document.createElement("div");bar.id="fx-scroll";bar.setAttribute("aria-hidden","true");document.body.appendChild(bar);
    let ticking=false;
    const update=()=>{
      ticking=false;
      const max=document.documentElement.scrollHeight-window.innerHeight;
      const y=window.scrollY;
      bar.style.transform="scaleX("+(max>0?Math.min(1,y/max):0)+")";
      document.querySelector(".topbar")?.classList.toggle("is-scrolled",y>8);
      if(enabled()&&!coarse){
        const img=document.querySelector(".realm-kingdom-image");
        if(img)img.style.translate="0 "+Math.min(60,y*.12).toFixed(1)+"px";
      }
    };
    window.addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
    update();
  }

  function init(){
    if(!enabled()){document.documentElement.classList.add("fx-off");return;}
    start();wirePointer();wireScroll();
    const school=document.getElementById("mage-school");
    if(school)new MutationObserver(applySchool).observe(school,{childList:true,characterData:true,subtree:true});
    applySchool();wireViewHost();wireResources();
  }
  return {init,burst,setEnabled(v){try{localStorage.setItem(KEY,v?"on":"off");}catch{}location.reload();}};
})();

window.ArcanumFx=ArcanumFx;
window.addEventListener("DOMContentLoaded",()=>ArcanumFx.init());
