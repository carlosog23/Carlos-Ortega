#!/usr/bin/env bash
# =====================================================================
#  Zona Escolar 050 · Instalador único para las computadoras de las escuelas
#  Sirve para cualquier marca (iMac, Dell, HP…) con Linux Mint XFCE.
#  Pregunta qué tipo de computadora es (Core 2 Duo, iMac o i5) e instala lo adecuado.
#
#  Uso (en la Terminal, con cable de red):
#     wget -qO- carlosog23.github.io/Carlos-Ortega/z.sh | sudo bash
# =====================================================================
set -uo pipefail
BASE="https://carlosog23.github.io/Carlos-Ortega"
T=/dev/tty
az() { printf '\033[1;34m%s\033[0m\n' "$*" >$T; }
ve() { printf '\033[1;32m%s\033[0m\n' "$*" >$T; }
ro() { printf '\033[1;31m%s\033[0m\n' "$*" >$T; }

[ "$(id -u)" -eq 0 ] || { ro "Escríbelo con sudo:  wget -qO- carlosog23.github.io/Carlos-Ortega/z.sh | sudo bash"; exit 1; }
[ -r $T ] || { ro "Hay que correrlo desde la Terminal."; exit 1; }

clear >$T 2>/dev/null
az "=========================================================="
az "   Zona Escolar 050 · Preparar esta computadora"
az "=========================================================="
echo >$T
echo "Equipo: $(cat /sys/class/dmi/id/sys_vendor 2>/dev/null) $(cat /sys/class/dmi/id/product_name 2>/dev/null)" >$T
echo "Memoria: $(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo) MB · Fecha y hora: $(date '+%d/%m/%Y %H:%M')" >$T
echo >$T
MARCA="$(cat /sys/class/dmi/id/sys_vendor 2>/dev/null)"
CPU="$(grep -m1 'model name' /proc/cpuinfo 2>/dev/null | cut -d: -f2- | sed 's/^ *//')"
echo "Procesador: $CPU" >$T
echo >$T
case "$MARCA" in
  *Apple*) SUGERIDA=2 ;;
  *) case "$CPU" in *Core\(TM\)2*|*"Core 2"*|*Pentium*|*Celeron*) SUGERIDA=1 ;; *) SUGERIDA=3 ;; esac ;;
esac
echo "¿Qué tipo de computadora es?" >$T
echo "  1) Core 2 Duo (cualquier marca): MAESTROS y ALUMNOS, versión ligera" >$T
echo "  2) iMac (Apple): para MAESTROS" >$T
echo "     Tlamatini, Tlamatini Aula, oficina, PDF, videollamadas, impresora" >$T
echo "  3) i5 (cualquier marca, no iMac): MAESTROS y ALUMNOS" >$T
echo "     Es la más potente: se recomienda como SERVIDOR de la escuela," >$T
echo "     y como servidora instala además la Wikipedia en español sin internet" >$T
echo >$T
echo "  En la 1 y la 3 hay dos cuentas: «Maestro» con clave (sus apps, oficina y PDF)" >$T
echo "  y «Alumno» (pantalla Aula Zona 050, juegos, YouTube restringido; se limpia sola)." >$T
echo >$T
ve "Por lo que detecté, se recomienda la opción $SUGERIDA."
TIPO=""
while [ "$TIPO" != 1 ] && [ "$TIPO" != 2 ] && [ "$TIPO" != 3 ]; do
  read -rp "Escribe 1, 2 o 3 y presiona Enter (solo Enter = $SUGERIDA): " TIPO <$T
  [ -z "$TIPO" ] && TIPO=$SUGERIDA
done

echo >$T
echo "Clave para la cuenta «Maestro» (mínimo 4 letras o números)." >$T
echo "Es la que usará el maestro para entrar; al escribirla no se ve." >$T
while :; do
  read -rsp "Clave: " C1 <$T; echo >$T
  read -rsp "Escríbela otra vez: " C2 <$T; echo >$T
  [ "$C1" = "$C2" ] && [ ${#C1} -ge 4 ] && break
  ro "No coinciden o es muy corta. Intenta otra vez."
done

echo >$T
read -rp "Dirección de la impresora de la dirección (ejemplo 192.168.1.50), o solo Enter para omitir: " IP <$T
ARGS=()
if [[ "$IP" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then ARGS+=(--impresora "$IP"); elif [ -n "$IP" ]; then ro "Dirección no válida: se omite la impresora."; fi

if [ "$TIPO" != 2 ]; then
  echo >$T
  echo "¿Esta será la computadora SERVIDOR de la escuela?" >$T
  [ "$TIPO" = 3 ] && echo "(Si la escuela tiene una i5, conviene que esa sea la servidora.)" >$T
  echo "Guarda la biblioteca sin internet para todas las demás. Solo UNA por escuela." >$T
  read -rp "Escribe s (sí) o n (no) y presiona Enter: " SRV <$T
  case "$SRV" in
    s|S|si|SI|sí|Sí)
      if [ "$TIPO" = 3 ]; then ARGS+=(--servidor --wikipedia); ve "Se instalará también la Wikipedia en español sin internet (necesita unos 15 GB libres)."
      else ARGS+=(--servidor); fi ;;
  esac
fi

echo >$T
if [ "$TIPO" = 2 ]; then
  ve "Preparando la iMac (maestros)…"
  wget -qO- "$BASE/imac/i.sh?v=$(date +%s)" | bash -s -- --usuario-maestro "$C1" "${ARGS[@]}"
else
  ve "Preparando la computadora (maestros y alumnos)…"
  wget -qO- "$BASE/aula/i.sh?v=$(date +%s)" | bash -s -- --clave-maestro "$C1" "${ARGS[@]}"
fi
