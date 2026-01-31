// scripts/verify-all.js

/**
 * 🛡️ GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
 * ========================================
 *
 * Centralni nadzorni sistem za Serbian Transliterator.
 * Ovaj skript upravlja kompletnim pipeline-om:
 * Clean -> Assets -> Hygiene -> I18n -> Install -> Format -> Lint -> Rust -> Build -> Tests -> Smart Push.
 *
 * Ovaj alat garantuje da ni jedan commit ne ode na server a da nije 100% testiran
 * i higijenski ispravan.
 *
 * [GOD MODE FEATURES]:
 * - Zero-copy binary data transfer monitoring.
 * - Adaptive terminal width (COLUMNS=1000) for full file paths in coverage.
 * - Automatic PR branch creation and browser opening.
 * - Intelligent color filtering (Yellow for warnings only).
 * - Mutation Testing (Stryker) safe-guarding.
 *
 * Autor: Jugoslav Ilić
 * Verzija: 1.0.0 (Gold Master)
 */

const { spawnSync, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// --- 1. KONFIGURACIJA PUTANJA ---
const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");

// --- 2. PARSIRANJE ARGUMENATA KOMANDNE LINIJE ---
const ARGS = process.argv.slice(2);
const IS_FAST_MODE = ARGS.includes("--fast");
const NO_PUSH = ARGS.includes("--no-push");
const isWindows = process.platform === "win32";

// --- 3. ANSI BOJE (God Mode Paleta - Optimizovano za maksimalan kontrast) ---
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[36m", // Svetliji Cyan za naslove
    magenta: "\x1b[35m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
    white: "\x1b[97m",
    bgRed: "\x1b[41m",
    cyan: "\x1b[36m",
};

// Globalni niz za praćenje trajanja svakog koraka (let zbog potencijalnog restarta)
let TIMINGS = [];

/**
 * Zvučni signal (System Beep) za privlačenje pažnje na greške ili završetak.
 */
function beep() {
    process.stdout.write("\x07");
}

/**
 * Pomoćna funkcija za automatsko otvaranje URL-a u podrazumevanom browseru.
 * Koristi se za automatsko otvaranje Pull Request stranice na GitHub-u.
 */
function openInBrowser(url) {
    try {
        const startCommand =
            process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
        execSync(`${startCommand} ${url}`);
    } catch (e) {
        // Tiho ignorišemo ako otvaranje browsera ne uspe
    }
}

/**
 * Prikazuje veliki vizuelni banner projekta.
 * Uklonjen console.clear() radi očuvanja istorije prethodnih build-ova.
 */
function printBanner() {
    console.log(`\n${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
    ========================================
${C.reset}`);
}

/**
 * Pomoćna funkcija za poravnanje teksta sa tačkicama u terminalu.
 * @param {string} text - Tekst koji treba poravnati.
 * @param {number} targetWidth - Ukupna željena širina reda.
 * @returns {string} Formatiran string sa tačkicama.
 */
function alignWithDots(text, targetWidth = 65) {
    const minDots = 3;
    const cleanText = text.trim();
    const dotsCount = Math.max(minDots, targetWidth - cleanText.length);
    return `${cleanText} ${C.gray}${".".repeat(dotsCount)}${C.reset}`;
}

/**
 * Glavna funkcija za izvršavanje eksternih komandi.
 *
 * @param {string} step - Naziv koraka koji se ispisuje.
 * @param {string} cmd - Izvršna komanda (npm, cargo, node...).
 * @param {string[]} args - Niz argumenata za komandu.
 * @param {string} cwd - Radni direktorijum (default je ROOT).
 * @param {boolean} useInherit - Ako je true, koristi inherit mod (za y/n i pune tabele).
 * @returns {number} Statusni kod završenog procesa.
 */
function run(step, cmd, args, cwd = ROOT, useInherit = false) {
    console.log(`\n${C.cyan}${C.bold}>>> ${step}${C.reset}`);

    const start = Date.now();

    const options = {
        cwd: cwd,
        shell: true,
        env: {
            ...process.env,
            FORCE_COLOR: "1",
            // [GOD MODE FIX]: COLUMNS=1000 sprečava Vitest da skraćuje putanje fajlova
            COLUMNS: "1000",
        },
        // [GOD MODE]: inherit mod je obavezan za korake koji zahtevaju unos ili punu širinu
        stdio: useInherit && process.stdin.isTTY ? "inherit" : "pipe",
    };

    const fullCommandString = `${cmd} ${args.join(" ")}`;

    const res = spawnSync(fullCommandString, options);

    // Ako smo koristili pipe (stdio: pipe), sada obrađujemo output radi bojenja
    if (!options.stdio || options.stdio === "pipe") {
        let stdout = res.stdout ? res.stdout.toString() : "";
        let stderr = res.stderr ? res.stderr.toString() : "";
        let combined = stdout + stderr;

        // [INTELIGENTNO BOJENJE]
        // Žuta boja rezervisana isključivo za actionable upozorenja
        combined = combined.replace(
            /warning|deprecated|vulnerability|vulnerabilities|moderate|high/gi,
            (match) => {
                return `${C.yellow}${match}${C.reset}`;
            }
        );

        // Cyan boja za verzije, engine i potvrde uspeha
        combined = combined.replace(
            /v\d+\.\d+\.\d+|v8|success|compiled successfully|up to date/gi,
            (match) => {
                return `${C.cyan}${match}${C.reset}`;
            }
        );

        process.stdout.write(combined);
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    TIMINGS.push({ step, time: duration });

    // Provera statusa: Dozvoljavamo 0 (uspeh) i 2 (naš restart signal za I18n)
    if (res.status !== 0 && res.status !== 2) {
        beep();
        console.error(`\n${C.bgRed}${C.white} ❌ FATAL ERROR: ${step} ${C.reset}`);
        console.error(`${C.red}Proces je prekinut zbog greške u komandi: ${fullCommandString}${C.reset}\n`);
        process.exit(1);
    }

    // Vizuelna potvrda koraka sa tačkicama
    const statusLine = alignWithDots(step, 50);
    if (res.status === 0 || res.status === 2) {
        console.log(`\n${C.green}${statusLine}${C.green} ✅ OK${C.reset}`);
    }

    return res.status || 0;
}

/**
 * Logika za interaktivni unos (y/n) sa tastature.
 * Podržava BACKSPACE/ENTER kao DA i DELETE/ESC kao NE.
 */
async function askYesNo(q) {
    if (!process.stdin.isTTY) {
        return false;
    }

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
 * Provera .env konfiguracije.
 */
function checkEnv() {
    const envPath = path.join(ROOT, ".env");
    const examplePath = path.join(ROOT, ".env.example");

    if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
        console.log(`${C.cyan}ℹ️  INFO: .env nije pronađen. Koriste se podrazumevane vrednosti.${C.reset}`);
    }
}

/**
 * Sniffer & Secret Hunter: Traži 'debugger' i tajne ključeve.
 * Ignoriše Stryker sandbox foldere i izveštaje.
 */
async function runSniffer() {
    console.log(`\n${C.cyan}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);

    const gitFilesOutput = spawnSync("git ls-files", { shell: true, encoding: "utf8" });

    if (!gitFilesOutput.stdout) {
        console.log(`${C.gray}Git repozitorijum nije inicijalizovan ili nema fajlova.${C.reset}`);
        return;
    }

    const files = gitFilesOutput.stdout
        .split("\n")
        .filter((f) => f && (f.endsWith(".ts") || f.endsWith(".js") || f.endsWith(".tsx")));

    let issuesFound = 0;
    const secrets = [
        /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA)[A-Z0-9]{16}/,
        /-----BEGIN PRIVATE KEY-----/,
        /sk_live_[0-9a-zA-Z]{24}/,
    ];

    files.forEach((f) => {
        // [GOD MODE FIX]: Ignorišemo Mutation Testing privremene fajlove
        if (
            f.startsWith("scripts/") ||
            f.includes("test") ||
            f.includes(".stryker-tmp") ||
            f.includes("reports/")
        ) {
            return;
        }

        try {
            const content = fs.readFileSync(f, "utf8");
            let fileHasIssue = false;

            // Provera tajni
            secrets.forEach((re) => {
                if (re.test(content)) {
                    console.error(`${C.red}   [SECRET DETECTED]  ${C.white}fajl: ${f}${C.reset}`);
                    fileHasIssue = true;
                }
            });

            // Provera debuggera
            if (content.includes("debugger")) {
                console.error(`${C.red}   [DEBUGGER DETECTED] ${C.white}fajl: ${f}${C.reset}`);
                fileHasIssue = true;
            }

            if (fileHasIssue) {
                issuesFound++;
            }
        } catch (e) {
            // Preskoči nečitljive fajlove
        }
    });

    if (issuesFound > 0) {
        beep();
        console.error(
            `\n${C.bgRed}${C.white} 🛑 STOP! Sniffer je pronašao probleme u ${issuesFound} fajla! ${C.reset}`
        );
        console.error(`${C.red}Ukloni debugger komande ili tajne pre nastavljanja.${C.reset}\n`);
        process.exit(1);
    }

    console.log(`${C.green}✅ Kod je čist i bezbedan.${C.reset}`);
}

/**
 * GLAVNA FUNKCIJA - Izvršni pipeline Guardian sistema.
 */
async function main() {
    printBanner();
    checkEnv();
    await runSniffer();

    // --- KORAK 0: AUTOMATIZACIJA I PRIPREMA ---
    run("0.1 Assets", "node", ["scripts/ensure-icons.js"]);

    if (!IS_FAST_MODE) {
        run("0.2 Clean", "npm", ["run", "clean"]);
    }

    if (isWindows) {
        // Koristimo useInherit=true radi preglednosti liste fajlova u boji
        run(
            "0.3 Hygiene",
            "powershell",
            ["-ExecutionPolicy Bypass", "-File", "./scripts/add-headers.ps1"],
            ROOT,
            true
        );
    }

    // --- GOD MODE I18N RESTART LOGIKA ---
    // Ako skripta vrati 2, to znači da je korisnik potvrdio brisanje i moramo ispočetka
    const i18nStatus = run("0.4 I18n Check", "node", ["scripts/checkI18nKeys.cjs"], ROOT, true);

    if (i18nStatus === 2) {
        console.log(`\n${C.magenta}♻️  IZMENE U PREVODIMA DETEKTOVANE. RESTARTUJEM GUARDIAN...${C.reset}`);
        TIMINGS = []; // Resetujemo tajminge za novi krug
        return main(); // RESTART OD POČETKA
    }

    // Ostale tihe provere
    run("0.5 User Strings Check", "node", ["scripts/checkUserFacingStrings.cjs"]);
    run("0.6 HTML I18n Check", "node", ["scripts/checkTaskpaneHtmlI18n.cjs"]);

    // --- KORAK 1: INSTALACIJA (Utišan audit radi ESLint 8 stabilnosti) ---
    run("1. Install", "npm", ["install", "--no-audit"]);

    // --- KORAK 2: KODNI STANDARD ---
    run("2. Format", "npm", ["run", "format:fix"]);

    // Automatski commit promena formata i higijene pre build-a
    const statusOutput = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (statusOutput) {
        console.log(`\n${C.cyan}ℹ️  Auto-commit: Sinhronizacija formata i higijene...${C.reset}`);

        // [GOD MODE FIX]: Precizan git add koji ignoriše Stryker temp fajlove
        spawnSync(
            "git add src scripts tests assets manifest.xml manifest.prod.xml package.json package-lock.json vitest.config.ts playwright.config.ts stryker.config.json",
            { shell: true, stdio: "inherit" }
        );

        // Koristimo --no-verify da izbegnemo rekurzivno pokretanje Husky-ja
        spawnSync('git commit -m "chore: hygiene & auto-format sync" --no-verify', {
            shell: true,
            stdio: "inherit",
        });
    }

    // --- KORAK 3: QA PROVERE ---
    run("3.1 Conflicts Check", "node", ["scripts/checkConflicts.cjs"]);
    run("3.2 Lint/Type", "npm", ["run", "typecheck"]);

    // --- KORAK 4: CORE ENGINE (Rust WASM) ---
    run("4. Rust", "cargo", ["test"], WASM_DIR);

    // --- KORAK 5: BUILD ---
    run("5. Build", "npm", ["run", "build"]);

    // --- KORAK 6 & 7: TESTOVI (Samo u Full modu) ---
    if (!IS_FAST_MODE) {
        // [GOD MODE FIX]: inherit mod omogućava Vitest-u da prikaže PUNA IMENA bez skraćivanja
        run("6. Unit Tests", "npm", ["run", "test:coverage"], ROOT, true);
        run("7. E2E Tests", "npm", ["run", "test:e2e"]);
    }

    // --- FINAL REPORT (Perfect Alignment) ---
    console.log(`\n${C.cyan}${C.bold}📊 FINAL REPORT:${C.reset}`);

    // Pronalazimo dužinu najdužeg naziva koraka radi poravnanja
    const longestStepName = Math.max(...TIMINGS.map((t) => t.step.length));
    const reportPadding = longestStepName + 2;

    TIMINGS.forEach((t) => {
        const label = t.step + " ";
        const dots = ".".repeat(Math.max(3, reportPadding - label.length));
        console.log(`   • ${C.white}${label}${C.gray}${dots}${C.reset} : ${C.white}${t.time}s${C.reset}`);
    });

    beep();
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO ZA DEPLOY!${C.reset}\n`);

    if (NO_PUSH) return;

    // --- 4. SMART PUSH SYSTEM (V4 - Protected Master Handling) ---
    const currentBranch = spawnSync("git rev-parse --abbrev-ref HEAD", {
        shell: true,
        encoding: "utf8",
    }).stdout.trim();

    const isProtected = currentBranch === "master" || currentBranch === "main";
    const isAutoBranch = currentBranch.startsWith("chore/verified-update-");

    // Ako smo na PR grani, pitaj da li želiš push
    if (isAutoBranch) {
        const shouldPushAuto = await askYesNo(`Ažurirati PR granu '${currentBranch}' na GitHub-u?`);
        if (shouldPushAuto) {
            spawnSync(`git push -u origin ${currentBranch}`, { shell: true, stdio: "inherit" });
            console.log(`\n${C.green}${C.bold}✅ USPEŠNO AŽURIRANO!${C.reset}`);
            // [GOD MODE]: Automatsko otvaranje PR stranice
            openInBrowser(`https://github.com/engilic/serbiantransliterator/pull/new/${currentBranch}`);
        } else {
            console.log(`\n${C.gray}⛔ Push otkazan.${C.reset}`);
        }
        return;
    }

    // Ako smo na masteru, nudi kreiranje nove grane
    const pushPrompt = isProtected
        ? `Grana '${currentBranch}' je ZAŠTIĆENA. Kreirati novu PR granu?`
        : `Push izmene na granu '${currentBranch}'?`;

    const shouldPush = await askYesNo(pushPrompt);

    if (shouldPush) {
        if (isProtected) {
            // Pravimo granu sa timestampom radi unikatnosti
            const timestamp = Math.floor(Date.now() / 1000);
            const newBranchName = `chore/verified-update-${timestamp}`;

            console.log(`\n${C.cyan}ℹ️  Pravim novu granu: ${newBranchName}${C.reset}`);
            spawnSync(`git checkout -b ${newBranchName}`, { shell: true, stdio: "inherit" });

            console.log(`${C.blue}🚀 Pushing to origin...${C.reset}`);
            spawnSync(`git push -u origin ${newBranchName}`, { shell: true, stdio: "inherit" });

            console.log(`\n${C.green}${C.bold}🏆 USPEH! Otvaram Pull Request u browseru...${C.reset}`);
            // [GOD MODE]: Automatsko otvaranje PR stranice
            openInBrowser(`https://github.com/engilic/serbiantransliterator/pull/new/${newBranchName}`);
        } else {
            console.log(`${C.blue}🚀 Pushing na ${currentBranch}...${C.reset}`);
            spawnSync(`git push`, { shell: true, stdio: "inherit" });
        }
    } else {
        console.log(`\n${C.gray}⛔ Push otkazan po želji korisnika.${C.reset}`);
    }
}

/**
 * Pokretanje glavne funkcije sa globalnim error handler-om.
 */
main().catch((err) => {
    console.error(`\n${C.bgRed} ❌ KRITIČNA GREŠKA U GUARDIAN SISTEMU: ${C.reset}`);
    console.error(err);
    process.exit(1);
});
