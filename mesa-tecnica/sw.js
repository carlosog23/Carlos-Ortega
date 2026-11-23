/* Mesa Técnica · Zona 050: usa la red cuando hay y guarda copia para abrir sin internet */
const VERSION = "mesa-2026-11-23a";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(VERSION).then(c => c.addAll(["./", "manifest.webmanifest", "img/icono-192.png", "img/icono-512.png", "img/zona050-blanco-320.png", "firma-autor.svg", "fondos/fondo-app.jpg"]))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url), mio = u.origin === location.origin && u.pathname.includes("/mesa-tecnica/");
  if (!mio && !/\/(tequio|formatos-ppie|tlamatini-aula)\/img\//.test(u.pathname)) return;
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { if (r.ok) { const k = r.clone(); caches.open(VERSION).then(c => c.put(e.request, k)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
