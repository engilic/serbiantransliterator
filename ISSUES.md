# 🛠️ INTERNAL ISSUE TRACKER & TECHNICAL DEBT REGISTRY — v1.0.0-dev

Ovaj dokument služi kao primarni registar svih identifikovanih sistemskih ograničenja, tehničkog duga i planiranih ispravki.

**Fokus:** Prelazak sa "Functional" na "Bulletproof" stabilnost (Faza 2: Hardening).  
**Identitet Pipeline-a:** 🛡️ MAX1 Guardian

---

## 🟢 RESOLVED / REŠENO (Phase 2 Hardening)

### 1) Worker Lifecycle & Panic Recovery (Self-Healing)

- **Status:** ✅ REŠENO (v1.0.0-dev)
- **Implementacija:** Uveden supervisor pattern unutar `WorkerClient.ts`. Klijent sada automatski detektuje pad workera, re-inicijalizuje WASM i re-queuje in-flight zadatke.

### 2) Digraph Ambiguity in Bridge Logic

- **Status:** ✅ REŠENO (v1.0.0-dev)
- **Implementacija:** Unapređena heuristika u `digraphs.ts`. Spajanje karaktera (npr. `n` | `j`) sada proverava leksički kontekst i eliminiše lažne pogrešne spojeve na granicama čvorova.

### 3) Mutex Overhead in Rust Core

- **Status:** ✅ REŠENO (v7.6 Optimization)
- **Implementacija:** Migrirano sa globalnog `Mutex` na `thread_local!` storage unutar Rust koda. Pristup rečnicima i kešu reči sada ima nultu latenciju (zero-lock architecture).

### 4) Legacy Labeling (GOD1 -> MAX1)

- **Status:** ✅ REŠENO (Branding Sync)
- **Implementacija:** Svi sistemski natpisi, logovi i CI workflow koraci su prebačeni na **MAX1** standard.

---

## 🔴 CRITICAL: MEMORY & PERFORMANCE (Priority: P0)

### 5) DOMParser Memory Bloat (The "RAM Wall")

- **Opis:** Trenutna implementacija koristi browser-native `DOMParser`. Za dokumente od 100MB+, RAM može skočiti na 800MB+ zbog V8 mapiranja čvorova.
- **Privremeno rešenje:** Adaptive Chunking (procesiranje po dinamičkim grupama paragrafa).
- **Zadatak:** Implementacija **Rust Streaming Pull-Parsera** koristeći `quick-xml`.
- **Cilj:** O(1) memory complexity; potrošnja <50MB RAM bez obzira na veličinu fajla.

---

## 🟡 HIGH PRIORITY: UX & INTEGRATION (Priority: P1)

### 6) WebView2 Office Theme Sync Failure

- **Opis:** Promena sistemske teme (Light/Dark) se ne propagira u Taskpane u realnom vremenu na Windows Desktopu.
- **Zadatak:** Uvesti polling mehanizam (svaka 2s) nad `Office.context.officeTheme` ili osvežavanje na `window.focus`.

### 7) State Persistence (Recovery after Close)

- **Opis:** Zatvaranje Taskpane-a briše trenutnu statistiku i izabrane filtere u "Zaštićeno" sekciji.
- **Zadatak:** Implementirati `sessionStorage` sinhronizaciju za `AppState` (AppState Rehydration).

---

## 🟢 MEDIUM PRIORITY: LOGIC & TOOLING (Priority: P2)

### 8) I18n Bloat & Dead Keys

- **Problem:** Postoji značajan broj neiskorišćenih ključeva u `sr.ts` i `en.ts`.
- **Zadatak:** Integrisati `scripts/checkI18nKeys.cjs` u `verify-all.js` pipeline i obrisati "orphan" ključeve.

### 9) Custom Subs Separator Validation

- **Opis:** Korisnici ponekad unose `->` unutar reči u "Sopstvenim zamenama", što kvari podelu na izvor/cilj.
- **Zadatak:** Dodati regex validaciju u `subsUi.ts` koja sprečava ili escape-uje separator unutar stringa.

---

## ⚪ LOW PRIORITY: POLISH (Priority: P3)

### 10) Large File Fuzzing

- **Zadatak:** Proširiti `fuzz/ooxml.fuzz.test.ts` da generiše ekstremno velike i duboko ugnježdene XML strukture (npr. Nested Content Controls) radi testiranja limita parsera.

---

## 📋 BACKLOG ZA VERZIJU 1.1.0 (Summary)

- [ ] **Rust Streaming Engine:** Integracija `quick-xml` (P0)
- [ ] **Theme Polling:** Rešavanje Dark Mode laga (P1)
- [ ] **Persistence:** Rehidratacija stanja iz `sessionStorage` (P1)
- [ ] **I18n Cleanup:** Uklanjanje mrtvog koda iz lokalizacije (P2)

---

Generated: 2026-02-07 02:50 | Architect: Senior Rust/TypeScript Architect
