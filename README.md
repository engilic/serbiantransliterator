# Serbian Transliterator (v1.0.0)

**Status:** 🟢 Phase 2: Hardening (Pipeline: **MAX1 Guardian**)  
**Codename:** "The Neural Frontier"

Najbrži i najsigurniji način za preslovljavanje ćirilice i latinice u Microsoft Word-u i na webu. Pokretan ekstremno brzim **Rust** jezgrom preko **WebAssembly** tehnologije.

---

## 🚀 Ključne Karakteristike (v1.0.0 Hardened)

- **100% Privatno & Offline:** Tekst se obrađuje isključivo u memoriji vašeg uređaja. Podaci nikada ne napuštaju Word host ili browser.
- **Hybrid Core Engine:** Rust + WASM omogućavaju obradu brzinom od preko 18,000 reči u sekundi.
- **Pametni "Bridge" Sloj:** Jedinstvena tehnologija koja prepoznaje i štiti reči, linkove i brendove čak i kada ih Microsoft Word nasumično razbije kroz više XML čvorova.
- **Samoisceljujući Workeri:** Supervisor arhitektura automatski restartuje pozadinske procese u slučaju greške, osiguravajući neprekidan rad.
- **Adaptivni Chunking:** Sistem dinamički prilagođava veličinu paketa teksta performansama vašeg računara kako bi Word interfejs ostao fluidan tokom obrade ogromnih dokumenata.

### 🛡️ Inteligentna Zaštita

- **Brand Guard:** Automatska zaštita za hiljade tehnoloških brendova (Windows, iPhone, Microsoft...).
- **Context Aware:** Prepoznaje razliku između brenda i obične reči (npr. _iPhone Pro_ vs _prosečan_).
- **Code Protection:** Tekst unutar Markdown koda (backticks) ili specifičnih Word stilova se ne dira.
- **URI & Paths:** URL-ovi, e-mail adrese i Windows/Unix putanje ostaju netaknute.

---

## 🌍 Web Režim (PWA)

Aplikacija radi kao samostalni batch processor u browseru:

👉 [serbiantransliterator.pages.dev](https://serbiantransliterator.pages.dev)

- **DOCX Batch Mode:** Prevucite više `.docx` fajlova odjednom i preslovite ih lokalno.
- **PWA Podrška:** Instalirajte aplikaciju na desktop ili mobilni telefon za brz pristup bez interneta.

---

## 🛠️ Razvoj i Instalacija (Za Developere)

### Okruženje

- **Runtime:** Node.js 22.x (LTS)
- **Engine:** Rust (Stable) + wasm-pack
- **Package Manager:** pnpm
- **Shell:** PowerShell 7 (preporučeno)

### Početak rada

1. Instalirajte zavisnosti:

    pnpm install

2. Izgradite WASM jezgro:

    pnpm run build:wasm

3. Pokrenite lokalni dev server:

    pnpm start

### MAX1 Guardian (Kvalitet koda)

Pre svakog commit-a, obavezno pokrenite verifikaciju:

    pnpm run verify:all

---

## ⚖️ Napomena o Beta Funkcionalnostima

Opcija "Ekavica ↔ Ijekavica" koristi morfološke rečnike i smatra se beta funkcionalnošću. Preciznost zavisi od kompleksnosti i konteksta ulaznog teksta.

---

© 2026 Jugoslav Ilić. Izgrađeno uz fokus na suverenitet jezika i digitalnu privatnost.
