# SERBIAN TRANSLITERATOR - THE NEURAL FRONTIER

**DATE:** February 2026  
**VERSION:** 1.0.0 (Gold + God Mode DevOps)  
**STATUS:** 🚀 DEPLOYED (Cloudflare Pages) • SOURCE (GitHub)  
**MISSION:** Evolve from a simple “Preslovljivač” into an Intelligent Language Processor.  
**PHILOSOPHY:** Privacy First (Offline), Zero Latency, Universal Availability.

---

## ✅ COMPLETED MILESTONES (WINS)

### 🏆 ENTERPRISE AUTOMATION (DEVOPS) — Q1 2026

- **Status:** DONE.
- **Implemented:** Guardian verify pipeline (`verify:all`, `verify:all:strict`), header auto-fix, CodeQL hardening, reproducible gates (lint/typecheck/build/tests), and smart push flow.
- **Result:** Development process is automated, safer, and faster with consistent “pre-flight” validation.

---

## 🟢 CORE PILLARS (PRIORITY - DEFINITE)

### 1) CODING STANDARDS & RESILIENCE (IMMEDIATE)

- **Goal:** The codebase must be self-maintaining, easy to navigate, and hard to break.
- **File Identity (Required):** Every source file must start with a comment containing its **relative path** (comment syntax depends on file type).  
  Examples:
    - `// src/core/textCore.ts`
    - `/* src/taskpane/components/modals/modals.css */`
    - `<!-- src/taskpane/taskpane.html -->`
    - `# scripts/add-headers.ps1`  
      Enforced automatically via `scripts/add-headers.ps1` and verified in `verify:all`.
- **Total Error Observability:** No errors should be “silent”:
    - Worker errors, WASM panics, JS exceptions must be caught.
    - Errors must surface to users via UI status (`#msg`) or a modal, so the user understands what happened.

### 2) CORE ENGINE 2.0 (STREAMING) — Q2 2026

- **Goal:** Process 1GB+ files with constant memory usage (O(1) RAM).
- **Tech:** Replace `DOMParser` (JS) with `quick-xml` (Rust).
- **Status:** Planned. Current ~500MB limit is acceptable for v1.0, but not enough for archival workloads.

### 3) CODEBASE MODERNIZATION (ESLINT 9) — Q3 2026

- **Goal:** Migrate from ESLint 8 to **ESLint 9 (Flat Config)**.
- **Reason:** Reduce deprecation warnings and prepare for future Node.js versions / ecosystem changes.

### 4) ECOSYSTEM (UNIVERSAL) — 2027

- **Goal:** Expand beyond Word. Same WASM engine, new hosts.
- **Browser Extension:** Chrome/Edge/Firefox extension for transliteration on any website (Gmail, Google Docs, etc.).
- **Tauri Desktop App:** Standalone batch-processing app for folders on disk (Drag & Drop thousands of files).

---

## 🟡 EXPERIMENTAL / SKEPTICAL (UNDER REVIEW)

### 5) ON-DEVICE AI (NER) — Q3 2026?

- **Concept:** Local BERT (ONNX Runtime) for Named Entity Recognition without manual rules.
- **Architect’s Note:**
    - **Size:** Model adds ~20–50MB to bundle; may slow initial load.
    - **Alternative:** Improve existing Rust heuristics (regex/logic). Current approach is already strong with 0-byte model overhead.
- **Status:** Research spike only. Implement only if heuristics hit a hard accuracy ceiling.

### 6) CLOUD INTELLIGENCE (HYBRID)

- **Concept:** Opt-in hybrid mode using Cloudflare Workers + LLM API for stylistic analysis.
- **Architect’s Note:**
    - **Privacy:** Conflicts with Offline & Privacy core value; data leaves device.
    - **Complexity:** Requires network, API keys, infra cost, and robust error handling.
- **Status:** Low priority. Consider only as an Opt-In feature for Enterprise customers.

---

## 🎯 FOCUS NOW (Q1 2026): LAUNCH & STABILITY

Infrastructure is “God Tier”. Focus returns to code cleanliness and UX polish.

### Immediate Next Steps

1. **Standardization:** Ensure file path headers are present everywhere (enforced via `add-headers.ps1` + verify gate).
2. **I18n Cleanup:** Remove unused translations safely (only keys confirmed as safe by `checkI18nKeys`).
3. **A11y Baseline:** Keep WCAG AA contrast and stabilize A11y E2E checks (avoid flaky UI states).
4. **Telemetry Analysis:** Monitor production performance and edge cases.
5. **Marketing:** Prepare Store listing (screenshots, video).

### UX Polish (v1.0.1 Candidate)

- [ ] **Accordion Auto-Scroll Fine-Tuning:** Adjust CSS `scroll-margin-block: 15px` for sections so `scrollIntoView` leaves more breathing room.

---

## 🔍 Verification (Developer Workflow)

- Standard (no push):
    - `npm run verify:all -- --no-push`
- Strict gates (security/audit etc.):
    - `npm run verify:all:strict -- --no-push`
- Fast mode (skips Unit/E2E and thus coverage):
    - `npm run verify:all -- --fast --no-push`

Note:

- Manifest validation runs for both dev and prod manifests because they are separate files and can diverge (URLs, metadata, policy).
