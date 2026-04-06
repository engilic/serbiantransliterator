# 🚀 VISION 2026–2028: THE NEURAL FRONTIER

**Project:** Serbian Transliterator (Universal Engine)  
**Architectural Level:** MAX Mode (v8.0)  
**Operational Status:** Phase 2 — Architectural Hardening & Accessibility (MAX1 milestone achieved)  
**Motto:** “Privacy-first. High performance. Universal reach.”

---

# 🌌 01 // STRATEŠKA FILOZOFIJA

Ne gradimo sistem kao “običan dodatak”, već kao pouzdan sloj za procesiranje jezika koji je precizan u kontekstu realnih dokumenata (OOXML), i bezbedan po podrazumevanju.

Naši MAX stubovi:

1. **Niska latencija (The 16ms Rule — target):**  
   Teške operacije (parsing/konverzija) se izvršavaju u Web Worker tokovima kad god je to moguće, sa ciljem da UI ostane responsivan. Uvedeni cache slojevi (npr. u WASM) ciljaju ubrzanje na dokumentima sa mnogo ponavljanja.

2. **Privatnost kao polazna tačka (Privacy-first):**  
   Osnovna konverzija i rečnici rade lokalno. Ne oslanjamo se na eksterni “cloud” za samu transliteraciju. Ako se uvede telemetrija, mora biti transparentna, opciona i odvojena od sadržaja dokumenta.

3. **Inkluzivnost (A11y by Default — target):**  
   Pristupačnost nije “posle”, već deo dizajna (kontrast, tastatura, semantika). Cilj je WCAG AA nivo, uz proverljive metrike (npr. kontrast) i iterativno testiranje.

4. **Strukturalni i morfološki integritet:**  
   Dokument posmatramo kao OOXML strukturu, ne kao sirovi string. MAX1 morfološka logika u engine-u prepoznaje određene granice (prefiks/koren) i smanjuje rizik pogrešnog spajanja digrafa u osetljivim slučajevima (npr. _in-jekcija_, _nad-živeti_).

5. **Dual-UX paradigm:**  
   Office Add-in i Web App dele isto Rust/WASM jezgro. Unificirani binarni pipeline i zajednički loader smanjuju rizik divergencije ponašanja između platformi.

---

# 🗺️ 02 // TEHNIČKA MAPA PUTA

### FAZA 1: ZLATNI TEMELJI (Završeno) ✅

- Stabilizovan Rust Core 1.0 i binarni rečnici.
- Lansiran Dual-UX sistem (Word Taskpane + Standalone Web/PWA).
- Izdanje v1.0.0.

### FAZA 2: ARHITEKTONSKO OJAČAVANJE (MAX1 milestone) 🏗️

- **Morphological engine (postignuto):** Detekcija određenih prefiksalnih granica radi korektnije digraf logike u konverziji.
- **Cache integracija (postignuto):** Cache na nivou reči radi ubrzanja na dokumentima sa visokim ponavljanjem (dobitak varira; meriti na realnim DOCX uzorcima).
- **Unified binary assets (postignuto):** Centralizovan loader za WASM i binarne rečnike, uz uklanjanje duplikacije koda.
- **Streaming parser (u razvoju):** Istraživanje pull/streaming pristupa za veće fajlove i stabilniju potrošnju memorije.
- **Zero-lag startup (u toku):** Uklanjanje nepotrebnih odlaganja i stabilnija inicijalizacija u Office host-u.

### FAZA 3: EKOSISTEM OMNIPRESENCE (2026 Q3–Q4) — plan

- **Browser extension:** Real-time transliteracija bez kvarenja HTML strukture (MutationObserver + zaštite).
- **Desktop hub (Tauri ili ekv.):** Lokalna batch konverzija direktorijuma (offline).
- **AppSource submission:** Priprema za korporativnu distribuciju (policy + packaging).

### VISION 2027: THE SOVEREIGN LINGUISTIC CORE — plan

- **Lemmatization (opciono / R&D):** Napredna morfološka analiza kao baza za dodatne jezičke funkcije.
- **Contextual disambiguation:** Lokalni, lagani modeli (heuristike / n-gram) za dvoznačnosti u kompleksnim slučajevima.
- **SDK for developers:** `@serbian-transliterator/core` kao stabilan API za integracije.

### VISION 2028: THE NEURAL LINGUISTIC LAYER — plan

- **On-device AI (R&D):** NER / prepoznavanje entiteta na uređaju (kvantizovani modeli, mali footprint).
- **Mobile port:** Evaluacija portovanja jezgra na iOS/Android kroz Rust wrapper-e.

---

# 🛡️ 03 // LINGVISTIČKI IMPERATIVI

1. **Rigidna zaštita:** ALWAYS_LATIN liste brendova + korisnički zaštićeni tagovi + morfološke granice gde je primenljivo.
2. **Sintaksna zaštita:** Detekcija i zaštita URL/email/URI šema (mailto, tel, sms, sip, geo, skype, teams) i srodnih entiteta.
3. **Heuristička zaštita:** MixedCase/CamelCase, verzije softvera, rimski brojevi, kontekstualne odluke.
4. **Sistemska zaštita:** “Path guard” za Windows/Unix putanje, gde je relevantno za dokumente.

---

# ⚙️ 04 // DEVOPS: “MAX1 GUARDIAN” STANDARD

Ništa ne ide dalje bez prolaska kroz automatizovane gate-ove:

- **Verify pipeline:** `pnpm run verify:all` (format, lint, typecheck, audits, Rust gates, build, manifest validate, unit, e2e).
- **Security audit:** `pnpm audit` / `cargo audit` kao signal (i gate u strict režimu).
- **Zero noise policy:** ESLint `max-warnings 0` i “clean” typecheck kao standard.
- **Rust clippy discipline:** warnings-as-errors u clippy gate-u radi stabilnog kvaliteta koda.

---

Dokument kreirao: Architecture Team (MAX1) | Poslednja revizija: 2026-02-12
