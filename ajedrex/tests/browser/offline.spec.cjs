const {test,expect}=require('@playwright/test');
// Offline emulation in WebKit has an upstream failure: microsoft/playwright#42775.
// This scenario runs in Chromium; WebKit separately tests an unavailable origin.
test('Carga sin conexión después de preparar caché',async({page,context})=>{
 await page.goto('/');await page.evaluate(()=>navigator.serviceWorker.ready);
 await expect(page.locator('#offlineNote')).toContainText('Lista para jugar sin conexión');
 await context.setOffline(true);await page.reload();
 await expect(page.locator('#board [data-square]')).toHaveCount(64);
 await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 await expect.poll(()=>page.evaluate(()=>game.history().length)).toBe(2);
});
