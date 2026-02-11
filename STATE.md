# 📊 PROJECT STATE — v1.0.0 (HARDENING) — DEEP DIVE (REV 2026-02-10)

Date: February 10, 2026
Version: 1.0.0 (Production / Dev Hardening)
Codename: “The Neural Frontier” (Phase 2 Active)
Pipeline Identity: 🛡️ MAX1 Guardian
Status: 🟢 GREEN (Strict gates passing locally)

============================================================

1. # 🏗️ SYSTEM ARCHITECTURE & INTERNALS

The system runs on a MAX Mode Hybrid Architecture that combines:

- TypeScript shells (Office Add-in + Web App)
- Rust/WASM compute core
- Worker-first processing to keep UI responsive

---

## A) The Core Engine (Rust/WASM)

Crate / package:

- Rust WASM core lives under src/wasm-core (wasm-pack build --target web)
- JS/TS loads generated pkg artifacts for the engine

Performance posture (current philosophy):

- Compute stays off the UI thread (workers)
- Engine stays deterministic and offline-first

Cache model:

- “Per-worker” isolation is the default mental model: each worker has its own WASM instance + memory.
- Cache should be local to that instance to avoid contention and cross-job leakage.

Algorithms in current design (as implemented or planned in-core):

- Dictionary-based lookup strategy (FST-style goal: O(k) query)
- Multi-pattern replacement pipeline (Aho-Corasick-style goal: single pass)
- SIMD scanning (goal: faster character classification on supported CPUs)

NOTE:

- Where a statement is “design intent” vs “implemented detail”, treat it as intent unless verified by source code inspection of src/wasm-core/src/\*.rs.

---

## B) The Frontend Shell (TypeScript)

Frontend approach:

- Vanilla TypeScript (no React/Vue runtime); direct DOM rendering for predictable perf.
- Two UX surfaces:
    1. Office Add-in taskpane
    2. Web App (standalone)

State & UI patterns (observed in repo):

- Web App uses a custom store + subscribe/render loop (mount + actions + UI render).
- Settings are persisted locally (Web: localStorage “safe storage” wrappers; Add-in: settings store).

The “no stutter” rule:

- UI must never block on WASM init; WASM warm-up runs in background where possible (ensureWasmReady pattern).

---

## C) Worker Pipeline (Supervisor Pattern)

Worker-first:

- DOCX conversions run via a worker client (pool/supervisor pattern).
- JS remains a coordinator: queue jobs, stream progress, handle cancellations (AbortController).

Hardening goal:

- If worker crashes or WASM panics, system should fail soft:
    - restart worker
    - re-queue job or fall back (where safe)
    - never lose user input or settings

# ============================================================ 2) 🧩 MODULES & DATA FLOW

---

## OOXML Processing (“The Bridge”)

Critical layer:

- src/shared/ooxml

Pipeline (multi-pass, intent-preserving):

1. Parse OOXML safely
    - block unsafe XML constructs where relevant (DOCTYPE/ENTITY, etc.)
2. Bridging passes
    - Structural: spaces/NBSP normalization, run boundaries
    - Lexical: reconstruct split tokens (links, digraphs, brand fragments across runs)
    - Contextual: ambiguous suffix protection (e.g., “Pro/Max” logic when preceded by brand)
3. Re-serialize back into OOXML with minimal structural disruption
    - preserve styles/runs/fields as much as possible

Constraint:

- Current DOM-based parsing can be memory-heavy for huge XML parts (the “memory wall”).

Planned hardening milestone (v1.1.x target):

- Rust streaming pull-parser inside WASM (quick-xml style) to avoid full DOM materialization.
- Goal: near O(1) memory behavior with bounded buffers.

---

## Dictionary Management

Assets:

- Source JSON in src/static/assets/
- Compiled binary dictionaries produced by Rust compiler tool (cargo run --bin compiler)

Operational rule:

- If JSON dictionaries change, run compile step:
    - pnpm run compile:dicts

# ============================================================ 3) 📈 PERFORMANCE METRICS (CURRENT BASELINE + TARGETED FIX)

Reference machine baseline (as previously measured):

- WASM Init: ~45ms cold, ~5ms warm
- Throughput: ~18k+ words/sec (worker mode)
- UI latency: <16ms (maintained via chunking + worker-first)

Bundle size (approx baseline):

- Total gzipped: ~1.8MB
    - taskpane/web JS: ~150KB order-of-magnitude
    - wasm: ~600KB order-of-magnitude
    - dict bins: ~1.0MB order-of-magnitude

Memory footprint (known wall):

- Idle: ~20MB
- Active small docs: ~80MB
- Active large docs (>100MB XML parts): spikes to ~500MB+ due to DOM tree creation

Hardening target:

- Replace DOM-based parse for heavy parts with streaming Rust parser in WASM:
    - reduce peak memory
    - reduce GC pressure
    - reduce crash probability on huge docs

# ============================================================ 4) 🛡️ SECURITY & COMPLIANCE (OFFLINE-FIRST REALITY)

CSP posture:

- WASM instantiation requires WASM-related allowances (standard for modern WASM apps).
- Network endpoints must remain minimal and privacy-reviewed.

Input sanitization:

- DOMPurify is mandatory anywhere untrusted HTML could touch the DOM.
- XML safety: block XXE-like payloads before any XML parsing.

Privacy rules (non-negotiable):

- No document contents leave device.
- Analytics (if enabled) must be aggregate + anonymous, no PII, no content.

# ============================================================ 5) 🧪 QUALITY ASSURANCE (MAX1 GUARDIAN)

MAX1 Guardian gates (local truth):

- lint (eslint) with --max-warnings 0
- typecheck (tsc --noEmit)
- unit tests (vitest)
- e2e tests (playwright)
- manifest validation
- rust fmt/clippy/test where applicable

Coverage posture:

- Vitest coverage threshold ~92% (target/guarded)

# ============================================================ 6) ⚠️ KNOWN LIMITATIONS & CONSTRAINTS (TRACKED)

A) Memory Wall (Current Milestone)
Impact:

- Very large documents can crash tabs due to DOM-based parsing overhead.

Mitigation:

- Worker chunking + progress updates + cancel support.

Target:

- v1.1.x: Rust streaming pull-parser in WASM.

B) WebView2 / Office Theme Sync (Windows)
Impact:

- Theme changes might not always propagate instantly in some Office/Windows builds.

Mitigation pattern:

- Refresh/polling on focus, reapply CSS variables/root data-theme when needed.

C) Visual Studio HTML Validator Noise (Templates)
Impact:

- Visual Studio may show “Missing attribute name” for taskpane.html when it contains EJS template tags (<%= ... %>).
  Reality:
- This is typically editor validation noise, not a build failure, because the HTML is templated and transformed by webpack.

# ============================================================ 7) ✅ RECENT HARDENING CHANGES (2026-02-10)

A) Office runtime detection is now type-safe and test-safe

- No “any” in production detection path.
- Uses unknown + type guards to detect Office safely in:
    - real Office host
    - Vitest/JSDOM tests
    - plain web contexts

B) Office.js types are now explicitly included

- src/global.d.ts includes:
    - /// <reference types="office-js" />
- This makes Office/Word globals typed (compile-time) without importing runtime.

C) Vitest smoke test stabilized (race condition removed)

- The taskpane entrypoint now starts through:
    - Office.onReady() Promise
    - setTimeout(0)
    - lazy imports
- The test now waits for BOTH:
    - footerVersion to be set
    - addHandlerAsync to be called
      using vi.waitFor (no flakiness)

D) ESLint hardened for declaration files (optional safety)

- Recommended override for \*_/_.d.ts to allow triple-slash reference if ESLint complains.

# ============================================================ 8) 📦 DEPENDENCY SNAPSHOT (AS OF v1.0.0 HARDENING)

Runtime/toolchain (from repo config):

- Node: 22.x (managed via Volta; engines allow >=20, but Volta pins Node 22.x)
- pnpm: 9.x (Volta pins 9.1.0; packageManager is pnpm@9.1.0)
- TypeScript: 5.9.x (devDependency)
- Rust: stable toolchain
- wasm-pack: required for build:wasm

Key libs (from package.json):

- @xmldom/xmldom
- dompurify
- idb
- jszip
- core-js, regenerator-runtime
- vitest, playwright
- eslint + eslint-plugin-office-addins
- @types/office-js (typed Office globals)

============================================================
END STATE SUMMARY (2026-02-10)
============================================================

v1.0.0 is production-ready and in “hardening posture”.
The next biggest technical win is eliminating the DOM memory wall via streaming OOXML parsing in Rust/WASM,
while preserving the system’s core invariants:

- Privacy by design
- Worker-first compute
- Structure-preserving OOXML bridging
- Unified engine across Add-in + Web App

© 2026 Serbian Transliterator Project. Licensed under MIT.
