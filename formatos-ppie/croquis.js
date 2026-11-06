/* Tlamatini · Croquis de evacuación y riesgos (Atlas de riesgo · Seguridad escolar)
   Se carga solo al entrar al apartado. Todo se guarda en este dispositivo.
   1) Se ubica la escuela en el mapa satelital (búsqueda, enlace o coordenadas de Google Maps, o GPS).
   2) Se dibujan edificios, áreas, rutas de evacuación y bardas, y se coloca la señalética
      de protección civil (NOM-003-SEGOB-2011: colores, formas y símbolos).
   3) Se genera la hoja en PDF, tamaño carta o doble carta, con encabezado, leyenda, norte, escala, datos y firmas.
   Las coordenadas de lo dibujado se guardan respecto al centro del mapa (pixeles al zoom de referencia),
   y los tamaños en milésimas del ancho del mapa, para que el croquis se vea igual en ambos tamaños de hoja. */

const CRQ_KEY = "crq-proyectos";
const CRQ_TAM = {
  carta: { n: "Carta", d: "21.6 × 27.9 cm (horizontal)", w: 792, h: 612, m: 22, enc: 66, col: 182 },
  doble: { n: "Doble carta", d: "27.9 × 43.2 cm (horizontal)", w: 1224, h: 792, m: 30, enc: 86, col: 262 }
};
const CRQ_TIPOS = {
  interno: { n: "Croquis de evacuación (interno)", t: "CROQUIS DE EVACUACIÓN Y RIESGOS INTERNOS", d: "El plantel: edificios, rutas de evacuación, salidas, punto de reunión y equipo de emergencia." },
  externo: { n: "Croquis de riesgos del entorno (externo)", t: "CROQUIS DE RIESGOS EXTERNOS DEL ENTORNO ESCOLAR", d: "Alrededor de la escuela: calles, transformadores, arroyos, gasolineras y otros riesgos cercanos." }
};
const CRQ_CAPAS = {
  sat: { n: "Satélite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", max: 19, atr: "Imagen satelital: Esri, Maxar, Earthstar Geographics" },
  calle: { n: "Mapa de calles", url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", max: 19, atr: "Mapa: © colaboradores de OpenStreetMap" },
  blanco: { n: "Sin mapa (fondo blanco)", url: "", max: 19, atr: "" }
};
const CRQ_REF = ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"];
const CRQ_AREAS = {
  cancha: { n: "Cancha", c: "#F4B183" }, patio: { n: "Patio cívico / explanada", c: "#D9D9D9" }, verde: { n: "Área verde / jardín", c: "#A9D18E" },
  juegos: { n: "Área de juegos", c: "#FFD966" }, estac: { n: "Estacionamiento", c: "#BDD7EE" }, otro: { n: "Otra área", c: "#E2C4F0" }
};
const CRQ_BARDAS = { barda: { n: "Barda perimetral", dash: 0 }, malla: { n: "Malla o reja", dash: 1 } };

/* ---------- Señalética (NOM-003-SEGOB-2011) y elementos del croquis: se dibujan en una caja de -50 a 50 ---------- */
const CRQ_VERDE = "#00965E", CRQ_ROJO = "#D52B1E", CRQ_AMAR = "#FFD100", CRQ_AZUL = "#1F3A6B";
const CRQ_GRUPOS = [
  ["inf", "Señales informativas de emergencia"], ["inc", "Equipo contra incendio"],
  ["pre", "Señales de precaución (riesgos)"], ["pro", "Señales de prohibición"], ["otr", "Otros elementos"]];
function crqRR(c, x, y, w, h, r, col) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  c.lineWidth = 6; c.strokeStyle = "#fff"; c.stroke(); c.fillStyle = col; c.fill() }
const crqCuadro = col => c => crqRR(c, -47, -47, 94, 94, 9, col);
function crqTri(c) { c.beginPath(); c.moveTo(0, -46); c.lineTo(50, 41); c.lineTo(-50, 41); c.closePath(); c.lineJoin = "round"; c.lineWidth = 9; c.strokeStyle = "#fff"; c.stroke(); c.fillStyle = CRQ_AMAR; c.fill(); c.lineWidth = 6; c.strokeStyle = "#111"; c.stroke(); c.fillStyle = "#111"; c.strokeStyle = "#111" }
function crqProhib(c) { c.beginPath(); c.arc(0, 0, 48, 0, 7); c.fillStyle = "#fff"; c.fill(); c.fillStyle = "#111"; c.strokeStyle = "#111" }
function crqProhibArriba(c) { c.lineWidth = 10; c.strokeStyle = CRQ_ROJO; c.beginPath(); c.arc(0, 0, 42, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-30, -30); c.lineTo(30, 30); c.stroke() }
const crqBlanco = c => { c.fillStyle = "#fff"; c.strokeStyle = "#fff"; c.lineCap = "round"; c.lineJoin = "round" };
function crqLin(c, w, pts) { c.lineWidth = w; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke() }
function crqPoly(c, pts) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill() }
function crqCirc(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() }
function crqPersonaCorre(c, dx = 0) {
  crqCirc(c, -12 + dx, -27, 8);
  crqLin(c, 10, [[-14 + dx, -15], [-6 + dx, 8]]); crqLin(c, 8, [[-12 + dx, -12], [0 + dx, -4], [8 + dx, -13]]); crqLin(c, 8, [[-14 + dx, -11], [-25 + dx, -2], [-33 + dx, -8]]);
  crqLin(c, 9, [[-6 + dx, 8], [5 + dx, 20], [1 + dx, 37]]); crqLin(c, 9, [[-6 + dx, 8], [-18 + dx, 20], [-33 + dx, 22]]) }
const CRQ_SIMS = [
  { k: "salida", g: "inf", n: "Salida de emergencia", flip: 1, f: c => { crqCuadro(CRQ_VERDE)(c); crqBlanco(c); c.lineWidth = 6; c.strokeRect(12, -37, 26, 74); crqPersonaCorre(c) } },
  { k: "ruta", g: "inf", n: "Ruta de evacuación (señal)", rot: 1, f: c => { crqCuadro(CRQ_VERDE)(c); crqBlanco(c); crqPoly(c, [[-36, -11], [6, -11], [6, -28], [38, 0], [6, 28], [6, 11], [-36, 11]]) } },
  { k: "reunion", g: "inf", n: "Punto de reunión", f: c => { crqCuadro(CRQ_VERDE)(c); crqBlanco(c);
      for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); c.fillRect(-42, -5, 18, 10); crqPoly(c, [[-26, -14], [-9, 0], [-26, 14]]); c.restore() } crqCirc(c, 0, 0, 5) } },
  { k: "menor", g: "inf", n: "Zona de menor riesgo", f: c => { crqCuadro(CRQ_VERDE)(c); crqBlanco(c); crqCirc(c, 0, -17, 10);
      crqLin(c, 8, [[-22, 2], [-15, -30], [0, -34], [15, -30], [22, 2]]); crqLin(c, 13, [[0, -4], [0, 20]]); crqLin(c, 9, [[0, 20], [-12, 38]]); crqLin(c, 9, [[0, 20], [12, 38]]) } },
  { k: "botiquin", g: "inf", n: "Primeros auxilios (botiquín)", f: c => { crqCuadro(CRQ_VERDE)(c); crqBlanco(c); c.fillRect(-12, -34, 24, 68); c.fillRect(-34, -12, 68, 24) } },
  { k: "escalera", g: "inf", n: "Escalera de emergencia", flip: 1, f: c => { crqCuadro(CRQ_VERDE)(c); crqBlanco(c); crqPoly(c, [[-38, 38], [-38, 20], [-19, 20], [-19, 3], [0, 3], [0, -14], [19, -14], [19, -31], [38, -31], [38, 38]]) } },
  { k: "extintor", g: "inc", n: "Extintor", f: c => { crqCuadro(CRQ_ROJO)(c); crqBlanco(c); c.beginPath(); c.roundRect ? c.roundRect(-13, -16, 26, 52, 8) : c.rect(-13, -16, 26, 52); c.fill();
      c.fillRect(-5, -27, 10, 12); crqLin(c, 6, [[-4, -26], [-23, -33]]); c.lineWidth = 5; c.beginPath(); c.moveTo(5, -24); c.quadraticCurveTo(30, -22, 25, 10); c.stroke() } },
  { k: "hidrante", g: "inc", n: "Hidrante / manguera", f: c => { crqCuadro(CRQ_ROJO)(c); crqBlanco(c); c.lineWidth = 7; c.beginPath(); c.arc(-4, -6, 25, 0, 7); c.stroke(); crqCirc(c, -4, -6, 9); crqLin(c, 6, [[19, 4], [32, 34]]) } },
  { k: "alarma", g: "inc", n: "Alarma", f: c => { crqCuadro(CRQ_ROJO)(c); crqBlanco(c); c.beginPath(); c.moveTo(-24, 16); c.lineTo(24, 16); c.lineTo(18, 7); c.lineTo(18, -8); c.arc(0, -8, 18, 0, Math.PI, true); c.lineTo(-18, 7); c.closePath(); c.fill();
      crqCirc(c, 0, 23, 6); c.lineWidth = 5; [[1, 34], [-1, -34]].forEach(([s, x]) => { c.beginPath(); c.arc(0, -4, Math.abs(x), s > 0 ? -0.45 : Math.PI - 0.45, s > 0 ? 0.45 : Math.PI + 0.45); c.stroke() }) } },
  { k: "telefono", g: "inc", n: "Teléfono de emergencia", f: c => { crqCuadro(CRQ_ROJO)(c); crqBlanco(c); c.lineWidth = 13; c.beginPath(); c.arc(0, 12, 30, Math.PI * 1.12, Math.PI * 1.88); c.stroke();
      c.beginPath(); c.roundRect ? c.roundRect(-38, -12, 20, 18, 5) : c.rect(-38, -12, 20, 18); c.fill(); c.beginPath(); c.roundRect ? c.roundRect(18, -12, 20, 18, 5) : c.rect(18, -12, 20, 18); c.fill(); c.fillRect(-16, 18, 32, 16) } },
  { k: "electrico", g: "pre", n: "Riesgo eléctrico (centro de carga, cables)", f: c => { crqTri(c); crqPoly(c, [[8, -28], [-13, 7], [-1, 7], [-9, 34], [16, -5], [3, -5], [12, -28]]) } },
  { k: "inflamable", g: "pre", n: "Material inflamable", f: c => { crqTri(c); c.beginPath(); c.moveTo(0, -24); c.bezierCurveTo(22, -2, 19, 32, 0, 32); c.bezierCurveTo(-19, 32, -22, 6, -7, -6); c.bezierCurveTo(-5, 6, 1, 7, 3, 1); c.bezierCurveTo(5, -9, 0, -16, 0, -24); c.fill() } },
  { k: "gas", g: "pre", n: "Tanque de gas", f: c => { crqTri(c); c.beginPath(); c.roundRect ? c.roundRect(-11, -10, 22, 42, 8) : c.rect(-11, -10, 22, 42); c.fill(); c.fillRect(-5, -19, 10, 9) } },
  { k: "toxico", g: "pre", n: "Sustancias tóxicas", f: c => { crqTri(c); crqCirc(c, 0, -5, 14); c.fillRect(-8, 4, 16, 10); c.fillStyle = CRQ_AMAR; crqCirc(c, -5, -6, 4); crqCirc(c, 5, -6, 4); c.strokeStyle = "#111"; c.lineCap = "round"; crqLin(c, 5, [[-20, 18], [20, 33]]); crqLin(c, 5, [[20, 18], [-20, 33]]) } },
  { k: "precaucion", g: "pre", n: "Precaución (otro riesgo)", f: c => { crqTri(c); c.fillRect(-5, -22, 10, 34); crqCirc(c, 0, 24, 6) } },
  { k: "nofumar", g: "pro", n: "Prohibido fumar", f: c => { crqProhib(c); c.fillRect(-31, 4, 44, 10); c.fillRect(16, 4, 12, 10); c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(-24, 0); c.bezierCurveTo(-32, -10, -16, -14, -24, -26); c.stroke(); crqProhibArriba(c) } },
  { k: "acceso", g: "otr", n: "Acceso / puerta", flip: 1, f: c => { crqCuadro(CRQ_AZUL)(c); crqBlanco(c); c.lineWidth = 6; c.strokeRect(6, -34, 30, 68); c.fillRect(-38, -6, 28, 12); crqPoly(c, [[-12, -17], [6, 0], [-12, 17]]) } },
  { k: "arbol", g: "otr", n: "Árbol (riesgo de caída de ramas)", f: c => { c.fillStyle = "#fff"; [[0, -12, 33], [-19, 4, 23], [19, 4, 23]].forEach(([x, y, r]) => crqCirc(c, x, y, r + 4)); c.fillRect(-9, 8, 18, 36);
      c.fillStyle = "#6D4C2F"; c.fillRect(-6, 8, 12, 33); c.fillStyle = "#2E7D32"; [[0, -12, 30], [-19, 4, 20], [19, 4, 20]].forEach(([x, y, r]) => crqCirc(c, x, y, r)) } },
  { k: "cisterna", g: "otr", n: "Cisterna / tinaco", f: c => { c.fillStyle = "#fff"; crqCirc(c, 0, 0, 49); c.fillStyle = "#1E6FB8"; crqCirc(c, 0, 0, 45); c.strokeStyle = "#fff"; c.lineWidth = 6; c.lineCap = "round";
      [-14, 0, 14].forEach(y => { c.beginPath(); c.moveTo(-26, y); c.bezierCurveTo(-16, y - 8, -8, y + 8, 0, y); c.bezierCurveTo(8, y - 8, 16, y + 8, 26, y); c.stroke() }) } },
  { k: "transformador", g: "otr", n: "Transformador / poste de luz", f: c => { c.fillStyle = "#fff"; crqCirc(c, 0, 0, 49); c.fillStyle = CRQ_AMAR; crqCirc(c, 0, 0, 45); c.lineWidth = 4; c.strokeStyle = "#111"; c.beginPath(); c.arc(0, 0, 44, 0, 7); c.stroke();
      c.fillStyle = "#111"; c.fillRect(-4, -34, 8, 70); c.fillRect(-26, -27, 52, 7); c.fillRect(6, -14, 15, 22) } }
];
const CRQ_SIM = Object.fromEntries(CRQ_SIMS.map(s => [s.k, s]));
const CRQ_ICO = {};
function crqIcono(k, px = 64) { const id = k + px; if (CRQ_ICO[id]) return CRQ_ICO[id];
  const cv = document.createElement("canvas"); cv.width = cv.height = px; const c = cv.getContext("2d"); c.translate(px / 2, px / 2); c.scale(px / 104, px / 104); CRQ_SIM[k].f(c);
  return (CRQ_ICO[id] = cv.toDataURL("image/png")) }

/* ---------- Proyectos guardados ---------- */
const crqTodos = () => store.get(CRQ_KEY, []);
function crqGuardar(P) { if (!P) return; P.act = Date.now(); const l = crqTodos().filter(x => x.id !== P.id); l.unshift(P); store.set(CRQ_KEY, l) }
let CRQ_T = null;
const crqGuardarLuego = () => { clearTimeout(CRQ_T); CRQ_T = setTimeout(() => crqGuardar(CQ), 400) };
let CQ = null;   // croquis abierto
const CQS = { tool: "sel", sel: null, temp: null, sim: "salida", hist: [], fut: [], img: null, imgKey: "", zoom: 1, drag: null };
const crqId = () => "crq" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const crqUid = () => Math.random().toString(36).slice(2, 9);
const crqEscuela = () => ({ escuela: perfil.escuela || "", cct: perfil.cct || "", turno: perfil.turno || "", domicilio: perfil.domicilio || "", localidad: perfil.localidad || "", municipio: perfil.municipio || "", director: perfil.director || "" });

/* ---------- Geometría de mapa (Web Mercator, mosaicos de 256 px) ---------- */
const crqProy = (lat, lng, z) => { const n = 256 * Math.pow(2, z), s = Math.sin(lat * Math.PI / 180);
  return [(lng + 180) / 360 * n, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n] };
const crqDesp = (x, y, z) => { const n = 256 * Math.pow(2, z), lng = x / n * 360 - 180, t = Math.PI - 2 * Math.PI * y / n; return [180 / Math.PI * Math.atan(0.5 * (Math.exp(t) - Math.exp(-t))), lng] };
const crqMpp = (lat, z) => 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, z);   // metros por pixel
function crqLayout(tam) {
  const T = CRQ_TAM[tam], top = T.m + T.enc + 6, mapW = T.w - 2 * T.m - T.col - 10, mapH = T.h - top - T.m - 12;
  return { T, mapX: T.m, mapY: top, mapW, mapH, colX: T.m + mapW + 10, colW: T.col, asp: mapW / mapH };
}
const crqFh = P => Math.round(P.fw / crqLayout(P.tam).asp);

// Hasta qué acercamiento hay foto satelital en ese lugar: más allá, Esri entrega un mosaico gris («Map data not yet available»)
const CRQ_ZMAX = {};
function crqMosaicoOk(z, lat, lng) {
  const [x, y] = crqProy(lat, lng, z).map(v => Math.floor(v / 256));
  return new Promise(ok => { const im = new Image(); im.crossOrigin = "anonymous"; const t = setTimeout(() => ok(null), 12000);
    im.onload = () => { clearTimeout(t); try { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); g.drawImage(im, 0, 0, 64, 64);
        const d = g.getImageData(0, 0, 64, 64).data; let s = 0, s2 = 0, n = 0; for (let i = 0; i < d.length; i += 4) { const v = (d[i] + d[i + 1] + d[i + 2]) / 3; s += v; s2 += v * v; n++ }
        const m = s / n; ok(Math.sqrt(Math.max(0, s2 / n - m * m)) > 9) } catch (e) { ok(null) } };
    im.onerror = () => { clearTimeout(t); ok(null) };
    im.src = CRQ_CAPAS.sat.url.replace("{z}", z).replace("{x}", x).replace("{y}", y) }) }
async function crqZMax(lat, lng) {
  const k = lat.toFixed(2) + "," + lng.toFixed(2); if (CRQ_ZMAX[k]) return CRQ_ZMAX[k];
  for (const z of [19, 18, 17, 16]) { const r = await crqMosaicoOk(z, lat, lng); if (r === null) return 19; if (r) return (CRQ_ZMAX[k] = z) }
  return (CRQ_ZMAX[k] = 15) }

// Fondo del croquis: se arma con los mosaicos del mapa (satélite, calles o en blanco)
async function crqFondo(P) {
  const fh = crqFh(P), key = [P.lat, P.lng, P.zv, P.fw, fh, P.capa, P.calles].join("|");
  if (CQS.img && CQS.imgKey === key) return CQS.img;
  const capa = CRQ_CAPAS[P.capa] || CRQ_CAPAS.sat;
  const zMax = P.capa === "sat" ? await crqZMax(P.lat, P.lng) : capa.max;
  let zc = Math.min(zMax, P.zv + 1);
  while (zc > P.zv - 2 && P.fw * Math.pow(2, zc - P.zv) > 3000) zc--;
  let f = Math.pow(2, zc - P.zv), W = Math.round(P.fw * f), H = Math.round(fh * f);
  const min = P.tam === "doble" ? 2200 : 1600, up = W < min ? min / W : 1;
  const cv = document.createElement("canvas"); cv.width = Math.round(W * up); cv.height = Math.round(H * up);
  const c = cv.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, cv.width, cv.height);
  if (!capa.url) { c.strokeStyle = "#E4E8EE"; c.lineWidth = 1; const g = cv.width / 40; for (let x = 0; x < cv.width; x += g) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, cv.height); c.stroke() } for (let y = 0; y < cv.height; y += g) { c.beginPath(); c.moveTo(0, y); c.lineTo(cv.width, y); c.stroke() } }
  else {
    const [cx, cy] = crqProy(P.lat, P.lng, zc), x0 = cx - W / 2, y0 = cy - H / 2, n = Math.pow(2, zc);
    const urls = [capa.url].concat(P.capa === "sat" && P.calles ? CRQ_REF : []);
    let fallo = 0, total = 0;
    for (const u of urls) {
      const tareas = [];
      for (let tx = Math.floor(x0 / 256); tx <= Math.floor((x0 + W) / 256); tx++) for (let ty = Math.floor(y0 / 256); ty <= Math.floor((y0 + H) / 256); ty++) {
        if (ty < 0 || ty >= n) continue; const txx = ((tx % n) + n) % n;
        tareas.push(new Promise(ok => { const im = new Image(); im.crossOrigin = "anonymous"; const t = setTimeout(() => { im.src = ""; ok(false) }, 20000);
          im.onload = () => { clearTimeout(t); c.drawImage(im, (tx * 256 - x0) * up, (ty * 256 - y0) * up, 256 * up + 0.5, 256 * up + 0.5); ok(true) };
          im.onerror = () => { clearTimeout(t); ok(false) };
          im.src = u.replace("{z}", zc).replace("{x}", txx).replace("{y}", ty) }));
      }
      const r = await Promise.all(tareas); if (u === capa.url) { total = r.length; fallo = r.filter(x => !x).length }
    }
    if (total && fallo / total > 0.5) throw new Error("No se pudo descargar el mapa. Revise su conexión a internet o use «Sin mapa (fondo blanco)».");
    try { c.getImageData(0, 0, 1, 1) } catch (e) { throw new Error("El mapa no se puede usar para el PDF en este navegador. Elija «Mapa de calles» o «Sin mapa».") }
  }
  CQS.img = cv; CQS.imgKey = key; return cv;
}

/* ---------- Dibujo del croquis (pantalla y PDF usan lo mismo) ---------- */
function crqCentro(pts) { let a = 0, x = 0, y = 0;
  for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length], f = x1 * y2 - x2 * y1; a += f; x += (x1 + x2) * f; y += (y1 + y2) * f }
  if (Math.abs(a) < 1e-6) return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  return [x / (3 * a), y / (3 * a)] }
function crqTexto(c, lineas, x, y, px, o = {}) {
  c.font = `${o.it ? "italic " : ""}${o.b ? "700 " : "600 "}${px}px Arial, Helvetica, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
  lineas.forEach((l, i) => { const yy = y + (i - (lineas.length - 1) / 2) * px * 1.15; c.lineWidth = px * 0.3; c.strokeStyle = o.halo || "rgba(255,255,255,.95)"; c.strokeText(l, x, yy); c.fillStyle = o.col || "#111"; c.fillText(l, x, yy) }) }
function crqFlechas(c, pts, w, col, paso) {
  const flecha = (x, y, a, s) => { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(s, 0); c.lineTo(-s * 0.7, -s * 0.75); c.lineTo(-s * 0.7, s * 0.75); c.closePath();
    c.lineWidth = w * 0.55; c.strokeStyle = "#fff"; c.stroke(); c.fillStyle = col; c.fill(); c.restore() };
  let resto = paso * 0.6;
  for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1);
    let d = resto; while (d < L - w * 2) { flecha(x1 + (x2 - x1) * d / L, y1 + (y2 - y1) * d / L, a, w * 1.5); d += paso } resto = d - L }
  const n = pts.length; if (n > 1) { const [x1, y1] = pts[n - 2], [x2, y2] = pts[n - 1]; flecha(x2, y2, Math.atan2(y2 - y1, x2 - x1), w * 2.3) } }
function crqPinta(c, P, W, H, o = {}) {
  const k = W / P.fw, u = W / 1000, X = x => W / 2 + x * k, Y = y => H / 2 + y * k;
  if (o.img) c.drawImage(o.img, 0, 0, W, H); else { c.fillStyle = "#fff"; c.fillRect(0, 0, W, H) }
  const camino = (pts, cerrar) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(X(p[0]), Y(p[1])) : c.moveTo(X(p[0]), Y(p[1]))); if (cerrar) c.closePath() };
  const orden = { area: 0, edif: 1, barda: 2, ruta: 3, sim: 4, txt: 5 };
  const els = P.el.slice().sort((a, b) => orden[a.t] - orden[b.t]);
  for (const e of els) {
    if (e.t === "area" || e.t === "edif") { if (e.pts.length < 2) continue; camino(e.pts, true);
      if (e.t === "area") { c.globalAlpha = 0.62; c.fillStyle = (CRQ_AREAS[e.k] || CRQ_AREAS.otro).c; c.fill(); c.globalAlpha = 1; c.lineWidth = 1.6 * u; c.strokeStyle = "rgba(40,40,40,.85)"; c.setLineDash([5 * u, 3 * u]); c.stroke(); c.setLineDash([]) }
      else { c.fillStyle = "rgba(255,255,255,.9)"; c.fill(); c.lineWidth = 2.6 * u; c.strokeStyle = "#1F2A44"; c.stroke() } }
    else if (e.t === "barda") { if (e.pts.length < 2) continue; camino(e.pts, e.cerr); c.lineJoin = "round"; c.lineCap = "round";
      c.lineWidth = 6 * u; c.strokeStyle = "rgba(255,255,255,.85)"; c.stroke(); c.lineWidth = 3.4 * u; c.strokeStyle = "#7A1E1E"; if ((CRQ_BARDAS[e.k] || {}).dash) c.setLineDash([9 * u, 6 * u]); c.stroke(); c.setLineDash([]) }
    else if (e.t === "ruta") { if (e.pts.length < 2) continue; const w = (e.w || 6) * u; camino(e.pts); c.lineJoin = "round"; c.lineCap = "round";
      c.lineWidth = w + 3.4 * u; c.strokeStyle = "#fff"; c.stroke(); c.lineWidth = w; c.strokeStyle = CRQ_VERDE; c.stroke();
      crqFlechas(c, e.pts.map(p => [X(p[0]), Y(p[1])]), w, CRQ_VERDE, 75 * u) }
    else if (e.t === "sim") { const d = CRQ_SIM[e.k]; if (!d) continue; const s = (e.s || 40) * u;
      c.save(); c.translate(X(e.x), Y(e.y)); if (d.rot && e.r) c.rotate(e.r * Math.PI / 180); if (d.flip && e.fx) c.scale(-1, 1); c.scale(s / 104, s / 104); d.f(c); c.restore();
      if (e.nom) crqTexto(c, String(e.nom).split("\n"), X(e.x), Y(e.y) + s * 0.5 + 11 * u, 10 * u, { b: 1 }) }
    else if (e.t === "txt") { if (!e.txt) continue; const col = { negro: "#111", rojo: "#B00020", azul: "#1F3A6B", blanco: "#fff" }[e.col || "negro"];
      crqTexto(c, String(e.txt).split("\n"), X(e.x), Y(e.y), (e.s || 16) * u, { b: 1, col, halo: e.col === "blanco" ? "rgba(0,0,0,.75)" : undefined }) }
  }
  // nombres de edificios y áreas, encima de todo
  for (const e of els) if ((e.t === "edif" || e.t === "area") && e.pts.length > 2 && (e.nom || e.sub)) {
    const [cx, cy] = crqCentro(e.pts), px = (e.ls || (e.t === "edif" ? 15 : 12)) * u;
    crqTexto(c, [e.nom, e.sub].filter(Boolean), X(cx) + (e.lx || 0) * k, Y(cy) + (e.ly || 0) * k, px, { b: e.t === "edif", it: e.t === "area" }) }
  if (o.editor) {   // selección, vértices y trazo en curso
    const sel = P.el.find(x => x.id === CQS.sel), hs = 6 * (o.dpr || 1);
    if (sel) { c.save(); c.strokeStyle = "#0A84FF"; c.lineWidth = 2 * (o.dpr || 1); c.setLineDash([6 * (o.dpr || 1), 4 * (o.dpr || 1)]);
      if (sel.pts) { camino(sel.pts, sel.t === "edif" || sel.t === "area" || sel.cerr); c.stroke(); c.setLineDash([]); c.fillStyle = "#fff";
        sel.pts.forEach(p => { c.beginPath(); c.rect(X(p[0]) - hs, Y(p[1]) - hs, hs * 2, hs * 2); c.fill(); c.stroke() }) }
      else { const b = crqCaja(sel, W, H, P); c.strokeRect(b[0], b[1], b[2] - b[0], b[3] - b[1]) }
      c.restore() }
    const t = CQS.temp;
    if (t && t.pts.length) { c.save(); c.strokeStyle = "#0A84FF"; c.lineWidth = 2.5 * (o.dpr || 1); c.setLineDash([7 * (o.dpr || 1), 5 * (o.dpr || 1)]);
      camino(t.pts.concat(t.cur ? [t.cur] : [])); c.stroke(); c.setLineDash([]); c.fillStyle = "#0A84FF";
      t.pts.forEach((p, i) => { c.beginPath(); c.arc(X(p[0]), Y(p[1]), (i ? 4 : 7) * (o.dpr || 1), 0, 7); c.fill() }); c.restore() }
  }
}
// Caja que ocupa un símbolo o texto (en pixeles del lienzo)
function crqCaja(e, W, H, P) { const k = W / P.fw, u = W / 1000, x = W / 2 + e.x * k, y = H / 2 + e.y * k;
  if (e.t === "sim") { const s = (e.s || 40) * u / 2; return [x - s, y - s, x + s, y + s + (e.nom ? 22 * u : 0)] }
  const px = (e.s || 16) * u, n = String(e.txt || "").split("\n"), w = Math.max(...n.map(l => l.length)) * px * 0.58 / 2 + 4, h = n.length * px * 1.15 / 2 + 3;
  return [x - w, y - h, x + w, y + h] }

/* ---------- Pantallas ---------- */
function crqCss() { if (document.getElementById("crqCss")) return; const st = document.createElement("style"); st.id = "crqCss"; st.textContent = `
.crq-lista{display:flex;flex-direction:column;gap:10px}
.crq-it{display:flex;gap:12px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--card)}
.crq-it .tx{flex:1;min-width:0}.crq-it b{display:block}.crq-it span{color:var(--muted);font-size:14px}
.crq-op{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
.crq-op label{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:12px;padding:10px 12px;cursor:pointer;background:var(--card)}
.crq-op input{margin-top:4px}.crq-op small{display:block;color:var(--muted);font-size:13px}
.crq-mapa{position:relative;height:min(62vh,560px);border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#dfe3e8}
.crq-mapa .lf{position:absolute;inset:0}
.crq-marco{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:3px solid #FFD100;box-shadow:0 0 0 9999px rgba(10,20,40,.42);pointer-events:none;z-index:500;border-radius:2px}
.crq-marco::after{content:"Lo que quede dentro del recuadro saldrá en el croquis";position:absolute;left:0;right:0;top:-30px;text-align:center;color:#fff;font:600 13px/1.2 system-ui;text-shadow:0 1px 3px #000}
.crq-res{display:flex;flex-direction:column;gap:6px}.crq-res button{text-align:left}
.crq-barra{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px;scrollbar-width:thin}
.crq-barra button{flex:none;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:74px;padding:8px 6px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);font:600 12px/1.15 inherit;cursor:pointer}
.crq-barra button[aria-pressed=true]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.crq-barra svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.crq-lienzo{position:relative;overflow:auto;border:1px solid var(--line);border-radius:12px;background:#eef1f4;max-height:72vh}
.crq-lienzo canvas{display:block;touch-action:none;cursor:crosshair}
.crq-lienzo.sel canvas{cursor:default}
.wrap:has(.crq-ed){max-width:1280px}.wrap:has(.crq-mapa){max-width:1000px}
.crq-cargando[hidden]{display:none!important}
.crq-cargando{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.75);font-weight:700}
.crq-pal{display:flex;flex-direction:column;gap:8px}.crq-pal h4{margin:4px 0 0;font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.crq-pal .g{display:flex;flex-wrap:wrap;gap:6px}
.crq-pal button{display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:10px;background:var(--card);padding:5px 8px;font:500 13px/1.2 inherit;color:var(--ink);cursor:pointer;text-align:left;max-width:230px}
.crq-pal button[aria-pressed=true]{outline:3px solid var(--accent);outline-offset:1px}
.crq-pal img{width:30px;height:30px;flex:none}
.crq-ed{display:grid;gap:12px}
@media(min-width:1000px){.crq-ed{grid-template-columns:minmax(0,1fr) 330px;align-items:start}.crq-ed .crq-lado{position:sticky;top:10px;max-height:calc(100vh - 20px);overflow:auto}}
.crq-fila{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.crq-fila .btn{min-height:42px;padding:8px 14px}
.crq-zoom{display:flex;gap:6px;align-items:center}.crq-zoom button{width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--card);font-size:20px;cursor:pointer;color:var(--ink)}
.crq-campo{display:flex;flex-direction:column;gap:4px}.crq-campo label{font-weight:600;font-size:14px}
.crq-campo input,.crq-campo select,.crq-campo textarea{font:inherit;padding:9px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}
.crq-aviso{border-left:4px solid var(--accent);background:var(--accent-soft,#fff6e5);padding:10px 12px;border-radius:8px;font-size:14px}
`; document.head.appendChild(st) }
function crqTop(t, sub, volver) {
  return `<div class="top"><button class="back" id="crqVolver" aria-label="Regresar">←</button><div style="min-width:0"><div class="eyebrow">${esc(sub || "Seguridad escolar · Atlas de riesgo")}</div><h2>${esc(t)}</h2></div></div>` }

function crqView() {
  crqCss(); S.view = "crq"; S.sec = "croquis"; setBar(""); CQ = null; CQS.img = null;
  const l = crqTodos(), e = crqEscuela();
  app.innerHTML = `${crqTop("Croquis de evacuación y riesgos")}
   <div class="sec-hero"><span class="sec-ic" aria-hidden="true">${ICON.shield || ""}</span><p>Ubique su escuela en el mapa satelital, dibuje los edificios y las rutas de evacuación, y coloque la señalética de protección civil (NOM-003-SEGOB-2011). El croquis sale en PDF, tamaño carta o doble carta, listo para el atlas de riesgo.</p></div>
   ${e.escuela ? "" : `<div class="crq-aviso"><b>Primero capture su escuela</b> en «Mi escuela» para que el croquis lleve el nombre, la C.C.T., el domicilio y el logo.</div>`}
   <section class="card"><div class="crq-fila" style="justify-content:space-between"><h3 style="margin:0">Mis croquis</h3><button class="btn primary" id="crqNuevo">+ Nuevo croquis</button></div>
    ${l.length ? `<div class="crq-lista">${l.map(p => `<div class="crq-it"><img src="${crqIcono(p.tipo === "externo" ? "precaucion" : "reunion", 48)}" width="40" height="40" alt="">
      <div class="tx"><b>${esc(p.nombre || CRQ_TIPOS[p.tipo].n)}</b><span>${esc(CRQ_TIPOS[p.tipo].n)} · ${esc(CRQ_TAM[p.tam].n)} · ${p.el.length} elemento${p.el.length === 1 ? "" : "s"} · ${new Date(p.act || Date.now()).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</span></div>
      <button class="btn ghost" data-abrir="${p.id}" style="min-height:42px">Abrir</button><button class="btn link" data-borrar="${p.id}">Eliminar</button></div>`).join("")}</div>`
      : `<p class="muted" style="margin:0">Aún no tiene croquis. Se recomiendan dos: el <b>interno</b> (evacuación del plantel) y el <b>externo</b> (riesgos alrededor de la escuela).</p>`}</section>
   <section class="card"><h3 style="margin:0">¿Qué debe llevar el croquis?</h3>
    <p class="help" style="margin:0">Edificios con su nombre o uso (aulas por grado, dirección, baños, bodega, cooperativa), áreas abiertas (cancha, patio, áreas verdes), rutas de evacuación con flechas, salidas de emergencia, punto de reunión, zonas de menor riesgo, extintores, botiquín, alarma, y los riesgos: tanque de gas, centro de carga, cables, árboles, bardas dañadas. Tlamatini agrega solos el encabezado, la leyenda, el norte, la escala, los datos de la escuela y los espacios para firmas.</p></section>`;
  document.getElementById("crqVolver").onclick = () => { S.sec = null; home() };
  document.getElementById("crqNuevo").onclick = crqNuevo;
  app.querySelectorAll("[data-abrir]").forEach(b => b.onclick = () => { CQ = crqTodos().find(x => x.id === b.dataset.abrir); CQS.hist = []; CQS.fut = []; CQS.sel = null; crqEditor() });
  app.querySelectorAll("[data-borrar]").forEach(b => b.onclick = () => { const p = crqTodos().find(x => x.id === b.dataset.borrar); if (!p || !confirm("¿Eliminar el croquis «" + (p.nombre || "") + "»? No se puede deshacer.")) return;
    store.set(CRQ_KEY, crqTodos().filter(x => x.id !== p.id)); crqView() });
  window.scrollTo(0, 0);
}

function crqNuevo() {
  app.innerHTML = `${crqTop("Nuevo croquis")}
   <section class="card"><h3 style="margin:0">¿Qué croquis va a hacer?</h3>
    <div class="crq-op">${Object.keys(CRQ_TIPOS).map((k, i) => `<label><input type="radio" name="crqTipo" value="${k}" ${i ? "" : "checked"}><span><b>${esc(CRQ_TIPOS[k].n)}</b><small>${esc(CRQ_TIPOS[k].d)}</small></span></label>`).join("")}</div>
    <h3 style="margin:6px 0 0">Tamaño de la hoja</h3>
    <div class="crq-op">${Object.keys(CRQ_TAM).map((k, i) => `<label><input type="radio" name="crqTam" value="${k}" ${i ? "" : "checked"}><span><b>${esc(CRQ_TAM[k].n)}</b><small>${esc(CRQ_TAM[k].d)}. Se puede cambiar después.</small></span></label>`).join("")}</div>
    <div class="crq-campo"><label for="crqNom">Nombre para identificarlo</label><input id="crqNom" placeholder="Ej. Croquis de evacuación 2026-2027"></div>
    <button class="btn primary" id="crqSig">Siguiente: ubicar la escuela</button></section>`;
  document.getElementById("crqVolver").onclick = crqView;
  document.getElementById("crqSig").onclick = () => {
    const tipo = app.querySelector("[name=crqTipo]:checked").value, tam = app.querySelector("[name=crqTam]:checked").value;
    CQ = { id: crqId(), tipo, tam, nombre: document.getElementById("crqNom").value.trim() || CRQ_TIPOS[tipo].n, lat: 30.8433, lng: -116.0636, zv: tipo === "externo" ? 16 : 18, fw: 0,
      capa: "sat", calles: tipo === "externo", el: [], elaboro: perfil.minombre || "", director: perfil.director || "", fecha: today(), creado: Date.now(), nuevo: true };
    CQS.hist = []; CQS.fut = []; CQS.sel = null; crqUbicar();
  };
}

/* ---------- Ubicar la escuela ---------- */
function crqCoords(t) {
  t = String(t || "").trim(); try { t = decodeURIComponent(t) } catch (e) {}
  const num = "(-?\\d{1,3}(?:\\.\\d+)?)";
  const pats = [new RegExp("!3d" + num + "!4d" + num), new RegExp("@" + num + "," + num + "(?:,(\\d+(?:\\.\\d+)?)z)?"), new RegExp("[?&](?:q|ll|query|center|destination)=" + num + ",\\s*" + num), new RegExp("^" + num + "\\s*,\\s*" + num + "$")];
  for (const re of pats) { const m = re.exec(t); if (m) { const a = +m[1], b = +m[2]; if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return { lat: a, lng: b } } }
  const dms = /(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:\.\d+)?)["″]?\s*([NS])[\s,]+(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:\.\d+)?)["″]?\s*([EOW])/i.exec(t);
  if (dms) { const g = (d, m, s, h) => (+d + m / 60 + s / 3600) * (/[SWO]/i.test(h) ? -1 : 1); return { lat: g(dms[1], dms[2], dms[3], dms[4]), lng: g(dms[5], dms[6], dms[7], dms[8]) } }
  return null;
}
let CRQ_MAP = null;
async function crqLeaflet() {
  if (!document.getElementById("crqLfCss")) { const l = document.createElement("link"); l.id = "crqLfCss"; l.rel = "stylesheet"; l.href = "lib/leaflet/leaflet.css"; document.head.appendChild(l) }
  if (!(window.L && window.L.map)) await loadScript("lib/leaflet/leaflet.js");
  return window.L;
}
async function crqUbicar() {
  const P = CQ;
  app.innerHTML = `${crqTop("Ubique su escuela", P.nombre)}
   <section class="card">
    <div class="crq-campo"><label for="crqBus">Buscar el lugar</label><div class="crq-fila"><input id="crqBus" style="flex:1;min-width:200px" placeholder="Ej. Camalú, San Quintín · o la calle de la escuela"><button class="btn ghost" id="crqBusB" style="min-height:42px">Buscar</button></div></div>
    <div class="crq-res" id="crqRes"></div>
    <div class="crq-campo"><label for="crqGm">¿La tiene en Google Maps? Pegue el enlace o las coordenadas</label><div class="crq-fila"><input id="crqGm" style="flex:1;min-width:200px" placeholder="Ej. 30.84412, -116.06321  o  https://www.google.com/maps/@30.844,-116.063,19z"><button class="btn ghost" id="crqGmB" style="min-height:42px">Ir</button></div>
     <span class="help" style="font-size:13px">En Google Maps, mantenga presionado el techo de la escuela: arriba aparecen los números (latitud, longitud). Cópielos y péguelos aquí.</span></div>
    <div class="crq-fila"><button class="btn ghost" id="crqGps" style="min-height:42px">📍 Estoy en la escuela: usar mi ubicación</button>
     <select id="crqCapa" style="font:inherit;padding:9px;border-radius:10px;border:1px solid var(--line)">${Object.keys(CRQ_CAPAS).map(k => `<option value="${k}" ${P.capa === k ? "selected" : ""}>${CRQ_CAPAS[k].n}</option>`).join("")}</select>
     <label style="display:flex;gap:6px;align-items:center;font-size:14px"><input type="checkbox" id="crqCalles" ${P.calles ? "checked" : ""}> Nombres de calles</label></div>
    <div class="crq-mapa" id="crqMapa"><div class="lf" id="crqLf"></div><div class="crq-marco" id="crqMarco"></div></div>
    <p class="help" style="margin:0">Mueva y acerque el mapa hasta que la escuela completa quede dentro del recuadro amarillo${P.tipo === "externo" ? ", con sus alrededores (unos 500 metros)" : ""}.</p>
    <div class="crq-fila"><button class="btn primary" id="crqListo">Listo: dibujar el croquis</button><span class="help" id="crqMsg"></span></div></section>`;
  document.getElementById("crqVolver").onclick = () => P.nuevo ? crqView() : crqEditor();
  const msg = t => { document.getElementById("crqMsg").innerHTML = t };
  let Lf; try { Lf = await crqLeaflet() } catch (e) { msg("<b>No se pudo cargar el mapa.</b> Revise su conexión."); return }
  if (CRQ_MAP) { try { CRQ_MAP.remove() } catch (e) {} CRQ_MAP = null }
  const map = CRQ_MAP = Lf.map("crqLf", { zoomControl: true, attributionControl: true, maxZoom: 21 }).setView([P.lat, P.lng], P.zv);
  let base = null, refs = [];
  let zNat = 19;
  const capas = () => { if (base) map.removeLayer(base); refs.forEach(r => map.removeLayer(r)); refs = [];
    const k = document.getElementById("crqCapa").value, c = CRQ_CAPAS[k === "blanco" ? "sat" : k];
    base = Lf.tileLayer(c.url, { maxNativeZoom: k === "calle" ? c.max : zNat, maxZoom: 21, attribution: c.atr.replace(/^.*?: /, "") }).addTo(map);
    if (k !== "calle" && document.getElementById("crqCalles").checked) refs = CRQ_REF.map(u => Lf.tileLayer(u, { maxNativeZoom: 19, maxZoom: 21 }).addTo(map)) };
  capas();
  // en cada lugar se revisa hasta dónde hay foto satelital; más cerca, se amplía la última foto disponible
  let tZ = null; const revisaZ = () => { clearTimeout(tZ); tZ = setTimeout(async () => { const c = map.getCenter(), z = await crqZMax(c.lat, c.lng); if (z !== zNat) { zNat = z; capas() } }, 500) };
  map.on("moveend", revisaZ); revisaZ();
  document.getElementById("crqCapa").onchange = capas; document.getElementById("crqCalles").onchange = capas;
  const marco = () => { const m = document.getElementById("crqMapa"), f = document.getElementById("crqMarco"); if (!m || !f) return;
    const asp = crqLayout(P.tam).asp, W = m.clientWidth * 0.9, H = (m.clientHeight - 40) * 0.9; let w = W, h = w / asp; if (h > H) { h = H; w = h * asp }
    f.style.width = w + "px"; f.style.height = h + "px"; return w };
  marco(); setTimeout(() => { map.invalidateSize(); marco() }, 150); window.addEventListener("resize", marco);
  const ir = (lat, lng, z) => map.setView([lat, lng], z || Math.max(map.getZoom(), P.tipo === "externo" ? 16 : 18));
  document.getElementById("crqGmB").onclick = () => { const v = document.getElementById("crqGm").value;
    if (/goo\.gl|maps\.app/i.test(v)) return msg("Ese es un enlace corto de Google. Ábralo, mantenga presionado el techo de la escuela y copie los números que aparecen arriba (latitud, longitud).");
    const c = crqCoords(v); if (!c) return msg("No encontré coordenadas. Pegue algo como <b>30.84412, -116.06321</b>."); ir(c.lat, c.lng, P.tipo === "externo" ? 17 : 19); msg("") };
  const buscar = async () => { const q = document.getElementById("crqBus").value.trim(), res = document.getElementById("crqRes"); if (!q) return;
    const c = crqCoords(q); if (c) { ir(c.lat, c.lng); return }
    res.innerHTML = '<span class="help">Buscando…</span>';
    try { const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=mx&accept-language=es&q=" + encodeURIComponent(q + (/baja california|b\.?c\.?$/i.test(q) ? "" : ", Baja California")));
      const l = await r.json(); if (!l.length) { res.innerHTML = '<span class="help">No se encontró. Pruebe con el nombre de la localidad (ej. «Camalú») y luego mueva el mapa.</span>'; return }
      res.innerHTML = l.map((x, i) => `<button class="btn ghost" data-i="${i}" style="min-height:40px;justify-content:flex-start">${esc(x.display_name)}</button>`).join("");
      res.querySelectorAll("[data-i]").forEach(b => b.onclick = () => { const x = l[+b.dataset.i]; ir(+x.lat, +x.lon, /house|building|school/.test(x.type || x.class) ? 18 : 16); res.innerHTML = "" }) }
    catch (e) { res.innerHTML = '<span class="help">No se pudo buscar (¿sin internet?). Mueva el mapa a mano o pegue las coordenadas.</span>' } };
  document.getElementById("crqBusB").onclick = buscar; document.getElementById("crqBus").onkeydown = e => { if (e.key === "Enter") buscar() };
  document.getElementById("crqGps").onclick = () => { if (!navigator.geolocation) return msg("Este dispositivo no permite usar la ubicación.");
    msg("Buscando su ubicación…"); navigator.geolocation.getCurrentPosition(p => { ir(p.coords.latitude, p.coords.longitude, 19); msg("Listo. Ajuste el mapa si hace falta.") }, () => msg("No se pudo obtener la ubicación. Revise el permiso de ubicación del navegador."), { enableHighAccuracy: true, timeout: 15000 }) };
  document.getElementById("crqListo").onclick = () => {
    const c = map.getCenter(), z = map.getZoom(), fw = Math.round(marco());
    if (P.fw && P.el.length) {   // se movió la vista: lo dibujado se queda en su lugar del terreno
      const [ox, oy] = crqProy(P.lat, P.lng, P.zv), [nx, ny] = crqProy(c.lat, c.lng, P.zv), s = Math.pow(2, z - P.zv);
      const mv = p => [(p[0] - (nx - ox)) * s, (p[1] - (ny - oy)) * s];
      P.el.forEach(e => { if (e.pts) e.pts = e.pts.map(mv); else { const q = mv([e.x, e.y]); e.x = q[0]; e.y = q[1] } if (e.lx) { e.lx *= s; e.ly *= s } });
      // los tamaños van en milésimas del ancho: se ajustan si cambió cuánto terreno cabe
      const r = (fw / s) / P.fw; P.el.forEach(e => { if (e.s) e.s = Math.max(8, Math.min(120, e.s / r)); if (e.ls) e.ls = Math.max(6, Math.min(60, e.ls / r)); if (e.w) e.w = Math.max(2, Math.min(20, e.w / r)) });
    }
    Object.assign(P, { lat: c.lat, lng: c.lng, zv: z, fw, capa: document.getElementById("crqCapa").value, calles: document.getElementById("crqCalles").checked });
    delete P.nuevo; CQS.img = null; window.removeEventListener("resize", marco); try { map.remove() } catch (e) {} CRQ_MAP = null;
    crqGuardar(P); crqEditor();
  };
  window.scrollTo(0, 0);
}

/* ---------- Editor ---------- */
const CRQ_HERR = [
  ["sel", "Mover / elegir", '<path d="M5 3l14 8-6 2-3 6z"/>'],
  ["edif", "Edificio", '<path d="M4 21V8l8-5 8 5v13z"/><path d="M9 21v-6h6v6"/>'],
  ["area", "Área (cancha, patio)", '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M12 5v14M3 12h18"/>'],
  ["ruta", "Ruta de evacuación", '<path d="M3 18c5 0 5-12 11-12h4"/><path d="M15 3l3 3-3 3"/>'],
  ["barda", "Barda / reja", '<path d="M3 20V9M9 20V7M15 20V9M21 20V7M3 12h18M3 17h18"/>'],
  ["sim", "Señal o símbolo", '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12h7M13 9l3 3-3 3"/>'],
  ["txt", "Texto", '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>']];
function crqPaso(t) { CQS.hist.push(JSON.stringify(CQ.el)); if (CQS.hist.length > 60) CQS.hist.shift(); CQS.fut = []; if (t !== false) crqGuardarLuego() }
async function crqEditor() {
  const P = CQ; crqCss(); S.view = "crqed"; S.sec = "croquis"; setBar("");
  if (!P.fw) return crqUbicar();
  app.innerHTML = `${crqTop(P.nombre, CRQ_TIPOS[P.tipo].n + " · " + CRQ_TAM[P.tam].n)}
   <div class="crq-ed"><div style="min-width:0;display:flex;flex-direction:column;gap:8px">
    <div class="crq-barra" id="crqHerr">${CRQ_HERR.map(h => `<button type="button" data-h="${h[0]}" aria-pressed="${CQS.tool === h[0]}"><svg viewBox="0 0 24 24">${h[2]}</svg>${h[1]}</button>`).join("")}</div>
    <div class="crq-fila" style="justify-content:space-between"><div class="crq-fila"><button class="btn ghost" id="crqDeshacer">↶ Deshacer</button><button class="btn ghost" id="crqRehacer">↷ Rehacer</button></div>
     <div class="crq-zoom"><button type="button" id="crqZm" aria-label="Alejar">−</button><span id="crqZv" style="min-width:48px;text-align:center">100 %</span><button type="button" id="crqZp" aria-label="Acercar">+</button></div></div>
    <div class="crq-lienzo" id="crqLienzo"><canvas id="crqCv"></canvas><div class="crq-cargando" id="crqCarga">Cargando el mapa…</div></div>
    <div class="help" id="crqAyuda" style="font-size:14px"></div></div>
    <div class="crq-lado"><section class="card" id="crqPanel"></section>
     <section class="card"><h3 style="margin:0">Hoja</h3>
      <div class="crq-campo"><label>Tamaño</label><div class="crq-fila">${Object.keys(CRQ_TAM).map(k => `<button type="button" class="btn ${P.tam === k ? "primary" : "ghost"}" data-tam="${k}">${CRQ_TAM[k].n}</button>`).join("")}</div></div>
      <div class="crq-campo"><label for="crqTit">Título</label><select id="crqTit">${Object.keys(CRQ_TIPOS).map(k => `<option value="${k}" ${P.tipo === k ? "selected" : ""}>${esc(CRQ_TIPOS[k].t)}</option>`).join("")}</select></div>
      <div class="crq-campo"><label for="crqEla">Elaboró (nombre)</label><input id="crqEla" value="${esc(P.elaboro || "")}" placeholder="Nombre de quien elaboró el croquis"></div>
      <div class="crq-campo"><label for="crqDir">Vo. Bo. Director(a)</label><input id="crqDir" value="${esc(P.director || "")}" placeholder="Ej. Mtra. Ana López Ruiz"></div>
      <div class="crq-campo"><label for="crqFe">Fecha de elaboración</label><input type="date" id="crqFe" value="${esc(P.fecha || today())}"></div>
      <div class="crq-fila"><button class="btn ghost" id="crqUbi">Cambiar ubicación o mapa</button></div>
      <div class="crq-fila"><button class="btn primary" id="crqPdf">Descargar PDF</button><button class="btn ghost" id="crqImp">Imprimir</button></div>
      <p class="help" style="margin:0;font-size:13px">Se guarda solo en este dispositivo mientras trabaja.</p></section></div></div>`;
  document.getElementById("crqVolver").onclick = () => { crqGuardar(P); crqView() };
  const cv = document.getElementById("crqCv"), caja = document.getElementById("crqLienzo"), ctx = cv.getContext("2d");
  let img = null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const tam = () => { const w = Math.max(280, (caja.clientWidth - 2) * CQS.zoom), h = w * crqFh(P) / P.fw; cv.style.width = w + "px"; cv.style.height = h + "px"; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); document.getElementById("crqZv").textContent = Math.round(CQS.zoom * 100) + " %" };
  const pinta = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); crqPinta(ctx, P, cv.width, cv.height, { img, editor: true, dpr }) };
  const redibuja = () => { tam(); pinta() };
  CQS.pinta = pinta;
  redibuja();
  crqFondo(P).then(c => { img = c; document.getElementById("crqCarga").hidden = true; pinta() })
    .catch(e => { const d = document.getElementById("crqCarga"); if (d) d.innerHTML = `<div style="max-width:420px;text-align:center;padding:12px">${esc(e.message)}<br><button class="btn ghost" id="crqSinMapa" style="margin-top:8px">Usar fondo blanco</button></div>`;
      const b = document.getElementById("crqSinMapa"); if (b) b.onclick = () => { P.capa = "blanco"; CQS.img = null; crqGuardar(P); crqEditor() } });
  window.onresize = () => { if (S.view === "crqed") redibuja() };

  // coordenadas: del puntero a pixeles de referencia
  const aRef = ev => { const r = cv.getBoundingClientRect(), k = r.width / P.fw; return [(ev.clientX - r.left - r.width / 2) / k, (ev.clientY - r.top - r.height / 2) / k] };
  const aPx = (x, y) => { const r = cv.getBoundingClientRect(), k = r.width / P.fw; return [r.width / 2 + x * k, r.height / 2 + y * k] };
  const tolRef = () => 12 / (cv.getBoundingClientRect().width / P.fw);
  const dSeg = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy) };
  const dentro = (p, pts) => { let r = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) r = !r } return r };
  const golpe = p => { const tol = tolRef(), W = cv.width, H = cv.height, r = cv.getBoundingClientRect(), f = W / r.width;
    const pc = aPx(p[0], p[1]).map(v => v * f);
    const l = P.el.slice().reverse();
    for (const e of l) if (e.t === "sim" || e.t === "txt") { const b = crqCaja(e, W, H, P); if (pc[0] >= b[0] && pc[0] <= b[2] && pc[1] >= b[1] && pc[1] <= b[3]) return e }
    for (const e of l) if ((e.t === "ruta" || e.t === "barda") && e.pts.some((q, i) => i && dSeg(p, e.pts[i - 1], q) < tol)) return e;
    for (const e of l) if ((e.t === "edif" || e.t === "area") && e.pts.length > 2 && dentro(p, e.pts)) return e;
    return null };
  const vertice = (e, p) => { if (!e || !e.pts) return -1; const tol = tolRef(); return e.pts.findIndex(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < tol) };

  const terminar = () => { const t = CQS.temp; if (!t) return; const min = t.t === "edif" || t.t === "area" ? 3 : 2;
    if (t.pts.length >= min) { crqPaso(); const e = { id: crqUid(), t: t.t, pts: t.pts };
      if (t.t === "edif") { const n = P.el.filter(x => x.t === "edif").length; e.nom = "Edificio " + String.fromCharCode(65 + (n % 26)); e.sub = "" }
      if (t.t === "area") { e.k = CQS.areaK || "cancha"; e.nom = CRQ_AREAS[e.k].n.split(" /")[0] }
      if (t.t === "barda") { e.k = "barda"; e.cerr = t.pts.length > 2 }
      if (t.t === "ruta") e.w = 6;
      P.el.push(e); CQS.sel = e.id; crqGuardarLuego() }
    CQS.temp = null; CQS.tool = "sel"; botones(); panel(); pinta() };

  cv.onpointerdown = ev => { ev.preventDefault(); const p = aRef(ev); const T = CQS.tool;
    if (T === "sel") {
      const s = P.el.find(x => x.id === CQS.sel), vi = vertice(s, p);
      if (vi >= 0) { crqPaso(false); CQS.drag = { modo: "v", e: s, i: vi } }
      else { const e = golpe(p); CQS.sel = e ? e.id : null; panel();
        if (e) { crqPaso(false); CQS.drag = { modo: "m", e, p0: p, orig: JSON.parse(JSON.stringify(e)) } }
        else CQS.drag = { modo: "pan", x: ev.clientX, y: ev.clientY, sl: caja.scrollLeft, st: caja.scrollTop } }
      cv.setPointerCapture(ev.pointerId); pinta(); return }
    if (T === "sim" || T === "txt") { crqPaso(); const e = T === "sim" ? { id: crqUid(), t: "sim", k: CQS.sim, x: p[0], y: p[1], s: 40, r: 0, nom: "" } : { id: crqUid(), t: "txt", x: p[0], y: p[1], txt: "Texto", s: 16, col: "negro" };
      P.el.push(e); CQS.sel = e.id; if (T === "txt") { CQS.tool = "sel"; botones() } panel(); pinta(); if (T === "txt") { const i = document.getElementById("crqPTxt"); if (i) { i.focus(); i.select() } } return }
    // trazos: edificio, área, ruta, barda
    if (!CQS.temp) CQS.temp = { t: T, pts: [] };
    const t = CQS.temp;
    if ((T === "edif" || T === "area" || T === "barda") && t.pts.length > 2) { const [a, b] = aPx(...t.pts[0]), [c2, d] = aPx(...p); if (Math.hypot(a - c2, b - d) < 14) { if (T === "barda") t.cerrar = true; return terminar() } }
    const ult = t.pts[t.pts.length - 1];
    if (ult) { const [a, b] = aPx(...ult), [c2, d] = aPx(...p); if (Math.hypot(a - c2, b - d) < 6) return terminar() }   // doble toque en el mismo punto
    t.pts.push(p); panel(); pinta() };
  cv.onpointermove = ev => { const p = aRef(ev), d = CQS.drag;
    if (CQS.temp) { CQS.temp.cur = p; pinta(); return }
    if (!d) return;
    if (d.modo === "pan") { caja.scrollLeft = d.sl - (ev.clientX - d.x); caja.scrollTop = d.st - (ev.clientY - d.y); return }
    if (d.modo === "v") { d.e.pts[d.i] = p; d.mov = 1 }
    else { const dx = p[0] - d.p0[0], dy = p[1] - d.p0[1]; if (d.e.pts) d.e.pts = d.orig.pts.map(q => [q[0] + dx, q[1] + dy]); else { d.e.x = d.orig.x + dx; d.e.y = d.orig.y + dy } if (Math.abs(dx) + Math.abs(dy) > 0.5) d.mov = 1 }
    pinta() };
  cv.onpointerup = () => { const d = CQS.drag; CQS.drag = null; if (d && d.modo !== "pan") { if (d.mov) crqGuardarLuego(); else CQS.hist.pop() } };
  cv.ondblclick = () => { if (CQS.temp) terminar() };

  const botones = () => { app.querySelectorAll("[data-h]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.h === CQS.tool))); caja.classList.toggle("sel", CQS.tool === "sel");
    const ay = { sel: "Toque un elemento para elegirlo, moverlo o cambiarle el nombre. Arrastre los cuadritos para ajustar las esquinas. Arrastre el fondo para desplazarse.",
      edif: "Toque cada esquina del edificio sobre el mapa. Para cerrarlo, toque la primera esquina o pulse «Terminar».",
      area: "Toque cada esquina del área. Para cerrarla, toque la primera esquina o pulse «Terminar».",
      ruta: "Toque desde el salón hasta la salida o el punto de reunión. Las flechas apuntan hacia donde termina. Pulse «Terminar» al llegar.",
      barda: "Toque cada punto de la barda o reja. Toque el primer punto para cerrarla, o «Terminar» para dejarla abierta.",
      sim: "Elija la señal en el panel y toque en el mapa donde va. Puede poner varias.", txt: "Toque donde quiere poner el texto." }[CQS.tool];
    document.getElementById("crqAyuda").textContent = ay };
  app.querySelectorAll("[data-h]").forEach(b => b.onclick = () => { if (CQS.temp) terminar(); CQS.tool = b.dataset.h; if (CQS.tool !== "sel") CQS.sel = null; botones(); panel(); pinta() });

  const campo = (id, et, html) => `<div class="crq-campo"><label for="${id}">${et}</label>${html}</div>`;
  const rango = (id, et, v, a, b, st = 1) => campo(id, et + ` <span class="muted" id="${id}v">${v}</span>`, `<input type="range" id="${id}" min="${a}" max="${b}" step="${st}" value="${v}">`);
  function panel() {
    const pn = document.getElementById("crqPanel"), e = P.el.find(x => x.id === CQS.sel), t = CQS.temp;
    if (t) { pn.innerHTML = `<h3 style="margin:0">Dibujando: ${esc({ edif: "edificio", area: "área", ruta: "ruta de evacuación", barda: "barda o reja" }[t.t])}</h3><p class="help" style="margin:0">${t.pts.length} punto${t.pts.length === 1 ? "" : "s"}.</p>
      <div class="crq-fila"><button class="btn primary" id="crqFin">Terminar</button><button class="btn ghost" id="crqQuita" ${t.pts.length ? "" : "disabled"}>Quitar el último punto</button><button class="btn link" id="crqCanc">Cancelar</button></div>`;
      document.getElementById("crqFin").onclick = terminar; document.getElementById("crqQuita").onclick = () => { t.pts.pop(); panel(); pinta() };
      document.getElementById("crqCanc").onclick = () => { CQS.temp = null; panel(); pinta() }; return }
    if (CQS.tool === "sim" && !e) { pn.innerHTML = `<h3 style="margin:0">Señales y símbolos</h3><p class="help" style="margin:0">Colores y formas según la NOM-003-SEGOB-2011. Elija una y toque el mapa.</p><div class="crq-pal">${CRQ_GRUPOS.map(([g, n]) => `<h4>${esc(n)}</h4><div class="g">${CRQ_SIMS.filter(s => s.g === g).map(s => `<button type="button" data-sim="${s.k}" aria-pressed="${CQS.sim === s.k}"><img src="${crqIcono(s.k, 60)}" alt="">${esc(s.n)}</button>`).join("")}</div>`).join("")}</div>`;
      pn.querySelectorAll("[data-sim]").forEach(b => b.onclick = () => { CQS.sim = b.dataset.sim; panel() }); return }
    if (CQS.tool === "area" && !e) { pn.innerHTML = `<h3 style="margin:0">¿Qué área va a dibujar?</h3>${campo("crqAk", "Tipo de área", `<select id="crqAk">${Object.keys(CRQ_AREAS).map(k => `<option value="${k}" ${(CQS.areaK || "cancha") === k ? "selected" : ""}>${esc(CRQ_AREAS[k].n)}</option>`).join("")}</select>`)}<p class="help" style="margin:0">Luego toque cada esquina en el mapa.</p>`;
      document.getElementById("crqAk").onchange = ev => CQS.areaK = ev.target.value; return }
    if (!e) { const n = P.el.length; pn.innerHTML = `<h3 style="margin:0">¿Cómo empezar?</h3><ol class="help" style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px">
      <li>Dibuje cada <b>edificio</b> y póngale nombre (aulas, dirección, baños).</li><li>Marque las <b>áreas</b>: cancha, patio, áreas verdes.</li><li>Trace las <b>rutas de evacuación</b> hacia el punto de reunión.</li>
      <li>Coloque las <b>señales</b>: salidas, punto de reunión, zonas de menor riesgo, extintores, botiquín y riesgos.</li><li>Descargue el <b>PDF</b>.</li></ol>
      <p class="help" style="margin:0">${n ? n + " elemento" + (n === 1 ? "" : "s") + " en el croquis." : ""}</p>`; return }
    let h = "";
    if (e.t === "edif") h = campo("crqPNom", "Nombre del edificio", `<input id="crqPNom" value="${esc(e.nom || "")}" placeholder="Ej. Edificio A">`) + campo("crqPSub", "Uso (segunda línea)", `<input id="crqPSub" value="${esc(e.sub || "")}" placeholder="Ej. 1.º y 2.º grado · Dirección · Baños">`) + rango("crqPLs", "Tamaño del nombre", e.ls || 15, 6, 40);
    if (e.t === "area") h = campo("crqPK", "Tipo de área", `<select id="crqPK">${Object.keys(CRQ_AREAS).map(k => `<option value="${k}" ${e.k === k ? "selected" : ""}>${esc(CRQ_AREAS[k].n)}</option>`).join("")}</select>`) + campo("crqPNom", "Nombre", `<input id="crqPNom" value="${esc(e.nom || "")}">`) + rango("crqPLs", "Tamaño del nombre", e.ls || 12, 6, 40);
    if (e.t === "ruta") h = rango("crqPW", "Grosor de la línea", e.w || 6, 2, 16) + `<p class="help" style="margin:0">Las flechas apuntan hacia el último punto. Para invertirla:</p><button class="btn ghost" id="crqInv">⇄ Invertir el sentido</button>`;
    if (e.t === "barda") h = campo("crqPK", "Tipo", `<select id="crqPK">${Object.keys(CRQ_BARDAS).map(k => `<option value="${k}" ${e.k === k ? "selected" : ""}>${esc(CRQ_BARDAS[k].n)}</option>`).join("")}</select>`) + `<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="crqPCerr" ${e.cerr ? "checked" : ""}> Cerrada (rodea todo)</label>`;
    if (e.t === "sim") { const d = CRQ_SIM[e.k]; h = `<div class="crq-fila"><img src="${crqIcono(e.k, 60)}" width="44" height="44" alt=""><b>${esc(d.n)}</b></div>` + rango("crqPS", "Tamaño", e.s || 40, 12, 110) +
      (d.rot ? rango("crqPR", "Dirección de la flecha (grados)", e.r || 0, 0, 345, 15) : "") + (d.flip ? `<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="crqPFx" ${e.fx ? "checked" : ""}> Voltear (hacia el otro lado)</label>` : "") +
      campo("crqPNom", "Etiqueta debajo (opcional)", `<input id="crqPNom" value="${esc(e.nom || "")}" placeholder="Ej. Extintor PQS 6 kg · Punto de reunión 1">`) +
      campo("crqPCam", "Cambiar por otra señal", `<select id="crqPCam">${CRQ_SIMS.map(s => `<option value="${s.k}" ${s.k === e.k ? "selected" : ""}>${esc(s.n)}</option>`).join("")}</select>`) }
    if (e.t === "txt") h = campo("crqPTxt", "Texto", `<textarea id="crqPTxt" rows="2">${esc(e.txt || "")}</textarea>`) + rango("crqPS", "Tamaño", e.s || 16, 6, 60) + campo("crqPCol", "Color", `<select id="crqPCol">${[["negro", "Negro"], ["rojo", "Rojo"], ["azul", "Azul"], ["blanco", "Blanco"]].map(([k, n]) => `<option value="${k}" ${(e.col || "negro") === k ? "selected" : ""}>${n}</option>`).join("")}</select>`);
    pn.innerHTML = `<h3 style="margin:0">${esc({ edif: "Edificio", area: "Área", ruta: "Ruta de evacuación", barda: "Barda o reja", sim: "Señal", txt: "Texto" }[e.t])}</h3>${h}
      <div class="crq-fila"><button class="btn ghost" id="crqDup">Duplicar</button><button class="btn ghost" id="crqDel" style="color:#B00020">Eliminar</button></div>`;
    const en = (id, f, ev = "input") => { const x = document.getElementById(id); if (x) x.addEventListener(ev, () => { f(x); crqGuardarLuego(); pinta() }) };
    let unaVez = false; const marca = () => { if (!unaVez) { crqPaso(false); unaVez = true } };
    en("crqPNom", x => { marca(); e.nom = x.value }); en("crqPSub", x => { marca(); e.sub = x.value }); en("crqPTxt", x => { marca(); e.txt = x.value });
    [["crqPLs", "ls"], ["crqPW", "w"], ["crqPS", "s"], ["crqPR", "r"]].forEach(([id, k]) => en(id, x => { marca(); e[k] = +x.value; const v = document.getElementById(id + "v"); if (v) v.textContent = x.value }));
    en("crqPK", x => { marca(); const ant = e.t === "area" ? CRQ_AREAS[e.k].n.split(" /")[0] : ""; e.k = x.value; if (e.t === "area" && (!e.nom || e.nom === ant)) { e.nom = CRQ_AREAS[e.k].n.split(" /")[0]; const n = document.getElementById("crqPNom"); if (n) n.value = e.nom } }, "change");
    en("crqPCerr", x => { marca(); e.cerr = x.checked }, "change"); en("crqPFx", x => { marca(); e.fx = x.checked }, "change");
    en("crqPCol", x => { marca(); e.col = x.value }, "change");
    en("crqPCam", x => { marca(); e.k = x.value; panel() }, "change");
    const inv = document.getElementById("crqInv"); if (inv) inv.onclick = () => { crqPaso(); e.pts.reverse(); pinta() };
    document.getElementById("crqDel").onclick = () => { crqPaso(); P.el = P.el.filter(x => x !== e); CQS.sel = null; panel(); pinta() };
    document.getElementById("crqDup").onclick = () => { crqPaso(); const d = JSON.parse(JSON.stringify(e)); d.id = crqUid(); const o = 30 / (cv.getBoundingClientRect().width / P.fw);
      if (d.pts) d.pts = d.pts.map(q => [q[0] + o, q[1] + o]); else { d.x += o; d.y += o } if (d.t === "edif") d.nom = (d.nom || "") + " (copia)"; P.el.push(d); CQS.sel = d.id; panel(); pinta() };
  }
  CQS.panel = panel;
  document.getElementById("crqDeshacer").onclick = () => { if (!CQS.hist.length) return; CQS.fut.push(JSON.stringify(P.el)); P.el = JSON.parse(CQS.hist.pop()); CQS.sel = null; crqGuardarLuego(); panel(); pinta() };
  document.getElementById("crqRehacer").onclick = () => { if (!CQS.fut.length) return; CQS.hist.push(JSON.stringify(P.el)); P.el = JSON.parse(CQS.fut.pop()); CQS.sel = null; crqGuardarLuego(); panel(); pinta() };
  document.getElementById("crqZp").onclick = () => { CQS.zoom = Math.min(4, CQS.zoom * 1.4); redibuja() };
  document.getElementById("crqZm").onclick = () => { CQS.zoom = Math.max(1, CQS.zoom / 1.4); redibuja() };
  app.querySelectorAll("[data-tam]").forEach(b => b.onclick = () => { if (P.tam === b.dataset.tam) return; crqCambiaTam(P, b.dataset.tam); CQS.img = null; crqGuardar(P); crqEditor() });
  document.getElementById("crqTit").onchange = ev => { P.tipo = ev.target.value; crqGuardarLuego() };
  document.getElementById("crqEla").oninput = ev => { P.elaboro = ev.target.value; crqGuardarLuego() };
  document.getElementById("crqDir").oninput = ev => { P.director = ev.target.value; crqGuardarLuego() };
  document.getElementById("crqFe").onchange = ev => { P.fecha = ev.target.value || today(); crqGuardarLuego() };
  document.getElementById("crqUbi").onclick = () => { crqGuardar(P); crqUbicar() };
  const pdf = async modo => { const b = document.getElementById(modo === "print" ? "crqImp" : "crqPdf"), t = b.textContent; b.disabled = true; b.textContent = "Preparando…";
    try { const blob = await crqPDF(P); crqGuardar(P); PMODE = modo; await entregarPDF(blob, crqArchivo(P)) }
    catch (e) { pToast("<b>No se pudo generar el croquis.</b> " + esc(e.message || e)) }
    finally { b.disabled = false; b.textContent = t } };
  document.getElementById("crqPdf").onclick = () => pdf("save");
  document.getElementById("crqImp").onclick = () => pdf("print");
  document.onkeydown = ev => { if (S.view !== "crqed" || /input|textarea|select/i.test((ev.target.tagName || ""))) return;
    if (ev.key === "Escape") { if (CQS.temp) { CQS.temp = null } CQS.sel = null; panel(); pinta() }
    if (ev.key === "Enter" && CQS.temp) terminar();
    if ((ev.key === "Delete" || ev.key === "Backspace") && CQS.sel) { crqPaso(); P.el = P.el.filter(x => x.id !== CQS.sel); CQS.sel = null; panel(); pinta(); ev.preventDefault() }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") { document.getElementById(ev.shiftKey ? "crqRehacer" : "crqDeshacer").click(); ev.preventDefault() } };
  botones(); panel(); window.scrollTo(0, 0);
}
// Cambiar de carta a doble carta (o al revés) sin recortar lo dibujado: la hoja más ancha muestra más terreno a los lados
function crqCambiaTam(P, tam) {
  const fhAnt = crqFh(P), fwAnt = P.fw; P.tam = tam; const asp = crqLayout(tam).asp;
  if (asp > fwAnt / fhAnt) P.fw = Math.round(fhAnt * asp);
  const r = P.fw / fwAnt; if (r !== 1) P.el.forEach(e => { if (e.s) e.s = e.s / r; if (e.ls) e.ls = e.ls / r; if (e.w) e.w = e.w / r });
}
const crqArchivo = P => (P.tipo === "externo" ? "Croquis de riesgos externos" : "Croquis de evacuación") + (perfil.escuela ? " - " + String(perfil.escuela).replace(/[\\/:*?"<>|]+/g, " ").trim() : "") + (P.tam === "doble" ? " (doble carta)" : "") + ".pdf";

/* ---------- PDF ---------- */
async function crqPDF(P) {
  await loadScript("lib/pdf-lib.min.js");
  const { PDFDocument, StandardFonts, rgb } = window.PDFLib, Lo = crqLayout(P.tam), T = Lo.T, E = crqEscuela();
  const doc = await PDFDocument.create(); doc.setTitle(crqArchivo(P).replace(/\.pdf$/, "")); const pg = doc.addPage([T.w, T.h]);
  const F = await doc.embedFont(StandardFonts.Helvetica), FB = await doc.embedFont(StandardFonts.HelveticaBold), FI = await doc.embedFont(StandardFonts.HelveticaOblique);
  const z = T.w / 792;   // doble carta: todo un poco más grande
  const AZ = rgb(0.12, 0.165, 0.27), GR = rgb(0.35, 0.35, 0.35), LN = rgb(0.7, 0.73, 0.78), NEG = rgb(0.07, 0.07, 0.07);
  const ok = (f, s) => { let r = ""; for (const ch of String(s || "")) { try { f.encodeText(ch); r += ch } catch (e) { r += ch === "″" || ch === "“" || ch === "”" ? '"' : "" } } return r };
  const Y = (y, h = 0) => T.h - y - h;
  const txt = (s, x, y, size, f = F, col = NEG, o = {}) => { s = ok(f, s); let w = f.widthOfTextAtSize(s, size); if (o.max && w > o.max) { size = size * o.max / w; w = o.max }
    const xx = o.al === "c" ? x - w / 2 : o.al === "r" ? x - w : x; pg.drawText(s, { x: xx, y: Y(y) - size * 0.78, size, font: f, color: col }); return size };
  const parte = (s, f, size, max) => { const pal = ok(f, s).split(/\s+/), l = []; let a = ""; pal.forEach(p => { const t = a ? a + " " + p : p; if (f.widthOfTextAtSize(t, size) > max && a) { l.push(a); a = p } else a = t }); if (a) l.push(a); return l };
  const caja = (x, y, w, h, t) => { pg.drawRectangle({ x, y: Y(y, h), width: w, height: h, borderColor: LN, borderWidth: 0.8, color: rgb(1, 1, 1) });
    if (t) { pg.drawRectangle({ x, y: Y(y, 13 * z), width: w, height: 13 * z, color: rgb(0.93, 0.95, 0.97) }); txt(t, x + w / 2, y + 3 * z, 7.2 * z, FB, AZ, { al: "c" }) } };

  // Encabezado
  const m = T.m, encH = T.enc, [inst, esL, zoL] = await Promise.all([embedInst(doc), embedLogo(doc), embedZonaLogo(doc)]);
  const lh = encH - 10 * z;
  let izq = m, der = T.w - m;
  if (inst) { const d = inst.scaleToFit(lh * 1.5, lh); pg.drawImage(inst, { x: m, y: Y(m + (encH - d.height) / 2, d.height), width: d.width, height: d.height }); izq = m + d.width + 8 }
  for (const im of [zoL, esL]) if (im) { const d = im.scaleToFit(lh, lh); der -= d.width; pg.drawImage(im, { x: der, y: Y(m + (encH - d.height) / 2, d.height), width: d.width, height: d.height }); der -= 8 }
  const cx = (izq + der) / 2, ancho = der - izq;
  txt(membreteSub(), cx, m + 4 * z, 7.5 * z, F, GR, { al: "c", max: ancho });
  txt(E.escuela ? `ESCUELA PRIMARIA «${String(E.escuela).toUpperCase()}» · C.C.T. ${E.cct}` : "ESCUELA PRIMARIA", cx, m + 15 * z, 9.5 * z, FB, AZ, { al: "c", max: ancho });
  txt(CRQ_TIPOS[P.tipo].t, cx, m + 30 * z, 13.5 * z, FB, NEG, { al: "c", max: ancho });
  txt("Programa de Protección Integral Escolar · Atlas de riesgo · Ciclo escolar " + (typeof cicloActual === "function" ? cicloActual() : ""), cx, m + 48 * z, 7.5 * z, FI, GR, { al: "c", max: ancho });
  pg.drawLine({ start: { x: m, y: Y(m + encH) }, end: { x: T.w - m, y: Y(m + encH) }, thickness: 1.6, color: AZ });

  // Mapa con lo dibujado
  const fondo = await crqFondo(P), W = fondo.width, H = Math.round(W * Lo.mapH / Lo.mapW);
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; crqPinta(cv.getContext("2d"), P, W, H, { img: fondo });
  const jpg = await new Promise((ok2, no) => cv.toBlob(b => b ? ok2(b) : no(new Error("No se pudo preparar la imagen del mapa.")), "image/jpeg", 0.9));
  const imMapa = await doc.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
  pg.drawImage(imMapa, { x: Lo.mapX, y: Y(Lo.mapY, Lo.mapH), width: Lo.mapW, height: Lo.mapH });
  pg.drawRectangle({ x: Lo.mapX, y: Y(Lo.mapY, Lo.mapH), width: Lo.mapW, height: Lo.mapH, borderColor: AZ, borderWidth: 1.2 });
  const atr = (CRQ_CAPAS[P.capa] || {}).atr || "";
  txt([atr, "Elaborado con Tlamatini"].filter(Boolean).join(" · "), Lo.mapX + 2, Lo.mapY + Lo.mapH + 2.5 * z, 5.6 * z, F, GR);

  // Columna derecha: orientación y escala, leyenda, datos y firmas
  const X0 = Lo.colX, CW = Lo.colW; let y = Lo.mapY;
  const altoOr = 64 * z; caja(X0, y, CW, altoOr, "ORIENTACIÓN Y ESCALA");
  { const nx = X0 + 26 * z, ny = y + 13 * z + (altoOr - 13 * z) / 2 + 3 * z, r = 17 * z;   // norte
    pg.drawCircle({ x: nx, y: Y(ny), size: r, borderColor: AZ, borderWidth: 0.8 });
    const P2 = (a, b) => `M ${a} ${b}`; pg.drawSvgPath(`M 0 ${-r * 0.95} L ${r * 0.38} ${r * 0.35} L 0 ${r * 0.12} Z`, { x: nx, y: Y(ny), color: AZ });
    pg.drawSvgPath(`M 0 ${-r * 0.95} L ${-r * 0.38} ${r * 0.35} L 0 ${r * 0.12} Z`, { x: nx, y: Y(ny), color: rgb(1, 1, 1), borderColor: AZ, borderWidth: 0.6 });
    txt("N", nx, ny - r - 9 * z, 8 * z, FB, AZ, { al: "c" }); void P2;
    // escala gráfica
    const mpp = crqMpp(P.lat, P.zv) * P.fw / Lo.mapW, maxL = CW - 70 * z, nice = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000];
    let mts = nice[0]; for (const v of nice) if (v / mpp <= maxL) mts = v; const bl = mts / mpp, bx = X0 + 56 * z, by = ny - 2 * z;
    for (let i = 0; i < 4; i++) pg.drawRectangle({ x: bx + i * bl / 4, y: Y(by, 5 * z), width: bl / 4, height: 5 * z, color: i % 2 ? rgb(1, 1, 1) : NEG, borderColor: NEG, borderWidth: 0.6 });
    txt("0", bx, by + 7 * z, 6.5 * z, F, NEG, { al: "c" }); txt(mts >= 1000 ? mts / 1000 + " km" : mts + " m", bx + bl, by + 7 * z, 6.5 * z, F, NEG, { al: "c" });
    txt("Escala gráfica aproximada", bx + bl / 2, by - 10 * z, 6 * z, FI, GR, { al: "c" }); }
  y += altoOr + 6 * z;

  // Firmas y datos (abajo), leyenda (lo que queda en medio)
  const altoFir = 74 * z, yFir = Lo.mapY + Lo.mapH - altoFir;
  const filasDatos = [["C.C.T.", [E.cct, E.turno && "Turno " + E.turno].filter(Boolean).join(" · ")], ["Domicilio", E.domicilio], ["Localidad", [E.localidad, E.municipio].filter(Boolean).join(", ") + (E.localidad || E.municipio ? ", B.C." : "")],
    ["Coordenadas", P.lat.toFixed(5) + ", " + P.lng.toFixed(5)], ["Elaboración", typeof fmtDate === "function" ? fmtDate(P.fecha || today(), "larga") : P.fecha]].filter(r => r[1]);
  const fsD = 6.6 * z, lD = []; filasDatos.forEach(([k, v]) => parte(k + ": " + v, F, fsD, CW - 10 * z).forEach((l, i) => lD.push([l, i === 0 ? k.length + 1 : 0])));
  const altoDat = 13 * z + 6 * z + lD.length * fsD * 1.3, yDat = yFir - 6 * z - altoDat;
  caja(X0, yDat, CW, altoDat, "DATOS DEL INMUEBLE");
  lD.forEach(([l, kb], i) => { const yy = yDat + 17 * z + i * fsD * 1.3; if (kb) { const k = l.slice(0, kb), r = l.slice(kb); txt(k, X0 + 5 * z, yy, fsD, FB); txt(r, X0 + 5 * z + FB.widthOfTextAtSize(ok(FB, k), fsD), yy, fsD) } else txt(l, X0 + 5 * z, yy, fsD) });
  caja(X0, yFir, CW, altoFir, "");
  [[P.elaboro, "ELABORÓ"], [P.director || E.director, "VO. BO. DIRECTOR(A)"]].forEach(([n, et], i) => { const yy = yFir + 26 * z + i * 31 * z;
    pg.drawLine({ start: { x: X0 + 14 * z, y: Y(yy) }, end: { x: X0 + CW - 14 * z, y: Y(yy) }, thickness: 0.6, color: NEG });
    txt(n || "", X0 + CW / 2, yy + 2 * z, 6.8 * z, FB, NEG, { al: "c", max: CW - 16 * z }); txt(et, X0 + CW / 2, yy + 10 * z, 5.8 * z, F, GR, { al: "c" }) });

  // Leyenda: solo lo que se usó en el croquis
  const usados = new Set(P.el.filter(e => e.t === "sim").map(e => e.k)), filas = [];
  if (P.el.some(e => e.t === "edif")) filas.push({ t: "edif", n: "Edificio (nombre o uso en el croquis)" });
  [...new Set(P.el.filter(e => e.t === "area").map(e => e.k))].forEach(k => filas.push({ t: "area", k, n: CRQ_AREAS[k].n }));
  if (P.el.some(e => e.t === "ruta")) filas.push({ t: "ruta", n: "Ruta de evacuación" });
  [...new Set(P.el.filter(e => e.t === "barda").map(e => e.k))].forEach(k => filas.push({ t: "barda", k, n: CRQ_BARDAS[k].n }));
  CRQ_GRUPOS.forEach(([g, gn]) => { const l = CRQ_SIMS.filter(s => s.g === g && usados.has(s.k)); if (l.length) { filas.push({ t: "h", n: gn }); l.forEach(s => filas.push({ t: "sim", k: s.k, n: s.n })) } });
  const altoLey = yDat - 6 * z - y; caja(X0, y, CW, altoLey, "LEYENDA");
  if (!filas.length) txt("Aún no hay elementos en el croquis.", X0 + CW / 2, y + 22 * z, 6.5 * z, FI, GR, { al: "c" });
  else {
    let rh = 14 * z; const disp = altoLey - 19 * z; let cols = 1;
    while (filas.length * rh > disp && rh > 8.5 * z) rh -= 0.5 * z;
    if (filas.length * rh > disp) cols = 2;
    const porCol = Math.ceil(filas.length / cols), cw = (CW - 8 * z) / cols, ic = rh - 2.5 * z, fs = Math.min(6.8 * z, rh * 0.5);
    for (let i = 0; i < filas.length; i++) { const f = filas[i], col = Math.floor(i / porCol), fx = X0 + 4 * z + col * cw, fy = y + 16 * z + (i % porCol) * rh, mid = fy + rh / 2;
      if (f.t === "h") { txt(f.n.toUpperCase(), fx + 1, mid - fs * 0.45, fs * 0.92, FB, AZ, { max: cw - 4 }); continue }
      const ix = fx + 1, iw = ic * 1.25;
      if (f.t === "sim") { const im = await doc.embedPng(crqIcono(f.k, 96)); pg.drawImage(im, { x: ix + (iw - ic) / 2, y: Y(mid - ic / 2, ic), width: ic, height: ic }) }
      else if (f.t === "edif") pg.drawRectangle({ x: ix, y: Y(mid - ic * 0.35, ic * 0.7), width: iw, height: ic * 0.7, color: rgb(1, 1, 1), borderColor: AZ, borderWidth: 1 });
      else if (f.t === "area") { const h = CRQ_AREAS[f.k].c, r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
        pg.drawRectangle({ x: ix, y: Y(mid - ic * 0.35, ic * 0.7), width: iw, height: ic * 0.7, color: rgb(r, g, b), borderColor: GR, borderWidth: 0.6, borderDashArray: [2, 1.5] }) }
      else if (f.t === "ruta") { pg.drawLine({ start: { x: ix, y: Y(mid) }, end: { x: ix + iw - 3, y: Y(mid) }, thickness: 2.4 * z, color: rgb(0, 0.59, 0.37) });
        pg.drawSvgPath(`M 0 ${-3 * z} L ${5 * z} 0 L 0 ${3 * z} Z`, { x: ix + iw - 5 * z, y: Y(mid), color: rgb(0, 0.59, 0.37) }) }
      else if (f.t === "barda") pg.drawLine({ start: { x: ix, y: Y(mid) }, end: { x: ix + iw, y: Y(mid) }, thickness: 1.6 * z, color: rgb(0.48, 0.12, 0.12), dashArray: CRQ_BARDAS[f.k].dash ? [3, 2] : undefined });
      const ls = parte(f.n, F, fs, cw - iw - 8 * z).slice(0, 2); ls.forEach((l, j) => txt(l, ix + iw + 4 * z, mid - (ls.length * fs * 1.12) / 2 + j * fs * 1.12, fs, F, NEG)) }
  }
  return new Blob([await doc.save()], { type: "application/pdf" });
}
