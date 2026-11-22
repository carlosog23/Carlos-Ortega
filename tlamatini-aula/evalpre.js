/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Tlamatini Aula Preescolar.
   Evaluación cualitativa de preescolar (Plan de Estudio 2022, Fase 2, evaluación formativa), integrada de la app
   «Evaluación cualitativa preescolar»: listas de cotejo por campo formativo con Sí / En ocasiones / No, tres trimestres con historial,
   lectura de listas (PDF, Word o foto) incluso ya evaluadas, redacción de observaciones con IA sin textos repetidos, Word e impresión. */
"use strict";
const EP_SERVIDOR = "https://script.google.com/macros/s/AKfycbzAgEGtZ_2M04N6sTMJC58vQy2Jz9n5a5uFD5VYNJLIoFeSZ-uYH1E7Sj6Y8EG-DKQkBA/exec";
const EP_CK = ["L", "S", "E", "H"], EP_N = { L: "Lenguajes", S: "Saberes y pensamiento científico", E: "Ética, naturaleza y sociedades", H: "De lo humano y lo comunitario" };
const EP_FIN = { L: "Que niñas y niños expresen e interpreten ideas, emociones y saberes mediante la oralidad, los primeros acercamientos a la lectura y la escritura, y los lenguajes artísticos, valorando la diversidad lingüística y cultural.",
  S: "Que niñas y niños exploren, indaguen y expliquen fenómenos de su entorno natural y social, y usen saberes numéricos, de forma, espacio y medida para resolver situaciones cotidianas.",
  E: "Que niñas y niños construyan sentido de pertenencia, reconozcan sus derechos y los de las demás personas, participen en acuerdos para la convivencia pacífica y cuiden la naturaleza y su comunidad.",
  H: "Que niñas y niños construyan su identidad personal, reconozcan y expresen emociones, desarrollen sus posibilidades de movimiento, se relacionen con otras personas y cuiden su salud y su seguridad." };
const EP_COL = { L: "#8A5A08", S: "#2E7D4F", E: "#C2603A", H: "#6B3F7A" };
const EP_TRI = { 1: "Primer trimestre", 2: "Segundo trimestre", 3: "Tercer trimestre" }, EP_VL = { S: "Sí", O: "En ocasiones", N: "No" }, EP_GR = { 1: "Primero", 2: "Segundo", 3: "Tercero" };
const EP_APERTURAS = ["inicia con el nombre seguido de su avance más notorio", "inicia con «Durante este periodo» y después el nombre", "inicia describiendo cómo participa en las actividades, y nombra a la niña o al niño a mitad de la oración", "inicia con «A lo largo del trimestre»", "inicia con el nombre y una actitud o disposición observada", "inicia con un complemento como «En el trabajo diario» o «En las actividades del aula»", "inicia con «Se observa que» seguido del nombre", "inicia destacando una fortaleza y menciona el nombre después", "inicia con «Al participar en» y una situación propia del campo", "inicia con el nombre y un verbo de proceso (muestra, logra, comienza a, avanza en)", "inicia con «En este campo formativo»", "inicia con una frase sobre su proceso («Su proceso de aprendizaje refleja…») y nombra después"];
const EP_GUIA = "Campos formativos (clave): L = Lenguajes (comunicación oral, escucha, narración, lectura y escritura iniciales, expresión artística); S = Saberes y Pensamiento Científico (conteo y número, formas, espacio, medida, clasificación, exploración de la naturaleza, experimentación); E = Ética, Naturaleza y Sociedades (reglas y acuerdos de convivencia, derechos, cuidado de la naturaleza y del entorno, pertenencia a la comunidad, cultura de paz); H = De lo Humano y lo Comunitario (identidad personal, emociones, interacción y juego con otras personas, movimiento y coordinación, hábitos de higiene y salud, prevención de riesgos).";
const epCiclo = () => { const d = new Date(), y = d.getFullYear(); return d.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
const epNT = () => ({ aspectos: [], val: {}, notas: {}, textos: {} });
function EPde(g) { D.evp = D.evp || {}; const x = D.evp[g.id] = D.evp[g.id] || { ciclo: epCiclo(), tri: 0, op: { largo: "media", limite: 400, familia: true, docente: false, comparar: true }, tris: {} };
  [1, 2, 3].forEach(t => x.tris[t] = Object.assign(epNT(), x.tris[t] || {})); if (!x.tri) { const k = hoy(), T = TRIMS(); x.tri = Math.max(1, T.findIndex(t => k >= t.ini && k <= t.fin) + 1 || (k > T[2].fin ? 3 : 1)); } return x; }
const epNorm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const epCap = w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : "";
/* nombre de pila: si el nombre viene como en RELweb (apellidos primero) toma el nombre; la docente puede corregirlo */
function epPila(a) { if (a.pila) return a.pila; const w = String(a.nombre).trim().split(/\s+/); if (w.length < 3) return epCap(w[0] || "");
  const P = new Set(["DE", "DEL", "LA", "LAS", "LOS", "Y", "SAN", "SANTA"]); let i = 0, u = 0; while (i < w.length && u < 2) { while (i < w.length - 1 && P.has(w[i].toUpperCase())) i++; i++; u++; }
  return a.curp || /^[A-ZÁÉÍÓÚÑ\s]+$/.test(a.nombre) ? epCap(w[i] || w[w.length - 1]) : epCap(w[0]); }
const epT = (E, t) => E.tris[t || E.tri];
function epResumen(E, al, c, tri) { const t = E.tris[tri]; return t.aspectos.filter(a => a.campo === c).map(a => ({ a, v: (t.val[al.id] || {})[a.id] })).filter(x => x.v); }

/* ---------- IA por el servidor de la evaluación de preescolar (Gemini gratuito) ---------- */
function epB64(blob) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = no; r.readAsDataURL(blob); }); }
async function epReducir(blob) { try { const bmp = await createImageBitmap(blob), k = Math.min(1, 1900 / Math.max(bmp.width, bmp.height)), c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); const out = await new Promise(r => c.toBlob(r, "image/jpeg", .86)); return { tipo: "image/jpeg", datos: await epB64(out) }; } catch (e) { return { tipo: blob.type || "image/jpeg", datos: await epB64(blob) }; } }
function epJson(t) { t = String(t || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim(); try { return JSON.parse(t); } catch (e) {}
  const a = Math.min(...["{", "["].map(c => t.indexOf(c)).filter(i => i >= 0)), b = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]")); if (isFinite(a) && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) {} } throw new Error("La IA no devolvió una respuesta completa. Intente de nuevo."); }
const epEsperar = (ms, sig) => new Promise((ok, no) => { if (sig && sig.aborted) return no({ code: "cancelled" }); const t = setTimeout(ok, ms); if (sig) sig.addEventListener("abort", () => { clearTimeout(t); no({ code: "cancelled" }); }, { once: true }); });
async function epIA(prompt, o = {}) { if (DEMO) return epDemoIA(prompt);
  const imagenes = []; for (const b of (o.images || []).slice(0, 3)) imagenes.push(await epReducir(b)); const pausas = [20, 35, 50, 65];
  for (let n = 0; ; n++) { try { return await epUna(prompt, imagenes, o); } catch (e) { if (!(e && e.ocupado) || n >= pausas.length) throw e; toast(`El servicio de redacción está ocupado. Se reintenta en ${pausas[n]} segundos…`); await epEsperar(pausas[n] * 1000, o.signal); } } }
async function epUna(prompt, imagenes, o) { if (navigator.onLine === false) throw new Error("No hay internet en este momento.");
  const ctl = new AbortController(); let venc = false; const tm = setTimeout(() => { venc = true; ctl.abort(); }, imagenes.length ? 240000 : 120000);
  if (o.signal) { if (o.signal.aborted) ctl.abort(); else o.signal.addEventListener("abort", () => ctl.abort(), { once: true }); }
  let r; try { r = await fetch(EP_SERVIDOR, { method: "POST", body: JSON.stringify({ accion: "ia", prompt, imagenes }), signal: ctl.signal }); }
  catch (e) { if (venc) throw new Error("El servicio de redacción tardó demasiado. Intente de nuevo en unos minutos."); if (o.signal && o.signal.aborted) throw { code: "cancelled" }; throw new Error("No hay conexión con el servicio de redacción. Revise su internet."); }
  finally { clearTimeout(tm); }
  let j; try { j = await r.json(); } catch (e) { throw new Error("El servicio de redacción no respondió bien. Intente de nuevo."); }
  if (!j.ok) { const er = new Error(j.error || "El servicio de redacción no pudo responder."); er.ocupado = /l[ií]mite gratuito|saturad|ocupad/i.test(er.message); throw er; }
  return epJson(j.texto); }
function epDemoIA(prompt) { return new Promise(ok => setTimeout(() => { const ids = [...prompt.matchAll(/"id":"([^"]+)","nombre_de_pila":"([^"]+)"/g)];
  if (ids.length) return ok(Object.fromEntries(ids.map(([, id, n], i) => [id, `${["", "Durante este periodo, ", "A lo largo del trimestre, ", "En el trabajo diario, "][i % 4]}${n} participa con entusiasmo en las actividades y comparte sus ideas con sus compañeros. Se observan avances en lo que explora y expresa, y con acompañamiento continúa fortaleciendo lo que aún está en proceso. Se sugiere a la familia conversar en casa sobre lo que vive en el jardín. (Texto de ejemplo)`])));
  if (/aspectos a evaluar|sugiere aspectos/i.test(prompt)) return ok({ aspectos: [{ texto: "Expresa con palabras lo que siente y lo que quiere.", campo: "L" }, { texto: "Cuenta objetos de una colección hasta el 10.", campo: "S" }, { texto: "Respeta los acuerdos de convivencia del grupo.", campo: "E" }, { texto: "Se integra al juego con sus compañeros.", campo: "H" }] });
  ok({}); }, 900)); }

/* ---------- leer archivos: PDF, Word o foto ---------- */
async function epLeer(file, ev) { const n = file.name.toLowerCase();
  if (file.type.startsWith("image/")) return { text: "", images: [file], pages: [{ text: "", image: file }] };
  if (n.endsWith(".pdf")) { const L = await pdfjs(), pdf = await L.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; let text = ""; const np = Math.min(pdf.numPages, 8), pages = [];
    for (let i = 1; i <= np; i++) { const pg = await pdf.getPage(i), tc = await pg.getTextContent(); let y = null, line = "", tx = "";
      for (const it of tc.items) { const yy = Math.round(it.transform[5]); if (y !== null && Math.abs(yy - y) > 3) { tx += line.trim() + "\n"; line = ""; } y = yy; line += it.str + " "; } tx += line.trim() + "\n"; text += tx;
      if (ev || text.replace(/\s/g, "").length < 40) { const v0 = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: Math.min(2.4, 1900 / Math.max(v0.width, v0.height)) }), c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
        await pg.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise; pages.push({ text: tx.trim(), image: await new Promise(r => c.toBlob(r, "image/jpeg", .9)) }); } }
    return ev || text.replace(/\s/g, "").length < 40 ? { text, images: pages.map(p => p.image), pages } : { text, images: [] }; }
  if (n.endsWith(".docx")) { await cargarJS("https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js");
    const h = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() }), d = new DOMParser().parseFromString(h.value, "text/html"); let text = "";
    for (const el of d.body.children) { if (el.tagName === "TABLE") { for (const tr of el.querySelectorAll("tr")) text += [...tr.children].map(c => c.textContent.replace(/\s+/g, " ").trim()).join(" | ") + "\n"; } else { const x = el.textContent.replace(/\s+/g, " ").trim(); if (x) text += x + "\n"; } }
    return { text, images: [] }; }
  if (n.endsWith(".doc")) throw new Error("Los archivos .doc antiguos no se pueden leer. Guárdelo como .docx o PDF, o tome una foto.");
  return { text: await file.text(), images: [] }; }
const epPedir = (prompt, src) => epIA(prompt + (src && src.text ? "\n\nTEXTO DEL DOCUMENTO:\n" + src.text.slice(0, 30000) : ""), { images: src && src.images });
const EP_NIV = { S: "S", SI: "S", LOGRADO: "S", "LO LOGRA": "S", L: "S", O: "O", "EN OCASIONES": "O", "A VECES": "O", "EN PROCESO": "O", EP: "O", P: "O", N: "N", NO: "N", "NO LOGRADO": "N", NL: "N", "REQUIERE APOYO": "N", RA: "N" };
const epNivel = x => x === true ? "S" : x === false ? "N" : (EP_NIV[epNorm(x)] || "");
function epAddAspectos(E, list) { const t = epT(E), ya = new Map(t.aspectos.map(a => [epNorm(a.texto), a])), ids = []; let n = 0;
  for (const it of list) { const texto = String(typeof it === "string" ? it : (it && it.texto) || "").replace(/^\s*\d+[.)-]?\s*/, "").replace(/\s+/g, " ").trim(); if (texto.length < 4) { ids.push(null); continue; }
    let a = ya.get(epNorm(texto)); if (!a) { a = { id: uid(), texto, campo: EP_CK.includes(it && it.campo) ? it.campo : "" }; t.aspectos.push(a); ya.set(epNorm(texto), a); n++; } ids.push(a.id); }
  return { n, ids }; }
function epBuscaAlumno(g, nombre) { const L = activos(g), n = epNorm(nombre); if (!n) return null; const a = L.find(x => epNorm(x.nombre) === n); if (a) return a;
  const P = new Set(["DE", "DEL", "LA", "LAS", "LOS", "Y"]), tk = s => epNorm(s).split(" ").filter(w => w.length > 1 && !P.has(w)), q = tk(nombre); if (q.length < 2) return null;
  const c = L.filter(x => { const k = tk(x.nombre), com = q.filter(w => k.includes(w)).length; return com >= 2 && com === Math.min(q.length, k.length); }); return c.length === 1 ? c[0] : null; }
function epBuscaAspecto(E, texto) { const t = epT(E), n = epNorm(texto), a = t.aspectos.find(x => epNorm(x.texto) === n); if (a) return a;
  const tk = s => [...new Set(epNorm(s).split(" ").filter(w => w.length > 3))], q = tk(texto); if (q.length < 2) return null; let best = null, bs = 0, seg = 0;
  for (const x of t.aspectos) { const k = tk(x.texto), com = q.filter(w => k.includes(w)).length, p = com / ((q.length + k.length - com) || 1); if (p > bs) { seg = bs; bs = p; best = x; } else if (p > seg) seg = p; }
  return bs >= .6 && bs - seg >= .1 ? best : null; }
const EP_PROMPT_EVAL = 'Este documento es una lista de cotejo de preescolar YA EVALUADA: cada fila es un alumno y cada aspecto (indicador) tiene su marca o nivel. Tu tarea es leer las marcas tal como están, sin inventar ni omitir. Primero identifica cómo está marcada la lista: subcolumnas «Sí» y «No»; una sola casilla por aspecto con palomita o tache; tres o más niveles (por ejemplo Logrado / En proceso / Requiere apoyo); colores de semáforo; letras, números o palabras escritas. Si trae una clave o simbología, úsala. La marca puede ser una palomita, un tache, una equis o la casilla rellenada o ennegrecida: en cada grupo de casillas de un aspecto, la marcada es la que se ve oscura o con trazo y las demás están vacías. Cuando hay subcolumnas (por ejemplo «Lo logra», «En proceso», «Requiere apoyo»), fíjate bajo cuál encabezado queda la casilla marcada, contando las casillas del grupo de izquierda a derecha. Lee fila por fila, siguiendo con cuidado la línea de cada alumno y la columna de cada aspecto. Convierte cada marca a uno de estos valores: "S" = lo logra; "O" = a veces o en proceso; "N" = no lo logra o requiere apoyo; "" = sin marca. Si cada aspecto tiene una sola casilla y solo se palomean los logrados, la casilla vacía de un alumno que sí tiene otras marcas vale "N". Si recibes imagen y texto, las marcas se leen en la imagen; el texto solo ayuda a escribir bien nombres y enunciados. Si el documento indica el campo formativo, asígnalo a todos sus aspectos. ' + EP_GUIA + ' Responde solo con un objeto JSON: {"aspectos":[{"texto": enunciado completo, "campo":"L"|"S"|"E"|"H"}], "alumnos":[{"nombre": nombre completo, "v":[...]}]} donde "v" tiene exactamente un valor por aspecto, en el mismo orden de "aspectos".';
async function epCargarEvaluada(g, E, src) { const pg = src.pages || [], partes = pg.length > 3 ? pg.reduce((o, p, i) => { if (i % 2 === 0) o.push({ text: "", images: [] }); const u = o[o.length - 1]; u.text += p.text + "\n"; u.images.push(p.image); return o; }, []) : [src];
  let aspectos = null; const filas = [];
  for (let i = 0; i < partes.length; i++) { if (partes.length > 1) tlamiEspera(`Leyendo la lista de cotejo evaluada… parte ${i + 1} de ${partes.length}.`);
    const r = await epPedir(EP_PROMPT_EVAL + (aspectos ? "\n\nEsta parte es la continuación de la misma lista. Usa exactamente estos aspectos, en este orden:\n" + aspectos.map((a, k) => (k + 1) + ". " + (a.texto || a)).join("\n") : ""), partes[i]);
    if (!aspectos) { if (!Array.isArray(r.aspectos) || !r.aspectos.length) { if (i < partes.length - 1) continue; throw new Error("No se encontraron aspectos en el documento."); } aspectos = r.aspectos; }
    (Array.isArray(r.alumnos) ? r.alumnos : []).forEach(ra => { if (ra) filas.push({ nombre: String(typeof ra === "string" ? ra : ra.nombre || ""), v: Array.isArray(ra.v) ? ra.v : [] }); }); }
  if (!aspectos) throw new Error("No se encontraron aspectos en el documento.");
  const t = epT(E), usados = new Set(), ids = aspectos.map(it => { let a = epBuscaAspecto(E, String(typeof it === "string" ? it : (it && it.texto) || "")); if (a && usados.has(a.id)) a = null; const id = a ? a.id : epAddAspectos(E, [it]).ids[0]; if (id) usados.add(id); return id; });
  let m = 0, na = 0, sin = [];
  for (const f of filas) { const a = epBuscaAlumno(g, f.nombre); if (!a) { if (f.nombre) sin.push(f.nombre); continue; } let k = 0; ids.forEach((id, j) => { const v = epNivel(f.v[j]); if (id && v) { (t.val[a.id] = t.val[a.id] || {})[id] = v; k++; } }); if (k) { m += k; na++; } }
  return { m, na, sin }; }

/* ---------- traer aspectos y valoraciones de las planeaciones (evaluación de cada sesión: Sí / En ocasiones / No) ---------- */
function epDePlaneaciones(g, E) { const T = TRIMS()[E.tri - 1], t = epT(E), V = { 3: "S", 2: "O", 1: "N" }; let na = 0, nv = 0;
  D.planes.filter(p => p.gid === g.id && p.nivel === "pre").forEach(p => { const ck = { "Lenguajes": "L", "Saberes y pensamiento científico": "S", "Ética, naturaleza y sociedades": "E", "De lo humano y lo comunitario": "H" }[campoKey(p.campo)] || "";
    const regs = D.reg.filter(r => r.pid === p.id && r.fecha >= T.ini && r.fecha <= T.fin).sort((x, y) => x.fecha.localeCompare(y.fecha)); if (!regs.length) return;
    p.criterios.forEach((c, i) => { if (!regs.some(r => Object.values(r.al || {}).some(v => v[i] != null))) return; const r0 = epAddAspectos(E, [{ texto: c.c.replace(/…$/, "") + (/[.…]$/.test(c.c) ? "" : "."), campo: ck }]); na += r0.n; const id = r0.ids[0]; if (!id) return;
      regs.forEach(r => Object.entries(r.al || {}).forEach(([al, v]) => { if (v[i] != null && V[v[i]]) { (t.val[al] = t.val[al] || {})[id] = V[v[i]]; nv++; } })); }); });
  return { na, nv }; }

/* =================================================================== VISTA PRINCIPAL */
const EP_TABS = [["aspectos", "1. Aspectos"], ["valorar", "2. Valoración"], ["redactar", "3. Redacción"], ["historial", "Historial"]];
let EP_GEN = null;
VISTAS.evalpre = () => { const g = gAct(); if (!g) return VISTAS.inicio(); const E = EPde(g), tab = S.ept || "aspectos";
  return barra("Evaluación cualitativa · " + esc(grNom(g)), EP_TRI[E.tri], `<button class="btn s" id="epC">${esc(E.ciclo)}</button>`) + `<main class="wrap">
  <div class="chips mt">${[1, 2, 3].map(t => `<button class="chip" data-etr="${t}" aria-pressed="${E.tri === t}">${t}.° trimestre</button>`).join("")}</div>
  <div class="chips mt tabs-rv">${EP_TABS.map(([k, t]) => `<button class="chip" data-etb="${k}" aria-pressed="${tab === k}">${t}</button>`).join("")}</div>
  ${({ aspectos: epAspectosHTML, valorar: epValorarHTML, redactar: epRedactarHTML, historial: epHistHTML }[tab] || epAspectosHTML)(g, E)}
  <input type="file" id="epF" hidden></main>`; };
ENLAZAR.evalpre = () => { const g = gAct(); if (!g) return; const E = EPde(g), tab = S.ept || "aspectos";
  $$("[data-etr]").forEach(b => b.onclick = () => { E.tri = +b.dataset.etr; guardar(); re(); }); $$("[data-etb]").forEach(b => b.onclick = () => { S.ept = b.dataset.etb; pintar(); scrollTo(0, 0); });
  $("#epC").onclick = () => dlg(`<h3>Ciclo escolar</h3><label class="campo"><span>Ciclo</span><input id="ecC" value="${esc(E.ciclo)}"></label><div class="fila fin"><button class="btn" id="ecX">Cancelar</button><button class="btn p" id="ecOk">Guardar</button></div>`, v => { v.querySelector("#ecX").onclick = cerrarDlg; v.querySelector("#ecOk").onclick = () => { E.ciclo = val("ecC").trim() || E.ciclo; guardar(); cerrarDlg(); re(); }; });
  ({ aspectos: epAspectosBind, valorar: epValorarBind, redactar: epRedactarBind, historial: epHistBind }[tab] || epAspectosBind)(g, E); };

/* ---------- 1. aspectos ---------- */
function epAspectosHTML(g, E) { const t = epT(E), sin = t.aspectos.filter(a => !a.campo);
  return `<p class="small muted mt">Los aspectos o indicadores de su lista de cotejo, por campo formativo. Puede escribirlos, subir su lista (PDF, Word o foto; si ya viene evaluada, se cargan también las marcas), traerlos de sus planeaciones o pedir sugerencias.</p>
  <div class="fila mt" style="gap:8px"><button class="btn s p" id="eaF">${ic("bajar", 16)} Subir lista de cotejo</button><button class="btn s" id="eaE">${ic("lapiz", 16)} Escribir aspectos</button><button class="btn s" id="eaP">${ic("plan", 16)} De mis planeaciones</button><button class="btn s tlami-b" id="eaS">${ic("chispa", 16)} Sugerir</button>${E.tri > 1 && E.tris[E.tri - 1].aspectos.length ? `<button class="btn s" id="eaA">Copiar del ${E.tri - 1}.° trimestre</button>` : ""}</div>
  ${sin.length ? `<section class="card mt" style="border-left:5px solid var(--maiz)"><p class="small"><b>${sin.length} aspecto(s) sin campo formativo.</b> Elija L, S, E o H en cada uno${""}.</p><button class="btn s mt tlami-b" id="eaK">${ic("chispa", 14)} Clasificar con IA</button></section>` : ""}
  ${EP_CK.concat([""]).map(c => { const L = t.aspectos.filter(a => (a.campo || "") === c); if (!L.length) return "";
    return `<h3 class="mt2" style="font-size:17px;color:${EP_COL[c] || "var(--gris)"}">${c ? EP_N[c] : "Sin campo formativo"} <small class="muted">(${L.length})</small></h3>${L.map(a => `<section class="card mt" style="padding:10px 12px;border-left:4px solid ${EP_COL[a.campo] || "var(--hilo)"}"><p class="small">${esc(a.texto)}</p>
      <div class="fila mt" style="gap:6px;justify-content:space-between"><span class="chips">${EP_CK.map(k => `<button class="chip" data-eac="${a.id}|${k}" aria-pressed="${a.campo === k}" title="${EP_N[k]}">${k}</button>`).join("")}</span><span class="fila" style="gap:4px"><button class="btn s" data-eae="${a.id}">${ic("lapiz", 14)}</button><button class="btn s r" data-ead="${a.id}">${ic("basura", 14)}</button></span></div></section>`).join("")}`; }).join("") || `<div class="vacio mt">Todavía no hay aspectos en este trimestre.</div>`}
  ${t.aspectos.length ? `<div class="fila fin mt2"><button class="btn o" data-etb2="valorar">Siguiente: valorar ${ic("sig", 16)}</button></div>` : ""}`; }
function epAspectosBind(g, E) { const t = epT(E);
  $$("[data-etb2]").forEach(b => b.onclick = () => { S.ept = b.dataset.etb2; pintar(); scrollTo(0, 0); });
  $$("[data-eac]").forEach(b => b.onclick = () => { const [id, k] = b.dataset.eac.split("|"); const a = t.aspectos.find(x => x.id === id); a.campo = k; guardar(); re(); });
  $$("[data-ead]").forEach(b => b.onclick = async () => { if (!(await confirmar("Se quitará el aspecto y sus valoraciones de este trimestre.", "Quitar"))) return; const id = b.dataset.ead; t.aspectos = t.aspectos.filter(x => x.id !== id); Object.values(t.val).forEach(v => delete v[id]); guardar(); re(); });
  $$("[data-eae]").forEach(b => b.onclick = () => { const a = t.aspectos.find(x => x.id === b.dataset.eae); dlg(`<h3>Editar aspecto</h3><textarea class="area" id="eaT">${esc(a.texto)}</textarea><div class="fila fin mt"><button class="btn" id="eaX">Cancelar</button><button class="btn p" id="eaOk">Guardar</button></div>`, v => { v.querySelector("#eaX").onclick = cerrarDlg; v.querySelector("#eaOk").onclick = () => { a.texto = val("eaT").trim() || a.texto; guardar(); cerrarDlg(); re(); }; }); });
  $("#eaE").onclick = () => dlg(`<h3>Escribir aspectos</h3><p class="small muted mb">Uno por renglón, tal como están en su lista de cotejo.</p><label class="campo"><span>Campo formativo</span><select id="eaC"><option value="">Que la IA lo clasifique</option>${EP_CK.map(k => `<option value="${k}">${EP_N[k]}</option>`).join("")}</select></label><textarea class="area" id="eaL" placeholder="Expresa con palabras lo que siente.&#10;Cuenta hasta el 10."></textarea><div class="fila fin mt"><button class="btn" id="eaX">Cancelar</button><button class="btn p" id="eaOk">Agregar</button></div>`, v => {
    v.querySelector("#eaX").onclick = cerrarDlg; v.querySelector("#eaOk").onclick = async () => { const c = val("eaC"), L = val("eaL").split("\n").map(x => x.trim()).filter(x => x.length > 3); const r = epAddAspectos(E, L.map(x => ({ texto: x, campo: c }))); guardar(); cerrarDlg(); re(); toast(`Se agregaron ${r.n} aspectos.`); if (!c && r.n) epClasificar(g, E); }; });
  $("#eaP").onclick = () => { const r = epDePlaneaciones(g, E); guardar(); re(); toast(r.na || r.nv ? `De sus planeaciones: ${r.na} aspectos nuevos y ${r.nv} valoraciones (de la evaluación de cada sesión).` : "No hay sesiones evaluadas de sus planeaciones en este trimestre.", 4500); };
  $("#eaA") && ($("#eaA").onclick = () => { const r = epAddAspectos(E, E.tris[E.tri - 1].aspectos.map(a => ({ texto: a.texto, campo: a.campo }))); guardar(); re(); toast(`Se copiaron ${r.n} aspectos. Las valoraciones se registran de nuevo en este trimestre.`); });
  $("#eaK") && ($("#eaK").onclick = () => epClasificar(g, E));
  $("#eaS").onclick = () => epSugerir(g, E);
  $("#eaF").onclick = () => { const f = $("#epF"); f.accept = ".pdf,.docx,.txt,image/*"; f.onchange = async () => { const file = f.files[0]; f.value = ""; if (!file) return;
    tlamiEspera("Leyendo su lista de cotejo. Si ya viene evaluada, también se leen las marcas; puede tardar un par de minutos.");
    try { const src = await epLeer(file); let r = await epPedir('Extrae de este documento de preescolar los aspectos, indicadores o criterios a evaluar (los enunciados de una lista de cotejo o rúbrica). No incluyas nombres de alumnos ni encabezados. Clasifica cada uno en el campo formativo que mejor corresponda; si el documento ya indica el campo, respétalo. ' + EP_GUIA + ' Responde solo con un objeto JSON {"aspectos":[{"texto": enunciado completo, "campo": "L"|"S"|"E"|"H"}], "evaluada": true si el documento además trae alumnos con marcas o niveles ya registrados en esos aspectos, false si no}.', src);
      if (r && r.evaluada === true) { const x = await epCargarEvaluada(g, E, await epLeer(file, true)); guardar(); cerrarDlg(); S.ept = "valorar"; re();
        toast(x.m ? `Se cargaron ${x.m} valoraciones de ${x.na} alumnos.${x.sin.length ? ` No se encontraron en su grupo: ${x.sin.slice(0, 3).join(", ")}${x.sin.length > 3 ? "…" : ""}.` : ""} Compare con su lista.` : "No se reconocieron las marcas. Pruebe con una foto más clara y de frente, o con el PDF original.", 6000); return; }
      const n = epAddAspectos(E, Array.isArray(r) ? r : (r.aspectos || [])).n; guardar(); cerrarDlg(); re(); toast(n ? `Se agregaron ${n} aspectos. Revise el campo formativo de cada uno.` : "No se encontraron aspectos nuevos."); }
    catch (e) { tlamiError(e); } }; f.click(); }; }
async function epClasificar(g, E) { const t = epT(E), pend = t.aspectos.filter(a => !a.campo); if (!pend.length) return toast("Todos los aspectos tienen campo formativo.");
  tlamiEspera("Clasificando los aspectos por campo formativo."); try { const r = await epIA("Clasifica cada aspecto de evaluación de preescolar (Fase 2, Plan de Estudio 2022) en el campo formativo que mejor corresponda. " + EP_GUIA + ' Responde solo con un objeto JSON {id: clave}. Aspectos:\n' + pend.map(a => a.id + ": " + a.texto).join("\n"));
    pend.forEach(a => { if (EP_CK.includes(r[a.id])) a.campo = r[a.id]; }); guardar(); cerrarDlg(); re(); toast("Aspectos clasificados. Puede cambiar el campo si lo considera."); } catch (e) { tlamiError(e); } }
async function epSugerir(g, E) { const P = await programaPre(), gr = Math.max(...g.grados);
  const cont = P ? Object.entries(P.disciplinas).map(([c, d]) => `${c}: ` + d.contenidos.map(x => (x.pda[gr] || []).join(" ")).join(" ")).join("\n").slice(0, 9000) : "";
  dlg(`<h3>Sugerir aspectos</h3><p class="small muted mb">La IA propone aspectos observables para su lista de cotejo a partir de los PDA de ${gr}.° de preescolar. Revíselos antes de usarlos.</p><label class="campo"><span>¿De qué tema o proyecto? <small>(opcional)</small></span><input id="esT" placeholder="Ej.: los animales de la granja"></label><label class="campo"><span>¿Cuántos por campo?</span><input type="number" id="esN" min="1" max="6" value="3"></label><div class="fila fin mt"><button class="btn" id="esX">Cancelar</button><button class="btn p" id="esOk">Sugerir</button></div>`, v => {
    v.querySelector("#esX").onclick = cerrarDlg; v.querySelector("#esOk").onclick = async () => { const tema = val("esT").trim(), n = Math.max(1, Math.min(6, +val("esN") || 3)); tlamiEspera("Preparando aspectos observables para su lista de cotejo.");
      try { const r = await epIA(`Eres educadora de preescolar en México (Plan de Estudio 2022, Fase 2). Sugiere aspectos a evaluar en una lista de cotejo para ${EP_GR[gr].toLowerCase()} grado de preescolar, ${n} por cada campo formativo${tema ? ", relacionados con el proyecto o tema: " + tema : ""}. Cada aspecto es una conducta observable, en tercera persona y presente (por ejemplo: «Cuenta objetos de una colección hasta el 10»), breve y valorable con Sí / En ocasiones / No. Basados en estos PDA del grado:\n${cont}\n${EP_GUIA} Responde solo con JSON {"aspectos":[{"texto":"…","campo":"L"|"S"|"E"|"H"}]}.`);
        const k = epAddAspectos(E, r.aspectos || []).n; guardar(); cerrarDlg(); re(); toast(`Se agregaron ${k} aspectos sugeridos. Edite o quite los que no le sirvan.`); } catch (e) { tlamiError(e); } }; }); }

/* ---------- 2. valoración ---------- */
const EP_V = [["S", "Sí", "#1E8E5A"], ["O", "En ocasiones", "#C98A0B"], ["N", "No", "#C2362B"]];
function epAsps(E) { const t = epT(E); return EP_CK.flatMap(c => t.aspectos.filter(a => a.campo === c)).concat(t.aspectos.filter(a => !a.campo)); }
function epValorarHTML(g, E) { const t = epT(E), L = activos(g), A = epAsps(E); if (!A.length) return `<div class="vacio mt">Primero registre los aspectos de su lista de cotejo.</div>`; if (!L.length) return `<div class="vacio mt">Primero agregue a sus alumnos en Mi grupo.</div>`;
  const tabla = S.epm === "tabla", al = L.find(a => a.id === S.epa) || L[0], i = L.indexOf(al), hechos = a => A.filter(x => (t.val[a.id] || {})[x.id]).length;
  return `<div class="fila mt" style="justify-content:space-between"><div class="chips"><button class="chip" data-epm="alumno" aria-pressed="${!tabla}">Por alumno</button><button class="chip" data-epm="tabla" aria-pressed="${tabla}">Tabla del grupo</button></div><span class="small muted">${L.filter(a => hechos(a) === A.length).length} de ${L.length} completos</span></div>
  ${tabla ? `<p class="small muted mt">Toque una celda para cambiar: Sí → En ocasiones → No → vacío.</p><div class="tabla-c mt"><table class="tabla"><thead><tr><th>Alumno(a)</th>${A.map((a, k) => `<th class="c" title="${esc(a.texto)}" style="color:${EP_COL[a.campo] || "inherit"}">${a.campo || "?"}${k + 1}</th>`).join("")}</tr></thead><tbody>
     ${L.map(a => `<tr><td>${esc(a.nombre)}</td>${A.map(x => { const v = (t.val[a.id] || {})[x.id] || "", c = EP_V.find(z => z[0] === v); return `<td class="c"><button data-etc="${a.id}|${x.id}" style="width:34px;height:30px;border-radius:8px;border:1px solid var(--hilo);font-weight:700;background:${c ? c[2] : "#fff"};color:${c ? "#fff" : "var(--gris)"}">${c ? (v === "O" ? "A" : c[1][0]) : "·"}</button></td>`; }).join("")}</tr>`).join("")}</tbody></table></div>
    <section class="card mt small">${A.map((a, k) => `<p><b style="color:${EP_COL[a.campo] || "inherit"}">${a.campo || "?"}${k + 1}.</b> ${esc(a.texto)}</p>`).join("")}<p class="muted mt">S = Sí · A = En ocasiones · N = No</p></section>`
  : `<div class="fila mt" style="justify-content:space-between;flex-wrap:nowrap"><button class="btn s" id="evA" ${i ? "" : "disabled"}>${ic("atras", 16)}</button><select id="evS" class="sel" style="flex:1;min-width:0">${L.map(a => `<option value="${a.id}" ${a === al ? "selected" : ""}>${esc(a.nombre)} (${hechos(a)}/${A.length})</option>`).join("")}</select><button class="btn s" id="evN" ${i < L.length - 1 ? "" : "disabled"}>${ic("sig", 16)}</button></div>
    ${EP_CK.concat([""]).map(c => { const X = A.filter(x => (x.campo || "") === c); if (!X.length) return ""; return `<h3 class="mt2" style="font-size:16px;color:${EP_COL[c] || "var(--gris)"}">${c ? EP_N[c] : "Sin campo"}</h3>${X.map(x => { const v = (t.val[al.id] || {})[x.id] || "";
      return `<section class="card mt" style="padding:10px 12px"><p class="small">${esc(x.texto)}</p><div class="chips mt">${EP_V.map(([k, n, col]) => `<button class="chip" data-evv="${x.id}|${k}" aria-pressed="${v === k}" style="${v === k ? `background:${col};border-color:${col};color:#fff` : ""}">${n}</button>`).join("")}</div></section>`; }).join("")}`; }).join("")}
    <label class="campo mt"><span>Nota de la docente <small>(opcional: algo que observó y quiere que se tome en cuenta)</small></span><textarea class="area" id="evNo" style="min-height:70px">${esc(t.notas[al.id] || "")}</textarea></label>
    <div class="fila fin mt"><button class="btn s" id="evT">Todo «Sí»</button><button class="btn p" id="evG">${i < L.length - 1 ? "Siguiente alumno" : "Listo"} ${ic("sig", 16)}</button></div>`}
  <div class="fila fin mt2"><button class="btn o" data-etb2="redactar">Siguiente: redactar ${ic("sig", 16)}</button></div>`; }
function epValorarBind(g, E) { const t = epT(E), L = activos(g), A = epAsps(E);
  $$("[data-etb2]").forEach(b => b.onclick = () => { S.ept = b.dataset.etb2; pintar(); scrollTo(0, 0); }); $$("[data-epm]").forEach(b => b.onclick = () => { S.epm = b.dataset.epm; re(); });
  $$("[data-etc]").forEach(b => b.onclick = () => { const [a, x] = b.dataset.etc.split("|"), o = t.val[a] = t.val[a] || {}, ord = ["", "S", "O", "N"]; o[x] = ord[(ord.indexOf(o[x] || "") + 1) % 4]; if (!o[x]) delete o[x]; guardar(); re(); });
  const al = L.find(a => a.id === S.epa) || L[0]; if (!al || !$("#evS")) return; const i = L.indexOf(al);
  const nota = () => { const x = val("evNo").trim(); if (x) t.notas[al.id] = x; else delete t.notas[al.id]; };
  const ir2 = d => { nota(); guardar(); const b = L[i + d]; if (b) { S.epa = b.id; pintar(); scrollTo(0, 0); } else { toast("Valoraciones guardadas."); S.ept = "redactar"; pintar(); scrollTo(0, 0); } };
  $("#evS").onchange = e => { nota(); guardar(); S.epa = e.target.value; re(); }; $("#evA").onclick = () => ir2(-1); $("#evN").onclick = () => ir2(1); $("#evG").onclick = () => ir2(1);
  $("#evNo").onchange = () => { nota(); guardar(); };
  $$("[data-evv]").forEach(b => b.onclick = () => { const [x, k] = b.dataset.evv.split("|"), o = t.val[al.id] = t.val[al.id] || {}; if (o[x] === k) delete o[x]; else o[x] = k; nota(); guardar(); re(); });
  $("#evT").onclick = () => { const o = t.val[al.id] = t.val[al.id] || {}; A.forEach(x => o[x.id] = "S"); nota(); guardar(); re(); }; }

/* ---------- 3. redacción ---------- */
function epLargo(E) { const o = E.op; return o.largo === "breve" ? "2 a 3 oraciones (de 40 a 55 palabras; nunca más de 350 caracteres contando espacios)" : o.largo === "amplia" ? "6 a 8 oraciones (de 120 a 155 palabras; nunca más de 1000 caracteres contando espacios)" : o.largo === "limite" ? `como máximo ${Math.max(120, +o.limite || 400)} caracteres contando espacios; es un límite estricto de la plataforma donde se pegará, no lo rebases y aprovecha casi todo el espacio` : "4 a 5 oraciones (de 70 a 90 palabras; nunca más de 600 caracteres contando espacios)"; }
function epPrompt(g, E, campo, lote, tri, evitar, P) { const t = E.tris[tri], asp = t.aspectos.filter(a => a.campo === campo), o = E.op, L = activos(g), gr = Math.max(...g.grados);
  const momento = { 1: "Primer periodo: describe el punto de partida y los primeros avances observados.", 2: "Segundo periodo: describe los avances y lo que continúa en proceso a mitad del ciclo.", 3: "Tercer periodo: describe los logros alcanzados al cierre del ciclo escolar y lo que conviene seguir fortaleciendo." }[tri];
  const con = P ? (P.disciplinas[EP_N[campo]] || { contenidos: [] }).contenidos.map(c => c.c.replace(/\.$/, "")) : [];
  const datos = lote.map(al => { const i = L.indexOf(al), d = { id: al.id, nombre_de_pila: epPila(al), nombre_completo: al.nombre, grado: (al.g || gr) + ".°", apertura: EP_APERTURAS[(i * 5 + EP_CK.indexOf(campo) * 3) % EP_APERTURAS.length], valoraciones: Object.fromEntries(epResumen(E, al, campo, tri).map(x => [x.a.id, EP_VL[x.v]])) };
    if (t.notas[al.id]) d.nota_de_la_docente = t.notas[al.id]; if (o.comparar && tri > 1) { const p = (E.tris[tri - 1].textos[al.id] || {})[campo]; if (p) d.observacion_del_periodo_anterior = p; } return d; });
  return `Eres una educadora mexicana de preescolar con amplio dominio del Plan de Estudio 2022 de la Nueva Escuela Mexicana, del Programa Sintético de la Fase 2 y de la evaluación formativa. Redacta las observaciones cualitativas del campo formativo «${EP_N[campo]}» para la boleta de evaluación de cada niña o niño. En preescolar no hay calificaciones numéricas: se registran observaciones y sugerencias por campo formativo.

CONTEXTO
Grupo de ${g.grados.map(x => x + ".°").join(", ")} de preescolar. ${EP_TRI[tri]} del ciclo ${E.ciclo}. ${momento}
Finalidad del campo: ${EP_FIN[campo]}
Contenidos del Programa Sintético de la Fase 2 en este campo: ${con.join("; ")}.

ASPECTOS OBSERVADOS CON LISTA DE COTEJO (id: enunciado)
${asp.map(a => a.id + ": " + a.texto).join("\n")}

SIGNIFICADO DE LAS VALORACIONES
«Sí»: lo manifiesta de forma consistente. «En ocasiones»: está en proceso, lo logra algunas veces o con apoyo. «No»: todavía no se observa; se expresa como un proceso que requiere acompañamiento. Un aspecto sin valoración no se menciona.

NIÑAS Y NIÑOS
${JSON.stringify(datos)}

REGLAS DE REDACCIÓN
1. Un solo párrafo por niña o niño, de ${epLargo(E)}. Todas las observaciones deben tener una extensión parecida; antes de responder, revisa cada una y acorta la que rebase el máximo. Sin saltos de línea, sin viñetas, sin comillas, sin markdown.
2. Tercera persona, español de México, tono cálido, respetuoso y profesional, comprensible para las familias. Usa el nombre de pila una vez (dos como máximo) y cuida la concordancia de género; si el nombre no deja claro el género, evita adjetivos con marca de género.
3. Enfoque formativo: describe procesos y avances, lo que la niña o el niño hace, dice, explora y logra, y con qué apoyos. Comienza por las fortalezas. Las áreas de oportunidad se expresan en positivo (está en proceso de, comienza a, con acompañamiento logra, se continuará favoreciendo). Nunca uses «no puede», «no sabe», «le falta», «deficiente» ni etiquetas; no compares con otros niños; no uses números, porcentajes ni calificaciones; no menciones diagnósticos.
4. Prohibido transcribir los enunciados de la lista: no repitas de un enunciado más de tres palabras seguidas. Describe con tus propias palabras lo que la niña o el niño hace, agrupa en una misma idea los aspectos afines y usa lenguaje propio del campo formativo, coherente con sus contenidos. No repitas una misma palabra de contenido más de una vez dentro de la observación, y no menciones el grado, el trimestre ni el nombre del campo formativo. No inventes anécdotas, actividades ni hechos que no se desprendan de las valoraciones o de la nota de la docente.
5. Fidelidad: el texto debe reflejar exactamente las valoraciones de cada quien. Si todo es «Sí», no inventes dificultades; si predomina «No», reconoce primero su disposición o lo que sí se observa sin exagerar logros.
6. Variedad obligatoria: cada observación debe leerse como única. Sigue la indicación «apertura» de cada niña o niño; no repitas entre observaciones las mismas tres primeras palabras, ni la misma estructura, ni los mismos verbos y conectores, ni la misma frase de cierre. Evita muletillas como «es importante mencionar» o «cabe destacar».
${o.familia ? "7. Incluye al final una sugerencia breve y concreta para la familia, relacionada con lo que está en proceso (o para seguir fortaleciendo lo logrado), distinta para cada quien.\n" : ""}${o.docente ? "8. Incluye una mención breve de cómo se le acompañará en el aula durante el siguiente periodo.\n" : ""}${o.comparar && tri > 1 ? "9. Cuando exista «observacion_del_periodo_anterior», señala brevemente el avance o la continuidad respecto a ese periodo, sin repetir su redacción.\n" : ""}${evitar && evitar.length ? "10. Estos inicios ya se usaron con otros compañeros del grupo; no los repitas: " + evitar.slice(-14).map(x => "«" + x + "»").join(", ") + ".\n" : ""}
FORMATO DE RESPUESTA
Responde solo con un objeto JSON cuyas claves son los id de las niñas y los niños y cuyos valores son las observaciones. Ejemplo de forma: {"abc123":"Texto…","def456":"Texto…"}`; }
function epRedactarHTML(g, E) { const t = epT(E), L = activos(g), o = E.op, pend = L.flatMap(a => EP_CK.filter(c => epResumen(E, a, c, E.tri).length).map(c => ({ a, c }))), falt = pend.filter(x => !((t.textos[x.a.id] || {})[x.c] || "").trim());
  return `<section class="card mt"><h3>Cómo quiere los textos</h3><div class="chips mt">${[["breve", "Breve"], ["media", "Media"], ["amplia", "Amplia"], ["limite", "Con límite de caracteres"]].map(([k, n]) => `<button class="chip" data-eol="${k}" aria-pressed="${o.largo === k}">${n}</button>`).join("")}</div>
   ${o.largo === "limite" ? `<label class="campo mt"><span>Máximo de caracteres</span><input type="number" id="eoN" min="120" max="2000" value="${o.limite}"></label>` : ""}
   ${[["familia", "Sugerencia para la familia"], ["docente", "Cómo se le acompañará en el aula"], ["comparar", "Comparar con el trimestre anterior"]].map(([k, n]) => `<label class="rev-chk"><input type="checkbox" data-eoc="${k}" ${o[k] ? "checked" : ""}> ${n}</label>`).join("")}</section>
  ${EP_GEN ? `<section class="card mt"><p class="small"><b id="epPT">Redactando… ${EP_GEN.done} de ${EP_GEN.total}</b></p><div class="prog mt"><i id="epPB" style="width:${Math.round(100 * EP_GEN.done / EP_GEN.total)}%"></i></div><div class="fila fin mt"><button class="btn s r" id="erX">Detener</button></div></section>`
  : `<div class="fila mt" style="gap:8px"><button class="btn p tlami-b" id="erF" ${falt.length ? "" : "disabled"}>${ic("chispa", 16)} Redactar lo que falta (${falt.length})</button><button class="btn s" id="erT" ${pend.length ? "" : "disabled"}>Redactar todo de nuevo</button><button class="btn s" id="erW">${ic("doc", 16)} Word</button><button class="btn s" id="erI">${ic("impr", 16)} Imprimir o PDF</button></div>`}
  <p class="small muted mt">Lea y ajuste cada texto: usted conoce a sus alumnos. Los cambios se guardan solos.</p>
  ${L.map(a => { const cs = EP_CK.filter(c => epResumen(E, a, c, E.tri).length || ((t.textos[a.id] || {})[c] || "").trim()); return `<section class="card mt"><div class="fila" style="justify-content:space-between;flex-wrap:nowrap"><b>${esc(a.nombre)}</b><span class="fila" style="gap:4px;flex-wrap:nowrap"><button class="btn s" data-erp="${a.id}" title="Nombre de pila">${esc(epPila(a))}</button>${cs.length ? `<button class="btn s" data-erc="${a.id}">${ic("doc", 14)} Copiar</button>` : ""}</span></div>
    ${cs.map(c => `<p class="small mt" style="color:${EP_COL[c]}"><b>${EP_N[c]}</b> <button class="btn s tlami-b" data-err="${a.id}|${c}" style="padding:2px 8px;min-height:0">${ic("chispa", 12)}</button></p><textarea class="area" data-ert="${a.id}|${c}" style="min-height:90px">${esc((t.textos[a.id] || {})[c] || "")}</textarea><p class="small muted" style="text-align:right">${((t.textos[a.id] || {})[c] || "").length} caracteres</p>`).join("") || `<p class="small muted mt">Sin valoraciones en este trimestre.</p>`}</section>`; }).join("")}`; }
async function epRedactar(g, E, objetivos) { if (EP_GEN) return; if (!objetivos.length) return toast("No hay valoraciones registradas para redactar.");
  const tri = E.tri, t = E.tris[tri], P = await programaPre(), jobs = []; for (const c of EP_CK) { const als = objetivos.filter(o => o.c === c).map(o => o.a); for (let i = 0; i < als.length; i += 6) jobs.push({ c, lote: als.slice(i, i + 6) }); }
  EP_GEN = { total: objetivos.length, done: 0, ctl: new AbortController(), err: null }; const usados = { L: [], S: [], E: [], H: [] }; re();
  for (const job of jobs) { if (EP_GEN.ctl.signal.aborted || EP_GEN.err) break;
    try { const r = await epIA(epPrompt(g, E, job.c, job.lote, tri, usados[job.c], P), { signal: EP_GEN.ctl.signal });
      for (const al of job.lote) { let x = r && r[al.id]; if (typeof x !== "string" || !x.trim()) continue; x = x.replace(/\s*\n+\s*/g, " ").replace(/\*\*/g, "").trim(); (t.textos[al.id] = t.textos[al.id] || {})[job.c] = x; usados[job.c].push(x.split(/\s+/).slice(0, 4).join(" ")); }
      guardar(); } catch (e) { if (!e || e.code !== "cancelled") EP_GEN.err = e; }
    EP_GEN.done += job.lote.length; const pt = $("#epPT"), pb = $("#epPB"); if (pt) pt.textContent = `Redactando… ${Math.min(EP_GEN.done, EP_GEN.total)} de ${EP_GEN.total}`; if (pb) pb.style.width = Math.round(100 * EP_GEN.done / EP_GEN.total) + "%"; }
  const err = EP_GEN.err, stop = EP_GEN.ctl.signal.aborted; EP_GEN = null; if (S.v === "evalpre" || S.v === "evaluacion") re();
  toast(err ? esc(err.message || "No se pudo redactar.") : stop ? "Redacción detenida. Lo ya escrito se conservó." : "Redacción terminada. Lea y ajuste cada texto antes de copiarlo.", 4500); }
async function epCopiar(txt) { try { await navigator.clipboard.writeText(txt); toast("Copiado. Ya puede pegarlo en la plataforma."); } catch (e) { const ta = document.createElement("textarea"); ta.value = txt; document.body.append(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (_) {} ta.remove(); toast(ok ? "Copiado." : "No se pudo copiar; seleccione el texto y cópielo."); } }
function epRedactarBind(g, E) { const t = epT(E), L = activos(g), o = E.op;
  $$("[data-eol]").forEach(b => b.onclick = () => { o.largo = b.dataset.eol; guardar(); re(); }); $("#eoN") && ($("#eoN").onchange = e => { o.limite = Math.max(120, +e.target.value || 400); guardar(); });
  $$("[data-eoc]").forEach(c => c.onchange = () => { o[c.dataset.eoc] = c.checked; guardar(); });
  $$("[data-ert]").forEach(x => x.onchange = () => { const [a, c] = x.dataset.ert.split("|"); (t.textos[a] = t.textos[a] || {})[c] = x.value.trim(); guardar(); });
  $$("[data-erc]").forEach(b => b.onclick = () => { const a = L.find(x => x.id === b.dataset.erc); epCopiar(EP_CK.map(c => ((t.textos[a.id] || {})[c] || "").trim() ? EP_N[c] + ": " + t.textos[a.id][c].trim() : "").filter(Boolean).join("\n\n")); });
  $$("[data-erp]").forEach(b => b.onclick = () => { const a = L.find(x => x.id === b.dataset.erp); dlg(`<h3>Nombre de pila</h3><p class="small muted mb">Cómo se le nombra en los textos: ${esc(a.nombre)}</p><input id="epN" value="${esc(epPila(a))}"><div class="fila fin mt"><button class="btn" id="epX">Cancelar</button><button class="btn p" id="epOk">Guardar</button></div>`, v => { v.querySelector("#epX").onclick = cerrarDlg; v.querySelector("#epOk").onclick = () => { a.pila = val("epN").trim(); guardar(); cerrarDlg(); re(); }; }); });
  $$("[data-err]").forEach(b => b.onclick = () => { const [id, c] = b.dataset.err.split("|"), a = L.find(x => x.id === id); if (!epResumen(E, a, c, E.tri).length) return toast("Este alumno no tiene valoraciones en ese campo."); epRedactar(g, E, [{ a, c }]); });
  const todos = () => L.flatMap(a => EP_CK.filter(c => epResumen(E, a, c, E.tri).length).map(c => ({ a, c })));
  $("#erF") && ($("#erF").onclick = () => epRedactar(g, E, todos().filter(x => !((t.textos[x.a.id] || {})[x.c] || "").trim())));
  $("#erT") && ($("#erT").onclick = async () => { if (!(await confirmar("Se reemplazarán los textos de este trimestre por una nueva redacción.", "Redactar de nuevo"))) return; epRedactar(g, E, todos()); });
  $("#erX") && ($("#erX").onclick = () => { if (EP_GEN) EP_GEN.ctl.abort(); });
  $("#erW") && ($("#erW").onclick = () => epWord(g, E)); $("#erI") && ($("#erI").onclick = () => imprimir(epDoc(g, E))); }
function epDatos(g, E, tri) { const t = E.tris[tri || E.tri]; return activos(g).map(al => ({ al, cs: EP_CK.map(c => ({ c, x: ((t.textos[al.id] || {})[c] || "").trim() })).filter(k => k.x) })).filter(r => r.cs.length); }
function epDoc(g, E) { const R = epDatos(g, E); if (!R.length) return `<div class="doc"><p>Aún no hay textos redactados en este trimestre.</p></div>`;
  return R.map((r, i) => `<div class="doc" style="${i ? "page-break-before:always;break-before:page" : ""}">${encabezado(g, "Evaluación cualitativa por campo formativo · " + EP_TRI[E.tri])}
   <div class="datos"><span><b>Alumno(a):</b> ${esc(r.al.nombre)}</span><span><b>Grado y grupo:</b> ${esc(grNom(g))}</span><span><b>Ciclo escolar:</b> ${esc(E.ciclo)}</span><span><b>Docente:</b> ${esc(yo().nombre)}</span></div>
   <table><tbody>${r.cs.map(k => `<tr><th style="width:24%">${EP_N[k.c]}</th><td style="text-align:justify">${esc(k.x)}</td></tr>`).join("")}</tbody></table>
   <table class="firmas"><tr><td>${esc(yo().nombre)}<br>Educadora</td><td>${esc(dirTxt(g))}<br>Dirección</td><td>Madre, padre o tutor(a)</td></tr></table></div>`).join(""); }
async function epWord(g, E) { const R = epDatos(g, E); if (!R.length) return toast("Aún no hay textos redactados en este trimestre.");
  try { toast("Preparando el documento de Word…"); await cargarJS("https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js");
    const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = docx, F = "Arial", ch = [];
    ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: g.escuela || "", bold: true, size: 30, font: F })] }));
    ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "Evaluación cualitativa por campo formativo · " + EP_TRI[E.tri], size: 22, font: F })] }));
    ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "444444", space: 6 } }, children: [new TextRun({ text: `Grado y grupo: ${grNom(g)}     Docente: ${yo().nombre}     Ciclo escolar: ${E.ciclo}`, size: 20, font: F })] }));
    R.forEach((r, i) => { ch.push(new Paragraph({ spacing: { before: 260, after: 100 }, keepNext: true, children: [new TextRun({ text: `${i + 1}. ${r.al.nombre}`, bold: true, size: 24, font: F })] }));
      r.cs.forEach(k => { ch.push(new Paragraph({ spacing: { after: 40 }, keepNext: true, children: [new TextRun({ text: EP_N[k.c], bold: true, size: 21, font: F })] })); ch.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 140 }, children: [new TextRun({ text: k.x, size: 21, font: F })] })); }); });
    const blob = await Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children: ch }] }));
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `Evaluacion cualitativa ${grNom(g)} ${EP_TRI[E.tri]}.docx`.replace(/[\\/:*?"<>|]/g, ""); document.body.append(a); a.click(); a.remove(); }
  catch (e) { toast(esc(e.message || "No se pudo crear el documento.")); } }

/* ---------- historial ---------- */
function epHistHTML(g, E) { const L = activos(g), al = L.find(a => a.id === S.eph) || L[0]; if (!al) return `<div class="vacio mt">Primero agregue a sus alumnos.</div>`;
  return `<label class="campo mt"><span>Alumno(a)</span><select id="ehS">${L.map(a => `<option value="${a.id}" ${a === al ? "selected" : ""}>${esc(a.nombre)}</option>`).join("")}</select></label>
  ${EP_CK.map(c => `<h3 class="mt2" style="font-size:16px;color:${EP_COL[c]}">${EP_N[c]}</h3>${[1, 2, 3].map(t => { const x = ((E.tris[t].textos[al.id] || {})[c] || "").trim(), r = epResumen(E, al, c, t);
    return x || r.length ? `<section class="card mt" style="padding:10px 12px"><p class="small"><b>${EP_TRI[t]}</b>${r.length ? ` · <span class="muted">${r.filter(z => z.v === "S").length} Sí, ${r.filter(z => z.v === "O").length} En ocasiones, ${r.filter(z => z.v === "N").length} No</span>` : ""}</p>${x ? `<p class="small mt">${esc(x)}</p>` : `<p class="small muted mt">Sin texto redactado.</p>`}</section>` : ""; }).join("") || `<p class="small muted">Sin registros.</p>`}`).join("")}`; }
function epHistBind(g, E) { $("#ehS") && ($("#ehS").onchange = e => { S.eph = e.target.value; re(); }); }

/* ---------- ficha del alumno (en Mi grupo) ---------- */
function preFicha(g, a) { const E = EPde(g), t = epT(E);
  return `<h2 class="sec-t">Evaluación cualitativa<small>${EP_TRI[E.tri]}</small></h2><div class="lista">${EP_CK.map(c => { const r = epResumen(E, a, c, E.tri), x = ((t.textos[a.id] || {})[c] || "").trim();
    return `<div class="it"><span class="tx"><b style="color:${EP_COL[c]}">${EP_N[c]}</b><small>${r.length ? `${r.filter(z => z.v === "S").length} Sí · ${r.filter(z => z.v === "O").length} En ocasiones · ${r.filter(z => z.v === "N").length} No` : "Sin valoraciones"}${x ? " · " + esc(x.slice(0, 140)) + (x.length > 140 ? "…" : "") : ""}</small></span></div>`; }).join("")}</div>`; }
