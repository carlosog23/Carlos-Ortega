/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Tlamatini Aula.
   Mi actualización profesional (opcional):
   · Preguntas del día: de 1 a 5 al iniciar la jornada; la explicación de cada una llega al cerrar la clase, bien o mal contestada.
   · Estudiar ahora: práctica libre por tema, con la explicación inmediata y el documento oficial para profundizar.
   · Simulacro: examen de práctica de 30 o 90 reactivos repartidos por áreas, como el instrumento de USICAMM.
   · Biblioteca: la bibliografía oficial con sus enlaces.
   Banco: estudio-banco*.js (reactivos redactados) + estudio-gen.js (construidos de los programas sintéticos) + Tlami. */
"use strict";
const EST_PERFILES = { doc: "Promoción horizontal (docente)", dir: "Promoción a dirección", sup: "Promoción a supervisión", atp: "Asesoría técnica pedagógica", gen: "Repaso general (admisión y actualización)" };
const EST_MEZCLA = { doc: { norm: 28, curr: 25, apr: 10, incl: 12, gest: 12, com: 13 }, gen: { norm: 28, curr: 25, apr: 10, incl: 12, gest: 12, com: 13 }, dir: { norm: 30, gest: 30, incl: 15, com: 15, curr: 10 }, sup: { norm: 30, gest: 35, incl: 15, com: 15, curr: 5 }, atp: { norm: 25, gest: 25, curr: 25, incl: 10, com: 10, apr: 5 } };
const ESTD = () => { const x = D.est = D.est || {}; return Object.assign(x, { on: !!x.on, n: x.n || 3, per: x.per || "doc", areas: x.areas || Object.keys(EST_AREAS), hora: x.hora || "", tlami: x.tlami !== false, dias: x.dias || {}, hist: x.hist || {}, ia: x.ia || [], sims: x.sims || [] }); };
const estHora = () => { const E = ESTD(); if (E.hora) return E.hora; const t = String((gAct() || {}).turno || ""); return /vesp/i.test(t) ? "18:30" : /completo/i.test(t) ? "16:00" : "12:30"; };
const estNivs = () => { const L = [...new Set((D.grupos || []).map(g => g.nivel || "pri"))]; return L.length ? L : [typeof APP_PRE !== "undefined" && APP_PRE ? "pre" : "pri"]; };
/* reactivos que le tocan: perfil, nivel y, si se pide, temas */
function estPool(areas) { const E = ESTD(), nv = estNivs(), A = areas || E.areas;
  return EST_BANCO.concat(E.ia).filter(q => A.includes(q.a) && (!q.per || E.per === "gen" || q.per.includes(E.per)) && (!q.niv || E.per === "gen" || nv.includes(q.niv))); }
const estQ = id => EST_BANCO.find(q => q.id === id) || ESTD().ia.find(q => q.id === id);
const estAhora = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
function estBaraja(n) { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const estMezcla = L => { const a = L.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const estFallada = id => { const h = ESTD().hist[id]; return h && h.ok < h.v; };
function estAnotar(id, r) { const E = ESTD(), q = estQ(id), k = hoy(); if (!q) return; const h = E.hist[id] = E.hist[id] || { v: 0, ok: 0, ult: k }; h.v++; if (r === q.k) { h.ok++; h.fallo = false; } else h.fallo = true; h.ult = k; }
/* elige las preguntas del día, repartidas por área según el peso de cada una en el examen de su perfil;
   dentro de cada área: primero las que nunca ha visto, luego las que falló hace 5 días o más, luego las más antiguas */
function estElegir(n, areas) { const E = ESTD(), k = hoy(), dias = (a, b) => (dF(b) - dF(a)) / 864e5, A = areas || E.areas, mez = EST_MEZCLA[E.per] || EST_MEZCLA.doc, colas = {};
  A.forEach(a => { const P = estPool([a]);
    const nuevas = estMezcla(P.filter(q => !E.hist[q.id])), falladas = P.filter(q => estFallada(q.id) && dias(E.hist[q.id].ult, k) >= 5).sort((x, y) => E.hist[x.id].ult.localeCompare(E.hist[y.id].ult)),
      viejas = P.filter(q => E.hist[q.id] && !estFallada(q.id)).sort((x, y) => E.hist[x.id].ult.localeCompare(E.hist[y.id].ult));
    const L = []; [falladas.slice(0, 1), nuevas, falladas.slice(1), viejas].forEach(x => x.forEach(q => { if (!L.includes(q.id)) L.push(q.id); })); if (L.length) colas[a] = L; });
  const out = []; for (let t = 0; t < n * 3 && out.length < n; t++) { const disp = Object.keys(colas).filter(a => colas[a].length); if (!disp.length) break;
    const peso = disp.map(a => mez[a] || 5), tot = peso.reduce((s, x) => s + x, 0); let r = Math.random() * tot, a = disp[0]; for (let i = 0; i < disp.length; i++) { r -= peso[i]; if (r <= 0) { a = disp[i]; break; } }
    const id = colas[a].shift(); if (!out.includes(id)) out.push(id); }
  return out; }
/* ficha de explicación con su documento para estudiar */
function estFicha(q, r, n, sinP) { const bien = r === q.k, docs = typeof estDocsDe === "function" ? estDocsDe(q) : [];
  return `<section class="card mt" style="padding:12px;border-left:5px solid ${r == null ? "var(--hilo)" : bien ? "var(--jade)" : "var(--rojo)"}">${sinP ? "" : `<p class="small">${n ? `<b>${n}.</b> ` : ""}<span style="white-space:pre-line">${esc(q.p)}</span></p>`}
   ${q.o.map((t, oi) => `<p class="small mt" style="${oi === q.k ? "color:var(--jade);font-weight:700" : oi === r ? "color:var(--rojo);text-decoration:line-through" : "color:var(--gris)"}">${oi === q.k ? "✓" : oi === r ? "✗" : "·"} ${esc(t)}</p>`).join("")}
   <p class="small mt">${r == null ? "<b>No la contestó.</b> " : bien ? "<b>¡Correcto!</b> " : "<b>La respuesta correcta es la marcada en verde.</b> "}${esc(q.e)}</p>
   <p class="small muted mt"><b>Fundamento:</b> ${esc(q.fu)}${q.ia ? " · Reactivo propuesto por Tlami: verifique el fundamento en la fuente." : ""}</p>
   ${docs.length ? `<p class="small mt">${ic("libro", 13)} <b>Para estudiarlo:</b> ${docs.map(d => `<a href="${d.u}" target="_blank" rel="noopener">${esc(d.t.split(":")[0].split(" (")[0])}</a>`).join(" · ")}</p>` : ""}</section>`; }

/* ======================= PREGUNTAS DEL DÍA ======================= */
function estDia(crear) { const E = ESTD(), k = hoy(); if (!E.dias[k] && crear) { E.dias[k] = { q: estElegir(E.n), r: {}, ord: {}, cerr: false, rev: false }; E.dias[k].q.forEach(id => { const q = estQ(id); if (q) E.dias[k].ord[id] = estBaraja(q.o.length); }); guardar(); } return E.dias[k] || null; }
const estContestado = d => d && d.q.length && d.q.every(id => d.r[id] != null);
const estAbierto = d => d && (d.cerr || estAhora() >= estHora());
/* lo llama el modo clase al terminar una sesión: libera las explicaciones del día */
function estCerrar() { const d = estDia(false); if (d && !d.cerr) { d.cerr = true; guardar(); } }
function estRegistrar(d) { if (d.reg) return; d.q.forEach(id => { if (d.r[id] != null) estAnotar(id, d.r[id]); }); d.reg = true; }
function estRacha() { const E = ESTD(); let n = 0; const d = new Date(); for (let i = 0; i < 400; i++) { const k = iso(d); if (E.dias[k] && estContestado(E.dias[k])) n++; else if (k !== hoy() && d.getDay() !== 0 && d.getDay() !== 6 && !sinClase(k)) break; d.setDate(d.getDate() - 1); } return n; }
function estTarjeta() { const E = ESTD(); if (!E.on) return ""; const d = estDia(false), sc = sinClase(hoy());
  if (!d && sc) return "";
  const est = !d || !estContestado(d) ? "pend" : estAbierto(d) ? (d.rev ? "listo" : "ver") : "espera", ok = d ? d.q.filter(id => d.r[id] === (estQ(id) || {}).k).length : 0;
  const txt = { pend: [`${d ? d.q.length - Object.keys(d.r).length : E.n} ${E.n === 1 ? "pregunta" : "preguntas"} para iniciar el día`, "Contestar ahora"], espera: [`Ya contestó. La explicación de cada respuesta llega al cerrar la clase (${estHora()}).`, "Ya terminé mi clase"], ver: ["Ya puede ver la explicación de sus respuestas de hoy.", "Ver explicaciones"], listo: [`Hoy: ${ok} de ${d ? d.q.length : 0} correctas · racha de ${estRacha()} días`, "Seguir estudiando"] }[est];
  return `<section class="card mt" style="border-left:5px solid var(--maiz);display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="tlami-av" style="flex:none">${ic("libro", 22)}</span><div style="flex:1;min-width:180px"><b>Mi actualización profesional</b><p class="small muted">${txt[0]}</p></div><button class="btn ${est === "listo" ? "s" : "p"}" id="estB" data-est="${est}">${txt[1]}</button></section>`; }
function estEnlazar() { const b = $("#estB"); if (!b) return; b.onclick = () => { const s = b.dataset.est;
  if (s === "pend") return estPreguntar(); if (s === "espera") { estCerrar(); re(); return estExplicar(); } if (s === "ver") return estExplicar(); S.etab = "estudiar"; ir("estudio"); };
  const d = estDia(false); if (ESTD().on && !sinClase(hoy()) && (!d || !estContestado(d)) && !estEnlazar.ya) { estEnlazar.ya = true; setTimeout(estPreguntar, 600); } }
function estPreguntar() { const d = estDia(true); if (!d.q.length) return toast("No hay preguntas en los temas que eligió. Revise sus temas en «Mi actualización profesional».");
  const pend = d.q.filter(id => d.r[id] == null); if (!pend.length) return re(); let i = 0;
  const una = () => { const id = pend[i], q = estQ(id); if (!q) { d.r[id] = -1; return sig(); } const ord = d.ord[id] || estBaraja(q.o.length), n = d.q.indexOf(id) + 1;
    dlg(`<div class="fila" style="justify-content:space-between;gap:8px"><span class="tag m">Pregunta ${n} de ${d.q.length}</span><span class="tag g">${esc(EST_AREAS[q.a] || "")}</span></div>
     <p class="small muted mt">${esc(EST_FORMATOS[q.f] || "")}</p><p class="mt" style="white-space:pre-line;font-weight:600;line-height:1.45">${esc(q.p)}</p>
     <div class="lista mt">${ord.map((oi, j) => `<button class="it btnit" data-eo="${oi}" style="text-align:left"><span class="av">${"ABC"[j]}</span><span class="tx">${esc(q.o[oi])}</span></button>`).join("")}</div>
     <p class="small muted mt">La explicación llega al cerrar la clase, la conteste bien o mal.</p><div class="fila fin mt"><button class="btn s" id="eoX">Después</button></div>`, v => {
      v.querySelectorAll("[data-eo]").forEach(b => b.onclick = () => { d.r[id] = +b.dataset.eo; guardar(); sig(); }); v.querySelector("#eoX").onclick = () => { cerrarDlg(); re(); }; }); };
  const sig = () => { i++; if (i < pend.length) return una(); cerrarDlg(); estRegistrar(d); guardar(); re(); estRellenar(); toast(`<b>Listo.</b> Al cerrar la clase (${estHora()}) verá la explicación de cada respuesta.`, 4000); };
  una(); }
function estExplicar(k) { const E = ESTD(), d = E.dias[k || hoy()]; if (!d) return; d.rev = true; guardar();
  const ok = d.q.filter(id => d.r[id] === (estQ(id) || {}).k).length;
  dlg(`<h3>${k && k !== hoy() ? fLarga(k) : "Sus respuestas de hoy"}</h3><p class="small muted mb">${ok} de ${d.q.length} correctas. Lea la explicación de cada una: así se aprende también de los aciertos.</p>
   <div style="max-height:62vh;overflow:auto">${d.q.map((id, n) => { const q = estQ(id); return q ? estFicha(q, d.r[id], n + 1) : ""; }).join("")}</div>
   <div class="fila fin mt"><button class="btn" id="exV">Seguir estudiando</button><button class="btn p" id="exOk">Entendido</button></div>`, v => { v.querySelector("#exOk").onclick = () => { cerrarDlg(); re(); }; v.querySelector("#exV").onclick = () => { cerrarDlg(); S.etab = "estudiar"; ir("estudio"); }; }); }

/* ======================= ESTUDIAR AHORA (práctica con explicación inmediata) ======================= */
function estPracticar(ids, titulo) { if (!ids.length) return toast("No hay preguntas con esa selección. Pruebe con otro tema.");
  let i = 0, ok = 0; const R = [];
  const una = () => { const q = estQ(ids[i]); if (!q) { i++; return i < ids.length ? una() : fin(); } const ord = estBaraja(q.o.length);
    dlg(`<div class="fila" style="justify-content:space-between;gap:8px"><span class="tag m">${esc(titulo || "Estudiar")} · ${i + 1} de ${ids.length}</span><span class="tag g">${esc(EST_AREAS[q.a] || "")}</span></div>
     <p class="small muted mt">${esc(EST_FORMATOS[q.f] || "")}</p><p class="mt" style="white-space:pre-line;font-weight:600;line-height:1.45">${esc(q.p)}</p>
     <div class="lista mt" id="epO">${ord.map((oi, j) => `<button class="it btnit" data-po="${oi}" style="text-align:left"><span class="av">${"ABC"[j]}</span><span class="tx">${esc(q.o[oi])}</span></button>`).join("")}</div>
     <div id="epF"></div><div class="fila fin mt"><button class="btn s" id="epX">Terminar</button><button class="btn p" id="epS" hidden>${i + 1 < ids.length ? "Siguiente" : "Ver resumen"}</button></div>`, v => {
      v.querySelector("#epX").onclick = fin;
      v.querySelectorAll("[data-po]").forEach(b => b.onclick = () => { const r = +b.dataset.po; estAnotar(q.id, r); guardar(); if (r === q.k) ok++; R.push([q.id, r]);
        v.querySelector("#epO").hidden = true; v.querySelector("#epF").innerHTML = estFicha(q, r, 0, true); v.querySelector("#epS").hidden = false; });
      v.querySelector("#epS").onclick = () => { i++; i < ids.length ? una() : fin(); }; }); };
  const fin = () => { const n = R.length; estRellenar();
    if (!n) { cerrarDlg(); return re(); }
    dlg(`<h3>Resumen</h3><p class="mb">${ok} de ${n} correctas (${Math.round(100 * ok / n)} %).</p><p class="small muted">Las que falló volverán a aparecer más adelante para que las repase. Abra los documentos sugeridos en las explicaciones para profundizar.</p>
     <div class="fila fin mt"><button class="btn" id="eqM">Otra ronda</button><button class="btn p" id="eqOk">Listo</button></div>`, v => { v.querySelector("#eqOk").onclick = () => { cerrarDlg(); re(); }; v.querySelector("#eqM").onclick = () => { cerrarDlg(); estPracticar(estElegirPractica(S.estP || {}), titulo); }; }); };
  una(); }
function estElegirPractica(o) { const E = ESTD(), areas = o.a && o.a !== "todas" ? [o.a] : Object.keys(EST_AREAS), n = o.n || 10;
  let P = estPool(areas); if (o.doc) { const d = EST_DOCS.find(x => x.id === o.doc); P = estPool(Object.keys(EST_AREAS)).filter(q => d && d.re.test(q.fu || "")); }
  if (o.modo === "falladas") return estMezcla(P.filter(q => estFallada(q.id))).slice(0, n).map(q => q.id);
  const nuevas = estMezcla(P.filter(q => !E.hist[q.id])), resto = estMezcla(P.filter(q => E.hist[q.id]));
  return nuevas.concat(resto).slice(0, n).map(q => q.id); }

/* ======================= SIMULACRO ======================= */
function estArmarSim(n) { const E = ESTD(), mez = EST_MEZCLA[E.per] || EST_MEZCLA.doc, out = [];
  const sumP = Object.values(mez).reduce((s, x) => s + x, 0);
  Object.entries(mez).forEach(([a, p]) => { const quiere = Math.round(n * p / sumP), P = estPool([a]); const nuevas = estMezcla(P.filter(q => !E.hist[q.id])), viejas = estMezcla(P.filter(q => E.hist[q.id]));
    nuevas.concat(viejas).slice(0, quiere).forEach(q => out.push(q.id)); });
  if (out.length < n) estMezcla(estPool(Object.keys(EST_AREAS)).filter(q => !out.includes(q.id))).slice(0, n - out.length).forEach(q => out.push(q.id));
  const ids = estMezcla(out.slice(0, n)), ord = {}; ids.forEach(id => ord[id] = estBaraja(estQ(id).o.length));
  E.sim = { ids, ord, r: {}, i: 0, ini: Date.now(), n: ids.length }; guardar(); }
VISTAS.simulacro = () => { const E = ESTD(), M = E.sim; if (!M) { S.v = "estudio"; S.etab = "simulacro"; return VISTAS.estudio(); }
  if (M.fin) { const ok = M.ids.filter(id => M.r[id] === estQ(id).k).length, porA = {}; M.ids.forEach(id => { const q = estQ(id), x = porA[q.a] = porA[q.a] || [0, 0]; x[1]++; if (M.r[id] === q.k) x[0]++; });
    return barra("Mi actualización profesional", "Resultado del simulacro") + `<main class="wrap"><section class="portada" style="background:linear-gradient(150deg,#294A86,#13244A 70%)"><h1>${ok} de ${M.n} aciertos · ${Math.round(100 * ok / M.n)} %</h1><p>Tiempo: ${(m => m + (m === 1 ? " minuto" : " minutos"))(Math.max(1, Math.round((M.finT - M.ini) / 60000)))}. Revise la explicación de cada reactivo, sobre todo los que falló.</p></section>
     <h2 class="sec-t">Por área</h2><section class="card">${Object.entries(porA).map(([a, [o, t]]) => `<p class="small mt"><b>${EST_AREAS[a]}</b><br><span style="display:inline-block;width:140px;height:9px;border-radius:9px;background:var(--hilo2);overflow:hidden;vertical-align:middle"><i style="display:block;height:100%;width:${Math.round(100 * o / t)}%;background:${o / t >= .7 ? "var(--jade)" : o / t >= .5 ? "var(--maiz)" : "var(--rojo)"}"></i></span> ${o} de ${t}</p>`).join("")}</section>
     <div class="fila mt"><button class="btn p" id="smN">Nuevo simulacro</button><button class="btn" id="smF">Practicar las que fallé</button><button class="btn s" id="smS">Salir</button></div>
     <h2 class="sec-t">Revisión<small>Primero las que falló</small></h2>${M.ids.slice().sort((a, b) => (M.r[a] === estQ(a).k) - (M.r[b] === estQ(b).k)).map(id => `<details class="card mt" style="padding:10px"><summary class="small"><b>${M.r[id] === estQ(id).k ? "✓" : "✗"}</b> ${esc(estQ(id).p.split("\n")[0].slice(0, 120))}…</summary>${estFicha(estQ(id), M.r[id])}</details>`).join("")}</main>`; }
  const id = M.ids[M.i], q = estQ(id), ord = M.ord[id], cont = Object.keys(M.r).length;
  return barra("Mi actualización profesional", `Simulacro · ${M.i + 1} de ${M.n}`) + `<main class="wrap">
   <div class="fila" style="justify-content:space-between"><span class="tag m">${cont} contestadas</span><span class="tag g">${esc(EST_AREAS[q.a])}</span><span class="small muted">${esc(EST_FORMATOS[q.f])}</span></div>
   <div style="height:6px;border-radius:6px;background:var(--hilo2);margin:10px 0;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(100 * cont / M.n)}%;background:var(--anil)"></i></div>
   <section class="card"><p style="white-space:pre-line;font-weight:600;line-height:1.5">${M.i + 1}. ${esc(q.p)}</p>
    <div class="lista mt">${ord.map((oi, j) => `<button class="it btnit" data-so="${oi}" style="text-align:left;${M.r[id] === oi ? "outline:3px solid var(--anil);background:var(--papel2)" : ""}"><span class="av">${"ABC"[j]}</span><span class="tx">${esc(q.o[oi])}</span></button>`).join("")}</div></section>
   <div class="fila mt" style="justify-content:space-between"><button class="btn s" id="smA" ${M.i ? "" : "disabled"}>${ic("atras", 14)} Anterior</button><button class="btn" id="smMapa">Ir a…</button><button class="btn p" id="smG">${M.i + 1 < M.n ? "Siguiente" : "Revisar y terminar"}</button></div>
   <div class="fila fin mt"><button class="btn s" id="smP">Pausar y salir</button><button class="btn" id="smT">Terminar ahora</button></div>
   <p class="small muted mt">En el examen real no hay explicación al momento: aquí tampoco. Al terminar verá su resultado y la explicación de cada reactivo.</p></main>`; };
ENLAZAR.simulacro = () => { const E = ESTD(), M = E.sim; if (!M) return;
  const terminar = () => { M.fin = true; M.finT = Date.now(); M.ids.forEach(id => { if (M.r[id] != null) estAnotar(id, M.r[id]); }); const ok = M.ids.filter(id => M.r[id] === estQ(id).k).length;
    E.sims.push({ f: hoy(), n: M.n, ok, per: E.per }); if (E.sims.length > 60) E.sims = E.sims.slice(-60); guardar(); window.scrollTo(0, 0); re(); estRellenar(); };
  if (M.fin) { $("#smN").onclick = () => { delete E.sim; guardar(); S.v = "estudio"; S.etab = "simulacro"; re(); }; $("#smS").onclick = () => { delete E.sim; guardar(); S.etab = "avance"; ir("estudio"); };
    $("#smF").onclick = () => { const L = M.ids.filter(id => M.r[id] !== estQ(id).k); estPracticar(L.slice(0, 20), "Las que fallé"); }; return; }
  $$("[data-so]").forEach(b => b.onclick = () => { M.r[M.ids[M.i]] = +b.dataset.so; guardar(); if (M.i + 1 < M.n) { M.i++; guardar(); } re(); });
  $("#smA").onclick = () => { M.i = Math.max(0, M.i - 1); guardar(); re(); };
  const confirmar = () => { const falta = M.n - Object.keys(M.r).length;
    dlg(`<h3>¿Terminar el simulacro?</h3><p class="mb">${falta ? `Le faltan ${falta} reactivos sin contestar; contarán como incorrectos.` : "Contestó todos los reactivos."}</p><div class="fila fin"><button class="btn" id="tN">Seguir revisando</button><button class="btn p" id="tS">Terminar</button></div>`, v => { v.querySelector("#tN").onclick = cerrarDlg; v.querySelector("#tS").onclick = () => { cerrarDlg(); terminar(); }; }); };
  $("#smG").onclick = () => { if (M.i + 1 < M.n) { M.i++; guardar(); return re(); } confirmar(); };
  $("#smT").onclick = confirmar;
  $("#smP").onclick = () => { toast("Su simulacro quedó guardado. Puede continuarlo cuando quiera."); S.etab = "simulacro"; ir("estudio"); };
  $("#smMapa").onclick = () => dlg(`<h3>Ir a un reactivo</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:6px;max-height:55vh;overflow:auto">${M.ids.map((id, i) => `<button class="btn ${M.r[id] != null ? "p" : "s"}" data-ir="${i}" style="padding:6px 0">${i + 1}</button>`).join("")}</div><p class="small muted mt">En azul, las que ya contestó.</p>`, v => v.querySelectorAll("[data-ir]").forEach(b => b.onclick = () => { M.i = +b.dataset.ir; guardar(); cerrarDlg(); re(); })); };

/* ======================= TLAMI: reactivos nuevos cuando se agotan los del banco ======================= */
async function estTlami(n, areas) { const E = ESTD(), g = gAct(), A = areas || E.areas;
  const j = await aulaPost("aulaIA", { modo: "estudio", perfil: EST_PERFILES[E.per], nivel: g ? nivelTxt(g) : "primaria", areas: A.map(a => EST_AREAS[a]), cuantos: n || 8, evitar: estMezcla(estPool(A)).slice(0, 50).map(q => q.p.slice(0, 80)).join(" | ") }, 110000);
  const L = ((j.r || {}).reactivos || []).map(r => { const a = Object.keys(EST_AREAS).find(k => EST_AREAS[k] === r.area) || A[0], o = (r.o || []).map(String).slice(0, 3), k = parseInt(r.k, 10);
    if (!r.p || o.length !== 3 || new Set(o).size !== 3 || !(k >= 0 && k <= 2) || !r.e) return null; return { id: "ia-" + uid(), a, f: EST_FORMATOS[r.f] ? r.f : "d", p: String(r.p), o, k, e: String(r.e), fu: String(r.fu || "Plan de Estudio 2022 y normatividad vigente"), ia: true }; }).filter(Boolean);
  E.ia.push(...L); if (E.ia.length > 600) E.ia = E.ia.slice(-600); guardar(); return L.length; }
async function estRellenar() { const E = ESTD(); if (!E.tlami || DEMO || estRellenar.va) return; const nuevas = estPool().filter(q => !E.hist[q.id]).length;
  if (nuevas >= 40) return; estRellenar.va = true; try { await estTlami(10); } catch (e) {} estRellenar.va = false; }

/* =================================================================== VISTA */
VISTAS.estudio = () => { const E = ESTD(), tab = S.etab || (E.on ? "avance" : "estudiar"), P = estPool(Object.keys(EST_AREAS)), vistas = P.filter(q => E.hist[q.id]).length, fall = P.filter(q => estFallada(q.id)).length, o = S.estP = S.estP || { a: "todas", n: 10, modo: "nuevas" };
  const porA = Object.keys(EST_AREAS).map(a => { const L = Object.entries(E.hist).map(([id, h]) => [estQ(id), h]).filter(([q]) => q && q.a === a), v = L.reduce((s, x) => s + x[1].v, 0), ok = L.reduce((s, x) => s + x[1].ok, 0); return { a, v, ok, tot: P.filter(q => q.a === a).length }; });
  const barraA = x => `<span style="display:inline-block;width:120px;height:9px;border-radius:9px;background:var(--hilo2);overflow:hidden;vertical-align:middle"><i style="display:block;height:100%;width:${x.v ? Math.round(100 * x.ok / x.v) : 0}%;background:var(--jade)"></i></span>`;
  const TABS = [["avance", "Mi avance"], ["estudiar", "Estudiar ahora"], ["simulacro", "Simulacro"], ["biblio", "Biblioteca"], ["ajustes", "Preguntas diarias"], ["guia", "Cómo es el examen"]];
  let cuerpo = "";
  if (tab === "estudiar") cuerpo = `<section class="card mt"><h3>¿Qué quiere estudiar?</h3><div class="chips">${[["todas", "Todos los temas"]].concat(Object.entries(EST_AREAS)).map(([k, t]) => `<button class="chip" data-epa="${k}" aria-pressed="${o.a === k && !o.doc}">${t}</button>`).join("")}</div>
     <h3 class="mt">¿Cuántas preguntas?</h3><div class="chips">${[5, 10, 20, 30].map(n => `<button class="chip" data-epn="${n}" aria-pressed="${o.n === n}">${n}</button>`).join("")}</div>
     <h3 class="mt">¿Cuáles?</h3><div class="chips"><button class="chip" data-epm="nuevas" aria-pressed="${o.modo !== "falladas"}">Primero las que no he visto</button><button class="chip" data-epm="falladas" aria-pressed="${o.modo === "falladas"}">Solo las que fallé (${fall})</button></div>
     <button class="btn p mt" id="epGo" style="width:100%">${ic("libro", 16)} Empezar a estudiar</button><p class="small muted mt">Aquí la explicación aparece en cuanto contesta, con el documento oficial para profundizar.</p></section>
    <section class="card mt"><h3>Su banco</h3><p class="small">${P.length} preguntas para su perfil y nivel: ${P.length - vistas} sin ver, ${fall} por repasar.${E.ia.length ? ` Incluye ${E.ia.length} preparadas por Tlami.` : ""} Cuando le queden pocas sin ver, Tlami prepara más automáticamente.</p><button class="btn s tlami-b mt" id="esG">${ic("chispa", 14)} Pedir 10 preguntas nuevas a Tlami</button></section>`;
  else if (tab === "simulacro") cuerpo = (E.sim && !E.sim.fin ? `<section class="card mt" style="border-left:5px solid var(--anil)"><b>Tiene un simulacro en curso</b><p class="small muted">${Object.keys(E.sim.r).length} de ${E.sim.n} contestadas.</p><div class="fila mt"><button class="btn p" id="smC">Continuar</button><button class="btn s" id="smX">Descartarlo</button></div></section>` : "") +
    `<section class="card mt"><h3>Examen de práctica</h3><p class="small">Como el instrumento de USICAMM: reactivos de tres opciones repartidos por áreas según su perfil (${esc(EST_PERFILES[E.per])}). No verá la respuesta hasta terminar.</p>
     <div class="fila mt"><button class="btn p" data-sim="90">Simulacro completo · 90</button><button class="btn" data-sim="45">Medio · 45</button><button class="btn" data-sim="30">Rápido · 30</button></div>
     <p class="small muted mt">Puede pausarlo y continuarlo después.</p></section>
    ${E.sims.length ? `<h2 class="sec-t">Sus simulacros</h2><div class="lista">${E.sims.slice().reverse().slice(0, 12).map(s => `<div class="it"><span class="tx"><b>${s.ok} de ${s.n} · ${Math.round(100 * s.ok / s.n)} %</b><small>${fLarga(s.f)} · ${esc(EST_PERFILES[s.per] || "")}</small></span></div>`).join("")}</div>` : ""}`;
  else if (tab === "biblio") cuerpo = `<p class="small muted mt">Bibliografía de las guías oficiales de USICAMM 2026-2027. Los enlaces van a la Cámara de Diputados, al Diario Oficial y a la SEP; cuando no hay un enlace oficial estable, el botón busca el título.</p>` +
    Object.entries(EST_AREAS).map(([a, t]) => { const L = EST_DOCS.filter(d => d.a === a); if (!L.length) return ""; return `<h2 class="sec-t">${t}</h2><div class="lista">${L.map(d => { const n = P.filter(q => d.re.test(q.fu || "")).length;
      return `<section class="card" style="padding:12px"><b>${esc(d.t)}</b><p class="small muted">${esc(d.o)}${n ? ` · ${n} preguntas lo citan` : ""}</p><p class="small mt">${esc(d.tip)}</p><div class="fila mt"><a class="btn s" href="${d.u}" target="_blank" rel="noopener">${ic("doc", 14)} ${/google/.test(d.u) ? "Buscar el documento" : "Abrir documento oficial"}</a>${n ? `<button class="btn" data-edoc="${d.id}">Practicar con este documento</button>` : ""}</div></section>`; }).join("")}</div>`; }).join("");
  else if (tab === "ajustes") cuerpo = `<section class="card mt"><label class="rev-chk"><input type="checkbox" id="esOn" ${E.on ? "checked" : ""}> <b>Activar mis preguntas diarias</b></label><p class="small muted">Al iniciar su jornada le aparecen las preguntas; la explicación llega al cerrar la clase. Solo usted las ve y puede desactivarlas cuando quiera. «Estudiar ahora» y «Simulacro» funcionan aunque esto esté apagado.</p></section>
   <section class="card mt"><h3>¿Cuántas preguntas al día?</h3><div class="chips">${[1, 2, 3, 4, 5].map(n => `<button class="chip" data-esn="${n}" aria-pressed="${E.n === n}">${n}</button>`).join("")}</div></section>
   <section class="card mt"><h3>¿Para qué se prepara?</h3><div class="chips">${Object.entries(EST_PERFILES).map(([k, t]) => `<button class="chip" data-esp="${k}" aria-pressed="${E.per === k}">${t}</button>`).join("")}</div></section>
   <section class="card mt"><h3>Temas de las preguntas diarias</h3>${Object.entries(EST_AREAS).map(([k, t]) => `<label class="rev-chk"><input type="checkbox" data-esa="${k}" ${E.areas.includes(k) ? "checked" : ""}> ${t}</label>`).join("")}</section>
   <section class="card mt"><h3>¿A qué hora cierra su clase?</h3><p class="small muted mb">A esa hora se liberan las explicaciones. También se liberan al terminar una sesión en «Dar la clase» o con el botón «Ya terminé mi clase».</p><input type="time" id="esH" value="${estHora()}"></section>
   <section class="card mt"><label class="rev-chk"><input type="checkbox" id="esT" ${E.tlami ? "checked" : ""}> Cuando se acaben las preguntas, que Tlami prepare nuevas automáticamente</label></section>`;
  else if (tab === "guia") cuerpo = `<section class="card mt"><h3>¿Cómo es el instrumento?</h3><p class="small">En los procesos de USICAMM 2026-2027 se aplica el <b>instrumento de apreciación de conocimientos y aptitudes</b>: 90 reactivos de opción múltiple con tres opciones y una sola correcta. La base de cada reactivo contiene todo lo necesario para responder; muchas parten de una situación de aula, de escuela o de la comunidad. En la promoción horizontal vale 30 de 100 puntos (antigüedad 35, actualización 20, formación 15).</p></section>
   <section class="card mt"><h3>Áreas que evalúa (docentes)</h3><p class="small"><b>1. Aspectos normativos:</b> 1.1 principios legales para la educación integral (derechos de la niñez, interés superior, acceso, permanencia, no discriminación); 1.2 bases normativas de la Nueva Escuela Mexicana.<br><b>2. Intervención docente:</b> 2.1 bases para el trabajo con los alumnos (características, contextos, convivencia, ambientes); 2.2 marco curricular de la NEM.<br><b>3. Participación en la escuela y la comunidad:</b> 3.1 trabajo colegiado para la mejora continua; 3.2 trabajo colaborativo con familias y comunidad, entornos seguros e inclusivos.<br>Para dirección y supervisión el área 2 es gestión escolar; para asesoría técnica pedagógica, asesoría y acompañamiento.</p></section>
   <section class="card mt"><h3>Formatos de los reactivos</h3><p class="small"><b>Cuestionamiento directo:</b> una pregunta o una situación con una pregunta.<br><b>Completamiento:</b> un enunciado que termina en «…» y opciones que lo completan.<br><b>Ordenamiento:</b> elementos numerados y opciones como «3, 1, 4, 2».<br><b>Relación de elementos:</b> dos columnas, con un elemento de sobra, y opciones como «1b, 2c, 3a».</p></section>
   <section class="card mt"><h3>Cómo estudiar con esta app</h3><p class="small">1. Active las preguntas diarias: poco a poco, todos los días. 2. Una o dos veces por semana use «Estudiar ahora» con el tema que más le cueste. 3. Cada mes haga un simulacro completo y practique las que falló. 4. Lea en la Biblioteca los documentos que más aparecen en sus errores.</p><p class="small mt"><a href="https://usicamm.sep.gob.mx/" target="_blank" rel="noopener">Sitio oficial de USICAMM</a></p></section>`;
  else cuerpo = `<div class="kpis mt"><div class="kpi"><b>${estRacha()}</b><span>Días seguidos</span></div><div class="kpi"><b>${vistas}</b><span>Vistas de ${P.length}</span></div><div class="kpi"><b>${(() => { const v = porA.reduce((s, x) => s + x.v, 0); return v ? Math.round(100 * porA.reduce((s, x) => s + x.ok, 0) / v) + "%" : "—"; })()}</b><span>Aciertos</span></div><div class="kpi"><b>${fall}</b><span>Por repasar</span></div></div>
   ${!E.on ? `<div class="vacio mt">Las preguntas diarias están apagadas. Actívelas en «Preguntas diarias», o estudie cuando quiera en «Estudiar ahora».</div>` : ""}
   <div class="fila mt"><button class="btn p" data-ir-tab="estudiar">${ic("libro", 15)} Estudiar ahora</button>${fall ? `<button class="btn" id="avF">Repasar las ${Math.min(fall, 20)} que fallé</button>` : ""}<button class="btn s" data-ir-tab="simulacro">Simulacro</button></div>
   <h2 class="sec-t">Por tema<small>Toque un tema para practicarlo</small></h2><section class="card">${porA.map(x => `<button class="it btnit" data-epa-go="${x.a}" style="width:100%;text-align:left"><span class="tx"><b>${EST_AREAS[x.a]}</b><small>${barraA(x)} ${x.v ? Math.round(100 * x.ok / x.v) + "% de " + x.v + " respuestas" : "sin respuestas aún"} · ${x.tot} preguntas</small></span>${ic("sig", 16)}</button>`).join("")}</section>
   <h2 class="sec-t">Días anteriores<small>Toque un día para repasar sus explicaciones</small></h2><div class="lista">${Object.keys(E.dias).sort().reverse().slice(0, 30).map(k => { const d = E.dias[k], ok = d.q.filter(id => d.r[id] === (estQ(id) || {}).k).length;
     return `<button class="it btnit" data-esd="${k}" ${k === hoy() && !estAbierto(d) ? "disabled" : ""}><span class="tx"><b>${fLarga(k)}</b><small>${estContestado(d) ? `${ok} de ${d.q.length} correctas` : "Sin contestar"}${k === hoy() && !estAbierto(d) ? " · explicación al cerrar la clase" : ""}</small></span>${ic("sig", 16)}</button>`; }).join("") || `<div class="vacio">Aún no hay días registrados.</div>`}</div>`;
  return barra("Tlamatini Aula", "Mi actualización profesional") + `<main class="wrap">
  <section class="portada" style="background:radial-gradient(500px 260px at 90% 0,rgba(232,163,61,.35),transparent 70%),linear-gradient(150deg,#294A86,#13244A 70%)"><h1>Aprender un poco cada día</h1>
   <p>Prepárese para USICAMM y actualícese sin sentirlo: preguntas diarias como las del examen, práctica libre por tema, simulacros y la bibliografía oficial a un toque. Artículo 3o, Ley General de Educación, derechos de la niñez, Plan de Estudio 2022, inclusión, convivencia y gestión escolar.</p></section>
  <div class="chips mt">${TABS.map(([k, t]) => `<button class="chip" data-etab="${k}" aria-pressed="${tab === k}">${t}</button>`).join("")}</div>${cuerpo}</main>`; };
ENLAZAR.estudio = () => { const E = ESTD(), o = S.estP;
  $$("[data-etab]").forEach(b => b.onclick = () => { S.etab = b.dataset.etab; re(); }); $$("[data-ir-tab]").forEach(b => b.onclick = () => { S.etab = b.dataset.irTab; re(); });
  /* estudiar */
  $$("[data-epa]").forEach(b => b.onclick = () => { o.a = b.dataset.epa; delete o.doc; re(); }); $$("[data-epn]").forEach(b => b.onclick = () => { o.n = +b.dataset.epn; re(); }); $$("[data-epm]").forEach(b => b.onclick = () => { o.modo = b.dataset.epm; re(); });
  $("#epGo") && ($("#epGo").onclick = () => estPracticar(estElegirPractica(o), o.modo === "falladas" ? "Repaso" : (EST_AREAS[o.a] || "Todos los temas")));
  $$("[data-epa-go]").forEach(b => b.onclick = () => { Object.assign(o, { a: b.dataset.epaGo, modo: "nuevas" }); delete o.doc; estPracticar(estElegirPractica(o), EST_AREAS[o.a]); });
  $("#avF") && ($("#avF").onclick = () => estPracticar(estElegirPractica({ a: "todas", n: 20, modo: "falladas" }), "Las que fallé"));
  $$("[data-edoc]").forEach(b => b.onclick = () => { const d = EST_DOCS.find(x => x.id === b.dataset.edoc); estPracticar(estElegirPractica({ doc: d.id, n: 10 }), d.t.split(" (")[0].slice(0, 40)); });
  $("#esG") && ($("#esG").onclick = async () => { tlamiEspera("Preparando preguntas nuevas al estilo del examen, con su explicación y fundamento."); try { const n = await estTlami(10, o.a && o.a !== "todas" ? [o.a] : null); cerrarDlg(); re(); toast(n ? `Tlami agregó ${n} preguntas nuevas a su banco.` : "Tlami no pudo preparar preguntas esta vez."); } catch (e) { tlamiError(e); } });
  /* simulacro */
  $$("[data-sim]").forEach(b => b.onclick = () => { const go = () => { estArmarSim(+b.dataset.sim); ir("simulacro"); };
    if (E.sim && !E.sim.fin) return dlg(`<h3>Ya tiene un simulacro en curso</h3><p class="mb">Si empieza otro, se descarta el actual.</p><div class="fila fin"><button class="btn" id="sN">Cancelar</button><button class="btn p" id="sS">Empezar otro</button></div>`, v => { v.querySelector("#sN").onclick = cerrarDlg; v.querySelector("#sS").onclick = () => { cerrarDlg(); go(); }; });
    go(); });
  $("#smC") && ($("#smC").onclick = () => ir("simulacro")); $("#smX") && ($("#smX").onclick = () => { delete E.sim; guardar(); re(); });
  /* preguntas diarias */
  $("#esOn") && ($("#esOn").onchange = e => { E.on = e.target.checked; guardar(); toast(E.on ? `<b>Activado.</b> Cada día de clase le esperan ${E.n} ${E.n === 1 ? "pregunta" : "preguntas"} al abrir la app.` : "Preguntas diarias desactivadas."); if (E.on) estRellenar(); });
  $$("[data-esn]").forEach(b => b.onclick = () => { E.n = +b.dataset.esn; const d = E.dias[hoy()]; if (d && !Object.keys(d.r).length) delete E.dias[hoy()]; guardar(); re(); });
  $$("[data-esp]").forEach(b => b.onclick = () => { E.per = b.dataset.esp; guardar(); re(); });
  $$("[data-esa]").forEach(c => c.onchange = () => { const k = c.dataset.esa; E.areas = c.checked ? [...new Set(E.areas.concat(k))] : E.areas.filter(x => x !== k); if (!E.areas.length) { E.areas = [k]; c.checked = true; toast("Deje al menos un tema."); } guardar(); });
  $("#esH") && ($("#esH").onchange = e => { E.hora = e.target.value; guardar(); });
  $("#esT") && ($("#esT").onchange = e => { E.tlami = e.target.checked; guardar(); });
  $$("[data-esd]").forEach(b => b.onclick = () => estExplicar(b.dataset.esd)); };

/* aula.js ya pintó el inicio antes de cargar este archivo: se vuelve a pintar para mostrar la tarjeta y la puerta */
try { if (!S.v || S.v === "inicio") re(); } catch (e) {}
