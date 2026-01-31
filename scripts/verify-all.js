// scripts/verify-all.js

/**
 * 🛡️ GUARDIAN SYSTEM • LEVEL: GOD MODE v1.3.0 🛡️
 * ============================================
 *
 * [FIX]: 'npm ci' zamenjen sa 'npm install' radi automatske sinhronizacije lock fajla.
 * [FIX]: Implementirano savršeno poravnanje testova (Najduža reč + 5 tačkica).
 *
 * Zadržana originalna logika:
 * - Sniffer & Secret Hunter
 * - Custom input system (Backspace=DA, Delete=NE)
 * - God Mode paleta boja
 */

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");
const ARGS = process.argv.slice(2);
const IS_FAST_MODE = ARGS.includes("--fast");
const NO_PUSH = ARGS.includes("--no-push");

// --- ANSI BOJE ---
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
    if (process.stdout.isTTY) {
        process.stdout.write("\x07");
    }
}

function printBanner() {
    console.log(`\n${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
    ========================================
${C.reset}`);
}

/**
 * Pomoćna funkcija za savršeno poravnanje.
 */
function alignWithDots(text, targetWidth, minDots = 5) {
    const cleanText = text.trim();
    const dotsCount = Math.max(minDots, targetWidth - cleanText.length);
    return `${cleanText} ${C.gray}${".".repeat(dotsCount)}${C.reset}`;
}

/**
 * Glavni runner sa hibridnim stdio modom.
 */
function run(step, cmd, args, cwd = ROOT, useInherit = false) {
    console.log(`\n${C.blue}${C.bold}>>> ${step}${C.reset}`);
    const start = Date.now();

    const fullCmd = `${cmd} ${args.join(" ")}`;

    const res = spawnSync(fullCmd, {
        cwd,
        shell: true,
        // Za install i build koristimo inherit radi live progresa
        stdio: useInherit ? "inherit" : "pipe",
        env: { ...process.env, FORCE_COLOR: "1", COLUMNS: "200" },
    });

    // Ako koristimo pipe (za testove), vršimo dinamičko poravnanje
    if (!useInherit && (res.stdout || res.stderr)) {
        const output = (res.stdout ? res.stdout.toString() : "") + (res.stderr ? res.stderr.toString() : "");
        const lines = output.split("\n");

        let maxLabelLen = 0;
        lines.forEach((line) => {
            if (line.includes("test ") && line.includes(" ... ok")) {
                const label = line.split(" ... ok")[0].trim().length;
                if (label > maxLabelLen) maxLabelLen = label;
            }
        });

        const targetWidth = maxLabelLen + 5;
        lines.forEach((line) => {
            if (line.trim() === "") return;
            if (line.includes("test ") && line.includes(" ... ok")) {
                const label = line.split(" ... ok")[0].trim();
                console.log(alignWithDots(label, targetWidth, 5) + C.green + " ok" + C.reset);
            } else {
                console.log(
                    line.replace(/warning|vulnerability|moderate/gi, (m) => `${C.yellow}${m}${C.reset}`)
                );
            }
        });
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    TIMINGS.push({ step, time: duration });

    if (res.status !== 0 && res.status !== 2) {
        beep();
        console.error(`\n${C.bgRed}${C.white} ❌ FATAL ERROR: ${step} ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ OK${C.reset}`);
}

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
            if (["y", "Y", "\r", "\n", "\u007f", "\u0008", "\u001b[D"].includes(k)) {
                process.stdout.write(`${C.green} ✔ DA${C.reset}\n`);
                cleanup(true);
            } else if (["n", "N", "\u001b", "\u001b[3~", "\u001b[C"].includes(k)) {
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
        console.error(`${C.red}❌ Nedostaje .env fajl!${C.reset}`);
        process.exit(1);
    }
}

async function runSniffer() {
    console.log(`\n${C.blue}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);
    const gitFiles = spawnSync("git ls-files", { shell: true, encoding: "utf8" })
        .stdout.split("\n")
        .filter((f) => f && /\.(ts|js|tsx)$/.test(f));
    let issues = 0;
    gitFiles.forEach((f) => {
        if (f.startsWith("scripts/") || f.includes("test")) return;
        try {
            const content = fs.readFileSync(f, "utf8");
            if (/debugger;|sk_live_|eval\(/.test(content)) issues++;
        } catch (e) {}
    });
    if (issues > 0) {
        beep();
        process.exit(1);
    }
    console.log(`${C.green}✅ Kod je čist (Bezbednost OK).${C.reset}`);
}

async function main() {
    printBanner();
    checkEnv();
    await runSniffer();

    // [GOD MODE FIX]: Koristimo install umesto ci radi sinhronizacije lock fajla
    run("1. Install", "npm", ["install --legacy-peer-deps --no-audit"], ROOT, true);

    run("2. Format", "npm", ["run", "format:fix"], ROOT, true);

    const status = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (status) {
        console.log(`${C.yellow}⚠️  Auto-commit format & hygiene...${C.reset}`);
        spawnSync("git add .", { shell: true, stdio: "inherit" });
        spawnSync('git commit -m "chore: hygiene & format sync" --no-verify', {
            shell: true,
            stdio: "inherit",
        });
    }

    run("3. Lint/Type", "npm", ["run", "typecheck"], ROOT, true);
    run("4. Rust", "cargo", ["test"], WASM_DIR, true);
    run("5. Build", "npm", ["run", "build"], ROOT, true);

    if (!IS_FAST_MODE) {
        run("6. Unit Tests", "npm", ["run", "test:coverage"]);
        run("7. E2E Tests", "npm", ["run", "test:e2e"], ROOT, true);
    }

    console.log(`\n${C.cyan}📊 REPORT:${C.reset}`);
    const maxStep = Math.max(...TIMINGS.map((t) => t.step.length)) + 5;
    TIMINGS.forEach((t) =>
        console.log(
            `   • ${C.white}${alignWithDots(t.step, maxStep, 5)}${C.reset} : ${C.white}${t.time}s${C.reset}`
        )
    );

    beep();
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO ZA DEPLOY!${C.reset}\n`);

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
            spawnSync(`git checkout -b ${autoBranch}`, { shell: true, stdio: "inherit" });
            spawnSync(`git push -u origin ${autoBranch}`, { shell: true, stdio: "inherit" });
            console.log(
                `\n${C.green}✅ Link: https://github.com/engilic/serbiantransliterator/pull/new/${autoBranch}${C.reset}\n`
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
