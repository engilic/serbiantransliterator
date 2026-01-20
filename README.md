# Serbian Transliterator

Word Office.js Taskpane Add-in za preslovljavanje srpskog teksta između **latinice ↔ ćirilice** direktno u Microsoft Word dokumentu (selekcija ili ceo dokument).

**Production:** https://serbiantransliterator.pages.dev  
**Repo:** https://github.com/engilic/serbiantransliterator

---

## Features (ukratko)

- **Preslovljavanje:** Auto, Lat → Ćir, Ćir → Lat, Ošišana latinica
- **Dijalekti (NOVO):** Konverzija Ekavica ↔ Ijekavica (beta) uz pomoć Rust/WASM engine-a.
- **Zaštita tokena:** URL, e-mail, `mailto:`, `tel:`, `sip:`, `sms:`, `geo:`, `skype:`, `teams:`, `msteams:`
- **Zaštita “brend” reči** i tehnoloških termina (npr. `iPhone`, `.NET`, `Node.js`) + user “protected words”
- **Custom Substitutions:** Korisnički definisana pravila za zamenu.
- **OOXML bridging:** Pametno spajanje teksta preko `<w:t>` granica (tokeni, linkovi, fraze, digrafi).
- **Preview:** Diff / pre-posle / rezultat + “apply from preview” uz cache i hash.
- **Teme:** Light / Dark / Auto.
- **Opciona obrada:** Header/footer, footnotes, endnotes.
- **i18n:** UI na srpskom i engleskom.

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

- **Node.js** (preporučeno: Node 20+, usklađeno sa CI)
- **Rust & Cargo** (neophodno za kompajliranje core logike)
    - Windows: `winget install Rustlang.Rustup` i Visual Studio Build Tools (`winget install Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"`)
    - Mac/Linux: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **wasm-pack**: `cargo install wasm-pack`
- PowerShell 7 (`pwsh`) (opciono, za neke skripte)

### Install

```sh
npm ci
```
