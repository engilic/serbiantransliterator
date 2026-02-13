// scripts/checkTaskpaneHtmlI18n.cjs

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { C, color, ok, fail, scan } = require("./_ui.cjs");

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

// Regex za slova
const LETTER_RE = /[A-Za-zČĆĐŠŽčćđšž\u0400-\u052F]/;
// Regex za tehničke HTML entitete
const ENTITY_RE = /^(&[a-z0-9#]+;)+$/i;
// Regex za verzije
const VERSION_RE = /^v\d+\.\d+\.\d+$/;

// [MAX1] Reči koje su dozvoljene svuda i ne moraju biti u i18n rečniku
const WHITELIST = new Set([
    "Serbian Transliterator",
    "Jugoslav Ilić",
    "iddj27510@gmail.com",
    "ASCII",
    "WASM",
    "DOCX",
    "GitHub",
    "Microsoft Word",
    "Offline-first",
    "© 2026",
    "Loading…",
    "Next",
    "Copy",
    "Back",
]);

function getAllHtmlFiles(dir, fileList = []) {
    const IGNORED_FOLDERS = ["static"]; // [MAX1] Ignorišemo landing stranice

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            // Ako je ime foldera na IGNORED listi, preskoči ga
            if (!IGNORED_FOLDERS.includes(file)) {
                getAllHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith(".html")) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

function posFromIndex(text, idx) {
    const before = text.slice(0, idx);
    const lines = before.split("\n");
    const line = lines.length;
    const col = (lines[lines.length - 1] || "").length + 1;
    return { line, col };
}

function checkFile(filePath) {
    let html = fs.readFileSync(filePath, "utf8");
    const relPath = path.relative(ROOT, filePath);
    const violations = [];

    // Čišćenje
    html = html.replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length));
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script[^>]*>/gi, (m) => " ".repeat(m.length));
    html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style[^>]*>/gi, (m) => " ".repeat(m.length));

    // RULE 1: Text Nodes
    const reText = />([^<]+)</g;
    let m;
    while ((m = reText.exec(html)) !== null) {
        const content = m[1];
        const trimmed = content.trim();

        if (!trimmed || !LETTER_RE.test(trimmed)) continue;
        if (ENTITY_RE.test(trimmed) || VERSION_RE.test(trimmed)) continue;
        if (trimmed.length <= 1) continue;

        // Provera whiteliste (da li neka od dozvoljenih fraza sadrži ovaj tekst)
        let isWhitelisted = false;
        for (const item of WHITELIST) {
            if (trimmed.includes(item)) {
                isWhitelisted = true;
                break;
            }
        }
        if (isWhitelisted) continue;

        const before = html.slice(0, m.index);
        const lastTagOpen = before.lastIndexOf("<");
        if (lastTagOpen !== -1 && before.slice(lastTagOpen).includes("data-i18n")) continue;

        const { line, col } = posFromIndex(html, m.index + 1);
        violations.push({
            file: relPath,
            rule: "Hardcoded Text",
            line,
            col,
            snippet: trimmed.substring(0, 60),
        });
    }

    // RULE 2: Attributes
    const reAttr = /\b(title|placeholder|aria-label)\s*=\s*"([^"]*)"/g;
    while ((m = reAttr.exec(html)) !== null) {
        const attrName = m[1];
        const attrVal = m[2] || "";

        if (!LETTER_RE.test(attrVal) || VERSION_RE.test(attrVal) || attrVal.length <= 1) continue;

        if (WHITELIST.has(attrVal)) continue;

        const startTag = html.lastIndexOf("<", m.index);
        const endTag = html.indexOf(">", m.index);
        if (startTag !== -1 && endTag !== -1) {
            const fullTag = html.slice(startTag, endTag);
            if (fullTag.includes("data-i18n-attr") && fullTag.includes(`${attrName}:`)) continue;
        }

        const { line, col } = posFromIndex(html, m.index);
        violations.push({ file: relPath, rule: `Hardcoded Attr (${attrName})`, line, col, snippet: attrVal });
    }

    return violations;
}

function main() {
    scan("🔍 MAX1 I18n SCAN: Checking all HTML files...");
    const files = getAllHtmlFiles(SRC_DIR);
    let allViolations = [];

    for (const f of files) {
        allViolations = allViolations.concat(checkFile(f));
    }

    if (allViolations.length === 0) {
        console.log(ok("OK") + ` All ${files.length} HTML files are clean.`);
        process.exit(0);
    }

    console.error(`\n${fail("FATAL")} HARDCODED STRINGS DETECTED!`);
    const grouped = {};
    allViolations.forEach((v) => {
        if (!grouped[v.file]) grouped[v.file] = [];
        grouped[v.file].push(v);
    });

    for (const [file, issues] of Object.entries(grouped)) {
        console.error(color(C.cyan, `📄 ${file}`));
        issues.forEach((v) => console.error(`   Line ${v.line}:${v.col} [${v.rule}] -> "${v.snippet}"`));
    }
    process.exit(1);
}
main();
