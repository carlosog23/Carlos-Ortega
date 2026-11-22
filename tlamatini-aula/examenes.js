/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Tlamatini Aula.
   Exámenes: diagnóstico, parciales, trimestrales, finales, por contenido y evaluaciones rápidas, para primaria y secundaria.
   Se arman con los contenidos y PDA oficiales del grado (Programa Sintético), Tlami propone los reactivos, el docente los edita,
   se imprimen (versiones A y B con clave de respuestas), se califican tocando los errores y se analizan por reactivo y por contenido. */
"use strict";
const EX_TIPOS = { diag: "Diagnóstico", parcial: "Parcial", trim: "Trimestral", final: "Final", cont: "Por contenido", quiz: "Evaluación rápida" };
const RX = { om: "Opción múltiple", vf: "Verdadero o falso", rel: "Relación de columnas", corta: "Respuesta corta", abierta: "Desarrollo" };
const RX_ORD = ["om", "vf", "rel", "corta", "abierta"];
const RX_INST = { om: "Subraye o encierre la letra de la respuesta correcta.", vf: "Escriba V si el enunciado es verdadero o F si es falso.", rel: "Escriba en el paréntesis la letra de la columna derecha que corresponde.", corta: "Conteste brevemente en la línea.", abierta: "Conteste o resuelva en el espacio, mostrando su procedimiento o sus razones." };
const EX_DIF = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado", mixto: "Mixto (de menor a mayor)" };
const LETRA = "abcdefgh";
const EXS = () => (D.exams = D.exams || []);
const exDe = id => EXS().find(x => x.id === id);
const ptsRx = r => Math.max(1, +r.pts || (r.tipo === "rel" ? (r.pares || []).length : r.tipo === "abierta" ? 3 : 1));
const totalEx = ex => ex.rx.reduce((s, r) => s + ptsRx(r), 0);
/* orden de impresión: por tipo de reactivo; la versión B baraja reactivos y opciones con una semilla fija */
function semilla(t) { let h = 1779033703; for (let i = 0; i < t.length; i++) { h = Math.imul(h ^ t.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
function barajar(L, rnd) { const a = L.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function ordenEx(ex, v) { const rnd = semilla(ex.id + (v || "A"));
  return RX_ORD.flatMap(t => { const L = ex.rx.filter(r => r.tipo === t); return v === "B" ? barajar(L, rnd) : L; }).map(r => {
    const o = { r }; if (r.tipo === "om") { const idx = (r.ops || []).map((x, i) => i); o.ops = v === "B" ? barajar(idx, rnd) : idx; }
    if (r.tipo === "rel") { const idx = (r.pares || []).map((x, i) => i); let d = barajar(idx, semilla(ex.id + r.id + (v || "A"))); if (d.length > 1 && d.every((x, i) => x === i)) d = d.slice(1).concat(d[0]); o.der = d; } return o; }); }
const califEx = (ex, res) => { if (!res || res.aus || !res.p) return null; const t = totalEx(ex); if (!t) return null; const s = ex.rx.reduce((x, r) => x + Math.min(ptsRx(r), +(res.p[r.id] || 0)), 0); return Math.round(100 * s / t) / 10; };
const trimDe = k => (TRIMS().find(t => k >= t.ini && k <= t.fin) || {}).id || "";
/* mezcla con la calificación del trimestre (si el docente le da peso a los exámenes) */
function mezclaEx(g, a, area, T, base) { const w = +(D.cfg.pesoEx || 0) / 100; if (!w) return base;
  const L = EXS().filter(e => e.gid === g.id && campoKey(e.area) === campoKey(area) && e.fecha >= T.ini && e.fecha <= T.fin && e.tipo !== "diag" && e.cuenta !== false).map(e => califEx(e, (e.res || {})[a.id])).filter(x => x != null);
  if (!L.length) return base; const ex = L.reduce((x, y) => x + y, 0) / L.length; return Math.max(5, Math.min(10, Math.round(base == null ? ex : base * (1 - w) + ex * w))); }

/* ---------- contenidos del grado para el examen ---------- */
async function contsEx(g, area, grado) {
  if (esSec(g)) { const P = await programaSec(), Dd = P && P.disciplinas[area]; if (!Dd) return null; return Dd.contenidos.filter(c => (c.pda[grado] || []).length).map(c => ({ c: c.c, pdas: c.pda[grado] })); }
  const P = await programa(); if (!P) return null; return PDA_TXT(P, area, faseDe(grado)).map(c => ({ c: c.c, pdas: [((c.pda || {})[grado]) || ""].filter(Boolean) })).filter(c => c.pdas.length); }
const enPlanes = (g, area, c) => D.planes.some(p => p.gid === g.id && campoKey(p.disc || p.campo) === campoKey(area) && Object.values(p.contenidos || {}).some(x => nrm(x) === nrm(c)));

/* =================================================================== LISTA */
VISTAS.examenes = () => { const g = gAct(); if (!g) return VISTAS.inicio(); const L = EXS().filter(e => e.gid === g.id).sort((a, b) => b.fecha.localeCompare(a.fecha)), n = activos(g).length;
  return barra("Exámenes · " + esc(grNom(g)), "Mis exámenes", `<button class="btn s p" id="exN">${ic("mas", 16)} Nuevo</button>`) + `<main class="wrap">
  <p class="small muted mt">Diagnósticos, parciales, trimestrales, finales o por contenido, con los contenidos y PDA de su grado. Tlami le propone los reactivos, usted los ajusta, los imprime en dos versiones con su clave y califica tocando los errores.</p>
  <div class="lista mt">${L.map(e => { const cs = activos(g).map(a => califEx(e, (e.res || {})[a.id])).filter(x => x != null), pr = cs.length ? cs.reduce((x, y) => x + y, 0) / cs.length : null;
    return `<button class="it btnit" data-ex="${e.id}"><span class="av" style="background:var(--anil-s)">${ic("doc", 18)}</span><span class="tx"><b>${esc(e.titulo)}</b><small>${esc(EX_TIPOS[e.tipo] || "")} · ${esc(e.area)} · ${e.rx.length} reactivos · ${fCorta(e.fecha)}${cs.length ? ` · ${cs.length}/${n} calificados` : ""}</small></span>${pr != null ? `<span class="cal-b" style="color:${colCal(pr)}">${pr.toFixed(1)}</span>` : ic("sig", 16)}</button>`; }).join("") || `<div class="vacio">Aún no tiene exámenes. Toque «Nuevo» para armar el primero.</div>`}</div>
  <section class="card mt"><h3>¿Cuentan en la calificación del trimestre?</h3><p class="small muted mb">Peso de los exámenes frente a la evaluación formativa en cada ${areaTxt(g)}. Los diagnósticos nunca cuentan. Con 0 % solo son informativos.</p>
   <div class="chips">${[0, 20, 30, 40, 50].map(p => `<button class="chip" data-pe="${p}" aria-pressed="${+(D.cfg.pesoEx || 0) === p}">${p} %</button>`).join("")}</div></section></main>`; };
ENLAZAR.examenes = () => { $("#exN").onclick = () => { S.E = null; ir("examenNuevo"); }; $$("[data-ex]").forEach(b => b.onclick = () => ir("examen", { id: b.dataset.ex }));
  $$("[data-pe]").forEach(b => b.onclick = () => { D.cfg.pesoEx = +b.dataset.pe; guardar(); re(); toast(+b.dataset.pe ? `Los exámenes valdrán ${b.dataset.pe} % de la calificación del trimestre.` : "Los exámenes ya no cuentan en la calificación."); }); };

/* =================================================================== NUEVO EXAMEN */
VISTAS.examenNuevo = () => { const g = gAct(); if (!g) return VISTAS.inicio(); return barra("Exámenes · " + esc(grNom(g)), "Nuevo examen") + `<main class="wrap" id="enM"><p class="muted mt">Cargando el programa…</p></main>`; };
ENLAZAR.examenNuevo = async () => { const g = gAct(), m = $("#enM"); if (!g || !m) return;
  const areas = areasDe(g), E = S.E = S.E || { tipo: "parcial", area: areas.length === 1 ? areas[0] : "", grado: g.grados.length === 1 ? g.grados[0] : 0, sel: [], cu: { om: 10, vf: 5, rel: 1, corta: 3, abierta: 2 }, dif: "mixto", fecha: hoy(), titulo: "", tocado: false };
  let C = null, cKey = "";
  const pinta = async () => { const grs = esSec(g) && E.area ? g.grados.filter(x => !DISC_GR[E.area] || DISC_GR[E.area].includes(x)) : g.grados; if (grs.length === 1) E.grado = grs[0];
    if (E.area && E.grado && cKey !== E.area + E.grado) { cKey = E.area + E.grado; C = await contsEx(g, E.area, E.grado); E.sel = []; }
    const L = C ? C.map((c, i) => ({ c, i, t: enPlanes(g, E.area, c.c) })).sort((a, b) => (b.t - a.t) || (a.i - b.i)) : [];
    if (!E.tocado) E.titulo = `Examen ${(EX_TIPOS[E.tipo] || "").toLowerCase()}${E.area ? " de " + E.area : ""}${E.grado ? " · " + E.grado + ".°" : ""}`.replace("Examen diagnóstico", "Evaluación diagnóstica").replace("Examen evaluación rápida", "Evaluación rápida").replace("Examen por contenido", "Examen por contenido");
    const nRx = Object.values(E.cu).reduce((x, y) => x + (+y || 0), 0);
    m.innerHTML = `<section class="card mt"><h3>1. Tipo de examen</h3><div class="chips">${Object.entries(EX_TIPOS).map(([k, t]) => `<button class="chip" data-et="${k}" aria-pressed="${E.tipo === k}">${t}</button>`).join("")}</div></section>
     <section class="card mt"><h3>2. ${esSec(g) ? "Disciplina" : "Campo formativo"}</h3><div class="chips">${areas.map(a => `<button class="chip" data-ea="${esc(a)}" aria-pressed="${E.area === a}">${esc(a)}</button>`).join("") || `<p class="small">Registre las disciplinas del grupo en Ajustes.</p>`}</div>
      ${grs.length > 1 ? `<p class="small muted mt">Grado del examen</p><div class="chips">${grs.map(x => `<button class="chip" data-eg="${x}" aria-pressed="${E.grado === x}">${x}.°</button>`).join("")}</div>` : ""}</section>
     ${E.area && E.grado ? !C ? `<div class="vacio mt">No se pudo cargar el programa. Conéctese a internet una vez y vuelva a intentarlo.</div>` : `<section class="card mt"><h3>3. Contenidos que evalúa</h3><p class="small muted mb">Marque uno o varios. Primero aparecen los que ya trabajó en sus planeaciones.</p>
      <div class="fila mb"><button class="btn s" id="esT">Marcar los trabajados</button><button class="btn s" id="esN">Ninguno</button></div>
      ${L.map(x => `<label class="rev-chk" style="align-items:flex-start"><input type="checkbox" data-ec="${x.i}" ${E.sel.includes(x.i) ? "checked" : ""} style="margin-top:3px"> <span>${esc(x.c.c)}${x.t ? ' <span class="tag">trabajado</span>' : ""}<small class="muted" style="display:block">${x.c.pdas.length} PDA</small></span></label>`).join("")}</section>` : ""}
     ${E.sel.length ? `<section class="card mt"><h3>4. Reactivos</h3><div class="dos">${RX_ORD.map(k => `<label class="campo"><span>${RX[k]}</span><input type="number" min="0" max="${k === "rel" ? 4 : k === "abierta" ? 6 : 30}" data-eu="${k}" value="${E.cu[k]}"></label>`).join("")}
       <label class="campo"><span>Dificultad</span><select id="eD">${Object.entries(EX_DIF).map(([k, t]) => `<option value="${k}" ${E.dif === k ? "selected" : ""}>${t}</option>`).join("")}</select></label></div><p class="small muted">${nRx} reactivos en total.</p></section>
      <section class="card mt"><h3>5. Datos del examen</h3><label class="campo"><span>Título</span><input id="eTi" value="${esc(E.titulo)}"></label><label class="campo"><span>Fecha de aplicación</span><input type="date" id="eF" value="${E.fecha}"></label>
       <div class="fila fin mt"><button class="btn" id="eVac">Escribir mis reactivos</button><button class="btn p tlami-b" id="eIA">${ic("chispa", 16)} Que Tlami proponga los reactivos</button></div>
       <p class="small muted mt">Tlami solo recibe los contenidos, los PDA y el grado; nunca nombres de alumnos. Después puede editar, quitar o agregar cualquier reactivo.</p></section>` : ""}`;
    const lee = () => { $$("[data-eu]").forEach(i => E.cu[i.dataset.eu] = Math.max(0, Math.min(+i.max, +i.value || 0))); if ($("#eD")) E.dif = val("eD"); if ($("#eTi")) { const t = val("eTi"); if (t !== E.titulo) { E.titulo = t; E.tocado = true; } } if ($("#eF")) E.fecha = val("eF") || E.fecha; };
    $$("[data-et]").forEach(b => b.onclick = () => { lee(); E.tipo = b.dataset.et; if (E.tipo === "quiz") E.cu = { om: 5, vf: 5, rel: 0, corta: 0, abierta: 0 }; if (E.tipo === "final" || E.tipo === "trim") E.cu = { om: 15, vf: 5, rel: 1, corta: 4, abierta: 2 }; pinta(); });
    $$("[data-ea]").forEach(b => b.onclick = () => { lee(); E.area = b.dataset.ea; cKey = ""; pinta(); });
    $$("[data-eg]").forEach(b => b.onclick = () => { lee(); E.grado = +b.dataset.eg; pinta(); });
    $$("[data-ec]").forEach(c => c.onchange = () => { lee(); const i = +c.dataset.ec, k = E.sel.indexOf(i); if (c.checked && k < 0) E.sel.push(i); if (!c.checked && k >= 0) E.sel.splice(k, 1); pinta(); });
    $("#esT") && ($("#esT").onclick = () => { lee(); E.sel = L.filter(x => x.t).map(x => x.i); if (!E.sel.length) toast("Aún no hay contenidos de esta área en sus planeaciones; márquelos a mano."); pinta(); });
    $("#esN") && ($("#esN").onclick = () => { lee(); E.sel = []; pinta(); });
    $$("[data-eu]").forEach(i => i.onchange = () => { lee(); pinta(); });
    const crear = () => { lee(); const ex = { id: uid(), gid: g.id, tipo: E.tipo, area: E.area, grado: E.grado, nivel: esSec(g) ? "sec" : "prim", titulo: E.titulo.trim() || "Examen", fecha: E.fecha, dif: E.dif,
      conts: E.sel.slice().sort((a, b) => a - b).map(i => C[i]), inst: "Lea con atención cada pregunta antes de contestar. Conteste con lápiz o pluma y cuide su letra.", rx: [], res: {}, creado: hoy() }; return ex; };
    $("#eVac") && ($("#eVac").onclick = () => { const ex = crear(); EXS().push(ex); guardar(); S.E = null; ir("examen", { id: ex.id }, true); toast("Examen creado. Agregue sus reactivos."); });
    $("#eIA") && ($("#eIA").onclick = async () => { const ex = crear(); if (!Object.values(E.cu).some(x => x > 0)) return toast("Indique cuántos reactivos quiere.");
      tlamiEspera("Redactando los reactivos con los contenidos y PDA que eligió. Puede tardar un minuto.");
      try { ex.rx = await tlamiReactivos(g, ex, E.cu); EXS().push(ex); guardar(); cerrarDlg(); S.E = null; ir("examen", { id: ex.id }, true); toast(`<b>Listo:</b> ${ex.rx.length} reactivos. Revíselos antes de imprimir.`, 4000); }
      catch (e) { tlamiError(e); } }); };
  pinta(); };

/* Tlami: pide los reactivos por tandas para no rebasar lo que el servidor contesta de una vez */
async function tlamiReactivos(g, ex, cu, evitar) { const conts = ex.conts.map((c, i) => `${i + 1}. Contenido: ${c.c} | PDA: ${c.pdas.join(" ")}`).join("\n");
  const tandas = [], pend = Object.assign({}, cu); while (RX_ORD.some(k => pend[k] > 0)) { const t = {}; let n = 0; RX_ORD.forEach(k => { const q = Math.min(pend[k], Math.max(0, 15 - n)); if (q) { t[k] = q; pend[k] -= q; n += q; } }); if (!n) break; tandas.push(t); }
  const out = [];
  for (const t of tandas) { const j = await aulaPost("aulaIA", { modo: "examen", nivel: esSec(g) ? "secundaria" : "primaria", grados: [ex.grado], disciplina: esSec(g) ? ex.area : "", area: ex.area, tipo: EX_TIPOS[ex.tipo], dificultad: EX_DIF[ex.dif] || "", contenidos: conts, cuantos: t,
      evitar: (evitar || []).concat(out).map(r => r.txt).join(" | ").slice(0, 1500) }, 110000);
    ((j.r || {}).reactivos || []).forEach(r => out.push(limpiaRx(r, ex))); }
  return out.filter(Boolean); }
function limpiaRx(r, ex) { const t = RX_ORD.includes(r.tipo) ? r.tipo : "corta", x = { id: uid(), tipo: t, txt: String(r.txt || "").trim(), cont: Math.max(0, Math.min(ex.conts.length - 1, (parseInt(r.cont, 10) || 1) - 1)) };
  if (!x.txt) return null;
  if (t === "om") { x.ops = (r.ops || []).map(String).filter(Boolean).slice(0, 6); if (x.ops.length < 2) return null; x.ok = Math.max(0, Math.min(x.ops.length - 1, parseInt(r.ok, 10) || 0)); }
  if (t === "vf") x.ok = r.ok === true || /^(true|v|verdadero)$/i.test(String(r.ok));
  if (t === "rel") { x.pares = (r.pares || []).filter(p => Array.isArray(p) && p[0] && p[1]).map(p => [String(p[0]), String(p[1])]).slice(0, 8); if (x.pares.length < 2) return null; x.pts = x.pares.length; }
  if (t === "corta") x.ok = String(r.ok || "");
  if (t === "abierta") { x.ok = String(r.ok || ""); x.pts = 3; }
  return x; }

/* =================================================================== DETALLE Y EDICIÓN */
VISTAS.examen = () => { const ex = exDe(S.id); if (!ex) return VISTAS.examenes(); const g = grDe(ex.gid), O = ordenEx(ex, "A"), n = g ? activos(g).length : 0, cal = g ? activos(g).filter(a => (ex.res || {})[a.id]).length : 0;
  return barra(esc(EX_TIPOS[ex.tipo] + " · " + ex.area), esc(ex.titulo), `<button class="btn s" id="xI">${ic("impr", 16)} Imprimir</button>`) + `<main class="wrap">
  <section class="card mt"><div class="tags"><span class="tag a">${esc(ex.area)}</span> <span class="tag g">${ex.grado}.° grado</span> <span class="tag g">${fCorta(ex.fecha)}</span> <span class="tag m">${ex.rx.length} reactivos · ${totalEx(ex)} puntos</span>${ex.tipo === "diag" ? ' <span class="tag g">No cuenta en la calificación</span>' : ""}</div>
   ${ex.conts.map((c, i) => `<p class="small mt"><b>Contenido ${i + 1}:</b> ${esc(c.c)}</p>`).join("")}
   <label class="campo mt"><span>Instrucciones generales</span><textarea class="area" id="xIn" style="min-height:60px">${esc(ex.inst || "")}</textarea></label>
   <div class="fila mt"><button class="btn p" id="xC">${ic("check", 16)} Calificar (${cal}/${n})</button><button class="btn" id="xR">${ic("eval", 16)} Resultados</button><button class="btn s" id="xD">${ic("lapiz", 16)} Título y fecha</button><button class="btn s r" id="xB">${ic("basura", 16)}</button></div></section>
  <div class="fila mt2" style="justify-content:space-between"><h2 class="sec-t" style="margin:0">Reactivos</h2><span class="fila" style="gap:6px"><button class="btn s tlami-b" id="xIA">${ic("chispa", 16)} Más con Tlami</button><button class="btn s p" id="xA">${ic("mas", 16)} Agregar</button></span></div>
  ${RX_ORD.filter(t => ex.rx.some(r => r.tipo === t)).map(t => `<h3 class="mt" style="font-size:17px">${RX[t]}</h3>${O.filter(o => o.r.tipo === t).map(o => { const r = o.r, k = O.indexOf(o) + 1;
    return `<section class="card mt" style="padding:12px 14px"><div class="fila" style="justify-content:space-between;flex-wrap:nowrap;gap:8px"><b style="min-width:0">${k}. ${esc(r.txt)}</b><span class="fila" style="gap:4px;flex-wrap:nowrap"><button class="btn s" data-xu="${r.id}" aria-label="Subir">↑</button><button class="btn s" data-xe="${r.id}" aria-label="Editar">${ic("lapiz", 14)}</button></span></div>
     ${r.tipo === "om" ? `<ol type="a" class="small mt" style="margin:6px 0 0 18px">${r.ops.map((x, i) => `<li${i === r.ok ? ' style="font-weight:700;color:var(--jade)"' : ""}>${esc(x)}${i === r.ok ? " ✓" : ""}</li>`).join("")}</ol>` : ""}
     ${r.tipo === "vf" ? `<p class="small mt">Respuesta: <b>${r.ok ? "Verdadero" : "Falso"}</b></p>` : ""}
     ${r.tipo === "rel" ? `<table class="tabla mt small">${r.pares.map(p => `<tr><td>${esc(p[0])}</td><td>${esc(p[1])}</td></tr>`).join("")}</table>` : ""}
     ${r.tipo === "corta" || r.tipo === "abierta" ? `<p class="small mt"><b>${r.tipo === "corta" ? "Respuesta esperada" : "Respuesta modelo o criterios"}:</b> ${esc(r.ok || "—")}</p>` : ""}
     <p class="small muted mt">${ptsRx(r)} ${ptsRx(r) === 1 ? "punto" : "puntos"}${ex.conts[r.cont] ? " · Contenido " + (r.cont + 1) : ""}</p></section>`; }).join("")}`).join("") || `<div class="vacio mt">Sin reactivos todavía.</div>`}</main>`; };
ENLAZAR.examen = () => { const ex = exDe(S.id); if (!ex) return; const g = grDe(ex.gid);
  $("#xIn").onchange = e => { ex.inst = e.target.value; guardar(); };
  $("#xC").onclick = () => { if (!ex.rx.length) return toast("Primero agregue reactivos."); ir("exCalificar", { id: ex.id }); }; $("#xR").onclick = () => ir("exResultados", { id: ex.id });
  $("#xA").onclick = () => formRx(ex); $$("[data-xe]").forEach(b => b.onclick = () => formRx(ex, ex.rx.find(r => r.id === b.dataset.xe)));
  $$("[data-xu]").forEach(b => b.onclick = () => { const i = ex.rx.findIndex(r => r.id === b.dataset.xu), t = ex.rx[i].tipo; let j = i - 1; while (j >= 0 && ex.rx[j].tipo !== t) j--; if (j < 0) return; [ex.rx[i], ex.rx[j]] = [ex.rx[j], ex.rx[i]]; guardar(); re(); });
  $("#xB").onclick = async () => { if (!(await confirmar("Se borrará el examen con sus calificaciones.", "Borrar"))) return; D.exams = EXS().filter(x => x !== ex); guardar(); history.back(); };
  $("#xD").onclick = () => dlg(`<h3>Datos del examen</h3><label class="campo"><span>Título</span><input id="dT" value="${esc(ex.titulo)}"></label><label class="campo"><span>Fecha de aplicación</span><input type="date" id="dF" value="${ex.fecha}"></label><label class="rev-chk"><input type="checkbox" id="dC" ${ex.cuenta === false || ex.tipo === "diag" ? "" : "checked"} ${ex.tipo === "diag" ? "disabled" : ""}> Cuenta en la calificación del trimestre (según el peso que fijó)</label><div class="fila fin mt"><button class="btn" id="dX">Cancelar</button><button class="btn p" id="dOk">Guardar</button></div>`, v => {
    v.querySelector("#dX").onclick = cerrarDlg; v.querySelector("#dOk").onclick = () => { ex.titulo = val("dT").trim() || ex.titulo; ex.fecha = val("dF") || ex.fecha; ex.cuenta = v.querySelector("#dC").checked; guardar(); cerrarDlg(); re(); }; });
  $("#xIA").onclick = () => dlg(`<h3>Más reactivos con Tlami</h3><div class="dos">${RX_ORD.map(k => `<label class="campo"><span>${RX[k]}</span><input type="number" min="0" max="${k === "rel" ? 3 : 10}" data-mu="${k}" value="${k === "om" ? 3 : 0}"></label>`).join("")}</div><div class="fila fin mt"><button class="btn" id="mX">Cancelar</button><button class="btn p" id="mOk">${ic("chispa", 16)} Pedir</button></div>`, v => {
    v.querySelector("#mX").onclick = cerrarDlg; v.querySelector("#mOk").onclick = async () => { const cu = {}; v.querySelectorAll("[data-mu]").forEach(i => cu[i.dataset.mu] = Math.max(0, Math.min(+i.max, +i.value || 0))); if (!Object.values(cu).some(Boolean)) return toast("Indique cuántos.");
      tlamiEspera("Redactando reactivos nuevos, distintos a los que ya tiene."); try { const L = await tlamiReactivos(g, ex, cu, ex.rx); ex.rx.push(...L); guardar(); cerrarDlg(); re(); toast(`Se agregaron ${L.length} reactivos.`); } catch (e) { tlamiError(e); } }; });
  $("#xI").onclick = () => dlg(`<h3>Imprimir</h3><div class="lista"><button class="it btnit" data-pv="A"><span class="tx"><b>Examen · versión A</b></span></button><button class="it btnit" data-pv="AB"><span class="tx"><b>Versiones A y B</b><small>Mismos reactivos en distinto orden, para que no se copien</small></span></button><button class="it btnit" data-pv="clave"><span class="tx"><b>Clave de respuestas</b><small>De las versiones A y B, para el docente</small></span></button><button class="it btnit" data-pv="hoja"><span class="tx"><b>Hoja de respuestas</b><small>Para que contesten aparte y el examen se reutilice</small></span></button></div><div class="fila fin mt"><button class="btn" id="pX">Cancelar</button></div>`, v => {
    v.querySelector("#pX").onclick = cerrarDlg; v.querySelectorAll("[data-pv]").forEach(b => b.onclick = () => { cerrarDlg(); const q = b.dataset.pv;
      imprimir(q === "clave" ? docClave(ex) : q === "hoja" ? docHoja(ex, g) : q === "AB" ? docExamen(ex, g, "A") + docExamen(ex, g, "B", true) : docExamen(ex, g, "A")); }); }); };
function formRx(ex, r) { const nuevo = !r; r = r || { id: uid(), tipo: "om", txt: "", ops: ["", "", "", ""], ok: 0, cont: 0 };
  const cuerpo = t => t === "om" ? `<label class="campo"><span>Opciones (una por renglón)</span><textarea class="area" id="rO" style="min-height:100px">${esc((r.ops || []).join("\n"))}</textarea></label><label class="campo"><span>Opción correcta</span><select id="rK">${LETRA.slice(0, 6).split("").map((l, i) => `<option value="${i}" ${r.ok === i ? "selected" : ""}>${l})</option>`).join("")}</select></label>`
    : t === "vf" ? `<div class="campo"><span>Respuesta</span><select id="rK"><option value="1" ${r.ok === true ? "selected" : ""}>Verdadero</option><option value="0" ${r.ok === false ? "selected" : ""}>Falso</option></select></div>`
    : t === "rel" ? `<label class="campo"><span>Pares (uno por renglón: concepto | su pareja)</span><textarea class="area" id="rO">${esc((r.pares || []).map(p => p.join(" | ")).join("\n"))}</textarea></label>`
    : `<label class="campo"><span>${t === "corta" ? "Respuesta esperada" : "Respuesta modelo o criterios de corrección"}</span><textarea class="area" id="rK" style="min-height:70px">${esc(typeof r.ok === "string" ? r.ok : "")}</textarea></label>${t === "abierta" ? `<label class="campo"><span>Puntos</span><input type="number" id="rP" min="1" max="10" value="${ptsRx(r)}"></label>` : ""}`;
  dlg(`<h3>${nuevo ? "Agregar reactivo" : "Editar reactivo"}</h3><label class="campo"><span>Tipo</span><select id="rT">${RX_ORD.map(k => `<option value="${k}" ${r.tipo === k ? "selected" : ""}>${RX[k]}</option>`).join("")}</select></label>
   <label class="campo"><span>Enunciado o pregunta</span><textarea class="area" id="rX" style="min-height:80px">${esc(r.txt)}</textarea></label><div id="rB">${cuerpo(r.tipo)}</div>
   ${ex.conts.length > 1 ? `<label class="campo"><span>Contenido que evalúa</span><select id="rC">${ex.conts.map((c, i) => `<option value="${i}" ${r.cont === i ? "selected" : ""}>${i + 1}. ${esc(c.c.slice(0, 80))}</option>`).join("")}</select></label>` : ""}
   <div class="fila fin mt">${nuevo ? "" : `<button class="btn r" id="rD" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="rXc">Cancelar</button><button class="btn p" id="rOk">Guardar</button></div>`, v => {
    v.querySelector("#rT").onchange = e => { v.querySelector("#rB").innerHTML = cuerpo(e.target.value); };
    v.querySelector("#rXc").onclick = cerrarDlg;
    v.querySelector("#rD") && (v.querySelector("#rD").onclick = () => { ex.rx = ex.rx.filter(x => x !== r); Object.values(ex.res || {}).forEach(x => x.p && delete x.p[r.id]); guardar(); cerrarDlg(); re(); });
    v.querySelector("#rOk").onclick = () => { const t = val("rT"), x = { id: r.id, tipo: t, txt: val("rX").trim(), cont: +(val("rC") || 0) }; if (!x.txt) return toast("Escriba el enunciado.");
      if (t === "om") { x.ops = val("rO").split("\n").map(s => s.trim()).filter(Boolean); if (x.ops.length < 2) return toast("Escriba al menos dos opciones."); x.ok = Math.min(+val("rK"), x.ops.length - 1); }
      if (t === "vf") x.ok = val("rK") === "1";
      if (t === "rel") { x.pares = val("rO").split("\n").map(s => s.split("|").map(y => y.trim())).filter(p => p[0] && p[1]); if (x.pares.length < 2) return toast("Escriba al menos dos pares separados por |"); x.pts = x.pares.length; }
      if (t === "corta") x.ok = val("rK").trim(); if (t === "abierta") { x.ok = val("rK").trim(); x.pts = Math.max(1, Math.min(10, +val("rP") || 3)); }
      const i = ex.rx.indexOf(r); if (i >= 0) ex.rx[i] = x; else ex.rx.push(x); guardar(); cerrarDlg(); re(); }; }); }

/* =================================================================== IMPRESIÓN */
const EX_CSS = `<style>.doc .exd{display:grid;grid-template-columns:2fr 1fr 1fr;gap:4px 14px;font-size:10.5pt;margin:6px 0 8px}.doc .exd span{border-bottom:1px solid #333;padding:2px 0}.doc .exs{font-size:11pt;margin:12px 0 4px;border-bottom:1.5px solid #0F3B33}.doc .exs small{font-weight:400;color:#444}
.doc .rx{page-break-inside:avoid;margin:7px 0 2px}.doc .ops{display:grid;grid-template-columns:1fr 1fr;gap:2px 18px;margin:3px 0 0 18px}.doc .lin{border-bottom:1px solid #777;height:20px}.doc .caja{border:1px solid #999;border-radius:4px;margin-top:4px}
.doc .rel td{border:0;padding:3px 6px;font-size:10.5pt}.doc .exi{font-size:10pt;margin:2px 0 6px}</style>`;
function docExamen(ex, g, v, salto) { const O = ordenEx(ex, v); let k = 0;
  return `${EX_CSS}<div class="doc" style="${salto ? "page-break-before:always;break-before:page" : ""}">${encabezado(g, esc(ex.titulo))}
  <div class="exd"><span>Nombre: </span><span>Grupo: ${esc(String(ex.grado) + ".° " + (g && g.grupo || ""))}</span><span>Fecha: </span><span>Aciertos: ______ de ${totalEx(ex)}</span><span>Calificación: </span><span>${v === "B" ? "Versión B" : "Versión A"}</span></div>
  ${ex.inst ? `<p class="exi"><b>Instrucciones:</b> ${esc(ex.inst)}</p>` : ""}
  ${RX_ORD.filter(t => O.some(o => o.r.tipo === t)).map(t => { const L = O.filter(o => o.r.tipo === t), p = L.reduce((s, o) => s + ptsRx(o.r), 0);
    return `<div class="exs"><b>${RX[t]}</b> <small>· ${RX_INST[t]} (${p} ${p === 1 ? "punto" : "puntos"})</small></div>` + L.map(o => { const r = o.r; k++;
      if (r.tipo === "om") return `<div class="rx"><b>${k}.</b> ${esc(r.txt)}<div class="ops">${o.ops.map((i, j) => `<span>${LETRA[j]}) ${esc(r.ops[i])}</span>`).join("")}</div></div>`;
      if (r.tipo === "vf") return `<div class="rx">( &nbsp;&nbsp; ) <b>${k}.</b> ${esc(r.txt)}</div>`;
      if (r.tipo === "rel") return `<div class="rx"><b>${k}.</b> ${esc(r.txt)}<table class="rel"><tbody>${r.pares.map((pp, i) => `<tr><td style="width:50%">${i + 1}. ${esc(pp[0])} &nbsp; ( &nbsp;&nbsp; )</td><td>${LETRA[i]}) ${esc(r.pares[o.der[i]][1])}</td></tr>`).join("")}</tbody></table></div>`;
      if (r.tipo === "corta") return `<div class="rx"><b>${k}.</b> ${esc(r.txt)}<div class="lin"></div></div>`;
      return `<div class="rx"><b>${k}.</b> ${esc(r.txt)} <small>(${ptsRx(r)} puntos)</small><div class="caja" style="height:${Math.min(8, 3 + ptsRx(r)) * 22}px"></div></div>`; }).join(""); }).join("")}</div>`; }
function claveTxt(ex, v) { return ordenEx(ex, v).map((o, i) => { const r = o.r;
  const t = r.tipo === "om" ? LETRA[o.ops.indexOf(r.ok)] + ") " + r.ops[r.ok] : r.tipo === "vf" ? (r.ok ? "V" : "F") : r.tipo === "rel" ? r.pares.map((p, j) => (j + 1) + "-" + LETRA[o.der.indexOf(j)]).join(", ") : String(r.ok || "");
  return { n: i + 1, tipo: RX[r.tipo], t, pts: ptsRx(r), cont: r.cont + 1 }; }); }
function docClave(ex) { const g = grDe(ex.gid);
  return `<div class="doc" style="page-break-before:always;break-before:page">${encabezado(g, "Clave de respuestas · " + esc(ex.titulo))}<p class="nota">Documento para el docente. No se entrega a los alumnos.</p>
  ${["A", "B"].map(v => `<h2>Versión ${v}</h2><table><thead><tr><th class="c" style="width:7%">No.</th><th style="width:20%">Tipo</th><th>Respuesta</th><th class="c" style="width:8%">Puntos</th><th class="c" style="width:10%">Contenido</th></tr></thead><tbody>${claveTxt(ex, v).map(x => `<tr><td class="c">${x.n}</td><td>${x.tipo}</td><td>${esc(x.t)}</td><td class="c">${x.pts}</td><td class="c">${x.cont}</td></tr>`).join("")}</tbody></table>`).join("")}
  <h2>Contenidos evaluados</h2>${ex.conts.map((c, i) => `<p class="nota"><b>${i + 1}.</b> ${esc(c.c)}</p>`).join("")}</div>`; }
function docHoja(ex, g) { const O = ordenEx(ex, "A");
  const una = salto => `<div class="doc ${salto ? "salto" : ""}">${encabezado(g, "Hoja de respuestas · " + esc(ex.titulo))}<div class="exd"><span>Nombre: </span><span>Grupo: ${esc(String(ex.grado) + ".° " + (g && g.grupo || ""))}</span><span>Versión: A / B</span></div>
   <table><tbody>${O.map((o, i) => `<tr><td class="c" style="width:8%"><b>${i + 1}</b></td><td>${o.r.tipo === "om" ? o.ops.map((x, j) => `( ) ${LETRA[j]}`).join(" &nbsp;&nbsp; ") : o.r.tipo === "vf" ? "( ) V &nbsp;&nbsp; ( ) F" : o.r.tipo === "rel" ? o.r.pares.map((x, j) => `${j + 1}. ( )`).join(" &nbsp; ") : o.r.tipo === "corta" ? "&nbsp;" : "Conteste en hoja aparte o al reverso"}</td></tr>`).join("")}</tbody></table></div>`;
  return EX_CSS + una(false); }

/* =================================================================== CALIFICAR: se tocan los errores */
VISTAS.exCalificar = () => { const ex = exDe(S.id); if (!ex) return VISTAS.examenes(); const g = grDe(ex.gid), L = g ? activos(g) : [];
  if (S.al) { const a = L.find(x => x.id === S.al); if (a) return calAlumnoHTML(ex, g, a, L); }
  return barra("Calificar", esc(ex.titulo)) + `<main class="wrap"><p class="small muted mt">Toque a cada alumno y marque solo los reactivos que tuvo mal: todo lo demás cuenta como correcto. Calificación de 0 a 10 según los puntos.</p>
   <div class="lista mt">${L.map((a, i) => { const r = (ex.res || {})[a.id], c = califEx(ex, r); return `<button class="it btnit" data-ca="${a.id}"><span class="av">${i + 1}</span><span class="tx"><b>${esc(a.nombre)}</b><small>${r ? r.aus ? "No presentó" : "Versión " + (r.v || "A") : "Sin calificar"}</small></span>${c != null ? `<span class="cal-b" style="color:${colCal(c)}">${c.toFixed(1)}</span>` : ic("sig", 16)}</button>`; }).join("") || `<div class="vacio">Primero agregue a sus alumnos en Mi grupo.</div>`}</div>
   <div class="fila fin mt2"><button class="btn o" id="caR">${ic("eval", 18)} Ver resultados</button></div></main>`; };
function calAlumnoHTML(ex, g, a, L) { const T = (S.tmp && S.tmp.id === a.id) ? S.tmp : (S.tmp = (() => { const r = (ex.res || {})[a.id]; return { id: a.id, v: (r && r.v) || "A", aus: !!(r && r.aus), p: Object.assign({}, r && r.p ? r.p : Object.fromEntries(ex.rx.map(x => [x.id, ptsRx(x)]))) }; })());
  const O = ordenEx(ex, T.v), c = califEx(ex, T), i = L.indexOf(a);
  return barra("Calificar · " + (i + 1) + " de " + L.length, esc(a.nombre)) + `<main class="wrap">
   <div class="fila mt" style="justify-content:space-between"><div class="chips"><button class="chip" data-cv="A" aria-pressed="${T.v === "A"}">Versión A</button><button class="chip" data-cv="B" aria-pressed="${T.v === "B"}">Versión B</button><button class="chip" id="cAus" aria-pressed="${T.aus}">No presentó</button></div><span class="cal-b" style="font-size:28px;color:${colCal(c)}">${T.aus ? "—" : c == null ? "—" : c.toFixed(1)}</span></div>
   ${T.aus ? `<div class="vacio mt">Marcado como que no presentó: no se promedia.</div>` : `<p class="small muted mt">Verde = correcto. Toque los que tuvo mal. En relación de columnas y desarrollo, elija los puntos que obtuvo.</p>
   <div class="fila mt" style="gap:8px">${O.filter(o => ptsRx(o.r) === 1).map(o => { const k = O.indexOf(o) + 1, ok = +(T.p[o.r.id] || 0) >= 1; return `<button class="btn s" data-cr="${o.r.id}" style="min-width:52px;background:${ok ? "var(--jade-s)" : "var(--rojo-s)"};color:${ok ? "var(--jade)" : "var(--rojo)"};font-weight:700">${k} ${ok ? "✓" : "✗"}</button>`; }).join("")}</div>
   ${O.filter(o => ptsRx(o.r) > 1).map(o => { const k = O.indexOf(o) + 1, mx = ptsRx(o.r), v = +(T.p[o.r.id] || 0); return `<section class="card mt" style="padding:10px 12px"><p class="small"><b>${k}.</b> ${esc(o.r.txt.slice(0, 120))}${o.r.txt.length > 120 ? "…" : ""}</p><div class="chips mt">${[...Array(mx + 1).keys()].map(n => `<button class="chip" data-cp="${o.r.id}|${n}" aria-pressed="${v === n}">${n}</button>`).join("")}<span class="small muted" style="align-self:center">de ${mx}</span></div></section>`; }).join("")}`}
   <div class="fila mt2" style="justify-content:space-between"><button class="btn" id="cAnt" ${i ? "" : "disabled"}>${ic("atras", 16)} Anterior</button><button class="btn s" id="cTodo">Todo correcto</button><button class="btn p" id="cSig">${i < L.length - 1 ? "Guardar y siguiente" : "Guardar"}</button></div></main>`; }
ENLAZAR.exCalificar = () => { const ex = exDe(S.id); if (!ex) return; const g = grDe(ex.gid), L = g ? activos(g) : [];
  $$("[data-ca]").forEach(b => b.onclick = () => { S.tmp = null; ir("exCalificar", { id: ex.id, al: b.dataset.ca }); }); $("#caR") && ($("#caR").onclick = () => ir("exResultados", { id: ex.id }));
  if (!S.al || !S.tmp) return; const T = S.tmp;
  $$("[data-cv]").forEach(b => b.onclick = () => { T.v = b.dataset.cv; re(); }); $("#cAus").onclick = () => { T.aus = !T.aus; re(); };
  $$("[data-cr]").forEach(b => b.onclick = () => { const r = ex.rx.find(x => x.id === b.dataset.cr); T.p[r.id] = +(T.p[r.id] || 0) >= 1 ? 0 : 1; re(); });
  $$("[data-cp]").forEach(b => b.onclick = () => { const [id, n] = b.dataset.cp.split("|"); T.p[id] = +n; re(); });
  $("#cTodo").onclick = () => { ex.rx.forEach(r => T.p[r.id] = ptsRx(r)); T.aus = false; re(); };
  const guarda = () => { ex.res = ex.res || {}; ex.res[T.id] = { v: T.v, aus: T.aus, p: T.aus ? {} : Object.assign({}, T.p), f: hoy() }; guardar(); };
  const mover = d => { const i = L.findIndex(x => x.id === S.al), b = L[i + d]; S.tmp = null; if (b) { S.al = b.id; pintar(); scrollTo(0, 0); } else { S.al = null; pintar(); toast("Calificaciones guardadas."); } };
  $("#cSig").onclick = () => { guarda(); mover(1); }; $("#cAnt").onclick = () => { guarda(); mover(-1); }; };

/* =================================================================== RESULTADOS Y ANÁLISIS */
function analisisEx(ex) { const g = grDe(ex.gid), L = g ? activos(g) : [], O = ordenEx(ex, "A");
  const al = L.map(a => ({ a, r: (ex.res || {})[a.id], c: califEx(ex, (ex.res || {})[a.id]) })), con = al.filter(x => x.c != null);
  const porRx = O.map((o, i) => { const v = con.map(x => Math.min(ptsRx(o.r), +((x.r.p || {})[o.r.id] || 0)) / ptsRx(o.r)); return { n: i + 1, r: o.r, p: v.length ? v.reduce((s, y) => s + y, 0) / v.length : null }; });
  const porC = ex.conts.map((c, i) => { const R = porRx.filter(x => x.r.cont === i && x.p != null); return { i, c: c.c, p: R.length ? R.reduce((s, y) => s + y.p, 0) / R.length : null, n: R.length }; });
  const prom = con.length ? con.reduce((s, x) => s + x.c, 0) / con.length : null;
  return { g, al, con, porRx, porC, prom, aprob: con.filter(x => x.c >= 6).length }; }
const barraP = p => `<span style="display:inline-block;width:90px;height:9px;border-radius:9px;background:var(--hilo2);vertical-align:middle;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(100 * (p || 0))}%;background:${p >= .8 ? "var(--jade)" : p >= .6 ? "var(--maiz)" : "var(--rojo)"}"></i></span> <b>${p == null ? "—" : Math.round(100 * p) + "%"}</b>`;
VISTAS.exResultados = () => { const ex = exDe(S.id); if (!ex) return VISTAS.examenes(); const A = analisisEx(ex);
  return barra("Resultados", esc(ex.titulo), `<button class="btn s" id="rsI">${ic("impr", 16)} Imprimir</button>`) + `<main class="wrap">
  <div class="kpis mt"><div class="kpi"><b>${A.prom == null ? "—" : A.prom.toFixed(1)}</b><span>Promedio</span></div><div class="kpi"><b>${A.con.length}/${A.al.length}</b><span>Calificados</span></div><div class="kpi"><b>${A.con.length ? Math.round(100 * A.aprob / A.con.length) + "%" : "—"}</b><span>Con 6 o más</span></div><div class="kpi"><b>${A.con.length ? Math.max(...A.con.map(x => x.c)).toFixed(1) : "—"}</b><span>Más alta</span></div></div>
  ${!A.con.length ? `<div class="vacio mt">Aún no hay calificaciones. Toque «Calificar» en el examen.</div>` : `
  <h2 class="sec-t">Por contenido<small>Porcentaje de aciertos del grupo</small></h2><section class="card">${A.porC.map(x => `<p class="small mt"><b>${x.i + 1}.</b> ${esc(x.c)}<br>${barraP(x.p)}${x.p != null && x.p < .6 ? ' <span class="tag r">Reforzar</span>' : ""}</p>`).join("")}</section>
  <h2 class="sec-t">Por reactivo<small>Del más difícil al más fácil</small></h2><section class="card">${A.porRx.filter(x => x.p != null).sort((x, y) => x.p - y.p).map(x => `<p class="small mt"><b>${x.n}.</b> ${esc(x.r.txt.slice(0, 110))}${x.r.txt.length > 110 ? "…" : ""}<br>${barraP(x.p)} <span class="muted">· ${RX[x.r.tipo]}</span></p>`).join("")}</section>
  <h2 class="sec-t">Alumnos</h2><div class="tabla-c"><table class="tabla"><thead><tr><th>Alumno(a)</th><th class="c">Calif.</th><th>Contenidos por reforzar</th></tr></thead><tbody>${A.al.map(x => `<tr><td>${esc(x.a.nombre)}</td><td class="c"><b style="color:${colCal(x.c)}">${x.r && x.r.aus ? "NP" : x.c == null ? "—" : x.c.toFixed(1)}</b></td><td class="small">${x.c == null ? "" : debilesAl(ex, x.r).join(", ")}</td></tr>`).join("")}</tbody></table></div>
  <p class="small muted mt">NP = no presentó. «Contenidos por reforzar»: los del examen donde el alumno obtuvo menos del 60 % de los puntos.</p>`}</main>`; };
function debilesAl(ex, r) { return ex.conts.map((c, i) => { const R = ex.rx.filter(x => x.cont === i); if (!R.length) return null; const t = R.reduce((s, x) => s + ptsRx(x), 0), o = R.reduce((s, x) => s + Math.min(ptsRx(x), +((r.p || {})[x.id] || 0)), 0); return o / t < .6 ? "C" + (i + 1) : null; }).filter(Boolean); }
ENLAZAR.exResultados = () => { const ex = exDe(S.id); if (!ex) return; $("#rsI").onclick = () => imprimir(docResultados(ex)); };
function docResultados(ex) { const A = analisisEx(ex), g = A.g;
  return `<div class="doc">${encabezado(g, "Resultados · " + esc(ex.titulo))}<div class="datos"><span><b>Grupo:</b> ${esc(grNom(g))}</span><span><b>Aplicación:</b> ${fCorta(ex.fecha)}</span><span><b>Docente:</b> ${esc(yo().nombre)}</span><span><b>Promedio:</b> ${A.prom == null ? "—" : A.prom.toFixed(1)}</span><span><b>Con 6 o más:</b> ${A.aprob} de ${A.con.length}</span><span><b>Reactivos:</b> ${ex.rx.length} (${totalEx(ex)} puntos)</span></div>
  <h2>Aciertos por contenido</h2><table><thead><tr><th class="c" style="width:6%">No.</th><th>Contenido</th><th class="c" style="width:12%">Aciertos</th><th class="c" style="width:12%"></th></tr></thead><tbody>${A.porC.map(x => `<tr><td class="c">C${x.i + 1}</td><td>${esc(x.c)}</td><td class="c">${x.p == null ? "—" : Math.round(100 * x.p) + "%"}</td><td class="c">${x.p != null && x.p < .6 ? "Reforzar" : ""}</td></tr>`).join("")}</tbody></table>
  <h2>Reactivos con más errores</h2><table><thead><tr><th class="c" style="width:6%">No.</th><th>Reactivo</th><th class="c" style="width:12%">Aciertos</th></tr></thead><tbody>${A.porRx.filter(x => x.p != null).sort((x, y) => x.p - y.p).slice(0, 8).map(x => `<tr><td class="c">${x.n}</td><td>${esc(x.r.txt)}</td><td class="c">${Math.round(100 * x.p)}%</td></tr>`).join("")}</tbody></table>
  <h2>Calificaciones</h2><table><thead><tr><th class="c" style="width:6%">No.</th><th>Alumno(a)</th><th class="c" style="width:12%">Calificación</th><th style="width:30%">Contenidos por reforzar</th></tr></thead><tbody>${A.al.map((x, i) => `<tr><td class="c">${i + 1}</td><td>${esc(x.a.nombre)}</td><td class="c"><b>${x.r && x.r.aus ? "NP" : x.c == null ? "—" : x.c.toFixed(1)}</b></td><td>${x.c == null ? "" : debilesAl(ex, x.r).join(", ")}</td></tr>`).join("")}</tbody></table>
  <table class="firmas"><tr><td>${esc(yo().nombre)}<br>Docente</td><td>${esc(dirTxt(g))}<br>Dirección de la escuela</td></tr></table></div>`; }
