/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Tlamatini Aula · Expediente del alumno (opcional, para todos los niveles).
   Mínimo: acta de nacimiento y CURP. Extras: boleta del ciclo anterior, formato de datos personales, personas autorizadas para
   recogerlo, comprobante de domicilio, cartilla de vacunación, constancia médica, identificación del tutor, etc.
   El docente marca lo entregado y, si quiere, guarda la foto o el PDF del documento. Todo se queda en el dispositivo;
   nunca se incluye en los códigos de visita. */
"use strict";
const EXP_DOCS = [
  ["acta", "Acta de nacimiento", 1], ["curp", "CURP", 1],
  ["boleta", "Boleta o reporte de evaluación del ciclo anterior", 0], ["datos", "Formato de datos personales", 0], ["recoge", "Personas autorizadas para recogerlo", 0],
  ["domicilio", "Comprobante de domicilio", 0], ["vacunas", "Cartilla de vacunación", 0], ["salud", "Certificado o constancia médica", 0], ["tutorId", "Identificación oficial de la madre, padre o tutor", 0],
  ["constPre", "Constancia de preescolar (ingreso a 1.° de primaria)", 0, g => !esSec(g) && !esPre(g)], ["certPrim", "Certificado de primaria (ingreso a secundaria)", 0, g => esSec(g)],
  ["fotos", "Fotografías", 0], ["inscripcion", "Solicitud o ficha de inscripción", 0]];
const EXP_SANG = ["", "O+", "O−", "A+", "A−", "B+", "B−", "AB+", "AB−", "No sabe"];
const EXP_SERV = ["", "IMSS", "ISSSTE", "IMSS-Bienestar", "Seguro popular / ninguno", "Privado", "Otro"];
const expDocsDe = g => EXP_DOCS.filter(d => !d[3] || d[3](g));
function expDe(a) { const x = a.exp = a.exp || {}; x.docs = x.docs || {}; x.dat = x.dat || {}; x.rec = x.rec || []; x.otros = x.otros || [];
  if (a.curp && !x.dat.curp) x.dat.curp = a.curp; return x; }
/* «datos» y «recoge» se dan por entregados cuando el formato está lleno en la app */
const expTiene = (a, k) => { const x = expDe(a); if (k === "datos") return !!(x.docs.datos && x.docs.datos.ok) || !!(x.dat.tutor && x.dat.tel); if (k === "recoge") return !!(x.docs.recoge && x.docs.recoge.ok) || x.rec.length > 0; return !!(x.docs[k] && x.docs[k].ok); };
const expMin = a => expTiene(a, "acta") && expTiene(a, "curp") && /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z\d]\d$/.test(String(expDe(a).dat.curp || "").toUpperCase());
function expCuenta(g, a) { const L = expDocsDe(g); return { n: L.filter(d => expTiene(a, d[0])).length + expDe(a).otros.filter(o => o.ok).length, t: L.length + expDe(a).otros.length, min: expMin(a) }; }

/* ---------- tarjeta en la ficha del alumno ---------- */
function expTarjeta(g, a) { const c = expCuenta(g, a), x = expDe(a);
  return `<h2 class="sec-t">Expediente<small>Opcional · solo en este dispositivo</small></h2><section class="card" style="border-left:5px solid ${c.min ? "var(--jade)" : "var(--maiz)"}">
   <p class="small"><b>${c.n} de ${c.t} documentos</b> · ${c.min ? "Tiene lo mínimo (acta y CURP)." : `<span style="color:var(--rojo)">Falta lo mínimo: ${[!expTiene(a, "acta") ? "acta de nacimiento" : "", !expTiene(a, "curp") || !x.dat.curp ? "CURP" : ""].filter(Boolean).join(" y ") || "revisar la CURP"}</span>`}${x.dat.curp ? `<br>CURP: ${esc(x.dat.curp)}` : ""}</p>
   <button class="btn s mt" id="expAb">${ic("doc", 15)} Abrir expediente</button></section>`; }
function expEnlazar(g, a) { const b = $("#expAb"); if (b) b.onclick = () => ir("expAlumno", { gid: g.id, id: a.id }); }

/* ---------- expediente de un alumno ---------- */
VISTAS.expAlumno = () => { const g = grDe(S.gid), a = g && g.alumnos.find(x => x.id === S.id); if (!a) return VISTAS.inicio(); const x = expDe(a), d = x.dat, tab = S.xt || "docs", c = expCuenta(g, a);
  let cuerpo = "";
  if (tab === "docs") cuerpo = `<section class="card mt"><p class="small">Marque lo que la familia ya entregó. Si quiere, tome una foto o suba el PDF de cada documento para tenerlo a la mano. <b>Lo mínimo: acta de nacimiento y CURP.</b></p></section>
    <div class="lista mt">${expDocsDe(g).map(([k, t, min]) => { const o = x.docs[k] || {}, ok = expTiene(a, k), auto = (k === "datos" || k === "recoge") && ok && !o.ok;
      return `<div class="it" style="align-items:flex-start"><button class="btn s" data-xok="${k}" aria-label="Entregado" style="min-width:42px;${ok ? "background:var(--jade);color:#fff;border-color:var(--jade)" : ""}">${ok ? ic("check", 16) : "&nbsp;"}</button>
       <span class="tx"><b>${esc(t)}${min ? ' <span class="tag m">Mínimo</span>' : ""}</b><small>${ok ? (o.f ? "Entregado el " + fCorta(o.f) : auto ? "Capturado en la app" : "Entregado") : "Pendiente"}${(o.img || []).length ? ` · ${o.img.length} archivo${o.img.length > 1 ? "s" : ""}` : ""}${o.nota ? " · " + esc(o.nota) : ""}</small>
       <span class="fila" style="gap:6px;margin-top:6px">${(o.img || []).map((id, i) => `<button class="btn s" data-xver="${k}|${id}">${ic("doc", 13)} Ver ${i + 1}</button>`).join("")}<button class="btn s" data-xsub="${k}">${ic("camara", 13)} Foto o PDF</button><button class="btn s" data-xnota="${k}">${ic("lapiz", 13)} Nota</button>${k === "datos" ? `<button class="btn s" data-xt="datos">Llenar formato</button>` : k === "recoge" ? `<button class="btn s" data-xt="recoge">Llenar lista</button>` : ""}</span></span></div>`; }).join("")}
     ${x.otros.map(o => `<div class="it"><button class="btn s" data-xoo="${o.id}" style="min-width:42px;${o.ok ? "background:var(--jade);color:#fff;border-color:var(--jade)" : ""}">${o.ok ? ic("check", 16) : "&nbsp;"}</button><span class="tx"><b>${esc(o.t)}</b><small>${o.ok ? "Entregado" : "Pendiente"}${(o.img || []).length ? " · " + o.img.length + " archivo(s)" : ""}</small><span class="fila" style="gap:6px;margin-top:6px">${(o.img || []).map((id, i) => `<button class="btn s" data-xver="o:${o.id}|${id}">Ver ${i + 1}</button>`).join("")}<button class="btn s" data-xsub="o:${o.id}">${ic("camara", 13)} Foto o PDF</button><button class="btn s r" data-xob="${o.id}">${ic("basura", 13)}</button></span></span></div>`).join("")}</div>
    <button class="btn s mt" id="xOtro">${ic("mas", 14)} Otro documento</button><input type="file" id="xFile" accept="image/*,application/pdf" hidden>`;
  else if (tab === "datos") cuerpo = `<section class="card mt"><h3>Datos del alumno</h3>
     <div class="dos"><label class="campo"><span>CURP</span><input data-xd="curp" value="${esc(d.curp || "")}" maxlength="18" style="text-transform:uppercase"></label><label class="campo"><span>Fecha de nacimiento</span><input data-xd="nac" type="date" value="${esc(d.nac || "")}"></label></div>
     <div class="dos"><label class="campo"><span>Sexo</span><select class="sel" data-xd="sexo">${["", "Mujer", "Hombre"].map(o => `<option ${d.sexo === o ? "selected" : ""}>${o}</option>`).join("")}</select></label><label class="campo"><span>Lugar de nacimiento</span><input data-xd="lugar" value="${esc(d.lugar || "")}"></label></div>
     <label class="campo"><span>Domicilio</span><input data-xd="dom" value="${esc(d.dom || "")}"></label>
     <div class="dos"><label class="campo"><span>Lengua materna</span><input data-xd="lengua" value="${esc(d.lengua || "")}" placeholder="Español, mixteco, triqui…"></label><label class="campo"><span>Tipo de sangre</span><select class="sel" data-xd="sangre">${EXP_SANG.map(o => `<option ${d.sangre === o ? "selected" : ""}>${o}</option>`).join("")}</select></label></div>
     <div class="dos"><label class="campo"><span>Servicio médico</span><select class="sel" data-xd="serv">${EXP_SERV.map(o => `<option ${d.serv === o ? "selected" : ""}>${o}</option>`).join("")}</select></label><label class="campo"><span>Alergias o datos de salud importantes</span><input data-xd="alerg" value="${esc(d.alerg || "")}"></label></div></section>
    <section class="card mt"><h3>Madre, padre o tutor</h3>
     <div class="dos"><label class="campo"><span>Nombre</span><input data-xd="tutor" value="${esc(d.tutor || "")}"></label><label class="campo"><span>Parentesco</span><input data-xd="parent" value="${esc(d.parent || "")}" placeholder="Madre, padre, abuela…"></label></div>
     <div class="dos"><label class="campo"><span>Teléfono</span><input data-xd="tel" type="tel" value="${esc(d.tel || "")}"></label><label class="campo"><span>Ocupación</span><input data-xd="ocup" value="${esc(d.ocup || "")}"></label></div>
     <div class="dos"><label class="campo"><span>Segundo contacto (nombre y parentesco)</span><input data-xd="tutor2" value="${esc(d.tutor2 || "")}"></label><label class="campo"><span>Su teléfono</span><input data-xd="tel2" type="tel" value="${esc(d.tel2 || "")}"></label></div>
     <div class="dos"><label class="campo"><span>En caso de emergencia avisar a</span><input data-xd="emerg" value="${esc(d.emerg || "")}"></label><label class="campo"><span>Teléfono de emergencia</span><input data-xd="telE" type="tel" value="${esc(d.telE || "")}"></label></div>
     <p class="small muted">Se guarda mientras escribe.</p><div class="fila mt"><button class="btn s" data-xp="datos">${ic("impr", 15)} Imprimir formato</button><button class="btn s" data-xp="datosV">${ic("impr", 15)} Formato en blanco para la familia</button></div></section>`;
  else if (tab === "recoge") cuerpo = `<section class="card mt"><p class="small">Personas que la familia autoriza para recoger al alumno. Pida una identificación cuando no las conozca.</p><button class="btn p mt" id="xRn">${ic("mas", 15)} Agregar persona</button></section>
    <div class="lista mt">${x.rec.map(r => `<button class="it btnit" data-xr="${r.id}" style="text-align:left"><span class="av">${ic("persona", 18)}</span><span class="tx"><b>${esc(r.n)}</b><small>${esc(r.p || "")}${r.t ? " · " + esc(r.t) : ""}${r.nota ? " · " + esc(r.nota) : ""}</small></span>${ic("lapiz", 15)}</button>`).join("") || `<div class="vacio">Nadie registrado todavía.</div>`}</div>
    <div class="fila mt"><button class="btn s" data-xp="recoge">${ic("impr", 15)} Imprimir con firma del tutor</button></div>`;
  return barra(esc(grNom(g)), "Expediente · " + esc(a.nombre)) + `<main class="wrap">
   <section class="card mt" style="border-left:5px solid ${c.min ? "var(--jade)" : "var(--maiz)"}"><p class="small"><b>${c.n} de ${c.t} documentos</b> · ${c.min ? "Tiene lo mínimo." : "Falta lo mínimo (acta de nacimiento y CURP válida)."}</p><p class="small muted">Solo usted lo ve. No se comparte en los códigos de visita. Inclúyalo en sus respaldos.</p></section>
   <div class="chips mt">${[["docs", "Documentos"], ["datos", "Datos personales"], ["recoge", "Quién lo recoge"]].map(([k, t]) => `<button class="chip" data-xtab="${k}" aria-pressed="${tab === k}">${t}</button>`).join("")}</div>${cuerpo}</main>`; };
ENLAZAR.expAlumno = () => { const g = grDe(S.gid), a = g && g.alumnos.find(x => x.id === S.id); if (!a) return; const x = expDe(a);
  $$("[data-xtab]").forEach(b => b.onclick = () => { S.xt = b.dataset.xtab; re(); }); $$("[data-xt]").forEach(b => b.onclick = () => { S.xt = b.dataset.xt; re(); });
  $$("[data-xok]").forEach(b => b.onclick = () => { const k = b.dataset.xok, o = x.docs[k] = x.docs[k] || {}; if (expTiene(a, k) && !o.ok && (k === "datos" || k === "recoge")) return toast("Ya está capturado en la app.");
    o.ok = !o.ok; o.f = o.ok ? hoy() : ""; if (k === "curp" && o.ok && !x.dat.curp) { S.xt = "datos"; toast("Escriba la CURP en «Datos personales»."); } guardar(); re(); });
  $$("[data-xnota]").forEach(b => b.onclick = () => { const k = b.dataset.xnota, o = x.docs[k] = x.docs[k] || {};
    dlg(`<h3>Nota</h3><label class="campo"><span>${esc((EXP_DOCS.find(d => d[0] === k) || [])[1] || "")}</span><input id="xnT" value="${esc(o.nota || "")}" placeholder="Ej.: entrega el viernes; copia ilegible…"></label><div class="fila fin"><button class="btn" id="xnX">Cancelar</button><button class="btn p" id="xnOk">Guardar</button></div>`, v => { v.querySelector("#xnX").onclick = cerrarDlg; v.querySelector("#xnOk").onclick = () => { o.nota = val("xnT").trim(); guardar(); cerrarDlg(); re(); }; }); });
  let destino = null; const fi = $("#xFile");
  $$("[data-xsub]").forEach(b => b.onclick = () => { destino = b.dataset.xsub; fi && fi.click(); });
  fi && (fi.onchange = async e => { const f = e.target.files[0]; e.target.value = ""; if (!f || !destino) return;
    try { let u; if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) { if (f.size > 6e6) return toast("El PDF es muy grande (más de 6 MB). Tómele foto mejor."); u = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(f); }); } else u = await comprimir(f, 1600, .78);
      const id = "x" + uid(); FOTO[id] = u; await idbOp("readwrite", s => s.put(u, id));
      const o = destino.startsWith("o:") ? x.otros.find(z => z.id === destino.slice(2)) : (x.docs[destino] = x.docs[destino] || {}); o.img = (o.img || []).concat(id); if (!o.ok) { o.ok = true; o.f = hoy(); } guardar(); re(); toast("Archivo guardado en el expediente."); }
    catch (er) { toast("No se pudo guardar el archivo."); } });
  $$("[data-xver]").forEach(b => b.onclick = async () => { const [k, id] = b.dataset.xver.split("|"), u = await fotoGet(id); if (!u) return toast("No se encontró el archivo en este dispositivo.");
    const o = k.startsWith("o:") ? x.otros.find(z => z.id === k.slice(2)) : x.docs[k];
    dlg(`<h3>Documento</h3>${/^data:application\/pdf/.test(u) ? `<p class="small mb">Es un PDF.</p><a class="btn p" href="${u}" download="${esc(a.nombre)} - ${esc(k)}.pdf">${ic("bajar", 15)} Abrir o descargar</a>` : `<img src="${u}" alt="" style="width:100%;max-height:60vh;object-fit:contain;border-radius:12px;background:#111">`}
      <div class="fila fin mt"><button class="btn r" id="xvB" style="margin-right:auto">${ic("basura", 15)} Quitar</button><button class="btn p" id="xvOk">Cerrar</button></div>`, v => { v.querySelector("#xvOk").onclick = cerrarDlg;
      v.querySelector("#xvB").onclick = async () => { if (!(await confirmar("Se quitará este archivo del expediente.", "Quitar"))) return; o.img = (o.img || []).filter(z => z !== id); delete FOTO[id]; idbOp("readwrite", s => s.delete(id)).catch(() => {}); guardar(); re(); }; }); });
  $("#xOtro") && ($("#xOtro").onclick = () => dlg(`<h3>Otro documento</h3><label class="campo"><span>Nombre del documento</span><input id="xoT" placeholder="Ej.: constancia de estudios, carta de cambio…"></label><div class="fila fin"><button class="btn" id="xoX">Cancelar</button><button class="btn p" id="xoOk">Agregar</button></div>`, v => { v.querySelector("#xoX").onclick = cerrarDlg; v.querySelector("#xoOk").onclick = () => { const t = val("xoT").trim(); if (!t) return; x.otros.push({ id: uid(), t, ok: false }); guardar(); cerrarDlg(); re(); }; }));
  $$("[data-xoo]").forEach(b => b.onclick = () => { const o = x.otros.find(z => z.id === b.dataset.xoo); o.ok = !o.ok; guardar(); re(); });
  $$("[data-xob]").forEach(b => b.onclick = async () => { if (!(await confirmar("Se quitará este documento de la lista.", "Quitar"))) return; x.otros = x.otros.filter(z => z.id !== b.dataset.xob); guardar(); re(); });
  $$("[data-xd]").forEach(c => c.oninput = c.onchange = () => { const k = c.dataset.xd; x.dat[k] = k === "curp" ? c.value.trim().toUpperCase() : c.value; if (k === "curp") a.curp = x.dat.curp; clearTimeout(expGu.t); expGu.t = setTimeout(guardar, 400); });
  $("#xRn") && ($("#xRn").onclick = () => expDlgRec(a, {})); $$("[data-xr]").forEach(b => b.onclick = () => expDlgRec(a, x.rec.find(r => r.id === b.dataset.xr)));
  $$("[data-xp]").forEach(b => b.onclick = () => { guardar(); imprimir(expDocHTML(g, a, b.dataset.xp)); }); };
function expGu() {}
function expDlgRec(a, r) { const x = expDe(a), nuevo = !r.id;
  dlg(`<h3>${nuevo ? "Persona autorizada" : "Editar"}</h3><label class="campo"><span>Nombre completo</span><input id="rN" value="${esc(r.n || "")}"></label>
   <div class="dos"><label class="campo"><span>Parentesco</span><input id="rP" value="${esc(r.p || "")}" placeholder="Madre, tío, vecina…"></label><label class="campo"><span>Teléfono</span><input id="rT" type="tel" value="${esc(r.t || "")}"></label></div>
   <label class="campo"><span>Nota <small>· opcional</small></span><input id="rO" value="${esc(r.nota || "")}" placeholder="Ej.: solo los viernes; presenta INE"></label>
   <div class="fila fin">${nuevo ? "" : `<button class="btn r" id="rB" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="rX">Cancelar</button><button class="btn p" id="rOk">Guardar</button></div>`, v => {
    v.querySelector("#rX").onclick = cerrarDlg;
    v.querySelector("#rOk").onclick = () => { const n = val("rN").trim(); if (!n) return toast("Escriba el nombre."); Object.assign(r, { n, p: val("rP").trim(), t: val("rT").trim(), nota: val("rO").trim() }); if (nuevo) { r.id = uid(); x.rec.push(r); } guardar(); cerrarDlg(); re(); };
    v.querySelector("#rB") && (v.querySelector("#rB").onclick = () => { x.rec = x.rec.filter(z => z !== r); guardar(); cerrarDlg(); re(); }); }); }

/* ---------- documentos para imprimir ---------- */
function expDocHTML(g, a, k) { const x = expDe(a), d = k === "datosV" ? {} : x.dat, fila = (l, v) => `<tr><th style="width:32%">${l}</th><td>${esc(v || "")}&nbsp;</td></tr>`, nom = k === "datosV" ? "" : a.nombre, firma = l => `<table class="firmas"><tr><td>${l}</td><td>${esc(D.docente.nombre || yo().nombre)}<br><small>Docente de grupo</small></td></tr></table>`;
  if (k === "recoge") return `<div class="doc">${encabezado(g, "Personas autorizadas para recoger al alumno")}<p><b>Alumna o alumno:</b> ${esc(a.nombre)} · <b>Grado y grupo:</b> ${esc(grNom(g))} · <b>Ciclo escolar:</b> ${expCiclo()}</p>
    <table><tr><th>Nombre completo</th><th>Parentesco</th><th>Teléfono</th><th>Observaciones</th></tr>${x.rec.map(r => `<tr><td>${esc(r.n)}</td><td>${esc(r.p || "")}</td><td>${esc(r.t || "")}</td><td>${esc(r.nota || "")}</td></tr>`).join("")}${Array(Math.max(0, 4 - x.rec.length)).fill(`<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>`).join("")}</table>
    <p class="nota">La escuela entregará al alumno solo a las personas registradas, previa identificación. Cualquier cambio debe informarse por escrito.</p>${firma(`${esc(x.dat.tutor || "")}<br><small>Nombre y firma de la madre, padre o tutor</small>`)}</div>`;
  return `<div class="doc">${encabezado(g, "Formato de datos personales del alumno")}<p><b>Grado y grupo:</b> ${esc(grNom(g))} · <b>Ciclo escolar:</b> ${expCiclo()}</p>
   <h2 style="font-size:12pt">Datos del alumno</h2><table>${fila("Nombre completo", nom)}${fila("CURP", d.curp)}${fila("Fecha de nacimiento", d.nac ? fLarga(d.nac) : "")}${fila("Sexo", d.sexo)}${fila("Lugar de nacimiento", d.lugar)}${fila("Domicilio", d.dom)}${fila("Lengua materna", d.lengua)}${fila("Tipo de sangre", d.sangre)}${fila("Servicio médico", d.serv)}${fila("Alergias o datos de salud importantes", d.alerg)}</table>
   <h2 style="font-size:12pt;margin-top:10px">Madre, padre o tutor</h2><table>${fila("Nombre", d.tutor)}${fila("Parentesco", d.parent)}${fila("Teléfono", d.tel)}${fila("Ocupación", d.ocup)}${fila("Segundo contacto", d.tutor2)}${fila("Teléfono", d.tel2)}${fila("En caso de emergencia avisar a", d.emerg)}${fila("Teléfono de emergencia", d.telE)}</table>
   <p class="nota">Los datos personales se usan solo para fines escolares y se resguardan conforme a la normativa de protección de datos personales.</p>${firma(`${esc(k === "datosV" ? "" : d.tutor || "")}<br><small>Nombre y firma de la madre, padre o tutor</small>`)}</div>`; }
const expCiclo = () => { const d = new Date(), y = d.getFullYear(); return d.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };

/* ---------- expedientes del grupo ---------- */
VISTAS.expGrupo = () => { const g = grDe(S.gid) || gAct(); if (!g) return VISTAS.inicio(); const al = activos(g), L = expDocsDe(g), sinMin = al.filter(a => !expMin(a));
  return barra(esc(grNom(g)), "Expedientes del grupo") + `<main class="wrap">
   <section class="card mt" style="border-left:5px solid ${sinMin.length ? "var(--maiz)" : "var(--jade)"}"><p class="small"><b>${al.length - sinMin.length} de ${al.length}</b> alumnos tienen lo mínimo (acta de nacimiento y CURP).</p><p class="small muted">Apartado opcional. Toque un alumno para abrir su expediente.</p>
    <div class="fila mt"><button class="btn s" id="xgP">${ic("impr", 15)} Imprimir concentrado</button><button class="btn s" id="xgF">${ic("impr", 15)} Avisos de documentos faltantes</button><button class="btn s" id="xgV">${ic("impr", 15)} Formato de datos en blanco</button></div></section>
   <div class="lista mt">${al.map((a, i) => { const c = expCuenta(g, a); return `<button class="it btnit" data-xa="${a.id}"><span class="av" style="${c.min ? "background:var(--jade);color:#fff" : ""}">${i + 1}</span><span class="tx"><b>${esc(a.nombre)}</b><small>${c.n} de ${c.t} documentos${c.min ? "" : " · <span style='color:var(--rojo)'>falta " + [!expTiene(a, "acta") ? "acta" : "", !expTiene(a, "curp") || !expDe(a).dat.curp ? "CURP" : ""].filter(Boolean).join(" y ") + "</span>"}</small></span>${ic("sig", 16)}</button>`; }).join("") || `<div class="vacio">Primero agregue a sus alumnos.</div>`}</div></main>`; };
ENLAZAR.expGrupo = () => { const g = grDe(S.gid) || gAct(); if (!g) return; const al = activos(g), L = expDocsDe(g);
  $$("[data-xa]").forEach(b => b.onclick = () => ir("expAlumno", { gid: g.id, id: b.dataset.xa }));
  $("#xgP").onclick = () => imprimir(`<div class="doc">${encabezado(g, "Concentrado de expedientes del grupo · " + grNom(g))}<table><tr><th>#</th><th>Alumno</th><th>CURP</th>${L.map(d => `<th class="c" style="font-size:7.5pt">${esc(d[1].replace(/\s*\(.*\)/, ""))}</th>`).join("")}</tr>${al.map((a, i) => `<tr><td class="c">${i + 1}</td><td>${esc(a.nombre)}</td><td style="font-size:8pt">${esc(expDe(a).dat.curp || "")}</td>${L.map(d => `<td class="c">${expTiene(a, d[0]) ? "✓" : ""}</td>`).join("")}</tr>`).join("")}</table><p class="nota">✓ = entregado. Ciclo escolar ${expCiclo()}.</p></div>`, true);
  $("#xgV").onclick = () => imprimir(expDocHTML(g, { nombre: "", exp: {} }, "datosV"));
  $("#xgF").onclick = () => { const F = al.map(a => [a, L.filter(d => !expTiene(a, d[0]))]).filter(([, f]) => f.length); if (!F.length) return toast("Todos los expedientes están completos.");
    imprimir(`<div class="doc">${F.map(([a, f], i) => `<div style="${i ? "page-break-before:always;" : ""}">${encabezado(g, "Aviso a madres, padres o tutores")}<p>Estimada familia de <b>${esc(a.nombre)}</b> (${esc(grNom(g))}):</p><p>Para completar el expediente escolar de su hija o hijo, le pedimos amablemente entregar a la brevedad los siguientes documentos:</p><ul>${f.map(d => `<li>${esc(d[1])}${d[2] ? " <b>(indispensable)</b>" : ""}</li>`).join("")}</ul><p>Gracias por su apoyo.</p><table class="firmas"><tr><td>${esc(D.docente.nombre || yo().nombre)}<br><small>Docente de grupo</small></td><td><br><small>Nombre y firma de enterado</small></td></tr></table></div>`).join("")}</div>`); }; };
