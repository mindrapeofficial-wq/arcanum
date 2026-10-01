import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const ARCANUM_URL = "https://mrmvmoyysxuopqexbxfk.supabase.co";
const ARCANUM_KEY = "sb_publishable_tZEPJi2v7Tp-xDuVa0qWRw_geizIGoD";

const ARTIFACTS = [{"id":"ember_vial","category":"minor","school":null},{"id":"moon_salt","category":"minor","school":null},{"id":"mirror_shard","category":"minor","school":null},{"id":"war_drum","category":"minor","school":null},{"id":"mana_crystal","category":"minor","school":null},{"id":"oracle_dice","category":"minor","school":null},{"id":"black_candle","category":"minor","school":null},{"id":"pilgrim_map","category":"minor","school":null},{"id":"griffin_feather","category":"minor","school":null},{"id":"sealed_letter","category":"minor","school":null},{"id":"star_ink","category":"minor","school":null},{"id":"obsidian_key","category":"minor","school":null},{"id":"silver_hourglass","category":"minor","school":null},{"id":"witch_bell","category":"minor","school":null},{"id":"hollow_coin","category":"minor","school":null},{"id":"thorn_seed","category":"minor","school":null},{"id":"storm_bottle","category":"minor","school":null},{"id":"dream_lens","category":"minor","school":null},{"id":"phoenix_ash","category":"minor","school":null},{"id":"rune_nail","category":"minor","school":null},{"id":"siren_shell","category":"minor","school":null},{"id":"dragon_scale","category":"minor","school":null},{"id":"sun_compass","category":"minor","school":null},{"id":"grave_lantern","category":"minor","school":null},{"id":"saint_thread","category":"minor","school":null},{"id":"glass_eye","category":"minor","school":null},{"id":"blood_quill","category":"minor","school":null},{"id":"winter_rose","category":"minor","school":null},{"id":"cinder_mask","category":"minor","school":null},{"id":"echo_flute","category":"minor","school":null},{"id":"verdant_crown","category":"school","school":"verdant"},{"id":"verdant_codex","category":"school","school":"verdant"},{"id":"verdant_seedheart","category":"school","school":"verdant"},{"id":"eradication_brand","category":"school","school":"eradication"},{"id":"eradication_furnace","category":"school","school":"eradication"},{"id":"eradication_banner","category":"school","school":"eradication"},{"id":"ascendant_halo","category":"school","school":"ascendant"},{"id":"ascendant_chalice","category":"school","school":"ascendant"},{"id":"ascendant_sunstone","category":"school","school":"ascendant"},{"id":"abyssal_eye","category":"school","school":"abyssal"},{"id":"abyssal_chain","category":"school","school":"abyssal"},{"id":"abyssal_whisper","category":"school","school":"abyssal"},{"id":"phantasm_mask","category":"school","school":"phantasm"},{"id":"phantasm_prism","category":"school","school":"phantasm"},{"id":"phantasm_veil","category":"school","school":"phantasm"},{"id":"cursed_ledger","category":"cursed","school":null},{"id":"widows_ring","category":"cursed","school":null},{"id":"hunger_idol","category":"cursed","school":null},{"id":"broken_crown","category":"cursed","school":null},{"id":"black_mirror","category":"cursed","school":null},{"id":"crown_five_voices","category":"unique","school":null},{"id":"eryndor_chalice","category":"unique","school":null},{"id":"staff_first_archmage","category":"unique","school":null},{"id":"sword_last_dawn","category":"unique","school":null},{"id":"atlas_unwritten","category":"unique","school":null},{"id":"throne_ashes","category":"unique","school":null},{"id":"orb_ninth_moon","category":"unique","school":null},{"id":"bell_worlds_end","category":"unique","school":null},{"id":"key_underworld","category":"unique","school":null},{"id":"heart_arcanum","category":"unique","school":null}] as const;

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
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
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
  const username = String(state?.realm?.mage_name || "").trim();
  if (!username) throw new Response("REALM_REQUIRED", { status: 403 });

  const schoolCode = String(state?.realm?.school_code || "").trim();
  if (!schoolCode) throw new Response("REALM_REQUIRED", { status: 403 });
  return { userId: String(user.id), username, schoolCode, token, realm: state?.realm || {} };
}

function routeParts(req: Request) {
  const path = new URL(req.url).pathname.replace(/\/+$/, "");
  const marker = "/arcanum-community";
  const tail = path.includes(marker) ? path.split(marker)[1] : path;
  return tail.split("/").filter(Boolean);
}


async function arcanumRpc(token: string, fn: string, args: Record<string, unknown> = {}) {
  const resp = await fetch(`${ARCANUM_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: ARCANUM_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const raw = await resp.text();
  if (!resp.ok) throw new Error(`ARCANUM_RPC_${fn}: ${raw}`);
  return raw ? JSON.parse(raw) : null;
}

function artifactCategoryPools(schoolCode: string) {
  const all = ARTIFACTS as readonly { id: string; category: string; school: string | null }[];
  return {
    minor: all.filter(x => x.category === "minor"),
    school: all.filter(x => x.category === "school" && x.school === schoolCode),
    cursed: all.filter(x => x.category === "cursed"),
    unique: all.filter(x => x.category === "unique"),
  };
}

function randomFrom<T>(rows: readonly T[]): T {
  return rows[Math.floor(Math.random() * rows.length)];
}

async function chooseArtifactDefinition(
  schoolCode: string,
  weights: { minor: number; school: number; cursed: number; unique: number }
) {
  const pools = artifactCategoryPools(schoolCode);
  let uniquePool = pools.unique;
  if (weights.unique > 0) {
    const { data: held, error } = await supabase
      .from("arcanum_player_artifacts")
      .select("artifact_id")
      .eq("category", "unique")
      .is("lost_at", null);
    if (error) throw error;
    const heldIds = new Set((held || []).map((x: any) => String(x.artifact_id)));
    uniquePool = pools.unique.filter(x => !heldIds.has(x.id));
  }

  const options = [
    { key: "minor", weight: Math.max(0, weights.minor), pool: pools.minor },
    { key: "school", weight: Math.max(0, weights.school), pool: pools.school.length ? pools.school : pools.minor },
    { key: "cursed", weight: Math.max(0, weights.cursed), pool: pools.cursed },
    { key: "unique", weight: uniquePool.length ? Math.max(0, weights.unique) : 0, pool: uniquePool },
  ].filter(x => x.weight > 0 && x.pool.length);

  const total = options.reduce((s, x) => s + x.weight, 0);
  let roll = Math.random() * total;
  let picked = options[0];
  for (const option of options) {
    roll -= option.weight;
    if (roll <= 0) { picked = option; break; }
  }
  return randomFrom(picked.pool);
}

async function grantArtifact(
  who: { userId: string; username: string; schoolCode: string },
  source: string,
  weights: { minor: number; school: number; cursed: number; unique: number },
  eventType = "discovered"
) {
  const chosen = await chooseArtifactDefinition(who.schoolCode, weights);
  const rarity =
    chosen.category === "unique" ? "world_unique" :
    chosen.category === "cursed" ? "cursed" :
    chosen.category === "school" ? "school_relic" : "relic";

  const { data: artifact, error } = await supabase
    .from("arcanum_player_artifacts")
    .insert({
      artifact_id: chosen.id,
      user_id: who.userId,
      username: who.username,
      school_code: who.schoolCode,
      category: chosen.category,
      rarity,
      source,
      equipped: false,
    })
    .select("id,artifact_id,category,rarity,source,equipped,acquired_at")
    .single();

  if (error) {
    // Another request may have claimed the same world-unique between selection and insert.
    if (String((error as any)?.code || "") === "23505" && chosen.category === "unique") {
      return grantArtifact(who, source, { minor: 74, school: 20, cursed: 6, unique: 0 }, eventType);
    }
    throw error;
  }

  await supabase.from("arcanum_artifact_history").insert({
    artifact_id: chosen.id,
    artifact_instance_id: artifact.id,
    user_id: who.userId,
    username: who.username,
    event_type: eventType,
    source,
  });

  return artifact;
}

async function finishArtifactClaim(
  claimKey: string,
  artifact: any | null,
  status: "completed" | "no_drop" | "rejected",
  extraMetadata: Record<string, unknown> = {}
) {
  const { data: row } = await supabase
    .from("arcanum_artifact_claims")
    .select("metadata")
    .eq("claim_key", claimKey)
    .maybeSingle();

  await supabase
    .from("arcanum_artifact_claims")
    .update({
      status,
      artifact_instance_id: artifact?.id || null,
      completed_at: new Date().toISOString(),
      metadata: { ...(row?.metadata || {}), ...extraMetadata },
    })
    .eq("claim_key", claimKey);
}

async function warmAstraelCapabilities(token: string) {
  const { data: cached } = await supabase
    .from("astrael_game_capabilities")
    .select("updated_at")
    .eq("singleton", true)
    .maybeSingle();

  const cachedAt = Date.parse(String(cached?.updated_at || ""));
  if (Number.isFinite(cachedAt) && Date.now() - cachedAt < 10 * 60 * 1000) return;

  const resp = await fetch(`${ARCANUM_URL}/rest/v1/`, {
    headers: {
      apikey: ARCANUM_KEY,
      Authorization: `Bearer ${token}`,
      Accept: "application/openapi+json",
    },
  });

  if (!resp.ok) {
    const detail = (await resp.text().catch(() => "")).slice(0, 500);
    await Promise.all([
      supabase.from("astrael_game_capabilities")
        .update({ updated_at:new Date().toISOString() })
        .eq("singleton", true),
      supabase.from("astrael_agent_log").insert({
        action:"capability_probe",
        reason:"Introspección autenticada del backend ARCANUM rechazada.",
        success:false,
        result:{
          status:resp.status,
          status_text:resp.statusText,
          content_type:resp.headers.get("content-type"),
          detail
        }
      })
    ]);
    return;
  }

  const schema = await resp.json().catch(() => null);
  const paths = schema && typeof schema === "object" ? Object.keys(schema.paths || {}) : [];
  const rpcNames = paths
    .filter((path:string) => path.startsWith("/rpc/"))
    .map((path:string) => path.slice(5))
    .filter(Boolean)
    .sort();
  const tableNames = paths
    .filter((path:string) => path.startsWith("/") && !path.startsWith("/rpc/") && path.split("/").filter(Boolean).length === 1)
    .map((path:string) => path.slice(1))
    .filter(Boolean)
    .sort();

  await Promise.all([
    supabase.from("astrael_game_capabilities").upsert({
      singleton:true,
      rpc_names:rpcNames,
      table_names:tableNames,
      updated_at:new Date().toISOString()
    }, { onConflict:"singleton" }),
    supabase.from("astrael_agent_log").insert({
      action:"capability_probe",
      reason:"Introspección autenticada del backend ARCANUM completada.",
      success:true,
      result:{ rpc_count:rpcNames.length, catalog_count:tableNames.length }
    })
  ]);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });

  const parts = routeParts(req);
  if (req.method === "GET" && parts[0] === "health") {
    return json(req, { ok: true, service: "arcanum-community", version: 1 });
  }

  try {
    const who = await identity(req);

    if (parts[0] === "presence") {
      if (req.method === "POST") {
        await warmAstraelCapabilities(who.token).catch(() => {});
        const { error } = await supabase
          .from("arcanum_presence")
          .upsert({ user_id: who.userId, username: who.username, school_code: who.schoolCode, last_seen: new Date().toISOString() }, { onConflict: "user_id" });
        if (error) throw error;
      }
      if (req.method === "GET" || req.method === "POST") {
        const cutoff = new Date(Date.now() - 3 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from("arcanum_presence")
          .select("user_id,username,school_code,last_seen")
          .gte("last_seen", cutoff)
          .order("last_seen", { ascending: false })
          .limit(100);
        if (error) throw error;
        return json(req, { online: data || [], me: who.userId });
      }
    }

    if (parts[0] === "messages") {
      if (req.method === "GET") {
        const url = new URL(req.url);
        const channel = url.searchParams.get("channel") === "school" ? "school" : "global";
        let q = supabase
          .from("arcanum_chat_messages")
          .select("id,user_id,username,message,created_at,channel,school_code")
          .is("deleted_at", null)
          .eq("channel", channel)
          .order("created_at", { ascending: false })
          .limit(80);
        if (channel === "school") q = q.eq("school_code", who.schoolCode);
        const { data, error } = await q;
        if (error) throw error;
        return json(req, { messages: (data || []).reverse(), me: who.userId });
      }

      if (req.method === "POST" && parts.length === 1) {
        const body = await req.json().catch(() => ({}));
        const channel = body?.channel === "school" ? "school" : "global";
        const message = String(body?.message || "").trim().replace(/\s+/g, " ");
        if (!message || message.length > 300) return json(req, { error: "INVALID_MESSAGE" }, 400);

        const { data: last } = await supabase
          .from("arcanum_chat_messages")
          .select("created_at")
          .eq("user_id", who.userId)
          .eq("channel", channel)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (last?.created_at && Date.now() - new Date(last.created_at).getTime() < 1400) {
          return json(req, { error: "RATE_LIMIT" }, 429);
        }

        const { data, error } = await supabase
          .from("arcanum_chat_messages")
          .insert({ user_id: who.userId, username: who.username, message, channel, school_code: channel === "school" ? who.schoolCode : null })
          .select("id,user_id,username,message,created_at,channel,school_code")
          .single();
        if (error) throw error;

        await supabase
          .from("arcanum_chat_messages")
          .delete()
          .lt("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

        return json(req, { message: data, me: who.userId }, 201);
      }

      if (req.method === "DELETE" && parts[1]) {
        const id = parts[1];
        const { data: row, error: findError } = await supabase
          .from("arcanum_chat_messages")
          .select("id,user_id")
          .eq("id", id)
          .is("deleted_at", null)
          .maybeSingle();
        if (findError) throw findError;
        if (!row) return json(req, { error: "NOT_FOUND" }, 404);
        if (row.user_id !== who.userId) return json(req, { error: "FORBIDDEN" }, 403);

        const { error } = await supabase
          .from("arcanum_chat_messages")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return json(req, { ok: true });
      }
    }

    if (parts[0] === "posts") {
      if (req.method === "GET") {
        const url = new URL(req.url);
        const category = String(url.searchParams.get("category") || "").toLowerCase();
        let q = supabase
          .from("arcanum_board_posts")
          .select("id,user_id,username,category,title,body,created_at,expires_at")
          .is("deleted_at", null)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(60);
        if (["general","diplomacia","reclutamiento","comercio","guerra"].includes(category)) q = q.eq("category", category);
        const { data, error } = await q;
        if (error) throw error;
        return json(req, { posts: data || [], me: who.userId });
      }

      if (req.method === "POST" && parts.length === 1) {
        const body = await req.json().catch(() => ({}));
        const category = String(body?.category || "general").toLowerCase();
        const title = String(body?.title || "").trim();
        const postBody = String(body?.body || "").trim();
        const categories = ["general","diplomacia","reclutamiento","comercio","guerra"];
        if (!categories.includes(category) || title.length < 3 || title.length > 80 || !postBody || postBody.length > 1200) {
          return json(req, { error: "INVALID_POST" }, 400);
        }

        const { data: last } = await supabase
          .from("arcanum_board_posts")
          .select("created_at")
          .eq("user_id", who.userId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (last?.created_at && Date.now() - new Date(last.created_at).getTime() < 10000) {
          return json(req, { error: "RATE_LIMIT" }, 429);
        }

        const { count } = await supabase
          .from("arcanum_board_posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", who.userId)
          .is("deleted_at", null)
          .gt("expires_at", new Date().toISOString());
        if ((count || 0) >= 5) return json(req, { error: "POST_LIMIT" }, 400);

        const { data, error } = await supabase
          .from("arcanum_board_posts")
          .insert({ user_id: who.userId, username: who.username, category, title, body: postBody })
          .select("id,user_id,username,category,title,body,created_at,expires_at")
          .single();
        if (error) throw error;
        return json(req, { post: data, me: who.userId }, 201);
      }

      if (req.method === "DELETE" && parts[1]) {
        const id = parts[1];
        const { data: row, error: findError } = await supabase
          .from("arcanum_board_posts")
          .select("id,user_id")
          .eq("id", id)
          .is("deleted_at", null)
          .maybeSingle();
        if (findError) throw findError;
        if (!row) return json(req, { error: "NOT_FOUND" }, 404);
        if (row.user_id !== who.userId) return json(req, { error: "FORBIDDEN" }, 403);
        const { error } = await supabase
          .from("arcanum_board_posts")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return json(req, { ok: true });
      }
    }




    if (parts[0] === "artifacts") {
      const allDefs = ARTIFACTS as readonly { id: string; category: string; school: string | null }[];

      if (req.method === "GET" && parts.length === 1) {
        const [
          { data: mine, error: mineError },
          { data: uniques, error: uniqueError },
          { data: history, error: historyError },
        ] = await Promise.all([
          supabase
            .from("arcanum_player_artifacts")
            .select("id,artifact_id,category,rarity,source,equipped,acquired_at")
            .eq("user_id", who.userId)
            .is("lost_at", null)
            .order("acquired_at", { ascending: false }),
          supabase
            .from("arcanum_player_artifacts")
            .select("id,artifact_id,username,school_code,source,acquired_at,equipped")
            .eq("category", "unique")
            .is("lost_at", null)
            .order("acquired_at", { ascending: false }),
          supabase
            .from("arcanum_artifact_history")
            .select("artifact_id,username,event_type,source,created_at")
            .order("created_at", { ascending: true })
            .limit(5000),
        ]);
        if (mineError) throw mineError;
        if (uniqueError) throw uniqueError;
        if (historyError) throw historyError;

        const discoveredById = new Map<string, any>();
        for (const row of history || []) {
          const artifactId = String((row as any)?.artifact_id || "");
          if (!artifactId || discoveredById.has(artifactId)) continue;
          discoveredById.set(artifactId, {
            artifact_id: artifactId,
            first_discovered_at: (row as any)?.created_at || null,
            first_discovered_by: (row as any)?.username || null,
            first_event_type: (row as any)?.event_type || null,
            first_source: (row as any)?.source || null,
          });
        }

        // Defensive fallback for artifacts that predate history logging.
        for (const row of [...(mine || []), ...(uniques || [])]) {
          const artifactId = String((row as any)?.artifact_id || "");
          if (!artifactId || discoveredById.has(artifactId)) continue;
          discoveredById.set(artifactId, {
            artifact_id: artifactId,
            first_discovered_at: (row as any)?.acquired_at || null,
            first_discovered_by: (row as any)?.username || who.username,
            first_event_type: "legacy_discovery",
            first_source: (row as any)?.source || "legacy",
          });
        }

        return json(req, {
          mine: mine || [],
          uniques: uniques || [],
          discovered: [...discoveredById.values()],
          discovered_count: discoveredById.size,
          catalog_size: allDefs.length,
          me: who.userId
        });
      }

      if (req.method === "GET" && parts[1] === "history" && parts[2]) {
        const artifactId = String(parts[2] || "");
        const { data, error } = await supabase
          .from("arcanum_artifact_history")
          .select("id,artifact_id,username,event_type,source,created_at")
          .eq("artifact_id", artifactId)
          .order("created_at", { ascending: false })
          .limit(80);
        if (error) throw error;
        return json(req, { history: data || [] });
      }

      if (req.method === "POST" && parts[1] === "equip" && parts[2]) {
        const id = String(parts[2]);
        const { data: row, error: findError } = await supabase
          .from("arcanum_player_artifacts")
          .select("id,user_id,artifact_id,equipped")
          .eq("id", id)
          .is("lost_at", null)
          .maybeSingle();
        if (findError) throw findError;
        if (!row) return json(req, { error: "NOT_FOUND" }, 404);
        if (row.user_id !== who.userId) return json(req, { error: "FORBIDDEN" }, 403);

        await supabase
          .from("arcanum_player_artifacts")
          .update({ equipped: false })
          .eq("user_id", who.userId)
          .is("lost_at", null);

        const { error } = await supabase
          .from("arcanum_player_artifacts")
          .update({ equipped: true })
          .eq("id", id);
        if (error) throw error;

        await supabase.from("arcanum_artifact_history").insert({
          artifact_id: row.artifact_id,
          artifact_instance_id: row.id,
          user_id: who.userId,
          username: who.username,
          event_type: "equipped",
          source: "inventory"
        });
        return json(req, { ok: true });
      }

      // Exploration is a two-step verified claim. We snapshot the realm before exploring,
      // then verify that land really increased before rolling an artifact.
      if (req.method === "POST" && parts[1] === "exploration" && parts[2] === "start") {
        const body = await req.json().catch(() => ({}));
        const turns = Math.max(1, Math.min(50, Math.floor(Number(body?.turns || 1))));
        const activeCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { data: activeClaim, error: activeClaimError } = await supabase
          .from("arcanum_artifact_claims")
          .select("claim_key")
          .eq("user_id", who.userId)
          .eq("source", "exploration")
          .eq("status", "started")
          .gte("created_at", activeCutoff)
          .limit(1)
          .maybeSingle();
        if (activeClaimError) throw activeClaimError;
        if (activeClaim) return json(req, { error: "EXPLORATION_CLAIM_ACTIVE" }, 409);
        const id = crypto.randomUUID();
        const claimKey = `exploration:${id}`;
        const { error } = await supabase.from("arcanum_artifact_claims").insert({
          claim_key: claimKey,
          user_id: who.userId,
          username: who.username,
          school_code: who.schoolCode,
          source: "exploration",
          metadata: {
            requested_turns: turns,
            turns_before: Number(who.realm?.turns || 0),
            land_before: Number(who.realm?.land || 0),
          },
        });
        if (error) throw error;
        return json(req, { claim_key: claimKey }, 201);
      }

      if (req.method === "POST" && parts[1] === "exploration" && parts[2] === "complete") {
        const body = await req.json().catch(() => ({}));
        const claimKey = String(body?.claim_key || "");
        const { data: claim, error: claimError } = await supabase
          .from("arcanum_artifact_claims")
          .select("claim_key,user_id,status,metadata,created_at,artifact_instance_id")
          .eq("claim_key", claimKey)
          .maybeSingle();
        if (claimError) throw claimError;
        if (!claim || claim.user_id !== who.userId || claim.status !== "started") {
          return json(req, { error: "INVALID_EXPLORATION_CLAIM" }, 409);
        }
        if (Date.now() - new Date(claim.created_at).getTime() > 10 * 60 * 1000) {
          await finishArtifactClaim(claimKey, null, "rejected", { reason: "expired" });
          return json(req, { error: "EXPLORATION_CLAIM_EXPIRED" }, 409);
        }

        const landBefore = Number(claim.metadata?.land_before || 0);
        const landAfter = Number(who.realm?.land || 0);
        const landGain = Math.max(0, landAfter - landBefore);
        const requestedTurns = Math.max(1, Number(claim.metadata?.requested_turns || 1));
        const turnsBefore = Number(claim.metadata?.turns_before || 0);
        const turnsAfter = Number(who.realm?.turns || 0);
        const turnsSpent = Math.max(0, turnsBefore - turnsAfter);

        if (landGain <= 0 || turnsSpent + 1 < requestedTurns) {
          await finishArtifactClaim(claimKey, null, "rejected", { reason: "exploration_not_verified", land_gain: landGain, turns_spent: turnsSpent });
          return json(req, { error: "EXPLORATION_NOT_VERIFIED" }, 409);
        }

        const chance = Math.min(0.58, 0.055 + requestedTurns * 0.022 + Math.min(landGain, 60) * 0.0015);
        if (Math.random() > chance) {
          await finishArtifactClaim(claimKey, null, "no_drop", { land_gain: landGain, chance });
          return json(req, { drop: null, land_gain: landGain, chance });
        }

        const artifact = await grantArtifact(
          who,
          "exploration",
          requestedTurns >= 10
            ? { minor: 78, school: 16, cursed: 5, unique: 1 }
            : { minor: 84, school: 13, cursed: 3, unique: 0 },
          "found_exploring"
        );
        await finishArtifactClaim(claimKey, artifact, "completed", { land_gain: landGain, chance });
        return json(req, { drop: artifact, land_gain: landGain, chance }, 201);
      }

      // PvP claims are verified against the authoritative ARCANUM battle history.
      if (req.method === "POST" && parts[1] === "pvp" && parts[2] === "claim") {
        const body = await req.json().catch(() => ({}));
        const battleId = String(body?.battle_id || "");
        if (!battleId) return json(req, { error: "BATTLE_ID_REQUIRED" }, 400);
        const claimKey = `pvp:${battleId}:${who.userId}`;

        const { data: existingClaim } = await supabase
          .from("arcanum_artifact_claims")
          .select("status,artifact_instance_id,metadata")
          .eq("claim_key", claimKey)
          .maybeSingle();
        if (existingClaim) return json(req, { already_claimed: true, claim: existingClaim });

        const reports = await arcanumRpc(who.token, "my_battle_reports", { p_limit: 50 });
        const battle = (Array.isArray(reports) ? reports : []).find((x: any) => String(x?.battle_id || "") === battleId);
        if (!battle) return json(req, { error: "BATTLE_NOT_VERIFIED" }, 404);
        if (String(battle.result || "") !== "VICTORY") {
          return json(req, { error: "VICTORY_REQUIRED" }, 409);
        }

        const mode = String(battle.mode || "REGULAR");
        const landChange = Number(battle.land_change || 0);
        const opponent = String(battle.opponent_mage_name || "");

        await supabase.from("arcanum_artifact_claims").insert({
          claim_key: claimKey,
          user_id: who.userId,
          username: who.username,
          school_code: who.schoolCode,
          source: "pvp",
          metadata: { battle_id: battleId, mode, land_change: landChange, opponent },
        });

        // A successful Siege can physically move a world-unique from the defeated realm.
        if (mode === "SIEGE" && landChange > 0 && opponent && Math.random() < 0.06) {
          const { data: captured, error: capError } = await supabase
            .from("arcanum_player_artifacts")
            .select("id,artifact_id,user_id,username,category")
            .eq("category", "unique")
            .is("lost_at", null)
            .ilike("username", opponent)
            .limit(1)
            .maybeSingle();
          if (capError) throw capError;

          if (captured) {
            const previousUserId = captured.user_id;
            const previousUsername = captured.username;
            const { data: moved, error: moveError } = await supabase
              .from("arcanum_player_artifacts")
              .update({
                user_id: who.userId,
                username: who.username,
                school_code: who.schoolCode,
                equipped: false,
                source: "pvp_siege",
                acquired_at: new Date().toISOString(),
              })
              .eq("id", captured.id)
              .eq("user_id", previousUserId)
              .select("id,artifact_id,category,rarity,source,equipped,acquired_at")
              .maybeSingle();
            if (moveError) throw moveError;

            if (moved) {
              await supabase.from("arcanum_artifact_history").insert([
                {
                  artifact_id: captured.artifact_id,
                  artifact_instance_id: captured.id,
                  user_id: previousUserId,
                  username: previousUsername,
                  event_type: "lost_in_siege",
                  source: `battle:${battleId}`,
                },
                {
                  artifact_id: captured.artifact_id,
                  artifact_instance_id: captured.id,
                  user_id: who.userId,
                  username: who.username,
                  event_type: "captured_in_siege",
                  source: `battle:${battleId}`,
                },
              ]);
              await finishArtifactClaim(claimKey, moved, "completed", { captured_unique: true });
              return json(req, { drop: moved, captured_unique: true, opponent }, 201);
            }
          }
        }

        const chance = mode === "SIEGE" && landChange > 0 ? 0.24 : 0.12;
        if (Math.random() > chance) {
          await finishArtifactClaim(claimKey, null, "no_drop", { chance });
          return json(req, { drop: null, chance });
        }

        const artifact = await grantArtifact(
          who,
          "pvp",
          mode === "SIEGE"
            ? { minor: 70, school: 23, cursed: 7, unique: 0 }
            : { minor: 82, school: 15, cursed: 3, unique: 0 },
          "won_in_battle"
        );
        await finishArtifactClaim(claimKey, artifact, "completed", { chance });
        return json(req, { drop: artifact, chance }, 201);
      }

      // Relic market: atomic artifact-for-artifact barter. No external resource balance is trusted.
      if (parts[1] === "market") {
        if (req.method === "GET" && parts.length === 2) {
          await supabase
            .from("arcanum_artifact_market_listings")
            .update({ status: "expired", closed_at: new Date().toISOString() })
            .eq("status", "open")
            .lte("expires_at", new Date().toISOString());

          const { data: listings, error } = await supabase
            .from("arcanum_artifact_market_listings")
            .select("id,artifact_instance_id,seller_user_id,seller_username,seller_school_code,want_category,status,created_at,expires_at")
            .eq("status", "open")
            .gt("expires_at", new Date().toISOString())
            .order("created_at", { ascending: false })
            .limit(80);
          if (error) throw error;

          const instanceIds = (listings || []).map((x: any) => x.artifact_instance_id);
          let artifactsById = new Map<string, any>();
          if (instanceIds.length) {
            const { data: listedArtifacts, error: listedError } = await supabase
              .from("arcanum_player_artifacts")
              .select("id,artifact_id,category,rarity,username,school_code,equipped")
              .in("id", instanceIds)
              .is("lost_at", null);
            if (listedError) throw listedError;
            artifactsById = new Map((listedArtifacts || []).map((x: any) => [String(x.id), x]));
          }

          const { data: mine, error: mineError } = await supabase
            .from("arcanum_player_artifacts")
            .select("id,artifact_id,category,rarity,equipped,acquired_at")
            .eq("user_id", who.userId)
            .is("lost_at", null)
            .order("acquired_at", { ascending: false });
          if (mineError) throw mineError;

          return json(req, {
            listings: (listings || []).map((x: any) => ({ ...x, artifact: artifactsById.get(String(x.artifact_instance_id)) || null })),
            mine: mine || [],
            me: who.userId,
          });
        }

        if (req.method === "POST" && parts.length === 2) {
          const body = await req.json().catch(() => ({}));
          const artifactInstanceId = String(body?.artifact_instance_id || "");
          const wantCategory = String(body?.want_category || "");
          if (!["minor","school","cursed","unique"].includes(wantCategory)) {
            return json(req, { error: "INVALID_WANT_CATEGORY" }, 400);
          }

          const { data: artifact, error: artifactError } = await supabase
            .from("arcanum_player_artifacts")
            .select("id,user_id,artifact_id,category,equipped,lost_at")
            .eq("id", artifactInstanceId)
            .maybeSingle();
          if (artifactError) throw artifactError;
          if (!artifact || artifact.user_id !== who.userId || artifact.lost_at) return json(req, { error: "ARTIFACT_NOT_OWNED" }, 403);
          if (artifact.equipped) return json(req, { error: "UNEQUIP_BEFORE_MARKET" }, 409);

          const { data: listing, error } = await supabase
            .from("arcanum_artifact_market_listings")
            .insert({
              artifact_instance_id: artifactInstanceId,
              seller_user_id: who.userId,
              seller_username: who.username,
              seller_school_code: who.schoolCode,
              want_category: wantCategory,
            })
            .select("id,artifact_instance_id,want_category,status,created_at,expires_at")
            .single();
          if (error) {
            if (String((error as any)?.code || "") === "23505") return json(req, { error: "ARTIFACT_ALREADY_LISTED" }, 409);
            throw error;
          }
          return json(req, { listing }, 201);
        }

        if (req.method === "DELETE" && parts[2]) {
          const listingId = String(parts[2]);
          const { data: listing, error: findError } = await supabase
            .from("arcanum_artifact_market_listings")
            .select("id,seller_user_id,status")
            .eq("id", listingId)
            .maybeSingle();
          if (findError) throw findError;
          if (!listing) return json(req, { error: "NOT_FOUND" }, 404);
          if (listing.seller_user_id !== who.userId) return json(req, { error: "FORBIDDEN" }, 403);
          if (listing.status !== "open") return json(req, { error: "LISTING_NOT_OPEN" }, 409);

          const { error } = await supabase
            .from("arcanum_artifact_market_listings")
            .update({ status: "cancelled", closed_at: new Date().toISOString() })
            .eq("id", listingId);
          if (error) throw error;
          return json(req, { ok: true });
        }

        if (req.method === "POST" && parts[2] && parts[3] === "accept") {
          const listingId = String(parts[2]);
          const body = await req.json().catch(() => ({}));
          const offeredInstanceId = String(body?.offered_instance_id || "");
          if (!offeredInstanceId) return json(req, { error: "OFFERED_ARTIFACT_REQUIRED" }, 400);

          const { data, error } = await supabase.rpc("arcanum_artifact_swap", {
            p_listing_id: listingId,
            p_buyer_user_id: who.userId,
            p_buyer_username: who.username,
            p_buyer_school_code: who.schoolCode,
            p_offered_instance_id: offeredInstanceId,
          });
          if (error) {
            const msg = String((error as any)?.message || error);
            const known = [
              "LISTING_NOT_FOUND","LISTING_NOT_OPEN","CANNOT_BUY_OWN_LISTING",
              "SELLER_ARTIFACT_UNAVAILABLE","SELLER_ARTIFACT_EQUIPPED",
              "BUYER_ARTIFACT_UNAVAILABLE","BUYER_ARTIFACT_EQUIPPED","BUYER_ARTIFACT_LISTED","WRONG_ARTIFACT_CATEGORY"
            ].find(x => msg.includes(x));
            return json(req, { error: known || "MARKET_SWAP_FAILED" }, 409);
          }
          return json(req, { swap: data }, 201);
        }
      }

      // Kept for beta QA only. The UI no longer exposes it.
      if (req.method === "POST" && parts[1] === "discover") {
        const artifact = await grantArtifact(who, "beta_discovery", { minor: 70, school: 22, cursed: 6.5, unique: 1.5 });
        return json(req, { artifact }, 201);
      }
    }

    if (parts[0] === "market") {
      const knownMarketError = (error: unknown) => {
        const msg = String((error as any)?.message || error || "");
        const codes = [
          "INVALID_OFFER","MARKET_OFFER_LIMIT","MARKET_OFFER_NOT_FOUND","MARKET_OFFER_NOT_OPEN",
          "MARKET_OFFER_EXPIRED","CANNOT_ACCEPT_OWN_OFFER","MARKET_SEASON_MISMATCH",
          "MARKET_SELLER_REALM_MISSING","MARKET_SELLER_NOT_ALIVE",
          "SELLER_NOT_ENOUGH_GOLD","SELLER_NOT_ENOUGH_MANA","SELLER_NOT_ENOUGH_POPULATION",
          "BUYER_NOT_ENOUGH_GOLD","BUYER_NOT_ENOUGH_MANA","BUYER_NOT_ENOUGH_POPULATION",
          "NOT_ENOUGH_GOLD","NOT_ENOUGH_MANA","NOT_ENOUGH_POPULATION",
          "MAGE_NOT_ALIVE","REALM_NOT_FOUND","FORBIDDEN"
        ];
        return codes.find(code => msg.includes(code)) || "MARKET_OPERATION_FAILED";
      };

      if (req.method === "GET" && parts.length === 1) {
        try {
          const data = await arcanumRpc(who.token, "market_list", {});
          return json(req, data || { offers: [], me: who.userId });
        } catch (error) {
          return json(req, { error: knownMarketError(error) }, 409);
        }
      }

      if (req.method === "POST" && parts.length === 1) {
        const body = await req.json().catch(() => ({}));
        try {
          const data = await arcanumRpc(who.token, "market_create", {
            p_offer_resource: String(body?.offer_resource || ""),
            p_offer_amount: Math.floor(Number(body?.offer_amount || 0)),
            p_want_resource: String(body?.want_resource || ""),
            p_want_amount: Math.floor(Number(body?.want_amount || 0)),
            p_note: String(body?.note || "").trim().slice(0, 180),
          });
          return json(req, data, 201);
        } catch (error) {
          const code = knownMarketError(error);
          return json(req, { error: code }, code === "INVALID_OFFER" || code === "MARKET_OFFER_LIMIT" ? 400 : 409);
        }
      }

      if (req.method === "DELETE" && parts[1]) {
        try {
          const data = await arcanumRpc(who.token, "market_cancel", { p_offer_id: String(parts[1]) });
          return json(req, data || { ok: true });
        } catch (error) {
          return json(req, { error: knownMarketError(error) }, 409);
        }
      }

      if (req.method === "POST" && parts[1] && parts[2] === "accept") {
        try {
          const data = await arcanumRpc(who.token, "market_accept", { p_offer_id: String(parts[1]) });
          return json(req, { trade: data }, 201);
        } catch (error) {
          return json(req, { error: knownMarketError(error) }, 409);
        }
      }
    }

    return json(req, { error: "NOT_FOUND" }, 404);
  } catch (error) {
    if (error instanceof Response) {
      const text = await error.text();
      return json(req, { error: text || "REQUEST_FAILED" }, error.status || 500);
    }
    console.error(error);
    return json(req, { error: "SERVER_ERROR" }, 500);
  }
});
