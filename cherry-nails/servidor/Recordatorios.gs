/**
 * Cherry Nails · servidor de recordatorios (Google Apps Script)
 *
 * Qué hace: una hora antes de cada cita «despierta» al celular donde está la app para que muestre el aviso.
 * No guarda nombres, teléfonos ni citas: solo la dirección de aviso del celular y las horas a las que debe avisar.
 * El texto del aviso lo arma la app en el mismo celular, con los datos que ya tiene guardados.
 *
 * Instalación (una sola vez):
 *  1. En script.google.com cree un proyecto nuevo (nombre: Cherry Nails Recordatorios) y pegue este archivo completo.
 *  2. Arriba, en la lista de funciones, elija «instalar» y pulse Ejecutar. Acepte los permisos.
 *     En el registro debe decir «Listo: llaves creadas y revisión cada 5 minutos».
 *  3. Implementar → Nueva implementación → Aplicación web → Ejecutar como: Yo →
 *     Quién tiene acceso: Cualquier usuario → Implementar. Copie la dirección que termina en /exec.
 *
 * Para actualizar este código más adelante: pegue el archivo nuevo, guarde y vaya a Implementar →
 * Administrar implementaciones → lápiz → Versión: Nueva versión → Implementar (la dirección no cambia).
 * No vuelva a ejecutar «instalar» (cambiaría las llaves y habría que activar los avisos otra vez en el celular).
 */

const VERSION = 1;
const CONTACTO = 'https://carlosog23.github.io/Carlos-Ortega/cherry-nails/';
const VENTANA_MIN = 5;      // cada cuánto revisa (minutos)
const MAX_CELULARES = 40;
const MAX_HORAS = 300;      // avisos pendientes por celular

/** Ejecute esta función UNA vez. */
function instalar() {
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('VAPID_PRIV')) {
    let semilla = [];
    for (let i = 0; i < 8; i++) semilla = semilla.concat(sha256_(bytesDeTexto_(Utilities.getUuid() + Date.now() + Math.random())));
    const d = (aBig_(sha256_(semilla)) % (N_ - 1n)) + 1n;
    p.setProperty('VAPID_PRIV', b64u_(aBytes_(d, 32)));
    p.setProperty('VAPID_PUB', b64u_(publica_(d)));
  }
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'revisar').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('revisar').timeBased().everyMinutes(VENTANA_MIN).create();
  UrlFetchApp.fetch('https://www.google.com/generate_204', { muteHttpExceptions: true });   // pide el permiso de conexión
  Logger.log('Listo: llaves creadas y revisión cada ' + VENTANA_MIN + ' minutos.');
}

function doGet() {
  return salida_({ ok: true, servicio: 'Cherry Nails · Recordatorios', version: VERSION, clave: PropertiesService.getScriptProperties().getProperty('VAPID_PUB') || '' });
}

function doPost(e) {
  try {
    const q = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const ep = String(q.endpoint || '');
    if (!/^https:\/\/[a-z0-9.-]+\.(googleapis\.com|push\.apple\.com|mozilla\.com|windows\.com|notify\.windows\.com)\//i.test(ep) || ep.length > 900) throw new Error('Dirección de aviso no válida.');
    const p = PropertiesService.getScriptProperties(), k = 'S_' + b64u_(sha256_(bytesDeTexto_(ep))).slice(0, 24);
    const lock = LockService.getScriptLock(); lock.waitLock(15000);
    try {
      if (q.accion === 'quitar') { p.deleteProperty(k); return salida_({ ok: true }); }
      if (q.accion === 'probar') { const c = empujar_(ep); return salida_({ ok: c >= 200 && c < 300, codigo: c }); }
      if (q.accion !== 'guardar') throw new Error('Solicitud no reconocida.');
      if (!p.getProperty(k) && p.getKeys().filter(x => x.indexOf('S_') === 0).length >= MAX_CELULARES) throw new Error('Se alcanzó el máximo de celulares.');
      const ahora = Date.now();
      const t = (Array.isArray(q.horas) ? q.horas : []).map(Number).filter(x => isFinite(x) && x > ahora - 30 * 60000 && x < ahora + 400 * 86400000)
        .filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a - b).slice(0, MAX_HORAS);
      p.setProperty(k, JSON.stringify({ e: ep, t: t }));
      return salida_({ ok: true, pendientes: t.length });
    } finally { lock.releaseLock(); }
  } catch (err) { return salida_({ ok: false, mensaje: String(err && err.message || err) }); }
}

/** Corre sola cada 5 minutos: avisa a los celulares que tienen una cita dentro de una hora. */
function revisar() {
  const p = PropertiesService.getScriptProperties(), todo = p.getProperties(), ahora = Date.now(), hasta = ahora + VENTANA_MIN * 60000;
  Object.keys(todo).filter(k => k.indexOf('S_') === 0).forEach(k => {
    let s; try { s = JSON.parse(todo[k]); } catch (e) { p.deleteProperty(k); return; }
    const toca = (s.t || []).filter(x => x <= hasta);
    if (!toca.length) return;
    const vigente = toca.some(x => x > ahora - 45 * 60000);   // lo muy atrasado ya no se avisa
    const c = vigente ? empujar_(s.e) : 200;
    if (c === 404 || c === 410) { p.deleteProperty(k); return; }   // el celular quitó los avisos
    if (c >= 200 && c < 300) { s.t = s.t.filter(x => x > hasta); p.setProperty(k, JSON.stringify(s)); }
  });
}

/** Manda el aviso (sin contenido) al servicio de notificaciones del celular. Devuelve el código de respuesta. */
function empujar_(endpoint) {
  const p = PropertiesService.getScriptProperties(), priv = p.getProperty('VAPID_PRIV'), pub = p.getProperty('VAPID_PUB');
  if (!priv) throw new Error('Falta ejecutar «instalar».');
  const origen = endpoint.match(/^https:\/\/[^\/]+/)[0];
  const cab = b64u_(bytesDeTexto_(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const cue = b64u_(bytesDeTexto_(JSON.stringify({ aud: origen, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: CONTACTO })));
  const jwt = cab + '.' + cue + '.' + b64u_(firmar_(bytesDeTexto_(cab + '.' + cue), aBig_(deB64u_(priv))));
  const r = UrlFetchApp.fetch(endpoint, { method: 'post', muteHttpExceptions: true, payload: '',
    headers: { TTL: '3600', Urgency: 'high', Authorization: 'vapid t=' + jwt + ', k=' + pub } });
  return r.getResponseCode();
}

function salida_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ===================== Firma ES256 (curva P-256) ===================== */
const P_ = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;
const N_ = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;
const A_ = P_ - 3n;
const GX_ = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n;
const GY_ = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n;
function mod_(a, m) { const r = a % m; return r < 0n ? r + m : r; }
function inv_(a, m) { let r0 = m, r1 = mod_(a, m), s0 = 0n, s1 = 1n; while (r1 !== 0n) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; } return mod_(s0, m); }
function suma_(p1, p2) {
  if (!p1) return p2; if (!p2) return p1;
  let l;
  if (p1[0] === p2[0]) { if (mod_(p1[1] + p2[1], P_) === 0n) return null; l = mod_((3n * p1[0] * p1[0] + A_) * inv_(2n * p1[1], P_), P_); }
  else l = mod_((p2[1] - p1[1]) * inv_(p2[0] - p1[0], P_), P_);
  const x = mod_(l * l - p1[0] - p2[0], P_);
  return [x, mod_(l * (p1[0] - x) - p1[1], P_)];
}
function mult_(k, pt) { let r = null, a = pt; while (k > 0n) { if (k & 1n) r = suma_(r, a); a = suma_(a, a); k >>= 1n; } return r; }
function publica_(d) { const q = mult_(d, [GX_, GY_]); return [4].concat(aBytes_(q[0], 32), aBytes_(q[1], 32)); }
/** Firma en formato r||s (64 bytes). El número de un solo uso se deriva de la llave y del mensaje. */
function firmar_(mensaje, d) {
  const h = sha256_(mensaje), z = aBig_(h), llave = aBytes_(d, 32);
  for (let i = 0; i < 50; i++) {
    const k = mod_(aBig_(hmac_(h.concat([i]), llave)), N_ - 1n) + 1n;
    const r = mod_(mult_(k, [GX_, GY_])[0], N_);
    if (r === 0n) continue;
    const s = mod_(inv_(k, N_) * (z + r * d), N_);
    if (s === 0n) continue;
    return aBytes_(r, 32).concat(aBytes_(s, 32));
  }
  throw new Error('No se pudo firmar.');
}
/* ---- bytes ---- */
function sin_(b) { return b.map(x => x & 255); }
function con_(b) { return b.map(x => x > 127 ? x - 256 : x); }
function sha256_(b) { return sin_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, con_(b))); }
function hmac_(b, llave) { return sin_(Utilities.computeHmacSha256Signature(con_(b), con_(llave))); }
function bytesDeTexto_(t) { return sin_(Utilities.newBlob(t).getBytes()); }
function aBig_(b) { let n = 0n; b.forEach(x => { n = (n << 8n) | BigInt(x); }); return n; }
function aBytes_(n, largo) { const o = []; for (let i = 0; i < largo; i++) { o.unshift(Number(n & 255n)); n >>= 8n; } return o; }
function b64u_(b) { return Utilities.base64EncodeWebSafe(con_(b)).replace(/=+$/, ''); }
function deB64u_(t) { return sin_(Utilities.base64DecodeWebSafe(t)); }
