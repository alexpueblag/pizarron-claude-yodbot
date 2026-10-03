# Auditoría de Ajedrex v0.2

Fecha: 2026-10-03. Proyecto personal de hobby de alexpueblag.

## Incidencia móvil

El usuario informó que en iPhone veía texto sin el tablero y, cuando apareció, las piezas blancas se veían negras; también percibió movimientos demasiado rápidos. El primer enlace era una visualización dentro de una Page de ChatGPT. No era un sitio web independiente. No se dispone de logs del teléfono, por lo que no puede atribuirse el fallo de carga a una causa exacta.

## Cambios verificables

1. **Publicación independiente:** carpeta estática para GitHub Pages, sin dependencia del visor de ChatGPT. Arranque con aviso visible si faltan los scripts.
2. **Colores de piezas:** sustituidos caracteres Unicode dentro de SVG por caminos y círculos SVG, con colores explícitos. Evita que una fuente/emoji ignore el color de blancas.
3. **Ritmo de juego:** animación de 220 ms, espera mínima de 900 ms antes de la respuesta del rival; respeta movimiento reducido. Añadido arrastre mediante Pointer Events y mantenido tocar origen/destino.
4. **Falso ataque descubierto reproducido:** en FEN `r5k1/8/8/8/8/8/R7/R5K1 w - - 0 1`, se anunciaba descubierta tras Rxa8+, aunque la torre rival ya estaba capturada. Ahora se exige que el objetivo siga existiendo y sea rival.
5. **Motor silencioso:** un watchdog cancela el worker y usa cálculo compatible limitado si no responde. Cambiar de partida, deshacer u ocultar la pestaña invalida las respuestas pendientes.
6. **Deshacer con negras:** no se ofrece deshacer antes de que el humano haya jugado; evita retirar y repetir sin efecto la apertura del motor.
7. **Conservación:** exportación/importación de JSON, validación previa, historial legal y mensajes claros. El código en GitHub no es una copia automática de las partidas.
8. **Web sin conexión:** scripts locales, worker por URL del mismo origen, manifiesto y precaché dentro de la carpeta del proyecto.
9. **Accesibilidad:** restauración del foco al cerrar paneles, SVG explícitos, avisos con símbolos además de colores.

## Pruebas previas a subir

- 60 comprobaciones de reglas/tácticas/motor: perft inicial 20/400/8902, seis ejemplos, regresión de descubierta, enroque por jaque, caducidad de captura al paso, promociones, mate, ahogado, repetición y 40 movimientos legales del motor.
- 20 comprobaciones de interacción simulada: colores SVG, toques, espera mínima, cancelar respuestas obsoletas, deshacer, catálogo, búsqueda, ayudas, promoción, copias, recarga y recuperación de motor silencioso.
- Suite WebKit/iPhone preparada para ejecutarse en GitHub Actions. Su resultado debe consultarse en el run del commit; preparar una prueba no implica que haya pasado.

## Límites importantes

Solo 18 temas tienen detector; 81 es el número de fichas del catálogo, no de detectores. Rayos X, clavadas, ataques y defensas son patrones geométricos. No existe todavía evaluación completa de todas las respuestas para asegurar ganancias. GarboChess no es Stockfish y los cinco niveles no equivalen a un Elo oficial. Las tablas por repetición y 50 jugadas se aplican automáticamente en esta primera versión. No hay sincronización ni servidor de cuentas. El aspecto y los gestos deben validarse también en el iPhone real del usuario.
