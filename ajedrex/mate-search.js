/* Ajedrex: bounded, exact AND/OR proof of forced mate.
 * Run in a Worker. Exhaustion means unknown, never "no mate" or a proved tactic.
 * This verifier checks every legal defence. It is not a score from the engine.
 */
function detectForcedMates(source, options = {}) {
  const started = Date.now();
  const maxDepthMoves = Math.max(1, Math.min(8, Math.floor(Number(options.maxDepthMoves) || 5)));
  const maxNodes = Math.max(0, Number.isFinite(options.maxNodes) ? Math.floor(options.maxNodes) : 45000);
  const deadline = Number.isFinite(options.deadline) ? options.deadline : started + (Number.isFinite(options.timeMs) ? Math.max(0,options.timeMs) : 900);
  const enabled = options.enabled == null ? null : new Set(options.enabled);
  const enabledType = n => n >= 5 ? 'mateIn5' : 'mateIn' + n;
  const base = { alerts: [], complete: false, nodes: 0, horizon: 0, maxDepthMoves, elapsedMs: 0, reason: null };
  const done = extra => Object.assign(base, extra, { elapsedMs: Date.now() - started });
  if (enabled && ![1,2,3,4,5].some(n => enabled.has(enabledType(n)))) return done({complete:true,reason:'disabled'});
  if (maxNodes === 0 || Date.now() >= deadline) return done({reason:'budget'});
  // Rebuild on a private board, including the complete played history.
  // Using only FEN here would lose threefold repetition.
  const movesPlayed = source.history({verbose:true});
  const headers = source.header();
  const game = new Chess(headers.FEN || undefined);
  for (const move of movesPlayed) {
    if (!game.move(move)) return done({reason:'history-unavailable'});
  }
  if (game.fen() !== source.fen()) return done({reason:'history-unavailable'});
  const fast = typeof game.search_moves === 'function';
  const legalMoves = checks => fast ? game.search_moves({checks}) : game.moves({verbose:true});
  const make = move => fast ? game.search_move(move) : game.move(move);
  const undo = () => fast ? game.search_undo() : game.undo();
  const square = value => typeof value === 'number' ? 'abcdefgh'[value & 15] + (8-(value >> 4)) : value;
  const uci = move => square(move.from) + square(move.to) + (move.promotion || '');
  const plain = move => ({from:square(move.from),to:square(move.to),...(move.promotion?{promotion:move.promotion}:{})});
  // An unusable en-passant target does not distinguish repeated positions.
  function positionKey(fen) {
    const fields = fen.split(' ').slice(0,4);
    if (fields[3] !== '-') {
      const epAvailable = legalMoves(false).some(m => fast ? (m.flags & 8) : m.flags.includes('e'));
      if (!epAvailable) fields[3] = '-';
    }
    return fields.join(' ');
  }
  const counts = new Map(), positionIds = new Map();
  const internPosition = key => { if(!positionIds.has(key))positionIds.set(key,positionIds.size); return positionIds.get(key); };
  while (true) {
    const move = undo();
    if (!move) break;
  }
  // Reapply using the verified source moves to calculate canonical repetition keys.
  const addPosition = () => { const key=positionKey(game.fen()); internPosition(key); counts.set(key,(counts.get(key)||0)+1); return key; };
  addPosition();
  for (const move of movesPlayed) { game.move(move); addPosition(); }
  const attacker = game.turn();
  const abort = {};
  const table = new Map(), onePlyTable = new Map();
  let nodes = 0, horizon = 0;
  const budget = () => { if (nodes >= maxNodes || Date.now() >= deadline) throw abort; };
  function isDraw(fen) {
    return Number(fen.split(' ')[4]) >= 100 || game.insufficient_material() || (counts.get(positionKey(fen)) || 0) >= 3;
  }
  function cacheKey(fen, depth) {
    // Repetition counts are part of the state: FEN alone is unsafe for proofs.
    // Exact interned IDs keep keys small; unlike probabilistic hashes, IDs cannot collide.
    return fen.split(' ').slice(0,5).join(' ') + '|' + depth + '|' +
      Array.from(counts.entries(),([key,n])=>[internPosition(key),n]).sort((a,b)=>a[0]-b[0]).map(([id,n])=>id+':'+n).join(';');
  }
  function ordered(list) {
    return list.sort((a,b) => {
      const rank = m => (fast ? m.givesCheck : /[+#]$/.test(m.san)) ? 100 : 0;
      const capture = m => m.captured ? ({p:1,n:3,b:3,r:5,q:9}[m.captured]||0) : 0;
      return (rank(b)+capture(b)+(b.promotion?8:0))-(rank(a)+capture(a)+(a.promotion?8:0));
    });
  }
  function search(depth) {
    budget(); nodes++;
    const fen = game.fen(), check = game.in_check(), attacking=game.turn()===attacker;
    // At one ply only checking moves can mate. This proof cannot encounter a
    // repetition draw before checkmate, so its cache needs no history key.
    if (depth === 1 && attacking) {
      if(isDraw(fen))return {win:false,line:[]};
      const oneKey=fen.split(' ').slice(0,4).join(' ');
      if(onePlyTable.has(oneKey)) return onePlyTable.get(oneKey);
      let answer={win:false,line:[]};
      for(const move of ordered(legalMoves(true)).filter(m=>fast?m.givesCheck:/[+#]$/.test(m.san))) {
        budget(); make(move);
        let mate;
        try { nodes++; mate=game.in_check() && legalMoves(false).length === 0; }
        finally { undo(); }
        if(mate) { answer={win:true,line:[uci(move)]}; break; }
      }
      if(onePlyTable.size<18000)onePlyTable.set(oneKey,answer);
      return answer;
    }
    // A zero-depth node only needs legal generation to distinguish checkmate.
    if (depth === 0 && !check) return {win:false,line:[]};
    // Long played histories make exact repetition keys expensive on a phone.
    // Skipping this optional cache changes speed only, never the proof.
    const key=depth>0 && counts.size<=24 ? cacheKey(fen,depth) : null;
    if(key && table.has(key))return table.get(key);
    const list = legalMoves(depth > 0);
    if (!list.length) return {win:check && !attacking,line:[]};
    if (isDraw(fen) || depth === 0) return {win:false,line:[]};
    let longest = [], answer = {win:!attacking,line:[]};
    for (const move of ordered(list)) {
      budget();
      make(move);
      const rep = addPosition();
      let child;
      try { child = search(depth-1); }
      finally { const count=counts.get(rep)-1; if(count)counts.set(rep,count);else counts.delete(rep); undo(); }
      if (attacking && child.win) { answer={win:true,line:[uci(move),...child.line]}; break; }
      if (!attacking && !child.win) { answer={win:false,line:[]}; break; }
      if (!attacking && child.line.length+1 > longest.length) longest=[uci(move),...child.line];
    }
    if (!attacking && answer.win) answer.line=longest;
    if (key && table.size < 18000) table.set(key,answer);
    return answer;
  }
  try {
    const initialFen = game.fen(), initialMoves = legalMoves(false);
    if (!initialMoves.length || isDraw(initialFen)) return done({complete:true,reason:'terminal'});
    for (let distance=1; distance<=maxDepthMoves; distance++) {
      const result = search(distance*2-1);
      horizon=distance;
      if (result.win) {
        const type=enabledType(distance), alerts=[];
        if (!enabled || enabled.has(type)) {
          const first=result.line[0], move=plain({from:first.slice(0,2),to:first.slice(2,4),promotion:first[4]});
          const pretty=game.move(move); game.undo();
          alerts.push({type,squares:[move.from,move.to],message:'Mate forzado en '+distance+' '+(distance===1?'jugada':'jugadas')+' comprobado: '+pretty.san+'. Se verificaron todas las defensas legales dentro de este horizonte.',lines:[[move.from,move.to]],move:pretty,confidence:'verified',proof:'forced-mate',mateDistance:distance,variation:result.line});
        }
        return done({alerts,complete:true,nodes,horizon,reason:'proved'});
      }
    }
    return done({complete:true,nodes,horizon,reason:'horizon'});
  } catch(error) {
    if(error !== abort) throw error;
    return done({complete:false,nodes,horizon,reason:'budget'});
  }
}
