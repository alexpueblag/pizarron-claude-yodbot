# Cobertura del catálogo v0.4

Las 81 opciones tienen icono propio, interruptor persistente y una implementación definida. Hay **60 temas de táctica/reglas, 16 contextos (incluida longitud) y 5 datos de origen/selección**. No todos son amenazas del tablero ni toda posición contiene todos los temas.

- Comprobado: una regla, geometría concreta o secuencia finita verificada; la explicación delimita qué se comprobó.
- Patrón observado: geometría presente, sin afirmar ganancia.
- Posibilidad para explorar: combinación condicional o valoración limitada; se dibuja con borde punteado.
- Contexto: fase, material, evaluación o longitud de una línea.
- Datos de ejercicios: origen declarado en una copia importada; nunca inferido del nivel del motor.

Cada tema aparece en Ayudas y Catálogo. En una casilla se ven hasta dos iconos y un contador que abre todas las alertas restantes; la tira bajo el tablero muestra todos los tipos presentes. Las combinaciones avanzadas muestran hasta cuatro ejemplos por tema. Activar una opción permite verla cuando se detecta su condición; no genera una alerta vacía.

## Presupuesto y prueba

La búsqueda breve usa hasta unos 2,6 segundos en un worker. «Ampliar análisis» dedica hasta 10 segundos y explora mates hasta ocho jugadas propias. El límite se comprueba entre nodos: puede haber una pequeña demora adicional por evaluar una posición. Jugar, deshacer, importar o abrir la revisión cancela el análisis anterior. La interfaz muestra cuándo la búsqueda fue limitada.

Un mate en varias jugadas solo se anuncia tras comprobar **todas las defensas legales** del horizonte y la distancia mínima. Agotar tiempo o nodos no demuestra ni ausencia ni presencia de mate. «Cinco o más» agrupa los mates demostrados de cinco a ocho en la búsqueda ampliada. Las figuras de mate reconocen las variantes descritas en MATE_PATTERNS.md sobre un mate actual o disponible en una.

Zugzwang se ofrece como candidato en finales pequeños de reyes/peones, tras comparar todas las jugadas legales con un pase hipotético a profundidad fija. No es una prueba de tabla de finales. Sacrificios, atracciones y desviaciones muestran una continuación legal condicionada a la respuesta rival. El intercambio material local excluye jugadas intermedias fuera de la casilla y lo dice en el aviso.

## Registro de implementación

| Tema | Módulo | Alcance de la ficha |
| --- | --- | --- |
| Piezas atacadas (`attacked`) | `tactics.js` | Ataque geométrico actual. Una clavada puede impedir capturar; no equivale a una pieza perdida. |
| Piezas defendidas (`defended`) | `tactics.js` | Apoyo geométrico actual. No asegura que el defensor pueda recapturar legalmente. |
| Piezas sin defensa (`undefended`) | `tactics.js` | Ausencia de apoyo geométrico. Una pieza sin defensa puede estar segura. |
| Defensa insuficiente (`insufficientDefense`) | `advanced-tactics.js` | Secuencia de capturas analizada con límites; revisa la línea y la respuesta rival. |
| Jaque (`check`) | `tactics.js` | Regla exacta: el rey del bando que mueve está atacado. |
| Sobrecarga (`overload`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Peón avanzado (`advancedPawn`) | `tactics.js` | Peón en sexta o séptima fila desde su propio lado; no asegura que pueda coronar. |
| Conseguir ventaja (`advantage`) | `context-tactics.js` | Valoración de motor entre 1,5 y 5 peones; no significa que se haya encontrado una combinación. |
| Mate de Anastasia (`anastasiaMate`) | `mate-patterns.js` | Configuración de mate de anastasia identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Mate árabe (`arabianMate`) | `mate-patterns.js` | Configuración de mate árabe identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Ataque a f2 o f7 (`attackingF2F7`) | `context-tactics.js` | Ataque geométrico sobre un peón rival situado en f2 o f7. |
| Atracción (`attraction`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Mate del pasillo (`backRankMate`) | `mate-patterns.js` | Configuración de mate del pasillo identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Mate Balestra (`balestraMate`) | `mate-patterns.js` | Configuración de mate balestra identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Mate de los cerdos ciegos (`blindSwineMate`) | `mate-patterns.js` | Configuración de mate de los cerdos ciegos identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Final de alfiles (`bishopEndgame`) | `context-tactics.js` | Solo alfiles como piezas, además de reyes y posibles peones. |
| Mate de Boden (`bodenMate`) | `mate-patterns.js` | Configuración de mate de boden identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Enroque (`castling`) | `tactics.js` | Enroque legal disponible en esta posición. |
| Captura al paso (`enPassant`) | `tactics.js` | Captura al paso legal disponible solo en este turno. |
| Eliminar al defensor (`capturingDefender`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Movimiento colineal (`collinearMove`) | `context-tactics.js` | Jugada legal de una pieza deslizante por su línea compartida con otra pieza rival deslizante. |
| Mate de la esquina (`cornerMate`) | `mate-patterns.js` | Configuración de mate de la esquina identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Ventaja decisiva (`crushing`) | `context-tactics.js` | Valoración de motor de al menos 5 peones; puede cambiar con una búsqueda más profunda. |
| Jaque descubierto (`discoveredCheck`) | `tactics.js` | Una jugada legal abre un jaque de otra pieza. |
| Mate de dos alfiles (`doubleBishopMate`) | `mate-patterns.js` | Configuración de mate de dos alfiles identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Mate cola de paloma (`dovetailMate`) | `mate-patterns.js` | Configuración de mate cola de paloma identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Recuperar la igualdad (`equality`) | `context-tactics.js` | Compara dos posiciones evaluadas: el bando que acaba de mover pasa de desventaja a igualdad aproximada. |
| Ataque al flanco de rey (`kingsideAttack`) | `context-tactics.js` | Concentración geométrica de presión cerca del rey en el flanco de rey; su ubicación no demuestra enroque. |
| Despeje (`clearance`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Jugada defensiva (`defensiveMove`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Desviación (`deflection`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Ataque descubierto (`discoveredAttack`) | `tactics.js` | Una jugada legal abre el ataque de otra pieza; no garantiza que la combinación gane material. |
| Jaque doble (`doubleCheck`) | `tactics.js` | Dos atacantes dan jaque al mismo rey en la posición actual. |
| Final (`endgame`) | `context-tactics.js` | Fase estimada por material reducido; las excepciones estratégicas requieren interpretación humana. |
| Mate de las charreteras (`epauletteMate`) | `mate-patterns.js` | Configuración de mate de las charreteras identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Rey expuesto (`exposedKing`) | `context-tactics.js` | Patrón de poca cobertura de peones y presión cerca del rey; no prueba un ataque ganador. |
| Tenedor o ataque doble (`fork`) | `tactics.js` | Una pieza ataca dos o más rivales. La defensa y la legalidad pueden impedir aprovecharlo. |
| Pieza colgada (`hangingPiece`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Mate del gancho (`hookMate`) | `mate-patterns.js` | Configuración de mate del gancho identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Interferencia (`interference`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Jugada intermedia (`intermezzo`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Mate kill box (`killBoxMate`) | `mate-patterns.js` | Configuración de mate kill box identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Mate de Pillsbury (`pillsburysMate`) | `mate-patterns.js` | Configuración de mate de pillsbury identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Mate de Morphy (`morphysMate`) | `mate-patterns.js` | Configuración de mate de morphy identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Mate cola de golondrina (`swallowstailMate`) | `mate-patterns.js` | Configuración de mate cola de golondrina identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Mate del triángulo (`triangleMate`) | `mate-patterns.js` | Configuración de mate del triángulo identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Mate de Vuković (`vukovicMate`) | `mate-patterns.js` | Configuración de mate de vuković identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Final de caballos (`knightEndgame`) | `context-tactics.js` | Solo caballos como piezas, además de reyes y posibles peones. |
| Tres jugadas (`long`) | `context-tactics.js` | Tres jugadas propias en un mate forzado demostrado o en una línea importada legal. |
| Partidas de maestros (`master`) | `context-tactics.js` | Dato de origen declarado en una partida importada con al menos un jugador titulado; no deducible del tablero. |
| Maestro contra maestro (`masterVsMaster`) | `context-tactics.js` | Dato importado: ambos jugadores declaran un título. No describe la fuerza del motor. |
| Jaque mate (`mate`) | `tactics.js` | Regla exacta: jaque y ausencia de respuesta legal. |
| Mate en una (`mateIn1`) | `tactics.js` | Una jugada legal da mate inmediatamente, comprobado por las reglas. |
| Mate en dos (`mateIn2`) | `mate-search.js` | Mate forzado en dos jugadas propias, comprobando todas las defensas dentro del presupuesto de búsqueda. |
| Mate en tres (`mateIn3`) | `mate-search.js` | Mate forzado en tres jugadas propias, comprobando todas las defensas dentro del presupuesto de búsqueda. |
| Mate en cuatro (`mateIn4`) | `mate-search.js` | Mate forzado en cuatro jugadas propias, comprobando todas las defensas dentro del presupuesto de búsqueda. |
| Mate en cinco o más (`mateIn5`) | `mate-search.js` | Mate forzado profundo dentro del horizonte disponible. Un límite de búsqueda no prueba que no haya mate. |
| Medio juego (`middlegame`) | `context-tactics.js` | Fase estimada entre apertura y final. No existe una frontera reglamentaria entre fases. |
| Una jugada (`oneMove`) | `context-tactics.js` | Una jugada propia en un mate forzado demostrado o en una línea importada legal, diferenciadas en la explicación. |
| Apertura (`opening`) | `context-tactics.js` | Fase estimada por número de jugada y material: hasta la jugada 12 con al menos 10 piezas además de peones y reyes. |
| Mate de la ópera (`operaMate`) | `mate-patterns.js` | Configuración de mate de la ópera identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Final de peones (`pawnEndgame`) | `context-tactics.js` | Solo reyes y al menos un peón. |
| Clavada (`pin`) | `tactics.js` | Alineación geométrica con una pieza de mayor valor detrás. Distingue clavada absoluta y relativa. |
| Coronación (`promotion`) | `tactics.js` | Coronación legal disponible. |
| Final de damas (`queenEndgame`) | `context-tactics.js` | Solo damas como piezas, además de reyes y posibles peones. |
| Final de damas y torres (`queenRookEndgame`) | `context-tactics.js` | Damas y torres, sin alfiles ni caballos, en una posición de material reducido. |
| Ataque al flanco de dama (`queensideAttack`) | `context-tactics.js` | Concentración geométrica de presión cerca del rey en el flanco de dama; su ubicación no demuestra enroque. |
| Jugada tranquila (`quietMove`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Final de torres (`rookEndgame`) | `context-tactics.js` | Solo torres como piezas, además de reyes y posibles peones. |
| Sacrificio (`sacrifice`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Dos jugadas (`short`) | `context-tactics.js` | Dos jugadas propias en un mate forzado demostrado o en una línea importada legal. |
| Enfilada (`skewer`) | `tactics.js` | Alineación geométrica con una pieza de menor valor detrás; no asegura ganancia tras la respuesta. |
| Mate de la coz (`smotheredMate`) | `mate-patterns.js` | Configuración de mate de la coz identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones. |
| Grandes maestros de élite (`superGM`) | `context-tactics.js` | Dato importado: al menos un jugador con título GM y Elo declarado de 2700 o más. |
| Pieza atrapada (`trappedPiece`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Subpromoción (`underPromotion`) | `tactics.js` | Coronación legal a torre, alfil o caballo. La disponibilidad no significa que supere a la dama. |
| Cuatro jugadas o más (`veryLong`) | `context-tactics.js` | Cuatro o más jugadas propias en un mate forzado demostrado o en una línea importada legal. |
| Rayos X (`xRayAttack`) | `tactics.js` | Presión geométrica a través de un bloqueo rival; no se captura a través de la pieza interpuesta. |
| Zugzwang (`zugzwang`) | `advanced-tactics.js` | Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa. |
| Mezcla de temas (`mix`) | `context-tactics.js` | Preferencia de una colección importada de temas mezclados. No es una táctica del tablero. |
| Partidas de un jugador (`playerGames`) | `context-tactics.js` | Origen importado que identifica al jugador seleccionado; el nombre debe corresponder a uno de los participantes. |

## Pruebas

Cada grupo nuevo tiene posiciones positivas y negativas. El verificador de mates compara todas las defensas y conserva la historia para repetición; su API rápida se compara con las reglas públicas y perft. El worker integrado prueba el inicio, un mate forzado en cinco y una partida terminada. WebKit comprueba los 81 controles, migración, iconos por casilla, giro, arrastre, recarga, respuestas obsoletas y ancho de iPhone. Los resultados ejecutados corresponden al run de GitHub Actions del commit.
