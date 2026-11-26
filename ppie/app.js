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

/* ---------------- inicio ---------------- */
VISTAS.inicio = () => { const E = ppEscuela(), faltan = !E.z050 && ppFaltaContactos();
  return `<main class="wrap"><section class="portada"><div class="marca"><img src="img/icono.svg" alt=""><div><div class="mk-n">Protocolos <b>PPIE</b></div><div class="mk-l">Protección Integral Escolar</div></div></div>
    <h1>Protección escolar</h1><p>Los pasos del Programa de Protección Integral Escolar 2026, a quién llamar y qué formato llenar, en el momento.</p>
    <a class="pp-911" href="tel:911" style="margin-top:14px">📞 Llamar al 911</a></section>
   ${ppieBotonInicio()}
   <div class="lista mt">
    <button class="it" id="iCont" style="text-align:left;${faltan ? "border:2px solid var(--maiz)" : ""}"><span style="font-size:24px">📇</span><span class="tx"><b>A quién avisar</b><small>${E.z050 ? "Zona 050 · " + esc(E.escuela) + " · aviso automático a la Dirección y a la Supervisión" : faltan ? "Capture una vez los teléfonos de su Dirección y Supervisión" : esc([E.escuela, E.dir, E.supNomP].filter(Boolean).join(" · ") || "Contactos guardados")}</small></span>${ic("sig", 18)}</button>
    <button class="it" id="iYo" style="text-align:left"><span style="font-size:24px">🙋</span><span class="tx"><b>Mis datos</b><small>${esc([D.yo.nombre, D.yo.cargo].filter(Boolean).join(" · ") || "Su nombre aparece en los mensajes de WhatsApp")}</small></span>${ic("sig", 18)}</button>
    <button class="it" id="iInst" style="text-align:left${window.matchMedia("(display-mode: standalone)").matches ? ";display:none" : ""}"><span style="font-size:24px">📲</span><span class="tx"><b>Instalar en el celular</b><small>Para tenerla a un toque, aunque no haya internet</small></span>${ic("bajar", 18)}</button></div>
   ${faltan ? `<div class="aviso mt"><span>📇</span><span class="small"><b>Antes de que se necesite:</b> capture en «A quién avisar» los teléfonos de su Dirección y su Supervisión. Así, en una emergencia, les avisa con un solo toque.</span></div>` : ""}
   ${pie()}</main>`; };
let instEv = null; window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); instEv = e; });
ENLAZAR.inicio = () => { ppieEnlazarInicio(); $("#iCont").onclick = () => ir("ppieContactos");
  $("#iYo").onclick = () => dlg(`<h3>🙋 Mis datos</h3><label class="campo"><span>Nombre</span><input id="yN" value="${esc(D.yo.nombre)}" autocomplete="name" placeholder="Mtro(a). …"></label>
    <label class="campo"><span>Cargo</span><input id="yC" value="${esc(D.yo.cargo)}" placeholder="Docente de 4.° A, director(a), intendente…"></label><div class="fila fin mt"><button class="btn" id="yNo">Cancelar</button><button class="btn p" id="ySi">Guardar</button></div>`, w => {
    w.querySelector("#yNo").onclick = cerrarDlg; w.querySelector("#ySi").onclick = () => { D.yo.nombre = w.querySelector("#yN").value.trim(); D.yo.cargo = w.querySelector("#yC").value.trim(); guardar(); cerrarDlg(); re(); }; });
  $("#iInst").onclick = async () => { if (instEv) { instEv.prompt(); instEv = null; return; }
    dlg(`<h3>📲 Instalar en el celular</h3><p><b>Android (Chrome):</b> menú ⋮ › «Agregar a la pantalla principal» o «Instalar app».</p><p><b>iPhone (Safari):</b> botón Compartir › «Agregar a inicio».</p><div class="fila fin mt"><button class="btn p" id="iOk">Listo</button></div>`, w => w.querySelector("#iOk").onclick = cerrarDlg); }; };

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
window.addEventListener("load", () => pintar());
