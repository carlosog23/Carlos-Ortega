/**
 * Ajedrez de la Zona 050 · servidor para jugar en línea entre escuelas
 * Tablet-Tini (y cualquier app de la zona) se conecta aquí con internet.
 *
 * Seguridad para los niños:
 *  - No hay chat: solo se envían jugadas de ajedrez.
 *  - Se guarda únicamente el primer nombre, el grado y la escuela que escribe el alumno.
 *  - Nada se guarda en hojas ni en el Drive: las partidas viven en la memoria temporal
 *    de Google (CacheService) y se borran solas a las 3 horas sin movimiento.
 *
 * Cómo instalarlo (una sola vez):
 *  1. Entrar a script.google.com con la cuenta de la Supervisión y crear un proyecto nuevo
 *     llamado «Ajedrez Zona 050».
 *  2. Borrar lo que trae y pegar todo este archivo. Guardar.
 *  3. Implementar → Nueva implementación → Tipo: Aplicación web.
 *     Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 *  4. Copiar la URL que termina en /exec y escribirla en Tablet-Tini
 *     (Modo maestro → «Servidor de ajedrez de la zona»), o pasársela a Claude para dejarla fija.
 *
 * Supervisión Escolar Zona 050 · Mtro. Carlos Gabriel Ortega Gutiérrez
 */

var DURA = 3 * 3600;        // segundos sin movimiento antes de borrar una partida
var MAX_SALAS = 60;

function doGet(e) {
  var p = (e && e.parameter) || {};
  var a = String(p.a || 'ping');
  if (a === 'ping') return json_({ ok: true, servidor: 'Ajedrez Zona 050' });
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (err) { return json_({ error: 'El servidor está ocupado, intenta otra vez.' }); }
  try {
    var S = lee_();
    var r = atiende_(a, p, S);
    if (r.guardar) guarda_(S);
    return json_(r.res);
  } finally {
    lock.releaseLock();
  }
}

function atiende_(a, p, S) {
  var ahora = Date.now() / 1000;
  if (a === 'salas') {
    var L = [];
    for (var k in S) L.push(publica_(S[k]));
    L.sort(function (x, y) { return y.creada - x.creada; });
    return { res: { salas: L } };
  }
  if (a === 'crear') {
    if (Object.keys(S).length >= MAX_SALAS) return { res: { error: 'Hay demasiadas partidas abiertas. Intenta en un rato.' } };
    var id = clave_(6), tok = clave_(16);
    S[id] = { id: id, blancas: nombre_(p.jugador), negras: '', tb: tok, tn: '', movs: [], estado: 'esperando', resultado: '', v: 1, t: ahora, creada: ahora };
    return { guardar: true, res: { id: id, token: tok, color: 'w' } };
  }
  var s = S[String(p.id || '')];
  if (!s) return { res: { error: 'La partida ya no existe.' } };
  if (a === 'sala') return { res: publica_(s) };
  if (a === 'unirse') {
    if (s.estado !== 'esperando') return { res: { error: 'Esa partida ya empezó.' } };
    var t2 = clave_(16);
    s.negras = nombre_(p.jugador); s.tn = t2; s.estado = 'jugando'; s.t = ahora; s.v++;
    return { guardar: true, res: { id: s.id, token: t2, color: 'b' } };
  }
  var tok2 = String(p.token || '');
  var color = tok2 && tok2 === s.tb ? 'w' : tok2 && tok2 === s.tn ? 'b' : '';
  if (!color) return { res: { error: 'No eres jugador de esta partida.' } };
  if (a === 'mover') {
    var mov = String(p.mov || '');
    if (s.estado !== 'jugando' || !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(mov)) return { res: { error: 'Movimiento no válido.' } };
    var turno = s.movs.length % 2 === 0 ? 'w' : 'b';
    if (turno !== color || parseInt(p.num, 10) !== s.movs.length) return { res: { error: 'No es tu turno.' } };
    s.movs.push(mov); s.t = ahora; s.v++;
    if (p.resultado) { s.estado = 'terminada'; s.resultado = String(p.resultado).slice(0, 60); }
    return { guardar: true, res: publica_(s) };
  }
  if (a === 'fin') {
    if (s.estado !== 'terminada') {
      s.estado = 'terminada';
      s.resultado = String(p.resultado || (color === 'w' ? 'Ganan las negras: las blancas se rindieron' : 'Ganan las blancas: las negras se rindieron')).slice(0, 60);
      s.v++; s.t = ahora;
    }
    return { guardar: true, res: publica_(s) };
  }
  return { res: { error: 'Acción desconocida.' } };
}

function lee_() {
  var txt = CacheService.getScriptCache().get('salas');
  var S = {};
  try { S = txt ? JSON.parse(txt) : {}; } catch (e) { S = {}; }
  var ahora = Date.now() / 1000;
  for (var k in S) {
    var s = S[k];
    if (ahora - s.t > DURA || (s.estado === 'terminada' && ahora - s.t > 900)) delete S[k];
  }
  return S;
}
function guarda_(S) { CacheService.getScriptCache().put('salas', JSON.stringify(S), 21600); }
function publica_(s) { return { id: s.id, blancas: s.blancas, negras: s.negras, movs: s.movs, estado: s.estado, resultado: s.resultado, v: s.v, creada: s.creada }; }
function nombre_(t) {
  t = String(t || '').replace(/[<>"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  return t || 'Jugador';
}
function clave_(n) {
  var c = 'abcdefghijklmnopqrstuvwxyz0123456789', s = '';
  for (var i = 0; i < n; i++) s += c.charAt(Math.floor(Math.random() * c.length));
  return s;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
