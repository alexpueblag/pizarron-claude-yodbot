/* Private Apps Script bridge. Empty configuration never claims remote persistence. */
let onlineConfig={endpoint:''},onlineActor=null,onlineRoom=null,onlinePrevious=null,onlineBusy=false,onlineTimer=null,onlineBridge=null,onlineConnecting=null,onlineMessage='Guardado local',onlineSending=false,onlineError=null,onlineEpoch=0;
const ONLINE_KEY='ajedrex-online-v1';
function onlineToken(){const a=new Uint8Array(24);crypto.getRandomValues(a);return Array.from(a,n=>n.toString(16).padStart(2,'0')).join('');}
let onlineState={};
try{onlineState=JSON.parse(localStorage.getItem(ONLINE_KEY)||'{}')||{};}catch(e){}
if(!onlineState.session)onlineState.session=onlineToken();
if(!onlineState.gameId)onlineState.gameId=onlineToken();
if(!Array.isArray(onlineState.outbox))onlineState.outbox=[];
function onlinePersist(){
 try{localStorage.setItem(ONLINE_KEY,JSON.stringify(onlineState));return true;}
 catch(e){onlineMessage='No se puede conservar la cola al cerrar. Exporta tu partida.';return false;}
}
function onlineIsPlaying(){return Boolean(onlineRoom);}
function onlineBlocked(){return Boolean(onlineRoom&&(onlineBusy||onlineRoom.status!=='active'||(game.turn()==='w'?onlineRoom.w:onlineRoom.b)!==onlineActor?.id));}
function onlineAllowsHints(){return !onlineRoom||onlineRoom.allowHints;}
function onlineNewGame(){if(onlineRoom)return;onlineState.gameId=onlineToken();onlineState.sequence=0;onlinePersist();}
function onlineQueueSave(){
 if(onlineRoom||!onlineState.registered)return;
 const item={gameId:onlineState.gameId,revision:(onlineState.sequence||0)+1,snapshot:backupData()};
 onlineState.sequence=item.revision;
 const index=onlineState.outbox.findIndex(x=>x.gameId===item.gameId);
 if(index>=0)onlineState.outbox[index]=item;
 else if(onlineState.outbox.length<20)onlineState.outbox.push(item);
 else{onlineMessage='Hay 20 partidas pendientes. Exporta una copia y reconecta antes de empezar otra.';onlinePaint();return;}
 onlineMessage='Pendiente de guardar en Sheets';onlinePersist();onlinePaint();onlineFlush();
}
function onlinePaint(){
 if(!$('onlineStatus'))return;
 $('onlineStatus').textContent=onlineRoom?(onlineBusy?'Confirmando jugada…':onlineRoom.status==='waiting'?'Sala privada · esperando que ambos estén listos':onlineRoom.status==='finished'?'Partida finalizada · '+onlineRoom.result:'Sala privada · '+(onlineBlocked()?'turno de tu amigo':'tu turno')):onlineMessage;
 if(onlineRoom&&onlineError)$('onlineStatus').textContent+=' · '+onlineErrorText(onlineError);
 if(onlineRoom){$('topName').textContent='Tu amigo';$('bottomName').textContent=onlineActor?.name||'Tú';$('levelTag').textContent='En línea';$('status').textContent=$('onlineStatus').textContent;$('undo').disabled=true;}
}
function onlineErrorText(code){
 return ({NAME:'Escribe un nombre de hasta 60 caracteres.',AUTH:'Tu acceso ya no está activo. Pide una nueva invitación.',INVITE:'La invitación no es válida o caducó.',INVITE_USED:'La invitación ya se usó en otro navegador.',ROOM_FULL:'La sala ya tiene dos jugadores.',FORBIDDEN:'No tienes acceso a esa sala.',CONFLICT:'La partida cambió. Se está recuperando la posición del servidor.',TURN:'Es el turno del otro jugador.',ILLEGAL:'El servidor rechazó esa jugada.',SETUP:'Falta activar el servidor de Ajedrex.',OFFLINE:'Sin conexión. Se conserva el guardado pendiente.',TIMEOUT:'No llegó confirmación. Se conservará el intento para comprobarlo.',SIZE:'La partida supera el tamaño admitido. Exporta el JSON.',STATUS:'La sala todavía no está lista o ya terminó.'})[code]||'No se pudo completar. Conservamos tu partida.';
}
function onlineConnect(){
 if(onlineBridge)return Promise.resolve(onlineBridge);
 if(onlineConnecting)return onlineConnecting;
 const endpoint=onlineConfig.endpoint;
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))return Promise.reject(Error('SETUP'));
 onlineConnecting=new Promise((resolve,reject)=>{
  const channel=onlineToken(),iframe=document.createElement('iframe');iframe.hidden=true;iframe.title='Conexión privada de partidas';iframe.referrerPolicy='no-referrer';iframe.src=endpoint+'?channel='+channel;
  const timer=setTimeout(()=>{window.removeEventListener('message',ready);iframe.remove();onlineConnecting=null;reject(Error('TIMEOUT'));},25000);
  function ready(e){
   if(e.data?.channel!==channel||e.data?.kind!=='ready'||!/^https:\/\/[a-z0-9-]+\.script\.googleusercontent\.com$/.test(e.origin))return;
   clearTimeout(timer);window.removeEventListener('message',ready);onlineBridge={source:e.source,origin:e.origin,channel,iframe};resolve(onlineBridge);
  }
  window.addEventListener('message',ready);document.body.appendChild(iframe);
 });
 return onlineConnecting;
}
async function onlineRequest(payload){
 if(!navigator.onLine)throw Error('OFFLINE');
 const bridge=await onlineConnect(),id=onlineToken();
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{window.removeEventListener('message',receive);reject(Error('TIMEOUT'));},25000);
  function receive(e){
   if(e.source!==bridge.source||e.origin!==bridge.origin||e.data?.channel!==bridge.channel||e.data?.id!==id||e.data?.kind!=='response')return;
   clearTimeout(timer);window.removeEventListener('message',receive);
   if(e.data.result?.ok)resolve(e.data.result.result);else reject(Error(e.data.result?.error||'SERVER'));
  }
  window.addEventListener('message',receive);bridge.source.postMessage({channel:bridge.channel,kind:'request',id,payload:{...payload,session:onlineState.session}},bridge.origin);
 });
}
async function onlineFlush(){
 if(onlineSending||!onlineState.registered||!onlineConfig.endpoint||!onlineState.outbox.length||!navigator.onLine)return;
 onlineSending=true;
 try{
  while(onlineState.outbox.length){
   const item=onlineState.outbox[0];const reply=await onlineRequest({action:'saveSolo',...item});
   if(!reply.saved||reply.revision!==item.revision)throw Error('SERVER');
   onlineState.outbox=onlineState.outbox.filter(x=>!(x.gameId===item.gameId&&x.revision===item.revision));onlinePersist();
  }
  onlineMessage='Partidas confirmadas en Sheets';onlineError=null;
 }catch(e){onlineError=e.message;onlineMessage=onlineErrorText(e.message)+' Guardado pendiente.';}
 finally{onlineSending=false;onlinePaint();}
}
function onlineApply(room){
 if(onlineRoom&&room.id===onlineRoom.id&&room.revision<=onlineRoom.revision)return;
 const c=new Chess(room.startFen);for(const m of room.moves||[])if(!c.move(m))throw Error('POSITION');
 if(c.fen()!==room.fen)throw Error('POSITION');
 if(!onlineRoom){onlinePrevious=backupData();cancelThinking();closeSheet();}
 onlineRoom=room;onlineState.roomId=room.id;onlinePersist();
 game=c;startFen=room.startFen;prefs.mode='local';prefs.flipped=onlineActor.id===room.b;
 if(!room.allowHints)prefs.enabled=[];selected=null;focusAlert=null;cache=null;busy=false;render();
}
async function onlinePoll(){
 if(!onlineRoom||document.hidden||onlineBusy)return;
 if(onlineState.pendingRoom?.roomId===onlineRoom.id){await onlineSendRoom(onlineState.pendingRoom);return;}
 const epoch=onlineEpoch,roomId=onlineRoom.id;
 try{const response=await onlineRequest({action:'get',roomId});if(epoch!==onlineEpoch||onlineRoom?.id!==roomId)return;onlineApply(response.room);onlineError=null;}
 catch(e){if(epoch!==onlineEpoch)return;onlineError=e.message;if(e.message==='AUTH'||e.message==='FORBIDDEN')onlineBusy=true;}
 onlinePaint();
}
function onlineStartPolling(){clearInterval(onlineTimer);onlineTimer=setInterval(onlinePoll,3500);}
function onlineSubmitMove(move){
 if(onlineBlocked())return false;
 const command={action:'move',roomId:onlineRoom.id,revision:onlineRoom.revision,requestId:onlineToken(),move:{from:move.from,to:move.to,...(move.promotion?{promotion:move.promotion}:{})}};
 onlineSendRoom(command);return true;
}
async function onlineSendRoom(command){
 if(onlineBusy)return;
 const epoch=onlineEpoch;
 onlineBusy=true;onlineState.pendingRoom=command;onlinePersist();onlinePaint();
 try{const result=await onlineRequest(command);if(epoch!==onlineEpoch||onlineRoom?.id!==command.roomId)return;onlineState.pendingRoom=null;onlineBusy=false;onlineApply(result.room);onlineError=null;}
 catch(e){if(epoch!==onlineEpoch)return;onlineError=e.message;onlineBusy=false;
  if(!['OFFLINE','TIMEOUT','SERVER','BUSY'].includes(e.message)){onlineState.pendingRoom=null;await onlinePoll();}
 }
 onlinePersist();onlinePaint();if($('onlineRoomPanel'))openOnline();
}
function onlineLeave(){
 if(!onlineRoom)return;onlineEpoch++;clearInterval(onlineTimer);onlineTimer=null;
 const previous=onlinePrevious;onlineRoom=null;onlinePrevious=null;onlineBusy=false;onlineState.lastRoom=onlineState.roomId;delete onlineState.roomId;onlinePersist();
 if(previous)importBackup(previous,{preserveOnlineId:true});else render();queueOpponent();
}
function onlineLink(fields){const u=new URL(location.href);u.search='';u.hash=new URLSearchParams(fields).toString();return u.href;}
function onlineShare(text){
 return navigator.share?navigator.share({title:'Ajedrex · invitación privada',text,url:text}):navigator.clipboard.writeText(text);
}
function openOnline(){
 if(!onlineConfig.endpoint){openSheet('Amigos y guardado automático','<p>El almacén privado en Sheets está preparado. Falta activar la conexión de Apps Script.</p><p>Por ahora tus partidas se guardan en este navegador. No se están enviando a Sheets y las salas en línea aún no están disponibles.</p><button id="onlineExport">Descargar mi partida</button>');$('onlineExport').onclick=exportBackup;return;}
 if(!onlineActor){const invite=new URLSearchParams(location.hash.slice(1));
  openSheet('Entrar con invitación','<p>Elige cómo te verá tu amigo. Tu acceso quedará en este navegador; no borres sus datos si quieres conservarlo.</p><label for="onlineName">Tu nombre</label><input id="onlineName" class="search" maxlength="60" autocomplete="nickname"><button id="onlineJoin" class="primary">Entrar</button><p id="onlineFeedback" role="status"></p>');
  $('onlineJoin').onclick=async()=>{
   const button=$('onlineJoin');button.disabled=true;
   try{
    const payload=invite.has('room')?{action:'join',roomId:invite.get('room'),invite:invite.get('invite'),name:$('onlineName').value}:{action:'register',invite:invite.get('invite'),name:$('onlineName').value};
    const data=await onlineRequest(payload);onlineActor=data.player;onlineState.registered=true;onlinePersist();
    history.replaceState(null,'',location.pathname+location.search);
    if(data.room){onlineApply(data.room);onlineStartPolling();}else onlineQueueSave();
    openOnline();
   }catch(e){if($('onlineFeedback'))$('onlineFeedback').textContent=onlineErrorText(e.message);}
   finally{if(button.isConnected)button.disabled=false;}
  };return;
 }
 if(onlineRoom){
  const r=onlineRoom;
  openSheet('Sala privada','<div id="onlineRoomPanel"><p>'+esc(onlineActor.name)+' · '+(onlineActor.id===r.w?'blancas':'negras')+'</p><p>'+esc(r.status==='waiting'?'Esperando a que ambos estén listos':r.status==='finished'?'Terminó: '+r.result:'Partida en curso')+'</p>'+
   (r.status==='waiting'?'<button id="onlineReady" class="primary">Estoy listo</button>':'')+
   (onlineState.roomInvite&&r.id===onlineState.createdRoom?'<button id="onlineShareRoom">Compartir invitación</button>':'')+
   '<button id="onlineRetry">Actualizar / reintentar</button><button id="onlineBack">Volver a mis partidas locales</button><p id="onlineFeedback" role="status">'+esc(onlineError?onlineErrorText(onlineError):'Cada jugada espera confirmación del servidor.')+'</p></div>');
  if($('onlineReady'))$('onlineReady').onclick=()=>onlineSendRoom({action:'ready',roomId:r.id,revision:r.revision,requestId:onlineToken()});
  if($('onlineShareRoom'))$('onlineShareRoom').onclick=()=>onlineShare(onlineLink({room:r.id,invite:onlineState.roomInvite})).catch(()=>$('onlineFeedback').textContent='No se compartió. Puedes volver a intentarlo.');
  $('onlineRetry').onclick=()=>onlineState.pendingRoom?.roomId===onlineRoom.id?onlineSendRoom(onlineState.pendingRoom):onlinePoll();
  $('onlineBack').onclick=()=>{onlineLeave();closeSheet();};return;
 }
 openSheet('Amigos y mis partidas','<p>Hola, '+esc(onlineActor.name)+'. '+esc(onlineMessage)+'</p>'+
  (onlineActor.role==='owner'?'<p>Crea una sala de dos personas. Jugarás con blancas. La invitación vale 24 horas.</p><label class="drawer-check"><input id="onlineHints" type="checkbox" checked> Permitir ayudas tácticas</label><button id="onlineCreate" class="primary">Crear partida con amigo</button>':'<p>Para jugar juntos, abre el enlace de sala que te comparta el propietario.</p>')+
  '<button id="onlineSync">Reintentar guardado</button><p id="onlineFeedback" role="status"></p>');
 if($('onlineCreate'))$('onlineCreate').onclick=async()=>{
  $('onlineCreate').disabled=true;
  if(!onlineState.createPending)onlineState.createPending={action:'create',roomId:onlineToken(),requestId:onlineToken(),invite:onlineToken(),allowHints:$('onlineHints').checked};
  onlinePersist();
  try{const data=await onlineRequest(onlineState.createPending);onlineState.roomInvite=onlineState.createPending.invite;onlineState.createdRoom=data.room.id;delete onlineState.createPending;onlinePersist();onlineApply(data.room);onlineStartPolling();openOnline();}
  catch(e){if($('onlineFeedback'))$('onlineFeedback').textContent=onlineErrorText(e.message);if($('onlineCreate'))$('onlineCreate').disabled=false;}
 };
 $('onlineSync').onclick=onlineFlush;
}
document.addEventListener('DOMContentLoaded',async()=>{
 onlinePersist();onlinePaint();
 try{const r=await fetch('./online-config.json',{cache:'no-store'});if(r.ok)onlineConfig=await r.json();}catch(e){}
 if(!onlineConfig.endpoint)return;
 try{
  if(onlineState.registered){const response=await onlineRequest({action:'me'});onlineActor=response.player;
   const params=new URLSearchParams(location.hash.slice(1)),roomId=params.get('room')||onlineState.roomId;
   if(roomId){
    let data;
    try{data=await onlineRequest({action:'get',roomId});}
    catch(e){if(params.get('invite'))data=await onlineRequest({action:'join',roomId,invite:params.get('invite'),name:onlineActor.name});else throw e;}
    onlineApply(data.room);onlineStartPolling();history.replaceState(null,'',location.pathname+location.search);
   }
   onlineFlush();
  }else if(location.hash.includes('invite='))openOnline();
 }catch(e){onlineError=e.message;onlineMessage=onlineErrorText(e.message);onlinePaint();}
 setInterval(onlineFlush,15000);
});
window.addEventListener('online',()=>{onlineFlush();onlinePoll();});
