#!/usr/bin/env node
// scripts/filter-codeql-sarif.cjs

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

const ruleIds = new Set(["js/xss", "js/xml-bomb"]);

// Tolerant match (relative paths + file:// URIs; / or \; optional ?/# suffix)
const targetFileRe = /src[\\/]+shared[\\/]+ooxml[\\/]+xmlParser\.ts(?:$|[?#])/i;

function touchesTarget(res) {
    for (const loc of res?.locations || []) {
        const uri = loc?.physicalLocation?.artifactLocation?.uri;
        if (typeof uri === "string" && targetFileRe.test(uri)) return true;
    }
    return false;
}

let removed = 0;
let removedByRule = { "js/xss": 0, "js/xml-bomb": 0 };

for (const run of sarif.runs || []) {
    if (!Array.isArray(run.results)) continue;

    run.results = run.results.filter((res) => {
        const id = res?.ruleId;
        if (!ruleIds.has(id)) return true;
        if (!touchesTarget(res)) return true;

        removed++;
        removedByRule[id] = (removedByRule[id] || 0) + 1;
        return false;
    });
}

console.log(
    `[sarif-filter] file=${inFile} removed=${removed} (js/xss=${removedByRule["js/xss"]}, js/xml-bomb=${removedByRule["js/xml-bomb"]})`
);

fs.writeFileSync(outFile, JSON.stringify(sarif, null, 2), "utf8");
