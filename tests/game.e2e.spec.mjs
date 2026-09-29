import { test, expect } from "@playwright/test";

const SUPABASE_HOST = "mrmvmoyysxuopqexbxfk.supabase.co";
const COMMUNITY_HOST = "smynvbrkgffpepbhrpxt.supabase.co";

function corsHeaders(){
  return {
    "access-control-allow-origin":"*",
    "access-control-allow-headers":"authorization, apikey, content-type",
    "access-control-allow-methods":"GET, POST, DELETE, OPTIONS"
  };
}

function freshState(){
  return {
    season:{name:"Temporada de Pruebas",status:"active",ruleset_version:"test"},
    realm:{
      mage_name:"E2E_TESTER",school_code:"ascendant",status:"alive",
      turns:120,max_turns:200,next_turn_at:new Date(Date.now()+120000).toISOString(),
      gold:250000,mana:50000,population:25000,land:500,wilderness:220,
      net_power:15000,spell_level:3,pending_territory_damage:0
    },
    buildings:{
      farms:20,towns:20,nodes:10,workshops:5,guilds:16,barracks:2,fortresses:1,barriers:0
    },
    capacities:{residential:50000,food:50000,mana:100000},
    known_spells:[],
    research:{current_spell_id:null,remaining_points:0,effective_cost:0}
  };
}

async function installMocks(page){
  const state=freshState();
  let army=[];
  let chatMessages=[];
  let boardPosts=[];
  const calls=[];

  const schools=[
    {code:"ascendant",name_es:"Ascendente",color_key:"gold",description_es:"Luz y protección",adjacent_codes:["verdant","phantasm"],opposite_codes:["abyssal"]},
    {code:"verdant",name_es:"Verdeante",color_key:"green",description_es:"Naturaleza",adjacent_codes:["ascendant"],opposite_codes:["eradication"]},
    {code:"eradication",name_es:"Erradicación",color_key:"red",description_es:"Destrucción",adjacent_codes:["abyssal"],opposite_codes:["verdant"]},
    {code:"abyssal",name_es:"Abisal",color_key:"purple",description_es:"Muerte",adjacent_codes:["eradication"],opposite_codes:["ascendant"]},
    {code:"phantasm",name_es:"Fantasma",color_key:"blue",description_es:"Ilusión",adjacent_codes:["ascendant"],opposite_codes:[]}
  ];
  const spells=[
    {id:"spark",school_code:"ascendant",name_es:"Chispa Astral",rank:"simple",research_cost:30,spell_level_gain:1,cast_turns:1,base_mana_cost:10,researchable:true,effect_key:"test"}
  ];
  const units=[
    {id:"militia",school_code:"plain",name_es:"Milicia",acquisition:"recruit",power_rank:10,recruit_gold:25,recruit_mana:0,recruit_population:1,upkeep_gold:1,upkeep_mana:0,upkeep_population:0,natural_flying:false,natural_ranged:false,undisbandable:false,related_spell_id:null}
  ];

  await page.route(`https://${SUPABASE_HOST}/**`, async route=>{
    const req=route.request();
    const url=new URL(req.url());
    const path=url.pathname;
    const body=()=>{ try{return req.postDataJSON()||{};}catch{return {};} };
    calls.push({method:req.method(),path,body:body()});
    if(req.method()==="OPTIONS") return route.fulfill({status:204,headers:corsHeaders(),body:""});

    if(path==="/auth/v1/token"){
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({
        access_token:"e2e-access",refresh_token:"e2e-refresh",expires_in:3600,
        user:{id:"e2e-user",user_metadata:{username:"E2E_TESTER"}}
      })});
    }
    if(path==="/auth/v1/logout") return route.fulfill({status:204,body:""});

    if(path==="/rest/v1/schools") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify(schools)});
    if(path==="/rest/v1/spell_catalog") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify(spells)});
    if(path==="/rest/v1/unit_catalog") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify(units)});
    if(path==="/rest/v1/summon_profiles") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:"[]"});

    const rpc=path.match(/^\/rest\/v1\/rpc\/(.+)$/)?.[1];
    if(rpc==="my_realm_state") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify(state)});
    if(rpc==="player_profile"){
      const target=String(body().p_mage_name||state.realm.mage_name);
      const self=target.toLowerCase()===state.realm.mage_name.toLowerCase();
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({
        mage_name:target,school_code:self?state.realm.school_code:"abyssal",status:"alive",
        land:self?state.realm.land:480,net_power:self?state.realm.net_power:14200,spell_level:self?state.realm.spell_level:2,
        archmage_total_xp:self?520:220,arcane_power:self?3:2,knowledge:self?4:2,willpower:self?2:3,influence:self?1:2,attribute_points:self?1:0,
        bio:self?"Archimago de pruebas.":"Rival de pruebas.",avatar_path:null,is_self:self,is_npc:false,
        friendship:self?null:{status:"none"},alliance:null,my_alliance:null,can_invite_to_alliance:false
      })});
    }
    if(rpc==="social_inbox") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({friend_requests:[],alliance_invites:[],friends:[]})});
    if(rpc==="update_my_profile") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({bio:body().p_bio||"",avatar_path:body().p_avatar_path||null})});
    if(rpc==="friend_request") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({status:"pending",direction:"outgoing"})});
    if(rpc==="conversation_with") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({messages:[]})});
    if(rpc==="send_direct_message") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({sent:true,id:1})});
    if(rpc==="explore"){
      const turns=Number(body().p_turns||1);
      state.realm.turns-=turns;
      state.realm.land+=12;
      state.realm.wilderness+=12;
      state.realm.net_power+=120;
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({land_gained:12})});
    }
    if(rpc==="build"){
      const plan=body().p_plan||{};
      for(const [key,value] of Object.entries(plan)){
        if(key in state.buildings) state.buildings[key]+=Number(value||0);
        state.realm.wilderness=Math.max(0,state.realm.wilderness-Number(value||0));
      }
      state.realm.turns-=1;
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({turns_spent:1})});
    }
    if(rpc==="research"){
      state.realm.turns-=1;
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({completed:[],total_points_generated:14})});
    }
    if(rpc==="my_army") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify(army)});
    if(rpc==="recruit_units"){
      army=[{unit_id:"militia",name_es:"Milicia",quantity:5,stack_np:50}];
      state.realm.turns-=1;
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({recruited:5})});
    }
    if(rpc==="attack_targets") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify([
      {mage_name:"RIVAL_TEST",school_code:"abyssal",land:480,net_power:14200,can_attack:true}
    ])});
    if(rpc==="npc_directory") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify([
      {mage_name:"RIVAL_TEST",school_code:"abyssal",archetype:"guardian"}
    ])});
    if(rpc==="leaderboard") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:"[]"});
    if(rpc==="attack_mage"){
      state.realm.turns-=2;
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({
        attacker_victory:true,attacker_loss_bp:425,defender_loss_bp:1180,land_gained:37,battle_id:"battle-e2e-1"
      })});
    }
    if(rpc==="battle_report_detail") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({
      battle:{mode:"REGULAR",attacker_victory:true,attacker_loss_bp:425,defender_loss_bp:1180,land_gained:37},
      units:[{side:"attacker",name_es:"Milicia",initial_quantity:100,final_quantity:94,recovered:2},{side:"defender",name_es:"Guardia",initial_quantity:90,final_quantity:78,recovered:1}],
      events:[{sequence:1,type:"PRIMARY",actor_unit_id:"militia",target_unit_id:"guard",kills:8}]
    })});
    if(rpc==="my_battle_reports") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify([{battle_id:"battle-e2e-1",opponent_mage_name:"RIVAL_TEST",result:"VICTORY",created_at:new Date().toISOString(),mode:"REGULAR",my_loss_bp:425,land_change:37}])});

    return route.fulfill({status:404,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({error:`Unhandled mock route: ${path}`})});
  });

  await page.route(/^https:\/\/smynvbrkgffpepbhrpxt\.supabase\.co\/functions\/v1\/arcanum-community(?:\/.*)?(?:\?.*)?$/, async route=>{
    const req=route.request();
    const url=new URL(req.url());
    const tail=url.pathname.split("/arcanum-community")[1]||"/";
    const now=new Date().toISOString();
    calls.push({method:req.method(),path:"community"+tail});
    if(req.method()==="OPTIONS") return route.fulfill({status:204,headers:corsHeaders(),body:""});

    if(tail.startsWith("/messages")){
      if(req.method()==="POST"){
        const payload=req.postDataJSON();
        chatMessages.push({id:"msg-"+(chatMessages.length+1),user_id:"e2e-user",username:"E2E_TESTER",message:payload.message,created_at:now});
        return route.fulfill({status:201,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({message:chatMessages.at(-1),me:"e2e-user"})});
      }
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({messages:chatMessages,me:"e2e-user"})});
    }

    if(tail.startsWith("/posts")){
      if(req.method()==="POST"){
        const payload=req.postDataJSON();
        boardPosts.unshift({id:"post-"+(boardPosts.length+1),user_id:"e2e-user",username:"E2E_TESTER",category:payload.category,title:payload.title,body:payload.body,created_at:now,expires_at:new Date(Date.now()+14*86400000).toISOString()});
        return route.fulfill({status:201,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({post:boardPosts[0],me:"e2e-user"})});
      }
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({posts:boardPosts,me:"e2e-user"})});
    }

    return route.fulfill({status:404,contentType:"application/json",headers:corsHeaders(),body:'{"error":"NOT_FOUND"}'});
  });

  return {state,calls};
}

test("flujo crítico completo: login, reino, explorar, construir, investigar, reclutar, guerra y comunidad", async ({page})=>{
  const errors=[];
  page.on("pageerror",err=>errors.push(String(err)));

  const mock=await installMocks(page);
  await page.goto("/");

  await expect(page.locator("#auth-view")).toBeVisible();
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();

  await expect(page.getByRole("heading",{name:"Tu Reino"})).toBeVisible();
  await expect(page.locator("#mage-title")).toHaveText("E2E_TESTER");

  await page.locator("#realm-explore-turns").fill("2");
  await page.locator("#realm-explore-button").click();
  await expect(page.locator(".toast").last()).toContainText("Exploración completada");

  await page.locator('#main-nav button[data-view="build"]').click();
  await expect(page.getByRole("heading",{name:"Construcción"})).toBeVisible();
  await page.locator('[data-building="farms"]').fill("2");
  await page.locator("#build-button").click();
  await expect(page.locator(".toast").last()).toContainText("Construcción completada");

  await page.locator('#main-nav button[data-view="research"]').click();
  await expect(page.getByRole("heading",{name:"Investigación",exact:true})).toBeVisible();
  await page.locator("#research-turns").fill("1");
  await page.locator("#research-button").click();
  await expect(page.locator(".toast").last()).toContainText("Investigación avanzada");

  await page.locator('#main-nav button[data-view="army"]').click();
  await expect(page.getByRole("heading",{name:"Ejército"})).toBeVisible();
  await page.locator("#recruit-turns").fill("1");
  await page.locator("#recruit-button").click();
  await expect(page.locator(".toast").last()).toContainText("Reclutadas 5 unidades");

  await page.locator('#main-nav button[data-view="war"]').click();
  await expect(page.getByRole("heading",{name:"Guerra"})).toBeVisible();
  await expect(page.getByText("RIVAL_TEST")).toBeVisible();

  await page.locator('#main-nav button[data-view="community"]').click();
  await expect(page.getByRole("heading",{name:"Comunidad"})).toBeVisible();
  await page.locator("#chat-input").fill("Saludos desde el reino de pruebas");
  await page.locator("#chat-send").click();
  await expect.poll(()=>mock.calls.filter(x=>x.method==="POST" && x.path==="community/messages").length).toBeGreaterThan(0);
  await expect(page.getByText("Saludos desde el reino de pruebas")).toBeVisible();

  await page.getByRole("button",{name:"TABLÓN"}).click();
  await expect(page.getByRole("heading",{name:"Publicar anuncio"})).toBeVisible();
  await page.locator("#board-title").fill("Busco alianza");
  await page.locator("#board-body").fill("Reino de pruebas disponible para diplomacia.");
  await page.locator("#board-publish").click();
  await expect(page.getByText("Busco alianza")).toBeVisible();

  const paths=mock.calls.map(x=>x.path);
  for(const required of [
    "/auth/v1/token",
    "/rest/v1/rpc/my_realm_state",
    "/rest/v1/rpc/explore",
    "/rest/v1/rpc/build",
    "/rest/v1/rpc/research",
    "/rest/v1/rpc/recruit_units",
    "/rest/v1/rpc/attack_targets",
    "/rest/v1/rpc/npc_directory",
    "community/messages",
    "community/posts"
  ]) expect(paths.some(p=>p.startsWith(required)),`No se ejecutó ${required}`).toBeTruthy();

  expect(errors).toEqual([]);
});

test("la navegación móvil abre Comunidad sin errores", async ({page})=>{
  const errors=[];
  page.on("pageerror",err=>errors.push(String(err)));
  await page.setViewportSize({width:390,height:844});
  await installMocks(page);

  await page.goto("/");
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();
  await expect(page.getByRole("heading",{name:"Tu Reino"})).toBeVisible();

  const community=page.locator('#mobile-nav button[data-view="community"]');
  await community.scrollIntoViewIfNeeded();
  await community.click();
  await expect(page.getByRole("heading",{name:"Comunidad"})).toBeVisible();
  expect(errors).toEqual([]);
});


test("la ficha de personaje se abre desde el nombre y permite editar la bio", async ({page})=>{
  await installMocks(page);
  await page.goto("/");
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();
  await expect(page.getByRole("heading",{name:"Tu Reino"})).toBeVisible();
  await page.locator("#mage-card-button").click();
  await expect(page.getByText("FICHA DE ARCHIMAGO")).toBeVisible();
  await expect(page.locator("#profile-bio-input")).toBeVisible();
  await expect(page.getByText("PROGRESIÓN DEL ARCHIMAGO")).toBeVisible();
  await expect(page.getByText("Poder Arcano")).toBeVisible();\n  await expect(page.locator(".archmage-level-row > div:first-child strong")).toHaveText("4");
  await page.locator("#profile-bio-input").fill("Nueva bio de pruebas.");
  await page.locator("#profile-save-bio").click();
  await expect(page.locator(".toast").last()).toContainText("Ficha de personaje actualizada");
});


test("los iconos artísticos de navegación y recursos cargan", async ({page})=>{
  await installMocks(page);
  await page.goto("/");
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();
  await expect(page.getByRole("heading",{name:"Tu Reino"})).toBeVisible();
  const navIcon=page.locator('#main-nav button[data-view="realm"] img.nav-icon');
  await expect(navIcon).toBeVisible();
  await expect.poll(()=>navIcon.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  const goldIcon=page.locator('#resource-strip img[src*="resources/oro.png"]');
  await expect(goldIcon).toBeVisible();
  await expect.poll(()=>goldIcon.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
});


test("atacar abre siempre la crónica de batalla", async ({page})=>{
  await installMocks(page);
  page.on("dialog",dialog=>dialog.accept());
  await page.goto("/");
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();
  await page.locator('#main-nav button[data-view="war"]').click();
  await page.locator('.attack-btn[data-mode="REGULAR"]').click();
  await expect(page.locator("#modal")).toBeVisible();
  await expect(page.locator("#modal-content")).toContainText("CRÓNICA DEL COMBATE");
  await expect(page.locator("#modal-content")).toContainText("37");
});
