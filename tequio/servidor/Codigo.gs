/**
 * TEQUIO · Asesoría y seguimiento · Supervisión Escolar Zona 050
 * «Lo que acordamos juntos, lo caminamos juntos»
 *
 * Programa de servidor (Google Apps Script). Se instala UNA vez en la cuenta
 * supervision050sep@gmail.com siguiendo la guía de instalación de la app.
 *
 *  · Guarda actividades, seguimiento y directorio en una hoja de cálculo propia.
 *  · Atiende a la página de Tequio (cada usuario entra con su enlace personal).
 *  · Envía invitaciones de Google Calendar, avisos y minutas por correo.
 *  · Cada mañana manda los recordatorios del día y los de seguimiento.
 *  · Lleva el checklist de acuerdos de reuniones y CTZ, escuela por escuela.
 *  · Revisa las carpetas de evidencias del Drive «Supervisión 050» (solo nombres y fechas).
 *  · Permite crear carpetas y subir archivos a ese Drive desde la página.
 *  · Da acceso de consulta a los directores: su escuela, la agenda y el avance general de la zona.
 *
 * No modifique este archivo salvo que la Supervisión lo indique.
 */

// ▼▼ Paso de instalación: pegue aquí la URL de la aplicación web (termina en /exec) ▼▼
const URL_APP = 'PEGUE_AQUI_LA_URL_DE_LA_APLICACION_WEB';
// ▲▲─────────────────────────────────────────────────────────────────────────────▲▲

const TZ = 'America/Tijuana';
const PAGINA = 'https://carlosog23.github.io/Carlos-Ortega/tequio/';
const REMITENTE = 'Supervisión Escolar Zona 050 · Tequio';
const LEMA = 'Lo que acordamos juntos, lo caminamos juntos';

const HOJAS = {
  act: ['id', 'titulo', 'tipo', 'fecha', 'horaInicio', 'horaFin', 'lugar', 'escuelas', 'destinatarios', 'responsables',
        'proposito', 'confidencial', 'avisos', 'estado', 'enviado', 'calEventId', 'creadoPor', 'creado', 'actualizado'],
  seg: ['id', 'actividadId', 'cct', 'fecha', 'resumen', 'acuerdos', 'confidencial', 'minutaEnviada', 'creadoPor', 'creado', 'actualizado'],
  dir: ['id', 'tipo', 'nombre', 'cargo', 'cct', 'escuela', 'municipio', 'multigrado', 'correo1', 'correo2', 'whatsapp', 'activo'],
  usr: ['id', 'nombre', 'rol', 'contacto', 'correo', 'whatsapp', 'tokenHash', 'activo', 'creado'],
  log: ['fecha', 'tipo', 'ref', 'destinatarios', 'asunto', 'resultado'],
  reu: ['id', 'titulo', 'tipo', 'fecha', 'horario', 'lugar', 'descripcion', 'activo', 'creadoPor', 'creado', 'actualizado'],
  acu: ['id', 'reunionId', 'seccion', 'numero', 'texto', 'responsable', 'limite', 'plazo', 'nota', 'escuelas', 'orden', 'activo', 'actualizado'],
  cum: ['id', 'acuerdoId', 'cct', 'estado', 'fecha', 'nota', 'marcadoPor', 'actualizado'],
  evi: ['id', 'cct', 'ruta', 'carpetaId', 'directos', 'archivos', 'ultimo', 'ultimoPor', 'recientes', 'revisado']
};
const NOMBRES = { act: 'Actividades', seg: 'Seguimiento', dir: 'Directorio', usr: 'Usuarios', log: 'Bitácora de envíos',
  reu: 'Reuniones', acu: 'Acuerdos de reuniones', cum: 'Cumplimiento por escuela', evi: 'Evidencias en Drive' };
const VERSION = 4;

// Carpeta principal del Drive de evidencias («Supervisión 050»), con una subcarpeta por escuela
const CARPETA_EVIDENCIAS = '1ZfvGdYObOhxG9oyixzOviuaC5OCVLc9D';
// Carpetas con datos personales: solo se cuentan archivos, no se guardan nombres
const CARPETAS_PRIVADAS = /^01-Expedientes/i;
const JSON_COLS = ['escuelas', 'destinatarios', 'responsables', 'avisos', 'enviado', 'acuerdos', 'recientes'];
const BOOL_COLS = ['confidencial', 'minutaEnviada', 'multigrado', 'activo'];

/* El directorio inicial (ESCUELAS y ATPS) está en el archivo Directorio.gs,
   que se entrega por separado porque contiene datos personales. */

/* ===================== Instalación ===================== */

/** Ejecute esta función UNA vez, después de implementar la aplicación web. */
function instalar() {
  const props = PropertiesService.getScriptProperties();
  let ss;
  if (props.getProperty('SHEET_ID')) {
    ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  } else {
    ss = SpreadsheetApp.create('Tequio · Zona 050 (datos, no editar a mano)');
    props.setProperty('SHEET_ID', ss.getId());
  }
  Object.keys(HOJAS).forEach(k => {
    let sh = ss.getSheetByName(NOMBRES[k]);
    if (!sh) sh = ss.insertSheet(NOMBRES[k]);
    sh.getRange(1, 1, 1, HOJAS[k].length).setValues([HOJAS[k]]).setFontWeight('bold').setBackground('#1F3A6B').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), HOJAS[k].length).setNumberFormat('@');
  });
  const sobrante = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (sobrante && ss.getSheets().length > 1) ss.deleteSheet(sobrante);

  if (leer_('dir').length === 0) {
    ESCUELAS.forEach(e => guardar_('dir', { id: 'd-' + e[1], tipo: 'director', nombre: e[4], cargo: e[5], cct: e[1], escuela: e[0],
      municipio: e[2], multigrado: e[3], correo1: e[7], correo2: e[8], whatsapp: e[6], activo: true }));
    ATPS.forEach(a => guardar_('dir', { id: a[0], tipo: 'atp', nombre: a[1], cargo: 'ATP de la Supervisión', cct: '', escuela: '',
      municipio: '', multigrado: false, correo1: a[3], correo2: a[4], whatsapp: a[2], activo: true }));
  }
  if (leer_('usr').length === 0) {
    guardar_('usr', { id: 'u-carlos', nombre: 'Mtro. Carlos Gabriel Ortega Gutiérrez', rol: 'admin', contacto: '',
      correo: 'cortegagutierrez@bcedu.mx,carlosog23@gmail.com', whatsapp: '6618501585', tokenHash: '', activo: true, creado: ahora_() });
    ATPS.forEach(a => guardar_('usr', { id: 'u-' + a[0].slice(2), nombre: a[1], rol: 'atp', contacto: a[0],
      correo: a[3] + ',' + a[4], whatsapp: a[2], tokenHash: '', activo: true, creado: ahora_() }));
  }

  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'tareaDiaria') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('tareaDiaria').timeBased().everyDays(1).atHour(6).inTimezone(TZ).create();

  const url = /\/exec$/.test(URL_APP) ? URL_APP : '';
  if (!url) throw new Error('Falta pegar la URL de la aplicación web en la línea URL_APP (al inicio del código). Guarde y vuelva a ejecutar «instalar».');
  props.setProperty('WEBAPP_URL', url);
  const enlace = nuevoEnlace_('u-carlos');
  const html = plantilla_('Tequio está instalado',
    '<p>La instalación terminó correctamente. Este es su <b>enlace personal de administrador</b>. Ábralo en su teléfono y en su computadora; no lo comparta.</p>' +
    boton_(enlace, 'Abrir Tequio') +
    '<p style="font-size:13px;color:#6A5C4C;word-break:break-all">' + enlace + '</p>' +
    '<p>La hoja de datos se llama «Tequio · Zona 050 (datos, no editar a mano)» y está en el Drive de esta cuenta.</p>');
  MailApp.sendEmail({ to: 'cortegagutierrez@bcedu.mx,carlosog23@gmail.com', subject: 'Tequio · Su enlace de administrador', htmlBody: html, name: REMITENTE });
  Logger.log('Listo. Enlace de administrador (también se envió por correo):\n' + enlace);
}

/* ===================== Página ↔ servidor ===================== */

function doGet() {
  return json_({ ok: true, app: 'Tequio', mensaje: 'Servidor de Tequio activo.' });
}

function doPost(e) {
  let r;
  try {
    const q = JSON.parse(e.postData.contents || '{}');
    const yo = usuario_(q.k);
    if (!yo) return json_({ ok: false, error: 'acceso', mensaje: 'El enlace no es válido o fue anulado. Solicite uno nuevo a la Supervisión.' });
    const f = ACCIONES[q.accion];
    if (!f) return json_({ ok: false, error: 'accion', mensaje: 'Acción desconocida.' });
    if (yo.rol === 'director' && SOLO_DIRECTOR.indexOf(q.accion) < 0)
      return json_({ ok: false, error: 'permiso', mensaje: 'Su enlace de dirección permite consultar y subir evidencias de su escuela.' });
    if (SIN_BLOQUEO.indexOf(q.accion) >= 0) r = f(yo, q.datos || {});  // tardan; se bloquean solo al guardar
    else {
      const lock = LockService.getScriptLock();
      lock.waitLock(20000);
      try { r = f(yo, q.datos || {}); } finally { lock.releaseLock(); }
    }
    return json_(Object.assign({ ok: true }, r));
  } catch (err) {
    return json_({ ok: false, error: 'servidor', mensaje: String(err && err.message || err) });
  }
}

// Lo único que puede hacer un enlace de dirección
const SOLO_DIRECTOR = ['datos', 'subirArchivo'];
// Acciones que tardan (Drive); se bloquean solo al escribir en la hoja
const SIN_BLOQUEO = ['revisarEvidencias', 'subirArchivo', 'crearCarpeta'];
// Tamaño máximo por archivo que se sube desde la página (el servidor de Google acepta envíos de hasta ~50 MB)
const MAX_MB = 20;

const ACCIONES = {
  datos: (yo) => yo.rol === 'director' ? datosDirector_(yo) : ({
    yo: publico_(yo),
    act: leer_('act').filter(a => visible_(yo, a)),
    seg: leer_('seg').filter(s => visible_(yo, s)),
    dir: leer_('dir'),
    usr: leer_('usr').map(publico_),
    reu: leer_('reu').filter(r => r.activo),
    acu: leer_('acu').filter(a => a.activo),
    cum: leer_('cum'),
    evi: leer_('evi'),
    eviRevisado: PropertiesService.getScriptProperties().getProperty('EVI_REVISADO') || '',
    version: VERSION,
    cuota: MailApp.getRemainingDailyQuota()
  }),

  /* ---- Checklist de acuerdos de reuniones ---- */

  // Crea o actualiza una reunión con su lista de acuerdos (y, opcionalmente, actividades para la agenda).
  // No envía ningún correo: las actividades importadas quedan sin avisos automáticos.
  guardarReunion: (yo, d) => {
    soloAdmin_(yo);
    const r0 = d.reunion || {};
    if (!r0.titulo || !r0.fecha) throw new Error('La reunión necesita nombre y fecha.');
    const previa = r0.id ? buscar_('reu', r0.id) : null;
    const reu = {
      id: previa ? previa.id : (r0.id || 'reu-' + Utilities.getUuid().slice(0, 8)),
      titulo: String(r0.titulo).slice(0, 200), tipo: r0.tipo || 'reunion', fecha: r0.fecha, horario: r0.horario || '',
      lugar: r0.lugar || '', descripcion: r0.descripcion || '', activo: true,
      creadoPor: previa ? previa.creadoPor : yo.id, creado: previa ? previa.creado : ahora_(), actualizado: ahora_()
    };
    guardar_('reu', reu);

    const nuevos = (d.acuerdos || []).filter(x => x && String(x.texto || '').trim()).map((x, i) => ({
      id: x.id || 'acu-' + Utilities.getUuid().slice(0, 8), reunionId: reu.id, seccion: x.seccion || '', numero: x.numero || String(i + 1),
      texto: String(x.texto).trim(), responsable: x.responsable || '', limite: /^\d{4}-\d{2}-\d{2}$/.test(x.limite || '') ? x.limite : '',
      plazo: x.plazo || '', nota: x.nota || '', escuelas: x.escuelas || [], orden: String(i + 1), activo: true, actualizado: ahora_()
    }));
    const ids = nuevos.map(x => x.id);
    const quitar = leer_('acu').filter(x => x.reunionId === reu.id && x.activo && ids.indexOf(x.id) < 0)
      .map(x => Object.assign(x, { activo: false, actualizado: ahora_() }));
    guardarVarios_('acu', nuevos.concat(quitar));

    const existentes = leer_('act').map(a => a.id);
    const acts = (d.actividades || []).filter(a => a && a.id && existentes.indexOf(a.id) < 0).map(a => Object.assign(limpiarActividad_(a), {
      id: a.id, avisos: [], confidencial: false, estado: a.estado === 'realizada' ? 'realizada' : 'programada',
      enviado: {}, calEventId: '', creadoPor: yo.id, creado: ahora_(), actualizado: ahora_()
    }));
    if (acts.length) guardarVarios_('act', acts);
    return { reunion: reu, acuerdos: nuevos, quitados: quitar.map(x => x.id), act: acts };
  },

  eliminarReunion: (yo, d) => {
    soloAdmin_(yo);
    const reu = buscar_('reu', d.id);
    if (!reu) throw new Error('Reunión no encontrada.');
    reu.activo = false; reu.actualizado = ahora_();
    guardar_('reu', reu);
    const acs = leer_('acu').filter(x => x.reunionId === reu.id && x.activo).map(x => Object.assign(x, { activo: false, actualizado: ahora_() }));
    guardarVarios_('acu', acs);
    return { id: reu.id };
  },

  // Revisa ahora las carpetas del Drive (tarda uno o dos minutos)
  revisarEvidencias: (yo) => {
    const r = revisarEvidencias_();
    return Object.assign(r, { evi: leer_('evi'), eviRevisado: PropertiesService.getScriptProperties().getProperty('EVI_REVISADO') });
  },

  // Palomea (o despalomea) acuerdos por escuela. Lo puede hacer la Supervisión o cualquier ATP.
  marcar: (yo, d) => {
    const acs = leer_('acu'), previos = leer_('cum');
    const cambios = (d.marcas || []).map(m => {
      if (['hecho', 'pendiente', 'no_aplica'].indexOf(m.estado) < 0) throw new Error('Estado no válido.');
      if (!acs.find(a => a.id === m.acuerdoId)) throw new Error('Acuerdo no encontrado.');
      const id = m.acuerdoId + '|' + m.cct;
      const p = previos.find(x => x.id === id);
      return { id: id, acuerdoId: m.acuerdoId, cct: m.cct, estado: m.estado,
        fecha: m.estado === 'hecho' ? (m.fecha || (p && p.estado === 'hecho' && p.fecha) || hoy_()) : '',
        nota: m.nota != null ? String(m.nota).slice(0, 500) : (p ? p.nota : ''), marcadoPor: yo.id, actualizado: ahora_() };
    });
    guardarVarios_('cum', cambios);
    return { cum: cambios };
  },

  guardarActividad: (yo, d) => {
    const previa = d.id ? buscar_('act', d.id) : null;
    if (previa && !visible_(yo, previa)) throw new Error('Sin permiso para esta actividad.');
    const a = Object.assign({}, previa || {}, limpiarActividad_(d));
    a.id = previa ? previa.id : 'act-' + Utilities.getUuid().slice(0, 8);
    if (yo.rol !== 'admin') a.confidencial = false;
    a.estado = a.estado || 'programada';
    a.enviado = (previa && previa.enviado) || {};
    a.creadoPor = previa ? previa.creadoPor : yo.id;
    a.creado = previa ? previa.creado : ahora_();
    a.actualizado = ahora_();
    const aviso = [];
    if (!a.confidencial && a.estado === 'programada') {
      if ((a.avisos || []).indexOf('calendario') >= 0) aviso.push(sincronizarCalendario_(a, previa));
      if (d.avisarAhora) aviso.push(enviarAviso_(a, previa ? 'cambio' : 'aviso'));
    }
    guardar_('act', a);
    return { act: a, avisos: aviso.filter(Boolean), cuota: MailApp.getRemainingDailyQuota() };
  },

  estadoActividad: (yo, d) => {
    const a = buscar_('act', d.id);
    if (!a || !visible_(yo, a)) throw new Error('Actividad no encontrada.');
    a.estado = d.estado;
    a.actualizado = ahora_();
    const aviso = [];
    if (d.estado === 'cancelada' && !a.confidencial) {
      if (a.calEventId) { try { CalendarApp.getEventById(a.calEventId).deleteEvent(); } catch (e) {} a.calEventId = ''; }
      if (d.avisar) aviso.push(enviarAviso_(a, 'cancelada'));
    }
    guardar_('act', a);
    return { act: a, avisos: aviso.filter(Boolean) };
  },

  reenviarAviso: (yo, d) => {
    const a = buscar_('act', d.id);
    if (!a || !visible_(yo, a)) throw new Error('Actividad no encontrada.');
    if (a.confidencial) throw new Error('Las actividades confidenciales no se envían de forma automática.');
    const r = enviarAviso_(a, 'aviso');
    guardar_('act', a);
    return { act: a, avisos: [r] };
  },

  guardarSeguimiento: (yo, d) => {
    const previo = d.id ? buscar_('seg', d.id) : null;
    if (previo && !visible_(yo, previo)) throw new Error('Sin permiso para este seguimiento.');
    const s = Object.assign({}, previo || {}, {
      actividadId: d.actividadId || '', cct: d.cct || '', fecha: d.fecha || hoy_(), resumen: d.resumen || '',
      acuerdos: (d.acuerdos || []).map(x => ({ id: x.id || 'ac-' + Utilities.getUuid().slice(0, 6), texto: x.texto || '',
        responsable: x.responsable || '', revision: x.revision || '', estado: x.estado || 'pendiente', avisado: x.avisado || '' })),
      confidencial: yo.rol === 'admin' && !!d.confidencial
    });
    s.id = previo ? previo.id : 'seg-' + Utilities.getUuid().slice(0, 8);
    s.creadoPor = previo ? previo.creadoPor : yo.id;
    s.creado = previo ? previo.creado : ahora_();
    s.actualizado = ahora_();
    const aviso = [];
    if (d.enviarMinuta && !s.confidencial) aviso.push(enviarMinuta_(s));
    guardar_('seg', s);
    return { seg: s, avisos: aviso.filter(Boolean), cuota: MailApp.getRemainingDailyQuota() };
  },

  guardarContacto: (yo, d) => {
    soloAdmin_(yo);
    const c = Object.assign({}, buscar_('dir', d.id) || {}, d);
    c.id = c.id || 'c-' + Utilities.getUuid().slice(0, 8);
    c.activo = c.activo !== false;
    guardar_('dir', c);
    return { contacto: c };
  },

  enlaceUsuario: (yo, d) => {
    soloAdmin_(yo);
    return { enlace: nuevoEnlace_(d.id) };
  },

  anularUsuario: (yo, d) => {
    soloAdmin_(yo);
    if (d.id === yo.id) throw new Error('No puede anular su propio enlace desde aquí.');
    const u = buscar_('usr', d.id);
    u.tokenHash = '';
    guardar_('usr', u);
    return { usuario: publico_(u) };
  },

  /* ---- Directores: un usuario de consulta por escuela ---- */

  // Crea (o actualiza) un usuario para cada director del Directorio. No genera enlaces: eso se hace uno por uno.
  prepararDirectores: (yo) => {
    soloAdmin_(yo);
    const usr = leer_('usr'), cambios = [];
    leer_('dir').filter(c => c.tipo === 'director' && c.activo && c.cct).forEach(c => {
      const correo = [c.correo1, c.correo2].filter(Boolean).join(',');
      const u = usr.find(x => x.rol === 'director' && x.contacto === c.id);
      if (!u) cambios.push({ id: 'u-d-' + c.cct, nombre: c.nombre, rol: 'director', contacto: c.id, correo: correo, whatsapp: c.whatsapp || '', tokenHash: '', activo: true, creado: ahora_() });
      else if (u.nombre !== c.nombre || u.correo !== correo || u.whatsapp !== (c.whatsapp || '')) cambios.push(Object.assign(u, { nombre: c.nombre, correo: correo, whatsapp: c.whatsapp || '' }));
    });
    guardarVarios_('usr', cambios);
    return { usr: leer_('usr').map(publico_), cambios: cambios.length };
  },

  /* ---- Drive: subir archivos y crear carpetas ---- */

  // Sube un archivo a una carpeta de evidencias. Directores: solo a las carpetas de su escuela.
  subirArchivo: (yo, d) => {
    const cct = yo.rol === 'director' ? cctDe_(yo) : String(d.cct || '');
    if (!cct) throw new Error('No se identificó la escuela.');
    if (yo.rol === 'director' && d.cct && d.cct !== cct) throw new Error('Solo puede subir archivos a las carpetas de su escuela.');
    const fila = leer_('evi').find(e => e.cct === cct && e.carpetaId === d.carpetaId);
    if (!fila) throw new Error('La carpeta no pertenece a esa escuela o todavía no se ha revisado. Pulse «Revisar ahora» en Evidencias e intente de nuevo.');
    const datos = String(d.datos || '');
    if (!datos) throw new Error('El archivo llegó vacío.');
    if (datos.length * 0.75 > MAX_MB * 1024 * 1024) throw new Error('El archivo pesa más de ' + MAX_MB + ' MB. Súbalo directo al Drive.');
    const nombre = String(d.nombre || 'archivo').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 180) || 'archivo';
    const blob = Utilities.newBlob(Utilities.base64Decode(datos), d.tipo || 'application/octet-stream', nombre);
    const archivo = DriveApp.getFolderById(fila.carpetaId).createFile(blob);
    archivo.setDescription(SUBIDO_POR + yo.nombre);
    bitacora_('archivo', cct, [], nombre + ' → ' + (fila.ruta || 'carpeta principal'), 'subido por ' + yo.nombre);
    const r = { archivo: { id: archivo.getId(), nombre: nombre, ruta: fila.ruta } };
    if (d.actualizar !== false) r.evi = revisarEscuela_(cct);
    return r;
  },

  // Crea una carpeta con el mismo nombre en varias escuelas, dentro de la ruta indicada ('' = carpeta de la escuela).
  crearCarpeta: (yo, d) => {
    if (yo.rol !== 'admin' && yo.rol !== 'atp') throw new Error('Solo la Supervisión y la Mesa Técnica pueden crear carpetas.');
    const nombre = String(d.nombre || '').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 120);
    if (!nombre) throw new Error('Escriba el nombre de la carpeta.');
    const dentro = String(d.dentro || '');
    const evi = leer_('evi'), nuevas = [], existian = [], sinBase = [];
    (d.ccts || []).forEach(cct => {
      const base = evi.find(e => e.cct === cct && normRuta_(e.ruta) === normRuta_(dentro));
      if (!base) { sinBase.push(cct); return; }
      const padre = DriveApp.getFolderById(base.carpetaId);
      const ya = padre.getFoldersByName(nombre);
      if (ya.hasNext()) { existian.push(cct); return; }
      const f = padre.createFolder(nombre);
      const ruta = dentro ? dentro + '/' + nombre : nombre;
      nuevas.push({ id: cct + '|' + ruta, cct: cct, ruta: ruta, carpetaId: f.getId(), directos: '0', archivos: '0', ultimo: '', ultimoPor: '', recientes: [], revisado: ahora_() });
    });
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try { guardarVarios_('evi', nuevas); } finally { lock.releaseLock(); }
    if (nuevas.length) bitacora_('carpeta', nombre, [], (dentro ? dentro + '/' : '') + nombre, 'creada en ' + nuevas.length + ' escuelas por ' + yo.nombre);
    return { creadas: nuevas.map(x => x.cct), existian: existian, sinBase: sinBase, evi: leer_('evi') };
  }
};

/* ===================== Directores ===================== */

// C.C.T. de la escuela de un usuario director (su contacto en el Directorio es «d-C.C.T.»)
function cctDe_(u) {
  const c = leer_('dir').find(x => x.id === u.contacto && x.tipo === 'director');
  return c ? c.cct : '';
}

// Lo que ve un director: la agenda completa (sin lo confidencial), lo de su escuela y el avance general de la zona.
function datosDirector_(yo) {
  const cct = cctDe_(yo);
  if (!cct) throw new Error('Su usuario no está ligado a una escuela. Avise a la Supervisión.');
  const dir = leer_('dir').filter(c => c.activo && (c.tipo === 'director' || c.tipo === 'atp')).map(c => c.cct === cct && c.tipo === 'director' ? c :
    { id: c.id, tipo: c.tipo, nombre: c.nombre, cargo: c.cargo, cct: c.cct, escuela: c.escuela, municipio: c.municipio, multigrado: c.multigrado, activo: c.activo });
  return {
    yo: Object.assign(publico_(yo), { cct: cct }),
    act: leer_('act').filter(a => !a.confidencial),
    seg: leer_('seg').filter(s => s.cct === cct && !s.confidencial),
    dir: dir,
    usr: leer_('usr').filter(u => u.activo && u.rol !== 'director').map(u => ({ id: u.id, nombre: u.nombre, rol: u.rol, contacto: u.contacto, activo: u.activo })),
    reu: leer_('reu').filter(r => r.activo),
    acu: leer_('acu').filter(a => a.activo),
    // de las demás escuelas solo va el estado (para el avance de la zona), sin observaciones
    cum: leer_('cum').map(m => m.cct === cct ? m : { id: m.id, acuerdoId: m.acuerdoId, cct: m.cct, estado: m.estado }),
    evi: leer_('evi').filter(e => e.cct === cct),
    eviRevisado: PropertiesService.getScriptProperties().getProperty('EVI_REVISADO') || '',
    version: VERSION
  };
}

/* ===================== Envíos ===================== */

function correosDe_(a) {
  const dir = leer_('dir'), usr = leer_('usr');
  const lista = [];
  (a.destinatarios || []).forEach(id => {
    const c = dir.find(x => x.id === id);
    if (c && c.activo) lista.push(c.correo1, c.correo2);
  });
  (a.responsables || []).forEach(id => {
    const u = usr.find(x => x.id === id);
    if (u) lista.push.apply(lista, String(u.correo).split(','));
  });
  const vistos = {};
  return lista.map(x => String(x || '').trim().toLowerCase()).filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x) && !vistos[x] && (vistos[x] = 1));
}

function enviarCorreo_(para, asunto, html, tipo, ref) {
  if (!para.length) return { tipo: tipo, ok: false, mensaje: 'Sin destinatarios con correo.' };
  const cuota = MailApp.getRemainingDailyQuota();
  if (cuota < para.length + 1) {
    bitacora_(tipo, ref, para, asunto, 'pendiente: cuota insuficiente (' + cuota + ')');
    return { tipo: tipo, ok: false, pendiente: true, mensaje: 'Hoy quedan ' + cuota + ' envíos disponibles y se necesitan ' + para.length + '. Se enviará mañana a primera hora.' };
  }
  MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), bcc: para.join(','), subject: asunto, htmlBody: html, name: REMITENTE, replyTo: 'supervision050sep@gmail.com' });
  bitacora_(tipo, ref, para, asunto, 'enviado');
  return { tipo: tipo, ok: true, mensaje: 'Correo enviado a ' + para.length + ' direcciones.' };
}

function enviarAviso_(a, clase) {
  const titulos = { aviso: 'Aviso', cambio: 'Cambio en actividad', recordatorio: 'Recordatorio', hoy: 'Hoy', cancelada: 'Actividad cancelada' };
  const asunto = (titulos[clase] || 'Aviso') + ': ' + a.titulo + ' · ' + fechaCorta_(a.fecha);
  const intro = {
    aviso: 'Le compartimos la siguiente actividad programada por la Supervisión Escolar.',
    cambio: 'La siguiente actividad tuvo cambios. Por favor tome nota de los datos actualizados.',
    recordatorio: 'Le recordamos que <b>mañana</b> se realiza la siguiente actividad.',
    hoy: 'Le recordamos que <b>hoy</b> se realiza la siguiente actividad.',
    cancelada: 'Le informamos que la siguiente actividad <b>fue cancelada</b>. Le avisaremos la nueva fecha cuando se defina.'
  }[clase];
  const html = plantilla_(a.titulo, '<p>' + intro + '</p>' + fichaActividad_(a));
  const r = enviarCorreo_(correosDe_(a), asunto, html, clase, a.id);
  a.enviado = a.enviado || {};
  if (r.ok) a.enviado[clase] = ahora_();
  else if (r.pendiente) a.enviado.pendiente = clase;
  return r;
}

function enviarMinuta_(s) {
  const dir = leer_('dir');
  const esc = dir.find(x => x.tipo === 'director' && x.cct === s.cct);
  const act = s.actividadId ? buscar_('act', s.actividadId) : null;
  const unicos = correosDe_({ destinatarios: esc ? [esc.id] : [], responsables: act ? act.responsables : [s.creadoPor] });
  const filas = (s.acuerdos || []).map((x, i) =>
    '<tr><td style="padding:8px;border-bottom:1px solid #E4D8C3;vertical-align:top">' + (i + 1) + '</td>' +
    '<td style="padding:8px;border-bottom:1px solid #E4D8C3">' + esc_(x.texto) + '</td>' +
    '<td style="padding:8px;border-bottom:1px solid #E4D8C3">' + esc_(x.responsable) + '</td>' +
    '<td style="padding:8px;border-bottom:1px solid #E4D8C3;white-space:nowrap">' + (x.revision ? fechaCorta_(x.revision) : '—') + '</td></tr>').join('');
  const cuerpo = '<p>Compartimos la minuta de seguimiento de la ' + (act ? esc_(act.titulo).toLowerCase() : 'visita') + ' realizada el ' + fechaLarga_(s.fecha) +
    (esc ? ' en la escuela <b>' + esc_(esc.escuela) + '</b> (' + esc.cct + ')' : '') + '.</p>' +
    (s.resumen ? '<p style="white-space:pre-line">' + esc_(s.resumen) + '</p>' : '') +
    (filas ? '<h3 style="font-size:16px;color:#24427A;margin:18px 0 6px">Acuerdos</h3><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#F1E4CC;text-align:left"><th style="padding:8px">#</th><th style="padding:8px">Acuerdo</th><th style="padding:8px">Responsable</th><th style="padding:8px">Revisión</th></tr>' + filas + '</table>' : '') +
    '<p style="margin-top:16px">Antes de cada fecha de revisión le enviaremos un recordatorio.</p>';
  const r = enviarCorreo_(unicos, 'Minuta de seguimiento · ' + (esc ? esc.escuela : 'Zona 050') + ' · ' + fechaCorta_(s.fecha), plantilla_('Minuta de seguimiento', cuerpo), 'minuta', s.id);
  if (r.ok) s.minutaEnviada = true;
  return r;
}

function sincronizarCalendario_(a, previa) {
  try {
    const cal = CalendarApp.getDefaultCalendar();
    const invitados = correosDe_(a);
    const desc = (a.proposito ? a.proposito + '\n\n' : '') + 'Supervisión Escolar Zona 050 · Tequio\n«' + LEMA + '»';
    let ev = a.calEventId ? (function () { try { return cal.getEventById(a.calEventId); } catch (e) { return null; } })() : null;
    const ini = a.horaInicio ? Utilities.parseDate(a.fecha + ' ' + a.horaInicio, TZ, 'yyyy-MM-dd HH:mm') : null;
    const fin = a.horaInicio ? Utilities.parseDate(a.fecha + ' ' + (a.horaFin || sumarHora_(a.horaInicio)), TZ, 'yyyy-MM-dd HH:mm') : null;
    const dia = Utilities.parseDate(a.fecha, TZ, 'yyyy-MM-dd');
    if (!ev) {
      const op = { location: a.lugar || '', description: desc, guests: invitados.join(','), sendInvites: true };
      ev = ini ? cal.createEvent(a.titulo, ini, fin, op) : cal.createAllDayEvent(a.titulo, dia, op);
      a.calEventId = ev.getId();
      bitacora_('invitacion', a.id, invitados, a.titulo, 'invitación de calendario enviada');
      return { tipo: 'calendario', ok: true, mensaje: 'Invitación de calendario enviada a ' + invitados.length + ' direcciones.' };
    }
    ev.setTitle(a.titulo); ev.setLocation(a.lugar || ''); ev.setDescription(desc);
    if (ini) ev.setTime(ini, fin); else ev.setAllDayDate(dia);
    const ya = ev.getGuestList().map(g => g.getEmail().toLowerCase());
    invitados.filter(x => ya.indexOf(x) < 0).forEach(x => ev.addGuest(x));
    return { tipo: 'calendario', ok: true, mensaje: 'Evento de calendario actualizado.' };
  } catch (err) {
    return { tipo: 'calendario', ok: false, mensaje: 'No se pudo crear la invitación de calendario: ' + err.message };
  }
}

/* ===================== Evidencias en Drive ===================== */

/** Ejecute esta función UNA vez desde el editor después de actualizar, para dar permiso de leer el Drive. */
function autorizarDrive() {
  const raiz = DriveApp.getFolderById(CARPETA_EVIDENCIAS);
  Logger.log('Carpeta encontrada: ' + raiz.getName() + '. Revisando evidencias…');
  const r = revisarEvidencias_();
  Logger.log('Listo: ' + r.escuelas + ' escuelas y ' + r.carpetas + ' carpetas revisadas. Ya puede ver la pestaña Evidencias en Tequio.');
}

function revisarEvidencias_() {
  const sinAcento = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/^\s*\d+\s*-\s*/, '')
    .replace(/\b(pte|pdte|presidente)\.?\s*/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const escuelas = leer_('dir').filter(c => c.tipo === 'director');
  const ahora = ahora_(), filas = [];
  const raiz = DriveApp.getFolderById(CARPETA_EVIDENCIAS);
  const sub = raiz.getFolders();
  let n = 0;
  while (sub.hasNext()) {
    const f = sub.next(), nom = sinAcento(f.getName());
    const esc = escuelas.find(e => sinAcento(e.escuela) === nom) || escuelas.find(e => nom && (sinAcento(e.escuela).indexOf(nom) >= 0 || nom.indexOf(sinAcento(e.escuela)) >= 0));
    if (!esc) continue;
    n++;
    recorrer_(f, '', esc.cct, filas, ahora);
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    reemplazarTodo_('evi', filas);  // la hoja de evidencias siempre refleja la última revisión completa
    PropertiesService.getScriptProperties().setProperty('EVI_REVISADO', ahora);
  } finally { lock.releaseLock(); }
  return { escuelas: n, carpetas: filas.length };
}

// Vuelve a revisar solo la carpeta de una escuela (después de subir archivos) y devuelve sus filas
function revisarEscuela_(cct) {
  const raiz = leer_('evi').find(e => e.cct === cct && !e.ruta);
  if (!raiz) return leer_('evi').filter(e => e.cct === cct);
  const filas = [];
  recorrer_(DriveApp.getFolderById(raiz.carpetaId), '', cct, filas, ahora_());
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    reemplazarTodo_('evi', leer_('evi').filter(e => e.cct !== cct).concat(filas));
  } finally { lock.releaseLock(); }
  return filas;
}

const SUBIDO_POR = 'Subido desde Tequio por ';
function normRuta_(r) { return String(r || '').normalize('NFC').toLowerCase().trim(); }

// Devuelve { archivos, ultimo, ultimoPor, recientes } de la carpeta y todo lo que tiene dentro
function recorrer_(carpeta, ruta, cct, filas, ahora) {
  const privada = CARPETAS_PRIVADAS.test(ruta.split('/')[0] || '');
  let directos = 0, recientes = [];
  const it = carpeta.getFiles();
  while (it.hasNext()) {
    const a = it.next();
    directos++;
    let por = '';
    try { const ds = a.getDescription() || ''; if (ds.indexOf(SUBIDO_POR) === 0) por = ds.slice(SUBIDO_POR.length); } catch (e) {}
    if (!por) { try { const o = a.getOwner(); por = o ? o.getEmail() : ''; } catch (e) {} }
    recientes.push({ f: Utilities.formatDate(a.getLastUpdated(), TZ, "yyyy-MM-dd'T'HH:mm"), n: privada ? '' : a.getName(), p: por, id: privada ? '' : a.getId() });
  }
  let total = directos;
  const subs = carpeta.getFolders();
  while (subs.hasNext()) {
    const s = subs.next();
    const r = recorrer_(s, ruta ? ruta + '/' + s.getName() : s.getName(), cct, filas, ahora);
    total += r.archivos;
    recientes = recientes.concat(r.recientes);
  }
  recientes.sort((x, y) => y.f.localeCompare(x.f));
  recientes = recientes.slice(0, 6);
  const fila = { id: cct + '|' + ruta, cct: cct, ruta: ruta, carpetaId: carpeta.getId(), directos: String(directos), archivos: String(total),
    ultimo: recientes[0] ? recientes[0].f : '', ultimoPor: recientes[0] ? recientes[0].p : '', recientes: recientes, revisado: ahora };
  filas.push(fila);
  return { archivos: total, recientes: recientes };
}

/* ===================== Tarea diaria (6:00 a. m.) ===================== */

function tareaDiaria() {
  try { revisarEvidencias_(); } catch (e) { bitacora_('evidencias', '', [], 'Revisión diaria del Drive', 'error: ' + e.message); }
  const hoy = hoy_(), manana = sumarDias_(hoy, 1), pasado = sumarDias_(hoy, 2);
  const acts = leer_('act');
  acts.forEach(a => {
    if (a.confidencial || a.estado !== 'programada') return;
    const av = a.avisos || [];
    let cambio = false;
    if (a.enviado && a.enviado.pendiente) { const k = a.enviado.pendiente; delete a.enviado.pendiente; enviarAviso_(a, k); cambio = true; }
    if (a.fecha === manana && av.indexOf('dia_antes') >= 0 && !(a.enviado || {}).recordatorio) { enviarAviso_(a, 'recordatorio'); cambio = true; }
    if (a.fecha === hoy && av.indexOf('mismo_dia') >= 0 && !(a.enviado || {}).hoy) { enviarAviso_(a, 'hoy'); cambio = true; }
    if (cambio) guardar_('act', a);
  });

  const dir = leer_('dir');
  leer_('seg').forEach(s => {
    if (s.confidencial) return;
    const esc = dir.find(x => x.tipo === 'director' && x.cct === s.cct);
    let cambio = false;
    (s.acuerdos || []).forEach(x => {
      if (x.estado !== 'pendiente' || !x.revision || x.avisado === x.revision) return;
      if (x.revision === pasado || x.revision === hoy) {
        const cuerpo = '<p>Le recordamos el siguiente acuerdo de seguimiento' + (esc ? ' de la escuela <b>' + esc_(esc.escuela) + '</b>' : '') +
          ', con fecha de revisión el <b>' + fechaLarga_(x.revision) + '</b>:</p>' +
          '<p style="background:#F1E4CC;border-radius:8px;padding:12px 14px">' + esc_(x.texto) + (x.responsable ? '<br><span style="color:#6A5C4C">Responsable: ' + esc_(x.responsable) + '</span>' : '') + '</p>';
        const para = correosDe_({ destinatarios: esc ? [esc.id] : [], responsables: [s.creadoPor] });
        const r = enviarCorreo_(para, 'Seguimiento: acuerdo por revisar · ' + (esc ? esc.escuela : 'Zona 050'), plantilla_('Acuerdo por revisar', cuerpo), 'acuerdo', s.id);
        if (r.ok) { x.avisado = x.revision; cambio = true; }
      }
    });
    if (cambio) guardar_('seg', s);
  });

  // Agenda del día para cada usuario (incluye actividades confidenciales solo para la Supervisión)
  leer_('usr').filter(u => u.activo && u.tokenHash).forEach(u => {
    const mias = acts.filter(a => a.fecha === hoy && a.estado === 'programada' && visible_(u, a) &&
      (u.rol === 'admin' || (a.responsables || []).indexOf(u.id) >= 0));
    if (!mias.length) return;
    const lista = mias.sort((x, y) => String(x.horaInicio).localeCompare(String(y.horaInicio))).map(fichaActividad_).join('');
    enviarCorreo_(String(u.correo).split(',').map(x => x.trim()).filter(Boolean), 'Su agenda de hoy en Tequio · ' + fechaCorta_(hoy),
      plantilla_('Su agenda de hoy', '<p>Buenos días. Estas son sus actividades de hoy:</p>' + lista + boton_(PAGINA, 'Abrir Tequio')), 'agenda', u.id);
  });
}

/* ===================== Plantillas de correo ===================== */

function plantilla_(titulo, cuerpo) {
  return '<div style="background:#F7F1E5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1E2A40">' +
    '<div style="max-width:600px;margin:0 auto;background:#FFFDF8;border-radius:12px;overflow:hidden;border:1px solid #E4D8C3">' +
    '<div style="background:#1F3A6B;color:#FBF6EC;padding:18px 22px;border-bottom:4px solid #C2603A">' +
    '<div style="font-family:Georgia,serif;font-size:26px;font-weight:bold">Tequio</div>' +
    '<div style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#E9D8BA">' + LEMA + '</div></div>' +
    '<div style="padding:22px;font-size:15px;line-height:1.55"><h2 style="font-size:20px;color:#24427A;margin:0 0 12px">' + esc_(titulo) + '</h2>' + cuerpo +
    '<p style="margin-top:22px">Atentamente,<br><b>Mtro. Carlos Gabriel Ortega Gutiérrez</b><br>Supervisor Escolar · Zona 050</p></div>' +
    '<div style="background:#F1E4CC;padding:12px 22px;font-size:12px;color:#6A5C4C">Supervisión Escolar Zona No. 050 · Primaria Federalizada · ISEP · Camalú, San Quintín, B.C.<br>«Responsabilidad y superación» · Tel. 616 165 5622 · supervision050sep@gmail.com</div>' +
    '</div></div>';
}

function fichaActividad_(a) {
  const dir = leer_('dir');
  const escuelas = (a.escuelas || []).map(c => (dir.find(x => x.cct === c) || {}).escuela || c);
  const fila = (k, v) => v ? '<tr><td style="padding:4px 12px 4px 0;color:#6A5C4C;vertical-align:top;white-space:nowrap">' + k + '</td><td style="padding:4px 0">' + v + '</td></tr>' : '';
  return '<div style="border:1px solid #E4D8C3;border-left:4px solid #C2603A;border-radius:8px;padding:12px 14px;margin:12px 0">' +
    '<div style="font-size:17px;font-weight:bold;color:#24427A;margin-bottom:6px">' + esc_(a.titulo) + '</div><table style="font-size:14px;border-collapse:collapse">' +
    fila('Fecha', fechaLarga_(a.fecha)) +
    fila('Horario', a.horaInicio ? a.horaInicio + (a.horaFin ? ' a ' + a.horaFin : '') + ' h' : 'Todo el día') +
    fila('Lugar', esc_(a.lugar)) +
    fila('Escuelas', escuelas.length ? (escuelas.length === 14 ? 'Todas las escuelas de la zona' : esc_(escuelas.join(', '))) : '') +
    fila('Propósito', a.proposito ? '<span style="white-space:pre-line">' + esc_(a.proposito) + '</span>' : '') +
    '</table></div>';
}

function boton_(url, texto) {
  return '<p style="margin:16px 0"><a href="' + url + '" style="background:#24427A;color:#FFFFFF;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:bold">' + texto + '</a></p>';
}

/* ===================== Utilidades ===================== */

function hoja_(k) {
  const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  let sh = ss.getSheetByName(NOMBRES[k]);
  if (!sh) {  // Las hojas nuevas de una actualización se crean solas la primera vez que se usan
    sh = ss.insertSheet(NOMBRES[k]);
    sh.getRange(1, 1, 1, HOJAS[k].length).setValues([HOJAS[k]]).setFontWeight('bold').setBackground('#1F3A6B').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), HOJAS[k].length).setNumberFormat('@');
  }
  return sh;
}

function leer_(k) {
  const sh = hoja_(k), n = sh.getLastRow();
  if (n < 2) return [];
  const cols = HOJAS[k];
  return sh.getRange(2, 1, n - 1, cols.length).getValues().filter(r => r[0] !== '').map(r => {
    const o = {};
    cols.forEach((c, i) => {
      let v = r[i];
      if (JSON_COLS.indexOf(c) >= 0) { try { v = v ? JSON.parse(v) : (c === 'enviado' ? {} : []); } catch (e) { v = []; } }
      else if (BOOL_COLS.indexOf(c) >= 0) v = v === true || v === 'true' || v === 'TRUE';
      else if (v instanceof Date) v = Utilities.formatDate(v, TZ, /^hora/.test(c) ? 'HH:mm' : c === 'fecha' ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm:ss");
      else v = String(v);
      o[c] = v;
    });
    return o;
  });
}

function buscar_(k, id) { return leer_(k).find(x => x.id === id) || null; }

function guardar_(k, o) {
  const sh = hoja_(k), cols = HOJAS[k];
  const fila = cols.map(c => {
    const v = o[c];
    if (JSON_COLS.indexOf(c) >= 0) return JSON.stringify(v || (c === 'enviado' ? {} : []));
    if (BOOL_COLS.indexOf(c) >= 0) return v ? 'true' : 'false';
    return v == null ? '' : String(v);
  });
  const n = sh.getLastRow();
  const ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
  const i = ids.indexOf(String(o.id));
  const r = sh.getRange(i >= 0 ? i + 2 : n + 1, 1, 1, cols.length);
  r.setNumberFormat('@').setValues([fila]);
}

function reemplazarTodo_(k, lista) {
  const sh = hoja_(k), cols = HOJAS[k], n = sh.getLastRow();
  if (n > 1) sh.getRange(2, 1, n - 1, cols.length).clearContent();
  if (!lista.length) return;
  const filas = lista.map(o => cols.map(c => {
    const v = o[c];
    if (JSON_COLS.indexOf(c) >= 0) return JSON.stringify(v || []);
    return v == null ? '' : String(v);
  }));
  sh.getRange(2, 1, filas.length, cols.length).setNumberFormat('@').setValues(filas);
}

function guardarVarios_(k, lista) {
  if (!lista.length) return;
  const sh = hoja_(k), cols = HOJAS[k];
  const filaDe = o => cols.map(c => {
    const v = o[c];
    if (JSON_COLS.indexOf(c) >= 0) return JSON.stringify(v || (c === 'enviado' ? {} : []));
    if (BOOL_COLS.indexOf(c) >= 0) return v ? 'true' : 'false';
    return v == null ? '' : String(v);
  });
  const n = sh.getLastRow();
  const ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
  const nuevas = [];
  lista.forEach(o => {
    const i = ids.indexOf(String(o.id));
    if (i >= 0) sh.getRange(i + 2, 1, 1, cols.length).setNumberFormat('@').setValues([filaDe(o)]);
    else { nuevas.push(filaDe(o)); ids.push(String(o.id)); }
  });
  if (nuevas.length) sh.getRange(n + 1, 1, nuevas.length, cols.length).setNumberFormat('@').setValues(nuevas);
}

function limpiarActividad_(d) {
  return {
    titulo: String(d.titulo || '').slice(0, 200), tipo: d.tipo || 'otro', fecha: d.fecha, horaInicio: d.horaInicio || '', horaFin: d.horaFin || '',
    lugar: d.lugar || '', escuelas: d.escuelas || [], destinatarios: d.destinatarios || [], responsables: d.responsables || [],
    proposito: d.proposito || '', confidencial: !!d.confidencial, avisos: d.avisos || [], estado: d.estado || 'programada'
  };
}

function visible_(u, x) { return !x.confidencial || u.rol === 'admin' || x.creadoPor === u.id; }
function soloAdmin_(u) { if (u.rol !== 'admin') throw new Error('Solo la Supervisión puede hacer esto.'); }
function publico_(u) { return { id: u.id, nombre: u.nombre, rol: u.rol, contacto: u.contacto, correo: u.correo, whatsapp: u.whatsapp, activo: u.activo, conEnlace: !!u.tokenHash }; }

function usuario_(k) {
  if (!k || String(k).length < 20) return null;
  const h = sha_(k);
  return leer_('usr').find(u => u.activo && u.tokenHash && u.tokenHash === h) || null;
}

function nuevoEnlace_(id) {
  const u = buscar_('usr', id);
  if (!u) throw new Error('Usuario no encontrado.');
  const k = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  u.tokenHash = sha_(k);
  guardar_('usr', u);
  const s = PropertiesService.getScriptProperties().getProperty('WEBAPP_URL') || ScriptApp.getService().getUrl();
  return PAGINA + '#s=' + encodeURIComponent(s) + '&k=' + k;
}

function sha_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8)
    .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

function bitacora_(tipo, ref, para, asunto, resultado) {
  try { hoja_('log').appendRow([ahora_(), tipo, ref, para.join(', '), asunto, resultado]); } catch (e) {}
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function ahora_() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ss"); }
function hoy_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function sumarDias_(f, n) { const d = Utilities.parseDate(f + ' 12:00', TZ, 'yyyy-MM-dd HH:mm'); d.setDate(d.getDate() + n); return Utilities.formatDate(d, TZ, 'yyyy-MM-dd'); }
function sumarHora_(h) { const p = h.split(':'); return ('0' + Math.min(23, +p[0] + 1)).slice(-2) + ':' + p[1]; }

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
function fechaLarga_(f) {
  if (!f) return '';
  const d = Utilities.parseDate(f + ' 12:00', TZ, 'yyyy-MM-dd HH:mm');
  const p = f.split('-');
  return DIAS[d.getDay()] + ' ' + (+p[2]) + ' de ' + MESES[+p[1] - 1] + ' de ' + p[0];
}
function fechaCorta_(f) { if (!f) return ''; const p = f.split('-'); return (+p[2]) + ' ' + MESES[+p[1] - 1].slice(0, 3) + ' ' + p[0]; }
