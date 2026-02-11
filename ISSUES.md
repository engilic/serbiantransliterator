# 🛠️ ISSUES & TECHNICAL DEBT — v1.0.1 (HARDENING)
---

**Project:** Serbian Transliterator (Hybrid: TypeScript + Rust/WASM)
**Registry Version:** 1.0.1 (REV 2026-02-11)
**Pipeline Identity:** 🛡️ MAX1 Guardian
**Focus:** Tranzicija sa funkcionalne stabilnosti na "Bulletproof" arhitekturu visokih performansi.

# 🟢 RESOLVED / REŠENO (Hardening Phase 2)
---

### 1. WCAG 2 AA Compliance (A11y Contrast)
- **Status:** ✅ REŠENO (2026-02-11)
- **Opis:** Primarne brend boje (#0078d4) nisu zadovoljavale kontrast od 4.5:1 na beloj pozadini, što je uzrokovalo padove na automatizovanim Playwright testovima.
- **Fix:** Redefinisane globalne i lokalne CSS varijable u `global.css`. Nova primarna boja je "Communication Blue" (#005a9e).
- **Dokaz:** Axe-core validacija unutar E2E pipeline-a sada vraća nula prekršaja za kontrast.

### 2. Startup Latency & Skeleton Race Condition
- **Status:** ✅ REŠENO (2026-02-11)
- **Opis:** Postojao je veštački delay od 100ms i spor proces uklanjanja "skeleton" ekrana koji je zbunjivao Playwright selektore.
- **Fix:** Uklonjeni svi fiksni tajmeri. Implementirana robusna Promise-based inicijalizacija koja reaguje na `Office.onReady`.
- **Dokaz:** Eliminisan "expect(locator).toBeHidden()" timeout u CI okruženju. Aplikacija je spremna za rad trenutno.

### 3. E2E Infrastructure & Office Stub Hardening
- **Status:** ✅ REŠENO (2026-02-11)
- **Opis:** Office.js mock nije verno simulirao async prirodu produkcionog okruženja (onReady nije vraćao Promise).
- **Fix:** Ažuriran `tests-e2e/mocks/office.js`. Playwright selektori u `web-live-toggle.spec.ts` su precizirani kako bi se izbegli "Strict mode violation" konflikti.

### 4. Verify Pipeline Optimization (Zero-Noise)
- **Status:** ✅ REŠENO (2026-02-11)
- **Opis:** Dupliranje Lint/Typecheck koraka u verify skripti i prevelika količina "buke" iz PNPM logova.
- **Fix:** Uvedena unificirana funkcija `runValidationSuite`. Sve interne pnpm komande sada koriste `--silent` zastavicu.
- **Dokaz:** Čist i pregledan terminalski izveštaj sa jasnim razmakom od 2 prazna reda nakon svakog koraka.

### 5. Security Audit Visibility
- **Status:** ✅ REŠENO (2026-02-11)
- **Opis:** `pnpm audit` je javljao propuste bez prikaza detalja, što je otežavalo brzu reakciju.
- **Fix:** `checkProjectHealth` funkcija sada koristi `runCmdCapture` i ispisuje kompletnu tabelu propusta direktno u izveštaj.

# 🔴 CRITICAL: MEMORY & PERFORMANCE (P0)
---

### 6. DOMParser Memory Wall
- **Status:** 🔴 OPEN
- **Problem:** Trenutni DOM-based XML parser gradi kompletno stablo objekata u RAM-u. Za DOCX fajlove sa XML delovima većim od 100MB, ovo može dovesti do kraha browser taba.
- **Cilj (v1.1.x):** Implementacija **Rust streaming pull-parsera** (quick-xml) unutar WASM jezgra.
- **DoD (Definition of Done):** O(1) memorijska kompleksnost u odnosu na veličinu fajla; vršna memorija ispod 50MB za bilo koji dokument.

# 🟡 HIGH PRIORITY: UX & INTEGRATION (P1)
---

### 7. WebView2 Office Theme Sync (Windows Only)
- **Status:** 🟡 OPEN
- **Problem:** Promena teme (Light/Dark) u Windowsu se nekada ne propagira automatski u Taskpane bez manuelnog reload-a.
- **Zadatak:** Implementirati polling mehanizam (2s interval) nad `Office.context.officeTheme` ili refresh pri focus događaju.

### 8. UI State Rehydration (Persistence)
- **Status:** 🟡 OPEN
- **Problem:** Zatvaranje i ponovno otvaranje Taskpane-a resetuje UI stanje (izabrani smer, statistika, podešavanja "Zaštićeno").
- **Zadatak:** Uvođenje `sessionStorage` rehidratacije za ne-tekstualne podatke.

# 🟢 MEDIUM PRIORITY: TOOLING & MAINTAINABILITY (P2)
---

### 9. I18n Dead Keys Cleanup
- **Status:** 🟢 OPEN
- **Problem:** Zastareli ključevi u `sr.ts` i `en.ts` povećavaju bundle size i otežavaju prevođenje novih funkcija.
- **Zadatak:** Razviti skriptu koja poredi upotrebu ključeva u `.ts` i `.html` fajlovima sa definicijama u rečnicima.

### 10. ESLint 10 Migration (Flat Config)
- **Status:** 🟢 OPEN
- **Problem:** Trenutna verzija 8.x je označena kao "Deprecated". Prelazak na v10 zahteva potpunu promenu formata konfiguracije.
- **Zadatak:** Planirati "Migration Day" za prelazak na `eslint.config.js` format.

# 📋 BACKLOG ZA VERZIJU 1.1.x (Summary)
---
- [ ] P0: Rust Streaming Engine (quick-xml integration)
- [ ] P1: Theme Polling / Focus refresh logic
- [ ] P1: UI State Rehydration (sessionStorage)
- [ ] P2: I18n Keys Automated Cleanup
- [ ] P2: Custom substitutions separator validation (-> vs \->)

---
**META:**
- Last Revised: 2026-02-11
- Pipeline Status: 🟢 PASSING
- Architect: Jugoslav Ilić (engilic)
