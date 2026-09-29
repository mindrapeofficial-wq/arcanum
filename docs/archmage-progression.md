# ARCANUM · Progresión del Archimago

Estado: persistencia y gasto de atributos implementados en Beta 0.2.21; las fuentes de XP siguen desactivadas.

## Principios

El Archimago es una capa independiente del Reino y del Ejército. Su progresión debe aportar identidad, desbloqueos y especialización sin sustituir la estrategia militar ni convertir el poder personal en una vía para aplastar ejércitos por nivel.

La experiencia debe premiar logros significativos, no clics repetibles. No se concederá XP directamente por gastar turnos, construir unidades sueltas o repetir una acción barata.

## Curva de nivel

- Nivel inicial: 1
- Nivel máximo de beta: 50
- XP para pasar del nivel L al siguiente:
  `round10(100 + 45 × (L - 1) + 2 × (L - 1)^2)`
- XP total aproximada para alcanzar nivel 50: 133.890
- En nivel 50 la barra se considera completa y no existe un siguiente nivel.

Referencias de ritmo:

| Nivel actual | XP al siguiente |
| ---: | ---: |
| 1 | 100 |
| 5 | 310 |
| 10 | 670 |
| 20 | 1.680 |
| 30 | 3.090 |
| 40 | 4.900 |
| 49 | 6.870 |

## Atributos

Todos los Archimagos parten conceptualmente de 1 en cada atributo. La Escuela podrá especializar el comportamiento de esos atributos más adelante, pero no debe alterar las reglas base.

- Poder Arcano
- Conocimiento
- Voluntad
- Influencia

Reglas iniciales:

- 1 punto de atributo por nivel ganado.
- Tope de beta por atributo: 20.
- Los puntos no gastados se conservan.
- El servidor será la autoridad para gastar puntos.
- Ningún atributo modifica todavía PvP, economía o magia hasta que su fórmula específica tenga pruebas de balance.

## Fuente de verdad

La futura base de datos debería almacenar `archmage_total_xp` como fuente de verdad. Nivel, progreso actual y XP necesaria para el siguiente nivel se derivan de ese valor.

Esto evita estados imposibles como “nivel 8 con la XP de nivel 3”.

Durante la transición, el cliente acepta también el contrato provisional anterior:
`archmage_level`, `archmage_xp` y `archmage_xp_next`.

## Política de XP futura

Las fuentes de XP deberán representar hitos o resultados verificables por el servidor. Candidatos:

- completar una expedición PvE;
- derrotar un encuentro o jefe por primera vez o bajo límites de repetición;
- completar investigación relevante;
- completar objetivos estacionales;
- hitos de exploración;
- participación válida en conflictos, con medidas contra enfrentamientos pactados o cuentas secundarias.

No se conectará ninguna fuente de XP hasta que exista una regla anti-farming específica para ella.

## Estado de integración

Completado:

1. Persistencia de XP y atributos por reino/temporada.
2. Lectura de progresión integrada en la ficha del Archimago.
3. RPC transaccional para gastar exactamente un punto.
4. Restricción de acceso directo a la tabla y validación del presupuesto de atributos.
5. Pruebas de la curva y del flujo de interfaz.

Pendiente, deliberadamente:

1. Fuentes de XP con reglas anti-farming.
2. Primer atributo con efecto real.
3. Simulación de balance.
4. PvE y recompensas.
5. Integración controlada con PvP.

La prioridad es mantener separadas las capas Archimago, Reino y Ejército.
