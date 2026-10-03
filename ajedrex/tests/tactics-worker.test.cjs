
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=['vendor/chess.js','vendor/garbo.js','catalog.js','tactics.js','insights.js','context-tactics.js','advanced-tactics.js','mate-patterns.js','mate-search.js'];
function run(startFen,moves=[],budgetMs=2600,enabled){
 const messages=[],self={postMessage:data=>messages.push(JSON.parse(JSON.stringify(data)))};
 const context=vm.createContext({self});
 const source=files.map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n')+'\n'+fs.readFileSync(path.join(root,'tactics-worker.js'),'utf8').replace(/^importScripts\([^\n]+\);/m,'')+'\nthis.ids=ACTIVE_THEMES;this.Chess=Chess;';
 vm.runInContext(source,context);
 const data={kind:'tactics',id:42,startFen,moves,budgetMs,enabled:enabled||Array.from(context.ids)};
 context.self.onmessage({data});return {messages,Chess:context.Chess};
}
test('Worker completo: progreso, contratos y propuestas legales de todos los módulos',()=>{
 const fen='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
 const {messages,Chess}=run(fen),last=messages[messages.length-1];
 assert.ok(messages.length>=3);assert.equal(last.done,true);assert.equal(last.id,42);
 assert.ok(messages.every(m=>m.kind==='tactics'));
 assert.ok(!Object.values(last.coverage).includes('error'));
 assert.ok(last.alerts.some(a=>a.type==='opening'));
 for(const a of last.alerts){
  assert.ok(a.type&&a.message&&a.confidence);assert.ok(Array.isArray(a.squares));
  if(a.move)assert.ok(new Chess(fen).move(a.move),a.type+': '+a.move.san);
 }
});
test('Ampliar análisis obtiene mate en cinco probado y su longitud contextual',()=>{
 const fen='5rk1/6pp/8/6N1/8/4Q3/6PP/6K1 w - - 0 1';
 const {messages,Chess}=run(fen,[],10000),last=messages[messages.length-1];
 assert.equal(last.done,true);assert.ok(!Object.values(last.coverage).includes('error'));
 const mate=last.alerts.find(a=>a.type==='mateIn5');
 assert.ok(mate,JSON.stringify(last.coverage));assert.equal(mate.proof,'forced-mate');assert.equal(mate.mateDistance,5);
 assert.ok(last.alerts.some(a=>a.type==='veryLong'));
 const line=new Chess(fen);for(const uci of mate.variation)assert.ok(line.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]}));
 assert.ok(line.in_checkmate());
});
test('Partida terminada no ofrece jugadas ni tácticas futuras desde el worker',()=>{
 const {messages}=run('7k/R7/5N2/8/8/8/8/K7 w - - 100 1'),last=messages[messages.length-1];
 assert.equal(last.done,true);assert.ok(last.alerts.every(a=>!a.move));
 assert.ok(!last.alerts.some(a=>/^mateIn/.test(a.type)||a.type==='arabianMate'));
});

test('Longitud funciona independientemente del interruptor de mate',()=>{
 for(const [type,fen]of [
  ['oneMove','7k/5Q2/6K1/8/8/8/8/8 w - - 0 1'],
  ['short','5r1k/6pp/4Q2N/8/8/8/6PP/6K1 w - - 3 3']
 ]){
  const {messages}=run(fen,[],2600,[type]),last=messages[messages.length-1];
  assert.equal(last.done,true);assert.ok(last.alerts.some(a=>a.type===type),JSON.stringify(last));
  assert.ok(last.alerts.every(a=>a.type===type));
 }
});
