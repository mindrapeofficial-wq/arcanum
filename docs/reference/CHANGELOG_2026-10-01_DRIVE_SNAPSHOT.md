<!-- Snapshot imported from Google Drive on 2026-10-01 for Claude cloud context. -->
<!-- Source: https://docs.google.com/document/d/1Ssw9ciiSgQaRHM3Gb4mLXEDrM4Wb23swvGwQ3L9rrvA/edit -->

ARCANUM — Registro de cambios desde la última sincronización

Corte de sincronización

Última edición previa localizada en Drive: 1 de octubre de 2026, 07:23 (Europe/Madrid).

Rango de código revisado: 9d21dba29d6d10cad3c1ef5afa7a2b54b293a1e7 → 67ed69b12c9a35e13e80549be78ccd07806a407e.

Total: 100 commits y 36 archivos finales afectados.

Cambios funcionales principales

• Personaje pasa a ser la vista inicial del juego.

• Restauración y endurecimiento de las rutas de Personaje, Ejército y Comunidad.

• Nueva ficha de Personaje orientada al juego, separada del perfil social.

• Inventario corregido para reflejar correctamente objetos equipados y mostrar la acción Desequipar.

• Perfil de jugador adaptado a retratos oficiales de escuela y nivel; se retiran las fotos personalizadas.

• Retratos de las cinco escuelas integrados en Personaje, perfiles y barra lateral con fallbacks resistentes.

• Nombres de escuelas coloreados con estilos brillantes en toda la interfaz.

• Arena limpia de elementos sobrantes y preparada para animación idle de Viridia.

• Relicario configurado para mostrar únicamente reliquias descubiertas.

• Integración visual de la Corona del Bosque Primigenio en Relicario e inventario.

• Taberna ocultada de la navegación mientras siga incompleta.

• Crónica retirada de la navegación.

• Nuevo panel de administración avanzado, con ruta, estilos, lógica de gestión y puerta de mantenimiento.

• Modo mantenimiento aplicado también al acceso/login.

• Correcciones de caché, carga de recursos y referencias de imágenes de personaje.

Recursos gráficos nuevos o sustituidos

• Viridia nivel 1: retrato PNG, WebP y versiones SVG.

• Aurea nivel 1: retrato PNG y WebP.

• Cineria nivel 1: retrato PNG y WebP.

• Oneiria nivel 1: retrato PNG y WebP.

• Nadir nivel 1: retrato PNG y WebP.

• Viridia Arena: 4 frames idle nuevos.

• Corona del Bosque Primigenio: recurso definitivo integrado en juego.

• Eliminado el recurso provisional verdante-level-1.png y otros chunks temporales de Corona.

Archivos finales modificados

assets/art/artifacts/verdant-crown.b64

assets/art/characters/abyssal/nadir-level-1.png

assets/art/characters/abyssal/nadir-level-1.webp

assets/art/characters/ascendant/aurea-level-1.png

assets/art/characters/ascendant/aurea-level-1.webp

assets/art/characters/eradication/cineria-level-1.png

assets/art/characters/eradication/cineria-level-1.webp

assets/art/characters/phantasm/oneiria-level-1.png

assets/art/characters/phantasm/oneiria-level-1.webp

assets/art/characters/verdante/viridia-level-1.png

assets/art/characters/verdante/viridia-level-1.svg

assets/art/characters/verdante/viridia-level-1.webp

assets/art/characters/verdante/viridia-profile-level-1.svg

assets/css/admin.css

assets/css/arcanum.css

assets/css/artifacts.css

assets/css/character.css

assets/css/inventory.css

assets/css/native.css

assets/js/admin.js

assets/js/arena.js

assets/js/artifacts.js

assets/js/character.js

assets/js/inventory.js

assets/js/profile.js

assets/js/realm-state.js

assets/js/router.js

assets/js/state.js

assets/js/ui.js

assets/ui/arena/verdant-idle-1.b64

assets/ui/arena/verdant-idle-2.b64

assets/ui/arena/verdant-idle-3.b64

assets/ui/arena/verdant-idle-4.b64

index.html

version.json

Notas de limpieza

No se han catalogado como recursos finales los chunks temporales utilizados durante la reconstrucción de imágenes ni archivos que fueron eliminados o reemplazados dentro del mismo rango. Este registro refleja el estado final vigente del repositorio al terminar la sincronización.

