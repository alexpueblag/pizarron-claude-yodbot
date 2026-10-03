
const {test,expect}=require('@playwright/test');
async function openTopic(page,id){await page.locator('#learnButton').tap();await page.locator('[data-practice="'+id+'"]').tap();}
async function playExpected(page){
 const uci=await page.evaluate(()=>practiceExpected(practiceSession));
 await page.locator('[data-practice-square="'+uci.slice(0,2)+'"]').tap();
 await page.locator('[data-practice-square="'+uci.slice(2,4)+'"]').tap();
 if(uci[4])await page.locator('[data-practice-promote="'+uci[4]+'"]').tap();
}
test('Sesenta prácticas con iconos, búsqueda y retorno sin perder la partida',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 await expect.poll(()=>page.evaluate(()=>game.history().length)).toBe(2);
 const before=await page.evaluate(()=>({fen:game.fen(),pgn:game.pgn(),prefs:JSON.stringify(prefs)}));
 await page.locator('#learnButton').tap();
 await expect(page.locator('[data-practice]')).toHaveCount(60);
 await page.locator('#practiceSearch').fill('arabe');await expect(page.locator('[data-practice]')).toHaveCount(1);
 await page.locator('[data-practice="arabianMate"]').tap();
 await expect(page.locator('#practiceBoard [data-practice-square]')).toHaveCount(64);
 await page.locator('[data-practice-square="a7"]').tap();await page.locator('[data-practice-square="h7"]').tap();
 await expect(page.locator('.practice-success')).toContainText('Ejemplo completado');
 expect(await page.evaluate(()=>practiceSession.chess.in_checkmate())).toBe(true);
 await page.locator('#practiceReturn').tap();
 expect(await page.evaluate(()=>({fen:game.fen(),pgn:game.pgn(),prefs:JSON.stringify(prefs)}))).toEqual(before);
 expect(errors).toEqual([]);
});
test('Pistas, progreso guardado e importación de la copia',async({page})=>{
 await page.goto('/');await openTopic(page,'pin');
 await page.locator('[data-practice-square="h1"]').tap();
 expect(await page.evaluate(()=>practiceSession.solved)).toBe(false);
 await page.locator('#practiceHint').tap();
 await expect(page.locator('.practice-marker [data-theme-icon="pin"]')).toHaveCount(1);
 await page.locator('[data-practice-square="e7"]').tap();
 expect(await page.evaluate(()=>practiceProgress.pin)).toBe('assisted');
 const backup=await page.evaluate(()=>backupData());expect(backup.practiceProgress.pin).toBe('assisted');
 await page.locator('#practiceReturn').tap();await page.reload();
 expect(await page.evaluate(()=>practiceProgress.pin)).toBe('assisted');
 await page.evaluate(data=>importBackup(data),backup);await page.locator('#learnButton').tap();
 await expect(page.locator('#practiceProgressSummary')).toContainText('1 de 60');
 await page.locator('#practiceFilter').selectOption('remaining');await expect(page.locator('[data-practice]')).toHaveCount(59);
});
test('Subpromoción acepta caballo y explica otra jugada legal sin cambiarla',async({page})=>{
 await page.goto('/');await openTopic(page,'underPromotion');
 await page.locator('[data-practice-square="a7"]').tap();await page.locator('[data-practice-square="a8"]').tap();
 await expect(page.locator('[data-practice-promote]')).toHaveCount(4);
 await page.locator('[data-practice-promote="q"]').tap();
 await expect(page.locator('#practiceFeedback')).toContainText('jugada legal');
 expect(await page.evaluate(()=>practiceSession.chess.get('a7').type)).toBe('p');
 await page.locator('[data-practice-square="a7"]').tap();await page.locator('[data-practice-square="a8"]').tap();
 await page.locator('[data-practice-promote="n"]').tap();
 await expect(page.locator('.practice-success')).toBeVisible();
 await expect(page.locator('.practice-explanation')).toContainText('caballo');
 expect(await page.evaluate(()=>game.history().length)).toBe(0);
});
test('Las variantes avanzan a petición y conservan el resultado',async({page})=>{
 await page.goto('/');await openTopic(page,'mateIn2');
 await playExpected(page);
 await expect(page.locator('#practiceReply')).toBeVisible();
 const ply=await page.evaluate(()=>practiceSession.index);await page.waitForTimeout(1100);
 expect(await page.evaluate(()=>practiceSession.index)).toBe(ply);
 await page.locator('#practiceReply').tap();await playExpected(page);
 expect(await page.evaluate(()=>practiceSession.chess.in_checkmate())).toBe(true);
 expect(await page.evaluate(()=>practiceProgress.mateIn2)).toBe('solved');
 await page.locator('#practiceBack').tap();await page.locator('[data-practice="mateIn5"]').tap();
 await page.locator('#practiceReveal').tap();await expect(page.locator('.practice-line li')).toHaveCount(9);
 expect(await page.evaluate(()=>practiceSession.index)).toBe(0);
 await page.locator('#practiceStep').tap();expect(await page.evaluate(()=>practiceSession.index)).toBe(1);
 await expect(page.locator('#practiceReply')).toBeVisible();
});
test('La IA se pausa al practicar y vuelve al cerrar',async({page})=>{
 await page.goto('/');await page.evaluate(()=>{makeMove({from:'e2',to:'e4'});openPractice('pin');});
 await page.waitForTimeout(1200);expect(await page.evaluate(()=>game.history().length)).toBe(1);
 await page.locator('#closeSheet').tap();
 await expect.poll(()=>page.evaluate(()=>game.history().length),{timeout:10000}).toBe(2);
 expect(await page.evaluate(()=>practicePaused)).toBe(false);
});
test('Acceso desde catálogo, casillas táctiles y diseño estrecho',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto('/');
 await page.locator('#catalogButton').tap();await page.locator('#catalogSearch').fill('rayos x');
 await page.locator('#catalogList summary').tap();await page.locator('[data-catalog-practice="xRayAttack"]').tap();
 await page.locator('#practiceHint').tap();
 await expect(page.locator('.practice-lines line[stroke-dasharray="2 2"]')).not.toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-practice-square="a2"]').tap();await expect(page.locator('.practice-success')).toBeVisible();
 await page.screenshot({path:'test-results/ajedrex-practica-iphone.png',fullPage:true});
});
