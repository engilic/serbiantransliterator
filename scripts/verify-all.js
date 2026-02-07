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

const ARGS = process.argv.slice(2);
const IS_ULTRA_FAST = ARGS.includes("--ultra-fast"); // ✅ ultra fast option
const IS_FAST_MODE = ARGS.includes("--fast") || IS_ULTRA_FAST;
const NO_PUSH = ARGS.includes("--no-push") || IS_ULTRA_FAST; // ultra-fast never pushes
const IS_STRICT = ARGS.includes("--strict");
const NO_SKIP = ARGS.includes("--no-skip"); // force full run (no smart skipping)
const NO_TIMINGS = ARGS.includes("--no-timings"); // optional: disable timings table

const TIMINGS = [];
const EXECUTED = [];
const SKIPPED = [];

let FINAL_REPORT_PRINTED = false;
let FAILED_STEP = null; // set when die(step) is called
let STEP_NO = 1;

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
    // On Windows, npm/pnpm are .cmd
    if (process.platform === "win32") {
        if (cmd === "npm") return "npm.cmd";
        if (cmd === "pnpm") return "pnpm.cmd";
        if (cmd === "npx") return "npx.cmd";
    }
    return cmd;
}

/**
 * Cross-platform spawn:
 * - keep shell:false (safer)
 * - BUT on Windows, npm/pnpm/npx are .cmd shims and often fail with shell:false
 *   so we run them via cmd.exe /c (still shell:false).
 */
function spawnCross(cmd, args, opts) {
    const isWin = process.platform === "win32";
    const c = String(cmd);

    // npm/pnpm/npx on Windows are .cmd shims -> run via cmd.exe
    if (isWin && /^(npm|pnpm|npx)(\.cmd)?$/i.test(c)) {
        const base = c.replace(/\.cmd$/i, ""); // pnpm.cmd -> pnpm
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

    // Prefer CIM via PowerShell: it correctly reports Windows 11.
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

function hasNpmScript(name) {
    return !!(APP_PKG && APP_PKG.scripts && Object.prototype.hasOwnProperty.call(APP_PKG.scripts, name));
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
    "pnpm-lock.yaml",
    "tsconfig.json",
    "tsconfig.node.json",
    "vitest.config.ts",
    "playwright.config.ts",
    "src/static/_headers",
];

const E2E_TRIGGERS = [...BUILD_TRIGGERS, "tests-e2e/", "src/taskpane/", "src/commands/", "src/static/"];

function matchingFiles(changedInfo, rules, max = 8) {
    if (!changedInfo || changedInfo.unknown) return [];
    const hits = [];
    for (const f of changedInfo.files) {
        if (matchAny(f, rules)) {
            hits.push(f);
            if (hits.length >= max) break;
        }
    }
    return hits;
}

function fmtHits(hits) {
    if (!hits || hits.length === 0) return " (no match)";
    return hits.map((h) => `\n       - ${h}`).join("");
}

// --------------------------
// UI helpers
// --------------------------
function beep() {
    process.stdout.write("\x07");
}

function printBanner(changedInfo) {
    const smartLabel = (() => {
        if (NO_SKIP) return "No-skip";
        if (changedInfo && changedInfo.unknown) return "Full (diff unknown)";
        return "Smart";
    })();

    const smartColor = (() => {
        if (NO_SKIP) return C.yellow + C.bold;
        if (changedInfo && changedInfo.unknown) return C.red + C.bold;
        return C.green + C.bold;
    })();

    const modeBits = [];
    if (IS_STRICT) modeBits.push(color(C.yellow + C.bold, "Strict"));
    if (IS_ULTRA_FAST) modeBits.push(color(C.yellow + C.bold, "Ultra-fast"));
    else if (IS_FAST_MODE) modeBits.push(color(C.yellow + C.bold, "Fast"));
    modeBits.push(color(smartColor, smartLabel));

    const modeText = modeBits.join(color(C.gray, " | "));

    console.log(
        color(C.magenta + C.bold, `\n🛡️  ${VERIFY_TEST_NAME}`) +
        color(C.gray, " - ") +
        modeText +
        color(C.magenta + C.bold, "  🛡️\n")
    );

    const nodeVer = process.version;
    const pnpmVer = runCaptureText("pnpm", ["-v"], ROOT) || "unknown";
    const ci = getCiLabel();
    const wt = process.env.WT_SESSION ? "WT:yes" : "WT:no";
    const gitBranch = getGitBranch();
    const gitCommit = getGitCommitShort();
    const pwshVer = getPwshVersion();
    const winVer = getWindowsVerLine();

    console.log(
        color(C.gray, `env: node ${nodeVer} | pnpm ${pnpmVer} | ${process.platform} | ci:${ci} | ${wt}`)
    );
    console.log(color(C.gray, `git: ${gitBranch} @ ${gitCommit}`));

    if (changedInfo) {
        if (changedInfo.unknown) {
            console.log(color(C.gray, `diff: unknown (smart-skip disabled; running full pipeline)`));
        } else {
            console.log(
                color(
                    C.gray,
                    `diff: ${changedInfo.baseRef} -> HEAD (${changedInfo.files.length} files changed)`
                )
            );
        }
    }

    if (winVer) console.log(color(C.gray, `os: ${winVer}`));
    if (pwshVer) console.log(color(C.gray, `pwsh: ${pwshVer}`));
    console.log("");
}

function printSmartPlan(changedInfo) {
    console.log(color(C.cyan, "📋 SMART PLAN (preflight):"));

    if (!changedInfo || changedInfo.unknown) {
        console.log(color(C.gray, "   • diff unknown => smart-skip disabled => running full pipeline\n"));
        return;
    }

    if (NO_SKIP) {
        console.log(color(C.yellow, "   • --no-skip enabled => running full pipeline\n"));
        return;
    }

    const rust = anyChanged(changedInfo, RUST_TRIGGERS);
    const build = IS_STRICT ? true : anyChanged(changedInfo, BUILD_TRIGGERS);
    const e2e = anyChanged(changedInfo, E2E_TRIGGERS);

    const rustHits = matchingFiles(changedInfo, RUST_TRIGGERS);
    const buildHits = matchingFiles(changedInfo, BUILD_TRIGGERS);
    const e2eHits = matchingFiles(changedInfo, E2E_TRIGGERS);

    console.log(
        `   • Rust gates : ${rust ? color(C.green, "RUN") : color(C.gray, "SKIP")}  | triggers:${fmtHits(rustHits)}`
    );
    console.log(
        `   • Build      : ${build ? color(C.green, "RUN") : color(C.gray, "SKIP")}  | triggers:${fmtHits(buildHits)}`
    );
    console.log(
        `   • E2E        : ${e2e ? color(C.green, "RUN") : color(C.gray, "SKIP")}  | triggers:${fmtHits(e2eHits)}`
    );

    if (IS_ULTRA_FAST) {
        console.log(
            color(C.gray, "\n   • note: ULTRA-FAST skips install/build/validate/tests/rust/audits\n")
        );
    } else if (IS_STRICT) {
        console.log(color(C.gray, "\n   • note: STRICT forces Build + runs strict-only audits\n"));
    } else {
        console.log("");
    }
}

function stepNo(step) {
    const m = String(step).match(/^(\d+)\./);
    return m ? m[1] : "?";
}

// --------------------------
// Runner helpers (NO SHELL)
// --------------------------
function run(step, cmd, args, cwd = ROOT, hooks = null) {
    EXECUTED.push(step);

    const STEP_STYLE = "\x1b[1m\x1b[96m";
    console.log(color(STEP_STYLE, `\n>>> ${step}`));
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
    console.log(""); // exactly one blank line before OK
    console.log(color(C.green, `✅ [${stepNo(step)}] OK — ${step} : ${cum}s`));
}

async function runInline(step, fn, cmdLine /* string | null */) {
    EXECUTED.push(step);

    const STEP_STYLE = "\x1b[1m\x1b[96m";
    console.log(color(STEP_STYLE, `\n>>> ${step}`));

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
    console.log(""); // exactly one blank line before OK
    console.log(color(C.green, `✅ [${stepNo(step)}] OK — ${step} : ${cum}s`));
}

// --------------------------
// Final report (ALWAYS printed, even in FAST/ULTRA-FAST)
// --------------------------
function getRepoStatusPorcelain() {
    const res = spawnSync("git", ["status", "--porcelain"], {
        cwd: ROOT,
        encoding: "utf8",
        shell: false,
        stdio: ["ignore", "pipe", "ignore"],
    });

    if (res.status && res.status !== 0) return "";
    return String(res.stdout || "").replace(/\s+$/g, "");
}

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

function printTimingsReport() {
    if (NO_TIMINGS) return;

    console.log(color(C.cyan, "\n⏱️  TIMINGS REPORT:"));

    const hasError = !!FAILED_STEP;

    if (TIMINGS.length === 0) {
        console.log(color(C.gray, "   (no timings recorded)"));
        return;
    }

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

    const totalTime =
        rows.reduce((acc, r) => acc + (Number(String(r.time).replace("s", "")) || 0), 0).toFixed(2) + "s";

    const timeW = Math.max(...rows.map((r) => r.time.length), totalTime.length);

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

    const checkMark = hasError ? "✖" : "✔";
    const totalLabel = " TOTAL";
    const totalLeft = totalLabel.padEnd(leftW);
    const totalLine = `   ${checkMark} ${totalLeft} : ${totalTime.padStart(timeW)}`;
    console.log(color(hasError ? C.red + C.bold : C.green + C.bold, totalLine));
}

function printFinalReport() {
    if (FINAL_REPORT_PRINTED) return;
    FINAL_REPORT_PRINTED = true;

    printTimingsReport();

    console.log(color(C.cyan, "\n📎 EXECUTION REPORT:"));
    console.log(`   • strict: ${IS_STRICT ? "YES" : "NO"}`);
    console.log(`   • fast:   ${IS_FAST_MODE ? "YES" : "NO"}`);
    console.log(`   • ultra:  ${IS_ULTRA_FAST ? "YES" : "NO"}`);
    console.log(`   • skip:   ${NO_SKIP ? "DISABLED (--no-skip)" : "SMART (changed-files based)"}`);
    console.log(`   • push:   ${NO_PUSH ? "DISABLED" : "PROMPT (enabled)"}`);

    console.log(color(C.yellow, "\n   • skipped steps:"));
    if (SKIPPED.length === 0) {
        console.log(color(C.gray, "     (none)"));
    } else {
        SKIPPED.forEach((s) => console.log(`     - ${s}`));
    }

    console.log(color(C.cyan, "\n📎 REPO STATUS:"));
    const st = getRepoStatusPorcelain();
    const isDirty = !!st;

    if (!isDirty) {
        console.log(color(C.green + C.bold, "   ✔ OK — clean (no uncommitted changes)"));
    } else {
        // Promenjeno iz C.red + C.bold u C.yellow + C.bold i "WARNING"
        console.log(
            color(C.yellow + C.bold, "   ⚠  WARNING — repo is dirty (uncommitted changes detected):")
        );

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

    // Final two lines: RESULT then VERIFY (VERIFY is last, NO blank line between)
    const dirty = !!getRepoStatusPorcelain();
    const total = cumulativeSecondsStr();
    const passed = !FAILED_STEP;

    const outcome = passed ? color(C.green + C.bold, "✔ PASS") : color(C.red + C.bold, "✖ FAIL");
    const dirtyText = dirty ? color(C.yellow + C.bold, "DIRTY") : color(C.green + C.bold, "CLEAN");

    const stepText = FAILED_STEP ? color(C.red + C.bold, `@ ${FAILED_STEP}`) : color(C.gray, "(all steps)");
    const execN = EXECUTED.length;
    const skipN = SKIPPED.length;

    console.log(
        "\n" +
        color(C.cyan + C.bold, "🏁 RESULT: ") +
        outcome +
        " " +
        stepText +
        color(C.gray, "  |  ") +
        color(C.cyan + C.bold, "time: ") +
        color(C.gray, `${total}s`) +
        color(C.gray, "  |  ") +
        color(C.cyan + C.bold, "steps: ") +
        color(C.gray, `${execN} run, ${skipN} skipped`) +
        color(C.gray, "  |  ") +
        color(C.cyan + C.bold, "repo: ") +
        dirtyText
    );

    console.log("");

    console.log(
        passed ? color(C.green + C.bold, "🏆 VERIFY PASSED!") : color(C.red + C.bold, "❌ VERIFY FAILED!")
    );

    // ✅ two blank lines after VERIFY
    console.log("");
    console.log("");
}

function die(step) {
    FAILED_STEP = step;
    beep();
    console.error(`\n${color(C.bgRed, " ❌ FATAL ERROR: " + step + " ")}\n`);
    printFinalReport();
    process.exit(1);
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
            if (k === "\u0003") process.exit(1);

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
            } catch { }
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

function hashFileSha256(filePath) {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buf).digest("hex");
}

// --------------------------
// Sniffer & Secret Hunter
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
// Prettier gate
// --------------------------
async function prettierGate() {
    const chk1 = runCmdCapture("pnpm", ["run", "format:check"], ROOT);
    if (chk1.status === 0) {
        console.log(color(C.green, "   • prettier: clean (no changes needed)"));
        return;
    }

    // Ako chk1 nije 0, znači da treba fix
    const fix = runCmdCapture("pnpm", ["run", "format:fix"], ROOT);
    if (fix.status !== 0) {
        throw new Error("Prettier auto-fix failed. Run 'pnpm run format:fix' to see full output.");
    }

    const chk2 = runCmdCapture("pnpm", ["run", "format:check"], ROOT);
    if (chk2.status !== 0) {
        throw new Error(
            "Prettier still not clean after auto-fix. Run 'pnpm run format:check' to see details."
        );
    }

    console.log(color(C.green, "   • prettier: auto-fixed formatting (success)"));
}

// --------------------------
// Coverage outputs
// --------------------------
function printCoverageLocations() {
    const vitestVer = tryGetNodeModuleVersion("vitest") || "unknown";
    const covDir = path.resolve(ROOT, "coverage");

    const html1 = path.resolve(covDir, "index.html");
    const html2 = path.resolve(covDir, "lcov-report", "index.html");
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
        "Then re-run: pnpm run verify:all:strict";
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
    printSmartPlan(changedInfo);
    checkEnv();

    // Ultra-fast mode: minimal but high-signal gates.
    if (IS_ULTRA_FAST) {
        const ps = detectPowerShell();
        if (!ps) {
            console.error(color(C.red, "❌ PowerShell (pwsh/powershell) not found. Can't run header gate."));
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

        // Ultra-fast: still use the same prettier gate as normal, so it behaves the same as Smart.
        await runInlineStepCmd(
            "Format (prettier gate)",
            "pnpm run format:check -> (if needed) pnpm run format:fix -> pnpm run format:check",
            prettierGate
        );

        runStep("Lint (eslint)", "pnpm", ["run", "lint"]);
        runStep("Typecheck", "pnpm", ["run", "typecheck"]);

        SKIPPED.push("Install (pnpm install --frozen-lockfile) (ultra-fast)");
        SKIPPED.push("Audit (strict-only) (ultra-fast)");
        SKIPPED.push("Rust fmt/clippy/tests (ultra-fast)");
        SKIPPED.push("Build + validate + dist gate (ultra-fast)");
        SKIPPED.push("Unit Tests / E2E (ultra-fast)");
        SKIPPED.push("Push (ultra-fast)");

        beep();
        FAILED_STEP = null;

        // Always print full end-of-run report (incl. skipped list) in every mode
        printFinalReport();
        return;
    }

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

    // Lockfile integrity around pnpm install
    const lockPath = path.join(ROOT, "pnpm-lock.yaml");
    const lockHashBefore = fs.existsSync(lockPath) ? hashFileSha256(lockPath) : null;

    const INSTALL_STEP = nextStep("Install (pnpm install --frozen-lockfile)");
    run(INSTALL_STEP, "pnpm", ["install", "--frozen-lockfile"]);

    const lockHashAfter = fs.existsSync(lockPath) ? hashFileSha256(lockPath) : null;
    if (lockHashBefore && lockHashAfter && lockHashBefore !== lockHashAfter) {
        die(`${INSTALL_STEP} / Lockfile integrity`);
    }

    await runInlineStepCmd(
        "Format (prettier gate)",
        "pnpm run format:check -> (if needed) pnpm run format:fix -> pnpm run format:check",
        prettierGate
    );

    runStep("Lint (eslint)", "pnpm", ["run", "lint"]);
    runStep("Typecheck", "pnpm", ["run", "typecheck"]);

    // Strict-only audits
    if (IS_STRICT) {
        runStep("Audit (pnpm prod/high)", "pnpm", ["run", "audit:prod:high"]);
        await runInlineStepCmd(
            "Cargo audit (wasm-core)",
            "cargo audit --deny warnings",
            cargoAuditStrictGate
        );
    } else {
        SKIPPED.push("Audit (pnpm prod/high) (strict-only)");
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
    const shouldRunBuild = IS_STRICT ? true : anyChanged(changedInfo, BUILD_TRIGGERS);
    if (shouldRunBuild) {
        const BUILD_STEP = nextStep("Build");
        run(BUILD_STEP, "pnpm", ["run", "build"]);
    } else {
        SKIPPED.push("Build (no relevant changes)");
    }

    runStep("Manifest validate (dev)", "pnpm", ["run", "validate"]);
    runStep("Manifest validate (prod)", "pnpm", ["run", "validate:prod"]);

    // Dist artifacts gate
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
        run(COV_STEP, "pnpm", ["run", "test:coverage"], ROOT, { beforeOk: printCoverageLocations });

        const shouldRunE2E = anyChanged(changedInfo, E2E_TRIGGERS);
        if (shouldRunE2E) {
            runStep("E2E Tests (trace on failure)", "pnpm", [
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
    FAILED_STEP = null;

    // Always print full end-of-run report (incl. skipped list) in every mode
    printFinalReport();
}

main();
