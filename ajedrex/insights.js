
/* Ajedrex: material, evaluation and post-game review. Pawn-unit scale follows GarboChess (800 units per pawn). */
const MATERIAL_VALUE={p:1,n:3,b:3,r:5,q:9,k:0};
function materialSummary(chess){
 const totals={w:0,b:0},captured={w:[],b:[]};
 chess.board().forEach(row=>row.forEach(p=>{if(p)totals[p.color]+=MATERIAL_VALUE[p.type]||0;}));
 chess.history({verbose:true}).forEach(m=>{if(m.captured)captured[m.color].push(m.captured);});
 for(const side of ['w','b'])captured[side].sort((a,b)=>MATERIAL_VALUE[b]-MATERIAL_VALUE[a]);
 return {totals,captured,balance:totals.w-totals.b};
}
function terminalScore(chess){
 if(chess.in_checkmate())return {kind:'checkmate',winner:chess.turn()==='w'?'b':'w',cpWhite:null,method:'rules',terminal:true};
 if(chess.in_draw())return {kind:'draw',winner:null,cpWhite:0,method:'rules',terminal:true};
 return null;
}
function materialScore(chess){return terminalScore(chess)||{kind:'score',cpWhite:Math.round(materialSummary(chess).balance*100),method:'material',terminal:false};}
function engineScore(chess,result){
 const terminal=terminalScore(chess);if(terminal)return terminal;
 if(!result||!Number.isFinite(result.value)||!Number.isFinite(result.depth)||result.depth<1)return materialScore(chess);
 const signed=result.value*(chess.turn()==='w'?1:-1);
 if(Math.abs(result.value)>1998000)return {kind:'mate',winner:signed>0?'w':'b',cpWhite:null,method:'engine',depth:result.depth,best:result.uci,terminal:false};
 return {kind:'score',cpWhite:Math.round(signed/8),method:'engine',depth:result.depth,best:result.uci,terminal:false};
}
function scoreNumber(score){
 if(!score)return 0;
 if(score.kind==='checkmate'||score.kind==='mate')return score.winner==='w'?1000:-1000;
 return Math.max(-1000,Math.min(1000,Number(score.cpWhite)||0));
}
function scoreLabel(score){
 if(!score)return '…';
 if(score.kind==='checkmate')return score.winner==='w'?'1–0':'0–1';
 if(score.kind==='mate')return score.winner==='w'?'+M':'−M';
 if(score.kind==='draw')return '½–½';
 const value=(Number(score.cpWhite)||0)/100;return (value>0?'+':'')+value.toFixed(1);
}
function scoreDescription(score){
 if(!score)return 'Analizando la posición';
 if(score.kind==='checkmate')return 'Jaque mate · ganan '+(score.winner==='w'?'blancas':'negras');
 if(score.kind==='draw')return 'Tablas';
 if(score.kind==='mate')return 'El motor detecta una línea de mate para '+(score.winner==='w'?'blancas':'negras');
 const value=score.cpWhite||0,side=value>0?'blancas':'negras';
 if(score.method==='material')return Math.abs(value)<1?'Material igualado':'Balance de material favorable a '+side;
 return Math.abs(value)<35?'Posición aproximadamente igualada':'Ventaja estimada de '+side;
}
function scorePercent(score){return Math.max(3,Math.min(97,50+45*Math.tanh(scoreNumber(score)/450)));}
function evaluatePosition(chess,options={}){
 const terminal=terminalScore(chess);if(terminal)return terminal;
 try{return engineScore(chess,GARBO.choose(chess.fen(),options.ms||120,options.depth||3));}catch(error){return materialScore(chess);}
}
function classifyReviewedMove(move,before,after){
 const base={loss:null,category:'Sin evaluar',tone:'neutral'};
 if(after.kind==='checkmate'&&after.winner===move.color)return {...base,loss:0,category:'Jaque mate',tone:'good'};
 if(before.method!=='engine'||(after.method!=='engine'&&!after.terminal))return base;
 const played=move.from+move.to+(move.promotion||'');
 if(before.best===played)return {...base,loss:0,category:'Preferida del motor',tone:'good'};
 if(after.kind==='mate'&&after.winner!==move.color&&!(before.kind==='mate'&&before.winner===after.winner))return {...base,category:'Permite una línea de mate',tone:'bad'};
 if(before.kind==='mate'&&before.winner===move.color&&!(after.kind==='mate'&&after.winner===move.color)&&after.kind!=='checkmate')return {...base,category:'Línea de mate desaprovechada',tone:'bad'};
 if(before.kind!=='score'||!['score','draw'].includes(after.kind))return {...base,category:'Secuencia de mate',tone:'neutral'};
 const loss=Math.max(0,Math.round((move.color==='w'?1:-1)*(before.cpWhite-after.cpWhite)));
 return {loss,category:loss<40?'Estable':loss<100?'Imprecisión':loss<250?'Error':'Error importante',tone:loss<40?'good':loss<100?'notice':'bad'};
}
function buildReview(startFen,moves,options={},onProgress){
 const chess=new Chess(startFen),positions=[{fen:chess.fen(),score:evaluatePosition(chess,options)}],rows=[];
 for(let i=0;i<moves.length;i++){
  const before=positions[i],move=chess.move(moves[i]);if(!move)throw Error('No se puede analizar una jugada ilegal.');
  const after={fen:chess.fen(),score:evaluatePosition(chess,options)};positions.push(after);
  let suggestion=null;const uci=before.score.best;
  if(uci){const probe=new Chess(before.fen);const preferred=probe.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||'q'});if(preferred)suggestion={from:preferred.from,to:preferred.to,promotion:preferred.promotion,san:preferred.san,fen:probe.fen()};}
  rows.push({index:i,fullmove:Number(before.fen.split(' ')[5])||1,move,...classifyReviewedMove(move,before.score,after.score),beforeFen:before.fen,afterFen:after.fen,before:before.score,after:after.score,suggestion});
  if(onProgress)onProgress(i+1,moves.length);
 }
 return {positions,rows,final:terminalScore(chess),material:materialSummary(chess),turns:moves.length,method:'GarboChess · análisis breve de profundidad limitada'};
}
