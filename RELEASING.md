# 🚀 RELEASE PROCEDURE — v1.1 (HARDENED)
---

**Project:** Serbian Transliterator (Universal Engine)
**Standard:** MAX1 Guardian Strict Compliance
**Goal:** Deterministički build, SemVer sinhronizacija i eliminacija Office keš problema.

# 🔢 00 // VERSIONING POLICY
---
Koristimo dualni sistem verzija kako bismo zadovoljili i NPM standarde i specifičnosti Microsoft Office ekosistema.

### A) package.json (SemVer)
- PATCH (1.0.0 → 1.0.1): Bugfix, perf optimizacije, A11y popravke.
- MINOR (1.0.0 → 1.1.0): Nove funkcionalnosti (novi mostovi, novi preview modovi).
- MAJOR (1.0.0 → 2.0.0): Breaking promene u logici ili formatu podešavanja.

### B) manifest.xml / manifest.prod.xml (4-Part)
OBAVEZNO: Bumpuj poslednji broj pri svakom produkcionom deploy-u (npr. 1.0.0.12 → 1.0.0.13).
- Word/Office agresivno kešira manifest i statičke artefakte.
- Promena manifest verzije je najpouzdaniji način da klijent dobije najnoviji bundle.

# 🤖 01 // AUTOMATED RELEASE (MAX1 COMMANDER)
---
Nikada nemoj ručno menjati verzije u više fajlova. Koristi automatizovanu skriptu:

PS> pnpm run release

Šta skripta radi:
1. Nudi izbor Patch/Minor/Major.
2. Ažurira package.json i sinhronizuje Cargo.toml i manifeste.
3. Generiše i osvežava CHANGELOG.md.
4. Kreira release commit i Git tag (vX.Y.Z).

# 🛡️ 02 // PRE-RELEASE CHECKLIST (STRICT MODE)
---
Pre nego što uradiš release, tvoj lokalni kod mora proći najstrožu proveru.

PS> pnpm run verify:all:strict -- --no-push

Mora biti 🟢 ZELENO za:
- Security Audit: Zero vulnerabilities u produkcionim paketima (puna tabela propusta mora biti pregledana).
- A11y Compliance: Prolaz testova kontrasta boja (#005a9e) na svim ključnim UI elementima.
- Rust Gates: cargo fmt, clippy (bez warninga), cargo test.
- Build Gate: Webpack production build bez grešaka.
- Manifest: Validacija XML-a prema Microsoft šemi (pnpm run validate:prod).

# 🚢 03 // DEPLOYMENT PROCEDURA
---
Kada su provere prošle i verzije su "bump-ovane":

3.1 Push na master (sa tagovima)
PS> git push origin master --follow-tags
--follow-tags osigurava da i novokreirani vX.Y.Z tag ode na remote i pokrene Cloudflare deploy.

3.2 Cloudflare Pages CI/CD
Nakon push-a, proveri build logove na Cloudflare dashboard-u:
- Build WASM korak
- Compile:dicts korak
- Webpack production bundle

3.3 Verifikacija u Word-u (Post-Deploy)
1. Otvori Word i učitaj Add-in.
2. Proveri verziju u footeru (mora se poklopiti sa package.json verzijom).
3. Ako vidiš staru verziju: Right Click → Reload ili očisti Office cache.

# 🚑 04 // TROUBLESHOOTING
---
- WASM Module Not Found: Release je verovatno urađen bez prethodnog build:wasm koraka. Rešenje: pnpm run build:wasm pa ponovni release.
- Manifest Validation Fail: Word odbija da učita add-in. Rešenje: pnpm run validate:prod i ispravi XML greške.
- Stale Cache: Korisnici vide stare funkcije. Rešenje: Proveri da li je 4-part broj u manifestu zaista veći od prethodnog i uradi redeploy.

# 🏆 05 // THE GOLDEN PATH (COPY/PASTE)
---
git switch master
git pull --ff-only
pnpm install
pnpm run clean
pnpm run verify:all:strict -- --no-push
pnpm run release
git push origin master --follow-tags

---
Dokument kreirao: architecture-team | Poslednja revizija: 2026-02-11
