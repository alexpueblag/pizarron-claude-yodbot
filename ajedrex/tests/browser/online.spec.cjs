const {test,expect}=require('@playwright/test');
test('Sin deployment: no promete guardado remoto ni ofrece salas falsas',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.locator('#menuButton').tap();await page.locator('[data-nav="friends"]').tap();
 await expect(page.locator('#sheetBody')).toContainText('No se están enviando a Sheets');
 await expect(page.locator('#onlineCreate')).toHaveCount(0);
 await page.locator('#closeSheet').tap();await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 await expect.poll(()=>page.evaluate(()=>game.history().length)).toBe(2);
 await expect(page.locator('#onlineStatus')).toHaveText('Guardado local');expect(errors).toEqual([]);
});
test('Cola de guardado conserva el último estado y solo confirma con respuesta del servidor',async({page})=>{
 await page.goto('/');await page.evaluate(()=>{
  cancelThinking();prefs.mode='local';onlineState.registered=true;onlineConfig.endpoint='fixture';
  onlineRequest=async()=>{throw Error('OFFLINE');};onlinePersist();render();
 });
 await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 await page.locator('[data-square="e7"]').tap();await page.locator('[data-square="e5"]').tap();
 await expect.poll(()=>page.evaluate(()=>onlineState.outbox[0]?.snapshot.moves.length)).toBe(2);
 await expect(page.locator('#onlineStatus')).toContainText('pendiente');
 await page.reload();expect(await page.evaluate(()=>onlineState.outbox[0].snapshot.moves.length)).toBe(2);
 await page.evaluate(async()=>{
  onlineConfig.endpoint='fixture';onlineRequest=async q=>({saved:true,revision:q.revision,id:'test'});
  await onlineFlush();
 });
 expect(await page.evaluate(()=>onlineState.outbox.length)).toBe(0);
 await expect(page.locator('#onlineStatus')).toContainText('confirmadas en Sheets');
});
test('La jugada remota espera confirmación; volver a local recupera la partida y su identidad',async({page})=>{
 await page.goto('/');const saved=await page.evaluate(()=>({fen:game.fen(),id:onlineState.gameId}));
 await page.evaluate(()=>{
  onlineActor={id:'owner',name:'Alex',role:'owner'};
  const c=new Chess();
  onlineApply({id:'room-fixture',w:'owner',b:'friend',kind:'room',status:'active',revision:0,startFen:c.fen(),fen:c.fen(),moves:[],allowHints:true});
  onlineRequest=()=>new Promise(resolve=>{window.resolveRemote=resolve;});
 });
 await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 expect(await page.evaluate(()=>game.history().length)).toBe(0);
 await expect(page.locator('#onlineStatus')).toContainText('Confirmando');
 await page.evaluate(()=>{
  const c=new Chess();c.move('e4');window.resolveRemote({room:{...onlineRoom,revision:1,moves:[{from:'e2',to:'e4'}],fen:c.fen()}});
 });
 await expect(page.locator('[data-square="e4"] .piece')).toHaveCount(1);await expect(page.locator('#undo')).toBeDisabled();
 await page.evaluate(()=>onlineLeave());
 expect(await page.evaluate(()=>game.fen())).toBe(saved.fen);
 expect(await page.evaluate(()=>onlineState.gameId)).toBe(saved.id);
});

test('Una respuesta tardía no vuelve a abrir una sala que ya dejaste',async({page})=>{
 await page.goto('/');const fen=await page.evaluate(()=>game.fen());
 await page.evaluate(()=>{
  onlineActor={id:'owner',name:'Alex',role:'owner'};const c=new Chess();
  onlineApply({id:'room-fixture',w:'owner',b:'friend',kind:'room',status:'active',revision:0,startFen:c.fen(),fen:c.fen(),moves:[],allowHints:true});
  const snapshot={...onlineRoom};
  onlineRequest=()=>new Promise(resolve=>{window.lateReply=()=>{const next=new Chess();next.move('e4');resolve({room:{...snapshot,revision:1,moves:[{from:'e2',to:'e4'}],fen:next.fen()}});};});
 });
 await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 await page.evaluate(()=>{onlineLeave();window.lateReply();});
 await expect.poll(()=>page.evaluate(()=>onlineIsPlaying())).toBe(false);
 expect(await page.evaluate(()=>game.fen())).toBe(fen);
});
