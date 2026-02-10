# Architecture Decision Record (ADR) (REV 2026-02-10)

This ADR documents key architectural decisions for Serbian Transliterator.

Principles:
- Offline-first + privacy-by-design
- Worker-first compute (UI must remain responsive)
- Unified engine across Office Add-in and Web App
- Strict correctness for Office.js semantics (proxy objects vs ClientResult)
- Deterministic, testable behavior with strong repo gates (MAX1 Guardian)


============================================================
1) Hybrid Engine (TypeScript + Rust/WASM)
============================================================

Context
- The project processes text in two primary environments:
  1) Microsoft Word (Office Add-in) via Office.js / Word JS API
  2) Standalone Web UI (PWA-style) for plain text + DOCX batch conversions
- TypeScript is excellent for UI and host integration, but:
  - Large documents benefit from faster core transforms
  - Linguistic logic benefits from strong typing and high-performance data structures

Decision
- We use a hybrid approach:

A) TypeScript (UI & glue)
- Office.js interactions (selection/document reading, apply/insert ops)
- Settings + UI state management
- Web UX (command palette, live preview, offline simulation)
- Service Worker update prompt UX (banner + command palette integration)

B) Rust/WASM (core logic)
- Transliteration + dialect conversion
- Dictionary-backed transformations
- Core protection primitives (as applicable)

Benefits
- Performance: WASM provides high throughput and stable latency for repeated transforms
- Memory safety: Rust reduces risk of memory-safety bugs in core logic
- Maintainability: complex linguistic rules are easier to express with Rust enums/pattern matching


============================================================
2) Document Processing Model (Word + OOXML)
============================================================

Context
- Word content is accessed through Office.js / Word JS API.
- Office.js has two important result categories:
  - Loadable proxy objects (require load(...) + context.sync())
  - ClientResult<T> (value available only after context.sync(); load() does not apply)
- Correct formatting retention requires OOXML-level operations in many cases.

Decision
- We support two processing modes:
  1) Plain text
     - fast preview / sanity checks
     - simpler UX loops
  2) OOXML
     - format-preserving apply
     - required for correct retention of styles/structure
- Office.js usage rules are enforced:
  - Use load(...) only on proxy objects that are loadable
  - For ClientResult<T> (e.g. range.getOoxml()), call context.sync() before reading .value

Benefits
- Correctness: respects Office.js batching semantics and avoids runtime misuse
- Format preservation: OOXML apply retains formatting where possible


============================================================
3) Web Update Mechanism (Service Worker + UI Integration)
============================================================

Context
- Standalone web UI is served with a Service Worker.
- Updates must be:
  - discoverable
  - user-controlled
  - safe (no reload while conversions are in-flight)

Decision
- Implement SW update prompt with:
  - Banner when a waiting SW exists (update pending)
  - Command palette item (Ctrl+K) to refresh when update is pending
- Use a small event bridge so multiple UI surfaces can react:
  - st:update-available
  - st:update-refresh
- Reload safety:
  - do not refresh while the app is busy
  - reload only on serviceWorker controllerchange after SKIP_WAITING is executed

Benefits
- UX: consistent behavior across banner and command palette
- Safety: avoids reload mid-processing; user explicitly chooses timing


============================================================
4) Build System
============================================================

Context
- We ship:
  - Office Add-in bundles (taskpane + commands)
  - Web app bundle
  - Rust/WASM core artifacts

Decision
- Webpack 5 is the primary bundler.
- wasm-pack compiles Rust to WASM (target web).
- wasm-pack integration into the build is automated (WASM build step is part of the pipeline).

Benefits
- Single pipeline: one build produces JS bundles + WASM artifacts
- Repeatability: automated WASM build reduces human error


============================================================
5) Testing Strategy
============================================================

Context
- We want fast feedback without requiring a live Office host for unit tests.
- Service Worker environment is not fully reproduced in unit tests.

Decision
- Vitest: unit tests for logic, routing, cache decisions, UI state transitions
- Mocking strategy:
  - mock WASM core where appropriate to validate JS orchestration and fallback logic
  - stub Office.js / Word.run to validate selection/document routing deterministically
- Playwright: E2E smoke tests for critical flows in a real browser

Benefits
- Speed: most logic is testable in JSDOM/Node
- Confidence: E2E confirms critical user journeys


============================================================
6) Dictionary Management
============================================================

Context
- Dictionary lookups are performance-sensitive and used frequently.

Decision
- Dictionary implementation lives in the Rust core (dictionary.rs and supporting code).
- Use optimized structures suitable for high-frequency transformations (goal: minimal overhead per lookup).

Benefits
- Performance: predictable fast lookups
- Determinism: easier to validate transformation correctness and regressions


============================================================
7) Repo Gates / Verification (Quality Controls)
============================================================

Context
- Repo combines multiple toolchains (TS/JS, Rust/WASM, Office.js, Service Worker).
- We require strict consistency and reproducibility.

Decision
- MAX1 Guardian pipeline includes:
  - header enforcement (auto-fix where supported)
  - prettier formatting gate
  - ESLint with max warnings = 0 (warnings fail)
  - TypeScript typecheck gate
  - unit tests + optional E2E gates
- Header auto-fix scans project files (tracked + untracked) excluding ignored directories to catch newly created local files without touching build outputs (.vs, node_modules, dist, etc.).

Benefits
- Consistency: new files get standardized headers automatically
- Strictness: no lint warnings slip into CI
- Reduced churn: ignored directories are not touched


============================================================
Appendix: Office.js Type Safety Policy (Hardening Note)
============================================================

- Compile-time types:
  - Use @types/office-js
  - Ensure TS program includes Office types (e.g., via triple-slash reference in src/global.d.ts)
- Runtime:
  - Office global is not guaranteed in web/tests
  - Always use runtime detection (unknown + type guard) before calling Office.onReady()
