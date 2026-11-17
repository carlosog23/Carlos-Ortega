/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Educación Física. Planear, pasar lista, evaluar en la clase y generar la evaluación del trimestre.
   Todo se guarda en el dispositivo (localStorage). El envío automático de correos usa el servidor de Tequio
   con el enlace de acceso de Tlamatini; si no hay enlace o internet, se abre el correo y el PDF para enviarlo a mano. */
"use strict";
const LIB = "../formatos-ppie/lib/", IMG_T = "../formatos-ppie/img/", ACCESO = "../formatos-ppie/formatos/acceso.json";
const TEQUIO_DEF = "https://script.google.com/macros/s/AKfycbyH4wcANu-w9zNKkVECYoRjF9DhJi6pKwLL2sK0jFxGqQwFKNs0yAJzcC0S3yX8yB4aLw/exec";
const CLAVE = "ulama-datos";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hoy = () => iso(new Date());
const hora = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const DSEM = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], DSEM_L = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"], MES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const dF = k => new Date(k + "T12:00:00");
const fCorta = k => { const d = dF(k); return `${DSEM[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}`; };
const fLarga = k => { const d = dF(k); return `${d.getDate()} de ${MES_L[d.getMonth()]} de ${d.getFullYear()}`; };
const sinClase = k => { const r = SIN_CLASE.find(([a, b]) => k >= a && k <= b); return r ? r[2] : null; };
const faseDe = g => g <= 2 ? 3 : g <= 4 ? 4 : 5;
const grNom = g => `${g.grado}.° ${g.grupo || ""}`.trim();
const corto = n => String(n || "").trim().split(/\s+/).slice(0, 2).join(" ");
const iniciales = n => String(n || "?").trim().split(/\s+/).slice(0, 2).map(x => x[0] || "").join("").toUpperCase();
const ic = (n, s = 20) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${ICONOS[n] || ""}</svg>`;
const ICONOS = {
  atras: '<path d="M15 18l-6-6 6-6"/>', mas: '<path d="M12 5v14M5 12h14"/>', silbato: '<circle cx="9" cy="14" r="5"/><path d="M13 11l8-4v4l-6 2"/><path d="M9 14h.01"/>',
  plan: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>', escuela: '<path d="M3 10l9-6 9 6"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  eval: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>', agenda: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/>',
  grupo: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5c3 0 5.5 1.7 5.5 4.5"/>',
  camara: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  lapiz: '<path d="M4 20h4L20 8l-4-4L4 16z"/>', basura: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', check: '<path d="M5 12l5 5 9-10"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', impr: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  nota: '<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4"/>', reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', baja: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  subir: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>', bajar: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>', play: '<path d="M7 4l13 8-13 8z"/>',
  ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', sup: '<circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/><path d="M16 4l2-2"/>'
};

/* ---------------- datos ---------------- */
const VACIO = () => ({ v: 1, docente: { nombre: "", trato: "", correo: "", tel: "" }, escuelas: [], grupos: [], planes: [], clases: [],
  cortes: [{ id: "t1", n: "Primer trimestre", ini: "2026-08-31", fin: "2026-11-27" }, { id: "t2", n: "Segundo trimestre", ini: "2026-11-30", fin: "2027-03-12" }, { id: "t3", n: "Tercer trimestre", ini: "2027-03-15", fin: "2027-07-06" }],
  cfg: { bienvenida: false } });
let D = cargar();
function cargar() { try { const x = JSON.parse(localStorage.getItem(CLAVE) || "null"); if (x && x.v) return Object.assign(VACIO(), x); } catch (e) {} return VACIO(); }
function guardar(sinMarca) { if (!sinMarca) { D.cfg.mod = new Date().toISOString(); if (typeof respaldoAuto === "function") respaldoAuto(); } try { localStorage.setItem(CLAVE, JSON.stringify(D)); } catch (e) { toast("<b>No se pudo guardar.</b> El dispositivo no tiene espacio."); } }
const escDe = id => D.escuelas.find(e => e.id === id), grDe = id => D.grupos.find(g => g.id === id), plDe = id => D.planes.find(p => p.id === id);
const gruposDe = escId => D.grupos.filter(g => g.escId === escId).sort((a, b) => (a.grado - b.grado) || String(a.grupo).localeCompare(b.grupo));
const activos = g => (g.alumnos || []).filter(a => !a.baja).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
const dirNombre = e => [e.dirTrato, e.director].filter(Boolean).join(" ");
const docNombre = () => [D.docente.trato, D.docente.nombre].filter(Boolean).join(" ");

/* ---------------- navegación ---------------- */
let S = { v: "inicio" }; const PILA = [];
function ir(v, p = {}, reemplazar) { if (!reemplazar) { PILA.push(S); history.pushState({ n: PILA.length }, ""); } S = Object.assign({ v }, p); pintar(); window.scrollTo(0, 0); }
/* avanzar un paso dentro de la clase, para que «atrás» regrese al paso anterior */
function pasoClase(n) { PILA.push(Object.assign({}, S)); history.pushState({ n: PILA.length }, ""); S.paso = n; S.crit = null; pintar(); window.scrollTo(0, 0); }
function atras() { S = PILA.pop() || { v: "inicio" }; pintar(); window.scrollTo(0, 0); }
window.addEventListener("popstate", () => { if (PILA.length || S.v !== "inicio") atras(); });
function pintar() {
  cerrarDlg();
  if (typeof ACCESO_OK !== "undefined" && !ACCESO_OK && S.v !== "acceso" && S.v !== "admin") S = { v: "acceso" };
  else if (!D.cfg.bienvenida && !["bienvenida", "acceso", "admin"].includes(S.v)) S = { v: "bienvenida", paso: 1 };
  const f = VISTAS[S.v] || VISTAS.inicio; $("#app").innerHTML = f(); (ENLAZAR[S.v] || (() => {}))();
  const b = $("#atras"); if (b) b.onclick = () => history.back();
}
const barra = (eb, t, der = "") => `<header class="top"><div class="top-in"><button class="back" id="atras" aria-label="Regresar">${ic("atras")}</button><div style="min-width:0"><div class="eb">${eb}</div><h1>${t}</h1></div><div class="der">${der}</div></div></header>`;
function toast(h, ms = 2600) { const t = $("#toast"); t.innerHTML = h; t.classList.add("ver"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("ver"), ms); }
function dlg(html, alAbrir) { cerrarDlg(); const v = document.createElement("div"); v.className = "velo"; v.id = "velo"; v.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
  v.addEventListener("click", e => { if (e.target === v) cerrarDlg(); }); document.body.appendChild(v); document.body.style.overflow = "hidden"; alAbrir && alAbrir(v); const f = v.querySelector("input,textarea,select"); if (f && !f.dataset.nofoco) setTimeout(() => f.focus(), 60); }
function cerrarDlg() { const v = $("#velo"); if (v) v.remove(); document.body.style.overflow = ""; }
function confirmar(msg, si = "Sí, continuar") { return new Promise(ok => { dlg(`<h3>¿Seguro?</h3><p class="mb">${esc(msg)}</p><div class="fila fin"><button class="btn" id="qNo">Cancelar</button><button class="btn r" id="qSi">${esc(si)}</button></div>`, v => {
  v.querySelector("#qNo").onclick = () => { cerrarDlg(); ok(false); }; v.querySelector("#qSi").onclick = () => { cerrarDlg(); ok(true); }; }); }); }
const val = id => (document.getElementById(id) || {}).value || "";

/* ---------------- agenda: fechas de clase por grupo ---------------- */
function diasGrupo(g) { const e = escDe(g.escId); return (g.dias && g.dias.length ? g.dias : (e && e.dias) || []).map(Number); }
function fechasClase(g, desde, n) { const dias = diasGrupo(g), out = []; if (!dias.length) return out; const d = dF(desde);
  for (let k = 0; k < 400 && out.length < n; k++, d.setDate(d.getDate() + 1)) { const x = iso(d); if (x > CICLO.fin) break; if (dias.includes(d.getDay()) && !sinClase(x)) out.push(x); } return out; }
function planesDeGrupo(gid) { return D.planes.filter(p => (p.grupos || []).includes(gid)).sort((a, b) => a.ini.localeCompare(b.ini)); }
function sesionesDadas(gid, pid) { return new Set(D.clases.filter(c => c.grupoId === gid && c.planId === pid && c.sesId).map(c => c.sesId)); }
/* La sesión que sigue: la primera no dada del plan vigente del grupo; con su fecha de agenda */
function siguienteSesion(gid) { const g = grDe(gid);
  for (const p of planesDeGrupo(gid)) { const dadas = sesionesDadas(gid, p.id), fechas = fechasClase(g, p.ini, p.sesiones.length);
    const i = p.sesiones.findIndex(s => !dadas.has(s.id)); if (i >= 0) return { plan: p, ses: p.sesiones[i], n: i + 1, fecha: fechas[i] || null }; }
  return null; }
function agendaDe(desde, hasta) { const out = [];
  D.grupos.forEach(g => planesDeGrupo(g.id).forEach(p => { const fechas = fechasClase(g, p.ini, p.sesiones.length), dadas = sesionesDadas(g.id, p.id);
    p.sesiones.forEach((s, i) => { const f = fechas[i]; if (f && f >= desde && f <= hasta) out.push({ f, g, p, s, n: i + 1, dada: dadas.has(s.id) }); }); }));
  return out.sort((a, b) => a.f.localeCompare(b.f) || (escDe(a.g.escId) || {}).nombre?.localeCompare((escDe(b.g.escId) || {}).nombre || "") || a.g.grado - b.g.grado); }

/* ---------------- instrumentos ---------------- */
const NIV_R = [[1, "Requiere apoyo"], [2, "En proceso"], [3, "Logrado"], [4, "Destacado"]];
const NIV_E = [[1, "Nunca"], [2, "A veces"], [3, "Casi siempre"], [4, "Siempre"]];
const TIPOS = { rubrica: "Rúbrica", cotejo: "Lista de cotejo", escala: "Escala estimativa" };
const minus = t => t ? t[0].toLowerCase() + t.slice(1) : t;
function etiquetaCorta(t) { let x = String(t).replace(/\.$/, ""); const re = /,|\s(para|ante|que implican|con base|a fin de|al|a partir)\s/g; let m; while ((m = re.exec(x))) { if (m.index > 25) { x = x.slice(0, m.index); break; } } const w = x.split(/\s+/); return w.length > 11 ? w.slice(0, 11).join(" ") + "…" : x; }
function criteriosDePDA(pdas) { const out = [];
  Object.entries(pdas).forEach(([gr, txt]) => { String(txt || "").split(/(?<=\.)\s+/).map(s => s.trim()).filter(s => s.length > 12).slice(0, 3)
    .forEach(s => out.push({ id: uid(), t: s, c: etiquetaCorta(s), gr })); });
  out.push({ id: uid(), t: "Participa con respeto, sigue los acuerdos del juego y cuida a sus compañeros.", c: "Respeta acuerdos y cuida a sus compañeros", gr: "todos" });
  return out; }
function descriptores(c) { const t = minus(c.t.replace(/\.$/, ""));
  return { 1: `Aún no lo logra; necesita ayuda constante del docente: ${t}.`, 2: `Lo logra en algunas situaciones de juego y con apoyo: ${t}.`, 3: `${c.t.replace(/\.$/, "")}.`, 4: `Lo logra con autonomía, propone variantes y ayuda a sus compañeros a lograrlo.` }; }
function normal(tipo, v) { v = Number(v); if (tipo === "cotejo") return v ? 1 : 0; return (v - 1) / 3; }

/* ---------------- planeación ---------------- */
function secuencia(n) { const B = EF_SESIONES.length; if (n <= 1) return [1]; if (n <= B) return Array.from({ length: n }, (_, i) => Math.round(i * (B - 1) / (n - 1)));
  const mid = [1, 2, 3, 4], s = [0]; for (let i = 0; s.length < n - 1; i++) s.push(mid[i % mid.length]); s.push(B - 1); return s; }
function crearPlan(c) { const idx = secuencia(c.n);
  const vistas = {}; const sesiones = idx.map((i, k) => { const b = JSON.parse(JSON.stringify(EF_SESIONES[i])); const vez = vistas[i] = (vistas[i] || 0) + 1;
    if (vez > 1) { b.t += vez === 2 ? " · segunda vuelta" : ` · vuelta ${vez}`; b.charla = "Retomamos lo que aprendimos la vez pasada. " + b.charla; if (b.ppal.length > 1) b.ppal = b.ppal.slice(vez % b.ppal.length).concat(b.ppal.slice(0, vez % b.ppal.length)); }
    return { id: uid(), est: b.est, t: b.t, para: b.para, act: b.act, ppal: b.ppal, calma: b.calma, charla: b.charla, cierre: b.cierre, eval: b.eval, planB: b.planB, mg: b.mg, nota: "" }; });
  const crit = criteriosDePDA(c.pdas); crit.forEach(x => x.d = descriptores(x));
  return { id: uid(), creado: hoy(), escId: c.escId, grupos: c.grupos, titulo: c.titulo, cont: c.cont, pdas: c.pdas, ini: c.ini, min: c.min, mat: c.mat, sesiones, criterios: crit, instr: c.instr || "rubrica", proposito: c.proposito }; }

/* ---------------- evaluación del periodo ---------------- */
function clasesEn(gid, ini, fin) { return D.clases.filter(c => c.grupoId === gid && c.fecha >= ini && c.fecha <= fin).sort((a, b) => a.fecha.localeCompare(b.fecha)); }
function calcAlumno(a, clases) { let asis = 0, falt = 0, ret = 0, just = 0, total = 0; const porCrit = {}, obs = [], sum = { s: 0, n: 0 }, mitad = [{ s: 0, n: 0 }, { s: 0, n: 0 }];
  clases.forEach((c, ci) => { if (a.alta && c.fecha < a.alta) return; if (a.baja && c.fecha > a.baja) return; total++;
    const e = (c.asis || {})[a.id]; if (e === "P") asis++; else if (e === "R") { asis++; ret++; } else if (e === "J") just++; else if (e === "F") falt++;
    const ev = (c.evals || {})[a.id] || {}; const pl = plDe(c.planId);
    Object.entries(ev).forEach(([cid, r]) => { const x = normal(r.t, r.v); const cr = pl && pl.criterios.find(k => k.id === cid);
      const k = cr ? cr.c : cid; (porCrit[k] = porCrit[k] || { s: 0, n: 0 }); porCrit[k].s += x; porCrit[k].n++; sum.s += x; sum.n++; const m = mitad[ci < clases.length / 2 ? 0 : 1]; m.s += x; m.n++; });
    const o = (c.obs || {})[a.id]; if (o) obs.push(o); });
  const prom = sum.n ? sum.s / sum.n : null; const cal = prom == null ? null : Math.max(6, Math.min(10, Math.round(6 + 4 * prom)));
  const tend = mitad[0].n && mitad[1].n ? (mitad[1].s / mitad[1].n) - (mitad[0].s / mitad[0].n) : 0;
  return { asis, falt, ret, just, total, cal, prom, porCrit, obs, tend, nreg: sum.n }; }
function cualitativa(a, r) { if (r.cal == null) return r.total ? "Sin registros de evaluación en el periodo; se sugiere observar su desempeño en las próximas sesiones." : "";
  const F = { 10: "muestra un desempeño sobresaliente en las actividades motrices y de juego", 9: "muestra un muy buen desempeño en las actividades motrices y de juego", 8: "muestra un buen desempeño en las actividades motrices y de juego", 7: "muestra avances en las actividades motrices, con aspectos por fortalecer", 6: "requiere apoyo constante para lograr los aprendizajes de la clase" };
  const crit = Object.entries(r.porCrit).map(([k, v]) => [k, v.s / v.n]); const fuertes = crit.filter(x => x[1] >= .75).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => minus(x[0]));
  const debiles = crit.filter(x => x[1] < .5).sort((a, b) => a[1] - b[1]).slice(0, 2).map(x => minus(x[0]));
  let t = `${F[r.cal][0].toUpperCase() + F[r.cal].slice(1)}.`; if (fuertes.length) t += ` Logra con seguridad: ${fuertes.join("; ")}.`; if (debiles.length) t += ` Requiere fortalecer: ${debiles.join("; ")}.`;
  if (r.tend > .15) t += " Mostró una mejora clara a lo largo del periodo."; else if (r.tend < -.15) t += " Su desempeño bajó en las últimas sesiones; conviene darle seguimiento.";
  if (r.falt >= 3) t += ` Sus ${r.falt} inasistencias limitaron su avance; se recomienda reforzar la asistencia.`; else if (r.ret >= 3) t += ` Llegó tarde en ${r.ret} ocasiones.`;
  if (r.obs.length) t += ` Observaciones de clase: ${r.obs.slice(-2).join(" ").replace(/\s+/g, " ")}`; return t.trim(); }

/* =================================================================== VISTAS */
const VISTAS = {}, ENLAZAR = {};

/* ---------- bienvenida (primera vez) ---------- */
VISTAS.bienvenida = () => { const p = S.paso || 1;
  if (p === 1) return `<main class="wrap"><section class="portada"><div class="marca"><img src="img/ulama-icono.svg" alt=""><div><div class="eb">Ulama · Educación Física</div></div></div>
    <h1>Su clase, en movimiento</h1><p>Planee, pase lista, evalúe mientras sus alumnos juegan y obtenga la evaluación del trimestre sin capturar dos veces. Funciona sin internet.</p></section>
    <div class="card mt"><h3>Para empezar</h3><p class="muted">Le haremos unas preguntas para dejar lista la app: sus datos, sus escuelas y su supervisor de Educación Física. Todo se puede cambiar después en <b>Mis escuelas</b> y <b>Ajustes</b>.</p>
    <div class="fila mt"><button class="btn p" id="b1">Comenzar</button><button class="btn" id="bRes">${ic("subir")} Tengo un respaldo</button>${gClientId() ? `<button class="btn" id="bResD">${ic("subir")} Recuperar de mi Google Drive</button>` : ""}<input type="file" id="fRes" accept=".json,application/json" hidden></div></div></main>`;
  if (p === 2) return `<main class="wrap"><div class="pasos"><span class="on"></span><span></span></div><p class="paso-t">Paso 1 de 2 · Sus datos</p>
    <div class="card mt"><h3>¿Quién da la clase?</h3><p class="muted mb small">Aparecerá en sus planeaciones y reportes de evaluación.</p>
    <div class="dos"><label class="campo"><span>Tratamiento</span><select id="dTr">${["", "Mtro.", "Mtra.", "Profr.", "Profra.", "Lic."].map(x => `<option ${x === D.docente.trato ? "selected" : ""}>${x}</option>`).join("")}</select></label>
    <label class="campo"><span>Nombre completo</span><input id="dNom" value="${esc(D.docente.nombre || (YO && YO.nombre) || "")}" autocomplete="name"></label></div>
    <div class="dos"><label class="campo"><span>Correo institucional</span><input id="dCor" type="email" inputmode="email" value="${esc(D.docente.correo)}" placeholder="nombre@bcedu.mx"></label>
    <label class="campo"><span>Celular (opcional)</span><input id="dTel" inputmode="tel" value="${esc(D.docente.tel)}"></label></div>
    <div class="fila fin"><button class="btn p" id="b2">Siguiente</button></div></div></main>`;
  return `<main class="wrap"><div class="pasos"><span class="on"></span><span class="on"></span></div><p class="paso-t">Paso 2 de 2 · Sus escuelas</p>
    <div class="card mt"><h3>Sus escuelas</h3><p class="muted small">Registre cada escuela donde trabaja, con los días que le toca ir y su supervisor de Educación Física (puede ser distinto en cada escuela).</p>
    <div class="lista mt">${D.escuelas.map(e => `<div class="it"><div class="av">${ic("escuela", 18)}</div><div class="tx"><b>${esc(e.nombre)}</b><small>${esc(e.cct)} · ${(e.dias || []).map(d => DSEM[d]).join(", ") || "sin días"}</small></div></div>`).join("") || `<div class="vacio">Aún no hay escuelas.</div>`}</div>
    <div class="fila mt"><button class="btn" id="bEsc">${ic("mas")} Agregar escuela</button></div>
    <div class="fila fin mt"><button class="btn p" id="b3" ${D.escuelas.length ? "" : "disabled"}>Listo, entrar</button></div>
    <p class="small muted mt">Después, en cada escuela, dé de alta sus grupos subiendo la foto o el PDF de la lista (RELweb).</p></div></main>`; };
ENLAZAR.bienvenida = () => { const p = S.paso || 1;
  if (p === 1) { $("#b1").onclick = () => { S.paso = 2; pintar(); }; $("#bRes").onclick = () => $("#fRes").click(); $("#fRes").onchange = e => restaurar(e.target.files[0]); $("#bResD") && ($("#bResD").onclick = driveElegirRespaldo); }
  if (p === 2) $("#b2").onclick = () => { const n = val("dNom").trim(); if (!n) return toast("Escriba su nombre."); Object.assign(D.docente, { trato: val("dTr"), nombre: n, correo: val("dCor").trim(), tel: val("dTel").trim() }); guardar(); S.paso = 3; pintar(); };
  if (p === 3) { $("#bEsc").onclick = () => formEscuela(null, () => pintar()); $("#b3").onclick = () => { D.cfg.bienvenida = true; guardar(); S = { v: "inicio" }; pintar(); toast("¡Listo! Ahora dé de alta sus grupos en <b>Mis escuelas</b>."); }; } };

/* ---------- inicio ---------- */
VISTAS.inicio = () => { const k = hoy(), d = dF(k), sc = sinClase(k), ag = agendaDe(k, k), dia = d.getDay();
  const hoyEsc = D.escuelas.filter(e => D.grupos.some(g => g.escId === e.id && diasGrupo(g).includes(dia)));
  const gHoy = D.grupos.filter(g => diasGrupo(g).includes(dia)).sort((a, b) => (escDe(a.escId).nombre || "").localeCompare(escDe(b.escId).nombre || "") || a.grado - b.grado);
  return `<main class="wrap"><section class="portada"><div class="marca"><img src="img/ulama-icono.svg" alt=""><div class="eb">Ulama · Educación Física</div></div>
  <h1>Hola, ${esc(corto(D.docente.nombre) || "maestro")}</h1><p>${DSEM_L[dia][0].toUpperCase() + DSEM_L[dia].slice(1)} ${fLarga(k)}${sc ? ` · <b>${esc(sc)}</b>` : hoyEsc.length ? ` · Hoy va a ${hoyEsc.map(e => esc(e.nombre)).join(" y ")}` : ""}</p>
  <div class="fila"><button class="btn m" id="bClase">${ic("silbato")} Iniciar clase</button><button class="btn sec" id="bPlanN">${ic("mas")} Nueva planeación</button></div></section>
  ${gHoy.length && !sc ? `<h2 class="sec-t">Hoy<small>Grupos que le tocan según sus días de clase</small></h2><div class="hoy">${gHoy.map(g => { const s = siguienteSesion(g.id), e = escDe(g.escId), ya = D.clases.some(c => c.grupoId === g.id && c.fecha === k);
    return `<button class="hoy-i" data-g="${g.id}"><span class="gr">${g.grado}°${esc(g.grupo || "")}</span><span class="tx"><b>${esc(e.nombre)}</b><small>${s ? `Sesión ${s.n}: ${esc(s.ses.t)}` : "Sin planeación pendiente"} · ${activos(g).length} alumnos</small></span>${ya ? `<span class="tag">Dada</span>` : `<span class="tag m">${ic("play", 14)}</span>`}</button>`; }).join("")}</div>` : ""}
  ${avisoRespaldoHTML()}
  <h2 class="sec-t">Su trabajo</h2><div class="puertas">
   <button class="puerta" data-v="planes" style="--c:var(--anil);--c-s:var(--anil-s)"><span class="ic">${ic("plan")}</span><b>Planeación</b><span>${D.planes.length} planeaciones · juegos, sesiones e instrumentos</span></button>
   <button class="puerta" data-v="agenda" style="--c:var(--maiz-d);--c-s:var(--maiz-s)"><span class="ic">${ic("agenda")}</span><b>Agenda</b><span>Las sesiones que siguen en cada grupo</span></button>
   <button class="puerta" data-v="evaluacion" style="--c:var(--ciruela);--c-s:var(--ciruela-s)"><span class="ic">${ic("eval")}</span><b>Evaluación del trimestre</b><span>Calificación 6 a 10, observaciones y faltas</span></button>
   <button class="puerta" data-v="escuelas"><span class="ic">${ic("escuela")}</span><b>Mis escuelas y grupos</b><span>${D.escuelas.length} escuelas · ${D.grupos.length} grupos · ${D.grupos.reduce((t, g) => t + activos(g).length, 0)} alumnos</span></button>
   <button class="puerta" data-v="listas" style="--c:var(--barro);--c-s:var(--barro-s)"><span class="ic">${ic("impr")}</span><b>Listas de asistencia</b><span>Imprimir por mes, en blanco o con sus registros</span></button>
   <button class="puerta" data-v="ajustes" style="--c:var(--gris);--c-s:var(--hilo2)"><span class="ic">${ic("ajustes")}</span><b>Ajustes y respaldo</b><span>Sus datos, trimestres, enlace y copia de seguridad</span></button>
  </div><p class="pie">Ulama · de la familia Tlamatini · Supervisión Escolar Zona 050 · ISEP</p></main>`; };
ENLAZAR.inicio = () => { enlazarAvisoRespaldo(); $("#bClase").onclick = () => ir("clase", { paso: 1, c: nuevaClase() }); $("#bPlanN").onclick = () => ir("planNueva", {});
  $$(".puerta").forEach(b => b.onclick = () => ir(b.dataset.v)); $$(".hoy-i").forEach(b => b.onclick = () => { const g = grDe(b.dataset.g), c = nuevaClase(); c.escId = g.escId; c.grupoId = g.id; prepararAsis(c); ir("clase", { paso: 3, c }); }); };

/* ---------- escuelas ---------- */
VISTAS.escuelas = () => barra("Mis escuelas y grupos", "Escuelas", `<button class="btn s p" id="bNE">${ic("mas")} Escuela</button>`) + `<main class="wrap">
  ${D.escuelas.map(e => { const gs = gruposDe(e.id); return `<section class="card mt"><div class="fila" style="align-items:flex-start"><div style="flex:1;min-width:0"><h3>${esc(e.nombre)}</h3>
   <p class="small muted">${esc(e.cct)}${e.turno ? " · " + esc(e.turno) : ""} · Días: ${(e.dias || []).map(d => DSEM[d]).join(", ") || "—"}<br>Dirección: ${esc(dirNombre(e) || "—")}${e.correo ? " · " + esc(e.correo) : ""}<br>Supervisor(a) de E. F.: ${esc(e.supEF || "—")}${e.supCorreo ? " · " + esc(e.supCorreo) : ""}</p></div>
   <button class="btn s" data-ee="${e.id}">${ic("lapiz", 16)} Editar</button></div>
   <div class="lista mt">${gs.map(g => `<button class="it btnit" data-g="${g.id}"><span class="av">${g.grado}°${esc(g.grupo || "")}</span><span class="tx"><b>${grNom(g)} · ${activos(g).length} alumnos</b><small>${esc(g.docente || "Docente sin registrar")}${g.correo ? " · " + esc(g.correo) : ""}</small></span>${ic("atras", 16).replace('d="M15 18l-6-6 6-6"', 'd="M9 18l6-6-6-6"')}</button>`).join("") || `<div class="vacio">Sin grupos todavía.</div>`}</div>
   <div class="fila mt"><button class="btn s p" data-ng="${e.id}">${ic("mas", 16)} Grupo</button><button class="btn s" data-imp="${e.id}">${ic("camara", 16)} Grupos desde foto o PDF</button></div></section>`; }).join("") || `<div class="vacio mt">Agregue su primera escuela.</div>`}
  <input type="file" id="fImp" accept="application/pdf,image/*" multiple hidden></main>`;
ENLAZAR.escuelas = () => { $("#bNE").onclick = () => formEscuela(null, pintar); $$("[data-ee]").forEach(b => b.onclick = () => formEscuela(escDe(b.dataset.ee), pintar));
  $$("[data-ng]").forEach(b => b.onclick = () => formGrupo(null, b.dataset.ng, pintar)); $$("[data-g]").forEach(b => b.onclick = () => ir("grupo", { id: b.dataset.g }));
  $$("[data-imp]").forEach(b => b.onclick = () => { S.impEsc = b.dataset.imp; $("#fImp").click(); }); $("#fImp").onchange = e => importarGrupos([...e.target.files], S.impEsc); };

function formEscuela(e, listo) { const n = !e; e = e || { id: uid(), dias: [] };
  dlg(`<h3>${n ? "Nueva escuela" : "Editar escuela"}</h3>
   <label class="campo"><span>Buscar en las escuelas de la Zona 050 (o escriba la suya)</span><input id="eBus" list="dl050" placeholder="Nombre o C.C.T." data-nofoco="1"><datalist id="dl050">${ESCUELAS_050.map(x => `<option value="${esc(x[0])} · ${x[1]}">`).join("")}</datalist></label>
   <label class="campo"><span>Nombre de la escuela</span><input id="eNom" value="${esc(e.nombre || "")}"></label>
   <div class="dos"><label class="campo"><span>C.C.T.</span><input id="eCct" value="${esc(e.cct || "")}" style="text-transform:uppercase"></label>
   <label class="campo"><span>Turno</span><select id="eTur">${["", "Matutino", "Vespertino", "Tiempo completo"].map(x => `<option ${x === (e.turno || "") ? "selected" : ""}>${x}</option>`).join("")}</select></label></div>
   <div class="dos"><label class="campo"><span>Zona escolar</span><input id="eZon" value="${esc(e.zona || "")}"></label><label class="campo"><span>Localidad</span><input id="eLoc" value="${esc(e.localidad || "")}"></label></div>
   <span class="lbl small" style="font-weight:700;color:var(--gris)">Días que da clase en esta escuela</span><div class="chips mb" id="eDias" style="margin-top:6px">${[1, 2, 3, 4, 5].map(d => `<button type="button" class="chip" data-d="${d}" aria-pressed="${(e.dias || []).includes(d)}">${DSEM[d]}</button>`).join("")}</div>
   <div class="dos"><label class="campo"><span>Tratamiento</span><select id="eDT">${["Mtro.", "Mtra.", "Profr.", "Profra.", "Lic.", ""].map(x => `<option ${x === (e.dirTrato ?? "Mtro.") ? "selected" : ""}>${x}</option>`).join("")}</select></label>
   <label class="campo"><span>Director(a) o encargado(a)</span><input id="eDir" value="${esc(e.director || "")}"></label></div>
   <label class="campo"><span>Correo de la escuela o de la dirección</span><input id="eCor" type="email" value="${esc(e.correo || "")}"><small>A este correo se envía el concentrado de evaluación de todos sus grupos.</small></label>
   <div class="dos"><label class="campo"><span>Supervisor(a) de Educación Física</span><input id="eSup" value="${esc(e.supEF || "")}" placeholder="Mtro. …"></label>
   <label class="campo"><span>Correo del supervisor(a) de E. F.</span><input id="eSupC" type="email" value="${esc(e.supCorreo || "")}"></label></div>
   <div class="fila fin">${n ? "" : `<button class="btn r" id="eBor">${ic("basura", 16)} Quitar</button>`}<button class="btn" id="eX">Cancelar</button><button class="btn p" id="eOk">Guardar</button></div>`, v => {
    v.querySelector("#eBus").onchange = ev => { const cct = (ev.target.value.match(/02[A-Z]{3}\d{4}[A-Z]/) || [])[0], x = ESCUELAS_050.find(y => y[1] === cct); if (!x) return;
      $("#eNom").value = x[0]; $("#eCct").value = x[1]; $("#eZon").value = "050"; $("#eLoc").value = x[3]; $("#eDir").value = x[5];
      $("#eDT").value = /^(Cecilia|Adriana|Citlali|Lorena)\b/.test(x[5]) ? "Mtra." : "Mtro."; };
    v.querySelectorAll("#eDias .chip").forEach(c => c.onclick = () => c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true"));
    v.querySelector("#eX").onclick = cerrarDlg;
    if (!n) v.querySelector("#eBor").onclick = async () => { const gs = gruposDe(e.id); if (!(await confirmar(`¿Quitar ${e.nombre}${gs.length ? ` y sus ${gs.length} grupos` : ""}? Sus clases registradas también se borrarán.`))) return;
      const ids = new Set(gs.map(g => g.id)); D.grupos = D.grupos.filter(g => !ids.has(g.id)); D.clases = D.clases.filter(c => !ids.has(c.grupoId)); D.escuelas = D.escuelas.filter(x => x.id !== e.id); guardar(); cerrarDlg(); listo(); };
    v.querySelector("#eOk").onclick = () => { const nom = val("eNom").trim(); if (!nom) return toast("Escriba el nombre de la escuela.");
      Object.assign(e, { nombre: nom, cct: val("eCct").trim().toUpperCase(), turno: val("eTur"), zona: val("eZon").trim(), localidad: val("eLoc").trim(), dias: [...v.querySelectorAll("#eDias .chip[aria-pressed=true]")].map(c => +c.dataset.d),
        dirTrato: val("eDT"), director: val("eDir").trim(), correo: val("eCor").trim(), supEF: val("eSup").trim(), supCorreo: val("eSupC").trim() });
      if (n) D.escuelas.push(e); guardar(); cerrarDlg(); listo(); toast(n ? "Escuela agregada." : "Cambios guardados."); }; }); }

function formGrupo(g, escId, listo) { const n = !g; g = g || { id: uid(), escId, alumnos: [], dias: [] }; const e = escDe(g.escId);
  dlg(`<h3>${n ? "Nuevo grupo" : "Editar grupo"} · ${esc(e.nombre)}</h3>
   <div class="dos"><label class="campo"><span>Grado</span><select id="gGr">${[1, 2, 3, 4, 5, 6].map(x => `<option value="${x}" ${x == g.grado ? "selected" : ""}>${x}.°</option>`).join("")}</select></label>
   <label class="campo"><span>Grupo</span><input id="gGp" value="${esc(g.grupo || "")}" maxlength="4" placeholder="A" style="text-transform:uppercase"></label></div>
   <div class="dos"><label class="campo"><span>Docente del grupo</span><input id="gDoc" value="${esc(g.docente || "")}" placeholder="Mtra. …"></label>
   <label class="campo"><span>Correo del docente</span><input id="gCor" type="email" value="${esc(g.correo || "")}"><small>A este correo se envía la evaluación de su grupo.</small></label></div>
   <span style="font-size:14px;font-weight:700;color:var(--gris)">Días de clase de este grupo <small style="font-weight:400">(si no marca, se usan los de la escuela: ${(e.dias || []).map(d => DSEM[d]).join(", ") || "ninguno"})</small></span>
   <div class="chips mb" id="gDias" style="margin-top:6px">${[1, 2, 3, 4, 5].map(d => `<button type="button" class="chip" data-d="${d}" aria-pressed="${(g.dias || []).includes(d)}">${DSEM[d]}</button>`).join("")}</div>
   <label class="campo"><span>Horario (opcional)</span><input id="gHor" value="${esc(g.horario || "")}" placeholder="8:00 a 8:50"></label>
   <div class="fila fin">${n ? "" : `<button class="btn r" id="gBor">${ic("basura", 16)} Quitar</button>`}<button class="btn" id="gX">Cancelar</button><button class="btn p" id="gOk">Guardar</button></div>`, v => {
    v.querySelectorAll("#gDias .chip").forEach(c => c.onclick = () => c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true"));
    v.querySelector("#gX").onclick = cerrarDlg;
    if (!n) v.querySelector("#gBor").onclick = async () => { if (!(await confirmar(`¿Quitar el grupo ${grNom(g)} con sus alumnos y clases registradas?`))) return; D.grupos = D.grupos.filter(x => x.id !== g.id); D.clases = D.clases.filter(c => c.grupoId !== g.id); D.planes.forEach(p => p.grupos = p.grupos.filter(x => x !== g.id)); guardar(); cerrarDlg(); history.back(); };
    v.querySelector("#gOk").onclick = () => { Object.assign(g, { grado: +val("gGr"), grupo: val("gGp").trim().toUpperCase(), docente: val("gDoc").trim(), correo: val("gCor").trim(), horario: val("gHor").trim(), dias: [...v.querySelectorAll("#gDias .chip[aria-pressed=true]")].map(c => +c.dataset.d) });
      if (n) D.grupos.push(g); guardar(); cerrarDlg(); listo(g); toast(n ? `Grupo ${grNom(g)} agregado. Ahora suba la lista de alumnos.` : "Cambios guardados."); }; }); }

/* ---------- grupo y alumnos ---------- */
VISTAS.grupo = () => { const g = grDe(S.id); if (!g) return VISTAS.escuelas(); const e = escDe(g.escId), act = activos(g), bajas = (g.alumnos || []).filter(a => a.baja);
  return barra(esc(e.nombre), `${grNom(g)} · ${act.length} alumnos`, `<button class="btn s" id="bEG">${ic("lapiz", 16)}</button>`) + `<main class="wrap">
  <div class="card mt"><p class="small muted">Docente: <b>${esc(g.docente || "—")}</b>${g.correo ? " · " + esc(g.correo) : ""} · Días: ${diasGrupo(g).map(d => DSEM[d]).join(", ") || "—"}${g.horario ? " · " + esc(g.horario) : ""}</p>
  <div class="fila mt"><button class="btn p" id="bFoto">${ic("camara", 18)} Subir foto o PDF de la lista</button><button class="btn" id="bMan">${ic("mas", 18)} Agregar a mano</button><button class="btn" id="bLisG">${ic("impr", 18)} Lista de asistencia</button></div>
  <input type="file" id="fLis" accept="application/pdf,image/*" capture="environment" hidden><input type="file" id="fLis2" accept="application/pdf,image/*" hidden>
  <p class="small muted mt">Sirve la lista de asistencia o el reporte de inscripción de RELweb (PDF), o una foto de la lista. Antes de guardar podrá revisar los nombres.</p></div>
  <h2 class="sec-t">Alumnos</h2><div class="lista">${act.map((a, i) => `<div class="it"><span class="av">${i + 1}</span><span class="tx"><b>${esc(a.nombre)}</b><small>${a.curp ? esc(a.curp) + " · " : ""}Alta: ${a.alta ? fCorta(a.alta) : "—"}</small></span><button class="btn s" data-ed="${a.id}" aria-label="Editar">${ic("lapiz", 16)}</button><button class="btn s r" data-bj="${a.id}" aria-label="Dar de baja">${ic("baja", 16)}<span class="oc"> Baja</span></button></div>`).join("") || `<div class="vacio">Sin alumnos. Suba la foto o el PDF de la lista.</div>`}</div>
  ${bajas.length ? `<h2 class="sec-t">Bajas<small>Se conservan sus registros hasta la fecha de baja</small></h2><div class="lista">${bajas.map(a => `<div class="it" style="opacity:.75"><span class="av">${ic("baja", 16)}</span><span class="tx"><b>${esc(a.nombre)}</b><small>Baja: ${fCorta(a.baja)}${a.motivo ? " · " + esc(a.motivo) : ""}</small></span><button class="btn s" data-re="${a.id}">Reactivar</button></div>`).join("")}</div>` : ""}
  </main>`; };
ENLAZAR.grupo = () => { const g = grDe(S.id); if (!g) return; $("#bEG").onclick = () => formGrupo(g, g.escId, pintar);
  $("#bFoto").onclick = () => elegirFuente(); $("#fLis").onchange = $("#fLis2").onchange = ev => { const f = ev.target.files[0]; ev.target.value = ""; if (f) leerLista(f, g); };
  $("#bMan").onclick = () => revisarNombres(g, "", "Escriba un alumno por renglón.");
  $("#bLisG").onclick = () => ir("listas", { L: { escId: g.escId, grupos: [g.id] } });
  $$("[data-bj]").forEach(b => b.onclick = () => { const a = g.alumnos.find(x => x.id === b.dataset.bj);
    dlg(`<h3>Baja de ${esc(a.nombre)}</h3><div class="dos"><label class="campo"><span>Fecha de baja</span><input type="date" id="bF" value="${hoy()}"></label><label class="campo"><span>Motivo (opcional)</span><input id="bM" placeholder="Cambio de escuela…"></label></div>
     <p class="small muted mb">Sus registros hasta esa fecha se conservan y ya no aparecerá en la lista.</p><div class="fila fin"><button class="btn" id="bX">Cancelar</button><button class="btn r" id="bOk">Dar de baja</button></div>`, v => {
      v.querySelector("#bX").onclick = cerrarDlg; v.querySelector("#bOk").onclick = () => { a.baja = val("bF") || hoy(); a.motivo = val("bM").trim(); guardar(); pintar(); toast(`${esc(corto(a.nombre))} quedó dado de baja.`); }; }); });
  $$("[data-re]").forEach(b => b.onclick = () => { const a = g.alumnos.find(x => x.id === b.dataset.re); delete a.baja; delete a.motivo; guardar(); pintar(); });
  $$("[data-ed]").forEach(b => b.onclick = () => { const a = g.alumnos.find(x => x.id === b.dataset.ed);
    dlg(`<h3>Editar alumno</h3><label class="campo"><span>Nombre</span><input id="aN" value="${esc(a.nombre)}"></label><div class="dos"><label class="campo"><span>CURP (opcional)</span><input id="aC" value="${esc(a.curp || "")}" style="text-transform:uppercase"></label><label class="campo"><span>Fecha de alta</span><input type="date" id="aA" value="${a.alta || ""}"></label></div>
     <div class="fila fin"><button class="btn r" id="aB">${ic("basura", 16)} Borrar (error de captura)</button><button class="btn p" id="aOk">Guardar</button></div>`, v => {
      v.querySelector("#aOk").onclick = () => { a.nombre = val("aN").trim() || a.nombre; a.curp = val("aC").trim().toUpperCase(); a.alta = val("aA"); guardar(); pintar(); };
      v.querySelector("#aB").onclick = async () => { if (!(await confirmar("Esto borra al alumno y sus registros. Si cambió de escuela, mejor use «Baja». ¿Borrar?"))) return; g.alumnos = g.alumnos.filter(x => x !== a); guardar(); pintar(); }; }); }); };
function elegirFuente() { dlg(`<h3>Subir la lista</h3><div class="lista"><button class="it btnit" id="o1"><span class="av">${ic("camara", 18)}</span><span class="tx"><b>Tomar foto</b><small>Con la cámara, a la lista impresa o en el pizarrón</small></span></button>
  <button class="it btnit" id="o2"><span class="av">${ic("doc", 18)}</span><span class="tx"><b>Elegir archivo</b><small>PDF de RELweb o una foto guardada</small></span></button></div>`, v => {
  v.querySelector("#o1").onclick = () => { cerrarDlg(); $("#fLis").click(); }; v.querySelector("#o2").onclick = () => { cerrarDlg(); $("#fLis2").click(); }; }); }

/* ---------- lectura de listas: PDF de RELweb (texto), PDF escaneado o foto (OCR en el dispositivo) ---------- */
const _libs = {};
function cargarJS(src) { return _libs[src] || (_libs[src] = new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => { delete _libs[src]; no(new Error("No se pudo cargar " + src)); }; document.head.appendChild(s); })); }
async function pdfjs() { await cargarJS(LIB + "pdf.min.js"); const L = window.pdfjsLib; L.GlobalWorkerOptions.workerSrc = new URL(LIB + "pdf.worker.min.js", location.href).href; return L; }
let OCR_W = null;
async function ocrWorker(prog) { if (OCR_W) return OCR_W; await cargarJS(LIB + "ocr/tesseract.min.js"); const base = new URL(LIB + "ocr/", location.href).href;
  OCR_W = await Tesseract.createWorker("spa", 1, { workerPath: base + "worker.min.js", corePath: base, langPath: base + "lang", gzip: true, workerBlobURL: false, logger: m => { if (prog && m.status === "recognizing text") prog(Math.round(m.progress * 100)); } }); return OCR_W; }
async function ocr(fuente, prog) { const w = await ocrWorker(prog); const { data } = await w.recognize(fuente); return data.text || ""; }
async function pdfLineas(file) { const L = await pdfjs(); const doc = await L.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; const lines = [];
  for (let p = 1; p <= doc.numPages; p++) { const tc = await (await doc.getPage(p)).getTextContent(); const rows = [];
    for (const it of tc.items) { if (!it.str.trim()) continue; const x = it.transform[4], y = it.transform[5]; let r = rows.find(r => Math.abs(r.y - y) < 3); if (!r) { r = { y, items: [] }; rows.push(r); } r.items.push({ x, s: it.str, w: it.width }); }
    rows.sort((a, b) => b.y - a.y); for (const r of rows) { r.items.sort((a, b) => a.x - b.x); let t = "", end = null; for (const i of r.items) { if (end !== null && i.x - end > 1.5) t += " "; t += i.s; end = i.x + i.w; } lines.push(t.replace(/\s+/g, " ").trim()); } }
  return { lines, doc }; }
async function pdfOCR(doc, prog) { const out = []; for (let i = 1; i <= Math.min(doc.numPages, 8); i++) { const pg = await doc.getPage(i); const vp = pg.getViewport({ scale: 2.2 }); const c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
  await pg.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise; out.push(await ocr(c, p => prog(`página ${i} de ${doc.numPages}: ${p} %`))); } return out.join("\n"); }
const CURP_RE = /[A-Z][AEIOUX][A-Z]{2}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d/;
const nombreRel = raw => { const [ap, rest] = raw.split("*"); const [p, m] = (ap || "").split("/").map(x => x.trim()); return [p, m, (rest || "").trim()].filter(Boolean).join(" ").replace(/\s+/g, " "); };
const titulo = t => t.toLowerCase().replace(/(^|\s|-)([a-záéíóúüñ])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(De|Del|La|Las|Los|Y)\b/g, w => w.toLowerCase());
/* Encabezado de RELweb + renglones de alumnos con CURP */
function parseRel(lines) { const txt = lines.join("\n"), g = { escuela: "", cct: "", grado: "", grupo: "", docente: "", alumnos: [] }; let m;
  if (m = /Escuela:\s*(.+)/.exec(txt)) g.escuela = m[1].replace(/\s*Clave.*$/, "").trim(); if (m = /Clave CT:\s*([0-9A-Z]{10})/.exec(txt)) g.cct = m[1];
  if (m = /Grado:\s*(\d)/.exec(txt)) g.grado = m[1]; if (m = /Grupo:\s*([A-Z0-9])/.exec(txt)) g.grupo = m[1]; if (m = /(Docente|Maestr[oa]|Profesor[a]?):\s*([A-ZÁÉÍÓÚÑ][^\n]{4,60})/i.exec(txt)) g.docente = m[2].replace(/\s*(Grado|Grupo|Turno).*$/i, "").trim();
  const re = /^(\d{1,3})\s+([A-Z][A-Z0-9]{17})\s+(.+?)\s+([HM])\s+\d{1,2}\/\d{1,2}\/\d{4}/;
  for (const l of lines) { const r = re.exec(l); if (r) { g.alumnos.push({ nombre: titulo(nombreRel(r[3])), curp: r[2] }); continue; }
    const c = l.toUpperCase().match(CURP_RE); if (c) { let n = l.replace(new RegExp(c[0], "i"), " ").replace(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/g, " ").replace(/\b(HOMBRE|MUJER|\d+)\b/gi, " ").replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ *\/'.-]/g, " ").replace(/\s+[HM]\s*$/, "").replace(/\s{2,}/g, " ").trim();
      if (n.includes("*") || n.includes("/")) n = nombreRel(n); if (n && !g.alumnos.some(a => a.curp === c[0])) g.alumnos.push({ nombre: titulo(n), curp: c[0] }); } }
  return g; }
/* Sin CURP (foto de lista escrita): renglones que parecen nombres */
function nombresDeTexto(t) { const NO = /^(escuela|clave|grado|grupo|turno|ciclo|lista|nombre|alumno|docente|maestr|profesor|zona|fecha|total|no\.?$|n[uú]m)/i;
  return t.split(/\n/).map(l => l.replace(/^[\s\d.)\-–:|]+/, "").replace(/[|_#*~"“”«»\[\]{}<>]/g, " ").replace(/\s+\d.*$/, "").replace(/\s{2,}/g, " ").trim())
    .filter(l => l.length >= 6 && !NO.test(l) && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(l) && l.split(" ").length >= 2 && l.split(" ").length <= 7).map(l => /^[A-ZÁÉÍÓÚÜÑ\s'.-]+$/.test(l) ? titulo(l) : l); }
function progreso(t) { dlg(`<h3>Leyendo la lista…</h3><p class="muted" id="pTx">${t}</p><div class="prog"><i id="pBar" style="width:5%"></i></div><p class="small muted">La lectura se hace en su dispositivo; la primera vez tarda un poco más porque descarga el lector.</p>`); }
const progAct = (t, pct) => { const a = $("#pTx"), b = $("#pBar"); if (a) a.textContent = t; if (b && pct != null) b.style.width = Math.max(5, pct) + "%"; };
async function leerArchivo(f) { let g = { alumnos: [] }, texto = "";
  if (/pdf/i.test(f.type) || /\.pdf$/i.test(f.name)) { progAct("Abriendo el PDF…", 10); const { lines, doc } = await pdfLineas(f); g = parseRel(lines);
    if (!g.alumnos.length) { const plano = lines.join("\n"); if (plano.replace(/\s/g, "").length > 80) texto = plano; else { progAct("El PDF es una imagen: leyendo con OCR…", 15); texto = await pdfOCR(doc, p => progAct(p)); } } }
  else { progAct("Leyendo la foto…", 10); texto = await ocr(f, p => progAct(`Leyendo la foto: ${p} %`, p)); g = parseRel(texto.split("\n")); }
  if (!g.alumnos.length && texto) g.alumnos = nombresDeTexto(texto).map(n => ({ nombre: n })); return g; }
async function leerLista(f, grupo) { progreso("Preparando…");
  try { const r = await leerArchivo(f); cerrarDlg(); revisarNombres(grupo, r.alumnos.map(a => a.nombre + (a.curp ? " | " + a.curp : "")).join("\n"),
    r.alumnos.length ? `Se encontraron <b>${r.alumnos.length}</b> alumnos${r.grado ? ` de ${r.grado}.° ${r.grupo}` : ""}. Corrija lo necesario: un alumno por renglón.` : "No se reconocieron nombres. Intente con una foto más cercana y con buena luz, o escríbalos.", r); }
  catch (e) { cerrarDlg(); toast(`<b>No se pudo leer el archivo.</b> ${esc(e.message || "")}`, 4000); } }
function revisarNombres(g, texto, aviso, r) { const ya = new Set(activos(g).map(a => a.nombre.toLowerCase()));
  dlg(`<h3>Alumnos de ${grNom(g)}</h3><p class="small muted mb">${aviso}</p>${r && r.docente && !g.docente ? `<div class="aviso v mb">Docente encontrado en la lista: <b>${esc(r.docente)}</b> (se guardará en el grupo).</div>` : ""}
   <label class="campo"><span>Nombres (puede agregar « | CURP» al final)</span><textarea id="nT" style="min-height:260px">${esc(texto)}</textarea></label>
   <div class="dos"><label class="campo"><span>Fecha de alta</span><input type="date" id="nF" value="${activos(g).length ? hoy() : CICLO.inicio}"><small>Para alumnos de nuevo ingreso, la fecha en que llegaron.</small></label></div>
   <div class="fila fin"><button class="btn" id="nX">Cancelar</button><button class="btn p" id="nOk">${ic("check", 18)} Guardar alumnos</button></div>`, v => {
    v.querySelector("#nX").onclick = cerrarDlg;
    v.querySelector("#nOk").onclick = () => { const alta = val("nF") || hoy(); let nuevos = 0, rep = 0;
      val("nT").split("\n").map(l => l.trim()).filter(Boolean).forEach(l => { const [n, c] = l.split("|").map(x => x.trim()); if (!n) return; if (ya.has(n.toLowerCase())) { rep++; return; } ya.add(n.toLowerCase());
        g.alumnos.push({ id: uid(), nombre: n, curp: (c || "").toUpperCase(), alta }); nuevos++; });
      if (r && r.docente && !g.docente) g.docente = titulo(r.docente); guardar(); cerrarDlg(); pintar(); toast(`${nuevos} alumnos agregados${rep ? ` · ${rep} ya estaban` : ""}.`); }; }); }
/* Varios PDF de RELweb a la vez: cada uno crea su grupo (grado y grupo del encabezado) */
async function importarGrupos(files, escId) { if (!files.length) return; const e = escDe(escId); const res = []; progreso("Preparando…");
  for (const [i, f] of files.entries()) { try { progAct(`Archivo ${i + 1} de ${files.length}: ${f.name}`, (i / files.length) * 100); const r = await leerArchivo(f); res.push({ f, r }); } catch (er) { res.push({ f, r: { alumnos: [] }, er }); } }
  cerrarDlg();
  dlg(`<h3>Grupos encontrados · ${esc(e.nombre)}</h3><p class="small muted mb">Revise el grado y grupo de cada archivo. Los alumnos se agregan al grupo (si ya existe, solo se suman los nuevos).</p>
   ${res.map((x, i) => `<div class="card" style="padding:12px"><b class="small">${esc(x.f.name)}</b> · ${x.r.alumnos.length} alumnos${x.r.cct && e.cct && x.r.cct !== e.cct ? ` <span class="tag r">C.C.T. ${esc(x.r.cct)} distinta</span>` : ""}
    <div class="dos mt"><label class="campo"><span>Grado</span><select id="iG${i}">${[1, 2, 3, 4, 5, 6].map(n => `<option ${String(n) === x.r.grado ? "selected" : ""}>${n}</option>`).join("")}</select></label><label class="campo"><span>Grupo</span><input id="iP${i}" value="${esc(x.r.grupo || "")}"></label></div>
    <label class="campo"><span>Docente del grupo</span><input id="iD${i}" value="${esc(x.r.docente ? titulo(x.r.docente) : "")}"></label></div>`).join("")}
   <div class="fila fin mt"><button class="btn" id="iX">Cancelar</button><button class="btn p" id="iOk">Crear grupos</button></div>`, v => {
    v.querySelector("#iX").onclick = cerrarDlg;
    v.querySelector("#iOk").onclick = () => { let n = 0, a = 0; res.forEach((x, i) => { if (!x.r.alumnos.length) return; const grado = +val("iG" + i), grupo = val("iP" + i).trim().toUpperCase();
      let g = D.grupos.find(y => y.escId === escId && y.grado === grado && (y.grupo || "") === grupo); if (!g) { g = { id: uid(), escId, grado, grupo, docente: val("iD" + i).trim(), correo: "", alumnos: [], dias: [] }; D.grupos.push(g); n++; }
      const ya = new Set(g.alumnos.map(z => z.nombre.toLowerCase())); x.r.alumnos.forEach(z => { if (ya.has(z.nombre.toLowerCase())) return; g.alumnos.push({ id: uid(), nombre: z.nombre, curp: z.curp || "", alta: CICLO.inicio }); a++; }); });
      guardar(); cerrarDlg(); pintar(); toast(`${n} grupos nuevos · ${a} alumnos agregados. Agregue el correo de cada docente.`, 4000); }; }); }

/* ---------- planeación ---------- */
VISTAS.planes = () => barra("Planeación", "Mis planeaciones", `<button class="btn s p" id="bNP">${ic("mas")} Nueva</button>`) + `<main class="wrap">
  <p class="muted mt small">La planeación usa los contenidos y PDA oficiales de Educación Física, el fichero de juegos y el calendario escolar de Baja California de Tlamatini. Al terminarla se generan los instrumentos para evaluar en la clase.</p>
  <div class="lista mt">${D.planes.slice().sort((a, b) => b.ini.localeCompare(a.ini)).map(p => { const e = escDe(p.escId); return `<button class="it btnit" data-p="${p.id}"><span class="av" style="background:var(--anil-s);color:var(--anil)">${ic("plan", 18)}</span><span class="tx"><b>${esc(p.titulo)}</b><small>${esc(e ? e.nombre : "")} · ${p.grupos.map(id => grDe(id)).filter(Boolean).map(grNom).join(", ")} · ${p.sesiones.length} sesiones desde ${fCorta(p.ini)}</small></span></button>`; }).join("") || `<div class="vacio">Aún no tiene planeaciones.</div>`}</div></main>`;
ENLAZAR.planes = () => { $("#bNP").onclick = () => ir("planNueva", {}); $$("[data-p]").forEach(b => b.onclick = () => ir("plan", { id: b.dataset.p })); };

VISTAS.planNueva = () => { const P = S.f = S.f || { escId: (D.escuelas[0] || {}).id, grupos: [], cont: null, ini: proxLunes(), sem: 4, min: 50, instr: "rubrica" }; const e = escDe(P.escId);
  const gs = e ? gruposDe(e.id) : [], selG = P.grupos.map(grDe).filter(Boolean), grados = [...new Set(selG.map(g => g.grado))].sort(), fase = grados.length ? Math.max(...grados.map(faseDe)) : null;
  const conts = fase ? BANCO_EF[fase] || [] : []; const cont = conts.find(c => c.c === P.cont);
  const npor = selG.length ? Math.max(...selG.map(g => diasGrupo(g).length || 1)) : 1; const n = P.n || P.sem * npor;
  return barra("Planeación", "Nueva planeación") + `<main class="wrap">
  <section class="card mt"><h3>1. ¿Para quién?</h3>${D.escuelas.length ? `<label class="campo"><span>Escuela</span><select id="pE">${D.escuelas.map(x => `<option value="${x.id}" ${x.id === P.escId ? "selected" : ""}>${esc(x.nombre)}</option>`).join("")}</select></label>
   <span style="font-size:14px;font-weight:700;color:var(--gris)">Grupos (puede elegir varios del mismo ciclo o fase)</span><div class="chips mt" id="pG">${gs.map(g => `<button class="chip" data-g="${g.id}" aria-pressed="${P.grupos.includes(g.id)}">${grNom(g)}</button>`).join("") || `<span class="muted small">Esta escuela no tiene grupos. Agréguelos en Mis escuelas.</span>`}</div>` : `<div class="vacio">Primero registre una escuela.</div>`}
   ${e && e.supEF ? `<p class="small muted mt">${ic("sup", 16)} Revisa: <b>${esc(e.supEF)}</b>, supervisor(a) de Educación Física.</p>` : ""}</section>
  ${fase ? `<section class="card mt"><h3>2. ¿Qué van a aprender?</h3><p class="small muted mb">Fase ${fase} · De lo Humano y lo Comunitario · Educación Física</p>
   <div class="lista">${conts.map(c => `<button class="it btnit" data-c="${esc(c.c)}" style="${c.c === P.cont ? "box-shadow:0 0 0 2px var(--jade)" : ""}"><span class="av" style="${c.c === P.cont ? "background:var(--jade);color:#fff" : ""}">${c.c === P.cont ? ic("check", 18) : ""}</span><span class="tx"><b>${esc(c.c)}</b></span></button>`).join("")}</div>
   ${cont ? `<div class="mt">${grados.map(gr => `<div class="aviso v mt"><span><b>PDA ${gr}.°:</b> ${esc((cont.pda || {})[gr] || "—")}</span></div>`).join("")}</div>` : ""}</section>` : ""}
  ${cont ? `<section class="card mt"><h3>3. ¿Cuándo y cómo?</h3>
   <label class="campo"><span>Nombre de la planeación</span><input id="pT" value="${esc(P.titulo || cont.c.replace(/\.$/, ""))}"></label>
   <div class="dos"><label class="campo"><span>Inicia</span><input type="date" id="pI" value="${P.ini}"></label><label class="campo"><span>Semanas</span><select id="pS">${[1, 2, 3, 4, 5, 6, 8, 10, 12].map(x => `<option ${x == P.sem ? "selected" : ""}>${x}</option>`).join("")}</select></label></div>
   <div class="dos"><label class="campo"><span>Número de sesiones</span><input type="number" id="pN" min="1" max="40" value="${n}"><small>Según los días de clase del grupo (${npor} por semana).</small></label><label class="campo"><span>Duración de la sesión (min)</span><select id="pM">${[30, 40, 45, 50, 60].map(x => `<option ${x == P.min ? "selected" : ""}>${x}</option>`).join("")}</select></label></div>
   <label class="campo"><span>Propósito (opcional)</span><textarea id="pP" placeholder="Qué quiere lograr con el grupo en estas semanas">${esc(P.proposito || "")}</textarea></label>
   <span style="font-size:14px;font-weight:700;color:var(--gris)">Instrumento principal (en la clase puede elegir cualquiera)</span><div class="chips mt" id="pIn">${Object.entries(TIPOS).map(([k, t]) => `<button class="chip" data-i="${k}" aria-pressed="${P.instr === k}">${t}</button>`).join("")}</div>
   <div class="mt">${selG.map(g => { const f = fechasClase(g, P.ini, n); return `<p class="small muted">${grNom(g)}: ${f.length ? `${fCorta(f[0])} a ${fCorta(f[f.length - 1])}` : "sin días de clase registrados"}${f.length < n ? ` <span class="tag r">solo caben ${f.length}</span>` : ""}</p>`; }).join("")}</div>
   <div class="fila fin mt"><button class="btn p" id="pOk">${ic("check", 18)} Crear planeación e instrumentos</button></div></section>` : ""}
  </main>`; };
function proxLunes() { const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 0)); return iso(d); }
ENLAZAR.planNueva = () => { const P = S.f; const re = () => { const y = window.scrollY; pintar(); window.scrollTo(0, y); };
  const lee = () => { if ($("#pT")) { P.titulo = val("pT"); P.ini = val("pI") || P.ini; P.sem = +val("pS"); P.min = +val("pM"); P.proposito = val("pP"); P.n = +val("pN") || null; } };
  if ($("#pE")) $("#pE").onchange = ev => { P.escId = ev.target.value; P.grupos = []; P.cont = null; re(); };
  $$("#pG .chip").forEach(b => b.onclick = () => { lee(); const id = b.dataset.g; P.grupos = P.grupos.includes(id) ? P.grupos.filter(x => x !== id) : [...P.grupos, id]; P.n = null; re(); });
  $$("[data-c]").forEach(b => b.onclick = () => { lee(); P.cont = b.dataset.c; P.titulo = ""; re(); });
  if ($("#pS")) { $("#pS").onchange = () => { lee(); P.n = null; re(); }; $("#pI").onchange = () => { lee(); re(); }; }
  $$("#pIn .chip").forEach(b => b.onclick = () => { lee(); P.instr = b.dataset.i; re(); });
  if ($("#pOk")) $("#pOk").onclick = () => { lee(); const selG = P.grupos.map(grDe), grados = [...new Set(selG.map(g => g.grado))], fase = Math.max(...grados.map(faseDe)), cont = BANCO_EF[fase].find(c => c.c === P.cont);
    const pdas = {}; grados.sort().forEach(gr => pdas[gr] = (cont.pda || {})[gr] || ""); const n = P.n || 8;
    const p = crearPlan({ escId: P.escId, grupos: P.grupos, titulo: P.titulo || cont.c, cont: cont.c, pdas, ini: P.ini, min: P.min, n, instr: P.instr, proposito: P.proposito });
    D.planes.push(p); guardar(); S.f = null; ir("plan", { id: p.id }, true); toast("Planeación creada con sus instrumentos de evaluación."); }; };

VISTAS.plan = () => { const p = plDe(S.id); if (!p) return VISTAS.planes(); const e = escDe(p.escId), gs = p.grupos.map(grDe).filter(Boolean), g0 = gs[0], fechas = g0 ? fechasClase(g0, p.ini, p.sesiones.length) : [];
  const tab = S.tab || "ses";
  return barra("Planeación", esc(p.titulo), `<button class="btn s" id="bImpP" aria-label="Imprimir">${ic("impr", 18)}</button>`) + `<main class="wrap">
  <section class="card mt"><p class="small muted">${esc(e ? e.nombre : "")} · ${gs.map(grNom).join(", ")} · ${p.sesiones.length} sesiones de ${p.min} min · desde ${fLarga(p.ini)}</p>
   <p class="mt"><b>Contenido:</b> ${esc(p.cont)}</p>${Object.entries(p.pdas).map(([gr, t]) => `<p class="small mt"><b>PDA ${gr}.°:</b> ${esc(t)}</p>`).join("")}
   ${p.proposito ? `<p class="small mt"><b>Propósito:</b> ${esc(p.proposito)}</p>` : ""}${e && e.supEF ? `<p class="small muted mt">${ic("sup", 16)} Supervisa: ${esc(e.supEF)}</p>` : ""}
   <div class="fila mt"><button class="btn s" id="bEnvP">${ic("correo", 16)} Enviar al supervisor(a)</button><button class="btn s r" id="bBorP">${ic("basura", 16)} Borrar</button></div></section>
  <div class="chips mt" role="tablist"><button class="chip" data-t="ses" aria-pressed="${tab === "ses"}">Sesiones</button><button class="chip" data-t="ins" aria-pressed="${tab === "ins"}">Instrumentos</button><button class="chip" data-t="jue" aria-pressed="${tab === "jue"}">Fichero de juegos</button></div>
  ${tab === "ses" ? `<div class="mt">${p.sesiones.map((s, i) => sesionHTML(p, s, i, fechas[i])).join("")}</div>` : ""}
  ${tab === "ins" ? instrumentosHTML(p) : ""}
  ${tab === "jue" ? `<div class="puertas mt">${Object.entries(JUEGOS).map(([k, j]) => `<div class="card" style="margin:0">${plano(j.plano)}<h3 class="mt">${esc(j.n)}</h3><p class="small muted">${esc(j.est)} · ${j.min} min · ${(j.mat || []).map(m => (EF_MAT.find(x => x[0] === m) || [m, m])[1]).join(", ") || "sin material"}</p><ol class="small" style="padding-left:18px;margin:8px 0 0">${j.reglas.map(r => `<li>${esc(r)}</li>`).join("")}</ol></div>`).join("")}</div>` : ""}
  </main>`; };
function sesionHTML(p, s, i, f) { const ab = S.ab === s.id, J = k => JUEGOS[k] || { n: k };
  return `<article class="ses"><button class="ses-cab" data-s="${s.id}"><span class="d">${f ? `<small>${DSEM[dF(f).getDay()]}</small><b>${dF(f).getDate()}</b><small>${MES[dF(f).getMonth()]}</small>` : `<b>${i + 1}</b>`}</span><span class="tx"><span class="tag" style="background:${EST_COL[s.est] || "#555"}22;color:${EST_COL[s.est] || "#555"}">${esc(s.est)}</span><b>${i + 1}. ${esc(s.t)}</b><small class="muted">${esc(s.para)}</small></span></button>
   ${ab ? `<div class="ses-cuerpo"><div class="mom"><b>Inicio</b><div><p class="small">${esc(s.charla)}</p><p class="small mt"><b>Activación:</b> ${esc(J(s.act).n)}</p></div></div>
    <div class="mom"><b>Desarrollo</b><div>${s.ppal.map(k => `<p class="small"><b>${esc(J(k).n)}</b> · ${esc((J(k).reglas || []).join(" "))}</p>`).join("")}${s.mg ? `<p class="small muted mt">${Object.entries(s.mg).map(([k, v]) => `Fase ${k}: ${esc(v)}`).join(" · ")}</p>` : ""}</div></div>
    <div class="mom"><b>Cierre</b><div><p class="small"><b>Vuelta a la calma:</b> ${esc(J(s.calma).n)}</p><p class="small">${s.cierre.map(esc).join(" ")}</p></div></div>
    <div class="mom"><b>Evaluación</b><div><p class="small">${esc(s.eval)}</p></div></div>
    ${s.planB ? `<div class="mom"><b>Plan B</b><div><p class="small">Si llueve o hace mucho calor: ${esc(J(s.planB).n)} (bajo techo o a la sombra).</p></div></div>` : ""}
    <div class="fila"><button class="btn s" data-es="${s.id}">${ic("lapiz", 16)} Editar sesión</button></div></div>` : ""}</article>`; }
function instrumentosHTML(p) { return `<section class="card mt"><h3>Criterios de evaluación</h3><p class="small muted mb">Se generaron a partir de los PDA. Edítelos si lo necesita: se usan en los tres instrumentos.</p>
  <div class="lista">${p.criterios.map((c, i) => `<div class="it"><span class="av">${i + 1}</span><span class="tx"><b>${esc(c.c)}</b><small>${esc(c.t)} · ${c.gr === "todos" ? "todos los grados" : c.gr + ".°"}</small></span><button class="btn s" data-ec="${c.id}">${ic("lapiz", 16)}</button></div>`).join("")}</div>
  <div class="fila mt"><button class="btn s" id="bNC">${ic("mas", 16)} Criterio</button></div></section>
  <section class="card mt"><h3>Rúbrica</h3><div class="tw"><table class="ins-t"><thead><tr><th>Criterio</th>${NIV_R.map(n => `<th>${n[1]} (${n[0]})</th>`).join("")}</tr></thead><tbody>${p.criterios.map(c => `<tr><td><b>${esc(c.c)}</b></td>${[1, 2, 3, 4].map(k => `<td>${esc(c.d[k])}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>
  <section class="card mt"><h3>Lista de cotejo</h3><div class="tw"><table class="ins-t"><thead><tr><th>Indicador</th><th>Sí</th><th>No</th></tr></thead><tbody>${p.criterios.map(c => `<tr><td>${esc(c.t)}</td><td></td><td></td></tr>`).join("")}</tbody></table></div></section>
  <section class="card mt"><h3>Escala estimativa</h3><div class="tw"><table class="ins-t"><thead><tr><th>Indicador</th>${NIV_E.map(n => `<th>${n[1]}</th>`).join("")}</tr></thead><tbody>${p.criterios.map(c => `<tr><td>${esc(c.t)}</td><td></td><td></td><td></td><td></td></tr>`).join("")}</tbody></table></div>
  <p class="small muted mt">Para la calificación: Destacado o Siempre = 10 · Logrado o Casi siempre ≈ 9 · En proceso o A veces ≈ 7 · Requiere apoyo o Nunca = 6; Sí = 10, No = 6. Se promedian todos los registros del trimestre.</p></section>`; }
ENLAZAR.plan = () => { const p = plDe(S.id); if (!p) return; const re = () => { const y = window.scrollY; pintar(); window.scrollTo(0, y); };
  $$("[data-t]").forEach(b => b.onclick = () => { S.tab = b.dataset.t; re(); }); $$("[data-s]").forEach(b => b.onclick = () => { S.ab = S.ab === b.dataset.s ? null : b.dataset.s; re(); });
  $("#bImpP").onclick = () => imprimir(docPlan(p)); $("#bEnvP").onclick = () => enviarPlan(p);
  $("#bBorP").onclick = async () => { if (!(await confirmar("¿Borrar esta planeación? Las clases ya registradas se conservan."))) return; D.planes = D.planes.filter(x => x !== p); guardar(); history.back(); };
  $$("[data-es]").forEach(b => b.onclick = () => { const s = p.sesiones.find(x => x.id === b.dataset.es), opJ = sel => Object.entries(JUEGOS).map(([k, j]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${esc(j.n)}</option>`).join("");
    dlg(`<h3>Editar sesión</h3><label class="campo"><span>Título</span><input id="sT" value="${esc(s.t)}"></label><label class="campo"><span>Para qué</span><textarea id="sP">${esc(s.para)}</textarea></label>
     <label class="campo"><span>Plática inicial</span><textarea id="sC">${esc(s.charla)}</textarea></label>
     <div class="dos"><label class="campo"><span>Activación</span><select id="sA">${opJ(s.act)}</select></label><label class="campo"><span>Juego principal</span><select id="sJ">${opJ(s.ppal[0])}</select></label></div>
     <div class="dos"><label class="campo"><span>Segundo juego (opcional)</span><select id="sJ2"><option value="">—</option>${opJ(s.ppal[1])}</select></label><label class="campo"><span>Vuelta a la calma</span><select id="sK">${opJ(s.calma)}</select></label></div>
     <label class="campo"><span>Qué observar para evaluar</span><textarea id="sE">${esc(s.eval)}</textarea></label>
     <div class="fila fin"><button class="btn" id="sX">Cancelar</button><button class="btn p" id="sOk">Guardar</button></div>`, v => {
      v.querySelector("#sX").onclick = cerrarDlg; v.querySelector("#sOk").onclick = () => { Object.assign(s, { t: val("sT"), para: val("sP"), charla: val("sC"), act: val("sA"), ppal: [val("sJ"), val("sJ2")].filter(Boolean), calma: val("sK"), eval: val("sE") }); guardar(); re(); }; }); });
  const formC = c => { const n = !c; c = c || { id: uid(), gr: "todos" };
    dlg(`<h3>${n ? "Nuevo criterio" : "Editar criterio"}</h3><label class="campo"><span>Indicador completo</span><textarea id="cT">${esc(c.t || "")}</textarea></label><label class="campo"><span>Nombre corto (se ve en la clase)</span><input id="cC" value="${esc(c.c || "")}"></label>
     <div class="fila fin">${n ? "" : `<button class="btn r" id="cB">${ic("basura", 16)}</button>`}<button class="btn" id="cX">Cancelar</button><button class="btn p" id="cOk">Guardar</button></div>`, v => {
      v.querySelector("#cX").onclick = cerrarDlg; if (!n) v.querySelector("#cB").onclick = () => { p.criterios = p.criterios.filter(x => x !== c); guardar(); re(); };
      v.querySelector("#cOk").onclick = () => { c.t = val("cT").trim(); if (!c.t) return; c.c = val("cC").trim() || etiquetaCorta(c.t); c.d = descriptores(c); if (n) p.criterios.push(c); guardar(); re(); }; }); };
  $$("[data-ec]").forEach(b => b.onclick = () => formC(p.criterios.find(x => x.id === b.dataset.ec))); if ($("#bNC")) $("#bNC").onclick = () => formC(null); };

/* ---------- agenda ---------- */
VISTAS.agenda = () => { const ini = hoy(), d = dF(ini); d.setDate(d.getDate() + 20); const L = agendaDe(ini, iso(d)), dias = [...new Set(L.map(x => x.f))];
  return barra("Agenda", "Próximas sesiones") + `<main class="wrap">${dias.map(f => `<h2 class="sec-t">${fCorta(f)}${f === ini ? " · hoy" : ""}</h2><div class="lista">${L.filter(x => x.f === f).map(x => `<button class="it btnit" data-g="${x.g.id}"><span class="av">${x.g.grado}°${esc(x.g.grupo || "")}</span><span class="tx"><b>${x.n}. ${esc(x.s.t)}</b><small>${esc(escDe(x.g.escId).nombre)} · ${esc(x.p.titulo)}</small></span>${x.dada ? `<span class="tag">Dada</span>` : ""}</button>`).join("")}</div>`).join("") || `<div class="vacio mt">No hay sesiones en las próximas tres semanas. Cree una planeación para sus grupos.</div>`}
  ${SIN_CLASE.filter(([a]) => a >= ini).slice(0, 3).length ? `<h2 class="sec-t">Sin clases (calendario oficial de BC)</h2><div class="lista">${SIN_CLASE.filter(([a]) => a >= ini).slice(0, 4).map(([a, b, t]) => `<div class="it"><span class="av" style="background:var(--maiz-s);color:var(--maiz-d)">${ic("agenda", 18)}</span><span class="tx"><b>${esc(t)}</b><small>${fCorta(a)}${b !== a ? " a " + fCorta(b) : ""}</small></span></div>`).join("")}</div>` : ""}</main>`; };
ENLAZAR.agenda = () => $$("[data-g]").forEach(b => b.onclick = () => { const g = grDe(b.dataset.g), c = nuevaClase(); c.escId = g.escId; c.grupoId = g.id; prepararAsis(c); ir("clase", { paso: 3, c }); });

/* ---------- la clase: escuela → grupo → lista → sesión → evaluar ---------- */
function nuevaClase() { return { id: uid(), fecha: hoy(), ini: hora(), escId: null, grupoId: null, asis: {}, ret: {}, planId: null, sesId: null, instr: null, evals: {}, obs: {} }; }
function prepararAsis(c) { const prev = D.clases.find(x => x.grupoId === c.grupoId && x.fecha === c.fecha); if (prev) { Object.assign(c, JSON.parse(JSON.stringify(prev))); c.reabierta = true; } }
function guardarClase(c) { const i = D.clases.findIndex(x => x.id === c.id); const copia = JSON.parse(JSON.stringify(c)); delete copia.reabierta; if (i >= 0) D.clases[i] = copia; else D.clases.push(copia); guardar(); }
VISTAS.clase = () => { const c = S.c, p = S.paso, pasos = `<div class="pasos">${[1, 2, 3, 4, 5].map(k => `<span class="${k <= p ? "on" : ""}"></span>`).join("")}</div>`;
  if (p === 1) { const dia = new Date().getDay(); return barra("Iniciar clase", "¿En qué escuela?") + `<main class="wrap">${pasos}<div class="lista mt">${D.escuelas.slice().sort((a, b) => ((b.dias || []).includes(dia)) - ((a.dias || []).includes(dia))).map(e => `<button class="it btnit" data-e="${e.id}"><span class="av">${ic("escuela", 18)}</span><span class="tx"><b>${esc(e.nombre)}</b><small>${gruposDe(e.id).length} grupos · ${(e.dias || []).map(d => DSEM[d]).join(", ")}</small></span>${(e.dias || []).includes(dia) ? `<span class="tag m">Hoy</span>` : ""}</button>`).join("") || `<div class="vacio">Registre primero sus escuelas.</div>`}</div></main>`; }
  const e = escDe(c.escId);
  if (p === 2) return barra(esc(e.nombre), "¿Qué grupo?") + `<main class="wrap">${pasos}<div class="lista mt">${gruposDe(e.id).map(g => { const s = siguienteSesion(g.id), ya = D.clases.some(x => x.grupoId === g.id && x.fecha === c.fecha);
    return `<button class="it btnit" data-g="${g.id}"><span class="av" style="background:var(--noche);color:#fff">${g.grado}°${esc(g.grupo || "")}</span><span class="tx"><b>${grNom(g)} · ${activos(g).length} alumnos</b><small>${s ? `Sigue: ${s.n}. ${esc(s.ses.t)}` : "Sin planeación pendiente"}</small></span>${ya ? `<span class="tag">Ya registrada hoy</span>` : ""}</button>`; }).join("") || `<div class="vacio">Esta escuela no tiene grupos.</div>`}</div></main>`;
  const g = grDe(c.grupoId), al = activos(g).filter(a => !a.alta || a.alta <= c.fecha);
  if (p === 3) { const cnt = k => al.filter(a => c.asis[a.id] === k).length, sin = al.filter(a => !c.asis[a.id]).length;
    return barra(`${esc(e.nombre)} · ${grNom(g)}`, "Pasar lista", `<input type="date" id="cF" value="${c.fecha}" style="min-height:44px;border:1px solid var(--hilo);border-radius:12px;padding:0 8px;background:#fff;max-width:150px">`) + `<main class="wrap">${pasos}
    ${c.reabierta ? `<div class="aviso mt">Esta clase ya se había registrado hoy: puede corregirla.</div>` : ""}
    <div class="resumen"><span><b>${cnt("P")}</b> presentes</span><span><b>${cnt("R")}</b> retardos</span><span><b>${cnt("F")}</b> faltas</span><span><b>${cnt("J")}</b> justificadas</span>${sin ? `<span class="tag m" style="align-self:center">${sin} sin marcar</span>` : ""}</div>
    <div class="fila mb"><button class="btn s" id="bTodos">${ic("check", 16)} Todos presentes</button><span class="small muted">P presente · R retardo · F falta · J justificada</span></div>
    <div class="asis">${al.map((a, i) => `<div class="al"><span class="no">${i + 1}</span><span class="n">${esc(a.nombre)}${c.asis[a.id] === "R" && c.ret[a.id] ? `<small>Llegó ${c.ret[a.id]}</small>` : ""}</span><div class="est">${["P", "R", "F", "J"].map(k => `<button class="${k}" data-a="${a.id}" data-k="${k}" aria-pressed="${c.asis[a.id] === k}" aria-label="${k}">${k}</button>`).join("")}</div></div>`).join("") || `<div class="vacio">El grupo no tiene alumnos. Agréguelos en Mis escuelas.</div>`}</div></main>
    <div class="fijo"><div class="in"><button class="btn p" id="bSig" ${sin ? "disabled" : ""}>Siguiente: elegir sesión</button></div></div>`; }
  if (p === 4) { const sig = siguienteSesion(g.id), pls = planesDeGrupo(g.id);
    return barra(`${grNom(g)} · ${esc(e.nombre)}`, "¿Qué sesión toca?") + `<main class="wrap">${pasos}
    ${sig ? `<div class="card mt" style="border-color:var(--jade);box-shadow:0 0 0 2px var(--jade-s)"><span class="tag">La que sigue según su agenda${sig.fecha ? " · " + fCorta(sig.fecha) : ""}</span><h3 class="mt">${sig.n}. ${esc(sig.ses.t)}</h3><p class="small muted">${esc(sig.plan.titulo)} · ${esc(sig.ses.para)}</p><div class="fila mt"><button class="btn p" data-pl="${sig.plan.id}" data-se="${sig.ses.id}">${ic("play", 16)} Dar esta sesión</button></div></div>` : `<div class="aviso mt">Este grupo no tiene sesiones pendientes. Puede dar la clase sin planeación (solo lista y observaciones) o crear una.</div>`}
    ${pls.map(pl => { const dadas = sesionesDadas(g.id, pl.id); return `<h2 class="sec-t">${esc(pl.titulo)}<small>${dadas.size} de ${pl.sesiones.length} sesiones dadas</small></h2><div class="lista">${pl.sesiones.map((s, i) => `<button class="it btnit" data-pl="${pl.id}" data-se="${s.id}"><span class="av">${i + 1}</span><span class="tx"><b>${esc(s.t)}</b><small>${esc(s.est)}</small></span>${dadas.has(s.id) ? `<span class="tag">Dada</span>` : ""}</button>`).join("")}</div>`; }).join("")}
    <div class="fila mt2"><button class="btn" id="bSinPl">Clase sin planeación</button><button class="btn" id="bNuevaPl">${ic("mas", 16)} Nueva planeación</button></div></main>`; }
  /* paso 5: evaluar durante la clase */
  const pl = plDe(c.planId), ses = pl && pl.sesiones.find(s => s.id === c.sesId), presentes = al.filter(a => ["P", "R"].includes(c.asis[a.id])), ausentes = al.filter(a => ["F", "J"].includes(c.asis[a.id]));
  const tipo = c.instr || (pl && pl.instr) || "obs", crits = pl ? pl.criterios.filter(k => k.gr === "todos" || k.gr == g.grado || !Object.keys(pl.pdas).includes(String(g.grado))) : []; const crit = crits.find(k => k.id === S.crit) || crits[0];
  const niveles = tipo === "rubrica" ? NIV_R : tipo === "escala" ? NIV_E : tipo === "cotejo" ? [[1, "Sí"], [0, "No"]] : [];
  const J = k => JUEGOS[k] || { n: k, reglas: [] };
  return barra(`${grNom(g)} · ${esc(e.nombre)}`, ses ? esc(ses.t) : "Clase sin planeación", `<span class="reloj" id="reloj"></span>`) + `<main class="wrap">${pasos}
   ${ses ? `<section class="guia"><h3>${esc(ses.t)}</h3><p>${esc(ses.para)}</p>
    <details><summary>Inicio · ${esc(J(ses.act).n)}</summary><p>${esc(ses.charla)}</p><ol>${J(ses.act).reglas.map(r => `<li>${esc(r)}</li>`).join("")}</ol></details>
    ${ses.ppal.map(k => `<details><summary>Desarrollo · ${esc(J(k).n)}</summary>${plano(J(k).plano || "dispersos")}<ol>${J(k).reglas.map(r => `<li>${esc(r)}</li>`).join("")}</ol><p><b>Más fácil:</b> ${esc(J(k).facil || "")}<br><b>Más difícil:</b> ${esc(J(k).dificil || "")}<br><b>Seguridad:</b> ${esc(J(k).seg || "")}</p></details>`).join("")}
    <details><summary>Cierre · ${esc(J(ses.calma).n)}</summary><ol>${J(ses.calma).reglas.map(r => `<li>${esc(r)}</li>`).join("")}</ol><p>${ses.cierre.map(esc).join(" ")}</p></details>
    <details><summary>Qué observar</summary><p>${esc(ses.eval)}</p></details></section>` : ""}
   <section class="card mt"><div class="fila" style="justify-content:space-between"><h3 style="margin:0">Evaluar</h3>${pl ? `<select id="cIns" style="min-height:44px;border:1px solid var(--hilo);border-radius:12px;padding:0 10px;background:#fff">${Object.entries(TIPOS).map(([k, t]) => `<option value="${k}" ${k === tipo ? "selected" : ""}>${t}</option>`).join("")}<option value="obs" ${tipo === "obs" ? "selected" : ""}>Solo observaciones</option></select>` : ""}</div>
    <p class="small muted mt">${presentes.length} alumnos en clase${ausentes.length ? ` · ${ausentes.length} no asistieron (no aparecen)` : ""}. Elija un criterio y marque a cada alumno mientras juegan.</p>
    ${tipo !== "obs" && crits.length ? `<div class="crit-tabs mt">${crits.map((k, i) => { const hechos = presentes.filter(a => ((c.evals[a.id] || {})[k.id])).length; return `<button data-cr="${k.id}" aria-pressed="${crit && k.id === crit.id}"><i>Criterio ${i + 1} · ${hechos}/${presentes.length}</i>${esc(k.c)}</button>`; }).join("")}</div>
    ${tipo === "rubrica" && crit ? `<div class="leyenda">${NIV_R.map(([v, t]) => `<span title="${esc(crit.d[v])}"><i style="background:${["", "var(--rojo)", "var(--maiz)", "var(--jade)", "var(--anil)"][v]}"></i>${v} ${t}</span>`).join("")}</div>` : ""}` : ""}
   </section>
   <div class="asis mt">${presentes.map(a => { const r = crit && (c.evals[a.id] || {})[crit.id]; return `<div class="al ev"><span class="n">${esc(a.nombre)}${c.asis[a.id] === "R" ? `<small>Retardo ${c.ret[a.id] || ""}</small>` : ""}</span>
     ${tipo !== "obs" && crit ? `<div class="niv">${niveles.map(([v, t]) => `<button data-a="${a.id}" data-v="${v}" aria-pressed="${r && r.t === tipo && +r.v === v}" title="${esc(t)}">${tipo === "cotejo" ? t : tipo === "escala" ? t.split(" ").map(w => w[0]).join("").toUpperCase() : v}</button>`).join("")}</div>` : ""}
     <button class="obs-b ${c.obs[a.id] ? "on" : ""}" data-o="${a.id}" aria-label="Observación">${ic("nota", 18)}</button></div>`; }).join("") || `<div class="vacio">No hay alumnos presentes.</div>`}</div>
   ${ausentes.length ? `<div class="fila mt"><button class="btn s" id="bTarde">${ic("reloj", 16)} Llegó un alumno tarde</button></div>` : ""}
   <label class="campo mt2"><span>Nota de la clase (opcional)</span><textarea id="cNota" placeholder="Cómo salió la sesión, qué ajustar…">${esc(c.nota || "")}</textarea></label></main>
   <div class="fijo"><div class="in"><button class="btn p" id="bFin">${ic("check", 18)} Terminar y guardar clase</button></div></div>`; };
ENLAZAR.clase = () => { const c = S.c, p = S.paso, re = () => { const y = window.scrollY; pintar(); window.scrollTo(0, y); };
  if (p === 1) $$("[data-e]").forEach(b => b.onclick = () => { c.escId = b.dataset.e; pasoClase(2); });
  if (p === 2) $$("[data-g]").forEach(b => b.onclick = () => { c.grupoId = b.dataset.g; prepararAsis(c); pasoClase(3); });
  if (p === 3) { const g = grDe(c.grupoId);
    $("#cF").onchange = ev => { const f = ev.target.value; if (!f) return; const id = c.id; c.fecha = f; const prev = D.clases.find(x => x.grupoId === c.grupoId && x.fecha === f); if (prev) { Object.assign(c, JSON.parse(JSON.stringify(prev))); c.reabierta = true; } else { c.id = c.reabierta ? uid() : id; c.reabierta = false; } re(); };
    $("#bTodos").onclick = () => { activos(g).forEach(a => { if (!c.asis[a.id]) c.asis[a.id] = "P"; }); re(); };
    $$(".est button").forEach(b => b.onclick = () => { const a = b.dataset.a, k = b.dataset.k; c.asis[a] = k; if (k === "R") c.ret[a] = c.ret[a] || hora(); else delete c.ret[a]; re(); });
    $("#bSig") && ($("#bSig").onclick = () => pasoClase(4)); }
  if (p === 4) { $$("[data-pl]").forEach(b => b.onclick = () => { c.planId = b.dataset.pl; c.sesId = b.dataset.se; const pl = plDe(c.planId); c.instr = c.instr || pl.instr; pasoClase(5); });
    $("#bSinPl").onclick = () => { c.planId = null; c.sesId = null; c.instr = "obs"; pasoClase(5); }; $("#bNuevaPl").onclick = () => ir("planNueva", { f: { escId: c.escId, grupos: [c.grupoId], cont: null, ini: c.fecha, sem: 4, min: 50, instr: "rubrica" } }); }
  if (p === 5) { const t0 = Date.now(), rl = $("#reloj"); const tick = () => { if (!document.body.contains(rl)) return clearInterval(tick.i); const [h, m] = c.ini.split(":").map(Number), d = new Date(); d.setHours(h, m, 0); const mn = Math.max(0, Math.floor((Date.now() - d) / 60000)); rl.textContent = mn < 600 ? mn + " min" : ""; };
    tick(); tick.i = setInterval(tick, 20000);
    $("#cIns") && ($("#cIns").onchange = ev => { c.instr = ev.target.value; re(); }); $$("[data-cr]").forEach(b => b.onclick = () => { S.crit = b.dataset.cr; re(); });
    $$(".niv button").forEach(b => b.onclick = () => { const pl = plDe(c.planId), g = grDe(c.grupoId); const crs = pl.criterios.filter(k => k.gr === "todos" || k.gr == g.grado || !Object.keys(pl.pdas).includes(String(g.grado))); const cr = crs.find(k => k.id === S.crit) || crs[0]; const tipo = c.instr || pl.instr;
      const ev = c.evals[b.dataset.a] = c.evals[b.dataset.a] || {}; const v = +b.dataset.v; if (ev[cr.id] && ev[cr.id].t === tipo && +ev[cr.id].v === v) delete ev[cr.id]; else ev[cr.id] = { t: tipo, v }; guardarClase(c); re(); });
    $$("[data-o]").forEach(b => b.onclick = () => { const a = activos(grDe(c.grupoId)).find(x => x.id === b.dataset.o);
      dlg(`<h3>Observación · ${esc(corto(a.nombre))}</h3><label class="campo"><span>Lo que observó (se usa en la evaluación cualitativa)</span><textarea id="oT" placeholder="Propone estrategias a su equipo; le cuesta respetar turnos…">${esc(c.obs[a.id] || "")}</textarea></label>
       <div class="chips mb">${["Coopera con su equipo.", "Propone estrategias.", "Le cuesta respetar turnos.", "Muestra mejor coordinación.", "Necesita apoyo en el equilibrio.", "Anima a sus compañeros."].map(t => `<button class="chip" data-x="${esc(t)}">${esc(t)}</button>`).join("")}</div>
       <div class="fila fin"><button class="btn" id="oX">Cancelar</button><button class="btn p" id="oOk">Guardar</button></div>`, v => {
        v.querySelectorAll("[data-x]").forEach(x => x.onclick = () => { const t = $("#oT"); t.value = (t.value + " " + x.dataset.x).trim(); });
        v.querySelector("#oX").onclick = cerrarDlg; v.querySelector("#oOk").onclick = () => { const t = val("oT").trim(); if (t) c.obs[a.id] = t; else delete c.obs[a.id]; guardarClase(c); re(); }; }); });
    $("#bTarde") && ($("#bTarde").onclick = () => { const g = grDe(c.grupoId), aus = activos(g).filter(a => ["F", "J"].includes(c.asis[a.id]));
      dlg(`<h3>¿Quién llegó?</h3><p class="small muted mb">Se marcará con retardo a las ${hora()} y aparecerá para evaluarlo.</p><div class="lista">${aus.map(a => `<button class="it btnit" data-t="${a.id}"><span class="av">${iniciales(a.nombre)}</span><span class="tx"><b>${esc(a.nombre)}</b></span></button>`).join("")}</div>`, v => {
        v.querySelectorAll("[data-t]").forEach(x => x.onclick = () => { c.asis[x.dataset.t] = "R"; c.ret[x.dataset.t] = hora(); guardarClase(c); cerrarDlg(); re(); toast("Retardo registrado."); }); }); });
    $("#cNota").onchange = ev => { c.nota = ev.target.value; guardarClase(c); };
    $("#bFin").onclick = () => { c.nota = val("cNota"); c.fin = hora(); guardarClase(c); const g = grDe(c.grupoId); const n = PILA.length; S = { v: "inicio" }; PILA.length = 0; if (n) history.go(-n); pintar(); toast(`Clase de ${grNom(g)} guardada.`); }; } };

/* ---------- evaluación del trimestre ---------- */
VISTAS.evaluacion = () => { const k = hoy(), corteAct = D.cortes.find(x => k >= x.ini && k <= x.fin) || D.cortes[0];
  const E = S.e = S.e || { corte: corteAct.id, ini: corteAct.ini, fin: corteAct.fin, escId: (D.escuelas[0] || {}).id, grupoId: null, over: {} };
  const e = escDe(E.escId), gs = e ? gruposDe(e.id) : [], g = grDe(E.grupoId) || gs[0]; if (g) E.grupoId = g.id;
  const filas = g ? filasEval(g, E) : [];
  return barra("Evaluación", "Evaluación del periodo") + `<main class="wrap">
  <section class="card mt"><div class="chips">${D.cortes.map(x => `<button class="chip" data-co="${x.id}" aria-pressed="${E.corte === x.id}">${esc(x.n)}</button>`).join("")}<button class="chip" data-co="libre" aria-pressed="${E.corte === "libre"}">Hacer corte</button></div>
   <div class="dos mt"><label class="campo"><span>Del</span><input type="date" id="eI" value="${E.ini}"></label><label class="campo"><span>Al</span><input type="date" id="eF" value="${E.fin}"></label></div>
   <label class="campo"><span>Escuela</span><select id="eE">${D.escuelas.map(x => `<option value="${x.id}" ${x.id === E.escId ? "selected" : ""}>${esc(x.nombre)}</option>`).join("")}</select></label>
   <div class="chips">${gs.map(x => `<button class="chip" data-gr="${x.id}" aria-pressed="${g && x.id === g.id}">${grNom(x)}</button>`).join("")}</div></section>
  ${g ? `<section class="card mt"><div class="fila" style="justify-content:space-between"><div><h3 style="margin:0">${grNom(g)} · ${esc(e.nombre)}</h3><p class="small muted">${clasesEn(g.id, E.ini, E.fin).length} clases registradas del ${fCorta(E.ini)} al ${fCorta(E.fin)} · Docente: ${esc(g.docente || "—")}</p></div></div>
   <div class="chips mt"><button class="chip" data-al="g" aria-pressed="${E.alcance !== "e"}">Solo ${grNom(g)}</button><button class="chip" data-al="e" aria-pressed="${E.alcance === "e"}">Todos los grupos (${gs.length})</button></div>
   <div class="fila mt"><button class="btn s" id="bImpG">${ic("impr", 16)} Imprimir</button><button class="btn s" id="bPdfG">${ic("bajar", 16)} PDF</button><button class="btn s" id="bDocG">${ic("doc", 16)} Word</button><button class="btn s p" id="bEnvG">${ic("correo", 16)} ${E.alcance === "e" ? "Enviar a la dirección" : "Enviar al docente del grupo"}</button></div>
   <details class="mt"><summary class="small" style="cursor:pointer;font-weight:700;min-height:36px">Clases registradas del grupo (para corregir lista o evaluaciones)</summary><div class="lista mt">${clasesEn(g.id, E.ini, E.fin).slice().reverse().map(c => { const pl = plDe(c.planId), ss = pl && pl.sesiones.find(x => x.id === c.sesId), nev = Object.values(c.evals || {}).filter(v => Object.keys(v).length).length;
     return `<div class="it"><span class="av" style="font-size:12px">${dF(c.fecha).getDate()}/${dF(c.fecha).getMonth() + 1}</span><span class="tx"><b>${esc(ss ? ss.t : "Clase sin planeación")}</b><small>${fCorta(c.fecha)} · ${nev} alumnos evaluados</small></span><button class="btn s" data-cl="${c.id}" data-pa="3">Lista</button><button class="btn s p" data-cl="${c.id}" data-pa="5">Evaluación</button></div>`; }).join("") || `<p class="small muted">Sin clases en el periodo.</p>`}</div></details></div></section>
   <div class="evl mt">${filas.map((f, k) => `<article class="evc"><div class="evc-c"><span class="no">${k + 1}</span><div class="tx"><b>${esc(f.a.nombre)}</b>${f.a.baja ? ` <span class="tag r">Baja ${fCorta(f.a.baja)}</span>` : ""}
    <div class="dat"><span>Asistió <b>${f.r.asis}/${f.r.total}</b></span><span>Faltas <b>${f.r.falt}</b>${f.r.just ? ` +${f.r.just} just.` : ""}</span><span>Retardos <b>${f.r.ret}</b></span><span>${f.r.nreg} registros</span></div></div>
    <div class="calw"><div class="calb"><button data-menos="${f.a.id}" aria-label="Bajar calificación" ${f.cal == null || f.cal <= 6 ? "disabled" : ""}>−</button><span class="cal ${f.cal == null ? "x" : f.cal >= 8 ? "" : f.cal >= 7 ? "b" : "r"}">${f.cal ?? "—"}</span><button data-mas="${f.a.id}" aria-label="Subir calificación" ${f.cal != null && f.cal >= 10 ? "disabled" : ""}>+</button></div>
     <small>${f.editCal ? `ajustada · era ${f.r.cal ?? "—"} <button class="lnk" data-rest="${f.a.id}">restablecer</button>` : "calculada"}</small></div></div>
    <textarea data-ob="${f.a.id}" aria-label="Valoración cualitativa">${esc(f.obs)}</textarea></article>`).join("") || `<div class="vacio">Sin alumnos.</div>`}</div>
   <p class="small muted mt">La calificación sale del promedio de todos los registros de los instrumentos en el periodo (6 a 10). Puede ajustarla y editar la valoración; sus cambios se guardan para este periodo.</p>` : `<div class="vacio mt">Registre grupos para evaluar.</div>`}</main>`; };
function clavePer(E) { return `${E.ini}_${E.fin}`; }
function filasEval(g, E) { const cl = clasesEn(g.id, E.ini, E.fin), ov = ((D.ajustes || {})[clavePer(E)] || {});
  return (g.alumnos || []).filter(a => !(a.baja && a.baja < E.ini) && !(a.alta && a.alta > E.fin)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(a => { const r = calcAlumno(a, cl), o = ov[a.id] || {};
    return { a, r, cal: o.cal !== undefined ? o.cal : r.cal, obs: o.obs !== undefined ? o.obs : cualitativa(a, r), editCal: o.cal !== undefined }; }); }
ENLAZAR.evaluacion = () => { const E = S.e; if (!E) return; const re = () => { const y = window.scrollY; pintar(); window.scrollTo(0, y); };
  $$("[data-co]").forEach(b => b.onclick = () => { E.corte = b.dataset.co; const x = D.cortes.find(y => y.id === E.corte); if (x) { E.ini = x.ini; E.fin = x.fin; } else { E.fin = hoy(); } re(); });
  $("#eI").onchange = ev => { E.ini = ev.target.value; E.corte = "libre"; re(); }; $("#eF").onchange = ev => { E.fin = ev.target.value; E.corte = "libre"; re(); };
  $("#eE") && ($("#eE").onchange = ev => { E.escId = ev.target.value; E.grupoId = null; re(); }); $$("[data-gr]").forEach(b => b.onclick = () => { E.grupoId = b.dataset.gr; re(); });
  const aj = () => { D.ajustes = D.ajustes || {}; return D.ajustes[clavePer(E)] = D.ajustes[clavePer(E)] || {}; };
  const fila = id => filasEval(grDe(E.grupoId), E).find(f => f.a.id === id);
  const ajCal = (id, d) => { const f = fila(id), base = f.cal == null ? 8 : f.cal, n = Math.max(6, Math.min(10, base + d)), o = aj()[id] = aj()[id] || {}; if (n === f.r.cal) delete o.cal; else o.cal = n; guardar(); re(); };
  $$("[data-mas]").forEach(b => b.onclick = () => ajCal(b.dataset.mas, 1)); $$("[data-menos]").forEach(b => b.onclick = () => ajCal(b.dataset.menos, -1));
  $$("[data-rest]").forEach(b => b.onclick = ev => { ev.preventDefault(); const o = aj()[b.dataset.rest] || {}; delete o.cal; delete o.obs; guardar(); re(); toast("Se restableció la calificación y la valoración calculadas."); });
  $$("[data-al]").forEach(b => b.onclick = () => { E.alcance = b.dataset.al; re(); });
  $$("[data-cl]").forEach(b => b.onclick = () => { const c = JSON.parse(JSON.stringify(D.clases.find(x => x.id === b.dataset.cl))); c.reabierta = true; ir("clase", { paso: +b.dataset.pa, c }); });
  $$("[data-ob]").forEach(t => t.onchange = () => { const o = aj()[t.dataset.ob] = aj()[t.dataset.ob] || {}; o.obs = t.value; guardar(); });
  const g = grDe(E.grupoId); if (!g) return;
  const gsR = () => E.alcance === "e" ? gruposDe(E.escId) : [g], nomR = () => E.alcance === "e" ? `concentrado-ef-${(escDe(E.escId).cct || "escuela")}-${E.fin}` : `evaluacion-ef-${g.grado}${g.grupo}-${E.fin}`;
  $("#bImpG").onclick = () => imprimir(docEval(gsR(), E));
  $("#bPdfG").onclick = async ev => { const b = ev.currentTarget; b.disabled = true; try { await pdfDescargar(docEval(gsR(), E), nomR() + ".pdf"); } catch (e) { toast("Sin internet no se puede generar el PDF: use Imprimir → Guardar como PDF."); imprimir(docEval(gsR(), E)); } b.disabled = false; };
  $("#bDocG").onclick = () => wordDescargar(docEval(gsR(), E), nomR() + ".doc");
  $("#bEnvG").onclick = () => E.alcance === "e" ? enviarEval(gruposDe(E.escId), E, "escuela") : enviarEval([g], E, "docente"); };
/* Word: documento editable (.doc) con el mismo contenido; los logos se toman de la página publicada */
function wordDescargar(html, archivo) { const tmp = document.createElement("div"); tmp.innerHTML = html;
  /* Word no respeta el tamaño por CSS: se fija en atributos, con la proporción real de cada logo ya cargado en la página */
  const med = {}; $$("img").forEach(i => { if (i.naturalWidth) med[i.src] = i.naturalWidth / i.naturalHeight; });
  tmp.querySelectorAll("img").forEach(i => { i.removeAttribute("onerror"); i.src = new URL(i.getAttribute("src"), location.href).href; const r = med[i.src] || 1.2, h = 56, w = Math.round(h * r);
    i.setAttribute("height", h); i.setAttribute("width", w); i.style.cssText = `width:${w}px;height:${h}px`; });
  /* los datos del encabezado (rejilla) pasan a tabla de 3 columnas */
  tmp.querySelectorAll(".datos").forEach(d => { const sp = [...d.children].map(x => x.innerHTML); let t = '<table class="datos">'; for (let k = 0; k < sp.length; k += 3) t += "<tr>" + [0, 1, 2].map(n => `<td>${sp[k + n] || ""}</td>`).join("") + "</tr>"; d.outerHTML = t + "</table>"; });
  tmp.querySelectorAll("table").forEach(t => { t.setAttribute("width", "100%"); if (!t.matches(".enc,.firmas,.datos")) { t.setAttribute("border", "1"); t.setAttribute("cellpadding", "4"); t.setAttribute("cellspacing", "0"); } });
  tmp.querySelectorAll("table.enc td.t").forEach(td => { td.setAttribute("align", "center"); td.setAttribute("width", "70%"); });
  tmp.querySelectorAll("table.firmas td").forEach(td => { td.setAttribute("align", "center"); td.innerHTML = `<br><br><br>____________________________________<br>${td.innerHTML}`; });
  tmp.querySelectorAll(".salto").forEach(x => x.insertAdjacentHTML("beforebegin", '<br clear="all" style="page-break-before:always">'));
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(archivo)}</title>
   <style>@page WordSection1{size:8.5in 11in;margin:0.6in}div.WordSection1{page:WordSection1}body{font-family:Arial,sans-serif;font-size:10pt}table{border-collapse:collapse;width:100%}th,td{border:1px solid #888;padding:3pt 4pt;vertical-align:top;font-size:9pt}th{background:#E8EFEC}
   .enc td{border:0}.enc{border-bottom:2px solid #0F3B33}.datos td{border:0;font-size:9.5pt}.firmas td{border:0;text-align:center;font-size:9.5pt}.nota{font-size:8.5pt;color:#444}h2{font-size:13pt}</style></head><body><div class="WordSection1">${tmp.innerHTML}</div></body></html>`;
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff", doc], { type: "application/msword" })); a.download = archivo; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); toast("Documento de Word descargado: puede abrirlo y editarlo."); }

/* ---------- ajustes ---------- */
VISTAS.ajustes = () => {
  return barra("Ajustes", "Ajustes y respaldo") + `<main class="wrap">
  <section class="card mt"><h3>Sus datos</h3><div class="dos"><label class="campo"><span>Tratamiento</span><select id="dTr">${["", "Mtro.", "Mtra.", "Profr.", "Profra.", "Lic."].map(x => `<option ${x === D.docente.trato ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="campo"><span>Nombre</span><input id="dNom" value="${esc(D.docente.nombre)}"></label></div>
   <div class="dos"><label class="campo"><span>Correo institucional</span><input id="dCor" type="email" value="${esc(D.docente.correo)}"></label><label class="campo"><span>Celular</span><input id="dTel" value="${esc(D.docente.tel)}"></label></div><div class="fila fin"><button class="btn p s" id="bDat">Guardar</button></div></section>
  <section class="card mt"><h3>Trimestres</h3><p class="small muted mb">Fechas de corte para la evaluación. Ajústelas a las del calendario oficial del ciclo.</p>${D.cortes.map(x => `<div class="dos"><label class="campo"><span>${esc(x.n)} · inicia</span><input type="date" data-ci="${x.id}" value="${x.ini}"></label><label class="campo"><span>termina</span><input type="date" data-cf="${x.id}" value="${x.fin}"></label></div>`).join("")}</section>
  ${cuentaGoogleHTML()}
  <section class="card mt"><h3>Respaldo en archivo</h3><p class="small muted mb">Además del respaldo en su Drive, puede guardar una copia como archivo para pasarla a otro dispositivo.</p>
   <div class="fila"><button class="btn" id="bResp">${ic("bajar", 18)} Descargar respaldo</button><button class="btn" id="bRest">${ic("subir", 18)} Cargar respaldo</button><input type="file" id="fRes" accept=".json,application/json" hidden></div>
   <p class="small muted mt">${D.escuelas.length} escuelas · ${D.grupos.length} grupos · ${D.planes.length} planeaciones · ${D.clases.length} clases registradas</p></section>
  ${ghTok() ? `<section class="card mt" style="border-color:var(--anil)"><h3>Supervisión</h3><p class="small muted mb">Dar de alta a los maestros y entregarles su enlace de acceso.</p><button class="btn o" id="bAdm">${ic("sup", 18)} Accesos de maestros</button></section>` : ""}
  <section class="card mt"><h3>Instalar en su celular</h3><p class="small muted">En Android (Chrome): menú ⋮ → <b>Instalar aplicación</b>. En iPhone (Safari): botón Compartir → <b>Agregar a inicio</b>. Ya instalada, funciona sin internet.</p>${INSTALAR ? `<div class="fila mt"><button class="btn m" id="bInst">Instalar Ulama</button></div>` : ""}</section>
  <section class="card mt"><h3>Empezar de cero</h3><p class="small muted mb">Borra todos los datos de este dispositivo.</p><button class="btn r" id="bBor">${ic("basura", 16)} Borrar todo</button></section></main>`; };
ENLAZAR.ajustes = () => { $("#bDat").onclick = () => { Object.assign(D.docente, { trato: val("dTr"), nombre: val("dNom").trim(), correo: val("dCor").trim(), tel: val("dTel").trim() }); guardar(); toast("Datos guardados."); };
  $$("[data-ci]").forEach(i => i.onchange = () => { D.cortes.find(x => x.id === i.dataset.ci).ini = i.value; guardar(); }); $$("[data-cf]").forEach(i => i.onchange = () => { D.cortes.find(x => x.id === i.dataset.cf).fin = i.value; guardar(); });
  enlazarCuentaGoogle(); $("#bAdm") && ($("#bAdm").onclick = () => ir("admin"));
  $("#bResp").onclick = respaldo; $("#bRest").onclick = () => $("#fRes").click(); $("#fRes").onchange = e => restaurar(e.target.files[0]);
  $("#bInst") && ($("#bInst").onclick = async () => { INSTALAR.prompt(); await INSTALAR.userChoice; INSTALAR = null; pintar(); });
  $("#bBor").onclick = async () => { if (!(await confirmar("¿Borrar TODOS los datos de Ulama en este dispositivo? Descargue antes un respaldo."))) return; if (!(await confirmar("Última confirmación: se borrarán escuelas, grupos, planeaciones y clases."))) return; D = VACIO(); guardar(); S = { v: "bienvenida", paso: 1 }; pintar(); }; };
function respaldo() { D.cfg.ultimoResp = hoy(); guardar(); const b = new Blob([JSON.stringify(D)], { type: "application/json" }), a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `ulama-respaldo-${hoy()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast("Respaldo descargado."); }
async function restaurar(f) { if (!f) return; try { const x = typeof f.text === "function" ? JSON.parse(await f.text()) : f; if (!x || !x.v || !Array.isArray(x.escuelas)) throw 0; const g0 = D.cfg.google;
  if (D.escuelas.length && !(await confirmar(`Se reemplazarán los datos actuales por los del respaldo (${x.escuelas.length} escuelas, ${x.grupos.length} grupos, ${x.clases.length} clases). ¿Continuar?`))) return;
  D = Object.assign(VACIO(), x); D.cfg.bienvenida = true; if (g0 && !D.cfg.google) D.cfg.google = g0; guardar(); S = { v: "inicio" }; PILA.length = 0; pintar(); toast("Respaldo cargado."); } catch (e) { toast("<b>Ese archivo no es un respaldo de Ulama.</b>"); } }

/* =================================================================== DOCUMENTOS */
function logoEsc(e) { return e && e.cct ? `<img src="${IMG_T}escuelas/${esc(e.cct)}.jpg" onerror="if(!this.dataset.p){this.dataset.p=1;this.src='${IMG_T}escuelas/${esc(e.cct)}.png'}else{this.remove()}" alt="">` : ""; }
function encabezado(e, titulo) { return `<table class="enc"><tr><td style="width:90px"><img src="${IMG_T}isep.png" alt="ISEP"></td><td class="t"><b>${esc(e ? e.nombre : "")}</b><br><span>${e ? `C.C.T. ${esc(e.cct)}${e.turno ? " · Turno " + esc(e.turno) : ""}${e.zona ? " · Zona Escolar " + esc(e.zona) : ""}${e.localidad ? " · " + esc(e.localidad) : ""}` : ""}</span><br><b class="tt">${titulo}</b></td><td style="width:90px;text-align:right">${logoEsc(e)}</td></tr></table>`; }
function docEval(gs, E) { return gs.map((g, i) => { const e = escDe(g.escId), F = filasEval(g, E), con = F.filter(f => f.cal != null), prom = con.length ? (con.reduce((t, f) => t + f.cal, 0) / con.length).toFixed(1) : "—";
  return `<div class="doc ${i ? "salto" : ""}">${encabezado(e, "Evaluación de Educación Física")}
   <div class="datos"><span><b>Grupo:</b> ${grNom(g)}</span><span><b>Periodo:</b> ${fCorta(E.ini)} al ${fCorta(E.fin)}</span><span><b>Clases:</b> ${clasesEn(g.id, E.ini, E.fin).length}</span>
   <span><b>Docente del grupo:</b> ${esc(g.docente || "—")}</span><span><b>Docente de E. F.:</b> ${esc(docNombre())}</span><span><b>Promedio del grupo:</b> ${prom}</span></div>
   <table><thead><tr><th class="c">No.</th><th>Alumno(a)</th><th class="c">Asist.</th><th class="c">Faltas</th><th class="c">Retardos</th><th class="c">Calif.</th><th>Valoración del desempeño</th></tr></thead><tbody>
   ${F.map((f, k) => `<tr><td class="c">${k + 1}</td><td>${esc(f.a.nombre)}${f.a.baja ? " (baja)" : ""}</td><td class="c">${f.r.asis}/${f.r.total}</td><td class="c">${f.r.falt}${f.r.just ? ` (+${f.r.just} J)` : ""}</td><td class="c">${f.r.ret}</td><td class="c"><b>${f.cal ?? "—"}</b></td><td>${esc(f.obs)}</td></tr>`).join("")}</tbody></table>
   <p class="nota">Calificación de 6 a 10 obtenida de los registros de evaluación formativa (rúbrica, lista de cotejo y escala estimativa) de las sesiones del periodo. J = falta justificada.</p>
   <table class="firmas"><tr><td>${esc(docNombre())}<br>Docente de Educación Física</td><td>${esc(dirNombre(e) || "")}<br>Director(a) de la escuela</td></tr></table></div>`; }).join(""); }
function docPlan(p) { const e = escDe(p.escId), gs = p.grupos.map(grDe).filter(Boolean), f = gs[0] ? fechasClase(gs[0], p.ini, p.sesiones.length) : [], J = k => JUEGOS[k] || { n: k, reglas: [] };
  return `<div class="doc">${encabezado(e, "Planeación didáctica de Educación Física")}
  <div class="datos"><span><b>Grupos:</b> ${gs.map(grNom).join(", ")}</span><span><b>Periodo:</b> ${f.length ? fCorta(f[0]) + " al " + fCorta(f[f.length - 1]) : fCorta(p.ini)}</span><span><b>Sesiones:</b> ${p.sesiones.length} de ${p.min} min</span>
  <span><b>Docente:</b> ${esc(docNombre())}</span><span><b>Supervisor(a) de E. F.:</b> ${esc((e && e.supEF) || "—")}</span><span><b>Campo formativo:</b> De lo Humano y lo Comunitario</span></div>
  <table><tbody><tr><th style="width:22%">Contenido</th><td>${esc(p.cont)}</td></tr>${Object.entries(p.pdas).map(([g, t]) => `<tr><th>PDA ${g}.°</th><td>${esc(t)}</td></tr>`).join("")}${p.proposito ? `<tr><th>Propósito</th><td>${esc(p.proposito)}</td></tr>` : ""}</tbody></table>
  <h2>Secuencia de sesiones</h2><table><thead><tr><th class="c">No.</th><th>Fecha</th><th>Sesión</th><th>Inicio</th><th>Desarrollo</th><th>Cierre</th><th>Evaluación</th></tr></thead><tbody>
  ${p.sesiones.map((s, i) => `<tr><td class="c">${i + 1}</td><td>${f[i] ? fCorta(f[i]) : ""}</td><td><b>${esc(s.t)}</b><br>${esc(s.est)}. ${esc(s.para)}</td><td>${esc(J(s.act).n)}. ${esc(s.charla)}</td><td>${s.ppal.map(k => `<b>${esc(J(k).n)}</b>`).join(", ")}</td><td>${esc(J(s.calma).n)}. ${s.cierre.map(esc).join(" ")}</td><td>${esc(s.eval)}</td></tr>`).join("")}</tbody></table>
  <h2>Rúbrica</h2><table><thead><tr><th>Criterio</th>${NIV_R.map(n => `<th>${n[1]}</th>`).join("")}</tr></thead><tbody>${p.criterios.map(c => `<tr><td><b>${esc(c.c)}</b></td>${[1, 2, 3, 4].map(k => `<td>${esc(c.d[k])}</td>`).join("")}</tr>`).join("")}</tbody></table>
  <table class="firmas"><tr><td>${esc(docNombre())}<br>Docente de Educación Física</td><td>${esc((e && e.supEF) || "")}<br>Supervisor(a) de Educación Física · Vo. Bo.</td></tr></table></div>`; }
function imprimir(html, horizontal) { $("#imprimir").innerHTML = (horizontal ? "<style>@page{size:letter landscape;margin:9mm}</style>" : "") + html; const imgs = [...$("#imprimir").querySelectorAll("img")]; Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 2500); }))).then(() => setTimeout(() => window.print(), 100)); }

/* ---------- envío por correo: servidor de Tequio (con enlace) o el correo del dispositivo ---------- */
function tokAcceso() { try { const u = JSON.parse(localStorage.getItem("ulama-tok") || "null"); if (u) return u; } catch (e) {} if (D.cfg.tok) return D.cfg.tok; try { return JSON.parse(localStorage.getItem("acc-token") || "null") || ""; } catch (e) { return ""; } }
async function servidor() { try { const r = await fetch(ACCESO + "?t=" + Date.now(), { cache: "no-store" }); if (r.ok) { const j = await r.json(); if (j.tequio) { D.cfg.srv = j.tequio; guardar(); return j.tequio; } } } catch (e) {} return D.cfg.srv || TEQUIO_DEF; }
/* Para el PDF del correo: los logos van incrustados (el servidor no descarga imágenes) */
const aDataURL = async url => { const r = await fetch(url); if (!r.ok) throw 0; const bl = await r.blob(); return await new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(bl); }); };
async function absolutizar(html) { const tmp = document.createElement("div"); tmp.innerHTML = html;
  for (const i of [...tmp.querySelectorAll("img")]) { i.removeAttribute("onerror"); const src = new URL(i.getAttribute("src"), location.href).href;
    try { i.src = await aDataURL(src); } catch (e) { try { if (/\.jpg$/.test(src)) i.src = await aDataURL(src.replace(/\.jpg$/, ".png")); else throw 0; } catch (e2) { i.remove(); } } }
  return tmp.innerHTML; }
function cssDoc() { let t = ""; for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (r.selectorText && /\.doc\b/.test(r.selectorText)) t += r.cssText + "\n"; } catch (e) {} } return t; }
async function postServidor(datos) { const s = await servidor(), tok = tokAcceso(); if (!tok) throw new Error("sin-enlace"); if (navigator.onLine === false) throw new Error("sin-red");
  const r = await fetch(s, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion: "efEnviar", datos: Object.assign({ tok, quien: { nombre: D.docente.nombre, correo: D.docente.correo } }, datos) }) });
  const j = await r.json(); if (!j || !j.ok) throw new Error((j && (j.mensaje || j.error)) || "El servidor no respondió."); return j; }
function dlgEnvio(titulo, para, cc, asunto, cuerpo, html, archivo, resumenTxt) { const G = D.cfg.google && D.cfg.google.correo;
  dlg(`<h3>${titulo}</h3><label class="campo"><span>Para</span><input id="mP" value="${esc(para.filter(Boolean).join(", "))}"></label><label class="campo"><span>Con copia</span><input id="mC" value="${esc(cc.filter(Boolean).join(", "))}"></label>
   <label class="campo"><span>Asunto</span><input id="mA" value="${esc(asunto)}"></label><label class="campo"><span>Mensaje</span><textarea id="mM">${esc(cuerpo)}</textarea></label>
   <p class="small mb ${G ? "" : "muted"}">${G ? `${ic("correo", 16)} Se enviará <b>desde su correo ${esc(G)}</b> con el reporte en PDF adjunto.` : tokAcceso() ? "Se enviará con el PDF adjunto desde el servidor de la Supervisión. Para enviarlo desde su propio correo, conecte su cuenta de Google en Ajustes." : "Se abrirá su correo con el mensaje y se descargará el PDF para que lo adjunte. Para enviarlo directo, conecte su cuenta de Google en Ajustes."}</p>
   <div class="fila fin"><button class="btn" id="mPdf">${ic("bajar", 16)} Solo PDF</button><button class="btn" id="mX">Cancelar</button><button class="btn p" id="mOk">${ic("correo", 18)} Enviar</button></div>`, v => {
    v.querySelector("#mX").onclick = cerrarDlg;
    v.querySelector("#mPdf").onclick = async ev => { ev.currentTarget.disabled = true; try { await pdfDescargar(html, archivo); } catch (e) { imprimir(html); } cerrarDlg(); };
    v.querySelector("#mOk").onclick = async ev => { const b = ev.currentTarget, P = val("mP").split(/[,;\s]+/).filter(x => /@/.test(x)), C = val("mC").split(/[,;\s]+/).filter(x => /@/.test(x)); if (!P.length) return toast("Escriba al menos un correo en «Para».");
      const A = val("mA") || asunto, M = val("mM"); b.disabled = true; b.textContent = "Enviando…";
      if (G) { try { b.textContent = "Preparando PDF…"; const pdf = await pdfBase64(html); b.textContent = "Enviando…"; await gmailEnviar({ para: P, cc: C, asunto: A, mensaje: M, pdf, archivo }); cerrarDlg(); toast(`Enviado desde ${esc(G)} a ${esc(P.join(", "))}.`, 4000); return; }
        catch (e) { if (e.message === "cancelado") { b.disabled = false; b.innerHTML = `${ic("correo", 18)} Enviar`; return toast("No se dio permiso para enviar."); } toast(`<b>No se pudo enviar con Gmail</b> (${esc(e.message)}). Probando otra vía…`, 3500); } }
      try { await postServidor({ para: P, cc: C, asunto: A, mensaje: M, html: await absolutizar(html), css: cssDoc(), archivo }); cerrarDlg(); toast(`Enviado a ${esc(P.join(", "))}.`, 3500); }
      catch (e) { cerrarDlg(); if (e.message !== "sin-enlace" && e.message !== "sin-red") toast(`<b>No se pudo enviar desde el servidor</b> (${esc(e.message)}). Se abrirá su correo.`, 4000);
        location.href = `mailto:${P.join(",")}?${C.length ? "cc=" + encodeURIComponent(C.join(",")) + "&" : ""}subject=${encodeURIComponent(A)}&body=${encodeURIComponent((M || cuerpo) + "\n\n" + (resumenTxt || ""))}`;
        setTimeout(() => pdfDescargar(html, archivo).catch(() => imprimir(html)), 900); } }; }); }
function enviarEval(gs, E, a) { const e = escDe(gs[0].escId), per = `${fCorta(E.ini)} al ${fCorta(E.fin)}`, corte = (D.cortes.find(x => x.id === E.corte) || { n: "Corte de evaluación" }).n;
  const resumen = gs.map(g => `${grNom(g)}\n` + filasEval(g, E).map((f, i) => `${i + 1}. ${f.a.nombre} — Calif. ${f.cal ?? "—"} · Faltas ${f.r.falt} · Retardos ${f.r.ret}`).join("\n")).join("\n\n");
  if (a === "docente") { const g = gs[0]; dlgEnvio(`Enviar a ${esc(g.docente || "docente")} · ${grNom(g)}`, [g.correo], [D.docente.correo], `Evaluación de Educación Física · ${grNom(g)} · ${corte}`,
    `Estimado(a) ${g.docente || "docente"}:\n\nLe comparto la evaluación de Educación Física de su grupo ${grNom(g)} del periodo ${per}: calificación, valoración del desempeño y faltas de cada alumno.\n\nAtentamente,\n${docNombre()}\nDocente de Educación Física`, docEval([g], E), `evaluacion-ef-${g.grado}${g.grupo}-${E.fin}.pdf`, resumen); }
  else dlgEnvio(`Enviar a la dirección · ${esc(e.nombre)}`, [e.correo], [D.docente.correo], `Concentrado de evaluación de Educación Física · ${e.nombre} · ${corte}`,
    `${dirNombre(e) ? `${dirNombre(e)}\nDirector(a) de la escuela ${e.nombre}` : "Dirección de la escuela"}\n\nLe envío el concentrado de evaluación de Educación Física de todos los grupos (${gs.map(grNom).join(", ")}), periodo ${per}.\n\nAtentamente,\n${docNombre()}\nDocente de Educación Física`, docEval(gs, E), `concentrado-ef-${e.cct || "escuela"}-${E.fin}.pdf`, resumen); }
function enviarPlan(p) { const e = escDe(p.escId); dlgEnvio("Enviar planeación al supervisor(a)", [e && e.supCorreo], [D.docente.correo], `Planeación de Educación Física · ${p.titulo} · ${e ? e.nombre : ""}`,
  `${e && e.supEF ? e.supEF + "\nSupervisor(a) de Educación Física" : "Supervisión de Educación Física"}\n\nLe comparto para su revisión la planeación «${p.titulo}» (${p.grupos.map(grDe).filter(Boolean).map(grNom).join(", ")}, ${p.sesiones.length} sesiones desde el ${fLarga(p.ini)}).\n\nAtentamente,\n${docNombre()}\nDocente de Educación Física`, docPlan(p), `planeacion-ef-${p.ini}.pdf`, ""); }


/* ---------- listas de asistencia por mes: en blanco o con los registros ---------- */
function mesesCiclo() { const out = [], d = dF(CICLO.inicio); d.setDate(1); const fin = dF(CICLO.fin); while (d <= fin) { out.push(iso(d).slice(0, 7)); d.setMonth(d.getMonth() + 1); } return out; }
const nomMes = m => { const [y, mm] = m.split("-").map(Number); return `${MES_L[mm - 1]} ${y}`; };
function diasDelMes(g, mes, todos) { const [y, m] = mes.split("-").map(Number), out = [], d = new Date(y, m - 1, 1, 12), dias = diasGrupo(g);
  for (; d.getMonth() === m - 1; d.setDate(d.getDate() + 1)) { const k = iso(d), w = d.getDay(); if (w === 0 || w === 6 || k < CICLO.inicio || k > CICLO.fin || sinClase(k)) continue; if (todos || !dias.length || dias.includes(w)) out.push(k); }
  /* días con clase registrada aunque no sean sus días de siempre (reposiciones) */
  D.clases.filter(c => c.grupoId === g.id && c.fecha.slice(0, 7) === mes && !out.includes(c.fecha)).forEach(c => out.push(c.fecha)); return out.sort(); }
const MARCA = { P: "/", R: "R", F: "F", J: "J" };
function docLista(g, mes, o) { const e = escDe(g.escId), dias = diasDelMes(g, mes, o.todos), ini = mes + "-01", fin = mes + "-31";
  const al = (g.alumnos || []).filter(a => !(a.baja && a.baja < ini) && !(a.alta && a.alta > fin)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const cl = {}; if (o.reg) D.clases.filter(c => c.grupoId === g.id && c.fecha.slice(0, 7) === mes).forEach(c => cl[c.fecha] = c);
  const celda = (a, k) => { if (!o.reg) return ""; if ((a.alta && k < a.alta) || (a.baja && k > a.baja)) return "—"; const c = cl[k]; return c && c.asis[a.id] ? MARCA[c.asis[a.id]] : ""; };
  const tot = a => { let p = 0, r = 0, f = 0, j = 0; dias.forEach(k => { const c = cl[k], v = c && c.asis[a.id]; if (v === "P") p++; else if (v === "R") { p++; r++; } else if (v === "F") f++; else if (v === "J") j++; }); return [p, f, r, j]; };
  const extra = Math.max(0, o.extra || 0), fs = dias.length > 20 ? "7.5pt" : dias.length > 14 ? "8.5pt" : "9.5pt";
  return `<div class="doc lista-as">${encabezado(e, `Lista de asistencia de Educación Física · ${nomMes(mes)[0].toUpperCase() + nomMes(mes).slice(1)}`)}
   <div class="datos"><span><b>Grupo:</b> ${grNom(g)}</span><span><b>Docente del grupo:</b> ${esc(g.docente || "—")}</span><span><b>Docente de E. F.:</b> ${esc(docNombre())}</span></div>
   <table style="font-size:${fs}"><thead><tr><th class="c" rowspan="2" style="width:22px">No.</th><th rowspan="2">Alumno(a)</th>${dias.map(k => `<th class="c" style="padding:2px 1px">${DSEM[dF(k).getDay()][0]}</th>`).join("")}${o.reg ? `<th class="c" rowspan="2">A</th><th class="c" rowspan="2">F</th><th class="c" rowspan="2">R</th><th class="c" rowspan="2">J</th>` : `<th class="c" rowspan="2" style="width:60px">Observ.</th>`}</tr>
   <tr>${dias.map(k => `<th class="c" style="padding:2px 1px">${dF(k).getDate()}</th>`).join("")}</tr></thead><tbody>
   ${al.map((a, i) => `<tr><td class="c">${i + 1}</td><td style="white-space:nowrap">${esc(a.nombre)}${a.baja && a.baja <= fin ? ` <i>(baja ${dF(a.baja).getDate()}/${dF(a.baja).getMonth() + 1})</i>` : ""}</td>${dias.map(k => `<td class="c" style="padding:2px 1px;min-width:16px">${celda(a, k)}</td>`).join("")}${o.reg ? tot(a).map(n => `<td class="c">${n}</td>`).join("") : `<td></td>`}</tr>`).join("")}
   ${Array.from({ length: extra }, (_, i) => `<tr><td class="c">${al.length + i + 1}</td><td>&nbsp;</td>${dias.map(() => "<td></td>").join("")}${o.reg ? "<td></td><td></td><td></td><td></td>" : "<td></td>"}</tr>`).join("")}</tbody></table>
   <p class="nota">${o.reg ? "/ asistió · R retardo · F falta · J falta justificada · — aún no estaba inscrito o ya era baja. A incluye los retardos." : "Anote: / asistió · R retardo · F falta · J falta justificada."} ${o.todos ? "Se muestran todos los días hábiles del mes." : "Se muestran los días de clase de Educación Física del grupo."} Días sin clase según el calendario oficial de Baja California.</p>
   <table class="firmas"><tr><td>${esc(docNombre())}<br>Docente de Educación Física</td><td>${esc(dirNombre(e) || "")}<br>Director(a) de la escuela · Vo. Bo.</td></tr></table></div>`; }
VISTAS.listas = () => { const k = hoy(), L = S.L = Object.assign({ escId: (D.escuelas[0] || {}).id, grupos: null, mes: k.slice(0, 7) >= CICLO.inicio.slice(0, 7) && k <= CICLO.fin ? k.slice(0, 7) : CICLO.inicio.slice(0, 7), reg: true, todos: false, extra: 2 }, S.L || {});
  const e = escDe(L.escId), gs = e ? gruposDe(e.id) : []; if (!L.grupos) L.grupos = gs.map(g => g.id); const sel = L.grupos.map(grDe).filter(g => g && g.escId === L.escId);
  const regMes = sel.reduce((t, g) => t + D.clases.filter(c => c.grupoId === g.id && c.fecha.slice(0, 7) === L.mes).length, 0);
  return barra("Listas de asistencia", "Imprimir listas") + `<main class="wrap"><section class="card mt">
   <div class="chips mb"><button class="chip" data-r="1" aria-pressed="${L.reg}">Con mis registros</button><button class="chip" data-r="0" aria-pressed="${!L.reg}">En blanco</button></div>
   <div class="dos"><label class="campo"><span>Mes</span><select id="lM">${mesesCiclo().map(m => `<option value="${m}" ${m === L.mes ? "selected" : ""}>${nomMes(m)}</option>`).join("")}</select></label>
   <label class="campo"><span>Escuela</span><select id="lE">${D.escuelas.map(x => `<option value="${x.id}" ${x.id === L.escId ? "selected" : ""}>${esc(x.nombre)}</option>`).join("")}</select></label></div>
   <span style="font-size:14px;font-weight:700;color:var(--gris)">Grupos (una hoja por grupo)</span><div class="chips mt mb" id="lG">${gs.map(g => `<button class="chip" data-g="${g.id}" aria-pressed="${L.grupos.includes(g.id)}">${grNom(g)}</button>`).join("") || `<span class="small muted">Sin grupos.</span>`}</div>
   <div class="dos"><label class="campo"><span>Días que aparecen</span><select id="lT"><option value="0" ${!L.todos ? "selected" : ""}>Solo mis días de clase con el grupo</option><option value="1" ${L.todos ? "selected" : ""}>Todos los días hábiles del mes</option></select></label>
   <label class="campo"><span>Renglones en blanco al final</span><select id="lX">${[0, 1, 2, 3, 5].map(n => `<option ${n === L.extra ? "selected" : ""}>${n}</option>`).join("")}</select><small>Para alumnos que lleguen durante el mes.</small></label></div>
   ${L.reg ? `<p class="small muted">${regMes ? `${regMes} clases registradas en ${nomMes(L.mes)} para los grupos elegidos.` : `Aún no hay clases registradas en ${nomMes(L.mes)}: la lista saldrá sin marcas.`}</p>` : ""}
   <div class="fila mt"><button class="btn p" id="lImp" ${sel.length ? "" : "disabled"}>${ic("impr", 18)} Imprimir ${sel.length > 1 ? sel.length + " listas" : "lista"}</button><button class="btn" id="lPdf" ${sel.length ? "" : "disabled"}>${ic("bajar", 18)} Descargar PDF</button></div></section>
   ${sel[0] ? `<h2 class="sec-t">Vista previa · ${grNom(sel[0])}</h2><div class="card" style="overflow:auto;padding:12px"><div style="min-width:760px">${docLista(sel[0], L.mes, L)}</div></div>` : ""}</main>`; };
ENLAZAR.listas = () => { const L = S.L, re = () => { const y = window.scrollY; pintar(); window.scrollTo(0, y); };
  $$("[data-r]").forEach(b => b.onclick = () => { L.reg = b.dataset.r === "1"; re(); }); $("#lM").onchange = ev => { L.mes = ev.target.value; re(); };
  $("#lE") && ($("#lE").onchange = ev => { L.escId = ev.target.value; L.grupos = null; re(); }); $("#lT").onchange = ev => { L.todos = ev.target.value === "1"; re(); }; $("#lX").onchange = ev => { L.extra = +ev.target.value; re(); };
  $$("#lG .chip").forEach(b => b.onclick = () => { const id = b.dataset.g; L.grupos = L.grupos.includes(id) ? L.grupos.filter(x => x !== id) : [...L.grupos, id]; re(); });
  const html = () => L.grupos.map(grDe).filter(g => g && g.escId === L.escId).map((g, i) => docLista(g, L.mes, L).replace('class="doc lista-as"', `class="doc lista-as${i ? " salto" : ""}"`)).join("");
  $("#lImp").onclick = () => imprimir(html(), true);
  $("#lPdf").onclick = async ev => { const b = ev.currentTarget; b.disabled = true; try { await pdfDescargar(html(), `listas-asistencia-${L.mes}.pdf`, true); } catch (e) { imprimir(html(), true); } b.disabled = false; }; };
