# Security Policy

## Supported Versions

This project is actively maintained on the `master` branch. Security updates are prioritized for the hybrid Rust/WASM core and the OOXML processing bridge.

**Version Support**

- **1.0.x** — ✅ Yes (Stable)
- **< 1.0.0** — ❌ No

If you are running an older release, please upgrade to the latest 1.0.x version and re-test before reporting.

---

## Reporting a Vulnerability (Private Disclosure Only)

If you believe you have found a security vulnerability, please **do not** open a public GitHub Issue and **do not** post proof-of-concepts publicly.

Report it privately using one of the following channels:

1. **Email (preferred):** iddj27510@gmail.com
    - Subject: `Serbian Transliterator - Security report`

2. **GitHub Security Advisories:**
    - Use GitHub’s **“Report a vulnerability”** flow (creates a private advisory thread)

### Please include

- A clear description of the issue and its impact
- Steps to reproduce (PoC if possible)
- Affected versions and/or commit hash
- Environment details (Word version, OS, browser/WebView2 version)
- Relevant logs (sanitize sensitive document content before sending)

### Response targets (best effort)

- **Acknowledgement:** within 72 hours
- **Status update:** within 7 days
- **Fix timeline:** depends on severity and release constraints

---

## Mitigations & Defense-in-Depth

As of **v1.0.0 (Phase 2 Hardening)**, the following security measures are enforced:

- **Pre-parse XML Validation:** OOXML parts are validated for XXE-like constructs (e.g., `DOCTYPE` / `ENTITY`) and “Billion Laughs”-style signatures before being parsed.
- **Worker Isolation:** Document processing is executed in an isolated Web Worker context where applicable (to keep the UI thread non-blocking and reduce blast radius).
- **WASM Memory Safety:** The core engine is implemented in Rust, reducing risk of classic memory-safety vulnerabilities (buffer overflows, use-after-free) in text manipulation logic.
- **MAX1 Sniffer / CI Security Gates:** The automated pipeline (`pnpm run verify:all` / `pnpm run verify:all:strict`) scans commits for secrets, hardcoded keys, and unsafe HTML sinks (e.g., unreviewed `innerHTML` usage).
- **DOMPurify:** Mandatory sanitization for any clipboard-derived HTML and any UI rendering path that touches HTML.

---

## Scope Notes

### In scope

- Anything that could compromise user privacy (e.g., unexpected network calls, data exfiltration)
- Integrity of document content (e.g., vulnerabilities that could corrupt OOXML or silently change meaning)
- Execution safety (worker/WASM boundary issues, sandbox escapes)
- XSS / injection in UI surfaces (Taskpane + Web app)
- Vulnerabilities in the build/release pipeline (compromised artifacts, dependency attacks)

### Out of scope

- Issues requiring a fully compromised OS or a malicious browser extension to exploit
- Social engineering attacks
- Denial-of-service reports that rely on unrealistic inputs
    - (We do consider DoS issues **in scope** if they reflect common real-world documents and usage patterns.)

---

## System Context (for reporters)

- **Execution:** Document text is processed **locally** (client-side).
- **Network:** After the initial app load, the product is designed to operate in an “air-gap” posture for document content (no document contents are sent to external services).
- **Automated Audits:** The project uses MAX1 Guardian verification gates on PRs (lint/typecheck/tests/build + security checks + dependency audits as configured).
- **Persistence:** Document content is not intentionally persisted to disk by the application. It exists in memory during processing.
    - Settings, UI preferences, and (optional) performance telemetry may be stored locally (e.g., localStorage/IndexedDB), but **not raw document content**.

---

© 2026 Serbian Transliterator Project. Licensed under MIT.
