# Changelog

Sve značajne promene u projektu biće dokumentovane u ovom fajlu.  
Format je baziran na <!--citation:1--> i projekat se strogo pridržava <!--citation:2--> standarda.

## [Unreleased]

### Docs / DX
- Usklađena i “hardened” dokumentacija (Architecture/State/Vision) za MAX1 milestone (manje apsolutnih tvrdnji, više proverljivih navoda).
- `verify-all.js`: vraćen i učinjen uslovnim interaktivni push prompt (samo kad je repo clean + ima šta da se pushuje), uz jasniji status u završnom report-u.

---

## [1.1.0] - 2026-02-12

### 🧠 MAX1 Engine & OOXML Structural Upgrade

- **Greedy structural bridging (OOXML):** Bridge rekonstruše logičke entitete preko split run-ova (URL/email/URI schemes, brendovi, tokeni/digrafi) pre transliteracije; refaktorisani ključni lexical bridge moduli (npr. `links.ts`, `tokens.ts`, `digraphs.ts`).
- **Morphological intelligence (WASM/Rust):** Uvedena/poboljšana detekcija prefiksalnih/morfemskih granica da bi se izbeglo pogrešno spajanje digrafa (Љ, Њ, Џ) u osetljivim kontekstima (npr. *in-jekcija*, *kon-junkcija*, *nad-živeti*).
- **FxHashMap caching:** Uveden brži cache na nivou reči/tokena u wasm modulu radi ubrzanja na dokumentima sa visokim ponavljanjem (dobitak varira; meriti na realnim DOCX uzorcima).
- **Contextual URI protection:** Proširena zaštita za URI šeme (`mailto:`, `tel:`, `sms:`, `sip:`, `geo:`, `skype:`, `teams:`) uz pametno trimovanje završne interpunkcije.
- **System path guard:** Dodata zaštita za Windows (`C:\...`) i Unix (`/usr/bin/...`) putanje da se ne korumpiraju tokom konverzije.
- **Unified binary loader:** Centralizovana logika učitavanja binarnih aseta kroz `src/shared/utils/binary.ts` i uklonjena duplikacija između main thread-a i worker-a.

### 🧹 Refactoring & Code Quality
- **TypeScript strictness:** Održan “clean” rezultat u lint/typecheck gate-ovima (0 warnings policy).
- **Rust clippy hardening:** Uklonjene redundantne grane i mrtav kod u `convert.rs`, uz održavanje clippy discipline u gate-ovima.

### 🐞 Fixed
- **Linguistic bug:** Ispravljena greška u tabeli preslovljavanja gde je malo latinično slovo `č` ostajalo nepromenjeno u određenim tokovima.
- **Scope error (Rust):** Rešen kritičan problem sa scope/konverzijom koji je mogao da izazove nestabilnost build-a u specifičnim slučajevima.
- **Test stability:** Stabilizovani Rust testovi (uključujući zaštitne/protection testove) kroz korekcije uslova provere.

---

## [1.0.1] - 2026-02-11

### 🧪 DevOps / Pipeline Hardening (The Guardian 2.0)
- **Total verify by default:** `pnpm run verify:all` kao primarni izvor istine (install, format gate, lint, typecheck, audits, Rust gates, build, validate, unit, e2e).
- **Smart verify:** Uvedena zastavica `--smart` koja koristi `git diff` za brži feedback loop.
- **Zero-trust security signal:** Pipeline signalizira (i u strict režimu gate-uje) ozbiljne propuste kroz audit korake.

### ♿ Accessibility (A11y)
- **Kontrast:** Redefinisane brend boje (prelazak na `#005a9e`) sa ciljem AA nivoa kontrasta (4.5:1 za ključne kontrole).
- **Selector precision:** Popravljeni Playwright selektori radi stabilnosti u strict režimu.

### ⚡ Performance & Stability
- **Zero-lag startup:** Uklonjen veštački init delay od 100ms.
- **Failsafe activation:** Uveden timeout guard koji prebacuje UI u fallback režim ako Office host ne odgovori u razumnom vremenu.

---

## [1.0.0] - 2026-01-23

Zvanično produkciono izdanje (“The Neural Frontier”).

### 🚀 Glavne funkcije
- **Hybrid core engine:** Rust + WebAssembly (WASM) arhitektura za brzo preslovljavanje.
- **Offline-first:** Rečnici i logika su upakovani u bundle; internet konekcija nije potrebna za osnovni rad.
- **OOXML smart bridge:** Prva verzija mosta koji čuva Word formatiranje čak i kada su reči razbijene u više XML run-ova.
- **Web batch mode:** Drag & Drop obrada više `.docx` fajlova direktno u browseru.

---

Dokument kreirao: architecture-team | Poslednja revizija: 2026-02-12
