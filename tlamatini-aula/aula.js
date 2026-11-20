/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Tlamatini Aula · el trabajo diario del maestro de grupo de primaria: mi grupo (también multigrado), pase de lista,
   planeación por proyectos con los contenidos y PDA oficiales del Programa Sintético (Plan 2022) y banco de dinámicas
   y juegos con modo clase. De la familia Tlamatini: comparte el enlace personal y los datos de Tlamatini.
   Todo se guarda en el dispositivo. */
"use strict";
const TLM = "../formatos-ppie/", LIB = TLM + "lib/", ISEP = TLM + "img/isep.png", ESC_IMG = TLM + "img/escuelas/";
const H2P = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hoy = () => iso(new Date());
const dF = k => new Date(k + "T12:00:00");
const DSEM = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], DSEM_L = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"], MES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fCorta = k => { if (!k) return ""; const d = dF(k); return `${DSEM[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}`; };
const fLarga = k => { if (!k) return ""; const d = dF(k); return `${d.getDate()} de ${MES_L[d.getMonth()]} de ${d.getFullYear()}`; };
const corto = n => String(n || "").trim().split(/\s+/).slice(0, 2).join(" ");
const faseDe = g => g <= 2 ? 3 : g <= 4 ? 4 : 5;
const nrm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const titulo = t => String(t || "").toLowerCase().replace(/(^|\s|-)([a-záéíóúüñ])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(De|Del|La|Las|Los|Y)\b/g, w => w.toLowerCase());
const ic = (n, s = 20) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${ICONOS[n] || ""}</svg>`;
const ICONOS = {
  atras: '<path d="M15 18l-6-6 6-6"/>', sig: '<path d="M9 18l6-6-6-6"/>', mas: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12l5 5 9-10"/>',
  grupo: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5c3 0 5.5 1.7 5.5 4.5"/>',
  plan: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>', lista: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  juego: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r="1"/><circle cx="18" cy="13.5" r="1"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  play: '<path d="M7 4l13 8-13 8z"/>', pausa: '<path d="M8 5v14M16 5v14"/>', reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  estrella: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>', impr: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  bajar: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>', subir: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>', lapiz: '<path d="M4 20h4L20 8l-4-4L4 16z"/>',
  basura: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', agenda: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>', buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  libro: '<path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z"/>', doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'
};

/* ---------------- datos ---------------- */
const DEMO = (() => { let on = false; try { on = sessionStorage.getItem("aula-demo") === "1"; } catch (e) {} if (/[#&]demo(?![\w-])/.test(location.hash)) { on = true; try { sessionStorage.setItem("aula-demo", "1"); } catch (e) {} history.replaceState(null, "", location.pathname); } return on; })();
const CLAVE = DEMO ? "aula-demo" : "aula-datos";
const VACIO = () => ({ v: 1, docente: { nombre: "", correo: "" }, grupos: [], gact: "", planes: [], asis: {}, favs: [], mias: [], cfg: {} });
let D = cargar();
function cargar() { try { const x = JSON.parse(localStorage.getItem(CLAVE) || "null"); if (x && x.v) return Object.assign(VACIO(), x); } catch (e) {} return VACIO(); }
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(D)); } catch (e) { toast("<b>No se pudo guardar.</b> El dispositivo no tiene espacio."); } }
const LS = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const grDe = id => D.grupos.find(g => g.id === id), plDe = id => D.planes.find(p => p.id === id);
const gAct = () => grDe(D.gact) || D.grupos[0] || null;
const activos = g => (g ? g.alumnos || [] : []).filter(a => !a.baja).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
const grNom = g => g ? (g.grados.length > 1 ? `Multigrado ${g.grados.map(x => x + ".°").join(", ")}` : `${g.grados[0]}.°`) + (g.grupo ? " " + g.grupo : "") : "";
const yo = () => { const t = LS("tlm-yo"), p = LS("ppie-perfil") || {}; return { nombre: D.docente.nombre || (t && t.persona ? [t.persona.trato, t.persona.nombre].filter(Boolean).join(" ") : p.minombre || ""), correo: D.docente.correo || (t && t.persona ? t.persona.correo : p.micorreo || "") }; };

/* ---------------- programa y calendario ---------------- */
let PDA = null, CAL = null;
async function programa() { if (PDA) return PDA; try { const r = await fetch(TLM + "formatos/pda.json"); if (r.ok) { PDA = await r.json(); try { localStorage.setItem("aula-pda", JSON.stringify(PDA)); } catch (e) {} } } catch (e) {} if (!PDA) PDA = LS("aula-pda"); return PDA; }
async function calendario() { if (CAL) return CAL; try { const r = await fetch(TLM + "formatos/calendario.json"); if (r.ok) CAL = await r.json(); } catch (e) {} return CAL || { vacaciones: [], eventos: [] }; }
function sinClase(k) { const c = CAL || { vacaciones: [], eventos: [] }; const v = (c.vacaciones || []).find(([a, b]) => k >= a && k <= b); if (v) return v[2];
  const e = (c.eventos || []).find(([a, b, t]) => k >= a && k <= b && /suspensi|consejo t[eé]cnico|fin de clases|clausura/i.test(t)); return e ? e[2] : null; }
function diasHabiles(desde, n) { const out = [], d = dF(desde); for (let i = 0; i < 400 && out.length < n; i++, d.setDate(d.getDate() + 1)) { const k = iso(d); if (d.getDay() === 0 || d.getDay() === 6 || sinClase(k)) continue; out.push(k); } return out; }
const CAMPOS = ["Lenguajes", "Saberes y pensamiento científico", "Ética, naturaleza y sociedades", "De lo humano y lo comunitario"];
const CAMPO_COD = { "Lenguajes": "L", "Saberes y pensamiento científico": "S", "Ética, naturaleza y sociedades": "E", "De lo humano y lo comunitario": "H" };
const EJES = ["Inclusión", "Pensamiento crítico", "Interculturalidad crítica", "Igualdad de género", "Vida saludable", "Apropiación de las culturas a través de la lectura y la escritura", "Artes y experiencias estéticas"];
const ESCENARIOS = { aula: "Aula", escolar: "Escolar", comunitario: "Comunitario" };
const METODOS = {
  comunitarios: { n: "Proyectos comunitarios", campo: "Lenguajes", fases: [
    ["Identificación", "Se plantea una situación o problema de la vida cotidiana relacionado con el contenido; los alumnos expresan lo que saben y lo que quieren saber."],
    ["Recuperación", "Se recuperan saberes previos y experiencias de los alumnos y de su comunidad sobre el tema."],
    ["Planificación", "Se acuerdan con el grupo las acciones, los tiempos, los materiales y el producto del proyecto."],
    ["Acercamiento", "Se exploran ejemplos, textos y fuentes; se hace un primer borrador o acercamiento al producto."],
    ["Comprensión y producción", "Se analizan, comprenden y producen los textos o productos; se revisan en colectivo."],
    ["Reconocimiento", "Se identifican avances y dificultades; se hacen ajustes al producto."],
    ["Concreción", "Se elabora la versión final del producto."],
    ["Integración y difusión", "Se presenta el producto a la escuela, la familia o la comunidad."],
    ["Consideraciones y avances", "Se reflexiona sobre lo aprendido, el impacto del proyecto y lo que se puede mejorar."]] },
  steam: { n: "Aprendizaje basado en indagación (STEAM)", campo: "Saberes y pensamiento científico", fases: [
    ["Introducción al tema", "Se plantea una pregunta o fenómeno; los alumnos expresan sus ideas e hipótesis."],
    ["Diseño de investigación", "Se planea cómo responder la pregunta: experimento, observación, entrevista o búsqueda de información."],
    ["Organizar y estructurar las respuestas", "Se realizan las actividades de indagación, se registran y organizan los datos (tablas, gráficas, dibujos)."],
    ["Presentación de los resultados", "Se comparten los hallazgos y se contrastan con las hipótesis iniciales."],
    ["Metacognición", "Se reflexiona sobre qué se aprendió, cómo se aprendió y qué nuevas preguntas surgieron."]] },
  abp: { n: "Aprendizaje basado en problemas (ABP)", campo: "Ética, naturaleza y sociedades", fases: [
    ["Presentemos", "Se presenta una situación problemática real del entorno que despierte el interés del grupo."],
    ["Recolectemos", "Se recaban saberes previos e información sobre la situación."],
    ["Formulemos el problema", "Se define con claridad el problema a resolver."],
    ["Organicemos la experiencia", "Se planean las acciones, responsables, tiempos y materiales para atender el problema."],
    ["Vivamos la experiencia", "Se llevan a cabo las acciones planeadas, con acompañamiento del docente."],
    ["Resultados y análisis", "Se valoran los resultados, se reflexiona sobre el proceso y se proponen mejoras."]] },
  servicio: { n: "Aprendizaje servicio (AS)", campo: "De lo humano y lo comunitario", fases: [
    ["Punto de partida", "Se identifica una necesidad de la escuela o la comunidad que el grupo puede atender."],
    ["Lo que sé y lo que quiero saber", "Se recupera lo que el grupo sabe y lo que necesita investigar sobre esa necesidad."],
    ["Organicemos las actividades", "Se planea el servicio: qué se hará, con quién, cuándo y con qué recursos."],
    ["Creatividad en marcha", "Se realiza el servicio a la comunidad, registrando lo que sucede."],
    ["Compartimos y evaluamos lo aprendido", "Se comparte la experiencia, se valora el impacto y lo aprendido."]] }
};

/* ---------------- acceso ---------------- */
let ACC = null;
const sha256 = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, "0")).join("");
async function acceso() {
  if (DEMO) return true;
  const h = location.hash || "", mt = h.match(/[#&]t=([A-Za-z0-9_-]{20,})/), ma = h.match(/[#&]acceso=([A-Za-z0-9_-]{10,})/);
  if (mt) localStorage.setItem("tlp-token", JSON.stringify(mt[1])); if (ma) localStorage.setItem("acc-token", JSON.stringify(ma[1]));
  if (mt || ma) history.replaceState(null, "", location.pathname);
  try { const r = await fetch(TLM + "formatos/acceso.json?t=" + Date.now(), { cache: "no-store" }); if (r.ok) { ACC = await r.json(); localStorage.setItem("acc-cache", JSON.stringify(ACC)); } } catch (e) {} if (!ACC) ACC = LS("acc-cache");
  if (LS("gh-token")) return true;   // la Supervisión
  const pase = LS("tequio-pase"); if (pase && ["admin", "atp", "director"].includes(pase.rol) && pase.vence >= hoy()) return true;
  const tp = LS("tlp-token"); if (tp) { const ok = await tlpValidar(tp); if (ok) return true; }
  const ta = LS("acc-token"); if (ta && ACC) { const hh = await sha256(ta), en = (ACC.enlaces || []).find(x => x.h === hh);
    if (en && !en.anulado && en.gen === ACC.generacion && en.vence >= hoy()) return true; }
  return false;
}
async function tlpValidar(tok) { const srv = ACC && ACC.tequio; let j = null;
  if (srv && navigator.onLine !== false) { try { const r = await fetch(srv, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion: "tlpPerfil", datos: { tok } }) }); j = await r.json(); } catch (e) { j = null; } }
  if (j && j.ok && Array.isArray(j.escuelas)) { localStorage.setItem("tlm-yo", JSON.stringify({ persona: j.persona, escuelas: j.escuelas, fecha: j.fecha })); return true; }
  if (j && !j.ok && /anulado|no es v[aá]lido|vigente/i.test(j.mensaje || j.error || "")) { localStorage.removeItem("tlp-token"); return false; }
  return !!LS("tlm-yo"); }

/* ---------------- navegación ---------------- */
let S = { v: "inicio" }; const PILA = [];
function ir(v, p = {}, reemplazar) { if (!reemplazar) { PILA.push(S); history.pushState({ n: PILA.length }, ""); } S = Object.assign({ v }, p); pintar(); window.scrollTo(0, 0); }
function atras() { S = PILA.pop() || { v: "inicio" }; pintar(); window.scrollTo(0, 0); }
window.addEventListener("popstate", () => { if ($("#clase")) return cerrarClase(); if (PILA.length || S.v !== "inicio") atras(); });
const VISTAS = {}, ENLAZAR = {};
let ACCESO_OK = false;
function pintar() { cerrarDlg(); if (!ACCESO_OK) S = { v: "bloqueo" }; else if (!D.grupos.length && !["grupoForm", "ajustes"].includes(S.v)) S = { v: "bienvenida" };
  const f = VISTAS[S.v] || VISTAS.inicio; $("#app").innerHTML = (DEMO ? `<div class="banda-demo">Demostración con datos ficticios · puede usar todo <button id="dSalir">Salir</button></div>` : "") + f(); (ENLAZAR[S.v] || (() => {}))();
  const b = $("#atras"); if (b) b.onclick = () => history.back(); const ds = $("#dSalir"); if (ds) ds.onclick = () => { try { sessionStorage.removeItem("aula-demo"); localStorage.removeItem("aula-demo"); } catch (e) {} location.href = location.pathname; }; }
const re = () => { const y = scrollY; pintar(); scrollTo(0, y); };
const barra = (eb, t, der = "") => `<header class="top"><div class="top-in"><button class="back" id="atras" aria-label="Regresar">${ic("atras")}</button><div style="min-width:0"><div class="eb">${eb}</div><h1>${t}</h1></div><div class="der">${der}</div></div></header>`;
function toast(h, ms = 2800) { const t = $("#toast"); t.innerHTML = h; t.classList.add("ver"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("ver"), ms); }
function dlg(html, alAbrir) { cerrarDlg(); const v = document.createElement("div"); v.className = "velo"; v.id = "velo"; v.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
  v.addEventListener("click", e => { if (e.target === v) cerrarDlg(); }); document.body.appendChild(v); document.body.style.overflow = "hidden"; alAbrir && alAbrir(v); }
function cerrarDlg() { const v = $("#velo"); if (v) v.remove(); document.body.style.overflow = ""; }
function confirmar(msg, si = "Sí, continuar") { return new Promise(ok => dlg(`<h3>¿Seguro?</h3><p class="mb">${esc(msg)}</p><div class="fila fin"><button class="btn" id="qNo">Cancelar</button><button class="btn r" id="qSi">${esc(si)}</button></div>`, v => {
  v.querySelector("#qNo").onclick = () => { cerrarDlg(); ok(false); }; v.querySelector("#qSi").onclick = () => { cerrarDlg(); ok(true); }; })); }
const val = id => (document.getElementById(id) || {}).value || "";
const _libs = {};
function cargarJS(src) { return _libs[src] || (_libs[src] = new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => { delete _libs[src]; no(new Error("No se pudo cargar " + src)); }; document.head.appendChild(s); })); }
const enApp = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const marca = (claro) => `<div class="marca"><img src="img/aula-icono.svg" alt=""><div><div class="mk-n">Tlamatini <b>Aula</b></div><div class="mk-l">El saber, en acción</div></div></div>`;
const pie = () => `<p class="pie">Tlamatini Aula · de la familia Tlamatini · Supervisión Escolar Zona 050 · ISEP</p><div class="firma-autor"><span>Desarrollada por</span><img src="${TLM}firma-autor.svg" alt="Maestro Carlos Ortega" width="200" height="65"></div>`;

/* =================================================================== BLOQUEO */
VISTAS.bloqueo = () => `<main class="wrap"><section class="portada">${marca()}<h1>Su aula, con todo a la mano</h1><p>Planeación con los contenidos y PDA oficiales de su grado, su grupo, el pase de lista y un banco de dinámicas y juegos para la clase.</p></section>
  <section class="card mt"><h3>Entre con su enlace personal</h3><p class="muted mb">Tlamatini Aula usa el <b>mismo enlace personal de Tlamatini</b> que le llegó a su correo institucional. Ábralo una vez desde ese correo, o péguelo aquí.</p>
   <label class="campo"><span>Su enlace de Tlamatini</span><input id="bEnl" type="url" autocomplete="off" placeholder="https://carlosog23.github.io/…"></label>
   <div class="fila"><button class="btn p" id="bOk">Entrar</button><a class="btn" href="#demo" id="bDemo">${ic("play", 16)} Ver demostración</a></div>
   <p class="small muted mt">¿No tiene enlace? Pídalo a la Supervisión Escolar Zona 050: supervision050sep@gmail.com</p></section>${pie()}</main>`;
ENLAZAR.bloqueo = () => { $("#bOk").onclick = async () => { const v = val("bEnl"), m = v.match(/[#&](t|acceso)=([A-Za-z0-9_-]{10,})/); if (!m) return toast("Pegue el enlace completo que le llegó por correo.");
    localStorage.setItem(m[1] === "t" ? "tlp-token" : "acc-token", JSON.stringify(m[2])); toast("Revisando su enlace…"); ACCESO_OK = await acceso(); if (!ACCESO_OK) return toast("Ese enlace ya no es válido. Pida uno nuevo a la Supervisión.", 4000); arrancarDatos(); pintar(); };
  $("#bDemo").onclick = e => { e.preventDefault(); try { sessionStorage.setItem("aula-demo", "1"); } catch (er) {} location.reload(); }; };

/* =================================================================== BIENVENIDA Y GRUPO */
function escuelasMias() { const t = LS("tlm-yo"), p = LS("ppie-perfil") || {}, out = [];
  if (t && Array.isArray(t.escuelas)) t.escuelas.forEach(e => out.push({ cct: e.cct, nombre: "Escuela Primaria " + e.nombre, turno: e.turno || "", dir: e.dir || "", cargoDir: e.cargo || "", loc: e.loc || "", mun: e.mun || "", dom: e.dom || "" }));
  if (p.cct && !out.some(e => e.cct === p.cct)) out.push({ cct: p.cct, nombre: p.escuela || "", turno: p.turno || "", dir: p.director || "", loc: p.localidad || "", mun: p.municipio || "", dom: p.domicilio || "" });
  if (DEMO && !out.length) out.push({ cct: "02DPR9999Z", nombre: "Escuela Primaria «Cuauhtémoc» (ejemplo)", turno: "Matutino", dir: "Ramón Ejemplo Torres", cargoDir: "Director", loc: "Camalú", mun: "San Quintín", dom: "Calle Revolución s/n" });
  return out; }
VISTAS.bienvenida = () => { const y = yo(); return `<main class="wrap"><section class="portada">${marca()}<h1>Hola${y.nombre ? ", " + esc(corto(y.nombre.replace(/^(Mtr[oa]\.|C\.)\s*/, ""))) : ""}</h1>
  <p>Para empezar, registre su grupo. Si tiene doble plaza o más de un grupo, después puede agregar los demás.</p></section>
  <div class="mt">${formGrupoHTML({})}</div>${pie()}</main>`; };
ENLAZAR.bienvenida = () => enlazarFormGrupo({}, true);
function formGrupoHTML(g) { const escs = escuelasMias(), gr = g.grados || [];
  return `<section class="card"><h3>${g.id ? "Editar grupo" : "Mi grupo"}</h3>
   <label class="campo"><span>Escuela</span><select id="gE">${escs.map(e => `<option value="${esc(e.cct)}" ${e.cct === g.cct ? "selected" : ""}>${esc(e.nombre)}${e.turno ? " · " + esc(e.turno) : ""}</option>`).join("")}<option value="otra" ${g.cct && !escs.some(e => e.cct === g.cct) ? "selected" : ""}>Otra escuela…</option></select></label>
   <div id="gOtra" ${escs.length && !(g.cct && !escs.some(e => e.cct === g.cct)) ? "hidden" : ""}><div class="dos"><label class="campo"><span>Nombre de la escuela</span><input id="gEN" value="${esc(g.escuela || "")}"></label><label class="campo"><span>C.C.T.</span><input id="gEC" value="${esc(g.cct || "")}" style="text-transform:uppercase"></label></div></div>
   <div class="campo"><span>Grado(s) <small>· si es multigrado, toque todos los grados de su grupo</small></span><div class="chips" id="gG">${[1, 2, 3, 4, 5, 6].map(n => `<button type="button" class="chip" data-g="${n}" aria-pressed="${gr.includes(n)}">${n}.°</button>`).join("")}</div></div>
   <div class="dos"><label class="campo"><span>Grupo</span><input id="gL" maxlength="3" value="${esc(g.grupo || "")}" placeholder="A" style="text-transform:uppercase"></label>
   <label class="campo"><span>Turno</span><select id="gT">${["Matutino", "Vespertino", "Tiempo completo"].map(t => `<option ${t === (g.turno || (escs[0] || {}).turno) ? "selected" : ""}>${t}</option>`).join("")}</select></label></div>
   <div class="fila fin">${g.id ? `<button class="btn r" id="gB" style="margin-right:auto">${ic("basura", 16)}</button>` : ""}<button class="btn p" id="gOk">${ic("check", 18)} ${g.id ? "Guardar" : "Guardar y seguir"}</button></div></section>`; }
function enlazarFormGrupo(g, nuevo) { const sel = new Set(g.grados || []);
  $$("#gG .chip").forEach(b => b.onclick = () => { const n = +b.dataset.g; sel.has(n) ? sel.delete(n) : sel.add(n); b.setAttribute("aria-pressed", sel.has(n)); });
  $("#gE").onchange = e => { $("#gOtra").hidden = e.target.value !== "otra"; };
  $("#gOk").onclick = () => { if (!sel.size) return toast("Elija el grado (o los grados) de su grupo."); const cct = val("gE"), e = escuelasMias().find(x => x.cct === cct);
    const datos = { cct: cct === "otra" ? val("gEC").trim().toUpperCase() : cct, escuela: cct === "otra" ? val("gEN").trim() : e.nombre, turno: val("gT"), grados: [...sel].sort(), grupo: val("gL").trim().toUpperCase(),
      dir: e ? e.dir : "", cargoDir: e ? e.cargoDir : "", loc: e ? e.loc : "", mun: e ? e.mun : "" };
    if (cct === "otra" && !datos.escuela) return toast("Escriba el nombre de la escuela.");
    if (g.id) { Object.assign(g, datos); guardar(); history.back(); toast("Grupo guardado."); return; }
    const n = Object.assign({ id: uid(), alumnos: [] }, datos); D.grupos.push(n); D.gact = n.id; const y = yo(); if (!D.docente.nombre) D.docente.nombre = y.nombre; if (!D.docente.correo) D.docente.correo = y.correo; guardar();
    if (nuevo) { S = { v: "grupo", id: n.id, nuevo: true }; pintar(); } else { history.back(); } toast("Grupo registrado. Ahora agregue a sus alumnos."); };
  $("#gB") && ($("#gB").onclick = async () => { if (!(await confirmar("Se borrará el grupo con sus alumnos y su asistencia. Las planeaciones se conservan.", "Borrar"))) return; D.grupos = D.grupos.filter(x => x !== g); D.gact = (D.grupos[0] || {}).id || ""; guardar(); ir("inicio", {}, true); }); }
VISTAS.grupoForm = () => barra("Mi grupo", S.id ? "Editar grupo" : "Agregar grupo") + `<main class="wrap mt">${formGrupoHTML(grDe(S.id) || {})}</main>`;
ENLAZAR.grupoForm = () => enlazarFormGrupo(grDe(S.id) || {}, false);

/* =================================================================== INICIO */
VISTAS.inicio = () => { const g = gAct(), y = yo(), k = hoy(), d = new Date(), sc = sinClase(k), hoySes = [];
  D.planes.filter(p => p.gid === (g && g.id)).forEach(p => p.sesiones.forEach((s, i) => { if (s.fecha === k) hoySes.push({ p, s, i }); }));
  const prox = []; D.planes.filter(p => p.gid === (g && g.id)).forEach(p => p.sesiones.forEach((s, i) => { if (s.fecha > k && !s.hecho) prox.push({ p, s, i }); })); prox.sort((a, b) => a.s.fecha.localeCompare(b.s.fecha));
  return `<main class="wrap"><section class="portada">${marca()}<h1>Hola, ${esc(corto(y.nombre.replace(/^(Mtr[oa]\.|C\.)\s*/, "")) || "maestro(a)")}</h1>
   <p>${DSEM_L[d.getDay()][0].toUpperCase() + DSEM_L[d.getDay()].slice(1)} ${fLarga(k)}${sc ? ` · <b>${esc(sc)}</b>` : ""}</p>
   ${D.grupos.length > 1 ? `<div class="chips mt">${D.grupos.map(x => `<button class="chip osc" data-ga="${x.id}" aria-pressed="${x === g}">${esc(grNom(x))} · ${esc(String(x.escuela).replace(/^Escuela Primaria\s*/i, ""))}</button>`).join("")}</div>` : `<p class="small" style="margin-top:6px;opacity:.85">${esc(grNom(g))} · ${esc(g.escuela)} · ${activos(g).length} alumnos</p>`}
   <div class="fila"><button class="btn m" id="bLista">${ic("lista")} Pasar lista</button><button class="btn sec" id="bPlanN">${ic("mas")} Nueva planeación</button>${enApp() ? "" : `<button class="btn sec" id="bInst">${ic("bajar")} Instalar app</button>`}</div></section>
  ${hoySes.length ? `<h2 class="sec-t">Hoy en clase</h2><div class="lista">${hoySes.map(x => `<button class="hoy-i" data-ses="${x.p.id}|${x.i}"><span class="gr">${x.i + 1}</span><span class="tx"><b>${esc(x.p.titulo)}</b><small>Sesión ${x.i + 1} de ${x.p.sesiones.length} · ${esc(x.s.fase)}</small></span><span class="tag ${x.s.hecho ? "" : "m"}">${x.s.hecho ? "Dada" : "Dar la clase"}</span></button>`).join("")}</div>` : ""}
  ${!hoySes.length && prox.length ? `<h2 class="sec-t">Lo que sigue</h2><div class="lista">${prox.slice(0, 3).map(x => `<button class="hoy-i" data-ses="${x.p.id}|${x.i}"><span class="gr">${x.i + 1}</span><span class="tx"><b>${esc(x.p.titulo)}</b><small>${fCorta(x.s.fecha)} · ${esc(x.s.fase)}</small></span>${ic("sig", 18)}</button>`).join("")}</div>` : ""}
  <h2 class="sec-t">Su aula</h2><div class="puertas">
   <button class="puerta" data-v="planes" style="--c:#24427A;--c-s:#E6ECF6"><span class="ic">${ic("plan")}</span><b>Planeación</b><span>${D.planes.filter(p => p.gid === (g && g.id)).length} proyectos · contenidos y PDA oficiales de su grado</span></button>
   <button class="puerta" data-v="dinamicas" style="--c:#C2603A;--c-s:#F7E3D8"><span class="ic">${ic("juego")}</span><b>Dinámicas y juegos</b><span>${DINAMICAS.length + D.mias.length} actividades para iniciar, activar, jugar y cerrar</span></button>
   <button class="puerta" data-v="grupo" style="--c:#1B7560;--c-s:#DBEFE8"><span class="ic">${ic("grupo")}</span><b>Mi grupo</b><span>${activos(g).length} alumnos · altas, bajas y lista de RELweb</span></button>
   <button class="puerta" data-v="asistencia" style="--c:#8A5A08;--c-s:#FAEBCB"><span class="ic">${ic("agenda")}</span><b>Asistencia del mes</b><span>Concentrado para imprimir</span></button>
   <button class="puerta" data-v="ajustes" style="--c:#6A5C4C;--c-s:#EFE6D6"><span class="ic">${ic("ajustes")}</span><b>Ajustes y respaldo</b><span>Sus datos, sus grupos y copia de seguridad</span></button>
   <a class="puerta" href="${TLM}" style="--c:#1F3A6B;--c-s:#F4E1C1;text-decoration:none;color:inherit"><span class="ic">${ic("doc")}</span><b>Tlamatini</b><span>Formatos, documentos y trámites de la escuela</span></a></div>${pie()}</main>`; };
ENLAZAR.inicio = () => { $$("[data-ga]").forEach(b => b.onclick = () => { D.gact = b.dataset.ga; guardar(); re(); }); $("#bLista").onclick = () => ir("lista"); $("#bPlanN").onclick = () => ir("planNueva");
  $("#bInst") && ($("#bInst").onclick = instalar); $$(".puerta[data-v]").forEach(b => b.onclick = () => ir(b.dataset.v));
  $$("[data-ses]").forEach(b => b.onclick = () => { const [pid, i] = b.dataset.ses.split("|"); abrirClase(pid, +i); }); };
let PROMPT_INST = null; window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); PROMPT_INST = e; });
function instalar() { if (PROMPT_INST) { PROMPT_INST.prompt(); PROMPT_INST = null; return; }
  dlg(`<h3>Instalar Tlamatini Aula</h3><p class="mb">En <b>iPhone o iPad</b> (Safari): Compartir → «Agregar a pantalla de inicio».<br>En <b>Android</b> (Chrome): menú ⋮ → «Instalar app».<br>En <b>computadora</b> (Chrome o Edge): el ícono de instalar en la barra de direcciones.</p><div class="fila fin"><button class="btn p" id="iX">Entendido</button></div>`, v => v.querySelector("#iX").onclick = cerrarDlg); }

/* =================================================================== MI GRUPO */
VISTAS.grupo = () => { const g = grDe(S.id) || gAct(); if (!g) return VISTAS.inicio(); const al = activos(g), bajas = (g.alumnos || []).filter(a => a.baja);
  return barra("Mi grupo", esc(grNom(g)), `<button class="btn s" id="gEd">${ic("lapiz", 16)} Editar</button>`) + `<main class="wrap">
  <p class="muted small mt">${esc(g.escuela)}${g.cct ? " · " + esc(g.cct) : ""} · ${esc(g.turno)}</p>
  ${S.nuevo || !al.length ? `<section class="card mt" style="border-left:5px solid var(--jade)"><h3>Agregue a sus alumnos</h3><p class="small muted mb">Elija la forma más fácil. Se pueden corregir después.</p>
   <div class="lista">${LS("ppie-dir") && (LS("ppie-dir").alumnos || []).length ? `<button class="it btnit" id="aDir"><span class="av">${ic("doc", 18)}</span><span class="tx"><b>Traerlos del directorio de Tlamatini</b><small>Los alumnos que ya capturó en Tlamatini</small></span></button>` : ""}
   <button class="it btnit" id="aPdf"><span class="av">${ic("subir", 18)}</span><span class="tx"><b>Subir la lista de RELweb (PDF)</b><small>La lista de asistencia o de inscripción que descarga de RELweb</small></span></button>
   <button class="it btnit" id="aPeg"><span class="av">${ic("lista", 18)}</span><span class="tx"><b>Pegar o escribir la lista</b><small>Un nombre por renglón</small></span></button></div></section>` : ""}
  <div class="fila mt" style="justify-content:space-between"><h2 class="sec-t" style="margin:0">${al.length} alumnos</h2><span class="fila" style="gap:6px"><button class="btn s" id="aMas">${ic("mas", 16)} Alumno</button>${al.length ? `<button class="btn s" id="aImp">${ic("subir", 16)} Importar</button>` : ""}</span></div>
  <div class="lista mt">${al.map((a, i) => `<button class="it btnit" data-a="${a.id}"><span class="av">${i + 1}</span><span class="tx"><b>${esc(a.nombre)}</b><small>${g.grados.length > 1 ? (a.g ? a.g + ".° grado" : "<span style='color:var(--rojo)'>Falta indicar su grado</span>") : ""}${a.nee ? (g.grados.length > 1 ? " · " : "") + "Requiere ajustes: " + esc(a.nee) : ""}</small></span>${ic("lapiz", 16)}</button>`).join("") || `<div class="vacio">Todavía no hay alumnos.</div>`}</div>
  ${bajas.length ? `<details class="mt"><summary class="small muted">Bajas (${bajas.length})</summary><div class="lista mt">${bajas.map(a => `<div class="it"><span class="tx"><b>${esc(a.nombre)}</b><small>Baja ${fCorta(a.baja)}</small></span><button class="btn s" data-re="${a.id}">Reactivar</button></div>`).join("")}</div></details>` : ""}
  <input type="file" id="fPdf" accept="application/pdf" hidden></main>`; };
ENLAZAR.grupo = () => { const g = grDe(S.id) || gAct(); if (!g) return;
  $("#gEd").onclick = () => ir("grupoForm", { id: g.id });
  const imp = () => dlg(`<h3>Importar alumnos</h3><div class="lista">${LS("ppie-dir") ? `<button class="it btnit" id="iDir"><span class="tx"><b>Del directorio de Tlamatini</b></span></button>` : ""}<button class="it btnit" id="iPdf"><span class="tx"><b>Lista de RELweb (PDF)</b></span></button><button class="it btnit" id="iPeg"><span class="tx"><b>Pegar o escribir</b></span></button></div><div class="fila fin mt"><button class="btn" id="iX">Cancelar</button></div>`, v => {
    v.querySelector("#iX").onclick = cerrarDlg; v.querySelector("#iDir") && (v.querySelector("#iDir").onclick = () => desdeDir(g)); v.querySelector("#iPdf").onclick = () => { cerrarDlg(); $("#fPdf").click(); }; v.querySelector("#iPeg").onclick = () => pegarLista(g); });
  $("#aImp") && ($("#aImp").onclick = imp); $("#aDir") && ($("#aDir").onclick = () => desdeDir(g)); $("#aPdf") && ($("#aPdf").onclick = () => $("#fPdf").click()); $("#aPeg") && ($("#aPeg").onclick = () => pegarLista(g));
  $("#fPdf").onchange = e => { leerPdf(g, e.target.files[0]); e.target.value = ""; };
  $("#aMas").onclick = () => formAlumno(g, null); $$("[data-a]").forEach(b => b.onclick = () => formAlumno(g, g.alumnos.find(a => a.id === b.dataset.a)));
  $$("[data-re]").forEach(b => b.onclick = () => { const a = g.alumnos.find(x => x.id === b.dataset.re); delete a.baja; guardar(); re(); }); };
function agregarAlumnos(g, nombres, grado) { const ya = new Set(g.alumnos.map(a => nrm(a.nombre))); let n = 0;
  nombres.forEach(x => { const o = typeof x === "string" ? { nombre: x } : x; const k = nrm(o.nombre); if (!k || ya.has(k)) return; ya.add(k); g.alumnos.push({ id: uid(), nombre: o.nombre.trim(), g: o.g || grado || (g.grados.length === 1 ? g.grados[0] : 0), curp: o.curp || "" }); n++; });
  guardar(); S.nuevo = false; re(); toast(n ? `Se agregaron ${n} alumnos.` : "No había alumnos nuevos en la lista.", 3500); }
function desdeDir(g) { const d = LS("ppie-dir") || {}, L = (d.alumnos || []).filter(a => !a.baja && a.nombre);
  const enGrado = L.filter(a => g.grados.includes(+String(a.grado || "").replace(/\D/g, "")) && (!g.grupo || !a.grupo || String(a.grupo).toUpperCase() === g.grupo));
  const usar = enGrado.length ? enGrado : L; cerrarDlg();
  if (!usar.length) return toast("Su directorio de Tlamatini no tiene alumnos.");
  agregarAlumnos(g, usar.map(a => ({ nombre: a.nombre, g: +String(a.grado || "").replace(/\D/g, "") || 0, curp: a.curp || "" }))); }
function pegarLista(g) { dlg(`<h3>Pegar la lista</h3><p class="small muted mb">Un alumno por renglón. Puede copiarla de Excel, Word o WhatsApp.</p>
   ${g.grados.length > 1 ? `<label class="campo"><span>¿De qué grado son estos alumnos?</span><select id="pG">${g.grados.map(n => `<option value="${n}">${n}.°</option>`).join("")}</select></label>` : ""}
   <textarea id="pT" class="area" style="min-height:220px" placeholder="Ana López Ruiz&#10;Bruno Pérez Díaz&#10;…"></textarea><div class="fila fin mt"><button class="btn" id="pX">Cancelar</button><button class="btn p" id="pOk">Agregar</button></div>`, v => {
    v.querySelector("#pX").onclick = cerrarDlg; v.querySelector("#pOk").onclick = () => { const L = val("pT").split(/\n/).map(l => l.replace(/^[\s\d.)\-–:|]+/, "").replace(/\t.*$/, "").trim()).filter(l => l.length > 3).map(l => /^[A-ZÁÉÍÓÚÜÑ\s'./*-]+$/.test(l) ? titulo(l.includes("*") ? nombreRel(l) : l) : l);
      const gr = +val("pG") || 0; cerrarDlg(); agregarAlumnos(g, L.map(n => ({ nombre: n, g: gr }))); }; }); }
function formAlumno(g, a) { const n = !a; a = a || { id: uid(), nombre: "", g: g.grados.length === 1 ? g.grados[0] : 0 };
  dlg(`<h3>${n ? "Nuevo alumno" : "Alumno"}</h3><label class="campo"><span>Nombre completo</span><input id="aN" value="${esc(a.nombre)}"></label>
   ${g.grados.length > 1 ? `<div class="campo"><span>Grado</span><div class="chips">${g.grados.map(x => `<button type="button" class="chip" data-ag="${x}" aria-pressed="${a.g === x}">${x}.°</button>`).join("")}</div></div>` : ""}
   <label class="campo"><span>¿Requiere ajustes razonables? (opcional, solo usted lo ve)</span><input id="aE" value="${esc(a.nee || "")}" placeholder="Ej. baja visión: sentarlo al frente"></label>
   <div class="fila fin">${n ? "" : `<button class="btn r" id="aB" style="margin-right:auto">Dar de baja</button>`}<button class="btn" id="aX">Cancelar</button><button class="btn p" id="aOk">Guardar</button></div>`, v => {
    let gr = a.g; v.querySelectorAll("[data-ag]").forEach(b => b.onclick = () => { gr = +b.dataset.ag; v.querySelectorAll("[data-ag]").forEach(x => x.setAttribute("aria-pressed", x === b)); });
    v.querySelector("#aX").onclick = cerrarDlg;
    v.querySelector("#aOk").onclick = () => { const nm = val("aN").trim(); if (!nm) return toast("Escriba el nombre."); a.nombre = nm; a.g = gr; a.nee = val("aE").trim(); if (n) g.alumnos.push(a); guardar(); re(); };
    v.querySelector("#aB") && (v.querySelector("#aB").onclick = () => { a.baja = hoy(); guardar(); re(); toast(`${esc(corto(a.nombre))} quedó dado de baja.`); }); }); }
/* lista de RELweb en PDF */
async function pdfjs() { await cargarJS(LIB + "pdf.min.js"); const L = window.pdfjsLib; L.GlobalWorkerOptions.workerSrc = new URL(LIB + "pdf.worker.min.js", location.href).href; return L; }
async function pdfLineas(file) { const L = await pdfjs(); const doc = await L.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; const lines = [];
  for (let p = 1; p <= doc.numPages; p++) { const tc = await (await doc.getPage(p)).getTextContent(); const rows = [];
    for (const it of tc.items) { if (!it.str.trim()) continue; const x = it.transform[4], y = it.transform[5]; let r = rows.find(r => Math.abs(r.y - y) < 3); if (!r) { r = { y, items: [] }; rows.push(r); } r.items.push({ x, s: it.str, w: it.width }); }
    rows.sort((a, b) => b.y - a.y); for (const r of rows) { r.items.sort((a, b) => a.x - b.x); let t = "", end = null; for (const i of r.items) { if (end !== null && i.x - end > 1.5) t += " "; t += i.s; end = i.x + i.w; } lines.push(t.replace(/\s+/g, " ").trim()); } }
  return lines; }
const CURP_RE = /[A-Z][AEIOUX][A-Z]{2}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d/;
const nombreRel = raw => { const [ap, rest] = raw.split("*"); const [p, m] = (ap || "").split("/").map(x => x.trim()); return [p, m, (rest || "").trim()].filter(Boolean).join(" ").replace(/\s+/g, " "); };
function parseRel(lines) { const txt = lines.join("\n"), g = { grado: "", alumnos: [] }; let m; if (m = /Grado:\s*(\d)/.exec(txt)) g.grado = m[1];
  const re1 = /^(\d{1,3})\s+([A-Z][A-Z0-9]{17})\s+(.+?)\s+([HM])\s+\d{1,2}\/\d{1,2}\/\d{4}/;
  for (const l of lines) { const r = re1.exec(l); if (r) { g.alumnos.push({ nombre: titulo(nombreRel(r[3])), curp: r[2] }); continue; }
    const ln = /^\s*(\d{1,3})\s+([A-ZÑÁÉÍÓÚÜ][A-ZÑÁÉÍÓÚÜ .'-]*\/[A-ZÑÁÉÍÓÚÜ .'-]*\*\s*[A-ZÑÁÉÍÓÚÜ][A-ZÑÁÉÍÓÚÜ .'-]*)/.exec(l);
    if (ln && !CURP_RE.test(l.toUpperCase())) { const n = titulo(nombreRel(ln[2].trim())); if (n && !g.alumnos.some(a => a.nombre === n)) g.alumnos.push({ nombre: n }); continue; }
    const c = l.toUpperCase().match(CURP_RE); if (c) { let n = l.replace(new RegExp(c[0], "i"), " ").replace(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/g, " ").replace(/\b(HOMBRE|MUJER|\d+)\b/gi, " ").replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ *\/'.-]/g, " ").replace(/\s+[HM]\s*$/, "").replace(/\s{2,}/g, " ").trim();
      if (n.includes("*") || n.includes("/")) n = nombreRel(n); if (n && !g.alumnos.some(a => a.curp === c[0])) g.alumnos.push({ nombre: titulo(n), curp: c[0] }); } }
  return g; }
async function leerPdf(g, f) { if (!f) return; dlg(`<h3>Leyendo la lista…</h3><div class="prog"><i style="width:60%"></i></div>`);
  try { const r = parseRel(await pdfLineas(f)); cerrarDlg(); if (!r.alumnos.length) return toast("No se encontraron nombres en ese PDF. Use «Pegar o escribir la lista».", 4500);
    const gr = +r.grado && g.grados.includes(+r.grado) ? +r.grado : 0; agregarAlumnos(g, r.alumnos.map(a => Object.assign(a, { g: gr }))); }
  catch (e) { cerrarDlg(); toast("No se pudo leer el PDF" + (navigator.onLine === false ? " (sin internet la primera vez)." : "."), 4000); } }

/* =================================================================== PASE DE LISTA Y ASISTENCIA */
const MARCAS = [["P", "Asistió"], ["R", "Retardo"], ["F", "Falta"], ["J", "Justificada"]];
VISTAS.lista = () => { const g = gAct(); if (!g) return VISTAS.inicio(); const k = S.f || hoy(), reg = ((D.asis[g.id] || {})[k]) || {}, al = activos(g), sc = sinClase(k);
  const n = c => al.filter(a => reg[a.id] === c).length;
  return barra("Pase de lista · " + esc(grNom(g)), fCorta(k)) + `<main class="wrap"><div class="fila mt"><input type="date" id="lF" value="${k}" style="min-height:44px;border:1px solid var(--hilo);border-radius:12px;padding:0 10px"><button class="btn s" id="lTodos">${ic("check", 16)} Todos asistieron</button></div>
  ${sc ? `<p class="small mt" style="color:var(--maiz-d)">Según el calendario: ${esc(sc)}.</p>` : ""}
  <div class="kpis mt">${MARCAS.map(([c, t]) => `<div class="kpi"><b>${n(c)}</b><span>${t}</span></div>`).join("")}</div>
  <div class="lista mt">${al.map((a, i) => `<div class="it"><span class="av">${i + 1}</span><span class="tx"><b>${esc(a.nombre)}</b>${g.grados.length > 1 && a.g ? `<small>${a.g}.°</small>` : ""}</span><span class="asis">${MARCAS.map(([c]) => `<button class="m-${c}" data-al="${a.id}" data-c="${c}" aria-pressed="${reg[a.id] === c}">${c}</button>`).join("")}</span></div>`).join("") || `<div class="vacio">Primero agregue a sus alumnos en Mi grupo.</div>`}</div>
  <p class="small muted mt">Quien quede sin marcar no cuenta. P asistió · R retardo · F falta · J falta justificada.</p></main>`; };
ENLAZAR.lista = () => { const g = gAct(); if (!g) return; const k = S.f || hoy(); const reg = () => { D.asis[g.id] = D.asis[g.id] || {}; return D.asis[g.id][k] = D.asis[g.id][k] || {}; };
  $("#lF").onchange = e => { S.f = e.target.value; re(); };
  $("#lTodos").onclick = () => { const r = reg(); activos(g).forEach(a => { if (!r[a.id]) r[a.id] = "P"; }); guardar(); re(); };
  $$("[data-al]").forEach(b => b.onclick = () => { const r = reg(); r[b.dataset.al] = r[b.dataset.al] === b.dataset.c ? undefined : b.dataset.c; if (!r[b.dataset.al]) delete r[b.dataset.al]; guardar(); re(); }); };
VISTAS.asistencia = () => { const g = gAct(); if (!g) return VISTAS.inicio(); const m = S.m || hoy().slice(0, 7), A = D.asis[g.id] || {}, dias = Object.keys(A).filter(k => k.slice(0, 7) === m).sort(), al = activos(g);
  const [yy, mm] = m.split("-").map(Number);
  return barra("Asistencia · " + esc(grNom(g)), MES_L[mm - 1] + " " + yy, `<button class="btn s" id="asI">${ic("impr", 16)} Imprimir</button>`) + `<main class="wrap"><div class="fila mt"><input type="month" id="asM" value="${m}" style="min-height:44px;border:1px solid var(--hilo);border-radius:12px;padding:0 10px"></div>
  ${dias.length ? `<div class="tabla-c mt"><table class="tabla"><thead><tr><th>Alumno(a)</th>${dias.map(k => `<th class="c">${dF(k).getDate()}<br><small>${DSEM[dF(k).getDay()]}</small></th>`).join("")}<th class="c">Asist.</th><th class="c">Faltas</th></tr></thead><tbody>
   ${al.map(a => { let as = 0, fa = 0; const c = dias.map(k => { const v = (A[k] || {})[a.id] || ""; if (v === "P" || v === "R") as++; if (v === "F") fa++; return `<td class="c m-${v}">${v === "P" ? "•" : v}</td>`; }).join(""); return `<tr><td>${esc(a.nombre)}</td>${c}<td class="c"><b>${as}</b></td><td class="c">${fa}</td></tr>`; }).join("")}</tbody></table></div>` : `<div class="vacio mt">No hay registros de asistencia en este mes.</div>`}</main>`; };
ENLAZAR.asistencia = () => { $("#asM").onchange = e => { S.m = e.target.value; re(); }; $("#asI").onclick = () => { const t = $(".tabla-c"); if (!t) return toast("No hay registros este mes."); const g = gAct(); imprimir(`<div class="doc">${encabezado(g, "Lista de asistencia · " + $("h1").textContent)}${t.innerHTML.replace('class="tabla"', '')}<table class="firmas"><tr><td>${esc(yo().nombre)}<br>Docente del grupo</td><td>${esc(dirTxt(g))}<br>Dirección de la escuela</td></tr></table></div>`, true); }; };

/* =================================================================== DINÁMICAS */
const todasDin = () => DINAMICAS.concat(D.mias.map(d => Object.assign({ mia: true }, d)));
const dinDe = id => todasDin().find(d => d.id === id);
VISTAS.dinamicas = () => { const F = S.F = S.F || { cat: "", campo: "", q: "", g: "", fav: false }, g = gAct(), q = nrm(F.q);
  const L = todasDin().filter(d => (!F.cat || d.cat === F.cat) && (!F.campo || d.campos.includes(F.campo)) && (!F.g || (d.g[0] <= +F.g && d.g[1] >= +F.g)) && (!F.fav || D.favs.includes(d.id)) && (!q || nrm(d.n + " " + d.prop + " " + d.mat).includes(q)));
  return barra("Tlamatini Aula", "Dinámicas y juegos", `<button class="btn s p" id="dNueva">${ic("mas", 16)} Mía</button>`) + `<main class="wrap">
  <label class="campo mt"><input id="dQ" type="search" placeholder="Buscar: tablas, lectura, calma, patio…" value="${esc(F.q)}"></label>
  <div class="chips">${[["", "Todas"]].concat(Object.entries(DIN_CATS).map(([k, v]) => [k, v[0]])).map(([k, t]) => `<button class="chip" data-fc="${k}" aria-pressed="${F.cat === k}">${t}</button>`).join("")}</div>
  <div class="fila mt" style="gap:8px"><select id="dCampo" class="sel"><option value="">Todos los campos</option>${Object.entries(DIN_CAMPOS).map(([k, t]) => `<option value="${k}" ${F.campo === k ? "selected" : ""}>${t}</option>`).join("")}</select>
   <select id="dG" class="sel"><option value="">Todos los grados</option>${[1, 2, 3, 4, 5, 6].map(n => `<option value="${n}" ${String(F.g) === String(n) ? "selected" : ""}>${n}.°</option>`).join("")}</select>
   <button class="chip" id="dFav" aria-pressed="${F.fav}">${ic("estrella", 14)} Favoritas</button></div>
  <div class="dins mt">${L.map(d => { const c = DIN_CATS[d.cat] || ["", "#666"]; return `<button class="din" data-d="${esc(d.id)}" style="--c:${c[1]}"><span class="din-cat">${c[0]}</span><b>${esc(d.n)}</b><span class="din-p">${esc(d.prop)}</span>
     <span class="din-m">${ic("reloj", 14)} ${d.min} min · ${d.g[0] === d.g[1] ? d.g[0] + ".°" : d.g[0] + ".° a " + d.g[1] + ".°"} · ${d.esp === "patio" ? "Patio" : d.esp === "ambos" ? "Aula o patio" : "Aula"}${D.favs.includes(d.id) ? " · ★" : ""}${d.mia ? " · Mía" : ""}</span></button>`; }).join("") || `<div class="vacio">No hay dinámicas con estos filtros.</div>`}</div></main>`; };
ENLAZAR.dinamicas = () => { const F = S.F; let t; $("#dQ").oninput = e => { clearTimeout(t); t = setTimeout(() => { F.q = e.target.value; re(); const i = $("#dQ"); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); };
  $$("[data-fc]").forEach(b => b.onclick = () => { F.cat = b.dataset.fc; re(); }); $("#dCampo").onchange = e => { F.campo = e.target.value; re(); }; $("#dG").onchange = e => { F.g = e.target.value; re(); };
  $("#dFav").onclick = () => { F.fav = !F.fav; re(); }; $$("[data-d]").forEach(b => b.onclick = () => ir("dinamica", { id: b.dataset.d })); $("#dNueva").onclick = () => formDin(null); };
VISTAS.dinamica = () => { const d = dinDe(S.id); if (!d) return VISTAS.dinamicas(); const c = DIN_CATS[d.cat] || ["", "#666"], fav = D.favs.includes(d.id);
  return barra(c[0], esc(d.n), `<button class="btn s" id="dFv" aria-label="Favorita" style="${fav ? "color:#C98A0B" : ""}">${ic("estrella", 18)}</button>`) + `<main class="wrap">
  <section class="card mt" style="border-top:5px solid ${c[1]}"><p><b>Para qué:</b> ${esc(d.prop)}</p>
   <div class="tags mt">${d.campos.map(k => `<span class="tag a">${DIN_CAMPOS[k]}</span>`).join(" ")} <span class="tag g">${ic("reloj", 12)} ${d.min} min</span> <span class="tag g">${d.g[0]}.° a ${d.g[1]}.°</span> <span class="tag g">${d.esp === "patio" ? "Patio" : d.esp === "ambos" ? "Aula o patio" : "Aula"}</span></div>
   ${d.mat ? `<p class="mt"><b>Material:</b> ${esc(d.mat)}</p>` : ""}</section>
  <section class="card mt"><h3>Cómo se hace</h3><ol class="pasos-l">${d.pasos.map(p => `<li>${esc(p)}</li>`).join("")}</ol></section>
  ${d.var || d.multi ? `<section class="card mt">${d.var ? `<p><b>Variante:</b> ${esc(d.var)}</p>` : ""}${d.multi ? `<p class="mt"><b>En multigrado:</b> ${esc(d.multi)}</p>` : ""}</section>` : ""}
  <div class="fila mt2"><button class="btn p" id="dCl">${ic("play", 18)} Usar en clase</button>${d.mia ? `<button class="btn" id="dEd">${ic("lapiz", 16)} Editar</button>` : ""}</div></main>`; };
ENLAZAR.dinamica = () => { const d = dinDe(S.id); if (!d) return; $("#dFv").onclick = () => { const i = D.favs.indexOf(d.id); i >= 0 ? D.favs.splice(i, 1) : D.favs.push(d.id); guardar(); re(); toast(i >= 0 ? "Quitada de favoritas." : "Agregada a favoritas."); };
  $("#dCl").onclick = () => claseDin(d); $("#dEd") && ($("#dEd").onclick = () => formDin(D.mias.find(x => x.id === d.id))); };
function formDin(d) { const n = !d; d = d || { id: "mia-" + uid(), n: "", cat: "inicio", campos: [], g: [1, 6], min: 10, esp: "aula", mat: "", prop: "", pasos: [], var: "" };
  dlg(`<h3>${n ? "Agregar mi dinámica" : "Editar mi dinámica"}</h3><label class="campo"><span>Nombre</span><input id="fN" value="${esc(d.n)}"></label>
   <div class="dos"><label class="campo"><span>Tipo</span><select id="fC">${Object.entries(DIN_CATS).map(([k, v]) => `<option value="${k}" ${d.cat === k ? "selected" : ""}>${v[0]}</option>`).join("")}</select></label><label class="campo"><span>Minutos</span><input id="fM" type="number" min="1" value="${d.min}"></label></div>
   <div class="campo"><span>Campos formativos</span><div class="chips">${Object.entries(DIN_CAMPOS).map(([k, t]) => `<button type="button" class="chip" data-fk="${k}" aria-pressed="${d.campos.includes(k)}">${t}</button>`).join("")}</div></div>
   <div class="dos"><label class="campo"><span>Desde</span><select id="fG1">${[1, 2, 3, 4, 5, 6].map(x => `<option ${d.g[0] === x ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="campo"><span>Hasta</span><select id="fG2">${[1, 2, 3, 4, 5, 6].map(x => `<option ${d.g[1] === x ? "selected" : ""}>${x}</option>`).join("")}</select></label></div>
   <label class="campo"><span>¿Para qué sirve?</span><input id="fP" value="${esc(d.prop)}"></label><label class="campo"><span>Material</span><input id="fMa" value="${esc(d.mat)}"></label>
   <label class="campo"><span>Pasos (uno por renglón)</span><textarea id="fPa" class="area">${esc(d.pasos.join("\n"))}</textarea></label>
   <div class="fila fin">${n ? "" : `<button class="btn r" id="fB" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="fX">Cancelar</button><button class="btn p" id="fOk">Guardar</button></div>`, v => {
    const ks = new Set(d.campos); v.querySelectorAll("[data-fk]").forEach(b => b.onclick = () => { ks.has(b.dataset.fk) ? ks.delete(b.dataset.fk) : ks.add(b.dataset.fk); b.setAttribute("aria-pressed", ks.has(b.dataset.fk)); });
    v.querySelector("#fX").onclick = cerrarDlg;
    v.querySelector("#fOk").onclick = () => { const nm = val("fN").trim(); if (!nm) return toast("Escriba el nombre."); const g1 = +val("fG1"), g2 = +val("fG2");
      Object.assign(d, { n: nm, cat: val("fC"), min: +val("fM") || 10, campos: ks.size ? [...ks] : ["L", "S", "E", "H"], g: [Math.min(g1, g2), Math.max(g1, g2)], prop: val("fP").trim(), mat: val("fMa").trim(), pasos: val("fPa").split(/\n/).map(x => x.trim()).filter(Boolean), autor: yo().nombre });
      if (n) D.mias.push(d); guardar(); cerrarDlg(); ir("dinamica", { id: d.id }, !n); toast("Dinámica guardada."); };
    v.querySelector("#fB") && (v.querySelector("#fB").onclick = () => { D.mias = D.mias.filter(x => x !== d); guardar(); cerrarDlg(); ir("dinamicas", {}, true); }); }); }

/* ---------- modo clase ---------- */
let RELOJ = null;
function cerrarClase() { clearInterval(RELOJ); const c = $("#clase"); if (c) c.remove(); document.body.style.overflow = ""; }
function claseHTML(pasos, i) { const p = pasos[i]; return `<div class="cl-top"><span>${esc(p.eb)}</span><button class="cl-x" id="clX" aria-label="Cerrar">✕</button></div>
  <div class="cl-cuerpo"><h2>${esc(p.t)}</h2>${p.prop ? `<p class="cl-prop">${esc(p.prop)}</p>` : ""}${p.lista ? `<ol>${p.lista.map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}${p.txt ? `<p class="cl-txt">${esc(p.txt).replace(/\n/g, "<br>")}</p>` : ""}</div>
  <div class="cl-pie">${p.min ? `<div class="cl-reloj"><b id="clT">${String(p.min).padStart(2, "0")}:00</b><button id="clP">${ic("play", 22)}</button><button id="clR">↺</button></div>` : "<div></div>"}
   <div class="fila">${i > 0 ? `<button class="btn" id="clAnt">${ic("atras", 16)} Anterior</button>` : ""}${i < pasos.length - 1 ? `<button class="btn m" id="clSig">Siguiente ${ic("sig", 16)}</button>` : `<button class="btn m" id="clFin">${ic("check", 16)} Terminar</button>`}</div></div>`; }
function modoClase(pasos, alTerminar) { cerrarClase(); const c = document.createElement("div"); c.id = "clase"; document.body.appendChild(c); document.body.style.overflow = "hidden"; history.pushState({ clase: 1 }, ""); let i = 0;
  const ver = () => { clearInterval(RELOJ); c.innerHTML = claseHTML(pasos, i); const p = pasos[i];
    c.querySelector("#clX").onclick = () => history.back();
    c.querySelector("#clAnt") && (c.querySelector("#clAnt").onclick = () => { i--; ver(); }); c.querySelector("#clSig") && (c.querySelector("#clSig").onclick = () => { i++; ver(); });
    c.querySelector("#clFin") && (c.querySelector("#clFin").onclick = () => { history.back(); alTerminar && alTerminar(); });
    if (p.min) { let s = p.min * 60, corre = false; const t = c.querySelector("#clT"), pin = () => t.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
      c.querySelector("#clP").onclick = e => { corre = !corre; e.currentTarget.innerHTML = ic(corre ? "pausa" : "play", 22); clearInterval(RELOJ); if (corre) RELOJ = setInterval(() => { if (s > 0) { s--; pin(); } if (!s) { clearInterval(RELOJ); t.classList.add("fin"); navigator.vibrate && navigator.vibrate([200, 100, 200]); } }, 1000); };
      c.querySelector("#clR").onclick = () => { s = p.min * 60; t.classList.remove("fin"); pin(); }; } };
  ver(); }
function claseDin(d) { modoClase([{ eb: (DIN_CATS[d.cat] || [""])[0], t: d.n, prop: d.prop, lista: d.pasos, min: d.min }]); }

/* =================================================================== PLANEACIÓN */
const PDA_TXT = (pda, campo, fase) => { const C = (pda && pda.campos) || {}, k = Object.keys(C).find(x => nrm(x) === nrm(campo)); return ((k && C[k]) || {})[fase] || []; };
VISTAS.planes = () => { const g = gAct(), L = D.planes.filter(p => p.gid === (g && g.id)).sort((a, b) => b.ini.localeCompare(a.ini));
  return barra("Planeación · " + esc(grNom(g)), "Mis proyectos", `<button class="btn s p" id="pN">${ic("mas", 16)} Nuevo</button>`) + `<main class="wrap">
  <div class="lista mt">${L.map(p => { const hechas = p.sesiones.filter(s => s.hecho).length; return `<button class="it btnit" data-p="${p.id}"><span class="av" style="background:${(DIN_CATS[{ L: "lengua", S: "ciencia", E: "convive", H: "integracion" }[CAMPO_COD[p.campo]]] || ["", "#24427A"])[1]}22">${ic("plan", 18)}</span><span class="tx"><b>${esc(p.titulo)}</b><small>${esc(p.campo)} · ${esc(METODOS[p.metodo].n)} · ${p.sesiones.length} sesiones desde ${fCorta(p.ini)}</small><span class="barra-p"><i style="width:${Math.round(100 * hechas / p.sesiones.length)}%"></i></span></span><span class="tag ${hechas === p.sesiones.length ? "" : "g"}">${hechas}/${p.sesiones.length}</span></button>`; }).join("") || `<div class="vacio">Aún no tiene proyectos. Toque «Nuevo» para planear con los contenidos y PDA de su grado.</div>`}</div></main>`; };
ENLAZAR.planes = () => { $("#pN").onclick = () => ir("planNueva"); $$("[data-p]").forEach(b => b.onclick = () => ir("plan", { id: b.dataset.p })); };
/* asistente para planear */
VISTAS.planNueva = () => { const g = gAct(); if (!g) return VISTAS.inicio(); const P = S.P = S.P || { campo: "", sel: {}, metodo: "", escenario: "aula", ejes: [], titulo: "", proposito: "", ini: diasHabiles(hoy(), 1)[0] || hoy(), n: 5, min: 50, producto: "" };
  const fases = [...new Set(g.grados.map(faseDe))];
  return barra("Planeación · " + esc(grNom(g)), "Nuevo proyecto") + `<main class="wrap" id="pnM"><p class="muted mt">Cargando el programa…</p></main>`; };
ENLAZAR.planNueva = async () => { const g = gAct(), P = S.P, pda = await programa(), m = $("#pnM"); if (!m) return; await calendario();
  if (!pda) { m.innerHTML = `<div class="vacio mt">No se pudo cargar el Programa Sintético. Conéctese a internet una vez y vuelva a intentarlo.</div>`; return; }
  const fases = [...new Set(g.grados.map(faseDe))].sort();
  const pinta = () => { const met = P.metodo || (P.campo ? Object.keys(METODOS).find(k => METODOS[k].campo === P.campo) : "");
    m.innerHTML = `<section class="card mt"><h3>1. Campo formativo</h3><div class="chips">${CAMPOS.map(c => `<button class="chip" data-cf="${esc(c)}" aria-pressed="${P.campo === c}">${c}</button>`).join("")}</div></section>
    ${P.campo ? fases.map(f => { const L = PDA_TXT(pda, P.campo, f); return `<section class="card mt"><h3>2. Contenido · ${esc(pda.fases[f].nombre)}</h3><p class="small muted mb">Elija el contenido del Programa Sintético. ${g.grados.filter(x => faseDe(x) === f).length > 1 || fases.length > 1 ? "En multigrado, los PDA de cada grado se toman del mismo contenido." : ""}</p>
      <div class="cont-l">${L.map((c, i) => `<label class="cont ${P.sel[f] === i ? "on" : ""}"><input type="radio" name="ct${f}" value="${i}" ${P.sel[f] === i ? "checked" : ""} data-ct="${f}"><span>${esc(c.c)}</span></label>`).join("")}</div>
      ${P.sel[f] != null ? `<div class="pdas mt">${g.grados.filter(x => faseDe(x) === f).map(gr => `<p><b>PDA de ${gr}.°:</b> ${esc((L[P.sel[f]].pda || {})[gr] || "")}</p>`).join("")}</div>` : ""}</section>`; }).join("") : ""}
    ${P.campo && fases.every(f => P.sel[f] != null) ? `<section class="card mt"><h3>3. Cómo lo va a trabajar</h3>
      <label class="campo"><span>Metodología</span><select id="pMe">${Object.entries(METODOS).map(([k, v]) => `<option value="${k}" ${met === k ? "selected" : ""}>${v.n}${v.campo === P.campo ? " (sugerida)" : ""}</option>`).join("")}</select></label>
      <div class="campo"><span>Escenario</span><div class="chips">${Object.entries(ESCENARIOS).map(([k, t]) => `<button class="chip" data-es="${k}" aria-pressed="${P.escenario === k}">${t}</button>`).join("")}</div></div>
      <div class="campo"><span>Ejes articuladores</span><div class="chips">${EJES.map(e => `<button class="chip" data-ej="${esc(e)}" aria-pressed="${P.ejes.includes(e)}">${e}</button>`).join("")}</div></div></section>
     <section class="card mt"><h3>4. Su proyecto</h3><label class="campo"><span>Nombre del proyecto</span><input id="pT" value="${esc(P.titulo)}" placeholder="Ej. El agua que llega a nuestra comunidad"></label>
      <label class="campo"><span>Propósito (opcional)</span><textarea id="pPr" class="area" style="min-height:80px" placeholder="Qué se espera que los alumnos logren">${esc(P.proposito)}</textarea></label>
      <label class="campo"><span>Producto final (opcional)</span><input id="pPd" value="${esc(P.producto)}" placeholder="Ej. Periódico mural, folleto, maqueta, presentación a las familias"></label>
      <div class="tres"><label class="campo"><span>Inicia</span><input type="date" id="pI" value="${P.ini}"></label><label class="campo"><span>Sesiones</span><input type="number" id="pNn" min="1" max="40" value="${P.n}"></label><label class="campo"><span>Minutos por sesión</span><input type="number" id="pMi" min="15" max="240" value="${P.min}"></label></div>
      <p class="small muted">Las fechas se acomodan solas en días de clase, saltando vacaciones, suspensiones y Consejos Técnicos del calendario de Baja California.</p>
      <div class="fila fin mt"><button class="btn p" id="pOk">${ic("check", 18)} Crear la planeación</button></div></section>` : ""}`;
    $$("[data-cf]").forEach(b => b.onclick = () => { P.campo = b.dataset.cf; P.sel = {}; P.metodo = ""; pinta(); });
    $$("[data-ct]").forEach(r => r.onchange = () => { P.sel[r.dataset.ct] = +r.value; pinta(); const s = $$("[data-ct]").find(x => x.checked); });
    $("#pMe") && ($("#pMe").onchange = e => { P.metodo = e.target.value; });
    $$("[data-es]").forEach(b => b.onclick = () => { lee(); P.escenario = b.dataset.es; pinta(); });
    $$("[data-ej]").forEach(b => b.onclick = () => { lee(); const i = P.ejes.indexOf(b.dataset.ej); i >= 0 ? P.ejes.splice(i, 1) : P.ejes.push(b.dataset.ej); pinta(); });
    $("#pOk") && ($("#pOk").onclick = () => { lee(); if (!P.titulo.trim()) return toast("Escriba el nombre del proyecto."); P.metodo = P.metodo || met; const p = crearPlan(g, P, pda); D.planes.push(p); guardar(); S.P = null; ir("plan", { id: p.id }, true); toast("<b>Planeación creada.</b> Revise y ajuste cada sesión.", 3500); }); };
  const lee = () => { if (!$("#pT")) return; P.titulo = val("pT"); P.proposito = val("pPr"); P.producto = val("pPd"); P.ini = val("pI") || P.ini; P.n = Math.max(1, Math.min(40, +val("pNn") || 5)); P.min = Math.max(15, +val("pMi") || 50); if ($("#pMe")) P.metodo = val("pMe"); };
  pinta(); };
function crearPlan(g, P, pda) { const M = METODOS[P.metodo], fases = M.fases, n = P.n, cod = CAMPO_COD[P.campo];
  const conts = {}, pdas = {}; [...new Set(g.grados.map(faseDe))].forEach(f => { const c = PDA_TXT(pda, P.campo, f)[P.sel[f]]; conts[f] = c.c; g.grados.filter(x => faseDe(x) === f).forEach(gr => pdas[gr] = (c.pda || {})[gr] || ""); });
  /* reparte las fases de la metodología entre las sesiones */
  const grupos = []; if (n >= fases.length) { let extra = n - fases.length; fases.forEach((f, i) => { const k = 1 + Math.floor(extra / (fases.length - i)); extra -= k - 1; for (let j = 0; j < k; j++) grupos.push([f]); }); }
  else { const por = fases.length / n; for (let i = 0; i < n; i++) grupos.push(fases.slice(Math.round(i * por), Math.round((i + 1) * por))); }
  const gmin = Math.min(...g.grados), gmax = Math.max(...g.grados), apta = d => d.g[0] <= gmax && d.g[1] >= gmin && d.campos.includes(cod);
  const ini = DINAMICAS.filter(d => ["inicio", "integracion", "pausa"].includes(d.cat) && apta(d)), cie = DINAMICAS.filter(d => d.cat === "cierre" && apta(d));
  const fechas = diasHabiles(P.ini, n);
  const sesiones = grupos.map((fs, i) => ({ n: i + 1, fecha: fechas[i] || "", fase: fs.map(f => f[0]).join(" · "),
    inicio: { din: (ini[i % (ini.length || 1)] || {}).id || "", txt: "" }, desarrollo: fs.map(f => f[1]).join("\n"), cierre: { din: (cie[i % (cie.length || 1)] || {}).id || "", txt: "" }, eval: i === n - 1 ? "Presentación del producto y autoevaluación con la rúbrica." : "Observación y registro en la lista de cotejo.", hecho: false }));
  const corta = t => { let x = String(t).split(/[.;:](?:\s|$)/)[0].trim(); if (x.length > 170) x = x.slice(0, x.lastIndexOf(" ", 165)) + "…"; return x; };
  const criterios = Object.entries(pdas).map(([gr, t]) => ({ gr: +gr, c: corta(t) }));
  return { id: uid(), gid: g.id, creado: hoy(), titulo: P.titulo.trim(), campo: P.campo, metodo: P.metodo, escenario: P.escenario, ejes: P.ejes.slice(), contenidos: conts, pdas, proposito: P.proposito.trim(), producto: P.producto.trim(), ini: P.ini, min: P.min, sesiones, criterios }; }
VISTAS.plan = () => { const p = plDe(S.id); if (!p) return VISTAS.planes(); const g = grDe(p.gid), ab = S.ab;
  return barra(esc(p.campo), esc(p.titulo), `<button class="btn s" id="plI">${ic("impr", 16)} Imprimir</button>`) + `<main class="wrap">
  <section class="card mt"><div class="tags">${`<span class="tag a">${esc(METODOS[p.metodo].n)}</span> <span class="tag g">Escenario ${esc(ESCENARIOS[p.escenario])}</span> `}${p.ejes.map(e => `<span class="tag m">${esc(e)}</span>`).join(" ")}</div>
   ${Object.entries(p.contenidos).map(([f, c]) => `<p class="mt"><b>Contenido${Object.keys(p.contenidos).length > 1 ? " (fase " + f + ")" : ""}:</b> ${esc(c)}</p>`).join("")}
   ${Object.entries(p.pdas).map(([gr, t]) => `<p class="small mt"><b>PDA ${gr}.°:</b> ${esc(t)}</p>`).join("")}
   ${p.proposito ? `<p class="mt"><b>Propósito:</b> ${esc(p.proposito)}</p>` : ""}${p.producto ? `<p class="mt"><b>Producto:</b> ${esc(p.producto)}</p>` : ""}
   <div class="fila mt"><button class="btn s" id="plRec">${ic("agenda", 16)} Recorrer fechas</button><button class="btn s r" id="plB">${ic("basura", 16)} Borrar</button></div></section>
  <h2 class="sec-t">Sesiones<small>Toque una para ajustarla. «Dar la clase» la muestra en pantalla completa.</small></h2>
  ${p.sesiones.map((s, i) => { const di = dinDe(s.inicio.din), dc = dinDe(s.cierre.din), abierta = ab === i;
    return `<section class="ses card ${s.hecho ? "hecha" : ""}"><button class="ses-h" data-ab="${i}"><span class="gr">${i + 1}</span><span class="tx"><b>${esc(s.fase)}</b><small>${s.fecha ? fCorta(s.fecha) : "Sin fecha"}${s.hecho ? " · Dada" : ""}</small></span>${ic(abierta ? "atras" : "sig", 16)}</button>
     ${abierta ? `<div class="ses-b"><label class="campo"><span>Fecha</span><input type="date" data-sf="${i}" value="${s.fecha}"></label>
      <div class="campo"><span>Inicio · dinámica</span><select data-sdi="${i}">${dinOpts(s.inicio.din, ["inicio", "integracion", "pausa"])}</select>${di ? `<small>${esc(di.prop)} (${di.min} min)</small>` : ""}</div>
      <label class="campo"><span>Inicio · indicaciones</span><textarea class="area" style="min-height:70px" data-sit="${i}" placeholder="Pregunta detonadora, recuperación de saberes…">${esc(s.inicio.txt)}</textarea></label>
      <label class="campo"><span>Desarrollo</span><textarea class="area" data-sd="${i}">${esc(s.desarrollo)}</textarea></label>
      <div class="campo"><span>Cierre · dinámica</span><select data-sdc="${i}">${dinOpts(s.cierre.din, ["cierre"])}</select>${dc ? `<small>${esc(dc.prop)}</small>` : ""}</div>
      <label class="campo"><span>Evaluación</span><input data-se="${i}" value="${esc(s.eval)}"></label>
      <div class="fila"><button class="btn m" data-dar="${i}">${ic("play", 16)} Dar la clase</button><button class="btn" data-hecho="${i}">${ic("check", 16)} ${s.hecho ? "Marcar como pendiente" : "Marcar como dada"}</button></div></div>` : ""}</section>`; }).join("")}
  <h2 class="sec-t">Evaluación formativa<small>Rúbrica a partir de los PDA</small></h2><section class="card"><div class="tabla-c"><table class="tabla rub"><thead><tr><th>Criterio</th>${NIVELES.map(n => `<th>${n[0]}</th>`).join("")}</tr></thead><tbody>${p.criterios.map(c => `<tr><td><b>${c.gr}.°</b> ${esc(c.c)}</td>${NIVELES.map(n => `<td class="small">${n[1]}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section></main>`; };
const NIVELES = [["Destacado", "Lo logra de forma autónoma y lo explica o aplica en otras situaciones."], ["Logrado", "Lo logra de forma autónoma."], ["En proceso", "Lo logra con apoyo del docente o de sus compañeros."], ["Requiere apoyo", "Aún no lo logra; necesita acompañamiento cercano."]];
function dinOpts(sel, cats) { const g = gAct(), gmin = g ? Math.min(...g.grados) : 1, gmax = g ? Math.max(...g.grados) : 6;
  return `<option value="">— Ninguna —</option>` + todasDin().filter(d => cats.includes(d.cat) && d.g[0] <= gmax && d.g[1] >= gmin).map(d => `<option value="${esc(d.id)}" ${d.id === sel ? "selected" : ""}>${esc(d.n)} · ${d.min} min</option>`).join(""); }
ENLAZAR.plan = () => { const p = plDe(S.id); if (!p) return; const s = i => p.sesiones[+i];
  $$("[data-ab]").forEach(b => b.onclick = () => { S.ab = S.ab === +b.dataset.ab ? null : +b.dataset.ab; re(); });
  $$("[data-sf]").forEach(x => x.onchange = () => { s(x.dataset.sf).fecha = x.value; guardar(); });
  $$("[data-sdi]").forEach(x => x.onchange = () => { s(x.dataset.sdi).inicio.din = x.value; guardar(); re(); }); $$("[data-sdc]").forEach(x => x.onchange = () => { s(x.dataset.sdc).cierre.din = x.value; guardar(); re(); });
  $$("[data-sit]").forEach(x => x.onchange = () => { s(x.dataset.sit).inicio.txt = x.value; guardar(); }); $$("[data-sd]").forEach(x => x.onchange = () => { s(x.dataset.sd).desarrollo = x.value; guardar(); });
  $$("[data-se]").forEach(x => x.onchange = () => { s(x.dataset.se).eval = x.value; guardar(); });
  $$("[data-hecho]").forEach(b => b.onclick = () => { const x = s(b.dataset.hecho); x.hecho = !x.hecho; guardar(); re(); });
  $$("[data-dar]").forEach(b => b.onclick = () => abrirClase(p.id, +b.dataset.dar));
  $("#plB").onclick = async () => { if (!(await confirmar("Se borrará esta planeación.", "Borrar"))) return; D.planes = D.planes.filter(x => x !== p); guardar(); history.back(); };
  $("#plRec").onclick = () => dlg(`<h3>Recorrer fechas</h3><p class="small muted mb">Si un día no hubo clase, las sesiones pendientes se acomodan de nuevo en días de clase desde la fecha que elija.</p><label class="campo"><span>Desde</span><input type="date" id="rD" value="${hoy()}"></label><div class="fila fin"><button class="btn" id="rX">Cancelar</button><button class="btn p" id="rOk">Recorrer</button></div>`, v => {
    v.querySelector("#rX").onclick = cerrarDlg; v.querySelector("#rOk").onclick = async () => { await calendario(); const pend = p.sesiones.filter(x => !x.hecho), f = diasHabiles(val("rD") || hoy(), pend.length); pend.forEach((x, i) => x.fecha = f[i] || ""); guardar(); cerrarDlg(); re(); toast("Fechas recorridas."); }; });
  $("#plI").onclick = () => imprimir(docPlan(p), true); };
function abrirClase(pid, i) { const p = plDe(pid), s = p.sesiones[i], di = dinDe(s.inicio.din), dc = dinDe(s.cierre.din), pasos = [];
  pasos.push({ eb: `${p.titulo} · sesión ${i + 1}`, t: s.fase, txt: Object.values(p.pdas).filter(Boolean).length ? "Hoy vamos a aprender: " + (p.criterios[0] || {}).c : "" });
  if (di) pasos.push({ eb: "Inicio · " + (DIN_CATS[di.cat] || [""])[0], t: di.n, prop: di.prop, lista: di.pasos, min: di.min });
  if (s.inicio.txt) pasos.push({ eb: "Inicio", t: "Para empezar", txt: s.inicio.txt });
  pasos.push({ eb: "Desarrollo", t: s.fase, txt: s.desarrollo, min: Math.max(5, p.min - (di ? di.min : 0) - (dc ? dc.min : 0)) });
  if (dc) pasos.push({ eb: "Cierre", t: dc.n, prop: dc.prop, lista: dc.pasos, min: dc.min });
  modoClase(pasos, () => { s.hecho = true; guardar(); toast("Sesión marcada como dada."); if (S.v === "plan" || S.v === "inicio") re(); }); }

/* ---------- documentos ---------- */
const dirTxt = g => g && g.dir ? (/directora|encargada/i.test(g.cargoDir || "") ? "Mtra. " : "Mtro. ") + g.dir : "";
function encabezado(g, tit) { return `<table class="enc"><tr><td style="width:90px"><img src="${ISEP}" alt="ISEP"></td><td class="t"><b>${esc(g ? g.escuela : "")}</b><br><span>${g && g.cct ? "C.C.T. " + esc(g.cct) : ""}${g && g.turno ? " · Turno " + esc(g.turno) : ""}${g && g.loc ? " · " + esc(g.loc) : ""}</span><br><b class="tt">${tit}</b></td><td style="width:90px;text-align:right">${g && g.cct ? `<img src="${ESC_IMG}${esc(g.cct)}.jpg" onerror="if(!this.dataset.p){this.dataset.p=1;this.src='${ESC_IMG}${esc(g.cct)}.png'}else{this.remove()}" alt="">` : ""}</td></tr></table>`; }
function docPlan(p) { const g = grDe(p.gid);
  return `<div class="doc">${encabezado(g, "Planeación didáctica · " + esc(p.campo))}
  <div class="datos"><span><b>Proyecto:</b> ${esc(p.titulo)}</span><span><b>Grupo:</b> ${esc(grNom(g))}</span><span><b>Periodo:</b> ${fCorta(p.sesiones[0].fecha)} al ${fCorta(p.sesiones[p.sesiones.length - 1].fecha)}</span>
   <span><b>Metodología:</b> ${esc(METODOS[p.metodo].n)}</span><span><b>Escenario:</b> ${esc(ESCENARIOS[p.escenario])}</span><span><b>Sesiones:</b> ${p.sesiones.length} de ${p.min} min</span></div>
  <table><tbody>${Object.entries(p.contenidos).map(([f, c]) => `<tr><th style="width:20%">Contenido${Object.keys(p.contenidos).length > 1 ? " · fase " + f : ""}</th><td>${esc(c)}</td></tr>`).join("")}
   ${Object.entries(p.pdas).map(([gr, t]) => `<tr><th>PDA ${gr}.°</th><td>${esc(t)}</td></tr>`).join("")}
   ${p.ejes.length ? `<tr><th>Ejes articuladores</th><td>${esc(p.ejes.join(", "))}</td></tr>` : ""}${p.proposito ? `<tr><th>Propósito</th><td>${esc(p.proposito)}</td></tr>` : ""}${p.producto ? `<tr><th>Producto</th><td>${esc(p.producto)}</td></tr>` : ""}</tbody></table>
  <h2>Secuencia didáctica</h2><table><thead><tr><th class="c">No.</th><th>Fecha</th><th>Momento</th><th>Inicio</th><th>Desarrollo</th><th>Cierre</th><th>Evaluación</th></tr></thead><tbody>
  ${p.sesiones.map((s, i) => { const di = dinDe(s.inicio.din), dc = dinDe(s.cierre.din); return `<tr><td class="c">${i + 1}</td><td>${fCorta(s.fecha)}</td><td><b>${esc(s.fase)}</b></td><td>${di ? `<b>${esc(di.n)}</b>. ${esc(di.prop)}` : ""}${s.inicio.txt ? "<br>" + esc(s.inicio.txt) : ""}</td><td>${esc(s.desarrollo).replace(/\n/g, "<br>")}</td><td>${dc ? `<b>${esc(dc.n)}</b>. ${esc(dc.prop)}` : ""}</td><td>${esc(s.eval)}</td></tr>`; }).join("")}</tbody></table>
  <h2>Rúbrica</h2><table><thead><tr><th>Criterio</th>${NIVELES.map(n => `<th>${n[0]}</th>`).join("")}</tr></thead><tbody>${p.criterios.map(c => `<tr><td><b>${c.gr}.°</b> ${esc(c.c)}</td>${NIVELES.map(n => `<td>${n[1]}</td>`).join("")}</tr>`).join("")}</tbody></table>
  <table class="firmas"><tr><td>${esc(yo().nombre)}<br>Docente del grupo</td><td>${esc(dirTxt(g))}<br>Dirección de la escuela · Vo. Bo.</td></tr></table></div>`; }
function imprimir(html, horizontal) { $("#imprimir").innerHTML = (horizontal ? "<style>@page{size:letter landscape;margin:9mm}</style>" : "") + html; const imgs = [...$("#imprimir").querySelectorAll("img")]; Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 2500); }))).then(() => setTimeout(() => window.print(), 120)); }

/* =================================================================== AJUSTES */
VISTAS.ajustes = () => barra("Tlamatini Aula", "Ajustes y respaldo") + `<main class="wrap">
  <section class="card mt"><h3>Sus datos</h3><label class="campo"><span>Nombre (como aparece en sus documentos)</span><input id="yN" value="${esc(yo().nombre)}"></label><label class="campo"><span>Correo</span><input id="yC" type="email" value="${esc(yo().correo)}"></label><div class="fila fin"><button class="btn p s" id="yOk">Guardar</button></div></section>
  <section class="card mt"><h3>Mis grupos</h3><div class="lista">${D.grupos.map(g => `<button class="it btnit" data-ge="${g.id}"><span class="av">${ic("grupo", 18)}</span><span class="tx"><b>${esc(grNom(g))}</b><small>${esc(g.escuela)} · ${activos(g).length} alumnos</small></span>${ic("lapiz", 16)}</button>`).join("")}</div><div class="fila mt"><button class="btn s" id="yG">${ic("mas", 16)} Agregar grupo</button></div></section>
  <section class="card mt"><h3>Respaldo</h3><p class="small muted mb">Todo se guarda en este dispositivo. Descargue una copia de vez en cuando, por si se daña o cambia de teléfono.</p><div class="fila"><button class="btn" id="yR">${ic("bajar", 16)} Descargar respaldo</button><button class="btn" id="yL">${ic("subir", 16)} Cargar respaldo</button><input type="file" id="fR" accept=".json" hidden></div></section>${pie()}</main>`;
ENLAZAR.ajustes = () => { $("#yOk").onclick = () => { D.docente.nombre = val("yN").trim(); D.docente.correo = val("yC").trim(); guardar(); toast("Datos guardados."); };
  $$("[data-ge]").forEach(b => b.onclick = () => ir("grupoForm", { id: b.dataset.ge })); $("#yG").onclick = () => ir("grupoForm");
  $("#yR").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(D)], { type: "application/json" })); a.download = `respaldo-tlamatini-aula-${hoy()}.json`; a.click(); };
  $("#yL").onclick = () => $("#fR").click(); $("#fR").onchange = async e => { try { const x = JSON.parse(await e.target.files[0].text()); if (!x.v || !Array.isArray(x.grupos)) throw 0; if (!(await confirmar("Se reemplazarán los datos de este dispositivo por los del respaldo.", "Cargar"))) return; D = Object.assign(VACIO(), x); guardar(); ir("inicio", {}, true); toast("Respaldo cargado."); } catch (er) { toast("Ese archivo no es un respaldo de Tlamatini Aula."); } }; };

/* =================================================================== ARRANQUE */
function arrancarDatos() { if (DEMO && !D.grupos.length) { const g = { id: "gdemo", cct: "02DPR9999Z", escuela: "Escuela Primaria «Cuauhtémoc» (ejemplo)", turno: "Matutino", grados: [1, 2, 3], grupo: "A", dir: "Ramón Ejemplo Torres", cargoDir: "Director", loc: "Camalú", alumnos: [] };
    ["Ana Sofía Ejemplo Ruiz:1", "Bruno Muestra Díaz:1", "Camila Ficticia López:1", "Diego Prueba Soto:2", "Elena Ejemplo Cruz:2", "Fernando Demo Ríos:2", "Gabriela Muestra Peña:3", "Hugo Ficticio Lara:3", "Itzel Ejemplo Mora:3", "Joaquín Prueba Vega:3"].forEach(x => { const [n, gr] = x.split(":"); g.alumnos.push({ id: uid(), nombre: n, g: +gr }); });
    D.grupos.push(g); D.gact = g.id; D.docente.nombre = "Mtra. Laura Ejemplo Ruiz"; guardar(); } }
window.addEventListener("hashchange", () => { if (/[#&](demo(?![\w-])|t=|acceso=)/.test(location.hash)) location.reload(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
(async () => { $("#app").innerHTML = `<p style="margin-top:40vh;text-align:center;color:#6A5C4C">Abriendo Tlamatini Aula…</p>`; calendario(); ACCESO_OK = await acceso(); arrancarDatos(); pintar(); })();
