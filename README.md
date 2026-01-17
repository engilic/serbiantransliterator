# Serbian Transliterator

Word Office.js Taskpane Add-in za preslovljavanje srpskog teksta između **latinice ↔ ćirilice** direktno u Microsoft Word dokumentu (selekcija ili ceo dokument).

**Production:** https://serbiantransliterator.pages.dev  
**Repo:** https://github.com/engilic/serbiantransliterator

---

## Features (ukratko)

- Preslovljavanje: **Auto**, **Lat → Ćir**, **Ćir → Lat**, **Ošišana latinica**
- Zaštita tokena: URL, e-mail, `mailto:`, `tel:`, `sip:`, `sms:`, `geo:`, `skype:`, `teams:`, `msteams:`
- Zaštita “brend” reči i tehnoloških termina (npr. `iPhone`, `.NET`, `Node.js`) + user “protected words”
- OOXML bridging preko više `<w:t>` čvorova (tokeni, linkovi, fraze, digrafi, `{PLACEHOLDER}` blokovi)
- Preview: diff / pre-posle / rezultat + “apply from preview” uz cache i hash (text + OOXML)
- Opciona obrada: header/footer, footnotes, endnotes (best-effort, uz feedback)
- i18n: UI tekstovi i statusi centralizovani (taskpane bez hardcoded stringova + CI guard)

---

## Tech stack

- TypeScript
- Office.js (Word Taskpane Add-in)
- Webpack
- Vitest (jsdom) + Playwright (E2E smoke)
- Cloudflare Pages (hosting)

---

## Local development

### Prerequisites

- Node.js (preporučeno: **Node 20**, usklađeno sa CI)
- PowerShell 7 (`pwsh`) je potreban samo za neke lokalne helper skripte (npr. AI pack)

### Install

```sh
npm ci
```
