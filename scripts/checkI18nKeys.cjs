// scripts/checkI18nKeys.cjs
"use strict";

const fs = require("fs");
const path = require("path");

// --- CONFIG ---
const ROOT = process.cwd();
const LOCALE_FILE = path.join(ROOT, "src/shared/locales/sr.ts");
const SRC_DIR = path.join(ROOT, "src");

// --- ANSI COLORS (TTY/NO_COLOR aware) ---
const C = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m",
    bold: "\x1b[1m",
    blue: "\x1b[34m",
};

const COLOR_ENABLED = !!process.stdout.isTTY && !process.env.NO_COLOR;
function c(code, text) {
    return COLOR_ENABLED ? `${code}${text}${C.reset}` : text;
}

function ok(text) {
    return c(C.green, `✔ ${text}`);
}

function warn(text) {
    return c(C.yellow, `⚠ ${text}`);
}

function fail(text) {
    return c(C.red, `✖ ${text}`);
}

function loadKeys() {
    if (!fs.existsSync(LOCALE_FILE)) {
        console.error(c(C.red, `✖ FATAL: Locale file missing at ${LOCALE_FILE}`));
        process.exit(1);
    }

    const content = fs.readFileSync(LOCALE_FILE, "utf8");
    const keys = new Set();

    // hvata: key: "..." / '...' / `...` / bez navodnika
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
        const relativeName = path.relative(ROOT, fullPath);

        const patterns = [/\bt\(\s*<!--citation:1-->["']\s*[,)]/g, /data-i18n=<!--citation:1-->["']/g];

        for (const re of patterns) {
            let m;
            while ((m = re.exec(content)) !== null) {
                const key = m[1];
                usedKeysSet.add(key);

                if (!definedKeys.has(key)) {
                    console.error(
                        `${c(C.red, "✖ MISSING:")} '${c(C.bold, key)}' ` +
                            `used in ${c(C.gray, relativeName)}`
                    );
                    missingErrors++;
                }
            }
        }

        const reAttr = /data-i18n-attr=<!--citation:2-->["']/g;
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
                            `${c(C.red, "✖ MISSING:")} '${c(C.bold, key)}' ` +
                                `used in ${c(C.gray, relativeName)}`
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
    console.log(c(C.blue + C.bold, "🌍 I18n Integrity Check..."));

    const definedKeys = loadKeys();
    console.log(c(C.gray, `   Loaded ${definedKeys.size} translation keys from sr.ts`));

    const usedKeysSet = new Set();
    const missingCount = scanFiles(SRC_DIR, definedKeys, usedKeysSet);

    const unusedKeys = [...definedKeys].filter((k) => !usedKeysSet.has(k));

    console.log(c(C.gray, "---------------------------------------------------"));

    if (missingCount > 0) {
        console.error(`\n${fail("CRITICAL:")} Found ${missingCount} MISSING translation keys!`);
    } else {
        console.log(`${ok("Integrity OK:")} All used keys exist.`);
    }

    if (unusedKeys.length > 0) {
        const SHOW_LIMIT = 100;
        console.warn(`\n${warn("BLOAT WARNING:")} ${unusedKeys.length} keys are defined but NEVER used:`);

        unusedKeys.slice(0, SHOW_LIMIT).forEach((k) => console.warn(`   ${c(C.yellow, "-")} ${k}`));

        if (unusedKeys.length > SHOW_LIMIT) {
            console.warn(c(C.gray, `   ...and ${unusedKeys.length - SHOW_LIMIT} more.`));
        }

        console.warn(`\n${c(C.gray, "👉 Safe to delete from src/shared/locales/sr.ts")}`);
    } else {
        console.log(`${ok("Clean:")} No unused keys found.`);
    }

    if (missingCount > 0) process.exit(1);
    process.exit(0);
}

main();
