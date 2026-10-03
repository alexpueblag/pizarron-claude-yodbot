/* Each analysis belongs to a position and runs away from the touch interface. */
importScripts('./vendor/chess.js','./vendor/garbo.js','./catalog.js','./tactics.js','./insights.js','./context-tactics.js','./advanced-tactics.js','./mate-patterns.js','./mate-search.js');
self.onmessage=function(event){
 const data=event.data;if(!data||data.kind!=='tactics')return;
 const alerts=[],coverage={};let limited=false;
 try{
  const chess=new Chess(data.startFen);
  for(const move of data.moves||[])if(!chess.move(move))throw Error('Historial de análisis no válido.');
  const enabled=new Set(data.enabled||[]),budget=Math.max(1200,Math.min(10000,Number(data.budgetMs)||2600)),start=Date.now();
  const add=list=>{for(const alert of list||[])if(enabled.has(alert.type))alerts.push(alert);};
  const send=done=>self.postMessage({kind:'tactics',id:data.id,alerts:[...alerts],done,limited,coverage});
  const run=(name,fn)=>{try{const result=fn();coverage[name]='ok';return result;}catch(error){coverage[name]='error';limited=true;return null;}};
  const basic=run('immediate',()=>analyzeChess(chess,{mateIn1:true}))||{alerts:[]};
  const immediate=basic.alerts.filter(a=>a.type==='mateIn1').map(a=>({...a,mateDistance:1,proof:'forced-mate',variation:[a.move.from+a.move.to+(a.move.promotion||'')]}));
  add(immediate);
  add(run('matePatterns',()=>detectMatePatterns(chess,{matingMoves:immediate.map(a=>a.move),enabled:[...enabled]})));
  send(false);
  const currentFen=chess.fen(),evaluation={...evaluatePosition(chess,{ms:100,depth:3}),fen:currentFen};
  let previousEvaluation=null;
  const last=chess.undo();if(last){previousEvaluation={...evaluatePosition(chess,{ms:80,depth:3}),fen:chess.fen()};chess.move(last);}
  const contextOptions={enabled:[...enabled],metadata:data.metadata,evaluation,previousEvaluation,tacticalAlerts:[...basic.alerts,...alerts]};
  add(run('context',()=>detectContextTactics(chess,contextOptions)));
  send(false);
  if(!chess.game_over()){
   const advanced=run('combinations',()=>detectAdvancedTactics(chess,{enabled:[...enabled],deadline:Math.min(start+budget,Date.now()+Math.min(1500,budget*.4))}));
   if(advanced){add(advanced);if(advanced.report?.complete===false){limited=true;coverage.combinations=advanced.report.reason||'budget';}}
   send(false);
   if(['mateIn2','mateIn3','mateIn4','mateIn5'].some(id=>enabled.has(id))){
    const forced=run('forcedMates',()=>detectForcedMates(chess,{enabled:[...enabled],maxDepthMoves:budget>3000?8:5,maxNodes:budget>3000?400000:60000,deadline:start+budget}));
    if(forced){add(forced.alerts);if(!forced.complete){limited=true;coverage.forcedMates=forced.reason||'budget';}coverage.mateHorizon=forced.horizon;}
   }
   add(run('contextAfterSearch',()=>detectContextTactics(chess,{...contextOptions,tacticalAlerts:[...basic.alerts,...alerts]})));
  }
  send(true);
 }catch(error){self.postMessage({kind:'error',id:data.id,error:String(error)});}
};