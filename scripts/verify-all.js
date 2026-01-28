// scripts/verify-all.js
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const os = require("os");

// --- KONFIGURACIJA ---
const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");
const MAX_WASM_SIZE_MB = 2.0;

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
                                                   
    🛡️  GUARDIAN SYSTEM • HEAVY ARMOR 🛡️
${C.reset}`);
}

function logStep(step, cmd) {
    console.log(`\n${C.blue}${C.bold}>>> ${step}${C.reset}`);
    if (cmd) console.log(`${C.gray}$ ${cmd}${C.reset}`);
}

function run(step, cmd, args, cwd = ROOT, env = {}) {
    logStep(step, `${cmd} ${args.join(" ")}`);
    const start = Date.now();
    const res = spawnSync(cmd, args, {
        cwd,
        stdio: "inherit",
        shell: true,
        env: { ...process.env, ...env, FORCE_COLOR: "1" },
    });
    const dur = ((Date.now() - start) / 1000).toFixed(2);
    TIMINGS.push({ step, time: dur });

    if (res.status !== 0) {
        beep();
        console.error(`\n${C.bgRed}${C.white} ❌ FATAL ERROR U KORAKU: ${step} ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ Uspešno (${dur}s)${C.reset}`);
}

// --- INTERACTIVE HELPERI ---
async function askYesNo(q) {
    return new Promise((r) => {
        console.log(`\n${C.magenta}❓ ${q} ${C.gray}(Y/n)${C.reset}`);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        const l = (k) => {
            if (k === "\u0003") process.exit(1);
            if (k === "y" || k === "Y" || k === "\r") {
                cleanup(true);
            } else {
                cleanup(false);
            }
        };
        const cleanup = (res) => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener("data", l);
            r(res);
        };
        process.stdin.on("data", l);
    });
}

function askString(sr) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(`${C.cyan}✍️  ${sr}`);
    return new Promise((resolve) =>
        rl.question(`   ${C.gray}Unos: ${C.reset}`, (ans) => {
            rl.close();
            resolve(ans);
        })
    );
}

// --- GUARDIAN CHECKS (HEAVY LOGIC) ---

// 1. Detektuj glavnu granu
function detectBaseBranch() {
    const branches = spawnSync("git", ["branch", "-a"], { encoding: "utf8" }).stdout;
    return branches.includes("main") || branches.includes("remotes/origin/main") ? "main" : "master";
}

// 2. Branch Safety (Zabranjuje rad na masteru)
async function ensureSafeBranch(baseBranch) {
    const result = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" });
    const currentBranch = result.stdout.trim();

    if (currentBranch !== "master" && currentBranch !== "main") {
        console.log(`${C.gray}🌿 Trenutna grana: ${C.cyan}${currentBranch}${C.reset}`);
        return currentBranch;
    }

    console.log(`\n${C.bgRed}${C.white} 🚨 PAŽNJA: RADIŠ NA '${currentBranch}' GRANI! 🚨 ${C.reset}`);

    if (await askYesNo("Da li želiš da napravim novu granu?")) {
        let newBranch = "";
        while (!newBranch) newBranch = await askString("Unesi ime nove grane (npr. feat/nova-opcija):");
        spawnSync("git", ["checkout", "-b", newBranch], { stdio: "inherit" });
        return newBranch;
    } else {
        console.log(`${C.red}⚠️  Nastavljaš na masteru na sopstvenu odgovornost.${C.reset}`);
        return currentBranch;
    }
}

// 3. Commit Linter (Proverava da li su nazivi dobri)
function checkCommitConvention(baseBranch) {
    const result = spawnSync("git", ["log", `${baseBranch}..HEAD`, "--pretty=format:%s"], {
        encoding: "utf8",
    });
    const commits = result.stdout.split("\n").filter((c) => c.length > 0);
    if (commits.length === 0) return;

    // Regex za Conventional Commits
    const regex = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\([a-z0-9-]+\))?: .+/;
    let hasErrors = false;

    commits.forEach((msg) => {
        if (!regex.test(msg)) {
            console.error(`${C.red}❌ Bad Commit: "${msg}"${C.reset}`);
            hasErrors = true;
        }
    });

    if (hasErrors) {
        console.error(`\n${C.red}⛔ Tvoji commiti ne prate standard (feat:, fix:...)!${C.reset}`);
        console.error(`${C.yellow}Koristi 'git commit --amend' da popraviš.${C.reset}`);
        process.exit(1);
    }
}

// 4. Sniffer (Tajne i Garbage)
async function runSniffer() {
    logStep("Sniffer & Secret Hunter", "");

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
        // 1. Ignorisanje sistemskih fajlova
        if (f.startsWith("scripts/") || f.includes("test") || f.includes("spec")) return;

        const content = fs.readFileSync(f, "utf8");

        // 2. Trazenje Tajni
        secrets.forEach((re) => {
            if (re.test(content)) {
                console.error(`${C.red}💀 SECRET NAĐEN U FAJLU: ${f}${C.reset}`);
                issues++;
            }
        });

        // 3. Trazenje Djubreta
        if (content.includes("debugger")) {
            console.error(`${C.red}❌ 'debugger' u fajlu: ${f}${C.reset}`);
            issues++;
        }

        // Upozorenje za console.log (nije fatal error, ali je ruzno)
        if (content.includes("console.log")) {
            console.warn(`${C.yellow}⚠️ 'console.log' u fajlu: ${f}${C.reset}`);
            // issues++; // Ako želiš da bude strogo, odkomentariši ovo!
        }
    });

    if (issues > 0) {
        beep();
        console.error(
            `\n${C.bgRed}${C.white} 🛑 PRONAĐENO ${issues} KRITIČNIH PROBLEMA! POPRAVI PRE NASTAVKA. ${C.reset}`
        );
        process.exit(1);
    }
    console.log(`${C.green}✅ Kod je čist.${C.reset}`);
}

function checkEnv() {
    if (!fs.existsSync(path.join(ROOT, ".env")) && fs.existsSync(path.join(ROOT, ".env.example"))) {
        console.error(`${C.red}❌ Nedostaje .env fajl!${C.reset}`);
        process.exit(1);
    }
}

// --- MAIN ---
async function main() {
    printBanner();
    checkEnv();

    // --- GUARDIAN PROVERE ---
    const baseBranch = detectBaseBranch();
    await ensureSafeBranch(baseBranch); // PITA TE ZA GRANU
    checkCommitConvention(baseBranch); // PITA TE ZA COMMITE
    await runSniffer(); // TRAŽI TAJNE

    // --- BUILD PIPELINE ---
    run("1. Sigurna Instalacija", "npm", ["ci"]);

    run("2. Format", "npm", ["run", "format:fix"]);
    // Auto-commit formata
    if (spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" }).stdout.trim()) {
        console.log(`${C.yellow}⚠️  Auto-commit formatiranja...${C.reset}`);
        spawnSync("git", ["add", "."], { stdio: "inherit" });
        spawnSync("git", ["commit", "-m", "chore: auto-format verified-all"], { stdio: "inherit" });
    }

    run("3. Lint/Type", "npm", ["run", "typecheck"]);
    run("4. Rust", "cargo", ["test"], WASM_DIR);
    run("5. Build", "npm", ["run", "build"]);

    const wasmPath = path.join(WASM_DIR, "pkg/serbian_transliterator_wasm_bg.wasm");
    if (fs.existsSync(wasmPath) && fs.statSync(wasmPath).size / 1024 / 1024 > MAX_WASM_SIZE_MB) {
        console.error(`${C.red}❌ WASM prevelik!${C.reset}`);
        process.exit(1);
    }

    if (!fs.existsSync(path.join(ROOT, "dist", "taskpane.html"))) {
        console.error(`${C.red}❌ Build failed (no html)${C.reset}`);
        process.exit(1);
    }

    // 5. TESTS
    if (!IS_FAST_MODE) {
        run("6. Unit Tests", "npm", ["run", "test:coverage"]);
        run("7. E2E Tests", "npm", ["run", "test:e2e"]);
    } else {
        console.log(`${C.yellow}⏩ Skipping tests (Fast Mode)${C.reset}`);
    }

    // 6. FINISH
    console.log(`\n${C.cyan}📊 REPORT:${C.reset}`);
    TIMINGS.forEach((t) => console.log(`   • ${t.step.padEnd(20)}: ${t.time}s`));

    beep();
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO!${C.reset}`);

    if (!NO_PUSH) {
        if (await askYesNo("Push na GitHub?")) {
            spawnSync("git", ["push"], { stdio: "inherit" });
        }
    }
}

main();
