// scripts/checkI18nKeys.cjs

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const LOCALES_DIR = path.join(SRC_DIR, "shared", "locales");
const FILES_TO_FIX = [path.join(LOCALES_DIR, "en.ts"), path.join(LOCALES_DIR, "sr.ts")];

// --- ANSI BOJE ---
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
    bold: "\x1b[1m",
    bgRed: "\x1b[41m",
};

/**
 * Dinamički šabloni (Whitelist).
 * Ovi sufiksi se često generišu u kodu (npr. t("word_count_" + plural)).
 * Skener će smatrati ključ korišćenim ako se koren reči nalazi bilo gde u kodu.
 */
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
    "tour_step",
    "msg_preview_",
    "status_extra_",
];

/**
 * Proverava da li ima nekomitovanih promena u locales fajlovima.
 * Ovo je "Safety Gate" koji ti omogućava brz povratak (undo).
 */
function isGitDirty() {
    const status = spawnSync("git", ["status", "--porcelain", LOCALES_DIR], { encoding: "utf8" });
    return status.stdout.trim().length > 0;
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans.toLowerCase());
        })
    );
}

function getTranslationKeys(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf8");
    // Hvata ključeve tipa -> kljuc_ime: "tekst"
    const matches = content.match(/^\s*([a-z0-9_]+):/gm);
    return matches ? matches.map((m) => m.replace(":", "").trim()) : [];
}

function getAllSourceFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            // Preskačemo nepotrebne foldere radi brzine i tačnosti
            if (file !== "node_modules" && file !== "locales" && file !== "dist" && file !== ".git") {
                getAllSourceFiles(filePath, fileList);
            }
        } else {
            const ext = path.extname(file);
            if ([".ts", ".tsx", ".html", ".xml", ".js", ".cjs"].includes(ext)) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

function purgeKeysFromFile(filePath, keysToRemove) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    const filteredLines = lines.filter((line) => {
        const trimmed = line.trim();
        // Proverava da li je linija definicija ključa koji želimo da obrišemo
        const isTarget = keysToRemove.some((key) => trimmed.startsWith(`${key}:`));
        return !isTarget;
    });

    fs.writeFileSync(filePath, filteredLines.join("\n"), "utf8");
}

async function main() {
    console.log(`\n${C.cyan}${C.bold}🔍 I18N BLOAT HUNTER (Safety First Edition)${C.reset}`);

    const enLocalePath = path.join(LOCALES_DIR, "en.ts");
    const enKeys = getTranslationKeys(enLocalePath);
    const sourceFiles = getAllSourceFiles(SRC_DIR);

    console.log(`${C.gray}   Scanning ${sourceFiles.length} files for ${enKeys.length} keys...${C.reset}`);

    // Spajamo sav izvorni kod u jedan gigantski string radi "Grep" pretrage
    const combinedSource = sourceFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

    const unused = [];

    enKeys.forEach((key) => {
        // 1. Direktna provera: da li se ključ pominje bilo gde u kodu?
        if (combinedSource.includes(key)) return;

        // 2. Dinamička provera: da li je ključ varijanta nekog korišćenog korena?
        let isDynamicMatch = false;
        for (const pattern of DYNAMIC_PATTERNS) {
            if (key.includes(pattern)) {
                const baseKey = key.split(pattern)[0];
                if (combinedSource.includes(baseKey)) {
                    isDynamicMatch = true;
                    break;
                }
            }
        }

        if (!isDynamicMatch) {
            unused.push(key);
        }
    });

    if (unused.length === 0) {
        console.log(`${C.green}✅ PERFECT HYGIENE: All i18n keys are actively used.${C.reset}\n`);
        process.exit(0);
    }

    console.log(`${C.yellow}${C.bold}⚠️  POTENTIAL BLOAT FOUND (${unused.length} keys):${C.reset}`);
    unused.forEach((k) => console.log(`${C.yellow}   - ${k}${C.reset}`));

    console.log(`\n${C.white}--------------------------------------------------${C.reset}`);
    const answer = await askQuestion(`${C.cyan}❓ Da li želiš da obrišem ove ključeve? (y/n): ${C.reset}`);

    if (answer === "y" || answer === "yes") {
        // [SAFETY CHECK]: Ne dozvoljavamo brisanje ako korisnik nije osiguran Git-om
        if (isGitDirty()) {
            console.log(`\n${C.bgRed}${C.white} 🛑 STOP! ${C.reset}`);
            console.log(`${C.red}Imaš nekomitovane promene u 'src/shared/locales/'.${C.reset}`);
            console.log(
                `${C.yellow}Prvo komituj svoj rad, pa onda pokreni čišćenje da bi imao 'Undo' opciju.${C.reset}\n`
            );
            process.exit(1);
        }

        console.log(`${C.green}🚀 Purging keys...${C.reset}`);
        FILES_TO_FIX.forEach((file) => {
            purgeKeysFromFile(file, unused);
            console.log(`${C.gray}   ✔ Updated: ${path.basename(file)}${C.reset}`);
        });

        console.log(
            `\n${C.green}${C.bold}🏆 SUCCESS: Hygiene restored. Proveri fajlove pre commita.${C.reset}\n`
        );
    } else {
        console.log(`\n${C.gray}⛔ Purge cancelled.${C.reset}\n`);
    }
}

main().catch((err) => {
    console.error(`\n${C.red}❌ FATAL ERROR: ${err.message}${C.reset}`);
    process.exit(1);
});
