// scripts/verify-all.js
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const dns = require("dns");
const readline = require("readline");
const os = require("os");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");
const ARGS = process.argv.slice(2);
const IS_FAST_MODE = ARGS.includes("--fast");
const NO_PUSH = ARGS.includes("--no-push");

const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
    cyan: "\x1b[36m",
    bgRed: "\x1b[41m",
    white: "\x1b[97m",
};
const TIMINGS = [];

function beep() {
    process.stdout.write("\x07");
}

function printBanner() {
    console.clear();
    console.log(`${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
${C.reset}`);
}

function run(step, cmd, args, cwd = ROOT) {
    console.log(`\n${C.blue}${C.bold}>>> ${step}${C.reset}`);
    const start = Date.now();
    const res = spawnSync(cmd, args, {
        cwd,
        stdio: "inherit",
        shell: true,
        env: { ...process.env, FORCE_COLOR: "1" },
    });
    TIMINGS.push({ step, time: ((Date.now() - start) / 1000).toFixed(2) });
    if (res.status !== 0) {
        beep();
        console.error(`\n${C.bgRed} ❌ FATAL ERROR: ${step} ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ OK${C.reset}`);
}

// --- IZMENJENE KONTROLE ---
async function askYesNo(q) {
    return new Promise((r) => {
        console.log(`\n${C.magenta}❓ ${q} ${C.gray}(Y/n)${C.reset}`);
        console.log(
            `   ${C.white}[${C.green}BACKSPACE / ⬅ / Enter${C.white}] = DA   |   [${C.red}DEL / ➔ / Esc${C.white}] = NE${C.reset}`
        );

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        const l = (k) => {
            if (k === "\u0003") process.exit(1); // Ctrl+C uvek gasi

            // DA: y, Y, Enter, Backspace (\u007f, \u0008), Levo (\u001b[D)
            if (
                k === "y" ||
                k === "Y" ||
                k === "\r" ||
                k === "\u007f" ||
                k === "\u0008" ||
                k === "\u001b[D"
            ) {
                cleanup(true);
            }
            // NE: n, N, Esc, Delete (\u001b[3~), Desno (\u001b[C)
            else if (k === "n" || k === "N" || k === "\u001b" || k === "\u001b[3~" || k === "\u001b[C") {
                cleanup(false);
            }
        };
        const cleanup = (res) => {
            process.stdout.write(res ? `${C.green}DA${C.reset}\n` : `${C.red}NE${C.reset}\n`);
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener("data", l);
            r(res);
        };
        process.stdin.on("data", l);
    });
}

function checkEnv() {
    if (!fs.existsSync(path.join(ROOT, ".env")) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.error(`${C.red}❌ Nedostaje .env fajl!${C.reset}`);
        process.exit(1);
    }
}

// 4. Sniffer (Tajne i Garbage)
async function runSniffer() {
    console.log(`\n${C.blue}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);

    // Lista fajlova za proveru (ignorise foldere)
    const files = spawnSync("git", ["ls-files"], { encoding: "utf8" })
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
            if (re.test(content)) {
                console.error(`${C.red}💀 SECRET NAĐEN U FAJLU: ${f}${C.reset}`);
                issues++;
            }
        });

        if (content.includes("debugger")) {
            console.error(`${C.red}❌ 'debugger' u fajlu: ${f}${C.reset}`);
            issues++;
        }
    });

    if (issues > 0) {
        beep();
        console.error(
            `\n${C.bgRed}${C.white} 🛑 PRONAĐENO ${issues} KRITIČNIH PROBLEMA! POPRAVI PRE NASTAVKA. ${C.reset}`
        );
        process.exit(1);
    }
    console.log(`${C.green}✅ Kod je čist (Bezbednost OK).${C.reset}`);
}

async function main() {
    printBanner();
    checkEnv();
    await runSniffer();

    run("1. Install", "npm", ["ci"]);
    run("2. Format", "npm", ["run", "format:fix"]);

    if (spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" }).stdout.trim()) {
        console.log(`${C.yellow}⚠️  Auto-commit format...${C.reset}`);
        spawnSync("git", ["add", "."], { stdio: "inherit" });
        spawnSync("git", ["commit", "-m", "chore: auto-format"], { stdio: "inherit" });
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
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO!${C.reset}`);

    if (!NO_PUSH && (await askYesNo("Push na GitHub?"))) {
        spawnSync("git", ["push"], { stdio: "inherit" });
    }
}

main();
