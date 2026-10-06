
const CACHE='ajedrex-v0.7.1-'+self.registration.scope;
const FILES=['./','./index.html','./styles.css','./boot.js','./app.js','./assist.js','./navigation.js','./practice-data.js','./practice-model.js','./practice.js','./tactics.js','./catalog.js','./engine-worker.js','./review-worker.js','./insights.js','./theme-ui.js','./context-tactics.js','./advanced-tactics.js','./mate-patterns.js','./mate-search.js','./tactics-worker.js','./vendor/chess.js','./vendor/garbo.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ajedrex-')&&k.endsWith(self.registration.scope)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const cached=await cache.match(event.request);
  if(cached)return cached;
  try{return await fetch(event.request);}
  catch(error){if(event.request.mode==='navigate'){const page=await cache.match('./index.html');if(page)return page;}throw error;}
 }));
});
