# Security Policy

## Supported Versions

This project is actively maintained on the `master` branch.

## Reporting a Vulnerability

If you believe you have found a security vulnerability, please **do not** open a public GitHub Issue.

Instead, report it privately:

- Email: **iddj27510@gmail.com**
- Subject: `Serbian Transliterator - Security report`

Please include:

- A clear description of the issue and impact
- Steps to reproduce (PoC if possible)
- Affected versions/commit (if known)
- Any relevant logs/screenshots

## Response Expectations

We aim to:

- Acknowledge receipt within a reasonable time
- Investigate and validate the report
- Provide a remediation plan or fix
- Coordinate responsible disclosure if needed

## Scope Notes

- This add-in processes document text locally (in the Word host/browser).
- Hosting is static (Cloudflare Pages).
- CI uses automated security checks (Dependabot + CodeQL + npm audit gate in CI, if enabled).
