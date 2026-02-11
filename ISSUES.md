# 🛠️ ISSUES & TECHNICAL DEBT — v1.0.1 (HARDENING)

---

**Project:** Serbian Transliterator (Hybrid: TypeScript + Rust/WASM)
**Registry Version:** 1.0.1 (REV 2026-02-11)
**Pipeline Identity:** 🛡️ MAX1 Guardian
**Focus:** Tranzicija sa funkcionalne stabilnosti na "Bulletproof" arhitekturu.

# 🟢 RESOLVED / REŠENO (Hardening Phase 2)

---

### 1. WCAG 2 AA Compliance (A11y Contrast)

- **Status:** ✅ REŠENO (2026-02-11)
- **Opis:** Primarne brend boje (#0078d4) nisu zadovoljavale kontrast od 4.5:1 na beloj pozadini.
- **Fix:** Redefinisane boje u `global.css` na standardnu tamniju plavu (#005a9e).
- **Dokaz:** Axe-core validacija unutar E2E pipeline-a sada vraća nula prekršaja.

### 2. Startup Latency & Skeleton Removal

- **Status:** ✅ REŠENO (2026-02-11)
- **Fix:** Uklonjen veštački delay od 100ms. Implementirana Promise-based inicijalizacija koja reaguje na `Office.onReady`.
- **Dokaz:** Eliminisan "expect(locator).toBeHidden()" timeout u testovima.

### 3. E2E Infrastructure (Office Stub & Selectors)

- **Status:** ✅ REŠENO (2026-02-11)
- **Fix:** Ažuriran `office.js` mock da podržava `then()`. Playwright selektori u `web-live-toggle.spec.ts` su precizirani (button-focused).

### 4. Verify Pipeline Optimization (Zero-Noise)

- **Status:** ✅ REŠENO (2026-02-11)
- **Fix:** Uvedena unificirana funkcija `runValidationSuite`. Sve interne pnpm komande koriste `--silent`.
- **Dokaz:** Čist terminalski izveštaj sa tačno dva prazna reda razmaka nakon svakog koraka.

### 5. Security Audit Visibility

- **Status:** ✅ REŠENO (2026-02-11)
- **Fix:** `checkProjectHealth` sada ispisuje kompletnu tabelu propusta direktno u izveštaj.

# 🔴 CRITICAL: PERFORMANCE & MEMORY (P0)

---

### 6. Web UX "Live" Input Lag

- **Status:** 🔴 OPEN
- **Problem:** Dok je uključen Live mod u Web verziji, kucanje može biti isprekidano ili može doći do gubitka fokusa/kursora.
- **Uzrok:** Trenutna arhitektura koristi `replaceChildren` koji vrši kompletan re-render DOM stabla pri promeni stanja. Iako postoji keširanje elemenata, fizičko uklanjanje i vraćanje u DOM uzrokuje "štucanje" brauzera.
- **Zadatak (v1.1.x):** Implementirati hirurško osvežavanje (Surgical DOM Updates) ili uvesti lagani Virtual DOM mehanizam koji ne dira Input panel dok korisnik kuca.

### 7. DOMParser Memory Wall

- **Status:** 🔴 OPEN
- **Problem:** DOM-based XML parser gradi kompletno stablo u RAM-u, što kod DOCX fajlova >100MB dovodi do pucanja taba.
- **Zadatak (v1.1.x):** Prelazak na **Rust streaming pull-parser** (quick-xml) unutar WASM jezgra.

# 🟡 HIGH PRIORITY: UX & STATE (P1)

---

### 8. WebView2 Office Theme Sync (Windows)

- **Status:** 🟡 OPEN
- **Problem:** Promena teme u Windowsu se nekada ne propagira u Word bez manuelnog reload-a.

### 9. UI State Rehydration (Persistence)

- **Status:** 🟡 OPEN
- **Problem:** Zatvaranje taskpane-a resetuje UI stanje (statistika i izabrani filteri se gube).

# 📋 BACKLOG ZA VERZIJU 1.1.x (Summary)

---

- [ ] **P0:** Rust Streaming Engine (XML memory optimization).
- [ ] **P0:** Web UX Surgical Updates (Glatko kucanje bez re-rendera).
- [ ] **P1:** Theme Polling / Focus refresh.
- [ ] **P1:** UI State Rehydration (sessionStorage).
- [ ] **P2:** I18n Keys Automated Cleanup.

---

**META:** Last Revised: 2026-02-11 | Architect: Jugoslav Ilić (engilic)
