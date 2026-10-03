# Auditoría de Ajedrex v0.3

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

## Ventaja, capturas y evaluación final (v0.3)

- Barra de ventaja con evaluación de GarboChess, perspectiva blanca estable al girar el tablero, distinción visible entre motor y material, y prioridad del resultado reglamentario.
- GarboChess usa un peón de 800 unidades internas: se divide entre 8 para expresar centipeones y se invierte el signo cuando corresponde jugar a negras. No se convierte este valor a Elo.
- Worker independiente para la revisión; se cancela el análisis de posición al pensar el rival para no disputar el procesador del móvil. La revisión pausa al rival y cerrarla reanuda la partida.
- Capturas por historial y balance por tablero, tratados por separado para cubrir captura al paso, promociones y posiciones de ejemplo.
- Informe final con gráfico, clasificaciones orientativas, alternativas legales y navegación por posiciones sin mutar el juego.
- Caché v0.3 incorpora ambos archivos nuevos y activa la actualización solo tras completar la precarga.

## Pruebas previas a subir

- 60 comprobaciones de reglas/tácticas/motor: perft inicial 20/400/8902, seis ejemplos, regresión de descubierta, enroque por jaque, caducidad de captura al paso, promociones, mate, ahogado, repetición y 40 movimientos legales del motor.
- 26 comprobaciones de interacción simulada: colores SVG, toques, espera mínima, cancelar respuestas obsoletas, deshacer, catálogo, búsqueda, ayudas, promoción, copias, recarga, recuperación de motor silencioso, capturas, deshacer, informe final y preservación de la partida durante la revisión.
- 19 comprobaciones nuevas de material y revisión: capturas, captura al paso, promoción con captura, material en FEN, signo del motor, fallback, mate, tablas, alternativas legales y números de jugada desde FEN.
- Suite de 11 recorridos reales de navegador en GitHub Actions: 10 WebKit/iPhone y 1 Chromium offline. Incluye capturas, giro, barra calculada, informe final, revisión sin mutación y reanudación del rival. El resultado definitivo corresponde al run del commit, no a la mera existencia de estas pruebas.

## Límites importantes

Solo 18 temas tienen detector; 81 es el número de fichas del catálogo, no de detectores. Rayos X, clavadas, ataques y defensas son patrones geométricos. No existe todavía evaluación completa de todas las respuestas para asegurar ganancias. GarboChess no es Stockfish y los cinco niveles no equivalen a un Elo oficial. Las tablas por repetición y 50 jugadas se aplican automáticamente en esta primera versión. No hay sincronización ni servidor de cuentas. El aspecto y los gestos deben validarse también en el iPhone real del usuario.

## Diagnóstico de recarga offline en el emulador

El tablero publicado y los recorridos de juego pasaron en WebKit. `context.setOffline(true)` seguido de navegación produce un error interno de WebKit incluso con el service worker activo y controlador. Existe un reporte upstream equivalente: https://github.com/microsoft/playwright/issues/42775 . Para conservar cobertura útil, la suite prueba la emulación offline en Chromium y, por separado, comprueba en WebKit que el juego recarga desde el service worker después de apagar realmente el servidor de origen. Son perturbaciones distintas; ninguna sustituye la prueba de modo avión en el iPhone físico. No se omite ninguna de esas dos comprobaciones.
