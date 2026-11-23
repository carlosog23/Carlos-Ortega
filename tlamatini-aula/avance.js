/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Tlamatini Aula.
   AVANCE DEL PROGRAMA: qué contenidos del Programa Sintético (Plan 2022) ya se trabajaron con el grupo en el ciclo.
   Se marcan solos con las planeaciones de la app, con las fotos de la guía de editorial o de la planeación del
   docente (Tlami reconoce los contenidos y el docente confirma) y a mano. Solo primaria (fases 3, 4 y 5). */
"use strict";
const AVR = () => (D.avr = D.avr || []);
const avKey = (f, campo, c) => f + "|" + nrm(campoKey(campo)) + "|" + nrm(c);
const avAplica = g => g && !esSec(g) && !esPre(g);
const avFases = g => [...new Set(g.grados.map(faseDe))].sort();
const avPda = () => PDA || LS("aula-pda");
function avanceDe(g, pda) {
  const H = {}, add = (k, o) => (H[k] = H[k] || []).push(o);
  D.planes.filter(p => p.gid === g.id && !p.disc).forEach(p => Object.entries(p.contenidos || {}).forEach(([f, c]) => add(avKey(+f, p.campo, c), { src: "plan", t: p.titulo, f: p.ini, id: p.id, dado: p.sesiones.some(s => s.hecho) })));
  AVR().filter(r => r.gid === g.id).forEach(r => (r.conts || []).forEach(x => add(avKey(x.f, x.campo, x.c), { src: r.src, t: r.t, f: r.fecha, id: r.id, dado: true })));
  const fs = avFases(g);
  const campos = CAMPOS.map(campo => { const filas = fs.flatMap(f => PDA_TXT(pda, campo, f).map((x, i) => { const h = H[avKey(f, campo, x.c)] || null; return { f, i, c: x.c, h, est: !h ? 0 : h.some(o => o.dado) ? 2 : 1 }; }));
    return { campo, filas, n: filas.length, ok: filas.filter(x => x.est === 2).length, pl: filas.filter(x => x.est === 1).length }; });
  const n = campos.reduce((s, c) => s + c.n, 0), ok = campos.reduce((s, c) => s + c.ok, 0), pl = campos.reduce((s, c) => s + c.pl, 0);
  return { campos, n, ok, pl, pct: n ? Math.round(100 * ok / n) : 0 };
}
const avFuente = o => o.src === "plan" ? `Planeación «${esc(o.t)}»${o.dado ? "" : " (aún sin sesiones dadas)"}` : o.src === "guia" ? `${esc(o.t || "Fotos de guía o planeación")}` : "Marcado a mano";
const avBarra = (ok, pl, n) => `<span class="av-bar"><i style="width:${n ? 100 * ok / n : 0}%"></i><b style="width:${n ? 100 * pl / n : 0}%"></b></span>`;

VISTAS.avance = () => { const g = gAct(); if (!g) return VISTAS.inicio();
  if (!avAplica(g)) return barra("Avance del programa", esc(grNom(g))) + `<main class="wrap"><div class="vacio mt">El avance del programa está disponible para grupos de primaria.</div></main>`;
  const pda = avPda(); if (!pda) { programa().then(p => p && S.v === "avance" && re()); return barra("Avance del programa", esc(grNom(g))) + `<main class="wrap"><p class="muted mt">Cargando el Programa Sintético…</p></main>`; }
  const A = avanceDe(g, pda), fs = avFases(g), varias = fs.length > 1, abierto = S.cmp || "";
  const regs = AVR().filter(r => r.gid === g.id && r.src === "guia").sort((a, b) => b.fecha.localeCompare(a.fecha));
  return barra("Avance del programa · " + esc(grNom(g)), "Ciclo 2026-2027") + `<main class="wrap">
  <section class="card mt av-res"><div class="fila" style="justify-content:space-between;align-items:flex-end"><div><div class="av-pct">${A.pct}%</div><p class="small muted" style="margin:0">${A.ok} de ${A.n} contenidos trabajados${A.pl ? ` · ${A.pl} planeados` : ""}</p></div>
    <div class="av-ley small"><span><i class="av-d ok"></i>Trabajado</span><span><i class="av-d pl"></i>Planeado</span><span><i class="av-d no"></i>Pendiente</span></div></div>
    ${avBarra(A.ok, A.pl, A.n)}
    <p class="small muted mt">Son todos los contenidos del Programa Sintético de ${varias ? "las fases de su grupo" : "su fase"}. Se marcan solos con sus planeaciones de Tlamatini Aula y con las fotos de su guía o de su planeación.</p>
    <div class="fila mt"><label class="btn p" style="cursor:pointer">${ic("camara", 18)} Subir fotos de mi guía o planeación<input type="file" id="avF" multiple accept="image/*,application/pdf" hidden></label><button class="btn" id="avM">${ic("check", 16)} Marcar a mano</button></div></section>
  ${A.campos.map(C => `<section class="card mt"><button class="av-cab" data-cmp="${esc(C.campo)}" aria-expanded="${abierto === C.campo}"><span><b>${esc(C.campo)}</b><small>${C.ok} de ${C.n} trabajados${C.pl ? ` · ${C.pl} planeados` : ""}</small></span><span class="av-n">${C.n ? Math.round(100 * C.ok / C.n) : 0}%</span></button>${avBarra(C.ok, C.pl, C.n)}
    ${abierto === C.campo ? `<div class="av-lista mt">${C.filas.map(x => `<div class="av-it e${x.est}"><span class="av-d ${["no", "pl", "ok"][x.est]}"></span><div class="tx"><b>${esc(x.c)}</b>${varias ? `<small>${esc(pda.fases[x.f].nombre)}</small>` : ""}${x.h ? `<small>${x.h.map(o => avFuente(o) + (o.f ? " · " + fCorta(o.f) : "")).join("<br>")}</small>` : ""}</div>
      <div class="av-ac">${x.est ? (x.h.some(o => o.src === "manual") ? `<button class="btn s" data-avq="${x.f}|${x.i}">Quitar</button>` : "") : `<button class="btn s" data-avp="${x.f}|${x.i}">Planear</button><button class="btn s" data-avm="${x.f}|${x.i}">Ya lo vi</button>`}</div></div>`).join("")}</div>` : ""}</section>`).join("")}
  ${regs.length ? `<h2 class="sec-t mt2">Fotos subidas</h2><div class="lista mt">${regs.map(r => `<button class="it btnit" data-avr="${r.id}"><span class="av">${ic("camara", 18)}</span><span class="tx"><b>${esc(r.t || "Fotos de guía o planeación")}</b><small>${fCorta(r.fecha)} · ${(r.fotos || []).length} foto${(r.fotos || []).length === 1 ? "" : "s"} · ${r.conts.length} contenido${r.conts.length === 1 ? "" : "s"}</small></span>${ic("sig", 16)}</button>`).join("")}</div>` : ""}
  </main>`; };

ENLAZAR.avance = () => { const g = gAct(), pda = avPda(); if (!g || !pda || !avAplica(g)) return;
  const fila = (campo, v) => { const [f, i] = v.split("|").map(Number); return { f, i, campo, c: PDA_TXT(pda, campo, f)[i].c }; };
  $$("[data-cmp]").forEach(b => b.onclick = () => { S.cmp = S.cmp === b.dataset.cmp ? "" : b.dataset.cmp; re(); });
  $$("[data-avm]").forEach(b => b.onclick = () => { const x = fila(S.cmp, b.dataset.avm); AVR().push({ id: uid(), gid: g.id, fecha: hoy(), src: "manual", t: "", conts: [{ f: x.f, campo: x.campo, c: x.c }] }); guardar(); re(); toast("Contenido marcado como trabajado."); });
  $$("[data-avq]").forEach(b => b.onclick = () => { const x = fila(S.cmp, b.dataset.avq), k = avKey(x.f, x.campo, x.c);
    D.avr = AVR().map(r => r.gid === g.id && r.src === "manual" ? Object.assign(r, { conts: r.conts.filter(y => avKey(y.f, y.campo, y.c) !== k) }) : r).filter(r => r.src !== "manual" || r.conts.length); guardar(); re(); });
  $$("[data-avp]").forEach(b => b.onclick = () => { const x = fila(S.cmp, b.dataset.avp); const sel = {}; sel[x.f] = x.i;
    S.P = { campo: x.campo, sel, metodo: "", escenario: "aula", ejes: [], titulo: "", proposito: "", ini: diasHabiles(hoy(), 1)[0] || hoy(), n: 5, min: 50, producto: "" }; ir("planNueva", { P: S.P }); });
  $("#avM").onclick = () => avElegir(g, pda, [], null);
  $("#avF").onchange = e => { const L = [...e.target.files]; e.target.value = ""; if (L.length) avSubir(g, pda, L); };
  $$("[data-avr]").forEach(b => b.onclick = () => avVerRegistro(g, pda, AVR().find(r => r.id === b.dataset.avr))); };

/* lista numerada de los contenidos del grupo, para Tlami y para elegir a mano */
function avCatalogo(g, pda) { const out = []; avFases(g).forEach(f => CAMPOS.forEach(campo => PDA_TXT(pda, campo, f).forEach(x => out.push({ f, campo, c: x.c })))); return out; }

async function avSubir(g, pda, files) {
  let L, fotos = [];
  try { L = await lecLeer(files); } catch (e) { return tlamiError(e); }
  for (const f of files) if (/^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name || "")) { try { const u = await comprimir(f, 1400, .7), id = uid(); FOTO[id] = u; await idbOp("readwrite", s => s.put(u, id)); fotos.push(id); } catch (e) {} }
  const cat = avCatalogo(g, pda); let ids = [], titulo = "";
  tlamiEspera("Revisando sus fotos para reconocer qué contenidos del programa se trabajan en ellas.");
  try { const j = await aulaPost("aulaIA", { modo: "avance", grados: g.grados, nivel: nivelTxt(g), archivos: L.archivos,
      contenidos: cat.map((x, i) => `${i + 1}. [${x.campo} · ${pda.fases[x.f].nombre}] ${x.c}`).join("\n") }, 180000), r = j.r || {};
    ids = (r.ids || []).map(n => parseInt(n, 10) - 1).filter(n => n >= 0 && n < cat.length); titulo = String(r.titulo || "").trim(); cerrarDlg(); }
  catch (e) { cerrarDlg(); toast("Tlami no pudo revisar las fotos ahora (" + esc(e.message) + "). Elija usted los contenidos.", 6000); }
  avElegir(g, pda, ids.map(i => cat[i]), { fotos, titulo, nombres: L.nombres });
}

/* diálogo para confirmar o elegir contenidos; si trae fotos, se guarda como registro de guía o planeación */
function avElegir(g, pda, pre, extra) { const cat = avCatalogo(g, pda), ya = new Set(pre.map(x => avKey(x.f, x.campo, x.c))), varias = avFases(g).length > 1; let campo = (pre[0] || {}).campo || CAMPOS[0];
  const marcados = new Set(ya);
  const pinta = v => { const L = cat.filter(x => x.campo === campo);
    v.querySelector("#aeL").innerHTML = L.map(x => { const k = avKey(x.f, x.campo, x.c); return `<label class="av-ck"><input type="checkbox" data-k="${esc(k)}" ${marcados.has(k) ? "checked" : ""}><span>${esc(x.c)}${varias ? ` <small class="muted">· ${esc(pda.fases[x.f].nombre)}</small>` : ""}</span></label>`; }).join("");
    v.querySelectorAll("[data-ae]").forEach(b => { const n = cat.filter(x => x.campo === b.dataset.ae && marcados.has(avKey(x.f, x.campo, x.c))).length; b.setAttribute("aria-pressed", b.dataset.ae === campo); b.textContent = b.dataset.ae + (n ? " · " + n : ""); });
    v.querySelectorAll("#aeL input").forEach(i => i.onchange = () => { i.checked ? marcados.add(i.dataset.k) : marcados.delete(i.dataset.k); v.querySelector("#aeN").textContent = marcados.size; pinta(v); }); };
  dlg(`<h3>${extra ? "¿Qué contenidos se trabajan en sus fotos?" : "Marcar contenidos trabajados"}</h3>
    <p class="small muted mb">${extra ? (pre.length ? `Tlami reconoció <b>${pre.length}</b> contenido${pre.length === 1 ? "" : "s"}; ya están marcados. Revise y corrija si hace falta.` : "Elija los contenidos que se trabajan en esas páginas.") : "Elija los contenidos que ya trabajó con su grupo aunque no los haya planeado en la app."}</p>
    ${extra ? `<label class="campo"><span>Descripción (para encontrarlas después)</span><input id="aeT" value="${esc(extra.titulo || "")}" placeholder="Ej. Guía 4.°, lecciones 12 a 15"></label>` : ""}
    <div class="chips">${CAMPOS.map(c => `<button type="button" class="chip" data-ae="${esc(c)}">${esc(c)}</button>`).join("")}</div>
    <div id="aeL" class="av-sel mt"></div>
    <div class="fila fin mt"><button class="btn" id="aeX">Cancelar</button><button class="btn p" id="aeOk">${ic("check", 16)} Guardar · <span id="aeN">${marcados.size}</span></button></div>`, v => {
    v.querySelectorAll("[data-ae]").forEach(b => b.onclick = () => { campo = b.dataset.ae; pinta(v); }); pinta(v);
    v.querySelector("#aeX").onclick = () => { cerrarDlg(); if (extra && extra.fotos.length) extra.fotos.forEach(id => idbOp("readwrite", s => s.delete(id)).catch(() => {})); };
    v.querySelector("#aeOk").onclick = () => { if (!marcados.size) return toast("Marque al menos un contenido.");
      const conts = cat.filter(x => marcados.has(avKey(x.f, x.campo, x.c))).map(x => ({ f: x.f, campo: x.campo, c: x.c }));
      AVR().push({ id: uid(), gid: g.id, fecha: hoy(), src: extra ? "guia" : "manual", t: extra ? (v.querySelector("#aeT").value.trim() || "Fotos de guía o planeación") : "", fotos: extra ? extra.fotos : [], conts });
      guardar(); cerrarDlg(); re(); toast(`<b>Avance actualizado:</b> ${conts.length} contenido${conts.length === 1 ? "" : "s"}.`, 3500); }; });
}

async function avVerRegistro(g, pda, r) { if (!r) return;
  dlg(`<h3>${esc(r.t || "Fotos de guía o planeación")}</h3><p class="small muted">${fCorta(r.fecha)}</p>
    <div class="av-fotos mt">${(r.fotos || []).map(id => `<img data-src="${id}" alt="">`).join("") || `<p class="small muted">Se subió como PDF; no se guardaron fotos.</p>`}</div>
    <p class="small mt"><b>Contenidos:</b></p><ul class="small">${r.conts.map(x => `<li>${esc(x.c)} <span class="muted">· ${esc(x.campo)}</span></li>`).join("")}</ul>
    <div class="fila fin mt"><button class="btn r" id="arB">Borrar</button><button class="btn p" id="arX">Cerrar</button></div>`, async v => {
    v.querySelector("#arX").onclick = cerrarDlg;
    v.querySelector("#arB").onclick = async () => { if (!(await confirmar("Se borrarán estas fotos y su marca en el avance. Sus planeaciones no cambian.", "Borrar"))) return; (r.fotos || []).forEach(id => idbOp("readwrite", s => s.delete(id)).catch(() => {})); D.avr = AVR().filter(x => x !== r); guardar(); re(); };
    for (const i of v.querySelectorAll("img[data-src]")) { i.src = await fotoGet(i.dataset.src) || ""; i.onclick = () => window.open(i.src, "_blank"); } });
}

/* resumen corto para la tarjeta del inicio */
function avResumen(g) { if (!avAplica(g)) return null; const pda = avPda(); if (!pda) return null; return avanceDe(g, pda); }
