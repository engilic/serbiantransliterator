# SERBIAN TRANSLITERATOR — THE NEURAL FRONTIER (GOD1 OPS STATUS)

DATE: February 2026  
VERSION: 1.0.0 (Gold)  
STATUS: Production Ready • Deployed (Cloudflare Pages) • Source of Truth (GitHub)  
MISSION: Evolve from a “Preslovljivač” into an Intelligent Language Processor.  
PHILOSOPHY: Privacy First (Offline), Zero Latency, Universal Availability.

---

## COMPLETED MILESTONES (WINS)

### Enterprise Automation (DevOps) — Q1 2026

Status: DONE

Delivered:

- Guardian verify pipeline (`verify:all`, `verify:all:strict`)
- Reproducible gates: format/lint/typecheck/manifests/rust/build/tests (unit+coverage + e2e)
- Header auto-fix and enforcement (`scripts/add-headers.ps1` + verify gate)
- Safe Windows execution for npm commands (cmd shim, no `shell:true`)
- Quality gates: Playwright E2E, Axe A11y, CodeQL, large-files gate, lockfile integrity, secret/sniffer gate
- Release workflow: `standard-version` (auto changelog + versioning)
- Git cleanup hardening (safe branch cleanup; NUKE remote deletes avoid hooks via `git push --no-verify --delete`)

Outcome:

- One command can validate “ready to ship”.
- Lower regression risk, faster iterations, fewer flaky failures.

---

## CURRENT STATUS (v1.0.0 — GOLD MASTER + MAX PERFORMANCE)

### Core Engine

- Hybrid Engine: Rust + WebAssembly (Universal Converter)
- FST Dictionaries: zero-copy deserialization
- WASM SIMD: 128-bit vectorization enabled
- Zero-Overhead Caching: `thread_local!` instead of `Mutex` in Rust core (removes atomic overhead)

### Performance & Resilience

- Off-main-thread: Web Workers for heavy operations
- Rust FxHash: faster lookups
- Robust Worker Loading: retry + exponential backoff for dictionary load
- Smart Chunking: adaptive processing for large docs without UI blocking

### Architecture & Code Quality

- Modularized codebase: clear separation (Core, Shared, App)
- Clean Sweep: removed dead code, reduced UI duplication
- Rust Rules Extraction: business exceptions extracted into `rules.rs`

### UX & Features

- Zero-Layout-Shift: instant load, GPU-accelerated UI
- Live Status Bar (v2): word count + script auto-detection
- Modern Compact UI: no header, version in footer
- Auto Dark Mode: CSS-native detection
- Web Batch Mode: PWA with drag & drop
- Interactive Preview: diff view

### Security

- Strict CSP
- SafeHTML
- XXE Protection

---

## A11Y STATUS (v1.0.0)

- WCAG AA contrast stabilized (including onboarding/tour text/title)
- A11y E2E stability improved (wait for theme/style stabilization before Axe analysis)

---

## CORE PILLARS (PRIORITY)

### 1) Coding Standards & Resilience (Immediate)

Goal:

- Codebase must be self-maintaining, easy to navigate, and hard to break.

File Identity (required):

- Every source file must start with a comment containing its relative path (syntax depends on file type).
- Enforced via `scripts/add-headers.ps1` and verified in `verify:all`.

Total Error Observability (required):

- No errors are silent: Worker errors, WASM panics, JS exceptions must be caught and surfaced.

Severity policy (prevents UI spam while staying observable):

- INFO: log only
- WARNING (recoverable): status bar + log (e.g., “Worker crashed, switched to fallback”)
- ERROR (user impact): status bar + log + actionable hint
- FATAL: full-screen overlay/modal + “Export logs” option

Smart push / duplicate-check prevention:

- Source-of-truth validation is: `npm run verify:all -- --no-push`
- Push can be manual or verify-driven, but must avoid running the same heavy checks twice.

---

### 2) Core Engine 2.0 (Streaming) — Q2 2026

Goal:

- Process 1GB+ files with constant memory usage (O(1) RAM growth).

Plan:

- Replace JS DOMParser-based XML parsing with Rust streaming parser (`quick-xml`).

Contract requirement (to keep the UI stable during backend swap):

- Define and keep a stable streaming API boundary between JS and WASM so the UI pipeline does not need a rewrite.

Current limitation (accepted for v1.0, not for archival workloads):

- DOMParser parses full XML into RAM; practical limit ~500MB.

---

### 3) Codebase Modernization (ESLint 9 / Flat Config) — Q3 2026

Goal:

- Migrate from ESLint 8 to ESLint 9 flat config.

Risk controls:

- Dedicated migration branch
- Rule parity (no silent rule drops)
- CI sanity check on representative lint output

---

### 4) Ecosystem Expansion (Universal) — 2027

Goal:

- Reuse the same WASM engine in new hosts.

Targets:

- Browser extension (Chrome/Edge/Firefox): transliteration on any website
- Tauri desktop app: offline batch processing for folders on disk

---

## EXPERIMENTAL / UNDER REVIEW

### 5) On-device AI (NER) — Q3 2026? (Research spike only)

Tradeoffs:

- Model size (~20–50MB+) and cold-start cost vs current heuristics (0-byte overhead)

Decision rule:

- Implement only if heuristics hit a hard accuracy ceiling and offline UX remains fast.

### 6) Cloud Intelligence (Hybrid, opt-in)

Status:

- Low priority

Constraint:

- Must be strictly opt-in with privacy guarantees and robust failure handling.
- Consider only for enterprise scenarios where value clearly outweighs complexity.

---

## FOCUS NOW (Feb 2026): LAUNCH & STABILITY

### Telemetry Baseline (Minimum Metrics Set)

Track (local counters/logs; optionally exportable):

- worker_runtime_crash_count
- worker_fallback_activated_reason:onerror
- worker_fallback_activated_reason:messageerror
- worker_retry_count (init/load backoff usage)
- perf_apply_ms_p50 / perf_apply_ms_p95 (end-to-end apply latency)
- chunks_processed (or a stable workload proxy)
- oom_count / large_xml_rejected_count (Web Batch stability)

### NEXT STEPS (IMMEDIATE) — Executable Checklist

1. Dogfooding release workflow (internal)

- [ ] `npm run verify:all -- --no-push` passes on clean master
- [ ] `npm run release -- --release-as patch` on a test branch generates expected changelog
- [ ] `git push --follow-tags` works cleanly (no conflicts, no hook loops)
- [ ] rollback plan documented (tag checkout + redeploy)

2. Telemetry analysis (first 7 days of dogfooding)

- [ ] minimum metrics set enabled (see above)
- [ ] diagnostics visibility: counters visible (Stats/Diagnostics view) OR easy export
- [ ] define thresholds for action (e.g., worker crash > 0.5% sessions)

3. Microsoft Store submission readiness

- [ ] manifest validation (dev+prod) green
- [ ] privacy/support pages finalized
- [ ] screenshots + short demo video prepared
- [ ] known limitations documented (DOMParser ~500MB, WebView2 theme sync behavior)

4. I18n cleanup (safe-delete only)

- [ ] remove only keys confirmed safe by `checkI18nKeys`
- [ ] exhaustive i18n tests pass
- [ ] no user-facing string regression gates pass

### v1.0.1 Candidate (UX polish)

- [ ] Accordion auto-scroll fine-tuning: adjust `scroll-margin-block` for better spacing after `scrollIntoView`

---

## VERIFICATION (Developer Workflow)

Standard (no push):

- `npm run verify:all -- --no-push`

Strict gates (security/audit):

- `npm run verify:all:strict -- --no-push`

Fast mode (skips Unit/E2E + coverage):

- `npm run verify:all -- --fast --no-push`

Notes:

- Manifest validation runs for both dev and prod (they can diverge).
- For coverage, run without `--fast`.
