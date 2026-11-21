/* Tlamatini · Vincular celular ↔ computadora
   La computadora (por ejemplo, una iMac de la escuela) muestra un QR; el maestro lo escanea con su celular
   y los dos dispositivos comparten sus datos de Tlamatini y Tlamatini Aula mientras estén vinculados.
   - Los datos viajan cifrados (AES-GCM). La llave va en el QR y nunca llega al servidor de Tequio.
   - Al desvincular (desde cualquiera de los dos), la computadora borra todo lo del maestro.
   - La computadora también se desvincula sola tras 20 minutos sin uso o 8 horas de vinculación.
   Este archivo lo cargan Tlamatini, Tlamatini Aula y vincular.html (mismo sitio, mismos datos). */
(function () {
  "use strict";
  if (window.TLMVIN) return;
  const YO = document.currentScript && document.currentScript.src || location.href;
  const BASE = new URL("./", YO).href;                     // .../formatos-ppie/
  const PAGINA = BASE + "vincular.html";
  const APPS = { tlamatini: BASE, aula: new URL("../tlamatini-aula/", BASE).href };
  const SES = "vin-ses";
  const EXACTAS = ["tlm-agenda", "tlm-agenda-cfg", "firma-docente", "libro-firmas", "logo-escuela", "libro-visitas", "libro-pases", "logo-zona",
    "libro-visitas-logo", "tlm-tour-visto", "reconocimientos", "rk-mis-disenos", "rk-fondo",
    "tlp-token", "acc-token", "tlm-yo", "tequio.cfg", "tequio-pase", "acc-cache", "tlm-completo", "tlm-ultimo-respaldo"];
  const NO = ["aula-demo", "aula-zona-demo", "aula-pda"];
  const sinc = k => !!k && !k.startsWith("vin-") && (k.startsWith("ppie-") || EXACTAS.includes(k) || (k.startsWith("aula-") && !NO.includes(k)));
  const BASES_IDB = ["tlamatini-docs", "aula"];
  const INACTIVO_MIN = 20, MAX_HORAS = 8;

  /* ---------------- almacenamiento: se anotan los cambios para enviarlos ---------------- */
  const SP = Storage.prototype, oSet = SP.setItem, oDel = SP.removeItem, oGet = SP.getItem;
  let aplicando = false; const sucio = new Set();
  SP.setItem = function (k, v) { oSet.call(this, k, v); if (this === localStorage && !aplicando && S && sinc(k)) { sucio.add(k); pronto(); } };
  SP.removeItem = function (k) { oDel.call(this, k); if (this === localStorage && !aplicando && S && sinc(k)) { sucio.add(k); pronto(); } };
  const lee = k => { try { return oGet.call(localStorage, k); } catch (e) { return null; } };
  const json = (k, d) => { try { const v = lee(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };

  let S = json(SES, null);
  const guardaSes = () => { try { if (S) oSet.call(localStorage, SES, JSON.stringify(S)); else oDel.call(localStorage, SES); } catch (e) {} };

  /* ---------------- servidor de la zona (Tequio) ---------------- */
  let SRV = "";
  async function servidor() {
    if (SRV) return SRV;
    const c = json("acc-cache", null); if (c && c.tequio) return (SRV = c.tequio);
    try { const r = await fetch(BASE + "formatos/acceso.json?t=" + Date.now(), { cache: "no-store" }); const j = await r.json(); if (j && j.tequio) return (SRV = j.tequio); } catch (e) {}
    throw new Error("No se encontró el servidor de la zona. Revise el internet.");
  }
  async function post(accion, datos, ms) {
    const s = await servidor(), ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms || 30000);
    try {
      const r = await fetch(s, { method: "POST", redirect: "follow", signal: ctl.signal, headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion, datos }) });
      const j = await r.json(); if (!j || !j.ok) throw new Error((j && (j.mensaje || j.error)) || "El servidor no respondió."); return j;
    } catch (e) { if (e.name === "AbortError") throw new Error("El servidor tardó demasiado."); if (/Failed to fetch|NetworkError|Load failed/i.test(e.message)) throw new Error("Sin conexión con el servidor de la zona."); throw e; }
    finally { clearTimeout(t); }
  }

  /* ---------------- cifrado ---------------- */
  const aB64 = u8 => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const aB64u = u8 => aB64(u8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const deB64u = s => deB64(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  const azar = n => aB64u(crypto.getRandomValues(new Uint8Array(n)));
  let LLAVE = null;
  async function llave() { if (!LLAVE) LLAVE = await crypto.subtle.importKey("raw", deB64u(S.k), "AES-GCM", false, ["encrypt", "decrypt"]); return LLAVE; }
  const tubo = (u8, t) => new Response(new Blob([u8]).stream().pipeThrough(t)).arrayBuffer();
  async function cifrar(obj) {
    let b = new TextEncoder().encode(JSON.stringify(obj)), z = 0;
    if (window.CompressionStream) { b = new Uint8Array(await tubo(b, new CompressionStream("gzip"))); z = 1; }
    const iv = crypto.getRandomValues(new Uint8Array(12)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await llave(), b);
    return z + "." + aB64(iv) + "." + aB64(new Uint8Array(c));
  }
  async function descifrar(s) {
    const [z, iv, c] = String(s).split(".");
    let b = await crypto.subtle.decrypt({ name: "AES-GCM", iv: deB64(iv) }, await llave(), deB64(c));
    if (z === "1") b = await tubo(new Uint8Array(b), new DecompressionStream("gzip"));
    return JSON.parse(new TextDecoder().decode(b));
  }

  /* ---------------- datos del maestro ---------------- */
  function todo() { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (sinc(k)) o[k] = lee(k); } return o; }
  function aplica(c) {
    aplicando = true;
    try { Object.keys(c || {}).forEach(k => { if (!sinc(k)) return; try { if (c[k] === null) oDel.call(localStorage, k); else oSet.call(localStorage, k, c[k]); } catch (e) {} }); }
    finally { aplicando = false; }
  }
  function borraTodo() {
    aplicando = true;
    try { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (sinc(k)) ks.push(k); } ks.forEach(k => oDel.call(localStorage, k)); }
    finally { aplicando = false; }
    try { sessionStorage.clear(); } catch (e) {}
    return Promise.all(BASES_IDB.map(n => new Promise(ok => { try { const r = indexedDB.deleteDatabase(n); r.onsuccess = r.onerror = r.onblocked = () => ok(); } catch (e) { ok(); } })));
  }
  const tokenPersonal = () => json("tlp-token", "") || json("acc-token", "");
  function nombreMaestro() {
    const y = json("tlm-yo", null); if (y && y.persona && y.persona.nombre) return y.persona.nombre;
    const p = json("ppie-perfil", null); return (p && (p.minombre || p.nombre)) || "";
  }

  /* ---------------- ciclo de sincronización ---------------- */
  let tCiclo = null, tPronto = null, ultUso = Date.now(), ultCambio = Date.now(), corriendo = false;
  function pronto() { clearTimeout(tPronto); tPronto = setTimeout(() => ciclo(), 1500); }
  const pausa = () => (Date.now() - ultCambio > 120000 ? 12000 : 5000) * (document.hidden ? 2 : 1);
  async function subir() {
    if (!sucio.size) return;
    const ks = [...sucio]; sucio.clear(); const c = {}; ks.forEach(k => { c[k] = lee(k); });
    try { const j = await post("vinSubir", { sala: S.sala, dev: S.dev, datos: await cifrar({ c }) }); ultCambio = Date.now(); return j; }
    catch (e) { ks.forEach(k => sucio.add(k)); throw e; }
  }
  async function ciclo() {
    clearTimeout(tCiclo); clearTimeout(tPronto);
    if (!S || corriendo) { if (S) tCiclo = setTimeout(ciclo, 2000); return; }
    corriendo = true; let fin = false;
    try {
      if (S.rol === "pantalla") {
        const quieto = (Date.now() - ultUso) / 60000;
        if (quieto >= INACTIVO_MIN || Date.now() - S.ini > MAX_HORAS * 3600000) { corriendo = false; return terminar(false, "Se desvinculó por falta de uso."); }
        chip(quieto >= INACTIVO_MIN - 2 ? `Se desvinculará en ${Math.max(1, Math.ceil(INACTIVO_MIN - quieto))} min si no se usa` : "");
      }
      await subir();
      const j = await post("vinBajar", { sala: S.sala, dev: S.dev, desde: S.desde || 0, vivo: 1 }, 25000);
      if (!j.existe || j.fin) fin = true;
      else {
        let hubo = false;
        for (const ev of j.eventos || []) { try { const x = await descifrar(ev.datos); aplica(x.c); hubo = true; } catch (e) {} }
        S.desde = j.hasta || S.desde; if (j.quien) S.quien = j.quien; guardaSes();
        if (hubo) { ultCambio = Date.now(); recibido(); }
        estado(true);
      }
    } catch (e) {
      if (/^fin:/.test(e.message)) fin = true; else estado(false);
    }
    corriendo = false;
    if (fin) return terminar(true, S && S.rol === "pantalla" ? "El celular se desvinculó." : "La computadora se desvinculó.");
    tCiclo = setTimeout(ciclo, pausa());
  }

  /* Cambios que llegaron del otro dispositivo: la app se vuelve a abrir para mostrarlos
     (de inmediato si no se está escribiendo; si no, con un aviso). */
  let tRecarga = null;
  function recibido() {
    if (location.href.startsWith(PAGINA)) return;
    const escribiendo = () => { const a = document.activeElement; return a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable); };
    const intenta = () => { clearTimeout(tRecarga); if (document.hidden || (!escribiendo() && Date.now() - ultUso > 8000)) { location.reload(); return; } tRecarga = setTimeout(intenta, 4000); };
    aviso(S.rol === "pantalla" ? "Llegaron cambios del celular." : "Llegaron cambios de la computadora.", "Mostrar", () => location.reload());
    intenta();
  }

  async function terminar(remoto, msg) {
    clearTimeout(tCiclo); clearTimeout(tPronto);
    const s = S; if (!s) return;
    if (!remoto) { try { await subir(); } catch (e) {} try { await post("vinFin", { sala: s.sala }, 10000); } catch (e) {} }
    S = null; LLAVE = null; guardaSes(); sucio.clear(); quitaChip();
    if (s.rol === "pantalla") { await borraTodo(); location.replace(PAGINA + "?fin=" + encodeURIComponent(msg || "Se desvinculó.")); }
    else aviso(msg || "Se desvinculó la computadora. Sus datos siguen en este celular.");
  }

  /* ---------------- interfaz: insignia de vinculación ---------------- */
  const CSS = `.vin-chip{position:fixed;z-index:2147483000;top:10px;right:10px;display:flex;align-items:center;gap:8px;padding:7px 8px 7px 12px;border-radius:999px;background:#1F3A6B;color:#FBF6EC;font:600 13px/1.2 Montserrat,system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);max-width:calc(100vw - 20px)}
  .vin-chip .p{width:9px;height:9px;border-radius:50%;background:#4CC38A;flex:none}.vin-chip.off .p{background:#E8A33D}
  .vin-chip span.t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vin-chip small{display:block;font-weight:500;opacity:.8;font-size:11px}
  .vin-chip button{flex:none;border:0;border-radius:999px;padding:6px 11px;background:#E8A33D;color:#1F2A44;font:700 12px Montserrat,system-ui,sans-serif;cursor:pointer}
  .vin-aviso{position:fixed;z-index:2147483001;left:50%;bottom:22px;transform:translateX(-50%);display:flex;gap:12px;align-items:center;padding:12px 16px;border-radius:14px;background:#13244A;color:#fff;font:500 14px Montserrat,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3);max-width:92vw}
  .vin-aviso button{border:0;border-radius:10px;padding:7px 12px;background:#E8A33D;color:#13244A;font:700 13px Montserrat,system-ui,sans-serif;cursor:pointer}
  @media print{.vin-chip,.vin-aviso{display:none!important}}`;
  function estilos() { if (document.getElementById("vin-css")) return; const s = document.createElement("style"); s.id = "vin-css"; s.textContent = CSS; document.head.appendChild(s); }
  let extra = "";
  function chip(x) {
    if (x !== undefined) extra = x;
    if (!S || !document.body) return; estilos();
    let c = document.getElementById("vin-chip");
    if (!c) { c = document.createElement("div"); c.id = "vin-chip"; c.className = "vin-chip"; c.setAttribute("role", "status"); document.body.appendChild(c); }
    const quien = S.quien ? S.quien.split(" ").slice(0, 2).join(" ") : "";
    const t = S.rol === "pantalla" ? `Vinculada con el celular${quien ? " de " + quien : ""}` : "Vinculado con una computadora";
    c.innerHTML = `<span class="p"></span><span class="t">${esc(t)}${extra ? `<small>${esc(extra)}</small>` : ""}</span><button type="button">${S.rol === "pantalla" ? "Desvincular y borrar" : "Desvincular"}</button>`;
    c.querySelector("button").onclick = () => {
      const q = S.rol === "pantalla" ? "Se desvinculará el celular y se borrarán de esta computadora todos sus datos. ¿Continuar?" : "Se desvinculará la computadora y se borrarán de ella sus datos (en este celular se quedan). ¿Continuar?";
      if (confirm(q)) terminar(false, "Se desvinculó. Sus datos se borraron de esta computadora.");
    };
  }
  function estado(ok) { const c = document.getElementById("vin-chip"); if (c) c.classList.toggle("off", !ok); else chip(); }
  function quitaChip() { const c = document.getElementById("vin-chip"); if (c) c.remove(); }
  function aviso(txt, boton, fn) {
    if (!document.body) return; estilos();
    let a = document.getElementById("vin-aviso"); if (a) a.remove();
    a = document.createElement("div"); a.id = "vin-aviso"; a.className = "vin-aviso"; a.innerHTML = `<span>${esc(txt)}</span>${boton ? `<button type="button">${esc(boton)}</button>` : ""}`;
    document.body.appendChild(a); if (boton) a.querySelector("button").onclick = fn;
    setTimeout(() => a.remove(), 7000);
  }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(t => addEventListener(t, () => { ultUso = Date.now(); if (extra) chip(""); }, { passive: true, capture: true }));
  document.addEventListener("visibilitychange", () => { if (!document.hidden && S) ciclo(); });

  /* ---------------- lo que usa vincular.html ---------------- */
  window.TLMVIN = {
    PAGINA, APPS, activo: () => !!S, rol: () => S && S.rol, tokenPersonal, nombreMaestro, post, azar,
    /* Desde la app: abre la página para vincular (en el celular, con el lector de QR) */
    abrir() { const movil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
      location.href = PAGINA + (movil ? "?escanear=1&" : "?") + "volver=" + encodeURIComponent(location.href.split("#")[0]); },
    /* Computadora: abre una sala y espera al celular */
    async crearSala() { const j = await post("vinCrear", {}); return { sala: j.sala, k: azar(32) }; },
    async esperar(sala, k, alUnir) {
      // Se usa una sesión provisional para descifrar; no se guarda hasta recibir los datos del celular
      S = { sala, k, rol: "pantalla", dev: "pc-" + azar(6), desde: 0, ini: Date.now(), quien: "" }; LLAVE = null;
      const j = await post("vinBajar", { sala, dev: S.dev, desde: 0, vivo: 1 }, 20000);
      if (!j.existe || j.fin) { S = null; throw new Error("El código venció."); }
      if (j.unida && alUnir) alUnir(j.quien || "");
      for (const ev of j.eventos || []) {
        const x = await descifrar(ev.datos);
        if (x && x.completo) {
          await borraTodo(); aplica(x.c);
          S.desde = j.hasta; S.quien = j.quien || x.quien || ""; S.ini = Date.now(); guardaSes();
          return { listo: true, quien: S.quien, app: x.app || "tlamatini" };
        }
      }
      const s = S; S = null; LLAVE = null; return { listo: false, unida: !!j.unida, quien: j.quien || "", _s: s };
    },
    /* Celular: se une a la sala del QR y manda sus datos */
    async unirse(sala, k, app) {
      const tok = tokenPersonal(); if (!tok) throw new Error("sin-enlace");
      if (S) await terminar(false);
      const nombre = nombreMaestro();
      S = { sala, k, rol: "dueno", dev: "cel-" + azar(6), desde: 0, ini: Date.now(), quien: nombre }; LLAVE = null;
      try {
        await post("vinUnir", { sala, tok, nombre });
        const j = await post("vinSubir", { sala, dev: S.dev, datos: await cifrar({ completo: 1, c: todo(), quien: nombre, app: app || "tlamatini" }) }, 60000);
        S.desde = j.seq; guardaSes(); return true;
      } catch (e) { S = null; LLAVE = null; guardaSes(); throw e; }
    },
    terminar: () => terminar(false)
  };

  /* ---------------- arranque ---------------- */
  function arranca() {
    if (!S) return;
    if (S.rol === "pantalla" && Date.now() - (S.ini || 0) > MAX_HORAS * 3600000) { terminar(false, "La vinculación venció."); return; }
    chip(); ciclo();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arranca); else arranca();
})();
