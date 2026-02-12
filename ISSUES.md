# 🛠️ ISSUES & TECHNICAL DEBT — v1.0.1 (HARDENING)

**Project:** Serbian Transliterator (Hybrid: TypeScript + Rust/WASM)  
**Registry Version:** 1.0.1 (REV 2026-02-12)  
**Pipeline Identity:** 🛡️ MAX1 Guardian  
**Focus:** Tranzicija sa funkcionalne stabilnosti na “Bulletproof” arhitekturu (bez breaking promena).

---

# 🟢 RESOLVED / REŠENO (Hardening Phase 2)

### 1. WCAG 2 AA Compliance (A11y Contrast)

- **Status:** ✅ REŠENO (2026-02-11)
- **Fix:** Redefinisane boje u `global.css` (#005a9e).
- **Dokaz:** Axe-core E2E: 0 prekršaja.

### 2. Startup Latency & Skeleton Removal

- **Status:** ✅ REŠENO (2026-02-11)
- **Fix:** Promise-based init + uklanjanje skeleton failsafe.
- **Dokaz:** Eliminisan Playwright timeout za `#skeleton`.

### 3. E2E Infrastructure (Office Stub & Selectors)

- **Status:** ✅ REŠENO (2026-02-11)
- **Fix:** Office stub podržava `then()`; selektori po button/aria.

### 4. Verify Pipeline Optimization (Zero-Noise)

- **Status:** ✅ REŠENO (2026-02-11)
- **Fix:** `runValidationSuite`, `--silent` standardizacija.

### 5. Security Audit Visibility

- **Status:** ✅ REŠENO (2026-02-11)
- **Fix:** `checkProjectHealth` ispisuje tabelu u log.

### 6. Webpack Build Failure: RealContentHashPlugin / cache corruption

- **Status:** ✅ REŠENO (2026-02-12)
- **Problem:** `RealContentHashPlugin` puca zbog nekonzistentnog filesystem cache-a (asset reference missing).
- **MAX1 Fix:** Onemogućen Webpack filesystem cache u production buildu (`cache: false` u `webpack.prod.js`) + “clean cache” procedura (`node_modules/.cache/webpack`).
- **Efekat:** determinističan build, bez “ghost chunk” referenci.

### 7. Deterministične zamene (WASM replacer) — stabilan poredak

- **Status:** ✅ REŠENO (2026-02-12)
- **Problem:** `HashMap` iteracija u `init_replacer` nije deterministična → Aho-Corasick `LeftmostFirst` može davati različite rezultate za preklapajuće `customSubstitutions`.
- **MAX1 Fix:** `customSubstitutions` sortiranje pre build-a automata (stabilan prioritet; duži patterni prvo + tie-break).
- **Efekat:** isti input + isti substitutions ⇒ isti output svuda (worker/main thread).

### 8. Tokenizer semantika za `_` (curlyProtection=none kompatibilnost)

- **Status:** ✅ REŠENO (2026-02-12)
- **Problem:** Ako `_` postane “joiner”, `{USER_NAME}` postaje jedan token i ruši očekivano ponašanje testova i brend-protect logike.
- **MAX1 Fix:** `_` i `:` nisu joineri u `src/core/tokenizer.ts` (underscore ostaje separator).
- **Efekat:** `protectBrands=true` može da zadrži `USER` latin, a `NAME` preslovi → `{USER_НАМЕ}` (kao u testovima).

### 9. Header Auto-Fix: report ordering + PowerShell syntax

- **Status:** ✅ REŠENO (2026-02-12)
- **Problem:** promena redosleda `$rows` izazvala trailing-comma parser error.
- **Fix:** uklonjen trailing `,` na poslednjem elementu + report redosled je sada “Scanned → Skipped → Fixed”.

### 10. Patch dependency hygiene (MAX1)

- **Status:** ✅ REŠENO (2026-02-12)
- **Primena:**
    - `@types/office-js 1.0.571 → 1.0.572`
    - `wait-on 9.0.3 → 9.0.4`
- **Napomena:** major upgrade-i (eslint 10, jsdom 28, copy-webpack-plugin 13…) su odloženi (nisu MAX1).

---

# 🔴 CRITICAL: PERFORMANCE & MEMORY (P0)

### 11. Web UX “Live” Input Lag

- **Status:** 🔴 OPEN
- **Uzrok:** `replaceChildren` full re-render; i uz caching, DOM churn pravi “štucanje”.
- **Zadatak (v1.1.x):** Surgical DOM Updates ili light VDOM; ne dirati input panel dok user kuca.

### 12. DOMParser Memory Wall (Large DOCX)

- **Status:** 🔴 OPEN
- **Uzrok:** DOM parser gradi kompletno XML stablo u RAM-u.
- **Zadatak (v1.1.x):** Rust streaming pull-parser (quick-xml) u WASM.

---

# 🟡 HIGH PRIORITY: UX & STATE (P1)

### 13. WebView2 Office Theme Sync (Windows)

- **Status:** 🟡 OPEN
- **Problem:** theme update ponekad ne refreshuje Word UI bez reload-a.

### 14. UI State Rehydration (Persistence)

- **Status:** 🟡 OPEN
- **Problem:** zatvaranje taskpane-a resetuje UI state (stats/filters).
- **Plan:** sessionStorage/localStorage rehydration + “restore last view”.

---

# 📋 BACKLOG ZA 1.1.x (Summary)

- [ ] P0: Rust Streaming Engine (XML memory optimization).
- [ ] P0: Web UX Surgical Updates (glatko kucanje bez full re-rendera).
- [ ] P1: Theme polling / refresh heuristics za WebView2.
- [ ] P1: UI State rehydration (sessionStorage).
- [ ] P2: Tooling modernization (ESLint 8 → 9 migration plan; major deps u posebnom PR-u).

---

**META:** Last Revised: 2026-02-12 | Architect: Jugoslav Ilić (engilic)
