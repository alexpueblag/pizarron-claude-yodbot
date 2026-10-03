# Contextos e iconos de Ajedrex

Los 81 temas tienen un dibujo SVG original, distinto, que acompaña siempre a su nombre. Son recordatorios visuales del concepto, no una notación internacional de ajedrez. Los SVG no dependen de fuentes ni de emojis.

## API de presentación

Cargar `catalog.js` y `theme-ui.js` antes de la interfaz.

- `THEME_META[id]`: `{icon, label, kind, scope}`. `icon` es el cuerpo SVG; `label` reproduce el nombre del catálogo.
- `themeIcon(id)`: SVG con clase `theme-icon`, atributo `data-theme-icon`, color heredado y dibujo vectorial. Es decorativo (`aria-hidden`); el botón o elemento contenedor debe proporcionar el nombre visible y su etiqueta accesible.
- `kind`: `tactic` para motivos del tablero, `context` para fase/material/evaluación/longitud, `metadata` para origen y selección. `scope` explica los límites de cada tema.

Los cinco temas de origen/selección no se pueden averiguar examinando las piezas: maestros, maestro contra maestro, élite, partidas de un jugador y mezcla de temas. Tener su interruptor encendido permite mostrar esos datos cuando existen; no inventa un origen para una partida local.

## API de contexto

Cargar `vendor/chess.js` y `context-tactics.js`.

`detectContextTactics(chess, options)` devuelve alertas con `{type, squares, message, lines, move, confidence}`. `confidence` es `pattern`, `candidate` o `context`. No modifica la partida.

Opciones:

- `evaluation`: `{method:'engine', cpWhite:number, fen?:string}`. La puntuación está en centipeones desde el punto de vista de blancas. No se acepta el balance material como evaluación estratégica. Si contiene FEN debe corresponder a la posición actual.
- `previousEvaluation`: misma estructura. Para «recuperar la igualdad», **ambas evaluaciones requieren FEN**; la anterior debe corresponder a la posición anterior a la última jugada del historial real. Se exige desventaja previa de al menos 100 centipeones del bando que movió y valoración actual absoluta de como máximo 35.
- `tacticalAlerts`: alertas del detector de mates. Solo `proof:'forced-mate'` con `mateDistance` entero positivo acredita longitud de un mate forzado. Una variante principal del motor no basta.
- `metadata`: objeto validado con el esquema siguiente.

Las fases son heurísticas explícitas. Final: hasta seis piezas que no sean peones/reyes, sin damas o con un máximo de cuatro de esas piezas. Apertura: hasta jugada 12 y al menos diez piezas además de peones/reyes, si no es final. En los demás casos, medio juego. Los subtipos de final sí describen la composición material exacta. Ventaja: entre 150 y 499 centipeones; ventaja decisiva: al menos 500. Estos umbrales no garantizan el resultado.

Los ataques a flancos y el rey expuesto describen presión geométrica y cobertura. La casilla del rey no demuestra que se haya enrocado. Una pieza clavada puede ejercer presión geométrica sin poder capturar legalmente; la explicación lo indica.

## Metadatos importados, versión 1

`validateThemeMetadata(value)` devuelve una copia acotada y saneada, o `null` si encuentra datos inválidos. Se descartan campos desconocidos, incluido cualquier supuesto `verified`. No se consulta ninguna identidad ni Elo en línea.

```json
{
  "schemaVersion": 1,
  "source": {
    "kind": "game",
    "name": "Nombre de la partida o colección",
    "url": "https://example.com/game"
  },
  "players": {
    "white": {"name": "Ana", "title": "GM", "rating": 2800},
    "black": {"name": "Bea", "title": "IM", "rating": 2450}
  },
  "player": "Ana",
  "solution": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "moves": ["e2e4", "e7e5", "g1f3"]
  }
}
```

Todos los campos excepto `schemaVersion` son opcionales. Límites: nombre de fuente 120 caracteres; nombres de jugador 80; URL HTTP(S) 2048; Elo entero de 0 a 4000; títulos GM, IM, FM, CM, WGM, WIM, WFM y WCM; solución de 1 a 200 medias jugadas UCI. Las cifras y títulos siguen siendo **datos declarados**, aunque la estructura sea válida.

- Origen de maestros requiere `source.kind:'game'` y uno o ambos títulos declarados.
- Élite requiere un participante con título GM y Elo declarado de al menos 2700.
- Partidas de un jugador requiere que `player` coincida, sin distinguir mayúsculas, con uno de los nombres de participantes.
- Mezcla requiere `source.kind:'collection'` y `collection:{"mixed":true}`. Tener dos alertas tácticas simultáneas no convierte una partida en una colección mixta.
- La solución importada se reproduce **completa y legalmente**. Solo se muestra su longitud restante cuando la posición coincide y mueve el bando que empezó esa solución. Cuenta jugadas propias: 1, 2, 3, 4 o más. Se identifica como «línea importada legal» y se aclara que eso **no demuestra que sea forzada ni ganadora**.
- Las banderas de verificación importadas no acreditan mates ni longitudes forzadas.

Las alertas sin casillas se presentan como etiquetas junto al tablero o en la lista. No deben colocarse en una casilla arbitraria.

## Verificación

`tests/context-themes.test.cjs` incluye positivos y negativos de los 26 contextos, todas las fases/subtipos de final, presión en ambos flancos, peones f2/f7, legalidad de candidatos colineales, igualdad desde ambos bandos, evaluaciones obsoletas, metadatos inválidos y líneas importadas ilegales. Comprueba los 81 iconos distintos y su independencia de fuentes.
