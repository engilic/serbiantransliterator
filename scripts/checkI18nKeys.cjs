// scripts/checkI18nKeys.cjs

/**
 * 🔍 I18N BLOAT HUNTER • LEVEL: GOD MODE 🛡️
 * ========================================
 *
 * Hirurški skener koji pronalazi neiskorišćene ključeve prevoda.
 * Integriše se sa Guardian sistemom radi automatskog čišćenja koda.
 *
 * [GOD MODE]: Usklađena terminologija sa 'LOKACIJE ZA HIRURŠKU SINHRONIZACIJU'.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// --- KONFIGURACIJA ---
const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const LOCALES_DIR = path.join(SRC_DIR, "shared", "locales");

const FILES_TO_FIX = [path.join(LOCALES_DIR, "en.ts"), path.join(LOCALES_DIR, "sr.ts")];

const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
    white: "\x1b[97m",
    bold: "\x1b[1m",
    bgRed: "\x1b[41m",
};

const DYNAMIC_PATTERNS = [
    "_one",
    "_few",
    "_many",
    "_prefix",
    "_hint",
    "_label",
    "_aria",
    "dir_",
    "ui_theme_",
    "tour_step_",
    "msg_preview_",
    "status_extra_",
];

function isGitDirty() {
    const status = spawnSync("git", ["status", "--porcelain", LOCALES_DIR], { encoding: "utf8" });
    const output = status.stdout.trim();
    return output.length > 0;
}

/**
 * TVOJA ORIGINALNA LOGIKA ZA UNOS.
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

function getTranslationKeys(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf8");
    const matches = content.match(/^\s*([a-z0-9_]+):/gm);
    if (!matches) return [];
    return matches.map((m) => m.replace(":", "").trim());
}

function getAllSourceFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (
                file !== "node_modules" &&
                file !== "locales" &&
                file !== "dist" &&
                file !== ".git" &&
                file !== "coverage"
            ) {
                getAllSourceFiles(filePath, fileList);
            }
        } else {
            const ext = path.extname(file);
            if ([".ts", ".tsx", ".html", ".xml", ".js", ".cjs"].includes(ext)) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

function purgeKeysFromFile(filePath, keysToRemove) {
    if (!fs.existsSync(filePath)) return;
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let count = 0;
    const filteredLines = lines.filter((line) => {
        const trimmed = line.trim();
        let found = false;
        for (const key of keysToRemove) {
            if (trimmed.startsWith(`${key}:`)) {
                found = true;
                count++;
                break;
            }
        }
        return !found;
    });
    fs.writeFileSync(filePath, filteredLines.join("\n"), "utf8");
    console.log(`${C.gray}   ✔ ${fileName}: Obrisano ${C.green}${count}${C.gray} ključeva.${C.reset}`);
}

async function main() {
    console.log(`\n${C.cyan}${C.bold}🔍 I18N BLOAT HUNTER${C.reset}`);
    const enKeys = getTranslationKeys(FILES_TO_FIX[0]);
    const sourceFiles = getAllSourceFiles(SRC_DIR);

    console.log(`${C.blue}${C.bold}📁 SKENIRANI IZVORI PODATAKA:${C.reset}`);
    for (const f of sourceFiles) {
        console.log(`${C.gray}   • ${path.relative(ROOT, f).replace(/\\/g, "/")}${C.reset}`);
    }

    console.log(
        `\n${C.gray}   • Analiza: ${C.white}${sourceFiles.length}${C.gray} fajlova | ${C.white}${enKeys.length}${C.gray} prevoda.${C.reset}`
    );

    const combinedSource = sourceFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");
    const unusedKeys = [];
    for (const key of enKeys) {
        if (combinedSource.includes(key)) continue;
        let isDynamicFound = false;
        for (const pattern of DYNAMIC_PATTERNS) {
            if (key.includes(pattern)) {
                const baseKey = key.split(pattern)[0];
                if (combinedSource.includes(baseKey)) {
                    isDynamicFound = true;
                    break;
                }
            }
        }
        if (!isDynamicFound) unusedKeys.push(key);
    }

    if (unusedKeys.length === 0) {
        console.log(`${C.green}✅ CLEAN CODE: Svi prevodi su u upotrebi.${C.reset}\n`);
        process.exit(0);
    }

    console.log(`\n${C.yellow}${C.bold}⚠️  NEISKORIŠĆENI KLJUČEVI PRONAĐENI:${C.reset}`);
    for (const k of unusedKeys) {
        console.log(`${C.yellow}   - ${k}${C.reset}`);
    }

    // [GOD MODE RENAME]: Lepša terminologija
    console.log(`\n${C.magenta}${C.bold}🎯 LOKACIJE ZA HIRURŠKU SINHRONIZACIJU:${C.reset}`);
    for (const f of FILES_TO_FIX) {
        console.log(`${C.gray}   • ${path.relative(ROOT, f).replace(/\\/g, "/")}${C.reset}`);
    }

    const shouldPurge = await askYesNo("Izvršiti automatsko brisanje iz gornjih fajlova?");

    if (shouldPurge) {
        if (isGitDirty()) {
            console.log(`\n${C.bgRed}${C.white} 🛑 GIT DIRTY ERROR ${C.reset}`);
            process.exit(1);
        }
        for (const file of FILES_TO_FIX) {
            purgeKeysFromFile(file, unusedKeys);
        }
        process.exit(2); // RESTART
    } else {
        process.exit(0); // CONTINUE
    }
}

main().catch((err) => {
    console.error(`\n${C.red}❌ ERROR: ${err.message}${C.reset}`);
    process.exit(1);
});
