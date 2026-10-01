<!-- Snapshot imported from Google Drive on 2026-10-01 for Claude cloud context. -->
<!-- Source: https://docs.google.com/document/d/1_9bWWZbUi9y2Kz7NC7a789G9QIK7rfgENnB_dlUOqAA/edit -->

# REALM SIMULATOR v0.1

> Primera integración persistente de ARCANUM: Las Cinco Escuelas

Estado técnico

# OBJETIVO

Integrar Economy Simulator v0.2 y Battle Simulator v0.5 dentro de un estado persistente por archimago.

# IMPLEMENTADO

Persistencia de Turnos.

Persistencia de Oro, Maná y Población.

Persistencia de Tierra y Fortalezas.

Persistencia de cantidades de ejército después de batalla.

Recálculo automático de upkeep desde el ejército.

Turno económico NONE / TAX / MP_CHARGE.

Regular end-to-end.

Siege end-to-end.

MAGE_KILLED persistente.

RealmEventLog secuencial.

Serialización determinista de estado.

Bloqueo explícito cuando existe daño territorial cuya selección exacta de edificios aún no está históricamente cerrada.

# DECISIÓN SOBRE TIERRA Y EDIFICIOS

La selección exacta de edificios destruidos al perder territorio sigue abierta.

Realm Simulator v0.1 no inventa una prioridad.

La tierra perdida se consume primero de Wilderness.

Si no existe Wilderness suficiente:

se genera UNRESOLVED_TERRITORY_DAMAGE;

se registra la cantidad pendiente;

se bloquean los turnos económicos hasta que una regla de resolución estructural sea definida.

Esto evita ocultar una decisión provisional dentro del motor.

# INTEGRACIÓN ECONOMÍA ↔ EJÉRCITO

Antes de cada turno económico se recalculan:

Gold Upkeep;

Mana Upkeep;

Population Upkeep;

ocupación residencial;

ocupación alimentaria

a partir de las cantidades persistentes del ejército.

Por tanto las bajas de batalla afectan automáticamente a la economía del siguiente turno.

# RESULTADO DE TESTS

Suite unificada:

71 tests ejecutados.

71 PASS.

0 FAIL.

Composición:

13 Economy.

48 Battle.

10 Realm.

# REALM TESTS

R001 Upkeep inicial desde ejército.

R002 Turno económico persistente.

R003 Upkeep tras cambio de Quantity.

R004 Regular persiste bajas y territorio.

R005 Tierra conquistada entra en Wilderness.

R006 Daño territorial no resuelto crea deuda explícita.

R007 Siege persiste muerte del mago.

R008 Validación de turnos.

R009 Secuencia economía + batalla.

R010 Determinismo serializado.

# INTERPRETACIÓN

La integración no ha requerido reescribir Economy ni Battle.

No se han detectado incompatibilidades estructurales entre ambos modelos.

El primer error de compilación fue de tipado del Event Log.

El único fallo posterior fue un fixture de test mal parametrizado.

Tras corregir ambos:

71/71 verde.

# SIGUIENTE HITO

Realm Simulator v0.2:

capa transaccional de comandos;

validación de invariantes;

snapshot/replay;

stress test de cientos/miles de acciones;

posteriormente incorporar acciones de reino adicionales sólo cuando su fórmula esté cerrada en la Biblia.

# ACTUALIZACIÓN v0.2

Se añade una capa transaccional sobre Realm Simulator.

NUEVAS GARANTÍAS

Comandos atómicos.

Una acción inválida se ejecuta sobre un draft y no muta el mundo real.

Validación de invariantes después de cada comando válido.

IDs de stack globalmente únicos.

Command Log persistente.

Replay determinista desde estado inicial + lista de comandos.

Detección de estados corruptos.

Stress test de 1.000 acciones consecutivas.

INVARIANTES ACTUALES

Turns >= 0.

Land >= 0.

Gold >= 0.

Mana >= 0.

Population >= 0.

Fortresses >= 0.

Stack Quantity >= 0.

Stack IDs únicos globalmente.

Dead mage no puede conservar Fortalezas en este ruleset.

Event sequence estrictamente creciente.

TESTS

Suite total:

77 ejecutados.

77 PASS.

0 FAIL.

Stress:

1.000 acciones económicas aplicadas mediante transacciones.

1.000 comandos confirmados.

1.000 eventos de Realm.

Estado final válido.

Replay y determinismo continúan verdes.

SIGUIENTE FASE

Antes de añadir nuevas acciones jugables debemos cerrar o parametrizar las reglas que aún impedirían una mini-Era completa:

selección de edificios destruidos al perder tierra;

construcción/exploración como comandos de Realm;

Research y Spell State persistentes;

protecciones/counters a nivel de Realm;

Net Power recalculado desde estado persistente.

ACTUALIZACIÓN v0.3 — EXPLORE, BUILD Y NET POWER

Se incorporan tres comandos/lecturas fundamentales del crecimiento de reino.

Explore:

modelo LINEAR_18_26_TO_ZERO_PROVISIONAL.

Alrededor de 200 acres reproduce 18–26 acres por turno según roll inyectado.

La eficiencia cae con el tamaño y llega a 0 cerca de 3.500 acres.

La fórmula está explícitamente marcada como provisional porque la curva MARI exacta sigue sin recuperarse.

Build:

capacidad compartida basada en los Talleres existentes al comenzar el lote.

Costes de capacidad:

Farms/Barracks = 5.

Workshops = 10.

Guilds = 20.

Towns/Nodes = 30.

Fortresses = 300.

Barriers = 1 por turno mediante vía exclusiva en el ruleset actual.

Los Talleres construidos dentro del lote no aumentan la capacidad de ese mismo comando.

Net Power:

se implementa la fórmula legacy provisional ya descrita en la Biblia, con desglose auditable por Land, Fortresses, Barriers, Mana, Population, Gold, Spell Level, items, heroes, allies y army Power Rank.

Estado después de v0.3:

85 tests.

85 PASS.

0 FAIL.

ACTUALIZACIÓN v0.4 — RESEARCH Y SPELL STATE

Se añade investigación persistente y estado de hechizos.

Modelo:

TR_2008_CALIBRATED_PROVISIONAL.

Producción base de Research:

floor(sqrt(Guilds) × 3,5).

Con 150 Guilds produce 42 puntos/turno.

Multiplicadores de coste calibrados:

OWN = 1,000.

ADJACENT = 0,568.

OPPOSITE = 0,398.

Estos valores reproducen los resultados históricos conocidos de una prueba de investigación y se conservan como constantes de calibración, no como constantes MARI demostradas.

Sage Researching:

reducción = 6% + 3% por skill level.

Concentration:

reducción = 0,05% por Spell Level, con límite definido por Ruleset.

Spell State:

knownSpellIds.

currentResearch.

remainingCost.

alignment.

effectiveCost.

modificadores fotografiados al inicio del objetivo.

Al completar, el hechizo se añade al repertorio y aumenta Spell Level según rango.

Restricciones:

propio: investigación normal hasta Ultimate.

adyacente: Simple/Medium/Complex.

opuesto: Simple/Medium.

Phantasm conserva la excepción de investigación Complex off-color.

Ancient no entra en Research normal.

Spillover:

si sobran puntos al completar un hechizo, pueden aplicarse al siguiente objetivo dentro del mismo turno.

Caveat actual:

Sage y Concentration se fotografían al iniciar cada objetivo de investigación. Cambiar esos modificadores a mitad del mismo hechizo no recalcula automáticamente el progreso restante en v0.4.

VALIDACIÓN v0.4

La suite completa ejecuta:

94 tests.

94 PASS.

0 FAIL.

La calibración reproduce:

los cinco tiempos conocidos sin Sage;

los cinco tiempos conocidos con Sage Researching nivel 5;

los dos ejemplos documentados de Concentration;

Research end-to-end;

spillover;

rollback de Research ilegal;

replay determinista con Research.

# ACTUALIZACIÓN v0.3–v0.6

v0.3 — GROWTH CORE

Se incorporan Explore, Build y Net Power derivado.

Explore usa LINEAR_18_26_TO_ZERO_PROVISIONAL.

Build usa capacidad clásica compartida basada en Workshops.

Net Power usa la fórmula legacy provisional del FAQ.

Resultado acumulado tras v0.3: 85 tests verdes.

v0.4 — RESEARCH + SPELL STATE

Se incorpora investigación persistente, relación de escuelas, elegibilidad por rango, spillover, Spell Level y calibración TR 2008.

Con 150 Guilds el motor produce 42 puntos/turno y reproduce los tiempos documentados con y sin Sage Researching.

Resultado acumulado tras v0.4: 94 tests verdes.

v0.5 — PROTECCIONES Y COUNTERS

Se incorporan y validan:

Apprentice Protection;

Damage Protection;

Counter Window 24h;

Council Protection;

Meditation;

expiración temporal determinista.

Resultado acumulado tras v0.5: 104 tests verdes.

v0.6 — SCENARIO RUNNER / MINI-ERA

Se incorpora runRealmScenario().

El runner:

ejecuta comandos transaccionales;

valida invariantes después de cada acción;

crea checkpoints;

calcula Net Power por mago;

reconstruye toda la partida mediante replay;

falla si el estado final no es idéntico.

MINI-ERA R045

269 comandos mixtos.

2 magos persistentes.

Incluye:

Explore;

Build;

Research;

200 acciones económicas;

Regular;

Counter;

avance temporal;

60 acciones económicas adicionales.

Resultado:

replay idéntico;

0 deuda territorial;

hechizos persistentes;

invariantes válidos.

ESTADO GLOBAL

107 tests ejecutados.

107 PASS.

0 FAIL.

SIGUIENTE HITO

Pasar de escenario guionizado a agentes de decisión simples:

economía;

crecimiento;

investigación;

selección de objetivo;

ataque.

La meta será dejar que varios magos jueguen una mini-Era autónoma y analizar si aparecen bucles degenerados, exploits o economías imposibles.

