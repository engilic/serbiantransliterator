# Architecture Decision Record (ADR)

## 1. Hybrid Engine (TypeScript + Rust/WASM)

### Context

The project requires processing large text documents in Microsoft Word. JavaScript (RegExp) is sufficient for small texts, but complex linguistic rules (dialects) and large documents benefit from higher performance.

### Decision

We use a hybrid approach:

-   **TypeScript (UI & Glue):** Handles Word JS API interactions, settings, and DOM manipulation.
-   **Rust/WASM (Core Logic):** Handles heavy text processing (transliteration, dialect conversion).

### Benefits

-   **Performance:** Rust's zero-cost abstractions and compiled nature provide near-native speed.
-   **Memory Safety:** Rust prevents common memory bugs.
-   **Dialect Support:** Complex mapping logic (Ekavica <-> Ijekavica) is easier to maintain in Rust's pattern matching (`match`) than in JS switches.

## 2. Build System

-   **Webpack 5:** Bundles the application.
-   **wasm-pack:** Compiles Rust to WebAssembly.
-   **@wasm-tool/wasm-pack-plugin:** Automates the Rust build within the Webpack pipeline.

## 3. Testing Strategy

-   **Vitest:** Used for Unit testing.
-   **WASM Mocking:** Since WASM cannot easily run in JSDOM environment without overhead, we mock the `wasm-core` module in unit tests to verify JS logic (fallback mechanisms).
-   **Playwright:** Used for E2E smoke tests.

## 4. Dictionary Management

-   Dictionary is located in `src/wasm-core/src/dictionary.rs`.
-   It uses static string matching for maximum performance.
