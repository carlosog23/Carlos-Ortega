/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Tlamatini · Lectura de la realidad, Programa de Mejora Continua y Programa Analítico, al estilo de la nueva planeación:
   pocas preguntas, el documento lo redacta la IA (Gemini, por el servidor de Tequio, acción planIA «nueva») con lo que
   Tlamatini ya sabe (insumos de Tequio: SisAT, EIA, PMC; la lectura de la realidad anterior) y el programa sintético oficial.
   Se abre con planeacion.html#lectura, #pmc o #analitico. Todo es editable; se descarga en Word o PDF y se guarda en el dispositivo. */
"use strict";

const DOCS = {
  dx: { nombre: 'Lectura de la realidad', corto: 'lectura', h1: 'Su lectura de la realidad, clara y en pocos minutos', p: 'Tlamatini junta lo que ya se sabe de su grupo o de su escuela (SisAT, EIA, PMC y lo que usted observa) y redacta el diagnóstico con su análisis y sus prioridades. Usted lo revisa y lo ajusta.', niveles: true,
    chipsT: '¿Qué observa?', chips: ['Rezago en lectura y escritura', 'Rezago en matemáticas', 'Ausentismo o impuntualidad', 'Conflictos de convivencia', 'Poca participación de las familias', 'Familias jornaleras o migrantes', 'Alumnos que hablan una lengua indígena', 'Falta de agua o de servicios', 'Poca conectividad', 'Alumnos con BAP o apoyo de USAER', 'Grupo participativo y con buena disposición', 'Problemas de alimentación o salud'] },
  pm: { nombre: 'Programa de Mejora Continua', corto: 'PMC', h1: 'Su Programa de Mejora Continua, listo para el colectivo', p: 'A partir de la lectura de la realidad de la escuela, Tlamatini propone objetivos, metas medibles y acciones por ámbito, con responsables y seguimiento. El colectivo lo revisa y lo hace suyo.', niveles: false,
    chipsT: '¿Qué ámbitos va a trabajar?', chips: ['Aprovechamiento académico y asistencia de los alumnos', 'Prácticas docentes y directivas', 'Formación docente', 'Avance de los planes y programas educativos', 'Participación de la comunidad', 'Desempeño de la autoridad escolar', 'Infraestructura y equipamiento', 'Carga administrativa'] },
  pa: { nombre: 'Programa Analítico', corto: 'analítico', h1: 'Su programa analítico, contextualizado y por trimestre', p: 'Tlamatini toma las problemáticas de su lectura de la realidad, elige los contenidos y PDA del programa sintético oficial que las atienden y los ubica en su comunidad y en los tres trimestres. Usted decide qué se queda.', niveles: true,
    chipsT: '¿Cómo prefiere trabajar?', chips: ['Proyectos comunitarios', 'Aprendizaje basado en indagación (STEAM)', 'Aprendizaje basado en problemas', 'Aprendizaje servicio', 'Rincones o estaciones', 'Trabajo por campos formativos integrados'] }
};
const DOC_FMT = {
  dx: g => ({ titulo: 'Lectura de la realidad', orientacion: 'vertical', encabezado: ['Escuela', 'C.C.T.', g ? 'Grado y grupo' : 'Nivel', 'Ciclo escolar', g ? 'Docente' : 'Director(a)'],
    secciones: [{ titulo: 'Contexto de la comunidad', tipo: 'texto' }, { titulo: g ? 'Nuestro grupo' : 'Nuestra escuela', tipo: 'texto' },
      { titulo: 'Resultados de aprendizaje', tipo: 'tabla', columnas: ['Fuente', 'Qué muestra', 'Alumnos que requieren apoyo', 'Lo que significa'] },
      { titulo: 'Análisis crítico: ¿por qué estamos así?', tipo: 'texto' },
      { titulo: 'Problemáticas priorizadas', tipo: 'tabla', columnas: ['Prioridad', 'Problemática', 'Evidencia', 'Campo formativo', 'Ámbito'] },
      { titulo: 'Hacia dónde vamos', tipo: 'lista' }],
    notas: 'NO es una planeación: es la lectura de la realidad (diagnóstico socioeducativo de la NEM). Breve y práctica (2 a 3 cuartillas), en frases claras, sin teoría, sin citas y sin relleno. Usa solo los datos que se dan; lo que falte va como «[completar: …]». «Resultados de aprendizaje»: una fila por fuente (SisAT, EIA, observación del docente, etc.). «Análisis crítico»: causas posibles de los resultados (escuela, aula, familia, comunidad), en 1 o 2 párrafos. «Problemáticas priorizadas»: de 3 a 5, de la más urgente (1) a la menos. «Hacia dónde vamos»: de 4 a 6 líneas de acción concretas. Sin nombres de alumnos.' }),
  pm: () => ({ titulo: 'Programa de Mejora Continua', orientacion: 'horizontal', encabezado: ['Escuela', 'C.C.T.', 'Ciclo escolar', 'Director(a)'],
    secciones: [{ titulo: 'Diagnóstico en breve', tipo: 'texto' }, { titulo: 'Problemáticas que atiende', tipo: 'lista' },
      { titulo: 'Objetivos, metas y acciones por ámbito', tipo: 'tabla', columnas: ['Ámbito', 'Objetivo', 'Meta', 'Acciones', 'Responsables', 'Periodo', 'Seguimiento'] },
      { titulo: 'Seguimiento y evaluación', tipo: 'lista' }, { titulo: 'Compromisos del colectivo', tipo: 'lista' }],
    notas: 'NO es una planeación: es el Programa de Mejora Continua (PMC) de la escuela, NEM. Práctico y profesional, sin teoría. «Diagnóstico en breve»: un párrafo. Una fila por cada ámbito que se pide (si no se pide ninguno, los 8 ámbitos). Objetivo: qué se quiere lograr. Meta: medible, con cantidad y fecha dentro del ciclo; si falta el dato de partida, usa «[completar: …]» en lugar de inventar cifras. Acciones: de 2 a 4, concretas, separadas por « | ». Responsables por función (directora, colectivo docente, Comité de Participación Escolar, etc.), nunca nombres inventados. Periodo dentro del ciclo escolar. Seguimiento: evidencia y cada cuándo se revisa (por ejemplo, en cada sesión de CTE).' }),
  pa: (g, esc) => ({ titulo: 'Programa Analítico', orientacion: 'horizontal', encabezado: ['Escuela', 'C.C.T.', g ? 'Grado y grupo' : 'Grados', 'Ciclo escolar', g ? 'Docente' : 'Director(a)'],
    secciones: [{ titulo: 'Lectura de la realidad en breve', tipo: 'texto' }, { titulo: 'Problemáticas que se atienden', tipo: 'lista' },
      { titulo: 'Contextualización de contenidos', tipo: 'tabla', columnas: ['Campo formativo', 'Contenido', esc ? 'Fase' : 'PDA', 'Cómo lo trabajaremos en nuestra comunidad', 'Problemática que atiende', 'Ejes articuladores', 'Trimestre'] },
      { titulo: 'Codiseño: contenidos de la comunidad', tipo: 'tabla', columnas: ['Contenido propio', 'Por qué', 'Campo formativo', 'Trimestre'] },
      { titulo: 'Orientaciones didácticas', tipo: 'lista' }, { titulo: 'Evaluación formativa', tipo: 'lista' }],
    notas: 'NO es una planeación: es el programa analítico de la NEM (segundo plano: contextualización y codiseño). Práctico, sin teoría. Usa SOLO contenidos' + (esc ? '' : ' y PDA') + ' del PROGRAMA que se da, copiados tal cual. De 2 a 4 contenidos por campo formativo, elegidos porque atienden las problemáticas; reparte en los trimestres 1, 2 y 3. «Cómo lo trabajaremos en nuestra comunidad»: una frase concreta ligada al contexto. «Codiseño»: de 1 a 3 contenidos propios de la comunidad. «Orientaciones didácticas»: metodologías sugeridas por campo formativo. «Evaluación formativa»: de 3 a 5 renglones concretos. Sin nombres de alumnos.' })
};
const DOCH = 'tlm-docs-ped';
function docCiclo() { const d = new Date(), y = d.getFullYear(); return d.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; }
function docInsumos(nivel) {
  const y = plYo(), c = y.cct ? incLS.get('tqi-' + y.cct, null) : null, D = c && c.d, out = [];
  if (D) {
    if (nivel === 'grupo' && (D.grupos || []).length) { const G = D.grupos.find(x => String(x.grado) === y.grado && String(x.grupo || '').toUpperCase() === y.grupo) || D.grupos.find(x => String(x.grado) === y.grado); if (G) out.push({ t: 'Tequio · lectura del grupo ' + plGr(G.grado) + (G.grupo ? ' ' + G.grupo : ''), txt: plTxt(G.datos, 1200), fecha: G.actualizado }); }
    if (D.escuelaIns) out.push({ t: 'Tequio · lectura de la escuela', txt: plTxt(D.escuelaIns.datos, 1200), fecha: D.escuelaIns.actualizado });
    if (D.pmc && D.pmc.datos) out.push({ t: 'Tequio · PMC de la escuela', txt: plTxt(D.pmc.datos, 900), fecha: D.pmc.actualizado });
  }
  const H = incLS.get(DOCH, []), dx = H.find(x => x.tool === 'dx' && x.nivel === nivel) || H.find(x => x.tool === 'dx');
  if (dx) out.push({ t: 'Su lectura de la realidad en Tlamatini', txt: docTexto(dx.documento, 1300), fecha: dx.fecha, propia: true });
  return out.filter(x => x.txt && x.txt.length > 40);
}
function docTexto(D, n) { return plTxt((D && D.secciones || []).map(s => [s.titulo, s.texto, s.items, s.filas]), n); }
async function docTraerTequio() {
  const y = plYo(); if (!y.cct) throw new Error('Capture la clave de su escuela (CCT) en «Mis datos».');
  const sv = miaServidor(); if (!sv) throw new Error('sinservidor');
  const r = await fetch(sv.s, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ k: sv.k || '', accion: 'tlaInsumos', datos: { cct: y.cct, tok: sv.tok || '' } }) });
  const j = await r.json(); if (!j.ok) throw new Error(j.mensaje || 'El servidor no respondió.');
  incLS.set('tqi-' + y.cct, { t: Date.now(), d: j }); return j;
}

/* ---------- inicio ---------- */
Object.assign(E, { dNivel: 'grupo', dChips: new Set(), dNota: '', dRes: null, dGr: null });
function vDocInicio() {
  const T = DOCS[E.modo], y = plYo(), niv = T.niveles ? E.dNivel : 'escuela', ins = docInsumos(niv), H = incLS.get(DOCH, []).filter(x => x.tool === E.modo);
  if (!E.dGr) E.dGr = new Set(y.grado ? [y.grado] : []);
  const gr = [...E.dGr].sort(), ok = niv === 'escuela' || gr.length;
  $('#app').innerHTML = topBar('Tlamatini · Pedagógico', T.nombre) + `<main class="wrap">
   <div class="escena"><div>
    <section class="intro"><h1>${esc(T.h1)}</h1><p>${esc(T.p)}</p>${plQuien(false)}</section>
    ${T.niveles ? `<div class="paso-t"><span class="n">1</span><h2>¿De su grupo o de toda la escuela?</h2></div>
     <div class="seg" role="group" aria-label="Nivel"><button data-niv="grupo" aria-pressed="${niv === 'grupo'}">Mi grupo</button><button data-niv="escuela" aria-pressed="${niv === 'escuela'}">Toda la escuela</button></div>
     ${niv === 'grupo' ? `<div class="seg" role="group" aria-label="Grado" style="margin-top:10px">${['1', '2', '3', '4', '5', '6'].map(g => `<button data-dgr="${g}" aria-pressed="${E.dGr.has(g)}">${g}.°</button>`).join('')}</div><p style="font-size:13.5px;color:var(--gris);margin:6px 4px 0">${gr.length > 1 ? 'Grupo multigrado.' : 'Si su grupo es multigrado, toque también los otros grados.'}</p>` : ''}` : ''}
    <div class="paso-t"><span class="n">${T.niveles ? 2 : 1}</span><h2>Lo que Tlamatini ya sabe</h2></div>
    <div class="bandeja">${ins.length ? ins.map(x => `<p class="contexto" style="margin:0 0 8px"><b style="color:var(--tinta)">${esc(x.t)}</b>${x.fecha ? ` <span style="color:var(--gris);font-size:13px">(${esc(String(x.fecha).slice(0, 10))})</span>` : ''}<br>${esc(x.txt.slice(0, 220))}${x.txt.length > 220 ? '…' : ''}</p>`).join('') : `<p style="color:var(--gris);margin:0">Todavía no hay datos de Tequio ni una lectura de la realidad guardada para ${niv === 'grupo' ? 'su grupo' : 'su escuela'}. Tlamatini partirá de lo que usted marque y escriba abajo.</p>`}
      <div style="margin-top:10px"><button class="btn sec chico" id="dTq">${ic('descarga', 'style="width:16px;height:16px"')}Traer lo más reciente de Tequio</button></div></div>
    <div class="paso-t"><span class="n">${T.niveles ? 3 : 2}</span><h2>${esc(T.chipsT)}</h2></div>
    <div class="chips">${T.chips.map(c => `<button type="button" class="chip" data-dch="${esc(c)}" aria-pressed="${E.dChips.has(c)}" style="cursor:pointer;${E.dChips.has(c) ? 'background:var(--anil);color:#fff;border-color:var(--anil)' : ''}">${E.dChips.has(c) ? '✓ ' : ''}${esc(c)}</button>`).join('')}</div>
    <label class="sr" for="dNota">Algo más (opcional)</label><textarea class="nota" id="dNota" style="margin-top:12px" placeholder="Opcional. Lo que usted sabe y no está en los datos: ${E.modo === 'pm' ? 'acuerdos del CTE, prioridades de la dirección…' : 'qué observa en los alumnos, cómo es la comunidad…'}">${esc(E.dNota)}</textarea>
    ${H.length ? `<div class="paso-t"><span class="n">↺</span><h2>Mis documentos</h2></div><div style="display:grid;gap:8px">${H.map(h => `<div class="cont" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><button data-dab="${esc(h.id)}" style="all:unset;cursor:pointer;flex:1"><b style="font-size:15.5px">${esc(h.titulo)}</b><small style="display:block;color:var(--gris)">${h.nivel === 'grupo' ? 'Grupo ' + esc(h.grupo || '') : 'Escuela'} · ${esc(String(h.fecha).slice(0, 10))}</small></button><button class="btn sec chico" data-dbo="${esc(h.id)}" aria-label="Borrar">${ic('x', 'style="width:14px;height:14px"')}</button></div>`).join('')}</div>` : ''}
   </div>
   <aside class="previa" aria-label="Su documento"><p class="t">Su ${esc(T.nombre.toLowerCase())}</p>
     <h3>${niv === 'grupo' ? esc(gr.map(plGr).join(' y ') + (gr.length === 1 && y.grupo && gr[0] === y.grado ? ' ' + y.grupo : '')) || 'Elija el grado' : esc(plEscCorta(y))}</h3>
     <dl><dt>Ciclo</dt><dd>${docCiclo()}</dd><dt>Parte de</dt><dd>${ins.length ? ins.length + ' fuente' + (ins.length === 1 ? '' : 's') + ' de datos' : 'lo que usted indique'}${E.dChips.size ? ' y ' + E.dChips.size + ' marca' + (E.dChips.size === 1 ? '' : 's') : ''}</dd><dt>Entrega</dt><dd>Word y PDF, editable</dd></dl>
     <button class="btn maiz" id="dArmar" ${ok ? '' : 'disabled'}>${ic('chispa')}Armar mi ${esc(T.corto)}</button></aside>
   </div></main>`;
  $('#atras').onclick = () => { location.href = 'index.html#ir=pedagogico'; };
  $$('[data-niv]').forEach(b => b.onclick = () => { E.dNivel = b.dataset.niv; repinta(); });
  $$('[data-dgr]').forEach(b => b.onclick = () => { const g = b.dataset.dgr; E.dGr.has(g) ? E.dGr.delete(g) : E.dGr.add(g); repinta(); });
  $$('[data-dch]').forEach(b => b.onclick = () => { const c = b.dataset.dch; E.dChips.has(c) ? E.dChips.delete(c) : E.dChips.add(c); repinta(); });
  $('#dNota').oninput = e => { E.dNota = e.target.value; };
  $('#dTq').onclick = async e => { const b = e.currentTarget; b.disabled = true; b.textContent = 'Buscando en Tequio…'; try { await docTraerTequio(); toast('Listo: se cargaron los datos de su escuela.'); } catch (err) { toast(esc(/sin-?servidor/.test(err.message) ? 'Para traer los datos de Tequio se necesita su enlace de acceso de Tlamatini e internet.' : err.message), 6000); } repinta(); };
  $$('[data-dab]').forEach(b => b.onclick = () => { const h = incLS.get(DOCH, []).find(x => x.id === b.dataset.dab); if (!h) return; E.dRes = h; E.vista = 'plan'; pintar(); scrollTo(0, 0); });
  $$('[data-dbo]').forEach(b => b.onclick = () => { if (!confirm('¿Borrar este documento de este dispositivo?')) return; incLS.set(DOCH, incLS.get(DOCH, []).filter(x => x.id !== b.dataset.dbo)); repinta(); });
  $('#dArmar').onclick = () => { E.vista = 'armando'; pintar(); scrollTo(0, 0); };
}

/* ---------- armar con la IA ---------- */
function vDocArmando() {
  const T = DOCS[E.modo], tool = E.modo, y = plYo(), niv = T.niveles ? E.dNivel : 'escuela', gr = niv === 'grupo' ? [...E.dGr].sort() : [];
  const pasos = { dx: ['Leyendo los datos de Tequio y lo que usted observa', 'Describiendo el contexto y a sus alumnos', 'Analizando por qué están así los resultados', 'Priorizando las problemáticas', 'Proponiendo hacia dónde ir'],
    pm: ['Leyendo la lectura de la realidad de la escuela', 'Definiendo objetivos por ámbito', 'Escribiendo metas medibles', 'Proponiendo acciones y responsables', 'Armando el seguimiento'],
    pa: ['Leyendo las problemáticas de su lectura de la realidad', 'Buscando contenidos y PDA en el programa sintético', 'Contextualizando cada contenido en su comunidad', 'Repartiendo en los tres trimestres', 'Escribiendo orientaciones y evaluación'] }[tool];
  $('#app').innerHTML = `<main class="wrap"><div class="armando"><div>
    <div class="tejiendo" aria-hidden="true">${pasos.map((_, i) => `<i style="--c:${Object.values(FASE_COL)[i]};--h:${50 + i * 14}px;animation-delay:${i * .28}s"></i>`).join('')}</div>
    <h2>Redactando su ${esc(T.nombre.toLowerCase())}…</h2><p style="color:var(--gris)">Toma de 30 segundos a 2 minutos. No cierre esta pantalla.</p>
    <ul class="pasos" aria-live="polite">${pasos.map((p, i) => `<li data-p="${i}"><span class="b">${ic('check', 'style="width:14px;height:14px"')}</span>${esc(p)}</li>`).join('')}</ul><div id="armErr"></div></div></div></main>`;
  pasos.forEach((_, i) => setTimeout(() => { const li = $(`[data-p="${i}"]`); if (li) li.classList.add('ok'); }, 6000 * (i + 1)));
  (async () => {
    try {
      if (!miaServidor()) throw new Error('sinservidor');
      const ins = docInsumos(niv);
      let programa = '';
      if (tool === 'pa') { await plProgramaCargar();
        if (gr.length) programa = await miaPrograma(gr, false);
        else if (PL_PDA && PL_PDA.campos) programa = Object.entries(PL_PDA.campos).map(([campo, fs]) => ['3', '4', '5'].map(f => (fs[f] || []).map(x => `${campo} | ${x.c} | Fase ${f}`).join('\n')).join('\n')).join('\n');
        programa = programa.slice(0, 119000); }
      const nota = [ins.map(x => x.t + ': ' + x.txt).join('\n').slice(0, 1500), E.dChips.size ? T.chipsT + ' ' + [...E.dChips].join('; ') + '.' : '', E.dNota.trim() ? 'Lo que dice el docente: ' + E.dNota.trim() : ''].filter(Boolean).join('\n').slice(0, 1990);
      const grupoTxt = gr.length ? gr.map(plGr).join(' y ') + (gr.length === 1 && y.grupo && gr[0] === y.grado ? ' ' + y.grupo : '') : '';
      const tema = `DOCUMENTO A ELABORAR: ${T.nombre} de ${niv === 'grupo' ? 'un grupo (' + grupoTxt + ')' : 'la escuela completa'}, ciclo escolar ${docCiclo()}. No es una planeación didáctica: sigue solo el formato dado.`;
      const j = await miaPost({ modo: 'nueva', formato: DOC_FMT[tool](niv === 'grupo', niv === 'escuela'), nota, programa, datos: { docente: y.nombre, escuela: [y.escuela, y.cct, [y.loc, y.mun].filter(Boolean).join(', ')].filter(Boolean).join(' · '), grados: gr.map(plGr), grupo: grupoTxt, tema, duracion: 'Ciclo escolar ' + docCiclo() } });
      const D = j.documento || {}; if (!(D.secciones || []).length) throw new Error('La IA no devolvió el documento. Intente de nuevo.');
      D.titulo = T.nombre; D.encabezado = docEncabezado(tool, niv, grupoTxt, y);
      D.firmas = tool === 'pm' ? [y.director || 'Director(a) de la escuela', 'Supervisión Escolar'] : niv === 'grupo' ? [plNombre() + ' · Docente', (y.director ? 'Vo. Bo. ' + y.director : 'Vo. Bo. Director(a)')] : [y.director || 'Director(a) de la escuela', 'Colectivo docente'];
      const res = { id: 'd' + Date.now().toString(36), tool, nivel: niv, grupo: grupoTxt, titulo: T.nombre + (niv === 'grupo' ? ' · ' + grupoTxt : ' · ' + (y.escuela || 'Escuela')), documento: D, fecha: new Date().toISOString(), resumen: j.resumen || '', observaciones: j.observaciones || [] };
      docGuardar(res); E.dRes = res; E.vista = 'plan'; pintar(); scrollTo(0, 0); toast('<b>Listo.</b> Revíselo y corrija lo que haga falta.');
    } catch (e) {
      const el = $('#armErr'); if (!el) return; $$('.pasos li').forEach(li => li.classList.remove('ok'));
      el.innerHTML = `<div style="margin-top:18px;padding:14px 16px;border-radius:14px;background:var(--rojo-s,#F7E1DD);color:var(--rojo,#A3322A)"><b>No se pudo armar el documento.</b><br>${esc(miaError(e))}</div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:14px"><button class="btn sec" id="armVol">Regresar</button><button class="btn maiz" id="armOtra">${ic('chispa')}Intentar de nuevo</button></div>`;
      $('#armVol').onclick = () => { E.vista = 'inicio'; pintar(); scrollTo(0, 0); }; $('#armOtra').onclick = () => vDocArmando();
    }
  })();
}
function docEncabezado(tool, niv, grupoTxt, y) {
  const e = [{ etiqueta: 'Escuela', valor: y.escuela || '[completar]' }, { etiqueta: 'C.C.T.', valor: y.cct || '[completar]' }];
  if (tool !== 'pm') e.push({ etiqueta: niv === 'grupo' ? 'Grado y grupo' : 'Nivel', valor: niv === 'grupo' ? grupoTxt : 'Primaria' });
  e.push({ etiqueta: 'Ciclo escolar', valor: docCiclo() });
  e.push(niv === 'grupo' && tool !== 'pm' ? { etiqueta: 'Docente', valor: plNombre() } : { etiqueta: 'Director(a)', valor: y.director || '[completar]' });
  if (y.loc || y.mun) e.push({ etiqueta: 'Localidad', valor: [y.loc, y.mun].filter(Boolean).join(', ') });
  return e;
}
function docGuardar(r) { const H = incLS.get(DOCH, []).filter(x => x.id !== r.id); H.unshift(r); while (H.length > 15) H.pop(); if (!incLS.set(DOCH, H)) { H.splice(5); incLS.set(DOCH, H); } }

/* ---------- el documento ---------- */
function vDocVer() {
  miaEstilos(); const R = E.dRes; if (!R) { E.vista = 'inicio'; return pintar(); }
  const T = DOCS[R.tool], D = R.documento, F = DOC_FMT[R.tool](R.nivel === 'grupo', R.nivel === 'escuela'), horiz = F.orientacion === 'horizontal';
  const enc = `<div class="enc">${plLogo('isep')}<div style="text-align:center">INSTITUTO DE SERVICIOS EDUCATIVOS Y PEDAGÓGICOS DE BAJA CALIFORNIA<br>${esc(plEscLinea())}</div>${plLogo('esc')}</div>`;
  const hoja = R.html ? `<div class="hoja mia-hoja${horiz ? ' horiz' : ''}" id="miaHoja" contenteditable="true" spellcheck="true">${R.html}</div>` : miaDocHTML(D, F).replace(/(<div class="hoja[^>]*>)/, '$1' + enc);
  const sug = (R.observaciones || []).filter(o => o.tipo !== 'fortaleza');
  $('#app').innerHTML = topBar('Tlamatini · Pedagógico', T.nombre, `<button class="btn sec chico" id="dOtra">Nuevo</button>`) + `<main class="wrap">
   <section class="portada"><div class="sup"><span class="pill">${esc(T.nombre)}</span><span class="pill">${R.nivel === 'grupo' ? 'Grupo ' + esc(R.grupo) : 'Escuela'}</span><span class="pill">Ciclo ${docCiclo()}</span></div>
    <h1>${esc(R.titulo)}</h1>${R.resumen ? `<p class="fechas" style="max-width:70ch;margin-top:8px">${esc(R.resumen)}</p>` : ''}</section>
   <div style="margin-top:22px">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><button class="btn pri" data-doc="word">${ic('descarga')}Word (editable)</button><button class="btn sec" data-doc="pdf">${ic('descarga')}PDF</button><button class="btn sec" data-doc="imp">${ic('imp')}Imprimir</button>
     ${R.tool === 'dx' ? `<a class="btn sec" style="text-decoration:none;color:inherit" href="planeacion.html#analitico" id="dSig">Seguir con el programa analítico →</a>` : R.tool === 'pa' ? `<a class="btn sec" style="text-decoration:none;color:inherit" href="planeacion.html">Planear con esto →</a>` : ''}</div>
    <div class="mia-nota">${ic('lapiz', 'style="width:15px;height:15px;vertical-align:-2px"')} Corrija el texto aquí mismo: toque donde quiera y escriba. Se guarda en este dispositivo.${/\[completar/i.test(JSON.stringify(D)) ? ' Busque los <b>[completar: …]</b>: son datos que solo usted conoce.' : ''}</div>
    ${sug.length ? `<details class="card" style="margin-bottom:14px"><summary style="cursor:pointer"><b>Para revisar (${sug.length})</b></summary><ul style="margin:8px 0 0 18px">${sug.map(o => `<li>${o.seccion ? '<b>' + esc(o.seccion) + ':</b> ' : ''}${esc(o.texto)}</li>`).join('')}</ul></details>` : ''}
    ${hoja}</div></main>`;
  $('#atras').onclick = () => { E.vista = 'inicio'; pintar(); scrollTo(0, 0); };
  $('#dOtra').onclick = () => { E.vista = 'inicio'; pintar(); scrollTo(0, 0); };
  const sig = $('#dSig'); if (sig) sig.onclick = e => { e.preventDefault(); E.modo = 'pa'; E.dNivel = R.nivel; E.vista = 'inicio'; history.replaceState(null, '', '#analitico'); pintar(); scrollTo(0, 0); };
  const cap = () => { const h = $('#miaHoja'); if (h) { R.html = h.innerHTML; docGuardar(R); } };
  let tm; $('#miaHoja').oninput = () => { clearTimeout(tm); tm = setTimeout(cap, 700); };
  miaPagina(horiz); docBotones();
  $$('[data-doc]').forEach(b => b.addEventListener('click', cap, true));
  $$('[data-doc="word"]').forEach(b => b.onclick = () => miaWordDescargar(R.titulo, horiz));
}

/* ---------- rutas: planeacion.html#lectura, #pmc, #analitico ---------- */
const _pintarDoc = pintar;
pintar = function () {
  const pb = document.querySelector('.proto');
  if (pb) pb.innerHTML = DOCS[E.modo] ? `<b>${esc(DOCS[E.modo].nombre)} · fase de pilotaje</b>: la IA redacta el borrador con los datos de su escuela; revíselo siempre antes de entregarlo.` : '<b>Planeación didáctica · fase de pilotaje</b>: la IA arma el borrador con sus datos, el programa sintético oficial y el calendario de Baja California; revíselo siempre antes de usarlo.';
  if (DOCS[E.modo]) { document.title = DOCS[E.modo].nombre + ' · Tlamatini'; ({ inicio: vDocInicio, armando: vDocArmando, plan: vDocVer })[E.vista](); return; }
  document.title = 'Planeación didáctica · Tlamatini'; _pintarDoc();
};
{ const h = location.hash; if (/lectura/.test(h)) E.modo = 'dx'; else if (/pmc/.test(h)) E.modo = 'pm'; else if (/analitico/.test(h)) E.modo = 'pa'; }
/* La planeación usa primero la lectura de la realidad hecha aquí */
const _plLectura = plLectura;
plLectura = function () {
  const H = incLS.get(DOCH, []), dx = H.find(x => x.tool === 'dx' && x.nivel === 'grupo') || H.find(x => x.tool === 'dx');
  if (dx) { const t = docTexto(dx.documento, 1300); if (t.length > 60) return { fuente: 'Tlamatini', txt: t, quien: 'su lectura de la realidad hecha en Tlamatini' }; }
  return _plLectura();
};
