# Contributing to Serbian Transliterator (REV 2026-02-10)

Hvala što doprinosiš projektu.

Ovaj repo je Word Office.js taskpane add-in (TypeScript + Webpack), hostovan na Cloudflare Pages. Core engine je Rust/WASM.

Package manager: projekat koristi pnpm (ne npm).

---

## Communication & Scope

- Predloži promenu kroz GitHub Issue ili PR (osim security problema — vidi SECURITY.md).
- Drži PR-ove fokusirane: jedna tema = jedan PR.
- Ako menjaš ponašanje (behavior), obavezno dodaj testove ili ažuriraj postojeće.

---

## Standard PR workflow

Napomena (Windows):

- Nemoj koristiti `<` i `>` u imenima grana.
- Umesto `chore/<opis>` koristi `chore/opis` (npr. `chore/docs-tools-workflow`).

1. Start from latest master

    git switch master
    git pull --ff-only
    git switch -c feat/your-task-name

2. Make changes and verify (MAX1 Guardian)

    # Full local verification before committing (recommended)

    pnpm run verify:all -- --no-push

    # Optional quick gates during development:

    pnpm run lint
    pnpm run typecheck
    pnpm run test

3. Commit with conventional format

    git add .
    git commit -m "feat: add new feature description"

4. Push and create PR

    git push -u origin feat/your-task-name

---

## Commit Message Format (Conventional Commits)

- feat: nova funkcionalnost
- fix: ispravka baga
- refactor: refaktorisanje bez promene ponašanja
- chore: održavanje, konfiguracija, zavisnosti
- docs: dokumentacija

---

## Code Standards (Non-negotiable)

- Svaki izvorni fajl mora imati header sa relativnom putanjom.
- Koristi logger.info() / logger.warn() / logger.error() umesto console.log.
- any tip je zabranjen — koristi unknown + type guards.
- Nikada ne gutaj greške (never swallow errors).
- Ne uvodi net pozive za sadržaj dokumenata (privacy-by-design). Ako je mrežni poziv neophodan (npr. telemetry), mora biti:
    - jasno dokumentovan
    - agregatan i anoniman
    - bez PII i bez sadržaja dokumenata

Office.js tipovi:

- @types/office-js je devDependency.
- src/global.d.ts uključuje: /// <reference types="office-js" />
- Runtime Office objekat nije garantovan u testovima/web-u, zato koristimo runtime guard (unknown + type guard) pre poziva Office.onReady().

---

## Running Tests

Unit tests:

    pnpm run test

E2E tests:

    pnpm run test:e2e

Full verification pipeline:

    pnpm run verify:all -- --no-push

---

## Questions?

Ako imaš pitanja, otvori GitHub Issue sa labelom question.
