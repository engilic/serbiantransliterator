// scripts/verify-all.js

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");
const ARGS = process.argv.slice(2);
const IS_FAST_MODE = ARGS.includes("--fast");
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

function printBanner() {
    console.clear();
    console.log(`${C.magenta}${C.bold}
    🛡️  GUARDIAN SYSTEM • LEVEL: GOD MODE 🛡️
${C.reset}`);
}

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

    // Pametno bojenje: samo pravi warning-zi su žuti
    output = output.replace(/warning|deprecated/gi, (match) => `${C.yellow}${match}${C.reset}`);

    // Verzije i uspešne poruke u Cyan
    output = output.replace(
        /v\d+\.\d+\.\d+|success|compiled successfully/gi,
        (match) => `${C.cyan}${match}${C.reset}`
    );

    process.stdout.write(output);

    TIMINGS.push({ step, time: ((Date.now() - start) / 1000).toFixed(2) });

    if (res.status !== 0) {
        console.error(`\n${C.bgRed} ❌ FATAL ERROR: ${step} ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ OK${C.reset}`);
}

async function runSniffer() {
    console.log(`\n${C.blue}${C.bold}>>> Sniffer & Secret Hunter${C.reset}`);
    const gitStatus = spawnSync("git ls-files", { shell: true, encoding: "utf8" });
    if (!gitStatus.stdout) return;

    const files = gitStatus.stdout.split("\n").filter((f) => f && (f.endsWith(".ts") || f.endsWith(".js")));
    let issues = 0;
    files.forEach((f) => {
        if (f.startsWith("scripts/") || f.includes("test")) return;
        const content = fs.readFileSync(f, "utf8");
        if (content.includes("debugger")) issues++;
    });

    if (issues > 0) {
        console.error(`\n${C.bgRed} 🛑 PRONAĐEN DEBUGGER U KODU! ${C.reset}`);
        process.exit(1);
    }
    console.log(`${C.green}✅ Bezbednost OK.${C.reset}`);
}

async function main() {
    printBanner();
    console.log(`${C.cyan}ℹ️  OS: ${process.platform} | Node: ${process.version}${C.reset}`);

    await runSniffer();

    if (!IS_FAST_MODE) {
        run("0. Clean", "npm", ["run", "clean"]);
    }

    if (isWindows) {
        run("0. Hygiene", "powershell", ["-ExecutionPolicy Bypass", "-File", "./scripts/add-headers.ps1"]);
    }

    run("1. Install", "npm", ["install"]);
    run("2. Format", "npm", ["run", "format:fix"]);

    const status = spawnSync("git status --porcelain", { shell: true, encoding: "utf8" }).stdout.trim();
    if (status) {
        console.log(`${C.cyan}ℹ️  Auto-commit: Syncing assets & hygiene...${C.reset}`);
        spawnSync("git add .", { shell: true });
        spawnSync('git commit -m "chore: hygiene & format sync"', { shell: true });
    }

    run("3. Lint/Type", "npm", ["run", "typecheck"]);
    run("4. Rust", "cargo", ["test"], WASM_DIR);
    run("5. Build", "npm", ["run", "build"]);

    if (!IS_FAST_MODE) {
        run("6. Unit Tests", "npm", ["run", "test:coverage"]);
        run("7. E2E Tests", "npm", ["run", "test:e2e"]);
    }

    console.log(`\n${C.cyan}📊 FINAL REPORT:${C.reset}`);
    TIMINGS.forEach((t) => console.log(`   • ${t.step.padEnd(20)}: ${C.white}${t.time}s${C.reset}`));
    console.log(`\n${C.green}${C.bold}🏆 SPREMNO ZA PROIZVODNJU!${C.reset}\n`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
