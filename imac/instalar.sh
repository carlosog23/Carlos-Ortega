#!/usr/bin/env bash
# =====================================================================
#  Zona Escolar 050 · Configuración de iMac con Linux Mint
#  Supervisión Escolar Zona 050 · Primaria Federalizada · Camalú, B.C.
#
#  Uso (desde la carpeta de la USB, con la iMac conectada por cable de red):
#     sudo bash instalar.sh                      -> configura todo
#     sudo bash instalar.sh --impresora 192.168.1.50
#                                               -> además deja fija la
#                                                  impresora de la dirección
#     sudo bash instalar.sh --solo-impresora 192.168.1.50
#                                               -> solo agrega la impresora
#     sudo bash instalar.sh --usuario-maestro CLAVE
#                                               -> crea la cuenta "Maestro"
#                                                  (sin permisos de admin) y
#                                                  la iMac entra sola a ella
#
#  Se puede volver a correr sin problema: no duplica nada.
# =====================================================================
set -uo pipefail

VERSION="2.0"
BASE_URL="https://carlosog23.github.io/Carlos-Ortega"
DIR_ZONA="/usr/share/zona050"
DIR_RECURSOS="$(cd "$(dirname "$0")" && pwd)/recursos"
NOMBRE_IMPRESORA="Impresora-Direccion"
LOG="/var/log/zona050-instalacion.log"

IP_IMPRESORA=""
SOLO_IMPRESORA=0
CLAVE_MAESTRO=""

# ---------- utilidades ----------
verde() { printf '\033[1;32m%s\033[0m\n' "$*"; }
amarillo() { printf '\033[1;33m%s\033[0m\n' "$*"; }
rojo() { printf '\033[1;31m%s\033[0m\n' "$*"; }
paso() { echo; printf '\033[1;34m▶ %s\033[0m\n' "$*"; }

uso() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

while [ $# -gt 0 ]; do
  case "$1" in
    --impresora) IP_IMPRESORA="${2:-}"; shift 2 ;;
    --solo-impresora) IP_IMPRESORA="${2:-}"; SOLO_IMPRESORA=1; shift 2 ;;
    --usuario-maestro) CLAVE_MAESTRO="${2:-}"; shift 2
      [ ${#CLAVE_MAESTRO} -ge 4 ] || { rojo "La clave de la cuenta Maestro debe tener al menos 4 caracteres."; exit 1; } ;;
    -h|--help|--ayuda) uso ;;
    *) rojo "Opción no reconocida: $1"; uso ;;
  esac
done

if [ "$(id -u)" -ne 0 ]; then
  rojo "Hay que correrlo con sudo:  sudo bash instalar.sh"
  exit 1
fi

if [ -n "$IP_IMPRESORA" ] && ! [[ "$IP_IMPRESORA" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
  rojo "La dirección de la impresora no parece válida: '$IP_IMPRESORA' (ejemplo: 192.168.1.50)"
  exit 1
fi

exec > >(tee -a "$LOG") 2>&1
echo "===== $(date) · instalar.sh v$VERSION ====="

# ---------- impresora ----------
configurar_impresora() {
  paso "Impresora de la dirección"
  systemctl enable --now cups >/dev/null 2>&1 || true
  systemctl enable --now cups-browsed >/dev/null 2>&1 || true
  systemctl enable --now avahi-daemon >/dev/null 2>&1 || true

  if [ -z "$IP_IMPRESORA" ]; then
    amarillo "No se indicó la dirección IP de la impresora."
    amarillo "Linux Mint la buscará solo en la red. Si no aparece, cuando tengas la IP corre:"
    amarillo "   sudo bash instalar.sh --solo-impresora 192.168.X.X"
    return 0
  fi

  if ! ping -c 2 -W 2 "$IP_IMPRESORA" >/dev/null 2>&1; then
    amarillo "No responde la impresora en $IP_IMPRESORA (¿está encendida y con cable de red?)."
    amarillo "Se agregará de todos modos; funcionará en cuanto esté disponible."
  fi

  lpadmin -x "$NOMBRE_IMPRESORA" >/dev/null 2>&1 || true

  # 1) Impresoras modernas: sin controlador (IPP Everywhere)
  if lpadmin -p "$NOMBRE_IMPRESORA" -E -v "ipp://$IP_IMPRESORA/ipp/print" -m everywhere \
       -D "Impresora de la dirección" -L "Dirección" >/dev/null 2>&1; then
    verde "Impresora agregada sin controlador (IPP Everywhere)."
  else
    # 2) Buscar el controlador según el modelo que reporta la impresora
    local uri modelo ppd
    uri="socket://$IP_IMPRESORA:9100"
    modelo="$(lpinfo --include-schemes snmp -v 2>/dev/null | grep -F "$IP_IMPRESORA" | head -1 | sed 's/^[^ ]* [^ ]* //')"
    ppd=""
    if [ -n "$modelo" ]; then
      ppd="$(lpinfo -m 2>/dev/null | grep -iF "$(echo "$modelo" | awk '{print $1" "$2}')" | head -1 | awk '{print $1}')"
    fi
    if [ -n "$ppd" ]; then
      lpadmin -p "$NOMBRE_IMPRESORA" -E -v "$uri" -m "$ppd" -D "Impresora de la dirección" -L "Dirección"
      verde "Impresora agregada con controlador: $ppd"
    else
      lpadmin -p "$NOMBRE_IMPRESORA" -E -v "$uri" -m drv:///sample.drv/generic.ppd \
        -D "Impresora de la dirección" -L "Dirección" 2>/dev/null \
        || lpadmin -p "$NOMBRE_IMPRESORA" -E -v "$uri" -D "Impresora de la dirección" -L "Dirección"
      amarillo "Se agregó con controlador genérico. Si imprime raro, ábrela en"
      amarillo "Menú → Administración → Impresoras y elige su marca y modelo."
    fi
  fi
  lpadmin -d "$NOMBRE_IMPRESORA" >/dev/null 2>&1 || true
  verde "Quedó como impresora predeterminada: $NOMBRE_IMPRESORA ($IP_IMPRESORA)"
}

if [ "$SOLO_IMPRESORA" -eq 1 ]; then
  configurar_impresora
  verde "Listo."
  exit 0
fi

# ---------- comprobaciones ----------
paso "Comprobando el sistema"
if ! grep -qiE 'linuxmint|ubuntu' /etc/os-release; then
  rojo "Este script es para Linux Mint (o Ubuntu). Sistema detectado:"
  grep PRETTY_NAME /etc/os-release
  exit 1
fi
grep PRETTY_NAME /etc/os-release
if [ ! -d "$DIR_RECURSOS" ]; then
  rojo "No encuentro la carpeta 'recursos' junto al script. Copia la carpeta completa zona050-imac."
  exit 1
fi
RAM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
echo "Memoria RAM: ${RAM_MB} MB"
if ! ping -c 2 -W 3 deb.debian.org >/dev/null 2>&1 && ! ping -c 2 -W 3 8.8.8.8 >/dev/null 2>&1; then
  rojo "No hay internet. Conecta la iMac por cable de red y vuelve a correr el script."
  exit 1
fi
verde "Internet OK."

export DEBIAN_FRONTEND=noninteractive
APT="apt-get -y -q -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold"

paso "Actualizando la lista de programas"
apt-get update -q

instalar() {
  # Instala cada paquete por separado para que uno que falte no detenga todo
  local p
  for p in "$@"; do
    if dpkg -s "$p" >/dev/null 2>&1; then continue; fi
    if apt-cache show "$p" >/dev/null 2>&1; then
      $APT install "$p" >/dev/null 2>&1 && echo "  + $p" || amarillo "  ! no se pudo instalar $p"
    fi
  done
}

# ---------- WiFi Broadcom (casi todas las iMac) ----------
paso "WiFi de la iMac"
if lspci -nn 2>/dev/null | grep -iE 'network|wireless' | grep -qi '14e4'; then
  echo "Tarjeta WiFi Broadcom detectada."
  instalar dkms "linux-headers-$(uname -r)" bcmwl-kernel-source
  modprobe -r b43 bcma ssb >/dev/null 2>&1 || true
  modprobe wl >/dev/null 2>&1 && verde "Controlador WiFi activado." \
    || amarillo "El WiFi quedará listo después de reiniciar."
else
  echo "No se detectó tarjeta Broadcom (o el WiFi ya funciona)."
fi

# ---------- programas ----------
paso "Instalando programas (puede tardar varios minutos)"
instalar firefox firefox-locale-es \
  language-pack-es language-pack-gnome-es libreoffice-l10n-es libreoffice-help-es hunspell-es \
  libavcodec-extra ffmpeg \
  cups cups-browsed cups-filters avahi-daemon ipp-usb system-config-printer \
  printer-driver-all hplip foomatic-db-compressed-ppds openprinting-ppds \
  zram-tools lm-sensors \
  pavucontrol v4l-utils
verde "Programas instalados."

# ---------- memoria: zram (ayuda mucho en las de 2 y 4 GB) ----------
paso "Optimizando la memoria"
if [ -f /etc/default/zramswap ]; then
  if [ "$RAM_MB" -le 4500 ]; then PCT=75; else PCT=50; fi
  cat > /etc/default/zramswap <<EOF
# Zona 050: memoria comprimida para equipos con poca RAM
ALGO=zstd
PERCENT=$PCT
PRIORITY=100
EOF
  systemctl restart zramswap >/dev/null 2>&1 || true
  cat > /etc/sysctl.d/90-zona050.conf <<'EOF'
# Zona 050: usar primero la memoria comprimida (zram)
vm.swappiness=150
vm.page-cluster=0
EOF
  sysctl -p /etc/sysctl.d/90-zona050.conf >/dev/null 2>&1 || true
  verde "Memoria comprimida activada (${PCT}% de ${RAM_MB} MB)."
fi

# ---------- recursos: fondo e íconos ----------
paso "Copiando fondo de pantalla e íconos"
mkdir -p "$DIR_ZONA/iconos"
cp -f "$DIR_RECURSOS/fondo-zona050.png" "$DIR_ZONA/"
cp -f "$DIR_RECURSOS/firma-autor.svg" "$DIR_ZONA/" 2>/dev/null || true
cp -f "$DIR_RECURSOS"/iconos/*.png "$DIR_ZONA/iconos/"
chmod -R a+rX "$DIR_ZONA"

# Fondo de la pantalla de inicio de sesión
if [ -d /etc/lightdm ]; then
  CONF=/etc/lightdm/slick-greeter.conf
  touch "$CONF"
  grep -q '^\[Greeter\]' "$CONF" || echo '[Greeter]' >> "$CONF"
  sed -i '/^background=/d;/^draw-user-backgrounds=/d' "$CONF"
  sed -i "/^\[Greeter\]/a draw-user-backgrounds=false" "$CONF"
  sed -i "/^\[Greeter\]/a background=$DIR_ZONA/fondo-zona050.png" "$CONF"
fi

# ---------- control de apps ----------
paso "Instalando el Control de apps"
DIR_APPS="$DIR_ZONA/accesos"
mkdir -p "$DIR_APPS" /var/lib/zona050
# Se quitan los accesos fijos de la versión anterior; el control pone solo los autorizados
rm -f "$DIR_APPS"/*.desktop /usr/share/applications/zona050-*.desktop
cp -f "$DIR_RECURSOS/apps.json" "$DIR_ZONA/apps.json"
install -m 755 "$DIR_RECURSOS/zona050-control" /usr/local/bin/zona050-control

# Acceso al Control de apps (siempre visible)
cat > "$DIR_APPS/zona050-control.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Control de apps
Comment=Apps autorizadas de la Zona 050
Exec=firefox --new-window file://$DIR_ZONA/control/index.html
Icon=$DIR_ZONA/iconos/zona050.png
Terminal=false
Categories=Education;
X-Zona050-Escritorio=1
EOF

# Acceso para configurar la impresora
cat > "$DIR_APPS/zona050-impresoras.desktop" <<'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Impresoras
Comment=Agregar o revisar la impresora de la dirección
Exec=system-config-printer
Icon=printer
Terminal=false
Categories=Settings;
X-Zona050-Escritorio=1
EOF
chmod 755 "$DIR_APPS"/*.desktop
cp -f "$DIR_APPS"/*.desktop /usr/share/applications/

# Revisa la lista al encender y cada 30 minutos
cat > /etc/systemd/system/zona050-control.service <<'EOF'
[Unit]
Description=Zona 050 · Control de apps
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/zona050-control
EOF
cat > /etc/systemd/system/zona050-control.timer <<'EOF'
[Unit]
Description=Zona 050 · Revisar apps autorizadas

[Timer]
OnBootSec=1min
OnUnitActiveSec=30min
Persistent=true

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now zona050-control.timer >/dev/null 2>&1 || true

# ---------- Firefox: página de inicio, marcadores, YouTube y cámara ----------
paso "Configurando Firefox"
POLITICAS=$(cat <<EOF
{
  "policies": {
    "Homepage": { "URL": "file://$DIR_ZONA/control/index.html", "Locked": false, "StartPage": "homepage" },
    "DisplayBookmarksToolbar": "always",
    "DontCheckDefaultBrowser": true,
    "DisableTelemetry": true,
    "DisableFirefoxStudies": true,
    "OverrideFirstRunPage": "",
    "OverridePostUpdatePage": "",
    "RequestedLocales": ["es-MX", "es-ES"],
    "SanitizeOnShutdown": { "Cookies": true, "Cache": true, "OfflineApps": true, "Sessions": true, "Locked": true },
    "Permissions": {
      "Camera":     { "Allow": ["https://meet.google.com", "https://zoom.us", "https://app.zoom.us", "https://teams.microsoft.com"] },
      "Microphone": { "Allow": ["https://meet.google.com", "https://zoom.us", "https://app.zoom.us", "https://teams.microsoft.com"] }
    },
    "Preferences": {
      "media.av1.enabled":               { "Value": false, "Status": "default" },
      "media.mediasource.vp9.enabled":   { "Value": false, "Status": "default" },
      "media.ffmpeg.vaapi.enabled":      { "Value": true,  "Status": "default" },
      "browser.tabs.unloadOnLowMemory":  { "Value": true,  "Status": "default" },
      "browser.sessionstore.interval":   { "Value": 60000, "Status": "default" }
    }
  }
}
EOF
)
for d in /etc/firefox/policies /usr/lib/firefox/distribution; do
  if [ "$d" = /etc/firefox/policies ] || [ -d /usr/lib/firefox ]; then
    mkdir -p "$d"
    echo "$POLITICAS" > "$d/policies.json"
  fi
done
/usr/local/bin/zona050-control || amarillo "El Control de apps se completará en cuanto haya internet."
verde "Firefox: inicia en el Control de apps, barra de marcadores 'Zona 050',"
verde "YouTube en formato ligero (H.264) y cámara/micrófono permitidos en Meet, Zoom y Teams."

# ---------- configuración de cada usuario al iniciar sesión ----------
paso "Preparando el escritorio de los usuarios"
cat > /usr/local/bin/zona050-sesion <<'EOF'
#!/usr/bin/env bash
# Se ejecuta al iniciar sesión: pone fondo y accesos en el escritorio.
DIR_ZONA="/usr/share/zona050"
VERSION_CONF="2"
MARCA="$HOME/.config/zona050/listo-v$VERSION_CONF"
FONDO="$DIR_ZONA/fondo-zona050.png"
ESCRITORIO="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Escritorio")"
[ "$ESCRITORIO" = "$HOME" ] && ESCRITORIO="$HOME/Escritorio"
mkdir -p "$ESCRITORIO" "$HOME/.config/zona050"

# Se quitan del escritorio las apps que ya no están autorizadas
for f in "$ESCRITORIO"/zona050-*.desktop; do
  [ -e "$f" ] || continue
  [ -f "$DIR_ZONA/accesos/$(basename "$f")" ] || rm -f "$f"
done

# Accesos en el escritorio (siempre se revisan, por si alguien los borró)
for f in "$DIR_ZONA"/accesos/*.desktop; do
  grep -q '^X-Zona050-Escritorio=1' "$f" || continue
  destino="$ESCRITORIO/$(basename "$f")"
  if [ ! -f "$destino" ] || ! cmp -s "$f" "$destino"; then
    cp -f "$f" "$destino"
  fi
  chmod 755 "$destino"
  gio set "$destino" metadata::trusted true >/dev/null 2>&1 || true
  gio set -t string "$destino" metadata::xfce-exe-checksum \
    "$(sha256sum "$destino" | awk '{print $1}')" >/dev/null 2>&1 || true
done

# El fondo solo se pone la primera vez (después cada quien puede cambiarlo)
[ -f "$MARCA" ] && exit 0
sleep 4
if command -v xfconf-query >/dev/null 2>&1 && pgrep -u "$USER" xfdesktop >/dev/null 2>&1; then
  props="$(xfconf-query -c xfce4-desktop -l 2>/dev/null | grep -E '/last-image$')"
  if [ -z "$props" ]; then
    for m in $(xrandr --listmonitors 2>/dev/null | awk 'NR>1 {print $NF}'); do
      props="$props /backdrop/screen0/monitor$m/workspace0/last-image"
    done
  fi
  for p in $props; do
    xfconf-query -c xfce4-desktop -p "$p" -n -t string -s "$FONDO" 2>/dev/null \
      || xfconf-query -c xfce4-desktop -p "$p" -s "$FONDO"
    estilo="${p%/last-image}/image-style"
    xfconf-query -c xfce4-desktop -p "$estilo" -n -t int -s 5 2>/dev/null \
      || xfconf-query -c xfce4-desktop -p "$estilo" -s 5
  done
fi
if command -v gsettings >/dev/null 2>&1; then
  gsettings set org.cinnamon.desktop.background picture-uri "file://$FONDO" 2>/dev/null
  gsettings set org.cinnamon.desktop.background picture-options 'zoom' 2>/dev/null
  gsettings set org.mate.background picture-filename "$FONDO" 2>/dev/null
  gsettings set org.mate.background picture-options 'zoom' 2>/dev/null
fi
touch "$MARCA"
EOF
chmod 755 /usr/local/bin/zona050-sesion

cat > /etc/xdg/autostart/zona050-sesion.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Zona 050 · Escritorio
Exec=/usr/local/bin/zona050-sesion
NoDisplay=true
X-GNOME-Autostart-enabled=true
EOF
verde "Al iniciar sesión, cada usuario tendrá el fondo y los accesos en su escritorio."

# ---------- cuenta Maestro (opcional) ----------
if [ -n "$CLAVE_MAESTRO" ]; then
  paso "Cuenta Maestro"
  if ! id maestro >/dev/null 2>&1; then
    adduser --disabled-password --gecos "Maestro" maestro >/dev/null
  fi
  echo "maestro:$CLAVE_MAESTRO" | chpasswd
  for g in sudo adm lpadmin; do gpasswd -d maestro "$g" >/dev/null 2>&1 || true; done
  for g in audio video plugdev netdev; do getent group "$g" >/dev/null && usermod -aG "$g" maestro; done
  if [ -d /etc/lightdm ]; then
    mkdir -p /etc/lightdm/lightdm.conf.d
    cat > /etc/lightdm/lightdm.conf.d/70-zona050-maestro.conf <<'EOF'
[Seat:*]
autologin-user=maestro
autologin-user-timeout=0
EOF
  fi
  verde "Cuenta 'Maestro' lista, sin permisos de administrador; la iMac entra sola a ella."
  verde "Tu cuenta de administrador sigue igual (para entrar: Menú → Salir → Cambiar de usuario)."
fi

# ---------- impresora ----------
configurar_impresora

# ---------- actualizaciones automáticas ----------
paso "Actualizaciones automáticas"
if command -v mintupdate-automation >/dev/null 2>&1; then
  mintupdate-automation upgrade enable >/dev/null 2>&1 && verde "Activadas (Linux Mint se actualiza solo)."
else
  instalar unattended-upgrades
  dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null 2>&1 || true
  verde "Activadas (actualizaciones de seguridad)."
fi

# ---------- resumen ----------
echo
verde "=============================================================="
verde "  Listo. Reinicia la iMac para terminar:   sudo reboot"
verde "=============================================================="
echo "Memoria RAM: ${RAM_MB} MB"
if [ "$RAM_MB" -lt 3500 ]; then
  amarillo "Esta iMac tiene poca memoria: sirve para las apps e internet, pero"
  amarillo "las videollamadas irán lentas. Se recomienda subirla a 4 GB o más."
fi
lsusb 2>/dev/null | grep -qiE '05ac:8300' && amarillo "Cámara iSight antigua detectada: puede requerir configuración adicional."
echo "Registro completo en: $LOG"
