/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · IMPRIMIR O DESCARGAR CLASES.
   El maestro elige qué clases quiere (hoy, mañana, la semana, unas fechas; una escuela, unos grupos o una hora)
   y las imprime o las descarga en PDF o Word: una hoja por clase con todo el desarrollo, o un resumen por día. */
"use strict";
(function () {
  const J = k => JUEGOS[k] || { n: k, reglas: [] };
  const sumar = (k, n) => { const d = dF(k); d.setDate(d.getDate() + n); return iso(d); };
  const lunes = k => { const d = dF(k), w = d.getDay() || 7; d.setDate(d.getDate() - w + 1); return iso(d); };
  const horaDe = g => String(g.horario || g.hora || "").trim();
  const minutos = h => { const m = String(h).match(/(\d{1,2})[:.](\d{2})/); if (!m) return 9999; let x = +m[1]; if (x < 6) x += 12; return x * 60 + +m[2]; };
  const material = s => { const ks = [s.act, ...(s.ppal || []), s.calma, s.planB].filter(Boolean), M = new Set(); ks.forEach(k => (J(k).mat || []).forEach(m => M.add(m)));
    return [...M].map(m => (EF_MAT.find(x => x[0] === m) || [m, m])[1]); };
  const corta = n => String(n || "").replace(/^\s*(esc(uela)?\.?\s*)?(prim(aria)?\.?\s*)?/i, "").replace(/\s*\(.*\)$/, "").split(" ").slice(0, 3).join(" ");
  const reglas = k => (J(k).reglas || []).join(" ");

  function rango(Q) { const k = hoy();
    if (Q.per === "hoy") return [k, k];
    if (Q.per === "man") { let m = sumar(k, 1); while ([0, 6].includes(dF(m).getDay())) m = sumar(m, 1); return [m, m]; }
    if (Q.per === "sem") { const l = lunes(k); return [l, sumar(l, 4)]; }
    if (Q.per === "prox") { const l = sumar(lunes(k), 7); return [l, sumar(l, 4)]; }
    const a = Q.desde || k, b = Q.hasta && Q.hasta >= a ? Q.hasta : a; return [a, b]; }
  const ordenar = L => L.sort((a, b) => a.f.localeCompare(b.f) || minutos(horaDe(a.g)) - minutos(horaDe(b.g)) || ((escDe(a.g.escId) || {}).nombre || "").localeCompare((escDe(b.g.escId) || {}).nombre || "") || a.g.grado - b.g.grado);

  /* ---------- los documentos ---------- */
  function inclusionDe(p, g) { const ids = new Set((g.alumnos || []).map(a => a.id));
    const L = (p.inclusion || []).filter(x => ids.has(x.alId)).map(x => { const a = alDe(x.alId); return { n: a ? (p.incIni !== false ? iniN(a.nombre) : a.nombre) : "—", nee: x.nee || "", aj: [x.ajuste, x.desc].filter(Boolean).join(": ") }; });
    if (L.length) return L;
    return (g.alumnos || []).filter(a => a.nee && !a.baja).map(a => ({ n: iniN(a.nombre), nee: [a.nee.tipo, a.nee.desc].filter(Boolean).join(": "), aj: a.nee.apoyo || "" })); }
  function hojaClase(x, i) { const { g, p, s, f, n } = x, e = escDe(g.escId), d = dF(f), inc = inclusionDe(p, g), mat = material(s);
    return `<div class="doc ${i ? "salto" : ""}">${encabezado(e, "Sesión de Educación Física")}
    <div class="datos"><span><b>Fecha:</b> ${DSEM_L[d.getDay()]} ${fLarga(f)}</span><span><b>Grupo:</b> ${grNom(g)}</span><span><b>Horario:</b> ${esc(horaDe(g) || "—")}</span>
    <span><b>Docente de E. F.:</b> ${esc(docNombre())}</span><span><b>Docente del grupo:</b> ${esc(g.docente || "—")}</span><span><b>Sesión:</b> ${n} de ${p.sesiones.length} · ${p.min} min</span></div>
    <table><tbody><tr><th style="width:20%">Planeación</th><td>${esc(p.titulo)}</td></tr><tr><th>Contenido</th><td>${esc(p.cont)}</td></tr>${p.pdas && p.pdas[g.grado] ? `<tr><th>PDA ${g.grado}.°</th><td>${esc(p.pdas[g.grado])}</td></tr>` : ""}
     <tr><th>Sesión</th><td><b>${esc(s.t)}</b>${s.est ? ` (${esc(s.est)})` : ""}. ${esc(s.para || "")}</td></tr></tbody></table>
    <h2>Desarrollo de la sesión</h2><table><thead><tr><th style="width:17%">Momento</th><th>Actividades</th></tr></thead><tbody>
     <tr><td><b>Inicio</b></td><td>${esc(s.charla || "")}${s.act ? `<br><b>Activación: ${esc(J(s.act).n)}</b>${J(s.act).min ? ` (${J(s.act).min} min)` : ""}. ${esc(reglas(s.act))}` : ""}</td></tr>
     <tr><td><b>Desarrollo</b></td><td>${(s.ppal || []).map(k => `<b>${esc(J(k).n)}</b>${J(k).min ? ` (${J(k).min} min)` : ""}. ${esc(reglas(k))}`).join("<br>")}${s.mg ? `<br><i>${Object.entries(s.mg).map(([k, v]) => `Fase ${esc(k)}: ${esc(v)}`).join(" · ")}</i>` : ""}</td></tr>
     <tr><td><b>Cierre</b></td><td>${s.calma ? `<b>Vuelta a la calma: ${esc(J(s.calma).n)}</b>. ${esc(reglas(s.calma))}<br>` : ""}${(s.cierre || []).map(esc).join(" ")}</td></tr>
     <tr><td><b>Evaluación</b></td><td>${esc(s.eval || "")}</td></tr>
     ${s.planB ? `<tr><td><b>Plan B</b></td><td>Si llueve o hace mucho calor: <b>${esc(J(s.planB).n)}</b> (bajo techo o a la sombra). ${esc(reglas(s.planB))}</td></tr>` : ""}
     <tr><td><b>Material</b></td><td>${mat.length ? esc(mat.join(", ")) : "Sin material"}</td></tr></tbody></table>
    ${inc.length ? `<h2>Atención a la diversidad</h2><table><thead><tr><th>Alumno(a)</th><th>Necesidad o situación</th><th>Ajuste en la sesión</th></tr></thead><tbody>${inc.map(a => `<tr><td>${esc(a.n)}</td><td>${esc(a.nee)}</td><td>${esc(a.aj)}</td></tr>`).join("")}</tbody></table>` : ""}
    <h2>Observaciones</h2><table><tbody>${[1, 2, 3, 4].map(() => `<tr><td style="height:26px"></td></tr>`).join("")}</tbody></table></div>`; }
  function resumenDia(f, L, i) { const d = dF(f), escs = [...new Set(L.map(x => x.g.escId))].map(escDe), e = escs.length === 1 ? escs[0] : null;
    return `<div class="doc ${i ? "salto" : ""}">${encabezado(e, "Clases de Educación Física del día")}
    <div class="datos"><span><b>Fecha:</b> ${DSEM_L[d.getDay()]} ${fLarga(f)}</span><span><b>Docente de E. F.:</b> ${esc(docNombre())}</span><span><b>Clases:</b> ${L.length}</span></div>
    <table><thead><tr><th>Hora</th>${e ? "" : "<th>Escuela</th>"}<th>Grupo</th><th>Sesión</th><th>Activación · Juegos · Calma</th><th>Material</th><th>Qué evaluar</th><th class="c">✓</th></tr></thead><tbody>
    ${L.map(x => `<tr><td>${esc(horaDe(x.g) || "")}</td>${e ? "" : `<td>${esc((escDe(x.g.escId) || {}).nombre || "")}</td>`}<td>${x.g.grado}° ${esc(x.g.grupo || "")}</td><td><b>${x.n}. ${esc(x.s.t)}</b><br>${esc(x.p.titulo)}</td>
     <td>${[x.s.act && J(x.s.act).n, ...(x.s.ppal || []).map(k => "<b>" + esc(J(k).n) + "</b>"), x.s.calma && J(x.s.calma).n].filter(Boolean).map(t => t.startsWith("<b>") ? t : esc(t)).join(" · ")}</td><td>${esc(material(x.s).join(", "))}</td><td>${esc(x.s.eval || "")}</td><td></td></tr>`).join("")}</tbody></table></div>`; }
  function docClases(L, modo) { if (modo === "resumen") { const dias = [...new Set(L.map(x => x.f))]; return dias.map((f, i) => resumenDia(f, L.filter(x => x.f === f), i)).join(""); }
    return L.map(hojaClase).join(""); }

  /* ---------- el cuadro para elegir ---------- */
  function dlgImprimirClases(fijas, titulo) { const Q = { per: "hoy", desde: hoy(), hasta: hoy(), esc: "", gs: new Set(), hs: new Set(), modo: "completa" };
    const elegidas = () => { if (fijas) return fijas; const [a, b] = rango(Q);
      let L = agendaDe(a, b).filter(x => !(typeof evSinClase === "function" && evSinClase(x.g.escId, x.f)));
      if (Q.esc) L = L.filter(x => x.g.escId === Q.esc); const base = L;
      if (Q.gs.size) L = L.filter(x => Q.gs.has(x.g.id)); if (Q.hs.size) L = L.filter(x => Q.hs.has(horaDe(x.g) || "Sin hora"));
      return { L: ordenar(L), base }; };
    const nombre = () => { if (fijas) return `clase-ef-${fijas[0].f}`; const [a, b] = rango(Q); return `clases-ef-${a}${b !== a ? "-al-" + b : ""}`; };
    const pinta = () => { const r = fijas ? { L: fijas, base: fijas } : elegidas(), L = r.L, base = r.base;
      const gsB = [...new Map(base.map(x => [x.g.id, x.g])).values()].sort((a, b) => ((escDe(a.escId) || {}).nombre || "").localeCompare((escDe(b.escId) || {}).nombre || "") || a.grado - b.grado || String(a.grupo).localeCompare(b.grupo));
      const hsB = [...new Set(base.map(x => horaDe(x.g) || "Sin hora"))].sort((a, b) => minutos(a) - minutos(b));
      const chip = (attr, v, on, t) => `<button class="chip" ${attr}="${esc(v)}" aria-pressed="${on}">${t}</button>`;
      dlg(`<h3>${titulo || "Imprimir o descargar clases"}</h3>
       ${fijas ? `<p class="small muted mb">${fijas.map(x => `${grNom(x.g)} · ${fCorta(x.f)}`).join(" · ")}</p>` : `
       <p class="small muted mb">¿Qué clases quiere?</p><div class="chips mb">${[["hoy", "Hoy"], ["man", "Mañana"], ["sem", "Esta semana"], ["prox", "Próxima semana"], ["fec", "Elegir fechas"]].map(([k, t]) => chip("data-qp", k, Q.per === k, t)).join("")}</div>
       ${Q.per === "fec" ? `<div class="dos"><label class="campo"><span>Desde</span><input type="date" id="qD" value="${Q.desde}"></label><label class="campo"><span>Hasta</span><input type="date" id="qH" value="${Q.hasta}"></label></div>` : ""}
       ${D.escuelas.length > 1 ? `<label class="campo"><span>Escuela</span><select id="qE"><option value="">Todas</option>${D.escuelas.map(e => `<option value="${e.id}" ${Q.esc === e.id ? "selected" : ""}>${esc(e.nombre)}</option>`).join("")}</select></label>` : ""}
       ${gsB.length > 1 ? `<p class="small muted">Grupos <span class="muted">(sin marcar = todos)</span></p><div class="chips mb">${gsB.map(g => chip("data-qg", g.id, Q.gs.has(g.id), (D.escuelas.length > 1 && !Q.esc ? esc(corta((escDe(g.escId) || {}).nombre)) + " · " : "") + g.grado + "° " + esc(g.grupo || ""))).join("")}</div>` : ""}
       ${hsB.length > 1 ? `<p class="small muted">Hora <span class="muted">(sin marcar = todas)</span></p><div class="chips mb">${hsB.map(h => chip("data-qh", h, Q.hs.has(h), esc(h))).join("")}</div>` : ""}`}
       <p class="small muted">Formato</p><div class="chips mb">${chip("data-qm", "completa", Q.modo === "completa", "Una hoja por clase, completa")}${chip("data-qm", "resumen", Q.modo === "resumen", "Resumen del día en una tabla")}</div>
       <div class="aviso ${L.length ? "" : "r"}" style="margin:0 0 12px">${L.length ? `<b>${L.length} ${L.length === 1 ? "clase" : "clases"}</b>${Q.modo === "completa" ? ` · ${L.length} ${L.length === 1 ? "hoja" : "hojas"}` : ""}` : "No hay clases planeadas con esos datos. Revise que sus grupos tengan planeación y días de clase."}</div>
       <div class="fila fin"><button class="btn" id="qX">Cerrar</button><button class="btn" id="qW" ${L.length ? "" : "disabled"}>${ic("bajar", 16)} Word</button><button class="btn" id="qP" ${L.length ? "" : "disabled"}>${ic("bajar", 16)} PDF</button><button class="btn p" id="qI" ${L.length ? "" : "disabled"}>${ic("impr", 18)} Imprimir</button></div>`, v => {
        const q = s => v.querySelector(s), qa = s => v.querySelectorAll(s);
        q("#qX").onclick = cerrarDlg;
        qa("[data-qp]").forEach(b => b.onclick = () => { Q.per = b.dataset.qp; Q.gs.clear(); Q.hs.clear(); pinta(); });
        qa("[data-qm]").forEach(b => b.onclick = () => { Q.modo = b.dataset.qm; pinta(); });
        qa("[data-qg]").forEach(b => b.onclick = () => { const k = b.dataset.qg; Q.gs.has(k) ? Q.gs.delete(k) : Q.gs.add(k); pinta(); });
        qa("[data-qh]").forEach(b => b.onclick = () => { const k = b.dataset.qh; Q.hs.has(k) ? Q.hs.delete(k) : Q.hs.add(k); pinta(); });
        q("#qE") && (q("#qE").onchange = ev => { Q.esc = ev.target.value; Q.gs.clear(); Q.hs.clear(); pinta(); });
        q("#qD") && (q("#qD").onchange = ev => { Q.desde = ev.target.value; if (Q.hasta < Q.desde) Q.hasta = Q.desde; pinta(); });
        q("#qH") && (q("#qH").onchange = ev => { Q.hasta = ev.target.value; pinta(); });
        const html = () => docClases(L, Q.modo);
        q("#qI").onclick = () => { cerrarDlg(); imprimir(html()); };
        q("#qW").onclick = () => { wordDescargar(html(), nombre() + ".doc"); };
        q("#qP").onclick = async ev => { const b = ev.currentTarget; b.disabled = true; b.textContent = "Generando…";
          try { await pdfDescargar(html(), nombre() + ".pdf"); cerrarDlg(); } catch (e) { cerrarDlg(); toast("Sin internet no se puede generar el PDF: en la ventana de impresión elija «Guardar como PDF»."); imprimir(html()); } }; }); };
    pinta(); }
  window.dlgImprimirClases = dlgImprimirClases;

  /* ---------- dónde aparece ---------- */
  const vIni = VISTAS.inicio, eIni = ENLAZAR.inicio;
  VISTAS.inicio = () => vIni().replace('<button class="btn sec" id="bPlanN">', `<button class="btn sec" id="bImpC">${ic("impr")} Imprimir clases</button><button class="btn sec" id="bPlanN">`);
  ENLAZAR.inicio = () => { eIni(); $("#bImpC") && ($("#bImpC").onclick = () => dlgImprimirClases()); };
  const vAg = VISTAS.agenda, eAg = ENLAZAR.agenda;
  VISTAS.agenda = () => vAg().replace('<button class="btn m" id="bEvN">', `<button class="btn s" id="bImpA" aria-label="Imprimir clases">${ic("impr", 18)}</button><button class="btn m" id="bEvN">`);
  ENLAZAR.agenda = () => { eAg(); $("#bImpA") && ($("#bImpA").onclick = () => dlgImprimirClases()); };
  const sHTML = sesionHTML;
  sesionHTML = function (p, s, i, f, dada) { return sHTML(p, s, i, f, dada).replace(`<button class="btn s" data-es="${s.id}">`, `<button class="btn s" data-imps="${s.id}">${ic("impr", 16)} Imprimir</button><button class="btn s" data-es="${s.id}">`); };
  const ePlan = ENLAZAR.plan;
  ENLAZAR.plan = () => { ePlan(); const p = plDe(S.id); if (!p) return;
    $$("[data-imps]").forEach(b => b.onclick = () => { const i = p.sesiones.findIndex(x => x.id === b.dataset.imps), s = p.sesiones[i];
      const L = p.grupos.map(grDe).filter(Boolean).map(g => ({ g, p, s, n: i + 1, f: fechasPlan(g, p)[i] || p.ini }));
      dlgImprimirClases(ordenar(L), `Imprimir la sesión ${i + 1}: ${esc(s.t)}`); }); };
})();
