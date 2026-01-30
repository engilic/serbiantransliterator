=== GOD MODE WORKFLOW v1.0.0 ===

# 1. FAZA: PRIPREMA

# Uvek radiš na čistom masteru pre početka novog zadatka.

git checkout master
git pull --ff-only
git checkout -b feat/tvoj-zadatak

# 2. FAZA: RAZVOJ

# Tokom rada koristiš brzu proveru da bi bio siguran da build prolazi.

npm run verify:all -- --fast

# 3. FAZA: FINALNA VERIFIKACIJA

# Pre nego što uopšte pomisliš na push, moraš proći kroz Guardian Gate.

npm run verify:all

# Šta će se desiti:

# - Ako si pogrešno kopirao kod -> Mismatch Alarm te zaustavlja.

# - Ako si pokvario A11y -> Playwright te zaustavlja.

# - Ako je pokrivenost pala -> Vitest te zaustavlja.

# 4. FAZA: SMART PUSH

# Kada sistem ispiše 🏆 SPREMNO ZA DEPLOY, sledi push.

# Ako si na masteru, bićeš pitan: "Master je ZAŠTIĆEN. Kreirati PR granu?"

# Odgovori sa ENTER (DA).

# 5. FAZA: GITHUB MERGE

# Klikni na link u terminalu, otvori PR i spoji ga.

# Nakon toga uradi 'git checkout master' i 'git pull'.
