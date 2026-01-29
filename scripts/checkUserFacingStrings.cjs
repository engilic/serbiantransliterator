// scripts/checkUserFacingStrings.cjs
"use strict";

const fs = require("node:fs");
const path = require("node:path");

// --- CONFIG ---
const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

// --- ANSI COLORS ---
const C = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
};

// --- RULES DEFINITION ---
// Ovde definišemo šta je zabranjeno.
const RULES = [
    {
        id: "setStatus-hardcoded",
        // Hvata: setStatus("..." ili setStatus('...' ili setStatus(`...`
        regex: /\bsetStatus\s*\(\s*([`'"])/g,
        message: "setStatus() expects a variable or t('key'), not a hardcoded string.",
    },
    {
        id: "showModalInfo-hardcoded",
        // Hvata: showModalInfo("..."
        regex: /\bshowModalInfo\s*\(\s*([`'"])/g,
        message: "showModalInfo() title must be translated via t('key').",
    },
    {
        id: "t-error-prefix-hardcoded",
        // Hvata: t("status_error_prefix", "..."
        regex: /\bt\s*\(\s*["']status_error_prefix["']\s*,\s*([`'"])/g,
        message: "Do not pass hardcoded strings to status_error_prefix. Use t('key') or variables.",
    },
];

// --- HELPERS ---

function isDir(p) {
    try {
        return fs.statSync(p).isDirectory();
    } catch {
        return false;
    }
}

function walk(dir) {
    const results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const full = path.join(dir, file);
        if (isDir(full)) {
            // Ignorišemo sistemske foldere
            if (!["node_modules", "dist", "coverage", ".git", "wasm-core"].includes(file)) {
                results.push(...walk(full));
            }
        } else {
            // Skeniramo samo TypeScript fajlove (ignorišemo definicije .d.ts)
            if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
                results.push(full);
            }
        }
    });
    return results;
}

function posFromIndex(text, idx) {
    const before = text.slice(0, idx);
    const lines = before.split("\n");
    const line = lines.length;
    const col = (lines[lines.length - 1] || "").length + 1;
    return { line, col };
}

function snippetAt(text, idx, maxLen = 60) {
    const s = text.slice(idx, Math.min(text.length, idx + maxLen));
    return s.replace(/\s+/g, " ").trim() + "...";
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const relative = path.relative(ROOT, filePath);
    const violations = [];

    RULES.forEach((rule) => {
        let m;
        // Reset regex state (bitno kada se koristi global flag u petlji)
        rule.regex.lastIndex = 0;

        while ((m = rule.regex.exec(content)) !== null) {
            const idx = m.index;
            const { line, col } = posFromIndex(content, idx);

            violations.push({
                file: relative,
                line,
                col,
                ruleId: rule.id,
                msg: rule.message,
                snippet: snippetAt(content, idx),
            });
        }
    });

    return violations;
}

function main() {
    console.log(`${C.blue}🔍 Scanning source code for hardcoded user-facing strings...${C.reset}`);

    if (!isDir(SRC_DIR)) {
        console.error(`${C.red}ERROR: src directory not found at ${SRC_DIR}${C.reset}`);
        process.exit(2);
    }

    const files = walk(SRC_DIR);
    const allViolations = [];

    for (const f of files) {
        allViolations.push(...checkFile(f));
    }

    if (allViolations.length === 0) {
        console.log(`${C.green}✅ No hardcoded user strings found in Logic/UI calls.${C.reset}`);
        process.exit(0);
    }

    console.error(`\n${C.red}${C.bold}🚨 HARDCODED USER STRINGS DETECTED!${C.reset}`);
    console.error(
        `${C.yellow}The following strings are not translatable and will appear hardcoded to users:${C.reset}\n`
    );

    // Group by file for cleaner output
    const grouped = {};
    allViolations.forEach((v) => {
        if (!grouped[v.file]) grouped[v.file] = [];
        grouped[v.file].push(v);
    });

    Object.keys(grouped).forEach((file) => {
        console.error(`${C.bold}📄 ${file}${C.reset}`);
        grouped[file].forEach((v) => {
            console.error(`   ${C.gray}Line ${v.line}:${v.col}${C.reset}  ${C.red}[${v.ruleId}]${C.reset}`);
            console.error(`     Snippet: ${C.yellow}${v.snippet}${C.reset}`);
            console.error(`     Fix:     ${v.msg}\n`);
        });
    });

    process.exit(1);
}

main();
