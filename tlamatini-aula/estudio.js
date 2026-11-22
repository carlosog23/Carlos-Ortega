/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Tlamatini Aula.
   Mi actualización profesional: si el docente lo activa, cada día de clase la app le hace de 1 a 5 preguntas al iniciar
   (estilo del instrumento de apreciación de conocimientos y aptitudes de USICAMM) y le explica cada respuesta al cerrar la clase,
   la haya contestado bien o mal, con su fundamento (art. 3o, Ley General de Educación, LGDNNA, Plan de Estudio 2022, inclusión…). */
"use strict";
const EST_PERFILES = { doc: "Promoción horizontal (docente)", dir: "Promoción a dirección", sup: "Promoción a supervisión", atp: "Asesoría técnica pedagógica", gen: "Repaso general (admisión y actualización)" };
const ESTD = () => { const x = D.est = D.est || {}; return Object.assign(x, { on: !!x.on, n: x.n || 3, per: x.per || "doc", areas: x.areas || Object.keys(EST_AREAS), hora: x.hora || "", tlami: x.tlami !== false, dias: x.dias || {}, hist: x.hist || {}, ia: x.ia || [] }); };
const estHora = () => { const E = ESTD(); if (E.hora) return E.hora; const t = String((gAct() || {}).turno || ""); return /vesp/i.test(t) ? "18:30" : /completo/i.test(t) ? "16:00" : "12:30"; };
const estPool = () => { const E = ESTD(); return EST_BANCO.concat(E.ia).filter(q => E.areas.includes(q.a) && (!q.per || E.per === "gen" || q.per.includes(E.per))); };
const estQ = id => EST_BANCO.find(q => q.id === id) || ESTD().ia.find(q => q.id === id);
const estAhora = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
function estBaraja(n) { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/* elige las preguntas del día: primero las que nunca ha visto; luego las que falló hace más de 5 días; luego las más antiguas */
function estElegir(n) { const E = ESTD(), P = estPool(), k = hoy(), dias = (a, b) => (dF(b) - dF(a)) / 864e5;
  const nuevas = P.filter(q => !E.hist[q.id]).sort(() => Math.random() - .5);
  const falladas = P.filter(q => E.hist[q.id] && E.hist[q.id].ok < E.hist[q.id].v && dias(E.hist[q.id].ult, k) >= 5).sort((a, b) => E.hist[a.id].ult.localeCompare(E.hist[b.id].ult));
  const viejas = P.filter(q => E.hist[q.id]).sort((a, b) => E.hist[a.id].ult.localeCompare(E.hist[b.id].ult));
  const out = []; for (const q of [...nuevas.slice(0, Math.max(1, n - 1)), ...falladas, ...nuevas, ...viejas]) { if (out.length >= n) break; if (!out.includes(q.id)) out.push(q.id); }
  return out; }
function estDia(crear) { const E = ESTD(), k = hoy(); if (!E.dias[k] && crear) { E.dias[k] = { q: estElegir(E.n), r: {}, ord: {}, cerr: false, rev: false }; E.dias[k].q.forEach(id => { const q = estQ(id); if (q) E.dias[k].ord[id] = estBaraja(q.o.length); }); guardar(); } return E.dias[k] || null; }
const estContestado = d => d && d.q.length && d.q.every(id => d.r[id] != null);
const estAbierto = d => d && (d.cerr || estAhora() >= estHora());
/* lo llama el modo clase al terminar una sesión: libera las explicaciones del día */
function estCerrar() { const d = estDia(false); if (d && !d.cerr) { d.cerr = true; guardar(); } }
function estRegistrar(d) { const E = ESTD(), k = hoy(); d.q.forEach(id => { const q = estQ(id); if (!q || d.r[id] == null || d.reg) return; const h = E.hist[id] = E.hist[id] || { v: 0, ok: 0, ult: k }; h.v++; if (d.r[id] === q.k) h.ok++; h.ult = k; }); d.reg = true; }
function estRacha() { const E = ESTD(); let n = 0; const d = new Date(); for (let i = 0; i < 400; i++) { const k = iso(d); if (E.dias[k] && estContestado(E.dias[k])) n++; else if (k !== hoy() && d.getDay() !== 0 && d.getDay() !== 6 && !sinClase(k)) break; d.setDate(d.getDate() - 1); } return n; }

/* ---------- tarjeta en el inicio ---------- */
function estTarjeta() { const E = ESTD(); if (!E.on) return ""; const d = estDia(false), sc = sinClase(hoy());
  if (!d && sc) return "";
  const est = !d || !estContestado(d) ? "pend" : estAbierto(d) ? (d.rev ? "listo" : "ver") : "espera", ok = d ? d.q.filter(id => d.r[id] === (estQ(id) || {}).k).length : 0;
  const txt = { pend: [`${d ? d.q.length - Object.keys(d.r).length : E.n} ${E.n === 1 ? "pregunta" : "preguntas"} para iniciar el día`, "Contestar ahora"], espera: [`Ya contestó. La explicación de cada respuesta llega al cerrar la clase (${estHora()}).`, "Ya terminé mi clase"], ver: ["Ya puede ver la explicación de sus respuestas de hoy.", "Ver explicaciones"], listo: [`Hoy: ${ok} de ${d ? d.q.length : 0} correctas · racha de ${estRacha()} días`, "Ver mi avance"] }[est];
  return `<section class="card mt" style="border-left:5px solid var(--maiz);display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="tlami-av" style="flex:none">${ic("libro", 22)}</span><div style="flex:1;min-width:180px"><b>Mi actualización profesional</b><p class="small muted">${txt[0]}</p></div><button class="btn ${est === "listo" ? "s" : "p"}" id="estB" data-est="${est}">${txt[1]}</button></section>`; }
function estEnlazar() { const b = $("#estB"); if (!b) return; b.onclick = () => { const s = b.dataset.est;
  if (s === "pend") return estPreguntar(); if (s === "espera") { estCerrar(); re(); return estExplicar(); } if (s === "ver") return estExplicar(); ir("estudio"); };
  const d = estDia(false); if (ESTD().on && !sinClase(hoy()) && (!d || !estContestado(d)) && !estEnlazar.ya) { estEnlazar.ya = true; setTimeout(estPreguntar, 600); } }

/* ---------- preguntar (al iniciar) ---------- */
function estPreguntar() { const d = estDia(true); if (!d.q.length) return toast("No hay preguntas en los temas que eligió. Revise sus temas en «Mi actualización profesional».");
  const pend = d.q.filter(id => d.r[id] == null); if (!pend.length) return re(); let i = 0;
  const una = () => { const id = pend[i], q = estQ(id); if (!q) { d.r[id] = -1; return sig(); } const ord = d.ord[id] || estBaraja(q.o.length), n = d.q.indexOf(id) + 1;
    dlg(`<div class="fila" style="justify-content:space-between;gap:8px"><span class="tag m">Pregunta ${n} de ${d.q.length}</span><span class="tag g">${esc(EST_AREAS[q.a] || "")}</span></div>
     <p class="small muted mt">${esc(EST_FORMATOS[q.f] || "")}</p><p class="mt" style="white-space:pre-line;font-weight:600;line-height:1.45">${esc(q.p)}</p>
     <div class="lista mt">${ord.map((oi, j) => `<button class="it btnit" data-eo="${oi}" style="text-align:left"><span class="av">${"ABC"[j]}</span><span class="tx">${esc(q.o[oi])}</span></button>`).join("")}</div>
     <p class="small muted mt">La explicación llega al cerrar la clase, la conteste bien o mal.</p><div class="fila fin mt"><button class="btn s" id="eoX">Después</button></div>`, v => {
      v.querySelectorAll("[data-eo]").forEach(b => b.onclick = () => { d.r[id] = +b.dataset.eo; guardar(); sig(); }); v.querySelector("#eoX").onclick = () => { cerrarDlg(); re(); }; }); };
  const sig = () => { i++; if (i < pend.length) return una(); cerrarDlg(); estRegistrar(d); guardar(); re(); toast(`<b>Listo.</b> Al cerrar la clase (${estHora()}) verá la explicación de cada respuesta.`, 4000); };
  una(); }

/* ---------- explicar (al cerrar) ---------- */
function estExplicar(k) { const E = ESTD(), d = E.dias[k || hoy()]; if (!d) return; d.rev = true; guardar();
  const ok = d.q.filter(id => d.r[id] === (estQ(id) || {}).k).length;
  dlg(`<h3>${k && k !== hoy() ? fLarga(k) : "Sus respuestas de hoy"}</h3><p class="small muted mb">${ok} de ${d.q.length} correctas. Lea la explicación de cada una: así se aprende también de los aciertos.</p>
   <div style="max-height:62vh;overflow:auto">${d.q.map((id, n) => { const q = estQ(id); if (!q) return ""; const r = d.r[id], bien = r === q.k;
    return `<section class="card mt" style="padding:12px;border-left:5px solid ${r == null ? "var(--hilo)" : bien ? "var(--jade)" : "var(--rojo)"}"><p class="small"><b>${n + 1}.</b> <span style="white-space:pre-line">${esc(q.p)}</span></p>
      ${q.o.map((t, oi) => `<p class="small mt" style="${oi === q.k ? "color:var(--jade);font-weight:700" : oi === r ? "color:var(--rojo);text-decoration:line-through" : "color:var(--gris)"}">${oi === q.k ? "✓" : oi === r ? "✗" : "·"} ${esc(t)}</p>`).join("")}
      <p class="small mt">${r == null ? "<b>No la contestó.</b> " : bien ? "<b>¡Correcto!</b> " : "<b>La respuesta correcta es la marcada en verde.</b> "}${esc(q.e)}</p>
      <p class="small muted mt"><b>Fundamento:</b> ${esc(q.fu)}${q.ia ? " · Reactivo propuesto por Tlami: verifique el fundamento en la fuente." : ""}</p></section>`; }).join("")}</div>
   <div class="fila fin mt"><button class="btn" id="exV">Mi avance</button><button class="btn p" id="exOk">Entendido</button></div>`, v => { v.querySelector("#exOk").onclick = () => { cerrarDlg(); re(); }; v.querySelector("#exV").onclick = () => { cerrarDlg(); ir("estudio"); }; }); }

/* ---------- Tlami propone reactivos nuevos cuando se agotan los del banco ---------- */
async function estTlami(n) { const E = ESTD(), g = gAct();
  const j = await aulaPost("aulaIA", { modo: "estudio", perfil: EST_PERFILES[E.per], nivel: g ? nivelTxt(g) : "primaria", areas: E.areas.map(a => EST_AREAS[a]), cuantos: n || 8, evitar: estPool().slice(-60).map(q => q.p.slice(0, 90)).join(" | ") }, 110000);
  const L = ((j.r || {}).reactivos || []).map(r => { const a = Object.keys(EST_AREAS).find(k => EST_AREAS[k] === r.area) || E.areas[0], o = (r.o || []).map(String).slice(0, 3), k = parseInt(r.k, 10);
    if (!r.p || o.length !== 3 || !(k >= 0 && k <= 2) || !r.e) return null; return { id: "ia-" + uid(), a, f: EST_FORMATOS[r.f] ? r.f : "d", p: String(r.p), o, k, e: String(r.e), fu: String(r.fu || "Plan de Estudio 2022 y normatividad vigente"), ia: true }; }).filter(Boolean);
  E.ia.push(...L); if (E.ia.length > 400) E.ia = E.ia.slice(-400); guardar(); return L.length; }
async function estRellenar() { const E = ESTD(); if (!E.on || !E.tlami || DEMO) return; const nuevas = estPool().filter(q => !E.hist[q.id]).length;
  if (nuevas >= E.n * 3 || estRellenar.va) return; estRellenar.va = true; try { await estTlami(8); } catch (e) {} estRellenar.va = false; }

/* =================================================================== VISTA */
VISTAS.estudio = () => { const E = ESTD(), tab = S.etab || (E.on ? "avance" : "ajustes"), P = estPool(), vistas = P.filter(q => E.hist[q.id]).length;
  const porA = Object.keys(EST_AREAS).map(a => { const L = Object.entries(E.hist).map(([id, h]) => [estQ(id), h]).filter(([q]) => q && q.a === a), v = L.reduce((s, x) => s + x[1].v, 0), ok = L.reduce((s, x) => s + x[1].ok, 0); return { a, v, ok }; });
  return barra("Tlamatini Aula", "Mi actualización profesional") + `<main class="wrap">
  <section class="portada" style="background:radial-gradient(500px 260px at 90% 0,rgba(232,163,61,.35),transparent 70%),linear-gradient(150deg,#294A86,#13244A 70%)"><h1>Aprender un poco cada día</h1>
   <p>Si lo activa, al iniciar su jornada la app le hace de 1 a 5 preguntas como las del examen de USICAMM, y al cerrar la clase le explica cada respuesta con su fundamento: artículo 3o, Ley General de Educación, derechos de la niñez, Plan de Estudio 2022, inclusión, convivencia y gestión escolar.</p></section>
  <div class="chips mt">${[["avance", "Mi avance"], ["ajustes", "Ajustes"], ["guia", "Cómo es el examen"]].map(([k, t]) => `<button class="chip" data-etab="${k}" aria-pressed="${tab === k}">${t}</button>`).join("")}</div>
  ${tab === "ajustes" ? `<section class="card mt"><label class="rev-chk"><input type="checkbox" id="esOn" ${E.on ? "checked" : ""}> <b>Activar mis preguntas diarias</b></label><p class="small muted">Solo usted las ve. Puede desactivarlas cuando quiera.</p></section>
   <section class="card mt"><h3>¿Cuántas preguntas al día?</h3><div class="chips">${[1, 2, 3, 4, 5].map(n => `<button class="chip" data-esn="${n}" aria-pressed="${E.n === n}">${n}</button>`).join("")}</div></section>
   <section class="card mt"><h3>¿Para qué se prepara?</h3><div class="chips">${Object.entries(EST_PERFILES).map(([k, t]) => `<button class="chip" data-esp="${k}" aria-pressed="${E.per === k}">${t}</button>`).join("")}</div></section>
   <section class="card mt"><h3>Temas</h3>${Object.entries(EST_AREAS).map(([k, t]) => `<label class="rev-chk"><input type="checkbox" data-esa="${k}" ${E.areas.includes(k) ? "checked" : ""}> ${t}</label>`).join("")}</section>
   <section class="card mt"><h3>¿A qué hora cierra su clase?</h3><p class="small muted mb">A esa hora se liberan las explicaciones. También se liberan al terminar una sesión en «Dar la clase» o con el botón «Ya terminé mi clase».</p><input type="time" id="esH" value="${estHora()}"></section>
   <section class="card mt"><label class="rev-chk"><input type="checkbox" id="esT" ${E.tlami ? "checked" : ""}> Cuando se acaben las preguntas del banco, que Tlami prepare nuevas</label><p class="small muted">El banco tiene ${EST_BANCO.length} reactivos revisados con las guías oficiales 2026-2027${E.ia.length ? ` y ${E.ia.length} propuestos por Tlami` : ""}.</p><button class="btn s tlami-b mt" id="esG">${ic("chispa", 14)} Pedir 8 preguntas nuevas a Tlami</button></section>`
  : tab === "guia" ? `<section class="card mt"><h3>¿Cómo es el instrumento?</h3><p class="small">En los procesos de USICAMM 2026-2027 (admisión, promoción horizontal, promoción a dirección o supervisión, horas adicionales) se aplica el <b>instrumento de apreciación de conocimientos y aptitudes</b>: 90 reactivos de opción múltiple con tres opciones y una sola correcta. En la promoción horizontal vale 30 de 100 puntos (formación 15, antigüedad 35, actualización 20); en la promoción a dirección o supervisión también vale 30.</p></section>
   <section class="card mt"><h3>Áreas que evalúa</h3><p class="small"><b>1. Aspectos normativos:</b> principios legales para la educación integral (derechos de la niñez, interés superior, acceso, permanencia, no discriminación) y bases normativas de la Nueva Escuela Mexicana.<br><b>2. Intervención docente</b> (o gestión escolar, o asesoría, según la función): el trabajo con los alumnos, el marco curricular de la NEM, la planeación, la mejora continua, la cultura de paz.<br><b>3. Escuela, familias y comunidad:</b> trabajo colegiado, vinculación con familias, comunidad e instituciones, entornos seguros e inclusivos.</p></section>
   <section class="card mt"><h3>Formatos de las preguntas</h3><p class="small"><b>Cuestionamiento directo:</b> una pregunta o situación que pide una respuesta concreta.<br><b>Completamiento:</b> un enunciado con espacios en blanco.<br><b>Ordenamiento:</b> elementos que se acomodan en secuencia.<br><b>Relación de elementos:</b> dos columnas que se vinculan (por ejemplo 1b, 2c, 3a).</p></section>
   <section class="card mt"><h3>Bibliografía oficial</h3><p class="small">Constitución (arts. 3o, 4o y 31), Ley General de Educación (arts. 5 a 16, 78, 79, 106, 128 a 132), Ley General de los Derechos de Niñas, Niños y Adolescentes, Plan de Estudio 2022, programas sintéticos, «Un libro sin recetas», protocolos contra el acoso escolar y la violencia sexual, lineamientos de alimentos, CTE, mejora continua, entre otros. Se consulta gratis en el sitio de guías de USICAMM.</p><p class="small mt"><a href="https://usicamm.sep.gob.mx/" target="_blank" rel="noopener">Sitio oficial de USICAMM</a></p></section>`
  : `<div class="kpis mt"><div class="kpi"><b>${estRacha()}</b><span>Días seguidos</span></div><div class="kpi"><b>${vistas}</b><span>Preguntas vistas</span></div><div class="kpi"><b>${(() => { const v = porA.reduce((s, x) => s + x.v, 0); return v ? Math.round(100 * porA.reduce((s, x) => s + x.ok, 0) / v) + "%" : "—"; })()}</b><span>Aciertos</span></div><div class="kpi"><b>${P.length - vistas}</b><span>Por descubrir</span></div></div>
   ${!E.on ? `<div class="vacio mt">Las preguntas diarias están desactivadas. Actívelas en «Ajustes».</div>` : ""}
   <h2 class="sec-t">Por tema</h2><section class="card">${porA.filter(x => E.areas.includes(x.a)).map(x => `<p class="small mt"><b>${EST_AREAS[x.a]}</b><br><span style="display:inline-block;width:120px;height:9px;border-radius:9px;background:var(--hilo2);overflow:hidden;vertical-align:middle"><i style="display:block;height:100%;width:${x.v ? Math.round(100 * x.ok / x.v) : 0}%;background:var(--jade)"></i></span> ${x.v ? Math.round(100 * x.ok / x.v) + "% de " + x.v : "sin respuestas aún"}</p>`).join("")}</section>
   <h2 class="sec-t">Días anteriores<small>Toque un día para repasar sus explicaciones</small></h2><div class="lista">${Object.keys(E.dias).sort().reverse().slice(0, 30).map(k => { const d = E.dias[k], ok = d.q.filter(id => d.r[id] === (estQ(id) || {}).k).length;
     return `<button class="it btnit" data-esd="${k}" ${k === hoy() && !estAbierto(d) ? "disabled" : ""}><span class="tx"><b>${fLarga(k)}</b><small>${estContestado(d) ? `${ok} de ${d.q.length} correctas` : "Sin contestar"}${k === hoy() && !estAbierto(d) ? " · explicación al cerrar la clase" : ""}</small></span>${ic("sig", 16)}</button>`; }).join("") || `<div class="vacio">Aún no hay días registrados.</div>`}</div>`}</main>`; };
ENLAZAR.estudio = () => { const E = ESTD();
  $$("[data-etab]").forEach(b => b.onclick = () => { S.etab = b.dataset.etab; re(); });
  $("#esOn") && ($("#esOn").onchange = e => { E.on = e.target.checked; guardar(); toast(E.on ? `<b>Activado.</b> Cada día de clase le esperan ${E.n} ${E.n === 1 ? "pregunta" : "preguntas"} al abrir la app.` : "Preguntas diarias desactivadas."); if (E.on) estRellenar(); });
  $$("[data-esn]").forEach(b => b.onclick = () => { E.n = +b.dataset.esn; const d = E.dias[hoy()]; if (d && !Object.keys(d.r).length) delete E.dias[hoy()]; guardar(); re(); });
  $$("[data-esp]").forEach(b => b.onclick = () => { E.per = b.dataset.esp; guardar(); re(); });
  $$("[data-esa]").forEach(c => c.onchange = () => { const k = c.dataset.esa; E.areas = c.checked ? [...new Set(E.areas.concat(k))] : E.areas.filter(x => x !== k); if (!E.areas.length) { E.areas = [k]; c.checked = true; toast("Deje al menos un tema."); } guardar(); });
  $("#esH") && ($("#esH").onchange = e => { E.hora = e.target.value; guardar(); });
  $("#esT") && ($("#esT").onchange = e => { E.tlami = e.target.checked; guardar(); });
  $("#esG") && ($("#esG").onclick = async () => { tlamiEspera("Preparando preguntas nuevas al estilo del examen, con su explicación y fundamento."); try { const n = await estTlami(8); cerrarDlg(); re(); toast(n ? `Tlami agregó ${n} preguntas nuevas a su banco.` : "Tlami no pudo preparar preguntas esta vez."); } catch (e) { tlamiError(e); } });
  $$("[data-esd]").forEach(b => b.onclick = () => estExplicar(b.dataset.esd)); };

/* aula.js ya pintó el inicio antes de cargar este archivo: se vuelve a pintar para mostrar la tarjeta y la puerta */
try { if (!S.v || S.v === "inicio") re(); } catch (e) {}
