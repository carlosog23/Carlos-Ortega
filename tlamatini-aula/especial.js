/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Tlamatini Aula Especial · el trabajo de los servicios de educación especial (USAER y CAM) en el marco de la educación inclusiva
   y la Nueva Escuela Mexicana: escuelas que atiende, alumnos en seguimiento, ruta de atención (ficha, evaluación del contexto, registro
   de barreras para el aprendizaje y la participación, evaluación psicopedagógica, plan de intervención con ajustes razonables,
   acuerdos, seguimiento e informes), agenda y reporte mensual, estrategias, concentrado y biblioteca.
   Los formatos siguen los documentos de la SEP; cuando la Coordinación de Educación Especial entregue formatos estatales, se ajustan.
   Datos muy sensibles de niñas y niños: todo se queda en el dispositivo y a Tlami nunca se le envían nombres. */
"use strict";
const ESP_SERV = { usaer: "USAER · Unidad de Servicios de Apoyo a la Educación Regular", cam: "CAM · Centro de Atención Múltiple" };
const ESP_FUN = { apoyo: "Maestra o maestro de apoyo", docam: "Docente de grupo (CAM)", psico: "Psicología", leng: "Comunicación y lenguaje", social: "Trabajo social", fisica: "Terapia física", dir: "Dirección del servicio", sup: "Supervisión de educación especial" };
const ESP_COND = ["Discapacidad intelectual", "Discapacidad motriz", "Discapacidad auditiva (sordera o hipoacusia)", "Discapacidad visual (ceguera o baja visión)", "Sordoceguera", "Discapacidad múltiple", "Discapacidad psicosocial", "Trastorno del espectro autista", "Aptitudes sobresalientes", "Dificultades severas de aprendizaje", "Dificultades severas de conducta", "Dificultades severas de comunicación", "Trastorno por déficit de atención e hiperactividad", "Otra condición o situación", "Sin condición identificada (enfrenta barreras)"];
const ESP_EST = { det: ["Detección", "#8A5A08"], eval: ["Evaluación", "#6B3F7A"], int: ["Intervención", "#1B7560"], seg: ["Seguimiento", "#24427A"], alta: ["Concluido", "#6A5C4C"] };
const ESP_BAPT = ["Actitudinales", "Pedagógicas o didácticas", "Organizativas", "Físicas o de infraestructura", "De comunicación e información"];
const ESP_BAPC = ["Escuela", "Aula", "Familia y comunidad"];
const ESP_ACT = ["Atención al alumno en el aula", "Atención individual o en pequeño grupo", "Asesoría o planeación con el docente", "Observación en el aula", "Evaluación psicopedagógica", "Orientación a la familia", "Taller o reunión con familias", "Participación en el CTE", "Reunión del equipo de apoyo", "Gestión o canalización con instituciones", "Elaboración de informes", "Otra"];
const ESP_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie"];
/* ---------- documentos de la ruta de atención ---------- */
const ESP_DOCS = {
  ficha: { t: "Ficha de identificación", c: [["nac", "Fecha de nacimiento", "f"], ["curp", "CURP", "t"], ["sexo", "Sexo", "s", ["Mujer", "Hombre"]], ["lengua", "Lengua materna", "t"], ["tutor", "Madre, padre o tutor", "t"], ["tel", "Teléfono de contacto", "t"], ["dom", "Domicilio", "t"],
    ["ingreso", "Fecha de ingreso al servicio", "f"], ["motivo", "Motivo de la canalización o de la detección", "a"], ["diagext", "Valoraciones o diagnósticos externos (institución y fecha)", "a"], ["servext", "Servicios externos que recibe (salud, terapias, DIF…)", "a"], ["salud", "Datos de salud relevantes para la escuela (alergias, medicamentos)", "a"]] },
  contexto: { t: "Evaluación del contexto", c: [["esc", "Contexto escolar: organización, cultura inclusiva, apoyos y prácticas de la escuela", "a"], ["aula", "Contexto del aula: enseñanza, materiales, convivencia y participación del alumno", "a"], ["fam", "Contexto socio-familiar: dinámica familiar, expectativas, apoyos y condiciones", "a"], ["fort", "Fortalezas y gustos del alumno", "a"], ["necesid", "Lo que necesita para aprender y participar", "a"]] },
  ep: { t: "Informe de evaluación psicopedagógica", c: [["motivo", "Motivo de la evaluación", "a"], ["antec", "Antecedentes del desarrollo y escolares", "a"], ["apariencia", "Aspectos generales y conducta durante la evaluación", "a"], ["cog", "Área cognitiva", "a"], ["leng", "Comunicación y lenguaje", "a"], ["motriz", "Área motriz", "a"], ["socio", "Área socioemocional y conducta adaptativa", "a"], ["estilo", "Estilo de aprendizaje y motivación", "a"], ["curr", "Nivel de desempeño por campo formativo (Lenguajes; Saberes y pensamiento científico; Ética, naturaleza y sociedades; De lo humano y lo comunitario)", "a"], ["concl", "Conclusiones: barreras que enfrenta y apoyos que requiere", "a"], ["recEsc", "Recomendaciones para la escuela y el aula", "a"], ["recFam", "Recomendaciones para la familia", "a"], ["instr", "Instrumentos y técnicas utilizados", "a"]] },
  plan: { t: "Plan de intervención y ajustes razonables", c: [["periodo", "Periodo", "t"], ["prop", "Propósito de la intervención", "a"], ["ajAcc", "Ajustes de acceso (espacios, materiales, comunicación)", "a"], ["ajMet", "Ajustes metodológicos y didácticos", "a"], ["ajEval", "Ajustes en la evaluación", "a"], ["ajOrg", "Ajustes organizativos (tiempos, agrupamientos, apoyos personales)", "a"], ["apoyos", "Apoyos específicos del servicio de educación especial", "a"], ["fam", "Acciones con la familia", "a"], ["resp", "Responsables y tiempos", "a"], ["crit", "Criterios para dar seguimiento y valorar avances", "a"]] },
  informe: { t: "Informe de avances", c: [["periodo", "Periodo que se informa", "t"], ["avances", "Avances del alumno en su aprendizaje y participación", "a"], ["ajustes", "Ajustes y apoyos que funcionaron", "a"], ["pend", "Barreras que persisten y retos", "a"], ["sig", "Acciones para el siguiente periodo", "a"]] },
  final: { t: "Informe final", c: [["periodo", "Ciclo escolar", "t"], ["sint", "Síntesis de la atención brindada", "a"], ["logros", "Logros del alumno", "a"], ["bap", "Barreras atendidas y las que persisten", "a"], ["rec", "Recomendaciones para el siguiente ciclo o servicio", "a"], ["decision", "Decisión (continúa en seguimiento, se concluye la atención, se canaliza)", "a"]] }
};
const ESP_RUTA = [["ficha", "1. Ficha"], ["contexto", "2. Contexto"], ["bap", "3. Barreras"], ["ep", "4. Evaluación"], ["plan", "5. Plan"], ["acuerdos", "6. Acuerdos"], ["seg", "7. Seguimiento"], ["informe", "8. Informes"]];

/* ---------- datos ---------- */
function espD() { if (!D.esp) D.esp = DEMO ? espDemo() : { servicio: "", fun: "", nombre: "", cct: "", zona: "", dir: "", escuelas: [], alumnos: [], agenda: [] };
  const E = D.esp; ["escuelas", "alumnos", "agenda"].forEach(k => E[k] = E[k] || []); return E; }
const espListo = () => !!(espD().servicio);
const espEsc = id => espD().escuelas.find(e => e.id === id);
const espAl = id => espD().alumnos.find(a => a.id === id);
const espUSAER = () => espD().servicio === "usaer";
function espEscuelasGrupo() { const E = espD(), out = []; if (E.cct) out.push({ cct: E.cct, nombre: E.nombre || "Centro de Atención Múltiple", turno: E.turno || "", dir: E.dir || "", cargoDir: "Director(a)", loc: E.loc || "", mun: E.mun || "" });
  E.escuelas.forEach(e => out.push({ cct: e.cct, nombre: e.nombre, turno: e.turno || "", dir: e.dir || "", cargoDir: "Director(a)", loc: e.loc || "", mun: "" })); return out; }
const espEdad = k => { if (!k) return ""; const n = dF(k), h = new Date(); let a = h.getFullYear() - n.getFullYear(); if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) a--; return a >= 0 && a < 40 ? a : ""; };
const espGrado = a => [a.grado ? a.grado + ".°" : "", a.grupo || ""].filter(Boolean).join(" ");
function espDemo() { const k = hoy(), d = n => { const x = new Date(); x.setDate(x.getDate() + n); return iso(x); };
  const e1 = { id: "ed1", nombre: "Escuela Primaria «Cuauhtémoc» (ejemplo)", cct: "02DPR9999Z", turno: "Matutino", dir: "Ramón Ejemplo Torres", nivel: "pri", dias: [0, 2], loc: "Camalú" }, e2 = { id: "ed2", nombre: "Escuela Primaria «Benito Juárez» (ejemplo)", cct: "02DPR9998Y", turno: "Matutino", dir: "Lucía Ejemplo Mora", nivel: "pri", dias: [1, 3], loc: "Vicente Guerrero" };
  return { servicio: "usaer", fun: "apoyo", nombre: "USAER No. 50 (ejemplo)", cct: "02FUA9999Z", zona: "Zona de educación especial (ejemplo)", dir: "Maestra Ejemplo Directora", escuelas: [e1, e2],
    alumnos: [
      { id: "ad1", nombre: "Mateo Ejemplo Ruiz", eid: "ed1", grado: 2, grupo: "A", docente: "Mtra. Rosa Ejemplo", cond: "Trastorno del espectro autista", est: "int", docs: { ficha: { nac: "2018-03-14", sexo: "Hombre", lengua: "Español", tutor: "Laura Ruiz (mamá)", ingreso: "2026-09-08", motivo: "La docente observa que Mateo se altera con los cambios de actividad y el ruido, y le cuesta trabajar en equipo." },
        contexto: { aula: "Grupo de 28 alumnos; la clase es mayormente expositiva; hay mucho ruido en los cambios de actividad.", fort: "Le gustan los dinosaurios y los números; memoriza secuencias con facilidad." },
        plan: { periodo: "Septiembre a diciembre", prop: "Que Mateo participe en las actividades del grupo con mayor autonomía y regule sus emociones en los cambios de actividad.", ajAcc: "Agenda visual de la jornada en su mesa; audífonos para reducir el ruido en momentos de mucha actividad.", ajMet: "Anticipar los cambios de actividad con un aviso visual y uno verbal; instrucciones cortas, una a la vez; trabajo en parejas antes que en equipos grandes." } },
        bap: [{ id: "b1", ctx: "Aula", tipo: "Pedagógicas o didácticas", d: "Instrucciones largas y solo orales.", acc: "Apoyos visuales e instrucciones por pasos." }, { id: "b2", ctx: "Escuela", tipo: "Organizativas", d: "Cambios de salón sin aviso previo.", acc: "Avisar con anticipación y anticiparlo en la agenda visual." }],
        acuerdos: [{ id: "c1", f: d(-20), con: "Docente de grupo y madre", txt: "Usar la agenda visual en casa y en la escuela; reunión de seguimiento en noviembre." }], seg: [{ id: "s1", f: d(-6), txt: "Usa la agenda visual sin ayuda en la entrada. Participó en la actividad de parejas con un compañero." }] },
      { id: "ad2", nombre: "Ana Ejemplo López", eid: "ed1", grado: 4, grupo: "B", docente: "Mtro. Jorge Ejemplo", cond: "Dificultades severas de aprendizaje", est: "eval", docs: { ficha: { nac: "2016-07-02", sexo: "Mujer", lengua: "Mixteco y español", motivo: "Lee con mucha dificultad textos de su grado." } }, bap: [], acuerdos: [], seg: [] },
      { id: "ad3", nombre: "Luis Ejemplo Pérez", eid: "ed2", grado: 5, grupo: "A", docente: "Mtra. Carmen Ejemplo", cond: "Discapacidad auditiva (sordera o hipoacusia)", est: "seg", docs: {}, bap: [], acuerdos: [], seg: [] }],
    agenda: [{ id: "g1", f: k, h: "08:30", eid: "ed1", tipo: "Atención al alumno en el aula", aid: "ad1", txt: "Acompañamiento en la actividad de matemáticas." }, { id: "g2", f: k, h: "10:30", eid: "ed1", tipo: "Asesoría o planeación con el docente", txt: "Planeación de ajustes para el proyecto del agua con la Mtra. Rosa." },
      { id: "g3", f: d(-1), h: "09:00", eid: "ed2", tipo: "Observación en el aula", aid: "ad3", txt: "Observación de la participación de Luis en Lenguajes." }, { id: "g4", f: d(-3), h: "12:00", eid: "ed1", tipo: "Orientación a la familia", aid: "ad1", txt: "Entrevista con la mamá de Mateo." }] }; }

/* ---------- alta del servicio ---------- */
VISTAS.espAlta = () => { const E = espD(), y = yo(); return `<main class="wrap"><section class="portada">${marca()}<h1>Hola${y.nombre ? ", " + esc(corto(y.nombre.replace(/^(Mtr[oa]\.|C\.)\s*/, ""))) : ""}</h1>
  <p>Tlamatini Aula para educación especial: su ruta de atención, sus formatos, su agenda y sus informes en un solo lugar. Para empezar, registre su servicio.</p></section>
  <section class="card mt"><h3>Mi servicio</h3>
   <div class="campo"><span>Servicio</span><div class="chips" id="xS">${Object.entries(ESP_SERV).map(([k, t]) => `<button type="button" class="chip" data-xs="${k}" aria-pressed="${E.servicio === k || (!E.servicio && S.xs === k)}">${t.split(" · ")[0]}</button>`).join("")}</div></div>
   <div class="campo"><span>Mi función</span><select id="xF" class="sel">${Object.entries(ESP_FUN).map(([k, t]) => `<option value="${k}" ${E.fun === k ? "selected" : ""}>${t}</option>`).join("")}</select></div>
   <div class="dos"><label class="campo"><span>Nombre del servicio</span><input id="xN" value="${esc(E.nombre)}" placeholder="USAER No. … · CAM No. …"></label><label class="campo"><span>C.C.T. del servicio</span><input id="xC" value="${esc(E.cct)}" style="text-transform:uppercase" placeholder="02FUA… · 02DML…"></label></div>
   <div class="dos"><label class="campo"><span>Mi nombre</span><input id="xY" value="${esc(D.docente.nombre || y.nombre)}" placeholder="Mtra. …"></label><label class="campo"><span>Directora o director del servicio</span><input id="xD" value="${esc(E.dir)}"></label></div>
   <div class="dos"><label class="campo"><span>Zona o supervisión de educación especial</span><input id="xZ" value="${esc(E.zona)}"></label><label class="campo"><span>Localidad</span><input id="xL" value="${esc(E.loc || "")}"></label></div>
   <div class="fila fin"><button class="btn p" id="xOk">${ic("check", 18)} Guardar y seguir</button></div></section>
  <p class="small muted mt">Sus datos y los de sus alumnos se guardan solo en este dispositivo. Haga respaldos en «Ajustes y respaldo».</p>${pie()}</main>`; };
ENLAZAR.espAlta = () => { const E = espD(); let sv = E.servicio || S.xs || "";
  $$("[data-xs]").forEach(b => b.onclick = () => { sv = b.dataset.xs; $$("[data-xs]").forEach(x => x.setAttribute("aria-pressed", x === b)); $("#xF").value = sv === "cam" ? "docam" : "apoyo"; });
  $("#xOk").onclick = () => { if (!sv) return toast("Elija si es USAER o CAM."); Object.assign(E, { servicio: sv, fun: val("xF"), nombre: val("xN").trim(), cct: val("xC").trim().toUpperCase(), dir: val("xD").trim(), zona: val("xZ").trim(), loc: val("xL").trim() });
    if (val("xY").trim()) D.docente.nombre = val("xY").trim(); guardar(); S = { v: "inicio" }; pintar(); toast(sv === "usaer" ? "Listo. Ahora registre las escuelas que atiende." : "Listo. Registre su grupo del CAM para planear con el Programa Sintético."); }; };

/* ---------- inicio ---------- */
VISTAS.espInicio = () => { const E = espD(), y = yo(), k = hoy(), hoyA = E.agenda.filter(a => a.f === k).sort((a, b) => (a.h || "").localeCompare(b.h || "")), dsem = new Date().getDay() - 1;
  const visitas = E.escuelas.filter(e => (e.dias || []).includes(dsem)), act = E.alumnos.filter(a => a.est !== "alta"), cam = E.servicio === "cam", g = gAct();
  return `<main class="wrap"><section class="portada">${marca()}<h1>Hola, ${esc(corto((D.docente.nombre || y.nombre || "maestra(o)").replace(/^(Mtr[oa]\.|C\.)\s*/, "")))}</h1>
   <p>${esc(E.nombre || ESP_SERV[E.servicio])} · ${esc(ESP_FUN[E.fun] || "")}<br>${DSEM_L[new Date().getDay()][0].toUpperCase() + DSEM_L[new Date().getDay()].slice(1)} ${fLarga(k)}${visitas.length ? ` · hoy: <b>${visitas.map(e => esc(e.nombre.replace(/^Escuela\s+(Primaria|Secundaria)\s*/i, ""))).join(", ")}</b>` : ""}</p>
   <div class="fila"><button class="btn m" id="xAg">${ic("mas")} Registrar actividad</button><button class="btn sec" id="xAl">${ic("persona")} Agregar alumno</button>${enApp() ? "" : `<button class="btn sec" id="bInst">${ic("bajar")} Instalar app</button>`}</div></section>
  ${typeof ppieBotonInicio === "function" ? ppieBotonInicio() : ""}
  ${typeof estTarjeta === "function" ? estTarjeta() : ""}
  <h2 class="sec-t">Hoy<small>${hoyA.length ? hoyA.length + " actividades" : "Sin actividades registradas"}</small></h2>
  ${hoyA.length ? `<div class="lista">${hoyA.map(a => espItemAg(a)).join("")}</div>` : `<div class="vacio">Registre aquí lo que hace en el día: así el reporte mensual se arma solo.</div>`}
  <h2 class="sec-t">Mi servicio</h2><div class="puertas">
   ${!cam || E.escuelas.length ? `<button class="puerta" data-v="espEscuelas" style="--c:#1F6F8B;--c-s:#DCEEF3"><span class="ic">${ic("agenda")}</span><b>Escuelas que atiendo</b><span>${E.escuelas.length} escuelas · días de visita y directivos</span></button>` : ""}
   <button class="puerta" data-v="espAlumnos" style="--c:#1B7560;--c-s:#DBEFE8"><span class="ic">${ic("grupo")}</span><b>Alumnos en seguimiento</b><span>${act.length} activos · ruta de atención completa con sus formatos</span></button>
   <button class="puerta" data-v="espAgenda" style="--c:#8A5A08;--c-s:#FAEBCB"><span class="ic">${ic("reloj")}</span><b>Agenda y bitácora</b><span>Lo que hace cada día, por escuela y por alumno</span></button>
   <button class="puerta" data-v="espReporte" style="--c:#6B3F7A;--c-s:#EEE3F2"><span class="ic">${ic("eval")}</span><b>Reporte mensual</b><span>Concentrado de actividades listo para imprimir o Word</span></button>
   <button class="puerta" data-v="espEstrategias" style="--c:#C2603A;--c-s:#F7E3D8"><span class="ic">${ic("chispa")}</span><b>Estrategias y ajustes</b><span>${ESP_ESTR.length} ideas por barrera y condición, para el plan y el docente</span></button>
   <button class="puerta" data-v="espConcentrado" style="--c:#24427A;--c-s:#E6ECF6"><span class="ic">${ic("lista")}</span><b>Concentrado del servicio</b><span>Alumnos por escuela, condición y etapa de atención</span></button>
   ${cam || D.grupos.length ? `<button class="puerta" data-v="${g ? "planes" : "grupoForm"}" style="--c:#24427A;--c-s:#E6ECF6"><span class="ic">${ic("plan")}</span><b>${g ? "Planeación de mi grupo" : "Registrar mi grupo"}</b><span>${g ? esc(grNom(g)) + " · contenidos y PDA del Programa Sintético" : "Para planear, pasar lista y evaluar en el CAM"}</span></button>
   ${g ? `<button class="puerta" data-v="lista" style="--c:#1B7560;--c-s:#DBEFE8"><span class="ic">${ic("lista")}</span><b>Pasar lista</b><span>${esc(grNom(g))}</span></button><button class="puerta" data-v="evaluacion" style="--c:#6B3F7A;--c-s:#EEE3F2"><span class="ic">${ic("eval")}</span><b>Evaluación</b><span>Del grupo del CAM</span></button><button class="puerta" data-v="dinamicas" style="--c:#C2603A;--c-s:#F7E3D8"><span class="ic">${ic("juego")}</span><b>Dinámicas y juegos</b><span>Para su grupo</span></button>` : ""}` : ""}
   <button class="puerta" data-v="espBiblio" style="--c:#1F3A6B;--c-s:#F4E1C1"><span class="ic">${ic("libro")}</span><b>Biblioteca y normativa</b><span>Leyes, Estrategia Nacional de Educación Inclusiva, DUA, protocolos</span></button>
   ${VISTAS.estudio ? `<button class="puerta" data-v="estudio" style="--c:#294A86;--c-s:#FAEBCB"><span class="ic">${ic("libro")}</span><b>Mi actualización profesional</b><span>Preguntas diarias, práctica y simulacros para USICAMM</span></button>` : ""}
   <button class="puerta" data-v="visita" style="--c:#1F3A6B;--c-s:#E6ECF6"><span class="ic">${ic("qr")}</span><b>Visita de acompañamiento</b><span>Comparta su trabajo con un código QR</span></button>
   <button class="puerta" data-v="espAjustes" style="--c:#6A5C4C;--c-s:#EFE6D6"><span class="ic">${ic("ajustes")}</span><b>Mi servicio y respaldo</b><span>Datos del servicio, grupo del CAM y copia de seguridad</span></button>
   <a class="puerta" href="${TLM}" style="--c:#1F3A6B;--c-s:#F4E1C1;text-decoration:none;color:inherit"><span class="ic">${ic("doc")}</span><b>Tlamatini</b><span>Formatos, documentos y trámites</span></a></div>${pie()}</main>`; };
ENLAZAR.espInicio = () => { typeof ppieEnlazarInicio === "function" && ppieEnlazarInicio(); $("#xAg").onclick = () => espDlgAg({}); $("#xAl").onclick = () => espDlgAl({}); $("#bInst") && ($("#bInst").onclick = instalar);
  $$(".puerta[data-v]").forEach(b => b.onclick = () => ir(b.dataset.v)); $$("[data-ag]").forEach(b => b.onclick = () => espDlgAg(espD().agenda.find(x => x.id === b.dataset.ag)));
  typeof estEnlazar === "function" && estEnlazar(); };
VISTAS.espAjustes = () => { const E = espD(); return barra("Educación especial", "Mi servicio y respaldo") + `<main class="wrap">
  <section class="card mt"><h3>${esc(E.nombre || "Mi servicio")}</h3><p class="small">${esc(ESP_SERV[E.servicio] || "")}<br>${esc(ESP_FUN[E.fun] || "")}${E.cct ? " · C.C.T. " + esc(E.cct) : ""}${E.dir ? "<br>Dirección: " + esc(E.dir) : ""}${E.zona ? "<br>" + esc(E.zona) : ""}</p><button class="btn mt" id="xEd">${ic("lapiz", 15)} Editar datos del servicio</button></section>
  <section class="card mt"><h3>Grupo del CAM</h3><p class="small muted mb">Si es docente de CAM, registre su grupo (preescolar, primaria o secundaria) para planear con los contenidos y PDA de su fase, pasar lista y evaluar.</p>${D.grupos.map(g => `<p class="small">• ${esc(grNom(g))} · ${esc(g.escuela)}</p>`).join("")}<button class="btn mt" id="xGr">${ic("mas", 15)} ${D.grupos.length ? "Agregar otro grupo" : "Registrar mi grupo"}</button></section>
  <section class="card mt"><h3>Respaldo</h3><p class="small muted mb">Copia de seguridad de todo: servicio, alumnos, documentos y agenda.</p><button class="btn" id="xRes">${ic("ajustes", 15)} Ir a ajustes y respaldo</button></section></main>`; };
ENLAZAR.espAjustes = () => { $("#xEd").onclick = () => ir("espAlta"); $("#xGr").onclick = () => { S.nivelNuevo = "prim"; ir("grupoForm"); }; $("#xRes").onclick = () => ir("ajustes"); };

/* ---------- escuelas (USAER) ---------- */
VISTAS.espEscuelas = () => { const E = espD(); return barra("Educación especial", "Escuelas que atiendo") + `<main class="wrap">
  <div class="fila mt"><button class="btn p" id="xEn">${ic("mas", 16)} Agregar escuela</button></div>
  <div class="lista mt">${E.escuelas.map(e => { const n = E.alumnos.filter(a => a.eid === e.id && a.est !== "alta").length; return `<button class="it btnit" data-esc="${e.id}"><span class="av">${ic("agenda", 18)}</span><span class="tx"><b>${esc(e.nombre)}</b><small>${e.cct ? esc(e.cct) + " · " : ""}${esc(e.turno || "")} · ${(e.dias || []).map(d => ESP_DIAS[d]).join(", ") || "sin días asignados"} · ${n} alumnos</small></span>${ic("sig", 16)}</button>`; }).join("") || `<div class="vacio">Registre las escuelas regulares donde brinda apoyo.</div>`}</div></main>`; };
ENLAZAR.espEscuelas = () => { $("#xEn").onclick = () => espDlgEsc({}); $$("[data-esc]").forEach(b => b.onclick = () => espDlgEsc(espEsc(b.dataset.esc))); };
function espDlgEsc(e) { const E = espD(), nueva = !e.id, dias = new Set(e.dias || []), escs = typeof escuelasTlm === "function" ? escuelasTlm() : [];
  dlg(`<h3>${nueva ? "Agregar escuela" : "Editar escuela"}</h3>
   <label class="campo"><span>Nombre de la escuela</span><input id="eN" value="${esc(e.nombre || "")}" placeholder="Escuela Primaria …"></label>
   <div class="dos"><label class="campo"><span>C.C.T.</span><input id="eC" value="${esc(e.cct || "")}" style="text-transform:uppercase"></label><label class="campo"><span>Turno</span><select id="eT">${["Matutino", "Vespertino", "Tiempo completo"].map(t => `<option ${t === e.turno ? "selected" : ""}>${t}</option>`).join("")}</select></label></div>
   <div class="dos"><label class="campo"><span>Directora o director</span><input id="eD" value="${esc(e.dir || "")}"></label><label class="campo"><span>Localidad</span><input id="eL" value="${esc(e.loc || "")}"></label></div>
   <div class="campo"><span>Nivel</span><select id="eV">${[["pre", "Preescolar"], ["pri", "Primaria"], ["sec", "Secundaria"]].map(([k, t]) => `<option value="${k}" ${(e.nivel || "pri") === k ? "selected" : ""}>${t}</option>`).join("")}</select></div>
   <div class="campo"><span>Días que asiste</span><div class="chips" id="eDi">${ESP_DIAS.map((d, i) => `<button type="button" class="chip" data-di="${i}" aria-pressed="${dias.has(i)}">${d}</button>`).join("")}</div></div>
   <div class="fila fin">${nueva ? "" : `<button class="btn r" id="eB" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="eX">Cancelar</button><button class="btn p" id="eOk">Guardar</button></div>`, v => {
    v.querySelectorAll("[data-di]").forEach(b => b.onclick = () => { const i = +b.dataset.di; dias.has(i) ? dias.delete(i) : dias.add(i); b.setAttribute("aria-pressed", dias.has(i)); });
    v.querySelector("#eX").onclick = cerrarDlg;
    v.querySelector("#eOk").onclick = () => { const nom = val("eN").trim(); if (!nom) return toast("Escriba el nombre de la escuela."); Object.assign(e, { nombre: nom, cct: val("eC").trim().toUpperCase(), turno: val("eT"), dir: val("eD").trim(), loc: val("eL").trim(), nivel: val("eV"), dias: [...dias].sort() });
      if (nueva) { e.id = uid(); E.escuelas.push(e); } guardar(); cerrarDlg(); re(); toast("Escuela guardada."); };
    v.querySelector("#eB") && (v.querySelector("#eB").onclick = async () => { if (E.alumnos.some(a => a.eid === e.id)) return toast("Primero cambie de escuela o elimine a sus alumnos."); if (!(await confirmar("Se eliminará la escuela de su lista.", "Eliminar"))) return; E.escuelas = E.escuelas.filter(x => x !== e); guardar(); re(); }); }); }

/* ---------- alumnos ---------- */
VISTAS.espAlumnos = () => { const E = espD(), f = S.xf = S.xf || { e: "", s: "act" };
  const L = E.alumnos.filter(a => (!f.e || a.eid === f.e) && (f.s === "todos" || (f.s === "act" ? a.est !== "alta" : a.est === f.s))).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return barra("Educación especial", "Alumnos en seguimiento") + `<main class="wrap">
  <div class="fila mt"><button class="btn p" id="xAl">${ic("mas", 16)} Agregar alumno</button></div>
  ${E.escuelas.length > 1 ? `<div class="chips mt"><button class="chip" data-fe="" aria-pressed="${!f.e}">Todas</button>${E.escuelas.map(e => `<button class="chip" data-fe="${e.id}" aria-pressed="${f.e === e.id}">${esc(e.nombre.replace(/^Escuela\s+(Primaria|Secundaria)\s*/i, ""))}</button>`).join("")}</div>` : ""}
  <div class="chips mt">${[["act", "Activos"]].concat(Object.entries(ESP_EST).map(([k, v]) => [k, v[0]])).concat([["todos", "Todos"]]).map(([k, t]) => `<button class="chip" data-fs="${k}" aria-pressed="${f.s === k}">${t}</button>`).join("")}</div>
  <div class="lista mt">${L.map(a => { const e = espEsc(a.eid), es = ESP_EST[a.est || "det"]; return `<button class="it btnit" data-al="${a.id}"><span class="av" style="background:${es[1]};color:#fff">${esc(a.nombre.slice(0, 1))}</span><span class="tx"><b>${esc(a.nombre)}</b><small>${esc(espGrado(a))}${e ? " · " + esc(e.nombre.replace(/^Escuela\s+(Primaria|Secundaria)\s*/i, "")) : ""} · ${esc(a.cond || "Sin condición registrada")}</small></span><span class="tag" style="background:${es[1]}22;color:${es[1]}">${es[0]}</span></button>`; }).join("") || `<div class="vacio">No hay alumnos con este filtro.</div>`}</div></main>`; };
ENLAZAR.espAlumnos = () => { $("#xAl").onclick = () => espDlgAl({}); $$("[data-fe]").forEach(b => b.onclick = () => { S.xf.e = b.dataset.fe; re(); }); $$("[data-fs]").forEach(b => b.onclick = () => { S.xf.s = b.dataset.fs; re(); }); $$("[data-al]").forEach(b => b.onclick = () => ir("espAlumno", { id: b.dataset.al, tab: "ficha" })); };
function espDlgAl(a) { const E = espD(), nuevo = !a.id;
  dlg(`<h3>${nuevo ? "Agregar alumno" : "Datos del alumno"}</h3>
   <label class="campo"><span>Nombre completo</span><input id="aN" value="${esc(a.nombre || "")}" placeholder="Nombre y apellidos"></label>
   ${E.escuelas.length ? `<label class="campo"><span>Escuela</span><select id="aE" class="sel">${E.escuelas.map(e => `<option value="${e.id}" ${a.eid === e.id ? "selected" : ""}>${esc(e.nombre)}</option>`).join("")}</select></label>` : `<p class="small muted mb">${espUSAER() ? "Aún no registra escuelas; puede agregarlas en «Escuelas que atiendo»." : ""}</p>`}
   <div class="dos"><label class="campo"><span>Grado</span><select id="aG">${[1, 2, 3, 4, 5, 6].map(n => `<option ${+a.grado === n ? "selected" : ""}>${n}</option>`).join("")}</select></label><label class="campo"><span>Grupo</span><input id="aR" value="${esc(a.grupo || "")}" maxlength="3" style="text-transform:uppercase"></label></div>
   <label class="campo"><span>Docente de grupo</span><input id="aD" value="${esc(a.docente || "")}" placeholder="Mtra. …"></label>
   <label class="campo"><span>Condición o situación <small>· solo si cuenta con valoración; si no, «Sin condición identificada»</small></span><select id="aC" class="sel">${ESP_COND.map(c => `<option ${a.cond === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
   <label class="campo"><span>Etapa de la atención</span><select id="aS" class="sel">${Object.entries(ESP_EST).map(([k, v]) => `<option value="${k}" ${(a.est || "det") === k ? "selected" : ""}>${v[0]}</option>`).join("")}</select></label>
   <div class="fila fin">${nuevo ? "" : `<button class="btn r" id="aB" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="aX">Cancelar</button><button class="btn p" id="aOk">Guardar</button></div>`, v => {
    if (nuevo) v.querySelector("#aC").value = "Sin condición identificada (enfrenta barreras)";
    v.querySelector("#aX").onclick = cerrarDlg;
    v.querySelector("#aOk").onclick = () => { const n = val("aN").trim(); if (!n) return toast("Escriba el nombre del alumno.");
      Object.assign(a, { nombre: n, eid: val("aE") || "", grado: +val("aG"), grupo: val("aR").trim().toUpperCase(), docente: val("aD").trim(), cond: val("aC"), est: val("aS") });
      if (nuevo) { Object.assign(a, { id: uid(), docs: { ficha: { ingreso: hoy() } }, bap: [], acuerdos: [], seg: [] }); E.alumnos.push(a); } guardar(); cerrarDlg();
      if (nuevo) ir("espAlumno", { id: a.id, tab: "ficha" }); else re(); toast(nuevo ? "Alumno agregado. Continúe con su ficha." : "Datos guardados."); };
    v.querySelector("#aB") && (v.querySelector("#aB").onclick = async () => { if (!(await confirmar("Se borrarán el alumno y todos sus documentos de este dispositivo.", "Borrar"))) return; E.alumnos = E.alumnos.filter(x => x !== a); E.agenda.forEach(x => { if (x.aid === a.id) delete x.aid; }); guardar(); cerrarDlg(); ir("espAlumnos", {}, true); }); }); }

/* ---------- expediente del alumno: ruta de atención ---------- */
VISTAS.espAlumno = () => { const a = espAl(S.id); if (!a) return VISTAS.espAlumnos(); a.docs = a.docs || {}; a.bap = a.bap || []; a.acuerdos = a.acuerdos || []; a.seg = a.seg || [];
  const tab = S.tab || "ficha", e = espEsc(a.eid), es = ESP_EST[a.est || "det"], hecho = k => k === "bap" ? a.bap.length : k === "acuerdos" ? a.acuerdos.length : k === "seg" ? a.seg.length : k === "informe" ? Object.keys(a.docs.informe || {}).length || Object.keys(a.docs.final || {}).length : Object.values(a.docs[k] || {}).some(x => String(x).trim());
  let cuerpo = "";
  if (ESP_DOCS[tab] && tab !== "informe") cuerpo = espFormDoc(a, tab);
  else if (tab === "informe") cuerpo = `<div class="chips mt">${["informe", "final"].map(k => `<button class="chip" data-inf="${k}" aria-pressed="${(S.inf || "informe") === k}">${ESP_DOCS[k].t}</button>`).join("")}</div>` + espFormDoc(a, S.inf || "informe");
  else if (tab === "bap") cuerpo = `<section class="card mt"><p class="small">Registre las barreras que limitan el aprendizaje y la participación del alumno. Están en el <b>contexto</b> (escuela, aula, familia), no en el alumno. Basado en el instrumento de registro de barreras de la SEP.</p><button class="btn p mt" id="bN">${ic("mas", 15)} Agregar barrera</button></section>
    ${ESP_BAPC.map(c => { const L = a.bap.filter(b => b.ctx === c); return L.length ? `<h2 class="sec-t">${c}</h2><div class="lista">${L.map(b => `<button class="it btnit" data-bap="${b.id}" style="text-align:left"><span class="tx"><b>${esc(b.tipo)}</b><small>${esc(b.d)}${b.acc ? "<br>→ " + esc(b.acc) : ""}</small></span>${ic("lapiz", 15)}</button>`).join("")}</div>` : ""; }).join("") || `<div class="vacio mt">Aún no hay barreras registradas.</div>`}
    <div class="fila mt"><button class="btn s" data-pdoc="bap">${ic("impr", 15)} Imprimir registro</button><button class="btn s" data-wdoc="bap">${ic("doc", 15)} Word</button></div>`;
  else if (tab === "acuerdos") cuerpo = `<section class="card mt"><p class="small">Acuerdos con el docente de grupo, la dirección y la familia. Cada acuerdo queda con fecha para darle seguimiento.</p><button class="btn p mt" id="cN">${ic("mas", 15)} Nuevo acuerdo</button></section>
    <div class="lista mt">${a.acuerdos.slice().sort((x, y) => y.f.localeCompare(x.f)).map(c => `<button class="it btnit" data-acu="${c.id}" style="text-align:left"><span class="tx"><b>${fLarga(c.f)} · ${esc(c.con || "")}</b><small style="white-space:pre-line">${esc(c.txt)}</small></span>${ic("lapiz", 15)}</button>`).join("") || `<div class="vacio">Sin acuerdos registrados.</div>`}</div>
    <div class="fila mt"><button class="btn s" data-pdoc="acuerdos">${ic("impr", 15)} Imprimir acta de acuerdos</button><button class="btn s" data-wdoc="acuerdos">${ic("doc", 15)} Word</button></div>`;
  else if (tab === "seg") cuerpo = `<section class="card mt"><label class="campo"><span>Nueva nota de seguimiento · ${fLarga(hoy())}</span><textarea class="area" id="sT" placeholder="Qué hizo, cómo participó, qué ajustes funcionaron, qué sigue…"></textarea></label><div class="fila fin"><button class="btn p" id="sOk">Guardar nota</button></div></section>
    <div class="lista mt">${a.seg.slice().sort((x, y) => y.f.localeCompare(x.f)).map(s => `<div class="it"><span class="tx"><b>${fLarga(s.f)}</b><small style="white-space:pre-line">${esc(s.txt)}</small></span><button class="btn s" data-sb="${s.id}" aria-label="Borrar">${ic("basura", 14)}</button></div>`).join("") || `<div class="vacio">Sin notas todavía. También las actividades de la agenda ligadas al alumno aparecen en su informe.</div>`}</div>
    <div class="fila mt"><button class="btn s" data-pdoc="seg">${ic("impr", 15)} Imprimir bitácora</button><button class="btn s" data-wdoc="seg">${ic("doc", 15)} Word</button></div>`;
  return barra(esc(e ? e.nombre : ESP_SERV[espD().servicio].split(" · ")[0]), esc(a.nombre), `<button class="back" id="aEd" aria-label="Editar datos">${ic("lapiz")}</button>`) + `<main class="wrap">
   <section class="card mt" style="border-left:5px solid ${es[1]}"><p class="small"><b>${esc(espGrado(a))}</b>${a.docente ? " · " + esc(a.docente) : ""}${a.docs.ficha && a.docs.ficha.nac ? " · " + espEdad(a.docs.ficha.nac) + " años" : ""}<br>${esc(a.cond || "")}</p>
    <div class="chips mt">${Object.entries(ESP_EST).map(([k, v]) => `<button class="chip" data-est="${k}" aria-pressed="${(a.est || "det") === k}">${v[0]}</button>`).join("")}</div></section>
   <div class="chips mt" style="flex-wrap:wrap">${ESP_RUTA.map(([k, t]) => `<button class="chip" data-tab="${k}" aria-pressed="${tab === k}">${hecho(k) ? "✓ " : ""}${t}</button>`).join("")}</div>${cuerpo}</main>`; };
function espFormDoc(a, k) { const Dc = ESP_DOCS[k], v = a.docs[k] = a.docs[k] || {}, ia = Dc.c.some(c => c[2] === "a");
  return `<section class="card mt"><h3>${Dc.t}</h3>${k === "ficha" ? `<p class="small muted mb">Datos básicos (nombre, escuela, grado, docente y condición) se editan con el lápiz de arriba.</p>` : ""}
   ${Dc.c.map(([ck, l, t, o]) => `<label class="campo"><span>${esc(l)}</span>${t === "a" ? `<textarea class="area" data-dk="${ck}" style="min-height:${k === "ficha" ? 70 : 96}px">${esc(v[ck] || "")}</textarea>` : t === "s" ? `<select class="sel" data-dk="${ck}"><option value=""></option>${o.map(x => `<option ${v[ck] === x ? "selected" : ""}>${x}</option>`).join("")}</select>` : `<input data-dk="${ck}" type="${t === "f" ? "date" : "text"}" value="${esc(v[ck] || "")}">`}</label>`).join("")}
   <p class="small muted">Se guarda solo mientras escribe.</p>
   <div class="fila mt">${ia ? `<button class="btn tlami-b" id="dIA">${ic("chispa", 15)} Redactar con Tlami</button>` : ""}<button class="btn s" data-pdoc="${k}">${ic("impr", 15)} Imprimir o PDF</button><button class="btn s" data-wdoc="${k}">${ic("doc", 15)} Word</button></div></section>`; }
ENLAZAR.espAlumno = () => { const a = espAl(S.id); if (!a) return;
  $("#aEd").onclick = () => espDlgAl(a);
  $$("[data-tab]").forEach(b => b.onclick = () => { S.tab = b.dataset.tab; re(); }); $$("[data-inf]").forEach(b => b.onclick = () => { S.inf = b.dataset.inf; re(); });
  $$("[data-est]").forEach(b => b.onclick = () => { a.est = b.dataset.est; guardar(); re(); });
  const k = S.tab === "informe" ? (S.inf || "informe") : S.tab;
  $$("[data-dk]").forEach(c => c.oninput = c.onchange = () => { a.docs[k] = a.docs[k] || {}; a.docs[k][c.dataset.dk] = c.value; clearTimeout(espGu.t); espGu.t = setTimeout(guardar, 400); });
  $("#dIA") && ($("#dIA").onclick = () => espTlami(a, k));
  $$("[data-pdoc]").forEach(b => b.onclick = () => { guardar(); imprimir(espDocHTML(a, b.dataset.pdoc)); });
  $$("[data-wdoc]").forEach(b => b.onclick = () => { guardar(); espWord(espDocHTML(a, b.dataset.wdoc), espTitDoc(b.dataset.wdoc) + " - " + a.nombre); });
  $("#bN") && ($("#bN").onclick = () => espDlgBap(a, {})); $$("[data-bap]").forEach(b => b.onclick = () => espDlgBap(a, a.bap.find(x => x.id === b.dataset.bap)));
  $("#cN") && ($("#cN").onclick = () => espDlgAcu(a, {})); $$("[data-acu]").forEach(b => b.onclick = () => espDlgAcu(a, a.acuerdos.find(x => x.id === b.dataset.acu)));
  $("#sOk") && ($("#sOk").onclick = () => { const t = val("sT").trim(); if (!t) return toast("Escriba la nota."); a.seg.push({ id: uid(), f: hoy(), txt: t }); if (a.est === "det" || a.est === "eval") a.est = a.est; guardar(); re(); toast("Nota guardada."); });
  $$("[data-sb]").forEach(b => b.onclick = async () => { if (!(await confirmar("Se borrará esta nota.", "Borrar"))) return; a.seg = a.seg.filter(x => x.id !== b.dataset.sb); guardar(); re(); }); };
function espGu() {}
function espDlgBap(a, b) { const nueva = !b.id;
  dlg(`<h3>${nueva ? "Agregar barrera" : "Editar barrera"}</h3>
   <div class="dos"><label class="campo"><span>Contexto</span><select id="pC" class="sel">${ESP_BAPC.map(c => `<option ${b.ctx === c ? "selected" : ""}>${c}</option>`).join("")}</select></label><label class="campo"><span>Tipo</span><select id="pT" class="sel">${ESP_BAPT.map(c => `<option ${b.tipo === c ? "selected" : ""}>${c}</option>`).join("")}</select></label></div>
   <label class="campo"><span>¿Qué limita su aprendizaje o participación?</span><textarea class="area" id="pD" placeholder="Ej.: Las instrucciones se dan solo de forma oral y son largas.">${esc(b.d || "")}</textarea></label>
   <label class="campo"><span>Acción para eliminarla o reducirla</span><textarea class="area" id="pA" placeholder="Ej.: Dar instrucciones por pasos, con apoyo visual.">${esc(b.acc || "")}</textarea></label>
   <div class="fila fin">${nueva ? "" : `<button class="btn r" id="pB" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="pX">Cancelar</button><button class="btn p" id="pOk">Guardar</button></div>`, v => {
    v.querySelector("#pX").onclick = cerrarDlg;
    v.querySelector("#pOk").onclick = () => { if (!val("pD").trim()) return toast("Describa la barrera."); Object.assign(b, { ctx: val("pC"), tipo: val("pT"), d: val("pD").trim(), acc: val("pA").trim() }); if (nueva) { b.id = uid(); a.bap.push(b); } guardar(); cerrarDlg(); re(); };
    v.querySelector("#pB") && (v.querySelector("#pB").onclick = () => { a.bap = a.bap.filter(x => x !== b); guardar(); cerrarDlg(); re(); }); }); }
function espDlgAcu(a, c) { const nuevo = !c.id;
  dlg(`<h3>${nuevo ? "Nuevo acuerdo" : "Editar acuerdo"}</h3>
   <div class="dos"><label class="campo"><span>Fecha</span><input id="cF" type="date" value="${c.f || hoy()}"></label><label class="campo"><span>Con quién</span><input id="cC" value="${esc(c.con || "")}" placeholder="Docente, dirección, familia…"></label></div>
   <label class="campo"><span>Acuerdos y compromisos</span><textarea class="area" id="cT" placeholder="Qué se acordó, quién lo hará y para cuándo.">${esc(c.txt || "")}</textarea></label>
   <div class="fila fin">${nuevo ? "" : `<button class="btn r" id="cB" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="cX">Cancelar</button><button class="btn p" id="cOk">Guardar</button></div>`, v => {
    v.querySelector("#cX").onclick = cerrarDlg;
    v.querySelector("#cOk").onclick = () => { if (!val("cT").trim()) return toast("Escriba los acuerdos."); Object.assign(c, { f: val("cF") || hoy(), con: val("cC").trim(), txt: val("cT").trim() }); if (nuevo) { c.id = uid(); a.acuerdos.push(c); } guardar(); cerrarDlg(); re(); };
    v.querySelector("#cB") && (v.querySelector("#cB").onclick = () => { a.acuerdos = a.acuerdos.filter(x => x !== c); guardar(); cerrarDlg(); re(); }); }); }

/* ---------- Tlami: redacción profesional sin datos personales ---------- */
function espSinNombre(a, t) { let s = String(t || ""); String(a.nombre || "").split(/\s+/).filter(x => x.length > 2).forEach(p => { s = s.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "N."); });
  [a.docs.ficha && a.docs.ficha.tutor, a.docente].filter(Boolean).forEach(n => String(n).split(/\s+/).filter(x => x.length > 3 && /^[A-ZÁÉÍÓÚÑ]/.test(x)).forEach(p => { s = s.replace(new RegExp(p, "g"), "…"); })); return s; }
async function espTlami(a, k) { const Dc = ESP_DOCS[k], v = a.docs[k] = a.docs[k] || {}, campos = Dc.c.filter(c => c[2] === "a"), vacios = campos.filter(c => !String(v[c[0]] || "").trim());
  const objetivo = vacios.length ? vacios : campos;
  const notas = [["Barreras registradas", a.bap.map(b => `${b.ctx} · ${b.tipo}: ${b.d}${b.acc ? " → " + b.acc : ""}`).join("; ")], ["Acuerdos", a.acuerdos.map(c => c.txt).join("; ")], ["Seguimiento", a.seg.slice(-8).map(s => s.txt).join("; ")]]
    .concat(Object.entries(ESP_DOCS).flatMap(([dk, dd]) => dd.c.filter(c => c[2] === "a" && String((a.docs[dk] || {})[c[0]] || "").trim()).map(c => [dd.t + " · " + c[1], a.docs[dk][c[0]]])))
    .filter(x => String(x[1]).trim()).map(([l, t]) => l + ": " + espSinNombre(a, t)).join("\n").slice(0, 6000);
  if (!notas.trim()) return toast("Primero escriba algunas notas (en la ficha, el contexto, las barreras o el seguimiento) para que Tlami tenga de dónde redactar.", 4500);
  const f = a.docs.ficha || {}, e = espEsc(a.eid);
  tlamiEspera("Redactando con lenguaje profesional, enfoque de barreras y ajustes razonables. No se envía el nombre del alumno.");
  try { let r;
    if (DEMO) { await new Promise(x => setTimeout(x, 900)); r = { campos: Object.fromEntries(objetivo.map(([ck, l]) => [ck, `(Ejemplo de redacción de Tlami para «${l}») A partir de lo observado, N. muestra avances cuando se le anticipan las actividades con apoyos visuales y se le dan instrucciones por pasos. Se recomienda mantener los ajustes acordados con la docente y la familia, y valorar su efecto en las próximas semanas.`])) }; }
    else { const j = await aulaPost("aulaIA", { modo: "especial", doc: Dc.t, campos: objetivo.map(([ck, l]) => ({ k: ck, l })), notas, servicio: espD().servicio, nivel: e ? ({ pre: "preescolar", pri: "primaria", sec: "secundaria" }[e.nivel] || "primaria") : "primaria", grado: a.grado || "", edad: espEdad(f.nac), cond: a.cond || "" }, 110000); r = j.r || {}; }
    const C = r.campos || {}; let n = 0; objetivo.forEach(([ck]) => { if (C[ck]) { v[ck] = String(C[ck]); n++; } }); guardar(); cerrarDlg(); re();
    toast(n ? `Tlami redactó ${n} ${n === 1 ? "apartado" : "apartados"}. Revíselos y ajústelos: usted conoce al alumno.` : "Tlami no pudo redactar esta vez.", 4500); }
  catch (err) { tlamiError(err); } }

/* ---------- documentos para imprimir y Word ---------- */
const espTitDoc = k => (ESP_DOCS[k] || {}).t || { bap: "Registro de barreras para el aprendizaje y la participación", acuerdos: "Acta de acuerdos", seg: "Bitácora de seguimiento" }[k] || "";
function espEnc(a, tit) { const E = espD(), e = espEsc(a.eid);
  return `<table class="enc"><tr><td style="width:90px"><img src="${ISEP}" alt="ISEP"></td><td class="t"><b>${esc(E.nombre || ESP_SERV[E.servicio])}</b><br><span>${E.cct ? "C.C.T. " + esc(E.cct) : ""}${E.zona ? " · " + esc(E.zona) : ""}</span><br><b class="tt">${esc(tit)}</b></td><td style="width:90px;text-align:right">${e && e.cct ? `<img src="${ESC_IMG}${esc(e.cct)}.jpg" onerror="if(!this.dataset.p){this.dataset.p=1;this.src='${ESC_IMG}${esc(e.cct)}.png'}else{this.remove()}" alt="">` : ""}</td></tr></table>`; }
function espDatosAl(a) { const e = espEsc(a.eid), f = (a.docs || {}).ficha || {};
  return `<table><tr><th style="width:24%">Alumna o alumno</th><td colspan="3"><b>${esc(a.nombre)}</b></td></tr><tr><th>Escuela</th><td colspan="3">${esc(e ? e.nombre : espD().nombre)}${e && e.cct ? " · C.C.T. " + esc(e.cct) : ""}</td></tr>
   <tr><th>Grado y grupo</th><td>${esc(espGrado(a))}</td><th style="width:18%">Edad</th><td>${f.nac ? espEdad(f.nac) + " años (" + fLarga(f.nac) + ")" : ""}</td></tr><tr><th>Docente de grupo</th><td>${esc(a.docente || "")}</td><th>Condición</th><td>${esc(a.cond || "")}</td></tr></table>`; }
function espFirmas(k) { const E = espD(), y = D.docente.nombre || yo().nombre, a = espAl(S.id), e = a && espEsc(a.eid);
  const L = k === "acuerdos" || k === "plan" ? [[y, ESP_FUN[E.fun] || "Educación especial"], [a ? a.docente : "", "Docente de grupo"], [e ? e.dir : "", "Dirección de la escuela"], ["", "Madre, padre o tutor"]] : [[y, ESP_FUN[E.fun] || "Educación especial"], [E.dir, "Dirección del servicio"]];
  let h = ""; for (let i = 0; i < L.length; i += 2) h += `<table class="firmas"><tr>${L.slice(i, i + 2).map(([n, c]) => `<td>${esc(n || "")}<br><small>${esc(c)}</small></td>`).join("")}</tr></table>`; return h; }
function espDocHTML(a, k) { const tit = espTitDoc(k); let cuerpo = "";
  if (ESP_DOCS[k]) { const v = (a.docs || {})[k] || {}; cuerpo = `<table>${ESP_DOCS[k].c.map(([ck, l]) => `<tr><th style="width:30%">${esc(l)}</th><td style="white-space:pre-line">${esc(ck === "nac" || ck === "ingreso" ? fLarga(v[ck]) : v[ck] || "")}</td></tr>`).join("")}</table>`; }
  else if (k === "bap") cuerpo = `<table><tr><th>Contexto</th><th>Tipo de barrera</th><th>Descripción</th><th>Acción para eliminarla o reducirla</th></tr>${(a.bap || []).map(b => `<tr><td>${esc(b.ctx)}</td><td>${esc(b.tipo)}</td><td>${esc(b.d)}</td><td>${esc(b.acc || "")}</td></tr>`).join("") || `<tr><td colspan="4">Sin registros.</td></tr>`}</table><p class="nota">Las barreras para el aprendizaje y la participación se identifican en el contexto (escuela, aula, familia y comunidad), no en el alumno.</p>`;
  else if (k === "acuerdos") cuerpo = `<table><tr><th style="width:18%">Fecha</th><th style="width:22%">Participantes</th><th>Acuerdos y compromisos</th></tr>${(a.acuerdos || []).slice().sort((x, y) => x.f.localeCompare(y.f)).map(c => `<tr><td>${fLarga(c.f)}</td><td>${esc(c.con || "")}</td><td style="white-space:pre-line">${esc(c.txt)}</td></tr>`).join("") || `<tr><td colspan="3">Sin acuerdos.</td></tr>`}</table>`;
  else if (k === "seg") { const ag = espD().agenda.filter(x => x.aid === a.id).map(x => ({ f: x.f, txt: x.tipo + (x.txt ? ": " + x.txt : "") })); const L = (a.seg || []).concat(ag).sort((x, y) => x.f.localeCompare(y.f));
    cuerpo = `<table><tr><th style="width:20%">Fecha</th><th>Registro</th></tr>${L.map(s => `<tr><td>${fLarga(s.f)}</td><td style="white-space:pre-line">${esc(s.txt)}</td></tr>`).join("") || `<tr><td colspan="2">Sin registros.</td></tr>`}</table>`; }
  return `<div class="doc">${espEnc(a, tit)}${espDatosAl(a)}<div style="margin-top:10px">${cuerpo}</div><p class="nota">Documento de uso confidencial. Contiene datos personales de una niña, niño o adolescente; resguárdese conforme a la normativa de protección de datos.</p>${espFirmas(k)}</div>`; }
function espWord(html, nombre) { const css = `body{font-family:Arial,sans-serif;font-size:11pt}table{border-collapse:collapse;width:100%;margin:6px 0}th,td{border:1px solid #777;padding:4px 6px;vertical-align:top;text-align:left}th{background:#E8EFEC}table.enc td,table.firmas td{border:0}table.firmas td{border-top:1px solid #111;text-align:center;padding-top:4px}table.firmas{margin-top:40px}.enc img{height:54px}.enc .t{text-align:center}.nota{font-size:9pt;color:#444}`;
  const abs = html.replace(/src="(\.\.\/[^"]+)"/g, (m, u) => `src="${new URL(u, location.href).href}"`);
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(nombre)}</title><style>${css}</style></head><body>${abs}</body></html>`;
  const b = new Blob(["﻿" + doc], { type: "application/msword" }), u = URL.createObjectURL(b), l = document.createElement("a"); l.href = u; l.download = nombre.replace(/[\\/:*?"<>|]+/g, "") + ".doc"; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast("Documento de Word descargado."); }

/* ---------- agenda y bitácora ---------- */
const espItemAg = a => { const e = espEsc(a.eid), al = a.aid && espAl(a.aid); return `<button class="it btnit" data-ag="${a.id}" style="text-align:left"><span class="av" style="font-size:12px">${esc(a.h || "—")}</span><span class="tx"><b>${esc(a.tipo)}</b><small>${e ? esc(e.nombre.replace(/^Escuela\s+(Primaria|Secundaria)\s*/i, "")) : ""}${al ? " · " + esc(al.nombre) : ""}${a.txt ? " · " + esc(a.txt) : ""}</small></span>${ic("lapiz", 15)}</button>`; };
VISTAS.espAgenda = () => { const E = espD(), m = S.am || hoy().slice(0, 7), L = E.agenda.filter(a => a.f.slice(0, 7) === m).sort((a, b) => (b.f + (b.h || "")).localeCompare(a.f + (a.h || ""))), dias = [...new Set(L.map(a => a.f))];
  const [yy, mm] = m.split("-").map(Number), mv = n => { const d = new Date(yy, mm - 1 + n, 1); return iso(d).slice(0, 7); };
  return barra("Educación especial", "Agenda y bitácora") + `<main class="wrap">
   <div class="fila mt" style="justify-content:space-between"><button class="btn s" data-am="${mv(-1)}">${ic("atras", 14)}</button><b>${MES_L[mm - 1]} ${yy}</b><button class="btn s" data-am="${mv(1)}">${ic("sig", 14)}</button></div>
   <div class="fila mt"><button class="btn p" id="xAg">${ic("mas", 16)} Registrar actividad</button><button class="btn" data-v="espReporte">${ic("eval", 15)} Reporte del mes</button></div>
   ${dias.map(d => `<h2 class="sec-t">${fCorta(d)}</h2><div class="lista">${L.filter(a => a.f === d).map(espItemAg).join("")}</div>`).join("") || `<div class="vacio mt">Sin actividades en este mes.</div>`}</main>`; };
ENLAZAR.espAgenda = () => { $$("[data-am]").forEach(b => b.onclick = () => { S.am = b.dataset.am; re(); }); $("#xAg").onclick = () => espDlgAg({}); $$("[data-v]").forEach(b => b.onclick = () => ir(b.dataset.v)); $$("[data-ag]").forEach(b => b.onclick = () => espDlgAg(espD().agenda.find(x => x.id === b.dataset.ag))); };
function espDlgAg(a) { const E = espD(), nueva = !a.id, dsem = new Date().getDay() - 1, eDef = a.eid || (E.escuelas.find(e => (e.dias || []).includes(dsem)) || E.escuelas[0] || {}).id || "";
  const opAl = eid => `<option value="">— Ninguno en particular —</option>` + E.alumnos.filter(x => x.est !== "alta" && (!eid || x.eid === eid)).map(x => `<option value="${x.id}" ${a.aid === x.id ? "selected" : ""}>${esc(x.nombre)}</option>`).join("");
  dlg(`<h3>${nueva ? "Registrar actividad" : "Editar actividad"}</h3>
   <div class="dos"><label class="campo"><span>Fecha</span><input id="gF" type="date" value="${a.f || hoy()}"></label><label class="campo"><span>Hora</span><input id="gH" type="time" value="${a.h || new Date().toTimeString().slice(0, 5)}"></label></div>
   ${E.escuelas.length ? `<label class="campo"><span>Escuela</span><select id="gE" class="sel"><option value="">— ${E.servicio === "cam" ? "En el CAM" : "Sin escuela"} —</option>${E.escuelas.map(e => `<option value="${e.id}" ${eDef === e.id ? "selected" : ""}>${esc(e.nombre)}</option>`).join("")}</select></label>` : ""}
   <label class="campo"><span>Tipo de actividad</span><select id="gT" class="sel">${ESP_ACT.map(t => `<option ${a.tipo === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
   <label class="campo"><span>Alumno <small>· opcional</small></span><select id="gA" class="sel">${opAl(eDef)}</select></label>
   <label class="campo"><span>Descripción breve</span><textarea class="area" id="gX" style="min-height:80px" placeholder="Qué se hizo y con quién.">${esc(a.txt || "")}</textarea></label>
   <div class="fila fin">${nueva ? "" : `<button class="btn r" id="gB" style="margin-right:auto">${ic("basura", 16)}</button>`}<button class="btn" id="gC">Cancelar</button><button class="btn p" id="gOk">Guardar</button></div>`, v => {
    const se = v.querySelector("#gE"); se && (se.onchange = () => { v.querySelector("#gA").innerHTML = opAl(se.value); });
    v.querySelector("#gC").onclick = cerrarDlg;
    v.querySelector("#gOk").onclick = () => { Object.assign(a, { f: val("gF") || hoy(), h: val("gH"), eid: se ? se.value : "", tipo: val("gT"), aid: val("gA"), txt: val("gX").trim() }); if (nueva) { a.id = uid(); E.agenda.push(a); } guardar(); cerrarDlg(); re(); toast("Actividad registrada."); };
    v.querySelector("#gB") && (v.querySelector("#gB").onclick = () => { E.agenda = E.agenda.filter(x => x !== a); guardar(); cerrarDlg(); re(); }); }); }

/* ---------- reporte mensual ---------- */
VISTAS.espReporte = () => { const m = S.am || hoy().slice(0, 7), [yy, mm] = m.split("-").map(Number); return barra("Educación especial", "Reporte mensual") + `<main class="wrap">
  <div class="fila mt" style="justify-content:space-between"><button class="btn s" data-am="${iso(new Date(yy, mm - 2, 1)).slice(0, 7)}">${ic("atras", 14)}</button><b>${MES_L[mm - 1]} ${yy}</b><button class="btn s" data-am="${iso(new Date(yy, mm, 1)).slice(0, 7)}">${ic("sig", 14)}</button></div>
  <div class="fila mt"><button class="btn p" id="rP">${ic("impr", 15)} Imprimir o PDF</button><button class="btn" id="rW">${ic("doc", 15)} Word</button></div>
  <section class="card mt" style="overflow:auto">${espRepHTML(m)}</section></main>`; };
ENLAZAR.espReporte = () => { const m = S.am || hoy().slice(0, 7); $$("[data-am]").forEach(b => b.onclick = () => { S.am = b.dataset.am; re(); }); $("#rP").onclick = () => imprimir(espRepHTML(m)); $("#rW").onclick = () => espWord(espRepHTML(m), "Reporte mensual " + m); };
function espRepHTML(m) { const E = espD(), L = E.agenda.filter(a => a.f.slice(0, 7) === m).sort((a, b) => (a.f + (a.h || "")).localeCompare(b.f + (b.h || ""))), [yy, mm] = m.split("-").map(Number);
  const porT = ESP_ACT.map(t => [t, L.filter(a => a.tipo === t).length]).filter(x => x[1]), porE = [{ id: "", nombre: E.servicio === "cam" ? "En el CAM / sin escuela" : "Sin escuela" }].concat(E.escuelas).map(e => [e.nombre, L.filter(a => (a.eid || "") === e.id).length]).filter(x => x[1]);
  const als = [...new Set(L.map(a => a.aid).filter(Boolean))].map(espAl).filter(Boolean), y = D.docente.nombre || yo().nombre;
  const enc = `<table class="enc"><tr><td style="width:90px"><img src="${ISEP}" alt="ISEP"></td><td class="t"><b>${esc(E.nombre || ESP_SERV[E.servicio])}</b><br><span>${E.cct ? "C.C.T. " + esc(E.cct) : ""}${E.zona ? " · " + esc(E.zona) : ""}</span><br><b class="tt">Reporte mensual de actividades · ${MES_L[mm - 1]} de ${yy}</b></td><td style="width:90px"></td></tr></table>`;
  return `<div class="doc">${enc}<p><b>${esc(y)}</b> · ${esc(ESP_FUN[E.fun] || "")}</p>
   <table><tr><th>Actividades registradas</th><td class="c"><b>${L.length}</b></td><th>Escuelas atendidas</th><td class="c"><b>${porE.filter(x => x[0] && !/^Sin|^En el CAM/.test(x[0])).length}</b></td><th>Alumnos atendidos</th><td class="c"><b>${als.length}</b></td></tr></table>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px"><table><tr><th>Tipo de actividad</th><th class="c">Núm.</th></tr>${porT.map(([t, n]) => `<tr><td>${esc(t)}</td><td class="c">${n}</td></tr>`).join("") || `<tr><td colspan="2">Sin registros</td></tr>`}</table>
   <table><tr><th>Escuela</th><th class="c">Núm.</th></tr>${porE.map(([t, n]) => `<tr><td>${esc(t)}</td><td class="c">${n}</td></tr>`).join("") || `<tr><td colspan="2">Sin registros</td></tr>`}</table></div>
   <h2 style="font-size:12pt;margin-top:12px">Detalle</h2><table><tr><th style="width:16%">Fecha</th><th style="width:22%">Actividad</th><th style="width:22%">Escuela</th><th>Descripción</th></tr>${L.map(a => { const e = espEsc(a.eid), al = a.aid && espAl(a.aid); return `<tr><td>${fCorta(a.f)}${a.h ? " · " + a.h : ""}</td><td>${esc(a.tipo)}</td><td>${esc(e ? e.nombre : "")}</td><td>${al ? "<b>" + esc(al.nombre) + "</b>. " : ""}${esc(a.txt || "")}</td></tr>`; }).join("") || `<tr><td colspan="4">Sin actividades registradas en el mes.</td></tr>`}</table>
   ${espFirmas("rep")}</div>`; }

/* ---------- concentrado ---------- */
VISTAS.espConcentrado = () => { const E = espD(), A = E.alumnos, cond = ESP_COND.map(c => [c, A.filter(a => a.cond === c && a.est !== "alta").length]).filter(x => x[1]);
  const tabla = `<div class="doc"><table class="enc"><tr><td style="width:90px"><img src="${ISEP}" alt="ISEP"></td><td class="t"><b>${esc(E.nombre || ESP_SERV[E.servicio])}</b><br><span>${E.cct ? "C.C.T. " + esc(E.cct) : ""}</span><br><b class="tt">Concentrado de alumnos atendidos · ${fLarga(hoy())}</b></td><td style="width:90px"></td></tr></table>
   <table><tr><th>Escuela</th>${Object.values(ESP_EST).map(v => `<th class="c">${v[0]}</th>`).join("")}<th class="c">Total</th></tr>${[{ id: "", nombre: E.servicio === "cam" ? "CAM / sin escuela" : "Sin escuela" }].concat(E.escuelas).map(e => { const L = A.filter(a => (a.eid || "") === e.id); return L.length ? `<tr><td>${esc(e.nombre)}</td>${Object.keys(ESP_EST).map(k => `<td class="c">${L.filter(a => (a.est || "det") === k).length || ""}</td>`).join("")}<td class="c"><b>${L.length}</b></td></tr>` : ""; }).join("")}</table>
   <h2 style="font-size:12pt;margin-top:12px">Alumnos activos por condición o situación</h2><table><tr><th>Condición o situación</th><th class="c">Alumnos</th></tr>${cond.map(([c, n]) => `<tr><td>${esc(c)}</td><td class="c">${n}</td></tr>`).join("") || `<tr><td colspan="2">Sin alumnos activos.</td></tr>`}</table>
   <h2 style="font-size:12pt;margin-top:12px">Avance de la ruta de atención (alumnos activos)</h2><table><tr><th>Alumno</th><th>Escuela</th>${ESP_RUTA.map(r => `<th class="c" style="font-size:8pt">${r[1].replace(/^\d+\.\s*/, "")}</th>`).join("")}</tr>${A.filter(a => a.est !== "alta").map(a => { const e = espEsc(a.eid); return `<tr><td>${esc(a.nombre)}</td><td style="font-size:8.5pt">${esc(e ? e.nombre.replace(/^Escuela\s+(Primaria|Secundaria)\s*/i, "") : "")}</td>${ESP_RUTA.map(([k]) => { const d = a.docs || {}, ok = k === "bap" ? (a.bap || []).length : k === "acuerdos" ? (a.acuerdos || []).length : k === "seg" ? (a.seg || []).length : Object.values(d[k] || {}).some(x => String(x).trim()); return `<td class="c">${ok ? "✓" : ""}</td>`; }).join("")}</tr>`; }).join("")}</table></div>`;
  return barra("Educación especial", "Concentrado del servicio") + `<main class="wrap"><p class="small muted mt">Resumen de los alumnos registrados en este dispositivo. Útil para la estadística, el CTE y la coordinación con las escuelas y la supervisión.</p>
   <div class="fila mt"><button class="btn p" id="kP">${ic("impr", 15)} Imprimir o PDF</button><button class="btn" id="kW">${ic("doc", 15)} Word</button></div><section class="card mt" style="overflow:auto">${tabla}</section></main>`; };
ENLAZAR.espConcentrado = () => { const h = $(".card .doc").outerHTML; $("#kP").onclick = () => imprimir(h, true); $("#kW").onclick = () => espWord(h, "Concentrado " + hoy()); };

/* ---------- estrategias y ajustes ---------- */
const ESP_ESTR = [
 ["Agenda visual de la jornada", ["TEA", "Conducta", "Organizativas"], "Muestre la secuencia del día con imágenes o pictogramas y marque lo que ya se hizo. Anticipa los cambios y da seguridad."],
 ["Aviso previo de los cambios de actividad", ["TEA", "Conducta"], "Avise un par de minutos antes de cambiar de actividad, con una señal visual y una verbal. Reduce la ansiedad y las crisis en las transiciones."],
 ["Instrucciones por pasos", ["Intelectual", "Atención", "Pedagógicas"], "Dé una instrucción a la vez, con frases cortas, y compruebe que se comprendió antes de dar la siguiente. Apóyela con un ejemplo o un modelo."],
 ["Apoyos visuales para la comprensión", ["TEA", "Auditiva", "Intelectual", "Comunicación"], "Acompañe las explicaciones con imágenes, esquemas, objetos reales o demostraciones. Beneficia a todo el grupo."],
 ["Espacio de calma", ["Conducta", "TEA", "Socioemocional"], "Acuerde un lugar tranquilo del aula al que el alumno pueda ir a regularse por unos minutos, con una tarjeta o señal para pedirlo. No es un castigo."],
 ["Tutoría entre pares", ["Todas", "Actitudinales"], "Forme parejas en las que un compañero apoye al alumno en tareas específicas, rotando los roles para que ambos aprendan y se fortalezca la convivencia."],
 ["Ubicación estratégica en el aula", ["Auditiva", "Visual", "Atención"], "Ubique al alumno donde vea el rostro de quien habla y el pizarrón, con buena iluminación y lejos de distractores y ruido."],
 ["Señas básicas de la Lengua de Señas Mexicana en el grupo", ["Auditiva", "Comunicación", "Actitudinales"], "Enseñe al grupo señas básicas (saludos, emociones, rutinas) para que todos puedan comunicarse con el alumno sordo; involucre a la familia."],
 ["Materiales en macrotipo, braille o audio", ["Visual"], "Amplíe la letra, aumente el contraste o gestione materiales en braille y en audio. Describa en voz alta lo que se escribe o se muestra."],
 ["Material concreto y manipulable", ["Intelectual", "Aprendizaje", "Pedagógicas"], "Use objetos reales, regletas, fichas o maquetas antes de pasar a representaciones gráficas y simbólicas."],
 ["Diversificar la forma de responder", ["Todas", "Pedagógicas", "Motriz"], "Permita mostrar lo aprendido de forma oral, con dibujos, señalando, con tarjetas o con dispositivos, no solo por escrito."],
 ["Tiempo adicional y tareas fraccionadas", ["Aprendizaje", "Atención", "Motriz", "Intelectual"], "Dé más tiempo o divida la tarea en partes más cortas con pausas. Evalúe lo esencial del aprendizaje."],
 ["Accesibilidad física del aula y la escuela", ["Motriz", "Físicas"], "Asegure rutas libres de obstáculos, rampas, mobiliario adaptado y que las actividades se realicen en espacios accesibles, también en emergencias."],
 ["Adaptadores para escritura y manipulación", ["Motriz"], "Engrose lápices, use fijadores de hoja, tijeras adaptadas o teclados; acuerde con la familia y, si hay, con terapia física."],
 ["Comunicación aumentativa y alternativa", ["Comunicación", "TEA", "Múltiple"], "Use tableros de comunicación con pictogramas, tarjetas o aplicaciones para que el alumno pueda pedir, elegir y expresar."],
 ["Rutinas y reglas visibles", ["Conducta", "TEA", "Organizativas"], "Construya con el grupo pocas reglas claras, escritas en positivo y con imágenes, y repáselas con frecuencia."],
 ["Reforzamiento positivo inmediato", ["Conducta", "Atención"], "Reconozca de inmediato y de forma concreta las conductas esperadas («terminaste el primer paso»); es más eficaz que señalar solo lo negativo."],
 ["Enriquecimiento para aptitudes sobresalientes", ["Sobresalientes"], "Proponga retos de mayor profundidad, proyectos de investigación, roles de liderazgo y actividades de su interés, sin aumentar solo la cantidad de tareas."],
 ["Lectura compartida y guiada", ["Aprendizaje", "Pedagógicas"], "Lea con el alumno textos breves de su interés, modelando la lectura, haciendo predicciones y preguntas, antes de pedirle que lea solo."],
 ["Apoyo en la lengua materna", ["Comunicación", "Interculturalidad"], "Si su lengua materna es indígena, use palabras y materiales en esa lengua, apóyese en la familia y en compañeros que la hablen."],
 ["Evaluación con ajustes", ["Todas", "Pedagógicas"], "Ajuste la forma de evaluar (oral, práctica, con apoyos, con más tiempo) sin bajar la expectativa sobre lo esencial; registre avances respecto a sí mismo."],
 ["Planeación con Diseño Universal para el Aprendizaje", ["Todas", "Pedagógicas"], "Planee desde el inicio múltiples formas de presentar la información, de participar y de expresar lo aprendido, para que todo el grupo acceda."],
 ["Sensibilización del grupo y de la comunidad", ["Actitudinales", "Todas"], "Trabaje con el grupo y las familias la valoración de la diversidad, el lenguaje respetuoso y el rechazo a la discriminación y las burlas."],
 ["Reunión de planeación con el docente de grupo", ["Organizativas", "Todas"], "Acuerde con el docente un momento breve y periódico para planear juntos los ajustes del proyecto, no solo para revisar al alumno."],
 ["Cuaderno o mensaje de comunicación con la familia", ["Familia"], "Use un cuaderno de ida y vuelta o mensajes breves para compartir logros del día y acuerdos, y para conocer lo que pasa en casa."],
 ["Taller para familias", ["Familia"], "Organice encuentros breves con familias para compartir estrategias prácticas (rutinas, lectura en casa, autonomía) y escuchar sus inquietudes."],
 ["Autonomía en hábitos de la vida diaria", ["Intelectual", "Múltiple", "TEA"], "Incluya en las actividades pasos para la autonomía (guardar sus cosas, higiene, pedir ayuda) con apoyos visuales y práctica constante."],
 ["Pausas activas y movimiento", ["Atención", "Conducta"], "Programe pausas breves con movimiento entre actividades; dé al alumno tareas que impliquen moverse con propósito (repartir material)."],
 ["Anticipación de evaluaciones y eventos", ["TEA", "Socioemocional"], "Avise con tiempo y explique cómo será un examen, una ceremonia o un cambio de rutina; ensáyelo si es posible."],
 ["Canalización y trabajo con otras instituciones", ["Familia", "Organizativas"], "Cuando se requiera valoración médica, terapia o apoyo social, oriente a la familia y coordine con salud, DIF o CRIT, con su autorización."]
];
VISTAS.espEstrategias = () => { const tags = [...new Set(ESP_ESTR.flatMap(x => x[1]))].sort(), f = S.xt || "";
  return barra("Educación especial", "Estrategias y ajustes") + `<main class="wrap"><p class="small muted mt">Ideas para el plan de intervención y para compartir con el docente de grupo. Ajústelas a cada alumno y a su contexto.</p>
   <div class="chips mt"><button class="chip" data-xt="" aria-pressed="${!f}">Todas</button>${tags.map(t => `<button class="chip" data-xt="${esc(t)}" aria-pressed="${f === t}">${esc(t)}</button>`).join("")}</div>
   <div class="lista mt">${ESP_ESTR.map((x, i) => [x, i]).filter(([x]) => !f || x[1].includes(f)).map(([x, i]) => `<section class="card" style="padding:12px"><b>${esc(x[0])}</b><p class="small mt">${esc(x[2])}</p><p class="small muted mt">${x[1].map(esc).join(" · ")}</p>${espD().alumnos.length ? `<button class="btn s mt" data-xp="${i}">${ic("mas", 14)} Agregar al plan de un alumno</button>` : ""}</section>`).join("")}</div></main>`; };
ENLAZAR.espEstrategias = () => { $$("[data-xt]").forEach(b => b.onclick = () => { S.xt = b.dataset.xt; re(); });
  $$("[data-xp]").forEach(b => b.onclick = () => { const x = ESP_ESTR[+b.dataset.xp], L = espD().alumnos.filter(a => a.est !== "alta");
    dlg(`<h3>Agregar «${esc(x[0])}»</h3><label class="campo"><span>Alumno</span><select id="xA" class="sel">${L.map(a => `<option value="${a.id}">${esc(a.nombre)}</option>`).join("")}</select></label><label class="campo"><span>Apartado del plan</span><select id="xK" class="sel">${ESP_DOCS.plan.c.filter(c => c[2] === "a").map(c => `<option value="${c[0]}" ${c[0] === "ajMet" ? "selected" : ""}>${esc(c[1])}</option>`).join("")}</select></label><div class="fila fin"><button class="btn" id="xX">Cancelar</button><button class="btn p" id="xOk">Agregar</button></div>`, v => {
      v.querySelector("#xX").onclick = cerrarDlg; v.querySelector("#xOk").onclick = () => { const a = espAl(val("xA")), k = val("xK"); a.docs = a.docs || {}; const p = a.docs.plan = a.docs.plan || {}; p[k] = (p[k] ? p[k].trim() + "\n" : "") + "• " + x[0] + ": " + x[2]; guardar(); cerrarDlg(); toast("Agregado al plan de " + esc(corto(a.nombre)) + "."); }; }); }); };

/* ---------- biblioteca ---------- */
const ESP_BUSCA = t => "https://www.google.com/search?q=" + encodeURIComponent(t);
const ESP_BIB = [
 ["Normativa", [["Ley General de Educación (capítulo VIII, De la educación inclusiva, arts. 61 a 68)", "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGE.pdf", "Cámara de Diputados"],
   ["Ley General para la Inclusión de las Personas con Discapacidad", "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGIPD.pdf", "Cámara de Diputados"],
   ["Ley General de los Derechos de Niñas, Niños y Adolescentes", "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGDNNA.pdf", "Cámara de Diputados"],
   ["Constitución Política (arts. 1o, 3o y 4o)", "https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf", "Cámara de Diputados"],
   ["Convención sobre los Derechos de las Personas con Discapacidad (ONU)", ESP_BUSCA("Convención sobre los Derechos de las Personas con Discapacidad texto ONU"), "Búsqueda del título"],
   ["Ley General para la Atención y Protección a Personas con la Condición del Espectro Autista", ESP_BUSCA("Ley General para la Atención y Protección a Personas con la Condición del Espectro Autista diputados pdf"), "Búsqueda del título"],
   ["Ley de Atención y Protección a Personas con Autismo para el Estado de Baja California", ESP_BUSCA("Ley de Atención y Protección a Personas con Autismo para el Estado de Baja California"), "Búsqueda del título"]]],
 ["Orientaciones pedagógicas", [["Instrumento de registro de las barreras para el aprendizaje y la participación (SEP, 2024)", "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/08/b6.pdf", "SEP, Educación Básica"],
   ["Estrategia Nacional de Educación Inclusiva", ESP_BUSCA("Estrategia Nacional de Educación Inclusiva SEP pdf"), "Búsqueda del título"],
   ["Pautas del Diseño Universal para el Aprendizaje 3.0 (CAST)", "https://udlguidelines.cast.org/", "CAST"],
   ["Plan de Estudio 2022 (la inclusión como eje articulador)", "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/07/Plan-de-Estudios-Educacion-Basica_digital-2024.pdf", "SEP"],
   ["CTE: «La NEM y la Educación Especial» y demás orientaciones de las sesiones", "https://gestion.cte.sep.gob.mx/", "SEP, sitio del CTE"],
   ["Portal de Educación Especial de la SEP (manuales y lineamientos de los estados)", "https://educacionespecial.sep.gob.mx/", "SEP"]]],
 ["Protección y convivencia", [["Lineamientos contra el acoso escolar (Acuerdo 14/12/23)", "https://dof.gob.mx/nota_detalle.php?codigo=5710684&fecha=07/12/2023", "Diario Oficial de la Federación"],
   ["Lineamientos para erradicar la violencia sexual en educación básica (Acuerdo 17/05/25)", "https://www.dof.gob.mx/nota_detalle.php?codigo=5758814&fecha=30/05/2025", "Diario Oficial de la Federación"],
   ["Escuela libre de violencia: protocolos por entidad", "https://escuelalibredeviolencia.sep.gob.mx/", "SEP"]]]];
VISTAS.espBiblio = () => barra("Educación especial", "Biblioteca y normativa") + `<main class="wrap"><p class="small muted mt">Documentos de consulta para el trabajo de los servicios de educación especial. Cuando no hay un enlace oficial estable, el botón busca el título.</p>
  ${ESP_BIB.map(([g, L]) => `<h2 class="sec-t">${g}</h2><div class="lista">${L.map(([t, u, o]) => `<a class="it btnit" href="${u}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><span class="av">${ic("doc", 18)}</span><span class="tx"><b>${esc(t)}</b><small>${esc(o)}</small></span>${ic("sig", 16)}</a>`).join("")}</div>`).join("")}
  <section class="card mt"><h3>Formatos estatales</h3><p class="small">Los formatos de esta app siguen los documentos de la SEP. Si la Coordinación de Educación Especial de Baja California usa formatos propios, la Supervisión puede ajustarlos para que salgan iguales.</p></section></main>`;

/* aula.js pudo pintar antes de cargar este archivo: se vuelve a pintar */
try { if (ACCESO_OK) pintar(); } catch (e) {}
