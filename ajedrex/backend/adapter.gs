/* Bound to the private Ajedrex spreadsheet. All remote writes go through ajedrexRpc. */
const AJEDREX_SITE_='https://alexpueblag.github.io/pizarron-claude-yodbot/ajedrex/';
const AJEDREX_ORIGIN_='https://alexpueblag.github.io';
function onOpen(){SpreadsheetApp.getUi().createMenu('Ajedrex').addItem('Instalar / verificar estructura','instalarAjedrex_').addItem('Crear mi acceso de propietario','miAccesoAjedrex_').addItem('Invitar a un amigo','invitarAmigoAjedrex_').addItem('Revocar un jugador','revocarAjedrex_').addToUi();}
function instalarAjedrex_(){
 const ss=SpreadsheetApp.getActiveSpreadsheet();if(!ss)throw Error('Abre Apps Script desde el Sheet de Ajedrex.');
 const props=PropertiesService.getScriptProperties(),previous=props.getProperty('AJEDREX_BOOK');
 if(previous&&previous!==ss.getId())throw Error('No cambiar el destino de un servidor existente.');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  for(const title of ['Jugadores','Partidas','Invitaciones','Bitacora']){
   let s=ss.getSheetByName(title);if(!s){s=ss.insertSheet(title);s.getRange(1,1,1,3).setValues([['id','json','actualizado']]);s.setFrozenRows(1);}
   if(JSON.stringify(s.getRange(1,1,1,3).getValues()[0])!==JSON.stringify(['id','json','actualizado']))throw Error('Encabezados inesperados: '+title);
  }
  props.setProperty('AJEDREX_BOOK',ss.getId());
  ss.getSheetByName('Bitacora').appendRow(['instalacion_'+Date.now(),JSON.stringify({version:'1',estado:'instalado; deployment pendiente de verificar'}),new Date().toISOString()]);
  SpreadsheetApp.flush();
 }finally{lock.releaseLock();}
 SpreadsheetApp.getUi().alert('Estructura verificada. Despliega como aplicación web y conecta su URL /exec en Ajedrex.');
}
function ajedrexHash_(value){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value),Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function ajedrexToken_(){return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');}
function ajedrexStore_(){
 const id=PropertiesService.getScriptProperties().getProperty('AJEDREX_BOOK');if(!id)throw Error('SETUP');
 const ss=SpreadsheetApp.openById(id),tables={};
 function sheet(table){
  if(!['Jugadores','Partidas','Invitaciones','Bitacora'].includes(table))throw Error('TABLE');
  if(!tables[table]){
   const s=ss.getSheetByName(table);if(!s||s.getRange(1,1,1,3).getValues()[0].join('|')!=='id|json|actualizado')throw Error('SCHEMA');
   tables[table]=s;
  }return tables[table];
 }
 function row(s,key){if(s.getLastRow()<2)return null;return s.getRange(2,1,s.getLastRow()-1,1).createTextFinder(key).matchEntireCell(true).useRegularExpression(false).findNext();}
 return {
  now:()=>Date.now(),hash:ajedrexHash_,
  get:(table,key)=>{const s=sheet(table),r=row(s,key);return r?JSON.parse(s.getRange(r.getRow(),2).getValue()):null;},
  put:(table,key,value)=>{const text=JSON.stringify(value);if(text.length>45000)throw Error('SIZE');const s=sheet(table),r=row(s,key);s.getRange(r?r.getRow():s.getLastRow()+1,1,1,3).setValues([[key,text,new Date().toISOString()]]);SpreadsheetApp.flush();}
 };
}
function ajedrexRpc(q){
 const lock=LockService.getScriptLock();
 if(!lock.tryLock(15000))return {ok:false,error:'BUSY'};
 try{return {ok:true,result:ajedrexCore_(q,ajedrexStore_())};}
 catch(e){const known=['AUTH','INVITE','INVITE_USED','NAME','POSITION','MOVES','ILLEGAL','REQUEST','ROOM_FULL','SAME_PLAYER','FORBIDDEN','CONFLICT','SNAPSHOT','SIZE','STATUS','TURN','ACTION','SETUP','SCHEMA'];return {ok:false,error:known.includes(e.message)?e.message:'SERVER'};}
 finally{lock.releaseLock();}
}
function miAccesoAjedrex_(){crearInvitacionAjedrex_('owner');}
function invitarAmigoAjedrex_(){crearInvitacionAjedrex_('guest');}
function crearInvitacionAjedrex_(role){
 const lock=LockService.getScriptLock();lock.waitLock(20000);let link;
 try{
  const store=ajedrexStore_(),secret=ajedrexToken_(),id='i_'+ajedrexHash_(secret);
  store.put('Invitaciones',id,{id,role,createdAt:Date.now(),expiresAt:Date.now()+7*86400000,revoked:false,playerId:null});
  link=AJEDREX_SITE_+'#invite='+secret;
 }finally{lock.releaseLock();}
 SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput('<p>Enlace de un solo uso, válido 7 días. Quien lo abra podrá registrar su dispositivo.</p><textarea style="width:100%;height:120px" readonly>'+link+'</textarea><p>El guardado requiere que la URL /exec esté conectada en la app.</p>').setWidth(460).setHeight(260),'Invitación Ajedrex');
}
function revocarAjedrex_(){
 const ui=SpreadsheetApp.getUi(),answer=ui.prompt('Revocar jugador','Pega el id de la pestaña Jugadores. Sus partidas se conservarán.',ui.ButtonSet.OK_CANCEL);
 if(answer.getSelectedButton()!==ui.Button.OK)return;
 const id=answer.getResponseText().trim();if(!/^p_[a-f0-9]{64}$/.test(id)){ui.alert('ID no válido.');return;}
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{const store=ajedrexStore_(),p=store.get('Jugadores',id);if(!p)throw Error('Jugador no encontrado');p.disabled=true;store.put('Jugadores',id,p);}
 finally{lock.releaseLock();}
 ui.alert('Acceso revocado. Las partidas se conservan.');
}
function doGet(e){
 const channel=e&&e.parameter&&e.parameter.channel;
 if(!channel||!/^[a-zA-Z0-9_-]{32,100}$/.test(channel))return ContentService.createTextOutput(JSON.stringify({service:'ajedrex',version:1})).setMimeType(ContentService.MimeType.JSON);
 const html='<!doctype html><meta name="referrer" content="no-referrer"><script>'+
 'const channel='+JSON.stringify(channel)+',origin='+JSON.stringify(AJEDREX_ORIGIN_)+';'+
 'window.addEventListener("message",e=>{if(e.origin!==origin||e.source!==window.top||e.data?.channel!==channel||e.data?.kind!=="request")return;'+
 'const id=e.data.id;google.script.run.withSuccessHandler(result=>window.top.postMessage({channel,kind:"response",id,result},origin))'+
 '.withFailureHandler(()=>window.top.postMessage({channel,kind:"response",id,result:{ok:false,error:"SERVER"}},origin)).ajedrexRpc(e.data.payload);});'+
 'window.top.postMessage({channel,kind:"ready"},origin);'+
 '<\/script>';
 return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
