/* Tlamatini · «El dinero en México» (Banxico Educa · 6.° de primaria)
   Se carga solo al entrar al apartado.
   - Los libros NO se alojan en Tlamatini: son obra de Banco de México («reservados todos los derechos»).
     El docente abre el PDF oficial de Banxico o carga en su dispositivo la copia que descargó del sitio
     oficial; se guarda solo en ese dispositivo (IndexedDB) para dar la clase sin internet.
   - Visor para dar la clase (proyectar), índice por bloque y sesión, avance del grupo,
     impresión de las hojas de una sesión para los alumnos que no tienen libro (con número de copias
     y opción de 2 páginas por hoja) y recursos oficiales de apoyo por bloque. */

const BX_URL = {
  libro: "https://educa.banxico.org.mx/recursos/pdf/{FB1BB399-9F02-E497-983C-87E136AF9D97}.pdf",
  guia: "https://educa.banxico.org.mx/recursos/pdf/{32B528D0-F4DE-4A0C-64A6-C9D1E069BE7A}.pdf",
  programa: "https://educa.banxico.org.mx/el-dinero-en-mexico.html",
  materiales: "https://educa.banxico.org.mx/recursos/infografias-y-fichas/el-dinero-en-mexico-materia.html",
  multimedia: "https://educa.banxico.org.mx/recursos/infografias-y-fichas/pagina-infografias-fichas00005.html",
  registro: "https://www.banxico.org.mx/dinero_mexico/login",
  solicitud: "https://survey.alchemer.com/s3/7932603/Docentes-interesados-EDEM",
  ninos: "https://educa.banxico.org.mx/ninos.html"
};
const BX_LIB = {
  libro: { n: "Libro de prácticas (alumno)", c: "Libro del alumno", pags: 246 },
  guia: { n: "Guía del docente", c: "Guía del docente", pags: 288 }
};
/* Índice oficial: [bloque, sesión, título, pág. libro, pág. guía] (la página impresa coincide con la del PDF) */
const BX_BLOQUES = ["La historia del dinero", "El dinero de hoy", "Conoce tus billetes", "Usando tu dinero", "Cuidando el valor de tu dinero"];
const BX_SES = [
  [1, 1, "El trueque", 10, 15], [1, 2, "Empecemos por el principio", 38, 31], [1, 3, "Érase una vez el dinero", 41, 37], [1, 4, "Los primeros billetes y monedas", 44, 45],
  [2, 5, "Con dinero y sin dinero", 52, 59], [2, 6, "Entendiendo al dinero", 55, 65], [2, 7, "Billetes y monedas de hoy", 64, 77], [2, 8, "¿Cuál es tu forma de pago?", 67, 85],
  [3, 9, "La Fábrica de Billetes", 76, 97], [3, 10, "Y tú… ¿quién eres?", 97, 111], [3, 11, "Misión posible: toca, gira y mira", 116, 129], [3, 12, "¿Vale o no vale?", 132, 147],
  [4, 13, "El arma secreta de Tomin, el cacomixtle", 151, 165], [4, 14, "¿Qué puedes hacer con tu dinero?", 171, 185], [4, 15, "El carrusel del dinero", 177, 195],
  [5, 16, "El sube y baja de los precios", 184, 207], [5, 17, "El valor del dinero", 192, 215], [5, 18, "Ojo con el aumento de los precios", 196, 223],
  [5, 19, "Banco de México: el árbol del dinero", 206, 231], [5, 20, "El truco del Banco de México", 218, 249]
].map(([b, s, t, l, g]) => ({ b, s, t, libro: l, guia: g }));
const BX_ANEXOS = {
  libro: [{ t: "Introducción y familia Fortuna", d: 6, h: 9 }, { t: "Glosario ilustrado", d: 228, h: 233 }, { t: "Respuestas correctas", d: 234, h: 244 }],
  guia: [{ t: "Introducción y modelo pedagógico", d: 7, h: 14 }, { t: "Evaluaciones finales por bloque", d: 260, h: 269 }, { t: "Respuestas de las evaluaciones", d: 270, h: 280 }, { t: "Glosario ilustrado", d: 281, h: 288 }]
};
const BX_FIN = { libro: 227, guia: 259 };
function bxRango(lib, i) { const s = BX_SES[i]; const fin = i < BX_SES.length - 1 ? BX_SES[i + 1][lib] - 1 : BX_FIN[lib]; return { d: s[lib], h: fin } }

/* Recursos oficiales de apoyo por bloque (todos abren el sitio de Banxico) */
const BX_REC = {
  1: [["Interactivo · Mi Banxico: historia del dinero", "https://www.banxico.org.mx/mibanxico/"], ["Video · Dinero", "https://educa.banxico.org.mx/recursos/videos/pagina-videos.html"], ["Lectura · Los aztecas y el cacao como moneda (BCRA)", "https://www.bcra.gob.ar/Pdfs/BCRAyVos/Cuadernillo_Cacao.pdf"]],
  2: [["Video · Todos formamos parte de la economía", "https://educa.banxico.org.mx/recursos/videos/todos-formamos-parte-econom.html"], ["Interactivo · Mi Banxico: el dinero en tu mundo", "https://www.banxico.org.mx/mibanxico/"], ["Video · El sistema financiero", "https://educa.banxico.org.mx/recursos/videos/video-sistema-financiero.html"]],
  3: [["Video · Fábrica de billetes del Banco de México", "https://educa.banxico.org.mx/recursos/videos/fabrica-billetes-banco-mexi.html"], ["Video · Fabricación de billetes y acuñación de monedas", "https://educa.banxico.org.mx/recursos/videos/fabricacion-billetes-acunac.html"], ["Verificación de la autenticidad de un billete", "https://www.banxico.org.mx/billetes-y-monedas/verificacion-autenticidad-un-.html"], ["Billetes conmemorativos de 100 y 200", "https://www.banxico.org.mx/billetes-y-monedas/200-100-pesos-conmemorativos-.html"], ["Aula virtual de billetes y monedas", "https://www.banxico.org.mx/billetes-y-monedas/material-usuarios-intensivos-.html"], ["Billetes presuntamente falsos", "https://www.banxico.org.mx/servicios/billetes-monedas-presuntament.html"]],
  4: [["Pódcast · El arma secreta de Tomín, el cacomixtle", "https://educa.banxico.org.mx/recursos/publicaciones/el-arma-secreta-tomin-cacom00001.html"], ["Video · Necesidades y deseos", "https://educa.banxico.org.mx/recursos/videos/necesidades-deseos.html"]],
  5: [["Video · Los precios y el valor del dinero", "https://educa.banxico.org.mx/recursos/videos/los-precios-valor-del-diner.html"], ["Video · Formación de precios", "https://educa.banxico.org.mx/recursos/videos/formacion-precios-.html"], ["Video · Cuidando el valor del dinero", "https://educa.banxico.org.mx/recursos/videos/video--cuidando-valor-del-d.html"], ["Video · La historia del Banco de México", "https://educa.banxico.org.mx/recursos/videos/pagina-videos00002.html"], ["Interactivo · Mi Banxico: historia de Banxico", "https://www.banxico.org.mx/mibanxico/"]]
};
const BX_DOC = [
  ["Planeaciones didácticas de ejemplo", "https://educa.banxico.org.mx/recursos/pdf/{018D9658-0CD7-270E-0F33-1D73AA8A1CE6}.pdf"],
  ["Capacitación para docentes de 6.°", "https://educa.banxico.org.mx/recursos/pdf/{CC632930-54A2-CC2F-F0BA-D53652F1C2B0}.pdf"],
  ["Proyecto comunitario · Ahorramos con Tomín para nuestra fiesta de fin de curso", "https://educa.banxico.org.mx/recursos/pdf/{572FA5D8-256D-003F-431C-272DB075DDC5}.pdf"],
  ["Proyecto comunitario · Del huerto escolar al mercado", "https://educa.banxico.org.mx/recursos/pdf/{C26F1E0E-1318-AD9C-E592-D88C789C1A4E}.pdf"],
  ["Proyecto integrador · Un viaje científico a través de los billetes", "https://educa.banxico.org.mx/recursos/pdf/{4D5564D7-C85A-5758-48FA-A1BC73BB3E96}.pdf"]
];

/* ---------- estado ---------- */
const BX = { lib: "libro", ses: 0, pag: null, zoom: 1, tab: "clase", docs: {}, pdf: {}, impr: { ses: 0, lib: "libro", desde: null, hasta: null, copias: 1, dos: false, sel: null } };
const bxAv = () => store.get("bx-avance", {});
const bxAvSet = o => store.set("bx-avance", o);

/* ---------- copias del PDF en este dispositivo (IndexedDB) ---------- */
function bxDB() { return new Promise((ok, no) => { const r = indexedDB.open("tlamatini-banxico", 1); r.onupgradeneeded = () => r.result.createObjectStore("libros"); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error) }) }
async function bxGet(k) { try { const db = await bxDB(); return await new Promise(ok => { const q = db.transaction("libros").objectStore("libros").get(k); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null) }) } catch (e) { return null } }
async function bxPut(k, v) { const db = await bxDB(); return new Promise((ok, no) => { const t = db.transaction("libros", "readwrite"); t.objectStore("libros").put(v, k); t.oncomplete = ok; t.onerror = () => no(t.error) }) }
async function bxDel(k) { try { const db = await bxDB(); await new Promise(ok => { const t = db.transaction("libros", "readwrite"); t.objectStore("libros").delete(k); t.oncomplete = ok; t.onerror = ok }) } catch (e) { } delete BX.pdf[k]; delete BX.docs[k] }
async function bxCargarGuardados() { for (const k of ["libro", "guia"]) if (!BX.docs[k]) { const v = await bxGet(k); if (v) BX.docs[k] = v } }
/* Identifica por número de páginas cuál libro es el archivo que eligió el docente */
async function bxIdentificar(buf) { const L = await pdfjs(); const d = await L.getDocument({ data: buf.slice(0) }).promise; const n = d.numPages; d.destroy();
  if (n === BX_LIB.libro.pags) return { k: "libro", n }; if (n === BX_LIB.guia.pags) return { k: "guia", n }; return { k: null, n } }
async function bxDoc(k) { if (BX.pdf[k]) return BX.pdf[k]; const v = BX.docs[k]; if (!v) return null; const L = await pdfjs(); BX.pdf[k] = await L.getDocument({ data: v.buf.slice(0) }).promise; return BX.pdf[k] }
async function bxIntentarDescarga(k) { /* si el servidor de Banxico lo permite (CORS) se baja directo; si no, se pide el archivo */
  const r = await fetch(BX_URL[k], { mode: "cors" }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.arrayBuffer() }
async function bxGuardarArchivo(buf, nombre, esperado) { const id = await bxIdentificar(buf);
  const k = id.k || esperado; if (!k) throw new Error(`El archivo tiene ${id.n} páginas y no coincide con el Libro de prácticas (246) ni con la Guía del docente (288).`);
  const v = { buf, nombre, fecha: Date.now(), pags: id.n }; await bxPut(k, v); BX.docs[k] = v; delete BX.pdf[k]; return k }

/* ---------- vista principal ---------- */
const BX_CSS = `<style id="bxcss">
.bx-tabs{display:flex;gap:6px;flex-wrap:wrap}.bx-tabs .chip{font-size:15px;padding:8px 14px}
.bx-ses{display:flex;flex-direction:column}.bx-s{display:flex;align-items:center;gap:10px;padding:10px 2px;border-bottom:1px solid var(--line);background:none;border-left:0;border-right:0;border-top:0;font:inherit;color:var(--ink);text-align:left;cursor:pointer;min-height:48px;width:100%}
.bx-s .n{flex:0 0 34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:14px;background:var(--accent-soft);color:var(--accent)}
.bx-s.ok .n{background:var(--ok);color:#fff}.bx-s .tx{flex:1;min-width:0}.bx-s .tx b{display:block;font-weight:600}.bx-s .tx span{font-size:13px;color:var(--muted)}
.bx-s.on{background:var(--accent-soft)}
.bx-vis{background:#525659;border-radius:12px;overflow:auto;max-height:78vh;display:flex;justify-content:center;padding:10px;touch-action:pan-x pan-y pinch-zoom}
.bx-vis canvas{background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.35);max-width:none;height:auto}
.bx-nav{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.bx-nav .btn{min-height:44px}.bx-nav input{width:76px;text-align:center}
.bx-full{position:fixed;inset:0;z-index:9990;background:#2a2c2e;display:flex;flex-direction:column}
.bx-full .bx-vis{flex:1;max-height:none;border-radius:0}.bx-full .bx-fbar{display:flex;gap:8px;align-items:center;justify-content:center;padding:8px;background:#1b1c1d;color:#fff;flex-wrap:wrap}
.bx-full .bx-fbar .btn{background:#333;color:#fff;border-color:#555;min-height:44px}
.bx-thumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:10px}
.bx-th{border:2px solid var(--line);border-radius:8px;padding:4px;background:var(--card);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;font:inherit;font-size:12px;color:var(--ink)}
.bx-th canvas{width:100%!important;height:auto!important;background:#fff}.bx-th.sel{border-color:var(--accent);background:var(--accent-soft)}.bx-th:not(.sel) canvas{opacity:.45}
.bx-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}.bx-row>.field{flex:1 1 140px;min-width:120px;margin:0}
.bx-est{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:var(--bg);font-size:14px}
.bx-est.ok{border-left:4px solid var(--ok)}.bx-est.no{border-left:4px solid var(--warn)}
.bx-bar{height:10px;background:var(--line);border-radius:99px;overflow:hidden}.bx-bar i{display:block;height:100%;background:var(--ok)}
</style>`;

function bxTop(sub) { return `${document.getElementById("bxcss") ? "" : BX_CSS}<div class="top"><button class="back" id="salir" aria-label="Regresar">←</button><div style="min-width:0"><div class="eyebrow">En el aula · Banxico Educa · 6.° de primaria</div><h2>${sub || "El dinero en México"}</h2></div></div>` }

async function bxView() { S.view = "banxico"; S.sec = "banxico"; setBar("");
  await bxCargarGuardados(); if (S.view !== "banxico") return;
  const tabs = [["clase", "Dar la clase"], ["imprimir", "Imprimir hojas"], ["avance", "Avance del grupo"], ["recursos", "Recursos y libros"]];
  let body = "";
  if (BX.tab === "clase") body = bxClaseHTML(); else if (BX.tab === "imprimir") body = bxImprHTML(); else if (BX.tab === "avance") body = bxAvanceHTML(); else body = bxRecursosHTML();
  app.innerHTML = `${bxTop()}
   <p class="muted">Programa gratuito de educación económica y financiera del Banco de México: 5 bloques, 20 sesiones de una hora. Aquí puede proyectar el libro, seguir la sesión con la guía, imprimir las hojas para los alumnos que no tienen libro y llevar el avance del grupo.</p>
   <div class="chips bx-tabs">${tabs.map(([k, t]) => `<button class="chip ${BX.tab === k ? "sel" : ""}" data-bxtab="${k}">${t}</button>`).join("")}</div>
   ${body}
   <p class="foot">«El dinero en México» © Banco de México. Los libros se consultan del sitio oficial o de la copia que usted descargó; Tlamatini no los aloja. Dudas del programa: eldineroenmexico@banxico.org.mx</p>`;
  document.getElementById("salir").onclick = () => { S.sec = null; home() };
  app.querySelectorAll("[data-bxtab]").forEach(b => b.onclick = () => { BX.tab = b.dataset.bxtab; bxView().then(() => window.scrollTo(0, 0)) });
  bxWire();
  if (BX.tab === "clase") bxPintar(); if (BX.tab === "imprimir") bxMiniaturas() }

/* ---------- carga de los libros ---------- */
function bxEstadoHTML() {
  const fila = k => { const v = BX.docs[k]; return `<div class="bx-est ${v ? "ok" : "no"}"><div style="flex:1;min-width:0"><b>${BX_LIB[k].n}</b><br><span class="help">${v ? `Guardado en este dispositivo · ${v.pags} páginas · funciona sin internet` : "Aún no está en este dispositivo"}</span></div>
     ${v ? `<button class="btn ghost" data-bxquitar="${k}" style="min-height:40px">Quitar</button>` : `<button class="btn primary" data-bxbajar="${k}" style="min-height:40px">Cargar</button>`}</div>` };
  return `<section class="card"><h3>Los libros en este dispositivo</h3>
   <p class="help">Para proyectar e imprimir sin internet, cargue una sola vez los PDF oficiales. Si su navegador no puede bajarlos directo, toque <b>Descargar de Banxico</b>, guarde el archivo y después elíjalo con <b>Ya lo descargué</b>.</p>
   ${fila("libro")}${fila("guia")}
   <div class="acts" style="flex-direction:row;flex-wrap:wrap;gap:8px">
    <a class="btn ghost" href="${BX_URL.libro}" target="_blank" rel="noopener" style="text-decoration:none">Descargar de Banxico: Libro</a>
    <a class="btn ghost" href="${BX_URL.guia}" target="_blank" rel="noopener" style="text-decoration:none">Descargar de Banxico: Guía</a>
    <label class="btn primary" style="cursor:pointer">Ya lo descargué: elegir PDF<input type="file" id="bxFile" accept="application/pdf,.pdf" multiple hidden></label></div>
   <div id="bxMsg" class="help" role="status"></div></section>` }

/* ---------- dar la clase ---------- */
function bxSesListHTML(lib) { const av = bxAv(); let h = "", b0 = 0;
  BX_SES.forEach((s, i) => { if (s.b !== b0) { b0 = s.b; h += `<div class="group-title" style="margin-top:8px">Bloque ${s.b} · ${BX_BLOQUES[s.b - 1]}</div>` }
    const r = bxRango(lib, i);
    h += `<button class="bx-s ${av[s.s] ? "ok" : ""} ${BX.ses === i && BX.pag === null ? "on" : ""}" data-bxses="${i}"><span class="n">${av[s.s] ? "✓" : s.s}</span><span class="tx"><b>Sesión ${s.s}: ${esc(s.t)}</b><span>${BX_LIB[lib].c}: págs. ${r.d}–${r.h}</span></span></button>` });
  h += `<div class="group-title" style="margin-top:8px">Anexos</div>` + BX_ANEXOS[lib].map(a => `<button class="bx-s" data-bxpag="${a.d}"><span class="n">·</span><span class="tx"><b>${esc(a.t)}</b><span>págs. ${a.d}–${a.h}</span></span></button>`).join("");
  return `<div class="bx-ses">${h}</div>` }
function bxPagActual() { return BX.pag ?? BX_SES[BX.ses][BX.lib] }
function bxClaseHTML() {
  const tiene = !!BX.docs[BX.lib], s = BX_SES[BX.ses], p = bxPagActual(), r = bxRango(BX.lib, BX.ses);
  const visor = tiene ? `<section class="card"><div class="bx-nav">
      <button class="btn ghost" id="bxPrev" aria-label="Página anterior">‹ Anterior</button>
      <label class="sr" for="bxPg">Página</label><input type="number" id="bxPg" min="1" max="${BX.docs[BX.lib].pags}" value="${p}" inputmode="numeric">
      <span class="help">de ${BX.docs[BX.lib].pags}</span>
      <button class="btn ghost" id="bxNext" aria-label="Página siguiente">Siguiente ›</button>
      <button class="btn ghost" id="bxZm" aria-label="Alejar">−</button><button class="btn ghost" id="bxZp" aria-label="Acercar">+</button>
      <button class="btn primary" id="bxFull">Proyectar en pantalla completa</button></div>
     <div class="bx-vis" id="bxVis"><canvas id="bxCv"></canvas></div>
     <div class="acts" style="flex-direction:row;flex-wrap:wrap;gap:8px">
      <button class="btn ghost" id="bxOtro">${BX.lib === "libro" ? "Ver esta sesión en la Guía del docente" : "Ver esta sesión en el Libro del alumno"}</button>
      <button class="btn ghost" id="bxImpSes">Imprimir las hojas de esta sesión</button>
      <button class="btn ghost" id="bxHecha">${bxAv()[s.s] ? "Quitar «sesión impartida»" : "Marcar la sesión como impartida"}</button></div></section>`
    : `<section class="card"><h3>${BX_LIB[BX.lib].n}</h3><p class="help">Aún no está en este dispositivo. Puede abrirlo en el sitio de Banxico directo en la página de la sesión, o cargarlo (arriba) para proyectarlo e imprimir hojas.</p>
      <div class="acts"><a class="btn primary act" style="text-decoration:none" href="${BX_URL[BX.lib]}#page=${p}" target="_blank" rel="noopener">Abrir en Banxico · página ${p}</a></div></section>`;
  return `${bxEstadoHTML()}
   <div class="chips bx-tabs"><button class="chip ${BX.lib === "libro" ? "sel" : ""}" data-bxlib="libro">Libro del alumno</button><button class="chip ${BX.lib === "guia" ? "sel" : ""}" data-bxlib="guia">Guía del docente</button></div>
   <section class="card"><h3 style="margin:0">Bloque ${s.b} · Sesión ${s.s}: ${esc(s.t)}</h3>
    <p class="help">Libro del alumno págs. ${bxRango("libro", BX.ses).d}–${bxRango("libro", BX.ses).h} · Guía del docente págs. ${bxRango("guia", BX.ses).d}–${bxRango("guia", BX.ses).h}.</p>
    ${BX_REC[s.b] ? `<details><summary class="help"><b>Recursos de apoyo del bloque ${s.b}</b> (${BX_REC[s.b].length})</summary><div class="libs">${BX_REC[s.b].map(([t, u]) => `<a class="lib" href="${u}" target="_blank" rel="noopener"><span>${esc(t)}</span><span class="chev" aria-hidden="true">›</span></a>`).join("")}</div></details>` : ""}</section>
   ${visor}
   <details class="card" ${BX.docs[BX.lib] ? "" : "open"}><summary><b>Índice de sesiones</b> · ${BX_LIB[BX.lib].c}</summary>${bxSesListHTML(BX.lib)}</details>` }

let BX_RT = null;
async function bxPintar(cv, pag, ancho) {
  cv = cv || document.getElementById("bxCv"); if (!cv) return; const d = await bxDoc(BX.lib); if (!d) return;
  pag = Math.min(Math.max(1, pag || bxPagActual()), d.numPages);
  const page = await d.getPage(pag); const box = cv.parentNode; const w0 = page.getViewport({ scale: 1 });
  const disp = ancho || Math.max(260, box.clientWidth - 24); const full = !!cv.closest(".bx-full");
  let esc0 = disp / w0.width * BX.zoom; if (full && !ancho) esc0 = Math.min(esc0, (box.clientHeight - 20) / w0.height * BX.zoom);
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5); const vp = page.getViewport({ scale: esc0 * dpr });
  if (BX_RT) { try { BX_RT.cancel() } catch (e) { } }
  cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height); cv.style.width = Math.floor(vp.width / dpr) + "px";
  BX_RT = page.render({ canvasContext: cv.getContext("2d"), viewport: vp }); try { await BX_RT.promise } catch (e) { }
  const inp = document.getElementById("bxPg"); if (inp) inp.value = pag; const fp = document.getElementById("bxFpg"); if (fp) fp.textContent = `Página ${pag} de ${d.numPages}`;
  /* al cambiar de página, actualiza la sesión según el índice */
  const ix = BX_SES.map((s, i) => [i, bxRango(BX.lib, i)]).find(([, r]) => pag >= r.d && pag <= r.h); if (ix && ix[0] !== BX.ses) { BX.ses = ix[0] } }
function bxIr(p) { const d = BX.docs[BX.lib]; if (!d) return; BX.pag = Math.min(Math.max(1, p), d.pags); bxPintar() }
function bxPantalla() {
  const w = document.createElement("div"); w.className = "bx-full"; w.innerHTML = `<div class="bx-vis" id="bxFv"><canvas></canvas></div>
   <div class="bx-fbar"><button class="btn" id="bxFp">‹ Anterior</button><span id="bxFpg" style="min-width:130px;text-align:center"></span><button class="btn" id="bxFn">Siguiente ›</button>
   <button class="btn" id="bxFzm">−</button><button class="btn" id="bxFzp">+</button><button class="btn" id="bxFx">Salir (Esc)</button></div>`;
  document.body.appendChild(w); const cv = w.querySelector("canvas"); const pin = () => bxPintar(cv, bxPagActual());
  const mv = n => { BX.pag = bxPagActual() + n; pin() };
  w.querySelector("#bxFp").onclick = () => mv(-1); w.querySelector("#bxFn").onclick = () => mv(1);
  w.querySelector("#bxFzm").onclick = () => { BX.zoom = Math.max(.5, BX.zoom - .15); pin() }; w.querySelector("#bxFzp").onclick = () => { BX.zoom = Math.min(3, BX.zoom + .15); pin() };
  const salir = () => { removeEventListener("keydown", tecla); w.remove(); if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); bxView() };
  const tecla = e => { if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); mv(1) } else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); mv(-1) } else if (e.key === "Escape") salir() };
  addEventListener("keydown", tecla); w.querySelector("#bxFx").onclick = salir;
  let x0 = null; w.querySelector("#bxFv").addEventListener("touchstart", e => { x0 = e.touches.length === 1 ? e.touches[0].clientX : null }, { passive: true });
  w.querySelector("#bxFv").addEventListener("touchend", e => { if (x0 === null || BX.zoom > 1.05) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 60) mv(dx < 0 ? 1 : -1) }, { passive: true });
  if (w.requestFullscreen) w.requestFullscreen().catch(() => { }); document.addEventListener("fullscreenchange", function f() { if (!document.fullscreenElement && document.body.contains(w)) { document.removeEventListener("fullscreenchange", f); salir() } });
  setTimeout(pin, 120) }

/* ---------- imprimir hojas para alumnos sin libro ---------- */
function bxImprRango() { const I = BX.impr; const r = bxRango(I.lib, I.ses); return { d: I.desde ?? r.d, h: I.hasta ?? r.h } }
function bxImprHTML() {
  const I = BX.impr, tiene = !!BX.docs[I.lib], r = bxImprRango(), n = r.h - r.d + 1;
  if (!I.sel || I.sel._k !== `${I.lib}${r.d}-${r.h}`) { I.sel = { _k: `${I.lib}${r.d}-${r.h}` }; for (let p = r.d; p <= r.h; p++)I.sel[p] = true }
  const elegidas = Object.keys(I.sel).filter(k => k !== "_k" && I.sel[k]).length;
  return `${tiene ? "" : bxEstadoHTML()}
   <section class="card"><h3>Hojas para los alumnos que no tienen libro</h3>
    <p class="help">Elija la sesión y las páginas; se arma un solo PDF tamaño carta con las copias que necesite, listo para imprimir o mandar a imprimir.</p>
    <div class="chips bx-tabs"><button class="chip ${I.lib === "libro" ? "sel" : ""}" data-bxilib="libro">Libro del alumno</button><button class="chip ${I.lib === "guia" ? "sel" : ""}" data-bxilib="guia">Guía del docente</button></div>
    <div class="field"><label for="bxISes">Sesión</label><select id="bxISes">${BX_SES.map((s, i) => `<option value="${i}" ${I.ses === i ? "selected" : ""}>Bloque ${s.b} · Sesión ${s.s}: ${esc(s.t)}</option>`).join("")}
      ${BX_ANEXOS[I.lib].map((a, j) => `<option value="a${j}" ${I.desde === a.d && I.hasta === a.h ? "selected" : ""}>Anexo · ${esc(a.t)}</option>`).join("")}</select></div>
    <div class="bx-row"><div class="field"><label for="bxID">Desde la página</label><input type="number" id="bxID" min="1" value="${r.d}" inputmode="numeric"></div>
     <div class="field"><label for="bxIH">Hasta la página</label><input type="number" id="bxIH" min="1" value="${r.h}" inputmode="numeric"></div>
     <div class="field"><label for="bxIC">Copias (alumnos)</label><input type="number" id="bxIC" min="1" max="60" value="${I.copias}" inputmode="numeric"></div></div>
    <label class="help" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="bxI2" ${I.dos ? "checked" : ""}> Ahorrar papel: 2 páginas por hoja (horizontal, se ven más pequeñas)</label>
    ${tiene ? `<p class="help"><b>${elegidas}</b> de ${n} páginas elegidas. Toque una miniatura para quitarla o ponerla (por ejemplo, deje solo las hojas de trabajo).</p>
     <div class="chips"><button class="chip" id="bxTodas">Todas</button><button class="chip" id="bxNinguna">Ninguna</button></div>
     <div class="bx-thumbs" id="bxTh">${Array.from({ length: Math.min(n, 60) }, (_, k) => r.d + k).map(p => `<button class="bx-th ${I.sel[p] ? "sel" : ""}" data-bxth="${p}" aria-pressed="${!!I.sel[p]}"><canvas data-p="${p}" width="90" height="116"></canvas>Pág. ${p}</button>`).join("")}</div>
     ${n > 60 ? `<p class="help">Se muestran las primeras 60 páginas del rango.</p>` : ""}
     <div class="acts" style="flex-direction:row;flex-wrap:wrap;gap:8px"><button class="btn primary act" id="bxImp">${EI.print}Imprimir</button><button class="btn ghost act" id="bxPdf">${EI.down}Descargar PDF</button></div>
     <p class="help">Total a imprimir: <b id="bxTot"></b>.</p>`
      : `<div class="alert">Para armar las hojas, cargue primero el ${BX_LIB[I.lib].n} en este dispositivo (arriba).</div>`}</section>` }
async function bxMiniaturas() { const I = BX.impr; if (!BX.docs[I.lib]) return; const d = await bxDoc(I.lib); if (!d) return;
  bxTotal();
  for (const cv of app.querySelectorAll("#bxTh canvas")) { if (S.view !== "banxico" || BX.tab !== "imprimir") return;
    const pg = await d.getPage(+cv.dataset.p); const vp0 = pg.getViewport({ scale: 1 }); const vp = pg.getViewport({ scale: 180 / vp0.width });
    cv.width = vp.width; cv.height = vp.height; try { await pg.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise } catch (e) { } } }
function bxElegidas() { const I = BX.impr, r = bxImprRango(); const L = []; for (let p = r.d; p <= r.h; p++)if (I.sel[p] !== false && (I.sel[p] || p - r.d >= 60)) L.push(p); return L }
function bxTotal() { const t = document.getElementById("bxTot"); if (!t) return; const n = bxElegidas().length, c = BX.impr.copias, h = BX.impr.dos ? Math.ceil(n / 2) : n;
  t.textContent = n ? `${h * c} hoja${h * c !== 1 ? "s" : ""} (${n} página${n !== 1 ? "s" : ""} × ${c} cop${c !== 1 ? "ias" : "ia"})` : "ninguna página elegida" }
async function bxArmarPDF() { const I = BX.impr, pags = bxElegidas(); if (!pags.length) throw new Error("Elija al menos una página.");
  const src = await PDFLib.PDFDocument.load(BX.docs[I.lib].buf.slice(0), { ignoreEncryption: true }); const out = await PDFLib.PDFDocument.create();
  const idx = pags.map(p => p - 1);
  if (!I.dos) { for (let c = 0; c < I.copias; c++) for (const p of await out.copyPages(src, idx)) out.addPage(p) }
  else { const emb = await out.embedPages(idx.map(i => src.getPage(i))); const W = 792, H = 612, m = 18;
    for (let c = 0; c < I.copias; c++) for (let k = 0; k < emb.length; k += 2) { const pg = out.addPage([W, H]);
      [emb[k], emb[k + 1]].forEach((e, j) => { if (!e) return; const cw = (W - m * 3) / 2, ch = H - m * 2, s = Math.min(cw / e.width, ch / e.height);
        pg.drawPage(e, { x: m + j * (cw + m) + (cw - e.width * s) / 2, y: m + (ch - e.height * s) / 2, width: e.width * s, height: e.height * s }) }) } }
  return new Blob([await out.save()], { type: "application/pdf" }) }
async function bxSalida(modo, btn) { const lbl = btn.innerHTML; btn.disabled = true; btn.textContent = "Preparando…";
  try { const blob = await bxArmarPDF(); const I = BX.impr, r = bxImprRango(); const s = BX_SES[I.ses];
    const nom = `El dinero en México - ${I.lib === "libro" ? "Libro" : "Guía"} - ${I.desde !== null ? "págs" : "Sesión " + s.s} ${r.d}-${r.h}${I.copias > 1 ? " - " + I.copias + " copias" : ""}.pdf`;
    PMODE = modo; await entregarPDF(blob, nom, I.dos ? ", horizontal" : "") }
  catch (e) { pToast(`<b>No se pudo armar el PDF.</b> ${esc(e.message || e)}`) } finally { btn.disabled = false; btn.innerHTML = lbl } }

/* ---------- avance del grupo ---------- */
function bxAvanceHTML() { const av = bxAv(); const n = BX_SES.filter(s => av[s.s]).length;
  return `<section class="card"><h3>Avance del grupo · ${n} de 20 sesiones</h3><div class="bx-bar"><i style="width:${n * 5}%"></i></div>
    <p class="help">Marque cada sesión al impartirla; se guarda la fecha en este dispositivo. Sirve como evidencia del trabajo con el programa.</p>
    ${BX_BLOQUES.map((bn, bi) => `<div class="group-title" style="margin-top:6px">Bloque ${bi + 1} · ${bn}</div>` + BX_SES.filter(s => s.b === bi + 1).map(s => `<label class="bx-s ${av[s.s] ? "ok" : ""}" style="cursor:pointer"><span class="n">${s.s}</span><span class="tx"><b>${esc(s.t)}</b><span>${av[s.s] ? "Impartida el " + esc(fmtDate(av[s.s], "larga")) : "Pendiente"}</span></span>
      <input type="checkbox" data-bxav="${s.s}" ${av[s.s] ? "checked" : ""} style="width:22px;height:22px"></label>`).join("")).join("")}
    <div class="acts" style="flex-direction:row;flex-wrap:wrap;gap:8px"><button class="btn ghost" id="bxAvPdf">${EI.print}Imprimir registro de avance</button></div></section>` }
async function bxAvancePDF(btn) { const lbl = btn.innerHTML; btn.disabled = true;
  try { await fonts(); const av = bxAv(); const doc = await PDFLib.PDFDocument.create(); const H = await doc.embedFont(PDFLib.StandardFonts.Helvetica), B = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const { rgb } = PDFLib; const pg = doc.addPage([612, 792]); const M = 50; let y = 742; const T = (t, x, yy, f = H, s = 10, c = rgb(0, 0, 0)) => pg.drawText(String(t), { x, y: yy, size: s, font: f, color: c });
    T("REGISTRO DE AVANCE · «EL DINERO EN MÉXICO» (BANXICO EDUCA)", M, y, B, 12); y -= 18;
    T(`${perfil.escuela || "Escuela: ______________________________"}${perfil.cct ? "  ·  CCT " + perfil.cct : ""}`, M, y); y -= 14;
    T(`Docente: ${perfil.minombre || "______________________________"}   Grado y grupo: ${yoGrado() ? yoGrado() + "° " + yoGrupo() : "6° ____"}   Ciclo: ${typeof cicloActual === "function" ? cicloActual() : ""}`, M, y); y -= 22;
    const cols = [M, M + 52, M + 330, M + 430]; pg.drawRectangle({ x: M - 4, y: y - 4, width: 612 - 2 * M + 8, height: 18, color: rgb(.92, .92, .92) });
    ["Sesión", "Tema", "Fecha", "Observaciones"].forEach((t, i) => T(t, cols[i], y, B, 9)); y -= 20;
    let b0 = 0; for (const s of BX_SES) { if (s.b !== b0) { b0 = s.b; T(`Bloque ${s.b} · ${BX_BLOQUES[s.b - 1]}`, M, y, B, 9, rgb(.15, .25, .45)); y -= 15 }
      T(String(s.s), cols[0] + 8, y, H, 9); T(s.t.replace(/…/g, "..."), cols[1], y, H, 9); T(av[s.s] ? av[s.s].split("-").reverse().join("/") : "", cols[2], y, H, 9);
      pg.drawLine({ start: { x: cols[3], y: y - 3 }, end: { x: 612 - M, y: y - 3 }, thickness: .5, color: rgb(.6, .6, .6) }); y -= 15 }
    y -= 6; T(`Sesiones impartidas: ${BX_SES.filter(s => av[s.s]).length} de 20`, M, y, B, 10); y -= 50;
    pg.drawLine({ start: { x: M + 20, y }, end: { x: M + 220, y }, thickness: .7 }); pg.drawLine({ start: { x: 612 - M - 220, y }, end: { x: 612 - M - 20, y }, thickness: .7 });
    T("Firma del docente", M + 75, y - 12, H, 9); T("Vo. Bo. Dirección", 612 - M - 160, y - 12, H, 9);
    PMODE = "print"; await entregarPDF(new Blob([await doc.save()], { type: "application/pdf" }), "Avance - El dinero en México.pdf") }
  catch (e) { pToast(`<b>No se pudo generar.</b> ${esc(e.message || e)}`) } finally { btn.disabled = false; btn.innerHTML = lbl } }

/* ---------- recursos ---------- */
function bxRecursosHTML() { const li = ([t, u]) => `<a class="lib" href="${u}" target="_blank" rel="noopener"><span>${esc(t)}</span><span class="chev" aria-hidden="true">›</span></a>`;
  return `<section class="card"><h3>Libros oficiales (PDF de Banxico)</h3><div class="libs">${li(["El dinero en México · Libro de prácticas (alumno)", BX_URL.libro])}${li(["El dinero en México · Guía del docente", BX_URL.guia])}</div></section>
   <section class="card"><h3>Planeaciones y proyectos</h3><div class="libs">${BX_DOC.map(li).join("")}</div></section>
   ${BX_BLOQUES.map((bn, i) => `<details class="card"><summary><b>Bloque ${i + 1} · ${bn}</b> · ${BX_REC[i + 1].length} recursos</summary><div class="libs">${BX_REC[i + 1].map(li).join("")}</div></details>`).join("")}
   <section class="card"><h3>El programa</h3><div class="libs">${li(["Página oficial del programa", BX_URL.programa])}${li(["Material de la capacitación para docentes", BX_URL.materiales])}${li(["Recursos multimedia", BX_URL.multimedia])}${li(["Solicitar el curso para su escuela", BX_URL.solicitud])}${li(["Registro al sistema del curso (docentes)", BX_URL.registro])}${li(["Recursos para niñas y niños", BX_URL.ninos])}</div></section>` }

/* ---------- eventos ---------- */
function bxWire() { const g = id => document.getElementById(id), msg = t => { const m = g("bxMsg"); if (m) m.innerHTML = t };
  app.querySelectorAll("[data-bxlib]").forEach(b => b.onclick = () => { BX.lib = b.dataset.bxlib; BX.pag = null; bxView() });
  app.querySelectorAll("[data-bxses]").forEach(b => b.onclick = () => { BX.ses = +b.dataset.bxses; BX.pag = null; bxView().then(() => { const v = g("bxVis") || app.querySelector(".card"); v && v.scrollIntoView({ block: "start" }) }) });
  app.querySelectorAll("[data-bxpag]").forEach(b => b.onclick = () => { BX.pag = +b.dataset.bxpag; if (!BX.docs[BX.lib]) { window.open(BX_URL[BX.lib] + "#page=" + BX.pag, "_blank", "noopener"); return } bxView() });
  app.querySelectorAll("[data-bxquitar]").forEach(b => b.onclick = async () => { await bxDel(b.dataset.bxquitar); bxView() });
  app.querySelectorAll("[data-bxbajar]").forEach(b => b.onclick = async () => { const k = b.dataset.bxbajar; b.disabled = true; b.textContent = "Descargando…";
    try { const buf = await bxIntentarDescarga(k); await bxGuardarArchivo(buf, BX_LIB[k].n + ".pdf", k); bxView() }
    catch (e) { b.disabled = false; b.textContent = "Cargar"; msg(`<b>El sitio de Banxico no permite bajarlo directo desde aquí.</b> Toque <b>Descargar de Banxico: ${k === "libro" ? "Libro" : "Guía"}</b>, guarde el PDF en su dispositivo y luego <b>Ya lo descargué: elegir PDF</b>.`) } });
  const f = g("bxFile"); if (f) f.onchange = async () => { const fs = [...f.files]; if (!fs.length) return; msg("Revisando el archivo…"); const ok = [];
    for (const x of fs) { try { const k = await bxGuardarArchivo(await x.arrayBuffer(), x.name, null); ok.push(BX_LIB[k].n) } catch (e) { msg(`<b>${esc(x.name)}:</b> ${esc(e.message || e)}`); f.value = ""; return } }
    f.value = ""; pToast(`<b>Listo.</b> ${ok.join(" y ")} guardado en este dispositivo.`); bxView() };
  /* clase */
  if (g("bxPrev")) { g("bxPrev").onclick = () => bxIr(bxPagActual() - 1); g("bxNext").onclick = () => bxIr(bxPagActual() + 1);
    g("bxPg").onchange = () => bxIr(+g("bxPg").value || 1);
    g("bxZm").onclick = () => { BX.zoom = Math.max(.5, BX.zoom - .15); bxPintar() }; g("bxZp").onclick = () => { BX.zoom = Math.min(3, BX.zoom + .15); bxPintar() };
    g("bxFull").onclick = bxPantalla;
    g("bxOtro").onclick = () => { BX.lib = BX.lib === "libro" ? "guia" : "libro"; BX.pag = null; bxView() };
    g("bxImpSes").onclick = () => { Object.assign(BX.impr, { ses: BX.ses, lib: "libro", desde: null, hasta: null, sel: null }); BX.tab = "imprimir"; bxView().then(() => window.scrollTo(0, 0)) };
    g("bxHecha").onclick = () => { const av = bxAv(), n = BX_SES[BX.ses].s; if (av[n]) delete av[n]; else av[n] = new Date().toISOString().slice(0, 10); bxAvSet(av); bxView() } }
  /* imprimir */
  const I = BX.impr;
  app.querySelectorAll("[data-bxilib]").forEach(b => b.onclick = () => { I.lib = b.dataset.bxilib; I.desde = I.hasta = null; I.sel = null; bxView() });
  if (g("bxISes")) g("bxISes").onchange = () => { const v = g("bxISes").value; if (v[0] === "a") { const a = BX_ANEXOS[I.lib][+v.slice(1)]; I.desde = a.d; I.hasta = a.h } else { I.ses = +v; I.desde = I.hasta = null } I.sel = null; bxView() };
  const pagMax = BX.docs[I.lib] ? BX.docs[I.lib].pags : 300;
  const rng = () => { let d = Math.max(1, Math.min(pagMax, +g("bxID").value || 1)), h = Math.max(1, Math.min(pagMax, +g("bxIH").value || d)); if (h < d) [d, h] = [h, d]; I.desde = d; I.hasta = h; I.sel = null; bxView() };
  if (g("bxID")) { g("bxID").onchange = rng; g("bxIH").onchange = rng }
  if (g("bxIC")) g("bxIC").oninput = () => { I.copias = Math.max(1, Math.min(60, +g("bxIC").value || 1)); bxTotal() };
  if (g("bxI2")) g("bxI2").onchange = () => { I.dos = g("bxI2").checked; bxTotal() };
  app.querySelectorAll("[data-bxth]").forEach(b => b.onclick = () => { const p = +b.dataset.bxth; I.sel[p] = !I.sel[p]; b.classList.toggle("sel", I.sel[p]); b.setAttribute("aria-pressed", I.sel[p]); bxTotal() });
  const todas = v => { app.querySelectorAll("[data-bxth]").forEach(b => { I.sel[+b.dataset.bxth] = v; b.classList.toggle("sel", v) }); bxTotal() };
  if (g("bxTodas")) { g("bxTodas").onclick = () => todas(true); g("bxNinguna").onclick = () => todas(false) }
  if (g("bxImp")) { g("bxImp").onclick = () => bxSalida("print", g("bxImp")); g("bxPdf").onclick = () => bxSalida("save", g("bxPdf")) }
  /* avance */
  app.querySelectorAll("[data-bxav]").forEach(c => c.onchange = () => { const av = bxAv(); if (c.checked) av[c.dataset.bxav] = new Date().toISOString().slice(0, 10); else delete av[c.dataset.bxav]; bxAvSet(av); bxView() });
  if (g("bxAvPdf")) g("bxAvPdf").onclick = () => bxAvancePDF(g("bxAvPdf"));
  /* redibuja al girar la tableta o cambiar el tamaño de la ventana */
  if (!window._bxRs) { window._bxRs = true; let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { if (S.view === "banxico" && BX.tab === "clase" && !document.querySelector(".bx-full")) bxPintar() }, 200) }) } }
