/* Learning overlays and reproducible, explicitly shared bug reports. */
let assistReturnFocus=null,pinArmed=false,pinSnapshot=null,assistSession=null,assistStoreOK=true;
let pinReports=[];
const PIN_KEY='ajedrex-chinches-v1';
function readPinReports(){
 try{const data=JSON.parse(localStorage.getItem(PIN_KEY)||'[]');return Array.isArray(data)?data.filter(r=>r&&r.schema===1&&typeof r.id==='string'&&typeof r.comment==='string'&&r.snapshot&&typeof r.snapshot.fen==='string').slice(0,100):[];}catch(e){assistStoreOK=false;return [];}
}
function savePinReports(){
 try{localStorage.setItem(PIN_KEY,JSON.stringify(pinReports));assistStoreOK=true;return true;}catch(e){assistStoreOK=false;return false;}
}
function focusAlerts(alerts){
 const mode=document.getElementById('focusMode')?.value||'all';
 if(mode==='all')return alerts;
 if(mode==='selected'&&!selected)return alerts;
 return alerts.filter(a=>(a.squares||[]).some(s=>mode==='selected'?s===selected:game.get(s)?.color===mode));
}
function assistPause(){
 if(!assistancePaused){assistReturnFocus=document.activeElement;assistancePaused=true;cancelThinking();}
}
function assistOpen(title,html){
 assistPause();$('assistTitle').textContent=title;$('assistBody').innerHTML=html;
 $('assistOverlay').classList.remove('hidden');document.querySelector('main').inert=true;$('veil').inert=true;
 document.body.style.overflow='hidden';$('assistClose').focus();
}
function assistClose(){
 pinArmed=false;assistSession=null;document.body.classList.remove('pin-armed');
 $('pinButton').textContent='📌 Chinches';$('assistOverlay').classList.add('hidden');
 document.querySelector('main').inert=false;$('veil').inert=false;
 document.body.style.overflow=$('veil').classList.contains('open')?'hidden':'';
 assistancePaused=false;
 if(assistReturnFocus?.isConnected)assistReturnFocus.focus();
 render();queueOpponent();scheduleLiveEvaluation();scheduleTacticalAnalysis();
}
function pinCapture(alert){
 const c=practiceSession?.chess||(reviewPaused&&reviewVisibleFen?new Chess(reviewVisibleFen):game);
 return {appVersion:'0.6',createdAt:new Date().toISOString(),fen:c.fen(),
  context:practiceSession?'practice':reviewPaused?'review':'game',
  lesson:practiceSession?.lesson?.id||null,
  backup:backupData(),pgn:c.pgn(),flipped:prefs.flipped,
  alert:alert?JSON.parse(JSON.stringify(alert)):null,
  analysis:{status:advancedState.status,enabled:[...prefs.enabled]},
  viewport:{width:innerWidth,height:innerHeight},userAgent:navigator.userAgent,
  screenTitle:$('sheetTitle').textContent||'Tablero'};
}
function pinHome(){
 pinSnapshot=pinCapture(focusAlert);assistOpen('Chinches · correcciones',
 '<p>Señala una casilla, un icono o un control y escribe qué esperabas que pasara. La partida se pausa mientras preparas el reporte.</p>'+
 '<div class="btnrow"><button id="pinMark" class="primary">📌 Señalar en pantalla</button><button id="pinGeneral">Comentario general</button></div>'+
 '<p class="small">Los reportes se guardan en este navegador. Para enviarlos, compártelos en el chat o crea la incidencia en GitHub. No se envían automáticamente.</p>'+
 '<h3>Mis chinches ('+pinReports.length+')</h3><div id="pinList">'+
 pinReports.map(r=>'<button class="pin-row" data-pin-id="'+esc(r.id)+'"><strong>'+esc(r.comment.slice(0,85))+'</strong><span>'+esc(r.target?.square||r.target?.label||'General')+' · '+esc(r.createdAt.slice(0,10))+' · '+(r.resolved?'Marcada resuelta':'Pendiente')+'</span></button>').join('')+'</div>'+
 (!assistStoreOK?'<p role="status">El guardado local no está disponible. Descarga tus reportes antes de salir.</p>':''));
 $('pinMark').onclick=pinStartMark;$('pinGeneral').onclick=()=>pinCompose({label:'Comentario general'});
 $('pinList').onclick=e=>{const b=e.target.closest('[data-pin-id]');if(b)pinShow(pinReports.find(r=>r.id===b.dataset.pinId));};
}
function pinStartMark(){
 pinArmed=true;$('assistOverlay').classList.add('hidden');
 document.querySelector('main').inert=false;$('veil').inert=false;document.body.classList.add('pin-armed');
 document.body.style.overflow=$('veil').classList.contains('open')?'hidden':'';
 $('pinButton').textContent='📌 Toca el problema · cancelar';
}
function pinCompose(target){
 pinArmed=false;document.body.classList.remove('pin-armed');$('pinButton').textContent='📌 Chinches';
 assistOpen('Nueva chinche','<p><strong>'+esc(target.square||target.label||'General')+'</strong> · posición guardada al señalar.</p>'+
 '<label for="pinComment">¿Qué pasó y qué debería pasar?</label><textarea id="pinComment" class="search" rows="5" maxlength="2000" placeholder="Ejemplo: este icono dice clavada, pero la pieza sí puede moverse."></textarea>'+
 '<button id="pinSave" class="primary">Guardar chinche</button><p id="pinStatus" role="status"></p>');
 $('pinSave').onclick=()=>{
  const comment=$('pinComment').value.trim();if(!comment){$('pinStatus').textContent='Escribe qué quieres corregir.';return;}
  if(pinReports.length>=100){$('pinStatus').textContent='Hay 100 chinches. Descarga y elimina una antes de agregar otra.';return;}
  const report={schema:1,id:'pin-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),createdAt:new Date().toISOString(),comment,target,snapshot:pinSnapshot,resolved:false};
  pinReports.unshift(report);savePinReports();pinShow(report);
 };
}
function pinText(r,compact=false){
 const s=r.snapshot;
 return '# Ajedrex · '+r.id+'\n\n'+(compact?r.comment.slice(0,400)+(r.comment.length>400?'… (comentario completo en JSON)':''):r.comment)+'\n\n'+
 'Versión: '+s.appVersion+'\nPantalla: '+s.context+' · '+s.screenTitle+'\nElemento: '+(r.target.square||r.target.label||'General')+
 '\nFEN visible: '+s.fen+'\nTema: '+(s.alert?.type||r.target.theme||'ninguno')+
 '\nLección: '+(s.lesson||'ninguna')+'\nTamaño: '+s.viewport.width+' × '+s.viewport.height+
 '\n'+(compact?'Si hace falta reproducir la partida completa, adjunta el JSON descargado desde la chinche.':
 '\nDatos para reproducir:\n~~~json\n'+JSON.stringify(r,null,2)+'\n~~~');
}
function pinBoard(fen,marks=[],lines=[]){
 const c=new Chess(fen),map=boardMap(c);let html='';
 for(let row=0;row<8;row++)for(let col=0;col<8;col++){
  const s=String.fromCharCode(97+col)+(8-row);
  html+='<div class="sq '+((row+col)%2?'dark':'')+(marks.includes(s)?' assist-mark':'')+'" aria-label="'+s+'">'+(map[s]?pieceSVG(map[s]):'')+'<span class="assist-coordinate">'+s+'</span></div>';
 }
 const svg=lines.filter(l=>Array.isArray(l)&&l.length===2&&l.every(s=>/^[a-h][1-8]$/.test(s))).map(([a,b])=>{
  const pos=s=>[(s.charCodeAt(0)-97+.5)*12.5,(8-Number(s[1])+.5)*12.5];
  const [x1,y1]=pos(a),[x2,y2]=pos(b);return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#b05b10" stroke-width="1.5" stroke-dasharray="2 1"/>';
 }).join('');
 return '<div class="assist-boardwrap"><div class="mini-board">'+html+'</div><svg class="assist-lines" viewBox="0 0 100 100" aria-hidden="true">'+svg+'</svg></div>';
}
function pinShow(r){
 if(!r)return;
 assistOpen('Chinche guardada', '<p>'+esc(r.comment)+'</p>'+pinBoard(r.snapshot.fen,r.target.square?[r.target.square]:[])+
 '<p id="pinDelivery" role="status">'+(assistStoreOK?'Guardada en este navegador. Todavía debes compartirla para pedir la corrección.':'No se pudo guardar en este navegador. Descarga o copia el reporte antes de salir.')+'</p>'+
 '<div class="btnrow"><button id="pinShare" class="primary">Compartir reporte</button><button id="pinCopy">Copiar para el chat</button><button id="pinDownload">Descargar JSON</button></div>'+
 '<p><a id="pinGithub" target="_blank" rel="noopener">Abrir incidencia en GitHub</a></p><p class="small">GitHub abrirá un borrador: inicia sesión y pulsa Submit new issue para publicarlo. La incidencia será pública. Volver aquí no confirma su envío.</p>'+
 '<details><summary>Ver todo lo que incluye el reporte</summary><textarea id="pinPayload" class="search" rows="8" readonly></textarea></details>'+
 '<div class="btnrow"><button id="pinResolved">'+(r.resolved?'Reabrir pendiente':'Marcar resuelta')+'</button><button id="pinDelete">Eliminar</button><button id="pinBack">Mis chinches</button></div>');
 const text=pinText(r);$('pinPayload').value=text;
 $('pinGithub').href='https://github.com/alexpueblag/pizarron-claude-yodbot/issues/new?title='+encodeURIComponent('[Ajedrex] '+r.comment.slice(0,70))+'&body='+encodeURIComponent(pinText(r,true));
 $('pinCopy').onclick=async()=>{try{await navigator.clipboard.writeText(text);$('pinDelivery').textContent='Copiado. Pégalo en esta conversación para pedir la corrección.';}catch(e){$('pinPayload').closest('details').open=true;$('pinPayload').focus();$('pinPayload').select();$('pinDelivery').textContent='Mantén pulsado el texto para copiarlo.';}};
 $('pinShare').onclick=async()=>{try{
  const file=new File([JSON.stringify(r,null,2)],r.id+'.json',{type:'application/json'});
  if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'Chinche de Ajedrex',text:r.comment});
  else if(navigator.share)await navigator.share({title:'Chinche de Ajedrex',text});
  else{$('pinCopy').click();return;}
  $('pinDelivery').textContent='Se abrió Compartir. Comprueba el envío en la aplicación elegida.';
 }catch(e){$('pinDelivery').textContent=e.name==='AbortError'?'Compartir cancelado. La chinche se conserva.':'No se pudo compartir. Usa Copiar o Descargar JSON.';}};
 $('pinDownload').onclick=()=>downloadText(r.id+'.json',JSON.stringify(r,null,2),'application/json');
 $('pinResolved').onclick=()=>{r.resolved=!r.resolved;savePinReports();pinShow(r);};
 $('pinDelete').onclick=()=>{if(!window.confirm('¿Eliminar esta chinche de este navegador?'))return;pinReports=pinReports.filter(x=>x.id!==r.id);savePinReports();pinHome();};
 $('pinBack').onclick=pinHome;
}
function addAlertTools(alert){
 const snapshot=pinCapture(alert);const row=document.createElement('div');row.className='btnrow';
 const explore=document.createElement('button');explore.id='exploreAlert';explore.textContent='Explorar paso a paso';explore.onclick=()=>exploreAlert(alert,snapshot);
 const report=document.createElement('button');report.id='reportAlert';report.textContent='📌 Reportar esta alerta';report.onclick=()=>{pinSnapshot=snapshot;pinCompose({theme:alert.type,square:alert.squares?.[0]||null,label:topicById[alert.type].name});};
 row.appendChild(explore);row.appendChild(report);$('sheetBody').appendChild(row);
}
function exploreAlert(alert,snapshot=pinCapture(alert)){
 const c=new Chess(snapshot.fen),positions=[c.fen()],san=[];
 const sequence=alert.variation?.length?alert.variation:alert.move?[alert.move.from+alert.move.to+(alert.move.promotion||'')]:[];
 for(const uci of sequence){
  if(typeof uci!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)||c.game_over())break;
  const move=c.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||'q'});if(!move)break;
  san.push(move.san);positions.push(c.fen());
 }
 assistSession={alert,snapshot,positions,san,index:0};renderExplorer();
}
function renderExplorer(){
 const s=assistSession,a=s.alert;
 assistOpen(topicById[a.type].name+' · explorar',
 '<span class="chip">'+confidenceLabel(a)+'</span><p>'+esc(a.message)+'</p>'+
 pinBoard(s.positions[s.index],s.index===0?(a.squares||[]):[],s.index===0?(a.lines||[]):[])+
 '<p id="exploreStep">'+(s.index===0?'Posición original':s.index+'. '+esc(s.san[s.index-1]))+'</p>'+
 '<div class="btnrow"><button id="explorePrev" '+(!s.index?'disabled':'')+'>← Anterior</button><button id="exploreNext" '+(s.index===s.positions.length-1?'disabled':'')+'>Siguiente →</button></div>'+
 '<p class="small">'+(s.san.length?'Esta es una línea legal de ejemplo. '+(a.proof==='forced-mate'&&s.san.length===(a.variation||[]).length?'El detector comprobó mate frente a las defensas dentro de su búsqueda.':'No demuestra que el rival tenga que responder así ni que ganes material.'):'Este aviso describe relaciones entre las casillas marcadas. No incluye una continuación calculada.')+'</p>'+
 '<p class="small">'+esc(THEME_META[a.type]?.scope||'')+'</p><button id="exploreReport">📌 Reportar esta explicación</button>');
 $('explorePrev').onclick=()=>{s.index--;renderExplorer();};$('exploreNext').onclick=()=>{s.index++;renderExplorer();};
 $('exploreReport').onclick=()=>{pinSnapshot=JSON.parse(JSON.stringify(s.snapshot));pinSnapshot.fen=s.positions[s.index];pinSnapshot.context='explorer';pinSnapshot.explorerStep=s.index;pinCompose({theme:a.type,label:topicById[a.type].name});};
}
document.addEventListener('DOMContentLoaded',()=>{
 pinReports=readPinReports();$('pinButton').onclick=()=>pinArmed?assistClose():pinHome();$('assistClose').onclick=assistClose;
 $('focusMode').onchange=()=>{focusAlert=null;render();};
 document.addEventListener('click',e=>{
  if(!pinArmed||e.target.closest('#pinButton'))return;
  e.preventDefault();e.stopImmediatePropagation();
  const el=e.target.closest('[data-square],[data-practice-square],[data-alert-type],[data-active-theme],button,input,select,a')||e.target;
  const r=el.getBoundingClientRect(),square=el.dataset.square||el.dataset.practiceSquare||el.dataset.alertSquare||null;
  pinCompose({square,theme:el.dataset.alertType||el.dataset.activeTheme||null,id:el.id||null,label:(el.getAttribute('aria-label')||el.textContent||el.tagName).trim().slice(0,180),point:{x:r.width?(e.clientX-r.left)/r.width:0,y:r.height?(e.clientY-r.top)/r.height:0}});
 },true);
 document.addEventListener('pointerdown',e=>{if(pinArmed&&!e.target.closest('#pinButton'))e.stopImmediatePropagation();},true);
 document.addEventListener('keydown',e=>{
  if(!assistancePaused)return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();assistClose();return;}
  if(e.key==='Tab'&&!$('assistOverlay').classList.contains('hidden')){
   const nodes=[...$('assistOverlay').querySelectorAll('button,input,select,textarea,summary,a[href]')].filter(n=>!n.disabled&&n.offsetParent!==null),first=nodes[0],last=nodes[nodes.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   e.stopImmediatePropagation();
  }
 },true);
});
