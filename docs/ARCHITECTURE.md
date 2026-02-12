# 🏛️ ARCHITECTURE DECISION RECORD — v1.2 (MORPHOLOGICAL MAX1)

---

**Project:** Serbian Transliterator (Universal Engine)
**Revision:** 2026-02-12 (MAX1 Morphological Milestone)
**Architecture Level:** MAX Mode (v8.0)
**Goal:** Lingvistička morfološka svest i nulta latencija obrade.

# 🌌 01 // HYBRID ENGINE CORE (MAX1 UPGRADE)

---

**Context:**
Standardni transliteratori često greše kod složenica (npr. *in-jekcija*, *nad-živeti*) jer mehanički spajaju slova u ćirilične digrafe (њ, џ).

**Decision [MAX1]:**
Implementirali smo **Morfološki svesno jezgro** u Rustu:
- **Prefix Boundary Detection:** Engine analizira granice morfema pre konverzije. Ako detektuje prefiks koji se završava na 'n' ili 'd' ispred korena koji počinje sa 'j' ili 'ž', vrši se razdvajanje (split) umesto spajanja u digraf.
- **Thread-Local caching (FxHashMap):** Uveden je ultra-brzi keš nivoa reči unutar WASM-a. Koristi se `FxHashMap` koji eliminiše hashing overhead, omogućavajući brzinu obrade od 25k+ reči/sekundi.
- **Deterministic Case-Awareness:** Automatsko generisanje Title Case i ALL CAPS varijacija za sistemske izuzetke direktno u Rust memoriji.

# 🌉 02 // THE OOXML BRIDGE (CONTEXTUAL PROTECTION)

---

**Context:**
DOCX dokumenti sadrže tehničke podatke (linkove, putanje) koji ne smeju biti preslovljeni.

**Decision:**
Proširili smo "The Bridge" logiku naprednom zaštitom:
1. **URI Scheme Guard:** Integrisana zaštita za `mailto:`, `tel:`, `sms:`, `sip:`, `geo:`, `skype:` i `teams:` protokole.
2. **System Path Protection:** Automatsko prepoznavanje Windows (`C:\...`) i Unix (`/usr/bin/...`) putanja.
3. **Punctuation Trimming:** Pametno odvajanje interpunkcije na kraju linkova (npr. tačka na kraju rečenice se ne štiti zajedno sa URL-om).

# 📦 03 // UNIFIED ASSET PIPELINE

---

**Decision:**
Uveden je **Single Source of Truth** za binarne asete:
- Svi rečnici i WASM moduli se učitavaju kroz unificirani `src/shared/utils/binary.ts` loader.
- Eliminisan je duplikat koda između glavne niti i Web Workera, čime je smanjen "memory footprint" i eliminisana mogućnost nesinhronizovanih verzija rečnika.

# 🛡️ 04 // MAX1 GUARDIAN PIPELINE (STRICT MODE)

---

**Decision:**
Verifikacija je podignuta na nivo **Zero-Tolerance**:
- **Linting:** ESLint i Rust Clippy moraju vratiti 0 upozorenja (Warnings as Errors).
- **Type Safety:** Potpuna eliminacija `any` tipa u jezgru sistema. Obavezna primena `ArrayBuffer` casting-a za WASM module radi kompatibilnosti sa modernim browser sigurnosnim polisama.
- **Morphological Tests:** Uvedena specifična test-suita koja proverava kritične lingvističke prelaze (npr. hemijski termini, složenice sa prefiksima).

# ♿ 05 // ACCESSIBILITY BY DESIGN (WCAG 2 AA)

---

**Decision:**
- **Contrast Standard:** Svi interaktivni elementi imaju odnos kontrasta od minimalno 4.5:1 (Primarna boja: `#005a9e`).
- **NFC Normalization:** Obavezna Unicode normalizacija na ulazu sprečava bagove sa "razbijenim" karakterima (ć, č, š) koji često dolaze iz spoljnih izvora.

# 🧪 06 // TESTING & QA STRATEGY

---

**Decision:**
- **Vitest:** Brzi unit testovi.
- **Playwright:** E2E provere sa Office stub-ovima.
- **Failsafe Transition:** Automatski prelazak na JS-only engine ako WASM inicijalizacija (heartbeat) traje duže od 8 sekundi, obezbeđujući neprekidan rad korisniku.

---

Dokument kreirao: Architecture Team | Poslednja revizija: 2026-02-12
