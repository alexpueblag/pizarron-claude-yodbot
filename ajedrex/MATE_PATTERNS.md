# Patrones de mate de Ajedrex

Los 19 temas del grupo «Patrones de mate» tienen detección. La condición previa siempre es un jaque mate reglamentario comprobado por chess.js: una coincidencia de piezas nunca basta. La búsqueda reconoce la posición actual y, si se habilita, jugadas legales que dan mate en una. No predice estos patrones a varias jugadas de distancia.

Los nombres ajedrecísticos admiten variantes y solapamientos. Esta implementación reconoce las geometrías concretas de la tabla y prefiere omitir una variante no demostrada a poner una etiqueta incorrecta. No pretende clasificar exhaustivamente toda composición imaginable.

| Tema | Criterio implementado |
| --- | --- |
| `anastasiaMate` — Mate de Anastasia | Rey en un borde, fuera de la esquina, torre o dama dando jaque por ese borde, caballo a tres casillas hacia el interior y una pieza propia a una casilla del rey. |
| `arabianMate` — Mate árabe | Rey en la esquina, torre adyacente protegida por un caballo situado dos filas y dos columnas hacia el interior. |
| `backRankMate` — Mate del pasillo | Torre o dama da jaque por la última fila del rey y todas las salidas hacia delante están ocupadas por piezas propias. |
| `balestraMate` — Mate Balestra | Alfil da mate; una dama a salto de caballo del rey cubre todas las salidas restantes junto al alfil. |
| `blindSwineMate` — Mate de los cerdos ciegos | Una torre adyacente da jaque, y la segunda está al lado de ella perpendicularmente al jaque: las dos torres forman un bloque 2×2 con el rey. |
| `bodenMate` — Mate de Boden | Dos alfiles de distinto color de casilla cierran las salidas por diagonales cruzadas, desde lados opuestos del rey, con al menos un bloqueo propio. |
| `cornerMate` — Mate de la esquina | Un caballo da mate en la esquina; torre o dama cierra dos salidas y una pieza propia bloquea la tercera. |
| `doubleBishopMate` — Mate de dos alfiles | Dos alfiles de distinto color de casilla cierran las salidas desde el mismo cuadrante, con al menos un bloqueo propio. |
| `dovetailMate` — Mate cola de paloma | Dama protegida en diagonal inmediata al rey; las dos casillas que la dama no alcanza están bloqueadas por piezas propias. |
| `epauletteMate` — Mate de las charreteras | Dama o torre da jaque ortogonal, con piezas propias inmediatamente a ambos lados del rey, perpendicularmente a la línea de jaque. |
| `hookMate` — Mate del gancho | Torre adyacente protegida por caballo adyacente al rey; un peón protege al caballo y cubre otra salida; un peón rival bloquea al rey. |
| `killBoxMate` — Mate kill box | Dama y torre en esquinas opuestas de un cuadro 3×3, rey dentro del cuadro, centro libre o con el rey y ambas piezas cerrando salidas distintas. |
| `pillsburysMate` — Mate de Pillsbury | Torre a distancia da mate a un rey en el borde; alfil cierra una salida exclusiva y una pieza propia del rey bloquea otra. |
| `morphysMate` — Mate de Morphy | Alfil da mate a un rey en el borde; una torre cierra al menos dos salidas y una pieza propia bloquea otra. |
| `swallowstailMate` — Mate cola de golondrina | Dama protegida ortogonalmente adyacente al rey interior; dos piezas propias ocupan las diagonales de atrás que la dama no controla. |
| `triangleMate` — Mate del triángulo | Dama y torre en las dos diagonales inmediatas de un mismo lado del rey; la dama da jaque protegida por la torre. |
| `vukovicMate` — Mate de Vuković | Rey, torre y caballo alineados en tres casillas consecutivas: torre protegida por una tercera pieza y caballo cerrando las dos salidas laterales del rey. |
| `operaMate` — Mate de la ópera | Torre adyacente da mate protegida directamente por un alfil que también cierra una salida. |
| `smotheredMate` — Mate de la coz | Caballo da jaque y todas las casillas contiguas del rey están ocupadas por piezas de su propio bando. |

## Integración

Cargar `mate-patterns.js` después de `tactics.js` y `vendor/chess.js`. `detectMatePatterns(chess, options)` devuelve alertas `{type,squares,message,lines,move,confidence}` y conserva FEN e historial de la partida. `confidence: 'verified'` significa que se comprobaron tanto el mate legal como el criterio geométrico indicado; no significa que se hayan calculado mates futuros más largos.

- `includeThreats: false`: solo clasifica un mate que ya está sobre el tablero.
- `matingMoves: [...]`: reutiliza una lista previa de jugadas legales de mate en una; una lista vacía evita cualquier búsqueda. Las jugadas se vuelven a aplicar y validar antes de etiquetarlas.
- `legal: [...]`: opcional; reutiliza jugadas legales si se necesita buscar el mate en una.

La búsqueda se ejecuta una sola vez por posición. La integración debe pasar las jugadas `mateIn1` ya calculadas, preferiblemente dentro del trabajador de análisis. La detección inspecciona únicamente movimientos del bando al turno.

## Verificación

`tests/mate-patterns.test.cjs` ejecuta 128 comprobaciones: 19 mates positivos, los mismos patrones con colores cambiados y reflejados en archivos, negativos retirando una pieza que cumple una función necesaria, variantes legalmente alcanzables en una jugada, rechazo de mates sugeridos falsos, cierre por cincuenta jugadas y triple repetición y conservación de la partida. Cada posición positiva se compara además contra todos los otros nombres de patrón para impedir confundir, por ejemplo, Árabe, Anastasia, Vuković y Gancho por tener torre y caballo. Cinco negativos adicionales mantienen un mate real y el material esperado, pero cambian la función de las piezas para comprobar que no basta su presencia. Se prueba también la variante de kill box que termina con jaque de torre.

Los ejemplos son composiciones mínimas propias y sus jugadas de entrada se comprueban legalmente. La implementación usa las reglas del movimiento de las piezas y geometría escrita para Ajedrex, sin dependencia de servicios ni motores remotos.

Referencias terminológicas: catálogo de temas de [Lichess](https://github.com/lichess-org/lila/blob/master/translation/source/puzzleTheme.xml) y geometrías documentadas en [ChessMatingPatterns](https://github.com/Dirkster99/ChessMatingPatterns). No se incorporó código Python de estos proyectos.
