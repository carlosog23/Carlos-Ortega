/* Evaluación Cualitativa Preescolar · trabajador de servicio: permite instalar la app y abrirla sin internet.
   La página se pide primero a internet (para tener siempre la versión nueva); sin conexión se usa la copia guardada.
   La redacción con IA sí necesita internet. Al publicar cambios grandes, subir VERSION. */
const VERSION = "evp-2026-11-19a";
const NUCLEO = ["./", "index.html", "manifest.webmanifest", "img/icono-180.png", "img/icono-192.png", "img/icono-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(NUCLEO)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.hostname.includes("script.google")) return;              // el servicio de redacción siempre va a internet
  const local = u.origin === location.origin;
  if (local && (r.mode === "navigate" || /\.(html|webmanifest)$/.test(u.pathname) || u.pathname.endsWith("/"))) {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSION).then(k => k.put(r, c)); return res; }).catch(() => caches.match(r).then(x => x || caches.match("index.html"))));
    return;
  }
  // fuentes, librerías e iconos: se guardan la primera vez
  e.respondWith(caches.match(r).then(x => x || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(VERSION).then(k => k.put(r, c)); } return res; })));
});
