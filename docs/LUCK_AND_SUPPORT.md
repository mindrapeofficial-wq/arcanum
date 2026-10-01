# ARCANUM — Lady Luck, Supporting status and Discord

Status: implemented in the repo, **not deployed**. Nothing here has been applied to the production database or functions yet; see *Deployment checklist*.
Inspired by The Reincarnation (Guildwar): its Lady Luck's favour and its "supporting mage" status.

## 1. Lady Luck (server canonical)

| Rule | Value |
| --- | --- |
| Duration | 24 hours (`arcanum_luck.expires_at`) |
| Stacking | None. A new grant only extends the expiry up to `now()+24h`, never shortens it |
| Sources | `discord` (daily command), `vote`, `event`, `admin` (the table accepts all four; only `discord` and `admin` have a way in today) |
| Summoning | +5 points of success chance in `cast_summon_impl` (capped at 100%) |
| Exploration | +10% land per exploration turn in `explore_impl`, with probabilistic rounding (rolls are 4–8, a plain `floor` would hide the bonus) |
| Not implemented | Reincarnation also gives +5% concentration, +2% item generation, −10% enemy dispel resistance and Deck of Destinies range. Arcanum has none of those mechanics, so they are intentionally absent |

The effects live in the Core (the client only displays them), patched into the live functions with the same "abort if the text moved" pattern as earlier migrations.

`my_luck_status()` returns `{active, expires_at, seconds_left, source, bonuses}` for the caller.

### Reincarnation facts this is based on
Luck lasts 24 h and does not stack. Obtained by voting on external sites (35% chance per vote, once per site per day), by a guaranteed once-a-day Discord command after registering the mage, or from a god. Effects: +5% summoning, +5% concentration, +2% item generation, +10% land explored, −10% dispel cost, Deck of Destinies range. The god version ("Star of Luck") adds +3% accuracy. Bad luck is the reverse, except exploration.

## 2. Discord linking and commands

Flow: the player opens **✦ Suerte y Apoyo** in the game → *Generar código* (`create_discord_link_code`, 8 chars, 15 min, one live code per account, 10 s rate limit) → types `/vincular codigo:XXXXXXXX` in the Discord server.

| Command | What it does |
| --- | --- |
| `/vincular codigo` | Redeems the code (`redeem_discord_link`): one Discord account ↔ one Arconte, both directions unique |
| `/suerte` | `discord_claim_luck`: grants 24 h of luck, guaranteed, **once per Madrid day** (same day boundary as the Arena) |
| `/estado` | `discord_status`: mage, luck, supporter tier; also syncs the supporter role when a bot token is configured |

The Edge Function `arcanum-discord` authenticates every request by **Ed25519 signature** (`x-signature-ed25519` + `x-signature-timestamp`), rejects timestamps older than 5 minutes and answers ephemerally. It carries no player JWT: the RPCs it calls are service-role only.

## 3. Supporting status

Derived from credit points (`arcanum_supporters.credit_points`), granted by an admin after a donation (`supporter:grant` in `arcanum-admin`, always audited, ledger in `arcanum_supporter_ledger`).

| Tier | Points | Reincarnation equivalent |
| --- | --- | --- |
| Colaborador (`supporter`) | ≥ 2 | supporting mage (2 credit points) |
| Mecenas (`patron`) | ≥ 15 | supporting guild (15 credit points) |

**Design rule: supporting never sells power.** Perks are identity and convenience only:
- Badge in the game.
- Private notes stored in the server (`arcanum_player_notes`, ≤ 4,000 chars, gated by `SUPPORTER_REQUIRED`).
- Supporter role in Discord (needs the bot token, see below).

Reincarnation also locks its battle simulator and stack calculator behind supporting. Arcanum deliberately keeps the formation calculator **free**.

Not done yet: showing the badge to *other* players (needs `player_profile` / rankings to expose a boolean) and per-guild supporting status.

## 4. Deployment checklist (nothing here has been done)

1. **Database:** apply `supabase/migrations/20261001180000_luck_supporters_discord.sql`.
   - It was dry-run against the live database inside a transaction that was force-rolled back (structure, permissions, luck, Discord flow, supporters and a 50-turn exploration with and without luck all passed; nothing persisted).
   - Re-run `supabase/tests/luck_supporters.sql` after applying: it ends by raising an exception, so it never commits.
2. **Discord application** (developer portal): create the app and a bot, copy the *Public Key*, invite the bot to the server with the `bot` and `applications.commands` scopes (and *Manage Roles* if you want the supporter role).
3. **Edge Function secrets**: `DISCORD_PUBLIC_KEY` (required); optionally `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_SUPPORTER_ROLE_ID`, `DISCORD_PATRON_ROLE_ID`. Never paste tokens in chat or in the repo.
4. **Deploy** `arcanum-discord` **without JWT verification** (Discord does not send one; the signature is the authentication) and redeploy `arcanum-admin`.
5. In the Discord portal set *Interactions Endpoint URL* to `https://<project-ref>.supabase.co/functions/v1/arcanum-discord`. Discord will send a PING; the function must answer before it accepts the URL.
6. **Register the commands** once: `DISCORD_APP_ID=… DISCORD_BOT_TOKEN=… DISCORD_GUILD_ID=… node scripts/register-discord-commands.mjs`.
7. Put the public invite link in `DISCORD_INVITE_URL` in `assets/js/luck-support.js` so the game shows a *Unirme al Discord* button.
8. Grant supporters from the admin panel API: `POST /arcanum-admin/action {"action":"supporter:grant","target":"<mage>","credit_points":2,"reason":"donation"}` (and `luck:grant` for events).

Until step 1 is done the **✦ Suerte y Apoyo** button stays hidden: the client hides it when the RPCs do not exist.

## 5. Security notes
- All new tables have row level security and **no** grants for `anon`/`authenticated`; players only reach their own data through `security definer` RPCs keyed on `auth.uid()`.
- Granting luck, redeeming Discord links, granting credit and reading Discord status are service-role only.
- Discord link codes use `gen_random_uuid()` (strong RNG), expire in 15 minutes, are single use and rate-limited per account.
- No client-side storage is involved: luck and supporter state are never cached locally.
