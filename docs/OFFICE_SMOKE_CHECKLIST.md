# Office Smoke Checklist — Serbian Transliterator (Release Safety)

Cilj: potvrdi da je add-in “store/enterprise safe” pre objave i da radi konzistentno u:

- Word Desktop (Windows / WebView2)
- Word on the web (Office.com)
- Web mode (standalone/PWA stil)

Ovaj checklist je namerno “dosadan”: pokriva tipične probleme gde add-in radi lokalno,
ali padne u Office hostu zbog CSP/headers, cache-a, SW-a, ili Office runtime razlika.

---

## A) Pre-check (pre testiranja)

### A1) Čist build + testovi (mora biti zeleno)

1. Pokreni full gate:
    - `pnpm run verify:all`
2. Ako radiš “brži” set, minimum:
    - `pnpm run build`
    - `pnpm run test:coverage`
    - `pnpm run test:e2e`

**Expected:**

- 0 ESLint warnings (ako koristite `--max-warnings 0`)
- typecheck PASS
- tests PASS

### A2) Manifest i hosting (prod)

1. Proveri da `manifest.prod.xml` koristi HTTPS URL-ove, npr:
    - `https://serbiantransliterator.pages.dev/...`
2. Proveri da su svi resursi (taskpane, commands, icons) dostupni i nisu 404.

### A3) Headers / CSP (prod)

1. Proveri `src/static/_headers` (Cloudflare Pages) i da prod deploy stvarno isporučuje te headere.
2. CSP treba da bude deny-by-default, ali da omogućava:
    - učitavanje Office add-in iframe-a u Office hostovima (`frame-ancestors`)
    - web worker(e) ako ih koristiš (`worker-src`)
    - WASM instanciranje (najbolje preko `script-src 'wasm-unsafe-eval'`)

**Preporučeni minimum (primer; prilagodi realnim domenima/putanjama):**

- `Content-Security-Policy`:
    - `default-src 'none'`
    - `script-src 'self' 'wasm-unsafe-eval'` _(preferiraj ovo umesto `'unsafe-eval'`)_
    - `style-src 'self'` _(+ eventualno font/style domene ako koristiš)_
    - `img-src 'self' data:`
    - `font-src 'self' data:`
    - `connect-src 'self' https://*.office.com https://*.officeapps.live.com https://*.microsoft.com` _(ako Office runtime zahteva)_
    - `frame-src https://*.office.com https://*.officeapps.live.com` _(ako hostuje u iframe-u ili koristi dialog)_
    - `frame-ancestors https://*.office.com https://*.officeapps.live.com https://*.microsoft.com` _(kritično za Word Web)_
    - `worker-src 'self' blob:` _(kritično ako koristiš Web Worker)_
- (preporuka) `Cross-Origin-Opener-Policy: unsafe-none` _(ako ikad koristiš dialog + cross-domain messaging)_
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer` ili `strict-origin-when-cross-origin`

> Napomena: Service Worker često **ne može** da radi u Office iframe kontekstu (Word Web),
> zato SW registracija mora biti “best-effort” i ne sme da ruši UI.

---

## B) Test 1 — Word Desktop (Windows) / Sideload

### B1) Setup

1. Pokreni dev:
    - `pnpm run dev`
      (webpack dev-server + sideload u Word)
2. Proveri da Word Desktop koristi Edge WebView2 (ako je relevantno u tvom setup-u).

### B2) Test dokument (priprema)

Otvori dokument koji sadrži:

- mešano: latinica + ćirilica
- URL + email
- NBSP + više razmaka
- “CODE” stil (ako koristiš ignoredStyles)
- bar 2–3 pasusa + jedan kratak pasus (za selekciju)

### B3) Smoke scenariji

1. Otvori task pane
    - Expected: UI se učita, nema blank pane-a
2. Convert selection
    - selektuj 2–3 pasusa → preslovi
    - Expected: rezultat primenjen, format očuvan koliko je planirano
3. Preview flow
    - Preview → Diff mode → toggle reject/accept → Apply
    - Expected: apply radi, status poruke konzistentne, bez exception-a
4. Cancel / Abort (Esc)
    - tokom obrade pritisni ESC
    - Expected: “Cancelled”/otkazano stanje, nema zaglavljenog “busy”
5. Offline sanity
    - isključi mrežu (ili “Offline” u DevTools) i pokušaj core transliteration
    - Expected: core transliteration radi (nema zavisnosti od mreže za konverziju)

### B4) Fail simptomi (Desktop)

- task pane blank / ne učitava se
- Office.js error u konzoli
- CSP errors (npr. “Refused to load … due to CSP”)
- worker/WASM ne radi (compile/instantiate blokiran)

---

## C) Test 2 — Word on the web (Office.com)

### C1) Setup

1. Okači/otvori Word dokument u Office.com
2. Deploy/sideload add-in (u skladu sa tenant/admin setup-om)

### C2) Smoke scenariji (isti kao Desktop)

1. Otvori task pane
2. Convert selection
3. Preview + Apply

### C3) Najčešći problemi u Word Web

- `frame-ancestors` previše strict → iframe blokiran
- `connect-src` previše strict → Office runtime pokušava mrežne zahteve
- caching/stare verzije (posebno HTML) → potrebno: no-cache za HTML + hashed assets

> Napomena: SW u Office web iframe-u obično neće raditi; to je OK sve dok UI radi bez SW-a.

---

## D) Test 3 — Web mode (taskpane.html?mode=web)

### D1) Setup

1. Otvori u browseru:
    - `https://serbiantransliterator.pages.dev/taskpane.html?mode=web`

### D2) Smoke scenariji

1. Paste rich text u clipboard sekciju
    - paste iz Word-a / web stranice
    - Expected: format se “uglavnom” očuva, ali bez XSS
2. Convert text (DOM transliteration)
3. Copy
    - Expected: kopira i HTML i plain text (ako to podržavaš)
4. Drop .docx (mali, npr. 200KB)
    - Expected: generiše `PRESLOVLJENO_*.docx`
5. Limit test
    - ubaci ogroman .docx (npr. >5MB)
    - Expected: jasna poruka tipa “Document too large (5MB limit)” (ili vaša lokalizovana poruka)

### D3) Update UX (SW + banner + Ctrl+K)

1. Trigger update (deploy nova verzija) i potvrdi:
    - banner se pojavi kada je waiting SW spreman
    - command palette (Ctrl+K) ima “Update: refresh now”
    - “Refresh now” radi samo kad aplikacija nije “busy”

---

## E) CSP / Headers verifikacija (šta tačno gledati)

### E1) Response Headers

U Web mode-u (browser devtools → Network → response headers):

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Cross-Origin-Opener-Policy` (ako je postavljeno)
- (ako koristiš caching strategiju) `Cache-Control` (posebno za HTML)

### E2) Console

Ne smeš imati CSP violations tipa:

- `Refused to execute inline script...` _(ne bi trebalo da ima inline script)_
- `Refused to compile or instantiate WebAssembly...`
- `Refused to create a worker...` _(ako koristiš worker; treba `worker-src 'self' blob:`)_

---

## F) Ako nešto pukne (fallback procedura)

### F1) WASM blokiran zbog CSP

**Symptom:**

- greške tipa “WebAssembly compilation blocked by CSP”

**Akcija (preporučeni redosled):**

1. Dodaj u CSP `script-src` direktivu: `'wasm-unsafe-eval'`
2. Retest u:
    - Word Desktop
    - Word Web
    - Web mode

> Tek ako baš mora (i ako ti policy/Store to dozvoljava), razmotri `'unsafe-eval'`,
> ali to je obično “enterprise/store red flag”.

### F2) Dialog messaging / error 12006 (ako ikad koristiš Office dialog)

**Akcija:**

- potvrdi da response header nije `Cross-Origin-Opener-Policy: same-origin`
- preporuka: `Cross-Origin-Opener-Policy: unsafe-none`
- ili drži add-in i dialog na istom domenu

### F3) “Stara verzija” u Office hostu (cache problem)

**Akcija:**

- HTML (taskpane/commands) treba da bude no-cache ili bar revalidating
- statički asseti treba da budu hashed + long-cache
- update flow treba da bude user-safe (ne reload tokom “busy”)

---

## G) Evidence (šta sačuvati pre release-a)

- screenshot/zip console output: `verify-all` PASS
- link ka coverage HTML reportu
- Word Desktop: screenshot da task pane radi + preview/apply
- Word Web: screenshot da preview/apply radi
- Web mode: screenshot update bannera + command palette “Update: refresh now”
- (opciono) snimak CSP headers (Network tab) i “Console clean” screenshot

---

Kriterijum za release: sve tri platforme prolaze smoke bez CSP/Office.js grešaka i bez regressions u preview/apply/cache.
