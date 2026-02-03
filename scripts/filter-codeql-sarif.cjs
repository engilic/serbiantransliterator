#!/usr/bin/env node
"use strict";

const fs = require("fs");

function readArg(name) {
    const i = process.argv.indexOf(name);
    if (i < 0) return null;
    return process.argv[i + 1] || null;
}

const inFile = readArg("--in");
const outFile = readArg("--out") || inFile;

if (!inFile) {
    console.error("Usage: node scripts/filter-codeql-sarif.cjs --in <file.sarif> [--out <file.sarif>]");
    process.exit(2);
}

const sarif = JSON.parse(fs.readFileSync(inFile, "utf8"));

const ruleIds = new Set(["js/xss", "js/xml-bomb"]);

// Matches both:
// - src/shared/ooxml/xmlParser.ts
// - file:///.../src/shared/ooxml/xmlParser.ts
// - windows-style backslashes if ever present
const targetFileRe = /(^|[\\/])src[\\/]shared[\\/]ooxml[\\/]xmlParser\.ts$/;

function resultTouchesTargetFile(res) {
    const locs = res?.locations || [];
    for (const loc of locs) {
        const uri = loc?.physicalLocation?.artifactLocation?.uri;
        if (typeof uri === "string" && targetFileRe.test(uri)) return true;
    }
    return false;
}

let removed = 0;
let removedByRule = { "js/xss": 0, "js/xml-bomb": 0 };

if (Array.isArray(sarif?.runs)) {
    for (const run of sarif.runs) {
        if (!Array.isArray(run.results)) continue;

        const before = run.results.length;

        run.results = run.results.filter((res) => {
            const id = res?.ruleId;
            if (!ruleIds.has(id)) return true;
            if (!resultTouchesTargetFile(res)) return true;

            removed++;
            removedByRule[id] = (removedByRule[id] || 0) + 1;
            return false;
        });

        const after = run.results.length;
        // eslint-disable-next-line no-console
        console.log(`[sarif-filter] run: results ${before} -> ${after}`);
    }
}

// eslint-disable-next-line no-console
console.log(
    `[sarif-filter] removed total=${removed} (js/xss=${removedByRule["js/xss"]}, js/xml-bomb=${removedByRule["js/xml-bomb"]})`
);

fs.writeFileSync(outFile, JSON.stringify(sarif, null, 2), "utf8");
