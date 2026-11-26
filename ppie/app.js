/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   «¿Qué está pasando?» · Protocolos del Programa de Protección Integral Escolar (PPIE 2026), app independiente
   para quien no usa Tlamatini Aula ni Ulama: docentes, directivos, personal de apoyo y de otras zonas.
   - Usa el mismo apartado de Tlamatini Aula (../tlamatini-aula/ppie-datos.js y ppie.js).
   - Cada quien captura a quién avisar (Dirección, Supervisión y otros contactos); se guarda solo en el celular.
   - Si el celular ya tiene el enlace personal de Tlamatini de la Zona 050, la escuela se toma de ahí y Tequio
     avisa solo a la Dirección y a la Supervisión. Para las demás escuelas no se envía ningún aviso automático. */
"use strict";
const TLM = "../formatos-ppie/";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hoy = () => iso(new Date());
const dF = k => new Date(k + "T12:00:00");
const DSEM = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fCorta = k => { if (!k) return ""; const d = dF(k); return `${DSEM[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}`; };
const corto = n => String(n || "").trim().split(/\s+/).slice(0, 2).join(" ");
const LS = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const ICONOS = { atras: '<path d="M15 18l-6-6 6-6"/>', sig: '<path d="M9 6l6 6-6 6"/>', mas: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12l5 5 9-10"/>',
  basura: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>', persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
  bajar: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>' };
const ic = (n, s = 20) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONOS[n] || ""}</svg>`;

/* ---------------- datos (solo en este dispositivo) ---------------- */
const CLAVE = "ppie-app";
let D = (() => { const x = LS(CLAVE); return Object.assign({ v: 1, yo: { nombre: "", cargo: "" }, ppie: [], ppieCont: {} }, x || {}); })();
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(D)); } catch (e) { toast("<b>No se pudo guardar.</b> El dispositivo no tiene espacio."); } }

/* ---------------- navegación ---------------- */
let S = { v: "inicio" }; const PILA = [];
function ir(v, p = {}, reemplazar) { if (!reemplazar) { PILA.push(S); history.pushState({ n: PILA.length }, ""); } S = Object.assign({ v }, p); pintar(); window.scrollTo(0, 0); }
function atras() { S = PILA.pop() || { v: "inicio" }; pintar(); window.scrollTo(0, 0); }
window.addEventListener("popstate", () => { if ($("#velo")) return cerrarDlg(); if (PILA.length || S.v !== "inicio") atras(); });
const VISTAS = {}, ENLAZAR = {};
function pintar() { cerrarDlg(); const f = VISTAS[S.v] || VISTAS.inicio; $("#app").innerHTML = f(); (ENLAZAR[S.v] || (() => {}))();
  const b = $("#atras"); if (b) b.onclick = () => (PILA.length ? history.back() : (S = { v: "inicio" }, pintar())); }
const re = () => { const y = scrollY; pintar(); scrollTo(0, y); };
const barra = (eb, t, der = "") => `<header class="top"><div class="top-in"><button class="back" id="atras" aria-label="Regresar">${ic("atras")}</button><div style="min-width:0"><div class="eb">${eb}</div><h1>${t}</h1></div><div class="der">${der}</div></div></header>`;
function toast(h, ms = 2800) { const t = $("#toast"); t.innerHTML = h; t.classList.add("ver"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("ver"), ms); }
function dlg(html, alAbrir) { cerrarDlg(); const v = document.createElement("div"); v.className = "velo"; v.id = "velo"; v.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
  v.addEventListener("click", e => { if (e.target === v) cerrarDlg(); }); document.body.appendChild(v); document.body.style.overflow = "hidden"; alAbrir && alAbrir(v); }
function cerrarDlg() { const v = $("#velo"); if (v) v.remove(); document.body.style.overflow = ""; }
function confirmar(msg, si = "Sí, continuar") { return new Promise(ok => dlg(`<h3>¿Seguro?</h3><p class="mb">${esc(msg)}</p><div class="fila fin"><button class="btn" id="qNo">Cancelar</button><button class="btn r" id="qSi">${esc(si)}</button></div>`, v => {
  v.querySelector("#qNo").onclick = () => { cerrarDlg(); ok(false); }; v.querySelector("#qSi").onclick = () => { cerrarDlg(); ok(true); }; })); }
const pie = () => `<p class="pie privado">${ic("check", 14)} Lo que registra aquí se queda en su celular.</p><p class="pie">Programa de Protección Integral Escolar 2026 · SE / ISEP Baja California<br>App de la Supervisión Escolar Zona 050 · ISEP</p><div class="firma-autor"><span>Desarrollada por</span><img src="${TLM}firma-autor.svg" alt="Maestro Carlos Ortega" width="200" height="65"></div>`;

/* ---------------- enlace de la Zona 050 (si el celular ya tiene Tlamatini) ---------------- */
const tok050 = () => LS("tlp-token") || LS("acc-token") || LS("ulama-tok") || "";
const yo050 = () => { const t = LS("tlm-yo"); return t && t.escuelas && t.escuelas.length ? t : null; };
async function servidor050() { try { const r = await fetch(TLM + "formatos/acceso.json?t=" + Date.now(), { cache: "no-store" }); if (r.ok) { const j = await r.json(); if (j.tequio) { localStorage.setItem("ppie-srv", JSON.stringify(j.tequio)); return j.tequio; } } } catch (e) {} return LS("ppie-srv") || ""; }

window.PPA = {
  tlm: TLM, demo: false, pie: () => pie(),
  docente: () => D.yo.nombre || ((yo050() && yo050().persona) ? [yo050().persona.trato, yo050().persona.nombre].filter(Boolean).join(" ") : ""),
  escuelas: () => { const t = yo050(); return t && t.escuelas.length > 1 ? t.escuelas.map(e => ({ id: e.cct, nombre: e.nombre })) : []; },
  elegir: id => { D.esc050 = id; guardar(); },
  escuela: () => { const t = yo050(); if (!t) return { id: "u", cct: "", escuela: "", mun: "", dir: "", dirTel: "", supTel: "", supNom: "", grupo: D.yo.cargo || "" };
    const e = t.escuelas.find(x => x.cct === D.esc050) || t.escuelas[0];
    return { id: e.cct, cct: e.cct, escuela: e.nombre, mun: e.mun || "", dir: e.dir || "", dirTel: e.dirTel || "", supTel: (t.sup && t.sup.tel) || "", supNom: (t.sup && t.sup.nombre) || "", grupo: e.grupo || "" }; },
  sinAviso: () => !tok050() || !yo050(),
  notaAlumnos: "Esta app no guarda datos de alumnos: pida a la Dirección o al docente del grupo el teléfono de emergencia de la familia.",
  alumnos: () => [],
  /* Los anexos: si el celular tiene Tlamatini se abren prellenados; si no, el formato oficial en PDF */
  anexo: (c, L) => { if (LS("tlp-token") || LS("acc-token") || LS("gh-token")) return false; window.open(TLM + "formatos/" + L + ".pdf", "_blank", "noopener"); return true; },
  post: async (accion, datos) => { const s = await servidor050(), tok = tok050(); if (!s || !tok) throw new Error("Sin enlace de la Supervisión.");
    if (navigator.onLine === false) throw new Error("No hay internet en este momento.");
    const r = await fetch(s, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion, datos: Object.assign({ tok, quien: { nombre: D.yo.nombre || (yo050() && yo050().persona && yo050().persona.nombre) || "", escuela: datos.escuela || "" } }, datos) }) });
    const j = await r.json(); if (!j || !j.ok) throw new Error((j && (j.mensaje || j.error)) || "El servidor no respondió."); return j; }
};

/* ---------------- instalar en el celular ----------------
   Android (Chrome): botón de instalar. iPhone y iPad: Apple no permite instalar con un botón; se hace desde Safari
   con «Agregar a inicio». Por eso en iPhone se muestran los pasos ilustrados. */
const UA = navigator.userAgent || "";
const esIOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const esIPad = /iPad/.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const enApp = () => !!(window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches);
const enOtraApp = /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|MicroMessenger|GSA\//i.test(UA);
const iosSafari = esIOS && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(UA) && !enOtraApp;
const IC_COMP = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0C4DA2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="botón Compartir"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-8a1 1 0 00-1-1h-1"/></svg>';
const IC_MAS = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#13202B" stroke-width="2" stroke-linecap="round" aria-label="Agregar"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
function guiaInstalar() {
  if (!esIOS && instEv) { instEv.prompt(); instEv.userChoice.finally(() => { instEv = null; re(); }); return; }
  const paso = (n, t, extra) => `<li class="pa-paso"><span class="pa-n">${n}</span><div>${t}${extra || ""}</div></li>`;
  const ios = esIOS ? `<ol class="pa-pasos">
      ${!iosSafari ? paso(1, `<b>Ábrala en Safari.</b> ${enOtraApp ? "La abrió desde WhatsApp u otra app: toque <b>⋯</b> o el ícono de la brújula y elija <b>«Abrir en Safari»</b>." : "Si usa Chrome en el iPhone también se puede: siga los mismos pasos con su botón Compartir."}`, `<button class="btn s mt" id="gCopiar">Copiar el enlace</button>`) : ""}
      ${paso(iosSafari ? 1 : 2, `Toque el botón <b>Compartir</b> ${IC_COMP} ${esIPad ? "arriba, a la derecha de la dirección." : "en la barra de abajo de Safari."}`)}
      ${paso(iosSafari ? 2 : 3, `Deslice hacia abajo y toque <b>«Agregar a inicio»</b> ${IC_MAS}`, `<p class="small muted" style="margin:4px 0 0">Si no aparece, toque «Editar acciones» al final de la lista y actívelo.</p>`)}
      ${paso(iosSafari ? 3 : 4, `Toque <b>«Agregar»</b>, arriba a la derecha. Listo: queda el ícono rojo de Protocolos PPIE en su pantalla, como cualquier app, y funciona sin internet.`)}</ol>`
    : `<ol class="pa-pasos">${paso(1, "Abra este enlace en <b>Chrome</b>.")}${paso(2, "Toque el menú <b>⋮</b> (arriba a la derecha).")}${paso(3, "Elija <b>«Instalar app»</b> o <b>«Agregar a la pantalla principal»</b>.")}${paso(4, "Confirme con <b>«Instalar»</b>. Queda el ícono rojo en su pantalla.")}</ol>`;
  dlg(`<h3>📲 Instalar en ${esIOS ? (esIPad ? "su iPad" : "su iPhone") : "su celular"}</h3>${ios}<div class="fila fin mt"><button class="btn p" id="gOk">Entendido</button></div>`, w => {
    w.querySelector("#gOk").onclick = cerrarDlg;
    const c = w.querySelector("#gCopiar"); if (c) c.onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(location.origin + location.pathname) : Promise.reject()).then(() => toast("Enlace copiado. Péguelo en Safari.")).catch(() => toast(location.origin + location.pathname, 6000)); }; });
}
const bandaInstalar = () => (enApp() || D.ocultarInst) ? "" : `<div class="pa-inst"><span class="ico">📲</span><div><b>${esIOS ? "Instálela en su iPhone" : "Instálela en su celular"}</b><span>${esIOS ? "En iPhone se agrega desde Safari en 3 toques. Así la tiene a la mano, aun sin internet." : "Queda como app y funciona sin internet."}</span></div><button class="btn p" id="bInstB">${esIOS ? "Ver cómo" : "Instalar"}</button><button class="cerrar" id="bInstX" aria-label="Ocultar">✕</button></div>`;

/* ---------------- inicio ---------------- */
const PA_GRUPOS = [["k-rojo", "Emergencia", ["tirador", "armas", "bomba", "amenaza"]], ["k-verde", "Auxilio y salud", ["accidente", "suicida"]],
  ["k-amar", "Convivencia y conducta", ["violencia", "acoso", "drogas", "omision", "trabajador"]], ["k-azul", "Protección de derechos", ["sexual", "maltrato", "digital"]]];
const PA_SOS = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5L44 41H4z" fill="#C8102E"/><rect x="21.6" y="17" width="4.8" height="14" rx="2.4" fill="#fff"/><circle cx="24" cy="35.5" r="2.7" fill="#fff"/></svg>';
VISTAS.inicio = () => { const E = ppEscuela(), faltan = !E.z050 && ppFaltaContactos(), ab = ppAbiertos();
  const contTxt = E.z050 ? E.escuela + ": la Dirección y la Supervisión reciben un aviso automático" : faltan ? "Capture una vez los teléfonos de su Dirección y su Supervisión" : [E.escuela, E.dir, E.supNomP].filter(Boolean).join(", ") || "Contactos guardados";
  return `<main class="wrap">
   <header class="pa-head"><img src="img/icono.svg" alt=""><div><b>Protocolos PPIE</b><span>Protección Integral Escolar 2026, Baja California</span></div></header>
   <button class="pa-sos" id="bSOS"><span class="ic">${PA_SOS}</span><span><strong>¿Qué está pasando?</strong><span class="t">Toque aquí y siga los pasos del protocolo</span></span>${ab.length ? `<span class="n">${ab.length} caso${ab.length > 1 ? "s" : ""} abierto${ab.length > 1 ? "s" : ""}</span>` : ""}</button>
   <div class="pa-lineas"><a class="pa-tel rojo" href="tel:911"><b>911</b><small>Emergencias</small></a><a class="pa-tel verde" href="tel:075"><b>075</b><small>Apoyo psicológico</small></a><a class="pa-tel azul" href="tel:089"><b>089</b><small>Denuncia anónima</small></a></div>
   ${bandaInstalar()}
   ${PA_GRUPOS.map(([k, t, ids]) => `<section class="pa-grupo ${k}"><h2><i></i>${t}</h2><div class="pa-tiles">${ids.map(id => { const p = ppProt(id); return `<button class="pa-tile ${k}${k === "k-rojo" ? " em" : ""}" data-pa="${id}"><span class="e">${p.e}</span>${esc(p.t)}</button>`; }).join("")}</div></section>`).join("")}
   <section class="pa-prep"><h2 class="sec-t" style="margin:0 2px 2px">Antes de que se necesite</h2>
    <button class="it" id="iCont" style="text-align:left;--k:${faltan ? "var(--amar-s)" : "var(--verde-s)"}"><span style="font-size:24px">📇</span><span class="tx"><b>A quién avisar</b><small>${esc(contTxt)}</small></span>${ic("sig", 18)}</button>
    <button class="it" id="iYo" style="text-align:left;--k:var(--azul-s)"><span style="font-size:24px">🙋</span><span class="tx"><b>Mis datos</b><small>${esc([D.yo.nombre, D.yo.cargo].filter(Boolean).join(", ") || "Su nombre va en los mensajes de WhatsApp")}</small></span>${ic("sig", 18)}</button>
    <button class="it" id="iInst" style="text-align:left;--k:var(--tinta-s)${enApp() ? ";display:none" : ""}"><span style="font-size:24px">📲</span><span class="tx"><b>Instalar en el celular</b><small>Queda a un toque y funciona sin internet</small></span>${ic("bajar", 18)}</button></section>
   ${pie()}</main>`; };
let instEv = null; window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); instEv = e; });
window.addEventListener("appinstalled", () => { instEv = null; re(); });
ENLAZAR.inicio = () => { ppieEnlazarInicio(); $("#iCont").onclick = () => ir("ppieContactos");
  $$("[data-pa]").forEach(b => b.onclick = () => { const id = b.dataset.pa; ir("ppie"); setTimeout(() => { const x = $(`[data-pp="${id}"]`); if (x) x.click(); }, 0); });
  $("#iYo").onclick = () => dlg(`<h3>🙋 Mis datos</h3><label class="campo"><span>Nombre</span><input id="yN" value="${esc(D.yo.nombre)}" autocomplete="name" placeholder="Mtro(a). …"></label>
    <label class="campo"><span>Cargo</span><input id="yC" value="${esc(D.yo.cargo)}" placeholder="Docente de 4.° A, director(a), intendente…"></label><div class="fila fin mt"><button class="btn" id="yNo">Cancelar</button><button class="btn p" id="ySi">Guardar</button></div>`, w => {
    w.querySelector("#yNo").onclick = cerrarDlg; w.querySelector("#ySi").onclick = () => { D.yo.nombre = w.querySelector("#yN").value.trim(); D.yo.cargo = w.querySelector("#yC").value.trim(); guardar(); cerrarDlg(); re(); }; });
  $("#iInst").onclick = guiaInstalar;
  if ($("#bInstB")) $("#bInstB").onclick = guiaInstalar;
  if ($("#bInstX")) $("#bInstX").onclick = () => { D.ocultarInst = true; guardar(); re(); }; };

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
window.addEventListener("load", () => pintar());
