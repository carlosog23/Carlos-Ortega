/**
 * Evaluación Cualitativa Preescolar · servidor de redacción (Google Apps Script)
 *
 * Qué hace: recibe de la app las instrucciones de redacción (y, si las hay, fotos de listas),
 * las envía a Gemini con la clave guardada aquí y devuelve el texto. La clave nunca viaja a la app.
 *
 * Instalación (una sola vez):
 *  1. En script.google.com cree un proyecto nuevo y pegue este archivo completo.
 *  2. Configuración del proyecto → Propiedades de la secuencia de comandos → agregue
 *     GEMINI_KEY con su clave de Google AI Studio (puede ser la misma de Tequio).
 *  3. Ejecute una vez la función «autorizar» y acepte los permisos.
 *  4. Implementar → Nueva implementación → Aplicación web → Ejecutar como: Yo →
 *     Quién tiene acceso: Cualquier usuario. Copie la dirección que termina en /exec.
 *
 * Opcional: propiedad LIMITE_DIARIO (número de solicitudes por día; 1500 si no se indica).
 */

const MAX_PROMPT = 80000;        // caracteres
const MAX_IMAGENES = 3;
const MAX_IMAGEN_B64 = 6000000;  // unos 4.5 MB por imagen

function doGet() {
  return salida_({ ok: true, servicio: 'Evaluación Cualitativa Preescolar', ia: !!PropertiesService.getScriptProperties().getProperty('GEMINI_KEY') });
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.accion !== 'ia') throw new Error('Solicitud no reconocida.');
    const prompt = String(d.prompt || '');
    if (prompt.length < 20 || prompt.length > MAX_PROMPT) throw new Error('La solicitud está vacía o es demasiado larga.');
    const imagenes = (Array.isArray(d.imagenes) ? d.imagenes : []).slice(0, MAX_IMAGENES)
      .filter(function (i) { return i && /^image\/(jpeg|png|webp)$/.test(String(i.tipo)) && typeof i.datos === 'string' && i.datos.length <= MAX_IMAGEN_B64; });
    contarUso_();
    return salida_({ ok: true, texto: gemini_(prompt, imagenes) });
  } catch (err) {
    return salida_({ ok: false, error: String((err && err.message) || err) });
  }
}

function salida_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* Tope diario, para que un uso excesivo no agote la cuota gratuita */
function contarUso_() {
  const p = PropertiesService.getScriptProperties();
  const limite = parseInt(p.getProperty('LIMITE_DIARIO') || '1500', 10);
  const hoy = Utilities.formatDate(new Date(), 'America/Tijuana', 'yyyy-MM-dd');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const usado = p.getProperty('USO_DIA') === hoy ? parseInt(p.getProperty('USO_N') || '0', 10) : 0;
    if (usado >= limite) throw new Error('Se alcanzó el límite de uso de hoy. Intenta de nuevo mañana.');
    p.setProperties({ USO_DIA: hoy, USO_N: String(usado + 1) });
  } finally { lock.releaseLock(); }
}

/* Gemini (Google AI Studio). Si el modelo principal está saturado, intenta con el ligero. */
function gemini_(prompt, imagenes) {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_KEY');
  if (!key) throw new Error('El servicio de redacción aún no tiene su clave configurada.');
  const partes = imagenes.map(function (i) { return { inline_data: { mime_type: i.tipo, data: i.datos } }; }).concat([{ text: prompt }]);
  let modelos = modelosGemini_(key, false);
  let ultimo = '';
  for (let intento = 0; intento < 3 && intento < modelos.length + 1; intento++) {
    const modelo = modelos[Math.min(intento, modelos.length - 1)];
    const r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent?key=' + encodeURIComponent(key), {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ contents: [{ role: 'user', parts: partes }],
        generationConfig: { temperature: imagenes.length ? 0.1 : 0.8, maxOutputTokens: 16384, responseMimeType: 'application/json' } })
    });
    const c = r.getResponseCode();
    let j = {};
    try { j = JSON.parse(r.getContentText()); } catch (e) {}
    if (c === 200) {
      const ps = (((j.candidates || [])[0] || {}).content || {}).parts || [];
      const texto = ps.map(function (x) { return x.text || ''; }).join('').trim();
      if (texto) return texto;
      ultimo = 'La IA no devolvió texto. Intenta de nuevo.';
      continue;
    }
    if (c === 404) { modelos = modelosGemini_(key, true); ultimo = 'El modelo de IA cambió. Intenta de nuevo.'; continue; }
    if (c === 429 || c === 503) { ultimo = 'Se alcanzó el límite gratuito de la IA por ahora. Espera un minuto e intenta de nuevo.'; continue; }
    if (c === 400 || c === 403) throw new Error('La IA rechazó la solicitud o la clave. ' + ((j.error && j.error.message) || ''));
    ultimo = 'La IA no respondió (' + c + '). Intenta de nuevo.';
  }
  throw new Error(ultimo || 'La IA no respondió. Intenta de nuevo.');
}

// Elige el «Flash» estable más reciente y un «Flash-Lite» de respaldo, y los recuerda
function modelosGemini_(key, forzar) {
  const p = PropertiesService.getScriptProperties();
  if (!forzar && p.getProperty('GEMINI_MODELOS')) return p.getProperty('GEMINI_MODELOS').split(',');
  let lista = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
  try {
    const r = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=' + encodeURIComponent(key), { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      const ms = (JSON.parse(r.getContentText()).models || [])
        .filter(function (m) { return (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0; })
        .map(function (m) { return String(m.name).replace(/^models\//, ''); })
        .filter(function (n) { return /^gemini-\d/.test(n) && /flash/.test(n) && !/(image|tts|audio|live|embedding|robotics|computer|thinking)/.test(n); });
      const ver = function (n) { return parseFloat((n.match(/^gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0); };
      const orden = function (a, b) { return ver(b) - ver(a) || a.length - b.length; };
      const elegir = function (xs) { const est = xs.filter(function (n) { return !/(exp|preview)/.test(n); }); return (est.length ? est : xs).sort(orden)[0]; };
      const flash = elegir(ms.filter(function (n) { return !/lite/.test(n); }));
      const lite = elegir(ms.filter(function (n) { return /lite/.test(n); }));
      const nueva = [flash, lite].filter(Boolean);
      if (nueva.length) lista = nueva;
    }
  } catch (e) {}
  p.setProperty('GEMINI_MODELOS', lista.join(','));
  return lista;
}

/** Ejecute esta función UNA vez después de pegar el código: da permiso para conectarse a Gemini y prueba la clave. */
function autorizar() {
  const texto = gemini_('Responde solo con este JSON: {"estado":"listo"}', []);
  Logger.log('Respuesta de prueba: ' + texto + ' · Modelos: ' + PropertiesService.getScriptProperties().getProperty('GEMINI_MODELOS'));
}
