# Contributing to Serbian Transliterator

Hvala što doprinosiš projektu.

Ovaj repo je Word Office.js taskpane add-in (TypeScript + Webpack), hostovan na Cloudflare Pages. Core engine je Rust/WASM.

**Package manager:** projekat koristi **pnpm** (ne npm).

---

## Communication & Scope

- Predloži promenu kroz GitHub Issue ili PR (osim security problema — vidi `SECURITY.md`).
- Drži PR-ove fokusirane: jedna tema = jedan PR.
- Ako menjaš ponašanje (behavior), obavezno dodaj testove ili ažuriraj postojeće.

---

## Standard PR workflow

> **Napomena (Windows):** Nemoj koristiti `<` i `>` u imenima grana.  
> Umesto `chore/<opis>` koristi `chore/opis` (npr. `chore/docs-tools-workflow`).

### 1) Start from latest master

    git checkout master
    git pull --ff-only
    git checkout -b feat/your-task-name

### 2) Make changes and verify

    # Run full verification before committing
    pnpm run verify:all -- --no-push

### 3) Commit with conventional format

    git add .
    git commit -m "feat: add new feature description"

### 4) Push and create PR

    git push -u origin feat/your-task-name

---

## Commit Message Format

Koristimo Conventional Commits format:

- `feat:` — Nova funkcionalnost
- `fix:` — Ispravka baga
- `refactor:` — Refaktorisanje bez promene ponašanja
- `chore:` — Održavanje, konfiguracija, zavisnosti
- `docs:` — Dokumentacija

---

## Code Standards

- Svaki izvorni fajl mora imati header sa relativnom putanjom.
- Koristi `logger.info()` / `logger.warn()` / `logger.error()` umesto `console.log`.
- `any` tip je zabranjen — koristi `unknown` + type guards.
- Nikada ne gutaj greške (never swallow errors).  
  **Izuzetak:** “best-effort” UX pozivi koji ne utiču na korektnost (npr. `range.select()` radi UX-a) mogu biti u `try/catch` uz komentar, ali bez maskiranja realnih grešaka u obradi podataka.

---

## Running Tests

    # Unit tests with coverage
    pnpm run test

    # E2E tests
    pnpm run test:e2e

    # Full verification pipeline
    pnpm run verify:all -- --no-push

---

## Tooling & Gates (must pass)

- ESLint je podešen tako da **0 warnings** prolazi (max-warnings = 0).
- Typecheck mora biti čist.
- Prettier gate mora biti čist (auto-fix je dozvoljen).
- Header gate mora proći (header sa relativnom putanjom u svakom source fajlu).

---

## Questions?

Ako imaš pitanja, otvori GitHub Issue sa labelom `question`.
