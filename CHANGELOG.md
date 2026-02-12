# Changelog

---

Sve značajne promene u projektu biće dokumentovane u ovom fajlu.
Format je baziran na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) i projekat se strogo pridržava [SemVer](https://semver.org/) standarda.

---

## [1.1.0] - 2026-02-12

### 🧠 MAX1 Engine Upgrade (The Morphological Shift)

- **Morphological Intelligence:** Implementirana napredna detekcija granica morfema u Rust jezgru. Sistem sada prepoznaje prefiksalne spojeve (npr. *in-jekcija*, *kon-junkcija*, *nad-živeti*) i sprečava njihovo pogrešno preslovljavanje u ćirilične digrafe (Lj, Nj, Dž).
- **FxHashMap Caching:** Uveden ultra-brzi `FxHashMap` za thread-local keširanje reči unutar WASM modula. Performanse ponovljene obrade tokena su poboljšane za ~40%.
- **Contextual URI Protection:** Proširena zaštita za URI šeme (`mailto:`, `tel:`, `sms:`, `sip:`, `geo:`, `skype:`, `teams:`) uz pametno "trimovanje" interpunkcije na kraju rečenica.
- **System Path Guard:** Dodata automatska zaštita za Windows putanje (npr. `C:\Windows\...`) i Unix apsolutne putanje, sprečavajući njihovu korupciju tokom konverzije.
- **Improved Heuristics:** Heuristika za brendove je sada preciznija; dozvoljava preslovljavanje standardnih ALL CAPS reči (npr. "TEST", "DIV") dok istovremeno štiti CamelCase i tehničke tokene.

### 🔧 Refactoring & Code Quality

- **Unified Binary Loader:** Centralizovana logika za pretvaranje Base64 aseta u bajtove unutar `src/shared/utils/binary.ts`, eliminisanjem duplikata koda u glavnom thread-u i worker-ima.
- **TypeScript Strictness:** Postignut 0-warning status. Uklonjeni `any` tipovi kod WASM inicijalizacije i implementiran pravilan `ArrayBuffer` casting radi stabilnosti u modernim browserima.
- **Rust Clippy Hardening:** Kod u `convert.rs` je očišćen od redundantnih match grana i neiskorišćenog koda (dead code), optimizujući veličinu finalnog `.wasm` binarnog fajla.

### 🐞 Fixed

- **Linguistic Bug:** Ispravljena greška u tabeli preslovljavanja gde je malo latinično slovo `č` ostajalo nepromenjeno u ćiriličnom modu.
- **Scope Error:** Rešen kritičan problem sa "variable scope" unutar Rust konverzije dijalekata koji je uzrokovao nasumične padove build-a.
- **Test Stability:** Popravljen `test_protection` u Rust test-suiti uvođenjem `should_protect` provere direktno u procesor reči.

---

## [1.0.1] - 2026-02-11

### 🧪 DevOps / Pipeline Hardening (The Guardian 2.0)

- **Total Verify by Default:** Komanda `pnpm run verify:all` je sada primarni izvor istine (Security, Rust, Build, Unit, E2E).
- **Smart Verify Logic:** Uvedena zastavica `--smart` koja koristi `git diff` za ubrzanje feedback loop-a tokom razvoja.
- **Zero-Trust Security Audit:** Pipeline sada automatski blokira build ukoliko se pronađe propust nivoa "High" ili "Critical".

### ♿ Accessibility (A11y)

- **WCAG 2 AA Compliance:** Redefinisane brend boje (prelazak na `#005a9e`) radi postizanja kontrasta od 4.5:1.
- **Selector Precision:** Popravljeni Playwright selektori radi usklađivanja sa "Strict Mode" pravilima.

### ⚡ Performance & Stability

- **Zero-Lag Startup:** Potpuno uklonjen veštački delay od 100ms tokom inicijalizacije.
- **Failsafe Activation:** Implementiran 5s timeout guard koji automatski prebacuje UI u "Web mode" ukoliko Office host ne odgovori.

---

## [1.0.0] - 2026-01-23

Zvanično produkciono izdanje ("The Neural Frontier").

### 🚀 Glavne funkcije

- **Hybrid Core Engine:** Rust + WebAssembly (WASM) arhitektura.
- **100% Offline Posture:** Svi rečnici i logika su upakovani u bundle.
- **OOXML Smart Bridge:** Čuvanje Word formatiranja preko XML run-ova.
- **Web Batch Mode:** Drag & Drop obrada više `.docx` fajlova.

---

Dokument kreirao: architecture-team | Poslednja revizija: 2026-02-12
