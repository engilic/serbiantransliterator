# Serbian Transliterator (v1.0.0)

Status: 🟢 Phase 2 — Hardening (Pipeline: MAX1 Guardian)  
Codename: “The Neural Frontier”

Najbrži i najsigurniji način za preslovljavanje ćirilice i latinice u Microsoft Word-u i na webu. Pokretan ekstremno brzim Rust jezgrom preko WebAssembly (WASM) tehnologije.

---

## 🚀 Ključne karakteristike (v1.0.0 Hardened)

- 100% privatno & offline  
  Tekst se obrađuje lokalno (u memoriji vašeg uređaja). Sadržaj dokumenata ne napušta Word host ili browser.

- Hybrid Core Engine (Rust + WASM)  
  Visok throughput uz determinističan rad i offline-first pristup.

- Pametni “Bridge” sloj (OOXML intent-preserving)  
  Štiti i rekonstruiše “razbijene” tokene koje Word često podeli u više XML run-ova (npr. brendovi, linkovi, digrafi), pa ih vraća bez gubitka stilova.

- Samoisceljujući workeri (Supervisor pattern)  
  Pozadinska obrada je izolovana u Worker-ima; sistem je dizajniran da se oporavi od worker crash/panic scenarija bez gubitka posla.

- Adaptivni chunking (UI ostaje fluidan)  
  Batch veličina se prilagođava realnim performansama uređaja kako bi UI ostao responzivan i u velikim dokumentima.

---

## 🛡️ Inteligentna zaštita (Protection Layer)

- Brand Guard  
  Automatska zaštita za tehnološke brendove i izraze koji treba da ostanu u originalu (npr. Windows, iPhone, Microsoft…).

- Context-aware zaštita  
  Razlikuje brend/sufiks u kontekstu (npr. “iPhone Pro”) od obične upotrebe reči.

- Code protection  
  Ne dira tekst u code blokovima (backticks) i/ili u definisanim Word stilovima (kada je uključeno).

- URI & paths integrity  
  URL-ovi, email adrese i Windows/Unix putanje ostaju netaknute.

---

## 🌍 Web režim (PWA)

Aplikacija radi kao samostalni batch processor u browseru.

Serbian Transliterator Web: serbiantransliterator.pages.dev

Mogućnosti:

- DOCX batch mode: prevuci više .docx fajlova odjednom i preslovi ih lokalno
- PWA podrška: instalacija za offline-first korišćenje i brz pristup

---

## 🛠️ Razvoj i instalacija (za developere)

### Okruženje

- Runtime: Node.js 22.x (via Volta preporučeno)
- Engine: Rust (stable) + wasm-pack
- Package manager: pnpm
- Shell: PowerShell 7 (preporučeno)

### Početak rada

1. Instaliraj zavisnosti:
   pnpm install

2. Izgradi WASM jezgro:
   pnpm run build:wasm

3. Pokreni lokalni dev server:
   pnpm start

### MAX1 Guardian (kvalitet koda)

Pre svakog commit-a, obavezno pokreni verifikaciju:
pnpm run verify:all

---

## ⚖️ Napomena o beta funkcionalnostima

Opcija “Ekavica ↔ Ijekavica” koristi morfološke rečnike i smatra se beta funkcionalnošću. Preciznost zavisi od kompleksnosti i konteksta ulaznog teksta.

---

© 2026 Jugoslav Ilić. Izgrađeno uz fokus na suverenitet jezika i digitalnu privatnost.
