/* Ulama · trabajador de servicio: instalar la app y usarla sin internet.
   La página se pide primero a internet (para recibir mejoras); sin conexión se usa la copia guardada.
   Las librerías de Tlamatini (lector de PDF y de fotos) se guardan al usarse la primera vez.
   Al publicar cambios grandes, subir el número de VERSION. */
const VERSION = "ulama-2026-11-25v";
const BASE = "ulama-base-" + VERSION, EXTRA = "ulama-extra";
const NUCLEO = ["./", "../formatos-ppie/dictado.js?v=2026-11-25a", "index.html", "app.js", "cuenta.js", "registro.js", "imprimir-clases.js", "bitacora.js", "anexo-d.js", "visita.js", "ppie-ulama.js", "../tlamatini-aula/ppie-datos.js", "../tlamatini-aula/ppie.js", "qrcode.min.js", "ef-datos.js", "juegos-comunidad.js", "planear-mas.js", "acceso.json", "manifest.webmanifest", "img/ulama-icono.svg", "img/ulama-icono-180.png", "img/ulama-icono-192.png", "img/ulama-icono-512.png",
  "../formatos-ppie/img/isep.png", "../formatos-ppie/lib/pdf.min.js", "../formatos-ppie/lib/pdf.worker.min.js", "../formatos-ppie/lib/pdf-lib.min.js", "../formatos-ppie/formatos/D.pdf"];
self.addEventListener("install", e => { e.waitUntil(caches.open(BASE).then(c => Promise.all(NUCLEO.map(u => c.add(u).catch(() => {}))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith("ulama-base-") && n !== BASE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return; const u = new URL(r.url);
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return;
  const pagina = r.mode === "navigate" || /\.(html|js|json|webmanifest)$/.test(u.pathname) && !u.pathname.includes("/lib/");
  /* La página se pide a internet, pero si tarda más de 3 s (señal débil) se abre la copia guardada y la nueva queda para la próxima vez */
  if (pagina) { e.respondWith(new Promise(listo => { let ya = false; const dar = x => { if (!ya && x) { ya = true; listo(x); } };
    const copia = () => caches.match(r, { ignoreSearch: true }).then(x => x || (r.mode === "navigate" ? caches.match("index.html") : undefined));
    const t = setTimeout(() => copia().then(dar), 3000);
    fetch(r, { cache: "no-cache" }).then(res => { if (res.ok) { const c = res.clone(); caches.open(BASE).then(x => x.put(r, c)); } clearTimeout(t); dar(res); })
      .catch(() => { clearTimeout(t); copia().then(x => dar(x || Response.error())); }); })); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(x => x || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(EXTRA).then(y => y.put(r, c)); } return res; })));
});
