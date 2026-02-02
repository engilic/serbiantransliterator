#!/usr/bin/env bash
set -euo pipefail

echo "== CF PAGES BUILD =="
node -v
npm -v

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

echo "Rust toolchain:"
rustc -V
cargo -V
rustup -V

# Build (this runs prebuild -> clean + update:version)
npm run build

echo "== CF PAGES BUILD DONE =="
