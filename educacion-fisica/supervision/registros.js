/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Supervisión · Hoja de visita y Registro de incidencias del personal docente de Educación Física.
   · Hoja de visita: escuela, fecha, docente o directivo, tipo de visita (administrativa, pedagógica, deportiva o extra
     clase), objetivo, descripción, recomendaciones y compromisos, manifestaciones del docente y firmas. Se imprime con el
     acomodo del formato de la zona. También se puede hacer desde una visita formativa ya cerrada.
   · Registro de incidencias: datos, indicadores observables por categoría, primera incidencia o reincidencia (la app la
     sugiere con el historial), descripción de los hechos, manifestaciones, acciones e indicaciones, y firmas del docente,
     del supervisor(a) y de dos testigos. Es información delicada: solo vive en este dispositivo y en sus respaldos.
     Nada se borra: un registro equivocado se anula y queda en el historial. */
"use strict";
D.hojas = D.hojas || []; D.incid = D.incid || [];
const HV_TIPOS = ["Administrativa", "Pedagógica", "Deportiva", "Extra clase"];
const IN_CAT = [
  { k: "conducta", n: "Conducta y trato laboral", ind: ["Falta de respeto / trato inapropiado.", "Elevar el tono de voz, gritar o utilizar expresiones intimidatorias.", "Interrumpir reiteradamente o impedir el desarrollo del diálogo/reunión.", "Expresiones ofensivas, descalificaciones o lenguaje inapropiado."] },
  { k: "acuerdos", n: "Cumplimiento de indicaciones y acuerdos", ind: ["No atender una indicación relacionada con el servicio.", "Negativa injustificada a cumplir una instrucción o acuerdo institucional.", "Incumplimiento de acuerdos previamente establecidos.", "Omisión o retraso injustificado en la entrega de información/documentación solicitada."] },
  { k: "funciones", n: "Cumplimiento de funciones y jornada", ind: ["Incumplimiento de actividades inherentes a la función.", "Inasistencia o impuntualidad no justificada.", "Retiro/abandono del centro de trabajo durante la jornada sin autorización correspondiente.", "No informar oportunamente una situación que afecta la prestación del servicio."] },
  { k: "comunicacion", n: "Comunicación y convivencia institucional", ind: ["Conducta que dificulta el trabajo colaborativo o la coordinación institucional.", "Actitud confrontativa durante una reunión o proceso de trabajo.", "Incumplimiento de canales o procedimientos de comunicación establecidos."] }
];
const inIndTxt = key => { const [c, i] = key.split(":"), cat = IN_CAT.find(x => x.k === c); return cat ? cat.ind[+i] : ""; };
const rgMaeOpts = sel => D.maestros.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(m => `<option value="${m.id}" ${m.id === sel ? "selected" : ""}>${esc(m.nombre)}</option>`).join("");
const rgEscOpts = (sel, mId) => { const m = maeDe(mId), L = m && escuelasDe(m).length ? escuelasDe(m) : D.escuelas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")); return L.map(e => `<option value="${e.id}" ${e.id === sel ? "selected" : ""}>${esc(escNom(e))}</option>`).join(""); };
const rgNomMae = x => { const m = maeDe(x.maeId); return x.persona || (m ? m.nombre : "—"); };
const rgNomEsc = x => { const e = escDe(x.escId); return e ? e.nombre : (x.escNombre || ""); };
const chk = on => on ? "☒" : "☐";
const rgEnc = async (titulo, sub) => { const isep = await aDataURL(ISEP).catch(() => "");
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:8px"><tr><td style="width:90px">${isep ? `<img src="${isep}" style="height:54px">` : ""}</td><td style="text-align:center"><b style="font-size:11.5pt">${titulo}</b>${sub ? `<br><span style="font-size:9.5pt">${sub}</span>` : ""}</td><td style="width:90px"></td></tr></table>`; };
const firmaImg = u => u ? `<img src="${u}" style="height:46px;max-width:100%;display:block;margin:0 auto">` : `<div style="height:46px"></div>`;
const rgMesVisitados = mes => { const s = new Set(); D.hojas.filter(h => h.activo !== false && String(h.fecha).slice(0, 7) === mes && h.maeId).forEach(h => s.add(h.maeId));
  D.visitas.filter(v => v.estado === "cerrada" && String(v.fecha).slice(0, 7) === mes && v.maestro && v.maestro.id).forEach(v => s.add(v.maestro.id)); return s; };

/* =================================================================== HOJAS DE VISITA */
VISTAS.hojas = () => { const mes = S.hvM || hoy().slice(0, 7), vis = rgMesVisitados(mes), sin = D.maestros.filter(m => !vis.has(m.id)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const L = D.hojas.filter(h => h.activo !== false).sort((a, b) => (b.fecha + (b.hora || "")).localeCompare(a.fecha + (a.hora || "")));
  const meses = [...new Set([hoy().slice(0, 7), ...L.map(h => h.fecha.slice(0, 7))])].sort().reverse();
  return barra("Supervisión", "Hojas de visita", `<button class="btn s p" id="hvN">${ic("mas", 16)} Nueva</button>`) + `<main class="wrap">
   <p class="muted mt small">Registro de cada visita administrativa, pedagógica, deportiva o extra clase, con firmas. Para revisar planeaciones y evaluación con semáforo use «Iniciar revisión».</p>
   <section class="card mt"><div class="fila" style="justify-content:space-between"><h3>Visitas de ${ciMesNom(mes)}</h3><select id="hvM" style="max-width:150px">${meses.map(k => `<option value="${k}" ${k === mes ? "selected" : ""}>${ciMesNom(k)} ${k.slice(0, 4)}</option>`).join("")}</select></div>
    <p class="mt"><b style="font-size:24px">${vis.size}</b> <span class="muted">de ${D.maestros.length} maestros visitados (hojas y revisiones)</span></p>
    ${sin.length ? `<details class="mt"><summary class="small" style="cursor:pointer;font-weight:700">Sin visita este mes (${sin.length})</summary><p class="small muted mt">${sin.map(m => esc(m.nombre)).join(" · ")}</p></details>` : ""}</section>
   <h2 class="sec-t">Hojas registradas</h2><div class="lista">${L.map(h => `<button class="it btnit" data-hv="${h.id}"><span class="av" style="font-size:11px;line-height:1.1;text-align:center">${dF(h.fecha).getDate()}<br>${MES[dF(h.fecha).getMonth()]}</span><span class="tx"><b>${esc(rgNomMae(h))}</b><small>${esc(rgNomEsc(h))} · ${(h.tipos || []).join(", ") || "Sin tipo"}${h.firmas && h.firmas.doc ? "" : " · <span style='color:var(--rojo)'>falta firma del docente</span>"}</small></span></button>`).join("") || `<div class="vacio">Aún no hay hojas de visita.</div>`}</div>
   <section class="card mt2"><h3>Formato en blanco</h3><p class="small muted mb">Para llenarla a mano cuando no traiga la tableta.</p><button class="btn" id="hvB">${ic("impr", 16)} Imprimir hoja en blanco</button></section>${pie()}</main>`; };
ENLAZAR.hojas = () => { $("#hvN").onclick = () => nuevaHoja(); $("#hvM").onchange = e => { S.hvM = e.target.value; re(); };
  $$("[data-hv]").forEach(b => b.onclick = () => ir("hoja", { id: b.dataset.hv })); $("#hvB").onclick = async () => imprimir(await docHoja({ tipos: [], firmas: {} }, true)); };
function nuevaHoja(base) { const h = Object.assign({ id: uid(), fecha: hoy(), hora: hora(), maeId: "", persona: "", escId: "", tipos: [], objetivo: "", desc: "", recom: "", manif: "", firmas: {}, activo: true, creada: new Date().toISOString() }, base || {});
  D.hojas.push(h); guardar(); ir("hoja", { id: h.id }); }
VISTAS.hoja = () => { const h = D.hojas.find(x => x.id === S.id); if (!h) return VISTAS.hojas();
  const ta = (id, lab, v, ph) => `<label class="campo"><span>${lab}</span><textarea id="${id}" rows="4" placeholder="${ph || ""}">${esc(v || "")}</textarea></label>`;
  return barra("Hoja de visita", fCorta(h.fecha)) + `<main class="wrap">
   <section class="card mt"><h3>Datos</h3>
    <label class="campo"><span>Docente</span><select id="hM"><option value="">— Elija, o escriba abajo si es directivo —</option>${rgMaeOpts(h.maeId)}</select></label>
    <label class="campo"><span>Directivo u otra persona (opcional)</span><input id="hP" value="${esc(h.persona || "")}" placeholder="Nombre y cargo, si no es docente de Educación Física"></label>
    <label class="campo"><span>Escuela</span><select id="hE"><option value="">— Elija —</option>${rgEscOpts(h.escId, h.maeId)}</select></label>
    <div class="dos"><label class="campo"><span>Fecha</span><input type="date" id="hF" value="${h.fecha}"></label><label class="campo"><span>Hora</span><input type="time" id="hH" value="${h.hora || ""}"></label></div>
    <span style="font-size:14px;font-weight:700;color:var(--gris)">Tipo de visita</span><div class="chips mt mb">${HV_TIPOS.map(t => `<button class="chip" data-ht="${t}" aria-pressed="${(h.tipos || []).includes(t)}">${t}</button>`).join("")}</div>
    <label class="campo"><span>Objetivo / motivo de la visita</span><input id="hO" value="${esc(h.objetivo || "")}"></label></section>
   <section class="card mt"><h3>Lo que se observó y acordó</h3>${ta("hD", "Descripción", h.desc, "Qué se observó durante la visita")}${ta("hR", "Recomendaciones, retroalimentación y/o compromisos", h.recom)}${ta("hMa", "Manifestaciones del o la docente", h.manif, "Lo que expresa el docente (opcional)")}</section>
   <section class="card mt"><h3>Firma del docente</h3>${firmaCaja("doc", (h.firmas || {}).doc || "")}</section>
   <section class="card mt"><h3>Firma del supervisor(a)</h3>${firmaCaja("sup", (h.firmas || {}).sup || "", D.yo.firma)}</section>
   <div class="fila mt"><button class="btn p" id="hImp">${ic("impr", 16)} Imprimir o guardar PDF</button><button class="btn r" id="hB" style="margin-left:auto">${ic("basura", 16)} Anular</button></div>${pie()}</main>`; };
ENLAZAR.hoja = () => { const h = D.hojas.find(x => x.id === S.id); if (!h) return; h.firmas = h.firmas || {};
  const g = () => { h.maeId = val("hM"); h.persona = val("hP").trim(); h.escId = val("hE"); h.fecha = val("hF") || h.fecha; h.hora = val("hH"); h.objetivo = val("hO"); h.desc = val("hD"); h.recom = val("hR"); h.manif = val("hMa"); const e = escDe(h.escId); h.escNombre = e ? e.nombre : ""; guardar(); };
  ["hP", "hF", "hH", "hO", "hD", "hR", "hMa"].forEach(id => $("#" + id).addEventListener("input", g)); $("#hE").onchange = g;
  $("#hM").onchange = () => { g(); const m = maeDe(h.maeId); if (m && !h.escId) { const w = new Date().getDay(), mn = ciMinAhora(), x = ciAhora(hoy(), mn).find(y => y.m.id === m.id && y.ahora); h.escId = x ? x.e.id : (escuelasDe(m)[0] || {}).id || ""; } guardar(); re(); };
  $$("[data-ht]").forEach(b => b.onclick = () => { g(); const t = b.dataset.ht; h.tipos = (h.tipos || []).includes(t) ? h.tipos.filter(x => x !== t) : [...(h.tipos || []), t]; guardar(); re(); });
  enlazarFirmas(h.firmas, (k, u) => { g(); if (k === "sup" && u && !D.yo.firma) D.yo.firma = u; guardar(); re(); });
  $("#hImp").onclick = async () => { g(); imprimir(await docHoja(h)); };
  $("#hB").onclick = async () => { if (!(await confirmar("La hoja deja de contar, pero queda guardada como anulada.", "Anular"))) return; h.activo = false; guardar(); history.back(); }; };
async function docHoja(h, blanco) { const td = "border:1px solid #333;padding:6px 8px;vertical-align:top;font-size:10pt", z = D.yo.zona ? " · ZONA ESCOLAR " + esc(D.yo.zona) : "";
  const caja = (lab, txt, alto) => `<p style="margin:0 0 4px"><b>${lab}</b></p><div style="min-height:${alto}px;white-space:pre-wrap;margin-bottom:10px">${esc(txt || "")}</div>`;
  return `<div class="doc" style="font-family:Arial,Helvetica,sans-serif;color:#111">${await rgEnc("HOJA DE VISITA", "SUPERVISIÓN DE EDUCACIÓN FÍSICA" + z)}
   <table style="width:100%;border-collapse:collapse">
    <tr><td style="${td}" colspan="3"><b>Escuela:</b> ${blanco ? "" : esc(rgNomEsc(h))}</td><td style="${td}"><b>Fecha:</b> ${blanco ? "" : fLarga(h.fecha)}${!blanco && h.hora ? " · " + h12(h.hora) : ""}</td></tr>
    <tr><td style="${td}" colspan="4"><b>Docente o directivo:</b> ${blanco ? "" : esc(rgNomMae(h))}</td></tr>
    <tr><td style="${td};text-align:center" colspan="4"><b>Tipo de visita</b></td></tr>
    <tr>${HV_TIPOS.map(t => `<td style="${td};text-align:center"><i><b>${t}</b></i> <span style="font-size:13pt">${chk(!blanco && (h.tipos || []).includes(t))}</span></td>`).join("")}</tr>
    <tr><td style="${td}" colspan="4"><b>Objetivo / motivo de visita:</b> ${blanco ? "" : esc(h.objetivo || "")}</td></tr>
    <tr><td style="${td}" colspan="4">${caja("Descripción:", blanco ? "" : h.desc, 150)}${caja("Recomendaciones, retroalimentación y/o compromisos:", blanco ? "" : h.recom, 110)}${caja("Manifestaciones del o la docente:", blanco ? "" : h.manif, 80)}</td></tr>
    <tr><td style="${td};text-align:center;height:110px" colspan="2">${blanco ? `<div style="height:46px"></div>` : firmaImg((h.firmas || {}).doc)}<div style="border-top:1px solid #333;margin:4px 20px 0;padding-top:4px"><b>Firma del docente</b>${!blanco && rgNomMae(h) !== "—" ? "<br>" + esc(rgNomMae(h)) : ""}</div></td>
     <td style="${td};text-align:center" colspan="2">${blanco ? `<div style="height:46px"></div>` : firmaImg((h.firmas || {}).sup)}<div style="border-top:1px solid #333;margin:4px 20px 0;padding-top:4px"><b>Firma del Supervisor de Educación Física</b><br>${esc(yoNombre())}</div></td></tr>
   </table></div>`; }

/* =================================================================== INCIDENCIAS */
const inActivas = () => D.incid.filter(x => x.activo !== false);
const inClave = y => y.fecha + (y.hora || "") + (y.creada || "");
const inPrevias = x => inActivas().filter(y => y !== x && y.maeId === x.maeId && x.maeId && inClave(y) < inClave(x));
VISTAS.incidencias = () => { const q = nrm(S.inQ || ""), L = inActivas().filter(x => !q || nrm(rgNomMae(x) + " " + rgNomEsc(x)).includes(q)).sort((a, b) => (b.fecha + (b.hora || "")).localeCompare(a.fecha + (a.hora || "")));
  const porM = {}; inActivas().forEach(x => porM[x.maeId] = (porM[x.maeId] || 0) + 1);
  const reinc = Object.entries(porM).filter(([, n]) => n > 1).map(([id, n]) => ({ m: maeDe(id), n })).filter(x => x.m);
  return barra("Supervisión", "Incidencias del personal", `<button class="btn s p" id="inN">${ic("mas", 16)} Registrar</button>`) + `<main class="wrap">
   <div class="aviso mt"><span>${ic("escudo", 18)} Información delicada: solo se guarda en este dispositivo y en sus respaldos. Un registro equivocado se anula, no se borra.</span></div>
   ${reinc.length ? `<section class="card mt"><h3>Con más de una incidencia</h3><p class="small mt">${reinc.map(x => `<b>${esc(x.m.nombre)}</b> (${x.n})`).join(" · ")}</p></section>` : ""}
   <input id="inQ" type="search" placeholder="Buscar maestro o escuela…" value="${esc(S.inQ || "")}" style="width:100%;margin-top:12px">
   <div class="lista mt">${L.map(x => `<button class="it btnit" data-in="${x.id}"><span class="av" style="background:${x.situacion === "reincidencia" ? "var(--rojo-s)" : "var(--maiz-s)"};color:${x.situacion === "reincidencia" ? "var(--rojo)" : "var(--maiz-d)"};font-size:11px;line-height:1.1;text-align:center">${dF(x.fecha).getDate()}<br>${MES[dF(x.fecha).getMonth()]}</span><span class="tx"><b>${esc(rgNomMae(x))}</b><small>${x.situacion === "reincidencia" ? "Reincidencia" : "Primera incidencia"} · ${(x.ind || []).length + (x.otro ? 1 : 0)} indicador${(x.ind || []).length + (x.otro ? 1 : 0) === 1 ? "" : "es"} · ${esc(rgNomEsc(x))}${x.firmas && x.firmas.sup ? "" : " · <span style='color:var(--rojo)'>sin firmar</span>"}</small></span></button>`).join("") || `<div class="vacio">Sin incidencias registradas.</div>`}</div>
   <section class="card mt2"><h3>Formato en blanco</h3><button class="btn" id="inB">${ic("impr", 16)} Imprimir registro en blanco</button></section>${pie()}</main>`; };
ENLAZAR.incidencias = () => { $("#inN").onclick = () => { const x = { id: uid(), maeId: "", escId: "", lugar: "", fecha: hoy(), hora: hora(), ind: [], otro: "", situacion: "primera", desc: "", manif: "", acciones: "", testigos: ["", ""], firmas: {}, activo: true, creada: new Date().toISOString() }; D.incid.push(x); guardar(); ir("incidencia", { id: x.id }); };
  $("#inQ").oninput = e => { S.inQ = e.target.value; const p = e.target.selectionStart; re(); const i = $("#inQ"); i.focus(); i.setSelectionRange(p, p); };
  $$("[data-in]").forEach(b => b.onclick = () => ir("incidencia", { id: b.dataset.in })); $("#inB").onclick = async () => imprimir(await docIncidencia({ ind: [], testigos: ["", ""], firmas: {} }, true)); };
VISTAS.incidencia = () => { const x = D.incid.find(y => y.id === S.id); if (!x) return VISTAS.incidencias(); const prev = inPrevias(x);
  const ta = (id, lab, v, ph) => `<label class="campo"><span>${lab}</span><textarea id="${id}" rows="4" placeholder="${ph || ""}">${esc(v || "")}</textarea></label>`;
  return barra("Registro de incidencias", fCorta(x.fecha)) + `<main class="wrap">
   <section class="card mt"><h3>Datos</h3>
    <label class="campo"><span>Nombre del o la docente</span><select id="iM"><option value="">— Elija —</option>${rgMaeOpts(x.maeId)}</select></label>
    <label class="campo"><span>Centro de trabajo / escuela</span><select id="iE"><option value="">— Elija —</option>${rgEscOpts(x.escId, x.maeId)}</select></label>
    <label class="campo"><span>Lugar</span><input id="iL" value="${esc(x.lugar || "")}" placeholder="Patio, dirección, reunión de zona…"></label>
    <div class="dos"><label class="campo"><span>Fecha</span><input type="date" id="iF" value="${x.fecha}"></label><label class="campo"><span>Hora</span><input type="time" id="iH" value="${x.hora || ""}"></label></div></section>
   <section class="card mt"><h3>Tipo de incidencia / indicadores observables</h3>
    ${IN_CAT.map(c => `<p class="small mt" style="font-weight:800;text-transform:uppercase;letter-spacing:.04em">${c.n}</p>${c.ind.map((t, i) => `<label class="rev-chk"><input type="checkbox" data-ii="${c.k}:${i}" ${(x.ind || []).includes(c.k + ":" + i) ? "checked" : ""}> ${esc(t)}</label>`).join("")}`).join("")}
    <label class="campo mt"><span>Otro</span><input id="iO" value="${esc(x.otro || "")}"></label></section>
   <section class="card mt"><h3>Tipo de situación</h3><div class="chips mt">${[["primera", "Primera incidencia documentada"], ["reincidencia", "Reincidencia"]].map(([k, t]) => `<button class="chip" data-is="${k}" aria-pressed="${x.situacion === k}">${t}</button>`).join("")}</div>
    ${x.maeId ? `<p class="small mt ${prev.length ? "" : "muted"}" style="${prev.length ? "color:var(--rojo)" : ""}">${prev.length ? `Tiene ${prev.length} incidencia${prev.length > 1 ? "s" : ""} registrada${prev.length > 1 ? "s" : ""} antes (${prev.map(p => fCorta(p.fecha)).join(", ")}): corresponde a reincidencia.` : "No tiene incidencias registradas antes."}</p>` : ""}</section>
   <section class="card mt"><h3>Hechos</h3>${ta("iD", "Descripción de los hechos", x.desc, "Qué pasó, con hechos observables, sin juicios")}${ta("iMa", "Manifestaciones del o la docente", x.manif)}${ta("iA", "Acciones realizadas / indicaciones emitidas", x.acciones)}</section>
   <section class="card mt"><h3>Firmas</h3>
    <p class="small" style="font-weight:700">Docente</p>${firmaCaja("doc", (x.firmas || {}).doc || "")}
    <p class="small mt" style="font-weight:700">Supervisor(a)</p>${firmaCaja("sup", (x.firmas || {}).sup || "", D.yo.firma)}
    <div class="dos mt"><label class="campo"><span>Testigo 1</span><input id="iT1" value="${esc((x.testigos || [])[0] || "")}" placeholder="Nombre"></label><label class="campo"><span>Testigo 2</span><input id="iT2" value="${esc((x.testigos || [])[1] || "")}" placeholder="Nombre"></label></div>
    <p class="small" style="font-weight:700">Firma testigo 1</p>${firmaCaja("t1", (x.firmas || {}).t1 || "")}
    <p class="small mt" style="font-weight:700">Firma testigo 2</p>${firmaCaja("t2", (x.firmas || {}).t2 || "")}
    <p class="small muted mt">Si alguien no firma en la tableta, imprima el registro y firme en papel.</p></section>
   <div class="fila mt"><button class="btn p" id="iImp">${ic("impr", 16)} Imprimir o guardar PDF</button><button class="btn r" id="iAn" style="margin-left:auto">Anular</button></div>${pie()}</main>`; };
ENLAZAR.incidencia = () => { const x = D.incid.find(y => y.id === S.id); if (!x) return; x.firmas = x.firmas || {};
  const g = () => { x.maeId = val("iM"); x.escId = val("iE"); x.lugar = val("iL"); x.fecha = val("iF") || x.fecha; x.hora = val("iH"); x.otro = val("iO"); x.desc = val("iD"); x.manif = val("iMa"); x.acciones = val("iA"); x.testigos = [val("iT1"), val("iT2")]; const e = escDe(x.escId); x.escNombre = e ? e.nombre : ""; guardar(); };
  ["iL", "iF", "iH", "iO", "iD", "iMa", "iA", "iT1", "iT2"].forEach(id => $("#" + id).addEventListener("input", g)); $("#iE").onchange = g;
  $("#iM").onchange = () => { g(); const m = maeDe(x.maeId); if (m && !x.escId) x.escId = (escuelasDe(m)[0] || {}).id || ""; x.situacion = inPrevias(x).length ? "reincidencia" : "primera"; guardar(); re(); };
  $$("[data-ii]").forEach(c => c.onchange = () => { g(); const k = c.dataset.ii; x.ind = c.checked ? [...new Set([...(x.ind || []), k])] : (x.ind || []).filter(y => y !== k); guardar(); });
  $$("[data-is]").forEach(b => b.onclick = () => { g(); x.situacion = b.dataset.is; guardar(); re(); });
  enlazarFirmas(x.firmas, (k, u) => { g(); if (k === "sup" && u && !D.yo.firma) D.yo.firma = u; guardar(); re(); });
  $("#iImp").onclick = async () => { g(); if (!(x.ind || []).length && !x.otro) toast("Aún no marca ningún indicador."); imprimir(await docIncidencia(x)); };
  $("#iAn").onclick = () => dlg(`<h3>Anular registro</h3><p class="small muted mb">Deja de contar, pero queda en el historial como anulado.</p><label class="campo"><span>¿Por qué se anula?</span><input id="anM"></label><div class="fila fin"><button class="btn" id="anX">Cancelar</button><button class="btn r" id="anOk">Anular</button></div>`, v => {
    v.querySelector("#anX").onclick = cerrarDlg; v.querySelector("#anOk").onclick = () => { x.activo = false; x.anulado = (val("anM").trim() || "Anulado") + " · " + fCorta(hoy()); guardar(); cerrarDlg(); history.back(); }; }); };
async function docIncidencia(x, blanco) { const td = "border:1px solid #333;padding:5px 7px;vertical-align:top;font-size:9.5pt", z = D.yo.zona ? " ZONA " + esc(D.yo.zona) : "", B = v => blanco ? "" : esc(v || "");
  const linea = (lab, v, alto) => `<p style="margin:8px 0 3px"><b>${lab}</b></p><div style="border-bottom:1px solid #999;min-height:${alto}px;white-space:pre-wrap;font-size:10pt;padding-bottom:3px">${B(v)}</div>`;
  const marcados = blanco ? [] : (x.ind || []).map(inIndTxt).concat(x.otro ? ["Otro: " + x.otro] : []);
  const caja = c => `<td style="${td};width:50%"><b style="font-size:9pt">${c.n.toUpperCase()}</b>${c.ind.map((t, i) => `<div style="margin-top:3px">${chk(!blanco && (x.ind || []).includes(c.k + ":" + i))} ${esc(t)}</div>`).join("")}${c.k === "comunicacion" ? `<div style="margin-top:3px">${chk(!blanco && !!x.otro)} Otro: ${blanco ? "________________" : esc(x.otro || "________________")}</div>` : ""}</td>`;
  const fi = (k, lab) => `<td style="text-align:center;vertical-align:bottom;padding:0 6px">${blanco ? `<div style="height:46px"></div>` : firmaImg((x.firmas || {})[k])}<div style="border-top:1px solid #333;padding-top:3px;font-size:8.5pt">${lab}</div></td>`;
  return `<div class="doc" style="font-family:Arial,Helvetica,sans-serif;color:#111">${await rgEnc("REGISTRO DE INCIDENCIAS DEL PERSONAL DOCENTE EDUCACIÓN FÍSICA" + z)}
   <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
    <tr><td style="${td}" colspan="2"><b>Nombre del o la docente:</b> ${blanco ? "" : esc(rgNomMae(x))}</td></tr>
    <tr><td style="${td}"><b>Centro de trabajo / escuela:</b> ${blanco ? "" : esc(rgNomEsc(x))}</td><td style="${td};width:28%"><b>Hora:</b> ${blanco ? "" : h12(x.hora)}</td></tr>
    <tr><td style="${td}"><b>Lugar:</b> ${B(x.lugar)}</td><td style="${td}"><b>Fecha:</b> ${blanco ? "" : fLarga(x.fecha)}</td></tr></table>
   <p style="margin:8px 0 3px"><b>Tipo de incidencia / indicadores observables:</b></p><div style="font-size:10pt;min-height:20px;border-bottom:1px solid #999">${marcados.map(esc).join("; ")}</div>
   <p style="margin:8px 0"><b>Tipo de situación:</b> &nbsp; ${chk(!blanco && x.situacion !== "reincidencia")} Primera incidencia documentada &nbsp;&nbsp; ${chk(!blanco && x.situacion === "reincidencia")} Reincidencia</p>
   ${linea("Descripción de los hechos:", x.desc, 120)}${linea("Manifestaciones del o la docente:", x.manif, 70)}${linea("Acciones realizadas / indicaciones emitidas:", x.acciones, 70)}
   <table style="width:100%;border-collapse:collapse;margin-top:26px"><tr>${fi("doc", `Nombre y firma del o la docente${blanco ? "" : "<br>" + esc(rgNomMae(x))}`)}${fi("sup", `Nombre y firma del Supervisor<br>${esc(yoNombre())}`)}${fi("t1", `Nombre y firma de testigo${blanco ? "" : "<br>" + esc((x.testigos || [])[0] || "")}`)}${fi("t2", `Nombre y firma de testigo${blanco ? "" : "<br>" + esc((x.testigos || [])[1] || "")}`)}</tr></table>
   <table style="width:100%;border-collapse:collapse;margin-top:16px;page-break-inside:avoid"><tr>${caja(IN_CAT[0])}${caja(IN_CAT[1])}</tr><tr>${caja(IN_CAT[2])}${caja(IN_CAT[3])}</tr></table></div>`; }

/* =================================================================== enganches: inicio e informe */
(function () { const base = VISTAS.inicio; VISTAS.inicio = () => { let h = base(); if (!D.cfg.listo) return h; const mes = hoy().slice(0, 7), n = rgMesVisitados(mes).size, ni = inActivas().length;
  const puertas = `<button class="puerta" data-v="hojas" style="--c:#1B7560;--c-s:#DBEFE8"><span class="ic">${ic("doc")}</span><b>Hojas de visita</b><span>${n} de ${D.maestros.length} maestros visitados en ${ciMesNom(mes)}</span></button>
   <button class="puerta" data-v="incidencias" style="--c:#A3322A;--c-s:#F7DEDA"><span class="ic">${ic("bandera")}</span><b>Incidencias del personal</b><span>${ni ? `${ni} registro${ni > 1 ? "s" : ""}` : "Registro con indicadores y firmas"}</span></button>`;
  return h.replace('<button class="puerta" data-v="historial"', puertas + '<button class="puerta" data-v="historial"'); }; })();
(function () { const base = VISTAS.informe; VISTAS.informe = () => base().replace('<button class="btn" id="iImp">', `<button class="btn" id="iHoja">${ic("doc", 16)} Hoja de visita</button><button class="btn" id="iImp">`);
  const enl = ENLAZAR.informe; ENLAZAR.informe = async () => { const v = visDe(S.id); const b = $("#iHoja"); if (b && v) b.onclick = () => { const ya = D.hojas.find(h => h.visita === v.id && h.activo !== false); if (ya) return ir("hoja", { id: ya.id });
    nuevaHoja({ visita: v.id, fecha: v.fecha, hora: v.ini || "", maeId: v.maestro.id, escId: v.escuela.id, tipos: ["Pedagógica"], objetivo: v.prop || v.tipo || "", recom: (v.cierre && (v.cierre.acuerdos || v.cierre.recom)) || "", firmas: { sup: (v.firmas || {}).sup || "" } }); };
    return enl(); }; })();
if (typeof S !== "undefined" && S.v === "inicio") pintar();
