# 🛠️ INTERNAL ISSUE TRACKER & TECHNICAL DEBT REGISTRY — v1.0.0-dev (REV 2026-02-10)

Ovaj dokument služi kao primarni registar svih identifikovanih sistemskih ograničenja, tehničkog duga i planiranih ispravki.

Fokus: prelazak sa “Functional” na “Bulletproof” stabilnost (Faza 2: Hardening)  
Identitet pipeline-a: 🛡️ MAX1 Guardian

Napomena o izvoru istine:
- Statusi “REŠENO” su validni samo ako prolaze lokalni MAX1 strict gate (verify:all:strict) i testovi ne flakuju.
- Svaka stavka mora imati: vlasnika (owner), definiciju “done”, i test/metric koji potvrđuje fix.


============================================================
🟢 RESOLVED / REŠENO (Phase 2 Hardening)
============================================================

1) Worker Lifecycle & Panic Recovery (Self-Healing)
Status: ✅ REŠENO (v1.0.0-dev)
Lokacija: Worker client / supervisor pattern (taskpane + web pipeline)
Definicija “done”:
- worker crash/panic se detektuje
- worker se re-spawn-uje
- job se re-queue-uje ili se aktivira fallback bez gubitka UI state-a
Dokaz:
- unit test / integration smoke koji simulira worker fail + retry (mora da bude determinističan)

2) Digraph Ambiguity in Bridge Logic
Status: ✅ REŠENO (v1.0.0-dev)
Lokacija: bridge lexical pass (digraphs)
Definicija “done”:
- spajanje n|j, l|j radi samo kad kontekst to dozvoljava
- nema lažnih spojeva na granicama run-ova / čvorova
Dokaz:
- ooxml fuzz + targeted regression fixtures (split runs)

3) Mutex Overhead in Rust Core
Status: ✅ REŠENO (v7.6 optimization)
Lokacija: Rust core caching
Definicija “done”:
- global mutex eliminisan iz hot path-a
- cache je per-worker/per-instance, bez contention-a
Dokaz:
- perf micro-bench + profiling (CPU time drop, throughput stable)

4) Legacy Labeling (GOD1 → MAX1)
Status: ✅ REŠENO (Branding Sync)
Definicija “done”:
- svi logovi, docs, pipeline koraci koriste MAX1 naziv
Dokaz:
- repo grep gate: “GOD1” ne postoji (osim u istoriji)


============================================================
🔴 CRITICAL: MEMORY & PERFORMANCE (Priority: P0)
============================================================

5) DOMParser Memory Bloat (“RAM Wall”)
Status: 🔴 OPEN (P0)
Opis:
- DOMParser/DOM build pravi eksploziju memorije na velikim OOXML part-ovima (100MB+).
- Rezultat: peak RAM u stotinama MB, potencijalni crash/kill taba.

Trenutna mitigacija:
- Adaptive chunking (ograničava UI stutter, ali ne rešava DOM memory wall).

Zadatak (target v1.1.x):
- Rust streaming pull-parser (quick-xml) unutar WASM-a.
- JS šalje bytes/chunk-ove, Rust procesira “u letu” i vraća modifikovane bytes.

Cilj:
- O(1) memory complexity u odnosu na input size (bounded buffers)
- peak RAM < ~50MB (cilj) u realnim velikim dokumentima

Safety rails (MUST):
- limit na dubinu XML-a (anti-DoS)
- limit na veličinu token buffer-a
- limit na maksimalan broj run-ova/čvorova po chunk-u
- “fail closed” ponašanje: ako parser detektuje ekstremno ugnježdenje ili prevelike tokene, prekini sa jasnom greškom (ne hang)

Definition of Done (DoD):
- streaming parser pokriva WordprocessingML tokene: w:p, w:r, w:t, w:tab, w:br, w:cr
- bridging logika i dalje čuva stilove/run boundaries
- regression suite: existing fixtures + new large-doc fixtures
- perf bench: memory i throughput upoređen sa v1.0.0 baseline


============================================================
🟡 HIGH PRIORITY: UX & INTEGRATION (Priority: P1)
============================================================

6) WebView2 Office Theme Sync Failure (Windows)
Status: 🟡 OPEN (P1)
Opis:
- promena teme (Light/Dark) se ne propagira real-time u Taskpane na nekim Windows buildovima.

Zadatak:
- polling (svakih ~2s) nad Office.context.officeTheme ili refresh na window.focus
- low-impact: polling samo dok je taskpane vidljiv/focused

DoD:
- theme switch radi u realnim Word Desktop scenarijima
- ne uvodi stutter (polling minimalan)
- unit test: mock Office.context.officeTheme + time-based update (vitest fake timers)

7) State Persistence (Recovery after Close)
Status: 🟡 OPEN (P1)
Opis:
- zatvaranje taskpane-a briše UI state (stats, filteri “Zaštićeno”, izbori).

Zadatak:
- sessionStorage rehydration za UI state (ne sadržaj dokumenta)
- ograničiti payload (no big blobs)

DoD:
- posle reload/close-open: filteri i poslednje opcije vraćene
- reset mehanizam postoji
- test: state serialize/deserialize + schema versioning


============================================================
🟢 MEDIUM PRIORITY: LOGIC & TOOLING (Priority: P2)
============================================================

8) I18n Bloat & Dead Keys
Status: 🟢 OPEN (P2)
Problem:
- dead/orphan keys u sr.ts i en.ts povećavaju noise i otežavaju održavanje.

Zadatak:
- integrisati i18n dead-key check u verify-all (ako već nije)
- obrisati orphan keys
- razlikovati:
  - ključeve iz TS koda
  - ključeve iz HTML template-ova (EJS)
  - runtime format stringove

DoD:
- gate koji je stabilan (bez false positives)
- smanjen broj dead keys
- dokumentovan proces dodavanja novih ključeva

9) Custom Subs Separator Validation
Status: 🟢 OPEN (P2)
Opis:
- korisnici unesu “->” unutar reči i time lome parser custom substitutions.

Zadatak:
- validacija UI-a (subsUi) + jasna poruka korisniku
- opcije:
  - zabraniti “->” u left/right tokenima
  - ili uvesti escape (npr. \->) i de-escape u parseru

DoD:
- unosi koji bi slomili parser više ne prolaze tiho
- testovi: parseCustomSubstitutions + UI validation


============================================================
⚪ LOW PRIORITY: POLISH (Priority: P3)
============================================================

10) Large File Fuzzing
Status: ⚪ OPEN (P3)
Zadatak:
- proširiti fuzz ooxml generator da pravi:
  - ekstremno velike XML part-ove
  - duboko ugnježdene strukture (npr. nested content controls)
- cilj: testirati limite parsera i safety rails

DoD:
- fuzz testovi reproducible (seed logged)
- jasno definisani limiti (max depth, max token)


============================================================
📋 BACKLOG ZA VERZIJU 1.1.x (Summary)
============================================================

[ ] Rust Streaming Engine (quick-xml) — P0
[ ] Theme Polling / Focus refresh — P1
[ ] UI State Rehydration (sessionStorage) — P1
[ ] I18n Cleanup + gate hardening — P2
[ ] Custom substitutions validation/escaping — P2
[ ] Office.js hardening docs:
    - “best-effort selection” (ne sme da ruši testove/mokove)
    - dokumentovati razliku između ClientResult.value i load(...) objekata — P2


============================================================
META
============================================================

Generated: 2026-02-07 02:50
Last revised: 2026-02-10
Architect: Senior Rust/TypeScript Architect
