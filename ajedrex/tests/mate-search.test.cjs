const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../vendor/chess.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../mate-search.js'),'utf8')+'\nthis.api={Chess,detectForcedMates};',ctx);
const {Chess,detectForcedMates}=ctx.api;
const fixtures={
  1:'7k/5Q2/6K1/8/8/8/8/8 w - - 0 1',
  2:'5r1k/6pp/4Q2N/8/8/8/6PP/6K1 w - - 3 3',
  3:'5rk1/5Npp/4Q3/8/8/8/6PP/6K1 w - - 1 2',
  4:'5r1k/6pp/4Q3/6N1/8/8/6PP/6K1 w - - 0 1',
  5:'5rk1/6pp/8/6N1/8/4Q3/6PP/6K1 w - - 0 1'
};
const options={maxDepthMoves:5,maxNodes:300000,timeMs:30000};
const sq=n=>'abcdefgh'[n&15]+(8-(n>>4));
const uci=m=>(typeof m.from==='number'?sq(m.from):m.from)+(typeof m.to==='number'?sq(m.to):m.to)+(m.promotion||'');
test('fast legal search API matches public rules and restores the board',()=>{
 const positions=[new Chess().fen(),fixtures[4],
 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1',
 '8/P7/7k/8/8/8/8/7K w - - 0 1',
 '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
 'k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1'];
 for(const fen of positions){
  const game=new Chess(fen),before=game.fen();
  const fast=game.search_moves({checks:true});
  assert.deepEqual(Array.from(fast,uci).sort(),Array.from(game.moves({verbose:true}),uci).sort(),fen);
  assert.equal(game.fen(),before);
  for(const move of fast){
   const reference=new Chess(fen);reference.move({from:sq(move.from),to:sq(move.to),promotion:move.promotion});
   game.search_move(move);
   assert.equal(game.fen(),reference.fen());
   assert.equal(move.givesCheck,reference.in_check());
   game.search_undo();assert.equal(game.fen(),before);
  }
 }
});
test('fast move recursion has published start-position perft counts',()=>{
 const game=new Chess();
 function perft(depth){if(!depth)return 1;let total=0;for(const move of game.search_moves()){game.search_move(move);total+=perft(depth-1);game.search_undo();}return total;}
 assert.equal(perft(1),20);assert.equal(perft(2),400);assert.equal(perft(3),8902);
 assert.equal(game.history().length,0);
});
for(const distance of [1,2,3,4,5]){
 test('proves the minimum forced mate distance '+distance,()=>{
  const game=new Chess(fixtures[distance]),before=game.fen();
  const result=detectForcedMates(game,options);
  assert.equal(result.complete,true,JSON.stringify(result));assert.equal(result.horizon,distance);
  assert.equal(result.alerts.length,1);
  const alert=result.alerts[0];assert.equal(alert.type,'mateIn'+distance);assert.equal(alert.mateDistance,distance);
  assert.equal(alert.confidence,'verified');assert.equal(alert.proof,'forced-mate');
  assert.equal(alert.variation.length,distance*2-1);
  const line=new Chess(before);
  for(const value of alert.variation)assert.ok(line.move({from:value.slice(0,2),to:value.slice(2,4),promotion:value[4]}),value);
  assert.equal(line.in_checkmate(),true);
  assert.equal(game.fen(),before);assert.equal(game.history().length,0);
 });
}
test('the four-move proof includes a position with two distinct defences',()=>{
 const game=new Chess(fixtures[4]);game.move('Nf7+');
 assert.deepEqual(Array.from(game.moves()).sort(),['Kg8','Rxf7'].sort());
 const shorter=detectForcedMates(new Chess(fixtures[4]),{...options,maxDepthMoves:3});
 assert.equal(shorter.complete,true);assert.equal(shorter.alerts.length,0);assert.equal(shorter.horizon,3);
});
test('a mate in one is not mislabeled when only longer alerts are enabled',()=>{
 const result=detectForcedMates(new Chess(fixtures[1]),{...options,enabled:['mateIn2','mateIn3','mateIn4','mateIn5']});
 assert.equal(result.complete,true);assert.equal(result.horizon,1);assert.equal(result.alerts.length,0);
});
test('a quiet first move can start a proved mate in two',()=>{
 const result=detectForcedMates(new Chess('k7/8/2K5/8/8/8/8/3Q4 w - - 0 1'),options);
 assert.equal(result.alerts[0].mateDistance,2);assert.doesNotMatch(result.alerts[0].move.san,/[+#]/);
});
test('horizon exhaustion is a complete bounded result, not a proof of no mate ever',()=>{
 const result=detectForcedMates(new Chess(),{...options,maxDepthMoves:2});
 assert.equal(result.complete,true);assert.equal(result.reason,'horizon');assert.equal(result.horizon,2);assert.equal(result.alerts.length,0);
});
test('node exhaustion and deadline return unknown without any false alert',()=>{
 const game=new Chess(fixtures[5]),fen=game.fen();
 for(const limits of [{maxNodes:0},{maxNodes:20},{deadline:Date.now()-1},{timeMs:0}]){
  const result=detectForcedMates(game,{...options,...limits});
  assert.equal(result.complete,false);assert.equal(result.reason,'budget');assert.equal(result.alerts.length,0);
  assert.equal(game.fen(),fen);assert.equal(game.history().length,0);
 }
});
test('threefold repetition survives cloning and suppresses analysis of a finished game',()=>{
 const game=new Chess('k7/8/2K5/8/8/8/8/3Q4 w - - 0 1');
 for(const move of ['Qh1','Kb8','Qd1','Ka8','Qh1','Kb8','Qd1','Ka8'])assert.ok(game.move(move));
 assert.equal(game.in_threefold_repetition(),true);
 const before=game.pgn(),result=detectForcedMates(game,options);
 assert.equal(result.complete,true);assert.equal(result.reason,'terminal');assert.equal(result.alerts.length,0);
 assert.equal(game.pgn(),before);assert.equal(game.history().length,8);
});
test('fifty-move draw blocks a longer mate, while immediate checkmate has precedence',()=>{
 const blocked=detectForcedMates(new Chess('k7/8/2K5/8/8/8/8/3Q4 w - - 99 1'),{...options,maxDepthMoves:3});
 assert.equal(blocked.complete,true);assert.equal(blocked.alerts.length,0);
 const immediate=detectForcedMates(new Chess(fixtures[1].replace(' 0 1',' 99 1')),options);
 assert.equal(immediate.alerts[0].mateDistance,1);
});
test('checkmate, stalemate, and insufficient material produce no prospective mate alert',()=>{
 for(const fen of ['7k/6Q1/6K1/8/8/8/8/8 b - - 0 1','7k/5Q2/6K1/8/8/8/8/8 b - - 0 1','7k/8/6K1/8/8/8/8/8 w - - 0 1']){
  const result=detectForcedMates(new Chess(fen),options);
  assert.equal(result.complete,true);assert.equal(result.reason,'terminal');assert.equal(result.alerts.length,0);
 }
});

test('long played history stays bounded and is preserved after budget exhaustion',()=>{
 const game=new Chess();
 const history='e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 c6 f3 b5 Nge2 Nbd7 Bh6 Bxh6 Qxh6 Bb7 a3 e5 O-O-O Qe7 Kb1 a6 Nc1 O-O-O Nb3 exd4 Rxd4 c5 Rd1 Nb6 g3 Kb8 Na5 Ba8 Bh3 d5 Qf4+ Ka7'.split(' ');
 for(const san of history)assert.ok(game.move(san),san);
 const pgn=game.pgn(),fen=game.fen();
 const result=detectForcedMates(game,{maxDepthMoves:5,maxNodes:150,timeMs:30000});
 assert.equal(result.complete,false);assert.equal(result.reason,'budget');assert.equal(result.alerts.length,0);
 assert.ok(result.nodes<=150);assert.equal(game.fen(),fen);assert.equal(game.pgn(),pgn);assert.equal(game.history().length,40);
});
