"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const FILE = path.join(ROOT, "src", "taskpane", "taskpane.html");

const LETTER_RE = /[A-Za-zČĆĐŠŽčćđšž\u0400-\u052F]/;

function posFromIndex(text, idx) {
    const before = text.slice(0, idx);
    const lines = before.split("\n");
    const line = lines.length;
    const col = (lines[lines.length - 1] || "").length + 1;
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

    // Strip template tags
    html = html.replace(/<%[\s\S]*?%>/g, "");

    // Strip title (special case)
    html = html.replace(/<title\s+[^>]*data-i18n[^>]*>.*?<\/title>/gs, "");

    const violations = [];

    // 1) Visible text nodes: > ... <
    const reText = />[^<]*</g;
    let m;
    while ((m = reText.exec(html)) !== null) {
        const raw = m[0].slice(1, -1);
        const txt = raw.replace(/\s+/g, " ").trim();

        if (!txt) continue;
        if (!LETTER_RE.test(txt)) continue;

        // Context check: look at the tag opening before this text
        const before = html.slice(0, m.index);
        const lastTagOpenIndex = before.lastIndexOf("<");
        if (lastTagOpenIndex === -1) continue;

        const tagContent = before.slice(lastTagOpenIndex);

        // [FIX] Ignore if tag has data-i18n attribute
        if (tagContent.includes("data-i18n=")) continue;
        if (tagContent.includes("data-i18n ")) continue; // data-i18n without value (boolean style, though rare here)

        // Ignore style/script
        if (tagContent.startsWith("<style")) continue;
        if (tagContent.startsWith("<script")) continue;

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

    // 2) Attributes
    const reAttr = /\b(title|placeholder|aria-label)\s*=\s*"([^"]*)"/g;
    while ((m = reAttr.exec(html)) !== null) {
        const attrName = m[1];
        const attrVal = m[2] || "";
        if (!LETTER_RE.test(attrVal)) continue;

        // Check if data-i18n-attr handles this attribute
        // Simple heuristic: check if data-i18n-attr exists in the vicinity (same tag)
        // We look backwards for < and forwards for >
        const idx = m.index;

        // Scan backwards to find start of tag
        let startTag = html.lastIndexOf("<", idx);
        // Scan forwards to find end of tag
        let endTag = html.indexOf(">", idx);

        if (startTag !== -1 && endTag !== -1) {
            const fullTag = html.slice(startTag, endTag);
            // If data-i18n-attr contains the attribute name (e.g. title:KEY)
            if (fullTag.includes(`data-i18n-attr`) && fullTag.includes(`${attrName}:`)) {
                continue;
            }
        }

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

    process.exit(1);
}

main();
