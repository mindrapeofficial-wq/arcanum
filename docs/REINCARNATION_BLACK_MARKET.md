# Mercado Negro de The Reincarnation — mecánica observada y adaptación a ARCANUM

> Observado en vivo el 2026-10-02 (cuenta de pruebas, solo lectura de las páginas `blackmarket.cgi`, `antique.cgi`, `swords.cgi`, `spawning.cgi`, `exotic.cgi`, `tavern.cgi`, `altar.cgi`, `preorder.cgi`, `bids.cgi`) más las pujas reales hechas en sesiones anteriores (ver `notas-reincarnation.md`). La lógica es 100 % servidor: lo que sigue es **lo observable**, no el código.

## 1. Qué es

Un mercado de **subastas** ligado a turnos. Es el principal sumidero de oro del juego y la única vía para conseguir ciertas cosas (ítems únicos, héroes, hechizos de otros colores, unidades en lote).

* **Bloqueado para aprendices** (los primeros 120 turnos gastados: «An apprentice mage cannot use the Black Market»).
* **Pujar cuesta turnos**: 1 turno por orden de puja. Una orden puede pujar por varios lotes: «You can bid 5 Carpets of Flying using 1 turn. But you must spend 2 turns for bidding for a Carpet of Flying and an Oil Flask» → **1 turno por *tipo de lote distinto* en la orden**, la cantidad no cuesta más. Vender y mirar no cuesta turnos.
* Los lotes aparecen y caducan en una rotación del servidor (columna «Min. Left» = minutos restantes).

## 2. Reglas de puja (comunes a las 5 tiendas)

1. **Depósito por adelantado**: al pujar, tu oro se transfiere a la tienda. **No se puede cancelar la puja.**
2. **Reembolso**: si alguien te supera, tu oro vuelve a tu tesorería en ese momento.
3. **Mínimo de incremento**: +5 % sobre el precio actual (observado).
4. **Reloj**: cuenta atrás; en los **últimos 30 minutos cualquier puja nueva lo reinicia a 30 min** (anti-francotirador). Si el reloj llega a 0, el lote va al mayor postor y **se entrega a su reino**.
5. El primer pujador por un lote abre la subasta con 30 min restantes (observado en las pujas de la sesión 6).
6. **Bid Code / «Set All Bids»**: un campo de texto para pegar varias pujas de una vez (cada línea lote + oferta); evita rellenar 30 filas a mano.
7. **My Bids**: panel con las pujas activas por tienda (hoy «Total: 0»).

## 3. Las cinco tiendas + extras

| Tienda | Qué vende | Columnas | Precio visto | Notas |
|---|---|---|---|---|
| **Antique Store** (`antique.cgi`) | Ítems de un solo uso o únicos (≈ 37 tipos en rotación: Brooch of Protection, Carpet of Flying, Crystal Ball, Mana Vortex, Letters of the Thieves' Guild…) | Nombre, Número en subasta, Bid | de ~690 k (Horn of Valhalla) a 13,3 M (Carpet of Flying) (precio de referencia en Preorders) | Permite **vender ítems** propios (`Sell Item`) sin gastar turnos. Cada ítem tiene Tipo (Lesser/…), Uso (One-Use…), Batalla/No-batalla y efecto. |
| **Swords For Hire** (`swords.cgi`) | **Mercenarios** (Renegade Wizard, Venomesse, Bounty Hunter, Starving Peasant, War Hound, Falcon…) | Nombre, Cantidad, Mantenimiento G/M/P por lote, Min. Left, Precio, Tu puja | ≈ 500–525 k por lote | El lote es un bloque de N unidades con su upkeep total ya calculado. Los mercenarios pagan oro, rara vez maná. |
| **Spawning Hatchery** (`spawning.cgi`) | **Unidades invocables en lote** (Angel, Dryad, Hydra, Vampire, Djinni, Zombie…) | Idem + Min. Left de 7 | de 570 k a 7,8 M | Lotes de cientos/miles de unidades **sin pagar el hechizo ni la investigación**. Hay dos bandas de precio muy distintas (≈ 0,6 M y ≈ 7,5 M) según la unidad. |
| **Exotic Mageware** (`exotic.cgi`) | **Hechizos de otro color** que no puedes investigar | Hechizo, Min. Left, Precio, Tu oferta | ≈ 1,0 M | Solo 2 en rotación a la vez (Shroud of Darkness, Sleep). Al ganarlos se añaden a tu grimorio. |
| **Tavern O' Heroes** (`tavern.cgi`) | **Héroes** (Crypt Keeper nv 11, Shepherdess nv 14, Illusionist nv 16, Warlord nv 14, Necromancer nv 16) | Nombre, Nivel, Min. Left, Signing Bonus, Tu oferta | 1,0–2,2 M | El «Signing Bonus» es el precio mínimo; el héroe llega con nivel y habilidades; mantenimiento alto (1.000 g / 50–100 m / 0–20 p). |
| **Altar of Darkness** (`altar.cgi`) | **Donaciones a dioses** (Nature, Sun, Moon, Magic, Science, Mr. Satan, Lucifer) | Relación, Ofrecido | — | Solo oro, no es subasta; cerrado hasta 300 turnos; donar poco castiga. |
| **Preorders** (`preorder.cgi`) | **Pujas automáticas** | Tipo (Item/Unit/Hero/Spell), Nombre, Cantidad, Oro | — | Activar/desactivar global, **reserva de oro mínima** que nunca se toca, valor total de preórdenes, para héroes alterna `+` (≥ nivel) / `=` (nivel exacto). Cuando aparece un lote que coincide, se puja solo. |

## 4. Lo que hace especial al diseño (por qué funciona)

* **Sumidero de oro competitivo**: el oro sobra en TR, pero el depósito obligatorio + sobrepuja lo consume y crea tensión social.
* **Dónde se consigue lo raro** sin que el jugador pueda «farmear» con turnos: hay que *pujar mejor que los demás*.
* **Anti-sniping** (reinicio a 30 min) y **depósito bloqueado** limitan el spam y las trampas.
* **Coste en turnos de la puja** vincula la economía de oro con el presupuesto de acción.
* **Preorders** reducen la fricción para quien no puede estar conectado (encaja con el juego por turnos de 7 min).

## 5. Adaptación propuesta a ARCANUM (vocabulario propio: «Mercado de las Sombras»)

Se implementa por **fases**; la fase 1 es un MVP seguro y reutilizable.

### Fase 1 — Subastas genéricas (esta rama)

* Tablas `public.bm_lots` (lote), `public.bm_bids` (historial), con RLS activa y sin escritura directa desde el cliente.
* Un lote tiene `kind` (`unit`/`spell`/`item`/`hero`), `ref` (clave de catálogo), `qty`, `min_price`, `current_price`, `current_bidder`, `ends_at`, `settled_at`.
* RPCs: `bm_list_lots(kind)`, `bm_place_bid(lot_id, amount)`, `bm_my_bids()`, `bm_settle_due()` (liquidación perezosa en cada lectura + cron opcional).
* Reglas copiadas: depósito, no cancelación, reembolso al ser superado, incremento mínimo 5 %, extensión a 30 min en la última media hora, 1 turno por orden, bloqueado durante la protección de novato.
* **Fuente de verdad en servidor** (`docs/STATE_AUTHORITY.md`): el cliente solo envía `lot_id` + `amount`; el servidor valida oro, turnos y estado.
* Feature flag `rulesets.config.black_market.enabled` (por defecto **apagada**).

### Fases siguientes

2. Catálogo de unidades y mercenarios ampliado (los lotes de Swords/Hatchery necesitan unidades que ARCANUM aún no tiene: 7 hoy frente a ≈ 110 en TR).
3. Hechizos de otro color (Exotic Mageware) cuando exista el catálogo de magias ampliado (`docs/reference/REINCARNATION_SPELLS.md`, 149 hechizos).
4. Ítems (Antique Store) — requiere el modelo de objetos de uso (`useitem`) que ARCANUM aún no tiene.
5. Héroes (Tavern) — requiere héroes + habilidades.
6. Preórdenes (pujas automáticas con reserva de oro).
7. Altar de los dioses (relacionado con la «suerte»; ver `docs/LUCK_AND_SUPPORT.md`).

## 6. Riesgos y decisiones abiertas

* **Rotación de lotes**: TR genera lotes con una función de servidor que no vemos. Propuesta inicial: lotes generados por una RPC `bm_spawn_lots()` ejecutable solo por service-role (cron), con tablas de generación configurables por ruleset.
* **Precios**: los de TR están calibrados con ≈ 2 M de oro iniciales y 30 M+ de poder en medio juego; hay que reescalar a la economía de ARCANUM antes de activar el flag.
* **Entrega**: el lote ganado se entrega al reino en la liquidación; si el catálogo de destino no existe todavía (ítems/héroes), el lote no se puede crear.
