# 🛡️ Serbian Transliterator (v1.0.0)

---

**Status:** 🟢 Phase 2 — Hardening (Pipeline: MAX1 Guardian)  
**Codename:** “The Neural Frontier”  
**Motto:** “Absolute Privacy. Infinite Performance. Universal Reach.”

Najbrži i najsigurniji sistem za preslovljavanje ćirilice i latinice u Microsoft Word-u i na webu. Pokretan ekstremno brzim Rust jezgrom preko WebAssembly (WASM) tehnologije, ovaj alat je izgrađen da izdrži najzahtevnije profesionalne zadatke uz nultu toleranciju na greške.

# 🚀 01 // KLJUČNE KARAKTERISTIKE

---

Sistem je dizajniran prema MAX Mode standardu koji garantuje nultu latenciju i maksimalnu zaštitu podataka.

- **100% Privatno (Air-Gap Standard):** Tekst se obrađuje isključivo u lokalnoj memoriji vašeg uređaja. Sadržaj vaših dokumenata nikada ne napušta Word host ili browser.
- **Hybrid Core Engine (Rust + WASM):** Kombinuje bezbednost i performanse Rust jezika sa univerzalnom dostupnošću WebAssembly-ja.
- **OOXML-Safe Bridge:** Pametni sloj koji rekonstruiše tokene razbijene stilovima (npr. **i**Phone), vrši konverziju i vraća ih u originalne XML pozicije bez gubitka formatiranja (bold, italic, font).
- **Inkluzivni UI (WCAG 2 AA):** Interfejs je u potpunosti prilagođen osobama sa slabijim vidom, sa optimizovanim kontrastom (standard #005a9e) i punom ARIA podrškom.
- **Samoisceljujući Workeri:** Pozadinska obrada je izolovana u nitima koji se automatski restartuju u slučaju nepredviđenih grešaka (Supervisor pattern).

# 🛡️ 02 // INTELIGENTNA ZAŠTITA (PROTECTION LAYER)

---

Transliterator ne menja samo slova; on razume strukturu i namenu teksta kroz četiri nivoa zaštite:

- **Brand Guard:** Automatska detekcija i zaštita za preko 5.000 globalnih brendova (Windows, Microsoft, iPhone, Samsung...).
- **Context-Aware Suffixes:** Pametno razlikuje brend od obične reči u kontekstu (npr. “iPhone Pro” se štiti, dok se obični nastavci preslovljavaju).
- **Code & Path Integrity:** Ne dira tekst unutar programerskih blokova (backticks), URL-ove, email adrese, kao i Windows/Unix putanje (C:\..., /usr/bin/...).
- **Roman Numerals:** Opciona zaštita rimskih brojeva kako bi se očuvao integritet istorijskih datuma i nabrajanja u dokumentima.

# 🌍 03 // MULTI-PLATFORM REACH

---

Aplikacija radi sinhronizovano na dva nivoa, deleći identično Rust "mozak":

### Microsoft Word (Add-in)

Duboka integracija za profesionalni tok rada. Podržava preslovljavanje selekcije, celog dokumenta, fusnota, zaglavlja i podnožja.

- **Status:** Spremno za Sideload i AppSource.

### Web App (PWA)

Samostalni procesor u browseru koji omogućava brz rad bez instalacije Word-a.

- **DOCX Batch Mode:** Prevuci desetine dokumenata odjednom i preslovi ih lokalno za nekoliko sekundi.
- **Offline-First:** Instaliraj aplikaciju kao PWA za rad bez internet konekcije.
- **URL:** https://serbiantransliterator.pages.dev

# 🛠️ 04 // RAZVOJ I KVALITET (ZA DEVELOPERE)

---

Projekat koristi MAX1 Guardian pipeline koji garantuje integritet svakog commit-a.

**Okruženje:**

- Runtime: Node.js 22.x (Volta pinned)
- Core: Rust (Stable) + wasm-pack
- Package Manager: pnpm 9.x

**Početak rada:**

1. Instalacija: pnpm install
2. Izgradnja jezgra: pnpm run build:wasm
3. Start dev servera: pnpm start

**Verifikacija (The Guardian):**
Pre svakog slanja koda, obavezno pokreni punu proveru koja uključuje Security Audit, Rust testove i E2E provere:
PS> pnpm run verify:all

# ⚖️ 05 // NAPOMENA O BETA FUNKCIJAMA

---

Opcija “Ekavica ↔ Ijekavica” koristi napredne morfološke rečnike i smatra se beta funkcionalnošću. Preciznost zavisi od kompleksnosti teksta i može zahtevati manuelnu proveru u specifičnim lingvističkim kontekstima.

---

© 2026 Serbian Transliterator Project. Built with ❤️ in Rust & TypeScript.  
**Author:** Jugoslav Ilić (engilic) | Licensed under MIT.
