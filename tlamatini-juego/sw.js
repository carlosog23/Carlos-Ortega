/* Tlamatini · El camino del saber: usa la red cuando hay y guarda copia para jugar sin internet */
const VERSION = "juego-2026-11-23a";
const BASE = ["./", "manifest.webmanifest", "trivia.js", "firma-autor.svg", "img/icono-192.png", "img/icono-512.png",
  "../aula/recursos/web/retos/banco.js", "../aula/recursos/web/retos/lecturas.js",
  "../tlamatini-aula/estudio-banco.js", "../tlamatini-aula/estudio-banco2.js", "../tlamatini-aula/estudio-banco3.js", "../tlamatini-aula/estudio-banco4.js", "../tlamatini-aula/estudio-banco5.js"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(VERSION).then(c => Promise.all(BASE.map(u => c.add(u).catch(() => {}))))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { if (r.ok) { const k = r.clone(); caches.open(VERSION).then(c => c.put(e.request, k)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
