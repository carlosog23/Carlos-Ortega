/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Planear con más libertad:
   - Variedad: cada planeación elige juegos distintos del fichero (Tlamatini + juegos de la comunidad), según la fase,
     sin repetir dentro de la planeación y evitando los que ya se usaron en las planeaciones recientes del mismo grupo.
   - Actividades propias: en cada momento de la sesión la maestra o el maestro puede escribir su propia actividad;
     se guarda en «Mis actividades» y se puede volver a usar.
   - Subir mi planeación (PDF, Word, foto o texto): se guarda como complemento y, si trae «Sesión 1, Sesión 2…»,
     se reparte en las notas de cada sesión.
   - Planeaciones por grado o por fase, para no mezclar los PDA de distintos grados. */
"use strict";
EST_COL["Mi actividad"] = "#1F6F8B";
function propiosAJuegos() { if (D.propios) Object.assign(JUEGOS, D.propios); }
propiosAJuegos();

/* ---------- variedad ---------- */
const ROL_EST = {
  act: ["Persecución", "Juego motor", "Juego tradicional", "Relevos"],
  calma: ["Vuelta a la calma", "Equilibrio"],
  planB: ["Expresión corporal", "Equilibrio", "Manipulación de objetos", "Vuelta a la calma", "Cooperativo"],
  "Diagnóstico": ["Juego motor", "Cooperativo", "Persecución", "Juego tradicional"],
  "Cooperativo": ["Cooperativo", "Manipulación de objetos", "Relevos", "Juego motor"],
  "Oposición y estrategia": ["Oposición y estrategia", "Persecución", "Relevos"],
  "Juego modificado": ["Manipulación de objetos", "Oposición y estrategia", "Juego modificado"],
  "Creatividad motriz": ["Expresión corporal", "Cuento motor", "Juego motor", "Creatividad motriz"],
  "Rally": ["Circuito de acción motriz", "Relevos", "Cooperativo", "Rally"],
  "Circuito de acción motriz": ["Circuito de acción motriz", "Equilibrio", "Manipulación de objetos"],
  "Consolidación": ["Juego motor", "Manipulación de objetos", "Oposición y estrategia", "Cooperativo", "Relevos"]
};
const EVAL_EST = {
  "Cooperativo": "¿escuchan las ideas de todos y se ayudan para lograr la meta?",
  "Oposición y estrategia": "¿toman decisiones, cambian de estrategia y respetan los acuerdos aunque vayan perdiendo?",
  "Juego modificado": "¿buscan espacios libres, se comunican y participan todos?",
  "Creatividad motriz": "¿proponen variantes y las explican a su equipo?",
  "Rally": "¿superan los retos organizándose en equipo?", "Circuito de acción motriz": "¿controlan su cuerpo y superan cada estación?",
  "Diagnóstico": "¿quién propone, quién coopera y quién respeta los acuerdos?", "Consolidación": "¿aplican lo aprendido en las sesiones anteriores?"
};
const PARA_EST = {
  "Cooperativo": "Lograr una meta común ayudándonos entre todos.", "Oposición y estrategia": "Tomar decisiones estratégicas para superar al otro equipo respetando los acuerdos.",
  "Juego modificado": "Ubicarnos en el espacio y comunicarnos con el equipo para jugar mejor.", "Creatividad motriz": "Crear y probar nuevas formas de movernos y de jugar.",
  "Diagnóstico": "Descubrir cómo jugamos en equipo y qué acuerdos necesitamos.", "Rally": "Superar retos en equipo.", "Circuito de acción motriz": "Controlar el cuerpo en distintos retos motores.",
  "Consolidación": "Poner en práctica lo aprendido en las sesiones anteriores."
};
const FIJOS = ["inventamos", "rally", "circuito"];   // juegos que son la sesión misma: se conservan
const fasesDeGrupos = ids => [...new Set(ids.map(grDe).filter(Boolean).map(g => faseDe(g.grado)))];
const juegoEnFase = (j, fases) => !fases.length || !j.fases || !j.fases.length || fases.some(f => j.fases.includes(f));
function poolJ(ests, fases) { return Object.keys(JUEGOS).filter(k => { const j = JUEGOS[k]; return j && ests.includes(j.est) && juegoEnFase(j, fases); }); }
function usadosRecientes(grupos, sinPlan) { const m = new Set();
  D.planes.filter(p => p.id !== sinPlan && (p.grupos || []).some(g => grupos.includes(g))).slice(-4)
    .forEach(p => p.sesiones.forEach(s => [s.act, ...(s.ppal || []), s.calma, s.planB].filter(Boolean).forEach(k => m.add(k))));
  return m; }
function elegirJ(ests, fases, ya, rec, def) {
  const pool = poolJ(ests, fases); let L = pool.filter(k => !ya.has(k) && !rec.has(k));
  if (!L.length) L = pool.filter(k => !ya.has(k)); if (!L.length) L = pool; if (!L.length) return def;
  const k = L[Math.floor(Math.random() * L.length)]; ya.add(k); return k; }
/* base: la sesión del fichero; primera: es la primera vez que aparece en la planeación */
function variarSesion(s, fases, ya, rec, base, primera, cambiarPrincipal) {
  const ests = ROL_EST[s.est] || ROL_EST["Consolidación"], n = Math.max(1, (base ? base.ppal : s.ppal || []).length);
  s.act = elegirJ(ROL_EST.act, fases, ya, rec, s.act);
  const p0 = base && base.ppal[0];
  const conservar = p0 && !cambiarPrincipal && primera && (FIJOS.includes(p0) || !rec.has(p0));
  const ppal = [];
  if (conservar) { ppal.push(p0); ya.add(p0); } else ppal.push(elegirJ(ests, fases, ya, rec, s.ppal[0]));
  while (ppal.length < n) ppal.push(elegirJ(ests, fases, ya, rec, (s.ppal || [])[ppal.length]));
  s.ppal = ppal.filter(Boolean);
  if (!conservar) { s.mg = null; const j = JUEGOS[s.ppal[0]] || {}; if (j.n) s.t = j.n; s.para = PARA_EST[s.est] || s.para; s.eval = `Observe durante «${j.n || "el juego principal"}»: ${EVAL_EST[s.est] || EVAL_EST["Consolidación"]}`; }
  else if (base) { s.mg = base.mg; s.eval = base.eval; s.t = base.t; s.para = base.para; }
  s.calma = elegirJ(ROL_EST.calma, fases, ya, rec, s.calma || "globo");
  s.planB = elegirJ(ROL_EST.planB, fases, ya, rec, s.planB);
  return s; }
const _crearPlanBase = crearPlan;
crearPlan = function (c) {
  const p = _crearPlanBase(c), fases = fasesDeGrupos(c.grupos), ya = new Set(), rec = usadosRecientes(c.grupos), vistos = {};
  const idx = secuencia(c.n);
  p.sesiones.forEach((s, k) => { const i = idx[k], base = EF_SESIONES[i]; vistos[i] = (vistos[i] || 0) + 1; variarSesion(s, fases, ya, rec, base, vistos[i] === 1, false); });
  return p; };
/* «Otros juegos» en una sesión ya hecha */
function otrosJuegos(p, s) { const fases = fasesDeGrupos(p.grupos), ya = new Set(), rec = usadosRecientes(p.grupos, p.id);
  p.sesiones.forEach(x => { if (x !== s) [x.act, ...(x.ppal || []), x.calma, x.planB].filter(Boolean).forEach(k => ya.add(k)); });
  [s.act, ...(s.ppal || []), s.calma, s.planB].filter(Boolean).forEach(k => rec.add(k));
  const mia = k => k && JUEGOS[k] && JUEGOS[k].propio, guarda = { act: s.act, calma: s.calma, planB: s.planB }, ppalMias = (s.ppal || []).map(k => mia(k) ? k : null);
  const base = EF_SESIONES.find(b => b.est === s.est) || null; variarSesion(s, fases, ya, rec, base, false, true);
  Object.keys(guarda).forEach(k => { if (mia(guarda[k])) s[k] = guarda[k]; });   // sus actividades propias no se cambian
  ppalMias.forEach((k, i) => { if (k) s.ppal[i] = k; }); }

/* ---------- actividades propias ---------- */
function guardarPropia(clave, n, txt, est) {
  n = String(n || "").trim(); if (!n) return null; D.propios = D.propios || {};
  const k = clave && D.propios[clave] ? clave : "mi_" + uid();
  const reglas = String(txt || "").split("\n").map(x => x.trim().replace(/^[-•*]\s*/, "")).filter(Boolean);
  D.propios[k] = Object.assign({}, D.propios[k] || { est: est || "Mi actividad", hab: [], plano: "dispersos", mat: [], min: 10, propio: true, creado: hoy() }, { n, reglas: reglas.length ? reglas : [n] });
  JUEGOS[k] = D.propios[k]; return k; }
function opcionesJuego(sel, ests, fases, vacia) {
  const nom = k => (JUEGOS[k] || {}).n || k, orden = L => L.sort((a, b) => nom(a).localeCompare(nom(b), "es"));
  const sug = orden(poolJ(ests, fases)), mias = orden(Object.keys(D.propios || {})), resto = {};
  Object.keys(JUEGOS).forEach(k => { const j = JUEGOS[k]; if (j.propio || sug.includes(k) || !juegoEnFase(j, fases)) return; (resto[j.est] = resto[j.est] || []).push(k); });
  const op = k => `<option value="${esc(k)}" ${k === sel ? "selected" : ""}>${esc(nom(k))}</option>`;
  const fuera = sel && !sug.includes(sel) && !mias.includes(sel) && !Object.values(resto).some(L => L.includes(sel)) && JUEGOS[sel];
  return `${vacia ? `<option value="">— Ninguno —</option>` : ""}<option value="__propia">✍️ Escribir mi propia actividad…</option>
    ${mias.length ? `<optgroup label="Mis actividades">${mias.map(op).join("")}</optgroup>` : ""}
    ${fuera ? `<optgroup label="Actual">${op(sel)}</optgroup>` : ""}
    <optgroup label="Sugeridas para este momento">${sug.map(op).join("")}</optgroup>
    ${Object.keys(resto).sort((a, b) => a.localeCompare(b, "es")).map(e => `<optgroup label="${esc(e)}">${orden(resto[e]).map(op).join("")}</optgroup>`).join("")}`; }
function campoJuego(id, et, sel, ests, fases, vacia) { const j = JUEGOS[sel], mia = j && j.propio;
  return `<label class="campo"><span>${et}</span><select id="${id}" data-jsel="${id}">${opcionesJuego(sel, ests, fases, vacia)}</select></label>
   <div id="${id}_p" class="card" style="margin:-4px 0 12px;padding:12px;${mia ? "" : "display:none"}"><p class="small muted" style="margin:0 0 6px">${mia ? "Su actividad (puede corregirla):" : "Escriba su idea. Se guarda en «Mis actividades» para usarla otra vez."}</p>
    <label class="campo"><span>Nombre</span><input id="${id}_n" value="${mia ? esc(j.n) : ""}" placeholder="Ej. Carrera de canguros"></label>
    <label class="campo" style="margin:0"><span>Cómo se juega (una indicación por renglón)</span><textarea id="${id}_r" rows="3">${mia ? esc((j.reglas || []).join("\n")) : ""}</textarea></label></div>`; }
function enlazarCamposJuego(v) { v.querySelectorAll("[data-jsel]").forEach(s => s.onchange = () => { const id = s.dataset.jsel, j = JUEGOS[s.value], box = v.querySelector("#" + id + "_p");
  const nuevo = s.value === "__propia", mia = j && j.propio; box.style.display = nuevo || mia ? "" : "none";
  v.querySelector("#" + id + "_n").value = mia ? j.n : ""; v.querySelector("#" + id + "_r").value = mia ? (j.reglas || []).join("\n") : "";
  if (nuevo) v.querySelector("#" + id + "_n").focus(); }); }
function leerCampoJuego(id, est) { const s = val(id); if (!s) return "";
  if (s === "__propia") return guardarPropia(null, val(id + "_n"), val(id + "_r"), est) || "";
  if (JUEGOS[s] && JUEGOS[s].propio) guardarPropia(s, val(id + "_n") || JUEGOS[s].n, val(id + "_r"), JUEGOS[s].est);
  return s; }
function editarSesion(p, s, re) {
  const fases = fasesDeGrupos(p.grupos), ests = ROL_EST[s.est] || ROL_EST["Consolidación"];
  dlg(`<h3>Editar sesión</h3><p class="small muted mb">Elija del fichero o escriba sus propias actividades: lo que usted escriba se queda en la planeación y en «Mis actividades».</p>
   <label class="campo"><span>Título</span><input id="sT" value="${esc(s.t)}"></label><label class="campo"><span>Para qué</span><textarea id="sP">${esc(s.para || "")}</textarea></label>
   <label class="campo"><span>Plática inicial</span><textarea id="sC">${esc(s.charla || "")}</textarea></label>
   ${campoJuego("sA", "Activación", s.act, ROL_EST.act, fases, true)}
   ${campoJuego("sJ", "Juego principal", (s.ppal || [])[0], ests, fases, false)}
   ${campoJuego("sJ2", "Segundo juego (opcional)", (s.ppal || [])[1], ests, fases, true)}
   ${campoJuego("sK", "Vuelta a la calma", s.calma, ROL_EST.calma, fases, true)}
   ${campoJuego("sB", "Plan B: si llueve o hace mucho calor (opcional)", s.planB, ROL_EST.planB, fases, true)}
   <label class="campo"><span>Preguntas para el cierre (una por renglón)</span><textarea id="sQ" rows="3">${esc((s.cierre || []).join("\n"))}</textarea></label>
   <label class="campo"><span>Qué observar para evaluar</span><textarea id="sE">${esc(s.eval || "")}</textarea></label>
   <label class="campo"><span>Mis ideas y notas para esta sesión</span><textarea id="sN" rows="4" placeholder="Variantes, adaptaciones para su grupo, material extra, lo que usted quiera agregar">${esc(s.nota || "")}</textarea></label>
   <div class="fila fin"><button class="btn" id="sX">Cancelar</button><button class="btn p" id="sOk">Guardar</button></div>`, v => {
    enlazarCamposJuego(v); v.querySelector("#sX").onclick = cerrarDlg;
    v.querySelector("#sOk").onclick = () => { const antes = (s.ppal || [])[0];
      if (val("sJ") === "__propia" && !val("sJ_n").trim()) return toast("Escriba el nombre de su juego principal.");
      const act = leerCampoJuego("sA", "Mi actividad"), j1 = leerCampoJuego("sJ", "Mi actividad"), j2 = leerCampoJuego("sJ2", "Mi actividad"), calma = leerCampoJuego("sK", "Mi actividad"), pb = leerCampoJuego("sB", "Mi actividad");
      Object.assign(s, { t: val("sT"), para: val("sP"), charla: val("sC"), act, ppal: [j1, j2].filter(Boolean), calma, planB: pb,
        cierre: val("sQ").split("\n").map(x => x.trim()).filter(Boolean), eval: val("sE"), nota: val("sN").trim() });
      if (j1 !== antes) s.mg = null; guardar(); cerrarDlg(); re(); toast("Sesión guardada."); }; }); }
function formPropia(k, listo) { const j = k ? D.propios[k] : null;
  dlg(`<h3>${j ? "Editar mi actividad" : "Nueva actividad propia"}</h3>
   <label class="campo"><span>Nombre</span><input id="mN" value="${esc(j ? j.n : "")}" placeholder="Ej. Carrera de canguros"></label>
   <label class="campo"><span>Tipo</span><select id="mE">${["Mi actividad", ...new Set(Object.values(JUEGOS).map(x => x.est))].filter((x, i, a) => a.indexOf(x) === i).map(e => `<option ${j && j.est === e ? "selected" : ""}>${esc(e)}</option>`).join("")}</select></label>
   <label class="campo"><span>Cómo se juega (una indicación por renglón)</span><textarea id="mR" rows="5">${esc(j ? (j.reglas || []).join("\n") : "")}</textarea></label>
   <label class="campo"><span>Minutos</span><input type="number" id="mM" min="3" max="60" value="${j ? j.min : 10}"></label>
   <div class="fila fin">${j ? `<button class="btn r" id="mB">${ic("basura", 16)}</button>` : ""}<button class="btn" id="mX">Cancelar</button><button class="btn p" id="mOk">Guardar</button></div>`, v => {
    v.querySelector("#mX").onclick = cerrarDlg;
    if (j) v.querySelector("#mB").onclick = async () => { if (!(await confirmar(`¿Quitar «${j.n}» de Mis actividades? Las sesiones que ya la usan la conservan.`, "Quitar"))) return; JUEGOS[k] = Object.assign({}, j, { quitado: true }); delete D.propios[k]; guardar(); pintar(); };
    v.querySelector("#mOk").onclick = () => { const kk = guardarPropia(k, val("mN"), val("mR"), val("mE")); if (!kk) return toast("Escriba el nombre."); D.propios[kk].min = Math.max(3, +val("mM") || 10); guardar(); cerrarDlg(); listo ? listo(kk) : pintar(); toast("Actividad guardada en Mis actividades."); }; }); }

/* ---------- fichero de juegos con filtros ---------- */
function ficheroHTML(p) {
  const fases = p ? fasesDeGrupos(p.grupos) : [], q = String(S.fq || "").toLowerCase(), fe = S.fe || "", todasF = !!S.ftf;
  const L = Object.entries(JUEGOS).filter(([k, j]) => !j.quitado && (todasF || juegoEnFase(j, fases)) && (!fe || (fe === "__mias" ? j.propio : j.est === fe))
    && (!q || (j.n + " " + (j.reglas || []).join(" ")).toLowerCase().includes(q))).sort((a, b) => (!!b[1].propio - !!a[1].propio) || a[1].n.localeCompare(b[1].n, "es"));
  const ests = [...new Set(Object.values(JUEGOS).filter(j => !j.quitado).map(j => j.est))].sort((a, b) => a.localeCompare(b, "es")), max = S.fmax || 40;
  return `<section class="card mt"><div class="fila" style="justify-content:space-between"><h3 style="margin:0">Fichero de juegos · ${L.length}</h3><button class="btn s p" id="fNueva">${ic("mas", 16)} Mi actividad</button></div>
   <input id="fQ" type="search" placeholder="Buscar un juego…" value="${esc(S.fq || "")}" style="width:100%;margin-top:10px">
   <div class="chips mt"><button class="chip" data-fe="" aria-pressed="${!fe}">Todos</button>${Object.keys(D.propios || {}).length ? `<button class="chip" data-fe="__mias" aria-pressed="${fe === "__mias"}">Mis actividades</button>` : ""}${ests.map(e => `<button class="chip" data-fe="${esc(e)}" aria-pressed="${fe === e}">${esc(e)}</button>`).join("")}</div>
   ${fases.length ? `<label class="small mt" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="fTF" ${todasF ? "checked" : ""}> Ver también los de otras fases (esta planeación es de fase ${fases.join(" y ")})</label>` : ""}</section>
   <div class="puertas mt">${L.slice(0, max).map(([k, j]) => `<div class="card" style="margin:0">${typeof plano === "function" && j.plano ? plano(j.plano) : ""}<h3 class="mt">${esc(j.n)}${j.propio ? ` <span class="tag a">Mía</span>` : ""}</h3><p class="small muted">${esc(j.est)} · ${j.min || 10} min · ${(j.mat || []).map(m => (EF_MAT.find(x => x[0] === m) || [m, m])[1]).join(", ") || "sin material"}${j.de ? " · compartió " + esc(j.de) : ""}</p><ol class="small" style="padding-left:18px;margin:8px 0 0">${(j.reglas || []).map(r => `<li>${esc(r)}</li>`).join("")}</ol>${j.propio ? `<div class="fila mt"><button class="btn s" data-fm="${k}">${ic("lapiz", 16)} Editar</button></div>` : ""}</div>`).join("") || `<div class="vacio">No hay juegos con ese filtro.</div>`}</div>
   ${L.length > max ? `<div class="fila mt" style="justify-content:center"><button class="btn s" id="fMas">Ver más (${L.length - max})</button></div>` : ""}`; }
function enlazarFichero() { const re = () => { const y = window.scrollY; pintar(); window.scrollTo(0, y); };
  if (!$("#fQ")) return;
  $("#fQ").oninput = ev => { S.fq = ev.target.value; S.fmax = 40; const pos = ev.target.selectionStart; re(); const i = $("#fQ"); i.focus(); i.setSelectionRange(pos, pos); };
  $$("[data-fe]").forEach(b => b.onclick = () => { S.fe = b.dataset.fe; S.fmax = 40; re(); });
  $("#fTF") && ($("#fTF").onchange = ev => { S.ftf = ev.target.checked; re(); });
  $("#fMas") && ($("#fMas").onclick = () => { S.fmax = (S.fmax || 40) + 40; re(); });
  $("#fNueva").onclick = () => formPropia(null); $$("[data-fm]").forEach(b => b.onclick = () => formPropia(b.dataset.fm)); }

/* ---------- subir mi planeación ---------- */
async function docxTexto(file) {
  const b = new Uint8Array(await file.arrayBuffer()), dv = new DataView(b.buffer); let e = b.length - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--; if (e < 0) throw new Error("El archivo no parece un Word (.docx).");
  let p = dv.getUint32(e + 16, true); const n = dv.getUint16(e + 10, true), td = new TextDecoder();
  for (let i = 0; i < n; i++) {
    const met = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    if (td.decode(b.subarray(p + 46, p + 46 + nl)) === "word/document.xml") {
      const ini = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true), datos = b.subarray(ini, ini + csz);
      const xml = met === 0 ? td.decode(datos) : await new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
      return xml.replace(/<w:tab\/>/g, "\t").replace(/<w:br\/>/g, "\n").replace(/<\/w:tc>/g, " · ").replace(/<\/w:p>/g, "\n").replace(/<[^>]+>/g, "")
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/( · )+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(); }
    p += 46 + nl + xl + cl; }
  throw new Error("No se encontró el texto dentro del Word."); }
async function textoPlaneacion(f, prog) { const nom = (f.name || "").toLowerCase();
  if (/\.docx$/.test(nom)) return docxTexto(f);
  if (/\.doc$/.test(nom)) throw new Error("Ese Word es de formato antiguo (.doc). Ábralo y guárdelo como .docx o PDF, y vuelva a subirlo.");
  if (/\.(txt|md)$/.test(nom) || /^text\//.test(f.type)) return f.text();
  if (/\.pdf$/.test(nom) || f.type === "application/pdf") { const { lines, doc } = await pdfLineas(f); const t = lines.join("\n").trim();
    if (t.replace(/\s/g, "").length > 80) return t; prog("El PDF es escaneado: leyendo las páginas…"); return pdfOCR(doc, prog); }
  if (/^image\//.test(f.type)) { prog("Leyendo la foto…"); return ocr(f, x => prog(`Leyendo la foto: ${x} %`)); }
  throw new Error("Suba un PDF, un Word (.docx), una foto o un archivo de texto."); }
const RE_SES = /^\s*(?:#+\s*)?(?:sesi[oó]n|clase)\s*(?:n[oúu]m(?:ero)?\.?|no\.?|n\.?[°º]|#)?\s*(\d{1,2})\b[^\n]*/gim;
function trozosPorSesion(t) { const m = [...String(t).matchAll(RE_SES)]; if (m.length < 2) return [];
  return m.map((x, i) => ({ n: +x[1], titulo: x[0].trim().slice(0, 90), texto: t.slice(x.index, i + 1 < m.length ? m[i + 1].index : t.length).trim().slice(0, 3000) })); }
function subirPlaneacion(p, re) {
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".pdf,.docx,.doc,.txt,image/*,application/pdf";
  inp.onchange = async () => { const f = inp.files[0]; if (!f) return;
    dlg(`<h3>Leyendo su planeación…</h3><p class="muted" id="upTx">${esc(f.name)}</p>`);
    try { const t = await textoPlaneacion(f, m => { const x = $("#upTx"); if (x) x.textContent = m; });
      if (!String(t).trim()) throw new Error("No se encontró texto en el archivo.");
      revisarPropia(p, { nombre: f.name, texto: String(t).slice(0, 40000), fecha: hoy() }, re);
    } catch (e) { cerrarDlg(); toast(`<b>No se pudo leer.</b> ${esc(e.message)}`, 6000); } };
  inp.click(); }
function revisarPropia(p, x, re) { const tz = trozosPorSesion(x.texto);
  dlg(`<h3>Mi planeación</h3><p class="small muted mb">${esc(x.nombre)}. Revise el texto (puede corregirlo). Se guarda junto con la planeación de Ulama y sale al imprimir.</p>
   <label class="campo"><span>Texto</span><textarea id="upT" rows="12">${esc(x.texto)}</textarea></label>
   ${tz.length ? `<label class="small" style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" id="upR" checked> <span>Encontré ${tz.length} sesiones en su archivo (${tz.slice(0, 4).map(z => esc(z.titulo)).join("; ")}${tz.length > 4 ? "…" : ""}). Agregar cada una a las notas de la sesión con el mismo número${tz.some(z => z.n > p.sesiones.length) ? `, y crear las que falten` : ""}.</span></label>` : `<p class="small muted">Si su archivo dice «Sesión 1», «Sesión 2»…, Ulama reparte cada parte en su sesión.</p>`}
   <div class="fila fin mt"><button class="btn" id="upX">Cancelar</button><button class="btn p" id="upOk">Guardar</button></div>`, v => {
    v.querySelector("#upX").onclick = cerrarDlg;
    v.querySelector("#upOk").onclick = () => { x.texto = val("upT").trim(); p.propia = x; let n = 0, nuevas = 0;
      if (v.querySelector("#upR") && v.querySelector("#upR").checked) trozosPorSesion(x.texto).forEach(z => {
        let s = p.sesiones[z.n - 1];
        if (!s && z.n <= 40) { while (p.sesiones.length < z.n) { p.sesiones.push({ id: uid(), est: "Mi actividad", t: "", para: "", act: "", ppal: [], calma: "", charla: "", cierre: [], eval: "", planB: "", mg: null, nota: "" }); nuevas++; } s = p.sesiones[z.n - 1]; }
        if (!s) return; if (!s.t) s.t = z.titulo.replace(/^\W+/, "");
        if (!String(s.nota || "").includes(z.texto.slice(0, 60))) { s.nota = (s.nota ? s.nota + "\n\n" : "") + z.texto; n++; } });
      guardar(); cerrarDlg(); re(); toast(n ? `Planeación guardada. Se agregó a las notas de ${n} sesiones${nuevas ? ` (${nuevas} nuevas)` : ""}.` : "Planeación guardada como complemento.", 4500); }; }); }
function propiaHTML(p) { const x = p.propia;
  return `<section class="card mt"><div class="fila" style="justify-content:space-between"><h3 style="margin:0">Mi planeación</h3><button class="btn s" id="bUp">${ic("subir", 16)} ${x ? "Subir otra" : "Subir mi planeación"}</button></div>
   ${x ? `<p class="small muted mt">${esc(x.nombre)} · ${fCorta(x.fecha)}</p><details class="mt"><summary class="small" style="cursor:pointer;font-weight:700">Ver el texto</summary><p class="small mt" style="white-space:pre-wrap">${esc(x.texto)}</p></details>
     <div class="fila mt"><button class="btn s" id="bUpE">${ic("lapiz", 16)} Editar o repartir en sesiones</button><button class="btn s r" id="bUpQ">${ic("basura", 16)} Quitar</button></div>`
    : `<p class="small muted">¿Ya tiene su planeación hecha? Súbala (PDF, Word, foto o texto) y complemente con lo que Ulama le propone. Si dice «Sesión 1, Sesión 2…», se reparte en cada sesión.</p>`}</section>`; }
function enlazarPropia(p, re) { $("#bUp") && ($("#bUp").onclick = () => subirPlaneacion(p, re));
  $("#bUpE") && ($("#bUpE").onclick = () => revisarPropia(p, Object.assign({}, p.propia), re));
  $("#bUpQ") && ($("#bUpQ").onclick = async () => { if (!(await confirmar("¿Quitar su planeación subida? Las notas que ya se agregaron a las sesiones se conservan.", "Quitar"))) return; delete p.propia; guardar(); re(); }); }

/* ---------- planeaciones por grado o por fase ---------- */
const gradosDePlan = p => [...new Set(p.grupos.map(grDe).filter(Boolean).map(g => g.grado))].sort((a, b) => a - b);
function lotesPlan(selG, sep) { const out = [];
  [...new Set(selG.map(g => g.escId))].forEach(escId => { const gs = selG.filter(g => g.escId === escId), m = {};
    gs.forEach(g => { const k = sep === "grado" ? "g" + g.grado : sep === "fase" ? "f" + faseDe(g.grado) : "t"; (m[k] = m[k] || []).push(g); });
    Object.keys(m).sort().forEach(k => { const gr = [...new Set(m[k].map(g => g.grado))].sort((a, b) => a - b);
      out.push({ escId, gs: m[k], et: k === "t" ? "" : k[0] === "g" ? gr[0] + ".° grado" : "Fase " + k.slice(1) + " (" + gr.map(x => x + ".°").join(" y ") + ")" }); }); });
  return out; }

/* ---------- PDA separados ---------- */
function pdaPartes(t) { return String(t || "").split(/\n+|(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ¿])|;\s+(?=[A-ZÁÉÍÓÚÑ])/).map(x => x.trim().replace(/^[•\-–]\s*/, "")).filter(x => x.length > 3); }
function pdaHTML(gr, t, sinMargen) { const P = pdaPartes(t);
  if (P.length < 2) return `<p class="small ${sinMargen ? "" : "mt"}" style="margin-bottom:0"><b>PDA ${gr}.°:</b> ${esc(t)}</p>`;
  return `<div class="small ${sinMargen ? "" : "mt"}"><b>PDA ${gr}.° (${P.length}):</b><ol style="margin:4px 0 0;padding-left:20px">${P.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>`; }

/* ---------- lista de planeaciones separada por grado ---------- */
function etiquetaGrados(p) { const g = gradosDePlan(p); return !g.length ? "Sin grupos" : g.length === 1 ? g[0] + ".° grado" : "Varios grados (" + g.map(x => x + ".°").join(", ") + ")"; }
function filtroPlanes() { if (S.pf == null) { try { S.pf = localStorage.getItem("ulama-pf") || ""; } catch (e) { S.pf = ""; } } return S.pf; }
function filtroPlanesHTML() { if (D.planes.length < 2) return ""; const f = filtroPlanes(), gr = [...new Set(D.planes.flatMap(gradosDePlan))].sort((a, b) => a - b), fs = [...new Set(gr.map(faseDe))];
  return `<div class="chips mt"><button class="chip" data-pf="" aria-pressed="${!f}">Todas</button>${gr.map(g => `<button class="chip" data-pf="g${g}" aria-pressed="${f === "g" + g}">${g}.°</button>`).join("")}${fs.length > 1 ? fs.map(x => `<button class="chip" data-pf="f${x}" aria-pressed="${f === "f" + x}">Fase ${x}</button>`).join("") : ""}</div>`; }
function gruposPlanes() { const f = filtroPlanes(), m = new Map();
  D.planes.filter(p => { const g = gradosDePlan(p); return !f || (f[0] === "g" ? g.includes(+f.slice(1)) : g.some(x => faseDe(x) === +f.slice(1))); })
    .sort((a, b) => { const ga = gradosDePlan(a), gb = gradosDePlan(b); return (ga.length > 1) - (gb.length > 1) || (ga[0] || 9) - (gb[0] || 9) || b.ini.localeCompare(a.ini); })
    .forEach(p => { const k = etiquetaGrados(p); if (!m.has(k)) m.set(k, []); m.get(k).push(p); });
  return [...m.entries()]; }

/* ---------- separar una planeación de varios grados: una por grado, conservando lo registrado ---------- */
function separarPlan(p) { const gr = gradosDePlan(p); if (gr.length < 2) return [];
  const nuevas = gr.map(g => { const q = JSON.parse(JSON.stringify(p)), gs = p.grupos.filter(id => (grDe(id) || {}).grado === g), al = new Set(gs.flatMap(id => ((grDe(id) || {}).alumnos || []).map(a => a.id)));
    q.id = uid(); q.grupos = gs; q.pdas = p.pdas && p.pdas[g] != null ? { [g]: p.pdas[g] } : {}; q.titulo = p.titulo.replace(/\s·\s(Varios grados.*|\d\.° grado)$/, "") + " · " + g + ".° grado"; q.sep = g + ".° grado";
    q.criterios = (p.criterios || []).filter(c => c.gr === "todos" || c.gr == g || !Object.keys(p.pdas || {}).includes(String(c.gr)));
    q.inclusion = (p.inclusion || []).filter(x => al.has(x.alId));
    ["mov", "omit", "canc", "nd"].forEach(k => { if (p[k]) q[k] = Object.fromEntries(Object.entries(p[k]).filter(([gid]) => gs.includes(gid))); });
    D.clases.forEach(c => { if (c.planId === p.id && gs.includes(c.grupoId)) c.planId = q.id; });
    return q; });
  const i = D.planes.indexOf(p); D.planes.splice(i, 1, ...nuevas); return nuevas; }
function avisoSepararHTML(p) { const gr = gradosDePlan(p); if (gr.length < 2) return "";
  return `<div class="aviso mt"><span style="flex:1">Esta planeación junta ${gr.map(x => x + ".°").join(", ")}. ¿La separa en ${gr.length} planeaciones, una por grado, cada una con su PDA? Lo que ya registró se conserva.</span><button class="btn s p" id="bSep">Separar por grado</button></div>`; }
function avisoSepararTodasHTML() { const L = D.planes.filter(p => gradosDePlan(p).length > 1); if (!L.length) return "";
  return `<div class="aviso mt"><span style="flex:1">${L.length} planeaci${L.length > 1 ? "ones juntan" : "ón junta"} varios grados. Puede separarlas para que cada grado tenga la suya, con su PDA.</span><button class="btn s p" id="bSepT">Separar por grado</button></div>`; }
async function accionSeparar(lista) { const n = lista.reduce((t, p) => t + gradosDePlan(p).length, 0);
  if (!(await confirmar(`Se ${lista.length > 1 ? `separarán ${lista.length} planeaciones` : "separará la planeación"} en ${n}, una por grado. Las clases y evaluaciones registradas se conservan en la de su grado.`, "Separar"))) return null;
  const out = lista.flatMap(separarPlan); guardar(); return out; }
