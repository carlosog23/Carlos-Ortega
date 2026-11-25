/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Supervisión. App del supervisor(a) de Educación Física para la visita de supervisión formativa:
   · con el código QR que genera el maestro en Ulama ve (solo consulta) planeaciones, evaluación continua y formativa,
     listas de asistencia y gráficas de rendimiento y asistencia;
   · también revisa a maestros que no usan Ulama, con indicadores por aspecto;
   · en cada aspecto pone un semáforo, observaciones y fotos de evidencia; al cerrar firma, genera el informe en PDF
     y se lo envía al correo institucional del maestro.
   Todo se guarda en el dispositivo (las fotos y paquetes en IndexedDB). */
"use strict";
const CLAVE = "ulama-sup", ISEP = "../../formatos-ppie/img/isep.png", ESC_IMG = "../../formatos-ppie/img/escuelas/", ACCESO = "../../formatos-ppie/formatos/acceso.json";
const TEQUIO_DEF = "https://script.google.com/macros/s/AKfycbyH4wcANu-w9zNKkVECYoRjF9DhJi6pKwLL2sK0jFxGqQwFKNs0yAJzcC0S3yX8yB4aLw/exec";
const H2P = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hoy = () => iso(new Date()), hora = () => new Date().toTimeString().slice(0, 5);
const DSEM = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], DSEM_L = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"], MES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const dF = k => new Date(k + "T12:00:00");
const fCorta = k => { if (!k) return ""; const d = dF(k); return `${DSEM[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}`; };
const fLarga = k => { if (!k) return ""; const d = dF(k); return `${d.getDate()} de ${MES_L[d.getMonth()]} de ${d.getFullYear()}`; };
const h12 = h => { if (!h) return ""; const [H, M] = h.split(":").map(Number); return `${(H % 12) || 12}:${String(M).padStart(2, "0")} ${H < 12 ? "a. m." : "p. m."}`; };
const pct = x => x == null ? "—" : Math.round(x * 100) + "%";
const prom = a => a.length ? a.reduce((t, x) => t + x, 0) / a.length : null;
const corto = n => String(n || "").trim().split(/\s+/).slice(0, 2).join(" ");
const escCorta = n => corto(String(n || "").replace(/^\s*(esc(uela)?\.?\s*)?(prim(aria)?\.?\s*)?/i, "")) || n;
const minutos = (a, b) => Math.max(0, Math.round(((b || Date.now()) - a) / 60000));
const durTxt = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + " min" : ""}`.trim();
const ic = (n, s = 20) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${ICONOS[n] || ""}</svg>`;
const ICONOS = {
  atras: '<path d="M15 18l-6-6 6-6"/>', sig: '<path d="M9 18l6-6-6-6"/>', mas: '<path d="M12 5v14M5 12h14"/>', silbato: '<circle cx="9" cy="14" r="5"/><path d="M13 11l8-4v4l-6 2"/><path d="M9 14h.01"/>',
  plan: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>', escuela: '<path d="M3 10l9-6 9 6"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  eval: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>', agenda: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  grupo: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5c3 0 5.5 1.7 5.5 4.5"/>',
  camara: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  lapiz: '<path d="M4 20h4L20 8l-4-4L4 16z"/>', basura: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', check: '<path d="M5 12l5 5 9-10"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', impr: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', subir: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>', bajar: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  teclado: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  escudo: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', sup: '<circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/><path d="M16 4l2-2"/>',
  ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', bandera: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>', compartir: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>'
};

/* ---------------- aspectos que se revisan ---------------- */
const ASP = [
  { k: "planeacion", n: "Planeación didáctica", ic: "plan", c: "#1F3A6B", s: "#E6ECF6", ind: ["Cuenta con planeación vigente para los grupos que atiende", "Retoma contenidos y PDA del programa de Educación Física (NEM)", "Sesiones con inicio, desarrollo y cierre bien definidos", "Considera la fase y el grado de los alumnos", "Incluye instrumentos de evaluación (rúbrica, lista de cotejo o escala)", "Contempla ajustes razonables para quien lo requiere", "Se aplica conforme a lo planeado (avance de sesiones)"] },
  { k: "evaluacion", n: "Evaluación continua y formativa", ic: "eval", c: "#6B3F7A", s: "#EEE3F2", ind: ["Registra la evaluación durante las sesiones", "Usa los instrumentos de su planeación", "Tiene observaciones cualitativas de los alumnos", "Identifica a los alumnos que requieren apoyo y les da seguimiento", "La calificación tiene sustento en evidencias", "Comunica los resultados a docentes de grupo y dirección"] },
  { k: "asistencia", n: "Listas de asistencia", ic: "grupo", c: "#A94C2A", s: "#F5E2D7", ind: ["Registra la asistencia en todas sus clases", "Registra retardos y faltas justificadas", "Listas actualizadas (altas y bajas)", "Da seguimiento a los alumnos con inasistencias frecuentes"] },
  { k: "clase", n: "Observación de clase", ic: "silbato", c: "#1B7560", s: "#DBEFE8", ind: ["Activación física y recuperación de saberes al inicio", "Comunica el propósito de la sesión", "Actividades acordes al PDA y a la fase", "Participación activa e inclusión de todos los alumnos", "Organización del grupo, del espacio y del tiempo", "Uso adecuado del material", "Evalúa durante la sesión", "Cierre con reflexión y vuelta a la calma", "Clima de respeto y convivencia"] },
  { k: "seguridad", n: "Seguridad e integridad", ic: "escudo", c: "#A3322A", s: "#F7DEDA", ind: ["Revisa el área de trabajo antes de la clase", "Calentamiento adecuado y dosificación del esfuerzo", "Promueve la hidratación y el cuidado ante el sol o el clima", "Registra los incidentes y avisa a tiempo", "Conoce a los alumnos con restricción física o condición de salud"] },
  { k: "documentacion", n: "Organización y comunicación", ic: "doc", c: "#8A5A08", s: "#FAEBCB", ind: ["Tiene el horario de clases de cada escuela", "Listas o expediente por grupo", "Comunicación con director(a) y docentes de grupo", "Atiende los acuerdos de la visita anterior"] }
];
const aspDe = k => ASP.find(a => a.k === k);
const SEM = { v: { n: "Logrado", c: "#1E8E5A", s: "#DDF3E7" }, a: { n: "En proceso", c: "#C98A0B", s: "#FBEFCF" }, r: { n: "Requiere atención", c: "#C2362B", s: "#F8DCD8" } };
const RESP = [[2, "Sí"], [1, "Parcial"], [0, "No"]], RESP_N = { 2: "Sí", 1: "Parcial", 0: "No" };
const TIPOS_V = ["Seguimiento formativo", "Acompañamiento en clase", "Asesoría técnico-pedagógica", "Revisión documental"];
const semDot = (s, t = 14) => `<span class="sem-dot" style="width:${t}px;height:${t}px;background:${s ? SEM[s].c : "#D8D0C2"}"></span>`;

/* ---------------- datos ---------------- */
const VACIO = () => ({ v: 1, yo: { trato: "Mtro.", nombre: "Luis René Medrano Bernal", cargo: "Supervisor de Educación Física", zona: "041", correo: "", tel: "", firma: "" }, tok: "", escuelas: [], maestros: [], visitas: [], cfg: {} });
let D = cargar();
function cargar() { try { const x = JSON.parse(localStorage.getItem(CLAVE) || "null"); if (x && x.v) { const d = Object.assign(VACIO(), x), b = VACIO().yo; /* espacio personalizado: Supervisor de E. F. de la Zona 041 */ ["nombre", "zona"].forEach(k => { if (!d.yo[k]) d.yo[k] = b[k]; }); if (!d.yo.cargo || d.yo.cargo === "Supervisor(a) de Educación Física") d.yo.cargo = b.cargo; return d; } } catch (e) {} return VACIO(); }
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(D)); } catch (e) { toast("<b>No se pudo guardar.</b> El dispositivo no tiene espacio."); } }
const yoNombre = () => [D.yo.trato, D.yo.nombre].filter(Boolean).join(" ");
const escDe = id => D.escuelas.find(e => e.id === id), maeDe = id => D.maestros.find(m => m.id === id), visDe = id => D.visitas.find(v => v.id === id);
const visAct = () => D.visitas.find(v => v.estado === "abierta");
const dirNombre = e => e ? [e.dirTrato, e.director].filter(Boolean).join(" ") : "";
const nrm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9@.]+/g, " ").trim();

/* fotos de evidencia y paquetes de revisión: IndexedDB (no caben en localStorage) */
function idb() { return idb.p || (idb.p = new Promise((ok, no) => { const r = indexedDB.open("ulama-sup", 1); r.onupgradeneeded = () => { r.result.createObjectStore("f"); r.result.createObjectStore("p"); }; r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); })); }
async function idbOp(st, modo, fn) { const db = await idb(); return new Promise((ok, no) => { const t = db.transaction(st, modo), q = fn(t.objectStore(st)); t.oncomplete = () => ok(q && q.result); t.onerror = () => no(t.error); }); }
const FOTO = {}, PAQ = {};
const fotoPut = (id, u) => { FOTO[id] = u; return idbOp("f", "readwrite", s => s.put(u, id)); };
const fotoGet = async id => FOTO[id] || (FOTO[id] = await idbOp("f", "readonly", s => s.get(id)).catch(() => null));
const fotoDel = id => { delete FOTO[id]; return idbOp("f", "readwrite", s => s.delete(id)).catch(() => {}); };
const paqPut = (id, p) => { PAQ[id] = p; return idbOp("p", "readwrite", s => s.put(p, id)); };
const paqGet = async id => PAQ[id] || (PAQ[id] = await idbOp("p", "readonly", s => s.get(id)).catch(() => null));

/* ---------------- navegación ---------------- */
let S = { v: "inicio" }; const PILA = [];
function ir(v, p = {}, reemplazar) { if (!reemplazar) { PILA.push(S); history.pushState({ n: PILA.length }, ""); } S = Object.assign({ v }, p); pintar(); window.scrollTo(0, 0); }
function atras() { S = PILA.pop() || { v: "inicio" }; pintar(); window.scrollTo(0, 0); }
window.addEventListener("popstate", () => { if (PILA.length || S.v !== "inicio") atras(); });
const VISTAS = {}, ENLAZAR = {};
function pintar() { cerrarDlg(); camStop(); if (!D.cfg.listo && S.v !== "bienvenida") S = { v: "bienvenida" };
  const f = VISTAS[S.v] || VISTAS.inicio; $("#app").innerHTML = f(); (ENLAZAR[S.v] || (() => {}))(); const b = $("#atras"); if (b) b.onclick = () => history.back(); }
const re = () => { const y = scrollY; pintar(); scrollTo(0, y); };
const barra = (eb, t, der = "") => `<header class="top"><div class="top-in"><button class="back" id="atras" aria-label="Regresar">${ic("atras")}</button><div style="min-width:0"><div class="eb">${eb}</div><h1>${t}</h1></div><div class="der">${der}</div></div></header>`;
function toast(h, ms = 2800) { const t = $("#toast"); t.innerHTML = h; t.classList.add("ver"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("ver"), ms); }
function dlg(html, alAbrir) { cerrarDlg(); const v = document.createElement("div"); v.className = "velo"; v.id = "velo"; v.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
  v.addEventListener("click", e => { if (e.target === v) cerrarDlg(); }); document.body.appendChild(v); document.body.style.overflow = "hidden"; alAbrir && alAbrir(v); }
function cerrarDlg() { const v = $("#velo"); if (v) v.remove(); document.body.style.overflow = ""; }
function confirmar(msg, si = "Sí, continuar") { return new Promise(ok => { dlg(`<h3>¿Seguro?</h3><p class="mb">${esc(msg)}</p><div class="fila fin"><button class="btn" id="qNo">Cancelar</button><button class="btn r" id="qSi">${esc(si)}</button></div>`, v => {
  v.querySelector("#qNo").onclick = () => { cerrarDlg(); ok(false); }; v.querySelector("#qSi").onclick = () => { cerrarDlg(); ok(true); }; }); }); }
const val = id => (document.getElementById(id) || {}).value || "";
const _libs = {};
function cargarJS(src) { return _libs[src] || (_libs[src] = new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => { delete _libs[src]; no(new Error("No se pudo cargar " + src)); }; document.head.appendChild(s); })); }
const enApp = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

/* ---------------- catálogo de escuelas y maestros ---------------- */
async function cargarCatalogo(url, silencio) { try { const r = await fetch(url, { cache: "no-store" }); const j = await r.json(); return combinarCatalogo(j, silencio); } catch (e) { if (!silencio) toast("No se pudo leer el catálogo."); return null; } }
function combinarCatalogo(j, silencio) { if (!j || !Array.isArray(j.escuelas)) { toast("El archivo no es un catálogo de escuelas."); return null; } const n = { e: 0, m: 0 }, mapa = {};
  j.escuelas.forEach(x => { let e = D.escuelas.find(y => (x.cct && y.cct === x.cct) || nrm(y.nombre) === nrm(x.nombre)); if (!e) { e = Object.assign({}, x, { id: uid() }); D.escuelas.push(e); n.e++; } else Object.keys(x).forEach(k => { if (k !== "id" && x[k] && !e[k]) e[k] = x[k]; }); mapa[x.id] = e.id; });
  (j.maestros || []).forEach(x => { const ids = (x.escuelas || []).map(i => mapa[i] || i); let m = D.maestros.find(y => (x.correo && y.correo === x.correo) || nrm(y.nombre) === nrm(x.nombre));
    if (!m) { D.maestros.push(Object.assign({}, x, { id: uid(), escuelas: ids })); n.m++; } else { ids.forEach(i => { if (!m.escuelas.includes(i)) m.escuelas.push(i); }); if (!m.correo && x.correo) m.correo = x.correo; } });
  if (j.zona && !D.yo.zona) D.yo.zona = j.zona; guardar(); if (!silencio) toast(`Se agregaron ${n.e} escuelas y ${n.m} maestros.`); return n; }
const activo = m => m && !m.inactivo, activos = () => D.maestros.filter(activo);
const escuelasDe = m => (m && m.escuelas || []).map(escDe).filter(Boolean);
const maestrosDe = eId => D.maestros.filter(m => (m.escuelas || []).includes(eId)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
const escNom = e => e ? `${e.nombre}${e.turno ? " (" + e.turno.slice(0, 3).toLowerCase() + ".)" : ""}` : "";

/* =================================================================== BIENVENIDA */
VISTAS.bienvenida = () => `<main class="wrap"><section class="portada">${marca()}<h1>${D.yo.nombre ? `Bienvenido, ${esc(yoNombre())}` : "Su espacio de supervisión"}</h1>
  <p>Su espacio de trabajo como supervisor de Educación Física${D.yo.zona ? ` de la Zona ${esc(D.yo.zona)}` : ""}: horarios de sus maestros, agenda del ciclo, entrega de planeaciones, hojas de visita, incidencias, permisos económicos y reporte mensual, cada uno con su formato para imprimir. Además, revisiones con semáforo, evidencias e informe al correo del maestro.</p></section>
  <section class="card mt"><h3>Sus datos</h3><p class="small muted mb">Revise que estén bien: aparecen en todos sus formatos e informes. Todo se guarda solo en este dispositivo.</p>
   <div class="dos"><label class="campo"><span>Tratamiento</span><select id="yTr">${["Mtro.", "Mtra.", "Profr.", "Profra.", "Lic.", "Dr.", "Dra."].map(x => `<option ${x === D.yo.trato ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="campo"><span>Nombre completo</span><input id="yNom" value="${esc(D.yo.nombre)}" autocomplete="name"></label></div>
   <div class="dos"><label class="campo"><span>Cargo</span><input id="yCar" value="${esc(D.yo.cargo)}"></label><label class="campo"><span>Zona escolar</span><input id="yZon" value="${esc(D.yo.zona || "041")}" inputmode="numeric"></label></div>
   <label class="campo"><span>Correo institucional</span><input id="yCor" type="email" value="${esc(D.yo.correo)}" placeholder="nombre@bcedu.mx"></label>
   <label class="rev-chk"><input type="checkbox" id="yCat" checked> Cargar las 16 escuelas de Playas de Rosarito (Zona 041) y sus maestros de E. F.</label>
   <div class="fila fin mt"><button class="btn p" id="yOk">${ic("check", 18)} Entrar</button></div></section>${pie()}</main>`;
ENLAZAR.bienvenida = () => { $("#yOk").onclick = async () => { const n = val("yNom").trim(); if (!n) return toast("Escriba su nombre.");
  Object.assign(D.yo, { trato: val("yTr"), nombre: n, cargo: val("yCar").trim() || "Supervisor(a) de Educación Física", zona: val("yZon").trim(), correo: val("yCor").trim().toLowerCase() });
  if ($("#yCat").checked) await cargarCatalogo("zona041.json", true); D.cfg.listo = true; const pend = D.cfg.pend; delete D.cfg.pend; guardar(); S = { v: "inicio" }; pintar(); toast("¡Listo! Ya puede iniciar una revisión."); if (pend) bajarCodigo(pend); }; };
const marca = () => `<div class="marca"><img src="img/sup-icono.svg" alt=""><div><div class="eb">Ulama</div><span class="sello">${ic("escudo", 14)} Supervisión</span></div></div>`;
const pie = () => `<p class="pie">Ulama · Supervisión · de la familia Tlamatini</p><div class="firma-autor" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 16px 22px"><span style="font:600 10.5px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6b7685">Desarrollada por</span><img src="../firma-autor.svg" alt="Maestro Carlos Ortega" width="200" height="65" style="width:200px;height:auto"></div>`;

/* =================================================================== INICIO */
VISTAS.inicio = () => { const a = visAct(), d = new Date(), rec = D.visitas.filter(v => v.estado === "cerrada").sort((x, y) => (y.cerrada || "").localeCompare(x.cerrada || "")).slice(0, 4);
  return `<main class="wrap"><section class="portada">${marca()}<h1>Hola, ${esc(corto(D.yo.nombre) || "supervisor(a)")}</h1><p>${DSEM_L[d.getDay()][0].toUpperCase() + DSEM_L[d.getDay()].slice(1)} ${fLarga(hoy())} · ${D.escuelas.length} escuelas · ${D.maestros.length} maestros</p>
   <div class="fila"><button class="btn m" id="bIni">${ic("qr")} Iniciar revisión</button>${enApp() ? "" : `<button class="btn sec" id="bInst">${ic("bajar")} Instalar app</button>`}</div></section>
  ${a ? `<button class="vis-act mt" id="bCont"><span class="pulso"></span><span class="tx"><b>Visita en curso · ${esc(a.maestro.nombre)}</b><small>${esc(a.escuela.nombre || "")} · inició ${h12(a.ini)} · ${durTxt(minutos(a.t0))}</small></span><span class="btn s o">Continuar</span></button>` : ""}
  <h2 class="sec-t">Su trabajo</h2><div class="puertas">
   <button class="puerta" data-v="historial" style="--c:var(--anil);--c-s:var(--anil-s)"><span class="ic">${ic("doc")}</span><b>Visitas realizadas</b><span>${D.visitas.filter(v => v.estado === "cerrada").length} informes · volver a ver, imprimir o enviar</span></button>
   <button class="puerta" data-v="catalogo"><span class="ic">${ic("escuela")}</span><b>Escuelas y maestros</b><span>Claves, domicilios, directores y correos · editar o subir lista</span></button>
   <button class="puerta" data-v="ajustes" style="--c:var(--gris);--c-s:var(--hilo2)"><span class="ic">${ic("ajustes")}</span><b>Ajustes</b><span>Sus datos, su firma y el enlace para enviar correos</span></button></div>
  ${rec.length ? `<h2 class="sec-t">Últimas visitas</h2><div class="lista">${rec.map(itemVisita).join("")}</div>` : ""}${pie()}</main>`; };
const itemVisita = v => { const s = semGeneral(v); return `<button class="it btnit" data-vis="${v.id}"><span class="av" style="background:${s ? SEM[s].s : "var(--hilo2)"};color:${s ? SEM[s].c : "var(--gris)"}">${ic("persona", 18)}</span><span class="tx"><b>${esc(v.maestro.nombre)}</b><small>${esc(v.escuela.nombre || "")} · ${fCorta(v.fecha)} · ${esc(v.tipo)}</small></span>${s ? `<span class="tag" style="background:${SEM[s].s};color:${SEM[s].c}">${SEM[s].n}</span>` : ""}</button>`; };
ENLAZAR.inicio = () => { $("#bIni").onclick = dlgIniciar; $("#bCont") && ($("#bCont").onclick = () => ir("visita", { id: visAct().id })); $("#bInst") && ($("#bInst").onclick = instalarApp);
  $$(".puerta").forEach(b => b.onclick = () => ir(b.dataset.v)); $$("[data-vis]").forEach(b => b.onclick = () => ir("informe", { id: b.dataset.vis })); };
let PROMPT_INST = null; window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); PROMPT_INST = e; });
function instalarApp() { if (PROMPT_INST) { PROMPT_INST.prompt(); PROMPT_INST = null; return; }
  dlg(`<h3>Instalar Ulama · Supervisión</h3><p class="mb">En <b>iPhone o iPad</b> (Safari): botón Compartir → «Agregar a pantalla de inicio».<br>En <b>Android</b> (Chrome): menú ⋮ → «Instalar app».<br>En <b>computadora</b> (Chrome o Edge): el ícono de instalar en la barra de direcciones.</p><div class="fila fin"><button class="btn p" id="iX">Entendido</button></div>`, v => v.querySelector("#iX").onclick = cerrarDlg); }

/* =================================================================== INICIAR REVISIÓN */
function dlgIniciar() { const a = visAct(); if (a) return dlg(`<h3>Hay una visita en curso</h3><p class="mb">Con ${esc(a.maestro.nombre)} (${esc(a.escuela.nombre || "")}). Ciérrela o descártela antes de iniciar otra.</p><div class="fila fin"><button class="btn" id="dX">Cerrar</button><button class="btn p" id="dC">Ir a la visita</button></div>`, v => { v.querySelector("#dX").onclick = cerrarDlg; v.querySelector("#dC").onclick = () => ir("visita", { id: a.id }); });
  dlg(`<h3>Iniciar revisión</h3><p class="small muted mb">¿El maestro usa Ulama? Pídale que abra <b>Visita del supervisor</b> y le muestre su código.</p><div class="lista">
   <button class="it btnit" id="o1"><span class="av">${ic("qr", 18)}</span><span class="tx"><b>Escanear el código QR</b><small>Con la cámara de este dispositivo</small></span></button>
   <button class="it btnit" id="o2"><span class="av">${ic("teclado", 18)}</span><span class="tx"><b>Escribir el código</b><small>Las 6 letras que aparecen bajo el QR</small></span></button>
   <button class="it btnit" id="o3"><span class="av">${ic("subir", 18)}</span><span class="tx"><b>Abrir archivo de revisión</b><small>Si el maestro se lo envió (sin internet)</small></span></button>
   <button class="it btnit" id="o4"><span class="av" style="background:var(--maiz-s);color:var(--maiz-d)">${ic("persona", 18)}</span><span class="tx"><b>Maestro sin Ulama</b><small>Revisión con indicadores, evidencias y semáforo</small></span></button></div>
   <input type="file" id="fRev" accept=".ulama,.json,application/json,application/octet-stream" hidden><div class="fila fin mt"><button class="btn" id="oX">Cancelar</button></div>`, v => {
    v.querySelector("#oX").onclick = cerrarDlg; v.querySelector("#o1").onclick = () => ir("escanear"); v.querySelector("#o4").onclick = () => ir("nueva", { N: { modo: "manual" } });
    v.querySelector("#o2").onclick = () => dlg(`<h3>Escriba el código</h3><label class="campo"><span>Código de 6 letras</span><input id="cCod" maxlength="7" autocapitalize="characters" autocomplete="off" style="font:700 28px/1 var(--disp);letter-spacing:.2em;text-transform:uppercase;text-align:center"></label><div class="fila fin"><button class="btn" id="cX">Cancelar</button><button class="btn p" id="cOk">Abrir</button></div>`, w => {
      const i = w.querySelector("#cCod"); setTimeout(() => i.focus(), 60); w.querySelector("#cX").onclick = cerrarDlg; const ok = () => bajarCodigo(i.value); w.querySelector("#cOk").onclick = ok; i.onkeydown = e => { if (e.key === "Enter") ok(); }; });
    v.querySelector("#o3").onclick = () => v.querySelector("#fRev").click(); v.querySelector("#fRev").onchange = e => abrirArchivo(e.target.files[0]); }); }

async function servidor() { try { const r = await fetch(ACCESO + "?t=" + Date.now(), { cache: "no-store" }); if (r.ok) { const j = await r.json(); if (j.tequio) { D.cfg.srv = j.tequio; guardar(); return j.tequio; } } } catch (e) {} return D.cfg.srv || TEQUIO_DEF; }
async function post(accion, datos) { if (navigator.onLine === false) throw new Error("No hay internet.");
  const r = await fetch(await servidor(), { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion, datos }) });
  const j = await r.json(); if (!j || !j.ok) throw new Error((j && (j.mensaje || j.error)) || "El servidor no respondió."); return j; }
async function descomprimir(z, s) { let txt;
  if (+z) { if (!window.DecompressionStream) throw new Error("Este navegador es muy antiguo para abrir la revisión. Actualícelo o use Chrome.");
    const bin = Uint8Array.from(atob(s), c => c.charCodeAt(0)); txt = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text(); }
  else txt = decodeURIComponent(escape(atob(s)));
  const p = JSON.parse(txt); if (!p || p.t !== "ulama-rev") throw new Error("No es una revisión de Ulama."); return p; }
function espera(t) { dlg(`<h3>${t}</h3><div class="prog"><i style="width:60%;animation:vaiven 1.2s ease-in-out infinite alternate"></i></div>`); }
async function bajarCodigo(c) { const cod = String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); if (cod.length !== 6) return toast("El código tiene 6 letras o números.");
  espera("Abriendo la revisión…");
  try { const j = await post("ulamaRevBajar", { codigo: cod }), p = await descomprimir(j.z, j.paq); cerrarDlg(); conPaquete(p, cod); }
  catch (e) { cerrarDlg(); dlg(`<h3>No se pudo abrir</h3><p class="mb">${esc(e.message)}</p><p class="small muted mb">Si no hay internet, pida al maestro que le comparta la revisión como archivo, o haga la revisión como «Maestro sin Ulama».</p><div class="fila fin"><button class="btn p" id="eX">Entendido</button></div>`, v => v.querySelector("#eX").onclick = cerrarDlg); } }
async function abrirArchivo(f) { if (!f) return; try { const j = JSON.parse(await f.text()); const p = j.t === "ulama-rev" ? j : await descomprimir(j.z, j.paq); cerrarDlg(); conPaquete(p, ""); } catch (e) { toast("No se pudo abrir el archivo: " + esc(e.message), 4000); } }
function conPaquete(p, cod) { const d = p.docente || {}, mail = String(d.correo || "").toLowerCase();
  let m = D.maestros.find(x => mail && x.correo === mail) || D.maestros.find(x => nrm(x.nombre) && nrm(d.nombre).includes(nrm(x.nombre)));
  const e0 = (p.escuelas || [])[0] || {}, e = D.escuelas.find(x => x.cct && x.cct === e0.cct) || (m && escuelasDe(m)[0]);
  ir("nueva", { N: { modo: "ulama", paq: p, cod, maeId: m ? m.id : "", nombre: d.nombre || (m && m.nombre) || "", correo: mail || (m && m.correo) || "", escId: e ? e.id : "", escNombre: e0.nombre || "", cct: e0.cct || "" } }, S.v === "escanear"); }

/* ---------- escáner de QR ---------- */
let CAM = null;
function camStop() { if (CAM) { CAM.vivo = false; (CAM.st && CAM.st.getTracks() || []).forEach(t => t.stop()); CAM = null; } }
VISTAS.escanear = () => barra("Iniciar revisión", "Escanear código QR") + `<main class="wrap"><div class="cam mt"><video id="vid" playsinline muted></video><div class="mira"></div></div>
  <p class="muted small mt" id="camTx" style="text-align:center">Apunte al código QR que le muestra el maestro.</p>
  <div class="fila mt" style="justify-content:center"><button class="btn" id="bCod">${ic("teclado", 18)} Escribir el código</button></div></main>`;
ENLAZAR.escanear = async () => { $("#bCod").onclick = () => { dlgIniciar(); setTimeout(() => $("#o2") && $("#o2").click(), 30); };
  const tx = $("#camTx"), v = $("#vid");
  try { const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }); CAM = { st, vivo: true }; v.srcObject = st; await v.play(); }
  catch (e) { tx.innerHTML = "<b>No se pudo usar la cámara.</b> Dé permiso a la cámara o escriba el código."; return; }
  let det = null; try { if ("BarcodeDetector" in window && (await BarcodeDetector.getSupportedFormats()).includes("qr_code")) det = new BarcodeDetector({ formats: ["qr_code"] }); } catch (e) {}
  if (!det) { try { await cargarJS("jsQR.js"); } catch (e) { tx.textContent = "Sin internet no se pudo preparar el lector. Escriba el código."; return; } }
  const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true });
  const leer = async () => { if (!CAM || !CAM.vivo) return; let txt = null;
    try { if (v.videoWidth) { if (det) { const r = await det.detect(v); txt = r[0] && r[0].rawValue; } else { const w = Math.min(720, v.videoWidth), h = Math.round(w * v.videoHeight / v.videoWidth); c.width = w; c.height = h; x.drawImage(v, 0, 0, w, h); const r = jsQR(x.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" }); txt = r && r.data; } } } catch (e) {}
    if (txt) { const m = String(txt).match(/[#&?]c=([A-Za-z0-9]{6})/) || String(txt).trim().match(/^([A-Za-z0-9]{6})$/); if (m) { navigator.vibrate && navigator.vibrate(60); camStop(); bajarCodigo(m[1]); return; } tx.textContent = "Ese código no es de Ulama. Pida el de «Visita del supervisor»."; }
    setTimeout(leer, 220); };
  leer(); };

/* =================================================================== NUEVA VISITA */
VISTAS.nueva = () => { const N = S.N, p = N.paq, m = maeDe(N.maeId), escs = m ? escuelasDe(m) : D.escuelas;
  return barra(N.modo === "ulama" ? "Revisión con Ulama" : "Maestro sin Ulama", "Datos de la visita") + `<main class="wrap">
  ${p ? `<section class="card mt" style="border-left:6px solid var(--jade)"><div class="eb" style="color:var(--jade);font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase">${ic("check", 16)} Revisión recibida</div><h3 class="mt" style="margin-top:6px">${esc(p.docente.nombre)}</h3>
   <p class="small muted">${esc(p.resumen || "")}<br>Generada ${fCorta(p.gen.slice(0, 10))} a las ${h12(new Date(p.gen).toTimeString().slice(0, 5))}${p.que && !p.que.plan ? " · sin planeaciones" : ""}</p></section>` : ""}
  <section class="card mt"><h3>Maestro(a) que se revisa</h3>
   <label class="campo"><span>Del catálogo</span><select id="nM"><option value="">— Otro (escribir) —</option>${D.maestros.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(x => `<option value="${x.id}" ${x.id === N.maeId ? "selected" : ""}>${esc(x.nombre)}</option>`).join("")}</select></label>
   <div class="dos"><label class="campo"><span>Nombre</span><input id="nN" value="${esc(N.nombre || (m && m.nombre) || "")}"></label><label class="campo"><span>Correo institucional (recibe el informe)</span><input id="nC" type="email" value="${esc(N.correo || (m && m.correo) || "")}" placeholder="nombre@bcedu.mx"></label></div>
   ${N.correo && !/@bcedu\.mx$/i.test(N.correo) ? `<p class="small" style="color:var(--maiz-d)">Este correo no es institucional (@bcedu.mx). Puede corregirlo aquí.</p>` : ""}
   <label class="campo"><span>Escuela</span><select id="nE">${escs.map(e => `<option value="${e.id}" ${e.id === N.escId ? "selected" : ""}>${esc(escNom(e))}${e.cct ? " · " + esc(e.cct) : ""}</option>`).join("")}${m ? `<option value="" disabled>──────────</option>${D.escuelas.filter(e => !escs.includes(e)).map(e => `<option value="${e.id}" ${e.id === N.escId ? "selected" : ""}>${esc(escNom(e))}</option>`).join("")}` : ""}<option value="otra" ${!N.escId && N.modo === "ulama" && N.escNombre ? "selected" : ""}>Otra escuela…</option></select></label>
   <div id="nOtra" ${!N.escId && N.escNombre ? "" : "hidden"}><div class="dos"><label class="campo"><span>Nombre de la escuela</span><input id="nEN" value="${esc(N.escNombre || "")}"></label><label class="campo"><span>C.C.T.</span><input id="nEC" value="${esc(N.cct || "")}" style="text-transform:uppercase"></label></div></div></section>
  <section class="card mt"><h3>La visita</h3><div class="campo"><span>Tipo de visita</span><div class="chips" id="nT">${TIPOS_V.map((t, i) => `<button class="chip" data-t="${esc(t)}" aria-pressed="${(N.tipo || TIPOS_V[0]) === t}">${t}</button>`).join("")}</div></div>
   <label class="campo"><span>Propósito (opcional)</span><textarea id="nP" style="min-height:80px" placeholder="Ej. Dar seguimiento a los acuerdos de la visita anterior y observar una sesión de 3.° grado.">${esc(N.prop || "")}</textarea></label>
   <div class="fila fin"><button class="btn p" id="nOk">${ic("bandera", 18)} Iniciar la revisión</button></div></section></main>`; };
ENLAZAR.nueva = () => { const N = S.N, lee = () => { N.nombre = val("nN"); N.correo = val("nC"); N.prop = val("nP"); N.escNombre = val("nEN"); N.cct = val("nEC"); };
  $("#nM").onchange = e => { lee(); N.maeId = e.target.value; const m = maeDe(N.maeId); if (m) { N.nombre = m.nombre; N.correo = m.correo; N.escId = (escuelasDe(m)[0] || {}).id || ""; } re(); };
  $("#nE").onchange = e => { N.escId = e.target.value === "otra" ? "" : e.target.value; $("#nOtra").hidden = e.target.value !== "otra"; };
  $$("#nT .chip").forEach(b => b.onclick = () => { N.tipo = b.dataset.t; $$("#nT .chip").forEach(x => x.setAttribute("aria-pressed", x === b)); });
  $("#nOk").onclick = async () => { lee(); const nombre = N.nombre.trim(); if (!nombre) return toast("Escriba el nombre del maestro.");
    let e = escDe(N.escId); if (!e && val("nE") === "otra") { if (!N.escNombre.trim()) return toast("Escriba el nombre de la escuela."); e = { id: uid(), nombre: N.escNombre.trim(), cct: N.cct.trim().toUpperCase(), turno: "", domicilio: "", director: "", zona: D.yo.zona }; D.escuelas.push(e); }
    if (!e) return toast("Elija la escuela.");
    let m = maeDe(N.maeId); const correo = N.correo.trim().toLowerCase();
    if (!m) { m = { id: uid(), nombre, correo, escuelas: [e.id] }; D.maestros.push(m); } else { if (correo && correo !== m.correo) m.correo = correo; if (!m.escuelas.includes(e.id)) m.escuelas.push(e.id); }
    const v = { id: uid(), estado: "abierta", modo: N.modo, codigo: N.cod || "", fecha: hoy(), ini: hora(), t0: Date.now(), tipo: N.tipo || TIPOS_V[0], prop: N.prop.trim(),
      maestro: { id: m.id, nombre, correo }, escuela: { id: e.id, nombre: e.nombre, cct: e.cct, turno: e.turno || "", director: dirNombre(e), domicilio: e.domicilio || "" },
      per: N.paq ? N.paq.per : null, resumen: N.paq ? N.paq.resumen : "", asp: {}, fotos: [], clase: { hora: hora(), grupo: "", ses: "" }, cierre: {}, firmas: {} };
    if (N.paq) await paqPut(v.id, N.paq).catch(() => { v.paqLocal = true; });
    D.visitas.push(v); guardar(); ir("visita", { id: v.id }, true); toast("<b>Revisión iniciada.</b> Entre al aspecto que guste.", 3000); }; };

/* =================================================================== ESTADÍSTICAS DEL PAQUETE */
const lunes = k => { const d = dF(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
function stats(p) { if (!p) return null; const escN = id => ((p.escuelas || []).find(e => e.id === id) || {}).nombre || "";
  const G = p.grupos.map(g => { let a = 0, t = 0, falt = 0, ret = 0, just = 0, nreg = 0; const cal = []; g.al.forEach(x => { a += x.r.asis; t += x.r.total; falt += x.r.falt; ret += x.r.ret; just += x.r.just; nreg += x.r.nreg; if (x.cal != null) cal.push(x.cal); });
    return { id: g.id, n: g.n, esc: escN(g.escId), et: `${g.n}${p.escuelas.length > 1 ? " · " + escCorta(escN(g.escId)) : ""}`, alumnos: g.al.filter(x => !x.b).length, clases: g.clases.length, pAsis: t ? a / t : null, prom: prom(cal), falt, ret, just, nreg, evx: g.clases.length ? g.clases.filter(c => c.ev).length / g.clases.length : null }; });
  const dist = { 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, sin: 0 }, comp = { punt: 0, ret: 0, just: 0, falt: 0 }, semM = {}, aten = [], crit = {};
  p.grupos.forEach(g => { g.al.forEach(x => { if (x.cal != null) dist[x.cal]++; else dist.sin++; comp.punt += x.r.asis - x.r.ret; comp.ret += x.r.ret; comp.just += x.r.just; comp.falt += Math.max(0, x.r.total - x.r.asis - x.r.just);
      if (!x.b && ((x.cal != null && x.cal <= 7) || x.r.falt >= 3)) aten.push({ n: x.n, g: g.n, cal: x.cal, falt: x.r.falt, mala: x.r.mala, mot: [x.cal != null && x.cal <= 7 ? `calificación ${x.cal}` : "", x.r.falt >= 3 ? `${x.r.falt} faltas` : "", x.r.mala >= 2 ? `${x.r.mala} clases con mala conducta` : ""].filter(Boolean).join(", ") }); });
    g.clases.forEach((c, i) => { let pr = 0, tt = 0; g.al.forEach(x => { const m = x.m[i]; if (!m || m === " ") return; tt++; if ("PSR".includes(m)) pr++; }); const k = lunes(c.f), o = semM[k] = semM[k] || { p: 0, t: 0 }; o.p += pr; o.t += tt; });
    Object.entries(g.crit || {}).forEach(([k, v]) => { (crit[k] = crit[k] || []).push(v); }); });
  const sem = Object.keys(semM).sort().map(k => ({ k, l: `${dF(k).getDate()} ${MES[dF(k).getMonth()]}`, v: semM[k].t ? semM[k].p / semM[k].t : null })).filter(x => x.v != null);
  const planes = (p.planes || []).map(pl => { let due = 0, dadas = 0; pl.grupos.forEach(gid => { const f = (pl.fechas || {})[gid] || []; due += f.filter(x => x && x <= p.per.fin).length; dadas += ((pl.dadas || {})[gid] || []).length; });
    return { id: pl.id, t: pl.titulo, gr: pl.grupos.map(id => (p.grupos.find(g => g.id === id) || {}).n).filter(Boolean).join(", "), ses: pl.ses.length, due, dadas, cum: due ? Math.min(1, dadas / due) : null, ini: pl.ini, nd: (pl.nd || []).length, inc: pl.inc }; });
  const alumnos = G.reduce((t, g) => t + g.alumnos, 0), totA = comp.punt + comp.ret + comp.just + comp.falt;
  const incT = {}; (p.inc || []).forEach(x => incT[x.tipo] = (incT[x.tipo] || 0) + 1);
  return { G, dist, comp, sem, planes, aten: aten.sort((a, b) => (a.cal ?? 11) - (b.cal ?? 11) || b.falt - a.falt), crit: Object.entries(crit).map(([k, v]) => ({ k, v: prom(v) / 100 })).sort((a, b) => b.v - a.v),
    kpi: { grupos: G.length, alumnos, clases: G.reduce((t, g) => t + g.clases, 0), asis: totA ? (comp.punt + comp.ret) / totA : null, prom: prom(G.filter(g => g.prom != null).map(g => g.prom)), planes: planes.length, cum: prom(planes.filter(x => x.cum != null).map(x => x.cum)), inc: (p.inc || []).length, nee: p.grupos.reduce((t, g) => t + g.al.filter(x => x.nee && !x.b).length, 0), sinCal: dist.sin },
    incT }; }

/* ---------------- gráficas (SVG con colores fijos: sirven en pantalla, PDF e impresión) ---------------- */
const F_SVG = "font-family:Arial,Helvetica,sans-serif";
const colAsis = v => v == null ? "#BDB3A3" : v >= .9 ? "#1E8E5A" : v >= .8 ? "#C98A0B" : "#C2362B";
function svgBarras(items, { w = 500, max = 1, fmt = pct, color = colAsis, titulo = "" } = {}) { const fila = 30, top = titulo ? 30 : 8, h = top + items.length * fila + 8, izq = Math.min(220, Math.max(110, Math.max(...items.map(i => String(i.l).length), 4) * 7.2)), anc = w - izq - 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="${F_SVG}">${titulo ? `<text x="0" y="18" font-size="15" font-weight="700" fill="#1B2740">${esc(titulo)}</text>` : ""}
  ${items.map((it, i) => { const y = top + i * fila, bw = it.v == null ? 0 : Math.max(2, anc * Math.min(1, it.v / max)); return `<text x="${izq - 8}" y="${y + 19}" font-size="12.5" fill="#3B3428" text-anchor="end">${esc(it.l)}</text><rect x="${izq}" y="${y + 5}" width="${anc}" height="18" rx="9" fill="#EFE8DB"/><rect x="${izq}" y="${y + 5}" width="${bw}" height="18" rx="9" fill="${it.c || color(it.v)}"/><text x="${izq + anc + 8}" y="${y + 19}" font-size="12.5" font-weight="700" fill="#1B2740">${it.v == null ? "—" : fmt(it.v)}</text>`; }).join("")}</svg>`; }
function svgColumnas(items, { w = 420, h = 230, titulo = "" } = {}) { const top = titulo ? 34 : 12, base = h - 30, alto = base - top - 16, max = Math.max(1, ...items.map(i => i.v)), cw = (w - 20) / items.length;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="${F_SVG}">${titulo ? `<text x="0" y="18" font-size="15" font-weight="700" fill="#1B2740">${esc(titulo)}</text>` : ""}<line x1="10" y1="${base}" x2="${w - 10}" y2="${base}" stroke="#CFC5B3"/>
  ${items.map((it, i) => { const bh = alto * it.v / max, x = 10 + i * cw + cw * .18, bw = cw * .64; return `<rect x="${x}" y="${base - bh}" width="${bw}" height="${bh}" rx="6" fill="${it.c}"/><text x="${x + bw / 2}" y="${base - bh - 5}" font-size="13" font-weight="700" text-anchor="middle" fill="#1B2740">${it.v}</text><text x="${x + bw / 2}" y="${base + 18}" font-size="12.5" text-anchor="middle" fill="#3B3428">${esc(it.l)}</text>`; }).join("")}</svg>`; }
function svgLinea(items, { w = 560, h = 230, titulo = "" } = {}) { if (items.length < 2) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 60" width="100%" style="${F_SVG}"><text x="0" y="18" font-size="15" font-weight="700" fill="#1B2740">${esc(titulo)}</text><text x="0" y="44" font-size="13" fill="#5E5446">Aún no hay suficientes semanas con registro.</text></svg>`;
  const top = titulo ? 34 : 12, izq = 40, base = h - 30, alto = base - top, min = Math.max(0, Math.floor(Math.min(...items.map(i => i.v)) * 10) / 10 - .1), sx = i => izq + i * (w - izq - 16) / (items.length - 1), sy = v => base - alto * (v - min) / (1 - min);
  const pts = items.map((it, i) => `${sx(i)},${sy(it.v)}`).join(" "), cada = Math.ceil(items.length / 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="${F_SVG}">${titulo ? `<text x="0" y="18" font-size="15" font-weight="700" fill="#1B2740">${esc(titulo)}</text>` : ""}
  ${[min, (min + 1) / 2, 1].map(v => `<line x1="${izq}" y1="${sy(v)}" x2="${w - 16}" y2="${sy(v)}" stroke="#EAE2D3"/><text x="${izq - 6}" y="${sy(v) + 4}" font-size="11" text-anchor="end" fill="#5E5446">${Math.round(v * 100)}%</text>`).join("")}
  <polygon points="${sx(0)},${base} ${pts} ${sx(items.length - 1)},${base}" fill="#1F3A6B" opacity=".08"/><polyline points="${pts}" fill="none" stroke="#1F3A6B" stroke-width="3" stroke-linejoin="round"/>
  ${items.map((it, i) => `<circle cx="${sx(i)}" cy="${sy(it.v)}" r="4.5" fill="#fff" stroke="#1F3A6B" stroke-width="2.5"/>${i % cada === 0 || i === items.length - 1 ? `<text x="${sx(i)}" y="${base + 18}" font-size="11" text-anchor="middle" fill="#3B3428">${esc(it.l)}</text>` : ""}`).join("")}</svg>`; }
function svgDona(partes, { w = 420, h = 210, titulo = "" } = {}) { const tot = partes.reduce((t, p) => t + p.v, 0) || 1, cx = 100, cy = (titulo ? 30 : 0) + 88, r = 70, rr = 42; let a0 = -Math.PI / 2;
  const arcos = partes.filter(p => p.v).map(p => { const a1 = a0 + 2 * Math.PI * p.v / tot, gr = a1 - a0 > Math.PI ? 1 : 0, P = (a, R) => `${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}`;
    const d = p.v === tot ? `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0M${cx - rr},${cy}a${rr},${rr} 0 1,1 ${2 * rr},0a${rr},${rr} 0 1,1 ${-2 * rr},0` : `M${P(a0, r)}A${r},${r} 0 ${gr},1 ${P(a1, r)}L${P(a1, rr)}A${rr},${rr} 0 ${gr},0 ${P(a0, rr)}Z`; a0 = a1; return `<path d="${d}" fill="${p.c}" fill-rule="evenodd"/>`; }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="${F_SVG}">${titulo ? `<text x="0" y="18" font-size="15" font-weight="700" fill="#1B2740">${esc(titulo)}</text>` : ""}${arcos}
  <text x="${cx}" y="${cy + 7}" font-size="20" font-weight="700" text-anchor="middle" fill="#1B2740">${Math.round(100 * partes[0].v / tot + (partes[1] ? 100 * partes[1].v / tot : 0))}%</text>
  ${partes.map((p, i) => `<rect x="200" y="${cy - 52 + i * 28}" width="14" height="14" rx="4" fill="${p.c}"/><text x="222" y="${cy - 40 + i * 28}" font-size="13" fill="#1B2740">${esc(p.l)}: <tspan font-weight="700">${p.v}</tspan> (${Math.round(100 * p.v / tot)}%)</text>`).join("")}</svg>`; }
const DIST_C = { 6: "#C2362B", 7: "#E07B39", 8: "#C98A0B", 9: "#5FA36B", 10: "#1E8E5A" };
function graficas(s) { return {
  asis: svgBarras(s.G.map(g => ({ l: g.et, v: g.pAsis })), { titulo: "Asistencia por grupo" }),
  dist: svgColumnas([6, 7, 8, 9, 10].map(k => ({ l: String(k), v: s.dist[k], c: DIST_C[k] })), { titulo: "Calificaciones estimadas (alumnos)" }),
  sem: svgLinea(s.sem, { titulo: "Asistencia semana por semana" }),
  comp: svgDona([{ l: "Asistencia puntual", v: s.comp.punt, c: "#1E8E5A" }, { l: "Retardo", v: s.comp.ret, c: "#C98A0B" }, { l: "Falta justificada", v: s.comp.just, c: "#6F8FC4" }, { l: "Falta", v: s.comp.falt, c: "#C2362B" }], { titulo: "Registros de asistencia" }),
  prom: svgBarras(s.G.map(g => ({ l: g.et, v: g.prom })), { titulo: "Promedio de calificación por grupo", max: 10, fmt: v => v.toFixed(1), color: v => v == null ? "#BDB3A3" : v >= 8.5 ? "#1E8E5A" : v >= 7.5 ? "#C98A0B" : "#C2362B" }),
  crit: s.crit.length ? svgBarras(s.crit.slice(0, 12).map(c => ({ l: c.k.length > 34 ? c.k.slice(0, 33) + "…" : c.k, v: c.v })), { titulo: "Logro por criterio de evaluación", color: v => v >= .75 ? "#1E8E5A" : v >= .5 ? "#C98A0B" : "#C2362B" }) : "" }; }
function svgPng(svg, w = 1280) { return new Promise(ok => { const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/), vw = m ? +m[1] : 640, vh = m ? +m[2] : 240, im = new Image();
  im.onload = () => { const c = document.createElement("canvas"); c.width = w; c.height = Math.round(w * vh / vw); const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/png")); };
  im.onerror = () => ok(""); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace('width="100%"', `width="${vw}" height="${vh}"`)); }); }

/* =================================================================== PANEL DE LA VISITA */
const aspV = (v, k) => v.asp[k] = v.asp[k] || { sem: "", ind: {}, nota: "", com: {} };
function sugerido(v, k) { const a = v.asp[k], L = a ? Object.values(a.ind).filter(x => x !== "" && x != null) : []; if (!L.length) return ""; const r = L.reduce((t, x) => t + +x, 0) / (2 * L.length); return r >= .8 ? "v" : r >= .5 ? "a" : "r"; }
const semDe = (v, k) => (v.asp[k] && v.asp[k].sem) || "";
function semGeneral(v) { const L = ASP.map(a => semDe(v, a.k)).filter(Boolean); if (!L.length) return ""; const p = L.reduce((t, s) => t + (s === "v" ? 2 : s === "a" ? 1 : 0), 0) / (2 * L.length); return v.cierre && v.cierre.val ? v.cierre.val : p >= .8 ? "v" : p >= .5 ? "a" : "r"; }
const visitaV = () => visDe(S.id);
VISTAS.visita = () => { const v = visitaV(); if (!v) return VISTAS.inicio(); if (v.estado === "cerrada") { S = { v: "informe", id: v.id }; return VISTAS.informe(); }
  const conDatos = v.modo === "ulama";
  return barra("Visita en curso", esc(corto(v.maestro.nombre)), `<button class="btn s" id="bFoto" aria-label="Tomar evidencia">${ic("camara", 18)}</button>`) + `<main class="wrap">
  <section class="vis-cab mt"><div class="fila" style="align-items:flex-start;gap:14px"><span class="vis-av">${ic("persona", 26)}</span><div style="flex:1;min-width:0"><h2>${esc(v.maestro.nombre)}</h2>
   <p>${esc(v.escuela.nombre)}${v.escuela.cct ? " · " + esc(v.escuela.cct) : ""}${v.escuela.turno ? " · " + esc(v.escuela.turno) : ""}</p>
   <p class="mt" style="margin-top:6px"><span class="tag a">${esc(v.tipo)}</span> <span class="tag ${conDatos ? "" : "m"}">${conDatos ? "Con registros de Ulama" : "Sin Ulama · revisión directa"}</span></p></div></div>
   <div class="vis-reloj"><span>${ic("reloj", 16)} Inició ${h12(v.ini)}</span><b id="visReloj">${durTxt(minutos(v.t0))}</b><span>${v.fotos.length} evidencias</span></div></section>
  ${conDatos ? `<button class="tablero-p mt" id="bTab"><span class="ic">${ic("eval", 22)}</span><span class="tx"><b>Resumen y gráficas</b><small>${esc(v.resumen || "Rendimiento, asistencia y planeación de sus grupos")}</small></span>${ic("sig", 18)}</button>` : ""}
  <h2 class="sec-t">Aspectos a revisar<small>Entre al que guste, en el orden que quiera</small></h2><div class="asp-l">
  ${ASP.map(a => { const x = v.asp[a.k] || {}, n = Object.values(x.ind || {}).filter(y => y !== "" && y != null).length, s = x.sem, f = v.fotos.filter(f => f.asp === a.k).length;
    return `<button class="asp" data-a="${a.k}" style="--c:${a.c};--c-s:${a.s}"><span class="ic">${ic(a.ic, 22)}</span><span class="tx"><b>${a.n}</b><small>${n}/${a.ind.length} indicadores${f ? ` · ${f} foto${f > 1 ? "s" : ""}` : ""}${x.nota ? " · con observaciones" : ""}</small></span><span class="sem-p" style="${s ? `background:${SEM[s].s};color:${SEM[s].c}` : ""}">${semDot(s)} ${s ? SEM[s].n : "Sin valorar"}</span></button>`; }).join("")}</div>
  <div class="card mt"><h3>Evidencias</h3>${v.fotos.length ? `<div class="fotos" id="fGal"></div>` : `<p class="small muted">Use el botón de la cámara arriba en cualquier momento, o dentro de cada aspecto.</p>`}</div>
  <div class="fila mt2" style="justify-content:space-between"><button class="btn r s" id="bDesc">${ic("basura", 16)} Descartar visita</button><button class="btn p" id="bCierre">${ic("bandera", 18)} Final · cierre de visita formativa</button></div>
  <input type="file" id="fCam" accept="image/*" capture="environment" hidden><input type="file" id="fGalI" accept="image/*" multiple hidden></main>`; };
ENLAZAR.visita = () => { const v = visitaV(); if (!v || v.estado !== "abierta") return; $("#bTab") && ($("#bTab").onclick = () => ir("tablero", { id: v.id }));
  $$("[data-a]").forEach(b => b.onclick = () => ir("aspecto", { id: v.id, k: b.dataset.a })); $("#bCierre").onclick = () => ir("cierre", { id: v.id });
  $("#bDesc").onclick = async () => { if (!(await confirmar("Se borrará esta visita con sus observaciones y fotos.", "Descartar"))) return; v.fotos.forEach(f => fotoDel(f.id)); D.visitas = D.visitas.filter(x => x !== v); guardar(); ir("inicio", {}, true); };
  enlazarFotos(v, null); pintarGaleria(v, null, "#fGal"); }

/* ---------- evidencias fotográficas ---------- */
function comprimir(file, max = 1400, q = .74) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", q)); }; im.onerror = () => no(new Error("imagen")); im.src = r.result; }; r.onerror = no; r.readAsDataURL(file); }); }
async function agregarFotos(v, files, asp) { if (!files || !files.length) return; let n = 0;
  for (const f of files) { try { const u = await comprimir(f), id = uid(); await fotoPut(id, u).catch(() => { FOTO[id] = u; }); v.fotos.push({ id, asp: asp || "", t: "", h: hora() }); n++; } catch (e) {} }
  guardar(); re(); if (n) dlgPie(v, v.fotos[v.fotos.length - 1].id, true); }
function dlgPie(v, id, nueva) { const f = v.fotos.find(x => x.id === id); if (!f) return;
  dlg(`<h3>${nueva ? "Evidencia agregada" : "Evidencia"}</h3><img id="pImg" alt="" style="width:100%;max-height:46vh;object-fit:contain;border-radius:14px;background:#111">
   <label class="campo mt"><span>¿Qué muestra? (aparece en el informe)</span><input id="pT" value="${esc(f.t)}" placeholder="Ej. Calentamiento en el patio con 2.° B"></label>
   <label class="campo"><span>Aspecto</span><select id="pA"><option value="">General</option>${ASP.map(a => `<option value="${a.k}" ${a.k === f.asp ? "selected" : ""}>${a.n}</option>`).join("")}</select></label>
   <div class="fila fin"><button class="btn r" id="pX" style="margin-right:auto">${ic("basura", 16)} Quitar</button><button class="btn p" id="pOk">${ic("check", 18)} Listo</button></div>`, async w => {
    w.querySelector("#pImg").src = await fotoGet(id) || ""; w.querySelector("#pOk").onclick = () => { f.t = val("pT").trim(); f.asp = val("pA"); guardar(); cerrarDlg(); re(); };
    w.querySelector("#pX").onclick = async () => { if (!(await confirmar("Se quitará esta foto de la visita.", "Quitar"))) return dlgPie(v, id); fotoDel(id); v.fotos = v.fotos.filter(x => x !== f); guardar(); re(); }; }); }
function enlazarFotos(v, asp) { const c = $("#fCam"), g = $("#fGalI"); if (!c) return; c.onchange = e => { agregarFotos(v, [...e.target.files], asp); e.target.value = ""; }; g.onchange = e => { agregarFotos(v, [...e.target.files], asp); e.target.value = ""; };
  $("#bFoto") && ($("#bFoto").onclick = () => c.click()); $("#bFotoA") && ($("#bFotoA").onclick = () => c.click()); $("#bGalA") && ($("#bGalA").onclick = () => g.click()); }
async function pintarGaleria(v, asp, sel) { const box = $(sel); if (!box) return; const L = v.fotos.filter(f => asp == null || f.asp === asp);
  box.innerHTML = L.map(f => `<button class="foto" data-f="${f.id}"><img alt="" data-src="${f.id}"><span>${esc(f.t || "Sin descripción")}<small>${esc(f.h)}${asp == null && f.asp ? " · " + aspDe(f.asp).n : ""}</small></span></button>`).join("") || `<p class="small muted">Sin fotos en este aspecto.</p>`;
  box.querySelectorAll("[data-f]").forEach(b => b.onclick = () => dlgPie(v, b.dataset.f)); for (const i of box.querySelectorAll("img[data-src]")) i.src = await fotoGet(i.dataset.src) || ""; }
setInterval(() => { const t = $("#visReloj"), v = S.id && visDe(S.id); if (t && v) t.textContent = durTxt(minutos(v.t0)); }, 20000);

/* =================================================================== TABLERO (resumen y gráficas) */
VISTAS.tablero = () => barra("Resumen de registros", "Gráficas y resumen") + `<main class="wrap" id="tabM"><p class="muted mt">Calculando…</p></main>`;
ENLAZAR.tablero = async () => { const v = visitaV(), p = await paqGet(v.id), m = $("#tabM"); if (!p) { m.innerHTML = `<div class="vacio mt">No se encontró la revisión en este dispositivo.</div>`; return; }
  const s = stats(p), g = graficas(s), K = s.kpi;
  m.innerHTML = `<p class="small muted mt">${esc(p.per.n)} · ${fCorta(p.per.ini)} al ${fCorta(p.per.fin)} · datos del ${fCorta(p.gen.slice(0, 10))}</p>
  <div class="kpis mt">${[["Asistencia", pct(K.asis), colAsis(K.asis)], ["Promedio", K.prom == null ? "—" : K.prom.toFixed(1), "#1F3A6B"], ["Clases dadas", K.clases, "#1B7560"], ["Alumnos", K.alumnos, "#6B3F7A"], ["Avance de planeación", pct(K.cum), K.cum == null ? "#8a7f70" : K.cum >= .85 ? "#1E8E5A" : K.cum >= .65 ? "#C98A0B" : "#C2362B"], ["Requieren atención", s.aten.length, s.aten.length ? "#C2362B" : "#1E8E5A"]]
    .map(([t, n, c]) => `<div class="kpi"><b style="color:${c}">${n}</b><span>${t}</span></div>`).join("")}</div>
  <div class="graf2 mt"><div class="card">${g.asis}</div><div class="card">${g.comp}</div><div class="card">${g.dist}</div><div class="card">${g.prom}</div></div><div class="card mt">${g.sem}</div>${g.crit ? `<div class="card mt">${g.crit}</div>` : ""}
  <h2 class="sec-t">Por grupo</h2><div class="tabla-c"><table class="tabla"><thead><tr><th>Grupo</th><th>Alumnos</th><th>Clases</th><th>Asistencia</th><th>Faltas</th><th>Retardos</th><th>Registros de evaluación</th><th>Promedio</th></tr></thead><tbody>
   ${s.G.map(x => `<tr><td><b>${esc(x.et)}</b></td><td>${x.alumnos}</td><td>${x.clases}</td><td style="color:${colAsis(x.pAsis)};font-weight:700">${pct(x.pAsis)}</td><td>${x.falt}</td><td>${x.ret}</td><td>${x.nreg}${x.evx != null ? ` <small class="muted">(${pct(x.evx)} de las clases)</small>` : ""}</td><td><b>${x.prom == null ? "—" : x.prom.toFixed(1)}</b></td></tr>`).join("")}</tbody></table></div>
  ${s.aten.length ? `<h2 class="sec-t">Alumnos que requieren atención<small>Calificación estimada de 7 o menos, o 3 faltas o más</small></h2><div class="tabla-c"><table class="tabla"><thead><tr><th>Alumno(a)</th><th>Grupo</th><th>Calif.</th><th>Motivo</th></tr></thead><tbody>${s.aten.map(a => `<tr><td>${esc(a.n)}</td><td>${esc(a.g)}</td><td><b>${a.cal ?? "—"}</b></td><td>${esc(a.mot)}</td></tr>`).join("")}</tbody></table></div>` : ""}
  <p class="small muted mt">${K.nee ? `${K.nee} alumno${K.nee > 1 ? "s" : ""} con necesidad específica registrada (sus datos no se comparten). ` : ""}${K.inc ? `${K.inc} incidente${K.inc > 1 ? "s" : ""} en la bitácora del periodo. ` : ""}${p.resp ? `Último respaldo del docente: ${fCorta(p.resp)}.` : ""}</p>`; };

/* =================================================================== ASPECTO */
VISTAS.aspecto = () => { const v = visitaV(), a = aspDe(S.k); if (!v || !a) return VISTAS.inicio(); const x = aspV(v, a.k), sug = sugerido(v, a.k);
  return barra("Visita · " + esc(corto(v.maestro.nombre)), a.n, `<button class="btn s" id="bFoto" aria-label="Tomar evidencia">${ic("camara", 18)}</button>`) + `<main class="wrap">
  <section class="card mt" style="border-top:5px solid ${a.c}"><h3>Semáforo</h3><p class="small muted mb">${sug ? `Por los indicadores se sugiere <b style="color:${SEM[sug].c}">${SEM[sug].n}</b>. Usted decide.` : "Elija cómo encuentra este aspecto."}</p>
   <div class="semaforo">${Object.entries(SEM).map(([k, s]) => `<button data-sem="${k}" aria-pressed="${x.sem === k}" style="--c:${s.c};--c-s:${s.s}"><span class="luz"></span><b>${s.n}</b></button>`).join("")}</div></section>
  ${v.modo === "ulama" ? `<section id="aDat" class="mt"><p class="muted small">Cargando los registros del maestro…</p></section>` : ""}
  ${a.k === "clase" ? `<section class="card mt"><h3>Clase observada</h3><div class="dos"><label class="campo"><span>Grupo</span><input id="cG" value="${esc(v.clase.grupo)}" list="cGl" placeholder="Ej. 3.° A"><datalist id="cGl"></datalist></label><label class="campo"><span>Hora</span><input type="time" id="cH" value="${esc(v.clase.hora)}"></label></div>
   <label class="campo"><span>Sesión o tema</span><input id="cS" value="${esc(v.clase.ses)}" placeholder="Ej. Juegos de persecución · coordinación"></label></section>` : ""}
  <section class="card mt"><h3>Indicadores</h3><p class="small muted mb">Marque lo que observa. Puede agregar un comentario en cada uno.</p><div class="ind-l">
   ${a.ind.map((t, i) => { const r = x.ind[i], c = (x.com || {})[i] || ""; return `<div class="ind"><p>${esc(t)}</p><div class="ind-r">${RESP.map(([n, l]) => `<button class="chip ${n === 2 ? "si" : n === 1 ? "pa" : "no"}" data-i="${i}" data-r="${n}" aria-pressed="${r === n}">${l}</button>`).join("")}<button class="chip com" data-c="${i}" aria-pressed="${!!c}">${ic("lapiz", 14)}</button></div>${c ? `<p class="small com-t">${esc(c)}</p>` : ""}</div>`; }).join("")}</div></section>
  <section class="card mt"><h3>Observaciones</h3><textarea id="aNota" class="area" placeholder="Lo que observa, lo que conversó con el maestro, sugerencias para este aspecto…">${esc(x.nota)}</textarea></section>
  <section class="card mt"><div class="fila" style="justify-content:space-between"><h3>Evidencias</h3><span class="fila" style="gap:6px"><button class="btn s p" id="bFotoA">${ic("camara", 16)} Tomar foto</button><button class="btn s" id="bGalA">${ic("subir", 16)} Galería</button></span></div><div class="fotos mt" id="fAsp"></div></section>
  <div class="fila fin mt2"><button class="btn o" id="bListo">${ic("check", 18)} Listo, volver a la visita</button></div>
  <input type="file" id="fCam" accept="image/*" capture="environment" hidden><input type="file" id="fGalI" accept="image/*" multiple hidden></main>`; };
ENLAZAR.aspecto = () => { const v = visitaV(), a = aspDe(S.k); if (!v) return; const x = aspV(v, a.k);
  $$("[data-sem]").forEach(b => b.onclick = () => { x.sem = x.sem === b.dataset.sem ? "" : b.dataset.sem; guardar(); re(); });
  $$("[data-r]").forEach(b => b.onclick = () => { const i = b.dataset.i, n = +b.dataset.r; if (x.ind[i] === n) delete x.ind[i]; else x.ind[i] = n; if (!x.semMan) { const s = sugerido(v, a.k); if (s) x.sem = s; } guardar(); re(); });
  $$("[data-sem]").forEach(b => b.addEventListener("click", () => { x.semMan = true; guardar(); }));
  $$("[data-c]").forEach(b => b.onclick = () => { const i = b.dataset.c; x.com = x.com || {}; dlg(`<h3>Comentario</h3><p class="small muted mb">${esc(a.ind[i])}</p><textarea id="cT" class="area">${esc(x.com[i] || "")}</textarea><div class="fila fin mt"><button class="btn" id="cX">Cancelar</button><button class="btn p" id="cOk">Guardar</button></div>`, w => {
    setTimeout(() => w.querySelector("#cT").focus(), 60); w.querySelector("#cX").onclick = cerrarDlg; w.querySelector("#cOk").onclick = () => { const t = val("cT").trim(); if (t) x.com[i] = t; else delete x.com[i]; guardar(); re(); }; }); });
  $("#aNota").onchange = e => { x.nota = e.target.value; guardar(); };
  if ($("#cG")) { ["cG", "cH", "cS"].forEach(id => $("#" + id).onchange = () => { v.clase = { grupo: val("cG"), hora: val("cH"), ses: val("cS") }; guardar(); }); }
  $("#bListo").onclick = () => history.back(); enlazarFotos(v, a.k); pintarGaleria(v, a.k, "#fAsp"); datosAspecto(v, a); };

/* datos del maestro (solo si revisó con Ulama) dentro de cada aspecto */
async function datosAspecto(v, a) { const box = $("#aDat"); if (!box) return; const p = await paqGet(v.id); if (!p) { box.innerHTML = ""; return; } const s = stats(p), g = graficas(s);
  const grSel = (k, id) => `<div class="chips mb">${p.grupos.map(x => `<button class="chip" data-g${k}="${x.id}" aria-pressed="${x.id === id}">${esc(s.G.find(y => y.id === x.id).et)}</button>`).join("")}</div>`;
  const dl = $("#cGl"); if (dl) dl.innerHTML = p.grupos.map(x => `<option value="${esc(x.n)}">`).join("");
  if (a.k === "planeacion") { box.innerHTML = `<section class="card"><h3>Planeaciones del maestro</h3><p class="small muted mb">${s.planes.length} planeaciones${s.kpi.cum != null ? ` · avance promedio ${pct(s.kpi.cum)} de las sesiones que ya tocaban` : ""}. Toque una para verla completa.</p>
    <div class="lista">${s.planes.map(x => `<button class="it btnit" data-pl="${x.id}"><span class="av">${ic("plan", 18)}</span><span class="tx"><b>${esc(x.t)}</b><small>${esc(x.gr)} · ${x.ses} sesiones · desde ${fCorta(x.ini)}${x.nd ? ` · ${x.nd} no se dieron` : ""}${x.inc ? ` · ${x.inc} con ajustes` : ""}</small><span class="barra-p"><i style="width:${Math.round(100 * (x.cum || 0))}%;background:${x.cum == null ? "#BDB3A3" : x.cum >= .85 ? "#1E8E5A" : x.cum >= .65 ? "#C98A0B" : "#C2362B"}"></i></span></span><span class="tag ${x.cum == null ? "g" : ""}">${x.cum == null ? "Por iniciar" : `${x.dadas}/${x.due}`}</span></button>`).join("") || `<div class="vacio">El maestro no compartió planeaciones.</div>`}</div></section>`;
    box.querySelectorAll("[data-pl]").forEach(b => b.onclick = () => ir("plan", { id: v.id, pl: b.dataset.pl })); return; }
  if (a.k === "evaluacion") { const gid = S.ge || p.grupos[0] && p.grupos[0].id, gr = p.grupos.find(x => x.id === gid);
    const cr = gr ? Object.entries(gr.crit || {}).map(([k, x]) => ({ l: k.length > 34 ? k.slice(0, 33) + "…" : k, v: x / 100 })) : [];
    box.innerHTML = `<section class="card"><h3>Evaluación continua y formativa</h3><div class="graf2 mb"><div>${g.dist}</div><div>${g.prom}</div></div>${grSel("e", gid)}
     ${gr ? `${cr.length ? svgBarras(cr, { titulo: "Logro por criterio · " + gr.n, color: x => x >= .75 ? "#1E8E5A" : x >= .5 ? "#C98A0B" : "#C2362B" }) : `<p class="small muted">Este grupo no tiene registros por criterio en el periodo.</p>`}
     <div class="tabla-c mt"><table class="tabla"><thead><tr><th>Alumno(a)</th><th>Registros</th><th>Calif.</th><th>Tendencia</th><th>Valoración</th></tr></thead><tbody>${gr.al.filter(x => !x.b).map(x => `<tr><td>${esc(x.n)}</td><td>${x.r.nreg}</td><td><b style="color:${x.cal == null ? "#8a7f70" : DIST_C[x.cal]}">${x.cal ?? "—"}</b></td><td>${x.r.tend > .15 ? "↗ mejora" : x.r.tend < -.15 ? "↘ baja" : "→"}</td><td class="small">${esc(x.val || "")}</td></tr>`).join("")}</tbody></table></div>` : ""}</section>`;
    box.querySelectorAll("[data-ge]").forEach(b => b.onclick = () => { S.ge = b.dataset.ge; datosAspecto(v, a); }); return; }
  if (a.k === "asistencia") { const gid = S.ga || p.grupos[0] && p.grupos[0].id, gr = p.grupos.find(x => x.id === gid), meses = gr ? [...new Set(gr.clases.map(c => c.f.slice(0, 7)))] : [], mes = meses.includes(S.ma) ? S.ma : meses[meses.length - 1];
    const idx = gr ? gr.clases.map((c, i) => [c, i]).filter(([c]) => c.f.slice(0, 7) === mes) : [], COL = { P: "#1E8E5A", S: "#1E8E5A", R: "#C98A0B", J: "#6F8FC4", F: "#C2362B", "-": "#C2362B" }, TXT = { P: "•", S: "S", R: "R", J: "J", F: "F", "-": "F", " ": "" };
    box.innerHTML = `<section class="card"><h3>Listas de asistencia</h3><div class="graf2 mb"><div>${g.asis}</div><div>${g.comp}</div></div>${g.sem}${grSel("a", gid)}
     ${gr && meses.length ? `<div class="chips mb">${meses.map(m => `<button class="chip" data-ma="${m}" aria-pressed="${m === mes}">${MES_L[+m.slice(5) - 1]}</button>`).join("")}</div>
     <div class="tabla-c"><table class="tabla lista-a"><thead><tr><th>Alumno(a)</th>${idx.map(([c]) => `<th class="c">${dF(c.f).getDate()}<br><small>${DSEM[dF(c.f).getDay()]}</small></th>`).join("")}<th class="c">%</th></tr></thead><tbody>
     ${gr.al.filter(x => !x.b).map(x => { let pr = 0, tt = 0; idx.forEach(([, i]) => { const m = x.m[i]; if (m && m !== " ") { tt++; if ("PSR".includes(m)) pr++; } }); return `<tr><td>${esc(x.n)}</td>${idx.map(([, i]) => { const m = x.m[i] || " "; return `<td class="c" style="color:${COL[m] || "#999"};font-weight:700">${TXT[m] ?? m}</td>`; }).join("")}<td class="c"><b>${tt ? Math.round(100 * pr / tt) + "%" : "—"}</b></td></tr>`; }).join("")}</tbody></table></div>
     <p class="small muted mt">• asistió · R retardo · S sin uniforme · J falta justificada · F falta (o sin marcar)</p>` : `<p class="small muted">Sin clases registradas en el periodo.</p>`}</section>`;
    box.querySelectorAll("[data-ga]").forEach(b => b.onclick = () => { S.ga = b.dataset.ga; S.ma = null; datosAspecto(v, a); }); box.querySelectorAll("[data-ma]").forEach(b => b.onclick = () => { S.ma = b.dataset.ma; datosAspecto(v, a); }); return; }
  if (a.k === "seguridad" || a.k === "documentacion") { const T = Object.entries(s.incT);
    box.innerHTML = `<section class="card"><h3>${a.k === "seguridad" ? "Bitácora de incidentes" : "Lo que registra en Ulama"}</h3>${a.k === "seguridad" ? (T.length ? svgBarras(T.map(([k, n]) => ({ l: k, v: n })), { max: Math.max(...T.map(t => t[1])), fmt: n => String(n), color: () => "#A3322A" }) + `<p class="small muted mt">${s.kpi.inc} incidentes en el periodo · ${(p.inc || []).filter(x => x.acu).length} con acuerdos registrados.</p>` : `<p class="small muted">Sin incidentes registrados en el periodo.</p>`)
      : `<ul class="small" style="margin:0;padding-left:18px">${p.escuelas.map(e => `<li><b>${esc(e.nombre)}</b>: ${e.horario ? "horario registrado" : "<span style='color:#C2362B'>sin horario</span>"} · días ${e.dias.map(d => DSEM[d]).join(", ") || "—"} · director(a): ${esc(e.dir || "—")}</li>`).join("")}<li>${s.kpi.grupos} grupos con docente de grupo ${p.grupos.filter(g => g.correo).length === p.grupos.length ? "y su correo" : `(${p.grupos.filter(g => !g.correo).length} sin correo)`}</li><li>Último respaldo: ${p.resp ? fCorta(p.resp) : "sin registro"}</li><li>${p.firma ? "Tiene firma digital" : "Sin firma digital"}</li></ul>`}</section>`; return; }
  if (a.k === "clase") { box.innerHTML = ""; } }

/* ---------- planeación completa ---------- */
VISTAS.plan = () => barra("Planeación", "Ver planeación") + `<main class="wrap" id="plM"><p class="muted mt">Cargando…</p></main>`;
ENLAZAR.plan = async () => { const v = visitaV(), p = await paqGet(v.id), pl = p && p.planes.find(x => x.id === S.pl), m = $("#plM"); if (!pl) { m.innerHTML = `<div class="vacio mt">No se encontró.</div>`; return; }
  const gN = id => (p.grupos.find(g => g.id === id) || {}).n || "", g0 = pl.grupos[0], f = (pl.fechas || {})[g0] || [], dadas = new Set(((pl.dadas || {})[g0]) || []);
  m.innerHTML = `<div class="hoja-doc mt"><div class="doc"><h2 style="margin-top:0">${esc(pl.titulo)}</h2><div class="datos"><span><b>Grupos:</b> ${pl.grupos.map(gN).join(", ")}</span><span><b>Inicia:</b> ${fCorta(pl.ini)}</span><span><b>Sesiones:</b> ${pl.ses.length} de ${pl.min} min</span></div>
   <table><tbody><tr><th style="width:22%">Contenido</th><td>${esc(pl.cont)}</td></tr>${Object.entries(pl.pdas || {}).map(([gr, t]) => `<tr><th>PDA ${gr}.°</th><td>${esc(t)}</td></tr>`).join("")}${pl.proposito ? `<tr><th>Propósito</th><td>${esc(pl.proposito)}</td></tr>` : ""}${pl.inc ? `<tr><th>Inclusión</th><td>${pl.inc} alumno(s) con ajuste razonable o adecuación</td></tr>` : ""}</tbody></table>
   <h2>Secuencia de sesiones</h2><table><thead><tr><th class="c">No.</th><th>Fecha (${esc(gN(g0))})</th><th>Sesión</th><th>Inicio</th><th>Desarrollo</th><th>Cierre</th><th>Evaluación</th></tr></thead><tbody>
   ${pl.ses.map((s, i) => `<tr><td class="c">${i + 1}${dadas.has(s.id) ? "<br>✓" : ""}</td><td>${f[i] ? fCorta(f[i]) : ""}</td><td><b>${esc(s.t)}</b><br>${esc(s.est || "")}. ${esc(s.para || "")}</td><td>${esc(s.ini)}</td><td>${esc(s.des)}</td><td>${esc(s.cie)}</td><td>${esc(s.ev || "")}</td></tr>`).join("")}</tbody></table>
   ${(pl.nd || []).length ? `<h2>Clases que no se dieron</h2><table><thead><tr><th>Fecha</th><th>Grupo</th><th>Motivo</th><th>Qué se hizo</th></tr></thead><tbody>${pl.nd.map(x => `<tr><td>${fCorta(x.f)}</td><td>${esc(gN(x.g))}</td><td>${esc(x.m)}</td><td>${esc(x.a)}</td></tr>`).join("")}</tbody></table>` : ""}
   ${pl.crit.length ? `<h2>Rúbrica</h2><table><thead><tr><th>Criterio</th><th>Requiere apoyo</th><th>En proceso</th><th>Logrado</th><th>Destacado</th></tr></thead><tbody>${pl.crit.map(c => `<tr><td><b>${esc(c.c)}</b></td>${[1, 2, 3, 4].map(k => `<td>${esc((c.d || {})[k] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>` : ""}
   <p class="nota">✓ = sesión ya dada en ese grupo.</p></div></div>`; };

/* =================================================================== CIERRE */
const sugerencias = (v, p) => { const s = p ? stats(p) : null, fort = [], areas = [];
  ASP.forEach(a => { const x = v.asp[a.k]; if (!x) return; a.ind.forEach((t, i) => { if (x.ind[i] === 2) fort.push(t); else if (x.ind[i] === 0) areas.push(t); else if (x.ind[i] === 1) areas.push(t + " (parcialmente)"); }); });
  if (s) { const K = s.kpi; if (K.asis != null && K.asis >= .9) fort.push(`Asistencia de sus grupos de ${pct(K.asis)}`); else if (K.asis != null && K.asis < .8) areas.push(`Asistencia de sus grupos de ${pct(K.asis)}: dar seguimiento a inasistencias`);
    if (K.cum != null && K.cum >= .85) fort.push(`Avance de la planeación de ${pct(K.cum)}`); else if (K.cum != null && K.cum < .65) areas.push(`Avance de la planeación de ${pct(K.cum)}`);
    if (s.G.length && s.G.every(g => g.nreg > 0)) fort.push("Registros de evaluación formativa en todos sus grupos"); else if (s.G.some(g => !g.nreg)) areas.push("Grupos sin registros de evaluación formativa: " + s.G.filter(g => !g.nreg).map(g => g.et).join(", "));
    if (s.aten.length) areas.push(`${s.aten.length} alumnos que requieren atención (calificación baja o faltas)`); }
  return { fort: fort.slice(0, 8), areas: areas.slice(0, 8) }; };
VISTAS.cierre = () => { const v = visitaV(); if (!v) return VISTAS.inicio(); const c = v.cierre, gen = ASP.map(a => semDe(v, a.k)).filter(Boolean).length ? semGeneral(Object.assign({}, v, { cierre: {} })) : "", vg = c.val || gen;
  return barra("Visita · " + esc(corto(v.maestro.nombre)), "Cierre de visita formativa") + `<main class="wrap">
  <section class="card mt"><h3>Así queda cada aspecto</h3><div class="lista">${ASP.map(a => { const s = semDe(v, a.k); return `<button class="it btnit" data-a="${a.k}"><span class="av" style="background:${a.s};color:${a.c}">${ic(a.ic, 18)}</span><span class="tx"><b>${a.n}</b></span><span class="sem-p" style="${s ? `background:${SEM[s].s};color:${SEM[s].c}` : ""}">${semDot(s)} ${s ? SEM[s].n : "Sin valorar"}</span></button>`; }).join("")}</div>
   <div class="campo mt"><span>Valoración general de la visita</span><div class="semaforo">${Object.entries(SEM).map(([k, s]) => `<button data-vg="${k}" aria-pressed="${vg === k}" style="--c:${s.c};--c-s:${s.s}"><span class="luz"></span><b>${s.n}</b></button>`).join("")}</div>${gen && !c.val ? `<small>Calculada con los semáforos de cada aspecto.</small>` : ""}</div></section>
  <section class="card mt"><div class="fila" style="justify-content:space-between"><h3>Retroalimentación</h3><button class="btn s" id="bSug">${ic("check", 16)} Sugerir con lo revisado</button></div>
   ${[["fort", "Fortalezas", "Lo que el maestro hace bien y conviene mantener"], ["areas", "Áreas de oportunidad", "Lo que puede mejorar"], ["recom", "Recomendaciones y sugerencias", "Estrategias, materiales, lecturas o cursos"], ["acu", "Acuerdos y compromisos", "Qué se compromete a hacer, y para cuándo"]].map(([k, t, ph]) => `<label class="campo"><span>${t}</span><textarea id="c_${k}" data-c="${k}" placeholder="${ph}">${esc(c[k] || "")}</textarea></label>`).join("")}
   <label class="campo"><span>Próxima visita o seguimiento (opcional)</span><input type="date" id="c_prox" data-c="prox" value="${esc(c.prox || "")}"></label></section>
  <section class="card mt"><h3>Firma del supervisor(a)</h3>${firmaCaja("sup", v.firmas.sup || "", D.yo.firma)}</section>
  <section class="card mt"><h3>Firma del maestro(a) <small class="muted" style="font:400 14px var(--body)">(opcional)</small></h3><p class="small muted mb">Si está presente, puede firmar aquí de enterado.</p>${firmaCaja("doc", v.firmas.doc || "")}</section>
  <div class="fila fin mt2"><button class="btn p" id="bCerrar">${ic("bandera", 18)} Cerrar la visita y generar el informe</button></div></main>`; };
function firmaCaja(k, u, guardada) { return u ? `<div class="firma-caja"><img src="${u}" alt="Firma"></div><div class="fila mt"><button class="btn s" data-fx="${k}">${ic("lapiz", 16)} Volver a firmar</button></div>`
  : `${guardada ? `<div class="fila mb"><button class="btn s p" data-fg="${k}">${ic("check", 16)} Usar mi firma guardada</button></div>` : ""}<canvas class="firma-lienzo" data-fc="${k}"></canvas><div class="fila mt"><button class="btn s" data-fl="${k}">Borrar</button><button class="btn s o" data-fo="${k}">${ic("check", 16)} Guardar firma</button></div>`; }
function lienzo(c) { const r = c.getBoundingClientRect(), dpr = devicePixelRatio || 1; c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); const x = c.getContext("2d"); const lim = () => { x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); }; lim();
  x.lineWidth = 3.2 * dpr; x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = "#10215a"; let on = false; c.hay = false; const pt = e => { const b = c.getBoundingClientRect(); return [(e.clientX - b.left) * dpr, (e.clientY - b.top) * dpr]; };
  c.onpointerdown = e => { on = true; c.hay = true; c.setPointerCapture(e.pointerId); const [a, b] = pt(e); x.beginPath(); x.moveTo(a, b); x.lineTo(a + .1, b + .1); x.stroke(); }; c.onpointermove = e => { if (!on) return; const [a, b] = pt(e); x.lineTo(a, b); x.stroke(); }; c.onpointerup = c.onpointercancel = () => on = false; c.limpiar = () => { lim(); c.hay = false; }; }
/* recorta el trazo y deja el fondo transparente */
function firmaLimpia(c) { const W = c.width, H = c.height, x = c.getContext("2d"), d = x.getImageData(0, 0, W, H), p = d.data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) { const k = (y * W + i) * 4, l = (p[k] + p[k + 1] + p[k + 2]) / 3; if (l < 200) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; p[k] = 16; p[k + 1] = 33; p[k + 2] = 90; p[k + 3] = 255; } else p[k + 3] = 0; }
  if (x1 < 0) return ""; x.putImageData(d, 0, 0); const m = 8, o = document.createElement("canvas"), sw = x1 - x0 + 1 + 2 * m, sh = y1 - y0 + 1 + 2 * m, s = Math.min(1, 700 / sw); o.width = Math.round(sw * s); o.height = Math.round(sh * s); o.getContext("2d").drawImage(c, x0 - m, y0 - m, sw, sh, 0, 0, o.width, o.height); return o.toDataURL("image/png"); }
function enlazarFirmas(dest, alGuardar) { $$("[data-fc]").forEach(lienzo); $$("[data-fl]").forEach(b => b.onclick = () => $(`[data-fc="${b.dataset.fl}"]`).limpiar());
  $$("[data-fo]").forEach(b => b.onclick = () => { const c = $(`[data-fc="${b.dataset.fo}"]`); if (!c.hay) return toast("Primero firme en el recuadro."); const u = firmaLimpia(c); if (!u) return toast("Primero firme en el recuadro."); dest[b.dataset.fo] = u; alGuardar(b.dataset.fo, u); });
  $$("[data-fx]").forEach(b => b.onclick = () => { delete dest[b.dataset.fx]; alGuardar(b.dataset.fx, ""); }); $$("[data-fg]").forEach(b => b.onclick = () => { dest[b.dataset.fg] = D.yo.firma; alGuardar(b.dataset.fg, D.yo.firma); }); }
ENLAZAR.cierre = () => { const v = visitaV(); if (!v) return; const c = v.cierre;
  $$("[data-a]").forEach(b => b.onclick = () => ir("aspecto", { id: v.id, k: b.dataset.a })); $$("[data-vg]").forEach(b => b.onclick = () => { c.val = c.val === b.dataset.vg ? "" : b.dataset.vg; guardar(); re(); });
  $$("[data-c]").forEach(t => t.onchange = () => { c[t.dataset.c] = t.value; guardar(); });
  $("#bSug").onclick = async () => { const s = sugerencias(v, v.modo === "ulama" ? await paqGet(v.id) : null); let n = 0;
    [["fort", s.fort], ["areas", s.areas]].forEach(([k, L]) => { if (!L.length) return; const ya = c[k] || "", nuevos = L.filter(t => !ya.includes(t)); if (nuevos.length) { c[k] = (ya ? ya.trim() + "\n" : "") + nuevos.map(t => "• " + t).join("\n"); n += nuevos.length; } });
    guardar(); re(); toast(n ? "Se agregaron sugerencias. Edítelas a su gusto." : "Marque indicadores en los aspectos para poder sugerir.", 3200); };
  enlazarFirmas(v.firmas, (k, u) => { if (k === "sup" && u && !D.yo.firma) D.yo.firma = u; guardar(); re(); });
  $("#bCerrar").onclick = async () => { $$("[data-c]").forEach(t => c[t.dataset.c] = t.value);
    if (!ASP.some(a => semDe(v, a.k))) return toast("Valore con el semáforo al menos un aspecto.");
    if (!v.firmas.sup) return toast("Falta su firma: firme y toque «Guardar firma».", 3500);
    v.estado = "cerrada"; v.fin = hora(); v.cerrada = new Date().toISOString(); v.dur = minutos(v.t0); if (!c.val) c.val = semGeneral(Object.assign({}, v, { cierre: {} }));
    if (v.modo === "ulama") { const p = await paqGet(v.id); if (p) { const s = stats(p); v.snap = { per: p.per, gen: p.gen, s: Object.assign({}, s, { aten: s.aten.slice(0, 40) }) }; } }
    guardar(); ir("informe", { id: v.id, recien: true }, true); }; };

/* =================================================================== INFORME */
async function fotoDoc(u) { return new Promise(ok => { if (!u) return ok(""); const im = new Image(); im.onload = () => { const W = 960, H = 720, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); x.fillStyle = "#F1EEE7"; x.fillRect(0, 0, W, H); const s = Math.min(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; x.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); ok(c.toDataURL("image/jpeg", .8)); }; im.onerror = () => ok(""); im.src = u; }); }
const aDataURL = async url => { const r = await fetch(url); if (!r.ok) throw 0; const bl = await r.blob(); return await new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(bl); }); };
async function logoEsc(cct) { if (!cct) return ""; for (const ext of ["jpg", "png"]) { try { return await aDataURL(`${ESC_IMG}${cct}.${ext}`); } catch (e) {} } return ""; }
async function docVisita(v) { const e = escDe(v.escuela.id) || v.escuela, s = v.snap && v.snap.s, cel = (t, st = "") => `<td style="${st}">${t}</td>`;
  const [isep, lg] = await Promise.all([aDataURL(ISEP).catch(() => ""), logoEsc(v.escuela.cct)]);
  let graf = ""; if (s) { const g = graficas(s), png = await Promise.all([g.asis, g.comp, g.dist, g.prom, g.sem].map(x => svgPng(x))); graf = `<table class="vis-graf"><tr><td><img src="${png[0]}"></td><td><img src="${png[1]}"></td></tr><tr><td><img src="${png[2]}"></td><td><img src="${png[3]}"></td></tr><tr><td colspan="2"><img src="${png[4]}" style="width:86%"></td></tr></table>`; }
  const fotos = []; for (const f of v.fotos) fotos.push({ f, u: await fotoDoc(await fotoGet(f.id)) });
  const sDoc = k => k ? `<span class="vis-sem" style="background:${SEM[k].s};color:${SEM[k].c};border-color:${SEM[k].c}">● ${SEM[k].n}</span>` : `<span class="vis-sem">Sin valorar</span>`;
  const c = v.cierre, txt = t => esc(t || "").replace(/\n/g, "<br>"), vg = c.val || semGeneral(v);
  return `<div class="doc vis-doc"><table class="enc"><tr><td style="width:90px">${isep ? `<img src="${isep}" alt="ISEP">` : ""}</td><td class="t"><b>Supervisión de Educación Física${D.yo.zona ? " · Zona Escolar " + esc(D.yo.zona) : ""}</b><br><span>${esc(e.nombre)}${e.cct ? " · C.C.T. " + esc(e.cct) : ""}${e.turno ? " · Turno " + esc(e.turno) : ""}${e.domicilio ? "<br>" + esc(e.domicilio) + (e.localidad ? ", " + esc(e.localidad) : "") : ""}</span><br><b class="tt">Informe de visita de supervisión formativa</b></td><td style="width:90px;text-align:right">${lg ? `<img src="${lg}" alt="">` : ""}</td></tr></table>
  <div class="datos"><span><b>Docente:</b> ${esc(v.maestro.nombre)}</span><span><b>Correo:</b> ${esc(v.maestro.correo || "—")}</span><span><b>Director(a):</b> ${esc(dirNombre(e) || v.escuela.director || "—")}</span>
   <span><b>Fecha:</b> ${fLarga(v.fecha)}</span><span><b>Horario:</b> ${h12(v.ini)} a ${h12(v.fin)} (${durTxt(v.dur || 0)})</span><span><b>Tipo:</b> ${esc(v.tipo)}</span>
   <span><b>Supervisor(a):</b> ${esc(yoNombre())}</span><span><b>Información:</b> ${v.modo === "ulama" ? `registros de Ulama${v.snap ? `, ${fCorta(v.snap.per.ini)} al ${fCorta(v.snap.per.fin)}` : ""}` : "revisión directa"}</span><span><b>Valoración general:</b> ${vg ? SEM[vg].n : "—"}</span></div>
  ${v.prop ? `<p><b>Propósito de la visita:</b> ${txt(v.prop)}</p>` : ""}
  <h2>1. Valoración por aspecto</h2><table><thead><tr><th style="width:24%">Aspecto</th><th style="width:16%">Semáforo</th><th style="width:12%" class="c">Indicadores</th><th>Observaciones</th></tr></thead><tbody>
   ${ASP.map(a => { const x = v.asp[a.k] || { ind: {} }, L = Object.values(x.ind || {}), si = L.filter(n => n === 2).length; return `<tr><td><b>${a.n}</b></td>${cel(sDoc(x.sem))}<td class="c">${L.length ? `${si} de ${L.length} logrados` : "—"}</td><td>${txt(x.nota)}</td></tr>`; }).join("")}</tbody></table>
  ${s ? `<h2>2. Registros del docente en Ulama</h2>
   <table class="vis-kpi"><tr>${[["Asistencia", pct(s.kpi.asis)], ["Promedio de calificación", s.kpi.prom == null ? "—" : s.kpi.prom.toFixed(1)], ["Clases registradas", s.kpi.clases], ["Alumnos", s.kpi.alumnos], ["Avance de planeación", pct(s.kpi.cum)], ["Requieren atención", s.aten.length]].map(([t, n]) => `<td><b>${n}</b>${t}</td>`).join("")}</tr></table>${graf}
   <table><thead><tr><th>Grupo</th><th class="c">Alumnos</th><th class="c">Clases</th><th class="c">Asistencia</th><th class="c">Faltas</th><th class="c">Retardos</th><th class="c">Registros eval.</th><th class="c">Promedio</th></tr></thead><tbody>${s.G.map(g => `<tr><td>${esc(g.et)}</td><td class="c">${g.alumnos}</td><td class="c">${g.clases}</td><td class="c"><b>${pct(g.pAsis)}</b></td><td class="c">${g.falt}</td><td class="c">${g.ret}</td><td class="c">${g.nreg}</td><td class="c"><b>${g.prom == null ? "—" : g.prom.toFixed(1)}</b></td></tr>`).join("")}</tbody></table>
   ${s.planes.length ? `<h3>Planeaciones</h3><table><thead><tr><th>Planeación</th><th>Grupos</th><th class="c">Sesiones</th><th class="c">Dadas / programadas a la fecha</th><th class="c">Avance</th></tr></thead><tbody>${s.planes.map(x => `<tr><td>${esc(x.t)}</td><td>${esc(x.gr)}</td><td class="c">${x.ses}</td><td class="c">${x.dadas} / ${x.due}</td><td class="c"><b>${pct(x.cum)}</b></td></tr>`).join("")}</tbody></table>` : ""}
   ${s.aten.length ? `<h3>Alumnos que requieren atención</h3><table><thead><tr><th>Alumno(a)</th><th>Grupo</th><th class="c">Calif.</th><th>Motivo</th></tr></thead><tbody>${s.aten.map(a => `<tr><td>${esc(a.n)}</td><td>${esc(a.g)}</td><td class="c">${a.cal ?? "—"}</td><td>${esc(a.mot)}</td></tr>`).join("")}</tbody></table>` : ""}` : ""}
  <h2>${s ? 3 : 2}. Detalle de indicadores</h2>${ASP.filter(a => Object.keys((v.asp[a.k] || {}).ind || {}).length).map(a => { const x = v.asp[a.k]; return `<table class="vis-ind"><thead><tr><th colspan="3">${a.n}${a.k === "clase" && (v.clase.grupo || v.clase.ses) ? ` · ${esc(v.clase.grupo)}${v.clase.hora ? ", " + h12(v.clase.hora) : ""}${v.clase.ses ? " · " + esc(v.clase.ses) : ""}` : ""}</th></tr></thead><tbody>
    ${a.ind.map((t, i) => x.ind[i] == null ? "" : `<tr><td>${esc(t)}</td><td class="c" style="width:12%;font-weight:700;color:${x.ind[i] === 2 ? "#1E8E5A" : x.ind[i] === 1 ? "#A87200" : "#C2362B"}">${RESP_N[x.ind[i]]}</td><td style="width:38%">${esc((x.com || {})[i] || "")}</td></tr>`).join("")}</tbody></table>`; }).join("") || `<p class="nota">No se marcaron indicadores.</p>`}
  ${fotos.length ? `<h2>${s ? 4 : 3}. Evidencias fotográficas</h2><table class="vis-fotos">${fotos.reduce((filas, x, i) => { if (i % 2 === 0) filas.push([]); filas[filas.length - 1].push(x); return filas; }, []).map(fila => `<tr>${fila.map(({ f, u }) => `<td>${u ? `<img src="${u}">` : ""}<p><b>${esc(f.t || "Evidencia")}</b><br>${f.asp ? aspDe(f.asp).n + " · " : ""}${h12(f.h)}</p></td>`).join("")}${fila.length < 2 ? "<td></td>" : ""}</tr>`).join("")}</table>` : ""}
  <h2>${(s ? 4 : 3) + (fotos.length ? 1 : 0)}. Retroalimentación y acuerdos</h2><table><tbody>
   <tr><th style="width:26%">Fortalezas</th><td>${txt(c.fort) || "—"}</td></tr><tr><th>Áreas de oportunidad</th><td>${txt(c.areas) || "—"}</td></tr><tr><th>Recomendaciones</th><td>${txt(c.recom) || "—"}</td></tr><tr><th>Acuerdos y compromisos</th><td>${txt(c.acu) || "—"}</td></tr>${c.prox ? `<tr><th>Próxima visita o seguimiento</th><td>${fLarga(c.prox)}</td></tr>` : ""}</tbody></table>
  <table class="vis-firmas"><tr><td>${v.firmas.sup ? `<img src="${v.firmas.sup}">` : ""}</td><td>${v.firmas.doc ? `<img src="${v.firmas.doc}">` : ""}</td></tr><tr><td class="l">${esc(yoNombre())}<br>${esc(D.yo.cargo)}</td><td class="l">${esc(v.maestro.nombre)}<br>Docente de Educación Física${v.firmas.doc ? " · enterado(a)" : ""}</td></tr></table>
  <p class="nota">Informe generado con Ulama · Supervisión el ${fLarga(v.cerrada.slice(0, 10))} a las ${h12(new Date(v.cerrada).toTimeString().slice(0, 5))} La visita tiene carácter formativo: su propósito es acompañar y fortalecer la práctica docente.</p></div>`; }
VISTAS.informe = () => { const v = visDe(S.id); if (!v) return VISTAS.inicio(); const vg = v.cierre.val || semGeneral(v);
  return barra("Visita del " + fCorta(v.fecha), "Informe de la visita") + `<main class="wrap">
  <section class="vis-cab mt"><div class="fila" style="gap:14px"><span class="vis-av" style="${vg ? `background:${SEM[vg].s};color:${SEM[vg].c}` : ""}">${ic("check", 26)}</span><div style="flex:1;min-width:0"><h2>${esc(v.maestro.nombre)}</h2><p>${esc(v.escuela.nombre)} · ${fLarga(v.fecha)} · ${h12(v.ini)} a ${h12(v.fin)}</p>${v.enviado ? `<p class="small" style="margin-top:6px">${ic("correo", 14)} Enviado a ${esc(v.enviado.a)} el ${fCorta(v.enviado.f.slice(0, 10))}</p>` : ""}</div></div></section>
  <div class="fila mt"><button class="btn p" id="iEnv">${ic("correo", 18)} Enviar al maestro</button><button class="btn" id="iPdf">${ic("bajar", 16)} PDF</button><button class="btn" id="iImp">${ic("impr", 16)} Imprimir</button></div>
  <div class="hoja-doc mt" id="iDoc"><p class="muted">Preparando el informe…</p></div>
  <div class="fila mt"><button class="btn s r" id="iBor">${ic("basura", 16)} Borrar esta visita</button></div></main>`; };
ENLAZAR.informe = async () => { const v = visDe(S.id); if (!v) return; let html = "";
  const listo = async () => html || (html = await docVisita(v));
  $("#iImp").onclick = async () => imprimir(await listo()); $("#iPdf").onclick = async ev => { const b = ev.currentTarget; b.disabled = true; try { await pdfDescargar(await listo(), archivoDe(v)); } catch (e) { toast("Sin internet no se puede generar el PDF: use Imprimir → Guardar como PDF."); imprimir(await listo()); } b.disabled = false; };
  $("#iEnv").onclick = async () => dlgEnviar(v, await listo());
  $("#iBor").onclick = async () => { if (!(await confirmar("Se borrará la visita, su informe y sus fotos de este dispositivo.", "Borrar"))) return; v.fotos.forEach(f => fotoDel(f.id)); D.visitas = D.visitas.filter(x => x !== v); guardar(); ir("inicio", {}, true); };
  const d = await listo(); const box = $("#iDoc"); if (box) box.innerHTML = d; if (S.recien) { S.recien = false; toast("<b>Visita cerrada.</b> Ya puede enviar el informe al maestro.", 3500); dlgEnviar(v, d); } };
const archivoDe = v => `informe-visita-ef-${nrm(v.maestro.nombre).replace(/\s+/g, "-")}-${v.fecha}.pdf`;
function imprimir(html) { $("#imprimir").innerHTML = html; const imgs = [...$("#imprimir").querySelectorAll("img")]; Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 2500); }))).then(() => setTimeout(() => window.print(), 120)); }
async function pdfObra(html, archivo) { await cargarJS(H2P); const el = document.createElement("div"); el.style.width = "720px"; el.style.background = "#fff"; el.innerHTML = html;
  return { w: html2pdf().set({ margin: [10, 10, 12, 10], filename: archivo, image: { type: "jpeg", quality: .9 }, html2canvas: { scale: 1.7, useCORS: true, backgroundColor: "#fff", scrollX: 0, scrollY: 0 }, jsPDF: { unit: "mm", format: "letter", orientation: "portrait" }, pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".vis-fotos td", "img"] } }).from(el) }; }
async function pdfDescargar(html, archivo) { if (navigator.onLine === false) throw new Error("sin-red"); await (await pdfObra(html, archivo)).w.save(); }
function cssDoc() { let t = ""; for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (r.selectorText && /\.doc\b/.test(r.selectorText)) t += r.cssText + "\n"; } catch (e) {} } return t; }
function dlgEnviar(v, html) { const e = escDe(v.escuela.id) || {}, vg = v.cierre.val || semGeneral(v);
  const cuerpo = `${v.maestro.nombre}\nDocente de Educación Física\n${v.escuela.nombre}\n\nLe comparto el informe de la visita de supervisión formativa que realizamos el ${fLarga(v.fecha)}, de ${h12(v.ini)} a ${h12(v.fin)}.${vg ? `\n\nValoración general: ${SEM[vg].n}.` : ""}${v.cierre.acu ? `\n\nAcuerdos y compromisos:\n${v.cierre.acu}` : ""}${v.cierre.prox ? `\n\nPróxima visita o seguimiento: ${fLarga(v.cierre.prox)}.` : ""}\n\nGracias por su disposición y por su trabajo con los alumnos.\n\nAtentamente,\n${yoNombre()}\n${D.yo.cargo}${D.yo.zona ? " · Zona Escolar " + D.yo.zona : ""}`;
  const cc = [D.yo.correo].filter(Boolean);
  dlg(`<h3>Enviar el informe al maestro</h3><label class="campo"><span>Para (correo institucional)</span><input id="mP" value="${esc(v.maestro.correo)}"></label><label class="campo"><span>Con copia</span><input id="mC" value="${esc(cc.join(", "))}" placeholder="Su correo, y si gusta el de la dirección${e.correo ? ": " + esc(e.correo) : ""}"></label>
   <label class="campo"><span>Asunto</span><input id="mA" value="${esc(`Informe de visita de supervisión · Educación Física · ${fCorta(v.fecha)}`)}"></label><label class="campo"><span>Mensaje</span><textarea id="mM" style="min-height:180px">${esc(cuerpo)}</textarea></label>
   <p class="small muted mb">${v.codigo || D.tok ? "Se enviará con el informe en PDF adjunto desde el servidor de la Supervisión." : "Se abrirá su correo con el mensaje y se descargará el PDF para que lo adjunte. Para enviarlo directo, ponga su enlace de acceso en Ajustes."}</p>
   <div class="fila fin"><button class="btn" id="mX">Cancelar</button><button class="btn p" id="mOk">${ic("correo", 18)} Enviar</button></div>`, w => {
    w.querySelector("#mX").onclick = cerrarDlg;
    w.querySelector("#mOk").onclick = async ev => { const b = ev.currentTarget, P = val("mP").split(/[,;\s]+/).filter(x => /@/.test(x)), C = val("mC").split(/[,;\s]+/).filter(x => /@/.test(x)), A = val("mA"), M = val("mM"); if (!P.length) return toast("Escriba el correo del maestro.");
      if (P[0].toLowerCase() !== (v.maestro.correo || "").toLowerCase()) { v.maestro.correo = P[0].toLowerCase(); const m = maeDe(v.maestro.id); if (m && !m.correo) m.correo = v.maestro.correo; guardar(); }
      b.disabled = true; b.textContent = "Enviando…";
      try { if (!v.codigo && !D.tok) throw new Error("sin-enlace"); const html2 = html.replace(/<img src="(?!data:)[^"]*"[^>]*>/g, "");
        await post("efEnviar", { tok: D.tok || "", rev: v.codigo || "", quien: { nombre: yoNombre(), correo: D.yo.correo }, para: P, cc: C, asunto: A, mensaje: M, html: html2, css: cssDoc(), archivo: archivoDe(v) });
        v.enviado = { a: P.join(", "), f: new Date().toISOString() }; guardar(); cerrarDlg(); re(); toast(`<b>Informe enviado</b> a ${esc(P.join(", "))}.`, 4000); }
      catch (e) { cerrarDlg(); if (e.message !== "sin-enlace") toast(`<b>No se pudo enviar desde el servidor</b> (${esc(e.message)}). Se abrirá su correo.`, 4500);
        location.href = `mailto:${P.join(",")}?${C.length ? "cc=" + encodeURIComponent(C.join(",")) + "&" : ""}subject=${encodeURIComponent(A)}&body=${encodeURIComponent(M)}`;
        setTimeout(() => pdfDescargar(html, archivoDe(v)).catch(() => imprimir(html)), 900); } }; }); }

/* =================================================================== HISTORIAL */
VISTAS.historial = () => { const q = nrm(S.q || ""), L = D.visitas.filter(v => v.estado === "cerrada" && (!q || nrm(v.maestro.nombre + " " + v.escuela.nombre).includes(q))).sort((a, b) => (b.cerrada || "").localeCompare(a.cerrada || ""));
  return barra("Supervisión", "Visitas realizadas") + `<main class="wrap"><label class="campo mt"><span>Buscar maestro o escuela</span><input id="hQ" value="${esc(S.q || "")}" type="search"></label><div class="lista">${L.map(itemVisita).join("") || `<div class="vacio">Aún no hay visitas cerradas.</div>`}</div>
  ${D.maestros.length ? `<h2 class="sec-t">Seguimiento por maestro</h2><div class="tabla-c"><table class="tabla"><thead><tr><th>Maestro(a)</th><th>Visitas</th><th>Última</th><th>Valoración</th></tr></thead><tbody>${D.maestros.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(m => { const V = D.visitas.filter(v => v.estado === "cerrada" && v.maestro.id === m.id).sort((a, b) => b.fecha.localeCompare(a.fecha)), u = V[0], s = u && semGeneral(u);
    return `<tr><td>${esc(m.nombre)}<br><small class="muted">${escuelasDe(m).map(e => esc(e.nombre)).join(", ")}</small></td><td>${V.length}</td><td>${u ? fCorta(u.fecha) : "—"}</td><td>${s ? `${semDot(s, 12)} ${SEM[s].n}` : "<span class='muted'>Pendiente</span>"}</td></tr>`; }).join("")}</tbody></table></div>` : ""}</main>`; };
ENLAZAR.historial = () => { $("#hQ").oninput = e => { S.q = e.target.value; const p = e.target.selectionStart; re(); const i = $("#hQ"); i.focus(); i.setSelectionRange(p, p); }; $$("[data-vis]").forEach(b => b.onclick = () => ir("informe", { id: b.dataset.vis })); };

/* =================================================================== CATÁLOGO: escuelas y maestros */
VISTAS.catalogo = () => { const tab = S.tab || "esc";
  return barra("Supervisión", "Escuelas y maestros", `<button class="btn s p" id="cNuevo">${ic("mas", 16)} ${tab === "esc" ? "Escuela" : "Maestro"}</button>`) + `<main class="wrap"><div class="chips mt"><button class="chip" data-tab="esc" aria-pressed="${tab === "esc"}">Escuelas (${D.escuelas.length})</button><button class="chip" data-tab="mae" aria-pressed="${tab === "mae"}">Maestros (${D.maestros.length})</button></div>
  ${tab === "esc" ? `<div class="lista mt">${D.escuelas.map(e => { const falta = [!e.cct && "clave", !e.director && "director", !e.correo && !e.dirCorreo && "correo"].filter(Boolean);
    return `<button class="it btnit" data-e="${e.id}"><span class="av">${ic("escuela", 18)}</span><span class="tx"><b>${esc(escNom(e))}</b><small>${esc(e.cct || "Sin clave")} · ${esc(e.domicilio || "sin domicilio")}<br>Dir.: ${esc(dirNombre(e) || "—")}${e.dirVerif ? " <i>(por confirmar)</i>" : ""} · ${maestrosDe(e.id).length} maestros de E. F.</small></span>${falta.length ? `<span class="tag m">Falta ${falta.join(", ")}</span>` : `<span class="tag">Completa</span>`}</button>`; }).join("") || `<div class="vacio">Sin escuelas.</div>`}</div>`
    : `<div class="lista mt">${D.maestros.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(m => `<button class="it btnit" data-m="${m.id}"><span class="av">${ic("persona", 18)}</span><span class="tx"><b>${esc(m.nombre)}</b><small>${esc(m.correo || "sin correo")} · ${escuelasDe(m).map(e => esc(e.nombre)).join(", ")}${m.inactivo ? ` · <b>${esc(m.motivoInactivo || "Inactivo")}</b>` : ""}</small></span>${m.inactivo ? `<span class="tag m">Inactivo</span>` : ""}${m.correo && !/@bcedu\.mx$/.test(m.correo) ? `<span class="tag m">Correo no institucional</span>` : ""}</button>`).join("") || `<div class="vacio">Sin maestros.</div>`}</div>`}
  <section class="card mt2"><h3>Subir o agregar datos</h3><p class="small muted mb">Suba una hoja de Excel o CSV con columnas como <b>Escuela, Clave, Director, Correo de la escuela, Correo del director, Maestro, Correo del maestro</b> (en cualquier orden). Se completan los datos que falten sin borrar los que ya tiene. También puede pegar una tabla copiada de Excel o Word.</p>
   <div class="fila"><button class="btn" id="cSub">${ic("subir", 16)} Subir Excel o CSV</button><button class="btn" id="cPeg">${ic("doc", 16)} Pegar tabla</button><button class="btn" id="cExp">${ic("bajar", 16)} Descargar catálogo</button></div><input type="file" id="fCat" accept=".xlsx,.xls,.csv,.json,text/csv" hidden></section></main>`; };
ENLAZAR.catalogo = () => { $$("[data-tab]").forEach(b => b.onclick = () => { S.tab = b.dataset.tab; re(); }); $$("[data-e]").forEach(b => b.onclick = () => formEscuela(escDe(b.dataset.e))); $$("[data-m]").forEach(b => b.onclick = () => formMaestro(maeDe(b.dataset.m)));
  $("#cNuevo").onclick = () => S.tab === "mae" ? formMaestro(null) : formEscuela(null); $("#cSub").onclick = () => $("#fCat").click(); $("#fCat").onchange = e => { importarArchivo(e.target.files[0]); e.target.value = ""; };
  $("#cPeg").onclick = () => dlg(`<h3>Pegar tabla</h3><p class="small muted mb">Copie la tabla desde Excel o Word (con su fila de títulos) y péguela aquí.</p><textarea id="pgT" class="area" style="min-height:200px"></textarea><div class="fila fin mt"><button class="btn" id="pgX">Cancelar</button><button class="btn p" id="pgOk">Agregar</button></div>`, w => {
    w.querySelector("#pgX").onclick = cerrarDlg; w.querySelector("#pgOk").onclick = () => { const filas = val("pgT").split(/\r?\n/).filter(l => l.trim()).map(l => l.split(/\t|;|\|/).map(x => x.trim())); cerrarDlg(); importarFilas(filas); }; });
  $("#cExp").onclick = () => { const j = { t: "ulama-sup-catalogo", v: 1, zona: D.yo.zona, actualizado: hoy(), escuelas: D.escuelas, maestros: D.maestros }, a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(j, null, 1)], { type: "application/json" })); a.download = `catalogo-supervision-ef-${hoy()}.json`; a.click(); }; };
function formEscuela(e) { const n = !e; e = e || { id: uid(), zona: D.yo.zona, localidad: "" };
  dlg(`<h3>${n ? "Nueva escuela" : "Editar escuela"}</h3><div class="dos"><label class="campo"><span>Nombre</span><input id="eN" value="${esc(e.nombre || "")}"></label><label class="campo"><span>C.C.T.</span><input id="eC" value="${esc(e.cct || "")}" style="text-transform:uppercase" placeholder="02DPR0000X"></label></div>
   <div class="dos"><label class="campo"><span>Turno</span><select id="eT">${["", "Matutino", "Vespertino", "Tiempo completo"].map(x => `<option ${x === e.turno ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="campo"><span>Zona escolar</span><input id="eZ" value="${esc(e.zona || "")}"></label></div>
   <label class="campo"><span>Domicilio</span><input id="eD" value="${esc(e.domicilio || "")}"></label><label class="campo"><span>Localidad</span><input id="eL" value="${esc(e.localidad || "")}"></label>
   <div class="dos"><label class="campo"><span>Tratamiento</span><select id="eDT">${["", "Mtro.", "Mtra."].map(x => `<option ${x === (e.dirTrato || "") ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="campo"><span>Director(a)</span><input id="eDi" value="${esc(e.director || "")}"></label></div>
   ${e.dirVerif ? `<label class="rev-chk"><input type="checkbox" id="eV" checked> Director por confirmar <small class="muted">(dato de directorios públicos)</small></label>` : ""}
   <div class="dos"><label class="campo"><span>Correo de la escuela</span><input id="eCo" type="email" value="${esc(e.correo || "")}"></label><label class="campo"><span>Correo del director(a)</span><input id="eDC" type="email" value="${esc(e.dirCorreo || "")}"></label></div>
   <label class="campo"><span>Teléfono</span><input id="eTe" value="${esc(e.tel || "")}" inputmode="tel"></label>${e.fuente ? `<p class="small muted mb">Fuente: ${esc(e.fuente)}</p>` : ""}
   <div class="fila fin">${n ? "" : `<button class="btn r" id="eB" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="eX">Cancelar</button><button class="btn p" id="eOk">Guardar</button></div>`, w => {
    w.querySelector("#eX").onclick = cerrarDlg;
    w.querySelector("#eOk").onclick = () => { const nom = val("eN").trim(); if (!nom) return toast("Escriba el nombre."); Object.assign(e, { nombre: nom, cct: val("eC").trim().toUpperCase(), turno: val("eT"), zona: val("eZ").trim(), domicilio: val("eD").trim(), localidad: val("eL").trim(), dirTrato: val("eDT"), director: val("eDi").trim(), correo: val("eCo").trim().toLowerCase(), dirCorreo: val("eDC").trim().toLowerCase(), tel: val("eTe").trim() });
      e.dirVerif = !!(w.querySelector("#eV") && w.querySelector("#eV").checked); if (n) D.escuelas.push(e); guardar(); re(); toast("Escuela guardada."); };
    w.querySelector("#eB") && (w.querySelector("#eB").onclick = async () => { if (!(await confirmar(`¿Quitar ${e.nombre} del catálogo? Las visitas ya hechas no se borran.`, "Quitar"))) return; D.escuelas = D.escuelas.filter(x => x !== e); D.maestros.forEach(m => m.escuelas = m.escuelas.filter(i => i !== e.id)); guardar(); re(); }); }); }
function formMaestro(m) { const n = !m; m = m || { id: uid(), escuelas: [] };
  dlg(`<h3>${n ? "Nuevo maestro" : "Editar maestro"}</h3><label class="campo"><span>Nombre completo</span><input id="mN" value="${esc(m.nombre || "")}"></label><label class="campo"><span>Correo institucional</span><input id="mCo" type="email" value="${esc(m.correo || "")}" placeholder="nombre@bcedu.mx"></label>
   <div class="campo"><span>Escuelas donde trabaja</span><div class="chips" id="mE">${D.escuelas.map(e => `<button class="chip" data-me="${e.id}" aria-pressed="${m.escuelas.includes(e.id)}">${esc(escNom(e))}</button>`).join("")}</div></div>
   <label class="rev-chk"><input type="checkbox" id="mIn" ${m.inactivo ? "checked" : ""}> Inactivo (licencia u otra causa): se conserva, pero no cuenta en visitas, planeaciones ni horarios</label>
   <label class="campo"><span>Motivo (si está inactivo)</span><input id="mIM" value="${esc(m.motivoInactivo || "")}" placeholder="Ej. licencia por todo el ciclo 2026-2027"></label>
   <div class="fila fin">${n ? "" : `<button class="btn r" id="mB" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="mX">Cancelar</button><button class="btn p" id="mOk">Guardar</button></div>`, w => {
    const sel = new Set(m.escuelas); w.querySelectorAll("[data-me]").forEach(b => b.onclick = () => { const i = b.dataset.me; sel.has(i) ? sel.delete(i) : sel.add(i); b.setAttribute("aria-pressed", sel.has(i)); });
    w.querySelector("#mX").onclick = cerrarDlg; w.querySelector("#mOk").onclick = () => { const nom = val("mN").trim(); if (!nom) return toast("Escriba el nombre."); Object.assign(m, { nombre: nom, correo: val("mCo").trim().toLowerCase(), escuelas: [...sel], inactivo: w.querySelector("#mIn").checked, motivoInactivo: val("mIM").trim() }); if (!m.inactivo) delete m.motivoInactivo; delete m.nota; if (n) D.maestros.push(m); guardar(); re(); toast("Maestro guardado."); };
    w.querySelector("#mB") && (w.querySelector("#mB").onclick = async () => { if (!(await confirmar(`¿Quitar a ${m.nombre} del catálogo? Sus visitas no se borran.`, "Quitar"))) return; D.maestros = D.maestros.filter(x => x !== m); guardar(); re(); }); }); }
async function importarArchivo(f) { if (!f) return; try {
    if (/\.json$/i.test(f.name)) { combinarCatalogo(JSON.parse(await f.text())); re(); return; }
    if (/\.csv$/i.test(f.name)) { const t = await f.text(), sep = (t.split("\n")[0].match(/;/g) || []).length > (t.split("\n")[0].match(/,/g) || []).length ? ";" : ","; return importarFilas(t.split(/\r?\n/).filter(l => l.trim()).map(l => l.split(sep).map(x => x.replace(/^"|"$/g, "").trim()))); }
    await cargarJS("../../tequio/lib/xlsx.full.min.js"); const wb = XLSX.read(await f.arrayBuffer()), ws = wb.Sheets[wb.SheetNames[0]]; importarFilas(XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }).map(r => r.map(x => String(x).trim())));
  } catch (e) { toast("No se pudo leer el archivo: " + esc(e.message || e), 4000); } }
function importarFilas(filas) { if (filas.length < 2) return toast("La tabla necesita una fila de títulos y al menos una fila de datos.");
  const H = filas[0].map(nrm), col = re2 => H.findIndex(h => re2.test(h));
  const cE = col(/escuela|plantel|nombre de la escuela/), cC = col(/clave|cct|c c t/), cD = col(/^director|nombre del director|directora/), cCE = col(/correo.*escuela|email.*escuela|correo de la escuela/), cCD = col(/correo.*direc|email.*direc/), cM = col(/maestr|profes|docente/), cCM = col(/correo.*(maestr|profes|docente)|^correo$|^email$/), cT = col(/turno/), cDo = col(/domicilio|direccion/), cTe = col(/telefono|tel/);
  if (cE < 0 && cC < 0 && cM < 0) return toast("No se reconocieron las columnas. Use títulos como Escuela, Clave, Director, Correo, Maestro.", 4500);
  let n = { e: 0, eA: 0, m: 0 }, ult = null;
  filas.slice(1).forEach(r => { const g = i => i >= 0 ? String(r[i] || "").trim() : ""; let nomE = g(cE).replace(/^\d+\s*[-.)]\s*/, ""), cct = g(cC).toUpperCase(); let e = null;
    if (nomE || cct) { e = D.escuelas.find(x => (cct && x.cct === cct) || (nomE && nrm(x.nombre) === nrm(nomE))); if (!e) { e = { id: uid(), nombre: nomE || cct, cct, zona: D.yo.zona, localidad: "" }; D.escuelas.push(e); n.e++; }
      const set = (k, x) => { if (x && e[k] !== x) { e[k] = x; n.eA++; } }; set("cct", cct); set("director", g(cD)); if (g(cD)) e.dirVerif = false; set("correo", g(cCE).toLowerCase()); set("dirCorreo", g(cCD).toLowerCase()); set("turno", g(cT)); set("domicilio", g(cDo)); set("tel", g(cTe)); ult = e; }
    else e = ult;
    const nm = g(cM), cm = (cCM !== cCE && cCM !== cCD ? g(cCM) : "").toLowerCase(); if (nm) { let m = D.maestros.find(x => (cm && x.correo === cm) || nrm(x.nombre) === nrm(nm)); if (!m) { m = { id: uid(), nombre: nm, correo: cm, escuelas: [] }; D.maestros.push(m); n.m++; } else if (cm && !m.correo) m.correo = cm; if (e && !m.escuelas.includes(e.id)) m.escuelas.push(e.id); } });
  guardar(); re(); toast(`Listo: ${n.e} escuelas nuevas, ${n.eA} datos actualizados, ${n.m} maestros nuevos.`, 4000); }

/* =================================================================== AJUSTES */
VISTAS.ajustes = () => barra("Supervisión", "Ajustes") + `<main class="wrap">
  <section class="card mt"><h3>Sus datos</h3><div class="dos"><label class="campo"><span>Tratamiento</span><select id="yTr">${["Mtro.", "Mtra.", "Profr.", "Profra.", "Lic.", "Dr.", "Dra."].map(x => `<option ${x === D.yo.trato ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="campo"><span>Nombre</span><input id="yNom" value="${esc(D.yo.nombre)}"></label></div>
   <div class="dos"><label class="campo"><span>Cargo</span><input id="yCar" value="${esc(D.yo.cargo)}"></label><label class="campo"><span>Zona escolar</span><input id="yZon" value="${esc(D.yo.zona)}"></label></div>
   <label class="campo"><span>Correo institucional</span><input id="yCor" type="email" value="${esc(D.yo.correo)}"></label><div class="fila fin"><button class="btn p s" id="yOk">Guardar</button></div></section>
  <section class="card mt"><h3>Su firma</h3><p class="small muted mb">Guárdela una vez y úsela al cerrar cada visita.</p>${firmaCaja("yo", D.yo.firma)}</section>
  <section class="card mt"><h3>Enlace para enviar correos</h3><p class="small muted mb">Con el código QR de un maestro, el informe se le envía sin más. Para enviar informes a maestros <b>sin Ulama</b> desde el servidor de la Supervisión, pegue aquí su enlace de acceso (lo da el administrador de Ulama). Sin enlace se abre su correo y se descarga el PDF.</p>
   <label class="campo"><span>Enlace de acceso</span><input id="yTok" value="${D.tok ? "•••••• (guardado)" : ""}" placeholder="https://…#acceso=…"></label><div class="fila fin">${D.tok ? `<button class="btn s r" id="yTokX">Quitar</button>` : ""}<button class="btn s p" id="yTokOk">Guardar enlace</button></div></section>
  <section class="card mt"><h3>Respaldo</h3><p class="small muted mb">Descargue una copia de sus visitas y su catálogo (sin las fotos) por si cambia de dispositivo.</p><div class="fila"><button class="btn" id="yRes">${ic("bajar", 16)} Descargar respaldo</button><button class="btn" id="yCar2">${ic("subir", 16)} Cargar respaldo</button><input type="file" id="fRes" accept=".json" hidden></div></section>${pie()}</main>`;
ENLAZAR.ajustes = () => { $("#yOk").onclick = () => { Object.assign(D.yo, { trato: val("yTr"), nombre: val("yNom").trim() || D.yo.nombre, cargo: val("yCar").trim(), zona: val("yZon").trim(), correo: val("yCor").trim().toLowerCase() }); guardar(); toast("Datos guardados."); };
  enlazarFirmas(D.yo, (k, u) => { D.yo.firma = D.yo.yo || ""; delete D.yo.yo; guardar(); re(); });
  $("#yTokOk").onclick = () => { const t = val("yTok"), m = t.match(/[#&]acceso=([A-Za-z0-9_-]{10,})/) || t.trim().match(/^([A-Za-z0-9_-]{10,})$/); if (!m) return toast("Pegue el enlace completo, que termina en «#acceso=…»."); D.tok = m[1]; guardar(); re(); toast("Enlace guardado."); };
  $("#yTokX") && ($("#yTokX").onclick = () => { D.tok = ""; guardar(); re(); });
  $("#yRes").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(D)], { type: "application/json" })); a.download = `respaldo-ulama-supervision-${hoy()}.json`; a.click(); };
  $("#yCar2").onclick = () => $("#fRes").click(); $("#fRes").onchange = async e => { try { const x = JSON.parse(await e.target.files[0].text()); if (!x.v || !x.yo) throw 0; if (!(await confirmar("Se reemplazarán los datos de este dispositivo por los del respaldo.", "Cargar"))) return; D = Object.assign(VACIO(), x); guardar(); ir("inicio", {}, true); toast("Respaldo cargado."); } catch (er) { toast("El archivo no es un respaldo de Ulama · Supervisión."); } }; };

/* =================================================================== ARRANQUE */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
(function () { const m = (location.hash || "").match(/[#&]c=([A-Za-z0-9]{6})/), t = (location.hash || "").match(/[#&]acceso=([A-Za-z0-9_-]{10,})/);
  if (t) { D.tok = t[1]; guardar(); }
  if (m || t) try { history.replaceState(null, "", location.pathname); } catch (e) {}
  pintar();
  if (m && D.cfg.listo) setTimeout(() => { if (visAct()) return dlgIniciar(); bajarCodigo(m[1]); }, 200);
  else if (m) D.cfg.pend = m[1]; })();
/* si la app ya estaba abierta y se escanea otro QR con la cámara del celular */
window.addEventListener("hashchange", () => { const m = (location.hash || "").match(/[#&]c=([A-Za-z0-9]{6})/); if (!m) return; try { history.replaceState(null, "", location.pathname); } catch (e) {} if (!D.cfg.listo) { D.cfg.pend = m[1]; return; } if (visAct()) return dlgIniciar(); bajarCodigo(m[1]); });
