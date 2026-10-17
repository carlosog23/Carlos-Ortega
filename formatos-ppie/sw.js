/* Tlamatini · trabajador de servicio: permite instalar la app y usarla sin internet.
   - La página y los datos (.json) se piden primero a internet; si no hay conexión, se usa la copia guardada.
   - Plantillas, librerías e imágenes se guardan la primera vez y después se sirven desde el equipo.
   Al publicar cambios grandes, subir el número de VERSION. */
const VERSION = "tlm-2026-10-16a";
const BASE = "tlm-base-" + VERSION;
const EXTRA = "tlm-extra";            // lo que se guarda al usarse (no se borra entre versiones)

const NUCLEO = [
  "./", "index.html", "tour.html", "manifest.webmanifest",
  "img/tlamatini-icono.svg", "img/tlamatini-icono-180.png", "img/tlamatini-icono-192.png", "img/tlamatini-icono-512.png",
  "img/isep.png", "img/se.png", "img/zona050.png",
  "formatos/calendario.json", "formatos/seguro.json", "formatos/acceso.json", "formatos/normatividad.json", "formatos/pda.json", "formatos/inventarios.json",
  "formatos/A.pdf", "formatos/B.pdf", "formatos/C.pdf", "formatos/D.pdf", "formatos/E.pdf", "formatos/F.pdf", "formatos/G.pdf", "formatos/H.pdf", "formatos/I.pdf",
  "formatos/L.pdf", "formatos/P.pdf", "formatos/S.pdf", "formatos/inventarios.pdf", "formatos/logo_se_lista.jpg",
  "lib/pdf-lib.min.js", "lib/pdf.min.js", "lib/pdf.worker.min.js"
];
/* Paquete completo opcional: se descarga cuando la persona lo pide desde la app. */
const COMPLETO = [
  "formatos/consejo.pdf", "formatos/minuta-consejo.pdf", "formatos/requisitos-consejo.pdf",
  "formatos/fonts/carlito.ttf", "formatos/fonts/carlito-bold.ttf", "formatos/estadistica_edades.b64.txt",
  "formatos/logo_latino.jpg", "formatos/logo_slimplan.jpg",
  "lib/exceljs.min.js", "lib/fontkit.min.js"
];

async function guardarTodos(cacheName, urls) {
  const c = await caches.open(cacheName);
  const r = await Promise.allSettled(urls.map(async u => {
    const req = new Request(u, u.startsWith("http") ? { mode: "no-cors" } : {});
    const res = await fetch(req);
    if (res.ok || res.type === "opaque") await c.put(req, res);
    else throw new Error(u);
  }));
  return r.filter(x => x.status === "rejected").length;
}

self.addEventListener("install", e => {
  e.waitUntil(guardarTodos(BASE, NUCLEO).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("tlm-base-") && k !== BASE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => {
  if (e.data === "completo") {
    e.waitUntil(guardarTodos(EXTRA, COMPLETO).then(fallas => {
      e.source && e.source.postMessage({ tipo: "completo", fallas });
    }));
  }
});

const esDato = url => /\.json(\?|$)/.test(url.pathname);
const esNuestro = url => url.origin === self.location.origin;
const esExternoPermitido = url => /(^|\.)cdnjs\.cloudflare\.com$|(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);

async function primeroRed(req) {
  try {
    const res = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(() => no(new Error("lento")), 6000))]);
    if (res.ok) { const c = await caches.open(EXTRA); c.put(req, res.clone()); }
    return res;
  } catch (err) {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === "navigate") { const idx = await caches.match("index.html"); if (idx) return idx; }
    throw err;
  }
}

async function primeroGuardado(req) {
  const hit = await caches.match(req, { ignoreSearch: false });
  if (hit) {
    /* actualizar en segundo plano lo propio, para que la próxima vez esté al día */
    fetch(req).then(async res => { if (res.ok) (await caches.open(EXTRA)).put(req, res); }).catch(() => {});
    return hit;
  }
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") { const c = await caches.open(EXTRA); c.put(req, res.clone()); }
  return res;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!esNuestro(url) && !esExternoPermitido(url)) return;      // GitHub API y demás: siempre por internet
  if (esNuestro(url) && (req.mode === "navigate" || esDato(url))) { e.respondWith(primeroRed(req)); return; }
  e.respondWith(primeroGuardado(req));
});
