# 🛡️ WORKFLOW v8.1 — PNPM OPS EDITION (MAXIMUM SECURITY)

Project: Serbian Transliterator (Hybrid: TypeScript + Rust/WASM)
Environment: Visual Studio 2026, PowerShell 7, Node 22.x, pnpm 9.x (Volta), Rust (Stable), wasm-pack
Ops Level: ZERO TOLERANCE for errors.
Core Principle: “Local Verification is the only Source of Truth.”
Labeling: MAX1 Guardian
Default branch: master

# ============================================================ 0) ☢️ DAILY SANITY & CLEAN SLATE

Pre pisanja ijedne linije koda, osiguraj da je okruženje sterilno.
Stari artefakti i stale cache su neprijatelji stabilnosti.

STANDARD START (svaki dan)

1. Idi na master i povuci najnovije promene.
2. Sinhronizuj zavisnosti.
3. Očisti build artefakte (dist/coverage/pkg).

PS> git switch master
PS> git pull --ff-only
PS> pnpm install
PS> pnpm run clean

VISUAL STUDIO 2026 “CACHE RESET” (kada IntelliSense poludi)
Ako VS ne vidi nove tipove (npr. Office types), ili Error List prijavljuje fantomske probleme:

Napomena: Zatvori Visual Studio pre ovoga.
PS> Remove-Item -Recurse -Force .vs -ErrorAction SilentlyContinue

THE “NUCLEAR OPTION” (Emergency Only)
Koristi samo ako:

- module not found,
- čudne greške pri kompajliranju,
- WASM/pkg artefakti stale,
- VS/tsserver se ne vraća u život.

PAŽNJA: Briše sve fajlove koji nisu pod git kontrolom i ignorisane foldere!

PS> git clean -fdX
PS> Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
PS> Remove-Item -Recurse -Force .vs -ErrorAction SilentlyContinue
PS> pnpm store prune
PS> pnpm install
PS> cd src/wasm-core
PS> cargo clean
PS> cd ../..
PS> pnpm run build:wasm

============================================================

1. # 🧬 DEVELOPMENT LIFECYCLE

A) BRANCHING STRATEGY
Direktni commit-ovi na master su ZABRANJENI (osim release commit-ova generisanih skriptama).

Format: tip/kebab-case-opis

Types:

- feat/ — nove funkcionalnosti (npr. feat/streaming-parser)
- fix/ — bugfix (npr. fix/memory-leak)
- refactor/ — refaktor bez promene ponašanja
- chore/ — config, skripte, deps
- docs/ — dokumentacija

PS> git switch -c feat/my-new-feature

B) THE CODING STANDARD (LAW)

1. FILE IDENTITY HEADERS (MANDATORY)
   Svaki izvorni fajl (.ts, .rs, .js, .ps1) MORA početi sa komentarom relativne putanje.

PS> pwsh ./scripts/add-headers.ps1

2. NO console.log
   Koristi isključivo logger:

- logger.info()
- logger.warn()
- logger.error()

Izuzetak: privremeni lokalni debugging koji se briše pre commit-a.

3. STRICT TYPING (Security-first)

- any je zabranjen u produkcionom kodu. Koristi unknown + type guards.
- Interfejsi moraju biti eksplicitni.

OFFICE.JS TIPOVI (MUST-HAVE)

- Drži ovo na vrhu src/global.d.ts:
  /// <reference types="office-js" />

- ESLint mora tolerisati triple-slash u .d.ts:
    - Dodaj override za \*_/_.d.ts i ugasi @typescript-eslint/triple-slash-reference (ako se ikad javi).

4. ERROR HANDLING (Never swallow errors)

- Nikada ne gutaj greške.
- Koristi normalizeUnknownError(e) pre logovanja.
- UI mora imati fallback (toast/banner), nikada white-screen.

# ============================================================ 2) 🛡️ THE GUARDIAN GATE (MAX1 VERIFICATION)

Guardian (scripts/verify-all.js) je vrhovni autoritet. Ako on padne — tvoj kod ne postoji.

LEVEL 0: ULTRA-FAST VERIFY (Quick Sanity)
Najbrži feedback loop (svaki put pre/posle većih izmena):

PS> pnpm run format:check
PS> pnpm run lint
PS> pnpm run typecheck

Napomena (Windows/PowerShell):

- Globovi su najstabilniji kad su u navodnicima u package.json,
  npr. eslint "src/\*_/_.ts" --max-warnings 0

LEVEL 1: FAST VERIFY (During Dev)
Dodaje unit testove bez E2E:

PS> pnpm run test

LEVEL 2: FULL VERIFY (Pre-Commit)
Sve relevantno pre commita:

PS> pnpm run lint
PS> pnpm run typecheck
PS> pnpm run test
PS> pnpm run build
PS> pnpm run validate

LEVEL 3: STRICT VERIFY (Pre-Push / CI / Release)
Maksimalna sigurnost:

PS> pnpm run verify:all:strict

CHECKLIST koji Gate mora da pokrije (lokalno ili kroz verify-all)

- Header check (putanje na vrhu fajlova)
- Conflict check (<<<<<<<)
- Big file gate (npr. >5MB)
- I18n integrity
- Rust gates: cargo fmt, cargo clippy (bez warninga), cargo test
- Build gate: pnpm run build
- Test gate: pnpm run test (+ coverage ako je enforced)
- E2E gate: pnpm run test:e2e (po potrebi)

# ============================================================ 3) 🦀 RUST & WASM WORKFLOW

MANUALNA KOMPILACIJA WASM-a
PS> pnpm run build:wasm
Generiše src/wasm-core/pkg neophodan za TypeScript.

KOMPILACIJA REČNIKA
Ako menjaš .json u src/static/assets/:

PS> pnpm run compile:dicts

RUST TESTOVI
PS> cd src/wasm-core
PS> cargo test

# ============================================================ 4) 🚀 COMMIT, PUSH & PR

COMMIT PROTOCOL (Conventional Commits)

- feat: → minor (1.1.0)
- fix: → patch (1.0.1)
- feat!: ili BREAKING CHANGE: → major (2.0.0)

PUSH SEQUENCE

1. Finalna provera:
   PS> pnpm run lint
   PS> pnpm run typecheck
   PS> pnpm run test

2. Stage & Commit:
   PS> git add .
   PS> git commit -m "feat: implement ..."

3. Push:
   PS> git push -u origin feat/my-new-feature

# ============================================================ 5) 📦 RELEASE PROCEDURE (Maintainers Only)

PS> git switch master
PS> git pull --ff-only
PS> pnpm run verify:all:strict
PS> pnpm run release
PS> git push --follow-tags

# ============================================================ 6) 🚑 TROUBLESHOOTING

A) WASM module not found / File not found
PS> pnpm run build:wasm

B) Webpack “PureExpressionDependency” (Dev Mode)
Ako se javi regresija u Webpack 5.x, u webpack.dev.js:

optimization:
concatenateModules: false
providedExports: false
usedExports: false
sideEffects: false

C) Node/pnpm mismatch (Volta is law)
PS> node -v
PS> pnpm -v
Ako nije Node 22:
PS> volta install node@22

D) CodeQL “flapping”
PS> git grep "codeql-action" .github/workflows
Samo jedan workflow sme da uploaduje SARIF.

E) wasm-pack nije pronađen
PS> cargo install wasm-pack

F) Visual Studio Warning: “Missing attribute name” u .html
Ovo je često VS HTML validator + template sintaksa (npr. EJS <%= ... %>), posebno kad je fajl pod “Miscellaneous Files”.
Pravila:

- Ako build radi, to je editor-noise.
- Ako hoćeš da ga utišaš: Tools → Options → Text Editor → HTML → Validation (relaksiraj ili isključi).

============================================================
📊 CI/CD INFRASTRUCTURE
============================================================

GITHUB ACTIONS

- Node: 22.x
- pnpm: 9.x
- Rust: Stable
- wasm-pack: auto
- Trigger: Push/PR

CLOUDFLARE PAGES

- Node: 22.x
- pnpm: 9.x
- Rust: Stable
- wasm-pack: auto
- Trigger: Push to master

LOCAL (Volta)

- Node: 22.x
- pnpm: 9.x
- Rust: Stable
- wasm-pack: manual (ako nije u PATH)
- Trigger: pnpm start, pnpm run verify:all, pnpm run verify:all:strict
