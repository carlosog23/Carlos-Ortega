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
 *  · Genera oficios numerados de la Supervisión, con redacción asistida por IA (Gemini) y envío por correo.
 *  · Concentra los resultados del SisAT (3 momentos) por grupo, grado, escuela y zona: lee los Excel de la herramienta
 *    oficial (resultado de cada alumno y componente) y, como respaldo, las gráficas con IA.
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
  evi: ['id', 'cct', 'ruta', 'carpetaId', 'directos', 'archivos', 'ultimo', 'ultimoPor', 'recientes', 'revisado'],
  ofi: ['id', 'numero', 'anio', 'folio', 'fecha', 'municipio', 'destNombre', 'destCargo', 'destInst', 'escuelas', 'referencia', 'asunto', 'cuerpo',
        'ccp', 'firma', 'sello', 'escala', 'pdfId', 'envios', 'creadoPor', 'creado', 'actualizado', 'destCorreo', 'recibidoId', 'recibidoNombre'],
  sis: ['id', 'ciclo', 'momento', 'cct', 'grado', 'grupo', 'lec', 'tex', 'cal', 'tip', 'fuente', 'cargadoPor', 'actualizado', 'comp'],
  sia: ['id', 'ciclo', 'momento', 'cct', 'grado', 'grupo', 'num', 'alumno', 'lec', 'tex', 'cal', 'cargadoPor', 'actualizado'],
  sic: ['id', 'ciclo', 'momento', 'nivel', 'ref', 'tipo', 'texto', 'autor', 'autorNombre', 'creado', 'actualizado'],
  eig: ['id', 'ciclo', 'cct', 'grado', 'grupo', 'n', 'cr', 'rz', 'fuente', 'cargadoPor', 'actualizado'],
  eia: ['id', 'ciclo', 'cct', 'grado', 'grupo', 'num', 'alumno', 'sexo', 'v', 'cargadoPor', 'actualizado'],
  per: ['id', 'nombre', 'cargo', 'institucion', 'correo', 'telefono', 'grupo', 'fuente', 'creadoPor', 'creado', 'actualizado'],
  dep: ['id', 'orden', 'municipio', 'dependencia', 'area', 'tratamiento', 'nombre', 'cargo', 'telefono', 'correo', 'domicilio', 'apoyo',
        'fuente', 'vigente', 'revisado', 'confirmar', 'activo', 'actualizado', 'actualizadoPor'],
  vis: ['id', 'ciclo', 'cct', 'numero', 'fecha', 'estado', 'items', 'resumen', 'segId', 'carpetaId', 'creadoPor', 'creado', 'actualizado', 'cerradaPor', 'titulo', 'temas'],
  inf: ['id', 'cct', 'fecha', 'asunto', 'cifras', 'pendientes', 'html', 'atpId', 'para', 'cc', 'enviadoPor', 'creado', 'resultado'],
  acl: ['id', 'cct', 'informeId', 'tema', 'ref', 'mensaje', 'atpId', 'estado', 'respuestas', 'creadoPor', 'creadoNombre', 'creado', 'actualizado', 'resuelto']
};
const NOMBRES = { act: 'Actividades', seg: 'Seguimiento', dir: 'Directorio', usr: 'Usuarios', log: 'Bitácora de envíos',
  reu: 'Reuniones', acu: 'Acuerdos de reuniones', cum: 'Cumplimiento por escuela', evi: 'Evidencias en Drive', ofi: 'Oficios',
  sis: 'SisAT · Resultados', sic: 'SisAT · Observaciones', sia: 'SisAT · Alumnos',
  eig: 'EIA · Resultados por grupo', eia: 'EIA · Alumnos', per: 'Directorio de oficios', dep: 'Directorio de dependencias', vis: 'Visitas de supervisión', inf: 'Informes de seguimiento', acl: 'Aclaraciones de informes' };
const VERSION = 13;

// Carpeta principal del Drive de evidencias («Supervisión 050»), con una subcarpeta por escuela
const CARPETA_EVIDENCIAS = '1ZfvGdYObOhxG9oyixzOviuaC5OCVLc9D';
// Carpetas con datos personales: solo se cuentan archivos, no se guardan nombres
const CARPETAS_PRIVADAS = /^01-Expedientes/i;
const JSON_COLS = ['escuelas', 'destinatarios', 'responsables', 'avisos', 'enviado', 'acuerdos', 'recientes', 'envios', 'lec', 'tex', 'cal', 'tip', 'comp', 'cr', 'rz', 'v', 'items', 'temas', 'cifras', 'pendientes', 'respuestas'];
const BOOL_COLS = ['confidencial', 'minutaEnviada', 'multigrado', 'activo', 'firma', 'sello', 'confirmar'];

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
const SOLO_DIRECTOR = ['datos', 'verInforme', 'crearAclaracion', 'responderAclaracion', 'subirArchivo', 'visitaFoto', 'quitarFotoVisita', 'prepararVisita', 'sisatComentar', 'sisatGuardar', 'sisatArchivos', 'sisatBajar', 'sisatSubir', 'sisatAlumnos',
  'eiaGuardar', 'eiaArchivos', 'eiaBajar', 'eiaSubir', 'eiaAlumnos', 'leerDirectorio'];
// Acciones que tardan (Drive); se bloquean solo al escribir en la hoja
const SIN_BLOQUEO = ['enviarInforme', 'visitaFoto', 'quitarFotoVisita', 'leerDirectorio', 'revisarEvidencias', 'subirArchivo', 'crearCarpeta', 'redactarOficio', 'enviarOficio', 'archivarOficio', 'configOficios', 'recursosOficio', 'analizarOficioRecibido', 'numeroOficio', 'sisatArchivos', 'sisatLeer', 'sisatBajar', 'sisatSubir', 'sisatAlumnos',
  'eiaArchivos', 'eiaBajar', 'eiaSubir', 'eiaAlumnos'];
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
    ofi: leer_('ofi').sort((a, b) => String(b.id).localeCompare(String(a.id))),
    ofiCfg: cfgOficios_(),
    sis: leer_('sis'),
    sic: leer_('sic'),
    sisCfg: { ia: !!PropertiesService.getScriptProperties().getProperty('GEMINI_KEY') },
    eig: leer_('eig'),
    per: leer_('per'),
    dep: leer_('dep').filter(x => x.activo),
    vis: leer_('vis'),
    inf: leer_('inf').map(sinHtml_),
    acl: leer_('acl'),
    iaDirectorio: !!PropertiesService.getScriptProperties().getProperty('GEMINI_KEY'),
    version: VERSION,
    cuota: MailApp.getRemainingDailyQuota()
  }),

  /* ---- SisAT (Sistema de Alerta Temprana): resultados por grupo y observaciones ---- */

  // Guarda los grupos de UNA escuela en UN momento; reemplaza lo que hubiera de esa escuela y momento.
  // Si los grupos traen «alumnos» (leídos de los Excel de la herramienta oficial), se guardan también los resultados de cada alumno.
  sisatGuardar: (yo, d) => {
    const ciclo = cicloValido_(d.ciclo), m = momentoValido_(d.momento), cct = cctPermitido_(yo, d.cct);
    if (!leer_('dir').find(c => c.tipo === 'director' && c.cct === cct)) throw new Error('La escuela no está en el Directorio.');
    const vistos = {};
    const nuevos = (d.grupos || []).map(g => {
      const grado = String(g.grado || '').replace(/\D/g, '').slice(0, 1), grupo = String(g.grupo || '').trim().toUpperCase().slice(0, 12);
      if (!/^[1-6]$/.test(grado)) throw new Error('Grado no válido en uno de los grupos: «' + (g.grado || '') + '».');
      const k = grado + '-' + (grupo || 'U');
      if (vistos[k]) throw new Error('El grupo ' + grado + '° ' + grupo + ' aparece dos veces.');
      vistos[k] = 1;
      return { id: [ciclo, m, cct, k].join('|'), ciclo: ciclo, momento: String(m), cct: cct, grado: grado, grupo: grupo,
        lec: niveles_(g.lec), tex: niveles_(g.tex), cal: niveles_(g.cal), tip: tipos_(g.tip),
        fuente: String(d.fuente || g.fuente || '').slice(0, 200), cargadoPor: yo.id, actualizado: ahora_(), comp: componentes_(g.comp),
        _alumnos: Array.isArray(g.alumnos) ? g.alumnos : null };
    });
    if (!nuevos.length) throw new Error('No hay grupos que guardar.');
    const alumnos = [];
    nuevos.forEach(g => {
      (g._alumnos || []).slice(0, 80).forEach((a, i) => {
        const nombre = String(a.alumno || '').replace(/\s+/g, ' ').trim().slice(0, 120);
        if (!nombre) return;
        alumnos.push({ id: [ciclo, m, cct, g.grado + '-' + (g.grupo || 'U'), i + 1].join('|'), ciclo: ciclo, momento: String(m), cct: cct, grado: g.grado, grupo: g.grupo,
          num: String(i + 1), alumno: nombre, lec: resAlumno_(a.lec, 6), tex: resAlumno_(a.tex, 6), cal: resAlumno_(a.cal, 10), cargadoPor: yo.id, actualizado: ahora_() });
      });
      delete g._alumnos;
    });
    const resto = leer_('sis').filter(x => !(x.ciclo === ciclo && String(x.momento) === String(m) && x.cct === cct));
    reemplazarTodo_('sis', resto.concat(nuevos));
    // Los alumnos de esa escuela y momento se reemplazan siempre: si la nueva carga no trae alumnos (captura por grupo), se borran los anteriores
    const restoA = leer_('sia').filter(x => !(x.ciclo === ciclo && String(x.momento) === String(m) && x.cct === cct));
    reemplazarTodo_('sia', restoA.concat(alumnos));
    bitacora_('sisat', cct, [], 'SisAT ' + ciclo + ' · Momento ' + m, nuevos.length + ' grupos' + (alumnos.length ? ' y ' + alumnos.length + ' alumnos' : '') + ' guardados por ' + yo.nombre);
    return yo.rol === 'director' ? { sis: datosDirector_(yo).sis } : { sis: leer_('sis') };
  },

  // Resultados de cada alumno de UNA escuela en un ciclo (todos los momentos). Se piden solo al consultar esa escuela.
  sisatAlumnos: (yo, d) => {
    const ciclo = cicloValido_(d.ciclo), cct = cctPermitido_(yo, d.cct);
    return { cct: cct, ciclo: ciclo, alumnos: leer_('sia').filter(x => x.ciclo === ciclo && x.cct === cct) };
  },

  // Devuelve el contenido de los Excel del SisAT (de la carpeta de la escuela) para leerlos en la página
  sisatBajar: (yo, d) => {
    const cct = cctPermitido_(yo, d.cct), m = momentoValido_(d.momento);
    const c = carpetaSisat_(cct, m, false);
    if (!c.carpeta) throw new Error(c.mensaje || 'La escuela no tiene carpeta del SisAT.');
    const permitidos = {}, it = c.carpeta.getFiles();
    while (it.hasNext()) { const a = it.next(); permitidos[a.getId()] = a; }
    let total = 0;
    const archivos = (d.ids || []).slice(0, 120).map(id => {
      const a = permitidos[String(id)];
      if (!a) throw new Error('Uno de los archivos no está en la carpeta del SisAT de la escuela.');
      if (a.getSize() > 5 * 1024 * 1024) throw new Error('El archivo «' + a.getName() + '» pesa más de 5 MB; no parece de la herramienta del SisAT.');
      total += a.getSize();
      if (total > 40 * 1024 * 1024) throw new Error('Son demasiados archivos para leerlos juntos. Elija menos.');
      return { id: a.getId(), nombre: a.getName(), tipo: a.getMimeType(), fecha: Utilities.formatDate(a.getLastUpdated(), TZ, "yyyy-MM-dd'T'HH:mm"), datos: Utilities.base64Encode(a.getBlob().getBytes()) };
    });
    return { archivos: archivos, ruta: c.ruta };
  },

  // Guarda en la carpeta «SISAT / Momento N» de la escuela un Excel que se sube desde la página
  sisatSubir: (yo, d) => {
    const cct = cctPermitido_(yo, d.cct), m = momentoValido_(d.momento);
    const datos = String(d.datos || '');
    if (!datos) throw new Error('El archivo llegó vacío.');
    if (datos.length * 0.75 > 5 * 1024 * 1024) throw new Error('El archivo pesa más de 5 MB; no parece de la herramienta del SisAT.');
    const nombre = String(d.nombre || 'SisAT.xls').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 160) || 'SisAT.xls';
    const c = carpetaSisat_(cct, m, true);
    if (!c.carpeta) throw new Error(c.mensaje || 'No se encontró la carpeta del SisAT.');
    const f = c.carpeta.createFile(Utilities.newBlob(Utilities.base64Decode(datos), d.tipo || 'application/vnd.ms-excel', nombre));
    f.setDescription(SUBIDO_POR + yo.nombre);
    return { archivo: { id: f.getId(), nombre: nombre, ruta: c.ruta } };
  },

  sisatEliminar: (yo, d) => {
    soloMesa_(yo);
    const ciclo = cicloValido_(d.ciclo), m = String(momentoValido_(d.momento)), cct = String(d.cct || '');
    reemplazarTodo_('sis', leer_('sis').filter(x => !(x.ciclo === ciclo && String(x.momento) === m && x.cct === cct)));
    reemplazarTodo_('sia', leer_('sia').filter(x => !(x.ciclo === ciclo && String(x.momento) === m && x.cct === cct)));
    return { sis: leer_('sis') };
  },

  // Lista los PDF o imágenes de la carpeta «SISAT / Momento N» de la escuela en el Drive de evidencias
  // Con excel=true lista los Excel de la herramienta oficial (los .xls que exporta son páginas HTML).
  sisatArchivos: (yo, d) => {
    const cct = cctPermitido_(yo, d.cct);
    if (!d.excel) soloMesa_(yo);
    const m = momentoValido_(d.momento), c = carpetaSisat_(cct, m, false);
    if (!c.carpeta) return { archivos: [], ruta: c.ruta, mensaje: c.mensaje };
    const lista = [], it = c.carpeta.getFiles();
    while (it.hasNext()) {
      const a = it.next(), t = a.getMimeType();
      if (d.excel ? !esExcel_(a.getName(), t) : !/pdf|image\//.test(t)) continue;
      if (c.filtrar && !c.filtrar.test(a.getName())) continue;
      lista.push({ id: a.getId(), nombre: a.getName(), tipo: t, kb: Math.round(a.getSize() / 1024), fecha: Utilities.formatDate(a.getLastUpdated(), TZ, "yyyy-MM-dd'T'HH:mm") });
    }
    lista.sort((x, y) => y.fecha.localeCompare(x.fecha));
    return { archivos: lista, ruta: c.ruta };
  },

  // Lee con IA las gráficas del SisAT (un archivo del Drive o uno que se sube) y devuelve los números para revisarlos.
  // No guarda resultados: la Supervisión los revisa y luego pulsa «Guardar».
  sisatLeer: (yo, d) => {
    soloMesa_(yo);
    const m = momentoValido_(d.momento), cct = String(d.cct || '');
    let datos, tipo, nombre, archivoId = '';
    if (d.fileId) {
      const a = DriveApp.getFileById(String(d.fileId));
      if (a.getSize() > MAX_MB * 1024 * 1024) throw new Error('El archivo pesa más de ' + MAX_MB + ' MB.');
      datos = Utilities.base64Encode(a.getBlob().getBytes()); tipo = a.getMimeType(); nombre = a.getName(); archivoId = a.getId();
    } else {
      datos = String(d.datos || ''); tipo = d.tipo || 'application/pdf';
      nombre = String(d.nombre || 'SisAT.pdf').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 160);
      if (!datos) throw new Error('El archivo llegó vacío.');
      if (datos.length * 0.75 > MAX_MB * 1024 * 1024) throw new Error('El archivo pesa más de ' + MAX_MB + ' MB.');
      if (d.guardarEnDrive !== false && cct) {  // se guarda en la carpeta SISAT/Momento N de la escuela
        const c = carpetaSisat_(cct, m, true);
        if (c.carpeta) {
          const f = c.carpeta.createFile(Utilities.newBlob(Utilities.base64Decode(datos), tipo, nombre));
          f.setDescription(SUBIDO_POR + yo.nombre); archivoId = f.getId();
        }
      }
    }
    if (!/pdf|image\//.test(tipo)) throw new Error('Suba el PDF o las imágenes de las gráficas del SisAT.');
    const texto = gemini_(PROMPT_SISAT_(m), { archivo: datos, tipo: tipo, json: true, temperatura: 0, max: 16384 });
    let j;
    try { j = JSON.parse(texto.replace(/^```(json)?|```$/g, '').trim()); } catch (e) { throw new Error('La IA no devolvió datos legibles. Intente de nuevo o capture a mano.'); }
    const limpio = g => ({ etiqueta: String(g.grupo || g.etiqueta || ''), lec: niveles_(g.lec, true), tex: niveles_(g.tex, true), cal: niveles_(g.cal, true), tip: tipos_(g.tip, true) });
    return { leido: { grupos: (j.grupos || []).map(limpio), escuela: j.escuela ? limpio(j.escuela) : null,
      exploracion: j.exploracionUsada || m, notas: String(j.notas || '').slice(0, 600) }, archivo: { id: archivoId, nombre: nombre } };
  },

  /* ---- EIA (Ejercicios Integradores del Aprendizaje): resultados por grupo y por alumno ---- */

  // Guarda los grupos de UNA escuela en UN ciclo con la valoración (0 a 3) de cada alumno en cada criterio; reemplaza lo anterior de esa escuela y ciclo.
  // El concentrado de cada grupo (alumnos en 0, 1, 2 y 3 por criterio, y alumnos en rezago) se calcula aquí, a partir de los alumnos.
  eiaGuardar: (yo, d) => {
    const ciclo = cicloValido_(d.ciclo), cct = cctPermitido_(yo, d.cct);
    if (!leer_('dir').find(c => c.tipo === 'director' && c.cct === cct)) throw new Error('La escuela no está en el Directorio.');
    const vistos = {}, grupos = [], alumnos = [];
    (d.grupos || []).forEach(g => {
      const grado = String(g.grado || '').replace(/\D/g, '').slice(0, 1), grupo = String(g.grupo || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (!/^[1-6]$/.test(grado)) throw new Error('Grado no válido en uno de los grupos: «' + (g.grado || '') + '».');
      const k = grado + '-' + (grupo || 'U');
      if (vistos[k]) throw new Error('El grupo ' + grado + '° ' + grupo + ' aparece dos veces.');
      vistos[k] = 1;
      const largo = EIA_LARGO_[grado], als = [];
      (Array.isArray(g.alumnos) ? g.alumnos : []).slice(0, 80).forEach((a, i) => {
        const nombre = String(a.alumno || '').replace(/\s+/g, ' ').trim().slice(0, 120);
        if (!nombre) return;
        const v = [];
        for (let j = 0; j < largo; j++) { const x = (a.v || [])[j]; const n = x === null || x === undefined || x === '' ? null : Math.round(+x); v.push(n >= 0 && n <= 3 ? n : null); }
        const al = { id: [ciclo, cct, k, i + 1].join('|'), ciclo: ciclo, cct: cct, grado: grado, grupo: grupo, num: String(numero_(a.num) || i + 1), alumno: nombre,
          sexo: /^[HM]$/.test(String(a.sexo || '').toUpperCase()) ? String(a.sexo).toUpperCase() : '', v: v, cargadoPor: yo.id, actualizado: ahora_() };
        als.push(al); alumnos.push(al);
      });
      if (!als.length) return;
      const cr = []; for (let j = 0; j < largo; j++) cr.push([0, 0, 0, 0]);
      const rz = { r: 0, a: 0, g: 0 };
      als.forEach(a => {
        a.v.forEach((x, j) => { if (x !== null) cr[j][x]++; });
        const e = eiaEstado_(a.v); if (!e) return;
        if (e >= 0.5) rz.r++; if (e >= 0.75) rz.a++; if (e >= 0.3 && e < 0.5) rz.g++;
      });
      grupos.push({ id: [ciclo, cct, k].join('|'), ciclo: ciclo, cct: cct, grado: grado, grupo: grupo, n: String(als.length), cr: cr, rz: rz,
        fuente: String(d.fuente || '').slice(0, 200), cargadoPor: yo.id, actualizado: ahora_() });
    });
    if (!grupos.length) throw new Error('No hay alumnos con valoraciones que guardar.');
    reemplazarTodo_('eig', leer_('eig').filter(x => !(x.ciclo === ciclo && x.cct === cct)).concat(grupos));
    reemplazarTodo_('eia', leer_('eia').filter(x => !(x.ciclo === ciclo && x.cct === cct)).concat(alumnos));
    bitacora_('eia', cct, [], 'EIA ' + ciclo, grupos.length + ' grupos y ' + alumnos.length + ' alumnos guardados por ' + yo.nombre);
    return yo.rol === 'director' ? { eig: datosDirector_(yo).eig } : { eig: leer_('eig') };
  },

  // Valoraciones de cada alumno de UNA escuela en un ciclo. Se piden solo al consultar esa escuela.
  eiaAlumnos: (yo, d) => {
    const ciclo = cicloValido_(d.ciclo), cct = cctPermitido_(yo, d.cct);
    return { cct: cct, ciclo: ciclo, alumnos: leer_('eia').filter(x => x.ciclo === ciclo && x.cct === cct) };
  },

  // Lista los Excel (y .zip u hojas de cálculo de Google) de la carpeta «09-Ejercicios Integradores del Aprendizaje» de la escuela y sus subcarpetas
  eiaArchivos: (yo, d) => {
    const cct = cctPermitido_(yo, d.cct), c = carpetaEia_(cct, false);
    if (!c.carpeta) return { archivos: [], ruta: c.ruta, mensaje: c.mensaje };
    return { archivos: archivosEia_(c.carpeta, '', 0).sort((x, y) => y.fecha.localeCompare(x.fecha)), ruta: c.ruta };
  },

  // Devuelve el contenido de esos archivos para leerlos en la página (las hojas de Google se convierten a Excel)
  eiaBajar: (yo, d) => {
    const cct = cctPermitido_(yo, d.cct), c = carpetaEia_(cct, false);
    if (!c.carpeta) throw new Error(c.mensaje || 'La escuela no tiene carpeta de los EIA.');
    const permitidos = {};
    archivosEia_(c.carpeta, '', 0).forEach(a => { permitidos[a.id] = a; });
    let total = 0;
    const archivos = [], omitidos = [];
    (d.ids || []).slice(0, 40).forEach(id => {
      const p = permitidos[String(id)];
      if (!p) throw new Error('Uno de los archivos no está en la carpeta de los EIA de la escuela.');
      if (p.kb > 20 * 1024 || total + p.kb > 40 * 1024) { omitidos.push(p.nombre); return; }
      const f = DriveApp.getFileById(p.id);
      let bytes;
      if (p.tipo === MimeType.GOOGLE_SHEETS) {
        const r = UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/' + p.id + '/export?format=xlsx', { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
        if (r.getResponseCode() !== 200) { omitidos.push(p.nombre); return; }
        bytes = r.getContent();
      } else bytes = f.getBlob().getBytes();
      total += Math.round(bytes.length / 1024);
      archivos.push({ id: p.id, nombre: p.ruta + p.nombre + (p.tipo === MimeType.GOOGLE_SHEETS ? '.xlsx' : ''), tipo: p.tipo, fecha: p.fecha, datos: Utilities.base64Encode(bytes) });
    });
    return { archivos: archivos, omitidos: omitidos, ruta: c.ruta };
  },

  // Guarda en la carpeta de los EIA de la escuela un Excel que se sube desde la página
  eiaSubir: (yo, d) => {
    const cct = cctPermitido_(yo, d.cct), datos = String(d.datos || '');
    if (!datos) throw new Error('El archivo llegó vacío.');
    if (datos.length * 0.75 > MAX_MB * 1024 * 1024) throw new Error('El archivo pesa más de ' + MAX_MB + ' MB.');
    const nombre = String(d.nombre || 'EIA.xlsx').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 160) || 'EIA.xlsx';
    const c = carpetaEia_(cct, true);
    if (!c.carpeta) throw new Error(c.mensaje || 'No se encontró la carpeta de los EIA.');
    const f = c.carpeta.createFile(Utilities.newBlob(Utilities.base64Decode(datos), d.tipo || 'application/vnd.ms-excel', nombre));
    f.setDescription(SUBIDO_POR + yo.nombre);
    return { archivo: { id: f.getId(), nombre: nombre, ruta: c.ruta } };
  },

  // Observaciones y acciones de mejora por nivel: zona, grado de la zona, escuela, grado de la escuela o grupo
  sisatComentar: (yo, d) => {
    const ciclo = cicloValido_(d.ciclo), m = String(d.momento) === 't' ? 't' : String(momentoValido_(d.momento));
    const nivel = String(d.nivel || ''), ref = String(d.ref || '');
    if (['zona', 'zgrado', 'escuela', 'grado', 'grupo'].indexOf(nivel) < 0) throw new Error('Nivel no válido.');
    if (yo.rol === 'director') {
      const cct = cctDe_(yo);
      if (['escuela', 'grado', 'grupo'].indexOf(nivel) < 0 || ref.split('|')[0] !== cct) throw new Error('Solo puede comentar los resultados de su escuela.');
    }
    const previa = d.id ? buscar_('sic', d.id) : null;
    if (previa && previa.autor !== yo.id && yo.rol !== 'admin') throw new Error('Solo puede cambiar sus propias observaciones.');
    if (d.borrar) {
      if (!previa) return { sic: comentariosPara_(yo) };
      reemplazarTodo_('sic', leer_('sic').filter(x => x.id !== previa.id));
      return { sic: comentariosPara_(yo) };
    }
    const texto = String(d.texto || '').trim().slice(0, 4000);
    if (!texto) throw new Error('Escriba la observación.');
    guardar_('sic', { id: previa ? previa.id : 'sic-' + Utilities.getUuid().slice(0, 8), ciclo: ciclo, momento: m, nivel: nivel, ref: ref,
      tipo: d.tipo === 'accion' ? 'accion' : 'observacion', texto: texto, autor: previa ? previa.autor : yo.id, autorNombre: previa ? previa.autorNombre : yo.nombre,
      creado: previa ? previa.creado : ahora_(), actualizado: ahora_() });
    return { sic: comentariosPara_(yo) };
  },

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
  },


  /* ---- Directorio de personas para los oficios ---- */

  // Lee con la IA un directorio (PDF, foto o el texto de un Word o Excel) y devuelve las personas.
  // No guarda nada: la Supervisión decide qué guardar y las escuelas lo guardan en su dispositivo.
  leerDirectorio: (yo, d) => {
    const texto = String(d.texto || '').slice(0, 200000);
    let op = { json: true, temperatura: 0.1, max: 32768 };
    if (!texto) {
      const tipo = String(d.tipo || 'application/pdf');
      if (!/^(application\/pdf|image\/(png|jpeg|webp|heic|heif))$/.test(tipo)) throw new Error('Suba el directorio en PDF, Word, Excel o como foto (JPG o PNG).');
      if (!d.archivo) throw new Error('Falta el archivo.');
      if (Utilities.base64Decode(String(d.archivo)).length > 15 * 1024 * 1024) throw new Error('El archivo pesa más de 15 MB. Redúzcalo o divídalo.');
      op = Object.assign(op, { archivo: String(d.archivo), tipo: tipo });
    }
    const prompt = PROMPT_DIRECTORIO + (String(d.contexto || '').trim() ? '\n\nDato de quien lo sube (úselo para completar institución o grupo si el documento no lo dice): ' + String(d.contexto).slice(0, 300) : '') +
      (texto ? '\n\nCONTENIDO DEL DIRECTORIO (texto extraído; las columnas de tablas van separadas por tabuladores):\n' + texto : '');
    const r = gemini_(prompt, op);
    let j;
    try { j = JSON.parse(r.replace(/^```(json)?\s*/i, '').replace(/```\s*$/, '')); } catch (e) { throw new Error('La IA no pudo leer bien el directorio. Intente con un archivo más claro o con menos páginas.'); }
    const t = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
    const personas = (Array.isArray(j) ? j : j.personas || []).map(x => ({ nombre: t(x.nombre, 200), cargo: t(x.cargo, 300), institucion: t(x.institucion, 300),
      correo: t(x.correo, 200), telefono: t(x.telefono, 60), grupo: t(x.grupo, 60) })).filter(x => x.nombre);
    return { personas: personas };
  },

  // Guarda (o actualiza) personas en el directorio de oficios de la Supervisión; evita duplicados por nombre y cargo
  guardarDirOficios: (yo, d) => {
    soloMesa_(yo);
    const lista = leer_('per'), t = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
    const clave = x => (String(x.nombre) + '|' + String(x.cargo)).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9|]/g, '');
    const cambios = [];
    (d.personas || []).slice(0, 2000).forEach(x => {
      const o = { nombre: t(x.nombre, 200), cargo: t(x.cargo, 300), institucion: t(x.institucion, 300), correo: t(x.correo, 200), telefono: t(x.telefono, 60), grupo: t(x.grupo, 60), fuente: t(x.fuente, 200) };
      if (!o.nombre) return;
      const previo = (x.id && lista.find(p => p.id === x.id)) || lista.find(p => clave(p) === clave(o));
      if (previo) { ['institucion', 'correo', 'telefono', 'grupo', 'fuente'].forEach(k => { if (!o[k] && !x.id) o[k] = previo[k]; }); Object.assign(previo, o, { actualizado: ahora_() }); if (cambios.indexOf(previo) < 0) cambios.push(previo); }
      else { const n = Object.assign({ id: 'per-' + Utilities.getUuid().slice(0, 8), creadoPor: yo.id, creado: ahora_(), actualizado: ahora_() }, o); lista.push(n); cambios.push(n); }
    });
    if (cambios.length > 20) reemplazarTodo_('per', lista); else cambios.forEach(o => guardar_('per', o));
    return { per: leer_('per'), guardados: cambios.length };
  },
  /* ---- Directorio de dependencias (autoridades y dependencias que apoyan a las escuelas) ----
     Lo edita la Supervisión y la Mesa Técnica; los directores lo consultan en sus oficios. */

  // Guarda o actualiza registros (por id). «revisar: true» marca los registros como revisados hoy.
  guardarDep: (yo, d) => {
    soloMesa_(yo);
    const t = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
    const lista = leer_('dep'), cambios = [];
    (d.registros || []).slice(0, 1000).forEach(x => {
      const o = {};
      ['orden', 'municipio', 'dependencia', 'area', 'tratamiento', 'nombre', 'cargo', 'telefono', 'correo', 'domicilio', 'apoyo', 'fuente', 'vigente'].forEach(k => { if (x[k] !== undefined) o[k] = t(x[k], k === 'apoyo' || k === 'domicilio' || k === 'fuente' ? 500 : 300); });
      if (x.confirmar !== undefined) o.confirmar = !!x.confirmar;
      if (x.revisado) o.revisado = /^\d{4}-\d{2}-\d{2}$/.test(x.revisado) ? x.revisado : hoy_();
      if (d.revisar) { o.revisado = hoy_(); o.confirmar = false; }
      const previo = x.id ? lista.find(p => p.id === x.id) : null;
      if (previo) { Object.assign(previo, o, { activo: true, actualizado: ahora_(), actualizadoPor: yo.nombre }); cambios.push(previo); }
      else {
        if (!o.nombre && !o.cargo && !o.dependencia) return;
        const n = Object.assign({ id: x.id && /^dep-[\w-]+$/.test(x.id) ? x.id : 'dep-' + Utilities.getUuid().slice(0, 8), orden: '', municipio: '', dependencia: '', area: '', tratamiento: '', nombre: '', cargo: '',
          telefono: '', correo: '', domicilio: '', apoyo: '', fuente: 'A mano', vigente: '', revisado: hoy_(), confirmar: false }, o, { activo: true, actualizado: ahora_(), actualizadoPor: yo.nombre });
        lista.push(n); cambios.push(n);
      }
    });
    if (cambios.length > 20) reemplazarTodo_('dep', lista); else cambios.forEach(o => guardar_('dep', o));
    return { dep: leer_('dep').filter(x => x.activo), guardados: cambios.length };
  },
  // Carga el directorio base de la Supervisión (archivo datos/dependencias.json de la página). Solo agrega lo que falta:
  // no toca los registros que ya existan (para no perder correcciones hechas en Tequio).
  cargarDepBase: (yo, d) => {
    soloMesa_(yo);
    const lista = leer_('dep'), ids = {};
    lista.forEach(x => { ids[x.id] = 1; });
    const nuevos = (d.registros || []).filter(x => x && /^dep-\d{3}$/.test(x.id) && !ids[x.id]).slice(0, 1000).map(x => {
      const o = { activo: true, actualizado: ahora_(), actualizadoPor: yo.nombre };
      HOJAS.dep.forEach(k => { if (o[k] === undefined) o[k] = k === 'confirmar' ? !!x[k] : String(x[k] == null ? '' : x[k]).slice(0, 500); });
      return o;
    });
    if (nuevos.length) reemplazarTodo_('dep', lista.concat(nuevos));
    return { dep: leer_('dep').filter(x => x.activo), agregados: nuevos.length };
  },
  borrarDep: (yo, d) => {
    soloMesa_(yo);
    const ids = d.ids || [];
    const lista = leer_('dep');
    lista.forEach(x => { if (ids.indexOf(x.id) >= 0) { x.activo = false; x.actualizado = ahora_(); x.actualizadoPor = yo.nombre; } });
    reemplazarTodo_('dep', lista);
    return { dep: lista.filter(x => x.activo) };
  },

  /* ---- Informe de seguimiento por escuela (acuerdos, evidencias, SisAT y EIA) ----
     La página arma el informe (con el promedio de la zona) y aquí solo se envía: los destinatarios
     los pone el servidor (la dirección de la escuela y, si se pide, su ATP), no la página. */
  enviarInforme: (yo, d) => {
    soloMesa_(yo);
    const dir = leer_('dir'), usr = leer_('usr'), res = [], nuevos = [];
    (d.informes || []).slice(0, 30).forEach(x => {
      const c = dir.find(e => e.tipo === 'director' && e.cct === x.cct);
      if (!c) { res.push({ cct: x.cct, ok: false, mensaje: 'La escuela no está en el Directorio.' }); return; }
      const para = [c.correo1, c.correo2].map(m => String(m || '').trim()).filter(m => /@/.test(m));
      const atp = x.atpId ? usr.find(u => u.id === x.atpId && u.rol === 'atp') : null;
      const cc = d.copiaAtp && atp ? String(atp.correo || '').split(',').map(m => m.trim()).filter(m => /@/.test(m)) : [];
      const html = String(x.html || '').slice(0, 300000), asunto = String(x.asunto || 'Informe de seguimiento').slice(0, 200);
      let resultado = '';
      if (!para.length) resultado = 'Sin correo de la dirección en el Directorio; quedó guardado en Tequio.';
      else {
        try { MailApp.sendEmail({ to: para.join(','), cc: cc.join(','), subject: asunto, htmlBody: html, name: REMITENTE, replyTo: 'supervision050sep@gmail.com' }); resultado = 'Enviado'; }
        catch (e) { resultado = 'No se pudo enviar: ' + e.message; }
      }
      const o = { id: 'inf-' + Utilities.getUuid().slice(0, 8), cct: x.cct, fecha: hoy_(), asunto: asunto, cifras: x.cifras || {}, pendientes: (x.pendientes || []).slice(0, 60),
        html: comprimir_(html), atpId: atp ? atp.id : '', para: para.join(','), cc: cc.join(','), enviadoPor: yo.nombre, creado: ahora_(), resultado: resultado };
      nuevos.push(o);
      bitacora_('informe', x.cct, para.concat(cc), asunto, resultado);
      res.push({ cct: x.cct, ok: resultado === 'Enviado', mensaje: resultado });
    });
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try { guardarVarios_('inf', nuevos); } finally { lock.releaseLock(); }
    return { resultados: res, inf: leer_('inf').map(sinHtml_), cuota: MailApp.getRemainingDailyQuota() };
  },
  verInforme: (yo, d) => {
    const x = buscar_('inf', String(d.id || ''));
    if (!x) throw new Error('No se encontró el informe.');
    if (yo.rol === 'director' && x.cct !== cctDe_(yo)) throw new Error('Solo puede ver los informes de su escuela.');
    return { html: descomprimir_(x.html) };
  },
  // El director pide una aclaración o revisión; va a su ATP (le llega un correo) y la Supervisión la ve en Tequio
  crearAclaracion: (yo, d) => {
    if (yo.rol !== 'director') throw new Error('Las aclaraciones las solicita la dirección de la escuela.');
    const cct = cctDe_(yo);
    const mensaje = String(d.mensaje || '').trim().slice(0, 4000);
    if (!mensaje) throw new Error('Escriba qué no coincide o qué necesita que se revise.');
    const atp = leer_('usr').find(u => u.id === d.atpId && u.rol === 'atp');
    const o = { id: 'acl-' + Utilities.getUuid().slice(0, 8), cct: cct, informeId: String(d.informeId || '').slice(0, 40), tema: String(d.tema || 'Otro').slice(0, 60),
      ref: String(d.ref || '').slice(0, 400), mensaje: mensaje, atpId: atp ? atp.id : '', estado: 'abierta', respuestas: [], creadoPor: yo.id, creadoNombre: yo.nombre,
      creado: ahora_(), actualizado: ahora_(), resuelto: '' };
    guardar_('acl', o);
    const esc = (leer_('dir').find(c => c.tipo === 'director' && c.cct === cct) || {}).escuela || cct;
    avisoAclaracion_(atp ? atp.correo : '', 'Aclaración solicitada · ' + esc,
      '<p>La dirección de la Esc. Prim. «' + esc_(esc) + '» solicita una aclaración o revisión de su informe de seguimiento.</p>' +
      '<p><b>Tema:</b> ' + esc_(o.tema) + (o.ref ? '<br><b>Sobre:</b> ' + esc_(o.ref) : '') + '</p><p style="white-space:pre-line;background:#fff;border-left:4px solid #C2603A;padding:10px 12px">' + esc_(mensaje) + '</p>' +
      '<p>Por favor revísela y contéstela en Tequio › Seguimiento › Aclaraciones.</p>');
    return { acl: o };
  },
  // Responde una aclaración. La Mesa Técnica puede marcarla en revisión o resuelta; si el director vuelve a escribir, se reabre.
  responderAclaracion: (yo, d) => {
    const a = buscar_('acl', String(d.id || ''));
    if (!a) throw new Error('No se encontró la aclaración.');
    if (yo.rol === 'director' && a.cct !== cctDe_(yo)) throw new Error('Solo puede responder las aclaraciones de su escuela.');
    if (yo.rol !== 'director') soloMesa_(yo);
    const texto = String(d.texto || '').trim().slice(0, 4000);
    if (!texto && !d.estado) throw new Error('Escriba la respuesta.');
    if (texto) a.respuestas = (a.respuestas || []).concat([{ por: yo.nombre, rol: yo.rol, texto: texto, f: ahora_() }]);
    if (yo.rol === 'director') { if (a.estado === 'resuelta') a.estado = 'abierta'; }
    else if (['abierta', 'revision', 'resuelta'].indexOf(d.estado) >= 0) a.estado = d.estado;
    else if (texto && a.estado === 'abierta') a.estado = 'revision';
    a.resuelto = a.estado === 'resuelta' ? (a.resuelto || ahora_()) : '';
    a.actualizado = ahora_();
    guardar_('acl', a);
    const c = leer_('dir').find(x => x.tipo === 'director' && x.cct === a.cct) || {};
    if (texto) {
      if (yo.rol === 'director') { const atp = leer_('usr').find(u => u.id === a.atpId); avisoAclaracion_(atp ? atp.correo : '', 'Respuesta de la escuela · ' + (c.escuela || a.cct), '<p>La dirección de la Esc. Prim. «' + esc_(c.escuela || a.cct) + '» respondió a la aclaración sobre <b>' + esc_(a.tema) + '</b>:</p><p style="white-space:pre-line;background:#fff;border-left:4px solid #C2603A;padding:10px 12px">' + esc_(texto) + '</p><p>Puede contestar en Tequio › Seguimiento › Aclaraciones.</p>'); }
      else avisoAclaracion_([c.correo1, c.correo2].filter(Boolean).join(','), 'Respuesta a su aclaración · ' + a.tema, '<p>' + esc_(yo.nombre) + ' respondió a su solicitud de aclaración sobre <b>' + esc_(a.tema) + '</b>' + (a.estado === 'resuelta' ? ' y la marcó como <b>resuelta</b>' : '') + ':</p><p style="white-space:pre-line;background:#fff;border-left:4px solid #1F3A6B;padding:10px 12px">' + esc_(texto) + '</p><p>Si necesita agregar algo, puede contestar en Tequio › Mi escuela.</p>');
    }
    return { acl: a };
  },

  /* ---- Visitas de supervisión (guías de 3 visitas por ciclo, con fotos de evidencia) ----
     Cada escuela tiene una visita por número y ciclo (id: vis-CICLO-CCT-N). Las guías (temas) viven en la página;
     aquí se guarda, por tema: estado, observación de la Supervisión, nota y «listo» del director y las fotos. */

  // Supervisión y Mesa Técnica: guarda estados y observaciones; con «cerrar» registra el seguimiento (minuta y acuerdos).
  guardarVisita: (yo, d) => {
    soloMesa_(yo);
    const v = visitaDe_(yo, d);
    const previos = {}; (v.items || []).forEach(x => { previos[x.k] = x; });
    v.items = (d.items || []).filter(x => x && x.k).slice(0, 40).map(x => Object.assign({}, previos[x.k] || { fotos: [] }, {
      k: String(x.k).slice(0, 20), estado: ['cumple', 'proceso', 'acomp', 'na', ''].indexOf(x.estado) >= 0 ? x.estado : '', obs: String(x.obs || '').slice(0, 3000) }));
    Object.keys(previos).forEach(k => { if (!v.items.find(x => x.k === k)) v.items.push(previos[k]); });
    // temas agregados por la Supervisión (en cualquier visita; en las extraordinarias son todos sus temas)
    if (Array.isArray(d.temas)) v.temas = d.temas.filter(t => t && t.k && String(t.t || '').trim()).slice(0, 30).map(t => ({ k: String(t.k).slice(0, 20), t: String(t.t).slice(0, 200),
      r: (Array.isArray(t.r) ? t.r : String(t.r || '').split('\n')).map(x => String(x).trim()).filter(Boolean).slice(0, 15).map(x => x.slice(0, 300)), f: String(t.f || '').slice(0, 300) }));
    if (d.titulo !== undefined) v.titulo = String(d.titulo || '').slice(0, 200);
    v.fecha = /^\d{4}-\d{2}-\d{2}$/.test(d.fecha || '') ? d.fecha : (v.fecha || hoy_());
    v.resumen = String(d.resumen || '').slice(0, 6000);
    v.estado = d.cerrar ? 'cerrada' : (d.reabrir ? 'en curso' : (v.estado === 'cerrada' ? 'cerrada' : 'en curso'));
    v.actualizado = ahora_();
    let avisos = [], seg = null;
    if (d.cerrar) {
      v.cerradaPor = yo.nombre;
      const r = ACCIONES.guardarSeguimiento(yo, { id: v.segId || '', cct: v.cct, fecha: v.fecha, actividadId: d.actividadId || '', resumen: String(d.minuta || v.resumen || '').slice(0, 20000),
        acuerdos: d.acuerdos || [], enviarMinuta: !!d.enviarMinuta });
      seg = r.seg; avisos = r.avisos || []; v.segId = seg.id;
    }
    guardar_('vis', v);
    return { vis: v, seg: seg, avisos: avisos };
  },
  // Quita una visita extraordinaria que aún no se cierra (las fotos se quedan en el Drive)
  borrarVisita: (yo, d) => {
    soloMesa_(yo);
    const v = buscar_('vis', String(d.id || ''));
    if (!v) throw new Error('No se encontró la visita.');
    if (+v.numero <= 3) throw new Error('Las tres visitas del ciclo no se pueden quitar.');
    if (v.estado === 'cerrada') throw new Error('La visita ya se cerró y quedó registrada en el seguimiento.');
    reemplazarTodo_('vis', leer_('vis').filter(x => x.id !== v.id));
    return { vis: leer_('vis') };
  },
  // Director: deja una nota por tema y lo marca como listo para la visita
  prepararVisita: (yo, d) => {
    const v = visitaDe_(yo, d);
    if (v.estado === 'cerrada' && yo.rol === 'director') throw new Error('La visita ya se cerró. Si necesita agregar algo, avise a la Supervisión.');
    const it = itemVisita_(v, d.k);
    if (d.nota !== undefined) it.nd = String(d.nota || '').slice(0, 2000);
    if (d.listo !== undefined) it.listo = !!d.listo;
    if (v.estado === '' || v.estado === 'programada') v.estado = 'preparacion';
    v.actualizado = ahora_();
    guardar_('vis', v);
    return { vis: v };
  },
  // Sube una foto de evidencia de un tema a Drive: Supervisión 050 › Escuela › Visitas de supervisión › Visita N (ciclo)
  visitaFoto: (yo, d) => {
    const cct = cctPermitido_(yo, d.cct);
    const datos = String(d.datos || '');
    if (!datos) throw new Error('La foto llegó vacía.');
    if (datos.length * 0.75 > MAX_MB * 1024 * 1024) throw new Error('La foto pesa más de ' + MAX_MB + ' MB.');
    const n = Math.max(1, Math.min(30, +d.numero || 1)), ciclo = cicloVis_(d.ciclo);
    let carpetaId = String(d.carpetaId || '');
    if (!carpetaId) {
      const raiz = leer_('evi').find(e => e.cct === cct && !e.ruta);
      if (!raiz) throw new Error('No se encontró la carpeta de la escuela en el Drive. Pulse «Revisar ahora» en Evidencias e intente de nuevo.');
      const sub = (padre, nombre) => { const it = padre.getFoldersByName(nombre); return it.hasNext() ? it.next() : padre.createFolder(nombre); };
      carpetaId = sub(sub(DriveApp.getFolderById(raiz.carpetaId), 'Visitas de supervisión'), (n <= 3 ? 'Visita ' + n : 'Visita extraordinaria ' + (n - 3)) + ' · ' + ciclo).getId();
    }
    const nombre = String(d.nombre || 'foto.jpg').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 160) || 'foto.jpg';
    const f = DriveApp.getFolderById(carpetaId).createFile(Utilities.newBlob(Utilities.base64Decode(datos), d.tipo || 'image/jpeg', nombre));
    f.setDescription(SUBIDO_POR + yo.nombre);
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const v = visitaDe_(yo, { cct: cct, numero: n, ciclo: ciclo });
      v.carpetaId = carpetaId;
      const it = itemVisita_(v, d.k);
      it.fotos = (it.fotos || []).concat([{ id: f.getId(), n: nombre, por: yo.nombre, f: ahora_().slice(0, 16) }]).slice(-30);
      if (v.estado === '' || v.estado === 'programada') v.estado = 'preparacion';
      v.actualizado = ahora_();
      guardar_('vis', v);
      bitacora_('archivo', cct, [], nombre + ' → Visitas de supervisión/Visita ' + n, 'foto de visita subida por ' + yo.nombre);
      return { vis: v };
    } finally { lock.releaseLock(); }
  },
  // Quita una foto (la manda a la papelera del Drive, de donde se puede recuperar)
  quitarFotoVisita: (yo, d) => {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const v = visitaDe_(yo, d), it = itemVisita_(v, d.k);
      const foto = (it.fotos || []).find(x => x.id === d.id);
      if (!foto) throw new Error('No se encontró la foto.');
      if (yo.rol === 'director' && (v.estado === 'cerrada' || foto.por !== yo.nombre)) throw new Error('Solo puede quitar las fotos que subió usted antes de que se cierre la visita.');
      try { DriveApp.getFileById(d.id).setTrashed(true); } catch (e) {}
      it.fotos = it.fotos.filter(x => x.id !== d.id);
      v.actualizado = ahora_();
      guardar_('vis', v);
      return { vis: v };
    } finally { lock.releaseLock(); }
  },

  borrarDirOficios: (yo, d) => {
    soloMesa_(yo);
    const ids = d.ids || [];
    reemplazarTodo_('per', leer_('per').filter(p => ids.indexOf(p.id) < 0));
    return { per: leer_('per') };
  },

  /* ---- Oficios de la Supervisión ---- */

  // Guarda un oficio. Si es nuevo, le asigna el siguiente número del año (SE-050/047/2026).
  guardarOficio: (yo, d) => {
    soloMesa_(yo);
    const previo = d.id ? buscar_('ofi', d.id) : null;
    const o = Object.assign({}, previo || {}, {
      fecha: /^\d{4}-\d{2}-\d{2}$/.test(d.fecha || '') ? d.fecha : hoy_(),
      municipio: ['San Quintín', 'Ensenada', 'Otro', 'Directores', 'Directores Ensenada', 'Directores San Quintín', 'Multigrado'].indexOf(d.municipio) >= 0 ? d.municipio : 'Otro',
      destNombre: String(d.destNombre || '').slice(0, 200), destCargo: String(d.destCargo || '').slice(0, 300), destInst: String(d.destInst || '').slice(0, 300), destCorreo: String(d.destCorreo || '').slice(0, 500), recibidoId: String(d.recibidoId || '').slice(0, 100), recibidoNombre: String(d.recibidoNombre || '').slice(0, 200),
      escuelas: (d.escuelas || []).slice(0, 20), referencia: String(d.referencia || '').slice(0, 300), asunto: String(d.asunto || '').slice(0, 400),
      cuerpo: String(d.cuerpo || '').slice(0, 20000), ccp: String(d.ccp || '').slice(0, 2000),
      firma: yo.rol === 'admin' && !!d.firma, sello: yo.rol === 'admin' && !!d.sello, escala: String(d.escala || '1'),
      actualizado: ahora_()
    });
    if (!o.asunto.trim()) throw new Error('Escriba el asunto del oficio.');
    if (!previo) {
      const props = PropertiesService.getScriptProperties();
      const anio = o.fecha.slice(0, 4);
      const guardado = props.getProperty('OFI_ULTIMO');
      let ultimo = guardado !== null && guardado !== '' ? +guardado : ULTIMO_OFICIO_INICIAL;
      if ((props.getProperty('OFI_ANIO') || '2026') !== anio) ultimo = 0;  // cada año empieza en 001
      // si ese número ya se usó (por ejemplo, después de corregir el conteo), se toma el siguiente libre
      const usados = leer_('ofi').filter(x => String(x.anio) === anio).map(x => +x.numero);
      let n = ultimo + 1;
      while (usados.indexOf(n) >= 0) n++;
      props.setProperties({ OFI_ULTIMO: String(n), OFI_ANIO: anio });
      Object.assign(o, { id: 'ofi-' + anio + '-' + ('00' + n).slice(-3), numero: String(n), anio: anio, folio: folio_(n, anio),
        pdfId: '', envios: [], creadoPor: yo.id, creado: ahora_() });
    }
    guardar_('ofi', o);
    return { oficio: o, ofiCfg: cfgOficios_() };
  },

  // Redacta el cuerpo del oficio con Gemini a partir del asunto y las notas
  redactarOficio: (yo, d) => {
    soloMesa_(yo);
    if (!String(d.asunto || '').trim()) throw new Error('Escriba primero el asunto.');
    const esc = leer_('dir').filter(c => c.tipo === 'director' && (d.escuelas || []).indexOf(c.cct) >= 0)
      .map(c => 'Esc. Prim. «' + c.escuela + '» (C.C.T. ' + c.cct + ', ' + c.municipio + ')');
    const prompt = INSTRUCCIONES_OFICIO +
      '\n\nDATOS DEL OFICIO\n' +
      '- Destinatario: ' + [d.destNombre, d.destCargo, d.destInst].filter(Boolean).join(', ') + '\n' +
      (['Directores', 'Directores Ensenada', 'Directores San Quintín', 'Multigrado'].indexOf(d.municipio) >= 0 ? '- Va dirigido a varios directores a la vez: diríjase a ellos en plural (ustedes), como circular de la Supervisión.\n' : '') +
      '- Asunto: ' + d.asunto + '\n' +
      (d.referencia ? '- Referencia: ' + d.referencia + '\n' : '') +
      (esc.length ? '- Escuelas relacionadas: ' + esc.join('; ') + '\n' : '') +
      '- Fecha del oficio: ' + fechaLarga_(d.fecha || hoy_()) + '\n' +
      '- Notas de la Supervisión (información que debe incluirse): ' + (String(d.notas || '').trim() || '(sin notas; redacte con base en el asunto)') + '\n' +
      (String(d.cuerpo || '').trim() ? '- Borrador actual (mejórelo conservando los datos): ' + d.cuerpo + '\n' : '');
    return { texto: gemini_(prompt) };
  },

  // Lee con la IA un oficio que recibió la Supervisión (de quien sea: director, docente, padre de familia, autoridad, dependencia...),
  // lo archiva y propone la respuesta al remitente (modo «responder») o el oficio de seguimiento a la autoridad que corresponde (modo «turnar»)
  analizarOficioRecibido: (yo, d) => {
    soloMesa_(yo);
    const tipo = String(d.tipo || 'application/pdf');
    if (!/^(application\/pdf|image\/(png|jpeg|webp|heic|heif))$/.test(tipo)) throw new Error('Suba el oficio en PDF o como foto (JPG o PNG).');
    if (!d.archivo) throw new Error('Falta el archivo.');
    const datos = Utilities.base64Decode(String(d.archivo));
    if (datos.length > 15 * 1024 * 1024) throw new Error('El archivo pesa más de 15 MB. Redúzcalo o escanéelo con menos resolución.');
    const nombre = hoy_() + ' · ' + String(d.nombre || 'Oficio recibido').replace(/[\\/:*?"<>|]+/g, ' ').slice(0, 120);
    const f = carpetaRecibidos_().createFile(Utilities.newBlob(datos, tipo, nombre));
    f.setDescription('Oficio recibido, subido a Tequio por ' + yo.nombre);
    const escuelas = leer_('dir').filter(c => c.tipo === 'director')
      .map(c => '- ' + c.escuela + ' | C.C.T. ' + c.cct + ' | ' + c.municipio + ' | ' + (c.multigrado ? 'multigrado' : 'organización completa') + ' | ' + (c.cargo || 'Director(a)') + ': ' + c.nombre).join('\n');
    const modo = d.modo === 'turnar' ? 'turnar' : 'responder';
    const prompt = INSTRUCCIONES_RECIBIDO + '\n\n' + MODOS_RECIBIDO[modo] + '\n\nESCUELAS DE LA ZONA 050\n' + escuelas + '\n\nFecha de hoy: ' + fechaLarga_(hoy_()) +
      (String(d.notas || '').trim() ? '\n\nIndicaciones del Supervisor: ' + String(d.notas).trim() : '') +
      '\n\n' + INSTRUCCIONES_OFICIO.replace('Escriba SOLO el cuerpo del oficio', 'En el campo «cuerpo» escriba SOLO el cuerpo del oficio').replace('Responda únicamente con el texto del cuerpo.', '') +
      '\n\n' + FORMATO_RECIBIDO;
    let a;
    const texto = gemini_(prompt, { archivo: String(d.archivo), tipo: tipo, json: true });
    try { a = JSON.parse(texto.replace(/^```(json)?\s*/i, '').replace(/```\s*$/, '')); } catch (e) { throw new Error('La IA no pudo leer bien el oficio. Intente de nuevo o revise que el archivo sea legible.'); }
    a.modo = modo;
    a.recibidoId = f.getId();
    a.recibidoNombre = nombre;
    return { analisis: a };
  },

  // Guarda el PDF del oficio en el Drive de la Supervisión (carpeta «Oficios Tequio»)
  archivarOficio: (yo, d) => {
    soloMesa_(yo);
    return { oficio: archivar_(d.id, d.pdf) };
  },

  // Envía el oficio por correo (con el PDF adjunto) desde la cuenta de la Supervisión
  enviarOficio: (yo, d) => {
    soloMesa_(yo);
    const para = String(d.para || '').split(/[,;\s]+/).map(x => x.trim().toLowerCase()).filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));
    if (!para.length) throw new Error('Escriba al menos un correo válido.');
    if (MailApp.getRemainingDailyQuota() < para.length) throw new Error('Hoy ya no quedan envíos de correo disponibles. Intente mañana o envíelo desde su correo.');
    const o = archivar_(d.id, d.pdf);
    const pdf = DriveApp.getFileById(o.pdfId).getBlob().setName(o.folio.replace(/\//g, '-') + '.pdf');
    const adjuntos = [pdf];
    if (d.adjuntarRecibido && o.recibidoId) { try { const r = DriveApp.getFileById(o.recibidoId); adjuntos.push(r.getBlob().setName('Anexo · ' + r.getName())); } catch (e) {} }
    const asunto = String(d.asuntoCorreo || ('Oficio ' + o.folio + ' · ' + o.asunto)).slice(0, 250);
    const cuerpo = String(d.mensaje || '').trim() || ('Por este medio le hago llegar el oficio ' + o.folio + '. Asunto: ' + o.asunto + '.');
    const html = '<div style="font:15px/1.6 Arial,sans-serif;color:#1E2A40">' + esc_(cuerpo).replace(/\n/g, '<br>') +
      '<p style="margin-top:18px;color:#555">Supervisión Escolar Zona 050 · Primaria Federalizada · ISEP<br>Camalú, San Quintín, B.C. · Tel. 616 165 5622</p></div>';
    // Los ATP envían siempre desde la cuenta de la Supervisión; el Supervisor puede elegir su correo institucional
    let de = CORREO_SUPERVISION, nota = '';
    if (yo.rol === 'admin' && d.de === CORREO_INSTITUCIONAL) {
      let alias = [];
      try { alias = GmailApp.getAliases().map(x => x.toLowerCase()); } catch (e) {}
      if (alias.indexOf(CORREO_INSTITUCIONAL) >= 0) {
        GmailApp.sendEmail(para.join(','), asunto, cuerpo, { from: CORREO_INSTITUCIONAL, name: 'Mtro. Carlos Gabriel Ortega Gutiérrez', replyTo: CORREO_INSTITUCIONAL, htmlBody: html, attachments: adjuntos });
        de = CORREO_INSTITUCIONAL;
      } else {
        nota = CORREO_INSTITUCIONAL + ' aún no está dada de alta en el Gmail de la Supervisión: se envió desde ' + CORREO_SUPERVISION + ' y las respuestas le llegarán a ' + CORREO_INSTITUCIONAL + '.';
      }
    }
    if (de === CORREO_SUPERVISION) {
      const institucional = yo.rol === 'admin' && d.de === CORREO_INSTITUCIONAL;
      MailApp.sendEmail({ to: para.join(','), subject: asunto, name: institucional ? 'Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Zona 050' : 'Supervisión Escolar Zona 050',
        replyTo: institucional ? CORREO_INSTITUCIONAL : CORREO_SUPERVISION, attachments: adjuntos, htmlBody: html });
    }
    const envio = { f: ahora_(), por: 'correo', de: de, a: para.join(', '), u: yo.id };
    // el correo queda guardado con el destinatario para los siguientes oficios
    if (['Directores', 'Directores Ensenada', 'Directores San Quintín', 'Multigrado'].indexOf(o.municipio) < 0) o.destCorreo = para.join(', ');
    try { envio.copia = guardarCorreo_(o, envio, asunto, cuerpo, yo); } catch (e) { nota = (nota ? nota + ' ' : '') + 'No se pudo guardar la copia del correo en el Drive.'; }
    o.envios = (o.envios || []).concat([envio]);
    guardar_('ofi', o);
    bitacora_('oficio', o.id, para, 'Oficio ' + o.folio, 'enviado por ' + yo.nombre + ' desde ' + de);
    return { oficio: o, cuota: MailApp.getRemainingDailyQuota(), nota: nota };
  },

  // Número con el que sigue el conteo (Supervisión y ATP), por si se hicieron oficios fuera de Tequio
  numeroOficio: (yo, d) => {
    soloMesa_(yo);
    const n = parseInt(d.ultimo, 10);
    if (!(n >= 0 && n < 999)) throw new Error('El número de oficio no es válido.');
    PropertiesService.getScriptProperties().setProperties({ OFI_ULTIMO: String(n), OFI_ANIO: String(d.anio || hoy_().slice(0, 4)) });
    bitacora_('oficio', 'numero', [], 'Conteo de oficios', 'el siguiente será ' + (n + 1) + ', cambiado por ' + yo.nombre);
    return { ofiCfg: cfgOficios_() };
  },

  // Configuración de oficios (solo Supervisión): último número, clave de Gemini, firma y sello
  configOficios: (yo, d) => {
    soloAdmin_(yo);
    const props = PropertiesService.getScriptProperties();
    if (d.ultimo != null && d.ultimo !== '') {
      const n = parseInt(d.ultimo, 10);
      if (!(n >= 0)) throw new Error('El número de oficio no es válido.');
      props.setProperties({ OFI_ULTIMO: String(n), OFI_ANIO: String(d.anio || hoy_().slice(0, 4)) });
    }
    if (d.geminiKey != null) {
      if (String(d.geminiKey).trim()) { props.setProperty('GEMINI_KEY', String(d.geminiKey).trim()); props.deleteProperty('GEMINI_MODELO'); }
      else props.deleteProperty('GEMINI_KEY');
    }
    ['firma', 'sello'].forEach(k => {
      if (!d[k]) return;
      const carpeta = carpetaRecursos_();
      const previo = props.getProperty(k.toUpperCase() + '_ID');
      if (previo) { try { DriveApp.getFileById(previo).setTrashed(true); } catch (e) {} }
      const f = carpeta.createFile(Utilities.newBlob(Utilities.base64Decode(d[k]), 'image/png', k + '-supervision.png'));
      props.setProperty(k.toUpperCase() + '_ID', f.getId());
    });
    if (d.geminiKey && String(d.geminiKey).trim()) gemini_('Responda solo con la palabra: listo');  // prueba la clave
    return { ofiCfg: cfgOficios_() };
  },

  // Imágenes de firma y sello para armar el oficio (solo Supervisión)
  recursosOficio: (yo) => {
    soloAdmin_(yo);
    const props = PropertiesService.getScriptProperties(), r = {};
    ['firma', 'sello'].forEach(k => {
      const id = props.getProperty(k.toUpperCase() + '_ID');
      if (id) { try { r[k] = Utilities.base64Encode(DriveApp.getFileById(id).getBlob().getBytes()); } catch (e) {} }
    });
    return r;
  }
};

/* ===================== Oficios ===================== */

// Último oficio hecho antes de usar Tequio (el primero de Tequio será el siguiente)
const PROMPT_DIRECTORIO = [
  'Usted recibe un directorio de personas: puede ser una lista, una tabla, un organigrama, la foto de una hoja o la de un pizarrón. Pueden ser autoridades, funcionarios, directivos, docentes, padres de familia o cualquier otra persona.',
  'Extraiga CADA persona que aparezca, sin inventar ni omitir a nadie. Para cada una devuelva:',
  '- nombre: el nombre completo tal como aparece, con su título abreviado si lo trae (C., Profr., Profra., Mtro., Mtra., Lic., Dr., Dra., Ing., Arq.). No agregue títulos que no aparezcan.',
  '- cargo: el puesto o la función (por ejemplo «Jefe del Departamento de Educación Primaria», «Docente de 3.° A», «Presidenta del Consejo de Participación Escolar»). Si es docente y trae grado y grupo, inclúyalos.',
  '- institucion: la dependencia, escuela u organismo, si aparece (con su C.C.T. si la trae). Si el documento entero es de una misma institución, póngala en todos.',
  '- correo y telefono si aparecen; si no, cadena vacía.',
  '- grupo: una etiqueta breve para clasificarla, por ejemplo Autoridades, Directivos, Docentes, Personal de apoyo, Padres de familia u Otros.',
  'Corrija solo errores evidentes de lectura (acentos, letras confundidas). Escriba nombres y cargos con mayúsculas y minúsculas normales, no todo en mayúsculas.',
  'Ignore encabezados, logotipos, números de página y totales.',
  'Responda ÚNICAMENTE con JSON: {"personas":[{"nombre":"","cargo":"","institucion":"","correo":"","telefono":"","grupo":""}]}'
].join('\n');

const ULTIMO_OFICIO_INICIAL = 46;

const INSTRUCCIONES_RECIBIDO = [
  'Usted apoya al Mtro. Carlos Gabriel Ortega Gutiérrez, Supervisor Escolar de la Zona 050 (Primaria Federalizada, ISEP, Baja California). Se adjunta un oficio o escrito que recibió la Supervisión. Puede enviarlo cualquier persona o institución, sin importar su cargo: un director o directora, un docente, un ATP, un padre o madre de familia, el comité o consejo de participación, una autoridad educativa (jefes de departamento, otras supervisiones, oficinas del ISEP o de la SEP), un ayuntamiento o delegación, otra dependencia (salud, Protección Civil, seguridad, CFE, comisión de agua), un sindicato, una asociación o un particular.',
  'Léalo con cuidado y determine: quién lo firma (nombre, cargo e institución), si tiene relación con alguna escuela de la zona, qué plantea y qué solicita.',
  'Autoridades inmediatas del Supervisor: en el municipio de San Quintín, el C. HUMBERTO GARCÍA SOLORIO, Jefe del Departamento de Educación Primaria en San Quintín (ISEP); en el municipio de Ensenada, el PROFR. ARTURO AGUILAR CITAL, Jefe del Departamento de Educación Primaria en Ensenada (ISEP). Nunca mezcle municipios.'
].join('\n');

// Lo que se pide redactar según lo que quiera hacer el Supervisor con el oficio recibido
const MODOS_RECIBIDO = {
  responder: [
    'TAREA: redacte el oficio de RESPUESTA que el Supervisor le enviará a quien firmó el escrito, sea quien sea.',
    'El destinatario es el remitente: use su nombre, cargo e institución tal como aparecen en el escrito (si es un particular o padre de familia sin cargo, deje el cargo vacío o use «Padre/Madre de familia de la Esc. Prim. «...»» si se identifica la escuela).',
    'En el cuerpo haga referencia a su escrito (número y fecha si los tiene), dé respuesta puntual a cada planteamiento o petición, indique con claridad lo que la Supervisión hará, lo que no le compete y ante quién debe acudir, y los pasos o plazos si corresponden. Si falta información para responder algo, dígalo con respeto y pídala. Tono institucional, respetuoso y cercano; adapte el registro al cargo del destinatario. No copie textual el escrito.',
    'En «autoridad» ponga «San Quintín» o «Ensenada» SOLO si el remitente es el Jefe de Departamento de ese municipio; en cualquier otro caso ponga «Otro».'
  ].join('\n'),
  turnar: [
    'TAREA: redacte el oficio de SEGUIMIENTO o turno que el Supervisor enviará a la autoridad a la que le compete atender el asunto.',
    'Si el asunto es de una escuela de San Quintín, la autoridad es el Jefe de Departamento de San Quintín; si es de Ensenada, el de Ensenada. Solo si claramente compete a otra dependencia (ayuntamiento, comisión de agua, CFE, Protección Civil, Seguridad Pública, etc.) indique autoridad «Otro» con los datos de esa dependencia en «otraDependencia», y mencione en «motivoAutoridad» si conviene marcar copia al Jefe de Departamento.',
    'En el cuerpo haga referencia al escrito recibido (quién lo firma, número y fecha si los tiene), exponga el planteamiento de forma objetiva y solicite con respeto la atención o intervención que corresponda. No copie textual el escrito. En «ccp» incluya a quien envió el escrito, para su conocimiento.'
  ].join('\n')
};

const FORMATO_RECIBIDO = [
  'Responda SOLO con un objeto JSON válido, sin texto adicional, con estas claves:',
  '{"escuelaCct": "C.C.T. de la escuela de la lista con la que tiene relación, o vacío", "escuelaNombre": "", "remitente": "nombre y cargo de quien firma, en una línea", "remitenteDatos": {"nombre": "nombre con su título (Profr., Lic., C., etc.)", "cargo": "cargo, o vacío si no tiene", "institucion": "escuela, dependencia u organización, o vacío", "correo": "correo si aparece en el escrito, o vacío", "municipio": "San Quintín | Ensenada | otro | vacío"}, "tipoRemitente": "director | docente | padre de familia | autoridad educativa | otra dependencia | sindicato | particular | otro", "oficioRemitente": "número y fecha del escrito recibido, si aparecen", "resumen": "2 a 4 renglones con lo que plantea", "peticiones": ["lo que solicita, una por elemento"], "autoridad": "San Quintín | Ensenada | Otro", "otraDependencia": {"nombre": "", "cargo": "", "dependencia": ""}, "motivoAutoridad": "a quién le compete atender el asunto y por qué", "asunto": "asunto breve del oficio que se redacta", "referencia": "Escrito u oficio [número] de [remitente], de fecha ..., o vacío", "cuerpo": "cuerpo del oficio, párrafos separados por \\n\\n", "ccp": "copias sugeridas, una por renglón separadas por \\n, terminando con «Archivo.»"}',
  'Si el documento no es legible o no es un oficio o escrito, responda el JSON con «resumen» explicando el problema y los demás campos vacíos.'
].join('\n');

const INSTRUCCIONES_OFICIO = [
  'Usted redacta oficios de la Supervisión Escolar Zona 050 (Primaria Federalizada, ISEP, Baja California), firmados por el Mtro. Carlos Gabriel Ortega Gutiérrez, Supervisor Escolar.',
  'Escriba SOLO el cuerpo del oficio: sin encabezado, sin fecha, sin número, sin destinatario, sin «PRESENTE», sin «ATENTAMENTE», sin firma y sin copias.',
  'Estilo: español formal administrativo de México, claro y respetuoso, en primera persona del supervisor («me permito informarle», «solicito respetuosamente»).',
  'Estructura: 2 a 4 párrafos. Inicie con «Por medio del presente,» o «Por este conducto,». Desarrolle los hechos o la solicitud con precisión. Cierre con una fórmula como «Lo anterior para su conocimiento y lo que estime conducente. Sin otro particular, le envío un cordial saludo.» o «Sin otro particular por el momento, agradezco de antemano su atención y le envío un cordial saludo.».',
  'Si hay varias escuelas o datos en lista, puede usar viñetas sencillas iniciando cada renglón con «• ».',
  'No invente fechas, cifras, nombres, números de oficio ni hechos que no estén en los datos. Si falta un dato indispensable, deje un espacio entre corchetes, por ejemplo [fecha].',
  'Las escuelas se nombran como Esc. Prim. «Nombre» con su C.C.T. cuando se proporcionen.',
  'Separe cada párrafo con una línea en blanco. No use negritas, asteriscos, títulos ni formato Markdown. Responda únicamente con el texto del cuerpo.'
].join('\n');

function soloMesa_(u) { if (u.rol !== 'admin' && u.rol !== 'atp') throw new Error('Solo la Supervisión y la Mesa Técnica pueden hacer esto.'); }
function folio_(n, anio) { return 'SE-050/' + ('00' + n).slice(-3) + '/' + anio; }

function cfgOficios_() {
  const p = PropertiesService.getScriptProperties();
  const anio = p.getProperty('OFI_ANIO') || '2026';
  const g = p.getProperty('OFI_ULTIMO'), ultimo = g !== null && g !== '' ? +g : ULTIMO_OFICIO_INICIAL;
  const anioHoy = hoy_().slice(0, 4);
  const sig = anio === anioHoy ? ultimo + 1 : 1;
  return { ultimo: ultimo, anio: anio, siguiente: folio_(sig, anioHoy), ia: !!p.getProperty('GEMINI_KEY'), modelo: p.getProperty('GEMINI_MODELO') || '',
    firma: !!p.getProperty('FIRMA_ID'), sello: !!p.getProperty('SELLO_ID'), remitentes: [CORREO_SUPERVISION, CORREO_INSTITUCIONAL] };
}

const CORREO_SUPERVISION = 'supervision050sep@gmail.com';
const CORREO_INSTITUCIONAL = 'cortegagutierrez@bcedu.mx';

function carpetaPorNombre_(padre, nombre) {
  const it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : padre.createFolder(nombre);
}
// «Documentos/Oficios Tequio» en el Drive de la Supervisión (si no existe «Documentos», en la raíz)
function carpetaOficios_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('OFI_CARPETA');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const raiz = DriveApp.getRootFolder();
  const docs = raiz.getFoldersByName('Documentos');
  const f = carpetaPorNombre_(docs.hasNext() ? docs.next() : raiz, 'Oficios Tequio');
  p.setProperty('OFI_CARPETA', f.getId());
  return f;
}
// «Oficios Tequio/Correos enviados/AAAA»: una copia en PDF de cada correo enviado desde Tequio
function carpetaCorreos_(anio) {
  return carpetaPorNombre_(carpetaPorNombre_(carpetaOficios_(), 'Correos enviados'), String(anio || hoy_().slice(0, 4)));
}
function guardarCorreo_(o, envio, asunto, cuerpo, yo) {
  const fila = (k, v) => '<tr><td style="padding:4px 12px 4px 0;color:#555;white-space:nowrap;vertical-align:top"><b>' + k + '</b></td><td style="padding:4px 0">' + esc_(v) + '</td></tr>';
  const html = '<html><body style="font:12px/1.5 Arial,sans-serif;color:#1E2A40;margin:30px">' +
    '<div style="font-size:11px;color:#555;border-bottom:2px solid #1F2A44;padding-bottom:6px;margin-bottom:12px">SUPERVISIÓN ESCOLAR ZONA 050 · Copia de correo enviado desde Tequio</div>' +
    '<table style="border-collapse:collapse;margin-bottom:14px">' + fila('Fecha', envio.f.replace('T', ' ').slice(0, 16)) + fila('De', envio.de) + fila('Para', envio.a) +
    fila('Asunto', asunto) + fila('Adjunto', o.folio.replace(/\//g, '-') + '.pdf') + fila('Oficio', o.folio + ' · ' + o.asunto) + fila('Enviado por', yo.nombre) + '</table>' +
    '<div style="border-top:1px solid #ccc;padding-top:12px">' + esc_(cuerpo).replace(/\n/g, '<br>') + '</div>' +
    (o.pdfId ? '<p style="margin-top:20px;font-size:11px;color:#555">El oficio en PDF está en el Drive: https://drive.google.com/file/d/' + o.pdfId + '/view</p>' : '') + '</body></html>';
  const nombre = envio.f.slice(0, 16).replace('T', ' ').replace(':', '') + ' · ' + o.folio.replace(/\//g, '-') + ' · ' + envio.a.split(',')[0].slice(0, 60) + '.pdf';
  const f = carpetaCorreos_(envio.f.slice(0, 4)).createFile(Utilities.newBlob(html, 'text/html', 'correo.html').getAs('application/pdf').setName(nombre));
  return f.getId();
}
// «Oficios Tequio/Recibidos/AAAA»: los oficios que recibe la Supervisión (de quien sea) y se suben a Tequio
function carpetaRecibidos_() {
  return carpetaPorNombre_(carpetaPorNombre_(carpetaOficios_(), 'Recibidos'), hoy_().slice(0, 4));
}
function carpetaRecursos_() { return carpetaPorNombre_(DriveApp.getRootFolder(), 'Tequio · Recursos (no compartir)'); }

function archivar_(id, pdf) {
  const o = buscar_('ofi', id);
  if (!o) throw new Error('Oficio no encontrado. Guárdelo primero.');
  if (!pdf) { if (!o.pdfId) throw new Error('Falta el PDF del oficio.'); return o; }
  const datos = Utilities.base64Decode(String(pdf));
  const nombre = o.folio.replace(/\//g, '-') + ' · ' + String(o.asunto).replace(/[\\/:*?"<>|]+/g, ' ').slice(0, 80) + '.pdf';
  if (o.pdfId) { try { DriveApp.getFileById(o.pdfId).setTrashed(true); } catch (e) {} }
  const f = carpetaOficios_().createFile(Utilities.newBlob(datos, 'application/pdf', nombre));
  f.setDescription('Generado en Tequio');
  o.pdfId = f.getId();
  o.actualizado = ahora_();
  guardar_('ofi', o);
  return o;
}

/* Gemini (Google AI Studio). La clave se guarda solo en las propiedades del servidor. */
function gemini_(prompt, op) {
  op = op || {};
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_KEY');
  if (!key) throw new Error('Falta configurar la clave de Gemini en Oficios → Configuración.');
  for (let intento = 0; intento < 2; intento++) {
    const modelo = modeloGemini_(key, intento > 0);
    const r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent?key=' + encodeURIComponent(key), {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ contents: [{ role: 'user', parts: (op.archivo ? [{ inline_data: { mime_type: op.tipo || 'application/pdf', data: op.archivo } }] : []).concat([{ text: prompt }]) }],
        generationConfig: Object.assign({ temperature: op.temperatura == null ? 0.4 : op.temperatura, maxOutputTokens: op.max || 8192 }, op.json ? { responseMimeType: 'application/json' } : {}) })
    });
    const c = r.getResponseCode();
    if (c === 404 && intento === 0) { PropertiesService.getScriptProperties().deleteProperty('GEMINI_MODELO'); continue; }
    let j = {};
    try { j = JSON.parse(r.getContentText()); } catch (e) {}
    if (c === 429) throw new Error('Se alcanzó el límite gratuito de Gemini por ahora. Espere un minuto e intente de nuevo.');
    if (c === 400 || c === 403) throw new Error('Gemini rechazó la clave. Revísela en Oficios → Configuración.' + (j.error && j.error.message ? ' (' + j.error.message + ')' : ''));
    if (c !== 200) throw new Error('Gemini no respondió (' + c + '). Intente de nuevo.');
    const partes = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    const texto = partes.map(x => x.text || '').join('').replace(/\*\*/g, '').trim();
    if (!texto) throw new Error('Gemini no devolvió texto. Agregue más detalles en las notas e intente de nuevo.');
    return texto;
  }
}

// Elige el modelo «Flash» más reciente disponible para la clave y lo recuerda
function modeloGemini_(key, forzar) {
  const p = PropertiesService.getScriptProperties();
  if (!forzar && p.getProperty('GEMINI_MODELO')) return p.getProperty('GEMINI_MODELO');
  let elegido = 'gemini-2.5-flash';
  try {
    const r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' + encodeURIComponent(key), { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      const ms = (JSON.parse(r.getContentText()).models || [])
        .filter(m => (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0)
        .map(m => String(m.name).replace(/^models\//, ''))
        .filter(n => /^gemini-\d/.test(n) && /flash/.test(n) && !/(lite|image|tts|audio|live|embedding|robotics|computer|thinking)/.test(n));
      const ver = n => parseFloat((n.match(/^gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
      const estables = ms.filter(n => !/(exp|preview)/.test(n));
      const lista = (estables.length ? estables : ms).sort((a, b) => ver(b) - ver(a) || a.length - b.length);
      if (lista.length) elegido = lista[0];
    }
  } catch (e) {}
  p.setProperty('GEMINI_MODELO', elegido);
  return elegido;
}

/** Ejecute esta función UNA vez después de actualizar: da permiso para crear los PDF y conectarse a Gemini. */
function autorizarOficios() {
  const f = carpetaOficios_();
  carpetaRecursos_();
  carpetaCorreos_();
  carpetaRecibidos_();
  UrlFetchApp.fetch('https://generativelanguage.googleapis.com/', { muteHttpExceptions: true });
  let alias = [];
  try { alias = GmailApp.getAliases().map(x => x.toLowerCase()); } catch (e) {}
  Logger.log(alias.indexOf(CORREO_INSTITUCIONAL) >= 0 ? 'Su correo ' + CORREO_INSTITUCIONAL + ' ya está dado de alta: Tequio podrá enviar desde él.'
    : 'Aviso: ' + CORREO_INSTITUCIONAL + ' todavía no está dado de alta en «Enviar como» del Gmail de la Supervisión. Mientras tanto, los oficios saldrán de ' + CORREO_SUPERVISION + ' con respuestas a su correo institucional.');
  Logger.log('Listo. Los oficios se guardarán en la carpeta «' + f.getName() + '» del Drive. El siguiente número es ' + cfgOficios_().siguiente + '.');
}

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
    // SisAT: su escuela completa; de las demás solo los números por grado, sin decir de qué escuela son (para el promedio de la zona)
    sis: leer_('sis').map((x, i) => x.cct === cct ? x : { id: 'z' + i, ciclo: x.ciclo, momento: x.momento, cct: '', grado: x.grado, grupo: '', lec: x.lec, tex: x.tex, cal: x.cal, tip: x.tip, comp: x.comp }),
    sic: comentariosPara_(yo),
    // EIA: igual que el SisAT, su escuela completa y de las demás solo los números por grado
    eig: leer_('eig').map((x, i) => x.cct === cct ? x : { id: 'z' + i, ciclo: x.ciclo, cct: '', grado: x.grado, grupo: '', n: x.n, cr: x.cr, rz: x.rz }),
    // el directorio de dependencias de la Supervisión (solo lectura) para elegir destinatarios en los oficios de la escuela
    dep: leer_('dep').filter(x => x.activo),
    // las visitas de supervisión a su escuela: ve la guía antes, sube sus fotos y lee el resultado
    vis: leer_('vis').filter(v => v.cct === cct),
    // los informes de seguimiento que se le enviaron y sus aclaraciones con su ATP
    inf: leer_('inf').filter(x => x.cct === cct).map(sinHtml_),
    acl: leer_('acl').filter(x => x.cct === cct),
    // la escuela guarda su directorio y sus oficios en su dispositivo; el servidor solo le presta la lectura con IA
    iaDirectorio: !!PropertiesService.getScriptProperties().getProperty('GEMINI_KEY'),
    version: VERSION
  };
}

/* ===================== SisAT ===================== */

function cicloValido_(c) {
  c = String(c || '');
  if (!/^20\d\d-20\d\d$/.test(c)) throw new Error('Ciclo escolar no válido.');
  return c;
}
function momentoValido_(m) {
  m = +m;
  if ([1, 2, 3].indexOf(m) < 0) throw new Error('El momento debe ser 1, 2 o 3.');
  return m;
}
const numero_ = (v, nulo) => { if (v === null || v === undefined || v === '') return nulo ? null : 0; const n = Math.round(+v); return isFinite(n) && n >= 0 ? Math.min(n, 99999) : (nulo ? null : 0); };
function niveles_(o, nulo) { o = o || {}; return { ne: numero_(o.ne, nulo), ed: numero_(o.ed, nulo), ra: numero_(o.ra, nulo) }; }
function tipos_(o, nulo) { o = o || {}; return { sa: numero_(o.sa, nulo), ca: numero_(o.ca, nulo), inc: numero_(o.inc, nulo) }; }
// El HTML del informe se guarda comprimido para que quepa en una celda (máx. 50 000 caracteres)
function comprimir_(html) {
  const z = 'z:' + Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(html, 'text/html', 'i.html')).getBytes());
  return z.length < 49000 ? z : '<p>El informe era demasiado grande para guardarse en Tequio; la dirección lo recibió por correo.</p>';
}
function descomprimir_(v) {
  v = String(v || '');
  if (v.indexOf('z:') !== 0) return v;
  return Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(v.slice(2)), 'application/x-gzip', 'i.gz')).getDataAsString('UTF-8');
}
function sinHtml_(x) { const o = Object.assign({}, x); delete o.html; return o; }
function avisoAclaracion_(para, asunto, cuerpo) {
  const l = String(para || '').split(',').map(m => m.trim()).filter(m => /@/.test(m));
  if (!l.length) return;
  try { MailApp.sendEmail({ to: l.join(','), subject: 'Tequio · ' + asunto, htmlBody: plantilla_(asunto, cuerpo), name: REMITENTE, replyTo: 'supervision050sep@gmail.com' }); } catch (e) {}
}
// Visitas de supervisión: ciclo escolar (agosto a julio) y registro de la visita de una escuela
function cicloVis_(c) {
  if (/^\d{4}-\d{4}$/.test(String(c || ''))) return String(c);
  const h = new Date(), y = h.getFullYear();
  return h.getMonth() >= 7 ? y + '-' + (y + 1) : (y - 1) + '-' + y;
}
function visitaDe_(yo, d) {
  const cct = cctPermitido_(yo, d.cct), ciclo = cicloVis_(d.ciclo);
  let n = d.numero === 'nueva' ? 0 : Math.max(1, Math.min(30, +d.numero || 1));
  if (!n) {  // visita extraordinaria nueva: la siguiente después de la 3
    if (yo.rol === 'director') throw new Error('Las visitas extraordinarias las programa la Supervisión.');
    n = leer_('vis').filter(v => v.cct === cct && v.ciclo === ciclo).reduce((m, v) => Math.max(m, +v.numero || 0), 3) + 1;
  }
  const id = 'vis-' + ciclo + '-' + cct + '-' + n;
  return buscar_('vis', id) || { id: id, ciclo: ciclo, cct: cct, numero: String(n), fecha: '', estado: '', items: [], resumen: '', segId: '', carpetaId: '',
    creadoPor: yo.id, creado: ahora_(), actualizado: ahora_(), cerradaPor: '', titulo: '', temas: [] };
}
function itemVisita_(v, k) {
  k = String(k || '').slice(0, 20);
  if (!k) throw new Error('Falta el tema de la visita.');
  v.items = v.items || [];
  let it = v.items.find(x => x.k === k);
  if (!it) { it = { k: k, estado: '', obs: '', fotos: [] }; v.items.push(it); }
  return it;
}
// La escuela con la que puede trabajar el usuario: un director solo la suya; la Supervisión y la Mesa Técnica, cualquiera del Directorio
function cctPermitido_(yo, cct) {
  cct = String(cct || '');
  if (yo.rol === 'director') {
    const mia = cctDe_(yo);
    if (cct && cct !== mia) throw new Error('Solo puede trabajar con los resultados de su escuela.');
    return mia;
  }
  soloMesa_(yo);
  if (!leer_('dir').find(c => c.tipo === 'director' && c.cct === cct)) throw new Error('La escuela no está en el Directorio.');
  return cct;
}
// Los .xls de la herramienta del SisAT son páginas HTML; también se aceptan .xlsx/.xls de Excel
function esExcel_(nombre, tipo) {
  return /\.(xlsx?|html?)$/i.test(nombre) || /spreadsheet|ms-excel|text\/html/.test(tipo);
}
// Resultado de un alumno en una herramienta: c = puntaje de cada componente o reactivo, p = puntos, v = aciertos con apoyo visual, n = nivel
function resAlumno_(o, largo) {
  if (!o) return null;
  const c = (Array.isArray(o.c) ? o.c : []).slice(0, largo).map(x => String(x == null ? '' : x).trim().toLowerCase().slice(0, 3));
  const n = { NE: 'NE', ED: 'ED', RA: 'RA' }[String(o.n || '').toUpperCase()] || '';
  return { c: c, p: numero_(o.p, true), v: numero_(o.v, true), n: n };
}
// Suma por componente de un grupo: lec y tex = puntos de cada componente (I a VI) y alumnos; cal = aciertos por reactivo (I a X), con apoyo visual y alumnos
function componentes_(o) {
  if (!o) return null;
  const arr = (a, l) => (Array.isArray(a) ? a : []).slice(0, l).map(x => numero_(x));
  const r = {};
  ['lec', 'tex'].forEach(h => { if (o[h]) r[h] = { s: arr(o[h].s, 6), n: numero_(o[h].n) }; });
  if (o.cal) r.cal = { s: arr(o.cal.s, 10), v: arr(o.cal.v, 10), n: numero_(o.cal.n) };
  return r;
}
function comentariosPara_(yo) {
  const l = leer_('sic');
  if (yo.rol !== 'director') return l;
  const cct = cctDe_(yo);
  return l.filter(x => ['escuela', 'grado', 'grupo'].indexOf(x.nivel) >= 0 && String(x.ref).split('|')[0] === cct);
}

// Carpeta «…SISAT…/Momento N» dentro de la carpeta de la escuela en el Drive de evidencias.
// Si no hay subcarpeta del momento: con crear=true la crea; si no, usa la carpeta SISAT filtrando por nombre.
function carpetaSisat_(cct, m, crear) {
  const raiz = leer_('evi').find(e => e.cct === cct && !e.ruta);
  if (!raiz) return { carpeta: null, ruta: '', mensaje: 'No se encontró la carpeta de la escuela en el Drive de evidencias. Revise las evidencias primero.' };
  const sinAcento = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const esc = DriveApp.getFolderById(raiz.carpetaId);
  let sis = null;
  const it = esc.getFolders();
  while (it.hasNext()) { const f = it.next(); if (/sisat/.test(sinAcento(f.getName()))) { sis = f; break; } }
  if (!sis) {
    if (!crear) return { carpeta: null, ruta: '', mensaje: 'La escuela no tiene carpeta del SisAT en el Drive.' };
    sis = esc.createFolder('07-SISAT');
  }
  const ordinal = ['', 'primer', 'segundo', 'tercer'][m];
  const reMom = new RegExp('(momento\\s*0?' + m + '\\b|\\bm\\s*0?' + m + '\\b|' + ordinal + '\\w*\\s+momento)');
  const it2 = sis.getFolders();
  while (it2.hasNext()) { const f = it2.next(); if (reMom.test(sinAcento(f.getName()))) return { carpeta: f, ruta: sis.getName() + '/' + f.getName() }; }
  if (crear) { const f = sis.createFolder('Momento ' + m); return { carpeta: f, ruta: sis.getName() + '/' + f.getName() }; }
  return { carpeta: sis, ruta: sis.getName(), filtrar: reMom };
}

/* ===================== EIA ===================== */

// Criterios de la rúbrica por grado (formato oficial de captura): fase 3 = 10, fase 4 = 26, fase 5 = 25
const EIA_LARGO_ = { '1': 10, '2': 10, '3': 26, '4': 26, '5': 25, '6': 25 };
// Proporción de criterios de un alumno en 0 o 1 (null si no tiene valoraciones)
function eiaEstado_(v) {
  const val = (v || []).filter(x => x !== null && x !== undefined);
  if (!val.length) return null;
  return val.filter(x => x <= 1).length / val.length;
}
// Carpeta «09-Ejercicios Integradores del Aprendizaje» dentro de la carpeta de la escuela en el Drive de evidencias
function carpetaEia_(cct, crear) {
  const raiz = leer_('evi').find(e => e.cct === cct && !e.ruta);
  if (!raiz) return { carpeta: null, ruta: '', mensaje: 'No se encontró la carpeta de la escuela en el Drive de evidencias. Revise las evidencias primero.' };
  const sinAcento = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = DriveApp.getFolderById(raiz.carpetaId), it = esc.getFolders();
  while (it.hasNext()) { const f = it.next(); if (/ejercicios\s+integradores|(^|[^a-z])eia([^a-z]|$)/.test(sinAcento(f.getName()))) return { carpeta: f, ruta: f.getName() }; }
  if (!crear) return { carpeta: null, ruta: '', mensaje: 'La escuela no tiene la carpeta «09-Ejercicios Integradores del Aprendizaje» en el Drive.' };
  const f = esc.createFolder('09-Ejercicios Integradores del Aprendizaje');
  return { carpeta: f, ruta: f.getName() };
}
// Excel, .zip y hojas de Google de una carpeta y de sus subcarpetas (hasta dos niveles)
function archivosEia_(carpeta, ruta, prof) {
  const l = [], it = carpeta.getFiles();
  while (it.hasNext()) {
    const a = it.next(), t = a.getMimeType(), n = a.getName();
    if (!(esExcel_(n, t) || /\.zip$/i.test(n) || /zip/.test(t) || t === MimeType.GOOGLE_SHEETS) || /^~\$/.test(n)) continue;
    l.push({ id: a.getId(), nombre: n, ruta: ruta, tipo: t, kb: Math.round(a.getSize() / 1024), fecha: Utilities.formatDate(a.getLastUpdated(), TZ, "yyyy-MM-dd'T'HH:mm") });
  }
  if (prof < 2) { const sub = carpeta.getFolders(); while (sub.hasNext()) { const f = sub.next(); archivosEia_(f, ruta + f.getName() + '/', prof + 1).forEach(x => l.push(x)); } }
  return l;
}

function PROMPT_SISAT_(m) {
  return [
    'Eres un capturista de datos muy cuidadoso. Recibes las gráficas del SisAT (Sistema de Alerta Temprana) de UNA escuela primaria de México, exportadas desde la herramienta oficial del SisAT.',
    'Cada página corresponde a un grupo: arriba dice «Grado-Grupo» (por ejemplo «6-B») y «Evaluación Sisat: Graficas de grupo». Una página que dice «Graficas de Escuela» es el concentrado de toda la escuela, aunque el selector de grupo muestre otro valor.',
    'En cada página hay una tabla «Exploración 1» (y quizá «Exploración 2» o «Exploración 3») con los renglones Lectura, Texto Esc. y Calcúlo Mat. y las columnas NE, NE%, ED, ED%, RA, RA% (NE = nivel esperado, ED = en desarrollo, RA = requiere apoyo).',
    'Abajo hay una tabla de cálculo mental por tipo de respuesta con los renglones «Aciertos sin apoyo visual», «Aciertos con apoyo visual» y «Respuestas incorrectas», y columnas Momento 1, Momento 2 (y quizá Momento 3), cada una con número y porcentaje.',
    'Extrae los NÚMEROS DE ALUMNOS (NE, ED, RA; no los porcentajes) de la Exploración ' + m + ', y de la tabla de cálculo mental la cantidad (no el porcentaje) de la columna Momento ' + m + '.',
    'Si la Exploración ' + m + ' está vacía en todas las páginas, usa la última exploración que sí tenga datos y escribe su número en «exploracionUsada».',
    'Copia los números exactamente como aparecen. No calcules, no redondees y no inventes. Si un número no se puede leer, escribe null. Si un renglón dice texto en vez de números, escribe null.',
    'Responde SOLO con JSON con esta forma exacta:',
    '{"exploracionUsada": ' + m + ', "grupos": [{"grupo": "6-B", "lec": {"ne": 0, "ed": 0, "ra": 0}, "tex": {"ne": 0, "ed": 0, "ra": 0}, "cal": {"ne": 0, "ed": 0, "ra": 0}, "tip": {"sa": 0, "ca": 0, "inc": 0}}], "escuela": {"lec": {...}, "tex": {...}, "cal": {...}, "tip": {...}} o null, "notas": "lo que no se pudo leer"}',
    'En «grupos» van solo las páginas de grupo, en el orden en que aparecen; la página «Graficas de Escuela» va en «escuela».'
  ].join('\n');
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
  } else if (sh.getLastColumn() < HOJAS[k].length) {  // columnas nuevas de una actualización
    const n0 = sh.getLastColumn() + 1, n = HOJAS[k].length - n0 + 1;
    if (sh.getMaxColumns() < HOJAS[k].length) sh.insertColumnsAfter(sh.getMaxColumns(), HOJAS[k].length - sh.getMaxColumns());
    sh.getRange(1, n0, 1, n).setValues([HOJAS[k].slice(n0 - 1)]).setFontWeight('bold').setBackground('#1F3A6B').setFontColor('#FFFFFF');
    sh.getRange(1, n0, sh.getMaxRows(), n).setNumberFormat('@');
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
