// scripts/checkI18nKeys.cjs

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const LOCALES_DIR = path.join(SRC_DIR, "shared", "locales");

// --- ANSI BOJE ---
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
};

/**
 * [GOD MODE LOGIC]
 * Lista sufiksa i prefiksa koji se generišu dinamički u kodu.
 * Ako je osnovni ključ prisutan, ove varijante se ne smatraju "bloat-om".
 */
const DYNAMIC_PATTERNS = [
    "_one",
    "_few",
    "_many", // Plurali
    "_prefix",
    "_hint",
    "_label",
    "_aria", // UI meta podaci
    "dir_",
    "ui_theme_",
    "tour_step", // Mape i nizovi
];

function getTranslationKeys(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf8");
    // Regex koji izvlači ključeve iz objekta (npr. btn_ok: "...")
    const matches = content.match(/^\s*([a-z0-9_]+):/gm);
    return matches ? matches.map((m) => m.replace(":", "").trim()) : [];
}

function getAllSourceFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== "node_modules" && file !== "locales") {
                getAllSourceFiles(filePath, fileList);
            }
        } else if (file.endsWith(".ts") || file.endsWith(".html") || file.endsWith(".tsx")) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

async function checkBloat() {
    console.log(`${C.cyan}🔍 I18N DEEP SCANNER: Detecting actual unused keys...${C.reset}`);

    const enKeys = getTranslationKeys(path.join(LOCALES_DIR, "en.ts"));
    const sourceFiles = getAllSourceFiles(SRC_DIR);

    // Učitaj sav kod u memoriju jednom radi brzine
    const combinedSource = sourceFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

    const unused = [];

    enKeys.forEach((key) => {
        // 1. Provera direktnog poklapanja (t('key_name'))
        if (combinedSource.includes(key)) return;

        // 2. Provera dinamičkih šablona (Koraci 1 i 2)
        // Ako je ključ npr. 'word_count_many', proveravamo da li se 'word_count' koristi
        let isDynamicMatch = false;
        for (const pattern of DYNAMIC_PATTERNS) {
            if (key.includes(pattern)) {
                const baseKey = key.split(pattern)[0];
                // Ako se koristi osnovni ključ (npr. word_count), smatramo da je i varijanta korišćena
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
        console.log(`${C.green}✅ PERFECT HYGIENE: All i18n keys are in use.${C.reset}`);
        process.exit(0);
    } else {
        console.log(
            `${C.yellow}⚠️  ACTUAL BLOAT WARNING: ${unused.length} keys are likely unused:${C.reset}`
        );
        unused.forEach((k) => console.log(`   - ${k}`));

        // [GOD MODE ADVICE]: Ne prekidamo build ovde jer i18n bloat nije fatalan,
        // ali ostavljamo žuto upozorenje.
        console.log(
            `\n${C.gray}Note: If these keys are used in ways the scanner cannot see, add them to DYNAMIC_PATTERNS in the script.${C.reset}`
        );
    }
}

checkBloat().catch((err) => {
    console.error(`${C.red}❌ Scanner Error: ${err.message}${C.reset}`);
    process.exit(1);
});
