/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Supervisión · Control de permisos económicos de los maestros de Educación Física.
   Misma regla que Tequio: la norma permite hasta 3 permisos de hasta 3 días al año (9 días); la cuenta es por año
   calendario. Las facilidades (salir temprano, llegar tarde, ausentarse unas horas) se anotan por horas y solo descuentan
   de los 9 días si así se indica. Los permisos que van al expediente físico: máximo 3 al año por maestro.
   Nada se borra: un registro equivocado se anula y queda en el historial. Todo se guarda en el dispositivo. */
"use strict";
const PE_LIM = 9, PE_DIAS = 3, PE_NUM = 3, PE_EXP = 3;
const PE_SUB = ["Salir temprano", "Llegar más tarde", "Ausentarse unas horas", "Atender un asunto personal", "Otra"];
D.permisos = D.permisos || [];
const peFmt = n => (Math.round(n * 2) / 2).toString().replace(".5", "½").replace(/^0½$/, "½");
const peDias = n => peFmt(n) + (n === 1 ? " día" : " días"), peHoras = n => peFmt(n) + (n === 1 ? " hora" : " horas");
const peAnio = () => S.peA || hoy().slice(0, 4);
const peActivos = () => (D.permisos || []).filter(p => p.activo !== false);
const peDe = (mId, anio) => peActivos().filter(p => p.maeId === mId && String(p.inicio).slice(0, 4) === anio);
function peHabiles(a, b) { if (!a || !b || b < a) return 0; let n = 0; const d = dF(a), fin = dF(b);
  for (let i = 0; i < 400 && d <= fin; i++) { const w = d.getDay(); if (w && w !== 6) n++; d.setDate(d.getDate() + 1); } return n; }
function peSaldo(mId, anio) { const L = peDe(mId, anio), per = L.filter(p => p.clase === "permiso"), fac = L.filter(p => p.clase === "facilidad");
  const usados = L.reduce((t, p) => t + (p.descuenta ? +p.dias || 0 : 0), 0);
  return { L, usados, quedan: Math.max(0, PE_LIM - usados), nPer: per.length, nExp: per.filter(p => p.expediente).length, horas: fac.reduce((t, p) => t + (+p.horas || 0), 0), nFac: fac.length }; }
const peColor = u => u >= PE_LIM ? "var(--rojo)" : u >= 6 ? "#C98A0B" : "var(--jade)";
function peBarra(u) { const w = Math.min(100, u / PE_LIM * 100); return `<div style="height:8px;border-radius:99px;background:var(--hilo2);overflow:hidden;margin-top:6px"><i style="display:block;height:100%;width:${w}%;background:${peColor(u)}"></i></div>`; }
const peEscTxt = p => { const e = escDe(p.escId); return e ? escNom(e) : (p.escNombre || ""); };
const peFechas = p => p.clase === "facilidad" || p.inicio === p.fin ? fCorta(p.inicio) : `${fCorta(p.inicio)} al ${fCorta(p.fin)}`;
const peQue = p => p.clase === "facilidad" ? `${esc(p.subtipo || "Facilidad")} · ${peHoras(+p.horas || 0)}${p.descuenta ? ` · descuenta ${peDias(+p.dias || 0)}` : ""}` : `Permiso económico · ${peDias(+p.dias || 0)}${p.expediente ? " · al expediente" : ""}`;

VISTAS.permisos = () => { const a = peAnio(), q = nrm(S.peQ || ""), anios = [...new Set([hoy().slice(0, 4), ...peActivos().map(p => String(p.inicio).slice(0, 4))])].sort().reverse();
  const L = D.maestros.filter(m => !q || nrm(m.nombre + " " + escuelasDe(m).map(e => e.nombre).join(" ")).includes(q)).map(m => ({ m, s: peSaldo(m.id, a) }))
    .sort((x, y) => (S.peOrd === "nom" ? 0 : y.s.usados - x.s.usados) || x.m.nombre.localeCompare(y.m.nombre, "es"));
  const tot = D.maestros.map(m => peSaldo(m.id, a)), agot = tot.filter(s => s.usados >= PE_LIM).length, cerca = tot.filter(s => s.usados >= 6 && s.usados < PE_LIM).length;
  return barra("Supervisión", "Permisos económicos", `<button class="btn s p" id="peN">${ic("mas", 16)} Registrar</button>`) + `<main class="wrap">
  <p class="muted mt small">La norma permite autorizar hasta ${PE_NUM} permisos de hasta ${PE_DIAS} días al año (${PE_LIM} días por año calendario). Las facilidades por horas solo descuentan si usted lo indica. Un registro equivocado se anula, no se borra.</p>
  <div class="chips mt">${anios.map(x => `<button class="chip" data-pa="${x}" aria-pressed="${x === a}">${x}</button>`).join("")}<button class="chip" data-po="${S.peOrd === "nom" ? "uso" : "nom"}">${S.peOrd === "nom" ? "Ordenar por días usados" : "Ordenar por nombre"}</button></div>
  ${agot || cerca ? `<div class="aviso mt" style="background:var(--rojo-s);border-color:#E8C3BE"><span>${agot ? `<b>${agot} maestro${agot > 1 ? "s" : ""} ya usó sus ${PE_LIM} días.</b> ` : ""}${cerca ? `${cerca} está${cerca > 1 ? "n" : ""} por agotarlos (6 días o más).` : ""}</span></div>` : ""}
  <input id="peQ" type="search" placeholder="Buscar maestro o escuela…" value="${esc(S.peQ || "")}" style="width:100%;margin-top:12px">
  <div class="lista mt">${L.map(({ m, s }) => `<button class="it btnit" data-pm="${m.id}"><span class="av" style="background:${s.usados ? "var(--maiz-s)" : "var(--hilo2)"};color:${peColor(s.usados)};font-weight:800">${peFmt(s.usados)}</span><span class="tx" style="flex:1"><b>${esc(m.nombre)}</b><small>${escuelasDe(m).map(e => esc(escNom(e))).join(", ") || "Sin escuela"}<br>${peDias(s.usados)} de ${PE_LIM} · quedan ${peDias(s.quedan)} · ${s.nPer} permiso${s.nPer === 1 ? "" : "s"}${s.nFac ? ` · ${s.nFac} facilidad${s.nFac === 1 ? "" : "es"} (${peHoras(s.horas)})` : ""}</small>${peBarra(s.usados)}</span></button>`).join("") || `<div class="vacio">${D.maestros.length ? "Nadie coincide con la búsqueda." : "Primero registre a sus maestros en «Escuelas y maestros»."}</div>`}</div>
  <section class="card mt2"><h3>Reporte</h3><p class="small muted mb">Concentrado del año ${a} por maestro, con el detalle de cada permiso.</p>
   <div class="fila"><button class="btn" id="peImp">${ic("impr", 16)} Imprimir o guardar PDF</button><button class="btn" id="peCsv">${ic("bajar", 16)} Descargar para Excel</button></div></section>${pie()}</main>`; };
ENLAZAR.permisos = () => { $("#peN").onclick = () => formPermiso(null);
  $$("[data-pa]").forEach(b => b.onclick = () => { S.peA = b.dataset.pa; re(); }); $$("[data-po]").forEach(b => b.onclick = () => { S.peOrd = b.dataset.po; re(); });
  $("#peQ").oninput = e => { S.peQ = e.target.value; const p = e.target.selectionStart; re(); const i = $("#peQ"); i.focus(); i.setSelectionRange(p, p); };
  $$("[data-pm]").forEach(b => b.onclick = () => ir("permisoMae", { id: b.dataset.pm, peA: peAnio() }));
  $("#peImp").onclick = async () => imprimir(await docPermisos(peAnio())); $("#peCsv").onclick = () => csvPermisos(peAnio()); };

VISTAS.permisoMae = () => { const m = maeDe(S.id); if (!m) return VISTAS.permisos(); const a = peAnio(), s = peSaldo(m.id, a);
  const anul = (D.permisos || []).filter(p => p.maeId === m.id && p.activo === false && String(p.inicio).slice(0, 4) === a);
  return barra("Permisos económicos", esc(m.nombre), `<button class="btn s p" id="peN">${ic("mas", 16)} Registrar</button>`) + `<main class="wrap">
  <section class="card mt"><p class="small muted">${escuelasDe(m).map(e => esc(escNom(e))).join(", ")} · año ${a}</p>
   <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;text-align:center">
    <div><b style="font-size:28px;color:${peColor(s.usados)}">${peFmt(s.usados)}</b><div class="small muted">días usados</div></div>
    <div><b style="font-size:28px">${peFmt(s.quedan)}</b><div class="small muted">quedan de ${PE_LIM}</div></div>
    <div><b style="font-size:28px">${s.nPer}</b><div class="small muted">permisos${s.nExp ? ` (${s.nExp} al expediente)` : ""}</div></div></div>${peBarra(s.usados)}
   ${s.nPer > PE_NUM ? `<p class="small mt" style="color:var(--rojo)">Lleva más de ${PE_NUM} permisos en el año: la norma permite ${PE_NUM}.</p>` : ""}</section>
  <h2 class="sec-t">Registros ${a}</h2><div class="lista">${s.L.slice().sort((x, y) => y.inicio.localeCompare(x.inicio)).map(p => `<button class="it btnit" data-pe="${p.id}"><span class="av" style="background:${p.clase === "facilidad" ? "var(--anil-s)" : "var(--maiz-s)"};color:${p.clase === "facilidad" ? "var(--anil)" : "var(--maiz-d)"};font-size:12px">${dF(p.inicio).getDate()}/${dF(p.inicio).getMonth() + 1}</span><span class="tx"><b>${peQue(p)}</b><small>${peFechas(p)}${peEscTxt(p) ? " · " + esc(peEscTxt(p)) : ""}${p.motivo ? " · " + esc(p.motivo) : ""}</small></span></button>`).join("") || `<div class="vacio">Sin permisos en ${a}.</div>`}</div>
  ${anul.length ? `<details class="mt"><summary class="muted" style="cursor:pointer;font-weight:700">Anulados (${anul.length})</summary><div class="lista mt">${anul.map(p => `<div class="it"><span class="tx"><b style="text-decoration:line-through">${peQue(p)}</b><small>${peFechas(p)} · ${esc(p.anulado || "")}</small></span></div>`).join("")}</div></details>` : ""}${pie()}</main>`; };
ENLAZAR.permisoMae = () => { $("#peN").onclick = () => formPermiso(null, S.id); $$("[data-pe]").forEach(b => b.onclick = () => formPermiso((D.permisos || []).find(p => p.id === b.dataset.pe))); };

function formPermiso(p, maeId) { const n = !p; p = p || { id: uid(), clase: "permiso", maeId: maeId || "", inicio: hoy(), fin: hoy(), dias: 1, horas: 1, descuenta: true, subtipo: PE_SUB[0], expediente: false, motivo: "", obs: "" };
  const opM = D.maestros.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(m => `<option value="${m.id}" ${m.id === p.maeId ? "selected" : ""}>${esc(m.nombre)}</option>`).join("");
  dlg(`<h3>${n ? "Registrar permiso" : "Permiso registrado"}</h3>
   <label class="campo"><span>Maestro(a)</span><select id="pM"><option value="">— Elija —</option>${opM}</select></label>
   <label class="campo"><span>Escuela</span><select id="pE"></select></label>
   <div class="chips mb"><button class="chip" data-pc="permiso" aria-pressed="${p.clase === "permiso"}">Permiso económico (días)</button><button class="chip" data-pc="facilidad" aria-pressed="${p.clase === "facilidad"}">Facilidad (horas)</button></div>
   <div id="pBox"></div>
   <label class="campo"><span>Motivo (opcional)</span><input id="pMo" value="${esc(p.motivo || "")}" placeholder="Asunto particular, trámite, cita…"></label>
   <label class="campo"><span>Observación (opcional)</span><textarea id="pOb">${esc(p.obs || "")}</textarea></label>
   <p class="small" id="pAv" style="min-height:1em"></p>
   <div class="fila fin">${n ? "" : `<button class="btn r" id="pAn" style="margin-right:auto">Anular</button>`}<button class="btn" id="pX">Cancelar</button><button class="btn p" id="pOk">Guardar</button></div>`, w => {
    let clase = p.clase; const q = s => w.querySelector(s);
    const escs = () => { const m = maeDe(q("#pM").value), L = m ? escuelasDe(m) : []; q("#pE").innerHTML = L.map(e => `<option value="${e.id}" ${e.id === p.escId ? "selected" : ""}>${esc(escNom(e))}</option>`).join("") || `<option value="">—</option>`; };
    const caja = () => { q("#pBox").innerHTML = clase === "permiso" ? `
      <div class="dos"><label class="campo"><span>Desde</span><input type="date" id="pI" value="${p.inicio}"></label><label class="campo"><span>Hasta</span><input type="date" id="pF" value="${p.fin || p.inicio}"></label></div>
      <label class="campo"><span>Días que descuenta</span><input type="number" id="pD" min="0.5" max="30" step="0.5" value="${p.clase === "permiso" ? p.dias : 1}"><small>Se calcula con los días hábiles; puede poner medio día (0.5).</small></label>
      <label class="rev-chk"><input type="checkbox" id="pX2" ${p.expediente ? "checked" : ""}> Va al expediente físico (máximo ${PE_EXP} al año)</label>`
      : `<div class="dos"><label class="campo"><span>Fecha</span><input type="date" id="pI" value="${p.inicio}"></label><label class="campo"><span>Horas</span><input type="number" id="pH" min="0.5" max="12" step="0.5" value="${p.horas || 1}"></label></div>
      <label class="campo"><span>Tipo</span><select id="pS">${PE_SUB.map(x => `<option ${x === p.subtipo ? "selected" : ""}>${x}</option>`).join("")}</select></label>
      <label class="rev-chk"><input type="checkbox" id="pDe" ${p.clase === "facilidad" && p.descuenta ? "checked" : ""}> Descuenta de los ${PE_LIM} días</label>
      <label class="campo" id="pDw" style="${p.clase === "facilidad" && p.descuenta ? "" : "display:none"}"><span>Días que descuenta</span><input type="number" id="pD" min="0.5" max="3" step="0.5" value="${p.clase === "facilidad" ? (p.dias || 0.5) : 0.5}"></label>`;
      const I = q("#pI"), F = q("#pF"), Dd = q("#pD");
      if (F) { const calc = () => { if (F.value < I.value) F.value = I.value; Dd.value = peHabiles(I.value, F.value) || 1; aviso(); }; I.onchange = calc; F.onchange = calc; }
      if (q("#pDe")) q("#pDe").onchange = e => { q("#pDw").style.display = e.target.checked ? "" : "none"; aviso(); };
      w.querySelectorAll("#pBox input").forEach(x => x.addEventListener("input", aviso)); aviso(); };
    const leer = () => { const desc = clase === "permiso" ? true : !!(q("#pDe") && q("#pDe").checked);
      return { maeId: q("#pM").value, escId: q("#pE").value, clase, inicio: q("#pI").value, fin: clase === "permiso" ? q("#pF").value : q("#pI").value,
        dias: desc ? Math.max(0, +(q("#pD") || {}).value || 0) : 0, horas: clase === "facilidad" ? +(q("#pH").value) || 0 : 0, descuenta: desc,
        subtipo: clase === "facilidad" ? q("#pS").value : "", expediente: clase === "permiso" && !!(q("#pX2") && q("#pX2").checked), motivo: q("#pMo").value.trim(), obs: q("#pOb").value.trim() }; };
    const aviso = () => { const x = leer(), A = []; if (!x.maeId || !x.inicio) { q("#pAv").innerHTML = ""; return []; }
      const s = peSaldo(x.maeId, x.inicio.slice(0, 4)), prev = n ? 0 : (p.descuenta ? +p.dias || 0 : 0), tras = s.usados - prev + x.dias;
      if (x.clase === "permiso" && x.dias > PE_DIAS) A.push(`Son ${peDias(x.dias)}: la norma permite hasta ${PE_DIAS} días por permiso.`);
      if (x.clase === "permiso" && n && s.nPer >= PE_NUM) A.push(`Ya tiene ${s.nPer} permisos este año (la norma permite ${PE_NUM}).`);
      if (tras > PE_LIM) A.push(`Con este llegaría a ${peDias(tras)}: pasa de los ${PE_LIM} del año.`);
      if (x.expediente && (n || !p.expediente) && s.nExp >= PE_EXP) A.push(`Ya tiene ${PE_EXP} permisos al expediente este año.`);
      q("#pAv").innerHTML = A.length ? `<span style="color:var(--rojo)">${A.map(esc).join("<br>")}</span>` : x.dias ? `<span class="muted">Le quedarán ${peDias(Math.max(0, PE_LIM - tras))} de ${PE_LIM} en ${x.inicio.slice(0, 4)}.</span>` : "";
      return A; };
    q("#pM").onchange = () => { escs(); aviso(); }; escs(); caja();
    w.querySelectorAll("[data-pc]").forEach(b => b.onclick = () => { clase = b.dataset.pc; w.querySelectorAll("[data-pc]").forEach(c => c.setAttribute("aria-pressed", c === b)); caja(); });
    q("#pX").onclick = cerrarDlg;
    q("#pOk").onclick = async () => { const x = leer(); if (!x.maeId) return toast("Elija al maestro(a)."); if (!x.inicio) return toast("Ponga la fecha.");
      if (x.clase === "facilidad" && !x.horas) return toast("Ponga las horas."); if (x.clase === "permiso" && !x.dias) return toast("Ponga los días.");
      const A = aviso(); if (x.expediente && (n || !p.expediente) && peSaldo(x.maeId, x.inicio.slice(0, 4)).nExp >= PE_EXP) return toast(`No se puede: ya tiene ${PE_EXP} permisos al expediente este año.`, 4500);
      if (A.length && !(await confirmar(A.join(" ") + " ¿Registrarlo de todos modos?", "Registrar"))) return;
      const m = maeDe(x.maeId), e = escDe(x.escId); Object.assign(p, x, { maeNombre: m ? m.nombre : "", escNombre: e ? e.nombre : "", actualizado: new Date().toISOString() });
      if (n) { p.creado = new Date().toISOString(); p.activo = true; D.permisos.push(p); } guardar(); cerrarDlg(); re(); toast(n ? "Permiso registrado." : "Cambios guardados."); };
    q("#pAn") && (q("#pAn").onclick = () => dlg(`<h3>Anular registro</h3><p class="small muted mb">El registro deja de contar, pero queda en el historial como anulado.</p><label class="campo"><span>¿Por qué se anula?</span><input id="anM" placeholder="Ej. se capturó dos veces"></label><div class="fila fin"><button class="btn" id="anX">Cancelar</button><button class="btn r" id="anOk">Anular</button></div>`, v => {
      v.querySelector("#anX").onclick = cerrarDlg; v.querySelector("#anOk").onclick = () => { p.activo = false; p.anulado = (val("anM").trim() || "Anulado") + " · " + fCorta(hoy()); guardar(); cerrarDlg(); re(); toast("Registro anulado."); }; })); }); }

async function docPermisos(a) { const isep = await aDataURL(ISEP).catch(() => ""), M = D.maestros.slice().sort((x, y) => x.nombre.localeCompare(y.nombre, "es")).map(m => ({ m, s: peSaldo(m.id, a) }));
  const td = "border:1px solid #999;padding:4px 6px;vertical-align:top", th = td + ";background:#EFEAE0;text-align:left";
  return `<div class="doc" style="font-family:Arial,Helvetica,sans-serif;font-size:10pt;color:#111">
   <table style="width:100%;border-collapse:collapse;margin-bottom:8px"><tr><td style="width:90px">${isep ? `<img src="${isep}" style="height:58px">` : ""}</td><td style="text-align:center"><b style="font-size:11pt">INSTITUTO DE SERVICIOS EDUCATIVOS Y PEDAGÓGICOS DE BAJA CALIFORNIA</b><br>${esc(D.yo.cargo || "Supervisión de Educación Física")}${D.yo.zona ? " · Zona " + esc(D.yo.zona) : ""}<br><b style="font-size:12pt">Control de permisos económicos · ${a}</b></td><td style="width:90px"></td></tr></table>
   <p style="margin:4px 0 8px">Norma: hasta ${PE_NUM} permisos de hasta ${PE_DIAS} días al año (${PE_LIM} días por año calendario). Fecha de corte: ${fLarga(hoy())}.</p>
   <table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th}">Maestro(a)</th><th style="${th}">Escuela(s)</th><th style="${th};text-align:center">Permisos</th><th style="${th};text-align:center">Días usados</th><th style="${th};text-align:center">Quedan</th><th style="${th};text-align:center">Facilidades (h)</th></tr></thead><tbody>
    ${M.map(({ m, s }) => `<tr><td style="${td}">${esc(m.nombre)}</td><td style="${td}">${escuelasDe(m).map(e => esc(e.nombre)).join(", ")}</td><td style="${td};text-align:center">${s.nPer}</td><td style="${td};text-align:center${s.usados >= PE_LIM ? ";color:#B3261E;font-weight:bold" : ""}">${peFmt(s.usados)}</td><td style="${td};text-align:center">${peFmt(s.quedan)}</td><td style="${td};text-align:center">${s.horas ? peFmt(s.horas) : "—"}</td></tr>`).join("")}</tbody></table>
   ${M.some(x => x.s.L.length) ? `<h3 style="font-size:11pt;margin:14px 0 6px">Detalle</h3><table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th}">Maestro(a)</th><th style="${th}">Fecha</th><th style="${th}">Tipo</th><th style="${th}">Escuela</th><th style="${th}">Motivo</th></tr></thead><tbody>
    ${M.flatMap(({ m, s }) => s.L.slice().sort((x, y) => x.inicio.localeCompare(y.inicio)).map(p => `<tr><td style="${td}">${esc(m.nombre)}</td><td style="${td}">${peFechas(p)}</td><td style="${td}">${peQue(p)}</td><td style="${td}">${esc(peEscTxt(p))}</td><td style="${td}">${esc(p.motivo || "")}</td></tr>`)).join("")}</tbody></table>` : ""}
   <table style="width:100%;margin-top:40px"><tr><td style="width:50%"></td><td style="text-align:center;border-top:1px solid #333;padding-top:4px">${esc(yoNombre())}<br>${esc(D.yo.cargo || "")}</td></tr></table></div>`; }
function csvPermisos(a) { const c = t => `"${String(t == null ? "" : t).replace(/"/g, '""')}"`, F = [["Maestro", "Escuela", "Tipo", "Desde", "Hasta", "Días que descuenta", "Horas", "Al expediente", "Motivo", "Observación"]];
  D.maestros.forEach(m => peSaldo(m.id, a).L.forEach(p => F.push([m.nombre, peEscTxt(p), p.clase === "facilidad" ? p.subtipo || "Facilidad" : "Permiso económico", p.inicio, p.fin, p.descuenta ? p.dias : 0, p.horas || "", p.expediente ? "Sí" : "", p.motivo, p.obs])));
  const b = new Blob(["﻿" + F.map(r => r.map(c).join(",")).join("\r\n")], { type: "text/csv" }), x = document.createElement("a"); x.href = URL.createObjectURL(b); x.download = `permisos-economicos-${a}.csv`; x.click(); }

/* Puerta en el inicio */
(function () { const base = VISTAS.inicio; VISTAS.inicio = () => { const h = base(), a = hoy().slice(0, 4), agot = D.maestros.filter(m => peSaldo(m.id, a).usados >= PE_LIM).length, n = peActivos().filter(p => String(p.inicio).slice(0, 4) === a).length;
  const puerta = `<button class="puerta" data-v="permisos" style="--c:#A94C2A;--c-s:#F6E3D9"><span class="ic">${ic("reloj")}</span><b>Permisos económicos</b><span>${n ? `${n} registro${n > 1 ? "s" : ""} en ${a}` : "Control de los 9 días del año"}${agot ? ` · ${agot} sin días` : ""}</span></button>`;
  return h.replace('<button class="puerta" data-v="catalogo"', puerta + '<button class="puerta" data-v="catalogo"'); }; })();
if (typeof S !== "undefined" && S.v === "inicio") pintar();
