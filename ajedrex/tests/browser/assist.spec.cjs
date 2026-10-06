const {test,expect}=require('@playwright/test');
test('Chinche real: señalar sin mover, conservar posición, descargar y persistir',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 const fen=await page.evaluate(()=>game.fen());
 await page.locator('#pinButton').tap();await page.locator('#pinMark').tap();
 await page.locator('#board [data-square="e2"]').tap();await page.locator('#pinSave').tap();
 await expect(page.locator('#pinStatus')).toContainText('Escribe');
 await page.locator('#pinComment').fill('La pieza <b>debe seguir blanca</b>');
 await page.locator('#pinSave').tap();await expect(page.locator('#assistBody')).toContainText('<b>debe seguir blanca</b>');
 expect(await page.evaluate(()=>game.fen())).toBe(fen);
 expect(await page.evaluate(()=>selected)).toBe(null);
 const report=await page.evaluate(()=>pinReports[0]);expect(report.target.square).toBe('e2');expect(report.snapshot.fen).toBe(fen);expect(report.snapshot.backup.prefs.enabled).toHaveLength(81);
 await expect(page.locator('#pinGithub')).toHaveAttribute('href',/issues\/new\?title=/);
 const download=page.waitForEvent('download');await page.locator('#pinDownload').tap();expect((await download).suggestedFilename()).toMatch(/pin-.*\.json/);
 await page.locator('#assistClose').tap();await page.reload();await page.locator('#pinButton').tap();
 await expect(page.locator('[data-pin-id]')).toHaveCount(1);await page.locator('[data-pin-id]').tap();
 await page.locator('#pinResolved').tap();await page.locator('#pinBack').tap();await expect(page.locator('#pinList')).toContainText('Marcada resuelta');
 expect(errors).toEqual([]);
});
test('Chinche pausa rival, Escape cancela y el rival continúa',async({page})=>{
 await page.goto('/');await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 await page.locator('#pinButton').tap();const count=await page.evaluate(()=>game.history().length);
 await page.waitForTimeout(1300);expect(await page.evaluate(()=>game.history().length)).toBe(count);
 await page.locator('#pinMark').tap();await page.keyboard.press('Escape');
 await expect.poll(()=>page.evaluate(()=>game.history().length)).toBe(2);
 expect(await page.evaluate(()=>assistancePaused)).toBe(false);
});
test('Explorador conserva partida y avanza solo jugadas legales',async({page})=>{
 await page.goto('/');await page.evaluate(()=>{cancelThinking();prefs.mode='local';game=new Chess('6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1');startFen=game.fen();cache=null;render();inspectAlert({type:'mateIn1',confidence:'verified',message:'Mate de pasillo',squares:['e1','e8'],lines:[['e1','e8']],variation:['e1e8']});});
 const fen=await page.evaluate(()=>game.fen());await page.locator('#exploreAlert').tap();
 await expect(page.locator('#assistBody .assist-mark')).toHaveCount(2);await page.locator('#exploreNext').tap();await expect(page.locator('#exploreStep')).toContainText('Re8#');
 await expect(page.locator('#exploreNext')).toBeDisabled();expect(await page.evaluate(()=>game.fen())).toBe(fen);
 await page.locator('#exploreReport').tap();await page.locator('#pinComment').fill('Revisar explicación');await page.locator('#pinSave').tap();
 expect(await page.evaluate(()=>pinReports[0].snapshot.context)).toBe('explorer');
 await page.locator('#assistClose').tap();expect(await page.evaluate(()=>game.fen())).toBe(fen);
});
test('Enfoque conserva 81 preferencias y filtra por casillas relacionadas',async({page})=>{
 await page.goto('/');await page.locator('#focusMode').selectOption('w');
 expect(await page.evaluate(()=>focusAlerts(visibleAlerts()).every(a=>a.squares.some(s=>game.get(s)?.color==='w')))).toBe(true);
 expect(await page.evaluate(()=>prefs.enabled.length)).toBe(81);
 await page.locator('#focusMode').selectOption('selected');await page.locator('[data-square="e2"]').tap();
 expect(await page.evaluate(()=>focusAlerts(visibleAlerts()).every(a=>a.squares.includes('e2')))).toBe(true);
 await page.locator('#focusMode').selectOption('all');expect(await page.evaluate(()=>prefs.enabled.length)).toBe(81);
});
test('Reportar práctica conserva lección y partida; almacenamiento bloqueado avisa',async({page})=>{
 await page.goto('/');await page.evaluate(()=>openPractice('underPromotion'));
 const original=await page.evaluate(()=>game.fen()),practiceFen=await page.evaluate(()=>practiceSession.chess.fen());
 await page.locator('#pinButton').tap();await page.locator('#pinGeneral').tap();
 await page.locator('#pinComment').fill('Quiero entender esta promoción');
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('blocked');};});
 await page.locator('#pinSave').tap();await expect(page.locator('#pinDelivery')).toContainText('No se pudo guardar');
 expect(await page.evaluate(()=>pinReports[0].snapshot.fen)).toBe(practiceFen);
 expect(await page.evaluate(()=>pinReports[0].snapshot.lesson)).toBe('underPromotion');
 await page.locator('#assistClose').tap();expect(await page.evaluate(()=>game.fen())).toBe(original);await expect(page.locator('#practiceBoard')).toBeVisible();
});
