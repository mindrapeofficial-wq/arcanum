"use strict";

const ArcanumAudio=(()=>{
  const KEY="arcanum.audio.v1";
  const defaults={master:0.75,music:0.45,sfx:0.62,muted:false,musicEnabled:true,sfxEnabled:true};
  let settings={...defaults};
  let ctx=null, music=null, musicStarted=false, unlocked=false;

  function clamp(v){return Math.max(0,Math.min(1,Number(v)||0));}
  function load(){
    try{settings={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")};}catch{settings={...defaults};}
    ["master","music","sfx"].forEach(k=>settings[k]=clamp(settings[k]));
    return settings;
  }
  function save(){localStorage.setItem(KEY,JSON.stringify(settings)); apply(); renderValues();}
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
    const c=ensureCtx(), now=c.currentTime+delay, o=c.createOscillator(), g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(f,now);
    if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),now+d);
    const vol=gain*effective("sfx");
    g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0001,vol),now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+d);
    o.connect(g);g.connect(c.destination);o.start(now);o.stop(now+d+.02);
  }
  const sfx={
    click(){tone({f:620,f2:460,d:.045,type:"triangle",gain:.035});},
    nav(){tone({f:310,f2:430,d:.075,type:"sine",gain:.035});},
    open(){tone({f:420,f2:690,d:.11,type:"triangle",gain:.04});tone({f:690,f2:820,d:.09,type:"sine",gain:.025,delay:.045});},
    success(){tone({f:392,f2:523,d:.12,type:"sine",gain:.04});tone({f:523,f2:784,d:.18,type:"triangle",gain:.035,delay:.07});},
    error(){tone({f:180,f2:110,d:.16,type:"sawtooth",gain:.028});},
    battle(){tone({f:95,f2:55,d:.24,type:"square",gain:.025});}
  };
  function buildMusic(){
    if(music)return music;
    music=new Audio("assets/audio/dungeon-lobby.mp3");
    music.loop=true; music.preload="auto"; music.crossOrigin="anonymous";
    music.addEventListener("error",()=>document.documentElement.classList.add("audio-music-missing"));
    return music;
  }
  function apply(){
    const m=buildMusic();
    m.volume=Math.min(1,effective("music"));
    const should=settings.musicEnabled&&!settings.muted&&settings.music>0&&settings.master>0;
    if(!should&&!m.paused)m.pause();
    else if(should&&unlocked&&m.paused)m.play().then(()=>musicStarted=true).catch(()=>{});
    document.documentElement.classList.toggle("audio-muted",settings.muted);
  }
  function unlock(){
    if(unlocked)return;
    unlocked=true;ensureCtx();apply();
  }
  function renderValues(){
    const map={master:"audio-master",music:"audio-music",sfx:"audio-sfx"};
    Object.entries(map).forEach(([k,id])=>{
      const el=document.getElementById(id), out=document.getElementById(id+"-value");
      if(el)el.value=Math.round(settings[k]*100);
      if(out)out.textContent=Math.round(settings[k]*100)+"%";
    });
    const muted=document.getElementById("audio-mute-toggle");
    if(muted){muted.classList.toggle("active",settings.muted);muted.setAttribute("aria-pressed",String(settings.muted));muted.textContent=settings.muted?"SONIDO DESACTIVADO":"SILENCIAR TODO";}
    const musicToggle=document.getElementById("audio-music-toggle");
    if(musicToggle){musicToggle.checked=!!settings.musicEnabled;}
    const sfxToggle=document.getElementById("audio-sfx-toggle");
    if(sfxToggle){sfxToggle.checked=!!settings.sfxEnabled;}
  }
  function wirePanel(){
    const panel=document.getElementById("audio-panel"), btn=document.getElementById("audio-settings-button"), close=document.getElementById("audio-panel-close");
    if(!panel||!btn)return;
    const setOpen=v=>{panel.classList.toggle("hidden",!v);btn.setAttribute("aria-expanded",String(v));if(v)sfx.open();};
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
    document.addEventListener("click",e=>{
      const b=e.target.closest("button,a,.school-card,[data-view]");
      if(!b||b.id==="audio-settings-button")return;
      if(b.matches("[data-view]"))sfx.nav(); else sfx.click();
    },true);
    document.addEventListener("arcanum:success",()=>sfx.success());
    document.addEventListener("arcanum:error",()=>sfx.error());
  }
  function init(){load();buildMusic();wirePanel();wireGlobalSfx();apply();}
  return {init,sfx,get settings(){return settings;},unlock,apply};
})();

window.ArcanumAudio=ArcanumAudio;
window.addEventListener("DOMContentLoaded",()=>ArcanumAudio.init());
