# Ajedrex · Apps Script + Sheets

## Estado de esta entrega
Código implementado para pruebas aisladas. Sheet creado y estructurado en la cuenta del propietario. **Backend no desplegado**: la conexión de este chat permite crear y editar Sheets, pero no crear proyectos ni versiones/deployments de Apps Script. El archivo online-config.json tiene endpoint vacío intencionalmente. La app lo explica y sigue funcionando localmente.

No se afirma guardado remoto ni juego entre dos teléfonos hasta comprobar el deployment real. No se modificaron los accesos ni el catálogo del portal corporativo.

## Activación inicial (una sola vez)
1. En el Sheet privado creado para Ajedrex: Extensiones → Apps Script.
2. Sustituir Code.gs por el archivo [Code.gs](Code.gs) de esta carpeta. Es un único archivo con las reglas de chess.js, el contrato probado y el adaptador de Google. Guardar. No copiar solo core.js.
3. Ejecutar **instalarAjedrex_** desde el editor. Autorizar los permisos de Google sobre las hojas y el menú del documento. Regresar al Sheet y recargar para ver el menú Ajedrex.
4. Implementar → Nueva implementación → Aplicación web. Ejecutar como **tú**. Acceso **Cualquier persona**. El endpoint es públicamente alcanzable pero cada operación exige una invitación/sesión; la hoja permanece privada. Es un servicio nuevo y por eso requiere su primer deployment.
5. Conservar la URL terminada en **/exec** y conectarla en **online-config.json** (endpoint). Publicar el cambio y subir la versión de caché en sw.js. Nunca publicar el ID de la hoja, secretos, sesiones ni enlaces de invitación en el repositorio.
6. En el Sheet, menú Ajedrex → **Crear mi acceso de propietario**. Abrir el enlace en el navegador habitual; elegir nombre. El enlace se consume una vez y caduca a los 7 días.
7. Para jugar solo, el menú del Sheet **Invitar a un amigo** genera una invitación individual. Para jugar juntos: desde la app, Menú → Amigos y guardado → Crear partida; compartir su enlace. El propietario juega blancas y el invitado negras. Ambos pulsan Estoy listo. La invitación de sala dura 24 horas.
8. Antes de darlo por operativo, verificar con dos navegadores independientes: registro, espera de ambos listos, movimientos alternados, desconexión/reintento y lectura de la fila correspondiente en Sheets. Usar partidas de prueba identificables, nunca datos de los otros boards.

## Actualizaciones
En un deployment ya existente: **Administrar implementaciones → Editar → Versión nueva**. Conservar ID y URL. Guardar una versión conocida para reversión. El editor guardado no demuestra que el deployment ejecute esa versión.

## Guardado y consistencia
- Jugadores, invitaciones y partidas tienen ID estable; los secretos se guardan como hash en el servidor.
- Una fila JSON por partida es la fuente autoritativa. Un LockService global serializa las operaciones. Cada movimiento comprueba jugador, turno, legalidad, versión e idempotencia.
- Dos jugadas con la misma versión no se aplican dos veces. Repetir exactamente una petición con respuesta perdida devuelve el estado ya confirmado.
- El alta y la reserva de invitación/asiento tocan filas distintas: no hay transacción multihoja. Se reserva el acceso primero y un reintento con el mismo secreto completa un fallo parcial. No generar otra identidad al reintentar.
- Contra la máquina, la cola conserva el último estado por partida (incluidos deshacer y ajustes). Hasta 20 partidas pendientes; el límite se informa. No borrar el navegador mientras haya pendientes. Solo una confirmación del servidor retira el elemento correspondiente.
- En línea, no hay jugadas optimistas ni movimientos nuevos sin conexión. Se conserva y reintenta la petición pendiente. Consultar ayudas o abrir un menú local no pausa el dispositivo del amigo.
- La Bitacora registra instalación/mantenimiento; el historial completo de movimientos vive en Partidas. No se promete auditoría transaccional multihoja.
- La identidad es del navegador. Cambiar de teléfono necesita una nueva invitación; recuperación y sincronización de identidad entre dispositivos aún no se incluyen.
- La app muestra el estado de preparación cuando falta endpoint. Los archivos estáticos públicos no son privados: la protección aplica al servidor y a los datos de cada partida.

## Pruebas y límites
Las pruebas de contrato usan un almacén sintético; las de navegador simulan respuestas para confirmar cola y turnos. No acreditan OAuth, HtmlService ni permisos de un deployment real. Ese recorrido se verifica después de la activación.
La autenticación del iframe exige nonce, origen Google esperado y la ventana que completó el handshake; el servidor valida la sesión en cada solicitud. No se usa JSONP ni una clave incrustada en JavaScript.
Apps Script tiene cuotas y latencia: esta versión es para pocas partidas casuales, con consulta cada 3,5 segundos, sin reloj competitivo.
