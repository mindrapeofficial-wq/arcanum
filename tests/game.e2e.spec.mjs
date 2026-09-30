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
  let friendRequests=[{mage_name:"REQUEST_TEST",school_code:"verdant"}];
  let archmageProgress={archmage_total_xp:520,arcane_power:2,knowledge:2,willpower:1,influence:1,attribute_points:1};
  let pveRun=null;
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
        ...(self?archmageProgress:{archmage_total_xp:220,arcane_power:1,knowledge:1,willpower:2,influence:1,attribute_points:0}),
        bio:self?"Archimago de pruebas.":"Rival de pruebas.",avatar_path:null,is_self:self,is_npc:false,
        friendship:self?null:(target==="FRIEND_TEST"?{status:"accepted"}:{status:"none"}),alliance:null,my_alliance:null,can_invite_to_alliance:false
      })});
    }
    if(rpc==="social_inbox") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({friend_requests:friendRequests,alliance_invites:[],friends:[{mage_name:"FRIEND_TEST",school_code:"phantasm"}]})});
    if(rpc==="update_my_profile") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({bio:body().p_bio||"",avatar_path:body().p_avatar_path||null})});
    if(rpc==="spend_archmage_attribute"){
      const key=String(body().p_attribute||"");
      if(!["arcane_power","knowledge","willpower","influence"].includes(key)){
        return route.fulfill({status:400,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({message:"INVALID_ATTRIBUTE"})});
      }
      if(archmageProgress.attribute_points<1){
        return route.fulfill({status:400,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({message:"NO_ATTRIBUTE_POINTS"})});
      }
      archmageProgress={...archmageProgress,[key]:archmageProgress[key]+1,attribute_points:archmageProgress.attribute_points-1};
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({...archmageProgress,archmage_level:4})});
    }
    if(rpc==="friend_request") return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({status:"pending",direction:"outgoing"})});
    if(rpc==="friend_respond"){
      const target=String(body().p_mage_name||"");
      friendRequests=friendRequests.filter(x=>x.mage_name!==target);
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({status:body().p_accept?"accepted":"rejected"})});
    }
    if(rpc==="conversation_with"){
      const target=String(body().p_mage_name||"");
      const messages=target==="FRIEND_TEST"?[{id:"dm-in-1",mine:false,body:"¿Entramos juntos a explorar?",created_at:new Date(Date.now()-30000).toISOString()}]:[];
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({messages})});
    }
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

  await page.route(/^https:\/\/smynvbrkgffpepbhrpxt\.supabase\.co\/functions\/v1\/arcanum-state(?:\/.*)?(?:\?.*)?$/, async route=>{
    const req=route.request();
    const url=new URL(req.url());
    const tail=url.pathname.split("/arcanum-state")[1]||"/";
    calls.push({method:req.method(),path:"state"+tail});
    if(req.method()==="OPTIONS")return route.fulfill({status:204,headers:corsHeaders(),body:""});

    const emptyInventory={
      version:2,items:[],
      equipment:{weapon:null,robe:null,amulet:null,ring1:null,ring2:null,focus:null},
      found:0,legacy_imported:true
    };
    const emptyItems={
      version:1,
      slots:["weapon","robe","amulet","ring1","ring2","focus","relic"],
      inventory_version:2,items:[],
      equipment:{weapon:null,robe:null,amulet:null,ring1:null,ring2:null,focus:null,relic:null},
      bag_count:0,bag_capacity:20,equipment_power:0
    };
    const profileFor=name=>{
      const target=String(name||state.realm.mage_name);
      const self=target.toLowerCase()===state.realm.mage_name.toLowerCase();
      return {
        mage_name:target,school_code:self?state.realm.school_code:(target==="FRIEND_TEST"?"phantasm":"abyssal"),status:"alive",
        land:self?state.realm.land:480,net_power:self?state.realm.net_power:14200,spell_level:self?state.realm.spell_level:2,
        ...(self?archmageProgress:{archmage_total_xp:220,arcane_power:1,knowledge:1,willpower:2,influence:1,attribute_points:0}),
        bio:self?"Archimago de pruebas.":"Rival de pruebas.",avatar_path:null,is_self:self,is_npc:false,
        friendship:self?null:(target==="FRIEND_TEST"?{status:"accepted"}:{status:"none"}),
        alliance:null,my_alliance:null,can_invite_to_alliance:false
      };
    };
    const snapshotFor=name=>{
      const profile=profileFor(name);
      const self=profile.is_self;
      return {
        version:1,generated_at:new Date().toISOString(),profile,
        identity:{mage_name:profile.mage_name,school_code:profile.school_code,status:"alive",level:self?4:2,spell_level:profile.spell_level,alliance:null,is_self:self,is_npc:false},
        progression:{
          level:self?4:2,total_xp:Number(profile.archmage_total_xp||220),xp:20,xp_next:300,attribute_points:Number(profile.attribute_points||0),
          aptitudes:{arcane_power:Number(profile.arcane_power||1),knowledge:Number(profile.knowledge||1),willpower:Number(profile.willpower||1),influence:Number(profile.influence||1)}
        },
        combat:{raw:null,stats:{},weapon:null,trait:null,bonusTraits:[],abilities:[],evolution:[],derived:{}},
        inventory:emptyInventory,items:emptyItems,
        artifacts:{items:[],equipped:[],count:0},
        arena:{username:profile.mage_name,rating:1000,wins:0,losses:0,seals_remaining:6},
        trajectory:{renown:{score:self?80:40,title:"Desconocido",mechanical_effect:false,breakdown:{}},arena_wins:0,arena_losses:0,arena_rating:1000,artifact_count:0,equipped_relics:0,recorded_battles:self?0:null,spell_level:profile.spell_level,realm_power:profile.net_power,land:profile.land},
        history:[],
        authority:{profile:"core-supabase",progression:"core-supabase",combat:"arcanum-state",inventory:"arcanum-state",items:"arcanum-state",arena:"arcanum-state",artifacts:"arcanum-community/nexo",history:"aggregated-server"}
      };
    };

    if(req.method()==="GET"&&tail.startsWith("/archmage/")){
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify(snapshotFor(decodeURIComponent(tail.slice("/archmage/".length))))});
    }
    if(req.method()==="GET"&&tail==="/snapshot"){
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({combat:null,arena:{rating:1000,wins:0,losses:0,seals_remaining:6},history:[],server_day:"2026-09-30"})});
    }
    if(req.method()==="GET"&&tail==="/inventory"){
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({inventory:emptyInventory,bonuses:{equipmentPower:0}})});
    }
    if(req.method()==="POST"&&tail==="/loot/exploration/start"){
      return route.fulfill({status:201,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({claim_key:"exploration:e2e",reused:false})});
    }
    if(req.method()==="POST"&&tail==="/loot/exploration/complete"){
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({status:"no_drop",item:null,pending:false,chance:.19,reward_tier:"scouting"})});
    }
    const pveCatalog=[{
      id:"ruins_threshold",name:"Ruinas del Umbral",subtitle:"Un corredor roto entre las Cinco Escuelas.",
      description:"Cuatro cámaras enlazadas.",min_level:1,room_count:4,
      difficulties:[
        {id:1,name:"I · Incursión",min_level:1,unlocked:true},
        {id:2,name:"II · Profundidad",min_level:5,unlocked:false},
        {id:3,name:"III · Abismo",min_level:10,unlocked:false}
      ]
    }];
    const pveRoom=(stage)=>[
      {id:"ash_sentinel",name:"Vigilante de Ceniza",school:"eradication",boss:false,desc:"Una armadura calcinada protege el acceso."},
      {id:"veil_weaver",name:"Tejedora del Velo",school:"phantasm",boss:false,desc:"Dobla pasillos y recuerdos."},
      {id:"withered_keeper",name:"Custodio Marchito",school:"verdant",boss:false,desc:"Raíces muertas guardan la tercera cámara."},
      {id:"hollow_cartographer",name:"El Cartógrafo Hueco",school:"abyssal",boss:true,desc:"Señor de las Ruinas."}
    ][stage]||null;
    const pveView=()=>pveRun?{...pveRun,current_room:pveRoom(pveRun.stage)}:null;

    if(req.method()==="GET"&&tail==="/pve"){
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({catalog:pveCatalog,run:pveView(),history:[],turn_cost_per_fight:1})});
    }
    if(req.method()==="POST"&&tail==="/pve/start"){
      pveRun={
        id:"pve-e2e-1",expedition_id:"ruins_threshold",expedition_name:"Ruinas del Umbral",
        difficulty:1,difficulty_name:"I · Incursión",status:"active",stage:0,rooms_cleared:0,room_count:4,
        player_hp:320,player_max_hp:320,last_enemy:null,last_log:[],last_loot:null,
        started_at:new Date().toISOString(),updated_at:new Date().toISOString(),expires_at:new Date(Date.now()+86400000).toISOString()
      };
      return route.fulfill({status:201,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({run:pveView(),resumed:false})});
    }
    if(req.method()==="POST"&&tail==="/pve/fight"){
      state.realm.turns-=1;
      pveRun={...pveRun,stage:1,rooms_cleared:1,player_hp:247,last_enemy:{name:"Vigilante de Ceniza",school:"eradication",level:4,max_hp:260,hp:0},updated_at:new Date().toISOString()};
      const loot={status:"completed",pending:false,item:{id:"loot-pve-e2e",name:"Foco de Umbral",rarity:"rare",rarityLabel:"Raro",origin:{source:"pve",reward_tier:"pve_room"}}};
      pveRun.last_loot=loot;
      return route.fulfill({status:201,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({
        run:pveView(),
        fight:{won:true,enemy:pveRun.last_enemy,player:{max_hp:320,hp:247},log:["RONDA 1","E2E_TESTER golpea al Vigilante de Ceniza: 42 de daño."]},
        loot_reward:loot
      })});
    }
    if(req.method()==="POST"&&tail==="/pve/retreat"){
      pveRun={...pveRun,status:"retreated",current_room:null};
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({run:pveRun})});
    }

    if(req.method()==="GET"&&tail==="/items"){
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({items:emptyItems,inventory:emptyInventory,relics:[]})});
    }
    if(req.method()==="GET"&&tail.startsWith("/combat/")){
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({combat:null,level:2})});
    }
    return route.fulfill({status:404,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({error:"UNHANDLED_STATE_MOCK",tail})});
  });

  await page.route(/^https:\/\/smynvbrkgffpepbhrpxt\.supabase\.co\/functions\/v1\/arcanum-community(?:\/.*)?(?:\?.*)?$/, async route=>{
    const req=route.request();
    const url=new URL(req.url());
    const tail=url.pathname.split("/arcanum-community")[1]||"/";
    const now=new Date().toISOString();
    calls.push({method:req.method(),path:"community"+tail});
    if(req.method()==="OPTIONS") return route.fulfill({status:204,headers:corsHeaders(),body:""});

    if(tail.startsWith("/presence")){
      return route.fulfill({status:200,contentType:"application/json",headers:corsHeaders(),body:JSON.stringify({online:[
        {username:"E2E_TESTER",school_code:"ascendant"},
        {username:"FRIEND_TEST",school_code:"phantasm"}
      ]})});
    }

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

  await page.route(/^https:\/\/smynvbrkgffpepbhrpxt\.supabase\.co\/functions\/v1\/arcanum-oracle$/, async route=>{
    const req=route.request();
    calls.push({method:req.method(),path:"oracle"});
    if(req.method()==="OPTIONS") return route.fulfill({status:204,headers:corsHeaders(),body:""});
    const payload=req.postDataJSON();
    return route.fulfill({
      status:200,
      contentType:"application/json",
      headers:corsHeaders(),
      body:JSON.stringify({
        name:"Astrael",
        title:"Archivista Arcano",
        mode:"ai",
        answer:`Los turnos se regeneran cada 5 minutos. Ahora tienes ${state.realm.turns} de ${state.realm.max_turns}.`
      })
    });
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

  await expect(page.locator("#game-view")).toBeVisible();
  await expect(page.locator("#mage-title")).toHaveText("E2E_TESTER");
  await expect(page.locator("#mage-school")).toContainText("Nivel 4");

  await page.locator("#realm-explore-turns").fill("2");
  await page.locator("#realm-explore-button").click();
  await expect(page.locator(".toast").last()).toContainText("Exploración completada");

  await page.locator('#main-nav button[data-view="build"]').click();
  await expect(page.getByRole("heading",{name:"Diseña el crecimiento de tu dominio"})).toBeVisible();
  await page.locator('[data-building="farms"]').fill("2");
  await page.locator("#build-button").click();
  await expect(page.locator(".toast").last()).toContainText("Construcción completada");

  await page.locator('#main-nav button[data-view="research"]').click();
  await expect(page.getByRole("heading",{name:"Conocimiento Arcano",exact:true})).toBeVisible();
  await page.locator("#research-turns").fill("1");
  await page.locator("#research-button").click();
  await expect(page.locator(".toast").last()).toContainText("Conocimiento Arcano avanzado");

  await page.locator('#main-nav button[data-view="army"]').click();
  await expect(page.getByRole("heading",{name:"Formaciones"})).toBeVisible();
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
    "state/loot/exploration/start",
    "state/loot/exploration/complete",
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
  await expect(page.locator("#game-view")).toBeVisible();
  await expect(page.locator("#mage-title")).toHaveText("E2E_TESTER");

  const community=page.locator('#mobile-nav button[data-view="community"]');
  await community.scrollIntoViewIfNeeded();
  await community.click();
  await expect(page.getByRole("heading",{name:"Comunidad"})).toBeVisible();
  expect(errors).toEqual([]);
});


test("la ficha de personaje se abre, permite gastar un punto y editar la bio", async ({page})=>{
  const mock=await installMocks(page);
  page.on("dialog",dialog=>dialog.accept());
  await page.goto("/");
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();
  await expect(page.locator("#game-view")).toBeVisible();
  await expect(page.locator("#mage-title")).toHaveText("E2E_TESTER");
  await page.locator("#mage-card-button").click();
  await expect(page.getByText("IDENTIDAD CANÓNICA")).toBeVisible();
  await expect(page.locator("#profile-bio-input")).toBeVisible();
  await expect(page.getByText("PROGRESIÓN DEL ARCHIMAGO")).toBeVisible();
  await expect(page.getByText("Poder Arcano",{exact:true}).first()).toBeVisible();
  await expect(page.getByText("FUENTES DE EXPERIENCIA")).toBeVisible();
  await expect(page.locator("#modal-content").getByText("Conocimiento Arcano",{exact:true}).first()).toBeVisible();
  await expect(page.getByText("Jefes PvE",{exact:true})).toBeVisible();
  await expect(page.getByText("Sendero Híbrido")).toBeVisible();
  await expect(page.locator(".archmage-level-row > div:first-child strong")).toHaveText("4");
  await expect(page.locator('[data-archmage-stat="knowledge"] strong')).toHaveText("2");
  await page.locator('[data-archmage-attribute="knowledge"]').click();
  await expect(page.locator(".toast").last()).toContainText("Conocimiento ha aumentado a 3");
  await expect(page.locator('[data-archmage-stat="knowledge"] strong')).toHaveText("3");
  await expect(page.getByText("Mente Erudita")).toBeVisible();
  await expect(page.locator("[data-archmage-attribute]")).toHaveCount(0);
  expect(mock.calls.some(x=>x.path==="/rest/v1/rpc/spend_archmage_attribute")).toBeTruthy();
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
  await expect(page.locator("#game-view")).toBeVisible();
  await expect(page.locator("#mage-title")).toHaveText("E2E_TESTER");
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


test("la barra lateral muestra conectados y abre chat privado solo entre amigos", async ({page})=>{
  await installMocks(page);
  await page.goto("/");
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();
  await expect(page.locator("#game-view")).toBeVisible();

  await page.locator("#sidebar-online-collapse").click();
  const connected=page.locator('#sidebar-online-list [data-profile="FRIEND_TEST"]');
  await expect(connected).toBeVisible();
  await expect(page.locator("#sidebar-online-count")).toHaveText("2");

  await connected.click();
  await expect(page.locator("#modal")).toBeVisible();
  await expect(page.locator("#modal-content")).toContainText("FRIEND_TEST");
  const privateChat=page.locator('#modal-content [data-direct-chat="FRIEND_TEST"]');
  await expect(privateChat).toBeVisible();

  await privateChat.click();
  await expect(page.locator("#direct-chat-window")).toBeVisible();
  await expect(page.locator("#direct-chat-name")).toHaveText("FRIEND_TEST");
  await page.locator("#direct-chat-input").fill("Mensaje privado de prueba");
  await page.locator("#direct-chat-send").click();
  await expect(page.locator("#direct-chat-input")).toHaveValue("");
});


test("Bandeja Arcana muestra solicitudes, mensajes y permite aceptar amistad", async ({page})=>{
  await installMocks(page);
  await page.goto("/");
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();
  await expect(page.locator("#game-view")).toBeVisible();

  await expect(page.locator("#top-inbox-badge")).toHaveText("2");
  await page.locator("#top-inbox-button").click();
  await expect(page.locator("#top-inbox-panel")).toBeVisible();
  await expect(page.locator("#top-inbox-requests")).toContainText("REQUEST_TEST");
  await expect(page.locator("#top-inbox-messages")).toContainText("FRIEND_TEST");
  await expect(page.locator("#top-inbox-messages")).toContainText("¿Entramos juntos a explorar?");

  await page.locator('[data-inbox-friend-accept="REQUEST_TEST"]').click();
  await expect(page.locator("#top-inbox-requests")).not.toContainText("REQUEST_TEST");

  await page.locator("#top-inbox-button").click();
  await page.locator("#top-inbox-button").click();
  await page.locator('[data-inbox-chat="FRIEND_TEST"]').click();
  await expect(page.locator("#direct-chat-window")).toBeVisible();
  await expect(page.locator("#direct-chat-messages")).toContainText("¿Entramos juntos a explorar?");
  await expect(page.locator("#top-inbox-badge")).toBeHidden();
});


test("Astrael aparece conectado y responde dudas del juego", async ({page})=>{
  const mock=await installMocks(page);
  await page.goto("/");
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();
  await expect(page.locator("#game-view")).toBeVisible();

  await expect(page.locator("#sidebar-online-list")).toContainText("Astrael");
  await expect(page.locator("#sidebar-online-list")).toContainText("IA");
  await page.locator("#sidebar-online-collapse").click();
  await page.locator('#sidebar-online-list [data-oracle-chat]').first().click();

  await expect(page.locator("#direct-chat-window")).toBeVisible();
  await expect(page.locator("#direct-chat-name")).toHaveText("Astrael");
  await expect(page.locator("#direct-chat-school")).toContainText("IA");
  await page.locator("#direct-chat-input").fill("¿Cómo funcionan los turnos?");
  await page.locator("#direct-chat-send").click();

  await expect(page.locator("#direct-chat-messages")).toContainText("cada 5 minutos");
  expect(mock.calls.some(x=>x.path==="oracle")).toBeTruthy();
});


test("Expediciones inicia una incursión persistente y arrastra vida entre salas", async ({page})=>{
  const errors=[];
  page.on("pageerror",err=>errors.push(String(err)));
  const mock=await installMocks(page);

  await page.goto("/");
  await page.locator("#username").fill("E2E_TESTER");
  await page.locator("#password").fill("prueba-segura");
  await page.locator("#submit-button").click();
  await expect(page.locator("#game-view")).toBeVisible();

  await page.locator('#main-nav button[data-view="pve"]').click();
  await expect(page.getByRole("heading",{name:"Expediciones"})).toBeVisible();
  await expect(page.getByText("Ruinas del Umbral",{exact:true})).toBeVisible();
  await page.locator('[data-pve-start="ruins_threshold"][data-pve-difficulty="1"]').click();

  await expect(page.getByText("Vigilante de Ceniza",{exact:true})).toBeVisible();
  await expect(page.locator(".pve-hp-head")).toContainText("320 / 320");
  await page.locator("#pve-fight").click();

  await expect(page.locator("#modal")).toBeVisible();
  await expect(page.locator("#modal-content")).toContainText("VICTORIA");
  await expect(page.locator("#modal-content")).toContainText("Foco de Umbral");
  await expect(page.locator("#modal-content")).toContainText("247 / 320");
  await page.locator("#modal-close").click();

  await expect(page.getByText("Tejedora del Velo",{exact:true})).toBeVisible();
  await expect(page.locator(".pve-hp-head")).toContainText("247 / 320");
  expect(mock.calls.some(x=>x.path==="state/pve/start")).toBeTruthy();
  expect(mock.calls.some(x=>x.path==="state/pve/fight")).toBeTruthy();
  expect(errors).toEqual([]);
});
