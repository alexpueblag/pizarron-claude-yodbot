const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..');
function setup(){
 const context={};vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(root,'vendor/chess.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'backend/core.js'),'utf8'),context);
 const records=new Map();let now=1000;
 const clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
 const ctx={hash:s=>crypto.createHash('sha256').update(s).digest('hex'),now:()=>now,get:(t,k)=>clone(records.get(t+'|'+k)),put:(t,k,v)=>records.set(t+'|'+k,clone(v))};
 const owner='o'.repeat(48),friend='f'.repeat(48),stranger='s'.repeat(48),invite='i'.repeat(48),roomId='r'.repeat(32),ticket='t'.repeat(48);
 records.set('Invitaciones|i_'+ctx.hash(invite),{role:'owner',expiresAt:999999,revoked:false});
 const call=q=>clone(context.ajedrexCore_(q,ctx));
 const a=call({action:'register',session:owner,invite,name:'Alex'}).player;
 const create={action:'create',session:owner,roomId,requestId:'c'.repeat(32),invite:ticket,allowHints:true};
 const room=call(create).room;
 return {call,records,ctx,owner,friend,stranger,invite,roomId,ticket,a,room,create,advance:ms=>now+=ms};
}
const error=(fn,code)=>assert.throws(fn,e=>e.message===code);
test('Invitación de un solo uso, identidad estable y acceso ajeno rechazado',()=>{
 const x=setup();assert.equal(x.call({action:'register',session:x.owner,invite:x.invite,name:'Alex'}).player.id,x.a.id);
 error(()=>x.call({action:'register',session:x.stranger,invite:x.invite,name:'Otro'}),'INVITE_USED');
 error(()=>x.call({action:'get',session:x.stranger,roomId:x.roomId}),'AUTH');
 const friend=x.call({action:'join',session:x.friend,roomId:x.roomId,invite:x.ticket,name:'Amigo'}).player;
 assert.equal(friend.role,'guest');error(()=>x.call({...x.create,session:x.friend,roomId:'z'.repeat(32)}),'FORBIDDEN');
 error(()=>x.call({action:'join',session:x.stranger,roomId:x.roomId,invite:x.ticket,name:'Otro'}),'ROOM_FULL');
 error(()=>x.call({...x.create,allowHints:false}),'CONFLICT');
});
test('Dos listos, turnos, movimientos ilegales, reintentos y conflicto de versión',()=>{
 const x=setup(),q=(action,session,revision,extra={})=>({action,session,roomId:x.roomId,revision,requestId:crypto.randomBytes(18).toString('hex'),...extra});
 x.call({action:'join',session:x.friend,roomId:x.roomId,invite:x.ticket,name:'Amigo'});
 error(()=>x.call(q('move',x.owner,1,{move:{from:'e2',to:'e4'}})),'STATUS');
 let r=x.call(q('ready',x.owner,1)).room;assert.equal(r.status,'waiting');
 r=x.call(q('ready',x.friend,r.revision)).room;assert.equal(r.status,'active');
 error(()=>x.call(q('move',x.friend,r.revision,{move:{from:'e7',to:'e5'}})),'TURN');
 error(()=>x.call(q('move',x.owner,r.revision,{move:{from:'e2',to:'e5'}})),'ILLEGAL');
 const move=q('move',x.owner,r.revision,{move:{from:'e2',to:'e4'}});
 r=x.call(move).room;assert.equal(r.moves.length,1);assert.equal(x.call(move).duplicate,true);
 error(()=>x.call({...move,move:{from:'d2',to:'d4'}}),'CONFLICT');
 error(()=>x.call(q('move',x.friend,0,{move:{from:'e7',to:'e5'}})),'CONFLICT');
 r=x.call(q('move',x.friend,r.revision,{move:{from:'e7',to:'e5'}})).room;assert.equal(r.moves.length,2);
 r=x.call(q('resign',x.owner,r.revision)).room;assert.equal(r.result,'0-1');
 error(()=>x.call(q('move',x.owner,r.revision,{move:{from:'d2',to:'d4'}})),'STATUS');
});
test('Caducidad, revocación y reserva recuperable al perder confirmación',()=>{
 const x=setup();x.advance(86400001);
 error(()=>x.call({action:'join',session:x.friend,roomId:x.roomId,invite:x.ticket,name:'Amigo'}),'INVITE');
 const y=setup(),original=y.ctx.put;let fail=true;
 y.ctx.put=(t,k,v)=>{if(t==='Jugadores'&&fail){fail=false;throw Error('write failed');}original(t,k,v);};
 assert.throws(()=>y.call({action:'join',session:y.friend,roomId:y.roomId,invite:y.ticket,name:'Amigo'}));
 const joined=y.call({action:'join',session:y.friend,roomId:y.roomId,invite:y.ticket,name:'Amigo'});
 assert.equal(joined.room.b,joined.player.id);
 original('Jugadores',joined.player.id,{...joined.player,disabled:true});
 error(()=>y.call({action:'get',session:y.friend,roomId:y.roomId}),'AUTH');
});
test('Partidas individuales: confirmación, idempotencia, rechazo de estados viejos y separación de usuarios',()=>{
 const x=setup();const start=x.room.startFen,snapshot={version:1,startFen:start,moves:[{from:'e2',to:'e4'}],prefs:{mode:'ai'}};
 const q={action:'saveSolo',session:x.owner,gameId:'a'.repeat(32),revision:1,snapshot};
 assert.equal(x.call(q).saved,true);assert.equal(x.call(q).saved,true);
 error(()=>x.call({...q,snapshot:{...snapshot,moves:[]}}),'CONFLICT');
 error(()=>x.call({...q,revision:2,snapshot:{...snapshot,moves:[{from:'e2',to:'e5'}]}}),'ILLEGAL');
 assert.equal(x.call({...q,revision:2,snapshot:{...snapshot,moves:[]}}).revision,2);
 error(()=>x.call(q),'CONFLICT');
 const f=x.call({action:'join',session:x.friend,roomId:x.roomId,invite:x.ticket,name:'=HYPERLINK("x")'}).player;
 assert.ok(f.name.startsWith('=')); // Adapter only writes JSON strings, never raw names as formulas.
 const other=x.call({...q,session:x.friend});assert.notEqual(other.id,x.call({...q,revision:2,snapshot:{...snapshot,moves:[]}}).id);
 const raw=JSON.stringify([...x.records]);assert.ok(!raw.includes(x.owner));assert.ok(!raw.includes(x.ticket));
});
test('Archivo instalable coincide exactamente con componentes probados; sin destino privado incrustado',()=>{
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 assert.equal(read('backend/Code.gs'),read('vendor/chess.js')+'\n'+read('backend/core.js')+'\n'+read('backend/adapter.gs'));
 assert.match(read('backend/adapter.gs'),/LockService.getScriptLock/);
 assert.match(read('backend/adapter.gs'),/SpreadsheetApp.flush/);
 assert.equal(JSON.parse(read('online-config.json')).endpoint,'');
});
