// Registers the ARCANUM slash commands with Discord. Run it yourself, once, after creating the Discord application:
//
//   DISCORD_APP_ID=... DISCORD_BOT_TOKEN=... [DISCORD_GUILD_ID=...] node scripts/register-discord-commands.mjs
//
// With DISCORD_GUILD_ID the commands are registered for that server only (instant); without it they are global
// (can take up to an hour to appear). The interactions endpoint URL to paste in the Discord developer portal is:
//   https://<project-ref>.supabase.co/functions/v1/arcanum-discord

const appId = process.env.DISCORD_APP_ID;
const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!appId || !token) {
  console.error("Set DISCORD_APP_ID and DISCORD_BOT_TOKEN (and optionally DISCORD_GUILD_ID).");
  process.exit(1);
}

const commands = [
  {
    name: "vincular",
    description: "Vincula tu Discord con tu Arconte usando el código que muestra el juego",
    options: [{ type: 3, name: "codigo", description: "Código de 8 caracteres (✦ Suerte y Apoyo en el juego)", required: true, min_length: 8, max_length: 8 }],
  },
  { name: "suerte", description: "Reclama el favor de Lady Luck durante 24 horas (una vez al día)" },
  { name: "estado", description: "Muestra tu suerte activa y tu estatus de apoyo" },
];

const url = guildId
  ? `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
  : `https://discord.com/api/v10/applications/${appId}/commands`;

const res = await fetch(url, {
  method: "PUT",
  headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(commands),
});
const text = await res.text();
if (!res.ok) {
  console.error(`Discord answered ${res.status}: ${text}`);
  process.exit(1);
}
console.log(`Registered ${commands.length} commands ${guildId ? `for guild ${guildId}` : "globally"}.`);
