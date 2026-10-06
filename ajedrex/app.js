const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topicById=Object.fromEntries(CATALOG.map(t=>[t.id,t]));
const pieceGlyph={p:'♟',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚'};
let trainingMetadata=null;
let assistancePaused=false,reviewVisibleFen=null,boardInspect=false;
let tacticWorker=null,tacticTimer=null,tacticWatchdog=null,tacticId=0,tacticRequested=null,nextTacticBudget=2600;
let advancedState={key:'',alerts:[],status:'idle'};const tacticCache=new Map();
const evaluationCache=new Map();let liveId=0,liveWorker=null,liveTimer=null,liveTimeout=null,liveRequested=null,reviewJob=0,reviewWorker=null,reviewTimeout=null,reviewPaused=false,lastReview=null;
let game=new Chess(),startFen=game.fen(),selected=null,focusAlert=null,busy=false,worker=null,job=0,fallbackTimer=null,watchdogTimer=null,engineMode='GarboChess',cache=null,pendingPromotion=null,storageOK=true;
let prefs={mode:'ai',human:'w',level:2,flipped:false,enabled:[...ACTIVE_THEMES],alertsVersion:4,lines:true};

function backupData(){return {app:'ajedrex',version:1,prefs:{...prefs,enabled:[...prefs.enabled]},startFen,metadata:trainingMetadata,practiceProgress:cleanPracticeProgress(practiceProgress),moves:game.history({verbose:true}).map(m=>({from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})}))};}
function validateBackup(value){
 if(!value||value.version!==1||typeof value.startFen!=='string'||!Array.isArray(value.moves)||value.moves.length>10000)throw Error('Copia de seguridad no válida.');
 const restored=new Chess();if(!restored.load(value.startFen))throw Error('Posición inicial no válida.');
 const pieces=Object.values(boardMap(restored));
 for(const color of ['w','b'])if(pieces.filter(p=>p.type==='k'&&p.color===color).length!==1)throw Error('La posición necesita un rey de cada color.');
 for(const move of value.moves){if(!move||typeof move.from!=='string'||typeof move.to!=='string'||!restored.move({from:move.from,to:move.to,promotion:move.promotion||'q'}))throw Error('La copia contiene una jugada ilegal.');}
 const p=value.prefs||{},clean={
  mode:['ai','local'].includes(p.mode)?p.mode:'ai',human:p.human==='b'?'b':'w',
  level:Math.min(5,Math.max(1,Math.floor(Number(p.level)||2))),
  flipped:p.flipped===true,lines:p.lines!==false,
  alertsVersion:4,
  enabled:p.alertsVersion===4&&Array.isArray(p.enabled)?[...new Set(p.enabled.filter(t=>ACTIVE_THEMES.includes(t)))]:[...ACTIVE_THEMES]
 };
 return {restored,startFen:value.startFen,prefs:clean,metadata:validateThemeMetadata(value.metadata),practiceProgress:cleanPracticeProgress(value.practiceProgress)};
}
let startupNotice='';
try{
 const raw=localStorage.getItem('ajedrez-pistas-v1');
 if(raw){try{const value=validateBackup(JSON.parse(raw));game=value.restored;startFen=value.startFen;prefs=value.prefs;trainingMetadata=value.metadata;practiceProgress=mergePracticeProgress(practiceProgress,value.practiceProgress);}
 catch(error){startupNotice='No se pudo recuperar la partida guardada. Se conserva su copia original hasta que guardes una nueva partida.';}}
}catch(error){storageOK=false;}
function save(){try{localStorage.setItem('ajedrez-pistas-v1',JSON.stringify(backupData()));storageOK=true;}catch(error){storageOK=false;}}
function downloadText(name,text,type){
 const url=URL.createObjectURL(new Blob([text],{type:type||'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function exportBackup(){downloadText('ajedrex-partida.json',JSON.stringify(backupData(),null,2),'application/json');}
function importBackup(value){
 const checked=validateBackup(value);cancelThinking();game=checked.restored;startFen=checked.startFen;prefs=checked.prefs;trainingMetadata=checked.metadata;practiceProgress=mergePracticeProgress(practiceProgress,checked.practiceProgress);savePracticeProgress();
 selected=null;focusAlert=null;cache=null;save();closeSheet();render();queueOpponent();
}
const PIECE_ART={"p":"<circle cx=\"50\" cy=\"24\" r=\"10\"/><path d=\"M43 34h14l-3 8c-1 12 5 22 13 28H33c8-6 14-16 13-28z\"/><path d=\"M31 71h38l4 12H27z\"/>","r":"<path d=\"M27 17h11v12h8V17h9v12h8V17h11v23l-11 8 3 23H34l3-23-10-8z\"/><path d=\"M31 71h38l4 12H27z\"/><path d=\"M35 42h30M35 66h30\" fill=\"none\"/>","n":"<path d=\"M31 70c0-15 17-21 23-30l-15 8-13-8 12-19 11-5 7-7 3 12c13 8 16 24 13 49z\"/><path d=\"M31 71h40l3 12H27z\"/><path d=\"M59 27c10 12 8 26 4 35\" fill=\"none\"/><circle cx=\"45\" cy=\"29\" r=\"2.2\" fill=\"currentColor\" stroke=\"none\"/>","b":"<path d=\"M50 12c-17 12-22 25-6 36l-4 22h20l-4-22C72 37 67 24 50 12z\"/><path d=\"M54 23l-9 14M37 49h26\" fill=\"none\"/><path d=\"M31 71h38l4 12H27z\"/><circle cx=\"50\" cy=\"10\" r=\"3\"/>","q":"<path d=\"M26 29l13 13 11-18 11 18 13-13-9 38H35z\"/><circle cx=\"25\" cy=\"25\" r=\"5\"/><circle cx=\"50\" cy=\"20\" r=\"5\"/><circle cx=\"75\" cy=\"25\" r=\"5\"/><path d=\"M35 57h30M33 67h34\" fill=\"none\"/><path d=\"M31 71h38l4 12H27z\"/>","k":"<path d=\"M46 9h8v8h8v8h-8v10h-8V25h-8v-8h8z\"/><path d=\"M49 38c-16-19-31-2-19 12l8 17h24l8-17c12-14-3-31-19-12z\"/><path d=\"M35 58h30M34 67h32\" fill=\"none\"/><path d=\"M31 71h38l4 12H27z\"/>"};

function pieceSVG(p){
 const fill=p.color==='w'?'#fffdf1':'#162c29',stroke=p.color==='w'?'#29453e':'#091b18';
 return '<svg class="piece" viewBox="0 0 100 100" aria-hidden="true" data-color="'+p.color+'"><g fill="'+fill+'" stroke="'+stroke+'" color="'+stroke+'" stroke-width="2.7" stroke-linejoin="round" stroke-linecap="round">'+PIECE_ART[p.type]+'</g></svg>';
}
function animateMove(move){
 if(!move||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const target=$('board').querySelector('[data-square="'+move.to+'"] .piece');
 const [fx,fy]=center(move.from),[tx,ty]=center(move.to),wrap=$('board').parentElement;
 const ghost=document.createElement('div');ghost.className='movingPiece';
 ghost.style.left=(fx-6.25)+'%';ghost.style.top=(fy-6.25)+'%';
 ghost.innerHTML=pieceSVG({type:move.piece,color:move.color});wrap.appendChild(ghost);
 if(target)target.style.opacity='0';
 if(!ghost.animate){ghost.remove();if(target)target.style.opacity='';return;}
 const animation=ghost.animate([{transform:'translate(0,0)'},{transform:'translate('+((tx-fx)*8)+'%,'+((ty-fy)*8)+'%)'}],{duration:220,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
 const clean=()=>{ghost.remove();if(target)target.style.opacity='';};animation.onfinish=clean;animation.oncancel=clean;
}

function analysis(){
 const key=game.fen();
 if(!cache||cache.key!==key)cache={key,...analyzeChess(game,{mateIn1:false})};
 return cache;
}
function alertIdentity(a){return a.type+':'+(a.squares||[]).join(',')+':'+(a.move?a.move.from+a.move.to+(a.move.promotion||''):'');}
function tacticalPositionKey(){return game.fen()+'|'+game.history().join(' ')+'|'+JSON.stringify(trainingMetadata)+'|'+prefs.enabled.slice().sort().join(',');}
function visibleAlerts(){
 const key=tacticalPositionKey();if(tacticCache.has(key))advancedState=tacticCache.get(key);
 const deep=advancedState.key===key?advancedState.alerts:[];
 const all=[...analysis().alerts,...deep],unique=new Map();
 for(const alert of all)if(prefs.enabled.includes(alert.type))unique.set(alertIdentity(alert),alert);
 return [...unique.values()];
}
function confidenceLabel(a){
 return a.confidence==='verified'?'Comprobado':a.confidence==='candidate'?'Posibilidad para explorar':a.confidence==='context'?'Contexto de la partida':a.confidence==='metadata'?'Datos del ejercicio':'Patrón observado';
}
function themeKind(id){return THEME_META[id]?.kind||'tactic';}
function stopTacticalAnalysis(){
 tacticId++;if(tacticWorker)tacticWorker.terminate();tacticWorker=null;
 if(tacticTimer)clearTimeout(tacticTimer);if(tacticWatchdog)clearTimeout(tacticWatchdog);
 tacticTimer=null;tacticWatchdog=null;tacticRequested=null;
}
function scheduleTacticalAnalysis(){
 const key=tacticalPositionKey();
 if(advancedState.key!==key)advancedState={key,alerts:[],status:'idle'};
 if(busy||reviewPaused||practicePaused||assistancePaused||document.hidden||!prefs.enabled.length){if(tacticRequested)stopTacticalAnalysis();return;}
 if(tacticCache.has(key)){advancedState=tacticCache.get(key);return;}
 if(tacticRequested===key)return;
 stopTacticalAnalysis();tacticRequested=key;const id=tacticId,budgetMs=nextTacticBudget;nextTacticBudget=2600;
 advancedState={key,alerts:[],status:'working'};
 tacticTimer=setTimeout(function begin(){
  if(id!==tacticId||key!==tacticalPositionKey()||busy||reviewPaused||practicePaused||assistancePaused)return;
  if(liveWorker){tacticTimer=setTimeout(begin,150);return;}
  const finishError=()=>{
   if(id!==tacticId)return;if(tacticWorker)tacticWorker.terminate();tacticWorker=null;
   if(tacticWatchdog)clearTimeout(tacticWatchdog);
   advancedState={...advancedState,status:'error'};renderTacticalStatus();
  };
  try{
   tacticWorker=new Worker('./tactics-worker.js');
   tacticWatchdog=setTimeout(finishError,budgetMs+8000);
   tacticWorker.onmessage=e=>{
    const data=e.data;if(id!==tacticId||key!==tacticalPositionKey()||!data||data.id!==id)return;
    if(data.kind==='error'){finishError();return;}
    if(data.kind!=='tactics')return;
    advancedState={key,alerts:data.alerts||[],status:data.done?(data.limited?'limited':'done'):'working',coverage:data.coverage||{}};
    if(data.done){if(tacticWorker)tacticWorker.terminate();tacticWorker=null;if(tacticWatchdog)clearTimeout(tacticWatchdog);tacticCache.set(key,advancedState);if(tacticCache.size>12)tacticCache.delete(tacticCache.keys().next().value);}
    render();
   };
   tacticWorker.onerror=e=>{e.preventDefault();finishError();};
   tacticWorker.postMessage({kind:'tactics',id,startFen,moves:game.history({verbose:true}).map(m=>({from:m.from,to:m.to,promotion:m.promotion})),enabled:[...prefs.enabled],metadata:trainingMetadata,budgetMs});
  }catch(error){finishError();}
 },450);
}
function renderTacticalStatus(){
 const text=!prefs.enabled.length?'Alertas apagadas':busy?'Las alertas se actualizarán después de la respuesta.':advancedState.status==='working'?'Buscando más tácticas…':advancedState.status==='error'?'Avisos básicos activos. No se completó el análisis avanzado.':advancedState.status==='limited'?'Análisis breve: puede haber otras combinaciones.':busy?'Las alertas se actualizarán después de la respuesta.':'Iconos para explorar la posición.';
 $('tacticalStatus').textContent=text;
 $('deeperTactics').disabled=busy||reviewPaused||practicePaused||assistancePaused||!prefs.enabled.length||advancedState.status==='working';
}
function renderThemeSummary(alerts){
 const grouped=new Map();for(const a of alerts){if(!grouped.has(a.type))grouped.set(a.type,[]);grouped.get(a.type).push(a);}
 $('activeThemes').innerHTML=[...grouped].map(([type,list])=>'<button class="active-theme '+themeKind(type)+'" data-active-theme="'+type+'" title="'+esc(topicById[type].name)+'">'+themeIcon(type)+'<span>'+esc(topicById[type].name)+'</span><b>'+list.length+'</b></button>').join('');
 renderTacticalStatus();
}
function inspectAlert(alert){
 if(!alert)return;focusAlert=alert;selected=null;render();
 openSheet(topicById[alert.type].name,'<div class="alert-explanation"><span class="large-theme-icon">'+themeIcon(alert.type)+'</span><span class="chip">'+confidenceLabel(alert)+'</span></div><p>'+esc(alert.message)+'</p>'+
 (alert.variation?.length?'<p class="small">Línea de ejemplo: '+esc(alert.variation.join(' → '))+'</p>':'')+
 '<p class="small">'+esc(THEME_META[alert.type]?.scope||'')+'</p><div class="btnrow"><button id="showAlertBoard" class="primary">'+(alert.move?'Ver jugada '+esc(alert.move.san||alert.move.from+'–'+alert.move.to):'Ver en el tablero')+'</button><button id="hideAlertType">Apagar esta ayuda</button></div>');
 $('showAlertBoard').onclick=()=>{closeSheet();focusAlert=alert;if(alert.move)selected=alert.move.from;render();};
 $('hideAlertType').onclick=()=>{toggleTheme(alert.type,false);closeSheet();};
 if(typeof addAlertTools==='function')addAlertTools(alert);
 if(PRACTICE_LESSONS.some(l=>l.id===alert.type)){const button=document.createElement('button');button.id='practiceAlert';button.className='practice-return';button.textContent='Practicar esta táctica';button.onclick=()=>openPractice(alert.type);$('sheetBody').appendChild(button);}
}


function setBoardMode(inspect){
 boardInspect=Boolean(inspect);removeDrag();suppressClickUntil=0;selected=null;focusAlert=null;
 if(boardInspect)cancelThinking();
 render();if(!boardInspect)queueOpponent();
}
function renderBoardMode(){
 $('board').classList.toggle('consulting',boardInspect);
 $('board').classList.toggle('playing',!boardInspect);
 if($('moveMode'))$('moveMode').setAttribute('aria-pressed',String(!boardInspect));
 if($('inspectMode'))$('inspectMode').setAttribute('aria-pressed',String(boardInspect));
 if($('boardModeHint'))$('boardModeHint').textContent=boardInspect?'Partida pausada. Toca una casilla o un símbolo para consultar sus ayudas.':'Toca o arrastra para mover. Los símbolos son indicadores; no abren ventanas.';
}

function center(s){let[x,y]=xy(s);let col=prefs.flipped?7-x:x,row=prefs.flipped?y:7-y;return[(col+.5)*12.5,(row+.5)*12.5];}
function statusText(){
 if(boardInspect)return 'Consultar alertas · partida pausada';
 if(game.in_checkmate())return 'Jaque mate · ganan '+(game.turn()==='w'?'negras':'blancas');
 if(game.in_stalemate())return 'Tablas por ahogado';
 if(game.in_threefold_repetition())return 'Tablas por repetición';
 if(game.insufficient_material())return 'Tablas por material insuficiente';
 if(game.in_draw())return 'Tablas';
 if(busy)return 'El rival está pensando…';
 return (game.turn()==='w'?'Blancas':'Negras')+' · '+(game.in_check()?'en jaque':prefs.mode==='ai'&&game.turn()===prefs.human?'tu turno':'su turno');
}
function render(){
 renderBoardMode();
 const a=analysis(),alerts=typeof focusAlerts==='function'?focusAlerts(visibleAlerts()):visibleAlerts(),history=game.history({verbose:true}),last=history[history.length-1];
 if(focusAlert&&!alerts.some(x=>JSON.stringify(x)===JSON.stringify(focusAlert)))focusAlert=null;
 const priority={mate:0,check:1,doubleCheck:1,mateIn1:2,mateIn2:2,mateIn3:2,mateIn4:2,mateIn5:2,pin:3,skewer:4,xRayAttack:5,fork:6,attacked:7,undefended:18,defended:20};
 const sorted=[...alerts].sort((a,b)=>(priority[a.type]??12)-(priority[b.type]??12));
 const badgeBySquare={};for(const alert of sorted){const s=alert.squares?.[0];if(themeKind(alert.type)!=='tactic'||!s)continue;if(!badgeBySquare[s])badgeBySquare[s]=[];if(!badgeBySquare[s].some(x=>x.type===alert.type))badgeBySquare[s].push(alert);}
 const targets=selected?a.legal.filter(m=>m.from===selected):[];
 let html='';
 for(let row=0;row<8;row++)for(let col=0;col<8;col++){
  const file=prefs.flipped?7-col:col,rank=prefs.flipped?row+1:8-row,s=String.fromCharCode(97+file)+rank,p=a.map[s],target=targets.find(m=>m.to===s),badges=badgeBySquare[s]||[];
  const cls=['sq',(row+col)%2?'dark':'',selected===s?'selected':'',last&&(last.from===s||last.to===s)?'last':'',target?'target':'',target&&p?'capture':''].filter(Boolean).join(' ');
  const label=s+(p?' '+PIECE_NAMES[p.type]+' '+(p.color==='w'?'blanco':'negro'):' vacía')+(badges.length?', avisos: '+badges.map(b=>topicById[b.type].name).join(', '):'');
  html+='<div class="square-wrap"><button class="'+cls+'" data-square="'+s+'" aria-label="'+esc(label)+'" aria-pressed="'+(selected===s)+'">'+(p?pieceSVG(p):'')+(col===0?'<span class="coord rank">'+rank+'</span>':'')+(row===7?'<span class="coord file">'+s[0]+'</span>':'')+'</button>'+
   badges.slice(0,2).map((badge,i)=>'<button class="badge '+badge.type+' badge-slot-'+i+(badge.confidence==='candidate'?' candidate':'')+'" tabindex="'+(boardInspect?'0':'-1')+'" aria-hidden="'+(!boardInspect)+'" data-alert-square="'+s+'" data-alert-type="'+badge.type+'" aria-label="'+esc(topicById[badge.type].name)+' en '+s+'" title="'+esc(topicById[badge.type].name)+'">'+themeIcon(badge.type)+'</button>').join('')+
   (badges.length>2?'<button class="badge badge-more" tabindex="'+(boardInspect?'0':'-1')+'" aria-hidden="'+(!boardInspect)+'" data-alert-square="'+s+'" data-alert-more="'+s+'" aria-label="Ver las '+badges.length+' ayudas de '+s+'">+'+(badges.length-2)+'</button>':'')+'</div>';
 }
 $('board').innerHTML=html;
 let lines=[];
 if(prefs.lines){
  const shown=focusAlert?[focusAlert]:alerts.filter(x=>x.type==='xRayAttack').slice(0,3);
  for(const alert of shown)for(const [from,to]of alert.lines){
   const [x1,y1]=center(from),[x2,y2]=center(to),isXray=alert.type==='xRayAttack';
   lines.push('<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(isXray?'#8647bd':'#b46a14')+'" stroke-width="1.1" stroke-linecap="round" opacity="'+(isXray?'.52':'.72')+'"'+(isXray?' stroke-dasharray="2 2"':'')+'/>');
  }
 }
 $('lines').innerHTML=lines.join('');
 $('status').textContent=statusText();$('statusbar').classList.toggle('thinking',busy);
 const topColor=prefs.flipped?'w':'b',bottomColor=topColor==='w'?'b':'w';
 function playerLabel(color){return prefs.mode==='ai'?(color===prefs.human?'Tú':'GarboChess'):(color==='w'?'Blancas':'Negras');}
 $('topName').textContent=playerLabel(topColor);$('bottomName').textContent=playerLabel(bottomColor);
 $('topMeta').textContent=(topColor==='w'?'Blancas':'Negras')+(prefs.mode==='ai'&&topColor!==prefs.human?' · nivel '+prefs.level:'');
 $('bottomMeta').textContent=(bottomColor==='w'?'Blancas':'Negras')+(prefs.mode==='ai'&&bottomColor!==prefs.human?' · nivel '+prefs.level:'');
 $('topAvatar').innerHTML=pieceSVG({type:'p',color:topColor});$('bottomAvatar').innerHTML=pieceSVG({type:'p',color:bottomColor});
 $('topAvatar').className='avatar'+(topColor==='w'?' white':'');$('bottomAvatar').className='avatar'+(bottomColor==='w'?' white':'');
 $('levelTag').textContent=prefs.mode==='ai'?'Nivel '+prefs.level+' / 5':'Dos personas';
 $('undo').disabled=!history.length||(prefs.mode==='ai'&&!history.some(m=>m.color===prefs.human));
 $('hintCount').textContent=alerts.length+' '+(alerts.length===1?'aviso':'avisos');
 $('helpButton').textContent='☷ Ayudas · '+prefs.enabled.length;
 const current=focusAlert;
 if(current){
  $('hintTitle').textContent=topicById[current.type].name;
  $('hintText').textContent=current.message;
  $('hintAction').innerHTML=current.move?'<button class="tinybutton soft" id="showMove">Ver jugada '+esc(current.move.san)+'</button>':'';
  if($('showMove'))$('showMove').onclick=()=>{selected=current.move.from;render();};
 }else{
  $('hintTitle').textContent=selected?'Elige una casilla marcada':game.game_over()?'Partida terminada':'Aprende mientras juegas';
  $('hintText').textContent=selected?'Los puntos indican movimientos legales. Toca un símbolo para entender su aviso.':game.game_over()?statusText()+'. Puedes deshacer o comenzar otra partida.':alerts.length?'Para entender los símbolos, elige «Consultar alertas» o «Ver avisos». En Jugar, toda la casilla sirve para mover.':'Toca una pieza y después su destino. Activa las pistas que quieras desde Ayudas.';
  $('hintAction').innerHTML='';
 }
 $('storageNote').textContent=storageOK?'Guardado en este navegador. Exporta una copia desde Partida para conservarla.':'Esta vista no permite guardar automáticamente. Conserva tu partida copiando el PGN.';
 $('engineNote').textContent=prefs.mode==='ai'?engineMode+' · dificultad orientativa, sin Elo certificado':'Partida local en el mismo teléfono';
 renderInsights();scheduleTacticalAnalysis();renderThemeSummary(alerts);
}
let previousFocus=null;
function openSheet(title,html){
 if(!$('veil').classList.contains('open'))previousFocus=document.activeElement;
 $('sheetBody').onclick=null;$('sheetBody').onchange=null;
 $('sheetTitle').textContent=title;$('sheetBody').innerHTML=html;$('veil').classList.add('open');$('veil').setAttribute('aria-hidden','false');
 document.body.style.overflow='hidden';$('closeSheet').focus();
}
function closeSheet(){ if(assistancePaused)return; $('veil').classList.remove('open');$('veil').setAttribute('aria-hidden','true');document.body.style.overflow='';pendingPromotion=null;if(reviewPaused){stopReviewAnalysis();reviewPaused=false;queueOpponent();scheduleLiveEvaluation();scheduleTacticalAnalysis();}finishPractice();if(previousFocus&&previousFocus.isConnected)previousFocus.focus();}
function toggleTheme(id,on){if(!ACTIVE_THEMES.includes(id))return;if(on){if(!prefs.enabled.includes(id))prefs.enabled.push(id);}else prefs.enabled=prefs.enabled.filter(x=>x!==id);focusAlert=null;save();render();}

function openHelps(){
 const groups=[...new Set(CATALOG.map(t=>t.group))];
 let html='<p><strong>81 ayudas con su propio icono.</strong> Puedes apagar cada una o elegir un grupo de nivel. Las posibilidades por explorar llevan un borde punteado.</p><input class="search" id="helpSearch" type="search" placeholder="Buscar una ayuda…" aria-label="Buscar ayuda"><div class="pills"><button data-preset="basic">Básico</button><button data-preset="middle">Intermedio</button><button data-preset="all">Todas</button><button data-preset="none">Apagar</button></div><div id="helpRows">';
 for(const group of groups){html+='<section class="help-group"><div class="group">'+esc(group)+'</div>';for(const t of CATALOG.filter(t=>t.group===group))html+='<div class="row help-row" data-help-id="'+t.id+'"><span class="help-icon">'+themeIcon(t.id)+'</span><div class="help-copy"><strong>'+esc(t.name)+'</strong><div class="small">'+esc(t.description)+'</div><div class="small">'+esc(THEME_META[t.id]?.scope||'')+'</div></div><label class="switch"><input type="checkbox" data-theme="'+t.id+'" aria-label="'+esc(t.name)+'" '+(prefs.enabled.includes(t.id)?'checked':'')+'><span></span></label></div>';html+='</section>';}
 html+='</div><div class="row"><div><strong>Mostrar líneas</strong><div class="small">Los rayos X se dibujan transparentes y a trazos.</div></div><label class="switch"><input type="checkbox" id="lineSwitch" aria-label="Mostrar líneas" '+(prefs.lines?'checked':'')+'><span></span></label></div><p class="small">Las fases aparecen como etiquetas. El origen de un ejercicio solo se muestra si viene declarado en su copia importada.</p><button class="primary" id="allCatalog">Abrir catálogo completo</button>';
 openSheet('Tus ayudas',html);
 $('helpSearch').oninput=()=>{
  const q=normalizeSearch($('helpSearch').value);
  $('helpRows').querySelectorAll('[data-help-id]').forEach(el=>{const t=topicById[el.dataset.helpId];el.classList.toggle('hidden',!normalizeSearch(t.name+' '+t.description+' '+t.group).includes(q));});
  $('helpRows').querySelectorAll('.help-group').forEach(el=>{el.classList.toggle('hidden',![...el.querySelectorAll('[data-help-id]')].some(row=>!row.classList.contains('hidden')));});
 };
 $('sheetBody').onchange=e=>{if(e.target.dataset.theme)toggleTheme(e.target.dataset.theme,e.target.checked);if(e.target.id==='lineSwitch'){prefs.lines=e.target.checked;save();render();}};
 $('sheetBody').onclick=e=>{const preset=e.target.closest('[data-preset]');if(preset){const p=preset.dataset.preset;prefs.enabled=p==='none'?[]:p==='all'?[...ACTIVE_THEMES]:p==='basic'?['attacked','undefended','check','mate','opening','endgame']:['attacked','check','pin','fork','xRayAttack','hangingPiece','mateIn1'];prefs.alertsVersion=4;save();render();openHelps();}};
 $('allCatalog').onclick=openCatalog;
}
function normalizeSearch(value){return String(value).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function catalogType(t){return themeKind(t.id);}
function openCatalog(){
 openSheet('Catálogo · 81 temas','<p>Cada tema tiene su icono y un control individual. Consulta en cada ficha qué observa y cómo se interpreta.</p><input class="search" id="catalogSearch" type="search" placeholder="Buscar: rayos X, mate, clavada…" aria-label="Buscar tema"><select class="fieldselect" id="catalogFilter" aria-label="Filtrar catálogo"><option value="all">Todos los temas</option><option value="tactic">Tácticas y jugadas</option><option value="context">Fases y objetivos</option><option value="metadata">Datos de ejercicios</option></select><div class="small" id="catalogCount"></div><div id="catalogList"></div>');
 function update(){
  const q=normalizeSearch($('catalogSearch').value),filter=$('catalogFilter').value;
  const rows=CATALOG.filter(t=>(filter==='all'||catalogType(t)===filter)&&normalizeSearch(t.name+' '+t.description+' '+t.group).includes(q));
  $('catalogCount').textContent=rows.length+' temas';
  $('catalogList').innerHTML=rows.map(t=>'<details class="topic"><summary><span class="catalog-symbol">'+themeIcon(t.id)+'</span>'+esc(t.name)+'<br><span class="chip">'+esc(t.group)+'</span><span class="chip">'+(catalogType(t)==='tactic'?'Avisos en el tablero':catalogType(t)==='context'?'Indicador de posición':'Datos del ejercicio')+'</span></summary><p>'+esc(t.description)+'</p><p class="small">'+esc(THEME_META[t.id]?.scope||'')+'</p><label class="row"><strong>Mostrar avisos</strong><span class="switch"><input type="checkbox" data-theme="'+t.id+'" aria-label="Activar '+esc(t.name)+'" '+(prefs.enabled.includes(t.id)?'checked':'')+'><span></span></span></label>'+(PRACTICE_LESSONS.some(l=>l.id===t.id)?'<button class="soft" data-catalog-practice="'+t.id+'">Practicar este tema</button>':'')+'</details>').join('')||'<p>No hay temas con esa búsqueda.</p>';
 }
 $('catalogSearch').oninput=update;$('catalogFilter').onchange=update;
 $('catalogList').onchange=e=>{if(e.target.dataset.theme)toggleTheme(e.target.dataset.theme,e.target.checked);};
 $('catalogList').onclick=e=>{const b=e.target.closest('[data-catalog-practice]');if(b)openPractice(b.dataset.catalogPractice);};update();
}
function showAlerts(filter={}){
 if(!filter||(!filter.square&&!topicById[filter.type]))filter={};
 const alerts=visibleAlerts().filter(a=>(!filter.square||(filter.related?a.squares?.includes(filter.square):a.squares?.[0]===filter.square))&&(!filter.type||a.type===filter.type));
 openSheet(filter.square?'Ayudas en '+filter.square:filter.type?topicById[filter.type].name:'Avisos de la posición',alerts.length?'<p>Toca una ayuda para ver su explicación y, si corresponde, una jugada.</p>'+alerts.map((a,i)=>'<button class="lesson alert-row" data-choose-alert="'+i+'"><span class="help-icon">'+themeIcon(a.type)+'</span><span><strong>'+esc(topicById[a.type].name)+(a.squares?.[0]?' · '+esc(a.squares[0]):'')+'</strong><span class="chip">'+confidenceLabel(a)+'</span><span class="small">'+esc(a.message)+'</span></span></button>').join(''):'<p>No hay avisos de los tipos activados para esta posición.</p><button id="enableHelps">Configurar ayudas</button>');
 $('sheetBody').onclick=e=>{const b=e.target.closest('[data-choose-alert]');if(b)inspectAlert(alerts[Number(b.dataset.chooseAlert)]);};
 if($('enableHelps'))$('enableHelps').onclick=openHelps;
}
function cancelThinking(){stopTacticalAnalysis();cancelLiveEvaluation();job++;if(watchdogTimer)clearTimeout(watchdogTimer);watchdogTimer=null;if(worker){worker.terminate();worker=null;}if(fallbackTimer)clearTimeout(fallbackTimer);fallbackTimer=null;busy=false;}
function makeMove(m){if(assistancePaused||boardInspect)return false;const made=game.move(m);if(!made)return false;selected=null;focusAlert=null;cache=null;save();render();animateMove(made);queueOpponent();if(game.game_over()){const finalFen=game.fen();setTimeout(()=>{if(game.fen()===finalFen&&game.game_over()&&!reviewPaused&&!practicePaused&&!assistancePaused&&!boardInspect&&!$('veil').classList.contains('open'))openGameReview();},650);}return true;}
function queueOpponent(){
 if(prefs.mode!=='ai'||game.turn()===prefs.human||game.game_over()||busy||reviewPaused||practicePaused||assistancePaused||boardInspect)return;
 stopTacticalAnalysis();cancelLiveEvaluation();busy=true;const id=++job,fen=game.fen(),startedAt=Date.now();render();
 const lv=Number(prefs.level),config=[null,{ms:70,depth:1},{ms:150,depth:2},{ms:400,depth:4},{ms:850,depth:6},{ms:1400,depth:10}][lv];
 function finish(result){
  if(id!==job||fen!==game.fen())return;
  if(worker){worker.terminate();worker=null;}if(watchdogTimer)clearTimeout(watchdogTimer);watchdogTimer=null;
  const remaining=900-(Date.now()-startedAt);if(remaining>0){fallbackTimer=setTimeout(()=>finish(result),remaining);return;}busy=false;
  const uci=result&&result.uci;
  if(!uci||!makeMove({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||'q'})){
   prefs.mode='local';engineMode='Motor detenido';save();render();
   openSheet('Motor detenido','<p>El motor no pudo completar una jugada válida. Conservamos la posición y activamos dos jugadores para que puedas continuar.</p>');
  }
 }
 if(lv===1&&Math.random()<.45){
  fallbackTimer=setTimeout(()=>{const legal=game.moves({verbose:true});const m=legal[Math.floor(Math.random()*legal.length)];if(m)finish({uci:m.from+m.to+(m.promotion||'')});},300);return;
 }
 function fallback(){
  if(id!==job)return;if(watchdogTimer)clearTimeout(watchdogTimer);watchdogTimer=null;if(worker){worker.terminate();worker=null;}
  engineMode='GarboChess · modo compatible';
  fallbackTimer=setTimeout(()=>{if(id!==job)return;try{finish(GARBO.choose(fen,Math.min(config.ms,120),Math.min(config.depth,5)));}catch(e){finish(null);}},80);
 }
 try{
  worker=new Worker('./engine-worker.js');
  watchdogTimer=setTimeout(fallback,config.ms+5000);
  worker.onmessage=e=>{if(e.data&&e.data.error)fallback();else finish(e.data);};worker.onerror=e=>{e.preventDefault();fallback();};
  worker.postMessage({fen,ms:config.ms,depth:config.depth});
 }catch(e){fallback();}
}
function tapSquare(s,isBadge){
 if(boardInspect){showAlerts({square:s,related:true});return;}
 const alerts=visibleAlerts();
 if(isBadge){const candidates=alerts.filter(a=>a.squares[0]===s);if(candidates.length){const index=focusAlert?candidates.findIndex(a=>JSON.stringify(a)===JSON.stringify(focusAlert)):-1;focusAlert=candidates[(index+1)%candidates.length];render();return;}}
 if(assistancePaused||busy||game.game_over()||(prefs.mode==='ai'&&game.turn()!==prefs.human))return;
 if(selected){
  const choices=analysis().legal.filter(m=>m.from===selected&&m.to===s);
  if(choices.length){
   if(choices.some(m=>m.promotion)){
    pendingPromotion={from:selected,to:s};
    openSheet('Elige tu coronación','<p>Transforma el peón en la pieza que prefieras.</p><div class="promotion">'+['q','r','b','n'].map(p=>'<button data-promote="'+p+'" aria-label="Coronar a '+PIECE_NAMES[p]+'">'+pieceSVG({type:p,color:game.turn()})+'<span class="small">'+PIECE_NAMES[p]+'</span></button>').join('')+'</div>');
    $('sheetBody').onclick=e=>{const b=e.target.closest('[data-promote]');if(b&&pendingPromotion){const m={...pendingPromotion,promotion:b.dataset.promote};closeSheet();makeMove(m);}};return;
   }
   makeMove(choices[0]);return;
  }
 }
 const p=game.get(s);selected=p&&p.color===game.turn()?(selected===s?null:s):null;focusAlert=null;render();
}
function undoMove(){
 if(prefs.mode==='ai'&&!game.history({verbose:true}).some(m=>m.color===prefs.human))return;
 cancelThinking();
 const h=game.history();if(!h.length)return;
 game.undo();if(prefs.mode==='ai'&&game.turn()!==prefs.human&&game.history().length)game.undo();
 selected=null;focusAlert=null;cache=null;save();render();queueOpponent();
}
function openSettings(){
 openSheet('Tu partida','<p>Configura la siguiente partida. El nivel del rival y las ayudas se eligen por separado.</p><label class="field" for="modeSelect">Rival</label><select class="fieldselect" id="modeSelect"><option value="ai" '+(prefs.mode==='ai'?'selected':'')+'>GarboChess · motor gratuito</option><option value="local" '+(prefs.mode==='local'?'selected':'')+'>Otra persona en este iPhone</option></select><label class="field" for="colorSelect">Jugar con</label><select class="fieldselect" id="colorSelect"><option value="w" '+(prefs.human==='w'?'selected':'')+'>Blancas</option><option value="b" '+(prefs.human==='b'?'selected':'')+'>Negras</option></select><label class="field" for="levelSelect">Dificultad del rival</label><select class="fieldselect" id="levelSelect">'+['Iniciación','Suave','Intermedio','Exigente','Máximo de esta prueba'].map((n,i)=>'<option value="'+(i+1)+'" '+(Number(prefs.level)===i+1?'selected':'')+'>'+(i+1)+' · '+n+'</option>').join('')+'</select><p class="small">GarboChess ajusta profundidad y tiempo de cálculo. Iniciación también intercala jugadas aleatorias. Los niveles no equivalen a un Elo oficial.</p><div class="btnrow"><button class="soft" id="applyLevel">Cambiar nivel actual</button><button class="primary" id="newGame">Comenzar nueva partida</button></div><p class="small">Comenzar otra partida sustituye la actual. Puedes copiar el PGN antes.</p><div class="group">Historial actual</div><div class="movehistory">'+esc(game.history().map((m,i)=>(i%2===0?(Math.floor(i/2)+1)+'. ':'')+m).join(' ')||'Todavía no hay jugadas.')+'</div><div class="btnrow"><button id="copyPGN">Copiar PGN</button><button id="flipBoard">Girar tablero</button></div><div class="group">Copia de seguridad</div><p class="small">El repositorio conserva el código. Tus partidas se guardan en este navegador; descarga una copia para trasladarlas o recuperarlas.</p><div class="btnrow"><button id="exportBackup">Exportar partida</button><button id="importBackup">Importar partida</button></div><input id="backupFile" type="file" accept=".json,application/json" class="hidden"><p class="small" id="backupStatus" role="status"></p><div class="btnrow"><button id="about">Sobre esta versión</button></div>');
 $('sheetBody').onclick=null;$('sheetBody').onchange=null;
 $('applyLevel').onclick=()=>{cancelThinking();prefs.level=Number($('levelSelect').value);save();closeSheet();render();queueOpponent();};
 $('newGame').onclick=()=>{if(game.history().length&&!window.confirm('¿Comenzar otra partida y sustituir la actual?'))return;cancelThinking();prefs.mode=$('modeSelect').value;prefs.human=$('colorSelect').value;prefs.level=Number($('levelSelect').value);prefs.flipped=prefs.human==='b';game=new Chess();startFen=game.fen();trainingMetadata=null;selected=null;focusAlert=null;cache=null;save();closeSheet();render();queueOpponent();};
 $('flipBoard').onclick=()=>{prefs.flipped=!prefs.flipped;save();render();closeSheet();};
 $('copyPGN').onclick=async()=>{
  const text=game.pgn()||'[Event "Ajedrez con pistas"]\n\n*';
  try{await navigator.clipboard.writeText(text);$('copyPGN').textContent='PGN copiado';}
  catch(e){openSheet('Tu partida en PGN','<p>Mantén pulsado el texto para seleccionarlo y copiarlo.</p><textarea class="search" rows="9" readonly>'+esc(text)+'</textarea>');}
 };

 $('exportBackup').onclick=()=>{try{exportBackup();$('backupStatus').textContent='Guarda el archivo en Archivos o iCloud Drive.';}catch(error){$('backupStatus').textContent='No se pudo descargar. Copia el PGN para conservar las jugadas.';}};
 $('importBackup').onclick=()=>$('backupFile').click();
 $('backupFile').onchange=async e=>{
  const file=e.target.files&&e.target.files[0];if(!file)return;const status=$('backupStatus');
  try{if(file.size>2*1024*1024)throw Error('La copia es demasiado grande.');const data=JSON.parse(await file.text());validateBackup(data);
   if(!window.confirm('Importar esta copia sustituirá la partida actual. ¿Continuar?'))return;importBackup(data);
  }catch(error){status.textContent=error.message||'No se pudo importar. Tu partida se conserva.';}
 };
 $('about').onclick=openAbout;
}
function openAbout(){
 openSheet('Sobre Ajedrex','<p><strong>Ajedrex · v0.7</strong><br>Tablero táctil, reglas legales, rival GarboChess, 81 controles con iconos propios, barra de ventaja y revisión de partidas.</p><p>Proyecto personal de hobby. Abre su dirección web en Safari; puedes usar Compartir → Añadir a pantalla de inicio. La primera carga necesita conexión. El indicador inferior confirma cuándo está preparada la copia sin conexión.</p><p>Las alertas distinguen hechos comprobados, patrones y posibilidades. La búsqueda tiene límite de tiempo; Ampliar análisis permite explorar más. Las etiquetas de origen requieren datos de ejercicios importados. Hay 60 prácticas guiadas locales, una por tema táctico, con progreso y retorno a la partida. Stockfish y un banco de ejercicios en línea no están incluidos. GarboChess está incluido en los archivos del proyecto. Los patrones geométricos no prometen ganar material. Las reglas de tablas por repetición y 50 jugadas se aplican automáticamente en esta prueba.</p><p>Fuentes: <a href="https://github.com/glinscott/Garbochess-JS" target="_blank" rel="noopener">GarboChess</a>, <a href="https://github.com/jhlywa/chess.js/tree/v0.13.4" target="_blank" rel="noopener">chess.js 0.13.4</a> y <a href="https://github.com/lichess-org/lila/blob/master/translation/source/puzzleTheme.xml" target="_blank" rel="noopener">temas de Lichess</a>.</p><details class="topic"><summary>Licencias de los componentes</summary><pre class="legal">'+esc(LICENSE_TEXT)+'</pre></details>');
 $('sheetBody').onclick=null;$('sheetBody').onchange=null;
}
function openLessons(){openPracticeGallery();}

let drag=null,suppressClickUntil=0;
function removeDrag(){if(drag&&drag.ghost)drag.ghost.remove();drag=null;}
function dropSquare(x,y){
 const r=$('board').getBoundingClientRect();if(x<r.left||x>=r.right||y<r.top||y>=r.bottom)return null;
 const col=Math.floor((x-r.left)/r.width*8),row=Math.floor((y-r.top)/r.height*8);
 return String.fromCharCode(97+(prefs.flipped?7-col:col))+(prefs.flipped?row+1:8-row);
}
$('board').onpointerdown=e=>{
 if(boardInspect||assistancePaused||busy||game.game_over()||(prefs.mode==='ai'&&game.turn()!==prefs.human)||e.button>0||e.target.closest('[data-alert-square]'))return;
 const button=e.target.closest('[data-square]');if(!button)return;const from=button.dataset.square,p=game.get(from);if(!p||p.color!==game.turn())return;
 drag={from,p,id:e.pointerId,x:e.clientX,y:e.clientY,active:false,ghost:null};
 };
$('board').onpointermove=e=>{
 if(!drag||e.pointerId!==drag.id)return;
 if(!drag.active&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){
  drag.active=true;try{$('board').setPointerCapture(e.pointerId);}catch(error){}selected=drag.from;focusAlert=null;render();
  drag.ghost=document.createElement('div');drag.ghost.className='dragPiece';drag.ghost.innerHTML=pieceSVG(drag.p);document.body.appendChild(drag.ghost);
 }
 if(drag.active){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';e.preventDefault();}
};
$('board').onpointerup=e=>{
 if(!drag||e.pointerId!==drag.id)return;const moved=drag.active,from=drag.from,to=dropSquare(e.clientX,e.clientY);
 removeDrag();try{$('board').releasePointerCapture(e.pointerId);}catch(error){}
 if(moved){suppressClickUntil=Date.now()+500;selected=from;if(to)tapSquare(to,false);else{selected=null;render();}e.preventDefault();}
};
$('board').onpointercancel=()=>{removeDrag();selected=null;render();};
$('board').onclick=e=>{if(assistancePaused||Date.now()<suppressClickUntil)return;
 if(!boardInspect){const square=e.target.closest('[data-square],[data-alert-square]');if(square)tapSquare(square.dataset.square||square.dataset.alertSquare,false);return;}const more=e.target.closest('[data-alert-more]');if(more){showAlerts({square:more.dataset.alertMore});return;}const badge=e.target.closest('[data-alert-type]');if(badge){inspectAlert(visibleAlerts().find(a=>a.type===badge.dataset.alertType&&a.squares?.[0]===badge.dataset.alertSquare));return;}const b=e.target.closest('[data-square]');if(b)tapSquare(b.dataset.square,false);};
$('deeperTactics').onclick=()=>{const key=tacticalPositionKey();stopTacticalAnalysis();tacticCache.delete(key);advancedState={key,alerts:[],status:'idle'};nextTacticBudget=10000;scheduleTacticalAnalysis();renderTacticalStatus();};
$('activeThemes').onclick=e=>{const b=e.target.closest('[data-active-theme]');if(b)showAlerts({type:b.dataset.activeTheme});};

$('finalReview').onclick=openGameReview;$('reviewButton').onclick=openGameReview;
$('undo').onclick=undoMove;$('helpButton').onclick=openHelps;$('settingsButton').onclick=openSettings;
$('seeAlerts').onclick=showAlerts;$('learnButton').onclick=openLessons;$('catalogButton').onclick=openCatalog;$('playButton').onclick=()=>setBoardMode(false);
$('closeSheet').onclick=closeSheet;$('veil').onclick=e=>{if(e.target===$('veil'))closeSheet();};
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeSheet();
 if(e.key==='Tab'&&$('veil').classList.contains('open')){
  const nodes=[...$('veil').querySelectorAll('button,input,select,textarea,summary,a[href]')].filter(n=>!n.disabled&&n.offsetParent!==null),first=nodes[0],last=nodes[nodes.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelThinking();save();render();}else{queueOpponent();scheduleTacticalAnalysis();}});

/* Visible captures, position advantage and post-game review. */
function renderCaptures(id,color,summary){
 const captures=summary.captured[color],counts={};captures.forEach(type=>{counts[type]=(counts[type]||0)+1;});
 const owner=prefs.mode==='ai'?(color===prefs.human?'Tú capturaste':'Rival capturó'):(color==='w'?'Blancas capturaron':'Negras capturaron');
 $(id).innerHTML='<div class="capture-owner"><strong>'+owner+'</strong>Piezas del rival</div>'+
 (captures.length?['q','r','b','n','p'].filter(type=>counts[type]).map(type=>'<span class="captured-group" aria-label="'+counts[type]+' '+PIECE_NAMES[type]+' capturado" title="'+counts[type]+' '+PIECE_NAMES[type]+'">'+pieceSVG({type,color:color==='w'?'b':'w'})+'<b>×'+counts[type]+'</b></span>').join(''):'<span class="captured-empty">Sin capturas todavía</span>')+
 '<span class="capture-total">'+captures.length+' '+(captures.length===1?'captura':'capturas')+'</span>';
}
function paintEvaluation(score,pending){
 $('evalWhite').style.height=scorePercent(score)+'%';
 $('evalBar').classList.toggle('flipped',prefs.flipped);
 $('evalBar').setAttribute('aria-label',scoreDescription(score)+'. '+scoreLabel(score)+'. Blanco indica ventaja blanca; negro indica ventaja negra.');
 $('evalValue').textContent=scoreLabel(score);
 $('evalText').textContent=scoreDescription(score)+(pending?' · analizando…':'')+(score.method==='engine'&&score.kind==='score'?' · estimación':'');
}
function cancelLiveEvaluation(){
 liveId++;if(liveWorker)liveWorker.terminate();liveWorker=null;
 if(liveTimer)clearTimeout(liveTimer);if(liveTimeout)clearTimeout(liveTimeout);
 liveTimer=null;liveTimeout=null;liveRequested=null;
}
function scheduleLiveEvaluation(){
 const fen=game.fen();if(game.game_over()||busy||reviewPaused||practicePaused||assistancePaused||document.hidden||liveRequested===fen||evaluationCache.has(fen))return;
 cancelLiveEvaluation();liveRequested=fen;const id=liveId;
 liveTimer=setTimeout(()=>{
  if(id!==liveId||game.fen()!==fen||busy||reviewPaused||practicePaused||assistancePaused)return;
  const finish=score=>{
   if(id!==liveId||game.fen()!==fen)return;
   if(liveWorker)liveWorker.terminate();liveWorker=null;if(liveTimeout)clearTimeout(liveTimeout);
   const safe=score&&['score','mate','checkmate','draw'].includes(score.kind)?score:materialScore(game);
   evaluationCache.set(fen,safe);if(evaluationCache.size>200)evaluationCache.delete(evaluationCache.keys().next().value);
   paintEvaluation(safe,false);
  };
  try{
   liveWorker=new Worker('./review-worker.js');
   liveTimeout=setTimeout(()=>finish(null),3500);
   liveWorker.onmessage=e=>{if(e.data&&e.data.id===id&&e.data.kind==='position')finish(e.data.score);else if(e.data&&e.data.kind==='error')finish(null);};
   liveWorker.onerror=e=>{e.preventDefault();finish(null);};
   liveWorker.postMessage({kind:'position',id,fen});
  }catch(error){finish(null);}
 },260);
}
function renderInsights(){
 const material=materialSummary(game),top=prefs.flipped?'w':'b';
 renderCaptures('topCaptures',top,material);renderCaptures('bottomCaptures',top==='w'?'b':'w',material);
 $('materialBalance').textContent=material.balance===0?'Material igualado':(material.balance>0?'Blancas +':'Negras +')+Math.abs(material.balance)+' material';
 const terminal=terminalScore(game),score=terminal||evaluationCache.get(game.fen())||materialScore(game);
 paintEvaluation(score,!terminal&&!evaluationCache.has(game.fen())&&!busy);
 $('finalReport').classList.toggle('hidden',!game.game_over());
 $('finalResult').textContent=terminal?scoreLabel(terminal)+(terminal.kind==='draw'?' · Tablas':' · '+(terminal.winner==='w'?'Ganan blancas':'Ganan negras')):'';
 $('finalReason').textContent=game.game_over()?statusText():'';
 $('reviewButton').disabled=game.history().length===0;
 $('reviewButton').textContent=game.game_over()?'Volver a evaluar la partida':'Ver análisis de la partida';
 scheduleLiveEvaluation();
}
function stopReviewAnalysis(){
 reviewJob++;if(reviewWorker)reviewWorker.terminate();reviewWorker=null;
 if(reviewTimeout)clearTimeout(reviewTimeout);reviewTimeout=null;
}
function reviewKey(){return startFen+'|'+game.history().join(' ');}
function openGameReview(){
 reviewVisibleFen=null;
 const key=reviewKey(),moves=game.history({verbose:true}).map(m=>({from:m.from,to:m.to,promotion:m.promotion}));
 cancelThinking();cancelLiveEvaluation();stopReviewAnalysis();reviewPaused=true;
 openSheet(game.game_over()?'Evaluación final':'Revisión de la partida','<div class="review-progress"><strong id="reviewStatus">Analizando las jugadas…</strong><progress id="reviewProgress" value="0" max="'+Math.max(1,moves.length)+'"></progress><p class="small">Puedes cerrar este panel para detener el análisis. Tu partida se conserva.</p></div><div id="reviewContent"></div>');
 if(lastReview&&lastReview.key===key){showReviewReport(lastReview.report);return;}
 const id=reviewJob;
 function fail(){
  if(id!==reviewJob)return;stopReviewAnalysis();
  if($('reviewStatus'))$('reviewStatus').textContent='No se pudo completar el análisis del motor.';
  if($('reviewContent'))$('reviewContent').innerHTML='<p>El resultado y las capturas siguen disponibles. Cierra y vuelve a abrir para reintentar.</p>';
 }
 try{
  reviewWorker=new Worker('./review-worker.js');
  reviewTimeout=setTimeout(fail,Math.max(12000,moves.length*700+5000));
  reviewWorker.onmessage=e=>{
   const data=e.data;if(id!==reviewJob||!data||data.id!==id)return;
   if(data.kind==='progress'){
    if($('reviewStatus'))$('reviewStatus').textContent='Revisadas '+data.done+' de '+data.total+' jugadas';
    if($('reviewProgress'))$('reviewProgress').value=data.done;
   }else if(data.kind==='review'){
    if(reviewTimeout)clearTimeout(reviewTimeout);if(reviewWorker)reviewWorker.terminate();reviewWorker=null;
    lastReview={key,report:data.report};showReviewReport(data.report);
   }else if(data.kind==='error')fail();
  };
  reviewWorker.onerror=e=>{e.preventDefault();fail();};
  reviewWorker.postMessage({kind:'review',id,startFen,moves});
 }catch(error){fail();}
}
function reviewChart(report){
 const points=report.positions.map((p,i)=>[20+(i/Math.max(1,report.positions.length-1))*320,80-scoreNumber(p.score)/1000*65]);
 const path=points.map(p=>p.join(',')).join(' ');
 return '<svg class="review-chart" viewBox="0 0 360 160" role="img" aria-label="Evolución de la ventaja. Arriba favorece a blancas; abajo, a negras. Cada punto corresponde a media jugada."><rect x="20" y="15" width="320" height="65" fill="#f5f0df"/><rect x="20" y="80" width="320" height="65" fill="#e2e9e3"/><line x1="20" y1="80" x2="340" y2="80" stroke="#97a59a" stroke-dasharray="4 3"/><text x="23" y="29" font-size="9" fill="#476458">Blancas</text><text x="23" y="140" font-size="9" fill="#476458">Negras</text><polyline points="'+path+'" fill="none" stroke="#176d64" stroke-width="2.5" stroke-linejoin="round"/></svg>';
}
function reviewMoveLabel(row){return (row.fullmove||Math.floor(row.index/2)+1)+(row.move.color==='w'?'. ':'… ')+row.move.san;}
function showReviewReport(report){
 if(!reviewPaused)return;reviewVisibleFen=null;
 const terminal=report.final,whiteErrors=report.rows.filter(r=>r.move.color==='w'&&r.tone==='bad').length,blackErrors=report.rows.filter(r=>r.move.color==='b'&&r.tone==='bad').length;
 let title=terminal?scoreLabel(terminal)+' · '+(terminal.kind==='draw'?'Tablas':terminal.winner==='w'?'Ganan blancas':'Ganan negras'):'Partida en curso';
 const dropped=report.rows.filter(r=>r.tone==='bad'||r.tone==='notice').sort((a,b)=>(b.loss??10000)-(a.loss??10000)).slice(0,3);
 const moves=report.rows;
 $('sheetBody').innerHTML='<h3 class="review-summary-title">'+esc(title)+'</h3><p>'+moves.length+' medias jugadas · '+(prefs.mode==='ai'?'Rival nivel '+prefs.level:'Dos jugadores')+'</p>'+
 '<div class="review-stats"><div class="review-stat"><span class="small">Capturas de blancas</span><strong>'+report.material.captured.w.length+'</strong><span class="small">'+whiteErrors+' jugadas para revisar</span></div><div class="review-stat"><span class="small">Capturas de negras</span><strong>'+report.material.captured.b.length+'</strong><span class="small">'+blackErrors+' jugadas para revisar</span></div></div>'+
 reviewChart(report)+'<div class="review-legend"><span>Inicio</span><span>Ventaja limitada a ±10 en el gráfico</span><span>Final</span></div>'+
 '<p class="review-method">Análisis orientativo de GarboChess, con búsqueda breve. Los valores son unidades aproximadas de peón, vistas desde blancas. No calculamos Elo ni una precisión certificada.</p>'+
 (dropped.length?'<div class="group">Momentos para aprender</div>'+dropped.map(r=>'<button class="review-row '+r.tone+'" data-review-index="'+r.index+'"><span><span class="move-name">'+esc(reviewMoveLabel(r))+'</span>'+esc(r.category)+(r.suggestion?' · alternativa: '+esc(r.suggestion.san):'')+'</span><span class="review-score">'+(r.loss!==null?(r.loss/100).toFixed(1)+' de caída':'Ver posición')+'</span></button>').join(''):'<p>No se detectaron caídas grandes con este análisis breve. Eso no garantiza que todas las jugadas sean óptimas.</p>')+
 '<div class="group">Todas las jugadas</div>'+moves.map(r=>'<button class="review-row '+r.tone+'" data-review-index="'+r.index+'"><span><span class="move-name">'+esc(reviewMoveLabel(r))+'</span>'+esc(r.category)+'</span><span class="review-score">'+scoreLabel(r.before)+' → '+scoreLabel(r.after)+'</span></button>').join('')+
 '<p class="small">Criterios orientativos: estable &lt;0,4; imprecisión 0,4–0,99; error 1–2,49; error importante ≥2,5 peones de caída. Las líneas de mate se tratan por separado.</p>';
 $('sheetBody').onclick=e=>{const target=e.target.closest('[data-review-index]');if(target)showReviewedPosition(report,Number(target.dataset.reviewIndex));};
}
function showReviewedPosition(report,index,view='before'){
 const row=report.rows[index];if(!row)return;
 const fen=view==='played'?row.afterFen:view==='best'&&row.suggestion?row.suggestion.fen:row.beforeFen;
 reviewVisibleFen=fen;const c=new Chess(fen),map=boardMap(c),move=view==='best'&&row.suggestion?row.suggestion:row.move;
 let board='';
 for(let rank=8;rank>=1;rank--)for(let file=0;file<8;file++){
  const square=String.fromCharCode(97+file)+rank,p=map[square];
  board+='<div class="sq '+((8-rank+file)%2?'dark':'')+((square===move.from||square===move.to)?' last':'')+'" aria-label="'+square+'">'+(p?pieceSVG(p):'')+'</div>';
 }
 $('sheetBody').innerHTML='<h3 class="review-summary-title">'+esc(reviewMoveLabel(row))+'</h3><p>'+esc(row.category)+(row.loss!==null?' · caída estimada: '+(row.loss/100).toFixed(1)+' peones':'')+'</p>'+
 '<div class="review-tabs"><button data-position-view="before" class="'+(view==='before'?'active':'')+'">Antes</button><button data-position-view="played" class="'+(view==='played'?'active':'')+'">Jugada realizada</button>'+(row.suggestion?'<button data-position-view="best" class="'+(view==='best'?'active':'')+'">Alternativa '+esc(row.suggestion.san)+'</button>':'')+'</div>'+
 '<div class="mini-board" role="img" aria-label="Posición de la jugada seleccionada">'+board+'</div><p>Evaluación de la jugada realizada, desde blancas: <strong>'+scoreLabel(row.before)+' → '+scoreLabel(row.after)+'</strong>.</p><p class="small">La alternativa es la preferida por el motor en su búsqueda breve. Esta vista no modifica tu partida.</p><div class="btnrow"><button id="prevReview" '+(index===0?'disabled':'')+'>← Anterior</button><button id="reviewOverview">Resumen</button><button id="nextReview" '+(index===report.rows.length-1?'disabled':'')+'>Siguiente →</button></div>';
 $('sheetBody').onclick=e=>{const t=e.target.closest('[data-position-view]');if(t)showReviewedPosition(report,index,t.dataset.positionView);};
 $('prevReview').onclick=()=>showReviewedPosition(report,index-1);$('nextReview').onclick=()=>showReviewedPosition(report,index+1);$('reviewOverview').onclick=()=>showReviewReport(report);
}

render();queueOpponent();

$("boot").classList.add("hidden");
if(startupNotice){$('boot').textContent=startupNotice;$('boot').classList.remove('hidden');}
if('serviceWorker' in navigator && location.protocol!=='file:'){
 navigator.serviceWorker.register('./sw.js').then(async()=>{
  await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller)await new Promise((resolve,reject)=>{
   const finish=()=>{if(navigator.serviceWorker.controller){clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',finish);resolve();}};
   const timer=setTimeout(()=>{navigator.serviceWorker.removeEventListener('controllerchange',finish);reject(Error('Sin controlador offline'));},8000);
   navigator.serviceWorker.addEventListener('controllerchange',finish);finish();
  });
  $('offlineNote').textContent='Lista para jugar sin conexión después de esta carga.';
 }).catch(()=>{$('offlineNote').textContent='No se pudo preparar el modo sin conexión. Puedes jugar mientras tengas esta página abierta.';});
}else{$('offlineNote').textContent='Abre la dirección HTTPS en Safari para preparar el modo sin conexión.';}
