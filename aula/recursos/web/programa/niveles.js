/* Programa Zona 050 · niveles y motor (sin DOM, se puede probar fuera del navegador) */
(function (root) {
  "use strict";
  // Direcciones: 0 norte, 1 este, 2 sur, 3 oeste
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], LETRA = { N: 0, E: 1, S: 2, W: 3 };

  // ---------- LABERINTO ----------
  // Cada nivel se describe por su tamaño, la casilla de salida y el camino (letras N/E/S/W). Lo demás es pared.
  const LAB = [
    { n: 7, r: 3, c: 1, dir: 1, camino: "EEE", max: 0, caja: ["avanzar"],
      pista: "Arrastra el bloque «avanzar» debajo de «al iniciar» las veces que necesites para llegar a la meta 🏁." },
    { n: 7, r: 4, c: 1, dir: 1, camino: "EENNN", max: 0, caja: ["avanzar", "girar"],
      pista: "Ahora hay que dar vuelta. «Girar» cambia hacia dónde mira el carrito, pero no lo mueve." },
    { n: 9, r: 4, c: 1, dir: 1, camino: "EEEEEEE", max: 3, caja: ["avanzar", "girar", "repetir"],
      pista: "¡Solo puedes usar 3 bloques! Usa «repetir» para no escribir lo mismo muchas veces." },
    { n: 7, r: 5, c: 1, dir: 1, camino: "ENENENEN", max: 6, caja: ["avanzar", "girar", "repetir"],
      pista: "Es una escalera. Fíjate qué pasos se repiten y mételos dentro de «repetir»." },
    { n: 8, r: 6, c: 1, dir: 1, camino: "ENENENENEN", max: 5, caja: ["avanzar", "girar", "hasta"],
      pista: "Si no sabes cuántas veces, usa «repetir hasta llegar a la meta»." },
    { n: 8, r: 6, c: 1, dir: 1, camino: "EEENNNNWWW", max: 5, caja: ["avanzar", "girar", "hasta", "si"],
      pista: "Avanza y, «si hay camino a la izquierda», gira. La computadora revisa en cada paso." },
    { n: 8, r: 6, c: 1, dir: 1, camino: "EENNEENNNWWW", max: 7, caja: ["avanzar", "girar", "hasta", "si", "sisino"],
      pista: "Unas vueltas son a la izquierda y otras a la derecha. Usa «si… si no…» para decidir." },
    { n: 9, r: 7, c: 1, dir: 1, camino: "EEEEEENNWWWWWNNEEEENNWWW", max: 7, caja: ["avanzar", "girar", "hasta", "si", "sisino"],
      pista: "Laberinto grande. Un buen programa sirve para cualquier camino: ¿funciona el del nivel anterior?" },
  ];
  function mapaLab(L) {
    const g = Array.from({ length: L.n }, () => Array(L.n).fill(0));
    let r = L.r, c = L.c; g[r][c] = 1;
    for (const ch of L.camino) { const d = LETRA[ch]; r += DY[d]; c += DX[d]; g[r][c] = 1; }
    return { g, meta: [r, c] };
  }

  // ---------- TORTUGA ----------
  // Programas como árbol: ["av", n] ["gi", "R"|"L", grados] ["rep", n, [...]] ["color", c] ["pluma", "arriba"|"abajo"] ["grosor", n]
  const TOR = [
    { t: "Una línea", x: 200, y: 300, sol: [["av", 150]], caja: ["t_avanzar"],
      pista: "Haz que la tortuga camine para dibujar la línea. Cambia el número para que tenga el largo justo (150)." },
    { t: "Un cuadrado", x: 150, y: 270, sol: [["rep", 4, [["av", 120], ["gi", "R", 90]]]], caja: ["t_avanzar", "t_girar", "repetir"],
      pista: "Un cuadrado tiene 4 lados iguales de 120 y 4 vueltas de 90 grados." },
    { t: "Un triángulo", x: 140, y: 290, sol: [["rep", 3, [["av", 150], ["gi", "R", 120]]]], caja: ["t_avanzar", "t_girar", "repetir"],
      pista: "Tres lados de 150. Para cerrar el triángulo la tortuga gira 120 grados en cada esquina." },
    { t: "Un hexágono", x: 165, y: 270, sol: [["rep", 6, [["av", 70], ["gi", "R", 60]]]], caja: ["t_avanzar", "t_girar", "repetir"],
      pista: "Seis lados de 70. Las vueltas suman 360 grados: ¿cuánto gira en cada esquina?" },
    { t: "Una estrella", x: 125, y: 200, sol: [["gi", "R", 72], ["rep", 5, [["av", 160], ["gi", "R", 144]]]], caja: ["t_avanzar", "t_girar", "repetir"],
      pista: "Primero gira 72 grados. Luego 5 veces: avanza 160 y gira 144." },
    { t: "Una flor", x: 200, y: 200, sol: [["rep", 12, [["rep", 4, [["av", 70], ["gi", "R", 90]]], ["gi", "R", 30]]]], caja: ["t_avanzar", "t_girar", "repetir", "t_color"],
      pista: "Un cuadrado de lado 70, girar 30… ¡12 veces! Un «repetir» dentro de otro «repetir»." },
    { t: "Un rehilete", x: 200, y: 200, sol: [["rep", 8, [["rep", 3, [["av", 90], ["gi", "R", 120]]], ["gi", "R", 45]]]], caja: ["t_avanzar", "t_girar", "repetir", "t_color", "t_grosor"],
      pista: "Triángulos de lado 90 que giran 45 grados cada vez, 8 veces. Ponle colores." },
    { t: "Dibujo libre", x: 200, y: 200, sol: null, caja: ["t_avanzar", "t_girar", "repetir", "t_color", "t_grosor", "t_pluma"],
      pista: "Dibuja lo que quieras: tu casa, tu nombre, una figura inventada. ¡Imprímelo o enséñalo a tu maestro!" },
  ];

  // Recorre un programa en forma de árbol y produce una lista de pasos con el id del bloque (para iluminarlo)
  const LIM = 4000;
  function tortugaPasos(prog, x0, y0) {
    const pasos = []; let x = x0, y = y0, a = 0, pl = true, col = "#0F3B5F", gr = 4, n = 0;
    const corre = lista => { for (const it of lista) { if (++n > LIM) throw new Error("muchos"); const [k] = it;
      if (k === "av") { const d = +it[1] || 0, nx = x + Math.sin(a * Math.PI / 180) * d, ny = y - Math.cos(a * Math.PI / 180) * d; pasos.push({ k: "lin", x1: x, y1: y, x2: nx, y2: ny, pl, col, gr, id: it.id }); x = nx; y = ny; }
      else if (k === "gi") { a = (a + (it[1] === "L" ? -1 : 1) * (+it[2] || 0) + 360) % 360; pasos.push({ k: "gir", a, x, y, id: it.id }); }
      else if (k === "rep") { for (let i = 0; i < Math.min(+it[1] || 0, 360); i++) corre(it[2]); }
      else if (k === "color") { col = it[1]; pasos.push({ k: "nada", id: it.id }); }
      else if (k === "pluma") { pl = it[1] !== "arriba"; pasos.push({ k: "nada", id: it.id }); }
      else if (k === "grosor") { gr = Math.max(1, Math.min(30, +it[1] || 1)); pasos.push({ k: "nada", id: it.id }); } } };
    corre(prog); return pasos;
  }

  // Simula un programa del laberinto (árbol: ["av"] ["gi","L"|"R"] ["rep",n,[...]] ["hasta",[...]] ["si",lado,[...]] ["sisino",lado,[...],[...]])
  function laberintoPasos(prog, L) {
    const { g, meta } = mapaLab(L); let r = L.r, c = L.c, d = L.dir, n = 0; const pasos = [];
    const libre = (rr, cc) => rr >= 0 && cc >= 0 && rr < L.n && cc < L.n && g[rr][cc] === 1;
    const hay = lado => { const dd = (d + (lado === "L" ? 3 : lado === "R" ? 1 : 0)) % 4; return libre(r + DY[dd], c + DX[dd]); };
    const FIN = {};
    const corre = lista => { for (const it of lista) { if (++n > LIM) { pasos.push({ k: "lento" }); throw FIN; } const [k] = it;
      if (k === "av") { const nr = r + DY[d], nc = c + DX[d]; if (!libre(nr, nc)) { pasos.push({ k: "choque", r, c, d, id: it.id }); throw FIN; } r = nr; c = nc; pasos.push({ k: "mov", r, c, d, id: it.id }); if (r === meta[0] && c === meta[1]) { pasos.push({ k: "meta" }); throw FIN; } }
      else if (k === "gi") { d = (d + (it[1] === "L" ? 3 : 1)) % 4; pasos.push({ k: "gir", r, c, d, id: it.id }); }
      else if (k === "rep") { for (let i = 0; i < Math.min(+it[1] || 0, 100); i++) corre(it[2]); }
      else if (k === "hasta") { while (true) { const antes = n; corre(it[1]); if (n === antes) { n += 50; if (n > LIM) { pasos.push({ k: "lento" }); throw FIN; } } } }
      else if (k === "si") { pasos.push({ k: "nada", id: it.id }); if (hay(it[1])) corre(it[2]); }
      else if (k === "sisino") { pasos.push({ k: "nada", id: it.id }); corre(hay(it[1]) ? it[2] : it[3]); } } };
    try { corre(prog); pasos.push({ k: "corto" }); } catch (e) { if (e !== FIN) throw e; }
    return pasos;
  }

  root.Z050P = { LAB, TOR, mapaLab, tortugaPasos, laberintoPasos, DX, DY };
})(typeof window !== "undefined" ? window : globalThis);
