/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Tlamatini · Planeación didáctica · «Mi propia planeación».
   El docente sube su planeación (PDF, Word o fotos) y la IA (Gemini, por el servidor de Tequio):
   - la mejora respetando SU formato y su forma de escribir, o solo la revisa y le da sugerencias;
   - aprende su formato (apartados, tablas, estilo) para hacerle las siguientes planeaciones igual.
   El formato aprendido y las planeaciones mejoradas se guardan solo en este dispositivo. */
"use strict";
const MIA_FMT = 'plan-mi-formato', MIA_HIST = 'plan-mias';
const miaLs = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } } };
const MIA_PEDIDOS = [['prog', 'Alineación con el programa', 'contenidos, PDA y ejes articuladores correctos y bien relacionados'], ['act', 'Actividades más dinámicas', 'actividades más activas, prácticas y significativas para los alumnos'],
  ['eval', 'Evaluación formativa', 'criterios claros, instrumentos y momentos de evaluación'], ['inc', 'Inclusión y ajustes razonables', 'ajustes para alumnos con rezago, BAP o USAER'],
  ['tiempo', 'Tiempos y secuencia', 'tiempos realistas y una secuencia ordenada por sesiones'], ['com', 'Vínculo con la comunidad', 'relación con el contexto y la comunidad'], ['red', 'Redacción y ortografía', 'redacción clara y sin errores']];
const MIA = { archivos: [], texto: '', pegar: false, accion: 'mejorar', pedidos: new Set(['prog', 'act', 'eval', 'red']), grados: new Set(), ef: false, nota: '', res: null, tab: 'doc', hid: null,
  nueva: { tema: '', dur: '2semanas', grados: new Set(), nota: '' }, trabajando: null };

/* ---------- servidor: el mismo de Tlami (enlace de Tequio o enlace de acceso de Tlamatini) ---------- */
function miaServidor() {
  try { if (sessionStorage.getItem('tlm-demo') === '1') return null; } catch (e) {}
  const c = miaLs.get('tequio.cfg', null); if (c && c.s && c.k) return { s: c.s, k: c.k };
  const tok = miaLs.get('acc-token', '') || miaLs.get('tlp-token', ''), s = (miaLs.get('acc-cache', {}) || {}).tequio || '';
  return s && tok ? { s, tok } : null;
}
function miaQuien() { const p = miaLs.get('ppie-perfil', {}) || {}; return { nombre: String(p.minombre || '').trim(), escuela: String(p.escuela || '').trim(), cct: String(p.cct || '').trim(), cargo: String(p.micargo || '').trim() }; }
async function miaPost(datos) {
  const sv = miaServidor(); if (!sv) throw new Error('sinservidor'); if (navigator.onLine === false) throw new Error('Sin internet. Conéctese e intente de nuevo.');
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 330000);
  try {
    const r = await fetch(sv.s, { method: 'POST', redirect: 'follow', signal: ctl.signal, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ k: sv.k || '', accion: 'planIA', datos: Object.assign({ tok: sv.tok || '', quien: miaQuien() }, datos) }) });
    const j = await r.json(); if (!j || !j.ok) throw new Error((j && (j.mensaje || j.error)) || 'El servidor no respondió.'); return j;
  } catch (e) { if (e.name === 'AbortError') throw new Error('La IA tardó demasiado. Intente de nuevo; si la planeación es muy larga, súbala por partes.'); throw e; }
  finally { clearTimeout(tm); }
}
function miaError(e) {
  const m = String(e && e.message || e);
  if (m === 'sinservidor') return 'Para usar la IA, Tlamatini necesita su enlace personal (el que le llegó por correo o WhatsApp) e internet. Abra Tlamatini una vez desde ese enlace en este equipo y vuelva a intentarlo.';
  if (/Acción desconocida|no es válido o fue anulado|no está vigente/i.test(m)) return 'El servidor de la Supervisión todavía no tiene esta función, o su enlace ya no está vigente. Avise a la Supervisión.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'No se pudo conectar con el servidor. Revise su internet e intente de nuevo.';
  return m;
}

/* ---------- leer los archivos ---------- */
const miaB64 = blob => new Promise((ok, no) => { const f = new FileReader(); f.onload = () => ok(String(f.result).split(',')[1] || ''); f.onerror = () => no(new Error('No se pudo leer el archivo.')); f.readAsDataURL(blob); });
async function miaFoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('No se pudo abrir la foto «' + file.name + '». Pruebe con JPG o PNG.')); i.src = url; });
    const max = 1900, k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    const prev = c.toDataURL('image/jpeg', .5).length < 60000 ? c.toDataURL('image/jpeg', .5) : (() => { const t = document.createElement('canvas'), q = 160 / Math.max(c.width, c.height); t.width = c.width * q; t.height = c.height * q; t.getContext('2d').drawImage(c, 0, 0, t.width, t.height); return t.toDataURL('image/jpeg', .7); })();
    return { tipo: 'image/jpeg', data: c.toDataURL('image/jpeg', .82).split(',')[1], prev };
  } finally { URL.revokeObjectURL(url); }
}
/* Word (.docx): es un zip; se lee el texto con sus tablas, sin librerías */
async function miaZip(buf) {
  const dv = new DataView(buf), td = new TextDecoder(); let e = buf.byteLength - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--; if (e < 0) throw new Error('El archivo de Word está dañado.');
  const n = dv.getUint16(e + 10, true), mapa = {}; let p = dv.getUint32(e + 16, true);
  for (let i = 0; i < n && dv.getUint32(p, true) === 0x02014b50; i++) {
    const met = dv.getUint16(p + 10, true), cs = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lh = dv.getUint32(p + 42, true);
    mapa[td.decode(new Uint8Array(buf, p + 46, nl))] = { met, cs, lh }; p += 46 + nl + xl + cl;
  }
  return { nombres: Object.keys(mapa), async leer(nom) { const x = mapa[nom]; if (!x) return '';
    const ini = x.lh + 30 + dv.getUint16(x.lh + 26, true) + dv.getUint16(x.lh + 28, true), datos = new Uint8Array(buf, ini, x.cs);
    if (x.met === 0) return td.decode(datos);
    if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador no puede abrir Word. Guarde su planeación como PDF y súbala así.');
    return td.decode(await new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); } };
}
function miaWordTexto(xml) {
  const d = new DOMParser().parseFromString(xml, 'application/xml'), body = d.getElementsByTagName('w:body')[0]; if (!body) return { texto: '', horiz: false };
  const parr = p => { let t = ''; for (const n of p.getElementsByTagName('*')) { if (n.nodeName === 'w:t') t += n.textContent; else if (n.nodeName === 'w:tab') t += ' '; else if (n.nodeName === 'w:br') t += '\n'; }
    const st = (p.getElementsByTagName('w:pStyle')[0] || { getAttribute: () => '' }).getAttribute('w:val') || ''; t = t.trim(); if (!t) return '';
    if (/heading|t[ií]tulo|title/i.test(st)) return '## ' + t; if (p.getElementsByTagName('w:numPr').length || /list|lista|vi[ñn]eta/i.test(st)) return '- ' + t; return t; };
  const celda = tc => [...tc.childNodes].filter(x => x.nodeName === 'w:p' || x.nodeName === 'w:tbl').map(x => x.nodeName === 'w:p' ? parr(x) : tabla(x).replace(/\n/g, ' / ')).filter(Boolean).join(' / ');
  const tabla = tb => [...tb.childNodes].filter(x => x.nodeName === 'w:tr').map(tr => '| ' + [...tr.childNodes].filter(x => x.nodeName === 'w:tc').map(celda).join(' | ') + ' |').join('\n');
  const out = []; for (const x of body.childNodes) { if (x.nodeName === 'w:p') { const t = parr(x); if (t) out.push(t); } else if (x.nodeName === 'w:tbl') out.push('[TABLA]\n' + tabla(x) + '\n[FIN DE TABLA]'); }
  const pg = d.getElementsByTagName('w:pgSz')[0];
  return { texto: out.join('\n'), horiz: !!(pg && (pg.getAttribute('w:orient') === 'landscape' || (+pg.getAttribute('w:w') > +pg.getAttribute('w:h')))) };
}
async function miaWord(file) {
  const z = await miaZip(await file.arrayBuffer()), doc = await z.leer('word/document.xml'); if (!doc) throw new Error('No se encontró el texto dentro de «' + file.name + '».');
  const r = miaWordTexto(doc); let enc = '';
  for (const h of z.nombres.filter(n => /^word\/header\d*\.xml$/.test(n)).slice(0, 2)) { const t = miaWordTexto((await z.leer(h)).replace(/w:hdr/g, 'w:body')).texto; if (t) enc += t + '\n'; }
  return (enc ? 'ENCABEZADO DE PÁGINA DEL DOCUMENTO: ' + enc.replace(/\n/g, ' · ') + '\n' : '') + (r.horiz ? '(El documento está en hoja horizontal.)\n' : '') + r.texto;
}
async function miaAgregar(files) {
  for (const f of files) {
    const n = f.name || 'archivo', ext = (n.split('.').pop() || '').toLowerCase();
    try {
      if (f.type === 'application/pdf' || ext === 'pdf') { if (f.size > 14e6) throw new Error('«' + n + '» pesa más de 14 MB. Súbalo en partes o como fotos.'); MIA.archivos.push({ nombre: n, clase: 'pdf', tipo: 'application/pdf', data: await miaB64(f), kb: f.size / 1024 }); }
      else if (ext === 'docx') { const t = await miaWord(f); MIA.archivos.push({ nombre: n, clase: 'word', texto: t, kb: f.size / 1024 }); }
      else if (ext === 'doc' || ext === 'odt' || ext === 'pages') throw new Error('«' + n + '» es de un formato que no se puede leer. En Word use «Guardar como» → Word (.docx) o PDF.');
      else if (/^image\//.test(f.type) || /^(jpe?g|png|webp|heic|heif|gif)$/.test(ext)) { if (MIA.archivos.filter(a => a.clase === 'foto').length >= 10) throw new Error('Máximo 10 fotos.'); const x = await miaFoto(f); MIA.archivos.push(Object.assign({ nombre: n, clase: 'foto', kb: x.data.length * .75 / 1024 }, x)); }
      else throw new Error('«' + n + '» no es PDF, Word ni foto.');
    } catch (e) { toast('<b>No se agregó.</b> ' + esc(e.message || e), 5200); }
  }
  repinta();
}

/* ---------- programa oficial del grado (para que la IA use los contenidos y PDA tal cual) ---------- */
let MIA_PDA = null;
async function miaPrograma(grados, ef) {
  if (!grados.length) return '';
  if (ef) return grados.map(g => { const f = +g <= 2 ? 3 : +g <= 4 ? 4 : 5; return (BANCO_EF[f] || []).filter(x => x.pda && x.pda[g]).map(x => `Educación Física | ${x.c} | PDA ${g}.°: ${x.pda[g]}`).join('\n'); }).join('\n');
  if (!MIA_PDA) { try { const r = await fetch('formatos/pda.json'); if (r.ok) MIA_PDA = await r.json(); } catch (e) {} if (!MIA_PDA) MIA_PDA = miaLs.get('pda-cache', null); }
  if (!MIA_PDA || !MIA_PDA.campos) return '';
  const out = []; grados.forEach(g => { const f = +g <= 2 ? '3' : +g <= 4 ? '4' : '5';
    Object.entries(MIA_PDA.campos).forEach(([campo, fs]) => (fs[f] || []).forEach(x => { if (x.pda && x.pda[g]) out.push(`${campo} | ${x.c} | PDA ${g}.°: ${x.pda[g]}`); })); });
  return out.join('\n');
}

/* ---------- pantallas ---------- */
function miaEstilos() { if ($('#miaCss')) return; const s = document.createElement('style'); s.id = 'miaCss'; s.textContent = `
.mia-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;border:2px dashed var(--hilo);border-radius:22px;padding:28px 18px;background:var(--hoja);cursor:pointer;transition:border-color .15s,background .15s}
.mia-drop:hover,.mia-drop.sobre{border-color:var(--anil);background:var(--anil-s)}.mia-drop b{font-family:var(--disp);font-size:21px;font-weight:600}.mia-drop small{color:var(--gris);font-size:14.5px}
.mia-drop .ico{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;background:var(--anil-s);color:var(--anil)}.mia-drop .ico svg{width:28px;height:28px}
.mia-arch{display:grid;gap:8px;margin-top:12px}.mia-a{display:flex;align-items:center;gap:12px;background:var(--hoja);border:1px solid var(--hilo);border-radius:16px;padding:8px 10px 8px 8px;box-shadow:var(--e1)}
.mia-a .mi{width:46px;height:46px;border-radius:10px;flex:none;display:grid;place-items:center;font-size:12px;font-weight:700;background:var(--barro-s);color:var(--barro);overflow:hidden}.mia-a .mi.w{background:var(--anil-s);color:var(--anil)}.mia-a .mi img{width:100%;height:100%;object-fit:cover}
.mia-a .nm{flex:1;min-width:0}.mia-a .nm b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mia-a .nm small{color:var(--gris);font-size:13px}
.mia-x{border:0;background:none;width:40px;height:40px;border-radius:10px;cursor:pointer;color:var(--gris);display:grid;place-items:center}.mia-x:hover{background:var(--rojo-s);color:var(--rojo)}
.mchips{display:flex;flex-wrap:wrap;gap:8px}.mchip{border:1px solid var(--hilo);background:var(--hoja);border-radius:999px;padding:8px 14px;min-height:42px;font-weight:700;font-size:14.5px;color:var(--gris);cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:var(--e1)}
.mchip[aria-pressed="true"]{background:var(--anil);border-color:var(--anil);color:#fff}.mchip svg{width:15px;height:15px}
.mia-opc{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.mia-op{text-align:left;background:var(--hoja);border:1px solid var(--hilo);border-radius:20px;padding:16px;cursor:pointer;box-shadow:var(--e1);display:flex;gap:12px;align-items:flex-start}
.mia-op[aria-pressed="true"]{box-shadow:0 0 0 2px var(--anil),var(--e2)}.mia-op .r{width:22px;height:22px;border-radius:50%;border:2px solid var(--hilo);flex:none;margin-top:2px}.mia-op[aria-pressed="true"] .r{border:7px solid var(--anil)}
.mia-op b{font-family:var(--disp);font-size:19px;font-weight:600;display:block}.mia-op small{color:var(--gris);font-size:14.5px;line-height:1.4;display:block;margin-top:2px}
.mia-fmt{background:linear-gradient(160deg,#20396A,#122243 80%);color:#F3EBDD;border-radius:26px;padding:20px;box-shadow:var(--e2);position:relative;overflow:hidden}
.mia-fmt h3{color:#fff;font-size:24px;margin:6px 0 4px}.mia-fmt p{color:#C9D3E6;font-size:15px}.mia-fmt .secs{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 14px}.mia-fmt .secs span{font-size:12.5px;font-weight:700;border-radius:999px;padding:3px 10px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16)}
.mia-fmt .campo{display:block;margin-top:12px}.mia-fmt .campo span{display:block;font-size:14px;font-weight:700;color:#E9EEF7;margin-bottom:4px}
.mia-fmt textarea,.mia-fmt input{width:100%;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.95);color:var(--tinta);padding:10px 12px;font-size:16px}
.mia-fmt .seg{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.16)}.mia-fmt .seg button{color:#C9D3E6}.mia-fmt .seg button[aria-pressed="true"]{color:var(--anil)}
.mia-fmt .mchip{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2);color:#E9EEF7;box-shadow:none}.mia-fmt .mchip[aria-pressed="true"]{background:#E3A63B;border-color:#E3A63B;color:#2A1C05}
.mia-hist{display:grid;gap:8px}.mia-h{display:flex;align-items:center;gap:10px;background:var(--hoja);border:1px solid var(--hilo);border-radius:16px;padding:10px 12px;cursor:pointer;text-align:left;box-shadow:var(--e1)}.mia-h:hover{border-color:var(--anil2)}.mia-h .nm{flex:1;min-width:0}.mia-h b{display:block;font-size:15.5px}.mia-h small{color:var(--gris);font-size:13px}
.mia-cam{display:grid;gap:10px}.mia-c{background:var(--hoja);border:1px solid var(--hilo);border-left:5px solid var(--anil);border-radius:14px;padding:12px 14px}.mia-c.f{border-left-color:var(--jade)}.mia-c.s{border-left-color:var(--maiz)}
.mia-c .sc{font-size:12.5px;font-weight:700;color:var(--gris);text-transform:uppercase;letter-spacing:.04em}.mia-c p{margin-top:3px;font-size:15.5px}.mia-c p.pq{color:var(--gris);font-size:14px}
.mia-nota{background:var(--anil-s);border-radius:14px;padding:10px 14px;font-size:14.5px;color:var(--anil);margin-bottom:14px}
.hoja.mia-hoja{outline:none}.hoja.mia-hoja:focus{box-shadow:0 0 0 3px var(--maiz),0 30px 60px -20px rgba(18,34,67,.35)}.hoja.horiz{max-width:1056px}
.mia-hoja .sub{text-align:center;margin:2px 0 12px;color:#333}.mia-hoja .enc-t th{width:18%;text-align:left;background:#F2F4F8}.mia-hoja td,.mia-hoja th{border:1px solid #999;padding:4px 6px;vertical-align:top;text-align:left}
.mia-hoja .tt th{background:#E9EDF5;color:#1F3A6B}.mia-hoja ul{margin:4px 0 4px 20px;padding:0}.mia-hoja p{margin:0 0 6px}.mia-hoja .firmas{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
.mia-prog{height:8px;border-radius:99px;background:var(--hilo2);overflow:hidden;max-width:420px;margin:18px auto 0}.mia-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--anil),var(--maiz));transition:width 1s linear}
@media print{.hoja.horiz{max-width:none}#panel>*:not(.hoja){display:none!important}.hoja.mia-hoja{box-shadow:none!important}}`; document.head.appendChild(s); }

const miaFmt = () => miaLs.get(MIA_FMT, null);
function miaGrados(sel, attr) { return `<div class="mchips">${[1, 2, 3, 4, 5, 6].map(g => `<button class="mchip" ${attr}="${g}" aria-pressed="${sel.has(String(g))}">${g}.°</button>`).join('')}</div>`; }

function vMia() {
  miaEstilos(); const F = miaFmt(), H = miaLs.get(MIA_HIST, []), N = MIA.nueva;
  const hay = MIA.archivos.length || (MIA.pegar && MIA.texto.trim().length > 80);
  const r = diasClase(E.ini, N.dur), nd = r.dias.length;
  $('#app').innerHTML = topBar('Tlamatini · Pedagógico', 'Planeación didáctica') + `<main class="wrap"><div class="escena"><div>
   <section class="intro">${selectorModo()}<h1>Su planeación, mejorada y en su formato</h1>
    <p>Suba la planeación que ya usa. Tlamatini la revisa con el programa oficial y la mejora sin cambiarle el formato ni su forma de trabajar. Además aprende su formato para hacerle las siguientes igual.</p></section>
   ${F ? `<div class="paso-t"><span class="n">★</span><h2>Una nueva, en su formato</h2></div>
   <section class="mia-fmt"><span class="pill">Su formato guardado</span><h3>${esc(F.titulo || 'Mi formato de planeación')}</h3><p>Aprendido de «${esc(F.origen || 'su planeación')}» · ${esc(F.fecha ? fCorta(F.fecha) : '')} · hoja ${F.orientacion === 'horizontal' ? 'horizontal' : 'vertical'}</p>
    <div class="secs">${(F.secciones || []).map(s => `<span>${esc(s.titulo)}</span>`).join('')}</div>
    <label class="campo"><span>¿Qué va a trabajar?</span><textarea id="nTema" rows="2" placeholder="Ej.: el cuidado del agua en la comunidad; fracciones con la receta de tamales; la leyenda de Camalú…">${esc(N.tema)}</textarea></label>
    <div class="campo"><span>Grado</span>${miaGrados(N.grados, 'data-ng')}</div>
    <div class="campo"><span>¿Para cuánto tiempo?</span><div class="seg" role="group">${[['dia', '1 día'], ['semana', '1 semana'], ['2semanas', '2 semanas'], ['3semanas', '3 semanas'], ['mes', '1 mes']].map(([v, l]) => `<button data-nd="${v}" aria-pressed="${N.dur === v}">${l}</button>`).join('')}</div>
     <p style="font-size:13.5px;margin-top:6px">${nd} ${nd === 1 ? 'día de clase' : 'días de clase'} según el calendario de Baja California${nd ? `: ${esc(fCorta(r.dias[0]))}${nd > 1 ? ' a ' + esc(fCorta(r.dias[nd - 1])) : ''}` : ''}.</p></div>
    <label class="campo"><span>Algo más (opcional)</span><input id="nNota" value="${esc(N.nota)}" placeholder="Ej.: grupo multigrado 3.° y 4.°; no tenemos proyector"></label>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><button class="btn maiz" id="nHacer" ${N.tema.trim().length > 3 ? '' : 'disabled'}>${ic('chispa')}Hacer mi planeación</button><button class="btn sec chico" id="nOlv" style="background:transparent;color:#C9D3E6;border-color:rgba(255,255,255,.25)">Olvidar este formato</button></div></section>` : ''}
   <div class="paso-t"><span class="n">1</span><h2>Suba su planeación</h2></div>
   <label class="mia-drop" id="miaDrop"><input type="file" id="miaF" multiple accept=".pdf,.docx,image/*" hidden><span class="ico">${ic('descarga', 'style="transform:rotate(180deg)"')}</span><b>Toque para elegir o arrastre aquí</b><small>PDF, Word (.docx) o fotos de las hojas (hasta 10). Puede ser una planeación anterior: lo que importa es su formato.</small></label>
   ${MIA.archivos.length ? `<div class="mia-arch">${MIA.archivos.map((a, i) => `<div class="mia-a"><span class="mi ${a.clase === 'word' ? 'w' : ''}">${a.clase === 'foto' ? `<img src="${a.prev}" alt="">` : a.clase === 'word' ? 'WORD' : 'PDF'}</span><span class="nm"><b>${esc(a.nombre)}</b><small>${a.clase === 'foto' ? 'Foto' : a.clase === 'word' ? 'Word · texto y tablas leídos' : 'PDF'} · ${a.kb > 1024 ? (a.kb / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(a.kb)) + ' KB'}</small></span><button class="mia-x" data-qa="${i}" aria-label="Quitar">${ic('x')}</button></div>`).join('')}</div>` : ''}
   <label class="sw"><input type="checkbox" id="miaPeg" ${MIA.pegar ? 'checked' : ''}><span><b>Prefiero pegar el texto</b> <span style="color:var(--gris);font-size:14.5px">(copiado de Word, Google Docs, etc.)</span></span></label>
   ${MIA.pegar ? `<textarea class="nota" id="miaTx" style="margin-top:10px;min-height:180px" placeholder="Pegue aquí su planeación completa.">${esc(MIA.texto)}</textarea>` : ''}
   <div class="paso-t"><span class="n">2</span><h2>¿Qué hacemos con ella?</h2></div>
   <div class="mia-opc"><button class="mia-op" data-acc="mejorar" aria-pressed="${MIA.accion === 'mejorar'}"><span class="r"></span><span><b>Mejorarla</b><small>Se la regreso mejorada, con su mismo formato, y le explico qué cambié y por qué.</small></span></button>
    <button class="mia-op" data-acc="revisar" aria-pressed="${MIA.accion === 'revisar'}"><span class="r"></span><span><b>Solo revisarla</b><small>No toco su texto: le doy fortalezas y sugerencias, apartado por apartado.</small></span></button></div>
   <p class="lbl" style="margin:18px 2px 8px;font-weight:700">Ponga especial atención en:</p>
   <div class="mchips">${MIA_PEDIDOS.map(([k, t]) => `<button class="mchip" data-pe="${k}" aria-pressed="${MIA.pedidos.has(k)}">${MIA.pedidos.has(k) ? ic('check') : ''}${esc(t)}</button>`).join('')}</div>
   <div class="paso-t"><span class="n">3</span><h2>¿De qué grado es?</h2></div>
   ${miaGrados(MIA.grados, 'data-gr')}
   <p style="color:var(--gris);font-size:14.5px;margin:8px 2px 0">Con el grado, Tlamatini revisa sus contenidos y PDA contra el programa oficial. Si es multigrado, marque todos.</p>
   <label class="sw"><input type="checkbox" id="miaEF" ${MIA.ef ? 'checked' : ''}><span><b>Es de Educación Física</b></span></label>
   <div class="paso-t"><span class="n">4</span><h2>¿Algo más?</h2></div>
   <textarea class="nota" id="miaNota" placeholder="Opcional. Ej.: la entrego al director el viernes; quiero más actividades al aire libre; mi grupo tiene 3 alumnos con apoyo de USAER.">${esc(MIA.nota)}</textarea>
   <p style="color:var(--gris);font-size:13.5px;margin:10px 2px 0">${ic('candado', 'style="width:15px;height:15px;vertical-align:-2px"')} Su planeación se envía a la IA por el servidor de la Supervisión solo para mejorarla; no se guarda allá. De preferencia, quite nombres de alumnos.</p>
   ${H.length ? `<div class="paso-t"><span class="n">↺</span><h2>Sus planeaciones anteriores</h2></div><div class="mia-hist">${H.map(h => `<button class="mia-h" data-h="${h.id}"><span class="mi" style="width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:var(--anil-s);color:var(--anil)">${ic('doc')}</span><span class="nm"><b>${esc(h.titulo)}</b><small>${h.modo === 'revisar' ? 'Revisada' : h.modo === 'nueva' ? 'Nueva en su formato' : 'Mejorada'} · ${esc(fCorta(h.fecha))}</small></span>${ic('abajo', 'style="transform:rotate(-90deg)"')}</button>`).join('')}</div>` : ''}
  </div>
  <aside class="previa"><p class="t">Su planeación</p><h3>${hay ? (MIA.accion === 'revisar' ? 'Lista para revisar' : 'Lista para mejorar') : 'Suba su planeación'}</h3>
   <dl><dt>Archivos</dt><dd>${MIA.archivos.length ? MIA.archivos.length + (MIA.archivos.length === 1 ? ' archivo' : ' archivos') : MIA.pegar && MIA.texto.trim() ? 'texto pegado' : 'ninguno todavía'}</dd><dt>Grado</dt><dd>${MIA.grados.size ? [...MIA.grados].sort().map(g => g + '.°').join(', ') : 'sin marcar'}${MIA.ef ? ' · Educación Física' : ''}</dd><dt>Atención en</dt><dd>${MIA.pedidos.size ? MIA_PEDIDOS.filter(p => MIA.pedidos.has(p[0])).map(p => p[1].toLowerCase()).join(', ') : 'lo que más lo necesite'}</dd></dl>
   <button class="btn maiz" id="miaIr" ${hay ? '' : 'disabled'}>${ic('chispa')}${MIA.accion === 'revisar' ? 'Revisar mi planeación' : 'Mejorar mi planeación'}</button></aside>
  </div></main>
  <div class="fijo solo-movil"><div class="fijo-in"><div class="tx">${hay ? `<b>${MIA.accion === 'revisar' ? 'Revisar' : 'Mejorar'} mi planeación</b><br>${MIA.archivos.length || 1} ${MIA.archivos.length > 1 ? 'archivos' : 'archivo'}` : 'Suba su planeación'}</div><button class="btn maiz" id="miaIr2" ${hay ? '' : 'disabled'}>${ic('chispa')}${MIA.accion === 'revisar' ? 'Revisar' : 'Mejorar'}</button></div></div>`;
  cablearModo();
  $('#atras').onclick = () => { location.href = 'index.html#ir=pedagogico'; };
  const fi = $('#miaF'), dr = $('#miaDrop');
  fi.onchange = () => { const f = [...fi.files]; fi.value = ''; if (f.length) { toast('Leyendo…', 1500); miaAgregar(f); } };
  dr.ondragover = e => { e.preventDefault(); dr.classList.add('sobre'); }; dr.ondragleave = () => dr.classList.remove('sobre');
  dr.ondrop = e => { e.preventDefault(); dr.classList.remove('sobre'); const f = [...(e.dataTransfer.files || [])]; if (f.length) miaAgregar(f); };
  $$('[data-qa]').forEach(b => b.onclick = () => { MIA.archivos.splice(+b.dataset.qa, 1); repinta(); });
  $('#miaPeg').onchange = e => { MIA.pegar = e.target.checked; repinta(); };
  const tx = $('#miaTx'); if (tx) tx.oninput = () => { const antes = MIA.texto.trim().length > 80; MIA.texto = tx.value; if (antes !== MIA.texto.trim().length > 80) { repinta(); const t = $('#miaTx'); t.focus(); t.setSelectionRange(t.value.length, t.value.length); } };
  $$('[data-acc]').forEach(b => b.onclick = () => { MIA.accion = b.dataset.acc; repinta(); });
  $$('[data-pe]').forEach(b => b.onclick = () => { const k = b.dataset.pe; MIA.pedidos.has(k) ? MIA.pedidos.delete(k) : MIA.pedidos.add(k); repinta(); });
  $$('[data-gr]').forEach(b => b.onclick = () => { const k = b.dataset.gr; MIA.grados.has(k) ? MIA.grados.delete(k) : MIA.grados.add(k); repinta(); });
  $('#miaEF').onchange = e => { MIA.ef = e.target.checked; repinta(); };
  $('#miaNota').oninput = e => { MIA.nota = e.target.value; };
  $('#miaIr').onclick = () => miaEnviar(MIA.accion); $('#miaIr2').onclick = () => miaEnviar(MIA.accion);
  $$('[data-h]').forEach(b => b.onclick = () => { const h = miaLs.get(MIA_HIST, []).find(x => x.id === b.dataset.h); if (!h) return; MIA.res = h.res; MIA.hid = h.id; MIA.tab = 'doc'; E.vista = 'plan'; pintar(); scrollTo(0, 0); });
  if (F) {
    const nt = $('#nTema'); nt.oninput = () => { const a = N.tema.trim().length > 3; N.tema = nt.value; if (a !== N.tema.trim().length > 3) $('#nHacer').disabled = !(N.tema.trim().length > 3); };
    $$('[data-ng]').forEach(b => b.onclick = () => { const k = b.dataset.ng; N.grados.has(k) ? N.grados.delete(k) : N.grados.add(k); repinta(); });
    $$('[data-nd]').forEach(b => b.onclick = () => { N.dur = b.dataset.nd; repinta(); });
    $('#nNota').oninput = e => { N.nota = e.target.value; };
    $('#nHacer').onclick = () => miaEnviar('nueva');
    $('#nOlv').onclick = () => { if (!confirm('¿Olvidar su formato guardado? Podrá volver a enseñárselo a Tlamatini subiendo una planeación.')) return; try { localStorage.removeItem(MIA_FMT); } catch (e) {} repinta(); };
  }
}

async function miaEnviar(modo) {
  const N = MIA.nueva, F = miaFmt(), p = miaQuien();
  const grados = [...(modo === 'nueva' ? N.grados : MIA.grados)].sort();
  let datos;
  try {
    const programa = await miaPrograma(grados, modo === 'nueva' ? /f[ií]sica/i.test(JSON.stringify(F || {})) : MIA.ef);
    if (modo === 'nueva') { const r = diasClase(E.ini, N.dur);
      datos = { modo, formato: F, nota: N.nota, programa, datos: { docente: p.nombre, escuela: [p.escuela, p.cct].filter(Boolean).join(' · '), grados: grados.map(g => g + '.°'), tema: N.tema, duracion: ({ dia: '1 día', semana: '1 semana', '2semanas': '2 semanas', '3semanas': '3 semanas', mes: '1 mes' })[N.dur] + ` (${r.dias.length} días de clase)`, fechas: r.dias.map(fCorta) } }; }
    else datos = { modo, archivos: MIA.archivos.filter(a => a.data).map(a => ({ tipo: a.tipo, data: a.data })), texto: [MIA.archivos.filter(a => a.texto).map(a => a.texto).join('\n\n'), MIA.pegar ? MIA.texto : ''].filter(Boolean).join('\n\n'),
      pedidos: MIA_PEDIDOS.filter(x => MIA.pedidos.has(x[0])).map(x => x[1] + ' (' + x[2] + ')'), nota: MIA.nota, programa, datos: { docente: p.nombre, escuela: [p.escuela, p.cct].filter(Boolean).join(' · '), grados: grados.map(g => g + '.°'), asignatura: MIA.ef ? 'Educación Física' : '' } };
  } catch (e) { toast(esc(miaError(e)), 6000); return; }
  if (!miaServidor()) { toast(esc(miaError('sinservidor')), 7000); return; }
  MIA.trabajando = { modo, t0: Date.now() }; E.vista = 'armando'; pintar(); scrollTo(0, 0);
  try {
    const j = await miaPost(datos); const res = { modo, formato: j.formato, documento: j.documento, cambios: j.cambios || [], observaciones: j.observaciones || [], resumen: j.resumen || '', fecha: hoyISO(), origen: modo === 'nueva' ? (F && F.origen) || '' : (MIA.archivos[0] && MIA.archivos[0].nombre) || 'texto pegado' };
    if (modo === 'nueva' && F) res.formato = F;
    MIA.res = res; MIA.hid = 'm' + Date.now().toString(36); MIA.tab = 'doc';
    let fmtNuevo = false; if (modo !== 'nueva' && res.formato && (res.formato.secciones || []).length && !miaFmt()) { miaLs.set(MIA_FMT, Object.assign({ fecha: res.fecha, origen: res.origen }, res.formato)); fmtNuevo = true; }
    miaGuardarHist();
    if (modo === 'nueva') { N.tema = ''; N.nota = ''; } else { MIA.archivos = []; MIA.texto = ''; MIA.nota = ''; }
    MIA.trabajando = null; E.vista = 'plan'; pintar(); scrollTo(0, 0);
    toast(modo === 'revisar' ? '<b>Listo.</b> Revise las sugerencias apartado por apartado.' : modo === 'nueva' ? '<b>Lista.</b> Su planeación nueva, en su formato.' : '<b>Lista.</b> Su planeación mejorada, en su formato.' + (fmtNuevo ? ' Además guardé su formato para las próximas.' : ''), 5200);
  } catch (e) { MIA.trabajando = null; E.vista = 'inicio'; pintar(); scrollTo(0, 0); toast('<b>No se pudo.</b> ' + esc(miaError(e)), 8000); }
}
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function miaGuardarHist() { const R = MIA.res; if (!R) return; let H = miaLs.get(MIA_HIST, []).filter(h => h.id !== MIA.hid);
  H.unshift({ id: MIA.hid, fecha: R.fecha, titulo: (R.documento && R.documento.titulo) || 'Planeación', modo: R.modo, res: R }); H = H.slice(0, 8);
  while (H.length && !miaLs.set(MIA_HIST, H)) H.pop(); }

function vMiaTrabajando() {
  miaEstilos(); const m = (MIA.trabajando || {}).modo || 'mejorar';
  const pasos = m === 'nueva' ? ['Leyendo su formato y su estilo', 'Buscando contenidos y PDA en el programa oficial', 'Repartiendo el trabajo en los días de clase de Baja California', 'Escribiendo actividades, evaluación y ajustes', 'Pasando todo a su formato']
    : m === 'revisar' ? ['Leyendo su planeación', 'Pasándola a limpio tal como la escribió', 'Revisando contenidos y PDA con el programa oficial', 'Revisando actividades, evaluación e inclusión', 'Anotando fortalezas y sugerencias']
      : ['Leyendo su planeación', 'Reconociendo su formato: apartados, tablas y estilo', 'Revisando contenidos y PDA con el programa oficial', 'Mejorando actividades, evaluación e inclusión', 'Pasándola a limpio en su formato'];
  const cols = ['#2D5491', '#4F7FB8', '#6B3F7A', '#1B7560', '#A94C2A', '#B07A14', '#8C2232'];
  $('#app').innerHTML = `<main class="wrap"><div class="armando"><div>
    <div class="tejiendo" aria-hidden="true">${cols.map((c, i) => `<i style="--c:${c};--h:${44 + (i % 3) * 18 + i * 3}px;animation-delay:${i * .28}s"></i>`).join('')}</div>
    <h2>${m === 'revisar' ? 'Revisando' : m === 'nueva' ? 'Tejiendo' : 'Mejorando'} su planeación…</h2><p style="color:var(--gris)">Toma de 30 segundos a 2 minutos. No cierre esta pantalla.</p>
    <div class="mia-prog"><i id="miaBar"></i></div>
    <ul class="pasos" aria-live="polite">${pasos.map((p, i) => `<li data-p="${i}"><span class="b">${ic('check', 'style="width:14px;height:14px"')}</span>${esc(p)}</li>`).join('')}</ul></div></div></main>`;
  const t0 = (MIA.trabajando || {}).t0 || Date.now();
  const tick = () => { if (E.vista !== 'armando' || !$('#miaBar')) return; const s = (Date.now() - t0) / 1000, pct = Math.min(94, 100 * (1 - Math.exp(-s / 45)));
    $('#miaBar').style.width = pct + '%'; pasos.forEach((_, i) => { if (pct > (i + .6) * 92 / pasos.length) { const li = $(`[data-p="${i}"]`); if (li) li.classList.add('ok'); } }); setTimeout(tick, 1000); };
  setTimeout(tick, 50);
}

function miaDocHTML(D, F) {
  const parr = t => String(t || '').split(/\n+/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join('');
  const enc = D.encabezado || [], filas = []; for (let i = 0; i < enc.length; i += 2) filas.push(enc.slice(i, i + 2));
  return `<div class="hoja mia-hoja${F && F.orientacion === 'horizontal' ? ' horiz' : ''}" id="miaHoja" contenteditable="true" spellcheck="true">
   <h1>${esc(D.titulo)}</h1>${D.subtitulo ? `<p class="sub">${esc(D.subtitulo)}</p>` : ''}
   ${filas.length ? `<table class="enc-t">${filas.map(f => `<tr>${f.map(x => `<th>${esc(x.etiqueta)}</th><td${f.length === 1 ? ' colspan="3"' : ''}>${esc(x.valor)}</td>`).join('')}</tr>`).join('')}</table>` : ''}
   ${(D.secciones || []).map(s => `${s.titulo ? `<h3>${esc(s.titulo)}</h3>` : ''}${s.tipo === 'tabla' ? `<table class="tt"><tr>${(s.columnas || []).map(c => `<th>${esc(c)}</th>`).join('')}</tr>${(s.filas || []).map(f => `<tr>${f.map(c => `<td>${parr(c) || '&nbsp;'}</td>`).join('')}</tr>`).join('')}</table>`
    : s.tipo === 'lista' ? `<ul>${(s.items || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : parr(s.texto)}`).join('')}
   ${(D.firmas || []).length ? `<div class="firmas">${D.firmas.map(f => `<div>${esc(f)}</div>`).join('')}</div>` : ''}</div>`;
}
function vMiaPlan() {
  miaEstilos(); const R = MIA.res; if (!R) { E.vista = 'inicio'; return pintar(); }
  const D = R.documento, F = R.formato || {}, rev = R.modo === 'revisar', guardado = miaFmt();
  const mismo = guardado && JSON.stringify(guardado.secciones) === JSON.stringify(F.secciones);
  const fort = R.observaciones.filter(o => o.tipo === 'fortaleza'), sug = R.observaciones.filter(o => o.tipo !== 'fortaleza');
  const tabs = [['doc', rev ? 'Su planeación' : 'Documento'], ['cambios', rev ? `Revisión (${R.observaciones.length})` : `Qué mejoró (${R.cambios.length})`], ['formato', 'Su formato']];
  const panel = {
    doc: () => `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><button class="btn pri" data-doc="word">${ic('descarga')}Word (editable)</button><button class="btn sec" data-doc="pdf">${ic('descarga')}PDF</button><button class="btn sec" data-doc="imp">${ic('imp')}Imprimir</button></div>
      <div class="mia-nota">${ic('lapiz', 'style="width:15px;height:15px;vertical-align:-2px"')} Puede corregir el texto aquí mismo: toque donde quiera y escriba. Se guarda en este dispositivo.${D && /\[completar/i.test(JSON.stringify(D)) ? ' Busque los <b>[completar: …]</b>: son datos que solo usted conoce.' : ''}</div>
      ${R.html ? `<div class="hoja mia-hoja${F.orientacion === 'horizontal' ? ' horiz' : ''}" id="miaHoja" contenteditable="true" spellcheck="true">${R.html}</div>` : miaDocHTML(D, F)}`,
    cambios: () => rev ? `${fort.length ? `<h3 style="margin:4px 0 10px">Lo que ya está bien</h3><div class="mia-cam">${fort.map(o => `<div class="mia-c f"><span class="sc">${esc(o.seccion || 'General')}</span><p>${esc(o.texto)}</p></div>`).join('')}</div>` : ''}
        ${sug.length ? `<h3 style="margin:22px 0 10px">Sugerencias para mejorarla</h3><div class="mia-cam">${sug.map(o => `<div class="mia-c s"><span class="sc">${esc(o.seccion || 'General')}</span><p>${esc(o.texto)}</p></div>`).join('')}</div>` : ''}
        <div style="margin-top:18px"><button class="btn maiz" id="miaAhora">${ic('chispa')}Ahora sí, mejórala</button></div>`
      : `${R.cambios.length ? `<div class="mia-cam">${R.cambios.map(c => `<div class="mia-c"><span class="sc">${esc(c.seccion || 'General')}</span><p>${esc(c.que)}</p>${c.porque ? `<p class="pq">${esc(c.porque)}</p>` : ''}</div>`).join('')}</div>` : '<p style="color:var(--gris)">Sin cambios que reportar.</p>'}
        ${R.observaciones.length ? `<h3 style="margin:22px 0 10px">Para que usted lo revise</h3><div class="mia-cam">${R.observaciones.map(o => `<div class="mia-c ${o.tipo === 'fortaleza' ? 'f' : 's'}"><span class="sc">${esc(o.seccion || 'General')}</span><p>${esc(o.texto)}</p></div>`).join('')}</div>` : ''}`,
    formato: () => `<div class="hoja-l"><h3>${esc(F.titulo || 'Formato de su planeación')}</h3><p style="color:var(--gris);font-size:14.5px">Hoja ${F.orientacion === 'horizontal' ? 'horizontal' : 'vertical'}${(F.encabezado || []).length ? ' · Encabezado: ' + F.encabezado.map(esc).join(', ') : ''}</p>
       <ol style="margin:12px 0 0 20px;padding:0">${(F.secciones || []).map(s => `<li style="margin:6px 0"><b>${esc(s.titulo)}</b> <span style="color:var(--gris);font-size:14px">${s.tipo === 'tabla' ? '· tabla: ' + (s.columnas || []).map(esc).join(' · ') : s.tipo === 'lista' ? '· lista' : ''}</span></li>`).join('')}</ol>
       ${F.notas ? `<p style="margin-top:12px;font-size:15px"><b>Su estilo:</b> ${esc(F.notas)}</p>` : ''}
       <div style="margin-top:16px">${R.modo === 'nueva' || mismo ? `<p style="color:var(--jade);font-weight:700">${ic('check', 'style="width:16px;height:16px;vertical-align:-3px"')} Es el formato que Tlamatini usa para sus planeaciones nuevas.</p>`
        : `<button class="btn pri" id="miaUsarF">${ic('check')}Usar este formato en mis planeaciones nuevas</button>${guardado ? '<p style="color:var(--gris);font-size:13.5px;margin-top:6px">Reemplaza el formato que tenía guardado.</p>' : ''}`}</div></div>`
  };
  $('#app').innerHTML = topBar('Tlamatini · Planeación didáctica', rev ? 'Revisión de mi planeación' : 'Mi planeación', `<button class="btn sec chico" id="miaOtra">Otra</button>`) + `<main class="wrap">
   <section class="portada"><div class="sup"><span class="pill">${rev ? 'Revisada' : R.modo === 'nueva' ? 'Nueva, en su formato' : 'Mejorada, en su formato'}</span><span class="pill">${(D.secciones || []).length} apartados</span>${R.origen ? `<span class="pill">De «${esc(R.origen)}»</span>` : ''}</div>
    <h1>${esc(D.titulo)}</h1>${R.resumen ? `<p class="fechas" style="max-width:70ch;margin-top:8px">${esc(R.resumen)}</p>` : ''}</section>
   <div style="margin-top:22px"><nav class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-mt="${k}" aria-selected="${MIA.tab === k}">${l}</button>`).join('')}</nav>
    <section id="panel">${panel[MIA.tab]()}</section></div></main>`;
  $('#atras').onclick = () => { E.vista = 'inicio'; pintar(); scrollTo(0, 0); };
  $('#miaOtra').onclick = () => { E.vista = 'inicio'; pintar(); scrollTo(0, 0); };
  $$('[data-mt]').forEach(b => b.onclick = () => { miaCapturarEdicion(); MIA.tab = b.dataset.mt; repinta(); });
  if (MIA.tab === 'doc') {
    let tm; const h = $('#miaHoja'); h.oninput = () => { clearTimeout(tm); tm = setTimeout(miaCapturarEdicion, 700); };
    $$('[data-doc]').forEach(b => b.addEventListener('click', () => miaCapturarEdicion(), true));
    miaPagina(F.orientacion === 'horizontal'); docBotones();
    $$('[data-doc="word"]').forEach(b => b.onclick = () => miaWordDescargar(D.titulo, F.orientacion === 'horizontal'));
  }
  const ah = $('#miaAhora'); if (ah) ah.onclick = () => { MIA.accion = 'mejorar'; toast('Vuelva a subir su planeación y elija <b>Mejorarla</b>. Las sugerencias quedan guardadas en «Sus planeaciones anteriores».', 6500); E.vista = 'inicio'; pintar(); scrollTo(0, 0); };
  const uf = $('#miaUsarF'); if (uf) uf.onclick = () => { miaLs.set(MIA_FMT, Object.assign({ fecha: R.fecha, origen: R.origen }, F)); toast('Listo: sus planeaciones nuevas saldrán con este formato.'); repinta(); };
}
function miaCapturarEdicion() { const h = $('#miaHoja'); if (!h || !MIA.res) return; MIA.res.html = h.innerHTML; miaGuardarHist(); }
function miaPagina(horiz) { let s = $('#miaPag'); if (!s) { s = document.createElement('style'); s.id = 'miaPag'; document.head.appendChild(s); } s.textContent = `@page{size:letter ${horiz ? 'landscape' : 'portrait'};margin:1.5cm}`; }
function miaWordDescargar(titulo, horiz) {
  const h = $('#miaHoja'); if (!h) return;
  const css = `@page Section1{size:${horiz ? '27.94cm 21.59cm;mso-page-orientation:landscape' : '21.59cm 27.94cm'};margin:1.5cm}div.Section1{page:Section1}body{font-family:Calibri,Arial,sans-serif;color:#111;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:4pt;vertical-align:top;text-align:left}th{background:#E9EDF5;color:#1F3A6B}h1{font-size:16pt;text-align:center;color:#1F3A6B}h3{font-size:12pt;color:#1F3A6B;background:#E9EDF5;padding:3pt 6pt;margin:12pt 0 4pt}p{margin:0 0 4pt}.sub{text-align:center}.firmas{margin-top:40pt}.firmas div{display:inline-block;width:45%;margin:0 2%;border-top:1px solid #333;text-align:center;padding-top:4pt}`;
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>${css}</style></head><body><div class="Section1">${h.innerHTML}</div></body></html>`;
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + html], { type: 'application/msword' }));
  a.download = (String(titulo || 'Planeación').replace(/[\\/:*?"<>|]+/g, '').slice(0, 80) || 'Planeación') + '.doc'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
