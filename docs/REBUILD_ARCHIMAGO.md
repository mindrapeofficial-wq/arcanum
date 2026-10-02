# ARCANUM — reconstrucción sobre Archimago

## Fuente técnica
- Base funcional: `mindrapeofficial-wq/archimago`
- Commit fijado: `e84237e6a7624c0be71cce6a92cbabbe81471a9f`
- Licencia declarada por el paquete raíz: MIT.
- Rama de integración: `rebuild/archimago-engine`

## Objetivo
Rehacer ARCANUM utilizando el motor y la funcionalidad de Archimago como base, manteniendo la identidad visual y narrativa propia de ARCANUM.

## Regla principal
Clonar la funcionalidad del juego original al 100% en cuanto a sistemas jugables, pero no su identidad narrativa ni visual.

## Se conserva de ARCANUM
- Nombre ARCANUM.
- Logo y branding.
- Interfaz visual propia y layout que siga siendo útil.
- Assets gráficos propios.
- Escuelas: Aurea, Viridia, Cineria, Nadir y Oneiria.
- Dominio como núcleo del juego.
- Comunidad y chat.
- Infraestructura útil ya existente cuando no interfiera con el nuevo motor.

## Se elimina
- Página Personaje.
- Sistemas de personaje individual.
- PvP individual.
- Arena/duelos 1v1 y sus rankings asociados.
- Dependencias de UI que sólo existan para esos sistemas.

## Se importa/adapta desde Archimago
- Motor de juego.
- Turnos.
- Economía.
- Construcción y destrucción.
- Exploración.
- Investigación.
- Magia y hechizos.
- Unidades y ejército.
- Objetos.
- Reliquias/artefactos equivalentes.
- Mercado.
- Rankings no ligados al PvP individual.
- Servidor/API.
- Persistencia y adaptadores de datos.
- Tests del motor.
- Cualquier pantalla necesaria para exponer el 100% de esos sistemas.

## Rebranding total
Todos los nombres visibles heredados deben sustituirse por nombres originales de ARCANUM:
- términos del mundo;
- objetos;
- reliquias;
- unidades;
- edificios cuando corresponda;
- hechizos;
- eventos;
- recursos;
- categorías;
- textos de ayuda;
- mensajes del servidor;
- nombres de pantallas.

Los IDs internos pueden mantenerse temporalmente cuando cambiarlos rompa compatibilidad, pero nunca deben filtrarse al jugador.

## Integración de interfaz
La UI de Archimago no será el producto final. Sus pantallas se usarán como referencia funcional y se reconstruirán dentro del lenguaje visual de ARCANUM.

Orden del menú inicial:
1. Dominio
2. Economía
3. Construcción
4. Exploración
5. Investigación
6. Magia
7. Ejército
8. Mercado
9. Clasificación
10. Comunidad
11. Chat

Se añadirán páginas cuando un sistema de Archimago no tenga equivalente actual.

## Estado de integración · 2 de octubre de 2026

Completado en la rama `rebuild/archimago-engine`:

- motor, shared, data-adapter y server importados y typecheckeados en CI;
- Dominio establecido como vista autenticada por defecto;
- Personaje, Arena, Expediciones legacy y Guerra 1v1 retirados de navegación normal;
- primera fachada ARCANUM sobre el motor creada en `packages/server/src/arcanum-domain.ts`;
- endpoints ARCANUM nativos añadidos para estado de Dominio, Exploración, Oro, Maná y Construcción;
- mapeo de escuelas heredadas encapsulado: Aurea, Viridia, Cineria, Nadir y Oneiria son los únicos nombres expuestos por la fachada;
- regresiones E2E actualizadas para proteger la navegación Domain-first y las superficies retiradas;
- prueba automática del adaptador ARCANUM añadida a CI;
- nomenclatura visible de `Archimago`/`Personaje` eliminada de Dominio y Perfil social;
- almacenamiento PGlite provisional renombrado a `arcanum-db`.

Siguiente frontera técnica: conectar la UI de Dominio/Economía a la fachada nueva y sustituir la persistencia PGlite provisional por persistencia duradera antes de publicar el backend reconstruido.

## Estrategia de migración
1. Importar el motor, shared, data, data-adapter y server.
2. Hacer funcionar el backend sin UI.
3. Adaptar datos/nombres a ARCANUM.
4. Conectar Dominio y economía.
5. Conectar construcción/exploración/investigación.
6. Conectar magia, ejército, objetos y mercado.
7. Añadir páginas faltantes.
8. Eliminar Personaje/PvP individual.
9. Integrar Comunidad y Chat de ARCANUM.
10. Sustituir assets genéricos por assets propios.
11. Tests de paridad funcional.
12. Publicación sólo después de pasar la suite completa.

## Criterio de terminado
La reconstrucción se considera completa cuando todos los sistemas no-PvP-individual presentes en Archimago tengan una ruta funcional equivalente en ARCANUM, con nombres y presentación propios, y sin referencias visibles al proyecto original.
