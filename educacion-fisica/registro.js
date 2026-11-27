/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · registro guiado del maestro de Educación Física.
   Pide, en orden, todo lo que la plataforma necesita: datos del maestro → escuelas (cuántas y los datos de cada una) →
   todas las listas de alumnos de una sola vez (la app reconoce escuela, grado y grupo) → datos de cada grupo →
   horarios (archivo por escuela y días/hora por grupo) → revisión. No deja terminar si falta algo.
   Al terminar, la plataforma queda lista en el dispositivo y se envía una copia a la Supervisión. */
"use strict";
const RE_CCT = /^\d{2}[A-Z]{3}\d{4}[A-Z]$/, RE_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WA_SUP = "526618501585";
const PASOS_R = ["Bienvenida", "Sus datos", "Escuelas", "Listas de alumnos", "Grupos", "Horarios", "Revisión"];
function REG() { if (!D.reg) D.reg = { paso: 0, doc: { trato: "", nombre: "", correo: "", gmail: "", tel: "" }, nEsc: 1, escs: [], grupos: [] }; return D.reg; }
const guardarReg = () => guardar(true);
function nuevaEscR() { return { id: uid(), nombre: "", cct: "", turno: "", zona: "", localidad: "", dias: [], dirTrato: "Mtro.", director: "", correo: "", supEF: "", supCorreo: "", nGrupos: "", logo: "", horario: "", horarioNombre: "" }; }

/* ---------- qué falta (por paso); la revisión junta todo ---------- */
function faltaR(paso) { const r = REG(), F = [], f = (p, t) => { if (!paso || paso === p) F.push({ p, t }); };
  const d = r.doc; if (!d.nombre.trim()) f(1, "Su nombre completo"); if (!RE_MAIL.test(d.correo)) f(1, "Su correo institucional");
  if (!RE_MAIL.test(d.gmail)) f(1, "Su correo de Google (Gmail)"); if (String(d.tel).replace(/\D/g, "").length !== 10) f(1, "Su celular a 10 dígitos");
  if (!r.escs.length) f(2, "Cuántas escuelas atiende");
  r.escs.forEach((e, i) => { const n = e.nombre || `Escuela ${i + 1}`;
    if (!e.nombre.trim()) f(2, `Escuela ${i + 1}: nombre`); if (!RE_CCT.test(e.cct)) f(2, `${n}: C.C.T. (10 caracteres, como 02DPR0150B)`);
    if (!e.turno) f(2, `${n}: turno`); if (!e.zona.trim()) f(2, `${n}: zona escolar (número o clave)`); if (!e.dias.length) f(2, `${n}: días que asiste`);
    if (!e.director.trim()) f(2, `${n}: director(a)`); if (!RE_MAIL.test(e.correo)) f(2, `${n}: correo de la escuela o de la dirección`);
    if (!e.supEF.trim()) f(2, `${n}: supervisor(a) de Educación Física`); if (!RE_MAIL.test(e.supCorreo)) f(2, `${n}: correo del supervisor(a) de Educación Física`);
    if (!(+e.nGrupos > 0)) f(2, `${n}: cuántos grupos atiende`);
    const gs = r.grupos.filter(g => g.escId === e.id && g.grado && g.grupo);
    if (+e.nGrupos > 0 && gs.length < +e.nGrupos) f(3, `${n}: faltan ${+e.nGrupos - gs.length} de ${e.nGrupos} listas de grupo`);
    if (+e.nGrupos > 0 && gs.length > +e.nGrupos) f(3, `${n}: subió ${gs.length} grupos y dijo que atiende ${e.nGrupos} (corrija el número en Escuelas o quite los que sobran)`);
    if (!e.horario) f(5, `${n}: foto o archivo del horario`); });
  r.grupos.forEach(g => { const e = r.escs.find(x => x.id === g.escId), n = `${g.grado ? g.grado + ".° " : ""}${g.grupo || ""}${e ? " · " + (e.nombre || "escuela") : ""}`.trim() || g.fuente;
    if (!e) f(3, `Lista «${g.fuente}»: elija la escuela`); if (!g.grado || !g.grupo) f(3, `Lista «${g.fuente}»: indique grado y grupo`);
    if (!g.alumnos.length) f(3, `${n}: la lista no tiene alumnos`);
    if (g.grado && g.grupo && r.grupos.some(x => x !== g && x.escId === g.escId && x.grado === g.grado && x.grupo === g.grupo)) f(3, `${n}: está repetido (dos listas del mismo grupo)`);
    if (!g.docente.trim()) f(4, `${n}: docente del grupo`); if (!RE_MAIL.test(g.correo)) f(4, `${n}: correo del docente del grupo`);
    if (!g.dias.length) f(5, `${n}: días de clase de Educación Física`); if (!g.hora.trim()) f(5, `${n}: hora de la clase`); });
  return paso ? F.filter((x, i, a) => a.findIndex(y => y.t === x.t) === i) : F; }

/* ---------- imágenes: logo y horario, comprimidos para que quepan en el dispositivo ---------- */
async function aImagen(file, max, q) { let src;
  if (/pdf/i.test(file.type) || /\.pdf$/i.test(file.name)) { const L = await pdfjs(), doc = await L.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise, pg = await doc.getPage(1);
    const vp0 = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: Math.min(3, max / vp0.width) }), c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
    const cx = c.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, c.width, c.height); await pg.render({ canvasContext: cx, viewport: vp }).promise; return c.toDataURL("image/jpeg", q); }
  src = URL.createObjectURL(file); const im = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
  const cx = c.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, c.width, c.height); cx.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(src); return c.toDataURL("image/jpeg", q); }

/* ---------- vista ---------- */
const pasosHTML = p => `<div class="pasos">${PASOS_R.slice(1).map((_, i) => `<span class="${i + 1 <= p ? "on" : ""}"></span>`).join("")}</div><p class="paso-t">Paso ${p} de ${PASOS_R.length - 1} · ${PASOS_R[p]}</p>`;
const campo = (lbl, id, v, extra = "") => `<label class="campo"><span>${lbl}</span><input id="${id}" value="${esc(v || "")}" ${extra}></label>`;
const diasChips = (pref, sel) => `<div class="chips mb" style="margin-top:6px">${[1, 2, 3, 4, 5].map(d => `<button type="button" class="chip" data-dd="${pref}" data-d="${d}" aria-pressed="${(sel || []).includes(d)}">${DSEM[d]}</button>`).join("")}</div>`;
const avisoFalta = p => { const F = faltaR(p); return S.verFalta && F.length ? `<div class="aviso mt" style="background:var(--rojo-s);border-color:#E8C3BE;color:var(--rojo)"><span><b>Para continuar falta:</b><br>${F.slice(0, 12).map(x => "· " + esc(x.t)).join("<br>")}${F.length > 12 ? `<br>… y ${F.length - 12} más` : ""}</span></div>` : ""; };
const navR = (p, sig = "Siguiente") => `<div class="fijo"><div class="in">${p > 1 ? `<button class="btn" id="rAtr">Atrás</button>` : ""}<button class="btn p" id="rSig">${sig}</button></div></div>`;

VISTAS.registro = () => { const r = REG(), p = r.paso;
  if (p === 0) return `<main class="wrap"><section class="portada"><div class="marca"><img src="img/ulama-icono.svg" alt=""><div class="eb">Ulama · Educación Física</div></div>
    <h1>${YO && YO.nombre && !YO.sup ? `Bienvenido(a), ${esc(corto(YO.nombre.replace(/^(Profr?a?\.|Mtr[oa]\.|Lic\.)\s*/i, "")))}` : "Su clase, en movimiento"}</h1>
    <p>Vamos a dejar lista su plataforma en un solo registro: sus datos, sus escuelas, todas sus listas de alumnos, sus grupos y sus horarios. Tarda unos 15 minutos y puede dejarlo a medias: se guarda solo.</p></section>
    <div class="card mt"><h3>Tenga a la mano</h3><ul class="small" style="margin:6px 0 0;padding-left:20px;line-height:1.7">
     <li>Su correo institucional y su correo de Google (Gmail).</li><li>De cada escuela: C.C.T., zona, director(a) y su correo, y su supervisor(a) de Educación Física con su correo.</li>
     <li><b>Todas sus listas de alumnos</b> (PDF de RELweb o fotos): las sube juntas y Ulama reconoce de qué escuela y grupo es cada una.</li>
     <li>El nombre y correo del docente de cada grupo.</li><li>Su horario de cada escuela (foto o archivo).</li></ul>
    <div class="fila mt"><button class="btn p" id="rIni">${r.doc.nombre ? "Continuar mi registro" : "Comenzar registro"}</button><button class="btn" id="bRes">${ic("subir")} Tengo un respaldo</button>${gClientId() ? `<button class="btn" id="bResD">${ic("subir")} Recuperar de mi Drive</button>` : ""}<input type="file" id="fRes" accept=".json,application/json" hidden></div></div></main>`;
  const cab = `<main class="wrap">${pasosHTML(p)}${avisoFalta(p)}`;
  if (p === 1) { const d = r.doc; if (!d.nombre && YO && YO.nombre && !YO.sup) { d.nombre = YO.nombre.replace(/^(Profr?a?\.|Mtr[oa]\.|Lic\.)\s*/i, ""); d.trato = (YO.nombre.match(/^(Profr?a?\.|Mtr[oa]\.|Lic\.)/i) || [""])[0]; }
    return cab + `<section class="card mt"><h3>Sus datos</h3><p class="small muted mb">Aparecen en sus planeaciones, listas y evaluaciones.</p>
     <div class="dos"><label class="campo"><span>Tratamiento</span><select id="dTr">${["", "Profr.", "Profra.", "Mtro.", "Mtra.", "Lic."].map(x => `<option ${x === d.trato ? "selected" : ""}>${x}</option>`).join("")}</select></label>${campo("Nombre completo *", "dNom", d.nombre, 'autocomplete="name"')}</div>
     <div class="dos">${campo("Correo institucional *", "dCor", d.correo, 'type="email" inputmode="email" placeholder="nombre@bcedu.mx"')}${campo("Celular (10 dígitos) *", "dTel", d.tel, 'inputmode="tel" placeholder="616 123 4567"')}</div>
     ${campo("Correo de Google (Gmail) *", "dGm", d.gmail, 'type="email" inputmode="email" placeholder="nombre@gmail.com"')}<p class="small muted" style="margin-top:-6px">Con esta cuenta enviará sus reportes desde su propio correo y respaldará todo en su Google Drive. Puede ser el mismo institucional si es de Google.</p></section></main>` + navR(1); }
  if (p === 2) return cab + `<section class="card mt"><h3>¿Cuántas escuelas atiende?</h3><div class="chips mt">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<button class="chip" data-ne="${n}" aria-pressed="${r.escs.length === n}">${n}</button>`).join("")}</div></section>
    ${r.escs.map((e, i) => `<section class="card mt" data-esc="${e.id}"><h3>Escuela ${i + 1}${e.nombre ? " · " + esc(e.nombre) : ""}</h3>
     <label class="campo"><span>Buscar en las escuelas de la Zona 050 (o escriba los datos)</span><input data-bus="${e.id}" list="dl050r" placeholder="Nombre o C.C.T."></label>
     <div class="dos">${campo("Nombre de la escuela *", "eN" + i, e.nombre)}${campo("C.C.T. *", "eC" + i, e.cct, 'style="text-transform:uppercase" maxlength="10" placeholder="02DPR0000X"')}</div>
     <div class="dos"><label class="campo"><span>Turno *</span><select id="eT${i}">${["", "Matutino", "Vespertino", "Tiempo completo"].map(x => `<option ${x === e.turno ? "selected" : ""}>${x}</option>`).join("")}</select></label>${campo("Zona escolar (número o clave) *", "eZ" + i, e.zona, 'inputmode="text" autocapitalize="characters" maxlength="30" placeholder="Ej. 050 o 02FIZ0050O"')}</div>
     ${campo("Localidad", "eL" + i, e.localidad)}
     <span style="font-size:14px;font-weight:700;color:var(--gris)">Días que asiste a esta escuela *</span>${diasChips("e" + i, e.dias)}
     <div class="dos"><label class="campo"><span>Tratamiento</span><select id="eDT${i}">${["Mtro.", "Mtra.", "Profr.", "Profra.", "Lic."].map(x => `<option ${x === e.dirTrato ? "selected" : ""}>${x}</option>`).join("")}</select></label>${campo("Director(a) o encargado(a) *", "eD" + i, e.director)}</div>
     ${campo("Correo de la escuela o de la dirección *", "eM" + i, e.correo, 'type="email" inputmode="email"')}
     <div class="dos">${campo("Supervisor(a) de Educación Física *", "eS" + i, e.supEF, 'placeholder="Mtro. …"')}${campo("Correo del supervisor(a) de E. F. *", "eSC" + i, e.supCorreo, 'type="email" inputmode="email"')}</div>
     <div class="dos">${campo("¿Cuántos grupos atiende aquí? *", "eG" + i, e.nGrupos, 'type="number" min="1" max="30" inputmode="numeric"')}
      <label class="campo"><span>Logo de la escuela (opcional)</span><span class="fila">${e.logo ? `<img src="${e.logo}" alt="" style="height:44px;border-radius:8px">` : ""}<button type="button" class="btn s" data-logo="${e.id}">${ic("subir", 16)} ${e.logo ? "Cambiar" : "Subir"}</button></span></label></div></section>`).join("")}
    <datalist id="dl050r">${ESCUELAS_050.map(x => `<option value="${esc(x[0])} · ${x[1]}">`).join("")}</datalist><input type="file" id="fLogo" accept="image/*" hidden></main>` + navR(2);
  if (p === 3) { const sinEsc = r.grupos.filter(g => !r.escs.some(e => e.id === g.escId));
    return cab + `<section class="card mt"><h3>Suba todas sus listas de alumnos</h3><p class="small muted mb">Elija <b>todas a la vez</b>: PDF de RELweb (lista de asistencia o reporte de inscripción) o fotos de las listas. Ulama reconoce la escuela por su C.C.T. y el grado y grupo de cada una. Después revise lo que encontró.</p>
     <div class="fila"><button class="btn p" id="rLis">${ic("subir", 18)} Elegir mis listas</button><button class="btn" id="rFoto">${ic("camara", 18)} Tomar foto</button><button class="btn" id="rMano">${ic("mas", 18)} Escribir una a mano</button></div>
     <input type="file" id="fLisR" accept="application/pdf,image/*" multiple hidden><input type="file" id="fFotoR" accept="image/*" capture="environment" hidden></section>
    ${r.escs.map(e => { const gs = r.grupos.filter(g => g.escId === e.id).sort((a, b) => (a.grado - b.grado) || String(a.grupo).localeCompare(b.grupo)), ok = gs.filter(g => g.grado && g.grupo).length;
      return `<h2 class="sec-t">${esc(e.nombre || "Escuela")}<small>${ok} de ${e.nGrupos || "?"} grupos ${ok >= +e.nGrupos && +e.nGrupos ? "✓" : ""}</small></h2><div class="lista">${gs.map(grupoRHTML).join("") || `<div class="vacio">Aún no hay listas de esta escuela.</div>`}</div>`; }).join("")}
    ${sinEsc.length ? `<h2 class="sec-t">Sin escuela asignada<small>Elija a qué escuela pertenece cada lista</small></h2><div class="lista">${sinEsc.map(grupoRHTML).join("")}</div>` : ""}</main>` + navR(3); }
  if (p === 4) return cab + `<p class="small muted mt">Escriba el docente titular de cada grupo y su correo: a ese correo le enviará la evaluación de su grupo.</p>
    ${r.escs.map(e => `<h2 class="sec-t">${esc(e.nombre)}</h2>${r.grupos.filter(g => g.escId === e.id).sort((a, b) => (a.grado - b.grado) || String(a.grupo).localeCompare(b.grupo)).map(g => `<section class="card" style="margin-bottom:10px"><h3>${g.grado}.° ${esc(g.grupo)} <small class="muted" style="font-family:var(--body);font-size:14px">· ${g.alumnos.length} alumnos</small></h3>
      <div class="dos">${campo("Docente del grupo *", "gD" + g.id, g.docente, 'placeholder="Mtra. …"')}${campo("Correo del docente *", "gC" + g.id, g.correo, 'type="email" inputmode="email"')}</div></section>`).join("")}`).join("")}</main>` + navR(4);
  if (p === 5) return cab + `<p class="small muted mt">Suba su horario de cada escuela y marque cuándo le da clase a cada grupo: con eso Ulama arma su agenda y las fechas de sus planeaciones.</p>
    ${r.escs.map(e => `<section class="card mt"><h3>${esc(e.nombre)}</h3><div class="fila mb">${e.horario ? `<img src="${e.horario}" alt="Horario" style="max-height:90px;border-radius:10px;border:1px solid var(--hilo)"><span class="tag">${esc(e.horarioNombre || "Horario")}</span>` : `<span class="tag r">Falta el horario</span>`}
      <button class="btn s ${e.horario ? "" : "p"}" data-hor="${e.id}">${ic("subir", 16)} ${e.horario ? "Cambiar" : "Subir foto o archivo del horario *"}</button></div>
      ${r.grupos.filter(g => g.escId === e.id).sort((a, b) => (a.grado - b.grado) || String(a.grupo).localeCompare(b.grupo)).map(g => `<div style="border-top:1px solid var(--hilo2);padding-top:10px;margin-top:6px"><b>${g.grado}.° ${esc(g.grupo)}</b>
        <div class="dos" style="align-items:end"><div><span style="font-size:14px;font-weight:700;color:var(--gris)">Días de E. F. *</span>${diasChips("g" + g.id, g.dias)}</div>${campo("Hora *", "gH" + g.id, g.hora, 'placeholder="8:00 a 8:50"')}</div></div>`).join("")}</section>`).join("")}
    <input type="file" id="fHor" accept="application/pdf,image/*" hidden></main>` + navR(5);
  /* revisión */
  const F = faltaR(), tot = r.grupos.reduce((t, g) => t + g.alumnos.length, 0);
  return cab + `<section class="card mt">${F.length ? `<div class="aviso" style="background:var(--rojo-s);border-color:#E8C3BE;color:var(--rojo)"><span><b>Faltan ${F.length} datos para tener completa su plataforma.</b> Toque cada uno para ir a llenarlo.</span></div>
     <div class="lista mt">${F.map(x => `<button class="it btnit" data-ir="${x.p}"><span class="av" style="background:var(--rojo-s);color:var(--rojo)">!</span><span class="tx"><b>${esc(x.t)}</b><small>Paso ${x.p} · ${PASOS_R[x.p]}</small></span></button>`).join("")}</div>`
    : `<div class="aviso v">${ic("check", 18)}<span><b>¡Todo completo!</b> Revise el resumen y toque «Terminar registro».</span></div>`}</section>
   <section class="card mt"><h3>${esc([r.doc.trato, r.doc.nombre].filter(Boolean).join(" "))}</h3><p class="small muted">${esc(r.doc.correo)} · Gmail: ${esc(r.doc.gmail)} · ${esc(r.doc.tel)}</p>
    ${r.escs.map(e => `<div style="border-top:1px solid var(--hilo2);margin-top:10px;padding-top:10px"><b>${esc(e.nombre)}</b> <span class="small muted">${esc(e.cct)} · ${esc(e.turno)} · Zona ${esc(e.zona)} · ${e.dias.map(d => DSEM[d]).join(", ")}</span>
     <p class="small">Dirección: ${esc([e.dirTrato, e.director].join(" "))} · ${esc(e.correo)}<br>Supervisor(a) de E. F.: ${esc(e.supEF)} · ${esc(e.supCorreo)}</p>
     <p class="small muted">${r.grupos.filter(g => g.escId === e.id).sort((a, b) => (a.grado - b.grado) || String(a.grupo).localeCompare(b.grupo)).map(g => `${g.grado}.° ${esc(g.grupo)} (${g.alumnos.length}) ${g.dias.map(d => DSEM[d]).join("/")} ${esc(g.hora)}`).join(" · ")}</p></div>`).join("")}
    <p class="mt"><b>${r.escs.length}</b> escuelas · <b>${r.grupos.length}</b> grupos · <b>${tot}</b> alumnos</p></section></main>` + navR(6, `${ic("check", 18)} Terminar registro`); };
function grupoRHTML(g) { const r = REG();
  return `<div class="it" style="flex-wrap:wrap"><span class="av">${g.grado && g.grupo ? `${g.grado}°${esc(g.grupo)}` : "?"}</span><span class="tx" style="min-width:160px"><b>${g.alumnos.length} alumnos</b><small>${esc(g.fuente)}</small></span>
   <select data-ge="${g.id}" style="min-height:40px;border:1px solid var(--hilo);border-radius:10px;max-width:170px"><option value="">Escuela…</option>${r.escs.map(e => `<option value="${e.id}" ${e.id === g.escId ? "selected" : ""}>${esc(e.nombre || e.cct)}</option>`).join("")}</select>
   <select data-gg="${g.id}" style="min-height:40px;border:1px solid var(--hilo);border-radius:10px"><option value="">Grado</option>${[1, 2, 3, 4, 5, 6].map(n => `<option ${n === g.grado ? "selected" : ""}>${n}</option>`).join("")}</select>
   <input data-gp="${g.id}" value="${esc(g.grupo)}" placeholder="Grupo" maxlength="3" style="width:64px;min-height:40px;border:1px solid var(--hilo);border-radius:10px;padding:0 8px;text-transform:uppercase">
   <button class="btn s" data-gv="${g.id}">Nombres</button><button class="btn s r" data-gq="${g.id}" aria-label="Quitar">${ic("basura", 16)}</button></div>`; }

/* ---------- lectura de todas las listas a la vez ---------- */
async function leerListasR(files) { const r = REG(); if (!files.length) return; progreso("Preparando…"); let ok = 0, sin = 0;
  for (const [i, f] of files.entries()) { progAct(`Lista ${i + 1} de ${files.length}: ${f.name}`, (i / files.length) * 100);
    let x; try { x = await leerArchivo(f); } catch (e) { x = { alumnos: [] }; }
    if (!x.alumnos.length) { sin++; continue; }
    let e = x.cct && r.escs.find(y => y.cct === x.cct);
    if (!e && x.escuela) e = r.escs.find(y => y.nombre && y.nombre.toLowerCase().replace(/\s+/g, " ") === x.escuela.toLowerCase().replace(/\s+/g, " "));
    if (!e && r.escs.length === 1) e = r.escs[0];
    const grado = +x.grado || "", grupo = String(x.grupo || "").toUpperCase();
    const prev = e && grado && grupo && r.grupos.find(g => g.escId === e.id && g.grado === grado && g.grupo === grupo);
    const alumnos = x.alumnos.map(a => ({ id: uid(), nombre: a.nombre, curp: a.curp || "", alta: CICLO.inicio }));
    if (prev) { const ya = new Set(prev.alumnos.map(a => a.nombre.toLowerCase())); alumnos.forEach(a => { if (!ya.has(a.nombre.toLowerCase())) prev.alumnos.push(a); }); }
    else r.grupos.push({ id: uid(), escId: e ? e.id : "", grado, grupo, docente: x.docente ? titulo(x.docente) : "", correo: "", dias: e ? e.dias.slice() : [], hora: "", alumnos, fuente: f.name });
    if (e && !e.turno && x.turno) e.turno = x.turno; ok++; }
  guardarReg(); cerrarDlg(); pintar();
  toast(`${ok} listas leídas${sin ? ` · ${sin} sin nombres reconocibles (tome la foto más cerca y con buena luz, o escríbala a mano)` : ""}.`, 5000); }

/* ---------- enlazar ---------- */
ENLAZAR.registro = () => { const r = REG(), p = r.paso, re = () => { const y = window.scrollY; pintar(); window.scrollTo(0, y); };
  const ir = n => { r.paso = n; S.verFalta = false; guardarReg(); pintar(); window.scrollTo(0, 0); };
  if (p === 0) { $("#rIni").onclick = () => ir(r.doc.nombre ? Math.max(1, r.ultimo || 1) : 1); $("#bRes").onclick = () => $("#fRes").click(); $("#fRes").onchange = ev => restaurar(ev.target.files[0]); $("#bResD") && ($("#bResD").onclick = driveElegirRespaldo); return; }
  const lee = () => {
    if (p === 1) Object.assign(r.doc, { trato: val("dTr"), nombre: val("dNom").trim(), correo: val("dCor").trim().toLowerCase(), gmail: val("dGm").trim().toLowerCase(), tel: val("dTel").trim() });
    if (p === 2) r.escs.forEach((e, i) => Object.assign(e, { nombre: val("eN" + i).trim(), cct: val("eC" + i).trim().toUpperCase(), turno: val("eT" + i), zona: val("eZ" + i).trim(), localidad: val("eL" + i).trim(),
      dirTrato: val("eDT" + i), director: val("eD" + i).trim(), correo: val("eM" + i).trim().toLowerCase(), supEF: val("eS" + i).trim(), supCorreo: val("eSC" + i).trim().toLowerCase(), nGrupos: val("eG" + i) }));
    if (p === 3) r.grupos.forEach(g => { const s = document.querySelector(`[data-gp="${g.id}"]`); if (s) g.grupo = s.value.trim().toUpperCase(); });
    if (p === 4) r.grupos.forEach(g => { if (document.getElementById("gD" + g.id)) { g.docente = val("gD" + g.id).trim(); g.correo = val("gC" + g.id).trim().toLowerCase(); } });
    if (p === 5) r.grupos.forEach(g => { if (document.getElementById("gH" + g.id)) g.hora = val("gH" + g.id).trim(); });
    guardarReg(); };
  $$("#app input, #app select").forEach(i => i.addEventListener("change", lee));
  $("#rAtr") && ($("#rAtr").onclick = () => { lee(); ir(p - 1); });
  $("#rSig").onclick = () => { lee(); if (p < 6) { if (faltaR(p).length) { S.verFalta = true; re(); window.scrollTo(0, 0); return; } r.ultimo = p + 1; ir(p + 1); } else terminarRegistro(); };
  $$("[data-dd]").forEach(b => b.onclick = () => { lee(); const k = b.dataset.dd, d = +b.dataset.d, o = k[0] === "e" ? r.escs[+k.slice(1)] : r.grupos.find(g => g.id === k.slice(1));
    o.dias = o.dias.includes(d) ? o.dias.filter(x => x !== d) : [...o.dias, d].sort(); guardarReg(); re(); });
  if (p === 2) {
    $$("[data-ne]").forEach(b => b.onclick = () => { lee(); const n = +b.dataset.ne; while (r.escs.length < n) r.escs.push(nuevaEscR());
      if (r.escs.length > n) { r.escs = r.escs.slice(0, n); r.grupos = r.grupos.filter(g => r.escs.some(e => e.id === g.escId) || !g.escId); } guardarReg(); re(); });
    $$("[data-bus]").forEach(inp => inp.onchange = () => { lee(); const cct = (inp.value.match(/02[A-Z]{3}\d{4}[A-Z]/) || [])[0], x = ESCUELAS_050.find(y => y[1] === cct), e = r.escs.find(y => y.id === inp.dataset.bus); if (!x || !e) return;
      Object.assign(e, { nombre: x[0], cct: x[1], zona: "050", localidad: x[3], director: x[5], dirTrato: /^(Cecilia|Adriana|Citlali|Lorena)\b/.test(x[5]) ? "Mtra." : "Mtro." }); guardarReg(); re(); });
    $$("[data-logo]").forEach(b => b.onclick = () => { lee(); S.logoEsc = b.dataset.logo; $("#fLogo").click(); });
    $("#fLogo").onchange = async ev => { const f = ev.target.files[0]; ev.target.value = ""; if (!f) return; try { r.escs.find(e => e.id === S.logoEsc).logo = await aImagen(f, 360, .85); guardarReg(); re(); } catch (e) { toast("No se pudo leer la imagen."); } }; }
  if (p === 3) {
    $("#rLis").onclick = () => $("#fLisR").click(); $("#rFoto").onclick = () => $("#fFotoR").click();
    $("#fLisR").onchange = $("#fFotoR").onchange = ev => { const fs = [...ev.target.files]; ev.target.value = ""; leerListasR(fs); };
    $("#rMano").onclick = () => { const g = { id: uid(), escId: r.escs.length === 1 ? r.escs[0].id : "", grado: "", grupo: "", docente: "", correo: "", dias: r.escs.length === 1 ? r.escs[0].dias.slice() : [], hora: "", alumnos: [], fuente: "Escrita a mano" }; r.grupos.push(g); guardarReg(); editarNombresR(g); };
    $$("[data-ge]").forEach(s => s.onchange = () => { const g = r.grupos.find(x => x.id === s.dataset.ge), e = r.escs.find(x => x.id === s.value); g.escId = s.value; if (e && !g.dias.length) g.dias = e.dias.slice(); guardarReg(); re(); });
    $$("[data-gg]").forEach(s => s.onchange = () => { r.grupos.find(x => x.id === s.dataset.gg).grado = +s.value || ""; guardarReg(); re(); });
    $$("[data-gp]").forEach(s => s.onchange = () => { r.grupos.find(x => x.id === s.dataset.gp).grupo = s.value.trim().toUpperCase(); guardarReg(); re(); });
    $$("[data-gq]").forEach(b => b.onclick = () => { r.grupos = r.grupos.filter(x => x.id !== b.dataset.gq); guardarReg(); re(); });
    $$("[data-gv]").forEach(b => b.onclick = () => editarNombresR(r.grupos.find(x => x.id === b.dataset.gv))); }
  if (p === 5) { $$("[data-hor]").forEach(b => b.onclick = () => { lee(); S.horEsc = b.dataset.hor; $("#fHor").click(); });
    $("#fHor").onchange = async ev => { const f = ev.target.files[0]; ev.target.value = ""; if (!f) return; const e = r.escs.find(x => x.id === S.horEsc);
      try { toast("Procesando el horario…"); e.horario = await aImagen(f, 1200, .62); e.horarioNombre = f.name; guardarReg(); re(); toast("Horario guardado."); } catch (er) { toast("No se pudo leer ese archivo. Pruebe con una foto o un PDF."); } }; }
  if (p === 6) $$("[data-ir]").forEach(b => b.onclick = () => { ir(+b.dataset.ir); S.verFalta = true; pintar(); }); };
function editarNombresR(g) { dlg(`<h3>Alumnos${g.grado ? ` de ${g.grado}.° ${esc(g.grupo)}` : ""}</h3><p class="small muted mb">Un alumno por renglón. Corrija lo que haga falta.</p>
  <label class="campo"><span>${g.alumnos.length} alumnos</span><textarea id="nR" style="min-height:300px">${esc(g.alumnos.map(a => a.nombre).join("\n"))}</textarea></label>
  <div class="fila fin"><button class="btn" id="nX">Cerrar</button><button class="btn p" id="nOk">Guardar</button></div>`, v => {
  v.querySelector("#nX").onclick = () => { cerrarDlg(); pintar(); };
  v.querySelector("#nOk").onclick = () => { const prev = new Map(g.alumnos.map(a => [a.nombre, a])); g.alumnos = val("nR").split("\n").map(l => l.trim()).filter(Boolean).map(n => prev.get(n) || { id: uid(), nombre: n, curp: "", alta: CICLO.inicio }); guardarReg(); cerrarDlg(); pintar(); }; }); }

/* ---------- terminar: la plataforma queda lista y se envía copia a la Supervisión ---------- */
function terminarRegistro() { const r = REG(); if (faltaR().length) { pintar(); return; }
  D.docente = { trato: r.doc.trato, nombre: r.doc.nombre, correo: r.doc.correo, tel: r.doc.tel };
  D.cfg.gmail = r.doc.gmail;
  const viejas = new Set(D.escuelas.map(e => e.cct));
  r.escs.forEach(e => { const x = { id: e.id, nombre: e.nombre, cct: e.cct, turno: e.turno, zona: e.zona, localidad: e.localidad, dias: e.dias, dirTrato: e.dirTrato, director: e.director, correo: e.correo, supEF: e.supEF, supCorreo: e.supCorreo, logo: e.logo, horario: e.horario, horarioNombre: e.horarioNombre };
    const i = D.escuelas.findIndex(y => y.id === e.id || y.cct === e.cct); if (i >= 0) D.escuelas[i] = Object.assign(D.escuelas[i], x); else D.escuelas.push(x); });
  r.grupos.forEach(g => { const x = { id: g.id, escId: g.escId, grado: g.grado, grupo: g.grupo, docente: g.docente, correo: g.correo, dias: g.dias, horario: g.hora, alumnos: g.alumnos };
    const i = D.grupos.findIndex(y => y.id === g.id || (y.escId === g.escId && y.grado === g.grado && y.grupo === g.grupo)); if (i >= 0) D.grupos[i] = Object.assign(D.grupos[i], x); else D.grupos.push(x); });
  D.cfg.bienvenida = true; D.cfg.registro = { fecha: new Date().toISOString(), enviado: false }; delete D.reg; guardar();
  S = { v: "registroListo" }; pintar(); enviarRegistro(true); }
VISTAS.registroListo = () => { const R = D.cfg.registro || {}, tot = D.grupos.reduce((t, g) => t + activos(g).length, 0);
  return `<main class="wrap"><section class="portada"><div class="marca"><img src="img/ulama-icono.svg" alt=""><div class="eb">Registro terminado</div></div><h1>¡Su plataforma está lista!</h1>
   <p>${D.escuelas.length} escuelas · ${D.grupos.length} grupos · ${tot} alumnos. Ya puede planear, pasar lista y evaluar.</p><div class="fila"><button class="btn m" id="rgIni">Entrar a Ulama</button></div></section>
   <section class="card mt"><h3>Copia para la Supervisión</h3><div id="rgEst">${R.enviado ? `<div class="aviso v">${ic("check", 18)}<span>Se envió una copia de su registro a la Supervisión.</span></div>` : `<p class="small muted">Enviando una copia de su registro…</p>`}</div></section>
   <section class="card mt"><h3>Siguiente paso: su cuenta de Google</h3><p class="small muted mb">Conéctela para enviar reportes desde su correo (${esc(D.cfg.gmail || "")}) y respaldar todo en su Drive. Si Google no lo deja, espere a que la Supervisión active su correo.</p><button class="btn" id="rgG">${ic("correo", 18)} Ir a Ajustes</button></section></main>`; };
ENLAZAR.registroListo = () => { $("#rgIni").onclick = () => { S = { v: "inicio" }; pintar(); }; $("#rgG").onclick = () => { S = { v: "ajustes" }; pintar(); }; };
async function enviarRegistro(auto) { const el = () => $("#rgEst"), R = D.cfg.registro || (D.cfg.registro = {}), tot = D.grupos.reduce((t, g) => t + activos(g).length, 0);
  const resumen = `Registro de Ulama · ${docNombre()}\nCorreo: ${D.docente.correo} · Gmail: ${D.cfg.gmail || "—"} · Cel. ${D.docente.tel}\n` + D.escuelas.map(e => `${e.nombre} (${e.cct}, zona ${e.zona}): ${gruposDe(e.id).map(grNom).join(", ")}`).join("\n") + `\nTotal: ${D.grupos.length} grupos, ${tot} alumnos.`;
  try { await postServidorR({ accion: "ulamaRegistro", registro: JSON.parse(JSON.stringify(Object.assign({}, D, { libreta: undefined }), (k, v) => k === "reg" ? undefined : v)), resumen });
    R.enviado = true; R.via = "servidor"; guardar(true); if (el()) el().innerHTML = `<div class="aviso v">${ic("check", 18)}<span>Se envió una copia de su registro a la Supervisión.</span></div>`; }
  catch (e) { if (el()) el().innerHTML = `<p class="small muted mb">No se pudo enviar automáticamente. Descargue su archivo de registro y mándelo a la Supervisión por WhatsApp (también le sirve como respaldo).</p>
     <div class="fila"><button class="btn p" id="rgDes">${ic("bajar", 18)} Descargar mi registro</button><a class="btn" id="rgWa" href="https://wa.me/${WA_SUP}?text=${encodeURIComponent(resumen + "\n\n(Adjunto mi archivo de registro de Ulama.)")}" target="_blank" rel="noopener">WhatsApp a la Supervisión</a></div>`;
    $("#rgDes") && ($("#rgDes").onclick = () => { const b = new Blob([JSON.stringify(Object.assign({}, D, { libreta: undefined }))], { type: "application/json" }), a = document.createElement("a"); a.href = URL.createObjectURL(b);
      a.download = `ulama-registro-${(D.docente.nombre || "maestro").toLowerCase().normalize("NFD").replace(/[^\w]+/g, "-").replace(/-+$/, "")}.json`; a.click(); R.enviado = "archivo"; guardar(true); }); } }
async function postServidorR(datos) { const s = await servidor(), tok = tokAcceso(); if (!tok) throw new Error("sin-enlace"); if (navigator.onLine === false) throw new Error("sin-red");
  const r = await fetch(s, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion: datos.accion, datos: Object.assign({ tok }, datos) }) });
  const j = await r.json(); if (!j || !j.ok) throw new Error((j && (j.mensaje || j.error)) || "El servidor no respondió."); return j; }
