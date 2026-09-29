"use strict";

function getSession(){ try{return JSON.parse(localStorage.getItem(SESSION_KEY)||"null");}catch{return null;} }
function saveSession(session){
  if(!session){localStorage.removeItem(SESSION_KEY);return;}
  if(!session.expires_at && session.expires_in) session.expires_at=Math.floor(Date.now()/1000)+Number(session.expires_in);
  localStorage.setItem(SESSION_KEY,JSON.stringify(session));
}
async function refreshSession(){
  const session=getSession(); if(!session?.refresh_token) throw new Error("SESSION_EXPIRED");
  const res=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:session.refresh_token})});
  const data=await res.json().catch(()=>({})); if(!res.ok) throw new Error(data?.msg||data?.message||"SESSION_EXPIRED"); saveSession(data); return data;
}
async function validSession(){
  let s=getSession(); if(!s?.access_token) return null;
  if(s.expires_at && Number(s.expires_at)*1000 < Date.now()+45000){ try{s=await refreshSession();}catch{return null;} }
  return s;
}
async function api(path,{method="GET",body=null,auth=true,retry=true}={}){
  let session=auth?await validSession():getSession();
  const headers={apikey:SUPABASE_KEY,"Content-Type":"application/json"};
  if(auth && session?.access_token) headers.Authorization=`Bearer ${session.access_token}`;
  const res=await fetch(`${SUPABASE_URL}${path}`,{method,headers,body:body==null?undefined:JSON.stringify(body)});
  if(res.status===401 && auth && retry && getSession()?.refresh_token){ try{await refreshSession(); return api(path,{method,body,auth,retry:false});}catch{} }
  const raw=await res.text(); let data=null; try{data=raw?JSON.parse(raw):null;}catch{data=raw;}
  if(!res.ok){ const msg=data?.message||data?.msg||data?.error_description||data?.error||raw||`HTTP ${res.status}`; throw new Error(typeof msg==="string"?msg:JSON.stringify(msg)); }
  return data;
}
const rpc=(name,args={})=>api(`/rest/v1/rpc/${name}`,{method:"POST",body:args});
const rest=(table,query="")=>api(`/rest/v1/${table}${query?`?${query}`:""}`);

function accountKey(username){
  const raw=String(username||"").trim().toLowerCase();
  let hash=2166136261;
  for(let i=0;i<raw.length;i++){ hash^=raw.charCodeAt(i); hash=Math.imul(hash,16777619); }
  const slug=raw.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,36)||"mage";
  return `${slug}-${(hash>>>0).toString(36)}`;
}
function accountEmail(username){ return `${accountKey(username)}@beta.arcanum.game`; }
function accountSecret(username,password){ return `ARCANUM_BETA::${String(username||"").trim().toLowerCase()}::${password}`; }
async function signIn(email,password){
  const data=await api(`/auth/v1/token?grant_type=password`,{method:"POST",body:{email,password},auth:false}); saveSession(data); return data;
}
async function registerAccount(username,password){
  return api(`/functions/v1/register`,{method:"POST",body:{username,email:accountEmail(username),password:accountSecret(username,password)},auth:false});
}
async function signInAccount(username,password){
  return signIn(accountEmail(username),accountSecret(username,password));
}
async function signOut(){
  try{ const s=getSession(); if(s?.access_token) await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${s.access_token}`}});}catch{}
  saveSession(null); realmState=null; catalogs={schools:[],spells:[],units:[],summons:[]}; clearInterval(periodicTimer); clearInterval(countdownTimer); location.reload();
}

function switchAuthMode(next){
  mode=next; const registering=mode==="register";
  $("#login-tab").classList.toggle("active",!registering);
  $("#register-tab").classList.toggle("active",registering);
  $("#confirm-field").classList.toggle("hidden",!registering);
  $("#username").required=true;
  $("#confirm-password").required=registering;
  $("#password").autocomplete=registering?"new-password":"current-password";
  $("#submit-label").textContent=registering?"CREAR CUENTA":"ENTRAR";
  clearNotice($("#auth-notice"));
}
