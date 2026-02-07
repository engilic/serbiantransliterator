# 📊 PROJECT STATE — v1.0.0 (HARDENING) — DEEP DIVE

**Date:** February 7, 2026  
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

---

## 5. 🧪 QUALITY ASSURANCE (MAX1 GUARDIAN)

The **MAX1 Guardian** pipeline (`scripts/verify-all.js`) enforces a 12-check battery on every PR:

1. **File Headers:** Correct relative paths in all source files.
2. **Conflict Markers:** Zero `<<<<<<<` markers allowed.
3. **Big File Gate:** Rejects files > 5MB.
4. **I18n Integrity:** All used keys must be defined in `sr.ts`.
5. **Security Sniffer:** Scans for secrets and `innerHTML` sinks.
6. **Coverage:** ~92% coverage threshold via Vitest.

---

## 6. ⚠️ KNOWN LIMITATIONS & CONSTRAINTS

### A. Memory Wall (Current Milestone)

- **Impact:** Extremely large documents (>200 pages) can crash the browser tab due to `DOMParser` overhead.
- **Mitigation:** Adaptive Chunking slices processing into batches.
- **Target:** v1.1.0 will introduce a Rust-based streaming pull-parser (`quick-xml`).

### B. WebView2 / Office Theme Sync

- **Impact:** Theme changes (Dark/Light) may not trigger CSS updates in real-time on some Windows builds.
- **Workaround:** Implemented polling for `Office.context.officeTheme` and refresh on `window.focus`.

---

## 7. 📦 DEPENDENCY SNAPSHOT

**Runtime:**

- Node.js: 22.x (LTS via Volta)
- Rust: 1.75+ (Stable)
- TypeScript: 5.4+

**Key Libs:**

- `fst`: 0.4 (Finite State Transducers)
- `aho-corasick`: 1.1 (Pattern matching)
- `@xmldom/xmldom`: 0.8+ (Worker XML support)
- `jszip`: 3.10 (DOCX batch mode)
