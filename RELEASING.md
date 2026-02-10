# 🚀 Releasing Serbian Transliterator (REV 2026-02-10)

Ovaj projekat koristi automatizovan proces za izdavanje novih verzija kako bi se osigurao integritet koda i pravilno osvežavanje keša u Microsoft Word hostu.

Cilj release-a:
- determinističan build (WASM + dict binovi + webpack)
- sinhronizovane verzije (SemVer + manifest 4-part)
- minimalna šansa za “stale” Office cache

---

## 0) Versioning Policy

Koristimo dualni sistem verzija:
- SemVer za NPM/kod
- 4-part verziju za Office manifest

### package.json (SemVer)

- PATCH (1.0.0 → 1.0.1): bugfix, perf optimizacije, UI popravke bez promene logike
- MINOR (1.0.0 → 1.1.0): nove funkcionalnosti (novi bridge moduli, novi preview modovi, nova OOXML podrška)
- MAJOR (1.0.0 → 2.0.0): breaking promene u logici ili formatu podešavanja bez automatske migracije

### manifest.xml / manifest.prod.xml (4-part)

OBAVEZNO:
- bumpuj poslednji broj pri svakom produkcionom deploy-u (npr. 1.0.0.12 → 1.0.0.13)

Razlog:
- Word/Office agresivno kešira manifest i statičke artefakte
- promena manifest verzije je najpouzdaniji način da klijent dobije najnoviji bundle

---

## 1) Automatizovani Release (Preporučeno)

Nemoj ručno editovati verzije u više fajlova.

Koristi MAX1 Release Commander:

PS> pnpm run release

Šta skripta radi:
- ponudi izbor Patch/Minor/Major
- ažurira package.json verziju (SemVer)
- sinhronizuje verzije gde je potrebno (npr. Cargo.toml / manifest.xml / manifest.prod.xml)
- generiše i osvežava CHANGELOG.md
- kreira release commit
- kreira git tag (vX.Y.Z)

Napomena:
- Ako release skripta očekuje čist working tree, uradi commit ili stash pre pokretanja.

---

## 2) Pre-Release Checklist (MAX1 Standard)

Pre produkcionog release-a, MAX1 Guardian mora proći u strict modu.

PS> pnpm run verify:all:strict -- --no-push

Ovo mora da obezbedi:
- I18n Integrity: svi ključevi postoje u sr.ts i en.ts
- Rust Gates: cargo fmt, cargo clippy (bez warninga), cargo test
- Build Gate: webpack production build prolazi
- Test Gate: unit testovi prolaze (coverage iznad cilja)
- E2E Gate: Playwright smoke prolazi

Ako strict padne:
- release se NE radi
- popravi uzrok i ponovi strict

---

## 3) Deployment Procedura

Kada su provere prošle i verzije bump-ovane:

### 3.1 Push na master (sa tagovima)

PS> git push origin master --follow-tags

Napomena:
- --follow-tags osigurava da i novokreirani vX.Y.Z tag ode na remote
- bez taga, release pipeline može da ne okine deploy (zavisno od CI konfiguracije)

### 3.2 Cloudflare Pages CI/CD

Push (commit/tag) automatski pokreće build na Cloudflare Pages.

Proveri:
- build logove (WASM korak, compile:dicts, webpack)
- finalne artefakte (dist folder output u deploy-u)

### 3.3 Verifikacija u Word-u (post-deploy)

1) Otvori Word
2) Otvori add-in taskpane
3) Proveri verziju u footeru (mora da se poklopi sa package.json SemVer)

Ako vidiš staru verziju:
- Right click → Reload (taskpane)
- očisti Office cache (po internom checklist-u)
- proveri da li je manifest 4-part broj stvarno bumpovan

---

## 4) 🚑 Troubleshooting Release-a

### A) WASM mismatch / “WASM module not found”
Simptom:
- posle release-a app puca pri startu

Provera:
- da li je src/wasm-core/pkg generisan u build pipeline-u pre webpack faze
- da li dist sadrži očekivane wasm fajlove i da li su putanje ispravne

Fix:
- ponovi lokalno: pnpm run build:wasm
- zatim: pnpm run build
- tek onda release

### B) Manifest validation fail (Word odbija manifest)
Simptom:
- Word prijavi invalid manifest / neće da učita add-in

Provera:
PS> pnpm run validate:prod

Fix:
- ispravi XML prema Office šemi
- ponovi validate:prod pre push-a

### C) Node version mismatch (release zahteva Node 22)
Provera:
PS> node -v

Fix (Volta):
PS> volta install node@22

### D) “Release je deployovan ali korisnici i dalje imaju star bundle”
Najčešći uzrok:
- manifest 4-part broj nije bumpovan
- ili klijent cache nije osvežen

Fix:
- bump manifest verziju (poslednji broj)
- redeploy
- uputi korisnike na reload/clear cache proceduru

---

## 5) Minimalni “Golden Path” (Copy/Paste)

PS> git switch master
PS> git pull --ff-only
PS> pnpm install
PS> pnpm run clean
PS> pnpm run verify:all:strict -- --no-push
PS> pnpm run release
PS> git push origin master --follow-tags
