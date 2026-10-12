#!/usr/bin/env bash
# Construit l'APK Android MonStock et régénère les QR codes.
#
#   ./scripts/build.sh
#
# Prérequis :
#   - un JDK 11+          (JAVA_HOME, ou le jbr d'Android Studio)
#   - un SDK Android      (android/local.properties -> sdk.dir)
#   - Python 3 + Pillow   (icônes et QR codes)

set -euo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$RACINE/android"

# --- 0. Contrôle qualité des données -----------------------------------------
echo "==> Contrôle des données"
python3 "$RACINE/scripts/validate.py"

# --- 1. Icônes ----------------------------------------------------------------
echo "==> Génération des icônes"
python3 "$RACINE/scripts/gen_icons.py" >/dev/null
echo "    ok"

# --- 2. Java ------------------------------------------------------------------
if [ -z "${JAVA_HOME:-}" ] && [ -d "$HOME/Téléchargements/android-studio/jbr" ]; then
  export JAVA_HOME="$HOME/Téléchargements/android-studio/jbr"
fi
if [ -z "${JAVA_HOME:-}" ]; then
  echo "!! JAVA_HOME non défini. Installe un JDK 11+ ou ouvre Android Studio." >&2
  exit 1
fi
export PATH="$JAVA_HOME/bin:$PATH"
echo "==> Java : $("$JAVA_HOME/bin/java" -version 2>&1 | head -1)"

# --- 3. SDK Android -----------------------------------------------------------
if [ ! -f "$ANDROID_DIR/local.properties" ]; then
  echo "!! android/local.properties absent (sdk.dir manquant)." >&2
  exit 1
fi

# --- 4. Construction de l'APK -------------------------------------------------
echo "==> Construction de l'APK (release)"
cd "$ANDROID_DIR"
./gradlew assembleRelease --quiet

APK="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
[ -f "$APK" ] || { echo "!! APK introuvable : $APK" >&2; exit 1; }

# --- 5. Copie de l'APK Release ------------------------------------------------
cp "$APK" "$RACINE/docs/MonStock.apk"
echo "    APK : $(du -h "$RACINE/docs/MonStock.apk" | cut -f1) -> docs/MonStock.apk"

# --- 6. QR codes --------------------------------------------------------------
echo "==> Génération des QR codes"
python3 "$RACINE/scripts/gen_qr.py" >/dev/null
echo "    docs/qrcode-web.png, docs/qrcode-apk.png"

echo
echo "Terminé."
echo "  APK     : docs/MonStock.apk"
echo "  à pousser en Release GitHub sous le nom MonStock.apk"