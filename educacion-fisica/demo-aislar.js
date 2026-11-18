/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · MODO DEMOSTRACIÓN (parte 1, se carga antes que la app).
   - Aísla el almacenamiento: todo lo que guarde la demo lleva el prefijo «demo:», así nunca toca los datos reales de Ulama.
   - Simula el servidor: no se envía ningún correo, no se conecta Google y no se pide enlace de acceso. */
"use strict";
(function () {
  const P = "demo:", sp = Storage.prototype, g = sp.getItem, s = sp.setItem, r = sp.removeItem;
  sp.getItem = function (k) { return g.call(this, P + k); };
  sp.setItem = function (k, v) { return s.call(this, P + k, v); };
  sp.removeItem = function (k) { return r.call(this, P + k); };
  window.ULAMA_DEMO = true;
  window.demoReiniciar = function () { for (const st of [localStorage, sessionStorage]) { const ks = []; for (let i = 0; i < st.length; i++) { const k = st.key(i); if (k && k.startsWith(P)) ks.push(k); } ks.forEach(k => r.call(st, k)); } location.reload(); };
  let listo; window.DEMO_LISTO = new Promise(ok => listo = ok); window.demoListo = () => listo();
  const json = o => new Response(JSON.stringify(o), { status: 200, headers: { "Content-Type": "application/json" } });
  const f0 = window.fetch.bind(window);
  window.fetch = async function (url, op) {
    const u = String(url && url.url || url), metodo = (op && op.method || "GET").toUpperCase();
    if (/(^|\/)acceso\.json/.test(u) && !/formatos-ppie/.test(u)) { await window.DEMO_LISTO; return json({ activo: false, generacion: 1, enlaces: [] }); }
    if (/formatos-ppie\/formatos\/acceso\.json/.test(u)) return json({ tequio: "https://demo.invalid/servidor" });
    if (metodo !== "GET" || /googleapis\.com|script\.google\.com|demo\.invalid|api\.github\.com/.test(u)) {
      setTimeout(() => { const t = document.getElementById("toast"); if (t) { t.innerHTML = "<b>Modo demostración:</b> no se envió nada de verdad."; t.classList.add("ver"); setTimeout(() => t.classList.remove("ver"), 3200); } }, 3700);
      return json({ ok: true, demo: true });
    }
    return f0(url, op);
  };
})();
