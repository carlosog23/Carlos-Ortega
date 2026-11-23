#!/usr/bin/env bash
# Aula Zona 050 · Instalador en línea para computadoras Dell y HP (Core 2 Duo) con Linux Mint XFCE
# Uso (en la Terminal, con la computadora conectada por cable de red):
#   (en UNA computadora de la escuela agregue  --servidor  para que sea el servidor de la escuela)
#   wget -qO- carlosog23.github.io/Carlos-Ortega/aula/i.sh | sudo bash -s -- --clave-maestro CLAVE
set -euo pipefail
BASE="https://carlosog23.github.io/Carlos-Ortega/aula"
TMP="$(mktemp -d /tmp/aula-XXXXXX)"
trap 'rm -rf "$TMP"' EXIT
echo "Descargando el instalador de Aula Zona 050…"
mkdir -p "$TMP/recursos/ef" "$TMP/recursos/web/ajedrez"
bajar() { wget -q --tries=3 -O "$TMP/$1" "$BASE/$1?v=$(date +%s)"; }
bajar instalar.sh
bajar aula.json
bajar recursos/aula-inicio
bajar recursos/fondo-aula.png
bajar recursos/ef/index.html
bajar recursos/zona050-red.py
bajar recursos/web/index.html
bajar recursos/web/ajedrez/index.html
bajar recursos/web/ajedrez/chess.js
bajar recursos/web/ajedrez/LICENCIA-chess.js.txt
bash "$TMP/instalar.sh" "$@" </dev/null
