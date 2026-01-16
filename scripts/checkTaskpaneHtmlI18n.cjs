// scripts/checkTaskpaneHtmlI18n.cjs
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const FILE = path.join(ROOT, "src", "taskpane", "taskpane.html");

// Letters: Latin (incl SR) + Cyrillic.
// If we find these inside visible HTML text / common attributes, we treat it as hardcoded UI string.
const LETTER_RE = /[A-Za-zČĆĐŠŽčćđšž\u0400-\u052F]/;

function posFromIndex(text, idx) {
    const before = text.slice(0, idx);
    const lines = before.split("\n");
    const line = lines.length; // 1-based
    const col = (lines[lines.length - 1] || "").length + 1; // 1-based
    return { line, col };
}

function snippetAt(text, idx, maxLen = 160) {
    const s = text.slice(idx, Math.min(text.length, idx + maxLen));
    return s.replace(/\s+/g, " ").trim();
}

function main() {
    if (!fs.existsSync(FILE)) {
        console.error("ERROR: taskpane.html not found:", FILE);
        process.exit(2);
    }

    let html = fs.readFileSync(FILE, "utf8");

    // Strip HtmlWebpackPlugin template tags (<%= ... %>) to avoid false positives.
    html = html.replace(/<%[\s\S]*?%>/g, "");

    const violations = [];

    // 1) Visible text nodes: > ... <
    // If content contains letters => likely user-facing => should be replaced with data-i18n.
    const reText = />[^<]*</g;
    let m;
    while ((m = reText.exec(html)) !== null) {
        const raw = m[0].slice(1, -1); // inside >...<
        const txt = raw.replace(/\s+/g, " ").trim();

        if (!txt) continue;
        if (!LETTER_RE.test(txt)) continue;

        const idx = m.index;
        const { line, col } = posFromIndex(html, idx);

        violations.push({
            rule: "hardcoded-visible-text",
            line,
            col,
            snippet: snippetAt(html, idx),
        });

        if (reText.lastIndex === idx) reText.lastIndex++;
    }

    // 2) Common user-facing attributes: title, placeholder, aria-label
    // Note: this catches e.g. title="Prikaži..." which should become data-i18n-attr="title:key"
    const reAttr = /\b(title|placeholder|aria-label)\s*=\s*"([^"]*)"/g;
    while ((m = reAttr.exec(html)) !== null) {
        const attrVal = m[2] || "";
        if (!LETTER_RE.test(attrVal)) continue;

        const idx = m.index;
        const { line, col } = posFromIndex(html, idx);

        violations.push({
            rule: "hardcoded-attr-text",
            line,
            col,
            snippet: snippetAt(html, idx),
        });

        if (reAttr.lastIndex === idx) reAttr.lastIndex++;
    }

    if (violations.length === 0) {
        process.exit(0);
    }

    console.error(
        "ERROR: Hardcoded user-facing strings detected in src/taskpane/taskpane.html.\n" +
        "- Use data-i18n for element text.\n" +
        '- Use data-i18n-attr="title:KEY,placeholder:KEY,aria-label:KEY" for attributes.\n'
    );

    for (const v of violations.slice(0, 60)) {
        console.error(`taskpane.html:${v.line}:${v.col}  ${v.rule}\n  ${v.snippet}\n`);
    }

    if (violations.length > 60) {
        console.error(`(and ${violations.length - 60} more...)`);
    }

    process.exit(1);
}

main();
