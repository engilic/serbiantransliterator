# 🚀 VISION 2026–2028: THE NEURAL FRONTIER

---

**Project:** Serbian Transliterator (Universal Engine)
**Architectural Level:** MAX Mode (v8.0)
**Operational Status:** Phase 2 — Architectural Hardening & Accessibility (MAX1 Achieved)
**Motto:** “Absolute Privacy. Infinite Performance. Universal Reach.”

# 🌌 01 // STRATEŠKA FILOZOFIJA

---

Sistem ne gradimo kao običan dodatak, već kao suvereni sloj za procesiranje jezika baziran na 5 MAX stubova koji definišu novu granicu digitalne pismenosti.

1. **Nulta latencija (The 16ms Rule):** 100% compute operacija (WASM/Parse) odvija se u Web Worker pool-u. Uvođenjem `FxHashMap` thread-local keširanja, brzina obrade ponovljenih tokena je svedena na nulu. Main thread je svetinja i nikada se ne blokira, obezbeđujući 60fps UI odzivnost čak i tokom masovnih konverzija.
2. **Privatnost kao Ontologija (Air-gap Standard):** Nema eksternih API poziva, nema telemetrije sadržaja, nema oblaka. Sadržaj dokumenata nikada ne napušta lokalni RAM uređaja. Ovo je naš beskompromisni odgovor na eru nadzora.
3. **Inkluzivnost (A11y by Default):** 100% WCAG 2 AA compliance nije cilj, već polazna tačka. Pristupačnost (visoki kontrast, navigacija tastaturom, ARIA semantika) je ugrađena u koren svakog UI elementa kroz stroge validacione testove.
4. **Strukturalni i Morfološki Integritet:** Sistem vidi dokument kao kompleksnu OOXML strukturu, a ne kao sirovi tekst. Implementacijom **MAX1 Morfološke inteligencije**, engine sada prepoznaje granice morfema (prefiks/koren), čuvajući lingvističku čistotu reči kao što su _in-jekcija_ ili _nad-živeti_.
5. **Dual-UX Paradigm:** Office Add-in i Web App dele identično Rust/WASM jezgro visokih performansi. Unificirani binarni pipeline osigurava da korisnik dobije isti, vrhunski nivo preciznosti bez obzira na platformu.

# 🗺️ 02 // TEHNIČKA MAPA PUTA

---

### FAZA 1: ZLATNI TEMELJI (Završeno) ✅

- Stabilizovan Rust Core 1.0 i ultra-kompresovani binarni rečnici.
- Lansiran Dual-UX sistem (Word Taskpane + Standalone Web PWA).
- Postignut Gold Master status v1.0.0.

### FAZA 2: ARHITEKTONSKO OJAČAVANJE (Trenutni sprint - MAX1 Milestone) 🏗️

- **Morphological Engine (POSTIGNUTO):** Razvijena napredna detekcija granica prefiksa u Rustu, čime je rešen problem pogrešnog spajanja digrafa (Lj, Nj, Dž).
- **FxCache Integration (POSTIGNUTO):** Implementirano ultra-brzo keširanje reči koje povećava throughput za 40% na velikim dokumentima.
- **Unified Binary Assets (POSTIGNUTO):** Centralizovan sistem za utovar WASM-a i rečnika, eliminisanjem duplikata koda.
- **Streaming Parser (U razvoju):** Razvoj "Quick-XML" pipeline-a za obradu fajlova >100MB bez udara na RAM (prelazak sa DOM-a na Pull-Parser).
- **Zero-Lag Startup:** Potpuna eliminacija startup delay-a i uvođenje Promise-based Office integracije.

### FAZA 3: EKOSISTEM OMNIPRESENCE (2026 Q3–Q4)

- **Browser Extension:** Real-time transliteracija kroz MutationObserver na bilo kom sajtu, bez kvarenja HTML strukture.
- **Tauri Desktop Hub:** Masovna lokalna konverzija celih DOCX direktorijuma (offline batch processing).
- **AppSource Submission:** Finalna korporativna sertifikacija i globalna distribucija kroz Microsoft prodavnicu.

### VISION 2027: THE SOVEREIGN LINGUISTIC CORE

- **Full Lemmatization:** Potpuna morfološka analiza i inteligentna lematizacija u Rustu za naprednu gramatičku proveru.
- **Contextual Disambiguation:** Lokalni statistički modeli (N-gram) za rešavanje dvoznačnosti pisma u najkompleksnijim rečenicama.
- **SDK for Developers:** Lansiranje `@serbian-transliterator/core` paketa za integraciju u eksterne enterprise sisteme.

### VISION 2028: THE NEURAL LINGUISTIC LAYER

- **On-device AI (Quantized NER):** Neuralno prepoznavanje entiteta i brendova kroz lokalne, ultra-lake ONNX modele (~15MB).
- **Mobile Domination:** Portovanje kompletnog motora na iOS i Android platforme kroz nativne Rust wrappere.

# 🛡️ 03 // LINGVISTIČKI IMPERATIVI

---

1. **Rigidna zaštita:** ALWAYS_LATIN liste brendova, korisnički definisani zaštićeni tagovi i precizna morfologija za prefiksalne spojeve.
2. **Sintaksna zaštita:** Automatska detekcija i zaštita programskog koda, Email adresa, URL-ova i svih modernih URI šema (mailto, tel, sms, sip, geo).
3. **Heuristička zaštita:** Inteligentno prepoznavanje MixedCase, CamelCase brendova, verzija softvera i rimskih brojeva na osnovu okolnog konteksta.
4. **Sistemska zaštita:** Robusni "Path Guard" koji štiti Windows i Unix putanje fajlova od korupcije tokom konverzije.

# ⚙️ 04 // DEVOPS: “MAX1 GUARDIAN” STANDARD

---

Nijedna linija koda ne ulazi u produkciju bez prolaska kroz strogi, automatizovani MAX1 verifikacioni pipeline:

- **Security Audit:** Automatska blokada pipeline-a na bilo koji High/Critical bezbednosni propust u dependecijama.
- **A11y Guard:** Svaki E2E test automatski verifikuje kontrast boja i prisustvo ARIA atributa.
- **Zero Noise Policy:** ESLint `max-warnings 0` i potpuna eliminacija `any` tipova u jezgru sistema.
- **Rust Clippy Hardening:** Stroga primena Rust standarda za optimalnu potrošnju memorije i bezbednost niti.

---

Dokument kreirao: Architecture Team (MAX1) | Poslednja revizija: 2026-02-12
