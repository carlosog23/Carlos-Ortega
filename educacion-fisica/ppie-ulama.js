/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · «¿Qué está pasando?»: protocolos del Programa de Protección Integral Escolar (PPIE).
   Usa el mismo apartado de Tlamatini Aula (../tlamatini-aula/ppie-datos.js y ppie.js); aquí solo se le dice
   de qué escuela se trata (el maestro de Educación Física trabaja en varias), sus alumnos y cómo avisar a Tequio.
   Ulama no entra en el aviso automático de la Zona 050: el maestro de Educación Física siempre captura a quién avisar
   (su Dirección, su supervisión de Educación Física y otros contactos) y avisa con los botones de llamar o WhatsApp. */
"use strict";
window.PPA = {
  tlm: "../formatos-ppie/",
  demo: !!window.ULAMA_DEMO,
  docente: () => docNombre(),
  escuelas: () => D.escuelas.map(e => ({ id: e.id, nombre: e.nombre })),
  elegir: id => { D.ppieEsc = id; guardar(true); },
  /* La escuela del caso: la que eligió en la pantalla de protocolos o la que le toca hoy */
  escuela: () => {
    const dia = new Date().getDay(), hoyE = D.escuelas.find(e => D.grupos.some(g => g.escId === e.id && typeof diasGrupo === "function" && diasGrupo(g).includes(dia)));
    const e = escDe(D.ppieEsc) || hoyE || D.escuelas[0] || {}, of = (typeof ESCUELAS_050 !== "undefined" ? ESCUELAS_050 : []).find(x => x[1] === e.cct) || [];
    return { id: e.id, cct: (e.cct || "").toUpperCase(), escuela: e.nombre || "", mun: e.municipio || of[2] || "", dir: dirNombre(e) || of[5] || "", dirTel: e.tel || "",
      supTel: "", supNom: e.supEF || "", grupo: "Educación Física", sinZona: true };
  },
  sinAviso: () => true,
  notaAlumnos: "Ulama no guarda teléfonos de las familias: pida a la Dirección o al docente del grupo el teléfono de emergencia del alumno.",
  alumnos: () => { const e = window.PPA.escuela(); return D.grupos.filter(g => g.escId === e.id).flatMap(g => activos(g).map(a => ({ nombre: a.nombre + " · " + grNom(g), tels: [[a.tutor, a.tel], ["Emergencia", a.telE]] }))); },
  /* Aviso a la Dirección y a la Supervisión por el servidor de Tequio, con el enlace de Ulama */
  post: async (accion, datos) => {
    if (window.ULAMA_DEMO) { await new Promise(r => setTimeout(r, 600)); return accion === "ppieAviso" ? { id: "demo-" + Date.now(), avisados: "Dirección y Supervisión (demostración)" } : {}; }
    const s = await servidor(), tok = tokAcceso(); if (!tok) throw new Error("Abra Ulama con su enlace personal para poder avisar.");
    if (navigator.onLine === false) throw new Error("No hay internet en este momento.");
    const r = await fetch(s, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion, datos: Object.assign({ tok, quien: { nombre: docNombre(), escuela: datos.escuela || "" } }, datos) }) });
    const j = await r.json(); if (!j || !j.ok) throw new Error((j && (j.mensaje || j.error)) || "El servidor no respondió."); return j;
  }
};
