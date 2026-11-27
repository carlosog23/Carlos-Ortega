/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   «Mi libreta» · bitácora informal de notas rápidas y recordatorios.
   - Para anotar en el momento lo que no se quiere olvidar (un pendiente, un alumno, un aviso a padres, material…).
   - Es INFORMAL: no sustituye a la bitácora de incidentes ni a los formatos oficiales del PPIE.
   - Cada nota puede llevar un recordatorio: la app avisa (sonido, vibración y notificación si se permite)
     mientras esté abierta o en segundo plano, y se puede pasar al calendario del celular para que avise siempre.
   - Todo se queda en el dispositivo de quien escribe: nadie más lo ve (ni la Dirección ni la Supervisión).
   Se usa en Tlamatini Aula (primaria y secundaria, preescolar, educación especial), en Ulama y en Tequio.
   - En las apps de aula se guarda junto con los datos de la app (D.libreta), así entra en el respaldo.
   - Otra app puede pasar window.NOTAS_CFG = { leer, escribir, tipos, boton:false, quien } antes de cargar este archivo. */
"use strict";
(function () {
  const CFG = window.NOTAS_CFG || {};
  const enAula = typeof D !== "undefined" && D && typeof guardar === "function";
  const leerL = () => {
    try {
      if (CFG.leer) return CFG.leer() || [];
      if (enAula) return (D.libreta = Array.isArray(D.libreta) ? D.libreta : []);
      return JSON.parse(localStorage.getItem("libreta-notas") || "[]");
    } catch (e) { return []; }
  };
  const escribirL = L => {
    try {
      if (CFG.escribir) return CFG.escribir(L);
      if (enAula) { D.libreta = L; return guardar(); }
      localStorage.setItem("libreta-notas", JSON.stringify(L));
    } catch (e) {}
  };
  const TIPOS = CFG.tipos || [["pend", "📌", "Pendiente"], ["alum", "🧒", "Alumno"], ["padres", "👪", "Padres"], ["mat", "🧰", "Material"], ["idea", "💡", "Idea"]];
  const tipoDe = k => TIPOS.find(t => t[0] === k);

  /* ---------- utilidades ---------- */
  const h = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const p2 = n => String(n).padStart(2, "0");
  const local = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
  const ahora = () => local(new Date());
  const deLocal = s => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/); return m ? new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5]) : null; };
  const nid = () => "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  function cuando(s) {
    const d = deLocal(s); if (!d) return "";
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const dia = new Date(d); dia.setHours(0, 0, 0, 0);
    const dif = Math.round((dia - hoy) / 864e5), hr = `${d.getHours() % 12 || 12}:${p2(d.getMinutes())} ${d.getHours() < 12 ? "a. m." : "p. m."}`;
    if (dif === 0) return "hoy, " + hr; if (dif === 1) return "mañana, " + hr; if (dif === -1) return "ayer, " + hr;
    return `${d.getDate()} ${MES[d.getMonth()]}${d.getFullYear() !== hoy.getFullYear() ? " " + d.getFullYear() : ""}, ${hr}`;
  }
  const vencida = n => n.rec && !n.hecha && n.rec <= ahora();
  const pendientesAviso = () => leerL().filter(vencida);

  /* ---------- estilos ---------- */
  const st = document.createElement("style");
  st.textContent = `
.nt-fab{position:fixed;right:14px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:60;width:48px;height:48px;border-radius:50%;padding:0;cursor:pointer;
  border:1px solid rgba(0,0,0,.10);background:#FFF8E6;color:#9A6408;display:grid;place-items:center;box-shadow:0 6px 16px -8px rgba(0,0,0,.45),0 1px 3px rgba(0,0,0,.12);opacity:.94;transition:transform .15s,opacity .15s}
.nt-fab:hover,.nt-fab:focus-visible{opacity:1}.nt-fab:active{transform:scale(.92)}.nt-fab[hidden]{display:none}
body:has(.fijo) .nt-fab{bottom:calc(150px + env(safe-area-inset-bottom))}
.nt-n{position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;border-radius:9px;background:#C2410C;color:#fff;font:800 11px/18px system-ui,sans-serif;text-align:center;padding:0 4px;border:2px solid #fff}
.nt-velo{position:fixed;inset:0;z-index:9500;background:rgba(30,42,64,.45);display:flex;align-items:flex-end;justify-content:center}
@media (min-width:700px){.nt-velo{align-items:center;padding:24px}}
.nt-hoja{width:100%;max-width:580px;max-height:92dvh;display:flex;flex-direction:column;background:#FFFCF4;color:#1E2A40;border-radius:24px 24px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.25);font-family:inherit;overflow:hidden}
@media (min-width:700px){.nt-hoja{border-radius:24px;max-height:88dvh}}
.nt-cab{display:flex;align-items:center;gap:12px;padding:16px 18px 10px;border-bottom:1px solid #EFE4CC}
.nt-cab .ic{flex:none;width:42px;height:42px;border-radius:14px;background:#FBE9C2;color:#9A6408;display:grid;place-items:center}
.nt-cab b{display:block;font-size:18px;line-height:1.2}.nt-cab small{display:block;font-size:12.5px;color:#7A6E5C;line-height:1.3}
.nt-x{margin-left:auto;flex:none;width:40px;height:40px;border-radius:50%;border:0;background:transparent;font-size:24px;line-height:1;color:#5F574C;cursor:pointer}
.nt-x:hover{background:rgba(0,0,0,.06)}
.nt-cuerpo{overflow-y:auto;padding:14px 18px 22px;-webkit-overflow-scrolling:touch}
.nt-nueva{background:#fff;border:1.5px solid #EAD9B0;border-radius:18px;padding:10px 12px}
.nt-nueva textarea{width:100%;box-sizing:border-box;min-height:74px;border:0;outline:0;resize:vertical;font:inherit;font-size:16px;line-height:1.45;background:transparent;color:inherit;padding:2px}
.nt-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.nt-chip{display:inline-flex;align-items:center;gap:5px;min-height:34px;padding:4px 11px;border-radius:999px;border:1px solid #E3D6BC;background:#FFFBF1;font:inherit;font-size:13.5px;font-weight:600;color:#4A4438;cursor:pointer}
.nt-chip[aria-pressed=true]{background:#9A6408;border-color:#9A6408;color:#fff}
.nt-rec{margin-top:8px;padding-top:8px;border-top:1px dashed #EAD9B0}
.nt-rec .lb{font-size:12.5px;font-weight:700;color:#7A6E5C;margin-right:4px}
.nt-rec input{font:inherit;font-size:15px;padding:6px 8px;border:1px solid #E3D6BC;border-radius:10px;background:#fff;color:inherit;margin-top:8px;max-width:100%}
.nt-fila{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px}
.nt-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:42px;padding:6px 16px;border-radius:999px;border:1px solid #E3D6BC;background:#fff;font:inherit;font-size:14.5px;font-weight:700;color:#4A4438;cursor:pointer;text-decoration:none}
.nt-btn.pri{background:#9A6408;border-color:#9A6408;color:#fff;margin-left:auto}.nt-btn.pri:disabled{opacity:.45;cursor:default}
.nt-btn.peq{min-height:34px;padding:4px 12px;font-size:13px}
.nt-filtros{display:flex;gap:6px;flex-wrap:wrap;margin:16px 0 10px}
.nt-buscar{width:100%;box-sizing:border-box;font:inherit;font-size:15px;padding:9px 12px;border:1px solid #E3D6BC;border-radius:12px;background:#fff;color:inherit;margin-bottom:10px}
.nt-it{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid #EFE4CC;border-radius:16px;padding:10px 12px;margin-bottom:8px}
.nt-it.vence{border-color:#F3B58F;background:#FFF4EC}.nt-it.hecha{opacity:.62}.nt-it.hecha .tx{text-decoration:line-through}
.nt-ck{flex:none;width:28px;height:28px;margin-top:1px;border-radius:9px;border:2px solid #CDBB94;background:#fff;color:#fff;display:grid;place-items:center;cursor:pointer;padding:0;font-size:16px;font-weight:800}
.nt-it.hecha .nt-ck{background:#1E8E5A;border-color:#1E8E5A}
.nt-it .cu{flex:1;min-width:0}
.nt-it .tx{margin:0;font-size:15.5px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
.nt-meta{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin-top:5px;font-size:12px;color:#7A6E5C}
.nt-r{display:inline-flex;align-items:center;gap:4px;font-weight:700;color:#9A6408;background:#FBEFD3;border-radius:999px;padding:2px 8px}
.nt-it.vence .nt-r{color:#fff;background:#C2410C}
.nt-acc{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}
.nt-acc button,.nt-acc a{border:0;background:transparent;font:inherit;font-size:12.5px;font-weight:700;color:#5F574C;padding:4px 8px;border-radius:8px;cursor:pointer;text-decoration:none}
.nt-acc button:hover,.nt-acc a:hover{background:rgba(0,0,0,.05)}.nt-acc .si{background:#B91C1C;color:#fff}
.nt-vacio{text-align:center;color:#7A6E5C;font-size:14.5px;padding:22px 10px;line-height:1.5}
.nt-pie{font-size:12px;color:#7A6E5C;line-height:1.45;margin:14px 2px 0}
.nt-alerta{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top));transform:translateX(-50%);z-index:9600;width:min(520px,calc(100% - 24px));background:#1E2A40;color:#fff;border-radius:18px;padding:12px 14px;box-shadow:0 14px 34px rgba(0,0,0,.35);font-family:inherit}
.nt-alerta .t{display:flex;gap:10px;align-items:flex-start;font-size:15px;line-height:1.4}.nt-alerta .t b{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#FBD38D;margin-bottom:2px}
.nt-alerta .nt-fila{margin-top:10px}.nt-alerta .nt-btn{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2);color:#fff}.nt-alerta .nt-btn.pri{background:#FBD38D;border-color:#FBD38D;color:#1E2A40;margin-left:0}
@media print{.nt-fab,.nt-velo,.nt-alerta{display:none!important}}`;
  document.head.appendChild(st);

  const ICONO = `<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" fill="currentColor" fill-opacity=".14"/><path d="M9 4v16M12 9h3M12 13h3"/><path d="M21 7.5 16.5 12" stroke-width="2.4"/></svg>`;

  /* ---------- botón flotante (apps de aula) ---------- */
  const OCULTAR = ["registro", "registroListo", "acceso", "admin", "bienvenida", "bloqueo"];
  let fab = null;
  if (CFG.boton !== false) {
    fab = document.createElement("button");
    fab.type = "button"; fab.className = "nt-fab"; fab.id = "ntFab";
    fab.title = "Mi libreta: notas rápidas y recordatorios"; fab.setAttribute("aria-label", "Abrir mi libreta de notas rápidas");
    fab.onclick = () => abrir();
    document.body.appendChild(fab);
    if (typeof pintar === "function") { const o = pintar; pintar = function () { const r = o.apply(this, arguments); refrescar(); return r; }; }
  }
  function refrescar() {
    const n = pendientesAviso().length;
    if (fab) {
      fab.innerHTML = ICONO + (n ? `<span class="nt-n">${n}</span>` : "");
      let ocultar = false;
      try { ocultar = (typeof S !== "undefined" && S && OCULTAR.includes(S.v)) || (typeof ACCESO_OK !== "undefined" && !ACCESO_OK); } catch (e) {}
      fab.hidden = ocultar;
    }
    if (CFG.alCambiar) try { CFG.alCambiar(n); } catch (e) {}
  }

  /* ---------- la libreta ---------- */
  let V = null; // estado mientras está abierta
  function abrir() {
    cerrar();
    V = { filtro: "pend", q: "", ed: null, tipo: "", recModo: "", rec: "", borrar: null };
    const w = document.createElement("div");
    w.className = "nt-velo"; w.id = "ntVelo";
    w.innerHTML = `<div class="nt-hoja" role="dialog" aria-modal="true" aria-labelledby="ntTit">
      <div class="nt-cab"><span class="ic">${ICONO}</span><div><b id="ntTit">Mi libreta</b><small>Notas rápidas y recordatorios · solo para usted</small></div><button class="nt-x" id="ntX" aria-label="Cerrar">×</button></div>
      <div class="nt-cuerpo" id="ntCuerpo"></div></div>`;
    document.body.appendChild(w);
    w.addEventListener("click", e => { if (e.target === w) cerrar(); });
    w.querySelector("#ntX").onclick = cerrar;
    document.addEventListener("keydown", teclaEsc);
    if (fab) fab.hidden = true;
    dibujar(true);
  }
  function cerrar() { const w = document.getElementById("ntVelo"); if (w) w.remove(); V = null; document.removeEventListener("keydown", teclaEsc); refrescar(); }
  const teclaEsc = e => { if (e.key === "Escape") cerrar(); };

  function recOpciones() {
    const d1 = new Date(Date.now() + 3600e3), d2 = new Date(Date.now() + 864e5);
    return [["", "Sin recordatorio"], ["1h", "En 1 hora", local(d1)], ["man", "Mañana a esta hora", local(d2)], ["otro", "Elegir día y hora…"]];
  }
  function dibujar(foco) {
    const c = document.getElementById("ntCuerpo"); if (!c || !V) return;
    const L = leerL(), ed = V.ed ? L.find(n => n.id === V.ed) : null;
    const txtPrevio = (c.querySelector("#ntTx") || {}).value;
    const q = V.q.trim().toLowerCase();
    let lista = L.filter(n => V.filtro === "todas" ? true : V.filtro === "hechas" ? !!n.hecha : V.filtro === "rec" ? n.rec && !n.hecha : !n.hecha);
    if (q) lista = lista.filter(n => (n.t + " " + ((tipoDe(n.tipo) || [])[2] || "")).toLowerCase().includes(q));
    lista.sort((a, b) => (vencida(b) - vencida(a)) || (V.filtro === "rec" ? String(a.rec).localeCompare(b.rec) : String(b.cre).localeCompare(a.cre)));
    const cuenta = { pend: L.filter(n => !n.hecha).length, rec: L.filter(n => n.rec && !n.hecha).length, hechas: L.filter(n => n.hecha).length, todas: L.length };
    const ops = recOpciones();
    c.innerHTML = `
      <div class="nt-nueva">
        <textarea id="ntTx" maxlength="2000" placeholder="${h(CFG.ejemplo || "¿Qué quiere anotar? Ej.: Pedir a la mamá de Luis el justificante · Llevar cartulinas el lunes")}" aria-label="Escriba su nota">${h(txtPrevio != null ? txtPrevio : ed ? ed.t : "")}</textarea>
        <div class="nt-chips" role="group" aria-label="Tipo de nota (opcional)">${TIPOS.map(t => `<button type="button" class="nt-chip" data-nt-tipo="${t[0]}" aria-pressed="${V.tipo === t[0]}">${t[1]} ${h(t[2])}</button>`).join("")}</div>
        <div class="nt-rec"><span class="lb">⏰ Recordarme:</span>
          <div class="nt-chips" role="group" aria-label="Recordatorio">${ops.map(o => `<button type="button" class="nt-chip" data-nt-rec="${o[0]}" aria-pressed="${V.recModo === o[0]}">${h(o[1])}</button>`).join("")}</div>
          ${V.recModo === "otro" ? `<input type="datetime-local" id="ntFecha" value="${h(V.rec || local(new Date(Date.now() + 3600e3)))}" min="${ahora()}">` : ""}
          ${V.recModo && V.recModo !== "otro" ? `<div class="nt-meta" style="margin-top:6px">Le avisará ${h(cuando(ops.find(o => o[0] === V.recModo)[2]))}</div>` : ""}
        </div>
        <div class="nt-fila">${ed ? `<button type="button" class="nt-btn peq" id="ntCan">Cancelar</button>` : ""}<button type="button" class="nt-btn pri" id="ntOk">${ed ? "Guardar cambios" : "Anotar"}</button></div>
      </div>
      <div class="nt-filtros" role="group" aria-label="Ver">${[["pend", "Pendientes"], ["rec", "Con recordatorio"], ["hechas", "Hechas"], ["todas", "Todas"]].map(f => `<button type="button" class="nt-chip" data-nt-f="${f[0]}" aria-pressed="${V.filtro === f[0]}">${f[1]}${cuenta[f[0]] ? " · " + cuenta[f[0]] : ""}</button>`).join("")}</div>
      ${L.length > 6 ? `<input type="search" class="nt-buscar" id="ntQ" placeholder="Buscar en mis notas" value="${h(V.q)}" aria-label="Buscar en mis notas">` : ""}
      <div id="ntLista">${lista.length ? lista.map(item).join("") : `<div class="nt-vacio">${q ? "No hay notas con esa palabra." : V.filtro === "hechas" ? "Aún no ha marcado notas como hechas." : V.filtro === "rec" ? "No tiene recordatorios pendientes." : L.length ? "¡Todo al día! No tiene pendientes." : "Su libreta está vacía.<br>Anote aquí lo que no quiere que se le olvide."}</div>`}</div>
      ${V.filtro === "hechas" && cuenta.hechas ? `<div class="nt-fila"><button type="button" class="nt-btn peq" id="ntLimpiar">${V.borrar === "*" ? "¿Seguro? Toque otra vez para borrar las hechas" : "Borrar las notas hechas"}</button></div>` : ""}
      <p class="nt-pie">Esta libreta es <b>informal</b>: es para sus apuntes del día. ${CFG.privado || "Se queda en su dispositivo (y en sus respaldos): nadie más la ve, ni la Dirección ni la Supervisión."} Los recordatorios suenan mientras la app esté abierta; para que le avisen aunque la cierre, use «Calendario» en la nota. Lo oficial (incidentes, protocolos, formatos) se registra en su apartado.</p>`;
    enlazar();
    const tx = c.querySelector("#ntTx");
    const okB = c.querySelector("#ntOk"); const val = () => { okB.disabled = !tx.value.trim(); };
    tx.addEventListener("input", val); val();
    tx.addEventListener("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); guardarNota(); } });
    if (foco && window.innerWidth > 700) tx.focus();
  }
  function item(n) {
    const tp = tipoDe(n.tipo), vence = vencida(n);
    return `<div class="nt-it${n.hecha ? " hecha" : ""}${vence ? " vence" : ""}">
      <button type="button" class="nt-ck" data-nt-ck="${n.id}" aria-label="${n.hecha ? "Marcar como pendiente" : "Marcar como hecha"}" title="${n.hecha ? "Volver a pendiente" : "Ya lo hice"}">${n.hecha ? "✓" : ""}</button>
      <div class="cu"><p class="tx">${h(n.t)}</p>
        <div class="nt-meta">${tp ? `<span>${tp[1]} ${h(tp[2])}</span>` : ""}<span>Anotada ${h(cuando(n.cre))}</span>${n.rec && !n.hecha ? `<span class="nt-r">⏰ ${vence ? "Ya es hora · " : ""}${h(cuando(n.rec))}</span>` : ""}${n.hecha ? `<span>Hecha ${h(cuando(n.hecha))}</span>` : ""}</div>
        <div class="nt-acc">${!n.hecha ? `<button type="button" data-nt-ed="${n.id}">✏️ Editar</button>` : ""}${vence ? `<button type="button" data-nt-pos="${n.id}">⏳ +10 min</button>` : ""}${n.rec && !n.hecha ? calLink(n) : ""}<button type="button" data-nt-del="${n.id}" class="${V.borrar === n.id ? "si" : ""}">${V.borrar === n.id ? "¿Borrar? Sí" : "🗑️ Borrar"}</button></div>
      </div></div>`;
  }
  function calLink(n) {
    const d = deLocal(n.rec); if (!d) return "";
    const f = x => `${x.getFullYear()}${p2(x.getMonth() + 1)}${p2(x.getDate())}T${p2(x.getHours())}${p2(x.getMinutes())}00`;
    const fin = new Date(d.getTime() + 15 * 60e3), tit = n.t.split("\n")[0].slice(0, 90);
    if (/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && "ontouchend" in document) return `<button type="button" data-nt-ics="${n.id}">📅 Calendario</button>`;
    const u = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(tit)}&dates=${f(d)}/${f(fin)}&details=${encodeURIComponent(n.t + "\n\n(De mi libreta)")}`;
    return `<a href="${h(u)}" target="_blank" rel="noopener">📅 Calendario</a>`;
  }
  function icsDescargar(n) {
    const d = deLocal(n.rec); if (!d) return;
    const f = x => `${x.getFullYear()}${p2(x.getMonth() + 1)}${p2(x.getDate())}T${p2(x.getHours())}${p2(x.getMinutes())}00`;
    const e = s => String(s).replace(/[\\,;]/g, m => "\\" + m).replace(/\n/g, "\\n");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mi libreta//ES", "BEGIN:VEVENT", "UID:" + n.id + "@libreta", "DTSTAMP:" + f(new Date()), "DTSTART:" + f(d), "DTEND:" + f(new Date(d.getTime() + 15 * 60e3)),
      "SUMMARY:" + e(n.t.split("\n")[0].slice(0, 90)), "DESCRIPTION:" + e(n.t), "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:" + e(n.t.slice(0, 90)), "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "recordatorio.ics"; document.body.appendChild(a); a.click(); a.remove();
  }
  function enlazar() {
    const c = document.getElementById("ntCuerpo");
    const q = s => c.querySelectorAll(s);
    q("[data-nt-tipo]").forEach(b => b.onclick = () => { V.tipo = V.tipo === b.dataset.ntTipo ? "" : b.dataset.ntTipo; dibujar(); });
    q("[data-nt-rec]").forEach(b => b.onclick = () => { V.recModo = b.dataset.ntRec; if (V.recModo) pedirPermiso(); dibujar(); if (V.recModo === "otro") { const i = c.querySelector("#ntFecha"); if (i) i.focus(); } });
    const fi = c.querySelector("#ntFecha"); if (fi) fi.onchange = () => { V.rec = fi.value; };
    q("[data-nt-f]").forEach(b => b.onclick = () => { V.filtro = b.dataset.ntF; V.borrar = null; dibujar(); });
    const bq = c.querySelector("#ntQ"); if (bq) bq.oninput = () => { V.q = bq.value; const pos = bq.selectionStart; dibujar(); const n = c.querySelector("#ntQ"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } };
    c.querySelector("#ntOk").onclick = guardarNota;
    const can = c.querySelector("#ntCan"); if (can) can.onclick = () => { V.ed = null; V.tipo = ""; V.recModo = ""; V.rec = ""; c.querySelector("#ntTx").value = ""; dibujar(); };
    q("[data-nt-ck]").forEach(b => b.onclick = () => { cambiar(b.dataset.ntCk, n => { n.hecha = n.hecha ? "" : ahora(); }); });
    q("[data-nt-pos]").forEach(b => b.onclick = () => posponer(b.dataset.ntPos));
    q("[data-nt-ics]").forEach(b => b.onclick = () => { const n = leerL().find(x => x.id === b.dataset.ntIcs); if (n) icsDescargar(n); });
    q("[data-nt-ed]").forEach(b => b.onclick = () => {
      const n = leerL().find(x => x.id === b.dataset.ntEd); if (!n) return;
      V.ed = n.id; V.tipo = n.tipo || ""; V.recModo = n.rec ? "otro" : ""; V.rec = n.rec || "";
      c.querySelector("#ntTx").value = n.t; dibujar(); c.scrollTop = 0; const t = c.querySelector("#ntTx"); t.focus();
    });
    q("[data-nt-del]").forEach(b => b.onclick = () => {
      const id = b.dataset.ntDel;
      if (V.borrar !== id) { V.borrar = id; dibujar(); clearTimeout(V.tb); V.tb = setTimeout(() => { if (V && V.borrar === id) { V.borrar = null; dibujar(); } }, 4000); return; }
      escribirL(leerL().filter(n => n.id !== id)); V.borrar = null; if (V.ed === id) V.ed = null; dibujar(); refrescar();
    });
    const lim = c.querySelector("#ntLimpiar"); if (lim) lim.onclick = () => {
      if (V.borrar !== "*") { V.borrar = "*"; dibujar(); return; }
      escribirL(leerL().filter(n => !n.hecha)); V.borrar = null; V.filtro = "pend"; dibujar(); refrescar();
    };
  }
  function guardarNota() {
    const c = document.getElementById("ntCuerpo"); if (!c) return;
    const t = c.querySelector("#ntTx").value.trim(); if (!t) return;
    let rec = "";
    if (V.recModo === "otro") { const fi = c.querySelector("#ntFecha"); rec = (fi && fi.value) || V.rec || ""; }
    else if (V.recModo) rec = (recOpciones().find(o => o[0] === V.recModo) || [])[2] || "";
    const L = leerL();
    if (V.ed) { const n = L.find(x => x.id === V.ed); if (n) { if (n.rec !== rec) n.avisado = false; Object.assign(n, { t, tipo: V.tipo, rec }); n.mod = ahora(); } }
    else L.push({ id: nid(), t, tipo: V.tipo, cre: ahora(), rec, avisado: false, hecha: "" });
    escribirL(L);
    V.ed = null; V.tipo = ""; V.recModo = ""; V.rec = ""; c.querySelector("#ntTx").value = "";
    if (V.filtro === "hechas") V.filtro = "pend";
    dibujar(true); refrescar();
  }
  function cambiar(id, fn) { const L = leerL(), n = L.find(x => x.id === id); if (!n) return; fn(n); escribirL(L); dibujar(); refrescar(); }
  function posponer(id, min = 10) {
    const L = leerL(), n = L.find(x => x.id === id); if (!n) return;
    n.rec = local(new Date(Date.now() + min * 60e3)); n.avisado = false; escribirL(L);
    if (V) dibujar(); refrescar();
  }

  /* ---------- recordatorios ---------- */
  function pedirPermiso() {
    try { if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {}); } catch (e) {}
  }
  function notificar(n) {
    const cuerpo = n.t.slice(0, 180);
    try { if (navigator.vibrate) navigator.vibrate([220, 120, 220]); } catch (e) {}
    try {
      const A = new (window.AudioContext || window.webkitAudioContext)(), o = A.createOscillator(), g = A.createGain();
      o.type = "sine"; o.frequency.value = 880; o.connect(g); g.connect(A.destination);
      g.gain.setValueAtTime(.0001, A.currentTime); g.gain.exponentialRampToValueAtTime(.25, A.currentTime + .02); g.gain.exponentialRampToValueAtTime(.0001, A.currentTime + .6);
      o.start(); o.stop(A.currentTime + .62);
    } catch (e) {}
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        const op = { body: cuerpo, tag: "libreta-" + n.id, renotify: true };
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) navigator.serviceWorker.getRegistration().then(r => r ? r.showNotification("⏰ Recordatorio de mi libreta", op) : new Notification("⏰ Recordatorio de mi libreta", op)).catch(() => {});
        else new Notification("⏰ Recordatorio de mi libreta", op);
      }
    } catch (e) {}
    alerta(n);
  }
  function alerta(n) {
    let a = document.getElementById("ntAlerta"); if (a) a.remove();
    a = document.createElement("div"); a.className = "nt-alerta"; a.id = "ntAlerta"; a.setAttribute("role", "alert");
    a.innerHTML = `<div class="t"><span style="font-size:24px">⏰</span><div><b>Recordatorio</b>${h(n.t.length > 220 ? n.t.slice(0, 220) + "…" : n.t)}</div></div>
      <div class="nt-fila"><button type="button" class="nt-btn pri peq" data-a="h">✓ Ya lo hice</button><button type="button" class="nt-btn peq" data-a="p">⏳ En 10 min</button><button type="button" class="nt-btn peq" data-a="v">Ver libreta</button><button type="button" class="nt-btn peq" data-a="x" aria-label="Cerrar aviso" style="margin-left:auto">×</button></div>`;
    document.body.appendChild(a);
    a.querySelector('[data-a="h"]').onclick = () => { const L = leerL(), x = L.find(y => y.id === n.id); if (x) { x.hecha = ahora(); escribirL(L); } a.remove(); if (V) dibujar(); refrescar(); };
    a.querySelector('[data-a="p"]').onclick = () => { posponer(n.id); a.remove(); };
    a.querySelector('[data-a="v"]').onclick = () => { a.remove(); abrir(); };
    a.querySelector('[data-a="x"]').onclick = () => a.remove();
  }
  function revisar() {
    const L = leerL(); let hubo = false;
    L.forEach(n => { if (vencida(n) && !n.avisado) { n.avisado = true; hubo = n; } });
    if (hubo) { escribirL(L); notificar(hubo); if (V) dibujar(); }
    refrescar();
  }
  setInterval(revisar, 30e3);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) revisar(); });
  setTimeout(revisar, 1500);

  window.Notas = { abrir, cerrar, refrescar, pendientes: () => pendientesAviso().length, ICONO };
  refrescar();
})();
