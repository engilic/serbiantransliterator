"use strict";

const fs = require("fs");
const path = require("path");

const LOCALE_FILE = path.join(process.cwd(), "src/shared/locales/sr.ts");
const SRC_DIR = path.join(process.cwd(), "src");

function loadKeys() {
    if (!fs.existsSync(LOCALE_FILE)) {
        console.error("❌ sr.ts missing!");
        process.exit(1);
    }
    const content = fs.readFileSync(LOCALE_FILE, "utf8");
    const keys = new Set();
    const re = /^\s*([a-zA-Z0-9_]+):/gm;
    let m;
    while ((m = re.exec(content)) !== null) {
        keys.add(m[1]);
    }
    return keys;
}

function scanFiles(dir, keys) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let errors = 0;

    for (const f of files) {
        const fullPath = path.join(dir, f.name);

        if (f.isDirectory()) {
            if (f.name === "node_modules" || f.name === "dist" || f.name === "wasm-core") continue;
            errors += scanFiles(fullPath, keys);
            continue;
        }

        if (!f.name.endsWith(".ts") && !f.name.endsWith(".html")) continue;

        const content = fs.readFileSync(fullPath, "utf8");

        const reT = /\bt\(\s*["']([a-zA-Z0-9_]+)["']\s*[,)]/g;
        const reHtml = /data-i18n=["']([a-zA-Z0-9_]+)["']/g;
        const reAttr = /data-i18n-attr=["']([^"']+)["']/g;

        let m;
        while ((m = reT.exec(content)) !== null) {
            if (!keys.has(m[1])) {
                console.error(`❌ MISSING KEY: '${m[1]}' used in ${f.name}`);
                errors++;
            }
        }
        while ((m = reHtml.exec(content)) !== null) {
            if (!keys.has(m[1])) {
                console.error(`❌ MISSING KEY: '${m[1]}' used in ${f.name}`);
                errors++;
            }
        }
        while ((m = reAttr.exec(content)) !== null) {
            const pairs = m[1].split(",");
            for (const p of pairs) {
                const parts = p.trim().split(":");
                if (parts.length === 2) {
                    const k = parts[1].trim();
                    if (!keys.has(k)) {
                        console.error(`❌ MISSING KEY: '${k}' used in ${f.name}`);
                        errors++;
                    }
                }
            }
        }
    }
    return errors;
}

const keys = loadKeys();
console.log(`ℹ️  Loaded ${keys.size} translation keys.`);
const errs = scanFiles(SRC_DIR, keys);

if (errs > 0) {
    console.error(`\n🚨 Found ${errs} missing translation keys!`);
    process.exit(1);
} else {
    console.log("✅ All keys exist.");
    process.exit(0);
}
