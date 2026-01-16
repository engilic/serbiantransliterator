"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

function isDir(p) {
    try {
        return fs.statSync(p).isDirectory();
    } catch {
        return false;
    }
}

function walk(dir) {
    /** @type {string[]} */
    const out = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const e of entries) {
        const full = path.join(dir, e.name);

        if (e.isDirectory()) {
            if (e.name === "node_modules" || e.name === "dist" || e.name === "coverage") continue;
            out.push(...walk(full));
            continue;
        }

        if (!e.isFile()) continue;
        if (!e.name.endsWith(".ts")) continue;
        if (e.name.endsWith(".d.ts")) continue;

        out.push(full);
    }

    return out;
}

function posFromIndex(text, idx) {
    const before = text.slice(0, idx);
    const lines = before.split("\n");
    const line = lines.length; // 1-based
    const col = (lines[lines.length - 1] || "").length + 1; // 1-based
    return { line, col };
}

function snippetAt(text, idx, maxLen = 120) {
    const s = text.slice(idx, Math.min(text.length, idx + maxLen));
    return s.replace(/\s+/g, " ").trim();
}

/**
 * Returns array of violations for a single file.
 * Each violation: { line, col, rule, snippet }
 */
function checkFile(filePath) {
    const rel = path.relative(ROOT, filePath);
    const text = fs.readFileSync(filePath, "utf8");

    /** @type {Array<{file:string,line:number,col:number,rule:string,snippet:string}>} */
    const violations = [];

    // Rule 1: setStatus(...) first arg must NOT be a string literal.
    const reSetStatus = /\bsetStatus\s*\(\s*([`'"])/g;
    let m;
    while ((m = reSetStatus.exec(text)) !== null) {
        const idx = m.index;
        const { line, col } = posFromIndex(text, idx);

        violations.push({
            file: rel,
            line,
            col,
            rule: "setStatus-hardcoded-string",
            snippet: snippetAt(text, idx),
        });

        if (reSetStatus.lastIndex === idx) reSetStatus.lastIndex++;
    }

    // Rule 2: showModalInfo(...) first arg must NOT be a string literal.
    const reShowModalInfo = /\bshowModalInfo\s*\(\s*([`'"])/g;
    while ((m = reShowModalInfo.exec(text)) !== null) {
        const idx = m.index;
        const { line, col } = posFromIndex(text, idx);

        violations.push({
            file: rel,
            line,
            col,
            rule: "showModalInfo-hardcoded-string",
            snippet: snippetAt(text, idx),
        });

        if (reShowModalInfo.lastIndex === idx) reShowModalInfo.lastIndex++;
    }

    return violations;
}

function main() {
    if (!isDir(SRC_DIR)) {
        console.error("ERROR: src directory not found:", SRC_DIR);
        process.exit(2);
    }

    const files = walk(SRC_DIR);

    /** @type {Array<{file:string,line:number,col:number,rule:string,snippet:string}>} */
    const all = [];
    for (const f of files) {
        all.push(...checkFile(f));
    }

    if (all.length === 0) {
        process.exit(0);
    }

    console.error('ERROR: Hardcoded user-facing strings detected. Use i18n: t("...") instead.\n');
    for (const v of all) {
        console.error(`${v.file}:${v.line}:${v.col}  ${v.rule}\n  ${v.snippet}\n`);
    }

    process.exit(1);
}

main();
