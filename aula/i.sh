#!/usr/bin/env bash
# Aula Zona 050 · Instalador en línea para computadoras Dell, HP y Lanix con Linux Mint XFCE
# Uso (en la Terminal, con la computadora conectada por cable de red):
#   (en UNA computadora de la escuela agregue  --servidor  para que sea el servidor de la escuela)
#   wget -qO- carlosog23.github.io/Carlos-Ortega/aula/i.sh | sudo bash -s -- --clave-maestro CLAVE
set -euo pipefail
BASE="https://carlosog23.github.io/Carlos-Ortega/aula"
TMP="$(mktemp -d /tmp/aula-XXXXXX)"
trap 'rm -rf "$TMP"' EXIT
echo "Descargando el instalador de Aula Zona 050…"
V=$(date +%s)
bajar() { mkdir -p "$(dirname "$TMP/$1")"; wget -q --tries=3 -O "$TMP/$1" "$BASE/$1?v=$V"; }
bajar 'instalar.sh'
bajar 'aula.json'
bajar 'recursos/aula-inicio'
bajar 'recursos/aula-kolibri'
bajar 'recursos/aula-planetario'
bajar 'recursos/fondo-aula.png'
bajar 'recursos/zona050-red.py'
bajar 'recursos/ef/firma-autor.svg'
bajar 'recursos/ef/index.html'
bajar 'recursos/ef/zona050.png'
bajar 'recursos/web/index.html'
bajar 'recursos/web/ajedrez/LICENCIA-chess.js.txt'
bajar 'recursos/web/ajedrez/chess.js'
bajar 'recursos/web/ajedrez/index.html'
bajar 'recursos/web/img/firma-autor-blanca.svg'
bajar 'recursos/web/img/firma-autor.svg'
bajar 'recursos/web/img/zona050.png'
bajar 'recursos/web/programa/index.html'
bajar 'recursos/web/programa/juego.html'
bajar 'recursos/web/programa/niveles.js'
bajar 'recursos/web/programa/lib/LICENCIA-blockly.txt'
bajar 'recursos/web/programa/lib/blockly_compressed.js'
bajar 'recursos/web/programa/lib/blocks_compressed.js'
bajar 'recursos/web/programa/lib/msg-es.js'
bajar 'recursos/web/programa/lib/media/1x1.gif'
bajar 'recursos/web/programa/lib/media/click.mp3'
bajar 'recursos/web/programa/lib/media/delete-icon.svg'
bajar 'recursos/web/programa/lib/media/delete.mp3'
bajar 'recursos/web/programa/lib/media/disconnect.mp3'
bajar 'recursos/web/programa/lib/media/drop.mp3'
bajar 'recursos/web/programa/lib/media/dropdown-arrow.svg'
bajar 'recursos/web/programa/lib/media/foldout-icon.svg'
bajar 'recursos/web/programa/lib/media/handclosed.cur'
bajar 'recursos/web/programa/lib/media/handdelete.cur'
bajar 'recursos/web/programa/lib/media/handopen.cur'
bajar 'recursos/web/programa/lib/media/pilcrow.png'
bajar 'recursos/web/programa/lib/media/quote0.png'
bajar 'recursos/web/programa/lib/media/quote1.png'
bajar 'recursos/web/programa/lib/media/resize-handle.svg'
bajar 'recursos/web/programa/lib/media/sprites.svg'
bajar 'recursos/web/retos/banco.js'
bajar 'recursos/web/retos/index.html'
bajar 'recursos/web/retos/lecturas.js'
bajar 'recursos/web/retos/maestro.html'
bajar 'recursos/web/juego/index.html'
bajar 'recursos/web/juego/trivia.js'
bajar 'recursos/web/juego/firma-autor.svg'
bajar 'recursos/web/juego/manifest.webmanifest'
bajar 'recursos/web/juego/img/icono-192.png'
bajar 'recursos/web/juego/img/icono-512.png'
bash "$TMP/instalar.sh" "$@" </dev/null
