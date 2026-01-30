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

// --- ANSI BOJE (Tvoja originalna God Mode paleta) ---
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

/**
 * Zvučni signal za obaveštenja.
 */
function beep() {
    process.stdout.write("\x07");
}

/**
 * Prikazuje Guardian banner na početku.
 */
function printBanner() {
    console.clear();
    console.log(`${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
${C.reset}`);
}

/**
 * Pametna funkcija za pokretanje procesa.
 * stdio: pipe omogućava analizu teksta i bojenje u žuto pre ispisa.
 */
function run(step, cmd, args, cwd = ROOT) {
    console.log(`\n${C.blue}${C.bold}>>> ${step}${C.reset}`);
    const start = Date.now();

    const res = spawnSync(`${cmd} ${args.join(" ")}`, {
        cwd,
        stdio: "pipe",
        shell: true,
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    let output = res.stdout.toString() + res.stderr.toString();

    // [GOD MODE YELLOW ALERT]: Sve što može da se popravi bojimo u žuto
    // Dodali smo vulnerability i vulnerabilities na listu
    output = output.replace(
        /warning|deprecated|vulnerability|vulnerabilities/gi,
        (match) => `${C.yellow}${match}${C.reset}`
    );

    // [GOD MODE INFO]: Verzije i uspesi u Cyan
    output = output.replace(
        /v\d+\.\d+\.\d+|v8|success|compiled successfully|up to date/gi,
        (match) => `${C.cyan}${match}${C.reset}`
    );

    process.stdout.write(output);

    TIMINGS.push({ step, time: ((Date.now() - start) / 1000).toFixed(2) });

    if (res.status !== 0) {
        beep();
        console.error(`\n${C.bgRed} ❌ FATAL ERROR: ${step} ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ OK${C.reset}`);
}

/**
 * Tvoja originalna, moćna logika za unos (BACKSPACE = DA, DELETE = NE).
 */
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
            if (k === "\u0003") {
                process.stdin.setRawMode(false);
                process.exit(1);
            }

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

function checkEnv() {
    if (!fs.existsSync(path.join(ROOT, ".env")) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.log(`${C.cyan}ℹ️  INFO: Koriste se podrazumevane env vrednosti.${C.reset}`);
    }
}

/**
 * Tvoj Sniffer koji traži kritične probleme.
 */
async function runSniffer() {
    console.log(`\n${C.blue}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);
    const filesOutput = spawnSync("git ls-files", { shell: true, encoding: "utf8" });
    if (!filesOutput.stdout) return;

    const files = filesOutput.stdout
        .split("\n")
        .filter((f) => f && (f.endsWith(".ts") || f.endsWith(".js") || f.endsWith(".tsx")));

    let issues = 0;
    const secrets = [
        /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA)[A-Z0-9]{16}/,
        /-----BEGIN PRIVATE KEY-----/,
        /sk_live_[0-9a-zA-Z]{24}/,
    ];

    files.forEach((f) => {
        if (f.startsWith("scripts/") || f.includes("test") || f.includes("spec")) return;
        try {
            const content = fs.readFileSync(f, "utf8");
            secrets.forEach((re) => {
                if (re.test(content)) issues++;
            });
            if (content.includes("debugger")) issues++;
        } catch (e) {}
    });

    if (issues > 0) {
        beep();
        console.error(`\n${C.bgRed}${C.white} 🛑 PRONAĐENO ${issues} KRITIČNIH PROBLEMA! ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ Kod je čist (Bezbednost OK).${C.reset}`);
}

async function main() {
    printBanner();
    checkEnv();
    await runSniffer();

    // 0. ASSETS & CLEAN & HYGIENE
    run("0. Assets", "node", ["scripts/ensure-icons.js"]);
    if (!IS_FAST_MODE) {
        run("0. Clean", "npm", ["run", "clean"]);
    }
    if (isWindows) {
        run("0. Hygiene", "powershell", ["-ExecutionPolicy Bypass", "-File", "./scripts/add-headers.ps1"]);
    }

    // 1. INSTALL
    run("1. Install", "npm", ["install"]);

    // 2. FORMAT & AUTO-COMMIT
    run("2. Format", "npm", ["run", "format:fix"]);
    const status = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (status) {
        console.log(`${C.cyan}ℹ️  Auto-commit: Sinhronizacija higijene i assets-a...${C.reset}`);
        spawnSync("git add .", { shell: true, stdio: "inherit" });
        spawnSync('git commit -m "chore: hygiene & assets sync"', { shell: true, stdio: "inherit" });
    }

    // 3. TYPES & RUST & BUILD
    run("3. Lint/Type", "npm", ["run", "typecheck"]);
    run("4. Rust", "cargo", ["test"], WASM_DIR);
    run("5. Build", "npm", ["run", "build"]);

    // 6. & 7. TESTS
    if (!IS_FAST_MODE) {
        run("6. Unit Tests", "npm", ["run", "test:coverage"]);
        run("7. E2E Tests", "npm", ["run", "test:e2e"]);
    }

    // FINAL REPORT
    console.log(`\n${C.cyan}📊 FINAL REPORT:${C.reset}`);
    TIMINGS.forEach((t) => {
        console.log(`   • ${t.step.padEnd(20)}: ${C.white}${t.time}s${C.reset}`);
    });

    beep();
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO ZA DEPLOY!${C.reset}\n`);

    if (NO_PUSH) return;

    // --- SMART PUSH SYSTEM ---
    const currentBranch = spawnSync("git rev-parse --abbrev-ref HEAD", {
        shell: true,
        encoding: "utf8",
    }).stdout.trim();

    const isProtected = currentBranch === "master" || currentBranch === "main";
    const isAutoBranch = currentBranch.startsWith("chore/verified-update-");

    if (isAutoBranch) {
        const shouldPushAuto = await askYesNo(`Ažurirati PR granu '${currentBranch}'?`);
        if (shouldPushAuto) {
            spawnSync(`git push -u origin ${currentBranch}`, { shell: true, stdio: "inherit" });
            return;
        }
    }

    const prompt = isProtected
        ? `Grana '${currentBranch}' je ZAŠTIĆENA. Kreirati novu PR granu?`
        : `Push na '${currentBranch}'?`;

    const shouldPush = await askYesNo(prompt);

    if (shouldPush) {
        if (isProtected) {
            const timestamp = Math.floor(Date.now() / 1000);
            const newBranch = `chore/verified-update-${timestamp}`;
            spawnSync(`git checkout -b ${newBranch}`, { shell: true, stdio: "inherit" });
            spawnSync(`git push -u origin ${newBranch}`, { shell: true, stdio: "inherit" });
            console.log(
                `\n${C.cyan}PR Link: https://github.com/engilic/serbiantransliterator/pull/new/${newBranch}${C.reset}`
            );
        } else {
            spawnSync(`git push`, { shell: true, stdio: "inherit" });
        }
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
