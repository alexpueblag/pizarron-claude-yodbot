/* A single searchable drawer; move and inspect are explicit, separate gestures. */
function openNavigation(){
 const actions=[
 ['resume','♟','Volver al tablero','Continuar la partida'],
 ['friends','♧','Amigos y guardado','Invitaciones, salas privadas y respaldo'],
 ['helps','☷','Ayudas e iconos','Encender o apagar cada táctica · '+prefs.enabled.length+' activas'],
 ['practice','◇','Practicar','60 temas con prácticas guiadas'],
 ['review','▥','Analizar partida','Revisar jugadas, ventaja y capturas'],
 ['settings','⚙','Partida y rival','Nivel, color, girar tablero, importar y exportar'],
 ['catalog','▤','Catálogo de tácticas','Significado de los 81 símbolos'],
 ['pins','📌','Chinches y correcciones','Señalar un problema o consultar tus reportes'],
 ['backup','↓','Descargar copia','Conservar partida, preferencias y progreso']
 ];
 assistOpen('Tu espacio de ajedrez',
 '<p class="drawer-status">'+(typeof onlineIsPlaying==='function'&&onlineIsPlaying()?'En línea, abrir el menú no pausa la partida de tu amigo.':'Tu partida queda pausada mientras usas este menú.')+'</p>'+
 '<label for="menuSearch" class="small">Buscar una opción</label><input id="menuSearch" class="search" type="search" placeholder="Ayudas, nivel, prácticas…" autocomplete="off">'+
 '<div class="drawer-actions">'+actions.map(([id,icon,title,desc])=>'<button class="drawer-action" data-nav="'+id+'"><span aria-hidden="true">'+icon+'</span><span><strong>'+title+'</strong><small>'+desc+'</small></span><span aria-hidden="true">›</span></button>').join('')+'</div><p id="menuEmpty" class="hidden" role="status">No hay opciones con ese nombre.</p>'+
 '<details class="drawer-settings" open><summary>Ajustes rápidos</summary>'+
 '<label class="drawer-control" for="menuInteraction">Al tocar el tablero</label><select id="menuInteraction" class="fieldselect"><option value="play">Jugar: mover piezas</option><option value="inspect">Consultar: explicar alertas</option></select>'+
 '<label class="drawer-control" for="menuFocus">Mostrar pistas de</label><select id="menuFocus" class="fieldselect"><option value="all">Toda la posición</option><option value="selected">La pieza seleccionada</option><option value="w">Piezas blancas</option><option value="b">Piezas negras</option></select>'+
 '<label class="drawer-check"><input id="menuLines" type="checkbox"> Mostrar líneas tácticas</label>'+
 '<p class="small">Los iconos siguen visibles al jugar. Para abrirlos, cambia a Consultar alertas.</p></details><p id="menuStatus" role="status"></p>');
 $('assistOverlay').classList.add('drawer-mode');$('menuButton').setAttribute('aria-expanded','true');
 $('assistClose').setAttribute('aria-label','Cerrar menú lateral');
 $('menuInteraction').value=boardInspect?'inspect':'play';$('menuFocus').value=$('focusMode').value;$('menuLines').checked=prefs.lines;
 $('menuInteraction').onchange=()=>setBoardMode($('menuInteraction').value==='inspect');
 $('menuFocus').onchange=()=>{$('focusMode').value=$('menuFocus').value;focusAlert=null;render();};
 $('menuLines').onchange=()=>{prefs.lines=$('menuLines').checked;save();render();};
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 $('menuSearch').oninput=()=>{const q=normalize($('menuSearch').value.trim());let visible=0;
  $('assistBody').querySelectorAll('[data-nav]').forEach(b=>{const match=normalize(b.textContent).includes(q);b.hidden=!match;if(match)visible++;});
  $('menuEmpty').classList.toggle('hidden',visible!==0);
 };
 $('assistBody').onclick=e=>{
  const b=e.target.closest('[data-nav]');if(!b)return;
  const action=b.dataset.nav;
  if(action==='backup'){try{exportBackup();$('menuStatus').textContent='Copia preparada. Guárdala en Archivos o iCloud Drive.';}catch(error){$('menuStatus').textContent='No se pudo descargar. Abre Partida para copiar el PGN.';}return;}
  if(action==='review'&&!game.history().length){$('menuStatus').textContent='Haz alguna jugada para poder analizar la partida.';return;}
  assistClose();
  const routes={friends:openOnline,resume:()=>{},helps:openHelps,practice:openLessons,review:openGameReview,settings:openSettings,catalog:openCatalog,pins:pinHome};
  routes[action]?.();
 };
}
document.addEventListener('DOMContentLoaded',()=>{
 $('menuButton').onclick=openNavigation;
 $('moveMode').onclick=()=>setBoardMode(false);$('inspectMode').onclick=()=>setBoardMode(true);
 $('assistOverlay').addEventListener('click',e=>{if(e.target===$('assistOverlay')&&$('assistOverlay').classList.contains('drawer-mode'))assistClose();});
});
