/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · MODO DEMOSTRACIÓN (parte 2, se carga después de la app).
   Llena Ulama con un maestro, escuelas, grupos y alumnos FICTICIOS, con planeaciones, clases ya dadas
   (asistencia, retardos, evaluaciones y observaciones) para que se pueda recorrer todo sin capturar nada. */
"use strict";
(function () {
  let semilla = 50; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  const uno = a => a[Math.floor(azar() * a.length)];
  const NOM_H = ["Santiago", "Mateo", "Sebastián", "Leonardo", "Emiliano", "Diego", "Daniel", "Alexander", "Ángel", "Iker", "Gael", "Dylan", "Thiago", "Luis Fernando", "José Ángel", "Kevin", "Jesús", "Carlos", "Adrián", "Héctor", "Julián", "Axel", "Isaac", "Aarón"];
  const NOM_M = ["Sofía", "Valentina", "Regina", "Camila", "María José", "Ximena", "Renata", "Valeria", "Romina", "Victoria", "Natalia", "Ana Paula", "Fernanda", "Abril", "Danna", "Itzel", "Mía", "Daniela", "Andrea", "Guadalupe", "Paola", "Melanie", "Alexa", "Yaretzi"];
  const AP = ["García", "Hernández", "López", "Martínez", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Cruz", "Flores", "Gómez", "Morales", "Vázquez", "Reyes", "Jiménez", "Torres", "Díaz", "Gutiérrez", "Ruiz", "Mendoza", "Aguilar", "Ortiz", "Castillo", "Romero", "Herrera", "Medina", "Chávez", "Ríos", "Vargas", "Silva", "Castro", "Ramos", "Domínguez", "Salazar", "Navarro"];
  const alumnoNom = () => `${uno(AP)} ${uno(AP)} ${azar() < .5 ? uno(NOM_H) : uno(NOM_M)}`;

  const ESC = [
    { nombre: "Esc. Prim. Benito Juárez", cct: "02DPR9901A", turno: "Matutino", zona: "999", localidad: "Colonia Las Flores", dias: [1, 3], dirTrato: "Mtra.", director: "Rosa María Delgado Fuentes", correo: "direccion.benitojuarez@ejemplo.mx", supEF: "Mtro. Ricardo Soto Lara", supCorreo: "supervision.ef@ejemplo.mx",
      grupos: [[1, "A", "Mtra. Laura Peña Ochoa"], [2, "A", "Mtra. Gabriela Ibarra Luna"], [3, "A", "Mtro. Óscar Villa Campos"], [4, "A", "Mtra. Claudia Mora Rubio"], [5, "A", "Mtro. Jorge Lugo Serna"], [6, "A", "Mtra. Patricia Rivas Cano"]], hora: ["08:00", "08:50", "09:40", "10:30", "11:20", "12:10"] },
    { nombre: "Esc. Prim. Niños Héroes", cct: "02DPR9902B", turno: "Vespertino", zona: "999", localidad: "Ejido El Mirador", dias: [2, 4], dirTrato: "Mtro.", director: "Alberto Quintero Salas", correo: "direccion.ninosheroes@ejemplo.mx", supEF: "Mtro. Ricardo Soto Lara", supCorreo: "supervision.ef@ejemplo.mx",
      grupos: [[3, "A", "Mtra. Karla Acosta Valle"], [3, "B", "Mtro. Raúl Bernal Cota"], [5, "A", "Mtra. Silvia Robles Meza"], [5, "B", "Mtro. Manuel Osuna Paz"]], hora: ["14:00", "14:50", "15:40", "16:30"] },
    { nombre: "Esc. Prim. Emiliano Zapata (multigrado)", cct: "02DPR9903C", turno: "Matutino", zona: "999", localidad: "Rancho Agua Clara", dias: [5], dirTrato: "Mtro.", director: "Felipe Arce Montaño (encargado)", correo: "direccion.emilianozapata@ejemplo.mx", supEF: "Mtra. Leticia Bravo Ochoa", supCorreo: "supervisora.ef@ejemplo.mx",
      grupos: [[2, "A", "Mtro. Felipe Arce Montaño"], [5, "A", "Mtra. Norma Cuevas Ríos"]], hora: ["09:00", "10:00"] }
  ];
  const CONT = { 3: "Capacidades y habilidades motrices.", 4: "Pensamiento lúdico, estratégico y creativo.", 5: "Interacción motriz." };
  const INSTR = { 3: "rubrica", 4: "escala", 5: "cotejo" };
  const OBS_B = ["Propone estrategias a su equipo y ayuda a los demás.", "Muestra mucho entusiasmo; anima a sus compañeros.", "Coordina muy bien sus movimientos en los desplazamientos.", "Respeta los acuerdos y sabe esperar su turno.", "Mejoró mucho en el control del balón."];
  const OBS_M = ["Le cuesta respetar turnos; se platicó con él/ella.", "Se distrae con facilidad durante las indicaciones.", "Prefiere no participar en juegos de contacto; buscar alternativas.", "Necesita apoyo en el equilibrio estático.", "Se frustra cuando su equipo pierde; trabajar la tolerancia."];

  function sembrar() {
    const D0 = VACIO();
    D0.docente = { trato: "Mtro.", nombre: "Daniel Ruiz Mendoza", correo: "daniel.ruiz@ejemplo.mx", tel: "6460000000" };
    D0.cfg = { bienvenida: true, demo: true, gmail: "daniel.demo@gmail.com", registro: { fecha: new Date().toISOString(), enviado: true, via: "servidor" } };
    const habil = {};
    ESC.forEach(E => { const e = Object.assign({ id: uid(), logo: "", horario: "", horarioNombre: "" }, E); delete e.grupos; delete e.hora; D0.escuelas.push(e);
      E.grupos.forEach(([grado, grupo, docente], i) => { const n = 18 + Math.floor(azar() * 9), nombres = new Set(); while (nombres.size < n) nombres.add(alumnoNom());
        const alumnos = [...nombres].map(nombre => { const a = { id: uid(), nombre, curp: "", alta: CICLO.inicio }; habil[a.id] = .35 + azar() * .6; return a; });
        if (i === 1) alumnos[3].baja = "2026-10-16";
        if (i === 2) { const a = { id: uid(), nombre: alumnoNom(), curp: "", alta: "2026-10-26" }; habil[a.id] = .6; alumnos.push(a); }
        const corr = docente.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^mtr[oa]\.\s*/, "").split(/\s+/).slice(0, 2).join(".") + "@ejemplo.mx";
        D0.grupos.push({ id: uid(), escId: e.id, grado, grupo, docente, correo: corr, dias: e.dias.slice(), horario: E.hora[i], alumnos }); }); });
    D = D0; // crearPlan y fechasClase usan D

    const k = hoy();
    D.escuelas.forEach((e, ei) => { const gs = gruposDe(e.id), porFase = {};
      gs.forEach(g => (porFase[faseDe(g.grado)] = porFase[faseDe(g.grado)] || []).push(g));
      Object.entries(porFase).forEach(([fase, lista]) => { const cont = BANCO_EF[fase].find(c => c.c === CONT[fase]) || BANCO_EF[fase][0];
        const pdas = {}; [...new Set(lista.map(g => g.grado))].sort().forEach(gr => pdas[gr] = (cont.pda || {})[gr] || "");
        const n = e.dias.length === 1 ? 8 : 12, ini = e.dias.length === 1 ? "2026-10-02" : "2026-10-12";
        const p = crearPlan({ escId: e.id, grupos: lista.map(g => g.id), titulo: cont.c.replace(/\.$/, ""), cont: cont.c, pdas, ini, min: 50, n, instr: INSTR[fase], proposito: "Que las y los alumnos mejoren su desempeño motriz jugando en colaboración y con respeto a los acuerdos." });
        D.planes.push(p);
        lista.forEach(g => { const fechas = fechasClase(g, p.ini, p.sesiones.length), al = g.alumnos;
          p.sesiones.forEach((ses, si) => { const f = fechas[si]; if (!f || f >= k) return;
            const c = { id: uid(), fecha: f, ini: g.horario, escId: e.id, grupoId: g.id, asis: {}, ret: {}, planId: p.id, sesId: ses.id, instr: p.instr, evals: {}, obs: {} };
            const crits = p.criterios.filter(x => x.gr === "todos" || x.gr == g.grado), usar = [crits[si % crits.length], crits[crits.length - 1]].filter((x, i, a) => x && a.indexOf(x) === i);
            al.forEach(a => { if ((a.alta && f < a.alta) || (a.baja && f > a.baja)) return; const z = azar();
              const st = z < .05 ? "F" : z < .07 ? "J" : z < .11 ? "R" : "P"; c.asis[a.id] = st;
              if (st === "R") { const [h, m] = g.horario.split(":").map(Number), mm = m + 5 + Math.floor(azar() * 12); c.ret[a.id] = `${String(h + Math.floor(mm / 60)).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`; }
              if (st === "P" || st === "R") { const hb = Math.min(1, habil[a.id] + si * .02);
                const ev = {}; usar.forEach(cr => { const x = Math.max(0, Math.min(1, hb + (azar() - .5) * .35));
                  ev[cr.id] = p.instr === "cotejo" ? { t: "cotejo", v: x > .45 ? 1 : 0 } : { t: p.instr, v: Math.max(1, Math.min(4, Math.round(1 + x * 3))) }; });
                c.evals[a.id] = ev;
                if (azar() < .07) c.obs[a.id] = hb > .65 ? uno(OBS_B) : uno(OBS_M); } });
            D.clases.push(c); }); }); }); });
    D.planes.forEach(p => { if (p.sesiones[0]) p.sesiones[0].nota = "Se realizó en el patio techado por el viento."; });
    lsSet("ulama-tok", "demo-ulama-0000000000");
    guardar(true);
  }
  try { if (!D.cfg.demo) sembrar(); } catch (e) { console.error("No se pudo preparar la demo", e); }
  window.demoListo();
})();
