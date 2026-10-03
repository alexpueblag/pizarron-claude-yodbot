
/* Pure practice state. It owns its Chess instance and never touches the live game. */
function createPracticeSession(lesson){
 const chess=new Chess(lesson.fen);
 for(const move of lesson.setup||[])if(!chess.move(move))throw Error('Ejemplo no válido.');
 return {lesson,chess,initialPly:chess.history().length,player:chess.turn(),paths:lesson.solutions.map(path=>[...path]),index:0,selected:null,pending:null,solved:false,assisted:false,revealed:false,hinted:false,correctSquare:null,notice:'',noticeKind:'info',attempts:0};
}
function practiceWaitingReply(s){return s.lesson.task==='play'&&!s.solved&&s.chess.turn()!==s.player;}
function practiceExpected(s){return s.paths[0]?.[s.index]||null;}
function practiceApply(s,uci){
 const move=s.chess.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]});
 if(!move)return false;
 s.paths=s.paths.filter(path=>path[s.index]===uci);s.index++;s.selected=null;s.pending=null;s.hinted=false;
 s.solved=s.paths.some(path=>path.length===s.index);
 s.notice=s.solved?'Ejemplo completado. Mira cómo funciona el motivo.':practiceWaitingReply(s)?'Jugada del ejemplo encontrada. Ahora puedes ver una respuesta del rival.':'Te toca continuar la variante.';
 s.noticeKind=s.solved?'success':'info';return true;
}
function practiceTryMove(s,move){
 if(s.solved||s.lesson.task!=='play'||practiceWaitingReply(s))return {kind:'blocked'};
 const legal=s.chess.moves({verbose:true}).find(m=>m.from===move.from&&m.to===move.to&&(m.promotion||'')===(move.promotion||''));
 if(!legal){s.notice='Ese movimiento no es legal en esta posición.';s.noticeKind='notice';return {kind:'illegal'};}
 const uci=legal.from+legal.to+(legal.promotion||'');s.attempts++;
 if(!s.paths.some(path=>path[s.index]===uci)){
  s.notice='Es una jugada legal. Este ejemplo recorre otra continuación; puedes probar otra o consultar la variante.';
  s.noticeKind='notice';s.selected=null;s.pending=null;return {kind:'alternative'};
 }
 practiceApply(s,uci);return {kind:s.solved?'solved':'correct',move:legal};
}
function practiceChooseSquare(s,square){
 if(s.solved)return {kind:'blocked'};
 if(s.lesson.task==='spot'){
  s.attempts++;
  const observation=s.lesson.observations.find(a=>a.squares[0]===square)||(s.lesson.targets.includes(square)?s.lesson.observations[0]:null);
  if(observation){s.solved=true;s.correctSquare=square;s.observation=observation;s.notice='Lo identificaste. '+observation.message;s.noticeKind='success';return {kind:'solved'};}
  s.notice='En este ejemplo la señal corresponde a otra pieza. Mira qué pieza cumple la función o pide una pista.';s.noticeKind='notice';return {kind:'other-square'};
 }
 if(practiceWaitingReply(s))return {kind:'blocked'};
 if(s.selected){
  const options=s.chess.moves({verbose:true}).filter(m=>m.from===s.selected&&m.to===square);
  if(options.some(m=>m.promotion)){s.pending={from:s.selected,to:square,choices:options.map(m=>m.promotion)};return {kind:'promotion'};}
  if(options.length)return practiceTryMove(s,{from:s.selected,to:square});
 }
 const piece=s.chess.get(square);s.selected=piece&&piece.color===s.chess.turn()?(s.selected===square?null:square):null;s.pending=null;return {kind:'selected'};
}
function practiceGiveHint(s){
 if(s.solved)return;
 s.assisted=true;s.hinted=true;
 if(s.lesson.task==='spot')s.notice='Observa las casillas marcadas y relaciónalas con el concepto.';
 else{const uci=practiceExpected(s);if(uci){s.selected=uci.slice(0,2);s.notice='Observa la pieza en '+uci.slice(0,2)+' y sus movimientos legales.';}}
 s.noticeKind='info';
}
function practiceReveal(s){if(!s.solved)s.assisted=true;s.revealed=true;s.notice='Esta es una variante del ejemplo. Puedes recorrerla paso a paso.';s.noticeKind='info';}
function practiceStep(s){
 if(s.solved||s.lesson.task!=='play')return false;
 if(!practiceWaitingReply(s))s.assisted=true;
 const uci=practiceExpected(s);return !!uci&&practiceApply(s,uci);
}
function practiceExplanation(s){
 if(s.observation)return s.observation.message;
 const line=s.paths[0]||[];
 return s.lesson.solutionNotes?.[line.join(' ')]||s.lesson.explanation;
}
function practiceProgressUpdate(progress,s){
 if(!s.solved)return progress;
 const next={...progress},value=s.assisted?'assisted':'solved';
 if(next[s.lesson.id]!=='solved')next[s.lesson.id]=value;
 return next;
}
function cleanPracticeProgress(value){
 const out={};if(!value||typeof value!=='object'||Array.isArray(value))return out;
 for(const l of PRACTICE_LESSONS)if(['solved','assisted'].includes(value[l.id]))out[l.id]=value[l.id];
 return out;
}

function mergePracticeProgress(a,b){
 const left=cleanPracticeProgress(a),right=cleanPracticeProgress(b),merged={...left};
 for(const [id,value]of Object.entries(right))if(merged[id]!=='solved')merged[id]=value;
 return merged;
}
