/* Ajedrex cloud contract. No provider calls: all persistence is injected.
   Execute under a server-wide lock. One authoritative JSON row per aggregate. */
function ajedrexCore_(q,ctx){
 const fail=code=>{throw Error(code);};
 const id=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{16,100}$/.test(v);
 const hash=v=>ctx.hash(String(v));
 const now=ctx.now();
 const get=(table,key)=>ctx.get(table,key);
 const put=(table,key,data)=>ctx.put(table,key,data);
 const name=v=>{if(typeof v!=='string'||!v.trim()||v.trim().length>60)fail('NAME');return v.trim();};
 const sessionId=()=>{if(!id(q.session)||q.session.length<32)fail('AUTH');return 'p_'+hash(q.session);};
 const legalHistory=(start,moves)=>{
  const c=new Chess();if(typeof start!=='string'||!c.load(start))fail('POSITION');
  const kings={w:0,b:0};c.board().flat().filter(Boolean).forEach(p=>{if(p.type==='k')kings[p.color]++;});
  if(kings.w!==1||kings.b!==1)fail('POSITION');
  if(!Array.isArray(moves)||moves.length>1500)fail('MOVES');
  for(const m of moves){if(c.game_over()||!m||!c.move({from:m.from,to:m.to,promotion:m.promotion||'q'}))fail('ILLEGAL');}
  return c;
 };
 const view=r=>({id:r.id,kind:r.kind,revision:r.revision,status:r.status,w:r.w,b:r.b,readyW:r.readyW,readyB:r.readyB,startFen:r.startFen,moves:r.moves,fen:r.fen,allowHints:r.allowHints,result:r.result||null,updatedAt:r.updatedAt});
 if(!q||typeof q!=='object'||JSON.stringify(q).length>60000)fail('REQUEST');
 if(q.action==='register'){
  const pid=sessionId();if(!id(q.invite))fail('INVITE');
  const iid='i_'+hash(q.invite),inv=get('Invitaciones',iid);
  if(!inv||inv.revoked||inv.expiresAt<=now)fail('INVITE');
  if(inv.playerId&&inv.playerId!==pid)fail('INVITE_USED');
  const old=get('Jugadores',pid);if(old?.disabled)fail('AUTH');
  const actor=old||{id:pid,name:name(q.name),role:inv.role==='owner'?'owner':'guest',createdAt:now,disabled:false};
  // Reserve first: a lost reply/retry with the same client secret completes safely.
  put('Invitaciones',iid,{...inv,playerId:pid});put('Jugadores',pid,actor);
  return {player:actor};
 }
 const pid=sessionId();let actor=get('Jugadores',pid);
 if(q.action==='join'){
  if(!id(q.roomId)||!id(q.invite))fail('INVITE');
  const r=get('Partidas',q.roomId);
  if(!r||r.kind!=='room'||r.joinHash!==hash(q.invite))fail('INVITE');
  if(actor?.disabled)fail('AUTH');
  if(r.w===pid)fail('SAME_PLAYER');
  if(r.b&&r.b!==pid)fail('ROOM_FULL');
  if(!r.b&&(r.expiresAt<=now||r.status!=='waiting'))fail('INVITE');
  actor=actor||{id:pid,name:name(q.name),role:'guest',createdAt:now,disabled:false};
  // Reserving a seat and creating a player is recoverable with the same secret.
  if(!r.b){r.b=pid;r.revision++;r.updatedAt=now;put('Partidas',r.id,r);}
  put('Jugadores',pid,actor);return {player:actor,room:view(r)};
 }
 if(!actor||actor.disabled)fail('AUTH');
 if(q.action==='me')return {player:actor};
 if(q.action==='create'){
  if(actor.role!=='owner')fail('FORBIDDEN');
  if(!id(q.roomId)||!id(q.requestId))fail('REQUEST');
  const old=get('Partidas',q.roomId);
  if(old){if(old.w!==pid||old.createRequest!==q.requestId||old.joinHash!==hash(q.invite)||old.allowHints!==(q.allowHints!==false))fail('CONFLICT');return {room:view(old)};}
  if(!id(q.invite)||q.invite.length<32)fail('INVITE');
  const c=new Chess(),r={id:q.roomId,kind:'room',w:pid,b:null,readyW:false,readyB:false,
   revision:0,status:'waiting',startFen:c.fen(),moves:[],fen:c.fen(),allowHints:q.allowHints!==false,
   joinHash:hash(q.invite),expiresAt:now+86400000,createdAt:now,updatedAt:now,createRequest:q.requestId,receipts:[]};
  put('Partidas',r.id,r);return {room:view(r)};
 }
 if(q.action==='saveSolo'){
  if(!id(q.gameId)||!Number.isSafeInteger(q.revision)||q.revision<1)fail('REQUEST');
  const key='s_'+hash(pid+'|'+q.gameId),old=get('Partidas',key);
  const snapshot=q.snapshot;
  if(!snapshot||snapshot.version!==1)fail('SNAPSHOT');
  const c=legalHistory(snapshot.startFen,snapshot.moves);
  const digest=hash(JSON.stringify(snapshot));
  if(old&&q.revision<=old.revision){
   if(q.revision===old.revision&&digest===old.digest)return {id:key,revision:old.revision,saved:true};
   fail('CONFLICT');
  }
  const r={id:key,kind:'solo',owner:pid,revision:q.revision,digest,snapshot,
   startFen:snapshot.startFen,moves:snapshot.moves,fen:c.fen(),status:c.game_over()?'finished':'active',updatedAt:now};
  if(JSON.stringify(r).length>45000)fail('SIZE');
  put('Partidas',key,r);return {id:key,revision:r.revision,saved:true};
 }
 if(!id(q.roomId))fail('REQUEST');
 const r=get('Partidas',q.roomId);
 if(!r||r.kind!=='room'||![r.w,r.b].includes(pid))fail('FORBIDDEN');
 if(q.action==='get')return {room:view(r)};
 if(!['ready','move','resign'].includes(q.action)||!id(q.requestId))fail('ACTION');
 const fingerprint=hash(JSON.stringify({actor:pid,action:q.action,revision:q.revision,move:q.move||null}));
 const previous=(r.receipts||[]).find(x=>x.id===q.requestId);
 if(previous){if(previous.fingerprint!==fingerprint)fail('CONFLICT');return {room:view(r),duplicate:true};}
 if(q.revision!==r.revision)fail('CONFLICT');
 if(q.action==='ready'){
  if(r.status!=='waiting')fail('STATUS');
  if(pid===r.w)r.readyW=true;else r.readyB=true;
  if(r.b&&r.readyW&&r.readyB)r.status='active';
 }else{
  if(r.status!=='active')fail('STATUS');
  if(q.action==='resign'){r.status='finished';r.result=pid===r.w?'0-1':'1-0';}
  else{
   const c=legalHistory(r.startFen,r.moves);
   if(c.game_over())fail('STATUS');
   if((c.turn()==='w'?r.w:r.b)!==pid)fail('TURN');
   const m=q.move;
   if(!m||!c.move({from:m.from,to:m.to,promotion:m.promotion||'q'}))fail('ILLEGAL');
   r.moves.push({from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})});r.fen=c.fen();
   if(c.game_over()){r.status='finished';r.result=c.in_checkmate()?(c.turn()==='w'?'0-1':'1-0'):'1/2-1/2';}
  }
 }
 r.revision++;r.updatedAt=now;r.receipts=(r.receipts||[]).concat({id:q.requestId,fingerprint}).slice(-32);
 if(JSON.stringify(r).length>45000)fail('SIZE');
 put('Partidas',r.id,r);return {room:view(r)};
}
