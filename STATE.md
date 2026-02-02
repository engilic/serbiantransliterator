# 📊 PROJECT STATE — v1.0.0 (GOLD MASTER) — DEEP DIVE

**Date:** February 2, 2026
**Version:** 1.0.0 (Stable / Production)
**Codename:** "The Neural Frontier" (Phase 1 Complete)
**Deployment Target:** Cloudflare Pages (Static Hosting) + Microsoft AppSource
**Status:** 🟢 GREEN (Passing all Guardian checks)

---

## 1. 🏗️ SYSTEM ARCHITECTURE & INTERNALS

The system operates on a **Hybrid Architecture** designed to balance the ubiquity of JavaScript with the raw performance of Rust.

### A. The Core Engine (Rust/WASM)

- **Crate:** `serbian-transliterator-wasm`
- **Compilation Target:** `wasm32-unknown-unknown`
- **Key Algorithms:**
    - **FST (Finite State Transducers):** Used for dictionary lookups. We use the `fst` crate to map keys (words) to values (replacements) with O(k) lookup time complexity (where k is key length), regardless of dictionary size.
    - **Zero-Copy Deserialization:** Dictionaries are baked into the binary bundle as `Uint8Array` assets and passed to WASM memory without copying, using memory mapping techniques.
    - **Aho-Corasick:** Used for `init_replacer` logic to perform multi-pattern string replacement in a single pass (O(n)).
- **Optimization:**
    - **Thread-Local Storage:** We utilize `thread_local!` for caching active dictionaries, bypassing the overhead of `Mutex` locking in the single-threaded Web Worker environment.
    - **SIMD:** Explicitly enabled 128-bit vectorization for string scanning where supported by the browser.

### B. The Frontend Shell (TypeScript)

- **Framework:** **Vanilla TypeScript** (No React, Vue, or Angular).
    - _Rationale:_ Reduces bundle size by ~150KB and eliminates Virtual DOM overhead for what is essentially a static UI with minimal reactivity.
- **State Management:** Custom `StateManager` (`src/taskpane/app/state.ts`) implementing a lightweight Observer pattern.
- **Styling:** Fluent UI Variables via CSS Modules. Dark mode is handled via CSS Custom Properties (`--colorNeutralBackground1`) and a generic `data-theme` attribute on the root element.

### C. The Worker Pipeline (Orchestration)

- **Architecture:** The UI thread never touches document processing. All heavy lifting is offloaded to a dedicated Web Worker.
- **Communication:**
    - Main Thread sends: `XML String` + `Configuration Object`.
    - Worker returns: `Processed XML String` + `Statistics Object`.
- **Resilience:** The `WorkerClient` class wraps the raw Worker API, providing:
    - Promise-based request/response mapping (using UUIDs for job correlation).
    - Timeout handling (60s soft limit).
    - _Current Gap:_ No automatic restart on crash (Target for v1.1.0).

---

## 2. 🧩 MODULES & DATA FLOW

### OOXML Processing ("The Bridge")

This is the most critical logic layer (`src/shared/ooxml`).

1.  **Parsing:** Currently uses browser-native `DOMParser` to convert XML strings into DOM nodes.
2.  **Bridging:** The system detects words split across multiple `<w:t>` nodes (common in Word for styling or spellcheck markers).
    - _Algorithm:_ Look-ahead strategy. If a run ends with part of a protected token (e.g., "Micro"), it scans subsequent nodes to find the suffix ("soft") and merges them before processing.
3.  **Reconstruction:** Uses `XMLSerializer` to return valid OOXML.

### Dictionary Management

- **Source:** JSON files in `src/static/assets/`.
- **Build Process:** `npm run compile:dicts` invokes a custom Rust binary (`src/wasm-core/src/bin/compiler.rs`) that:
    1.  Reads JSON.
    2.  Sorts keys (required for FST).
    3.  Builds the FST binary image.
    4.  Compresses metadata.
    5.  Outputs `.bin` files directly to `assets/`.

---

## 3. 📈 PERFORMANCE METRICS (Benchmarks)

### Execution Speed (Reference Hardware: i7-12700H)

- **WASM Initialization:** ~45ms (Cold start), ~5ms (Warm start/Cached).
- **Throughput (Main Thread):** ~5,000 words/sec (blocked by UI rendering).
- **Throughput (Worker):** ~15,000+ words/sec (pure compute).
- **Processing Latency (100 page doc):** ~2.5 seconds.

### Bundle Size (Production Release)

- **Total Gzipped:** ~1.8 MB
    - `taskpane.js`: ~150 KB (Logic + UI)
    - `wasm_bg.wasm`: ~600 KB (Rust Logic)
    - `dict_*.bin`: ~1.0 MB (Compressed Dictionaries)
- **Optimization:** Webpack splits chunks for lazy loading. Dictionaries are only loaded on demand when the engine initializes.

### Memory Footprint

- **Idle:** ~20 MB
- **Active (Small Doc):** ~80 MB
- **Active (Large Doc > 50MB XML):** **Spikes to 500MB+** due to `DOMParser`.
    - _Status:_ This is the primary bottleneck targeted for v1.1.0 (Streaming Parser).

---

## 4. 🛡️ SECURITY & COMPLIANCE

### Content Security Policy (CSP)

- **Script-Src:** `'self' https://appsforoffice.microsoft.com`.
- **Connect-Src:** `'self'` (No external API calls).
- **Eval:** Strictly forbidden (except in Webpack Dev Server).

### Privacy Guarantees

- **Offline Enforcement:** The app functions 100% without a network connection after initial load.
- **Telemetry:** Local-only logging via `IndexedDB`. No Google Analytics or Sentry. Logs can only be exported manually by the user for debugging.

### Input Sanitization

- **DOMPurify:** Used for all clipboard operations (`paste` events in Web Mode) to prevent XSS.
- **XML Safety:** The `parseSafeOoxml` function strictly checks for XXE (XML External Entity) attacks before parsing document XML.

---

## 5. 🧪 QUALITY ASSURANCE (QA)

### Testing Pyramid

- **Unit Tests (Vitest):** ~92% Coverage on Core Logic (`src/core`, `src/shared`).
    - _Focus:_ Regex patterns, Tokenizer, OOXML Bridging logic.
- **Integration Tests (Rust):** Coverage of FST lookups and basic conversion functions.
- **E2E Tests (Playwright):**
    - Uses a "Mock Office" stub to simulate Word API responses.
    - Tests UI flows: Settings change, Profile switching, Modal interactions.
- **A11y Tests (Axe-core):**
    - Running automated accessibility scans on every build.
    - **Status:** WCAG 2.1 AA Compliant (Contrast ratio > 4.5:1, Aria labels present).

### The "Guardian" Pipeline

A node script (`scripts/verify-all.js`) that enforces:

1.  **File Headers:** All files must have identity headers.
2.  **No `console.log`:** Production builds fail if debug logs remain.
3.  **Strict Types:** No `any` allowed in new code.
4.  **Lockfile Integrity:** `package-lock.json` must match `package.json`.

---

## 6. ⚠️ KNOWN LIMITATIONS & CONSTRAINTS

### A. Memory Wall (The DOMParser Issue)

- **Impact:** Documents larger than 200 pages (with complex styling) generate massive XML strings.
- **Mechanism:** `DOMParser` creates a full tree object in memory. V8 Garbage Collection struggles to reclaim this quickly during recursive processing.
- **Mitigation:** We currently use "Adaptive Chunking" to process the document in slices of 50 paragraphs, yielding control to the UI loop to allow GC to run.

### B. WebView2 / Office Theme Sync

- **Impact:** On Windows, changing the Office theme (Dark/Light) while the Add-in is open does not trigger a CSS update immediately.
- **Cause:** Limitation in the `Office.context.officeTheme` event listener in older WebView2 runtimes.
- **Workaround:** User must reload the Add-in or rely on the "Auto" detection on startup.

---

## 7. 📦 DEPENDENCY SNAPSHOT

**Core:**

- `rust`: 1.75+ (Stable)
- `node`: 20.11+ (LTS)
- `typescript`: 5.4+

**Key Libraries:**

- `fst` (Rust): 0.4
- `aho-corasick` (Rust): 1.1
- `jszip` (JS): 3.10
- `idb` (JS): 8.0 (IndexedDB Wrapper)
