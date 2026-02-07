# 🚀 VISION 2026: THE NEURAL FRONTIER — THE ULTIMATE STRATEGIC BLUEPRINT

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

### III. Strukturalni integritet (Preservation of Intent)

- **Lexical Intelligence:** Sistem ne vidi samo "tekst", on vidi "strukturu". Razlikuje `w:t` (tekst) unutar `w:hyperlink` od običnog teksta.
- **Atomic Bridging:** Reči koje su nasumično razbijene stilovima (npr. `<b>i</b>Phone`) moraju biti rekonstruisane u memoriji, zaštićene, i vraćene u originalne XML čvorove bez gubitka stilova.

---

## 2) DETALJNA TEHNIČKA MAPA PUTA (2026–2028)

### FAZA 1: ZLATNI TEMELJI (Završeno — Q1 2026)

- **Rust Core 1.0:** Prelazak sa Regex-based konverzije na FST (Finite State Transducers).
- **Gzipped Rečnici:** Smanjenje footprint-a rečnika sa 15MB na 1.8MB uz zadržavanje O(k) brzine pretrage.
- **Status:** Gold Master v1.0.0 u produkciji.

### FAZA 2: ARHITEKTONSKO OJAČAVANJE (Trenutni Sprint — Q2 2026)

**Rušenje "Memorijskog Zida":**

- **Problem:** `DOMParser` kreira celo stablo objekata u RAM-u. Dokument od 100MB XML-a pojede 800MB RAM-a.
- **Rešenje:** Rust Streaming Engine (`quick-xml`). Implementacija Pull-parsera unutar WASM-a. JS šalje `Uint8Array` stream, Rust ga procesira u letu i vraća modifikovane bajtove. Memorijska kompleksnost: **O(1)** (fiksno na ~50MB bez obzira na veličinu dokumenta).

**Adaptive Chunking 2.0:** Dinamičko merenje "vremena povratka" iz Workera. Ako procesor korisnika uspori, batch size se smanjuje u realnom vremenu.

### FAZA 3: EKOSISTEM OMNIPRESENCE (Q3–Q4 2026)

**Decoupling:** Potpuno razdvajanje core logike od Office.js specifičnosti.

**Novi Proizvodi:**

1. **Browser Extension 2.0:** Koristi `MutationObserver` da preslovljava Twitter/LinkedIn feed u realnom vremenu dok korisnik skroluje.
2. **Tauri Desktop Hub:** Aplikacija za masovnu konverziju lokalnih foldera sa DOCX, PDF i JSON fajlovima.
3. **MAX CLI:** Binarni alat pisan u Rustu za integraciju u serverske pipeline-ove.

### FAZA 4: LOKALNA INTELIGENCIJA (2027+)

- **Quantized NER (Named Entity Recognition):** Integracija minijaturnog jezičkog modela (~15MB) za automatsko prepoznavanje imena ljudi, stranih kompanija i tehničkih termina bez potrebe za ručnim listama.
- **Contextual Dialect Switching:** Rešavanje problema homonima (npr. "kosa" - glava vs. alat) korišćenjem HMM (Hidden Markov Models) za izbor ispravnog oblika pri ijekavizaciji.

---

## 3) LINGVISTIČKI I LOGIČKI IMPERATIVI

Sistem zaštite (Protection Layer) operiše u četiri nivoa dubine:

1. **Rigidni nivo:** `ALWAYS_LATIN` liste (Microsoft, Windows, iPhone).
2. **Sintaksni nivo:** Automatska detekcija koda, URL-ova, Email adresa i putanja do fajlova (`C:\...`).
3. **Heuristički nivo:** Prepoznavanje `MixedCase`, `CamelCase` i reči sa brojevima (`word1`).
4. **Kontekstualni nivo:** Bridging ambiguous sufiksa (npr. "Pro" je zaštićen samo ako mu prethodi brend iz liste).

---

## 4) DEVOPS & KVALITET: "MAX1 GUARDIAN" STANDARD

Nijedna promena ne ulazi u master bez prolaska kroz **MAX1** pipeline:

- **I18n Guard:** Automatska provera da li su svi novi stringovi u kodu prisutni u `sr.ts` i `en.ts`.
- **Security Sniffer:** Skeniranje koda za tajne ključeve i nebezbedne HTML sink-ove (`innerHTML`).
- **Binary Size Watchdog:** Provera da li je WASM binar prešao granicu od 5MB.
- **E2E Fuzzing:** Playwright testovi koji simuliraju nasumične akcije korisnika brzinom od 10 klikova u sekundi.

---

## 5) OPERATIVNI ZAKLJUČAK: TRANSLITERATOR KAO INFRASTRUKTURA

Mi ne pravimo alat za promenu pisma. Mi gradimo **most**.

- Spajamo digitalnu sadašnjost (latinica/kod) sa kulturnim nasleđem (ćirilica).
- Omogućavamo korporacijama prelazak na ćirilicu bez rizika po tehničku dokumentaciju.
- Garantujemo brzinu koja je brža od ljudske percepcije.

**Ovo je MAX MODE. Ovo je Neural Frontier.**

---

# 🛰️ VISION 2027: THE SOVEREIGN LINGUISTIC CORE

U 2027. godini, Serbian Transliterator prestaje da bude "program" i postaje "infrastruktura".

### 1. DUBOKA LINGVISTIČKA SOVERENOST

- **Morphological Analyzer u Rustu:** Jezgro dobija sposobnost da prepozna koren reči i njene gramatičke oblike (lematizacija).
- **Context-Aware Dialect Switching:** Rešavanje problema homonima korišćenjem statističkih modela verovatnoće.

### 2. API ZA TREĆA LICA (SDK)

- **JS/TS Wrapper:** NPM paket koji developeri mogu uvesti u svoje projekte.
- **Rust Crate:** Dostupnost jezgra na `crates.io`.

### 3. BINARNA OPTIMIZACIJA (THE 2MB LIMIT)

Uprkos dodavanju inteligencije, ciljamo:

- **Dictionary Sharding:** Dinamičko učitavanje specijalizovanih rečnika (npr. samo medicinski termini) na zahtev korisnika.
- **LTO (Link Time Optimization):** Agresivna eliminacija mrtvog koda za WASM binar.

---

**Februar 2026. Rezime:** Fokus je na **Phase 2 Hardening**. Rušimo memorijski zid i uvodimo MAX1 Guardian kao standard nepobedivosti koda.
