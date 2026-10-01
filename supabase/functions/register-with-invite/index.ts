
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email, password, inviteCode } = await req.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof inviteCode !== "string"
    ) {
      return new Response(JSON.stringify({ error: "Datos de registro incompletos." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = inviteCode.trim().toUpperCase();

    if (!cleanEmail.includes("@") || password.length < 8 || cleanCode.length < 10) {
      return new Response(JSON.stringify({ error: "Revisa el correo, la contraseña y el código." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Configuración del servidor incompleta.");
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { arcanum_invite_signup: true },
    });

    if (createError || !created.user) {
      return new Response(
        JSON.stringify({
          error: createError?.message?.toLowerCase().includes("already")
            ? "Ya existe una cuenta con ese correo."
            : "No se pudo crear la cuenta.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const userId = created.user.id;

    const { data: redeemed, error: redeemError } = await admin.rpc(
      "redeem_invite_for_user",
      { p_code: cleanCode, p_user_id: userId },
    );

    if (redeemError || redeemed !== true) {
      await admin.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: "Código de invitación inválido, usado o caducado." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Cuenta creada. Ya puedes entrar." }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch {
    return new Response(JSON.stringify({ error: "No se pudo completar el registro." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
