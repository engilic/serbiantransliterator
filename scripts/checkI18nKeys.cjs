// scripts/checkI18nKeys.cjs
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

function loadKeys() {
    if (!fs.existsSync(LOCALE_FILE)) {
        console.error(`${C.red}❌ FATAL: Locale file missing at ${LOCALE_FILE}${C.reset}`);
        process.exit(1);
    }
    const content = fs.readFileSync(LOCALE_FILE, "utf8");
    const keys = new Set();
    const re = /^\s*["']?([a-zA-Z0-9_]+)["']?\s*:/gm;
    let m;
    while ((m = re.exec(content)) !== null) {
        keys.add(m[1]);
    }
    return keys;
}

function scanFiles(dir, definedKeys, usedKeysSet) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let missingErrors = 0;

    for (const f of files) {
        const fullPath = path.join(dir, f.name);

        if (f.isDirectory()) {
            if (["node_modules", "dist", "wasm-core", "coverage", ".git"].includes(f.name)) continue;
            missingErrors += scanFiles(fullPath, definedKeys, usedKeysSet);
            continue;
        }

        if (!f.name.endsWith(".ts") && !f.name.endsWith(".tsx") && !f.name.endsWith(".html")) continue;
        if (f.name === "sr.ts") continue;

        const content = fs.readFileSync(fullPath, "utf8");
        const relativeName = path.relative(process.cwd(), fullPath);

        const patterns = [/\bt\(\s*["']([a-zA-Z0-9_]+)["']\s*[,)]/g, /data-i18n=["']([a-zA-Z0-9_]+)["']/g];

        patterns.forEach((re) => {
            let m;
            while ((m = re.exec(content)) !== null) {
                const key = m[1];
                usedKeysSet.add(key);
                if (!definedKeys.has(key)) {
                    console.error(
                        `${C.red}❌ MISSING: '${C.bold}${key}${C.reset}${C.red}' used in ${C.gray}${relativeName}${C.reset}`
                    );
                    missingErrors++;
                }
            }
        });

        const reAttr = /data-i18n-attr=["']([^"']+)["']/g;
        let m;
        while ((m = reAttr.exec(content)) !== null) {
            const pairs = m[1].split(",");
            for (const p of pairs) {
                const parts = p.trim().split(":");
                if (parts.length === 2) {
                    const key = parts[1].trim();
                    usedKeysSet.add(key);
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

    const definedKeys = loadKeys();
    console.log(`${C.gray}   Loaded ${definedKeys.size} translation keys from sr.ts${C.reset}`);

    const usedKeysSet = new Set();
    const missingCount = scanFiles(SRC_DIR, definedKeys, usedKeysSet);

    const unusedKeys = [...definedKeys].filter((k) => !usedKeysSet.has(k));

    console.log(`${C.gray}---------------------------------------------------${C.reset}`);

    if (missingCount > 0) {
        console.error(
            `\n${C.red}${C.bold}🚨 CRITICAL: Found ${missingCount} MISSING translation keys!${C.reset}`
        );
    } else {
        console.log(`${C.green}✅ Integrity OK: All used keys exist.${C.reset}`);
    }

    if (unusedKeys.length > 0) {
        // [IZMENA] Povećan limit na 100 da vidiš sve
        const SHOW_LIMIT = 100;
        console.warn(
            `\n${C.yellow}${C.bold}⚠️  BLOAT WARNING: ${unusedKeys.length} keys are defined but NEVER used:${C.reset}`
        );

        unusedKeys.slice(0, SHOW_LIMIT).forEach((k) => console.warn(`   ${C.yellow}- ${k}${C.reset}`));

        if (unusedKeys.length > SHOW_LIMIT) {
            console.warn(`   ${C.gray}...and ${unusedKeys.length - SHOW_LIMIT} more.${C.reset}`);
        }
        console.warn(`\n${C.gray}👉 Safe to delete from src/shared/locales/sr.ts${C.reset}`);
    } else {
        console.log(`${C.green}✨ Clean: No unused keys found.${C.reset}`);
    }

    if (missingCount > 0) process.exit(1);
    process.exit(0);
}

main();
