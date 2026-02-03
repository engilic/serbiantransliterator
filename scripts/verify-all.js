#!/usr/bin/env node
// scripts/verify-all.js

"use strict";

// Force colors also for THIS Node process (not only child processes)
process.env.FORCE_COLOR = process.env.FORCE_COLOR || "1";

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { pathToFileURL } = require("url");
const { C, color } = require("./_ui.cjs");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");

// ✅ Verify pipeline identity
const VERIFY_TEST_NAME = "VERIFY";

// ✅ Global start timestamp for cumulative checkpoint time
const RUN_START_TS = Date.now();
function cumulativeSecondsStr() {
    return ((Date.now() - RUN_START_TS) / 1000).toFixed(2);
}

function readJsonSafe(p) {
    try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
        return null;
    }
}

const APP_PKG = readJsonSafe(path.join(ROOT, "package.json"));
const APP_VERSION = APP_PKG?.version ? String(APP_PKG.version) : "unknown";

const ARGS = process.argv.slice(2);
const IS_FAST_MODE = ARGS.includes("--fast");
const NO_PUSH = ARGS.includes("--no-push");
const IS_STRICT = ARGS.includes("--strict");
const NO_SKIP = ARGS.includes("--no-skip"); // force full run (no smart skipping)

const TIMINGS = [];
const EXECUTED = [];
const SKIPPED = [];

let FINAL_REPORT_PRINTED = false;
let FAILED_STEP = null; // set when die(step) is called

let STEP_NO = 0;

function nextStep(title) {
    const n = STEP_NO++;
    return `${n}. ${title}`;
}

function runStep(title, cmd, args, cwd = ROOT) {
    return run(nextStep(title), cmd, args, cwd, null);
}

function runInlineStep(title, fn) {
    return runInline(nextStep(title), fn, "internal");
}

function runInlineStepCmd(title, cmdLine, fn) {
    return runInline(nextStep(title), fn, cmdLine);
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

function runCmdCapture(cmd, args, cwd = ROOT) {
    const res = spawnCross(resolveCmd(cmd), args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    const stdout = String(res.stdout || "");
    const stderr = String(res.stderr || "");
    const status = res.status ?? 1;

    return { status, stdout, stderr };
}

function runCaptureText(cmd, args, cwd = ROOT) {
    const res = spawnCross(resolveCmd(cmd), args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        env: { ...process.env, FORCE_COLOR: "1" },
    });
    if ((res.status ?? 1) !== 0) return null;
    const out = String(res.stdout || "").trim();
    return out || null;
}

function isWin() {
    return process.platform === "win32";
}

function getGitBranch() {
    return runCaptureText("git", ["rev-parse", "--abbrev-ref", "HEAD"], ROOT) || "unknown";
}

function getGitCommitShort() {
    return runCaptureText("git", ["rev-parse", "--short", "HEAD"], ROOT) || "unknown";
}

function getPwshVersion() {
    if (!isWin()) return null;
    return runCaptureText("pwsh", ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"], ROOT);
}

function getWindowsVerLine() {
    if (!isWin()) return null;

    // Prefer CIM via PowerShell: it correctly reports Windows 11 (even when registry ProductName lies).
    const out = runCaptureText(
        "pwsh",
        [
            "-NoProfile",
            "-Command",
            "(Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Caption) + ' ' + " +
                "(Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Version) + ' ' + " +
                "(Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty BuildNumber)",
        ],
        ROOT
    );

    if (out) return out;

    // Fallback to cmd.exe ver (less precise branding)
    const comspec = process.env.ComSpec || "cmd.exe";
    const res = spawnSync(comspec, ["/d", "/s", "/c", "ver"], {
        cwd: ROOT,
        encoding: "utf8",
        shell: false,
        stdio: ["ignore", "pipe", "ignore"],
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    if ((res.status ?? 1) !== 0) return null;
    return String(res.stdout || "").trim() || null;
}

function getCiLabel() {
    if (process.env.CF_PAGES) return "cloudflare-pages";
    if (process.env.GITHUB_ACTIONS) return "github-actions";
    if (process.env.CI) return "ci";
    return "local";
}

function tryGetNodeModuleVersion(pkgName) {
    try {
        // eslint-disable-next-line import/no-dynamic-require
        const p = require(path.join(ROOT, "node_modules", pkgName, "package.json"));
        return p?.version ? String(p.version) : null;
    } catch {
        return null;
    }
}

function toFileUrl(p) {
    try {
        return pathToFileURL(p).toString();
    } catch {
        return String(p);
    }
}

// --------------------------
// Smart skipping (changed-files based)
// --------------------------
function gitHasRef(ref) {
    const r = spawnSync("git", ["rev-parse", "--verify", "--quiet", ref], {
        cwd: ROOT,
        shell: false,
        stdio: ["ignore", "ignore", "ignore"],
    });
    return r.status === 0;
}

function getDefaultBaseBranchName() {
    // In PRs on GitHub, GITHUB_BASE_REF is like "master"
    if (process.env.GITHUB_BASE_REF) return String(process.env.GITHUB_BASE_REF);
    return "master";
}

function getChangedFilesSafe() {
    // Conservative: if we can't determine diffs, return { unknown:true } => run everything
    try {
        const baseBranch = getDefaultBaseBranchName();
        const baseRef = `origin/${baseBranch}`;

        // Ensure base ref exists in CI
        if (process.env.GITHUB_ACTIONS && !gitHasRef(baseRef)) {
            spawnSync("git", ["fetch", "--no-tags", "--prune", "--depth=1", "origin", baseBranch], {
                cwd: ROOT,
                shell: false,
                stdio: ["ignore", "ignore", "ignore"],
            });
        }

        if (!gitHasRef(baseRef)) {
            return { unknown: true, baseRef, files: [] };
        }

        const mergeBase = runCaptureText("git", ["merge-base", "HEAD", baseRef], ROOT);
        if (!mergeBase) return { unknown: true, baseRef, files: [] };

        const diffOut = spawnSync("git", ["diff", "--name-only", `${mergeBase}...HEAD`], {
            cwd: ROOT,
            shell: false,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        });

        if ((diffOut.status ?? 1) !== 0) return { unknown: true, baseRef, files: [] };

        const files = String(diffOut.stdout || "")
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean);

        return { unknown: false, baseRef, files };
    } catch {
        return { unknown: true, baseRef: "unknown", files: [] };
    }
}

function matchAny(file, rules) {
    for (const r of rules) {
        if (typeof r === "string") {
            // Treat "dir/" as prefix
            if (r.endsWith("/")) {
                if (file.startsWith(r)) return true;
            } else {
                if (file === r) return true;
                if (file.startsWith(r)) return true;
            }
        } else if (r instanceof RegExp) {
            if (r.test(file)) return true;
        }
    }
    return false;
}

function anyChanged(changedInfo, rules) {
    if (NO_SKIP) return true;
    if (!changedInfo || changedInfo.unknown) return true; // conservative
    for (const f of changedInfo.files) {
        if (matchAny(f, rules)) return true;
    }
    return false;
}

// Conservative trigger sets
const RUST_TRIGGERS = [
    "src/wasm-core/",
    ".cargo/",
    "Cargo.toml",
    "Cargo.lock",
    /(^|\/)wasm-pack(\.toml|\.json)?$/,
    /(^|\/)rust-toolchain(\.toml)?$/,
];

const BUILD_TRIGGERS = [
    "src/",
    "scripts/",
    "webpack.",
    "webpack/",
    "manifest.xml",
    "manifest.prod.xml",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.node.json",
    "vitest.config.ts",
    "playwright.config.ts",
    "src/static/_headers",
];

const E2E_TRIGGERS = [...BUILD_TRIGGERS, "tests-e2e/", "src/taskpane/", "src/commands/", "src/static/"];

// --------------------------
// UI helpers
// --------------------------
function beep() {
    process.stdout.write("\x07");
}

function printBanner(changedInfo) {
    console.log(color(C.magenta + C.bold, `\n🛡️  ${VERIFY_TEST_NAME} • App v${APP_VERSION} 🛡️\n`));

    const nodeVer = process.version;
    const npmVer = runCaptureText("npm", ["-v"], ROOT) || "unknown";

    const ci = getCiLabel();
    const wt = process.env.WT_SESSION ? "WT:yes" : "WT:no";
    const gitBranch = getGitBranch();
    const gitCommit = getGitCommitShort();

    const pwshVer = getPwshVersion();
    const winVer = getWindowsVerLine();

    console.log(
        color(
            C.gray,
            `   env: node ${nodeVer} | npm ${npmVer} | platform ${process.platform} | ${wt} | ci:${ci}`
        )
    );
    console.log(color(C.gray, `   git: ${gitBranch} @ ${gitCommit}`));
    if (pwshVer) console.log(color(C.gray, `   pwsh: ${pwshVer}`));
    if (winVer) console.log(color(C.gray, `   os: ${winVer}`));

    if (changedInfo) {
        if (changedInfo.unknown) {
            console.log(color(C.gray, `   diff: unknown (smart-skip disabled; running full pipeline)`));
        } else {
            console.log(
                color(
                    C.gray,
                    `   diff: ${changedInfo.baseRef} -> HEAD (${changedInfo.files.length} files changed)`
                )
            );
        }
    }

    console.log("");

    if (IS_STRICT) console.log(color(C.yellow + C.bold, "   (STRICT MODE ENABLED)\n"));
    if (IS_FAST_MODE) console.log(color(C.yellow + C.bold, "   (FAST MODE ENABLED)\n"));
    if (NO_SKIP) console.log(color(C.yellow + C.bold, "   (NO-SKIP MODE ENABLED)\n"));
}

function stepNo(step) {
    const m = String(step).match(/^(\d+)\./);
    return m ? m[1] : "?";
}

function die(step) {
    FAILED_STEP = step;

    beep();
    console.error(`\n${color(C.bgRed, " ❌ FATAL ERROR: " + step + " ")}\n`);
    printFinalReport();
    process.exit(1);
}

// --------------------------
// Runner helpers (NO SHELL)
// --------------------------
function run(step, cmd, args, cwd = ROOT, hooks = null) {
    EXECUTED.push(step);

    const STEP_STYLE = "\x1b[1m\x1b[96m";
    console.log(color(STEP_STYLE, `\n>>> ${step}`));
    // ✅ No "$" (copy/paste friendly)
    console.log(color(C.gray, `    ${cmdLineForDisplay(resolveCmd(cmd), args)}`));

    const start = Date.now();

    const res = spawnCross(resolveCmd(cmd), args, {
        cwd,
        stdio: "inherit",
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    const stepElapsed = ((Date.now() - start) / 1000).toFixed(2);
    TIMINGS.push({ step, time: stepElapsed });

    if (res.error) console.error(res.error);
    if (res.status !== 0) die(step);

    // Hook: print extra info BEFORE the OK line (used for Coverage outputs)
    try {
        if (hooks && typeof hooks.beforeOk === "function") {
            hooks.beforeOk();
        }
    } catch (e) {
        console.error(e);
        die(step);
        return;
    }

    const cum = cumulativeSecondsStr();
    console.log(color(C.green, `\n✅ [${stepNo(step)}] OK — ${step} : ${cum}s\n`));
}

async function runInline(step, fn, cmdLine /* string | null */) {
    EXECUTED.push(step);

    const STEP_STYLE = "\x1b[1m\x1b[96m";
    console.log(color(STEP_STYLE, `\n>>> ${step}`));

    // ✅ No "$" (copy/paste friendly)
    const shown = cmdLine ? cmdLine : "internal";
    console.log(color(C.gray, `    ${shown}`));

    const start = Date.now();

    try {
        await fn();
    } catch (e) {
        console.error(e?.stack || e?.message || e);
        die(step);
        return;
    }

    const stepElapsed = ((Date.now() - start) / 1000).toFixed(2);
    TIMINGS.push({ step, time: stepElapsed });

    const cum = cumulativeSecondsStr();
    console.log(color(C.green, `\n✅ [${stepNo(step)}] OK — ${step} : ${cum}s\n`));
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

        // fallback: Y/N + Enter
        if (!canRawMode()) {
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

function getRepoStatusPorcelain() {
    const res = spawnSync("git", ["status", "--porcelain"], {
        cwd: ROOT,
        encoding: "utf8",
        shell: false,
        stdio: ["ignore", "pipe", "ignore"],
    });

    if (res.status && res.status !== 0) return "";

    // ✅ IMPORTANT: do NOT trim() - it breaks leading spaces in the FIRST line (e.g. " M file")
    // Only remove trailing whitespace at the end of the whole output.
    return String(res.stdout || "").replace(/\s+$/g, "");
}

function hashFileSha256(filePath) {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buf).digest("hex");
}

// Legend for porcelain XY codes (only print what appears)
function legendForStatus(xy) {
    if (xy === "??") return "untracked (new file)";

    const x = xy[0] || " ";
    const y = xy[1] || " ";

    const xPart =
        x === " "
            ? "index clean"
            : x === "M"
              ? "index modified (staged)"
              : x === "A"
                ? "index added (staged)"
                : x === "D"
                  ? "index deleted (staged)"
                  : x === "R"
                    ? "index renamed (staged)"
                    : x === "C"
                      ? "index copied (staged)"
                      : x === "U"
                        ? "index unmerged"
                        : `index ${x}`;

    const yPart =
        y === " "
            ? "worktree clean"
            : y === "M"
              ? "worktree modified (unstaged)"
              : y === "A"
                ? "worktree added"
                : y === "D"
                  ? "worktree deleted"
                  : y === "R"
                    ? "worktree renamed"
                    : y === "C"
                      ? "worktree copied"
                      : y === "U"
                        ? "worktree unmerged"
                        : `worktree ${y}`;

    return `${xPart}, ${yPart}`;
}

function printFinalReport() {
    if (FINAL_REPORT_PRINTED) return;
    FINAL_REPORT_PRINTED = true;

    console.log(color(C.cyan, "\n⏱️  TIMINGS REPORT:"));

    const hasError = !!FAILED_STEP;

    if (TIMINGS.length === 0) {
        console.log(color(C.gray, "   (no timings recorded)"));
    } else {
        const rows = TIMINGS.map((t) => {
            const m = String(t.step).match(/^(\d+)\.\s*(.*)$/);
            const no = m ? m[1] : "";
            const title = m ? m[2] : String(t.step);
            const time = `${t.time}s`;
            return { no, title, time, step: t.step };
        });

        const noW = Math.max(2, ...rows.map((r) => r.no.length));
        const titleW = Math.max(...rows.map((r) => r.title.length));
        const leftW = noW + 2 + titleW;

        const totalTime = TIMINGS.reduce((acc, t) => acc + (Number(t.time) || 0), 0).toFixed(2) + "s";
        const timeW = Math.max(...rows.map((r) => r.time.length), totalTime.length);

        // Find failing row by exact step string; if missing, mark the last printed row as ERROR.
        let failIndex = -1;
        if (hasError) {
            failIndex = rows.findIndex((r) => r.step === FAILED_STEP);
            if (failIndex < 0 && rows.length > 0) failIndex = rows.length - 1;
        }

        rows.forEach((r, idx) => {
            const left = `${r.no.padStart(noW)}. ${r.title}`.padEnd(leftW);
            const right = r.time.padStart(timeW);

            const isFailRow = hasError && idx === failIndex;
            const errTag = isFailRow ? " " + color(C.red + C.bold, "ERROR") : "";

            console.log(`   • ${left} : ${right}${errTag}`);
        });

        // TOTAL line (stable alignment; +3 spaces before mark, 1 space after)
        const totalPrefix = `${"   " + " ".repeat(3)}${hasError ? "✖" : "✔"}${" ".repeat(2)}`;
        const totalLeftW = Math.max(0, leftW - (totalPrefix.length - "   • ".length));
        const totalLeft = "TOTAL".padEnd(totalLeftW);
        const totalLine = `${totalPrefix}${totalLeft} : ${totalTime.padStart(timeW)}`;

        console.log(color(hasError ? C.red + C.bold : C.green + C.bold, totalLine));
    }

    console.log(color(C.cyan, "\n📎 EXECUTION REPORT:"));
    console.log(`   • strict: ${IS_STRICT ? "YES" : "NO"}`);
    console.log(`   • fast:   ${IS_FAST_MODE ? "YES" : "NO"}`);
    console.log(`   • skip:   ${NO_SKIP ? "DISABLED (--no-skip)" : "SMART (changed-files based)"}`);
    console.log(`   • push:   ${NO_PUSH ? "DISABLED (--no-push)" : "PROMPT (enabled)"}`);
    console.log(color(C.yellow, "\n   • skipped steps:"));
    if (SKIPPED.length === 0) {
        console.log(color(C.gray, "     (none)"));
    } else {
        SKIPPED.forEach((s) => console.log(`     - ${s}`));
    }

    console.log(color(C.cyan, "\n📎 REPO STATUS:"));
    const st = getRepoStatusPorcelain();
    if (!st) {
        console.log(color(C.green, "   ✔ clean (no uncommitted changes)"));
    } else {
        console.log(color(C.yellow, "   ⚠ dirty (changes detected):"));

        const lines = st.split(/\r?\n/).filter(Boolean);
        const seen = new Set();

        for (const l of lines.slice(0, 300)) {
            const xy = l.startsWith("??") ? "??" : l.slice(0, 2);
            const rest = l.slice(3);
            seen.add(xy);

            console.log(`     ${xy}  ${rest}`);
        }

        if (lines.length > 300) console.log(color(C.gray, `     ...and ${lines.length - 300} more`));

        console.log(color(C.gray, "\n     legend (XY = index/worktree):"));
        const sorted = Array.from(seen).sort();
        for (const xy of sorted) {
            console.log(color(C.gray, `     ${xy}  ${legendForStatus(xy)}`));
        }
    }

    console.log("");
}

// --------------------------
// Sniffer & Secret Hunter (aligned numbers)
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
        /-----BEGIN RSA PRIVATE KEY-----/,
        /sk_live_[0-9a-zA-Z]{24}/,
        /ghp_[0-9A-Za-z]{36}/,
        /github_pat_[0-9A-Za-z_]{20,}/,
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
// Prettier gate: ONE step only (quiet)
// --------------------------
async function prettierGate() {
    const chk1 = runCmdCapture("npm", ["run", "format:check"], ROOT);
    if (chk1.status === 0) return;

    const fix = runCmdCapture("npm", ["run", "format:fix"], ROOT);
    if (fix.status !== 0) {
        throw new Error("Prettier auto-fix failed. Run 'npm run format:fix' to see full output.");
    }

    const chk2 = runCmdCapture("npm", ["run", "format:check"], ROOT);
    if (chk2.status !== 0) {
        throw new Error(
            "Prettier still not clean after auto-fix. Run 'npm run format:check' to see details."
        );
    }
}

// --------------------------
// Coverage outputs (printed BEFORE OK line for coverage step)
// --------------------------
function printCoverageLocations() {
    const vitestVer = tryGetNodeModuleVersion("vitest") || "unknown";
    const covDir = path.resolve(ROOT, "coverage");

    const html1 = path.resolve(covDir, "index.html"); // Vitest default
    const html2 = path.resolve(covDir, "lcov-report", "index.html"); // fallback
    const htmlPath = fs.existsSync(html1) ? html1 : html2;

    const lcovPath = path.resolve(covDir, "lcov.info");

    console.log(`\n📎 Coverage outputs (vitest v${vitestVer})`);
    console.log(`   • coverage dir: ${toFileUrl(covDir)}`);
    console.log(`   • lcov.info   : ${toFileUrl(lcovPath)}`);
    console.log(`   • html report : ${toFileUrl(htmlPath)}`);
}

// --------------------------
// Rust fmt gate
// --------------------------
async function rustFmtGate() {
    const statusCheck = runCmdStatus("cargo", ["fmt", "--all", "--", "--check"], WASM_DIR);
    if (statusCheck === 0) return;

    console.log(color(C.yellow, "\n⚠ Rustfmt wants to change files."));
    const doFix = await askYesNo("Apply Rust auto-format now? (cargo fmt)");
    if (!doFix) throw new Error("Rust fmt check failed and auto-format was declined.");

    const statusFix = runCmdStatus("cargo", ["fmt", "--all"], WASM_DIR);
    if (statusFix !== 0) throw new Error("cargo fmt failed.");

    const statusRecheck = runCmdStatus("cargo", ["fmt", "--all", "--", "--check"], WASM_DIR);
    if (statusRecheck !== 0) throw new Error("Rust fmt still not clean after auto-format.");
}

// --------------------------
// Rust tests
// --------------------------
async function runRustTestsAligned() {
    const r1 = spawnSync("cargo", ["test", "--", "--quiet"], {
        cwd: WASM_DIR,
        shell: false,
        stdio: "inherit",
        env: { ...process.env, FORCE_COLOR: "1" },
    });
    if (r1.status !== 0) throw new Error("cargo test failed");
}

// --------------------------
// Strict gates: cargo audit (STRICT = deny warnings)
// --------------------------
function ensureCargoAuditAvailable() {
    const r = spawnSync("cargo", ["audit", "-V"], {
        cwd: WASM_DIR,
        shell: false,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    if ((r.status ?? 1) === 0) return;

    const msg =
        "cargo-audit is not installed.\n" +
        "Install it with:\n" +
        "  cargo install cargo-audit --locked\n" +
        "Then re-run: npm run verify:all:strict";
    throw new Error(msg);
}

async function cargoAuditStrictGate() {
    ensureCargoAuditAvailable();

    const args = ["audit", "--deny", "warnings"];

    const lockPath = path.join(WASM_DIR, "Cargo.lock");
    const lockHashBefore = fs.existsSync(lockPath) ? hashFileSha256(lockPath) : null;

    const st = runCmdStatus("cargo", args, WASM_DIR);
    if (st !== 0) throw new Error("cargo audit failed");

    const lockHashAfter = fs.existsSync(lockPath) ? hashFileSha256(lockPath) : null;
    if (lockHashBefore && lockHashAfter && lockHashBefore !== lockHashAfter) {
        throw new Error("Cargo.lock was modified during cargo audit (unexpected).");
    }
}

// --------------------------
// Main
// --------------------------
async function main() {
    const changedInfo = getChangedFilesSafe();
    printBanner(changedInfo);
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
    runStep("Large Files Gate", "node", ["scripts/checkBigFiles.cjs", "--max-mb=5"]);

    await runInlineStepCmd(
        "Sniffer & Secret Hunter",
        "internal: git ls-files -> scan tracked .ts/.js for secrets + 'debugger'",
        runSniffer
    );

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

    await runInlineStepCmd(
        "Format (prettier gate)",
        "npm run format:check -> (if needed) npm run format:fix -> npm run format:check",
        prettierGate
    );

    runStep("Lint (eslint)", "npm", ["run", "lint"]);
    runStep("Typecheck", "npm", ["run", "typecheck"]);

    // Strict-only audits
    if (IS_STRICT) {
        runStep("Audit (npm prod/high)", "npm", ["run", "audit:prod:high"]);
        await runInlineStepCmd(
            "Cargo audit (wasm-core)",
            "cargo audit --deny warnings",
            cargoAuditStrictGate
        );
    } else {
        SKIPPED.push("Audit (npm prod/high) (strict-only)");
        SKIPPED.push("Cargo audit (wasm-core) (strict-only)");
    }

    // Rust gates (smart-skip if no wasm/rust changes)
    const shouldRunRust = anyChanged(changedInfo, RUST_TRIGGERS);
    if (shouldRunRust) {
        await runInlineStepCmd(
            "Rust fmt (check + auto-fix)",
            "cargo fmt --all -- --check -> (if needed) cargo fmt --all -> cargo fmt --all -- --check",
            rustFmtGate
        );

        runStep("Rust clippy (-Dwarnings)", "cargo", ["clippy", "--", "-Dwarnings"], WASM_DIR);
        await runInlineStepCmd("Rust tests", "cargo test -- --quiet", runRustTestsAligned);
    } else {
        SKIPPED.push("Rust fmt (no wasm/rust changes)");
        SKIPPED.push("Rust clippy (-Dwarnings) (no wasm/rust changes)");
        SKIPPED.push("Rust tests (no wasm/rust changes)");
    }

    // Build
    // In STRICT mode we must build, because Dist Artifacts Gate depends on dist/.
    const shouldRunBuild = IS_STRICT ? true : anyChanged(changedInfo, BUILD_TRIGGERS);

    if (shouldRunBuild) {
        const BUILD_STEP = nextStep("Build");
        run(BUILD_STEP, "npm", ["run", "build"]);
    } else {
        SKIPPED.push("Build (no relevant changes)");
    }

    runStep("Manifest validate (dev)", "npm", ["run", "validate"]);
    runStep("Manifest validate (prod)", "npm", ["run", "validate:prod"]);

    // Dist artifacts gate
    // - STRICT: always run (requires dist, and we forced build above)
    // - non-STRICT: only run if dist exists (otherwise it's a guaranteed false fail)
    const distDir = path.join(ROOT, "dist");
    const distExists = fs.existsSync(distDir);

    if (IS_STRICT || distExists) {
        if (IS_STRICT) {
            runStep("Dist Artifacts Gate (strict)", "node", ["scripts/checkDistArtifacts.cjs", "--strict"]);
        } else {
            runStep("Dist Artifacts Gate", "node", ["scripts/checkDistArtifacts.cjs"]);
        }
    } else {
        SKIPPED.push("Dist Artifacts Gate (skipped: dist/ not present and build was skipped)");
    }

    // Tests
    if (!IS_FAST_MODE) {
        const COV_STEP = nextStep("Unit Tests (coverage)");
        run(COV_STEP, "npm", ["run", "test:coverage"], ROOT, { beforeOk: printCoverageLocations });

        const shouldRunE2E = anyChanged(changedInfo, E2E_TRIGGERS);
        if (shouldRunE2E) {
            runStep("E2E Tests (trace on failure)", "npm", [
                "run",
                "test:e2e",
                "--",
                "--trace",
                "retain-on-failure",
            ]);
        } else {
            SKIPPED.push("E2E Tests (no relevant changes)");
        }
    } else {
        SKIPPED.push("Unit Tests (fast)");
        SKIPPED.push("E2E Tests (fast)");
        console.log(color(C.gray, "\n(FAST MODE) Skipping Unit/E2E tests.\n"));
    }

    beep();
    console.log(color(C.green + C.bold, "\n🏆 VERIFY PASSED!\n"));

    printFinalReport();

    if (NO_PUSH) return;

    // Dirty repo gate
    const dirty = getRepoStatusPorcelain();
    if (dirty) {
        console.error(color(C.red, "\n❌ Repo is dirty. Commit changes before pushing.\n"));
        console.error(color(C.yellow, "git status --porcelain:\n"));
        console.error(dirty);
        process.exit(1);
    }

    // Smart push
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
