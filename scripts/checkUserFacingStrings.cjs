// scripts/checkUserFacingStrings.cjs

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const C = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
};

const COLOR_ENABLED = !!process.stdout.isTTY && !process.env.NO_COLOR;
function c(code, text) {
    return COLOR_ENABLED ? `${code}${text}${C.reset}` : text;
}

function ok(text = "OK") {
    return c(C.green, `✔ ${text}`);
}

function fail(text = "FAIL") {
    return c(C.red, `✖ ${text}`);
}

const RULES = [
    {
        id: "setStatus-hardcoded",
        regex: /\bsetStatus\s*\(\s*([`'"])/g,
        message: "setStatus() expects a variable or t('key'), not a hardcoded string.",
    },
    {
        id: "showModalInfo-hardcoded",
        regex: /\bshowModalInfo\s*\(\s*([`'"])/g,
        message: "showModalInfo() title must be translated via t('key').",
    },
    {
        id: "t-error-prefix-hardcoded",
        regex: /\bt\s*\(\s*["']status_error_prefix["']\s*,\s*([`'"])/g,
        message: "Do not pass hardcoded strings to status_error_prefix. Use t('key') or variables.",
    },
];

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
    console.log(c(C.blue, "🔍 Scanning source code for hardcoded user-facing strings..."));

    if (!isDir(SRC_DIR)) {
        console.error(c(C.red, `✖ ERROR: src directory not found at ${SRC_DIR}`));
        process.exit(2);
    }

    const files = walk(SRC_DIR);
    const allViolations = [];
    for (const f of files) allViolations.push(...checkFile(f));

    if (allViolations.length === 0) {
        console.log(`${ok("OK")} No hardcoded user strings found in Logic/UI calls.`);
        process.exit(0);
    }

    console.error(`\n${fail("FATAL")} HARDCODED USER STRINGS DETECTED!`);
    console.error(
        c(C.yellow, "The following strings are not translatable and will appear hardcoded to users:") + "\n"
    );

    const grouped = {};
    allViolations.forEach((v) => {
        if (!grouped[v.file]) grouped[v.file] = [];
        grouped[v.file].push(v);
    });

    for (const file of Object.keys(grouped)) {
        console.error(c(C.bold, `📄 ${file}`));
        for (const v of grouped[file]) {
            console.error(`   ${c(C.gray, `Line ${v.line}:${v.col}`)}  ${c(C.red, `[${v.ruleId}]`)}`);
            console.error(`     Snippet: ${c(C.yellow, v.snippet)}`);
            console.error(`     Fix:     ${v.msg}\n`);
        }
    }

    process.exit(1);
}

main();
