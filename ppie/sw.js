/* Protocolos PPIE · funciona sin internet: la página, los pasos y los formatos oficiales en PDF quedan guardados. */
const VERSION = "ppie-2026-11-25g", BASE = "ppie-base-" + VERSION;
const NUCLEO = ["./", "../formatos-ppie/dictado.js?v=2026-11-25a", "index.html", "app.js", "estilo.css", "diseno.css", "manifest.webmanifest", "img/icono.svg", "img/icono-192.png", "../formatos-ppie/firma-autor.svg",
  "../tlamatini-aula/ppie-datos.js", "../tlamatini-aula/ppie.js",
  ...["B", "C", "D", "E", "F", "G", "H", "I", "S"].map(l => "../formatos-ppie/formatos/" + l + ".pdf")];
self.addEventListener("install", e => { e.waitUntil(caches.open(BASE).then(c => Promise.all(NUCLEO.map(u => c.add(u).catch(() => {}))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith("ppie-base-") && n !== BASE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => { const r = e.request; if (r.method !== "GET") return; const u = new URL(r.url);
  if (u.origin !== location.origin || /acceso\.json$/.test(u.pathname)) return;
  e.respondWith(fetch(r, { cache: "no-cache" }).then(res => { if (res.ok) { const c = res.clone(); caches.open(BASE).then(x => x.put(r, c)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || (r.mode === "navigate" ? caches.match("index.html") : Response.error())))); });
