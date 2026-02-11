# 🏛️ ARCHITECTURE DECISION RECORD — v1.1 (HARDENED)

---

**Project:** Serbian Transliterator (Universal Engine)
**Revision:** 2026-02-11 (Phase 2 Hardening Milestone)
**Architecture Level:** MAX Mode (v7.8)
**Goal:** Deterministička preciznost i maksimalna zaštita podataka.

# 🌌 01 // HYBRID ENGINE CORE (TS + RUST/WASM)

---

**Context:**
Sistem mora da radi u resursno ograničenim okruženjima (Word Taskpane) uz zadržavanje performansi nativnih aplikacija.

**Decision:**
Koristimo hibridni model visokih performansi:

- **TypeScript Shell:** Upravlja stanjem, Office.js sinhronizacijom, navigacijom tastaturom (Command Palette) i UI temama.
- **Rust/WASM Core:** Sva procesorska snaga (transliteracija, XML parsing, regex motori) je u Rustu.
- **Worker-First Threading:** Main thread se koristi isključivo za UI. Svaka konverzija se šalje u Web Worker pool.

**Hardening Note:** Inicijalizacija je optimizovana na 0ms kašnjenja. Koristimo Promise-based signale za `onReady` umesto fiksnih tajmera.

# 🌉 02 // THE OOXML BRIDGE (INTENT PRESERVATION)

---

**Context:**
OOXML format često fragmentira logičke celine (reči) u više fizičkih čvorova (`w:r/w:t`) zbog provere pravopisa ili sitnih promena stilova.

**Decision:**
Implementiran je atomični most (Bridge) koji:

1. Privremeno rekonstruiše logičke tokene iz razbijenih XML run-ova.
2. Vrši lingvističku obradu i zaštitu brendova nad celim rečima.
3. Vraća tekst u originalnu XML strukturu, čuvajući svaku granicu boldovanja ili promene fonta.

**Status:** Trenutno DOM-based. Prelazak na streaming parser je prioritet za v1.1.0.

# 🛡️ 03 // MAX1 GUARDIAN PIPELINE

---

**Context:**
Greške u transliteraciji mogu biti kritične za profesionalne dokumente. Verifikacija mora biti stroga i neizbežna.

**Decision:**
`scripts/verify-all.js` je unificirani Gatekeeper koji:

- Blokira build na bilo koji ESLint warning (`max-warnings 0`).
- Zahteva nulu bezbednosnih propusta u `pnpm audit` izveštaju.
- Automatski proverava inkluzivnost UI-a kroz Axe-core Accessibility testove.
- Omogućava `--smart` mod za developere koji ubrzava rad bez ugrožavanja integriteta master grane.

# ♿ 04 // ACCESSIBILITY BY DESIGN (WCAG 2 AA)

---

**Context:**
Korisnici sa slabijim vidom moraju imati podjednako efikasan pristup alatu.

**Decision:**

- **Contrast Standard:** Svi interaktivni elementi moraju imati odnos kontrasta od minimalno 4.5:1.
- **Standard Color:** Primarna boja sistema je `#005a9e`.
- **Navigation:** Svaka akcija mora biti dostupna preko tastature (Shortcut-ovi i Alt+L logika).

# 🧪 05 // TESTING & QA STRATEGY

---

**Decision:**

- **Vitest:** Za brze unit testove lingvističke jezgre i TS logike u JSDOM okruženju.
- **Playwright:** Za E2E provere. Koristimo napredni Office stub koji verno simulira Word API kroz Promise interfejs.
- **Silent Ops Policy:** PNPM i test logovi su utišani (`--silent`) radi eliminacije buke i lakšeg uočavanja stvarnih problema u pipeline-u.

# 📦 06 // VERSIONING & CACHE SAFETY

---

**Decision:**

- **Dual Versioning:** Koristimo SemVer za logiku i 4-part verziju za manifest (npr. 1.0.0.15).
- **Cache Invalidation:** Svaki produkcioni release OBAVEZNO bumpuje poslednju cifru manifest verzije kako bi Word host prisilno osvežio keširane fajlove.

---

Dokument kreirao: Architecture Team | Poslednja revizija: 2026-02-11
