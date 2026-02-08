# 📊 PROJECT STATE — v1.0.0 (HARDENING) — DEEP DIVE

**Date:** February 8, 2026  
**Version:** 1.0.0 (Production / Dev Hardening)  
**Codename:** "The Neural Frontier" (Phase 2 Active)  
**Pipeline Identity:** 🛡️ MAX1 Guardian  
**Status:** 🟢 GREEN (Passing all strict verification gates)

---

## 1. 🏗️ SYSTEM ARCHITECTURE & INTERNALS

The system operates on a **MAX Mode Hybrid Architecture** designed to balance the ubiquity of JavaScript with the raw performance of Rust.

### A. The Core Engine (Rust/WASM)

**Crate:** `serbian-transliterator-wasm`

**Zero-Lock Caching (v7.6):** We have migrated from global `Mutex` locking to `thread_local!` storage with `RefCell`. This ensures zero-cost cache lookups within the Web Worker, eliminating atomic overhead during high-throughput processing.

**Key Algorithms:**

- **FST (Finite State Transducers):** Used for O(k) dictionary lookups.
- **Zero-Copy Deserialization:** Dictionaries are memory-mapped into WASM memory from `Uint8Array` assets.
- **Aho-Corasick:** Used for the `init_replacer` logic to perform multi-pattern string replacement in a single pass.

**SIMD:** 128-bit vectorization is explicitly enabled for character scanning and pattern matching on supported CPUs.

### B. The Frontend Shell (TypeScript)

- **Framework:** Vanilla TypeScript (No Virtual DOM overhead).
- **State Management:** Custom `StateManager` (`src/taskpane/app/state.ts`) with an Observer pattern.
- **Styling:** Fluent UI Variables via CSS Modules. Theme detection is handled via CSS Custom Properties and a `data-theme` attribute on the root element.

### C. The Worker Pipeline (Supervisor Pattern)

**Architecture:** 100% of document processing is offloaded to Web Workers.

**Self-Healing (v1.0.0 Hardened):** The `WorkerClient` now implements a full **Supervisor Pattern**.

- **Automatic Restart:** If a worker crashes (e.g., WASM panic), the client automatically spawns a new instance.
- **Seamless Recovery:** In-flight jobs are transparently re-queued or processed via a main-thread fallback, ensuring no data loss.
- **Heartbeat:** 8s soft-timeout for worker initialization.

---

## 2. 🧩 MODULES & DATA FLOW

### OOXML Processing ("The Bridge")

This is the most critical logic layer (`src/shared/ooxml`), operating in multiple passes:

1. **Parsing:** Currently uses `@xmldom/xmldom` ponyfill for cross-environment compatibility between the main thread and Web Workers.

2. **Bridging (Multi-Pass):**
    - **Structural Pass:** Normalizes spaces and handles NBSP (`\u00A0`) across text nodes.
    - **Lexical Pass:** Reconstructs split links, brands, and digraphs (e.g., `L` | `j` -> `Љ`).
    - **Contextual Pass (NEW):** Handles ambiguous brand suffixes (e.g., protecting "Pro" or "Max" only when preceded by a known brand like "iPhone").

3. **Reconstruction:** Uses `XMLSerializer` to return valid, production-ready OOXML.

### Dictionary Management

- **Source:** Morphology-aware JSON files in `src/static/assets/`.
- **Compiler:** The `compiler.rs` binary builds enhanced FST images that include metadata for linguistic suffixes, allowing for smarter root-based transliteration.

---

## 3. 📈 PERFORMANCE METRICS

### Execution Speed (Reference: i7-12700H)

- **WASM Init:** ~45ms (cold), ~5ms (warm).
- **Compute Throughput:** ~18,000+ words/sec (Worker mode).
- **UI Latency:** < 16ms (maintained via Adaptive Chunking).

### Bundle Size

- **Total Gzipped:** ~1.8 MB
    - `taskpane.js`: ~150 KB
    - `wasm_bg.wasm`: ~600 KB
    - `dict_*.bin`: ~1.0 MB (Highly compressed FST)

### Memory Footprint

- **Idle:** ~20 MB
- **Active (Small Doc):** ~80 MB
- **Active (Large Doc > 100MB XML):** Spikes to **500MB+** due to `DOMParser` tree creation.
    - **Status:** Targeted for v1.1.0 via **Rust Streaming Parser**.

---

## 4. 🛡️ SECURITY & COMPLIANCE

### Content Security Policy (CSP)

- **WASM:** Uses `wasm-unsafe-eval` for module instantiation (standard for modern WASM apps).
- **Connect-Src:** Restricted to `'self'` and Microsoft endpoints.

### Input Sanitization

- **DOMPurify:** Mandatory for all clipboard and HTML rendering operations.
- **XML Safety:** The `parseSafeOoxml` function blocks XXE-like payloads (DOCTYPE/ENTITY) before they reach the parser.

### Analytics Privacy (NEW - v1.0.0)

- **Cloudflare KV Tracking:** Zero-PII analytics via Cloudflare Pages Functions
- **Data Collected:** Only aggregated event counts (visit, convert, download)
- **No Tracking:** Zero IP logging, cookies, fingerprinting, or user identification
- **Transparency:** Public analytics dashboard at `/stats` endpoint
- **Compliance:** GDPR-compliant (no personal data processing)

---

## 5. 🧪 QUALITY ASSURANCE (MAX1 GUARDIAN)

<<<<<<< HEAD
The **MAX1 Guardian** pipeline (`pnpm run verify:all`) enforces a 12-check battery on every PR:
=======
The **MAX1 Guardian** pipeline (`pnpm run verify-all`) enforces a 12-check battery on every PR:
>>>>>>> 37bec1fa24a3b586d7219740c2b690290d8b80c0

1. **File Headers:** Correct relative paths in all source files.
2. **Conflict Markers:** Zero `<<<<<<<` markers allowed.
3. **Big File Gate:** Rejects files > 5MB.
4. **I18n Integrity:** All used keys must be defined in `sr.ts` and `en.ts`.
5. **Security Sniffer:** Scans for secrets and `innerHTML` sinks.
6. **Coverage:** ~92% coverage threshold via Vitest.
7. **Rust Quality:** `cargo test`, `cargo fmt --check`, `cargo clippy`.
8. **E2E Stability:** Playwright accessibility & smoke tests.
9. **Build Integrity:** Zero webpack errors/warnings.
10. **TypeScript:** `tsc --noEmit` with strict mode.
11. **Lint:** ESLint with zero warnings policy.
12. **Audit:** `pnpm audit --audit-level=high` for npm dependencies.

_(Note: The project has fully migrated from npm to **pnpm**; all CI and local verification steps are executed via pnpm scripts.)_

_(Note: The project has fully migrated from npm to **pnpm**; all CI and local verification steps are executed via pnpm scripts.)_

---

## 6. 📦 DEPLOYMENT ARCHITECTURE

### Dual-UX Strategy (NEW - v1.0.0)

The project now supports **two independent user experiences** sharing the same engine:

#### Office Add-in (Primary)

- **Entry Points:** `taskpane.html`, `commands.html`
- **Host:** Microsoft Word (Desktop + Online)
- **Distribution:** Sideloading via `manifest.xml`
- **Features:** Full OOXML processing, real-time preview, document-level operations

#### Web App (Secondary)

- **Entry Point:** `web.html`
- **Host:** Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **Distribution:** Cloudflare Pages (`https://serbian-transliterator.pages.dev`)
- **Features:** Plain text conversion, DOCX batch processing, live preview

#### Shared Infrastructure

- **Build:** Single `pnpm run build` generates both UX bundles
- **Engine:** Identical Rust/WASM core (`src/wasm-core/`)
- **Logic:** Shared conversion logic (`src/core/`, `src/shared/`)
- **Analytics:** Unified KV tracking (`functions/track.ts`)

### Cloudflare Pages Integration

- **Hosting:** Static assets served via Cloudflare CDN
- **Functions:** Serverless analytics endpoints (`/track`, `/stats`)
- **KV Storage:** Aggregated analytics data (namespace: `ANALYTICS`)
- **Build Trigger:** Automatic deployment on `git push` to `master`
- **Preview Deploys:** Every PR gets unique preview URL

---

## 7. ⚠️ KNOWN LIMITATIONS & CONSTRAINTS

### A. Memory Wall (Current Milestone)

- **Impact:** Extremely large documents (>200 pages) can crash the browser tab due to `DOMParser` overhead.
- **Mitigation:** Adaptive Chunking slices processing into batches.
- **Target:** v1.1.0 will introduce a Rust-based streaming pull-parser (`quick-xml`).

### B. WebView2 / Office Theme Sync

- **Impact:** Theme changes (Dark/Light) may not trigger CSS updates in real-time on some Windows builds.
- **Workaround:** Implemented polling for `Office.context.officeTheme` and refresh on `window.focus`.

### C. Analytics Limitations

- **KV Write Limits:** Cloudflare Free tier allows 1,000 writes/day (sufficient for MVP)
- **No Real-time Updates:** Dashboard refreshes on page load (no WebSocket live feed)
- **Data Retention:** KV entries stored indefinitely (manual cleanup required)

---

## 8. 📊 DEPENDENCY SNAPSHOT

**Runtime:**

<<<<<<< HEAD
- **Node.js:** 22.x (LTS via Volta)
- **Rust:** 1.75+ (Stable)
- **TypeScript:** 5.4+
- **Package Manager:** pnpm 9.x (workspace-aware, replaces npm across the toolchain)
=======
- Node.js: 22.x (LTS via Volta)
- Rust: 1.75+ (Stable)
- TypeScript: 5.4+
- **Package Manager:** pnpm (workspace-aware, replaces npm across the toolchain)
>>>>>>> 37bec1fa24a3b586d7219740c2b690290d8b80c0

**Key Runtime Libs:**

- `fst`: 0.4 (Finite State Transducers)
- `aho-corasick`: 1.1 (Pattern matching)
- `@xmldom/xmldom`: 0.8+ (Worker XML support)
- `jszip`: 3.10 (DOCX batch mode)
- `dompurify`: 3.3+ (XSS sanitization)
- `idb`: 8.0+ (IndexedDB wrapper for telemetry)

**Build-time:**

- `webpack`: 5.91+
- `babel`: 7.29+
- `wasm-pack`: Latest
- `vitest`: 4.0+ (test runner)
- `playwright`: 1.58+ (E2E testing)

**Cloudflare:**

- **Pages Functions:** Runtime environment (no explicit dependency)
- **KV:** Storage binding (configured in `wrangler.toml`)
- **Wrangler CLI:** 4.x (deployment tool)

---

## 9. 🚀 ROADMAP HIGHLIGHTS

### v1.1.0 (Q2 2026) — "Performance Unlocked"

- [ ] Rust Streaming XML Parser (eliminates memory spikes)
- [ ] WASM Binary Signing (supply chain security)
- [ ] Advanced Analytics (conversion success rate, error tracking)
- [ ] Progressive Web App (PWA) manifest for Web app

### v1.2.0 (Q3 2026) — "Enterprise Ready"

- [ ] AppSource Submission (Microsoft Office Store)
- [ ] Multi-language UI (Croatian, Bosnian)
- [ ] Batch API (process multiple documents via single call)
- [ ] Custom Dictionary Upload (user-defined word lists)

### v2.0.0 (Q4 2026) — "AI-Assisted"

- [ ] LLM-powered context disambiguation
- [ ] Smart quote correction (using sentence structure)
- [ ] Neural suffix prediction (morphology-aware)
- [ ] Cloud sync for settings (encrypted, optional)

---

## 10. 📞 CONTACT & CONTRIBUTION

- **Maintainer:** Serbian Transliterator Team
- **Email:** iddj27510@gmail.com
- **Repository:** [GitHub](https://github.com/your-org/serbian-transliterator)
- **Security:** See [SECURITY.md](./SECURITY.md)
- **Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Workflow:** See [WORKFLOW.md](./WORKFLOW.md)
- **Releasing:** See [RELEASING.md](./RELEASING.md)

---

**Last Updated:** February 8, 2026  
**Next Review:** After v1.1.0 release (target: Q2 2026)

---

© 2026 Serbian Transliterator Project. Licensed under MIT.
