# 🚀 Releasing Serbian Transliterator

Ovaj projekat koristi automatizovan proces za izdavanje novih verzija kako bi se osigurao integritet koda i pravilno osvežavanje keša u Microsoft Word hostu.

---

<<<<<<< Updated upstream
=======
## 📦 Arhitektura Projekta

Projekat ima **dve korisničke aplikacije** koje dele isti engine:

| Komponenta        | Lokacija                                     | Opis                                     |
| ----------------- | -------------------------------------------- | ---------------------------------------- |
| **Office Add-in** | `src/taskpane/`, `src/commands/`             | Microsoft Word integracija               |
| **Web App**       | `src/web/`                                   | Standalone web aplikacija                |
| **Shared Engine** | `src/core/`, `src/shared/`, `src/wasm-core/` | Rust/WASM transliteracija                |
| **Analytics**     | `functions/`                                 | Cloudflare Pages Functions (KV tracking) |

### Build Output

Jedna `pnpm run build` komanda generiše sve artefakte u `dist/` folder:

    dist/
    ├── taskpane.html          # Office Add-in UI
    ├── taskpane.[hash].js     # Office Add-in bundle
    ├── taskpane.[hash].css
    ├── commands.html          # Office ribbon komande
    ├── commands.[hash].js
    ├── web.html               # Standalone Web app
    ├── webapp.[hash].js       # Web app bundle
    ├── webapp.[hash].css
    ├── manifest.xml           # Office manifest (prod)
    ├── manifest.prod.xml
    ├── index.html             # Landing page
    ├── support.html           # Podrška
    ├── privacy.html           # Privatnost
    ├── changelog.html         # Changelog viewer
    ├── manifest.webmanifest   # PWA manifest
    └── assets/                # Ikone

---

>>>>>>> Stashed changes
## 0) Versioning Policy

Koristimo dualni sistem verzija: **SemVer** za NPM/kod i **4-part** verziju za Office manifest.

### `package.json` (SemVer)

<<<<<<< Updated upstream
- **PATCH** (`1.0.0` → `1.0.1`): Bugfix-ovi, optimizacije performansi, UI popravke bez promene logike.
- **MINOR** (`1.0.0` → `1.1.0`): Nove funkcionalnosti (npr. novi bridge moduli, novi preview modovi, podrška za nove elemente).
- **MAJOR** (`1.0.0` → `2.0.0`): Breaking promene u logici, promena formata podešavanja bez automatske migracije.
=======
| Tip       | Primer            | Kada                                                      |
| --------- | ----------------- | --------------------------------------------------------- |
| **PATCH** | `1.0.0` → `1.0.1` | Bugfix-ovi, optimizacije, UI popravke bez promene logike  |
| **MINOR** | `1.0.0` → `1.1.0` | Nove funkcionalnosti (novi bridge moduli, preview modovi) |
| **MAJOR** | `1.0.0` → `2.0.0` | Breaking promene, promena formata podešavanja             |
>>>>>>> Stashed changes

### `manifest.xml` / `manifest.prod.xml` (4-part)

- **OBAVEZNO:** Bumpujemo poslednji broj pri svakom produkcionom deploy-u (npr. `1.0.0.12` → `1.0.0.13`).
- **Razlog:** Word/Office agresivno kešira manifest. Promena verzije u XML-u je jedini siguran način da klijenti (i Word Desktop i Online) dobiju najnovije JS artefakte.

---

## 1) Automatizovani Release (Preporučeno)

Umesto ručnog editovanja verzija u više fajlova, koristi ugrađeni **MAX1 Release Commander**. Ova skripta sinhronizuje verzije u `package.json`, `src/wasm-core/Cargo.toml` i oba manifesta:

    # Pokretanje interaktivnog release procesa
    pnpm run release

<<<<<<< Updated upstream
Skripta će ponuditi izbor (Patch/Minor/Major), ažurirati `CHANGELOG.md`, komitovati izmene i kreirati Git tag.
=======
Skripta sinhronizuje verzije u:

- `package.json`
- `src/wasm-core/Cargo.toml`
- `manifest.xml`
- `manifest.prod.xml`

I automatski:

- Ažurira `CHANGELOG.md`
- Kreira Git commit
- Kreira Git tag (`vX.Y.Z`)
>>>>>>> Stashed changes

---

## 2) Pre-Release Checklist (MAX1 Standard)

Pre nego što se verzija pusti u produkciju, MAX1 Guardian mora dati zeleno svetlo u striktnom modu. Pokreni proveru lokalno:

    # Pokretanje pune baterije testova i provera
    pnpm run verify:all:strict -- --no-push

Ova komanda osigurava:

<<<<<<< Updated upstream
- **I18n Integrity:** Svi ključevi su definisani u `sr.ts` i `en.ts`.
- **Rust Gates:** Rust testovi prolaze, kôd je formatiran i bez clippy upozorenja.
- **Build Gate:** Webpack produkcioni build se izvršava bez grešaka.
- **Test Gate:** Unit testovi imaju pokrivenost (coverage) iznad 90%.
- **E2E Gate:** Osnovni scenariji (smoke testovi) prolaze u headless browseru.
=======
| Gate               | Opis                                              |
| ------------------ | ------------------------------------------------- |
| **I18n Integrity** | Svi ključevi definisani u `sr.ts` i `en.ts`       |
| **Rust Gates**     | `cargo test`, `cargo fmt --check`, `cargo clippy` |
| **WASM Build**     | `wasm-pack build` uspešno                         |
| **Webpack Build**  | Production build bez grešaka                      |
| **Unit Tests**     | Coverage iznad 90%                                |
| **E2E Tests**      | Playwright smoke testovi prolaze                  |
| **Lint**           | ESLint bez upozorenja                             |
| **TypeCheck**      | `tsc --noEmit` uspešno                            |
>>>>>>> Stashed changes

---

## 3) Deployment Procedura

Nakon što su sve provere prošle i verzija je bump-ovana:

### Push promene na master:

    # --follow-tags osigurava da i novokreirani vX.X.X tag ode na server
    git push origin master --follow-tags

### Cloudflare Pages CI/CD:

Push taga automatski pokreće build proces na Cloudflare Pages. Prati progres u Dashboard-u.

### Verifikacija u Word-u:

<<<<<<< Updated upstream
Otvori Word i proveri verziju u footeru taskpane-a. Ako i dalje vidiš staru verziju, uradi **Right click → Reload** ili isprazni Office keš.
=======
Prati progres: **Cloudflare Dashboard → Pages → serbian-transliterator → Deployments**

### 3.3 Verifikacija KV Binding-a (Analytics):

Nakon deploy-a, proveri da je **ANALYTICS** KV namespace povezan:

1. **Cloudflare Dashboard → Pages → Serbian Transliterator → Settings → Functions**
2. **KV namespace bindings:**
    - Variable name: `ANALYTICS`
    - KV namespace: `ANALYTICS` (ID: `df64fb75ca504fdb936139a68a42b1d2`)
3. Ako ne postoji, dodaj ručno i redeploy

### 3.4 Verifikacija Deploy-a:

| URL                                                      | Očekivano           |
| -------------------------------------------------------- | ------------------- |
| `https://serbian-transliterator.pages.dev/`              | Landing page        |
| `https://serbian-transliterator.pages.dev/web.html`      | Web app             |
| `https://serbian-transliterator.pages.dev/taskpane.html` | Office UI           |
| `https://serbian-transliterator.pages.dev/stats`         | Analytics dashboard |

### 3.5 Verifikacija u Word-u:

1. Otvori Word
2. Proveri verziju u footer-u taskpane-a
3. Ako vidiš staru verziju: **Right click → Reload** ili isprazni Office keš
>>>>>>> Stashed changes

---

## 4) 🚑 Troubleshooting Release-a

**WASM Mismatch:**
Ako nakon release-a aplikacija puca sa "WASM module not found", proveri da li je `src/wasm-core/pkg` ispravno generisan pre Webpack faze.

**Manifest Validation:**
Ako Word odbije da učita manifest, pokreni `pnpm run validate:prod` da proveriš validnost XML-a prema Office šemi.

<<<<<<< Updated upstream
**Node Version:**
Release proces zahteva Node 22. Proveri verziju sa `node -v`.
=======
Prikazuje:

- **Posete** (danas / ukupno)
- **Konverzije** (danas / ukupno)
- **Preuzimanja** (danas / ukupno)

### Praćeni Eventi:

| Event      | Trigger                 | Metadata                        |
| ---------- | ----------------------- | ------------------------------- |
| `visit`    | Učitavanje `web.html`   | `page`                          |
| `convert`  | Konverzija teksta/fajla | `mode`, `direction`, `count`    |
| `download` | Preuzimanje DOCX/ZIP    | `filename`, `size`, `direction` |

### Ručno Testiranje:

U browser DevTools (F12 → Console):

    fetch("/track", {
        method: "POST",
        body: JSON.stringify({ event: "test" })
    }).then(r => r.json()).then(console.log);

    // Expected: { "success": true, "count": "N" }

### Real-time Logs:

**Cloudflare Dashboard → Pages → Serbian Transliterator → Functions → Real-time Logs**

---

## 5) 🚑 Troubleshooting

### WASM Mismatch:

Ako aplikacija puca sa "WASM module not found":

    pnpm run build:wasm
    pnpm run build

### Manifest Validation:

Ako Word odbije manifest:

    pnpm run validate:prod

### Node Version:

    node -v
    # Expected: v22.x.x

### Analytics Ne Radi:

1.  Proveri KV binding (Sekcija 3.3)
2.  Test endpoint:

        curl -X POST https://serbian-transliterator.pages.dev/track \
          -H "Content-Type: application/json" \
          -d '{"event":"test"}'

3.  Proveri Functions logs u Cloudflare Dashboard-u

### Office Keš:

Ako Word prikazuje staru verziju:

1. **Word Desktop:** File → Options → Advanced → "Empty Auto Recover folder"
2. **Word Online:** Hard refresh (Ctrl+Shift+R)
3. **Sideload ponovo:** `pnpm run sideload:word`

---

## 6) 📋 Post-Release Checklist

- [ ] Verzija vidljiva u Word taskpane footer-u
- [ ] Verzija vidljiva u Web app footer-u
- [ ] `CHANGELOG.md` ažuriran
- [ ] Git tag kreiran (`git tag -l`)
- [ ] Cloudflare Pages build uspešan
- [ ] Analytics tracking radi (`/stats` prikazuje podatke)
- [ ] E2E testovi prolaze u CI-u
- [ ] `manifest.xml` verzija bump-ovana

---

## 7) 🔐 Security Notes

### KV Namespace:

ID `df64fb75ca504fdb936139a68a42b1d2` je javan u `wrangler.toml`. Ovo nije sigurnosni rizik jer:

- KV podaci su **write-only** iz client-side koda
- Read pristup ima samo `/stats` endpoint
- Nema autentikacije jer ne čuvamo lične podatke

### Privacy Compliance:

**NE prikupljamo:**

- ❌ IP adrese
- ❌ Cookie-je
- ❌ Lične podatke
- ❌ Sadržaj dokumenata

**Prikupljamo:**

- ✅ Event type (visit, convert, download)
- ✅ Agregirane brojeve
- ✅ Metadata (veličina fajla, smer konverzije)

---

## 8) 🛠️ Development Workflow

### Lokalni Development:

    # Start dev server (Office Add-in + Web app)
    pnpm run dev

    # Samo dev server bez sideload-a
    pnpm run start

### Dev Server URLs:

| URL                                    | Komponenta      |
| -------------------------------------- | --------------- |
| `https://localhost:3000/taskpane.html` | Office taskpane |
| `https://localhost:3000/web.html`      | Web app         |
| `https://localhost:3000/commands.html` | Office commands |

### Testiranje:

    # Unit testovi
    pnpm run test

    # E2E testovi
    pnpm run test:e2e

    # Coverage
    pnpm run test:coverage

---

## 📚 Related Documentation

| Dokument                                                          | Opis                    |
| ----------------------------------------------------------------- | ----------------------- |
| [WORKFLOW.md](./WORKFLOW.md)                                      | Development workflow    |
| [CONTRIBUTING.md](./CONTRIBUTING.md)                              | Contribution guidelines |
| [CHANGELOG.md](./CHANGELOG.md)                                    | Version history         |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md)                         | Arhitektura projekta    |
| [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/) | Hosting dokumentacija   |
| [Cloudflare KV Docs](https://developers.cloudflare.com/kv/)       | Analytics storage       |
>>>>>>> Stashed changes
