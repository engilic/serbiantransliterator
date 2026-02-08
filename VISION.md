# 🚀 VISION 2026–2028: THE NEURAL FRONTIER — THE ULTIMATE STRATEGIC BLUEPRINT

**Projekat:** Serbian Transliterator (Universal Engine)
**Arhitektonski Nivo:** MAX Mode (v7.6)
**Operativni Status:** Phase 2: Architectural Hardening
**Motto:** "Absolute Privacy. Infinite Performance. Universal Reach."

---

## 1) STRATEŠKA FILOZOFIJA: "GALAXY MODE" IMPERATIVI

Sistem ne gradimo kao "plugin", već kao **suvereni sloj za procesiranje jezika**. Svaki red koda mora biti u skladu sa četiri stuba MAX arhitekture:

### I. Arhitektura nulte latencije (The 16ms Rule)

**Problem:** JavaScript nit (Main Thread) je zagušena renderovanjem Word UI-ja. Svaki blokirajući poziv duži od 16ms uzrokuje "stutter".

**Rešenje:**

- **Worker-First:** 100% compute operacija se vrši u Web Worker-ima.
- **Zero-Lock Caching:** Implementacija `thread_local!` keša u Rustu eliminiše overhead atomskih operacija. Svaka instanca WASM-a ima svoj izolovan memorijski prostor za rečnike.
- **WASM SIMD:** Korišćenje `v128` instrukcija za paralelnu obradu karaktera. Skeniranje stringova za specijalne karaktere (linkovi, tagovi) vrši se na nivou procesorskih registara.

### II. Privatnost kao ontološki status (Privacy by Design)

- **Air-gap Standard:** Softver ne poseduje `fetch` ili `XMLHttpRequest` pozive ka spoljnim API-jima nakon inicijalizacije.
- **Local Persistence:** Koristi se isključivo `localStorage` i `IndexedDB` za čuvanje korisničkih podešavanja i telemetrije performansi.
- **No Cloud AI:** Svaka buduća inteligencija mora biti upakovana u WASM ili ONNX runtime koji se izvršava na klijentu.
- **Analytics Transparency (v1.0.0):** Agregirana, anonimna statistika korišćenja putem Cloudflare KV — bez IP adresa, kolačića ili PII podataka.

### III. Strukturalni integritet (Preservation of Intent)

- **Lexical Intelligence:** Sistem ne vidi samo "tekst", on vidi "strukturu". Razlikuje `w:t` (tekst) unutar `w:hyperlink` od običnog teksta.
- **Atomic Bridging:** Reči koje su nasumično razbijene stilovima (npr. `<b>i</b>Phone`) moraju biti rekonstruisane u memoriji, zaštićene, i vraćene u originalne XML čvorove bez gubitka stilova.

### IV. Dual-UX Paradigm (NEW — v1.0.0)

- **Office Add-in:** Deep Word integracija za profesionalne korisnike.
- **Web App:** Standalone pristup za povremene korisnike i batch procesiranje.
- **Unified Engine:** Isti Rust/WASM core deli oba UX-a — zero code duplication.

---

## 2) DETALJNA TEHNIČKA MAPA PUTA (2026–2028)

### FAZA 1: ZLATNI TEMELJI (Završeno — Q1 2026) ✅

- **Rust Core 1.0:** Prelazak sa Regex-based konverzije na FST (Finite State Transducers).
- **Gzipped Rečnici:** Smanjenje footprint-a rečnika sa 15MB na 1.8MB uz zadržavanje O(k) brzine pretrage.
- **Dual-UX Launch:** Office Add-in + Web App sa zajedničkim engine-om.
- **Analytics Infrastructure:** Cloudflare KV tracking za anonimnu statistiku korišćenja.
- **Status:** Gold Master v1.0.0 u produkciji.

### FAZA 2: ARHITEKTONSKO OJAČAVANJE (Trenutni Sprint — Q2 2026)

**Rušenje "Memorijskog Zida":**

- **Problem:** `DOMParser` kreira celo stablo objekata u RAM-u. Dokument od 100MB XML-a pojede 800MB RAM-a.
- **Rešenje:** Rust Streaming Engine (`quick-xml`). Implementacija Pull-parsera unutar WASM-a. JS šalje `Uint8Array` stream, Rust ga procesira u letu i vraća modifikovane bajtove. Memorijska kompleksnost: **O(1)** (fiksno na ~50MB bez obzira na veličinu dokumenta).

**Adaptive Chunking 2.0:** Dinamičko merenje "vremena povratka" iz Workera. Ako procesor korisnika uspori, batch size se smanjuje u realnom vremenu.

**PWA Hardening:** Service Worker sa offline-first strategijom za Web App.

### FAZA 3: EKOSISTEM OMNIPRESENCE (Q3–Q4 2026)

**Decoupling:** Potpuno razdvajanje core logike od Office.js specifičnosti.

**Novi Proizvodi:**

1. **Browser Extension 2.0:** Koristi `MutationObserver` da preslovljava Twitter/LinkedIn feed u realnom vremenu dok korisnik skroluje.
2. **Tauri Desktop Hub:** Aplikacija za masovnu konverziju lokalnih foldera sa DOCX, PDF i JSON fajlovima.
3. **MAX CLI:** Binarni alat pisan u Rustu za integraciju u serverske pipeline-ove.

**AppSource Submission:** Microsoft Office Store listing za globalnu distribuciju.

---

## 3) 🛰️ VISION 2027: THE SOVEREIGN LINGUISTIC CORE

U 2027. godini, Serbian Transliterator prestaje da bude "program" i postaje "infrastruktura".

### 1. DUBOKA LINGVISTIČKA SOVERENOST

- **Morphological Analyzer u Rustu:** Jezgro dobija sposobnost da prepozna koren reči i njene gramatičke oblike (lematizacija).
- **Context-Aware Dialect Switching:** Rešavanje problema homonima korišćenjem statističkih modela verovatnoće.
- **Smart Quote Correction:** Automatsko ispravljanje pogrešno korišćenih navodnika bazirano na kontekstu rečenice.

### 2. API ZA TREĆA LICA (SDK)

- **JS/TS Wrapper:** NPM paket (`@serbian-transliterator/core`) koji developeri mogu uvesti u svoje projekte.
- **Rust Crate:** Dostupnost jezgra na `crates.io` kao `serbian-transliterator`.
- **REST API (Optional Cloud):** Serverless endpointi za korisnike koji preferiraju cloud integraciju (opt-in).

### 3. BINARNA OPTIMIZACIJA (THE 2MB LIMIT)

Uprkos dodavanju inteligencije, ciljamo:

- **Dictionary Sharding:** Dinamičko učitavanje specijalizovanih rečnika (npr. samo medicinski termini) na zahtev korisnika.
- **LTO (Link Time Optimization):** Agresivna eliminacija mrtvog koda za WASM binar.
- **Tree Shaking:** Automatsko uklanjanje nekorišćenih funkcija iz finalnog bundle-a.

### 4. ENTERPRISE FEATURES

- **Multi-Language UI:** Podrška za Hrvatski, Bosanski, Crnogorski interfejs.
- **Custom Dictionary Upload:** Korisnici mogu učitati sopstvene liste zaštićenih reči.
- **Batch API:** Procesiranje hiljada dokumenata kroz jedan API poziv.
- **Audit Logging:** Opcioni log svih konverzija za compliance potrebe.

---

## 4) 🌌 VISION 2028: THE NEURAL LINGUISTIC LAYER

U 2028. godini, Serbian Transliterator postaje **AI-powered linguistic platform**.

### 1. LOKALNA INTELIGENCIJA (On-Device AI)

- **Quantized NER (Named Entity Recognition):** Integracija minijaturnog jezičkog modela (~15MB ONNX) za automatsko prepoznavanje imena ljudi, stranih kompanija i tehničkih termina bez potrebe za ručnim listama.
- **Contextual Disambiguation:** Rešavanje problema homonima (npr. "kosa" - glava vs. alat) korišćenjem transformer-based modela.
- **Neural Suffix Prediction:** Morfološki-svesna predikcija nastavaka za nepoznate reči.

### 2. CROSS-PLATFORM DOMINATION

- **Mobile Apps:** Native iOS/Android aplikacije sa offline WASM engine-om.
- **VS Code Extension:** Transliteracija direktno u code editoru za dokumentaciju.
- **Obsidian/Notion Plugin:** Integracija sa popularnim note-taking alatima.
- **Google Docs Add-on:** Proširenje reach-a van Microsoft ekosistema.

### 3. FEDERATED LEARNING (Privacy-Preserving)

- **Anonymous Model Improvements:** Korisnici mogu opt-in da doprinose poboljšanju modela bez slanja sirovih podataka.
- **On-Device Training:** Fine-tuning modela na korisnikovom uređaju za personalizovane preferencije.

### 4. OPEN SOURCE ECOSYSTEM

- **Core Engine:** Potpuno open-source pod MIT licencom.
- **Plugin Architecture:** Standardizovani API za community-contributed funkcionalnosti.
- **Language Packs:** Community-maintained rečnici za regionalne varijante.

---

## 5) LINGVISTIČKI I LOGIČKI IMPERATIVI

Sistem zaštite (Protection Layer) operiše u četiri nivoa dubine:

1. **Rigidni nivo:** `ALWAYS_LATIN` liste (Microsoft, Windows, iPhone).
2. **Sintaksni nivo:** Automatska detekcija koda, URL-ova, Email adresa i putanja do fajlova (`C:\...`).
3. **Heuristički nivo:** Prepoznavanje `MixedCase`, `CamelCase` i reči sa brojevima (`word1`).
4. **Kontekstualni nivo:** Bridging ambiguous sufiksa (npr. "Pro" je zaštićen samo ako mu prethodi brend iz liste).
5. **Semantički nivo (2028+):** NER-bazirano prepoznavanje entiteta bez eksplicitnih lista.

---

## 6) DEVOPS & KVALITET: "MAX1 GUARDIAN" STANDARD

Nijedna promena ne ulazi u master bez prolaska kroz **MAX1** pipeline:

- **I18n Guard:** Automatska provera da li su svi novi stringovi u kodu prisutni u `sr.ts` i `en.ts`.
- **Security Sniffer:** Skeniranje koda za tajne ključeve i nebezbedne HTML sink-ove (`innerHTML`).
- **Binary Size Watchdog:** Provera da li je WASM binar prešao granicu od 5MB.
- **E2E Fuzzing:** Playwright testovi koji simuliraju nasumične akcije korisnika brzinom od 10 klikova u sekundi.
- **Analytics Verification:** Provera da `/track` endpoint ne prima PII podatke.
- **Dependency Audit:** `pnpm audit` + `cargo audit` na svakom PR-u.

---

## 7) METRIJE USPEHA (KPIs)

### Tehničke Metrike

| Metrika | Trenutno (v1.0) | Cilj 2027 | Cilj 2028 |
|---------|-----------------|-----------|-----------|
| WASM Init (cold) | 45ms | 25ms | 15ms |
| Throughput | 18k words/sec | 50k words/sec | 100k words/sec |
| Bundle Size | 1.8MB | 1.5MB | 2.0MB (sa AI) |
| Memory (large doc) | 500MB+ | 50MB | 50MB |
| Offline Capability | Partial | Full PWA | Full + AI |

### Korisničke Metrike (via Analytics)

| Metrika | Cilj Q4 2026 | Cilj 2027 | Cilj 2028 |
|---------|--------------|-----------|-----------|
| Monthly Active Users | 1,000 | 10,000 | 100,000 |
| Conversions/Month | 10,000 | 100,000 | 1M+ |
| AppSource Rating | — | 4.5★ | 4.8★ |
| Enterprise Customers | 0 | 5 | 50 |

---

## 8) OPERATIVNI ZAKLJUČAK: TRANSLITERATOR KAO INFRASTRUKTURA

Mi ne pravimo alat za promenu pisma. Mi gradimo **most**.

- Spajamo digitalnu sadašnjost (latinica/kod) sa kulturnim nasleđem (ćirilica).
- Omogućavamo korporacijama prelazak na ćirilicu bez rizika po tehničku dokumentaciju.
- Garantujemo brzinu koja je brža od ljudske percepcije.
- Štitimo privatnost kao fundamentalno pravo, ne kao feature.

**Ovo je MAX MODE. Ovo je Neural Frontier.**

---

## 9) TIMELINE SUMMARY

    2026 Q1  ████████████████████████  v1.0.0 GOLD MASTER ✅
             └── Dual-UX Launch (Office + Web)
             └── Cloudflare Analytics
             └── MAX1 Guardian Pipeline
    
    2026 Q2  ████████░░░░░░░░░░░░░░░░  CURRENT: Phase 2 Hardening
             └── Rust Streaming Parser
             └── Memory Optimization
             └── PWA Enhancement
    
    2026 Q3  ░░░░░░░░░░░░░░░░░░░░░░░░  Browser Extension 2.0
             └── Tauri Desktop Hub
             └── MAX CLI
    
    2026 Q4  ░░░░░░░░░░░░░░░░░░░░░░░░  AppSource Submission
             └── Enterprise Features
    
    2027 Q1  ░░░░░░░░░░░░░░░░░░░░░░░░  SDK Launch
             └── NPM Package
             └── Rust Crate
    
    2027 Q2  ░░░░░░░░░░░░░░░░░░░░░░░░  Morphological Analyzer
             └── Context-Aware Dialects
    
    2027 Q3  ░░░░░░░░░░░░░░░░░░░░░░░░  Multi-Language UI
             └── Custom Dictionaries
    
    2027 Q4  ░░░░░░░░░░░░░░░░░░░░░░░░  v2.0.0 MAJOR RELEASE
             └── Full SDK Ecosystem
    
    2028 Q1  ░░░░░░░░░░░░░░░░░░░░░░░░  On-Device AI Integration
             └── NER Model
             └── Neural Suffix Prediction
    
    2028 Q2  ░░░░░░░░░░░░░░░░░░░░░░░░  Mobile Apps
             └── iOS + Android
    
    2028 Q3  ░░░░░░░░░░░░░░░░░░░░░░░░  Cross-Platform Plugins
             └── VS Code, Obsidian, Notion
    
    2028 Q4  ░░░░░░░░░░░░░░░░░░░░░░░░  v3.0.0 AI-POWERED RELEASE
             └── Federated Learning
             └── Full Open Source Ecosystem

---

**Februar 2026. Rezime:** Fokus je na **Phase 2 Hardening**. Rušimo memorijski zid, jačamo PWA, i pripremamo teren za 2027 SDK ekosistem.

---

**Dokument kreirao:** Serbian Transliterator Architecture Team
**Poslednja revizija:** Februar 8, 2026
**Sledeća revizija:** Nakon v1.1.0 release-a (Q2 2026)

---

© 2026 Serbian Transliterator Project. Licensed under MIT.
