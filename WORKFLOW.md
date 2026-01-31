=== STANDARDNI PROCES RADA (WORKFLOW v6.0 - MAX3 EDITION) ===

ENVIRONMENT INFO:
IDE: Visual Studio 2026
Terminal: PowerShell 7
OS: Windows 11 Home

===============================

1. # PRIPREMA (START & CLEAN)

# 1. Standardni start (Brzo)

git checkout master
git pull --ff-only

# 2. Kreiraj novu granu za zadatak

git checkout -b feat/tvoj-naziv-zadatka

# _Opciono: Nuklearni reset (Samo ako nešto nije u redu)_

# npm run git:reset -- --yes

# =============================== 2. RAZVOJ (DEV LOOP)

# Kodiranje...

# Brza provera (Lint & Build)

npm run lint:fix
npm run build

# Web Mode (Brza provera u browseru)

npm run serve:dist

# =============================== 3. FINALNA VERIFIKACIJA (PRE-PUSH)

# Pokreni "God Mode" proveru (Clean, Format, Lint, Typecheck, Build, Unit, E2E, Security)

npm run verify:all

# Očekivan rezultat:

# "🎉 SVI TESTOVI PROŠLI! SPREMNO ZA RELEASE."

# =============================== 4. SLANJE IZMENA (PUSH & PR)

# Dodaj i komituj

git add .
git commit -m "feat: opis izmena"

# Gurni granu

git push origin feat/tvoj-naziv-zadatka

# -> Klikni na link u terminalu da otvoriš Pull Request (PR).

# -> Popuni PR template (koristi checkliste).

# -> Sačekaj da CI (GitHub Actions) pozeleni.

# -> Uradi "Squash and Merge" na GitHub-u.

# =============================== 5. ZAVRŠETAK (TOTAL CLEANUP)

# Vrati se na početak (ovo briše tvoju granu i sinhronizuje master)

npm run git:reset -- --yes

===============================
🚀 RELEASE WORKFLOW (MANUAL TRIGGER)
===============================

# Koristi se SAMO kada odlučiš da je vreme za novu verziju (npr. v1.1.0).

# Ovo radiš NA MASTER grani nakon pull-a.

# 1. Trigger Release (Odaberi tip)

# Za Patch (Bug fix, npr. 1.0.0 -> 1.0.1):

npm run release -- --release-as patch

# Za Minor (Nove funkcije, npr. 1.0.0 -> 1.1.0):

npm run release -- --release-as minor

# Za Major (Breaking changes, npr. 1.0.0 -> 2.0.0):

npm run release -- --release-as major

# 2. Push to GitHub (Automatski deploy i release notes)

git push --follow-tags
