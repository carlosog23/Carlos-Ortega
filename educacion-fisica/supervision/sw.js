/* Ulama · Supervisión · trabajador de servicio: instalar la app y usarla sin internet.
   La página se pide primero a internet; sin conexión (o con señal débil) se usa la copia guardada. Al publicar cambios, subir VERSION. */
const VERSION = "ulama-sup-2026-11-24h";
const BASE = "ulama-sup-base-" + VERSION, EXTRA = "ulama-sup-extra";
const NUCLEO = ["./", "index.html", "sup.js", "permisos.js", "ciclo.js", "registros.js", "adm.js", "jsQR.js", "zona041.json", "manifest.webmanifest", "img/sup-icono.svg", "img/sup-icono-180.png", "img/sup-icono-192.png", "img/sup-icono-512.png", "../firma-autor.svg", "../../formatos-ppie/img/isep.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(BASE).then(c => Promise.all(NUCLEO.map(u => c.add(u).catch(() => {}))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith("ulama-sup-base-") && n !== BASE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return; const u = new URL(r.url);
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$|cdnjs\.cloudflare\.com$/.test(u.hostname)) return;
  if (/acceso\.json$/.test(u.pathname)) return;
  const pagina = r.mode === "navigate" || /\.(html|js|json|webmanifest)$/.test(u.pathname) && u.origin === location.origin && !/jsQR\.js$/.test(u.pathname);
  if (pagina) { e.respondWith(new Promise(listo => { let ya = false; const dar = x => { if (!ya && x) { ya = true; listo(x); } };
    const copia = () => caches.match(r, { ignoreSearch: true }).then(x => x || (r.mode === "navigate" ? caches.match("index.html") : undefined));
    const t = setTimeout(() => copia().then(dar), 3000);
    fetch(r, { cache: "no-cache" }).then(res => { if (res.ok) { const c = res.clone(); caches.open(BASE).then(x => x.put(r, c)); } clearTimeout(t); dar(res); })
      .catch(() => { clearTimeout(t); copia().then(x => dar(x || Response.error())); }); })); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(x => x || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(EXTRA).then(y => y.put(r, c)); } return res; })));
});
