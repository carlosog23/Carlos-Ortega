/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · MODO SUPERVISIÓN (parte 1, se carga antes que la app).
   Cada maestro que la Supervisión prepara vive en su propio espacio de almacenamiento («prep:<clave>:…»),
   así nunca se mezclan entre sí ni con los datos reales de Ulama en este dispositivo.
   El enlace de administración (GitHub) y el enlace de acceso de la Supervisión sí se comparten. */
"use strict";
(function () {
  const sp = Storage.prototype, g = sp.getItem, s = sp.setItem, r = sp.removeItem;
  const m = (new URLSearchParams(location.search).get("m") || "").replace(/[^\w-]/g, "");
  const P = "prep:" + (m || "_panel") + ":";
  const COMUNES = ["gh-token", "acc-token", "ulama-tok", "ulama-acc-cache"];
  const k2 = k => COMUNES.includes(k) ? k : P + k;
  sp.getItem = function (k) { return this === localStorage ? g.call(this, k2(k)) : g.call(this, k); };
  sp.setItem = function (k, v) { return this === localStorage ? s.call(this, k2(k), v) : s.call(this, k, v); };
  sp.removeItem = function (k) { return this === localStorage ? r.call(this, k2(k)) : r.call(this, k); };
  window.PREP = {
    clave: m,
    real: { get: k => g.call(localStorage, k), set: (k, v) => s.call(localStorage, k, v), del: k => r.call(localStorage, k) },
    llave: (clave, k) => "prep:" + clave + ":" + k,
    borrarTodo(clave) { const pre = "prep:" + clave + ":", ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(pre)) ks.push(k); } ks.forEach(k => r.call(localStorage, k)); }
  };
})();
