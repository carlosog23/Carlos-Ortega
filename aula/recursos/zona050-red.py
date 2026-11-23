#!/usr/bin/env python3
# Aula Zona 050 · Servicio de la red de la escuela (funciona SIN internet).
# Corre en todas las computadoras (puerto 8050):
#   - Sirve las páginas sin internet de /usr/share/aula/web (ajedrez, biblioteca, Educación Física…).
#   - En la computadora «servidor de la escuela» (nombre aula-servidor) además:
#       · organiza las partidas de ajedrez en red entre computadoras;
#       · comparte la carpeta /srv/aula/compartido (videos, PDF, audios que suba el maestro);
#       · informa qué libros sin internet (Kiwix: enciclopedia, diccionario, simulaciones) hay.
# Solo usa la biblioteca estándar de Python 3. Supervisión Escolar Zona 050 · Mtro. Carlos Ortega.
import json, os, re, secrets, socket, threading, time, html, urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PUERTO = int(os.environ.get("AULA_PUERTO", "8050"))
WEB = os.environ.get("AULA_WEB", "/usr/share/aula/web")
COMPARTIDO = os.environ.get("AULA_COMPARTIDO", "/srv/aula/compartido")
KIWIX = os.environ.get("AULA_KIWIX", "/srv/aula/kiwix")
SALAS, CANDADO = {}, threading.Lock()
ES_SERVIDOR = os.environ.get("AULA_SERVIDOR") == "1" or socket.gethostname() == "aula-servidor"
DURA = 3 * 3600          # una sala sin movimiento se borra a las 3 horas

def limpiar():
    ahora = time.time()
    for k in [k for k, s in SALAS.items() if ahora - s["t"] > DURA]:
        SALAS.pop(k, None)

def publica(s):
    return {k: s[k] for k in ("id", "blancas", "negras", "movs", "estado", "resultado", "v", "creada")}

def nombre_limpio(t):
    t = re.sub(r"\s+", " ", str(t or "")).strip()[:24]
    return t or "Jugador"

TIPOS = {".zim": "application/octet-stream", ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg", ".pdf": "application/pdf", ".js": "text/javascript", ".mjs": "text/javascript"}

class Manejador(SimpleHTTPRequestHandler):
    server_version = "AulaZona050/1.0"
    extensions_map = dict(SimpleHTTPRequestHandler.extensions_map, **TIPOS)

    def __init__(self, *a, **k):
        super().__init__(*a, directory=WEB, **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        if self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204); self.end_headers()

    def json(self, obj, codigo=200):
        b = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers(); self.wfile.write(b)

    def cuerpo(self):
        n = min(int(self.headers.get("Content-Length") or 0), 20000)
        try:
            return json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return {}

    # ---------- GET ----------
    def do_GET(self):
        ruta = urllib.parse.urlparse(self.path).path
        if ruta == "/api/ping":
            return self.json({"ok": True, "equipo": socket.gethostname(), "servidor": ES_SERVIDOR})
        if ruta == "/api/salas":
            with CANDADO:
                limpiar()
                L = sorted(SALAS.values(), key=lambda s: -s["creada"])
                return self.json({"salas": [publica(s) for s in L if s["estado"] != "terminada"][:40]})
        m = re.fullmatch(r"/api/salas/([a-z0-9]{6})", ruta)
        if m:
            with CANDADO:
                s = SALAS.get(m.group(1))
                return self.json(publica(s)) if s else self.json({"error": "La partida ya no existe."}, 404)
        if ruta == "/api/biblioteca":
            libros = []
            try:
                libros = sorted(f for f in os.listdir(KIWIX) if f.endswith(".zim"))
            except Exception:
                pass
            comp = 0
            try:
                for _, _, fs in os.walk(COMPARTIDO):
                    comp += len([f for f in fs if not f.startswith(".")])
            except Exception:
                pass
            return self.json({"kiwix": libros, "compartido": comp})
        if ruta == "/compartido" or ruta.startswith("/compartido/"):
            return self.compartido(ruta)
        return super().do_GET()

    def compartido(self, ruta):
        rel = urllib.parse.unquote(ruta[len("/compartido"):]).lstrip("/")
        base = os.path.realpath(COMPARTIDO)
        dest = os.path.realpath(os.path.join(base, rel))
        if not (dest == base or dest.startswith(base + os.sep)) or not os.path.exists(dest):
            self.send_error(404, "No existe"); return
        if os.path.isdir(dest):
            if not ruta.endswith("/"):
                self.send_response(301); self.send_header("Location", ruta + "/"); self.end_headers(); return
            items = sorted((f for f in os.listdir(dest) if not f.startswith(".")), key=lambda f: (not os.path.isdir(os.path.join(dest, f)), f.lower()))
            filas = []
            for f in items:
                es_dir = os.path.isdir(os.path.join(dest, f))
                ico = "📁" if es_dir else {"pdf": "📕", "mp4": "🎬", "webm": "🎬", "mp3": "🎵", "jpg": "🖼️", "png": "🖼️", "docx": "📝", "pptx": "📊", "xlsx": "📈"}.get(f.rsplit(".", 1)[-1].lower(), "📄")
                filas.append(f'<a class="it" href="{urllib.parse.quote(f)}{"/" if es_dir else ""}"><span>{ico}</span><b>{html.escape(f)}</b></a>')
            titulo = html.escape("/" + rel) if rel else "Carpeta de la escuela"
            pag = f"""<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{titulo}</title>
<style>body{{font-family:system-ui,sans-serif;background:#F3F7FA;margin:0;color:#0F3B5F}}header{{background:#0F3B5F;color:#fff;padding:18px 26px}}h1{{margin:0;font-size:24px}}main{{padding:20px 26px;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}}
.it{{display:flex;gap:12px;align-items:center;background:#fff;border:2px solid #D6E3EC;border-radius:16px;padding:14px;text-decoration:none;color:inherit;font-size:17px}}.it:hover{{border-color:#E8772E}}.it span{{font-size:30px}}.v{{color:#fff;opacity:.8;text-decoration:none}}</style>
<header style="display:flex;align-items:center;gap:16px"><div style="flex:1"><a class="v" href="{'../' if rel else '/'}">← Regresar</a><h1>📂 {titulo}</h1></div><img src="/img/zona050.png" alt="Zona Escolar 050" style="width:46px;height:46px;border-radius:50%;background:#fff;padding:3px"></header><main>{''.join(filas) or '<p>Esta carpeta está vacía. El maestro puede agregar videos, libros en PDF y más desde la computadora servidor.</p>'}</main><div style="text-align:center;opacity:.75;margin:10px 0 20px"><img src="/img/firma-autor.svg" alt="Maestro Carlos Ortega" style="width:160px"></div></html>"""
            b = pag.encode("utf-8")
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
            return
        # archivo: lo sirve la clase base desde la carpeta compartida
        self.directory = os.path.dirname(dest)
        self.path = "/" + urllib.parse.quote(os.path.basename(dest))
        return super().do_GET()

    # ---------- POST (ajedrez en red) ----------
    def do_POST(self):
        ruta = urllib.parse.urlparse(self.path).path
        d = self.cuerpo()
        with CANDADO:
            limpiar()
            if ruta == "/api/salas":
                if len(SALAS) > 200:
                    return self.json({"error": "Hay demasiadas partidas abiertas."}, 429)
                sid = secrets.token_hex(3)
                tok = secrets.token_urlsafe(12)
                SALAS[sid] = {"id": sid, "blancas": nombre_limpio(d.get("jugador")), "negras": "", "tb": tok, "tn": "", "movs": [],
                              "estado": "esperando", "resultado": "", "v": 1, "t": time.time(), "creada": time.time()}
                return self.json({"id": sid, "token": tok, "color": "w"})
            m = re.fullmatch(r"/api/salas/([a-z0-9]{6})/(unirse|mover|fin)", ruta)
            if not m:
                return self.json({"error": "No encontrado"}, 404)
            s = SALAS.get(m.group(1))
            if not s:
                return self.json({"error": "La partida ya no existe."}, 404)
            acc = m.group(2)
            if acc == "unirse":
                if s["estado"] != "esperando":
                    return self.json({"error": "Esa partida ya empezó."}, 409)
                tok = secrets.token_urlsafe(12)
                s.update(negras=nombre_limpio(d.get("jugador")), tn=tok, estado="jugando", t=time.time()); s["v"] += 1
                return self.json({"id": s["id"], "token": tok, "color": "b"})
            tok = str(d.get("token") or "")
            color = "w" if tok and tok == s["tb"] else "b" if tok and tok == s["tn"] else ""
            if not color:
                return self.json({"error": "No eres jugador de esta partida."}, 403)
            if acc == "mover":
                mov = str(d.get("mov") or "")
                if s["estado"] != "jugando" or not re.fullmatch(r"[a-h][1-8][a-h][1-8][qrbn]?", mov):
                    return self.json({"error": "Movimiento no válido."}, 400)
                turno = "w" if len(s["movs"]) % 2 == 0 else "b"
                if turno != color or int(d.get("num", -1)) != len(s["movs"]):
                    return self.json({"error": "No es tu turno."}, 409)
                s["movs"].append(mov); s["t"] = time.time(); s["v"] += 1
                if d.get("resultado"):
                    s.update(estado="terminada", resultado=str(d["resultado"])[:60])
                return self.json(publica(s))
            if acc == "fin":
                if s["estado"] != "terminada":
                    s.update(estado="terminada", resultado=str(d.get("resultado") or ("Ganan las negras: las blancas abandonaron" if color == "w" else "Ganan las blancas: las negras abandonaron"))[:60]); s["v"] += 1
                return self.json(publica(s))

if __name__ == "__main__":
    srv = ThreadingHTTPServer(("0.0.0.0", PUERTO), Manejador)
    srv.daemon_threads = True
    print(f"Aula Zona 050 · servicio de la red en el puerto {PUERTO}", flush=True)
    srv.serve_forever()
