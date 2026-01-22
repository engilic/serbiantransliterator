#!/bin/bash
set -e # Prekini skriptu odmah ako bilo koja komanda pukne (fail-fast)

echo "🚀 [CF] Starting Cloudflare Build Script..."

# 1. Instaliraj Rust Toolchain (Standardna instalacija)
echo "🦀 [CF] Installing Rust toolchain..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
export PATH="$HOME/.cargo/bin:$PATH"

# Provera verzije (za logove)
rustc --version

# 2. Instaliraj wasm-pack (Neophodan za Webpack Wasm plugin)
echo "📦 [CF] Installing wasm-pack..."
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 3. Instaliraj NPM zavisnosti (Clean Install)
echo "📥 [CF] Installing NPM dependencies..."
npm ci

# 4. Pokreni Build (Webpack + Rust kompajliranje)
echo "🛠️ [CF] Building project..."
npm run build

echo "✅ [CF] Build finished successfully! Ready for deploy."
