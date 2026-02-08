# Architecture Decision Record (ADR)

## 1. Hybrid Engine (TypeScript + Rust/WASM)

### Context

The project processes text in two main environments:

- Microsoft Word (Office Add-in) via Word JavaScript API (Office.js).
- A standalone web UI (PWA-style) that also supports large inputs and batch conversions.

JavaScript/TypeScript string processing is sufficient for small texts and UI glue, but:

- Large documents (Word OOXML, many paragraphs) benefit from faster core processing.
- Linguistic features (e.g., dialect conversion) are easier to express and keep correct in a strongly typed, performance-oriented core.

### Decision

We use a hybrid approach:

- **TypeScript (UI & Glue):**
    - Word JS API interactions (selection/document reading, insert operations).
    - Settings/UI state management, command palette, live preview behavior.
    - Service Worker update prompt + UX integration (banner + command palette refresh).
- **Rust/WASM (Core Logic):**
    - High-performance transliteration and dialect conversion logic.
    - Dictionary-backed matching / transformations.

### Benefits

- **Performance:** WASM core provides near-native speed for large inputs and repeated transforms.
- **Memory Safety:** Rust prevents common memory bugs and supports robust refactoring.
- **Maintainability:** Complex linguistic logic is easier to express using Rust enums/pattern matching.

---

## 2. Document Processing Model (Word + OOXML)

### Context

Word content is accessed via Office.js. Some calls return **proxy objects** requiring `load(...) + context.sync()`, while others return **ClientResult<T>** where `.value` is available only after `context.sync()` (and `load()` is not applicable).

### Decision

- For selection/document processing we support:
    - **Plain text** (fast preview, sanity checks).
    - **OOXML** (format-preserving apply; required for correct document formatting retention).
- Follow Office.js rules:
    - Use `load(...)` only for loadable proxy objects.
    - For `ClientResult` (e.g., `range.getOoxml()`), call `context.sync()` before reading `.value`.

### Benefits

- **Correctness:** Avoids Office.js runtime issues and respects batching semantics.
- **Format preservation:** OOXML apply retains Word formatting where possible.

---

## 3. Web Update Mechanism (Service Worker + UI Integration)

### Context

The standalone web UI is served with a Service Worker. Updates should be:

- Discoverable (banner + command palette entry).
- User-controlled (“Refresh now” / “Later”).
- Safe (avoid reload during active processing).

### Decision

- Implement SW update prompt with:
    - A banner that appears when a waiting SW exists.
    - A command palette item (Ctrl+K) to trigger refresh when an update is pending.
- Use a simple event bridge (`st:update-available`, `st:update-refresh`) so multiple UI surfaces can react to updates.

### Benefits

- **UX:** Consistent update behavior across banner and command palette.
- **Safety:** Avoids reload while busy; enables explicit user action.

---

## 4. Build System

### Context

We need to ship:

- Office Add-in bundles (taskpane/commands).
- A web UI bundle.
- A Rust/WASM core.

### Decision

- **Webpack 5** bundles the application.
- **wasm-pack** compiles Rust to WebAssembly.
- **@wasm-tool/wasm-pack-plugin** integrates Rust/WASM builds into the Webpack pipeline.

### Benefits

- **Single pipeline:** One build system produces JS bundles + WASM artifacts.
- **Repeatable builds:** WASM build is automated as part of Webpack.

---

## 5. Testing Strategy

### Context

We want fast feedback and reliable coverage without running Office host or full SW environment in unit tests.

### Decision

- **Vitest** for unit tests (logic, routing, cache decisions, UI state transitions).
- **Mocking strategy:**
    - Mock WASM core where appropriate in unit tests to verify JS orchestration and fallback logic.
    - Stub Office.js / `Word.run` interactions to validate selection/document routing logic deterministically.
- **Playwright** for E2E smoke tests.

### Benefits

- **Speed:** Most logic is testable in JSDOM/Node.
- **Confidence:** E2E confirms critical flows in a real browser.

---

## 6. Dictionary Management

### Context

Dictionary lookups are performance-sensitive and used frequently during conversion.

### Decision

- Dictionary lives in `src/wasm-core/src/dictionary.rs`.
- Use static matching / optimized structures suitable for high-frequency transformations.

### Benefits

- **Performance:** Minimal overhead per lookup.
- **Determinism:** Easier to validate transformation correctness.

---

## 7. Repo Gates / Verification (Quality Controls)

### Context

We enforce consistent formatting, headers, and lint/type safety across the repo. The repo contains multiple toolchains (TS/JS, Rust, SW, Office.js).

### Decision

- Verification pipeline includes:
    - Header auto-fix for supported source files.
    - Prettier formatting gate.
    - ESLint with **max warnings = 0** (warnings fail the build).
    - Typecheck gate.
    - Unit tests + optional E2E gates.
- Header auto-fix scans **project files (tracked + untracked) excluding ignored** to catch new local files, while still ignoring non-project folders (e.g., `.vs`, `node_modules`, build outputs).

### Benefits

- **Consistency:** New files get standardized headers automatically.
- **Strictness:** No lint warnings slip through CI.
- **Reduced churn:** Ignored directories aren’t touched.
