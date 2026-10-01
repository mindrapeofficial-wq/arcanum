<!-- Snapshot imported from Google Drive on 2026-10-01 for Claude cloud context. -->
<!-- Source: https://docs.google.com/document/d/1_OGSrMw2imf_5OxVB63kWl8MMnpAoYHytDqFIidxwjM/edit -->

# ECONOMY SIMULATOR v0.1

> Primer núcleo ejecutable de ARCANUM: Las Cinco Escuelas

Estado técnico

# OBJETIVO

Construir un motor económico determinista y versionable que ejecute las reglas de la Biblia y produzca un ResourceLedger auditable por turno.

# ARQUITECTURA IMPLEMENTADA

src/types.ts

Define Buildings, RealmEconomyState, EconomyRuleset, EconomyCapacities, ResourceLedger, CrisisEvent y TurnResolution.

src/rulesets.ts

Contiene ARCANUM_CLASSIC_0_1 y TR_MODERN_0_1. Las fórmulas históricas variables viven aquí y no se incrustan en la lógica del motor.

src/math.ts

Implementa aritmética determinista auxiliar, incluida raíz cuadrada entera con fixed-point para evitar depender de float binario en la fórmula legacy de Oro.

src/economy.ts

Implementa:

capacidad residencial;

capacidad alimentaria;

capacidad de Maná;

soporte de reclutas;

crecimiento de población;

taper provisional 90–100%;

Oro legacy;

Oro moderno;

producción de Maná;

mantenimiento progresivo de Fortalezas;

Tax;

MP Charge;

ResourceLedger;

detección de shortfalls.

src/index.ts

Superficie pública del paquete.

# DECISIÓN DE DETERMINISMO

Los recursos y cantidades se representan como bigint.

La fórmula legacy de Oro utiliza una raíz cuadrada entera en fixed-point.

El objetivo es que el mismo estado + ruleset produzca el mismo resultado en cualquier servidor.

# CORRECCIÓN ENCONTRADA DURANTE IMPLEMENTACIÓN

La primera implementación aplicaba el límite de Maná después del mantenimiento.

La Biblia especifica:

producción → límite de almacenamiento → mantenimiento.

El código fue corregido y se añadió un test de regresión específico.

Ejemplo:

Mana inicial = 99.500.

Capacidad = 100.000.

Producción = 1.080.

Upkeep = 1.000.

Resultado correcto:

99.500 + 1.080 = 100.580.

Cap a 100.000.

Upkeep = 1.000.

Mana final = 99.000.

# TESTS EJECUTADOS

9 tests ejecutados.

9 PASS.

0 FAIL.

Cubierto:

T017 Producción de Maná.

T018 Crecimiento base de Población.

T019 Ingreso de Oro legacy.

T020 Mantenimiento de Fortalezas.

T021 Economía negativa con reserva.

Capacidades conocidas de edificios.

I01 Turno económico completo y ResourceLedger.

Taper provisional de Población.

Regresión de cap de Maná antes del upkeep.

# ALCANCE ACTUAL

El motor económico ya puede utilizarse como librería pura sin base de datos, interfaz o servidor.

Esto es deliberado: primero validamos las reglas y después conectamos persistencia, API y UI.

# PENDIENTES DEL ECONOMY ENGINE

Prioridad histórica exacta cuando el Oro llega a 0.

Prioridad histórica exacta cuando el Maná llega a 0.

Disband de unidades por crisis.

Destrucción progresiva de edificios por bancarrota.

Mantenimiento exacto de edificios que aún no está cerrado.

Modificadores económicos de dioses.

Modificadores económicos de héroes.

Modificadores de hechizos/encantamientos.

Modificadores de Unique Items.

Redondeos históricos por ruleset.

Residencia de Nodos/Barreras si se confirma.

# CRITERIO DE V0.2

Economy Simulator v0.2 deberá:

ejecutar múltiples turnos secuenciales;

aplicar modificadores mediante Effect Engine;

resolver crisis de recursos mediante reglas versionadas;

exportar ResourceLedger serializable;

ejecutar todos los tests económicos CORE del Test Suite;

permitir simulación de 1.000+ turnos sin estado inconsistente.

# SIGUIENTE PASO

Tras estabilizar Economy Simulator v0.2, el siguiente gran componente será Battle Simulator, compartiendo el mismo modelo Ruleset y Event Log.

# ACTUALIZACIÓN v0.2

El motor añade:

simulación de múltiples turnos;

Economy Modifier Engine;

prioridad determinista de modificadores;

ADD, MULTIPLY_PERMILLE y OVERRIDE;

registro de modificadores aplicados en ResourceLedger;

serialización segura de BigInt.

Resultado limpio de tests:

13 PASS.

0 FAIL.

El paquete queda preparado para conectar hechizos, dioses, héroes y objetos a la economía mediante datos en vez de lógica hardcodeada.

