# Security Policy

## Supported Versions

This project is actively maintained on the `master` branch. Security updates are prioritized for the hybrid Rust/WASM core and the OOXML processing bridge.

**Version Support:**

- 1.0.x — ✅ Yes (Stable)
- < 1.0.0 — ❌ No

If you are running an older release, please upgrade to the latest version and re-test before reporting.

---

## Reporting a Vulnerability

If you believe you have found a security vulnerability, please **do not** open a public GitHub Issue and do not post proof-of-concepts publicly.

Report it privately using one of the following channels:

**1. Email (preferred):** iddj27510@gmail.com
   - Subject: `Serbian Transliterator - Security report`

**2. GitHub Security Advisories:**
   - Use GitHub's "Report a vulnerability" flow (creates a private advisory thread)

### Please include:

- A clear description of the issue and its impact.
- Steps to reproduce (PoC if possible).
- Affected versions/commit hash.
- Environment details (Word version, OS, browser/WebView2 version).
- Any relevant logs (sanitize sensitive document content before sending).

---

## Mitigations & Defense-in-Depth

As of **v1.0.0 (Phase 2 Hardening)**, the following security measures are enforced:

- **Pre-parse XML Validation:** All OOXML is validated for XXE (External Entity) and Billion Laughs signatures before entering the DOM parser.
- **Worker Isolation:** 100% of text processing occurs in a isolated Web Worker context.
- **WASM Memory Safety:** The core engine is built in Rust, providing memory safety guarantees that prevent buffer overflows in text manipulation.
- **MAX1 Sniffer:** Our automated pipeline (`verify-all.js`) scans every commit for secrets, hardcoded keys, and the use of unsafe HTML sinks (`innerHTML`).
- **DOMPurify:** Mandatory sanitization for all clipboard and UI rendering operations.

---

## Scope Notes

### In scope:

- Anything that could compromise user privacy (e.g., unexpected network calls).
- Integrity of document content (e.g., vulnerabilities that could corrupt OOXML).
- Execution safety (Worker/WASM escape).
- XSS in UI surfaces (Taskpane/Web mode).
- Vulnerabilities in the build/release pipeline (compromised artifacts).

### Out of scope:

- Issues requiring a fully compromised OS or a malicious browser extension to exploit.
- Social engineering attacks.
- Denial-of-service reports that rely on unrealistic inputs (unless they represent common real-world documents).

---

## System Context (for reporters)

- **Execution:** This add-in processes document text **locally** (client-side only).
- **Network:** After initial load from Cloudflare Pages, the app operates in an **Air-Gap standard** mode (no data leaves the device).
- **Automated Audits:** The project uses `MAX1 Guardian` (npm audit high + cargo audit strict + custom security sniffer) on every PR.
- **No Persistence:** Document content is never stored permanently; it exists only in memory during processing.

---

© 2026 Serbian Transliterator Project.
