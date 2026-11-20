/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Anexo D del PPIE «Registro de incidencias», con el MISMO formato oficial que usa Tlamatini
   (se toma el PDF de Tlamatini sin modificarlo y solo se escribe sobre sus espacios), y la firma
   digital del docente, que él decide cuándo poner. */
"use strict";
const AD_PDF = "../formatos-ppie/formatos/D.pdf";
const AD_TIPOS = ["Accidente", "Conducta inadecuada", "Inasistencias", "Falta de higiene", "Inasistencia a reunión convocada", "Enfermedad",
  "Incumplimiento de tareas o materiales", "Pediculosis", "Retardo", "Alimento o refrigerio"];
const AD_DE_INC = { "Lesión o accidente": "Accidente", "Pelea o agresión": "Conducta inadecuada", "Conducta": "Conducta inadecuada", "Malestar o salud": "Enfermedad" };
const AD_MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const adFechaLarga = v => { if (!v) return ""; const [y, m, d] = v.split("-").map(Number); return `${d} de ${AD_MESES[m - 1]} de ${y}`; };
const adGrado = g => g ? `${g.grado}° ${g.grupo || ""}`.trim() : "";

/* ---------- medición y acomodo del texto (igual que en Tlamatini) ---------- */
function adTexto(font) {
  const ok = new Map();
  const clean = t => { t = String(t ?? "").replace(/\r/g, "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\t/g, " "); let o = "";
    for (const ch of t) { if (ch === "\n") { o += ch; continue; } if (!ok.has(ch)) { let b = true; try { font.widthOfTextAtSize(ch, 10); } catch (e) { b = false; } ok.set(ch, b); } o += ok.get(ch) ? ch : ""; } return o; };
  const W = (t, s) => font.widthOfTextAtSize(t, s);
  const wrap = (text, widths, size) => { const out = []; let li = 0; const paras = clean(text).split("\n");
    for (let pi = 0; pi < paras.length; pi++) { const words = paras[pi].split(/ +/).filter(Boolean); let cur = "";
      if (!words.length) { if (pi < paras.length - 1) { out.push(""); li++; } continue; }
      for (const w of words) { const wd = widths[Math.min(li, widths.length - 1)], cand = cur ? cur + " " + w : w;
        if (W(cand, size) <= wd) cur = cand; else { if (cur) { out.push(cur); li++; } cur = w;
          while (W(cur, size) > widths[Math.min(li, widths.length - 1)]) { let k = cur.length; while (k > 1 && W(cur.slice(0, k), size) > widths[Math.min(li, widths.length - 1)]) k--; out.push(cur.slice(0, k)); li++; cur = cur.slice(k); } } }
      out.push(cur); li++; }
    return out; };
  const lines = (text, widths) => { for (const s of [10, 9.5, 9, 8.5, 8]) { const l = wrap(text, widths, s); if (l.length <= widths.length) return { size: s, lines: l, over: false }; } return { size: 8, lines: wrap(text, widths, 8), over: true }; };
  const box = (text, w, h) => { for (const s of [10, 9.5, 9, 8.5, 8, 7.5, 7]) { const n = Math.floor((h - 4) / (s * 1.2)), l = wrap(text, [w - 6], s); if (l.length <= n) return { size: s, lines: l, over: false, cap: n }; }
    const n = Math.floor((h - 4) / (7 * 1.2)); return { size: 7, lines: wrap(text, [w - 6], 7), over: true, cap: n }; };
  const single = (text, w, mx = 10) => { const t = clean(text).replace(/\n/g, " "); if (!t) return { size: mx, text: t, over: false }; let s = mx; const full = W(t, mx);
    if (full > w - 2) s = Math.max(6, Math.floor((w - 2) / full * mx * 2) / 2); return { size: s, text: t, over: W(t, s) > w - 1 }; };
  return { lines, box, single };
}

/* ---------- generar el PDF oficial ---------- */
async function adGenerar(v) {
  await cargarJS(LIB + "pdf-lib.min.js");
  const { PDFDocument, StandardFonts, PDFCheckBox, rgb } = window.PDFLib;
  const bytes = await (await fetch(AD_PDF)).arrayBuffer(), doc = await PDFDocument.load(bytes), pages = doc.getPages(), geo = {};
  for (const f of doc.getForm().getFields()) { const name = f.getName().slice(2), wd = f.acroField.getWidgets()[0], r = wd.getRectangle();
    const ref = doc.context.getObjectRef(wd.dict); let pi = 0; pages.forEach((p, i) => { const a = p.node.Annots(); if (a && a.asArray().some(x => x === ref)) pi = i; });
    let q = 0; try { q = f.acroField.getQuadding() || 0; } catch (e) {} geo[name] = { ...r, page: pi, cb: f instanceof PDFCheckBox, q }; }
  const helv = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold), ink = rgb(0, 0, 0), T = adTexto(helv), avisos = [];
  const put = (n, text, size) => { const g = geo[n]; if (!g || !text) return; const w = helv.widthOfTextAtSize(text, size);
    let x = g.x + 1.5; if (g.q === 1) x = g.x + (g.width - w) / 2; else if (g.q === 2) x = g.x + g.width - w - 1.5;
    pages[g.page].drawText(text, { x, y: g.y + (g.height - size * 0.72) / 2, size, font: helv, color: ink }); };
  const single = { "Fecha": adFechaLarga(v.fecha), "Nombre de la alumna o alumno": v.alumno, "Grado y grupo": v.grado,
    "Madre, padre o responsable que recibe la información": v.madre, "Nombre responsable del cuidado familiar": v.madre,
    "Nombre docente responsable": v.docente, "Nombre testigo": v.testigo };
  if (v.otro) single["Otro (especifique)"] = v.otro;
  for (const [n, t] of Object.entries(single)) { if (!t || !geo[n]) continue; const r = T.single(t, geo[n].width); if (r.over) avisos.push(`«${n}» es demasiado largo para su espacio en el formato.`); put(n, r.text, r.size); }
  for (const [base, text, label] of [["Descripción de la situación", v.desc, "Descripción de la situación"], ["Recomendaciones y acuerdos", v.rec, "Recomendaciones y/o acuerdos"]]) {
    if (!text) continue; const to = [1, 2, 3, 4].map(i => `${base} ${i}`), r = T.lines(text, to.map(n => geo[n].width - 3));
    if (r.over) avisos.push(`«${label}» no cabe en los 4 renglones del formato. Resuma el texto.`);
    r.lines.slice(0, 4).forEach((t, i) => put(to[i], t, r.size)); }
  if (v.obs && geo.Observaciones) { const g = geo.Observaciones, r = T.box(v.obs, g.width, g.height), lh = r.size * 1.2;
    if (r.over) avisos.push("«Observaciones» no cabe en el recuadro del formato. Resuma el texto.");
    r.lines.slice(0, r.cap).forEach((t, i) => pages[g.page].drawText(t, { x: g.x + 3, y: g.y + g.height - 2 - r.size - i * lh, size: r.size, font: helv, color: ink })); }
  const checks = [...(v.tipos || [])]; if (v.otro) checks.push("Otro");
  for (const n of checks) { const g = geo[n]; if (!g) continue; const s = Math.min(g.width, g.height) * 1.05, w = bold.widthOfTextAtSize("X", s);
    pages[g.page].drawText("X", { x: g.x + (g.width - w) / 2, y: g.y + (g.height - s * 0.72) / 2, size: s, font: bold, color: ink }); }
  if (v.firma && D.cfg.firma && geo["Nombre docente responsable"]) {
    const g = geo["Nombre docente responsable"], img = await doc.embedPng(D.cfg.firma), maxW = Math.min(g.width - 10, 150), maxH = 44;
    const k = Math.min(maxW / img.width, maxH / img.height), w = img.width * k, h = img.height * k;
    pages[g.page].drawImage(img, { x: g.x + (g.width - w) / 2, y: g.y + g.height - 1, width: w, height: h }); }
  const form = doc.getForm(); for (const f of form.getFields()) form.removeField(f);
  doc.setTitle("Anexo D - Registro de incidencias"); doc.setProducer("Ulama · Supervisión Escolar Zona 050");
  return { bytes: await doc.save(), avisos };
}
function adArchivo(v) { const n = String(v.alumno || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w ]+/g, "").trim(); return `Anexo D - Registro de incidencias${n ? " - " + n : ""}.pdf`; }

/* ---------- llenar el formato ---------- */
function dlgAnexoD(incId) {
  const inc = incId ? incidentes().find(x => x.id === incId) : null;
  const gIni = grDe((inc && inc.grupoId) || incGrupoActual());
  const prev = inc && inc.anexoD;
  const alIni = prev ? prev.alumno : (() => { if (!inc) return ""; const id = (inc.alumnos || [])[0]; const a = id && ((gIni && (gIni.alumnos || []).find(z => z.id === id)) || alDe(id)); return a ? a.nombre : (inc.otro || ""); })();
  const v = prev ? JSON.parse(JSON.stringify(prev)) : {
    fecha: (inc && inc.fecha) || hoy(), grupoId: gIni ? gIni.id : "", alumno: alIni, grado: adGrado(gIni),
    tipos: inc && AD_DE_INC[inc.tipo] ? [AD_DE_INC[inc.tipo]] : [], otro: "", madre: "",
    desc: (inc && inc.que) || "", rec: (inc && inc.acuerdos) || "", obs: "", docente: docNombre(), testigo: "", firma: false };
  if (!D.cfg.firma) v.firma = false;
  const gruposOrd = D.grupos.slice().sort((a, b) => String((escDe(a.escId) || {}).nombre).localeCompare(String((escDe(b.escId) || {}).nombre), "es") || (a.grado - b.grado) || String(a.grupo).localeCompare(b.grupo));
  const listaAl = () => { const g = grDe(v.grupoId), L = g ? activos(g) : [];
    return `<option value="">${L.length ? "Elegir de la lista…" : "Este grupo no tiene alumnos registrados"}</option>${L.map(a => `<option ${a.nombre === v.alumno ? "selected" : ""}>${esc(a.nombre)}</option>`).join("")}`; };
  dlg(`<h3>Anexo D · Registro de incidencias</h3>
    <p class="small muted mb">Formato oficial del PPIE, el mismo de Tlamatini. Se entrega a la Dirección el mismo día en que se detecta la situación.</p>
    <div class="fila" style="gap:10px">
      <label class="campo" style="flex:1;min-width:150px"><span>Fecha</span><input type="date" id="adF" data-nofoco="1" value="${v.fecha}"></label>
      <label class="campo" style="flex:2;min-width:180px"><span>Grupo de la clase</span><select id="adG">${gruposOrd.map(g => `<option value="${g.id}" ${g.id === v.grupoId ? "selected" : ""}>${esc(incNomGrupo(g))}</option>`).join("")}<option value="" ${!v.grupoId ? "selected" : ""}>Otro / fuera de clase</option></select></label></div>
    <label class="campo"><span>Alumna o alumno</span><select id="adL">${listaAl()}</select></label>
    <div class="fila" style="gap:10px">
      <label class="campo" style="flex:3;min-width:190px"><span>Nombre de la alumna o alumno <small>(se puede corregir)</small></span><input id="adA" value="${esc(v.alumno)}" placeholder="Nombre completo"></label>
      <label class="campo" style="flex:1;min-width:100px"><span>Grado / grupo</span><input id="adGr" value="${esc(v.grado)}" placeholder="Ej. 4° B"></label></div>
    <div class="campo"><span>Tipo de incidencia <small>(marque lo que corresponda)</small></span><div class="chips" id="adT">${AD_TIPOS.map(t => `<button type="button" class="chip" data-adt="${esc(t)}" aria-pressed="${v.tipos.includes(t)}">${esc(t)}</button>`).join("")}</div></div>
    <label class="campo"><span>Otro <small>(especifique, si no está en la lista)</small></span><input id="adO" value="${esc(v.otro)}"></label>
    <label class="campo"><span>Madre, padre o responsable que recibe la información</span><input id="adM" value="${esc(v.madre)}"></label>
    <label class="campo"><span>Descripción de la situación</span><textarea id="adD" data-nofoco="1" placeholder="Lo que vio o escuchó, sin opiniones. Las palabras de la alumna o alumno, entre comillas.">${esc(v.desc)}</textarea></label>
    <label class="campo"><span>Recomendaciones y/o acuerdos establecidos</span><textarea id="adR" data-nofoco="1" style="min-height:80px">${esc(v.rec)}</textarea></label>
    <label class="campo"><span>Observaciones <small>(opcional)</small></span><textarea id="adOb" data-nofoco="1" style="min-height:70px">${esc(v.obs)}</textarea></label>
    <div class="fila" style="gap:10px">
      <label class="campo" style="flex:1;min-width:180px"><span>Docente responsable</span><input id="adDo" value="${esc(v.docente)}"></label>
      <label class="campo" style="flex:1;min-width:180px"><span>Testigo <small>(opcional)</small></span><input id="adTe" value="${esc(v.testigo)}"></label></div>
    ${D.cfg.firma ? `<label class="ad-firma"><input type="checkbox" id="adFi" ${v.firma ? "checked" : ""}><span>Poner mi firma digital</span><img src="${D.cfg.firma}" alt="Su firma"></label>`
      : `<p class="small muted">¿Quiere que aparezca su firma? Súbala una vez en <b>Ajustes → Mi firma digital</b>.</p>`}
    <div id="adAv"></div>
    <div class="fila fin"><button class="btn" id="adNo">Cancelar</button>${navigator.canShare ? `<button class="btn" id="adCo">Compartir</button>` : ""}<button class="btn p" id="adSi">${ic("bajar", 18)} Descargar PDF</button></div>`, w => {
    const leer = () => { v.fecha = w.querySelector("#adF").value || hoy(); v.alumno = w.querySelector("#adA").value.trim(); v.grado = w.querySelector("#adGr").value.trim();
      v.otro = w.querySelector("#adO").value.trim(); v.madre = w.querySelector("#adM").value.trim(); v.desc = w.querySelector("#adD").value.trim(); v.rec = w.querySelector("#adR").value.trim();
      v.obs = w.querySelector("#adOb").value.trim(); v.docente = w.querySelector("#adDo").value.trim(); v.testigo = w.querySelector("#adTe").value.trim();
      v.firma = !!(w.querySelector("#adFi") && w.querySelector("#adFi").checked); };
    w.querySelector("#adG").onchange = e => { v.grupoId = e.target.value; const g = grDe(v.grupoId); w.querySelector("#adL").innerHTML = listaAl(); if (g) w.querySelector("#adGr").value = adGrado(g); };
    w.querySelector("#adL").onchange = e => { if (e.target.value) w.querySelector("#adA").value = e.target.value; };
    w.querySelectorAll("[data-adt]").forEach(c => c.onclick = () => { const t = c.dataset.adt, i = v.tipos.indexOf(t); i < 0 ? v.tipos.push(t) : v.tipos.splice(i, 1); c.setAttribute("aria-pressed", i < 0); });
    w.querySelector("#adNo").onclick = cerrarDlg;
    const hacer = async compartir => { leer();
      if (!v.alumno) { w.querySelector("#adA").focus(); return toast("Escriba o elija el nombre de la alumna o alumno."); }
      if (!v.tipos.length && !v.otro) return toast("Marque el tipo de incidencia.");
      const b = w.querySelector(compartir ? "#adCo" : "#adSi"), txt = b.innerHTML; b.disabled = true; b.textContent = "Generando…";
      try { const r = await adGenerar(v);
        w.querySelector("#adAv").innerHTML = r.avisos.length ? `<div class="aviso small mt" style="background:var(--maiz-s);border-radius:12px;padding:10px 12px">${r.avisos.map(esc).join("<br>")}</div>` : "";
        if (inc) { inc.anexoD = JSON.parse(JSON.stringify(v)); inc.anexoD.hecho = new Date().toISOString(); guardar(); }
        const nombre = adArchivo(v), blob = new Blob([r.bytes], { type: "application/pdf" });
        if (compartir) { const f = new File([blob], nombre, { type: "application/pdf" });
          if (navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: "Anexo D - Registro de incidencias" }); } catch (e) {} } else toast("Este dispositivo no permite compartir el archivo; use «Descargar PDF»."); }
        else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
          toast(r.avisos.length ? "PDF listo. Revise el aviso: algún texto es muy largo." : "<b>Anexo D listo.</b> Se descargó el PDF."); }
      } catch (e) { console.error(e); toast("No se pudo generar el PDF. Revise su conexión la primera vez que lo use."); }
      b.disabled = false; b.innerHTML = txt; };
    w.querySelector("#adSi").onclick = () => hacer(false);
    if (w.querySelector("#adCo")) w.querySelector("#adCo").onclick = () => hacer(true);
  });
}

/* ---------- firma digital del docente ---------- */
(function () {
  const st = document.createElement("style");
  st.textContent = `.ad-firma{display:flex;align-items:center;gap:12px;flex-wrap:wrap;border:1px solid var(--hilo);background:var(--hoja);border-radius:16px;padding:10px 14px;margin:6px 0 4px;cursor:pointer;font-weight:700}
  .ad-firma input{width:22px;height:22px;accent-color:var(--jade)}
  .ad-firma img{height:40px;width:auto;margin-left:auto;background:#fff;border-radius:8px;padding:2px 6px}
  .firma-caja{display:grid;place-items:center;min-height:110px;background:#fff;border:1px dashed var(--hilo);border-radius:16px;padding:12px}
  .firma-caja img{max-height:100px;max-width:100%}
  .firma-lienzo{width:100%;height:200px;background:#fff;border:1px solid var(--hilo);border-radius:16px;touch-action:none;display:block}`;
  document.head.appendChild(st);
})();

/* Convierte una foto o dibujo de la firma en una imagen limpia: fondo transparente, tinta oscura y recortada */
function firmaLimpia(fuente, w, h, umbral = 165) {
  const k = Math.min(1, 1000 / w), cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
  const c = document.createElement("canvas"); c.width = cw; c.height = ch; const x = c.getContext("2d", { willReadFrequently: true });
  x.fillStyle = "#fff"; x.fillRect(0, 0, cw, ch); x.drawImage(fuente, 0, 0, cw, ch);
  const im = x.getImageData(0, 0, cw, ch), d = im.data; let x0 = cw, y0 = ch, x1 = -1, y1 = -1;
  for (let i = 0; i < d.length; i += 4) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (l > umbral) d[i + 3] = 0; else { const a = Math.min(255, Math.round((umbral - l) / umbral * 255 * 2.2)); d[i] = 16; d[i + 1] = 33; d[i + 2] = 90; d[i + 3] = Math.max(a, 90);
      const p = i / 4, px = p % cw, py = (p / cw) | 0; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; } }
  if (x1 < 0) return null;
  x.putImageData(im, 0, 0); const m = 6; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(cw - 1, x1 + m); y1 = Math.min(ch - 1, y1 + m);
  const sw = x1 - x0 + 1, sh = y1 - y0 + 1, s = Math.min(1, 700 / sw), o = document.createElement("canvas"); o.width = Math.round(sw * s); o.height = Math.round(sh * s);
  o.getContext("2d").drawImage(c, x0, y0, sw, sh, 0, 0, o.width, o.height);
  return o.toDataURL("image/png");
}
function firmaDeArchivo(file) {
  if (!file) return; const r = new FileReader();
  r.onload = () => { const img = new Image(); img.onload = () => { const u = firmaLimpia(img, img.naturalWidth, img.naturalHeight);
    if (!u) return toast("No se distingue la firma en la imagen. Use una foto con buena luz, sobre papel blanco.");
    dlgFirmaVista(u); }; img.onerror = () => toast("No se pudo abrir esa imagen."); img.src = r.result; };
  r.readAsDataURL(file);
}
function dlgFirmaVista(u) {
  dlg(`<h3>¿Así se ve bien su firma?</h3><p class="small muted mb">Se quitó el fondo para que se vea limpia sobre los formatos.</p>
    <div class="firma-caja"><img src="${u}" alt="Vista previa de su firma"></div>
    <div class="fila fin mt"><button class="btn" id="fvNo">Cancelar</button><button class="btn p" id="fvSi">${ic("check", 18)} Guardar firma</button></div>`, w => {
    w.querySelector("#fvNo").onclick = cerrarDlg;
    w.querySelector("#fvSi").onclick = () => { D.cfg.firma = u; guardar(); cerrarDlg(); if (S.v === "ajustes") pintar(); toast("<b>Firma guardada.</b> Podrá ponerla cuando usted lo decida."); };
  });
}
function dlgFirmaDibujar() {
  dlg(`<h3>Dibuje su firma</h3><p class="small muted mb">Con el dedo o el lápiz, dentro del recuadro.</p><canvas class="firma-lienzo" id="fdC"></canvas>
    <div class="fila fin mt"><button class="btn" id="fdL" style="margin-right:auto">Borrar</button><button class="btn" id="fdNo">Cancelar</button><button class="btn p" id="fdSi">${ic("check", 18)} Usar esta firma</button></div>`, w => {
    const c = w.querySelector("#fdC"), r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); const x = c.getContext("2d");
    const limpiar = () => { x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); }; limpiar();
    x.lineWidth = 3.2 * dpr; x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = "#10215a";
    let on = false, hay = false; const pt = e => { const b = c.getBoundingClientRect(); return [(e.clientX - b.left) * dpr, (e.clientY - b.top) * dpr]; };
    c.onpointerdown = e => { on = true; hay = true; c.setPointerCapture(e.pointerId); const [a, b] = pt(e); x.beginPath(); x.moveTo(a, b); x.lineTo(a + 0.1, b + 0.1); x.stroke(); };
    c.onpointermove = e => { if (!on) return; const [a, b] = pt(e); x.lineTo(a, b); x.stroke(); };
    c.onpointerup = c.onpointercancel = () => { on = false; };
    w.querySelector("#fdL").onclick = () => { limpiar(); hay = false; };
    w.querySelector("#fdNo").onclick = cerrarDlg;
    w.querySelector("#fdSi").onclick = () => { if (!hay) return toast("Primero dibuje su firma."); const u = firmaLimpia(c, c.width, c.height, 200); if (!u) return toast("Primero dibuje su firma."); dlgFirmaVista(u); };
  });
}
function firmaSecHTML() {
  return `<section class="card mt"><h3>Mi firma digital</h3><p class="small muted mb">Súbala una vez y póngala solo cuando usted lo decida, por ejemplo en el Anexo D (Registro de incidencias). Se guarda en este dispositivo y en su respaldo.</p>
    ${D.cfg.firma ? `<div class="firma-caja mb"><img src="${D.cfg.firma}" alt="Su firma"></div>` : ""}
    <div class="fila"><button class="btn" id="bFiS">${ic("camara", 18)} ${D.cfg.firma ? "Cambiar por foto o imagen" : "Subir foto o imagen"}</button><button class="btn" id="bFiD">${ic("lapiz", 18)} Dibujar mi firma</button>
    ${D.cfg.firma ? `<button class="btn r" id="bFiX">${ic("basura", 16)} Quitar</button>` : ""}<input type="file" id="fFi" accept="image/*" hidden></div>
    <p class="small muted mt">Consejo: firme con pluma negra o azul sobre una hoja blanca y tómele foto de cerca, con buena luz.</p></section>`;
}
(function () {
  const vAj = VISTAS.ajustes, eAj = ENLAZAR.ajustes;
  VISTAS.ajustes = () => { const h = vAj(), k = '<section class="card mt"><h3>Trimestres</h3>'; return h.includes(k) ? h.replace(k, firmaSecHTML() + k) : h; };
  ENLAZAR.ajustes = () => { eAj(); const s = $("#bFiS"); if (!s) return;
    s.onclick = () => $("#fFi").click(); $("#fFi").onchange = e => { firmaDeArchivo(e.target.files[0]); e.target.value = ""; };
    $("#bFiD").onclick = dlgFirmaDibujar;
    $("#bFiX") && ($("#bFiX").onclick = async () => { if (!(await confirmar("Se quitará su firma digital de este dispositivo.", "Sí, quitar"))) return pintar(); delete D.cfg.firma; guardar(); pintar(); toast("Firma quitada."); }); };
})();
