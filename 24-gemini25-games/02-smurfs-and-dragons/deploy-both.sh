#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PUBLIC_DIR="$SCRIPT_DIR/public"
VERSION=$(cat "$SCRIPT_DIR/VERSION" 2>/dev/null || echo "2.1.2")

echo "=========================================================="
echo "🚀 DEPLOY BIFRONTE: Smurfs, Puffins & Dragons v$VERSION"
echo "=========================================================="

echo "🔥 [1/2] Deploying to Firebase Hosting (smurfs-and-dragons.web.app)..."
cd "$SCRIPT_DIR"
npx firebase-tools deploy --only hosting

echo ""
echo "🐙 [2/2] Deploying to GitHub Pages (gh-pages branch)..."
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

echo ""
echo "=========================================================="
echo "🎉 DEPLOY BIFRONTE COMPLETATO CON SUCCESSO!"
echo "   🔥 Firebase Hosting: https://smurfs-and-dragons.web.app"
echo "   🐙 GitHub Pages:     https://palladius.github.io/genai-googlecloud-scripts/"
echo "   🐙 GHP Sotto-URL:    https://palladius.github.io/genai-googlecloud-scripts/02-smurfs-and-dragons/"
echo "=========================================================="
