#!/usr/bin/env node
// scripts/git-cleanup.js

"use strict";

const { spawnSync } = require("node:child_process");

// --------------------------
// Safe command runner (NO shell)
// --------------------------
function sh(cmd, args = [], { stdio = "pipe" } = {}) {
    const useInherit = stdio === "inherit";

    const res = spawnSync(cmd, args, {
        shell: false, // IMPORTANT: avoids shell injection + no need for escaping
        encoding: "utf8",
        stdio: useInherit ? "inherit" : ["ignore", "pipe", "pipe"],
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    if (res.error) throw res.error;
    if (res.status !== 0) {
        const e = new Error(
            `Command failed (${res.status}): ${cmd} ${args.map((a) => JSON.stringify(String(a))).join(" ")}`
        );
        e.status = res.status;
        e.stdout = res.stdout || "";
        e.stderr = res.stderr || "";
        throw e;
    }

    // If stdio is inherit, stdout is not captured
    return String(res.stdout || "").trim();
}

function trySh(cmd, args = [], { stdio = "pipe" } = {}) {
    try {
        return { ok: true, out: sh(cmd, args, { stdio }) };
    } catch (e) {
        return {
            ok: false,
            cmd: [cmd, ...(args || [])].join(" "),
            code: e?.status,
            out: String(e?.stdout || "").trim(),
            err: String(e?.stderr || e?.message || "").trim(),
        };
    }
}

function git(args = [], opts = {}) {
    return sh("git", args, opts);
}
function tryGit(args = [], opts = {}) {
    return trySh("git", args, opts);
}

const ANSI = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
};

function colorize(color, text) {
    if (!process.stdout.isTTY || process.env.NO_COLOR) return text;
    return `${color}${text}${ANSI.reset}`;
}

const YES_LABEL = "✔ YES";
const NO_LABEL = "✖ NO";

function hintLine() {
    const yes = `  [BACKSPACE / ⬅ / Enter / Y] = ${YES_LABEL}`;
    const no = `  [DEL / ➔ / Esc / N] = ${NO_LABEL}`;
    return `${colorize(ANSI.green, yes)}    |   ${colorize(ANSI.red, no)}`;
}

const KEY = {
    ENTER1: "\r",
    ENTER2: "\n",
    ESC: "\x1b",
    BACKSPACE1: "\b",
    BACKSPACE2: "\x7f",
    LEFT: "\x1b[D",
    RIGHT: "\x1b[C",
    DELETE: "\x1b[3~",
};

const YES_KEYS = new Set([KEY.ENTER1, KEY.ENTER2, KEY.BACKSPACE1, KEY.BACKSPACE2, KEY.LEFT, "y", "Y"]);
const NO_KEYS = new Set([KEY.DELETE, KEY.RIGHT, KEY.ESC, "n", "N"]);

function readOneKeyRaw() {
    return new Promise((resolve) => {
        const onData = (buf) => {
            process.stdin.off("data", onData);
            resolve(buf.toString("utf8"));
        };
        process.stdin.on("data", onData);
    });
}

function readLineFallback() {
    return new Promise((resolve) => {
        let acc = "";
        const onData = (chunk) => {
            acc += chunk.toString("utf8");
            if (acc.includes("\n")) {
                process.stdin.off("data", onData);
                resolve(acc);
            }
        };
        process.stdin.on("data", onData);
    });
}

async function askYesNo(question, { defaultYes = false, forceYes = false } = {}) {
    if (forceYes) {
        process.stdout.write(`\n${question}\n${colorize(ANSI.green, `${YES_LABEL} (forced by --yes)\n`)}`);
        return true;
    }

    process.stdout.write(`\n${question}\n${hintLine()}\n> `);

    const wasRaw = !!process.stdin.isRaw;
    process.stdin.setEncoding("utf8");
    process.stdin.resume();

    let rawOk = true;
    try {
        process.stdin.setRawMode(true);
    } catch {
        rawOk = false;
    }

    try {
        if (!rawOk) {
            const line = (await readLineFallback()) || "";
            const v = line.trim().toLowerCase();

            if (v === "y" || v === "yes") {
                process.stdout.write(colorize(ANSI.green, `${YES_LABEL}\n`));
                return true;
            }
            if (v === "n" || v === "no") {
                process.stdout.write(colorize(ANSI.red, `${NO_LABEL}\n`));
                return false;
            }

            process.stdout.write(
                defaultYes ? colorize(ANSI.green, `${YES_LABEL}\n`) : colorize(ANSI.red, `${NO_LABEL}\n`)
            );
            return defaultYes;
        }

        while (true) {
            const k = await readOneKeyRaw();

            if (YES_KEYS.has(k)) {
                process.stdout.write(colorize(ANSI.green, `${YES_LABEL}\n`));
                return true;
            }
            if (NO_KEYS.has(k)) {
                process.stdout.write(colorize(ANSI.red, `${NO_LABEL}\n`));
                return false;
            }
        }
    } finally {
        try {
            process.stdin.setRawMode(wasRaw);
        } catch {}
        process.stdin.pause();
    }
}

function ensureGitRepo() {
    const r = tryGit(["rev-parse", "--is-inside-work-tree"]);
    if (!r.ok || r.out !== "true") {
        console.error("Not a git repository.");
        process.exit(1);
    }
}

function getRepoStatusPorcelain() {
    const r = tryGit(["status", "--porcelain"]);
    if (!r.ok) return "";
    return String(r.out || "").trim();
}

function currentBranch() {
    return git(["rev-parse", "--abbrev-ref", "HEAD"]);
}

function defaultBranchFromOriginHead() {
    const r = tryGit(["symbolic-ref", "refs/remotes/origin/HEAD"]);
    if (r.ok) {
        const m = r.out.match(/^refs\/remotes\/origin\/(.+)$/);
        if (m && m[1]) return m[1];
    }

    const locals = git(["for-each-ref", "--format=%(refname:short)", "refs/heads"])
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

    if (locals.includes("main")) return "main";
    if (locals.includes("master")) return "master";
    return "master";
}

function listLocalBranches() {
    const out = git(["for-each-ref", "--format=%(refname:short)", "refs/heads"]);
    return out
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
}

function listRemoteBranches(remoteName) {
    const out = git(["for-each-ref", "--format=%(refname:short)", `refs/remotes/${remoteName}`]);
    const all = out
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

    const filtered = [];
    for (const b of all) {
        if (b === `${remoteName}/HEAD`) continue;
        filtered.push(b);
    }
    return filtered;
}

function stripRemotePrefix(remoteName, fullRef) {
    const prefix = `${remoteName}/`;
    if (!fullRef.startsWith(prefix)) return fullRef;
    return fullRef.slice(prefix.length);
}

// --------------------------
// MAX1 POST-MERGE NUKE
// --------------------------
async function postMergeNuke({ yes = false } = {}) {
    ensureGitRepo();

    const dirty = getRepoStatusPorcelain();
    if (dirty) {
        console.error("Working tree is NOT clean. Commit/stash changes before running post-merge cleanup.");
        console.error(dirty);
        process.exit(1);
    }

    const remoteName = "origin";
    const def = defaultBranchFromOriginHead();

    console.log(`\n[post-merge] Default branch: ${def}`);
    console.log(`[post-merge] Running: git fetch --all --prune`);
    tryGit(["fetch", "--all", "--prune"], { stdio: "inherit" });

    console.log(`\n[post-merge] Switching to ${def}`);
    tryGit(["switch", def], { stdio: "inherit" });

    console.log(`\n[post-merge] Pulling latest (${def}) (ff-only)`);
    const pullRes = tryGit(["pull", "--ff-only"], { stdio: "inherit" });
    if (!pullRes.ok) {
        console.error(
            "git pull --ff-only failed. Resolve divergence manually (rebase/merge) and retry post-merge cleanup."
        );
        process.exit(1);
    }

    const locals = listLocalBranches();
    const remotes = listRemoteBranches(remoteName);

    const localsToDelete = locals.filter((b) => b && b !== def);
    const remotesToDelete = remotes
        .map((full) => stripRemotePrefix(remoteName, full))
        .filter((b) => b && b !== def);

    console.log("\n[post-merge] Plan:");
    console.log(`  - Keep local:  ${def}`);
    console.log(`  - Delete local branches:  ${localsToDelete.length}`);
    console.log(`  - Keep remote: ${remoteName}/${def}`);
    console.log(`  - Delete remote branches: ${remotesToDelete.length}`);

    const ok = await askYesNo(
        "Proceed with post-merge cleanup: delete ALL local+remote branches except default?",
        {
            defaultYes: false,
            forceYes: yes,
        }
    );
    if (!ok) return;

    // Delete local branches
    if (localsToDelete.length > 0) {
        console.log("\n[post-merge] Deleting local branches (-D):");
        for (const b of localsToDelete) {
            console.log(`  - ${b}`);
            const r = tryGit(["branch", "-D", b], { stdio: "inherit" });
            if (!r.ok) {
                console.log(colorize(ANSI.red, `    Failed to delete local branch: ${b}`));
            }
        }
    }

    // Delete remote branches (skip hooks)
    if (remotesToDelete.length > 0) {
        console.log(
            `\n[post-merge] Deleting remote branches on ${remoteName} (git push --no-verify --delete ...):`
        );
        for (const b of remotesToDelete) {
            console.log(`  - ${remoteName}/${b}`);
            const r = tryGit(["push", "--no-verify", remoteName, "--delete", b], { stdio: "inherit" });
            if (!r.ok) {
                console.log(
                    colorize(
                        ANSI.red,
                        `    Failed to delete remote branch: ${remoteName}/${b} (maybe protected or no permission)`
                    )
                );
            }
        }
    }

    console.log(`\n[post-merge] Pruning remote refs (${remoteName})...`);
    tryGit(["remote", "prune", remoteName], { stdio: "inherit" });

    console.log("\n[post-merge] Running git gc...");
    tryGit(["gc"], { stdio: "inherit" });

    console.log("\n[post-merge] Done.");
}

// --------------------------
// Existing (simple) cleanup mode
// --------------------------
async function simpleCleanup({ yes = false } = {}) {
    ensureGitRepo();

    const dirty = getRepoStatusPorcelain();
    if (dirty) {
        console.log("Working tree is NOT clean:");
        console.log(dirty);
        const cont = await askYesNo("Continue anyway?", { defaultYes: false, forceYes: yes });
        if (!cont) return;
    }

    console.log("\nRunning: git fetch --all --prune");
    tryGit(["fetch", "--all", "--prune"], { stdio: "inherit" });

    const cur = currentBranch();
    const def = defaultBranchFromOriginHead();

    const goneOut = git(["branch", "-vv"]);
    const gone = goneOut
        .split("\n")
        .map((l) => l.trimEnd())
        .filter((l) => l.includes(": gone]"))
        .map(
            (l) =>
                l
                    .replace(/^\*\s+/, "")
                    .trim()
                    .split(/\s+/)[0]
        )
        .filter(Boolean)
        .filter((b) => b !== cur);

    if (gone.length) {
        console.log("\nBranches with upstream ': gone]':");
        gone.forEach((b) => console.log(`  - ${b}`));

        if (await askYesNo("Delete these local branches?", { defaultYes: false, forceYes: yes })) {
            for (const b of gone) {
                console.log(`Deleting: ${b}`);
                tryGit(["branch", "-D", b], { stdio: "inherit" });
            }
        }
    }

    const mergedRes = tryGit(["branch", "--merged", def]);
    const merged = mergedRes.ok
        ? mergedRes.out
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => l.replace(/^\*\s+/, "").trim())
              .filter((b) => {
                  if (!b) return false;
                  if (b === cur) return false;
                  if (b === def) return false;
                  if (b === "main" || b === "master" || b === "develop") return false;
                  return true;
              })
        : [];

    if (merged.length) {
        console.log(`\nMerged into ${def}:`);
        merged.forEach((b) => console.log(`  - ${b}`));

        if (
            await askYesNo("Delete these merged branches (safe: git branch -d)?", {
                defaultYes: false,
                forceYes: yes,
            })
        ) {
            for (const b of merged) {
                const r = tryGit(["branch", "-d", b], { stdio: "inherit" });
                if (!r.ok) {
                    const force = await askYesNo(`Force delete (-D) for ${b}?`, {
                        defaultYes: false,
                        forceYes: yes,
                    });
                    if (force) tryGit(["branch", "-D", b], { stdio: "inherit" });
                }
            }
        }
    }

    if (await askYesNo("\nRun: git remote prune origin? ", { defaultYes: false, forceYes: yes })) {
        tryGit(["remote", "prune", "origin"], { stdio: "inherit" });
    }

    if (await askYesNo("\nRun: git gc? ", { defaultYes: false, forceYes: yes })) {
        tryGit(["gc"], { stdio: "inherit" });
    }

    console.log("\nDone.");
}

function parseArgs(argv) {
    const out = {
        postMerge: false,
        yes: false,
    };

    for (const a of argv) {
        if (a === "--post-merge" || a === "--post-merge-nuke" || a === "--after-merge") {
            out.postMerge = true;
        }
        if (a === "--yes" || a === "-y") {
            out.yes = true;
        }
    }

    return out;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (args.postMerge) {
        await postMergeNuke({ yes: args.yes });
        return;
    }

    await simpleCleanup({ yes: args.yes });
}

main().catch((e) => {
    console.error(e?.message || e);
    process.exit(1);
});
