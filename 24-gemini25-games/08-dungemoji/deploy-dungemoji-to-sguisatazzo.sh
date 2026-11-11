#!/usr/bin/env bash
# ==============================================================================
# deploy-dungemoji-to-sguisatazzo.sh
# Installa Dungemoji (offline su localhost:8088) + Icona Desktop sul Raspberry Pi 400
# di Alessandro (sguisatazzo.local / 192.168.86.20).
# Supporta connessione diretta (da LAN T27) oppure multi-hop via Tailscale
# (derek -> openclaudio-lobby-zrh -> mini-lobby/pupurabbux -> sguisatazzo).
# ==============================================================================

set -euo pipefail

TARGET_HOST="${1:-192.168.86.20}"
TARGET_USER="${TARGET_USER:-alessandro}"
PORT="8088"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUNGEMOJI_PUBLIC="${DUNGEMOJI_PUBLIC:-$HOME/git/genai-googlecloud-scripts/24-gemini25-games/08-dungemoji/public}"
LOCAL_LAUNCHER="$SCRIPT_DIR/bin/play-dungemoji"
LOCAL_ICON="$SCRIPT_DIR/dungemoji-icon.png"

if [ ! -f "$DUNGEMOJI_PUBLIC/index.html" ]; then
  echo "❌ Non trovo $DUNGEMOJI_PUBLIC/index.html" >&2
  exit 1
fi

echo "🏰 Preparazione pacchetto offline Dungemoji v9.0.2 per $TARGET_USER@$TARGET_HOST..."

TMP_TAR="$(mktemp /tmp/dungemoji-sguisatazzo-XXXXXX.tar.gz)"
trap 'rm -f "$TMP_TAR"' EXIT

STAGE_DIR="$(mktemp -d /tmp/dungemoji-stage-XXXXXX)"
mkdir -p "$STAGE_DIR/games/dungemoji/public/audio"
mkdir -p "$STAGE_DIR/bin"
mkdir -p "$STAGE_DIR/Desktop"
mkdir -p "$STAGE_DIR/.local/share/applications"
mkdir -p "$STAGE_DIR/.config/systemd/user"

cp "$DUNGEMOJI_PUBLIC/index.html" "$STAGE_DIR/games/dungemoji/public/index.html"
cp "$LOCAL_ICON" "$STAGE_DIR/games/dungemoji/public/dungemoji-icon.png"
if [ -d "$DUNGEMOJI_PUBLIC/audio" ]; then
  cp -r "$DUNGEMOJI_PUBLIC/audio/"* "$STAGE_DIR/games/dungemoji/public/audio/" 2>/dev/null || true
fi
cp "$LOCAL_LAUNCHER" "$STAGE_DIR/bin/play-dungemoji"
chmod +x "$STAGE_DIR/bin/play-dungemoji"

cat > "$STAGE_DIR/Desktop/Dungemoji.desktop" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Dungemoji
GenericName=Dungemoji (Offline Localhost)
Comment=Gioca a Dungemoji su localhost:${PORT} (anche offline!)
Exec=/home/${TARGET_USER}/bin/play-dungemoji
Icon=/home/${TARGET_USER}/games/dungemoji/public/dungemoji-icon.png
Terminal=false
Categories=Game;RolePlaying;
StartupNotify=true
EOF
chmod +x "$STAGE_DIR/Desktop/Dungemoji.desktop"
cp "$STAGE_DIR/Desktop/Dungemoji.desktop" "$STAGE_DIR/.local/share/applications/dungemoji.desktop"

cat > "$STAGE_DIR/.config/systemd/user/dungemoji.service" <<EOF
[Unit]
Description=Dungemoji Localhost Offline Server (127.0.0.1:${PORT})
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/${TARGET_USER}/games/dungemoji/public
ExecStart=/usr/bin/python3 -m http.server ${PORT} --bind 127.0.0.1 --directory /home/${TARGET_USER}/games/dungemoji/public
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF

tar -C "$STAGE_DIR" -czf "$TMP_TAR" .
rm -rf "$STAGE_DIR"

echo "📦 Archivio pronto ($(du -h "$TMP_TAR" | cut -f1)). Installazione su Sguisatazzo..."

REMOTE_INSTALL_CMD='
set -e
tar -xzf - -C "$HOME"
chmod +x "$HOME/bin/play-dungemoji" "$HOME/Desktop/Dungemoji.desktop" "$HOME/.local/share/applications/dungemoji.desktop"
if command -v gio >/dev/null 2>&1; then
  DISPLAY=:0 gio set "$HOME/Desktop/Dungemoji.desktop" metadata::trusted true 2>/dev/null || true
fi
systemctl --user daemon-reload 2>/dev/null || true
systemctl --user enable --now dungemoji.service 2>/dev/null || true
echo "✅ Dungemoji installato su $(hostname)! Icona creata in ~/Desktop/Dungemoji.desktop e server attivo su http://localhost:8088"
'

# Prova 1: connessione diretta (se siamo a casa in T27)
if ping -c 1 -W 2 "$TARGET_HOST" >/dev/null 2>&1; then
  echo "🟢 Connessione LAN diretta a $TARGET_USER@$TARGET_HOST..."
  ssh "$TARGET_USER@$TARGET_HOST" "$REMOTE_INSTALL_CMD" < "$TMP_TAR"
  exit 0
fi

# Prova 2: bridge Tailscale via openclaudio-lobby-zrh (34.65.201.71) -> mini-lobby (100.104.73.106) / pupurabbux (100.64.182.83)
echo "🌐 Non sulla LAN T27 diretta; provo ponte Tailscale (openclaudio-lobby-zrh -> T27 -> $TARGET_HOST)..."
SSH_KEY="$HOME/.ssh/google_compute_engine"
LOBBY_IP="34.65.201.71"

for BRIDGE in "riccardo@100.104.73.106" "riccardo@100.64.182.83"; do
  echo "🔍 Testo ponte $BRIDGE -> $TARGET_USER@$TARGET_HOST..."
  if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "ricc@$LOBBY_IP" \
     "ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=no $BRIDGE 'ping -c 1 -W 2 $TARGET_HOST >/dev/null 2>&1 || ping -c 1 -W 2 sguisatazzo.local >/dev/null 2>&1'"; then
    echo "✅ Raggiungibile via $BRIDGE! Trasferimento pacchetto..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "ricc@$LOBBY_IP" \
      "ssh -o StrictHostKeyChecking=no $BRIDGE \"ssh -o StrictHostKeyChecking=no $TARGET_USER@$TARGET_HOST '$REMOTE_INSTALL_CMD'\"" < "$TMP_TAR"
    exit 0
  fi
done

echo "⚠️  Impossibile raggiungere $TARGET_HOST da remoto in questo istante." >&2
echo "   Nota: se Sguisatazzo è sulla Wi-Fi 'CarlessosGuest' (isolata dalla LAN principale)," >&2
echo "   collegalo temporaneamente alla Wi-Fi 'Carlessos' (o lancia questo script da un PC sulla stessa rete)" >&2
echo "   e riesegui: $0" >&2
exit 2
