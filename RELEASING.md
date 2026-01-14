# Releasing Serbian Transliterator

Ovaj repo je Word Office.js taskpane add-in koji se hostuje na Cloudflare Pages.

## 0) Versioning policy (kada bump-ovati)

Koristimo SemVer za `package.json`, i 4-part verziju za Office manifest.

### `package.json` (SemVer)
- **PATCH** (`1.0.0` → `1.0.1`): bugfix, perf optimizacije, UI/CSS refaktori bez menjanja ponašanja.
- **MINOR** (`1.0.0` → `1.1.0`): nove funkcije/opcije (npr. novi protect tokeni, novi preview mod, nova obrada sekcija).
- **MAJOR** (`1.0.0` → `2.0.0`): breaking promene (npr. promena formata settings-a bez migracije, promena default ponašanja koja može da iznenadi korisnike).

### `manifest.xml` / `manifest.prod.xml` (4-part)
- Bumpujemo **poslednji broj**:
  - `1.0.0.0` → `1.0.1.0` (PATCH)
  - `1.0.0.0` → `1.1.0.0` (MINOR)
  - `1.0.0.0` → `2.0.0.0` (MAJOR)

Napomena: manifest verzija je važna jer Word/Office kešira add-in. Kad imaš “release”, bump manifest verzije pomaže da se nova verzija pouzdano učita.

## Manifest bump (OBAVEZNO zbog Office cache-a)

Word/Office često kešira add-in. Zbog toga je pri svakom produkcionom deploy-u preporučeno (a praktično obavezno) da bumpuješ verziju u `manifest.prod.xml`, čak i ako `package.json` ostaje na istoj verziji.

Minimalna praksa:
- Pre svakog deploy-a na Cloudflare Pages, bumpuj `<Version>` u `manifest.prod.xml`.
- Npr. `1.0.0.0` → `1.0.1.0` → `1.0.2.0` ...

Ovo obezbeđuje da Word pouzdano povuče novu verziju add-in-a.

## 1) Pre-release checks

Pokreni sve lokalno:

```pwsh
npm test
npm run typecheck
npm run lint
npm run build
npm run validate
npm run validate:prod