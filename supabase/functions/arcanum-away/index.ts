import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGINS = new Set([
  "https://arcanum-las-cinco-escuelas.onrender.com"
]);

function cors(req:Request){
  const origin=req.headers.get("origin")||"";
  return {
    "Access-Control-Allow-Origin":ALLOWED_ORIGINS.has(origin)?origin:"https://arcanum-las-cinco-escuelas.onrender.com",
    "Access-Control-Allow-Headers":"authorization, content-type",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
    "Vary":"Origin"
  };
}
function json(req:Request,data:unknown,status=200){
  return new Response(JSON.stringify(data),{status,headers:{...cors(req),"Content-Type":"application/json","Cache-Control":"no-store"}});
}

Deno.serve((req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
  return json(req,{error:"FEATURE_RETIRED",message:"arcanum-away has been retired. Offline summaries must be derived from authoritative server state."},410);
});
