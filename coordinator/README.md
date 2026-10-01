# Coordinador de revisiones · preparado, sin activar

GitHub inicia cada vuelta; los revisores no se llaman entre sí. Cola y decisiones
viven en almacenamiento privado persistente del runner. Claude y OpenAI reciben
el mismo expediente. El primero rota después de cada revisión exitosa; si está
sin cuota, sin conexión o mal configurado, se prueba el segundo. Si ambos fallan,
la revisión sigue pendiente y la siguiente vuelta la reintenta. No existe garantía
de revisión cuando ambos están agotados o GitHub/runner no está disponible.

## Cuentas y consumo

- Claude: CLI oficial instalada por el propietario, con `CLAUDE_CODE_OAUTH_TOKEN`
  generado con `claude setup-token` en una suscripción compatible. El token es
  personal: se configura solo en el entorno privado autorizado, no en comentarios.
- OpenAI: este adaptador usa Responses API, `OPENAI_API_KEY` y
  `OPENAI_REVIEW_MODEL`. Su facturación es independiente de ChatGPT. No consume
  automáticamente el saldo de la sesión de ChatGPT ni implementa un acceso de
  suscripción de Codex. Una alternativa de acceso de suscripción debe verificarse
  para el plan concreto; no se exporta `auth.json` ni se copia la sesión del chat.
- No se han instalado credenciales, contratado servicios ni llamado modelos reales.

## Qué está implementado

`reviewer.py` conserva un ID y hash del expediente, estado pendiente/revisado,
proveedor, resultado y motivos acotados de cada intento en SQLite privado.
La transacción serializa revisiones; un resultado ya confirmado no se recalcula.
Un cambio de expediente necesita un ID nuevo. Ante caída durante la llamada puede
repetirse el cálculo y su coste; ningún adaptador ejecuta acciones de negocio.
Las salidas se validan antes de guardar: resumen, decisiones, próximos pasos,
vacíos de evidencia y necesidad de criterio humano. La revisión no equivale a
aprobación ni ejecución. WhatsApp, Gmail y MOAC no están conectados por este código.

## Integración pendiente y activación

1. Revisar y fusionar el PR. El workflow solo usa main y queda deshabilitado.
2. Instalar un runner privado aislado, etiqueta `yod-review-private`, dedicado a
   código de confianza de este repositorio. No usarlo para PR de terceros. El
   entorno `yod-review` conserva protecciones y autorizaciones del propietario.
3. Preparar `REVIEW_INBOX` y `REVIEW_DB` fuera del checkout, con permisos privados,
   respaldo y persistencia. Cada archivo JSON tiene ID opaco único por snapshot y
   datos mínimos autorizados. Un productor privado debe recoger MOAC, Gmail y las
   fuentes autorizadas; ese productor y el destino privado del resultado faltan.
4. Configurar autenticación Claude y elegir modelo OpenAI/acceso y presupuesto.
   Esto requiere la intervención del propietario; no pegar secretos en el chat.
5. Copiar `review-coordinator.yml` a `.github/workflows/review-coordinator.yml`.
   Tras probar en un entorno privado con datos sintéticos, habilitar la variable
   `REVIEW_COORDINATOR_ENABLED=true`. No habilitarla solo por pasar pruebas locales.
6. La vuelta propuesta es al minuto 17 de cada hora; el corte de las 07:00 requiere
   preparar expedientes antes de esa hora o ajustar el horario. Actions puede
   retrasarse; no es un temporizador exacto. Conservar y conciliar las rutinas
   anteriores antes de sustituirlas. Este PR no cambia el Vigía del portal.

El workflow no está en `.github/workflows` todavía, para no programar una rutina
incompleta. No publica payloads ni respuestas en issues, artifacts o logs públicos;
solo cantidades. La autorización para leer fuentes y comunicar resultados se
configura por separado. Se requieren versiones compatibles de CLI/API y una prueba
real para acreditar la conexión y el relevo; las pruebas de este PR usan dobles.

## Pruebas y reversión

`cd coordinator && python3 -m unittest -v`

Cubren quota→respaldo, éxito sin llamada doble, alternancia, reintentos, ambos
agotados, salida inválida, cambio de expediente y persistencia. Revertir el PR o
poner `REVIEW_COORDINATOR_ENABLED=false` detiene nuevas vueltas y conserva la cola.

## Fuentes oficiales

- https://code.claude.com/docs/en/github-actions
- https://code.claude.com/docs/en/headless
- https://learn.chatgpt.com/docs/auth
- https://learn.chatgpt.com/docs/non-interactive-mode
- https://learn.chatgpt.com/docs/github-action

Cada corrida intenta como máximo cinco snapshots nuevos o pendientes; los terminados no consumen ese límite. El excedente se informa como diferido y permanece para la siguiente corrida. Una interrupción durante una llamada puede consumir tokens de nuevo al reintentar; no realiza acciones de negocio.
