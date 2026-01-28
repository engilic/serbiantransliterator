// scripts/git-cleanup.js
const { spawnSync, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const dns = require("dns");

// --- KONFIGURACIJA ---
const BASE_KEEP = [".vs", ".vscode", ".idea", "node_modules", ".git", ".env*"];
const WASM_DIR = path.join(process.cwd(), "src", "wasm-core");
const BACKUP_STASH_NAME = "OMEGA_EMERGENCY_BACKUP";

// Fajlovi i folderi koje treba nemilosrdno obrisati
const NASTY_CACHES = [
    ".eslintcache",
    ".stylelintcache",
    "tsconfig.tsbuildinfo",
    ".npm-cache",
    ".jest-cache",
    ".parcel-cache",
    ".cache",
    "dist",
    "build",
    "coverage",
    "target",
];

const args = process.argv.slice(2);
const FORCE = args.includes("--yes") || args.includes("-y");

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

function beep() {
    process.stdout.write("\x07");
}

function printBanner() {
    console.clear();
    console.log(`${C.red}${C.bold}
                                      
    ☣️  OMEGA SANITIZER • CLEANUP TOOL ☣️
${C.reset}`);
}

function logDual(emoji, sr, en, color = C.reset) {
    console.log(`${color}${emoji} ${C.bold}${sr}${C.reset}`);
    console.log(`   ${C.gray}└─ ${en}${C.reset}`);
}

function run(cmd, args, ignoreError = false) {
    console.log(`${C.gray}$ ${cmd} ${args.join(" ")}${C.reset}`);
    const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });
    if (result.status !== 0 && !ignoreError) {
        console.error(`${C.red}❌ Fail: ${cmd} ${args.join(" ")}${C.reset}`);
        if (!ignoreError) process.exit(1);
    }
    return result.status === 0;
}

function getOutput(cmd, args) {
    const result = spawnSync(cmd, args, { encoding: "utf8", shell: true });
    if (result.status !== 0) return [];
    return result.stdout
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
}

// --- DESKTOP NOTIFICATION ---
function notifyDone(duration, savedMB) {
    const title = "Omega Cleanup Complete";
    const msg = `Saved: ${savedMB} MB | Time: ${duration}s`;

    try {
        if (os.platform() === "darwin") {
            execSync(`osascript -e 'display notification "${msg}" with title "${title}"'`);
        } else if (os.platform() === "win32") {
            const psScript = `
            [void] [System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms");
            $objNotifyIcon = New-Object System.Windows.Forms.NotifyIcon;
            $objNotifyIcon.Icon = [System.Drawing.SystemIcons]::Information;
            $objNotifyIcon.Visible = $True;
            $objNotifyIcon.ShowBalloonTip(5000, "${title}", "${msg}", "Info");
            `;
            spawnSync("powershell", ["-command", psScript], { stdio: "ignore" });
        } else {
            spawnSync("notify-send", [title, msg], { stdio: "ignore" });
        }
    } catch (e) {
        /* Ignore */
    }
}

async function checkGithubAccess() {
    return new Promise((resolve) => {
        dns.lookup("github.com", (err) => resolve(!err));
    });
}

function createEmergencyBackup() {
    const status = getOutput("git", ["status", "--porcelain"]);
    if (status.length === 0) return false;

    console.log(`${C.yellow}🛡️  Pravim sigurnosni backup (Stash)...${C.reset}`);
    const res = spawnSync("git", ["stash", "push", "-u", "-m", BACKUP_STASH_NAME], { encoding: "utf8" });
    if (res.status === 0) {
        console.log(`${C.green}✅ Backup sačuvan: "${BACKUP_STASH_NAME}"${C.reset}`);
        return true;
    }
    return false;
}

function getFolderSize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;
    let totalSize = 0;
    try {
        const stats = fs.statSync(dirPath);
        if (stats.isDirectory()) {
            fs.readdirSync(dirPath).forEach((f) => (totalSize += getFolderSize(path.join(dirPath, f))));
        } else totalSize += stats.size;
    } catch (e) {}
    return totalSize;
}

async function askYesNo(sr, en, dangerLevel = 0) {
    return new Promise((resolve) => {
        let color = C.magenta;
        if (dangerLevel === 1) color = C.yellow;
        if (dangerLevel === 2) color = C.red;
        console.log(`\n${color}❓ ${C.bold}${sr}${C.reset}`);
        console.log(`   ${C.gray}${en}${C.reset}`);
        if (dangerLevel === 2)
            console.log(`   ${C.bgRed}${C.white}${C.bold} 💀 OPASNOST! / DANGER! 💀 ${C.reset}`);
        console.log(
            `   ${C.white}[${C.green}DEL / ➔${C.white}] = ${C.green}DA (YES)${C.reset}  |  ${C.white}[${C.red}BACKSPACE / ⬅${C.white}] = ${C.red}NE (NO)${C.reset}`
        );

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        const listener = (key) => {
            if (key === "\u0003") {
                process.stdin.setRawMode(false);
                process.exit(1);
            }
            if (key === "y" || key === "\u001b[3~" || key === "\u001b[C") {
                process.stdout.write(`${C.green} ✔ DA / YES${C.reset}\n`);
                cleanup(true);
            } else if (key === "n" || key === "\u007f" || key === "\u0008" || key === "\u001b[D") {
                process.stdout.write(`${C.red} ✖ NE / NO${C.reset}\n`);
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

function detectBaseBranch() {
    const branches = getOutput("git", ["branch", "-a"]).join(" ");
    return branches.includes("main") || branches.includes("remotes/origin/main") ? "main" : "master";
}

async function main() {
    printBanner();

    if (!FORCE) {
        logDual("⚠️  OMEGA CLEANUP", "FULL RESET & OPTIMIZE", C.yellow);
        console.log(`${C.gray} - Nuklearno čišćenje fajlova i grana`);
        console.log(` - Backup nekomitovanih izmena`);
        console.log(` - Desktop notifikacija na kraju`);
        if (!(await askYesNo("Pokrenuti?", "Start?", 0))) {
            console.log("❌ Prekinuto.");
            process.exit(0);
        }
    }

    const baseBranch = detectBaseBranch();
    const start = Date.now();
    const hasNet = await checkGithubAccess();

    process.stdout.write(`${C.gray}📊 Računam smeće... ${C.reset}`);
    const pathsToMeasure = ["node_modules", "dist", "build", "coverage", "target"];
    let totalBytes = 0;
    pathsToMeasure.forEach((p) => (totalBytes += getFolderSize(path.resolve(process.cwd(), p))));
    const mbReclaimed = (totalBytes / (1024 * 1024)).toFixed(2);
    console.log(`${C.green}${mbReclaimed} MB${C.reset}`);

    createEmergencyBackup();

    logDual("🔫 1. Cache Sniper", "1. Removing Hidden Caches", C.green);
    NASTY_CACHES.forEach((file) => {
        if (fs.existsSync(file)) fs.rmSync(file, { recursive: true, force: true });
    });

    logDual("🔄 2. Git Reset", "2. Git Reset", C.green);
    run("git", ["checkout", baseBranch]);
    if (hasNet) {
        run("git", ["fetch", "origin"]);
        run("git", ["reset", "--hard", `origin/${baseBranch}`]);
        run("git", ["remote", "prune", "origin"]);
    } else {
        console.log(`${C.yellow}⚠️ Nema interneta. Preskačem fetch origin.${C.reset}`);
    }

    logDual("🧹 3. Lokalne Grane", "3. Local Branches", C.green);
    const localBranches = getOutput("git", ["branch"]);
    const safeBranches = [baseBranch, "master", "main", "dev", "* " + baseBranch];
    localBranches.forEach((b) => {
        // [FIX] CodeQL Compliant: Use global regex to replace all asterisks
        const name = b.replace(/\*/g, "").trim();
        if (!safeBranches.includes(name)) run("git", ["branch", "-D", name], true);
    });

    if (!FORCE && hasNet) {
        console.log(`\n${C.red}---------------------------------------------------${C.reset}`);
        if (await askYesNo("Obrisati REMOTE grane?", "Delete REMOTE branches?", 1)) {
            beep();
            if (await askYesNo("SIGURNO? (Nema nazad)", "REALLY SURE?", 2)) {
                console.log(`${C.bgRed}${C.white} 🔥 BRISANJE... 🔥 ${C.reset}`);
                const rBranches = getOutput("git", ["branch", "-r"]);
                let cnt = 0;
                rBranches.forEach((rb) => {
                    if (rb.includes("->") || rb.includes(baseBranch)) return;
                    const bName = rb.split("/").slice(1).join("/");
                    const rName = rb.split("/")[0];
                    if (bName !== baseBranch && bName !== "master" && bName !== "main") {
                        console.log(`${C.yellow}Del: ${bName}${C.reset}`);
                        run("git", ["push", rName, "--delete", bName], true);
                        cnt++;
                    }
                });
                if (cnt === 0) console.log(`${C.gray}Nema remote grana.${C.reset}`);
            }
        }
    }

    logDual("☢️  4. Brisanje fajlova", "4. File Cleanup", C.green);
    if (fs.existsSync(path.join(WASM_DIR, "Cargo.toml")))
        try {
            spawnSync("cargo", ["clean"], { cwd: WASM_DIR });
        } catch (e) {}

    const keepArgs = [];
    BASE_KEEP.forEach((f) => keepArgs.push("-e", f));
    fs.readdirSync(process.cwd()).forEach((file) => {
        if (file.startsWith(".env")) keepArgs.push("-e", file);
    });
    run("git", ["clean", "-ffdx", ...keepArgs]);

    logDual("♻️  5. Git Optimize", "5. Git GC", C.green);
    run("git", ["gc", "--prune=now", "--aggressive"]);

    logDual("📦 6. Instalacija", "6. Installation", C.green);
    if (fs.existsSync("package-lock.json")) {
        if (!run("npm", ["ci"], true)) run("npm", ["install"]);
    } else run("npm", ["install"]);

    const dur = ((Date.now() - start) / 1000).toFixed(2);

    beep();
    notifyDone(dur, mbReclaimed);
    console.log(`\n${C.green}${C.bold}✨ OMEGA COMPLETE ✨${C.reset}`);
    console.log(`${C.cyan}💾 Space Saved: ${mbReclaimed} MB${C.reset}`);
    console.log(`${C.gray}⏱️  Time: ${dur}s${C.reset}\n`);
}

main();
