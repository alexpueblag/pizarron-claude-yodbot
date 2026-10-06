const {test,expect}=require('@playwright/test');
async function local(page){await page.evaluate(()=>{cancelThinking();prefs.mode='local';render();});}
async function corner(page,square){
 const badge=page.locator('#board [data-alert-square="'+square+'"]').first();
 await expect(badge).toBeVisible();await badge.scrollIntoViewIfNeeded();
 const r=await badge.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);
}
test('Tocar encima del icono selecciona y captura, sin abrir una leyenda',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await local(page);
 await corner(page,'e2');expect(await page.evaluate(()=>selected)).toBe('e2');
 await expect(page.locator('#veil')).not.toHaveClass(/open/);
 await page.locator('[data-square="e4"]').tap();await page.locator('[data-square="d7"]').tap();await page.locator('[data-square="d5"]').tap();
 await page.locator('[data-square="e4"]').tap();await corner(page,'d5');
 expect(await page.evaluate(()=>game.history().length)).toBe(3);
 await expect(page.locator('[data-square="d5"] .piece[data-color="w"]')).toHaveCount(1);
 await expect(page.locator('#veil')).not.toHaveClass(/open/);expect(errors).toEqual([]);
});
test('Arrastre comienza también sobre un icono en modo Jugar',async({page})=>{
 await page.goto('/');await local(page);await page.locator('#board').scrollIntoViewIfNeeded();
 const badge=await page.locator('[data-alert-square="e2"]').first().boundingBox(),target=await page.locator('[data-square="e4"]').boundingBox();
 await page.mouse.move(badge.x+badge.width/2,badge.y+badge.height/2);await page.mouse.down();
 await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:10});await page.mouse.up();
 await expect(page.locator('[data-square="e4"] .piece[data-color="w"]')).toHaveCount(1);
 await expect(page.locator('#veil')).not.toHaveClass(/open/);
});
test('Consultar explica sin mover; Jugar recupera el movimiento y las 81 ayudas',async({page})=>{
 await page.goto('/');await local(page);const fen=await page.evaluate(()=>game.fen());
 await page.locator('#inspectMode').tap();await expect(page.locator('#inspectMode')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-square="e2"]').tap();await expect(page.locator('#sheetTitle')).toContainText('e2');
 expect(await page.evaluate(()=>game.fen())).toBe(fen);await page.locator('#closeSheet').tap();
 const badge=page.locator('[data-alert-square="e2"][data-alert-type]').first(),type=await badge.getAttribute('data-alert-type');
 await badge.tap();expect(await page.evaluate(()=>focusAlert.type)).toBe(type);
 await page.locator('#closeSheet').tap();await page.locator('#moveMode').tap();
 await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 expect(await page.evaluate(()=>game.history().length)).toBe(1);expect(await page.evaluate(()=>prefs.enabled.length)).toBe(81);
});
test('Menú lateral: búsqueda, ajustes múltiples, cerrar fuera y navegación',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:375,height:812});await page.goto('/');
 await page.locator('#menuButton').tap();await expect(page.locator('#assistOverlay')).toHaveClass(/drawer-mode/);
 await expect(page.locator('#menuButton')).toHaveAttribute('aria-expanded','true');
 await page.locator('#menuSearch').fill('practicas');await expect(page.locator('[data-nav]:visible')).toHaveCount(1);
 await page.locator('#menuSearch').fill('xyz');await expect(page.locator('#menuEmpty')).toBeVisible();
 await page.locator('#menuSearch').fill('');await page.locator('#menuInteraction').selectOption('inspect');
 await page.locator('#menuFocus').selectOption('w');await page.locator('#menuLines').uncheck();
 expect(await page.evaluate(()=>boardInspect&&prefs.lines===false&&prefs.enabled.length===81)).toBe(true);
 expect(await page.locator('#focusMode').inputValue()).toBe('w');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/ajedrex-menu-iphone.png',fullPage:true});
 await page.touchscreen.tap(372,80);await expect(page.locator('#assistOverlay')).toHaveClass(/hidden/);
 await page.locator('#menuButton').tap();await page.locator('[data-nav="helps"]').tap();
 await expect(page.locator('[data-theme]')).toHaveCount(81);await page.locator('#closeSheet').tap();
 await page.locator('#menuButton').tap();await page.keyboard.press('Escape');
 await expect(page.locator('#menuButton')).toBeFocused();await expect(page.locator('#menuButton')).toHaveAttribute('aria-expanded','false');expect(errors).toEqual([]);
});
test('Menú y consulta pausan la IA; volver a Jugar reanuda',async({page})=>{
 await page.goto('/');await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 await page.locator('#menuButton').tap();const n=await page.evaluate(()=>game.history().length);
 await page.waitForTimeout(1200);expect(await page.evaluate(()=>game.history().length)).toBe(n);
 await page.locator('#menuInteraction').selectOption('inspect');await page.locator('[data-nav="resume"]').tap();
 await page.waitForTimeout(1200);expect(await page.evaluate(()=>game.history().length)).toBe(n);
 await page.locator('#moveMode').tap();await expect.poll(()=>page.evaluate(()=>game.history().length)).toBe(2);
});
