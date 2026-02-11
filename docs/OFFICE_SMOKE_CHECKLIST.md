# 🚭 OFFICE SMOKE CHECKLIST — v1.0.1 (RELEASE SAFETY)

---

**Project:** Serbian Transliterator (Universal Engine)
**Standard:** MAX1 Guardian Hardening (v1.0.0+)
**Goal:** Potvrdi da je add-in “Store & Enterprise Safe” pre nego što stigne do korisnika na produkciji.

# ☢️ A // PRE-CHECK (VERIFIKACIJA OKRUŽENJA)

---

Pre početka bilo kakvog manuelnog testiranja, sistem mora proći rigoroznu automatizovanu torturu.

**A1) Clean Slate Integrity**

- Working tree mora biti savršeno čist (`git status`).
- Očistite sve stare artefakte i keš: `PS> pnpm run clean`.

**A2) MAX1 Guardian (Total Verification)**
Obavezno pokrenite totalnu verifikaciju. Izveštaj mora biti bez ijednog warninga.
`PS> pnpm run verify:all`

**A3) A11y Contrast Verification**

- Potvrdite vizuelno da je primarna plava boja promenjena na `#005a9e`.
- Proverite da li Playwright testovi u `tests-e2e/a11y.spec.ts` prolaze bez "color-contrast" prekršaja.

**A4) Headers & CSP Sanity**
Proverite `src/static/_headers` fajl:

- `Content-Security-Policy` mora dozvoliti WASM instanciranje (`script-src 'unsafe-eval'`).
- `frame-ancestors` mora dozvoliti `https://*.office.com` i ostale Microsoft domene.
- `X-Content-Type-Options: nosniff` mora biti prisutan radi zaštite od MIME sniffing napada.

# 🖥️ B // TEST 1 — WORD DESKTOP (WINDOWS)

---

**B1) Setup**
`PS> pnpm run dev` (Pokreće dev-server i Sideload u Word Desktop).

**B2) Smoke Scenariji**

1. **Startup Speed:** Skeleton ekran mora nestati trenutno (0ms delay nakon `onReady`).
2. **Context-Aware Translit:** Selektujte pasus koji sadrži reč "iPhone Pro" napisanu pola bold, pola normal.
    - _Očekivanje:_ Brend ostaje zaštićen, a Word formatiranje ostaje netaknuto.
3. **Interactive Diff:**
    - Pokrenite _Preview_.
    - Manuelno odbijte (Reject) jednu promenu u Diff prozoru.
    - Kliknite _Apply_.
    - _Očekivanje:_ Dokument se menja tačno prema stanju iz Diff prozora.
4. **Abort Logic:** Pokrenite konverziju celog dokumenta (50+ strana) i pritisnite `ESC`.
    - _Očekivanje:_ Status se menja u "Cancelled", bez delimičnih izmena u tekstu.

# 🌐 C // TEST 2 — WORD ON THE WEB (OFFICE.COM)

---

**C1) Cloud Verifikacija**

1. **CSP Instantiation:** Otvorite konzolu i potvrdite da nema fatalnih grešaka tipa "Refused to instantiate WebAssembly".
2. **Dark Mode Reaction:** Prebacite Word Web u Dark Mode. Add-in mora detektovati promenu (preko focus-a) i primeniti tamne varijable.
3. **Service Worker:** Potvrdite da se aplikacija učitava čak i ako se mreža simulira kao "Slow 3G" bez pucanja WASM modula.

# 🌍 D // TEST 3 — WEB APP MODE (STANDALONE)

---

**D1) PWA & Batch Hardening**

1. **DOCX Drop:** Prevucite 10+ različitih DOCX fajlova u Files panel.
2. **Parallel Processing:** Potvrdite da se procesiranje odvija paralelno i da progress bar ne "secka".
3. **Download Loop:** Preuzmite rezultate. Proverite da li su nazivi fajlova ispravno formatirani (npr. `PRESLOVLJENO_ime.docx`).
4. **Offline Toggle:** Kliknite na WiFi ikonu u headeru. Pokrenite konverziju teksta. Sve mora raditi (Air-gap potvrda).

# 🏆 G // FINAL EVIDENCE COLLECTION

---

Pre objave, arhivirajte sledeće dokaze:

1. `verify-all` FINAL REPORT iz terminala (sa "🏆 VERIFY PASSED!").
2. Screenshot `pnpm audit` tabele koja pokazuje nula propusta.
3. Potvrdu verzije iz footera (mora se podudarati sa tagom na Gitu).

---

Dokument kreirao: Architecture Team (MAX1) | Poslednja revizija: 2026-02-11
