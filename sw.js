const CACHE='alfurat-pages-v1';
const ASSETS=['/','/static/styles.css','/static/app.js','/static/catalog.css','/static/catalog.js','/static/assets/favicon.svg','/static/assets/icons.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const req=e.request;const url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||!(url.pathname==='/'||url.pathname.startsWith('/static/')))return;e.respondWith(fetch(req).then(r=>{if(r.ok&&new URL(req.url).origin===self.location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return r;}).catch(()=>caches.match(req)));});
