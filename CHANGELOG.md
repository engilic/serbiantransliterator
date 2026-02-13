# Changelog

---

Sve značajne promene u projektu biće dokumentovane u ovom fajlu.
Format je baziran na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) i projekat se strogo pridržava [SemVer](https://semver.org/) standarda.

---

## [Unreleased]

### 🧠 MAX1 Engine & Structural Upgrade (The Greedy Shift)

- **Greedy Structural Bridging:** Potpuno novi mehanizam spajanja XML run-ova (`links.ts`, `tokens.ts`, `digraphs.ts`). Sistem sada rekurzivno "usisava" karaktere preko XML granica kako bi osigurao da razbijeni linkovi (mailto, tel, https) i brendovi (iPhone, PayPal) budu sastavljeni pre transliteracije.
- **Morphological Intelligence:** Implementirana detekcija granica morfema u Rust jezgru. Engine sada prepoznaje prefiksalne spojeve (npr. _in-jekcija_, _kon-junkcija_, _nad-živeti_) i sprečava njihovo pogrešno spajanje u ćirilične digrafe (Љ, Њ, Џ).
- **FxHashMap Caching:** Uveden ultra-brzi `FxHashMap` za keširanje reči unutar WASM modula, čime je brzina obrade ponovljenih reči na velikim dokumentima povećana za ~40%.
- **Hardened XML Parser:** Dodata provera dubine XML stabla (>50,000 elemenata) i stroža blokada DTD/Entity definicija radi zaštite od XXE i "Billion Laughs" napada.
- **Contextual URI Protection:** Proširena zaštita za URI šeme (mailto, tel, sms, sip, geo, skype, teams) uz pametno "trimovanje" interpunkcije na kraju rečenica.
- **Unified Binary Loader:** Centralizovana logika za učitavanje binarnih aseta kroz `src/shared/utils/binary.ts`, eliminisanjem duplikata koda u radnim nitima.

### 🧪 DevOps / Pipeline Hardening (The Guardian 2.0)

- **Total Verify by Default:** Komanda `pnpm run verify:all` je sada primarni izvor istine. Podrazumevano pokreće kompletan niz provera (Security, Rust, Build, Unit, E2E) uz nultu toleranciju na ESLint warning-e.
- **Dependency Health Check:** Integrisan `pnpm audit` direktno u terminalski izveštaj. Pipeline automatski blokira build ukoliko se pronađe propust nivoa "High" ili "Critical".
- **Strict Type System:** Postignut 0-warning status u TypeScript-u. Uklonjeni `any` tipovi i implementiran pravilan `ArrayBuffer` casting za WASM module.

### ♿ Accessibility (A11y)

- **WCAG 2 AA Compliance:** Redefinisane primarne brend boje (prelazak na `#005a9e`) radi osiguravanja kontrasta od 4.5:1 na svim UI površinama.
- **Zero-Lag Startup:** Potpuno uklonjen veštački delay od 100ms tokom inicijalizacije. Aplikacija se sada pokreće trenutno nakon prijema Office signala.

### 🐞 Fixed

- **Linguistic Bug:** Ispravljena greška u tabeli preslovljavanja gde je malo latinično slovo `č` ostajalo nepromenjeno u ćiriličnom modu.
- **Namespace Optimization:** Implementirano pametno upravljanje `xml:space="preserve"` atributom koji se sada uklanja kada više nije potreban, održavajući XML čistim.
- **Rust Clippy Hardening:** Kod u `convert.rs` je očišćen od redundantnih match grana i neiskorišćenog koda.

---

## [1.0.0] - 2026-01-23

Zvanično produkciono izdanje ("The Neural Frontier").

### 🚀 Glavne funkcije

- **Hybrid Core Engine:** Implementirana Rust + WebAssembly (WASM) arhitektura za ekstremno brzo preslovljavanje.
- **100% Offline Posture:** Svi rečnici i logika su upakovani u bundle; internet konekcija nije potrebna za rad.
- **OOXML Smart Bridge:** Prva verzija mosta koji čuva Word formatiranje čak i kada su reči razbijene u više XML run-ova.
- **Web Batch Mode:** Omogućena Drag & Drop obrada više `.docx` fajlova direktno u browseru.

---

Dokument kreirao: architecture-team | Poslednja revizija: 2026-02-12
