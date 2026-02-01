#!/usr/bin/env node
// scripts/verify-all.js

"use strict";

// Force colors also for THIS Node process (not only child processes)
process.env.FORCE_COLOR = process.env.FORCE_COLOR || "1";

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { C, color } = require("./_ui.cjs");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");

const ARGS = process.argv.slice(2);
const IS_FAST_MODE = ARGS.includes("--fast");
const NO_PUSH = ARGS.includes("--no-push");
const IS_STRICT = ARGS.includes("--strict");

const TIMINGS = [];
const EXECUTED = [];
const SKIPPED = [];

let STEP_NO = 0;

function nextStep(title) {
    const n = STEP_NO++;
    return `${n}. ${title}`;
}

function runStep(title, cmd, args, cwd = ROOT) {
    return run(nextStep(title), cmd, args, cwd);
}

function runInlineStep(title, fn) {
    return runInline(nextStep(title), fn);
}

// --------------------------
// Small helpers
// --------------------------
function resolveCmd(cmd) {
    // On Windows, npm/npx are .cmd
    if (process.platform === "win32") {
        if (cmd === "npm") return "npm.cmd";
        if (cmd === "npx") return "npx.cmd";
    }
    return cmd;
}

/**
 * Cross-platform spawn:
 * - keep shell:false (safer)
 * - BUT on Windows, npm/npx are .cmd shims and often fail with shell:false
 *   so we run them via cmd.exe /c (still shell:false).
 */
function spawnCross(cmd, args, opts) {
    const isWin = process.platform === "win32";
    const c = String(cmd);

    // npm/npx on Windows are .cmd shims -> run via cmd.exe
    if (isWin && /^(npm|npx)(\.cmd)?$/i.test(c)) {
        const base = c.replace(/\.cmd$/i, ""); // npm.cmd -> npm
        const comspec = process.env.ComSpec || "cmd.exe";
        return spawnSync(comspec, ["/d", "/s", "/c", base, ...(args || [])], {
            ...opts,
            shell: false,
        });
    }

    return spawnSync(cmd, args, { ...opts, shell: false });
}

function quoteForDisplay(s) {
    const v = String(s);
    if (/^[a-zA-Z0-9._\/:-]+$/.test(v)) return v;
    return JSON.stringify(v);
}

function cmdLineForDisplay(cmd, args) {
    return [cmd, ...(args || []).map(quoteForDisplay)].join(" ");
}

// --------------------------
// UI helpers
// --------------------------
function beep() {
    process.stdout.write("\x07");
}

function printBanner() {
    console.log(color(C.magenta + C.bold, "\n🛡️  GUARDIAN SYSTEM • GOD1 VERIFY 🛡️\n"));
    if (IS_STRICT) console.log(color(C.yellow + C.bold, "   (STRICT MODE ENABLED)\n"));
}

function stepNo(step) {
    const m = String(step).match(/^(\d+)\./);
    return m ? m[1] : "?";
}

function die(step) {
    beep();
    console.error(`\n${color(C.bgRed, " ❌ FATAL ERROR: " + step + " ")}\n`);
    printFinalReport();
    process.exit(1);
}

// --------------------------
// Runner helpers (NO SHELL)
// --------------------------
function run(step, cmd, args, cwd = ROOT) {
    EXECUTED.push(step);

    // brighter title (bold + bright cyan)
    const STEP_STYLE = "\x1b[1m\x1b[96m";
    console.log(color(STEP_STYLE, `\n>>> ${step}`));
    console.log(color(C.gray, `    $ ${cmdLineForDisplay(resolveCmd(cmd), args)}`));

    const start = Date.now();

    const res = spawnCross(resolveCmd(cmd), args, {
        cwd,
        stdio: "inherit",
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    TIMINGS.push({ step, time: ((Date.now() - start) / 1000).toFixed(2) });

    if (res.error) console.error(res.error);
    if (res.status !== 0) die(step);

    console.log(color(C.green, `\n✅ [${stepNo(step)}] OK — ${step}\n`));
}

async function runInline(step, fn) {
    EXECUTED.push(step);

    const STEP_STYLE = "\x1b[1m\x1b[96m";
    console.log(color(STEP_STYLE, `\n>>> ${step}`));
    const start = Date.now();

    try {
        await fn();
    } catch (e) {
        console.error(e?.stack || e?.message || e);
        die(step);
    } finally {
        TIMINGS.push({ step, time: ((Date.now() - start) / 1000).toFixed(2) });
    }

    console.log(color(C.green, `\n✅ [${stepNo(step)}] OK — ${step}\n`));
}

// --------------------------
// Prettier stats runner (captures output + prints file stats)
// --------------------------
function stripAnsi(s) {
    return String(s || "").replace(/\x1b\[[0-9;]*m/g, "");
}

function parsePrettierWriteOutput(allOut) {
    const lines = stripAnsi(allOut)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    // Prettier --write typically prints:
    // "file.ext 12ms" OR "file.ext 12ms (unchanged)"
    const fileLines = [];
    for (const l of lines) {
        if (/\s\d+ms(\s+\(unchanged\))?\s*$/.test(l)) fileLines.push(l);
    }

    let unchanged = 0;
    let changed = 0;

    for (const l of fileLines) {
        if (/\(unchanged\)\s*$/.test(l)) unchanged++;
        else changed++;
    }

    return { total: fileLines.length, changed, unchanged };
}

function runWithStats_PrettyWrite(step, cmd, args, cwd = ROOT) {
    EXECUTED.push(step);

    const STEP_STYLE = "\x1b[1m\x1b[96m";
    console.log(color(STEP_STYLE, `\n>>> ${step}`));
    console.log(color(C.gray, `    $ ${cmdLineForDisplay(resolveCmd(cmd), args)}`));

    const start = Date.now();

    const res = spawnCross(resolveCmd(cmd), args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    // print original output (like stdio: "inherit")
    if (res.stdout) process.stdout.write(res.stdout);
    if (res.stderr) process.stderr.write(res.stderr);

    TIMINGS.push({ step, time: ((Date.now() - start) / 1000).toFixed(2) });

    if (res.error) console.error(res.error);
    if (res.status !== 0) die(step);

    const combined = String(res.stdout || "") + "\n" + String(res.stderr || "");
    const stats = parsePrettierWriteOutput(combined);

    // ✅ aligned numbers (right aligned)
    console.log(color(C.cyan, "\n📎 Prettier --write stats:"));
    const rows = [
        ["total files", stats.total],
        ["changed", stats.changed],
        ["unchanged", stats.unchanged],
    ];
    const keyW = Math.max(...rows.map(([k]) => k.length));
    const valW = Math.max(...rows.map(([, v]) => String(v).length));
    for (const [k, v] of rows) {
        console.log(`   • ${k.padEnd(keyW)}: ${String(v).padStart(valW)}`);
    }

    console.log(color(C.green, `\n✅ [${stepNo(step)}] OK — ${step}\n`));
}

// --------------------------
// YES/NO prompt (used for rustfmt + push)
// --------------------------
function canRawMode() {
    return !!process.stdin.isTTY && typeof process.stdin.setRawMode === "function";
}

async function askYesNo(q) {
    return new Promise((resolve) => {
        console.log(`\n${color(C.magenta, "❓ " + q)}`);
        console.log(
            `   ${color(C.green, "[BACKSPACE / ⬅ / Enter / Y] = ✔ YES")}    |   ${color(
                C.red,
                "[DEL / ➔ / Esc / N] = ✖ NO"
            )}`
        );

        process.stdin.setEncoding("utf8");
        process.stdin.resume();

        if (!canRawMode()) {
            // fallback: Y/N + Enter
            const onData = (chunk) => {
                const v = String(chunk || "")
                    .trim()
                    .toLowerCase();
                process.stdin.off("data", onData);
                process.stdin.pause();

                if (v.startsWith("y")) {
                    process.stdout.write(color(C.green, "✔ YES\n"));
                    return resolve(true);
                }
                process.stdout.write(color(C.red, "✖ NO\n"));
                return resolve(false);
            };
            process.stdin.on("data", onData);
            return;
        }

        process.stdin.setRawMode(true);

        const listener = (k) => {
            if (k === "\u0003") {
                cleanup(false);
                process.exit(1);
            }

            if (
                k === "y" ||
                k === "Y" ||
                k === "\r" ||
                k === "\n" ||
                k === "\u007f" ||
                k === "\u0008" ||
                k === "\u001b[D"
            ) {
                process.stdout.write(color(C.green, "✔ YES\n"));
                cleanup(true);
            } else if (k === "n" || k === "N" || k === "\u001b" || k === "\u001b[3~" || k === "\u001b[C") {
                process.stdout.write(color(C.red, "✖ NO\n"));
                cleanup(false);
            }
        };

        function cleanup(result) {
            try {
                process.stdin.setRawMode(false);
            } catch {}
            process.stdin.pause();
            process.stdin.removeListener("data", listener);
            resolve(result);
        }

        process.stdin.on("data", listener);
    });
}

// --------------------------
// Misc helpers
// --------------------------
function detectPowerShell() {
    const candidates = ["pwsh", "powershell"];
    for (const exe of candidates) {
        const r = spawnSync(exe, ["-NoProfile", "-Command", "Write-Output 1"], {
            encoding: "utf8",
            shell: false,
            stdio: ["ignore", "ignore", "ignore"],
        });
        if (r.status === 0) return exe;
    }
    return null;
}

function checkEnv() {
    if (!fs.existsSync(path.join(ROOT, ".env")) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.error(color(C.red, "❌ Nedostaje .env fajl!"));
        process.exit(1);
    }
}

function runCmdStatus(cmd, args, cwd) {
    const res = spawnCross(resolveCmd(cmd), args, {
        cwd,
        stdio: "inherit",
        env: { ...process.env, FORCE_COLOR: "1" },
    });
    return res.status ?? 1;
}

function gitDiffNameOnly() {
    const res = spawnSync("git", ["diff", "--name-only"], {
        cwd: ROOT,
        encoding: "utf8",
        shell: false,
        stdio: ["ignore", "pipe", "ignore"],
    });

    return String(res.stdout || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
}

function getRepoStatusPorcelain() {
    const res = spawnSync("git", ["status", "--porcelain"], {
        cwd: ROOT,
        encoding: "utf8",
        shell: false,
        stdio: ["ignore", "pipe", "ignore"],
    });

    if (res.status && res.status !== 0) return "";
    return String(res.stdout || "").trim();
}

function hashFileSha256(filePath) {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buf).digest("hex");
}

function printFinalReport() {
    console.log(color(C.cyan, "\n📊 TIMINGS REPORT:"));
    if (TIMINGS.length === 0) {
        console.log(color(C.gray, "   (no timings recorded)"));
    } else {
        // Parse "N. Title" (if present)
        const rows = TIMINGS.map((t) => {
            const m = String(t.step).match(/^(\d+)\.\s*(.*)$/);
            const no = m ? m[1] : "";
            const title = m ? m[2] : String(t.step);
            const time = `${t.time}s`;
            return { no, title, time };
        });

        const noW = Math.max(2, ...rows.map((r) => r.no.length)); // aligns 0..20..100
        const titleW = Math.max(...rows.map((r) => r.title.length)); // title column
        const totalTime = TIMINGS.reduce((acc, t) => acc + (Number(t.time) || 0), 0).toFixed(2) + "s";
        const timeW = Math.max(...rows.map((r) => r.time.length), totalTime.length); // include TOTAL!

        for (const r of rows) {
            const left = `${r.no.padStart(noW)}. ${r.title}`.padEnd(noW + 2 + titleW);
            const right = r.time.padStart(timeW);
            console.log(`   • ${left} : ${right}`);
        }

        // TOTAL: aligned with titles, but WITHOUT dot/number
        const totalLeft = `${"".padStart(noW)}  TOTAL`.padEnd(noW + 2 + titleW);
        console.log(color(C.magenta + C.bold, `     ${totalLeft} : ${totalTime.padStart(timeW)}`));
    }

    console.log(color(C.cyan, "\n📎 EXECUTION REPORT:"));
    console.log(`   • strict: ${IS_STRICT ? "YES" : "NO"}`);
    console.log(`   • fast:   ${IS_FAST_MODE ? "YES" : "NO"}`);
    console.log(`   • push:   ${NO_PUSH ? "DISABLED (--no-push)" : "PROMPT (enabled)"}`);
    if (!NO_PUSH) {
        const cur = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
            cwd: ROOT,
            shell: false,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        }).stdout.trim();

        const isProtected = cur === "master" || cur === "main";
        console.log(`   • branch: ${cur}`);
        console.log(
            color(
                C.gray,
                `   • push flow: ${isProtected ? "auto-branch + push (on confirm)" : "push current branch (on confirm)"}`
            )
        );
    }

    if (SKIPPED.length > 0) {
        console.log(color(C.yellow, "\n   • skipped steps:"));
        SKIPPED.forEach((s) => console.log(`     - ${s}`));
    }

    console.log(color(C.cyan, "\n📎 REPO STATUS:"));
    const st = getRepoStatusPorcelain();
    if (!st) {
        console.log(color(C.green, "   ✔ clean (no uncommitted changes)"));
    } else {
        console.log(color(C.yellow, "   ⚠ dirty (changes detected):"));
        st.split("\n")
            .slice(0, 80)
            .forEach((l) => console.log(`     ${l}`));
        const total = st.split("\n").filter(Boolean).length;
        if (total > 80) console.log(color(C.gray, `     ...and ${total - 80} more`));
    }

    console.log("");
}

// --------------------------
// 3) Sniffer & Secret Hunter (aligned report)
// --------------------------
async function runSniffer() {
    const filesOut = spawnSync("git", ["ls-files"], { shell: false, encoding: "utf8" }).stdout || "";
    const files = String(filesOut)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter(
            (f) =>
                f.endsWith(".ts") ||
                f.endsWith(".tsx") ||
                f.endsWith(".js") ||
                f.endsWith(".cjs") ||
                f.endsWith(".mjs")
        );

    let scanned = 0;
    let skipped = 0;
    let secretHits = 0;
    let debuggerHits = 0;

    const samples = [];
    const MAX = 20;

    const secrets = [
        /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA)[A-Z0-9]{16}/,
        /-----BEGIN PRIVATE KEY-----/,
        /sk_live_[0-9a-zA-Z]{24}/,
    ];

    for (const f of files) {
        if (f.startsWith("scripts/") || f.includes("test") || f.includes("spec")) {
            skipped++;
            continue;
        }

        scanned++;

        let content = "";
        try {
            content = fs.readFileSync(path.join(ROOT, f), "utf8");
        } catch {
            continue;
        }

        for (const re of secrets) {
            if (re.test(content)) {
                secretHits++;
                if (samples.length < MAX) samples.push(`SECRET: ${f}`);
                break;
            }
        }

        if (content.includes("debugger")) {
            debuggerHits++;
            if (samples.length < MAX) samples.push(`DEBUGGER: ${f}`);
        }
    }

    console.log(color(C.cyan, "📎 Sniffer report:"));

    const rows = [
        ["scanned", scanned, ""],
        ["skipped", skipped, " (scripts/ + test/spec)"],
        ["secrets", secretHits, ""],
        ["debugger", debuggerHits, ""],
    ];

    const keyW = Math.max(...rows.map(([k]) => k.length));
    const valW = Math.max(...rows.map(([, v]) => String(v).length));

    for (const [k, v, extra] of rows) {
        console.log(`   • ${k.padEnd(keyW)}: ${String(v).padStart(valW)}${extra}`);
    }

    if (samples.length) {
        console.log(color(C.yellow, "   • samples:"));
        for (const s of samples) console.log(`     - ${s}`);
        if (secretHits + debuggerHits > samples.length) console.log(`     - ...and more`);
    }

    if (secretHits + debuggerHits > 0) {
        beep();
        throw new Error(`Sniffer failed: found ${secretHits + debuggerHits} issues`);
    }
}

// --------------------------
// Rust fmt gate (check -> ask -> fmt -> recheck)
// --------------------------
async function rustFmtGate() {
    const before = new Set(gitDiffNameOnly());

    const statusCheck = runCmdStatus("cargo", ["fmt", "--all", "--", "--check"], WASM_DIR);
    if (statusCheck === 0) return;

    console.log(color(C.yellow, "\n⚠ Rustfmt wants to change files."));
    const doFix = await askYesNo("Apply Rust auto-format now? (cargo fmt)");
    if (!doFix) throw new Error("Rust fmt check failed and auto-format was declined.");

    const statusFix = runCmdStatus("cargo", ["fmt", "--all"], WASM_DIR);
    if (statusFix !== 0) throw new Error("cargo fmt failed.");

    const after = new Set(gitDiffNameOnly());
    const changedNow = [...after].filter((f) => !before.has(f));

    console.log(color(C.cyan, "\n📎 Rustfmt changed files:"));
    if (changedNow.length === 0) {
        console.log(color(C.gray, "   (no new files detected as changed; maybe repo was already dirty)"));
    } else {
        changedNow.forEach((f) => console.log(`   - ${f}`));
    }

    const statusRecheck = runCmdStatus("cargo", ["fmt", "--all", "--", "--check"], WASM_DIR);
    if (statusRecheck !== 0) throw new Error("Rust fmt still not clean after auto-format.");
}

// --------------------------
// Rust tests: quiet run + pretty aligned report
// --------------------------
async function runRustTestsAligned() {
    const r1 = spawnSync("cargo", ["test", "--", "--quiet"], {
        cwd: WASM_DIR,
        shell: false,
        stdio: "inherit",
        env: { ...process.env, FORCE_COLOR: "1" },
    });
    if (r1.status !== 0) throw new Error("cargo test failed");

    const r2 = spawnSync("cargo", ["test", "--", "--list"], {
        cwd: WASM_DIR,
        shell: false,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    const out = String(r2.stdout || "");
    const names = out
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .filter((l) => l.endsWith(": test"))
        .map((l) => l.replace(/:\s*test\s*$/, "").trim());

    console.log(`running ${names.length} tests`);

    const leftParts = names.map((n) => `test ${n} `);
    const maxLeft = leftParts.reduce((m, s) => Math.max(m, s.length), 0);

    // ✅ requested: minimum dots on the LONGEST line
    const MIN_DOTS = 5;

    const RIGHT = ` ${color(C.green, "ok")}`;
    const RIGHT_VISIBLE_LEN = 3; // " ok"
    const WIDTH = maxLeft + MIN_DOTS + RIGHT_VISIBLE_LEN;

    for (const left of leftParts) {
        const dotsCount = Math.max(MIN_DOTS, WIDTH - left.length - RIGHT_VISIBLE_LEN);
        const dots = ".".repeat(dotsCount);
        console.log(`${left}${dots}${RIGHT}`);
    }
}

// --------------------------
// Main
// --------------------------
async function main() {
    printBanner();
    checkEnv();

    const ps = detectPowerShell();
    if (!ps) {
        console.error(color(C.red, "❌ PowerShell (pwsh/powershell) not found. Can't auto-fix headers."));
        process.exit(1);
    }

    runStep("Header Auto-Fix", ps, [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "scripts/add-headers.ps1",
    ]);
    runStep("Merge Conflict Markers", "node", ["scripts/checkConflicts.cjs"]);

    // Large files gate (max 5MB per tracked file)
    runStep("Large Files Gate", "node", ["scripts/checkBigFiles.cjs", "--max-mb=5"]);

    await runInlineStep("Sniffer & Secret Hunter", runSniffer);

    runStep("I18n Keys Integrity", "node", ["scripts/checkI18nKeys.cjs"]);
    runStep("No Hardcoded User Strings", "node", ["scripts/checkUserFacingStrings.cjs"]);
    runStep("taskpane.html I18n", "node", ["scripts/checkTaskpaneHtmlI18n.cjs"]);

    // Lockfile integrity around npm ci
    const lockPath = path.join(ROOT, "package-lock.json");
    const lockHashBefore = fs.existsSync(lockPath) ? hashFileSha256(lockPath) : null;

    const INSTALL_STEP = nextStep("Install (npm ci)");
    run(INSTALL_STEP, "npm", ["ci"]);

    const lockHashAfter = fs.existsSync(lockPath) ? hashFileSha256(lockPath) : null;
    if (lockHashBefore && lockHashAfter && lockHashBefore !== lockHashAfter) {
        die(`${INSTALL_STEP} / Lockfile integrity`);
    }

    // Prettier: ALWAYS FIX, THEN CHECK (no prompt)
    runWithStats_PrettyWrite(nextStep("Format (prettier --write)"), "npm", ["run", "format:fix"]);
    runStep("Format check (prettier --check)", "npm", ["run", "format:check"]);

    runStep("Lint (eslint)", "npm", ["run", "lint"]);
    runStep("Typecheck", "npm", ["run", "typecheck"]);

    // NOTE: removed "update:version" step to avoid duplication (build prebuild runs it)
    runStep("Manifest validate (dev)", "npm", ["run", "validate"]);
    runStep("Manifest validate (prod)", "npm", ["run", "validate:prod"]);

    if (IS_STRICT) {
        runStep("Audit (high)", "npm", ["run", "audit:high"]);
    } else {
        SKIPPED.push("Audit (high) (strict-only)");
    }

    await runInlineStep("Rust fmt (check + auto-fix)", rustFmtGate);
    runStep("Rust clippy (-Dwarnings)", "cargo", ["clippy", "--", "-Dwarnings"], WASM_DIR);
    await runInlineStep("Rust tests", runRustTestsAligned);

    // Clean build gate
    runStep("Clean (pre-build)", "npm", ["run", "clean"]);
    const BUILD_STEP = nextStep("Build");
    run(BUILD_STEP, "npm", ["run", "build"]);

    // Validate output artifacts
    const wasmPath = path.join(WASM_DIR, "pkg/serbian_transliterator_wasm_bg.wasm");
    if (fs.existsSync(wasmPath) && fs.statSync(wasmPath).size / 1024 / 1024 > 2.0) {
        console.error(color(C.red, "❌ WASM prevelik!"));
        die(BUILD_STEP);
    }
    if (!fs.existsSync(path.join(ROOT, "dist", "taskpane.html"))) {
        console.error(color(C.red, "❌ Build failed (no dist/taskpane.html)"));
        die(BUILD_STEP);
    }

    // ✅ Tests (ALWAYS coverage when not --fast)
    if (!IS_FAST_MODE) {
        runStep("Unit Tests (coverage)", "npm", ["run", "test:coverage"]);

        runStep("E2E Tests (trace on failure)", "npm", [
            "run",
            "test:e2e",
            "--",
            "--trace",
            "retain-on-failure",
        ]);
    } else {
        SKIPPED.push("Unit Tests (fast)");
        SKIPPED.push("E2E Tests (fast)");
        console.log(color(C.gray, "\n(FAST MODE) Skipping Unit/E2E tests.\n"));
    }

    beep();
    console.log(color(C.green + C.bold, "\n🏆 GOD1 VERIFY PASSED!\n"));

    printFinalReport();

    if (NO_PUSH) return;

    // --------------------------
    // Dirty repo gate (prevents pushing only part of the work)
    // --------------------------
    const dirty = getRepoStatusPorcelain();
    if (dirty) {
        console.error(color(C.red, "\n❌ Repo is dirty. Commit changes before pushing.\n"));
        console.error(color(C.yellow, "git status --porcelain:\n"));
        console.error(dirty);
        process.exit(1);
    }

    // Smart push (protected master -> auto branch)
    const currentBranch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
        shell: false,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
    }).stdout.trim();

    const isProtected = currentBranch === "master" || currentBranch === "main";
    const prompt = isProtected ? `Master je zaštićen. Auto-grana + Push?` : `Push na '${currentBranch}'?`;

    const shouldPush = await askYesNo(prompt);

    if (shouldPush) {
        if (isProtected) {
            const timestamp = new Date().getTime();
            const autoBranch = `chore/verified-update-${timestamp}`;

            console.log(color(C.yellow, `\n🛡️  Kreiram granu: ${autoBranch}`));
            spawnSync("git", ["checkout", "-b", autoBranch], { shell: false, stdio: "inherit" });

            console.log(color(C.blue, `🚀 Pushing ${autoBranch}...`));
            spawnSync("git", ["push", "-u", "origin", autoBranch], {
                shell: false,
                stdio: "inherit",
                env: { ...process.env, HUSKY: "0" },
            });

            console.log(color(C.green, `\n✅ Uspešno! Otvori Pull Request ovde:`));
            console.log(
                color(C.cyan, `https://github.com/engilic/serbiantransliterator/pull/new/${autoBranch}\n`)
            );
        } else {
            console.log(color(C.blue, `🚀 Pushing ${currentBranch}...`));
            spawnSync("git", ["push", "-u", "origin", currentBranch], {
                shell: false,
                stdio: "inherit",
                env: { ...process.env, HUSKY: "0" },
            });
        }
    } else {
        console.log(color(C.gray, `\n⛔ Operacija završena bez push-a.`));
    }
}

main();
