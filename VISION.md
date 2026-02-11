# 🚀 VISION 2026–2028: THE NEURAL FRONTIER

---

**Project:** Serbian Transliterator (Universal Engine)
**Architectural Level:** MAX Mode (v7.8)
**Operational Status:** Phase 2 — Architectural Hardening & Accessibility
**Motto:** “Absolute Privacy. Infinite Performance. Universal Reach.”

# 🌌 01 // STRATEŠKA FILOZOFIJA

---

Sistem ne gradimo kao običan dodatak, već kao suvereni sloj za procesiranje jezika baziran na 5 MAX stubova.

1. **Nulta latencija (The 16ms Rule):** 100% compute operacija (WASM/Parse) odvija se u Web Worker pool-u. Main thread je svetinja i nikada se ne blokira.
2. **Privatnost kao Ontologija (Air-gap Standard):** Nema eksternih API poziva. Sadržaj dokumenata nikada ne napušta lokalni uređaj korisnika.
3. **Inkluzivnost (A11y by Default):** 100% WCAG 2 AA compliance. Pristupačnost (kontrast, navigacija tastaturom) je ugrađena u koren svakog UI elementa.
4. **Strukturalni integritet:** Sistem vidi dokument kao OOXML strukturu, a ne kao sirovi tekst. Rezultat je savršeno očuvanje stilova i meta-podataka.
5. **Dual-UX Paradigm:** Office Add-in i Web App dele identično Rust/WASM jezgro bez dupliranja poslovne logike.

# 🗺️ 02 // TEHNIČKA MAPA PUTA

---

### FAZA 1: ZLATNI TEMELJI (Završeno) ✅

- Stabilizovan Rust Core 1.0 i kompresovani binarni rečnici.
- Lansiran Dual-UX (Word + Standalone Web). Gold Master v1.0.0.

### FAZA 2: ARHITEKTONSKO OJAČAVANJE (Trenutni sprint) 🏗️

- **Streaming Parser:** Razvoj "Quick-XML" pipeline-a za obradu fajlova >100MB bez udara na RAM.
- **Guardian 2.0:** Pipeline koji automatski blokira build na bezbednosne propuste i A11y regresije.
- **Zero-Lag Startup:** Eliminacija startup delay-a i uvođenje Promise-based Office integracije.

### FAZA 3: EKOSISTEM OMNIPRESENCE (2026 Q3–Q4)

- **Browser Extension:** Real-time transliteracija kroz MutationObserver na bilo kom sajtu.
- **Tauri Desktop Hub:** Masovna lokalna konverzija DOCX foldera (offline batch processing).
- **AppSource Submission:** Finalna sertifikacija i globalna distribucija kroz Microsoft prodavnicu.

### VISION 2027: THE SOVEREIGN LINGUISTIC CORE

- **Morphological Engine:** Napredna morfološka analiza i inteligentna lematizacija u Rustu.
- **Contextual Disambiguation:** Lokalni statistički modeli za rešavanje dvoznačnosti pisma (npr. Nj/N-j).
- **SDK for Developers:** Lansiranje `@serbian-transliterator/core` paketa za treća lica.

### VISION 2028: THE NEURAL LINGUISTIC LAYER

- **On-device AI (Quantized NER):** Neuralno prepoznavanje entiteta i brendova kroz lokalne ONNX modele (~15MB).
- **Mobile Domination:** Portovanje kompletnog motora na iOS i Android platforme.

# 🛡️ 03 // LINGVISTIČKI IMPERATIVI

---

1. **Rigidna zaštita:** ALWAYS_LATIN liste brendova i korisnički definisani zaštićeni tagovi.
2. **Sintaksna zaštita:** Automatska detekcija koda, URL-ova, Email adresa i sistemskih putanja.
3. **Heuristička zaštita:** MixedCase, CamelCase i rimski brojevi.
4. **Kontekstualna zaštita:** Pametno rešavanje ambiguous sufiksa i "All-caps" instrukcija.

# ⚙️ 04 // DEVOPS: “MAX1 GUARDIAN” STANDARD

---

Nijedna promena ne ulazi u produkciju bez prolaska kroz strogi MAX1 pipeline:

- **Security Audit:** Automatska blokada pipeline-a na high/critical vulnerabilitije.
- **A11y Guard:** Verifikacija kontrasta boja i ARIA atributa u svakom E2E testu.
- **Zero Noise:** ESLint `max-warnings 0` i potpuna eliminacija `any` tipova.

---

Dokument kreirao: Architecture Team (MAX1) | Poslednja revizija: 2026-02-11
