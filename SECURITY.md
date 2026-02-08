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
- **MAX1 Sniffer:** Our automated pipeline (`pnpm run verify:all`) scans every commit for secrets, hardcoded keys, and the use of unsafe HTML sinks (`innerHTML`).
- **DOMPurify:** Mandatory sanitization for all clipboard and UI rendering operations.
- **Analytics Privacy:** Cloudflare KV analytics collects only aggregated event counts (no IP addresses, cookies, or personal data).

---

## Scope Notes

### In scope:

- Anything that could compromise user privacy (e.g., unexpected network calls).
- Integrity of document content (e.g., vulnerabilities that could corrupt OOXML).
- Execution safety (Worker/WASM escape).
- XSS in UI surfaces (Taskpane/Web mode).
- Vulnerabilities in the build/release pipeline (compromised artifacts).
- Analytics data leakage or unauthorized access to KV storage.

### Out of scope:

- Issues requiring a fully compromised OS or a malicious browser extension to exploit.
- Social engineering attacks.
- Denial-of-service reports that rely on unrealistic inputs (unless they represent common real-world documents).

---

## System Context (for reporters)

### Execution Environment:

- **Office Add-in:** Runs in Office WebView2 (Chromium-based sandbox)
- **Web App:** Runs in modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **Processing:** All document text is processed **locally** (client-side only)

### Network & Privacy:

- **Initial Load:** Application code served from Cloudflare Pages CDN
- **Post-Load:** App operates in **Air-Gap standard** mode (no data leaves the device)
- **Analytics:** Only aggregated, anonymous event counts sent to `/track` endpoint
- **No Third-Party Tracking:** No Google Analytics, cookies, or fingerprinting

### Data Handling:

- **No Persistence:** Document content never stored permanently; exists only in memory during processing
- **No Server Upload:** Documents never leave user's device
- **Clipboard:** Copy operations use `navigator.clipboard` API (user-initiated only)

### Automated Security:

- **MAX1 Guardian:** Runs on every PR and commit
  - `pnpm audit --audit-level=high` (npm dependencies)
  - `cargo audit` (Rust dependencies)
  - Custom security sniffer (secrets, unsafe patterns)
- **E2E Security Tests:** Playwright accessibility & XSS prevention tests
- **CodeQL:** GitHub Advanced Security scans for vulnerabilities

### Build & Release:

- **Reproducible Builds:** All builds tagged with commit SHA
- **Cloudflare Pages:** Automatic deployment from GitHub (no manual upload)
- **KV Namespace:** Write-only from client, read-only via `/stats` endpoint

---

## Known Limitations

1. **Office Host Security:** We rely on Office's sandboxing; vulnerabilities in Office WebView2 are out of scope.
2. **Browser Extensions:** Malicious extensions can intercept data; users should audit installed extensions.
3. **Clipboard Access:** Requires user gesture (browser security model); no silent clipboard reads.

---

## Security Roadmap

Future hardening efforts (post-v1.0):

- [ ] Subresource Integrity (SRI) for CDN assets
- [ ] Content Security Policy (CSP) headers
- [ ] WASM binary signing
- [ ] Formal security audit by third party

---

© 2026 Serbian Transliterator Project.
