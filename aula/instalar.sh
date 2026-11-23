#!/usr/bin/env bash
# =====================================================================
#  Aula Zona 050 · Computadora de ALUMNOS (Dell, HP, iMac…) con Linux Mint XFCE
#  Supervisión Escolar Zona 050 · Primaria Federalizada · Camalú, B.C.
#
#  Convierte una computadora antigua en una estación para alumnos:
#   - Al encender entra sola la cuenta "Alumno" con la pantalla Aula Zona 050
#     (GCompris, Tux Paint, matemáticas, teclado, YouTube, libros de la SEP…).
#   - Lo que haga el alumno se borra al terminar (la máquina queda siempre limpia).
#   - Cuenta "Maestro" con contraseña para el docente.
#   - YouTube en modo restringido, sin publicidad y ligero para equipos antiguos.
#   - Educación Física en el salón para días de lluvia (app propia, sin internet).
#   - Biblioteca sin internet: ajedrez (también en red entre computadoras), juegos de mente,
#     sudoku, geografía y mecanografía. Funciona aunque la escuela no tenga internet.
#   - Aprende a programar: Laberinto y la tortuga que dibuja, con bloques en español.
#   - Libros de texto de la SEP por grado, guardados en el servidor para leerlos sin internet.
#   - Retos Zona 050: práctica diaria (cálculo, tablas, problemas, fracciones, ortografía, lectura)
#     con un tablero para que el maestro vea el avance de cada alumno.
#   - Una computadora puede ser el «servidor de la escuela» (--servidor): organiza el ajedrez en red,
#     guarda los resultados de los Retos, comparte una carpeta con videos y libros, y guarda
#     enciclopedia, diccionario y simulaciones de ciencias (Kiwix) y Kolibri (videos y ejercicios
#     de Khan Academy en español) para usarlos sin internet desde todas las computadoras.
#
#  Uso (con la computadora conectada por cable de red y CON internet solo durante la instalación):
#     sudo bash instalar.sh --clave-maestro CLAVE
#     sudo bash instalar.sh --clave-maestro CLAVE --impresora 192.168.1.50
#     sudo bash instalar.sh --clave-maestro CLAVE --servidor              (solo en UNA computadora)
#     sudo bash instalar.sh --clave-maestro CLAVE --servidor --wikipedia  (además Wikipedia en español)
#  Se puede volver a correr sin problema: no duplica nada.
# =====================================================================
set -uo pipefail

VERSION="1.1"
BASE_URL="https://carlosog23.github.io/Carlos-Ortega/aula"
DIR_AULA="/usr/share/aula"
DIR_RECURSOS="$(cd "$(dirname "$0")" && pwd)/recursos"
DIR_PAQUETE="$(cd "$(dirname "$0")" && pwd)"
LOG="/var/log/aula-instalacion.log"
CLAVE_MAESTRO=""
IP_IMPRESORA=""
SERVIDOR=0
WIKIPEDIA=0

verde() { printf '\033[1;32m%s\033[0m\n' "$*"; }
amarillo() { printf '\033[1;33m%s\033[0m\n' "$*"; }
rojo() { printf '\033[1;31m%s\033[0m\n' "$*"; }
paso() { echo; printf '\033[1;34m▶ %s\033[0m\n' "$*"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --clave-maestro|--usuario-maestro) CLAVE_MAESTRO="${2:-}"; shift 2
      [ ${#CLAVE_MAESTRO} -ge 4 ] || { rojo "La clave de la cuenta Maestro debe tener al menos 4 caracteres."; exit 1; } ;;
    --impresora) IP_IMPRESORA="${2:-}"; shift 2 ;;
    --servidor) SERVIDOR=1; shift ;;
    --wikipedia) WIKIPEDIA=1; SERVIDOR=1; shift ;;
    -h|--help|--ayuda) sed -n '2,32p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) rojo "Opción no reconocida: $1"; exit 1 ;;
  esac
done

[ "$(id -u)" -eq 0 ] || { rojo "Hay que correrlo con sudo:  sudo bash instalar.sh"; exit 1; }
if [ -n "$IP_IMPRESORA" ] && ! [[ "$IP_IMPRESORA" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
  rojo "La dirección de la impresora no parece válida: '$IP_IMPRESORA' (ejemplo: 192.168.1.50)"; exit 1
fi

exec > >(tee -a "$LOG") 2>&1
echo "===== $(date) · Aula Zona 050 · instalar.sh v$VERSION ====="

# ---------- comprobaciones ----------
paso "Comprobando el sistema"
grep -qiE 'linuxmint|ubuntu' /etc/os-release || { rojo "Este instalador es para Linux Mint."; exit 1; }
grep PRETTY_NAME /etc/os-release
[ -f "$DIR_RECURSOS/aula-inicio" ] || { rojo "No encuentro la carpeta 'recursos' junto al instalador. Copia la carpeta completa aula-zona050."; exit 1; }
RAM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
echo "Memoria RAM: ${RAM_MB} MB · Procesador: $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | xargs)"
if ! wget -q --spider -T 10 -t 2 http://deb.debian.org/ && ! ping -c 2 -W 3 8.8.8.8 >/dev/null 2>&1; then
  rojo "No hay internet. Revisa el cable de red y vuelve a correr el instalador."; exit 1
fi
verde "Internet OK."

# ---------- fecha y hora (sin hora correcta, Firefox rechaza todas las páginas seguras) ----------
paso "Ajustando la fecha y la hora"
cat > /usr/local/bin/zona050-hora <<'HORA'
#!/bin/bash
# Pone la iMac en hora de Tijuana. Usa la hora de internet (NTP) y, si la red de la escuela la bloquea,
# la toma del encabezado de una página web. La pila del reloj de las iMac viejas suele estar agotada.
timedatectl set-timezone America/Tijuana 2>/dev/null
timedatectl set-ntp true 2>/dev/null
for i in 1 2 3 4 5 6; do
  F=$(LC_ALL=C wget -S --spider -T 8 -t 1 http://www.google.com 2>&1 | sed -n 's/^ *[Dd]ate: *//p' | head -1)
  [ -n "$F" ] && break; sleep 5
done
[ -z "$F" ] && exit 0
RED=$(date -u -d "$F" +%s 2>/dev/null) || exit 0
YA=$(date -u +%s)
DIF=$(( RED > YA ? RED - YA : YA - RED ))
if [ "$DIF" -gt 90 ]; then date -u -s "@$RED" >/dev/null && hwclock -w 2>/dev/null; echo "Hora corregida (diferencia de ${DIF} s)."; fi
HORA
chmod 755 /usr/local/bin/zona050-hora
cat > /etc/systemd/system/zona050-hora.service <<'HORA'
[Unit]
Description=Zona 050: poner la iMac en hora
Wants=network-online.target
After=network-online.target
[Service]
Type=oneshot
ExecStart=/usr/local/bin/zona050-hora
HORA
cat > /etc/systemd/system/zona050-hora.timer <<'HORA'
[Unit]
Description=Zona 050: revisar la hora al encender y cada 3 horas
[Timer]
OnBootSec=40s
OnUnitActiveSec=3h
[Install]
WantedBy=timers.target
HORA
systemctl daemon-reload
systemctl enable --now zona050-hora.timer >/dev/null 2>&1
/usr/local/bin/zona050-hora
verde "Fecha y hora: $(date '+%d/%m/%Y %H:%M')"

export DEBIAN_FRONTEND=noninteractive
APT="apt-get -y -q -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold"
paso "Actualizando la lista de programas"
apt-get update -q
instalar() {
  local p
  for p in "$@"; do
    dpkg -s "$p" >/dev/null 2>&1 && continue
    if apt-cache show "$p" >/dev/null 2>&1; then
      $APT install "$p" >/dev/null 2>&1 && echo "  + $p" || amarillo "  ! no se pudo instalar $p"
    fi
  done
}

# ---------- WiFi Broadcom (iMac y algunas laptops) ----------
if lspci -nn 2>/dev/null | grep -iE 'network|wireless' | grep -qi '14e4'; then
  paso "WiFi (tarjeta Broadcom)"
  instalar dkms "linux-headers-$(uname -r)" bcmwl-kernel-source
  modprobe -r b43 bcma ssb >/dev/null 2>&1 || true
  modprobe wl >/dev/null 2>&1 && verde "Controlador WiFi activado." || amarillo "El WiFi quedará listo después de reiniciar."
fi

# ---------- programas ----------
paso "Instalando programas educativos y de oficina (puede tardar 15 a 30 minutos)"
instalar firefox firefox-locale-es language-pack-es language-pack-gnome-es \
  gcompris-qt gcompris-qt-data tuxpaint tuxpaint-stamps-default tuxpaint-config tuxmath tuxtype \
  libreoffice-writer libreoffice-impress libreoffice-calc libreoffice-gtk3 libreoffice-l10n-es libreoffice-help-es hunspell-es \
  fonts-crosextra-carlito fonts-crosextra-caladea fonts-noto-color-emoji \
  gnome-calculator python3-gi gir1.2-gtk-3.0 \
  libavcodec-extra ffmpeg i965-va-driver va-driver-all \
  zram-tools cups cups-filters printer-driver-all hplip system-config-printer \
  avahi-daemon libnss-mdns python3 \
  gbrainy gnome-sudoku klavaro kgeography
verde "Programas instalados."

# Quita programas que no usan los alumnos y gastan memoria
for p in thunderbird hexchat transmission-gtk warpinator; do
  dpkg -s "$p" >/dev/null 2>&1 && $APT purge "$p" >/dev/null 2>&1 && echo "  - $p"
done

# ---------- memoria (2 GB): zram ----------
paso "Optimizando la memoria"
if [ -f /etc/default/zramswap ]; then
  cat > /etc/default/zramswap <<'EOF'
# Aula Zona 050: memoria comprimida para equipos con poca RAM
ALGO=zstd
PERCENT=75
PRIORITY=100
EOF
  systemctl restart zramswap >/dev/null 2>&1 || true
  printf 'vm.swappiness=150\nvm.page-cluster=0\n' > /etc/sysctl.d/90-aula.conf
  sysctl -p /etc/sysctl.d/90-aula.conf >/dev/null 2>&1 || true
  verde "Memoria comprimida activada."
fi

# ---------- pantalla del alumno ----------
paso "Instalando la pantalla Aula Zona 050"
mkdir -p "$DIR_AULA" /var/lib/aula
install -m 755 "$DIR_RECURSOS/aula-inicio" /usr/local/bin/aula-inicio
cp -f "$DIR_PAQUETE/aula.json" "$DIR_AULA/aula.json"
cp -f "$DIR_RECURSOS/fondo-aula.png" "$DIR_AULA/fondo-aula.png"
rm -rf "$DIR_AULA/ef"; cp -r "$DIR_RECURSOS/ef" "$DIR_AULA/ef"
# Biblioteca sin internet (ajedrez y más) y el servicio de la red de la escuela (puerto 8050)
rm -rf "$DIR_AULA/web"; cp -r "$DIR_RECURSOS/web" "$DIR_AULA/web"; cp -r "$DIR_RECURSOS/ef" "$DIR_AULA/web/ef"
install -m 755 "$DIR_RECURSOS/zona050-red.py" /usr/local/bin/zona050-red
chmod -R a+rX "$DIR_AULA"
cat > /etc/systemd/system/zona050-red.service <<'SERVICIO'
[Unit]
Description=Aula Zona 050 · biblioteca sin internet y ajedrez en red (puerto 8050)
After=network.target
[Service]
ExecStart=/usr/bin/python3 /usr/local/bin/zona050-red
Restart=always
DynamicUser=yes
StateDirectory=aula-red
[Install]
WantedBy=multi-user.target
SERVICIO
systemctl daemon-reload
systemctl enable zona050-red.service >/dev/null 2>&1; systemctl restart zona050-red.service >/dev/null 2>&1
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow 8050/tcp >/dev/null; ufw allow 8051/tcp >/dev/null; ufw allow 5353/udp >/dev/null
fi
verde "Biblioteca sin internet lista (http://localhost:8050)."

# ---------- red de la escuela SIN internet ----------
# Si no hay módem que reparta direcciones, las computadoras se dan una dirección automática (169.254.x.x)
# y se encuentran por nombre (aula-servidor.local) gracias a Avahi.
paso "Red de la escuela (también sin internet)"
systemctl enable --now avahi-daemon >/dev/null 2>&1 || true
if command -v nmcli >/dev/null 2>&1; then
  nmcli -t -f NAME,TYPE connection show 2>/dev/null | awk -F: '$2 ~ /ethernet/ {print $1}' | while IFS= read -r CON; do
    nmcli connection modify "$CON" ipv4.link-local fallback >/dev/null 2>&1 || nmcli connection modify "$CON" ipv4.dhcp-timeout 30 >/dev/null 2>&1 || true
  done
fi
verde "Las computadoras podrán verse entre sí aunque no haya internet."

# Los botones se pueden cambiar desde GitHub (aula.json): se revisa al encender y cada hora
cat > /usr/local/bin/aula-actualizar <<EOF
#!/bin/bash
T=\$(mktemp)
if wget -q -T 20 -t 2 -O "\$T" "$BASE_URL/aula.json?v=\$(date +%s)" && python3 -c "import json,sys; d=json.load(open(sys.argv[1])); assert d['secciones']" "\$T" 2>/dev/null; then
  install -m 644 "\$T" /var/lib/aula/aula.json
fi
rm -f "\$T"
EOF
chmod 755 /usr/local/bin/aula-actualizar
cat > /etc/systemd/system/aula-actualizar.service <<'EOF'
[Unit]
Description=Aula Zona 050: actualizar botones
Wants=network-online.target
After=network-online.target
[Service]
Type=oneshot
ExecStart=/usr/local/bin/aula-actualizar
EOF
cat > /etc/systemd/system/aula-actualizar.timer <<'EOF'
[Unit]
Description=Aula Zona 050: revisar botones al encender y cada hora
[Timer]
OnBootSec=1min
OnUnitActiveSec=1h
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now aula-actualizar.timer >/dev/null 2>&1
/usr/local/bin/aula-actualizar

cat > /usr/share/applications/aula-inicio.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Aula Zona 050
Comment=Pantalla de actividades para alumnos
Exec=aula-inicio
Icon=applications-education
Terminal=false
Categories=Education;
EOF

# Fondo de pantalla para todos (se pone al iniciar sesión)
cat > /usr/local/bin/aula-fondo <<'EOF'
#!/bin/bash
sleep 3
for p in $(xfconf-query -c xfce4-desktop -l 2>/dev/null | grep -E '/last-image$'); do
  xfconf-query -c xfce4-desktop -p "$p" -s /usr/share/aula/fondo-aula.png 2>/dev/null
done
EOF
chmod 755 /usr/local/bin/aula-fondo
cat > /etc/xdg/autostart/aula-fondo.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Fondo Aula Zona 050
Exec=aula-fondo
OnlyShowIn=XFCE;
NoDisplay=true
EOF
if [ -d /etc/lightdm ]; then
  CONF=/etc/lightdm/slick-greeter.conf; touch "$CONF"
  grep -q '^\[Greeter\]' "$CONF" || echo '[Greeter]' >> "$CONF"
  sed -i '/^background=/d;/^draw-user-backgrounds=/d' "$CONF"
  sed -i "/^\[Greeter\]/a draw-user-backgrounds=false" "$CONF"
  sed -i "/^\[Greeter\]/a background=$DIR_AULA/fondo-aula.png" "$CONF"
fi

# ---------- cuenta del alumno: entra sola y se limpia ----------
paso "Cuenta del alumno"
if ! id alumno >/dev/null 2>&1; then
  useradd -m -s /bin/bash -c "Alumno" alumno
fi
passwd -d alumno >/dev/null
groupadd -f nopasswdlogin; usermod -aG nopasswdlogin alumno
for g in sudo adm lpadmin; do gpasswd -d alumno "$g" >/dev/null 2>&1 || true; done
for g in audio video plugdev; do usermod -aG "$g" alumno 2>/dev/null || true; done

# Plantilla: así queda la cuenta del alumno cada vez que entra
PL="$DIR_AULA/plantilla-alumno"
rm -rf "$PL"; mkdir -p "$PL/.config/autostart" "$PL/Escritorio" "$PL/Documentos" "$PL/.linuxmint/mintwelcome"
touch "$PL/.linuxmint/mintwelcome/norun.flag"
cp /usr/share/applications/aula-inicio.desktop "$PL/.config/autostart/aula-inicio.desktop"
cp /usr/share/applications/aula-inicio.desktop "$PL/Escritorio/aula-inicio.desktop"
chmod 755 "$PL/Escritorio/aula-inicio.desktop"
printf '[Desktop Entry]\nHidden=true\n' > "$PL/.config/autostart/mintwelcome.desktop"
printf '[Desktop Entry]\nHidden=true\n' > "$PL/.config/autostart/mintupdate.desktop"

cat > /usr/local/sbin/aula-limpiar <<'EOF'
#!/bin/bash
# Deja la cuenta del alumno como nueva. Lo llaman el arranque (con "alumno") y PAM al abrir sesión (PAM_USER).
U="${1:-${PAM_USER:-}}"
[ "$U" = alumno ] || exit 0
[ -n "${PAM_TYPE:-}" ] && [ "$PAM_TYPE" != open_session ] && exit 0
pgrep -u alumno -x xfce4-session >/dev/null 2>&1 && exit 0   # ya hay una sesión abierta: no se toca
rm -rf /home/alumno
cp -a /usr/share/aula/plantilla-alumno /home/alumno
chown -R alumno:alumno /home/alumno
chmod 700 /home/alumno
exit 0
EOF
chmod 755 /usr/local/sbin/aula-limpiar
/usr/local/sbin/aula-limpiar alumno

mkdir -p /etc/lightdm/lightdm.conf.d
cat > /etc/lightdm/lightdm.conf.d/70-aula.conf <<'EOF'
# Aula Zona 050: al encender entra sola la cuenta Alumno
[Seat:*]
autologin-user=alumno
autologin-user-timeout=0
EOF
# Antes de cada sesión del alumno se limpia su carpeta (PAM de la pantalla de inicio)
for f in /etc/pam.d/lightdm /etc/pam.d/lightdm-autologin; do
  [ -f "$f" ] || continue
  grep -q aula-limpiar "$f" && continue
  ln=$(grep -n '^session' "$f" | head -1 | cut -d: -f1)
  if [ -n "$ln" ]; then sed -i "${ln}i session optional pam_exec.so quiet /usr/local/sbin/aula-limpiar" "$f"
  else echo "session optional pam_exec.so quiet /usr/local/sbin/aula-limpiar" >> "$f"; fi
done
cat > /etc/systemd/system/aula-limpiar.service <<'EOF'
[Unit]
Description=Aula Zona 050: limpiar la cuenta del alumno al encender
Before=display-manager.service
[Service]
Type=oneshot
ExecStart=/usr/local/sbin/aula-limpiar alumno
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload; systemctl enable aula-limpiar.service >/dev/null 2>&1
verde "Al encender entra la cuenta Alumno; al terminar se borra todo lo que hizo."

# ---------- cuenta del maestro ----------
if [ -n "$CLAVE_MAESTRO" ]; then
  paso "Cuenta del maestro"
  id maestro >/dev/null 2>&1 || useradd -m -s /bin/bash -c "Maestro" maestro
  echo "maestro:$CLAVE_MAESTRO" | chpasswd
  # La misma clave abre el tablero del maestro de «Retos Zona 050» (se guarda solo su huella, no la clave)
  mkdir -p /etc/aula; printf '%s' "$CLAVE_MAESTRO" | sha256sum | cut -d' ' -f1 > /etc/aula/clave-maestro.sha256; chmod 644 /etc/aula/clave-maestro.sha256
  for g in audio video plugdev lpadmin; do usermod -aG "$g" maestro 2>/dev/null || true; done
  ESC=/home/maestro/Escritorio; mkdir -p "$ESC"
  acceso() { # archivo nombre exec icono
    printf '[Desktop Entry]\nType=Application\nName=%s\nExec=%s\nIcon=%s\nTerminal=false\n' "$2" "$3" "$4" > "$ESC/$1.desktop"; chmod 755 "$ESC/$1.desktop"
  }
  acceso tlamatini "Tlamatini" "firefox --new-window https://carlosog23.github.io/Carlos-Ortega/formatos-ppie/" applications-office
  acceso tlamatini-aula "Tlamatini Aula" "firefox --new-window https://carlosog23.github.io/Carlos-Ortega/tlamatini-aula/" applications-education
  acceso aula "Aula Zona 050 (pantalla del alumno)" "aula-inicio" applications-education
  acceso youtube "YouTube" "firefox --new-window https://www.youtube.com/" multimedia-video-player
  acceso biblioteca "Biblioteca sin internet" "firefox --new-window http://localhost:8050/" accessories-dictionary
  acceso programa "Aprende a programar" "firefox --new-window http://localhost:8050/programa/" applications-development
  acceso retos-maestro "Retos · avance de mis alumnos" "firefox --new-window http://localhost:8050/retos/maestro.html" x-office-spreadsheet
  acceso word "Documentos (Word)" "libreoffice --writer" libreoffice-writer
  acceso excel "Hojas de cálculo (Excel)" "libreoffice --calc" libreoffice-calc
  acceso powerpoint "Presentaciones (PowerPoint)" "libreoffice --impress" libreoffice-impress
  chown -R maestro:maestro /home/maestro
  verde "Cuenta Maestro lista (con la clave que escribiste)."
else
  amarillo "No se creó la cuenta Maestro (falta --clave-maestro CLAVE)."
fi

# ---------- servidor de la escuela (solo con --servidor) ----------
if [ "$SERVIDOR" = 1 ]; then
  paso "Servidor de la escuela"
  hostnamectl set-hostname aula-servidor 2>/dev/null || echo aula-servidor > /etc/hostname
  if grep -q '^127.0.1.1' /etc/hosts; then sed -i 's/^127\.0\.1\.1.*/127.0.1.1\taula-servidor/' /etc/hosts; else printf '127.0.1.1\taula-servidor\n' >> /etc/hosts; fi
  systemctl restart avahi-daemon >/dev/null 2>&1 || true
  mkdir -p /srv/aula/compartido/Videos /srv/aula/compartido/Libros /srv/aula/compartido/Audios /srv/aula/kiwix
  printf 'Carpeta de la escuela\n\nTodo lo que pongas aquí (videos .mp4, libros en PDF, audios .mp3, imágenes) lo ven los alumnos\nen la Biblioteca sin internet de todas las computadoras, aunque no haya internet.\n' > /srv/aula/compartido/LEEME.txt
  # Libros de texto: un estante por grado (los alumnos los abren sin internet desde la Biblioteca)
  LT="/srv/aula/compartido/Libros de texto"
  for g in "1° grado" "2° grado" "3° grado" "4° grado" "5° grado" "6° grado" "Multigrado" "Para el maestro"; do mkdir -p "$LT/$g"; done
  printf 'Libros de texto\n\nCopia aquí los libros en PDF, cada uno en la carpeta de su grado.\nLos alumnos los verán en «Libros de texto» de la Biblioteca sin internet.\nCuando haya internet, el ícono «Descargar libros de texto» baja los que falten.\n' > "$LT/LEEME.txt"
  install -m 755 "$DIR_RECURSOS/aula-libros" /usr/local/bin/aula-libros
  [ -f "$DIR_RECURSOS/libros.txt" ] && install -m 644 "$DIR_RECURSOS/libros.txt" /usr/share/aula/libros.txt
  echo "  Descargando libros de texto (puede tardar)…"
  /usr/local/bin/aula-libros || amarillo "  ! Algunos libros no se pudieron descargar; se pueden bajar después o copiar desde una USB."
  if id maestro >/dev/null 2>&1; then chown -R maestro:maestro /srv/aula/compartido; fi
  chmod -R a+rX /srv/aula
  # Kiwix: enciclopedia, diccionario y simulaciones de ciencias para consultar sin internet
  instalar kiwix-tools
  if ! command -v kiwix-serve >/dev/null 2>&1; then
    T=$(mktemp -d)
    if wget -q -T 30 -t 2 -O "$T/k.tgz" https://download.kiwix.org/release/kiwix-tools/kiwix-tools_linux-x86_64.tar.gz; then
      tar xzf "$T/k.tgz" -C "$T" && install -m 755 "$T"/kiwix-tools*/kiwix-serve /usr/local/bin/ && echo "  + kiwix-serve"
    fi
    rm -rf "$T"
  fi
  ultimo() { # carpeta patrón → nombre del archivo .zim más reciente
    wget -q -T 30 -t 2 -O - "https://download.kiwix.org/zim/$1/" 2>/dev/null | grep -o "$2_[0-9-]*\.zim" | sort -u | tail -1; }
  bajar_zim() { # carpeta patrón descripción
    local f; f=$(ultimo "$1" "$2")
    [ -n "$f" ] || { amarillo "  ! no encontré $3"; return; }
    [ -f "/srv/aula/kiwix/$f" ] && { echo "  = $3 ya estaba"; return; }
    echo "  Descargando $3 ($f)…"
    if wget -q -c -T 60 -t 5 -O "/srv/aula/kiwix/$f.parte" "https://download.kiwix.org/zim/$1/$f"; then
      mv "/srv/aula/kiwix/$f.parte" "/srv/aula/kiwix/$f"; echo "  + $3"
      for v in /srv/aula/kiwix/"$2"_*.zim; do [ "$v" = "/srv/aula/kiwix/$f" ] || rm -f "$v"; done
    else amarillo "  ! no se pudo descargar $3 (se puede volver a correr el instalador)"; fi; }
  LIBRE_GB=$(df -BG --output=avail /srv | tail -1 | tr -dc 0-9)
  bajar_zim vikidia vikidia_es_all "Vikidia, enciclopedia para niños"
  bajar_zim phet phet_es_all "simulaciones de ciencias y matemáticas (PhET)"
  bajar_zim wiktionary wiktionary_es_all_nopic "diccionario (Wikcionario)"
  bajar_zim wikibooks wikibooks_es_all_nopic "libros de texto libres (Wikilibros)"
  if [ "$WIKIPEDIA" = 1 ]; then
    if [ "${LIBRE_GB:-0}" -ge 15 ]; then bajar_zim wikipedia wikipedia_es_all_mini "Wikipedia en español (resumida)"
    else amarillo "  ! No hay espacio suficiente para Wikipedia (se necesitan 15 GB libres)."; fi
  fi
  chmod -R a+rX /srv/aula/kiwix
  KS=$(command -v kiwix-serve || true)
  if [ -n "$KS" ]; then
    cat > /etc/systemd/system/aula-kiwix.service <<KIWIX
[Unit]
Description=Aula Zona 050 · enciclopedia y libros sin internet (Kiwix, puerto 8051)
After=network.target
[Service]
ExecStart=/bin/sh -c 'ls /srv/aula/kiwix/*.zim >/dev/null 2>&1 && exec $KS --port 8051 /srv/aula/kiwix/*.zim || exec sleep infinity'
Restart=always
DynamicUser=yes
[Install]
WantedBy=multi-user.target
KIWIX
    systemctl daemon-reload; systemctl enable aula-kiwix.service >/dev/null 2>&1; systemctl restart aula-kiwix.service >/dev/null 2>&1
  else
    amarillo "  ! No se pudo instalar Kiwix; la enciclopedia quedará pendiente."
  fi
  # Kolibri: videos y ejercicios de Khan Academy y otros canales, sin internet (puerto 8080)
  if ! dpkg -s kolibri >/dev/null 2>&1; then
    echo "  Instalando Kolibri…"
    instalar software-properties-common
    if add-apt-repository -y ppa:learningequality/kolibri >/dev/null 2>&1 && apt-get update -q >/dev/null 2>&1; then
      DEBIAN_FRONTEND=noninteractive $APT install kolibri >/dev/null 2>&1 && echo "  + Kolibri" || amarillo "  ! no se pudo instalar Kolibri"
    else amarillo "  ! no se pudo agregar el repositorio de Kolibri"; fi
  fi
  if dpkg -s kolibri >/dev/null 2>&1; then
    systemctl enable kolibri >/dev/null 2>&1; systemctl restart kolibri >/dev/null 2>&1
    if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then ufw allow 8080/tcp >/dev/null; fi
  fi
  systemctl restart zona050-red.service >/dev/null 2>&1
  if id maestro >/dev/null 2>&1; then
    ESC=/home/maestro/Escritorio; mkdir -p "$ESC"
    printf '[Desktop Entry]\nType=Application\nName=Libros de texto (agregar desde USB)\nExec=xdg-open "/srv/aula/compartido/Libros de texto"\nIcon=x-office-document\nTerminal=false\n' > "$ESC/libros-texto.desktop"
    printf '[Desktop Entry]\nType=Application\nName=Descargar libros de texto (con internet)\nExec=pkexec /usr/local/bin/aula-libros\nIcon=emblem-downloads\nTerminal=true\n' > "$ESC/descargar-libros.desktop"
    chmod 755 "$ESC/libros-texto.desktop" "$ESC/descargar-libros.desktop"; chown maestro:maestro "$ESC/libros-texto.desktop" "$ESC/descargar-libros.desktop"
    dpkg -s kolibri >/dev/null 2>&1 && printf '[Desktop Entry]\nType=Application\nName=Kolibri (videos y ejercicios sin internet)\nExec=firefox --new-window http://localhost:8080/\nIcon=applications-education\nTerminal=false\n' > "$ESC/kolibri.desktop" && chmod 755 "$ESC/kolibri.desktop" && chown maestro:maestro "$ESC/kolibri.desktop"
    printf '[Desktop Entry]\nType=Application\nName=Carpeta de la escuela (la ven los alumnos)\nExec=xdg-open /srv/aula/compartido\nIcon=folder-publicshare\nTerminal=false\n' > "$ESC/carpeta-escuela.desktop"
    chmod 755 "$ESC/carpeta-escuela.desktop"; chown maestro:maestro "$ESC/carpeta-escuela.desktop"
  fi
  verde "Esta computadora es el servidor de la escuela (aula-servidor). Déjala encendida mientras los alumnos trabajan."
fi

# ---------- Firefox: YouTube ligero, sin publicidad, sin datos guardados ----------
paso "Configurando Firefox"
POLITICAS=$(cat <<'EOF'
{
  "policies": {
    "Homepage": { "URL": "http://localhost:8050/", "StartPage": "homepage" },
    "DontCheckDefaultBrowser": true,
    "DisableTelemetry": true,
    "DisableFirefoxStudies": true,
    "DisablePocket": true,
    "OverrideFirstRunPage": "",
    "OverridePostUpdatePage": "",
    "RequestedLocales": ["es-MX", "es-ES"],
    "DNSOverHTTPS": { "Enabled": false, "Locked": true },
    "PasswordManagerEnabled": false,
    "OfferToSaveLogins": false,
    "SanitizeOnShutdown": { "Cookies": true, "Cache": true, "History": true, "Sessions": true, "FormData": true, "Locked": true },
    "ExtensionSettings": {
      "uBlock0@raymondhill.net": { "installation_mode": "force_installed", "install_url": "https://addons.mozilla.org/firefox/downloads/latest/ublock-origin/latest.xpi" },
      "jid1-TSgSxBhncsPBWQ@jetpack": { "installation_mode": "force_installed", "install_url": "https://addons.mozilla.org/firefox/downloads/latest/h264ify/latest.xpi" }
    },
    "Preferences": {
      "media.av1.enabled":               { "Value": false, "Status": "locked" },
      "media.mediasource.vp9.enabled":   { "Value": false, "Status": "locked" },
      "media.ffmpeg.vaapi.enabled":      { "Value": true,  "Status": "default" },
      "browser.tabs.unloadOnLowMemory":  { "Value": true,  "Status": "default" },
      "browser.sessionstore.interval":   { "Value": 120000, "Status": "default" },
      "browser.cache.memory.capacity":   { "Value": 65536, "Status": "default" },
      "dom.ipc.processCount":            { "Value": 2,     "Status": "default" }
    }
  }
}
EOF
)
for d in /etc/firefox/policies /usr/lib/firefox/distribution; do
  if [ "$d" = /etc/firefox/policies ] || [ -d /usr/lib/firefox ]; then mkdir -p "$d"; echo "$POLITICAS" > "$d/policies.json"; fi
done
verde "Firefox: sin publicidad (uBlock Origin), YouTube en H.264 (más ligero) y no guarda datos."

# ---------- contenido apto para niños: YouTube restringido y Google SafeSearch ----------
paso "YouTube en modo restringido y búsqueda segura"
sed -i '/# aula-zona050 inicio/,/# aula-zona050 fin/d' /etc/hosts
cat >> /etc/hosts <<'EOF'
# aula-zona050 inicio (YouTube modo restringido moderado y Google SafeSearch)
216.239.38.119 www.youtube.com m.youtube.com youtubei.googleapis.com youtube.googleapis.com www.youtube-nocookie.com
216.239.38.120 www.google.com www.google.com.mx
# aula-zona050 fin
EOF
verde "Listo."

# ---------- oficina: guardar como Word, Excel y PowerPoint ----------
mkdir -p /etc/libreoffice/registry
cat > /etc/libreoffice/registry/aula.xcd <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<oor:data xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:oor="http://openoffice.org/2001/registry">
<dependency file="main"/>
<oor:component-data oor:name="Setup" oor:package="org.openoffice">
 <node oor:name="Office"><node oor:name="Factories">
  <node oor:name="com.sun.star.text.TextDocument"><prop oor:name="ooSetupFactoryDefaultFilter"><value>MS Word 2007 XML</value></prop></node>
  <node oor:name="com.sun.star.sheet.SpreadsheetDocument"><prop oor:name="ooSetupFactoryDefaultFilter"><value>Calc MS Excel 2007 XML</value></prop></node>
  <node oor:name="com.sun.star.presentation.PresentationDocument"><prop oor:name="ooSetupFactoryDefaultFilter"><value>Impress MS PowerPoint 2007 XML</value></prop></node>
 </node></node>
</oor:component-data>
<oor:component-data oor:name="Common" oor:package="org.openoffice.Office">
 <node oor:name="Save"><node oor:name="Document"><prop oor:name="WarnAlienFormat"><value>false</value></prop></node></node>
</oor:component-data>
</oor:data>
EOF
[ -d /usr/lib/libreoffice/share/registry ] && cp -f /etc/libreoffice/registry/aula.xcd /usr/lib/libreoffice/share/registry/aula.xcd

# ---------- impresora (opcional) ----------
if [ -n "$IP_IMPRESORA" ]; then
  paso "Impresora de la dirección ($IP_IMPRESORA)"
  lpadmin -p Impresora-Direccion -E -v "ipp://$IP_IMPRESORA/ipp/print" -m everywhere >/dev/null 2>&1 \
    && lpadmin -d Impresora-Direccion && verde "Impresora agregada." \
    || amarillo "No se pudo agregar la impresora. Revisa que esté encendida y su dirección."
fi

# ---------- actualizaciones automáticas ----------
paso "Actualizaciones automáticas"
if command -v mintupdate-automation >/dev/null 2>&1; then
  mintupdate-automation upgrade enable >/dev/null 2>&1 && verde "Activadas."
fi

echo
verde "=============================================================="
verde "  Listo. Reinicia la computadora:   sudo reboot"
verde "  Al encender entrará sola la cuenta Alumno."
[ "$SERVIDOR" = 1 ] && verde "  Esta es la computadora SERVIDOR de la escuela (aula-servidor)."
verde "=============================================================="
echo "Registro completo en: $LOG"
