
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return Response.json({ error: "Método no permitido." }, { status: 405, headers: cors });
  }

  let createdUserId: string | null = null;

  try {
    const body = await req.json();
    const username = String(body?.username ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (username.length < 3 || username.length > 24) {
      return Response.json({ error: "El nombre de usuario debe tener entre 3 y 24 caracteres." }, { status: 400, headers: cors });
    }
    if (!/^[\p{L}\p{N}_. -]+$/u.test(username)) {
      return Response.json({ error: "El nombre de usuario contiene caracteres no permitidos." }, { status: 400, headers: cors });
    }
    // Staff-looking names are reserved so nobody can impersonate the admin, the AI archmage or the game itself.
    const folded = username.normalize("NFKC").toLowerCase().replace(/[\s._-]+/g, "");
    const reservedExact = new Set(["admin", "administrador", "administrator", "moderador", "moderator", "soporte", "support", "staff", "sistema", "system", "gm"]);
    const reservedPrefix = ["admin", "galante", "astrael", "arcanum", "moderador"];
    if (reservedExact.has(folded) || reservedPrefix.some((p) => folded.startsWith(p))) {
      return Response.json({ error: "Ese nombre de usuario está reservado." }, { status: 400, headers: cors });
    }
    if (!email.includes("@")) {
      return Response.json({ error: "Introduce un correo válido." }, { status: 400, headers: cors });
    }
    if (password.length < 8) {
      return Response.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400, headers: cors });
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Configuración del servidor incompleta.");

    const admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const existing = await admin
      .from("players")
      .select("id")
      .ilike("display_name", username)
      .limit(1);

    if (existing.data?.length) {
      return Response.json({ error: "Ese nombre de usuario ya está en uso." }, { status: 409, headers: cors });
    }

    const { data, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username }
    });

    if (createError || !data.user) {
      const msg = createError?.message?.toLowerCase() ?? "";
      return Response.json({
        error: msg.includes("already") || msg.includes("registered")
          ? "Ya existe una cuenta con ese correo."
          : "No se pudo crear la cuenta."
      }, { status: 400, headers: cors });
    }

    createdUserId = data.user.id;

    const { error: profileError } = await admin
      .from("players")
      .insert({ id: createdUserId, display_name: username });

    if (profileError) {
      await admin.auth.admin.deleteUser(createdUserId);
      createdUserId = null;

      const msg = profileError.message?.toLowerCase() ?? "";
      return Response.json({
        error: msg.includes("duplicate") || msg.includes("unique")
          ? "Ese nombre de usuario ya está en uso."
          : "No se pudo crear el perfil."
      }, { status: 409, headers: cors });
    }

    return Response.json({ ok: true, username }, { status: 200, headers: cors });
  } catch {
    if (createdUserId) {
      try {
        const url = Deno.env.get("SUPABASE_URL")!;
        const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
        await admin.auth.admin.deleteUser(createdUserId);
      } catch {}
    }
    return Response.json({ error: "No se pudo completar el registro." }, { status: 500, headers: cors });
  }
});
