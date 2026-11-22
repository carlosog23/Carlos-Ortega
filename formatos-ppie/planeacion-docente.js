/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Tlamatini · Planeación didáctica con los datos reales del docente.
   - Toma su nombre, grado, grupo y escuela de «Mis datos» de Tlamatini, y sus alumnos de su base.
   - La planeación la redacta la IA (Gemini, por el servidor de Tequio, acción planIA «nueva») con el programa
     sintético oficial del grado, el calendario de Baja California y la lectura de la realidad del grupo
     (la de Tequio o la que el docente sube en PDF, Word o fotos; es opcional).
   - Todo es editable y se guarda en este dispositivo («Mis planeaciones»). */
"use strict";

/* ---------- quién es el docente ---------- */
function plYo() {
  const p = incLS.get('ppie-perfil', {}) || {};
  const g = (String(p.grado || '').match(/[1-6]/) || [])[0] || '';
  const tit = String(p.mtit || '').trim();
  let nombre = String(p.minombre || '').trim().replace(/\s+/g, ' ');
  if (nombre && tit && !nombre.toLowerCase().startsWith(tit.toLowerCase())) nombre = tit + ' ' + nombre;
  return { nombre, cargo: String(p.micargo || '').trim(), grado: g, grupo: String(p.grupo || '').trim().toUpperCase(),
    escuela: String(p.escuela || '').trim(), cct: String(p.cct || '').trim().toUpperCase(), loc: String(p.localidad || '').trim(),
    mun: String(p.municipio || '').trim(), zona: String(p.zona || '').trim(), director: String(p.director || '').trim(),
    ef: /f[ií]sica/i.test(String(p.mifuncion || '') + ' ' + String(p.micargo || '')) };
}
const plGr = g => g ? g + '.°' : '';
function plGrupoTxt(y) { y = y || plYo(); return y.grado ? plGr(y.grado) + (y.grupo ? ' ' + y.grupo : '') : ''; }
function plEscCorta(y) { y = y || plYo(); const e = y.escuela.replace(/^Escuela Primaria\s*(Federal\s*)?/i, 'Esc. Prim. '); return [e || 'Escuela sin capturar', y.loc].filter(Boolean).join(', '); }
function plEscLinea(y) { y = y || plYo(); return [y.escuela || 'Escuela', y.cct ? 'C.C.T. ' + y.cct : '', y.zona ? 'Zona Escolar ' + y.zona : '', [y.loc, y.mun].filter(Boolean).join(', ')].filter(Boolean).join(' · '); }
function plNombre(ef) { const y = plYo(); return y.nombre || (ef ? 'Docente de Educación Física' : 'Docente'); }
function plAlumnos() { try { return incAlumnos().todos.filter(a => a && (a.nombre || a.n)); } catch (e) { return []; } }
const plNomAl = a => String(a.nombre || a.n || '').trim();
function plNombresAlumnos() { const L = plAlumnos().map(a => plNomAl(a).split(/\s+/)[0]).filter(Boolean); return L.length >= 4 ? L : null; }
function plQuien(ef) {
  const y = plYo(), n = plAlumnos().length;
  const falta = !y.nombre || (!ef && !y.grado) || !y.escuela;
  return `<div class="quien"><span>${ic(ef ? 'diana' : 'grupo', 'style="width:16px;height:16px"')}${esc(plNombre(ef))}</span>${ef ? '<span>Educación Física</span>' : y.grado ? `<span>${esc(plGrupoTxt(y))}${n ? `, ${n} alumno${n === 1 ? '' : 's'}` : ''}</span>` : ''}<span>${esc(plEscCorta(y))}</span>
    <a href="index.html#ir=misdatos" style="color:inherit;opacity:.85;text-decoration:underline;font-size:.92em">${falta ? 'Complete sus datos' : 'Cambiar mis datos'}</a></div>`;
}
function plLogo(cual) {
  if (cual === 'isep') return `<img src="${new URL('img/isep.png', location.href).href}" alt="ISEP" style="width:64px;height:48px;object-fit:contain;flex:none">`;
  const u = incLS.get('logo-escuela', null) || incLS.get('libro-visitas-logo', null);
  return u ? `<img src="${esc(u)}" alt="Logo de la escuela" style="width:54px;height:54px;object-fit:contain;flex:none">` : `<img src="${new URL('img/zona050.png', location.href).href}" alt="Zona 050" style="width:50px;height:50px;object-fit:contain;flex:none">`;
}

/* ---------- lo que se sabe del grupo: lectura de la realidad (Tequio o la guardada en Tlamatini) ---------- */
function plTxt(v, n) { const out = []; const walk = x => { if (out.join(' ').length > n) return; if (x == null) return; if (typeof x === 'string' || typeof x === 'number') { const t = String(x).trim(); if (t && !/^(data:|https?:)/.test(t)) out.push(t); } else if (Array.isArray(x)) x.forEach(walk); else if (typeof x === 'object') Object.entries(x).forEach(([k, v]) => { if (!/^(id|t|fecha|actualizado|archivo|url|logo|cct)$/i.test(k)) walk(v); }); }; walk(v); return out.join('. ').replace(/\s+/g, ' ').slice(0, n); }
function plLectura() {
  const y = plYo();
  if (y.cct) { const c = incLS.get('tqi-' + y.cct, null), D = c && c.d; if (D && (D.grupos || []).length) {
    const G = D.grupos.find(x => String(x.grado) === y.grado && String(x.grupo || '').toUpperCase() === y.grupo) || D.grupos.find(x => String(x.grado) === y.grado);
    if (G) { const t = plTxt(G.datos, 1300); if (t.length > 60) return { fuente: 'Tequio', txt: t, quien: 'la lectura de la realidad de su grupo (' + plGr(G.grado) + (G.grupo ? ' ' + G.grupo : '') + ') que publicó la Supervisión' }; } }
    if (D && D.escuelaIns) { const t = plTxt(D.escuelaIns.datos, 1300); if (t.length > 60) return { fuente: 'Tequio', txt: t, quien: 'la lectura de la realidad de su escuela que publicó la Supervisión' }; } }
  const dx = incLS.get('ppie-dx', null); if (dx) { const t = plTxt(dx, 1300); if (t.length > 60) return { fuente: 'Tlamatini', txt: t, quien: 'la lectura de la realidad que usted guardó en Tlamatini' }; }
  return null;
}

/* ---------- lectura de la realidad que sube el docente (opcional: PDF, Word o fotos) ----------
   Si la sube, la IA contextualiza la planeación con ella; si no, la planeación se arma igual.
   Se guarda en este dispositivo para las siguientes planeaciones (si cabe). */
const PL_LEC = 'plan-lectura-subida';
let PL_LECA = (function () { const v = incLS.get(PL_LEC, null); return Array.isArray(v) ? v : []; })();
function plLecGuardar() { try { localStorage.setItem(PL_LEC, JSON.stringify(PL_LECA)); return true; } catch (e) { try { localStorage.setItem(PL_LEC, JSON.stringify(PL_LECA.filter(a => a.clase === 'word'))); } catch (e2) {} return false; } }
async function plLecAgregar(files) {
  let guardo = true;
  for (const f of files) {
    const n = f.name || 'archivo', ext = (n.split('.').pop() || '').toLowerCase();
    try {
      if (PL_LECA.length >= 8) throw new Error('Máximo 8 archivos. Quite alguno para agregar otro.');
      if (f.type === 'application/pdf' || ext === 'pdf') { if (f.size > 12e6) throw new Error('«' + n + '» pesa más de 12 MB. Súbalo en partes o como fotos.'); PL_LECA.push({ nombre: n, clase: 'pdf', tipo: 'application/pdf', data: await miaB64(f), kb: f.size / 1024 }); }
      else if (ext === 'docx') { const t = await miaWord(f); if (t.replace(/\s/g, '').length < 20) throw new Error('«' + n + '» no tiene texto que se pueda leer.'); PL_LECA.push({ nombre: n, clase: 'word', texto: t.slice(0, 40000), kb: f.size / 1024 }); }
      else if (ext === 'doc' || ext === 'odt' || ext === 'pages') throw new Error('«' + n + '» es de un formato que no se puede leer. En Word use «Guardar como» → Word (.docx) o PDF.');
      else if (/^image\//.test(f.type) || /^(jpe?g|png|webp|heic|heif|gif)$/.test(ext)) { const x = await miaFoto(f); PL_LECA.push({ nombre: n, clase: 'foto', tipo: x.tipo, data: x.data, prev: x.prev, kb: x.data.length * .75 / 1024 }); }
      else throw new Error('«' + n + '» no es PDF, Word ni foto.');
      PL_LECA.forEach(a => { if (!a.fecha) a.fecha = new Date().toISOString().slice(0, 10); });
      if (!plLecGuardar()) guardo = false;
    } catch (e) { toast('<b>No se agregó.</b> ' + esc(e.message || e), 5200); }
  }
  if (!guardo) toast('Su lectura se usará en esta planeación, pero pesa mucho para guardarse en el dispositivo. La próxima vez tendrá que subirla de nuevo.', 6500);
  repinta();
}
function plLecHTML() {
  const L = PL_LECA, kb = L.reduce((t, a) => t + (a.kb || 0), 0);
  const icono = a => a.clase === 'foto' && a.prev ? `<img src="${esc(a.prev)}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:8px;flex:none">` : `<span style="width:40px;height:40px;border-radius:8px;flex:none;display:grid;place-items:center;font-size:11px;font-weight:800;color:#fff;background:${a.clase === 'pdf' ? '#A94C2A' : '#2D5491'}">${a.clase === 'pdf' ? 'PDF' : 'W'}</span>`;
  return `<div class="bandeja" id="lecBox"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">
     <div style="flex:1;min-width:220px"><b style="font-size:16px;color:var(--tinta)">Lectura de la realidad de su grupo</b> <span class="chip" style="margin-left:4px">Opcional</span>
     <p style="font-size:14px;color:var(--gris);margin:6px 0 0">Súbala y Tlamatini <b>contextualiza</b> la planeación con ella: el problema, las actividades y los ajustes parten de lo que usted conoce de su grupo y su comunidad. Si no la sube, la planeación se arma igual.</p></div>
     <label class="btn sec chico" style="cursor:pointer;flex:none">${ic('descarga', 'style="width:16px;height:16px;transform:rotate(180deg)"')} ${L.length ? 'Agregar otra' : 'Subir'}<input type="file" id="lecF" multiple accept=".pdf,.docx,image/*" hidden></label></div>
    <p style="font-size:13px;color:var(--gris);margin:8px 0 0">PDF, Word (.docx) o fotos de las hojas. No hace falta que tenga un formato especial.</p>
    ${L.length ? `<div style="display:grid;gap:8px;margin-top:12px">${L.map((a, i) => `<div style="display:flex;align-items:center;gap:10px;background:var(--papel,#fff);border:1px solid var(--hilo);border-radius:12px;padding:8px 10px">${icono(a)}<span style="flex:1;min-width:0"><b style="display:block;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.nombre)}</b><small style="color:var(--gris)">${a.clase === 'word' ? 'Word' : a.clase === 'pdf' ? 'PDF' : 'Foto'} · ${Math.max(1, Math.round(a.kb || 0))} KB${a.fecha ? ' · subida el ' + esc(fCorta(a.fecha)) : ''}</small></span><button class="btn sec chico" data-lecq="${i}" aria-label="Quitar ${esc(a.nombre)}">${ic('x', 'style="width:14px;height:14px"')}</button></div>`).join('')}</div>
      <p style="font-size:13px;color:var(--verde,#1B7560);margin:10px 2px 0"><b>✓ Se usará para contextualizar esta planeación</b>${kb > 0 ? ' y se queda guardada en este dispositivo para las siguientes.' : '.'} Quítela cuando cambie de ciclo o de grupo.</p>` : ''}</div>`;
}
function plLecCablear() {
  const f = $('#lecF'); if (f) f.onchange = async () => { const L = [...f.files]; f.value = ''; if (L.length) { toast('Leyendo su lectura de la realidad…', 1800); await plLecAgregar(L); } };
  $$('[data-lecq]').forEach(b => b.onclick = () => { PL_LECA.splice(+b.dataset.lecq, 1); plLecGuardar(); repinta(); });
  const box = $('#lecBox'); if (box) { box.ondragover = e => { e.preventDefault(); box.style.outline = '2px dashed var(--maiz)'; }; box.ondragleave = () => { box.style.outline = ''; };
    box.ondrop = async e => { e.preventDefault(); box.style.outline = ''; const L = [...(e.dataTransfer.files || [])]; if (L.length) await plLecAgregar(L); }; }
}

/* ---------- programa sintético oficial ---------- */
let PL_PDA = null;
async function plProgramaCargar() { if (PL_PDA) return PL_PDA; try { const r = await fetch('formatos/pda.json'); if (r.ok) PL_PDA = await r.json(); } catch (e) {} if (!PL_PDA) PL_PDA = incLS.get('pda-cache', null); return PL_PDA; }
function plContenidos(grados) {
  if (!PL_PDA || !PL_PDA.campos || !grados.length) return [];
  const out = [], vistos = new Set();
  Object.entries(PL_PDA.campos).forEach(([campo, fs]) => grados.forEach(g => { const f = +g <= 2 ? '3' : +g <= 4 ? '4' : '5';
    (fs[f] || []).forEach(x => { const k = campo + '|' + x.c; if (x.pda && x.pda[g] && !vistos.has(k)) { vistos.add(k); out.push({ k, campo, c: x.c, pda: x.pda }); } }); }));
  return out;
}

/* ---------- estado propio de esta pantalla ---------- */
const PLH = 'plan-tlm';
const NEC_SUG = ['Comprensión lectora', 'Producción de textos', 'Cálculo mental y operaciones básicas', 'Resolución de problemas', 'Leer tablas y gráficas', 'Convivencia y respeto de acuerdos', 'Cuidado del agua y del medio ambiente', 'Alimentación saludable'];
(function () { const y = plYo(); Object.assign(E, { necesidad: '', libro: '', libroTipo: 'Proyectos de Aula', grados: new Set(y.grado ? [y.grado] : []), contsK: new Set(), error: '' }); })();

/* ---------- pantalla de inicio ---------- */
function vInicio() {
  const y = plYo(), r = diasClase(E.ini, E.dur), n = r.dias.length, maxPda = n <= 1 ? 1 : n <= 5 ? 3 : n <= 10 ? 4 : 6;
  const gr = [...E.grados].sort(), lec = plLectura(), H = incLS.get(PLH, []);
  if (E.puerta === 'prog' && !PL_PDA) plProgramaCargar().then(() => { if (E.vista === 'inicio' && E.modo === 'grupo') repinta(); });
  const conts = plContenidos(gr), q = E.q.trim().toLowerCase(), lista = conts.filter(x => !q || (x.c + ' ' + x.campo + ' ' + Object.values(x.pda).join(' ')).toLowerCase().includes(q));
  const okElegir = gr.length > 0 && (E.puerta === 'grupo' ? E.necesidad.trim().length > 2 : E.puerta === 'libro' ? E.libro.trim().length > 2 : E.contsK.size > 0);
  const resumen = E.puerta === 'grupo' ? E.necesidad.trim() : E.puerta === 'libro' ? E.libro.trim() : conts.filter(x => E.contsK.has(x.k)).map(x => x.c.replace(/\.$/, '')).slice(0, 2).join('; ') + (E.contsK.size > 2 ? ` y ${E.contsK.size - 2} más` : '');
  $('#app').innerHTML = topBar('Tlamatini · Pedagógico', 'Planeación didáctica') + `<main class="wrap">
   <div class="escena"><div>
    <section class="intro">${selectorModo()}<h1>Planee su próximo proyecto en cinco minutos</h1>
     <p>Usted decide qué trabajar y por cuánto tiempo. Tlamatini arma el borrador con los datos de su grupo, el programa oficial y el calendario de Baja California; usted lo revisa, lo ajusta y da su clase.</p>
     ${plQuien(false)}</section>
    <div class="paso-t"><span class="n">1</span><h2>¿Qué va a trabajar?</h2></div>
    <div class="puertas" role="group" aria-label="Por dónde empezar">
     <button class="puerta" data-puerta="grupo" aria-pressed="${E.puerta === 'grupo'}"><span class="ilu">${ILU.grupo}${lec && lec.fuente === 'Tequio' ? '<span class="tq">Desde Tequio</span>' : ''}</span><span class="ok">${ic('check', 'style="width:16px;height:16px"')}</span><span class="tx"><b>Lo que necesita mi grupo</b><span class="ds">Parto de lo que mostraron el SisAT, los EIA y la lectura de la realidad.</span></span></button>
     <button class="puerta" data-puerta="libro" aria-pressed="${E.puerta === 'libro'}"><span class="ilu">${ILU.libro}</span><span class="ok">${ic('check', 'style="width:16px;height:16px"')}</span><span class="tx"><b>Un proyecto del libro</b><span class="ds">Elijo un proyecto de los libros de texto y Tlamatini lo ajusta a mi grupo.</span></span></button>
     <button class="puerta" data-puerta="prog" aria-pressed="${E.puerta === 'prog'}"><span class="ilu">${ILU.prog}</span><span class="ok">${ic('check', 'style="width:16px;height:16px"')}</span><span class="tx"><b>Un contenido del programa</b><span class="ds">Busco el contenido y sus PDA en el programa sintético oficial.</span></span></button>
    </div>
    ${E.puerta === 'grupo' ? `<div class="bandeja"><label class="lbl" for="nec" style="display:block;margin:0 2px 8px">¿Qué es lo que más necesita su grupo?</label>
      <textarea class="nota" id="nec" placeholder="Ej.: 9 alumnos no localizan información en un texto; se distraen al trabajar en equipo.">${esc(E.necesidad)}</textarea>
      <div class="chips" style="margin-top:10px">${NEC_SUG.map(s => `<button type="button" class="chip" data-sug="${esc(s)}" style="cursor:pointer">${esc(s)}</button>`).join('')}</div>
      <p class="contexto">${PL_LECA.length ? `<b style="color:var(--tinta)">Tlamatini usará la lectura de la realidad que usted subió${lec ? ' y ' + esc(lec.quien) : ''}.</b>` : lec ? `<b style="color:var(--tinta)">Tlamatini usará ${esc(lec.quien)}.</b> ${esc(lec.txt.slice(0, 260))}${lec.txt.length > 260 ? '…' : ''}` : 'No hay una lectura de la realidad guardada para su grupo. Súbala abajo o escriba arriba lo que observa en sus alumnos y Tlamatini partirá de ahí.'}</p></div>` : ''}
    ${E.puerta === 'libro' ? `<div class="bandeja"><label class="lbl" for="libT" style="display:block;margin:0 2px 8px">Libro</label>
      <select id="libT" class="nota" style="min-height:0;height:48px">${['Proyectos de Aula', 'Proyectos Escolares', 'Proyectos Comunitarios', 'Nuestros saberes', 'Múltiples lenguajes'].map(x => `<option ${E.libroTipo === x ? 'selected' : ''}>${x}</option>`).join('')}</select>
      <label class="lbl" for="lib" style="display:block;margin:12px 2px 8px">Nombre del proyecto (y página, si la tiene a la mano)</label>
      <input id="lib" class="nota" style="min-height:0;height:48px" value="${esc(E.libro)}" placeholder="Ej.: «Un recetario de mi comunidad», pág. 112" autocomplete="off"></div>` : ''}
    ${E.puerta === 'prog' ? `<div class="bandeja"><label class="buscar">${ic('lupa')}<span class="sr">Buscar contenido</span><input id="q" type="search" placeholder="Busque: agua, gráficas, entrevista, fracciones…" value="${esc(E.q)}" autocomplete="off"></label>
      <p style="font-size:13.5px;color:var(--gris);margin:8px 4px 0">${!gr.length ? 'Primero elija el grado abajo.' : !PL_PDA ? 'Cargando el programa sintético…' : `Programa sintético oficial de ${gr.map(plGr).join(' y ')}: ${conts.length} contenidos. ${E.contsK.size ? `<b style="color:var(--anil)">${E.contsK.size} elegido${E.contsK.size === 1 ? '' : 's'}.</b>` : 'Elija uno o varios.'}`}</p>
      <div class="resultados" id="res">${lista.slice(0, 80).map(x => `<button class="cont" data-cont="${esc(x.k)}" aria-pressed="${E.contsK.has(x.k)}"><span class="ck">${E.contsK.has(x.k) ? ic('check', 'style="width:14px;height:14px"') : ''}</span><span><b style="font-size:15.5px">${esc(x.c)}</b><small>${esc(x.campo)}</small></span></button>`).join('') || (gr.length && PL_PDA ? '<p style="padding:12px;color:var(--gris)">No hay contenidos con esa palabra.</p>' : '')}</div></div>` : ''}
    ${plLecHTML()}
    <div class="paso-t"><span class="n">2</span><h2>¿Para qué grado y por cuánto tiempo?</h2></div>
    <div class="seg" role="group" aria-label="Grado">${['1', '2', '3', '4', '5', '6'].map(g => `<button data-gr="${g}" aria-pressed="${E.grados.has(g)}">${g}.°</button>`).join('')}</div>
    <p style="font-size:13.5px;color:var(--gris);margin:6px 4px 12px">${gr.length > 1 ? 'Grupo multigrado: actividades diferenciadas por grado.' : 'Si su grupo es multigrado, toque también los otros grados.'}</p>
    <div class="seg" role="group" aria-label="Duración">${[['dia', '1 día'], ['semana', '1 semana'], ['2semanas', '2 semanas'], ['3semanas', '3 semanas'], ['mes', '1 mes']].map(([v, l]) => `<button data-dur="${v}" aria-pressed="${E.dur === v}">${l}</button>`).join('')}</div>
    <label class="lbl" for="ini" style="display:block;margin:12px 2px 6px">Empieza el</label><input type="date" id="ini" class="nota" style="min-height:0;height:48px;max-width:240px" value="${esc(E.ini)}">
    <div class="paso-t"><span class="n">3</span><h2>¿Algo más que deba saber?</h2></div>
    <label class="sr" for="nota">Algo más (opcional)</label><textarea class="nota" id="nota" placeholder="Opcional. Ej.: no tenemos internet ni proyector; los jueves hay Educación Física a primera hora.">${esc(E.nota)}</textarea>
    ${H.length ? `<div class="paso-t"><span class="n">↺</span><h2>Mis planeaciones</h2></div><div style="display:grid;gap:8px">${H.map(h => `<div class="cont" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><button data-abrir="${esc(h.id)}" style="all:unset;cursor:pointer;flex:1"><b style="font-size:15.5px">${esc(h.titulo)}</b><small style="display:block;color:var(--gris)">${esc(h.grados)} · ${h.n} sesiones · del ${esc(fCorta(h.desde))}</small></button><button class="btn sec chico" data-borrar="${esc(h.id)}" aria-label="Borrar">${ic('x', 'style="width:14px;height:14px"')}</button></div>`).join('')}</div>` : ''}
   </div>
   <aside class="previa" aria-label="Su planeación hasta ahora"><p class="t">Su planeación hasta ahora</p>
     <h3>${resumen ? esc(resumen.slice(0, 120)) : 'Elija qué va a trabajar'}</h3>
     <div class="big"><b>${n}</b><span>${n === 1 ? 'día de clase' : 'días de clase reales'}<br><span style="color:#AAB6CF;font-size:14px">${esc(fCorta(r.dias[0] || E.ini))}${n > 1 ? ' a ' + esc(fCorta(r.dias[n - 1])) : ''}</span></span></div>
     ${telar(r.dias, r.fuera, null, 'chico')}
     ${r.fuera.length ? `<p class="leyenda">Sin clases: ${r.fuera.map(([k, s]) => `${esc(fCorta(k))} (${motivo(s)})`).join(', ')}.</p>` : ''}
     <dl><dt>Alcanza para</dt><dd>hasta ${maxPda} contenidos con sus PDA</dd><dt>Forma</dt><dd>${n >= 6 ? 'proyecto completo con producto final' : n > 1 ? 'secuencia breve' : 'una sola sesión'}</dd>${gr.length ? `<dt>Grado</dt><dd>${gr.map(plGr).join(' y ')}${gr.length > 1 ? ' (multigrado)' : ''}</dd>` : ''}</dl>
     <button class="btn maiz" id="armar" ${okElegir && n ? '' : 'disabled'}>${ic('chispa')}Armar mi planeación</button></aside>
   </div></main>
   <div class="fijo solo-movil"><div class="fijo-in"><div class="tx">${okElegir ? `<b>${esc(resumen.slice(0, 60))}</b><br>${n} ${n === 1 ? 'sesión' : 'sesiones'}${gr.length > 1 ? ', multigrado' : ''}` : 'Elija qué va a trabajar'}</div>
    <button class="btn maiz" id="armar2" ${okElegir && n ? '' : 'disabled'}>${ic('chispa')}Armar</button></div></div>`;
  cablearModo(); plLecCablear();
  $('#atras').onclick = () => { location.href = 'index.html#ir=pedagogico'; };
  $$('[data-puerta]').forEach(b => b.onclick = () => { E.puerta = b.dataset.puerta; repinta(); });
  const nec = $('#nec'); if (nec) { nec.oninput = () => { const o = !!E.necesidad.trim(); E.necesidad = nec.value; if (o !== !!E.necesidad.trim()) { repinta(); const z = $('#nec'); z.focus(); z.setSelectionRange(z.value.length, z.value.length); } }; }
  $$('[data-sug]').forEach(b => b.onclick = () => { const s = b.dataset.sug; E.necesidad = E.necesidad.trim() ? E.necesidad.trim().replace(/[.;,]?$/, '; ') + s : s; repinta(); });
  const lib = $('#lib'); if (lib) lib.oninput = () => { const o = E.libro.trim().length > 2; E.libro = lib.value; if (o !== E.libro.trim().length > 2) { repinta(); const z = $('#lib'); z.focus(); z.setSelectionRange(z.value.length, z.value.length); } };
  const libT = $('#libT'); if (libT) libT.onchange = () => { E.libroTipo = libT.value; };
  $$('[data-cont]').forEach(b => b.onclick = () => { const k = b.dataset.cont; E.contsK.has(k) ? E.contsK.delete(k) : E.contsK.add(k); const y = $('#res').scrollTop; repinta(); $('#res').scrollTop = y; });
  const qq = $('#q'); if (qq) qq.oninput = () => { E.q = qq.value; repinta(); const z = $('#q'); z.focus(); z.setSelectionRange(z.value.length, z.value.length); };
  $$('[data-gr]').forEach(b => b.onclick = () => { const g = b.dataset.gr; E.grados.has(g) ? E.grados.delete(g) : E.grados.add(g); E.multi = E.grados.size > 1; repinta(); });
  $$('[data-dur]').forEach(b => b.onclick = () => { E.dur = b.dataset.dur; repinta(); });
  $('#ini').onchange = e => { if (e.target.value) { E.ini = sigHabil(e.target.value); repinta(); } };
  $('#nota').oninput = e => { E.nota = e.target.value; };
  $$('[data-abrir]').forEach(b => b.onclick = () => { const h = incLS.get(PLH, []).find(x => x.id === b.dataset.abrir); if (!h) return; E.plan = h.plan; E.grados = new Set(h.plan.grados || []); E.multi = E.grados.size > 1; E.vista = 'plan'; E.tab = 'sesiones'; E.abierta = 0; pintar(); scrollTo(0, 0); });
  $$('[data-borrar]').forEach(b => b.onclick = () => { if (!confirm('¿Borrar esta planeación de este dispositivo?')) return; incLS.set(PLH, incLS.get(PLH, []).filter(x => x.id !== b.dataset.borrar)); repinta(); });
  const ir = () => { E.vista = 'armando'; E.error = ''; pintar(); scrollTo(0, 0); };
  $('#armar').onclick = ir; $('#armar2').onclick = ir;
}

/* ---------- el formato que se le pide a la IA (luego se convierte en la planeación de Tlamatini) ---------- */
const PL_COLS = ['Fecha', 'Fase', 'Título', 'Propósito de la sesión', 'Inicio', 'Desarrollo', 'Cierre', 'Cómo sabré que aprendieron', 'Materiales', 'Variante lúdica', 'Diferenciado por grado'];
const PL_FORMATO = { titulo: 'Planeación didáctica', orientacion: 'vertical', encabezado: ['Docente', 'Escuela', 'Grado y grupo', 'Periodo'],
  secciones: [
    { titulo: 'Título del proyecto', tipo: 'texto' }, { titulo: 'Metodología', tipo: 'texto' }, { titulo: 'Problema del contexto', tipo: 'texto' },
    { titulo: 'Propósito', tipo: 'texto' }, { titulo: 'Producto final', tipo: 'texto' },
    { titulo: 'Contenidos y PDA', tipo: 'tabla', columnas: ['Campo formativo', 'Contenido', 'PDA', 'Grado'] },
    { titulo: 'Ejes articuladores', tipo: 'lista' },
    { titulo: 'Sesiones', tipo: 'tabla', columnas: PL_COLS },
    { titulo: 'Criterios de éxito', tipo: 'lista' }, { titulo: 'Momentos de evaluación', tipo: 'lista' }, { titulo: 'Ajustes razonables', tipo: 'lista' }],
  notas: 'Planeación por proyecto de la Nueva Escuela Mexicana. «Título del proyecto»: atractivo y breve, ligado a la comunidad. «Metodología»: una de Aprendizaje basado en proyectos comunitarios, Aprendizaje basado en indagación (STEAM), Aprendizaje basado en problemas o Aprendizaje servicio, según lo que convenga. «Problema del contexto»: 2 o 3 frases que partan SOLO de la lectura de la realidad o de lo que dice el docente. ' +
    'En «Sesiones» va UNA fila por cada fecha de la lista de fechas, en el mismo orden y con la fecha tal cual. «Fase»: la fase de la metodología elegida (por ejemplo, en proyectos comunitarios: Identificación, Recuperación, Planificación, Acercamiento, Comprensión y producción, Reconocimiento, Concreción, Integración, Difusión, Consideraciones, Avances). ' +
    'En «Inicio», «Desarrollo» y «Cierre» escribe primero los minutos y separa cada actividad con « | », así: «10 min | actividad | actividad»; la sesión suma de 50 a 60 minutos; actividades concretas de lo que hacen docente y alumnos. «Propósito de la sesión»: en infinitivo, para decírselo a los alumnos (ej.: «Reconocer un problema de nuestra comunidad»). «Cómo sabré que aprendieron»: evidencia observable. «Materiales»: separados por coma, al alcance de una escuela pública. «Variante lúdica»: un juego breve para empezar. ' +
    '«Diferenciado por grado»: solo si hay más de un grado, así: «3.°: … || 4.°: …»; si no, déjalo vacío. «Criterios de éxito»: de 4 a 6, en primera persona y en lenguaje de los alumnos. «Momentos de evaluación»: tres renglones (diagnóstica, de proceso y final) que digan en qué sesiones y con qué. «Ajustes razonables»: para alumnos en rezago o con BAP/USAER, sin nombres.' };

const plNorm = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
function plSec(D, nombre) { const n = plNorm(nombre); return (D.secciones || []).find(s => plNorm(s.titulo) === n) || (D.secciones || []).find(s => plNorm(s.titulo).includes(n.split(' ')[0]) && plNorm(s.titulo).includes(n.split(' ').slice(-1)[0])); }
const plTexto = s => s ? (s.tipo === 'lista' ? (s.items || []).join(' ') : s.tipo === 'tabla' ? (s.filas || []).map(f => f.join(' ')).join(' ') : s.texto || '') : '';
const plLista = s => !s ? [] : s.tipo === 'lista' ? (s.items || []) : s.tipo === 'tabla' ? (s.filas || []).map(f => f.filter(Boolean).join(': ')) : String(s.texto || '').split(/\n+|(?:^|\s)[-•]\s/).map(x => x.trim()).filter(Boolean);
function plMomento(t, defMin) {
  const p = String(t || '').split(/\s*\|\s*|\n+/).map(x => x.trim()).filter(Boolean);
  let min = defMin; if (p.length && /^\d+\s*(min|minutos)?\.?$/i.test(p[0])) min = parseInt(p.shift(), 10);
  else if (p.length) { const m = p[0].match(/^(\d+)\s*min(?:utos)?\.?\s*[:\-–]?\s*/i); if (m) { min = +m[1]; p[0] = p[0].slice(m[0].length); } }
  return [Math.max(3, Math.min(90, min || defMin)), p.length ? p : ['Actividad por definir.']];
}
function plSesion(f, idx, fecha, grados) {
  const c = k => String(f[PL_COLS.indexOf(k)] || '').trim();
  const mg = {}; c('Diferenciado por grado').split(/\s*\|\|\s*|\n+/).forEach(x => { const m = x.match(/([1-6])\s*\.?\s*°?\s*[:\-–]\s*(.+)/); if (m) mg[m[1]] = m[2].trim(); });
  return { fase: c('Fase') || 'Sesión', t: c('Título') || 'Sesión ' + (idx + 1), para: (c('Propósito de la sesión') || 'Avanzar en el proyecto.').replace(/^Que (los alumnos|las y los alumnos)\s*/i, '').replace(/^./, x => x.toUpperCase()),
    inicio: plMomento(c('Inicio'), 10), des: plMomento(c('Desarrollo'), 35), cierre: plMomento(c('Cierre'), 10), sabre: c('Cómo sabré que aprendieron') || 'Observación del trabajo en clase.',
    mat: c('Materiales').split(/\s*[,;]\s*/).filter(Boolean), ludica: c('Variante lúdica'), mg, fecha, aj: [], hecha: null };
}
function plDesdeIA(D, r, grados) {
  const S = plSec(D, 'Sesiones'), filas = (S && S.filas) || [];
  if (!filas.length) throw new Error('La IA no devolvió las sesiones. Intente de nuevo.');
  const ses = r.dias.map((fecha, i) => filas[i] ? plSesion(filas[i], i, fecha, grados) : { fase: 'Flexible', t: 'Sesión de consolidación', para: 'Repasar lo que más trabajo costó, según «¿Cómo le fue?» de las sesiones anteriores.', inicio: [10, ['Retomar el criterio de éxito con menor logro.']], des: [35, ['Actividad de práctica en parejas sobre ese criterio.', 'Retroalimentación grupal.']], cierre: [10, ['Boleto de salida.']], sabre: 'Mejora en el criterio repasado.', mat: ['Según lo que se repase'], mg: {}, fecha, aj: [], hecha: null });
  const pdaS = plSec(D, 'Contenidos y PDA');
  const pdas = ((pdaS && pdaS.filas) || []).map(f => ({ campo: f[0] || '', c: f[1] || '', pda: f[2] || '', grado: f[3] || '' })).filter(x => x.c || x.pda);
  const tit = plTexto(plSec(D, 'Título del proyecto')).replace(/^[«"]|[»"]$/g, '').trim() || D.titulo || 'Mi proyecto';
  return { titulo: tit.slice(0, 160), ses, fuera: r.fuera, n: ses.length, grados, ia: true,
    meta: { metodologia: plTexto(plSec(D, 'Metodología')), problema: plTexto(plSec(D, 'Problema del contexto')), proposito: plTexto(plSec(D, 'Propósito')), producto: plTexto(plSec(D, 'Producto final')),
      pdas, ejes: plLista(plSec(D, 'Ejes articuladores')), criterios: plLista(plSec(D, 'Criterios de éxito')), momentos: plLista(plSec(D, 'Momentos de evaluación')), ajustes: plLista(plSec(D, 'Ajustes razonables')) } };
}
function plGuardar() {
  const P = E.plan; if (!P || !P.ia) return; if (!P.id) P.id = 'p' + Date.now().toString(36);
  const H = incLS.get(PLH, []).filter(x => x.id !== P.id);
  H.unshift({ id: P.id, titulo: P.titulo, grados: (P.grados || []).map(plGr).join(' y '), n: P.ses.length, desde: P.ses[0].fecha, plan: P });
  while (H.length > 12) H.pop();
  if (!incLS.set(PLH, H)) { H.splice(4); incLS.set(PLH, H); }
}
/* incLS.set no devuelve nada en la versión original: se reemplaza por una que sí avisa */
incLS.set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

/* ---------- armar con la IA ---------- */
function vArmando() {
  if (E.modo === 'ef') return vArmandoEF();
  const gr = [...E.grados].sort(), y = plYo(), r = diasClase(E.ini, E.dur);
  const pasos = [PL_LECA.length ? 'Leyendo la lectura de la realidad que usted subió' : 'Leyendo la lectura de la realidad de su grupo', 'Eligiendo contenidos y PDA del programa oficial', 'Repartiendo las sesiones en el calendario de Baja California', 'Escribiendo la secuencia, sesión por sesión', 'Preparando criterios de éxito y evaluación', 'Agregando ajustes para quienes van en rezago'];
  const cols = r.dias.map((_, i) => Object.values(FASE_COL)[i % 7]);
  $('#app').innerHTML = `<main class="wrap"><div class="armando"><div>
    <div class="tejiendo" aria-hidden="true">${cols.map((c, i) => `<i style="--c:${c};--h:${44 + (i % 3) * 18 + i * 3}px;animation-delay:${i * .28}s"></i>`).join('')}</div>
    <h2>Tejiendo su planeación…</h2><p style="color:var(--gris)">Toma de 30 segundos a 2 minutos. No cierre esta pantalla.</p>
    <ul class="pasos" aria-live="polite">${pasos.map((p, i) => `<li data-p="${i}"><span class="b">${ic('check', 'style="width:14px;height:14px"')}</span>${esc(p)}</li>`).join('')}</ul>
    <div id="armErr"></div></div></div></main>`;
  pasos.forEach((_, i) => setTimeout(() => { const li = $(`[data-p="${i}"]`); if (li) li.classList.add('ok'); }, 5000 * (i + 1)));
  (async () => {
    try {
      if (!miaServidor()) throw new Error('sinservidor');
      await plProgramaCargar();
      const lec = plLectura(), conts = plContenidos(gr);
      let programa, tema;
      if (E.puerta === 'prog') { const el = conts.filter(x => E.contsK.has(x.k)); programa = el.map(x => gr.filter(g => x.pda[g]).map(g => `${x.campo} | ${x.c} | PDA ${g}.°: ${x.pda[g]}`).join('\n')).join('\n'); tema = 'Contenidos elegidos por el docente: ' + el.map(x => x.c).join('; ') + '. Usa solo estos contenidos.'; }
      else { programa = await miaPrograma(gr, false); tema = E.puerta === 'libro' ? `Proyecto del libro de texto «${E.libroTipo}» (${gr.map(plGr).join(' y ')}): ${E.libro.trim()}. Respeta el nombre y la intención del proyecto del libro.` : 'Lo que más necesita el grupo: ' + E.necesidad.trim(); }
      const nota = [lec ? 'Lectura de la realidad (' + lec.fuente + '): ' + lec.txt : '', E.nota.trim() ? 'Indicaciones del docente: ' + E.nota.trim() : '', gr.length > 1 ? 'Grupo multigrado: ' + gr.map(plGr).join(' y ') + '.' : ''].filter(Boolean).join('\n').slice(0, 1990);
      const durTxt = ({ dia: '1 día', semana: '1 semana', '2semanas': '2 semanas', '3semanas': '3 semanas', mes: '1 mes' })[E.dur] + ` (${r.dias.length} días de clase)`;
      const lecArch = PL_LECA.filter(a => a.data && a.tipo).map(a => ({ tipo: a.tipo, data: a.data })), lecTxt = PL_LECA.filter(a => a.texto).map(a => a.texto).join('\n\n').slice(0, 60000);
      const j = await miaPost({ modo: 'nueva', formato: PL_FORMATO, nota, programa, lecturaArchivos: lecArch, lectura: lecTxt, datos: { docente: y.nombre, escuela: [y.escuela, y.cct, y.loc].filter(Boolean).join(' · '), grados: gr.map(plGr), grupo: plGrupoTxt(y), tema: tema.slice(0, 890), duracion: durTxt, fechas: r.dias.map(fCorta) } });
      E.plan = plDesdeIA(j.documento || {}, r, gr); if (PL_LECA.length) E.plan.meta.lectura = PL_LECA.map(a => a.nombre); plGuardar();
      E.vista = 'plan'; E.tab = 'sesiones'; E.abierta = 0; pintar(); scrollTo(0, 0); toast('<b>Lista.</b> Revise, ajuste lo que quiera y dé su clase.');
    } catch (e) {
      const m = miaError(e), el = $('#armErr'); if (!el) return;
      $$('.pasos li').forEach(li => li.classList.remove('ok'));
      el.innerHTML = `<div style="margin-top:18px;padding:14px 16px;border-radius:14px;background:var(--rojo-s,#F7E1DD);color:var(--rojo,#A3322A)"><b>No se pudo armar la planeación.</b><br>${esc(m)}</div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:14px"><button class="btn sec" id="armVol">Regresar</button><button class="btn maiz" id="armOtra">${ic('chispa')}Intentar de nuevo</button></div>`;
      $('#armVol').onclick = () => { E.vista = 'inicio'; pintar(); scrollTo(0, 0); }; $('#armOtra').onclick = () => vArmando();
    }
  })();
}
/* Educación Física: la unidad se arma con el fichero de juegos (como antes) */
function vArmandoEF() {
  const pasos = ['Leyendo los contenidos y PDA de Educación Física', 'Repartiendo las sesiones en los días que le toca el grupo', 'Eligiendo juegos según su espacio y su material', 'Dibujando la organización de cada juego en la cancha', 'Preparando variantes, cuidados y plan B', 'Armando la lista de cotejo y la autoevaluación'];
  armarPlanEF(); const cols = E.plan.ses.map(s => EST_COL[s.est]);
  $('#app').innerHTML = `<main class="wrap"><div class="armando"><div>
    <div class="tejiendo" aria-hidden="true">${cols.map((c, i) => `<i style="--c:${c};--h:${44 + (i % 3) * 18 + i * 3}px;animation-delay:${i * .28}s"></i>`).join('')}</div>
    <h2>Tejiendo su planeación…</h2><p style="color:var(--gris)">Esto toma unos segundos.</p>
    <ul class="pasos" aria-live="polite">${pasos.map((p, i) => `<li data-p="${i}"><span class="b">${ic('check', 'style="width:14px;height:14px"')}</span>${esc(p)}</li>`).join('')}</ul></div></div></main>`;
  pasos.forEach((_, i) => setTimeout(() => { const li = $(`[data-p="${i}"]`); if (li) li.classList.add('ok'); }, 420 * (i + 1)));
  setTimeout(() => { E.vista = 'plan'; E.tab = 'sesiones'; E.abierta = 0; pintar(); scrollTo(0, 0); toast('<b>Lista.</b> Revise, ajuste lo que quiera y dé su clase.'); }, 420 * pasos.length + 500);
}

/* ---------- la planeación ---------- */
Object.assign(FASE_COL, { 'Integración': '#3D6B4F', 'Difusión': '#9A5B2E', 'Consideraciones': '#5A4E7C', 'Avances': '#2F6F7A' });
const plCol = f => FASE_COL[f] || ['#2D5491', '#1B7560', '#A94C2A', '#6B3F7A', '#B07A14', '#8C2232', '#3D6B4F'][[...String(f)].reduce((a, c) => a + c.charCodeAt(0), 0) % 7];
const _sesHTML = sesHTML;
sesHTML = function (s, i) {
  const h = _sesHTML(Object.assign({}, s, { fase: FASE_COL[s.fase] ? s.fase : 'Flexible' }), i).replace(`Sesión ${i + 1}, flexible`, `Sesión ${i + 1}, ${esc(String(s.fase).toLowerCase())}`).replace(`--c:${FASE_COL.Flexible}`, `--c:${plCol(s.fase)}`);
  const gr = (E.plan && E.plan.grados) || [];
  if (gr.length < 2 || !s.mg || !Object.keys(s.mg).length) return h.replace(/<div class="mg">[\s\S]*?<\/div><\/div>/, '');
  const mg = `<div class="mg">${gr.filter(g => s.mg[g]).map(g => `<div><b>${g}.°</b>: ${esc(s.mg[g])}</div>`).join('')}</div>`;
  return h.replace(/<div class="mg">[\s\S]*?<\/div><\/div>/, '').replace('<div class="dos">', mg + '<div class="dos">');
};
function plMeta() { return (E.plan && E.plan.meta) || {}; }
function vPlan() {
  const P = E.plan, M = plMeta(), n = P.ses.length, hechas = P.ses.filter(s => s.hecha).length, y = plYo(), gr = P.grados || [];
  const tabs = [['sesiones', 'Sesiones'], ['evaluacion', 'Evaluación'], ['inclusion', 'Inclusión'], ['documento', 'Documento']];
  const sig = P.ses.find(s => !s.hecha) || P.ses[n - 1];
  const R = 30, L = 2 * Math.PI * R, fases = [...new Set(P.ses.map(s => s.fase))];
  const campos = [...new Set((M.pdas || []).map(x => x.campo).filter(Boolean))];
  $('#app').innerHTML = topBar('Tlamatini · Planeación didáctica', 'Mi planeación', `<button class="btn sec chico" id="nueva">Nueva</button>`) + `<main class="wrap">
   <section class="portada"><div class="sup"><span class="pill">${esc((M.metodologia || 'Proyecto').replace(/^Aprendizaje basado en /, '').slice(0, 40))}</span><span class="pill">${esc(gr.length ? gr.map(plGr).join(' y ') + (gr.length === 1 && y.grupo && gr[0] === y.grado ? ' ' + y.grupo : '') : plGrupoTxt(y))}${gr.length > 1 ? ', multigrado' : ''}</span><span class="pill">${n} sesiones</span></div>
     <h1>${esc(P.titulo)}</h1><p class="fechas">Del ${esc(fCorta(P.ses[0].fecha))} al ${esc(fCorta(P.ses[n - 1].fecha))}</p>
     <div class="fila"><div><p class="t" style="font-size:14px;color:#C9D3E6;margin-bottom:2px">El proyecto día por día. Toque un día para ir a su sesión.</p>${telar(P.ses.map(s => s.fecha), P.fuera, P.ses, 'grande')}
       <p class="leyenda">${fases.map(f => `<span><i style="background:${plCol(f)}"></i>${esc(f)}</span>`).join('')}</p></div>
       <div class="prog"><svg viewBox="0 0 74 74" aria-hidden="true"><circle cx="37" cy="37" r="${R}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="8"/><circle cx="37" cy="37" r="${R}" fill="none" stroke="#E3A63B" stroke-width="8" stroke-linecap="${hechas ? 'round' : 'butt'}" stroke-dasharray="${L * hechas / n} ${L}"/></svg><div><b>${hechas} de ${n}</b><small>sesiones dadas</small></div></div></div></section>
   <div class="cuerpo"><div>
     <nav class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-tab="${k}" aria-selected="${E.tab === k}">${l}</button>`).join('')}</nav>
     <section id="panel">${({ sesiones: pSesiones, evaluacion: pEval, inclusion: pInc, documento: pDoc })[E.tab]()}</section></div>
    <aside class="lado">
     <div class="hoja-l"><h3>Próxima clase</h3><p style="margin-bottom:12px">${esc(fCorta(sig.fecha))}: <b>${esc(sig.t)}</b></p><button class="btn maiz" id="darHoy" style="width:100%">${ic('play')}Mi clase de hoy</button></div>
     ${M.proposito || M.producto ? `<div class="hoja-l">${M.proposito ? `<h3>Propósito</h3><p>${esc(M.proposito)}</p>` : ''}${M.producto ? `<h3 style="margin-top:14px">Producto final</h3><p>${esc(M.producto)}</p>` : ''}</div>` : ''}
     ${(M.pdas || []).length ? `<div class="hoja-l"><h3>Contenidos y PDA</h3><p style="font-size:13.5px;color:var(--gris)">Programa sintético oficial. Toque uno para leer su PDA.</p>
       <div class="pdas">${M.pdas.map(x => `<details class="pda"><summary><span class="tx">${esc(x.c)}<small>${esc(x.campo)}${x.grado ? ' · ' + esc(x.grado) : ''}</small></span>${ic('abajo')}</summary><p>${esc(x.pda)}</p></details>`).join('')}</div>
       <div class="chips" style="margin-top:12px">${campos.map(c => `<span class="chip">${esc(c)}</span>`).join('')}${(M.ejes || []).map(e => `<span class="chip t">${esc(e)}</span>`).join('')}</div></div>` : ''}
     ${M.problema ? `<div class="hoja-l"><h3>Problema del contexto</h3><p>${esc(M.problema)}</p></div>` : ''}
    </aside></div></main>
   <div class="fijo solo-movil"><div class="fijo-in"><div class="tx"><b>Próxima clase</b><br>${esc(fCorta(sig.fecha))}</div><button class="btn maiz" id="darHoy2">${ic('play')}Mi clase de hoy</button></div></div>`;
  $('#atras').onclick = () => { E.vista = 'inicio'; pintar(); scrollTo(0, 0); };
  $('#nueva').onclick = () => { E.vista = 'inicio'; pintar(); scrollTo(0, 0); };
  $$('[data-tab]').forEach(b => b.onclick = () => { E.tab = b.dataset.tab; repinta(); });
  const dar = () => abrirClase(Math.max(0, P.ses.findIndex(s => !s.hecha))); $('#darHoy').onclick = dar; $('#darHoy2').onclick = dar;
  $$('[data-ir]').forEach(b => b.onclick = () => { E.tab = 'sesiones'; E.abierta = +b.dataset.ir; pintar(); const el = $('#ses' + b.dataset.ir); if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' }); });
  cablearPanel();
}
function pEval() {
  const M = plMeta(), C = M.criterios || [], n = plAlumnos().length;
  return `<div class="grid2">
   <div class="card"><h3>Criterios de éxito</h3><p class="sub">Escritos para sus alumnos. Cópielos en el pizarrón o imprímalos en grande desde el primer día.</p>
     <div class="pizarron"><h4>Al terminar el proyecto…</h4><ul>${C.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
     <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn sec chico" id="impCartel">${ic('imp', 'style="width:16px;height:16px"')}Imprimir en tamaño cartel</button></div></div>
   <div class="card"><h3>Lista de cotejo</h3><p class="sub">Con los mismos criterios. ${n ? 'Se imprime con los nombres de sus alumnos (de su base en Tlamatini).' : 'Si da de alta a sus alumnos en Tlamatini, se imprime con sus nombres.'}</p>
     <div style="overflow:auto"><table class="lc"><thead><tr><th>Criterio</th><th class="c">Logrado</th><th class="c">En proceso</th><th class="c">Requiere apoyo</th></tr></thead>
     <tbody>${C.map(c => `<tr><td>${esc(c)}</td><td class="c">☐</td><td class="c">☐</td><td class="c">☐</td></tr>`).join('')}</tbody></table></div>
     <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn sec chico" id="impLista">${ic('imp', 'style="width:16px;height:16px"')}${n ? `Imprimir con mis ${n} alumnos` : 'Imprimir en blanco'}</button></div></div>
   <div class="card"><h3>Momentos de evaluación</h3><p class="sub">Evaluación formativa: se valora el proceso y se ajusta la enseñanza.</p><div class="momentos">
     ${(M.momentos || []).map((m, i) => `<div class="momento"><span class="n" style="background:${['var(--accent-soft)', 'var(--ambar-soft)', 'var(--jade-soft)'][i % 3]};color:${['var(--accent)', 'var(--ambar)', 'var(--jade)'][i % 3]}">${i + 1}</span><div>${esc(m)}</div></div>`).join('')}</div></div>
   <div class="card"><h3>Lo que va pasando</h3><p class="sub">Se llena solo con «¿Cómo le fue?» al terminar cada clase.</p>
     ${E.plan.ses.filter(s => s.hecha).length ? E.plan.ses.map((s, i) => s.hecha ? `<p style="padding:6px 0;border-bottom:1px solid var(--line2)"><b>Sesión ${i + 1}</b> · ${s.hecha === 'si' ? 'Se logró' : s.hecha === 'medio' ? 'A medias' : 'No se logró'}${s.notaClase ? ' — ' + esc(s.notaClase) : ''}</p>` : '').join('') : '<p style="color:var(--muted)">Aún no ha dado ninguna clase de este proyecto. Pruebe «Mi clase de hoy».</p>'}</div>
  </div>`;
}
function pInc() {
  const A = plMeta().ajustes || [];
  return incCard() + `<div class="card" style="margin-top:14px"><h3>Ajustes razonables para el grupo</h3><p class="sub">Tlamatini los propone con lo que sabe de su grupo. Usted decide cuáles aplicar; puede editarlos en la pestaña Documento.</p>
   ${A.length ? `<ul style="margin:0;padding-left:18px">${A.map(a => `<li style="margin-bottom:6px">${esc(a)}</li>`).join('')}</ul>` : '<p style="color:var(--gris)">Sin ajustes propuestos.</p>'}
   <p class="privado">${ic('candado', 'style="width:16px;height:16px"')}Los nombres de los alumnos se ven solo en su dispositivo; no se envían a ningún lado.</p></div>`;
}
function pDoc() {
  const P = E.plan, M = plMeta(), y = plYo(), gr = P.grados || [];
  const grTxt = gr.length ? gr.map(plGr).join(', ') + (gr.length === 1 && y.grupo && gr[0] === y.grado ? ' ' + y.grupo : '') + (gr.length > 1 ? ' (multigrado)' : '') : plGrupoTxt(y);
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><button class="btn pri" data-doc="word">${ic('descarga')}Word (editable)</button><button class="btn sec" data-doc="pdf">${ic('descarga')}PDF</button><button class="btn sec" data-doc="imp">${ic('imp')}Imprimir</button></div>
  <p style="color:var(--muted);font-size:14.5px;margin-bottom:12px">Así la recibe la dirección o la Supervisión. Puede corregir cualquier texto aquí mismo antes de descargarla; sus cambios se guardan.${P.htmlDoc ? ' <button class="btn sec chico" id="plRegen">Volver a armar el documento con las sesiones</button>' : ''}</p>
  ${P.htmlDoc ? `<div class="hoja" id="plHoja" contenteditable="true" spellcheck="true">${P.htmlDoc}</div>` : `<div class="hoja" id="plHoja" contenteditable="true" spellcheck="true"><div class="enc">${plLogo('isep')}<div style="text-align:center">INSTITUTO DE SERVICIOS EDUCATIVOS Y PEDAGÓGICOS DE BAJA CALIFORNIA<br>${esc(plEscLinea(y))}</div>${plLogo('esc')}</div>
   <h1>Planeación didáctica</h1><p style="text-align:center;margin:2px 0 10px">${esc(P.titulo)}</p>
   <table><tr><th>Docente</th><td>${esc(plNombre())}</td><th>Grado y grupo</th><td>${esc(grTxt)}</td></tr><tr><th>Periodo</th><td>${esc(fCorta(P.ses[0].fecha))} al ${esc(fCorta(P.ses[P.ses.length - 1].fecha))}</td><th>Sesiones</th><td>${P.ses.length}</td></tr><tr><th>Metodología</th><td colspan="3">${esc(M.metodologia || '')}</td></tr></table>
   ${M.problema ? `<h3>Problema del contexto</h3><p>${esc(M.problema)}</p>` : ''}
   ${M.proposito ? `<h3>Propósito</h3><p>${esc(M.proposito)}</p>` : ''}${M.producto ? `<h3>Producto final</h3><p>${esc(M.producto)}</p>` : ''}
   <h3>Contenidos y Procesos de Desarrollo de Aprendizaje</h3><table><tr><th style="width:22%">Campo formativo</th><th style="width:28%">Contenido</th><th>PDA</th></tr>${(M.pdas || []).map(x => `<tr><td>${esc(x.campo)}</td><td>${esc(x.c)}</td><td>${x.grado ? '<b>' + esc(x.grado) + '</b> ' : ''}${esc(x.pda)}</td></tr>`).join('')}</table>
   ${(M.ejes || []).length ? `<p style="margin-top:6px"><b>Ejes articuladores:</b> ${M.ejes.map(esc).join(' · ')}.</p>` : ''}
   <h3>Secuencia didáctica</h3><table><tr><th style="width:16%">Sesión</th><th>Actividades</th><th style="width:22%">Evaluación</th></tr>${P.ses.map((s, i) => `<tr><td><b>${i + 1}. ${esc(s.fase)}</b><br>${esc(fCorta(s.fecha))}</td><td><b>${esc(s.t)}.</b> <i>Inicio (${s.inicio[0]} min):</i> ${esc(s.inicio[1].join(' '))} <i>Desarrollo (${s.des[0]} min):</i> ${esc(s.des[1].join(' '))} <i>Cierre (${s.cierre[0]} min):</i> ${esc(s.cierre[1].join(' '))}${gr.length > 1 && s.mg ? gr.filter(g => s.mg[g]).map(g => `<br><b>${g}.°:</b> ${esc(s.mg[g])}`).join('') : ''}<br><i>Material: ${esc(s.mat.join(', '))}.</i></td><td>${esc(s.sabre)}</td></tr>`).join('')}</table>
   <h3>Evaluación formativa</h3>${(M.criterios || []).length ? `<p><b>Criterios de éxito:</b> ${M.criterios.map(esc).join(' · ')}</p>` : ''}${(M.momentos || []).length ? `<p><b>Momentos:</b> ${M.momentos.map(esc).join(' · ')}</p>` : ''}<p><b>Instrumentos:</b> lista de cotejo, boletos de salida, coevaluación y autoevaluación.</p>
   ${incDocHTML()}${(M.ajustes || []).length ? `<h3>Ajustes razonables para el grupo</h3><ul>${M.ajustes.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
   <div class="firmas"><div>${esc(plNombre())}<br>Docente</div><div>${y.director ? 'Vo. Bo. ' + esc(y.director) + '<br>Director(a) de la escuela' : 'Vo. Bo. Director(a) de la escuela'}</div></div></div>`}`;
}
/* Imprimir: criterios en cartel y lista de cotejo con los alumnos */
function plImprimir(titulo, cuerpo, horiz) {
  const w = window.open('', '_blank'); if (!w) { toast('Permita las ventanas emergentes para imprimir.'); return; }
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>@page{size:letter ${horiz ? 'landscape' : 'portrait'};margin:12mm}body{font-family:Arial,sans-serif;color:#111}table{border-collapse:collapse;width:100%}th,td{border:1px solid #888;padding:5px 6px;font-size:11px;vertical-align:middle}th{background:#E8EDF5}h1{font-size:18px;margin:0 0 4px}p{margin:0 0 8px;font-size:12px}.cartel li{font-size:30px;line-height:1.35;margin:0 0 18px}.cartel h1{font-size:40px;margin-bottom:24px}</style></head><body>${cuerpo}<script>onload=()=>setTimeout(()=>print(),300)<\/script></body></html>`);
  w.document.close();
}
const _cablearPanel = cablearPanel;
cablearPanel = function () {
  _cablearPanel();
  const P = E.plan, M = plMeta(), y = plYo();
  const c = $('#impCartel'); if (c) c.onclick = () => plImprimir('Criterios de éxito', `<div class="cartel"><h1>Al terminar el proyecto «${esc(P.titulo)}»…</h1><ul>${(M.criterios || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`);
  const l = $('#impLista'); if (l) l.onclick = () => { const A = plAlumnos().map(plNomAl).sort((a, b) => a.localeCompare(b, 'es')), C = M.criterios || [], filas = A.length ? A : Array.from({ length: 30 }, () => '');
    plImprimir('Lista de cotejo', `<h1>Lista de cotejo · ${esc(P.titulo)}</h1><p>${esc(plNombre())} · ${esc(plGrupoTxt(y))} · ${esc(plEscCorta(y))} · L = logrado, P = en proceso, A = requiere apoyo</p>
      <table><thead><tr><th style="width:24px">No.</th><th style="width:200px">Alumno</th>${C.map((x, i) => `<th title="${esc(x)}">${i + 1}. ${esc(x.length > 60 ? x.slice(0, 58) + '…' : x)}</th>`).join('')}</tr></thead><tbody>${filas.map((a, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(a)}</td>${C.map(() => '<td></td>').join('')}</tr>`).join('')}</tbody></table>`, true); };
  const h = $('#plHoja'); let tG = null; if (h) h.oninput = () => { P.htmlDoc = h.innerHTML; clearTimeout(tG); tG = setTimeout(plGuardar, 800); };
  const rg = $('#plRegen'); if (rg) rg.onclick = () => { if (!confirm('Se perderán los cambios que hizo a mano en el documento. ¿Continuar?')) return; delete P.htmlDoc; plGuardar(); repintarPanel(); };
};
/* Pedir otro cambio a una sesión: la IA la reescribe */
const _ajustar = ajustar;
ajustar = function (i, tipo) {
  const s = E.plan.ses[i];
  if (tipo === 'lectura' && !s.aj.includes('lectura')) { s.des[1].push('Lectura breve en voz alta (5 min) de un texto relacionado con el tema; preguntar: «¿Qué dato nuevo encontraste?».'); s.des[0] += 5; s.aj.push('lectura'); toast(`Sesión ${i + 1}: se agregó una lectura de 5 minutos.`); plGuardar(); repintarPanel(); return; }
  if (tipo !== 'ia') { _ajustar(i, tipo); plGuardar(); return; }
  const t = prompt('¿Qué cambio quiere en esta sesión? (Ej.: «que trabajen en el patio», «agrega un video corto»)'); if (!t || !t.trim()) return;
  if (!miaServidor()) { toast(esc(miaError('sinservidor')), 7000); return; }
  const gr = E.plan.grados || [], fila = [s.fecha, s.fase, s.t, s.para, s.inicio[0] + ' min | ' + s.inicio[1].join(' | '), s.des[0] + ' min | ' + s.des[1].join(' | '), s.cierre[0] + ' min | ' + s.cierre[1].join(' | '), s.sabre, s.mat.join(', '), s.ludica || '', gr.filter(g => s.mg && s.mg[g]).map(g => g + '.°: ' + s.mg[g]).join(' || ')];
  toast('Reescribiendo la sesión con la IA… (unos segundos)', 60000);
  miaPost({ modo: 'mejorar', texto: 'Proyecto: ' + E.plan.titulo + '\nSesiones\n' + PL_COLS.join(' | ') + '\n' + fila.join(' | '), pedidos: [t.trim()], nota: 'Cambia SOLO esta sesión según lo que pide el docente: ' + t.trim() + '. Devuelve una sola sección «Sesiones» con la misma tabla y una sola fila. ' + PL_FORMATO.notas.slice(PL_FORMATO.notas.indexOf('En «Inicio»'), PL_FORMATO.notas.indexOf('«Criterios de éxito»')), datos: { grados: gr.map(plGr) } })
    .then(j => { const S = (j.documento && (j.documento.secciones || []).find(x => x.tipo === 'tabla' && (x.filas || []).length)); if (!S) throw new Error('La IA no devolvió la sesión.');
      const f = S.filas[0], cols = S.columnas || []; const fx = PL_COLS.map(k => { const ix = cols.findIndex(c => plNorm(c) === plNorm(k)); return ix >= 0 ? f[ix] : ''; });
      const nueva = plSesion(fx.some(Boolean) ? fx : f, i, s.fecha, gr); nueva.aj = s.aj.concat(['ia']); nueva.nota = 'Ajustada: ' + t.trim(); E.plan.ses[i] = nueva; plGuardar(); repintarPanel(); toast(`Sesión ${i + 1} ajustada.`); })
    .catch(e => toast(esc(miaError(e)), 7000));
};
const _guardarEdicion = guardarEdicion;
guardarEdicion = function (i) { _guardarEdicion(i); plGuardar(); };
/* Educación Física: imprimir la lista de cotejo y abrir Ulama para registrar en el patio */
const _cablearEF = cablearEF;
cablearEF = function () {
  _cablearEF();
  const l = $('#efImpLista'); if (l) l.onclick = () => { const gr = [...E.efGr].sort(), A = plAlumnos().map(plNomAl).sort((a, b) => a.localeCompare(b, 'es')), filas = A.length ? A : Array.from({ length: 30 }, () => '');
    plImprimir('Lista de cotejo de Educación Física', `<h1>Lista de cotejo · Educación Física</h1><p>${esc(plNombre(true))} · ${gr.map(plGr).join(', ')} · ${esc(plEscCorta())} · L = logrado, P = en proceso, A = necesita apoyo · Grupo: __________</p>
      <table><thead><tr><th style="width:24px">No.</th><th style="width:190px">Alumno</th>${EF_CRIT.map(([c, g], i) => `<th>${i + 1}. ${esc(c)} <i>(${esc(g)})</i></th>`).join('')}</tr></thead><tbody>${filas.map((a, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(a)}</td>${EF_CRIT.map(() => '<td></td>').join('')}</tr>`).join('')}</tbody></table>`, true); };
  const u = $('#efUlama'); if (u) u.onclick = () => { location.href = '../educacion-fisica/'; };
};
