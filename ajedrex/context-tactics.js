/* Ajedrex contextual themes. These describe geometry, estimated phases or explicitly imported provenance, not hidden tactical certainty. */
const CONTEXT_THEME_IDS=['attackingF2F7','collinearMove','kingsideAttack','queensideAttack','exposedKing','opening','middlegame','endgame','bishopEndgame','knightEndgame','pawnEndgame','queenEndgame','queenRookEndgame','rookEndgame','advantage','crushing','equality','oneMove','short','long','veryLong','master','masterVsMaster','superGM','playerGames','mix'];
const CTX_TITLES=['GM','IM','FM','CM','WGM','WIM','WFM','WCM'];
function ctxPlain(value){return !!value&&typeof value==='object'&&!Array.isArray(value);}
function ctxText(value,max){return typeof value==='string'&&value.trim().length>0&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value)?value.trim():null;}
function ctxFen(value){if(typeof value!=='string'||value.length>120)return null;try{const c=new Chess();return c.load(value)?c.fen():null;}catch(error){return null;}}
/** Returns only validated, bounded fields. Imported names, titles and ratings remain declarations, not verified identities.
 * Schema: {schemaVersion:1,source?:{kind:'game'|'puzzle'|'collection',name,url?},
 * players?:{white?:{name,title?,rating?},black?:{name,title?,rating?}},player?:string,
 * solution?:{fen,moves:UCI[]},collection?:{mixed:true}}. Unknown fields (including verified) are discarded.
 */
function validateThemeMetadata(value){
 if(!ctxPlain(value)||value.schemaVersion!==1)return null;
 const clean={schemaVersion:1};
 if(value.source!==undefined){
  const source=value.source,name=ctxPlain(source)?ctxText(source.name,120):null;
  if(!name||!['game','puzzle','collection'].includes(source.kind))return null;
  clean.source={kind:source.kind,name};
  if(source.url!==undefined){const url=ctxText(source.url,2048);if(!url||!/^https?:\/\/[^\s<>"']+$/i.test(url))return null;clean.source.url=url;}
 }
 if(value.players!==undefined){
  if(!ctxPlain(value.players))return null;clean.players={};
  for(const side of ['white','black'])if(value.players[side]!==undefined){
   const entry=value.players[side],name=ctxPlain(entry)?ctxText(entry.name,80):null;
   if(!name)return null;const player={name};
   if(entry.title!==undefined){if(!CTX_TITLES.includes(entry.title))return null;player.title=entry.title;}
   if(entry.rating!==undefined){if(!Number.isInteger(entry.rating)||entry.rating<0||entry.rating>4000)return null;player.rating=entry.rating;}
   clean.players[side]=player;
  }
 }
 if(value.player!==undefined){const name=ctxText(value.player,80);if(!name)return null;clean.player=name;}
 if(value.collection!==undefined){if(!ctxPlain(value.collection)||value.collection.mixed!==true)return null;clean.collection={mixed:true};}
 if(value.solution!==undefined){
  const entry=value.solution,fen=ctxPlain(entry)?ctxFen(entry.fen):null;
  if(!fen||!Array.isArray(entry.moves)||!entry.moves.length||entry.moves.length>200||!entry.moves.every(m=>typeof m==='string'&&/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(m)))return null;
  clean.solution={fen,moves:entry.moves.slice()};
 }
 return clean;
}
function ctxMap(chess){const map={};chess.board().forEach((row,r)=>row.forEach((p,f)=>{if(p)map[String.fromCharCode(97+f)+(8-r)]=p;}));return map;}
function ctxXY(s){return [s.charCodeAt(0)-97,Number(s[1])-1];}
function ctxSquare(x,y){return x>=0&&x<8&&y>=0&&y<8?String.fromCharCode(97+x)+(y+1):null;}
function ctxAttack(map,from,to){
 if(from===to||!map[from])return false;
 const p=map[from],[x,y]=ctxXY(from),[a,b]=ctxXY(to),dx=a-x,dy=b-y;
 if(p.type==='p')return Math.abs(dx)===1&&dy===(p.color==='w'?1:-1);
 if(p.type==='n')return Math.abs(dx)*Math.abs(dy)===2;
 if(p.type==='k')return Math.max(Math.abs(dx),Math.abs(dy))===1;
 const diagonal=Math.abs(dx)===Math.abs(dy),straight=dx===0||dy===0;
 if(!((p.type==='b'&&diagonal)||(p.type==='r'&&straight)||(p.type==='q'&&(diagonal||straight))))return false;
 for(let i=x+Math.sign(dx),j=y+Math.sign(dy);i!==a||j!==b;i+=Math.sign(dx),j+=Math.sign(dy))if(map[ctxSquare(i,j)])return false;
 return true;
}
function ctxPositionKey(fen){return fen.split(' ').slice(0,4).join(' ');}
function ctxMove(uci){return {from:uci.slice(0,2),to:uci.slice(2,4),...(uci[4]?{promotion:uci[4]}:{})};}
function ctxSolutionLength(chess,solution){
 if(!solution||chess.game_over())return null;
 const copy=new Chess(solution.fen),solver=copy.turn(),target=ctxPositionKey(chess.fen());let matching=-1;
 if(ctxPositionKey(copy.fen())===target)matching=0;
 for(let i=0;i<solution.moves.length;i++){
  if(copy.game_over()||!copy.move(ctxMove(solution.moves[i])))return null;
  if(ctxPositionKey(copy.fen())===target)matching=i+1;
 }
 if(matching<0||chess.turn()!==solver||matching>=solution.moves.length)return null;
 return Math.ceil((solution.moves.length-matching)/2);
}
function ctxEngineScore(value,fen){return ctxPlain(value)&&value.method==='engine'&&Number.isFinite(value.cpWhite)&&(!value.fen||(typeof value.fen==='string'&&ctxPositionKey(value.fen)===ctxPositionKey(fen)))?value.cpWhite:null;}
function detectContextTactics(chess,options={}){
 const map=ctxMap(chess),entries=Object.entries(map),alerts=[],seen=new Set(),legal=chess.game_over()?[]:chess.moves({verbose:true});
 function add(type,squares,message,confidence='context',move=null,lines=[]){
  const key=type+':'+squares.join(',')+':'+(move?move.from+move.to:'');if(seen.has(key))return;
  seen.add(key);alerts.push({type,squares,message,lines,move,confidence});
 }
 for(const target of ['f2','f7']){
  const pawn=map[target];if(!pawn||pawn.type!=='p'||pawn.color!==(target==='f2'?'w':'b'))continue;
  const attack=entries.filter(([s,p])=>p.color!==pawn.color&&ctxAttack(map,s,target)).map(([s])=>s);
  if(attack.length)add('attackingF2F7',[target,...attack],'Presión sobre el peón de '+target+' desde '+attack.join(', ')+'. Es un ataque geométrico; una clavada puede impedir capturarlo.','pattern',null,attack.map(s=>[s,target]));
 }
 let collinearCount=0;
 for(const move of legal){
  if(collinearCount>=4)break;
  if(!['b','r','q'].includes(move.piece)||move.captured||move.flags.includes('k')||move.flags.includes('q'))continue;
  const [x,y]=ctxXY(move.from),[a,b]=ctxXY(move.to),dx=a-x,dy=b-y;
  const targets=entries.filter(([s,p])=>{
   if(p.color===move.color||!['b','r','q'].includes(p.type)||!ctxAttack(map,move.from,s))return false;
   const [u,v]=ctxXY(s);return dx*(v-y)===dy*(u-x);
  }).map(([s])=>s);
  if(!targets.length)continue;
  add('collinearMove',[move.from,move.to,...targets],'Jugada colineal legal: '+move.san+' mantiene el desplazamiento sobre la línea compartida con '+targets.join(', ')+'. La alineación no demuestra que sea la mejor jugada.','candidate',move,[[move.from,move.to]]);
  collinearCount++;
 }
 for(const [king,piece] of entries.filter(([,p])=>p.type==='k')){
  const [kx,ky]=ctxXY(king),enemy=piece.color==='w'?'b':'w',direction=piece.color==='w'?1:-1,zone=[];
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const s=ctxSquare(kx+dx,ky+dy);if(s)zone.push(s);}
  const pressure=entries.filter(([s,p])=>p.color===enemy&&p.type!=='k'&&zone.some(t=>ctxAttack(map,s,t)));
  const targeted=zone.filter(t=>pressure.some(([s])=>ctxAttack(map,s,t)));
  const home=piece.color==='w'?ky<=1:ky>=6;
  if(home&&pressure.length>=2&&targeted.length>=2&&(kx>=5||kx<=2)){
   const type=kx>=5?'kingsideAttack':'queensideAttack',flank=kx>=5?'rey':'dama';
   add(type,[king,...pressure.map(([s])=>s)],'Presión de '+pressure.length+' piezas sobre el entorno del rey en el flanco de '+flank+'. Su ubicación sugiere el patrón; no demuestra que se haya enrocado ni una combinación ganadora.','pattern',null,pressure.map(([s])=>[s,zone.find(t=>ctxAttack(map,s,t))]));
  }
  const shield=[-1,0,1].map(dx=>ctxSquare(kx+dx,ky+direction)).filter(s=>s&&map[s]&&map[s].color===piece.color&&map[s].type==='p');
  const enemyForce=entries.filter(([,p])=>p.color===enemy&&p.type!=='p'&&p.type!=='k');
  if(shield.length<=1&&pressure.length>=2&&targeted.length>=3&&enemyForce.some(([,p])=>p.type==='q'||p.type==='r')){
   add('exposedKing',[king,...pressure.map(([s])=>s)],'Rey con poca cobertura: '+shield.length+' peones delante y '+targeted.length+' casillas próximas bajo presión geométrica. Es una señal de exposición, no una prueba de mate.','pattern');
  }
 }
 const pieces=entries.filter(([,p])=>p.type!=='k'&&p.type!=='p'),types=new Set(pieces.map(([,p])=>p.type)),pawns=entries.filter(([,p])=>p.type==='p'),fullmove=Number(chess.fen().split(' ')[5])||1;
 const isEndgame=pieces.length<=6&&(!types.has('q')||pieces.length<=4);
 if(isEndgame){
  add('endgame',[],'Fase estimada: final por el material reducido. Las fases no tienen una frontera reglamentaria exacta.');
  const endTypes={b:'bishopEndgame',n:'knightEndgame',q:'queenEndgame',r:'rookEndgame'};
  if(types.size===0&&pawns.length)add('pawnEndgame',pawns.map(([s])=>s),'Final de peones: solo quedan reyes y peones.');
  else if(types.size===1){const type=[...types][0];add(endTypes[type],pieces.map(([s])=>s),'Material de final: '+({b:'alfiles',n:'caballos',q:'damas',r:'torres'}[type])+' como únicas piezas además de reyes y posibles peones.');}
  else if(types.size===2&&types.has('q')&&types.has('r'))add('queenRookEndgame',pieces.map(([s])=>s),'Material de final: damas y torres, además de reyes y posibles peones.');
 }else if(fullmove<=12&&pieces.length>=10)add('opening',[],'Fase estimada: apertura, en las primeras 12 jugadas y con al menos 10 piezas además de peones y reyes.');
 else add('middlegame',[],'Fase estimada: medio juego por el número de jugada y el material presente.');
 const cp=ctxEngineScore(options.evaluation,chess.fen());
 if(cp!==null&&!chess.game_over()){
  const side=cp>=0?'blancas':'negras',amount=(Math.abs(cp)/100).toFixed(1);
  if(Math.abs(cp)>=500)add('crushing',[],'El motor estima una ventaja muy grande para '+side+' ('+amount+' peones). La búsqueda limitada puede cambiar la valoración; no garantiza ganar.');
  else if(Math.abs(cp)>=150)add('advantage',[],'El motor estima ventaja para '+side+' ('+amount+' peones). Es una valoración de la posición, no una combinación demostrada.');
  const history=chess.history({verbose:true}),last=history[history.length-1];
  if(last){
   const copy=new Chess(),replayed=copy.load_pgn(chess.pgn());
   const replayMatches=replayed&&ctxPositionKey(copy.fen())===ctxPositionKey(chess.fen());if(replayMatches)copy.undo();
   const currentTagged=options.evaluation&&typeof options.evaluation.fen==='string',previousTagged=options.previousEvaluation&&typeof options.previousEvaluation.fen==='string';
   const previous=replayMatches&&currentTagged&&previousTagged?ctxEngineScore(options.previousEvaluation,copy.fen()):null,sign=last.color==='w'?1:-1;
   if(previous!==null&&previous*sign<=-100&&Math.abs(cp)<=35)add('equality',[last.to],'Tras '+last.san+', el motor pasa de una desventaja de al menos un peón a una posición aproximadamente igualada para '+(last.color==='w'?'blancas':'negras')+'. Es una comparación estimada entre dos posiciones.','context');
  }
 }
 const metadata=validateThemeMetadata(options.metadata);
 const proof=(!chess.game_over()&&Array.isArray(options.tacticalAlerts)?options.tacticalAlerts:[]).filter(a=>a&&a.proof==='forced-mate'&&Number.isInteger(a.mateDistance)&&a.mateDistance>=1&&a.mateDistance<=100).sort((a,b)=>a.mateDistance-b.mateDistance)[0];
 let length=proof?proof.mateDistance:null,lengthMessage=proof?'Longitud del mate forzado comprobado: ':'';
 if(length===null&&metadata&&metadata.solution){length=ctxSolutionLength(chess,metadata.solution);lengthMessage='Longitud restante de una línea importada y reproducida legalmente: ';}
 if(length!==null){
  const type=length===1?'oneMove':length===2?'short':length===3?'long':'veryLong';
  add(type,[],lengthMessage+length+' jugada'+(length===1?'':'s')+' del bando que resuelve.'+(proof?'':' La legalidad de esta línea no demuestra una secuencia forzada.'));
 }
 if(metadata&&metadata.source){
  const source=metadata.source,players=metadata.players||{},all=[players.white,players.black].filter(Boolean);
  if(source.kind==='game'){
   const titled=all.filter(p=>CTX_TITLES.includes(p.title));
   if(titled.length)add('master',[],'Origen declarado en los datos importados: partida de '+titled.map(p=>p.title+' '+p.name).join(' y ')+'. Los títulos no se deducen del tablero ni se verifican en línea.');
   if(titled.length===2)add('masterVsMaster',[],'Ambos jugadores tienen un título declarado en los datos de la partida importada. No es una medida de la fuerza del rival artificial.');
   if(all.some(p=>p.title==='GM'&&p.rating>=2700))add('superGM',[],'Los datos importados declaran al menos un GM con Elo de 2700 o más. El origen no se puede verificar a partir de las jugadas.');
   if(metadata.player&&all.some(p=>p.name.toLocaleLowerCase()===metadata.player.toLocaleLowerCase()))add('playerGames',[],'Partida importada de '+metadata.player+', según su ficha de origen declarada.');
  }
  if(source.kind==='collection'&&metadata.collection&&metadata.collection.mixed)add('mix',[],'Selección importada de temas mezclados. Es una propiedad de la colección, no una táctica identificada en esta posición.');
 }
 return alerts;
}
