#!/usr/bin/env bash
# Zona Escolar 050 · Instalador en línea para las iMac con Linux Mint
# Uso (en la terminal de la iMac, conectada por cable de red):
#   wget -qO- carlosog23.github.io/Carlos-Ortega/imac/i.sh | sudo bash
#   wget -qO- carlosog23.github.io/Carlos-Ortega/imac/i.sh | sudo bash -s -- --impresora 192.168.1.50
#   wget -qO- carlosog23.github.io/Carlos-Ortega/imac/i.sh | sudo bash -s -- --solo-impresora 192.168.1.50
set -euo pipefail
BASE="https://carlosog23.github.io/Carlos-Ortega/imac"
TMP="$(mktemp -d /tmp/zona050-XXXXXX)"
trap 'rm -rf "$TMP"' EXIT

echo "Descargando el instalador de la Zona 050…"
mkdir -p "$TMP/recursos/iconos"
bajar() { wget -q --tries=3 -O "$TMP/$1" "$BASE/$1?v=$(date +%s)"; }
bajar instalar.sh
bajar recursos/fondo-zona050.png
for i in centro-apps tlamatini tlamatini-aula ulama tequio zona050; do
  bajar "recursos/iconos/$i.png"
done

bash "$TMP/instalar.sh" "$@" </dev/null
