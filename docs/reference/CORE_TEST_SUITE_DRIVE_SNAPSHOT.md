<!-- Snapshot imported from Google Drive on 2026-10-01 for Claude cloud context. -->
<!-- Source: https://docs.google.com/document/d/1fPnBYLLOiGBBo8oDWValeJBKEJuUpgfwjAbTRX5rENY/edit -->

# ARCANUM CORE RULES — TEST SUITE

> Casos canónicos para validar Economy Engine, Battle Engine y Rulesets

Versión 0.1

# OBJETIVO

Este documento define entradas y resultados esperados. Un motor no se considerará conforme con ARCANUM Core Rules si falla un test marcado CORE. Los tests que dependen de reglas históricas aún inciertas se marcan PROVISIONAL y validan únicamente la decisión actual de ARCANUM_CLASSIC.

# CONVENCIÓN

CORE = regla suficientemente cerrada para bloquear una release.

PROVISIONAL = comportamiento adoptado para Alpha, sustituible si aparece mejor evidencia histórica.

RULESET = el resultado depende explícitamente de la versión de reglas.

TOLERANCE = se admite pequeña diferencia decimal antes de redondeo final.

## T001 — Daño básico

Estado: CORE.

Entrada:

Atacantes = 1.000.

AP = 100.

Efficiency = 1,00.

Accuracy = 0,30.

Rand = 0,50.

Resistencia = 0%.

HP objetivo = 100.

Cálculo:

Damage = 1.000 × 100 × 1 × 0,30 × 0,50 = 15.000.

Kills = floor(15.000 / 100) = 150.

Esperado:

Damage = 15.000.

Kills = 150.

## T002 — Resistencia multitipo

Estado: CORE.

Entrada:

Misma base de T001.

Ataque Fire + Breath.

Fire Resistance = 75%.

Breath Resistance = 0%.

Cálculo:

AverageResistance = (0,75 + 0) / 2 = 0,375.

ResistanceFactor = 0,625.

Damage = 15.000 × 0,625 = 9.375.

Esperado:

AverageResistance = 37,5%.

Damage = 9.375.

## T003 — Weakness + Scales

Estado: CORE.

Entrada:

Daño después de resistencia = 10.000.

Objetivo vulnerable al tipo = sí.

Objetivo tiene Scales = sí.

Cálculo:

10.000 × 2 × 0,75 = 15.000.

Esperado:

Damage final = 15.000.

Regla:

Weakness y Scales deben aplicarse como multiplicadores independientes.

## T004 — Fatiga normal

Estado: CORE.

Entrada:

Efficiency inicial = 1,00.

Primary Attack realizado.

Counter Attempt realizado.

Esperado:

Tras Primary = 0,85.

Tras Counter Attempt = 0,70.

## T005 — Fatiga con Aguante

Estado: CORE.

Entrada:

Efficiency inicial = 1,00.

Endurance activo.

Primary Attack realizado.

Counter Attempt realizado.

Esperado:

Tras Primary = 0,90.

Tras Counter Attempt = 0,80.

## T006 — Orden de iniciativa dentro de una misma formación

Estado: CORE.

Entrada:

Extra Attack iniciativa 3.

Primary Attack iniciativa 2.

Esperado:

Extra Attack se resuelve antes que Primary Attack.

La formación usa su Quantity vivo en cada evento.

## T007 — Contraataque y Ranged

Estado: CORE.

Entrada A:

Primary Attack Melee contra objetivo con Counter AP.

Esperado A:

Counter Attempt inmediato si el objetivo sigue vivo.

Entrada B:

Primary Attack Ranged contra el mismo objetivo.

Esperado B:

No se genera Counter normal.

Entrada C:

Extra Attack, aunque sea no-ranged.

Esperado C:

No genera Counter.

## T008 — Targeting Flying

Estado: CORE.

Entrada:

Atacante terrestre Melee.

Objetivo Flying.

Esperado:

Objetivo no alcanzable.

Entrada:

Atacante terrestre Ranged.

Objetivo Flying.

Esperado:

Objetivo alcanzable.

Entrada:

Atacante Flying.

Objetivo terrestre.

Esperado:

Objetivo alcanzable.

## T009 — Stacking clásico de referencia

Estado: CORE.

Entrada:

Knight Templar Stack% = 25; terrestrial non-ranged.

Archangel = 20; Flying.

Unicorn = 20; terrestrial non-ranged.

High Priest = 15; natural Ranged.

Mind Ripper = 10; natural Ranged.

Dominion = 10; Flying.

Cálculo:

Knight Templar = 25 × 1,50 = 37,5.

Archangel = 20 × 2,25 = 45.

Unicorn = 20 × 1,50 = 30.

High Priest = 15 × 1 = 15.

Mind Ripper = 10 × 1 = 10.

Dominion = 10 × 2,25 = 22,5.

Esperado:

Orden = Archangel, Knight Templar, Unicorn, Dominion, High Priest, Mind Ripper.

## T010 — Natural vs Effective Flying

Estado: CORE.

Entrada:

Unidad natural Ranged recibe Carpet of Flying.

Esperado:

Su PositionScore de stacking no cambia.

effectiveFlying = true para targetability.

naturalFlying permanece false.

## T011 — Fort Bonus mínimo

Estado: CORE para ARCANUM_CLASSIC.

Entrada:

Land = 10.000.

Fortresses = 67.

fortPct = 0,67%.

Esperado:

Regular HP Bonus = 10%.

Siege HP Bonus = 20%.

## T012 — Fort Bonus intermedio

Estado: PROVISIONAL / alta confianza.

Entrada:

Land = 10.000.

Fortresses = 150.

fortPct = 1,5%.

Cálculo:

Regular = 10% + ((1,5 - 0,67) / 1,83) × 27,5%.

Esperado:

Regular ≈ 22,4727%.

Siege ≈ 44,9454%.

## T013 — Fort Bonus máximo

Estado: CORE para ARCANUM_CLASSIC.

Entrada:

Land = 10.000.

Fortresses = 250.

Esperado:

Regular HP Bonus = 37,5%.

Siege HP Bonus = 75%.

Fortalezas adicionales no aumentan más el bonus.

## T014 — Barrera + resistencia de reino

Estado: CORE para pipeline defensivo.

Entrada:

Barrier Resistance = 75%.

Kingdom Resistance contra Erradicación = 40%.

Esperado:

Pass Barrier = 25%.

Pass Kingdom = 60%.

Chance final de atravesar ambas = 15%.

Defensa efectiva = 85%.

## T015 — Doble 75% defensivo

Estado: CORE.

Entrada:

Barrier = 75%.

Kingdom Resistance = 75%.

Esperado:

Pass = 0,25 × 0,25 = 6,25%.

Defensa efectiva = 93,75%.

Nunca debe sumarse como 150%.

## T016 — Objeto hostil y resistencia por color

Estado: CORE.

Entrada:

Objeto hostil atraviesa Barrera.

Kingdom Resistance por color = 90%.

Esperado:

El objeto no realiza tirada de Kingdom Color Resistance.

El efecto continúa a la siguiente capa aplicable.

## T017 — Producción de Maná

Estado: CORE.

Entrada:

Land = 5.000.

Nodes = 2.000.

X = floor(100 × 2.000 / 5.000) = 40.

Cálculo:

40 × 5.000 / 100 + 2.000 × 60 / 10

= 2.000 + 12.000

= 14.000.

Esperado:

Base Mana Yield = 14.000 MP/turno.

Mana Capacity = 2.000.000 MP.

## T018 — Crecimiento base de población

Estado: CORE fuera del taper.

Entrada:

Population = 100.000.

Population suficientemente por debajo del 90% de capacidad.

Cálculo:

50 + 100.000 × 0,015 = 1.550.

Esperado:

Population Growth = +1.550.

## T019 — Ingreso de Oro legacy

Estado: RULESET.

Ruleset: ARCANUM_CLASSIC / GELD_LEGACY.

Entrada:

Population = 100.000.

Towns = 100.

Land = 5.000.

Cálculo:

100.000 × sqrt((100 + 10×100) / 5.000) + 1.000

≈ 47.904,1576.

Esperado:

Gross Gold ≈ 47.904,16 antes de reglas de redondeo y modificadores.

Tolerancia decimal permitida.

El test de redondeo queda pendiente de fijar.

## T020 — Mantenimiento de Fortalezas

Estado: CORE para FORT_UPKEEP_TR.

Entrada A:

n = 10.

Cálculo:

240n + 30n(n+1) = 2.400 + 3.300 = 5.700.

Esperado A:

5.700 Oro/turno.

Entrada B:

n = 100.

Cálculo:

24.000 + 303.000 = 327.000.

Esperado B:

327.000 Oro/turno.

## T021 — Economía negativa con reserva

Estado: CORE.

Entrada:

OpeningMana = 100.000.

NetManaPerTurn = -12.000.

Unidades requieren Maná.

Esperado tras un turno:

ClosingMana = 88.000.

No se disbandea ninguna unidad sólo por tener ingreso negativo.

La crisis se evalúa cuando el recurso no puede pagar mantenimiento.

## T022 — Steal Life

Estado: CORE.

Entrada:

Primary eligible damage = 900.000.

Steal Life = 5%.

HP por Vampiro = 4.500.

Cálculo:

900.000 × 0,05 = 45.000 HP.

45.000 / 4.500 = 10.

Esperado:

+10 Vampiros, sujeto a reglas económicas del ruleset.

Extra Attack no genera Steal Life salvo excepción explícita.

## T023 — Resurrection antes de Healing

Estado: CORE.

Entrada:

Bajas recuperables = 1.000.

Resurrection recupera 30 unidades.

Healing = 30%.

Cálculo:

Tras Resurrection quedan 970.

Healing = 291.

Esperado:

Resurrected = 30.

Healed = 291.

TotalRecovered = 321.

PermanentDeaths = 679.

## T024 — Curaciones multiplicativas

Estado: CORE.

Entrada:

RecoverableDeaths = 10.000.

Recovery A = 30%.

Recovery B = 30%.

Recovery C = 25%.

Cálculo:

10.000 → 7.000 → 4.900 → 3.675.

Esperado:

Recovered = 6.325.

PermanentDeaths = 3.675.

Recovery total = 63,25%.

## T025 — Blood Curse

Estado: CORE.

Entrada:

1.000 muertes marcadas como BloodCursed.

Healing = 30%.

Regeneration = 20%.

Esperado:

Recovered por Healing/Regeneration = 0 para esas 1.000 bajas.

Las bajas permanecen unrecoverable salvo excepción explícita del ruleset.

## T026 — Victoria Regular clásica

Estado: CORE para ARCANUM_CLASSIC.

Entrada:

Defender permanent army inicial = 10.000.

Defender final permanent deaths = 600 = 6%.

Attacker army inicial = 10.000.

Attacker final permanent deaths = 500 = 5%.

Attacker survivors > 0.

Esperado:

Cumple mínimo Regular 5%.

Defensor pierde porcentaje mayor.

Resultado = ATTACKER_VICTORY.

## T027 — Mismo resultado en Siege

Estado: CORE.

Misma entrada que T026.

Esperado:

No cumple mínimo Siege 10%.

Resultado = ATTACKER_NOT_VICTORIOUS.

## T028 — Ocupación máxima Regular

Estado: CORE para ARCANUM_CLASSIC.

Entrada:

TargetLand = 3.000.

Esperado:

Supervivientes necesarios para máximo territorial = 2,5 × 3.000 = 7.500.

## T029 — Ocupación máxima Siege

Estado: CORE para ARCANUM_CLASSIC.

Entrada:

TargetLand = 3.000.

Esperado:

Supervivientes necesarios para máximo territorial = 5 × 3.000 = 15.000.

## T030 — Captura inicial de Fortaleza en Siege

Estado: PROVISIONAL / TR_MODERN adoptado.

Entrada:

TargetLand = 3.000.

Cálculo:

possible = ceilTo50(3.000) = 3.000.

guaranteed = 3.050.

Esperado:

3.000 supervivientes = posible.

3.050 o más = garantizada.

## T031 — Muerte del mago

Estado: CORE.

Entrada:

Fortresses antes = 1.

Efecto destruye 1 Fortaleza.

Esperado:

Fortresses = 0.

Emitir MAGE_KILLED inmediatamente.

No esperar al final del turno ni a otra batalla.

## T032 — Hechizo hostil: orden defensivo

Estado: CORE.

Entrada:

Hechizo hostil.

Esperado:

Barrier Check

→ Kingdom Resistance Check

→ Heavenly Protection

→ Mirror/reflectors

→ efecto.

Si cualquier etapa bloquea o refleja, las posteriores no se ejecutan salvo regla específica.

## T033 — Unidades temporales y victoria

Estado: CORE.

Entrada:

Defensor tiene 9.000 unidades permanentes + 1.000 temporales.

Mueren las 1.000 temporales y 400 permanentes.

Esperado:

Pérdida permanente = 400 / 9.000 ≈ 4,444%.

Las temporales no ayudan a alcanzar el mínimo de 5% de ARCANUM_CLASSIC.

Resultado por threshold Regular = no cumplido.

## T034 — HP parcial entre eventos

Estado: CORE.

Entrada:

Objetivo HP = 1.000.

Primer evento causa 1.500 de daño.

Segundo evento causa 600.

Esperado tras primero:

1 unidad muerta y 500 daño parcial acumulado sobre la siguiente.

Tras segundo:

500 + 600 = 1.100.

Muere otra unidad.

Daño parcial restante = 100.

Al finalizar batalla, si el stack sobrevive, ese daño parcial se limpia.

## T035 — Héroe y Efficiency

Estado: CORE.

Entrada:

Hero level = 16.

Coincidencia de color y raza = sí.

Stack base Efficiency = 1,00.

Esperado:

InitialEfficiency = 1,16.

Tras Primary normal = 1,01.

El bonus del héroe no se reaplica después de fatiga.

## T036 — Level-up de héroe no retroactivo

Estado: CORE.

Entrada:

El héroe gana al final del combate XP suficiente para desbloquear una habilidad.

Esperado:

La habilidad no afecta la batalla recién terminada.

Se activa para acciones futuras.

## BATERÍA DE INTEGRACIÓN I01 — TURNO ECONÓMICO

Objetivo:

validar que acción activa, producción, límites y upkeep se procesan en el orden correcto.

Escenario mínimo:

reino con Oro y Maná suficientes;

acción Tax;

producción de Maná;

crecimiento de población;

upkeep militar.

Esperado:

el ledger demuestra cada etapa y closing resources coinciden con la suma ordenada.

No se aceptará una implementación que sólo ajuste el saldo final sin Event/Resource Ledger.

## BATERÍA DE INTEGRACIÓN I02 — REGULAR COMPLETO

Objetivo:

validar PRE_BATTLE → BATTLE → POST_BATTLE.

Debe incluir:

dos stacks por lado;

Initiative diferente;

un Counter;

una resistencia;

una recuperación;

Fort Bonus;

condición 5%;

conquista territorial.

Esperado:

BattleEventLog totalmente reproducible con seed fija.

## BATERÍA DE INTEGRACIÓN I03 — SIEGE COMPLETO

Debe añadir:

Siege Accuracy;

Fort Bonus doble;

mínimo de victoria 10%;

ocupación 5×Land;

captura/destrucción de Fortalezas;

comprobación MAGE_KILLED.

## BATERÍA DE INTEGRACIÓN I04 — MAGIA HOSTIL

Debe validar:

Barrier;

Kingdom Resistance;

reflector;

efecto;

registro exacto de qué capa detuvo el hechizo.

## BATERÍA DE INTEGRACIÓN I05 — NECROMANCIA Y RECOVERY

Debe combinar:

Steal Life durante batalla;

Blood Curse;

Resurrection;

Healing;

Regeneration;

Touch of Necromancy post-battle.

Cada sistema deberá operar sobre su subconjunto correcto de bajas.

# REGLAS PARA AUTOMATIZAR ESTA SUITE

1. Todos los tests aleatorios deberán aceptar seed fija o valores Rand inyectados.

2. Ningún test debe depender de la hora real.

3. Todas las fórmulas deberán indicar ruleset.

4. Los cálculos monetarios y porcentuales usarán tipos deterministas; evitar float binario para lógica autoritativa.

5. Cada fallo debe devolver:

testId,

ruleset,

expected,

actual,

eventLogReference.

6. Las reglas PROVISIONAL no bloquean el desarrollo si la discrepancia procede de una decisión histórica actualizada; sí requieren actualizar simultáneamente Biblia, Ruleset y test.

7. Las reglas CORE bloquean release.

# CRITERIO PARA ARCANUM CORE RULES v1.0 RC

La especificación podrá etiquetarse Release Candidate cuando:

todos los tests CORE unitarios pasen;

I01–I05 pasen con logs reproducibles;

no existan dos fórmulas activas para la misma regla dentro de un mismo ruleset;

todas las reglas históricamente dudosas estén marcadas PROVISIONAL o RULESET;

cada resultado de batalla pueda reproducirse con estado inicial + ruleset + seed.

# FIN DE TEST SUITE v0.1

# IMPLEMENTATION STATUS — ECONOMY SIMULATOR v0.1

Primer run ejecutable:

T017 PASS.

T018 PASS.

T019 PASS.

T020 PASS.

T021 PASS.

Capacidades de edificios PASS.

I01 PASS.

Population taper provisional PASS.

Regresión cap de Maná antes de upkeep PASS.

Resultado total del paquete actual: 9 PASS / 0 FAIL.

Nota: el paquete v0.1 sólo implementa el bloque económico. Los tests de combate continúan pendientes hasta Battle Simulator.

# IMPLEMENTATION STATUS — ECONOMY SIMULATOR v0.2

13 tests ejecutados.

13 PASS.

0 FAIL.

Nuevas comprobaciones:

Modifier Engine sobre Food Capacity.

Orden determinista de modificadores.

Simulación secuencial de múltiples turnos.

Serialización de ResourceLedger con BigInt.

El bloque económico queda listo para pasar a integración con efectos reales y, en paralelo, comenzar Battle Simulator.

# IMPLEMENTATION STATUS — BATTLE SIMULATOR v0.4

43 tests ejecutados.

43 PASS.

0 FAIL.

Verdes:

T001–T016.

T022–T031.

T033–T035.

Pairing clásico PRE-2010 provisional.

Event Queue.

Counter inmediato.

Steal Life in-battle.

Recovery post-battle.

Victoria.

Siege Accuracy.

Ocupación territorial.

Fortalezas y MAGE_KILLED.

Pendiente para I02/I03 completos:

orquestación end-to-end de todas las fases en una única llamada;

Combat Advantage;

algunos tie-breaks/pairing históricos;

selección exacta de edificios destruidos/conquistados.

# IMPLEMENTATION STATUS — BATTLE SIMULATOR v0.5

48 tests ejecutados.

48 PASS.

0 FAIL.

I02 Regular end-to-end = PASS.

I03 Siege end-to-end = PASS.

Siege Accuracy integrada y registrada en BattleEventLog.

La batalla ya puede terminar modificando Land, Fortresses y estado MAGE_KILLED.

Pendiente principal:

Combat Advantage;

temporary/permanent stacks como tipo explícito dentro del engine end-to-end;

PRE_BATTLE spell/item orchestration;

Event Log unificado PRE_BATTLE/BATTLE/POST_BATTLE;

pairing histórico fino y fake-stack overattack.

# IMPLEMENTATION STATUS — REALM SIMULATOR v0.2

Suite unificada:

77 tests.

77 PASS.

0 FAIL.

Realm:

R001–R016 PASS.

Nuevas garantías:

transacciones atómicas;

rollback de acciones inválidas;

invariants check;

IDs globales únicos de stacks;

command log;

replay determinista;

stress test de 1.000 acciones.

La capa Realm reutiliza Economy v0.2 y Battle v0.5 sin modificar sus contratos.

## IMPLEMENTATION STATUS — REALM SIMULATOR v0.3

85 tests ejecutados.

85 PASS.

0 FAIL.

Añadido:

Explore provisional versionado.

Build con capacidad clásica compartida.

Net Power legacy derivado.

Replay determinista de Explore + Build.

## IMPLEMENTATION STATUS — REALM SIMULATOR v0.4

94 tests ejecutados.

94 PASS.

0 FAIL.

R025:

150 Guilds => 42 puntos de Research por turno.

R026:

relaciones de color y elegibilidad de Research.

R027:

calibración histórica de cinco hechizos sin Sage.

R028:

misma calibración con Sage Researching nivel 5.

R029:

Concentration reduce Research Cost 0,05% por Spell Level.

R030:

Research persistente consume turnos, completa hechizo y aumenta Spell Level.

R031:

spillover entre hechizos dentro del mismo turno.

R032:

Research ilegal revierte atómicamente.

R033:

Replay con Research produce estado idéntico.

Estado actual:

94 PASS / 0 FAIL.

# IMPLEMENTATION STATUS — REALM SIMULATOR v0.6

Suite unificada:

107 tests.

107 PASS.

0 FAIL.

Realm:

R001–R046 PASS.

Nuevos bloques:

R017–R024 Explore / Build / Net Power.

R025–R033 Research / Spell State.

R034–R043 Protecciones / Counters / Meditation.

R044–R046 Scenario Runner / Mini-Era.

Mini-Era R045:

269 comandos mixtos;

2 magos;

replay idéntico;

0 deuda territorial;

invariantes válidos.

La siguiente batería deberá utilizar agentes simples que generen comandos por política en vez de un guion prefijado

AMPLIACIÓN DE TEST SUITE — BETA 0.2.65

BLOQUE P — PRODUCCIÓN Y RELEASE

P001 La versión mostrada en producción corresponde al commit que Render declara live.

P002 Si main está por delante de producción, el estado se marca explícitamente como pendiente de despliegue.

P003 Cada despliegue ejecuta tests de humo antes de publicarse.

P004 El build falla ante errores de sintaxis en módulos JS.

P005 El pipeline ejecuta npm audit y registra vulnerabilidades de severidad alta.

P006 Las rutas Mercado, Artefactos, Evento, Taberna, Crónica y Arena cargan sin excepción JavaScript.

BLOQUE A — ARENA ARCANA

A001 Los Sellos clasificatorios se reinician una vez por día de servidor, no por reloj local.

A002 Un duelo clasificatorio consume exactamente un Sello.

A003 Un amistoso no consume Sellos ni cambia rating.

A004 Rating, récord e historial persisten entre dispositivos.

A005 El cliente no puede modificar rating, Sellos o resultados alterando localStorage.

A006 El combate se resuelve o valida en servidor con semilla/resultados reproducibles.

A007 Dos clientes reciben el mismo perfil de combate para un mismo rival.

A008 Las elecciones de evolución del rival se reflejan en cualquier combate contra él.

A009 Empates tienen una política definida y reproducible; no se resuelven sólo con azar no registrado.

A010 El matchmaking no usa únicamente Poder Neto cuando el rating real ya está disponible.

A011 Las seis Escuelas/variantes de configuración no producen builds imposibles o degenerados.

A012 Se simulan al menos 10.000 combates por Escuela para detectar tasas de victoria anómalas.

BLOQUE C — IDENTIDAD Y EVOLUCIÓN DEL ARCHIMAGO

C001 La generación base del personaje es determinista para la misma semilla canónica.

C002 Atributos, arma, rasgo y habilidades se guardan en servidor.

C003 La elección de una mejora de nivel es irreversible salvo mecánica explícita de reseteo.

C004 No se puede elegir más de una opción para el mismo nivel.

C005 Dos dispositivos muestran exactamente la misma evolución.

C006 La ficha visual, Arena y futuros combates PvE consumen la misma fuente de datos.

C007 Cambiar nombre visible o caché no rerrollea el personaje accidentalmente.

BLOQUE COM — COMUNIDAD

COM001 El chat global carga, publica y refresca mensajes.

COM002 El chat de Escuela carga mensajes de su canal y no sale antes por una condición exclusiva de chat global.

COM003 Un jugador sólo ve la sala de su propia Escuela.

COM004 Buscador, ficha, amistad y mensajería privada funcionan con usuarios reales y NPC filtrados correctamente.

COM005 Presencia online caduca correctamente cuando un cliente desaparece.

COM006 Los límites de frecuencia y longitud se validan en servidor.

BLOQUE ECO — ECONOMÍA Y RECURSOS

ECO001 Oro, Maná, Población, Alimentos, Investigación, Turnos, Tierras y Poder Neto muestran una única cifra canónica en todas las vistas.

ECO002 El crecimiento visual por segundo nunca crea recursos reales adicionales fuera del cálculo canónico.

ECO003 La recompensa agregada de un turno de 5 minutos coincide con la suma mostrada por el crecimiento interpolado.

ECO004 Talleres reducen el coste/tiempo de construcción y la lista de construcción refleja la reducción real.

ECO005 Alimentos tienen consumo y consecuencias definidas; no son sólo una cifra decorativa.

ECO006 Investigación tiene origen, gasto y conversión coherentes con el sistema de hechizos.

BLOQUE MKT — MERCADO Y ARTEFACTOS

MKT001 Crear oferta, listar oferta, aceptar oferta y liquidar recursos es una transacción atómica.

MKT002 Dos jugadores no pueden aceptar simultáneamente la misma oferta.

MKT003 El vendedor recibe el pago una sola vez y el comprador recibe el bien una sola vez.

MKT004 Mercado y Artefactos cargan sin errores de parser ni escapes literales de nueva línea.

MKT005 Un artefacto equipado/consumido no puede duplicarse por refresco, doble clic o carrera de red.

BLOQUE TAV — TABERNA

TAV001 Spawn inicial siempre cae en una casilla caminable.

TAV002 Colisiones coinciden con el mapa visual.

TAV003 Movimiento no atraviesa paredes con teclas mantenidas o baja tasa de FPS.

TAV004 Dos jugadores pueden coexistir y actualizar posición sin teletransportes extremos.

TAV005 Chat/interacción de proximidad no sustituye ni rompe la comunidad global.

BLOQUE EVT — EVENTOS Y BOSS

EVT001 El Boss tiene estado de servidor compartido.

EVT002 Daño, recompensas y contribución no pueden manipularse desde cliente.

EVT003 El evento termina una sola vez y distribuye recompensas de forma idempotente.

EVT004 El evento tiene fecha de inicio/fin, reglas, recompensas y condición de victoria visibles.

PRIORIDAD DE AUTOMATIZACIÓN

Primero deben automatizarse P001-P006, ECO001-ECO004, MKT001-MKT005, COM001-COM003 y A001-A008. Son las pruebas que más probablemente impidan regresiones visibles o exploits durante la beta.

.

BLOQUE ECO2 — CONTRATO ECONÓMICO 0.3.2

ECO201 Alimento se presenta como capacidad de sustento cuando el servidor no expone un stock real.

ECO202 La capacidad máxima de Población es min(capacidad alimentaria, capacidad residencial).

ECO203 Llegar al límite de Alimento detiene la capacidad de crecimiento poblacional; no crea una deuda alimentaria inventada por el cliente.

ECO204 Investigación se presenta como flujo RP/turno dedicado a investigar, no como saldo pasivo.

ECO205 RP/turno coincide con floor(sqrt(Gremios) × 3,5).

ECO206 Un jugador que no gasta turnos en Investigación no recibe RP por mera espera.

ECO207 Ascendencia nunca se usa como recurso gastable.

ECO208 El cliente no deriva Oro, Maná o Población de una fórmula basada en Ascendencia.

ECO209 La interpolación visual sólo usa producción de servidor, caché aprendida de un delta real o cero.

ECO210 Tierra desarrollada siempre coincide con Tierra total − Tierra salvaje.

ECO211 Explorar aumenta Tierra salvaje y no crea automáticamente edificios.

ECO212 Construir reduce Tierra salvaje en concordancia con la infraestructura creada.

ECO213 Granjas, Pueblos, Nodos, Talleres, Gremios, Cuarteles, Fortalezas y Barreras muestran una función económica/estratégica única y comprensible.

ECO214 La pantalla Economía muestra claramente qué valores son reserva, capacidad, flujo o indicador.

ECO215 Las alertas económicas identifican por separado cuello de botella de alimento y cuello de botella residencial.

ECO216 El ritmo de Investigación se recalcula al cambiar el número de Gremios.

ECO217 La capacidad de Maná y la reserva de Maná nunca se muestran como el mismo valor.

ECO218 Ninguna animación por segundo altera estado canónico ni crea recursos reales.

BLOQUE CHAR — IDENTIDAD CANÓNICA DEL ARCHIMAGO 0.3.3

CHAR001 Abrir la ficha propia obtiene un Archmage Snapshot autenticado del servidor.

CHAR002 Abrir la ficha de otro jugador obtiene el mismo tipo de snapshot con su identidad pública.

CHAR003 Perfil y Arena usan el mismo perfil de combate canónico para un mismo Archimago.

CHAR004 Perfil y Arena usan el mismo equipo verificado para un mismo Archimago.

CHAR005 Cambiar un objeto equipado y volver a abrir la ficha actualiza el mismo personaje en ambos sistemas.

CHAR006 Las aptitudes Poder Arcano, Conocimiento, Voluntad e Influencia aparecen diferenciadas de las características de duelo.

CHAR007 Vida, Fuerza, Agilidad, Velocidad, Resistencia, Precisión, Voluntad y Fortuna se presentan como características de combate, no como segunda progresión de nivel.

CHAR008 El arma del perfil de combate se etiqueta como Arma de Duelo y no se confunde con el arma procedural equipada.

CHAR009 El propietario puede ver su inventario completo.

CHAR010 La ficha de otro jugador no expone objetos no equipados.

CHAR011 La ficha pública sí puede mostrar los slots y objetos actualmente equipados.

CHAR012 Las reliquias poseídas aparecen vinculadas al mismo Archimago.

CHAR013 El rating y récord mostrados en la ficha coinciden con el estado autoritativo de Arena.

CHAR014 La crónica personal ordena por fecha eventos de Arena y reliquias.

CHAR015 Para el propietario, la crónica puede incorporar informes estratégicos de guerra sin alterar su autoridad original.

CHAR016 La ficha no reconstruye rating, inventario o combate desde localStorage.

CHAR017 El snapshot indica las autoridades de perfil, progresión, combate, inventario, Arena, reliquias e historial.

CHAR018 Una evolución elegida desde la ficha reaparece en Arena sin crear una segunda versión del personaje.

CHAR019 Un objeto equipado desde Inventario modifica la lectura de equipo de la ficha y la Arena autoritativa.

CHAR020 El cierre del modal y su reapertura no genera otra identidad, reroll ni semilla de personaje.

CHAR021 Renombre se calcula en servidor exclusivamente desde hechos canónicos.

CHAR022 Renombre no puede gastarse ni modifica combate, economía o recompensas en 0.3.3.

CHAR023 El desglose de Renombre coincide con nivel, Arena, reliquias y Únicos Mundiales registrados.

CHAR024 La Taberna obtiene nombre, Escuela, nivel y Renombre de la identidad canónica del Archimago.

CHAR025 La presencia de Taberna puede transportar nivel y Renombre sin crear una nueva autoridad de personaje.

CHAR026 El evento PvE carga la identidad canónica del participante sin alterar por ello la fórmula estratégica de daño del Boss.

BLOQUE ITEM — MODELO CANÓNICO DE OBJETOS 0.3.5

ITEM001 El inventario canónico contiene exactamente los slots Arma, Túnica, Amuleto, Anillo I, Anillo II, Foco Arcano y Reliquia.

ITEM002 No existe un slot procedural visible llamado Artefacto.

ITEM003 Un inventario v1 con equipment.artifact migra a equipment.focus sin perder el objeto.

ITEM004 Un item v1 con slot artifact migra a slot focus conservando su ID.

ITEM005 La antigua caché local arcanum_inventory_v1_* sigue siendo importable.

ITEM006 Equipar Gear utiliza el ciclo canónico /items/equip.

ITEM007 Equipar Reliquia utiliza el mismo ciclo canónico /items/equip con kind relic.

ITEM008 Desequipar Gear y Reliquia utiliza el ciclo canónico /items/unequip.

ITEM009 Sólo una Reliquia puede permanecer equipada a la vez.

ITEM010 La ficha pública muestra siete slots sin exponer Gear no equipado.

ITEM011 Arma de Duelo aparece separada de la Arma física del inventario.

ITEM012 Arena calcula combate con identidad intrínseca + Gear + Reliquia compatible.

ITEM013 Una Reliquia de economía no altera estadísticas de Arena por defecto.

ITEM014 Una Reliquia con bonificación personal compatible se resuelve en servidor.

ITEM015 El Mercado de Reliquias y el slot Reliquia comparten el mismo flag autoritativo equipped.

ITEM016 Un Único Mundial conserva propiedad e historia al equiparse o desequiparse.

ITEM017 Poder de Equipo continúa calculándose exclusivamente desde Gear procedural equipado.

ITEM018 El slot Reliquia no consume un hueco de Gear ni cambia la capacidad de la mochila.

ITEM019 La migración v1 -> v2 no modifica rareza, afijos, rolls ni poder de las piezas existentes.

ITEM020 El modelo canónico identifica Gear y Reliquia como clases físicas y excluye Arma de Duelo.

ITEM021 El Inventario muestra las Reliquias poseídas además del Gear procedural.

ITEM022 Una Reliquia puede vincularse y desvincularse desde Inventario y Biblioteca sin crear estados distintos.

ITEM023 Biblioteca conserva catálogo, lore, custodios, historia y mercado, pero no mantiene un segundo sistema de equipamiento.

ITEM024 Los totales derivados de combate visibles en la ficha proceden del cálculo autoritativo de servidor cuando está disponible.

ITEM025 Una bonificación de Reliquia aplicada por Arena aparece reflejada en los totales derivados de la ficha.

BLOQUE LOOT — BOTÍN VERIFICADO 0.3.6

LOOT001 No existe botón visible HALLAZGO DE PRUEBA en Inventario.

LOOT002 La ruta técnica test-drop rechaza uso normal cuando ARCANUM_ALLOW_TEST_LOOT no está habilitado.

LOOT003 Cada Gear nuevo expone procedencia en Inventario.

LOOT004 Una claim usa una referencia única de acción y no puede concederse dos veces.

LOOT005 Repetir una petición de claim completada devuelve el mismo resultado sin generar otro objeto.

LOOT006 Un corte durante procesamiento puede recuperarse sin duplicar recompensa.

LOOT007 Si el inventario está lleno el objeto queda pending_inventory y conserva exactamente sus rolls.

LOOT008 Tras liberar espacio, abrir Inventario intenta entregar recompensas pendientes.

LOOT009 Abrir la ficha propia también intenta recuperar Gear pendiente.

LOOT010 Exploración inicia claim antes del RPC explore.

LOOT011 Completar claim de exploración exige ganancia real de tierra.

LOOT012 Completar claim de exploración exige gasto real de turnos.

LOOT013 Una exploración no verificada rechaza la claim.

LOOT014 Rastreo usa la banda de rareza más conservadora.

LOOT015 Expedición mejora los pesos frente a Rastreo.

LOOT016 Exploración profunda mejora los pesos frente a Expedición.

LOOT017 La probabilidad de exploración nunca supera 68%.

LOOT018 Arena amistosa no concede Gear.

LOOT019 Derrota clasificatoria no concede Gear.

LOOT020 Victoria clasificatoria puede conceder Gear.

LOOT021 La claim de Arena está ligada al UUID real del match.

LOOT022 Una victoria de Arena no puede reclamar Gear usando el match de otro jugador.

LOOT023 Arena veterana usa pesos mejores que Victoria de Arena.

LOOT024 Arena élite usa pesos mejores que Arena veterana.

LOOT025 El resultado de Arena muestra el Gear obtenido cuando existe.

LOOT026 Boss sin participación no concede Gear.

LOOT027 Boss activo/no derrotado no concede Gear.

LOOT028 Participante válido puede reclamar tras la derrota aunque no diera el último golpe.

LOOT029 3000+ daño usa tier Cofre Arcano.

LOOT030 15000+ daño garantiza Gear de Boss.

LOOT031 50000+ daño garantiza Gear y usa pesos legendarios mejorados.

LOOT032 Volver al evento tras la derrota no duplica Gear de Boss.

LOOT033 Gear de Boss no sustituye Fragmentos ni Reliquias existentes.

LOOT034 Los objetos antiguos sin procedencia se conservan como Beta anterior.

LOOT035 Los tres objetos iniciales nuevos quedan marcados como Legado inicial.

BLOQUE PVE — EXPEDICIONES PERSONALES 0.3.7

PVE001 Existe la sección Expediciones en escritorio.

PVE002 Existe la sección Expediciones en navegación móvil.

PVE003 Ruinas del Umbral contiene exactamente cuatro encuentros en la versión inicial.

PVE004 Incursión se desbloquea a nivel 1.

PVE005 Profundidad se bloquea por debajo de nivel 5.

PVE006 Abismo se bloquea por debajo de nivel 10.

PVE007 Sólo existe una incursión active/fighting por jugador.

PVE008 Iniciar una segunda expedición devuelve la activa en vez de crear otra.

PVE009 La vida máxima inicial procede del combate + Gear + Reliquia congelados.

PVE010 Cambiar Gear después de empezar no altera una incursión activa.

PVE011 Cambiar Reliquia después de empezar no altera una incursión activa.

PVE012 El nivel de Gear obtenido se fija al nivel de entrada.

PVE013 Una victoria guarda la vida restante.

PVE014 La siguiente sala empieza con la vida guardada.

PVE015 No existe curación gratuita entre cámaras.

PVE016 Una derrota termina la incursión con vida 0.

PVE017 Retirarse termina la incursión pero conserva Gear ya entregado.

PVE018 Cada intento de cámara consume exactamente 1 Turno.

PVE019 Iniciar una expedición no consume Turno.

PVE020 Retirarse no consume Turno.

PVE021 Una sala cambia active -> fighting antes de gastar Turno.

PVE022 Dos peticiones simultáneas no pueden resolver la misma sala.

PVE023 Un lock fighting de más de 60 segundos puede recuperarse.

PVE024 Una incursión caduca después de 24 horas.

PVE025 El enemigo se genera determinísticamente con seed + sala.

PVE026 El jefe recibe escalado adicional.

PVE027 Sala 1 usa 28% base de drop.

PVE028 Sala 2 usa 36% base de drop.

PVE029 Sala 3 usa 48% base de drop.

PVE030 Profundidad añade 8 puntos porcentuales por sala.

PVE031 Abismo añade 16 puntos porcentuales por sala.

PVE032 El jefe final garantiza Gear.

PVE033 Un jefe no puede generar Gear Común.

PVE034 El Gear de PvE usa source pve.

PVE035 Cada reward claim queda ligada a run + stage.

PVE036 Inventario lleno reserva el objeto y no lo rerrollea.

PVE037 La interfaz muestra vida actual/máxima.

PVE038 La interfaz muestra progreso de cuatro cámaras.

PVE039 El resultado muestra registro de combate.

PVE040 El resultado muestra Gear encontrado.

PVE041 El E2E entra en Ruinas, gana una sala y conserva la vida restante.

BLOQUE DECISIONES PVE — 0.3.8

PVE042 Tras una victoria no-boss aparece una decisión antes de la siguiente cámara.

PVE043 La decisión no consume Turnos.

PVE044 Se muestran exactamente tres opciones.

PVE045 Descender no altera HP, enemigo ni botín.

PVE046 Santuario cura exactamente el 18% del máximo sin superar el máximo.

PVE047 Santuario aplica -10 puntos porcentuales de Gear en la siguiente cámara.

PVE048 Santuario desplaza las rarezas hacia abajo.

PVE049 Forzar aumenta x1,15 las estadísticas del próximo enemigo.

PVE050 Forzar añade +18 puntos porcentuales de Gear.

PVE051 Forzar mejora los pesos de rareza.

PVE052 Elegir una opción consume la decisión y no puede repetirse.

PVE053 El modificador elegido queda persistido en servidor.

PVE054 El modificador se consume al resolver la siguiente cámara.

PVE055 La elección queda registrada en decision_history.

PVE056 El cliente no puede inventar una cuarta opción ni modificar los efectos.

PVE057 La siguiente sala se muestra antes de elegir.

PVE058 Antes del jefe, la elección afecta rareza pero no elimina el Gear garantizado.

PVE059 Dos peticiones simultáneas de elección sólo pueden resolver una.

PVE060 Retirarse sigue disponible durante la fase de decisión.

