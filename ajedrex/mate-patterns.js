/* Ajedrex — reconocimiento geométrico de 19 familias de mate.
 * Un nombre de patrón se emite únicamente tras verificar jaque mate con chess.js.
 * Las variantes documentadas en MATE_PATTERN_COVERAGE son deliberadamente
 * concretas: una coincidencia de material por sí sola nunca activa una alerta.
 * Dependencias: Chess, boardMap, attacks, attackers, xy, sq (tactics.js).
 */
const MATE_PATTERN_COVERAGE = {
 anastasiaMate:{scope:'Rey en un borde, fuera de la esquina, torre o dama dando jaque por ese borde, caballo a tres casillas hacia el interior y una pieza propia a una casilla del rey.',name:'Mate de Anastasia'},
 arabianMate:{scope:'Rey en la esquina, torre adyacente protegida por un caballo situado dos filas y dos columnas hacia el interior.',name:'Mate árabe'},
 backRankMate:{scope:'Torre o dama da jaque por la última fila del rey y todas las salidas hacia delante están ocupadas por piezas propias.',name:'Mate del pasillo'},
 balestraMate:{scope:'Alfil da mate; una dama a salto de caballo del rey cubre todas las salidas restantes junto al alfil.',name:'Mate Balestra'},
 blindSwineMate:{scope:'Una torre adyacente da jaque, y la segunda está al lado de ella perpendicularmente al jaque: las dos torres forman un bloque 2×2 con el rey.',name:'Mate de los cerdos ciegos'},
 bodenMate:{scope:'Dos alfiles de distinto color de casilla cierran las salidas por diagonales cruzadas, desde lados opuestos del rey, con al menos un bloqueo propio.',name:'Mate de Boden'},
 cornerMate:{scope:'Un caballo da mate en la esquina; torre o dama cierra dos salidas y una pieza propia bloquea la tercera.',name:'Mate de la esquina'},
 doubleBishopMate:{scope:'Dos alfiles de distinto color de casilla cierran las salidas desde el mismo cuadrante, con al menos un bloqueo propio.',name:'Mate de dos alfiles'},
 dovetailMate:{scope:'Dama protegida en diagonal inmediata al rey; las dos casillas que la dama no alcanza están bloqueadas por piezas propias.',name:'Mate cola de paloma'},
 epauletteMate:{scope:'Dama o torre da jaque ortogonal, con piezas propias inmediatamente a ambos lados del rey, perpendicularmente a la línea de jaque.',name:'Mate de las charreteras'},
 hookMate:{scope:'Torre adyacente protegida por caballo adyacente al rey; un peón protege al caballo y cubre otra salida; un peón rival bloquea al rey.',name:'Mate del gancho'},
 killBoxMate:{scope:'Dama y torre en esquinas opuestas de un cuadro 3×3, rey dentro del cuadro, centro libre o con el rey y ambas piezas cerrando salidas distintas.',name:'Mate kill box'},
 pillsburysMate:{scope:'Torre a distancia da mate a un rey en el borde; alfil cierra una salida exclusiva y una pieza propia del rey bloquea otra.',name:'Mate de Pillsbury'},
 morphysMate:{scope:'Alfil da mate a un rey en el borde; una torre cierra al menos dos salidas y una pieza propia bloquea otra.',name:'Mate de Morphy'},
 swallowstailMate:{scope:'Dama protegida ortogonalmente adyacente al rey interior; dos piezas propias ocupan las diagonales de atrás que la dama no controla.',name:'Mate cola de golondrina'},
 triangleMate:{scope:'Dama y torre en las dos diagonales inmediatas de un mismo lado del rey; la dama da jaque protegida por la torre.',name:'Mate del triángulo'},
 vukovicMate:{scope:'Rey, torre y caballo alineados en tres casillas consecutivas: torre protegida por una tercera pieza y caballo cerrando las dos salidas laterales del rey.',name:'Mate de Vuković'},
 operaMate:{scope:'Torre adyacente da mate protegida directamente por un alfil que también cierra una salida.',name:'Mate de la ópera'},
 smotheredMate:{scope:'Caballo da jaque y todas las casillas contiguas del rey están ocupadas por piezas de su propio bando.',name:'Mate de la coz'}
};
function detectMatePatterns(chess,options={}){
 const alerts=[],seen=new Set();
 function inspect(position,move){
  if(!position.in_checkmate())return;
  const map=boardMap(position),loser=position.turn(),winner=loser==='w'?'b':'w';
  const king=Object.keys(map).find(s=>map[s].color===loser&&map[s].type==='k');
  if(!king)return;
  const [kx,ky]=xy(king),vacated={...map};delete vacated[king];
  const entries=Object.keys(map),friends=t=>entries.filter(s=>map[s].color===winner&&(!t||t.includes(map[s].type)));
  const checkers=attackers(map,king,winner),checking=t=>checkers.filter(s=>t.includes(map[s].type));
  const at=(dx,dy)=>sq(kx+dx,ky+dy);
  const neighbors=[];for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const s=at(dx,dy);if((dx||dy)&&s)neighbors.push(s);}
  const own=s=>!!s&&!!map[s]&&map[s].color===loser;
  const controls=(from,to)=>!!from&&!!to&&attacks(vacated,from,to);
  const delta=s=>{const [x,y]=xy(s);return[x-kx,y-ky];};
  const distance=s=>Math.max(...delta(s).map(Math.abs));
  const blocked=neighbors.filter(own),escapes=neighbors.filter(s=>!own(s));
  const contributes=(p,others)=>escapes.some(s=>controls(p,s)&&!others.some(o=>controls(o,s)));
  const closes=pieces=>escapes.every(s=>pieces.some(p=>controls(p,s)));
  const edge=kx===0||kx===7||ky===0||ky===7,corner=(kx===0||kx===7)&&(ky===0||ky===7);
  function add(type,pieces,detail){
   const key=type+':'+(move?move.from+move.to+(move.promotion||''):'actual');
   if(seen.has(key))return;seen.add(key);
   alerts.push({type,squares:[...new Set([king,...pieces,...(move?[move.from,move.to]:[])])],
    message:(move?'Con '+move.san+': ':'')+MATE_PATTERN_COVERAGE[type].name+'. '+detail+' Jaque mate comprobado por las reglas.',
    lines:[],move:move||null,confidence:'verified'});
  }
  for(const rook of checking('rq')){
   const [rx,ry]=delta(rook);
   if(ky===(loser==='w'?0:7)&&ry===0){
    const inward=loser==='w'?1:-1,front=[at(-1,inward),at(0,inward),at(1,inward)].filter(Boolean);
    if(front.length&&front.every(own))add('backRankMate',[rook,...front],'Las piezas propias cierran todas las salidas hacia delante.');
   }
   if(edge&&!corner){
    const inward=[];if(kx===0)inward.push([1,0]);if(kx===7)inward.push([-1,0]);if(ky===0)inward.push([0,1]);if(ky===7)inward.push([0,-1]);
    for(const [dx,dy]of inward){
     const n=at(3*dx,3*dy),block=at(dx,dy);
     if(n&&map[n]&&map[n].color===winner&&map[n].type==='n'&&own(block)&&rx*dx+ry*dy===0&&
       [at(dx-dy,dy+dx),at(dx+dy,dy-dx)].filter(Boolean).every(s=>controls(n,s)))
      add('anastasiaMate',[rook,n,block],'El caballo cierra las diagonales interiores, una pieza propia bloquea la salida central y el jaque recorre el borde.');
    }
   }
   if((rx===0)!==(ry===0)){
    const ux=Math.sign(rx),uy=Math.sign(ry),a=at(-uy,ux),b=at(uy,-ux);
    if(own(a)&&own(b))add('epauletteMate',[rook,a,b],'Dos piezas del propio rey forman las charreteras a ambos lados de la línea de jaque.');
   }
  }
  for(const n of checking('n')){
   if(neighbors.every(own))add('smotheredMate',[n,...neighbors],'El caballo salta sobre el cerco formado por todas las piezas propias del rey.');
   if(corner&&blocked.length===1){
    for(const r of friends('rq'))if(!checkers.includes(r)&&escapes.length===2&&escapes.every(s=>controls(r,s)))
     add('cornerMate',[n,r,...blocked],'El caballo da jaque en la esquina y la pieza mayor cierra las otras dos salidas.');
   }
  }
  for(const r of checking('r')){
   const [rx,ry]=delta(r),adj=distance(r)===1;
   if(corner&&adj)for(const n of friends('n')){
    const [nx,ny]=delta(n);
    if(Math.abs(nx)===2&&Math.abs(ny)===2&&controls(n,r)&&contributes(n,[r]))
     add('arabianMate',[r,n],'El caballo protege la torre adyacente y cierra la otra salida junto a la esquina.');
   }
   if(adj){
    for(const other of friends('r'))if(other!==r){
     const [ox,oy]=delta(other);
     if(Math.abs(ox-rx)+Math.abs(oy-ry)===1&&(ox-rx)*rx+(oy-ry)*ry===0&&controls(other,r)&&contributes(other,[r]))
      add('blindSwineMate',[r,other],'Las dos torres contiguas se apoyan y forman un cerco de dos por dos casillas.');
    }
    for(const n of friends('n')){
     const [nx,ny]=delta(n);
     if(nx===2*rx&&ny===2*ry){
      const support=friends().filter(p=>p!==r&&p!==n&&controls(p,r));
      const exits=[at(-ry,rx),at(ry,-rx)].filter(Boolean);
      if(support.length&&exits.length===2&&exits.every(s=>controls(n,s)))
       add('vukovicMate',[r,n,support[0]],'La torre está entre el rey y el caballo; una tercera pieza la protege y el caballo cierra ambos lados.');
     }
     if(distance(n)===1&&controls(n,r)){
      for(const pawn of friends('p'))if(controls(pawn,n)&&escapes.some(s=>s!==n&&controls(pawn,s)&&!controls(r,s)&&!controls(n,s))){
       const blocker=blocked.find(s=>map[s].type==='p');
       if(blocker&&closes([r,n,pawn]))add('hookMate',[r,n,pawn,blocker],'La torre está protegida por el caballo, el caballo por un peón y un peón del rey obstruye su salida.');
      }
     }
    }
    for(const b of friends('b'))if(controls(b,r)&&contributes(b,[r])&&closes([r,b]))
     add('operaMate',[r,b,...blocked],'El alfil protege directamente la torre que da mate y también cierra una salida del rey.');
   }else if(edge&&blocked.length){
    for(const b of friends('b'))if(!checkers.includes(b)&&!controls(b,r)&&contributes(b,[r])&&closes([r,b]))
     add('pillsburysMate',[r,b,...blocked],'La torre da jaque desde lejos y el alfil impide salir del borde.');
   }
  }
  for(const b of checking('b')){
   for(const q of friends('q')){
    const [qx,qy]=delta(q);
    if(Math.abs(qx)*Math.abs(qy)===2&&!checkers.includes(q)&&contributes(q,[b])&&closes([q,b]))
     add('balestraMate',[b,q,...blocked],'El alfil da el jaque y la dama, situada a un salto de caballo, cubre las demás salidas.');
   }
   if(edge&&blocked.length)for(const r of friends('r'))if(!checkers.includes(r)&&escapes.filter(s=>controls(r,s)).length>=2&&contributes(r,[b])&&closes([r,b]))
    add('morphysMate',[b,r,...blocked],'El alfil da el jaque y la torre cierra las salidas junto al borde.');
   for(const other of friends('b'))if(other!==b&&blocked.length){
    const [bx,by]=delta(b),[ox,oy]=delta(other);
    const differentColor=(xy(b)[0]+xy(b)[1])%2!==(xy(other)[0]+xy(other)[1])%2;
    if(!differentColor||!contributes(other,[b])||!closes([b,other]))continue;
    const opposite=(bx*ox<0||by*oy<0);
    add(opposite?'bodenMate':'doubleBishopMate',[b,other,...blocked],opposite?'Los alfiles cierran las salidas desde lados opuestos, con diagonales cruzadas.':'Los alfiles cierran las salidas por diagonales vecinas desde el mismo lado.');
   }
  }
  for(const q of checking('q')){
   const [qx,qy]=delta(q);
   if(!edge&&distance(q)===1){
    const uncovered=neighbors.filter(s=>s!==q&&!controls(q,s));
    if(uncovered.length===2&&uncovered.every(own)&&friends().some(p=>p!==q&&controls(p,q))){
     if(qx&&qy)add('dovetailMate',[q,...uncovered],'La dama da jaque en diagonal y dos piezas propias bloquean las dos casillas que quedan fuera de su alcance.');
     else add('swallowstailMate',[q,...uncovered],'La dama da jaque de frente y las dos piezas de atrás forman la cola en V.');
    }
   }
   for(const r of friends('r')){
    const [rx,ry]=delta(r),[qfx,qfy]=xy(q),[rfx,rfy]=xy(r);
    if(Math.abs(qx)===1&&Math.abs(qy)===1&&Math.abs(rx)===1&&Math.abs(ry)===1&&(rx===qx||ry===qy)&&controls(r,q)&&contributes(r,[q]))
     add('triangleMate',[q,r],'Dama, torre y rey forman un triángulo; la torre protege a la dama y cierra otra salida.');

   }
  }
  for(const q of friends('q'))for(const r of friends('r')){
   if(!checkers.includes(q)&&!checkers.includes(r))continue;
   const [qfx,qfy]=xy(q),[rfx,rfy]=xy(r);
   const inBox=kx>=Math.min(qfx,rfx)&&kx<=Math.max(qfx,rfx)&&ky>=Math.min(qfy,rfy)&&ky<=Math.max(qfy,rfy);
   const center=sq((qfx+rfx)/2,(qfy+rfy)/2);
   if(Math.abs(qfx-rfx)===2&&Math.abs(qfy-rfy)===2&&inBox&&(!map[center]||center===king)&&(checkers.includes(r)||contributes(r,[q]))&&(checkers.includes(q)||contributes(q,[r])))
    add('killBoxMate',[q,r],'La dama y la torre ocupan esquinas opuestas de un cuadro de tres por tres y cierran salidas distintas.');
  }
 }
 if(chess.in_checkmate())inspect(chess,null);
 else if(!chess.game_over()&&options.includeThreats!==false){
  const candidates=Array.isArray(options.matingMoves)?options.matingMoves:(options.legal||chess.moves({verbose:true}));
  const copy=new Chess(chess.fen());
  for(const candidate of candidates){
   const move=copy.move(candidate);
   if(!move)continue;
   inspect(copy,move);
   copy.undo();
  }
 }
 return alerts;
}
