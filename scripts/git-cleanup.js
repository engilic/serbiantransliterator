#!/usr/bin/env node
"use strict";

const { execSync } = require("node:child_process");

/* -------------------------
   Shell helpers
------------------------- */

function sh(cmd, { stdio = "pipe" } = {}) {
    return execSync(cmd, { encoding: "utf8", stdio }).trim();
}

function trySh(cmd, { stdio = "pipe" } = {}) {
    try {
        return { ok: true, out: sh(cmd, { stdio }) };
    } catch (e) {
        return {
            ok: false,
            cmd,
            code: e?.status,
            out: (e?.stdout || "").toString("utf8").trim(),
            err: (e?.stderr || "").toString("utf8").trim(),
        };
    }
}

function escArg(s) {
    if (/^[a-zA-Z0-9._/-]+$/.test(s)) return s;
    return `"${String(s).replace(/"/g, '\\"')}"`;
}

/* -------------------------
   Colors + labels
------------------------- */

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

/* -------------------------
   Raw key YES/NO prompt
------------------------- */

function hintLine() {
    const yes = `  [BACKSPACE / ⬅ / Enter / Y] = ${YES_LABEL}`;
    const no = `  [DEL / ➔ / Esc / N] = ${NO_LABEL}`;
    return `${colorize(ANSI.green, yes)}   |   ${colorize(ANSI.red, no)}`;
}

// Raw key sequences (najčešće u terminalima)
const KEY = {
    ENTER1: "\r",
    ENTER2: "\n",
    ESC: "\x1b",
    BACKSPACE1: "\b", // 0x08
    BACKSPACE2: "\x7f", // 0x7f (često backspace u raw-mode)
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

async function askYesNo(question, { defaultYes = false } = {}) {
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
            // fallback (npr. CI): kucaj Y/N pa Enter
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
            // ignoriši sve ostalo
        }
    } finally {
        try {
            process.stdin.setRawMode(wasRaw);
        } catch {
            // ignore
        }
        process.stdin.pause();
    }
}

/* -------------------------
   Git discovery helpers
------------------------- */

function ensureGitRepo() {
    const r = trySh("git rev-parse --is-inside-work-tree");
    if (!r.ok || r.out !== "true") {
        console.error("Not a git repository.");
        process.exit(1);
    }
}

function currentBranch() {
    return sh("git rev-parse --abbrev-ref HEAD");
}

function defaultBranchFromOriginHead() {
    // refs/remotes/origin/HEAD -> refs/remotes/origin/master|main|...
    const r = trySh("git symbolic-ref refs/remotes/origin/HEAD");
    if (r.ok) {
        const m = r.out.match(/^refs\/remotes\/origin\/(.+)$/);
        if (m && m[1]) return m[1];
    }

    // fallback
    const locals = sh("git for-each-ref --format='%(refname:short)' refs/heads")
        .split("\n")
        .map((s) => s.replace(/^'|'$/g, "").trim())
        .filter(Boolean);

    if (locals.includes("main")) return "main";
    if (locals.includes("master")) return "master";
    return "master";
}

function branchesWithGoneUpstream() {
    const out = sh("git branch -vv");
    return out
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
        .filter(Boolean);
}

function mergedBranches(intoBranch) {
    const r = trySh(`git branch --merged ${escArg(intoBranch)}`);
    if (!r.ok) return [];
    return r.out
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(/^\*\s+/, "").trim());
}

/* -------------------------
   Main
------------------------- */

async function main() {
    ensureGitRepo();

    // Ako ima lokalnih izmena, pitaj da li nastavljamo
    const dirty = sh("git status --porcelain");
    if (dirty) {
        console.log("Working tree is NOT clean:");
        console.log(dirty);
        const cont = await askYesNo("Continue anyway?");
        if (!cont) return;
    }

    // Fetch + prune
    console.log("\nRunning: git fetch --all --prune");
    trySh("git fetch --all --prune", { stdio: "inherit" });

    const cur = currentBranch();
    const def = defaultBranchFromOriginHead();

    // 1) Upstream gone
    const gone = branchesWithGoneUpstream().filter((b) => b !== cur);
    if (gone.length) {
        console.log("\nBranches with upstream ': gone]':");
        gone.forEach((b) => console.log(`  - ${b}`));

        if (await askYesNo("Delete these local branches?")) {
            for (const b of gone) {
                console.log(`Deleting: ${b}`);
                trySh(`git branch -D ${escArg(b)}`, { stdio: "inherit" });
            }
        }
    }

    // 2) Merged into default
    const merged = mergedBranches(def).filter((b) => {
        if (!b) return false;
        if (b === cur) return false;
        if (b === def) return false;
        // dodatna zaštita
        if (b === "main" || b === "master" || b === "develop") return false;
        return true;
    });

    if (merged.length) {
        console.log(`\nMerged into ${def}:`);
        merged.forEach((b) => console.log(`  - ${b}`));

        if (await askYesNo("Delete these merged branches (safe: git branch -d)?")) {
            for (const b of merged) {
                const r = trySh(`git branch -d ${escArg(b)}`, { stdio: "inherit" });
                if (!r.ok) {
                    const force = await askYesNo(`Force delete (-D) for ${b}?`, {
                        defaultYes: false,
                    });
                    if (force) {
                        trySh(`git branch -D ${escArg(b)}`, { stdio: "inherit" });
                    }
                }
            }
        }
    }

    // 3) Optional: prune origin
    if (await askYesNo("\nRun: git remote prune origin? ", { defaultYes: false })) {
        trySh("git remote prune origin", { stdio: "inherit" });
    }

    // 4) Optional: git gc
    if (await askYesNo("\nRun: git gc? ", { defaultYes: false })) {
        trySh("git gc", { stdio: "inherit" });
    }

    console.log("\nDone.");
}

main().catch((e) => {
    console.error(e?.message || e);
    process.exit(1);
});
