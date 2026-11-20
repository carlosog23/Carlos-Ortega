/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Visita del supervisor. Cuando llega el supervisor(a) de Educación Física, el maestro genera aquí
   un código QR: se arma un «paquete de revisión» de solo lectura (planeaciones, evaluación continua y formativa,
   listas de asistencia, incidentes) que el supervisor abre en su app «Ulama · Supervisión».
   El paquete viaja comprimido por el servidor de Tequio y se borra solo a las 6 horas; sin internet se comparte
   como archivo. El supervisor no puede cambiar nada de la app del maestro. */
"use strict";
const REV_APP = "supervision/";

/* ---------- arma el paquete de revisión ---------- */
function revPeriodoActual() { const k = hoy(), c = D.cortes.find(x => k >= x.ini && k <= x.fin) || D.cortes.filter(x => x.ini <= k).slice(-1)[0] || D.cortes[0];
  return { ini: c.ini, fin: k < c.fin ? k : c.fin, n: c.n }; }
function revPaquete(escIds, E, que) {
  const gs = D.grupos.filter(g => escIds.includes(g.escId)).sort((a, b) => String((escDe(a.escId) || {}).nombre).localeCompare(String((escDe(b.escId) || {}).nombre), "es") || a.grado - b.grado || String(a.grupo).localeCompare(b.grupo));
  const gIds = new Set(gs.map(g => g.id)), J = k => JUEGOS[k] || { n: k };
  const pct = o => { const r = {}; Object.entries(o || {}).forEach(([k, v]) => { if (v.n) r[k] = Math.round(100 * v.s / v.n); }); return r; };
  const grupos = gs.map(g => { const cl = clasesEn(g.id, E.ini, E.fin), F = filasEval(g, E);
    const crit = {}; F.forEach(f => Object.entries(f.r.porCrit || {}).forEach(([k, v]) => { const x = crit[k] = crit[k] || { s: 0, n: 0 }; x.s += v.s; x.n += v.n; }));
    return { id: g.id, escId: g.escId, n: grNom(g), grado: g.grado, docente: g.docente || "", correo: g.correo || "", dias: diasGrupo(g),
      clases: cl.map(c => { const p = plDe(c.planId), s = p && p.sesiones.find(x => x.id === c.sesId); return { f: c.fecha, h: c.ini || "", s: s ? s.t : "", ins: c.instr || (p && p.instr) || "", ev: Object.keys(c.evals || {}).length }; }),
      al: F.map(f => ({ n: f.a.nombre, b: f.a.baja || "", nee: f.a.nee ? 1 : 0,
        m: cl.map(c => (f.a.alta && c.fecha < f.a.alta) || (f.a.baja && c.fecha > f.a.baja) ? " " : ((c.asis || {})[f.a.id] || "-")).join(""),
        r: { asis: f.r.asis, falt: f.r.falt, ret: f.r.ret, just: f.r.just, total: f.r.total, sinU: f.r.sinU || 0, mala: f.r.mala || 0, nreg: f.r.nreg || 0, tend: Math.round((f.r.tend || 0) * 100) / 100 },
        cal: f.cal, val: que.eval ? f.obs : "", cr: pct(f.r.porCrit) })),
      crit: pct(crit) }; });
  const planes = !que.plan ? [] : D.planes.filter(p => (p.grupos || []).some(id => gIds.has(id))).sort((a, b) => a.ini.localeCompare(b.ini)).map(p => { const pg = p.grupos.filter(id => gIds.has(id)).map(grDe).filter(Boolean);
    const fechas = {}, dadas = {}; pg.forEach(g => { fechas[g.id] = fechasPlan(g, p); dadas[g.id] = [...sesionesDadas(g.id, p.id)]; });
    return { id: p.id, escId: p.escId, titulo: p.titulo, cont: p.cont, pdas: p.pdas, proposito: p.proposito || "", ini: p.ini, min: p.min, instr: p.instr, creado: p.creado || "", grupos: pg.map(g => g.id),
      ses: p.sesiones.map(s => ({ id: s.id, t: s.t, est: s.est, para: s.para, ini: `${J(s.act).n}. ${s.charla || ""}`, des: (s.ppal || []).map(k => J(k).n).join(", "), cie: `${J(s.calma).n}. ${(s.cierre || []).join(" ")}`, ev: s.eval })),
      fechas, dadas, crit: (p.criterios || []).map(c => ({ c: c.c, d: c.d })), inc: (p.inclusion || []).length,
      nd: pg.flatMap(g => ndDe(p, g).map(x => ({ f: x.f, g: g.id, m: ndTexto(x), a: ndAccion(x) }))) }; });
  const inc = !que.inc ? [] : (D.incidentes || []).filter(x => x.fecha >= E.ini && x.fecha <= E.fin && (!x.grupoId || gIds.has(x.grupoId))).map(x => ({ f: x.fecha, h: x.hora, tipo: x.tipo || "Otro", g: x.grupoId || "", acu: x.acuerdos ? 1 : 0 }));
  const escuelas = D.escuelas.filter(e => escIds.includes(e.id)).map(e => ({ id: e.id, nombre: e.nombre, cct: e.cct, turno: e.turno || "", zona: e.zona || "", localidad: e.localidad || "", dir: dirNombre(e), correo: e.correo || "", supEF: e.supEF || "", supCorreo: e.supCorreo || "", dias: e.dias || [], horario: !!e.horario }));
  return { t: "ulama-rev", v: 1, gen: new Date().toISOString(), per: E, que, docente: { nombre: docNombre(), correo: D.docente.correo || "", tel: D.docente.tel || "" },
    escuelas, grupos: que.asis || que.eval ? grupos : grupos.map(g => Object.assign({}, g, { al: [], clases: [] })), planes, inc,
    resp: D.cfg.ultimoResp || "", firma: !!D.cfg.firma };
}
async function revComprimir(txt) {
  if (!window.CompressionStream) return { z: 0, s: btoa(unescape(encodeURIComponent(txt))) };
  const st = new Blob([txt]).stream().pipeThrough(new CompressionStream("gzip")), buf = new Uint8Array(await new Response(st).arrayBuffer()); let b = "";
  for (let i = 0; i < buf.length; i += 0x8000) b += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return { z: 1, s: btoa(b) };
}
async function revSubir(z) { const s = await servidor(), tok = tokAcceso(); if (!tok) throw new Error("sin-enlace"); if (navigator.onLine === false) throw new Error("sin-red");
  const r = await fetch(s, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion: "ulamaRevSubir", datos: { tok, paq: z.s, z: z.z, nombre: docNombre(), correo: D.docente.correo || "" } }) });
  const j = await r.json(); if (!j || !j.ok) throw new Error((j && (j.mensaje || j.error)) || "El servidor no respondió."); return j; }
const revUrl = c => new URL(REV_APP + "#c=" + c, location.href).href;

/* ---------- puerta en Inicio ---------- */
(function () {
  const v = VISTAS.inicio, e = ENLAZAR.inicio, k = '<button class="puerta" data-v="ajustes"';
  VISTAS.inicio = () => { const h = v(); const p = `<button class="puerta" data-v="visitaSup" style="--c:#1F3A6B;--c-s:#E6ECF6"><span class="ic">${ic("sup")}</span><b>Visita del supervisor</b><span>Código QR para que revise planeaciones, evaluación, asistencia y gráficas</span></button>`;
    return h.includes(k) ? h.replace(k, p + k) : h; };
  ENLAZAR.inicio = e;
  const st = document.createElement("style");
  st.textContent = `.rev-qr{display:grid;justify-items:center;gap:10px;text-align:center;padding:22px 16px;border-radius:24px;background:#fff;border:1px solid var(--hilo);box-shadow:var(--e2)}
  .rev-qr #revQR{background:#fff;padding:14px;border-radius:18px;border:1px solid var(--hilo2)} .rev-qr #revQR img,.rev-qr #revQR canvas{width:min(68vw,280px)!important;height:auto!important;display:block}
  .rev-cod{font:700 clamp(34px,9vw,48px)/1 var(--disp);letter-spacing:.14em;color:var(--anil)} .rev-chk{display:flex;align-items:center;gap:10px;min-height:46px;font-weight:700}.rev-chk input{width:22px;height:22px;accent-color:var(--jade)}`;
  document.head.appendChild(st);
})();

VISTAS.visitaSup = () => { const R = S.R = S.R || { esc: "todas", per: "tri", ini: revPeriodoActual().ini, fin: hoy(), que: { plan: true, eval: true, asis: true, inc: true } }, q = D.cfg.revQR, vig = q && q.vence && new Date(q.vence) > new Date();
  const P = revPeriodoActual();
  return barra("Supervisión", "Visita del supervisor") + `<main class="wrap">
  <section class="portada" style="background:radial-gradient(500px 260px at 90% 0,rgba(227,166,59,.35),transparent 70%),linear-gradient(150deg,#294A86,#13244A 70%)"><div class="eb">Revisión formativa</div><h1>Su supervisor(a) revisa con un código</h1>
   <p>Genere el código y muéstrelo. Con la app <b>Ulama · Supervisión</b>, su supervisor(a) de Educación Física ve sus planeaciones, la evaluación continua y formativa, las listas de asistencia y las gráficas de sus grupos. <b>Es solo de consulta:</b> no puede cambiar nada de su app.</p></section>
  ${vig ? `<section class="rev-qr mt"><div class="eb" style="color:var(--jade);font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:13px">Código vigente</div><div id="revQR"></div><div class="rev-cod">${esc(q.codigo.slice(0, 3) + " " + q.codigo.slice(3))}</div>
   <p class="small muted">${esc(q.resumen || "")}<br>Válido hasta las ${h12(new Date(q.vence).toTimeString().slice(0, 5))}; después se borra solo.</p>
   <p class="small">Pida a su supervisor(a) que lo escanee con la <b>cámara de su celular</b> o desde Ulama · Supervisión, o que escriba el código.</p>
   <div class="fila" style="justify-content:center"><button class="btn s" id="rvCop">${ic("doc", 16)} Copiar enlace</button><button class="btn s" id="rvArch">${ic("bajar", 16)} Compartir como archivo</button><button class="btn s r" id="rvX">Quitar código</button></div></section>` : ""}
  <section class="card mt"><h3>${vig ? "Generar otro código" : "¿Qué va a revisar?"}</h3>
   <label class="campo"><span>Escuela</span><select id="rvE"><option value="todas" ${R.esc === "todas" ? "selected" : ""}>Todas mis escuelas (${D.escuelas.length})</option>${D.escuelas.map(e => `<option value="${e.id}" ${R.esc === e.id ? "selected" : ""}>${esc(e.nombre)}${e.supEF ? " · Sup. " + esc(e.supEF) : ""}</option>`).join("")}</select></label>
   <div class="campo"><span>Periodo</span><div class="chips">${[["tri", `${P.n} (hasta hoy)`], ["ciclo", "Todo el ciclo"], ["mes", "Último mes"], ["libre", "Otras fechas"]].map(([k, t]) => `<button class="chip" data-rp="${k}" aria-pressed="${R.per === k}">${t}</button>`).join("")}</div></div>
   ${R.per === "libre" ? `<div class="dos"><label class="campo"><span>Del</span><input type="date" id="rvI" value="${R.ini}"></label><label class="campo"><span>Al</span><input type="date" id="rvF" value="${R.fin}"></label></div>` : ""}
   <div class="campo"><span>Incluir</span>${[["plan", "Planeaciones"], ["eval", "Evaluación continua y formativa"], ["asis", "Listas de asistencia"], ["inc", "Bitácora de incidentes (sin nombres de alumnos)"]].map(([k, t]) => `<label class="rev-chk"><input type="checkbox" data-rq="${k}" ${R.que[k] ? "checked" : ""}> ${t}</label>`).join("")}</div>
   <div class="fila mt"><button class="btn p" id="rvGen">${ic("sup", 18)} Generar código QR</button><button class="btn" id="rvSolo">${ic("bajar", 16)} Solo archivo (sin internet)</button></div>
   <p class="small muted mt">Los datos de alumnos con necesidad específica no se comparten: el supervisor solo ve cuántos hay. El código dura 6 horas.</p></section>
  <p class="pie">Ulama · de la familia Tlamatini · Supervisión Escolar Zona 050 · ISEP</p></main>`; };
ENLAZAR.visitaSup = () => { const R = S.R, q = D.cfg.revQR, re = () => { const y = scrollY; pintar(); scrollTo(0, y); };
  if (q && $("#revQR")) cargarJS("qrcode.min.js").then(() => { $("#revQR").innerHTML = ""; new QRCode($("#revQR"), { text: q.url, width: 512, height: 512, colorDark: "#13244A", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M }); }).catch(() => { $("#revQR").innerHTML = `<p class="small muted">Sin internet no se dibujó el QR: use el código de letras.</p>`; });
  $("#rvE").onchange = e => { R.esc = e.target.value; };
  $$("[data-rp]").forEach(b => b.onclick = () => { R.per = b.dataset.rp; const P = revPeriodoActual(), d = new Date(); if (R.per === "tri") { R.ini = P.ini; R.fin = hoy(); } else if (R.per === "ciclo") { R.ini = CICLO.inicio; R.fin = hoy(); } else if (R.per === "mes") { d.setMonth(d.getMonth() - 1); R.ini = iso(d); R.fin = hoy(); } re(); });
  $("#rvI") && ($("#rvI").onchange = e => R.ini = e.target.value); $("#rvF") && ($("#rvF").onchange = e => R.fin = e.target.value);
  $$("[data-rq]").forEach(c => c.onchange = () => R.que[c.dataset.rq] = c.checked);
  const armar = () => { const ids = R.esc === "todas" ? D.escuelas.map(e => e.id) : [R.esc]; if (!ids.length) { toast("Primero registre sus escuelas."); return null; }
    if (R.ini > R.fin) { toast("La fecha inicial es mayor que la final."); return null; }
    const per = { ini: R.ini, fin: R.fin, n: R.per === "tri" ? revPeriodoActual().n : R.per === "ciclo" ? "Ciclo escolar" : R.per === "mes" ? "Último mes" : "Periodo elegido" };
    const p = revPaquete(ids, per, R.que), nAl = p.grupos.reduce((t, g) => t + g.al.length, 0);
    p.resumen = `${p.escuelas.length === 1 ? p.escuelas[0].nombre : p.escuelas.length + " escuelas"} · ${p.grupos.length} grupos · ${nAl} alumnos · ${p.planes.length} planeaciones · ${fCorta(per.ini)} al ${fCorta(per.fin)}`; return p; };
  const archivo = async (p, comp) => { const z = comp || await revComprimir(JSON.stringify(p)), txt = JSON.stringify({ t: "ulama-rev-archivo", v: 1, z: z.z, paq: z.s, docente: p.docente.nombre, gen: p.gen }),
      nom = `revision-ulama-${(D.docente.nombre || "docente").toLowerCase().normalize("NFD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}-${hoy()}.ulama`, f = new File([txt], nom, { type: "application/octet-stream" });
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: "Revisión de Ulama", text: "Ábralo con Ulama · Supervisión → «Abrir archivo de revisión»." }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = nom; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast("Se descargó el archivo. Envíelo a su supervisor(a) por WhatsApp o correo: lo abre en Ulama · Supervisión.", 4500); };
  $("#rvSolo").onclick = async () => { const p = armar(); if (p) await archivo(p); };
  $("#rvGen").onclick = async ev => { const b = ev.currentTarget, p = armar(); if (!p) return; b.disabled = true; b.textContent = "Preparando…";
    try { const z = await revComprimir(JSON.stringify(p)); S.ultZ = { z, p }; b.textContent = "Subiendo…"; const j = await revSubir(z);
      D.cfg.revQR = { codigo: j.codigo, vence: j.vence, url: revUrl(j.codigo), resumen: p.resumen }; guardar(true); re(); toast("<b>Código listo.</b> Muéstreselo a su supervisor(a).", 3500); }
    catch (e) { b.disabled = false; b.innerHTML = `${ic("sup", 18)} Generar código QR`;
      const m = e.message === "sin-enlace" ? "Esta app no tiene enlace de acceso para usar el servidor." : e.message === "sin-red" ? "No hay internet." : e.message;
      dlg(`<h3>No se pudo generar el código</h3><p class="mb">${esc(m)}</p><p class="small muted mb">Puede compartirle a su supervisor(a) la revisión como archivo (por WhatsApp, correo o AirDrop). La abre igual en Ulama · Supervisión.</p>
        <div class="fila fin"><button class="btn" id="rfX">Cerrar</button><button class="btn p" id="rfA">${ic("bajar", 16)} Compartir como archivo</button></div>`, w => { w.querySelector("#rfX").onclick = cerrarDlg; w.querySelector("#rfA").onclick = () => { cerrarDlg(); archivo(p); }; }); } };
  if (q && $("#rvX")) {
    $("#rvX").onclick = () => { delete D.cfg.revQR; guardar(true); re(); };
    $("#rvCop").onclick = async () => { try { await navigator.clipboard.writeText(q.url); toast("Enlace copiado."); } catch (e) { prompt("Copie el enlace:", q.url); } };
    $("#rvArch").onclick = () => { const p = armar(); if (p) archivo(p); }; }
};
