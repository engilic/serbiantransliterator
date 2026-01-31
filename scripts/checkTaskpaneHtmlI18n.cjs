// scripts/checkTaskpaneHtmlI18n.cjs
"use strict";

const fs = require("node:fs");
const path = require("node:path");

// --- CONFIG ---
const ROOT = process.cwd();
const FILE = path.join(ROOT, "src", "taskpane", "taskpane.html");

// Regex za slova (Latinica + Ćirilica)
const LETTER_RE = /[A-Za-zČĆĐŠŽčćđšž\u0400-\u052F]/;

// --- ANSI COLORS (TTY/NO_COLOR aware) ---
const C = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
};

const COLOR_ENABLED = !!process.stdout.isTTY && !process.env.NO_COLOR;
function c(code, text) {
    return COLOR_ENABLED ? `${code}${text}${C.reset}` : text;
}

function ok(text) {
    return c(C.green, `✔ ${text}`);
}

function fail(text) {
    return c(C.red, `✖ ${text}`);
}

function posFromIndex(text, idx) {
    const before = text.slice(0, idx);
    const lines = before.split("\n");
    const line = lines.length;
    const col = (lines[lines.length - 1] || "").length + 1;
    return { line, col };
}

function snippetAt(text, idx, maxLen = 80) {
    const start = Math.max(0, idx - 10);
    const end = Math.min(text.length, idx + maxLen);
    const s = text.slice(start, end);
    return s.replace(/\n/g, "↵").trim();
}

function main() {
    console.log(c(C.blue, "🔍 Scanning taskpane.html for hardcoded strings..."));

    if (!fs.existsSync(FILE)) {
        console.error(c(C.red, `✖ ERROR: taskpane.html not found at ${FILE}`));
        process.exit(2);
    }

    let html = fs.readFileSync(FILE, "utf8");

    // --- PRE-PROCESSING (Cleaning) ---
    // Using .repeat(m.length) to preserve line numbers/positions

    // 1) Remove Comments <!-- ... -->
    html = html.replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length));

    // 2) Remove Scripts <script>...</script>
    // [FIX] CodeQL Compliant: Catch malformed closing tags like </script foo>
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script[^>]*>/gi, (m) => " ".repeat(m.length));

    // 3) Remove Styles <style>...</style>
    // [FIX] CodeQL Compliant
    html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style[^>]*>/gi, (m) => " ".repeat(m.length));

    // 4) Remove EJS/Template tags <% ... %>
    html = html.replace(/<%[\s\S]*?%>/g, (m) => " ".repeat(m.length));

    const violations = [];

    // --- RULE 1: Visible text nodes (> TEXT <) ---
    const reText = />([^<]+)</g;
    let m;

    while ((m = reText.exec(html)) !== null) {
        const content = m[1];
        const trimmed = content.replace(/\s+/g, " ").trim();

        if (!trimmed) continue;
        if (!LETTER_RE.test(trimmed)) continue;

        // Context Check
        const before = html.slice(0, m.index);
        const lastTagOpen = before.lastIndexOf("<");
        if (lastTagOpen === -1) continue;

        const tagStr = before.slice(lastTagOpen); // e.g. <div id="app" data-i18n="key">

        // Ignore if tag has data-i18n
        if (tagStr.includes("data-i18n")) continue;

        const idx = m.index + 1;
        const { line, col } = posFromIndex(html, idx);

        violations.push({
            rule: "Hardcoded Text",
            line,
            col,
            snippet: trimmed.substring(0, 50) + (trimmed.length > 50 ? "..." : ""),
            fullSnippet: snippetAt(html, idx),
        });
    }

    // --- RULE 2: Attributes (title, placeholder, aria-label) ---
    const reAttr = /\b(title|placeholder|aria-label)\s*=\s*"([^"]*)"/g;

    while ((m = reAttr.exec(html)) !== null) {
        const attrName = m[1];
        const attrVal = m[2] || "";

        if (!LETTER_RE.test(attrVal)) continue;

        const idx = m.index;

        const startTag = html.lastIndexOf("<", idx);
        const endTag = html.indexOf(">", idx);

        if (startTag !== -1 && endTag !== -1) {
            const fullTag = html.slice(startTag, endTag);
            if (fullTag.includes("data-i18n-attr") && fullTag.includes(`${attrName}:`)) {
                continue;
            }
        }

        const { line, col } = posFromIndex(html, idx);

        violations.push({
            rule: `Hardcoded Attribute (${attrName})`,
            line,
            col,
            snippet: `${attrName}="${attrVal}"`,
            fullSnippet: snippetAt(html, idx),
        });
    }

    // --- REPORTING ---
    if (violations.length === 0) {
        console.log(ok("OK") + " HTML is clean (No hardcoded strings detected).");
        process.exit(0);
    }

    console.error(`\n${fail("FATAL")} HARDCODED STRINGS DETECTED IN HTML!`);
    console.error(c(C.yellow, "Please verify and use data-i18n for these:") + "\n");

    for (const v of violations.slice(0, 50)) {
        console.error(`  📄 ${c(C.bold, `Line ${v.line}:${v.col}`)}  ${c(C.red, `[${v.rule}]`)}`);
        console.error(`     ${c(C.gray, v.snippet)}\n`);
    }

    if (violations.length > 50) {
        console.error(c(C.yellow, `...and ${violations.length - 50} more errors.`));
    }

    process.exit(1);
}

main();
