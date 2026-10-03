const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topicById=Object.fromEntries(CATALOG.map(t=>[t.id,t]));
const symbols={attacked:'!',defended:'◆',undefended:'○',check:'!',pin:'↗',skewer:'↗',xRayAttack:'⋯',fork:'⑂',advancedPawn:'↑',castling:'↔',enPassant:'×',promotion:'↑',underPromotion:'↑',doubleCheck:'!!',mate:'#',mateIn1:'#1',discoveredAttack:'↗',discoveredCheck:'+'};
const pieceGlyph={p:'♟',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚'};
let game=new Chess(),startFen=game.fen(),selected=null,focusAlert=null,busy=false,worker=null,job=0,fallbackTimer=null,watchdogTimer=null,engineMode='GarboChess',cache=null,pendingPromotion=null,storageOK=true;
let prefs={mode:'ai',human:'w',level:2,flipped:false,enabled:['attacked','check','pin'],lines:true};

function backupData(){return {app:'ajedrex',version:1,prefs:{...prefs,enabled:[...prefs.enabled]},startFen,moves:game.history({verbose:true}).map(m=>({from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})}))};}
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
  enabled:Array.isArray(p.enabled)?[...new Set(p.enabled.filter(t=>ACTIVE_THEMES.includes(t)))]:['attacked','check','pin']
 };
 return {restored,startFen:value.startFen,prefs:clean};
}
let startupNotice='';
try{
 const raw=localStorage.getItem('ajedrez-pistas-v1');
 if(raw){try{const value=validateBackup(JSON.parse(raw));game=value.restored;startFen=value.startFen;prefs=value.prefs;}
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
 const checked=validateBackup(value);cancelThinking();game=checked.restored;startFen=checked.startFen;prefs=checked.prefs;
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
 const key=game.fen()+'|'+prefs.enabled.includes('mateIn1');
 if(!cache||cache.key!==key)cache={key,...analyzeChess(game,{mateIn1:prefs.enabled.includes('mateIn1')})};
 return cache;
}
function visibleAlerts(){return analysis().alerts.filter(a=>prefs.enabled.includes(a.type));}
function center(s){let[x,y]=xy(s);let col=prefs.flipped?7-x:x,row=prefs.flipped?y:7-y;return[(col+.5)*12.5,(row+.5)*12.5];}
function statusText(){
 if(game.in_checkmate())return 'Jaque mate · ganan '+(game.turn()==='w'?'negras':'blancas');
 if(game.in_stalemate())return 'Tablas por ahogado';
 if(game.in_threefold_repetition())return 'Tablas por repetición';
 if(game.insufficient_material())return 'Tablas por material insuficiente';
 if(game.in_draw())return 'Tablas';
 if(busy)return 'El rival está pensando…';
 return (game.turn()==='w'?'Blancas':'Negras')+' · '+(game.in_check()?'en jaque':prefs.mode==='ai'&&game.turn()===prefs.human?'tu turno':'su turno');
}
function render(){
 const a=analysis(),alerts=visibleAlerts(),history=game.history({verbose:true}),last=history[history.length-1];
 if(focusAlert&&!alerts.some(x=>JSON.stringify(x)===JSON.stringify(focusAlert)))focusAlert=null;
 const priority={mate:0,check:1,doubleCheck:1,mateIn1:2,pin:3,skewer:4,xRayAttack:5,fork:6,attacked:7,undefended:8,defended:20};
 const sorted=[...alerts].sort((a,b)=>(priority[a.type]??12)-(priority[b.type]??12));
 const badgeBySquare={};for(const alert of sorted){const s=alert.squares[0];if(!badgeBySquare[s])badgeBySquare[s]=alert;}
 const targets=selected?a.legal.filter(m=>m.from===selected):[];
 let html='';
 for(let row=0;row<8;row++)for(let col=0;col<8;col++){
  const file=prefs.flipped?7-col:col,rank=prefs.flipped?row+1:8-row,s=String.fromCharCode(97+file)+rank,p=a.map[s],target=targets.find(m=>m.to===s),badge=badgeBySquare[s];
  const cls=['sq',(row+col)%2?'dark':'',selected===s?'selected':'',last&&(last.from===s||last.to===s)?'last':'',target?'target':'',target&&p?'capture':''].filter(Boolean).join(' ');
  const label=s+(p?' '+PIECE_NAMES[p.type]+' '+(p.color==='w'?'blanco':'negro'):' vacía')+(badge?', aviso: '+topicById[badge.type].name:'');
  html+='<button class="'+cls+'" data-square="'+s+'" aria-label="'+esc(label)+'" aria-pressed="'+(selected===s)+'">'+(p?pieceSVG(p):'')+(col===0?'<span class="coord rank">'+rank+'</span>':'')+(row===7?'<span class="coord file">'+s[0]+'</span>':'')+(badge?'<span class="badge '+badge.type+'" data-alert-square="'+s+'" title="Ver aviso">'+symbols[badge.type]+'</span>':'')+'</button>';
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
  $('hintText').textContent=selected?'Los puntos indican movimientos legales. Toca un símbolo para entender su aviso.':game.game_over()?statusText()+'. Puedes deshacer o comenzar otra partida.':alerts.length?'Toca los símbolos del tablero o «Ver avisos» para descubrir qué está pasando.':'Toca una pieza y después su destino. Activa las pistas que quieras desde Ayudas.';
  $('hintAction').innerHTML='';
 }
 $('storageNote').textContent=storageOK?'Guardado en este navegador. Exporta una copia desde Partida para conservarla.':'Esta vista no permite guardar automáticamente. Conserva tu partida copiando el PGN.';
 $('engineNote').textContent=prefs.mode==='ai'?engineMode+' · dificultad orientativa, sin Elo certificado':'Partida local en el mismo teléfono';
}
let previousFocus=null;
function openSheet(title,html){
 if(!$('veil').classList.contains('open'))previousFocus=document.activeElement;
 $('sheetBody').onclick=null;$('sheetBody').onchange=null;
 $('sheetTitle').textContent=title;$('sheetBody').innerHTML=html;$('veil').classList.add('open');$('veil').setAttribute('aria-hidden','false');
 document.body.style.overflow='hidden';$('closeSheet').focus();
}
function closeSheet(){ $('veil').classList.remove('open');$('veil').setAttribute('aria-hidden','true');document.body.style.overflow='';pendingPromotion=null;if(previousFocus&&previousFocus.isConnected)previousFocus.focus();}
function toggleTheme(id,on){if(!ACTIVE_THEMES.includes(id))return;if(on){if(!prefs.enabled.includes(id))prefs.enabled.push(id);}else prefs.enabled=prefs.enabled.filter(x=>x!==id);focusAlert=null;save();render();}
function openHelps(){
 const groups=[...new Set(CATALOG.filter(t=>ACTIVE_THEMES.includes(t.id)).map(t=>t.group))];
 let html='<p>Estas <strong>'+ACTIVE_THEMES.length+' ayudas</strong> detectan patrones o movimientos legales en la posición actual. Las combinaciones no implican ganancia garantizada.</p><div class="pills"><button data-preset="basic">Básico</button><button data-preset="middle">Intermedio</button><button data-preset="all">Todas</button><button data-preset="none">Apagar</button></div>';
 for(const group of groups){html+='<div class="group">'+esc(group)+'</div>';for(const t of CATALOG.filter(t=>t.group===group&&ACTIVE_THEMES.includes(t.id)))html+='<div class="row"><div><strong>'+esc(t.name)+'</strong><div class="small">'+esc(t.description)+'</div></div><label class="switch"><input type="checkbox" data-theme="'+t.id+'" aria-label="'+esc(t.name)+'" '+(prefs.enabled.includes(t.id)?'checked':'')+'><span></span></label></div>';}
 html+='<div class="row"><div><strong>Mostrar líneas</strong><div class="small">Los rayos X aparecen semitransparentes.</div></div><label class="switch"><input type="checkbox" id="lineSwitch" aria-label="Mostrar líneas" '+(prefs.lines?'checked':'')+'><span></span></label></div><p>El catálogo completo incluye 81 fichas. Los temas avanzados aún sin detector están identificados allí.</p><button class="primary" id="allCatalog">Abrir catálogo completo</button>';
 openSheet('Tus ayudas',html);
 $('sheetBody').onchange=e=>{if(e.target.dataset.theme)toggleTheme(e.target.dataset.theme,e.target.checked);if(e.target.id==='lineSwitch'){prefs.lines=e.target.checked;save();render();}};
 $('sheetBody').onclick=e=>{
  const preset=e.target.closest('[data-preset]');
  if(preset){const p=preset.dataset.preset;prefs.enabled=p==='none'?[]:p==='all'?[...ACTIVE_THEMES]:p==='basic'?['attacked','undefended','check']:['attacked','check','pin','fork','xRayAttack'];save();render();openHelps();}
 };
 $('allCatalog').onclick=openCatalog;
}
function catalogType(t){return ACTIVE_THEMES.includes(t.id)?'active':['Fase','Finales','Objetivos','Origen','Longitud','Selección'].includes(t.group)?'filter':'pending';}
function openCatalog(){
 openSheet('Catálogo · 81 temas','<p>75 temas de Lichess y 6 ayudas adicionales. Las fichas explican todos los temas; las etiquetas indican cuáles tienen detección automática.</p><input class="search" id="catalogSearch" type="search" placeholder="Buscar: rayos X, mate, clavada…" aria-label="Buscar tema"><select class="fieldselect" id="catalogFilter" aria-label="Filtrar catálogo"><option value="all">Todos los temas</option><option value="active">Con detector disponible</option><option value="pending">Detección pendiente</option><option value="filter">Filtros para futuros ejercicios</option></select><div class="small" id="catalogCount"></div><div id="catalogList"></div>');
 $('sheetBody').onclick=null;$('sheetBody').onchange=null;
 function update(){
  const q=$('catalogSearch').value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,''),filter=$('catalogFilter').value;
  const rows=CATALOG.filter(t=>(filter==='all'||catalogType(t)===filter)&&(t.name+' '+t.description+' '+t.group).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q));
  $('catalogCount').textContent=rows.length+' temas';
  $('catalogList').innerHTML=rows.map(t=>'<details class="topic"><summary>'+esc(t.name)+'<br><span class="chip">'+esc(t.group)+'</span><span class="chip '+(catalogType(t)==='active'?'':'pending')+'">'+(catalogType(t)==='active'?'Detector disponible':catalogType(t)==='filter'?'Filtro de ejercicios':'Detección pendiente')+'</span></summary><p>'+esc(t.description)+'</p>'+(catalogType(t)==='active'?'<label class="row"><strong>Mostrar avisos</strong><span class="switch"><input type="checkbox" data-theme="'+t.id+'" aria-label="Activar '+esc(t.name)+'" '+(prefs.enabled.includes(t.id)?'checked':'')+'><span></span></span></label>':catalogType(t)==='filter'?'<p class="small">Categoría reservada para un futuro banco de ejercicios; no genera iconos en la partida.</p>':'<p class="small">Ficha disponible. La detección y verificación automática de este tema todavía no están implementadas.</p>')+'</details>').join('')||'<p>No hay temas con esa búsqueda.</p>';
 }
 $('catalogSearch').oninput=update;$('catalogFilter').onchange=update;
 $('catalogList').onchange=e=>{if(e.target.dataset.theme)toggleTheme(e.target.dataset.theme,e.target.checked);};update();
}
function showAlerts(){
 const alerts=visibleAlerts();
 openSheet('Avisos de la posición',alerts.length?'<p>Selecciona un aviso para verlo sobre el tablero.</p>'+alerts.map((a,i)=>'<button class="lesson" data-choose-alert="'+i+'"><strong>'+esc(topicById[a.type].name)+' · '+esc(a.squares[0])+'</strong><span class="small">'+esc(a.message)+'</span></button>').join(''):'<p>No hay avisos de los tipos que tienes activados en esta posición.</p><button id="enableHelps">Configurar ayudas</button>');
 $('sheetBody').onchange=null;$('sheetBody').onclick=e=>{const b=e.target.closest('[data-choose-alert]');if(b){focusAlert=alerts[Number(b.dataset.chooseAlert)];selected=null;closeSheet();render();}};
 if($('enableHelps'))$('enableHelps').onclick=openHelps;
}
function cancelThinking(){job++;if(watchdogTimer)clearTimeout(watchdogTimer);watchdogTimer=null;if(worker){worker.terminate();worker=null;}if(fallbackTimer)clearTimeout(fallbackTimer);fallbackTimer=null;busy=false;}
function makeMove(m){const made=game.move(m);if(!made)return false;selected=null;focusAlert=null;cache=null;save();render();animateMove(made);queueOpponent();return true;}
function queueOpponent(){
 if(prefs.mode!=='ai'||game.turn()===prefs.human||game.game_over()||busy)return;
 busy=true;const id=++job,fen=game.fen(),startedAt=Date.now();render();
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
 const alerts=visibleAlerts();
 if(isBadge){const candidates=alerts.filter(a=>a.squares[0]===s);if(candidates.length){const index=focusAlert?candidates.findIndex(a=>JSON.stringify(a)===JSON.stringify(focusAlert)):-1;focusAlert=candidates[(index+1)%candidates.length];render();return;}}
 if(busy||game.game_over()||(prefs.mode==='ai'&&game.turn()!==prefs.human))return;
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
 $('newGame').onclick=()=>{if(game.history().length&&!window.confirm('¿Comenzar otra partida y sustituir la actual?'))return;cancelThinking();prefs.mode=$('modeSelect').value;prefs.human=$('colorSelect').value;prefs.level=Number($('levelSelect').value);prefs.flipped=prefs.human==='b';game=new Chess();startFen=game.fen();selected=null;focusAlert=null;cache=null;save();closeSheet();render();queueOpponent();};
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
 openSheet('Primera versión','<p><strong>Ajedrex · v0.2</strong><br>Tablero táctil, reglas legales, rival GarboChess, 18 ayudas y 81 fichas del catálogo.</p><p>Proyecto personal de hobby. Abre su dirección web en Safari; puedes usar Compartir → Añadir a pantalla de inicio. La primera carga necesita conexión. El indicador inferior confirma cuándo está preparada la copia sin conexión.</p><p>Stockfish, los detectores avanzados y un banco completo de ejercicios quedan pendientes. GarboChess está incluido en los archivos del proyecto. Los patrones geométricos no prometen ganar material. Las reglas de tablas por repetición y 50 jugadas se aplican automáticamente en esta prueba.</p><p>Fuentes: <a href="https://github.com/glinscott/Garbochess-JS" target="_blank" rel="noopener">GarboChess</a>, <a href="https://github.com/jhlywa/chess.js/tree/v0.13.4" target="_blank" rel="noopener">chess.js 0.13.4</a> y <a href="https://github.com/lichess-org/lila/blob/master/translation/source/puzzleTheme.xml" target="_blank" rel="noopener">temas de Lichess</a>.</p><details class="topic"><summary>Licencias de los componentes</summary><pre class="legal">'+esc(LICENSE_TEXT)+'</pre></details>');
 $('sheetBody').onclick=null;$('sheetBody').onchange=null;
}
function openLessons(){
 openSheet('Prueba las pistas','<p>Seis posiciones preparadas para explorar los avisos. Abrir una sustituye la partida actual y activa dos jugadores para que puedas experimentar.</p>'+FIXTURES.map((f,i)=>'<button class="lesson" data-lesson="'+i+'"><strong>'+esc(f.name)+'</strong><span class="small">'+esc(topicById[f.expected].description)+'</span></button>').join('')+'<button class="primary" id="learnCatalog">Explorar los 81 temas</button>');
 $('sheetBody').onchange=null;$('sheetBody').onclick=e=>{
  const b=e.target.closest('[data-lesson]');if(!b)return;
  if(game.history().length&&!window.confirm('Abrir el ejemplo sustituirá la partida actual. Puedes exportarla desde Partida. ¿Continuar?'))return;
  const f=FIXTURES[Number(b.dataset.lesson)];cancelThinking();game=new Chess(f.fen);startFen=f.fen;prefs.mode='local';prefs.flipped=false;
  if(!prefs.enabled.includes(f.expected))prefs.enabled.push(f.expected);
  selected=null;cache=null;focusAlert=null;save();closeSheet();render();
  focusAlert=visibleAlerts().find(a=>a.type===f.expected)||null;render();
 };
 $('learnCatalog').onclick=openCatalog;
}

let drag=null,suppressClickUntil=0;
function removeDrag(){if(drag&&drag.ghost)drag.ghost.remove();drag=null;}
function dropSquare(x,y){
 const r=$('board').getBoundingClientRect();if(x<r.left||x>=r.right||y<r.top||y>=r.bottom)return null;
 const col=Math.floor((x-r.left)/r.width*8),row=Math.floor((y-r.top)/r.height*8);
 return String.fromCharCode(97+(prefs.flipped?7-col:col))+(prefs.flipped?row+1:8-row);
}
$('board').onpointerdown=e=>{
 if(busy||game.game_over()||(prefs.mode==='ai'&&game.turn()!==prefs.human)||e.button>0||e.target.closest('[data-alert-square]'))return;
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
$('board').onclick=e=>{if(Date.now()<suppressClickUntil)return;const b=e.target.closest('[data-square]');if(b)tapSquare(b.dataset.square,Boolean(e.target.closest('[data-alert-square]')));};

$('undo').onclick=undoMove;$('helpButton').onclick=openHelps;$('settingsButton').onclick=openSettings;
$('seeAlerts').onclick=showAlerts;$('learnButton').onclick=openLessons;$('catalogButton').onclick=openCatalog;$('playButton').onclick=()=>{selected=null;focusAlert=null;render();};
$('closeSheet').onclick=closeSheet;$('veil').onclick=e=>{if(e.target===$('veil'))closeSheet();};
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeSheet();
 if(e.key==='Tab'&&$('veil').classList.contains('open')){
  const nodes=[...$('veil').querySelectorAll('button,input,select,textarea,summary,a[href]')].filter(n=>!n.disabled&&n.offsetParent!==null),first=nodes[0],last=nodes[nodes.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelThinking();save();render();}else queueOpponent();});
render();queueOpponent();

$("boot").classList.add("hidden");
if(startupNotice){$('boot').textContent=startupNotice;$('boot').classList.remove('hidden');}
if('serviceWorker' in navigator && location.protocol!=='file:'){
 navigator.serviceWorker.register('./sw.js').then(async()=>{
  await navigator.serviceWorker.ready;
  $('offlineNote').textContent='Lista para jugar sin conexión después de esta carga.';
 }).catch(()=>{$('offlineNote').textContent='No se pudo preparar el modo sin conexión. Puedes jugar mientras tengas esta página abierta.';});
}else{$('offlineNote').textContent='Abre la dirección HTTPS en Safari para preparar el modo sin conexión.';}
