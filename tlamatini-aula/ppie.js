/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Tlamatini Aula · «¿Qué está pasando?»: activación de los protocolos del Programa de Protección Integral Escolar (PPIE).
   - El maestro elige la situación y ve, paso por paso, qué hacer, quién lo hace, a quién llamar y qué anexo llenar.
   - Botones para llamar (911, 075, Dirección, Supervisión, DANNARD, Subprocuraduría, CECOSAMA… según el municipio),
     avisar a la Dirección por WhatsApp y abrir el anexo de Tlamatini ya prellenado.
   - Lo que se registra (pasos hechos con su hora y notas) se queda en el dispositivo.
   - Al activarlo, Tequio avisa a la Dirección y a la Supervisión: situación, escuela, docente y hora, y después el avance
     (cuántos pasos van). Nunca se envían nombres de alumnos ni lo que el docente escribe.
   Necesita ppie-datos.js. */
"use strict";
(function () {
  const st = document.createElement("style");
  st.textContent = `
.sos{display:flex;align-items:center;gap:14px;width:100%;margin-top:14px;padding:16px 18px;border-radius:22px;border:0;background:linear-gradient(135deg,#B91C1C,#7F1D1D);color:#fff;text-align:left;box-shadow:0 10px 26px rgba(127,29,29,.28);cursor:pointer}
.sos .ico{flex:0 0 auto;width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:28px}
.sos b{display:block;font-size:19px;line-height:1.15}.sos span{font-size:13.5px;opacity:.9}
.sos .n{margin-left:auto;background:#fff;color:#B91C1C;font-weight:800;border-radius:999px;padding:4px 10px;font-size:13px;white-space:nowrap}
.pp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.pp-op{display:flex;flex-direction:column;gap:4px;text-align:left;border:1px solid var(--hilo);border-left:6px solid var(--c);background:var(--hoja);border-radius:18px;padding:12px 12px 12px 12px;cursor:pointer;min-height:96px}
.pp-op .e{font-size:26px;line-height:1}.pp-op b{font-size:15.5px;line-height:1.2}.pp-op small{color:var(--gris);font-size:12.5px;line-height:1.3}
.pp-op.em{background:#FEF2F2;border-color:#FCA5A5;border-left-color:var(--c)}
.pp-911{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:64px;border-radius:20px;background:#B91C1C;color:#fff !important;font-size:24px;font-weight:800;text-decoration:none;box-shadow:0 8px 20px rgba(185,28,28,.3)}
.pp-llamar{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:10px}
.pp-c{display:flex;align-items:center;gap:8px;justify-content:center;min-height:48px;border-radius:14px;border:1px solid var(--hilo);background:var(--hoja);color:var(--tinta,#1E2A40) !important;text-decoration:none;font-weight:700;font-size:14.5px;padding:6px 10px;text-align:center;cursor:pointer}
.pp-c.wa{background:#1E8E5A;color:#fff !important;border-color:#1E8E5A}.pp-c.an{background:var(--anil-s);border-color:#C9D5EA}
.pp-paso{display:flex;gap:12px;align-items:flex-start;background:var(--hoja);border:1px solid var(--hilo);border-radius:18px;padding:12px}
.pp-paso.hecho{background:#EEF7F1;border-color:#BFE3CB}.pp-paso.otro{opacity:.82}
.pp-num{flex:0 0 auto;width:40px;height:40px;border-radius:12px;border:2px solid var(--hilo);background:#fff;display:grid;place-items:center;font-weight:800;font-size:16px;cursor:pointer}
.pp-paso.hecho .pp-num{background:#1E8E5A;border-color:#1E8E5A;color:#fff}
.pp-tx{flex:1;min-width:0}.pp-tx p{margin:0;font-size:16px;line-height:1.45}.pp-tx .nota{font-size:13.5px;color:var(--maiz-d);margin-top:6px}
.pp-tx ul{margin:6px 0 0 18px;padding:0;font-size:14.5px}
.pp-q{display:inline-block;font-size:11.5px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;border-radius:999px;padding:2px 8px;margin-bottom:5px}
.pp-q.doc{background:#FAEBCB;color:#8A5A08}.pp-q.dir{background:#E6ECF6;color:#1F3A6B}.pp-q.sup{background:#EEE3F2;color:#6B3F7A}.pp-q.todos{background:#F7DEDA;color:#A3322A}
.pp-acc{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.pp-acc .pp-c{min-height:40px;font-size:13.5px;flex:0 1 auto}
.pp-hora{font-size:12.5px;color:#1E8E5A;font-weight:700;margin-top:6px}
.pp-fase{font-size:12.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--gris);margin:14px 4px 4px}
.pp-sipir{display:grid;gap:6px;margin-top:8px}.pp-sipir div{background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:6px 10px;font-size:14px}
.pp-em{background:#7F1D1D;color:#fff;border-radius:24px;padding:18px}.pp-em h2{margin:0 0 6px;font-size:24px;color:#fff}
.pp-em ol{margin:10px 0 14px 20px;padding:0;font-size:19px;line-height:1.45;font-weight:700}.pp-em .pp-911{background:#fff;color:#B91C1C !important;font-size:26px}
.pp-atice{display:grid;gap:6px;margin-top:8px}.pp-atice div{display:flex;gap:10px;align-items:flex-start;background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:8px 10px;font-size:14px}
.pp-atice b.l{flex:0 0 auto;width:30px;height:30px;border-radius:9px;background:#9A3412;color:#fff;display:grid;place-items:center;font-size:16px}
.pp-aviso{font-size:13px;border-radius:14px;padding:8px 12px;margin-top:10px;background:var(--anil-s);color:#1F3A6B}
.pp-aviso.mal{background:#FAEBCB;color:#8A5A08}
.pp-nota{background:var(--hoja);border:1px solid var(--hilo);border-radius:14px;padding:8px 12px;font-size:14.5px}
.pp-nota small{color:var(--gris);display:block;font-size:12px}`;
  document.head.appendChild(st);
})();

/* Capa para usar el apartado en otras apps (Ulama define window.PPA con su escuela, alumnos y servidor) */
const ppA = () => window.PPA || null;
const ppTLM = () => (ppA() && ppA().tlm) || (typeof TLM !== "undefined" ? TLM : "../formatos-ppie/");
const ppDemo = () => ppA() ? !!ppA().demo : (typeof DEMO !== "undefined" && DEMO);
const ppPie = () => ppA() ? (ppA().pie ? ppA().pie() : "") : (typeof pie === "function" ? pie() : "");
const ppDocente = () => ppA() ? ppA().docente() : yo().nombre;
const ppPost = (a, d, ms) => ppA() ? ppA().post(a, d) : aulaPost(a, d, ms);
const ppRe = () => { const y = scrollY; pintar(); scrollTo(0, y); };
const ppNrm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const PP_Q = { doc: "Le toca a usted", dir: "Dirección", sup: "Supervisión", todos: "Todos" };
const ppD = () => { D.ppie = D.ppie || []; return D.ppie; };
const ppProt = id => PPIE.find(p => p.id === id);
const ppCaso = c => { const p = ppProt(c.prot); return p && (p.casos.find(x => x.id === c.caso) || p.casos[0]); };
const ppDe = id => ppD().find(c => c.id === id);
const ppAbiertos = () => ppD().filter(c => !c.cerrado);
const ppHora = x => { if (!x) return ""; const d = new Date(x); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const ppDia = x => iso(new Date(x));
const ppFH = x => { if (!x) return ""; return fCorta(ppDia(x)) + " · " + ppHora(x); };
const ppDig = n => String(n || "").replace(/\D/g, "");
const ppTelHref = n => { const d = ppDig(n); return d.length <= 3 ? "tel:" + d : "tel:" + (d.length === 10 ? "+52" + d : d); };

/* ---------- escuela y contactos ----------
   Zona 050: la escuela, la Dirección y la Supervisión vienen de la app (enlace personal) y Tequio avisa solo.
   Cualquier otra escuela o zona: el propio usuario captura a quién avisar (Dirección, Supervisión y otros contactos),
   y los botones usan esos datos; no se envía ningún aviso automático. */
const PPIE_050 = ["02DPR0210Z", "02DPR0150B", "02DPR0862Z", "02DPR0077J", "02DPR0379E", "02DPR0425Z", "02DPR0378F", "02DPR0684N", "02DPR0014Y", "02DPR0593W", "02DPR0882N", "02DPR0012Z", "02DPR0556S", "02DPR0382S"];
const PP_MUNIS = ["San Quintín", "Ensenada", "Playas de Rosarito", "Tijuana", "Tecate", "Mexicali", "San Felipe"];
function ppEscBase() { if (ppA()) return ppA().escuela();
  const g = gAct(), yoT = LS("tlm-yo") || {}, per = LS("ppie-perfil") || {};
  const es = (yoT.escuelas || []).find(e => g && g.cct && e.cct === g.cct) || (yoT.escuelas || [])[0] || {};
  return { id: (g && g.cct) || es.cct || "", cct: (g && g.cct) || es.cct || per.cct || "", escuela: (g && g.escuela) || es.nombre || per.escuela || "",
    mun: es.mun || per.municipio || "", dir: es.dir || per.director || "", dirTel: es.dirTel || "",
    supTel: (yoT.sup && yoT.sup.tel) || "", supNom: (yoT.sup && yoT.sup.nombre) || "", grupo: g ? grNom(g) : "" };
}
const ppEsc050 = b => !!(b && b.cct && PPIE_050.includes(String(b.cct).toUpperCase()));
/* Contactos que captura el usuario (por escuela) */
function ppContDe(b) { D.ppieCont = D.ppieCont || {}; const k = (b && (b.id || b.cct)) || "u"; D.ppieCont[k] = D.ppieCont[k] || { otros: [], inst: {} }; return D.ppieCont[k]; }
function ppEscuela() { const b = ppEscBase(), z = ppEsc050(b), k = ppContDe(b);
  return Object.assign({}, b, { z050: z, escuela: b.escuela || k.esc || "", cct: b.cct || k.cct || "", mun: b.mun || k.mun || "",
    dir: k.dirN || (z ? b.dir : "") || "", dirTel: k.dirTel || (z ? b.dirTel : "") || "", supNomP: k.supN || (z ? b.supNom : "") || "",
    supTel: k.supTel || (z ? b.supTel : "") || "", otros: (k.otros || []).filter(x => x.n), inst: k.inst || {} }); }
const ppAutoAviso = () => { const E = ppEscuela(); return E.z050 && !(ppA() && ppA().sinAviso && ppA().sinAviso()); };
/* Teléfono de un contacto: lo que capturó el usuario o, para instituciones, el directorio del PPIE según el municipio */
function ppNumero(k) {
  const x = PPIE_TEL[k], E = ppEscuela(); if (!x) return null;
  if (E.inst[k]) return { n: E.inst[k], t: x.t };
  if (k === "dir") return E.dirTel ? { n: E.dirTel, t: "Dirección" + (E.dir ? " · " + corto(E.dir.replace(/^(Mtr[oa]\.|Profr?a?\.|Lic\.)\s*/, "")) : "") } : null;
  if (k === "sup") return E.supTel ? { n: E.supTel, t: "Supervisión" } : null;
  if (x.m) { const v = x.m[E.mun]; if (!v) return null; const a = Array.isArray(v) ? v : [v]; return { n: a[0], ext: a[1] || "", t: a[2] || x.t }; }
  return x.n ? { n: x.n, ext: x.ext || "", t: x.t } : null;
}

/* ---------- «A quién avisar»: el usuario captura sus contactos ---------- */
const PP_INST = ["seguro", "segesc", "dannard", "subpro", "cecosama", "dif", "bomberos", "cyber"];
VISTAS.ppieContactos = () => { const E = ppEscuela(), b = ppEscBase(), k = ppContDe(b), sinEsc = !b.escuela;
  const campo = (id, et, v, ph, tipo) => `<label class="campo"><span>${et}</span><input id="${id}" value="${esc(v || "")}" ${ph ? `placeholder="${esc(ph)}"` : ""} ${tipo === "tel" ? 'inputmode="tel"' : ""}></label>`;
  return barra("Protocolos PPIE", "A quién avisar") + `<main class="wrap">
   <section class="card mt"><p class="small" style="margin:0">${E.z050 ? "Su escuela es de la <b>Zona 050</b>: la Dirección y la Supervisión reciben un aviso automático cuando activa un protocolo. Aquí puede corregir los teléfonos o agregar otros contactos." : "Capture a quién debe avisar cuando pase algo. Con estos datos funcionan los botones de <b>llamar</b> y <b>WhatsApp</b>. Se guardan solo en este celular."}</p></section>
   ${sinEsc ? `<h2 class="sec-t">Su escuela</h2><section class="card">${campo("ckEsc", "Escuela", k.esc, "Ej. Esc. Prim. Benito Juárez")}${campo("ckCct", "Clave (CCT, opcional)", k.cct, "02DPR…")}</section>` : ""}
   <h2 class="sec-t">Municipio<small>Para los teléfonos de las instituciones</small></h2><section class="card"><label class="campo"><span>Municipio de la escuela</span><select id="ckMun" ${b.mun ? "disabled" : ""}>${["", ...PP_MUNIS].map(m => `<option ${m === (b.mun || k.mun) ? "selected" : ""}>${m}</option>`).join("")}</select></label></section>
   <h2 class="sec-t">Dirección</h2><section class="card"><div class="dos">${campo("ckDirN", "Nombre del director(a)", k.dirN || (E.z050 ? b.dir : ""), "Mtro(a). …")}${campo("ckDirT", "Celular o WhatsApp", k.dirTel || (E.z050 ? b.dirTel : ""), "10 dígitos", "tel")}</div></section>
   <h2 class="sec-t">Supervisión</h2><section class="card"><div class="dos">${campo("ckSupN", "Nombre del supervisor(a)", k.supN || (E.z050 ? b.supNom : ""), "Mtro(a). …")}${campo("ckSupT", "Teléfono o WhatsApp", k.supTel || (E.z050 ? b.supTel : ""), "10 dígitos", "tel")}</div></section>
   <h2 class="sec-t">Otros contactos<small>ATP, subdirección, comité de seguridad…</small></h2><section class="card"><div id="ckOtros">${(k.otros || []).concat([{}]).map((o, i) => `<div class="dos" data-ko="${i}">${campo("ckON" + i, "Nombre o cargo", o.t, "Ej. ATP de la escuela")}${campo("ckOT" + i, "Teléfono", o.n, "10 dígitos", "tel")}</div>`).join("")}</div>
     <button class="btn s" id="ckMas">${ic("mas", 15)} Otro contacto</button></section>
   <h2 class="sec-t">Instituciones<small>Opcional: si conoce un número más cercano</small></h2><section class="card"><p class="small muted" style="margin-top:0">Si lo deja vacío se usa el del directorio del PPIE para su municipio.</p>
     ${PP_INST.map(x => { const d = (() => { const v = PPIE_TEL[x]; if (v.m) { const a = v.m[b.mun || k.mun]; return a ? (Array.isArray(a) ? a[0] : a) : ""; } return v.n || ""; })(); return campo("ckI_" + x, PPIE_TEL[x].t, (k.inst || {})[x], d || "Sin número en el directorio", "tel"); }).join("")}</section>
   <div class="fila mt fin"><button class="btn p" id="ckOk">${ic("check", 16)} Guardar</button></div>${ppPie()}</main>`; };
ENLAZAR.ppieContactos = () => { const b = ppEscBase(), k = ppContDe(b), v = id => (document.getElementById(id) || {}).value || "";
  const leer = () => { if (!b.escuela) { k.esc = v("ckEsc").trim(); k.cct = v("ckCct").trim().toUpperCase(); } if (!b.mun) k.mun = v("ckMun");
    k.dirN = v("ckDirN").trim(); k.dirTel = v("ckDirT").trim(); k.supN = v("ckSupN").trim(); k.supTel = v("ckSupT").trim();
    k.otros = $$("[data-ko]").map(d => ({ t: v("ckON" + d.dataset.ko).trim(), n: v("ckOT" + d.dataset.ko).trim() })).filter(o => o.t || o.n);
    k.inst = {}; PP_INST.forEach(x => { const t = v("ckI_" + x).trim(); if (t) k.inst[x] = t; }); };
  $("#ckMas").onclick = () => { leer(); k.otros.push({}); guardar(); ppRe(); };
  $("#ckOk").onclick = () => { leer(); guardar(); toast("<b>Contactos guardados.</b>"); history.back(); }; };
function ppFaltaContactos() { const E = ppEscuela(); return !E.dirTel && !E.supTel; }

/* ---------- botón de inicio ---------- */
function ppieBotonInicio() { const ab = ppAbiertos();
  return `<button class="sos" id="bSOS"><span class="ico">🆘</span><span><b>¿Qué está pasando?</b><span>Protocolos de protección escolar (PPIE): qué hacer paso a paso y a quién llamar</span></span>${ab.length ? `<span class="n">${ab.length} abierto${ab.length > 1 ? "s" : ""}</span>` : ""}</button>`; }
function ppieEnlazarInicio() { const b = $("#bSOS"); if (b) b.onclick = () => { const ab = ppAbiertos(); if (ab.length === 1 && Date.now() - new Date(ab[0].inicio).getTime() < 6 * 3600e3) return ir("ppieCaso", { pid: ab[0].id }); ir("ppie"); }; }

/* ---------- elegir la situación ---------- */
VISTAS.ppie = () => { const ab = ppAbiertos(), cer = ppD().filter(c => c.cerrado).slice(-5).reverse(), em = PPIE.filter(p => p.emergencia), resto = PPIE.filter(p => !p.emergencia);
  const op = p => `<button class="pp-op${p.emergencia ? " em" : ""}" data-pp="${p.id}" style="--c:${p.c}"><span class="e">${p.e}</span><b>${esc(p.t)}</b><small>${esc(p.d)}</small></button>`;
  return barra("Protección escolar · PPIE", "¿Qué está pasando?") + `<main class="wrap">
   <a class="pp-911 mt" href="tel:911">📞 Llamar al 911</a>
   ${ppA() && ppA().escuelas && ppA().escuelas().length > 1 ? `<p class="small mt" style="margin-bottom:6px"><b>¿En qué escuela está pasando?</b></p><div class="chips">${ppA().escuelas().map(e => `<button class="chip" data-pesc="${esc(e.id)}" aria-pressed="${e.id === ppEscuela().id}">${esc(e.nombre)}</button>`).join("")}</div>` : ""}
   ${(() => { const E = ppEscuela(); return `<button class="it mt" id="ppCont" style="text-align:left;${!E.z050 && ppFaltaContactos() ? "border:2px solid var(--maiz)" : ""}"><span style="font-size:22px">📇</span><span class="tx"><b>A quién avisar</b><small>${E.z050 ? "Zona 050: aviso automático a la Dirección y a la Supervisión" : ppFaltaContactos() ? "Capture los teléfonos de su Dirección y Supervisión" : [E.dir || (E.dirTel ? "Dirección" : ""), E.supNomP || (E.supTel ? "Supervisión" : ""), ...E.otros.map(o => o.t)].filter(Boolean).join(" · ")}</small></span>${ic("sig", 18)}</button>`; })()}
   ${ab.length ? `<h2 class="sec-t">Casos abiertos</h2><div class="lista">${ab.map(c => { const p = ppProt(c.prot), k = ppCaso(c), h = Object.keys(c.hechos || {}).length;
      return `<button class="it" data-pc="${c.id}" style="text-align:left;border-left:6px solid ${p.c}"><span style="font-size:24px">${p.e}</span><span class="tx"><b>${esc(p.t)}${p.casos.length > 1 ? " · " + esc(k.t) : ""}</b><small>${ppFH(c.inicio)} · ${h} de ${k.pasos.length} pasos</small></span>${ic("sig", 18)}</button>`; }).join("")}</div>` : ""}
   <h2 class="sec-t" style="color:#B91C1C">Emergencia</h2><div class="pp-grid">${em.map(op).join("")}</div>
   <h2 class="sec-t">Otras situaciones</h2><div class="pp-grid">${resto.map(op).join("")}</div>
   <section class="card mt"><p class="small" style="margin:0"><b>¿Cómo funciona?</b> Elija la situación y siga los pasos del Programa de Protección Integral Escolar 2026. Cada paso dice quién lo hace, a quién llamar y qué anexo se llena; los anexos se abren en Tlamatini ya con los datos de su escuela.</p>
    <p class="small muted" style="margin:8px 0 0">${ppEscuela().z050 ? "Escuelas de la Zona 050: al activar un protocolo, la Dirección y la Supervisión reciben un aviso con la situación, la escuela, su nombre y la hora, y después cuántos pasos lleva. <b>No se envían nombres de alumnos ni lo que usted escriba</b>: eso se queda en su celular." : "Lo que registre se queda en su celular. Para avisar a su Dirección y Supervisión use los botones de llamar y WhatsApp con los contactos que capture en «A quién avisar»."}</p></section>
   ${cer.length ? `<h2 class="sec-t">Cerrados recientemente</h2><div class="lista">${cer.map(c => { const p = ppProt(c.prot), k = ppCaso(c); return `<button class="it" data-pc="${c.id}" style="text-align:left;opacity:.85"><span style="font-size:22px">${p.e}</span><span class="tx"><b>${esc(p.t)}${p.casos.length > 1 ? " · " + esc(k.t) : ""}</b><small>${ppFH(c.inicio)} · cerrado ${ppFH(c.cerrado)}</small></span>${ic("sig", 18)}</button>`; }).join("")}</div>` : ""}
   ${ppPie()}</main>`; };
ENLAZAR.ppie = () => { ppReintentar(); const pc = $("#ppCont"); if (pc) pc.onclick = () => ir("ppieContactos");
  $$("[data-pesc]").forEach(b => b.onclick = () => { ppA().elegir(b.dataset.pesc); ppRe(); });
  $$("[data-pc]").forEach(b => b.onclick = () => ir("ppieCaso", { pid: b.dataset.pc }));
  $$("[data-pp]").forEach(b => b.onclick = () => { const p = ppProt(b.dataset.pp); if (p.casos.length === 1) return ppIniciar(p, p.casos[0]);
    dlg(`<h3>${p.e} ${esc(p.t)}</h3><p class="mb">${esc(p.pregunta || "¿Cuál es el caso?")}</p><div class="lista">${p.casos.map(k => `<button class="it" data-pk="${k.id}" style="text-align:left"><span class="tx"><b>${esc(k.t)}</b></span>${ic("sig", 18)}</button>`).join("")}</div>
      <div class="fila fin mt"><button class="btn" id="pkNo">Cancelar</button></div>`, w => { w.querySelector("#pkNo").onclick = cerrarDlg;
      w.querySelectorAll("[data-pk]").forEach(x => x.onclick = () => { cerrarDlg(); ppIniciar(p, p.casos.find(k => k.id === x.dataset.pk)); }); }); }); };

/* ---------- abrir un caso: queda registrado y se avisa a la Dirección y a la Supervisión ---------- */
function ppIniciar(p, k) {
  const E = ppEscuela(), c = { id: uid(), prot: p.id, caso: k.id, inicio: new Date().toISOString(), hechos: {}, notas: [], cct: E.cct, escuela: E.escuela, grupo: E.grupo, aviso: { pend: true } };
  ppD().push(c); guardar(); ir("ppieCaso", { pid: c.id }); ppEnviar(c);
}
/* Aviso al servidor de la zona (Tequio). Si no hay internet, queda pendiente y se reintenta solo. */
async function ppEnviar(c) {
  if (!c || c.enviando) return;
  if (!ppAutoAviso()) { c.aviso = { local: true }; guardar(); return; } const p = ppProt(c.prot), k = ppCaso(c); c.enviando = true;
  try {
    if (!c.aviso.id) {
      const r = await ppPost("ppieAviso", { prot: c.prot, protT: p.t, caso: c.caso, casoT: p.casos.length > 1 ? k.t : "", emergencia: !!(p.emergencia || p.urgente), cct: c.cct, escuela: c.escuela, grupo: c.grupo, inicio: c.inicio, total: k.pasos.length }, 30000);
      c.aviso = { id: r.id, f: new Date().toISOString(), a: r.avisados || "" };
    }
    if (c.aviso.id && c.aviso.pendAv) {
      await ppPost("ppieAvance", { id: c.aviso.id, hechos: Object.keys(c.hechos).length, total: k.pasos.length, cerrado: c.cerrado || "" }, 30000);
      c.aviso.pendAv = false;
    }
    c.aviso.pend = false; c.aviso.error = "";
  } catch (e) { c.aviso.pend = true; c.aviso.error = String(e.message || e); }
  finally { delete c.enviando; guardar(); if (S.v === "ppieCaso" && S.pid === c.id) { const z = $("#ppAviso"); if (z) z.outerHTML = ppAvisoHTML(c); } }
}
function ppReintentar() { ppD().forEach(c => { if (c.aviso && (c.aviso.pend || c.aviso.pendAv)) ppEnviar(c); }); }
window.addEventListener("online", () => setTimeout(ppReintentar, 1500));
let ppTmr = null;
function ppAvance(c) { c.aviso = c.aviso || {}; c.aviso.pendAv = true; guardar(); clearTimeout(ppTmr); ppTmr = setTimeout(() => ppEnviar(c), 2500); }
function ppAvisoHTML(c) { const a = c.aviso || {};
  if (a.local || !ppAutoAviso()) return `<div class="pp-aviso mal" id="ppAviso">📣 Avise usted a la Dirección y a la Supervisión con los botones de llamar o WhatsApp. ${ppFaltaContactos() ? `<button class="btn s" data-pt="dir" style="margin-left:6px">Capturar a quién avisar</button>` : ""}</div>`;
  if (ppDemo()) return `<div class="pp-aviso" id="ppAviso">Demostración: en uso real, aquí se confirma el aviso a la Dirección y a la Supervisión.</div>`;
  if (a.id && !a.pend) return `<div class="pp-aviso" id="ppAviso">✅ La Dirección y la Supervisión ya fueron avisadas (${ppHora(a.f)}).${a.pendAv ? " Enviando avance…" : ""}</div>`;
  return `<div class="pp-aviso mal" id="ppAviso">${c.enviando ? "Avisando a la Dirección y a la Supervisión…" : `⏳ El aviso a la Dirección y a la Supervisión está pendiente${a.error ? ` (${esc(a.error)})` : ""}; se enviará solo cuando haya internet. <button class="btn s" id="ppReAv" style="margin-left:6px">Reintentar</button>`}</div>`; }

/* ---------- acciones de un paso ---------- */
function ppAccHTML(a) { const [t, k] = a.split(":");
  if (t === "tel") {
    if (k === "padres") return `<button class="pp-c" data-pa="padres">👪 Familia del alumno</button>`;
    const n = ppNumero(k), x = PPIE_TEL[k] || {};
    if (!n) return (k === "dir" || k === "sup") ? `<button class="pp-c" data-pt="${k}">📞 ${k === "dir" ? "Dirección" : "Supervisión"}</button>` : x.t ? `<button class="pp-c" data-pinfo="${k}">📞 ${esc(x.t)}</button>` : "";
    return `<a class="pp-c" href="${ppTelHref(n.n)}" ${k === "911" ? 'style="background:#B91C1C;color:#fff !important;border-color:#B91C1C"' : ""}>📞 ${esc(k.length <= 3 && /^\d+$/.test(k) ? k : n.t)}${n.ext ? ` <small>ext. ${esc(n.ext)}</small>` : ""}</a>`;
  }
  if (t === "wa") return k === "sup" ? `<button class="pp-c wa" data-pw="sup">💬 Avisar a la Supervisión</button>` : `<button class="pp-c wa" data-pw="dir">💬 Avisar a la Dirección</button>`;
  if (t === "anexo") return `<button class="pp-c an" data-px="${k}">📄 ${k === "S" ? "Aviso de accidente" : "Anexo " + k}</button>`;
  return ""; }
const PP_ANX = { B: "Acta de hechos", C: "Bitácora de atención y seguimiento", D: "Registro de incidencias", E: "Informe de incidencia", F: "Canalización para atención psicológica", G: "Ficha de canalización a DANNARD", H: "Referencia a IPEBC / CECOSAMA", I: "Reporte a la PPNNA", S: "Aviso de accidente del seguro escolar" };
/* Situaciones del Anexo E según el protocolo */
const PP_SITE = { "sexual|m12": ["Abuso sexual"], "sexual|12a18": ["Abuso sexual"], "sexual|may18": ["Abuso sexual"], "maltrato|fam": ["Maltrato en el ámbito familiar"], "maltrato|com": ["Maltrato en el ámbito comunitario"], "maltrato|esc": ["Maltrato en el ámbito escolar"],
  "drogas|venta": ["Portación de drogas"], "drogas|uso": ["Uso de drogas"], "drogas|sin": ["Portación de drogas"], "amenaza|esc": ["Amenaza o atentado"], "amenaza|tel": ["Amenaza o atentado"], "amenaza|cara": ["Amenaza o atentado"], "bomba|a": ["Amenaza de bomba"], "armas|fuera": ["Portación de arma"], "armas|dentro": ["Portación de arma"] };
function ppAnexo(c, L) {
  if (ppA() && ppA().anexo && ppA().anexo(c, L)) return;
  const hoyK = hoy(), d = new Date(c.inicio), hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"), p = ppProt(c.prot);
  const vals = {};
  if (L === "D") Object.assign(vals, { fecha: ppDia(c.inicio), grado: c.grupo || "", tipo: { sel: p.id === "accidente" ? ["Accidente"] : ["Conducta inadecuada"].filter(() => ["acoso", "violencia", "digital"].includes(p.id)), otro: ["accidente", "acoso", "violencia", "digital"].includes(p.id) ? "" : p.t } });
  if (L === "E") Object.assign(vals, { fecha: ppDia(c.inicio), sit: { sel: PP_SITE[c.prot + "|" + c.caso] || [], otro: PP_SITE[c.prot + "|" + c.caso] ? "" : p.t } });
  if (L === "B") Object.assign(vals, { fecha: hoyK, hora: hm });
  if (L === "C" || L === "F" || L === "G" || L === "H") Object.assign(vals, { fecha: hoyK });
  const abrir = (nuevo) => { if (nuevo) try { localStorage.setItem("ppie-draft-" + L, JSON.stringify({ vals, step: 0 })); } catch (e) {}
    c.anexos = c.anexos || {}; c.anexos[L] = new Date().toISOString(); guardar();
    window.open(ppTLM() + "#ir=" + L, "_blank", "noopener"); };
  let previo = null; try { previo = JSON.parse(localStorage.getItem("ppie-draft-" + L) || "null"); } catch (e) {}
  const lleno = previo && previo.vals && Object.values(previo.vals).some(v => v && (typeof v === "string" ? v.trim() : (v.sel || []).length || v.otro));
  if (!lleno) return abrir(true);
  dlg(`<h3>${esc(L === "S" ? "Aviso de accidente" : "Anexo " + L)} · ${esc(PP_ANX[L] || "")}</h3><p class="mb">Ya tiene uno a medio llenar en Tlamatini. ¿Lo continúa o empieza uno nuevo con la fecha y los datos de este caso?</p>
    <div class="fila fin"><button class="btn" id="axSeg">Continuar el que tenía</button><button class="btn p" id="axNue">Empezar uno nuevo</button></div>`, w => {
    w.querySelector("#axSeg").onclick = () => { cerrarDlg(); abrir(false); }; w.querySelector("#axNue").onclick = () => { cerrarDlg(); abrir(true); }; });
}
function ppWhats(c, a) { a = a || "dir"; const p = ppProt(c.prot), k = ppCaso(c), E = ppEscuela(), yn = ppDocente(), nom = a === "sup" ? (E.supNomP || "") : E.dir;
  const txt = `${nom ? "Buen día, " + corto(nom.replace(/^(Mtr[oa]\.|Profr?a?\.)\s*/, "")) + ". " : ""}Le informo que se presentó una situación de *${p.t.toLowerCase()}*${p.casos.length > 1 ? " (" + k.t.toLowerCase() + ")" : ""}${c.grupo ? " en " + c.grupo : ""} a las ${ppHora(c.inicio)}. Ya activé el protocolo del PPIE${a === "sup" ? " y avisé a la Dirección" : " y le entrego el informe por escrito"}. ${yn ? "\n" + yn : ""}`;
  const d = ppDig(a === "sup" ? E.supTel : E.dirTel); window.open("https://wa.me/" + (d ? (d.length === 10 ? "52" + d : d) : "") + "?text=" + encodeURIComponent(txt), "_blank", "noopener"); }
function ppPadres() { const L = ppA() ? ppA().alumnos() : activos(gAct()).map(a => { const x = typeof expDe === "function" ? expDe(a).dat : {}; return { nombre: a.nombre, tels: [[x.tutor, x.tel], [x.tutor2, x.tel2], [x.emerg, x.telE]] }; });
  const fila = a => { const t = (a.tels || []).filter(z => z[1]);
    return `<div class="it" style="align-items:flex-start"><span class="tx"><b>${esc(a.nombre)}</b>${t.length ? `<span class="fila" style="gap:6px;margin-top:6px">${t.map(z => `<a class="pp-c" href="${ppTelHref(z[1])}" style="min-height:38px">📞 ${esc(z[0] || "Teléfono")} · ${esc(z[1])}</a>`).join("")}</span>` : `<small>Sin teléfono registrado en su expediente.</small>`}</span></div>`; };
  dlg(`<h3>👪 Llamar a la familia</h3><p class="small muted mb">${esc(ppA() && ppA().notaAlumnos || "Teléfonos registrados en el expediente de cada alumno (Mi grupo › alumno › Expediente).")}</p><input id="ppBus" placeholder="Buscar alumno…" style="width:100%;margin-bottom:10px">
    <div class="lista" id="ppPL">${L.map(fila).join("") || "<p>No hay alumnos en el grupo.</p>"}</div><div class="fila fin mt"><button class="btn" id="ppPC">Cerrar</button></div>`, w => {
    w.querySelector("#ppPC").onclick = cerrarDlg;
    w.querySelector("#ppBus").oninput = e => { const q = ppNrm(e.target.value); w.querySelector("#ppPL").innerHTML = L.filter(a => ppNrm(a.nombre).includes(q)).map(fila).join(""); }; }); }
function ppPedirTel(k) { ir("ppieContactos"); }
function ppInfo(k) { const x = PPIE_TEL[k] || {}, E = ppEscuela();
  dlg(`<h3>${esc(x.t || "")}</h3>${E.mun ? `<p class="mb">No hay un teléfono de esta institución para ${esc(E.mun)} en el directorio del PPIE.</p>` : `<p class="mb">Indique el municipio de su escuela para mostrar el teléfono que corresponde.</p>
    <select id="ppMun" style="width:100%">${["", "San Quintín", "Ensenada", "Playas de Rosarito", "Tijuana", "Tecate", "Mexicali", "San Felipe"].map(m => `<option>${m}</option>`).join("")}</select>`}
    ${x.mail ? `<p>Correo: <a href="mailto:${esc(x.mail)}">${esc(x.mail)}</a></p>` : ""}${x.wa ? `<p><a class="pp-c wa" href="https://wa.me/52${ppDig(x.wa)}" target="_blank" rel="noopener">💬 WhatsApp ${esc(x.wa)}</a></p>` : ""}
    <p class="small muted">Si es una emergencia, llame al 911.</p><div class="fila fin mt"><a class="btn" href="tel:911" style="background:#B91C1C;color:#fff">📞 911</a><button class="btn p" id="piOk">Listo</button></div>`, w => {
    w.querySelector("#piOk").onclick = () => { const m = w.querySelector("#ppMun"); if (m && m.value) { ppContDe(ppEscBase()).mun = m.value; guardar(); } cerrarDlg(); ppRe(); }; }); }

/* ---------- el caso: pasos para palomear con hora ---------- */
VISTAS.ppieCaso = () => { const c = ppDe(S.pid); if (!c) return VISTAS.ppie(); const p = ppProt(c.prot), k = ppCaso(c), E = ppEscuela(), hechos = c.hechos || {};
  const n = Object.keys(hechos).length, emg = p.emergencia && !c.cerrado && !S.verPasos && n === 0;
  if (emg) return barra("Emergencia · PPIE", `${p.e} ${esc(p.t)}`) + `<main class="wrap"><section class="pp-em mt"><h2>${esc(k.t !== p.t ? k.t : p.t)}</h2>
     <a class="pp-911" href="tel:911">📞 LLAMAR AL 911</a><ol>${(p.clave || []).map(x => `<li>${esc(x)}</li>`).join("")}</ol>
     ${p.id === "tirador" ? `<div class="pp-atice">${PPIE_ATICE.map(([l, t, d]) => `<div style="color:#1E2A40"><b class="l">${l}</b><span><b>${t}.</b> ${esc(d)}</span></div>`).join("")}</div>` : ""}
     <button class="btn mt" id="ppVer" style="width:100%;background:#fff;color:#7F1D1D;font-weight:800">Ver todos los pasos del protocolo</button></section>${ppAvisoHTML(c)}${ppPie()}</main>`;
  let fase = "";
  const pasos = k.pasos.map((x, i) => { const h = hechos[i], mio = x.q === "doc" || x.q === "todos";
    const fz = x.fase && x.fase !== fase ? (fase = x.fase, `<div class="pp-fase">${esc(x.fase)}</div>`) : "";
    return `${fz}<div class="pp-paso${h ? " hecho" : ""}${mio ? "" : " otro"}"><button class="pp-num" data-ph="${i}" aria-label="Marcar paso ${i + 1} como hecho">${h ? "✓" : i + 1}</button><div class="pp-tx">
      <span class="pp-q ${x.q}">${PP_Q[x.q]}</span><p>${esc(x.t)}</p>${(x.sub || []).length ? `<ul>${x.sub.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}${x.nota ? `<div class="nota">💡 ${esc(x.nota)}</div>` : ""}
      ${x.sipir ? `<div class="pp-sipir">${PPIE_SIPIR.map(([a, b]) => `<div><b>${a}:</b> ${esc(b)}</div>`).join("")}<div style="background:#B91C1C;color:#fff;font-weight:800;text-align:center">Si hay uno o más de estos signos: llame al 911</div></div>` : ""}
      ${x.atice ? `<div class="pp-atice">${PPIE_ATICE.map(([l, t, d]) => `<div><b class="l">${l}</b><span><b>${t}.</b> ${esc(d)}</span></div>`).join("")}</div>` : ""}
      ${(x.a || []).length ? `<div class="pp-acc">${x.a.map(ppAccHTML).join("")}</div>` : ""}${h ? `<div class="pp-hora">Hecho a las ${ppHora(h)}</div>` : ""}</div></div>`; }).join("");
  return barra("Protocolo PPIE" + (c.cerrado ? " · cerrado" : ""), `${p.e} ${esc(p.t)}`) + `<main class="wrap">
   <section class="card mt" style="border-left:6px solid ${p.c}"><p style="margin:0"><b>${esc(p.casos.length > 1 ? k.t : p.d)}</b></p>
    <p class="small muted" style="margin:6px 0 0">${esc(c.escuela || E.escuela)}${c.grupo ? " · " + esc(c.grupo) : ""} · inició ${ppFH(c.inicio)} · <b>${n} de ${k.pasos.length}</b> pasos</p>
    ${ppAvisoHTML(c)}</section>
   ${!c.cerrado ? `<div class="pp-llamar"><a class="pp-c" href="tel:911" style="background:#B91C1C;color:#fff !important;border-color:#B91C1C">📞 911</a>${ppAccHTML("tel:dir")}${ppAccHTML("wa:dir")}${ppAccHTML("tel:sup")}${!E.z050 || E.supTel ? ppAccHTML("wa:sup") : ""}${E.otros.map(x => `<a class="pp-c" href="${ppTelHref(x.n)}">📞 ${esc(x.t || x.n)}</a>`).join("")}</div>` : ""}
   ${p.señales ? `<section class="card mt"><p class="small" style="margin:0 0 4px"><b>Señales de alerta</b></p><ul style="margin:0 0 0 18px;font-size:14.5px">${p.señales.map(s => `<li>${esc(s)}</li>`).join("")}</ul></section>` : ""}
   ${p.aviso ? `<div class="aviso mt"><span>ℹ️</span><span class="small">${esc(p.aviso)}</span></div>` : ""}
   <h2 class="sec-t">Pasos</h2><p class="small muted" style="margin:-4px 2px 10px">Toque el número cuando termine cada paso: queda la hora. Los pasos de la Dirección y la Supervisión se muestran para que sepa lo que sigue.</p>
   <div class="lista">${pasos}</div>
   <h2 class="sec-t">Notas del caso<small>Solo en este celular</small></h2>
   <div class="lista" id="ppNotas">${(c.notas || []).map(x => `<div class="pp-nota"><small>${ppFH(x.f)}</small>${esc(x.t).replace(/\n/g, "<br>")}</div>`).join("") || `<p class="small muted">Anote lo que vio o escuchó, con las palabras del alumno entre comillas. Le servirá para llenar los anexos.</p>`}</div>
   ${!c.cerrado ? `<textarea id="ppNT" rows="3" placeholder="Escriba una nota…" style="width:100%;margin-top:8px"></textarea><div class="fila"><button class="btn s" id="ppNG">${ic("mas", 15)} Agregar nota</button><button class="btn s" id="ppCop">${ic("doc", 15)} Copiar cronología</button></div>` : `<div class="fila"><button class="btn s" id="ppCop">${ic("doc", 15)} Copiar cronología</button></div>`}
   <div class="fila mt" style="justify-content:space-between">${c.cerrado ? `<button class="btn" id="ppReab">Reabrir el caso</button>` : `<button class="btn p" id="ppCerrar">${ic("check", 16)} Cerrar el caso</button>`}<button class="btn r" id="ppBor">${ic("basura", 15)} Borrar</button></div>
   ${ppPie()}</main>`; };
function ppCronologia(c) { const p = ppProt(c.prot), k = ppCaso(c);
  const L = [`${p.t}${p.casos.length > 1 ? " · " + k.t : ""} — ${c.escuela || ""}${c.grupo ? ", " + c.grupo : ""}`, `Inicio: ${ppFH(c.inicio)}`];
  const ev = [];
  Object.entries(c.hechos || {}).forEach(([i, f]) => ev.push([f, "Paso " + (+i + 1) + ": " + k.pasos[i].t]));
  (c.notas || []).forEach(x => ev.push([x.f, "Nota: " + x.t]));
  ev.sort((a, b) => a[0].localeCompare(b[0])).forEach(([f, t]) => L.push(ppHora(f) + " — " + t));
  if (c.cerrado) L.push("Cierre: " + ppFH(c.cerrado));
  return L.join("\n"); }
ENLAZAR.ppieCaso = () => { const c = ppDe(S.pid); if (!c) return; const k = ppCaso(c);
  if (c.aviso && (c.aviso.pend || c.aviso.pendAv) && !c.enviando) ppEnviar(c);
  const v = $("#ppVer"); if (v) v.onclick = () => { S.verPasos = 1; ppRe(); };
  $$("[data-ph]").forEach(b => b.onclick = () => { if (c.cerrado) return toast("El caso está cerrado. Reábralo para cambiarlo.");
    const i = b.dataset.ph; c.hechos = c.hechos || {}; if (c.hechos[i]) delete c.hechos[i]; else c.hechos[i] = new Date().toISOString(); ppAvance(c); ppRe(); });
  const ng = $("#ppNG"); if (ng) ng.onclick = () => { const t = $("#ppNT").value.trim(); if (!t) return toast("Escriba la nota."); c.notas = c.notas || []; c.notas.push({ f: new Date().toISOString(), t }); guardar(); ppRe(); };
  if ($("#ppCop")) $("#ppCop").onclick = () => { const t = ppCronologia(c); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast("<b>Cronología copiada.</b> Péguela en la descripción del anexo.")).catch(() => dlg(`<h3>Cronología</h3><textarea rows="12" style="width:100%">${esc(t)}</textarea><div class="fila fin mt"><button class="btn p" onclick="cerrarDlg()">Listo</button></div>`)); };
  const ce = $("#ppCerrar"); if (ce) ce.onclick = async () => { const n = Object.keys(c.hechos || {}).length;
    if (!(await confirmar(n < k.pasos.length ? `Lleva ${n} de ${k.pasos.length} pasos. ¿Cerrar el caso de todos modos? (Los pasos de la Dirección y la Supervisión pueden quedar a cargo de ellas.)` : "¿Cerrar el caso?", "Sí, cerrar"))) return;
    c.cerrado = new Date().toISOString(); ppAvance(c); ppRe(); };
  const ra = $("#ppReab"); if (ra) ra.onclick = () => { c.cerrado = ""; ppAvance(c); ppRe(); };
  if ($("#ppBor")) $("#ppBor").onclick = async () => { if (!(await confirmar("Se borrará este caso de su celular (con sus notas). El aviso que ya recibieron la Dirección y la Supervisión no se borra.", "Sí, borrar"))) return;
    D.ppie = ppD().filter(x => x !== c); guardar(); ir("ppie", {}, true); };
};
/* Clics de las acciones (se delegan para que funcionen también dentro de los diálogos) */
function ppClick(e) { if (S.v !== "ppieCaso") return;
  const c = ppDe(S.pid); if (!c) return; const b = e.target.closest("[data-pa],[data-pt],[data-pw],[data-px],[data-pinfo],#ppReAv"); if (!b) return;
  if (b.id === "ppReAv") return ppEnviar(c);
  if (b.dataset.pa) return ppPadres();
  if (b.dataset.pt) return ppPedirTel(b.dataset.pt);
  if (b.dataset.pw) return ppWhats(c, b.dataset.pw);
  if (b.dataset.px) return ppAnexo(c, b.dataset.px);
  if (b.dataset.pinfo) return ppInfo(b.dataset.pinfo); }
document.addEventListener("click", ppClick);
/* Si la pantalla de inicio se pintó antes de cargar este archivo, se vuelve a pintar para que aparezca el botón */
setTimeout(() => { try { if (S && S.v === "inicio" && $("#app") && !$("#bSOS") && !$("#velo")) ppRe(); } catch (e) {} }, 0);
