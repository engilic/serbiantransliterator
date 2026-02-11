# Changelog

---

Sve značajne promene u projektu biće dokumentovane u ovom fajlu.
Format je baziran na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) i projekat se strogo pridržava [SemVer](https://semver.org/) standarda.

---

## [Unreleased]

### 🧪 DevOps / Pipeline Hardening (The Guardian 2.0)

- **Total Verify by Default:** Komanda `pnpm run verify:all` je sada primarni izvor istine. Podrazumevano pokreće kompletan niz provera (Security, Rust, Build, Unit, E2E) bez preskakanja.
- **Smart Verify Logic:** Uvedena zastavica `--smart` koja koristi `git diff` za inteligentno preskakanje modula koji nisu menjani, značajno ubrzavajući feedback loop tokom razvoja.
- **Zero-Trust Security Audit:** Integrisan detaljan prikaz `pnpm audit` tabele direktno u terminalski izveštaj. Pipeline automatski blokira build ukoliko se pronađe propust nivoa "High" ili "Critical" u produkcionim zavisnostima.
- **Dependency Health Check:** Dodata provera za kompatibilne update-ove biblioteka (`pnpm outdated --compatible`) i status Rust jezgra (`cargo update --dry-run`).
- **Silent Operations:** Sve interne PNPM komande su utišane (`--silent`) kako bi se uklonila log-buka i omogućio fokus na stvarne rezultate testova.
- **Output Standardisation:** Implementirano vizuelno razdvajanje koraka sa tačno dva prazna reda nakon svakog uspešnog statusa radi lakše čitljivosti dugačkih izveštaja.

### ♿ Accessibility (A11y)

- **WCAG 2 AA Compliance:** Redefinisane sve primarne brend boje (prelazak na `#005a9e`) kako bi se osigurao minimalni odnos kontrasta od 4.5:1 na svim UI površinama, čime je aplikacija postala potpuno pristupačna slabovidim osobama.
- **Selector Precision:** Popravljeni Playwright selektori radi usklađivanja sa "Strict Mode" pravilima, rešavajući konflikte između interaktivnih dugmića i dekorativnih elemenata.

### ⚡ Performance & Stability

- **Zero-Lag Startup:** Potpuno uklonjen veštački delay od 100ms tokom inicijalizacije. Aplikacija se sada pokreće trenutno nakon prijema Office signala.
- **Robust Office Integration:** Refaktorisana `onReady` logika u Taskpane-u. Office stub u E2E testovima sada ispravno vraća Promise, čime su eliminisani nasumični timeout-i u CI okruženju.
- **Failsafe Activation:** Implementiran 5s timeout guard koji automatski prebacuje UI u "Web mode" ukoliko Office host ne odgovori, obezbeđujući stabilnost u svim uslovima.

### 🔧 Configuration & Tooling

- **TS Config Modernization:** Uklonjena zastarela `baseUrl` opcija; prelazak na moderni `moduleResolution: "bundler"` standard radi bolje podrške za WebAssembly i moderne pakete.
- **CodeQL Hardening:** Poboljšana sigurnost skripti eliminacijom manuelnog sklapanja stringova komandi.

---

## [1.0.0] - 2026-01-23

Zvanično produkciono izdanje ("The Neural Frontier").

### 🚀 Glavne funkcije

- **Hybrid Core Engine:** Implementirana Rust + WebAssembly (WASM) arhitektura za ekstremno brzo preslovljavanje.
- **100% Offline Posture:** Svi rečnici i logika su upakovani u bundle; internet konekcija nije potrebna za rad.
- **OOXML Smart Bridge:** Prva verzija mosta koji čuva Word formatiranje (bold, italic, fontove) čak i kada su reči razbijene u više XML run-ova.
- **Web Batch Mode:** Omogućena Drag & Drop obrada više `.docx` fajlova direktno u browseru (PWA standard).
- **Interactive Diff:** Uveden napredni sistem za pregled promena pre primene u dokument.

### 🛡️ Sigurnost i privatnost

- **Privacy First Policy:** Podaci se obrađuju isključivo u lokalnoj memoriji; nema slanja na server.
- **Intelligence Guard:** Automatska zaštita programskog koda, e-mailova, URL-ova i preko 5.000 globalnih brendova.

### 💅 Korisničko iskustvo

- **Auto Dark Mode:** Potpuna podrška za tamnu temu bazirana na podešavanjima sistema ili Office hosta.
- **Custom Substitutions:** Korisnici mogu definisati sopstvena pravila zamene preko "-> " sintakse.

---

Dokument kreirao: architecture-team | Poslednja revizija: 2026-02-11
