# SERBIAN TRANSLITERATOR — THE NEURAL FRONTIER (GOD1 OPS)

DATE: February 2026
VERSION: 1.0.0 (Gold)
STATUS: Deployed (Cloudflare Pages) • Source of truth (GitHub)
MISSION: Evolve from a “Preslovljivač” into an Intelligent Language Processor.
PHILOSOPHY: Privacy-first (offline), zero latency, universal availability.

---

## Completed Milestones (Wins)

### Enterprise Automation (DevOps) — Q1 2026

Status: DONE

Delivered:

- Guardian verify pipeline: `verify:all`, `verify:all:strict`
- Consistent gates: format/lint/typecheck/build/tests + Rust fmt/clippy/tests + manifest validation
- Header enforcement for file identity
- Smart push flow and safer cleanup scripts

Outcome:

- A single command can prove the repo is releasable.
- Reduced “it works on my machine” drift.

---

## Core Pillars (Priority)

### 1) Coding Standards & Resilience (Immediate)

Goal:

- Self-maintaining codebase, easy to navigate, hard to break.

File identity headers (required):

- Every source file starts with its relative path comment (syntax depends on file type).
- Enforced by `scripts/add-headers.ps1` and verified in `verify:all`.

Total Error Observability (required):

- No errors are silent: Worker errors, WASM panics, JS exceptions must be captured.

Severity policy:

- INFO: log + optional status
- WARNING (recoverable): status + log (and optionally diagnostics counters)
- ERROR (user impact): status + log (include actionable hint)
- FATAL: full-screen overlay/modal + log + “Export logs” option

Definition of Done (for new logic):

- New decision logic has unit tests.
- Adapters isolate external APIs (Office/Word/Worker/Storage/Scheduler).
- No import-time side effects that hang tests.

---

### 2) Core Engine 2.0 (Streaming) — Q2 2026

Goal:

- Process 1GB+ OOXML with constant RAM (O(1) memory growth).

Approach:

- Replace DOMParser-based XML processing with Rust streaming (`quick-xml`).

Contract requirement:

- Define a stable streaming conversion API boundary (JS ↔ WASM) so the UI pipeline stays intact while the backend swaps out.

Status:

- Planned (current ~500MB practical limit acceptable for v1.0, not for archival workloads).

---

### 3) Codebase Modernization (ESLint 9 / Flat Config) — Q3 2026

Goal:

- Migrate from ESLint 8 to ESLint 9 flat config.

Risk controls:

- Dedicated migration branch.
- Rule parity (no silent rule drops).
- CI snapshot of lint output for a few representative files.

---

### 4) Ecosystem Expansion (Universal) — 2027

Goal:

- Reuse the same WASM engine in new hosts.

Targets:

- Browser extension (Chrome/Edge/Firefox): transliteration on any website.
- Tauri desktop app: batch processing folders (offline).

---

## Experimental / Under Review

### 5) On-device AI (NER) — Q3 2026? (Research spike only)

Tradeoffs:

- Model size (20–50MB+) and cold-start cost vs heuristics (0-byte overhead).
  Decision rule:
- Implement only if heuristics hit a hard accuracy ceiling and we can keep offline UX fast.

### 6) Cloud Intelligence (Hybrid, opt-in)

Status: Low priority
Constraint:

- Must be strictly opt-in with privacy guarantees and strong failure handling.
  Only consider for enterprise use cases.

---

## Focus Now (Feb 2026): Launch & Stability

### Immediate Next Steps (Ops Backlog)

1. Standardization:
    - Ensure file path headers everywhere (enforced by add-headers + verify gate).

2. I18n cleanup:
    - Remove unused translations only when confirmed safe by scripts.
    - Keep changes small and test-covered.

3. A11y baseline:
    - Keep WCAG AA contrast.
    - Stabilize Axe E2E checks (avoid flaky transient UI states).

4. Telemetry analysis:
    - Track runtime worker failures and fallback activations.
    - Track operation timings and slow paths.

5. Store readiness:
    - Prepare listing assets (screenshots/video), verify manifests and policies.

### v1.0.1 Candidate (UX polish)

- Accordion auto-scroll fine-tuning:
    - Adjust `scroll-margin-block` so `scrollIntoView` leaves breathing room.

---

## Verification (Developer Workflow)

- Standard (no push):
    - `npm run verify:all -- --no-push`

- Strict gates (security/audit):
    - `npm run verify:all:strict -- --no-push`

- Fast mode (skips Unit/E2E + coverage):
    - `npm run verify:all -- --fast --no-push`

Notes:

- Dev+Prod manifest validation runs always (they can diverge).
- For coverage, run without `--fast`.
