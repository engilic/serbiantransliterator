// scripts/checkI18nKeys.cjs

"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { C, color, ok, fail, scan } = require("./_ui.cjs");

// --- CONFIG ---
const ROOT = process.cwd();
const LOCALE_FILE = path.join(ROOT, "src/shared/locales/sr.ts");
const SRC_DIR = path.join(ROOT, "src");

const SHOW_MISSING_LIMIT = 200;
const SHOW_SAFE_DELETE_LIMIT = 100;

// =====================
// YES/NO prompt (same UX)
// =====================
function canRawMode() {
    return !!process.stdin.isTTY && typeof process.stdin.setRawMode === "function";
}

async function askYesNo(q) {
    return new Promise((resolve) => {
        console.log(`\n${color(C.magenta, "❓ " + q)}`);
        console.log(
            `   ${color(C.green, "[BACKSPACE / ⬅ / Enter / Y] = ✔ YES")}    |   ${color(
                C.red,
                "[DEL / ➔ / Esc / N] = ✖ NO"
            )}`
        );

        process.stdin.setEncoding("utf8");
        process.stdin.resume();

        // fallback: Y/N + Enter
        if (!canRawMode()) {
            const onData = (chunk) => {
                const v = String(chunk || "")
                    .trim()
                    .toLowerCase();
                process.stdin.off("data", onData);
                process.stdin.pause();

                if (v.startsWith("y")) {
                    process.stdout.write(color(C.green, "✔ YES\n"));
                    return resolve(true);
                }
                process.stdout.write(color(C.red, "✖ NO\n"));
                return resolve(false);
            };
            process.stdin.on("data", onData);
            return;
        }

        process.stdin.setRawMode(true);

        const listener = (k) => {
            if (k === "\u0003") {
                cleanup(false);
                process.exit(1);
            }

            // YES
            if (
                k === "y" ||
                k === "Y" ||
                k === "\r" ||
                k === "\n" ||
                k === "\u007f" ||
                k === "\u0008" ||
                k === "\u001b[D"
            ) {
                process.stdout.write(color(C.green, "✔ YES\n"));
                cleanup(true);
            }
            // NO
            else if (k === "n" || k === "N" || k === "\u001b" || k === "\u001b[3~" || k === "\u001b[C") {
                process.stdout.write(color(C.red, "✖ NO\n"));
                cleanup(false);
            }
        };

        function cleanup(result) {
            try {
                process.stdin.setRawMode(false);
            } catch {}
            process.stdin.pause();
            process.stdin.removeListener("data", listener);
            resolve(result);
        }

        process.stdin.on("data", listener);
    });
}

// =====================
// Locale parsing
// =====================
function loadLocaleKeysDetailed() {
    if (!fs.existsSync(LOCALE_FILE)) {
        console.error(color(C.red, `✖ FATAL: Locale file missing at ${LOCALE_FILE}`));
        process.exit(1);
    }

    const content = fs.readFileSync(LOCALE_FILE, "utf8");
    const keyRe = /^\s*["']?([a-zA-Z0-9_]+)["']?\s*:/gm;

    const keys = new Set();
    const duplicates = [];

    let m;
    while ((m = keyRe.exec(content)) !== null) {
        const k = m[1];
        if (keys.has(k)) duplicates.push(k);
        keys.add(k);
    }

    return { keys, duplicates };
}

// =====================
// Usage scan (source)
// =====================
function shouldSkipDir(name) {
    return ["node_modules", "dist", "wasm-core", "coverage", ".git"].includes(name);
}

function scanFiles(dir, definedKeys, usedKeysSet, missingKeys, stats) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const e of entries) {
        const fullPath = path.join(dir, e.name);

        if (e.isDirectory()) {
            if (shouldSkipDir(e.name)) continue;
            scanFiles(fullPath, definedKeys, usedKeysSet, missingKeys, stats);
            continue;
        }

        if (
            !e.name.endsWith(".ts") &&
            !e.name.endsWith(".tsx") &&
            !e.name.endsWith(".js") &&
            !e.name.endsWith(".cjs") &&
            !e.name.endsWith(".mjs") &&
            !e.name.endsWith(".html")
        ) {
            continue;
        }

        if (e.name === "sr.ts") continue;

        let content = "";
        try {
            content = fs.readFileSync(fullPath, "utf8");
        } catch {
            continue;
        }

        const rel = path.relative(ROOT, fullPath).replace(/\\/g, "/");
        stats.filesScanned++;

        // t("key") / t('key') / t(`key`)
        const reT = /\bt\s*\(\s*([`"'])([a-zA-Z0-9_]+)\1\s*[,)]/g;
        let m;
        while ((m = reT.exec(content)) !== null) {
            const key = m[2];
            usedKeysSet.add(key);
            if (!definedKeys.has(key)) missingKeys.add(`${key} @ ${rel}`);
        }

        // data-i18n="key"
        const reData = /\bdata-i18n\s*=\s*(["'])([a-zA-Z0-9_]+)\1/g;
        while ((m = reData.exec(content)) !== null) {
            const key = m[2];
            usedKeysSet.add(key);
            if (!definedKeys.has(key)) missingKeys.add(`${key} @ ${rel}`);
        }

        // data-i18n-attr="title:key1,placeholder:key2"
        const reAttr = /\bdata-i18n-attr\s*=\s*(["'])([^"']+)\1/g;
        while ((m = reAttr.exec(content)) !== null) {
            const pairs = String(m[2] || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            for (const p of pairs) {
                const parts = p.split(":").map((s) => s.trim());
                if (parts.length !== 2) continue;

                const key = parts[1];
                if (!key) continue;

                usedKeysSet.add(key);
                if (!definedKeys.has(key)) missingKeys.add(`${key} @ ${rel}`);
            }
        }
    }
}

// =====================
// Safety checks via git grep (strict MAX1)
// =====================
function gitGrepLines(args) {
    const res = spawnSync("git", ["grep", ...args], {
        encoding: "utf8",
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
    });

    // 0 = match, 1 = no match, >1 = error
    if (res.status === 1) return [];
    if (res.status === 0) {
        return String(res.stdout || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    const err = String(res.stderr || res.stdout || "").trim();
    throw new Error(`git grep failed: ${err || "unknown error"}`);
}

function normalizeRel(p) {
    return String(p || "")
        .replace(/\\/g, "/")
        .replace(/^\.\//, "");
}

function isOnlyInLocaleFile(grepLines, localeRel) {
    const target = normalizeRel(localeRel);
    return grepLines.every((ln) => normalizeRel(ln).startsWith(`${target}:`));
}

function computeSafeToDelete(unusedKeys, localeRel) {
    const safe = [];

    for (const key of unusedKeys) {
        // A) whole-word hits outside sr.ts -> NOT SAFE
        const hits = gitGrepLines(["-n", "-w", "--fixed-strings", key]);
        if (!isOnlyInLocaleFile(hits, localeRel)) continue;

        // B) prefix "key_" outside sr.ts -> NOT SAFE (dynamic)
        const prefixHits = gitGrepLines(["-n", "--fixed-strings", `${key}_`]);
        if (!isOnlyInLocaleFile(prefixHits, localeRel)) continue;

        // C) plural heuristic: foo_one/few/many/other => check foo_ usage too
        const pm = key.match(/^(.*)_(one|few|many|other)$/);
        if (pm) {
            const baseHits = gitGrepLines(["-n", "--fixed-strings", `${pm[1]}_`]);
            if (!isOnlyInLocaleFile(baseHits, localeRel)) continue;
        }

        safe.push(key);
    }

    return safe;
}

// =====================
// Auto-delete unused keys (strict safe mode)
// Only removes single-line string entries
// =====================
function removeUnusedKeysFromLocale(keysToRemove) {
    const content = fs.readFileSync(LOCALE_FILE, "utf8");
    const lines = content.split(/\r\n|\n/);

    const keySet = new Set(keysToRemove);

    const removed = [];
    const skipped = [];

    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const singleLineStringProp = (key) =>
        new RegExp("^\\s*([\"']?)" + escapeRe(key) + "\\1\\s*:\\s*([`\"']).*\\2\\s*,?\\s*$");

    const out = [];
    for (const line of lines) {
        let matchedKey = null;

        for (const k of keySet) {
            if (singleLineStringProp(k).test(line)) {
                matchedKey = k;
                break;
            }
        }

        if (matchedKey) {
            removed.push(matchedKey);
            keySet.delete(matchedKey);
            continue;
        }

        out.push(line);
    }

    for (const k of keySet) skipped.push(k);

    if (removed.length > 0) {
        fs.writeFileSync(LOCALE_FILE, out.join("\n"), "utf8");
    }

    return { removed, skipped };
}

// =====================
// Main
// =====================
async function main() {
    scan("🌍 I18n Integrity + Safe Bloat Cleanup ...");

    const { keys: definedKeys, duplicates } = loadLocaleKeysDetailed();

    if (!fs.existsSync(SRC_DIR)) {
        console.error(color(C.red, `✖ FATAL: src directory missing at ${SRC_DIR}`));
        process.exit(1);
    }

    const usedKeys = new Set();
    const missingKeys = new Set();
    const stats = { filesScanned: 0 };

    scanFiles(SRC_DIR, definedKeys, usedKeys, missingKeys, stats);

    const missingCount = missingKeys.size;
    const unusedKeys = [...definedKeys].filter((k) => !usedKeys.has(k)).sort();

    const localeRel = normalizeRel(path.relative(ROOT, LOCALE_FILE));

    // SAFE calculation
    let safeToDelete = [];
    try {
        if (unusedKeys.length > 0) safeToDelete = computeSafeToDelete(unusedKeys, localeRel);
    } catch {
        safeToDelete = [];
    }

    // Summary (aligned)
    console.log("");
    console.log(color(C.cyan, "📎 Summary:"));

    const rows = [
        ["files scanned", stats.filesScanned],
        ["defined keys", definedKeys.size],
        ["used keys", usedKeys.size],
        ["unused keys", unusedKeys.length],
        ["missing keys", missingCount],
        ["safe to delete", safeToDelete.length],
    ];

    const keyW = Math.max(...rows.map(([k]) => k.length));
    const valW = Math.max(...rows.map(([, v]) => String(v).length));

    for (const [k, v] of rows) {
        const line = `   • ${k.padEnd(keyW)}: ${String(v).padStart(valW)}`;

        if (k === "safe to delete") {
            if (safeToDelete.length > 0) console.log(color(C.green + C.bold, line));
            else console.log(color(C.yellow, line));
        } else {
            console.log(line);
        }
    }

    // duplicates = hard fail
    if (duplicates.length > 0) {
        console.error(`\n${fail("FATAL")} Duplicate keys detected in sr.ts (later one overrides earlier):`);
        [...new Set(duplicates)].slice(0, 200).forEach((k) => console.error(`   ${color(C.red, "-")} ${k}`));
        process.exit(1);
    }

    // missing keys = hard fail
    if (missingCount > 0) {
        console.error(`\n${fail("CRITICAL")} Missing translation keys (used but not defined):`);
        [...missingKeys]
            .slice(0, SHOW_MISSING_LIMIT)
            .forEach((s) => console.error(`   ${color(C.red, "-")} ${s}`));
        if (missingCount > SHOW_MISSING_LIMIT) {
            console.error(color(C.yellow, `   ...and ${missingCount - SHOW_MISSING_LIMIT} more`));
        }
        process.exit(1);
    }

    console.log(`${ok("OK")} All used keys exist.`);

    // If SAFE=0 → ništa dalje
    if (safeToDelete.length === 0) process.exit(0);

    // If SAFE>0 → list keys + files + prompt
    console.log(color(C.cyan, `\n🧹 SAFE to delete keys: ${safeToDelete.length}`));
    console.log(color(C.cyan, "📎 Will delete from files:"));
    console.log(`   - ${color(C.bold, localeRel)}`);
    console.log(color(C.cyan, "📎 Keys (SAFE):"));

    safeToDelete.slice(0, SHOW_SAFE_DELETE_LIMIT).forEach((k) => console.log(`   - ${k}`));
    if (safeToDelete.length > SHOW_SAFE_DELETE_LIMIT) {
        console.log(color(C.gray, `   ...and ${safeToDelete.length - SHOW_SAFE_DELETE_LIMIT} more`));
    }

    const shouldDelete = await askYesNo("Proceed with auto-deleting SAFE unused translation keys now?");

    if (shouldDelete) {
        const { removed, skipped } = removeUnusedKeysFromLocale(safeToDelete);

        console.log(color(C.cyan, "\n📎 Auto-delete report (SAFE mode):"));
        console.log(`   • file:    ${localeRel}`);
        console.log(`   • removed: ${removed.length}`);
        console.log(`   • skipped: ${skipped.length}`);

        if (skipped.length > 0) {
            console.warn(color(C.yellow, "\n⚠ Skipped SAFE keys (manual check recommended):"));
            skipped.slice(0, 200).forEach((k) => console.warn(`   - ${k}`));
            if (skipped.length > 200) console.warn(color(C.gray, `   ...and ${skipped.length - 200} more`));
        }
    } else {
        console.log(color(C.gray, "\n⛔ No changes made."));
    }

    process.exit(0);
}

main().catch((e) => {
    console.error(e?.stack || e?.message || e);
    process.exit(1);
});
