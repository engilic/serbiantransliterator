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

// --- BOJE (Originalna God Mode paleta) ---
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
 * Zvučni signal (beep) za obaveštenja.
 */
function beep() {
    process.stdout.write("\x07");
}

/**
 * Prikazuje veliki Guardian banner.
 */
function printBanner() {
    console.clear();
    console.log(`${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
${C.reset}`);
}

/**
 * Glavna funkcija za pokretanje komandi.
 * stdio: inherit čuva boje i interaktivnost originalnih alata.
 */
function run(step, cmd, args, cwd = ROOT) {
    console.log(`\n${C.blue}${C.bold}>>> ${step}${C.reset}`);
    const start = Date.now();

    // Spajamo komandu i argumente
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
 * TVOJA ORIGINALNA LOGIKA ZA INPUT (BACKSPACE/ENTER = DA, DELETE/ESC = NE)
 * Ova funkcija koristi Raw Mode za direktno hvatanje tastera.
 */
async function askYesNo(q) {
    return new Promise((resolve) => {
        console.log(`\n${C.magenta}❓ ${q}${C.reset}`);

        // Uputstvo za tastere (iz git-cleanup.js)
        console.log(
            `   ${C.white}[${C.green}BACKSPACE / ⬅ / Enter${C.white}] = DA   |   [${C.red}DEL / ➔ / Esc${C.white}] = NE${C.reset}`
        );

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        const listener = (k) => {
            // CTRL+C = Exit
            if (k === "\u0003") {
                process.stdin.setRawMode(false);
                process.exit(1);
            }

            // DA: y, Y, Enter (\r), Backspace (\u007f ili \u0008), Levo (\u001b[D)
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
            // NE: n, N, Esc (\u001b), Delete (\u001b[3~), Desno (\u001b[C)
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
 * Provera .env fajlova.
 */
function checkEnv() {
    if (!fs.existsSync(path.join(ROOT, ".env")) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.log(`${C.cyan}ℹ️  INFO: .env nije pronađen, koriste se default vrednosti.${C.reset}`);
    }
}

/**
 * Sniffer koji traži kritične probleme pre commita.
 */
async function runSniffer() {
    console.log(`\n${C.blue}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);
    const filesOutput = spawnSync("git ls-files", { shell: true, encoding: "utf8" });

    if (!filesOutput.stdout) {
        console.log(`${C.gray}Git repo nije pronađen.${C.reset}`);
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
        } catch (e) {}
    });

    if (issues > 0) {
        beep();
        console.error(
            `\n${C.bgRed}${C.white} 🛑 PRONAĐENO ${issues} KRITIČNIH PROBLEMA! (Debugger/Secrets)${C.reset}`
        );
        process.exit(1);
    }
    console.log(`${C.green}✅ Kod je čist (Bezbednost OK).${C.reset}`);
}

/**
 * GLAVNA FUNKCIJA (The Pipeline)
 */
async function main() {
    printBanner();
    checkEnv();
    await runSniffer();

    // 0. ASSETS: Automatsko pravljenje ikona
    run("0. Assets", "node", ["scripts/ensure-icons.js"]);

    // 0. CLEAN: Duboko čišćenje (Rust + Build) - Preskačemo u Fast modu
    if (!IS_FAST_MODE) {
        run("0. Clean", "npm", ["run", "clean"]);
    }

    // 0. HYGIENE: PowerShell hederi i JSON čišćenje
    if (isWindows) {
        run("0. Hygiene", "powershell", ["-ExecutionPolicy Bypass", "-File", "./scripts/add-headers.ps1"]);
    }

    // 1. INSTALL: Okruženje
    run("1. Install", "npm", ["install"]);

    // 2. FORMAT: Sređivanje koda
    run("2. Format", "npm", ["run", "format:fix"]);

    // Auto-commit format promena pre testova
    const status = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (status) {
        console.log(`${C.cyan}ℹ️  Auto-commit: Sinhronizacija higijene iassets-a...${C.reset}`);
        spawnSync("git add .", { shell: true, stdio: "inherit" });
        spawnSync('git commit -m "chore: hygiene & assets sync"', { shell: true, stdio: "inherit" });
    }

    // 3. TYPES: TypeScript provera
    run("3. Lint/Type", "npm", ["run", "typecheck"]);

    // 4. RUST: Cargo testovi
    run("4. Rust", "cargo", ["test"], WASM_DIR);

    // 5. BUILD: Webpack pakovanje
    run("5. Build", "npm", ["run", "build"]);

    // 6. & 7. TESTS: Unit i E2E - Preskačemo u Fast modu
    if (!IS_FAST_MODE) {
        run("6. Unit Tests", "npm", ["run", "test:coverage"]);
        run("7. E2E Tests", "npm", ["run", "test:e2e"]);
    }

    // --- REPORT SEKCIJA ---
    console.log(`\n${C.cyan}📊 FINAL REPORT:${C.reset}`);
    TIMINGS.forEach((t) => {
        console.log(`   • ${t.step.padEnd(20)}: ${C.white}${t.time}s${C.reset}`);
    });

    beep();
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO ZA DEPLOY!${C.reset}\n`);

    if (NO_PUSH) return;

    // --- SMART PUSH SYSTEM (V3 - Rešenje za Protected Master) ---
    const currentBranch = spawnSync("git rev-parse --abbrev-ref HEAD", {
        shell: true,
        encoding: "utf8",
    }).stdout.trim();

    const isProtected = currentBranch === "master" || currentBranch === "main";

    // Pametno pitanje koje se menja u zavisnosti od grane
    const prompt = isProtected
        ? `Grana '${currentBranch}' je ZAŠTIĆENA. Kreirati novu granu i PR?`
        : `Push na '${currentBranch}'?`;

    const shouldPush = await askYesNo(prompt);

    if (shouldPush) {
        if (isProtected) {
            // Ako smo na masteru, pravimo novu granu
            const timestamp = Math.floor(Date.now() / 1000);
            const newBranchName = `chore/verified-update-${timestamp}`;

            console.log(`\n${C.cyan}ℹ️  Master je zaštićen. Pravim novu granu: ${newBranchName}${C.reset}`);

            // 1. Checkout nove grane
            spawnSync(`git checkout -b ${newBranchName}`, { shell: true, stdio: "inherit" });

            // 2. Push nove grane
            console.log(`${C.blue}🚀 Pushing to origin...${C.reset}`);
            spawnSync(`git push -u origin ${newBranchName}`, { shell: true, stdio: "inherit" });

            // 3. Link za PR
            console.log(`\n${C.green}${C.bold}🏆 USPEH! Otvori Pull Request na GitHub-u:${C.reset}`);
            console.log(
                `${C.cyan}https://github.com/engilic/serbiantransliterator/pull/new/${newBranchName}${C.reset}\n`
            );
        } else {
            // Ako nismo na masteru, radimo običan push
            console.log(`${C.blue}🚀 Pushing na ${currentBranch}...${C.reset}`);
            spawnSync(`git push`, { shell: true, stdio: "inherit" });
        }
    } else {
        console.log(`\n${C.gray}⛔ Push otkazan.${C.reset}`);
    }
}

// Globalni error handler za glavnu funkciju
main().catch((err) => {
    console.error(`\n${C.bgRed} ❌ KRITIČNA GREŠKA U GUARDIAN SISTEMU: ${C.reset}`);
    console.error(err);
    process.exit(1);
});
