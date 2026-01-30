// scripts/verify-all.js

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");
const ARGS = process.argv.slice(2);
const IS_FAST_MODE = ARGS.includes("--fast");
const NO_PUSH = ARGS.includes("--no-push");
const isWindows = process.platform === "win32";

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
    console.clear();
    console.log(`${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
${C.reset}`);
}

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
        console.error(`\n${C.bgRed} ❌ FATAL ERROR: ${step} ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ OK${C.reset}`);
}

async function askYesNo(q) {
    return new Promise((resolve) => {
        console.log(`\n${C.magenta}❓ ${q}${C.reset}`);
        console.log(
            `   ${C.white}[${C.green}BACKSPACE / ⬅ / Enter${C.white}] = DA   |   [${C.red}DEL / ➔ / Esc${C.white}] = NE${C.reset}`
        );
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        const listener = (k) => {
            if (k === "\u0003") process.exit(1);
            if (
                k === "y" ||
                k === "Y" ||
                k === "\r" ||
                k === "\u007f" ||
                k === "\u0008" ||
                k === "\u001b[D"
            ) {
                process.stdout.write(`${C.green} ✔ DA${C.reset}\n`);
                cleanup(true);
            } else if (k === "n" || k === "N" || k === "\u001b" || k === "\u001b[3~" || k === "\u001b[C") {
                process.stdout.write(`${C.red} ✖ NE${C.reset}\n`);
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

async function runSniffer() {
    console.log(`\n${C.blue}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);
    const files = spawnSync("git ls-files", { shell: true, encoding: "utf8" })
        .stdout.split("\n")
        .filter((f) => f && (f.endsWith(".ts") || f.endsWith(".js")));
    let issues = 0;
    const secrets = [
        /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA)[A-Z0-9]{16}/,
        /-----BEGIN PRIVATE KEY-----/,
        /sk_live_[0-9a-zA-Z]{24}/,
    ];
    files.forEach((f) => {
        if (f.startsWith("scripts/") || f.includes("test")) return;
        const content = fs.readFileSync(f, "utf8");
        secrets.forEach((re) => {
            if (re.test(content)) issues++;
        });
        if (content.includes("debugger")) issues++;
    });
    if (issues > 0) {
        beep();
        console.error(`\n${C.bgRed} 🛑 PRONAĐENO ${issues} KRITIČNIH PROBLEMA!${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ Bezbednost OK.${C.reset}`);
}

async function main() {
    printBanner();
    if (!fs.existsSync(path.join(ROOT, ".env")) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.error(`${C.red}❌ Nedostaje .env fajl!${C.reset}`);
        process.exit(1);
    }
    await runSniffer();

    // 0. Clean (Deep clean Rust and build artifacts) - Samo ako nije --fast
    if (!IS_FAST_MODE) {
        run("0. Clean", "npm", ["run", "clean"]);
    }

    // 0. Hygiene (Popravlja heder-e i JSON pre npm install-a)
    if (isWindows) {
        run("0. Hygiene", "powershell", ["-ExecutionPolicy Bypass", "-File", "./scripts/add-headers.ps1"]);
    }

    // 1. Install (Koristimo install umesto ci radi fleksibilnosti)
    run("1. Install", "npm", ["install"]);

    // 2. Format
    run("2. Format", "npm", ["run", "format:fix"]);

    const status = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (status) {
        console.log(`${C.yellow}⚠️  Auto-commit hygiene & format...${C.reset}`);
        spawnSync("git add .", { shell: true });
        spawnSync('git commit -m "chore: hygiene & auto-format"', { shell: true });
    }

    // 3. Types & Rust & Build
    run("3. Lint/Type", "npm", ["run", "typecheck"]);
    run("4. Rust", "cargo", ["test"], WASM_DIR);
    run("5. Build", "npm", ["run", "build"]);

    // 6 & 7. Tests (Samo ako nije --fast)
    if (!IS_FAST_MODE) {
        run("6. Unit Tests", "npm", ["run", "test:coverage"]);
        run("7. E2E Tests", "npm", ["run", "test:e2e"]);
    }

    console.log(`\n${C.cyan}📊 REPORT:${C.reset}`);
    TIMINGS.forEach((t) => console.log(`   • ${t.step.padEnd(20)}: ${t.time}s`));
    beep();
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO ZA DEPLOY!${C.reset}\n`);

    if (NO_PUSH) return;

    const currentBranch = spawnSync("git rev-parse --abbrev-ref HEAD", {
        shell: true,
        encoding: "utf8",
    }).stdout.trim();
    const shouldPush = await askYesNo(`Push na '${currentBranch}'?`);
    if (shouldPush) {
        spawnSync(`git push -u origin ${currentBranch}`, { shell: true, stdio: "inherit" });
    }
}

main();
