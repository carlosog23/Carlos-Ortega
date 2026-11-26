/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   DICTADO POR VOZ (familia Tlamatini)
   · Micrófono en cada cuadro de texto: el docente habla y la app escribe (reconocimiento de voz del navegador, en español de México).
     Si el navegador no reconoce voz (algunos iPhone), graba el audio y la IA de Tequio lo pasa a texto.
   · En los formatos de Tlamatini: «Dicte lo que pasó». El docente cuenta lo ocurrido con sus palabras y la IA (Gemini, por el
     servidor de Tequio, acción dictadoIA) lo acomoda en los campos del formato. Solo llena campos vacíos y nunca inventa datos;
     los campos que llenó quedan marcados para que el docente los revise. Nada de lo dictado se guarda en el servidor. */
(function () {
  "use strict";
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const GRABA = !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const lsg = k => { try { const v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch (e) { try { return localStorage.getItem(k); } catch (_) { return null; } } };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MIC = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/></svg>';

  /* ---------- servidor de Tequio (mismo que usa Tlamatini con el enlace personal) ---------- */
  function servidor() {
    try { if (sessionStorage.getItem("tlm-demo") === "1") return null; } catch (e) {}
    const c = lsg("tequio.cfg"); if (c && c.s && c.k) return { s: c.s, k: c.k };
    const tok = lsg("acc-token") || lsg("tlp-token") || "", s = ((lsg("acc-cache") || {}).tequio) || "";
    return s && tok ? { s, tok } : null;
  }
  function quien() { const p = lsg("ppie-perfil") || {}; return { nombre: String(p.minombre || "").trim(), escuela: String(p.escuela || "").trim(), cct: String(p.cct || "").trim(), cargo: String(p.micargo || "").trim() }; }
  async function post(datos) {
    const sv = servidor(); if (!sv) throw new Error("Para usar la IA abra Tlamatini con su enlace personal.");
    const r = await fetch(sv.s, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ k: sv.k || "", accion: "dictadoIA", datos: Object.assign({ tok: sv.tok || "", quien: quien() }, datos) }) });
    const j = await r.json(); if (!j.ok) throw new Error(j.mensaje || j.error || "El servidor no respondió.");
    return j;
  }
  const aB64 = blob => new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(",")[1] || ""); fr.onerror = () => no(new Error("No se pudo leer la grabación.")); fr.readAsDataURL(blob); });
  const tipoAudio = t => /mp4|aac|m4a/.test(t) ? "audio/mp4" : /ogg/.test(t) ? "audio/ogg" : /wav/.test(t) ? "audio/wav" : "audio/webm";

  /* ---------- escuchar en vivo (navegador) ---------- */
  // onTexto(textoFinal, textoProvisional). Se reinicia solo si el navegador corta por silencio.
  function escuchar(onTexto, onError) {
    const r = new SR(); r.lang = "es-MX"; r.continuous = true; r.interimResults = true;
    let acum = "", vivo = true;
    r.onresult = e => { let prov = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) acum += (acum && !/\s$/.test(acum) ? " " : "") + t.trim(); else prov += t; } onTexto(acum, prov.trim()); };
    r.onerror = e => { if (e.error === "no-speech" || e.error === "aborted") return; vivo = false; onError(e.error); };
    r.onend = () => { if (vivo) { try { r.start(); } catch (e) {} } };
    try { r.start(); } catch (e) { vivo = false; setTimeout(() => onError("start"), 0); }
    return { parar() { vivo = false; try { r.stop(); } catch (e) {} return acum; } };
  }
  /* ---------- grabar audio (respaldo) ---------- */
  async function grabar(maxSeg, onSeg) {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"].find(m => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || "";
    const mr = new MediaRecorder(st, mime ? { mimeType: mime } : undefined), partes = [];
    mr.ondataavailable = e => { if (e.data && e.data.size) partes.push(e.data); };
    let seg = 0, fin; const t = setInterval(() => { seg++; onSeg && onSeg(seg); if (seg >= maxSeg) ctl.parar(); }, 1000);
    const listo = new Promise(ok => { fin = ok; });
    mr.onstop = () => { clearInterval(t); st.getTracks().forEach(x => x.stop()); const b = new Blob(partes, { type: mr.mimeType || mime || "audio/webm" }); fin(b); };
    mr.start(1000);
    const ctl = { parar() { if (mr.state !== "inactive") mr.stop(); return listo; }, cancelar() { partes.length = 0; if (mr.state !== "inactive") mr.stop(); } };
    return ctl;
  }
  const mmss = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  const errVoz = c => c === "not-allowed" || c === "service-not-allowed" ? "Permita el uso del micrófono para esta página (en el candado junto a la dirección) e intente de nuevo." : "No se pudo usar el micrófono" + (navigator.onLine === false ? " sin internet." : ".");
  const juntar = (base, t) => { t = String(t || "").trim(); if (!t) return base; if (!base || /\s$/.test(base)) return base + t; return base + (/[.!?]$/.test(base.trim()) ? " " : " ") + t; };
  const mayus = t => t.replace(/(^|[.!?]\s+)([a-záéíóúñ])/g, (m, a, b) => a + b.toUpperCase());
  const avisar = el => el.dispatchEvent(new Event("input", { bubbles: true }));

  /* ---------- micrófono en cada cuadro de texto ---------- */
  let activo = null;  // solo un micrófono a la vez
  function pararActivo() { if (activo) { const a = activo; activo = null; a(); } }
  function ponerMic(ta) {
    if (ta.dataset.dc || ta.closest("[data-nodict]") || ta.readOnly || ta.disabled || ta.type === "hidden") return;
    if (SR && window.DICT_CAMPOS === false) return;   // Tlamatini ya trae su propio micrófono en cada campo
    if (!SR && !(GRABA && servidor())) return;
    if (ta.dataset.dct) return;
    ta.dataset.dc = "1";
    const w = document.createElement("span"); w.className = "dcw"; ta.parentNode.insertBefore(w, ta); w.appendChild(ta);
    const b = document.createElement("button"); b.type = "button"; b.className = "dc-mic"; b.innerHTML = MIC + "<span></span>";
    b.title = "Dictar: hable y la app escribe"; b.setAttribute("aria-label", "Dictar en este cuadro");
    w.appendChild(b);
    const txt = s => { b.querySelector("span").textContent = s === "Dictar" || s === "Detener" ? "" : s; b.classList.toggle("tx", !!b.querySelector("span").textContent); };
    b.onclick = async () => {
      if (b.classList.contains("on")) { pararActivo(); return; }
      pararActivo();
      const base = ta.value;
      if (SR) {
        let usar = true;
        const ctl = escuchar((fin, prov) => { if (!usar) return; ta.value = juntar(base, fin + (prov ? " " + prov : "")); avisar(ta); },
          code => { quitar(); if (GRABA && servidor() && (code === "service-not-allowed" || code === "network" || code === "start")) { alert("Este navegador no reconoce la voz. Toque «Dictar» otra vez: se grabará su voz y la IA la escribirá."); SRmalo = true; } else alert(errVoz(code)); });
        const quitar = () => { usar = false; b.classList.remove("on"); ta.classList.remove("dc-oye"); txt("Dictar"); };
        b.classList.add("on"); ta.classList.add("dc-oye"); txt("Detener"); ta.focus();
        activo = () => { const fin = ctl.parar(); quitar(); ta.value = mayus(juntar(base, fin)); avisar(ta); ta.dispatchEvent(new Event("change", { bubbles: true })); };
        return;
      }
      // Respaldo: grabar y que la IA lo escriba
      let ctl;
      try { ctl = await grabar(240, s => txt("Detener " + mmss(s))); } catch (e) { alert(errVoz("not-allowed")); return; }
      b.classList.add("on"); ta.classList.add("dc-oye"); txt("Detener 0:00");
      activo = async () => {
        b.classList.remove("on"); ta.classList.remove("dc-oye"); txt("Escribiendo…"); b.disabled = true;
        try { const blob = await ctl.parar(); const j = await post({ modo: "texto", audio: { tipo: tipoAudio(blob.type), data: await aB64(blob) } });
          ta.value = juntar(base, j.texto || ""); avisar(ta); ta.dispatchEvent(new Event("change", { bubbles: true })); }
        catch (e) { alert(e.message || "No se pudo escribir lo que dijo."); }
        finally { b.disabled = false; txt("Dictar"); }
      };
    };
  }
  let SRmalo = false;
  function revisar(raiz) { (raiz || document).querySelectorAll("textarea").forEach(ponerMic); }

  /* ---------- «Dicte lo que pasó»: llenar el formato completo (Tlamatini) ---------- */
  const E = { abierto: false, texto: "", marcados: {}, letra: "" };
  const TIPOS = ["text", "lines", "box", "date", "time", "choice", "select", "pick"];
  function camposDe(A) {
    const out = [];
    (A.steps || []).forEach((st, si) => (Array.isArray(st.fields) ? st.fields : []).forEach(f => {
      const t = f.type || "text"; if (!TIPOS.includes(t) || !f.id) return;
      let actual = S.vals[f.id]; if (actual === undefined || actual === "") { try { actual = preValue(f); } catch (e) { actual = ""; } }
      out.push({ id: f.id, label: f.label || f.id, help: f.help || "", paso: si + 1,
        tipo: t === "lines" || t === "box" ? "narracion" : t === "text" ? "texto" : t === "choice" || t === "select" || t === "pick" ? "opcion" : t === "date" ? "fecha" : "hora",
        opciones: t === "choice" || t === "select" ? f.options.map(o => typeof o === "string" ? o : o.label) : t === "pick" ? f.options.map(o => o.label) : [],
        renglones: t === "lines" ? (f.to || []).length : t === "box" ? 8 : 0, actual: typeof actual === "string" ? actual : "" , _f: f });
    }));
    return out;
  }
  function aplicar(campos, valores) {
    const llenos = [];
    campos.forEach(c => {
      let v = valores[c.id]; if (v == null) return; v = String(v).trim(); if (!v || c.actual) return;
      if (c.tipo === "opcion") { const i = c.opciones.findIndex(o => o.toLowerCase() === v.toLowerCase()); if (i < 0) return; v = c._f.type === "pick" ? c._f.options[i].value : c.opciones[i]; }
      if (c.tipo === "fecha" && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
      if (c.tipo === "hora" && !/^\d{2}:\d{2}$/.test(v)) return;
      S.vals[c.id] = v; llenos.push(c);
    });
    return llenos;
  }
  function formato() {
    try {
      const frm = document.getElementById("frm"); if (!frm || typeof S === "undefined" || S.view !== "step" || typeof ANEXOS === "undefined") return;
      const A = ANEXOS[S.letra]; if (!A) return;
      if (E.letra !== S.letra) { E.letra = S.letra; E.abierto = false; E.texto = ""; E.marcados = {}; }
      // marcas de lo que llenó la IA
      Object.keys(E.marcados).forEach(id => { const el = document.getElementById("f_" + id), fl = el && el.closest(".field"); if (fl) { fl.classList.add("dc-ia"); el.addEventListener("input", () => { fl.classList.remove("dc-ia"); delete E.marcados[id]; }, { once: true }); } });
      const campos = camposDe(A); if (!campos.some(c => c.tipo === "narracion")) return;
      const sv = servidor(), puede = sv && (SR || GRABA);
      const p = document.createElement("div"); p.className = "dc-panel"; p.setAttribute("data-nodict", "");
      p.innerHTML = `<div class="dc-cab"><span class="dc-ico">${MIC}</span><div class="dc-tx"><b>Dicte lo que pasó</b><p>${puede ? "Cuéntelo con sus palabras: qué pasó, cuándo, dónde y quiénes estaban. Tlamatini lo escribe en los campos del formato y usted lo revisa." : sv ? "Su navegador no permite usar el micrófono. Pruebe con Chrome o Safari actualizados." : "Abra Tlamatini con su enlace personal para dictar el formato completo. Mientras tanto puede usar «Dictar» en cada cuadro de texto."}</p></div>${puede ? `<button type="button" class="btn primary dc-ini" id="dcIni">${MIC}<span>${E.abierto ? "Seguir" : "Dictar"}</span></button>` : ""}</div>
       <div class="dc-vivo" id="dcVivo" hidden>
        <textarea id="dcTxt" data-nodict rows="5" placeholder="${SR ? "Aquí va apareciendo lo que dice…" : "Se está grabando su voz. Al terminar, la IA escribe y acomoda lo que dijo."}">${esc(E.texto)}</textarea>
        <div class="dc-fila"><span class="dc-est" id="dcEst"></span><button type="button" class="btn ghost" id="dcPar">Pausar</button><button type="button" class="btn ghost" id="dcCan">Cancelar</button><button type="button" class="btn primary" id="dcOk">Llenar el formato</button></div>
        <p class="help" style="margin:6px 0 0">Puede corregir el texto antes de llenar. Solo se llenan los campos vacíos y no se inventa nada que usted no haya dicho. Lo que dicta no se guarda en el servidor.</p></div>
       <div class="dc-msg" id="dcMsg" hidden></div>`;
      frm.prepend(p);
      if (!puede) return;
      const $ = id => document.getElementById(id), vivo = $("dcVivo"), ta = $("dcTxt"), est = $("dcEst"), par = $("dcPar"), msg = $("dcMsg");
      let ctl = null, grab = null, base = "";
      const estado = (t, on) => { est.innerHTML = (on ? '<i class="dc-pt"></i>' : "") + esc(t); };
      const detener = () => { if (ctl) { E.texto = ta.value = mayus(juntar(base, ctl.parar())); ctl = null; } par.textContent = "Seguir dictando"; estado(SR ? "En pausa" : "", false); };
      const iniciar = async () => {
        pararActivo(); vivo.hidden = false; $("dcIni").hidden = true; msg.hidden = true; E.abierto = true;
        if (SR && !SRmalo) {
          base = ta.value;
          ctl = escuchar((fin, prov) => { ta.value = juntar(base, fin + (prov ? " " + prov : "")); E.texto = ta.value; },
            code => { ctl = null; par.textContent = "Seguir dictando"; estado(errVoz(code), false); if (GRABA && (code === "service-not-allowed" || code === "network" || code === "start")) { SRmalo = true; estado("Su navegador no reconoce la voz: toque «Seguir dictando» para grabarla.", false); } });
          par.textContent = "Pausar"; estado("Escuchando… hable con calma", true); return;
        }
        try { grab = await grabar(300, s => estado("Grabando " + mmss(s) + " (hasta 5 min)", true)); par.hidden = true; estado("Grabando 0:00", true); }
        catch (e) { estado(errVoz("not-allowed"), false); }
      };
      $("dcIni").onclick = iniciar;
      par.onclick = () => { if (ctl) detener(); else iniciar(); };
      ta.oninput = () => { E.texto = ta.value; };
      $("dcCan").onclick = () => { if (ctl) ctl.parar(); ctl = null; if (grab) grab.cancelar(); grab = null; E.texto = ""; E.abierto = false; ta.value = ""; vivo.hidden = true; $("dcIni").hidden = false; $("dcIni").querySelector("span").textContent = "Dictar"; };
      $("dcOk").onclick = async () => {
        if (ctl) detener();
        const datos = { modo: "llenar", formato: (A.pref || ("Anexo " + S.letra)) + ": " + (A.name || ""), uso: A.use || "", campos: campos.map(c => { const o = Object.assign({}, c); delete o._f; return o; }) };
        if (grab) { estado("Preparando la grabación…", false); const blob = await grab.parar(); grab = null; datos.audio = { tipo: tipoAudio(blob.type), data: await aB64(blob) }; if (ta.value.trim()) datos.texto = ta.value.trim(); }
        else { datos.texto = ta.value.trim(); if (datos.texto.length < 15) { estado("Dicte un poco más de lo que pasó para poder llenar el formato.", false); return; } }
        $("dcOk").disabled = true; par.disabled = true; estado("Escribiendo en el formato…", true);
        try {
          if (typeof readStep === "function") readStep();
          const cs = camposDe(A), j = await post(datos), llenos = aplicar(cs, j.valores || {});
          if (j.texto && !ta.value.trim()) E.texto = j.texto;
          llenos.forEach(c => { E.marcados[c.id] = 1; });
          try { store.set("ppie-draft-" + S.letra, { vals: S.vals, step: S.step }); } catch (e) {}
          E.abierto = false;
          const pasos = [...new Set(llenos.map(c => c.paso))].sort((a, b) => a - b);
          E.aviso = llenos.length ? `Listo: se llenaron <b>${llenos.length} campo${llenos.length === 1 ? "" : "s"}</b>${pasos.length ? " en " + (pasos.length === 1 ? "el paso " : "los pasos ") + pasos.join(", ").replace(/, (\d+)$/, " y $1") : ""}. Están marcados en amarillo: revíselos y corrija lo que haga falta antes de imprimir.` : "No encontré en lo que dictó datos para los campos vacíos. Intente contar con más detalle qué pasó, cuándo, dónde y quiénes estaban.";
          stepView();
        } catch (e) { $("dcOk").disabled = false; par.disabled = false; estado(e.message || "No se pudo llenar el formato.", false); }
      };
      if (E.aviso) { msg.innerHTML = E.aviso; msg.hidden = false; E.aviso = ""; }
      if (E.abierto) { vivo.hidden = false; $("dcIni").hidden = true; par.textContent = "Seguir dictando"; estado("En pausa", false); }
    } catch (e) { console.warn("dictado", e); }
  }

  /* ---------- estilos ---------- */
  const css = document.createElement("style");
  css.textContent = `.dcw{display:block;position:relative}.dcw>textarea{padding-right:48px!important}
.dc-mic{position:absolute!important;right:6px;top:6px;width:auto!important;min-width:38px;height:38px;margin:0!important;padding:0 9px!important;border-radius:19px!important;border:0!important;background:transparent!important;color:var(--muted,#6a6258)!important;display:inline-flex!important;align-items:center;justify-content:center;gap:6px;font:600 13px/1 system-ui,sans-serif!important;cursor:pointer;box-shadow:none!important}
.dc-mic:hover,.dc-mic:focus-visible{background:rgba(45,84,145,.1)!important;color:#2D5491!important}
.dc-mic.on{background:#B3261E!important;color:#fff!important}.dc-mic.on svg{animation:dcLat 1s ease-in-out infinite}.dc-mic:disabled{opacity:.7;cursor:wait}.dc-mic span:empty{display:none}
textarea.dc-oye{border-color:#B3261E!important;box-shadow:0 0 0 4px rgba(179,38,30,.14)!important}
@keyframes dcLat{50%{transform:scale(1.18)}}
.dc-panel [hidden]{display:none!important}
.dc-panel{border:1.5px solid #C9D6EC;background:linear-gradient(135deg,#F2F6FC,#FBF7EE);border-radius:16px;padding:14px;margin:0 0 18px}
.dc-cab{display:flex;align-items:center;gap:12px}.dc-ico{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#2D5491;color:#fff}.dc-ico svg{width:22px;height:22px}
.dc-tx{flex:1;min-width:0}.dc-tx b{font-size:16px}.dc-tx p{margin:2px 0 0;font-size:14px;color:var(--muted,#5f574c);line-height:1.4}
.dc-ini{flex:none;display:inline-flex;align-items:center;gap:6px}
.dc-vivo{margin-top:12px}.dc-vivo textarea{width:100%;min-height:120px;box-sizing:border-box;background:#fff}
.dc-fila{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px}.dc-est{flex:1 1 180px;font-size:14px;font-weight:600;color:#2D5491;display:flex;align-items:center;gap:8px}
.dc-pt{width:10px;height:10px;border-radius:50%;background:#B3261E;animation:dcLat 1s ease-in-out infinite;flex:none}
.dc-msg{margin-top:12px;padding:10px 12px;border-radius:12px;background:#FFF4CC;border:1px solid #E8C65A;font-size:14px;line-height:1.45}
.field.dc-ia input,.field.dc-ia textarea,.field.dc-ia select{background:#FFF8DB!important;border-color:#E0B93F!important}
@media (max-width:560px){.dc-cab{flex-wrap:wrap}.dc-ini{width:100%;justify-content:center}}
@media (prefers-reduced-motion:reduce){.dc-mic.on svg,.dc-pt{animation:none}}`;
  document.head.appendChild(css);

  window.DICT = { formato, revisar, disponible: !!(SR || GRABA) };
  const arrancar = () => { revisar(document); new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.tagName === "TEXTAREA") ponerMic(n); else if (n.querySelectorAll) n.querySelectorAll("textarea").forEach(ponerMic); } }).observe(document.body, { childList: true, subtree: true }); };
  if (document.body) arrancar(); else document.addEventListener("DOMContentLoaded", arrancar);
})();
