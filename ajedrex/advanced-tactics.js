/* Ajedrex: bounded tactical explanations. Needs chess.js and tactics.js.
 * "verified" always names the finite fact that was checked, never an engine verdict.
 * A pattern/candidate is a concrete legal possibility, not a promise of winning.
 */
const ADVANCED_TACTIC_IDS=['insufficientDefense','overload','attraction','capturingDefender','clearance','defensiveMove','deflection','hangingPiece','interference','intermezzo','quietMove','sacrifice','trappedPiece','zugzwang'];
function AT_other(color){return color==='w'?'b':'w';}
function AT_uci(move){return move.from+move.to+(move.promotion||'');}
function AT_value(type){return type==='k'?0:(VALUES[type]||0);}
function AT_between(a,b,t){const [x,y]=xy(a),[u,v]=xy(b),[i,j]=xy(t);return (u-x)*(j-y)===(v-y)*(i-x)&&i>=Math.min(x,u)&&i<=Math.max(x,u)&&j>=Math.min(y,v)&&j<=Math.max(y,v)&&t!==a&&t!==b;}
function AT_material(chess,color){return Object.values(boardMap(chess)).reduce((v,p)=>v+(p.color===color?1:-1)*AT_value(p.type),0);}
function AT_swap(chess,target,deadline,memo,depth=0){
 if(Date.now()>=deadline||depth>14)return null;
 const key=chess.fen()+'|'+target;if(memo.has(key))return memo.get(key);
 let best=0;
 const moves=chess.moves({verbose:true}).filter(m=>m.to===target&&m.captured);
 for(const m of moves){
  if(Date.now()>=deadline)return null;
  chess.move(m);const next=AT_swap(chess,target,deadline,memo,depth+1);chess.undo();
  if(next===null)return null;
  best=Math.max(best,AT_value(m.captured)+(m.promotion?AT_value(m.promotion)-1:0)-next);
 }
 memo.set(key,best);return best;
}
function AT_exchange(chess,move,deadline){
 const copy=new Chess(chess.fen());if(!copy.move(move))return null;
 const risk=AT_swap(copy,move.to,deadline,new Map());
 return risk===null?null:AT_value(move.captured)+(move.promotion?AT_value(move.promotion)-1:0)-risk;
}
function AT_safeDestination(chess,move,deadline){
 const copy=new Chess(chess.fen());copy.move(move);
 if(copy.in_checkmate())return true;
 if(Date.now()>=deadline)return null;
 const replies=copy.moves({verbose:true}).filter(r=>r.to===move.to&&r.captured);
 return replies.length===0;
}
function AT_engineScore(chess,ms,depth){
 if(chess.in_checkmate())return chess.turn()==='w'?-2500:2500;
 if(chess.in_draw())return 0;
 if(typeof GARBO==='undefined')return null;
 try{const r=GARBO.choose(chess.fen(),ms,depth);return r&&Number.isFinite(r.value)&&r.depth>=depth?r.value*(chess.turn()==='w'?1:-1)/8:null;}catch(_){return null;}
}
function detectAdvancedTactics(chess,options={}){
 const deadline=Number.isFinite(options.deadline)?options.deadline:Date.now()+800;
 const selected=options.enabled?new Set(options.enabled):new Set(ADVANCED_TACTIC_IDS);
 const alerts=[],seen=new Set(),counts={};const wanted=id=>selected.has(id);
 const map=boardMap(chess),color=chess.turn(),enemy=AT_other(color);
 if(chess.game_over()||Date.now()>=deadline){alerts.report={complete:Date.now()<deadline,reason:Date.now()>=deadline?'budget':null};return alerts;}
 const legal=chess.moves({verbose:true}),entries=Object.entries(map);
 function add(type,squares,message,lines=[],move=null,confidence='candidate',variation){
  if(!wanted(type)||(counts[type]||0)>=4)return;
  const filtered=[...new Set(squares.filter(Boolean))],key=type+':'+filtered.join(',')+':'+(move?AT_uci(move):'');
  if(seen.has(key))return;seen.add(key);counts[type]=(counts[type]||0)+1;
  alerts.push({type,squares:filtered,message,lines,move,confidence,...(variation?{variation}: {})});
 }
 const defensivePairs=[];
 const enemyFields=chess.fen().split(' ');enemyFields[1]=enemy;enemyFields[3]='-';
 const threatMoves=wanted('defensiveMove')&&!chess.in_check()?new Chess(enemyFields.join(' ')).moves({verbose:true}).filter(m=>m.captured):[];
 for(const [defender,p]of entries){
  if(Date.now()>=deadline)break;
  if(p.color!==enemy)continue;
  const targets=entries.filter(([t,q])=>q.color===enemy&&q.type!=='k'&&t!==defender&&attacks(map,defender,t)&&attackers(map,t,color).length);
  for(const [target]of targets)defensivePairs.push({defender,target});
  if(wanted('overload')&&targets.length>=2){
   const sole=targets.filter(([t])=>attackers(map,t,enemy).length===1);
   for(const [a]of sole){
    const first=legal.find(m=>m.to===a&&m.captured);if(!first)continue;
    const after=new Chess(chess.fen());after.move(first);
    const take=after.moves({verbose:true}).find(m=>m.from===defender&&m.to===a&&m.captured);if(!take)continue;
    after.move(take);
    const second=sole.find(([b])=>b!==a&&after.moves({verbose:true}).some(m=>m.to===b&&m.captured));
    if(second)add('overload',[defender,a,second[0]],'Posible sobrecarga: '+defender+' defiende '+a+' y '+second[0]+'. Tras '+first.san+' '+take.san+' queda una captura legal en '+second[0]+'. El rival puede elegir otra respuesta.',[[defender,a],[defender,second[0]]],first,'candidate',[AT_uci(first),AT_uci(take)]);
   }
  }
 }
 for(const m of legal){
  if(Date.now()>=deadline)break;
  const copy=new Chess(chess.fen());copy.move(m);const after=boardMap(copy),reply=copy.moves({verbose:true});
  const givesCheck=copy.in_check(),isCapture=Boolean(m.captured);
  if(isCapture&&(wanted('hangingPiece')||wanted('insufficientDefense'))){
   const victim=m.flags.includes('e')?m.to[0]+m.from[1]:m.to;
   const defenders=attackers(map,victim,enemy),gain=AT_exchange(chess,m,deadline);
   if(gain!==null&&gain>0){
    const type=defenders.length?'insufficientDefense':'hangingPiece';
    add(type,[victim,m.from,m.to,...defenders],m.san+': saldo local de +'+gain+' peones al comprobar las capturas y recapturas legales sobre '+m.to+'. '+(defenders.length?'El apoyo no basta en ese intercambio.':'La pieza se puede capturar sin perder el saldo material en ese intercambio.')+' No incluye amenazas intermedias en otras casillas.',[[m.from,m.to]],m,'verified',[AT_uci(m)]);
   }
  }
  if(wanted('capturingDefender')&&isCapture){
   for(const pair of defensivePairs.filter(p=>p.defender===m.to)){
    if(after[pair.target]&&attackers(after,pair.target,color).length&&attackers(after,pair.target,enemy).length<attackers(map,pair.target,enemy).length)
     add('capturingDefender',[m.to,pair.target,m.from],m.san+' captura un defensor geométrico de '+pair.target+'. Se reduce su apoyo; todavía hay que comprobar la respuesta rival.',[[m.from,m.to],[m.to,pair.target]],m,'pattern');
   }
  }
  if(wanted('clearance')){
   for(const [from,p]of entries){
    if(p.color!==color||!['b','r','q'].includes(p.type)||from===m.from)continue;
    const opened=entries.filter(([to,q])=>q.color===enemy&&after[to]&&after[to].color===enemy&&AT_between(from,to,m.from)&&!attacks(map,from,to)&&attacks(after,from,to));
    if(opened.length)add('clearance',[m.from,m.to,from,opened[0][0]],m.san+' despeja la línea de '+from+' hacia '+opened[0][0]+'. La apertura de la línea está comprobada; su utilidad depende de la respuesta.',[[from,opened[0][0]],[m.from,m.to]],m,'verified');
   }
  }
  if(wanted('interference')){
   for(const pair of defensivePairs){
    if(!after[pair.defender]||!after[pair.target]||!['b','r','q'].includes(map[pair.defender].type)||!AT_between(pair.defender,pair.target,m.to))continue;
    if(attacks(map,pair.defender,pair.target)&&!attacks(after,pair.defender,pair.target))
     add('interference',[m.to,pair.defender,pair.target],m.san+' se interpone entre el defensor '+pair.defender+' y '+pair.target+'. Puede ser una interferencia útil, pero el rival puede capturar la pieza interpuesta.',[[pair.defender,pair.target],[m.from,m.to]],m,'pattern');
   }
  }
  if(wanted('defensiveMove')){
   const threatened=entries.filter(([s,p])=>p.color===color&&p.type!=='k'&&threatMoves.some(t=>t.to===s));
   for(const [target,p]of threatened){
    const dest=target===m.from?m.to:target;
    if(!after[dest]||after[dest].color!==color)continue;
    const nowLegalCaptures=reply.filter(r=>r.to===dest&&r.captured);
    if(nowLegalCaptures.length===0&&(target===m.from||attackers(after,dest,enemy).length===0))
     add('defensiveMove',[target,m.to,...attackers(map,target,enemy)],m.san+' evita la captura inmediata de '+PIECE_NAMES[p.type]+' en '+target+'. No hay una captura legal inmediata de esa pieza en la posición resultante; otras amenazas requieren análisis.',[[m.from,m.to]],m,'verified');
   }
   if(chess.in_check()&&!givesCheck&&!isCapture)add('defensiveMove',[m.from,m.to],m.san+' resuelve legalmente el jaque. Comprueba después las demás amenazas.',[[m.from,m.to]],m,'verified');
  }
  if(wanted('quietMove')&&!isCapture&&!givesCheck&&!m.promotion&&!m.flags.includes('k')&&!m.flags.includes('q')){
   const newTargets=entries.filter(([s,p])=>p.color===enemy&&p.type!=='k'&&after[s]&&attacks(after,m.to,s)&&!attacks(map,m.from,s)&&AT_value(p.type)>AT_value(m.piece));
   if(newTargets.length&&AT_safeDestination(chess,m,deadline)===true)
    add('quietMove',[m.from,m.to,...newTargets.map(t=>t[0])],m.san+' prepara un ataque a '+newTargets.map(t=>t[0]).join(', ')+' sin capturar ni dar jaque. Es una amenaza candidata, no una ganancia forzada.',newTargets.map(t=>[m.to,t[0]]),m,'candidate');
  }
  const recaptures=reply.filter(r=>r.to===m.to&&r.captured);
  if(recaptures.length&&(wanted('attraction')||wanted('deflection')||wanted('sacrifice'))){
   for(const r of recaptures){
    if(Date.now()>=deadline)break;
    const line=new Chess(copy.fen());line.move(r);const nextMap=boardMap(line);
    const nextMoves=line.moves({verbose:true});
    const fork=(wanted('attraction')||wanted('sacrifice'))?nextMoves.find(n=>{
     if(Date.now()>=deadline)return false;
     const forkBoard=new Chess(line.fen());forkBoard.move(n);const nm=boardMap(forkBoard);
     const victims=Object.keys(nm).filter(s=>nm[s].color===enemy&&attacks(nm,n.to,s)&&(AT_value(nm[s].type)>=3||nm[s].type==='k'));
     return victims.length>=2&&victims.includes(m.to);
    }):null;
    if(wanted('attraction')&&fork){
     add('attraction',[m.to,r.from,fork.to],m.san+' ofrece atraer la pieza de '+r.from+' a '+m.to+'. Si responde '+r.san+', '+fork.san+' crea un ataque doble que incluye esa pieza. La aceptación no es obligatoria.',[[r.from,m.to],[fork.from,fork.to]],m,'candidate',[AT_uci(m),AT_uci(r),AT_uci(fork)]);
    }
    if(wanted('deflection')){
     for(const pair of defensivePairs.filter(p=>p.defender===r.from&&p.target!==m.to)){
      if(nextMap[pair.target]&&!attacks(nextMap,m.to,pair.target)){
       const next=nextMoves.find(n=>n.to===pair.target&&n.captured);
       if(next)add('deflection',[r.from,m.to,pair.target],m.san+' intenta desviar al defensor de '+r.from+'. Si acepta '+r.san+', deja su defensa de '+pair.target+' y existe '+next.san+'. El rival puede rechazar la oferta.',[[r.from,pair.target],[r.from,m.to]],m,'candidate',[AT_uci(m),AT_uci(r),AT_uci(next)]);
      }
     }
    }
    if(wanted('sacrifice')&&AT_value(m.piece)>AT_value(m.captured)){
     const continuation=nextMoves.find(n=>{if(Date.now()>=deadline)return false;const c=new Chess(line.fen());c.move(n);return c.in_checkmate();})||fork;
     if(continuation){
      const end=new Chess(line.fen());end.move(continuation);
      add('sacrifice',[m.from,m.to,continuation.to],m.san+' ofrece '+PIECE_NAMES[m.piece]+'. Si el rival acepta con '+r.san+', '+continuation.san+(end.in_checkmate()?' da mate.':' crea un ataque doble como posible compensación.')+' La oferta puede ser rechazada; no se afirma que el sacrificio gane contra todas las respuestas.',[[m.from,m.to],[continuation.from,continuation.to]],m,'candidate',[AT_uci(m),AT_uci(r),AT_uci(continuation)]);
     }
    }
   }
  }
 }
 if(wanted('intermezzo')&&Date.now()<deadline){
  const history=chess.history({verbose:true}),last=history[history.length-1];
  if(last&&last.captured){
   const recapture=legal.find(m=>m.to===last.to&&m.captured);
   if(recapture)for(const m of legal.filter(m=>m.to!==last.to&&/[+#]/.test(m.san))){
    if(Date.now()>=deadline)break;
    const c=new Chess(chess.fen());c.move(m);
    if(c.in_checkmate()){add('intermezzo',[m.from,m.to,last.to],m.san+' da mate antes de recapturar en '+last.to+'.',[[m.from,m.to]],m,'verified');continue;}
    const replies=c.moves({verbose:true});let supports=0,complete=true;
    for(const r of replies){if(Date.now()>=deadline){complete=false;break;}c.move(r);if(c.moves({verbose:true}).some(n=>n.to===last.to&&n.captured))supports++;c.undo();}
    if(supports)add('intermezzo',[m.from,m.to,last.to],m.san+' introduce un jaque antes de la recaptura disponible en '+last.to+'. Tras '+supports+' de '+replies.length+' respuestas legales '+(complete?'comprobadas':'(análisis interrumpido)')+' sigue existiendo una recaptura. No se garantiza que sea mejor.',[[m.from,m.to]],m,'candidate');
   }
  }
 }
 if(wanted('trappedPiece')&&!chess.in_check()&&Date.now()<deadline){
  for(const [target,p]of entries){
   if(p.color!==color||!['n','b','r','q'].includes(p.type)||!attackers(map,target,enemy).length)continue;
   const escapes=legal.filter(m=>m.from===target);let allUnsafe=true,complete=true;
   for(const move of escapes){const safe=AT_safeDestination(chess,move,deadline);if(safe===null){complete=false;break;}if(safe){allUnsafe=false;break;}}
   if(complete&&allUnsafe)add('trappedPiece',[target,...attackers(map,target,enemy)],PIECE_NAMES[p.type]+' en '+target+' no tiene un movimiento legal que evite una captura inmediata ('+escapes.length+' salidas comprobadas). Es un posible encierro: otra pieza podría defender, capturar al atacante o crear una amenaza.',attackers(map,target,enemy).map(a=>[a,target]),null,'candidate');
  }
 }
 if(wanted('zugzwang')&&Date.now()<deadline-100&&!chess.in_check()&&entries.length<=7&&entries.every(([,p])=>p.type==='p'||p.type==='k')&&legal.length<=8){
  const fields=chess.fen().split(' ');fields[1]=enemy;fields[3]='-';
  const pass=new Chess(fields.join(' ')),remaining=deadline-Date.now(),ms=Math.min(25,Math.floor(remaining/(legal.length+3)));
  const sign=color==='w'?1:-1;
  const passValue=AT_engineScore(pass,ms,4);
  let best=-Infinity,complete=passValue!==null,checked=0;
  for(const move of legal){
   if(!complete||Date.now()>=deadline-ms){complete=false;break;}
   const c=new Chess(chess.fen());c.move(move);const v=AT_engineScore(c,ms,4);
   if(v===null){complete=false;break;}checked++;best=Math.max(best,v*sign);
  }
  if(complete&&checked===legal.length&&passValue*sign-best>=150)
   add('zugzwang',entries.filter(([,p])=>p.color===color).map(([s])=>s),'Candidato a zugzwang: se compararon las '+checked+' jugadas legales con un pase hipotético. A profundidad 4, la mejor jugada resulta '+((passValue*sign-best)/100).toFixed(1)+' peones peor que pasar. El pase no es legal y la búsqueda limitada no prueba el resultado del final.',[],null,'candidate');
 }
 alerts.report={complete:Date.now()<deadline,reason:Date.now()>=deadline?'budget':null};
 return alerts;
}
