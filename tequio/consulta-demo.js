/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Tequio.
   Consulta de DEMOSTRACIÓN: la posada con menú, con personas y respuestas FICTICIAS.
   La usan consulta.html#demo (cómo la contesta cada persona; no se guarda nada)
   y Tequio en modo demostración (cómo la Supervisión ve las respuestas). */
"use strict";
window.CNS_DEMO = (function () {
  const PART = [
    ['Mtra. Laura Medina Torres', 'Directora · Belisario Domínguez'], ['Mtro. Ricardo Peña Salazar', 'Director · Josefa Ortiz de Domínguez'],
    ['Mtra. Adriana Fuentes Lara', 'Directora · Niños Héroes'], ['Mtro. Héctor Ibarra Cota', 'Director · 13 de Septiembre'],
    ['Mtra. Sofía Navarro Ruiz', 'Directora · Pdte. Adolfo López Mateos'], ['Mtro. Julián Cárdenas Ochoa', 'Director · Emiliano Zapata'],
    ['Mtra. Gabriela Rosas Mejía', 'Directora · Margarita Maza de Juárez'], ['Mtro. Fernando Lugo Arce', 'Director · Maximino Virgen Flores'],
    ['Mtra. Patricia Silva Montes', 'Directora · José Vasconcelos'], ['Mtro. Arturo Beltrán Félix', 'Director · James S. Yglesias'],
    ['Mtra. Claudia Ortiz Valdez', 'Directora · Luis Donaldo Colosio Murrieta'], ['Mtro. Daniel Cruz Herrera', 'Director · Narciso Mendoza'],
    ['Mtra. Verónica Ruiz Castro', 'Directora · Ignacio Allende'], ['Mtro. Óscar Morales Lima', 'Director · José Ma. Pino Suárez'],
    ['Mtra. Lucía Herrera Sandoval', 'ATP · Mesa Técnica'], ['Mtro. Jorge Villa Ramos', 'ATP · Mesa Técnica'],
    ['Mtra. Rosa Elena Díaz Soto', 'ATP · Mesa Técnica'], ['Mtro. Iván Guerrero Pino', 'ATP · Mesa Técnica'],
    ['Lic. Mariana López Quiroz', 'Apoyo administrativo'], ['Mtro. Samuel Ochoa Reyes', 'Asesor de educación física']
  ];
  const consulta = {
    id: 'demo-posada', codigo: 'DEMO00', estado: 'abierta', puedo: 'ver', acceso: [],
    titulo: 'Posada 2026 · Cuerpo directivo, ATP y Mesa Técnica', fecha: '2026-12-09', hora: '13:00', lugar: 'Posada Don Diego, Vicente Guerrero', cierre: '2026-11-28',
    descripcion: 'Confirme si asistirá y elija su platillo. Todos incluyen agua fresca natural, ensalada verde, pan, totopos y salsa en la mesa, y mantelería.',
    preguntas: [
      { k: 'asiste', t: '¿Asistirá a la posada?', tipo: 'asistencia', req: true },
      { k: 'menu', t: 'Elija su platillo', tipo: 'menu', req: true, serv: 12, ant: 50, antFecha: '2026-11-25', antNota: 'El anticipo es solo para reservar su lugar. El resto del consumo se paga el día de la posada.', op: [
        { t: 'Pechuga de pollo rellena', p: 365, d: 'Rellena de rajas y queso, bañada con salsa de mango sobre espejo de salsa de jamaica. Con puré de papa y verduras al vapor.' },
        { t: 'Pavo tradicional Posada Don Diego', p: 455, d: 'Pavo al horno con gravy, relleno de pavo, puré de papa, verduras al vapor, camote al horno y jalea de arándano.' },
        { t: 'Pescado 3 Mares', p: 435, d: 'Filete relleno de pulpo, camarones y queso crema, bañado con crema de alcaparras. Con arroz y verduras al vapor.' },
        { t: 'Camarones rellenos', p: 445, d: 'Rellenos de queso crema, tocino y espinacas, empanizados con panko. Con arroz y verduras al vapor.' },
        { t: 'Filete miñón prime 350 g', p: 665, d: 'Con gravy y champiñones frescos. Con arroz y verduras al vapor.' },
        { t: 'Carne arrachera', p: 435, d: 'Con arroz, frijoles, chile toreado, oreja de nopal asado, guacamole y tortillas.' },
        { t: 'Rib Mare', p: 445, d: 'Rib eye de 300 g con camarones gratinados. Con puré de papa y verduras salteadas.' },
        { t: 'Pechuga del Pacífico', p: 435, d: 'Rellena de chile poblano tatemado, elote tatemado y queso Oaxaca, sobre espejo de crema de chipotle, con camarones salteados y arroz con verduras.' },
        { t: 'Pechuga Mar y Tierra', p: 445, d: 'Rellena de camarones salteados, espinacas y queso crema, sobre espejo de salsa de vino blanco con limón y perejil. Con puré de papa rústico y verduras al vapor.' },
        { t: 'Pechuga del Valle', p: 445, d: 'Rellena de champiñones y cebolla caramelizada, sobre espejo de crema de ajo rostizado, con camarones salteados, puré de papa y verduras al vapor.' },
        { t: 'Pechuga Toscana', p: 445, d: 'Rellena de verduras salteadas con tocino, bañada en salsa cremosa de queso parmesano. Con puré de papa y verduras al vapor.' }] }],
    participantes: PART.map(([n, d], i) => ({ id: 'p' + (i + 1), n, d }))
  };
  const r2 = n => Math.round(n * 100) / 100;
  function cuenta(p, j) { const o = p.op[j], serv = r2(o.p * (p.serv || 0) / 100), total = r2(o.p + serv), ant = r2(total * (p.ant || 0) / 100);
    return { k: p.k, plato: o.t, precio: o.p, serv, total, anticipo: ant, resto: r2(total - ant) }; }
  /* Respuestas ficticias: 3 sin responder, 2 que no van; los demás eligen platillo y algunos ya dieron anticipo */
  function respuestas() { const menu = consulta.preguntas[1], sinResp = [4, 11, 17], noVan = [7, 15], elige = [1, 0, 5, 1, 0, 3, 1, 2, 7, 1, 8, 5, 4, 1, 0, 9, 6, 1, 10, 5];
    return consulta.participantes.map((p, i) => { if (sinResp.includes(i)) return null; const va = !noVan.includes(i), dia = 12 + (i % 8), h = 8 + (i * 5) % 12, m = (i * 17) % 60;
      const r = { id: 'r' + (i + 1), persona: p.id, fecha: `2026-11-${dia}`, actualizado: `2026-11-${dia}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`, respuestas: { asiste: va ? 'Sí' : 'No' }, datos: {} };
      if (va) { r.respuestas.menu = elige[i]; r.datos = { cuentas: [cuenta(menu, elige[i])], pagado: i % 3 !== 2 && i < 14, pagadoMonto: 0 }; }
      return r; }).filter(Boolean); }
  return { consulta, respuestas, cuenta, zona: { numero: '050', lemaZona: 'Responsabilidad y superación', logoZona: 'img/zona050.png' } };
})();
