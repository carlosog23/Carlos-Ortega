/* Tequio · trabajador de servicio: permite abrir Tequio sin internet para la revisión en campo.
   La página y sus archivos se piden primero a internet; si no hay conexión, se usa la última copia guardada.
   El servidor de Tequio (Google) nunca pasa por aquí: lo que se captura sin internet lo guarda la página en el dispositivo. */
const CACHE = 'tequio-2026-11-12b';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request.mode === 'navigate' ? './index.html' : e.request, c)); } return r; })
    .catch(() => caches.match(e.request.mode === 'navigate' ? './index.html' : e.request, { ignoreSearch: e.request.mode === 'navigate' }).then(r => r || caches.match('./index.html'))));
});
