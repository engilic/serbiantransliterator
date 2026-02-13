# Changelog

---

Sve značajne promene u projektu biće dokumentovane u ovom fajlu.
Format je baziran na <!--citation:1--> i projekat se strogo pridržava <!--citation:2--> standarda.

---

## [Unreleased]

### 🧠 MAX1 Engine & Structural Upgrade (The Greedy Shift)

- **Greedy Structural Bridging:** Potpuno novi mehanizam spajanja OOXML run-ova u bridge sloju (naročito `links.ts`, `tokens.ts`, `digraphs.ts`). Sistem sada “greedy” rekurzivno skuplja karaktere preko XML granica kako bi razbijeni linkovi (mailto/tel/https) i brendovi (npr. iPhone/PayPal) bili rekonstruisani pre transliteracije.
- **Morphological Intelligence (WASM/Rust):** Poboljšana detekcija granica morfema/prefiksalnih spojeva (npr. _in-jekcija_, _kon-junkcija_, _nad-živeti_) kako bi se sprečilo pogrešno spajanje u ćirilične digrafe (Љ, Њ, Џ) u kontekstima gde ne pripada.
- **WASM caching (FxHashMap):** Uveden brzi cache na nivou reči u wasm modulu radi ubrzanja obrade ponovljenih tokena (dobitak zavisi od dokumenta; benchmark/meri se kroz realne DOCX uzorke).
- **Hardened XML Parser:** Pojačana zaštita u `xmlParser.ts` (strože blokiranje DTD/entity definicija i ograničenja za patološke XML strukture) radi smanjenja rizika od XXE i “billion laughs” klase napada.
- **Contextual URI Protection:** Proširena zaštita za URI šeme (mailto, tel, sms, sip, geo, skype, teams) uz pametno trimovanje završne interpunkcije u rečenicama.
- **Unified Binary Loader:** Centralizovana logika za učitavanje binarnih aseta kroz `src/shared/utils/binary.ts`, uz uklanjanje duplikata u radnim nitima i konzistentniji loader kroz aplikaciju.

### 🧪 DevOps / Pipeline Hardening (The Guardian 2.0)

- **Total Verify by Default:** `pnpm run verify:all` je primarni “source of truth” i pokreće kompletan niz provera (install, format gate, lint, typecheck, audits, Rust gates, build, manifest validate, unit, e2e).
- **Security gates:** `pnpm audit` i `cargo audit` su integrisani u strict verifikaciju (gating u strict režimu).
- **Env/Secrets hygiene:** Runtime tajne više nisu tracked: `plausible-conf.env` je uklonjen iz repoa i zamenjen template fajlom `plausible-conf.env.example`. Dodat `.env.example` za lokalni bootstrap.

### ♿ Accessibility (A11y)

- **Contrast improvements (AA target):** Redefinisane primarne brend boje (prelazak na `#005a9e`) sa ciljem da se obezbedi minimum 4.5:1 kontrasta za ključne UI kontrole (kontrast je lako proverljiv, ali “WCAG AA compliant” kao formalna tvrdnja zavisi i od drugih a11y aspekata).
- **Zero-Lag Startup:** Uklonjen veštački delay od 100ms tokom inicijalizacije; start je brži (subjektivno i kroz UX).

### 🐞 Fixed

- **Linguistic Bug:** Ispravljene greške u tabeli preslovljavanja (npr. malo latinično slovo `č` u određenim tokovima obrade).
- **Namespace Optimization:** Pametno upravljanje `xml:space="preserve"` atributom; atribut se uklanja kada više nije potreban, održavajući OOXML čistim.
- **Rust Clippy Hardening:** Očišćen kod u `convert.rs` (redundantne grane i mrtav kod), uz održavanje 0-warning discipline u gate-ovima.

---

## [1.0.0] - 2026-01-23

Zvanično produkciono izdanje ("The Neural Frontier").

### 🚀 Glavne funkcije

- **Hybrid Core Engine:** Implementirana Rust + WebAssembly (WASM) arhitektura za brzo preslovljavanje.
- **Offline-first:** Rečnici i logika su upakovani u bundle; internet konekcija nije potrebna za osnovni rad.
- **OOXML Smart Bridge:** Prva verzija mosta koji čuva Word formatiranje čak i kada su reči razbijene u više XML run-ova.
- **Web Batch Mode:** Omogućena Drag & Drop obrada više `.docx` fajlova direktno u browseru.

---

Dokument kreirao: architecture-team | Poslednja revizija: 2026-02-12
