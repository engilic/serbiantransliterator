# 🛡️ WORKFLOW v8.0 — PNPM OPS EDITION (MAXIMUM SECURITY)

**Project:** Serbian Transliterator (Hybrid: TypeScript + Rust/WASM)
**Environment:** VS Code 2026, PowerShell 7, Node 22.x, pnpm 9.x (Managed via Volta), Rust (Stable)
**Ops Level:** ZERO TOLERANCE for errors.
**Core Principle:** "Local Verification is the only Source of Truth."
**Labeling:** MAX1 Guardian
**Default branch:** `master`

---

## 0. ☢️ DAILY SANITY & CLEAN SLATE

Pre pisanja ijedne linije koda, osiguraj da je tvoje okruženje sterilno.
Stari artefakti i stale keš su neprijatelji stabilnosti.

### Standard Start

Koristi ovo svakodnevno za sinhronizaciju i čišćenje osnovnih build artefakata.

1. Idi na `master` i povuci najnovije promene.
2. Sinhronizuj zavisnosti (pnpm je ekstremno brz ovde).
3. Obriši privremene build artefakte (dist, coverage, pkg).

```powershell
git switch master
git pull --ff-only
pnpm install
pnpm run clean
```

### The "Nuclear Option" (Emergency Only)

Koristi ovo ako naiđeš na čudne greške pri kompajliranju, "module not found" ili probleme sa Rust linkovanjem.

> ⚠️ **PAŽNJA:** Ovo briše sve fajlove koji nisu pod git kontrolom i ignorisane foldere!

```powershell
git clean -fdX
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
pnpm store prune
pnpm install
cd src/wasm-core
cargo clean
cd ../..
pnpm run build:wasm
```

---

## 1. 🧬 DEVELOPMENT LIFECYCLE

### A. Branching Strategy

Direktni commit-ovi na `master` su **ZABRANJENI** (osim release commit-ova generisanih skriptama).

**Format:** `tip/kebab-case-opis`

**Types:**

<<<<<<< Updated upstream
- `feat/` — Nove funkcionalnosti (npr. `feat/streaming-parser`)
- `fix/` — Ispravke bagova (npr. `fix/memory-leak`)
- `refactor/` — Izmena koda bez promene ponašanja (npr. `refactor/cleanup-utils`)
- `chore/` — Konfiguracija, skripte, zavisnosti (npr. `chore/update-deps`)
- `docs/` — Dokumentacija (npr. `docs/api-reference`)
=======
| Prefix      | Opis                               | Primer                   |
| ----------- | ---------------------------------- | ------------------------ |
| `feat/`     | Nove funkcionalnosti               | `feat/streaming-parser`  |
| `fix/`      | Ispravke bagova                    | `fix/memory-leak`        |
| `refactor/` | Izmena koda bez promene ponašanja  | `refactor/cleanup-utils` |
| `chore/`    | Konfiguracija, skripte, zavisnosti | `chore/update-deps`      |
| `docs/`     | Dokumentacija                      | `docs/api-reference`     |
>>>>>>> Stashed changes

```powershell
git switch -c feat/my-new-feature
```

---

### B. The Coding Standard (Law)

#### 1. File Identity Headers (MANDATORY)

Svaki izvorni fajl (`.ts`, `.rs`, `.js`, `.ps1`) **MORA** početi sa komentarom relativne putanje.

_Auto-fix:_

```powershell
pwsh ./scripts/add-headers.ps1
```

#### 2. No `console.log`

Koristi isključivo logger:

- `logger.info()`
- `logger.warn()`
- `logger.error()`

> **Izuzetak:** Privremeni lokalni debugging koji se briše pre commit-a.

#### 3. Strict Typing

- `any` je **zabranjen**. Koristi `unknown` + type guards.
- Interfejsi moraju biti eksplicitni.

#### 4. Error Handling

- Nikada ne gutaj greške (never swallow errors).
- Koristi `normalizeUnknownError(e)` pre logovanja.
- UI mora imati fallback mehanizam (toast/banner), nikada "white-screen".

---

## 2. 🛡️ THE GUARDIAN GATE (MAX1 VERIFICATION)

Guardian (`scripts/verify-all.js`) je vrhovni autoritet. **Ako on padne, tvoj kod ne postoji.**

**LEVEL 0: Ultra-Fast Verify (Quick Sanity)**  
Samo linting, format i typecheck. Preskače install, build i testove. Najbrži fidbek.

<<<<<<< Updated upstream
```powershell
pnpm verify:all --ultra-fast --no-push
```

**LEVEL 1: Fast Verify (During Dev)**  
Sve iz nivoa 0 + manifest provera + Rust gates. Skipa Unit/E2E testove.

```powershell
pnpm verify:all --fast --no-push
```

**LEVEL 2: Full Verify (Pre-Commit)**  
Kompletna baterija testova uključujući Unit testove sa coverage izveštajem.

```powershell
pnpm verify:all --no-push
```

**LEVEL 3: Strict Verify (Pre-Push / CI / Release)**  
Maksimalna sigurnost. Build provera + strict audit. Ovo pokreće GitHub Actions.

```powershell
pnpm verify:all:strict --no-push
```

### Checklist koji Guardian izvršava:

- **Header Check** — Da li su putanje prisutne i tačne?
- **Conflict Check** — Da li ima `<<<<<<<` git markera?
- **Big File Gate** — Da li ima fajlova > 5MB?
- **Security Sniffer** — Skeniranje za secrets/keys u kodu.
- **I18n Integrity** — Da li su svi ključevi definisani u `sr.ts`?
- **Rust Gates** — `cargo fmt`, `cargo clippy` (bez warninga), `cargo test`
- **Build Gate** — Da li `npm run build` uspeva?
- **Test Gate** — `vitest run --coverage` (coverage enforced)
- **E2E Gate** — `playwright test` (smoke testovi u browseru)
=======
| Level             | Komanda                                  | Trajanje | Kada koristiti          |
| ----------------- | ---------------------------------------- | -------- | ----------------------- |
| **0: Ultra-Fast** | `pnpm verify:all --ultra-fast --no-push` | ~10s     | Quick sanity check      |
| **1: Fast**       | `pnpm verify:all --fast --no-push`       | ~30s     | During development      |
| **2: Full**       | `pnpm verify:all --no-push`              | ~2min    | Pre-commit              |
| **3: Strict**     | `pnpm verify:all:strict --no-push`       | ~5min    | Pre-push / CI / Release |

### Checklist koji Guardian izvršava:

| Check                | Opis                                                     |
| -------------------- | -------------------------------------------------------- |
| **Header Check**     | Da li su putanje prisutne i tačne?                       |
| **Conflict Check**   | Da li ima `<<<<<<<` git markera?                         |
| **Big File Gate**    | Da li ima fajlova > 5MB?                                 |
| **Security Sniffer** | Skeniranje za secrets/keys u kodu                        |
| **I18n Integrity**   | Da li su svi ključevi definisani u `sr.ts` i `en.ts`?    |
| **Rust Gates**       | `cargo fmt`, `cargo clippy` (bez warninga), `cargo test` |
| **Build Gate**       | Da li `pnpm run build` uspeva?                           |
| **Test Gate**        | `vitest run --coverage` (coverage enforced)              |
| **E2E Gate**         | `playwright test` (smoke testovi u browseru)             |
>>>>>>> Stashed changes

---

## 3. 🦀 RUST & WASM WORKFLOW

Pošto je ovo hibridni projekat, Rust zahteva specifičnu pažnju.

### Manualna kompilacija

```powershell
pnpm run build:wasm
```

> Generiše `src/wasm-core/pkg` neophodan za TS

### Kompilacija rečnika

Ako menjaš `.json` fajlove u `src/static/assets/`:

```powershell
pnpm run compile:dicts
```

> Kreira `.bin` fajlove optimizovane za FST engine

### Rust Testovi

```powershell
cd src/wasm-core
cargo test
```

---

## 4. 🚀 COMMIT, PUSH & PR

### Commit Protocol

Conventional Commits (neophodno za auto-changelog):

<<<<<<< Updated upstream
- `feat:` → Minor verzija (1.1.0) — npr. `feat: add streaming mode`
- `fix:` → Patch verzija (1.0.1) — npr. `fix: resolve memory leak`
- `BREAKING CHANGE:` → Major verzija (2.0.0) — npr. `feat!: redesign API`

### Push Sequence

```powershell
# 1. Finalna provera
pnpm verify:all --no-push
=======
| Prefix   | Verzija       | Primer                       |
| -------- | ------------- | ---------------------------- |
| `feat:`  | Minor (1.1.0) | `feat: add streaming mode`   |
| `fix:`   | Patch (1.0.1) | `fix: resolve memory leak`   |
| `feat!:` | Major (2.0.0) | `feat!: redesign API`        |
| `chore:` | None          | `chore: update dependencies` |
| `docs:`  | None          | `docs: update README`        |

### Push Sequence

    # 1. Finalna provera
    pnpm verify:all --no-push

    # 2. Stage & Commit
    git add .
    git commit -m "feat: implement ..."

    # 3. Push
    git push -u origin tip/opis
>>>>>>> Stashed changes

# 2. Stage & Commit
git add .
git commit -m "feat: implement ..."

# 3. Push
git push -u origin tip/opis
```

---

## 5. 📦 RELEASE PROCEDURE (Maintainers Only)

<<<<<<< Updated upstream
```powershell
# 1. Sync with master
git pull origin master
=======
    # 1. Sync with master
    git pull origin master

    # 2. Full strict verification
    pnpm verify:all:strict --no-push

    # 3. Auto version bump, changelog, and tag
    pnpm run release

    # 4. Push (triggers Cloudflare Pages deploy)
    git push --follow-tags
>>>>>>> Stashed changes

# 2. Full strict verification
pnpm verify:all:strict --no-push

# 3. Auto version bump, changelog, and tag
pnpm run release

<<<<<<< Updated upstream
# 4. Push (triggers Cloudflare Pages deploy)
git push --follow-tags
```

---

## 6. 🚑 TROUBLESHOOTING
=======
| URL                                                      | Očekivano           |
| -------------------------------------------------------- | ------------------- |
| `https://serbian-transliterator.pages.dev/`              | Landing page        |
| `https://serbian-transliterator.pages.dev/web.html`      | Web app radi        |
| `https://serbian-transliterator.pages.dev/taskpane.html` | Office UI radi      |
| `https://serbian-transliterator.pages.dev/stats`         | Analytics dashboard |

---

## 6. 📊 ANALYTICS WORKFLOW (NEW — v1.0.0)

### Dodavanje Novog Eventa

1. Importuj helper:

    import { track } from "../../shared/analytics";

2. Pozovi track funkciju:

    track("event_name", {
    mode: "text", // OK - agregirani podatak
    direction: "lat-to-cyr", // OK - agregirani podatak
    size: 1234, // OK - broj (ne sadržaj)
    // ❌ NIKADA: filename, content, email, IP
    });

### Verifikacija Analytics-a

    # Lokalno testiranje (zahteva Wrangler)
    npx wrangler pages dev dist --kv=ANALYTICS

    # Test endpoint
    curl -X POST http://localhost:8788/track -d '{"event":"test"}'

### KV Namespace Management

    # Lista ključeva
    npx wrangler kv key list --namespace-id=df64fb75ca504fdb936139a68a42b1d2

    # Brisanje ključa
    npx wrangler kv key delete "count:2026-01-01:test" --namespace-id=df64fb75ca504fdb936139a68a42b1d2

---

## 7. 🚑 TROUBLESHOOTING
>>>>>>> Stashed changes

### A) WASM module not found / File not found

Verovatno si očistio projekat, ali nisi re-buildovao WASM.

```powershell
pnpm run build:wasm
```

### B) Webpack "PureExpressionDependency" greška (Dev Mode)

Regresija u Webpack 5.104+. Osiguraj da `webpack.dev.js` ima:

```javascript
optimization: {
    concatenateModules: false,
    providedExports: false,
    usedExports: false,
    sideEffects: false,
}
```

### C) Node/pnpm verzija mismatch

Projekat zahteva Node 22. Proveri sa:

```powershell
node -v
pnpm -v
```

Koristi Volta za fiksiranje:

```powershell
volta install node@22
```

### D) CodeQL "flapping" (nasumični fail/pass)

To znači da više workflow-a uploaduje SARIF rezultate.

**Fast local check:**

```powershell
git grep "codeql-action" .github/workflows
```

> Samo jedan fajl (obično `codeql.yml`) sme da sadrži upload korake.

### E) wasm-pack nije pronađen

Instaliraj globalno:

<<<<<<< Updated upstream
```powershell
cargo install wasm-pack
```
=======
    cargo install wasm-pack

### F) Analytics ne radi (NEW)

1. Proveri KV binding u Cloudflare Dashboard
2. Test endpoint direktno:

    curl -X POST https://serbian-transliterator.pages.dev/track -H "Content-Type: application/json" -d '{"event":"test"}'

3. Proveri Functions logs u Cloudflare Dashboard

### G) E2E testovi padaju na `/web.html`

Proveri da test koristi `baseURL` umesto hardcoded URL-a:

    // ❌ POGREŠNO
    await page.goto("https://localhost:3000/web.html");

    // ✅ ISPRAVNO
    await page.goto("/web.html");
>>>>>>> Stashed changes

---

## 📊 CI/CD INFRASTRUCTURE

**GitHub Actions**

<<<<<<< Updated upstream
- Node: 22.x
- pnpm: 9.x (via action-setup)
- Rust: Stable
- wasm-pack: Auto
- Trigger: Push/PR
=======
| Setting   | Value                  |
| --------- | ---------------------- |
| Node      | 22.x                   |
| pnpm      | 9.x (via action-setup) |
| Rust      | Stable                 |
| wasm-pack | Auto                   |
| Trigger   | Push/PR to master      |
>>>>>>> Stashed changes

**Cloudflare Pages**

<<<<<<< Updated upstream
- Node: 22.x
- pnpm: 9.x (Auto-install script)
- Rust: Stable
- wasm-pack: Auto
- Trigger: Push to master
=======
| Setting             | Value                                            |
| ------------------- | ------------------------------------------------ |
| Node                | 22.x                                             |
| pnpm                | 9.x (Auto-install script)                        |
| Rust                | Stable                                           |
| wasm-pack           | Auto                                             |
| Build Command       | `pnpm run build`                                 |
| Output Directory    | `dist`                                           |
| Functions Directory | `functions`                                      |
| KV Binding          | `ANALYTICS` → `df64fb75ca504fdb936139a68a42b1d2` |
| Trigger             | Push to master                                   |
>>>>>>> Stashed changes

**Local (Volta)**

<<<<<<< Updated upstream
- Node: 22.x
- pnpm: 9.x
- Rust: Stable
  -wasm-pack: Manual
- Trigger: pnpm start, verify:all
=======
| Setting   | Value                           |
| --------- | ------------------------------- |
| Node      | 22.x                            |
| pnpm      | 9.x                             |
| Rust      | Stable                          |
| wasm-pack | Manual install                  |
| Trigger   | `pnpm start`, `pnpm verify:all` |

---

## 9. 📁 PROJECT STRUCTURE

    SerbianTransliterator/
    ├── .github/             # GitHub Actions workflows
    ├── assets/              # Icons and static images
    ├── dist/                # Build output (gitignored)
    ├── docs/                # Architecture documentation
    ├── functions/           # Cloudflare Pages Functions
    │   ├── track.ts         # Analytics endpoint
    │   └── stats.ts         # Analytics dashboard
    ├── scripts/             # Build and verification scripts
    ├── src/
    │   ├── app/             # Application layer (ports & adapters)
    │   ├── commands/        # Office ribbon commands
    │   ├── core/            # Core transliteration logic
    │   ├── shared/          # Shared utilities
    │   │   ├── analytics.ts # Analytics helper (NEW)
    │   │   ├── i18n.ts      # Internationalization
    │   │   ├── ooxml/       # OOXML processing
    │   │   └── ...
    │   ├── static/          # Static pages and assets
    │   ├── taskpane/        # Office Add-in UI
    │   ├── wasm-core/       # Rust/WASM engine
    │   └── web/             # Standalone Web app
    ├── tests/               # Unit tests
    ├── tests-e2e/           # Playwright E2E tests
    ├── manifest.xml         # Office manifest (dev)
    ├── manifest.prod.xml    # Office manifest (prod)
    ├── wrangler.toml        # Cloudflare configuration
    └── package.json         # Project configuration

---

## 10. 📚 RELATED DOCUMENTATION

| Dokument                                  | Opis                    |
| ----------------------------------------- | ----------------------- |
| [RELEASING.md](./RELEASING.md)            | Release procedure       |
| [CONTRIBUTING.md](./CONTRIBUTING.md)      | Contribution guidelines |
| [SECURITY.md](./SECURITY.md)              | Security policy         |
| [STATE.md](./STATE.md)                    | Project state deep dive |
| [VISION.md](./VISION.md)                  | 2026-2028 roadmap       |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical architecture  |

---

**Last Updated:** February 8, 2026
**Version:** 8.1 (Analytics Integration)

---

© 2026 Serbian Transliterator Project. Licensed under MIT.
>>>>>>> Stashed changes
