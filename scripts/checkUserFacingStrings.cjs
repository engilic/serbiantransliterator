// scripts/checkUserFacingStrings.cjs

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { C, color, ok, fail, scan } = require("./_ui.cjs");

// --- CONFIG ---
const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

// --- RULES DEFINITION ---
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

function snippetAt(text, idx, maxLen = 80) {
    const s = text.slice(idx, Math.min(text.length, idx + maxLen));
    return s.replace(/\s+/g, " ").trim() + "...";
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const relative = path.relative(ROOT, filePath);
    const violations = [];

    for (const rule of RULES) {
        let m;
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
    }

    return violations;
}

function main() {
    scan("🔍 Scanning source code for hardcoded user-facing strings...");

    if (!isDir(SRC_DIR)) {
        console.error(color(C.red, `✖ ERROR: src directory not found at ${SRC_DIR}`));
        process.exit(2);
    }

    const files = walk(SRC_DIR);
    const allViolations = [];

    for (const f of files) {
        allViolations.push(...checkFile(f));
    }

    if (allViolations.length === 0) {
        console.log(`${ok("OK")} No hardcoded user strings found in Logic/UI calls.`);
        process.exit(0);
    }

    console.error(`\n${fail("FATAL")} HARDCODED USER STRINGS DETECTED!`);
    console.error(
        color(C.yellow, "The following strings are not translatable and will appear hardcoded to users:") +
            "\n"
    );

    const grouped = {};
    allViolations.forEach((v) => {
        if (!grouped[v.file]) grouped[v.file] = [];
        grouped[v.file].push(v);
    });

    for (const file of Object.keys(grouped)) {
        console.error(color(C.bold, `📄 ${file}`));
        for (const v of grouped[file]) {
            console.error(`   ${color(C.gray, `Line ${v.line}:${v.col}`)}  ${color(C.red, `[${v.ruleId}]`)}`);
            console.error(`     Snippet: ${color(C.yellow, v.snippet)}`);
            console.error(`     Fix:     ${v.msg}\n`);
        }
    }

    process.exit(1);
}

main();
