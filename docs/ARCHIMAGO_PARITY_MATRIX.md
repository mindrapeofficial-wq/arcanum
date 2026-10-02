# ARCANUM — Archimago parity matrix

This matrix defines how the imported Archimago client/server functionality maps into the Domain-first ARCANUM rebuild.

Legend:

- **KEEP**: preserve the mechanic and expose it in ARCANUM.
- **ADAPT**: preserve the underlying mechanic but change route, terminology, presentation or targeting.
- **RETIRE**: do not expose this system in the rebuilt product.
- **INTERNAL**: keep for engine/admin/development use, not normal player navigation.

## Client route mapping

| Archimago route/view | Target ARCANUM surface | Decision | Notes |
| --- | --- | --- | --- |
| Home / login | ARCANUM entry | ADAPT | Keep auth flow, ARCANUM branding only. |
| About / kingdom overview | Dominio | ADAPT | Domain becomes the default authenticated page. |
| Interior | Dominio / Economía | RETIRE | Marked deprecated in source; mechanics are represented elsewhere. |
| Explore | Exploración | KEEP | Turn-driven land expansion. |
| Geld | Economía | ADAPT | Visible term becomes ARCANUM Gold/recaudación, not a new “Geld” resource. |
| Charge | Magia / Economía arcana | ADAPT | Turn-driven mana generation; rename visible action to ARCANUM terminology. |
| Building | Construcción | KEEP | Integrate into ARCANUM construction UI. |
| Destroy | Construcción | ADAPT | Present as a construction-management action, not necessarily its own top-level page. |
| Status report | Dominio / Informes | ADAPT | Strategic read model of the Domain. |
| Rank list | Clasificación | ADAPT | Remove attack-range/PvP affordances and links that exist only to attack another player. |
| Spell | Magia | ADAPT | Preserve self/domain/non-individual-PvP magic. Quarantine player-target offensive casting. |
| Dispel | Magia | KEEP | Domain enchantment management. |
| Item | Objetos / Magia | ADAPT | Strategic consumables/items remain; replace names/lore. |
| Market | Mercado | KEEP | Preserve market mechanics. |
| Submarket | Mercado | KEEP | Detail/order flow inside Mercado. |
| Assignment | Strategic defence | ADAPT | Do not expose as an individual-PvP setup page. Reuse only if useful for PvE/domain war. |
| Recruit | Ejército | KEEP | Recruitment. |
| Disband | Ejército | KEEP | Army management. |
| Research | Investigación | KEEP | Becomes a Domain-first navigation item. |
| Skills | Investigación / Doctrinas | ADAPT | Preserve only as strategic/domain progression; no character sheet dependency. |
| Mage lookup | none | RETIRE | Individual target profile used by PvP flow. Community profiles remain ARCANUM-owned. |
| Battle | none as original | RETIRE | Original individual-PvP battle surface is not transplanted. |
| Battle prep | none | RETIRE | Direct player-target attack preparation. |
| Battle result | Informes / future combat reports | ADAPT | Generic reports may be reused for non-individual-PvP combat. |
| Chronicles | Informes / logs | ADAPT | No standalone Chronicle page; reuse only relevant strategic history. |
| Manage / messages | Comunidad / Chat / Ajustes | ADAPT | ARCANUM Community and Chat remain canonical. |
| Encyclopedia | Archivo / Manual | KEEP | Rebrand all content and names. |
| View unit | Ejército / Enciclopedia | KEEP | ARCANUM unit names/assets. |
| View spell | Magia / Enciclopedia | KEEP | ARCANUM spell names/lore. |
| View item | Objetos / Enciclopedia | KEEP | Hide undiscovered relic spoilers. |
| View skill | Investigación / Enciclopedia | KEEP | Domain doctrine presentation. |
| Guide | Manual | KEEP | Rewrite all source-project language. |
| Finals | Season end | KEEP | Adapt to ARCANUM season fiction/UI. |
| Analysis | developer/admin | INTERNAL | Not normal player navigation. |
| Game table | developer/admin | INTERNAL | Configuration/debug surface. |
| Test | developer | INTERNAL | Never production navigation. |
| Defeated | Domain defeat state | KEEP | Rebrand copy and recovery flow. |

## Existing ARCANUM surfaces

| Current ARCANUM surface | Rebuild decision |
| --- | --- |
| Dominio | KEEP and make default |
| Construcción | KEEP, replace/augment mechanics from imported engine |
| Economía | KEEP, align with imported Gold/Mana/Population/Food model |
| Mercado | KEEP, replace/augment with imported market engine |
| Ejército | KEEP, replace/augment with imported unit/recruit/disband systems |
| Guerra | KEEP only as strategic Domain conflict; no character/duel PvP |
| Informes | KEEP for strategic and non-individual-PvP combat reports |
| Investigación/Grimorio | KEEP mechanic, rename/navigation becomes Investigación |
| Personaje | RETIRE |
| Artefactos legacy page | RETIRE as a product surface; imported item/relic mechanics will be reintroduced under the new model |
| Arena | RETIRE |
| PvP ranking / ELO | RETIRE |
| Expediciones legacy | RETIRE during rebuild; future PvE should use rebuilt engine deliberately |
| Eventos legacy | RETIRE during rebuild; future world events can be reintroduced deliberately |
| Taberna | RETIRE/hidden |
| Comunidad | KEEP |
| Chat | KEEP |
| Ranking | ADAPT into Clasificación without individual-PvP scoring |

## Server endpoint mapping

| Source endpoint | Decision | Target |
| --- | --- | --- |
| POST /api/explore | KEEP | Exploración |
| POST /api/geld | ADAPT | Economía / Gold |
| POST /api/charge | ADAPT | Mana generation |
| POST /api/build | KEEP | Construcción |
| POST /api/destroy | KEEP | Construcción management |
| GET /api/ranklist | ADAPT | Clasificación without attack affordances |
| POST /api/spell | ADAPT | Remove direct offensive player targeting from public flow |
| POST /api/dispel | KEEP | Magia |
| POST /api/defence-assignment | ADAPT | Internal/non-individual-PvP strategic defence only |
| POST /api/recruitments | KEEP | Ejército |
| POST /api/disband | KEEP | Ejército |
| POST /api/item | ADAPT | Strategic item use; no individual-PvP targeting |
| POST /api/research | KEEP | Investigación |
| POST /api/war | RETIRE as direct individual-player endpoint | Battle engine remains reusable behind future Domain/PvE APIs |
| GET /api/report/:id | ADAPT | Generic strategic combat reports only |
| GET /api/mage-battles | RETIRE as individual-PvP history | Replace with Domain combat reports if needed |
| GET /api/chronicles | ADAPT | Strategic history only |
| POST /api/register | ADAPT | Integrate with ARCANUM auth/domain creation |
| POST /api/login | ADAPT | Integrate with canonical ARCANUM auth |
| POST /api/logout | KEEP | Auth |
| GET /api/login-check | KEEP | Auth |
| POST/GET/DELETE /api/mage | ADAPT | Rename/reframe as canonical player/Domain state; do not create a character product layer |
| GET /api/search-mage | RETIRE for attack targeting | Community search remains an ARCANUM concern |
| GET /api/mage/:id | RETIRE as PvP target inspection | Community/public profile can expose a separate limited read model |
| POST /api/mages | INTERNAL/REVIEW | Determine server/admin purpose before exposing |
| GET /api/game-table | KEEP/INTERNAL | Engine configuration |
| GET /api/server-clock | KEEP | Season/turn clock |
| Market endpoints | KEEP | Mercado |
| POST /api/skill | ADAPT | Domain doctrine/research progression |
| Mail endpoints | ADAPT | Prefer existing ARCANUM Community/Chat unless mail adds distinct value |

## Engine policy

The following engine modules are intentionally retained even when their original UI is retired:

- battle calculations;
- unit abilities;
- fort bonuses;
- land-loss calculations;
- battle spell/item resolution;
- war report calculations;
- defensive effects.

Retention does **not** authorize individual PvP. These modules are reusable infrastructure for PvE, world encounters, alliance/domain warfare or future strategic conflict.

## Rebranding requirements

Before any imported data becomes player-visible:

1. map every school label to Aurea, Viridia, Cineria, Nadir or Oneiria;
2. replace unit names and descriptions;
3. replace spell names and descriptions;
4. replace lesser-item names;
5. replace unique-item/relic names and lore;
6. replace source-world terms such as Terra where they conflict with ARCANUM canon;
7. ensure server errors/messages do not leak legacy terms;
8. keep stable internal IDs where changing them would break engine references.

## Definition of parity

ARCANUM reaches parity when every **KEEP** or **ADAPT** mechanic above has a functional, tested ARCANUM route/API equivalent, every **RETIRE** surface is unreachable in normal play, Community/Chat remain functional, and no player-visible legacy naming remains.
