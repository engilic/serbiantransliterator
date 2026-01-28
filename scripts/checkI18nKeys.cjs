"use strict";

const fs = require("fs");
const path = require("path");

// --- CONFIG ---
const LOCALE_FILE = path.join(process.cwd(), "src/shared/locales/sr.ts");
const SRC_DIR = path.join(process.cwd(), "src");

// --- ANSI COLORS ---
const C = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m",
    bold: "\x1b[1m",
    blue: "\x1b[34m",
};

// 1. Učitavanje definisanih ključeva iz sr.ts
function loadKeys() {
    if (!fs.existsSync(LOCALE_FILE)) {
        console.error(`${C.red}❌ FATAL: Locale file missing at ${LOCALE_FILE}${C.reset}`);
        process.exit(1);
    }
    const content = fs.readFileSync(LOCALE_FILE, "utf8");
    const keys = new Set();

    // Regex hvata:  key:  ili  "key":  ili  'key':
    const re = /^\s*["']?([a-zA-Z0-9_]+)["']?\s*:/gm;

    let m;
    while ((m = re.exec(content)) !== null) {
        keys.add(m[1]);
    }
    return keys;
}

// 2. Skeniranje fajlova za korišćenim ključevima
function scanFiles(dir, definedKeys, usedKeysSet) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let missingErrors = 0;

    for (const f of files) {
        const fullPath = path.join(dir, f.name);

        // Ignorisanje foldera
        if (f.isDirectory()) {
            if (["node_modules", "dist", "wasm-core", "coverage", ".git"].includes(f.name)) continue;
            missingErrors += scanFiles(fullPath, definedKeys, usedKeysSet);
            continue;
        }

        // Samo .ts, .tsx, .html
        if (!f.name.endsWith(".ts") && !f.name.endsWith(".tsx") && !f.name.endsWith(".html")) continue;

        // Ne skeniraj sam definicijski fajl da ne bi prijavio samog sebe
        if (f.name === "sr.ts") continue;

        const content = fs.readFileSync(fullPath, "utf8");
        const relativeName = path.relative(process.cwd(), fullPath);

        // --- PATTERNS ---
        const patterns = [
            // t("key") ili t('key')
            /\bt\(\s*["']([a-zA-Z0-9_]+)["']\s*[,)]/g,
            // data-i18n="key"
            /data-i18n=["']([a-zA-Z0-9_]+)["']/g,
        ];

        // Provera standardnih paterna
        patterns.forEach((re) => {
            let m;
            while ((m = re.exec(content)) !== null) {
                const key = m[1];
                usedKeysSet.add(key); // Beležimo da je korišćen

                if (!definedKeys.has(key)) {
                    console.error(
                        `${C.red}❌ MISSING: '${C.bold}${key}${C.reset}${C.red}' used in ${C.gray}${relativeName}${C.reset}`
                    );
                    missingErrors++;
                }
            }
        });

        // Provera kompleksnog atributa: data-i18n-attr="title:KEY,alt:KEY2"
        const reAttr = /data-i18n-attr=["']([^"']+)["']/g;
        let m;
        while ((m = reAttr.exec(content)) !== null) {
            const pairs = m[1].split(",");
            for (const p of pairs) {
                const parts = p.trim().split(":");
                if (parts.length === 2) {
                    const key = parts[1].trim();
                    usedKeysSet.add(key); // Beležimo da je korišćen

                    if (!definedKeys.has(key)) {
                        console.error(
                            `${C.red}❌ MISSING: '${C.bold}${key}${C.reset}${C.red}' used in ${C.gray}${relativeName}${C.reset}`
                        );
                        missingErrors++;
                    }
                }
            }
        }
    }
    return missingErrors;
}

function main() {
    console.log(`${C.blue}${C.bold}🌍 I18n Integrity Check...${C.reset}`);

    // A. Učitaj definicije
    const definedKeys = loadKeys();
    console.log(`${C.gray}   Loaded ${definedKeys.size} translation keys from sr.ts${C.reset}`);

    // B. Skeniraj kod
    const usedKeysSet = new Set();
    const missingCount = scanFiles(SRC_DIR, definedKeys, usedKeysSet);

    // C. Provera viška (Bloat)
    // Filteruj definisane ključeve koji nisu u setu korišćenih
    const unusedKeys = [...definedKeys].filter((k) => !usedKeysSet.has(k));

    console.log(`${C.gray}---------------------------------------------------${C.reset}`);

    // --- REPORTING ---

    // 1. Critical Errors (Missing Keys)
    if (missingCount > 0) {
        console.error(
            `\n${C.red}${C.bold}🚨 CRITICAL: Found ${missingCount} MISSING translation keys!${C.reset}`
        );
        console.error(`${C.red}The app will crash or show empty strings for these.${C.reset}`);
    } else {
        console.log(`${C.green}✅ Integrity OK: All used keys exist in sr.ts.${C.reset}`);
    }

    // 2. Warnings (Unused Keys)
    if (unusedKeys.length > 0) {
        console.warn(
            `\n${C.yellow}${C.bold}⚠️  BLOAT WARNING: ${unusedKeys.length} keys are defined but NEVER used:${C.reset}`
        );
        // Prikazujemo prvih 15 da ne spamujemo terminal
        unusedKeys.slice(0, 15).forEach((k) => console.warn(`   ${C.yellow}- ${k}${C.reset}`));
        if (unusedKeys.length > 15)
            console.warn(`   ${C.gray}...and ${unusedKeys.length - 15} more.${C.reset}`);
        console.warn(`${C.gray}(You should delete these from sr.ts to save bytes)${C.reset}`);
    } else {
        console.log(`${C.green}✨ Clean: No unused keys found.${C.reset}`);
    }

    // Exit codes
    if (missingCount > 0) {
        process.exit(1); // Fail build only on missing keys
    } else {
        process.exit(0);
    }
}

main();
