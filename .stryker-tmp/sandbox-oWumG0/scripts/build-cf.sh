#!/bin/bash
# scripts/build-cf.sh

# --- KONFIGURACIJA ---
set -e # Prekini odmah ako bilo šta pukne

# --- ANSI BOJE ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

START_TIME=$SECONDS

# Error Trap
trap 'echo -e "${RED}❌ FATAL ERROR on line $LINENO! Build aborted.${NC}"; exit 1' ERR

# --- BANNER ---
echo -e "${CYAN}"
echo -e "${NC}"
echo -e "${BLUE}🚀 CLOUDFLARE PRODUCTION BUILDER • GOD MODE${NC}"
echo "---------------------------------------------------"

# 1. SYSTEM DIAGNOSTICS
echo -e "\n${YELLOW}🔍 [1/5] System Diagnostics${NC}"
echo "   • Node: $(node -v)"
echo "   • NPM:  $(npm -v)"
echo "   • Path: $(pwd)"
if [ -f /proc/meminfo ]; then
    FREE_MEM=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
    echo "   • Mem:  $((FREE_MEM / 1024)) MB Available"
fi

# 2. RUST TOOLCHAIN (Smart Install)
echo -e "\n${YELLOW}🦀 [2/5] Rust Toolchain${NC}"
if ! command -v rustc &> /dev/null; then
    echo -e "${CYAN}   ➜ Installing Rust (Minimal Profile)...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable
    source "$HOME/.cargo/env"
else
    echo -e "${GREEN}   ➜ Rust detected (Cached).${NC}"
fi
echo -e "   ✔ $(rustc --version)"

# 3. WASM-PACK (Smart Install)
echo -e "\n${YELLOW}📦 [3/5] Wasm-Pack${NC}"
if ! command -v wasm-pack &> /dev/null; then
    echo -e "${CYAN}   ➜ Installing wasm-pack...${NC}"
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
else
    echo -e "${GREEN}   ➜ wasm-pack detected (Cached).${NC}"
fi
echo -e "   ✔ $(wasm-pack --version)"

# 4. DEPENDENCIES
echo -e "\n${YELLOW}📥 [4/5] NPM Dependencies${NC}"
# --prefer-offline: Koristi keš ako je dostupan
# --no-audit --no-fund: Ubrzava instalaciju
npm ci --prefer-offline --no-audit --no-fund --quiet
echo -e "${GREEN}   ✔ Modules installed.${NC}"

# 5. BUILD
echo -e "\n${YELLOW}🛠️  [5/5] Compiling Project${NC}"
echo -e "${CYAN}   ➜ Running Webpack + Cargo...${NC}"
npm run build

# Validation
if [ ! -f "dist/taskpane.html" ]; then
    echo -e "${RED}❌ Build finished but 'dist/taskpane.html' is missing!${NC}"
    exit 1
fi

DURATION=$(($SECONDS - $START_TIME))
echo -e "\n${GREEN}---------------------------------------------------"
echo "✅ DEPLOYMENT READY!"
echo "⏱️  Total Time: ${DURATION}s"
echo -e "---------------------------------------------------${NC}"
