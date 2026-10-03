
(function(){
 function show(message){const el=document.getElementById('boot');if(el){el.classList.remove('hidden');el.classList.add('errorBanner');el.textContent=message;}}
 window.addEventListener('error',()=>show('No se pudo cargar el tablero completo. Recarga la página en Safari. Si persiste, conserva el error de la consola para revisar la instalación.'));
 window.addEventListener('unhandledrejection',()=>show('Una operación no pudo completarse. Si el tablero sigue visible, puedes conservar tu partida desde Partida → Exportar partida.'));
 document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('board');if(!b||!b.children.length)show('Faltan archivos del juego o JavaScript está bloqueado. Abre la dirección web publicada; el enlace al código de GitHub no ejecuta el juego.');});
})();
