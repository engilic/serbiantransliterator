// scripts/verify-all.js
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

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
    hideCursor: "\x1b[?25l",
    showCursor: "\x1b[?25h",
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

// --- TVOJA CUSTOM LOGIKA ZA MIŠA ---
async function askYesNo(question) {
    return new Promise((resolve) => {
        let isYes = true; // Početno stanje: DA

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        process.stdout.write(C.hideCursor);

        const render = () => {
            readline.cursorTo(process.stdout, 0);
            readline.clearLine(process.stdout, 0);

            // Vizuelni prikaz
            const yesBtn = isYes
                ? `${C.bgRed}${C.white}${C.bold} [ DA ] ${C.reset}`
                : `${C.gray}  da   ${C.reset}`;
            const noBtn = !isYes
                ? `${C.bgRed}${C.white}${C.bold} [ NE ] ${C.reset}`
                : `${C.gray}  ne   ${C.reset}`;

            process.stdout.write(`${C.magenta}❓ ${question}${C.reset}  ${yesBtn}  ${noBtn}`);
        };

        render();

        const listener = (key) => {
            // ENTER potvrdjuje odabrano
            if (key === "\r") {
                cleanup();
                process.stdout.write(
                    `\n${isYes ? C.green + "✅ Potvrđeno." : C.red + "❌ Otkazano."}${C.reset}\n`
                );
                resolve(isYes);
                return;
            }

            // CTRL+C gasi sve
            if (key === "\u0003") {
                cleanup();
                process.stdout.write("\n");
                process.exit(1);
            }

            // --- LOGIKA ZA TVOJ MIŠ ---

            // Backspace (\x08 ili \x7f) -> Selektuj DA (Levo)
            if (key === "\x08" || key === "\x7f" || key === "\u001b[D") {
                isYes = true;
                render();
            }

            // Delete (\x1b[3~) -> Selektuj NE (Desno)
            else if (key === "\x1b[3~" || key === "\u001b[C") {
                isYes = false;
                render();
            }

            // Podrška i za tastaturu (Y/N)
            else if (key.toLowerCase() === "y") {
                isYes = true;
                render();
            } else if (key.toLowerCase() === "n") {
                isYes = false;
                render();
            }
        };

        const cleanup = () => {
            process.stdout.write(C.showCursor);
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener("data", listener);
        };

        process.stdin.on("data", listener);
    });
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

    // OVDE SE KORISTE TVOJI TASTERI
    const shouldPush = await askYesNo(prompt);

    if (shouldPush) {
        if (isProtected) {
            const timestamp = new Date().getTime();
            const autoBranch = `chore/verified-update-${timestamp}`;
            console.log(`\n${C.yellow}🛡️  Kreiram granu: ${autoBranch}${C.reset}`);
            spawnSync(`git checkout -b ${autoBranch}`, { shell: true, stdio: "inherit" });
            console.log(`${C.blue}🚀 Pushing ${autoBranch}...${C.reset}`);
            spawnSync(`git push -u origin ${autoBranch}`, { shell: true, stdio: "inherit" });
        } else {
            console.log(`${C.blue}🚀 Pushing ${currentBranch}...${C.reset}`);
            spawnSync(`git push -u origin ${currentBranch}`, { shell: true, stdio: "inherit" });
        }
    } else {
        console.log(`\n${C.gray}⛔ Operacija završena bez push-a.${C.reset}`);
    }
}

main();
