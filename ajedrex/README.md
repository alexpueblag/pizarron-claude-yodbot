# Ajedrex

Proyecto personal de hobby de **alexpueblag** para aprender ajedrez mediante pistas visuales configurables. No requiere servidor de partidas, cuentas ni API de pago.

## Jugar

Juega en GitHub Pages: https://alexpueblag.github.io/pizarron-claude-yodbot/ajedrex/

El enlace al repositorio muestra el código; la dirección anterior abre el juego.

En iPhone, abrir esa dirección en **Safari**. Tocar origen y destino o arrastrar una pieza. En **Partida**, elegir rival y dificultad. Usar **Compartir → Añadir a pantalla de inicio** para crear un acceso. La primera carga necesita internet; el indicador inferior confirma cuando el navegador terminó de preparar los archivos sin conexión. iOS puede eliminar datos de sitios por espacio o configuración.

## Qué incluye

- Reglas legales con chess.js 0.13.4: jaque, mate, enroque, captura al paso y cuatro promociones.
- GarboChess incluido localmente, cinco niveles de tiempo/profundidad; iniciación intercala jugadas aleatorias. No son niveles Elo certificados.
- Respuesta del rival con al menos 900 ms de espera visible, animación de 220 ms, toque y arrastre.
- Piezas SVG propias, sin depender de la fuente o los emojis del dispositivo.
- Barra blanca y negra de ventaja, calculada por el motor en segundo plano; valor aproximado en unidades de peón desde blancas.
- Capturas visibles junto a cada jugador, con dibujos, cantidades y balance del material que queda.
- Evaluación final con evolución de la ventaja, momentos para aprender y posiciones/alternativas que puedes revisar sin cambiar la partida. También se puede abrir durante el juego; el rival se pausa mientras revisas.
- 18 ayudas automáticas; catálogo de 81 fichas (75 temas de Lichess más seis ayudas propias).
- Seis ejemplos, guardar en el navegador, exportar/importar JSON y copiar PGN.
- Caché sin conexión mediante service worker, limitada a esta carpeta.

## Cómo se interpreta la evaluación

La parte blanca crece cuando el motor estima ventaja de blancas y la negra cuando favorece a negras. El signo siempre se refiere a blancas, incluso al girar el tablero. Si el motor no está disponible se indica expresamente que el dato es solo balance de material. El mate y las tablas prevalecen sobre esa estimación.

El informe usa búsquedas breves de GarboChess por posición. Agrupa caídas aproximadas de evaluación en estable (<0,4 peones), imprecisión (0,4–0,99), error (1–2,49) y error importante (≥2,5); las líneas de mate se tratan por separado. No estima el Elo ni una precisión certificada. Una búsqueda corta puede no comprender un sacrificio o una combinación profunda. Cada alternativa se valida como jugada legal.

Las capturas se cuentan desde el historial real, incluyendo captura al paso y piezas coronadas. Una posición de ejemplo sin historial no inventa capturas a partir de sus piezas ausentes. El balance de material se calcula del tablero actual, con valores convencionales de peón 1, caballo/alfil 3, torre 5 y dama 9.

## Lo que falta

Stockfish, detección automática de todas las combinaciones avanzadas, banco completo de ejercicios, Elo calibrado, pruebas en iPhone físico y sincronización entre dispositivos. El catálogo identifica las fichas sin detector. Una figura táctica no garantiza ganar material; las líneas de ataque/defensa son geométricas y una clavada puede impedir una recaptura.

## Que no se pierda

**Código:** esta carpeta y su historial de Git preservan los archivos; se puede clonar o descargar el repositorio. **Partidas:** permanecen en este navegador, no se suben a GitHub. Usa **Partida → Exportar partida** y guarda el JSON en Archivos/iCloud Drive. La importación valida las jugadas antes de sustituir la partida actual.

## Ejecutar localmente

Desde esta carpeta:

```sh
python3 -m http.server 4173
```

Abrir http://localhost:4173. No se necesita instalar paquetes para jugar. Los workers y la caché requieren una dirección HTTP local o HTTPS, no abrir index.html mediante file://.

## Pruebas

```sh
node --test tests/*.test.cjs
npm install --ignore-scripts
npx playwright install --with-deps webkit chromium
npm run test:webkit
```

La suite WebKit usa dimensiones y gestos de iPhone 13; no reemplaza la prueba en un teléfono físico. El workflow de GitHub corre las pruebas y guarda reporte/capturas. Consulta AUDITORIA.md para alcance y hallazgos.

## Estructura

- index.html, styles.css, app.js: interfaz y estados de la partida.
- tactics.js, catalog.js: detectores, explicaciones y ejemplos.
- vendor/: motores/reglas y sus avisos de licencia.
- engine-worker.js: jugadas del rival fuera del hilo de la interfaz.
- insights.js, review-worker.js: material, ventaja y revisión en un worker independiente.
- sw.js, manifest.webmanifest, icon.svg: instalación web y caché.
- tests/: reglas, regresiones, interacción simulada y WebKit.

## Licencias

chess.js conserva su licencia BSD de dos cláusulas. GarboChess conserva su licencia BSD de tres cláusulas. Sus avisos están en el código y en THIRD_PARTY_NOTICES.txt. Las formas SVG de las piezas son originales para este proyecto; no se copian los recursos de chess.com. Los textos del catálogo están redactados en español a partir de los temas de Lichess, cuya fuente se cita en la aplicación. No se ha elegido una licencia general de redistribución para el código propio.
