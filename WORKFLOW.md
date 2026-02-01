=== STANDARD WORKFLOW (WORKFLOW v6.2 - MAX3 / GOD1 EDITION) ===

ENVIRONMENT INFO:
IDE: Visual Studio 2026
Terminal: PowerShell 7
OS: Windows 11 Home

===============================

0. QUICK SANITY (avoid detached HEAD)

git status
git rev-parse --abbrev-ref HEAD

If you see "HEAD" (detached), create a branch before you do anything:
git switch -c feat/your-task-name

===============================

1. PREP (START & CLEAN)

git switch master
git pull --ff-only
git switch -c feat/your-task-name

(Optional: cleanup local branches / prune origin)
npm run git:reset

NOTE:

- `npm run git:reset` runs `scripts/git-cleanup.js` (branch cleanup, prune, optional gc).
- It is NOT the same as "hard reset the working tree".

(Optional: TRUE nuclear reset to remote master — deletes local changes!)
git fetch origin --prune
git reset --hard origin/master
git clean -fd

(Optional: NUKE branches — deletes local branches + attempts remote delete; remote protected branches may fail)
npm run git:reset -- --nuke-branches --no-token-confirm

NOTE:

- NUKE remote deletes use `git push --no-verify --delete` to avoid triggering Husky hooks/tests.

===============================

2. DEV LOOP

# code...

# quick checks

npm run lint:fix
npm run build

# Web Mode (quick browser check)

npm run serve:dist

(Optional: Word taskpane dev)
npm run dev

===============================

3. FINAL VERIFICATION (PRE-PUSH)

# Full repo guardian (formats, lint, typecheck, manifests validate, rust checks, build, tests)

npm run verify:all -- --no-push

# Strict mode (adds extra security gates like audit)

npm run verify:all:strict -- --no-push

# Fast mode (skips Unit/E2E + coverage)

npm run verify:all -- --fast --no-push

NOTES:

- If you use --fast, Unit/E2E (and coverage) are skipped.
- For coverage, run verify without --fast.
- `verify:all` already includes lint + typecheck before tests.

===============================

4. COMMIT, PUSH, PR

git add -A
git commit -m "feat: describe change"

# Normal push (Husky hooks may run, depending on your repo setup)

git push -u origin feat/your-task-name

# Optional: push via verify (interactive push prompt at end)

# (Verify-driven push may bypass hooks to avoid duplicate checks; prefer --no-push in CI-like flows)

npm run verify:all

Then:

- Open PR
- Fill template
- Wait for CI green
- Squash & Merge

===============================

5. FINISH (TOTAL CLEANUP)

# Return to master and sync

git switch master
git pull --ff-only

# Optional: cleanup local merged branches / gone upstream refs

npm run git:reset

(Optional: if you want a true "wipe local state" cleanup)
git fetch origin --prune
git reset --hard origin/master
git clean -fd

===============================
RELEASE WORKFLOW (MANUAL TRIGGER)
===============================

# Run on master after pulling latest changes.

git switch master
git pull --ff-only

npm run release
git push --follow-tags
