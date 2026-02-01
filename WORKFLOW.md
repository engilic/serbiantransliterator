=== STANDARD WORKFLOW (WORKFLOW v6.1 - MAX3 EDITION) ===

ENVIRONMENT INFO:
IDE: Visual Studio 2026
Terminal: PowerShell 7
OS: Windows 11 Home

===============================

1. PREP (START & CLEAN)

git checkout master
git pull --ff-only
git checkout -b feat/your-task-name

(Optional: hard reset if repo is in a bad state)
npm run git:reset -- --yes

===============================

2. DEV LOOP

# code...

# quick checks

npm run lint:fix
npm run build
npm run serve:dist

===============================

3. FINAL VERIFICATION (PRE-PUSH)

# Full repo guardian (formats, lint, typecheck, manifests validate, rust checks, build, tests)

npm run verify:all -- --no-push

# Strict mode (adds extra security gates like audit)

npm run verify:all:strict -- --no-push

# Fast mode (skips Unit/E2E)

npm run verify:all -- --fast --no-push

NOTE:

- If you use --fast, Unit/E2E (and coverage) are skipped.
- For coverage, run without --fast.

===============================

4. COMMIT, PUSH, PR

git add -A
git commit -m "feat: describe change"

# Normal push (Husky pre-push runs typecheck/tests)

git push -u origin feat/your-task-name

# Optional: push via verify (smart push prompt at end)

# (Verify-driven push may skip Husky pre-push to avoid duplicate checks)

npm run verify:all

Then:

- Open PR, fill template, wait for CI green, Squash & Merge.

===============================

5. FINISH (TOTAL CLEANUP)

npm run git:reset -- --yes

===============================
RELEASE WORKFLOW (MANUAL TRIGGER)
===============================

# Run on master after pulling latest changes.

npm run release

# (follow prompts)

git push --follow-tags
