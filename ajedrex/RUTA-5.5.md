# Ajedrex: peticiones y ruta hacia 5.5

Objetivo del proyecto: aprender a leer una posición jugando en iPhone, con símbolos comprensibles, ayudas graduables y un rival local. El código debe conservarse en GitHub y los problemas deben poder reproducirse.

## Auditoría de las peticiones

| Petición | Estado comprobable en el código |
|---|---|
| Tablero digital y juego presencial | Implementado: dos personas o GarboChess en el mismo dispositivo. |
| iPhone, piezas distinguibles y movimientos pausados | SVG explícitos, toque y arrastre, animación y respuesta mínima de 900 ms. Pruebas WebKit; falta validación física prolongada. |
| Motor gratuito y niveles | GarboChess local, cinco dificultades orientativas. Falta Elo calibrado y selección de otros motores. |
| Barra blanca/negra | Implementada con estimación del motor y respaldo de material identificado. |
| Capturas muy visibles | Implementadas por jugador, cantidades, colores y balance. |
| Evaluación al terminar | Implementada: resultado, evolución, tres momentos y alternativas. Búsqueda breve, no precisión certificada. |
| Todas las tácticas con icono e interruptor | 81 temas del catálogo elegido, controles independientes e iconos propios; todos habilitados inicialmente. No equivale a todas las estrategias existentes en ajedrez. |
| Detectar todas las tácticas | Los 60 temas tácticos tienen detector o regla y práctica; los 21 restantes son contexto/datos. La cobertura es acotada: candidatos no prueban ventaja; la búsqueda puede agotar presupuesto. Véase DETECTORES.md. |
| Enseñar por medio de símbolos | 60 prácticas. v0.6 añade explorador de la posición real y pasos legales de la línea disponible; todavía faltan explicaciones causales de todas las defensas. |
| Apagar/encender según nivel | Implementado. v0.6 agrega enfoque por color o pieza seleccionada sin cambiar interruptores. |
| Guardar proyecto para que no se pierda | Código en GitHub. Partida/progreso locales con exportación; no son respaldo automático en nube. |
| Chinches desde la web | v0.6: señalar control/casilla, comentar, guardar, compartir/copiar/descargar y preparar incidencia GitHub. Sin envío automático a ChatGPT. |

## Entrega v0.6

- Chinches con FEN visible, copia de la partida, preferencias, tema, práctica, versión y tamaño de pantalla.
- Bandeja local de hasta 100 reportes, marcar resueltos/reabrir y eliminar con confirmación.
- No se guarda una captura fotográfica de pantalla: se reconstruye el tablero y se registra el elemento señalado.
- Compartir usa la hoja nativa cuando está disponible; copiar y JSON son alternativas. GitHub abre un borrador público que el usuario debe publicar.
- Explorador separado: relaciones marcadas, estado de confianza y pasos legales disponibles. La partida se pausa y no se sustituye.
- Enfoque visual temporal: toda la posición, pieza seleccionada o casillas con piezas blancas/negras. Si no hay pieza seleccionada muestra todo. No pretende distinguir todas las amenazas a favor de un bando.
- Pruebas automatizadas móviles y existentes; no se afirma prueba en iPhone físico.

## Prioridad restante (* muy difícil)

1. **Fiabilidad táctica *:** más contraejemplos, defensas legales y sacrificios; convertir cada chinche válida en una regresión. Aceptación: ningún patrón geométrico presentado como ganancia forzada.
2. **Explicación causal *:** atacantes, defensores, por qué falla una defensa y alternativas del rival. El explorador actual muestra la línea disponible, no inventa variantes.
3. **Stockfish adicional:** distribución oficial compatible, licencias y fuentes GPL, Worker, memoria/batería/offline en Safari; conservar opción ligera.
4. **Entrenador durante la partida:** ayuda a petición, pregunta antes de revelar y revisión de tres momentos.
5. **Ejercicios de errores propios *:** verificar solución y alternativas, repetición espaciada, sin premiar solo memorización.
6. **Entrenamiento adaptativo *:** medir desempeño sin ayuda por tema y variar posiciones; progreso no equivale a Elo.
7. **Archivo de partidas:** múltiples partidas, PGN de entrada/salida, búsqueda y reanudación.
8. **iPhone físico:** teclado, áreas seguras, VoiceOver, modo inicio, interrupciones, consumo y actualizaciones. Corregir fallos en cada entrega.
9. **Dificultad coherente y Elo aproximado *:** calibrar contra referencias; no llamar Elo a un deslizador de profundidad.
10. **Respaldo opcional:** restaurar en otro dispositivo, estados de sincronización y conflictos sin perder juego offline.
11. **Bandeja de correcciones conectada:** asociar número de incidencia y versión que la arregla; envío autenticado requiere un servicio o conexión del usuario, nunca un token incrustado en el sitio.

## Cómo aportar para subir de nivel

Usar chinches con “pasó X / esperaba Y”, jugar sesiones reales de 10–15 minutos en iPhone y revisar qué símbolos resultan confusos. Priorizar problemas repetidos sobre agregar más iconos. Mantener un conjunto de posiciones reales y una prueba por corrección sustancial.

La meta 5.5 es una ruta de producto, no una afirmación de que estos pendientes están terminados.
