#!/usr/bin/env node
// scripts/verify-all.js

"use strict";

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");
const ARGS = process.argv.slice(2);
const IS_FAST_MODE = ARGS.includes("--fast");
const NO_PUSH = ARGS.includes("--no-push");

// --- BOJE ---
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
    white: "\x1b[97m",
    bgRed: "\x1b[41m",
    cyan: "\x1b[36m",
};

const TIMINGS = [];

function beep() {
    process.stdout.write("\x07");
}

function printBanner() {
    // NAMERNO: bez console.clear() da vidiš kraj prethodne komande
    console.log(`${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
${C.reset}`);
}

function stepNo(step) {
    const m = String(step).match(/^(\d+)\./);
    return m ? m[1] : "?";
}

// Wrapper za pokretanje komandi
function run(step, cmd, args, cwd = ROOT) {
    console.log(`\n${C.blue}${C.bold}>>> ${step}${C.reset}`);
    const start = Date.now();

    const fullCmd = `${cmd} ${args.join(" ")}`;

    const res = spawnSync(fullCmd, {
        cwd,
        stdio: "inherit",
        shell: true,
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    TIMINGS.push({ step, time: ((Date.now() - start) / 1000).toFixed(2) });

    if (res.status !== 0) {
        beep();
        console.error(`\n${C.bgRed} ❌ FATAL ERROR: ${step} ${C.reset}\n`);
        process.exit(1);
    }

    console.log(`\n${C.green}✅ [${stepNo(step)}] OK — ${step}${C.reset}\n`);
}

// --------------------------
// YES/NO INPUT (1-line hint)
// --------------------------
async function askYesNo(q) {
    return new Promise((resolve) => {
        console.log(`\n${C.magenta}❓ ${q}${C.reset}`);
        console.log(
            `   ${C.green}[BACKSPACE / ⬅ / Enter / Y] = ✔ YES${C.reset}    |   ${C.red}[DEL / ➔ / Esc / N] = ✖ NO${C.reset}`
        );

        process.stdin.setEncoding("utf8");
        process.stdin.resume();
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
                process.stdout.write(`${C.green}✔ YES${C.reset}\n`);
                cleanup(true);
            } else if (k === "n" || k === "N" || k === "\u001b" || k === "\u001b[3~" || k === "\u001b[C") {
                process.stdout.write(`${C.red}✖ NO${C.reset}\n`);
                cleanup(false);
            }
        };

        function cleanup(result) {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener("data", listener);
            resolve(result);
        }

        process.stdin.on("data", listener);
    });
}

function detectPowerShell() {
    // Prefer pwsh, fallback powershell (Windows)
    const candidates = ["pwsh", "powershell"];
    for (const exe of candidates) {
        const r = spawnSync(exe, ["-NoProfile", "-Command", "$PSVersionTable.PSVersion"], {
            encoding: "utf8",
            shell: false,
            stdio: ["ignore", "pipe", "ignore"],
        });
        if (r.status === 0) return exe;
    }
    return null;
}

function checkEnv() {
    if (!fs.existsSync(path.join(ROOT, ".env")) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.error(`${C.red}❌ Nedostaje .env fajl!${C.reset}`);
        process.exit(1);
    }
}

async function runSniffer() {
    console.log(`\n${C.blue}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);
    const files = spawnSync("git ls-files", { shell: true, encoding: "utf8" })
        .stdout.split("\n")
        .filter((f) => f && (f.endsWith(".ts") || f.endsWith(".js") || f.endsWith(".tsx")));

    let issues = 0;
    const secrets = [
        /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA)[A-Z0-9]{16}/,
        /-----BEGIN PRIVATE KEY-----/,
        /sk_live_[0-9a-zA-Z]{24}/,
    ];

    files.forEach((f) => {
        if (f.startsWith("scripts/") || f.includes("test") || f.includes("spec")) return;
        const content = fs.readFileSync(f, "utf8");
        secrets.forEach((re) => {
            if (re.test(content)) issues++;
        });
        if (content.includes("debugger")) issues++;
    });

    if (issues > 0) {
        beep();
        console.error(`\n${C.bgRed}${C.white} 🛑 PRONAĐENO ${issues} KRITIČNIH PROBLEMA!${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ Kod je čist (Bezbednost OK).${C.reset}`);
}

async function main() {
    printBanner();
    checkEnv();

    // 0) AUTO-FIX headers + report
    const ps = detectPowerShell();
    if (!ps) {
        console.error(`${C.red}❌ PowerShell (pwsh/powershell) not found. Can't auto-fix headers.${C.reset}`);
        process.exit(1);
    }
    run("0. Header Auto-Fix", ps, [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "scripts/add-headers.ps1",
    ]);

    await runSniffer();

    run("1. Install", "npm", ["ci"]);
    run("2. Format", "npm", ["run", "format:fix"]);

    const status = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (status) {
        console.log(`${C.yellow}⚠️  Auto-commit format...${C.reset}`);
        spawnSync("git add .", { shell: true, stdio: "inherit" });
        spawnSync('git commit -m "chore: auto-format"', { shell: true, stdio: "inherit" });
    }

    run("3. Lint/Type", "npm", ["run", "typecheck"]);
    run("4. Rust", "cargo", ["test"], WASM_DIR);
    run("5. Build", "npm", ["run", "build"]);

    const wasmPath = path.join(WASM_DIR, "pkg/serbian_transliterator_wasm_bg.wasm");
    if (fs.existsSync(wasmPath) && fs.statSync(wasmPath).size / 1024 / 1024 > 2.0) {
        console.error(`${C.red}❌ WASM prevelik!${C.reset}`);
        process.exit(1);
    }

    if (!fs.existsSync(path.join(ROOT, "dist", "taskpane.html"))) {
        console.error(`${C.red}❌ Build failed (no html)${C.reset}`);
        process.exit(1);
    }

    if (!IS_FAST_MODE) {
        run("6. Unit Tests", "npm", ["run", "test:coverage"]);
        run("7. E2E Tests", "npm", ["run", "test:e2e"]);
    }

    console.log(`\n${C.cyan}📊 REPORT:${C.reset}`);
    TIMINGS.forEach((t) => console.log(`   • ${t.step.padEnd(20)}: ${t.time}s`));
    beep();
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO!${C.reset}\n`);

    if (NO_PUSH) return;

    const currentBranch = spawnSync("git rev-parse --abbrev-ref HEAD", {
        shell: true,
        encoding: "utf8",
    }).stdout.trim();

    const isProtected = currentBranch === "master" || currentBranch === "main";
    const prompt = isProtected ? `Master je zaštićen. Auto-grana + Push?` : `Push na '${currentBranch}'?`;

    const shouldPush = await askYesNo(prompt);

    if (shouldPush) {
        if (isProtected) {
            const timestamp = new Date().getTime();
            const autoBranch = `chore/verified-update-${timestamp}`;
            console.log(`\n${C.yellow}🛡️  Kreiram granu: ${autoBranch}${C.reset}`);
            spawnSync(`git checkout -b ${autoBranch}`, { shell: true, stdio: "inherit" });
            console.log(`${C.blue}🚀 Pushing ${autoBranch}...${C.reset}`);
            spawnSync(`git push -u origin ${autoBranch}`, { shell: true, stdio: "inherit" });

            console.log(`\n${C.green}✅ Uspešno! Otvori Pull Request ovde:${C.reset}`);
            console.log(
                `${C.cyan}https://github.com/engilic/serbiantransliterator/pull/new/${autoBranch}${C.reset}\n`
            );
        } else {
            console.log(`${C.blue}🚀 Pushing ${currentBranch}...${C.reset}`);
            spawnSync(`git push -u origin ${currentBranch}`, { shell: true, stdio: "inherit" });
        }
    } else {
        console.log(`\n${C.gray}⛔ Operacija završena bez push-a.${C.reset}`);
    }
}

main();
