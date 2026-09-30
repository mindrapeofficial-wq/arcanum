"use strict";
const ARENA_DAILY_SEALS=6;
const ARENA_TRAITS={
 verdant:{name:"Verdante",mark:"♧",hp:1.16,atk:.92,spd:.94,crit:.05,dodge:.03,skill:"Savia Ancestral"},
 ascendant:{name:"Ascendente",mark:"✦",hp:1.08,atk:.98,spd:1.02,crit:.06,dodge:.04,skill:"Égida Solar"},
 eradication:{name:"Erradicación",mark:"✹",hp:.92,atk:1.18,spd:1.02,crit:.12,dodge:.02,skill:"Ruptura Ígnea"},
 abyssal:{name:"Abisal",mark:"◆",hp:1,atk:1.08,spd:.96,crit:.08,dodge:.03,skill:"Pacto Sombrío"},
 phantasm:{name:"Fantasma",mark:"◌",hp:.94,atk:.98,spd:1.18,crit:.07,dodge:.11,skill:"Paso Irreal"}
};
function arenaDay(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function arenaKey(){return "arcanum_arena_v1_"+String(realmState?.realm?.mage_name||"anon").toLowerCase().replace(/[^a-z0-9_-]+/g,"_")}
function arenaLoad(){var x={day:arenaDay(),seals:6,rating:1000,wins:0,losses:0,history:[]};try{x=Object.assign(x,JSON.parse(localStorage.getItem(arenaKey())||"{}"))}catch(e){}if(x.day!==arenaDay()){x.day=arenaDay();x.seals=6}x.history=Array.isArray(x.history)?x.history.slice(0,30):[];return x}
function arenaSave(x){try{localStorage.setItem(arenaKey(),JSON.stringify(x))}catch(e){}}
function arenaTrait(c){return ARENA_TRAITS[c]||ARENA_TRAITS.ascendant}
function arenaFighter(r){var c=getCombatProfile(r),d=combatDerived(r),w=c.weapon;return{name:String(r?.mage_name||"Archimago"),school:String(r?.school_code||"ascendant"),power:Math.max(1,Number(r?.net_power||1)),level:Math.max(1,Math.min(50,Math.round(1+Object.values(c.stats).reduce(function(a,b){return a+b},0)/10))),maxHp:d.maxHp,attack:d.attack,armor:d.armor,speed:d.speed,crit:d.crit,dodge:d.dodge,block:d.block,regen:d.regen,lifesteal:d.lifesteal,secondWind:d.secondWind,accuracy:d.accuracy||0,doubleStrike:d.doubleStrike||0,weaponPoison:d.weaponPoison||0,firstStrike:d.firstStrike||0,equipmentPower:d.equipmentPower||0,weapon:w,trait:c.trait,abilities:c.abilities}}
function arenaRating(r){return Math.round(800+Math.log10(Math.max(10,Number(r.net_power||10)))*125)}
function arenaDivision(v){return v>=1700?"Leyenda Arcana":v>=1500?"Archimago":v>=1350?"Gran Mago":v>=1200?"Maestro":v>=1050?"Adepto":v>=900?"Aprendiz":"Iniciado"}
function arenaTargets(rows){var me=String(realmState.realm.mage_name).toLowerCase(),p=Math.max(1,Number(realmState.realm.net_power||1));return (rows||[]).filter(function(x){return String(x.mage_name).toLowerCase()!==me}).map(function(x){x._d=Math.abs(Math.log10(Math.max(1,Number(x.net_power||1)))-Math.log10(p));return x}).sort(function(a,b){return a._d-b._d}).slice(0,8)}
function arenaHas(a,id){return (a.abilities||[]).some(function(x){return x.id===id})}
function arenaHit(a,b,round){
  var events=[];
  if(a.regen>0&&round%3===0){var heal=Math.max(2,Math.round(a.maxHp*a.regen));a.hp=Math.min(a.maxHp,a.hp+heal);events.push(a.name+" regenera "+heal+" de vida.")}
  if(arenaHas(a,"solar_aegis")&&round%4===1){a.shield=(a.shield||0)+Math.round(a.maxHp*.07);events.push(a.name+" alza Égida Solar ("+a.shield+" de escudo).")}
  if(arenaHas(a,"roots")&&Math.random()<.12){b.slow=Math.max(b.slow||0,1);events.push(a.name+" atrapa a "+b.name+" con Raíces.")}
  if((a.slow||0)>0){a.slow--;events.push(a.name+" queda frenado por el control enemigo.");return events}
  if(arenaHas(a,"soul_bite")&&Math.random()<.12){b.weaken=Math.max(b.weaken||0,1);events.push(a.name+" muerde el alma de "+b.name+" y debilita su próximo ataque.")}
  var effectiveDodge=Math.max(0,b.dodge-a.accuracy);
  if(arenaHas(b,"phase_step"))effectiveDodge=Math.min(.48,effectiveDodge+.08);
  if(Math.random()<effectiveDodge){events.push(b.name+" evita el ataque de "+a.name+".");return events}
  if(Math.random()<b.block){
    events.push(b.name+" bloquea con éxito el golpe de "+a.name+".");
    if(arenaHas(b,"counter")&&Math.random()<.25){var counter=Math.max(1,Math.round(b.attack*.35));a.hp=Math.max(0,a.hp-counter);events.push(b.name+" contraataca e inflige "+counter+" de daño.")}
    return events;
  }
  var crit=Math.random()<a.crit,mult=.85+Math.random()*.3;
  if((a.weaken||0)>0){mult*=.82;a.weaken--;events.push(a.name+" ataca debilitado por magia enemiga.")}
  if(arenaHas(a,"execution")&&b.hp<b.maxHp*.35)mult*=1.25;
  if(arenaHas(a,"judgement")&&b.hp<b.maxHp*.55&&Math.random()<.18){mult*=1.30;events.push(a.name+" pronuncia Juicio Radiante.")}
  if(arenaHas(a,"flame_break")&&Math.random()<.16){mult*=1.45;events.push(a.name+" desata Ruptura Ígnea.")}
  if(crit)mult*=1.65;
  var disarmed=(a.disarmed||0)>0;
  var weaponRoll=disarmed?0:Math.round(a.weapon.min+Math.random()*(a.weapon.max-a.weapon.min));
  if(disarmed){a.disarmed--;events.push(a.name+" combate desarmado temporalmente.")}
  var dmg=Math.max(1,Math.round(a.attack*mult+weaponRoll-b.armor*.55));
  var absorb=Math.min(Number(b.shield||0),dmg);b.shield=Math.max(0,Number(b.shield||0)-absorb);dmg-=absorb;b.hp=Math.max(0,b.hp-dmg);
  var steal=a.lifesteal+(arenaHas(a,"dark_pact")?.08:0);
  if(steal>0&&dmg>0)a.hp=Math.min(a.maxHp,a.hp+Math.max(1,Math.round(dmg*steal)));
  events.push(a.name+(crit?" asesta un crítico con ":" golpea con ")+(a.weapon?.name||"su arma")+" a "+b.name+": "+dmg+" de daño.");
  if(arenaHas(a,"disarm")&&b.hp>0&&Math.random()<.10){b.disarmed=Math.max(b.disarmed||0,1);events.push(a.name+" desarma a "+b.name+" durante su próximo ataque.")}
  if((arenaHas(a,"mirror_strike")||Math.random()<a.doubleStrike)&&b.hp>0&&Math.random()<.25){var extra=Math.max(1,Math.round(a.attack*.4));b.hp=Math.max(0,b.hp-extra);events.push(a.name+" encadena un segundo golpe: "+extra+" de daño.")}
  var poisonChance=(arenaHas(a,"toxic_spores")?.18:0)+a.weaponPoison;
  if(poisonChance>0&&b.hp>0&&Math.random()<poisonChance){var poison=Math.max(2,Math.round(a.attack*.12));b.hp=Math.max(0,b.hp-poison);events.push("El veneno inflige "+poison+" de daño adicional a "+b.name+".")}
  return events;
}
function arenaSim(op){
  var a=arenaFighter(realmState.realm),b=arenaFighter(op),log=[];
  a.hp=a.maxHp;b.hp=b.maxHp;a.shield=0;b.shield=0;a.secondWindUsed=false;b.secondWindUsed=false;a.lastWordUsed=false;b.lastWordUsed=false;
  for(var r=1;r<=24&&a.hp>0&&b.hp>0;r++){
    log.push("RONDA "+r);
    var aInit=a.speed+Math.random()*3+(r===1?a.firstStrike*10:0),bInit=b.speed+Math.random()*3+(r===1?b.firstStrike*10:0);
    var first=aInit>=bInit?a:b,second=first===a?b:a;
    arenaHit(first,second,r).forEach(function(x){log.push(x)});
    if(second.hp>0)arenaHit(second,first,r).forEach(function(x){log.push(x)});
    [a,b].forEach(function(f){
      var other=f===a?b:a;
      if(f.hp<=0&&f.secondWind&&!f.secondWindUsed){f.secondWindUsed=true;f.hp=Math.max(1,Math.round(f.maxHp*.2));log.push(f.name+" activa Segundo Aliento y vuelve al combate.")}
      if(f.hp<=0&&arenaHas(f,"last_word")&&!f.lastWordUsed&&other.hp>0&&Math.random()<.35){f.lastWordUsed=true;var last=Math.max(1,Math.round(f.attack*.45));other.hp=Math.max(0,other.hp-last);log.push(f.name+" pronuncia Última Palabra antes de caer: "+last+" de daño.")}
    });
  }
  var won=a.hp===b.hp?Math.random()<.5:a.hp>b.hp;
  return{a:a,b:b,won:won,log:log};
}
async function renderArena(){var data=arenaLoad(),rows=[];try{rows=await rpc("leaderboard",{p_limit:100})}catch(e){}var targets=arenaTargets(rows),me=arenaFighter(realmState.realm);$("#view-host").innerHTML=viewHeader("DUELISTAS","Arena Arcana","PvP individual automático. Aquí combate tu Archimago, no tu ejército.")+
'<section class="arena-hero"><div><span class="section-kicker">CÍRCULO DE DUELO</span><h3>'+esc(me.name)+'</h3><p>Seis combates clasificatorios al día. Los amistosos son ilimitados y no modifican tu rating.</p><div class="arena-meta"><span><small>SELLOS</small><b>'+data.seals+' / 6</b></span><span><small>RATING</small><b>'+n(data.rating)+'</b></span><span><small>DIVISIÓN</small><b>'+esc(arenaDivision(data.rating))+'</b></span><span><small>RÉCORD</small><b>'+n(data.wins)+'V · '+n(data.losses)+'D</b></span><span><small>EQUIPO</small><b>'+n(me.equipmentPower||0)+' iP</b></span></div></div><aside><i>'+arenaTrait(me.school).mark+'</i><strong>Nivel de Arena '+me.level+'</strong><small>'+esc(arenaTrait(me.school).name)+' · '+esc(arenaTrait(me.school).skill)+'</small></aside></section>'+
'<div class="arena-grid"><section class="panel"><div class="arena-title"><span class="section-kicker">RIVALES</span><h3>Contrincantes cercanos</h3></div><div class="arena-list">'+(targets.length?targets.map(function(t){var f=arenaFighter(t),tr=arenaTrait(f.school);return '<article class="arena-row"><i>'+tr.mark+'</i><div><strong><button class="player-link" data-profile="'+esc(f.name)+'">'+esc(f.name)+'</button></strong><small>'+esc(tr.name)+' · Nv. '+f.level+' · Poder '+n(f.power)+'</small></div><div><button class="small-action arena-fight" data-target="'+esc(f.name)+'" data-mode="ranked" '+(data.seals<=0?"disabled":"")+'>DUELO</button><button class="small-action arena-fight alt" data-target="'+esc(f.name)+'" data-mode="friendly">AMISTOSO</button></div></article>'}).join(""):'<div class="empty">No hay rivales disponibles.</div>')+'</div></section>'+
'<section class="panel"><div class="arena-title"><span class="section-kicker">CRÓNICAS</span><h3>Últimos duelos</h3></div><div class="arena-history">'+(data.history.length?data.history.slice(0,8).map(function(h){return '<button class="arena-history-row" data-id="'+esc(h.id)+'"><span class="tag '+(h.won?"win":"loss")+'">'+(h.won?"VICTORIA":"DERROTA")+'</span><span><strong>'+esc(h.opponent)+'</strong><small>'+new Date(h.at).toLocaleString("es-ES")+'</small></span><b>'+(h.delta>0?"+":"")+h.delta+'</b></button>'}).join(""):'<div class="empty">Aún no has combatido en la Arena.</div>')+'</div></section></div>';
$$(".arena-fight").forEach(function(btn){btn.addEventListener("click",function(){arenaFight(btn.dataset.target,btn.dataset.mode,rows)})});$$(".arena-history-row").forEach(function(btn){btn.addEventListener("click",function(){var rec=arenaLoad().history.find(function(x){return x.id===btn.dataset.id});if(rec)arenaOpen(rec)})})}
function arenaOpen(rec){$("#modal-content").innerHTML='<span class="section-kicker">ARENA ARCANA</span><h3>'+(rec.won?"Victoria":"Derrota")+' contra '+esc(rec.opponent)+'</h3><div class="arena-result '+(rec.won?"win":"loss")+'"><strong>'+(rec.won?"EL CÍRCULO TE RECONOCE":"EL RIVAL SE IMPONE")+'</strong><span>'+(rec.mode==="ranked"?"Rating "+(rec.delta>=0?"+":"")+rec.delta+" · total "+n(rec.rating):"Duelo amistoso · sin cambios de rating")+'</span></div><div class="arena-log">'+(rec.log||[]).map(function(x,i){return '<p><small>'+String(i+1).padStart(2,"0")+'</small>'+esc(x)+'</p>'}).join("")+'</div>';show($("#modal"))}
function arenaFight(name,mode,rows){var op=(rows||[]).find(function(x){return String(x.mage_name).toLowerCase()===String(name).toLowerCase()});if(!op)return;var data=arenaLoad();if(mode==="ranked"&&data.seals<=0){toast("Has gastado los 6 Sellos de Arena de hoy.","error");return}var sim=arenaSim(op),delta=0;if(mode==="ranked"){var expected=1/(1+Math.pow(10,(arenaRating(op)-data.rating)/400));delta=Math.round(28*((sim.won?1:0)-expected));data.seals--;data.rating=Math.max(100,data.rating+delta);if(sim.won)data.wins++;else data.losses++}var rec={id:String(Date.now()),at:new Date().toISOString(),opponent:sim.b.name,won:sim.won,mode:mode,delta:delta,rating:data.rating,log:sim.log};data.history.unshift(rec);data.history=data.history.slice(0,30);arenaSave(data);arenaOpen(rec);renderArena()}
globalThis.renderArena=renderArena;
