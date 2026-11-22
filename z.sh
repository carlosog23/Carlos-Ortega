#!/usr/bin/env bash
# =====================================================================
#  Zona Escolar 050 · Instalador único para las computadoras de las escuelas
#  Sirve para cualquier marca (iMac, Dell, HP…) con Linux Mint XFCE.
#  Pregunta si la computadora es del MAESTRO o de ALUMNOS y hace lo demás.
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
echo "¿Para quién es esta computadora?" >$T
echo "  1) MAESTRO: Tlamatini, Tlamatini Aula, oficina, videollamadas, impresora" >$T
echo "  2) ALUMNOS: pantalla Aula Zona 050, juegos educativos, Educación Física," >$T
echo "     YouTube restringido; se limpia sola al terminar" >$T
echo >$T
TIPO=""
while [ "$TIPO" != 1 ] && [ "$TIPO" != 2 ]; do read -rp "Escribe 1 o 2 y presiona Enter: " TIPO <$T; done

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

echo >$T
if [ "$TIPO" = 1 ]; then
  ve "Preparando la computadora del MAESTRO…"
  wget -qO- "$BASE/imac/i.sh?v=$(date +%s)" | bash -s -- --usuario-maestro "$C1" "${ARGS[@]}"
else
  ve "Preparando la computadora de ALUMNOS…"
  wget -qO- "$BASE/aula/i.sh?v=$(date +%s)" | bash -s -- --clave-maestro "$C1" "${ARGS[@]}"
fi
