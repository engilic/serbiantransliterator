#!/usr/bin/env node
"use strict";

const fs = require("fs");

function arg(name) {
    const i = process.argv.indexOf(name);
    return i >= 0 ? process.argv[i + 1] : null;
}

const inFile = arg("--in");
const outFile = arg("--out") || inFile;

if (!inFile) {
    console.error("Usage: node scripts/filter-codeql-sarif.cjs --in <file.sarif> [--out <file.sarif>]");
    process.exit(2);
}

const sarif = JSON.parse(fs.readFileSync(inFile, "utf8"));

// remove only these two CodeQL findings...
const ruleIds = new Set(["js/xss", "js/xml-bomb"]);
// ...and only when they point at this file
const targetFileRe = /src[\\/]+shared[\\/]+ooxml[\\/]+xmlParser\.ts$/;

function touchesTarget(res) {
    for (const loc of res?.locations || []) {
        const uri = loc?.physicalLocation?.artifactLocation?.uri;
        if (typeof uri === "string" && targetFileRe.test(uri)) return true;
    }
    return false;
}

let removed = 0;

for (const run of sarif.runs || []) {
    if (!Array.isArray(run.results)) continue;

    run.results = run.results.filter((res) => {
        if (!ruleIds.has(res?.ruleId)) return true;
        if (!touchesTarget(res)) return true;
        removed++;
        return false;
    });
}

console.log(`[sarif-filter] removed=${removed}`);
fs.writeFileSync(outFile, JSON.stringify(sarif, null, 2), "utf8");
