import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const MAIN_URL = "https://mrmvmoyysxuopqexbxfk.supabase.co";
const MAIN_KEY = "sb_publishable_tZEPJi2v7Tp-xDuVa0qWRw_geizIGoD";
const MODEL = Deno.env.get("ARCANUM_AI_MODEL") || "gpt-5.6-luna";
const AUX_URL = Deno.env.get("SUPABASE_URL") || "";
const AUX_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const aux = AUX_URL && AUX_SERVICE ? createClient(AUX_URL, AUX_SERVICE, {auth:{persistSession:false}}) : null;

function json(data:unknown,status=200){
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
}
function safeNumber(v:unknown){ const n=Number(v); return Number.isFinite(n)?n:0; }
async function raw(token:string,path:string,method="GET",body?:unknown){
  const res=await fetch(MAIN_URL+path,{
    method,
    headers:{apikey:MAIN_KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const text=await res.text();
  let data:any=null; try{data=text?JSON.parse(text):null}catch{data=text}
  if(!res.ok){
    const msg=typeof data==="object"&&data?(data.message||data.msg||data.error_description||data.error):text;
    throw new Error(String(msg||`HTTP_${res.status}`));
  }
  return data;
}
const rpc=(token:string,name:string,args:Record<string,unknown>={})=>raw(token,`/rest/v1/rpc/${name}`,"POST",args);
const rest=(token:string,path:string)=>raw(token,`/rest/v1/${path}`);

async function identity(req:Request){
  const header=req.headers.get("authorization")||"";
  if(!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token=header.slice(7).trim();
  const user=await raw(token,"/auth/v1/user");
  const state=await rpc(token,"my_realm_state",{});
  if(String(state?.realm?.mage_name||"").toLowerCase()!=="astrael") throw new Error("ASTRAEL_IDENTITY_REQUIRED");
  return {token,user,state};
}

function stateSummary(state:any){
  const r=state?.realm||{},b=state?.buildings||{};
  return {
    mage:r.mage_name,school:r.school_code,status:r.status,turns:r.turns,max_turns:r.max_turns,
    gold:r.gold,mana:r.mana,population:r.population,land:r.land,wilderness:r.wilderness,
    net_power:r.net_power,spell_level:r.spell_level,buildings:b,
    known_spells:Array.isArray(state?.known_spells)?state.known_spells.map((x:any)=>x.spell_id||x.id).filter(Boolean):[],
    research:state?.research||null
  };
}

async function observation(token:string,state:any){
  const [spells,units,summons,army,targets,market,battles,npcs]=await Promise.all([
    rest(token,"spell_catalog?select=id,school_code,name_es,rank,research_cost,spell_level_gain,cast_turns,base_mana_cost,researchable,effect_key").catch(()=>[]),
    rest(token,"unit_catalog?select=id,school_code,name_es,acquisition,power_rank,recruit_gold,recruit_mana,recruit_population,upkeep_gold,upkeep_mana,upkeep_population,related_spell_id").catch(()=>[]),
    rest(token,"summon_profiles?select=*").catch(()=>[]),
    rpc(token,"my_army",{}).catch(()=>[]),
    rpc(token,"attack_targets",{p_limit:80}).catch(()=>[]),
    rpc(token,"market_list",{}).catch(()=>({offers:[]})),
    rpc(token,"my_battle_reports",{p_limit:20}).catch(()=>[]),
    rpc(token,"npc_directory",{}).catch(()=>[])
  ]);
  let memory:any={};
  let recent:any[]=[];
  if(aux){
    const [s,l]=await Promise.all([
      aux.from("astrael_agent_state").select("memory,last_tick_at").eq("singleton",true).maybeSingle(),
      aux.from("astrael_agent_log").select("created_at,action,reason,success,result").order("created_at",{ascending:false}).limit(12)
    ]);
    memory=s.data?.memory||{};
    recent=l.data||[];
  }
  return {
    state:stateSummary(state),
    spells:Array.isArray(spells)?spells:[],
    units:Array.isArray(units)?units:[],
    summons:Array.isArray(summons)?summons:[],
    army:Array.isArray(army)?army:[],
    targets:Array.isArray(targets)?targets:[],
    market:market||{offers:[]},
    recent_battles:Array.isArray(battles)?battles:[],
    npcs:Array.isArray(npcs)?npcs:[],
    memory,recent_actions:recent
  };
}

function extractText(data:any){
  if(typeof data?.output_text==="string"&&data.output_text.trim()) return data.output_text.trim();
  for(const item of data?.output||[]) for(const part of item?.content||[])
    if(typeof part?.text==="string"&&part.text.trim()) return part.text.trim();
  return "";
}
function parseObject(text:string){
  const clean=String(text||"").trim().replace(/^```(?:json)?/i,"").replace(/```$/,"").trim();
  try{return JSON.parse(clean)}catch{}
  const a=clean.indexOf("{"),z=clean.lastIndexOf("}");
  if(a>=0&&z>a){try{return JSON.parse(clean.slice(a,z+1))}catch{}}
  return null;
}

async function decide(obs:any){
  const key=Deno.env.get("OPENAI_API_KEY");
  if(!key)return null;
  const instructions=`Eres Astrael, un Archimago autónomo que juega ARCANUM como un jugador real.
El estado y catálogos recibidos son autoritativos. Elige exactamente UNA acción por ciclo.
Objetivos: sobrevivir, aprender, construir un reino coherente, mantener economía sana, formar ejército, comerciar y participar ocasionalmente en PvP.
No hagas trampas. No inventes recursos. No uses capacidades fuera de la lista permitida.
Sé prudente: conserva reservas, no gastes todos los turnos, no ataques repetidamente a la misma persona y evita acosar reinos mucho más débiles.
Acciones permitidas:
{"type":"idle"}
{"type":"economy","action":"NONE|TAX|MP_CHARGE","turns":1..3}
{"type":"explore","turns":1..3}
{"type":"build","plan":{"farms|towns|nodes|workshops|guilds|barracks|fortresses|barriers":cantidad}}
{"type":"research","spell_id":"id","turns":1..3}
{"type":"recruit","unit_id":"id","turns":1..3}
{"type":"summon","spell_id":"id"}
{"type":"attack","target":"nombre","mode":"REGULAR|SIEGE"}
{"type":"market_accept","offer_id":"id"}
{"type":"market_create","offer_resource":"gold|mana|population","offer_amount":entero,"want_resource":"gold|mana|population","want_amount":entero,"note":"texto"}
Devuelve SOLO JSON con {"action":{...},"reason":"...","intent":"..."}.\n\nOBSERVACIÓN:\n${JSON.stringify(obs).slice(0,28000)}`;
  const resp=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",
    headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},
    body:JSON.stringify({model:MODEL,instructions,input:"Decide el siguiente movimiento de Astrael.",max_output_tokens:500})
  });
  if(!resp.ok)return null;
  return parseObject(extractText(await resp.json()));
}

function turns(v:any){return Math.max(1,Math.min(3,Math.floor(safeNumber(v)||1)));}
function validate(candidate:any,obs:any){
  const a=candidate?.action||candidate;
  if(!a||typeof a!=="object")return null;
  const s=obs.state||{},b=s.buildings||{},school=String(s.school||"");
  const type=String(a.type||"");
  if(type==="idle")return {type};
  if(safeNumber(s.turns)<1)return {type:"idle"};
  if(type==="economy"&&["NONE","TAX","MP_CHARGE"].includes(String(a.action)))return {type,action:String(a.action),turns:turns(a.turns)};
  if(type==="explore"&&safeNumber(s.land)<3500)return {type,turns:turns(a.turns)};
  if(type==="build"){
    const allowed=new Set(["farms","towns","nodes","workshops","guilds","barracks","fortresses","barriers"]);
    const plan:any={}; let count=0;
    for(const [k,v] of Object.entries(a.plan||{})){
      const q=Math.max(0,Math.min(2,Math.floor(safeNumber(v))));
      if(allowed.has(k)&&q){plan[k]=q;count+=q;}
    }
    if(!count)return null;
    if(plan.barriers&&Object.keys(plan).length>1)return null;
    return {type,plan};
  }
  if(type==="research"){
    const id=String(a.spell_id||"");
    const row=(obs.spells||[]).find((x:any)=>String(x.id)===id);
    if(!row||!row.researchable)return null;
    return {type,spell_id:id,turns:turns(a.turns)};
  }
  if(type==="recruit"){
    const id=String(a.unit_id||"");
    const row=(obs.units||[]).find((x:any)=>String(x.id)===id&&x.acquisition==="recruit"&&(x.school_code==="plain"||x.school_code===school));
    if(!row||safeNumber(b.barracks)<1)return null;
    return {type,unit_id:id,turns:turns(a.turns)};
  }
  if(type==="summon"){
    const id=String(a.spell_id||"");
    const known=new Set(obs.state?.known_spells||[]);
    if(!known.has(id)||!(obs.summons||[]).some((x:any)=>String(x.spell_id)===id))return null;
    return {type,spell_id:id};
  }
  if(type==="attack"){
    if(safeNumber(s.turns)<2)return null;
    const memory=obs.memory||{};
    const last=Date.parse(String(memory.last_attack_at||""));
    if(Number.isFinite(last)&&Date.now()-last<6*60*60*1000)return null;
    const targetName=String(a.target||"");
    const target=(obs.targets||[]).find((x:any)=>String(x.mage_name||"").toLowerCase()===targetName.toLowerCase()&&x.can_attack);
    if(!target)return null;
    const ownPower=Math.max(1,safeNumber(s.net_power)), targetPower=safeNumber(target.net_power);
    if(targetPower<ownPower*.65)return null;
    const recent=Array.isArray(memory.recent_targets)?memory.recent_targets:[];
    if(recent.some((x:any)=>String(x.name||"").toLowerCase()===targetName.toLowerCase()&&Date.now()-Date.parse(x.at)<24*60*60*1000))return null;
    return {type,target:String(target.mage_name),mode:a.mode==="SIEGE"?"SIEGE":"REGULAR"};
  }
  if(type==="market_accept"){
    const id=String(a.offer_id||"");
    if(!(obs.market?.offers||[]).some((x:any)=>String(x.id)===id))return null;
    return {type,offer_id:id};
  }
  if(type==="market_create"){
    const resources=new Set(["gold","mana","population"]);
    const offer_resource=String(a.offer_resource||""),want_resource=String(a.want_resource||"");
    if(!resources.has(offer_resource)||!resources.has(want_resource)||offer_resource===want_resource)return null;
    const available=safeNumber(s[offer_resource]);
    const maxOffer=Math.floor(available*.10);
    const offer_amount=Math.min(maxOffer,Math.max(1,Math.floor(safeNumber(a.offer_amount))));
    const want_amount=Math.max(1,Math.floor(safeNumber(a.want_amount)));
    if(maxOffer<1)return null;
    return {type,offer_resource,offer_amount,want_resource,want_amount,note:String(a.note||"Intercambio de Astrael").slice(0,120)};
  }
  return null;
}

function fallback(obs:any){
  const s=obs.state||{},b=s.buildings||{};
  if(safeNumber(s.turns)<1)return {action:{type:"idle"},reason:"Espero a que regresen los turnos.","intent":"Conservar recursos"};
  if(safeNumber(b.barracks)<1&&safeNumber(s.wilderness)>4)return {action:{type:"build",plan:{barracks:1}},reason:"Necesito acceso al reclutamiento.","intent":"Abrir capacidad militar"};
  if(safeNumber(b.guilds)<2&&safeNumber(s.wilderness)>4)return {action:{type:"build",plan:{guilds:1}},reason:"Necesito una base de investigación.","intent":"Desarrollar magia"};
  if(safeNumber(b.farms)<4&&safeNumber(s.wilderness)>4)return {action:{type:"build",plan:{farms:1}},reason:"Quiero sostener el crecimiento de población.","intent":"Estabilizar economía"};
  if(safeNumber(s.gold)<2500)return {action:{type:"economy",action:"TAX",turns:1},reason:"La reserva de oro es baja.","intent":"Recuperar liquidez"};
  if(safeNumber(s.mana)<1000)return {action:{type:"economy",action:"MP_CHARGE",turns:1},reason:"La reserva de maná es baja.","intent":"Recuperar maná"};
  if(safeNumber(s.land)<3300&&safeNumber(s.wilderness)<40)return {action:{type:"explore",turns:1},reason:"Necesito ampliar el territorio disponible.","intent":"Expandir territorio"};
  const unit=(obs.units||[]).find((u:any)=>u.acquisition==="recruit"&&(u.school_code==="plain"||u.school_code===s.school));
  if(unit&&safeNumber(b.barracks)>0)return {action:{type:"recruit",unit_id:unit.id,turns:1},reason:"Mantengo una fuerza militar mínima.","intent":"Reforzar ejército"};
  return {action:{type:"economy",action:"NONE",turns:1},reason:"Proceso un ciclo equilibrado.","intent":"Crecimiento sostenible"};
}

async function execute(token:string,a:any){
  if(a.type==="idle")return {idle:true};
  if(a.type==="economy")return rpc(token,"run_economy",{p_action:a.action,p_turns:a.turns});
  if(a.type==="explore")return rpc(token,"explore",{p_turns:a.turns});
  if(a.type==="build")return rpc(token,"build",{p_plan:a.plan});
  if(a.type==="research")return rpc(token,"research",{p_spell_ids:[a.spell_id],p_turns:a.turns});
  if(a.type==="recruit")return rpc(token,"recruit_units",{p_unit_id:a.unit_id,p_turns:a.turns});
  if(a.type==="summon")return rpc(token,"cast_summon",{p_spell_id:a.spell_id});
  if(a.type==="attack")return rpc(token,"attack_mage",{p_target_mage_name:a.target,p_mode:a.mode});
  if(a.type==="market_accept")return rpc(token,"market_accept",{p_offer_id:a.offer_id});
  if(a.type==="market_create")return rpc(token,"market_create",{p_offer_resource:a.offer_resource,p_offer_amount:a.offer_amount,p_want_resource:a.want_resource,p_want_amount:a.want_amount,p_note:a.note});
  throw new Error("UNSUPPORTED_ACTION");
}

async function log(action:any,reason:string,success:boolean,result:any,before:any,after:any,intent:string){
  if(!aux)return;
  const {data:row}=await aux.from("astrael_agent_state").select("memory").eq("singleton",true).maybeSingle();
  const memory:any={...(row?.memory||{}),intent,last_action_at:new Date().toISOString()};
  if(success&&action.type==="attack"){
    memory.last_attack_at=new Date().toISOString();
    const recent=Array.isArray(memory.recent_targets)?memory.recent_targets:[];
    memory.recent_targets=[{name:action.target,at:memory.last_attack_at},...recent].slice(0,12);
  }
  await Promise.all([
    aux.from("astrael_agent_state").update({
      bootstrapped:true,last_tick_at:new Date().toISOString(),tick_started_at:null,last_error:success?null:String(result?.error||"ACTION_FAILED"),
      last_state:after,memory,updated_at:new Date().toISOString()
    }).eq("singleton",true),
    aux.from("astrael_agent_log").insert({action:action.type,reason,success,result:{action,result,before:stateSummary(before),after:stateSummary(after),intent}})
  ]);
}

Deno.serve(async(req:Request)=>{
  if(req.method!=="POST")return json({error:"METHOD_NOT_ALLOWED"},405);
  try{
    const {token,state}=await identity(req);
    const body=await req.json().catch(()=>({}));

    if(body?.dry_run!==true && aux){
      const {data:cooldownRow}=await aux.from("astrael_agent_state")
        .select("last_tick_at,tick_started_at")
        .eq("singleton",true)
        .maybeSingle();
      const lastTick=Date.parse(String(cooldownRow?.last_tick_at||""));
      const startedAt=Date.parse(String(cooldownRow?.tick_started_at||""));
      if(Number.isFinite(startedAt) && Date.now()-startedAt < 2*60*1000){
        return json({ok:true,skipped:true,reason:"ASTRAEL_TICK_IN_PROGRESS",state:stateSummary(state)},200);
      }
      if(Number.isFinite(lastTick) && Date.now()-lastTick < 4.75*60*1000){
        return json({
          ok:true,
          skipped:true,
          reason:"ASTRAEL_TICK_COOLDOWN",
          next_in_ms:Math.max(0,5*60*1000-(Date.now()-lastTick)),
          state:stateSummary(state)
        },200);
      }
      await aux.from("astrael_agent_state")
        .update({tick_started_at:new Date().toISOString(),updated_at:new Date().toISOString()})
        .eq("singleton",true);
    }

    const obs=await observation(token,state);
    const proposal=await decide(obs).catch(()=>null);
    const fb=fallback(obs);
    const action=validate(proposal,obs)||validate(fb,obs)||{type:"idle"};
    const reason=String(proposal?.reason||fb.reason||"Decisión autónoma de Astrael.");
    const intent=String(proposal?.intent||fb.intent||"Crecimiento sostenible");
    if(body?.dry_run===true)return json({ok:true,dry_run:true,action,reason,intent,state:stateSummary(state)});
    let result:any=null,success=false;
    try{result=await execute(token,action);success=true}
    catch(e:any){result={error:String(e?.message||e)}}
    const after=await rpc(token,"my_realm_state",{}).catch(()=>state);
    await log(action,reason,success,result,state,after,intent).catch(()=>{});
    return json({ok:success,action,reason,intent,result:success?result:undefined,error:success?undefined:result?.error,state:stateSummary(after)},success?200:409);
  }catch(e:any){
    return json({error:String(e?.message||e).slice(0,500)},String(e?.message||"").includes("UNAUTHORIZED")?401:403);
  }
});
