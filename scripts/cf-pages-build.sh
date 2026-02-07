#!/usr/bin/env bash
# scripts/cf-pages-build.sh

set -euo pipefail

echo "== CF PAGES BUILD =="
node -v

# Install pnpm
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

pnpm -v

# Ensure curl exists
if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl not found"
  exit 1
fi

# Install Rust if missing (installs rustup + cargo)
if ! command -v cargo >/dev/null 2>&1; then
  echo "Installing Rust via rustup..."
  curl https://sh.rustup.rs -sSf | sh -s -- -y
fi

# Load cargo/rustup env for this shell
# shellcheck disable=SC1090
source "$HOME/.cargo/env"

# ✅ Pin to stable (more deterministic than whatever default toolchain happens to be)
rustup toolchain install stable --profile minimal
rustup default stable

# Needed for wasm builds
rustup target add wasm32-unknown-unknown

# ✅ Install wasm-pack if missing
if ! command -v wasm-pack >/dev/null 2>&1; then
  echo "Installing wasm-pack..."
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

echo "Rust toolchain:"
rustc -V
cargo -V
rustup -V
wasm-pack -V

# Install dependencies (frozen-lockfile is safer for CI)
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Build (this runs prebuild -> clean + update:version)
echo "Building..."
pnpm run build

echo "== CF PAGES BUILD DONE =="
