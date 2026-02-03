# Changelog

Sve značajne promene u projektu će biti dokumentovane u ovom fajlu.

---

## [Unreleased]

### 🧪 DevOps / Tooling

- **Guardian Verify Pipeline (MAX1):** Uveden `verify:all` i `verify:all:strict` (format, lint, typecheck, manifests validate, Rust gates, build, tests).
- **Coverage as default in verify:** `verify:all` pokreće unit testove sa coverage (`npm run test:coverage`) kada nije `--fast`.
- **Windows reliability:** Pokretanje `npm` komandi iz verify skripte je stabilizovano (cmd.exe shim, bez `shell:true`).
- **Output polish:** Poravnati reportovi (Prettier stats, Sniffer stats, Timings), stabilno numerisanje koraka (jedan brojač).
- **Git cleanup hardening:** NUKE grane koristi `git push --no-verify --delete` za remote delete (sprečava Husky hook loop i dupliranje teških provera tokom masovnog brisanja).

### ♿ Accessibility (A11y)

- **WCAG AA contrast:** Stabilizovan kontrast u onboarding tour UI (Axe `color-contrast`).
- **E2E stability:** A11y testovi stabilizovani čekanjem da se UI/theme stilovi ustale pre Axe analize.

### 🧹 Code Quality

- **CodeQL hardening:** Uklonjeno ručno shell-escape/sanitization sklapanje komandi u skriptama (prelazak na args-based izvršavanje gde je moguće).

---

## [1.0.0] - 2026-01-23

**Official Production Release.**

### 🚀 Glavne Funkcije

- **Hybrid Core Engine:** Rust + WebAssembly (WASM) arhitektura za maksimalne performanse.
- **100% Offline:** Svi rečnici su ugrađeni. Internet konekcija nije potrebna.
- **Smart Chunking:** Obrada dokumenata od 500+ strana bez blokiranja Word-a.
- **Web Batch Mode:** Drag & Drop obrada `.docx` fajlova direktno u pregledaču (PWA).
- **Interactive Preview:** Napredni pregled izmena (Diff) sa mogućnošću odbacivanja promena pre primene.

### 🛡️ Sigurnost i Stabilnost

- **Privacy First:** Podaci se obrađuju lokalno (u memoriji). Nema slanja na server.
- **Smart Guard:** Automatska zaštita programskog koda, e-mailova, URL-ova i brendova (npr. iPhone, Windows).
- **Error Recovery:** Automatski oporavak od grešaka i "Flight Recorder" telemetrija (lokalno u IndexedDB).

### 💅 Korisničko Iskustvo

- **Dark Mode:** Potpuna podrška za sistemsku tamnu temu.
- **Onboarding Tour:** Interaktivni vodič za nove korisnike.
- **Custom Substitutions:** Mogućnost definisanja sopstvenih pravila za zamenu.
