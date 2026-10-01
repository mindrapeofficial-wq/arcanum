import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const ARCANUM_URL = "https://mrmvmoyysxuopqexbxfk.supabase.co";
const ARCANUM_KEY = "sb_publishable_tZEPJi2v7Tp-xDuVa0qWRw_geizIGoD";
const ALLOWED_ORIGINS = new Set(["https://arcanum-las-cinco-escuelas.onrender.com"]);

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth:{ persistSession:false, autoRefreshToken:false } }
);

function cors(req:Request){
  const origin=req.headers.get("origin")||"";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://arcanum-las-cinco-escuelas.onrender.com",
    "Access-Control-Allow-Headers":"authorization, content-type",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
    "Vary":"Origin"
  };
}
function json(req:Request,data:unknown,status=200){
  return new Response(JSON.stringify(data),{status,headers:{...cors(req),"Content-Type":"application/json","Cache-Control":"no-store"}});
}
async function coreRpc(token:string,fn:string,args:Record<string,unknown>={}){
  const resp=await fetch(`${ARCANUM_URL}/rest/v1/rpc/${fn}`,{
    method:"POST",
    headers:{apikey:ARCANUM_KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
    body:JSON.stringify(args)
  });
  const raw=await resp.text();
  if(!resp.ok)throw new Error("CORE_RPC_FAILED");
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
  const characterName=String(state?.realm?.mage_name||"").trim();
  if(!characterName)throw new Error("REALM_REQUIRED");
  return {userId:String(user.id),characterName,token};
}
function normalizeDisplayName(raw:unknown){
  return String(raw??"").normalize("NFKC").replace(/\s+/g," ").trim();
}
function validName(name:string){
  if(name.length<3||name.length>32)return false;
  if(!/^[\p{L}\p{N}][\p{L}\p{N} ._'’\-]{1,30}[\p{L}\p{N}]$/u.test(name))return false;
  return true;
}
async function ensureDomain(userId:string,characterName:string){
  const {data:existing,error:findError}=await db.from("arcanum_domains")
    .select("user_id,character_name,domain_name,created_at,updated_at")
    .eq("user_id",userId).maybeSingle();
  if(findError)throw findError;
  if(existing){
    if(existing.character_name!==characterName){
      await db.from("arcanum_domains").update({character_name:characterName,updated_at:new Date().toISOString()}).eq("user_id",userId);
      existing.character_name=characterName;
    }
    return existing;
  }
  let candidate=normalizeDisplayName(characterName);
  if(!validName(candidate))candidate="Dominio "+characterName.slice(0,20);
  let suffix=1;
  while(suffix<100){
    const name=suffix===1?candidate:`${candidate} ${suffix}`;
    const {data,error}=await db.from("arcanum_domains").insert({user_id:userId,character_name:characterName,domain_name:name}).select("user_id,character_name,domain_name,created_at,updated_at").single();
    if(!error)return data;
    if(error.code!=="23505")throw error;
    suffix++;
  }
  throw new Error("DOMAIN_NAME_UNAVAILABLE");
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
  try{
    const who=await identity(req);
    if(req.method==="GET"){
      return json(req,{domain:await ensureDomain(who.userId,who.characterName)});
    }
    if(req.method==="POST"){
      const body=await req.json().catch(()=>({}));
      const name=normalizeDisplayName(body?.domain_name);
      if(!validName(name))return json(req,{error:"INVALID_DOMAIN_NAME"},400);
      await ensureDomain(who.userId,who.characterName);
      const {data,error}=await db.from("arcanum_domains")
        .update({domain_name:name,character_name:who.characterName,updated_at:new Date().toISOString()})
        .eq("user_id",who.userId)
        .select("user_id,character_name,domain_name,created_at,updated_at")
        .single();
      if(error){
        if(error.code==="23505")return json(req,{error:"DOMAIN_NAME_TAKEN"},409);
        throw error;
      }
      return json(req,{domain:data});
    }
    return json(req,{error:"METHOD_NOT_ALLOWED"},405);
  }catch(error){
    const msg=String((error as any)?.message||error||"SERVER_ERROR");
    if(msg.includes("UNAUTHORIZED"))return json(req,{error:"UNAUTHORIZED"},401);
    if(msg.includes("REALM_REQUIRED"))return json(req,{error:"REALM_REQUIRED"},403);
    if(msg.includes("DOMAIN_NAME_UNAVAILABLE"))return json(req,{error:"DOMAIN_NAME_UNAVAILABLE"},409);
    console.error(error);
    return json(req,{error:"SERVER_ERROR"},500);
  }
});