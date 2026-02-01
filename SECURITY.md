# Security Policy

## Supported Versions

This project is actively maintained on the `master` branch.

Security fixes are provided for:

- The latest released version (current stable), and
- `master` (source of truth)

If you are running an older release, please upgrade to the latest version and re-test before reporting.

---

## Reporting a Vulnerability

If you believe you have found a security vulnerability, please **do not** open a public GitHub Issue and do not post proof-of-concepts publicly.

Report it privately using one of the following channels:

1. **Email (preferred):** iddj27510@gmail.com
    - Subject: `Serbian Transliterator - Security report`

2. **GitHub Security Advisories (preferred if available):**
    - Use GitHub’s “Report a vulnerability” flow (creates a private advisory thread)

Please include:

- A clear description of the issue and its impact
- Steps to reproduce (PoC if possible)
- Affected versions/commit hash (if known)
- Environment details (Word version, OS, browser/WebView2 version, add-in version)
- Any relevant logs/screenshots (sanitize sensitive document content)

Important:

- Please avoid sending real customer documents or private data. If a document is required, provide a minimized, redacted test file.

---

## Response Expectations

We aim to:

- Acknowledge receipt within a reasonable time
- Investigate and validate the report
- Provide a remediation plan or fix
- Coordinate responsible disclosure if needed

Typical timeline targets (best-effort):

- Acknowledgement: within a few business days
- Triage/initial assessment: within ~1 week
- Fix/mitigation plan: depends on severity and complexity

---

## Responsible Disclosure

- Please give us a reasonable window to investigate and ship a fix before public disclosure.
- If you plan to publish details, coordinate timing with the maintainers so users can update safely.

---

## Scope Notes

In scope:

- Anything that could compromise user privacy, integrity of document content, or execution safety
- OOXML parsing/conversion logic (including XXE-style issues)
- Worker/WASM initialization and message passing
- UI surfaces that could enable injection (XSS) or unsafe HTML rendering
- Build/release pipeline issues that could result in compromised artifacts

Out of scope (generally):

- Issues requiring a fully compromised OS or a malicious browser extension to exploit
- Social engineering attacks not involving a technical vulnerability in this codebase
- Denial-of-service reports that rely on unrealistic inputs (unless they represent common real-world documents)

---

## System Context (for reporters)

- This add-in processes document text locally (in the Word host/browser).
- Hosting is static (Cloudflare Pages).
- CI uses automated security checks (Dependabot + CodeQL + npm audit gate where enabled).
- Core conversion uses Rust/WASM; browser Worker isolation is used where available.

---
