#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PUBLIC_DIR="$SCRIPT_DIR/public"
VETRINA_DIR="${VETRINA_DIR:-$HOME/git/vetrina}"
VETRINA_GAME_DIR="$VETRINA_DIR/games/smurfs-and-dragons"
VERSION=$(cat "$SCRIPT_DIR/VERSION" 2>/dev/null || echo "2.1.3")

echo "=========================================================="
echo "🧪 [0/3] Running Unit Tests (Math Gates & Integer Logic)..."
echo "=========================================================="
node --test "$SCRIPT_DIR/tests/math_gates.test.js"

echo ""
echo "=========================================================="
echo "🚀 DEPLOY TRIFRONTE: Smurfs, Puffins & Dragons v$VERSION"
echo "=========================================================="

echo "🔥 [1/3] Deploying to Firebase Hosting (smurfs-and-dragons.web.app)..."
cd "$SCRIPT_DIR"
npx firebase-tools deploy --only hosting

echo ""
echo "🐙 [2/3] Deploying to GitHub Pages (genai-googlecloud-scripts gh-pages)..."
DEPLOY_DIR=$(mktemp -d)
trap 'rm -rf "$DEPLOY_DIR"' EXIT

# Copy all public files to root of gh-pages
cp -r "$PUBLIC_DIR"/* "$DEPLOY_DIR/"

# Also copy to subfolder 02-smurfs-and-dragons for subpath compatibility
mkdir -p "$DEPLOY_DIR/02-smurfs-and-dragons"
cp -r "$PUBLIC_DIR"/* "$DEPLOY_DIR/02-smurfs-and-dragons/"

# Add .nojekyll so GitHub Pages serves raw files without Jekyll processing
touch "$DEPLOY_DIR/.nojekyll"

# Initialize clean git commit on gh-pages without LFS pointer overhead for static hosting
cd "$DEPLOY_DIR"
git init -b gh-pages
git config user.name "Riccardo Carlesso"
git config user.email "palladiusbonton@gmail.com"
git add -A
git commit -m "🚀 Bifrontal Deploy v$VERSION to GitHub Pages"

REMOTE_URL=$(git -C "$REPO_ROOT" config --get remote.origin.url)
echo "Pushing gh-pages to $REMOTE_URL..."
git push -f "$REMOTE_URL" gh-pages

if [ -d "$VETRINA_GAME_DIR" ]; then
  echo ""
  echo "🎠 [3/3] Syncing & Deploying to Vetrina Showcase ($VETRINA_GAME_DIR)..."
  cp "$PUBLIC_DIR/index.html" "$VETRINA_GAME_DIR/index.html"
  for asset in bgm_rock_full.mp3 manifest.json sw.js favicon.png icon-180.png icon-192.png icon-512.png; do
    if [ -f "$PUBLIC_DIR/$asset" ]; then
      cp "$PUBLIC_DIR/$asset" "$VETRINA_GAME_DIR/$asset"
    fi
  done
  git -C "$VETRINA_DIR" add games/smurfs-and-dragons/
  if ! git -C "$VETRINA_DIR" diff --cached --quiet; then
    git -C "$VETRINA_DIR" commit -m "🚀 feat(smurfs-and-dragons): sync v$VERSION with Firebase (integer math gates, Lyria 3 rock & PWA)"
    git -C "$VETRINA_DIR" push
  else
    echo "   ℹ️ Vetrina already in sync."
  fi
fi

echo ""
echo "=========================================================="
echo "🎉 DEPLOY COMPLETATO CON SUCCESSO!"
echo "   🔥 Firebase Hosting: https://smurfs-and-dragons.web.app"
echo "   🎠 Vetrina GHP:      https://palladius.github.io/vetrina/games/smurfs-and-dragons/"
echo "   🐙 Repo GHP:         https://palladius.github.io/genai-googlecloud-scripts/02-smurfs-and-dragons/"
echo "=========================================================="
