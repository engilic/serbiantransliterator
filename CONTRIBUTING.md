# 🤝 CONTRIBUTING TO SERBIAN TRANSLITERATOR

---

Hvala što želite da doprinesete projektu! Serbian Transliterator je visokoperformansni hibridni sistem (TypeScript + Rust/WASM) koji zahteva preciznost, strogu tipizaciju i apsolutno poštovanje privatnosti korisnika. Naš cilj je da obezbedimo najsigurniji alat za preslovljavanje na svetu, a to postižemo kroz nultu toleranciju na greške.

**Package Manager:** Koristimo isključivo `pnpm 9.x`.
**Verifikacioni standard:** MAX1 Guardian (Local-First Verification).

# 💬 01 // COMMUNICATION & SCOPE

---

- **Propose First:** Svaku značajnu promenu ili ispravku prvo predložite kroz GitHub Issue. Želimo da budemo sigurni da se tvoja ideja uklapa u dugoročnu viziju projekta.
- **Security:** Bezbednosne propuste prijavljujte isključivo privatno na `iddj27510@gmail.com` (vidi `SECURITY.md`).
- **Atomic PRs:** Držite Pull Request-ove fokusiranim. Jedna funkcionalnost ili jedan bugfix = jedan PR. Ne šaljite "mega-PR-ove" koji menjaju 50 različitih stvari.
- **Test-Driven:** PR bez pratećih testova (Unit ili E2E) biće automatski odbijen.

# 🧬 02 // STANDARD PR WORKFLOW

---

Pratite ove korake kako bi vaš doprinos prošao "The Guardian" proveru bez zastoja:

### 1. Priprema i Branching

Pre početka rada, uvek povucite najnovije promene sa mastera i kreirajte novu granu.

- Tipovi grana: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/`.
- Format: `tip/kebab-case-opis`.

### 2. Razvoj i Lokalna Verifikacija (The Guardian)

Tokom rada koristite različite nivoe provere unutar `scripts/verify-all.js`:

- **Pre-commit Sanity:** `pnpm run verify:all --ultra-fast` (Samo sintaksa i I18n).
- **Active Dev:** `pnpm run verify:all --smart` (Testira samo module koje ste menjali).
- **Final Guard:** `pnpm run verify:all` (Totalna provera - obavezno pre svakog push-a).

### 3. Slanje koda

Kada je `verify:all` 100% zelen lokalno, pošaljite kod na remote.

# 📜 03 // COMMIT PROTOCOL

---

Koristimo **Conventional Commits** standard radi automatskog generisanja Changelog-a. Svaki commit mora imati jasan prefiks:

- `feat:` -> Nova funkcionalnost.
- `fix:` -> Ispravka baga.
- `refactor:` -> Promena koda bez promene vidljivog ponašanja.
- `chore:` -> Održavanje, ažuriranje zavisnosti, konfiguracija.
- `docs:` -> Dokumentacija.
- `test:` -> Dodavanje ili ispravka testova.

# 🦾 04 // CODE STANDARDS (THE LAW)

---

Nijedan PR neće biti prihvaćen ukoliko krši bilo koje od ovih pravila:

1.  **File Headers:** Svaki novi `.ts`, `.js` ili `.rs` fajl mora početi sa komentarom koji sadrži relativnu putanju (npr. `// src/core/logic.ts`). Pokrenite `pwsh ./scripts/add-headers.ps1` za popravku.
2.  **No console.log:** Upotreba `console.log` je strogo zabranjena u produkcionom kodu. Koristite isključivo interni `logger.info()`, `logger.warn()` ili `logger.error()`.
3.  **Strict Typing:** Upotreba `any` tipa je zabranjena. Koristite `unknown` u kombinaciji sa Type Guards.
4.  **WCAG 2 AA Compliance:** Svaka promena u UI-u mora proći test kontrasta. Standardna primarna plava boja je `#005a9e`.
5.  **Privacy by Design:** Zabranjeno je uvođenje mrežnih poziva koji prenose sadržaj dokumenata korisnika. Sve mora ostati lokalno (Air-gap).
6.  **No Swallow Errors:** Greške se ne smeju "gutati" praznim catch blokovima. Svaka greška mora biti normalizovana i logovana.

# 🧪 05 // RUNNING TESTS & QA

---

Sve provere u terminalu su podrazumevano "silent" radi lakšeg uočavanja grešaka.

- **Unit testovi (Vitest):** `pnpm run test`
- **Unit testovi sa Coverage-om:** `pnpm run test:coverage` (Ciljamo >90% pokrivenosti).
- **E2E testovi (Playwright):** `pnpm run test:e2e` (Testiranje u realnom browseru na Office stub-u).
- **Security Audit:** `pnpm run audit:prod:high` (Blokira build ako postoji ranjiva biblioteka).

# ❓ QUESTIONS?

---

Ako imate bilo kakvih nedoumica oko arhitekture ili implementacije, otvorite Issue sa oznakom `question`. Odgovorićemo u najkraćem roku, obično unutar 72h.

---

© 2026 Serbian Transliterator Project. Built with ❤️ in Rust & TypeScript.
**Author:** Jugoslav Ilić (engilic) | Licensed under MIT.
