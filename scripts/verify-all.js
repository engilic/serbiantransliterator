// scripts/verify-all.js

/**
 * 🛡️ GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
 * ========================================
 *
 * Centralni nadzorni sistem za Serbian Transliterator.
 * Upravlja kompletnim pipeline-om i garantuje stabilnost pre svakog push-a.
 *
 * [GOD MODE FIX]: Sinhronizacija sa Stryker Mutation Testing sistemom.
 *
 * Autor: Jugoslav Ilić
 */

const { spawnSync } = require("child_process");
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

// --- 3. ANSI BOJE (God Mode Paleta) ---
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[36m", // Cyan radi kontrasta
    magenta: "\x1b[35m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
    white: "\x1b[97m",
    bgRed: "\x1b[41m",
    cyan: "\x1b[36m",
};

// Globalni niz za praćenje trajanja svakog koraka (let zbog restarta)
let TIMINGS = [];

/**
 * Zvučni signal (System Beep).
 */
function beep() {
    process.stdout.write("\x07");
}

/**
 * Prikazuje Guardian banner na vrhu terminala.
 */
function printBanner() {
    console.log(`\n${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
    ========================================
${C.reset}`);
}

/**
 * Pomoćna funkcija za poravnanje teksta sa tačkicama.
 */
function alignWithDots(text, targetWidth = 65) {
    const minDots = 3;
    const cleanText = text.trim();
    const dotsCount = Math.max(minDots, targetWidth - cleanText.length);
    return `${cleanText} ${C.gray}${".".repeat(dotsCount)}${C.reset}`;
}

/**
 * Glavna funkcija za izvršavanje eksternih komandi.
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
            COLUMNS: "1000",
        },
        stdio: useInherit && process.stdin.isTTY ? "inherit" : "pipe",
    };

    const fullCommandString = `${cmd} ${args.join(" ")}`;
    const res = spawnSync(fullCommandString, options);

    if (options.stdio === "pipe") {
        let stdout = res.stdout ? res.stdout.toString() : "";
        let stderr = res.stderr ? res.stderr.toString() : "";
        let lines = (stdout + stderr).split("\n");

        const formattedOutput = lines
            .map((line) => {
                let processed = line;
                if (processed.includes("test ") && processed.includes(" ... ok")) {
                    const parts = processed.split(" ... ok");
                    processed = `${alignWithDots(parts[0].trim(), 75)}${C.green} ok${C.reset}`;
                }
                processed = processed.replace(
                    /warning|deprecated|vulnerability|vulnerabilities|moderate|high/gi,
                    (m) => `${C.yellow}${m}${C.reset}`
                );
                processed = processed.replace(
                    /v\d+\.\d+\.\d+|v8|success|compiled successfully|up to date/gi,
                    (m) => `${C.cyan}${m}${C.reset}`
                );
                return processed;
            })
            .join("\n");

        process.stdout.write(formattedOutput);
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    TIMINGS.push({ step, time: duration });

    if (res.status !== 0 && res.status !== 2) {
        beep();
        console.error(`\n${C.bgRed}${C.white} ❌ FATAL ERROR: ${step} ${C.reset}`);
        process.exit(1);
    }

    const statusLine = alignWithDots(step, 50);
    if (res.status === 0 || res.status === 2) {
        console.log(`\n${C.green}${statusLine}${C.green} ✅ OK${C.reset}`);
    }

    return res.status || 0;
}

/**
 * TVOJA ORIGINALNA LOGIKA ZA UNOS (BACKSPACE = DA, DELETE = NE).
 */
async function askYesNo(q) {
    if (!process.stdin.isTTY) return false;
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
    const envPath = path.join(ROOT, ".env");
    if (!fs.existsSync(envPath) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.log(`${C.cyan}ℹ️  INFO: Koriste se podrazumevane env vrednosti.${C.reset}`);
    }
}

async function runSniffer() {
    console.log(`\n${C.cyan}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);
    const gitFilesOutput = spawnSync("git ls-files", { shell: true, encoding: "utf8" });
    if (!gitFilesOutput.stdout) return;
    const files = gitFilesOutput.stdout
        .split("\n")
        .filter((f) => f && (f.endsWith(".ts") || f.endsWith(".js") || f.endsWith(".tsx")));
    let issues = 0;
    const secrets = [
        /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA)[A-Z0-9]{16}/,
        /-----BEGIN PRIVATE KEY-----/,
        /sk_live_[0-9a-zA-Z]{24}/,
    ];
    files.forEach((f) => {
        // [GOD MODE FIX]: Sniffer sada ignoriše .stryker-tmp i reports folder
        if (
            f.startsWith("scripts/") ||
            f.includes("test") ||
            f.includes(".stryker-tmp") ||
            f.includes("reports/")
        )
            return;
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
        console.error(`\n${C.bgRed}${C.white} 🛑 DEBUGGER ILI SECRETS PRONAĐENI! ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ Bezbednost OK.${C.reset}`);
}

async function main() {
    printBanner();
    checkEnv();
    await runSniffer();

    run("0.1 Assets", "node", ["scripts/ensure-icons.js"]);
    if (!IS_FAST_MODE) run("0.2 Clean", "npm", ["run", "clean"]);
    if (isWindows)
        run(
            "0.3 Hygiene",
            "powershell",
            ["-ExecutionPolicy Bypass", "-File", "./scripts/add-headers.ps1"],
            ROOT,
            true
        );

    const i18nStatus = run("0.4 I18n Check", "node", ["scripts/checkI18nKeys.cjs"], ROOT, true);
    if (i18nStatus === 2) {
        console.log(`\n${C.magenta}♻️  IZMENE DETEKTOVANE. RESTART...${C.reset}`);
        TIMINGS = [];
        return main();
    }

    run("0.5 User Strings Check", "node", ["scripts/checkUserFacingStrings.cjs"]);
    run("0.6 HTML I18n Check", "node", ["scripts/checkTaskpaneHtmlI18n.cjs"]);

    run("1. Install", "npm", ["install", "--no-audit"]);
    run("2. Format", "npm", ["run", "format:fix"]);

    const statusOutput = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (statusOutput) {
        console.log(`\n${C.cyan}ℹ️  Auto-commit: Sinhronizacija...${C.reset}`);

        // [GOD MODE FIX]: Precizan git add uključujući i stryker konfiguraciju
        spawnSync(
            "git add src scripts tests assets manifest.xml manifest.prod.xml package.json package-lock.json vitest.config.ts playwright.config.ts stryker.config.json",
            { shell: true, stdio: "inherit" }
        );

        spawnSync('git commit -m "chore: hygiene & format sync" --no-verify', {
            shell: true,
            stdio: "inherit",
        });
    }

    run("3.1 Conflicts Check", "node", ["scripts/checkConflicts.cjs"]);
    run("3.2 Lint/Type", "npm", ["run", "typecheck"]);

    run("4. Rust", "cargo", ["test"], WASM_DIR);
    run("5. Build", "npm", ["run", "build"]);

    if (!IS_FAST_MODE) {
        run("6. Unit Tests", "npm", ["run", "test:coverage"], ROOT, true);
        run("7. E2E Tests", "npm", ["run", "test:e2e"]);
    }

    console.log(`\n${C.cyan}${C.bold}📊 FINAL REPORT:${C.reset}`);
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

    const currentBranch = spawnSync("git rev-parse --abbrev-ref HEAD", {
        shell: true,
        encoding: "utf8",
    }).stdout.trim();
    const isProtected = currentBranch === "master" || currentBranch === "main";
    const isAutoBranch = currentBranch.startsWith("chore/verified-update-");

    if (isAutoBranch) {
        const ok = await askYesNo(`Ažurirati PR granu '${currentBranch}'?`);
        if (ok) {
            spawnSync(`git push -u origin ${currentBranch}`, { shell: true, stdio: "inherit" });
            console.log(`\n${C.green}✅ Uspešno ažurirano.${C.reset}`);
        }
        return;
    }

    const pushPrompt = isProtected
        ? `Master je ZAŠTIĆEN. Kreirati novu PR granu?`
        : `Push na '${currentBranch}'?`;
    const shouldPush = await askYesNo(pushPrompt);

    if (shouldPush) {
        if (isProtected) {
            const timestamp = Math.floor(Date.now() / 1000);
            const newBranchName = `chore/verified-update-${timestamp}`;
            spawnSync(`git checkout -b ${newBranchName}`, { shell: true });
            spawnSync(`git push -u origin ${newBranchName}`, { shell: true, stdio: "inherit" });
            console.log(
                `\n${C.green}${C.bold}🏆 USPEH! Link: https://github.com/engilic/serbiantransliterator/pull/new/${newBranchName}${C.reset}\n`
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
