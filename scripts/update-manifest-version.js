// scripts/update-manifest-version.js

const fs = require("fs");
const path = require("path");

// --- KONFIGURACIJA ---
const EXTENSION_NAME = "Serbian Transliterator";
const MANIFESTS = ["manifest.xml", "manifest.prod.xml"];

// --- ANSI BOJE ---
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
    red: "\x1b[31m",
};

console.log(`${C.blue}${C.bold}🔄 MANIFEST SYNC UTILITY${C.reset}`);

// 1. Učitaj verziju iz package.json
const pkgPath = path.resolve(__dirname, "../package.json");
if (!fs.existsSync(pkgPath)) {
    console.error(`${C.red}❌ ERROR: package.json not found!${C.reset}`);
    process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = pkg.version;

// Office zahteva 4 cifre (1.0.0 -> 1.0.0.0)
const officeVersion = version.split(".").length === 3 ? `${version}.0` : version;
const displayName = `${EXTENSION_NAME} (v${version})`;

console.log(`   Target Version: ${C.yellow}${version}${C.reset}`);
console.log(`   Office Format:  ${C.yellow}${officeVersion}${C.reset}`);
console.log(`   Display Name:   ${C.yellow}${displayName}${C.reset}\n`);

// 2. Ažuriraj fajlove
let updatedCount = 0;

MANIFESTS.forEach((fname) => {
    const file = path.resolve(__dirname, "..", fname);
    if (!fs.existsSync(file)) {
        console.log(`${C.gray}Skipped: ${fname} (Not found)${C.reset}`);
        return;
    }

    let content = fs.readFileSync(file, "utf8");
    let changed = false;

    // A. Ažuriraj sistemsku <Version>
    const verRegex = /<Version>.*?<\/Version>/;
    if (verRegex.test(content)) {
        const newVerTag = `<Version>${officeVersion}</Version>`;
        if (!content.includes(newVerTag)) {
            content = content.replace(verRegex, newVerTag);
            changed = true;
        }
    }

    // B. Ažuriraj glavni <DisplayName>
    const dnRegex = /<DisplayName DefaultValue=".*?"\/>/;
    if (dnRegex.test(content)) {
        const newDnTag = `<DisplayName DefaultValue="${displayName}"/>`;
        if (!content.includes(newDnTag)) {
            content = content.replace(dnRegex, newDnTag);
            changed = true;
        }
    }

    // C. Ažuriraj GetStarted.Title (Resource string)
    const gsRegex = /(<bt:String id="GetStarted.Title" DefaultValue=").*?("\/>)/;
    if (gsRegex.test(content)) {
        // Provera da li je već ažurirano je teža sa regexom, pa samo menjamo
        const newContent = content.replace(gsRegex, `$1${displayName}$2`);
        if (newContent !== content) {
            content = newContent;
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, content, "utf8");
        console.log(`${C.green}✅ Updated: ${fname}${C.reset}`);
        updatedCount++;
    } else {
        console.log(`${C.gray}✨ Up to date: ${fname}${C.reset}`);
    }
});

if (updatedCount > 0) {
    console.log(`\n${C.green}${C.bold}✔ Successfully updated ${updatedCount} manifests.${C.reset}`);
} else {
    console.log(`\n${C.green}✔ All manifests are already in sync.${C.reset}`);
}
