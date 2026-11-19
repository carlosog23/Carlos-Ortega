/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Bitácora de incidentes. Un botón «!» siempre a la vista, en cualquier parte de la app:
   qué pasó, con qué alumno(s), a qué hora y si hubo algún acuerdo. Se guarda en el dispositivo
   (junto con lo demás de Ulama, y entra en el respaldo) y el maestro la consulta cuando quiera. */
"use strict";
const INC_TIPOS = ["Lesión o accidente", "Pelea o agresión", "Conducta", "Malestar o salud", "Pérdida o daño", "Otro"];
const incidentes = () => (D.incidentes = D.incidentes || []);
const incOrden = (a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora);

/* ---------- botón flotante ---------- */
(function () {
  const st = document.createElement("style");
  st.textContent = `.inc-fab{position:fixed;left:14px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:60;width:58px;height:58px;border-radius:50%;border:3px solid #fff;
    background:var(--rojo);color:#fff;font:800 32px/1 var(--disp);display:grid;place-items:center;cursor:pointer;box-shadow:0 12px 26px -10px rgba(163,50,42,.85),0 2px 6px rgba(0,0,0,.18)}
  .inc-fab:active{transform:scale(.94)}
  body:has(.fijo) .inc-fab{bottom:calc(92px + env(safe-area-inset-bottom))}
  .inc-fab[hidden]{display:none}
  .inc-al{max-height:230px;overflow:auto;padding:2px}
  .inc-it{background:var(--hoja);border:1px solid var(--hilo);border-left:5px solid var(--rojo);border-radius:18px;padding:14px 16px;margin-bottom:10px}
  .inc-it .cab{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px}
  .inc-it p{margin:4px 0}
  .inc-it .acu{background:var(--jade-s);border-radius:12px;padding:8px 12px;margin-top:8px}
  .doc .inc-t{width:100%;border-collapse:collapse;font-size:10.5pt}.doc .inc-t th,.doc .inc-t td{border:1px solid #999;padding:5px 6px;vertical-align:top;text-align:left}.doc .inc-t th{background:#eee}
  @media print{.inc-fab{display:none!important}}`;
  document.head.appendChild(st);
  const b = document.createElement("button");
  b.className = "inc-fab"; b.id = "incFab"; b.type = "button"; b.textContent = "!";
  b.title = "Registrar un incidente"; b.setAttribute("aria-label", "Registrar un incidente en la bitácora");
  b.onclick = () => dlgIncidente();
  document.body.appendChild(b);
  const pintarOrig = pintar;
  pintar = function () { pintarOrig.apply(this, arguments); incFabVer(); };
  incFabVer();
})();
function incFabVer() {
  const b = document.getElementById("incFab"); if (!b) return;
  b.hidden = ["registro", "registroListo", "acceso", "admin", "bienvenida"].includes(S.v) || (typeof ACCESO_OK !== "undefined" && !ACCESO_OK);
}

/* grupo que corresponde según dónde está el maestro */
function incGrupoActual() {
  if (S.v === "clase" && S.c && S.c.grupoId) return S.c.grupoId;
  if (S.v === "grupo" && S.id) return S.id;
  if (D.cfg.incG && grDe(D.cfg.incG)) return D.cfg.incG;
  return (D.grupos[0] || {}).id || "";
}
const incNomGrupo = g => { const e = g && escDe(g.escId); return g ? `${grNom(g)}${e ? " · " + e.nombre : ""}` : "Sin grupo"; };

/* ---------- registrar / editar ---------- */
function dlgIncidente(id) {
  const ya = id ? incidentes().find(x => x.id === id) : null;
  const x = ya ? JSON.parse(JSON.stringify(ya)) : { id: uid(), fecha: hoy(), hora: hora(), grupoId: incGrupoActual(), alumnos: [], otro: "", tipo: "", que: "", acuerdos: "" };
  const gruposOrd = D.grupos.slice().sort((a, b) => String((escDe(a.escId) || {}).nombre).localeCompare(String((escDe(b.escId) || {}).nombre), "es") || (a.grado - b.grado) || String(a.grupo).localeCompare(b.grupo));
  const alumnosHTML = () => { const g = grDe(x.grupoId); const L = g ? activos(g) : [];
    return L.length ? `<div class="chips">${L.map(a => `<button type="button" class="chip" data-ia="${a.id}" aria-pressed="${x.alumnos.includes(a.id)}">${esc(a.nombre)}</button>`).join("")}</div>`
      : `<p class="small muted">Este grupo no tiene alumnos registrados. Escriba el nombre abajo.</p>`; };
  dlg(`<h3><span style="color:var(--rojo)">!</span> ${ya ? "Editar incidente" : "Registrar un incidente"}</h3>
    <div class="fila" style="gap:10px">
      <label class="campo" style="flex:1;min-width:140px"><span>Fecha</span><input type="date" id="iF" data-nofoco="1" value="${x.fecha}"></label>
      <label class="campo" style="flex:1;min-width:110px"><span>Hora</span><input type="time" id="iH" value="${x.hora}"></label></div>
    <label class="campo"><span>Grupo</span><select id="iG">${gruposOrd.map(g => `<option value="${g.id}" ${g.id === x.grupoId ? "selected" : ""}>${esc(incNomGrupo(g))}</option>`).join("")}<option value="" ${!x.grupoId ? "selected" : ""}>Otro / fuera de clase</option></select></label>
    <div class="campo"><span>¿Qué alumno? <small>(toque uno o varios)</small></span><div class="inc-al" id="iAl">${alumnosHTML()}</div></div>
    <label class="campo"><span>Otro alumno o persona <small>(escribir, si no está en la lista)</small></span><input id="iO" value="${esc(x.otro)}" placeholder="Nombre"></label>
    <div class="campo"><span>¿Qué pasó?</span><div class="chips" id="iT">${INC_TIPOS.map(t => `<button type="button" class="chip" data-it="${esc(t)}" aria-pressed="${x.tipo === t}">${esc(t)}</button>`).join("")}</div></div>
    <label class="campo"><span>Describa qué pasó</span><textarea id="iQ" data-nofoco="1" placeholder="Qué sucedió, cómo y quién estaba presente">${esc(x.que)}</textarea></label>
    <label class="campo"><span>¿Hubo algún acuerdo? <small>(opcional)</small></span><textarea id="iA" data-nofoco="1" style="min-height:80px" placeholder="Con el alumno, con el padre o madre, con la dirección…">${esc(x.acuerdos)}</textarea></label>
    <div class="fila fin">${ya ? `<button class="btn r" id="iDel" style="margin-right:auto">${ic("basura", 18)} Eliminar</button>` : `<button class="btn" id="iVer" style="margin-right:auto">Ver mi bitácora</button>`}
      <button class="btn" id="iNo">Cancelar</button><button class="btn p" id="iSi">${ic("check", 18)} Guardar</button></div>`, v => {
    const al = () => v.querySelectorAll("[data-ia]").forEach(c => c.onclick = () => { const k = c.dataset.ia, i = x.alumnos.indexOf(k); i < 0 ? x.alumnos.push(k) : x.alumnos.splice(i, 1); c.setAttribute("aria-pressed", i < 0); });
    al();
    v.querySelector("#iG").onchange = e => { x.grupoId = e.target.value; x.alumnos = []; v.querySelector("#iAl").innerHTML = alumnosHTML(); al(); };
    v.querySelectorAll("[data-it]").forEach(c => c.onclick = () => { x.tipo = x.tipo === c.dataset.it ? "" : c.dataset.it; v.querySelectorAll("[data-it]").forEach(o => o.setAttribute("aria-pressed", o.dataset.it === x.tipo)); });
    v.querySelector("#iNo").onclick = cerrarDlg;
    if (v.querySelector("#iVer")) v.querySelector("#iVer").onclick = () => { cerrarDlg(); if (S.v !== "bitacora") ir("bitacora", {}); };
    if (v.querySelector("#iDel")) v.querySelector("#iDel").onclick = async () => { if (!(await confirmar("Se eliminará este incidente de la bitácora.", "Sí, eliminar"))) return dlgIncidente(id);
      D.incidentes = incidentes().filter(z => z.id !== id); guardar(); pintar(); toast("Incidente eliminado."); };
    v.querySelector("#iSi").onclick = () => {
      x.fecha = v.querySelector("#iF").value || hoy(); x.hora = v.querySelector("#iH").value || hora();
      x.otro = v.querySelector("#iO").value.trim(); x.que = v.querySelector("#iQ").value.trim(); x.acuerdos = v.querySelector("#iA").value.trim();
      if (!x.alumnos.length && !x.otro) return toast("Elija al alumno o escriba su nombre.");
      if (!x.que) { v.querySelector("#iQ").focus(); return toast("Describa qué pasó."); }
      const g = grDe(x.grupoId); x.escId = g ? g.escId : ""; x.mod = new Date().toISOString(); if (!ya) x.creado = x.mod;
      if (x.grupoId) D.cfg.incG = x.grupoId;
      const L = incidentes(), i = L.findIndex(z => z.id === x.id); i < 0 ? L.push(x) : (L[i] = x);
      guardar(); cerrarDlg(); if (S.v === "bitacora") pintar(); else incFabVer();
      toast(`<b>Incidente guardado</b> en su bitácora.`);
    };
  });
}

/* ---------- consultar la bitácora ---------- */
const incAlumnos = x => { const g = grDe(x.grupoId), L = (x.alumnos || []).map(id => { const a = (g && (g.alumnos || []).find(z => z.id === id)) || alDe(id); return a ? a.nombre : "(alumno dado de baja)"; }); if (x.otro) L.push(x.otro); return L; };
function incFiltrados() {
  const F = S.f = Object.assign({ g: "", q: "" }, S.f || {}), q = String(F.q || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  return incidentes().filter(x => (!F.g || x.grupoId === F.g) && (!q || [incAlumnos(x).join(" "), x.que, x.acuerdos, x.tipo].join(" ").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().includes(q))).sort(incOrden);
}
VISTAS.bitacora = () => { const L = incFiltrados(), F = S.f, gs = [...new Set(incidentes().map(x => x.grupoId))].map(grDe).filter(Boolean);
  return barra("Bitácora", "Incidentes", `<button class="btn s" id="bIncP" ${L.length ? "" : "disabled"}>${ic("impr", 18)} Imprimir</button>`) + `<main class="wrap">
    <p class="muted small mt">Todo lo que registra con el botón <b style="color:var(--rojo)">!</b> queda aquí, del más reciente al más antiguo. Toque un incidente para corregirlo.</p>
    <div class="fila mt" style="gap:10px">
      <label class="campo" style="flex:1;min-width:180px;margin:0"><span>Grupo</span><select id="fIG"><option value="">Todos los grupos</option>${gs.map(g => `<option value="${g.id}" ${F.g === g.id ? "selected" : ""}>${esc(incNomGrupo(g))}</option>`).join("")}</select></label>
      <label class="campo" style="flex:1;min-width:180px;margin:0"><span>Buscar</span><input id="fIQ" type="search" value="${esc(F.q)}" placeholder="Alumno, palabra…"></label></div>
    <div class="mt">${L.map(x => { const g = grDe(x.grupoId);
      return `<div class="inc-it" role="button" tabindex="0" data-inc="${x.id}" style="cursor:pointer">
        <div class="cab"><b>${fCorta(x.fecha)} · ${esc(x.hora)}</b>${x.tipo ? `<span class="tag r">${esc(x.tipo)}</span>` : ""}<span class="tag g">${esc(g ? incNomGrupo(g) : "Fuera de clase")}</span></div>
        <p><b>${esc(incAlumnos(x).join(", "))}</b></p><p>${esc(x.que)}</p>
        ${x.acuerdos ? `<div class="acu small"><b>Acuerdo:</b> ${esc(x.acuerdos)}</div>` : ""}</div>`; }).join("")
      || `<div class="vacio">${incidentes().length ? "No hay incidentes con ese filtro." : "Todavía no hay incidentes registrados. Cuando pase algo, toque el botón <b style='color:var(--rojo)'>!</b>."}</div>`}</div>
    <p class="pie">${incidentes().length} incidente${incidentes().length === 1 ? "" : "s"} en la bitácora</p></main>`; };
ENLAZAR.bitacora = () => {
  $("#fIG").onchange = e => { S.f.g = e.target.value; pintar(); };
  $("#fIQ").onchange = e => { S.f.q = e.target.value; pintar(); $("#fIQ").focus(); };
  $$("[data-inc]").forEach(b => { b.onclick = () => dlgIncidente(b.dataset.inc); b.onkeydown = e => { if (e.key === "Enter") dlgIncidente(b.dataset.inc); }; });
  $("#bIncP").onclick = () => { const L = incFiltrados(), g = grDe(S.f.g), e = g ? escDe(g.escId) : escDe((grDe((L[0] || {}).grupoId) || {}).escId) || D.escuelas[0];
    imprimir(`<div class="doc">${encabezado(e, "Bitácora de incidentes · Educación Física" + (g ? " · " + esc(grNom(g)) : ""))}
      <p>Docente: <b>${esc(docNombre())}</b> · Impreso el ${fLarga(hoy())}</p>
      <table class="inc-t"><tr><th style="width:15%">Fecha y hora</th><th style="width:13%">Grupo</th><th style="width:18%">Alumno(s)</th><th>Qué pasó</th><th style="width:22%">Acuerdos</th></tr>
      ${L.slice().reverse().map(x => { const gg = grDe(x.grupoId); return `<tr><td>${fCorta(x.fecha)}<br>${esc(x.hora)}</td><td>${gg ? esc(grNom(gg)) : "—"}</td><td>${esc(incAlumnos(x).join(", "))}</td><td>${x.tipo ? `<b>${esc(x.tipo)}.</b> ` : ""}${esc(x.que)}</td><td>${esc(x.acuerdos || "—")}</td></tr>`; }).join("")}</table>
      <table style="width:100%;margin-top:60px;border:0"><tr><td style="width:50%;text-align:center;border:0">_______________________________<br>${esc(docNombre())}<br>Docente de Educación Física</td>
      <td style="text-align:center;border:0">_______________________________<br>${esc(e && typeof dirNombre === "function" ? dirNombre(e) : "")}<br>Dirección de la escuela</td></tr></table></div>`); };
};
