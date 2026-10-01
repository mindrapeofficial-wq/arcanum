import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Discord Interactions endpoint for ARCANUM (slash commands):
//   /vincular codigo:<code>  links the Discord account to the Arconte using a code shown in the game
//   /suerte                  claims Lady Luck for 24 h, once per day (Madrid day), guaranteed
//   /estado                  shows luck, supporter tier and next claim
//
// Required secrets: DISCORD_PUBLIC_KEY (application public key).
// Optional (supporter role sync): DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_SUPPORTER_ROLE_ID, DISCORD_PATRON_ROLE_ID.
// Deploy WITHOUT JWT verification (Discord does not send one); every request is authenticated by Ed25519 signature.

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const PUBLIC_KEY = (Deno.env.get("DISCORD_PUBLIC_KEY") || "").trim();
const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") || "";
const GUILD_ID = Deno.env.get("DISCORD_GUILD_ID") || "";
const SUPPORTER_ROLE_ID = Deno.env.get("DISCORD_SUPPORTER_ROLE_ID") || "";
const PATRON_ROLE_ID = Deno.env.get("DISCORD_PATRON_ROLE_ID") || "";
const MAX_SKEW_SECONDS = 300;

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function verifySignature(req: Request, body: string): Promise<boolean> {
  const signature = hexToBytes(req.headers.get("x-signature-ed25519") || "");
  const timestamp = req.headers.get("x-signature-timestamp") || "";
  const key = hexToBytes(PUBLIC_KEY);
  if (!signature || !key || !timestamp) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > MAX_SKEW_SECONDS) return false;
  try {
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "Ed25519" }, false, ["verify"]);
    return await crypto.subtle.verify("Ed25519", cryptoKey, signature, new TextEncoder().encode(timestamp + body));
  } catch {
    return false;
  }
}

function reply(content: string) {
  return Response.json({ type: 4, data: { content, flags: 64, allowed_mentions: { parse: [] } } });
}

function unix(iso: string | null | undefined): number | null {
  const ms = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

function friendly(message: string): string {
  const m = String(message || "");
  if (m.includes("INVALID_OR_EXPIRED_CODE")) return "Ese código no existe o ha caducado. Genera uno nuevo en el juego (✦ Suerte y Apoyo).";
  if (m.includes("DISCORD_ALREADY_LINKED")) return "Esta cuenta de Discord ya está vinculada a un Arconte.";
  if (m.includes("USER_ALREADY_LINKED")) return "Tu Arconte ya está vinculado a otra cuenta de Discord. Desvincúlalo antes en el juego.";
  if (m.includes("NOT_LINKED")) return "Aún no has vinculado tu Arconte. Genera un código en el juego y usa `/vincular`.";
  return "No he podido completar la acción ahora mismo. Inténtalo de nuevo en unos minutos.";
}

// Best-effort: never blocks or fails the command if the bot token or roles are not configured.
async function syncSupporterRole(discordId: string, tier: string | null) {
  if (!BOT_TOKEN || !GUILD_ID) return;
  const roles: Array<[string, boolean]> = [
    [SUPPORTER_ROLE_ID, tier === "supporter" || tier === "patron"],
    [PATRON_ROLE_ID, tier === "patron"],
  ];
  for (const [roleId, want] of roles) {
    if (!roleId) continue;
    try {
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`, {
        method: want ? "PUT" : "DELETE",
        headers: { Authorization: `Bot ${BOT_TOKEN}`, "X-Audit-Log-Reason": "ARCANUM supporter status sync" },
      });
    } catch (_) { /* ignore */ }
  }
}

async function handleCommand(interaction: any) {
  const user = interaction.member?.user || interaction.user;
  const discordId = String(user?.id || "");
  const discordName = String(user?.global_name || user?.username || "");
  if (!/^[0-9]{5,25}$/.test(discordId)) return reply("No he podido identificar tu cuenta de Discord.");
  const name = String(interaction.data?.name || "");

  if (name === "vincular") {
    const code = String(interaction.data?.options?.find((o: any) => o.name === "codigo")?.value || "").trim();
    if (!code) return reply("Indica el código que te muestra el juego: `/vincular codigo:ABC12345`.");
    const { data, error } = await db.rpc("redeem_discord_link", { p_code: code, p_discord_id: discordId, p_discord_name: discordName });
    if (error) return reply(friendly(error.message));
    const status = await db.rpc("discord_status", { p_discord_id: discordId });
    await syncSupporterRole(discordId, status.data?.tier ?? null);
    return reply(`✦ Vinculado con **${data?.mage_name || "tu Arconte"}**. Usa \`/suerte\` una vez al día para recibir el favor de Lady Luck.`);
  }

  if (name === "suerte") {
    const { data, error } = await db.rpc("discord_claim_luck", { p_discord_id: discordId });
    if (error) return reply(friendly(error.message));
    if (data?.granted) {
      const until = unix(data.expires_at);
      return reply(`🍀 Lady Luck te sonríe${until ? ` hasta <t:${until}:f> (<t:${until}:R>)` : " durante 24 horas"}.\n+5 % de éxito al invocar y +10 % de tierra al explorar. Los efectos no se acumulan.`);
    }
    const next = unix(data?.next_at);
    return reply(`Ya has reclamado la suerte de hoy.${next ? ` Podrás volver a hacerlo <t:${next}:R>.` : ""}`);
  }

  if (name === "estado") {
    const { data, error } = await db.rpc("discord_status", { p_discord_id: discordId });
    if (error) return reply(friendly(error.message));
    await syncSupporterRole(discordId, data?.tier ?? null);
    const until = unix(data?.luck_expires_at);
    const tierLabel = data?.tier === "patron" ? "Mecenas" : data?.tier === "supporter" ? "Colaborador" : "Sin estatus de apoyo";
    return reply(
      `**${data?.mage_name || "Arconte"}**\n` +
      `🍀 Suerte: ${data?.luck_active && until ? `activa hasta <t:${until}:R>` : "inactiva (usa `/suerte`)"}\n` +
      `✦ Apoyo: ${tierLabel}`,
    );
  }

  return reply("Comando desconocido.");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!PUBLIC_KEY) return new Response("Not configured", { status: 500 });
  const body = await req.text();
  if (!(await verifySignature(req, body))) return new Response("Invalid request signature", { status: 401 });

  let interaction: any;
  try { interaction = JSON.parse(body); } catch { return new Response("Bad request", { status: 400 }); }

  if (interaction.type === 1) return Response.json({ type: 1 }); // PING
  if (interaction.type === 2) {
    try { return await handleCommand(interaction); }
    catch (_) { return reply("No he podido completar la acción ahora mismo. Inténtalo de nuevo en unos minutos."); }
  }
  return new Response("Unsupported interaction", { status: 400 });
});
