# 🚀 Releasing Serbian Transliterator

Ovaj projekat koristi automatizovan proces za izdavanje novih verzija kako bi se osigurao integritet koda i pravilno osvežavanje keša u Microsoft Word hostu.

---

## 0) Versioning Policy

Koristimo dualni sistem verzija: **SemVer** za NPM/kod i **4-part** verziju za Office manifest.

### `package.json` (SemVer)

- **PATCH** (`1.0.0` → `1.0.1`): Bugfix-ovi, optimizacije performansi, UI popravke bez promene logike.
- **MINOR** (`1.0.0` → `1.1.0`): Nove funkcionalnosti (npr. novi bridge moduli, novi preview modovi, podrška za nove elemente).
- **MAJOR** (`1.0.0` → `2.0.0`): Breaking promene u logici, promena formata podešavanja bez automatske migracije.

### `manifest.xml` / `manifest.prod.xml` (4-part)

- **OBAVEZNO:** Bumpujemo poslednji broj pri svakom produkcionom deploy-u (npr. `1.0.0.12` → `1.0.0.13`).
- **Razlog:** Word/Office agresivno kešira manifest. Promena verzije u XML-u je jedini siguran način da klijenti (i Word Desktop i Online) dobiju najnovije JS artefakte.

---

## 1) Automatizovani Release (Preporučeno)

Umesto ručnog editovanja verzija u više fajlova, koristi ugrađeni **MAX1 Release Commander**. Ova skripta sinhronizuje verzije u `package.json`, `src/wasm-core/Cargo.toml` i oba manifesta:

~~~powershell
# Pokretanje interaktivnog release procesa
npm run release
~~~

Skripta će ponuditi izbor (Patch/Minor/Major), ažurirati `CHANGELOG.md`, komitovati izmene i kreirati Git tag.

---

## 2) Pre-Release Checklist (MAX1 Standard)

Pre nego što se verzija pusti u produkciju, MAX1 Guardian mora dati zeleno svetlo u striktnom modu. Pokreni proveru lokalno:

~~~powershell
# Pokretanje pune baterije testova i provera
npm run verify:all:strict -- --no-push
~~~

Ova komanda osigurava:

- **I18n Integrity:** Svi ključevi su definisani u `sr.ts` i `en.ts`.
- **Rust Gates:** Rust testovi prolaze, kôd je formatiran i bez clippy upozorenja.
- **Build Gate:** Webpack produkcioni build se izvršava bez grešaka.
- **Test Gate:** Unit testovi imaju pokrivenost (coverage) iznad 90%.
- **E2E Gate:** Osnovni scenariji (smoke testovi) prolaze u headless browseru.

---

## 3) Deployment Procedura

Nakon što su sve provere prošle i verzija je bump-ovana:

### Push promene na master:

~~~powershell
# --follow-tags osigurava da i novokreirani vX.X.X tag ode na server
git push origin master --follow-tags
~~~

### Cloudflare Pages CI/CD:

Push taga automatski pokreće build proces na Cloudflare Pages. Prati progres u Dashboard-u.

### Verifikacija u Word-u:

Otvori Word i proveri verziju u footeru taskpane-a. Ako i dalje vidiš staru verziju, uradi **Right click → Reload** ili isprazni Office keš.

---

## 4) 🚑 Troubleshooting Release-a

**WASM Mismatch:**
Ako nakon release-a aplikacija puca sa "WASM module not found", proveri da li je `src/wasm-core/pkg` ispravno generisan pre Webpack faze.

**Manifest Validation:**
Ako Word odbije da učita manifest, pokreni `npm run validate:prod` da proveriš validnost XML-a prema Office šemi.

**Node Version:**
Release proces zahteva Node 22. Proveri verziju sa `node -v`.
