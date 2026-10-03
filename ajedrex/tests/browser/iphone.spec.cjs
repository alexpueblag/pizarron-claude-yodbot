
const {test,expect}=require('@playwright/test');
test('Tablero móvil: colores, toque, rival pausado y deshacer',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');
 await expect(page.locator('#board [data-square]')).toHaveCount(64);
 await expect(page.locator('#board svg[data-color="w"]')).toHaveCount(16);
 await expect(page.locator('#board svg[data-color="b"]')).toHaveCount(16);
 await expect(page.locator('#board svg text')).toHaveCount(0);
 await page.locator('[data-square="e2"]').tap();const before=Date.now();await page.locator('[data-square="e4"]').tap();
 await expect(page.locator('[data-square="e4"] svg[data-color="w"]')).toHaveCount(1);
 await expect.poll(()=>page.evaluate(()=>game.history().length)).toBe(2);
 expect(Date.now()-before).toBeGreaterThanOrEqual(850);
 await page.locator('#undo').tap();await expect.poll(()=>page.evaluate(()=>game.history().length)).toBe(0);
 expect(errors).toEqual([]);
 await page.screenshot({path:'test-results/ajedrex-iphone.png',fullPage:true});
});
test('Arrastrar pieza con puntero',async({page})=>{
 await page.goto('/');const source=await page.locator('[data-square="d2"]').boundingBox(),target=await page.locator('[data-square="d4"]').boundingBox();
 await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();
 await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:8});await page.mouse.up();
 await expect(page.locator('[data-square="d4"] svg[data-color="w"]')).toHaveCount(1);
});
test('Catálogo y ayudas',async({page})=>{
 await page.goto('/');await page.locator('#catalogButton').tap();await expect(page.locator('#catalogList details')).toHaveCount(81);
 await page.locator('#catalogSearch').fill('rayos x');await expect(page.locator('#catalogList details')).toHaveCount(1);
 await page.locator('#catalogList summary').tap();await page.locator('[data-theme="xRayAttack"]').check();
 expect(await page.evaluate(()=>prefs.enabled.includes('xRayAttack'))).toBe(true);
 await page.locator('#closeSheet').tap();await page.locator('#helpButton').tap();await page.locator('[data-preset="all"]').tap();
 await expect(page.locator('[data-theme]:checked')).toHaveCount(18);
});
test('Promoción, copia de seguridad y persistencia',async({page})=>{
 await page.goto('/');await page.locator('#learnButton').tap();await page.locator('[data-lesson="4"]').tap();
 await page.locator('[data-square="a7"]').tap();await page.locator('[data-square="a8"]').tap();
 await expect(page.locator('[data-promote]')).toHaveCount(4);await page.locator('[data-promote="n"]').tap();
 expect(await page.evaluate(()=>game.get('a8').type)).toBe('n');
 const fen=await page.evaluate(()=>game.fen());await page.reload();expect(await page.evaluate(()=>game.fen())).toBe(fen);
 await page.locator('#settingsButton').tap();const download=page.waitForEvent('download');await page.locator('#exportBackup').tap();expect((await download).suggestedFilename()).toBe('ajedrex-partida.json');
});

test('Publicación real en GitHub Pages',async({page})=>{
 await page.goto('https://alexpueblag.github.io/pizarron-claude-yodbot/ajedrex/');
 await expect(page.locator('#board [data-square]')).toHaveCount(64);
 await expect(page.locator('#board svg[data-color="w"]')).toHaveCount(16);
 await expect(page.locator('#board svg[data-color="b"]')).toHaveCount(16);
 await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
 await expect.poll(()=>page.evaluate(()=>game.history().length),{timeout:10000}).toBe(2);
});

test('WebKit recupera el tablero cuando el servidor deja de existir',async({page})=>{
 const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
 const root=path.resolve(__dirname,'../..');
 const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
 const server=http.createServer((req,res)=>{
  let pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/')pathname='/index.html';
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await expect(page.locator('#offlineNote')).toContainText('Lista para jugar sin conexión');
  expect(await page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
  const response=await page.reload();expect(response.fromServiceWorker()).toBe(true);
  await expect(page.locator('#board [data-square]')).toHaveCount(64);
  await page.locator('[data-square="e2"]').tap();await page.locator('[data-square="e4"]').tap();
  await expect.poll(()=>page.evaluate(()=>game.history().length)).toBe(2);
 }finally{if(server.listening)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});}
});
