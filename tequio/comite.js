'use strict';
/* =========================================================
   TEQUIO · Comité de Planeación y Evaluación del PMC
   © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez.
   Fundamento: LGE, art. 109 (cada CTE cuenta con un Comité de Planeación y Evaluación que formula el Programa de
   Mejora Continua) y Lineamientos para la integración, operación y funcionamiento de los CTE (Acuerdo 05/04/24),
   arts. 18 y 19. La Guía Operativa retoma su operación: se conforma o ratifica en la Fase Intensiva del CTE.
   - La dirección da de alta a su comité (integrantes, función, correo y celular) y las acciones del PMC con su fecha,
     su periodo o como permanentes. Cada acción se evalúa con semáforo (verde, amarillo, rojo) y queda su historial.
   - Calendario del comité (y descarga para Google Calendar o el celular).
   - Cada mañana de día hábil el servidor avisa por correo al comité lo que no se realizó en tiempo, lo que vence en
     3 días y lo permanente que no se ha evaluado en su periodo.
   - La Mesa Técnica ve el avance de todas sus escuelas y puede apoyar en la captura.
   Este archivo se carga antes del programa principal de Tequio y usa sus utilidades (S, vista, api, modal…).
   ========================================================= */
const COM_VER = 89;
let COM = null;
const COM_SEM = { v: ['Verde', 'Se realizó / se está logrando', '#1E7A46', 'ok'], a: ['Amarillo', 'En proceso o requiere ajustes', '#B7791F', 'aviso'], r: ['Rojo', 'No se realizó / sin avance', '#B3261E', 'mal'] };
const COM_EJ = { si: 'Sí se realizó', parcial: 'Se realizó en parte', no: 'No se realizó' };
const COM_SIT = { vencida: ['No se realizó en tiempo', 'mal'], porvencer: ['Por vencer', 'aviso'], sineval: ['Toca evaluarla', 'aviso'], encurso: ['En curso', 'indigo'],
  porini: ['Por iniciar', ''], realizada: ['Realizada', 'ok'], concluida: ['Concluida', 'ok'], cancelada: ['Cancelada', ''] };
const COM_FUN = { coord: 'Coordinación', secre: 'Secretaría', vocal: 'Integrante' };
const COM_FREC = { semanal: ['Cada semana', 7], quincenal: ['Cada quincena', 15], mensual: ['Cada mes', 31], cte: ['En cada sesión de CTE', 31], bimestral: ['Cada dos meses', 62], trimestral: ['Cada trimestre', 92] };
const COM_TIPO = { unica: 'En una fecha', periodo: 'En un periodo', permanente: 'Permanente' };
const COM_CARGOS = ['Director(a)', 'Encargado(a) de despacho', 'Subdirector(a)', 'Docente frente a grupo', 'Docente de Educación Física', 'Docente de apoyo (USAER)', 'Otro'];
const COM_AMB = () => (typeof MIN_AMB !== 'undefined' ? MIN_AMB : []);

const comListo = () => (cfg && cfg.demo) || (S.version || 0) >= COM_VER;
const comCiclo = () => { const d = new Date(), y = d.getFullYear(); return d.getMonth() >= 7 ? y + '-' + (y + 1) : (y - 1) + '-' + y; };
const comHoy = () => (COM && COM.hoy) || hoy();
const comCpe = cct => COM.cpe.find(x => x.cct === cct) || null;
const comAcc = cct => COM.cpa.filter(x => x.cct === cct && x.activo !== false);
const comUlt = a => { const e = a.evals || []; return e[e.length - 1] || null; };
const comPuede = cct => esDirector() ? cct === miCct() : (COM.escuelas || []).includes(cct);
function comSit(a, h = comHoy()) {
  if (a.estado === 'cancelada') return 'cancelada';
  const u = comUlt(a);
  if (a.tipo === 'permanente') {
    if (a.inicio && a.inicio > h) return 'porini';
    if (a.fin && a.fin < h) return 'concluida';
    const base = u ? u.f : a.inicio;
    return base && sumarDias(base, (COM_FREC[a.frecuencia] || COM_FREC.mensual)[1]) < h ? 'sineval' : 'encurso';
  }
  if (a.estado === 'realizada') return 'realizada';
  if (a.fin && a.fin < h) return 'vencida';
  if (a.fin && a.fin <= sumarDias(h, 3)) return 'porvencer';
  return a.inicio && a.inicio > h ? 'porini' : 'encurso';
}
// Color que se ve en la acción: el de su última evaluación; si no se realizó en tiempo y nadie la evaluó, rojo
function comColor(a) { const u = comUlt(a), s = comSit(a); if (s === 'cancelada') return ''; if (s === 'vencida' && (!u || u.f < a.fin)) return 'r'; return u ? u.sem : ''; }
function comResumen(cct) {
  const l = comAcc(cct).filter(a => a.estado !== 'cancelada'), r = { n: l.length, v: 0, a: 0, r: 0, s: 0, venc: 0, prox: 0, eval: 0 };
  l.forEach(a => { const c = comColor(a); r[c || 's']++; const s = comSit(a); if (s === 'vencida') r.venc++; if (s === 'porvencer') r.prox++; if (s === 'sineval') r.eval++; });
  r.pct = r.n ? Math.round(100 * (r.v + r.a * 0.5) / r.n) : null;
  return r;
}
const comPunto = (c, t = 16) => `<span class="com-pto${c ? ' ' + c : ''}" style="width:${t}px;height:${t}px" title="${c ? esc(COM_SEM[c][0] + ': ' + COM_SEM[c][1]) : 'Sin evaluar'}"></span>`;
function comBarra(r) {
  if (!r.n) return '<div class="com-barra vacia"></div>';
  const p = k => (100 * r[k] / r.n).toFixed(2) + '%';
  return `<div class="com-barra" role="img" aria-label="${r.v} en verde, ${r.a} en amarillo, ${r.r} en rojo y ${r.s} sin evaluar"><i class="v" style="width:${p('v')}"></i><i class="a" style="width:${p('a')}"></i><i class="r" style="width:${p('r')}"></i><i class="s" style="width:${p('s')}"></i></div>`;
}
const comNomResp = (cct, ids) => (ids || []).map(id => id === 'todos' ? 'Todo el colectivo' : ((comCpe(cct) || { integrantes: [] }).integrantes.find(p => p.id === id) || {}).n).filter(Boolean);
function comCuando(a) {
  if (a.tipo === 'permanente') return `Permanente · ${(COM_FREC[a.frecuencia] || COM_FREC.mensual)[0].toLowerCase()}${a.fin ? ' · hasta ' + fechaCorta(a.fin) : ''}`;
  if (a.tipo === 'periodo') return `Del ${fechaCorta(a.inicio)} al ${fechaCorta(a.fin)}`;
  return fechaLarga(a.fin);
}

(function () {
  const st = document.createElement('style');
  st.textContent = `
.com-pto{display:inline-block;flex:none;border-radius:50%;background:#fff;border:2px dashed #B9AE9C;vertical-align:middle}
.com-pto.v{background:#1E7A46;border:0}.com-pto.a{background:#E0A526;border:0}.com-pto.r{background:#B3261E;border:0}
.com-barra{display:flex;height:12px;border-radius:999px;overflow:hidden;background:var(--arena-2);min-width:90px}
.com-barra i{display:block;height:100%}.com-barra .v{background:#1E7A46}.com-barra .a{background:#E0A526}.com-barra .r{background:#B3261E}.com-barra .s{background:#D9CFBF}
.com-cifras{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:12px 0}
.com-cif{background:var(--arena-2);border-radius:10px;padding:10px 12px;text-align:center;border:0;font:inherit;color:inherit}
.com-cif b{display:block;font-size:24px;line-height:1.1}.com-cif span{font-size:12.5px;color:var(--gris)}
button.com-cif{cursor:pointer}button.com-cif:hover,button.com-cif[aria-pressed=true]{box-shadow:inset 0 0 0 2px var(--indigo)}
.com-int{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.com-int .p{display:flex;align-items:center;gap:8px;background:var(--arena-2);border-radius:12px;padding:6px 10px;font-size:14px}
.com-int .p small{display:block;color:var(--gris);font-size:12px}
.com-subs{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0 10px}
.com-subs button{font:inherit;font-weight:600;font-size:14.5px;padding:7px 14px;border-radius:999px;border:1px solid var(--borde);background:var(--papel);cursor:pointer;color:inherit}
.com-subs button[aria-pressed=true]{background:var(--indigo);border-color:var(--indigo);color:#fff}
.com-amb{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--terra-d);padding:14px 16px 4px}
.com-acc{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:10px;align-items:start;padding:12px 16px;border-top:1px solid var(--borde)}
.com-acc .tx>b{display:block;font-weight:600;line-height:1.35}
.com-acc .tx .ayuda{margin-top:3px}
.com-acc .bt{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.com-acc details{margin-top:6px}.com-acc summary{cursor:pointer;font-size:13px;color:var(--indigo)}
.com-ev{border-left:3px solid var(--borde);padding:4px 0 4px 10px;margin:6px 0;font-size:13.5px}
.com-semsel{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.com-semsel button{font:inherit;border:2px solid var(--borde);border-radius:12px;background:#fff;padding:10px 6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;color:inherit}
.com-semsel button span{font-size:12.5px;color:var(--gris);text-align:center;line-height:1.25}
.com-semsel button[aria-pressed=true]{border-color:var(--indigo);background:#EEF2F9}
.com-fila-int{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr) 34px;gap:6px;align-items:start;padding:10px 0;border-top:1px solid var(--borde)}
.com-fila-int .sub{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto;gap:6px;align-items:center}
.com-fila-int input,.com-fila-int select{border:1px solid var(--borde);border-radius:9px;padding:8px 10px;background:#fff;width:100%;min-height:40px;font:inherit}
@media (max-width:640px){.com-fila-int{grid-template-columns:1fr 34px}.com-fila-int>*:nth-child(2),.com-fila-int>*:nth-child(3){grid-column:1}.com-fila-int .sub{grid-template-columns:1fr}.com-acc{grid-template-columns:22px minmax(0,1fr)}.com-acc .bt{grid-column:2;justify-content:flex-start}}
.com-imp{display:grid;grid-template-columns:26px minmax(0,1fr);gap:8px;padding:10px 0;border-top:1px solid var(--borde)}
.com-imp .op{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.com-imp .op select,.com-imp .op input{border:1px solid var(--borde);border-radius:8px;padding:6px 8px;font:inherit;background:#fff}
.com-norma li{margin:4px 0}
.dia .ev.com-v{background:var(--ok-f);color:var(--ok)}.dia .ev.com-r{background:var(--alerta-f);color:var(--alerta)}.dia .ev.com-a{background:var(--aviso-f);color:#8A5A0B}`;
  document.head.appendChild(st);
})();

async function comCargar() {
  try {
    const r = await api('cpeDatos', { ciclo: comCiclo(), escuelas: esDirector() ? [miCct()] : directores().map(c => c.cct) });
    COM = { ciclo: r.ciclo, escuelas: r.escuelas || [], hoy: r.hoy || hoy(), cpe: r.cpe || [], cpa: r.cpa || [], pmc: r.pmc || [] };
  } catch (e) { COM = { error: e.message }; }
}

/* ---------------- Vista principal ---------------- */
function vComite() {
  const cab = (acc = '', vol = '') => `<div class="titulo-vista">${vol}<h1>Comité de Planeación y Evaluación</h1><div class="acciones">${acc}</div></div>`;
  if (!comListo()) {
    $('#vista').innerHTML = cab() + `<div class="tarjeta pad"><p style="margin-top:0"><b>Falta actualizar el servidor de Tequio</b> (versión ${COM_VER}) para usar el seguimiento del Comité del PMC.</p>${esAdmin() ? '<a class="boton" href="instalacion.html#actualizar">Ver cómo actualizar el servidor</a>' : '<p class="peq mudo" style="margin-bottom:0">La actualización la hace la Supervisión.</p>'}</div>`;
    return;
  }
  if (!COM) { $('#vista').innerHTML = cab() + '<div class="tarjeta vacio">Cargando el seguimiento del comité…</div>'; Promise.all([comCargar(), Array.isArray(S.trb) ? null : perCargar()]).then(() => { if (vista.tab === 'comite') vComite(); }); return; }
  if (COM.error) { $('#vista').innerHTML = cab() + `<div class="tarjeta pad"><p style="margin-top:0">${esc(COM.error)}</p><button class="boton sec" id="cm-otra">Intentar de nuevo</button></div>`; $('#cm-otra').onclick = () => { COM = null; vComite(); }; return; }
  if (esDirector()) return vComiteEscuela(miCct(), cab);
  if (vista.comEsc && COM.escuelas.includes(vista.comEsc)) return vComiteEscuela(vista.comEsc, cab);
  vComiteZona(cab);
}

/* ---------------- Mesa Técnica: avance de todas sus escuelas ---------------- */
function vComiteZona(cab) {
  const fAtp = esAdmin() && vista.comAtp ? usuario(vista.comAtp) : null, deAtp = fAtp ? escuelasDeAtp(fAtp) : null;
  const escs = COM.escuelas.map(escuelaDe).filter(Boolean).filter(c => !deAtp || deAtp.includes(c.cct))
    .sort((a, b) => a.municipio.localeCompare(b.municipio, 'es') || a.escuela.localeCompare(b.escuela, 'es'));
  const T = { n: 0, v: 0, a: 0, r: 0, s: 0, venc: 0, conf: 0 };
  const filas = escs.map(c => {
    const cp = comCpe(c.cct), r = comResumen(c.cct), at = atpDe(c.cct);
    ['n', 'v', 'a', 'r', 's', 'venc'].forEach(k => T[k] += r[k]); if (cp) T.conf++;
    const ult = comAcc(c.cct).map(comUlt).filter(Boolean).map(e => e.f).sort().pop();
    return `<tr data-cmesc="${c.cct}" style="cursor:pointer"><td class="esc-col"><b>${esc(c.escuela)}</b><div class="ayuda">${esc(c.municipio)}${c.multigrado ? ' · multigrado' : ''}${esAdmin() && at ? ' · ATP: ' + esc(nombreCorto(at.nombre)) : ''}</div></td>
      <td>${cp ? `<span class="chip ok">${cp.integrantes.length} integrantes</span>` : '<span class="chip mal">Sin registrar</span>'}</td>
      <td>${r.n || '—'}</td><td style="min-width:120px">${comBarra(r)}<div class="ayuda" style="margin-top:3px">${r.v} · ${r.a} · ${r.r}${r.s ? ' · ' + r.s + ' sin evaluar' : ''}</div></td>
      <td>${r.venc ? `<span class="chip mal">${r.venc}</span>` : r.n ? '<span class="chip ok">0</span>' : '—'}</td>
      <td class="ayuda">${ult ? fechaCorta(ult) : '—'}</td><td><button class="boton sec chico" data-cmesc="${c.cct}">Ver</button></td></tr>`;
  }).join('');
  const intro = `<div class="aviso-caja">Cada escuela registra aquí a su <b>Comité de Planeación y Evaluación</b> y las acciones de su <b>Programa de Mejora Continua</b>, con su fecha o como permanentes, y las evalúa con semáforo. Si una acción no se realiza en tiempo, al comité le llega un aviso por correo. Usted puede entrar a cada escuela para revisar o apoyar en la captura.</div>`;
  $('#vista').innerHTML = cab(`<button class="boton sec" id="cm-norma">Funciones del comité</button>`) + intro + `
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
    ${esAdmin() && atps().length ? `<select id="cm-atp" aria-label="Ver las escuelas de" style="padding:8px 10px;border:1px solid var(--borde);border-radius:9px;background:var(--papel);font:inherit"><option value="">Todas las escuelas</option>${atps().map(u => `<option value="${u.id}"${vista.comAtp === u.id ? ' selected' : ''}>ATP: ${esc(nombreCorto(u.nombre))}</option>`).join('')}</select>` : ''}
    <span class="peq mudo">Ciclo ${esc(COM.ciclo)}</span>
    <button class="boton sec chico" id="cm-act" style="margin-left:auto">Actualizar</button>
  </div>
  <div class="com-cifras">
    <div class="com-cif"><b>${T.conf} de ${escs.length}</b><span>escuelas con comité registrado</span></div>
    <div class="com-cif"><b>${T.n}</b><span>acciones del PMC</span></div>
    <div class="com-cif"><b style="color:#1E7A46">${T.v}</b><span>en verde</span></div>
    <div class="com-cif"><b style="color:#B7791F">${T.a}</b><span>en amarillo</span></div>
    <div class="com-cif"><b style="color:#B3261E">${T.r}</b><span>en rojo</span></div>
    <div class="com-cif"><b style="color:#B3261E">${T.venc}</b><span>no se realizaron en tiempo</span></div>
  </div>
  <div class="tarjeta"><div class="matriz-caja"><table class="matriz"><thead><tr><th class="esc-col">Escuela</th><th>Comité</th><th>Acciones</th><th>Semáforo</th><th>No realizadas en tiempo</th><th>Última evaluación</th><th></th></tr></thead>
  <tbody>${filas || '<tr><td colspan="7" class="vacio">No hay escuelas a su cargo.</td></tr>'}</tbody></table></div></div>`;
  if ($('#cm-atp')) $('#cm-atp').onchange = e => { vista.comAtp = e.target.value; vComite(); };
  $('#cm-act').onclick = async () => { cargando(true); await comCargar(); cargando(false); vComite(); };
  $('#cm-norma').onclick = comNormaModal;
  $$('[data-cmesc]').forEach(b => b.onclick = e => { e.stopPropagation(); vista.comEsc = b.dataset.cmesc; vista.comSub = 'acciones'; vComite(); window.scrollTo(0, 0); });
}

/* ---------------- Una escuela (lo que ve la dirección) ---------------- */
function vComiteEscuela(cct, cab) {
  const cp = comCpe(cct), acc = comAcc(cct), r = comResumen(cct), puede = comPuede(cct), sub = vista.comSub || 'acciones';
  const vol = esDirector() ? '' : `<button class="icono-btn" id="cm-vol" aria-label="Regresar a todas las escuelas">${ico('i-izq')}</button>`;
  const botones = puede ? `<button class="boton" id="cm-nueva">${ico('i-mas')}Nueva acción</button>` : '';
  const pmc = COM.pmc.find(x => x.cct === cct);
  const intCard = cp ? `<div class="tarjeta pad">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><h2 style="font-size:19px">Integrantes del comité</h2>
        ${puede ? `<button class="boton sec chico" id="cm-ed" style="margin-left:auto">${ico('i-lapiz')}Cambiar</button>` : ''}</div>
      <div class="com-int">${cp.integrantes.slice().sort((a, b) => ['coord', 'secre', 'vocal'].indexOf(a.funcion) - ['coord', 'secre', 'vocal'].indexOf(b.funcion)).map(p => `<div class="p"><div><b>${esc(p.n)}</b><small>${esc(COM_FUN[p.funcion] || '')}${p.cargo ? ' · ' + esc(p.cargo) : ''}${p.alertas === false ? ' · sin alertas' : !p.correo ? ' · sin correo' : ''}</small></div>
        ${p.cel ? `<a class="icono-btn" style="width:32px;height:32px" href="${waUrl(p.cel, comTextoPersona(cct, p))}" target="_blank" rel="noopener" title="Avisarle por WhatsApp sus acciones pendientes" aria-label="WhatsApp a ${esc(p.n)}">${ico('i-wa')}</a>` : ''}</div>`).join('')}</div>
      ${cp.datos && (cp.datos.fecha || cp.datos.seguimiento || cp.datos.fuentes || cp.datos.comunicacion) ? `<details style="margin-top:10px"><summary class="peq"><b>Acuerdos del comité</b> (conformación, seguimiento y comunicación)</summary><div class="peq" style="margin-top:6px">
        ${cp.datos.fecha ? `<p style="margin:4px 0"><b>Se conformó:</b> ${esc(fechaLarga(cp.datos.fecha))}${cp.datos.sesion ? ' · ' + esc(cp.datos.sesion) : ''}</p>` : ''}
        ${cp.datos.seguimiento ? `<p style="margin:4px 0"><b>Cuándo se reúne para dar seguimiento:</b> ${esc(cp.datos.seguimiento)}</p>` : ''}
        ${cp.datos.fuentes ? `<p style="margin:4px 0;white-space:pre-line"><b>Fuentes de información para evaluar:</b> ${esc(cp.datos.fuentes)}</p>` : ''}
        ${cp.datos.comunicacion ? `<p style="margin:4px 0;white-space:pre-line"><b>Cómo se informa a la comunidad y a la Supervisión:</b> ${esc(cp.datos.comunicacion)}</p>` : ''}
        ${cp.datos.notas ? `<p style="margin:4px 0;white-space:pre-line"><b>Notas:</b> ${esc(cp.datos.notas)}</p>` : ''}</div></details>` : ''}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
        ${puede ? `<button class="boton sec chico" id="cm-avisar">${ico('i-correo')}Avisar al comité ahora</button>` : ''}
        <button class="boton sec chico" id="cm-wa">${ico('i-wa')}Resumen para WhatsApp</button>
        <button class="boton sec chico" id="cm-ics">${ico('i-cal')}Llevar al calendario del celular</button>
        <button class="boton sec chico" id="cm-imp">${ico('i-graf')}Informe de avance</button>
      </div></div>`
    : `<div class="tarjeta pad" style="border-color:var(--terra)"><h2 style="font-size:19px;margin-bottom:6px">Registre a su comité</h2>
      <p class="peq" style="margin:0 0 10px">El Comité de Planeación y Evaluación se conforma (o se ratifica) en la Fase Intensiva del CTE, con personal directivo y docentes que propone el colectivo. Regístrelo para que a sus integrantes les lleguen los avisos de las acciones del PMC.</p>
      ${puede ? `<button class="boton" id="cm-ed">${ico('i-mas')}Registrar a los integrantes</button>` : '<p class="peq mudo" style="margin:0">La escuela todavía no registra a su comité.</p>'}</div>`;
  const cif = (n, t, color, f) => `<button class="com-cif" data-cmf="${f}" aria-pressed="${vista.comF === f}"><b${color ? ` style="color:${color}"` : ''}>${n}</b><span>${t}</span></button>`;
  const cifras = acc.length ? `<div class="com-cifras">
      ${cif(r.n, 'acciones', '', '')}${cif(r.v, 'en verde', '#1E7A46', 'v')}${cif(r.a, 'en amarillo', '#B7791F', 'a')}${cif(r.r, 'en rojo', '#B3261E', 'r')}
      ${cif(r.venc, 'no se realizaron en tiempo', '#B3261E', 'venc')}${cif(r.prox + r.eval, 'por vencer o por evaluar', '#B7791F', 'prox')}
    </div><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">${comBarra(r)}<b style="white-space:nowrap">${r.pct == null ? '' : r.pct + ' % de avance'}</b></div><p class="ayuda" style="margin:0 0 4px">Avance: las acciones en verde cuentan completas y las de amarillo, a la mitad.</p>` : '';
  const subs = `<div class="com-subs" role="group" aria-label="Ver">${[['acciones', 'Acciones del PMC'], ['calendario', 'Calendario'], ['norma', 'Funciones del comité']].map(([k, t]) => `<button data-cmsub="${k}" aria-pressed="${sub === k}">${t}</button>`).join('')}</div>`;
  let cuerpo = '';
  if (sub === 'acciones') cuerpo = comListaHTML(cct, puede, pmc);
  else if (sub === 'calendario') cuerpo = comCalendarioHTML(cct);
  else cuerpo = `<div class="tarjeta pad">${comNormaHTML()}</div>`;
  $('#vista').innerHTML = cab(botones, vol) + `<p class="peq mudo" style="margin:-6px 0 12px"><b>${esc(nombreEscuela(cct))}</b> · Ciclo ${esc(COM.ciclo)} · Programa de Mejora Continua</p>` + intCard + cifras + subs + cuerpo;
  if ($('#cm-vol')) $('#cm-vol').onclick = () => { vista.comEsc = null; vista.comF = ''; vComite(); };
  if ($('#cm-nueva')) $('#cm-nueva').onclick = () => cp ? comFormAccion(cct) : (aviso('Primero registre a los integrantes del comité.', 'aviso', 4000), comFormComite(cct));
  if ($('#cm-ed')) $('#cm-ed').onclick = () => comFormComite(cct);
  if ($('#cm-avisar')) $('#cm-avisar').onclick = () => accion('cpeAvisar', { cct, ciclo: COM.ciclo }, x => aviso(esc(x.mensaje || 'Aviso enviado.'), 'ok', 6000));
  if ($('#cm-wa')) $('#cm-wa').onclick = () => window.open('https://wa.me/?text=' + encodeURIComponent(comTextoResumen(cct)), '_blank');
  if ($('#cm-ics')) $('#cm-ics').onclick = () => comIcs(cct);
  if ($('#cm-imp')) $('#cm-imp').onclick = () => comInforme(cct);
  $$('[data-cmf]').forEach(b => b.onclick = () => { vista.comF = vista.comF === b.dataset.cmf ? '' : b.dataset.cmf; vista.comSub = 'acciones'; vComite(); });
  $$('[data-cmsub]').forEach(b => b.onclick = () => { vista.comSub = b.dataset.cmsub; vComite(); });
  comLigarLista(cct);
  comLigarCalendario(cct);
}

function comListaHTML(cct, puede, pmc) {
  const f = vista.comF || '';
  let l = comAcc(cct);
  if (f === 'v' || f === 'a' || f === 'r') l = l.filter(a => comColor(a) === f);
  if (f === 'venc') l = l.filter(a => comSit(a) === 'vencida');
  if (f === 'prox') l = l.filter(a => ['porvencer', 'sineval'].includes(comSit(a)));
  const orden = { vencida: 0, porvencer: 1, sineval: 2, encurso: 3, porini: 4, realizada: 5, concluida: 6, cancelada: 7 };
  const amb = [...new Set(l.map(a => a.ambito || 'Sin ámbito'))].sort((a, b) => { const A = COM_AMB(), i = A.indexOf(a), j = A.indexOf(b); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j) || a.localeCompare(b, 'es'); });
  const fila = a => {
    const s = comSit(a), u = comUlt(a), resp = comNomResp(cct, a.responsables);
    return `<div class="com-acc"><div style="padding-top:2px">${comPunto(comColor(a), 18)}</div>
      <div class="tx"><b${s === 'cancelada' ? ' style="text-decoration:line-through;opacity:.6"' : ''}>${esc(a.accion)}</b>
        <div class="ayuda">${esc(comCuando(a))}${resp.length ? ' · ' + esc(resp.join(', ')) : ''}</div>
        ${a.meta ? `<div class="ayuda"><b>Meta:</b> ${esc(a.meta)}</div>` : ''}
        ${a.evidencia ? `<div class="ayuda"><b>Evidencia:</b> ${esc(a.evidencia)}</div>` : ''}
        <div style="margin-top:5px;display:flex;gap:6px;flex-wrap:wrap"><span class="chip ${COM_SIT[s][1]}">${COM_SIT[s][0]}</span>${u ? `<span class="chip">${esc(COM_EJ[u.ej] || COM_SEM[u.sem][0])} · ${esc(fechaCorta(u.f))}</span>` : ''}</div>
        ${(a.evals || []).length ? `<details><summary>Historial de evaluaciones (${a.evals.length})</summary>${a.evals.slice().reverse().map(e => `<div class="com-ev">${comPunto(e.sem, 11)} <b>${esc(fechaCorta(e.f))}</b> · ${esc(COM_EJ[e.ej] || COM_SEM[e.sem][1])}${e.nota ? `<div style="white-space:pre-line">${esc(e.nota)}</div>` : ''}${e.evid ? `<div><a href="${esc(/^https?:/.test(e.evid) ? e.evid : '#')}" target="_blank" rel="noopener">${esc(e.evid)}</a></div>` : ''}<div class="ayuda">${esc(nombreCorto(e.porN || ''))}</div></div>`).join('')}</details>` : ''}
      </div>
      <div class="bt">${puede && s !== 'cancelada' ? `<button class="boton chico" data-cmev="${a.id}">Evaluar</button>` : ''}${puede ? `<button class="boton sec chico" data-cmac="${a.id}" aria-label="Cambiar la acción">${ico('i-lapiz')}</button>` : ''}</div></div>`;
  };
  const vacio = !comAcc(cct).length;
  return `${puede && (pmc || vacio) ? `<div class="aviso-caja" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${pmc ? `<span>Tequio ya leyó el PMC que la escuela subió al Drive: puede traer sus acciones y solo ponerles fechas.</span><button class="boton sec chico" id="cm-imp-pmc" style="margin-left:auto">Traer las acciones del PMC</button>` : '<span>Agregue las acciones de su PMC con «Nueva acción»: a cada una póngale fecha, periodo o déjela como permanente, y a sus responsables.</span>'}</div>` : ''}
  ${f ? `<p class="peq" style="margin:0 0 8px">Mostrando solo: <b>${esc({ v: 'en verde', a: 'en amarillo', r: 'en rojo', venc: 'no realizadas en tiempo', prox: 'por vencer o por evaluar' }[f])}</b> · <a href="#" id="cm-quitaf">ver todas</a></p>` : ''}
  <div class="tarjeta">${l.length ? amb.map(m => `<div class="com-amb">${esc(m)}</div>` + l.filter(a => (a.ambito || 'Sin ámbito') === m).sort((x, y) => orden[comSit(x)] - orden[comSit(y)] || String(x.fin || x.inicio).localeCompare(String(y.fin || y.inicio))).map(fila).join('')).join('')
    : `<div class="vacio">${vacio ? 'Todavía no hay acciones registradas.' : 'No hay acciones con ese filtro.'}</div>`}</div>`;
}
function comLigarLista(cct) {
  $$('[data-cmev]').forEach(b => b.onclick = () => comFormEvaluar(b.dataset.cmev));
  $$('[data-cmac]').forEach(b => b.onclick = () => comFormAccion(cct, b.dataset.cmac));
  if ($('#cm-imp-pmc')) $('#cm-imp-pmc').onclick = () => comFormImportar(cct);
  if ($('#cm-quitaf')) $('#cm-quitaf').onclick = e => { e.preventDefault(); vista.comF = ''; vComite(); };
}

/* ---------------- Calendario del comité ---------------- */
function comEventos(cct) {
  const ev = [], h = comHoy();
  comAcc(cct).filter(a => a.estado !== 'cancelada').forEach(a => {
    const c = comColor(a), cls = c ? 'com-' + c : '';
    if (a.tipo === 'unica') ev.push({ f: a.fin, t: a.accion, a, cls, k: 'Se realiza' });
    else if (a.tipo === 'periodo') { ev.push({ f: a.inicio, t: 'Inicia: ' + a.accion, a, cls: '', k: 'Inicia' }); ev.push({ f: a.fin, t: 'Vence: ' + a.accion, a, cls, k: 'Fecha límite' }); }
    else {
      const d = (COM_FREC[a.frecuencia] || COM_FREC.mensual)[1], u = comUlt(a);
      let f = u ? sumarDias(u.f, d) : sumarDias(a.inicio || h, d), n = 0;
      const lim = a.fin || (+COM.ciclo.slice(5) + '-07-15');
      while (f <= lim && n++ < 40) { ev.push({ f, t: 'Evaluar: ' + a.accion, a, cls: 'terra', k: 'Toca evaluar' }); f = sumarDias(f, d); }
    }
  });
  return ev;
}
function comCalendarioHTML(cct) {
  const ev = comEventos(cct), m = vista.comMes || comHoy().slice(0, 7), [y, mo] = m.split('-').map(Number);
  const pri = new Date(y, mo - 1, 1, 12), ini = new Date(pri); ini.setDate(1 - ((pri.getDay() + 6) % 7));
  let dias = '';
  for (let i = 0; i < 42; i++) {
    const d = new Date(ini); d.setDate(ini.getDate() + i); const f = iso(d), es = ev.filter(e => e.f === f), fuera = d.getMonth() !== mo - 1;
    if (i >= 35 && fuera) break;
    dias += `<button class="dia${fuera ? ' fuera' : ''}${f === comHoy() ? ' hoy' : ''}${vista.comDia === f ? ' sel' : ''}${d.getDay() % 6 === 0 ? ' finde' : ''}" data-cmdia="${f}"><span class="n">${d.getDate()}</span>${es.slice(0, 2).map(e => `<span class="ev ${e.cls}">${esc(e.t)}</span>`).join('')}${es.length > 2 ? `<span class="mas">+${es.length - 2} más</span>` : ''}${es.length ? `<span class="puntos">${es.slice(0, 3).map(() => '•').join('')}</span>` : ''}</button>`;
  }
  const sel = vista.comDia && vista.comDia.slice(0, 7) === m ? vista.comDia : null;
  const lista = (sel ? ev.filter(e => e.f === sel) : ev.filter(e => e.f.slice(0, 7) === m)).sort((a, b) => a.f.localeCompare(b.f));
  return `<div class="agenda"><div class="tarjeta"><div class="cal-cab"><button class="icono-btn" id="cm-mant" aria-label="Mes anterior">${ico('i-izq')}</button><h2>${MESES[mo - 1]} ${y}</h2><button class="icono-btn" id="cm-msig" aria-label="Mes siguiente">${ico('i-der')}</button></div>
    <div class="cal">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(x => `<div class="dsem">${x}</div>`).join('')}${dias}</div></div>
    <div class="tarjeta"><div class="seccion-t">${sel ? esc(fechaLarga(sel)) : 'En ' + MESES[mo - 1]}</div>
    ${lista.length ? lista.map(e => `<div class="com-acc" style="grid-template-columns:22px minmax(0,1fr)"><div>${comPunto(comColor(e.a), 14)}</div><div class="tx"><b>${esc(e.a.accion)}</b><div class="ayuda">${esc(e.k)} · ${esc(fechaMedia(e.f))}${comNomResp(cct, e.a.responsables).length ? ' · ' + esc(comNomResp(cct, e.a.responsables).join(', ')) : ''}</div></div></div>`).join('') : '<div class="vacio">Sin actividades del comité.</div>'}
    <p class="ayuda" style="padding:0 16px">Las acciones permanentes aparecen en las fechas en que toca evaluarlas.</p></div></div>`;
}
function comLigarCalendario(cct) {
  const mover = n => { const m = vista.comMes || comHoy().slice(0, 7), [y, mo] = m.split('-').map(Number), d = new Date(y, mo - 1 + n, 1); vista.comMes = d.getFullYear() + '-' + pad(d.getMonth() + 1); vista.comDia = null; vComite(); };
  if ($('#cm-mant')) $('#cm-mant').onclick = () => mover(-1);
  if ($('#cm-msig')) $('#cm-msig').onclick = () => mover(1);
  $$('[data-cmdia]').forEach(b => b.onclick = () => { vista.comDia = vista.comDia === b.dataset.cmdia ? null : b.dataset.cmdia; vComite(); });
}
// Archivo .ics: se abre en Google Calendar, el calendario del iPhone o de Android (cada quien lo agrega a su calendario)
function comIcs(cct) {
  const l = comAcc(cct).filter(a => a.estado !== 'cancelada' && !['realizada', 'concluida'].includes(comSit(a)));
  if (!l.length) return aviso('No hay acciones pendientes para llevar al calendario.', 'aviso', 4000);
  const f = d => d.replace(/-/g, ''), txt = s => String(s || '').replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const RR = { semanal: 'FREQ=WEEKLY', quincenal: 'FREQ=WEEKLY;INTERVAL=2', mensual: 'FREQ=MONTHLY', cte: 'FREQ=MONTHLY', bimestral: 'FREQ=MONTHLY;INTERVAL=2', trimestral: 'FREQ=MONTHLY;INTERVAL=3' };
  const esc0 = nombreEscuela(cct), fin = +COM.ciclo.slice(5) + '0715';
  const ev = l.map(a => {
    const resp = comNomResp(cct, a.responsables).join(', '), desc = txt([a.ambito, a.meta ? 'Meta: ' + a.meta : '', resp ? 'Responsable: ' + resp : '', a.evidencia ? 'Evidencia: ' + a.evidencia : ''].filter(Boolean).join('\n'));
    const base = ['BEGIN:VEVENT', 'UID:' + a.id + '@tequio', 'DTSTAMP:' + f(hoy()) + 'T120000Z', 'DESCRIPTION:' + desc];
    if (a.tipo === 'permanente') { const ini = (comUlt(a) || {}).f ? sumarDias(comUlt(a).f, (COM_FREC[a.frecuencia] || COM_FREC.mensual)[1]) : (a.inicio || hoy());
      base.push('SUMMARY:' + txt('Comité PMC · Evaluar: ' + a.accion), 'DTSTART;VALUE=DATE:' + f(ini), 'DTEND;VALUE=DATE:' + f(sumarDias(ini, 1)), 'RRULE:' + RR[a.frecuencia || 'mensual'] + ';UNTIL=' + (a.fin ? f(a.fin) : fin)); }
    else base.push('SUMMARY:' + txt('Comité PMC · ' + a.accion), 'DTSTART;VALUE=DATE:' + f(a.fin), 'DTEND;VALUE=DATE:' + f(sumarDias(a.fin, 1)), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + txt(a.accion), 'TRIGGER:-P2D', 'END:VALARM');
    return base.concat('END:VEVENT').join('\r\n');
  });
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tequio//Comite PMC//ES', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + txt('Comité PMC · ' + esc0)].concat(ev, 'END:VCALENDAR').join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })); a.download = 'Comite PMC - ' + esc0.replace(/[\\/:*?"<>|]/g, '') + '.ics';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  aviso('Se descargó el calendario. Ábralo en el celular o en Google Calendar para agregar las fechas; también puede mandarlo por WhatsApp a los integrantes.', 'ok', 8000);
}

/* ---------------- Textos para WhatsApp ---------------- */
function comPendientes(cct, filtro) {
  return comAcc(cct).filter(a => ['vencida', 'porvencer', 'sineval', 'encurso', 'porini'].includes(comSit(a)) && (!filtro || filtro(a)))
    .sort((x, y) => String(x.fin || '9').localeCompare(String(y.fin || '9')));
}
function comTextoResumen(cct) {
  const r = comResumen(cct), l = comPendientes(cct), g = s => l.filter(a => comSit(a) === s);
  const lin = a => `• ${a.accion}${a.tipo === 'permanente' ? '' : ' (' + fechaCorta(a.fin) + ')'}${comNomResp(cct, a.responsables).length ? ' — ' + comNomResp(cct, a.responsables).join(', ') : ''}`;
  return [`*Comité de Planeación y Evaluación · ${nombreEscuela(cct)}*`, `Avance del PMC: ${r.pct == null ? '—' : r.pct + ' %'} (🟢 ${r.v} · 🟡 ${r.a} · 🔴 ${r.r}${r.s ? ' · ⚪ ' + r.s + ' sin evaluar' : ''})`, '',
    ...(g('vencida').length ? ['🔴 *No se realizaron en tiempo*', ...g('vencida').map(lin), ''] : []),
    ...(g('porvencer').length ? ['🟡 *Por vencer*', ...g('porvencer').map(lin), ''] : []),
    ...(g('sineval').length ? ['📋 *Toca evaluarlas*', ...g('sineval').map(lin), ''] : []),
    ...(g('encurso').length + g('porini').length ? ['🗓️ *Próximas*', ...g('encurso').concat(g('porini')).filter(a => a.tipo !== 'permanente').slice(0, 8).map(lin), ''] : [])].join('\n').trim();
}
function comTextoPersona(cct, p) {
  const l = comPendientes(cct, a => (a.responsables || []).includes(p.id) || (a.responsables || []).includes('todos'));
  const n = String(p.n || '').split(' ')[0];
  if (!l.length) return `Hola, ${n}. Le comparto que, por ahora, no tiene acciones pendientes del Programa de Mejora Continua. ¡Gracias!`;
  return `Hola, ${n}. Le recuerdo sus acciones del Programa de Mejora Continua (Comité de Planeación y Evaluación):\n` + l.map(a => `• ${a.accion} — ${a.tipo === 'permanente' ? 'permanente' : (comSit(a) === 'vencida' ? 'vencida desde el ' : 'para el ') + fechaCorta(a.fin)}`).join('\n') + '\n¡Gracias!';
}

/* ---------------- Formularios ---------------- */
function comPersonal(cct) {
  if (!Array.isArray(S.trb) || typeof perActivas !== 'function') return [];
  return S.trb.filter(t => t.estado !== 'baja').map(t => ({ t, p: perActivas(t).find(p => p.cct === cct) })).filter(x => x.p && !(typeof LA_APOYO !== 'undefined' && LA_APOYO.test(x.p.funcion || '')))
    .map(({ t, p }) => ({ id: t.id, n: laTitulo(perNombre(t)), f: p.funcion || '', correo: t.correoInst || t.correoPers || '', cel: String(t.celular || '').replace(/\D/g, '').slice(-10) }))
    .sort((a, b) => a.n.localeCompare(b.n, 'es'));
}
const comCargoDe = f => /^director/i.test(f) ? 'Director(a)' : /^encargad/i.test(f) ? 'Encargado(a) de despacho' : /^subdirector/i.test(f) ? 'Subdirector(a)' : /f[ií]sica/i.test(f) ? 'Docente de Educación Física' : /usaer|apoyo/i.test(f) ? 'Docente de apoyo (USAER)' : f ? 'Docente frente a grupo' : '';
function comFormComite(cct) {
  const cp = comCpe(cct), per = comPersonal(cct);
  let filas = cp ? cp.integrantes.map(x => Object.assign({}, x)) : [];
  if (!filas.length) { const d = per.find(x => /^(director|encargad)/i.test(x.f)) || (esDirector() ? { n: S.yo.nombre, correo: S.yo.correo || '', f: 'Director' } : null);
    filas = [d ? { id: uid('i'), n: d.n, cargo: comCargoDe(d.f) || 'Director(a)', funcion: 'coord', correo: d.correo || '', cel: d.cel || '', trb: d.id || '', alertas: true } : { id: uid('i'), n: '', cargo: 'Director(a)', funcion: 'coord', correo: '', cel: '', alertas: true }]; }
  const g = (cp && cp.datos) || {};
  const SES = ['Fase intensiva del CTE', '1.ª sesión ordinaria', '2.ª sesión ordinaria', '3.ª sesión ordinaria', '4.ª sesión ordinaria', 'Otra'];
  const filaHTML = (x, i) => `<div class="com-fila-int" data-i="${i}">
      <input data-k="n" maxlength="140" value="${esc(x.n)}" placeholder="Nombre completo" aria-label="Nombre" list="cm-per">
      <select data-k="cargo" aria-label="Cargo">${COM_CARGOS.map(c => `<option${x.cargo === c ? ' selected' : ''}>${c}</option>`).join('')}</select>
      <select data-k="funcion" aria-label="Función en el comité">${Object.entries(COM_FUN).map(([k, t]) => `<option value="${k}"${x.funcion === k ? ' selected' : ''}>${t}</option>`).join('')}</select>
      <button class="icono-btn" data-quita="${i}" aria-label="Quitar" title="Quitar">${ico('i-x')}</button>
      <div class="sub"><input data-k="correo" type="email" maxlength="120" value="${esc(x.correo || '')}" placeholder="Correo (para los avisos)" aria-label="Correo"><input data-k="cel" inputmode="tel" maxlength="14" value="${esc(x.cel || '')}" placeholder="Celular (WhatsApp)" aria-label="Celular">
        <label class="casilla" style="white-space:nowrap"><input type="checkbox" data-k="alertas"${x.alertas !== false ? ' checked' : ''}> Recibe avisos</label></div></div>`;
  modal(cp ? 'Comité de Planeación y Evaluación' : 'Registrar al comité', `
    <p class="peq" style="margin-top:0">Lo integran el personal directivo y las maestras y maestros que propuso el colectivo en la Fase Intensiva del CTE; el número depende del tamaño de la plantilla. En escuelas multigrado con menos de cuatro docentes puede ser todo el colectivo.</p>
    ${per.length ? `<datalist id="cm-per">${per.map(p => `<option value="${esc(p.n)}">${esc(p.f)}</option>`).join('')}</datalist>
      <div class="campo"><label for="cm-add">Agregar del personal de la escuela</label><select id="cm-add"><option value="">— Elegir —</option>${per.map(p => `<option value="${esc(p.id)}">${esc(p.n)}${p.f ? ' · ' + esc(p.f) : ''}</option>`).join('')}</select></div>` : ''}
    <div id="cm-filas">${filas.map(filaHTML).join('')}</div>
    <button class="boton sec chico" id="cm-mas" style="margin:6px 0 14px">${ico('i-mas')}Agregar a otra persona</button>
    <div class="fila" style="grid-template-columns:1fr 1fr"><div class="campo"><label for="cm-fe">Fecha en que se conformó</label><input id="cm-fe" type="date" value="${esc(g.fecha || '')}"></div>
      <div class="campo"><label for="cm-se">Sesión</label><select id="cm-se"><option value="">—</option>${SES.map(s => `<option${g.sesion === s ? ' selected' : ''}>${s}</option>`).join('')}</select></div></div>
    <div class="campo"><label for="cm-sg">¿Cuándo se reúne el comité para dar seguimiento?</label><input id="cm-sg" maxlength="400" value="${esc(g.seguimiento || '')}" placeholder="Ej. Al cierre de cada mes y antes de cada sesión ordinaria de CTE"></div>
    <div class="campo"><label for="cm-fu">Fuentes de información para evaluar el avance</label><textarea id="cm-fu" maxlength="600" placeholder="Ej. SisAT, EIA, listas de asistencia, registros de lectura, actas de CTE, encuestas a familias">${esc(g.fuentes || '')}</textarea></div>
    <div class="campo"><label for="cm-co">¿Cómo se informa el avance a la comunidad y a la Supervisión?</label><textarea id="cm-co" maxlength="600" placeholder="Ej. Periódico mural cada trimestre, reunión con madres y padres de familia y el informe de fin de ciclo a la Supervisión">${esc(g.comunicacion || '')}</textarea></div>
    <div class="campo"><label for="cm-no">Notas (opcional)</label><textarea id="cm-no" maxlength="1000" style="min-height:60px">${esc(g.notas || '')}</textarea></div>`,
    `<button class="boton sec" id="cm-x">Cancelar</button><button class="boton" id="cm-ok">Guardar</button>`);
  const leer = () => { filas = $$('#cm-filas .com-fila-int').map(d => { const x = filas[+d.dataset.i] || { id: uid('i') }, v = k => d.querySelector(`[data-k="${k}"]`);
    return Object.assign({}, x, { n: v('n').value.trim(), cargo: v('cargo').value, funcion: v('funcion').value, correo: v('correo').value.trim(), cel: v('cel').value.replace(/\D/g, '').slice(-10), alertas: v('alertas').checked }); }); };
  const repintar = () => { $('#cm-filas').innerHTML = filas.map(filaHTML).join(''); ligar(); };
  const ligar = () => {
    $$('[data-quita]').forEach(b => b.onclick = () => { leer(); filas.splice(+b.dataset.quita, 1); repintar(); });
    $$('#cm-filas [data-k="n"]').forEach(inp => inp.onchange = () => { const p = per.find(x => x.n === inp.value.trim()); if (!p) return; leer(); const i = +inp.closest('.com-fila-int').dataset.i;
      filas[i] = Object.assign(filas[i], { trb: p.id, correo: filas[i].correo || p.correo, cel: filas[i].cel || p.cel, cargo: comCargoDe(p.f) || filas[i].cargo }); repintar(); });
  };
  ligar();
  $('#cm-mas').onclick = () => { leer(); filas.push({ id: uid('i'), n: '', cargo: 'Docente frente a grupo', funcion: 'vocal', correo: '', cel: '', alertas: true }); repintar(); const l = $$('#cm-filas [data-k="n"]'); l[l.length - 1].focus(); };
  if ($('#cm-add')) $('#cm-add').onchange = e => { const p = per.find(x => x.id === e.target.value); e.target.value = ''; if (!p) return; leer();
    if (filas.some(x => x.trb === p.id || x.n === p.n)) return aviso(esc(p.n) + ' ya está en el comité.', 'aviso', 3000);
    const vacia = filas.findIndex(x => !x.n), o = { id: uid('i'), n: p.n, cargo: comCargoDe(p.f) || 'Docente frente a grupo', funcion: filas.some(x => x.funcion === 'coord') ? 'vocal' : 'coord', correo: p.correo, cel: p.cel, trb: p.id, alertas: true };
    if (vacia >= 0) filas[vacia] = o; else filas.push(o); repintar(); };
  $('#cm-x').onclick = cerrarModal;
  $('#cm-ok').onclick = () => {
    leer(); const l = filas.filter(x => x.n);
    if (!l.length) return aviso('Agregue al menos a un integrante.', 'mal', 4000);
    if (l.some(x => x.correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x.correo))) return aviso('Revise los correos: alguno no está bien escrito.', 'mal', 5000);
    accion('cpeGuardar', { cct, ciclo: COM.ciclo, integrantes: l, datos: { fecha: $('#cm-fe').value, sesion: $('#cm-se').value, seguimiento: $('#cm-sg').value, fuentes: $('#cm-fu').value, comunicacion: $('#cm-co').value, notas: $('#cm-no').value } }, r => {
      poner(COM.cpe, r.cpe); cerrarModal(); vComite();
      const sin = r.cpe.integrantes.filter(x => x.alertas !== false && !x.correo).length;
      aviso('Comité guardado.' + (sin ? ` ${sin} integrante${sin > 1 ? 's' : ''} sin correo no recibirá${sin > 1 ? 'n' : ''} los avisos.` : ''), sin ? 'aviso' : 'ok', 5000);
    });
  };
}

function comFormAccion(cct, id) {
  const a = id ? COM.cpa.find(x => x.id === id) : null, cp = comCpe(cct) || { integrantes: [] }, pmc = COM.pmc.find(x => x.cct === cct);
  const o = a ? Object.assign({}, a) : { tipo: 'unica', frecuencia: 'mensual', responsables: [], ambito: vista.comUltAmb || '' };
  const amb = COM_AMB().concat(o.ambito && !COM_AMB().includes(o.ambito) ? [o.ambito] : []);
  modal(a ? 'Cambiar la acción' : 'Nueva acción del PMC', `
    <div class="campo"><label for="ca-amb">Ámbito</label><select id="ca-amb"><option value="">—</option>${amb.map(m => `<option${o.ambito === m ? ' selected' : ''}>${esc(m)}</option>`).join('')}</select></div>
    <div class="campo"><label for="ca-obj">Objetivo al que responde (opcional)</label><input id="ca-obj" maxlength="500" value="${esc(o.objetivo || '')}" list="ca-objs"${pmc && pmc.objetivos.length ? ' placeholder="Elija uno de su PMC o escríbalo"' : ''}>${pmc ? `<datalist id="ca-objs">${pmc.objetivos.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}</div>
    <div class="campo"><label for="ca-meta">Meta (opcional)</label><input id="ca-meta" maxlength="500" value="${esc(o.meta || '')}" list="ca-metas">${pmc ? `<datalist id="ca-metas">${pmc.metas.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}</div>
    <div class="campo"><label for="ca-acc">Acción</label><textarea id="ca-acc" maxlength="600" style="min-height:70px" placeholder="Ej. Aplicar la lista de cotejo de lectura en todos los grupos">${esc(o.accion || '')}</textarea></div>
    <div class="campo"><span class="et">¿Cuándo se realiza?</span><div class="com-subs" style="margin:0" role="radiogroup">${Object.entries(COM_TIPO).map(([k, t]) => `<button type="button" data-catipo="${k}" aria-pressed="${o.tipo === k}">${t}</button>`).join('')}</div></div>
    <div class="fila" style="grid-template-columns:1fr 1fr" id="ca-fechas"></div>
    <div class="campo"><span class="et">Responsables</span><div class="casillas">${cp.integrantes.map(p => `<label class="casilla"><input type="checkbox" value="${esc(p.id)}"${(o.responsables || []).includes(p.id) ? ' checked' : ''}> ${esc(p.n)}</label>`).join('')}
      <label class="casilla"><input type="checkbox" value="todos"${(o.responsables || []).includes('todos') ? ' checked' : ''}> Todo el colectivo</label></div>
      <span class="ayuda">Les llega el aviso si la acción no se realiza en tiempo (a quienes tengan correo y avisos activos).</span></div>
    <div class="campo"><label for="ca-ev">Evidencia o indicador para evaluarla (opcional)</label><input id="ca-ev" maxlength="400" value="${esc(o.evidencia || '')}" placeholder="Ej. Listas de cotejo, fotos, registro de asistencia de familias"></div>
    ${a ? `<label class="casilla"><input type="checkbox" id="ca-can"${a.estado === 'cancelada' ? ' checked' : ''}> El colectivo decidió cancelar esta acción</label>` : ''}`,
    `${a ? '<button class="boton peligro" id="ca-del" style="margin-right:auto">Eliminar</button>' : ''}<button class="boton sec" id="ca-x">Cancelar</button><button class="boton" id="ca-ok">Guardar</button>`);
  const fechas = () => {
    const t = o.tipo;
    $('#ca-fechas').innerHTML = t === 'unica' ? `<div class="campo"><label for="ca-f">Fecha en que se debe realizar</label><input id="ca-f" type="date" value="${esc(o.fin || '')}"></div>`
      : t === 'periodo' ? `<div class="campo"><label for="ca-i">Inicia</label><input id="ca-i" type="date" value="${esc(o.inicio || '')}"></div><div class="campo"><label for="ca-f">Fecha límite</label><input id="ca-f" type="date" value="${esc(o.fin || '')}"></div>`
      : `<div class="campo"><label for="ca-fr">¿Cada cuánto se evalúa?</label><select id="ca-fr">${Object.entries(COM_FREC).map(([k, v]) => `<option value="${k}"${o.frecuencia === k ? ' selected' : ''}>${v[0]}</option>`).join('')}</select></div><div class="campo"><label for="ca-i">Desde</label><input id="ca-i" type="date" value="${esc(o.inicio || comHoy())}"></div>`;
  };
  const guardaF = () => { if ($('#ca-i')) o.inicio = $('#ca-i').value; if ($('#ca-f')) o.fin = $('#ca-f').value; if ($('#ca-fr')) o.frecuencia = $('#ca-fr').value; };
  fechas();
  $$('[data-catipo]').forEach(b => b.onclick = () => { guardaF(); o.tipo = b.dataset.catipo; $$('[data-catipo]').forEach(x => x.setAttribute('aria-pressed', x === b)); fechas(); });
  $('#ca-x').onclick = cerrarModal;
  if ($('#ca-del')) $('#ca-del').onclick = () => { if (!confirm('¿Eliminar esta acción y su historial de evaluaciones?')) return; accion('cpaEliminar', { id: a.id }, () => { COM.cpa = COM.cpa.filter(x => x.id !== a.id); cerrarModal(); vComite(); aviso('Acción eliminada.', 'ok', 2500); }); };
  $('#ca-ok').onclick = () => {
    guardaF();
    const d = { id: a ? a.id : '', cct, ciclo: COM.ciclo, ambito: $('#ca-amb').value, objetivo: $('#ca-obj').value, meta: $('#ca-meta').value, accion: $('#ca-acc').value.trim(), tipo: o.tipo,
      inicio: o.tipo === 'unica' ? o.fin : o.inicio, fin: o.tipo === 'permanente' ? (a && a.tipo === 'permanente' ? a.fin : '') : o.fin, frecuencia: o.frecuencia,
      responsables: $$('.casillas input:checked').map(x => x.value), evidencia: $('#ca-ev').value, estado: $('#ca-can') && $('#ca-can').checked ? 'cancelada' : 'pendiente' };
    if (!d.accion) return aviso('Escriba la acción.', 'mal', 3500);
    if (o.tipo !== 'permanente' && !d.fin) return aviso(o.tipo === 'unica' ? 'Ponga la fecha en que se debe realizar.' : 'Ponga la fecha límite.', 'mal', 4000);
    if (o.tipo === 'periodo' && !d.inicio) return aviso('Ponga la fecha de inicio.', 'mal', 4000);
    if (!d.responsables.length && !confirm('No eligió responsables. ¿Guardar de todos modos?')) return;
    vista.comUltAmb = d.ambito;
    accion('cpaGuardar', d, r => { poner(COM.cpa, r.cpa); cerrarModal(); vComite(); aviso(a ? 'Acción actualizada.' : 'Acción agregada.', 'ok', 2500); });
  };
}

function comFormEvaluar(id) {
  const a = COM.cpa.find(x => x.id === id); if (!a) return;
  let sem = '', ej = '';
  modal('Evaluar la acción', `
    <p style="margin-top:0"><b>${esc(a.accion)}</b><br><span class="ayuda">${esc(comCuando(a))}</span></p>
    <div class="campo"><span class="et">¿Se realizó?</span><div class="com-subs" style="margin:0">${Object.entries(COM_EJ).map(([k, t]) => `<button type="button" data-ej="${k}" aria-pressed="false">${t}</button>`).join('')}</div></div>
    <div class="campo"><span class="et">Semáforo</span><div class="com-semsel">${Object.entries(COM_SEM).map(([k, v]) => `<button type="button" data-sem="${k}" aria-pressed="false">${comPunto(k, 26)}<b>${v[0]}</b><span>${v[1]}</span></button>`).join('')}</div></div>
    <div class="campo"><label for="ce-f">Fecha de la evaluación</label><input id="ce-f" type="date" value="${esc(comHoy())}"></div>
    <div class="campo"><label for="ce-n">¿Qué se hizo y qué resultados hubo? ¿Qué ajustes acordaron?</label><textarea id="ce-n" maxlength="1500" placeholder="Sin nombres de alumnos. Ej. Se aplicó en 5 de 6 grupos; 3.° B la aplica la próxima semana."></textarea></div>
    <div class="campo"><label for="ce-e">Enlace a la evidencia (opcional)</label><input id="ce-e" maxlength="400" placeholder="Ej. enlace de la carpeta en Drive"></div>
    ${a.tipo !== 'permanente' ? '<p class="ayuda" style="margin:0">Si se realizó y queda en verde, la acción se da por realizada. Si ya no se podrá hacer en la fecha, mejor cámbiele la fecha con el lápiz.</p>' : ''}`,
    `<button class="boton sec" id="ce-x">Cancelar</button><button class="boton" id="ce-ok">Guardar la evaluación</button>`);
  const marca = (sel, v) => $$(sel).forEach(x => x.setAttribute('aria-pressed', x.dataset[sel === '[data-sem]' ? 'sem' : 'ej'] === v));
  $$('[data-ej]').forEach(b => b.onclick = () => { ej = b.dataset.ej; marca('[data-ej]', ej); if (!sem) { sem = { si: 'v', parcial: 'a', no: 'r' }[ej]; marca('[data-sem]', sem); } });
  $$('[data-sem]').forEach(b => b.onclick = () => { sem = b.dataset.sem; marca('[data-sem]', sem); });
  $('#ce-x').onclick = cerrarModal;
  $('#ce-ok').onclick = () => {
    if (!sem) return aviso('Elija el color del semáforo.', 'mal', 3500);
    accion('cpaEvaluar', { id, sem, ej, f: $('#ce-f').value, nota: $('#ce-n').value, evid: $('#ce-e').value.trim() }, r => { poner(COM.cpa, r.cpa); cerrarModal(); vComite(); aviso('Evaluación guardada.', 'ok', 2500); });
  };
}

// Trae las acciones del PMC que Tequio leyó del Drive: se eligen y se les pone su fecha o se dejan permanentes
function comFormImportar(cct) {
  const pmc = COM.pmc.find(x => x.cct === cct); if (!pmc) return;
  const ya = comAcc(cct).map(a => a.accion.toLowerCase().trim());
  const filas = []; pmc.acciones.forEach(g => (g.acciones || []).forEach(t => { const p = String(g.periodo || '');
    const perm = !p || /todo el ciclo|permanente|diari|seman|mensual|cada|ciclo escolar|continu/i.test(p);
    const fr = /seman/i.test(p) ? 'semanal' : /quincen/i.test(p) ? 'quincenal' : /bimest/i.test(p) ? 'bimestral' : /trimest/i.test(p) ? 'trimestral' : /cte|consejo/i.test(p) ? 'cte' : 'mensual';
    filas.push({ ambito: COM_AMB().find(m => m.toLowerCase().startsWith(String(g.ambito || '').toLowerCase().slice(0, 14))) || g.ambito || '', accion: t, periodo: p, tipo: perm ? 'permanente' : 'unica', frecuencia: fr, fin: '', usar: !ya.includes(String(t).toLowerCase().trim()) }); }));
  modal('Traer las acciones del PMC', `
    <p class="peq" style="margin-top:0">Estas son las acciones que Tequio leyó del PMC de la escuela. Elija las que seguirá el comité y póngales fecha, o déjelas como permanentes y diga cada cuánto se evalúan. Los responsables se asignan después con el lápiz.</p>
    <div id="ci-l">${filas.map((x, i) => `<div class="com-imp" data-i="${i}"><input type="checkbox" data-k="usar"${x.usar ? ' checked' : ''} aria-label="Usar esta acción" style="width:20px;height:20px;margin-top:2px">
      <div><b style="font-weight:600">${esc(x.accion)}</b><div class="ayuda">${esc(x.ambito || 'Sin ámbito')}${x.periodo ? ' · En el PMC: ' + esc(x.periodo) : ''}${ya.includes(String(x.accion).toLowerCase().trim()) ? ' · ya está registrada' : ''}</div>
      <div class="op"><select data-k="tipo" aria-label="Cuándo">${Object.entries(COM_TIPO).filter(([k]) => k !== 'periodo').map(([k, t]) => `<option value="${k}"${x.tipo === k ? ' selected' : ''}>${t}</option>`).join('')}</select>
        <input type="date" data-k="fin" aria-label="Fecha"${x.tipo === 'permanente' ? ' hidden' : ''}>
        <select data-k="frecuencia" aria-label="Cada cuánto se evalúa"${x.tipo !== 'permanente' ? ' hidden' : ''}>${Object.entries(COM_FREC).map(([k, v]) => `<option value="${k}"${x.frecuencia === k ? ' selected' : ''}>${v[0]}</option>`).join('')}</select></div></div></div>`).join('')}</div>`,
    `<button class="boton sec" id="ci-x">Cancelar</button><button class="boton" id="ci-ok">Agregar las elegidas</button>`);
  $$('#ci-l [data-k="tipo"]').forEach(s => s.onchange = () => { const d = s.closest('.com-imp'); d.querySelector('[data-k="fin"]').hidden = s.value === 'permanente'; d.querySelector('[data-k="frecuencia"]').hidden = s.value !== 'permanente'; });
  $('#ci-x').onclick = cerrarModal;
  $('#ci-ok').onclick = () => {
    const l = $$('#ci-l .com-imp').filter(d => d.querySelector('[data-k="usar"]').checked).map(d => { const x = filas[+d.dataset.i], v = k => d.querySelector(`[data-k="${k}"]`).value;
      return { ambito: x.ambito, accion: x.accion, tipo: v('tipo'), fin: v('fin'), inicio: v('tipo') === 'permanente' ? comHoy() : v('fin'), frecuencia: v('frecuencia'), responsables: [] }; });
    if (!l.length) return aviso('Elija al menos una acción.', 'mal', 3500);
    const sinF = l.filter(x => x.tipo !== 'permanente' && !x.fin);
    if (sinF.length) return aviso(`Falta la fecha en ${sinF.length} acción${sinF.length > 1 ? 'es' : ''}. Póngala o déjela como permanente.`, 'mal', 5000);
    accion('cpaImportar', { cct, ciclo: COM.ciclo, acciones: l }, r => { r.cpa.forEach(x => poner(COM.cpa, x)); cerrarModal(); vComite(); aviso(`Se agregaron ${r.cpa.length} acciones. Asigne a sus responsables con el lápiz.`, 'ok', 6000); });
  };
}

/* ---------------- Funciones del comité (normativa) ---------------- */
function comNormaHTML() {
  return `<div class="com-norma peq">
    <h2 style="font-size:19px;margin-bottom:6px">¿Qué hace el Comité de Planeación y Evaluación?</h2>
    <p style="margin-top:0">La <b>Ley General de Educación (art. 109)</b> establece que cada Consejo Técnico Escolar cuenta con un Comité de Planeación y Evaluación, encargado de formular el <b>Programa de Mejora Continua</b>, que contempla de manera integral la infraestructura, el equipamiento, el avance de los planes y programas, la formación docente, la carga administrativa, la participación de la comunidad y el desempeño de la autoridad escolar, entre otros ámbitos.</p>
    <p><b>Integración</b> (Lineamientos del CTE, art. 18): personal con funciones de dirección y maestras y maestros que propone el colectivo en la Fase Intensiva; el número depende del tamaño de la plantilla y puede renovarse cada ciclo. Las escuelas multigrado con menos de cuatro docentes que no puedan conformarlo acuerdan su estrategia de seguimiento con su autoridad inmediata.</p>
    <p style="margin-bottom:4px"><b>Funciones</b> (art. 19):</p>
    <ol style="margin-top:0;padding-left:22px">
      <li>Coordinar la formulación y la evaluación del PMC que decide el CTE.</li>
      <li>Organizar los resultados del diagnóstico para identificar las problemáticas prioritarias y plantear objetivos y metas.</li>
      <li>Acordar con el colectivo la estrategia de seguimiento: tiempos, responsables y fuentes de información. <span class="mudo">→ En Tequio: fechas, responsables y semáforo de cada acción.</span></li>
      <li>Involucrar a la comunidad y a las familias en las metas de la escuela y definir en qué se requiere su colaboración.</li>
      <li>Informar periódicamente a la comunidad escolar el avance de metas y objetivos. <span class="mudo">→ «Informe de avance» y «Resumen para WhatsApp».</span></li>
      <li>Acordar cómo se dan a conocer los resultados al final del ciclo a la comunidad y a la Supervisión.</li>
      <li>Hacer llegar al CEAP las necesidades de infraestructura y equipamiento que arrojó el diagnóstico.</li>
    </ol>
    <p><b>Fases del proceso de mejora continua:</b> diagnóstico socioeducativo, planeación, implementación, seguimiento y evaluación, y comunicación de avances y logros. La Guía Operativa de Baja California pide que el PMC y su comité estén conformados al inicio del ciclo y que su seguimiento se revise en las sesiones de CTE y en las visitas de la Supervisión.</p>
    <p class="ayuda" style="margin-bottom:0">Semáforo en Tequio: <b style="color:#1E7A46">verde</b> se realizó o se está logrando; <b style="color:#B7791F">amarillo</b> en proceso o requiere ajustes; <b style="color:#B3261E">rojo</b> no se realizó o no hay avance. Si una acción no se realizó en su fecha y nadie la evaluó, se ve en rojo y el comité recibe el aviso.</p></div>`;
}
function comNormaModal() { modal('Funciones del comité', comNormaHTML(), '<button class="boton" id="cn-ok">Entendido</button>'); $('#cn-ok').onclick = cerrarModal; }

/* ---------------- Informe de avance (para el CTE, la comunidad o la Supervisión) ---------------- */
function comInforme(cct) {
  const w = window.open('', '_blank');
  if (!w) return aviso('El navegador bloqueó la pestaña nueva. Permita las ventanas emergentes para este sitio.', 'mal', 8000);
  const cp = comCpe(cct), r = comResumen(cct), x = v => esc(v == null ? '' : String(v)), l = comAcc(cct);
  const amb = [...new Set(l.map(a => a.ambito || 'Sin ámbito'))];
  const color = { v: '#1E7A46', a: '#E0A526', r: '#B3261E' };
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Informe del Comité de Planeación y Evaluación · ${x(nombreEscuela(cct))}</title>
<style>@page{size:letter;margin:14mm 14mm}*{box-sizing:border-box}body{margin:0;font:10.5pt/1.4 Arial,Helvetica,sans-serif;color:#1b1f2a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.hoja{max-width:188mm;margin:0 auto;padding:6mm 0}.enc{display:grid;grid-template-columns:110px 1fr 90px;align-items:center;gap:10px}
.enc img.i{width:105px;height:60px;object-fit:contain}.enc img.z{width:78px;height:78px;object-fit:contain;justify-self:end}
.tit{text-align:center;line-height:1.3}.tit .a{font-size:8.5pt;font-weight:700;color:#691C32}.tit .c{font-size:13pt;font-weight:700;margin-top:2px}.tit .d{font-size:9.5pt;color:#1E3A6B}
h2{font-size:11.5pt;color:#1E3A6B;margin:14px 0 6px;border-bottom:1.5px solid #1E3A6B;padding-bottom:2px}
table{width:100%;border-collapse:collapse}td,th{border:1px solid #9a9a9a;padding:4px 6px;vertical-align:top;text-align:left}th{background:#E8ECF4;font-size:9.5pt}
.pt{display:inline-block;width:12px;height:12px;border-radius:50%;vertical-align:middle}.cif{display:flex;gap:8px;margin:8px 0}.cif div{flex:1;border:1px solid #ccc;border-radius:6px;padding:6px;text-align:center}.cif b{display:block;font-size:15pt}
.amb td{background:#F3EEE4;font-weight:700}.fir{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:34px;text-align:center}.fir div{border-top:1px solid #333;padding-top:4px;font-size:9.5pt}
.no{margin:10px 0}@media print{.no{display:none}}</style></head><body><div class="hoja">
<div class="no"><button onclick="print()" style="font:15px system-ui;padding:8px 16px">Imprimir o guardar en PDF</button></div>
<div class="enc"><img class="i" src="${x(ZONA.logoInstAbs)}" alt=""><div class="tit"><div class="a">${x(ZONA.instNombreMay)}</div><div class="c">Comité de Planeación y Evaluación</div>
<div class="d">${x(nombreEscuela(cct))} · C.C.T. ${x(cct)} · Ciclo escolar ${x(COM.ciclo)}</div><div class="d">Informe de avance del Programa de Mejora Continua · ${x(fechaLarga(comHoy()))}</div></div>${ZONA.logoZonaAbs ? `<img class="z" src="${x(ZONA.logoZonaAbs)}" alt="">` : '<span></span>'}</div>
<h2>Integrantes del comité</h2>${cp ? `<table><tr><th>Nombre</th><th>Cargo</th><th>Función en el comité</th></tr>${cp.integrantes.map(p => `<tr><td>${x(p.n)}</td><td>${x(p.cargo)}</td><td>${x(COM_FUN[p.funcion])}</td></tr>`).join('')}</table>` : '<p>Sin registrar.</p>'}
<h2>Avance general</h2><div class="cif"><div><b>${r.n}</b>acciones</div><div><b style="color:#1E7A46">${r.v}</b>en verde</div><div><b style="color:#B7791F">${r.a}</b>en amarillo</div><div><b style="color:#B3261E">${r.r}</b>en rojo</div><div><b>${r.s}</b>sin evaluar</div><div><b>${r.pct == null ? '—' : r.pct + ' %'}</b>avance</div></div>
<h2>Acciones del PMC</h2><table><tr><th style="width:18px"></th><th>Acción</th><th style="width:28%">Cuándo · responsables</th><th style="width:30%">Última evaluación</th></tr>
${amb.map(m => `<tr class="amb"><td colspan="4">${x(m)}</td></tr>` + l.filter(a => (a.ambito || 'Sin ámbito') === m).map(a => { const u = comUlt(a), c = comColor(a);
  return `<tr><td>${c ? `<span class="pt" style="background:${color[c]}"></span>` : ''}</td><td>${x(a.accion)}${a.meta ? `<br><small>Meta: ${x(a.meta)}</small>` : ''}</td><td>${x(comCuando(a))}${comNomResp(cct, a.responsables).length ? '<br><small>' + x(comNomResp(cct, a.responsables).join(', ')) + '</small>' : ''}<br><small>${x(COM_SIT[comSit(a)][0])}</small></td>
  <td>${u ? `${x(fechaCorta(u.f))} · ${x(COM_EJ[u.ej] || COM_SEM[u.sem][0])}${u.nota ? '<br><small>' + x(u.nota) + '</small>' : ''}` : '<small>Sin evaluar</small>'}</td></tr>`; }).join('')).join('')}</table>
${cp && cp.datos && cp.datos.comunicacion ? `<h2>Comunicación de avances</h2><p style="white-space:pre-line">${x(cp.datos.comunicacion)}</p>` : ''}
<div class="fir"><div>${x((cp && (cp.integrantes.find(p => p.funcion === 'coord') || {}).n) || '')}<br>Coordinación del comité</div><div>${x((escuelaDe(cct) || {}).nombre || '')}<br>Dirección de la escuela</div></div>
</div></body></html>`;
  w.document.open(); w.document.write(html); w.document.close();
}

/* ---------------- Demostración (datos ficticios; nunca se guardan) ---------------- */
(function () {
  const M = { cpe: [], cpa: [] }, listo = new Set();
  const cl = o => JSON.parse(JSON.stringify(o)), dd = n => sumarDias(hoy(), n);
  function sembrar(cct, i) {
    if (listo.has(cct)) return; listo.add(cct);
    const c = comCiclo(), P = [['Mtra. Laura Méndez Ruiz', 'Director(a)', 'coord'], ['Mtro. José Ramírez Soto', 'Docente frente a grupo', 'secre'], ['Mtra. Ana Torres Lima', 'Docente frente a grupo', 'vocal'], ['Mtro. Luis Peña Cruz', 'Docente de Educación Física', 'vocal']];
    const integ = P.map((p, k) => ({ id: 'i' + k + cct, n: p[0], cargo: p[1], funcion: p[2], correo: 'integrante' + k + '@ejemplo.mx', cel: '', alertas: true }));
    if (i % 4 === 3) return;   // algunas escuelas todavía no registran su comité
    M.cpe.push({ id: c + '|' + cct, ciclo: c, cct, integrantes: integ, datos: { fecha: c.slice(0, 4) + '-08-22', sesion: 'Fase intensiva del CTE', seguimiento: 'Al cierre de cada mes y antes de cada sesión ordinaria de CTE', fuentes: 'SisAT, EIA, listas de cotejo de lectura, asistencia, actas de CTE', comunicacion: 'Periódico mural cada trimestre y reunión con familias al cierre del ciclo.' } });
    const A = COM_AMB(), e = (f, sem, ej, nota) => ({ id: 'e' + Math.random().toString(36).slice(2, 7), f, sem, ej, nota, evid: '', por: 'demo', porN: 'Mtra. Laura Méndez Ruiz', creado: f + 'T12:00:00' });
    const base = [
      [A[0], 'Aplicar la lista de cotejo de lectura en todos los grupos.', 'unica', dd(-20), dd(-20), '', [integ[1].id, integ[2].id], [e(dd(-19), 'v', 'si', 'Se aplicó en los 6 grupos.')], 'realizada'],
      [A[0], 'Taller de lectura en voz alta con familias.', 'unica', dd(-3), dd(-3), '', [integ[2].id], [], 'pendiente'],
      [A[0], 'Seguimiento a alumnos con inasistencia recurrente (llamadas y visitas a familias).', 'permanente', dd(-60), '', 'quincenal', [integ[0].id], [e(dd(-40), 'a', 'parcial', 'Se contactó a 5 de 8 familias.')], 'pendiente'],
      [A[1], 'Observación entre pares de una clase de matemáticas por docente.', 'periodo', dd(-10), dd(2), '', ['todos'], [], 'pendiente'],
      [A[2], 'Círculo de estudio sobre evaluación formativa.', 'permanente', dd(-50), '', 'mensual', [integ[1].id], [e(dd(-12), 'v', 'si', 'Se revisaron rúbricas de escritura.')], 'pendiente'],
      [A[4], 'Asamblea con madres y padres para presentar las metas del PMC.', 'unica', dd(9), dd(9), '', [integ[0].id, integ[3].id], [], 'pendiente'],
      [A[6], 'Gestionar con el CEAP la reparación de los bebederos.', 'periodo', dd(-30), dd(-5), '', [integ[0].id], [e(dd(-6), 'r', 'no', 'El CEAP no ha sesionado; se reprograma.')], 'pendiente'],
      [A[3], 'Revisar en CTE el avance del programa analítico por grado.', 'unica', dd(20), dd(20), '', ['todos'], [], 'pendiente']
    ];
    base.slice(0, 5 + (i % 4)).forEach((b, k) => M.cpa.push({ id: 'cpa-' + cct + k, ciclo: c, cct, ambito: b[0], objetivo: '', meta: k === 0 ? 'Que el 80 % de los alumnos lea con fluidez al cierre del ciclo.' : '', accion: b[1], responsables: b[6], tipo: b[2], inicio: b[3], fin: b[4], frecuencia: b[5],
      evidencia: k === 0 ? 'Listas de cotejo' : '', estado: b[8], evals: b[7], avisos: {}, activo: true, origen: '', creadoNombre: 'Demostración', creado: dd(-70), actualizado: dd(-1) }));
  }
  const yo = () => (S && S.yo && S.yo.nombre) || 'Demostración';
  window.DEMO_EXTRA = Object.assign(window.DEMO_EXTRA || {}, {
    cpeDatos: d => { const l = (d.escuelas || []).length ? d.escuelas : [], esD = cfg && cfg.dir, mias = esD ? l.slice(0, 1) : l; mias.forEach(sembrar);
      return { ciclo: comCiclo(), escuelas: mias, hoy: hoy(), cpe: cl(M.cpe.filter(x => mias.includes(x.cct))), cpa: cl(M.cpa.filter(x => mias.includes(x.cct) && x.activo !== false)), pmc: [] }; },
    cpeGuardar: d => { const o = { id: comCiclo() + '|' + d.cct, ciclo: comCiclo(), cct: d.cct, integrantes: d.integrantes.map(x => Object.assign({ id: uid('i') }, x)), datos: d.datos, actualizado: ahora(), actualizadoNombre: yo() };
      M.cpe = M.cpe.filter(x => x.id !== o.id).concat([o]); return { cpe: cl(o) }; },
    cpaGuardar: d => { const p = M.cpa.find(x => x.id === d.id), o = Object.assign({}, p || { id: uid('cpa'), evals: [], avisos: {}, creado: ahora(), creadoNombre: yo() }, d, { activo: true, actualizado: ahora(),
      estado: d.estado === 'cancelada' ? 'cancelada' : p && p.estado === 'realizada' ? 'realizada' : 'pendiente', evals: p ? p.evals : [] }); M.cpa = M.cpa.filter(x => x.id !== o.id).concat([o]); return { cpa: cl(o) }; },
    cpaImportar: d => { const l = d.acciones.map(x => Object.assign({ id: uid('cpa'), ciclo: comCiclo(), cct: d.cct, evals: [], avisos: {}, estado: 'pendiente', activo: true, origen: 'pmc', creado: ahora() }, x)); M.cpa = M.cpa.concat(l); return { cpa: cl(l) }; },
    cpaEvaluar: d => { const o = M.cpa.find(x => x.id === d.id); o.evals = (o.evals || []).concat([{ id: uid('e'), f: d.f || hoy(), sem: d.sem, ej: d.ej, nota: d.nota, evid: d.evid, porN: yo(), creado: ahora() }]).sort((a, b) => a.f.localeCompare(b.f));
      if (o.tipo !== 'permanente') o.estado = d.ej === 'si' && d.sem === 'v' ? 'realizada' : 'pendiente'; return { cpa: cl(o) }; },
    cpaEliminar: d => { const o = M.cpa.find(x => x.id === d.id); if (o) o.activo = false; return { ok: true }; },
    cpeAvisar: () => ({ mensaje: 'Demostración: en Tequio real se mandaría el aviso por correo a los integrantes del comité.' })
  });
})();
