# 🛡️ WORKFLOW v8.2 — PNPM OPS EDITION
---

**Project:** Serbian Transliterator (Hybrid: TypeScript + Rust/WASM)
**Environment:** Visual Studio 2026, PowerShell 7, Node 22.x, pnpm 9.x (Volta), Rust (Stable)
**Ops Level:** ZERO TOLERANCE for errors.
**Core Principle:** “Local Verification is the only Source of Truth.”

# ☢️ 00 // DAILY SANITY & CLEAN SLATE
---
Pre pisanja koda, osiguraj da je okruženje sterilno. Stari build artefakti i "stale" keš su neprijatelji stabilnosti.

### STANDARD START (Svaki dan)
1. Idi na master i povuci najnovije promene.
2. Sinhronizuj zavisnosti i očisti keširane artefakte.

PS> git switch master
PS> git pull --ff-only
PS> pnpm install
PS> pnpm run clean

### VISUAL STUDIO 2026 “CACHE RESET”
Ako Visual Studio prijavi lažne greške (npr. Error 5102 na `tsconfig.json`) ili IntelliSense ne vidi Office tipove:
1. Zatvori Visual Studio.
2. PS> Remove-Item -Recurse -Force .vs -ErrorAction SilentlyContinue
3. Ponovo otvori projekat.

### THE “NUCLEAR OPTION” (Samo u hitnim slučajevima)
Koristi ako su node_modules korumpirani ili WASM artefakti nekonzistentni.
PS> git clean -fdX
PS> pnpm install
PS> cd src/wasm-core; cargo clean; cd ../..
PS> pnpm run build:wasm

# 🧬 01 // DEVELOPMENT LIFECYCLE
---
### A) BRANCHING STRATEGY
Direktni commit-ovi na master su ZABRANJENI.
Format grana: `tip/kebab-case-opis` (npr. `feat/streaming-parser`, `fix/a11y-contrast`).

### B) THE CODING STANDARD (LAW)
1. **FILE IDENTITY HEADERS:** Svaki izvorni fajl (.ts, .rs, .js) MORA početi sa putanjom na prvoj liniji. (PS> pwsh ./scripts/add-headers.ps1)
2. **NO console.log:** Koristi isključivo interni `logger` (info, warn, error).
3. **STRICT TYPING:** Upotreba `any` je strogo zabranjena. Koristi `unknown` + type guards.
4. **WCAG 2 AA COMPLIANCE:** Svaka promena boja mora proći kontrast test (Min 4.5:1). Standardna plava: `#005a9e`.

# 🛡️ 02 // THE GUARDIAN GATE (MAX1 VERIFICATION)
---
`scripts/verify-all.js` je vrhovni autoritet. On sada podrazumevano radi SVE.

### LEVEL 0: ULTRA-FAST VERIFY (Pre-commit / Quick Sanity)
Proverava sintaksu, formate i I18n ključeve.
PS> pnpm run verify:all --ultra-fast

### LEVEL 1: SMART VERIFY (Tokom razvoja)
Radi kompletan pipeline, ali pametno preskače module koje nisi menjao koristeći git diff.
PS> pnpm run verify:all --smart

### LEVEL 2: TOTAL VERIFY (Pre-Push / CI / Source of Truth)
Podrazumevani mod. Ne preskače ništa. Radi Security Audit, Rust, Build, Unit Tests i E2E.
PS> pnpm run verify:all

### LEVEL 3: STRICT VERIFY (Samo za Release proces)
Dodaje najstrože provere distribucionih artefakata.
PS> pnpm run verify:all:strict

# 🦀 03 // RUST & WASM WORKFLOW
---
### MANUALNA KOMPILACIJA WASM-a
Neophodno pre pokretanja TypeScript testova koji zavise od jezgra.
PS> pnpm run build:wasm

### KOMPILACIJA REČNIKA
Pokreni ako menjaš .json fajlove sa pravilima preslovljavanja.
PS> pnpm run compile:dicts

### RUST TESTOVI & VERZIJE
PS> cd src/wasm-core
PS> cargo test
PS> cargo update --dry-run (Informativni uvid u zastarelost Rust biblioteka).

# 🚀 04 // COMMIT, PUSH & PR
---
### COMMIT PROTOCOL
Prati Conventional Commits standard:
- `feat:` (nova funkcija)
- `fix:` (ispravka)
- `refactor:` (promena koda bez promene logike)

### PUSH SEQUENCE
1. **Total Verify:** PS> pnpm run verify:all (Mora biti 🟢 zeleno!).
2. **Stage & Commit:** PS> git add . && git commit -m "feat: implement logic for ..."
3. **Push:** PS> git push -u origin tip/opis-grane

# 📦 05 // RELEASE PROCEDURE
---
1. PS> git switch master && git pull --ff-only
2. PS> pnpm run verify:all:strict
3. PS> pnpm run release
4. PS> git push --follow-tags

# 🚑 06 // TROUBLESHOOTING
---
- **E2E Report:** Playwright ne otvara brauzer automatski radi tišine. Otvori ga sa: PS> pnpm exec playwright show-report
- **Security Audit:** Ako `pnpm audit` nađe propuste, prvo pokušaj `pnpm update`. Ako ne pomaže, koristi `overrides` u `package.json`.
- **Node/pnpm Mismatch:** Volta je obavezna. (PS> volta install node@22)
