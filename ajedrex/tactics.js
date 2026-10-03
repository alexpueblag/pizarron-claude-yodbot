const PIECE_NAMES={p:'peón',n:'caballo',b:'alfil',r:'torre',q:'dama',k:'rey'};
const VALUES={p:1,n:3,b:3,r:5,q:9,k:100};
const ACTIVE_THEMES=["attacked","defended","undefended","insufficientDefense","check","overload","advancedPawn","advantage","anastasiaMate","arabianMate","attackingF2F7","attraction","backRankMate","balestraMate","blindSwineMate","bishopEndgame","bodenMate","castling","enPassant","capturingDefender","collinearMove","cornerMate","crushing","discoveredCheck","doubleBishopMate","dovetailMate","equality","kingsideAttack","clearance","defensiveMove","deflection","discoveredAttack","doubleCheck","endgame","epauletteMate","exposedKing","fork","hangingPiece","hookMate","interference","intermezzo","killBoxMate","pillsburysMate","morphysMate","swallowstailMate","triangleMate","vukovicMate","knightEndgame","long","master","masterVsMaster","mate","mateIn1","mateIn2","mateIn3","mateIn4","mateIn5","middlegame","oneMove","opening","operaMate","pawnEndgame","pin","promotion","queenEndgame","queenRookEndgame","queensideAttack","quietMove","rookEndgame","sacrifice","short","skewer","smotheredMate","superGM","trappedPiece","underPromotion","veryLong","xRayAttack","zugzwang","mix","playerGames"];
function boardMap(chess){const map={};chess.board().forEach((row,r)=>row.forEach((p,f)=>{if(p)map[String.fromCharCode(97+f)+(8-r)]={...p};}));return map;}
function xy(s){return [s.charCodeAt(0)-97,Number(s[1])-1];}
function sq(x,y){return x>=0&&x<8&&y>=0&&y<8?String.fromCharCode(97+x)+(y+1):null;}
function attacks(map,from,to){
 if(from===to||!map[from])return false;
 const p=map[from],[x,y]=xy(from),[a,b]=xy(to),dx=a-x,dy=b-y;
 if(p.type==='p')return Math.abs(dx)===1&&dy===(p.color==='w'?1:-1);
 if(p.type==='n')return Math.abs(dx)*Math.abs(dy)===2;
 if(p.type==='k')return Math.max(Math.abs(dx),Math.abs(dy))===1;
 const diagonal=Math.abs(dx)===Math.abs(dy),straight=dx===0||dy===0;
 if(!((p.type==='b'&&diagonal)||(p.type==='r'&&straight)||(p.type==='q'&&(diagonal||straight))))return false;
 const sx=Math.sign(dx),sy=Math.sign(dy);let i=x+sx,j=y+sy;
 while(i!==a||j!==b){if(map[sq(i,j)])return false;i+=sx;j+=sy;}
 return true;
}
function attackers(map,to,color){return Object.keys(map).filter(s=>map[s].color===color&&attacks(map,s,to));}
function analyzeChess(chess,options={}){
 const map=boardMap(chess),alerts=[],seen=new Set(),turn=chess.turn(),legal=chess.game_over()?[]:chess.moves({verbose:true});
 function add(type,squares,message,lines=[],move=null){const key=type+':'+squares.join(',')+':'+(move?move.san:'');if(seen.has(key))return;seen.add(key);alerts.push({type,squares,message,lines,move,confidence:['check','doubleCheck','mate','mateIn1','castling','enPassant','promotion','underPromotion'].includes(type)?'verified':'pattern'});}
 for(const [s,p] of Object.entries(map)){
  const enemy=p.color==='w'?'b':'w',at=attackers(map,s,enemy),def=attackers(map,s,p.color);
  if(at.length)add('attacked',[s,...at],PIECE_NAMES[p.type]+' en '+s+' bajo ataque de '+at.join(', ')+'. '+(def.length?'Hay apoyo geométrico en '+def.join(', ')+'. Comprueba si puede recapturar legalmente.':'No hay defensores geométricos.')+' Estar atacada no significa estar perdida.',at.map(a=>[a,s]));
  if(p.type!=='k'&&def.length)add('defended',[s,...def],PIECE_NAMES[p.type]+' en '+s+' apoyado por '+def.join(', ')+'. Una clavada puede impedir una recaptura.',def.map(a=>[a,s]));
  if(p.type!=='k'&&!def.length)add('undefended',[s],PIECE_NAMES[p.type]+' en '+s+' sin defensa geométrica. '+(at.length?'También está bajo ataque.':'Ahora mismo no está atacado.'));
  if(p.type==='p'&&((p.color==='w'&&Number(s[1])>=6)||(p.color==='b'&&Number(s[1])<=3)))add('advancedPawn',[s],'Peón avanzado en '+s+'. Comprueba si puedes apoyar su coronación.');
  const victims=Object.keys(map).filter(t=>map[t].color!==p.color&&attacks(map,s,t));
  if(victims.length>=2)add('fork',[s,...victims],PIECE_NAMES[p.type]+' en '+s+' ataca '+victims.join(' y ')+'. Es un patrón de ataque doble; no garantiza ganar material.',victims.map(t=>[s,t]));
  if(p.type==='k'&&p.color===turn&&at.length){
   add('check',[s,...at],'El rey en '+s+' está en jaque.',at.map(a=>[a,s]));
   if(at.length>=2)add('doubleCheck',[s,...at],'Dos piezas dan jaque al rey en '+s+'. Debes mover el rey.',at.map(a=>[a,s]));
  }
  if(!['b','r','q'].includes(p.type))continue;
  const dirs=p.type==='b'?[[1,1],[1,-1],[-1,1],[-1,-1]]:p.type==='r'?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy]of dirs){
   const [x,y]=xy(s),found=[];let i=x+dx,j=y+dy;
   while(sq(i,j)&&found.length<2){const t=sq(i,j);if(map[t])found.push(t);i+=dx;j+=dy;}
   if(found.length!==2)continue;
   const [a,b]=found,pa=map[a],pb=map[b];
   if(pa.color!==p.color){
    if(pb.color!==p.color)add('xRayAttack',[s,a,b],PIECE_NAMES[p.type]+' en '+s+' tiene una línea hacia '+b+' bloqueada por la pieza rival en '+a+'. Es presión por rayos X; no un ataque directo a través del bloqueo.',[[s,b]]);
    if(pb.color===pa.color&&VALUES[pb.type]>VALUES[pa.type])add('pin',[a,s,b],PIECE_NAMES[pa.type]+' en '+a+' queda delante de '+PIECE_NAMES[pb.type]+' en '+b+'. '+(pb.type==='k'?'No puede moverse si deja al rey en jaque.':'Es una clavada relativa: puede moverse, pero expone la pieza de atrás.'),[[s,b]]);
    if(pb.color===pa.color&&VALUES[pa.type]>VALUES[pb.type])add('skewer',[a,s,b],'La pieza de mayor valor en '+a+' está delante de '+b+' en la línea de '+s+'. Es una enfilada geométrica; hay que evaluar las respuestas.',[[s,b]]);
   }else if(pb.color!==p.color&&p.color===turn){
    const candidates=legal.filter(m=>m.from===a);
    for(const m of candidates){const copy=new Chess(chess.fen());copy.move(m);const after=boardMap(copy);if(after[b]&&after[b].color!==p.color&&attacks(after,s,b)){
     add('discoveredAttack',[a,s,b],'Al mover '+a+' a '+m.to+', se abre la línea de '+s+' hacia '+b+'. La jugada es legal; la ganancia no está evaluada.',[[s,b]],m);
     if(pb.type==='k')add('discoveredCheck',[a,s,b],'Mover '+a+' a '+m.to+' descubre un jaque desde '+s+'.',[[s,b]],m);
     break;
    }}
   }
  }
 }
 for(const m of legal){
  if(m.flags.includes('k')||m.flags.includes('q'))add('castling',[m.from,m.to],'Enroque legal disponible: '+m.san+'.',[[m.from,m.to]],m);
  if(m.flags.includes('e'))add('enPassant',[m.from,m.to],'Captura al paso disponible: '+m.san+'. Solo puedes hacerla en este turno.',[[m.from,m.to]],m);
  if(m.promotion){const type=m.promotion==='q'?'promotion':'underPromotion';add(type,[m.from,m.to],'Puedes coronar a '+PIECE_NAMES[m.promotion]+' con '+m.san+'.',[[m.from,m.to]],m);}
 }
 if(chess.in_checkmate()){
  const king=Object.keys(map).find(s=>map[s].type==='k'&&map[s].color===turn);
  add('mate',[king],'Jaque mate: no existe ninguna respuesta legal.');
 }else if(options.mateIn1&&!chess.game_over()){
  const c=new Chess(chess.fen());
  for(const m of legal){c.move(m);if(c.in_checkmate())add('mateIn1',[m.from,m.to],'Mate en una comprobado: '+m.san+'.',[[m.from,m.to]],m);c.undo();}
 }
 return {map,alerts,legal};
}


