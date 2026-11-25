/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Supervisión · El ciclo escolar del supervisor(a) de Educación Física:
   · Horarios: dónde y a qué hora trabaja cada maestro (ubicación y horarios del ciclo). Con eso el inicio dice quién
     está en qué escuela ahora mismo, para decidir a quién visitar sin llamar a nadie. Se imprime como el formato de
     «Ubicación y horarios de maestros».
   · Agenda del ciclo: el cronograma de actividades por área (administrativa, pedagógica, cívica y deportiva), con lo
     que viene en los próximos días y la opción de marcar cada actividad como hecha.
   · Entrega de planeaciones: lista mensual con las fechas del cronograma; se marca entregó, entregó tarde o no entregó,
     y se imprime el «Registro de entrega de planes de clase» para firma de las y los docentes.
   La primera vez se cargan los datos de la Zona 041 del ciclo 2026-2027; todo se puede editar. Todo se guarda en el dispositivo. */
"use strict";
const CI_DIAS = [1, 2, 3, 4, 5];
const CI_AREAS = { adm: { n: "Administrativa", c: "#2F6B3A", s: "#E1F0E2" }, ped: { n: "Pedagógica", c: "#B4372C", s: "#F8E0DC" }, civ: { n: "Cívica", c: "#6E3E9C", s: "#EEE3F7" }, dep: { n: "Deportiva / comunitaria", c: "#1F5FA8", s: "#E0EBF8" } };
const CI_MESES = ["2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07"];
const ciMesNom = k => MES_L[+k.slice(5, 7) - 1], ciMesCorto = k => MES[+k.slice(5, 7) - 1];

/* ---------- datos iniciales de la Zona 041 (ciclo 2026-2027), tomados de sus formatos ---------- */
const CI_HOR_041 = [
  // [maestro, escuela, turno, horas, lun, mar, mié, jue, vie]
  ["Elisa Paola Camacho Cruz", "Quinto Municipio", "M", 2, "", "", "8:00-9:00", "", "8:00-9:00"],
  ["Elisa Paola Camacho Cruz", "Adolfo López Mateos", "M", 18, "8:00-12:00", "8:00-12:00", "9:00-12:00", "8:00-12:00", "9:00-12:00"],
  ["Marisol Paredes Flores", "Adolfo López Mateos", "M", 8, "8:00-12:00", "", "8:00-12:00", "", ""],
  ["Sergio Oswaldo García Arce", "Independencia", "M", 20, "8:00-12:00", "8:00-12:00", "8:00-12:00", "8:00-12:00", "8:00-12:00"],
  ["Mario Alberto Camacho Cruz", "Independencia", "M", 4, "", "", "8:00-12:00", "", ""],
  ["Mario Alberto Camacho Cruz", "Rosarito", "M", 16, "8:00-12:00", "8:00-12:00", "", "8:00-12:00", "10:30-12:00"],
  ["Alexandro Castro López", "Rosarito", "M", 16, "8:00-12:00", "8:00-12:00", "8:00-12:00", "", "8:00-12:00"],
  ["Juan Antonio Cruz Gómez", "Centenario de la Revolución Mexicana", "M", 20, "8:00-12:00", "8:00-12:00", "8:00-12:00", "8:00-12:00", "8:00-12:00"],
  ["Enrique Pérez Montoya", "Centenario de la Revolución Mexicana", "M", 8, "", "", "8:00-12:00", "8:00-12:00", ""],
  ["José Dagoberto Ornelas Ayala", "Jesús García", "M", 22, "8:00-12:00", "8:00-12:00", "8:00-12:00", "8:00-12:00", "8:00-12:00"],
  ["Mario Jeovani López Luna", "Jesús García", "M", 4, "8:00-10:00", "11:00-12:00", "11:00-12:00", "", ""],
  ["Bogar Neftalí Cruz Betamen", "Aztlán", "M", 8, "8:00-12:00", "", "8:00-12:00", "", ""],
  ["Gerardo Cervantes Camacho", "Aztlán", "M", 12, "8:00-12:00", "", "8:00-12:00", "", "8:00-12:00"],
  ["Gerardo Cervantes Camacho", "Pedro Moreno", "M", 8, "", "8:00-12:00", "", "8:00-12:00", ""],
  ["Rodrigo Romero Virgen", "Pedro Moreno", "M", 2, "", "9:00-11:00", "", "", ""],
  ["María Nadesda Uzárraga Acosta", "Pedro Moreno", "M", 8, "8:00-12:00", "8:00-12:00", "", "", ""],
  ["Óscar Vargas Solís", "Pedro Moreno", "M", 2, "", "", "8:00-10:00", "", ""],
  ["Felipe de Jesús Jacobo Arellano", "Sor Juana Inés de la Cruz", "M", 10, "", "8:00-12:00", "8:00-10:00", "", "8:00-12:00"],
  ["Arantza Evangelina Rincón Cuevas", "Quinto Municipio", "M", 22, "8:00-12:00", "8:00-12:00", "8:00-12:00", "8:00-12:00", "8:00-12:00"],
  ["Erick Pérez López", "Quinto Municipio", "M", 8, "8:00-12:00", "", "", "8:00-12:00", ""],
  ["José Francisco López Juárez", "Centenario de la Revolución Mexicana", "M", 2, "", "10:30-12:00", "", "", ""],
  ["Interino (Plan de Ayala)", "Plan de Ayala", "V", 4, "", "", "", "", ""],
  ["Elisa Paola Camacho Cruz", "Plan de Ayala", "V", 20, "13:00-17:00", "13:00-17:00", "13:00-17:00", "13:00-17:00", "13:00-17:00"],
  ["Gerardo Cervantes Camacho", "16 de Septiembre", "V", 10, "13:00-17:00", "", "13:00-17:00", "", "13:00-15:00"],
  ["Sergio Oswaldo García Arce", "16 de Septiembre", "V", 8, "", "", "", "13:00-17:00", "13:00-17:00"],
  ["Sergio Oswaldo García Arce", "15 de Mayo", "V", 4, "", "", "13:00-17:00", "", ""],
  ["Mauricio Gutiérrez Robles", "16 de Septiembre", "V", 6, "13:00-16:10", "13:00-16:10", "", "", ""],
  ["Mauricio Gutiérrez Robles", "Cumbres (nueva creación)", "V", 12, "", "", "13:00-17:00", "13:00-17:00", "13:00-17:00"],
  ["Juan Antonio Cruz Gómez", "20 de Noviembre", "V", 20, "13:00-17:00", "13:00-17:00", "13:00-17:00", "13:00-17:00", "13:00-15:00"],
  ["José Dagoberto Ornelas Ayala", "Domingo Márquez Sánchez", "V", 18, "13:00-17:00", "13:00-17:00", "13:00-17:00", "13:00-17:00", "13:00-15:00"],
  ["Mario Jeovani López Luna", "Salvador Varela Reséndiz", "V", 12, "13:00-17:00", "13:00-17:00", "13:00-17:00", "", ""],
  ["Mario Alberto Camacho Cruz", "15 de Mayo", "V", 18, "13:00-16:00", "13:00-17:00", "13:00-16:00", "13:00-17:00", "13:00-17:00"],
  ["José Francisco López Juárez", "Domingo Márquez Sánchez", "V", 6, "", "", "", "13:00-17:00", ""],
  ["José Francisco López Juárez", "Cumbres (nueva creación)", "V", 12, "13:00-17:00", "13:00-17:00", "13:00-17:00", "", ""],
  ["Erick Pérez López", "15 de Mayo", "V", 2, "13:00-15:00", "", "", "13:00-15:00", ""]
];
/* Cronograma: [área, actividad, fechas] · fecha = "AAAA-MM-DD", rango "AAAA-MM-DD/AAAA-MM-DD" o mes completo "AAAA-MM" */
const CI_CRONO_041 = [
  ["adm", "Reanudación de labores", ["2026-08-24", "2027-01-07", "2027-04-05"]],
  ["adm", "Elaboración y entrega de horario de labores docentes y proyectos horas fuera de grupo", ["2026-09-07/2026-09-18"]],
  ["adm", "Entrega de estadística de zona (F3)", ["2026-10-02", "2027-01-22", "2027-06"]],
  ["adm", "Entrega de estadística por escuela", ["2026-09-14/2026-09-18", "2027-01-11/2027-01-15", "2027-06-01/2027-06-04"]],
  ["adm", "Entrega de incidencias administrativas", ["2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07"]],
  ["adm", "Medición de peso y talla", ["2026-08-31/2026-09-11", "2027-05-31/2027-06-11"]],
  ["adm", "Oficio de liberación", ["2027-07-06"]],
  ["ped", "Fase intensiva del CTE", ["2026-08-24/2026-08-28"]],
  ["ped", "Inicio del ciclo escolar para alumnos", ["2026-08-31"]],
  ["ped", "Reunión de organización de inicio de ciclo escolar", ["2026-09-03"]],
  ["ped", "Aplicación del programa / diagnóstico pedagógico-deportivo", ["2026-09-14"]],
  ["ped", "Sesión ordinaria del CTE", ["2026-09-25", "2026-10-30", "2026-11-27", "2027-01-29", "2027-02-26", "2027-04-30", "2027-05-28", "2027-06-25"]],
  ["ped", "Actualización docente de zona (durante SisAT)", ["2027-02", "2027-06"]],
  ["ped", "Aplicación de necesidades de asesoría en planes y programas, evaluación y planeación", ["2026-09"]],
  ["ped", "Visitas pedagógicas, administrativas y deportivas", ["2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07"]],
  ["ped", "Entrega de planeaciones (docentes)", ["2026-09-14", "2026-10-01", "2026-11-03", "2026-12-01", "2027-01-07", "2027-02-02", "2027-03-01", "2027-04-05", "2027-05-03", "2027-06-01"], "planes"],
  ["ped", "Reunión de elaboración del Plan de Trabajo del ciclo escolar", ["2027-06"]],
  ["ped", "Capacitación de bádminton (CREF)", ["2026-09-29"]],
  ["ped", "Día del Educador Físico y Congreso de Educación Física (CREF)", ["2026-10-08/2026-10-09"]],
  ["ped", "Taller de Ética Profesional y Programa de Protección (CREF)", ["2026-11-13"]],
  ["ped", "Compartiendo Experiencias Didácticas (CREF)", ["2027-02-17"]],
  ["ped", "Capacitación de primeros auxilios (CREF)", ["2027-03-12", "2027-07-02"]],
  ["ped", "Compartiendo Experiencias Exitosas en Educación Física (CREF)", ["2027-06-18"]],
  ["ped", "Fin del ciclo escolar", ["2027-07-06"]],
  ["civ", "Taller de escoltas escolares para docentes de la zona", ["2026-11-12"]],
  ["civ", "Ensayo general de la demostración de escoltas", ["2027-02-08"]],
  ["civ", "Demostración de escoltas escolares de la zona", ["2027-02-12"]],
  ["dep", "Junta previa JDEEB", ["2026-10-01"]],
  ["dep", "Fútbol 5 de zona varonil", ["2026-10-13"]], ["dep", "Fútbol 5 de zona femenil", ["2026-10-14"]],
  ["dep", "Básquetbol 5 de zona femenil y varonil", ["2026-10-22"]], ["dep", "Básquetbol 3x3 de zona femenil y varonil", ["2026-10-23"]],
  ["dep", "Béisbol 5 mixto", ["2026-11-04"]], ["dep", "Balonmano de zona femenil y varonil", ["2026-11-10"]], ["dep", "Voleibol de zona femenil y varonil", ["2026-12-03"]],
  ["dep", "Atletismo municipal primaria", ["2027-01-12"]], ["dep", "Ajedrez municipal primaria", ["2027-01-14"]],
  ["dep", "Municipal de básquetbol varonil", ["2027-01-19"]], ["dep", "Municipal de básquetbol femenil", ["2027-01-20"]],
  ["dep", "Municipal de básquetbol 3x3 varonil", ["2027-01-21"]], ["dep", "Municipal de básquetbol 3x3 femenil (22 o 25 de enero)", ["2027-01-22"]],
  ["dep", "Municipal de béisbol 5 vs 5 mixto", ["2027-02-03"]], ["dep", "Municipal de balonmano femenil", ["2027-02-04"]], ["dep", "Municipal de balonmano varonil", ["2027-02-05"]],
  ["dep", "Municipal de voleibol varonil", ["2027-02-09"]], ["dep", "Municipal de voleibol femenil", ["2027-02-10"]], ["dep", "Municipal de bádminton", ["2027-02-11"]],
  ["dep", "Municipal de flag femenil", ["2027-02-12"]], ["dep", "Municipal de flag varonil", ["2027-02-16"]],
  ["dep", "Municipal de fútbol 5x5 femenil", ["2027-02-18"]], ["dep", "Municipal de fútbol 5x5 varonil", ["2027-02-19"]],
  ["dep", "Premiación municipal JDEEB 2026-2027", ["2027-03-03"]], ["dep", "Mini olimpiada de 1.° y 2.° grado", ["2027-05-20"]], ["dep", "Torneo de 4.° y 5.° de primaria (CREF)", ["2027-06"]]
];

/* ---------- carga inicial (una sola vez) ---------- */
D.horarios = D.horarios || []; D.crono = D.crono || []; D.entregas = D.entregas || {}; D.cicloCfg = D.cicloCfg || {};
function ciEscPorNombre(n) { const k = nrm(n); return D.escuelas.find(e => nrm(e.nombre) === k) || D.escuelas.find(e => nrm(e.nombre).startsWith(k) || k.startsWith(nrm(e.nombre))); }
function ciMaePorNombre(n) { const k = nrm(n); return D.maestros.find(m => nrm(m.nombre) === k); }
function ciCargarZona041() {
  if (!D.cicloCfg.crono041) { D.crono = CI_CRONO_041.map(([area, act, fechas, liga]) => ({ id: uid(), area, act, fechas, liga: liga || "", hechas: {} })); D.cicloCfg.crono041 = true; }
  if (!D.cicloCfg.hor041 && D.escuelas.some(e => e.zona === "041")) {
    CI_HOR_041.forEach(([mn, en, tu, h, ...dias]) => { const e = ciEscPorNombre(en); if (!e) return; let m = ciMaePorNombre(mn);
      if (!m) { m = { id: uid(), nombre: mn, correo: "", escuelas: [] }; D.maestros.push(m); }
      if (!m.escuelas.includes(e.id)) m.escuelas.push(e.id);
      const d = {}; CI_DIAS.forEach((w, i) => { if (dias[i]) d[w] = dias[i]; });
      D.horarios.push({ id: uid(), maeId: m.id, escId: e.id, turno: tu === "V" ? "Vespertino" : "Matutino", horas: h, dias: d }); });
    D.cicloCfg.hor041 = true; }
  guardar(); }
if (D.cfg && D.cfg.listo) ciCargarZona041();

/* ---------- utilidades ---------- */
const ciMin = t => { const m = String(t || "").match(/(\d{1,2})[:.](\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
const ciRango = t => { const p = String(t || "").split(/\s*[-–a]\s*/); const a = ciMin(p[0]), b = ciMin(p[1]); return a == null || b == null ? null : [a, b]; };
const horDe = mId => D.horarios.filter(h => h.maeId === mId);
const horasMae = mId => horDe(mId).reduce((t, h) => t + (+h.horas || 0), 0);
function ciAhora(fecha, minuto) { const w = dF(fecha).getDay(); const L = [];
  D.horarios.forEach(h => { const r = ciRango(h.dias[w]); if (!r) return; const m = maeDe(h.maeId), e = escDe(h.escId); if (!m || !e) return;
    L.push({ h, m, e, r, ahora: minuto != null && minuto >= r[0] && minuto < r[1] }); });
  return L.sort((a, b) => a.r[0] - b.r[0] || a.m.nombre.localeCompare(b.m.nombre, "es")); }
const ciMinAhora = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const ciHHMM = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
/* fechas de una actividad: {k, ini, fin, mes} */
function ciFechas(a) { return a.fechas.map(f => { if (/^\d{4}-\d{2}$/.test(f)) return { k: f, mes: true, ini: f + "-01", fin: f + "-31" }; const [i, j] = f.split("/"); return { k: f, ini: i, fin: j || i }; }); }
const ciFechaTxt = x => x.mes ? `todo ${ciMesNom(x.k)}` : x.ini === x.fin ? fCorta(x.ini) : `${fCorta(x.ini)} al ${fCorta(x.fin)}`;
function ciProximas(dias) { const h = hoy(), lim = iso(new Date(Date.now() + dias * 864e5)), L = [];
  D.crono.forEach(a => ciFechas(a).forEach(x => { if (x.mes) return; if (x.fin >= h && x.ini <= lim) L.push({ a, x }); }));
  return L.sort((p, q) => p.x.ini.localeCompare(q.x.ini)); }

/* =================================================================== HORARIOS */
VISTAS.horarios = () => { const tab = S.hTab || "ahora";
  const tabs = `<div class="chips mt">${[["ahora", "Quién está dónde"], ["mae", "Por maestro"], ["esc", "Por escuela"]].map(([k, t]) => `<button class="chip" data-ht="${k}" aria-pressed="${tab === k}">${t}</button>`).join("")}</div>`;
  let cuerpo = "";
  if (tab === "ahora") { const f = S.hF || hoy(), w = dF(f).getDay(), esHoy = f === hoy(), mn = esHoy ? ciMinAhora() : null, L = ciAhora(f, mn);
    cuerpo = `<div class="dos mt"><label class="campo"><span>Día</span><input type="date" id="hF" value="${f}"></label><div class="campo"><span>&nbsp;</span><div class="small muted" style="padding-top:12px">${DSEM_L[w]}${esHoy ? ` · ahora ${ciHHMM(mn)}` : ""}</div></div></div>
     ${w === 0 || w === 6 ? `<div class="vacio">Fin de semana: no hay clases.</div>` : L.length ? `<div class="lista">${L.map(x => `<button class="it btnit" data-hm="${x.m.id}" style="${x.ahora ? "box-shadow:0 0 0 2px var(--jade)" : ""}"><span class="av" style="background:${x.ahora ? "var(--jade)" : "var(--hilo2)"};color:${x.ahora ? "#fff" : "var(--gris)"};font-size:11px;line-height:1.1;text-align:center">${ciHHMM(x.r[0])}<br>${ciHHMM(x.r[1])}</span><span class="tx"><b>${esc(x.m.nombre)}</b><small>${esc(escNom(x.e))}${x.ahora ? " · <b style='color:var(--jade)'>en clase ahora</b>" : ""}</small></span></button>`).join("")}</div>` : `<div class="vacio">No hay horarios registrados para ese día.</div>`}`; }
  if (tab === "mae") cuerpo = `<div class="lista mt">${D.maestros.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(m => { const H = horDe(m.id), t = horasMae(m.id);
    return `<button class="it btnit" data-hm="${m.id}"><span class="av" style="font-weight:800;background:${H.length ? "var(--anil-s)" : m.inactivo ? "var(--hilo2)" : "var(--rojo-s)"};color:${H.length ? "var(--anil)" : m.inactivo ? "var(--gris)" : "var(--rojo)"}">${t || "—"}</span><span class="tx"><b>${esc(m.nombre)}</b><small>${m.inactivo ? `Inactivo · ${esc(m.motivoInactivo || "")}` : H.length ? H.map(h => esc(escCorta((escDe(h.escId) || {}).nombre) + " " + h.horas + " h")).join(" · ") : "Sin horario registrado"}</small></span></button>`; }).join("")}</div>`;
  if (tab === "esc") cuerpo = D.escuelas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(e => { const H = D.horarios.filter(h => h.escId === e.id);
    return `<h2 class="sec-t">${esc(escNom(e))}</h2><div class="lista">${H.length ? H.map(h => { const m = maeDe(h.maeId); return `<button class="it btnit" data-hh="${h.id}"><span class="tx"><b>${esc(m ? m.nombre : "—")} · ${h.horas} h</b><small>${CI_DIAS.filter(w => h.dias[w]).map(w => `${DSEM[w]} ${esc(h.dias[w])}`).join(" · ") || "Sin días"}</small></span></button>`; }).join("") : `<div class="vacio">Sin horarios.</div>`}</div>`; }).join("");
  return barra("Supervisión", "Horarios de los maestros", `<button class="btn s p" id="hN">${ic("mas", 16)} Agregar</button>`) + `<main class="wrap">
   <p class="muted mt small">Ubicación y horario de cada maestro en cada escuela. El inicio le dice quién está en clase ahora mismo.</p>${tabs}${cuerpo}
   <section class="card mt2"><h3>Formato</h3><p class="small muted mb">Ubicación y horarios de maestros por turno, para imprimir o guardar en PDF.</p><button class="btn" id="hImp">${ic("impr", 16)} Imprimir horarios</button></section>${pie()}</main>`; };
ENLAZAR.horarios = () => { $$("[data-ht]").forEach(b => b.onclick = () => { S.hTab = b.dataset.ht; re(); }); $("#hF") && ($("#hF").onchange = e => { S.hF = e.target.value; re(); });
  $$("[data-hm]").forEach(b => b.onclick = () => ir("horarioMae", { id: b.dataset.hm })); $$("[data-hh]").forEach(b => b.onclick = () => formHorario(D.horarios.find(h => h.id === b.dataset.hh)));
  $("#hN").onclick = () => formHorario(null); $("#hImp").onclick = async () => imprimir(await docHorarios()); };
VISTAS.horarioMae = () => { const m = maeDe(S.id); if (!m) return VISTAS.horarios(); const H = horDe(m.id);
  return barra("Horarios", esc(m.nombre), `<button class="btn s p" id="hN">${ic("mas", 16)} Agregar</button>`) + `<main class="wrap">
   <section class="card mt"><b style="font-size:28px">${horasMae(m.id)}</b> <span class="muted">horas a la semana en ${H.length} escuela${H.length === 1 ? "" : "s"}</span></section>
   <div class="lista mt">${H.map(h => { const e = escDe(h.escId); return `<button class="it btnit" data-hh="${h.id}"><span class="av">${ic("escuela", 18)}</span><span class="tx"><b>${esc(e ? escNom(e) : "—")} · ${h.horas} h</b><small>${CI_DIAS.filter(w => h.dias[w]).map(w => `${DSEM[w]} ${esc(h.dias[w])}`).join(" · ") || "Sin días"}</small></span></button>`; }).join("") || `<div class="vacio">Sin horario registrado. Agréguelo con el botón de arriba.</div>`}</div>${pie()}</main>`; };
ENLAZAR.horarioMae = () => { $("#hN").onclick = () => formHorario(null, S.id); $$("[data-hh]").forEach(b => b.onclick = () => formHorario(D.horarios.find(h => h.id === b.dataset.hh))); };
function formHorario(h, maeId) { const n = !h; h = h || { id: uid(), maeId: maeId || "", escId: "", turno: "Matutino", horas: 0, dias: {} };
  const opM = D.maestros.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(m => `<option value="${m.id}" ${m.id === h.maeId ? "selected" : ""}>${esc(m.nombre)}</option>`).join("");
  const opE = D.escuelas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(e => `<option value="${e.id}" ${e.id === h.escId ? "selected" : ""}>${esc(escNom(e))}</option>`).join("");
  dlg(`<h3>${n ? "Agregar horario" : "Horario"}</h3>
   <label class="campo"><span>Maestro(a)</span><select id="hM"><option value="">— Elija —</option>${opM}</select></label>
   <label class="campo"><span>Escuela</span><select id="hE"><option value="">— Elija —</option>${opE}</select></label>
   <div class="dos"><label class="campo"><span>Turno</span><select id="hT">${["Matutino", "Vespertino"].map(x => `<option ${x === h.turno ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="campo"><span>Horas a la semana</span><input type="number" id="hH" min="0" max="40" value="${h.horas || 0}"></label></div>
   <p class="small muted mb">Escriba el horario de cada día como 8:00-12:00. Deje vacío el día que no va.</p>
   ${CI_DIAS.map(w => `<label class="campo"><span>${DSEM_L[w][0].toUpperCase() + DSEM_L[w].slice(1)}</span><input id="hD${w}" value="${esc(h.dias[w] || "")}" placeholder="8:00-12:00"></label>`).join("")}
   <div class="fila fin">${n ? "" : `<button class="btn r" id="hB" style="margin-right:auto">Quitar</button>`}<button class="btn" id="hX">Cancelar</button><button class="btn p" id="hOk">Guardar</button></div>`, w => {
    w.querySelector("#hX").onclick = cerrarDlg;
    w.querySelector("#hOk").onclick = () => { const mId = w.querySelector("#hM").value, eId = w.querySelector("#hE").value; if (!mId || !eId) return toast("Elija maestro(a) y escuela.");
      const d = {}; for (const x of CI_DIAS) { const t = w.querySelector("#hD" + x).value.trim().replace(/\./g, ":"); if (t && !ciRango(t)) return toast(`Revise el horario del ${DSEM_L[x]}: escríbalo como 8:00-12:00.`); if (t) d[x] = t; }
      Object.assign(h, { maeId: mId, escId: eId, turno: w.querySelector("#hT").value, horas: +w.querySelector("#hH").value || 0, dias: d });
      const m = maeDe(mId); if (m && !m.escuelas.includes(eId)) m.escuelas.push(eId);
      if (n) D.horarios.push(h); guardar(); cerrarDlg(); re(); toast("Horario guardado."); };
    w.querySelector("#hB") && (w.querySelector("#hB").onclick = async () => { if (!(await confirmar("¿Quitar este horario?", "Quitar"))) return; D.horarios = D.horarios.filter(x => x !== h); guardar(); re(); toast("Horario quitado."); }); }); }
async function docHorarios() { const isep = await aDataURL(ISEP).catch(() => ""), td = "border:1px solid #999;padding:4px 5px;vertical-align:top;font-size:8.5pt", th = td + ";background:#EFEAE0;text-align:center;font-weight:bold";
  const tabla = tu => { const L = D.horarios.filter(h => h.turno === tu).map(h => ({ h, m: maeDe(h.maeId), e: escDe(h.escId) })).filter(x => x.m && x.e).sort((a, b) => a.e.nombre.localeCompare(b.e.nombre, "es") || a.m.nombre.localeCompare(b.m.nombre, "es"));
    return L.length ? `<h3 style="font-size:10.5pt;margin:12px 0 6px">TURNO ${tu.toUpperCase()}</h3><table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th}">Maestro</th><th style="${th}">Escuela</th><th style="${th}">Núm. horas</th>${CI_DIAS.map(w => `<th style="${th}">${DSEM_L[w][0].toUpperCase() + DSEM_L[w].slice(1)}</th>`).join("")}</tr></thead><tbody>
     ${L.map(x => `<tr><td style="${td}"><b><i>${esc(x.m.nombre)}</i></b></td><td style="${td}">${esc(x.e.nombre)}</td><td style="${td};text-align:center">${x.h.horas}</td>${CI_DIAS.map(w => `<td style="${td};text-align:center">${esc(x.h.dias[w] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>` : ""; };
  return `<div class="doc" style="font-family:Arial,Helvetica,sans-serif;color:#111"><table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tr><td style="width:90px">${isep ? `<img src="${isep}" style="height:54px">` : ""}</td><td style="text-align:center"><b style="font-size:11pt">UBICACIÓN Y HORARIOS DE MAESTROS${D.yo.zona ? " ZONA " + esc(D.yo.zona) : ""}</b><br><span style="font-size:10pt">CICLO ESCOLAR ${ciCiclo()}</span></td><td style="width:90px"></td></tr></table>
   ${tabla("Matutino")}${tabla("Vespertino")}<table style="width:100%;margin-top:34px"><tr><td style="width:50%"></td><td style="text-align:center;border-top:1px solid #333;padding-top:4px;font-size:9.5pt">${esc(yoNombre())}<br>${esc(D.yo.cargo || "")}</td></tr></table></div>`; }
const ciCiclo = () => { const d = new Date(), y = d.getFullYear(); return d.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };

/* =================================================================== AGENDA DEL CICLO */
VISTAS.agendaCiclo = () => { const mesAct = hoy().slice(0, 7), mes = S.cM || (CI_MESES.includes(mesAct) ? mesAct : CI_MESES[0]), fa = S.cA || "";
  const L = []; D.crono.filter(a => !fa || a.area === fa).forEach(a => ciFechas(a).forEach(x => { if ((x.mes && x.k === mes) || (!x.mes && (x.ini.slice(0, 7) === mes || x.fin.slice(0, 7) === mes))) L.push({ a, x }); }));
  L.sort((p, q) => (p.x.mes ? 1 : 0) - (q.x.mes ? 1 : 0) || p.x.ini.localeCompare(q.x.ini));
  const prox = ciProximas(15);
  return barra("Supervisión", "Agenda del ciclo", `<button class="btn s p" id="cN">${ic("mas", 16)} Actividad</button>`) + `<main class="wrap">
   <p class="muted mt small">Cronograma de actividades de Educación Física del ciclo ${ciCiclo()}. Toque una actividad para marcarla como hecha o editarla.</p>
   ${prox.length ? `<section class="card mt" style="border-color:var(--jade)"><h3>Próximos 15 días</h3><div class="lista mt">${prox.slice(0, 6).map(({ a, x }) => itemCrono(a, x)).join("")}</div></section>` : ""}
   <div class="chips mt">${CI_MESES.map(k => `<button class="chip" data-cm="${k}" aria-pressed="${k === mes}">${ciMesCorto(k)}${k.slice(0, 4) !== mes.slice(0, 4) ? "" : ""}</button>`).join("")}</div>
   <div class="chips mt"><button class="chip" data-ca="" aria-pressed="${!fa}">Todas las áreas</button>${Object.entries(CI_AREAS).map(([k, v]) => `<button class="chip" data-ca="${k}" aria-pressed="${fa === k}" style="${fa === k ? `background:${v.c};border-color:${v.c};color:#fff` : `color:${v.c}`}">${v.n}</button>`).join("")}</div>
   <h2 class="sec-t">${ciMesNom(mes)[0].toUpperCase() + ciMesNom(mes).slice(1)} ${mes.slice(0, 4)}</h2>
   <div class="lista">${L.map(({ a, x }) => itemCrono(a, x)).join("") || `<div class="vacio">Sin actividades este mes.</div>`}</div>
   <section class="card mt2"><h3>Imprimir</h3><p class="small muted mb">Cronograma completo del ciclo por área y mes.</p><button class="btn" id="cImp">${ic("impr", 16)} Imprimir cronograma</button></section>${pie()}</main>`; };
function itemCrono(a, x) { const ar = CI_AREAS[a.area], hecha = a.hechas && a.hechas[x.k], pas = !x.mes && x.fin < hoy();
  return `<button class="it btnit" data-cr="${a.id}" data-ck="${x.k}"><span class="av" style="background:${hecha ? "var(--jade)" : ar.s};color:${hecha ? "#fff" : ar.c};font-size:11px;font-weight:800;line-height:1.1;text-align:center">${hecha ? ic("check", 18) : x.mes ? ciMesCorto(x.k) : `${dF(x.ini).getDate()}<br>${MES[dF(x.ini).getMonth()]}`}</span><span class="tx"><b style="${hecha ? "text-decoration:line-through;opacity:.7" : ""}">${esc(a.act)}</b><small><span style="color:${ar.c};font-weight:700">${ar.n}</span> · ${ciFechaTxt(x)}${pas && !hecha ? " · <span style='color:var(--rojo)'>pasó sin marcar</span>" : ""}</small></span>${a.liga === "planes" && !x.mes ? `<span class="tag">Registro</span>` : ""}</button>`; }
ENLAZAR.agendaCiclo = () => { $$("[data-cm]").forEach(b => b.onclick = () => { S.cM = b.dataset.cm; re(); }); $$("[data-ca]").forEach(b => b.onclick = () => { S.cA = b.dataset.ca; re(); });
  $$("[data-cr]").forEach(b => b.onclick = () => accionCrono(D.crono.find(a => a.id === b.dataset.cr), b.dataset.ck)); $("#cN").onclick = () => formCrono(null); $("#cImp").onclick = async () => imprimir(await docCrono()); };
function accionCrono(a, k) { const x = ciFechas(a).find(f => f.k === k), hecha = a.hechas && a.hechas[k];
  dlg(`<h3>${esc(a.act)}</h3><p class="small muted mb"><b style="color:${CI_AREAS[a.area].c}">${CI_AREAS[a.area].n}</b> · ${ciFechaTxt(x)}</p>
   ${a.liga === "planes" && !x.mes ? `<button class="btn p full mb" id="aPl">${ic("plan", 16)} Abrir el registro de entrega de planeaciones</button>` : ""}
   <div class="fila"><button class="btn ${hecha ? "" : "p"}" id="aH">${ic("check", 16)} ${hecha ? "Marcar como pendiente" : "Marcar como hecha"}</button><button class="btn" id="aE">${ic("lapiz", 16)} Editar</button><button class="btn" id="aX">Cerrar</button></div>`, w => {
    w.querySelector("#aX").onclick = cerrarDlg; w.querySelector("#aE").onclick = () => formCrono(a);
    w.querySelector("#aH").onclick = () => { a.hechas = a.hechas || {}; if (hecha) delete a.hechas[k]; else a.hechas[k] = hoy(); guardar(); cerrarDlg(); re(); };
    w.querySelector("#aPl") && (w.querySelector("#aPl").onclick = () => ir("entregas", { eM: x.ini.slice(0, 7) })); }); }
function formCrono(a) { const n = !a; a = a || { id: uid(), area: "ped", act: "", fechas: [], liga: "", hechas: {} };
  dlg(`<h3>${n ? "Nueva actividad" : "Editar actividad"}</h3>
   <label class="campo"><span>Actividad</span><input id="fA" value="${esc(a.act)}"></label>
   <label class="campo"><span>Área</span><select id="fR">${Object.entries(CI_AREAS).map(([k, v]) => `<option value="${k}" ${k === a.area ? "selected" : ""}>${v.n}</option>`).join("")}</select></label>
   <label class="campo"><span>Fechas</span><textarea id="fF" placeholder="Una por renglón: 2026-12-03 · rango 2026-12-01/2026-12-05 · mes completo 2027-02">${esc(a.fechas.join("\n"))}</textarea><small>Una por renglón. Fecha (2026-12-03), rango (2026-12-01/2026-12-05) o mes completo (2027-02).</small></label>
   <div class="fila fin">${n ? "" : `<button class="btn r" id="fB" style="margin-right:auto">Quitar</button>`}<button class="btn" id="fX">Cancelar</button><button class="btn p" id="fOk">Guardar</button></div>`, w => {
    w.querySelector("#fX").onclick = cerrarDlg;
    w.querySelector("#fOk").onclick = () => { const act = w.querySelector("#fA").value.trim(), F = w.querySelector("#fF").value.split(/\n+/).map(s => s.trim()).filter(Boolean);
      if (!act) return toast("Escriba la actividad."); const mal = F.find(f => !/^\d{4}-\d{2}(-\d{2}(\/\d{4}-\d{2}-\d{2})?)?$/.test(f)); if (mal) return toast(`Revise la fecha «${esc(mal)}».`, 4000); if (!F.length) return toast("Ponga al menos una fecha.");
      Object.assign(a, { act, area: w.querySelector("#fR").value, fechas: F }); if (n) D.crono.push(a); guardar(); cerrarDlg(); re(); toast("Actividad guardada."); };
    w.querySelector("#fB") && (w.querySelector("#fB").onclick = async () => { if (!(await confirmar(`¿Quitar «${a.act}» de la agenda?`, "Quitar"))) return; D.crono = D.crono.filter(x => x !== a); guardar(); re(); }); }); }
async function docCrono() { const isep = await aDataURL(ISEP).catch(() => ""), td = "border:1px solid #999;padding:3px 4px;font-size:8pt;vertical-align:middle", th = td + ";background:#DCE6F2;font-weight:bold;text-align:center";
  const celda = (a, mes) => ciFechas(a).filter(x => (x.mes && x.k === mes) || (!x.mes && (x.ini.slice(0, 7) === mes || x.fin.slice(0, 7) === mes))).map(x => x.mes ? "X" : x.ini === x.fin ? String(dF(x.ini).getDate()).padStart(2, "0") : `${String(dF(x.ini).getDate()).padStart(2, "0")}-${String(dF(x.fin).getDate()).padStart(2, "0")}`).join(", ");
  return `<div class="doc" style="font-family:Arial,Helvetica,sans-serif;color:#111"><table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tr><td style="width:80px">${isep ? `<img src="${isep}" style="height:48px">` : ""}</td><td style="text-align:center"><b style="font-size:11pt">CRONOGRAMA DE ACTIVIDADES DE EDUCACIÓN FÍSICA${D.yo.zona ? " ZONA " + esc(D.yo.zona) : ""}</b><br><span style="font-size:10pt">CICLO ESCOLAR ${ciCiclo()}</span></td><td style="width:80px"></td></tr></table>
   <table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th};text-align:left">Actividades</th>${CI_MESES.map(k => `<th style="${th}">${ciMesCorto(k).toUpperCase()}</th>`).join("")}</tr></thead><tbody>
   ${Object.entries(CI_AREAS).map(([k, ar]) => { const L = D.crono.filter(a => a.area === k); return L.length ? `<tr><td colspan="13" style="${td};background:${ar.s};color:${ar.c};text-align:center;font-weight:bold">ÁREA ${ar.n.toUpperCase()}</td></tr>${L.map(a => `<tr><td style="${td};font-style:italic;font-weight:bold">${esc(a.act)}</td>${CI_MESES.map(mes => `<td style="${td};text-align:center;color:${ar.c};font-weight:bold">${celda(a, mes)}</td>`).join("")}</tr>`).join("")}` : ""; }).join("")}
   </tbody></table><table style="width:100%;margin-top:30px"><tr><td style="width:30%"></td><td style="text-align:center;border-top:1px solid #333;padding-top:4px;font-size:9.5pt">${esc(yoNombre())}<br>${esc(D.yo.cargo || "")}</td><td style="width:30%"></td></tr></table></div>`; }

/* =================================================================== ENTREGA DE PLANEACIONES */
const ciFechasPlanes = () => { const a = D.crono.find(x => x.liga === "planes"); return a ? ciFechas(a).filter(x => !x.mes).map(x => x.ini) : []; };
const ciEntrega = (mId, mes) => ((D.entregas[mId] || {})[mes]) || null;
const CI_EST = { e: { n: "Entregó", c: "var(--jade)", s: "var(--jade-s)" }, t: { n: "Tarde", c: "#C98A0B", s: "var(--maiz-s)" }, n: { n: "No entregó", c: "var(--rojo)", s: "var(--rojo-s)" } };
VISTAS.entregas = () => { const F = ciFechasPlanes(), meses = F.map(f => f.slice(0, 7)), mesAct = hoy().slice(0, 7);
  const mes = S.eM || (meses.filter(m => m <= mesAct).pop() || meses[0]), fecha = F.find(f => f.slice(0, 7) === mes), M = activos().slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const c = { e: 0, t: 0, n: 0, p: 0 }; M.forEach(m => { const x = ciEntrega(m.id, mes); c[x ? x.est : "p"]++; });
  return barra("Supervisión", "Entrega de planeaciones") + `<main class="wrap">
   <p class="muted mt small">Fechas de entrega del cronograma. Marque a cada maestro; al final imprima el registro para que firmen.</p>
   <div class="chips mt">${meses.map(k => `<button class="chip" data-em="${k}" aria-pressed="${k === mes}">${ciMesCorto(k)}</button>`).join("")}</div>
   <section class="card mt"><h3>Entrega de ${ciMesNom(mes)}${fecha ? ` · ${fLarga(fecha)}` : ""}</h3>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px;text-align:center">${[["e", c.e], ["t", c.t], ["n", c.n]].map(([k, v]) => `<div><b style="font-size:24px;color:${CI_EST[k].c}">${v}</b><div class="small muted">${CI_EST[k].n}</div></div>`).join("")}<div><b style="font-size:24px">${c.p}</b><div class="small muted">Sin marcar</div></div></div>
    ${c.p ? `<div class="fila mt"><button class="btn s" id="eTodos">Marcar a los que faltan como «Entregó»</button></div>` : ""}</section>
   <div class="lista mt">${M.map(m => { const x = ciEntrega(m.id, mes); return `<div class="it" style="flex-wrap:wrap;gap:8px"><span class="tx" style="flex:1;min-width:180px"><b>${esc(m.nombre)}</b><small>${x ? `<span style="color:${CI_EST[x.est].c};font-weight:700">${CI_EST[x.est].n}</span>${x.fecha ? " · " + fCorta(x.fecha) : ""}` : "Sin marcar"}</small></span>
     <span class="fila" style="gap:6px">${Object.entries(CI_EST).map(([k, v]) => `<button class="btn s" data-ee="${m.id}|${k}" style="${x && x.est === k ? `background:${v.c};border-color:${v.c};color:#fff` : ""}">${v.n}</button>`).join("")}</span></div>`; }).join("") || `<div class="vacio">Primero registre a sus maestros.</div>`}</div>
   <section class="card mt2"><h3>Registro de entrega de planes de clase</h3><p class="small muted mb">Concentrado de septiembre a junio, con el espacio para la firma de cada docente.</p><button class="btn" id="eImp">${ic("impr", 16)} Imprimir registro</button></section>${pie()}</main>`; };
ENLAZAR.entregas = () => { const F = ciFechasPlanes(), mes = S.eM || ((F.map(f => f.slice(0, 7)).filter(m => m <= hoy().slice(0, 7)).pop()) || (F[0] || "").slice(0, 7)), fecha = F.find(f => f.slice(0, 7) === mes);
  $$("[data-em]").forEach(b => b.onclick = () => { S.eM = b.dataset.em; re(); });
  $$("[data-ee]").forEach(b => b.onclick = () => { const [mId, est] = b.dataset.ee.split("|"), x = ciEntrega(mId, mes); D.entregas[mId] = D.entregas[mId] || {};
    if (x && x.est === est) delete D.entregas[mId][mes]; else D.entregas[mId][mes] = { est, fecha: est === "n" ? "" : (est === "e" && fecha && hoy() > fecha ? fecha : hoy()) }; guardar(); re(); });
  $("#eTodos") && ($("#eTodos").onclick = () => { activos().forEach(m => { if (!ciEntrega(m.id, mes)) { D.entregas[m.id] = D.entregas[m.id] || {}; D.entregas[m.id][mes] = { est: "e", fecha: fecha || hoy() }; } }); guardar(); re(); toast("Listo."); });
  $("#eImp").onclick = async () => imprimir(await docEntregas()); };
async function docEntregas() { const isep = await aDataURL(ISEP).catch(() => ""), F = ciFechasPlanes(), meses = F.map(f => f.slice(0, 7)), M = activos().slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const td = "border:1px solid #777;padding:3px 4px;font-size:8.5pt;height:26px;vertical-align:middle", th = td + ";background:#EFEAE0;text-align:center;font-weight:bold;height:auto";
  const celda = (m, k) => { const x = ciEntrega(m.id, k); if (!x) return ""; if (x.est === "n") return `<span style="color:#B3261E">No entregó</span>`; const f = x.fecha ? dF(x.fecha) : null; return `<span style="font-size:7pt;color:${x.est === "t" ? "#9A6700" : "#1E6B45"}">${x.est === "t" ? "Tarde " : "✓ "}${f ? f.getDate() + "/" + (f.getMonth() + 1) : ""}</span>`; };
  return `<div class="doc" style="font-family:Arial,Helvetica,sans-serif;color:#111;font-size:10pt"><table style="width:100%;border-collapse:collapse;margin-bottom:8px"><tr><td style="width:90px">${isep ? `<img src="${isep}" style="height:54px">` : ""}</td><td style="text-align:center"><b style="font-size:11pt">EDUCACIÓN FÍSICA${D.yo.zona ? " – ZONA ESCOLAR " + esc(D.yo.zona) : ""}</b><br>CICLO ESCOLAR ${ciCiclo()}</td><td style="width:90px"></td></tr></table>
   <p style="text-align:justify;line-height:1.45">Por medio de la presente, se hace constar por medio de la firma de las y los docentes, la revisión del cumplimiento del diseño, elaboración y entrega de los planes de clase del Ciclo Escolar ${ciCiclo()}, por parte de los docentes de Educación Física pertenecientes a la Zona Escolar ${esc(D.yo.zona || "")}.</p>
   <p style="text-align:justify;line-height:1.45">Esto, de acuerdo con la programación del cronograma de actividades de Educación Física del Ciclo Escolar ${ciCiclo()} y con sustento normativo en el punto 126 fracción IV, V, VI y VII de la Guía Operativa para la Organización y Funcionamiento de los Servicios de Educación Básica de ISEP para el Ciclo Escolar ${ciCiclo()}.</p>
   <table style="width:100%;border-collapse:collapse;margin-top:8px"><thead><tr><th style="${th};text-align:left">Nombre del docente</th>${meses.map(k => `<th style="${th}">${ciMesCorto(k)[0].toUpperCase() + ciMesCorto(k).slice(1)}</th>`).join("")}</tr></thead><tbody>
    ${M.map(m => `<tr><td style="${td}">${esc(m.nombre)}</td>${meses.map(k => `<td style="${td};text-align:center">${celda(m, k)}</td>`).join("")}</tr>`).join("")}</tbody></table>
   <p style="margin-top:26px;text-align:center">Atentamente</p><table style="width:100%;margin-top:34px"><tr><td style="width:30%"></td><td style="text-align:center;border-top:1px solid #333;padding-top:4px">${esc(yoNombre())}<br>${esc(D.yo.cargo || "Supervisor de Educación Física")}${D.yo.zona ? "<br>Zona Escolar " + esc(D.yo.zona) : ""}</td><td style="width:30%"></td></tr></table><p style="font-size:8pt;margin-top:18px">C.c.p. Archivo.</p></div>`; }

/* =================================================================== INICIO: tablero */
(function () { const base = VISTAS.inicio; VISTAS.inicio = () => { let h = base(); if (!D.cfg.listo) return h;
  const w = new Date().getDay(), mn = ciMinAhora(), L = w && w !== 6 ? ciAhora(hoy(), mn).filter(x => x.ahora) : [], prox = ciProximas(15).slice(0, 4);
  const F = ciFechasPlanes(), mesP = F.map(f => f.slice(0, 7)).filter(m => m <= hoy().slice(0, 7)).pop(), sinMarcar = mesP ? activos().filter(m => !ciEntrega(m.id, mesP)).length : 0, noEnt = mesP ? activos().filter(m => (ciEntrega(m.id, mesP) || {}).est === "n").length : 0;
  const tablero = `<section class="card mt"><div class="fila" style="justify-content:space-between"><h3>Ahora en clase</h3><button class="btn s" data-v2="horarios">Ver todos</button></div>
    ${L.length ? `<div class="lista mt">${L.slice(0, 6).map(x => `<div class="it"><span class="av" style="background:var(--jade);color:#fff;font-size:11px;text-align:center;line-height:1.1">${ciHHMM(x.r[0])}<br>${ciHHMM(x.r[1])}</span><span class="tx"><b>${esc(x.m.nombre)}</b><small>${esc(escNom(x.e))}</small></span></div>`).join("")}${L.length > 6 ? `<p class="small muted mt">y ${L.length - 6} más…</p>` : ""}</div>` : `<p class="small muted mt">${w && w !== 6 ? "En este momento no hay maestros en clase según los horarios." : "Fin de semana."}</p>`}</section>
   ${prox.length ? `<section class="card mt"><div class="fila" style="justify-content:space-between"><h3>Próximos 15 días</h3><button class="btn s" data-v2="agendaCiclo">Agenda</button></div><div class="lista mt">${prox.map(({ a, x }) => itemCrono(a, x)).join("")}</div></section>` : ""}
   ${mesP && (sinMarcar || noEnt) ? `<button class="aviso mt" data-v2="entregas" style="width:100%;text-align:left;cursor:pointer"><span>${ic("plan", 18)} <b>Planeaciones de ${ciMesNom(mesP)}:</b> ${sinMarcar ? `${sinMarcar} sin marcar` : ""}${sinMarcar && noEnt ? " · " : ""}${noEnt ? `${noEnt} no entregaron` : ""}</span></button>` : ""}`;
  const puertas = `<button class="puerta" data-v="agendaCiclo" style="--c:#2F6B3A;--c-s:#E1F0E2"><span class="ic">${ic("agenda")}</span><b>Agenda del ciclo</b><span>Cronograma de actividades por área y mes</span></button>
   <button class="puerta" data-v="entregas" style="--c:#6E3E9C;--c-s:#EEE3F7"><span class="ic">${ic("plan")}</span><b>Entrega de planeaciones</b><span>Registro mensual para firma de los docentes</span></button>
   <button class="puerta" data-v="horarios" style="--c:#1F5FA8;--c-s:#E0EBF8"><span class="ic">${ic("reloj")}</span><b>Horarios de los maestros</b><span>Quién está en qué escuela y a qué hora</span></button>`;
  h = h.replace('<h2 class="sec-t">Su trabajo</h2>', tablero + '<h2 class="sec-t">Su trabajo</h2>').replace('<div class="puertas">', '<div class="puertas">' + puertas);
  return h; };
  const enl = ENLAZAR.inicio; ENLAZAR.inicio = () => { enl(); $$("[data-v2]").forEach(b => b.onclick = () => ir(b.dataset.v2)); $$("#app [data-cr]").forEach(b => b.onclick = () => accionCrono(D.crono.find(a => a.id === b.dataset.cr), b.dataset.ck)); }; })();
/* Si la app se configura después (bienvenida), cargar los datos al terminar */
(function () { const g = guardar; let hecho = false; guardar = function () { g(); if (!hecho && D.cfg && D.cfg.listo && (!D.cicloCfg.crono041 || (!D.cicloCfg.hor041 && D.escuelas.some(e => e.zona === "041")))) { hecho = true; ciCargarZona041(); } }; })();
if (typeof S !== "undefined" && S.v === "inicio") pintar();
