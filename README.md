# Serbian Transliterator (v1.0.0)

[![CI](https://github.com/engilic/serbiantransliterator/actions/workflows/ci.yml/badge.svg)](https://github.com/engilic/serbiantransliterator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WASM: Rust](https://img.shields.io/badge/wasm-rust-orange.svg)](https://rustwasm.github.io/)

**Najbrži i najsigurniji način za preslovljavanje ćirilice i latinice u Microsoft Word-u.**

Ovaj dodatak (Add-in) omogućava preslovljavanje selekcije ili celog dokumenta jednim klikom, uz pametnu zaštitu imena, brendova i programskog koda.

🔗 **Koristite online (Web Mode):** [serbiantransliterator.pages.dev](https://serbiantransliterator.pages.dev)

---

## 🔥 Ključne Mogućnosti (v1.0.0)

-   **100% Offline & Privatno:** Vaš tekst **nikada** ne napušta vaš računar. Sve se procesira lokalno u browseru/Wordu.
-   **Ekstremne Performanse:** Pokreće ga **Rust + WebAssembly** engine.
-   **Pametna Zaštita:**
    -   Automatski prepoznaje i čuva URL-ove, E-mail adrese i strane brendove (`iPhone`, `YouTube`).
    -   Ne dira tekst unutar programskog koda (`code blocks`).
-   **Dijalekti (Beta):** Podrška za konverziju Ekavica ↔ Ijekavica.
-   **Web Batch Mode:** Prevucite `.docx` fajl direktno u browser za brzu konverziju bez otvaranja Word-a.
-   **PWA Support:** Instalirajte aplikaciju na Desktop ili Mobilni telefon.

---

## 🛠️ Instalacija

### Opcija A: Microsoft AppSource (Preporučeno)

1. Otvorite Word.
2. Idite na **Home > Add-ins > Get Add-ins**.
3. Pretražite "Serbian Transliterator" i kliknite **Add**.

### Opcija B: Web Mode (Bez instalacije)

1. Posetite [serbiantransliterator.pages.dev](https://serbiantransliterator.pages.dev).
2. Prevucite `.docx` fajl u označeno polje.
3. Preuzmite obrađen fajl.

---

## 🏗️ Za Developere

Projekat je Open Source (MIT).

### Tehnologije

-   **Frontend:** TypeScript, Fluent UI (CSS Variables)
-   **Core:** Rust, FST (Finite State Transducers), Aho-Corasick, WASM
-   **Build:** Webpack 5, Cargo
-   **Test:** Vitest, Playwright (E2E)

### Lokalno pokretanje

```bash
# 1. Instaliraj zavisnosti
npm ci

# 2. Pokreni dev server (automatski kompajlira Rust)
npm start
```
