/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Tlamatini Aula.
   MODO CAPACITACIÓN (#capacitacion): carga sola los 14 grupos de las escuelas de la Zona 050 con alumnos ficticios,
   pase de lista, planeaciones con sesiones dadas y evaluadas, exámenes calificados y lectura de la realidad.
   Las fechas se calculan a partir del día en que se abre, para que siempre se vea «al día».
   Se guarda aparte (clave aula-cap): nunca toca los datos reales ni los de la demostración. */
"use strict";
async function capSembrar() { try { const ap = document.getElementById("app"); if (ap) ap.innerHTML = `<p style="margin-top:40vh;text-align:center;color:#6A5C4C">Preparando los datos de capacitación de la Zona 050…</p>`;

  let sd = 20261122; const rnd = () => { sd = (sd * 1103515245 + 12345) % 2147483648; return sd / 2147483648; };
  const pick = L => L[Math.floor(rnd() * L.length)];
  let n = 0; const id = p => p + (++n).toString(36) + Math.floor(rnd() * 1e6).toString(36);
  const pda = await programa(); await calendario();
  const ESC = [
    // nombre, cct, mun, loc, dom, dir, cargo, turno, grados, grupo
    ["Belisario Domínguez", "02DPR0210Z", "San Quintín", "Camalú", "Carretera Transpeninsular, Camalú, C.P. 22910", "Luis Ángel Bandala Guerrero", "Director", "Matutino", [4], "A"],
    ["Josefa Ortiz de Domínguez", "02DPR0150B", "San Quintín", "Camalú", "Carretera Transpeninsular, Camalú, C.P. 22910", "Carlos Gustavo Domínguez Figueroa", "Director", "Vespertino", [5], "B"],
    ["Niños Héroes", "02DPR0862Z", "San Quintín", "Camalú", "Blvd. Cochimí, Ampliación Capricornio, Camalú, C.P. 22910", "José Feliciano Gutiérrez Valdez", "Director", "Matutino", [2], "A"],
    ["13 de Septiembre", "02DPR0077J", "San Quintín", "Camalú", "Blvd. Cochimí, Ampliación Capricornio, Camalú, C.P. 22910", "Cecilia Gómez Martínez", "Directora", "Vespertino", [6], "A"],
    ["Pdte. Adolfo López Mateos", "02DPR0379E", "San Quintín", "Ej. Mesa de San Jacinto", "Av. Fundadores, Ej. Mesa de San Jacinto, C.P. 22915", "Gilberto Medina Araujo", "Encargado de despacho", "Matutino", [1, 2, 3, 4, 5, 6], ""],
    ["Emiliano Zapata", "02DPR0425Z", "San Quintín", "Ej. Rubén Jaramillo", "Av. Lázaro Cárdenas, Ej. Rubén Jaramillo, C.P. 22915", "Juan Carlos Chávez Bermúdez", "Director", "Matutino", [3], "B"],
    ["Margarita Maza de Juárez", "02DPR0378F", "San Quintín", "Hacienda Sinaloa", "Hacienda Sinaloa, C.P. 22914", "Adriana Valentina Zavala Cruz", "Encargada de despacho", "Matutino", [4, 5, 6], ""],
    ["Maximino Virgen Flores", "02DPR0684N", "Ensenada", "Lic. Gustavo Díaz Ordaz", "Calle Diamante, Lic. Gustavo Díaz Ordaz, C.P. 22916", "Citlali Shugey Nepita Anaya", "Directora", "Matutino", [1], "A"],
    ["José Vasconcelos", "02DPR0014Y", "Ensenada", "Héroes de Chapultepec", "Av. Revolución, Pob. Héroes de Chapultepec, C.P. 22909", "Jesús González Urdiano", "Director", "Matutino", [5], "A"],
    ["James S. Yglesias", "02DPR0593W", "Ensenada", "Punta Colonet", "Calle Benito Juárez, Punta Colonet, C.P. 22909", "Lorena Valdez Rivera", "Directora", "Matutino", [4], "B"],
    ["Luis Donaldo Colosio Murrieta", "02DPR0882N", "Ensenada", "Punta Colonet", "Calle Benito Juárez, Punta Colonet, C.P. 22909", "Efraín López Alvarado", "Encargado de despacho", "Vespertino", [1, 2, 3], ""],
    ["Narciso Mendoza", "02DPR0012Z", "Ensenada", "Ej. Benito Juárez", "Calle Primera, Ej. Benito Juárez, C.P. 22907", "Armando Calderón Hernández", "Encargado de despacho", "Matutino", [1, 2, 3, 4, 5, 6], ""],
    ["Ignacio Allende", "02DPR0556S", "Ensenada", "Ej. Alfredo V. Bonfil", "Carr. Transpeninsular km 120, Ej. Alfredo V. Bonfil, C.P. 22905", "Jesús Aarón Montero Meléndrez", "Encargado de despacho", "Matutino", [1, 2, 3], ""],
    ["José Ma. Pino Suárez", "02DPR0382S", "Ensenada", "Ej. Gral. Rodolfo Sánchez Taboada, San Vicente", "Ej. Gral. Rodolfo Sánchez Taboada, San Vicente, C.P. 22793", "Armando Urzúa Osuna", "Encargado de despacho", "Matutino", [4, 5, 6], ""]];
  const NI = ["Sofía", "Valentina", "Camila", "Ximena", "Regina", "Renata", "Fernanda", "Daniela", "Itzel", "Guadalupe", "Yaretzi", "Citlali", "Mariana", "Abigail", "Natalia", "Andrea", "Jimena", "Paola", "Alondra", "Areli", "Dulce María", "Ana Paula", "Karla", "Zoe"];
  const NO = ["Santiago", "Mateo", "Sebastián", "Leonardo", "Emiliano", "Diego", "Ángel", "Jesús", "Iker", "Gael", "Luis Fernando", "José Manuel", "Juan Pablo", "Alexis", "Brayan", "Kevin", "Uriel", "Isaac", "Daniel", "Adrián", "Christopher", "Eduardo", "Ricardo", "Josué"];
  const AP = ["Hernández", "López", "Martínez", "Ramírez", "Cruz", "Santiago", "García", "Mendoza", "Pérez", "Jiménez", "Vásquez", "Ruiz", "Reyes", "Gómez", "Morales", "Torres", "Flores", "Aguilar", "Sánchez", "Bautista", "Castillo", "Ortiz", "Velasco", "Luna", "Rojas", "Silva", "Juárez", "Cortés", "Guzmán", "Ramos", "Mejía", "Salazar", "Chávez", "Montes", "Acosta", "Zúñiga"];
  const PROY = {
    "Lenguajes": { re: /narraci|descripci|historia/i, t: "Historias y lugares de nuestra comunidad", pr: "Que las y los alumnos recuperen, cuenten y escriban relatos de su familia y su comunidad para compartirlos con otros.", pd: "Libro cartonero de relatos de la comunidad" },
    "Saberes y pensamiento científico": { re: /alimenta/i, t: "¿Qué comemos en casa? Alimentación saludable en el valle", pr: "Que las y los alumnos analicen lo que comen en casa y en la escuela y propongan opciones saludables con productos de la región.", pd: "Recetario saludable con productos de la región" },
    "Ética, naturaleza y sociedades": { re: /actividades humanas|ecosistema|biodiversidad/i, t: "Cuidamos el entorno natural de nuestra comunidad", pr: "Que las y los alumnos identifiquen cómo las actividades de la comunidad afectan el entorno y organicen acciones para cuidarlo.", pd: "Campaña de cuidado del entorno para las familias" },
    "De lo humano y lo comunitario": { re: /comunidad como|convivencia|pertenencia/i, t: "Convivimos en paz en nuestra escuela", pr: "Que las y los alumnos reflexionen sobre cómo se relacionan y construyan acuerdos para convivir mejor en el salón y en el recreo.", pd: "Reglamento de convivencia ilustrado" }
  };
  const MATE = { t: "Mercadito escolar: números, sumas y restas", pr: "Que las y los alumnos resuelvan problemas de compra y venta con los números de su grado.", pd: "Mercadito escolar con precios y cuentas" };
  const CAMPO_EXACTO = c => CAMPOS.find(x => nrm(x) === nrm(c));
  const plan = (g, campo, info, ini, ns, hechas, re) => {
    const fs = [...new Set(g.grados.map(faseDe))], sel = {};
    fs.forEach(f => { const L = PDA_TXT(pda, campo, f); let i = L.findIndex(x => re.test(x.c)); if (i < 0) i = 0; sel[f] = i; });
    const met = Object.keys(METODOS).find(k => METODOS[k].campo === campo) || Object.keys(METODOS)[0];
    const pk = {}; g.grados.forEach(gr => { const f = faseDe(gr), x = PDA_TXT(pda, campo, f)[sel[f]], n = pdaLista(((x || {}).pda || {})[gr]).length; pk[gr] = n > 2 ? [0, 1] : n ? [0] : []; });
    const P = { pk, campo, sel, metodo: met, escenario: pick(["aula", "escolar", "comunitario"]), ejes: [pick(EJES), pick(EJES)].filter((x, i, a) => a.indexOf(x) === i), titulo: info.t, proposito: info.pr, ini, n: ns, min: 50, producto: info.pd };
    const p = crearPlan(g, P, pda); p.id = id("pl"); p.creado = dias[Math.max(0, dias.indexOf(ini) - 3)] || ini;
    p.sesiones.forEach((s, i) => { if (s.fecha && s.fecha <= LIM && i < hechas) s.hecho = true; });
    return p; };
  const Dx = { v: 1, docente: { nombre: "Mtro. Carlos Gabriel Ortega Gutiérrez", correo: "cortegagutierrez@bcedu.mx" }, grupos: [], gact: "", planes: [], exams: [], asis: {}, favs: [], mias: [], reg: [], fotos: [], bol: {}, cfg: {} };
  // días de clase del 19 de octubre al 20 de noviembre
  const T = hoy(), d0 = new Date(); d0.setDate(d0.getDate() - 75); let dias = diasHabiles(iso(d0), 80).filter(k => k < T).slice(-25); if (dias.length < 20) dias = diasHabiles(iso(d0), 25);
  const LIM = dias[dias.length - 1];
  const BANCO = {
    1: [["¿Qué número sigue? 7, 8, 9, …", ["10", "11", "6", "19"], 0], ["Pedro tiene 5 canicas y le regalan 3. ¿Cuántas tiene?", ["7", "8", "2", "9"], 1], ["¿Cuál número es mayor?", ["12", "21", "9", "15"], 1], ["Hay 9 manzanas y se comen 4. ¿Cuántas quedan?", ["4", "5", "6", "13"], 1], ["¿Cuántas decenas tiene el 30?", ["3", "30", "0", "13"], 0], ["10 + 6 =", ["16", "15", "106", "4"], 0]],
    3: [["¿Cuánto es 345 + 128?", ["473", "463", "217", "483"], 0], ["Un costal tiene 250 jitomates y se venden 135. ¿Cuántos quedan?", ["125", "115", "385", "105"], 1], ["¿Cuánto es 6 × 7?", ["36", "42", "48", "13"], 1], ["En 4 cajas hay 8 elotes en cada una. ¿Cuántos elotes hay?", ["12", "24", "32", "36"], 2], ["¿Cómo se escribe «mil doscientos cinco»?", ["1 250", "1 205", "12 005", "1 025"], 1], ["Reparte 20 lápices entre 4 niños. ¿Cuántos le tocan a cada uno?", ["4", "5", "6", "16"], 1]],
    5: [["¿Cuánto es 2 345 + 1 678?", ["4 023", "3 923", "4 013", "3 023"], 0], ["Una caja de fresas pesa 1.5 kg. ¿Cuánto pesan 4 cajas?", ["5.5 kg", "6 kg", "4.5 kg", "6.5 kg"], 1], ["¿Cuál fracción es mayor?", ["1/4", "1/2", "1/8", "1/3"], 1], ["¿Cuánto es 144 ÷ 12?", ["11", "12", "13", "14"], 1], ["Un terreno mide 25 m de largo y 12 m de ancho. ¿Cuál es su área?", ["37 m²", "300 m²", "74 m²", "250 m²"], 1], ["¿Cuál es el 50 % de 80?", ["40", "50", "30", "8"], 0]] };
  const FEX = dias[dias.length - 6];
  const banda = gr => gr <= 2 ? 1 : gr <= 4 ? 3 : 5;
  const CAMPOS_ORDEN = ["Lenguajes", "Saberes y pensamiento científico", "Ética, naturaleza y sociedades", "De lo humano y lo comunitario"].map(CAMPO_EXACTO);
  ESC.forEach((e, k) => {
    const [nom, cct, mun, loc, dom, dir, cargo, turno, grados, grupo] = e;
    const g = { id: id("g"), cct, escuela: "Escuela Primaria «" + nom + "»", turno, grados, grupo, dir, cargoDir: cargo, loc, mun, dom, alumnos: [] };
    const usados = new Set(); const nAl = grados.length === 6 ? 14 : grados.length > 1 ? 15 : 16 + Math.floor(rnd() * 7);
    for (let i = 0; i < nAl; i++) { let nm; do { const f = rnd() < .5; nm = pick(f ? NI : NO) + " " + pick(AP) + " " + pick(AP); } while (usados.has(nm)); usados.add(nm);
      g.alumnos.push({ id: id("a"), nombre: nm, g: grados[grados.length === 1 ? 0 : i % grados.length] }); }
    g.lectura = { sint: `Grupo ${grados.length > 1 ? "multigrado" : "de " + grados[0] + ".°"} de la localidad ${loc} (${mun}). La mayoría de las familias trabaja en los campos agrícolas del valle; varios alumnos son hijos de familias que llegaron de Oaxaca y Guerrero y algunos hablan mixteco o triqui en casa. Son participativos y les gusta el trabajo en equipo y al aire libre. Se observa rezago en lectura de comprensión y en el cálculo mental; hay inasistencias en temporada de cosecha. La escuela cuenta con patio amplio y biblioteca de aula; las familias participan en las faenas y en las festividades de la comunidad.`, problemas: ["Rezago en comprensión lectora", "Cálculo mental y resolución de problemas", "Inasistencia en temporada de cosecha", "Alimentación poco balanceada en el recreo"], nombres: ["lectura-de-la-realidad-" + cct + ".pdf"], fecha: dias[0], sinIA: true };
    Dx.grupos.push(g); const al = g.alumnos;
    // asistencia
    const A = Dx.asis[g.id] = {}; const faltón = new Set(al.filter(() => rnd() < .15).map(a => a.id));
    dias.forEach(d => { const r = A[d] = {}; al.forEach(a => { const x = rnd(), pf = faltón.has(a.id) ? .14 : .04; if (x >= pf) r[a.id] = x < pf + .03 ? "R" : x < pf + .045 ? "J" : "P"; }); });
    // dos planeaciones: una terminada y una en curso
    const c1 = CAMPOS_ORDEN[k % 4], c2 = CAMPOS_ORDEN[(k + 1) % 4];
    const p1 = plan(g, c1, PROY[c1], dias[dias.length - 15], 5, 5, PROY[c1].re);
    const p2 = k % 3 === 0 ? plan(g, CAMPO_EXACTO("Saberes y pensamiento científico"), MATE, dias[dias.length - 4], 6, 4, /suma y resta|números/i) : plan(g, c2, PROY[c2], dias[dias.length - 4], 6, 4, PROY[c2].re);
    Dx.planes.push(p1, p2);
    if (k % 2 === 0) { const f0 = faseDe(grados[0]), cs = [CAMPOS_ORDEN[(k + 2) % 4], CAMPOS_ORDEN[(k + 3) % 4]].map(c => ({ f: f0, campo: c, c: (PDA_TXT(pda, c, f0)[2 + (k % 5)] || PDA_TXT(pda, c, f0)[0]).c }));
      (Dx.avr = Dx.avr || []).push({ id: id("av"), gid: g.id, fecha: dias[dias.length - 10], src: "guia", t: "Guía de editorial · " + grados[0] + ".° grado, lecciones 8 a 11", fotos: [], conts: cs }); }
    // evaluación de las sesiones hechas
    const nivel = {}; al.forEach(a => nivel[a.id] = 1.8 + rnd() * 2.2);
    [p1, p2].forEach(p => p.sesiones.forEach((s, i) => { if (!s.hecho) return; const r = { id: id("r"), pid: p.id, gid: g.id, ses: i, fecha: s.fecha, campo: p.campo, al: {}, obs: {} };
      al.forEach(a => { if (A[s.fecha] && !A[s.fecha][a.id]) return; const cs = critsDe(p, a); r.al[a.id] = {}; cs.forEach(c => { r.al[a.id][c.i] = Math.max(1, Math.min(4, Math.round(nivel[a.id] + (rnd() - .5) * 1.2 + i * .08))); }); });
      const o = pick(al); r.obs[o.id] = pick(["Participó con entusiasmo y ayudó a sus compañeros de equipo.", "Le costó concentrarse; con apoyo logró terminar la actividad.", "Explicó con sus palabras lo que aprendió al grupo.", "Trajo información de su casa para compartir con el grupo."]);
      Dx.reg.push(r); }));
    // examen de matemáticas (evaluación rápida) del grado mayor del grupo
    const gr = grados[grados.length - 1], cs = PDA_TXT(pda, "Saberes y pensamiento científico", faseDe(gr)).map(c => ({ c: c.c, pdas: [((c.pda || {})[gr]) || ""].filter(Boolean) })).filter(c => c.pdas.length && /números|suma|multiplicación/i.test(c.c)).slice(0, 2);
    const ex = { id: id("ex"), gid: g.id, tipo: "parcial", area: CAMPO_EXACTO("Saberes y pensamiento científico"), grado: gr, nivel: "prim", titulo: "Examen parcial de matemáticas · " + gr + ".°", fecha: FEX, dif: "mixto", conts: cs.length ? cs : [{ c: "Estudio de los números.", pdas: [""] }],
      inst: "Lea con atención cada pregunta antes de contestar. Conteste con lápiz o pluma y cuide su letra.", rx: BANCO[banda(gr)].map(([t, o, ok]) => ({ id: id("x"), tipo: "om", txt: t, cont: 0, ops: o, ok })), res: {}, creado: dias[dias.length - 8] };
    al.filter(a => a.g === gr).forEach(a => { if (rnd() < .06) { ex.res[a.id] = { v: "A", aus: true, p: {}, f: FEX }; return; } const p = {}; ex.rx.forEach(r => p[r.id] = rnd() < (.35 + nivel[a.id] * .15) ? 1 : 0); ex.res[a.id] = { v: rnd() < .5 ? "A" : "B", aus: false, p, f: FEX }; });
    Dx.exams.push(ex);
  });
  Dx.gact = Dx.grupos[0].id;
  Dx.favs = DINAMICAS.slice(0, 40).filter((x, i) => i % 7 === 0).map(x => x.id);
  const nuevo = Object.assign(VACIO(), Dx); D = nuevo; guardar(); if (!S.v || S.v === "bienvenida") S = { v: "inicio" }; pintar(); } catch (e) { console.error("No se pudo preparar la capacitación", e); toast("No se pudieron preparar los datos de capacitación. Conéctese a internet y recargue."); } }
