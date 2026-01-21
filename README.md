# Serbian Transliterator

[![CI](https://github.com/engilic/serbiantransliterator/actions/workflows/ci.yml/badge.svg)](https://github.com/engilic/serbiantransliterator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![WASM: Rust](https://img.shields.io/badge/wasm-rust-orange.svg)](https://rustwasm.github.io/)

Word Office.js Taskpane Add-in za preslovljavanje srpskog teksta između **latinice ↔ ćirilice** direktno u Microsoft Word dokumentu (selekcija ili ceo dokument).

**Production:** https://serbiantransliterator.pages.dev  
**Repo:** https://github.com/engilic/serbiantransliterator

---

## Features

- **100% Offline:** Svi resursi su ugrađeni. Nema zavisnosti od interneta.
- **Preslovljavanje:** Auto, Lat → Ćir, Ćir → Lat, Ošišana latinica.
- **Dijalekti (WASM):** Ekavica ↔ Ijekavica (pokreće Rust core).
- **Smart Chunking:** Obrađuje dokumente od 500+ strana bez blokiranja Word-a (progress bar).
- **Zaštita:** Čuva URL-ove, e-mailove, kod (`...`) i brendove (`iPhone`).
- **Preview:** Uporedni pregled izmena pre primene.

---

## Tech stack

- **Frontend:** TypeScript, Office.js (Word Taskpane Add-in)
- **Core Logic:** Hibridni engine (TypeScript + Rust/WASM)
- **Build:** Webpack 5 + wasm-pack
- **Test:** Vitest (jsdom) + Playwright (E2E smoke)
- **Hosting:** Cloudflare Pages

---

## Local development

### Prerequisites

- **Node.js** (preporučeno: **Node 20**, usklađeno sa CI)
- **Rust & Cargo** (neophodno za kompajliranje core logike)
    - Windows: `winget install Rustlang.Rustup` i Visual Studio Build Tools
    - Mac/Linux: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **wasm-pack**: `cargo install wasm-pack`
- PowerShell 7 (`pwsh`) je potreban samo za neke lokalne helper skripte (npr. AI pack)

### Install

```sh
npm ci
```
