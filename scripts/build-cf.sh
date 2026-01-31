#!/bin/bash
# scripts/build-cf.sh

# --- KONFIGURACIJA ---
set -euo pipefail

# --- ANSI BOJE ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

START_TIME=$SECONDS

# --- HELPERS ---
log_step() { echo -e "\n${YELLOW}$1${NC}"; }
ok()       { echo -e "${GREEN}✔${NC} $1"; }
info()     { echo -e "${CYAN}➜${NC} $1"; }
warn()     { echo -e "${YELLOW}⚠${NC} $1"; }
fail()     { echo -e "${RED}✖${NC} $1"; }

# Error Trap
trap 'fail "FATAL ERROR on line $LINENO! Build aborted."; exit 1' ERR

# --- BANNER ---
echo -e "${BLUE}${BOLD}🚀 CLOUDFLARE PRODUCTION BUILDER • GOD MODE${NC}"
echo -e "${GRAY}---------------------------------------------------${NC}"

# 1) SYSTEM DIAGNOSTICS
log_step "🔍 [1/5] System Diagnostics"
echo "   • Node: $(node -v 2>/dev/null || echo 'N/A')"
echo "   • NPM:  $(npm -v 2>/dev/null || echo 'N/A')"
echo "   • Path: $(pwd)"

if [ -f /proc/meminfo ]; then
  FREE_MEM=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
  echo "   • Mem:  $((FREE_MEM / 1024)) MB Available"
fi

# 2) RUST TOOLCHAIN (Smart Install)
log_step "🦀 [2/5] Rust Toolchain"
if ! command -v rustc &>/dev/null; then
  info "Installing Rust (Minimal Profile)..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable
  # shellcheck disable=SC1090
  source "$HOME/.cargo/env"
else
  ok "Rust detected (Cached)."
fi
ok "$(rustc --version)"

# 3) WASM-PACK (Smart Install)
log_step "📦 [3/5] Wasm-Pack"
if ! command -v wasm-pack &>/dev/null; then
  info "Installing wasm-pack..."
  curl -sSf https://rustwasm.github.io/wasm-pack/installer/init.sh | sh
else
  ok "wasm-pack detected (Cached)."
fi
ok "$(wasm-pack --version)"

# 4) DEPENDENCIES
log_step "📥 [4/5] NPM Dependencies"
npm ci --prefer-offline --no-audit --no-fund --quiet
ok "Modules installed."

# 5) BUILD
log_step "🛠️  [5/5] Compiling Project"
info "Running Webpack + Cargo..."
npm run build

# Validation
if [ ! -f "dist/taskpane.html" ]; then
  fail "Build finished but 'dist/taskpane.html' is missing!"
  exit 1
fi

DURATION=$((SECONDS - START_TIME))
echo -e "\n${GREEN}---------------------------------------------------${NC}"
echo -e "${GREEN}✅ DEPLOYMENT READY!${NC}"
echo -e "${GREEN}⏱️  Total Time: ${DURATION}s${NC}"
echo -e "${GREEN}---------------------------------------------------${NC}"
