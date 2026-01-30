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

// --- ANSI BOJE (Tvoja puna paleta) ---
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
 * Prikazuje Guardian banner.
 */
function printBanner() {
    console.clear();
    console.log(`${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
${C.reset}`);
}

/**
 * Puna verzija 'run' funkcije sa inteligentnim filtriranjem boja.
 * Hvatamo output svake komande i bojimo ga u žuto SAMO ako je warning.
 */
function run(step, cmd, args, cwd = ROOT) {
    console.log(`\n${C.blue}${C.bold}>>> ${step}${C.reset}`);
    const start = Date.now();

    const res = spawnSync(`${cmd} ${args.join(" ")}`, {
        cwd,
        stdio: "pipe", // Moramo da koristimo pipe da bismo analizirali tekst
        shell: true,
        env: { ...process.env, FORCE_COLOR: "1" },
    });

    let stdout = res.stdout.toString();
    let stderr = res.stderr.toString();
    let combined = stdout + stderr;

    // --- INTELIGENTNO BOJENJE (Tvoj zahtev: žuta samo za warning) ---
    // 1. Ako tekst sadrži "warning" ili "deprecated", taj deo bojimo u žuto
    combined = combined.replace(/warning|deprecated|vulnerability|vulnerabilities/gi, (match) => {
        return `${C.yellow}${match}${C.reset}`;
    });

    // 2. Verzije i uspešne poruke (built, compiled) bojimo u Cyan da ne budu žute
    combined = combined.replace(/v\d+\.\d+\.\d+|success|compiled successfully|built/gi, (match) => {
        return `${C.cyan}${match}${C.reset}`;
    });

    // Ispisujemo obrađeni tekst u konzolu
    process.stdout.write(combined);

    TIMINGS.push({ step, time: ((Date.now() - start) / 1000).toFixed(2) });

    if (res.status !== 0) {
        beep();
        console.error(`\n${C.bgRed}${C.white} ❌ FATAL ERROR: ${step} ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ OK${C.reset}`);
}

/**
 * Tvoja puna, moćna logika za tastere (BACKSPACE/ENTER = DA, DELETE/ESC = NE).
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
 * Provera sistemskog okruženja.
 */
function checkEnv() {
    if (!fs.existsSync(path.join(ROOT, ".env")) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.log(
            `${C.cyan}ℹ️  INFO: .env fajl nije pronađen, koriste se podrazumevane vrednosti.${C.reset}`
        );
    }
}

/**
 * Sniffer koji traži debugger i tajne ključeve pre svakog commita.
 */
async function runSniffer() {
    console.log(`\n${C.blue}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);
    const filesStatus = spawnSync("git ls-files", { shell: true, encoding: "utf8" });

    if (!filesStatus.stdout) {
        console.log(`${C.gray}Git repozitorijum nije pronađen.${C.reset}`);
        return;
    }

    const files = filesStatus.stdout
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

    // 0. CLEAN: Duboko čišćenje - Preskačemo u Fast modu
    if (!IS_FAST_MODE) {
        run("0. Clean", "npm", ["run", "clean"]);
    }

    // 0. HYGIENE: PowerShell hederi i JSON čišćenje
    if (isWindows) {
        run("0. Hygiene", "powershell", ["-ExecutionPolicy Bypass", "-File", "./scripts/add-headers.ps1"]);
    }

    // 1. INSTALL: Paketi
    run("1. Install", "npm", ["install"]);

    // 2. FORMAT: Sređivanje koda
    run("2. Format", "npm", ["run", "format:fix"]);

    // Auto-commit promena nakon formata
    const status = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (status) {
        console.log(`${C.cyan}ℹ️  Auto-commit: Sinhronizacija higijene i formata...${C.reset}`);
        spawnSync("git add .", { shell: true, stdio: "inherit" });
        spawnSync('git commit -m "chore: hygiene & auto-format"', { shell: true, stdio: "inherit" });
    }

    // 3. TYPES: TypeScript provera
    run("3. Lint/Type", "npm", ["run", "typecheck"]);

    // 4. RUST: Cargo testovi za WASM engine
    run("4. Rust", "cargo", ["test"], WASM_DIR);

    // 5. BUILD: Webpack pakovanje
    run("5. Build", "npm", ["run", "build"]);

    // 6 & 7. TESTS: Unit i E2E - Preskačemo u Fast modu
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

    // --- SMART PUSH SYSTEM (V4 - Protected Master Handling) ---
    const currentBranch = spawnSync("git rev-parse --abbrev-ref HEAD", {
        shell: true,
        encoding: "utf8",
    }).stdout.trim();

    const isProtected = currentBranch === "master" || currentBranch === "main";
    const isAutoBranch = currentBranch.startsWith("chore/verified-update-");

    // 1. Ako smo na PR grani
    if (isAutoBranch) {
        const shouldPushAuto = await askYesNo(`Ažurirati PR granu '${currentBranch}'?`);
        if (shouldPushAuto) {
            spawnSync(`git push -u origin ${currentBranch}`, { shell: true, stdio: "inherit" });
            console.log(`\n${C.green}✅ Uspešno ažurirano na GitHub-u.${C.reset}`);
        } else {
            console.log(`\n${C.gray}⛔ Push otkazan.${C.reset}`);
        }
        return; // Završavamo ovde da ne bismo postavljali sledeće pitanje
    }

    // 2. Ako smo na zaštićenoj grani (master/main)
    const prompt = isProtected
        ? `Grana '${currentBranch}' je ZAŠTIĆENA. Kreirati novu PR granu?`
        : `Push na '${currentBranch}'?`;

    const shouldPush = await askYesNo(prompt);

    if (shouldPush) {
        if (isProtected) {
            const timestamp = Math.floor(Date.now() / 1000);
            const newBranchName = `chore/verified-update-${timestamp}`;

            console.log(`\n${C.cyan}ℹ️  Kreiram PR granu: ${newBranchName}${C.reset}`);
            spawnSync(`git checkout -b ${newBranchName}`, { shell: true, stdio: "inherit" });

            console.log(`${C.blue}🚀 Pushing to origin...${C.reset}`);
            spawnSync(`git push -u origin ${newBranchName}`, { shell: true, stdio: "inherit" });

            console.log(`\n${C.green}${C.bold}🏆 USPEH! Link za Pull Request:${C.reset}`);
            console.log(
                `${C.cyan}https://github.com/engilic/serbiantransliterator/pull/new/${newBranchName}${C.reset}\n`
            );
        } else {
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
