const {test,expect}=require('@playwright/test');

async function localPosition(page,fen){
 await page.evaluate(fen=>{
  const data=backupData();data.prefs.mode='local';data.prefs.flipped=false;
  data.prefs.enabled=CATALOG.map(t=>t.id);data.prefs.alertsVersion=4;
  if(fen){data.startFen=fen;data.moves=[];}
  importBackup(data);
 },fen);
}
async function completedAnalysis(page){
 await expect.poll(()=>page.evaluate(()=>advancedState.key),{timeout:15000}).toContain(await page.evaluate(()=>game.fen()));
 await expect.poll(()=>page.evaluate(()=>advancedState.status),{timeout:15000}).toMatch(/^(done|limited)$/);
}

test('Todas las ayudas tienen icono y control; búsqueda y presets funcionan',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');
 expect(await page.evaluate(()=>prefs.enabled.length)).toBe(81);
 expect(await page.evaluate(()=>new Set(prefs.enabled).size)).toBe(81);
 await page.locator('#helpButton').tap();
 await expect(page.locator('[data-theme]')).toHaveCount(81);
 await expect(page.locator('[data-theme]:checked')).toHaveCount(81);
 const icons=await page.locator('#sheetBody [data-theme-icon]').evaluateAll(nodes=>nodes.map(n=>n.dataset.themeIcon));
 expect(new Set(icons).size).toBe(81);
 expect(await page.evaluate(()=>new Set(CATALOG.map(t=>THEME_META[t.id].icon)).size)).toBe(81);
 await page.locator('#helpSearch').fill('rayos x');
 await expect(page.locator('[data-theme]:visible')).toHaveCount(1);
 await expect(page.locator('[data-theme="xRayAttack"]')).toBeChecked();
 await page.locator('#helpSearch').fill('');
 await page.locator('[data-preset="none"]').tap();
 await expect(page.locator('[data-theme]:checked')).toHaveCount(0);
 await page.locator('#closeSheet').tap();
 await expect(page.locator('#board [data-alert-type]')).toHaveCount(0);
 await expect(page.locator('#activeThemes [data-active-theme]')).toHaveCount(0);
 await page.locator('#helpButton').tap();await page.locator('[data-preset="all"]').tap();
 await expect(page.locator('[data-theme]:checked')).toHaveCount(81);
 await page.locator('#closeSheet').tap();await page.locator('#catalogButton').tap();
 await expect(page.locator('#catalogList details')).toHaveCount(81);
 await expect(page.locator('#catalogList [data-theme]')).toHaveCount(81);
 await expect(page.locator('#catalogList [data-theme-icon]')).toHaveCount(81);
 expect(errors).toEqual([]);
});

test('Migración activa todas una vez; cambios e importación conservan las preferencias',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{
  const old=backupData();old.prefs.enabled=['attacked','check','pin'];delete old.prefs.alertsVersion;
  localStorage.setItem('ajedrez-pistas-v1',JSON.stringify(old));
 });
 await page.reload();
 expect(await page.evaluate(()=>prefs.alertsVersion)).toBe(4);
 expect(await page.evaluate(()=>prefs.enabled.length)).toBe(81);
 await page.locator('#helpButton').tap();await page.locator('[data-theme="fork"]').uncheck();
 await page.locator('#closeSheet').tap();await page.reload();
 expect(await page.evaluate(()=>prefs.enabled.includes('fork'))).toBe(false);
 expect(await page.evaluate(()=>prefs.enabled.length)).toBe(80);
 await page.evaluate(()=>{const data=backupData();importBackup(data);});
 expect(await page.evaluate(()=>prefs.enabled.includes('fork'))).toBe(false);
 await page.locator('#helpButton').tap();await page.locator('[data-preset="none"]').tap();
 await page.locator('#closeSheet').tap();await page.reload();
 expect(await page.evaluate(()=>prefs.enabled.length)).toBe(0);
 await page.evaluate(()=>importBackup(backupData()));
 expect(await page.evaluate(()=>prefs.enabled.length)).toBe(0);
});

test('Iconos de casilla abren su alerta exacta; el contador muestra las restantes',async({page})=>{
 await page.goto('/');await localPosition(page,'4k3/4n3/8/8/8/8/8/K3R3 b - - 0 1');
 await completedAnalysis(page);
 const fen=await page.evaluate(()=>game.fen()),history=await page.evaluate(()=>game.history());
 const badge=page.locator('#board .badge[data-alert-type][data-alert-square]').first();
 await expect(badge).toBeVisible();
 expect(await badge.evaluate(el=>el.tagName)).toBe('BUTTON');
 expect(await badge.evaluate(el=>Boolean(el.parentElement.closest('button')))).toBe(false);
 const type=await badge.getAttribute('data-alert-type');
 const name=await page.evaluate(id=>topicById[id].name,type);
 await badge.tap();await expect(page.locator('#hintTitle')).toHaveText(name);
 expect(await page.evaluate(()=>focusAlert.type)).toBe(type);
 expect(await page.evaluate(()=>game.fen())).toBe(fen);
 await page.locator('#closeSheet').tap();
 const more=page.locator('#board [data-alert-more]').first();
 await expect(more).toBeVisible();
 const square=await more.getAttribute('data-alert-more');
 const expectedNames=await page.evaluate(s=>[...new Set(visibleAlerts().filter(a=>a.squares[0]===s).map(a=>topicById[a.type].name))],square);
 await more.tap();await expect(page.locator('#veil')).toHaveClass(/open/);
 for(const title of expectedNames)await expect(page.locator('#sheetBody')).toContainText(title);
 await page.locator('#closeSheet').tap();
 await expect(page.locator('#activeThemes [data-active-theme="pin"]')).toBeVisible();
 await page.locator('#activeThemes [data-active-theme="pin"]').tap();
 await expect(page.locator('#veil')).toHaveClass(/open/);
 await expect(page.locator('#sheetBody')).toContainText('Clavada');
 expect(await page.evaluate(()=>game.fen())).toBe(fen);
 expect(await page.evaluate(()=>game.history())).toEqual(history);
});

test('Apagar una táctica elimina sus iconos y su chip sin afectar otras ayudas',async({page})=>{
 await page.goto('/');await localPosition(page,'4k3/4n3/8/8/8/8/8/K3R3 b - - 0 1');
 await completedAnalysis(page);
 await expect(page.locator('#activeThemes [data-active-theme="pin"]')).toBeVisible();
 const fen=await page.evaluate(()=>game.fen());
 await page.locator('#helpButton').tap();await page.locator('[data-theme="pin"]').uncheck();
 await page.locator('#closeSheet').tap();
 await expect(page.locator('#board [data-alert-type="pin"]')).toHaveCount(0);
 await expect(page.locator('#activeThemes [data-active-theme="pin"]')).toHaveCount(0);
 expect(await page.evaluate(()=>visibleAlerts().some(a=>a.type==='pin'))).toBe(false);
 expect(await page.evaluate(()=>visibleAlerts().some(a=>a.type==='attacked'))).toBe(true);
 expect(await page.evaluate(()=>game.fen())).toBe(fen);
});

test('Con todas las alertas se puede tocar y arrastrar las piezas, girar y deshacer',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await localPosition(page);
 for(const [from,to] of [['e2','e4'],['d7','d5'],['e4','d5']]){
  await page.locator('[data-square="'+from+'"]').tap();await page.locator('[data-square="'+to+'"]').tap();
 }
 expect(await page.evaluate(()=>game.history().length)).toBe(3);
 await expect(page.locator('[data-square="d5"] .piece[data-color="w"]')).toHaveCount(1);
 await page.locator('#undo').tap();
 expect(await page.evaluate(()=>game.history().length)).toBe(2);
 await page.locator('#settingsButton').tap();await page.locator('#flipBoard').tap();
 const source=await page.locator('[data-square="e4"]').boundingBox(),target=await page.locator('[data-square="d5"]').boundingBox();
 await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();
 await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:8});await page.mouse.up();
 await expect(page.locator('[data-square="d5"] .piece[data-color="w"]')).toHaveCount(1);
 expect(await page.evaluate(()=>game.history().length)).toBe(3);
 expect(await page.evaluate(()=>prefs.enabled.length)).toBe(81);
 expect(errors).toEqual([]);
});

test('Alertas caben en iPhone estrecho y los rayos X mantienen transparencia',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto('/');await localPosition(page,'4k3/8/8/3q4/2p5/8/B7/6K1 w - - 0 1');
 await completedAnalysis(page);
 const checkWidth=async()=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await checkWidth();
 await expect(page.locator('#board [data-square]')).toHaveCount(64);
 await expect(page.locator('#lines line[stroke-dasharray]')).not.toHaveCount(0);
 const opacity=await page.locator('#lines line[stroke-dasharray]').first().getAttribute('opacity');
 expect(Number(opacity)).toBeGreaterThan(0);expect(Number(opacity)).toBeLessThan(1);
 await page.locator('#settingsButton').tap();await page.locator('#flipBoard').tap();await checkWidth();
 await page.locator('#helpButton').tap();await checkWidth();
 await page.locator('#helpSearch').fill('subpromocion');
 await expect(page.locator('[data-theme="underPromotion"]')).toBeVisible();
 await page.locator('#closeSheet').tap();
 await page.screenshot({path:'test-results/ajedrex-todas-alertas-iphone.png',fullPage:true});
});

test('Cambiar de posición durante el análisis descarta respuestas anteriores',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');
 const finalFen='7k/8/8/8/8/8/4Q3/4K3 w - - 0 1';
 await page.evaluate(finalFen=>{
  for(const fen of ['4k3/4n3/8/8/8/8/8/K3R3 b - - 0 1','4k3/8/8/3q4/2p5/8/B7/6K1 w - - 0 1',finalFen]){
   const data=backupData();data.prefs.mode='local';data.prefs.enabled=CATALOG.map(t=>t.id);data.prefs.alertsVersion=4;
   data.startFen=fen;data.moves=[];importBackup(data);
  }
 },finalFen);
 await completedAnalysis(page);
 expect(await page.evaluate(()=>game.fen())).toBe(finalFen);
 expect(await page.evaluate(()=>visibleAlerts().some(a=>a.type==='pin'))).toBe(false);
 await expect(page.locator('#tacticalStatus')).not.toContainText('Error');
 expect(errors).toEqual([]);
});

test('El origen de una partida no se inventa a partir de la posición',async({page})=>{
 await page.goto('/');await localPosition(page);await completedAnalysis(page);
 const sourceThemes=['master','masterVsMaster','superGM','playerGames'];
 expect(await page.evaluate(ids=>visibleAlerts().filter(a=>ids.includes(a.type)),sourceThemes)).toEqual([]);
 await page.locator('#catalogButton').tap();await page.locator('#catalogSearch').fill('maestros');
 await expect(page.locator('#catalogList')).toContainText(/metadatos|origen|información|datos/i);
});
