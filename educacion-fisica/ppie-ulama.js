/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · «¿Qué está pasando?»: protocolos del Programa de Protección Integral Escolar (PPIE).
   Usa el mismo apartado de Tlamatini Aula (../tlamatini-aula/ppie-datos.js y ppie.js); aquí solo se le dice
   de qué escuela se trata (el maestro de Educación Física trabaja en varias), sus alumnos y cómo avisar a Tequio. */
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
    const tels = D.ppieTel || {}, yoT = (() => { try { return JSON.parse(localStorage.getItem("tlm-yo") || "null") || {}; } catch (x) { return {}; } })();
    const t = (tels.esc || {})[e.id] || {};
    return { id: e.id, cct: e.cct || "", escuela: e.nombre || "", mun: e.municipio || of[2] || tels.mun || "", dir: dirNombre(e) || of[5] || "", dirTel: t.dir || e.tel || "",
      supTel: tels.sup || (yoT.sup && yoT.sup.tel) || "", supNom: "Supervisión Escolar", grupo: "Educación Física" };
  },
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
/* Teléfono de la Dirección: en Ulama se guarda por escuela */
(function () {
  const orig = () => typeof ppPedirTel === "function" ? ppPedirTel : null;
  window.addEventListener("load", () => { const f = orig(); if (!f) return;
    window.ppPedirTel = function (k) { if (k !== "dir") return f(k); const E = PPA.escuela();
      dlg(`<h3>📞 Teléfono de la Dirección</h3><p class="small muted mb">${esc(E.escuela)}. Se guarda en este celular para llamar con un toque la próxima vez.</p>
        <input id="ppTel" inputmode="tel" placeholder="10 dígitos" value="${esc(E.dirTel)}" style="width:100%">
        <div class="fila fin mt"><button class="btn" id="ptNo">Cancelar</button><button class="btn p" id="ptSi">Guardar y llamar</button></div>`, w => {
        w.querySelector("#ptNo").onclick = cerrarDlg;
        w.querySelector("#ptSi").onclick = () => { const v = w.querySelector("#ppTel").value.trim(); if (v.replace(/\D/g, "").length < 7) return toast("Escriba el teléfono completo.");
          D.ppieTel = D.ppieTel || {}; D.ppieTel.esc = D.ppieTel.esc || {}; D.ppieTel.esc[E.id] = { dir: v }; guardar(true); cerrarDlg(); ppRe(); location.href = ppTelHref(v); }; }); };
  });
})();
