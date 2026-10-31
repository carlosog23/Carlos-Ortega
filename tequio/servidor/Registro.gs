/**
 * TEQUIO · Registro central de zonas
 * © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez. Todos los derechos reservados.
 *
 * Se instala UNA vez en la cuenta tequio023@gmail.com (administración general de Tequio).
 * No guarda datos de escuelas, alumnos ni personal: solo la lista de zonas instaladas.
 *
 *  · Genera códigos de invitación (un solo uso, con vencimiento) para que una supervisión instale Tequio.
 *  · Registra cada zona cuando termina el asistente de instalación (número, supervisor, sostenimiento, versión).
 *  · Recibe el «latido» diario de cada zona: versión, último uso y entradas del mes.
 *  · Permite suspender o reactivar una zona; la zona lo consulta y, suspendida, deja de abrir.
 *  · Publica la versión vigente y los avisos que aparecen dentro del Tequio de cada zona.
 *
 * Instalación: cree un proyecto en script.google.com con la cuenta tequio023@gmail.com, pegue este código,
 * impleméntelo como aplicación web (Ejecutar como: yo · Acceso: cualquier usuario) y ejecute «instalar».
 */

// URL de esta aplicación web (termina en /exec). Desde el editor, Google a veces da la de prueba (/dev), que no sirve a la consola.
const URL_APP = 'https://script.google.com/macros/s/AKfycby5gd_mRHBrIBiybcvcqtOiq0nftQzdv6EJbRFyX3T8SYGT_9fxs1YPf9c9H3qQauFX/exec';

const TZ = 'America/Tijuana';
const ADMIN_CORREOS = 'tequio023@gmail.com,carlosog23@gmail.com';
const CONSOLA = 'https://carlosog23.github.io/Carlos-Ortega/tequio/consola/';
const INSTALADOR = 'https://carlosog23.github.io/Carlos-Ortega/tequio/instalar/';

const HOJAS = {
  zonas: ['numero', 'nivel', 'sostenimiento', 'supervisor', 'correo', 'municipios', 'url', 'version', 'grupo', 'estado', 'motivo',
    'instalada', 'ultimoUso', 'entradasMes', 'escuelas', 'llaveHash', 'codigo'],
  inv: ['codigo', 'numero', 'nivel', 'sostenimiento', 'para', 'correo', 'grupo', 'vence', 'estado', 'creada', 'usada'],
  bit: ['fecha', 'quien', 'accion', 'detalle']
};
const NOMBRES = { zonas: 'Zonas', inv: 'Invitaciones', bit: 'Bitácora' };

/* ===================== Instalación ===================== */

function instalar() {
  const p = PropertiesService.getScriptProperties();
  let ss = p.getProperty('SHEET_ID') ? SpreadsheetApp.openById(p.getProperty('SHEET_ID')) : null;
  if (!ss) { ss = SpreadsheetApp.create('Tequio · Registro central de zonas (no editar a mano)'); p.setProperty('SHEET_ID', ss.getId()); }
  Object.keys(HOJAS).forEach(hoja_);
  const sobra = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (sobra && ss.getSheets().length > 1) ss.deleteSheet(sobra);
  if (!p.getProperty('VERSION_VIGENTE')) p.setProperty('VERSION_VIGENTE', '26');
  const url = /\/exec$/.test(URL_APP) ? URL_APP : ScriptApp.getService().getUrl();
  if (!url) throw new Error('Primero implemente el proyecto como aplicación web y vuelva a ejecutar «instalar».');
  const llave = nuevaLlave_();
  p.setProperty('ADMIN_HASH', sha_(llave));
  const enlace = CONSOLA + '#r=' + encodeURIComponent(url) + '&k=' + llave;
  MailApp.sendEmail({ to: ADMIN_CORREOS, subject: 'Tequio · Enlace de la consola del administrador',
    htmlBody: '<p>El registro central de Tequio quedó instalado.</p><p>Este es su enlace de la <b>consola del administrador</b>. No lo comparta; si lo pierde, ejecute «instalar» otra vez y se genera uno nuevo (el anterior deja de servir).</p>' +
      '<p><a href="' + enlace + '">Abrir la consola de Tequio</a></p><p style="font-size:12px;color:#666;word-break:break-all">' + enlace + '</p>',
    name: 'Tequio · Registro central' });
  Logger.log('Listo. Enlace de la consola (también se envió por correo):\n' + enlace);
}

/* ===================== Página ↔ registro ===================== */

function doGet() { return json_({ ok: true, app: 'Tequio · Registro central' }); }

function doPost(e) {
  try {
    const q = JSON.parse(e.postData.contents || '{}');
    let r;
    if (PUBLICAS[q.accion]) r = conCandado_(() => PUBLICAS[q.accion](q.datos || {}));
    else if (ZONA_ACC[q.accion]) {
      const z = zonaPorLlave_(q.datos && q.datos.numero, q.llave);
      r = conCandado_(() => ZONA_ACC[q.accion](z, q.datos || {}));
    } else if (ADMIN[q.accion]) {
      const h = PropertiesService.getScriptProperties().getProperty('ADMIN_HASH');
      if (!h || sha_(String(q.k || '')) !== h) return json_({ ok: false, error: 'acceso', mensaje: 'El enlace de la consola no es válido.' });
      r = conCandado_(() => ADMIN[q.accion](q.datos || {}));
    } else return json_({ ok: false, error: 'accion', mensaje: 'Acción desconocida.' });
    return json_(Object.assign({ ok: true }, r));
  } catch (err) {
    return json_({ ok: false, error: 'registro', mensaje: String(err && err.message || err) });
  }
}

// Acciones con código de invitación (asistente de instalación)
const PUBLICAS = {
  validarInvitacion: d => {
    const inv = invitacionValida_(d.codigo);
    return { invitacion: { numero: inv.numero, nivel: inv.nivel, sostenimiento: inv.sostenimiento, para: inv.para, correo: inv.correo, grupo: inv.grupo, vence: inv.vence } };
  },
  // Lo llama el servidor de la zona al terminar su instalación
  registrarZona: d => {
    const inv = invitacionValida_(d.codigo);
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(String(d.url || ''))) throw new Error('La dirección del servidor de la zona no es válida.');
    const llave = nuevaLlave_(), ahora = ahora_();
    const previa = leer_('zonas').find(z => z.numero === inv.numero && z.estado !== 'baja');
    if (previa) { previa.estado = 'baja'; previa.motivo = 'Reinstalada con el código ' + inv.codigo; guardar_('zonas', previa, 'numero'); }
    guardar_('zonas', { numero: inv.numero, nivel: d.nivel || inv.nivel, sostenimiento: d.sostenimiento || inv.sostenimiento,
      supervisor: String(d.supervisor || inv.para).slice(0, 120), correo: String(d.correo || inv.correo).slice(0, 200),
      municipios: String(d.municipios || '').slice(0, 200), url: d.url, version: String(d.version || ''), grupo: inv.grupo || 'general',
      estado: 'activa', motivo: '', instalada: ahora, ultimoUso: ahora, entradasMes: '0', escuelas: String(+d.escuelas || 0),
      llaveHash: sha_(llave), codigo: inv.codigo }, 'numero');
    inv.estado = 'usada'; inv.usada = ahora; guardar_('inv', inv, 'codigo');
    bitacora_('zona ' + inv.numero, 'registro', 'Instalación terminada');
    return { llave: llave, estado: 'activa', versionVigente: vigente_() };
  }
};

// Acciones del servidor de una zona (con la llave que recibió al registrarse)
const ZONA_ACC = {
  latido: (z, d) => {
    z.version = String(d.version || z.version); z.ultimoUso = d.ultimoUso || ahora_(); z.entradasMes = String(+d.entradasMes || 0);
    if (d.escuelas != null) z.escuelas = String(+d.escuelas || 0);
    if (d.supervisor) z.supervisor = String(d.supervisor).slice(0, 120);
    guardar_('zonas', z, 'numero');
    return { estado: z.estado, motivo: z.estado === 'suspendida' ? z.motivo : '', versionVigente: vigente_(), aviso: avisoPara_(z) };
  }
};

// Consola del administrador
const ADMIN = {
  resumen: () => ({ zonas: leer_('zonas').filter(z => z.estado !== 'baja').map(sinLlave_), invitaciones: leer_('inv').map(i => Object.assign(i, { estado: estadoInv_(i) })),
    versionVigente: vigente_(), aviso: JSON.parse(PropertiesService.getScriptProperties().getProperty('AVISO') || 'null'), instalador: INSTALADOR }),
  crearInvitacion: d => {
    const numero = String(d.numero || '').trim();
    if (!/^\d{1,4}$/.test(numero)) throw new Error('Escriba el número de zona (solo dígitos).');
    if (!String(d.para || '').trim()) throw new Error('Escriba el nombre del supervisor(a).');
    const dias = Math.min(30, Math.max(1, +d.dias || 7));
    const inv = { codigo: codigoNuevo_(), numero: ('000' + numero).slice(-3), nivel: d.nivel || 'Primaria',
      sostenimiento: /estatal/i.test(d.sostenimiento) ? 'Estatal' : 'Federalizada', para: String(d.para).trim().slice(0, 120),
      correo: String(d.correo || '').trim().slice(0, 200), grupo: d.grupo === 'piloto' ? 'piloto' : 'general',
      vence: Utilities.formatDate(new Date(Date.now() + dias * 864e5), TZ, 'yyyy-MM-dd'), estado: 'pendiente', creada: ahora_(), usada: '' };
    guardar_('inv', inv, 'codigo');
    bitacora_('administrador', 'invitación', inv.codigo + ' para la zona ' + inv.numero);
    return { invitacion: inv, instalador: INSTALADOR };
  },
  enviarInvitacion: d => {
    const inv = leer_('inv').find(i => i.codigo === d.codigo);
    if (!inv || !inv.correo) throw new Error('La invitación no tiene correo.');
    MailApp.sendEmail({ to: inv.correo, subject: 'Tequio · Su acceso para instalar Tequio en la Zona ' + inv.numero, name: 'Tequio · Mtro. Carlos Gabriel Ortega Gutiérrez',
      htmlBody: '<p>Estimado(a) ' + esc_(inv.para) + ':</p><p>Le comparto su acceso para instalar <b>Tequio</b> en la Supervisión Escolar Zona ' + inv.numero + '.</p>' +
        '<ol><li>Entre a <a href="' + INSTALADOR + '">' + INSTALADOR + '</a></li><li>Escriba el código <b style="font-family:monospace;font-size:16px">' + inv.codigo + '</b></li>' +
        '<li>Tenga a la mano la cuenta de Google de su supervisión, la lista de sus escuelas y los correos de sus ATP.</li></ol>' +
        '<p>El código es de un solo uso y vence el ' + inv.vence + '.</p><p>Mtro. Carlos Gabriel Ortega Gutiérrez<br><i>Tequio · Lo que acordamos juntos, lo caminamos juntos</i></p>' });
    return {};
  },
  anularInvitacion: d => { const inv = leer_('inv').find(i => i.codigo === d.codigo); if (!inv) throw new Error('No existe esa invitación.'); inv.estado = 'anulada'; guardar_('inv', inv, 'codigo'); return { invitacion: inv }; },
  renovarInvitacion: d => {
    const inv = leer_('inv').find(i => i.codigo === d.codigo); if (!inv) throw new Error('No existe esa invitación.');
    inv.estado = 'anulada'; guardar_('inv', inv, 'codigo');
    return ADMIN.crearInvitacion({ numero: inv.numero, nivel: inv.nivel, sostenimiento: inv.sostenimiento, para: inv.para, correo: inv.correo, grupo: inv.grupo, dias: 7 });
  },
  estadoZona: d => {
    const z = leer_('zonas').find(x => x.numero === d.numero && x.estado !== 'baja'); if (!z) throw new Error('No existe esa zona.');
    if (d.estado === 'suspendida') { z.estado = 'suspendida'; z.motivo = String(d.motivo || 'Sin motivo').slice(0, 200); }
    else if (d.estado === 'activa') { z.estado = 'activa'; z.motivo = ''; }
    if (d.grupo === 'piloto' || d.grupo === 'general') z.grupo = d.grupo;
    guardar_('zonas', z, 'numero');
    bitacora_('administrador', 'zona ' + z.numero, (d.estado || 'grupo ' + z.grupo) + (z.motivo ? ': ' + z.motivo : ''));
    return { zona: sinLlave_(z) };
  },
  versionVigente: d => { const v = String(+d.version || ''); if (!v) throw new Error('Versión inválida.'); PropertiesService.getScriptProperties().setProperty('VERSION_VIGENTE', v); bitacora_('administrador', 'versión', 'Vigente: ' + v); return { versionVigente: v }; },
  publicarAviso: d => {
    const p = PropertiesService.getScriptProperties();
    if (!String(d.texto || '').trim()) { p.deleteProperty('AVISO'); return { aviso: null }; }
    const a = { texto: String(d.texto).trim().slice(0, 500), grupo: d.grupo === 'piloto' ? 'piloto' : 'todas', fecha: ahora_() };
    p.setProperty('AVISO', JSON.stringify(a));
    if (d.correo) { const para = leer_('zonas').filter(z => z.estado === 'activa' && z.correo && (a.grupo === 'todas' || z.grupo === 'piloto')).map(z => z.correo.split(',')[0]);
      if (para.length) MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), bcc: para.join(','), subject: 'Tequio · Aviso del administrador', htmlBody: '<p>' + esc_(a.texto) + '</p>', name: 'Tequio · Administrador' }); }
    return { aviso: a };
  }
};

/* ===================== Utilidades ===================== */

function invitacionValida_(codigo) {
  const c = String(codigo || '').trim().toUpperCase();
  const inv = leer_('inv').find(i => i.codigo === c);
  if (!inv) throw new Error('El código de invitación no existe. Revíselo o pida uno nuevo al administrador de Tequio.');
  const e = estadoInv_(inv);
  if (e === 'usada') throw new Error('Este código ya se usó para instalar Tequio.');
  if (e === 'anulada') throw new Error('Este código fue anulado. Pida uno nuevo al administrador de Tequio.');
  if (e === 'vencida') throw new Error('Este código ya venció. Pida uno nuevo al administrador de Tequio.');
  return inv;
}
function estadoInv_(i) { return i.estado === 'pendiente' && i.vence < Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd') ? 'vencida' : i.estado; }
function zonaPorLlave_(numero, llave) {
  const z = leer_('zonas').find(x => x.numero === String(numero || '') && x.estado !== 'baja');
  if (!z || !llave || sha_(String(llave)) !== z.llaveHash) throw new Error('Zona no registrada.');
  return z;
}
function avisoPara_(z) { const a = JSON.parse(PropertiesService.getScriptProperties().getProperty('AVISO') || 'null'); return a && (a.grupo === 'todas' || z.grupo === 'piloto') ? a : null; }
function vigente_() { return PropertiesService.getScriptProperties().getProperty('VERSION_VIGENTE') || ''; }
function sinLlave_(z) { const o = Object.assign({}, z); delete o.llaveHash; return o; }
function codigoNuevo_() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', usados = leer_('inv').map(i => i.codigo);
  let c; do { c = 'TQ-' + [0, 1].map(() => Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join('')).join('-'); } while (usados.indexOf(c) >= 0);
  return c;
}
function nuevaLlave_() { return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 12); }
function sha_(t) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, t).map(b => ('0' + (b & 255).toString(16)).slice(-2)).join(''); }
function ahora_() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ss"); }
function esc_(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function conCandado_(f) { const l = LockService.getScriptLock(); l.waitLock(20000); try { return f(); } finally { l.releaseLock(); } }
function bitacora_(quien, accion, detalle) { try { hoja_('bit').appendRow([ahora_(), quien, accion, String(detalle || '').slice(0, 300)]); } catch (e) {} }

function hoja_(k) {
  const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  let sh = ss.getSheetByName(NOMBRES[k]);
  if (!sh) {
    sh = ss.insertSheet(NOMBRES[k]);
    sh.getRange(1, 1, 1, HOJAS[k].length).setValues([HOJAS[k]]).setFontWeight('bold').setBackground('#1E2A40').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), HOJAS[k].length).setNumberFormat('@');
  }
  return sh;
}
function leer_(k) {
  const sh = hoja_(k), n = sh.getLastRow();
  if (n < 2) return [];
  const cols = HOJAS[k];
  return sh.getRange(2, 1, n - 1, cols.length).getValues().filter(r => r[0] !== '').map(r => { const o = {}; cols.forEach((c, i) => { o[c] = String(r[i]); }); return o; });
}
function guardar_(k, o, clave) {
  const sh = hoja_(k), cols = HOJAS[k], n = sh.getLastRow();
  const fila = cols.map(c => o[c] == null ? '' : String(o[c]));
  const llaves = n > 1 ? sh.getRange(2, 1, n - 1, cols.length).getValues() : [];
  const ic = cols.indexOf(clave);
  // Una zona puede tener registros dados de baja; se actualiza el vigente
  let i = llaves.findIndex(r => String(r[ic]) === String(o[clave]) && (k !== 'zonas' || String(r[cols.indexOf('estado')]) !== 'baja' || o.estado === 'baja' && String(r[cols.indexOf('llaveHash')]) === String(o.llaveHash)));
  sh.getRange(i >= 0 ? i + 2 : n + 1, 1, 1, cols.length).setNumberFormat('@').setValues([fila]);
}
