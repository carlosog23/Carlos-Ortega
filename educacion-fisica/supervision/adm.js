/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Supervisión · Formatos administrativos (fase 3):
   · Control de permisos económicos con el acomodo del formato de la zona: nombre del maestro, Día 1 a Día 9 y
     observaciones. Cada casilla lleva la fecha de un día usado (½ si fue medio día); se llena solo con lo registrado.
   · Reporte mensual de incidencias administrativas (la entrega mensual del cronograma): por maestro, los permisos
     económicos y facilidades del mes (de lo ya registrado) más faltas, licencias médicas, comisiones y otras que se
     capturan aquí. Se imprime para entregarlo. */
"use strict";
D.incAdm = D.incAdm || {};
/* apellidos primero para ordenar como en los formatos de la zona */
const admApe = n => { const p = String(n || "").trim().split(/\s+/); return p.length > 2 ? p.slice(-2).join(" ") + " " + p.slice(0, -2).join(" ") : n; };
const admOrden = () => D.maestros.slice().sort((a, b) => admApe(a.nombre).localeCompare(admApe(b.nombre), "es"));
/* días usados de un maestro en el año: lista de {f, txt} */
function admDiasUsados(mId, anio) { const out = [];
  peDe(mId, anio).filter(p => p.descuenta && +p.dias > 0).sort((a, b) => a.inicio.localeCompare(b.inicio)).forEach(p => {
    if (p.clase === "facilidad") { out.push({ f: p.inicio, txt: `${admDM(p.inicio)}${+p.dias < 1 ? " ½" : ""}` }); return; }
    let rest = +p.dias; const d = dF(p.inicio), fin = dF(p.fin || p.inicio);
    for (let i = 0; i < 60 && rest > 0 && d <= fin; i++) { const w = d.getDay(); if (w && w !== 6) { const k = iso(d); out.push({ f: k, txt: `${admDM(k)}${rest < 1 ? " ½" : ""}` }); rest -= 1; } d.setDate(d.getDate() + 1); } });
  return out; }
const admDM = k => { const d = dF(k); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`; };
async function docControlPermisos(anio) { const isep = await aDataURL(ISEP).catch(() => ""), td = "border:1px solid #333;padding:4px 5px;font-size:8.5pt;height:24px;vertical-align:middle", th = td + ";background:#EFEAE0;font-weight:bold;text-align:center;height:auto";
  const filas = admOrden().map(m => { const U = admDiasUsados(m.id, anio), s = peSaldo(m.id, anio), obs = [];
    if (U.length > 9) obs.push(`${U.length - 9} día(s) más fuera de la tabla`); if (s.horas) obs.push(`Facilidades: ${peHoras(s.horas)}`);
    const mot = s.L.filter(p => p.motivo).map(p => p.motivo); if (mot.length) obs.push(mot.join("; "));
    return `<tr><td style="${td}">${esc(m.nombre)}</td>${Array.from({ length: 9 }, (_, i) => `<td style="${td};text-align:center">${U[i] ? U[i].txt : ""}</td>`).join("")}<td style="${td};font-size:7.5pt">${esc(obs.join(" · "))}</td></tr>`; }).join("");
  return `<div class="doc" style="font-family:Arial,Helvetica,sans-serif;color:#111"><table style="width:100%;border-collapse:collapse;margin-bottom:8px"><tr><td style="width:80px">${isep ? `<img src="${isep}" style="height:50px">` : ""}</td><td style="text-align:center"><b style="font-size:11pt">CONTROL DE PERMISOS ECONÓMICOS PROFESORES DE EDUCACIÓN FÍSICA${D.yo.zona ? " ZONA ESCOLAR " + esc(D.yo.zona) : ""}</b><br><span style="font-size:9.5pt">Año ${anio} · corte al ${fLarga(hoy())}</span></td><td style="width:80px"></td></tr></table>
   <table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th};text-align:left;width:24%">Nombre del maestro</th>${Array.from({ length: 9 }, (_, i) => `<th style="${th}">Día ${i + 1}</th>`).join("")}<th style="${th};width:21%">Observaciones</th></tr></thead><tbody>${filas}</tbody></table>
   <table style="width:100%;margin-top:34px"><tr><td style="width:50%"></td><td style="text-align:center;border-top:1px solid #333;padding-top:4px;font-size:9.5pt">${esc(yoNombre())}<br>${esc(D.yo.cargo || "")}</td></tr></table></div>`; }
(function () { const base = VISTAS.permisos; VISTAS.permisos = () => base().replace('<button class="btn" id="peImp">', `<button class="btn p" id="peCtl">${ic("impr", 16)} Formato de control (Día 1 a 9)</button><button class="btn" id="peImp">`);
  const enl = ENLAZAR.permisos; ENLAZAR.permisos = () => { enl(); $("#peCtl") && ($("#peCtl").onclick = async () => imprimir(await docControlPermisos(peAnio()))); }; })();

/* =================================================================== INCIDENCIAS ADMINISTRATIVAS (mensual) */
const ADM_CAMPOS = [["faltas", "Faltas (días)"], ["retardos", "Retardos"], ["licencias", "Licencias médicas (días)"], ["comisiones", "Comisiones (días)"]];
const admMes = () => S.amM || hoy().slice(0, 7);
const admReg = (mes, mId) => ((D.incAdm[mes] || {})[mId]) || {};
function admPermisosMes(mId, mes) { const L = peActivos().filter(p => p.maeId === mId && (String(p.inicio).slice(0, 7) === mes || String(p.fin || p.inicio).slice(0, 7) === mes));
  return { per: L.filter(p => p.clase === "permiso"), fac: L.filter(p => p.clase === "facilidad"), dias: L.filter(p => p.clase === "permiso").reduce((t, p) => t + (+p.dias || 0), 0), horas: L.filter(p => p.clase === "facilidad").reduce((t, p) => t + (+p.horas || 0), 0) }; }
const admTieneAlgo = (mes, m) => { const r = admReg(mes, m.id), p = admPermisosMes(m.id, mes); return p.per.length || p.fac.length || ADM_CAMPOS.some(([k]) => +r[k]) || r.otras; };
VISTAS.incAdm = () => { const mes = admMes(), M = admOrden(), entregado = (D.incAdm[mes] || {})._entregado;
  const meses = CI_MESES.filter(k => k >= "2026-09");
  return barra("Supervisión", "Incidencias administrativas") + `<main class="wrap">
   <p class="muted mt small">Reporte mensual por maestro. Los permisos económicos y facilidades se toman de lo que ya registró; aquí agrega faltas, retardos, licencias, comisiones u otras.</p>
   <div class="chips mt">${meses.map(k => `<button class="chip" data-am="${k}" aria-pressed="${k === mes}">${ciMesCorto(k)}</button>`).join("")}</div>
   <section class="card mt"><div class="fila" style="justify-content:space-between"><h3>${ciMesNom(mes)[0].toUpperCase() + ciMesNom(mes).slice(1)} ${mes.slice(0, 4)}</h3>${entregado ? `<span class="tag">Entregado ${fCorta(entregado)}</span>` : `<span class="tag r">Sin entregar</span>`}</div>
    <p class="small muted mt">${M.filter(m => admTieneAlgo(mes, m)).length} maestros con incidencias este mes.</p>
    <div class="fila mt"><button class="btn p" id="amImp">${ic("impr", 16)} Imprimir reporte</button><button class="btn" id="amEnt">${ic("check", 16)} ${entregado ? "Quitar «entregado»" : "Marcar como entregado"}</button></div></section>
   <div class="lista mt">${M.map(m => { const r = admReg(mes, m.id), p = admPermisosMes(m.id, mes), partes = [];
     if (p.per.length) partes.push(`Permisos: ${peDias(p.dias)}`); if (p.fac.length) partes.push(`Facilidades: ${peHoras(p.horas)}`);
     ADM_CAMPOS.forEach(([k, t]) => { if (+r[k]) partes.push(`${t.replace(/ \(.*\)/, "")}: ${r[k]}`); }); if (r.otras) partes.push(esc(r.otras));
     return `<button class="it btnit" data-amm="${m.id}"><span class="av" style="background:${partes.length ? "var(--maiz-s)" : "var(--hilo2)"};color:${partes.length ? "var(--maiz-d)" : "var(--gris)"}">${partes.length ? "!" : "✓"}</span><span class="tx"><b>${esc(m.nombre)}</b><small>${partes.join(" · ") || "Sin incidencias"}</small></span></button>`; }).join("")}</div>${pie()}</main>`; };
ENLAZAR.incAdm = () => { const mes = admMes(); $$("[data-am]").forEach(b => b.onclick = () => { S.amM = b.dataset.am; re(); });
  $("#amImp").onclick = async () => imprimir(await docIncAdm(mes));
  $("#amEnt").onclick = () => { D.incAdm[mes] = D.incAdm[mes] || {}; if (D.incAdm[mes]._entregado) delete D.incAdm[mes]._entregado; else D.incAdm[mes]._entregado = hoy(); guardar(); re(); };
  $$("[data-amm]").forEach(b => b.onclick = () => { const m = maeDe(b.dataset.amm), r = Object.assign({}, admReg(mes, m.id)), p = admPermisosMes(m.id, mes);
    dlg(`<h3>${esc(m.nombre)}</h3><p class="small muted mb">${ciMesNom(mes)} ${mes.slice(0, 4)}${p.per.length || p.fac.length ? ` · ya registrados: ${[p.per.length ? "permisos " + peDias(p.dias) : "", p.fac.length ? "facilidades " + peHoras(p.horas) : ""].filter(Boolean).join(", ")}` : ""}</p>
      <div class="dos">${ADM_CAMPOS.map(([k, t]) => `<label class="campo"><span>${t}</span><input type="number" min="0" step="0.5" id="am_${k}" value="${esc(r[k] || "")}"></label>`).join("")}</div>
      <label class="campo"><span>Otras incidencias / observaciones</span><textarea id="am_otras" placeholder="Fechas, número de licencia, motivo…">${esc(r.otras || "")}</textarea></label>
      <div class="fila fin"><button class="btn" id="amX">Cancelar</button><button class="btn p" id="amOk">Guardar</button></div>`, w => {
      w.querySelector("#amX").onclick = cerrarDlg;
      w.querySelector("#amOk").onclick = () => { const x = {}; ADM_CAMPOS.forEach(([k]) => { const v = +w.querySelector("#am_" + k).value; if (v) x[k] = v; }); const o = w.querySelector("#am_otras").value.trim(); if (o) x.otras = o;
        D.incAdm[mes] = D.incAdm[mes] || {}; if (Object.keys(x).length) D.incAdm[mes][m.id] = x; else delete D.incAdm[mes][m.id]; guardar(); cerrarDlg(); re(); toast("Guardado."); }; }); }); };
async function docIncAdm(mes) { const isep = await aDataURL(ISEP).catch(() => ""), td = "border:1px solid #333;padding:4px 5px;font-size:8.5pt;vertical-align:top", th = td + ";background:#EFEAE0;font-weight:bold;text-align:center;vertical-align:middle";
  const filas = admOrden().map(m => { const r = admReg(mes, m.id), p = admPermisosMes(m.id, mes);
    const perTxt = p.per.map(x => `${peFechas(x)} (${peDias(+x.dias || 0)})`).join("<br>"), facTxt = p.fac.map(x => `${fCorta(x.inicio)} · ${peHoras(+x.horas || 0)}`).join("<br>");
    return `<tr><td style="${td}">${esc(m.nombre)}</td><td style="${td}">${esc(escuelasDe(m).map(e => e.nombre).join(", "))}</td><td style="${td}">${perTxt}</td><td style="${td}">${facTxt}</td>${ADM_CAMPOS.map(([k]) => `<td style="${td};text-align:center">${r[k] || ""}</td>`).join("")}<td style="${td}">${esc(r.otras || "")}</td></tr>`; }).join("");
  return `<div class="doc" style="font-family:Arial,Helvetica,sans-serif;color:#111"><table style="width:100%;border-collapse:collapse;margin-bottom:8px"><tr><td style="width:80px">${isep ? `<img src="${isep}" style="height:50px">` : ""}</td><td style="text-align:center"><b style="font-size:11pt">REPORTE DE INCIDENCIAS ADMINISTRATIVAS · EDUCACIÓN FÍSICA${D.yo.zona ? " ZONA ESCOLAR " + esc(D.yo.zona) : ""}</b><br><span style="font-size:9.5pt">Mes de ${ciMesNom(mes)} de ${mes.slice(0, 4)} · ciclo escolar ${ciCiclo()}</span></td><td style="width:80px"></td></tr></table>
   <table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th};text-align:left">Maestro(a)</th><th style="${th}">Escuela(s)</th><th style="${th}">Permisos económicos</th><th style="${th}">Facilidades</th>${ADM_CAMPOS.map(([, t]) => `<th style="${th}">${t}</th>`).join("")}<th style="${th}">Otras / observaciones</th></tr></thead><tbody>${filas}</tbody></table>
   <table style="width:100%;margin-top:34px"><tr><td style="width:50%"></td><td style="text-align:center;border-top:1px solid #333;padding-top:4px;font-size:9.5pt">${esc(yoNombre())}<br>${esc(D.yo.cargo || "")}</td></tr></table></div>`; }
/* puerta en el inicio y liga desde la agenda */
(function () { const base = VISTAS.inicio; VISTAS.inicio = () => { let h = base(); if (!D.cfg.listo) return h; const mes = hoy().slice(0, 7), ent = (D.incAdm[mes] || {})._entregado;
  const puerta = `<button class="puerta" data-v="incAdm" style="--c:#2F6B3A;--c-s:#E1F0E2"><span class="ic">${ic("doc")}</span><b>Incidencias administrativas</b><span>Reporte de ${ciMesNom(mes)} · ${ent ? "entregado" : "pendiente de entregar"}</span></button>`;
  return h.replace('<button class="puerta" data-v="permisos"', puerta + '<button class="puerta" data-v="permisos"'); }; })();
(function () { const a = D.crono.find(x => /incidencias administrativas/i.test(x.act)); if (a && !a.liga) { a.liga = "incAdm"; guardar(); }
  const acc = accionCrono; accionCrono = function (a, k) { acc(a, k); if (a.liga === "incAdm") { const box = $("#velo .dlg"); if (box && !$("#aIA")) { const b = document.createElement("button"); b.className = "btn p full mb"; b.id = "aIA"; b.innerHTML = `${ic("doc", 16)} Abrir el reporte de incidencias administrativas`; b.onclick = () => ir("incAdm", { amM: /^\d{4}-\d{2}$/.test(k) ? k : k.slice(0, 7) }); box.insertBefore(b, box.querySelector(".fila")); } } }; })();
if (typeof S !== "undefined" && S.v === "inicio") pintar();
