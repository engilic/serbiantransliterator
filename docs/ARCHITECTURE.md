# 🏛️ ARCHITECTURE DECISION RECORD — v1.2 (MAX1 HARDENED)

**Project:** Serbian Transliterator (Universal Engine)  
**Revision:** 2026-02-12 (MAX1 Structural + Morphological Milestone)  
**Architecture Level:** MAX Mode (v8.0)  
**Goal:** Deterministička preciznost i morfološka svest unutar OOXML-a.

---

# 🌌 01 // HYBRID ENGINE CORE (MAX1 UPGRADE)

## Context

Standardni transliteratori često greše kod složenica (npr. _in-jekcija_, _nad-živeti_) jer mehanički spajaju slova u ćirilične digrafe bez uvida u morfemske granice.

## Decision [MAX1]

Implementirali smo morfološki svesno jezgro u Rustu (WASM):

- **Prefix boundary detection:** Engine analizira određene granice morfema pre konverzije. Kada detektuje prefiksalni spoj koji bi doveo do pogrešnog digraf spajanja, radi se razdvajanje (split) umesto spajanja u digraf.
- **Word-level caching (FxHashMap):** Uveden je brži cache nivoa reči u WASM-u radi ubrzanja obrade ponovljenih tokena (dobitak zavisi od sadržaja dokumenta; cilj je ubrzanje “high repetition” dokumenata).
- **Deterministic case-awareness:** Varijacije (Title Case / ALL CAPS) za sistemske izuzetke generišu se deterministički u Rust memoriji.

## Consequences / Tradeoffs

- Morfološka logika povećava kompleksnost engine-a, ali značajno smanjuje false-positive digraf spajanja u osetljivim rečima.
- Cache uvodi mali memorijski overhead, ali ubrzava obradu ponovljenih tokena (posebno u velikim dokumentima).

---

# 🌉 02 // THE OOXML BRIDGE (CONTEXTUAL PROTECTION)

## Context

DOCX/OOXML često razbija tekst u više run-ova. Tehnički entiteti (linkovi, šeme, putanje) ne smeju biti preslovljeni, a razbijanje run-ova ne sme da pokvari detekciju entiteta.

## Decision

Proširili smo “The Bridge” logiku naprednom zaštitom i rekonstrukcijom entiteta:

1. **URI scheme guard:** Zaštita za `mailto:`, `tel:`, `sms:`, `sip:`, `geo:`, `skype:` i `teams:`.
2. **System path protection:** Automatsko prepoznavanje Windows (`C:\...`) i Unix (`/usr/bin/...`) putanja.
3. **Punctuation trimming:** Pametno odvajanje završne interpunkcije (npr. tačka na kraju rečenice se ne štiti zajedno sa URL-om).
4. **Greedy recursive stitching:** Bridge rekurzivno “povuče” susedne delove preko OOXML granica dok ne sastavi logičku celinu (URL, brand, digraf, token), pa tek onda predaje engine-u.

## Consequences / Tradeoffs

- Greedy stitching može da skenira više susednih run-ova (više posla), ali značajno popravlja tačnost na split-entitetima (čest slučaj u Word dokumentima).

---

# 📦 03 // UNIFIED ASSET PIPELINE

## Decision

Uveden je single source of truth za binarne asete:

- Rečnici i WASM moduli se učitavaju kroz `src/shared/utils/binary.ts` loader.
- Uklonjena je duplikacija koda između glavne niti i Web Workera, čime se smanjuje rizik divergencije i nepotrebne duplikacije logike.

## Consequences / Tradeoffs

- Centralizacija loadera povećava važnost jedne tačke (single point of change), ali smanjuje ukupnu složenost i duplikaciju.

---

# 🛡️ 04 // MAX1 GUARDIAN PIPELINE (STRICT MODE)

## Decision

Verifikacija je podignuta na nivo zero-tolerance kroz `pnpm run verify:all`:

- **Linting:** ESLint i Rust Clippy rade sa “warnings as errors” disciplinom u gate-ovima.
- **Type safety:** Typecheck je deo standardne verifikacije; cilj je clean build bez upozorenja.
- **Tests:** Unit + E2E provere su deo standardnog verify toka (osim u fast/ultra-fast režimima).
- **Security:** `pnpm audit` i `cargo audit` se izvršavaju u strict režimu i služe kao signal/gate.

## Consequences / Tradeoffs

- Stroži gate-ovi usporavaju iteracije, ali sprečavaju regresije i tihe kvarove u produkciji.

---

# ♿ 05 // ACCESSIBILITY BY DESIGN (AA TARGET)

## Decision

- **Contrast standard (AA target):** Primarna boja `#005a9e` je izabrana da cilja minimum 4.5:1 kontrasta za ključne interaktivne elemente (kontrast je merljiv; formalna “WCAG AA compliance” zahteva širi a11y audit).
- **Unicode normalization:** Unicode normalizacija ulaza (NFC) sprečava bagove sa “razbijenim” karakterima (ć, č, š) iz različitih izvora.

---

# 🧪 06 // TESTING & QA STRATEGY

## Decision

- **Vitest:** Brzi unit testovi.
- **Playwright:** E2E provere sa Office stub-ovima.
- **Failsafe transition:** Postoji fallback strategija ako WASM inicijalizacija predugo traje (timeout/fallback definisan u kodu), sa ciljem da korisnik dobije stabilan UX i da sistem može da nastavi rad i bez WASM-a.

## Consequences / Tradeoffs

- Fallback smanjuje rizik od hard failure starta, ali može značiti sporiji rad u fallback režimu u odnosu na WASM.

---

Dokument kreirao: Architecture Team | Poslednja revizija: 2026-02-12
