// scripts/update-manifest-version.js
"use strict";

const fs = require("fs");
const path = require("path");

// --- KONFIGURACIJA ---
const EXTENSION_NAME = "Serbian Transliterator";
const MANIFESTS = ["manifest.xml", "manifest.prod.xml"];

// --- ANSI BOJE (TTY/NO_COLOR aware) ---
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
    red: "\x1b[31m",
};

const COLOR_ENABLED = !!process.stdout.isTTY && !process.env.NO_COLOR;
function c(code, text) {
    return COLOR_ENABLED ? `${code}${text}${C.reset}` : text;
}

console.log(c(C.blue + C.bold, "🔄 MANIFEST SYNC UTILITY"));

// 1) Učitaj verziju iz package.json
const pkgPath = path.resolve(__dirname, "../package.json");
if (!fs.existsSync(pkgPath)) {
    console.error(c(C.red, "✖ ERROR: package.json not found!"));
    process.exit(1);
}

let pkg;
try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
} catch (e) {
    console.error(c(C.red, "✖ ERROR: Failed to parse package.json"));
    console.error(e?.message || e);
    process.exit(1);
}

const version = String(pkg.version || "").trim();
if (!version) {
    console.error(c(C.red, "✖ ERROR: package.json has no valid 'version' field."));
    process.exit(1);
}

// Office zahteva 4 cifre (1.0.0 -> 1.0.0.0)
const officeVersion = version.split(".").length === 3 ? `${version}.0` : version;
const displayName = `${EXTENSION_NAME} (v${version})`;

console.log(`   Target Version: ${c(C.yellow, version)}`);
console.log(`   Office Format:  ${c(C.yellow, officeVersion)}`);
console.log(`   Display Name:   ${c(C.yellow, displayName)}\n`);

// 2) Ažuriraj fajlove
let updatedCount = 0;

MANIFESTS.forEach((fname) => {
    const file = path.resolve(__dirname, "..", fname);
    if (!fs.existsSync(file)) {
        console.log(c(C.gray, `Skipped: ${fname} (Not found)`));
        return;
    }

    const before = fs.readFileSync(file, "utf8");
    let content = before;
    let changed = false;

    // A) Ažuriraj sistemsku <Version>
    // (global 'g' da bi zamenio sve pojave, ako ih ima više)
    const verRegex = /<Version>.*?<\/Version>/g;
    if (verRegex.test(content)) {
        const newVerTag = `<Version>${officeVersion}</Version>`;
        const next = content.replace(verRegex, newVerTag);
        if (next !== content) {
            content = next;
            changed = true;
        }
    }

    // B) Ažuriraj glavni <DisplayName>
    const dnRegex = /<DisplayName DefaultValue=".*?"\/>/g;
    if (dnRegex.test(content)) {
        const newDnTag = `<DisplayName DefaultValue="${displayName}"/>`;
        const next = content.replace(dnRegex, newDnTag);
        if (next !== content) {
            content = next;
            changed = true;
        }
    }

    // C) Ažuriraj GetStarted.Title (Resource string)
    const gsRegex = /(<bt:String id="GetStarted\.Title" DefaultValue=").*?("\/>)/g;
    if (gsRegex.test(content)) {
        const next = content.replace(gsRegex, `$1${displayName}$2`);
        if (next !== content) {
            content = next;
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, content, "utf8");
        console.log(c(C.green, `✔ Updated: ${fname}`));
        updatedCount++;
    } else {
        console.log(c(C.gray, `✨ Up to date: ${fname}`));
    }
});

if (updatedCount > 0) {
    console.log(`\n${c(C.green + C.bold, `✔ Successfully updated ${updatedCount} manifests.`)}`);
} else {
    console.log(`\n${c(C.green, "✔ All manifests are already in sync.")}`);
}
