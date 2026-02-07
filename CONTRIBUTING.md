# Contributing to Serbian Transliterator

Hvala što doprinosiš projektu.

Ovaj repo je Word Office.js taskpane add-in (TypeScript + Webpack), hostovan na Cloudflare Pages. Core engine je Rust/WASM.

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

~~~sh
git checkout master
git pull --ff-only
git checkout -b feat/your-task-name
~~~

### 2) Make changes and verify

~~~sh
# Run full verification before committing
npm run verify:all -- --no-push
~~~

### 3) Commit with conventional format

~~~sh
git add .
git commit -m "feat: add new feature description"
~~~

### 4) Push and create PR

~~~sh
git push -u origin feat/your-task-name
~~~

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

---

## Running Tests

~~~sh
# Unit tests with coverage
npm run test

# E2E tests
npm run test:e2e

# Full verification pipeline
npm run verify:all -- --no-push
~~~

---

## Questions?

Ako imaš pitanja, otvori GitHub Issue sa labelom `question`.
