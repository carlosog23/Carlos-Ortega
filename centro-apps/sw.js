/* Centro de Apps: usa la red cuando hay y guarda copia para abrir sin internet */
const VERSION = "centro-2026-11-22f";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(VERSION).then(c => c.addAll(["./", "manifest.webmanifest", "icon-192.png", "icon-512.png", "firma-autor.svg", "firma-autor-blanca.svg", "qrcode.min.js"]))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const mismo = new URL(e.request.url).origin === location.origin;
  /* «no-cache»: siempre pregunta a GitHub si hay versión nueva (sin esto el navegador reusaba la página guardada hasta 10 min) */
  e.respondWith(fetch(e.request, mismo ? { cache: "no-cache" } : undefined).then(r => { if (r.ok && mismo) { const k = r.clone(); caches.open(VERSION).then(c => c.put(e.request, k)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
