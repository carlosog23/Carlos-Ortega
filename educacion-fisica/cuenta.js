/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Ulama · acceso, cuenta de Google y arranque.
   - Acceso por invitación: la Supervisión da de alta a cada maestro y le entrega un enlace personal con vigencia.
     acceso.json (en el repositorio) guarda solo la huella SHA-256 de cada enlace, nunca el enlace. Es una barrera
     para controlar la difusión, como en Tlamatini; la Supervisión entra con su clave de GitHub.
   - Cuenta de Google del maestro (opcional): con su permiso, los reportes salen desde SU Gmail y el respaldo se guarda
     en SU Google Drive (carpeta «Ulama · respaldos», que solo la app puede ver). Se usa el ID de cliente de OAuth que la
     Supervisión registra en el panel de accesos. */
"use strict";
const REPO = { owner: "carlosog23", repo: "carlos-ortega", branch: "main" }, ACC_PATH = "educacion-fisica/acceso.json";
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const ghTok = () => lsGet("gh-token", "");
const sha256 = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, "0")).join("");
let ACC = null, ACCESO_OK = false, YO = null, MOTIVO = "";

/* ---------------- control de acceso ---------------- */
/* Saca el código de acceso de lo que el maestro pegue: el enlace completo (aunque WhatsApp o el teclado le agreguen
   espacios, saltos de línea, %23 en lugar de # o texto alrededor) o solo el código. */
function codigoDe(texto) { const t = String(texto || "").replace(/[\s\u200B-\u200D\uFEFF]+/g, "").replace(/%23/gi, "#").replace(/%3D/gi, "=");
  const todos = [...t.matchAll(/acceso=([A-Za-z0-9_-]{10,})/gi)]; if (todos.length) return todos[todos.length - 1][1];
  const solo = t.match(/^([A-Za-z0-9_-]{10,})$/); return solo ? solo[1] : ""; }
/* iPhone y iPad: la app instalada no comparte datos con Safari y se abre en la dirección guardada al instalarla.
   Para que entre sola, la dirección y el manifiesto llevan el enlace personal del maestro. */
function recordarEnlaceAlInstalar(tok) { if (!tok) return; const base = location.origin + location.pathname, url = base + "#acceso=" + tok;
  try { if (!/[#&]acceso=/.test(location.hash || "")) history.replaceState(history.state, "", url); } catch (e) {}
  try { const l = document.querySelector('link[rel="manifest"]'); if (!l) return;
    fetch("manifest.webmanifest").then(r => r.json()).then(mf => { const dir = new URL("./", location.href).href;
      mf.start_url = url; mf.scope = dir; mf.id = dir; (mf.icons || []).forEach(i => { i.src = new URL(i.src, dir).href; });
      l.href = "data:application/manifest+json;charset=utf-8," + encodeURIComponent(JSON.stringify(mf)); }).catch(() => {}); } catch (e) {} }
async function cargarAcceso() { try { const r = await fetch("acceso.json?t=" + Date.now(), { cache: "no-store" }); if (!r.ok) throw 0; ACC = await r.json(); lsSet("ulama-acc-cache", ACC); } catch (e) { ACC = lsGet("ulama-acc-cache", null); } return ACC; }
function estadoEnlace(e, gen) { if (!e) return "no"; if (e.anulado || e.gen !== gen) return "anulado"; if (e.vence < hoy()) return "vencido"; return "vigente"; }
async function verificarAcceso() {
  const m = (location.hash || "").match(/[#&]acceso=([A-Za-z0-9_-]{10,})/);
  if (m) lsSet("ulama-tok", m[1]);
  await cargarAcceso();
  if (ghTok()) { ACCESO_OK = true; YO = { nombre: "Supervisión", sup: true }; return; }
  if (!ACC) { MOTIVO = lsGet("ulama-tok", "") ? "sinred" : "sin"; ACCESO_OK = false; return; }
  if (!ACC.activo) { ACCESO_OK = true; return; }
  const tok = lsGet("ulama-tok", ""); if (!tok) { MOTIVO = "sin"; ACCESO_OK = false; return; }
  const h = await sha256(tok), e = (ACC.enlaces || []).find(x => x.h === h), st = estadoEnlace(e, ACC.generacion);
  ACCESO_OK = st === "vigente"; MOTIVO = st; YO = e || null;
}
VISTAS.acceso = () => { const T = { sin: ["Ulama es de acceso por invitación", "Para entrar necesita el enlace personal que le entrega la Supervisión Escolar. Ábralo desde su celular o tableta, o péguelo aquí abajo."],
  vencido: ["Su enlace ya venció", "Pida a la Supervisión que lo renueve. Sus datos siguen guardados en este dispositivo: al renovarse, todo aparecerá como lo dejó."],
  anulado: ["Este enlace ya no es válido", "La Supervisión lo anuló o lo reemplazó. Pida uno nuevo. Sus datos siguen guardados en este dispositivo."],
  no: ["Este enlace no está registrado", "Revise que lo haya copiado completo o pida uno nuevo a la Supervisión."],
  sinred: ["Necesita internet esta primera vez", "Conéctese a internet una vez para comprobar su enlace; después Ulama funciona sin conexión."] }[MOTIVO] || ["Acceso", ""];
  return `<main class="wrap"><section class="portada"><div class="marca"><img src="img/ulama-icono.svg" alt=""><div class="eb">Ulama · Educación Física</div></div><h1>${T[0]}</h1><p>${T[1]}</p></section>
  <div class="card mt"><label class="campo"><span>Su enlace de acceso</span><input id="xTok" type="url" inputmode="url" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" placeholder="https://carlosog23.github.io/…#acceso=…"></label><div class="fila fin">${navigator.clipboard && navigator.clipboard.readText ? '<button class="btn" id="xPeg">Pegar</button>' : ""}<button class="btn p" id="xOk">Entrar</button></div></div>
  <div class="card mt"><h3>¿No tiene enlace?</h3><p class="small muted">Solicítelo a la Supervisión Escolar Zona 050: <b>cortegagutierrez@bcedu.mx</b> o WhatsApp <b>661 850 1585</b>.</p>
  <p class="small mt"><button class="btn s" id="xSup">${ic("sup", 16)} Soy la Supervisión</button></p></div></main>`; };
ENLAZAR.acceso = () => { const peg = $("#xPeg"); if (peg) peg.onclick = async () => { try { $("#xTok").value = await navigator.clipboard.readText(); $("#xOk").click(); } catch (e) { toast("Mantenga el dedo en el recuadro y elija «Pegar»."); } };
  $("#xOk").onclick = async () => { const c = codigoDe(val("xTok"));
    if (!c) return toast("No se encontró el código de acceso en lo que pegó. Copie el enlace completo, que termina en «#acceso=…»."); lsSet("ulama-tok", c); await verificarAcceso();
    if (ACCESO_OK) { recordarEnlaceAlInstalar(c); S = { v: "inicio" }; pintar(); toast("¡Bienvenido(a) a Ulama!"); }
    else { pintar(); toast({ no: "Ese enlace no está registrado: revise que sea el más reciente que le mandó la Supervisión.", anulado: "Ese enlace fue reemplazado por uno nuevo: use el más reciente.", vencido: "Ese enlace ya venció.", sinred: "Conéctese a internet para comprobar su enlace." }[MOTIVO] || "No se pudo comprobar el enlace."); } };
  $("#xSup").onclick = () => pedirClaveSup(async () => { await verificarAcceso(); S = { v: "admin" }; pintar(); }); };
function pedirClaveSup(listo) { dlg(`<h3>Clave de la Supervisión</h3><label class="campo"><span>Clave de acceso (token de GitHub)</span><input type="password" id="kT" autocomplete="off" spellcheck="false"><small>La misma de Tlamatini. Se guarda solo en este equipo.</small></label>
  <div class="fila fin"><button class="btn" id="kX">Cancelar</button><button class="btn p" id="kOk">Entrar</button></div><div id="kM"></div>`, v => {
  v.querySelector("#kX").onclick = cerrarDlg;
  v.querySelector("#kOk").onclick = async () => { const t = val("kT").trim(); if (!t) return; $("#kM").innerHTML = `<p class="small muted mt">Verificando…</p>`;
    try { const r = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.repo}`, { headers: ghHdr(t) }); if (!r.ok) throw r.status; lsSet("gh-token", t); cerrarDlg(); listo(); }
    catch (e) { $("#kM").innerHTML = `<div class="aviso mt">La clave no es válida o no hay internet.</div>`; } }; }); }

/* ---------------- panel de la Supervisión: alta de maestros y enlaces ---------------- */
const ghHdr = t => ({ Authorization: "Bearer " + t, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" });
const ghURL = p => `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/contents/${p}`;
const b64enc = s => btoa(unescape(encodeURIComponent(s))), b64dec = s => decodeURIComponent(escape(atob(s.replace(/\n/g, ""))));
let AA = null; // { d, sha }
async function accLeer() { const r = await fetch(ghURL(ACC_PATH) + "?ref=" + REPO.branch + "&t=" + Date.now(), { headers: ghHdr(ghTok()), cache: "no-store" });
  if (r.status === 404) { AA = { d: { activo: true, generacion: 1, actualizado: hoy(), googleClientId: "", enlaces: [] }, sha: null }; return AA; }
  if (!r.ok) { const e = new Error("http " + r.status); e.status = r.status; throw e; } const j = await r.json(); AA = { d: JSON.parse(b64dec(j.content)), sha: j.sha }; return AA; }
async function accGuardar(cambio, msg) { for (let k = 0; k < 2; k++) { await accLeer(); cambio(AA.d); AA.d.actualizado = hoy();
    const body = { message: msg, content: b64enc(JSON.stringify(AA.d, null, 2) + "\n"), branch: REPO.branch }; if (AA.sha) body.sha = AA.sha;
    const r = await fetch(ghURL(ACC_PATH), { method: "PUT", headers: Object.assign(ghHdr(ghTok()), { "Content-Type": "application/json" }), body: JSON.stringify(body) });
    if (r.ok) { AA.sha = (await r.json()).content.sha; ACC = JSON.parse(JSON.stringify(AA.d)); lsSet("ulama-acc-cache", ACC); return; }
    if (r.status !== 409 && r.status !== 422) throw new Error("http " + r.status); } throw new Error("conflicto"); }
const nuevoToken = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const urlApp = () => location.origin + location.pathname.replace(/index\.html$/, "");
VISTAS.admin = () => { if (!ghTok()) return barra("Supervisión", "Accesos de maestros") + `<main class="wrap"><div class="card mt"><p>Esta pantalla es solo para la Supervisión.</p><button class="btn p mt" id="aClave">Entrar con la clave</button></div></main>`;
  if (!AA) return barra("Supervisión", "Accesos de maestros") + `<main class="wrap"><p class="muted mt">Cargando…</p></main>`;
  const d = AA.d, gen = d.generacion, L = [...(d.enlaces || [])].sort((a, b) => (b.creado || "").localeCompare(a.creado || "")), est = e => estadoEnlace(e, gen);
  const vig = L.filter(e => est(e) === "vigente").length, TAG = { vigente: "", vencido: "m", anulado: "r" };
  return barra("Supervisión", "Accesos de maestros", `<button class="btn s p" id="aNuevo">${ic("mas")} Maestro</button>`) + `<main class="wrap">
  <section class="card mt"><div class="fila" style="justify-content:space-between"><div><h3 style="margin:0">${vig} ${vig === 1 ? "maestro" : "maestros"} con acceso vigente</h3><p class="small muted">Control de acceso ${d.activo ? "<b>activado</b>: solo entran quienes tienen enlace vigente." : "<b>apagado</b>: cualquiera con la dirección puede entrar."}</p></div>
   <button class="btn s" id="aAct">${d.activo ? "Apagar control" : "Activar control"}</button></div></section>
  <div class="lista mt">${L.map(e => `<div class="it"><span class="av">${iniciales(e.nombre)}</span><span class="tx"><b>${esc(e.nombre)}</b><small>${e.usuario ? esc(e.usuario) + " · " : ""}${e.correo ? esc(e.correo) + " · " : ""}vence ${fCorta(e.vence)}${e.nota ? " · " + esc(e.nota) : ""}</small></span>
    <span class="tag ${TAG[est(e)]}">${est(e)}</span>${est(e) === "anulado" ? "" : `<button class="btn s" data-ren="${e.h}" aria-label="Renovar">${ic("reloj", 16)}</button><button class="btn s r" data-anu="${e.h}" aria-label="Anular">${ic("baja", 16)}</button>`}</div>`).join("") || `<div class="vacio">Aún no ha dado de alta a ningún maestro.</div>`}</div>
  <section class="card mt"><h3>Cuenta de Google para correos y respaldos</h3><p class="small muted mb">ID de cliente de OAuth (Google Cloud) con el que los maestros conectan su Gmail y su Drive. Sin este dato, los reportes se envían por el servidor de Tequio o por el correo del dispositivo.</p>
   <label class="campo"><span>ID de cliente</span><input id="aCid" value="${esc(d.googleClientId || "")}" placeholder="123456789-abc….apps.googleusercontent.com"></label><div class="fila fin"><button class="btn s" id="aCidOk">Guardar</button></div></section>
  <section class="card mt"><h3>Anular todos los enlaces</h3><p class="small muted mb">Úselo si los enlaces se difundieron a personas no autorizadas. Después tendrá que dar enlaces nuevos a cada maestro.</p><button class="btn r" id="aTodos">Anular todos</button></section></main>`; };
ENLAZAR.admin = () => { if (!ghTok()) { $("#aClave").onclick = () => pedirClaveSup(() => { AA = null; pintar(); }); return; }
  if (!AA) { accLeer().then(pintar).catch(e => { if (e.status === 401 || e.status === 403) { try { localStorage.removeItem("gh-token"); } catch (x) {} } toast("<b>No se pudo leer el control de acceso.</b> Revise su conexión o su clave."); }); return; }
  const fallo = e => toast(`<b>No se pudo guardar.</b> ${e.message === "conflicto" ? "Intente de nuevo." : "Revise su conexión o su clave."}`, 4000);
  $("#aNuevo").onclick = () => dlg(`<h3>Dar de alta a un maestro</h3><label class="campo"><span>Nombre completo</span><input id="nN" placeholder="Profr. …"></label>
    <div class="dos"><label class="campo"><span>Usuario (opcional)</span><input id="nU" placeholder="Ej. ef-camalu-1"></label><label class="campo"><span>Correo (opcional)</span><input id="nC" type="email"></label></div>
    <div class="dos"><label class="campo"><span>Vigencia hasta</span><input type="date" id="nV" value="${CICLO.fin}"></label><label class="campo"><span>Nota (opcional)</span><input id="nT" placeholder="Escuelas que atiende…"></label></div>
    <p class="small muted mb">El enlace es personal. En el registro solo se guarda su huella, no el enlace: cópielo y envíelo en cuanto se genere.</p>
    <div class="fila fin"><button class="btn" id="nX">Cancelar</button><button class="btn p" id="nOk">Generar enlace</button></div>`, v => {
    v.querySelector("#nX").onclick = cerrarDlg;
    v.querySelector("#nOk").onclick = async ev => { const nombre = val("nN").trim(), vence = val("nV"); if (!nombre) return toast("Escriba el nombre."); if (!vence || vence < hoy()) return toast("Elija una vigencia futura.");
      const b = ev.currentTarget; b.disabled = true; b.textContent = "Guardando…"; const tok = nuevoToken(), h = await sha256(tok);
      try { await accGuardar(d => { d.enlaces = d.enlaces || []; d.enlaces.push({ h, nombre, usuario: val("nU").trim(), correo: val("nC").trim(), vence, nota: val("nT").trim(), creado: new Date().toISOString(), gen: d.generacion }); }, `Ulama: alta de ${nombre}`);
        mostrarEnlace(nombre, urlApp() + "#acceso=" + tok, vence, val("nC").trim()); } catch (e) { b.disabled = false; b.textContent = "Generar enlace"; fallo(e); } }; });
  $$("[data-anu]").forEach(b => b.onclick = async () => { const e = AA.d.enlaces.find(x => x.h === b.dataset.anu); if (!(await confirmar(`¿Anular el acceso de ${e.nombre}? Ya no podrá entrar con su enlace.`, "Anular"))) return;
    try { await accGuardar(d => { const x = d.enlaces.find(y => y.h === e.h); if (x) x.anulado = hoy(); }, `Ulama: anula acceso de ${e.nombre}`); pintar(); toast("Acceso anulado."); } catch (er) { fallo(er); } });
  $$("[data-ren]").forEach(b => b.onclick = () => { const e = AA.d.enlaces.find(x => x.h === b.dataset.ren);
    dlg(`<h3>Renovar a ${esc(e.nombre)}</h3><label class="campo"><span>Nueva vigencia</span><input type="date" id="rV" value="${e.vence > CICLO.fin ? e.vence : CICLO.fin}"></label><p class="small muted mb">Su mismo enlace seguirá funcionando hasta la nueva fecha.</p><div class="fila fin"><button class="btn" id="rX">Cancelar</button><button class="btn p" id="rOk">Renovar</button></div>`, v => {
      v.querySelector("#rX").onclick = cerrarDlg; v.querySelector("#rOk").onclick = async () => { const nv = val("rV"); if (!nv || nv < hoy()) return toast("Elija una fecha futura.");
        try { await accGuardar(d => { const x = d.enlaces.find(y => y.h === e.h); if (x) x.vence = nv; }, `Ulama: renueva acceso de ${e.nombre}`); pintar(); toast("Vigencia actualizada."); } catch (er) { fallo(er); } }; }); });
  $("#aAct").onclick = async () => { const on = !AA.d.activo; if (!on && !(await confirmar("Sin control, cualquier persona con la dirección podrá entrar. ¿Apagarlo?", "Apagar"))) return;
    try { await accGuardar(d => { d.activo = on; }, `Ulama: control de acceso ${on ? "activado" : "apagado"}`); pintar(); } catch (e) { fallo(e); } };
  $("#aCidOk").onclick = async () => { const c = val("aCid").trim(); if (c && !/\.apps\.googleusercontent\.com$/.test(c)) return toast("El ID de cliente termina en .apps.googleusercontent.com");
    try { await accGuardar(d => { d.googleClientId = c; }, "Ulama: ID de cliente de Google"); pintar(); toast("Guardado. Los maestros ya pueden conectar su cuenta de Google."); } catch (e) { fallo(e); } };
  $("#aTodos").onclick = async () => { if (!(await confirmar("Se anularán TODOS los enlaces de los maestros. Tendrá que darles uno nuevo a cada quien.", "Anular todos"))) return;
    try { await accGuardar(d => { d.generacion = (d.generacion || 1) + 1; }, "Ulama: anula todos los enlaces"); pintar(); toast("Todos los enlaces quedaron anulados."); } catch (e) { fallo(e); } }; };
function mostrarEnlace(nombre, url, vence, correo) { const txt = `Hola, ${nombre}. Este es su acceso personal a Ulama, la herramienta de Educación Física (vigente hasta el ${fLarga(vence)}). Ábralo en su celular o tableta y luego instálela: ${url}`;
  const hoja = url.replace("#acceso=", "hoja.html#acceso="), txtH = `Hola, ${nombre}. Para dejarle lista su plataforma de Educación Física (Ulama), llene por favor esta hoja de registro con sus escuelas, grupos y listas de alumnos. Se abre en el celular o la computadora, se guarda sola y al final toca «Enviar a la Supervisión»: ${hoja}`;
  dlg(`<h3>Enlace de ${esc(nombre)}</h3><p class="small muted mb">Cópielo ahora: por seguridad no se vuelve a mostrar. Si se pierde, anúlelo y genere otro.</p>
   <label class="campo"><span>Enlace personal</span><textarea id="lU" readonly style="min-height:90px;font-size:14px">${esc(url)}</textarea></label>
   <div class="fila"><button class="btn p" id="lC">Copiar enlace</button><a class="btn" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">WhatsApp</a>${correo ? `<a class="btn" href="mailto:${esc(correo)}?subject=${encodeURIComponent("Su acceso a Ulama · Educación Física")}&body=${encodeURIComponent(txt)}">Correo</a>` : ""}</div>
   <label class="campo mt"><span>Hoja de registro (el maestro la llena sin instalar nada y le llega a usted)</span><textarea id="lH" readonly style="min-height:90px;font-size:14px">${esc(hoja)}</textarea></label>
   <div class="fila"><button class="btn" id="lHC">Copiar hoja</button><a class="btn" href="https://wa.me/?text=${encodeURIComponent(txtH)}" target="_blank" rel="noopener">WhatsApp</a></div>
   <div class="fila fin mt"><button class="btn" id="lX">Listo</button></div>`, v => {
    v.querySelector("#lC").onclick = async () => { try { await navigator.clipboard.writeText(url); toast("Enlace copiado."); } catch (e) { const t = $("#lU"); t.select(); toast("Selecciónelo y cópielo."); } };
    v.querySelector("#lHC").onclick = async () => { try { await navigator.clipboard.writeText(hoja); toast("Enlace de la hoja copiado."); } catch (e) { $("#lH").select(); toast("Selecciónelo y cópielo."); } };
    v.querySelector("#lX").onclick = () => { cerrarDlg(); pintar(); }; }); }

/* ---------------- cuenta de Google del maestro: Gmail (enviar) y Drive (respaldo) ---------------- */
const GSCOPES = "openid email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file";
const gClientId = () => (ACC && ACC.googleClientId) || "";
let GTOK = (() => { try { const x = JSON.parse(sessionStorage.getItem("ulama-g") || "null"); return x && x.exp > Date.now() ? x : null; } catch (e) { return null; } })();
const gVigente = () => GTOK && GTOK.exp > Date.now() + 60000;
function gPrecargar() { if (gClientId() && navigator.onLine !== false) cargarJS("https://accounts.google.com/gsi/client").catch(() => {}); }
/* Pide permiso a Google (ventana de Google). Debe llamarse desde un toque del usuario. */
async function gToken(interactivo) { if (gVigente()) return GTOK.t; if (!interactivo) throw new Error("sin-sesion"); if (!gClientId()) throw new Error("La Supervisión aún no configura la conexión con Google.");
  if (!(window.google && google.accounts && google.accounts.oauth2)) await cargarJS("https://accounts.google.com/gsi/client");
  return new Promise((ok, no) => { const G = D.cfg.google;
    const tc = google.accounts.oauth2.initTokenClient({ client_id: gClientId(), scope: GSCOPES, include_granted_scopes: true, login_hint: G && G.correo ? G.correo : undefined, prompt: G && G.correo ? "" : "consent",
      callback: r => { if (r.error) return no(new Error(r.error === "access_denied" ? "cancelado" : r.error)); GTOK = { t: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3600) * 1000, scopes: r.scope || "" };
        try { sessionStorage.setItem("ulama-g", JSON.stringify(GTOK)); } catch (e) {} ok(r.access_token); },
      error_callback: e => no(new Error(e && e.type === "popup_closed" ? "cancelado" : (e && e.type) || "cancelado")) });
    tc.requestAccessToken(); }); }
async function gFetch(url, op = {}, interactivo = true) { const t = await gToken(interactivo); const r = await fetch(url, Object.assign({}, op, { headers: Object.assign({ Authorization: "Bearer " + t }, op.headers || {}) }));
  if (r.status === 401) { GTOK = null; try { sessionStorage.removeItem("ulama-g"); } catch (e) {} throw new Error("La sesión de Google expiró. Intente de nuevo."); }
  if (!r.ok) { let m = "error " + r.status; try { const j = await r.json(); m = (j.error && (j.error.message || j.error)) || m; } catch (e) {} if (r.status === 403 && /insufficient|scope/i.test(m)) m = "Falta el permiso en Google. Desconecte y vuelva a conectar su cuenta, y marque todas las casillas."; throw new Error(m); }
  return r; }
async function gConectar() { await gToken(true); const u = await (await gFetch("https://www.googleapis.com/oauth2/v3/userinfo")).json();
  D.cfg.google = Object.assign(D.cfg.google || {}, { correo: u.email, desde: hoy() }); guardar(true);
  if (GTOK && GTOK.scopes && !/gmail\.send/.test(GTOK.scopes)) toast("Conectado, pero no dio permiso para enviar correos: los reportes se enviarán por otra vía.", 5000);
  try { await driveRespaldar(true); } catch (e) {} pintar(); toast(`Cuenta conectada: <b>${esc(u.email)}</b>. Se hizo su primer respaldo en Drive.`, 4500); }
function cuentaGoogleHTML() { const G = D.cfg.google;
  if (!gClientId()) return `<section class="card mt"><h3>Su correo y su Drive</h3><p class="small muted">Pronto podrá conectar su cuenta de Google para enviar los reportes desde su propio correo y respaldar todo en su Drive. Mientras, use el respaldo en archivo.</p></section>`;
  if (!G || !G.correo) return `<section class="card mt"><h3>Su correo y su Drive</h3><p class="small muted mb">Conecte su cuenta de Google (de preferencia su correo institucional) para:</p>
    <ul class="small" style="margin:0 0 12px;padding-left:20px"><li>Enviar las evaluaciones y planeaciones <b>desde su propio correo</b>, con el PDF adjunto.</li><li>Respaldar todo en <b>su Google Drive</b> automáticamente: si su tableta se daña o la cambia, recupera todo.</li></ul>
    <button class="btn p" id="gCon">${ic("correo", 18)} Conectar mi cuenta de Google</button><p class="small muted mt">Google le pedirá permiso para «enviar correo» y «ver y administrar los archivos de Drive que use esta app». Ulama no lee sus correos ni sus otros archivos.</p></section>`;
  return `<section class="card mt"><h3>Su correo y su Drive</h3><div class="aviso v">${ic("check", 18)}<span>Conectado con <b>${esc(G.correo)}</b>. Los reportes salen desde este correo y el respaldo se guarda en su Drive, en la carpeta «Ulama · respaldos».</span></div>
   <p class="small muted mt">Último respaldo en Drive: ${G.ultimo ? new Date(G.ultimo).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "aún no"}.</p>
   <div class="fila mt"><button class="btn p" id="gResp">${ic("subir", 18)} Respaldar ahora</button><button class="btn" id="gRec">${ic("bajar", 18)} Recuperar de Drive</button><button class="btn r s" id="gDes">Desconectar</button></div></section>`; }
function enlazarCuentaGoogle() {
  $("#gCon") && ($("#gCon").onclick = async ev => { ev.currentTarget.disabled = true; try { await gConectar(); } catch (e) { pintar(); toast(e.message === "cancelado" ? "No se conectó la cuenta." : `<b>No se pudo conectar.</b> ${esc(e.message)}`, 4500); } });
  $("#gResp") && ($("#gResp").onclick = async ev => { const b = ev.currentTarget; b.disabled = true; b.textContent = "Respaldando…"; try { await driveRespaldar(true); pintar(); toast("Respaldo guardado en su Drive."); } catch (e) { pintar(); toast(`<b>No se pudo respaldar.</b> ${esc(e.message)}`, 4500); } });
  $("#gRec") && ($("#gRec").onclick = driveElegirRespaldo);
  $("#gDes") && ($("#gDes").onclick = async () => { if (!(await confirmar("Los reportes ya no saldrán de su correo y el respaldo automático en Drive se detiene. Sus respaldos en Drive no se borran.", "Desconectar"))) return;
    try { if (GTOK && window.google) google.accounts.oauth2.revoke(GTOK.t, () => {}); } catch (e) {} GTOK = null; try { sessionStorage.removeItem("ulama-g"); } catch (e) {} delete D.cfg.google; guardar(true); pintar(); }); }

/* --- Drive: carpeta «Ulama · respaldos», un archivo por día (se reemplaza durante el día), se conservan 30 --- */
const DRV = "https://www.googleapis.com/drive/v3/files", DRV_UP = "https://www.googleapis.com/upload/drive/v3/files";
async function driveCarpeta(inter) { const G = D.cfg.google;
  if (G.carpeta) { try { const r = await gFetch(`${DRV}/${G.carpeta}?fields=id,trashed`, {}, inter); const j = await r.json(); if (!j.trashed) return G.carpeta; } catch (e) { if (/expir|sin-sesion|cancelado/.test(e.message)) throw e; } }
  const q = encodeURIComponent("name='Ulama · respaldos' and mimeType='application/vnd.google-apps.folder' and trashed=false");
  const l = await (await gFetch(`${DRV}?q=${q}&fields=files(id)&spaces=drive`, {}, inter)).json();
  let id = l.files && l.files[0] && l.files[0].id;
  if (!id) id = (await (await gFetch(DRV + "?fields=id", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Ulama · respaldos", mimeType: "application/vnd.google-apps.folder" }) }, inter)).json()).id;
  G.carpeta = id; guardar(true); return id; }
async function driveRespaldar(inter) { const G = D.cfg.google; if (!G || !G.correo) throw new Error("No hay cuenta de Google conectada.");
  const car = await driveCarpeta(inter), nombre = `ulama-respaldo-${hoy()}.json`, cuerpo = JSON.stringify(D);
  const q = encodeURIComponent(`'${car}' in parents and name='${nombre}' and trashed=false`);
  const ex = (await (await gFetch(`${DRV}?q=${q}&fields=files(id)`, {}, inter)).json()).files || [];
  if (ex.length) await gFetch(`${DRV_UP}/${ex[0].id}?uploadType=media`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: cuerpo }, inter);
  else { const b = "ulama" + uid(), meta = JSON.stringify({ name: nombre, parents: [car], mimeType: "application/json", description: `Respaldo de Ulama · ${docNombre()}` });
    await gFetch(`${DRV_UP}?uploadType=multipart&fields=id`, { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${b}` },
      body: `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${cuerpo}\r\n--${b}--` }, inter);
    try { const qa = encodeURIComponent(`'${car}' in parents and trashed=false`); const todos = (await (await gFetch(`${DRV}?q=${qa}&orderBy=name desc&fields=files(id,name)&pageSize=100`, {}, inter)).json()).files || [];
      for (const f of todos.filter(f => /^ulama-respaldo-/.test(f.name)).slice(30)) await gFetch(`${DRV}/${f.id}`, { method: "DELETE" }, inter); } catch (e) {} }
  G.ultimo = new Date().toISOString(); D.cfg.respPend = false; guardar(true); }
/* Respaldo automático: unos segundos después de cada cambio, si la sesión de Google sigue abierta y hay internet. */
let _rTimer = null;
function respaldoAuto() { const G = D.cfg.google; if (!G || !G.correo) return; D.cfg.respPend = true; clearTimeout(_rTimer);
  _rTimer = setTimeout(() => { if (!gVigente() || navigator.onLine === false) return; driveRespaldar(false).catch(() => {}); }, 15000); }
window.addEventListener("online", () => { if (D.cfg.google && D.cfg.respPend && gVigente()) driveRespaldar(false).catch(() => {}); });
function avisoRespaldoHTML() { const G = D.cfg.google;
  if (G && G.correo) { const viejo = !G.ultimo || Date.now() - Date.parse(G.ultimo) > 864e5; if (!(D.cfg.respPend && (viejo || !gVigente()))) return "";
    return `<div class="aviso mt2">${ic("subir", 18)}<span style="flex:1">Tiene cambios sin respaldar en su Drive${G.ultimo ? ` (último: ${fCorta(G.ultimo.slice(0, 10))})` : ""}.</span><button class="btn s p" id="avResp">Respaldar</button></div>`; }
  if (D.grupos.length && gClientId()) return `<div class="aviso mt2">${ic("subir", 18)}<span style="flex:1">Proteja su trabajo: conecte su Google Drive para respaldar automáticamente.</span><button class="btn s" id="avCon">Conectar</button></div>`;
  return ""; }
function enlazarAvisoRespaldo() { $("#avResp") && ($("#avResp").onclick = async ev => { ev.currentTarget.disabled = true; try { await driveRespaldar(true); pintar(); toast("Respaldo guardado en su Drive."); } catch (e) { pintar(); toast(`<b>No se pudo respaldar.</b> ${esc(e.message)}`, 4500); } });
  $("#avCon") && ($("#avCon").onclick = async ev => { ev.currentTarget.disabled = true; try { await gConectar(); } catch (e) { pintar(); toast(e.message === "cancelado" ? "No se conectó la cuenta." : `<b>No se pudo conectar.</b> ${esc(e.message)}`, 4500); } }); }
async function driveElegirRespaldo() { try { if (!D.cfg.google) { await gToken(true); const u = await (await gFetch("https://www.googleapis.com/oauth2/v3/userinfo")).json(); D.cfg.google = { correo: u.email, desde: hoy() }; guardar(true); }
    const car = await driveCarpeta(true), q = encodeURIComponent(`'${car}' in parents and trashed=false`);
    const L = ((await (await gFetch(`${DRV}?q=${q}&orderBy=name desc&fields=files(id,name,modifiedTime,size)&pageSize=40`)).json()).files || []).filter(f => /^ulama-respaldo-/.test(f.name));
    if (!L.length) return toast("No hay respaldos de Ulama en ese Drive.");
    dlg(`<h3>Respaldos en su Drive</h3><p class="small muted mb">${esc(D.cfg.google.correo)} · elija cuál recuperar (el más reciente está primero).</p><div class="lista">${L.map(f => `<button class="it btnit" data-f="${f.id}"><span class="av">${ic("doc", 18)}</span><span class="tx"><b>${fLarga(f.name.slice(15, 25))}</b><small>Guardado ${new Date(f.modifiedTime).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })} · ${Math.round((+f.size || 0) / 1024)} KB</small></span></button>`).join("")}</div>`, v => {
      v.querySelectorAll("[data-f]").forEach(b => b.onclick = async () => { try { const x = await (await gFetch(`${DRV}/${b.dataset.f}?alt=media`)).json(); cerrarDlg(); await restaurar(x); } catch (e) { toast(`<b>No se pudo recuperar.</b> ${esc(e.message)}`); } }); }); }
  catch (e) { toast(e.message === "cancelado" ? "No se dio permiso a Google." : `<b>No se pudo abrir su Drive.</b> ${esc(e.message)}`, 4500); } }

/* --- PDF del reporte (en el dispositivo) y envío con Gmail --- */
const H2P = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
async function pdfObra(html, archivo, horizontal) { await cargarJS(H2P); const el = document.createElement("div"); el.style.width = horizontal ? "960px" : "720px"; el.style.background = "#fff"; el.innerHTML = html;
  /* el «worker» de html2pdf es una promesa: se devuelve envuelto para no esperarlo por accidente */
  return { w: html2pdf().set({ margin: [10, 10, 12, 10], filename: archivo, image: { type: "jpeg", quality: 0.92 }, html2canvas: { scale: 1.7, useCORS: true, backgroundColor: "#fff", scrollX: 0, scrollY: 0 },
    jsPDF: { unit: "mm", format: "letter", orientation: horizontal ? "landscape" : "portrait" }, pagebreak: { mode: ["css", "legacy"], before: ".salto", avoid: "tr" } }).from(el) }; }
async function pdfBase64(html) { const u = await (await pdfObra(html, "r.pdf")).w.outputPdf("datauristring"); return u.slice(u.indexOf(",") + 1); }
async function pdfDescargar(html, archivo, horizontal) { if (navigator.onLine === false) throw new Error("sin-red"); await (await pdfObra(html, archivo, horizontal)).w.save(); }
const b64utf = s => btoa(unescape(encodeURIComponent(s)));
const encH = s => /^[\x20-\x7E]*$/.test(s) ? s : `=?UTF-8?B?${b64utf(s)}?=`;
const lineas76 = s => s.replace(/(.{76})/g, "$1\r\n");
async function gmailEnviar({ para, cc, asunto, mensaje, pdf, archivo }) { const G = D.cfg.google, b = "ulama" + uid();
  const esc2 = t => String(t).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const htmlCuerpo = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#1B2740">${esc2(mensaje).replace(/\n/g, "<br>")}</div><p style="font-size:12px;color:#777;margin-top:18px">Enviado con Ulama · Educación Física (familia Tlamatini).</p>`;
  const alt = "alt" + uid();
  const mime = [`From: ${encH(docNombre() || G.correo)} <${G.correo}>`, `To: ${para.join(", ")}`, cc.length ? `Cc: ${cc.join(", ")}` : null, `Subject: ${encH(asunto)}`, "MIME-Version: 1.0", `Content-Type: multipart/mixed; boundary="${b}"`, "",
    `--${b}`, `Content-Type: multipart/alternative; boundary="${alt}"`, "",
    `--${alt}`, 'Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", lineas76(b64utf(mensaje)),
    `--${alt}`, 'Content-Type: text/html; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", lineas76(b64utf(htmlCuerpo)), `--${alt}--`,
    `--${b}`, `Content-Type: application/pdf; name="${archivo}"`, "Content-Transfer-Encoding: base64", `Content-Disposition: attachment; filename="${archivo}"`, "", lineas76(pdf), `--${b}--`, ""].filter(x => x !== null).join("\r\n");
  await gFetch("https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media", { method: "POST", headers: { "Content-Type": "message/rfc822" }, body: mime }); }

/* =================================================================== arranque */
let INSTALAR = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); INSTALAR = e; });
window.addEventListener("appinstalled", () => { INSTALAR = null; try { localStorage.setItem("ulama-instalada", "1"); } catch (e) {} if (S && S.v === "inicio") pintar(); toast("Ulama quedó instalada. Ábrala desde su pantalla de inicio o sus aplicaciones."); });
/* Instalar la app: Android y computadoras con Chrome/Edge usan el aviso del navegador; iPhone, iPad, Mac y Firefox, instrucciones */
const enApp = () => matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: window-controls-overlay)").matches || navigator.standalone === true;
function dispositivo() { const u = navigator.userAgent, ipad = /iPad/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1), ios = /iPhone|iPod/.test(u) || ipad;
  return { ios, ipad, android: /Android/.test(u), safari: /Safari/.test(u) && !/Chrome|CriOS|FxiOS|EdgiOS|EdgA|Edg\//.test(u), firefox: /Firefox|FxiOS/.test(u), edge: /Edg/.test(u), mac: /Macintosh/.test(u) && !ipad }; }
async function instalarApp() { if (INSTALAR) { INSTALAR.prompt(); const r = await INSTALAR.userChoice; INSTALAR = null; if (r && r.outcome === "accepted") toast("Instalando Ulama…"); pintar(); return; }
  const d = dispositivo(), paso = (n, t) => `<li style="margin-bottom:10px"><b>${n}.</b> ${t}</li>`; let h;
  if (d.ios) h = d.safari || /CriOS|EdgiOS/.test(navigator.userAgent) ? `<ol style="padding-left:4px;list-style:none">${paso(1, `Toque el botón <b>Compartir</b> ${ic("subir", 18)} (${d.ipad ? "arriba, junto a la dirección" : "abajo, en el centro de la pantalla"}).`)}${paso(2, `Baje y toque <b>Agregar a inicio</b> (o <b>Agregar a pantalla de inicio</b>).`)}${paso(3, `Toque <b>Agregar</b>. Aparecerá el ícono de Ulama en su ${d.ipad ? "iPad" : "iPhone"}.`)}</ol>`
    : `<p>En ${d.ipad ? "iPad" : "iPhone"} conviene instalarla desde <b>Safari</b>. Copie la dirección de esta página, ábrala en Safari y luego toque <b>Compartir → Agregar a inicio</b>.</p><div class="fila mt"><button class="btn" id="iCop">Copiar dirección</button></div>`;
  else if (d.android) h = `<ol style="padding-left:4px;list-style:none">${paso(1, `Abra esta página en <b>Chrome</b>.`)}${paso(2, `Toque el menú <b>⋮</b> (arriba a la derecha).`)}${paso(3, `Toque <b>Instalar aplicación</b> o <b>Agregar a la pantalla principal</b>, y luego <b>Instalar</b>.`)}</ol>`;
  else if (d.mac && d.safari) h = `<ol style="padding-left:4px;list-style:none">${paso(1, `En la barra de menús de Safari, toque <b>Archivo</b>.`)}${paso(2, `Elija <b>Agregar al Dock</b> y luego <b>Agregar</b>.`)}</ol><p class="small muted">Si no aparece esa opción, abra esta página en Chrome o Edge.</p>`;
  else if (d.firefox) h = `<p>Firefox no instala aplicaciones web. Abra esta página en <b>Chrome</b> o <b>Microsoft Edge</b> y toque <b>Instalar Ulama</b>.</p><div class="fila mt"><button class="btn" id="iCop">Copiar dirección</button></div>`;
  else h = `<ol style="padding-left:4px;list-style:none">${paso(1, `En la barra de direcciones, a la derecha, toque el ícono de <b>Instalar</b> (una pantalla con una flecha).`)}${paso(2, `Si no lo ve, abra el menú <b>${d.edge ? "…" : "⋮"}</b> → ${d.edge ? "<b>Aplicaciones → Instalar este sitio como aplicación</b>" : "<b>Transmitir, guardar y compartir → Instalar página como app</b> (o <b>Instalar Ulama</b>)"}.`)}${paso(3, `Confirme con <b>Instalar</b>. Ulama quedará en su escritorio y en el menú de inicio.`)}</ol>`;
  dlg(`<h3>Instalar Ulama en ${d.ipad ? "su iPad" : d.ios ? "su iPhone" : d.android ? "su celular" : "su computadora"}</h3>${h}<p class="small muted mt">Ya instalada se abre como una aplicación, en pantalla completa, y funciona aunque no haya internet.</p><div class="fila fin mt"><button class="btn m" id="iOk">Entendido</button></div>`, v => {
    v.querySelector("#iOk").onclick = cerrarDlg; const c = v.querySelector("#iCop"); if (c) c.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(location.href.split("#")[0]); toast("Dirección copiada."); }; }); }
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
(async () => { const admin = /[#&]admin\b/.test(location.hash || ""); $("#app").innerHTML = `<main class="wrap"><p class="muted" style="margin-top:40vh;text-align:center">Abriendo Ulama…</p></main>`;
  await verificarAcceso(); gPrecargar(); history.replaceState({ n: 0 }, "", location.pathname + location.search);
  if (ACCESO_OK && !enApp() && !ghTok()) recordarEnlaceAlInstalar(lsGet("ulama-tok", ""));
  if (admin) S = { v: "admin" }; pintar(); })();
