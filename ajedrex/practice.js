
/* Practice interface. A separate board pauses, rather than replaces, the current game. */
let practicePaused=false,practiceSession=null,practiceProgress={},practiceStorageOK=true;
try{practiceProgress=cleanPracticeProgress(JSON.parse(localStorage.getItem('ajedrex-practice-v1')||'{}'));}catch(error){practiceStorageOK=false;}
function beginPractice(){
 if(practicePaused)return;practicePaused=true;cancelThinking();
}
function finishPractice(){
 if(!practicePaused)return;practicePaused=false;practiceSession=null;render();queueOpponent();scheduleLiveEvaluation();scheduleTacticalAnalysis();
}
function savePracticeProgress(){
 practiceProgress=cleanPracticeProgress(practiceProgress);
 try{localStorage.setItem('ajedrex-practice-v1',JSON.stringify(practiceProgress));practiceStorageOK=true;}catch(error){practiceStorageOK=false;}
}
function openPracticeGallery(){
 beginPractice();practiceSession=null;
 openSheet('Practicar · 60 temas','<p>Aprende el significado de los iconos con un tablero de práctica. Tu partida queda pausada.</p><div class="practice-progress" id="practiceProgressSummary"></div><input id="practiceSearch" class="search" type="search" placeholder="Buscar: clavada, mate, coronación…" aria-label="Buscar práctica"><select id="practiceFilter" class="fieldselect" aria-label="Tipo de práctica"><option value="all">Todos los ejemplos</option><option value="spot">Reconocer un patrón</option><option value="play">Probar jugadas</option><option value="remaining">Por completar</option></select><div class="small" id="practiceCount"></div><div id="practiceList"></div><button class="primary practice-return" id="practiceReturn">Volver a mi partida</button>');
 function update(){
  const query=normalizeSearch($('practiceSearch').value),filter=$('practiceFilter').value;
  const lessons=PRACTICE_LESSONS.filter(l=>(filter==='all'||filter===l.task||(filter==='remaining'&&!practiceProgress[l.id]))&&normalizeSearch(topicById[l.id].name+' '+topicById[l.id].description+' '+topicById[l.id].group).includes(query));
  const completed=Object.keys(practiceProgress).length,assisted=Object.values(practiceProgress).filter(v=>v==='assisted').length;
  $('practiceProgressSummary').textContent=completed+' de 60 ejemplos completados'+(assisted?' · '+assisted+' con ayuda':'');
  $('practiceCount').textContent=lessons.length+' ejemplos'+(!practiceStorageOK?' · El navegador no permite guardar el progreso.':'');
  $('practiceList').innerHTML=lessons.map(l=>'<button class="lesson practice-lesson" data-practice="'+l.id+'"><span class="help-icon">'+themeIcon(l.id)+'</span><span><strong>'+esc(topicById[l.id].name)+'</strong><span class="small">'+(l.task==='spot'?'Reconocer el patrón':'Probar una variante')+' · '+esc(topicById[l.id].group)+'</span><span class="chip">'+(practiceProgress[l.id]==='solved'?'Completado':practiceProgress[l.id]==='assisted'?'Completado con ayuda':'Por explorar')+'</span></span></button>').join('')||'<p>No hay ejemplos con ese filtro.</p>';
 }
 $('practiceSearch').oninput=update;$('practiceFilter').onchange=update;
 $('practiceList').onclick=e=>{const b=e.target.closest('[data-practice]');if(b)openPractice(b.dataset.practice);};
 $('practiceReturn').onclick=closeSheet;update();
}
function openPractice(id){
 const lesson=PRACTICE_LESSONS.find(l=>l.id===id);if(!lesson)return;
 beginPractice();practiceSession=createPracticeSession(lesson);renderPractice(true);
}
function practiceBoardCenter(square,flipped){const [x,y]=xy(square);return[(flipped?7-x:x)*12.5+6.25,(flipped?y:7-y)*12.5+6.25];}
function renderPractice(fresh=false){
 const s=practiceSession;if(!s)return;
 const topic=topicById[s.lesson.id],flipped=s.player==='b',map=boardMap(s.chess),history=s.chess.history({verbose:true}),last=history[history.length-1],expected=practiceExpected(s);
 const options=s.selected?s.chess.moves({verbose:true}).filter(m=>m.from===s.selected):[];
 let board='';
 for(let row=0;row<8;row++)for(let col=0;col<8;col++){
  const square=String.fromCharCode(97+(flipped?7-col:col))+(flipped?row+1:8-row),piece=map[square];
  const hinted=s.hinted&&(s.lesson.task==='spot'?s.lesson.targets.includes(square):expected?.slice(0,2)===square);
  const correct=s.solved&&s.correctSquare===square;
  const marker=hinted||correct;
  const classes=['sq',(row+col)%2?'dark':'',s.selected===square?'selected':'',options.some(m=>m.to===square)?'target':'',last&&(last.from===square||last.to===square)?'last':'',hinted?'practice-hint':'',correct?'practice-correct':''].filter(Boolean).join(' ');
  board+='<button class="'+classes+'" data-practice-square="'+square+'" aria-label="'+square+(piece?' '+PIECE_NAMES[piece.type]+' '+(piece.color==='w'?'blanco':'negro'):' vacía')+'" aria-pressed="'+(s.selected===square)+'">'+(piece?pieceSVG(piece):'')+(col===0?'<span class="coord rank">'+square[1]+'</span>':'')+(row===7?'<span class="coord file">'+square[0]+'</span>':'')+(marker?'<span class="practice-marker">'+themeIcon(s.lesson.id)+'</span>':'')+'</button>';
 }
 let arrows='';
 if(s.lesson.task==='spot'&&(s.hinted||s.solved)){
  const observed=s.observation||s.lesson.observations[0];
  for(const [from,to]of observed?.lines||[]){const [x1,y1]=practiceBoardCenter(from,flipped),[x2,y2]=practiceBoardCenter(to,flipped);arrows+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#8156c2" stroke-width="1" opacity=".55" stroke-dasharray="'+(s.lesson.id==='xRayAttack'?'2 2':'0')+'"/>';}
 }
 const reply=practiceWaitingReply(s),activeLine=s.paths[0]||[],review=new Chess(s.lesson.startFen),lineLabels=activeLine.map(uci=>{const move=review.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]});return move?move.san:uci;});
 const solved=s.solved?'<div class="practice-success" role="status">Ejemplo completado'+(s.assisted?' con ayuda':'')+'.</div>':'';
 const explanation=s.solved||s.revealed?practiceExplanation(s):topic.description;
 const html='<div class="practice-heading"><span class="large-theme-icon">'+themeIcon(s.lesson.id)+'</span><div><strong>'+esc(topic.name)+'</strong><div class="small">'+(s.lesson.task==='spot'?'Reconocer un patrón':(s.player==='w'?'Juegas con blancas':'Juegas con negras'))+' · '+confidenceLabel({confidence:s.lesson.confidence})+'</div></div></div><p class="practice-prompt">'+esc(s.lesson.prompt)+'</p>'+
 '<div class="practice-board-wrap"><div class="mini-board practice-board" id="practiceBoard" role="group" aria-label="Tablero de práctica">'+board+'</div><svg class="practice-lines" viewBox="0 0 100 100" aria-hidden="true">'+arrows+'</svg></div>'+
 '<div class="practice-feedback '+s.noticeKind+'" id="practiceFeedback" role="status" aria-live="polite">'+esc(s.notice|| (s.lesson.task==='spot'?'Toca la pieza que cumple esa función.':'Toca origen y destino para probar una jugada.'))+'</div>'+
 (s.pending?'<div class="promotion practice-promotion" aria-label="Elige la pieza de coronación">'+s.pending.choices.map(type=>'<button data-practice-promote="'+type+'" aria-label="Coronar a '+PIECE_NAMES[type]+'">'+pieceSVG({type,color:s.player})+'<span class="small">'+PIECE_NAMES[type]+'</span></button>').join('')+'</div>':'')+
 solved+'<div class="practice-actions">'+(!s.solved?'<button id="practiceHint">Pista</button><button id="practiceReveal">'+(s.revealed?'Variante visible':'Ver explicación')+'</button>':'')+(reply?'<button class="primary" id="practiceReply">Ver respuesta del rival</button>':s.revealed&&s.lesson.task==='play'&&!s.solved?'<button class="primary" id="practiceStep">Mostrar siguiente paso</button>':'')+'</div>'+
 (s.revealed&&activeLine.length?'<ol class="practice-line" aria-label="Variante del ejemplo">'+lineLabels.map((label,i)=>'<li class="'+(i<s.index?'played':'')+'">'+esc(label)+'</li>').join(''):'')+
 '<p class="practice-explanation">'+esc(explanation)+'</p><p class="small">'+esc(THEME_META[s.lesson.id].scope)+'</p>'+
 '<div class="btnrow"><button id="practiceReset">Repetir</button><button id="practiceBack">Elegir otro tema</button></div><button class="primary practice-return" id="practiceReturn">Volver a mi partida</button>';
 const scroll=fresh?0:$('sheetBody').scrollTop;
 if(fresh)openSheet('Practicar · '+topic.name,html);else $('sheetBody').innerHTML=html;
 $('sheetBody').scrollTop=scroll||0;
 const update=()=>{
  if(s.solved){practiceProgress=practiceProgressUpdate(practiceProgress,s);savePracticeProgress();}
  renderPractice();
 };
 $('practiceBoard').onclick=e=>{const b=e.target.closest('[data-practice-square]');if(b){practiceChooseSquare(s,b.dataset.practiceSquare);update();}};
 if(s.pending)$('sheetBody').onclick=e=>{const b=e.target.closest('[data-practice-promote]');if(b&&s.pending){practiceTryMove(s,{from:s.pending.from,to:s.pending.to,promotion:b.dataset.practicePromote});update();}};else $('sheetBody').onclick=null;
 if($('practiceHint'))$('practiceHint').onclick=()=>{practiceGiveHint(s);update();};
 if($('practiceReveal'))$('practiceReveal').onclick=()=>{practiceReveal(s);update();};
 if($('practiceReply'))$('practiceReply').onclick=()=>{practiceStep(s);update();};
 if($('practiceStep'))$('practiceStep').onclick=()=>{practiceStep(s);update();};
 $('practiceReset').onclick=()=>openPractice(s.lesson.id);$('practiceBack').onclick=openPracticeGallery;$('practiceReturn').onclick=closeSheet;
}
