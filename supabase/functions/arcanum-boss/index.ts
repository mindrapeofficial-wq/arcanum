import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const ARCANUM_URL = "https://mrmvmoyysxuopqexbxfk.supabase.co";
const ARCANUM_KEY = "sb_publishable_tZEPJi2v7Tp-xDuVa0qWRw_geizIGoD";
const EVENT_ID = "umbra-001";
const TURN_COST = 3;

const BOSS_ARTIFACTS = {
  minor: ["ember_vial","moon_salt","mirror_shard","war_drum","mana_crystal","oracle_dice","black_candle","pilgrim_map","griffin_feather","sealed_letter","star_ink","obsidian_key","silver_hourglass","witch_bell","hollow_coin","thorn_seed","storm_bottle","dream_lens","phoenix_ash","rune_nail","siren_shell","dragon_scale","sun_compass","grave_lantern","saint_thread","glass_eye","blood_quill","winter_rose","cinder_mask","echo_flute"],
  cursed: ["cursed_ledger","widows_ring","hunger_idol","broken_crown","black_mirror"],
  unique: ["crown_five_voices","eryndor_chalice","staff_first_archmage","sword_last_dawn","atlas_unwritten","throne_ashes","orb_ninth_moon","bell_worlds_end","key_underworld","heart_arcanum"],
  school: {
    verdant: ["verdant_crown","verdant_codex","verdant_seedheart"],
    eradication: ["eradication_brand","eradication_furnace","eradication_banner"],
    ascendant: ["ascendant_halo","ascendant_chalice","ascendant_sunstone"],
    abyssal: ["abyssal_eye","abyssal_chain","abyssal_whisper"],
    phantasm: ["phantasm_mask","phantasm_prism","phantasm_veil"],
  } as Record<string,string[]>,
} as const;

const ALLOWED_ORIGINS = new Set([
  "https://arcanum-las-cinco-escuelas.onrender.com"
]);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://arcanum-las-cinco-escuelas.onrender.com",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function identity(req: Request) {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Response("UNAUTHORIZED", { status: 401 });
  const token = header.slice(7).trim();

  const authResp = await fetch(`${ARCANUM_URL}/auth/v1/user`, {
    headers: { apikey: ARCANUM_KEY, Authorization: `Bearer ${token}` },
  });
  if (!authResp.ok) throw new Response("UNAUTHORIZED", { status: 401 });
  const user = await authResp.json();

  const realmResp = await fetch(`${ARCANUM_URL}/rest/v1/rpc/my_realm_state`, {
    method: "POST",
    headers: {
      apikey: ARCANUM_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!realmResp.ok) throw new Response("REALM_REQUIRED", { status: 403 });
  const state = await realmResp.json();
  const realm = state?.realm || {};
  const username = String(realm?.mage_name || "").trim();
  const schoolCode = String(realm?.school_code || "").trim();
  if (!username || !schoolCode) throw new Response("REALM_REQUIRED", { status: 403 });

  return { userId: String(user.id), username, schoolCode, realm, token };
}

async function closeExpiredBoss() {
  const now = new Date().toISOString();
  await supabase
    .from("arcanum_world_boss_events")
    .update({ status: "closed" })
    .eq("event_id", EVENT_ID)
    .eq("status", "active")
    .lte("ends_at", now);
}


function bossPick<T>(rows: readonly T[]): T {
  return rows[Math.floor(Math.random() * rows.length)];
}

async function bossArtifactDefinition(schoolCode: string, weights: {minor:number;school:number;cursed:number;unique:number}) {
  const { data: held, error: heldError } = await supabase
    .from("arcanum_player_artifacts")
    .select("artifact_id")
    .eq("category", "unique")
    .is("lost_at", null);
  if (heldError) throw heldError;
  const heldIds = new Set((held || []).map((x:any)=>String(x.artifact_id)));
  const freeUnique = BOSS_ARTIFACTS.unique.filter(id=>!heldIds.has(id));
  const schoolPool = BOSS_ARTIFACTS.school[schoolCode] || BOSS_ARTIFACTS.minor;
  const options = [
    {category:"minor",weight:weights.minor,pool:BOSS_ARTIFACTS.minor},
    {category:"school",weight:weights.school,pool:schoolPool},
    {category:"cursed",weight:weights.cursed,pool:BOSS_ARTIFACTS.cursed},
    {category:"unique",weight:freeUnique.length?weights.unique:0,pool:freeUnique},
  ].filter(x=>x.weight>0 && x.pool.length);
  const total=options.reduce((s,x)=>s+x.weight,0);
  let roll=Math.random()*total, picked=options[0];
  for(const option of options){roll-=option.weight;if(roll<=0){picked=option;break;}}
  return {id:bossPick(picked.pool),category:picked.category};
}

async function grantBossArtifactTo(participant:any, weights:{minor:number;school:number;cursed:number;unique:number}) {
  const chosen=await bossArtifactDefinition(String(participant.school_code||""),weights);
  const rarity=chosen.category==="unique"?"world_unique":chosen.category==="cursed"?"cursed":chosen.category==="school"?"school_relic":"relic";
  const { data: artifact, error } = await supabase
    .from("arcanum_player_artifacts")
    .insert({
      artifact_id:chosen.id,
      user_id:String(participant.user_id),
      username:String(participant.username),
      school_code:String(participant.school_code),
      category:chosen.category,
      rarity,
      source:`boss:${EVENT_ID}`,
      equipped:false,
    })
    .select("id,artifact_id,category,rarity,source,equipped,acquired_at")
    .single();
  if(error){
    if(String((error as any)?.code||"")==="23505" && chosen.category==="unique"){
      return grantBossArtifactTo(participant,{minor:45,school:45,cursed:10,unique:0});
    }
    throw error;
  }
  await supabase.from("arcanum_artifact_history").insert({
    artifact_id:chosen.id,
    artifact_instance_id:artifact.id,
    user_id:String(participant.user_id),
    username:String(participant.username),
    event_type:"won_from_world_boss",
    source:`boss:${EVENT_ID}`,
  });
  return artifact;
}

async function grantBossArtifactRewards() {
  const { data: boss, error: bossError } = await supabase
    .from("arcanum_world_boss_events")
    .select("event_id,status,current_hp")
    .eq("event_id", EVENT_ID)
    .single();
  if (bossError) throw bossError;
  if (boss.status !== "defeated" && Number(boss.current_hp || 0) > 0) return;

  const { data: participants, error } = await supabase
    .from("arcanum_world_boss_participants")
    .select("user_id,username,school_code,damage,attacks")
    .eq("event_id", EVENT_ID)
    .gt("damage", 0);
  if (error) throw error;

  for (const p of participants || []) {
    const claimKey = `boss:${EVENT_ID}:${p.user_id}`;
    const { data: oldClaim } = await supabase
      .from("arcanum_artifact_claims")
      .select("claim_key")
      .eq("claim_key", claimKey)
      .maybeSingle();
    if (oldClaim) continue;

    const damage = Number(p.damage || 0);
    let chance = 0.30;
    let weights = {minor:90,school:10,cursed:0,unique:0};
    if (damage >= 50000) { chance = 1; weights = {minor:35,school:45,cursed:15,unique:5}; }
    else if (damage >= 15000) { chance = 1; weights = {minor:45,school:50,cursed:5,unique:0}; }
    else if (damage >= 3000) { chance = 0.70; weights = {minor:70,school:27,cursed:3,unique:0}; }

    const { error: claimError } = await supabase.from("arcanum_artifact_claims").insert({
      claim_key:claimKey,
      user_id:String(p.user_id),
      username:String(p.username),
      school_code:String(p.school_code),
      source:"world_boss",
      metadata:{event_id:EVENT_ID,damage,attacks:Number(p.attacks||0),chance},
    });
    if (claimError) {
      if (String((claimError as any)?.code || "") === "23505") continue;
      throw claimError;
    }

    if (Math.random() > chance) {
      await supabase.from("arcanum_artifact_claims").update({
        status:"no_drop", completed_at:new Date().toISOString()
      }).eq("claim_key",claimKey);
      continue;
    }

    const artifact = await grantBossArtifactTo(p, weights);
    await supabase.from("arcanum_artifact_claims").update({
      status:"completed",
      artifact_instance_id:artifact.id,
      completed_at:new Date().toISOString()
    }).eq("claim_key",claimKey);
  }
}

async function loadPayload(userId: string) {
  await closeExpiredBoss();
  await grantBossArtifactRewards();

  const [{ data: boss, error: bossError }, { data: top, error: topError }, { data: me, error: meError }] = await Promise.all([
    supabase
      .from("arcanum_world_boss_events")
      .select("event_id,boss_name,max_hp,current_hp,status,starts_at,ends_at,defeated_at")
      .eq("event_id", EVENT_ID)
      .single(),
    supabase
      .from("arcanum_world_boss_participants")
      .select("user_id,username,school_code,damage,attacks,reward_tier,reward_fragments,reward_granted_at")
      .eq("event_id", EVENT_ID)
      .order("damage", { ascending: false })
      .order("attacks", { ascending: true })
      .limit(20),
    supabase
      .from("arcanum_world_boss_participants")
      .select("user_id,username,school_code,damage,attacks,reward_tier,reward_fragments,reward_granted_at")
      .eq("event_id", EVENT_ID)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (bossError) throw bossError;
  if (topError) throw topError;
  if (meError) throw meError;

  let rank: number | null = null;
  if (me) {
    const { count, error } = await supabase
      .from("arcanum_world_boss_participants")
      .select("user_id", { count: "exact", head: true })
      .eq("event_id", EVENT_ID)
      .gt("damage", Number(me.damage || 0));
    if (error) throw error;
    rank = Number(count || 0) + 1;
  }


  let artifactReward:any = null;
  const { data: artifactClaim } = await supabase
    .from("arcanum_artifact_claims")
    .select("status,artifact_instance_id")
    .eq("claim_key", `boss:${EVENT_ID}:${userId}`)
    .maybeSingle();
  if (artifactClaim?.artifact_instance_id) {
    const { data: artifact } = await supabase
      .from("arcanum_player_artifacts")
      .select("id,artifact_id,category,rarity,source,equipped,acquired_at")
      .eq("id", artifactClaim.artifact_instance_id)
      .maybeSingle();
    artifactReward = artifact || null;
  }

  return { boss, top: top || [], me: me ? { ...me, rank } : null, artifact_reward: artifactReward, turn_cost: TURN_COST };
}

function attackDamage(netPower: number) {
  const power = Math.max(1, Math.floor(Number(netPower) || 1));
  const base = 500 + Math.sqrt(power) * 24;
  const variance = 0.88 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff * 0.24;
  return Math.max(650, Math.min(25000, Math.round(base * variance)));
}

function uuidLike(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function spendBossTurns(token: string) {
  const resp = await fetch(`${ARCANUM_URL}/rest/v1/rpc/run_economy`, {
    method: "POST",
    headers: {
      apikey: ARCANUM_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_action: "NONE", p_turns: TURN_COST }),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    let code = raw;
    try {
      const parsed = JSON.parse(raw);
      code = String(parsed?.message || parsed?.error || parsed?.details || raw);
    } catch {}
    throw new Response(code || "TURN_SPEND_FAILED", { status: 400 });
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });

  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "");
  if (req.method === "GET" && path.endsWith("/health")) {
    return json(req, { ok: true, service: "arcanum-boss", version: 1 });
  }

  try {
    const who = await identity(req);

    if (req.method === "GET") {
      return json(req, await loadPayload(who.userId));
    }

    if (req.method === "POST" && path.endsWith("/attack")) {
      const body = await req.json().catch(() => ({}));
      const attackId = body?.request_id;
      if (!uuidLike(attackId)) return json(req, { error: "INVALID_REQUEST_ID" }, 400);

      const { data: existing, error: existingError } = await supabase
        .from("arcanum_world_boss_attacks")
        .select("attack_id,user_id,event_id,damage")
        .eq("attack_id", attackId)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        if (existing.user_id !== who.userId || existing.event_id !== EVENT_ID) {
          return json(req, { error: "REQUEST_ID_CONFLICT" }, 409);
        }
        return json(req, {
          ...(await loadPayload(who.userId)),
          attack: { damage: existing.damage, duplicate: true }
        });
      }

      const { data: boss, error: bossError } = await supabase
        .from("arcanum_world_boss_events")
        .select("event_id,current_hp,status,starts_at,ends_at")
        .eq("event_id", EVENT_ID)
        .single();
      if (bossError) throw bossError;

      const now = Date.now();
      if (boss.status !== "active" || Number(boss.current_hp || 0) <= 0) {
        return json(req, { error: "BOSS_NOT_ACTIVE" }, 409);
      }
      if (now < new Date(boss.starts_at).getTime()) return json(req, { error: "BOSS_NOT_STARTED" }, 409);
      if (now >= new Date(boss.ends_at).getTime()) {
        await closeExpiredBoss();
        return json(req, { error: "BOSS_EVENT_ENDED" }, 409);
      }

      if (Number(who.realm?.turns || 0) < TURN_COST) {
        return json(req, { error: "NOT_ENOUGH_TURNS" }, 400);
      }

      const netPower = Math.max(0, Math.floor(Number(who.realm?.net_power || 0)));
      const damage = attackDamage(netPower);

      await spendBossTurns(who.token);

      let applied: any = null;
      let lastError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase.rpc("arcanum_world_boss_apply_attack", {
          p_attack_id: attackId,
          p_event_id: EVENT_ID,
          p_user_id: who.userId,
          p_username: who.username,
          p_school_code: who.schoolCode,
          p_damage: damage,
          p_net_power: netPower,
        });
        if (!error) {
          applied = data;
          lastError = null;
          break;
        }
        lastError = error;
      }
      if (lastError) throw lastError;

      return json(req, {
        ...(await loadPayload(who.userId)),
        attack: {
          damage: Number(applied?.damage || damage),
          duplicate: !!applied?.duplicate,
          net_power: netPower
        }
      }, 201);
    }

    return json(req, { error: "NOT_FOUND" }, 404);
  } catch (error) {
    if (error instanceof Response) {
      const text = await error.text();
      const known = [
        "NOT_ENOUGH_TURNS","BOSS_NOT_ACTIVE","BOSS_NOT_STARTED","BOSS_EVENT_ENDED",
        "REALM_REQUIRED","UNAUTHORIZED","INVALID_REQUEST_ID","REQUEST_ID_CONFLICT"
      ].find(code => text.includes(code));
      return json(req, { error: known || text || "REQUEST_FAILED" }, error.status || 500);
    }
    console.error(error);
    return json(req, { error: "SERVER_ERROR" }, 500);
  }
});
