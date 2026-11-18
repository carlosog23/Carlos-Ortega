/* Ulama · trabajador de servicio: instalar la app y usarla sin internet.
   La página se pide primero a internet (para recibir mejoras); sin conexión se usa la copia guardada.
   Las librerías de Tlamatini (lector de PDF y de fotos) se guardan al usarse la primera vez.
   Al publicar cambios grandes, subir el número de VERSION. */
const VERSION = "ulama-2026-11-17m";
const BASE = "ulama-base-" + VERSION, EXTRA = "ulama-extra";
const NUCLEO = ["./", "index.html", "app.js", "cuenta.js", "registro.js", "ef-datos.js", "acceso.json", "manifest.webmanifest", "img/ulama-icono.svg", "img/ulama-icono-180.png", "img/ulama-icono-192.png", "img/ulama-icono-512.png",
  "../formatos-ppie/img/isep.png", "../formatos-ppie/lib/pdf.min.js", "../formatos-ppie/lib/pdf.worker.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(BASE).then(c => Promise.all(NUCLEO.map(u => c.add(u).catch(() => {}))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith("ulama-base-") && n !== BASE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return; const u = new URL(r.url);
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return;
  const pagina = r.mode === "navigate" || /\.(html|js|json|webmanifest)$/.test(u.pathname) && !u.pathname.includes("/lib/");
  if (pagina) { e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(BASE).then(x => x.put(r, c)); } return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match("index.html")))); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(x => x || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(EXTRA).then(y => y.put(r, c)); } return res; })));
});
