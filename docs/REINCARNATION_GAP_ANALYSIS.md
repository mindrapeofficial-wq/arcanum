# The Reincarnation vs ARCANUM — qué falta (2026-10-02)

Menú real de The Reincarnation (leído en vivo de `mainmenu.cgi`) frente a lo que ARCANUM tiene hoy en `main` (comprobado contra los RPC de Supabase y las vistas del cliente). Estado: ✅ existe · 🟡 parcial · ❌ falta.

| Sección TR | Página | ARCANUM | Comentario |
|---|---|---|---|
| Throne / estado del reino | `throne.cgi`, `report.cgi` | ✅ Dominio, Informes | |
| Explore | `explore.cgi` | ✅ Exploración | |
| Taxing | `gelding.cgi` | 🟡 | Impuestos existen en la economía, sin pantalla dedicada |
| Building / Destroy | `build.cgi`, `destroy.cgi` | ✅ / ❌ destruir | |
| Recruit / Disband | `recruit.cgi`, `disband.cgi` | ✅ / ❌ disolver | |
| **Cast spell / Summon** | `usemagic.cgi` | 🟡 | 18 hechizos (13 investigables) frente a **149** en TR. Ver `docs/reference/REINCARNATION_SPELLS.md` |
| **Research** | `research.cgi` | 🟡 | Grimorio existe; faltan 5 colores completos, rangos y coste por nivel |
| Skills | `skills.cgi` | ❌ | Habilidades de mago con rangos |
| Use item | `useitem.cgi` | ❌ | No hay ítems de uso (solo equipo del Arconte) |
| M.P. charge | `mana.cgi` | ✅ | Carga de maná |
| **Assignment** | `assign.cgi` | ❌ | Asignar unidades/hechizos a defensa |
| **Dispel** | `dispel.cgi` | ❌ | Retirar encantamientos |
| Enchantments (reino) | `usemagic.cgi` | ❌ | Hechizos con mantenimiento continuo en maná |
| **Audience / Heroes** | `hero.cgi` | ❌ | Héroes con nivel y habilidades |
| Diplomacy | `diplomacy.cgi` | 🟡 | Mensajería existe; no tratados |
| War | `war.cgi` | ✅ | |
| Guilds / Guild ranking | `guild.cgi`, `guildofterra.cgi`, `guildrank.cgi` | 🟡 | Comunidad; sin gremios con fuerza/ranking propio |
| Great Council | `coe.cgi` | ❌ | |
| Chronicle Terra | `newssearch.cgi` | 🟡 | Hay derivado en Personaje; sin buscador global |
| **Black Market** (6 tiendas) | `blackmarket.cgi` | ❌ | **Prioridad 1** — ver `REINCARNATION_BLACK_MARKET.md` |
| Preorders / My bids | `preorder.cgi`, `bids.cgi` | ❌ | |
| Altar of Darkness (dioses) | `altar.cgi` | ❌ | Relacionado con la Suerte de ARCANUM |
| Arena Archmage | `arena.cgi` | ✅ | (oculta en la edición Classic) |
| Ranking | `rank.cgi` | ✅ | |
| Cemetery | `cemetery.cgi` | ❌ | Registro de reinos caídos |
| Armageddon clock | `clock.cgi` | ❌ | Fin de ronda con 7 sellos |
| Renuntio Archiva | `renuntio_history.cgi` | ❌ | Historial de renuncias |
| Messenger | `messenger.cgi` | ✅ | |
| Supporting status / Lady Luck | `supporting.cgi`, `vote.cgi` | ✅ | `docs/LUCK_AND_SUPPORT.md` |

## Contenido (catálogos)

| Catálogo | TR | ARCANUM | Fuente |
|---|---|---|---|
| Hechizos | 149 + 7 especiales | 18 | `docs/reference/REINCARNATION_SPELLS.md` |
| Unidades | 110 | 7 (+5 invocaciones) | wiki `Category:Units_(Guildwar)` (no descargadas aún) |
| Ítems | 115 (≈ 37 en rotación en el mercado) | no hay ítems de uso | wiki `Category:Items_(Guildwar)` |
| Héroes | 28 | 0 | wiki `Category:Heroes_(Guildwar)` |

## Orden de implementación recomendado

1. **Mercado Negro (subastas)** — MVP con unidades/hechizos como tipos de lote. *En esta rama.*
2. **Catálogo de hechizos ampliado** (los 149 con coste de maná/turnos/investigación) — datos listos; falta decidir el reescalado de costes y los efectos de batalla.
3. **Catálogo de unidades ampliado** y mercenarios.
4. Encantamientos + Dispel + Assignment (defensa).
5. Ítems de uso y Antique Store.
6. Héroes + Skills + Taberna.
7. Preórdenes, Cemetery, Armageddon, Great Council.

## Cautelas

* Los **efectos** de los hechizos (fórmulas por 100 SL, probabilidad de éxito) dependen del motor de combate de TR, que no es visible. La wiki los describe en texto; implementar cada uno exige validarlos contra el motor de batalla de ARCANUM.
* **Nombres e identidad**: ARCANUM usa vocabulario propio (opción B de la edición Classic). Los nombres de TR se usan aquí solo como referencia de investigación; antes de publicar al jugador hay que renombrar y reescalar (ver `docs/REINCARNATION_INSPIRATION.md`).
* Otros PRs abiertos (#49–#51, rebuild de motor) pueden cambiar el esquema del dominio: revisar antes de aplicar migraciones.
