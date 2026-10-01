<!-- Snapshot imported from Google Drive on 2026-10-01 for Claude cloud context. -->
<!-- Source: https://docs.google.com/document/d/1fc-h7l0zIPdpj5eezYvDiU311qLXOiYZl-ZIoiYU01Q/edit -->

# BATTLE SIMULATOR v0.4

> Primer motor de combate ejecutable de ARCANUM: Las Cinco Escuelas

Estado técnico

# OBJETIVO

Construir un motor de combate determinista y versionable que reproduzca las reglas documentadas y genere un BattleEventLog auditable.

# IMPLEMENTADO

Daño fixed-point.

Resistencias simples y multitipo.

Weakness y Scales.

Daño parcial acumulado.

Fatiga normal y Endurance.

Iniciativa.

Primary / Extra / Counter.

Flying y Ranged.

Stacking natural.

Natural vs Effective abilities.

Fort Bonus.

Barrier + Kingdom Resistance.

Pairing clásico PRE-2010 provisional.

BattleEventLog reproducible.

Steal Life durante Primary.

Resurrection antes de Healing.

Healing/Regeneration/Item Recovery multiplicativos.

Blood Curse.

Bajas permanentes.

Victoria Regular 5% / Siege 10% para ARCANUM_CLASSIC.

Siege Accuracy.

Ocupación territorial.

Captura/destrucción de Fortalezas.

Muerte inmediata a 0 Fortalezas.

# PAIRING

Se implementa ARCANUM_CLASSIC_PAIRING_0_1.

Ground Melee busca ground alcanzable no emparejado.

Flying/Ranged prioriza Flying no emparejado y después ground.

Los leftovers vuelven provisionalmente al top reachable.

El filtro exacto de fake stacks y algunos tie-breaks siguen marcados como arqueología pendiente.

# DETERMINISMO

No se usa Math.random() para resolver daño.

Accuracy, Rand y demás valores aleatorios pueden inyectarse de forma explícita.

El mismo estado + ruleset + secuencia de Rand produce el mismo BattleEventLog.

# RESULTADO DE TESTS

43 tests ejecutados.

43 PASS.

0 FAIL.

# CASOS CANÓNICOS YA VERDES

T001–T016.

T022–T031.

T033–T035.

Más tests propios de Pairing, Event Queue, Siege Accuracy y resolución territorial.

# ALCANCE ACTUAL

v0.4 todavía no es una batalla completa end-to-end con reino atacante/defensor y persistencia.

Las piezas centrales ya existen como funciones puras y probadas.

# CRITERIO DE v0.5

Una llamada única deberá:

recibir atacante, defensor, Attack Mode y ruleset;

construir stacks;

aplicar Fort Bonus;

hacer pairing;

resolver event queue;

resolver recovery;

calcular bajas permanentes;

decidir victoria;

resolver tierra y Fortalezas;

emitir Mage Killed si procede;

devolver BattleEventLog + resumen final.

# SIGUIENTE PASO

Battle Simulator v0.5 end-to-end y después integración Economy + Battle en Realm Simulator.

# ACTUALIZACIÓN v0.5

Se ha añadido simulateBattleEndToEnd().

La llamada completa:

aplica Fort Bonus;

ejecuta pairing y Event Queue;

aplica Siege Accuracy dentro del engine;

resuelve Steal Life;

calcula bajas brutas;

aplica recovery;

calcula bajas permanentes;

decide victoria;

resuelve tierra;

resuelve captura/destrucción de Fortalezas;

evalúa MAGE_KILLED.

I02 Regular end-to-end = PASS.

I03 Siege end-to-end = PASS.

Resultado limpio:

48 PASS.

0 FAIL.

El BattleEventLog registra ahora Accuracy usada, Rand y resistencia media además del daño y bajas.

