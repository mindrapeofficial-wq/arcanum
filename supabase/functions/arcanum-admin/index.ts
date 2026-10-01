import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const CORE_URL="https://mrmvmoyysxuopqexbxfk.supabase.co";
const CORE_KEY="sb_publishable_tZEPJi2v7Tp-xDuVa0qWRw_geizIGoD";
const ALLOWED_ORIGINS=new Set(["https://arcanum-las-cinco-escuelas.onrender.com"]);
// Admins are identified by auth user id, never by a claimable display name.
const ADMIN_USER_IDS=new Set(["4fa0b39b-620a-409a-9fda-0eb65bcb332f"]);
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});

function cors(req:Request){
  const origin=req.headers.get("origin")||"";
  return {
    "Access-Control-Allow-Origin":ALLOWED_ORIGINS.has(origin)?origin:"https://arcanum-las-cinco-escuelas.onrender.com",
    "Access-Control-Allow-Headers":"authorization, content-type",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
    "Vary":"Origin"
  };
}
function json(req:Request,data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors(req),"Content-Type":"application/json","Cache-Control":"no-store"}})}
function parts(req:Request){const p=new URL(req.url).pathname.replace(/\/+$/,"");const m="/arcanum-admin";const tail=p.includes(m)?p.split(m)[1]:p;return tail.split("/").filter(Boolean)}
async function coreRpc(token:string,fn:string,args:Record<string,unknown>={}){
  const r=await fetch(`${CORE_URL}/rest/v1/rpc/${fn}`,{method:"POST",headers:{apikey:CORE_KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify(args)});
  const raw=await r.text(); if(!r.ok) throw new Error(raw||"CORE_RPC_FAILED"); return raw?JSON.parse(raw):null;
}
async function adminIdentity(req:Request){
  const h=req.headers.get("authorization")||""; if(!h.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token=h.slice(7).trim();
  const u=await fetch(`${CORE_URL}/auth/v1/user`,{headers:{apikey:CORE_KEY,Authorization:`Bearer ${token}`}});
  if(!u.ok) throw new Error("UNAUTHORIZED");
  const user=await u.json();
  const userId=String(user?.id||"");
  if(!ADMIN_USER_IDS.has(userId)) throw new Error("FORBIDDEN");
  const state=await coreRpc(token,"my_realm_state",{});
  const username=String(state?.realm?.mage_name||"").trim();
  return {userId,username,token};
}
async function audit(who:any,action:string,targetType?:string,targetId?:string,payload:any={}){
  await db.from("arcanum_admin_audit").insert({actor_user_id:who.userId,actor_username:who.username,action,target_type:targetType||null,target_id:targetId||null,payload});
}
async function setting(key:string){const {data}=await db.from("arcanum_admin_settings").select("value,updated_at").eq("key",key).maybeSingle();return data||null}
async function summary(){
  const names=["arcanum_presence","arcanum_chat_messages","arcanum_board_posts","arcanum_market_offers","arcanum_combat_profiles","arcanum_arena_state","arcanum_arena_matches","arcanum_inventory_state","arcanum_player_artifacts","arcanum_pve_runs"];
  const counts:any={};
  for(const n of names){const {count}=await db.from(n).select("*",{count:"exact",head:true});counts[n]=count||0}
  const [{data:boss},{data:maintenance},{data:auditRows}] = await Promise.all([
    db.from("arcanum_world_boss_events").select("*").order("created_at",{ascending:false}).limit(3),
    db.from("arcanum_admin_settings").select("value,updated_at").eq("key","maintenance").maybeSingle(),
    db.from("arcanum_admin_audit").select("*").order("created_at",{ascending:false}).limit(25)
  ]);
  return {counts,boss:boss||[],maintenance:maintenance||null,audit:auditRows||[]};
}
async function players(){
  const [presence,arena,combat,inventory,domains,artifacts,pve]=await Promise.all([
    db.from("arcanum_presence").select("*").order("last_seen",{ascending:false}).limit(300),
    db.from("arcanum_arena_state").select("*").limit(300),
    db.from("arcanum_combat_profiles").select("user_id,username,school_code,updated_at").limit(300),
    db.from("arcanum_inventory_state").select("user_id,username,state,updated_at").limit(300),
    db.from("arcanum_domains").select("*").limit(300),
    db.from("arcanum_player_artifacts").select("user_id,username,equipped,lost_at").is("lost_at",null).limit(1000),
    db.from("arcanum_pve_runs").select("user_id,username,status,stage,difficulty,updated_at").order("updated_at",{ascending:false}).limit(500)
  ]);
  const map=new Map<string,any>();
  const ensure=(name:string)=>{const k=String(name||"").trim().toLowerCase();if(!k)return null;if(!map.has(k))map.set(k,{username:name});return map.get(k)};
  for(const r of presence.data||[])Object.assign(ensure(r.username),{user_id:r.user_id,school_code:r.school_code,last_seen:r.last_seen});
  for(const r of arena.data||[])Object.assign(ensure(r.username),{arena:r});
  for(const r of combat.data||[])Object.assign(ensure(r.username),{user_id:r.user_id,school_code:r.school_code,combat:r});
  for(const r of inventory.data||[])Object.assign(ensure(r.username),{inventory_count:Array.isArray(r.state?.items)?r.state.items.length:0});
  for(const r of domains.data||[])Object.assign(ensure(r.character_name),{domain_name:r.domain_name});
  for(const r of artifacts.data||[]){const x=ensure(r.username);if(x)x.artifact_count=(x.artifact_count||0)+1}
  const seen=new Set<string>();for(const r of pve.data||[]){const k=String(r.username||"").toLowerCase();if(seen.has(k))continue;seen.add(k);const x=ensure(r.username);if(x)x.pve=r}
  return [...map.values()].sort((a,b)=>String(a.username).localeCompare(String(b.username)));
}
async function moderation(){
  const [chat,board,market,boss,auditRows]=await Promise.all([
    db.from("arcanum_chat_messages").select("*").order("created_at",{ascending:false}).limit(100),
    db.from("arcanum_board_posts").select("*").order("created_at",{ascending:false}).limit(100),
    db.from("arcanum_market_offers").select("*").order("created_at",{ascending:false}).limit(100),
    db.from("arcanum_world_boss_events").select("*").order("created_at",{ascending:false}).limit(20),
    db.from("arcanum_admin_audit").select("*").order("created_at",{ascending:false}).limit(100)
  ]);
  return {chat:chat.data||[],board:board.data||[],market:market.data||[],boss:boss.data||[],audit:auditRows.data||[]};
}
async function act(who:any,body:any){
  const action=String(body?.action||""); const target=String(body?.target||"");
  if(action==="maintenance:set"){
    const enabled=!!body.enabled; const message=String(body.message||"ARCANUM está en mantenimiento. Vuelve en unos minutos.").slice(0,240);
    await db.from("arcanum_admin_settings").upsert({key:"maintenance",value:{enabled,message},updated_at:new Date().toISOString()});
    await audit(who,action,"system","maintenance",{enabled,message}); return {ok:true,maintenance:{enabled,message}};
  }
  if(!target) throw new Error("TARGET_REQUIRED");
  if(action==="arena:update"){
    const patch:any={updated_at:new Date().toISOString()};
    if(body.rating!=null)patch.rating=Math.max(100,Math.floor(Number(body.rating)));
    if(body.seals!=null)patch.seals_remaining=Math.max(0,Math.min(6,Math.floor(Number(body.seals))));
    if(body.wins!=null)patch.wins=Math.max(0,Math.floor(Number(body.wins)));
    if(body.losses!=null)patch.losses=Math.max(0,Math.floor(Number(body.losses)));
    const {error}=await db.from("arcanum_arena_state").update(patch).ilike("username",target);if(error)throw error;
    await audit(who,action,"player",target,patch);return {ok:true};
  }
  if(action==="inventory:clear"){
    const {data,error:findError}=await db.from("arcanum_inventory_state").select("state").ilike("username",target).maybeSingle(); if(findError)throw findError;
    if(!data)throw new Error("PLAYER_NOT_FOUND");
    const next={...(data.state||{}),items:[],equipment:{weapon:null,robe:null,amulet:null,ring1:null,ring2:null,focus:null}};
    const {error}=await db.from("arcanum_inventory_state").update({state:next,updated_at:new Date().toISOString()}).ilike("username",target);if(error)throw error;
    await audit(who,action,"player",target,{});return {ok:true};
  }
  if(action==="combat:reset"){
    const {error}=await db.from("arcanum_combat_profiles").delete().ilike("username",target);if(error)throw error;
    await audit(who,action,"player",target,{});return {ok:true};
  }
  if(action==="pve:abort"){
    const {error}=await db.from("arcanum_pve_runs").update({status:"expired",completed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).ilike("username",target).in("status",["active","fighting"]);if(error)throw error;
    await audit(who,action,"player",target,{});return {ok:true};
  }
  if(action==="artifact:unequip"){
    const {error}=await db.from("arcanum_player_artifacts").update({equipped:false}).ilike("username",target).is("lost_at",null);if(error)throw error;
    await audit(who,action,"player",target,{});return {ok:true};
  }
  if(action==="presence:kick"){
    const {error}=await db.from("arcanum_presence").delete().ilike("username",target);if(error)throw error;
    await audit(who,action,"player",target,{});return {ok:true};
  }
  if(action==="chat:delete"){
    const {error}=await db.from("arcanum_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",target);if(error)throw error;
    await audit(who,action,"chat",target,{});return {ok:true};
  }
  if(action==="board:delete"){
    const {error}=await db.from("arcanum_board_posts").delete().eq("id",target);if(error)throw error;
    await audit(who,action,"board",target,{});return {ok:true};
  }
  if(action==="market:cancel"){
    const {error}=await db.from("arcanum_market_offers").update({status:"cancelled",closed_at:new Date().toISOString()}).eq("id",target).eq("status","open");if(error)throw error;
    await audit(who,action,"market",target,{});return {ok:true};
  }
  if(action==="boss:update"){
    const patch:any={}; if(body.current_hp!=null)patch.current_hp=Math.max(0,Math.floor(Number(body.current_hp))); if(body.status)patch.status=String(body.status);
    if(patch.current_hp===0&&patch.status==="defeated")patch.defeated_at=new Date().toISOString();
    const {error}=await db.from("arcanum_world_boss_events").update(patch).eq("event_id",target);if(error)throw error;
    await audit(who,action,"boss",target,patch);return {ok:true};
  }
  throw new Error("UNKNOWN_ACTION");
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
  const p=parts(req);
  try{
    if(req.method==="GET"&&p[0]==="public-status"){const m=await setting("maintenance");return json(req,{maintenance:m?.value||{enabled:false}})}
    const who=await adminIdentity(req);
    if(req.method==="GET"&&p[0]==="me")return json(req,{admin:true,username:who.username});
    if(req.method==="GET"&&p[0]==="summary")return json(req,await summary());
    if(req.method==="GET"&&p[0]==="players")return json(req,{players:await players()});
    if(req.method==="GET"&&p[0]==="moderation")return json(req,await moderation());
    if(req.method==="POST"&&p[0]==="action")return json(req,await act(who,await req.json().catch(()=>({}))));
    return json(req,{error:"NOT_FOUND"},404);
  }catch(e){
    const m=String((e as any)?.message||e||"SERVER_ERROR");
    if(m.includes("UNAUTHORIZED"))return json(req,{error:"UNAUTHORIZED"},401);
    if(m.includes("FORBIDDEN"))return json(req,{error:"FORBIDDEN"},403);
    if(m.includes("PLAYER_NOT_FOUND"))return json(req,{error:"PLAYER_NOT_FOUND"},404);
    if(m.includes("TARGET_REQUIRED")||m.includes("UNKNOWN_ACTION"))return json(req,{error:m},400);
    console.error(e);return json(req,{error:"SERVER_ERROR"},500);
  }
});
