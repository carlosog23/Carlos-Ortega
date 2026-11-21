#!/usr/bin/env bash
# Zona 050 · Saca la llave para que GitHub publique el servidor de Tequio (se usa una sola vez).
# Uso en la iMac:   wget -O c carlosog23.github.io/Carlos-Ortega/imac/c.sh   y luego   bash c
set -e
echo
echo "== 1/3 Preparando (puede pedir la contraseña de la iMac; al escribirla no se ve nada) =="
sudo apt-get install -y nodejs npm xclip >/dev/null
echo
echo "== 2/3 Se abrirá Firefox: elija la cuenta dueña de Tequio y toque Permitir =="
echo "      (si dice que Google no verificó la app: Configuración avanzada → Ir a clasp)"
npx -y @google/clasp@2.4.2 login
echo
if [ -s "$HOME/.clasprc.json" ]; then
  xclip -selection clipboard < "$HOME/.clasprc.json"
  echo "== 3/3 LISTO: la llave quedó COPIADA. =="
  echo "Se abrirá GitHub: en Name escriba CLASPRC_JSON, en Secret pegue con Ctrl+V y toque Add secret."
  (firefox "https://github.com/carlosog23/Carlos-Ortega/settings/secrets/actions/new" >/dev/null 2>&1 &)
else
  echo "No se generó la llave. Vuelva a escribir:  bash c"
fi
