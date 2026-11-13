/* Red de apoyo · Zona 050: guarda la página para consultarla sin internet.
   Siempre intenta primero la versión en línea; si no hay señal, usa la guardada. */
const CACHE = 'red-apoyo-v1';
const BASE = ['./', 'index.html', 'img/isep.png', 'img/zona050.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {
    if (r && r.ok && new URL(e.request.url).origin === location.origin) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
