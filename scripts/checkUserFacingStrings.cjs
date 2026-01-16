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

function snippetAt(text, idx, maxLen = 140) {
    const s = text.slice(idx, Math.min(text.length, idx + maxLen));
    return s.replace(/\s+/g, " ").trim();
}

/**
 * Returns array of violations for a single file.
 * Each violation: { file, line, col, rule, snippet }
 */
function checkFile(filePath) {
    const rel = path.relative(ROOT, filePath);
    const text = fs.readFileSync(filePath, "utf8");

    /** @type {Array<{file:string,line:number,col:number,rule:string,snippet:string}>} */
    const violations = [];

    // Rule 1: setStatus(...) first arg must NOT be a string literal.
    // Disallowed:
    //   setStatus("...", ...)
    //   setStatus('...', ...)
    //   setStatus(`...`, ...)
    // Allowed:
    //   setStatus(t("..."), ...)
    //   setStatus(msgVar, ...)
    const reSetStatusHardcoded = /\bsetStatus\s*\(\s*([`'"])/g;

    let m;
    while ((m = reSetStatusHardcoded.exec(text)) !== null) {
        const idx = m.index;
        const { line, col } = posFromIndex(text, idx);

        violations.push({
            file: rel,
            line,
            col,
            rule: "setStatus-hardcoded-string",
            snippet: snippetAt(text, idx),
        });

        if (reSetStatusHardcoded.lastIndex === idx) reSetStatusHardcoded.lastIndex++;
    }

    // Rule 2: showModalInfo(...) first arg must NOT be a string literal.
    // Disallowed:
    //   showModalInfo("Greška", ...)
    // Allowed:
    //   showModalInfo(t("modal_title_error"), ...)
    const reShowModalInfoHardcoded = /\bshowModalInfo\s*\(\s*([`'"])/g;

    while ((m = reShowModalInfoHardcoded.exec(text)) !== null) {
        const idx = m.index;
        const { line, col } = posFromIndex(text, idx);

        violations.push({
            file: rel,
            line,
            col,
            rule: "showModalInfo-hardcoded-string",
            snippet: snippetAt(text, idx),
        });

        if (reShowModalInfoHardcoded.lastIndex === idx) reShowModalInfoHardcoded.lastIndex++;
    }

    // Rule 3 (NEW): t("status_error_prefix", <arg>) must NOT use a string literal as the 2nd arg.
    // Disallowed:
    //   t("status_error_prefix", "Dokument prevelik")
    //   t("status_error_prefix", `...`)
    // Allowed:
    //   t("status_error_prefix", t("status_doc_too_large_short"))
    //   t("status_error_prefix", someVar)
    //   t("status_error_prefix", err.message)
    const reStatusErrorPrefixHardcodedArg = /\bt\s*\(\s*["']status_error_prefix["']\s*,\s*([`'"])/g;

    while ((m = reStatusErrorPrefixHardcodedArg.exec(text)) !== null) {
        const idx = m.index;
        const { line, col } = posFromIndex(text, idx);

        violations.push({
            file: rel,
            line,
            col,
            rule: "t(status_error_prefix)-hardcoded-arg",
            snippet: snippetAt(text, idx),
        });

        if (reStatusErrorPrefixHardcodedArg.lastIndex === idx) reStatusErrorPrefixHardcodedArg.lastIndex++;
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

    console.error(
        "ERROR: Hardcoded user-facing strings detected.\n" +
            '- Use i18n: t("...") for user-visible text\n' +
            '- Do not pass string literals into t("status_error_prefix", ...)\n'
    );

    for (const v of all) {
        console.error(`${v.file}:${v.line}:${v.col}  ${v.rule}\n  ${v.snippet}\n`);
    }

    process.exit(1);
}

main();
