<!-- Snapshot imported from Google Drive on 2026-10-01 for Claude cloud context. -->
<!-- Source: https://docs.google.com/document/d/1b-Qu17_mGLNgBfOsa9WiHBCl1yuv0BNp7zEWm7OcEzs/edit -->

# BIBLIA DE ARCANUM: LAS CINCO ESCUELAS

> Documento maestro de reglas, mecánicas y arquitectura

Versión de consolidación 0.8

# PROPÓSITO DEL DOCUMENTO

Este documento reúne y consolida las reglas, fórmulas, sistemas, criterios de reconstrucción y decisiones de diseño definidas hasta ahora para ARCANUM: Las Cinco Escuelas. El objetivo es que funcione como especificación viva del proyecto y como base suficiente para desarrollar una réplica moderna, en español, del núcleo estratégico de Archmage: Reincarnation from Hell, conservando su profundidad y separando siempre las reglas históricas de MARI de las modificaciones posteriores de The Reincarnation.

# CRITERIO HISTÓRICO Y NIVEL DE CONFIANZA

[A] Canónico MARI: regla documentada como perteneciente al Archmage original.

[B] Heredado / alta confianza: mecánica conservada en The Reincarnation y probablemente heredada del original, aunque la cifra exacta todavía no esté confirmada con una fuente contemporánea de MARI.

[C] Post-MARI / por verificar: regla añadida, modificada o reajustada posteriormente, o cuya fecha exacta todavía no ha sido establecida.

Toda cifra sensible al servidor o a la época deberá guardarse versionada. Nunca se mezclará automáticamente un valor de Arch Server, Blitz moderno o Ultimate con el modo clásico.

## 1. IDENTIDAD DEL JUEGO

ARCANUM: Las Cinco Escuelas será un juego persistente de estrategia por turnos para navegador y móvil. Cada jugador encarna a un archimago, gobierna un reino, administra territorio y recursos, investiga magia, invoca o recluta criaturas, combate contra otros jugadores, participa en gremios y atraviesa eras que culminan en Armagedón y reinicio global.

## 2. PRINCIPIO CENTRAL DE DISEÑO

La profundidad surge de sistemas que interactúan entre sí, no de complejidad decorativa. La fuerza total de un reino no determina automáticamente la victoria. La eficiencia territorial, el orden de las formaciones, las resistencias, la iniciativa, el tipo de ataque, la fatiga, la precisión, los hechizos, objetos, héroes y el emparejamiento de objetivos pueden permitir a un ejército de menor Poder Neto derrotar a uno superior.

Regla de producto: no simplificar el motor. Simplificar su comprensión mediante interfaz, tooltips, comparadores, informes y explicaciones.

## 3. BUCLE FUNDAMENTAL

El ciclo principal es:

Turnos → explorar → construir → generar oro, maná, población y alimentos → investigar → aprender hechizos → crear ejército → espiar → atacar o defender → conquistar territorio → aumentar Poder Neto → entrar en política de gremios → participar en Armagedón → fin de Era → nueva Era.

## 4. TURNOS

Los turnos son la unidad temporal fundamental. Se acumulan con el tiempo y se gastan en acciones como explorar, construir, investigar, cargar maná, lanzar determinados hechizos y atacar.

Los servidores históricos utilizaban ritmos diferentes. Como referencia aproximada:

Blitz: 1 turno cada 5 minutos.

Server: 1 turno cada 10 minutos.

Ager: 1 turno cada 15 minutos.

Apprentice: 1 turno cada 20 minutos.

El límite de turnos almacenables depende del ruleset. La arquitectura de ARCANUM deberá permitir varios ritmos de servidor.

## 5. LAS CINCO ESCUELAS

Ascendente, blanco: santidad, protección, curación, resurrección y criaturas celestiales.

Verdante, verde: naturaleza, crecimiento, economía, regeneración y control del tempo.

Erradicación, rojo: destrucción, fuego, relámpago, fuerza y cataclismo.

Abisal, negro: muerte, nigromancia, demonios, corrupción, sacrificio y robo de vida.

Fantasma, azul: ilusión, conocimiento, manipulación, control psíquico y versatilidad.

Relaciones:

Ascendente: adyacentes Verdante y Fantasma; opuestas Erradicación y Abisal.

Verdante: adyacentes Ascendente y Erradicación; opuestas Abisal y Fantasma.

Erradicación: adyacentes Verdante y Abisal; opuestas Ascendente y Fantasma.

Abisal: adyacentes Erradicación y Fantasma; opuestas Ascendente y Verdante.

Fantasma: adyacentes Abisal y Ascendente; opuestas Verdante y Erradicación.

## 6. LOCALIZACIÓN ESPAÑOLA

La versión principal será 100% española de cara al jugador. Menús, tutoriales, informes, edificios, recursos, habilidades, objetos, héroes, dioses, hechizos y mensajes del sistema se mostrarán en castellano.

El código conservará identificadores internos neutrales y estable. Cada entidad tendrá, al menos, nameOriginal y nameES.

Terminología base:

Land = Tierras.

Wilderness = Terreno salvaje.

Geld = Oro.

Mana / MP = Maná.

Population = Población.

Food = Alimentos.

Turns = Turnos.

Net Power = Poder Neto.

Spell Level = Nivel Mágico.

Stack = Formación.

Hit Points = Puntos de Vida.

Attack Power = Poder de Ataque.

Accuracy = Precisión.

Initiative = Iniciativa.

Counter Attack = Contraataque.

Extra Attack = Ataque adicional.

Upkeep = Mantenimiento.

Regular Attack = Ataque.

Siege = Asedio.

Pillage = Saqueo.

Black Market = Mercado Negro.

Fortresses = Fortalezas.

Barriers = Barreras.

## 7. TERRITORIO Y EDIFICIOS

La tierra se mide en acres. Cada acre puede estar sin desarrollar o contener una construcción.

Edificios fundamentales:

Granjas: producen alimentos y aportan capacidad residencial.

Pueblos: aportan población y economía.

Nodos: producen y almacenan maná.

Talleres: aceleran construcción.

Gremios/Bibliotecas: aceleran investigación y participan en otros sistemas mágicos.

Cuarteles: permiten reclutamiento.

Fortalezas: supervivencia del mago y defensa.

Barreras: protección mágica.

Terreno salvaje: tierra no desarrollada.

## 8. GRANJAS

Valor heredado documentado:

Cada granja produce aproximadamente 500 unidades de alimento y aporta aproximadamente 100 plazas residenciales.

La comida mantiene población y determinadas tropas.

## 9. PUEBLOS

Cada pueblo aporta aproximadamente 1.000 plazas residenciales y contribuye a la generación de Oro. La producción exacta debe versionarse por ruleset.

## 10. NODOS Y MANÁ

Cada Nodo permite almacenar aproximadamente 1.000 MP.

Una fórmula documentada de rendimiento:

Yield = XL / 100 + N(100 − X) / 10

N = número de Nodos.

L = tierra total.

X = floor(100N/L).

El rendimiento máximo teórico aparece alrededor del 55% del territorio en Nodos, aunque configuraciones menores pueden ser territorialmente más eficientes. Marcar como [B/C] hasta confirmar la versión exacta MARI.

## 11. TALLERES

Fórmulas documentadas de construcción por turno:

Granjas/Cuarteles = (Talleres + 1) / 5.

Talleres = (Talleres + 1) / 10.

Gremios = (Talleres + 1) / 20.

Pueblos/Nodos = (Talleres + 1) / 30.

Fortalezas = (Talleres + 1) / 300.

Barreras = 1 por turno.

La finalidad es que la construcción sea un problema real de optimización.

## 12. CUARTELES

Cada Cuartel aporta aproximadamente 20 plazas residenciales y soporte para unas 150 unidades reclutables antes de que utilicen capacidad poblacional normal. La cantidad reclutable depende del número de cuarteles y del coste de la unidad.

## 13. FORTALEZAS

Regla esencial: 0 fortalezas implica muerte del mago.

Las Fortalezas también mejoran la supervivencia defensiva. Costes, mantenimiento y bonificaciones exactas deberán versionarse.

## 14. BARRERAS

Las Barreras protegen contra magia hostil. Una regla moderna documentada sitúa aproximadamente un 2,5% del territorio en Barreras para alcanzar alrededor de 75% de protección base. Debe verificarse históricamente.

Los Talleres no aceleran su construcción normal: 1 Barrera por turno.

## 15. RECURSOS FUNDAMENTALES

Tierras, Turnos, Oro, Maná, Población, Alimentos, Poder Neto y Nivel Mágico.

Sistemas secundarios enlazados: ejército, héroes, objetos, encantamientos, fortalezas, barreras, relaciones diplomáticas, gremios, dioses y protecciones.

## 16. PODER NETO

El Poder Neto representa tamaño y poder agregado, pero no eficacia táctica absoluta.

Puede incorporar territorio, fortalezas, barreras, recursos, nivel mágico, objetos, héroes y ejército.

Las fórmulas históricas varían. Ejemplos documentados muestran discrepancias en valores de Barreras, Oro y Héroes según época. La base de datos deberá guardar cada fórmula por ruleset y fecha.

## 17. INVESTIGACIÓN MÁGICA

Los hechizos se investigan principalmente mediante Gremios/Bibliotecas. Cuantos más se tengan, mayor velocidad de investigación.

Rangos fundamentales:

Simple: +1 Nivel Mágico.

Medio: +3.

Complejo: +7.

Supremo: +20.

Antiguo: +15.

Una Era puede comenzar con una fase económica especializada en investigación y posteriormente reconstruir el reino para guerra.

## 18. AFINIDAD DE HECHIZOS

El coste de maná depende de la relación entre la escuela del mago y la del hechizo.

Simple: propio ×1,00; adyacente ×1,25; opuesto ×2,00.

Medio: propio ×1,00; adyacente ×1,50; opuesto ×3,50.

Complejo: propio ×1,00; adyacente ×2,00; opuesto ×6,00.

Supremo: sólo propio.

Antiguo: propio ×1,00; adyacente ×1,25; opuesto ×2,00.

Las invocaciones fuera de color sufren aproximadamente -25% de rendimiento si son adyacentes y -50% si son opuestas.

## 19. INVESTIGACIÓN SEGÚN ESCUELA

Una escuela normal puede investigar Simple, Medio y Complejo propios; Simple, Medio y Complejo adyacentes; y sólo Simple y Medio opuestos. Los Supremos dependen del ruleset.

Fantasma posee acceso excepcional y puede investigar Simple, Medio y Complejo de todas las escuelas.

## 20. PROBABILIDAD DE LANZAMIENTO

Fórmulas base documentadas para color propio:

Simple = SL × 0,10% + 140%.

Medio = SL × 0,10% + 130%.

Complejo = SL × 0,10% + 90%.

Supremo = SL × 0,10% + 80%.

Antiguo = SL × 0,10% + 85%.

Modificadores aproximados:

Adyacente = éxito ×0,53.

Opuesto = éxito ×0,45.

Un fallo consume turnos y maná sin producir el efecto.

## 21. HECHIZOS ANTIGUOS

Cinco conocimientos excepcionales:

Ascendente: Heavenly Protection / Protección Celestial.

Verdante: Cancellation / Cancelación.

Erradicación: Earthquake / Terremoto.

Abisal: Corruption / Corrupción.

Fantasma: The Wall of Silence / Muro del Silencio.

No se investigan normalmente y deben obtenerse por mecanismos especiales.

## 22. CONCENTRACIÓN Y CONFUSIÓN

Concentración mejora el lanzamiento de magia y la eficiencia de investigación.

Fórmula documentada de bonificación:

Success × (1 + SpellLevelConcentration / 2900).

Confusión reduce la capacidad de lanzamiento del enemigo.

Propio: ×(1 - 0,0012 × SL).

Adyacente: ×(1 - 0,0009 × SL).

Opuesto: ×(1 - 0,0006 × SL).

## 23. ENCANTAMIENTOS

Los encantamientos pueden persistir durante varios turnos y consumir Maná por turno. Cuando un encantamiento está sobre otro reino, el lanzador puede pagar mantenimiento conforme el objetivo gasta turnos.

Entidad mínima:

caster, target, spell, spellLevel, remainingTurns, manaUpkeep, populationUpkeep, dispellable, cancellable.

## 24. CATÁLOGO MÁGICO ARCH

Catálogo Arch identificado: 133 hechizos.

Ascendente: 25.

Verdante: 27.

Erradicación: 24.

Abisal: 25.

Fantasma: 28.

Neutral/Plain: 4.

Neutrales localizados: Armagedón, Bendición Divina, Infierno Helado y Furia Divina.

La presencia en Arch Server confirma el ruleset Arch actual, no necesariamente una cifra idéntica a MARI.

## 25. IDENTIDAD VERDANTE

Verdante prioriza economía, sostenibilidad, invocación, resistencia, regeneración y control.

Ejemplos ya auditados:

Llamada de los Treants: invocación compleja; ficha Arch documenta 4 turnos, 34.600 MP y 3.000 investigación, con rendimiento dependiente del Nivel Mágico.

Crecimiento Vegetal: mejora HP, ataque principal y contraataque de Treefolk, a cambio de +20% mantenimiento.

Fórmula documentada: bonificación = 0,9524 × (SL actual / SL verde base)%.

Invocación del Clima: mejora producción de granjas.

Propio: +0,313 × SL alimentos por granja.

Adyacente: +0,140 × SL.

Opuesto: +0,072 × SL.

Rayo Solar: aumenta resistencia del reino frente a Abisal y Fantasma.

Propio: 0,085 × SL.

Adyacente: 0,020 × SL.

Opuesto: 0,007 × SL.

Red de la Reina Araña: reduce en 1 la Iniciativa de una formación enemiga aleatoria si no resiste.

Belleza Deslumbrante: añade temporalmente la habilidad Belleza a unidades élficas.

Cancelación: Hechizo Antiguo capaz de eliminar encantamientos del objetivo.

## 26. IDENTIDAD ERRADICACIÓN

Erradicación prioriza daño directo, destrucción territorial, presión y debilitamiento.

Ejemplos:

Bola de Fuego: daño Fire.

Propio = 1700 × SL.

Adyacente = 1000 × SL.

Opuesto = 800 × SL.

Golpe de Relámpago: daño Lightning y debilitamiento de AP principal, extra y contraataque.

Tirón Gravitatorio: afecta criaturas voladoras, puede eliminar temporalmente Flying y causar daño Melee.

Canto de Batalla: aumenta AP principal, extra y contraataque hasta aproximadamente +20%, pero puede reducir HP hasta aproximadamente -10%.

Tormenta de Meteoritos: encantamiento hostil que se dispara conforme el objetivo utiliza turnos y puede destruir edificios y población.

Terremoto: Hechizo Antiguo de sacrificio de Maná; la potencia depende de recursos sacrificados y relación entre Poderes Netos.

## 27. EJÉRCITO Y FORMACIONES

Todas las unidades idénticas forman una Formación.

StackNP = cantidad × PowerRank.

Stack% = StackNP / ArmyNP × 100.

La posición de una formación se altera por un modificador natural:

Ranged = ×1,00.

Terrestre no Ranged = ×1,50.

Flying = ×2,25.

BattlePositionScore = Stack% × modificador.

Las propiedades naturales usadas en stacking deben separarse de propiedades efectivas temporales recibidas durante batalla.

## 28. EMPAREJAMIENTO DE OBJETIVOS

El pairing decide qué formación ataca a cuál. Intervienen posición/poder relativo, porcentaje dentro del ejército, capacidad de alcanzar al objetivo, Flying/Ranged, tamaño relativo y asignaciones ya realizadas.

Los fake stacks pueden manipular el pairing. El algoritmo sufrió cambios posteriores a MARI, especialmente alrededor de 2010, por lo que deberán existir variantes como PAIRING_CLASSIC y PAIRING_TR_2010_PLUS.

## 29. FLYING Y RANGED

Una unidad terrestre Melee normalmente no puede atacar a una unidad Flying.

Una unidad Ranged sí puede.

Una unidad Flying puede atacar objetivos Flying o terrestres.

Los ataques Ranged normalmente no provocan Contraataque.

Flying también participa en stacking y puede evitar la penalización de precisión ofensiva en Asedio.

## 30. ATAQUES DE UNIDAD

Cada unidad puede poseer:

Ataque principal: poder, tipos, iniciativa y propiedad Ranged.

Ataque adicional: poder, tipos, iniciativa independiente y propiedad Ranged.

Contraataque: poder y tipos.

El ataque adicional debe convertirse en un evento independiente porque puede tener iniciativa mayor que el principal.

## 31. INICIATIVA

Las iniciativas mayores se resuelven primero.

Orden conceptual: 7 → 6 → 5 → 4 → 3 → 2 → 1 → 0.

Los empates pueden resolverse aleatoriamente según ruleset.

Una unidad dañada antes de su turno ataca con menos supervivientes. También puede haber sido fatigada antes de actuar.

## 32. FATIGA Y EFICIENCIA

Efficiency inicial = 1,00.

Ataque principal normal: Efficiency -= 0,15.

Intento de Contraataque normal: Efficiency -= 0,15.

Con Aguante/Endurance: penalización aproximada = 0,10.

Los fatigue stacks son pequeñas formaciones rápidas cuyo objetivo puede ser cansar al enemigo antes de que actúe.

## 33. PRECISIÓN

Precisión base normal = 30%.

Ataque de Asedio ofensivo normal ≈ 20%.

La Precisión funciona como multiplicador de daño, no como simple tirada binaria.

## 34. CURVA DE PRECISIÓN EXTREMA

Cuando las penalizaciones son muy elevadas existen rendimientos decrecientes documentados:

Penalización nominal 20% → Accuracy real aproximada 12%.

30% → 6%.

40% → 4%.

50% → 2%.

60% → 0%.

Debe implementarse mediante una función de ruleset, no mediante simple clamp lineal.

## 35. FACTOR ALEATORIO

Para la mayoría de ataques:

Rand ∈ [0,2, 0,8].

Para estimaciones teóricas puede usarse 0,5.

Magic/Psychic tuvo reglas históricas distintas: una variante antigua usaba Rand = 1 y otra posterior duplicó AP y normalizó Rand a 0,2–0,8. El ruleset deberá elegir modelo.

## 36. RESISTENCIAS

Cada criatura puede tener resistencias independientes a:

Missile, Fire, Poison, Breath, Magic, Melee, Ranged, Lightning, Cold, Paralyse, Psychic y Holy.

Además existen resistencias frente a las cinco escuelas mágicas.

attackResistance[type] y spellResistance[school] son sistemas diferentes.

## 37. ATAQUES MULTITIPO

Si un ataque tiene varios tipos, se utiliza una resistencia media documentada.

Ejemplo:

Fire resistance 75%.

Breath resistance 0%.

AvgRes = (0,75 + 0) / 2 = 0,375.

ResistanceFactor = 1 - 0,375 = 0,625.

## 38. FÓRMULA GENERAL DE DAÑO

Damage =

NumberOfAttackers

× AttackPower

× Efficiency

× Accuracy

× RandomFactor

× ResistanceFactor

× OtherMultipliers.

UnitsKilled = Damage / TargetHitPoints.

El daño parcial se conserva durante la batalla:

accumulatedDamage += incomingDamage.

kills = floor(accumulatedDamage / HP).

unitsAlive -= kills.

accumulatedDamage %= HP.

## 39. CONDICIÓN DE VICTORIA

Para que el atacante gane debe:

1) destruir al menos 10% del ejército permanente del defensor;

2) destruir un porcentaje mayor del defensor que el porcentaje propio perdido;

3) conservar al menos una unidad.

Las unidades temporales no cuentan igual que las permanentes para estas comprobaciones.

## 40. TIPOS DE ATAQUE ESTRATÉGICO

Ataque regular: busca victoria y conquista territorial; máximo histórico aproximado de 5% de la tierra enemiga según ruleset.

Asedio: puede alcanzar aproximadamente 10%, interactúa con Fortalezas y aplica penalización ofensiva de Precisión a unidades normales.

Saqueo: guerra económica; puede destruir edificios y robar recursos u objetos.

## 41. FÓRMULAS DOCUMENTADAS DE SAQUEO

X = 0,005 × NP de tropas enviadas / Tierra enemiga.

X ≤ 1.

Granjas destruidas = floor(X × 60).

Pueblos destruidos = floor(X × 25).

Talleres destruidos = floor(X × 10).

Gremios destruidos = floor(X × 5).

Para un saqueo completo, NP enviado ≈ 200 × Tierra enemiga.

Población robada ≈ 1/6 × % de Granjas destruidas.

Población eliminada ≈ 1/3 × % de Granjas destruidas.

Oro robado ≈ 1/5 × % de Pueblos destruidos.

Robo de objeto requiere aproximadamente X > 0,2.

Estos valores deberán versionarse si se confirma diferencia histórica.

## 42. PROTECCIONES

Sistemas documentados:

Protección de Aprendiz inicial.

Protección por Daño tras sufrir suficiente daño acumulado.

Protección de Saqueo tras devastación económica.

Protección del Consejo en situaciones especiales.

Meditación como estado voluntario con inmunidades y restricciones.

También existen counters entre jugadores que permiten represalias fuera del rango normal durante un periodo documentado de unas 24 horas en determinadas reglas.

## 43. HABILIDADES DE UNIDAD

Golpe Adicional / Additional Strike: ejecuta dos veces el ataque principal. No duplica el ataque extra.

Belleza / Beauty: atacante -5 puntos porcentuales de Precisión.

Encanto / Charm: aproximadamente -0,5 Efficiency al ataque dirigido a la unidad; comportamiento exacto de contraataque pendiente de verificar.

Torpeza / Clumsiness: -10 puntos porcentuales de Precisión propia.

Aguante / Endurance: fatiga 10% en vez de 15%.

Miedo / Fear: atacante -15 puntos de Precisión; Fear contra Fear se neutraliza.

Volar / Flying: reglas de targeting, stacking y Asedio.

Curación / Healing: recupera aproximadamente 30% de las bajas del stack si queda algún superviviente.

Puntería / Marksmanship: +10 puntos porcentuales de Precisión.

Regeneración / Regeneration: recupera aproximadamente 20% de las bajas del stack si sobrevive.

Escamas / Scales: daño recibido ×0,75.

Asedio / Siege: ignora la penalización normal ofensiva de precisión de Asedio.

Robar Vida / Steal Life: convierte un porcentaje del daño primario en HP de nuevas unidades del mismo tipo; límite documentado aproximado de 10%.

Veloz / Swift: atacante -10 puntos porcentuales de Precisión.

Vulnerabilidad / Weakness: daño ×2 si el ataque contiene el tipo vulnerable.

Racial Enemy: bonificación contra determinadas razas; pendiente auditoría completa.

Otras habilidades menores deberán completarse durante la auditoría de las 98 unidades.

## 44. CURACIÓN Y REGENERACIÓN

Healing de unidad ≈ 30%.

Regeneration de unidad ≈ 20%.

Regeneration como hechizo es distinto:

mismo color ≈ 15%.

off-color ≈ 5%.

opuesto ≈ 2%.

Múltiples fuentes de recuperación se combinan multiplicativamente, no mediante suma simple.

Ejemplo: 30%, 30% y 25% → 1 - (0,70 × 0,70 × 0,75) = 63,25%.

## 45. ROBAR VIDA

Steal Life convierte daño del ataque principal en HP de unidades propias.

Ejemplo: 900.000 daño × 5% = 45.000 HP. Si cada Vampiro tiene 4.500 HP, se generan potencialmente 10 Vampiros.

Con economía positiva de Maná, una formación puede terminar con más unidades de las que comenzó. Con economía negativa, el efecto puede limitarse a recuperar pérdidas según ruleset.

## 46. CATÁLOGO DE UNIDADES ARCH

Catálogo Arch localizado: 98 unidades.

Erradicación: 15.

Verdante: 16.

Ascendente: 15.

Fantasma: 10.

Abisal: 22.

Plain: 20.

La ficha Arch confirma el ruleset Arch actual, no automáticamente el valor MARI original.

## 47. UNIDADES DE ERRADICACIÓN

Chimera, Dwarven Deathseeker, Dwarven Elite, Dwarven Shaman, Dwarven Warrior, Efreeti, Fire Giant, Hell Hound, Hydra, Lizard Man, Ogre, Red Dragon, Salamander, Troglodyte y Wyvern.

## 48. UNIDADES VERDANTES

Creeping Vines, Druid, Dryad, Elven Archer, Elven Blade Dancer, Elven Magician, Faerie Dragon, Gorilla, Griffon, High Elf, Mandrake, Nymph, Swanmay, Treant, Venus Flytrap y Werebear.

## 49. UNIDADES ASCENDENTES

Angel, Archangel, Astral Magician, Catapult, Crusader, High Priest, Knight, Knight Templar, Naga Queen, Paladin, Pegasus, Preacher, Soul Speaker, Spirit Warrior y Unicorn.

## 50. UNIDADES FANTASMA

Djinni, Medusa, Mind Ripper, Phantom, Psychic Wisp, Shadow Monster, Siren, Sprite, Sylph y Yeti.

## 51. UNIDADES ABISALES

Cave Troll, Dark Apprentice, Dark Elf Magician, Demon Knight, Devil, Fallen Angel, Fallen Archangel, Fallen Dominion, Gargoyle, Ghoul, Horned Demon, Imp, Lich, Orc Raider, Orcish Archer, Shadow, Skeleton, Succubus, Vampire, Wolf Raider, Wraith y Zombie.

## 52. UNIDADES PLAIN

Archer, Bounty Hunter, Capsule Monster, Cavalry, Falcon, Fanatic, Frog, Mercenary, Militia, Phalanx, Pikeman, Renegade Wizard, Sheep, Squirrel, Starving Peasant, Stone Golem, Trained Elephant, Venomesse, War Hound y Werewolf.

## 53. FICHAS DE REFERENCIA YA AUDITADAS

Red Dragon, Arch ruleset: PR 82.378; HP 120.000; primario 250.000 Melee, iniciativa 1; counter 50.000; extra 500.000 Fire+Breath, iniciativa 3; Flying, Scales, Endurance, Fear, Racial Enemy Elf +50%, Weakness Cold; mantenimiento documentado Arch 16.000 Oro + 50 MP + 180 Población.

Treant: PR 423; HP 4.200; AP 4.200 Melee, iniciativa 1; counter 1.680; extra 2.500 Melee; Additional Strike, Endurance, Weakness Fire.

Archangel: PR 750; HP 5.000; AP 4.000 Holy, iniciativa 2; counter 400; Flying, Beauty, Healing.

Djinni: PR 1.700; HP 7.650; AP 8.000 Magic, iniciativa 2; counter 1.200; extra 12.000 Lightning+Ranged, iniciativa 3; Flying, Marksmanship.

Vampire: PR 2.058; HP 4.500; primario 9.000 Magic+Paralyse, iniciativa 2; counter 2.000; extra 12.000 Magic+Ranged, iniciativa 3; Charm, Flying, Marksmanship, Steal Life 5%, Swift y vulnerabilidad relativa a Holy.

Archer: PR 12; HP 80; AP 80 Missile+Ranged, iniciativa 3; sin counter.

Stone Golem: PR 1.984; HP 15.000; AP 20.000 Melee, iniciativa 1; counter 20.000; Clumsiness, Endurance y Siege.

## 54. POWER RANK

Power Rank participa en Net Power y en el peso de las formaciones, pero no representa por sí mismo la capacidad real de combate.

No existe proporcionalidad directa entre PR, HP y AP. Las habilidades, resistencias y timing pueden hacer que una unidad de PR bajo tenga enorme valor táctico.

## 55. INFORME DE BATALLA

El informe tendrá dos niveles.

Resumen: bajas, pérdidas porcentuales, territorio, fortalezas, recursos y efectos relevantes.

Análisis: cálculo detallado de cada evento, incluyendo cantidad, AP, Precisión, Eficiencia, Rand, resistencias, vulnerabilidades y modificadores.

Objetivo: hacer transparente la complejidad sin reducirla.

## 56. ORDEN GENERAL DE RESOLUCIÓN DE BATALLA

## 1. Preparar atacante y defensor.

## 2. Añadir unidades temporales.

## 3. Aplicar héroes, hechizos, objetos, encantamientos y habilidades previas.

## 4. Calcular y ordenar formaciones.

## 5. Ejecutar pairing.

## 6. Crear eventos de ataque.

## 7. Ordenar por Iniciativa.

## 8. Resolver cada evento: supervivencia del atacante, objetivo válido, AP, Efficiency, Accuracy, Rand, resistencias, multiplicadores, daño, daño acumulado, bajas, fatiga y posible Contraataque.

## 9. Ejecutar post-battle: recuperación, bajas permanentes, NP perdido y condición de victoria.

## 10. Resolver tierra, Fortalezas, recursos y experiencia.

El orden exacto de algunas curaciones, resurrecciones y efectos especiales sigue pendiente de auditoría.

## 57. OBJETOS

Existen Lesser Items y Unique Items.

Ejemplos documentados: Ash of Invisibility, Blood Stained Map, Book of Golem Summoning, Crystal Ball, Mana Crystal, Mana Vortex, Spider's Web, Staff of Illusion, Treasure Chest, Treasure Map y Voodoo Doll.

Los objetos pueden invocar, modificar iniciativa o resistencias, causar daño, destruir maná, generar recursos, espiar, robar o curar.

Pendiente: auditoría completa y separación histórica por versión.

## 58. HÉROES

Existen Battle Heroes y Non-Battle Heroes. Obtienen experiencia, niveles y habilidades.

Una fórmula documentada posteriormente: XP para siguiente nivel = 1.000 × nivel actual.

Se requiere catálogo completo y versión histórica de cada héroe.

## 59. DIOSES

Sistema confirmado de divinidades, favor y desfavor.

Nombres documentados incluyen Nature, Sun, Moon, Magic, Science, Satan y Lucifer.

Las tablas modernas no deben tomarse automáticamente como MARI. El sistema se conservará, pero los números precisos se versionarán.

## 60. GREMIOS Y DIPLOMACIA

Los gremios de jugadores son distintos de los edificios Gremio/Biblioteca.

Permiten cooperación, enseñanza, protección, diplomacia, guerra coordinada y política de servidor.

ARCANUM deberá preservar el metajuego social y permitir servidores con reglas distintas de gremios, solos y alianzas.

## 61. ARMAGEDÓN

Sistema de final de Era basado en siete sellos.

Cada lanzamiento válido de Armagedón rompe un sello. Tras el séptimo comienza la fase final que puede conducir al final de Terra y al reset.

La Era debe cerrar clasificación, resultados y memoria histórica antes del reinicio.

ARCANUM adoptará esta estructura como sistema de temporadas orgánicas.

## 62. ARQUITECTURA DE RULESETS

No existirá una única constante GAME_RULES. Existirá Ruleset.

Ejemplos:

CLASSIC_MARI: reconstrucción histórica.

ARCANUM_CLASSIC: experiencia clásica con correcciones de interfaz y errores.

ARCANUM_EVOLUTION: reglas nuevas y expansión propia.

Cada fórmula, unidad, hechizo y coste sensible puede tener versión por ruleset y periodo.

## 63. ARQUITECTURA DE UNIDAD

Unit:

id, nameOriginal, nameES, school, race, acquisitionAttributes, powerRank, hitPoints, primaryAttack, extraAttack, counterAttack, upkeep, recruitCost, abilities, spellResistances, attackResistances, relatedSpell, relatedItem, relatedHero, battleOnly, undisbandable, marketAllowed.

UnitVersion:

unitId, ruleset, validFrom, validUntil, powerRank, hp, ap, resistances, upkeep, abilities.

## 64. ARQUITECTURA DE HECHIZO

Spell:

id, nameOriginal, nameES, school, rank, attributes, researchCost, castTurns, baseManaCost, manaUpkeep, populationUpkeep, spellLevelContribution, targetType, successFormula, effectFormula, summonPool, onColorModifier, adjacentModifier, oppositeModifier, requiredSpellLevel, dispellable, cancellable, availability, historicalVersions.

## 65. ARQUITECTURA DE ARCHIMAGO

Mage:

id, name, school, createdAt, land, turns, gold, mana, population, food, spellLevel, netPower, protections, buildings, units, spells, enchantments, items, heroes, guildId.

## 66. ARQUITECTURA DE REINO

Kingdom:

mageId, totalLand, wilderness, farms, towns, nodes, workshops, guilds, barracks, fortresses, barriers, foodProduction, manaProduction, goldProduction, populationCapacity.

## 67. MOTOR DE EFECTOS

Los efectos no se codificarán como casos rígidos. Modelo:

SpellEffect:

trigger, targetSelector, affectedProperty, operation, formula, duration, conditions.

Ejemplo Red de la Reina Araña:

trigger PRE_BATTLE; target RANDOM_ENEMY_STACK; property INITIATIVE; operation ADD; value -1.

Ejemplo Crecimiento Vegetal:

target ALL_FRIENDLY_UNITS; condition race == TREEFOLK; modifica HP, PRIMARY_AP, COUNTER_AP y UPKEEP.

## 68. MOTOR POR EVENTOS

Eventos previstos:

TURN_SPENT.

BUILDING_COMPLETED.

SPELL_RESEARCHED.

SPELL_CAST.

ENCHANTMENT_TRIGGERED.

ARMY_CREATED.

BATTLE_STARTED.

ATTACK_EXECUTED.

UNIT_KILLED.

BATTLE_FINISHED.

LAND_CAPTURED.

PROTECTION_STARTED.

MAGE_KILLED.

ARMAGEDDON_SEAL_BROKEN.

ERA_ENDED.

Esto permite que sistemas como Tormenta de Meteoritos reaccionen a TURN_SPENT sin crear lógica aislada.

## 69. SERVIDOR AUTORITATIVO

El cliente nunca decide resultados económicos o militares. Solicita acciones y el servidor valida, calcula y devuelve el nuevo estado.

El servidor calcula daño, invocaciones, investigación, recursos, tierras, NP, protecciones y resultados de combate.

El cliente puede mostrar explicaciones del cálculo, pero no debe poder falsificarlo.

## 70. ARCANUM ALPHA 0.1

El Alpha deberá permitir:

crear cuenta;

crear archimago;

elegir una de las cinco escuelas;

recibir reino inicial;

acumular turnos;

explorar;

construir;

generar recursos;

investigar;

aprender hechizos;

invocar o reclutar;

organizar ejército;

buscar enemigo;

atacar;

recibir informe de batalla;

conquistar tierras.

## 71. CONTENIDO INICIAL DEL ALPHA

No es necesario implementar 98 unidades y 133 hechizos inmediatamente.

Objetivo de prueba: unas 20–25 unidades, 3–5 por escuela y algunas Plain.

Ejemplos iniciales:

Ascendente: Knight Templar, Unicorn, Archangel, High Priest.

Verdante: Elven Archer, Treant, Griffon, Nymph.

Erradicación: Hell Hound, Hydra, Efreeti, Red Dragon.

Abisal: Skeleton, Wraith, Vampire, Lich.

Fantasma: Sprite, Djinni, Medusa, Mind Ripper.

Hechizos iniciales: 4–6 por escuela cubriendo invocación, batalla, encantamiento, economía, defensa y ataque hostil.

## 72. BASE DE DATOS MÍNIMA

users.

mages.

kingdoms.

buildings.

unit_definitions.

mage_units.

spell_definitions.

mage_spells.

enchantments.

items.

mage_items.

heroes.

mage_heroes.

battles.

battle_stacks.

battle_events.

guilds.

guild_members.

diplomacy.

server_rulesets.

eras.

rankings.

## 73. PRINCIPIO DE EXPERIENCIA DE USUARIO

ARCANUM debe conservar matemáticas profundas pero mostrar primero información útil.

Ejemplo de lanzamiento:

Probabilidad de éxito: 82%.

Coste: 24.000 Maná.

Resultado estimado: 430–510 Vampiros.

Botón opcional: Ver detalles.

La información avanzada debe explicar la fórmula a quien quiera estudiarla.

## 74. PENDIENTES DE INVESTIGACIÓN

Algoritmo exacto del pairing clásico MARI.

Fórmula histórica exacta de varias economías y costes.

Orden exacto de efectos post-battle.

Charm y contraataques según época.

Catálogo completo de objetos.

Catálogo completo de héroes.

Sistema de dioses por era.

Mercado Negro.

Espionaje.

Diplomacia detallada.

Protecciones históricas por servidor.

Fórmulas exactas de Net Power por periodo.

Auditoría completa de las 98 unidades.

Auditoría completa de los 133 hechizos.

Reconstrucción profunda de Abisal y Fantasma.

Armagedón detallado y reglas de cierre de Era.

Diferencias sistemáticas MARI versus The Reincarnation.

## 75. PRINCIPIOS INNEGOCIABLES DE ARCANUM

Uno: profundidad antes que simplificación.

Dos: interfaz clara antes que opacidad.

Tres: ninguna fórmula histórica se presentará como universal si cambió por época.

Cuatro: español como idioma principal de experiencia.

Cinco: cliente ligero y servidor autoritativo.

Seis: datos y reglas versionados.

Siete: economía, magia y combate deben estar interconectados.

Ocho: Poder Neto nunca será equivalente automático a victoria.

Nueve: las cinco escuelas deben sentirse estratégicamente diferentes, no simétricas.

Diez: Armagedón y la renovación de las Eras forman parte del ADN del juego.

## 76. VISIÓN DEL PROYECTO

ARCANUM: Las Cinco Escuelas no pretende ser una copia superficial de Archmage. Pretende reconstruir con rigor su núcleo sistémico, conservar aquello que hacía especial su estrategia y traducirlo a una experiencia moderna para navegador y móvil.

La Biblia es la fuente de verdad del diseño. Cada nueva regla deberá incorporarse aquí con su procedencia, fórmula, estado de confianza, ruleset y relación con otros sistemas.

# APÉNDICE A. ESTADO DE RECONSTRUCCIÓN

Economía: aproximadamente 70%.

Edificios: aproximadamente 80%.

Turnos: aproximadamente 75%.

Escuelas: aproximadamente 95%.

Unidades: aproximadamente 40%.

Combate base: aproximadamente 70%.

Habilidades principales: aproximadamente 85%.

Magia: aproximadamente 60%.

Objetos: aproximadamente 30%.

Héroes: aproximadamente 30%.

Dioses: aproximadamente 30%.

Gremios y diplomacia: aproximadamente 50%.

Armagedón: aproximadamente 60%.

Historia MARI/TR: aproximadamente 35%.

Arquitectura Alpha: aproximadamente 50%.

# APÉNDICE B. FUENTES DE ARQUEOLOGÍA

Fuente principal de reconstrucción: wiki de The Reincarnation, especialmente sus secciones de Arch Server, batalla, stacking, unidades, hechizos, edificios, recursos, habilidades, objetos, héroes, dioses y Armagedón.

Se deberán conservar en una futura tabla de fuentes los enlaces concretos de cada fórmula y el ruleset al que pertenecen.

# FIN DE LA VERSIÓN 0.8

Este documento es vivo. Las siguientes ampliaciones prioritarias serán Abisal, Fantasma, catálogo completo de objetos, héroes, dioses, espionaje, Mercado Negro, diplomacia y Armagedón detallado.

## 77. ESCUELA ABISAL: IDENTIDAD Y CATÁLOGO

El ruleset Arch conserva 25 hechizos Abisales: Animate Ghouls, Animate Skeletons, Animate Zombie, Battle Lust, Blacken Soul, Blood Curse, Blood Ritual, Corruption, Curse, Death and Decay, Fear, Fear (spell), Foul Water, Gaze of Death, Kiss of the Vampire, Night of the Living Dead, Shroud of Darkness, Summon Dark Elf Magician, Summon Demon Knight, Summon Horned Demon, Summon Lich, Summon Shadow, Summon Vampire, Summon Wraith y Touch of Necromancy.

Identidad ARCANUM: muerte, desgaste, conversión de bajas en recursos, corrupción, demonios, no-muertos, debilitamiento y magia de sacrificio.

## 78. MANTO DE OSCURIDAD

Shroud of Darkness / Manto de Oscuridad es un encantamiento propio que aumenta la resistencia frente a magia Ascendente. Una fórmula documentada para color propio es aproximadamente 0,12 × SL de resistencia Ascendente; off-color 0,034 × SL; opuesto 0,03 × SL.

Además habilita una interacción especial: Blacken Soul, Curse o Fear pueden aplicar aproximadamente la mitad de su efecto de una sola formación a todas las formaciones enemigas cuando se usan como asignación defensiva.

Estado: [B] heredado/alta confianza; versionar por servidor.

## 79. MALDICIÓN DE SANGRE

Blood Curse / Maldición de Sangre es un hechizo Complejo de batalla. Su efecto documentado añade Blood Curse a todas las unidades amigas y evita que el daño que causen pueda ser recuperado mediante Healing o Regeneration en el ejército objetivo.

Esto crea una capa de anti-curación y convierte Abisal en el counter natural de ejércitos basados en resurrección, curación o regeneración.

Implementación propuesta: aplicar un marcador NO_HEAL_FROM_DAMAGE a las bajas provocadas durante esa batalla.

## 80. BESO DEL VAMPIRO

Kiss of the Vampire / Beso del Vampiro es un hechizo Complejo de batalla que concede Robar Vida a las unidades amigas.

Reglas documentadas en servidores compatibles con Arch: aproximadamente 10% Steal Life en color propio y 5% fuera de color. Las unidades que ya poseen Robar Vida pueden recibir mejoras adicionales, pero el sistema mantiene un límite documentado de 10% para el efecto final.

Debe reutilizar la misma habilidad STEAL_LIFE del motor de unidades, no crear una lógica paralela de hechizo.

## 81. TOQUE DE NECROMANCIA

Touch of Necromancy / Toque de Nigromancia es un encantamiento Complejo propio.

Regla documentada: puede convertir una parte de las unidades enemigas muertas en no-muertos que se unen al ejército del lanzador. La documentación conserva aproximadamente 30% de bajas convertidas en Zombis, con posibilidad de Wraiths y Liches mediante niveles altos de la habilidad Undead Mastery; el rendimiento depende del Nivel Mágico y tiene aleatoriedad.

También reduce el ingreso de Maná y puede quedar limitado a reemplazar pérdidas cuando la economía de Maná es negativa.

Estado: [C/B] porque algunas extensiones dependen de Skills modernas; la versión clásica debe separarse de Undead Mastery moderna.

## 82. CORRUPCIÓN

Corruption / Corrupción es el Hechizo Antiguo Abisal.

La ficha Arch documenta 10 turnos, 300.000 MP y adquisición excepcional. Puede invocar Fallen Angels, Fallen Archangels y Fallen Dominions.

Se obtiene mediante mecanismos excepcionales como Nether Parchment o Mercado Negro. Para un mago Abisal el Nether Parchment puede conceder el hechizo con éxito garantizado en reglas modernas documentadas; fuera de color puede existir riesgo de fallo y pérdida completa del Maná.

El dato exacto de cantidades invocadas debe marcarse [C?] hasta validar el ruleset clásico.

## 83. IDENTIDAD ESTRATÉGICA ABISAL

Abisal debe sentirse como una escuela que transforma muerte en ventaja:

bajas enemigas → no-muertos;

daño causado → Robar Vida;

curación enemiga → anulada;

población y edificios enemigos → desgaste;

protección contra Ascendente → Manto de Oscuridad;

magia prohibida → corrupción y criaturas caídas.

Su fortaleza no es sólo causar daño, sino alterar qué significa una baja y quién se beneficia de ella.

## 84. ESCUELA FANTASMA: IDENTIDAD Y CATÁLOGO

El ruleset Arch conserva 28 hechizos Fantasma:

Call Sirens, Concentration, Confuse, Double Time, Flight, Fog Cloud, Invisibility, Laziness, Lovesick, Mental Thrash, Mind Bar, Mirage Monster, Paralyze, Phantasm Magic, Phase Step, Scrying Mirror, Sleep, Slow, Steal Artifact, Summon Djinni, Summon Medusa, Summon Mind Ripper, Summon Psychic Wisp, Summon Snowbeast, Summon Sprite, Summon Sylph, Temporal Stasis Field y The Wall of Silence.

Identidad ARCANUM: conocimiento, manipulación, versatilidad, control temporal, alteración de precisión, iniciativa, vuelo, espionaje y sabotaje mágico.

## 85. DOBLE TIEMPO

Double Time / Doble Tiempo es un hechizo Medio de batalla.

Efecto documentado: aumenta la Precisión de una formación amiga aleatoria y, en color propio, puede añadir +1 Iniciativa a una formación amiga aleatoria. Ambos efectos pueden caer sobre la misma formación.

Bonificación de Precisión documentada:

propio +12 puntos porcentuales;

off-color +6;

opuesto +3.

Esto permite a Fantasma manipular directamente el orden y la calidad de los eventos de batalla.

## 86. SUEÑO

Sleep / Sueño es un hechizo Simple de batalla con dos efectos independientes sobre formaciones enemigas: reducir resistencias de daño y generar fatiga. Cada efecto puede elegir una formación distinta y ser resistido independientemente.

Una fórmula documentada para color propio ronda 0,38285 × SL / MaxPhantasmSL, aproximadamente 38% a máximo nivel del ruleset citado. Off-color y opuesto son aproximadamente la mitad y la cuarta parte respectivamente.

Estado: [B/C] hasta confirmar la fórmula exacta Arch/MARI.

## 87. CAMPO DE ESTASIS TEMPORAL

Temporal Stasis Field / Campo de Estasis Temporal es un encantamiento Complejo hostil.

En reglas documentadas, cada turno usado por el objetivo puede consumir además un turno adicional: 100% de probabilidad en color propio, 66% off-color y 33% opuesto. Puede llevar al objetivo a turnos negativos y desactivar temporalmente preórdenes en rulesets que las usan.

Esta mecánica confirma que los Turnos son también un vector de ataque y no sólo una barra de energía.

Debe modelarse como reacción al evento TURN_SPENT.

## 88. MURO DEL SILENCIO

The Wall of Silence / Muro del Silencio es el Hechizo Antiguo Fantasma.

Es un encantamiento epidémico y no cancelable por medios normales en reglas documentadas. Puede transmitirse entre magos mediante combates o saqueos y reduce fuertemente la concentración, dificultando el lanzamiento de hechizos.

Valores documentados en una variante compatible:

propio: reducción = 0,150 × SL%;

adyacente: 0,125 × SL%;

opuesto: 0,100 × SL%.

Las infecciones múltiples no se acumulan.

Debe existir una arquitectura de EPIDEMIC_ENCHANTMENT con transmisión por eventos de interacción entre magos.

Estado: [B/C] porque las cifras consultadas proceden de una variante Beta aunque el hechizo existe en Arch.

## 89. CONCENTRACIÓN Y CONFUSIÓN COMO EJE FANTASMA

Fantasma posee una relación privilegiada con la magia de otras escuelas. Concentración mejora investigación, éxito de lanzamiento y rendimiento off-color; Confusión ataca esos mismos procesos en el enemigo.

Esto define a Fantasma como la escuela que manipula el propio motor mágico.

Regla de diseño: Fantasma no debe ser el mayor especialista puro en daño, defensa o economía; debe ser el mayor especialista en cambiar las condiciones bajo las que funcionan los demás sistemas.

## 90. LAS CINCO ESCUELAS YA TIENEN IDENTIDAD SISTÉMICA

Ascendente: supervivencia, protección, Holy, curación y resurrección.

Verdante: crecimiento, economía, regeneración, naturaleza y control sostenido.

Erradicación: daño, destrucción, presión y cataclismo.

Abisal: muerte, desgaste, corrupción, sacrificio y conversión de bajas.

Fantasma: manipulación, conocimiento, tempo, precisión, iniciativa, espionaje y versatilidad.

Este reparto debe conservarse incluso cuando ARCANUM introduzca contenido nuevo.

## 91. SIGUIENTE BLOQUE DEL NÚCLEO

Con las cinco escuelas delimitadas, el orden de cierre del núcleo será:

1) Mercado Negro y adquisición de contenido raro.

2) Espionaje e información oculta.

3) Objetos menores y únicos.

4) Héroes y progresión.

5) Dioses, favor y castigo.

6) Gremios y diplomacia detallada.

7) Protecciones, muerte del mago y reglas anti-abuso.

8) Armagedón completo, Hall of Immortality y reset de Era.

9) Pairing clásico y fórmulas históricas todavía oscuras.

10) congelación de ARCANUM Core Rules v1.0.

## 92. MERCADO NEGRO: FUNCIÓN SISTÉMICA

El Mercado Negro es el principal sumidero competitivo de Oro y un canal alternativo para adquirir recursos que normalmente dependen de investigación, invocación o generación aleatoria.

En documentación conservada funciona como casa de subastas: colocar una o varias pujas consume un turno; el Oro pujado se retira temporalmente del tesoro; una nueva puja debe superar aproximadamente en 5% a la anterior; las pujas no pueden cancelarse y otros magos disponen de una ventana para superar la oferta.

ARCANUM debe conservar la idea central: el Mercado Negro no es una tienda con precios fijos, sino un sistema económico PvP donde escasez, información y oportunidad importan.

## 93. SUBMERCADOS DEL MERCADO NEGRO

Estructura histórica documentada:

Antique Store / Tienda de Antigüedades: compra y venta de objetos.

Spawning Hatchery / Criadero: criaturas generadas por hechizos hasta determinados rangos.

Tavern of Heroes / Taberna de Héroes: héroes.

Swords for Hire / Espadas de Alquiler: mercenarios Plain.

Exotic Mageware / Magia Exótica: hechizos Simple, Medio, Complejo y Antiguos según ruleset.

Altar of Darkness / Altar de la Oscuridad: donaciones a dioses para obtener favor.

My Bids / Mis Pujas: seguimiento de subastas.

La arquitectura de ARCANUM deberá modelar cada mercado como categoría del mismo Auction Engine.

## 94. MOTOR DE SUBASTAS

Entidad propuesta:

MarketListing {

 id,

 category,

 assetType,

 assetId,

 quantity,

 sellerType,

 sellerMageId,

 basePrice,

 currentBid,

 currentBidder,

 minimumIncrement,

 listedAt,

 auctionEnd,

 ruleset

}

Reglas base heredadas:

pujar cuesta turno;

mínimo de sobrepuja aproximado 5%;

una puja bloquea Oro hasta resolución o sobrepuja;

si otro jugador supera la puja, el Oro anterior vuelve al tesoro;

determinados productos son generados por servidor y otros son vendidos por jugadores.

El Antique Store debe impedir transferencias directas de Oro entre jugadores mediante diferencias entre precio de venta y cantidad recibida por el vendedor.

## 95. MAGIA EXÓTICA Y HECHIZOS RAROS

Exotic Mageware permite adquirir hechizos sin investigarlos por la vía normal.

En reglas documentadas puede ofrecer Simple, Medio, Complejo y Antiguos, mientras los Supremos pueden quedar excluidos.

Comprar un hechizo raro puede elevar Nivel Mágico incluso si pertenece a otra escuela, sujeto a restricciones de lanzamiento.

Los Ancient también pueden llegar mediante objetos únicos específicos. El Mercado Negro constituye una vía garantizada frente al riesgo de ciertos pergaminos que pueden fallar y vaciar el Maná.

## 96. OBJETOS COMO ACTIVO ECONÓMICO

Los objetos menores pueden generarse a través de Gremios/Bibliotecas y con el uso de turnos según reglas históricas.

Pueden consumirse, reservarse para batalla o venderse. Esto convierte los objetos en una tercera reserva económica además de Oro y Maná.

Los Unique Items son mucho más escasos y algunos pueden existir prácticamente como piezas mundiales.

ARCANUM deberá distinguir:

Lesser Item: común, normalmente consumible.

Unique Item: muy raro, puede ser permanente, reutilizable o de un solo uso.

Server Unique: número limitado globalmente.

Ancient Scroll: objeto capaz de enseñar un Hechizo Antiguo.

## 97. ESPIONAJE COMO SISTEMA DE INFORMACIÓN

ARCANUM no debe mostrar gratuitamente toda la información de un enemigo.

El sistema histórico permite descubrir información mediante magia y objetos.

Crystal Ball / Bola de Cristal: objeto menor de un uso que puede revelar fragmentos aleatorios del reino enemigo, incluyendo edificios, formaciones, orden y cantidades. Debe atravesar Barreras.

Scrying Mirror / Espejo de Escrutinio: hechizo Fantasma que revela información aleatoria del objetivo y escala con el sistema mágico.

Basin of Far Seeing / Cuenco de Visión Lejana: objeto único reutilizable que, si supera Barreras, puede revelar información completa del reino objetivo y requiere recarga.

Cloak of Concealment / Capa de Ocultación: objeto único que bloquea espionaje ordinario de Scrying Mirror y Crystal Ball; el Basin puede atravesar esa ocultación.

Esto crea un auténtico juego de información y contra-información.

## 98. MODELO DE INFORMACIÓN DEL REINO

La información enemiga debe clasificarse por niveles de visibilidad:

PUBLIC:

nombre del archimago, escuela, ranking, Poder Neto aproximado, gremio y estado general permitido por ruleset.

SCOUTED_PARTIAL:

edificios parciales, algunas formaciones, cantidades parciales, determinados encantamientos o recursos.

SCOUTED_FULL:

orden completo de formaciones, cantidades, edificios, encantamientos activos y otros datos permitidos.

HIDDEN:

información que sólo puede descubrirse mediante mecanismos excepcionales.

Cada acción de espionaje genera una Snapshot fechada. La información no debe actualizarse automáticamente tras ser descubierta; puede quedar obsoleta cuando el objetivo gasta turnos.

## 99. SNAPSHOTS DE ESPIONAJE

Entidad propuesta:

IntelReport {

 id,

 observerMageId,

 targetMageId,

 createdAt,

 sourceType,

 sourceId,

 penetrationResult,

 visibilityLevel,

 revealedFields,

 expiresAt

}

Esta arquitectura permite que el jugador actúe sobre información imperfecta, una pieza esencial de estrategia.

Una mejora moderna de ARCANUM será mostrar claramente la antigüedad de la información: “Informe obtenido hace 43 minutos / 18 turnos estimados”.

## 100. BARRERAS Y ESPIONAJE

Las Barreras no sólo protegen de hechizos hostiles: determinados objetos de espionaje también deben atravesarlas.

Por tanto el motor no debe codificar BARRIER como “resistencia de hechizo”.

Debe existir un sistema de penetración genérico:

HostileEffect → BarrierCheck → KingdomResistanceCheck si corresponde → ConcealmentCheck → Effect.

Los objetos pueden tener reglas diferentes a los hechizos; por ejemplo, Kingdom Resistance no necesariamente afecta a objetos porque estos no poseen color mágico.

Esto debe expresarse en propiedades del efecto y no mediante excepciones hardcodeadas.

## 101. EL MERCADO Y EL ESPIONAJE CIERRAN DOS HUECOS DEL NÚCLEO

Mercado Negro define cómo circulan recursos raros sin eliminar la escasez.

Espionaje define cuánto sabe realmente un jugador antes de atacar.

Juntos convierten a Oro e Información en recursos estratégicos:

Oro compra oportunidades.

Información reduce incertidumbre.

El siguiente bloque del núcleo debe cerrar Objetos y Héroes, porque ambos sistemas se conectan directamente con Mercado Negro, combate y progresión.

## 102. OBJETOS MENORES: FUNCIÓN Y GENERACIÓN

Los Lesser Items forman parte del ciclo ordinario del reino. Pueden ser de batalla, invocación, recursos, espionaje, sabotaje o recuperación. Se generan principalmente conforme el mago consume turnos, y la probabilidad base depende del porcentaje de Bibliotecas/Gremios sobre la tierra total.

Fórmula documentada:

BaseItemGeneration = 0,1 × sqrt(Libraries / Land).

Cada turno produce una tirada independiente.

Existen dos objetos especiales con generación diferenciada: Magical Compass y Minor Indulgence.

SpecialItemGeneration = 0,015 × ServerTurnRate.

Los modificadores de suerte, héroes o dioses afectan al bonus de generación de objetos menores, pero no directamente a la probabilidad de los objetos especiales.

## 103. USO DE OBJETOS

Un objeto menor puede tener tres modos principales:

USE: uso inmediato fuera de batalla.

ASSIGNMENT: asignación defensiva para activarse automáticamente en combate.

BATTLE_ITEM: selección ofensiva durante un ataque.

El objeto se consume al utilizarse incluso si un efecto dirigido es bloqueado por Barreras, salvo reglas específicas.

Esta distinción debe formar parte del modelo de ItemDefinition y no depender de la interfaz.

## 104. CATÁLOGO DE OBJETOS MENORES: ARQUETIPOS

Ejemplos ya suficientemente documentados:

Ash of Invisibility: fija la iniciativa de ataques propios en 6, sujeto a interacciones especiales.

Brooch of Protection: aumenta resistencia Melee; valor Arch documentado +50%.

Bubble Wine: aumenta HP y AP; la variante Arch difiere de otros servidores.

Candle of Sleeping: reduce resistencias enemigas y eficiencia.

Capsule Monster: invoca 1.000 criaturas temporales que desaparecen tras la batalla.

Carpet of Flying: concede Flying a todas las unidades propias.

Crystal Ball: espionaje parcial.

Drums of War: reduce AP enemigo.

Mana Crystal: concede Maná.

Mana Vortex: destruye Maná enemigo, con cifras distintas en Arch.

Potion of Valor: aumenta AP propio; valor Arch documentado +30% para Primary/Counter y reglas distintas para Extra.

Pouch of Herbs: recupera aproximadamente 15% de bajas de stacks supervivientes y mejora resistencia Poison.

Strange Metallic Can: recupera aproximadamente 25% de bajas de stacks no aniquilados.

Spider's Web: Initiative enemiga -1.

Voodoo Doll: destruye turnos del objetivo.

Los valores deberán mantenerse versionados por ruleset.

## 105. OBJETOS Y EL MOTOR DE BATALLA

Los objetos no deben programarse como excepciones. Deben reutilizar los mismos modificadores que hechizos y habilidades.

Ejemplos:

Carpet of Flying → añade effectiveFlying.

Spider's Web → InitiativeModifier(-1).

Candle of Sleeping → ResistanceModifier y EfficiencyModifier.

Potion of Valor → APModifier.

Pouch of Herbs → PostBattleRecovery.

Ash of Invisibility → InitiativeOverride(6).

Esto permite combinar objetos, hechizos, héroes y habilidades dentro del mismo Effect Engine.

## 106. OBJETOS ÚNICOS

Un Unique Item es extremadamente raro y, con excepciones específicas, sólo existe una copia simultánea en el mundo.

Al comienzo de una Era los únicos no están necesariamente activos. El servidor los introduce progresivamente mediante dos vías principales: Mercado Negro o Unique Pool.

Pueden poseer efectos permanentes, mantenimiento, cargas, efectos de combate, economía, espionaje o uso único.

No pueden ser saqueados mediante Pillage, pero algunos pueden ser robados mediante Letters of the Thieves Guild.

Este sistema convierte ciertos objetos en activos geopolíticos del servidor.

## 107. UNIQUE POOL

El Unique Pool representa objetos únicos activos pero todavía no poseídos.

Un Treasure Chest documentado tiene aproximadamente 2% de probabilidad de entregar un Unique del pool.

Si no hay objetos disponibles, no se concede uno salvo reglas especiales de determinados servidores.

En Arch, Letters of the Thieves Guild tienen una probabilidad documentada de robar un Unique igual a n²%, donde n es el número de Uniques poseídos por el objetivo.

Esta regla debe marcarse como específica del ruleset Arch.

## 108. OBJETOS ÚNICOS ESTRATÉGICOS

Ejemplos relevantes para el núcleo:

Atomic Bomb: destruye aproximadamente 25% de múltiples recursos y activos del objetivo, incluida tierra, si atraviesa Barreras.

Basin of Far Seeing: espionaje completo; 1 turno de uso y 20 de recarga en la documentación actual.

Blood Knife: bloquea curación y resurrección en batalla.

Cloak of Concealment: bloquea espionaje ordinario.

Egg of Time: concede 51–151 turnos sin superar el máximo del servidor.

Holy Grails: existen cinco, uno por escuela; el correspondiente puede recuperar aproximadamente 15% de bajas y consume mantenimiento.

Holy Hand Grenade: destruye directamente una formación enemiga aleatoria sin tratarlo como daño convencional.

Orb of Protection: concede Council Protection temporal; no funciona durante Armagedón.

Phoenix Pendant: puede resucitar a un mago muerto fuera de Armagedón.

Sceptre of Rulership: mejora HP/AP propios y economía.

The Last Defense: reduce fuertemente daño de edificios por encantamientos ofensivos.

The Mirror of the Grey Witch: puede reflejar hechizos hostiles tras otras comprobaciones defensivas.

Estos objetos justifican una categoría de efectos GLOBAL_RULE_OVERRIDE.

## 109. PERGAMINOS ANTIGUOS

Existen objetos únicos capaces de enseñar Hechizos Antiguos:

Book of Geology → Earthquake.

Dead Sea Scroll → Heavenly Protection.

Nether Parchment → Corruption.

Scroll of Cancellation → Cancellation.

Scroll of Insight → The Wall of Silence.

Para el color correspondiente, la adquisición puede ser garantizada en reglas documentadas; fuera de color puede existir aproximadamente 50% de fallo y drenaje total de Maná.

ARCANUM debe conservar la idea de conocimiento prohibido raro, pero versionar las probabilidades exactas.

## 110. ARQUITECTURA DE OBJETOS

ItemDefinition {

 id,

 nameOriginal,

 nameES,

 rarity,

 uniqueGlobal,

 useMode,

 charges,

 rechargeTurns,

 barrierCheck,

 targetType,

 effects[],

 upkeep[],

 acquisitionMethods[],

 marketAllowed,

 pillageAllowed,

 stealAllowed,

 rulesetVersions[]

}

ItemInstance {

 itemDefinitionId,

 ownerMageId,

 chargesRemaining,

 rechargeRemaining,

 active,

 acquiredAt

}

Los Unique Items deben ser instancias globales trazables por Era.

## 111. HÉROES: ADQUISICIÓN

Los héroes pueden obtenerse por varias vías:

Taberna del Mercado Negro.

Favor de un dios.

Listas de máximo favor, como Lucifer, en reglas que lo permitan.

Objetos únicos como Love Potion #9, Lipstick of Enslavement y The Magic Mirror.

Los héroes son entidades persistentes del reino y pueden morir, ser robados, subir de nivel o abandonar al mago según efectos especiales.

## 112. HÉROES DE BATALLA Y NO BATALLA

Existen Battle Heroes y Non-Battle Heroes.

Los héroes de batalla dirigen formaciones, atacan o lanzan habilidades y pueden morir.

Los héroes no de batalla afectan economía, investigación, objetos u otros sistemas sin acompañar formaciones.

Un Battle Hero puede además poseer habilidades no bélicas.

Esta distinción debe ser un atributo funcional y no una clase de interfaz.

## 113. ASIGNACIÓN DE HÉROES A FORMACIONES

Los héroes se asignan siguiendo prioridad.

Los héroes de mayor nivel se procesan antes.

Si color y raza del héroe coinciden con una formación, la prefieren.

Si no existe coincidencia completa, tienden a dirigir la formación con mayor poder disponible.

En defensa pueden dirigir incluso formaciones minúsculas.

En ataque, una formación inferior aproximadamente al 10% del poder enviado puede no recibir héroe si viaja sola como fake stack.

Si hay más héroes que formaciones, algunos permanecen en casa.

La versión exacta debe mantenerse por ruleset porque históricamente varios héroes podían llegar a dirigir una misma formación y esa regla fue abandonada en TR.

## 114. BONIFICACIÓN DE EFICIENCIA DEL HÉROE

Cuando un héroe dirige una formación de su mismo color y raza:

Efficiency inicial de la formación += nivelDelHéroe / 100.

Ejemplo documentado:

héroe nivel 16 → 116% de Efficiency inicial.

La fatiga posterior continúa aplicándose normalmente:

116% → ataque primario -15% → 101%.

Esta regla conecta directamente Hero Engine con BattleStack.efficiency.

## 115. ATAQUE Y SUPERVIVENCIA DEL HÉROE

El héroe ejecuta su ataque o habilidad después del ataque primario o secundario de la formación que dirige, según la habilidad correspondiente.

Los efectos mágicos del héroe pueden ser resistidos y utilizan el color del propio héroe.

Si la formación es aniquilada, el héroe no muere automáticamente: el daño sobrante después de destruir la formación debe ser suficiente para consumir también los HP del héroe.

Por tanto el héroe necesita un HeroBattleState independiente, aunque esté adjunto a un BattleStack.

## 116. EXPERIENCIA Y NIVELES

Regla general:

XP necesaria para subir del nivel N al N+1 = 1.000 × N.

XP acumulada para alcanzar un nivel sigue por tanto una progresión triangular.

La documentación histórica conserva hasta nivel 40, con 780.000 XP acumulada para alcanzar ese nivel.

Las tasas de XP por turno y por batalla cambian según velocidad de servidor.

Ejemplo moderno documentado:

Arch lento: Battle Hero 9,6 XP/turno + 24 XP por liderar una batalla; Non-Battle Hero 14,38 XP/turno.

Una FAQ antigua conserva otras tasas para Apprentice, Server Guild y Blitz, confirmando que el crecimiento de héroes debe vivir en Ruleset.

## 117. HABILIDADES DE HÉROES

Las habilidades se desbloquean por nivel y mejoran con niveles posteriores.

Muchos héroes tienen una primera habilidad alrededor de niveles 8–10 y otra alrededor de 13–17.

Ejemplo Arch documentado:

Fire Elementalist:

AP = 6.000 + 3.000 × nivel.

HP = 1.600 + 800 × nivel.

Arcfire se desbloquea en nivel 9 y causa daño Fire a una formación aleatoria.

Firestorm se desbloquea en nivel 16 y causa daño Fire a todas las formaciones enemigas.

Además prefiere Elementals de Erradicación y mejora su Efficiency cuando coincide color/raza.

Esto confirma que HeroAbility puede ser BATTLE, PASSIVE o NON_BATTLE.

## 118. PROFESIONES DE HÉROES IDENTIFICADAS

Al deduplicar las variantes por servidor de las categorías conservadas aparecen, como mínimo, estas profesiones principales:

Erradicación: Assassin, Berserker, Dragon Knight, Fire Elementalist, Warlord.

Verdante: Amazon, Enchantress, Shaman, Shepherdess, Summoner.

Ascendente: Priestess, Shieldmaiden, Vampire Hunter, White Knight.

Fantasma: Bard, Illusionist, Sage, Valkyrie.

Abisal: Crypt Keeper, Devil Prince, Dread Knight, Necromancer, Soul Reaper, Witch.

Plain: Alchemist, Engineer, Merchant, Veteran.

La pertenencia exacta y disponibilidad de cada profesión debe auditarse por ruleset Arch/MARI antes de congelar el catálogo clásico.

## 119. HÉROES Y RIESGO

Los héroes introducen inversión a largo plazo: cuantos más turnos sobreviven, más valiosos se vuelven.

Esto produce una tensión importante:

usar al héroe en batalla acelera o aprovecha su valor;

exponerlo a una formación que pueda ser aniquilada arriesga perder meses de progresión de Era.

ARCANUM debe hacer visible este riesgo en la interfaz sin eliminarlo.

## 120. ARQUITECTURA DE HÉROE

HeroDefinition {

 id,

 profession,

 nameES,

 school,

 race,

 battleHero,

 baseAP,

 apPerLevel,

 attackTypes[],

 baseHP,

 hpPerLevel,

 upkeepFormula,

 preferredRaces[],

 preferredSchools[],

 abilitiesByLevel[],

 rulesetVersions[]

}

HeroInstance {

 heroDefinitionId,

 ownerMageId,

 personalName,

 level,

 experience,

 alive,

 assignedStackId,

 disabledAbilities[],

 acquiredAt

}

HeroBattleState {

 heroInstanceId,

 stackId,

 currentHP,

 activeEffects[],

 actionEvents[]

}

## 121. ESTADO DEL NÚCLEO TRAS OBJETOS Y HÉROES

Objetos menores: estructura cerrada y principales interacciones conocidas.

Unique Items: ciclo de aparición, posesión, robo, mercado y efectos principales definidos.

Héroes: adquisición, asignación, combate, muerte, XP, niveles y arquitectura definidos.

Pendiente para cerrar el núcleo:

Dioses.

Gremios y diplomacia detallada.

Protecciones y muerte del mago.

Armagedón completo.

Pairing clásico y excepciones históricas.

Después de esos bloques podrá congelarse ARCANUM Core Rules v1.0.

## 122. LOS SIETE DIOSES

La documentación conservada reconoce siete divinidades principales:

Nature.

Sun.

Moon.

Magic.

Science.

Satan.

Lucifer.

Cada una puede otorgar Favor, Disfavor, Hatred, Patron y Most Favoured según reglas del servidor.

El sistema debe tratar la relación con cada dios como un estado independiente del mago.

## 123. OBTENCIÓN DE FAVOR

El Favor se obtiene principalmente mediante donaciones de Oro en el Altar de la Oscuridad del Mercado Negro.

En reglas modernas documentadas, la donación debe superar umbrales mínimos relativos y absolutos, y el jugador debe haber gastado suficiente cantidad de turnos antes de poder aspirar al Favor.

Ejemplo documentado moderno:

donación mínima = máximo entre aproximadamente 10% del Oro total y un mínimo absoluto por servidor;

si se cumplen condiciones, existe una probabilidad de Favor.

Estas cifras se consideran [C] hasta determinar valores históricos MARI.

## 124. EFECTOS BÁSICOS DE FAVOR

Una tabla moderna conserva efectos estándar durante aproximadamente 48 horas:

Nature: mejora economía y población.

Sun: aumenta Precisión en batalla.

Moon: aumenta generación de Maná.

Magic: aumenta Nivel Mágico y reduce coste de lanzamiento.

Science: mejora generación y rendimiento de objetos.

Satan: reduce determinados mantenimientos de unidades.

Lucifer: aumenta rendimiento de invocaciones y potencia militar.

Las cifras concretas han cambiado con los años y deben quedar en GodFavorVersion por ruleset.

## 125. CELOS DIVINOS

Un mago puede mantener Favor de varios dioses, pero buscar nuevas bendiciones puede provocar celos.

La propia wiki advierte que la tabla moderna de celos fue actualizada con datos posteriores y no representa necesariamente Archmage original.

Por tanto ARCANUM conservará el concepto:

GodRelation {

 godId,

 state,

 favourExpiresAt,

 donationTotal,

 jealousyRisk,

 patron,

 mostFavoured

}

pero las probabilidades históricas se separarán por ruleset.

## 126. DISFAVOR Y ODIO

Disfavor aplica generalmente el efecto opuesto al Favor correspondiente.

Hatred intensifica el efecto negativo y puede desencadenar castigos adicionales.

Los castigos documentados incluyen encantamientos hostiles, hechizos destructivos, mala suerte, pérdida de Maná, prueba o muerte de héroes y, en determinadas reglas, pérdida de Damage Protection.

Esto convierte a los dioses en participantes activos del sistema mundial, no en simples buffs temporales.

## 127. EXPIACIÓN

Un mago bajo Disfavor puede intentar volver a Neutral mediante una nueva donación al mismo dios.

La cantidad exacta depende de versión y servidor.

ARCANUM debe separar:

DONATION_FOR_FAVOUR.

ATONEMENT_DONATION.

PATRON_REQUIREMENT.

MOST_FAVOURED_REQUIREMENT.

No son la misma transacción ni deben compartir automáticamente fórmula.

## 128. MOST FAVOURED Y PATRON

Los estados superiores de favor exigen condiciones extraordinarias además de Oro: posición entre donantes, porcentaje de riqueza sacrificada y requisitos relacionados con ejército, raza, objetos o estilo de juego.

Esto es muy valioso para ARCANUM porque permite que un dios premie comportamiento, no sólo riqueza.

Diseño futuro recomendado: cada dios debe tener criterios temáticos observables, pero el modo CLASSIC_MARI conservará exclusivamente reglas verificadas.

## 129. PROTECCIÓN DE APRENDIZ

Apprentice Protection protege los primeros 120 turnos de vida del mago en documentación conservada.

Al gastar el turno 121 se abandona definitivamente.

Objetivo: impedir que un reino recién creado sea destruido antes de establecer economía y ejército.

La protección inicial es una regla de onboarding y balance, no una inmunidad que pueda recuperarse.

## 130. DAMAGE PROTECTION

La protección por daño se activa cuando el mago acumula aproximadamente 30% de pérdida de Poder Neto por ataques regulares, asedios y saqueos dentro de una ventana móvil de 24 horas.

Los eventos de daño van expirando individualmente conforme salen de esa ventana.

La protección impide nuevos ataques ordinarios, pero puede permitir counters ya abiertos según ruleset.

Este sistema debe implementarse mediante historial temporal de daño, no mediante un simple contador reiniciado diariamente.

## 131. COUNCIL PROTECTION

En la documentación conservada:

sólo puede activarse de forma natural antes de aproximadamente 2.000 turnos;

requiere quedar por debajo de aproximadamente 1.500 acres y sin unidades;

dura hasta 48 horas;

se pierde en cuanto el mago consume un turno.

Durante Council Protection no pueden ejecutarse ataques nuevos ni counters contra el mago.

Al activarse puede cancelar encantamientos propios mantenidos.

Algunos objetos únicos pueden otorgarla de forma extraordinaria.

## 132. PILLAGE PROTECTION

La protección de Saqueo limita la cantidad de pillages que un reino puede recibir dentro de una ventana temporal.

Una documentación moderna usa un máximo de aproximadamente 10 saqueos por 24 horas.

Los ataques adicionales de Saqueo son bloqueados antes de consumir sus recursos ofensivos.

La cifra debe versionarse.

## 133. MEDITACIÓN

Meditación es una protección voluntaria.

Mientras el mago medita:

no puede ser atacado;

no puede ser objetivo de hechizos, objetos o encantamientos hostiles según la versión documentada;

los turnos continúan acumulándose.

La entrada puede quedar prohibida si el mago mantiene counters u otras obligaciones hostiles recientes.

La documentación moderna utiliza una duración aproximada de tres días y cancela determinados encantamientos propios.

El modo clásico deberá reconstruir duración y requisitos exactos.

## 134. MUERTE DEL MAGO

Estado Dead se alcanza al llegar a:

Fortalezas = 0.

El mago deja de ser jugable.

Esto confirma que las Fortalezas no son simplemente un edificio defensivo: constituyen la condición de vida del reino.

El servidor deberá emitir MAGE_KILLED y registrar causa, atacante, timestamp, Era y estado de objetos/héroes según ruleset.

## 135. RESURRECCIÓN DEL MAGO

Determinados Unique Items, como Phoenix Pendant en reglas conservadas, pueden devolver a la vida a un mago fuera de Armagedón.

Esto exige separar:

DEATH_STATE.

RESURRECTION_ELIGIBILITY.

ERA_FINAL_DEATH.

La resurrección no debe ser una reversión de base de datos; debe ser una transición formal de estado con reglas sobre Fortalezas, protección y mínimos de recursos.

## 136. ARMAGEDÓN AUTOMÁTICO

Todos los servidores documentados pueden tener un Armagedón iniciado por el propio servidor, que fija la fecha máxima de final de Era.

Los siete sellos se rompen a intervalos regulares.

En reglas modernas normales, el intervalo es de 24 horas; Lightning utiliza 12.

Al romperse el séptimo sello comienza Armagedón propiamente dicho.

## 137. ARMAGEDÓN INICIADO POR JUGADORES

Algunos rulesets permiten que jugadores poderosos adelanten el fin de la Era.

El hechizo Armagedón puede investigarse después del resto y no incrementa Nivel Mágico.

Cada lanzamiento válido rompe un sello.

Hay siete sellos y un mago sólo puede romper uno por secuencia.

Las reglas modernas exigen pertenencia a un gremio suficientemente poderoso y autorización de liderazgo.

La disponibilidad exacta varía por servidor; Arch moderno, por ejemplo, no habilita player-cast Armageddon aunque la documentación conserva fórmulas históricas relacionadas.

## 138. SECUENCIA DE LOS SIETE SELLOS

Sólo existe una secuencia global controlada por jugadores.

El gremio que rompe el primer sello se convierte en propietario de la secuencia.

Puede pre-lanzar el siguiente sello para que rompa al cumplirse el intervalo.

Si no lo hace dentro del tiempo permitido, otro mago cualificado puede romper el siguiente sin cambiar la propiedad de la secuencia.

Si cualquiera de los lanzadores muere antes de romper el séptimo sello:

la secuencia se aborta;

los sellos se restauran;

las instancias de Armagedón desaparecen.

Éste es uno de los objetivos PvP más potentes del juego.

## 139. LOS LANZADORES SE CONVIERTEN EN OBJETIVOS MUNDIALES

Los lanzadores de Armagedón pueden ser atacados independientemente de la relación normal de Poder Neto.

En una variante moderna, el umbral necesario para Damage Protection aumenta +8 puntos porcentuales por cada sello roto.

Esto crea un conflicto emergente:

un gremio intenta mantener vivos a siete lanzadores;

el resto del servidor puede intentar asesinarlos para reiniciar la secuencia.

La cifra de +8% es ruleset específica y no debe asumirse MARI sin verificación.

## 140. DÍA DEL ARMAGEDÓN

Una vez roto el séptimo sello:

Armagedón ya no puede detenerse;

las protecciones normales desaparecen salvo excepciones como Apprentice;

cualquier mago puede atacar a cualquier otro independientemente del rango de Poder Neto;

la conquista de tierra continúa;

la fase final dura un tiempo definido por servidor, actualmente documentado como 24 horas en muchos rulesets.

Al concluir:

se bloquea la Era;

se actualiza el Hall of Immortals;

se guardan clasificaciones;

Terra es destruida;

el servidor se prepara para la siguiente reencarnación.

## 141. HALL OF IMMORTALS

El final de Era debe preservar historia.

Se registran resultados destacados de magos y/o gremios.

Las secuencias de Armagedón iniciadas por jugadores pueden tener además un Hall específico para los siete lanzadores.

ARCANUM debe convertir el Hall of Immortals en una capa persistente entre Eras:

Era,

ruleset,

ganadores,

ranking,

gremios,

lanzadores,

estadísticas históricas,

eventos memorables.

La memoria histórica será uno de los pocos elementos que sobrevivan a la destrucción del mundo.

## 142. ARQUITECTURA DE ERA Y ARMAGEDÓN

Era {

 id,

 rulesetId,

 startedAt,

 scheduledArmageddonAt,

 state,

 currentSeal,

 sealInterval,

 armageddonStartedAt,

 endsAt

}

ArmageddonSequence {

 eraId,

 type,

 ownerGuildId,

 currentSeal,

 casters[],

 precasts[],

 aborted,

 completed

}

HallEntry {

 eraId,

 category,

 mageId,

 guildId,

 rank,

 metadata

}

Estados de Era propuestos:

PREPARATION → ACTIVE → SEALS_BREAKING → ARMAGEDDON → DESTROYED → RESETTING → NEW_ERA.

## 143. ESTADO ACTUAL DEL NÚCLEO

Ya están estructuralmente definidos:

economía;

turnos;

edificios;

cinco escuelas;

magia;

unidades;

motor de combate;

habilidades;

Mercado Negro;

espionaje;

objetos;

Unique Items;

héroes;

dioses;

protecciones;

muerte;

Armagedón;

Era y Hall of Immortals.

Los dos grandes bloques sistémicos pendientes antes de Core Rules v1.0 son:

Gremios y diplomacia detallada.

Pairing clásico MARI y auditoría final de fórmulas históricas.

Después se realizará una pasada de consistencia para congelar la primera especificación programable.

## 144. GREMIOS: FUNCIÓN ESTRATÉGICA

Los gremios son organizaciones persistentes dentro de una Era. No son sólo chat o etiqueta social: habilitan coordinación legal, inteligencia compartida, listas de enemigos, historial de batalla, diplomacia formal y, según ruleset, participación en Armagedón.

Un mago sólo puede pertenecer oficialmente a un gremio a la vez.

El sistema histórico distingue servidores con gremios, servidores sin gremios y servidores Solo donde la coordinación está expresamente restringida.

## 145. CREACIÓN DE UN GREMIO

Una regla documentada exige cinco fundadores: el creador y cuatro magos que confirman su participación.

El creador se convierte en líder.

La creación incluye:

nombre completo;

abreviatura;

descripción;

política de reclutamiento;

canal o espacio de comunicación;

fundadores.

ARCANUM puede conservar el requisito de cinco miembros en CLASSIC, mientras que otros rulesets podrán modificarlo.

## 146. RECLUTAMIENTO

Un gremio puede ser:

OPEN_RECRUITMENT;

APPLICATION_ONLY;

INVITE_ONLY.

Un mago sin gremio puede solicitar entrada a un único gremio a la vez.

Miembros con permiso pueden:

invitar;

aceptar solicitudes;

rechazar solicitudes;

expulsar miembros.

Al entrar en un gremio, alianzas personales incompatibles se rompen según reglas de servidor.

## 147. JERARQUÍA Y PERMISOS

La documentación conserva niveles de acceso numéricos de 1 a 100.

Ejemplo histórico:

100 = Líder.

99 = Colíder/Administrador.

50 = Miembro pleno.

1 = Recién incorporado.

Los títulos pueden personalizarse.

Los permisos se separan de los títulos:

aceptar miembros;

invitar;

expulsar;

enviar mensajes;

ofrecer/aceptar NAP;

ofrecer/aceptar alianzas;

declarar hostilidad;

declarar guerra;

ver batallas;

ver miembros;

ver lista de enemigos;

editar lista de enemigos.

ARCANUM deberá usar RBAC: Role-Based Access Control.

## 148. ARQUITECTURA DE GREMIO

Guild {

 id,

 eraId,

 name,

 shortName,

 description,

 leaderMageId,

 recruitmentPolicy,

 diplomacyPolicy,

 createdAt,

 disbandedAt

}

GuildRole {

 guildId,

 level,

 title,

 permissions[]

}

GuildMember {

 guildId,

 mageId,

 roleLevel,

 joinedAt,

 status

}

La lógica de permisos no debe estar incrustada en botones de interfaz.

## 149. ALIANZAS PERSONALES

Dependiendo del servidor, un mago puede tener uno o dos aliados directos.

La alianza requiere propuesta y aceptación.

Una alianza recién creada puede tener una ventana inicial en la que todavía no envía refuerzos.

Una alianza no puede romperse durante las primeras 24 horas según documentación histórica conservada.

En servidor con gremios, un miembro de gremio sólo puede aliarse con miembros de su propio gremio.

Al morir uno de los magos, la alianza termina.

## 150. REFUERZOS

Los aliados directos pueden enviar automáticamente una formación como refuerzo en batalla.

Reglas heredadas documentadas:

el aliado necesita varias formaciones;

las dos mayores formaciones por poder normalmente no se envían;

se selecciona una formación inferior elegible;

una formación de refuerzo demasiado poderosa respecto al ejército ayudado puede quedar excluida;

pueden intervenir hasta dos aliados por bando en reglas documentadas.

Los refuerzos tienen reglas propias de Precision y efectos de batalla.

La implementación deberá tratarlos como BattleStack con source = REINFORCEMENT y ownerMageId distinto al combatiente principal.

## 151. INFORMACIÓN COMPARTIDA

La coordinación legítima está ligada a relaciones registradas.

Puede compartirse inteligencia entre:

aliados directos;

miembros del mismo gremio;

miembros de gremios formalmente aliados.

Un NAP no concede por sí solo derecho a coordinación o intercambio de inteligencia.

Esta separación es esencial para evitar coaliciones invisibles que destruyan el equilibrio político del servidor.

## 152. DIPLOMACIA ENTRE GREMIOS

Estados diplomáticos mínimos:

NEUTRAL.

ALLIED.

NAP.

HOSTILE.

WAR.

Los estados deben registrar:

emisor;

receptor;

si es bilateral o unilateral;

fecha de inicio;

fecha de terminación;

términos;

quién lo autorizó.

Una alianza de gremios permite coordinación e intercambio de inteligencia.

Un NAP sólo implica promesa de no agresión y no equivale a alianza.

## 153. NAP: PACTO DE NO AGRESIÓN

NAP = Non-Aggression Pact.

Puede ser bilateral o, en determinadas prácticas históricas, unilateral.

No concede refuerzos automáticos.

No concede coordinación ofensiva.

No concede derecho automático a compartir inteligencia sensible.

Su función es política: reduce fricción sin fusionar intereses militares.

ARCANUM deberá presentar visualmente una diferencia radical entre ALLIANCE y NAP.

## 154. HOSTILIDAD Y GUERRA

Los gremios pueden declarar Hostilidad o Guerra si el miembro que ejecuta la acción posee permiso.

La lista de enemigos permite marcar objetivos, compartir contexto y seguir guerras.

Las reglas de compromiso históricas a menudo nacían de costumbres del propio gremio:

un ataque → un counter;

multiataque → hostilidad;

hechizo hostil → acto de guerra;

determinadas agresiones → hitlist.

ARCANUM puede permitir a cada gremio publicar sus Rules of Engagement, pero estas reglas sociales nunca pueden sobrescribir las reglas oficiales del servidor.

## 155. HISTORIAL DE GUERRA

Los gremios históricos disponían de:

Member List;

Enemy List;

Guild Battle Log;

Battle History;

Guild History.

ARCANUM ampliará esto con una Chronicle de gremio:

guerras declaradas;

victorias;

derrotas;

tierra ganada/perdida;

magos muertos;

objetos únicos capturados;

sellos de Armagedón;

alianzas;

NAPs;

rupturas diplomáticas.

Esta memoria puede sobrevivir a la Era como parte del perfil histórico del gremio.

## 156. MERCADO NEGRO Y GREMIO

En el Mercado Negro se puede identificar qué pujas pertenecen a miembros del propio gremio, aunque históricamente era posible sobrepujarles.

La interfaz moderna debe mostrar:

PUJA PROPIA;

PUJA DE GREMIO;

PUJA ALIADA;

PUJA EXTERNA,

sin impedir automáticamente competencia interna salvo que el ruleset lo establezca.

Esto crea decisiones interesantes: cooperación y competencia económica pueden coexistir.

## 157. GUILD FORCE

La documentación moderna utiliza una métrica denominada Guild Force para determinar si un gremio es suficientemente poderoso para iniciar Armagedón.

Los umbrales varían por servidor y disminuyen con el tiempo de Era.

Ejemplos modernos:

GuildWar/Blitz/Beta: 2.000 inicial, -30 por día.

Lightning: 4.000 inicial, -30 cada 12 horas.

Arch documenta 1.800 inicial y -20 por día, aunque actualmente Arch no permite Armagedón iniciado por jugadores.

La fórmula exacta de cálculo de Guild Force aún no está suficientemente reconstruida y queda marcada como pendiente de arqueología.

## 158. GREMIOS Y ARMAGEDÓN

Cuando el ruleset permite Armagedón iniciado por jugadores:

el mago debe pertenecer a un gremio con fuerza suficiente;

el liderazgo debe autorizar el lanzamiento;

el gremio que rompe el primer sello se convierte en propietario de la secuencia;

puede coordinar pre-lanzamientos posteriores;

la muerte de cualquiera de los lanzadores antes del séptimo sello puede abortar toda la secuencia.

Esto convierte el liderazgo del gremio en una función mecánica de final de Era.

## 159. PRECEDENTE HISTÓRICO DE MONETIZACIÓN LIMPIA

The Reincarnation utilizó Supporting Guilds financiados mediante donaciones.

Los beneficios documentados se centraban en comodidad:

icono distintivo;

filtros de ranking;

marcado de enemigos y aliados;

seguimiento de encantamientos;

notas;

estadísticas;

herramientas de construcción;

espacio para foro/sitio.

La propia documentación señalaba explícitamente que estas funciones facilitaban jugar sin otorgar ventajas al personaje.

ARCANUM adopta este principio como antecedente del Principio de Integridad Competitiva:

ninguna compra real puede alterar directa o indirectamente el resultado matemático de una Era competitiva.

## 160. REGLAS DE COORDINACIÓN

Para evitar gremios encubiertos, multi-cuentas coordinadas o coaliciones invisibles:

la coordinación estratégica relevante debe existir dentro de relaciones registradas;

el servidor puede registrar alianzas oficiales;

la información sensible compartida mediante herramientas internas debe respetar esas relaciones;

un NAP no habilita coordinación;

el modo Solo prohíbe cooperación organizada.

La moderación y detección anti-multi deberán formar parte del backend, no sólo de las normas comunitarias.

## 161. MODELO DE DIPLOMACIA

DiplomaticRelation {

 id,

 eraId,

 sourceType,

 sourceId,

 targetType,

 targetId,

 relationType,

 bilateral,

 status,

 proposedAt,

 acceptedAt,

 effectiveAt,

 endsAt,

 terms,

 createdByMageId

}

RelationType:

PERSONAL_ALLIANCE;

GUILD_ALLIANCE;

NAP;

HOSTILITY;

WAR.

La diplomacia debe ser auditable históricamente.

## 162. PAIRING CLÁSICO: EVIDENCIA HISTÓRICA

Una guía conservada de principios de los años 2000 describe el pairing clásico con tres reglas generales:

1) una formación Melee terrestre no puede emparejarse con Flying y busca la primera formación terrestre no emparejada;

2) Flying y Ranged buscan primero una formación Flying no emparejada y, si no existe, una terrestre;

3) las formaciones que quedan sin pareja tienden a atacar formaciones superiores si son Flying/Ranged, o formaciones terrestres inferiores si son Melee.

Este documento es especialmente valioso porque es mucho más cercano a la época MARI que las guías modernas.

## 163. EJEMPLO CLÁSICO DE PAIRING

Ejército Abisal:

Horned Demon;

Lich;

Wraith;

Zombie;

Efreeti;

Ghoul;

Dark Elf Magician.

Ejército Ascendente:

Archangel;

Knight Templar;

Unicorn;

Dominion;

High Priest;

Mind Ripper.

Pairings conservados:

Archangel → Horned Demon.

Horned Demon → Knight Templar.

Knight Templar → Lich.

Lich → Archangel.

Unicorn → Zombie.

Wraith → Unicorn.

Dominion → Wraith.

Zombie → High Priest.

Efreeti → Dominion.

High Priest → Efreeti.

Ghoul ↔ Mind Ripper.

Dark Elf Magician → Archangel.

Este ejemplo demuestra que el pairing no es simplemente stack 1 contra stack 1.

## 164. CAMBIO DE PAIRING EN 2010

La documentación moderna indica que a principios de 2010 cambió una regla importante.

Antes:

las formaciones que quedaban sin objetivo en la primera ronda tendían a concentrarse sobre el top stack enemigo.

Después:

las formaciones sobrantes vuelven a recorrer las formaciones enemigas en rondas adicionales, distribuyendo sus ataques.

Por tanto definiremos:

PAIRING_CLASSIC_PRE_2010.

PAIRING_TR_2010_PLUS.

El modo CLASSIC_MARI deberá usar la primera familia salvo que encontremos evidencia MARI más precisa.

## 165. FAKE STACKS Y UMBRAL DE SOBREATAQUE

El pairing moderno incorpora además una regla para ignorar objetivos demasiado pequeños.

Una formación falsa puede colocarse deliberadamente para atraer pairing, pero el motor puede saltársela si el poder atacante acumulado sería desproporcionado respecto a ese objetivo.

La decisión depende de:

porcentaje del atacante en su ejército;

porcentaje del objetivo en su ejército;

poder que ya ha sido asignado contra el objetivo.

Ejemplo documentado:

25/25/25/25 frente a 92,7/2,5/2,4/2,4 produce ataques que evitan sobrecargar repetidamente las formaciones diminutas.

La fórmula exacta no está publicada y seguirá marcada como caja negra.

## 166. NATURAL VS EFFECTIVE EN PAIRING

El orden de stacking utiliza habilidades naturales, no modificaciones temporales de objeto, hechizo, encantamiento o héroe.

Ejemplo:

una formación de Liches convertida temporalmente en Flying mediante Carpet of Flying mantiene su posición de stacking calculada como unidad naturalmente Ranged.

Sin embargo, su capacidad efectiva para alcanzar objetivos durante la resolución de batalla sí puede cambiar.

Por tanto:

naturalFlying / naturalRanged → stacking.

effectiveFlying / effectiveRanged → targetability durante combate.

## 167. LÍMITE DE FORMACIONES

El jugador puede poseer muchas clases de unidad, pero la documentación clásica/moderna conserva que sólo las 10 formaciones principales entran normalmente en batalla.

Empates exactos de NP pueden resolverse por orden interno de la base de unidades.

A esas 10 pueden añadirse:

refuerzos;

formaciones temporales de hechizos;

objetos;

héroes.

El motor debe distinguir BASE_COMBAT_STACK de TEMPORARY_STACK y REINFORCEMENT.

## 168. ESTADO DE RECONSTRUCCIÓN DEL PAIRING

Confirmado con alta confianza:

orden por battle power;

Flying/Ranged/Melee y targetability;

preferencia por objetivos no emparejados;

comportamiento clásico de sobrantes;

cambio post-2010 a rondas múltiples;

existencia de fake stacks;

existencia de filtro por sobreataque;

diferencia natural/effective.

Pendiente:

fórmula exacta del filtro de fake stacks;

tie-breaks exactos;

interacción completa con refuerzos;

algunos casos Primary no-Ranged + Secondary Ranged;

orden exacto de re-pairing en CLASSIC_MARI.

Esto es ya suficiente para implementar un Pairing Simulator con reglas intercambiables.

## 169. PRÓXIMA FASE: AUDITORÍA DE CONSISTENCIA

El núcleo funcional está prácticamente cerrado.

La siguiente fase no consiste en inventar nuevos sistemas, sino en:

comparar fórmulas duplicadas;

fechar reglas;

marcar contradicciones;

separar MARI / Arch / TR moderno;

resolver qué comportamiento será CLASSIC_MARI;

definir defaults de ARCANUM_CLASSIC.

El objetivo será producir una tabla de decisiones y congelar ARCANUM Core Rules v1.0.

## 170. AUDITORÍA DE CONSISTENCIA: MÉTODO

A partir de este punto cada regla conflictiva se clasifica en cuatro capas:

MARI_CANDIDATE: comportamiento compatible con fuentes muy antiguas y cercano al Archmage original, pero no necesariamente demostrado con código o manual MARI.

ARCH: comportamiento documentado específicamente para Arch Server.

TR_MODERN: comportamiento posterior claramente documentado.

ARCANUM_CLASSIC: decisión deliberada del proyecto para la primera implementación clásica.

Cada decisión deberá guardar fuente, fecha aproximada, nivel de confianza y dependencias con otras fórmulas.

## 171. PODER NETO: DOS FÓRMULAS INCOMPATIBLES

Una versión legacy conservada en Alzorath's FAQ documenta:

1.000 NP por acre.

19.360 NP por Fortaleza.

3.960 NP por Barrera.

Maná / 20.

Población / 50.

Oro / 5.000.

1.000 NP por Nivel Mágico.

1.000 NP por objeto menor.

95.000 NP por objeto único, marcado en la propia fuente como procedente de Archmage y pendiente de confirmar en TR.

0 NP por aliado.

100.000 NP fijos por héroe de batalla.

100.000 NP fijos por héroe no-batalla.

+ Power Rank total del ejército.

Una versión posterior documenta:

6.500 NP por Barrera.

Oro / 2.000.

100.000 NP por Unique.

10.000 NP por aliado.

10.000 NP por cada nivel de héroe.

Land, Fortress, Mana, Population, Spell Level y Lesser Items conservan los mismos coeficientes principales.

Conclusión: Net Power no es una fórmula eterna. Debe existir NetPowerFormulaVersion.

## 172. FORTALEZAS Y EL CAMBIO DE MAYO DE 2008

La documentación actual conserva un cambio fechado: desde mayo de 2008, las Fortalezas que exceden 2,5% de la tierra ya no añaden Poder Neto.

Esto permite una inferencia histórica fuerte:

antes de ese cambio, las Fortalezas por encima de 2,5% sí inflaban el Poder Neto.

Para un modo cercano al MARI/pre-2008, la opción más coherente es contar todas las Fortalezas salvo que encontremos evidencia original en contra.

El valor documentado por Fortaleza es 19.360 NP.

## 173. DECISIÓN PROVISIONAL DE PODER NETO

CLASSIC_MARI:

usar como candidato el modelo legacy del FAQ:

Barrier = 3.960;

Geld divisor = 5.000;

Unique = 95.000;

Ally = 0;

Hero = 100.000 fijo;

todas las Fortalezas cuentan.

Estado: PROVISIONAL.

ARCANUM_CLASSIC:

comenzará con este mismo modelo para preservar la economía de ranking temprana, pero todos los coeficientes vivirán en configuración y podrán ajustarse durante Alpha sin migrar datos.

TR_MODERN:

mantendrá la fórmula moderna separada para simulación/comparación.

Nunca se mezclarán partes de NP_LEGACY y NP_MODERN.

## 174. CONDICIÓN DE VICTORIA: CONTRADICCIÓN HISTÓRICA

Las fuentes tempranas conservan:

Regular: destruir al menos 5% del ejército enemigo.

Siege: destruir al menos 10%.

Además debe cumplirse que el defensor pierda un porcentaje mayor de ejército que el atacante.

La documentación posterior de TR cambió a:

Regular: 10%.

Siege: 10%.

Una guía fechada en la primera mitad de los años 2000 y discusiones de jugadores de 2006 todavía describen el umbral 5%/10%.

Esto convierte 5% Regular / 10% Siege en el candidato más fuerte para comportamiento temprano.

## 175. DECISIÓN PROVISIONAL DE VICTORIA

CLASSIC_MARI candidate:

Regular minimumDefenderArmyLoss = 0,05.

Siege minimumDefenderArmyLoss = 0,10.

AttackerLossPercent < DefenderLossPercent.

AttackerSurvivors >= 1.

TR_MODERN:

Regular = 0,10.

Siege = 0,10.

ARCANUM_CLASSIC:

usar inicialmente 5% Regular / 10% Siege.

Razón de diseño: conserva una diferencia táctica clara entre ataque regular y asedio y está respaldado por evidencia temprana.

Estado: ALTA CONFIANZA, pero no CANÓNICO MARI hasta hallar documentación original directa.

## 176. TIERRA: NÚCLEO ESTABLE

Existe una continuidad fuerte entre documentación antigua y moderna:

Regular puede hacer perder al defensor hasta aproximadamente 5% de su tierra.

Siege puede hacer perder hasta aproximadamente 10%.

Aproximadamente un tercio de la tierra perdida se incorpora al reino atacante y dos tercios quedan destruidos durante la conquista, siempre sujeto a rango, cantidad de supervivientes y modificadores.

Esta relación 5% / 10% y reparto 1/3 conquistado aparece repetidamente y puede considerarse uno de los componentes más estables.

## 177. OCUPACIÓN DE TIERRA: VALORES FIJOS VS PROPORCIONALES

Una guía temprana ofrece valores fijos simplificados:

5.000 supervivientes para máximo Regular.

12.500 para máximo Siege.

2.500 para ganar Fortaleza en Siege.

Sin embargo, la misma familia de documentación y guías posteriores formula el requisito proporcional a la tierra del objetivo.

La fórmula posterior coherente es:

Regular max land: supervivientes >= 2,5 × TargetLand.

Siege max land: supervivientes >= 5 × TargetLand.

Ejemplo:

TargetLand = 3.000.

Regular = 7.500 supervivientes.

Siege = 15.000 supervivientes.

La existencia de ejemplos antiguos de 5.000 tropas por cada 1.000 acres apoya especialmente la proporcionalidad del Siege.

Conclusión: los valores fijos probablemente fueron una simplificación, un ruleset antiguo o una aproximación para tamaños típicos.

## 178. DECISIÓN DE OCUPACIÓN PARA ARCANUM

ARCANUM_CLASSIC usará:

RegularOccupancy = 2,5 × TargetLand.

SiegeOccupancy = 5 × TargetLand.

La cantidad máxima de tierra se escalará linealmente cuando sobrevivan menos unidades.

CLASSIC_MARI mantendrá un flag histórico:

LAND_OCCUPATION_MODEL = UNRESOLVED_EARLY.

Así podremos probar una variante fija si aparece evidencia original suficiente.

No se codificará el número 5.000 como constante global.

## 179. FORTALEZAS EN ASEDIO

Fórmulas posteriores bien documentadas:

mínimo de supervivientes para una posibilidad de robar una Fortaleza = TargetLand redondeado hacia arriba al múltiplo de 50 más cercano.

Garantía de robar una Fortaleza = valor anterior + 50.

Para destruir X Fortalezas adicionales:

TroopsNeeded = X × 50 × TargetLand / TargetForts,

redondeado hacia arriba al múltiplo de 50.

Máximo de Fortalezas adicionales destruidas:

floor(TargetForts / 10).

Estas fórmulas se clasifican como TR_MODERN / alta confianza y no se asumirán MARI sin evidencia anterior.

## 180. MAGIC Y PSYCHIC: DOS MOTORES DE DAÑO

La documentación conserva explícitamente una migración:

MODELO LEGACY:

Magic y Psychic usan Rand = 1.

Otros tipos usan Rand aleatorio 0,2–0,8.

MODELO NORMALIZADO:

los AP de ataques Magic/Psychic fueron duplicados;

después todos los tipos usan Rand 0,2–0,8.

Los dos modelos producen un daño esperado parecido, pero las estadísticas de AP ya no son intercambiables.

Ésta es una dependencia crítica de datos.

## 181. REGLA DE COMPATIBILIDAD DE AP

Nunca ejecutar:

AP_MODERNO_DUPLICADO + LEGACY_RAND_1.

Eso aproximadamente duplicaría el daño esperado de Magic/Psychic.

Definimos:

DAMAGE_MODEL_MARI_LEGACY:

Magic/Psychic Rand = 1 y requiere dataset de AP histórico.

DAMAGE_MODEL_TR_NORMALIZED:

todos Rand = 0,2–0,8 y usa AP moderno.

ARCANUM_ALPHA:

utilizará DAMAGE_MODEL_TR_NORMALIZED mientras las unidades procedan de fichas Arch modernas.

Cuando recuperemos AP históricos fiables, el simulador permitirá cambiar a DAMAGE_MODEL_MARI_LEGACY.

Esta decisión evita uno de los errores de reconstrucción más peligrosos.

## 182. ACCURACY: MODELO SUFICIENTEMENTE CERRADO

Base:

30% en Regular y defensa.

20% ofensivo en Siege salvo excepciones Flying/Siege y determinados Ranged vs Flying.

Existe una curva documentada de rendimientos decrecientes cuando la penalización neta supera aproximadamente 15 puntos.

Ejemplos:

20 puntos de penalización → 12% Accuracy real.

30 → 6%.

40 → 4%.

50 → 2%.

60 → 0%.

ARCANUM puede implementar esta tabla/interpolación como ACCURACY_CURVE_TR hasta encontrar una fórmula MARI.

Para Alpha es suficientemente determinista y comprobable.

## 183. EXPERIENCIA DE HÉROES

El umbral de nivel está documentado de manera consistente:

XP necesaria del nivel N al N+1 = 1.000 × N.

Las tasas de XP por turno sí dependen del servidor.

Ejemplo Arch moderno:

Battle Hero = 9,6 XP por turno + 24 por liderar una batalla.

Non-Battle Hero = 14,38 XP por turno.

Otros servidores usan tasas distintas.

Decisión:

HeroLevelCurve = 1000 × currentLevel puede entrar en núcleo.

HeroXpRate debe vivir en Ruleset y no en HeroDefinition.

## 184. MATRIZ DE DECISIONES 0.1

PAIRING:

MARI_CANDIDATE = PRE_2010.

ARCANUM_CLASSIC = PRE_2010.

TR_MODERN = MULTI_ROUND_2010_PLUS.

VICTORY_THRESHOLD:

MARI_CANDIDATE = REGULAR_5 / SIEGE_10.

ARCANUM_CLASSIC = REGULAR_5 / SIEGE_10.

TR_MODERN = REGULAR_10 / SIEGE_10.

LAND_LOSS_MAX:

Regular = 5%.

Siege = 10%.

Estado = estable.

LAND_OCCUPATION:

ARCANUM_CLASSIC = 2,5× / 5× TargetLand.

MARI = unresolved early variant.

MAGIC_PSYCHIC_RANDOM:

MARI_CANDIDATE = RAND_1 con AP histórico.

ARCANUM_ALPHA = NORMALIZED_RAND con AP Arch moderno.

TR_MODERN = NORMALIZED_RAND.

NET_POWER:

MARI_CANDIDATE = LEGACY_FAQ.

ARCANUM_CLASSIC = LEGACY_FAQ provisional.

TR_MODERN = MODERN_NP.

FORT_NP_CAP:

MARI_CANDIDATE = sin cap 2,5%.

POST_MAY_2008 = cap 2,5%.

HERO_LEVEL_CURVE:

1000 × nivel actual.

XP_RATE = versionado por servidor.

## 185. REGLA DE ORO DE LA RECONSTRUCCIÓN

Una cifra no puede etiquetarse como MARI sólo porque exista en Arch Server.

Una cifra no puede etiquetarse como original sólo porque aparezca en una wiki antigua.

Cada regla necesitará una procedencia.

Cuando existan dos sistemas incompatibles:

conservar ambos;

identificarlos;

probarlos;

elegir conscientemente cuál usa ARCANUM.

La honestidad histórica forma parte de la calidad técnica.

## 186. ARCANUM CORE RULES: RELEASE CANDIDATE

Con la arquitectura actual ya no faltan grandes sistemas.

Para declarar Core Rules v1.0 quedan cuatro tareas:

## 1. Auditar economía por turno: Oro, población, alimento y Maná.

## 2. Auditar Fortalezas/Barreras y bonificaciones defensivas históricas.

## 3. Auditar orden exacto de efectos de batalla y post-battle.

## 4. Construir una batería de casos de prueba con resultados reproducibles.

Terminadas esas cuatro, se congelará el ruleset ARCANUM_CLASSIC_1_0 y podrá comenzar el simulador de combate sin ambigüedades estructurales.

## 187. ECONOMÍA POR TURNOS: CORRECCIÓN DEL MODELO

La economía de ARCANUM no debe modelarse como cuatro reservas equivalentes.

Oro: recurso acumulable sin límite superior conocido.

Maná: recurso acumulable con capacidad limitada por Nodos.

Población: recurso vivo acumulable, limitado por comida, vivienda y efectos de mantenimiento.

Alimentos: capacidad de soporte producida principalmente por Granjas; no debe implementarse como una reserva acumulable ordinaria.

Por tanto sustituimos el campo food almacenado del modelo temprano por foodCapacity / foodProduction.

Esta corrección es importante porque la comida actúa como techo ecológico de población y ejército, no como moneda consumible almacenada.

## 188. PIPELINE ECONÓMICO DE UN TURNO

Modelo general propuesto:

## 1. Iniciar acción del jugador.

## 2. Resolver producción activa específica de la acción: Tax/Gelding, MP Charge, Pillage u otros ingresos inmediatos.

## 3. Resolver efectos que reaccionan a TURN_SPENT: encantamientos hostiles, invocaciones por turno, generación de objetos y otros triggers.

## 4. Recalcular capacidades estructurales: vivienda, comida, almacenamiento de Maná.

## 5. Resolver crecimiento o decrecimiento de Población.

## 6. Resolver ingreso base de Oro usando la Población resultante del turno cuando el ruleset lo exija.

## 7. Resolver producción base de Maná.

## 8. Aplicar modificadores de producción.

## 9. Aplicar límites de almacenamiento.

## 10. Pagar mantenimiento de unidades, héroes, edificios, encantamientos, barreras y otros sistemas.

## 11. Resolver crisis por recurso agotado: disbands, cancelación de encantamientos, destrucción de edificios, etc.

## 12. Guardar estado final y emitir TURN_RESOLVED.

La documentación actual confirma al menos que el mantenimiento se paga al final, después de las acciones activas de ingreso.

## 189. COMIDA Y ESPACIO RESIDENCIAL

Existen dos límites distintos:

Residential Space: personas que pueden ser alojadas.

Food Production: personas/unidades que pueden ser alimentadas.

La población civil sostenible queda restringida por el menor de ambos límites después de descontar las obligaciones de unidades que consumen espacio y/o comida.

Modelo:

availableResidential = totalResidentialSpace - unitResidentialOccupation.

availableFood = totalFoodProduction - unitFoodOccupation.

civilianCapacity = max(0, min(availableResidential, availableFood)).

Esta fórmula estructural se considera una representación fiel del comportamiento documentado, aunque algunas unidades poseen reglas especiales como soporte gratuito de Cuarteles.

## 190. CAPACIDAD RESIDENCIAL DE EDIFICIOS

Valores documentados:

Wilderness = 10 plazas por acre.

Farm = 100.

Town = 1.000.

Workshop = 30.

Guild/Library = 10.

Barracks = 20.

Fortress = 500.

Cada Barracks proporciona además soporte para 150 unidades reclutables que no consumen el límite normal de población de reclutas hasta agotar ese soporte.

Los valores residenciales de Nodes y Barriers no están suficientemente confirmados en la documentación consultada y deberán permanecer en BuildingVersion en vez de inventarse.

## 191. PRODUCCIÓN DE ALIMENTOS

Cada Farm produce 500 unidades de capacidad alimentaria base y aporta además 100 de espacio residencial.

Esto explica el ratio económico clásico cercano a 2,5 Farms por Town:

10 Towns → 10.000 residencia.

25 Farms → 2.500 residencia + 12.500 comida.

La combinación produce aproximadamente 12.500 de vivienda y 12.500 de comida antes de otros edificios y modificadores.

Hechizos como Weather Summoning y Nature's Favor modifican foodProduction por granja y por tanto elevan indirectamente el techo de población y el ingreso de Oro.

## 192. CRECIMIENTO DE POBLACIÓN

Crecimiento típico documentado lejos del techo:

BasePopulationGrowth = 50 + CurrentPopulation × 0,015.

Ejemplo:

CurrentPopulation = 100.000.

BaseGrowth = 1.550 por turno.

Cuando la población entra aproximadamente en el rango 90–100% de su máximo sostenible, el crecimiento disminuye progresivamente hasta llegar a 0 en el máximo.

Si la población supera la capacidad, el crecimiento pasa a ser negativo y habitantes abandonan el reino.

La función exacta de taper entre 90% y 100% no está publicada con suficiente precisión.

Definimos:

POP_GROWTH_BASE = 50 + 0,015P.

POP_CAP_TAPER = UNRESOLVED.

ARCANUM_ALPHA podrá utilizar interpolación lineal provisional entre 90% y 100% exclusivamente como placeholder configurable, nunca etiquetada como fórmula MARI.

## 193. ESPIRAL DE POBLACIÓN

La población es distinta de Oro y Maná porque su propia cantidad ayuda a determinar cuánto se regenera.

Perder mucha población puede generar:

menos crecimiento;

menos Oro;

incapacidad para pagar tropas/edificios;

más pérdidas;

nueva caída de población.

Esto crea la Population Spiral.

Debe conservarse porque constituye una de las crisis económicas más características del juego.

El motor no debe aplicar una recuperación artificial acelerada simplemente por estar en baja población.

## 194. ORO: FÓRMULA LEGACY

La documentación conserva una fórmula antigua:

BaseGeldIncome =

CurrentPopulation × sqrt((100 + 10 × Towns) / Land) + 1.000.

Esta fórmula hace que los Towns tengan dos efectos:

## 1. aumentan fuertemente el espacio residencial;

## 2. aumentan directamente el rendimiento económico por habitante.

La propia documentación registra cambios posteriores de esta fórmula hasta llegar al modelo moderno simplificado CurrentPopulation + 1.000.

Por tanto el ingreso de Oro también necesita versionado histórico.

## 195. ORO: HISTORIA DE CAMBIOS

Se conservan al menos tres estados:

GELD_LEGACY:

P × sqrt((100 + 10T) / L) + 1.000.

GELD_BLITZ_2009_EXPERIMENTAL:

una modificación extrema del exponente registrada en Blitz durante 2009.

GELD_MODERN:

P + 1.000.

La fórmula legacy es mucho más coherente con guías antiguas que hablan de que aumentar el porcentaje de Towns incrementa el Oro por habitante.

Por ello se convierte en el candidato principal para CLASSIC_MARI.

## 196. DECISIÓN DE ORO PARA ARCANUM

CLASSIC_MARI candidate:

GELD_INCOME_MODEL = LEGACY_TOWN_MULTIPLIER.

ARCANUM_CLASSIC:

usar inicialmente la fórmula legacy.

TR_MODERN:

usar CurrentPopulation + 1.000 cuando se simule ese ruleset.

El ingreso utiliza la población del final del turno en documentación posterior; ese orden queda como comportamiento inicial de ARCANUM_CLASSIC hasta encontrar evidencia temprana contraria.

Los modificadores de dioses, héroes, objetos y encantamientos se aplicarán como capas independientes.

## 197. TAX / GELDING

La acción histórica Gelding, que ARCANUM puede presentar al jugador como Recaudar Impuestos, concede por cada turno una cantidad adicional basada en el ingreso de Oro.

Conceptualmente:

turnIncome = normalTurnIncome.

activeTaxBonus = base/net income definido por ruleset.

FinalGoldChange = activeTaxBonus + ordinaryTurnEconomy - upkeep.

La documentación moderna describe esta acción aproximadamente como obtener un turno adicional de ingreso mientras el turno normal sigue ocurriendo.

No debe implementarse como una cantidad fija de Oro.

## 198. MANÁ: ALMACENAMIENTO

Cada Node almacena 1.000 MP.

ManaCapacity = Nodes × 1.000.

El Maná no puede mantenerse normalmente por encima de esa capacidad después de resolver un turno, aunque puede existir un exceso temporal si se destruyen Nodos entre acciones.

A diferencia del Oro, el Maná tiene por tanto un techo estructural que cambia inmediatamente con los Nodos.

## 199. MANÁ: PRODUCCIÓN BASE

Fórmula documentada:

X = floor(100 × Nodes / Land).

BaseManaYield =

X × Land / 100

+ Nodes × (100 - X) / 10.

Ejemplo documentado:

Land = 5.000.

Nodes = 2.000.

X = 40.

Yield = 2.000 + 12.000 = 14.000 MP por turno.

La producción presenta rendimientos decrecientes y alcanza un máximo alrededor del 55% de tierra dedicada a Nodos.

La documentación también señala que el sistema de redondeo ha cambiado con el tiempo; el comportamiento exacto de los antiguos máximos locales debe mantenerse versionado.

## 200. DECISIÓN DE MANÁ

ARCANUM_ALPHA:

usar NODE_YIELD_DOCUMENTED con la fórmula anterior y almacenamiento = 1.000 por Node.

CLASSIC_MARI:

NODE_YIELD_ROUNDING_MODEL permanece PENDING porque existen referencias a optimizaciones antiguas en porcentajes terminados en .99%.

TR_MODERN:

usar la versión documentada vigente del cálculo.

Todos los modificadores de Moon, héroes, hechizos y Hidden Upkeep se aplicarán después del base yield, salvo excepciones documentadas.

## 201. MP CHARGE

MP Charge es el equivalente mágico de Recaudar Impuestos.

Por cada turno de carga se genera una cantidad adicional de Maná basada en el ingreso del reino, además de procesarse el turno ordinario.

La documentación muestra una sutileza:

la carga adicional se contabiliza antes de determinados costes y antes del ajuste final de almacenamiento.

Por ello cargar muchos turnos de golpe cerca del máximo puede desperdiciar Maná.

ARCANUM debe resolver MP Charge turno a turno internamente aunque la interfaz permita introducir “20 turnos”.

## 202. ORDEN DE MANTENIMIENTO

El mantenimiento se paga al final del turno.

Categorías:

GoldUpkeep.

ManaUpkeep.

PopulationUpkeep.

Puede proceder de:

unidades;

héroes;

edificios;

encantamientos;

objetos únicos;

barreras;

otros efectos.

Un modificador de “Hidden Upkeep” no necesita aparecer como coste explícito: puede reducir la producción antes de calcular el neto.

El Status Report debe separar:

Gross Income.

Visible Upkeep.

Hidden Modifiers.

Net Income.

## 203. ECONOMÍA NEGATIVA Y OVERSUMMONING

Es legal mantener ingresos negativos mientras exista reserva suficiente.

Esto es especialmente importante para Maná:

un mago puede invocar temporalmente un ejército mayor de lo que sus Nodos pueden sostener y consumir la reserva durante una ofensiva.

Este comportamiento, conocido como oversummoning, debe preservarse.

Un ingreso negativo no destruye tropas por sí solo.

La crisis comienza cuando el recurso necesario llega efectivamente a cero y no puede pagarse el mantenimiento.

## 204. CRISIS DE ORO

Cuando el Oro disponible no permite pagar mantenimiento:

## 1. stacks consumidores de Oro pueden disbandarse;

## 2. héroes pueden perderse según reglas;

## 3. empiezan a destruirse edificios;

## 4. Guilds, Workshops y Barracks aparecen entre los edificios vulnerables;

## 5. finalmente pueden caer Fortalezas.

Una regla documentada indica que, en bancarrota severa, puede perderse aproximadamente la mitad de las Fortalezas por turno.

Cero Fortalezas → muerte del mago.

La prioridad exacta de destrucción necesita auditoría histórica adicional.

## 205. CRISIS DE MANÁ

Cuando el Maná se agota:

stacks consumidores de MP pueden disbandarse;

encantamientos mantenidos pueden cancelarse;

Barreras pueden llegar a desaparecer.

El orden exacto entre stacks, encantamientos y Barreras deberá parametrizarse hasta cerrar evidencia histórica.

La economía de Maná es por tanto simultáneamente:

combustible ofensivo,

mantenimiento militar,

defensa mágica,

y almacenamiento estratégico.

## 206. CRISIS DE POBLACIÓN

Cuando la Población llega a cero o no cubre mantenimiento:

stacks consumidores de población pueden perderse;

el ingreso de Oro cae de forma dramática;

puede desencadenarse bancarrota secundaria.

La población constituye por ello el recurso con mayor capacidad de producir colapso en cascada:

Population → Geld → Buildings/Forts → Life.

## 207. FORTALEZAS COMO COSTE ECONÓMICO

El mantenimiento de Fortalezas es progresivo.

Para la Fortaleza número n:

Upkeep_n = 240 + 60n.

Para n Fortalezas:

TotalFortUpkeep =

240n + 30n(n + 1).

Esto evita que la defensa pueda escalar gratuitamente.

Ejemplo:

10 Fortalezas → 2.400 + 3.300 = 5.700 Oro/turno.

100 Fortalezas → 24.000 + 303.000 = 327.000 Oro/turno.

La fórmula deberá verificarse históricamente antes de etiquetarla MARI, pero puede implementarse como FORT_UPKEEP_TR.

## 208. MODIFICADORES ECONÓMICOS

La economía nunca debe sobrescribir las cifras base.

Pipeline:

baseProduction

→ building modifiers

→ spell modifiers

→ hero modifiers

→ god modifiers

→ unique/item modifiers

→ hidden modifiers

→ active-action bonus

→ resource cap

→ upkeep

→ crisis resolution.

Así podemos representar, por ejemplo:

Weather Summoning → Food Production.

Nature → Food/Population u Oro según versión.

Moon → Mana Yield.

Alchemist → Oro arriba / Maná abajo.

Laziness → fuerte reducción de Oro.

Black Sabbath → cambio simultáneo de Población, Maná y unidades.

Los modificadores deberán declarar add/multiply/override y su prioridad.

## 209. RESOURCE LEDGER

Cada turno deberá producir internamente un ledger auditable:

ResourceLedger {

 turn,

 openingGold,

 openingMana,

 openingPopulation,

 residentialCapacity,

 foodCapacity,

 grossGold,

 grossMana,

 populationGrowth,

 activeIncome,

 goldUpkeep,

 manaUpkeep,

 populationUpkeep,

 hiddenModifiers[],

 closingGold,

 closingMana,

 closingPopulation,

 crisisEvents[]

}

Este ledger permitirá explicar exactamente por qué un reino ganó o perdió recursos y será fundamental para debugging, balance y soporte al jugador.

## 210. ESTADO DE LA AUDITORÍA ECONÓMICA

CERRADO CON ALTA CONFIANZA:

Food como capacidad, no reserva.

Farm food = 500.

Farm residential = 100.

Town residential = 1.000.

Workshop residential = 30.

Guild residential = 10.

Barracks residential = 20.

Barracks recruit support = 150.

Fortress residential = 500.

Population growth base = 50 + 1,5%.

Mana storage = 1.000 por Node.

Node yield principal.

Upkeep al final del turno.

Posibilidad de economía negativa mientras exista reserva.

Mecánica de Tax/Gelding y MP Charge.

MODELOS VERSIONADOS:

Geld legacy vs moderno.

Node rounding histórico.

God/effect modifiers.

PENDIENTE:

taper exacto de Population 90–100%.

residencia exacta de Nodes/Barriers.

upkeep exacto de edificios excepto Fortalezas.

prioridad completa de crash por recursos.

Con esto la economía es ya suficientemente completa para construir el Economy Simulator del Alpha sin inventar ninguna gran mecánica.

## 211. DEFENSA TERRITORIAL: CAPAS DEL SISTEMA

La defensa de un reino no es una única estadística. Está formada por capas:

## 1. Barreras: bloquean magia y objetos hostiles antes de que alcancen el reino.

## 2. Resistencia de Reino: segunda tirada defensiva específica por color mágico.

## 3. Assignment defensivo: hechizo/objeto automático que fortalece el ejército o debilita al atacante.

## 4. Fortalezas: aumentan los HP efectivos del ejército defensor y determinan la vida del mago.

## 5. Ejército: ejecuta la defensa táctica mediante stacking, pairing, resistencias, iniciativa y habilidades.

## 6. Protecciones de servidor: Apprentice, Damage, Council, Pillage y Meditation.

Estas capas deben conservarse separadas en el motor.

## 212. FORTALEZAS: FUNCIÓN CENTRAL

Las Fortalezas cumplen simultáneamente cuatro funciones:

LIFE_ANCHOR: con 0 Fortalezas el mago muere.

DEFENSIVE_HP: aumentan HP efectivos de todas las formaciones defensoras.

TERRITORIAL_ASSET: pueden perderse, destruirse o capturarse mediante Asedio.

ECONOMIC_COST: tienen mantenimiento progresivo y añaden Poder Neto según ruleset.

También aportan 500 plazas residenciales cada una.

Su importancia es por tanto militar, económica y existencial.

## 213. BONUS DE HP DE FORTALEZAS

La documentación actual conserva puntos precisos:

defendiendo Regular:

bonus base = +10% HP.

bonus máximo = +37,5% HP.

defendiendo Siege:

bonus base = +20% HP.

bonus máximo = +75% HP.

Hasta aproximadamente 0,67% de la tierra en Fortalezas se aplica el bonus base.

Por encima de 0,67% el bonus aumenta linealmente.

El máximo se alcanza en 2,5% de la tierra.

Las Fortalezas por encima de 2,5% no aumentan más el HP defensivo.

## 214. FÓRMULA RECONSTRUIDA DEL FORT BONUS

Sea:

fortPct = 100 × Fortresses / Land.

Para Regular:

si fortPct <= 0,67:

FortHPBonus = 0,10.

si 0,67 < fortPct < 2,5:

FortHPBonus = 0,10 + ((fortPct - 0,67) / 1,83) × 0,275.

si fortPct >= 2,5:

FortHPBonus = 0,375.

Para Siege:

FortHPBonusSiege = 2 × FortHPBonusRegular.

La fórmula intermedia es una reconstrucción algebraica de los puntos documentados y la afirmación de crecimiento lineal; no una fórmula publicada directamente por MARI.

Se etiqueta FORT_HP_CURVE_TR_HIGH_CONFIDENCE.

## 215. CONFIANZA HISTÓRICA DEL FORT BONUS

Una guía de aproximadamente 2004 ya afirma que tener muchas Fortalezas concede bonus de Hit Points al defender y que el Asedio proporciona varias ventajas defensivas al objetivo.

Una guía posterior y testimonios de 2009 conservan exactamente los máximos de 37,5% en Regular y 75% en Siege a 2,5% de Fortalezas.

Conclusión:

la existencia del Fort Bonus es HEREDADO / MUY ALTA CONFIANZA.

Los puntos exactos 0,67%, 37,5% y 75% son TR/Arch de alta confianza, pero todavía no deben etiquetarse como prueba directa MARI.

ARCANUM_CLASSIC los usará provisionalmente por falta de evidencia contradictoria.

## 216. ASALTO REGULAR Y FORTALEZAS

Regular es una batalla territorial periférica.

El defensor recibe el Fort Bonus reducido.

No existe Siege Accuracy Penalty para el atacante.

Un Regular exitoso puede hacer perder hasta 5% de la tierra.

La documentación moderna indica que los Regulars pueden destruir Fortalezas sólo si éstas constituyen un porcentaje suficientemente alto de la tierra, pero nunca capturan una Fortaleza.

La fórmula exacta que determina cuándo un Regular alcanza Fortalezas no está documentada suficientemente.

Definimos:

REGULAR_FORT_DESTRUCTION_MODEL = UNRESOLVED.

Durante Alpha, Regular no destruirá Fortalezas en ARCANUM_CLASSIC hasta que se cierre esta regla, salvo rulesets explícitos de prueba.

## 217. ASEDIO Y FORTALEZAS

Siege es el ataque diseñado para atravesar la defensa interior.

El defensor recibe aproximadamente el doble del Fort Bonus de un Regular.

Las unidades terrestres atacantes sin Flying ni habilidad Siege sufren la penalización de Precisión de Asedio.

Un Siege exitoso puede destruir hasta 10% de la tierra.

Si sobreviven suficientes tropas, puede destruir Fortalezas y una de ellas puede ser capturada por el atacante.

Además, Regular y Siege pagan War Expense/Battle Cost equivalente al mantenimiento de todo el ejército del atacante antes de la batalla en reglas documentadas; Pillage no paga este Battle Cost.

## 218. CAPTURA DE LA PRIMERA FORTALEZA EN SIEGE

Fórmula moderna bien documentada:

possibleFortStealTroops =

TargetLand redondeado hacia arriba al múltiplo de 50 más cercano.

guaranteedFortStealTroops =

possibleFortStealTroops + 50.

Entre ambos valores existe posibilidad de captura no garantizada.

Esta Fortaleza inicial, cuando se obtiene, se añade al reino atacante.

Estado: TR_MODERN / ALTA CONFIANZA.

CLASSIC_MARI: pendiente de evidencia histórica.

ARCANUM_CLASSIC: usar esta fórmula inicialmente porque es determinista y coherente con el sistema de ocupación.

## 219. DESTRUCCIÓN DE FORTALEZAS ADICIONALES

Después de la primera Fortaleza:

TroopsNeeded(X) =

X × 50 × TargetLand / TargetForts,

redondeado hacia arriba al múltiplo de 50.

Máximo:

X_max = floor(TargetForts / 10).

Ejemplos:

0–9 Fortalezas → 0 adicionales.

10–19 → máximo 1.

20–29 → máximo 2.

30–39 → máximo 3.

Estas Fortalezas adicionales son destruidas, no transferidas al atacante.

Estado: TR_MODERN / ALTA CONFIANZA.

## 220. FORTALEZAS Y SAQUEO

Pillage no entra en la misma lógica que Regular/Siege.

La documentación recomienda alrededor de:

10 unidades por acre

y aproximadamente 1% de Fortalezas

como una defensa fiable frente a saqueos, aunque se aclara que no existe bloqueo 100% garantizado.

Más Fortalezas reducen la cantidad de tropas necesaria para bloquear.

La fórmula exacta de Pillage Blocking no está publicada.

Definimos:

PILLAGE_BLOCK_MODEL = BLACK_BOX.

No se inventará una fórmula hasta obtener evidencia adicional.

## 221. BARRERAS: FUNCIÓN

Las Barreras protegen el reino frente a hechizos y objetos hostiles.

No aumentan HP del ejército.

No protegen por sí solas frente a ataques Regular, Siege o Pillage.

No proporcionan espacio residencial.

Se construyen exclusivamente a ritmo de 1 Barrera por turno: Talleres y Engineer no aceleran su construcción.

Coste de construcción documentado en TR: 50 MP por Barrera.

## 222. MÁXIMO DE BARRERAS

Sin Skills posteriores:

aproximadamente 2,5% de la tierra en Barreras → 75% de Barrier Resistance.

La guía muy antigua conservada ya documenta 2,5% → 75%, por lo que este núcleo tiene alta probabilidad de ser heredado de Archmage.

Skills posteriores como Barrier Proficiency llegaron a elevar el máximo hasta 83% y a reducir el porcentaje necesario; estas mejoras son claramente POST-MARI/TR y no entrarán en ARCANUM_CLASSIC inicialmente.

## 223. CURVA INTERMEDIA DE BARRERAS

La curva exacta histórica por debajo de 2,5% no está publicada en las fuentes disponibles.

Para el Alpha definimos provisionalmente:

BarrierResistance =

min(75, 30 × barrierPct)

donde barrierPct es el porcentaje de tierra expresado en puntos porcentuales.

Ejemplos provisionales:

0,5% → 15%.

1,0% → 30%.

2,0% → 60%.

2,5% → 75%.

Nombre:

BARRIER_CURVE_LINEAR_PROVISIONAL.

Esta función NO se etiquetará MARI ni TR hasta ser validada contra datos reales.

La arquitectura permitirá reemplazarla sin migración de datos.

## 224. MANTENIMIENTO DE BARRERAS Y CAMBIO HISTÓRICO

Actualmente se documentan:

30 MP/turno por Barrera en servidores non-oversummoning.

60 MP/turno en determinados servidores oversummoning.

Existe una anotación de cambios fechada en enero de 2008 que dice explícitamente:

Barrier upkeep increased 20% to 30 m.p.

Esto demuestra que incluso dentro de TR el mantenimiento cambió.

Por tanto:

BARRIER_UPKEEP_PRE_JAN_2008 = 20 MP.

BARRIER_UPKEEP_POST_JAN_2008 = 30 MP.

BARRIER_UPKEEP_OVERSUMMONING = 60 MP.

El coste exacto MARI permanece sin demostrar.

ARCANUM_CLASSIC utilizará provisionalmente 20 MP si busca sensación legacy, sujeto a balance Alpha.

## 225. DEFENSA CONTRA HECHIZOS: DOS TIRADAS

Un hechizo hostil contra un reino sigue conceptualmente:

## 1. Barrier Check.

## 2. Si atraviesa Barreras → Kingdom Resistance Check por color.

## 3. Si atraviesa ambos → aplicar protecciones/reflejos adicionales cuando proceda.

## 4. Ejecutar efecto.

Barrier Resistance es universal frente a colores.

Kingdom Resistance tiene un valor separado para Ascendente, Verdante, Erradicación, Abisal y Fantasma.

Por tanto una Barrera del 75% y una Kingdom Resistance del 75% no producen 150%; producen dos tiradas:

chanceToPass = 0,25 × 0,25 = 6,25%.

TotalResistance efectiva = 93,75%.

## 226. DEFENSA CONTRA OBJETOS

Los objetos no tienen color mágico.

Por ello:

Barrier Check = sí.

Kingdom Color Resistance = no.

Spell Penetration posterior afecta Barreras y Kingdom Resistance de hechizos, pero no objetos.

El motor debe distinguir:

HOSTILE_SPELL.

HOSTILE_ITEM.

Aunque ambos puedan usar la misma infraestructura de Barrier Check.

## 227. ORDEN DE REFLEJOS Y PROTECCIONES

La documentación de Heavenly Protection establece que Barrier Resistance y Kingdom Resistance se comprueban antes de su posibilidad de reflejo.

The Mirror of the Grey Witch también se documenta después de Barreras, resistencia de color y Heavenly Protection.

Pipeline de hechizo hostil:

Barrier

→ Kingdom Resistance

→ Heavenly Protection

→ Mirror/other reflectors

→ efecto.

Cada etapa puede devolver:

BLOCKED;

RESISTED;

REFLECTED;

PASSED.

Esta secuencia debe producir eventos visibles en el informe.

## 228. ASSIGNMENT DEFENSIVO

El defensor puede asignar automáticamente un hechizo y/o objeto según el tamaño relativo del ejército atacante.

Importante:

los efectos defensivos asignados no deben atravesar las Barreras del propio defensor.

El hechizo sí puede fallar por concentración/afinidad cuando corresponda.

El sistema permite thresholds configurables para evitar gastar recursos contra ataques insignificantes.

Assignment forma parte de PRE_BATTLE_DEFENSE y se ejecuta antes del pairing efectivo.

## 229. DESTRUCCIÓN TERRITORIAL POR TIPO DE ATAQUE

Pillage:

convierte únicamente Farms, Towns, Workshops y Guilds en Wilderness en el sistema documentado; no visita Nodes, Barracks, Barriers, Fortresses ni Wilderness como objetivos de quema.

Regular:

puede destruir Farms, Towns, Nodes, Workshops, Guilds, Barracks, Barriers y Wilderness dentro de la tierra perdida; normalmente no captura Fortalezas.

Siege:

puede afectar todos los anteriores y además Fortalezas.

El ganador recibe aproximadamente un tercio de la tierra perdida por el defensor y el resto se destruye, sujeto a ocupación y modificadores.

La distribución exacta de tipos de edificio dentro de los acres transferidos/destruidos necesita aún una fórmula de selección.

## 230. FORTALEZAS, MUERTE Y EFECTOS NO BÉLICOS

Un mago puede perder Fortalezas no sólo por Siege.

Encantamientos destructivos y objetos como Atomic Bomb pueden destruir edificios, incluidas Fortalezas, según sus reglas.

El colapso económico severo también puede destruir Fortalezas.

En todos los casos:

después de cada resolución que modifique Fortresses debe ejecutarse:

if Fortresses <= 0:

    emit MAGE_KILLED.

No debemos limitar la comprobación de muerte al final de una batalla.

## 231. MODELO DE DEFENSA TERRITORIAL

KingdomDefenseState {

 land,

 fortresses,

 barriers,

 fortPercent,

 barrierPercent,

 fortHpBonusRegular,

 fortHpBonusSiege,

 barrierResistance,

 kingdomResistanceBySchool,

 defensiveAssignment,

 protections[],

 activeDefensiveEnchantments[],

 reflectors[]

}

La defensa se calcula desde el estado actual en el instante del ataque.

No se almacenará fortHpBonus como estadística permanente: se derivará de Land/Fortresses y Ruleset.

## 232. MATRIZ DE DECISIONES DEFENSIVAS

FORT_HP:

ARCANUM_CLASSIC = curva 10→37,5 Regular / 20→75 Siege.

MARI = bonus confirmado conceptualmente; cifras exactas no demostradas.

MAX_EFFECTIVE_FORTS:

2,5% de Land.

Estado = alta confianza.

BARRIER_MAX:

2,5% → 75%.

Estado = evidencia antigua + moderna; alta confianza.

BARRIER_INTERMEDIATE_CURVE:

ARCANUM_ALPHA = lineal provisional.

MARI = desconocida.

BARRIER_UPKEEP:

Legacy TR pre-2008 = 20 MP.

TR post-2008 = 30 MP.

Oversummoning rulesets = 60 MP.

MARI = pendiente.

SPELL_DEFENSE:

Barrier roll → Kingdom Resistance roll → reflections.

Estado = alta confianza TR; arquitectura adoptada.

ITEM_DEFENSE:

Barrier roll únicamente respecto a resistencia territorial por color.

Estado = alta confianza.

SIEGE_FORT_CAPTURE:

ARCANUM_CLASSIC = fórmula Ronin moderna provisional.

MARI = unresolved.

REGULAR_FORT_DESTRUCTION:

unresolved.

PILLAGE_BLOCKING:

black box.

## 233. CASOS DE PRUEBA DEFENSIVOS

Caso A:

Land 10.000.

Forts 67 = 0,67%.

Regular HP bonus = 10%.

Siege HP bonus = 20%.

Caso B:

Land 10.000.

Forts 250 = 2,5%.

Regular HP bonus = 37,5%.

Siege HP bonus = 75%.

Caso C:

Land 10.000.

Forts 150 = 1,5%.

Regular reconstruido:

10% + ((1,5 - 0,67)/1,83 × 27,5%) ≈ 22,47%.

Siege ≈ 44,95%.

Caso D:

Barrier Resistance 75%.

Kingdom Eradication Resistance 40%.

Chance de un hechizo rojo de atravesar ambas:

0,25 × 0,60 = 15%.

Defensa conjunta = 85%.

Caso E:

Barrier 75%, Kingdom resistance 75%.

Pass = 6,25%.

Defense = 93,75%.

Estos casos deberán formar parte del test suite del simulador.

## 234. ESTADO DE LA DEFENSA TERRITORIAL

CERRADO PARA ALPHA:

papel de Fortalezas.

Fort HP Bonus.

máximo efectivo 2,5%.

mantenimiento progresivo de Fortalezas.

muerte a 0 Fortalezas.

papel de Barreras.

2,5% Barreras → 75%.

construcción 1 por turno.

defensa en dos tiradas para hechizos.

diferencia entre hechizos y objetos.

orden básico de reflejos.

defensive assignment.

Siege capture/destruction TR.

destrucción territorial por ataque.

PENDIENTE HISTÓRICO:

curva original intermedia de Barreras.

mantenimiento MARI exacto de Barreras.

Regular Fort destruction formula.

Pillage blocking formula.

selección exacta de edificios conquistados/destruidos.

La defensa territorial ya es suficientemente precisa para el Economy Simulator y Battle Simulator del Alpha.

El siguiente bloque es el orden exacto de efectos PRE_BATTLE, BATTLE y POST_BATTLE.

## 235. MOTOR DE COMBATE: ORDEN MAESTRO

El combate de ARCANUM se dividirá formalmente en tres macrofases:

PRE_BATTLE.

BATTLE.

POST_BATTLE.

La finalidad no es sólo organizativa. Muchos efectos producen resultados diferentes según la fase en que se ejecutan.

Ejemplo:

un modificador de HP debe aplicarse antes de recibir daño;

Steal Life ocurre durante el combate;

Resurrection y Healing trabajan sobre bajas al final.

Cada efecto deberá declarar:

triggerPhase;

priority;

targetSelector;

conditions;

operation;

duration.

## 236. PRE_BATTLE: VALIDACIÓN Y COSTES

Antes de construir el campo de batalla:

## 1. validar atacante, defensor y tipo de ataque;

## 2. comprobar rango de Poder Neto/protecciones/counter cuando corresponda;

## 3. comprobar turnos;

## 4. comprobar Maná e inventario para hechizo/objeto ofensivo;

## 5. resolver War Expense/Battle Cost cuando el ruleset lo exija;

## 6. consumir turnos;

## 7. fijar snapshots iniciales de ejército, tierra, Fortalezas, recursos y encantamientos.

En Regular y Siege modernos, el Battle Cost equivale aproximadamente al mantenimiento de todo el ejército atacante y se paga antes del combate.

Si una acción queda bloqueada por efectos como Hallucination, el ruleset puede conservar el gasto de turnos y War Expense.

## 237. SELECCIÓN DEL EJÉRCITO BASE

El atacante puede enviar una selección de sus tropas.

El defensor utiliza automáticamente su ejército elegible.

De las unidades ordinarias, sólo las 10 formaciones con mayor peso de combate entran normalmente como BASE_COMBAT_STACK.

La selección de estas 10 utiliza Poder de Formación y reglas naturales de stacking.

Las unidades exactamente empatadas pueden requerir el orden interno de la base de unidades como tie-break.

Después pueden añadirse formaciones especiales:

REINFORCEMENT.

TEMPORARY_STACK.

BATTLE_ONLY_STACK.

Estas categorías no deben competir necesariamente por las mismas 10 plazas base.

## 238. ORDEN NATURAL DE STACKING

Antes de aplicar modificaciones temporales se fija la posición natural de cada formación.

StackPower = UnitPowerRank × Quantity.

PositionModifier:

naturalRanged = ×1,00.

terrestre no-ranged = ×1,50.

naturalFlying = ×2,25.

Los efectos de hechizos, objetos, héroes o encantamientos no cambian este orden natural.

Ejemplo:

Carpet of Flying puede hacer que un Lich vuele efectivamente, pero no cambia su posición de stacking calculada como unidad naturalmente Ranged.

Este orden queda congelado para el emparejamiento salvo reglas históricas específicas.

## 239. REFUERZOS Y TROPAS TEMPORALES

Los refuerzos aliados se añaden después del ejército base y aparecen documentados al final del orden de stacks.

Las unidades temporales generadas específicamente para una batalla se etiquetan permanentArmy = false.

Esto es crucial porque:

las unidades temporales pueden atacar y morir;

sus bajas pueden afectar eventos tácticos;

pero no cuentan para el umbral mínimo de porcentaje destruido del ejército permanente en la condición de victoria.

Cada BattleStack deberá guardar sourceOwnerMageId y permanentArmy.

## 240. HÉROES ANTES DEL COMBATE

Los Battle Heroes se incorporan automáticamente a Regular/Siege cuando cumplen condiciones.

Primero se asignan a una formación según:

nivel/prioridad;

preferencia de color;

preferencia de raza;

poder de formación disponible.

Una coincidencia de color y raza puede añadir:

InitialEfficiency += heroLevel / 100.

Los héroes también pueden aplicar:

modificadores pasivos;

habilidades PRE_BATTLE;

ataques o habilidades BATTLE.

El héroe mantiene un HeroBattleState independiente porque puede sobrevivir o morir aunque desaparezca su formación.

## 241. MODIFICADORES PERSISTENTES

Antes de resolver acciones directas de batalla se aplican los efectos persistentes relevantes:

encantamientos;

Unique Items pasivos;

Favor/Disfavor de dioses;

habilidades de héroes pasivas;

Fort Bonus del defensor;

modificadores propios del ruleset.

Estos efectos pueden modificar:

HP;

Primary AP;

Extra AP;

Counter AP;

Accuracy;

Efficiency inicial;

resistencias;

tipos de ataque;

Flying/Ranged efectivos;

Healing/Regeneration;

otros atributos.

El battle report documenta que unidades pueden entrar en batalla con estadísticas distintas a las de la Enciclopedia precisamente por spells, items, heroes, enchantments y fort percentages.

## 242. BATTLE SPELL Y BATTLE ITEM

El atacante puede seleccionar un hechizo de batalla y un objeto de batalla.

El defensor puede tener un spell assignment y un item assignment condicionados al tamaño del ataque.

Si se cumplen los thresholds:

el objeto debe existir;

el hechizo debe disponer de Maná y superar su tirada de lanzamiento.

Los efectos pueden ser:

STAT_MODIFIER;

ABILITY_GRANT;

ABILITY_REMOVE;

DIRECT_DAMAGE;

DIRECT_KILL;

TEMPORARY_UNIT;

RECOVERY_EFFECT;

CONTROL.

La documentación muestra que hechizos/objetos de batalla modifican las fichas de las unidades antes de los ataques y que efectos de daño directo como Chain Lightning pueden matar unidades antes de que el combate ordinario continúe.

El orden interno exacto entre objeto atacante, hechizo atacante, objeto defensor y hechizo defensor no está demostrado suficientemente.

Definimos BATTLE_SETUP_EFFECT_PRIORITY como configurable.

## 243. EFECTOS PRECOMBAT DE DAÑO Y CONTROL

Los efectos que causan daño directo, muerte o control antes de los ataques de unidades deben resolverse antes de construir la cola final de eventos.

Ejemplos:

Chain Lightning;

Holy Word;

Staff of Illusion;

Flasks of Holy Water;

Head of Medusa;

determinadas habilidades de héroes como Turn Undead.

Las bajas producidas aquí reducen inmediatamente Quantity de la formación y por tanto pueden disminuir el daño de sus ataques posteriores.

Si una formación queda aniquilada, no genera eventos de ataque ordinarios.

## 244. ESTADÍSTICAS EFECTIVAS Y PAIRING

Tras resolver los modificadores PRE_BATTLE:

## 1. calcular effectiveHP;

## 2. effectivePrimaryAP;

## 3. effectiveExtraAP;

## 4. effectiveCounterAP;

## 5. effectiveAccuracy;

## 6. effectiveResistances;

## 7. effectiveFlying/effectiveRanged;

## 8. abilities activas.

Después ejecutar el algoritmo de pairing.

El orden natural de stacking permanece congelado, pero la capacidad efectiva para alcanzar objetivos puede utilizar propiedades temporales como Flying.

PAIRING_CLASSIC_PRE_2010 y PAIRING_TR_2010_PLUS compartirán esta interfaz y diferirán únicamente en sus reglas de selección/reasignación.

## 245. CREACIÓN DE LA COLA DE EVENTOS

Cada formación emparejada crea eventos independientes:

PRIMARY_ATTACK.

EXTRA_ATTACK si existe.

ADDITIONAL_STRIKE_PRIMARY si posee Additional Strike.

HERO_ATTACK/HERO_ABILITY cuando corresponda.

Los eventos tienen Initiative propia.

Se ordenan de mayor a menor Iniciativa.

Los empates exactos permanecen RULESET_TIE_BREAK = UNRESOLVED/RANDOM hasta obtener evidencia histórica superior.

Una Extra Attack de iniciativa 3 puede ejecutarse antes que la Primary Attack de iniciativa 2 de la misma formación.

## 246. RESOLUCIÓN DE UN ATTACK EVENT

Antes de cada evento:

## 1. comprobar que el stack atacante todavía existe;

## 2. obtener Quantity actual, no la cantidad inicial;

## 3. comprobar que el objetivo sigue siendo válido;

## 4. obtener AP efectivo;

## 5. calcular Efficiency actual;

## 6. calcular Accuracy;

## 7. aplicar Rand del Damage Model;

## 8. calcular resistencia media;

## 9. aplicar Scales, Weakness, Large Shield y otros multiplicadores;

## 10. producir Damage;

## 11. añadir daño acumulado al objetivo;

## 12. convertir daño acumulado en muertes inmediatas;

## 13. registrar bajas y HP parcial restante;

## 14. aplicar efectos onDamage/onKill;

## 15. aplicar fatiga al atacante;

## 16. iniciar Counter Attempt si procede.

Esto garantiza que unidades eliminadas por una formación rápida no puedan atacar después como si siguieran vivas.

## 247. CONTRAATAQUE

El Contraataque ocurre inmediatamente después de un ataque primario que pueda provocarlo.

Los ataques Ranged normalmente no provocan Counter.

Extra Attack no provoca Counter.

Si el objetivo sobrevive y existe Counter AP:

se crea/resuelve el contraataque inmediatamente antes de continuar con el siguiente evento global.

La documentación indica que un intento de contraataque genera fatiga incluso cuando la unidad queda impedida por determinados factores como parálisis o distancia.

La fatiga normal por intento es -0,15 Efficiency; con Aguante, -0,10.

Los casos exactos en los que existe “attempt” sin capacidad real de golpear deberán conservarse como regla parametrizable.

## 248. STEAL LIFE ES IN-BATTLE

Steal Life no pertenece a la fase de curación final.

La documentación estratégica conserva explícitamente que Steal Life se aplica antes de las bajas finales, mientras Healing se aplica después.

Modelo ARCANUM:

al resolver el Primary Attack elegible:

lifeStolenHP = eligibleDamage × stealLifeRate.

unitsCreated = floor(lifeStolenHP / unitHP).

Las nuevas unidades se añaden inmediatamente a la formación fuente, sujetas a límites económicos/reglas del servidor.

Sólo el Primary Attack genera Steal Life salvo regla específica.

Si una formación gana unidades antes de un evento posterior propio, el comportamiento de si esas unidades participan en dicho evento quedará RULESET_STEAL_LIFE_EVENT_GROWTH hasta validación histórica.

Para Alpha, podrán participar en eventos posteriores aún no resueltos porque ya forman parte de Quantity actual.

## 249. MUERTE DE FORMACIONES Y HP PARCIAL

Durante la batalla se conserva el daño parcial de la última unidad:

accumulatedDamage %= unitHP.

Una formación con Quantity = 0 está aniquilada.

Muchos efectos de recuperación exigen que sobreviva al menos una unidad del stack.

Al terminar el combate, cualquier unidad superviviente parcialmente dañada recupera sus HP completos.

El HP parcial no persiste entre batallas.

## 250. POST_BATTLE: CLASES DE BAJAS

Antes de curar se calcula para cada formación:

initialPermanentUnits;

rawBattleDeaths;

temporaryDeaths;

bloodCursedDeaths;

recoverableDeaths;

unrecoverableDeaths.

Blood Curse/Blood Knife pueden marcar las bajas causadas por determinadas unidades como no recuperables mediante Healing o Resurrection.

La recuperación debe actuar exclusivamente sobre recoverableDeaths.

Los stacks completamente aniquilados quedan excluidos de muchos efectos de Healing/Regeneration, salvo que la regla específica de Resurrection diga lo contrario; la documentación actual de Resurrection también exige supervivencia del stack.

## 251. RESURRECTION PRIMERO

La documentación establece explícitamente:

Resurrection se aplica antes que las demás curaciones.

Procedimiento:

## 1. calcular bajas recuperables;

## 2. calcular unidades resucitadas por Resurrection;

## 3. restarlas de recoverableDeaths;

## 4. pasar únicamente las bajas restantes a Healing/SMC/Regeneration/etc.

Ejemplo documentado:

1.000 Archangels muertos.

30 recuperados por Resurrection.

Quedan 970.

Healing 30% recupera 291.

Total salvado = 321.

Esto obliga a definir RecoveryPriority.RESURRECTION = primera prioridad.

## 252. HEALING, REGENERATION Y OBJETOS DE RECUPERACIÓN

Después de Resurrection se procesan efectos como:

Healing de unidad;

Healing de héroe;

Platinum Hand of Healing / Healing;

Regeneration spell;

Regeneration ability;

Strange Metallic Can;

Pouch of Herbs;

Holy Grail y otros efectos compatibles.

Cuando son porcentajes puros sobre las bajas restantes, se combinan de forma multiplicativa:

remainingLosses *= (1 - recoveryRate).

Ejemplo:

30% + 30% + 25% no equivale a 85%.

Recuperación total =

1 - (0,70 × 0,70 × 0,75)

= 63,25%.

Los efectos con caps, cantidades fijas o fórmulas especiales se resuelven por prioridad específica.

Blood Curse puede anular toda esta familia de recuperación para las bajas afectadas.

## 253. HERO RECOVERY Y HERO DEATH

Las habilidades de héroe que recuperan tropas se insertan en RECOVERY_HEALING salvo que la habilidad especifique otra prioridad.

Un héroe puede morir durante la batalla si el daño que sobrevive a la destrucción de su formación supera sus propios HP.

Selfresurrection de determinados héroes no devuelve al héroe en esa misma batalla: programa un evento futuro de retorno tras el número de turnos correspondiente y con la penalización de nivel documentada.

La muerte del héroe debe registrarse antes de repartir XP final.

## 254. PÉRDIDAS PERMANENTES

Tras todas las recuperaciones:

finalPermanentDeaths =

rawPermanentDeaths

- totalRecovered.

Sólo entonces se calcula la pérdida permanente de ejército para:

Net Power perdido;

estadísticas de batalla;

condición de victoria;

historial.

Las tropas temporales deben excluirse del denominador y del mínimo de ejército permanente destruido.

La documentación de victoria habla explícitamente del ejército permanente del defensor.

## 255. COMBAT ADVANTAGE

Cuando uno de los ejércitos participantes supera aproximadamente el doble del poder militar del otro puede activarse Power Ratio Bonus/Combat Advantage.

Este modificador no altera el daño de los ataques.

Altera la comparación final de pérdidas para decidir quién ganó.

Debe calcularse a partir del Poder Neto de los ejércitos realmente involucrados, no del Poder Neto total de los reinos.

La fórmula documentada moderna se mantendrá como COMBAT_ADVANTAGE_TR.

CLASSIC_MARI queda pendiente de confirmar.

## 256. CONDICIÓN FINAL DE VICTORIA

Para ARCANUM_CLASSIC provisional:

Regular:

defenderPermanentLossPercent >= 5%.

Siege:

defenderPermanentLossPercent >= 10%.

Además:

adjustedDefenderLossComparison > adjustedAttackerLossComparison;

attackerSurvivingUnits >= 1.

TR moderno podrá usar 10%/10%.

La comparación utiliza bajas permanentes finales tras los sistemas de recuperación.

Estado: esta última relación con recovery se adopta como decisión de motor coherente con “permanent army loss”; deberá validarse con battle reports históricos durante el test suite.

## 257. RESOLUCIÓN TERRITORIAL

Si el atacante gana:

## 1. calcular landLossPotential según Regular/Siege;

## 2. limitar por número de supervivientes/ocupación;

## 3. comprobar rango de NP para tierra conquistable según ruleset;

## 4. determinar tierra transferida;

## 5. determinar tierra destruida;

## 6. resolver edificios incluidos;

## 7. en Siege, resolver Fortalezas capturadas/destruidas;

## 8. en Pillage, utilizar su pipeline económico específico.

Tras modificar Fortalezas:

si targetFortresses <= 0:

emit MAGE_KILLED.

La muerte del mago se evalúa inmediatamente.

## 258. EFECTOS MUNDIALES POST-BATTLE

Después de resolver el resultado territorial pueden dispararse:

creación de counters;

Damage Protection;

Pillage Protection;

transferencia de epidemias;

dispel de encantamientos por interacción de guerra;

gains de Battle Chant;

robo de recursos/objetos en Pillage;

Touch of Necromancy u otros efectos que dependan de bajas enemigas;

actualización de guild logs;

mensajes y Chronicle.

Estos efectos deben ejecutarse como eventos separados para evitar que el Battle Engine tenga conocimiento directo de todos los sistemas sociales y mundiales.

## 259. EXPERIENCIA

Después de saber qué héroes sobrevivieron y qué batalla ocurrió:

conceder XP por turno/participación según ruleset;

conceder bonus de liderazgo en batalla cuando corresponda;

resolver level-up;

recalcular habilidades desbloqueadas para futuras batallas.

Una habilidad desbloqueada al subir de nivel después de un combate no debe retroactivamente afectar ese combate.

## 260. INFORME DE BATALLA DETERMINISTA

El Battle Report debe reconstruirse a partir del Event Log, no generarse como texto mientras se calcula.

Cada BattleEvent guardará:

sequence;

phase;

initiative;

actorStackId;

targetStackId;

eventType;

quantityBefore;

effectiveAP;

efficiency;

accuracy;

rand;

resistances;

multipliers;

damage;

kills;

quantityAfter;

fatigueDelta;

recovery;

notes.

Esto permite:

auditar errores;

reproducir batallas;

comparar rulesets;

mostrar modo simple o matemático;

crear replays futuros.

## 261. PIPELINE FINAL DE COMBATE

PRE_BATTLE:

validate

→ costs

→ snapshots

→ base stacks

→ natural stack order

→ reinforcements/temp

→ heroes

→ persistent effects

→ battle spell/item

→ precombat damage/control

→ effective stats

→ pairing

→ event queue.

BATTLE:

initiative

→ attack event

→ damage/deaths

→ Steal Life/on-hit

→ fatigue

→ immediate counter

→ next event

hasta agotar cola.

POST_BATTLE:

raw casualties

→ anti-heal eligibility

→ Resurrection

→ Healing/Regeneration/items

→ restore partial HP

→ permanent casualties

→ combat advantage

→ victory

→ land/forts/pillage

→ mage death

→ protections/counters/world effects

→ hero XP

→ Battle Report.

## 262. ESTADO DEL ORDEN DE COMBATE

CERRADO PARA ALPHA:

separación PRE/BATTLE/POST;

stack base y refuerzos;

efectos persistentes antes de ataques;

battle spells/items antes de ataques ordinarios;

pairing antes de event queue;

initiative como orden de eventos;

contraataque inmediato;

Steal Life durante batalla;

Resurrection antes de otras curaciones;

Healing/Regeneration al final;

HP parcial restaurado al acabar;

bajas permanentes después de recovery;

resultado territorial después de victoria;

XP al final.

PENDIENTE HISTÓRICO:

orden exacto atacante/defensor entre spell e item;

tie-break exacto de iniciativa;

algunos triggers de héroe;

si unidades creadas por Steal Life participan en eventos posteriores del mismo round;

relación exacta recovery/victory en MARI;

orden exacto de algunas recuperaciones no porcentuales.

Con esto el Battle Engine ya tiene un pipeline programable completo.

## 263. TEST SUITE COMO CONTRATO DEL MOTOR

ARCANUM deja de depender de validación subjetiva. Las reglas principales tendrán casos de prueba con entrada conocida y salida esperada.

Una implementación no se considera correcta porque “se parece” a Archmage: debe producir los resultados definidos por el Ruleset y conservar un Event Log reproducible.

Se ha creado el documento de proyecto “01 - Test Suite de ARCANUM Core Rules” como especificación de validación separada de esta Biblia.

## 264. CLASIFICACIÓN DE TESTS

CORE:

reglas suficientemente cerradas para bloquear una release si fallan.

PROVISIONAL:

decisiones actuales de ARCANUM_CLASSIC para zonas históricamente incompletas.

RULESET:

resultados deliberadamente diferentes entre MARI_CANDIDATE, ARCH, TR_MODERN y ARCANUM_CLASSIC.

Esta clasificación permite avanzar sin disfrazar incertidumbre histórica de certeza.

## 265. DETERMINISMO

Todo cálculo autoritativo debe poder reproducirse con:

estado inicial;

Ruleset exacto;

acciones;

seed aleatoria o secuencia de valores Rand.

No se utilizará la hora real, orden de ejecución no determinista ni float binario como fundamento de decisiones económicas o militares.

Los porcentajes y recursos deberán utilizar enteros escalados, Decimal o fixed-point según implementación.

## 266. TESTS DE COMBATE UNITARIOS

La primera batería cubre:

daño;

resistencias multitipo;

Weakness y Scales;

fatiga;

Aguante;

Iniciativa;

Counter;

Flying/Ranged;

stacking;

natural vs effective abilities;

Fort Bonus;

Barreras;

Kingdom Resistance;

Steal Life;

Resurrection;

Healing;

Blood Curse;

HP parcial;

héroes;

victoria;

ocupación y Siege.

Cada test intenta aislar una sola regla antes de probar combinaciones.

## 267. TESTS DE ECONOMÍA

Los casos económicos cubren:

producción de Maná;

capacidad de Nodos;

crecimiento de Población;

fórmula legacy de Oro;

mantenimiento progresivo de Fortalezas;

economía negativa con reservas.

Los tests de integración exigirán ResourceLedger completo para impedir que una implementación correcta “por casualidad” oculte un orden de operaciones incorrecto.

## 268. TESTS DE DEFENSA TERRITORIAL

Se validan expresamente:

Fort Bonus mínimo/intermedio/máximo;

Barrera + Kingdom Resistance como tiradas independientes;

diferencia entre objeto y hechizo;

captura inicial de Fortaleza en Siege;

muerte inmediata a 0 Fortalezas.

Las curvas provisionales deberán estar identificadas por nombre de Ruleset.

## 269. BATERÍAS DE INTEGRACIÓN

I01 — Turno económico completo.

I02 — Regular completo.

I03 — Siege completo.

I04 — Magia hostil.

I05 — Nigromancia y recuperación.

Un test de integración no sólo comprobará el estado final: deberá verificar el orden de eventos intermedios mediante ResourceLedger o BattleEventLog.

## 270. REGLAS PROVISIONALES NO BLOQUEAN LA ARQUEOLOGÍA

Cuando aparezca evidencia histórica superior:

## 1. actualizar Biblia;

## 2. crear o modificar RulesetVersion;

## 3. actualizar test PROVISIONAL;

## 4. conservar el ruleset anterior cuando sea históricamente útil;

## 5. volver a ejecutar toda la suite.

Nunca se corregirá silenciosamente una fórmula sin dejar rastro de la versión anterior.

## 271. CRITERIO DE RELEASE CANDIDATE

ARCANUM Core Rules v1.0 RC exigirá:

todos los tests CORE unitarios en verde;

I01–I05 reproducibles;

una sola regla activa por comportamiento dentro de cada Ruleset;

todas las incertidumbres clasificadas;

BattleEventLog reproducible;

ResourceLedger reproducible;

ningún sistema principal sin test de integración.

## 272. CRITERIO DE CORE RULES v1.0 FINAL

Después del Release Candidate:

ejecutar simulaciones masivas;

comparar resultados con battle reports históricos disponibles;

corregir desviaciones;

probar una mini-Era automatizada;

auditar exploits económicos y de pairing;

congelar hashes/versiones de reglas.

Sólo entonces se etiquetará ARCANUM_CORE_1_0 como estable.

## 273. PUNTO ACTUAL DEL PROYECTO

La fase de arqueología estructural del núcleo está prácticamente terminada.

Ya existen:

Biblia mecánica;

Ruleset strategy;

Economy pipeline;

Battle pipeline;

defensa territorial;

sistemas sociales;

Armagedón;

Test Suite.

La siguiente fase recomendada es construir los dos primeros simuladores sin interfaz final:

Economy Simulator.

Battle Simulator.

Ambos deberán ejecutar directamente los casos del Test Suite.

Una vez verdes, podremos construir el Realm Simulator y simular una Era completa.

## 274. INICIO DE IMPLEMENTACIÓN DEL BATTLE ENGINE

La especificación ya se está ejecutando como código TypeScript determinista.

Battle Simulator v0.4 implementa las reglas centrales mediante funciones puras y fixed-point, con 43 tests verdes y 0 fallos.

## 275. ESTADO DEL BATTLE ENGINE v0.4

Implementado:

daño y resistencias;

Weakness/Scales;

fatiga;

Iniciativa;

Primary/Extra/Counter;

Flying/Ranged;

stacking natural;

Pairing clásico provisional;

Fort Bonus;

Barrier/Kingdom Resistance;

Steal Life;

Resurrection;

Healing/Regeneration;

Blood Curse;

bajas permanentes;

victoria;

Siege Accuracy;

ocupación territorial;

Fortalezas;

MAGE_KILLED.

## 276. PAIRING IMPLEMENTADO COMO RULESET PROVISIONAL

ARCANUM_CLASSIC_PAIRING_0_1 implementa la familia PRE-2010 documentada:

Melee terrestre busca ground no emparejado;

Flying/Ranged prioriza Flying no emparejado y después ground;

sobrantes vuelven provisionalmente al top reachable.

La fórmula exacta de fake-stack overattack y algunos tie-breaks siguen separados como incertidumbre histórica y no quedan falsamente etiquetados como MARI.

## 277. VALIDACIÓN ACTUAL

El paquete ejecuta 43 tests.

Resultado:

43 PASS.

0 FAIL.

Los tests destruyen y recompilan dist en cada ejecución para evitar falsos positivos por artefactos antiguos.

Rand no depende de Math.random(): puede inyectarse de forma explícita para obtener BattleEventLog reproducible.

## 278. SIGUIENTE HITO TÉCNICO

Battle Simulator v0.5 deberá orquestar en una sola operación:

PRE_BATTLE;

BATTLE;

POST_BATTLE;

victoria;

territorio;

Fortalezas;

muerte;

BattleEventLog final.

Cuando I02 Regular e I03 Siege pasen end-to-end, Economy Simulator y Battle Simulator podrán integrarse en el primer Realm Simulator.

## 279. BATTLE SIMULATOR v0.5 END-TO-END

Se ha implementado una operación completa simulateBattleEndToEnd().

Entrada:

atacante;

defensor;

Attack Mode;

stacks;

recovery;

flags de Siege.

Salida:

Battle Core;

recovery por stack;

victoria;

resolución territorial;

Land final;

Fortalezas finales;

estado MAGE_KILLED.

## 280. I02 REGULAR END-TO-END

El test de integración Regular ya atraviesa:

Fort Bonus;

pairing;

Event Queue;

daño;

Counter cuando corresponda;

recovery;

bajas permanentes;

threshold de victoria;

ocupación;

transferencia/destrucción de tierra.

Estado: PASS.

## 281. I03 SIEGE END-TO-END

El test de integración Siege ya atraviesa:

Fort Bonus doble;

Siege Accuracy;

combate;

recovery;

threshold 10%;

ocupación 5×Land;

captura inicial de Fortaleza;

destrucción adicional;

MAGE_KILLED.

Estado: PASS.

## 282. EVENT LOG AMPLIADO

Cada ataque registra ahora:

Accuracy efectiva usada;

Rand usado;

resistencia media;

Damage;

Kills;

Quantity before/after;

Efficiency before/after;

unidades creadas por Steal Life.

Esto permite demostrar, por ejemplo, que una unidad terrestre ordinaria en Siege recibe la Accuracy reducida dentro del engine y no sólo en una función auxiliar.

## 283. ESTADO DE IMPLEMENTACIÓN

Economy Simulator v0.2:

13 PASS / 0 FAIL.

Battle Simulator v0.5:

48 PASS / 0 FAIL.

Ya existen los dos motores fundamentales en forma ejecutable y determinista.

El próximo gran salto deja de ser “hacer fórmulas” y pasa a ser integrar ambos dentro de un Realm Simulator con estado persistente por mago y secuencia de turnos/acciones.

## 284. REALM SIMULATOR v0.1

Economy Simulator v0.2 y Battle Simulator v0.5 ya están integrados en un estado persistente por mago.

Persisten:

Turnos;

Oro;

Maná;

Población;

Tierra;

Fortalezas;

ejército;

estado Dead;

Event Log.

Las bajas cambian automáticamente el upkeep del turno económico siguiente.

## 285. RESOLUCIÓN CONSERVADORA DE TIERRA

La selección exacta de edificios destruidos al perder territorio todavía no está cerrada históricamente.

Realm Simulator no inventa una prioridad.

Primero consume Wilderness.

Si la pérdida supera Wilderness:

se registra UNRESOLVED_TERRITORY_DAMAGE;

el reino conserva una deuda estructural explícita;

los turnos económicos quedan bloqueados hasta resolver la estructura.

Esta decisión evita convertir una incertidumbre histórica en comportamiento oculto.

## 286. REALM EVENT LOG

Eventos actuales:

ECONOMY_TURN;

BATTLE_RESOLVED;

LAND_CHANGED;

FORTRESSES_CHANGED;

MAGE_KILLED;

UNRESOLVED_TERRITORY_DAMAGE.

Todos poseen sequence monotónica.

La capa Realm se convierte así en el lugar donde Economy y Battle producen consecuencias persistentes.

## 287. REALM SIMULATOR v0.2: TRANSACCIONES

Los comandos de Realm se ejecutan sobre una copia de trabajo.

Sólo si:

la acción termina;

los motores inferiores no fallan;

y todos los invariantes siguen siendo válidos

se confirma el nuevo estado.

Una acción inválida no puede dejar un reino parcialmente modificado.

## 288. INVARIANTES DE MUNDO

Se validan como mínimo:

Turns >= 0.

Land >= 0.

Gold >= 0.

Mana >= 0.

Population >= 0.

Fortresses >= 0.

Stack Quantity >= 0.

IDs de stack únicos globalmente.

secuencia de eventos estrictamente creciente.

Dead implica 0 Fortalezas en el ruleset actual.

Las futuras mecánicas de resurrección deberán declarar una transición de estado explícita en vez de violar este invariante.

## 289. COMMAND LOG Y REPLAY

Realm Simulator v0.2 conserva comandos confirmados.

Un mundo puede reconstruirse mediante:

initialState + ruleset + commandLog.

El replay debe producir exactamente el mismo estado serializado.

Esto permite:

debugging;

auditoría;

replays;

rollback administrativo;

migraciones de ruleset;

comparación histórica de simulaciones.

## 290. STRESS TEST

Se han ejecutado 1.000 acciones económicas consecutivas mediante la capa transaccional.

Resultado:

1.000 comandos confirmados;

1.000 eventos Realm;

0 fallos;

0 invariantes rotos.

La suite global asciende a:

77 tests ejecutados;

77 PASS;

0 FAIL.

## 291. LECTURA DE LOS RESULTADOS

El dato más relevante no es únicamente el número de tests verdes.

Economy, Battle y Realm han podido integrarse sin reescribir las arquitecturas inferiores.

Los fallos encontrados durante implementación han sido:

orden de operaciones;

integración parcial;

runner de tests obsoleto;

tipado del Event Log;

fixture mal parametrizado.

Hasta ahora no ha aparecido una contradicción estructural que obligue a rehacer el modelo de juego.

Esto aumenta la confianza de que la Biblia es suficientemente coherente para sostener implementación real, aunque todavía no valida fidelidad histórica absoluta.

## 292. SIGUIENTE BLOQUE DEL REALM ENGINE

Para una mini-Era verdaderamente jugable faltan persistir y ejecutar como comandos:

Explore;

Build;

Research;

Spell State;

protecciones y Counters;

Net Power derivado;

selección definitiva de edificios afectados por conquista.

No se implementará una fórmula dudosa sólo para completar una pantalla.

Cada nuevo comando deberá entrar con su test y RulesetVersion correspondiente.

293. EXPLORE COMO MODELO PROVISIONAL VERSIONADO

La evidencia histórica disponible confirma que Explore produce alrededor de 18–26 acres por turno cerca de 200 acres, empeora conforme crece el reino y puede llegar a 0 alrededor de 3.500 acres según servidor.

No se ha recuperado todavía una fórmula MARI completa.

ARCANUM implementa:

EXPLORE_MODEL = LINEAR_18_26_TO_ZERO_PROVISIONAL.

La aleatoriedad se inyecta mediante rollPermille para reproducibilidad.

El modelo puede sustituirse por RulesetVersion sin cambiar el Realm Engine.

294. BUILD CAPACITY CLASSIC

La construcción se modela como capacidad de obra compartida por turno.

Con W Talleres existentes al iniciar el lote:

BuildCapacity = W + 1.

Costes de capacidad:

Farm = 5.

Barracks = 5.

Workshop = 10.

Guild = 20.

Town = 30.

Node = 30.

Fortress = 300.

Los nuevos Workshops de un lote no aumentan la capacidad disponible para ese mismo lote.

Esta estructura reproduce los ratios históricos ya documentados.

295. BARRERAS Y BUILD

Las Barreras siguen una vía especial.

El ruleset actual permite una Barrera por turno y no permite mezclar esa Barrera con otro lote de construcción en el mismo comando.

Esta separación mantiene la regla histórica de que Workshops no aceleran Barriers.

El coste exacto de construcción/mantenimiento continúa versionado de forma independiente.

296. NET POWER LEGACY EJECUTABLE

Realm Simulator calcula ya un desglose de Net Power desde el estado persistente.

El modelo ARCANUM_CLASSIC actual usa provisionalmente:

1.000 NP por acre.

19.360 por Fortress.

3.960 por Barrier.

Mana / 20.

Population / 50.

Gold / 5.000.

1.000 por Spell Level.

1.000 por Lesser Item.

95.000 por Unique Item.

0 por Ally.

100.000 por Battle Hero.

100.000 por Non-Battle Hero.

Army NP = suma Quantity × Power Rank.

Cada componente se devuelve por separado para auditoría.

297. REALM SIMULATOR v0.3

Explore, Build y Net Power han sido incorporados al Realm Engine.

Las acciones son transaccionales, generan eventos y conservan replay determinista.

Estado de la suite tras v0.3:

85 tests.

85 PASS.

0 FAIL.

298. RESEARCH: CALIBRACIÓN HISTÓRICA

Una prueba histórica conservada con un mago Verdante, 600 acres y 150 Guilds registra tiempos de investigación para cinco colores antes y después de obtener Sage Researching nivel 5.

Esos resultados pueden reproducirse con un modelo donde:

ResearchPoints = floor(sqrt(Guilds) × 3,5).

Con 150 Guilds:

ResearchPoints = 42 por turno.

Este coeficiente entra como TR_2008_CALIBRATED_PROVISIONAL.

No se etiqueta como constante MARI canónica.

299. MULTIPLICADORES DE COSTE POR RELACIÓN DE COLOR

Ajustando el mismo conjunto histórico se obtienen multiplicadores que reproducen los cinco tiempos observados:

OWN = 1,000.

ADJACENT = 0,568.

OPPOSITE = 0,398.

Estos valores son constantes de calibración inferidas.

No deben confundirse con una tabla publicada del código original.

Su ventaja técnica es que producen exactamente los resultados conocidos dentro de un ruleset reemplazable.

300. SAGE RESEARCHING

La habilidad Researching de Sage reduce el coste de investigación.

Modelo documentado:

Reduction = 6% + 3% × SkillLevel.

Nivel 5:

Reduction = 21%.

Aplicado al modelo calibrado reproduce los cinco tiempos de la prueba histórica:

Sword of Light 107 turnos.

Nature's Lore 565.

Disintegrate 187.

Summon Wraith 66.

Phase Step 79.

301. CONCENTRATION Y RESEARCH

Concentration reduce el coste/tiempo de Research en:

0,05% × Spell Level de Concentration.

Ejemplos reproducidos:

Cost 30.000 con SL 264 → 26.040.

Cost 30.000 con SL total 1.041 → 14.385.

El ruleset impone un límite para impedir costes negativos o degenerados.

La interacción simultánea exacta entre Sage y Concentration se conserva como comportamiento versionable.

302. SPELL STATE PERSISTENTE

Cada mago puede conservar:

knownSpellIds[];

currentResearch.

CurrentResearch guarda:

Spell Definition.

Alignment.

Aligned Cost.

Effective Cost.

Remaining Cost.

Sage Skill Level al iniciar.

Concentration Spell Level al iniciar.

Esto permite pausar Research, gastar otros turnos y continuar después sin perder progreso.

303. ELIGIBILIDAD DE RESEARCH

Regla implementada:

propio → Simple, Medium, Complex y Ultimate.

adyacente → Simple, Medium y Complex.

opuesto → Simple y Medium.

Phantasm → excepción que permite Complex off-color.

Ancient → no se obtiene por Research normal.

La validación ocurre antes de mutar el mundo y una investigación ilegal revierte la transacción.

304. SPILLOVER DE INVESTIGACIÓN

Los puntos de Research sobrantes al completar un hechizo pueden aplicarse al siguiente objetivo dentro del mismo turno.

Por tanto el motor no desperdicia automáticamente el excedente cuando un hechizo termina por debajo de la producción del turno.

Cada finalización:

añade el spell a knownSpellIds;

aumenta Spell Level según rango;

emite SPELL_RESEARCHED.

305. REALM SIMULATOR v0.4 Y SIGUIENTE HORIZONTE

Realm Simulator v0.4 ejecuta:

Economy;

Battle;

Explore;

Build;

Net Power;

Research;

Spell State.

Suite:

94 tests.

94 PASS.

0 FAIL.

La siguiente capa necesaria antes de simular una mini-Era completa es:

protecciones y Counters a nivel Realm;

Spell Casting persistente;

recalcular Net Power de forma automática tras cada comando relevante;

resolver o parametrizar selección de edificios destruidos por conquista.

## 293. REALM SIMULATOR v0.3: EXPLORE, BUILD Y NET POWER

La capa Realm incorpora crecimiento territorial y construcción persistente.

Explore usa una curva provisional explícita:

18–26 acres/turno alrededor de 200 acres y descenso lineal hacia 0 cerca de 3.500 acres.

Build usa capacidad basada en Workshops existentes al inicio del lote.

Los Workshops construidos dentro del lote no mejoran ese mismo lote.

Net Power se deriva del estado persistente mediante la fórmula legacy provisional.

## 294. REALM SIMULATOR v0.4: RESEARCH Y SPELL STATE

La investigación ya es persistente por mago.

El motor conserva:

escuela mágica;

hechizos conocidos;

objetivo actual;

coste restante;

Spell Level.

Se implementan relaciones OWN / ADJACENT / OPPOSITE y límites de rango investigable.

## 295. CALIBRACIÓN DE RESEARCH

Con 150 Guilds el motor produce 42 puntos de investigación por turno.

El ruleset provisional reproduce la prueba TR 2008 conocida con y sin Sage Researching.

Sage y Concentration están versionados y no se etiquetan como constantes originales MARI.

El spillover permite que puntos sobrantes pasen al siguiente hechizo dentro del mismo turno.

## 296. REALM SIMULATOR v0.5: PROTECCIONES

Se validan en código:

Apprentice Protection hasta 120 turnos de vida;

Damage Protection al 30% acumulado dentro de ventana de 24h;

expiración de daños;

Council Protection;

Meditation;

bloqueo por ofensiva reciente;

expiración temporal.

Todas las decisiones están centralizadas en RealmRuleset.protection.

## 297. COUNTERS PERSISTENTES

Un ataque ordinario abre Counter al defensor.

El Counter:

tiene ventana temporal;

puede atravesar Damage Protection;

registra presupuesto de daño restante;

produce eventos COUNTER_OPENED y COUNTER_USED;

expira mediante el reloj determinista del Realm.

El comportamiento exacto de presupuestos múltiples podrá seguir refinándose por ruleset.

## 298. REALM SIMULATOR v0.6: SCENARIO RUNNER

Se añade runRealmScenario().

Una simulación de escenario:

parte de estado inicial;

ejecuta RealmCommand reales;

valida invariantes después de cada comando;

genera checkpoints;

calcula Net Power;

reproduce toda la secuencia desde cero;

compara el estado final serializado.

Un mismatch de replay convierte el escenario en fallo.

## 299. PRIMERA MINI-ERA CONTROLADA

R045 ejecuta 269 comandos con dos magos.

Incluye:

Explore;

Build;

Research;

economía;

Regular;

Counter;

avance temporal;

continuación económica.

Resultado:

hechizos persistentes;

0 deuda territorial;

ambos motores integrados;

replay idéntico;

invariantes válidos.

## 300. ESTADO DE LA SUITE

Economy, Battle y Realm alcanzan conjuntamente:

107 tests ejecutados;

107 PASS;

0 FAIL.

El dato relevante es que ya se prueban secuencias largas de acciones heterogéneas, no sólo fórmulas aisladas.

## 301. SIGUIENTE EXPERIMENTO: MINI-ERA AUTÓNOMA

El próximo paso es sustituir el guion por políticas deterministas simples.

Cada agente deberá decidir entre:

Explore;

Build;

Research;

Tax / MP Charge;

Attack;

esperar/protegerse.

El objetivo no será crear una IA competitiva, sino detectar:

bucles económicos degenerados;

estrategias dominantes accidentales;

colapsos inevitables;

exploit de protección/counters;

crecimiento de Net Power anómalo;

guerras que nunca terminan o terminan demasiado rápido.

Esta será la primera prueba de ARCANUM como ecosistema dinámico

ACTUALIZACIÓN DE IMPLEMENTACIÓN — BETA 0.2.65

Estado auditado: 30/09/2026

Esta sección registra la diferencia entre la especificación histórica y el producto actualmente implementado en el repositorio principal.

ESTADO DE ENTREGA

La rama main contiene 26 commits posteriores al commit que sigue sirviendo actualmente la web pública en Render. El repositorio ya alcanza la beta 0.2.65, mientras que la producción pública continúa en el commit 01aeace9f5ac7698a377105f8667abab786d6063. Hasta que se despliegue la versión nueva, no debe confundirse “implementado en código” con “disponible en producción”.

SISTEMAS IMPLEMENTADOS RECIENTEMENTE

Arena Arcana: PvP individual automático separado del ejército. Cada Archimago dispone de atributos personales, arma, rasgo y habilidades. Existen duelos clasificatorios con Sellos diarios, rating y divisiones, además de amistosos ilimitados.

Identidad de combate del Archimago: ocho atributos base (Vida, Fuerza, Agilidad, Velocidad, Resistencia, Precisión, Voluntad y Fortuna), armas, rasgos y habilidades generados de forma persistente a partir de la identidad del personaje y su Escuela.

Evolución del Archimago: progresión por nivel con elecciones binarias de mejoras que pueden añadir atributos, habilidades, armas o rasgos y que alteran la construcción del personaje de Arena.

Economía visible: Alimentos e Investigación pasan a mostrarse tanto en la barra global de recursos como en las tarjetas de Economía.

Comunidad: buscador de Archimagos, jugadores conectados, chat global, sala por Escuela, tablón, perfiles, solicitudes de amistad, mensajería privada y bandeja superior.

Taberna: mapa 2D jugable con movimiento, colisiones, sprites por Escuela y punto social para representar físicamente la reunión de jugadores.

Personaje: ficha ampliada, imagen de perfil, biografía, inventario y generación procedural controlada de objetos.

Artefactos: biblioteca/sistema de artefactos incorporado al cliente y conectado a la navegación.

Mercado: contratos/ofertas entre jugadores incorporados al juego.

Eventos: primer evento PvE con Boss y panel específico.

Crónica: apartado de lore profundo integrado en la navegación.

Audio y presentación: música, efectos, mezclador de volumen, cursor de estilo MMORPG, mejoras de pantalla completa móvil, nuevos iconos y recursos gráficos.

Informes de batalla: relato narrativo del combate añadido al informe numérico.

RIESGOS DE ARQUITECTURA DETECTADOS

La Arena y la identidad de combate guardan actualmente datos críticos en localStorage. Rating, Sellos, victorias, derrotas, historial, atributos, arma, rasgos, habilidades y elecciones de evolución no son todavía autoridad de servidor. Esto permite manipulación manual, divergencias entre dispositivos y pérdida o alteración de progreso.

Los combates de Arena se simulan en cliente usando Math.random(). El cliente decide el resultado, por lo que no existe todavía garantía competitiva ni reproducción autoritativa del combate.

El reinicio diario de Sellos usa la fecha local del dispositivo. Cambiar reloj o zona horaria puede alterar el límite diario.

El perfil de un rival se reconstruye localmente. Las elecciones de evolución efectuadas por ese rival en otro dispositivo no forman parte de una fuente compartida, de modo que dos jugadores pueden combatir contra versiones distintas del mismo Archimago.

El rating de Arena tampoco es todavía un ranking global persistente; es un estado local del navegador.

El despliegue está desacoplado de main: la web pública puede quedarse varias versiones por detrás del repositorio.

El build de Render se limita esencialmente a publicar estáticos y no ejecuta una batería de tests automática antes de poner una versión en producción.

Los logs de la última compilación de producción informan de 2 vulnerabilidades de severidad alta en dependencias; deben auditarse antes de ampliar la beta.

DECISIÓN DE CONSISTENCIA

A partir de esta beta deben distinguirse tres capas de estado: estado canónico de servidor, estado derivado/recalculable y estado puramente visual/local. Recursos, inventario, artefactos poseídos, elecciones de evolución, Arena, rating y cualquier resultado competitivo deben migrar a autoridad de servidor. localStorage debe reservarse para preferencias de interfaz, audio, tutoriales y cachés no críticas.

CRITERIO DE PRODUCTO

ARCANUM ya no es únicamente un clon estratégico inspirado en Archmage. Ha empezado a convertirse en dos juegos entrelazados: reino persistente y Archimago-personaje. Ambos bucles deben alimentarse mutuamente. El reino debe generar oportunidades y recursos para el personaje; el personaje debe aportar decisiones y ventajas al reino sin sustituir al ejército. Arena, PvE, artefactos e inventario deben usar una misma ficha de personaje y una misma economía de recompensas para evitar sistemas paralelos inconexos.

.

CONSOLIDACIÓN 0.3.2 — ECONOMÍA DEFINITIVA

Esta versión fija una taxonomía económica única para evitar que reservas, capacidades, flujos e indicadores vuelvan a presentarse como si fueran el mismo tipo de recurso.

TURNOS

Los Turnos son presupuesto de acciones. Se regeneran con el tiempo, actualmente a razón de 1 turno cada 5 minutos, y se consumen al procesar economía, explorar, construir, investigar, reclutar y combatir según la acción. No son producidos por edificios.

ORO

El Oro es una reserva líquida. Se utiliza en reclutamiento, mercado y costes económicos o militares definidos por las reglas Core. La acción Recaudar impuestos prioriza Oro.

MANÁ

El Maná es una reserva arcana con capacidad máxima. Los Nodos están ligados a su capacidad y economía. Se utiliza en invocaciones, unidades mágicas, mercado y otros costes arcanos. Cargar maná prioriza esta reserva.

POBLACIÓN

La Población es una reserva de habitantes disponibles. Su límite máximo es siempre el menor entre la capacidad alimentaria y la capacidad residencial:

capacidad_población = min(alimento, residencial).

La población puede ser gastada por reclutamiento y otras acciones Core.

ALIMENTO

El Alimento queda definido en el ruleset actual como CAPACIDAD DE SUSTENTO, no como un almacén que disminuye por segundo. Las Granjas elevan esta capacidad. El dato relevante es el margen entre capacidad alimentaria y población. Cuando el margen llega a cero, el Alimento se convierte en el cuello de botella de crecimiento. No existe todavía una mecánica canónica de hambre o consumo periódico de alimento.

INVESTIGACIÓN

La Investigación queda definida como FLUJO, no como reserva pasiva. Los Gremios determinan los RP producidos por cada turno que el jugador dedica expresamente a investigar. Fórmula visible actual:

RP por turno de investigación = floor(sqrt(Gremios) × 3,5).

Los RP se aplican directamente al hechizo en curso y no se acumulan mientras el jugador está inactivo.

TIERRAS

Las Tierras representan espacio físico. La Tierra salvaje no produce por sí misma; la construcción la transforma en infraestructura. Tierra desarrollada = Tierra total − Tierra salvaje. La Exploración transforma Turnos en nueva Tierra salvaje y su rendimiento disminuye al aproximarse a 3.500 acres. La Guerra puede transferir territorio según sus reglas.

ASCENDENCIA

La Ascendencia es un indicador derivado de fuerza global. No es un recurso almacenado ni puede gastarse. El cliente no puede usar Ascendencia como fórmula sustituta para inventar producción de Oro, Maná o Población.

IDENTIDAD ECONÓMICA DE EDIFICIOS

Granjas: capacidad de sustento.

Pueblos: capacidad residencial y apoyo a la economía de Oro.

Nodos: capacidad y economía de Maná.

Talleres: reducción del coste efectivo en Turnos de futuras construcciones.

Gremios: generación de RP al investigar.

Cuarteles: desbloqueo de reclutamiento.

Fortalezas: supervivencia y defensa estratégica.

Barreras: defensa arcana especializada.

REGLA DE PRESENTACIÓN PASIVA

La interfaz sólo puede interpolar recursos entre refrescos si el servidor proporciona explícitamente una producción por turno o si el cliente ha observado un delta real tras completar un turno con la misma configuración de edificios. Si no conoce la producción, la interpolación correcta es cero. Se elimina la antigua estimación basada en Poder/Ascendencia.

CADENA ECONÓMICA DE REFERENCIA

Turnos → Economía / Exploración / Investigación / Reclutamiento / Guerra.

Exploración → Tierra salvaje → Construcción → Capacidad / Producción / Desbloqueos.

Capacidad + Reservas → Magia / Ejército / Mercado / Expansión.

No se debe añadir ningún recurso nuevo sin definir de forma explícita su fuente, su sumidero y la consecuencia de su escasez.

CONSOLIDACIÓN 0.3.3 — IDENTIDAD CANÓNICA DEL ARCHIMAGO

PRINCIPIO

El jugador ES el Archimago. El reino es su dominio y extensión estratégica, no un segundo protagonista separado.

A partir de esta versión, la ficha del jugador y Arena consumen un modelo agregado de servidor denominado Archmage Snapshot. Este modelo no crea una nueva autoridad: reúne en una sola lectura los sistemas canónicos ya existentes para impedir que el cliente reconstruya varias versiones distintas del mismo personaje.

ARCHMAGE SNAPSHOT

La lectura canónica reúne:

perfil público y reino;

nivel, experiencia y aptitudes personales;

características persistentes de duelo;

arma de duelo, rasgos, habilidades y elecciones de evolución;

inventario verificado y equipo activo;

rating y récord de Arena;

reliquias activas;

trayectoria y crónica reciente;

metadatos que indican qué backend es autoridad de cada bloque.

APTITUDES DEL ARCHIMAGO

Poder Arcano, Conocimiento, Voluntad e Influencia forman la capa de desarrollo personal del Archimago en el mundo. Proceden de la progresión de nivel y experiencia.

CARACTERÍSTICAS DE DUELO

Vida, Fuerza, Agilidad, Velocidad, Resistencia, Precisión, Voluntad y Fortuna describen cómo combate personalmente ese mismo Archimago. No deben presentarse como un segundo sistema rival de “atributos”, sino como características específicas de combate.

EQUIPO PÚBLICO Y PRIVACIDAD

El propietario puede ver su inventario completo desde la ficha. La ficha pública de otro jugador sólo expone los objetos actualmente equipados y los datos necesarios para representarlos; no revela el contenido de su mochila.

RELIQUIAS

Las reliquias con nombre pasan a formar parte visible de la identidad del Archimago y de su trayectoria. Continúan siendo mecánicamente distintas del inventario procedural hasta completar el Punto 4.

ARMA DE DUELO Y ARMA DE EQUIPO

Existen todavía dos conceptos heredados que deben mantenerse claramente separados hasta el Punto 4:

Arma de Duelo: arma innata/evolutiva del perfil de combate inspirado en El Bruto.

Arma de equipo: objeto físico procedural colocado en el slot de arma del inventario.

La interfaz no debe llamar a ambas “arma equipada”.

CRÓNICA PERSONAL

La ficha reúne acontecimientos recientes procedentes de Arena, historia de reliquias y, para el propietario, informes estratégicos de guerra. La crónica es una vista derivada de acontecimientos canónicos y no un estado mutable independiente.

CONSUMIDORES

Perfil del jugador usa Archmage Snapshot como lectura principal.

Arena usa el mismo snapshot para identidad, nivel, combate y equipo verificado.

Los enlaces sociales a un jugador abren esta misma ficha canónica.

LÍMITE DEL PUNTO 3

Este punto unifica a la PERSONA, pero deliberadamente no fusiona todavía todos los OBJETOS. El Punto 4 deberá decidir una taxonomía única de objetos, slots, reliquias, arma de duelo y efectos compartidos entre Arena, PvE y reino.

RENOMBRE

La ficha canónica incorpora Renombre como indicador derivado de trayectoria. No es una moneda ni concede bonificaciones mecánicas en 0.3.3. Se calcula en servidor a partir de nivel, victorias de Arena, rating por encima de la base, reliquias poseídas y una ponderación adicional para Únicos Mundiales. El servidor devuelve también el desglose para mantener la fórmula auditable.

CONSUMIDORES ADICIONALES DE LA IDENTIDAD CANÓNICA

La Taberna utiliza el mismo snapshot para nombre, Escuela, nivel y Renombre del jugador que se representa físicamente en la sala. Estos datos se comparten en presencia/realtime para que los jugadores cercanos vean la identidad persistente y no una ficha paralela.

El evento PvE del Boss mundial también carga la identidad canónica del Archimago para representar al participante. El daño del Boss continúa siendo una mecánica estratégica basada en las reglas propias del evento; cargar la identidad común no implica que las estadísticas personales modifiquen ese daño todavía.

CONSOLIDACIÓN 0.3.5 — MODELO CANÓNICO DE OBJETOS

PRINCIPIO

Todo objeto físico que posea o equipe un Archimago pertenece a un único modelo de objetos.

CLASES

Gear: equipo procedural con rolls, rareza, nivel, afinidad, implícitos, afijos y poder de objeto.

Reliquia: objeto con nombre, lore, procedencia e historia persistente.

Arma de Duelo: NO es un objeto físico. Forma parte de la identidad intrínseca de combate y de la evolución tipo El Bruto.

SLOTS CANÓNICOS

Arma.

Túnica.

Amuleto.

Anillo I.

Anillo II.

Foco Arcano.

Reliquia.

MIGRACIÓN

El antiguo slot procedural llamado Artefacto pasa a llamarse Foco Arcano. Inventario v2 migra automáticamente item.slot artifact -> focus y equipment.artifact -> equipment.focus, conservando IDs, rareza, rolls, afijos, poder y fecha de creación. También se mantiene la lectura de la antigua caché local v1 para poder importarla al servidor.

RELIQUIA

Existe un único slot de Reliquia. Sólo una reliquia con nombre puede estar vinculada a la vez. Biblioteca, ficha e inventario usan el mismo estado autoritativo de equipamiento. Una reliquia equipada no puede presentarse simultáneamente como disponible para el Mercado de Reliquias.

API DE OBJETOS

El backend arcanum-state expone una lectura unificada de Gear + Reliquias + siete slots y un ciclo común de equipar/desequipar. Las rutas antiguas permanecen temporalmente como compatibilidad, pero nuevo código de interfaz debe utilizar el ciclo canónico.

ALCANCE MECÁNICO

Unificar objetos no significa que todos modifiquen todos los sistemas.

Gear modifica combate personal mediante bonificaciones verificadas.

Las Reliquias mantienen ámbitos semánticos. Una reliquia de combate puede afectar Arena. Una reliquia de economía, exploración, reclutamiento, ejército, construcción, ritual o botín sólo debe ser consumida explícitamente por su subsistema correspondiente.

Queda prohibido convertir silenciosamente bonificaciones de un ámbito en estadísticas de otro.

ARENA

Arena combina en servidor:

identidad intrínseca de combate;

Gear equipado;

Reliquia activa cuando posea modificadores compatibles con combate personal.

ARMA DE DUELO

La Arma de Duelo continúa siendo una elección/evolución intrínseca del combatiente. La Arma física del inventario ocupa el slot Arma. Ambas pueden coexistir porque representan capas distintas y la interfaz debe nombrarlas de forma distinta.

CIERRE UX DEL MODELO DE OBJETOS 0.3.5

El Inventario del Archimago es la superficie de gestión de posesiones: muestra Gear procedural, los siete slots canónicos y las Reliquias custodiadas. Desde él se puede vincular o desvincular la Reliquia activa mediante el mismo ciclo autoritativo del servidor.

La Biblioteca de Reliquias no desaparece. Su función queda especializada: catálogo mundial, lore, categorías, custodios, historia y Mercado de Reliquias. Inventario responde a “qué poseo y qué llevo”; Biblioteca responde a “qué existe en el mundo y cuál es su historia”.

Los totales derivados de combate visibles en la ficha deben preferir el cálculo devuelto por servidor. Así, Gear y una Reliquia compatible no pueden producir un resultado en Arena diferente al que muestra la ficha del Archimago.

CONSOLIDACIÓN 0.3.6 — BUCLE DE BOTÍN VERIFICADO

PRINCIPIO

El Gear procedural deja de aparecer mediante un botón de prueba y pasa a proceder de acciones reales del juego. El navegador no decide si una acción merece recompensa, ni la rareza, ni los rolls.

CADENA CANÓNICA

Acción real → verificación de servidor → claim única → tirada de drop → generación del objeto → sello de procedencia → inventario.

CLAIMS

Las recompensas de Gear utilizan claims idempotentes. Una misma acción autoritativa no puede conceder dos veces el mismo Gear aunque se repita una petición, se recargue la página o haya latencia.

Cada claim conserva usuario, fuente, referencia única, estado, tier de recompensa, snapshot del objeto generado, metadatos de verificación y fechas.

Si la entrega se interrumpe, el sistema puede reconciliar el estado. Si el objeto ya está en inventario, se marca como completado en lugar de volver a generarlo.

INVENTARIO LLENO

Una recompensa legítima no se destruye porque la Cámara esté llena. El objeto se genera una sola vez y queda como PENDIENTE DE ENTREGA. Al liberar espacio y volver a abrir el inventario o la ficha propia, el servidor intenta entregarlo.

PROCEDENCIA

Cada Gear nuevo lleva fuente, referencia, tier de recompensa y momento de adquisición. El Inventario muestra un campo ORIGEN.

Fuentes visibles actuales:

Legado inicial.

Beta anterior.

Exploración.

Arena clasificada.

Boss mundial.

Evento.

EXPLORACIÓN

Antes de explorar, arcanum-state guarda turnos y tierra.

Después de la exploración, comprueba que la tierra haya aumentado y que los turnos solicitados se hayan gastado realmente.

Sólo entonces existe tirada de Gear.

Bandas:

1–3 turnos: Rastreo.

4–9: Expedición.

10+: Exploración profunda.

La probabilidad aumenta con turnos comprometidos y tierra realmente obtenida, con tope del 68%. Las exploraciones profundas desplazan peso de Común hacia Raro/Épico.

ARENA

Sólo una victoria CLASIFICATORIA verificada puede producir Gear.

Los amistosos no dan Gear.

Las derrotas clasificatorias no dan Gear.

Probabilidad base tras victoria clasificatoria: 55%.

Bandas por rating posterior:

<1200: Victoria de Arena.

1200–1499: Arena veterana.

1500+: Arena élite.

Los seis Sellos diarios actúan como límite natural contra farmeo.

BOSS MUNDIAL

Para reclamar Gear de Boss debe existir participación real con daño superior a cero y el Boss debe haber sido derrotado.

Participación: 45%.

3000+ daño: 80%.

15000+ daño: Gear garantizado.

50000+ daño: Gear garantizado con pesos de rareza muy mejorados.

No hace falta dar el último golpe. Un participante que vuelva después de la derrota puede recuperar su claim.

El Gear de Boss se suma a Fragmentos y Reliquias. Son capas de recompensa distintas y no deben fusionarse artificialmente.

DEBUG

El botón visible HALLAZGO DE PRUEBA se elimina del juego normal.

La ruta técnica de test queda bloqueada salvo que el servidor habilite explícitamente ARCANUM_ALLOW_TEST_LOOT=true.

NORMA PARA FUTURAS FUENTES

Toda fuente nueva de Gear debe declarar:

fuente autoritativa;

referencia única;

regla de elegibilidad;

probabilidad;

pesos de rareza;

tier de recompensa;

regla anti-farm.

CONSOLIDACIÓN 0.3.7 — EXPEDICIONES PVE PERSONALES

OBJETIVO

Expediciones se convierte en el bucle PvE personal repetible del Archimago. No existe un personaje PvE separado: utiliza la misma identidad canónica de combate, el mismo Gear equipado y la Reliquia compatible activa.

PRIMERA EXPEDICIÓN

Ruinas del Umbral.

Secuencia:

1. Vigilante de Ceniza — Cineria.

2. Tejedora del Velo — Oneiria.

3. Custodio Marchito — Viridia.

4. El Cartógrafo Hueco — Nadir — jefe final.

La primera versión usa una única expedición compacta para poder equilibrar correctamente combate, persistencia y recompensas antes de multiplicar ubicaciones.

ESTADO PERSISTENTE

Cada incursión guarda servidor:

expedición;

dificultad;

sala actual;

vida actual y máxima;

seed determinista;

snapshot del perfil;

snapshot del combate;

snapshot de Gear + Reliquia;

último enemigo;

último registro de combate;

último botín;

fechas.

Sólo puede existir una incursión viva por jugador.

La incursión caduca a las 24 horas.

EQUIPO SELLADO

Al comenzar una incursión se congelan identidad de combate, bonificaciones de Gear, Reliquia compatible y nivel del Archimago.

Cambiar objetos fuera de la expedición no modifica una incursión ya empezada.

El nivel de los objetos que caigan dentro de la expedición queda ligado también al nivel de entrada.

VIDA PERSISTENTE

La vida restante después de cada victoria se guarda.

La siguiente cámara comienza con esa vida.

No existe curación gratuita entre salas.

Una derrota termina la incursión.

Retirarse termina voluntariamente la incursión y conserva los objetos ya obtenidos.

COSTE

Cada intento de sala cuesta 1 Turno.

Comenzar y retirarse no cuestan Turnos.

El gasto se ejecuta en servidor.

BLOQUEO DE COMBATE

Antes de resolver una sala, el estado pasa atómicamente de active a fighting.

Sólo la petición que obtiene el bloqueo puede gastar el Turno y resolver el encuentro.

Esto evita dobles clics, dos pestañas y peticiones duplicadas.

Un bloqueo fighting abandonado durante más de 60 segundos puede recuperarse automáticamente.

DIFICULTADES

I · Incursión — nivel 1.

II · Profundidad — nivel 5.

III · Abismo — nivel 10.

Las dificultades superiores aumentan escalado enemigo, probabilidad de Gear y calidad de rarezas.

ENEMIGOS

Los enemigos utilizan el mismo motor de combate que Arena: golpes, esquiva, bloqueo, regeneración, críticos, veneno, armas, rasgos y habilidades.

Su identidad se genera de forma determinista mediante seed de incursión + sala y se escala con nivel de entrada, dificultad, profundidad y condición de jefe.

BOTÍN

Cada cámara superada puede crear una claim PvE verificada.

Sala 1: 28% base.

Sala 2: 36% base.

Sala 3: 48% base.

Cada dificultad por encima de I añade 8 puntos porcentuales.

El jefe final garantiza Gear.

Los jefes no pueden generar objetos Comunes.

El inventario lleno sigue utilizando pending_inventory y no destruye recompensas.

AUTORIDAD

El navegador únicamente muestra catálogo y envía acciones.

Servidor decide elegibilidad, snapshot, vida, salas, turnos, enemigo, combate, ganador, vida restante, rareza y recompensa.

CONSOLIDACIÓN 0.3.8 — DECISIONES ENTRE CÁMARAS

Después de cada victoria no-boss de una Expedición aparece una decisión real antes de entrar en la siguiente cámara.

PRINCIPIO

La decisión debe ser informada, tener consecuencias visibles y no tener una opción universalmente superior. El jugador puede leer el coste antes de elegir.

OPCIONES

1. DESCENDER AL UMBRAL

Sin modificadores. Riesgo y botín normales.

2. BUSCAR UN SANTUARIO

Recupera el 18% de la vida máxima, sin superar el máximo.

La siguiente cámara pierde 10 puntos porcentuales de probabilidad de Gear y desplaza ligeramente las rarezas hacia abajo.

3. FORZAR EL UMBRAL

La siguiente criatura recibe multiplicador x1,15 en sus estadísticas de combate.

La siguiente cámara gana 18 puntos porcentuales de probabilidad de Gear y mejora los pesos de rareza.

La elección no cuesta Turnos.

PERSISTENCIA

La opción elegida queda almacenada en arcanum_pve_runs.next_modifiers.

La elección queda registrada en decision_history con etapa, opción, vida antes/después, siguiente sala, modificadores y timestamp.

La decisión se consume exclusivamente en la siguiente sala y no puede editarse desde el navegador.

JEFE

El jefe final sigue siendo obligatorio.

Su Gear sigue garantizado. La decisión anterior al jefe afecta principalmente la calidad de rareza cuando se elige Forzar o Santuario, no elimina la garantía.

OBJETIVO DE DISEÑO

Descender conserva estabilidad.

Santuario compra supervivencia sacrificando calidad.

Forzar convierte vida en una oportunidad de mejor botín.

La situación concreta del Archimago determina qué opción tiene sentido.

