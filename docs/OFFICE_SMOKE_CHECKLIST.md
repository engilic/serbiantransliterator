# Office Smoke Checklist — Serbian Transliterator (Release Safety)

Cilj: potvrdi da je add-in "store/enterprise safe" pre objave (Word Desktop + Word Web + Web Mode).

Ovaj checklist je namerno "dosadan": pokriva najčešće situacije gde add-in radi lokalno,
ali padne u Office hostu zbog CSP/headers, cache-a, ili Office runtime razlika.

---

## A) Pre-check (pre testiranja)

1. Uveri se da radiš na čistom build-u:
    - `pnpm run verify:all`
    - ili bar:
        - `pnpm run build`
        - `pnpm run test:coverage`
        - `pnpm run test:e2e`

2. Proveri hosting (prod):
    - `manifest.prod.xml` koristi HTTPS URL-ove na `https://serbiantransliterator.pages.dev/...`

3. Proveri `_headers`:
    - `src/static/_headers` mora da sadrži:
        - `Content-Security-Policy` (deny-by-default)
        - `frame-ancestors` koji dopušta Office hostove
        - (preporuka) `Cross-Origin-Opener-Policy: unsafe-none` (ako ikad koristiš dialog API cross-domain)

---

## B) Test 1 — Word Desktop (Windows) / Sideload

### Setup

1. Pokreni dev:
    - `pnpm run dev`
      (ovo radi webpack dev-server + sideload u Word)

### Smoke scenariji

1. Otvori Word dokument sa:
    - latinica + ćirilica (mešano)
    - URL + email
    - NBSP + više razmaka
    - tekst “CODE” stilom (ako koristiš ignoredStyles)
2. Klikni add-in dugme -> task pane
3. Test: Convert selection
    - selektuj 2-3 pasusa, preslovi
4. Test: Preview
    - Preview -> Diff mode -> toggle reject/accept -> Apply
5. Test: Cancel / Abort (Esc)
    - tokom obrade pritisni ESC, očekuješ “Cancelled”
6. Test: “offline” poruka (ako isključiš mrežu)
    - UI može da pokaže “offline” status, ali core transliteration treba da radi.

### Fail simptomi

- add-in se ne učitava (blank)
- Office.js error u konzoli
- CSP errors (Refused to load … due to Content Security Policy)

---

## C) Test 2 — Word on the web (Office.com)

### Setup

1. Okači/otvori Word dokument u Office.com
2. Sideload/Deploy add-in (zavisi od tvog tenant/admin setup-a)

### Smoke scenariji (isti kao Desktop)

1. Otvori task pane
2. Convert selection
3. Preview + Apply
4. Web-mode link (ako ga imaš) nije bitan ovde, ali add-in core mora da radi

### Najčešći problemi u Word Web

- CSP “connect-src” previše strict (Office runtime ponekad zahteva konekciju ka Microsoft domenima)
- `frame-ancestors` nedovoljan
- caching (stare verzije) ako nema hash fajlova + no-cache html + update-safe SW

---

## D) Test 3 — Web mode (taskpane.html?mode=web)

### Setup

1. Otvori u browseru:
    - `https://serbiantransliterator.pages.dev/taskpane.html?mode=web`

### Smoke scenariji

1. Paste rich text u clipboard sekciju:
    - paste iz Word-a / web stranice
    - očekuj da se format “uglavnom” očuva, ali bez XSS
2. Convert text (DOM transliteration)
3. Copy:
    - proveri da kopira i HTML i plain text
4. Drop .docx:
    - mali docx (npr. 200KB)
    - proveri da generiše “PRESLOVLJENO_*.docx”
5. Test: limit:
    - pokušaj ogroman .docx (npr. >5MB) -> očekuješ “Document too large (5MB limit)” ili sličnu poruku

---

## E) CSP / Headers verifikacija (šta tačno gledati)

1. Otvori Developer Tools u browseru (Web mode) i proveri Response Headers za:
    - `Content-Security-Policy`
    - `X-Content-Type-Options`
    - `Referrer-Policy`
    - `Cross-Origin-Opener-Policy` (ako je postavljeno)

2. U Console:
    - ne smeš imati CSP violations tipa:
        - `Refused to execute inline script...` (ne bi trebalo da ima inline script)
        - `Refused to compile or instantiate WebAssembly...` (ako se desi, CSP treba da dopusti WASM)

---

## F) Ako nešto pukne (fallback procedura)

### 1) Ako WASM ne radi zbog CSP

Symptom:

- greške tipa “WebAssembly compilation blocked by CSP”

Akcija:

- u `_headers` privremeno promeni `script-src` da uključi `'unsafe-eval'` (samo ako mora)
- retest u Word Web + Desktop

### 2) Ako Office dialog ikad bude korišćen i messaging padne (error 12006)

Akcija:

- potvrdi da response header nije `Cross-Origin-Opener-Policy: same-origin`
- preporuka: postavi `Cross-Origin-Opener-Policy: unsafe-none`
- ili drži add-in i dialog na istom domenu

---

## G) Evidence (šta sačuvati pre release-a)

- screenshot/zip Console output: verify-all PASS
- link ka coverage HTML reportu
- Word Desktop: screenshot da task pane radi
- Word Web: screenshot da preview/apply radi
