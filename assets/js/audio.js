"use strict";

const ArcanumAudio=(()=>{
  const KEY="arcanum.audio.v1";
  const defaults={master:0.75,music:0.45,sfx:0.62,muted:false,musicEnabled:true,sfxEnabled:true};
  const bankPaths={
    select:"assets/audio/sfx/ui-select.wav.b64",
    confirm1:"assets/audio/sfx/ui-confirm-1.wav.b64",
    confirm2:"assets/audio/sfx/ui-confirm-2.wav.b64",
    open:"assets/audio/sfx/ui-open.wav.b64",
    error:"assets/audio/sfx/ui-error.wav.b64"
  };
  let settings={...defaults};
  let ctx=null,music=null,unlocked=false;
  let successIndex=0,selectIndex=0,lastHover=null,lastHoverAt=0;
  const bank=new Map();

  function clamp(v){return Math.max(0,Math.min(1,Number(v)||0));}
  function load(){
    try{settings={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")};}catch{settings={...defaults};}
    ["master","music","sfx"].forEach(k=>settings[k]=clamp(settings[k]));
    return settings;
  }
  function save(){localStorage.setItem(KEY,JSON.stringify(settings));apply();renderValues();}
  function ensureCtx(){
    if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==="suspended")ctx.resume().catch(()=>{});
    return ctx;
  }
  function effective(kind){
    if(settings.muted)return 0;
    if(kind==="music"&&!settings.musicEnabled)return 0;
    if(kind==="sfx"&&!settings.sfxEnabled)return 0;
    return settings.master*settings[kind];
  }

  function tone({f=440,f2=null,d=.06,type="sine",gain=.08,delay=0}={}){
    if(!unlocked||effective("sfx")<=0)return;
    const c=ensureCtx(),now=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(f,now);
    if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),now+d);
    const vol=gain*effective("sfx");
    g.gain.setValueAtTime(.0001,now);
    g.gain.exponentialRampToValueAtTime(Math.max(.0001,vol),now+.008);
    g.gain.exponentialRampToValueAtTime(.0001,now+d);
    o.connect(g);g.connect(c.destination);o.start(now);o.stop(now+d+.02);
  }


  /* ── Procedural arcane voices ────────────────────────────────────────
     Synthesised with WebAudio (FM bells, filtered noise sweeps, sub thumps)
     through a shared compressor + generated-reverb bus, so they need no
     asset files and work offline in the APK. Voices take (ctx,out,t) so they
     can also be rendered into an OfflineAudioContext for testing. */
  let fxBus=null;
  const noiseCache=new WeakMap();
  function impulse(c,seconds=2.1,decay=2.8){
    const len=Math.floor(c.sampleRate*seconds),buf=c.createBuffer(2,len,c.sampleRate);
    for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}
    return buf;
  }
  function bus(c){
    if(fxBus&&fxBus.ctx===c)return fxBus;
    const input=c.createGain(),dry=c.createGain(),wet=c.createGain(),verb=c.createConvolver(),comp=c.createDynamicsCompressor();
    verb.buffer=impulse(c);dry.gain.value=.85;wet.gain.value=.3;
    comp.threshold.value=-14;comp.ratio.value=6;comp.attack.value=.004;comp.release.value=.2;
    input.connect(dry);input.connect(verb);verb.connect(wet);dry.connect(comp);wet.connect(comp);comp.connect(c.destination);
    fxBus={ctx:c,input};return fxBus;
  }
  function noiseBuffer(c){
    let b=noiseCache.get(c);
    if(!b){b=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;noiseCache.set(c,b);}
    return b;
  }
  const synth={
    bell(c,out,t,{f=523.25,d=1.2,gain=.09,ratio=3.51,index=2.4}={}){
      const car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=c.createGain(),ov=c.createOscillator(),og=c.createGain();
      car.frequency.value=f;mod.frequency.value=f*ratio;ov.frequency.value=f*2.01;
      mg.gain.setValueAtTime(f*index,t);mg.gain.exponentialRampToValueAtTime(f*.02,t+d*.7);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);
      og.gain.value=.22;
      mod.connect(mg);mg.connect(car.frequency);car.connect(g);ov.connect(og);og.connect(g);g.connect(out);
      [car,mod,ov].forEach(o=>{o.start(t);o.stop(t+d+.05);});
    },
    noise(c,out,t,{d=.4,f0=400,f1=2400,q=1.2,gain=.12,type="bandpass",attack=.08}={}){
      const src=c.createBufferSource(),flt=c.createBiquadFilter(),g=c.createGain();
      src.buffer=noiseBuffer(c);src.loop=true;flt.type=type;flt.Q.value=q;
      flt.frequency.setValueAtTime(f0,t);flt.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+Math.min(attack,d*.5));g.gain.exponentialRampToValueAtTime(.0001,t+d);
      src.connect(flt);flt.connect(g);g.connect(out);src.start(t);src.stop(t+d+.05);
    },
    thump(c,out,t,{f=130,f2=38,d=.4,gain=.55}={}){
      const o=c.createOscillator(),g=c.createGain();
      o.type="sine";o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+d);
      o.connect(g);g.connect(out);o.start(t);o.stop(t+d+.05);
    }
  };
  const PENTA=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51];
  const voices={
    whoosh(c,out,t){synth.noise(c,out,t,{d:.34,f0:260,f1:2600,q:.9,gain:.22,attack:.12});},
    chime(c,out,t){
      const base=Math.floor(Math.random()*3);
      [0,2,4].forEach((step,i)=>synth.bell(c,out,t+i*.075,{f:PENTA[base+step],d:1.15,gain:.075}));
      synth.bell(c,out,t,{f:PENTA[base]/4,d:1.5,gain:.06,ratio:2,index:1});
    },
    levelup(c,out,t){
      [0,1,2,3,4,5].forEach((n,i)=>synth.bell(c,out,t+i*.09,{f:PENTA[n],d:1.5,gain:.085}));
      synth.thump(c,out,t,{f:110,f2:55,d:.6,gain:.4});
      synth.noise(c,out,t+.35,{d:1.1,f0:2400,f1:7000,q:.6,gain:.05,type:"highpass",attack:.4});
    },
    impact(c,out,t){
      synth.thump(c,out,t,{f:150,f2:34,d:.38,gain:.7});
      synth.noise(c,out,t,{d:.14,f0:1800,f1:500,q:.8,gain:.22,attack:.01});
      synth.bell(c,out,t,{f:196,d:.7,gain:.05,ratio:1.41,index:1.2});
    },
    cast(c,out,t){
      synth.noise(c,out,t,{d:.7,f0:380,f1:3600,q:2.4,gain:.1,attack:.35});
      synth.bell(c,out,t+.42,{f:PENTA[5],d:1.1,gain:.07});
      synth.bell(c,out,t+.5,{f:PENTA[7],d:1.3,gain:.05});
    },
    coin(c,out,t){
      synth.bell(c,out,t,{f:1568,d:.4,gain:.1,ratio:2.76,index:1.2});
      synth.bell(c,out,t+.07,{f:2093,d:.5,gain:.09,ratio:2.76,index:1.2});
    },
    portal(c,out,t){
      synth.noise(c,out,t,{d:.5,f0:200,f1:1400,q:1.4,gain:.2,attack:.2});
      synth.bell(c,out,t+.1,{f:PENTA[2]/2,d:1.3,gain:.1,ratio:2,index:1});
    }
  };
  function voice(name){
    if(!unlocked||effective("sfx")<=0)return;
    const fn=voices[name];if(!fn)return;
    try{
      const c=ensureCtx(),out=c.createGain();
      out.gain.value=Math.min(1.6,effective("sfx")*2.2);
      out.connect(bus(c).input);
      fn(c,out,c.currentTime+.005);
    }catch(err){console.warn("[ARCANUM audio] voice failed:",name,err);}
  }

  function b64ToBlobUrl(text){
    const clean=String(text||"").replace(/\s+/g,"");
    const raw=atob(clean);
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes],{type:"audio/wav"}));
  }
  async function loadSample(key,path){
    if(bank.has(key))return bank.get(key);
    const promise=fetch(path,{cache:"force-cache"})
      .then(r=>{if(!r.ok)throw new Error("Audio asset "+r.status);return r.text();})
      .then(b64ToBlobUrl)
      .catch(err=>{console.warn("[ARCANUM audio] sample unavailable:",key,err);return null;});
    bank.set(key,promise);
    return promise;
  }
  function preloadBank(){
    Object.entries(bankPaths).forEach(([key,path])=>void loadSample(key,path));
  }
  function playSample(key,{gain=1,rate=1}={}){
    if(!unlocked||effective("sfx")<=0)return false;
    const pending=bank.get(key);
    if(!pending)return false;
    Promise.resolve(pending).then(url=>{
      if(!url||effective("sfx")<=0)return;
      const a=new Audio(url);
      a.preload="auto";
      a.volume=Math.min(1,effective("sfx")*gain);
      a.playbackRate=rate;
      a.play().catch(()=>{});
    });
    return true;
  }
  function sampleOrTone(key,opts,toneOpts){
    if(!playSample(key,opts))tone(toneOpts);
  }

  const sfx={
    hover(){
      const rates=[1.16,1.22,1.12];
      const rate=rates[selectIndex++%rates.length];
      sampleOrTone("select",{gain:.16,rate},{f:720,f2:650,d:.025,type:"sine",gain:.012});
    },
    click(){
      const rates=[.98,1.03,1.00];
      const rate=rates[selectIndex++%rates.length];
      sampleOrTone("select",{gain:.34,rate},{f:620,f2:460,d:.045,type:"triangle",gain:.035});
    },
    nav(){
      const rates=[.82,.87,.78];
      const rate=rates[selectIndex++%rates.length];
      sampleOrTone("select",{gain:.42,rate},{f:310,f2:430,d:.075,type:"sine",gain:.035});
      voice("whoosh");
    },
    open(){
      sampleOrTone("open",{gain:.48,rate:.9},{f:420,f2:690,d:.11,type:"triangle",gain:.04});
    },
    success(){
      const key=(successIndex++%2===0)?"confirm1":"confirm2";
      sampleOrTone(key,{gain:.52,rate:1},{f:392,f2:523,d:.12,type:"sine",gain:.04});
      voice("chime");
    },
    error(){
      sampleOrTone("error",{gain:.48,rate:.9},{f:180,f2:110,d:.16,type:"sawtooth",gain:.028});
    },
    battle(){
      if(!unlocked||effective("sfx")<=0)return;
      voice("impact");
    },
    whoosh(){voice("whoosh");},
    chime(){voice("chime");},
    levelup(){voice("levelup");},
    impact(){voice("impact");},
    cast(){voice("cast");},
    coin(){voice("coin");},
    portal(){voice("portal");}
  };

  function buildMusic(){
    if(music)return music;
    music=new Audio("assets/audio/Dungeon%20Lobby.mp3");
    music.loop=true;music.preload="auto";
    music.addEventListener("error",()=>document.documentElement.classList.add("audio-music-missing"));
    return music;
  }
  function apply(){
    const m=buildMusic();
    m.volume=Math.min(1,effective("music"));
    const should=settings.musicEnabled&&!settings.muted&&settings.music>0&&settings.master>0;
    if(!should&&!m.paused)m.pause();
    else if(should&&unlocked&&m.paused)m.play().catch(()=>{});
    document.documentElement.classList.toggle("audio-muted",settings.muted);
  }
  function unlock(){
    if(unlocked)return;
    unlocked=true;ensureCtx();preloadBank();apply();
  }
  function renderValues(){
    const map={master:"audio-master",music:"audio-music",sfx:"audio-sfx"};
    Object.entries(map).forEach(([k,id])=>{
      const el=document.getElementById(id),out=document.getElementById(id+"-value");
      if(el)el.value=Math.round(settings[k]*100);
      if(out)out.textContent=Math.round(settings[k]*100)+"%";
    });
    const muted=document.getElementById("audio-mute-toggle");
    if(muted){
      muted.classList.toggle("active",settings.muted);
      muted.setAttribute("aria-pressed",String(settings.muted));
      muted.textContent=settings.muted?"SONIDO DESACTIVADO":"SILENCIAR TODO";
    }
    const musicToggle=document.getElementById("audio-music-toggle");
    if(musicToggle)musicToggle.checked=!!settings.musicEnabled;
    const sfxToggle=document.getElementById("audio-sfx-toggle");
    if(sfxToggle)sfxToggle.checked=!!settings.sfxEnabled;
  }
  function wirePanel(){
    const panel=document.getElementById("audio-panel"),btn=document.getElementById("audio-settings-button"),close=document.getElementById("audio-panel-close");
    if(!panel||!btn)return;
    const setOpen=v=>{
      panel.classList.toggle("hidden",!v);
      btn.setAttribute("aria-expanded",String(v));
      if(v)sfx.open();
    };
    btn.addEventListener("click",e=>{e.stopPropagation();unlock();setOpen(panel.classList.contains("hidden"));});
    close?.addEventListener("click",()=>setOpen(false));
    panel.addEventListener("click",e=>e.stopPropagation());
    document.addEventListener("click",()=>setOpen(false));
    [["master","audio-master"],["music","audio-music"],["sfx","audio-sfx"]].forEach(([k,id])=>{
      document.getElementById(id)?.addEventListener("input",e=>{settings[k]=clamp(Number(e.target.value)/100);save();});
    });
    document.getElementById("audio-mute-toggle")?.addEventListener("click",()=>{settings.muted=!settings.muted;save();sfx.click();});
    document.getElementById("audio-music-toggle")?.addEventListener("change",e=>{settings.musicEnabled=e.target.checked;save();});
    document.getElementById("audio-sfx-toggle")?.addEventListener("change",e=>{settings.sfxEnabled=e.target.checked;save();});
    renderValues();
  }
  function wireGlobalSfx(){
    document.addEventListener("pointerdown",unlock,{once:true,capture:true});
    document.addEventListener("keydown",unlock,{once:true,capture:true});
    document.addEventListener("pointerover",e=>{
      if(e.pointerType==="touch")return;
      const el=e.target.closest("button:not(:disabled),a,[role='button'],.school-card,[data-view]");
      if(!el||el===lastHover)return;
      const now=performance.now();
      lastHover=el;
      if(now-lastHoverAt<70)return;
      lastHoverAt=now;
      sfx.hover();
    },true);
    document.addEventListener("pointerout",e=>{
      const el=e.target.closest?.("button,a,[role='button'],.school-card,[data-view]");
      if(el&&el===lastHover&&!el.contains(e.relatedTarget))lastHover=null;
    },true);
    document.addEventListener("click",e=>{
      const b=e.target.closest("button,a,.school-card,[data-view]");
      if(!b||b.id==="audio-settings-button")return;
      if(b.matches("[data-view]"))sfx.nav();else sfx.click();
    },true);
    document.addEventListener("arcanum:success",()=>sfx.success());
    document.addEventListener("arcanum:error",()=>sfx.error());
    ["levelup","impact","cast","coin","portal"].forEach(name=>document.addEventListener("arcanum:"+name,()=>sfx[name]()));
  }
  function init(){
    load();buildMusic();preloadBank();wirePanel();wireGlobalSfx();apply();
  }
  return {init,sfx,voices,synth,get settings(){return settings;},unlock,apply};
})();

window.ArcanumAudio=ArcanumAudio;
window.addEventListener("DOMContentLoaded",()=>ArcanumAudio.init());
