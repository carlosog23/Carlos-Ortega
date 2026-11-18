/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · MODO SUPERVISIÓN (parte 2, se carga después de la app).
   La Supervisión carga la hoja de registro que mandó el maestro (archivo de la carpeta «Ulama · registros»):
   Ulama lee sus listas, arma escuelas y grupos, acomoda a los alumnos con necesidad especial y lo deja en la
   revisión del registro guiado para corregir lo que falte. Al terminar se descarga el respaldo para instalarlo. */
"use strict";
(function () {
  const CLAVE = PREP.clave, LISTA = "ulama-prep-lista";
  const lista = () => { try { return JSON.parse(PREP.real.get(LISTA)) || []; } catch (e) { return []; } };
  const guardaLista = L => PREP.real.set(LISTA, JSON.stringify(L));
  const marcar = (clave, cambios) => { const L = lista(), x = L.find(y => y.clave === clave); if (x) { Object.assign(x, cambios); guardaLista(L); } };
  const esSup = () => typeof YO !== "undefined" && YO && YO.sup;
  const aFile = a => { const [cab, b64] = a.data.split(","), bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new File([u], a.nombre || "archivo", { type: (cab.match(/data:([^;]+)/) || [])[1] || a.tipo }); };
  const sinAcento = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zñ ]/g, " ").replace(/\s+/g, " ").trim();
  const nomArchivo = n => (n || "maestro").toLowerCase().normalize("NFD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
  function bajar(nombre, txt) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "application/json" })); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); }

  /* ---------- panel: lista de maestros en preparación ---------- */
  VISTAS.prepPanel = () => { if (!esSup()) return `<main class="wrap"><section class="card mt"><h3>Solo para la Supervisión</h3><p class="small muted mb">Abra esta página en el dispositivo donde administra Ulama (con su enlace de administración).</p><a class="btn p" href="index.html#admin">Ir a Ulama</a></section></main>`;
    const L = lista().sort((a, b) => String(b.fecha).localeCompare(a.fecha));
    return `<main class="wrap"><section class="portada"><div class="marca"><img src="img/ulama-icono.svg" alt=""><div class="eb">Ulama · Modo Supervisión</div></div><h1>Preparar maestros</h1>
     <p>Cargue la hoja de registro que le mandó el maestro (el archivo de su carpeta «Ulama · registros» en Drive). Ulama lee sus listas y deja todo en la revisión para que usted corrija lo que falte. Al terminar, descargue el respaldo y cárguelo en el dispositivo del maestro.</p>
     <div class="fila"><button class="btn m" id="pCargar">${ic("subir", 18)} Cargar hoja de un maestro</button><input type="file" id="pHoja" accept=".json,application/json" hidden></div></section>
     <h2 class="sec-t">Maestros<small>${L.length ? L.length + " en este dispositivo" : ""}</small></h2>
     <div class="lista">${L.map(x => `<div class="it" style="flex-wrap:wrap"><span class="av">${x.estado === "listo" ? ic("check", 18) : "…"}</span><span class="tx" style="min-width:180px"><b>${esc(x.nombre)}</b><small>${x.estado === "listo" ? "Plataforma lista" : "En revisión"} · ${new Date(x.fecha).toLocaleDateString("es-MX", { dateStyle: "medium" })}${x.resumen ? " · " + esc(x.resumen) : ""}</small></span>
       <a class="btn s p" href="preparar.html?m=${encodeURIComponent(x.clave)}">${x.estado === "listo" ? "Abrir" : "Revisar"}</a>${x.estado === "listo" ? `<button class="btn s" data-pr="${x.clave}">${ic("bajar", 16)} Respaldo</button>` : ""}<button class="btn s r" data-pq="${x.clave}" aria-label="Quitar">${ic("basura", 16)}</button></div>`).join("") || `<div class="vacio">Aún no ha cargado ninguna hoja.</div>`}</div>
     <p class="small muted mt">Los maestros que prepara aquí se guardan aparte en este dispositivo: no se mezclan entre ellos ni con su propio Ulama.</p></main>`; };
  ENLAZAR.prepPanel = () => { if (!$("#pCargar")) return;
    $("#pCargar").onclick = () => $("#pHoja").click();
    $("#pHoja").onchange = async ev => { const f = ev.target.files[0]; ev.target.value = ""; if (!f) return; let h;
      try { h = JSON.parse(await f.text()); } catch (e) { return toast("Ese archivo no se pudo abrir."); }
      if (!h || h.tipo !== "hojaRegistro") return toast(h && h.escuelas && h.v ? "Ese archivo ya es un respaldo de Ulama: cárguelo directo en el dispositivo del maestro." : "Ese archivo no es una hoja de registro de Ulama.", 5000);
      const nombre = [h.docente && h.docente.trato, h.docente && h.docente.nombre].filter(Boolean).join(" ") || "Maestro sin nombre";
      const L = lista(), ya = L.find(x => x.nombre === nombre);
      if (ya && !(await confirmar(`${nombre} ya está en la lista. ¿Reemplazar lo que tenía preparado con esta hoja?`, "Reemplazar"))) return;
      const clave = ya ? ya.clave : nomArchivo(nombre).slice(0, 30) + "-" + Date.now().toString(36);
      if (ya) PREP.borrarTodo(clave);
      try { PREP.real.set(PREP.llave(clave, "ulama-hoja-pendiente"), JSON.stringify(h)); } catch (e) { return toast("<b>No cupo en este dispositivo.</b> Quite maestros que ya instaló e intente de nuevo.", 5000); }
      const sinYa = L.filter(x => x.clave !== clave); sinYa.push({ clave, nombre, fecha: new Date().toISOString(), estado: "revision", resumen: `${(h.escuelas || []).length} escuelas · ${(h.grupos || []).length} grupos` }); guardaLista(sinYa);
      location.href = "preparar.html?m=" + encodeURIComponent(clave); };
    $$("[data-pr]").forEach(b => b.onclick = () => { const x = lista().find(y => y.clave === b.dataset.pr), txt = PREP.real.get(PREP.llave(x.clave, "ulama-datos"));
      if (!txt) return toast("No encontré los datos de ese maestro."); bajar(`ulama-respaldo-${nomArchivo(x.nombre)}.json`, txt); toast("Respaldo descargado. En el dispositivo del maestro: «Tengo un respaldo»."); });
    $$("[data-pq]").forEach(b => b.onclick = async () => { const x = lista().find(y => y.clave === b.dataset.pq);
      if (!(await confirmar(`Se borra de este dispositivo lo preparado para ${x.nombre}. Si ya le instaló Ulama con su respaldo, no le afecta.`, "Quitar"))) return;
      PREP.borrarTodo(x.clave); guardaLista(lista().filter(y => y.clave !== x.clave)); pintar(); }); };

  /* ---------- convertir la hoja en el registro guiado ---------- */
  function tipoNee(t) { t = sinAcento(t);
    if (/tea|autis|tdah|deficit de atencion|hiperactiv|neurodesarrollo|asperger/.test(t)) return NEE[2];
    if (/discapac|sordo|ciego|baja vision|hipoacus|silla de ruedas|motriz/.test(t)) return NEE[1];
    if (/asma|cardi|corazon|epilep|convuls|diabet|salud|medic|alerg|fractur|operad|lesion|obesid/.test(t)) return NEE[5];
    if (/dislex|discalcul|aprendizaje/.test(t)) return NEE[3];
    if (/sobresal|talento/.test(t)) return NEE[4];
    if (/conduct/.test(t)) return NEE[7];
    if (/familia|emocion|duelo|ansiedad|depres/.test(t)) return NEE[6];
    return NEE[8]; }
  function buscarAlumno(grupos, nombre) { const ps = sinAcento(nombre).split(" ").filter(p => p.length > 1); if (!ps.length) return null;
    let mejor = null, pts = 0;
    grupos.forEach(g => g.alumnos.forEach(a => { const n = " " + sinAcento(a.nombre) + " ", k = ps.filter(p => n.includes(" " + p + " ")).length; if (k > pts) { pts = k; mejor = a; } }));
    return pts >= Math.min(2, ps.length) ? mejor : null; }

  async function importarHoja(h) { const r = REG(), A = h.archivos || {}, notas = [];
    const img = async (id, max, q) => { const a = id && A[id]; if (!a) return ""; try { return await aImagen(aFile(a), max, q); } catch (e) { notas.push(`No se pudo abrir el archivo «${a.nombre}».`); return ""; } };
    progreso("Preparando la hoja…");
    const d = h.docente || {};
    r.doc = { trato: d.trato || "", nombre: d.nombre || "", correo: (d.correo || "").toLowerCase(), gmail: ((h.cfg || {}).gmail || "").toLowerCase(), tel: d.tel || "" };
    r.escs = [];
    for (const e of (h.escuelas || [])) { progAct(`Escuela: ${e.nombre || ""}`);
      r.escs.push(Object.assign(nuevaEscR(), { id: e.id || uid(), nombre: e.nombre || "", cct: String(e.cct || "").toUpperCase(), turno: ["Matutino", "Vespertino", "Tiempo completo"].includes(e.turno) ? e.turno : "", zona: e.zona || "", localidad: e.localidad || "",
        dias: (e.dias || []).map(Number), dirTrato: e.dirTrato || "Mtro.", director: e.director || "", correo: (e.correo || "").toLowerCase(), supEF: e.supEF || "", supCorreo: (e.supCorreo || "").toLowerCase(), nGrupos: e.nGrupos || "",
        logo: await img(e.logo, 360, .85), horario: await img(e.horario, 1200, .62), horarioNombre: e.horario && A[e.horario] ? A[e.horario].nombre : "" }));
      if (e.turno && !["Matutino", "Vespertino", "Tiempo completo"].includes(e.turno)) notas.push(`${e.nombre}: el maestro puso turno «${e.turno}»; elija uno en Escuelas.`); }
    r.grupos = []; const gs = h.grupos || [];
    for (const [i, g] of gs.entries()) { const e = r.escs.find(x => x.id === g.escId), a = g.lista && A[g.lista]; let x = { alumnos: [] };
      progAct(`Grupo ${i + 1} de ${gs.length}${a ? ": leyendo la lista…" : ""}`, (i / Math.max(1, gs.length)) * 100);
      if (a) { try { x = await leerArchivo(aFile(a)); } catch (er) { x = { alumnos: [] }; } if (!x.alumnos.length) notas.push(`La lista «${a.nombre}» (${g.grado || "?"}° ${g.grupo || ""}) no se pudo leer: escriba los nombres a mano.`); }
      r.grupos.push({ id: g.id || uid(), escId: e ? e.id : "", grado: +g.grado || +x.grado || "", grupo: String(g.grupo || x.grupo || "").toUpperCase(), docente: g.docente || (x.docente ? titulo(x.docente) : ""), correo: (g.correo || "").toLowerCase(),
        dias: (g.dias && g.dias.length ? g.dias : e ? e.dias : []).map(Number), hora: g.hora || "", alumnos: x.alumnos.map(al => ({ id: uid(), nombre: al.nombre, curp: al.curp || "", alta: CICLO.inicio })), fuente: a ? a.nombre : "Hoja de registro (sin lista)" }); }
    r.escs.forEach(e => { if (!(+e.nGrupos > 0)) { const n = r.grupos.filter(g => g.escId === e.id).length; if (n) e.nGrupos = String(n); } });
    guardarReg();
    const juntas = (h.listasJuntas || []).map(id => A[id]).filter(Boolean).map(aFile);
    if (juntas.length) await leerListasR(juntas);
    /* grupos que quedaron sin alumnos y tienen gemelo con alumnos (de las listas juntas): se fusionan */
    r.grupos = r.grupos.filter(g => { if (g.alumnos.length) return true; const t = r.grupos.find(o => o !== g && o.alumnos.length && o.escId === g.escId && o.grado === g.grado && o.grupo === g.grupo);
      if (t) { t.docente = t.docente || g.docente; t.correo = t.correo || g.correo; t.hora = t.hora || g.hora; if (g.dias.length) t.dias = g.dias; return false; } return true; });
    /* alumnos con necesidad especial o restricción */
    (h.nee || []).filter(n => (n.alumno || "").trim()).forEach(n => { const g = r.grupos.find(x => x.id === n.grupoId), al = buscarAlumno(g ? [g] : r.grupos, n.alumno) || buscarAlumno(r.grupos, n.alumno);
      const desc = [n.necesidad, n.restriccion && "Restricción en E. F.: " + n.restriccion, n.justificante && "Justificante médico: " + n.justificante].filter(Boolean).join(". ");
      if (al) al.nee = { tipo: tipoNee(n.necesidad + " " + n.restriccion), desc, apoyo: n.ajuste || "" };
      else notas.push(`No encontré a «${n.alumno}» en las listas (${desc}${n.ajuste ? "; ajuste: " + n.ajuste : ""}). Márquelo a mano en su grupo después de terminar.`); });
    if ((h.obs || "").trim()) notas.unshift(`Comentario del maestro: ${h.obs.trim()}`);
    r.prepNotas = notas; r.paso = 6; r.ultimo = 6; S.verFalta = true; guardarReg(); cerrarDlg(); }

  /* ---------- avisos del modo Supervisión dentro del registro ---------- */
  const vReg = VISTAS.registro;
  VISTAS.registro = () => { let h = vReg(); const r = REG();
    if (r.paso >= 1 && r.prepNotas && r.prepNotas.length) h = h.replace('<main class="wrap">', `<main class="wrap"><section class="card mt" style="border-color:#F0DDB0;background:var(--maiz-s)"><h3>Notas de la hoja</h3><ul class="small" style="margin:6px 0 0;padding-left:20px">${r.prepNotas.map(n => `<li>${esc(n)}</li>`).join("")}</ul></section>`);
    return h; };
  const vListo = VISTAS.registroListo, eListo = ENLAZAR.registroListo;
  VISTAS.registroListo = () => vListo().replace("</main>", `<section class="card mt" style="border-color:var(--jade)"><h3>Modo Supervisión</h3><p class="small muted mb">Descargue el respaldo y cárguelo en el dispositivo del maestro con «Tengo un respaldo».</p>
    <div class="fila"><button class="btn p" id="pResp">${ic("bajar", 18)} Descargar respaldo</button><a class="btn" href="preparar.html">Volver a la lista de maestros</a></div></section></main>`);
  ENLAZAR.registroListo = () => { eListo(); $("#rgIni").textContent = "Revisar su plataforma";
    $("#pResp").onclick = () => { bajar(`ulama-respaldo-${nomArchivo(D.docente.nombre)}.json`, JSON.stringify(D)); toast("Respaldo descargado."); }; };

  /* ---------- enrutar ---------- */
  let importando = false;
  const p0 = pintar;
  pintar = function () {
    if (!CLAVE) { D.cfg.bienvenida = true; S = { v: "prepPanel" }; return p0(); }
    if (typeof ACCESO_OK !== "undefined" && ACCESO_OK && !importando) { const txt = PREP.real.get(PREP.llave(CLAVE, "ulama-hoja-pendiente"));
      if (txt) { importando = true; S = { v: "registro" }; p0();
        importarHoja(JSON.parse(txt)).then(() => { PREP.real.del(PREP.llave(CLAVE, "ulama-hoja-pendiente")); importando = false; pintar(); window.scrollTo(0, 0); toast("Hoja cargada. Revise lo marcado en rojo y toque «Terminar registro».", 5000); })
          .catch(e => { importando = false; cerrarDlg(); toast(`<b>No se pudo cargar la hoja.</b> ${esc(e.message || e)}`, 6000); });
        return; } }
    if (D.cfg.bienvenida && D.docente && D.docente.nombre) marcar(CLAVE, { estado: "listo" });
    p0();
    const x = lista().find(y => y.clave === CLAVE), pr = $(".proto");
    if (pr) pr.innerHTML = `<b>Modo Supervisión</b> · Preparando a ${esc(x ? x.nombre : "un maestro")} · <a href="preparar.html" style="color:#E3A63B">Lista de maestros</a>`;
  };
})();
