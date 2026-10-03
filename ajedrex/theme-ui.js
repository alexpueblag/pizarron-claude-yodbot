/* Ajedrex pictograms: original SVG mnemonics, not a claim of universal chess notation. Every theme has a distinct drawing. */
const THEME_META={
 "attacked": {
  "icon": "<circle cx=\"12\" cy=\"12\" r=\"7\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v4M12 18v4M2 12h4M18 12h4\"/>",
  "label": "Piezas atacadas",
  "kind": "tactic",
  "scope": "Ataque geométrico actual. Una clavada puede impedir capturar; no equivale a una pieza perdida."
 },
 "defended": {
  "icon": "<path d=\"M12 3 20 6v6c0 5-8 9-8 9S4 17 4 12V6z\"/><path d=\"m8 12 3 3 5-6\"/>",
  "label": "Piezas defendidas",
  "kind": "tactic",
  "scope": "Apoyo geométrico actual. No asegura que el defensor pueda recapturar legalmente."
 },
 "undefended": {
  "icon": "<path d=\"M11 3 4 6v6c0 5 8 9 8 9l7-6M15 4l5 2v5M3 21 21 3\"/>",
  "label": "Piezas sin defensa",
  "kind": "tactic",
  "scope": "Ausencia de apoyo geométrico. Una pieza sin defensa puede estar segura."
 },
 "insufficientDefense": {
  "icon": "<path d=\"M12 3 20 6v6c0 5-8 9-8 9S4 17 4 12V6z\"/><path d=\"M12 7v6M12 16v.1M1 9l5 3-5 3M23 9l-5 3 5 3\"/>",
  "label": "Defensa insuficiente",
  "kind": "tactic",
  "scope": "Secuencia de capturas analizada con límites; revisa la línea y la respuesta rival."
 },
 "check": {
  "icon": "<g transform=\"translate(-3 1) scale(.85)\"><path d=\"M9 20h6M9 17l-2-6 5 2 5-2-2 6zM12 3v7M9 6h6\"/></g><path d=\"M20 5v9M20 18v.1\"/>",
  "label": "Jaque",
  "kind": "tactic",
  "scope": "Regla exacta: el rey del bando que mueve está atacado."
 },
 "overload": {
  "icon": "<path d=\"M3 8h18M6 8l-4 8h8zM18 8l-4 8h8zM12 3v17M8 20h8\"/><circle cx=\"12\" cy=\"7\" r=\"2\"/>",
  "label": "Sobrecarga",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "advancedPawn": {
  "icon": "<g transform=\"translate(-1 6) scale(.7)\"><circle cx=\"12\" cy=\"6\" r=\"3\"/><path d=\"M9 9h6M10 9v5l-4 6h12l-4-6V9\"/></g><path d=\"M16 19V4M12 8l4-4 4 4M13 2h6\"/>",
  "label": "Peón avanzado",
  "kind": "tactic",
  "scope": "Peón en sexta o séptima fila desde su propio lado; no asegura que pueda coronar."
 },
 "advantage": {
  "icon": "<path d=\"M3 19V5M3 19h18M6 16l5-5 3 2 7-9M16 4h5v5\"/>",
  "label": "Conseguir ventaja",
  "kind": "context",
  "scope": "Valoración de motor entre 1,5 y 5 peones; no significa que se haya encontrado una combinación."
 },
 "anastasiaMate": {
  "icon": "<path d=\"M4 3v18h16M14 5v7M11 5h6M11 12h6M7 15l3-5 2 2M17 17h3M18 15v5\"/><circle cx=\"5\" cy=\"7\" r=\"1.5\"/>",
  "label": "Mate de Anastasia",
  "kind": "tactic",
  "scope": "Configuración de mate de anastasia identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "arabianMate": {
  "icon": "<path d=\"M4 3v17h17M6 16h8M8 16V9h4v7M7 9V6h2v1h2V6h2v3M14 11l4-4 3 4-3 3\"/><circle cx=\"5\" cy=\"5\" r=\"1.2\"/>",
  "label": "Mate árabe",
  "kind": "tactic",
  "scope": "Configuración de mate árabe identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "attackingF2F7": {
  "icon": "<path d=\"M4 5h8M4 19h8M8 5v5M8 19v-5M14 12h7M17 8l4 4-4 4\"/><circle cx=\"8\" cy=\"12\" r=\"2\"/>",
  "label": "Ataque a f2 o f7",
  "kind": "tactic",
  "scope": "Ataque geométrico sobre un peón rival situado en f2 o f7."
 },
 "attraction": {
  "icon": "<path d=\"M5 4v8a7 7 0 0 0 14 0V4M5 8h4V4M15 4v4h4M12 18v4M9 20l3-3 3 3\"/>",
  "label": "Atracción",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "backRankMate": {
  "icon": "<path d=\"M3 4h18M4 9h3v4H4zM10 9h4v4h-4zM17 9h3v4h-3zM3 18h17M17 15l3 3-3 3\"/>",
  "label": "Mate del pasillo",
  "kind": "tactic",
  "scope": "Configuración de mate del pasillo identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "balestraMate": {
  "icon": "<path d=\"M3 20 20 3M3 3h6l-3 6zM15 16l3-5 3 5-3 4zM8 15h7M11 12v7\"/>",
  "label": "Mate Balestra",
  "kind": "tactic",
  "scope": "Configuración de mate balestra identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "blindSwineMate": {
  "icon": "<path d=\"M3 20h8M5 20V9H3V5h3v2h3V5h2v4H9v11M13 20h8M15 20V9h-2V5h3v2h3V5h2v4h-2v11M11 13h2\"/>",
  "label": "Mate de los cerdos ciegos",
  "kind": "tactic",
  "scope": "Configuración de mate de los cerdos ciegos identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "bishopEndgame": {
  "icon": "<g transform=\"translate(-2 1) scale(.85)\"><path d=\"M6 20h12M8 17h8l-1-3c5-5-3-11-3-11s-8 6-3 11zM12 6l-3 5\"/></g><path d=\"M17 8v12M14 20h7M17 8l4 3-4 3\"/>",
  "label": "Final de alfiles",
  "kind": "context",
  "scope": "Solo alfiles como piezas, además de reyes y posibles peones."
 },
 "bodenMate": {
  "icon": "<path d=\"M3 3 21 21M3 21 21 3M6 5l2-3 2 3-2 4zM14 19l2-4 2 4-2 3z\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\"/>",
  "label": "Mate de Boden",
  "kind": "tactic",
  "scope": "Configuración de mate de boden identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "castling": {
  "icon": "<path d=\"M3 19h8M5 19V9H3V5h2v2h4V5h2v4H9v10M15 15l4-3 2 3-2 3zM18 3v6M15 6h6M13 10h-2M13 10l-2-2M13 10l-2 2\"/>",
  "label": "Enroque",
  "kind": "tactic",
  "scope": "Enroque legal disponible en esta posición."
 },
 "enPassant": {
  "icon": "<path d=\"M4 19 19 4M14 4h5v5M3 12h6M3 12l3-3M3 12l3 3\"/><circle cx=\"15\" cy=\"16\" r=\"3\"/><path d=\"M15 19v3M12 22h6\"/>",
  "label": "Captura al paso",
  "kind": "tactic",
  "scope": "Captura al paso legal disponible solo en este turno."
 },
 "capturingDefender": {
  "icon": "<g transform=\"translate(7 0) scale(.65)\"><path d=\"M12 3 20 6v6c0 5-8 9-8 9S4 17 4 12V6z\"/></g><path d=\"M3 19 19 3M14 3h5v5M4 12l8 8M4 20l8-8\"/>",
  "label": "Eliminar al defensor",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "collinearMove": {
  "icon": "<path d=\"M2 12h20M5 8l4 4-4 4M14 8l4 4-4 4\"/><circle cx=\"2\" cy=\"12\" r=\"1\"/><circle cx=\"22\" cy=\"12\" r=\"1\"/>",
  "label": "Movimiento colineal",
  "kind": "tactic",
  "scope": "Jugada legal de una pieza deslizante por su línea compartida con otra pieza rival deslizante."
 },
 "cornerMate": {
  "icon": "<path d=\"M3 3v18h18M7 17l4-7 4 3-2 5M15 6h6M18 3v6\"/><circle cx=\"5\" cy=\"5\" r=\"1.2\"/>",
  "label": "Mate de la esquina",
  "kind": "tactic",
  "scope": "Configuración de mate de la esquina identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "crushing": {
  "icon": "<path d=\"M3 20h18M6 17l5-5 3 2 6-10M15 4h5v5M4 9l3-3 3 3M7 6v9\"/>",
  "label": "Ventaja decisiva",
  "kind": "context",
  "scope": "Valoración de motor de al menos 5 peones; puede cambiar con una búsqueda más profunda."
 },
 "discoveredCheck": {
  "icon": "<path d=\"M3 18h18M5 18 17 6M7 7l4-4 3 3-4 4M16 3h5v5M19 12v5M19 21v.1\"/>",
  "label": "Jaque descubierto",
  "kind": "tactic",
  "scope": "Una jugada legal abre un jaque de otra pieza."
 },
 "doubleBishopMate": {
  "icon": "<path d=\"M3 20 19 4M7 22 22 7M3 10l3-6 3 6-3 4zM13 16l3-6 3 6-3 4z\"/>",
  "label": "Mate de dos alfiles",
  "kind": "tactic",
  "scope": "Configuración de mate de dos alfiles identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "dovetailMate": {
  "icon": "<path d=\"M4 4h5v5H4zM15 4h5v5h-5zM12 11l-6 9h12zM8 16h8M12 4v4\"/>",
  "label": "Mate cola de paloma",
  "kind": "tactic",
  "scope": "Configuración de mate cola de paloma identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "equality": {
  "icon": "<path d=\"M7 8h10M7 14h10M3 5v11a5 5 0 0 0 5 5M1 8l2-3 3 3M21 19V8a5 5 0 0 0-5-5M18 16l3 3 2-3\"/>",
  "label": "Recuperar la igualdad",
  "kind": "context",
  "scope": "Compara dos posiciones evaluadas: el bando que acaba de mover pasa de desventaja a igualdad aproximada."
 },
 "kingsideAttack": {
  "icon": "<path d=\"M3 5h9v14H3zM15 4v5M12 7h6M13 14h8M17 10l4 4-4 4M15 21h6\"/>",
  "label": "Ataque al flanco de rey",
  "kind": "tactic",
  "scope": "Concentración geométrica de presión cerca del rey en el flanco de rey; su ubicación no demuestra enroque."
 },
 "clearance": {
  "icon": "<path d=\"M3 18h18M11 19V4M7 8l4-4 4 4M3 12h4M16 12h5M18 9l3 3-3 3\"/><circle cx=\"11\" cy=\"12\" r=\"2\"/>",
  "label": "Despeje",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "defensiveMove": {
  "icon": "<path d=\"M12 3 20 6v6c0 5-8 9-8 9S4 17 4 12V6z\"/><path d=\"M7 12h9M10 9l-3 3 3 3M16 16V8\"/>",
  "label": "Jugada defensiva",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "deflection": {
  "icon": "<path d=\"M3 12h7c6 0 2-8 10-8M17 2l3 2-1 4M13 13v7M10 17l3 3 3-3\"/>",
  "label": "Desviación",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "discoveredAttack": {
  "icon": "<path d=\"M3 18h18M17 15l4 3-4 3M9 16V4M5 8l4-4 4 4\"/><circle cx=\"9\" cy=\"12\" r=\"2\"/>",
  "label": "Ataque descubierto",
  "kind": "tactic",
  "scope": "Una jugada legal abre el ataque de otra pieza; no garantiza que la combinación gane material."
 },
 "doubleCheck": {
  "icon": "<g transform=\"translate(-3 2) scale(.8)\"><path d=\"M9 20h6M9 17l-2-6 5 2 5-2-2 6zM12 3v7M9 6h6\"/></g><path d=\"M18 4v9M22 4v9M18 17v.1M22 17v.1\"/>",
  "label": "Jaque doble",
  "kind": "tactic",
  "scope": "Dos atacantes dan jaque al mismo rey en la posición actual."
 },
 "endgame": {
  "icon": "<path d=\"M3 14h18M3 19h18M6 14a6 6 0 0 1 12 0M12 2v3M3 6l3 2M21 6l-3 2M9 22h6\"/>",
  "label": "Final",
  "kind": "context",
  "scope": "Fase estimada por material reducido; las excepciones estratégicas requieren interpretación humana."
 },
 "epauletteMate": {
  "icon": "<rect x=\"3\" y=\"9\" width=\"5\" height=\"8\" rx=\"1\"/><rect x=\"16\" y=\"9\" width=\"5\" height=\"8\" rx=\"1\"/><path d=\"M12 3v7M9 6h6M10 20h4M9 13l3 2 3-2-1 5h-4z\"/>",
  "label": "Mate de las charreteras",
  "kind": "tactic",
  "scope": "Configuración de mate de las charreteras identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "exposedKing": {
  "icon": "<path d=\"M12 2v7M9 5h6M7 12l5 3 5-3-2 7H9zM7 22h10M2 9l3 2M22 9l-3 2M2 17l3-1M22 17l-3-1\"/>",
  "label": "Rey expuesto",
  "kind": "tactic",
  "scope": "Patrón de poca cobertura de peones y presión cerca del rey; no prueba un ataque ganador."
 },
 "fork": {
  "icon": "<path d=\"M12 21V12M12 12 4 4M12 12l8-8M3 9V3h6M15 3h6v6\"/>",
  "label": "Tenedor o ataque doble",
  "kind": "tactic",
  "scope": "Una pieza ataca dos o más rivales. La defensa y la legalidad pueden impedir aprovecharlo."
 },
 "hangingPiece": {
  "icon": "<g transform=\"translate(1 8) scale(.7)\"><circle cx=\"12\" cy=\"6\" r=\"3\"/><path d=\"M9 9h6M10 9v5l-4 6h12l-4-6V9\"/></g><path d=\"M2 3h20M17 3v7M14 10h6M17 10v5M14 13l3 3 3-3\"/>",
  "label": "Pieza colgada",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "hookMate": {
  "icon": "<path d=\"M4 3v11a6 6 0 0 0 12 0v-4M12 10h8M15 7h3M17 19h5M19 17v5\"/><circle cx=\"6\" cy=\"6\" r=\"1.3\"/>",
  "label": "Mate del gancho",
  "kind": "tactic",
  "scope": "Configuración de mate del gancho identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "interference": {
  "icon": "<path d=\"M3 5 21 19M3 19 21 5M12 4v16\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\"/>",
  "label": "Interferencia",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "intermezzo": {
  "icon": "<path d=\"M3 12h6M15 12h6M18 9l3 3-3 3M9 3h6v18H9zM12 7v7M12 17v.1\"/>",
  "label": "Jugada intermedia",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "killBoxMate": {
  "icon": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"0\"/><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"0\"/><path d=\"M3 12h5M16 12h5M12 3v5M12 16v5\"/>",
  "label": "Mate kill box",
  "kind": "tactic",
  "scope": "Configuración de mate kill box identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "pillsburysMate": {
  "icon": "<path d=\"M3 20h9M5 20V9H3V5h3v2h3V5h3v4h-2v11M12 19 21 4M15 8l3-5 3 5-3 4z\"/>",
  "label": "Mate de Pillsbury",
  "kind": "tactic",
  "scope": "Configuración de mate de pillsbury identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "morphysMate": {
  "icon": "<path d=\"M3 20 16 7M6 9l3-6 3 6-3 4zM14 20h8M16 20V10h-2V6h3v2h2V6h3v4h-2v10\"/>",
  "label": "Mate de Morphy",
  "kind": "tactic",
  "scope": "Configuración de mate de morphy identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "swallowstailMate": {
  "icon": "<path d=\"M3 5l9 8 9-8-4 16-5-5-5 5zM12 3v5M9 5h6\"/>",
  "label": "Mate cola de golondrina",
  "kind": "tactic",
  "scope": "Configuración de mate cola de golondrina identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "triangleMate": {
  "icon": "<path d=\"M4 20 12 4l8 16zM4 20h16M9 13h6\"/><circle cx=\"4\" cy=\"20\" r=\"2\"/><circle cx=\"12\" cy=\"4\" r=\"2\"/><rect x=\"18\" y=\"18\" width=\"4\" height=\"4\" rx=\"0\"/>",
  "label": "Mate del triángulo",
  "kind": "tactic",
  "scope": "Configuración de mate del triángulo identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "vukovicMate": {
  "icon": "<path d=\"M3 20h9M5 20V9H3V5h3v2h3V5h3v4h-2v11M14 18l3-7 4 2-2 7M14 8l4-5 3 4-4 3\"/>",
  "label": "Mate de Vuković",
  "kind": "tactic",
  "scope": "Configuración de mate de vuković identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "knightEndgame": {
  "icon": "<g transform=\"translate(-2 1) scale(.85)\"><path d=\"M6 20h13l-2-5 2-6-5-6-2 3-6 5 4 3 3-3-2 9M14 8h.01\"/></g><path d=\"M18 9v11M15 20h7M18 9l4 3-4 3\"/>",
  "label": "Final de caballos",
  "kind": "context",
  "scope": "Solo caballos como piezas, además de reyes y posibles peones."
 },
 "long": {
  "icon": "<path d=\"M3 19h5V14h5V9h5V4h3M18 1l3 3-3 3\"/>",
  "label": "Tres jugadas",
  "kind": "context",
  "scope": "Tres jugadas propias en un mate forzado demostrado o en una línea importada legal."
 },
 "master": {
  "icon": "<circle cx=\"12\" cy=\"9\" r=\"6\"/><path d=\"M8 14 6 22l6-4 6 4-2-8M9 9l2 2 4-4\"/>",
  "label": "Partidas de maestros",
  "kind": "metadata",
  "scope": "Dato de origen declarado en una partida importada con al menos un jugador titulado; no deducible del tablero."
 },
 "masterVsMaster": {
  "icon": "<circle cx=\"7\" cy=\"8\" r=\"4\"/><circle cx=\"17\" cy=\"8\" r=\"4\"/><path d=\"M5 12 3 20l4-2 4 2-2-8M15 12l-2 8 4-2 4 2-2-8\"/>",
  "label": "Maestro contra maestro",
  "kind": "metadata",
  "scope": "Dato importado: ambos jugadores declaran un título. No describe la fuerza del motor."
 },
 "mate": {
  "icon": "<g transform=\"translate(-3 0) scale(.85)\"><path d=\"M9 20h6M9 17l-2-6 5 2 5-2-2 6zM12 3v7M9 6h6\"/></g><path d=\"M17 12l5 8M22 12l-5 8\"/>",
  "label": "Jaque mate",
  "kind": "tactic",
  "scope": "Regla exacta: jaque y ausencia de respuesta legal."
 },
 "mateIn1": {
  "icon": "<path d=\"M3 3h18v18H3zM11 7l2-2v13M10 18h6\"/>",
  "label": "Mate en una",
  "kind": "tactic",
  "scope": "Una jugada legal da mate inmediatamente, comprobado por las reglas."
 },
 "mateIn2": {
  "icon": "<path d=\"M3 3h18v18H3zM8 8a4 4 0 0 1 8 0c0 3-8 5-8 10h8\"/>",
  "label": "Mate en dos",
  "kind": "tactic",
  "scope": "Mate forzado en dos jugadas propias, comprobando todas las defensas dentro del presupuesto de búsqueda."
 },
 "mateIn3": {
  "icon": "<path d=\"M3 3h18v18H3zM8 6h6l-3 5h2a3 3 0 0 1 0 7H8\"/>",
  "label": "Mate en tres",
  "kind": "tactic",
  "scope": "Mate forzado en tres jugadas propias, comprobando todas las defensas dentro del presupuesto de búsqueda."
 },
 "mateIn4": {
  "icon": "<path d=\"M3 3h18v18H3zM13 6l-6 8h10M14 6v13\"/>",
  "label": "Mate en cuatro",
  "kind": "tactic",
  "scope": "Mate forzado en cuatro jugadas propias, comprobando todas las defensas dentro del presupuesto de búsqueda."
 },
 "mateIn5": {
  "icon": "<path d=\"M2 3h17v18H2zM14 6H7v5h4a3 3 0 0 1 0 7H7M21 7v7M19 10h4\"/>",
  "label": "Mate en cinco o más",
  "kind": "tactic",
  "scope": "Mate forzado profundo dentro del horizonte disponible. Un límite de búsqueda no prueba que no haya mate."
 },
 "middlegame": {
  "icon": "<circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2\"/>",
  "label": "Medio juego",
  "kind": "context",
  "scope": "Fase estimada entre apertura y final. No existe una frontera reglamentaria entre fases."
 },
 "oneMove": {
  "icon": "<path d=\"M3 19h9V8h9M17 4l4 4-4 4\"/>",
  "label": "Una jugada",
  "kind": "context",
  "scope": "Una jugada propia en un mate forzado demostrado o en una línea importada legal, diferenciadas en la explicación."
 },
 "opening": {
  "icon": "<path d=\"M3 18h18M6 18a6 6 0 0 1 12 0M12 2v7M8 6l4-4 4 4M3 8l3 3M21 8l-3 3\"/>",
  "label": "Apertura",
  "kind": "context",
  "scope": "Fase estimada por número de jugada y material: hasta la jugada 12 con al menos 10 piezas además de peones y reyes."
 },
 "operaMate": {
  "icon": "<path d=\"M3 20V5h18v15M3 5c4 0 3 8 7 8M21 5c-4 0-3 8-7 8M8 20h8M10 20v-5h4v5\"/>",
  "label": "Mate de la ópera",
  "kind": "tactic",
  "scope": "Configuración de mate de la ópera identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "pawnEndgame": {
  "icon": "<g transform=\"translate(-3 0) scale(.9)\"><circle cx=\"12\" cy=\"6\" r=\"3\"/><path d=\"M9 9h6M10 9v5l-4 6h12l-4-6V9\"/></g><path d=\"M18 8v12M15 20h7M18 8l4 3-4 3\"/>",
  "label": "Final de peones",
  "kind": "context",
  "scope": "Solo reyes y al menos un peón."
 },
 "pin": {
  "icon": "<path d=\"M12 21V9M7 9h10M9 3h6v6H9zM4 16h16M9 18l3 3 3-3\"/>",
  "label": "Clavada",
  "kind": "tactic",
  "scope": "Alineación geométrica con una pieza de mayor valor detrás. Distingue clavada absoluta y relativa."
 },
 "promotion": {
  "icon": "<g transform=\"translate(-1 8) scale(.65)\"><circle cx=\"12\" cy=\"6\" r=\"3\"/><path d=\"M9 9h6M10 9v5l-4 6h12l-4-6V9\"/></g><path d=\"M14 19V9M11 12l3-3 3 3M9 3l3 3 3-4 3 4 3-3-2 6h-8z\"/>",
  "label": "Coronación",
  "kind": "tactic",
  "scope": "Coronación legal disponible."
 },
 "queenEndgame": {
  "icon": "<g transform=\"translate(-3 1) scale(.8)\"><path d=\"M5 19h14M7 16 4 7l5 4 3-7 3 7 5-4-3 9z\"/><circle cx=\"4\" cy=\"5\" r=\"1\"/><circle cx=\"12\" cy=\"2\" r=\"1\"/><circle cx=\"20\" cy=\"5\" r=\"1\"/></g><path d=\"M18 10v11M15 21h7M18 10l4 3-4 3\"/>",
  "label": "Final de damas",
  "kind": "context",
  "scope": "Solo damas como piezas, además de reyes y posibles peones."
 },
 "queenRookEndgame": {
  "icon": "<g transform=\"translate(0 1) scale(.6)\"><path d=\"M5 19h14M7 16 4 7l5 4 3-7 3 7 5-4-3 9z\"/><circle cx=\"4\" cy=\"5\" r=\"1\"/><circle cx=\"12\" cy=\"2\" r=\"1\"/><circle cx=\"20\" cy=\"5\" r=\"1\"/></g><g transform=\"translate(10 9) scale(.6)\"><path d=\"M5 20h14M8 20V10L5 8V4h4v3h6V4h4v4l-3 2v10M8 16h8\"/></g><path d=\"M2 21h8M6 17v4\"/>",
  "label": "Final de damas y torres",
  "kind": "context",
  "scope": "Damas y torres, sin alfiles ni caballos, en una posición de material reducido."
 },
 "queensideAttack": {
  "icon": "<path d=\"M12 5h9v14h-9zM3 4l2 3 2-3 2 3 2-3-2 6H5zM3 15h8M7 11l-4 4 4 4M3 22h6\"/>",
  "label": "Ataque al flanco de dama",
  "kind": "tactic",
  "scope": "Concentración geométrica de presión cerca del rey en el flanco de dama; su ubicación no demuestra enroque."
 },
 "quietMove": {
  "icon": "<path d=\"M4 14c2-7 7-10 16-10-1 8-5 14-12 14M4 21 16 8M8 14l6 1M12 10V6\"/>",
  "label": "Jugada tranquila",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "rookEndgame": {
  "icon": "<g transform=\"translate(-2 1) scale(.8)\"><path d=\"M5 20h14M8 20V10L5 8V4h4v3h6V4h4v4l-3 2v10M8 16h8\"/></g><path d=\"M18 10v11M15 21h7M18 10l4 3-4 3\"/>",
  "label": "Final de torres",
  "kind": "context",
  "scope": "Solo torres como piezas, además de reyes y posibles peones."
 },
 "sacrifice": {
  "icon": "<path d=\"M3 16h5l4 4 7-6M3 21h5M11 7l3 3 3-3M14 3v7M8 13h5l2 3\"/><circle cx=\"20\" cy=\"10\" r=\"2\"/>",
  "label": "Sacrificio",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "short": {
  "icon": "<path d=\"M3 19h7V12h7V5h4M17 1l4 4-4 4\"/>",
  "label": "Dos jugadas",
  "kind": "context",
  "scope": "Dos jugadas propias en un mate forzado demostrado o en una línea importada legal."
 },
 "skewer": {
  "icon": "<path d=\"M2 12h20M18 8l4 4-4 4\"/><circle cx=\"8\" cy=\"12\" r=\"4\"/><circle cx=\"16\" cy=\"12\" r=\"2\"/>",
  "label": "Enfilada",
  "kind": "tactic",
  "scope": "Alineación geométrica con una pieza de menor valor detrás; no asegura ganancia tras la respuesta."
 },
 "smotheredMate": {
  "icon": "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"2\"/><path d=\"M7 18h10l-2-4 2-5-4-4-2 2-4 4 3 2 2-2-2 7M4 4v3M20 4v3M4 17v3M20 17v3\"/>",
  "label": "Mate de la coz",
  "kind": "tactic",
  "scope": "Configuración de mate de la coz identificada por geometría en un mate comprobado. Un mismo mate puede reunir varios patrones."
 },
 "superGM": {
  "icon": "<path d=\"M12 2l3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1zM9 12l2 2 4-5\"/>",
  "label": "Grandes maestros de élite",
  "kind": "metadata",
  "scope": "Dato importado: al menos un jugador con título GM y Elo declarado de 2700 o más."
 },
 "trappedPiece": {
  "icon": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 8h18M3 16h18M8 3v18M16 3v18\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>",
  "label": "Pieza atrapada",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "underPromotion": {
  "icon": "<g transform=\"translate(-1 8) scale(.65)\"><circle cx=\"12\" cy=\"6\" r=\"3\"/><path d=\"M9 9h6M10 9v5l-4 6h12l-4-6V9\"/></g><path d=\"M14 20V10M11 13l3-3 3 3M10 8h10M12 8V3h2v2h2V3h2v5\"/>",
  "label": "Subpromoción",
  "kind": "tactic",
  "scope": "Coronación legal a torre, alfil o caballo. La disponibilidad no significa que supere a la dama."
 },
 "veryLong": {
  "icon": "<path d=\"M2 21h4v-4h4v-4h4V9h4V5h4M18 1l4 4-4 4\"/>",
  "label": "Cuatro jugadas o más",
  "kind": "context",
  "scope": "Cuatro o más jugadas propias en un mate forzado demostrado o en una línea importada legal."
 },
 "xRayAttack": {
  "icon": "<path d=\"M2 12h7M15 12h7M18 8l4 4-4 4\"/><rect x=\"9\" y=\"4\" width=\"6\" height=\"16\" rx=\"1\"/><path d=\"M11 12h.1M13 12h.1\"/>",
  "label": "Rayos X",
  "kind": "tactic",
  "scope": "Presión geométrica a través de un bloqueo rival; no se captura a través de la pieza interpuesta."
 },
 "zugzwang": {
  "icon": "<path d=\"M6 4h12M6 20h12M8 4c0 5 8 11 8 16M16 4c0 5-8 11-8 16M3 10v4M21 10v4M1 12h4M19 12h4\"/>",
  "label": "Zugzwang",
  "kind": "tactic",
  "scope": "Candidato táctico revisado con búsqueda limitada. La explicación muestra el motivo y el alcance de la comprobación; no sustituye una revisión completa."
 },
 "mix": {
  "icon": "<path d=\"M3 6h3c6 0 6 12 12 12h3M18 15l3 3-3 3M3 18h3c6 0 6-12 12-12h3M18 3l3 3-3 3\"/>",
  "label": "Mezcla de temas",
  "kind": "metadata",
  "scope": "Preferencia de una colección importada de temas mezclados. No es una táctica del tablero."
 },
 "playerGames": {
  "icon": "<circle cx=\"8\" cy=\"7\" r=\"3\"/><path d=\"M2 20v-3a6 6 0 0 1 12 0v3M15 3h7v18h-5M17 7h3M17 11h3M17 15h3\"/>",
  "label": "Partidas de un jugador",
  "kind": "metadata",
  "scope": "Origen importado que identifica al jugador seleccionado; el nombre debe corresponder a uno de los participantes."
 }
};
function themeIcon(id){
 const key=Object.prototype.hasOwnProperty.call(THEME_META,id)?id:null;
 const body=key?THEME_META[key].icon:'<circle cx="12" cy="12" r="7"/><path d="M12 8v5M12 17v.1"/>';
 return '<svg class="theme-icon" data-theme-icon="'+(key||'unknown')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+body+'</g></svg>';
}
