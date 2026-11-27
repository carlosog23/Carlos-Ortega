/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Tlamatini Aula · el trabajo diario del maestro de grupo de primaria y del docente de secundaria: mi grupo (también multigrado), pase de lista,
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
/* ---------- nivel: primaria o secundaria (Fase 6) ---------- */
const APP_PRE = window.NIVEL_APP === "pre", APP_ESP = window.NIVEL_APP === "esp";
const esSec = g => !!(g && g.nivel === "sec");
const es050 = () => { try { return !APP_PRE && !esSec(gAct()); } catch (e) { return !APP_PRE; } };  // solo primaria de la Zona 050 lleva la leyenda de la zona
const esPre = g => !!(g && g.nivel === "pre");
const nivelTxt = g => esPre(g) ? "preescolar" : esSec(g) ? "secundaria" : "primaria";
const DISC_SEC = [["Español", "L", "Esp."], ["Lengua Indígena como Lengua Materna", "L", "L. Ind. LM"], ["Lengua Indígena como Segunda Lengua", "L", "L. Ind. L2"], ["Inglés", "L", "Inglés"], ["Artes", "L", "Artes"],
  ["Matemáticas", "S", "Mat."], ["Biología", "S", "Biol."], ["Física", "S", "Fís."], ["Química", "S", "Quím."],
  ["Geografía", "E", "Geog."], ["Historia", "E", "Hist."], ["Formación Cívica y Ética", "E", "FCyE"],
  ["Tecnología", "H", "Tec."], ["Educación Socioemocional / Tutoría", "H", "Tutoría"], ["Educación Física", "H", "E. F."]];
const DISC_GR = { "Biología": [1], "Física": [2], "Química": [3], "Geografía": [1] };
const discDe = n => DISC_SEC.find(x => x[0] === n);
const discDelGrado = gr => DISC_SEC.filter(x => !DISC_GR[x[0]] || DISC_GR[x[0]].includes(gr)).map(x => x[0]);
const TELE = gr => discDelGrado(gr).filter(n => !/^Lengua Ind/.test(n));
const MODS = { general: "Secundaria general", tecnica: "Secundaria técnica", tele: "Telesecundaria", comunitaria: "Secundaria comunitaria" };
/* escala única de grados para el banco de dinámicas: 1 a 6 primaria, 7 a 9 = 1.° a 3.° de secundaria */
const escala = grp => { const gs = grp && grp.grados && grp.grados.length ? grp.grados : [1], o = esPre(grp) ? 10 : esSec(grp) ? 6 : 0; return [Math.min(...gs) + o, Math.max(...gs) + o]; };
const gEsc = n => n > 10 ? (n - 10) + ".° pre." : n > 6 ? (n - 6) + ".° sec." : n + ".°";
const gRango = r => r[0] === r[1] ? gEsc(r[0]) : r[0] > 10 ? (r[0] - 10) + ".° a " + (r[1] - 10) + ".° pre." : r[0] > 6 ? (r[0] - 6) + ".° a " + (r[1] - 6) + ".° sec." : r[1] > 6 ? r[0] + ".° prim. a " + gEsc(r[1]) : r[0] + ".° a " + r[1] + ".°";
const areaTxt = g => esSec(g) ? "disciplina" : "campo formativo";
const nrm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const titulo = t => String(t || "").toLowerCase().replace(/(^|\s|-)([a-záéíóúüñ])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(De|Del|La|Las|Los|Y)\b/g, w => w.toLowerCase());
const ic = (n, s = 20) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${ICONOS[n] || ""}</svg>`;
const ICONOS = {
  chispa: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>', qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  atras: '<path d="M15 18l-6-6 6-6"/>', sig: '<path d="M9 18l6-6-6-6"/>', mas: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12l5 5 9-10"/>',
  grupo: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5c3 0 5.5 1.7 5.5 4.5"/>',
  plan: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>', lista: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  juego: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r="1"/><circle cx="18" cy="13.5" r="1"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  play: '<path d="M7 4l13 8-13 8z"/>', pausa: '<path d="M8 5v14M16 5v14"/>', reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  estrella: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>', impr: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  bajar: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>', subir: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>', lapiz: '<path d="M4 20h4L20 8l-4-4L4 16z"/>',
  basura: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', agenda: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>', buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  libro: '<path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z"/>', doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  eval: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>', camara: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>'
};

/* ---------------- datos ---------------- */
const CAP = (() => { let on = false; try { on = sessionStorage.getItem("aula-cap") === "1"; } catch (e) {} if (/[#&]capacitacion\b/.test(location.hash)) { on = true; try { sessionStorage.setItem("aula-cap", "1"); sessionStorage.setItem("aula-demo", "1"); } catch (e) {} history.replaceState(null, "", location.pathname); } return on; })();
const DEMO = (() => { let on = CAP; try { on = sessionStorage.getItem("aula-demo") === "1"; } catch (e) {} if (/[#&]demo(?![\w-])/.test(location.hash)) { on = true; try { sessionStorage.setItem("aula-demo", "1"); } catch (e) {} history.replaceState(null, "", location.pathname); } return on; })();
const CLAVE = (APP_PRE ? "aula-pre-" : APP_ESP ? "aula-esp-" : "aula-") + (CAP ? "cap" : DEMO ? "demo" : "datos");
const VACIO = () => ({ v: 1, docente: { nombre: "", correo: "" }, grupos: [], gact: "", planes: [], exams: [], asis: {}, favs: [], mias: [], reg: [], fotos: [], bol: {}, cfg: {} });
let D = cargar();
function cargar() { try { const x = JSON.parse(localStorage.getItem(CLAVE) || "null"); if (x && x.v) return Object.assign(VACIO(), x); } catch (e) {} return VACIO(); }
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(D)); } catch (e) { toast("<b>No se pudo guardar.</b> El dispositivo no tiene espacio."); } }
const LS = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const grDe = id => D.grupos.find(g => g.id === id), plDe = id => D.planes.find(p => p.id === id);
const gAct = () => grDe(D.gact) || D.grupos[0] || null;
const activos = g => (g ? g.alumnos || [] : []).filter(a => !a.baja).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
const grNom = g => g ? (g.grados.length > 1 ? `Multigrado ${g.grados.map(x => x + ".°").join(", ")}` : `${g.grados[0]}.°`) + (g.grupo ? " " + g.grupo : "") + (esSec(g) ? " · " + ((g.discs || []).length === 1 ? g.discs[0] : g.mod === "tele" ? "Telesecundaria" : (g.discs || []).length + " disciplinas") : "") : "";
const yo = () => { const t = LS("tlm-yo"), p = LS("ppie-perfil") || {}; return { nombre: D.docente.nombre || (t && t.persona ? [t.persona.trato, t.persona.nombre].filter(Boolean).join(" ") : p.minombre || ""), correo: D.docente.correo || (t && t.persona ? t.persona.correo : p.micorreo || "") }; };

/* ---------------- programa y calendario ---------------- */
let PDA = null, CAL = null;
async function programa() { if (PDA) return PDA; try { const r = await fetch(TLM + "formatos/pda.json"); if (r.ok) { PDA = await r.json(); try { localStorage.setItem("aula-pda", JSON.stringify(PDA)); } catch (e) {} } } catch (e) {} if (!PDA) PDA = LS("aula-pda"); return PDA; }
let PDA6 = null, PDA2 = null;
async function programaPre() { if (PDA2) return PDA2; try { const r = await fetch(TLM + "formatos/pda-pre.json"); if (r.ok) { PDA2 = await r.json(); try { localStorage.setItem("aula-pda2", JSON.stringify(PDA2)); } catch (e) {} } } catch (e) {} if (!PDA2) PDA2 = LS("aula-pda2"); return PDA2; }
async function programaSec() { if (PDA6) return PDA6; try { const r = await fetch(TLM + "formatos/pda-sec.json"); if (r.ok) { PDA6 = await r.json(); try { localStorage.setItem("aula-pda6", JSON.stringify(PDA6)); } catch (e) {} } } catch (e) {} if (!PDA6) PDA6 = LS("aula-pda6"); return PDA6; }
async function calendario() { if (CAL) return CAL; try { const r = await fetch(TLM + "formatos/calendario.json"); if (r.ok) CAL = await r.json(); } catch (e) {} return CAL || { vacaciones: [], eventos: [] }; }
function sinClase(k) { const c = CAL || { vacaciones: [], eventos: [] }; const v = (c.vacaciones || []).find(([a, b]) => k >= a && k <= b); if (v) return v[2];
  const e = (c.eventos || []).find(([a, b, t]) => k >= a && k <= b && /suspensi|consejo t[eé]cnico|fin de clases|clausura/i.test(t)); return e ? e[2] : null; }
function diasHabiles(desde, n) { const out = [], d = dF(desde); for (let i = 0; i < 400 && out.length < n; i++, d.setDate(d.getDate() + 1)) { const k = iso(d); if (d.getDay() === 0 || d.getDay() === 6 || sinClase(k)) continue; out.push(k); } return out; }
const CAMPOS = ["Lenguajes", "Saberes y pensamiento científico", "Ética, naturaleza y sociedades", "De lo humano y lo comunitario"];
/* áreas que se califican: campos formativos en primaria, disciplinas en secundaria */
const areasDe = g => esSec(g) ? (g.discs && g.discs.length ? g.discs : []) : CAMPOS;
const ABR_A = { "Lenguajes": "Leng.", "Saberes y pensamiento científico": "Saberes", "Ética, naturaleza y sociedades": "Ética", "De lo humano y lo comunitario": "Humano" };
const abrArea = a => ABR_A[a] || (discDe(a) || [])[2] || a;
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
/* regresar a la pantalla anterior; si no hay a dónde (se llegó directo), vuelve al inicio */
function volver() { if (PILA.length) history.back(); else { S = { v: "inicio" }; pintar(); window.scrollTo(0, 0); } }
function atras() { S = PILA.pop() || { v: "inicio" }; pintar(); window.scrollTo(0, 0); }
window.addEventListener("popstate", () => { if ($("#clase")) return cerrarClase(); if (PILA.length || S.v !== "inicio") atras(); });
const VISTAS = {}, ENLAZAR = {};
let ACCESO_OK = false;
function pintar() { cerrarDlg(); if (!ACCESO_OK && S.v !== "revisar") S = { v: "bloqueo" }; else if (ACCESO_OK && S.v === "bloqueo") S = { v: "inicio" }; else if (ACCESO_OK && APP_ESP) { if (typeof espListo === "function" && !espListo() && !["espAlta", "ajustes", "revisar", "admin"].includes(S.v)) S = { v: "espAlta" }; }
  else if (ACCESO_OK && !D.grupos.length && S.v === "bienvenida") S = { v: "inicio" };   /* ya no se obliga a registrar el grupo para entrar */
  const f = VISTAS[S.v] || VISTAS.inicio; $("#app").innerHTML = (CAP ? `<div class="banda-demo">Capacitación · datos ficticios · puede usar todo <button id="dReini">Reiniciar datos</button> <button id="dSalir">Salir</button></div>` : DEMO ? `<div class="banda-demo">Demostración con datos ficticios · puede usar todo <button id="dSalir">Salir</button></div>` : "") + f(); (ENLAZAR[S.v] || (() => {}))();
  const b = $("#atras"); if (b) b.onclick = volver; const dr = $("#dReini"); if (dr) dr.onclick = async () => { if (!(await confirmar("Se borrará lo que se haya practicado y se volverán a cargar los datos de capacitación.", "Reiniciar"))) return; try { localStorage.removeItem(CLAVE); indexedDB.deleteDatabase((APP_PRE ? "aula-pre" : APP_ESP ? "aula-esp" : "aula") + "-cap"); } catch (e) {} location.reload(); };
  const ds = $("#dSalir"); if (ds) ds.onclick = () => { try { sessionStorage.removeItem("aula-cap"); sessionStorage.removeItem("aula-demo"); localStorage.removeItem("aula-demo"); } catch (e) {} location.href = location.pathname; }; }
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
const marca = (claro) => `<div class="marca"><img src="img/aula-icono.svg" alt=""><div><div class="mk-n">Tlamatini <b>Aula</b>${APP_PRE || APP_ESP ? ` <small style="font-size:.6em;letter-spacing:.06em;text-transform:uppercase;opacity:.85">${APP_PRE ? "Preescolar" : "Especial"}</small>` : ""}</div><div class="mk-l">El saber, en acción</div></div></div>`;
const pie = () => `<p class="pie privado">${ic("check", 14)} Lo que hace en Tlamatini Aula se queda en su celular o su computadora. Nadie más lo ve; usted decide si lo comparte.</p><p class="pie">Tlamatini Aula · de la familia Tlamatini${es050() ? " · Supervisión Escolar Zona 050 · ISEP" : ""}</p><div class="firma-autor"><span>Desarrollada por</span><img src="${TLM}firma-autor.svg" alt="Maestro Carlos Ortega" width="200" height="65"></div>`;

/* =================================================================== BLOQUEO */
VISTAS.bloqueo = () => `<main class="wrap"><section class="portada">${marca()}<h1>Su aula, con todo a la mano</h1><p>Planeación con los contenidos y PDA oficiales de su grado, su grupo, el pase de lista y un banco de dinámicas y juegos para la clase.</p></section>
  <section class="card mt"><h3>Entre con su enlace personal</h3><p class="muted mb">Tlamatini Aula usa el <b>mismo enlace personal de Tlamatini</b> que le llegó a su correo institucional. Ábralo una vez desde ese correo, o péguelo aquí.</p>
   <label class="campo"><span>Su enlace de Tlamatini</span><input id="bEnl" type="url" autocomplete="off" placeholder="https://carlosog23.github.io/…"></label>
   <div class="fila"><button class="btn p" id="bOk">Entrar</button><a class="btn" href="#demo" id="bDemo">${ic("play", 16)} Ver demostración</a></div>
   <p class="small muted mt">¿No tiene enlace? Pídalo a la supervisión de su zona escolar.</p></section>
  <section class="card mt"><h3>¿Viene a revisar a un docente?</h3><p class="small muted mb">Supervisión, dirección o ATP: abra el código que le muestra el docente.</p><button class="btn" id="bRev">${ic("qr", 16)} Revisar con código</button></section>${pie()}</main>`;
ENLAZAR.bloqueo = () => { $("#bRev").onclick = () => ir("revisar"); $("#bOk").onclick = async () => { const v = val("bEnl"), m = v.match(/[#&](t|acceso)=([A-Za-z0-9_-]{10,})/); if (!m) return toast("Pegue el enlace completo que le llegó por correo.");
    localStorage.setItem(m[1] === "t" ? "tlp-token" : "acc-token", JSON.stringify(m[2])); toast("Revisando su enlace…"); ACCESO_OK = await acceso(); if (!ACCESO_OK) return toast("Ese enlace ya no es válido. Pida uno nuevo a la Supervisión.", 4000); arrancarDatos(); pintar(); };
  $("#bDemo").onclick = e => { e.preventDefault(); try { sessionStorage.setItem("aula-demo", "1"); } catch (er) {} location.reload(); }; };

/* =================================================================== BIENVENIDA Y GRUPO */
function escuelasMias() { if (APP_ESP && typeof espEscuelasGrupo === "function") return espEscuelasGrupo(); if (APP_PRE) return DEMO ? [{ cct: "02DJN9999Z", nombre: "Jardín de Niños «Rosaura Zapata» (ejemplo)", turno: "Matutino", dir: "Elena Ejemplo Rivas", cargoDir: "Directora", loc: "Camalú", mun: "San Quintín" }] : [];
  const t = LS("tlm-yo"), p = LS("ppie-perfil") || {}, out = [];
  if (t && Array.isArray(t.escuelas)) t.escuelas.forEach(e => out.push({ cct: e.cct, nombre: "Escuela Primaria " + e.nombre, turno: e.turno || "", dir: e.dir || "", cargoDir: e.cargo || "", loc: e.loc || "", mun: e.mun || "", dom: e.dom || "" }));
  if (p.cct && !out.some(e => e.cct === p.cct)) out.push({ cct: p.cct, nombre: p.escuela || "", turno: p.turno || "", dir: p.director || "", loc: p.localidad || "", mun: p.municipio || "", dom: p.domicilio || "" });
  if (DEMO && !out.length) out.push({ cct: "02DPR9999Z", nombre: "Escuela Primaria «Cuauhtémoc» (ejemplo)", turno: "Matutino", dir: "Ramón Ejemplo Torres", cargoDir: "Director", loc: "Camalú", mun: "San Quintín", dom: "Calle Revolución s/n" });
  return out; }
VISTAS.bienvenida = () => { const y = yo(); return `<main class="wrap"><section class="portada">${marca()}<h1>Hola${y.nombre ? ", " + esc(corto(y.nombre.replace(/^(Mtr[oa]\.|C\.)\s*/, ""))) : ""}</h1>
  <p>Para empezar, registre su grupo. Si tiene doble plaza o más de un grupo, después puede agregar los demás.</p></section>
  <div class="mt">${formGrupoHTML({})}</div>${pie()}</main>`; };
ENLAZAR.bienvenida = () => enlazarFormGrupo({}, true);
function formGrupoHTML(g) { const escs = escuelasMias(), gr = g.grados || [], sec = !APP_PRE && (g.id ? esSec(g) : S.nivelNuevo === "sec"), preE = APP_ESP && (g.id ? esPre(g) : S.nivelNuevo === "pre"), otra = (g.cct && !escs.some(e => e.cct === g.cct)) || (!g.id && sec) || !escs.length;
  const ds = new Set(g.discs || []), CAMP_N = { L: "Lenguajes", S: "Saberes y pensamiento científico", E: "Ética, naturaleza y sociedades", H: "De lo humano y lo comunitario" };
  return `<section class="card"><h3>${g.id ? "Editar grupo" : "Mi grupo"}</h3>
   ${APP_PRE ? `<p class="small muted mb">Preescolar · Fase 2</p>` : g.id ? `<p class="small muted mb">${preE ? "Preescolar" : sec ? "Secundaria" : "Primaria"}</p>` : `<div class="campo"><span>Nivel</span><div class="chips" id="gNv">${APP_ESP ? `<button type="button" class="chip" data-nv="pre" aria-pressed="${preE}">Preescolar</button>` : ""}<button type="button" class="chip" data-nv="prim" aria-pressed="${!sec && !preE}">Primaria</button><button type="button" class="chip" data-nv="sec" aria-pressed="${sec}">Secundaria</button></div></div>`}
   <label class="campo"><span>Escuela</span><select id="gE">${escs.map(e => `<option value="${esc(e.cct)}" ${!otra && e.cct === g.cct ? "selected" : ""}>${esc(e.nombre)}${e.turno ? " · " + esc(e.turno) : ""}</option>`).join("")}<option value="otra" ${otra ? "selected" : ""}>Otra escuela…</option></select></label>
   <div id="gOtra" ${otra ? "" : "hidden"}><div class="dos"><label class="campo"><span>Nombre de la escuela</span><input id="gEN" value="${esc(g.escuela || "")}" placeholder="${APP_PRE ? "Jardín de Niños …" : sec ? "Escuela Secundaria General No. …" : ""}"></label><label class="campo"><span>C.C.T.</span><input id="gEC" value="${esc(g.cct || "")}" style="text-transform:uppercase" placeholder="${APP_PRE ? "02DJN…, 02EJN…" : sec ? "02DES…, 02DST…, 02ETV…" : ""}"></label></div></div>
   ${sec ? `<label class="campo"><span>Modalidad</span><select id="gMo">${Object.entries(MODS).map(([k, t]) => `<option value="${k}" ${(g.mod || "general") === k ? "selected" : ""}>${t}</option>`).join("")}</select></label>` : ""}
   <div class="campo"><span>Grado(s) <small>· ${sec ? "si atiende varios grados con este grupo, tóquelos todos" : "si es multigrado, toque todos los grados de su grupo"}</small></span><div class="chips" id="gG">${(sec || APP_PRE || preE ? [1, 2, 3] : [1, 2, 3, 4, 5, 6]).map(n => `<button type="button" class="chip" data-g="${n}" aria-pressed="${gr.includes(n)}">${n}.°</button>`).join("")}</div></div>
   ${sec ? `<div class="campo"><span>Disciplinas que imparte a este grupo <small>· en telesecundaria, todas</small></span>
     <div id="gDs">${["L", "S", "E", "H"].map(k => `<p class="small muted" style="margin:8px 0 4px">${CAMP_N[k]}</p><div class="chips">${DISC_SEC.filter(x => x[1] === k).map(x => `<button type="button" class="chip" data-ds="${esc(x[0])}" aria-pressed="${ds.has(x[0])}">${esc(x[0])}${DISC_GR[x[0]] ? ` <small>(${DISC_GR[x[0]].join(", ")}.°)</small>` : ""}</button>`).join("")}</div>`).join("")}</div>
     <p class="small muted mt">Biología y Geografía se imparten en 1.°, Física en 2.° y Química en 3.°, como marca el Programa Sintético de la Fase 6.</p></div>` : ""}
   <div class="dos"><label class="campo"><span>Grupo${sec && !g.id ? " <small>· si tiene varios, sepárelos con coma: A, B, C</small>" : ""}</span><input id="gL" maxlength="${sec && !g.id ? 40 : 3}" value="${esc(g.grupo || "")}" placeholder="${sec && !g.id ? "A, B, C" : "A"}" style="text-transform:uppercase"></label>
   <label class="campo"><span>Turno</span><select id="gT">${["Matutino", "Vespertino", "Tiempo completo"].map(t => `<option ${t === (g.turno || (escs[0] || {}).turno) ? "selected" : ""}>${t}</option>`).join("")}</select></label></div>
   <div class="fila fin">${g.id ? `<button class="btn r" id="gB" style="margin-right:auto">${ic("basura", 16)}</button>` : ""}<button class="btn p" id="gOk">${ic("check", 18)} ${g.id ? "Guardar" : "Guardar y seguir"}</button></div></section>`; }
function enlazarFormGrupo(g, nuevo) { const sel = new Set(g.grados || []), sec = !APP_PRE && (g.id ? esSec(g) : S.nivelNuevo === "sec"), ds = new Set(g.discs || []);
  $$("#gNv .chip").forEach(b => b.onclick = () => { S.nivelNuevo = b.dataset.nv; re(); });
  $$("#gG .chip").forEach(b => b.onclick = () => { const n = +b.dataset.g; sel.has(n) ? sel.delete(n) : sel.add(n); b.setAttribute("aria-pressed", sel.has(n)); });
  const pintaDs = () => $$("#gDs [data-ds]").forEach(b => b.setAttribute("aria-pressed", ds.has(b.dataset.ds)));
  $$("#gDs [data-ds]").forEach(b => b.onclick = () => { const n = b.dataset.ds; ds.has(n) ? ds.delete(n) : ds.add(n); pintaDs(); });
  $("#gMo") && ($("#gMo").onchange = e => { if (e.target.value === "tele" && !ds.size) { (sel.size ? [...sel] : [1, 2, 3]).forEach(x => TELE(x).forEach(n => ds.add(n))); pintaDs(); } });
  $("#gE").onchange = e => { $("#gOtra").hidden = e.target.value !== "otra"; };
  $("#gOk").onclick = () => { if (!sel.size) return toast("Elija el grado (o los grados) de su grupo."); const cct = val("gE"), e = escuelasMias().find(x => x.cct === cct);
    const datos = { cct: cct === "otra" ? val("gEC").trim().toUpperCase() : cct, escuela: cct === "otra" ? val("gEN").trim() : e.nombre, turno: val("gT"), grados: [...sel].sort(), grupo: val("gL").trim().toUpperCase(),
      dir: e ? e.dir : "", cargoDir: e ? e.cargoDir : "", loc: e ? e.loc : "", mun: e ? e.mun : "" };
    if (cct === "otra" && !datos.escuela) return toast("Escriba el nombre de la escuela.");
    if (sec) { const vale = n => datos.grados.some(x => discDelGrado(x).includes(n)); let L = [...ds].filter(vale);
      if (!L.length && val("gMo") === "tele") L = [...new Set(datos.grados.flatMap(TELE))];
      if (!L.length) return toast(ds.size ? "Esas disciplinas no se imparten en el grado elegido." : "Elija la disciplina (o las disciplinas) que imparte.");
      Object.assign(datos, { nivel: "sec", mod: val("gMo") || "general", discs: DISC_SEC.map(x => x[0]).filter(n => L.includes(n)) }); }
    if (APP_PRE || (APP_ESP && (g.id ? esPre(g) : S.nivelNuevo === "pre"))) datos.nivel = "pre";
    if (g.id) { Object.assign(g, datos); guardar(); volver(); toast("Grupo guardado."); return; }
    const letras = sec ? [...new Set(datos.grupo.split(/[\s,;/]+/).map(x => x.trim()).filter(Boolean))] : [datos.grupo];
    const nuevos = (letras.length ? letras : [""]).map(l => Object.assign({ id: uid(), alumnos: [] }, datos, { grupo: l }));
    D.grupos.push(...nuevos); D.gact = nuevos[0].id; S.nivelNuevo = null; const y = yo(); if (!D.docente.nombre) D.docente.nombre = y.nombre; if (!D.docente.correo) D.docente.correo = y.correo; guardar();
    if (nuevo) { S = { v: "inicio" }; ir("grupo", { id: nuevos[0].id, nuevo: true }); } else { volver(); } toast(nuevos.length > 1 ? `Se registraron ${nuevos.length} grupos (${letras.join(", ")}). Ahora agregue a los alumnos de cada uno.` : "Grupo registrado. Ahora agregue a sus alumnos.", 4000); };
  $("#gB") && ($("#gB").onclick = async () => { if (!(await confirmar("Se borrará el grupo con sus alumnos y su asistencia. Las planeaciones se conservan.", "Borrar"))) return; D.grupos = D.grupos.filter(x => x !== g); D.gact = (D.grupos[0] || {}).id || ""; guardar(); ir("inicio", {}, true); }); }
VISTAS.grupoForm = () => barra("Mi grupo", S.id ? "Editar grupo" : "Agregar grupo") + `<main class="wrap mt">${formGrupoHTML(grDe(S.id) || {})}</main>`;
ENLAZAR.grupoForm = () => enlazarFormGrupo(grDe(S.id) || {}, false);

/* =================================================================== INICIO */
VISTAS.inicio = () => { if (APP_ESP) return VISTAS.espInicio ? VISTAS.espInicio() : `<main class="wrap"><p class="mt">Cargando…</p></main>`; const g = gAct(), y = yo(), k = hoy(), d = new Date(), sc = sinClase(k), hoySes = [];
  D.planes.filter(p => p.gid === (g && g.id)).forEach(p => p.sesiones.forEach((s, i) => { if (s.fecha === k) hoySes.push({ p, s, i }); }));
  const prox = []; D.planes.filter(p => p.gid === (g && g.id)).forEach(p => p.sesiones.forEach((s, i) => { if (s.fecha > k && !s.hecho) prox.push({ p, s, i }); })); prox.sort((a, b) => a.s.fecha.localeCompare(b.s.fecha));
  return `<main class="wrap"><section class="portada">${marca()}<h1>Hola, ${esc(corto(y.nombre.replace(/^(Mtr[oa]\.|C\.)\s*/, "")) || "maestro(a)")}</h1>
   <p>${DSEM_L[d.getDay()][0].toUpperCase() + DSEM_L[d.getDay()].slice(1)} ${fLarga(k)}${sc ? ` · <b>${esc(sc)}</b>` : ""}</p>
   ${D.grupos.length > 1 ? `<div class="chips mt">${D.grupos.map(x => `<button class="chip osc" data-ga="${x.id}" aria-pressed="${x === g}">${esc(grNom(x))} · ${esc(String(x.escuela).replace(/^Escuela Primaria\s*/i, ""))}</button>`).join("")}</div>` : g ? `<p class="small" style="margin-top:6px;opacity:.85">${esc(grNom(g))} · ${esc(g.escuela)} · ${activos(g).length} alumnos</p>` : `<p class="small" style="margin-top:6px;opacity:.85">Puede usar la app desde ya. Su grupo y sus alumnos los registra cuando quiera; para planear o pasar lista solo se le pedirá el grado.</p>`}
   <div class="fila"><button class="btn m" id="bLista">${ic("lista")} Pasar lista</button><button class="btn sec" id="bPlanN">${ic("mas")} Nueva planeación</button>${enApp() ? "" : `<button class="btn sec" id="bInst">${ic("bajar")} Instalar app</button>`}</div></section>
  ${typeof ppieBotonInicio === "function" ? ppieBotonInicio() : ""}
  ${typeof estTarjeta === "function" ? estTarjeta() : ""}${lecRecordatorioHTML(g)}
  ${hoySes.length ? `<h2 class="sec-t">Hoy en clase</h2><div class="lista">${hoySes.map(x => `<button class="hoy-i" data-ses="${x.p.id}|${x.i}"><span class="gr">${x.i + 1}</span><span class="tx"><b>${esc(x.p.titulo)}</b><small>Sesión ${x.i + 1} de ${x.p.sesiones.length} · ${esc(x.s.fase)}</small></span><span class="tag ${x.s.hecho ? "" : "m"}">${x.s.hecho ? "Dada" : "Dar la clase"}</span></button>`).join("")}</div>` : ""}
  ${!hoySes.length && prox.length ? `<h2 class="sec-t">Lo que sigue</h2><div class="lista">${prox.slice(0, 3).map(x => `<button class="hoy-i" data-ses="${x.p.id}|${x.i}"><span class="gr">${x.i + 1}</span><span class="tx"><b>${esc(x.p.titulo)}</b><small>${fCorta(x.s.fecha)} · ${esc(x.s.fase)}</small></span>${ic("sig", 18)}</button>`).join("")}</div>` : ""}
  <h2 class="sec-t">Su aula</h2><div class="puertas">
   <button class="puerta" data-v="planes" style="--c:#24427A;--c-s:#E6ECF6"><span class="ic">${ic("plan")}</span><b>Planeación</b><span>${D.planes.filter(p => p.gid === (g && g.id)).length} proyectos · contenidos y PDA oficiales de su grado</span></button>
   ${typeof avResumen === "function" && avAplica(g) ? (() => { const A = avResumen(g); return `<button class="puerta" data-v="avance" style="--c:#1E8E5A;--c-s:#DDF1E6"><span class="ic">${ic("check")}</span><b>Avance del programa</b><span>${A ? `${A.pct}% · ${A.ok} de ${A.n} contenidos trabajados` : "Contenidos del programa trabajados en el ciclo"}</span>${A ? `<span class="barra-p"><i style="width:${A.pct}%"></i></span>` : ""}</button>`; })() : ""}
   <button class="puerta" data-v="dinamicas" style="--c:#C2603A;--c-s:#F7E3D8"><span class="ic">${ic("juego")}</span><b>Dinámicas y juegos</b><span>${todasDin().filter(d => nivelOK(g, d)).length} actividades para iniciar, activar, jugar y cerrar</span></button>
   <button class="puerta" data-v="grupo" style="--c:#1B7560;--c-s:#DBEFE8"><span class="ic">${ic("grupo")}</span><b>Mi grupo</b><span>${g ? `${activos(g).length} alumnos · altas, bajas y lista de RELweb` : "Opcional · registre su grupo y sus alumnos cuando quiera"}</span></button>
   <button class="puerta" data-v="evaluacion" style="--c:#6B3F7A;--c-s:#EEE3F2"><span class="ic">${ic("eval")}</span><b>${esPre(g) ? "Evaluación cualitativa" : "Evaluación y boletas"}</b><span>${esPre(g) ? "Listas de cotejo, observaciones por campo formativo y redacción con IA" : `Calificación por ${areaTxt(g)}, valoración e informes del trimestre`}</span></button>
   ${esPre(g) ? "" : `<button class="puerta" data-v="examenes" style="--c:#A94C2A;--c-s:#F7E3D8"><span class="ic">${ic("doc")}</span><b>Exámenes</b><span>${(D.exams || []).filter(e => e.gid === (g && g.id)).length} · diagnósticos, parciales, trimestrales, finales y por contenido</span></button>`}
   <button class="puerta" data-v="asistencia" style="--c:#8A5A08;--c-s:#FAEBCB"><span class="ic">${ic("agenda")}</span><b>Asistencia del mes</b><span>Concentrado para imprimir</span></button>
   <button class="puerta" data-v="libros" style="--c:#1F6F8B;--c-s:#DCEEF3"><span class="ic">${ic("libro")}</span><b>Libros de texto</b><span>Los libros gratuitos de ${g && g.grados.length > 1 ? "sus grados" : "su grado"}, ciclo 2026-2027</span></button>
   ${VISTAS.estudio ? `<button class="puerta" data-v="estudio" style="--c:#294A86;--c-s:#FAEBCB"><span class="ic">${ic("libro")}</span><b>Mi actualización profesional</b><span>${(D.est || {}).on ? `${D.est.n} ${D.est.n === 1 ? "pregunta" : "preguntas"} diarias rumbo a USICAMM` : "Estudie para USICAMM: preguntas diarias, práctica por tema, simulacros y bibliografía oficial"}</span></button>` : ""}
   <button class="puerta" data-v="visita" style="--c:#1F3A6B;--c-s:#E6ECF6"><span class="ic">${ic("qr")}</span><b>Visita de acompañamiento</b><span>Comparta su trabajo con un código QR, o revise a un docente</span></button>
   <button class="puerta" data-v="ajustes" style="--c:#6A5C4C;--c-s:#EFE6D6"><span class="ic">${ic("ajustes")}</span><b>Ajustes y respaldo</b><span>Sus datos, sus grupos y copia de seguridad</span></button>
   <a class="puerta" href="${TLM}" style="--c:#1F3A6B;--c-s:#F4E1C1;text-decoration:none;color:inherit"><span class="ic">${ic("doc")}</span><b>Tlamatini</b><span>Formatos, documentos y trámites de la escuela</span></a></div>${pie()}</main>`; };
ENLAZAR.inicio = () => { if (APP_ESP) return ENLAZAR.espInicio && ENLAZAR.espInicio(); typeof ppieEnlazarInicio === "function" && ppieEnlazarInicio(); lecRecordatorioCablear(gAct()); $$("[data-ga]").forEach(b => b.onclick = () => { D.gact = b.dataset.ga; guardar(); re(); }); $("#bLista").onclick = () => conGrado(() => ir("lista")); $("#bPlanN").onclick = () => conGrado(() => lecRecordar(gAct(), () => ir("planNueva")));
  $("#bInst") && ($("#bInst").onclick = instalar); $$(".puerta[data-v]").forEach(b => b.onclick = () => { const v = b.dataset.v; if (v === "grupo" && !gAct()) return ir("grupoForm"); if (VISTAS_CON_GRUPO.includes(v)) return conGrado(() => ir(v)); ir(v); });
  $$("[data-ses]").forEach(b => b.onclick = () => { const [pid, i] = b.dataset.ses.split("|"); abrirClase(pid, +i); });
  typeof estEnlazar === "function" && estEnlazar(); };
let PROMPT_INST = null; window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); PROMPT_INST = e; const b = $("#invInst"), q = $("#invPasos"); if (b) b.style.display = ""; if (q) q.style.display = "none"; });
window.addEventListener("appinstalled", () => { PROMPT_INST = null; cerrarDlg(); toast("<b>¡Listo!</b> Tlamatini Aula quedó instalada. Ábrala desde su pantalla de inicio o escritorio.", 5000); });
/* al abrir: invitación a instalar la app en el celular o la computadora (una vez por visita, mientras no esté instalada) */
function invitarInstalar() {
  if (enApp() || DEMO || $("#velo")) return; try { if (sessionStorage.getItem("aula-inv") === "1") return; sessionStorage.setItem("aula-inv", "1"); } catch (e) {}
  const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1), android = /Android/i.test(ua), cel = ios || android;
  const nom = "Tlamatini Aula" + (APP_PRE ? " Preescolar" : APP_ESP ? " Especial" : "");
  const pasos = ios ? (/CriOS|FxiOS|EdgiOS/.test(ua) ? "Abra esta página en <b>Safari</b> y toque <b>Compartir</b> (el cuadro con la flecha hacia arriba) → <b>«Agregar a pantalla de inicio»</b> → <b>Agregar</b>." : "Toque <b>Compartir</b> (el cuadro con la flecha hacia arriba, abajo en la pantalla) → baje y elija <b>«Agregar a pantalla de inicio»</b> → <b>Agregar</b>.")
    : android ? "En Chrome, toque el menú <b>⋮</b> (arriba a la derecha) → <b>«Instalar app»</b> o <b>«Agregar a la pantalla principal»</b>."
    : "En Chrome o Edge, haga clic en el ícono de <b>instalar</b> (una pantalla con una flecha) a la derecha de la barra de direcciones, o en el menú <b>⋮</b> → <b>«Instalar»</b>.";
  dlg(`<div class="fila" style="gap:12px;flex-wrap:nowrap;align-items:center"><img src="img/aula-icono-192.png" alt="" style="width:56px;height:56px;border-radius:14px;flex:none" onerror="this.remove()"><div><h3 style="margin:0">Instale ${esc(nom)} en su ${cel ? "celular" : "computadora"}</h3><p class="small muted" style="margin:2px 0 0">Gratis, en un momento y sin tienda de aplicaciones.</p></div></div>
   <ul class="small mt" style="padding-left:20px;line-height:1.5"><li>Se abre con un toque desde su ${cel ? "pantalla de inicio" : "escritorio"}, como cualquier app.</li><li>Funciona <b>sin internet</b>: pase lista y consulte sus planeaciones en el salón.</li><li>Sus datos se quedan guardados en su ${cel ? "celular" : "computadora"}.</li></ul>
   <div id="invPasos" class="mt" style="${PROMPT_INST ? "display:none;" : ""}background:#F6EFE3;border-radius:12px;padding:10px 12px"><p class="small" style="margin:0"><b>Cómo instalarla:</b> ${pasos}</p></div>
   <div class="fila fin mt"><button class="btn" id="invNo">${PROMPT_INST ? "Ahora no" : "Entendido"}</button><button class="btn p" id="invInst" style="${PROMPT_INST ? "" : "display:none"}">${ic("bajar", 16)} Instalar</button></div>`, v => {
    v.querySelector("#invNo").onclick = cerrarDlg;
    v.querySelector("#invInst").onclick = async () => { if (!PROMPT_INST) { v.querySelector("#invPasos").style.display = ""; return; } const pr = PROMPT_INST; PROMPT_INST = null; pr.prompt(); try { const r = await pr.userChoice; if (r && r.outcome === "accepted") cerrarDlg(); else { v.querySelector("#invInst").style.display = "none"; v.querySelector("#invPasos").style.display = ""; } } catch (e) {} }; }); }
function instalar() { if (PROMPT_INST) { PROMPT_INST.prompt(); PROMPT_INST = null; return; }
  dlg(`<h3>Instalar Tlamatini Aula${APP_PRE ? " Preescolar" : APP_ESP ? " Especial" : ""}</h3><p class="mb">En <b>iPhone o iPad</b> (Safari): Compartir → «Agregar a pantalla de inicio».<br>En <b>Android</b> (Chrome): menú ⋮ → «Instalar app».<br>En <b>computadora</b> (Chrome o Edge): el ícono de instalar en la barra de direcciones.</p><div class="fila fin"><button class="btn p" id="iX">Entendido</button></div>`, v => v.querySelector("#iX").onclick = cerrarDlg); }

/* Entrar sin registrar grupo ni alumnos: lo que de verdad necesita un grupo (planear, pasar lista, evaluar…)
   solo pregunta el grado con un toque y crea un grupo sencillo, sin alumnos; lo demás se completa cuando el docente quiera. */
const VISTAS_CON_GRUPO = ["planes", "avance", "evaluacion", "examenes", "asistencia", "visita", "lista", "planNueva"];
function conGrado(seguir) {
  if (gAct()) return seguir();
  const grs = APP_PRE ? [1, 2, 3] : [1, 2, 3, 4, 5, 6], e = escuelasMias()[0];
  dlg(`<h3>¿Qué grado atiende?</h3><p class="small muted mb">Solo para mostrarle los contenidos de su grado. No necesita registrar alumnos; si quiere, los agrega después en «Mi grupo».</p>
    <div class="chips" id="cgG">${grs.map(n => `<button type="button" class="chip" data-cg="${n}">${n}.°${APP_PRE ? "" : " grado"}</button>`).join("")}</div>
    <div class="fila mt" style="justify-content:space-between"><button class="btn" id="cgCompleto">${APP_PRE ? "Registro completo" : "Multigrado, secundaria o registro completo"}</button><button class="btn" id="cgNo">Cancelar</button></div>`, w => {
    w.querySelector("#cgNo").onclick = cerrarDlg;
    w.querySelector("#cgCompleto").onclick = () => { cerrarDlg(); ir("grupoForm"); };
    w.querySelectorAll("[data-cg]").forEach(b => b.onclick = () => {
      const g = { id: uid(), alumnos: [], cct: e ? e.cct : "", escuela: e ? e.nombre : "", turno: e ? e.turno : "", grados: [+b.dataset.cg], grupo: "", dir: e ? e.dir : "", cargoDir: e ? e.cargoDir : "", loc: e ? e.loc : "", mun: e ? e.mun : "" };
      if (APP_PRE) g.nivel = "pre";
      D.grupos.push(g); D.gact = g.id; const y = yo(); if (!D.docente.nombre) D.docente.nombre = y.nombre; if (!D.docente.correo) D.docente.correo = y.correo; guardar();
      cerrarDlg(); seguir(); }); });
}

/* =================================================================== MI GRUPO */
VISTAS.grupo = () => { const g = grDe(S.id) || gAct(); if (!g) return VISTAS.inicio(); const al = activos(g), bajas = (g.alumnos || []).filter(a => a.baja);
  return barra("Mi grupo", esc(grNom(g)), `<button class="btn s" id="gEd">${ic("lapiz", 16)} Editar</button>`) + `<main class="wrap">
  <p class="muted small mt">${esc(g.escuela)}${g.cct ? " · " + esc(g.cct) : ""} · ${esc(g.turno)}</p>
  ${S.nuevo || !al.length ? `<section class="card mt" style="border-left:5px solid var(--jade)"><h3>Agregue a sus alumnos</h3><p class="small muted mb">Elija la forma más fácil. Se pueden corregir después.</p>
   <div class="lista">${LS("ppie-dir") && (LS("ppie-dir").alumnos || []).length ? `<button class="it btnit" id="aDir"><span class="av">${ic("doc", 18)}</span><span class="tx"><b>Traerlos del directorio de Tlamatini</b><small>Los alumnos que ya capturó en Tlamatini</small></span></button>` : ""}
   <button class="it btnit" id="aPdf"><span class="av">${ic("subir", 18)}</span><span class="tx"><b>Subir la lista de RELweb (PDF)</b><small>La lista de asistencia o de inscripción que descarga de RELweb</small></span></button>
   <button class="it btnit" id="aPeg"><span class="av">${ic("lista", 18)}</span><span class="tx"><b>Pegar o escribir la lista</b><small>Un nombre por renglón</small></span></button></div></section>` : ""}
  <div class="fila mt" style="justify-content:space-between"><h2 class="sec-t" style="margin:0">${al.length} alumnos</h2><span class="fila" style="gap:6px"><button class="btn s" id="aMas">${ic("mas", 16)} Alumno</button>${al.length && VISTAS.expGrupo ? `<button class="btn s" id="aExp">${ic("doc", 16)} Expedientes</button>` : ""}${al.length ? `<button class="btn s" id="aImp">${ic("subir", 16)} Importar</button>` : ""}</span></div>
  <div class="lista mt">${al.map((a, i) => `<button class="it btnit" data-a="${a.id}"><span class="av">${i + 1}</span><span class="tx"><b>${esc(a.nombre)}</b><small>${g.grados.length > 1 ? (a.g ? a.g + ".° grado" : "<span style='color:var(--rojo)'>Falta indicar su grado</span>") : ""}${a.nee ? (g.grados.length > 1 ? " · " : "") + "Requiere ajustes: " + esc(a.nee) : ""}${(() => { const n = D.fotos.filter(f => f.al === a.id).length; return n ? ` · ${n} evidencia${n > 1 ? "s" : ""}` : ""; })()}</small></span>${ic("sig", 16)}</button>`).join("") || `<div class="vacio">Todavía no hay alumnos.</div>`}</div>
  ${bajas.length ? `<details class="mt"><summary class="small muted">Bajas (${bajas.length})</summary><div class="lista mt">${bajas.map(a => `<div class="it"><span class="tx"><b>${esc(a.nombre)}</b><small>Baja ${fCorta(a.baja)}</small></span><button class="btn s" data-re="${a.id}">Reactivar</button></div>`).join("")}</div></details>` : ""}
  <input type="file" id="fPdf" accept="application/pdf" hidden></main>`; };
ENLAZAR.grupo = () => { const g = grDe(S.id) || gAct(); if (!g) return;
  $("#gEd").onclick = () => ir("grupoForm", { id: g.id });
  const imp = () => dlg(`<h3>Importar alumnos</h3><div class="lista">${LS("ppie-dir") ? `<button class="it btnit" id="iDir"><span class="tx"><b>Del directorio de Tlamatini</b></span></button>` : ""}<button class="it btnit" id="iPdf"><span class="tx"><b>Lista de RELweb (PDF)</b></span></button><button class="it btnit" id="iPeg"><span class="tx"><b>Pegar o escribir</b></span></button></div><div class="fila fin mt"><button class="btn" id="iX">Cancelar</button></div>`, v => {
    v.querySelector("#iX").onclick = cerrarDlg; v.querySelector("#iDir") && (v.querySelector("#iDir").onclick = () => desdeDir(g)); v.querySelector("#iPdf").onclick = () => { cerrarDlg(); $("#fPdf").click(); }; v.querySelector("#iPeg").onclick = () => pegarLista(g); });
  $("#aImp") && ($("#aImp").onclick = imp); $("#aDir") && ($("#aDir").onclick = () => desdeDir(g)); $("#aPdf") && ($("#aPdf").onclick = () => $("#fPdf").click()); $("#aPeg") && ($("#aPeg").onclick = () => pegarLista(g));
  $("#fPdf").onchange = e => { leerPdf(g, e.target.files[0]); e.target.value = ""; };
  $("#aExp") && ($("#aExp").onclick = () => ir("expGrupo", { gid: g.id }));
  $("#aMas").onclick = () => formAlumno(g, null); $$("[data-a]").forEach(b => b.onclick = () => ir("alumno", { gid: g.id, id: b.dataset.a }));
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
const MARCAS = [["P", "Asistió"], ["R", "Retardo"], ["J", "Justificada"]];
/* Pase de lista: solo se marca P, R o J. En un día con lista tomada, quien queda sin marca faltó («F» de registros anteriores también cuenta como falta). */
const listaTomada = r => !!r && Object.values(r).some(v => v);
const marcaDe = (r, id) => !listaTomada(r) ? "" : (!r[id] || r[id] === "F") ? "F" : r[id];
VISTAS.lista = () => { const g = gAct(); if (!g) return VISTAS.inicio(); const k = S.f || hoy(), reg = ((D.asis[g.id] || {})[k]) || {}, al = activos(g), sc = sinClase(k);
  const n = c => al.filter(a => reg[a.id] === c).length;
  return barra("Pase de lista · " + esc(grNom(g)), fCorta(k)) + `<main class="wrap"><div class="fila mt"><input type="date" id="lF" value="${k}" style="min-height:44px;border:1px solid var(--hilo);border-radius:12px;padding:0 10px"><button class="btn s" id="lTodos">${ic("check", 16)} Todos asistieron</button></div>
  ${sc ? `<p class="small mt" style="color:var(--maiz-d)">Según el calendario: ${esc(sc)}.</p>` : ""}
  <div class="kpis mt">${MARCAS.map(([c, t]) => `<div class="kpi"><b>${n(c)}</b><span>${t}</span></div>`).join("")}<div class="kpi"><b>${listaTomada(reg) ? al.filter(a => marcaDe(reg, a.id) === "F").length : 0}</b><span>Faltas</span></div></div>
  <div class="lista mt">${al.map((a, i) => `<div class="it"><span class="av">${i + 1}</span><span class="tx"><b>${esc(a.nombre)}</b>${g.grados.length > 1 && a.g ? `<small>${a.g}.°</small>` : ""}</span><span class="asis">${MARCAS.map(([c]) => `<button class="m-${c}" data-al="${a.id}" data-c="${c}" aria-pressed="${reg[a.id] === c}">${c}</button>`).join("")}</span></div>`).join("") || `<div class="vacio">Primero agregue a sus alumnos en Mi grupo.</div>`}</div>
  <p class="small muted mt">P asistió · R retardo · J falta justificada. <b>Quien quede sin marcar se cuenta como falta.</b></p></main>`; };
ENLAZAR.lista = () => { const g = gAct(); if (!g) return; const k = S.f || hoy(); const reg = () => { D.asis[g.id] = D.asis[g.id] || {}; return D.asis[g.id][k] = D.asis[g.id][k] || {}; };
  $("#lF").onchange = e => { S.f = e.target.value; re(); };
  $("#lTodos").onclick = () => { const r = reg(); activos(g).forEach(a => { if (!r[a.id]) r[a.id] = "P"; }); guardar(); re(); };
  $$("[data-al]").forEach(b => b.onclick = () => { const r = reg(); r[b.dataset.al] = r[b.dataset.al] === b.dataset.c ? undefined : b.dataset.c; if (!r[b.dataset.al]) delete r[b.dataset.al]; guardar(); re(); }); };
VISTAS.asistencia = () => { const g = gAct(); if (!g) return VISTAS.inicio(); const m = S.m || hoy().slice(0, 7), A = D.asis[g.id] || {}, dias = Object.keys(A).filter(k => k.slice(0, 7) === m && listaTomada(A[k])).sort(), al = activos(g);
  const [yy, mm] = m.split("-").map(Number);
  return barra("Asistencia · " + esc(grNom(g)), MES_L[mm - 1] + " " + yy, `<button class="btn s" id="asI">${ic("impr", 16)} Imprimir</button>`) + `<main class="wrap"><div class="fila mt"><input type="month" id="asM" value="${m}" style="min-height:44px;border:1px solid var(--hilo);border-radius:12px;padding:0 10px"></div>
  ${dias.length ? `<div class="tabla-c mt"><table class="tabla"><thead><tr><th>Alumno(a)</th>${dias.map(k => `<th class="c">${dF(k).getDate()}<br><small>${DSEM[dF(k).getDay()]}</small></th>`).join("")}<th class="c">Asist.</th><th class="c">Faltas</th></tr></thead><tbody>
   ${al.map(a => { let as = 0, fa = 0; const c = dias.map(k => { const v = marcaDe(A[k], a.id); if (v === "P" || v === "R") as++; if (v === "F") fa++; return v === "F" ? `<td class="c m-F"></td>` : `<td class="c m-${v}">${v === "P" ? "•" : v}</td>`; }).join(""); return `<tr><td>${esc(a.nombre)}</td>${c}<td class="c"><b>${as}</b></td><td class="c">${fa}</td></tr>`; }).join("")}</tbody></table></div>` : `<div class="vacio mt">No hay registros de asistencia en este mes.</div>`}</main>`; };
ENLAZAR.asistencia = () => { $("#asM").onchange = e => { S.m = e.target.value; re(); }; $("#asI").onclick = () => { const t = $(".tabla-c"); if (!t) return toast("No hay registros este mes."); const g = gAct(); imprimir(`<div class="doc">${encabezado(g, "Lista de asistencia · " + $("h1").textContent)}${t.innerHTML.replace('class="tabla"', '')}<table class="firmas"><tr><td>${esc(yo().nombre)}<br>Docente del grupo</td><td>${esc(dirTxt(g))}<br>Dirección de la escuela</td></tr></table></div>`, true); }; };

/* =================================================================== DINÁMICAS */
const todasDin = () => DINAMICAS.concat(D.mias.map(d => Object.assign({ mia: true }, d)));
const nivelOK = (g, d) => !g || !d.g ? true : esPre(g) ? d.g[0] >= 11 : esSec(g) ? d.g[0] >= 7 && d.g[1] <= 9 : d.g[0] <= 6;
const dinDe = id => todasDin().find(d => d.id === id) || (ZONA || []).find(d => d.id === id);
VISTAS.dinamicas = () => { const F = S.F = S.F || { cat: "", campo: "", q: "", g: "", fav: false }, g = gAct(), q = nrm(F.q);
  const L = (F.zona ? (ZONA || []) : todasDin()).filter(d => nivelOK(g, d) && (!F.cat || d.cat === F.cat) && (!F.campo || d.campos.includes(F.campo)) && (!F.g || (d.g[0] <= +F.g && d.g[1] >= +F.g)) && (!F.fav || D.favs.includes(d.id)) && (!q || nrm(d.n + " " + d.prop + " " + d.mat).includes(q)));
  return barra("Tlamatini Aula", "Dinámicas y juegos", `<button class="btn s p" id="dNueva">${ic("mas", 16)} Mía</button>`) + `<main class="wrap">
  <div class="fila mt"><button class="btn tlami-b" id="dTlami">${ic("chispa", 16)} Crear con Tlami</button><button class="chip" id="dZona" aria-pressed="${!!F.zona}">${ic("grupo", 14)} De la zona${ZONA ? " (" + ZONA.length + ")" : ""}</button></div>
  ${esSec(g) ? "" : `<a href="../tlamatini-juego/" target="_blank" rel="noopener" class="mt" style="display:flex;align-items:center;gap:14px;text-decoration:none;color:#fff;background:linear-gradient(135deg,#24427A,#33589C);border-radius:18px;padding:14px 18px;box-shadow:0 4px 0 #13264A">
   <img src="../tlamatini-juego/img/icono-192.png" alt="" width="58" height="58" style="border-radius:14px;flex:none">
   <span style="flex:1"><b style="display:block;font-size:17px">El camino del saber · videojuego de Tlamatini</b><span style="font-size:13px;opacity:.85">Aventura por Baja California para sus alumnos y Duelo por equipos para proyectar en el pizarrón. Funciona sin internet.</span></span>
   <span style="background:#E8A33D;color:#3B2A08;font-weight:800;border-radius:12px;padding:8px 14px;white-space:nowrap">Jugar</span></a>`}
  ${F.zona && !ZONA ? `<p class="small muted mt">Cargando las dinámicas que comparten los docentes de la zona…</p>` : F.zona && ZONA.err ? `<p class="small muted mt">Sin conexión con el servidor (${esc(ZONA.err)}). Se muestran las últimas que se descargaron.</p>` : F.zona ? `<p class="small muted mt">Dinámicas que comparten sus compañeros. Guárdelas en las suyas para usarlas en sus planeaciones.</p>` : ""}
  <label class="campo mt"><input id="dQ" type="search" placeholder="Buscar: tablas, lectura, calma, patio…" value="${esc(F.q)}"></label>
  <div class="chips">${[["", "Todas"]].concat(Object.entries(DIN_CATS).map(([k, v]) => [k, v[0]])).map(([k, t]) => `<button class="chip" data-fc="${k}" aria-pressed="${F.cat === k}">${t}</button>`).join("")}</div>
  <div class="fila mt" style="gap:8px"><select id="dCampo" class="sel"><option value="">Todos los campos</option>${Object.entries(DIN_CAMPOS).map(([k, t]) => `<option value="${k}" ${F.campo === k ? "selected" : ""}>${t}</option>`).join("")}</select>
   <select id="dG" class="sel"><option value="">Todos los grados</option>${(esSec(g) ? [7, 8, 9] : [1, 2, 3, 4, 5, 6]).map(n => `<option value="${n}" ${String(F.g) === String(n) ? "selected" : ""}>${gEsc(n)}</option>`).join("")}</select>
   <button class="chip" id="dFav" aria-pressed="${F.fav}">${ic("estrella", 14)} Favoritas</button></div>
  <div class="dins mt">${L.map(d => { const c = DIN_CATS[d.cat] || ["", "#666"]; return `<button class="din" data-d="${esc(d.id)}" style="--c:${c[1]}"><span class="din-cat">${c[0]}</span><b>${esc(d.n)}</b><span class="din-p">${esc(d.prop)}</span>
     <span class="din-m">${ic("reloj", 14)} ${d.min} min · ${gRango(d.g)} · ${d.esp === "patio" ? "Patio" : d.esp === "ambos" ? "Aula o patio" : "Aula"}${D.favs.includes(d.id) ? " · ★" : ""}${d.mia && !d.zona ? " · Mía" : ""}${d.zona ? " · " + esc(d.autor || "") : ""}</span></button>`; }).join("") || `<div class="vacio">No hay dinámicas con estos filtros.</div>`}</div></main>`; };
ENLAZAR.dinamicas = () => { const F = S.F; let t; $("#dQ").oninput = e => { clearTimeout(t); t = setTimeout(() => { F.q = e.target.value; re(); const i = $("#dQ"); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); };
  $$("[data-fc]").forEach(b => b.onclick = () => { F.cat = b.dataset.fc; re(); }); $("#dCampo").onchange = e => { F.campo = e.target.value; re(); }; $("#dG").onchange = e => { F.g = e.target.value; re(); };
  $("#dFav").onclick = () => { F.fav = !F.fav; re(); }; $$("[data-d]").forEach(b => b.onclick = () => ir("dinamica", { id: b.dataset.d })); $("#dNueva").onclick = () => formDin(null);
  $("#dTlami").onclick = tlamiDinamica; $("#dZona").onclick = async () => { F.zona = !F.zona; re(); if (F.zona && !ZONA) { await cargarZona(); if (S.v === "dinamicas") re(); } }; };
VISTAS.dinamica = () => { const d = dinDe(S.id); if (!d) return VISTAS.dinamicas(); const c = DIN_CATS[d.cat] || ["", "#666"], fav = D.favs.includes(d.id);
  return barra(c[0], esc(d.n), `<button class="btn s" id="dFv" aria-label="Favorita" style="${fav ? "color:#C98A0B" : ""}">${ic("estrella", 18)}</button>`) + `<main class="wrap">
  <section class="card mt" style="border-top:5px solid ${c[1]}"><p><b>Para qué:</b> ${esc(d.prop)}</p>
   <div class="tags mt">${d.campos.map(k => `<span class="tag a">${DIN_CAMPOS[k]}</span>`).join(" ")} <span class="tag g">${ic("reloj", 12)} ${d.min} min</span> <span class="tag g">${gRango(d.g)}</span> <span class="tag g">${d.esp === "patio" ? "Patio" : d.esp === "ambos" ? "Aula o patio" : "Aula"}</span></div>
   ${d.mat ? `<p class="mt"><b>Material:</b> ${esc(d.mat)}</p>` : ""}</section>
  <section class="card mt"><h3>Cómo se hace</h3><ol class="pasos-l">${d.pasos.map(p => `<li>${esc(p)}</li>`).join("")}</ol></section>
  ${d.var || d.multi ? `<section class="card mt">${d.var ? `<p><b>Variante:</b> ${esc(d.var)}</p>` : ""}${d.multi ? `<p class="mt"><b>En multigrado:</b> ${esc(d.multi)}</p>` : ""}</section>` : ""}
  ${d.zona ? `<p class="small muted mt">Compartida por <b>${esc(d.autor || "un docente de la zona")}</b>${d.escuela ? " · " + esc(d.escuela) : ""}${d.creado ? " · " + fCorta(d.creado) : ""}</p>` : ""}
  <div class="fila mt2"><button class="btn p" id="dCl">${ic("play", 18)} Usar en clase</button>${d.mia && !d.zona ? `<button class="btn" id="dEd">${ic("lapiz", 16)} Editar</button>` : ""}
   ${d.zona ? `<button class="btn" id="dGu">${ic("bajar", 16)} ${D.mias.some(x => x.de === d.id) ? "Ya está en mis dinámicas" : "Guardar en mis dinámicas"}</button>${d.mia ? `<button class="btn r" id="dRe">Retirar del banco</button>` : ""}` : d.mia ? (d.pub ? `<button class="btn" id="dRe">Quitar de la zona</button>` : `<button class="btn" id="dCo">${ic("grupo", 16)} Compartir con la zona</button>`) : ""}</div>
  ${d.mia && !d.zona && d.pub ? `<p class="small muted mt">Está compartida en el banco de dinámicas de la zona.</p>` : ""}</main>`; };
ENLAZAR.dinamica = () => { const d = dinDe(S.id); if (!d) return; $("#dFv").onclick = () => { const i = D.favs.indexOf(d.id); i >= 0 ? D.favs.splice(i, 1) : D.favs.push(d.id); guardar(); re(); toast(i >= 0 ? "Quitada de favoritas." : "Agregada a favoritas."); };
  $("#dCl").onclick = () => claseDin(d); $("#dEd") && ($("#dEd").onclick = () => formDin(D.mias.find(x => x.id === d.id)));
  $("#dCo") && ($("#dCo").onclick = () => compartirDin(D.mias.find(x => x.id === d.id))); $("#dRe") && ($("#dRe").onclick = () => retirarDin(d.zona ? d : D.mias.find(x => x.id === d.id)));
  $("#dGu") && ($("#dGu").onclick = () => { if (D.mias.some(x => x.de === d.id)) return toast("Ya la tiene en sus dinámicas."); const c = JSON.parse(JSON.stringify(d)); ["zona", "mia", "autor", "escuela", "creado", "pub"].forEach(k => delete c[k]); c.de = d.id; c.id = "mia-" + uid(); c.autor = d.autor; D.mias.push(c); guardar(); re(); toast("Guardada en sus dinámicas."); }); };
function formDin(d) { const n = !d, gs = d ? (d.g[0] > 6 ? [7, 8, 9] : [1, 2, 3, 4, 5, 6]) : esSec(gAct()) ? [7, 8, 9] : [1, 2, 3, 4, 5, 6]; d = d || { id: "mia-" + uid(), n: "", cat: "inicio", campos: [], g: [gs[0], gs[gs.length - 1]], min: 10, esp: "aula", mat: "", prop: "", pasos: [], var: "" };
  dlg(`<h3>${n ? "Agregar mi dinámica" : "Editar mi dinámica"}</h3><label class="campo"><span>Nombre</span><input id="fN" value="${esc(d.n)}"></label>
   <div class="dos"><label class="campo"><span>Tipo</span><select id="fC">${Object.entries(DIN_CATS).map(([k, v]) => `<option value="${k}" ${d.cat === k ? "selected" : ""}>${v[0]}</option>`).join("")}</select></label><label class="campo"><span>Minutos</span><input id="fM" type="number" min="1" value="${d.min}"></label></div>
   <div class="campo"><span>Campos formativos</span><div class="chips">${Object.entries(DIN_CAMPOS).map(([k, t]) => `<button type="button" class="chip" data-fk="${k}" aria-pressed="${d.campos.includes(k)}">${t}</button>`).join("")}</div></div>
   <div class="dos"><label class="campo"><span>Desde</span><select id="fG1">${gs.map(x => `<option value="${x}" ${d.g[0] === x ? "selected" : ""}>${gEsc(x)}</option>`).join("")}</select></label><label class="campo"><span>Hasta</span><select id="fG2">${gs.map(x => `<option value="${x}" ${d.g[1] === x ? "selected" : ""}>${gEsc(x)}</option>`).join("")}</select></label></div>
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
    c.querySelector("#clFin") && (c.querySelector("#clFin").onclick = () => { history.back(); typeof estCerrar === "function" && estCerrar(); alTerminar && alTerminar(); });
    if (p.min) { let s = p.min * 60, corre = false; const t = c.querySelector("#clT"), pin = () => t.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
      c.querySelector("#clP").onclick = e => { corre = !corre; e.currentTarget.innerHTML = ic(corre ? "pausa" : "play", 22); clearInterval(RELOJ); if (corre) RELOJ = setInterval(() => { if (s > 0) { s--; pin(); } if (!s) { clearInterval(RELOJ); t.classList.add("fin"); navigator.vibrate && navigator.vibrate([200, 100, 200]); } }, 1000); };
      c.querySelector("#clR").onclick = () => { s = p.min * 60; t.classList.remove("fin"); pin(); }; } };
  ver(); }
function claseDin(d) { modoClase([{ eb: (DIN_CATS[d.cat] || [""])[0], t: d.n, prop: d.prop, lista: d.pasos, min: d.min }]); }

/* =================================================================== PLANEACIÓN */
/* separa el texto de PDA de un grado en sus PDA individuales (cada uno empieza con un verbo en mayúscula) */
const pdaLista = t => String(t || "").split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÑ¿«“])/).map(x => x.trim()).filter(x => x.length > 8);
const pdaListos = (g, P) => g.grados.every(gr => ((P.pk || {})[gr] || []).length);
const PDA_TXT = (pda, campo, fase) => { const C = (pda && pda.campos) || {}, k = Object.keys(C).find(x => nrm(x) === nrm(campo)); return ((k && C[k]) || {})[fase] || []; };
VISTAS.planes = () => { const g = gAct(), L = D.planes.filter(p => p.gid === (g && g.id)).sort((a, b) => b.ini.localeCompare(a.ini));
  return barra("Planeación · " + esc(grNom(g)), "Mis proyectos", `<button class="btn s p" id="pN">${ic("mas", 16)} Nuevo</button>`) + `<main class="wrap">
  ${typeof avAplica === "function" && avAplica(g) ? `<section class="card mt guia-card"><h3>${ic("camara", 18)} ¿Trabaja con guía de editorial?</h3><p class="small">Tómeles foto a las páginas que va a ver (o a su planeación de editorial). Tlami reconoce los contenidos, le arma la planeación con las actividades de su guía${g.lectura ? " y la <b>contextualiza</b> con su grupo" : ""}, y las páginas quedan guardadas junto a su planeación.</p>
   <div class="fila mt"><label class="btn p" style="cursor:pointer">${ic("camara", 18)} Planear con mi guía<input type="file" id="pGuia" multiple accept="image/*" hidden></label></div>
   <p class="small muted mt">${ic("check", 14)} Lo que hace aquí se queda en su celular. Nadie más lo ve; Tlami solo lee sus fotos para ayudarle y no las guarda en ningún otro lado.</p></section>` : ""}
  <div class="lista mt">${L.map(p => { const hechas = p.sesiones.filter(s => s.hecho).length; return `<button class="it btnit" data-p="${p.id}"><span class="av" style="background:${(DIN_CATS[{ L: "lengua", S: "ciencia", E: "convive", H: "integracion" }[CAMPO_COD[p.campo]]] || ["", "#24427A"])[1]}22">${ic("plan", 18)}</span><span class="tx"><b>${esc(p.titulo)}</b><small>${p.guia ? "Con guía · " : ""}${esc(p.disc || p.campo)} · ${esc(METODOS[p.metodo].n)} · ${p.sesiones.length} sesiones desde ${fCorta(p.ini)}</small><span class="barra-p"><i style="width:${Math.round(100 * hechas / p.sesiones.length)}%"></i></span></span><span class="tag ${hechas === p.sesiones.length ? "" : "g"}">${hechas}/${p.sesiones.length}</span></button>`; }).join("") || `<div class="vacio">Aún no tiene proyectos. Toque «Nuevo» para planear con los contenidos y PDA de su grado.</div>`}</div>${tlmPlanes(g).length ? `<h2 class="sec-t" style="font-size:20px">Hechas en Tlamatini</h2><div class="lista">${tlmPlanes(g).map(h => `<a class="it btnit" style="text-decoration:none;color:inherit" href="../formatos-ppie/planeacion.html#plan=${encodeURIComponent(h.id)}"><span class="av">${ic("plan", 18)}</span><span class="tx"><b>${esc(h.titulo)}</b><small>${esc(h.grados || "")} · ${h.n} sesiones${h.desde ? " desde " + fCorta(h.desde) : ""}</small></span><span class="tag g">Abrir</span></a>`).join("")}</div>` : ""}</main>`; };
ENLAZAR.planes = () => { $("#pN").onclick = () => lecRecordar(gAct(), () => ir("planNueva")); $("#pGuia") && ($("#pGuia").onchange = async e => { const L = [...e.target.files]; e.target.value = ""; if (!L.length) return; const pda = await programa(); if (!pda) return toast("Conéctese a internet una vez para cargar el programa."); lecRecordar(gAct(), () => avSubir(gAct(), pda, L, true)); }); $$("[data-p]").forEach(b => b.onclick = () => ir("plan", { id: b.dataset.p })); };
/* Planeaciones hechas en Tlamatini en este mismo dispositivo, del grado de este grupo */
function tlmPlanes(g) { const H = LS("plan-tlm"); if (!Array.isArray(H) || !g) return []; const gr = (g.grados || []).map(String);
  return H.filter(h => h && h.plan && (!gr.length || (h.plan.grados || []).map(String).some(x => gr.includes(x)))).slice(0, 6); }
/* asistente para planear */
VISTAS.planNueva = () => { const g = gAct(); if (!g) return VISTAS.inicio(); const P = S.P = S.P || { campo: "", sel: {}, metodo: "", escenario: "aula", ejes: [], titulo: "", proposito: "", ini: diasHabiles(hoy(), 1)[0] || hoy(), n: 5, min: 50, producto: "" };
  const fases = [...new Set(g.grados.map(faseDe))];
  return barra("Planeación · " + esc(grNom(g)), "Nuevo proyecto") + `<main class="wrap" id="pnM"><p class="muted mt">Cargando el programa…</p></main>`; };
ENLAZAR.planNueva = async () => { const g = gAct(), P = S.P, m = $("#pnM"); if (!m) return; if (esSec(g) || esPre(g)) return planNuevaSec(g, P, m); const pda = await programa(); await calendario();
  if (!pda) { m.innerHTML = `<div class="vacio mt">No se pudo cargar el Programa Sintético. Conéctese a internet una vez y vuelva a intentarlo.</div>`; return; }
  const fases = [...new Set(g.grados.map(faseDe))].sort();
  const pinta = () => { const met = P.metodo || (P.campo ? Object.keys(METODOS).find(k => METODOS[k].campo === P.campo) : "");
    m.innerHTML = `<section class="card mt"><h3>1. Campo formativo</h3><div class="chips">${CAMPOS.map(c => `<button class="chip" data-cf="${esc(c)}" aria-pressed="${P.campo === c}">${c}</button>`).join("")}</div></section>
    ${P.campo ? fases.map(f => { const L = PDA_TXT(pda, P.campo, f); return `<section class="card mt"><h3>2. Contenido · ${esc(pda.fases[f].nombre)}</h3><p class="small muted mb">Elija el contenido del Programa Sintético. ${g.grados.filter(x => faseDe(x) === f).length > 1 || fases.length > 1 ? "En multigrado, los PDA de cada grado se toman del mismo contenido." : ""}</p>
      <div class="cont-l">${L.map((c, i) => `<label class="cont ${P.sel[f] === i ? "on" : ""}"><input type="radio" name="ct${f}" value="${i}" ${P.sel[f] === i ? "checked" : ""} data-ct="${f}"><span>${esc(c.c)}</span></label>`).join("")}</div>
      ${P.sel[f] != null ? g.grados.filter(x => faseDe(x) === f).map(gr => { const Lp = pdaLista((L[P.sel[f]].pda || {})[gr]), pk = (P.pk = P.pk || {})[gr] || [];
        return `<div class="pdas mt"><p><b>PDA de ${gr}.° · marque el que va a trabajar</b> <small class="muted">(uno o varios)</small></p>${Lp.map((t, i) => `<label class="pda-ck"><input type="checkbox" data-pk="${gr}|${i}" ${pk.includes(i) ? "checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div>`; }).join("") : ""}</section>`; }).join("") : ""}
    ${P.campo && fases.every(f => P.sel[f] != null) && !pdaListos(g, P) ? `<p class="small mt" style="color:var(--maiz-d)">Marque al menos un PDA ${g.grados.length > 1 ? "de cada grado" : ""} para continuar.</p>` : ""}
    ${P.campo && fases.every(f => P.sel[f] != null) && pdaListos(g, P) ? `<section class="card mt"><h3>3. Cómo lo va a trabajar</h3>
      <label class="campo"><span>Metodología</span><select id="pMe">${Object.entries(METODOS).map(([k, v]) => `<option value="${k}" ${met === k ? "selected" : ""}>${v.n}${v.campo === P.campo ? " (sugerida)" : ""}</option>`).join("")}</select></label>
      <div class="campo"><span>Escenario</span><div class="chips">${Object.entries(ESCENARIOS).map(([k, t]) => `<button class="chip" data-es="${k}" aria-pressed="${P.escenario === k}">${t}</button>`).join("")}</div></div>
      <div class="campo"><span>Ejes articuladores</span><div class="chips">${EJES.map(e => `<button class="chip" data-ej="${esc(e)}" aria-pressed="${P.ejes.includes(e)}">${e}</button>`).join("")}</div></div></section>
     <section class="card mt"><h3>4. Su proyecto</h3><label class="campo"><span>Nombre del proyecto</span><input id="pT" value="${esc(P.titulo)}" placeholder="${P.guia ? "Opcional: Tlami le propone uno a partir de su guía" : "Ej. El agua que llega a nuestra comunidad"}"></label>
      <label class="campo"><span>Propósito (opcional)</span><textarea id="pPr" class="area" style="min-height:80px" placeholder="Qué se espera que los alumnos logren">${esc(P.proposito)}</textarea></label>
      <label class="campo"><span>Producto final (opcional)</span><input id="pPd" value="${esc(P.producto)}" placeholder="Ej. Periódico mural, folleto, maqueta, presentación a las familias"></label>
      <div class="tres"><label class="campo"><span>Inicia</span><input type="date" id="pI" value="${P.ini}"></label><label class="campo"><span>Sesiones</span><input type="number" id="pNn" min="1" max="40" value="${P.n}"></label><label class="campo"><span>Minutos por sesión</span><input type="number" id="pMi" min="15" max="240" value="${P.min}"></label></div>
      <p class="small muted">Las fechas se acomodan solas en días de clase, saltando vacaciones, suspensiones y Consejos Técnicos del calendario de Baja California.</p></section>
     ${P.guia && typeof guiaCardHTML === "function" ? guiaCardHTML(P) : ""}${lecCard(g, P)}<div class="fila fin mt"><button class="btn p" id="pOk">${ic("check", 18)} Crear la planeación</button></div>` : ""}`;
    $$("[data-cf]").forEach(b => b.onclick = () => { P.campo = b.dataset.cf; P.sel = {}; P.metodo = ""; pinta(); });
    $$("[data-ct]").forEach(r => r.onchange = () => { P.sel[r.dataset.ct] = +r.value; P.pk = P.pk || {}; g.grados.filter(x => faseDe(x) === +r.dataset.ct).forEach(gr => delete P.pk[gr]); pinta();
      const pd = $$(".pdas")[0]; if (pd) pd.scrollIntoView({ behavior: "smooth", block: "start" }); const s = $$("[data-ct]").find(x => x.checked); });
    $$("[data-pk]").forEach(c => c.onchange = () => { const [gr, i] = c.dataset.pk.split("|").map(Number); P.pk = P.pk || {}; const L = P.pk[gr] = (P.pk[gr] || []).filter(x => x !== i); if (c.checked) L.push(i); L.sort((x, y) => x - y); const y = scrollY; if (pdaListos(g, P) !== !!$("#pT")) { lee(); pinta(); scrollTo(0, y); } });
    $("#pMe") && ($("#pMe").onchange = e => { P.metodo = e.target.value; });
    $$("[data-es]").forEach(b => b.onclick = () => { lee(); P.escenario = b.dataset.es; pinta(); });
    $$("[data-ej]").forEach(b => b.onclick = () => { lee(); const i = P.ejes.indexOf(b.dataset.ej); i >= 0 ? P.ejes.splice(i, 1) : P.ejes.push(b.dataset.ej); pinta(); });
    lecCablear(g, P, () => { lee(); pinta(); });
    $("#pOk") && ($("#pOk").onclick = () => { lee(); if (!P.titulo.trim() && P.guia) P.titulo = "Proyecto de la guía"; if (!P.titulo.trim()) return toast("Escriba el nombre del proyecto."); P.metodo = P.metodo || met; crearYAbrir(g, P, crearPlan(g, P, pda)); }); };
  const lee = () => { if (!$("#pT")) return; P.titulo = val("pT"); P.proposito = val("pPr"); P.producto = val("pPd"); P.ini = val("pI") || P.ini; P.n = Math.max(1, Math.min(40, +val("pNn") || 5)); P.min = Math.max(15, +val("pMi") || 50); if ($("#pMe")) P.metodo = val("pMe"); };
  pinta(); };
const cortaCrit = t => { let x = String(t).split(/[.;:](?:\s|$)/)[0].trim(); if (x.length > 170) x = x.slice(0, x.lastIndexOf(" ", 165)) + "…"; return x; };
/* ---------- lectura de la realidad del grupo (opcional): el docente la sube en PDF, Word o fotos;
   Tlami la lee una vez, guarda una síntesis en el grupo y con ella contextualiza las planeaciones.
   Si no la sube, la planeación se arma igual que siempre. ---------- */
const lecB64 = b => new Promise((ok, no) => { const f = new FileReader(); f.onload = () => ok(String(f.result).split(",")[1] || ""); f.onerror = () => no(new Error("No se pudo leer el archivo.")); f.readAsDataURL(b); });
async function lecFoto(file) { const url = URL.createObjectURL(file);
  try { const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error("No se pudo abrir la foto «" + file.name + "». Pruebe con JPG o PNG.")); i.src = url; });
    const k = Math.min(1, 1900 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .82).split(",")[1]; }
  finally { URL.revokeObjectURL(url); } }
async function lecWord(file) { /* .docx es un zip: se saca el texto de word/document.xml sin librerías */
  const buf = await file.arrayBuffer(), dv = new DataView(buf), td = new TextDecoder(); let e = buf.byteLength - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--; if (e < 0) throw new Error("El archivo de Word «" + file.name + "» está dañado.");
  let p = dv.getUint32(e + 16, true), x = null; const n = dv.getUint16(e + 10, true);
  for (let i = 0; i < n && dv.getUint32(p, true) === 0x02014b50; i++) { const nl = dv.getUint16(p + 28, true), nom = td.decode(new Uint8Array(buf, p + 46, nl));
    if (nom === "word/document.xml") x = { met: dv.getUint16(p + 10, true), cs: dv.getUint32(p + 20, true), lh: dv.getUint32(p + 42, true) }; p += 46 + nl + dv.getUint16(p + 30, true) + dv.getUint16(p + 32, true); }
  if (!x) throw new Error("No se encontró el texto dentro de «" + file.name + "».");
  const ini = x.lh + 30 + dv.getUint16(x.lh + 26, true) + dv.getUint16(x.lh + 28, true), dat = new Uint8Array(buf, ini, x.cs);
  let xml; if (x.met === 0) xml = td.decode(dat); else { if (typeof DecompressionStream === "undefined") throw new Error("Este navegador no puede abrir Word. Guarde el documento como PDF y súbalo así."); xml = td.decode(await new Response(new Blob([dat]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer()); }
  const d = new DOMParser().parseFromString(xml, "application/xml"); return [...d.getElementsByTagName("w:p")].map(q => [...q.getElementsByTagName("w:t")].map(t => t.textContent).join("").trim()).filter(Boolean).join("\n"); }
async function lecLeer(files) { const out = { archivos: [], texto: "", nombres: [] }; let pesa = 0;
  for (const f of [...files].slice(0, 8)) { const n = f.name || "archivo", ext = (n.split(".").pop() || "").toLowerCase();
    if (f.type === "application/pdf" || ext === "pdf") { if (f.size > 12e6) throw new Error("«" + n + "» pesa más de 12 MB. Súbalo en partes o como fotos."); out.archivos.push({ tipo: "application/pdf", data: await lecB64(f) }); }
    else if (ext === "docx") out.texto += (out.texto ? "\n\n" : "") + await lecWord(f);
    else if (ext === "doc" || ext === "odt" || ext === "pages") throw new Error("«" + n + "» no se puede leer. En Word use «Guardar como» → Word (.docx) o PDF.");
    else if (/^image\//.test(f.type) || /^(jpe?g|png|webp|heic|heif)$/.test(ext)) out.archivos.push({ tipo: "image/jpeg", data: await lecFoto(f) });
    else throw new Error("«" + n + "» no es PDF, Word ni foto.");
    out.nombres.push(n); }
  out.archivos.forEach(a => pesa += a.data.length); if (pesa > 18e6) throw new Error("Los archivos pesan mucho. Suba menos páginas o fotos.");
  out.texto = out.texto.slice(0, 60000); return out; }
/* La lectura de la realidad que el docente ya tiene en Tlamatini (subida al planear o publicada por la Supervisión): no se pide dos veces */
function lecTlm(g) { const L = LS("plan-lectura-subida");
  if (Array.isArray(L) && L.length) { const ar = L.filter(a => a.data && a.tipo).map(a => ({ tipo: a.tipo, data: a.data })), tx = L.filter(a => a.texto).map(a => a.texto).join("\n\n").slice(0, 60000);
    if (ar.length || tx.length > 40) return { archivos: ar, texto: tx, nombres: L.map(a => a.nombre || "archivo"), desde: "la que subió al planear en Tlamatini" }; }
  const c = g && g.cct && LS("tqi-" + g.cct), Dq = c && c.d; if (Dq) { const gr = (g.grados || []).map(String);
    const G = (Dq.grupos || []).find(x => gr.includes(String(x.grado)) && (!g.grupo || String(x.grupo || "").toUpperCase() === String(g.grupo).toUpperCase())) || (Dq.grupos || []).find(x => gr.includes(String(x.grado)));
    const txt = v => { const o = []; const w = x => { if (x == null) return; if (typeof x === "string" || typeof x === "number") o.push(String(x)); else if (Array.isArray(x)) x.forEach(w); else if (typeof x === "object") Object.entries(x).forEach(([k, v]) => { if (typeof v === "string" && v.trim()) o.push(k + ": " + v); else w(v); }); }; w(v); return o.join("\n"); };
    const t = G ? txt(G.datos) : Dq.escuelaIns ? txt(Dq.escuelaIns.datos) : ""; if (t.replace(/\s/g, "").length > 60) return { archivos: [], texto: t.slice(0, 60000), nombres: ["Lectura publicada en Tequio"], desde: "la que publicó la Supervisión en Tequio" }; }
  return null; }
async function lecSubir(g, files, listo) { let L;
  try { L = await lecLeer(files); } catch (e) { return tlamiError(e); }
  return lecProcesar(g, L, listo); }
async function lecProcesar(g, L, listo) {
  if (!L.archivos.length && L.texto.replace(/\s/g, "").length < 40) return tlamiError(new Error("El documento no tiene texto que se pueda leer."));
  tlamiEspera("Leyendo la lectura de la realidad de su grupo para tomarla en cuenta al planear.");
  try { const j = await aulaPost("aulaIA", { modo: "lectura", grados: g.grados, nivel: nivelTxt(g), archivos: L.archivos, texto: L.texto }, 180000), r = j.r || {};
    g.lectura = { sint: String(r.sintesis || "").trim(), problemas: r.problemas || [], nombres: L.nombres, fecha: hoy() }; }
  catch (e) { if (L.texto && !L.archivos.length) { g.lectura = { sint: L.texto.slice(0, 3500), problemas: [], nombres: L.nombres, fecha: hoy(), sinIA: true }; toast("Tlami no pudo resumirla ahora (" + esc(e.message) + "). Se guardó el texto del Word tal cual.", 6000); } else { cerrarDlg(); return tlamiError(e); } }
  guardar(); cerrarDlg(); toast("<b>Lectura de la realidad guardada.</b> Sus planeaciones de este grupo se contextualizarán con ella.", 4500); listo && listo(); }
function lecVer(g, listo) { const l = g.lectura || {};
  dlg(`<h3>Lectura de la realidad · ${esc(grNom(g))}</h3><p class="small muted">${l.nombres && l.nombres.length ? "De: " + esc(l.nombres.join(", ")) + " · " : ""}${l.fecha ? fCorta(l.fecha) : ""}. Es la síntesis que Tlami usa para contextualizar; puede corregirla o completarla.</p>
   <textarea id="lecT" class="area mt" style="min-height:260px">${esc(l.sint || "")}</textarea>
   ${(l.problemas || []).length ? `<p class="small mt"><b>Problemáticas que se podrían trabajar:</b></p><ul class="small">${l.problemas.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
   <div class="fila fin mt"><button class="btn" id="lecX">Cerrar</button><button class="btn p" id="lecOk">${ic("check", 16)} Guardar</button></div>`, v => {
    v.querySelector("#lecX").onclick = cerrarDlg;
    v.querySelector("#lecOk").onclick = () => { const t = val("lecT").trim(); if (t.length < 20) return toast("Escriba al menos unas líneas o quite la lectura."); g.lectura.sint = t.slice(0, 5000); guardar(); cerrarDlg(); toast("Lectura de la realidad actualizada."); listo && listo(); }; }); }
function lecCard(g, P) { const l = g.lectura;
  return `<section class="card mt" id="lecC"><h3>Lectura de la realidad de su grupo <span class="tag g" style="font-size:12px;vertical-align:middle">Recomendada</span></h3>
   ${l ? `<p class="small"><b style="color:#1E8E5A">✓ Tiene guardada la lectura de la realidad de ${esc(grNom(g))}</b>${l.fecha ? " (" + fCorta(l.fecha) + ")" : ""}.</p>
     <p class="small muted" style="max-height:4.6em;overflow:hidden">${esc(l.sint).replace(/\n/g, " ")}</p>
     <label class="rev-chk mt"><input type="checkbox" id="lecUsa" ${P.ctx === false ? "" : "checked"}> Contextualizar esta planeación con ella (Tlami ajusta el problema, las actividades y los ejemplos a su grupo y su comunidad)</label>
     <div class="fila mt"><button class="btn s" id="lecV">Ver o corregir</button><label class="btn s" style="cursor:pointer">Reemplazar<input type="file" id="lecF" multiple accept=".pdf,.docx,image/*" hidden></label><button class="btn s r" id="lecQ">Quitar</button></div>`
   : `<p class="small">Súbala en <b>PDF, Word o fotos</b> y Tlami contextualiza la planeación con ella: el problema, las actividades y los ejemplos partirán de lo que usted conoce de su grupo y su comunidad. Se queda guardada en el grupo para las siguientes planeaciones.</p>
     <p class="small muted">Si no la tiene a la mano, puede escribirla aquí en unos minutos. Sin ella la planeación se arma igual, pero menos ligada a su grupo.</p><div class="fila mt"><label class="btn s" style="cursor:pointer">${ic("bajar", 16)} Subir lectura de la realidad<input type="file" id="lecF" multiple accept=".pdf,.docx,image/*" hidden></label><button class="btn s" id="lecE">${ic("lapiz", 16)} Escribirla aquí</button></div>${lecTlm(g) ? `<div class="aviso mt"><span style="flex:1">Ya tiene una lectura de la realidad en Tlamatini (${esc(lecTlm(g).desde)}).</span><button class="btn s p" id="lecTlm">Usar esa</button></div>` : ""}`}</section>`; }
function lecCablear(g, P, repinta) {
  $("#lecE") && ($("#lecE").onclick = () => lecGuiada(g, repinta));
  $("#lecTlm") && ($("#lecTlm").onclick = () => { const L = lecTlm(g); if (L) lecProcesar(g, L, repinta); });
  const f = $("#lecF"); if (f) f.onchange = () => { const L = [...f.files]; f.value = ""; if (L.length) lecSubir(g, L, repinta); };
  $("#lecUsa") && ($("#lecUsa").onchange = e => { P.ctx = e.target.checked; });
  $("#lecV") && ($("#lecV").onclick = () => lecVer(g, repinta));
  $("#lecQ") && ($("#lecQ").onclick = async () => { if (!(await confirmar("Se quitará la lectura de la realidad de este grupo. Sus planeaciones ya hechas no cambian.", "Quitar"))) return; delete g.lectura; guardar(); repinta(); }); }
/* contextualiza una planeación ya creada con la lectura de la realidad del grupo */
async function contextualizar(p, g, silencio) { if (!g.lectura || !g.lectura.sint) return false;
  tlamiEspera("Contextualizando la planeación con la lectura de la realidad de su grupo. Puede tardar hasta un minuto.");
  try { const j = await aulaPost("aulaIA", { modo: "contexto", grados: g.grados, nivel: nivelTxt(g), disciplina: p.disc || "", titulo: p.titulo, campo: p.disc ? p.disc + " (campo formativo " + p.campo + ")" : p.campo, metodo: (METODOS[p.metodo] || {}).n || p.metodo, escenario: ESCENARIOS[p.escenario] || "", min: p.min,
      contenidos: Object.values(p.contenidos || {}).join(" | "), pdas: Object.entries(p.pdas || {}).map(([k, t]) => k + ".°: " + t).join(" | "), proposito: p.proposito, producto: p.producto, contexto: g.lectura.sint,
      sesiones: p.sesiones.map(s => ({ fase: s.fase, des: s.desarrollo })) }, 240000), r = j.r || {};
    if (r.problema) p.contexto = r.problema; if (r.proposito) p.proposito = r.proposito; if (!p.producto && r.producto) p.producto = r.producto;
    (r.sesiones || []).forEach((x, i) => { const s = p.sesiones[i]; if (!s || !x) return; if (x.inicio) s.inicio.txt = x.inicio; if (x.desarrollo) s.desarrollo = x.desarrollo; if (x.cierre) s.cierre.txt = x.cierre; if (x.evaluacion) s.eval = x.evaluacion; s.ia = true; });
    p.ctx = hoy(); guardar(); cerrarDlg(); return true; }
  catch (e) { cerrarDlg(); if (!silencio) tlamiError(e); else toast("<b>La planeación quedó creada sin contextualizar.</b> " + esc(e.message) + " Puede intentarlo después desde la planeación.", 7000); return false; } }
async function crearYAbrir(g, P, p) { D.planes.push(p); guardar(); S.P = null;
  if (P.guia && typeof guiaPlanear === "function") { const r = await guiaPlanear(p, g, P.guia, P.ctx !== false); ir("plan", { id: p.id }, true); if (r) toast("<b>Planeación lista</b>, armada con las páginas de su guía" + (g.lectura && P.ctx !== false ? " y contextualizada con su grupo" : "") + ". Revise y ajuste cada sesión.", 5000); return; }
  const ok = g.lectura && P.ctx !== false ? await contextualizar(p, g, true) : false;
  ir("plan", { id: p.id }, true); toast(ok ? "<b>Planeación creada y contextualizada</b> con la lectura de la realidad de su grupo. Revise y ajuste cada sesión." : "<b>Planeación creada.</b> Revise y ajuste cada sesión.", 4500); }

/* ---------- planeación de secundaria: disciplina → contenido → PDA del grado (Fase 6) ---------- */
async function planNuevaSec(g, P, m) { const pre = esPre(g), fase = pre ? 2 : 6, pda = pre ? await programaPre() : await programaSec(); await calendario();
  if (!pda) { m.innerHTML = `<div class="vacio mt">No se pudo cargar el Programa Sintético de la Fase ${fase}. Conéctese a internet una vez y vuelva a intentarlo.</div>`; return; }
  const discs = (pre ? CAMPOS : g.discs || []).filter(n => pda.disciplinas[n]); if (!P.disc && discs.length === 1) P.disc = discs[0]; P.pk = P.pk || {};
  const pinta = () => { const Dd = P.disc ? pda.disciplinas[P.disc] : null, campo = Dd ? campoKey(Dd.campo) : "", grs = g.grados.filter(x => !Dd || Dd.grados.includes(x));
    const L = Dd ? Dd.contenidos.map((c, i) => ({ c, i })).filter(x => grs.some(gr => (x.c.pda[gr] || []).length)) : [];
    const met = P.metodo || (campo ? Object.keys(METODOS).find(k => METODOS[k].campo === campo) : ""), sel = Dd && P.sel6 != null ? Dd.contenidos[P.sel6] : null;
    const conPda = sel ? grs.filter(gr => (sel.pda[gr] || []).length) : [], listos = sel && conPda.every(gr => (P.pk[gr] || []).length);
    m.innerHTML = `<section class="card mt"><h3>1. ${pre ? "Campo formativo" : "Disciplina"}</h3>${discs.length ? `<div class="chips">${discs.map(n => `<button class="chip" data-dc="${esc(n)}" aria-pressed="${P.disc === n}">${esc(n)}</button>`).join("")}</div>` : `<p class="small">Este grupo no tiene disciplinas registradas. Edítelo en Ajustes → Mis grupos.</p>`}
      ${campo ? `<p class="small muted mt">${pre ? "" : `Campo formativo: <b>${esc(campo)}</b> · `}Fase ${fase} · ${grs.map(x => x + ".°").join(", ")} de ${pre ? "preescolar" : "secundaria"}</p>` : ""}</section>
    ${Dd && !L.length ? `<div class="vacio mt">${esc(P.disc)} no tiene contenidos en ${g.grados.map(x => x + ".°").join(", ")}: en la Fase 6 se imparte en ${Dd.grados.map(x => x + ".°").join(", ")}.</div>` : ""}
    ${L.length ? `<section class="card mt"><h3>2. Contenido · ${esc(P.disc)}</h3><p class="small muted mb">Elija el contenido del Programa Sintético de la Fase ${fase}.</p>
      <div class="cont-l">${L.map(x => `<label class="cont ${P.sel6 === x.i ? "on" : ""}"><input type="radio" name="ct6" value="${x.i}" ${P.sel6 === x.i ? "checked" : ""} data-ct6="1"><span>${esc(x.c.c)}<small class="muted" style="display:block">${grs.filter(gr => (x.c.pda[gr] || []).length).map(gr => x.c.pda[gr].length + " PDA de " + gr + ".°").join(" · ")}</small></span></label>`).join("")}</div></section>` : ""}
    ${sel ? `<section class="card mt"><h3>3. PDA que va a trabajar</h3><p class="small muted mb">Marque los procesos de desarrollo de aprendizaje de este proyecto o secuencia. Con ellos se arma la rúbrica de evaluación.</p>
      ${conPda.map(gr => `${conPda.length > 1 || g.grados.length > 1 ? `<p class="small mt"><b>${gr}.° grado</b></p>` : ""}${sel.pda[gr].map((t, j) => `<label class="rev-chk" style="align-items:flex-start"><input type="checkbox" data-pk="${gr}|${j}" ${(P.pk[gr] || []).includes(j) ? "checked" : ""} style="margin-top:3px"> <span>${esc(t)}</span></label>`).join("")}`).join("")}
      ${conPda.some(gr => sel.pda[gr].length > 1) ? `<div class="fila mt"><button class="btn s" id="pkT">Marcar todos</button></div>` : ""}</section>` : ""}
    ${listos ? `<section class="card mt"><h3>4. Cómo lo va a trabajar</h3>
      <label class="campo"><span>Metodología</span><select id="pMe">${Object.entries(METODOS).map(([k, v]) => `<option value="${k}" ${met === k ? "selected" : ""}>${v.n}${v.campo === campo ? " (sugerida)" : ""}</option>`).join("")}</select></label>
      <div class="campo"><span>Escenario</span><div class="chips">${Object.entries(ESCENARIOS).map(([k, t]) => `<button class="chip" data-es="${k}" aria-pressed="${P.escenario === k}">${t}</button>`).join("")}</div></div>
      <div class="campo"><span>Ejes articuladores</span><div class="chips">${EJES.map(e => `<button class="chip" data-ej="${esc(e)}" aria-pressed="${P.ejes.includes(e)}">${e}</button>`).join("")}</div></div></section>
     <section class="card mt"><h3>5. Su proyecto</h3><label class="campo"><span>Nombre del proyecto o secuencia</span><input id="pT" value="${esc(P.titulo)}" placeholder="Ej. ¿Qué tan limpia está el agua de nuestra comunidad?"></label>
      <label class="campo"><span>Propósito (opcional)</span><textarea id="pPr" class="area" style="min-height:80px" placeholder="Qué se espera que las y los estudiantes logren">${esc(P.proposito)}</textarea></label>
      <label class="campo"><span>Producto final (opcional)</span><input id="pPd" value="${esc(P.producto)}" placeholder="Ej. Infografía, podcast, maqueta, campaña, debate público, informe de laboratorio"></label>
      <div class="tres"><label class="campo"><span>Inicia</span><input type="date" id="pI" value="${P.ini}"></label><label class="campo"><span>Sesiones</span><input type="number" id="pNn" min="1" max="40" value="${P.n}"></label><label class="campo"><span>Minutos por sesión</span><input type="number" id="pMi" min="15" max="240" value="${P.min}"></label></div>
      <p class="small muted">${pre ? "En preescolar cuente como sesión cada situación o actividad del proyecto en el día (de 20 a 60 minutos)." : "En secundaria cuente cada módulo como una sesión (50 minutos, o 100 si es doble)."} Las fechas se acomodan solas en días de clase, saltando vacaciones, suspensiones y Consejos Técnicos del calendario de Baja California.</p></section>
     ${lecCard(g, P)}<div class="fila fin mt"><button class="btn p" id="pOk">${ic("check", 18)} Crear la planeación</button></div>` : ""}`;
    const lee = () => { if (!$("#pT")) return; P.titulo = val("pT"); P.proposito = val("pPr"); P.producto = val("pPd"); P.ini = val("pI") || P.ini; P.n = Math.max(1, Math.min(40, +val("pNn") || 5)); P.min = Math.max(15, +val("pMi") || 50); if ($("#pMe")) P.metodo = val("pMe"); };
    $$("[data-dc]").forEach(b => b.onclick = () => { P.disc = b.dataset.dc; P.sel6 = null; P.pk = {}; P.metodo = ""; pinta(); });
    $$("[data-ct6]").forEach(r => r.onchange = () => { P.sel6 = +r.value; P.pk = {}; const c = Dd.contenidos[P.sel6]; grs.forEach(gr => { const n = (c.pda[gr] || []).length; if (n) P.pk[gr] = n <= 3 ? [...Array(n).keys()] : [0]; }); pinta(); });
    $$("[data-pk]").forEach(c => c.onchange = () => { lee(); const [gr, j] = c.dataset.pk.split("|").map(Number), A = P.pk[gr] = P.pk[gr] || []; const k = A.indexOf(j); if (c.checked && k < 0) A.push(j); if (!c.checked && k >= 0) A.splice(k, 1); A.sort((x, y) => x - y); pinta(); });
    $("#pkT") && ($("#pkT").onclick = () => { lee(); conPda.forEach(gr => P.pk[gr] = [...Array(sel.pda[gr].length).keys()]); pinta(); });
    $("#pMe") && ($("#pMe").onchange = e => { P.metodo = e.target.value; });
    $$("[data-es]").forEach(b => b.onclick = () => { lee(); P.escenario = b.dataset.es; pinta(); });
    $$("[data-ej]").forEach(b => b.onclick = () => { lee(); const i = P.ejes.indexOf(b.dataset.ej); i >= 0 ? P.ejes.splice(i, 1) : P.ejes.push(b.dataset.ej); pinta(); });
    lecCablear(g, P, () => { lee(); pinta(); });
    $("#pOk") && ($("#pOk").onclick = () => { lee(); if (!P.titulo.trim()) return toast("Escriba el nombre del proyecto."); P.metodo = P.metodo || met;
      const pdas = {}, crit = []; g.grados.forEach(gr => { const T = (P.pk[gr] || []).map(j => (sel.pda[gr] || [])[j]).filter(Boolean); if (T.length) { pdas[gr] = T.join(" "); T.forEach(t => crit.push({ gr, c: cortaCrit(t) })); } });
      const p = crearPlan(g, Object.assign({}, P, { campo }), null, { conts: { 6: sel.c }, pdas, crit }); if (pre) p.nivel = "pre"; else { p.nivel = "sec"; p.disc = P.disc; }
      crearYAbrir(g, P, p); }); };
  pinta(); }
function crearPlan(g, P, pda, pre) { const M = METODOS[P.metodo], fases = M.fases, n = P.n, cod = CAMPO_COD[P.campo];
  const conts = {}, pdas = {}, pdasL = {}; if (pre) { Object.assign(conts, pre.conts); Object.assign(pdas, pre.pdas); } else [...new Set(g.grados.map(faseDe))].forEach(f => { const c = PDA_TXT(pda, P.campo, f)[P.sel[f]]; conts[f] = c.c; g.grados.filter(x => faseDe(x) === f).forEach(gr => { const todos = pdaLista((c.pda || {})[gr]), pk = (P.pk || {})[gr]; const L = pk && pk.length ? pk.map(i => todos[i]).filter(Boolean) : todos; pdas[gr] = L.join(" "); (pdasL[gr] = L); }); });
  /* reparte las fases de la metodología entre las sesiones */
  const grupos = []; if (n >= fases.length) { let extra = n - fases.length; fases.forEach((f, i) => { const k = 1 + Math.floor(extra / (fases.length - i)); extra -= k - 1; for (let j = 0; j < k; j++) grupos.push([f]); }); }
  else { const por = fases.length / n; for (let i = 0; i < n; i++) grupos.push(fases.slice(Math.round(i * por), Math.round((i + 1) * por))); }
  const [gmin, gmax] = escala(g), apta = d => d.g[0] <= gmax && d.g[1] >= gmin && d.campos.includes(cod);
  const ini = DINAMICAS.filter(d => ["inicio", "integracion", "pausa"].includes(d.cat) && apta(d)), cie = DINAMICAS.filter(d => d.cat === "cierre" && apta(d));
  const fechas = diasHabiles(P.ini, n);
  const sesiones = grupos.map((fs, i) => ({ n: i + 1, fecha: fechas[i] || "", fase: fs.map(f => f[0]).join(" · "),
    inicio: { din: (ini[i % (ini.length || 1)] || {}).id || "", txt: "" }, desarrollo: fs.map(f => f[1]).join("\n"), cierre: { din: (cie[i % (cie.length || 1)] || {}).id || "", txt: "" }, eval: i === n - 1 ? "Presentación del producto y autoevaluación con la rúbrica." : "Observación y registro en la lista de cotejo.", hecho: false }));
  const corta = cortaCrit, criterios = pre ? pre.crit : Object.entries(pdasL).flatMap(([gr, L]) => (L.length ? L : [pdas[gr]]).map(t => ({ gr: +gr, c: corta(t) })));
  return { id: uid(), gid: g.id, creado: hoy(), titulo: P.titulo.trim(), campo: P.campo, metodo: P.metodo, escenario: P.escenario, ejes: P.ejes.slice(), contenidos: conts, pdas, proposito: P.proposito.trim(), producto: P.producto.trim(), ini: P.ini, min: P.min, sesiones, criterios }; }
VISTAS.plan = () => { const p = plDe(S.id); if (!p) return VISTAS.planes(); const g = grDe(p.gid), ab = S.ab;
  return barra(esc(p.disc || p.campo), esc(p.titulo), `<button class="btn s" id="plI">${ic("impr", 16)} Imprimir</button>`) + `<main class="wrap">
  <section class="card mt"><div class="tags">${p.disc ? `<span class="tag m">${esc(p.campo)}</span> ` : ""}${`<span class="tag a">${esc(METODOS[p.metodo].n)}</span> <span class="tag g">Escenario ${esc(ESCENARIOS[p.escenario])}</span> `}${p.ejes.map(e => `<span class="tag m">${esc(e)}</span>`).join(" ")}</div>
   ${Object.entries(p.contenidos).map(([f, c]) => `<p class="mt"><b>Contenido${Object.keys(p.contenidos).length > 1 ? " (fase " + f + ")" : ""}:</b> ${esc(c)}</p>`).join("")}
   ${Object.entries(p.pdas).map(([gr, t]) => `<p class="small mt"><b>PDA ${gr}.°:</b> ${esc(t)}</p>`).join("")}
   ${p.contexto ? `<p class="mt"><b>Problema del contexto:</b> ${esc(p.contexto)}</p>` : ""}${p.proposito ? `<p class="mt"><b>Propósito:</b> ${esc(p.proposito)}</p>` : ""}${p.producto ? `<p class="mt"><b>Producto:</b> ${esc(p.producto)}</p>` : ""}
   ${p.ctx ? `<p class="small muted mt">${ic("check", 14)} Contextualizada con la lectura de la realidad del grupo (${fCorta(p.ctx)}).</p>` : ""}
   ${p.guia && typeof guiaFotosHTML === "function" ? guiaFotosHTML(p) : ""}
   <div class="fila mt">${g && g.lectura ? `<button class="btn s tlami-b" id="plCtx">${ic("chispa", 16)} ${p.ctx ? "Contextualizar de nuevo" : "Contextualizar con la lectura de la realidad"}</button>` : ""}<button class="btn s" id="plRec">${ic("agenda", 16)} Recorrer fechas</button><button class="btn s r" id="plB">${ic("basura", 16)} Borrar</button></div></section>
  <h2 class="sec-t">Sesiones<small>Toque una para ajustarla. «Dar la clase» la muestra en pantalla completa.</small></h2>
  ${p.sesiones.map((s, i) => { const di = dinDe(s.inicio.din), dc = dinDe(s.cierre.din), abierta = ab === i;
    return `<section class="ses card ${s.hecho ? "hecha" : ""}"><button class="ses-h" data-ab="${i}"><span class="gr">${i + 1}</span><span class="tx"><b>${esc(s.fase)}</b><small>${s.fecha ? fCorta(s.fecha) : "Sin fecha"}${s.hecho ? " · Dada" : ""}</small></span>${ic(abierta ? "atras" : "sig", 16)}</button>
     ${abierta ? `<div class="ses-b"><label class="campo"><span>Fecha</span><input type="date" data-sf="${i}" value="${s.fecha}"></label>
      <div class="campo"><span>Inicio · dinámica</span><select data-sdi="${i}">${dinOpts(s.inicio.din, ["inicio", "integracion", "pausa"])}</select>${di ? `<small>${esc(di.prop)} (${di.min} min)</small>` : ""}</div>
      <label class="campo"><span>Inicio · indicaciones</span><textarea class="area" style="min-height:70px" data-sit="${i}" placeholder="Pregunta detonadora, recuperación de saberes…">${esc(s.inicio.txt)}</textarea></label>
      <label class="campo"><span>Desarrollo</span><textarea class="area" data-sd="${i}">${esc(s.desarrollo)}</textarea></label>
      <div class="campo"><span>Cierre · dinámica</span><select data-sdc="${i}">${dinOpts(s.cierre.din, ["cierre"])}</select>${dc ? `<small>${esc(dc.prop)}</small>` : ""}</div>
      <label class="campo"><span>Cierre · indicaciones</span><textarea class="area" style="min-height:60px" data-sct="${i}" placeholder="Cómo se socializa lo aprendido…">${esc(s.cierre.txt || "")}</textarea></label>
      <label class="campo"><span>Evaluación</span><input data-se="${i}" value="${esc(s.eval)}"></label>
      <button class="btn tlami-b" data-tl="${i}">${ic("chispa", 16)} Pedir a Tlami que la detalle${s.ia ? " de nuevo" : ""}</button>
      <div class="fila"><button class="btn m" data-dar="${i}">${ic("play", 16)} Dar la clase</button><button class="btn p" data-ev="${i}">${ic("eval", 16)} Evaluar${(() => { const n = D.reg.filter(r => r.pid === p.id && r.ses === i).length; return n ? " ✓" : ""; })()}</button><button class="btn" data-hecho="${i}">${ic("check", 16)} ${s.hecho ? "Marcar como pendiente" : "Marcar como dada"}</button></div></div>` : ""}</section>`; }).join("")}
  ${librosPlan(p)}
  <h2 class="sec-t">Evaluación formativa<small>Rúbrica a partir de los PDA</small></h2><section class="card"><div class="tabla-c"><table class="tabla rub"><thead><tr><th>Criterio</th>${NIVELES.map(n => `<th>${n[0]}</th>`).join("")}</tr></thead><tbody>${p.criterios.map(c => `<tr><td><b>${c.gr}.°</b> ${esc(c.c)}</td>${NIVELES.map(n => `<td class="small">${n[1]}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section></main>`; };
const NIVELES = [["Destacado", "Lo logra de forma autónoma y lo explica o aplica en otras situaciones."], ["Logrado", "Lo logra de forma autónoma."], ["En proceso", "Lo logra con apoyo del docente o de sus compañeros."], ["Requiere apoyo", "Aún no lo logra; necesita acompañamiento cercano."]];
function dinOpts(sel, cats) { const g = gAct(), [gmin, gmax] = g ? escala(g) : [1, 6];
  return `<option value="">— Ninguna —</option>` + todasDin().filter(d => cats.includes(d.cat) && d.g[0] <= gmax && d.g[1] >= gmin).map(d => `<option value="${esc(d.id)}" ${d.id === sel ? "selected" : ""}>${esc(d.n)} · ${d.min} min</option>`).join(""); }
ENLAZAR.plan = () => { const p = plDe(S.id); if (!p) return; if (p.guia && typeof guiaFotosCargar === "function") guiaFotosCargar(p); const s = i => p.sesiones[+i];
  $$("[data-ab]").forEach(b => b.onclick = () => { S.ab = S.ab === +b.dataset.ab ? null : +b.dataset.ab; re(); });
  $$("[data-sf]").forEach(x => x.onchange = () => { s(x.dataset.sf).fecha = x.value; guardar(); });
  $$("[data-sdi]").forEach(x => x.onchange = () => { s(x.dataset.sdi).inicio.din = x.value; guardar(); re(); }); $$("[data-sdc]").forEach(x => x.onchange = () => { s(x.dataset.sdc).cierre.din = x.value; guardar(); re(); });
  $$("[data-sit]").forEach(x => x.onchange = () => { s(x.dataset.sit).inicio.txt = x.value; guardar(); }); $$("[data-sd]").forEach(x => x.onchange = () => { s(x.dataset.sd).desarrollo = x.value; guardar(); });
  $$("[data-se]").forEach(x => x.onchange = () => { s(x.dataset.se).eval = x.value; guardar(); });
  $$("[data-sct]").forEach(x => x.onchange = () => { s(x.dataset.sct).cierre.txt = x.value; guardar(); }); $$("[data-tl]").forEach(b => b.onclick = () => tlamiSesion(p, +b.dataset.tl));
  $$("[data-hecho]").forEach(b => b.onclick = () => { const x = s(b.dataset.hecho); x.hecho = !x.hecho; guardar(); re(); });
  $$("[data-dar]").forEach(b => b.onclick = () => abrirClase(p.id, +b.dataset.dar));
  $$("[data-ev]").forEach(b => b.onclick = () => ir("evaluar", { pid: p.id, i: +b.dataset.ev }));
  $("#plCtx") && ($("#plCtx").onclick = async () => { const gg = grDe(p.gid); if (p.sesiones.some(x => x.ia || x.inicio.txt) && !(await confirmar("Tlami reescribirá el inicio, el desarrollo, el cierre y la evaluación de las sesiones con la lectura de la realidad del grupo. Lo que usted escribió en ellas se reemplaza.", "Contextualizar"))) return;
    if (await contextualizar(p, gg)) { re(); toast("<b>Listo.</b> La planeación quedó contextualizada. Revise cada sesión."); } });
  $("#plB").onclick = async () => { if (!(await confirmar("Se borrará esta planeación.", "Borrar"))) return; D.planes = D.planes.filter(x => x !== p); guardar(); volver(); };
  $("#plRec").onclick = () => dlg(`<h3>Recorrer fechas</h3><p class="small muted mb">Si un día no hubo clase, las sesiones pendientes se acomodan de nuevo en días de clase desde la fecha que elija.</p><label class="campo"><span>Desde</span><input type="date" id="rD" value="${hoy()}"></label><div class="fila fin"><button class="btn" id="rX">Cancelar</button><button class="btn p" id="rOk">Recorrer</button></div>`, v => {
    v.querySelector("#rX").onclick = cerrarDlg; v.querySelector("#rOk").onclick = async () => { await calendario(); const pend = p.sesiones.filter(x => !x.hecho), f = diasHabiles(val("rD") || hoy(), pend.length); pend.forEach((x, i) => x.fecha = f[i] || ""); guardar(); cerrarDlg(); re(); toast("Fechas recorridas."); }; });
  $("#plI").onclick = () => imprimir(docPlan(p), true); };
function abrirClase(pid, i) { const p = plDe(pid), s = p.sesiones[i], di = dinDe(s.inicio.din), dc = dinDe(s.cierre.din), pasos = [];
  pasos.push({ eb: `${p.titulo} · sesión ${i + 1}`, t: s.fase, txt: Object.values(p.pdas).filter(Boolean).length ? "Hoy vamos a aprender: " + (p.criterios[0] || {}).c : "" });
  if (di) pasos.push({ eb: "Inicio · " + (DIN_CATS[di.cat] || [""])[0], t: di.n, prop: di.prop, lista: di.pasos, min: di.min });
  if (s.inicio.txt) pasos.push({ eb: "Inicio", t: "Para empezar", txt: s.inicio.txt });
  pasos.push({ eb: "Desarrollo", t: s.fase, txt: s.desarrollo, min: Math.max(5, p.min - (di ? di.min : 0) - (dc ? dc.min : 0)) });
  if (dc) pasos.push({ eb: "Cierre", t: dc.n, prop: dc.prop, lista: dc.pasos, min: dc.min });
  if (s.cierre.txt) pasos.push({ eb: "Cierre", t: "Para terminar", txt: s.cierre.txt });
  modoClase(pasos, () => { s.hecho = true; guardar(); setTimeout(() => dlg(`<h3>Sesión terminada</h3><p class="mb">Quedó marcada como dada. ¿Quiere registrar ahora la evaluación formativa de sus alumnos?</p><div class="fila fin"><button class="btn" id="eNo">Después</button><button class="btn p" id="eSi">${ic("eval", 16)} Evaluar ahora</button></div>`, v => {
    v.querySelector("#eNo").onclick = () => { cerrarDlg(); if (S.v === "plan" || S.v === "inicio") re(); }; v.querySelector("#eSi").onclick = () => { cerrarDlg(); ir("evaluar", { pid, i }); }; }), 250); }); }

/* ---------- documentos ---------- */
const dirTxt = g => g && g.dir ? (/directora|encargada/i.test(g.cargoDir || "") ? "Mtra. " : "Mtro. ") + g.dir : "";
function encabezado(g, tit) { return `<table class="enc"><tr><td style="width:90px"><img src="${ISEP}" alt="ISEP"></td><td class="t"><b>${esc(g ? g.escuela : "")}</b><br><span>${g && g.cct ? "C.C.T. " + esc(g.cct) : ""}${g && g.turno ? " · Turno " + esc(g.turno) : ""}${g && g.loc ? " · " + esc(g.loc) : ""}</span><br><b class="tt">${tit}</b></td><td style="width:90px;text-align:right">${g && g.cct ? `<img src="${ESC_IMG}${esc(g.cct)}.jpg" onerror="if(!this.dataset.p){this.dataset.p=1;this.src='${ESC_IMG}${esc(g.cct)}.png'}else{this.remove()}" alt="">` : ""}</td></tr></table>`; }
function docPlan(p) { const g = grDe(p.gid);
  return `<div class="doc">${encabezado(g, "Planeación didáctica · " + esc(p.disc ? p.disc + " · " + p.campo : p.campo))}
  <div class="datos"><span><b>Proyecto:</b> ${esc(p.titulo)}</span><span><b>Grupo:</b> ${esc(grNom(g))}</span><span><b>Periodo:</b> ${fCorta(p.sesiones[0].fecha)} al ${fCorta(p.sesiones[p.sesiones.length - 1].fecha)}</span>
   <span><b>Metodología:</b> ${esc(METODOS[p.metodo].n)}</span><span><b>Escenario:</b> ${esc(ESCENARIOS[p.escenario])}</span><span><b>Sesiones:</b> ${p.sesiones.length} de ${p.min} min</span></div>
  <table><tbody>${Object.entries(p.contenidos).map(([f, c]) => `<tr><th style="width:20%">Contenido${Object.keys(p.contenidos).length > 1 ? " · fase " + f : ""}</th><td>${esc(c)}</td></tr>`).join("")}
   ${Object.entries(p.pdas).map(([gr, t]) => `<tr><th>PDA ${gr}.°</th><td>${esc(t)}</td></tr>`).join("")}
   ${p.ejes.length ? `<tr><th>Ejes articuladores</th><td>${esc(p.ejes.join(", "))}</td></tr>` : ""}${p.contexto ? `<tr><th>Problema del contexto</th><td>${esc(p.contexto)}</td></tr>` : ""}${p.proposito ? `<tr><th>Propósito</th><td>${esc(p.proposito)}</td></tr>` : ""}${p.producto ? `<tr><th>Producto</th><td>${esc(p.producto)}</td></tr>` : ""}</tbody></table>
  <h2>Secuencia didáctica</h2><table><thead><tr><th class="c">No.</th><th>Fecha</th><th>Momento</th><th>Inicio</th><th>Desarrollo</th><th>Cierre</th><th>Evaluación</th></tr></thead><tbody>
  ${p.sesiones.map((s, i) => { const di = dinDe(s.inicio.din), dc = dinDe(s.cierre.din); return `<tr><td class="c">${i + 1}</td><td>${fCorta(s.fecha)}</td><td><b>${esc(s.fase)}</b></td><td>${di ? `<b>${esc(di.n)}</b>. ${esc(di.prop)}` : ""}${s.inicio.txt ? "<br>" + esc(s.inicio.txt) : ""}</td><td>${esc(s.desarrollo).replace(/\n/g, "<br>")}</td><td>${dc ? `<b>${esc(dc.n)}</b>. ${esc(dc.prop)}` : ""}${s.cierre.txt ? (dc ? "<br>" : "") + esc(s.cierre.txt) : ""}</td><td>${esc(s.eval)}</td></tr>`; }).join("")}</tbody></table>
  <h2>Rúbrica</h2><table><thead><tr><th>Criterio</th>${NIVELES.map(n => `<th>${n[0]}</th>`).join("")}</tr></thead><tbody>${p.criterios.map(c => `<tr><td><b>${c.gr}.°</b> ${esc(c.c)}</td>${NIVELES.map(n => `<td>${n[1]}</td>`).join("")}</tr>`).join("")}</tbody></table>
  <table class="firmas"><tr><td>${esc(yo().nombre)}<br>Docente del grupo</td><td>${esc(dirTxt(g))}<br>Dirección de la escuela · Vo. Bo.</td></tr></table></div>`; }
function imprimir(html, horizontal) { $("#imprimir").innerHTML = (horizontal ? "<style>@page{size:letter landscape;margin:9mm}</style>" : "") + html; const imgs = [...$("#imprimir").querySelectorAll("img")]; Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 2500); }))).then(() => setTimeout(() => window.print(), 120)); }

/* =================================================================== EVALUACIÓN FORMATIVA (etapa 2) */
const NIV4 = [[4, "Destacado", "D", "#1E8E5A"], [3, "Logrado", "L", "#5FA36B"], [2, "En proceso", "P", "#C98A0B"], [1, "Requiere apoyo", "R", "#C2362B"]];
const NIV3 = [[3, "Lo logra", "Sí", "#1E8E5A"], [2, "En ocasiones", "A veces", "#C98A0B"], [1, "Todavía no", "No", "#C2362B"]];
const nivsDe = g => esPre(g) ? NIV3 : NIV4;
const nivDe = n => NIV4.find(x => x[0] === n) || [0, "", "", "#999"];
const presentes = (g, k) => { const r = ((D.asis[g.id] || {})[k]) || {}; return activos(g).filter(a => r[a.id] === "P" || r[a.id] === "R"); };
const critsDe = (p, a) => p.criterios.map((c, i) => Object.assign({ i }, c)).filter(c => !a || !a.g || c.gr === a.g || !p.criterios.some(x => x.gr === a.g));
VISTAS.evaluar = () => { const p = plDe(S.pid); if (!p) return VISTAS.planes(); const g = grDe(p.gid), s = p.sesiones[S.i], k = s.fecha || hoy();
  const pres = presentes(g, k), todos = S.todos || !pres.length, L = todos ? activos(g) : pres;
  const r = D.reg.find(x => x.pid === p.id && x.ses === S.i) || { al: {}, obs: {} };
  return barra(`Evaluar · sesión ${S.i + 1}`, esc(p.titulo)) + `<main class="wrap">
  <p class="small muted mt">${fCorta(k)} · ${esc(s.fase)} · ${pres.length ? `${pres.length} presentes según su lista` : "No hay pase de lista de ese día: se muestran todos"}</p>
  ${pres.length ? `<div class="fila mt"><button class="chip" id="evTod" aria-pressed="${!!S.todos}">Mostrar también a los ausentes</button></div>` : ""}
  <section class="card mt"><p class="small"><b>Toque el nivel de cada alumno</b> en el criterio de su grado. Deje en blanco a quien no observó hoy.</p><div class="tags mt">${nivsDe(g).map(n => `<span class="tag" style="background:${n[3]}22;color:${n[3]}">${n[2]} = ${n[1]}</span>`).join(" ")}</div></section>
  <div class="lista mt">${L.map(a => { const cs = critsDe(p, a), nf = D.fotos.filter(f => f.al === a.id && f.pid === p.id && f.ses === S.i).length; return `<div class="ev-al card"><div class="fila" style="justify-content:space-between;gap:8px;flex-wrap:nowrap"><b>${esc(a.nombre)}${g.grados.length > 1 && a.g ? ` <small class="muted">${a.g}.°</small>` : ""}</b>
      <span class="fila" style="gap:6px;flex-wrap:nowrap"><button class="btn s" data-evf="${a.id}" title="Foto de evidencia">${ic("camara", 16)}${nf ? " " + nf : ""}</button><button class="btn s" data-evo="${a.id}" title="Observación">${ic("lapiz", 16)}</button></span></div>
     ${cs.map(c => { const v = ((r.al || {})[a.id] || {})[c.i]; return `<p class="small mt" style="color:var(--gris)">${esc(c.c)}</p><div class="niv">${nivsDe(g).map(n => `<button data-ev-al="${a.id}" data-ev-c="${c.i}" data-ev-n="${n[0]}" aria-pressed="${v === n[0]}" style="--c:${n[3]}" title="${n[1]}">${n[2]}<small>${n[1]}</small></button>`).join("")}</div>`; }).join("")}
     ${(r.obs || {})[a.id] ? `<p class="small mt com-t">${esc(r.obs[a.id])}</p>` : ""}</div>`; }).join("") || `<div class="vacio">Primero agregue a sus alumnos.</div>`}</div>
  <div class="fila fin mt2"><button class="btn o" id="evOk">${ic("check", 18)} Listo</button></div>
  <input type="file" id="evCam" accept="image/*" capture="environment" hidden></main>`; };
ENLAZAR.evaluar = () => { const p = plDe(S.pid); if (!p) return; const g = grDe(p.gid), s = p.sesiones[S.i];
  const reg = () => { let r = D.reg.find(x => x.pid === p.id && x.ses === S.i); if (!r) { r = { id: uid(), pid: p.id, gid: g.id, ses: S.i, fecha: s.fecha || hoy(), campo: p.disc || p.campo, al: {}, obs: {} }; D.reg.push(r); } return r; };
  $("#evTod") && ($("#evTod").onclick = () => { S.todos = !S.todos; re(); });
  $$("[data-ev-al]").forEach(b => b.onclick = () => { const r = reg(), a = b.dataset.evAl, c = b.dataset.evC, n = +b.dataset.evN; r.al[a] = r.al[a] || {};
    if (r.al[a][c] === n) delete r.al[a][c]; else r.al[a][c] = n; r.fecha = s.fecha || hoy(); guardar(); re(); });
  $$("[data-evo]").forEach(b => b.onclick = () => { const r = reg(), a = activos(g).find(x => x.id === b.dataset.evo);
    dlg(`<h3>Observación</h3><p class="small muted mb">${esc(a.nombre)} · lo que observó hoy (se toma en cuenta en su valoración del trimestre).</p><textarea id="oT" class="area">${esc((r.obs || {})[a.id] || "")}</textarea><div class="fila fin mt"><button class="btn" id="oX">Cancelar</button><button class="btn p" id="oOk">Guardar</button></div>`, v => {
      v.querySelector("#oX").onclick = cerrarDlg; v.querySelector("#oOk").onclick = () => { const t = val("oT").trim(); r.obs = r.obs || {}; if (t) r.obs[a.id] = t; else delete r.obs[a.id]; guardar(); re(); }; }); });
  let quien = null; $$("[data-evf]").forEach(b => b.onclick = () => { quien = b.dataset.evf; $("#evCam").click(); });
  $("#evCam").onchange = async e => { const f = e.target.files[0]; e.target.value = ""; if (!f || !quien) return; await nuevaFoto(f, { al: quien, pid: p.id, ses: S.i, campo: p.disc || p.campo, t: s.fase }); re(); };
  $("#evOk").onclick = () => { volver(); toast("Evaluación guardada."); }; };

/* ---------- portafolio: fotos en IndexedDB ---------- */
function idb() { return idb.p || (idb.p = new Promise((ok, no) => { const r = indexedDB.open((APP_PRE ? "aula-pre" : APP_ESP ? "aula-esp" : "aula") + (CAP ? "-cap" : DEMO ? "-demo" : ""), 1); r.onupgradeneeded = () => r.result.createObjectStore("f"); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); })); }
async function idbOp(modo, fn) { const db = await idb(); return new Promise((ok, no) => { const t = db.transaction("f", modo), q = fn(t.objectStore("f")); t.oncomplete = () => ok(q && q.result); t.onerror = () => no(t.error); }); }
const FOTO = {}; const fotoGet = async id => FOTO[id] || (FOTO[id] = await idbOp("readonly", s => s.get(id)).catch(() => null));
function comprimir(file, max = 1280, q = .72) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", q)); }; im.onerror = no; im.src = r.result; }; r.onerror = no; r.readAsDataURL(file); }); }
async function nuevaFoto(file, meta) { try { const u = await comprimir(file), id = uid(); FOTO[id] = u; await idbOp("readwrite", s => s.put(u, id)); const f = Object.assign({ id, fecha: hoy(), t: "", bol: true }, meta); D.fotos.push(f); guardar(); toast("Evidencia guardada en su portafolio."); return f; } catch (e) { toast("No se pudo guardar la foto."); } }
async function pintarFotos(sel, L) { const box = $(sel); if (!box) return; box.innerHTML = L.map(f => `<button class="foto" data-fo="${f.id}"><img alt="" data-src="${f.id}"><span>${esc(f.t || "Evidencia")}<small>${fCorta(f.fecha)}${f.bol ? " · en informe" : ""}</small></span></button>`).join("") || `<p class="small muted">Sin evidencias todavía.</p>`;
  box.querySelectorAll("[data-fo]").forEach(b => b.onclick = () => verFoto(b.dataset.fo)); for (const i of box.querySelectorAll("img[data-src]")) i.src = await fotoGet(i.dataset.src) || ""; }
function verFoto(id) { const f = D.fotos.find(x => x.id === id); if (!f) return;
  dlg(`<h3>Evidencia</h3><img id="vfI" alt="" style="width:100%;max-height:52vh;object-fit:contain;border-radius:12px;background:#111"><label class="campo mt"><span>Descripción</span><input id="vfT" value="${esc(f.t)}"></label><label class="rev-chk"><input type="checkbox" id="vfB" ${f.bol ? "checked" : ""}> Incluir en su informe del trimestre</label>
   <div class="fila fin mt"><button class="btn r" id="vfX" style="margin-right:auto">${ic("basura", 16)}</button><button class="btn p" id="vfOk">Listo</button></div>`, async v => { v.querySelector("#vfI").src = await fotoGet(id) || "";
    v.querySelector("#vfOk").onclick = () => { f.t = val("vfT").trim(); f.bol = v.querySelector("#vfB").checked; guardar(); re(); };
    v.querySelector("#vfX").onclick = async () => { if (!(await confirmar("Se quitará esta evidencia del portafolio.", "Quitar"))) return; D.fotos = D.fotos.filter(x => x !== f); delete FOTO[id]; idbOp("readwrite", s => s.delete(id)).catch(() => {}); guardar(); re(); }; }); }

/* ---------- ficha del alumno: avance, asistencia y portafolio ---------- */
VISTAS.alumno = () => { const g = grDe(S.gid), a = g && g.alumnos.find(x => x.id === S.id); if (!a) return VISTAS.grupo(); const T = trimActual(), R = resumenAlumno(g, a, T);
  return barra(esc(grNom(g)), esc(a.nombre), `<button class="btn s" id="alEd">${ic("lapiz", 16)} Editar</button>`) + `<main class="wrap">
  <p class="small muted mt">${esc(T.n)} · ${fCorta(T.ini)} al ${fCorta(T.fin)}${a.nee ? " · Ajustes: " + esc(a.nee) : ""}</p>
  <div class="kpis mt"><div class="kpi"><b>${R.asisP == null ? "—" : Math.round(R.asisP * 100) + "%"}</b><span>Asistencia</span></div><div class="kpi"><b>${R.falt}</b><span>Faltas</span></div><div class="kpi"><b>${R.nreg}</b><span>Registros</span></div><div class="kpi"><b>${D.fotos.filter(f => f.al === a.id).length}</b><span>Evidencias</span></div></div>
  ${esPre(g) && typeof preFicha === "function" ? preFicha(g, a) : `<h2 class="sec-t">Por ${areaTxt(g)}</h2><div class="lista">${areasDe(g).map(c => { const x = R.campos[c]; return `<div class="it"><span class="tx"><b>${esc(c)}</b><small>${x && x.n ? `${x.n} registros · ${nivDe(Math.round(x.prom))[1]}` : "Sin registros en el trimestre"}</small></span><span class="cal-b">${x && x.cal != null ? x.cal : "—"}</span></div>`; }).join("")}</div>`}
  ${typeof expTarjeta === "function" ? expTarjeta(g, a) : ""}
  <h2 class="sec-t">Ajustes razonables</h2><section class="card">${(a.ajustes || []).slice(-2).reverse().map(x => `<p class="small"><b>${fCorta(x.f)}</b> · ${esc(x.bar)}</p><ul class="tlami-l small">${x.l.map(t => `<li>${esc(t)}</li>`).join("")}</ul>${x.fam ? `<p class="small"><b>Con la familia:</b> ${esc(x.fam)}</p>` : ""}`).join("") || `<p class="small muted">Si a este alumno algo le cuesta, Tlami le sugiere apoyos concretos.</p>`}<button class="btn s tlami-b mt" id="alTl">${ic("chispa", 16)} Pedir ajustes a Tlami</button></section>
  ${R.obs.length ? `<h2 class="sec-t">Observaciones</h2><section class="card">${R.obs.map(o => `<p class="small"><b>${fCorta(o.f)}:</b> ${esc(o.t)}</p>`).join("")}</section>` : ""}
  <div class="fila mt2" style="justify-content:space-between"><h2 class="sec-t" style="margin:0">Portafolio</h2><button class="btn s p" id="alF">${ic("camara", 16)} Agregar evidencia</button></div><div class="fotos mt" id="alFotos"></div>
  <input type="file" id="alCam" accept="image/*" capture="environment" hidden></main>`; };
ENLAZAR.alumno = () => { const g = grDe(S.gid), a = g && g.alumnos.find(x => x.id === S.id); if (!a) return;
  typeof expEnlazar === "function" && expEnlazar(g, a);
  $("#alEd").onclick = () => formAlumno(g, a); $("#alTl").onclick = () => tlamiAjustes(g, a); $("#alF").onclick = () => $("#alCam").click();
  $("#alCam").onchange = async e => { const f = e.target.files[0]; e.target.value = ""; if (f) { await nuevaFoto(f, { al: a.id, t: "" }); re(); } };
  pintarFotos("#alFotos", D.fotos.filter(f => f.al === a.id).sort((x, y) => y.fecha.localeCompare(x.fecha))); };

/* ---------- trimestres, calificación y valoración ---------- */
const TRIMS = () => D.cfg.trims || [{ id: "t1", n: "Primer trimestre", ini: "2026-08-31", fin: "2026-11-27" }, { id: "t2", n: "Segundo trimestre", ini: "2026-11-30", fin: "2027-03-12" }, { id: "t3", n: "Tercer trimestre", ini: "2027-03-15", fin: "2027-07-06" }];
const trimActual = () => { const k = hoy(), L = TRIMS(); return L.find(t => t.id === S.trim) || L.find(t => k >= t.ini && k <= t.fin) || L.filter(t => t.ini <= k).slice(-1)[0] || L[0]; };
const calDe = prom => prom == null ? null : Math.max(5, Math.min(10, Math.round(5 + (prom - 1) * 5 / 3)));
const campoKey = c => CAMPOS.find(x => nrm(x) === nrm(c)) || (DISC_SEC.find(x => nrm(x[0]) === nrm(c)) || [c])[0];
function resumenAlumno(g, a, T) { const regs = D.reg.filter(r => r.gid === g.id && r.fecha >= T.ini && r.fecha <= T.fin), campos = {}, obs = []; let nreg = 0;
  regs.forEach(r => { const p = plDe(r.pid), v = (r.al || {})[a.id] || {}, ck = campoKey(r.campo); Object.entries(v).forEach(([ci, n]) => { const c = campos[ck] = campos[ck] || { s: 0, n: 0, crit: {}, serie: [] }; c.s += n; c.n++; nreg++; c.serie.push([r.fecha, n]);
      const ct = p && p.criterios[ci] ? p.criterios[ci].c : ""; if (ct) { const x = c.crit[ct] = c.crit[ct] || { s: 0, n: 0 }; x.s += n; x.n++; } });
    if ((r.obs || {})[a.id]) obs.push({ f: r.fecha, t: r.obs[a.id], campo: ck }); });
  Object.values(campos).forEach(c => { c.prom = c.s / c.n; c.cal = calDe(c.prom); c.serie.sort((x, y) => x[0].localeCompare(y[0])); });
  const A = D.asis[g.id] || {}; let as = 0, tot = 0, falt = 0; Object.keys(A).filter(k => k >= T.ini && k <= T.fin).forEach(k => { const v = marcaDe(A[k], a.id); if (!v) return; tot++; if (v === "P" || v === "R") as++; if (v === "F") falt++; });
  return { campos, obs: obs.sort((x, y) => x.f.localeCompare(y.f)), nreg, asisP: tot ? as / tot : null, falt }; }
const minus = t => t ? t[0].toLowerCase() + t.slice(1) : t;
function valoracion(a, campo, c, obs) { if (!c || !c.n) return "";
  const nom = String(a.nombre || "").split(" ")[0], niv = Math.max(1, Math.min(4, Math.round(c.prom))), F = { 4: "muestra un desempeño destacado", 3: "logra los aprendizajes esperados", 2: "está en proceso de lograr los aprendizajes", 1: "requiere apoyo cercano para lograr los aprendizajes" };
  const cr = Object.entries(c.crit).map(([k, v]) => [k, v.s / v.n]), fu = cr.filter(x => x[1] >= 3).sort((x, y) => y[1] - x[1]).slice(0, 1), de = cr.filter(x => x[1] < 2.5).sort((x, y) => x[1] - y[1]).slice(0, 1);
  let t = `En ${campo}, ${nom} ${F[niv]}.`; if (fu.length) t += ` Logra con seguridad: ${minus(fu[0][0])}.`; if (de.length) t += ` Necesita fortalecer: ${minus(de[0][0])}.`;
  const s = c.serie; if (s.length >= 4) { const m = Math.floor(s.length / 2), a1 = s.slice(0, m).reduce((x, y) => x + y[1], 0) / m, a2 = s.slice(m).reduce((x, y) => x + y[1], 0) / (s.length - m); if (a2 - a1 >= .5) t += " Mostró una mejora clara durante el trimestre."; else if (a1 - a2 >= .5) t += " Su desempeño bajó en las últimas sesiones; conviene darle seguimiento."; }
  const o = (obs || []).filter(x => x.campo === campo).slice(-1)[0]; if (o) t += " " + o.t.replace(/\s+/g, " ").replace(/([^.])$/, "$1.");
  return t; }
function filasBoleta(g, T) { const B = (D.bol[g.id] || {})[T.id] || {};
  return activos(g).map(a => { const R = resumenAlumno(g, a, T), o = B[a.id] || {}; const cal = {}, val = {};
    areasDe(g).forEach(c => { cal[c] = o.cal && o.cal[c] != null ? o.cal[c] : (typeof mezclaEx === "function" ? mezclaEx(g, a, c, T, R.campos[c] ? R.campos[c].cal : null) : (R.campos[c] ? R.campos[c].cal : null)); val[c] = o.val && o.val[c] != null ? o.val[c] : valoracion(a, c, R.campos[c], R.obs); });
    const cs = Object.values(cal).filter(x => x != null), prom = cs.length ? cs.reduce((x, y) => x + y, 0) / cs.length : null;
    return { a, R, cal, val, prom, gen: o.gen || "", edit: o }; }); }
const colCal = v => v == null ? "#999" : v >= 9 ? "#1E8E5A" : v >= 7 ? "#A87200" : "#C2362B";
VISTAS.evaluacion = () => { const g = gAct(); if (!g) return VISTAS.inicio(); if (esPre(g) && VISTAS.evalpre) { S.v = "evalpre"; return VISTAS.evalpre(); } const T = trimActual(), F = filasBoleta(g, T), f = F.find(x => x.a.id === S.al);
  return barra("Evaluación · " + esc(grNom(g)), esc(T.n), `<button class="btn s" id="bvI">${ic("impr", 16)} Imprimir</button>`) + `<main class="wrap">
  <div class="chips mt">${TRIMS().map(t => `<button class="chip" data-tr="${t.id}" aria-pressed="${t.id === T.id}">${esc(t.n)}</button>`).join("")}</div>
  <p class="small muted mt">${fCorta(T.ini)} al ${fCorta(T.fin)}. La calificación (5 a 10) sale del promedio de los niveles que registró en cada ${areaTxt(g)}; la valoración, de los criterios y sus observaciones. Puede ajustar ambas.</p>
  ${!f ? `<div class="tabla-c mt"><table class="tabla"><thead><tr><th>Alumno(a)</th>${areasDe(g).map(c => `<th class="c" title="${esc(c)}">${esc(abrArea(c))}</th>`).join("")}<th class="c">Prom.</th><th class="c">Faltas</th></tr></thead><tbody>
    ${F.map(x => `<tr class="clic" data-bal="${x.a.id}"><td><b>${esc(x.a.nombre)}</b>${Object.keys(x.edit.cal || {}).length || Object.keys(x.edit.val || {}).length ? ' <small class="muted">· ajustada</small>' : ""}</td>${areasDe(g).map(c => `<td class="c"><b style="color:${colCal(x.cal[c])}">${x.cal[c] ?? "—"}</b></td>`).join("")}<td class="c">${x.prom == null ? "—" : x.prom.toFixed(1)}</td><td class="c">${x.R.falt}</td></tr>`).join("")}</tbody></table></div>
    <p class="small muted mt">Toque un alumno para ver y ajustar su valoración. «Imprimir» le da el concentrado del grupo y el informe de cada alumno para las familias.</p>`
  : `<button class="btn s mt" id="bvV">${ic("atras", 16)} Todo el grupo</button>
    <section class="card mt"><h3>${esc(f.a.nombre)}</h3><p class="small muted">${f.R.nreg} registros · ${f.R.falt} faltas${f.R.asisP != null ? " · asistencia " + Math.round(f.R.asisP * 100) + "%" : ""}</p>
    ${areasDe(g).map(c => `<div class="bcampo"><div class="fila" style="justify-content:space-between;flex-wrap:nowrap"><b>${esc(c)}</b><span class="fila" style="gap:6px;flex-wrap:nowrap"><button class="btn s" data-bm="${esc(c)}" data-d="-1">−</button><span class="cal-b" style="color:${colCal(f.cal[c])}">${f.cal[c] ?? "—"}</span><button class="btn s" data-bm="${esc(c)}" data-d="1">+</button></span></div>
      <button class="btn s tlami-b mt" data-btl="${esc(c)}">${ic("chispa", 14)} Mejorar redacción con Tlami</button><textarea class="area" style="min-height:80px" data-bv="${esc(c)}" placeholder="${f.R.campos[c] ? "" : "Sin registros en el trimestre: escriba su valoración"}">${esc(f.val[c])}</textarea></div>`).join("")}
    <label class="campo mt"><span>Observaciones generales y recomendaciones para la familia</span><textarea class="area" id="bvG">${esc(f.gen)}</textarea></label>
    <div class="fila">${f.edit.cal || f.edit.val ? `<button class="btn s r" id="bvR">Volver a lo calculado</button>` : ""}<button class="btn s" id="bvU">${ic("impr", 16)} Informe de este alumno</button></div></section>`}</main>`; };
ENLAZAR.evaluacion = () => { const g = gAct(); if (!g) return; if (esPre(g) && ENLAZAR.evalpre) return ENLAZAR.evalpre(); const T = trimActual();
  $$("[data-tr]").forEach(b => b.onclick = () => { S.trim = b.dataset.tr; S.al = null; re(); }); $$("[data-bal]").forEach(r => r.onclick = () => { S.al = r.dataset.bal; pintar(); scrollTo(0, 0); });
  const ed = id => { const B = (D.bol[g.id] = D.bol[g.id] || {}), t = (B[T.id] = B[T.id] || {}); return t[id] = t[id] || {}; };
  $("#bvV") && ($("#bvV").onclick = () => { S.al = null; re(); });
  $$("[data-bm]").forEach(b => b.onclick = () => { const f = filasBoleta(g, T).find(x => x.a.id === S.al), c = b.dataset.bm, o = ed(S.al); o.cal = o.cal || {}; o.cal[c] = Math.max(5, Math.min(10, (f.cal[c] ?? 8) + +b.dataset.d)); guardar(); re(); });
  $$("[data-bv]").forEach(t => t.onchange = () => { const o = ed(S.al); o.val = o.val || {}; o.val[t.dataset.bv] = t.value; guardar(); });
  $$("[data-btl]").forEach(b => b.onclick = () => { const c = b.dataset.btl, t = $$("[data-bv]").find(x => x.dataset.bv === c), a = activos(g).find(x => x.id === S.al);
    tlamiValoracion(g, a, c, t.value, nuevo => { const o = ed(S.al); o.val = o.val || {}; o.val[c] = nuevo; guardar(); re(); toast("Valoración mejorada. Revísela antes de imprimir."); }); });
  $("#bvG") && ($("#bvG").onchange = e => { ed(S.al).gen = e.target.value; guardar(); });
  $("#bvR") && ($("#bvR").onclick = () => { const o = ed(S.al); delete o.cal; delete o.val; guardar(); re(); });
  $("#bvU") && ($("#bvU").onclick = async () => imprimir(await docInformes(g, T, S.al)));
  $("#bvI").onclick = () => dlg(`<h3>Imprimir</h3><div class="lista"><button class="it btnit" id="pC"><span class="tx"><b>Concentrado del grupo</b><small>Calificaciones por ${areaTxt(g)} y faltas</small></span></button><button class="it btnit" id="pA"><span class="tx"><b>Informe de cada alumno</b><small>Una hoja por alumno para la familia, con sus evidencias</small></span></button></div><div class="fila fin mt"><button class="btn" id="pX">Cancelar</button></div>`, v => {
    v.querySelector("#pX").onclick = cerrarDlg; v.querySelector("#pC").onclick = () => { cerrarDlg(); imprimir(docConcentrado(g, T), true); }; v.querySelector("#pA").onclick = async () => { cerrarDlg(); imprimir(await docInformes(g, T)); }; }); };
function docConcentrado(g, T) { const F = filasBoleta(g, T);
  return `<div class="doc">${encabezado(g, "Concentrado de evaluación · " + esc(T.n))}<div class="datos"><span><b>Grupo:</b> ${esc(grNom(g))}</span><span><b>Periodo:</b> ${fCorta(T.ini)} al ${fCorta(T.fin)}</span><span><b>Docente:</b> ${esc(yo().nombre)}</span></div>
  <table><thead><tr><th class="c">No.</th><th>Alumno(a)</th>${g.grados.length > 1 ? '<th class="c">Grado</th>' : ""}${areasDe(g).map(c => `<th class="c">${esc(c)}</th>`).join("")}<th class="c">Promedio</th><th class="c">Faltas</th></tr></thead><tbody>
  ${F.map((x, i) => `<tr><td class="c">${i + 1}</td><td>${esc(x.a.nombre)}</td>${g.grados.length > 1 ? `<td class="c">${x.a.g ? x.a.g + ".°" : ""}</td>` : ""}${areasDe(g).map(c => `<td class="c"><b>${x.cal[c] ?? "—"}</b></td>`).join("")}<td class="c">${x.prom == null ? "—" : x.prom.toFixed(1)}</td><td class="c">${x.R.falt}</td></tr>`).join("")}</tbody></table>
  <p class="nota">Calificaciones de 5 a 10 obtenidas de los registros de evaluación formativa del periodo (Destacado, Logrado, En proceso, Requiere apoyo), con los ajustes del docente.</p>
  <table class="firmas"><tr><td>${esc(yo().nombre)}<br>Docente del grupo</td><td>${esc(dirTxt(g))}<br>Dirección de la escuela</td></tr></table></div>`; }
async function docInformes(g, T, solo) { const F = filasBoleta(g, T).filter(x => !solo || x.a.id === solo); let out = "";
  for (const [i, x] of F.entries()) { const fotos = D.fotos.filter(f => f.al === x.a.id && f.bol && f.fecha >= T.ini && f.fecha <= T.fin).slice(-3), imgs = [];
    for (const f of fotos) imgs.push({ f, u: await fotoGet(f.id) });
    out += `<div class="doc ${i ? "salto" : ""}">${encabezado(g, "Informe de evaluación formativa · " + esc(T.n))}
    <div class="datos"><span><b>Alumno(a):</b> ${esc(x.a.nombre)}</span><span><b>Grado y grupo:</b> ${x.a.g ? x.a.g + ".°" : esc(grNom(g))}${g.grupo ? " " + esc(g.grupo) : ""}</span><span><b>Periodo:</b> ${fCorta(T.ini)} al ${fCorta(T.fin)}</span><span><b>Faltas:</b> ${x.R.falt}</span><span><b>Docente:</b> ${esc(yo().nombre)}</span></div>
    <table><thead><tr><th style="width:24%">${esSec(g) ? "Disciplina" : "Campo formativo"}</th><th class="c" style="width:11%">Calificación</th><th>Valoración del desempeño</th></tr></thead><tbody>${areasDe(g).map(c => `<tr><td><b>${esc(c)}</b></td><td class="c"><b>${x.cal[c] ?? "—"}</b></td><td>${esc(x.val[c] || "")}</td></tr>`).join("")}</tbody></table>
    ${x.gen ? `<h2>Observaciones y recomendaciones para la familia</h2><p>${esc(x.gen).replace(/\n/g, "<br>")}</p>` : ""}
    ${imgs.length ? `<h2>Evidencias de su trabajo</h2><table class="ev-f"><tr>${imgs.map(o => `<td>${o.u ? `<img src="${o.u}">` : ""}<p>${esc(o.f.t || "")} · ${fCorta(o.f.fecha)}</p></td>`).join("")}</tr></table>` : ""}
    <table class="firmas"><tr><td>${esc(yo().nombre)}<br>Docente del grupo</td><td>${esc(dirTxt(g))}<br>Dirección</td><td>Madre, padre o tutor(a)</td></tr></table></div>`; }
  return out || `<div class="doc"><p>No hay alumnos.</p></div>`; }

/* =================================================================== ETAPA 3: SERVIDOR DE LA ZONA */
function srvAula() { const s = (ACC && ACC.tequio) || (LS("acc-cache") || {}).tequio || ""; const cfg = LS("tequio.cfg") || {}, pase = LS("tequio-pase") || {};
  return s ? { s, k: cfg.k || pase.k || "", tok: LS("tlp-token") || LS("acc-token") || "" } : null; }
const quienAula = () => { const g = gAct(); return { nombre: yo().nombre, escuela: g ? String(g.escuela || "") + (g.cct ? " · " + g.cct : "") : "" }; };
/* Si falla por algo pasajero (señal o servidor saturado), se reintenta una vez sola antes de avisar */
async function aulaPost(accion, datos, ms = 70000) {
  try { return await aulaPost1(accion, datos, ms); }
  catch (e) { if (!/No se pudo conectar|\(5\d\d\)|saturad|no pudo terminar la respuesta|no respondió/i.test(String(e.message))) throw e;
    await new Promise(r => setTimeout(r, 3500)); return aulaPost1(accion, datos, ms); } }
async function aulaPost1(accion, datos, ms = 70000) {
  if (DEMO) return demoPost(accion, datos);
  const sv = srvAula(); if (!sv) throw new Error("Esta app no encontró el servidor de la zona. Abra Tlamatini Aula con su enlace personal.");
  if (navigator.onLine === false) throw new Error("No hay internet en este momento.");
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(sv.s, { method: "POST", redirect: "follow", signal: ctl.signal, headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ k: sv.k, accion, datos: Object.assign({ tok: sv.tok, quien: quienAula() }, datos) }) });
    const j = await r.json(); if (!j || !j.ok) throw new Error((j && (j.mensaje || j.error)) || "El servidor no respondió."); return j; }
  catch (e) { if (e.name === "AbortError") throw new Error("El servidor tardó demasiado. Intente de nuevo."); if (/Failed to fetch|NetworkError|Load failed/i.test(e.message)) throw new Error("No se pudo conectar con el servidor de la zona."); throw e; }
  finally { clearTimeout(tm); } }

/* ---------- respuestas de ejemplo para la demostración ---------- */
const DEMO_ZONA = [
  { id: "adn-demo1", n: "El tendedero de palabras", cat: "lengua", campos: ["L"], g: [1, 3], min: 15, esp: "aula", mat: "Cordón, pinzas, tarjetas", prop: "Formar palabras y oraciones colgando tarjetas en orden.", pasos: ["Cuelgue un cordón de lado a lado del salón.", "Reparta tarjetas con sílabas o palabras.", "Por turnos, cada equipo cuelga tarjetas para formar una palabra u oración.", "El grupo lee en voz alta y corrige si hace falta."], var: "Con oraciones desordenadas para 3.°", multi: "1.° con sílabas, 2.° con palabras y 3.° con oraciones.", autor: "Mtra. Rosa Ejemplo", escuela: "Esc. Prim. «Benito Juárez» (ejemplo)", creado: "2026-11-12" },
  { id: "adn-demo2", n: "Mercadito de la comunidad", cat: "mate", campos: ["S", "H"], g: [2, 5], min: 25, esp: "aula", mat: "Billetes y monedas de papel, envases vacíos", prop: "Resolver problemas de suma, resta y cambio en una compra.", pasos: ["Organice puestos con envases y precios.", "La mitad del grupo vende y la otra compra con un presupuesto.", "Cada compra se registra en el cuaderno con la operación.", "Cambien de papel y comenten qué estrategias usaron."], var: "Con descuentos o fracciones en 5.°", multi: "Los mayores son cajeros y apoyan a los menores.", autor: "Mtro. Luis Muestra", escuela: "Esc. Prim. «Cuauhtémoc» (ejemplo)", creado: "2026-11-08" },
  { id: "adn-demo3", n: "Semáforo de emociones", cat: "convive", campos: ["H", "E"], g: [1, 6], min: 10, esp: "aula", mat: "Tres círculos de papel: verde, amarillo y rojo", prop: "Reconocer cómo llegan al salón y acordar qué necesitan.", pasos: ["Muestre los tres colores y su significado.", "Cada alumno se acerca al color que describe cómo se siente.", "Quien quiera, comparte por qué.", "Acuerden una acción para ayudar a quien está en rojo."], var: "Con dibujos en lugar de colores para 1.°", multi: "Los mayores ayudan a nombrar emociones.", autor: "Mtra. Ana Ficticia", escuela: "Esc. Prim. «Revolución» (ejemplo)", creado: "2026-10-30" }];
async function demoPost(accion, d) { await new Promise(r => setTimeout(r, 900));
  if (accion === "ppieAviso") return { id: "demo-" + Date.now(), avisados: "Dirección y Supervisión (demostración)" };
  if (accion === "ppieAvance") return {};
  if (accion === "aulaIA") { const m = d.modo;
    if (m === "lectura") return { r: { sintesis: "- Grupo: 26 alumnos de 9 a 10 años; aprenden mejor con actividades prácticas y en equipo; les interesan los animales y el fútbol.\n- Lo que más necesitan: 8 alumnos aún no comprenden lo que leen; dificultad para resolver problemas con dos operaciones.\n- Fortalezas: participativos, buena convivencia, apoyo entre compañeros.\n- Familias y comunidad: comunidad agrícola (jornaleros en los campos de cultivo); muchas familias trabajan todo el día; escasez de agua en temporada de calor.\n- Al planear: usar situaciones del campo y del cuidado del agua; tareas que no dependan de internet en casa.", problemas: ["Escasez de agua en la comunidad durante el verano", "Poco tiempo de lectura en casa"] } };
    if (m === "contexto") return { r: { problema: "En nuestra comunidad agrícola el agua escasea en temporada de calor y muchas familias trabajan en el campo todo el día. Los alumnos conocen de cerca el riego de los cultivos, pero no siempre leen ni interpretan la información que les ayudaría a cuidar el agua.", proposito: d.proposito || "Que los alumnos investiguen cómo se usa el agua en los campos y en sus casas, y propongan acciones para cuidarla.", producto: d.producto || "Campaña para las familias sobre el cuidado del agua",
      sesiones: (d.sesiones || []).map((x, i) => ({ inicio: "Pregunte: «¿De dónde sale el agua con que riegan los campos donde trabajan sus familias?» (ejemplo contextualizado, sesión " + (i + 1) + ").", desarrollo: "1. (15 min) " + (x.fase || "Actividad") + " a partir de una situación del campo de la comunidad.\n2. (20 min) Trabajo en equipos con apoyo de lectura para quienes lo necesitan.\n3. (10 min) Puesta en común.", cierre: "Cada equipo comparte una idea para cuidar el agua en casa.", evaluacion: "Observación con lista de cotejo." })) } };
    if (m === "sesion") return { r: { inicio: "Pregunte: «¿De dónde viene el agua que tomamos en casa?». Escuche ideas y anótelas en el pizarrón para volver a ellas al final.", desarrollo: "1. (10 min) En equipos, dibujan el camino del agua desde el pozo o la pipa hasta su casa.\n2. (15 min) Cada equipo comparte su dibujo; el grupo identifica en qué puntos el agua puede ensuciarse.\n3. (15 min) Con su apoyo, escriben o dibujan dos cuidados para que el agua llegue limpia.\n4. (5 min) Peguen los trabajos en el muro del proyecto.", cierre: "Regresen a las ideas del inicio: ¿qué cambió de lo que pensábamos? Cada alumno dice un cuidado del agua que hará en casa.", evaluacion: "Observe si explican el recorrido del agua y proponen cuidados; registre en la lista de cotejo.", materiales: "Hojas, colores, cinta, pizarrón", ajustes: "Para quien aún no escribe, que dicte a un compañero o dibuje; ofrezca imágenes de apoyo." } };
    if (m === "ajustes") return { r: { ajustes: ["Siente al alumno cerca del pizarrón y lejos de distracciones.", "Dé las indicaciones en pasos cortos y compruebe que las entendió.", "Ofrezca apoyos visuales (imágenes, tarjetas) para la actividad.", "Permita que muestre lo que sabe de forma oral o con dibujos.", "Forme pareja con un compañero tutor."], familia: "Lean juntos 10 minutos diarios y pídanle que cuente con sus palabras lo leído." } };
    if (m === "dinamica") return { r: { n: "Detectives del agua", prop: "Recordar cuidados del agua mientras se activan.", mat: "Tarjetas con imágenes de acciones", pasos: ["Esconda tarjetas en el salón.", "Por equipos, las buscan durante 3 minutos.", "Clasifican cada acción: cuida o desperdicia el agua.", "Explican al grupo una de sus tarjetas."], var: "Con un tiempo límite para cada equipo.", multi: "Los mayores leen las tarjetas a los menores." } };
    if (m === "examen") { const C = d.cuantos || {}, out = [], n = String(d.contenidos || "").split("\n").length || 1; let k = 0;
      for (let i = 0; i < (C.om || 0); i++) out.push({ tipo: "om", cont: 1 + (k++ % n), txt: `Reactivo de ejemplo ${i + 1}: ¿cuál de las siguientes opciones es correcta?`, ops: ["Opción correcta", "Opción incorrecta", "Otra opción incorrecta", "Una más incorrecta"], ok: 0 });
      for (let i = 0; i < (C.vf || 0); i++) out.push({ tipo: "vf", cont: 1 + (k++ % n), txt: `Afirmación de ejemplo ${i + 1} sobre el contenido.`, ok: i % 2 === 0 });
      for (let i = 0; i < (C.rel || 0); i++) out.push({ tipo: "rel", cont: 1 + (k++ % n), txt: "Relacione cada concepto con su descripción.", pares: [["Concepto A", "Descripción A"], ["Concepto B", "Descripción B"], ["Concepto C", "Descripción C"], ["Concepto D", "Descripción D"]] });
      for (let i = 0; i < (C.corta || 0); i++) out.push({ tipo: "corta", cont: 1 + (k++ % n), txt: `Pregunta breve de ejemplo ${i + 1}.`, ok: "Respuesta esperada" });
      for (let i = 0; i < (C.abierta || 0); i++) out.push({ tipo: "abierta", cont: 1 + (k++ % n), txt: `Problema o pregunta de desarrollo de ejemplo ${i + 1}.`, ok: "Criterios: plantea, resuelve y explica." });
      return { r: { reactivos: out } }; }
    if (m === "estudio") return { r: { reactivos: [
      { area: "Inclusión, convivencia y protección", f: "d", p: "Un alumno de nuevo ingreso usa silla de ruedas y el salón está en planta alta. ¿Qué acción corresponde a la escuela?", o: ["Reubicar el grupo en planta baja y revisar la accesibilidad de los espacios que usará", "Pedir a la familia que lo inscriba en otra escuela", "Que asista solo a las clases que se den en el patio"], k: 0, e: "Eliminar barreras físicas es un ajuste razonable que garantiza su participación en igualdad de condiciones.", fu: "CPEUM, art. 3o, fracción II, inciso f); LGE, capítulo VIII." },
      { area: "Plan de Estudio 2022 y práctica docente", f: "c", p: "El programa sintético es elaborado por…", o: ["…la Secretaría de Educación Pública, con alcance nacional.", "…cada colectivo docente en su CTE.", "…la supervisión escolar de cada zona."], k: 0, e: "El programa sintético es nacional; el programa analítico lo construye el colectivo.", fu: "SEP (2022). Plan de Estudio." } ] } };
    if (m === "guia") return { r: { titulo: "Las historias que cuentan nuestros abuelos (a partir de la guía, págs. 45-48)", proposito: "Que las y los alumnos narren sucesos del pasado y del presente de su comunidad, apoyándose en las lecturas y actividades de la guía.", producto: "Antología ilustrada de relatos de la comunidad", problema: "En la comunidad muchas familias llegaron de Oaxaca y Guerrero a trabajar en los campos; sus historias casi no se conocen en la escuela.",
      sesiones: (d.sesiones || []).map((x, i) => ({ inicio: "Pregunte: «¿Qué historia les han contado sus abuelos de cuando llegaron al valle?» (sesión " + (i + 1) + ").", desarrollo: "1. (15 min) Lean juntos la lectura de la guía (pág. " + (45 + i) + ") y subrayen qué pasó, cuándo y dónde.\n2. (20 min) En parejas, relacionan la lectura con una historia de su familia.\n3. (10 min) Escriben un borrador breve.", cierre: "Dos alumnos comparten su borrador; el grupo dice qué le gustó.", evaluacion: "Observe si ordena los sucesos con palabras como «antes», «después», «finalmente»." })) } };
    if (m === "avance") { const n = String(d.contenidos || "").split("\n").length; return { r: { ids: [1 + Math.floor(Math.random() * n), 1 + Math.floor(Math.random() * n)], titulo: "Guía de ejemplo · páginas 45 a 48" } }; }
    if (m === "valoracion") return { r: { texto: String(d.texto || "").replace(/^En [^,]+, /, "Durante este trimestre, ") + " Le recomendamos seguir practicando en casa con actividades sencillas del día a día." } }; }
  if (accion === "aulaDinLista") return { lista: DEMO_ZONA.concat(D.mias.filter(x => x.pub).map(x => Object.assign({}, x, { id: x.pub, autor: yo().nombre, mia: true, creado: hoy() }))) };
  if (accion === "aulaDinPublicar") return { id: "adn-" + uid() };
  if (accion === "aulaDinRetirar") return { id: d.id };
  if (accion === "ulamaRevSubir") return { codigo: "DEMO" + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + "7", vence: new Date(Date.now() + 216e5).toISOString(), correos: [] };
  if (accion === "ulamaRevBajar") { const x = REV_DEMO; if (!x) throw new Error("El código no existe o ya venció."); return x; }
  if (accion === "efEnviar") return { enviados: 1 };
  throw new Error("No disponible en la demostración."); }
let REV_DEMO = null;

/* ---------- Tlami en el aula ---------- */
function tlamiEspera(msg) { dlg(`<div class="tlami-esp"><span class="tlami-av">${ic("chispa", 30)}</span><h3>Tlami está pensando…</h3><p class="small muted">${esc(msg)}</p><div class="prog"><i style="width:100%" class="anim"></i></div></div>`); }
function tlamiError(e) { dlg(`<h3>Tlami no pudo ayudar esta vez</h3><p class="mb">${esc(e.message || e)}</p><div class="fila fin"><button class="btn p" id="teX">Entendido</button></div>`, v => v.querySelector("#teX").onclick = cerrarDlg); }
function tlamiSesion(p, i) { const g = grDe(p.gid), s = p.sesiones[i];
  dlg(`<div class="fila" style="gap:10px;flex-wrap:nowrap"><span class="tlami-av">${ic("chispa", 26)}</span><div><h3 style="margin:0">Tlami detalla su sesión ${i + 1}</h3><p class="small muted">${esc(s.fase)} · ${esc(p.titulo)}</p></div></div>
   <label class="campo mt"><span>¿Algo que quiera pedirle? <small>(opcional)</small></span><textarea id="tsN" class="area" style="min-height:80px" placeholder="Ej.: que sea en el patio, que use material reciclado, tengo 3 alumnos que aún no leen…"></textarea></label>
   <p class="small muted">Tlami usa ${p.disc ? "la disciplina, " : ""}el contenido, los PDA de ${g.grados.length > 1 ? "cada grado" : "su grado"} y la metodología del proyecto. No se envían nombres de alumnos.</p>
   <div class="fila fin mt"><button class="btn" id="tsX">Cancelar</button><button class="btn p" id="tsOk">${ic("chispa", 16)} Pedir propuesta</button></div>`, v => {
    v.querySelector("#tsX").onclick = cerrarDlg;
    v.querySelector("#tsOk").onclick = async () => { const nota = val("tsN").trim(); tlamiEspera("Preparando inicio, desarrollo, cierre y evaluación de la sesión.");
      try { const j = await aulaPost("aulaIA", { modo: "sesion", grados: g.grados, nivel: nivelTxt(g), disciplina: p.disc || "", titulo: p.titulo, campo: p.disc ? p.disc + " (secundaria, campo formativo " + p.campo + ")" : p.campo, metodo: (METODOS[p.metodo] || {}).n || p.metodo, escenario: ESCENARIOS[p.escenario] || "", fase: s.fase, num: i + 1, total: p.sesiones.length, min: p.min,
          contenidos: Object.values(p.contenidos || {}).join(" | "), pdas: Object.entries(p.pdas || {}).map(([k, t]) => k + ".°: " + t).join(" | "), nota, contexto: (g.lectura && g.lectura.sint) || "" });
        const r = j.r || {}; dlg(`<h3>Propuesta de Tlami</h3><div class="tlami-r">${[["Inicio", r.inicio], ["Desarrollo", r.desarrollo], ["Cierre", r.cierre], ["Evaluación", r.evaluacion], ["Materiales", r.materiales], ["Ajustes", r.ajustes]].filter(x => x[1]).map(([t, x]) => `<p><b>${t}:</b> ${esc(x).replace(/\n/g, "<br>")}</p>`).join("")}</div>
          <p class="small muted mt">Revísela y ajústela a su grupo: usted conoce a sus alumnos.</p><div class="fila fin mt"><button class="btn" id="trX">Descartar</button><button class="btn p" id="trOk">${ic("check", 16)} Usar en la sesión</button></div>`, w => {
          w.querySelector("#trX").onclick = cerrarDlg;
          w.querySelector("#trOk").onclick = () => { s.inicio.txt = r.inicio || s.inicio.txt; s.desarrollo = [r.desarrollo, r.materiales ? "Materiales: " + r.materiales : "", r.ajustes ? "Ajustes: " + r.ajustes : ""].filter(Boolean).join("\n\n") || s.desarrollo;
            s.cierre.txt = r.cierre || s.cierre.txt; if (r.evaluacion) s.eval = r.evaluacion; s.ia = true; guardar(); cerrarDlg(); re(); toast("La sesión quedó con la propuesta de Tlami."); }; }); }
      catch (e) { tlamiError(e); } }; }); }
function tlamiAjustes(g, a) { const p = D.planes.filter(x => x.gid === g.id).sort((x, y) => y.ini.localeCompare(x.ini))[0];
  dlg(`<div class="fila" style="gap:10px;flex-wrap:nowrap"><span class="tlami-av">${ic("chispa", 26)}</span><div><h3 style="margin:0">Ajustes razonables con Tlami</h3><p class="small muted">Para ${esc(a.nombre.split(" ")[0])} · su nombre no se envía</p></div></div>
   <label class="campo mt"><span>¿Qué le cuesta o qué observa?</span><textarea id="taB" class="area" style="min-height:80px" placeholder="Ej.: se distrae con facilidad, aún no lee de corrido, le cuesta trabajar en equipo…"></textarea></label>
   <label class="campo"><span>Actividad o proyecto</span><input id="taA" value="${esc(p ? p.titulo + " (" + (p.disc || p.campo) + ")" : "")}"></label>
   <div class="fila fin mt"><button class="btn" id="taX">Cancelar</button><button class="btn p" id="taOk">${ic("chispa", 16)} Pedir ajustes</button></div>`, v => {
    v.querySelector("#taX").onclick = cerrarDlg;
    v.querySelector("#taOk").onclick = async () => { const bar = val("taB").trim(), act = val("taA").trim(); if (bar.length < 5) return toast("Describa un poco lo que observa."); tlamiEspera("Buscando apoyos concretos para que participe.");
      try { const j = await aulaPost("aulaIA", { modo: "ajustes", grados: [a.g || g.grados[0]], nivel: nivelTxt(g), actividad: act, campo: p ? (p.disc ? p.disc + " (secundaria)" : p.campo) : "", barrera: bar }), r = j.r || {};
        dlg(`<h3>Ajustes sugeridos</h3><ul class="tlami-l">${(r.ajustes || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>${r.familia ? `<p class="mt"><b>Con la familia:</b> ${esc(r.familia)}</p>` : ""}
          <div class="fila fin mt"><button class="btn" id="tjX">Cerrar</button><button class="btn p" id="tjOk">${ic("check", 16)} Guardar en su ficha</button></div>`, w => {
          w.querySelector("#tjX").onclick = cerrarDlg;
          w.querySelector("#tjOk").onclick = () => { a.ajustes = (a.ajustes || []).concat([{ f: hoy(), bar, l: r.ajustes || [], fam: r.familia || "" }]); guardar(); cerrarDlg(); re(); toast("Ajustes guardados en su ficha."); }; }); }
      catch (e) { tlamiError(e); } }; }); }
function tlamiDinamica() { const g = gAct(), gr = g ? g.grados : [1], gE = escala(g);
  dlg(`<div class="fila" style="gap:10px;flex-wrap:nowrap"><span class="tlami-av">${ic("chispa", 26)}</span><div><h3 style="margin:0">Crear una dinámica con Tlami</h3><p class="small muted">Para ${esc(grNom(g))}</p></div></div>
   <label class="campo mt"><span>¿Para qué la quiere?</span><textarea id="tdT" class="area" style="min-height:70px" placeholder="Ej.: repasar las tablas del 3, activarlos después del recreo, iniciar el proyecto del agua…"></textarea></label>
   <div class="dos"><label class="campo"><span>Tipo</span><select id="tdC">${Object.entries(DIN_CATS).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join("")}</select></label><label class="campo"><span>Minutos</span><input id="tdM" type="number" min="3" max="60" value="10"></label></div>
   <label class="campo"><span>Espacio</span><select id="tdE"><option value="aula">Aula</option><option value="patio">Patio</option><option value="ambos">Aula o patio</option></select></label>
   <div class="fila fin mt"><button class="btn" id="tdX">Cancelar</button><button class="btn p" id="tdOk">${ic("chispa", 16)} Crear</button></div>`, v => {
    v.querySelector("#tdX").onclick = cerrarDlg;
    v.querySelector("#tdOk").onclick = async () => { const tema = val("tdT").trim(), cat = val("tdC"), min = +val("tdM") || 10, esp = val("tdE"); if (tema.length < 5) return toast("Escriba para qué la quiere."); tlamiEspera("Inventando una dinámica para su grupo.");
      try { const j = await aulaPost("aulaIA", { modo: "dinamica", grados: gr, nivel: nivelTxt(g), tema, tipo: (DIN_CATS[cat] || [cat])[0], min, esp }), r = j.r || {};
        const d = { id: "mia-" + uid(), n: r.n || "Dinámica de Tlami", cat, campos: ["L", "S", "E", "H"].filter(k => (cat === "lengua" && k === "L") || (cat === "mate" && k === "S") || (cat === "ciencia" && k === "S") || (cat === "convive" && k === "H")), g: gE, min, esp, mat: r.mat || "", prop: r.prop || "", pasos: r.pasos || [], var: r.var || "", multi: r.multi || "", autor: yo().nombre, ia: true };
        if (!d.campos.length) d.campos = ["L", "S", "E", "H"];
        dlg(`<h3>${esc(d.n)}</h3><p>${esc(d.prop)}</p>${d.mat ? `<p class="small mt"><b>Material:</b> ${esc(d.mat)}</p>` : ""}<ol class="pasos-l mt">${d.pasos.map(x => `<li>${esc(x)}</li>`).join("")}</ol>${d.var ? `<p class="small"><b>Variante:</b> ${esc(d.var)}</p>` : ""}${d.multi ? `<p class="small"><b>Multigrado:</b> ${esc(d.multi)}</p>` : ""}
          <div class="fila fin mt"><button class="btn" id="tgX">Descartar</button><button class="btn p" id="tgOk">${ic("check", 16)} Guardar en mis dinámicas</button></div>`, w => {
          w.querySelector("#tgX").onclick = cerrarDlg; w.querySelector("#tgOk").onclick = () => { D.mias.push(d); guardar(); cerrarDlg(); ir("dinamica", { id: d.id }); toast("Dinámica guardada. Puede editarla o compartirla con la zona."); }; }); }
      catch (e) { tlamiError(e); } }; }); }
async function tlamiValoracion(g, a, campo, txt, alListo) { if (!txt || txt.length < 15) return toast("Escriba primero una valoración (o registre evaluaciones) para que Tlami la mejore.");
  const nom = String(a.nombre || "").split(" ")[0], re0 = new RegExp("\\b" + nom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
  tlamiEspera("Redactando la valoración para la familia.");
  try { const j = await aulaPost("aulaIA", { modo: "valoracion", grados: [a.g || g.grados[0]], nivel: nivelTxt(g), campo: esSec(g) ? campo + " (secundaria)" : campo, texto: txt.replace(re0, "[ALUMNO]") }); cerrarDlg(); const t = String((j.r || {}).texto || "").replace(/\[ALUMNO\]/g, nom); if (t) alListo(t); }
  catch (e) { tlamiError(e); } }

/* =================================================================== LIBROS DE TEXTO GRATUITOS */
const LTG_URL = c => `https://libros.conaliteg.gob.mx/pdf-reader/reader.html?nivel=${/^S/.test(c) ? "secundaria" : /^K/.test(c) ? "preescolar" : "primaria"}&ciclo=2026&clave=${c}`;
const COLE_SEC = { 1: "Colección Ximhai", 2: "Colección Sk´asolil", 3: "Colección Nanahuatzin" }, LTG_CAMPO = { "Lenguajes": "L", "Saberes y pensamiento científico": "S", "Ética, naturaleza y sociedades": "E", "De lo humano y lo comunitario": "H" };
function librosPre(gr) { const o = ORD[gr - 1] + " grado";
  return [{ c: `K${gr}LPA`, n: "Explorar e imaginar con mi libro de Preescolar", sub: o, t: "aula", k: "P" }, { c: `K${gr}MLA`, n: "Múltiples lenguajes", sub: o, t: "lenguajes", k: "M" }, { c: `K${gr}JIA`, n: "Jugar e imaginar con mi material manipulable", sub: o, t: "saberes", k: "J" },
    { c: `K${gr}LDG`, n: "Láminas de diálogo con manifestaciones culturales y artísticas", sub: o, t: "comunitario", k: "D" }, { c: "K0CFA", n: "Crianza para la libertad. Libro para las familias", sub: "Fase 2", t: "escolar", k: "F" },
    { c: "K0LPM", n: "Un libro sin recetas, para la maestra y el maestro", sub: "Fase 2", t: "maestro", k: "LPM" }, { c: "K0TAM", n: "Posibilidades de trabajo para la acción transformadora y el codiseño", sub: "Fase 2 · para la docente", t: "maestro", k: "TAM" },
    { c: "K0MTM", n: "Modalidades de trabajo para la acción transformadora y el codiseño", sub: "Fase 2 · para la docente", t: "maestro", k: "MTM" }]; }
function librosSec(gr) { const o = ORD[gr - 1] + " grado", co = COLE_SEC[gr] + " · " + o;
  return [{ c: `S${gr}NLA`, n: "Nuestro libro de proyectos", sub: co, t: "aula", k: "P" }, { c: `S${gr}LEA`, n: "Lenguajes", sub: co, t: "lenguajes", k: "L" }, { c: `S${gr}SAA`, n: "Saberes y pensamiento científico", sub: co, t: "saberes", k: "S" },
    { c: `S${gr}ETA`, n: "Ética, naturaleza y sociedades", sub: co, t: "escolar", k: "E" }, { c: `S${gr}HUA`, n: "De lo humano y lo comunitario", sub: co, t: "comunitario", k: "H" }, { c: `S${gr}MLA`, n: "Múltiples lenguajes", sub: co, t: "lenguajes", k: "M" },
    { c: `S${gr}INA`, n: "Uérakua anapu uantakua. Projects and Readings", sub: o + " · Inglés", t: "otros", k: "I" }, { c: "S1HPA", n: "Historia del pueblo mexicano", sub: "Multigrado", t: "otros", k: "HP" },
    { c: "S0LPM", n: "Un libro sin recetas, para la maestra y el maestro", sub: "Fase 6 · Secundaria", t: "maestro", k: "LPM" }]; }
const ORD = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto", "Sexto"];
function librosDe(gr) { const o = ORD[gr - 1] + " grado", L = [["PAA", "Proyectos de Aula", "aula"], ["PEA", "Proyectos Escolares", "escolar"], ["PCA", "Proyectos Comunitarios", "comunitario"], ["SDA", "Nuestros saberes: libro para alumnos, maestros y familia", "saberes"], ["MLA", "Múltiples lenguajes", "lenguajes"]]
    .map(([c, n, t]) => ({ c: `P${gr}${c}`, n, sub: o, t }));
  if (gr <= 2) L.push({ c: `P${gr}TPA`, n: "Múltiples lenguajes. Trazos y palabras", sub: o, t: "lenguajes" }, { c: `P${gr}TNA`, n: "Múltiples lenguajes. Trazos y números", sub: o, t: "lenguajes" });
  if (gr >= 4) L.push({ c: "P0CMA", n: "Cartografía de México y el mundo", sub: "4.° a 6.° (multigrado)", t: "otros" }, { c: "P0SHA", n: "Nuestros saberes: México, grandeza y diversidad", sub: "4.° a 6.° (multigrado)", t: "otros" });
  const f = gr <= 2 ? [1, 3] : gr <= 4 ? [3, 4] : [5, 5]; L.push({ c: `P${f[0]}LPM`, n: "Un libro sin recetas, para la maestra y el maestro", sub: "Fase " + f[1], t: "maestro" });
  return L; }
VISTAS.libros = () => { const g = gAct(), sec = esSec(g), grs = g ? g.grados : [1, 2, 3, 4, 5, 6], sel = S.gr && grs.includes(S.gr) ? S.gr : grs[0];
  return barra("Tlamatini Aula", "Libros de texto") + `<main class="wrap">
  <p class="small muted mt">Libros de Texto Gratuitos de la SEP, ciclo 2026-2027. Se abren en el sitio oficial de la CONALITEG (requiere internet).</p>
  ${grs.length > 1 ? `<div class="chips mt">${grs.map(x => `<button class="chip" data-lg="${x}" aria-pressed="${x === sel}">${x}.° grado</button>`).join("")}</div>` : ""}
  <div class="lista mt">${(esPre(g) ? librosPre(sel) : sec ? librosSec(sel) : librosDe(sel)).map(l => `<a class="it btnit libro" href="${LTG_URL(l.c)}" target="_blank" rel="noopener"><span class="av lb-${l.t}">${ic("libro", 18)}</span><span class="tx"><b>${esc(l.n)}</b><small>${esc(l.sub)}</small></span>${ic("sig", 16)}</a>`).join("")}</div>
  ${esPre(g) ? `<section class="card mt"><h3>¿Cuál uso para mi proyecto?</h3><p class="small"><b>Explorar e imaginar con mi libro</b> acompaña los proyectos de las niñas y los niños; <b>Múltiples lenguajes</b> y el <b>material manipulable</b> apoyan el juego, el lenguaje y el pensamiento matemático. Las <b>Láminas de diálogo</b> sirven para conversar en asamblea, y <b>Crianza para la libertad</b> es para compartir con las familias.</p></section>
  <p class="small mt"><a href="https://libros.conaliteg.gob.mx/preescolar.html" target="_blank" rel="noopener">Ver todos los libros de preescolar en la CONALITEG</a></p></main>` : sec ? `<section class="card mt"><h3>¿Cuál uso para mi proyecto?</h3><p class="small"><b>Nuestro libro de proyectos</b> trae los proyectos de aula, escolares y comunitarios de los cuatro campos formativos. El libro de su campo formativo${g && (g.discs || []).length === 1 ? ` (${esc(DIN_CAMPOS[(discDe(g.discs[0]) || [])[1]] || "")})` : ""} sirve para consultar los conceptos de su disciplina. En Inglés use <b>Projects and Readings</b>.</p></section>
  <p class="small mt"><a href="https://libros.conaliteg.gob.mx/secundaria.html" target="_blank" rel="noopener">Ver todos los libros de secundaria en la CONALITEG</a></p></main>` : `<section class="card mt"><h3>¿Cuál uso para mi proyecto?</h3><p class="small">El libro de proyectos va con el <b>escenario</b> de su planeación: <b>Aula</b> → Proyectos de Aula; <b>Escolar</b> → Proyectos Escolares; <b>Comunitario</b> → Proyectos Comunitarios. En el índice, busque los proyectos del campo formativo que trabaja. <b>Nuestros saberes</b> sirve para consultar los conceptos y <b>Múltiples lenguajes</b> para la lectura.</p></section>
  <p class="small mt"><a href="https://libros.conaliteg.gob.mx/primaria.html" target="_blank" rel="noopener">Ver todos los libros de primaria en la CONALITEG</a></p></main>`}`; };
ENLAZAR.libros = () => { $$("[data-lg]").forEach(b => b.onclick = () => { S.gr = +b.dataset.lg; re(); }); };
function librosPlan(p) { const g = grDe(p.gid), grs = g ? g.grados : [], t = p.escenario === "escolar" ? "escolar" : p.escenario === "comunitario" ? "comunitario" : "aula", kc = LTG_CAMPO[p.campo];
  const L = esPre(g) ? grs.flatMap(gr => librosPre(gr).filter(l => ["P", "M", "J"].includes(l.k)).map(l => Object.assign({ gr }, l))) : p.disc ? grs.flatMap(gr => librosSec(gr).filter(l => l.k === "P" || l.k === kc || (p.disc === "Inglés" && l.k === "I") || (p.disc === "Historia" && l.k === "HP" && gr === grs[0])).map(l => Object.assign({ gr }, l)))
    : grs.flatMap(gr => librosDe(gr).filter(l => l.t === t || l.t === "saberes").map(l => Object.assign({ gr }, l)));
  return `<h2 class="sec-t">Libros de texto<small>Busque en el índice los proyectos de ${esc(p.campo)}</small></h2><div class="lista">${L.map(l => `<a class="it btnit libro" href="${LTG_URL(l.c)}" target="_blank" rel="noopener"><span class="av lb-${l.t}">${ic("libro", 18)}</span><span class="tx"><b>${esc(l.n)}</b><small>${l.gr}.° grado</small></span>${ic("sig", 16)}</a>`).join("")}</div>`; }

/* =================================================================== DINÁMICAS DE LA ZONA */
let ZONA = null;
async function cargarZona(forzar) { if (ZONA && !forzar) return ZONA;
  try { const j = await aulaPost("aulaDinLista", {}, 30000); ZONA = (j.lista || []).map(d => Object.assign({ zona: true }, d)); try { localStorage.setItem(DEMO ? "aula-zona-demo" : "aula-zona", JSON.stringify(ZONA)); } catch (e) {} }
  catch (e) { ZONA = (LS(DEMO ? "aula-zona-demo" : "aula-zona") || []).map(d => Object.assign({ zona: true }, d)); ZONA.err = e.message; }
  return ZONA; }
async function compartirDin(d) { if (!(await confirmar(`«${d.n}» se publicará en el banco de dinámicas de la zona con su nombre, para que otros docentes la usen.`, "Compartir"))) return;
  toast("Compartiendo…"); try { const j = await aulaPost("aulaDinPublicar", { din: d }); d.pub = j.id; guardar(); ZONA = null; re(); toast(j.actualizada ? "Se actualizó en el banco de la zona." : "<b>¡Gracias!</b> Su dinámica ya está en el banco de la zona.", 3500); }
  catch (e) { toast(esc(e.message), 4000); } }
async function retirarDin(d) { if (!(await confirmar("La dinámica dejará de verse en el banco de la zona. Quienes ya la guardaron la conservan.", "Retirar"))) return;
  try { await aulaPost("aulaDinRetirar", { id: d.pub || d.id }); const m = D.mias.find(x => x.pub === (d.pub || d.id)); if (m) delete m.pub; guardar(); ZONA = null; toast("Retirada del banco de la zona."); if (d.zona) volver(); else re(); }
  catch (e) { toast(esc(e.message), 4000); } }

/* =================================================================== VISITA DE ACOMPAÑAMIENTO */
const pl = (n, a, b) => n + " " + (n === 1 ? a : b);
const REV_URL = c => new URL("#rev=" + c, location.href.split("#")[0]).href;
async function zip(txt) { if (!window.CompressionStream) return { z: 0, s: btoa(unescape(encodeURIComponent(txt))) };
  const buf = new Uint8Array(await new Response(new Blob([txt]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer()); let b = "";
  for (let i = 0; i < buf.length; i += 0x8000) b += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000)); return { z: 1, s: btoa(b) }; }
async function unzip(s, z) { if (!+z) return decodeURIComponent(escape(atob(s))); if (!window.DecompressionStream) throw new Error("Este navegador es muy antiguo para abrir la revisión. Use Chrome actualizado.");
  const bin = Uint8Array.from(atob(s), c => c.charCodeAt(0)); return new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text(); }
async function miniatura(u, max = 360) { return new Promise(ok => { const im = new Image(); im.onload = () => { const s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", .6)); }; im.onerror = () => ok(""); im.src = u; }); }
async function paqueteVisita(g, T, que) { const fin = hoy() < T.fin ? hoy() : T.fin, enP = k => k >= T.ini && k <= fin;
  const planes = !que.plan ? [] : D.planes.filter(p => p.gid === g.id && p.sesiones.some(s => !s.fecha || s.fecha >= T.ini) && p.ini <= fin).map(p => ({ titulo: p.titulo, campo: p.disc ? p.disc + " · " + p.campo : p.campo, metodo: (METODOS[p.metodo] || {}).n || p.metodo, esc: ESCENARIOS[p.escenario] || "", ejes: p.ejes, ini: p.ini, min: p.min,
    cont: Object.values(p.contenidos || {}), pdas: p.pdas, prop: p.proposito, prod: p.producto, crit: p.criterios.map(c => c.gr + ".° " + c.c),
    ses: p.sesiones.map((s, i) => ({ f: s.fecha, fase: s.fase, ini: [dinDe(s.inicio.din) ? "Dinámica: " + dinDe(s.inicio.din).n : "", s.inicio.txt].filter(Boolean).join(". "), des: s.desarrollo, cie: [dinDe(s.cierre.din) ? "Dinámica: " + dinDe(s.cierre.din).n : "", s.cierre.txt].filter(Boolean).join(". "), ev: s.eval, h: s.hecho ? 1 : 0, r: D.reg.some(r => r.pid === p.id && r.ses === i) ? 1 : 0 })) }));
  const A = D.asis[g.id] || {}, dias = Object.keys(A).filter(k => enP(k) && listaTomada(A[k])).sort(), al = activos(g);
  const asis = !que.asis ? null : { dias, al: al.map(a => ({ n: a.nombre, g: a.g || "", m: dias.map(k => marcaDe(A[k], a.id) || "-").join("") })) };
  const F = filasBoleta(g, T), ev = !que.eval || esPre(g) ? null : { campos: areasDe(g), al: F.map(x => ({ n: x.a.nombre, cal: areasDe(g).map(c => x.cal[c]), nreg: x.R.nreg, falt: x.R.falt })), reg: D.reg.filter(r => r.gid === g.id && enP(r.fecha)).length };
  const fotos = []; if (que.fotos) for (const f of D.fotos.filter(f => f.bol && enP(f.fecha) && al.some(a => a.id === f.al)).slice(-6)) { const u = await fotoGet(f.id); if (u) fotos.push({ t: f.t || "Evidencia", f: f.fecha, u: await miniatura(u) }); }
  return { t: "aula-rev", v: 1, gen: new Date().toISOString(), per: { n: T.n, ini: T.ini, fin }, docente: { nombre: yo().nombre, correo: yo().correo },
    escuela: { nombre: g.escuela, cct: g.cct || "", turno: g.turno || "", loc: g.loc || "", dir: dirTxt(g) }, grupo: { nom: grNom(g), grados: g.grados, nivel: esSec(g) ? "sec" : "prim", n: al.length, nee: al.filter(a => a.nee || (a.ajustes || []).length).length },
    planes, asis, ev, fotos, din: D.mias.length, av: que.av && typeof avAplica === "function" && avAplica(g) ? await avPaquete(g) : null }; }
VISTAS.visita = () => { const g = gAct(); if (!g) return VISTAS.inicio(); const q = D.cfg.revQR, vig = q && new Date(q.vence) > new Date(), R = S.R = S.R || { plan: true, asis: true, eval: true, fotos: true, av: true }; if (R.av === undefined) R.av = true;
  return barra("Tlamatini Aula", "Visita de acompañamiento") + `<main class="wrap">
  <section class="portada" style="background:radial-gradient(500px 260px at 90% 0,rgba(232,163,61,.35),transparent 70%),linear-gradient(150deg,#294A86,#13244A 70%)"><h1>Le visitan: comparta su trabajo con un código</h1>
   <p>Su supervisor(a), director(a) o ATP abre con el código su planeación, su asistencia, su evaluación y sus evidencias del trimestre, <b>solo para consulta</b>: no puede cambiar nada de su app.</p></section>
  ${vig ? `<section class="rev-qr mt"><div class="eb">Código vigente</div><div id="revQR"></div><div class="rev-cod">${esc(q.codigo.slice(0, 3) + " " + q.codigo.slice(3))}</div><p class="small muted">${esc(q.resumen || "")}<br>Válido hasta las ${new Date(q.vence).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}; después se borra solo.</p>
   <p class="small">Quien le visita lo escanea con la cámara de su celular, o abre Tlamatini Aula → Visita de acompañamiento → «Revisar a un docente» y escribe el código.</p>
   <div class="fila" style="justify-content:center"><button class="btn s" id="rvCop">${ic("doc", 16)} Copiar enlace</button><button class="btn s r" id="rvX">Quitar código</button></div></section>` : ""}
  <section class="card mt"><h3>${vig ? "Generar otro código" : "¿Qué compartir?"}</h3><p class="small muted mb">${esc(grNom(g))} · ${esc(trimActual().n)}</p>
   ${[["plan", "Planeaciones y sesiones"], ["asis", "Pase de lista"], ["eval", "Evaluación formativa y calificaciones"], ["fotos", "Evidencias marcadas para el informe (fotos pequeñas)"]].concat(typeof avAplica === "function" && avAplica(g) ? [["av", "Avance del programa (contenidos trabajados en el ciclo)"]] : []).map(([k, t]) => `<label class="rev-chk"><input type="checkbox" data-rq="${k}" ${R[k] ? "checked" : ""}> ${t}</label>`).join("")}
   <div class="fila mt"><button class="btn p" id="rvGen">${ic("qr", 18)} Generar código QR</button></div><p class="small muted mt">El código dura 6 horas. Los ajustes razonables de sus alumnos no se comparten: solo cuántos alumnos los tienen.</p></section>
  <section class="card mt"><h3>¿Usted va a revisar?</h3><p class="small muted mb">Para supervisión, dirección y ATP: abra el código que le muestra el docente.</p><div class="fila"><button class="btn" id="rvAbrir">${ic("buscar", 16)} Revisar a un docente</button>${(LS("aula-visitas") || []).length ? `<button class="btn" id="rvMis">${ic("doc", 16)} Mis revisiones (${(LS("aula-visitas") || []).length})</button>` : ""}</div></section></main>`; };
ENLAZAR.visita = () => { const g = gAct(), R = S.R, q = D.cfg.revQR;
  if (q && $("#revQR")) cargarJS("qrcode.min.js").then(() => { $("#revQR").innerHTML = ""; new QRCode($("#revQR"), { text: REV_URL(q.codigo), width: 512, height: 512, colorDark: "#13244A", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M }); }).catch(() => { $("#revQR").innerHTML = `<p class="small muted">Sin internet no se dibujó el QR: use el código.</p>`; });
  $$("[data-rq]").forEach(c => c.onchange = () => R[c.dataset.rq] = c.checked);
  $("#rvAbrir").onclick = () => ir("revisar"); $("#rvMis") && ($("#rvMis").onclick = () => ir("revisar", { lista: true }));
  $("#rvGen").onclick = async ev => { const b = ev.currentTarget; b.disabled = true; b.textContent = "Preparando…";
    try { const T = trimActual(), p = await paqueteVisita(g, T, R); p.resumen = `${grNom(g)} · ${pl(p.planes.length, "planeación", "planeaciones")} · ${p.grupo.n} alumnos · ${fCorta(p.per.ini)} al ${fCorta(p.per.fin)}`;
      const z = await zip(JSON.stringify(p)); if (DEMO) REV_DEMO = { paq: z.s, z: z.z, docente: p.docente.nombre, gen: p.gen };
      b.textContent = "Subiendo…"; const j = await aulaPost("ulamaRevSubir", { paq: z.s, z: z.z, nombre: yo().nombre, correo: yo().correo });
      D.cfg.revQR = { codigo: j.codigo, vence: j.vence, resumen: p.resumen }; guardar(); re(); toast("<b>Código listo.</b> Muéstreselo a quien le visita.", 3500); }
    catch (e) { b.disabled = false; b.innerHTML = `${ic("qr", 18)} Generar código QR`; dlg(`<h3>No se pudo generar el código</h3><p class="mb">${esc(e.message)}</p><div class="fila fin"><button class="btn p" id="rfX">Entendido</button></div>`, w => w.querySelector("#rfX").onclick = cerrarDlg); } };
  if (q && $("#rvX")) { $("#rvX").onclick = () => { delete D.cfg.revQR; guardar(); re(); };
    $("#rvCop").onclick = async () => { try { await navigator.clipboard.writeText(REV_URL(q.codigo)); toast("Enlace copiado."); } catch (e) { prompt("Copie el enlace:", REV_URL(q.codigo)); } }; } };

/* ---------- quien revisa ---------- */
const ASPECTOS = [["plan", "Planeación didáctica", "Contenidos y PDA del grado, metodología, secuencia de sesiones, producto y criterios de evaluación."],
  ["av", "Avance del programa", "Contenidos del Programa Sintético trabajados en el ciclo y cobertura por campo formativo."],
  ["clase", "Desarrollo de la clase", "Inicio, desarrollo y cierre; participación de los alumnos; manejo del tiempo y de los materiales."],
  ["eval", "Evaluación formativa", "Registros en clase, retroalimentación, uso de criterios y calificaciones del trimestre."],
  ["asis", "Asistencia y registro", "Pase de lista diario y seguimiento de faltas."],
  ["incl", "Ambiente e inclusión", "Ambiente de respeto, ajustes razonables y atención a quienes requieren apoyo."]];
const SEM = [["v", "Adecuado", "#1E8E5A"], ["a", "En proceso", "#C98A0B"], ["r", "Requiere atención", "#C2362B"]];
let RV = null; const visitas = () => LS("aula-visitas") || [], guardarVisitas = L => { try { localStorage.setItem("aula-visitas", JSON.stringify(L.slice(-30))); } catch (e) { toast("No hay espacio para guardar la revisión."); } };
const rvGuardar = () => { const L = visitas().filter(x => x.id !== RV.id); L.push(RV); guardarVisitas(L); };
async function abrirCodigo(cod) { cod = String(cod || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); if (cod.length !== 6) return toast("El código tiene 6 letras o números.");
  toast("Abriendo la revisión…", 6000);
  try { const j = await aulaPost("ulamaRevBajar", { codigo: cod }), p = JSON.parse(await unzip(j.paq, j.z)); if (p.t !== "aula-rev") throw new Error("Ese código es de otra app (Ulama). Ábralo en Ulama · Supervisión.");
    RV = visitas().find(x => x.codigo === cod) || { id: uid(), codigo: cod, abierta: new Date().toISOString(), fecha: hoy(), sem: {}, obs: {}, fort: "", opor: "", acu: "", rev: LS("aula-revisor") || { nombre: yo().nombre, cargo: "" }, firma: "" };
    RV.p = p; rvGuardar(); ir("revisar", { id: RV.id, tab: "res" }, S.v === "revisar"); toast(`Revisión de <b>${esc(p.docente.nombre)}</b>.`); }
  catch (e) { toast(esc(e.message), 4500); } }
function barras(L) { const mx = 10; return `<div class="bars">${L.map(([t, v]) => `<div class="bar"><span>${esc(t)}</span><i style="width:${v == null ? 0 : Math.max(4, (v - 4) / (mx - 4) * 100)}%;background:${colCal(v)}"></i><b>${v == null ? "—" : v.toFixed(1)}</b></div>`).join("")}</div>`; }
VISTAS.revisar = () => { if (S.id && (!RV || RV.id !== S.id)) RV = visitas().find(x => x.id === S.id) || null;
  if (!RV || S.lista) { const L = visitas().slice().reverse();
    return barra("Visita de acompañamiento", "Revisar a un docente") + `<main class="wrap"><section class="card mt"><h3>Escriba el código</h3><p class="small muted mb">El docente lo genera en su Tlamatini Aula (dura 6 horas). También puede escanear su QR con la cámara del celular.</p>
     <div class="fila" style="flex-wrap:nowrap"><input id="rcC" maxlength="7" placeholder="ABC123" style="font:700 26px/1 inherit;letter-spacing:.2em;text-transform:uppercase;text-align:center;flex:1;min-width:0" autocomplete="off"><button class="btn p" id="rcOk">Abrir</button></div></section>
     ${L.length ? `<h2 class="sec-t">Mis revisiones</h2><div class="lista">${L.map(v => `<button class="it btnit" data-rv="${v.id}"><span class="av">${ic("persona", 18)}</span><span class="tx"><b>${esc(v.p.docente.nombre)}</b><small>${esc(v.p.grupo.nom)} · ${esc(v.p.escuela.nombre)} · ${fCorta(v.fecha)}${v.cerrada ? " · Cerrada" : ""}${v.enviado ? " · Enviada" : ""}</small></span>${ic("sig", 16)}</button>`).join("")}</div>` : ""}</main>`; }
  const p = RV.p, tab = S.tab || "res", TABS = [["res", "Resumen"]].concat(p.av ? [["av", "Avance del programa"]] : []).concat([["plan", "Planeación"], ["asis", "Asistencia"], ["eval", "Evaluación"], ["fotos", "Evidencias"], ["cierre", "Cierre"]]);
  let cuerpo = "";
  if (tab === "res") { const ses = p.planes.flatMap(x => x.ses), dadas = ses.filter(s => s.h).length, ev = ses.filter(s => s.r).length;
    let as = 0, tot = 0; (p.asis ? p.asis.al : []).forEach(a => [...a.m].forEach(c => { if (c === "-") return; tot++; if (c === "P" || c === "R") as++; }));
    const prom = p.ev ? p.ev.campos.map((c, i) => { const v = p.ev.al.map(a => a.cal[i]).filter(x => x != null); return [c, v.length ? v.reduce((x, y) => x + y, 0) / v.length : null]; }) : [];
    cuerpo = `<div class="kpis mt"><div class="kpi"><b>${p.planes.length}</b><span>Proyectos</span></div><div class="kpi"><b>${dadas}/${ses.length}</b><span>Sesiones dadas</span></div><div class="kpi"><b>${tot ? Math.round(100 * as / tot) + "%" : "—"}</b><span>Asistencia</span></div><div class="kpi"><b>${p.ev ? p.ev.reg : "—"}</b><span>Registros de evaluación</span></div>${p.av ? `<div class="kpi"><b>${p.av.pct}%</b><span>Avance del programa</span></div>` : ""}</div>
     <section class="card mt"><p><b>Escuela:</b> ${esc(p.escuela.nombre)}${p.escuela.cct ? " · " + esc(p.escuela.cct) : ""}${p.escuela.turno ? " · " + esc(p.escuela.turno) : ""}</p><p><b>Grupo:</b> ${esc(p.grupo.nom)} · ${p.grupo.n} alumnos${p.grupo.nee ? ` · ${p.grupo.nee} con ajustes razonables` : ""}</p><p><b>Periodo:</b> ${esc(p.per.n)}, ${fCorta(p.per.ini)} al ${fCorta(p.per.fin)}</p><p class="small muted mt">${pl(ev, "sesión", "sesiones")} con registro de evaluación · ${pl(p.fotos.length, "evidencia", "evidencias")} · ${pl(p.din, "dinámica propia", "dinámicas propias")}</p></section>
     ${prom.length ? `<h2 class="sec-t">Promedio del grupo por ${p.grupo.nivel === "sec" ? "disciplina" : "campo formativo"}</h2><section class="card">${barras(prom)}</section>` : ""}`; }
  if (tab === "plan") cuerpo = p.planes.map((x, i) => `<section class="card mt"><h3>${esc(x.titulo)}</h3><p class="small muted">${esc(x.campo)} · ${esc(x.metodo)} · Escenario ${esc(x.esc)} · ${x.ses.length} sesiones de ${x.min} min · desde ${fCorta(x.ini)}</p>
      ${x.cont.map(c => `<p class="small mt"><b>Contenido:</b> ${esc(c)}</p>`).join("")}${Object.entries(x.pdas || {}).map(([k, t]) => `<p class="small"><b>PDA ${k}.°:</b> ${esc(t)}</p>`).join("")}${x.prop ? `<p class="small"><b>Propósito:</b> ${esc(x.prop)}</p>` : ""}${x.prod ? `<p class="small"><b>Producto:</b> ${esc(x.prod)}</p>` : ""}
      <details class="mt"><summary><b>Sesiones</b> (${x.ses.filter(s => s.h).length} dadas, ${x.ses.filter(s => s.r).length} evaluadas)</summary>${x.ses.map((s, k) => `<div class="rv-ses"><b>${k + 1}. ${esc(s.fase)}</b> <small class="muted">${s.f ? fCorta(s.f) : ""}${s.h ? " · dada" : ""}${s.r ? " · evaluada" : ""}</small>${s.ini ? `<p class="small"><b>Inicio:</b> ${esc(s.ini)}</p>` : ""}<p class="small"><b>Desarrollo:</b> ${esc(s.des).replace(/\n/g, "<br>")}</p>${s.cie ? `<p class="small"><b>Cierre:</b> ${esc(s.cie)}</p>` : ""}<p class="small"><b>Evaluación:</b> ${esc(s.ev)}</p></div>`).join("")}</details></section>`).join("") || `<div class="vacio mt">No compartió planeaciones de este periodo.</div>`;
  if (tab === "asis") cuerpo = !p.asis ? `<div class="vacio mt">No compartió el pase de lista.</div>` : !p.asis.dias.length ? `<div class="vacio mt">No hay pase de lista en el periodo.</div>` : `<div class="tabla-c mt"><table class="tabla asis-t"><thead><tr><th>Alumno(a)</th>${p.asis.dias.map(k => `<th class="c">${dF(k).getDate()}<br><small>${MES[dF(k).getMonth()]}</small></th>`).join("")}<th class="c">%</th></tr></thead><tbody>${p.asis.al.map(a => { const v = [...a.m].filter(c => c !== "-"), as = v.filter(c => c === "P" || c === "R").length;
      return `<tr><td>${esc(a.n)}</td>${[...a.m].map(c => `<td class="c m-${c}">${c === "-" ? "" : c}</td>`).join("")}<td class="c"><b>${v.length ? Math.round(100 * as / v.length) : "—"}</b></td></tr>`; }).join("")}</tbody></table></div><p class="small muted mt">P asistió · R retardo · F falta · J justificada</p>`;
  if (tab === "eval") cuerpo = !p.ev ? `<div class="vacio mt">No compartió la evaluación.</div>` : `<div class="tabla-c mt"><table class="tabla"><thead><tr><th>Alumno(a)</th>${p.ev.campos.map(c => `<th class="c" title="${esc(c)}">${esc(p.grupo.nivel === "sec" ? abrArea(c) : c.split(" ")[0])}</th>`).join("")}<th class="c">Reg.</th><th class="c">Faltas</th></tr></thead><tbody>${p.ev.al.map(a => `<tr><td>${esc(a.n)}</td>${a.cal.map(v => `<td class="c"><b style="color:${colCal(v)}">${v ?? "—"}</b></td>`).join("")}<td class="c">${a.nreg}</td><td class="c">${a.falt}</td></tr>`).join("")}</tbody></table></div>`;
  if (tab === "av" && p.av) cuerpo = avRevisarHTML(p.av);
  if (tab === "fotos") cuerpo = p.fotos.length ? `<div class="fotos mt">${p.fotos.map(f => `<div class="foto"><img src="${f.u}" alt=""><span>${esc(f.t)}<small>${fCorta(f.f)}</small></span></div>`).join("")}</div>` : `<div class="vacio mt">No compartió evidencias.</div>`;
  if (tab === "cierre") cuerpo = `<p class="small muted mt">Valore cada aspecto con el semáforo y anote lo observado. Al final firme y genere el informe para el docente.</p>
    ${ASPECTOS.map(([k, t, d]) => `<section class="card mt"><h3>${t}</h3><p class="small muted">${d}</p><div class="sem mt">${SEM.map(([s, n, c]) => `<button data-sm="${k}" data-sv="${s}" style="--c:${c}" aria-pressed="${RV.sem[k] === s}">${n}</button>`).join("")}</div><textarea class="area mt" data-so="${k}" style="min-height:64px" placeholder="Observaciones">${esc(RV.obs[k] || "")}</textarea></section>`).join("")}
    <section class="card mt"><label class="campo"><span>Fortalezas</span><textarea class="area" id="rcF">${esc(RV.fort)}</textarea></label><label class="campo"><span>Áreas de oportunidad</span><textarea class="area" id="rcO">${esc(RV.opor)}</textarea></label><label class="campo"><span>Acuerdos y recomendaciones</span><textarea class="area" id="rcA">${esc(RV.acu)}</textarea></label></section>
    <section class="card mt"><h3>Quien revisa</h3><div class="dos"><label class="campo"><span>Nombre</span><input id="rcN" value="${esc(RV.rev.nombre)}"></label><label class="campo"><span>Cargo</span><input id="rcK" value="${esc(RV.rev.cargo)}" placeholder="Supervisor(a), Director(a), ATP"></label></div>
     <div class="campo"><span>Firma</span><canvas id="rcFi" class="firma-c" width="600" height="200"></canvas><div class="fila"><button class="btn s" id="rcFl">Borrar firma</button></div></div></section>
    <div class="fila mt2"><button class="btn p" id="rcInf">${ic("impr", 16)} Ver e imprimir el informe</button><button class="btn" id="rcEnv">${ic("doc", 16)} Enviar al docente</button></div>
    <div class="fila mt"><button class="btn s r" id="rcDel">${ic("basura", 16)} Descartar esta revisión</button></div>`;
  return barra("Revisión · " + esc(p.grupo.nom), esc(p.docente.nombre)) + `<main class="wrap"><div class="chips mt tabs-rv">${TABS.map(([k, t]) => `<button class="chip" data-tb="${k}" aria-pressed="${tab === k}">${t}</button>`).join("")}</div>${cuerpo}</main>`; };
ENLAZAR.revisar = () => {
  if (!RV || S.lista) { const go = () => abrirCodigo(val("rcC")); $("#rcOk").onclick = go; $("#rcC").onkeydown = e => { if (e.key === "Enter") go(); };
    $$("[data-rv]").forEach(b => b.onclick = () => { RV = visitas().find(x => x.id === b.dataset.rv); ir("revisar", { id: RV.id, tab: "res" }); }); return; }
  $$("[data-tb]").forEach(b => b.onclick = () => { S.tab = b.dataset.tb; pintar(); scrollTo(0, 0); });
  if ((S.tab || "res") !== "cierre") return;
  $$("[data-sm]").forEach(b => b.onclick = () => { RV.sem[b.dataset.sm] = RV.sem[b.dataset.sm] === b.dataset.sv ? "" : b.dataset.sv; rvGuardar(); re(); });
  $$("[data-so]").forEach(t => t.onchange = () => { RV.obs[t.dataset.so] = t.value; rvGuardar(); });
  [["rcF", "fort"], ["rcO", "opor"], ["rcA", "acu"]].forEach(([id, k]) => $("#" + id).onchange = e => { RV[k] = e.target.value; rvGuardar(); });
  const rv = () => { RV.rev = { nombre: val("rcN").trim(), cargo: val("rcK").trim() }; try { localStorage.setItem("aula-revisor", JSON.stringify(RV.rev)); } catch (e) {} rvGuardar(); }; $("#rcN").onchange = rv; $("#rcK").onchange = rv;
  firmaCanvas($("#rcFi"), RV.firma, u => { RV.firma = u; rvGuardar(); }); $("#rcFl").onclick = () => { RV.firma = ""; rvGuardar(); re(); };
  $("#rcInf").onclick = () => { RV.cerrada = true; rvGuardar(); imprimir(docVisita(RV)); };
  $("#rcEnv").onclick = () => enviarVisita(RV);
  $("#rcDel").onclick = async () => { if (!(await confirmar("Se borrará esta revisión de este dispositivo.", "Descartar"))) return; guardarVisitas(visitas().filter(x => x.id !== RV.id)); RV = null; ir("revisar", { lista: true }, true); }; };
function firmaCanvas(c, ini, alCambiar) { const x = c.getContext("2d"); x.lineWidth = 3.2; x.lineCap = "round"; x.strokeStyle = "#13244A"; let on = false, n = 0;
  if (ini) { const im = new Image(); im.onload = () => x.drawImage(im, 0, 0, c.width, c.height); im.src = ini; }
  const pt = e => { const r = c.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; return [(t.clientX - r.left) * c.width / r.width, (t.clientY - r.top) * c.height / r.height]; };
  const ini_ = e => { e.preventDefault(); on = true; x.beginPath(); x.moveTo(...pt(e)); }, mov = e => { if (!on) return; e.preventDefault(); x.lineTo(...pt(e)); x.stroke(); n++; }, fin = () => { if (!on) return; on = false; if (n) alCambiar(c.toDataURL("image/png")); };
  c.addEventListener("pointerdown", ini_); c.addEventListener("pointermove", mov); window.addEventListener("pointerup", fin, { once: false }); c.style.touchAction = "none"; }
function docVisita(v) { const p = v.p, semDe = s => SEM.find(x => x[0] === s);
  return `<div class="doc">${encabezado({ escuela: p.escuela.nombre, cct: p.escuela.cct, turno: p.escuela.turno, loc: p.escuela.loc }, "Informe de visita de acompañamiento")}
  <div class="datos"><span><b>Docente:</b> ${esc(p.docente.nombre)}</span><span><b>Grupo:</b> ${esc(p.grupo.nom)} (${p.grupo.n} alumnos)</span><span><b>Fecha de la visita:</b> ${fCorta(v.fecha)} ${v.fecha.slice(0, 4)}</span><span><b>Periodo revisado:</b> ${esc(p.per.n)}, ${fCorta(p.per.ini)} al ${fCorta(p.per.fin)}</span><span><b>Revisó:</b> ${esc(v.rev.nombre)}${v.rev.cargo ? ", " + esc(v.rev.cargo) : ""}</span></div>
  <table><thead><tr><th style="width:26%">Aspecto</th><th class="c" style="width:16%">Valoración</th><th>Observaciones</th></tr></thead><tbody>${ASPECTOS.map(([k, t]) => { const s = semDe(v.sem[k]); return `<tr><td><b>${t}</b></td><td class="c">${s ? `<span class="sem-p" style="background:${s[2]}"></span> ${s[1]}` : "—"}</td><td>${esc(v.obs[k] || "").replace(/\n/g, "<br>")}</td></tr>`; }).join("")}</tbody></table>
  ${v.fort ? `<h2>Fortalezas</h2><p>${esc(v.fort).replace(/\n/g, "<br>")}</p>` : ""}${v.opor ? `<h2>Áreas de oportunidad</h2><p>${esc(v.opor).replace(/\n/g, "<br>")}</p>` : ""}${v.acu ? `<h2>Acuerdos y recomendaciones</h2><p>${esc(v.acu).replace(/\n/g, "<br>")}</p>` : ""}
  <p class="nota">Revisión formativa con la información que el docente compartió desde Tlamatini Aula: ${pl(p.planes.length, "planeación", "planeaciones")}, ${p.asis ? pl(p.asis.dias.length, "día", "días") + " de pase de lista" : "sin pase de lista"}, ${p.ev ? pl(p.ev.reg, "registro", "registros") + " de evaluación" : "sin evaluación"}, ${pl(p.fotos.length, "evidencia", "evidencias")}${p.av ? ` y avance del programa de ${p.av.pct}% (${p.av.ok} de ${p.av.n} contenidos)` : ""}.</p>${p.av ? avInformeHTML(p.av) : ""}
  <table class="firmas"><tr><td>${v.firma ? `<img src="${v.firma}" style="height:60px;display:block;margin:-66px auto 6px">` : ""}${esc(v.rev.nombre)}<br>${esc(v.rev.cargo || "Quien revisa")}</td><td>${esc(p.docente.nombre)}<br>Docente</td></tr></table></div>`; }
function cssDoc() { let t = ""; for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (/\.doc\b|\.sem-p/.test(r.cssText)) t += r.cssText + "\n"; } catch (e) {} } return t.replace(/\.doc\b/g, ".doc"); }
function enviarVisita(v) { const p = v.p, para = p.docente.correo || "";
  dlg(`<h3>Enviar el informe al docente</h3><p class="small muted mb">Llega en PDF desde el correo de la Supervisión. Con el código de revisión solo se puede enviar al correo del docente revisado.</p>
   <label class="campo"><span>Para</span><input id="evP" type="email" value="${esc(para)}"></label><label class="campo"><span>Con copia <small>(opcional, hasta 3, separados por coma)</small></span><input id="evC" placeholder="direccion@bcedu.mx"></label>
   <label class="campo"><span>Mensaje</span><textarea id="evM" class="area">${esc(`${/^Mtra/.test(p.docente.nombre) ? "Estimada" : "Estimado(a)"} ${p.docente.nombre}:\n\nLe comparto el informe de la visita de acompañamiento del ${fCorta(v.fecha)}. Gracias por su disposición y por el trabajo con su grupo.\n\nAtentamente,\n${v.rev.nombre}${v.rev.cargo ? "\n" + v.rev.cargo : ""}`)}</textarea></label>
   <div class="fila fin"><button class="btn" id="evX">Cancelar</button><button class="btn p" id="evOk">Enviar</button></div>`, w => {
    w.querySelector("#evX").onclick = cerrarDlg;
    w.querySelector("#evOk").onclick = async () => { const P = val("evP").split(/[,;\s]+/).filter(Boolean), C = val("evC").split(/[,;\s]+/).filter(Boolean); if (!P.length) return toast("Escriba el correo del docente.");
      toast("Enviando…", 8000); try { await aulaPost("efEnviar", { app: "aula", rev: v.codigo, quien: { nombre: v.rev.nombre }, para: P, cc: C, asunto: "Informe de visita de acompañamiento · " + p.grupo.nom, mensaje: val("evM"), html: docVisita(v), css: cssDoc(), archivo: "informe-visita-" + v.fecha });
        v.enviado = { a: P.join(", "), f: new Date().toISOString() }; v.cerrada = true; rvGuardar(); cerrarDlg(); re(); toast(`<b>Informe enviado</b> a ${esc(P.join(", "))}.`, 4000); }
      catch (e) { toast(esc(e.message), 5000); } }; }); }

/* =================================================================== ADMINISTRACIÓN (Supervisión) */
const esAdmin = () => !!(LS("gh-token") || (LS("tequio-pase") || {}).rol === "admin" || (LS("tequio.cfg") || {}).k);
VISTAS.admin = () => { if (!esAdmin()) return VISTAS.inicio(); const A = S.A = S.A || {}, L = A.lista;
  return barra("Tlamatini Aula", "Administración") + `<main class="wrap">
  <section class="portada">${marca()}<h1>Panel de la Supervisión</h1><p>Estado del servidor, banco de dinámicas de la zona y accesos de los docentes.</p></section>
  <h2 class="sec-t">Servidor de la zona</h2><section class="card">${A.srv ? (A.srv.ok ? `<p><b style="color:${A.srv.version >= 68 ? "#1E8E5A" : "#C2362B"}">Versión ${A.srv.version}</b> · ${esc(A.srv.cuenta || "")}</p><p class="small mt">${A.srv.version >= 68 ? "Listo para Tlami, dinámicas compartidas y envío de informes de visita." : "<b>Falta actualizar a la versión 68</b> para que funcionen Tlami, las dinámicas compartidas y el envío de informes de visita."}</p>` : `<p class="small">No respondió: ${esc(A.srv.err)}</p>`) : `<p class="small muted">Revisando…</p>`}
   <div class="fila mt"><button class="btn s" id="adR">Revisar de nuevo</button><button class="btn s tlami-b" id="adT">${ic("chispa", 14)} Probar Tlami</button></div></section>
  <h2 class="sec-t">Dinámicas compartidas por la zona<small>Puede retirar las que no sean adecuadas</small></h2>
  ${!L ? `<p class="small muted">Cargando…</p>` : L.err ? `<section class="card"><p class="small">${esc(L.err)}</p></section>` : L.length ? `<div class="lista">${L.map(d => `<div class="it"><span class="tx"><b>${esc(d.n)}</b><small>${esc(d.autor || "")}${d.escuela ? " · " + esc(d.escuela) : ""} · ${d.creado ? fCorta(d.creado) : ""} · ${(DIN_CATS[d.cat] || [""])[0]}</small></span><button class="btn s" data-adv="${esc(d.id)}">Ver</button><button class="btn s r" data-adx="${esc(d.id)}">Retirar</button></div>`).join("")}</div>` : `<section class="card"><p class="small muted">Todavía nadie comparte dinámicas.</p></section>`}
  <h2 class="sec-t">Acceso de los docentes</h2><section class="card"><p class="small">Los docentes de la Zona 050 entran con el <b>mismo enlace personal de Tlamatini</b> que les llega por correo (en Tequio → Personal → «Enlaces de Tlamatini» puede reenviarlo o anularlo).</p>
   <p class="small mt">Para otros docentes o una zona completa, genere un <b>enlace de acceso</b> en el panel de accesos de Tlamatini: también abre Tlamatini Aula. Los directores, ATP y supervisores pueden abrir códigos de visita sin enlace.</p>
   <div class="fila mt"><a class="btn s" href="../tequio/" target="_blank" rel="noopener">${ic("grupo", 16)} Abrir Tequio</a><a class="btn s" href="${TLM}" target="_blank" rel="noopener">${ic("doc", 16)} Abrir Tlamatini</a><button class="btn s" id="adD">${ic("play", 16)} Copiar enlace de demostración</button></div></section>
  <div class="fila mt2"><button class="btn" id="adI">${ic("atras", 16)} Ir a mi aula</button></div>${pie()}</main>`; };
ENLAZAR.admin = () => { if (!esAdmin()) return; const A = S.A;
  const srv = async () => { const s = srvAula(); if (!s) { A.srv = { ok: false, err: "no se encontró la dirección del servidor" }; return re(); }
    try { const r = await fetch(s.s, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion: "estadoInstalacion" }) }); const j = await r.json(); A.srv = { ok: !!j.ok, version: +j.version || 0, cuenta: j.cuenta, err: j.mensaje }; }
    catch (e) { A.srv = { ok: false, err: e.message }; } if (S.v === "admin") re(); };
  const lista = async () => { try { const j = await aulaPost("aulaDinLista", {}, 30000); A.lista = j.lista || []; } catch (e) { A.lista = []; A.lista.err = e.message; } if (S.v === "admin") re(); };
  if (!A.srv) { A.srv = null; srv(); } if (!A.lista) lista();
  $("#adR").onclick = () => { A.srv = null; A.lista = null; re(); srv(); lista(); };
  $("#adT").onclick = async () => { tlamiEspera("Probando la conexión con la IA."); try { const j = await aulaPost("aulaIA", { modo: "valoracion", grados: [3], campo: "Lenguajes", texto: "En Lenguajes, [ALUMNO] lee con fluidez textos breves y comenta lo que entiende; necesita fortalecer la escritura de párrafos." });
      dlg(`<h3>Tlami responde ✓</h3><p class="mb">${esc((j.r || {}).texto || "")}</p><div class="fila fin"><button class="btn p" id="okT">Listo</button></div>`, v => v.querySelector("#okT").onclick = cerrarDlg); } catch (e) { tlamiError(e); } };
  $$("[data-adv]").forEach(b => b.onclick = () => { ZONA = (A.lista || []).map(d => Object.assign({ zona: true }, d)); ir("dinamica", { id: b.dataset.adv }); });
  $$("[data-adx]").forEach(b => b.onclick = async () => { if (!(await confirmar("La dinámica dejará de verse en el banco de la zona.", "Retirar"))) return;
    try { await aulaPost("aulaDinRetirar", { id: b.dataset.adx }); A.lista = A.lista.filter(d => d.id !== b.dataset.adx); ZONA = null; re(); toast("Dinámica retirada."); } catch (e) { toast(esc(e.message), 4000); } });
  $("#adD").onclick = async () => { const u = new URL("#demo", location.href.split("#")[0]).href; try { await navigator.clipboard.writeText(u); toast("Enlace de demostración copiado."); } catch (e) { prompt("Copie el enlace:", u); } };
  $("#adI").onclick = () => ir("inicio", {}, true); };

/* =================================================================== AJUSTES */
VISTAS.ajustes = () => barra("Tlamatini Aula", "Ajustes y respaldo") + `<main class="wrap">
  <section class="card mt"><h3>Sus datos</h3><label class="campo"><span>Nombre (como aparece en sus documentos)</span><input id="yN" value="${esc(yo().nombre)}"></label><label class="campo"><span>Correo</span><input id="yC" type="email" value="${esc(yo().correo)}"></label><div class="fila fin"><button class="btn p s" id="yOk">Guardar</button></div></section>
  <section class="card mt"><h3>Mis grupos</h3><div class="lista">${D.grupos.map(g => `<button class="it btnit" data-ge="${g.id}"><span class="av">${ic("grupo", 18)}</span><span class="tx"><b>${esc(grNom(g))}</b><small>${esc(g.escuela)} · ${activos(g).length} alumnos</small></span>${ic("lapiz", 16)}</button>`).join("")}</div><div class="fila mt"><button class="btn s" id="yG">${ic("mas", 16)} Agregar grupo</button></div></section>
  ${esAdmin() ? `<section class="card mt"><h3>Supervisión</h3><p class="small muted mb">Servidor, banco de dinámicas de la zona y accesos.</p><button class="btn" id="yAdm">${ic("ajustes", 16)} Panel de administración</button></section>` : ""}
  <section class="card mt"><h3>Respaldo</h3><p class="small muted mb">Todo se guarda en este dispositivo y solo usted lo ve. Descargue una copia de vez en cuando (incluye sus fotos y las páginas de su guía), por si se daña o cambia de teléfono.</p><div class="fila"><button class="btn" id="yR">${ic("bajar", 16)} Descargar respaldo</button><button class="btn" id="yL">${ic("subir", 16)} Cargar respaldo</button><input type="file" id="fR" accept=".json" hidden></div></section>
  <section class="card mt"><h3>Vincular con una computadora</h3><p class="small muted mb">Trabaje en la computadora de la escuela con sus datos de este celular (o al revés). Lo que haga en uno se guarda en el otro. Al desvincular, sus datos se borran de la computadora.</p><div class="fila"><button class="btn" id="yV">${window.TLMVIN && TLMVIN.activo() ? "Vinculación activa" : "Vincular con una computadora"}</button></div></section>${pie()}</main>`;
ENLAZAR.ajustes = () => { $("#yAdm") && ($("#yAdm").onclick = () => ir("admin")); $("#yOk").onclick = () => { D.docente.nombre = val("yN").trim(); D.docente.correo = val("yC").trim(); guardar(); toast("Datos guardados."); };
  $$("[data-ge]").forEach(b => b.onclick = () => ir("grupoForm", { id: b.dataset.ge })); $("#yG").onclick = () => ir("grupoForm");
  $("#yR").onclick = async () => { const F = {}; for (const id of [...D.fotos.map(f => f.id), ...(D.avr || []).flatMap(r => r.fotos || [])]) { const u = await fotoGet(id); if (u) F[id] = u; } const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(Object.assign({}, D, { __fotos: F }))], { type: "application/json" })); a.download = `respaldo-tlamatini-aula-${hoy()}.json`; a.click(); };
  $("#yV").onclick = () => { if (window.TLMVIN) { if (TLMVIN.activo()) return toast("Para desvincular use el botón de arriba a la derecha."); TLMVIN.abrir(); } };
  $("#yL").onclick = () => $("#fR").click(); $("#fR").onchange = async e => { try { const x = JSON.parse(await e.target.files[0].text()); if (!x.v || !Array.isArray(x.grupos)) throw 0; if (!(await confirmar("Se reemplazarán los datos de este dispositivo por los del respaldo.", "Cargar"))) return; const F = x.__fotos || {}; delete x.__fotos; for (const [id, u] of Object.entries(F)) { FOTO[id] = u; try { await idbOp("readwrite", st => st.put(u, id)); } catch (er) {} } D = Object.assign(VACIO(), x); guardar(); ir("inicio", {}, true); toast("Respaldo cargado."); } catch (er) { toast("Ese archivo no es un respaldo de Tlamatini Aula."); } }; };

/* =================================================================== ARRANQUE */
/* Con el enlace personal de Tlamatini: si la Supervisión ya tiene registrado su grado y grupo, se crea solo el grupo con los datos de su escuela */
let AUTO_G = "";
function gradosDe(t) { t = String(t || "").toUpperCase(); const r = t.match(/([1-6])\s*\.?\s*[°º]?\s*(?:-|–|AL|A)\s*([1-6])\s*\.?\s*[°º]/) || t.match(/([1-6])\s*-\s*([1-6])/);
  if (r && +r[2] > +r[1]) { const L = []; for (let i = +r[1]; i <= +r[2]; i++) L.push(i); return { grados: L, letra: "" }; }
  const L = [...new Set((t.match(/[1-6]/g) || []).map(Number))].sort(); if (!L.length) return null;
  const l = L.length === 1 ? (t.match(/[1-6]\s*\.?\s*[°º]?\s*\.?\s*([A-F])\b/) || [])[1] || "" : ""; return { grados: L, letra: l }; }
function autoGrupos() { if (DEMO || APP_PRE || APP_ESP || D.grupos.length || D.cfg.autoHecho) return; const t = LS("tlm-yo"); if (!t || !Array.isArray(t.escuelas)) return;
  const nuevos = []; t.escuelas.forEach(e => { if (/direct|subdirect|atp|asesor|f[ií]sica|usaer|apoyo|intend|secretar/i.test(e.funcion || "") && !/frente|grupo/i.test(e.funcion || "")) return; const x = gradosDe(e.grupo); if (!x) return;
    nuevos.push({ id: uid(), alumnos: [], cct: e.cct, escuela: "Escuela Primaria " + e.nombre, turno: e.turno || "", grados: x.grados, grupo: x.letra, dir: e.dir || "", cargoDir: e.cargo || "", loc: e.loc || "", mun: e.mun || "" }); });
  D.cfg.autoHecho = true; if (!nuevos.length) { guardar(); return; }
  D.grupos.push(...nuevos); D.gact = nuevos[0].id; const y = yo(); if (!D.docente.nombre) D.docente.nombre = y.nombre; if (!D.docente.correo) D.docente.correo = y.correo; guardar(); AUTO_G = nuevos[0].id; }
async function arrancarDatos() { autoGrupos(); if (CAP && !APP_PRE && !APP_ESP) { if (D.grupos.length) return; for (let i = 0; i < 100 && typeof capSembrar !== "function"; i++) await new Promise(r => setTimeout(r, 50)); if (typeof capSembrar === "function") return capSembrar(); }
  if (DEMO && APP_PRE && !D.grupos.length) { const g = { id: "gdemop", nivel: "pre", cct: "02DJN9999Z", escuela: "Jardín de Niños «Rosaura Zapata» (ejemplo)", turno: "Matutino", grados: [3], grupo: "A", dir: "Elena Ejemplo Rivas", cargoDir: "Directora", loc: "Camalú", alumnos: [] };
    ["Ana Sofía Ejemplo Ruiz", "Bruno Muestra Díaz", "Camila Ficticia López", "Diego Prueba Soto", "Elena Ejemplo Cruz", "Fernando Demo Ríos", "Gabriela Muestra Peña", "Hugo Ficticio Lara", "Itzel Ejemplo Mora", "Joaquín Prueba Vega"].forEach(n => g.alumnos.push({ id: uid(), nombre: n, g: 3 }));
    D.grupos.push(g); D.gact = g.id; D.docente.nombre = "Mtra. Laura Ejemplo Ruiz"; guardar(); return; }
  if (DEMO && APP_ESP) { if (!D.docente.nombre) { D.docente.nombre = "Mtra. Sofía Ejemplo Vega"; guardar(); } return; }
  if (DEMO && !D.grupos.length) { const g = { id: "gdemo", cct: "02DPR9999Z", escuela: "Escuela Primaria «Cuauhtémoc» (ejemplo)", turno: "Matutino", grados: [1, 2, 3], grupo: "A", dir: "Ramón Ejemplo Torres", cargoDir: "Director", loc: "Camalú", alumnos: [] };
    ["Ana Sofía Ejemplo Ruiz:1", "Bruno Muestra Díaz:1", "Camila Ficticia López:1", "Diego Prueba Soto:2", "Elena Ejemplo Cruz:2", "Fernando Demo Ríos:2", "Gabriela Muestra Peña:3", "Hugo Ficticio Lara:3", "Itzel Ejemplo Mora:3", "Joaquín Prueba Vega:3"].forEach(x => { const [n, gr] = x.split(":"); g.alumnos.push({ id: uid(), nombre: n, g: +gr }); });
    const g2 = { id: "gdemo2", nivel: "sec", mod: "general", discs: ["Matemáticas", "Formación Cívica y Ética"], cct: "02DES9999Z", escuela: "Escuela Secundaria General «Benito Juárez» (ejemplo)", turno: "Matutino", grados: [2], grupo: "B", dir: "Rosa Ejemplo Valdez", cargoDir: "Directora", loc: "Camalú", alumnos: [] };
    ["Alondra Ejemplo Ramos", "Brandon Muestra Castro", "Citlali Ficticia Ortiz", "Daniel Prueba Mendoza", "Estrella Ejemplo Núñez", "Francisco Demo Ibarra", "Guadalupe Muestra Salas", "Héctor Ficticio Rangel", "Iris Ejemplo Torres", "Jorge Prueba Arce"].forEach(n => g2.alumnos.push({ id: uid(), nombre: n, g: 2 }));
    D.grupos.push(g, g2); D.gact = g.id; D.docente.nombre = "Mtra. Laura Ejemplo Ruiz"; guardar(); } }
/* ---------- recordatorio amable de la lectura de la realidad (no es obligatoria) ---------- */
const lecPend = g => g && !APP_ESP && !g.lectura && !esSec(g);
function lecRecordatorioHTML(g) { if (!lecPend(g)) return ""; const hasta = ((D.cfg.lecLuego || {})[g.id]) || ""; if (hasta && hoy() < hasta) return "";
  return `<section class="card mt lec-rec"><h3>${ic("doc", 18)} Falta la lectura de la realidad de ${esc(grNom(g))}</h3><p class="small">Con ella, Tlami contextualiza sus planeaciones: el problema, los ejemplos y las actividades salen de su grupo y su comunidad. Puede subirla (PDF, Word o fotos) o escribirla aquí en unos minutos, aunque sea solo de su grupo.</p>
   <div class="fila mt"><label class="btn s p" style="cursor:pointer">${ic("bajar", 16)} Subirla<input type="file" id="lrF" multiple accept=".pdf,.docx,image/*" hidden></label><button class="btn s" id="lrE">${ic("lapiz", 16)} Escribirla aquí</button><button class="btn s" id="lrL">Después</button></div></section>`; }
function lecRecordatorioCablear(g) { if (!$("#lrE")) return; $("#lrF").onchange = e => { const L = [...e.target.files]; e.target.value = ""; if (L.length) lecSubir(g, L, re); };
  $("#lrE").onclick = () => lecGuiada(g, re); $("#lrL").onclick = () => { const d = new Date(); d.setDate(d.getDate() + 7); D.cfg.lecLuego = Object.assign({}, D.cfg.lecLuego, { [g.id]: iso(d) }); guardar(); re(); toast("Se lo recordamos en una semana."); }; }
let LEC_AVISO = false;
function lecRecordar(g, seguir) { if (!lecPend(g) || LEC_AVISO) return seguir(); LEC_AVISO = true;
  dlg(`<h3>Antes de planear: su lectura de la realidad</h3><p class="small">Su planeación saldrá <b>contextualizada</b> con su grupo y su comunidad si Tlami conoce su lectura de la realidad. No es obligatoria: puede seguir sin ella.</p>
    <div class="lista mt"><label class="it btnit" style="cursor:pointer"><span class="av">${ic("bajar", 18)}</span><span class="tx"><b>Subirla ahora</b><small>PDF, Word o fotos</small></span><input type="file" id="lrdF" multiple accept=".pdf,.docx,image/*" hidden></label>
     <button class="it btnit" id="lrdE"><span class="av">${ic("lapiz", 18)}</span><span class="tx"><b>Escribirla aquí</b><small>Unas preguntas sencillas, unos minutos</small></span></button>
     ${lecTlm(g) ? `<button class="it btnit" id="lrdT"><span class="av">${ic("check", 18)}</span><span class="tx"><b>Usar la que ya tengo en Tlamatini</b><small>${esc(lecTlm(g).desde)}</small></span></button>` : ""}</div>
    <div class="fila fin mt"><button class="btn" id="lrdS">Seguir sin ella</button></div>`, v => {
    v.querySelector("#lrdS").onclick = () => { cerrarDlg(); seguir(); };
    v.querySelector("#lrdE").onclick = () => lecGuiada(g, seguir);
    v.querySelector("#lrdT") && (v.querySelector("#lrdT").onclick = () => { const L = lecTlm(g); if (L) lecProcesar(g, L, seguir); });
    v.querySelector("#lrdF").onchange = e => { const L = [...e.target.files]; if (L.length) lecSubir(g, L, seguir); }; }); }
/* escribir la lectura de la realidad con preguntas guiadas */
function lecGuiada(g, listo) { const Q = [["Su grupo", "¿Cuántos alumnos son, de qué edades, cómo aprenden mejor y qué les interesa?", "Ej. 22 alumnos de 9 y 10 años; aprenden mejor en equipo y con actividades prácticas; les gusta el fútbol y los animales."],
    ["Su comunidad", "¿A qué se dedican las familias? ¿Qué lenguas se hablan? ¿Cómo es el lugar?", "Ej. La mayoría trabaja en los campos agrícolas; varias familias llegaron de Oaxaca; algunos hablan mixteco en casa."],
    ["Lo que más necesitan", "En aprendizajes y en convivencia, ¿qué les cuesta más?", "Ej. Comprensión lectora, resolver problemas con dos operaciones; respetar turnos."],
    ["Fortalezas y recursos", "¿Qué tienen a favor el grupo, la escuela y la comunidad?", "Ej. Son participativos; hay biblioteca de aula y patio amplio; las familias apoyan en las faenas."]];
  dlg(`<h3>Lectura de la realidad de ${esc(grNom(g))}</h3><p class="small muted mb">Conteste con sus palabras, con lo que usted ya conoce. Basta con unas líneas en cada pregunta.</p>
    ${Q.map(([t, q, ej], i) => `<label class="campo"><span><b>${t}</b> · ${q}</span><textarea class="area" id="lg${i}" style="min-height:70px" placeholder="${esc(ej)}"></textarea></label>`).join("")}
    <div class="fila fin mt"><button class="btn" id="lgX">Cancelar</button><button class="btn p" id="lgOk">${ic("check", 16)} Guardar</button></div>`, v => {
    v.querySelector("#lgX").onclick = cerrarDlg;
    v.querySelector("#lgOk").onclick = () => { const t = Q.map(([tt], i) => { const x = v.querySelector("#lg" + i).value.trim(); return x ? "- " + tt + ": " + x : ""; }).filter(Boolean).join("\n");
      if (t.replace(/\s/g, "").length < 40) return toast("Escriba al menos unas líneas para que Tlami conozca a su grupo.");
      g.lectura = { sint: t.slice(0, 3500), problemas: [], nombres: ["Escrita en Tlamatini Aula"], fecha: hoy(), sinIA: true }; guardar(); cerrarDlg();
      toast("<b>Lectura de la realidad guardada.</b> Sus planeaciones se contextualizarán con ella.", 4000); listo && listo(); }; }); }
window.addEventListener("hashchange", () => { if (/[#&](demo(?![\w-])|capacitacion\b|t=|acceso=|rev=|admin)/.test(location.hash)) location.reload(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
(async () => { $("#app").innerHTML = `<p style="margin-top:40vh;text-align:center;color:#6A5C4C">Abriendo Tlamatini Aula…</p>`; const rv = (location.hash.match(/[#&]rev=([A-Za-z0-9]{6})/) || [])[1], adm = /[#&]admin\b/.test(location.hash); if (rv || adm) history.replaceState(null, "", location.pathname);
  calendario(); ACCESO_OK = await acceso(); await arrancarDatos(); pintar(); if (AUTO_G && ACCESO_OK) { S = { v: "inicio" }; PILA.length = 0; ir("grupo", { id: AUTO_G, nuevo: true }); toast("<b>Ya está registrado su grupo</b> con los datos de su escuela. Ahora agregue a sus alumnos.", 5000); } { const mp = (location.hash.match(/[#&]plan=([\w-]+)/) || [])[1], pp = mp && ACCESO_OK && D.planes.find(x => x.id === decodeURIComponent(mp)); if (pp) { history.replaceState(null, "", location.pathname); if (pp.gid) D.gact = pp.gid; S = { v: "inicio" }; PILA.length = 0; ir("plan", { id: pp.id }); } }
  if (!rv && !adm && ACCESO_OK) setTimeout(invitarInstalar, AUTO_G ? 9000 : 1600); if (rv) { if (!ACC) ACC = LS("acc-cache"); S = { v: "revisar" }; abrirCodigo(rv); } else if (adm && ACCESO_OK && esAdmin()) { S = { v: "admin" }; pintar(); } })();
