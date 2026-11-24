/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · Supervisión · DEMOSTRACIÓN con el catálogo real de escuelas y maestros (zona041.json).
   - Vence el sábado 28 de noviembre de 2026 a las 23:59 (hora de Baja California).
   - Aísla el almacenamiento (prefijo «demosup:» y otra base de fotos): nunca toca los datos reales de la app.
   - No envía correos ni se conecta a ningún servidor. */
"use strict";
(function () {
  const VENCE = new Date("2026-11-29T07:59:00Z");   // 28 nov 2026, 23:59 en Baja California
  if (Date.now() > VENCE.getTime()) {
    const fin = () => { document.body.innerHTML = '<div style="font:16px/1.5 system-ui,sans-serif;max-width:460px;margin:18vh auto;padding:24px;text-align:center;color:#13244A"><h1 style="font-size:22px">Esta demostración ya terminó</h1><p>Estuvo disponible hasta el sábado 28 de noviembre de 2026. Para más información, comuníquese con la Supervisión Escolar Zona 050.</p></div>'; };
    document.addEventListener("DOMContentLoaded", fin); window.addEventListener("load", fin);
    Storage.prototype.getItem = () => null; Storage.prototype.setItem = () => {}; return;
  }
  const P = "demosup:", sp = Storage.prototype, g = sp.getItem, s = sp.setItem, r = sp.removeItem;
  sp.getItem = function (k) { return g.call(this, P + k); };
  sp.setItem = function (k, v) { return s.call(this, P + k, v); };
  sp.removeItem = function (k) { return r.call(this, P + k); };
  const op = indexedDB.open.bind(indexedDB); indexedDB.open = (n, v) => op(P + n, v);
  window.ULAMA_SUP_DEMO = true;
  window.demoReiniciar = function () { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(P)) ks.push(k); } ks.forEach(k => r.call(localStorage, k)); try { indexedDB.deleteDatabase(P + "ulama-sup"); } catch (e) {} location.reload(); };
  // Primera vez: el catálogo real (16 escuelas y 18 maestros de Educación Física) ya cargado
  if (!localStorage.getItem("ulama-sup")) {
    try { const x = new XMLHttpRequest(); x.open("GET", "zona041.json?t=" + Date.now(), false); x.send(); const c = JSON.parse(x.responseText);
      localStorage.setItem("ulama-sup", JSON.stringify({ v: 1, yo: { trato: "Mtro.", nombre: "Invitado(a)", cargo: "Supervisor(a) de Educación Física", zona: c.zona || "", correo: "", tel: "", firma: "" },
        tok: "", escuelas: c.escuelas || [], maestros: c.maestros || [], visitas: [], permisos: [], cfg: { listo: true, demo: true } }));
    } catch (e) {}
  }
  const json = o => new Response(JSON.stringify(o), { status: 200, headers: { "Content-Type": "application/json" } }), f0 = window.fetch.bind(window);
  window.fetch = async function (url, o) { const u = String(url && url.url || url), m = (o && o.method || "GET").toUpperCase();
    if (/acceso\.json/.test(u)) return json({ tequio: "https://demo.invalid/servidor" });
    if (m !== "GET" || /script\.google\.com|googleapis\.com|demo\.invalid/.test(u)) {
      setTimeout(() => { const t = document.getElementById("toast"); if (t) { t.innerHTML = "<b>Demostración:</b> no se envió nada de verdad."; t.classList.add("ver"); setTimeout(() => t.classList.remove("ver"), 3200); } }, 2500);
      return json({ ok: true, demo: true }); }
    return f0(url, o); };
  if (navigator.serviceWorker) { try { Object.defineProperty(navigator.serviceWorker, "register", { value: () => Promise.resolve() }); } catch (e) {} }
})();
