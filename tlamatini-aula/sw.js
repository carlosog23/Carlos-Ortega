/* Tlamatini Aula · trabajador de servicio: instalar la app y usarla sin internet. Al publicar cambios, subir VERSION. */
const VERSION = "aula-2026-11-22b";
const BASE = "aula-base-" + VERSION, EXTRA = "aula-extra";
const NUCLEO = ["./", "index.html", "aula.js", "examenes.js", "dinamicas.js", "dinamicas-sec.js", "qrcode.min.js", "manifest.webmanifest", "img/aula-icono.svg", "img/aula-icono-180.png", "img/aula-icono-192.png", "img/aula-icono-512.png",
  "../formatos-ppie/formatos/pda.json", "../formatos-ppie/formatos/pda-sec.json", "../formatos-ppie/formatos/calendario.json", "../formatos-ppie/img/isep.png", "../formatos-ppie/firma-autor.svg", "../formatos-ppie/vinculo.js?v=2026-11-21a"];
self.addEventListener("install", e => { e.waitUntil(caches.open(BASE).then(c => Promise.all(NUCLEO.map(u => c.add(u).catch(() => {}))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith("aula-base-") && n !== BASE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return; const u = new URL(r.url);
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$|cdnjs\.cloudflare\.com$/.test(u.hostname)) return;
  if (/acceso\.json$/.test(u.pathname)) return;
  const pagina = r.mode === "navigate" || (/\.(html|js|json|webmanifest)$/.test(u.pathname) && u.origin === location.origin && !u.pathname.includes("/lib/"));
  if (pagina) { e.respondWith(new Promise(listo => { let ya = false; const dar = x => { if (!ya && x) { ya = true; listo(x); } };
    const copia = () => caches.match(r, { ignoreSearch: true }).then(x => x || (r.mode === "navigate" ? caches.match("index.html") : undefined));
    const t = setTimeout(() => copia().then(dar), 3000);
    fetch(r, { cache: "no-cache" }).then(res => { if (res.ok) { const c = res.clone(); caches.open(BASE).then(x => x.put(r, c)); } clearTimeout(t); dar(res); })
      .catch(() => { clearTimeout(t); copia().then(x => dar(x || Response.error())); }); })); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(x => x || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(EXTRA).then(y => y.put(r, c)); } return res; })));
});
