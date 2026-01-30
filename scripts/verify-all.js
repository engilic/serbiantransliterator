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
 * Zvučni signal za greške ili uspešan završetak.
 */
function beep() {
    process.stdout.write("\x07");
}

/**
 * Prikazuje Guardian zaglavlje u terminalu.
 */
function printBanner() {
    console.clear();
    console.log(`${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
${C.reset}`);
}

/**
 * Glavna funkcija za pokretanje koraka build procesa.
 * stdio: inherit osigurava da vidimo originalne boje iz komandi (npm, cargo, vitest).
 */
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

/**
 * Tvoja originalna logika za unos (BACKSPACE = DA, DELETE = NE).
 * Podržava Enter, Esc, strelice i direktne tastere Y/N.
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
            // CTRL+C = Prisilni izlaz
            if (k === "\u0003") {
                process.stdin.setRawMode(false);
                process.exit(1);
            }

            // Logika za DA: y, Y, Enter, Backspace (\u007f ili \u0008), Levo (\u001b[D)
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
            }
            // Logika za NE: n, N, Esc, Delete (\u001b[3~), Desno (\u001b[C)
            else if (k === "n" || k === "N" || k === "\u001b" || k === "\u001b[3~" || k === "\u001b[C") {
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

/**
 * Provera postojanja .env fajla radi sigurnosti.
 */
function checkEnv() {
    if (!fs.existsSync(path.join(ROOT, ".env")) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.log(`${C.cyan}ℹ️  INFO: .env nije pronađen, koriste se podrazumevane vrednosti.${C.reset}`);
    }
}

/**
 * Sniffer koji skenira kod na debugger-e i tajne ključeve pre svakog commita.
 */
async function runSniffer() {
    console.log(`\n${C.blue}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);
    const filesOutput = spawnSync("git ls-files", { shell: true, encoding: "utf8" });

    if (!filesOutput.stdout) {
        console.log(`${C.gray}Skipping: No files found or not a git repo.${C.reset}`);
        return;
    }

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
        } catch (e) {
            // Tiho preskoči nečitljive fajlove
        }
    });

    if (issues > 0) {
        beep();
        console.error(
            `\n${C.bgRed}${C.white} 🛑 PRONAĐENO ${issues} KRITIČNIH PROBLEMA! (Debugger ili Secrets)${C.reset}`
        );
        process.exit(1);
    }
    console.log(`${C.green}✅ Kod je čist (Bezbednost OK).${C.reset}`);
}

/**
 * Glavna funkcija Guardian sistema.
 */
async function main() {
    printBanner();
    checkEnv();
    await runSniffer();

    // --- KORAK 0: AUTOMATIZACIJA ---
    // Automatsko pravljenje ikona pomoću Playwright-a
    run("0. Assets", "node", ["scripts/ensure-icons.js"]);

    if (!IS_FAST_MODE) {
        // Deep clean: Briše dist, target (Rust) i privremene fajlove
        run("0. Clean", "npm", ["run", "clean"]);
    }

    if (isWindows) {
        // Higijena zaglavlja i čišćenje JSON-a
        run("0. Hygiene", "powershell", ["-ExecutionPolicy Bypass", "-File", "./scripts/add-headers.ps1"]);
    }

    // --- KORAK 1: OKRUŽENJE ---
    run("1. Install", "npm", ["install"]);

    // --- KORAK 2: KODNI STANDARD ---
    run("2. Format", "npm", ["run", "format:fix"]);

    // Automatski commit promena nastalih formatiranjem ili higijenom
    const status = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (status) {
        console.log(`${C.cyan}ℹ️  Auto-commit: Sinhronizacija formata i higijene...${C.reset}`);
        spawnSync("git add .", { shell: true, stdio: "inherit" });
        spawnSync('git commit -m "chore: hygiene & auto-format"', { shell: true, stdio: "inherit" });
    }

    // --- KORAK 3: KVALITET ---
    run("3. Lint/Type", "npm", ["run", "typecheck"]);

    // --- KORAK 4: CORE ENGINE ---
    run("4. Rust", "cargo", ["test"], WASM_DIR);

    // --- KORAK 5: PAKOVANJE ---
    run("5. Build", "npm", ["run", "build"]);

    // --- KORAK 6 & 7: TESTOVI ---
    if (!IS_FAST_MODE) {
        run("6. Unit Tests", "npm", ["run", "test:coverage"]);
        run("7. E2E Tests", "npm", ["run", "test:e2e"]);
    }

    // --- FINALNI REPORT ---
    console.log(`\n${C.cyan}📊 FINAL REPORT:${C.reset}`);
    TIMINGS.forEach((t) => {
        console.log(`   • ${t.step.padEnd(20)}: ${C.white}${t.time}s${C.reset}`);
    });

    beep();
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO ZA DEPLOY!${C.reset}\n`);

    if (NO_PUSH) return;

    // --- SMART PUSH SYSTEM (V3 - Auto PR Handling) ---
    const currentBranch = spawnSync("git rev-parse --abbrev-ref HEAD", {
        shell: true,
        encoding: "utf8",
    }).stdout.trim();

    const isProtected = currentBranch === "master" || currentBranch === "main";
    const isAutoBranch = currentBranch.startsWith("chore/verified-update-");

    // [AUTOMATIZACIJA]: Ako smo na auto-grani, samo gurni bez pitanja (update PR-a)
    if (isAutoBranch) {
        console.log(`${C.cyan}ℹ️  Detektovana PR grana (${currentBranch}). Automatski push...${C.reset}`);
        spawnSync(`git push -u origin ${currentBranch}`, { shell: true, stdio: "inherit" });
        console.log(`\n${C.green}✅ Ažurirano! Pull Request na GitHub-u je osvežen.${C.reset}`);
        return;
    }

    // [INTERAKCIJA]: Na ostalim granama pitaj korisnika
    const prompt = isProtected
        ? `Grana '${currentBranch}' je ZAŠTIĆENA. Kreirati novu PR granu?`
        : `Push na '${currentBranch}'?`;

    const shouldPush = await askYesNo(prompt);

    if (shouldPush) {
        if (isProtected) {
            const timestamp = Math.floor(Date.now() / 1000);
            const newBranchName = `chore/verified-update-${timestamp}`;

            console.log(`\n${C.cyan}ℹ️  Pravim novu granu: ${newBranchName}${C.reset}`);
            spawnSync(`git checkout -b ${newBranchName}`, { shell: true, stdio: "inherit" });

            console.log(`${C.blue}🚀 Pushing to origin...${C.reset}`);
            spawnSync(`git push -u origin ${newBranchName}`, { shell: true, stdio: "inherit" });

            console.log(`\n${C.green}${C.bold}🏆 USPEH! Otvori Pull Request klikom na link:${C.reset}`);
            console.log(
                `${C.cyan}https://github.com/engilic/serbiantransliterator/pull/new/${newBranchName}${C.reset}\n`
            );
        } else {
            console.log(`${C.blue}🚀 Pushing ${currentBranch}...${C.reset}`);
            spawnSync(`git push`, { shell: true, stdio: "inherit" });
        }
    } else {
        console.log(`\n${C.gray}⛔ Push otkazan.${C.reset}`);
    }
}

main().catch((err) => {
    console.error(`\n${C.bgRed} ❌ KRITIČNA GREŠKA U GUARDIAN SISTEMU: ${C.reset}`);
    console.error(err);
    process.exit(1);
});
