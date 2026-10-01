# FRONTLINE 1944 · Game Design Document 0.2

## Definición

FRONTLINE 1944 es una estrategia narrativa histórica para un jugador. El jugador ocupa un puesto de mando del Heer y toma decisiones desde la perspectiva limitada de un general alemán durante la Segunda Guerra Mundial.

**No controlas la guerra. La diriges.**

## Pilar 1 · Realismo histórico y militar extremo

Todo dato presentado como histórico deberá tener procedencia verificable.

El sistema documental abarcará:

- cronología;
- cadena de mando;
- orden de batalla;
- plantillas y fuerza efectiva;
- armamento;
- munición;
- combustible;
- vehículos operativos y en reparación;
- comunicaciones;
- ferrocarril y transporte;
- clima;
- terreno;
- bajas;
- reemplazos;
- disponibilidad de aviación y artillería;
- inteligencia conocida en ese momento.

La disponibilidad teórica de una unidad no equivale a su disponibilidad operacional.

## Pilar 2 · Profundidad táctica y operacional

Las decisiones se modelan por sus restricciones reales:

- terreno;
- reconocimiento;
- reservas;
- profundidad defensiva;
- movilidad;
- artillería;
- ingenieros;
- desgaste;
- moral;
- fatiga;
- tiempo;
- comunicaciones;
- abastecimiento;
- cadena de mando.

No existe una única cifra de poder que resuelva un combate.

## Pilar 3 · Perspectiva del general alemán

El jugador no recibe información omnisciente.

Su realidad está formada por:

- partes de divisiones;
- llamadas telefónicas;
- mensajes por radio;
- informes de inteligencia;
- mapas actualizados a mano;
- órdenes superiores;
- peticiones de subordinados;
- rumores;
- información incompleta o contradictoria.

El juego debe distinguir siempre entre lo que **ocurre** y lo que el personaje **cree que ocurre**.

## Pilar 4 · Información imperfecta

Todo contacto enemigo puede tener:

- hora del informe;
- fuente;
- fiabilidad;
- posición estimada;
- tamaño estimado;
- antigüedad;
- nivel de confirmación.

Un marcador puede seguir apareciendo en el mapa aunque la formación enemiga ya no esté allí.

## Historia y divergencia

La campaña comienza dentro de la cronología real.

Las decisiones del jugador pueden crear divergencias, pero las consecuencias deben permanecer plausibles y proporcionales. Una decisión táctica no reescribe mágicamente la guerra.

El juego identificará:

- HECHO HISTÓRICO;
- RECONSTRUCCIÓN NARRATIVA;
- DIVERGENCIA DEL JUGADOR.

## Personajes

Se mezclarán figuras históricas documentadas con personajes ficticios.

Los ficticios existirán para dar continuidad narrativa a:

- Estado Mayor;
- oficiales de enlace;
- comandantes de regimiento o batallón;
- personal logístico;
- comunicaciones;
- médicos y servicios.

Siempre se marcarán como ficticios en el archivo del juego.

## Primer escenario

**Normandía · 6 de junio de 1944**

Primer rol jugable:

**General der Artillerie Erich Marcks**  
**LXXXIV Armeekorps**

El escenario inicial se construye alrededor de los informes alemanes de las primeras horas de la invasión y de la incertidumbre existente antes y durante los desembarcos anfibios.

## Simulación de recursos

Variables iniciales del prototipo:

- capacidad de mando;
- comunicaciones;
- logística;
- combustible;
- munición;
- reservas;
- moral;
- inteligencia.

En versiones posteriores estas abstracciones se descompondrán en datos físicos: toneladas, vehículos, existencias, rutas, capacidad de transporte y estados de unidad.

## Arquitectura narrativa

Cada nodo contiene:

1. hora y fecha;
2. procedencia;
3. urgencia;
4. información disponible;
5. hechos documentados;
6. recomendaciones del Estado Mayor;
7. decisiones posibles;
8. coste inmediato;
9. consecuencia visible;
10. consecuencias diferidas.

Las consecuencias futuras podrán activarse muchas escenas después.

## Línea estética

El juego debe recordar a una sala de operaciones militar de 1944:

- mapas;
- chinchetas;
- documentos;
- mecanografía;
- telegramas;
- teléfonos;
- fichas de unidad;
- fotografías de reconocimiento.

La estética histórica no debe convertirse en glorificación ideológica.

## Roadmap

### Fase A
Vertical slice narrativo del 6 de junio.

### Fase B
Cronología completa del Día D desde el puesto de mando del LXXXIV Cuerpo.

### Fase C
Simulación militar profunda: unidades, suministro, comunicaciones, fatiga y bajas.

### Fase D
Campaña de Normandía completa.

### Fase E
Campañas terrestres adicionales, manteniendo la misma disciplina documental.
