#!/usr/bin/env bash
# Compila Tablet-Tini.apk con las herramientas del SDK de Android (sin Gradle).
# Lo usa GitHub Actions (.github/workflows/tablet-tini.yml).
# Variables: ANDROID_HOME, VERSION (número), KS (ruta del almacén de firma), KS_PASS.
set -euo pipefail
cd "$(dirname "$0")"

BT="$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)"
PLAT="$(ls -d "$ANDROID_HOME"/platforms/android-* | sort -V | tail -1)"
JAR="$PLAT/android.jar"
VERSION="${VERSION:-1}"
echo "build-tools: $BT"; echo "plataforma: $PLAT"; echo "versión: 1.$VERSION"

rm -rf build && mkdir -p build/assets build/obj build/dex
cp ../index.html build/assets/index.html

"$BT/aapt2" compile --dir res -o build/res.zip
"$BT/aapt2" link -o build/base.apk -I "$JAR" \
  --manifest AndroidManifest.xml \
  --min-sdk-version 19 --target-sdk-version 22 \
  --version-code "$VERSION" --version-name "1.$VERSION" \
  -A build/assets build/res.zip

javac -source 8 -target 8 -bootclasspath "$JAR" -d build/obj \
  $(find src -name '*.java')
"$BT/d8" --min-api 19 --lib "$JAR" --output build/dex $(find build/obj -name '*.class')

(cd build/dex && zip -q ../base.apk classes.dex)
"$BT/zipalign" -f 4 build/base.apk build/alineada.apk
"$BT/apksigner" sign --ks "$KS" --ks-pass "pass:$KS_PASS" --out build/Tablet-Tini.apk build/alineada.apk
"$BT/apksigner" verify build/Tablet-Tini.apk
ls -l build/Tablet-Tini.apk
