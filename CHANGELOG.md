# Changelog

Sve značajne promene u projektu biće dokumentovane u ovom fajlu.

Format: Keep a Changelog + SemVer.

---

## [Unreleased]

### 🧪 DevOps / Tooling

- **MAX1 Guardian Verify Pipeline:** uvedeni `verify:all` i `verify:all:strict` (format, lint, typecheck, manifest validate, Rust gates, build, tests).
- **Coverage by default:** `verify:all` pokreće unit testove sa coverage (`pnpm run test:coverage`) kada nije `--fast`.
- **Windows reliability:** stabilizovano pokretanje pnpm komandi iz verify skripte (cmd.exe shim, bez `shell:true`).
- **Output polish:** poravnati reportovi (Prettier stats, Sniffer stats, Timings) i stabilno numerisanje koraka (jedan brojač).
- **Git cleanup hardening:** “NUKE branches” koristi `git push --no-verify --delete` za remote delete (sprečava Husky hook loop i dupliranje teških provera tokom masovnog brisanja).

### ♿ Accessibility (A11y)

- **WCAG AA contrast:** stabilizovan kontrast u onboarding tour UI (Axe `color-contrast`).
- **E2E stability:** A11y testovi stabilizovani čekanjem da se UI/theme stilovi ustale pre Axe analize.

### 🧹 Code Quality

- **CodeQL hardening:** uklonjeno ručno sklapanje komandi sa shell-escape/sanitization u skriptama (prelazak na args-based izvršavanje gde je moguće).

### ♻️ Web App / Updates (Service Worker)

- **Update prompt UI:** dodat banner “Update available” sa akcijama Refresh, Later i linkom ka Release notes.
- **Command Palette integration:** `Ctrl+K` prikazuje komandu “Update: refresh now” kada je update pending.
- **Service worker messaging:** UI može da pročita verziju waiting SW-a preko `MessageChannel` (`GET_VERSION` → `VERSION`) radi prikaza “from → to” u banneru (best-effort).
- **Safer reload behavior:** “Refresh now” radi samo kada aplikacija nije busy; reload se dešava tek na `controllerchange`.

---

## [1.0.0] - 2026-01-23

Official Production Release.

### 🚀 Glavne funkcije

- **Hybrid Core Engine:** Rust + WebAssembly (WASM) arhitektura za maksimalne performanse.
- **100% Offline:** svi rečnici su ugrađeni; internet konekcija nije potrebna.
- **Smart Chunking:** obrada dokumenata od 500+ strana bez blokiranja Word-a.
- **Web Batch Mode:** Drag & Drop obrada `.docx` fajlova direktno u pregledaču (PWA).
- **Interactive Preview:** napredni pregled izmena (Diff) sa mogućnošću odbacivanja promena pre primene.

### 🛡️ Sigurnost i stabilnost

- **Privacy First:** podaci se obrađuju lokalno (u memoriji); nema slanja na server.
- **Smart Guard:** automatska zaštita programskog koda, e-mailova, URL-ova i brendova (npr. iPhone, Windows).
- **Error Recovery:** automatski oporavak od grešaka i “Flight Recorder” telemetrija (lokalno u IndexedDB).

### 💅 Korisničko iskustvo

- **Dark Mode:** potpuna podrška za sistemsku tamnu temu.
- **Onboarding Tour:** interaktivni vodič za nove korisnike.
- **Custom Substitutions:** mogućnost definisanja sopstvenih pravila za zamenu.
