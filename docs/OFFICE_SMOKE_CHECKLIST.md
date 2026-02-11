# Office Smoke Checklist — Serbian Transliterator (Release Safety) (REV 2026-02-10)

Cilj: potvrdi da je add-in “store/enterprise safe” pre objave (Word Desktop + Word Web + Web Mode).

Ovaj checklist je namerno “dosadan”: pokriva najčešće situacije gde add-in radi lokalno, ali padne u Office hostu zbog CSP/headers, cache-a, ili Office runtime razlika.

============================================================
A) PRE-CHECK (pre testiranja)
============================================================

A1) Clean local state (recommended)

- Radi na čistom working tree (git status mora biti čist ili svesno kontrolisan).
- Po potrebi očisti artefakte:

PS> pnpm run clean

A2) MAX1 verification (pre smoke testova)
Obavezno uradi jedan od ova dva nivoa:

Option 1 (recommended):
PS> pnpm run verify:all

Option 2 (minimum):
PS> pnpm run build
PS> pnpm run test:coverage
PS> pnpm run test:e2e

A3) Hosting sanity (prod)

- manifest.prod.xml mora da koristi HTTPS URL-ove, npr:
  https://serbiantransliterator.pages.dev/...

A4) Headers / CSP sanity

- src/static/\_headers mora da sadrži:
    - Content-Security-Policy (deny-by-default, ali kompatibilan sa Office + WASM)
    - frame-ancestors koji dopušta Office hostove
    - X-Content-Type-Options: nosniff
    - Referrer-Policy (npr. strict-origin-when-cross-origin)
- Ako ikad koristiš Office Dialog API cross-domain:
    - preporuka: Cross-Origin-Opener-Policy: unsafe-none
    - nemoj COOP same-origin ako ti treba cross-window messaging

============================================================
B) TEST 1 — WORD DESKTOP (Windows) / SIDELOAD
============================================================

B0) Setup
PS> pnpm run dev
(Ovo startuje webpack dev-server + sideload u Word)

B1) Smoke scenariji

1. Otvori Word dokument koji sadrži:
    - mešano: latinica + ćirilica
    - URL + email
    - NBSP + više razmaka
    - tekst sa “CODE” stilom (ako koristiš ignoredStyles / code protection)
    - bar jedan pasus sa digrafima (Nj/Lj/Dž) preko run boundary (npr. bold mid-token)

2. Otvori add-in (task pane)

3. Convert selection
    - selektuj 2–3 pasusa
    - preslovi (u izabranom smeru)
    - očekivanje: samo selekcija se menja, stilovi ostaju

4. Preview workflow
    - Preview → Diff mode
    - toggle reject/accept par izmena
    - Apply
    - očekivanje: rezultat odgovara diff stanju

5. Cancel / Abort
    - pokreni obradu većeg dela teksta
    - pritisni ESC ili Cancel
    - očekivanje: “Cancelled”, bez polu-primenjenog stanja

6. Offline scenario (manual)
    - isključi mrežu (ili koristi sistemski offline)
    - očekivanje: UI može pokazati “offline”, ali core transliteration mora da radi (offline-first)

B2) Fail simptomi

- add-in se ne učitava (blank / white screen)
- Office.js error u konzoli
- CSP errors (Refused to load/execute…)
- WASM init error (module not found / instantiate blocked)

B3) Evidence (Desktop)

- screenshot: taskpane prikaz + verzija u footeru
- screenshot/log: Console bez fatal CSP errora
- (ako ima issue) kopiraj full console stack + network errors

============================================================
C) TEST 2 — WORD ON THE WEB (Office.com)
============================================================

C0) Setup

1. Okači/otvori Word dokument u Office.com
2. Deploy/Sideload add-in (zavisi od tenant/admin setup-a)

C1) Smoke scenariji (isti kao Desktop)

1. Otvori task pane
2. Convert selection
3. Preview + Diff toggle + Apply
4. Cancel / Abort (gde je moguće)
5. Proveri da core radi stabilno i da nema “host-only” regressions

C2) Najčešći problemi u Word Web

- connect-src u CSP previše strict (Office runtime ponekad traži Microsoft domene)
- frame-ancestors ne pokriva Office/SharePoint/Outlook hostove (u zavisnosti od embed)
- caching: stara verzija se drži ako manifest 4-part nije bumpovan ili html caching nije pravilno podešen
- service worker update flow: mora biti update-safe (banner + controllerchange reload)

============================================================
D) TEST 3 — WEB MODE (taskpane.html?mode=web)
============================================================

D0) Setup
Otvori u browseru:
https://serbiantransliterator.pages.dev/taskpane.html?mode=web

D1) Smoke scenariji

1. Rich text paste
    - paste iz Word-a i sa web stranice
    - očekivanje: format se uglavnom očuva, ali bez XSS (sanitized)

2. Convert text
    - preslovi plain/rich tekst
    - očekivanje: rezultat je konzistentan sa direction settings

3. Copy
    - proveri copy behavior (plain text + (ako podržano) HTML)
    - očekivanje: nema “clipboard write denied” bez jasne poruke

4. DOCX drop
    - mali .docx (npr. ~200KB)
    - očekivanje: generiše “PRESLOVLJENO\_\*.docx” i download radi

5. Limit test (policy)
    - ogroman .docx (npr. >5MB)
    - očekivanje: jasna poruka “Document too large” (ili ekvivalent), bez crash-a

D2) Evidence (Web mode)

- screenshot: konverzija + rezultat
- screenshot: jobs tabela + download
- console: bez CSP fatal errora, bez WASM init errora

============================================================
E) CSP / HEADERS VERIFIKACIJA (šta tačno gledati)
============================================================

E1) Response headers (Web mode)
U DevTools → Network → (HTML/JS/WASM request) proveri:

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- (po potrebi) Cross-Origin-Opener-Policy
- (po potrebi) Cross-Origin-Embedder-Policy (ako ikad uvedeš COI/SharedArrayBuffer)

E2) Console (CSP/WASM)
Ne smeš imati:

- “Refused to execute inline script…” (ne bi trebalo da ima inline script)
- “Refused to compile or instantiate WebAssembly…” (ako se desi → CSP mora da dopusti WASM)
- “Refused to connect…” (ako connect-src blokira Office/Microsoft domene u Word Web)

E3) Minimalna CSP realnost za WASM
Ako WASM instantiation pada zbog CSP:

- potvrdi da CSP dopušta WebAssembly korišćenje u target host-u
- i da Office.js CDN domen nije blokiran (ako ga koristiš)

============================================================
F) AKO NEŠTO PUKNE (fallback procedura)
============================================================

F1) Ako WASM ne radi zbog CSP
Simptom:

- “WebAssembly compilation blocked by CSP”
- “Refused to compile/instantiate WebAssembly…”

Akcija:

- u \_headers privremeno olabavi script-src (samo ako mora) i retest
- cilj: minimalna relax koja prolazi u Word Desktop + Word Web
- zabeleži finalnu CSP varijantu u docs/ARCHITECTURE.md ili SECURITY.md

F2) Ako Office Dialog ikad bude korišćen i messaging padne (error 12006)
Akcija:

- potvrdi da response header nije Cross-Origin-Opener-Policy: same-origin
- preporuka: Cross-Origin-Opener-Policy: unsafe-none
- ili drži add-in i dialog na istom domenu

============================================================
G) EVIDENCE (šta sačuvati pre release-a)
============================================================

- screenshot/zip Console output: verify-all PASS (lokalno)
- link ili artifact: coverage report (HTML)
- Word Desktop: screenshot da taskpane radi + verzija u footeru
- Word Web: screenshot da preview/apply radi
- Web mode: screenshot (DOCX job + download)
- (ako bilo šta failuje) kopiraj:
    - Console stack trace
    - Network CSP error detalje
    - tačan URL i manifest verziju
