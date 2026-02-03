#!/usr/bin/env node
// scripts/checkDistArtifacts.cjs

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");

const ARGS = process.argv.slice(2);
const STRICT = ARGS.includes("--strict");

function walk(dir) {
    const out = [];
    if (!fs.existsSync(dir)) return out;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...walk(p));
        else if (e.isFile()) out.push(p);
    }
    return out;
}

function rel(p) {
    return path.relative(ROOT, p).replace(/\\/g, "/");
}

function fileExists(relPath) {
    return fs.existsSync(path.join(ROOT, relPath));
}

function readTextSafe(relPath) {
    try {
        return fs.readFileSync(path.join(ROOT, relPath), "utf8");
    } catch {
        return null;
    }
}

/**
 * Extract ONLY user/office-facing URLs from manifest:
 * - DefaultValue="..."
 * - <AppDomain>...</AppDomain>
 *
 * This intentionally ignores xmlns="http://schemas..." etc.
 */
function extractManifestUrls(xml) {
    const urls = [];

    // DefaultValue="..."
    const reDef = /DefaultValue\s*=\s*"([^"]+)"/gi;
    let m;
    while ((m = reDef.exec(xml))) {
        const v = String(m[1] || "").trim();
        if (v) urls.push({ where: "DefaultValue", value: v });
    }

    // <AppDomain>...</AppDomain>
    const reDomain = /<AppDomain>\s*([^<]+?)\s*<\/AppDomain>/gi;
    while ((m = reDomain.exec(xml))) {
        const v = String(m[1] || "").trim();
        if (v) urls.push({ where: "AppDomain", value: v });
    }

    return urls;
}

function findInsecureManifestUrls(xml, fileLabel) {
    const urls = extractManifestUrls(xml);

    const insecure = [];

    for (const u of urls) {
        const v = u.value;

        // Block http:// only for real URLs (DefaultValue/AppDomain)
        if (/^http:\/\//i.test(v)) {
            insecure.push({
                file: fileLabel,
                url: v,
                reason: `Insecure URL (http://) in ${u.where}`,
            });
        }

        // Block localhost in prod contexts
        if (/localhost/i.test(v)) {
            insecure.push({
                file: fileLabel,
                url: v,
                reason: `Localhost URL in ${u.where}`,
            });
        }
    }

    return insecure;
}

function main() {
    if (!fs.existsSync(DIST)) {
        console.error("❌ dist/ folder not found. Run build first.");
        process.exit(1);
    }

    const files = walk(DIST);
    const relFiles = files.map(rel);

    const blockers = [];
    const warnings = [];

    // Always-block
    const forbiddenAlways = [
        { re: /\.map$/i, msg: "Source maps must not be shipped (*.map)" },
        { re: /(^|\/)dict_(e2i|i2e)\.json$/i, msg: "Dictionary JSON must not be shipped (dict_*.json)" },
    ];

    // Strict-only block
    const forbiddenStrict = [
        { re: /\.ts$/i, msg: "TypeScript files must not be shipped (*.ts)" },
        { re: /\.tsx$/i, msg: "TypeScript files must not be shipped (*.tsx)" },
    ];

    // Enforce hashed JS/CSS (except sw.js)
    const HASHED_JS_RE = /\.[0-9a-f]{8}\.js$/i;
    const HASHED_CSS_RE = /\.[0-9a-f]{8}\.css$/i;

    for (const f of relFiles) {
        for (const rule of forbiddenAlways) {
            if (rule.re.test(f)) blockers.push({ file: f, reason: rule.msg });
        }
        for (const rule of forbiddenStrict) {
            if (rule.re.test(f)) {
                if (STRICT) blockers.push({ file: f, reason: rule.msg });
                else warnings.push({ file: f, reason: rule.msg + " (strict will fail)" });
            }
        }

        // Soft warning: unexpected JSON (except webmanifest)
        if (/\.json$/i.test(f) && !/(^|\/)manifest\.webmanifest$/i.test(f)) {
            warnings.push({ file: f, reason: "JSON in dist (check if intended)" });
        }

        // Hashed JS/CSS enforcement (cache safety)
        if (/\.js$/i.test(f)) {
            const base = path.posix.basename(f);
            if (base !== "sw.js" && !HASHED_JS_RE.test(base)) {
                blockers.push({
                    file: f,
                    reason: "Non-hashed JS in dist (cache-safety requires contenthash filenames)",
                });
            }
        }

        if (/\.css$/i.test(f)) {
            const base = path.posix.basename(f);
            if (!HASHED_CSS_RE.test(base)) {
                blockers.push({
                    file: f,
                    reason: "Non-hashed CSS in dist (cache-safety requires contenthash filenames)",
                });
            }
        }
    }

    // Required artifacts
    const mustExist = [
        "dist/index.html",
        "dist/web.html",

        "dist/taskpane.html",
        "dist/commands.html",
        "dist/support.html",
        "dist/_headers",
        "dist/manifest.prod.xml",
        "dist/manifest.webmanifest",
        "dist/sw.js",

        "dist/assets/icon-16.png",
        "dist/assets/icon-32.png",
        "dist/assets/icon-64.png",
        "dist/assets/icon-80.png",
        "dist/assets/icon-192.png",
        "dist/assets/icon-512.png",
    ];

    for (const m of mustExist) {
        if (!fileExists(m)) blockers.push({ file: m, reason: "Missing required artifact" });
    }

    // Validate prod manifest URLs (no http:// and no localhost)
    const prodManifest = readTextSafe("dist/manifest.prod.xml");
    if (prodManifest) {
        const bad = findInsecureManifestUrls(prodManifest, "dist/manifest.prod.xml");
        for (const x of bad) blockers.push({ file: x.file, reason: `${x.reason}: ${x.url}` });
    }

    // STRICT: validate dist/manifest.xml too (since you copy prod -> manifest.xml)
    if (STRICT && fileExists("dist/manifest.xml")) {
        const m = readTextSafe("dist/manifest.xml") || "";
        const bad = findInsecureManifestUrls(m, "dist/manifest.xml");
        for (const x of bad) blockers.push({ file: x.file, reason: `${x.reason}: ${x.url}` });
    }

    console.log(`\n📦 DIST ARTIFACTS GATE${STRICT ? " (STRICT)" : ""}`);
    console.log(`   • dist files: ${relFiles.length}`);
    console.log(`   • strict:     ${STRICT ? "YES" : "NO"}`);

    if (warnings.length) {
        console.log("\n⚠ WARNINGS:");
        for (const w of warnings.slice(0, 120)) {
            console.log(`   - ${w.file}  (${w.reason})`);
        }
        if (warnings.length > 120) console.log(`   - ...and ${warnings.length - 120} more`);
    }

    if (blockers.length) {
        console.log("\n❌ BLOCKERS:");
        for (const b of blockers.slice(0, 120)) {
            console.log(`   - ${b.file}  (${b.reason})`);
        }
        if (blockers.length > 120) console.log(`   - ...and ${blockers.length - 120} more`);
        process.exit(1);
    }

    console.log("\n✅ Dist artifacts OK.\n");
    process.exit(0);
}

main();
