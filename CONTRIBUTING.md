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

Napomena (Windows): nemoj koristiti `<` i `>` u imenima grana.  
Umesto `chore/<opis>` koristi `chore/opis` (npr. `chore/docs-tools-workflow`).

### 1) Start from latest master

```sh
git checkout master
git pull --ff-only
git checkout -b feat/your-task-name
```
