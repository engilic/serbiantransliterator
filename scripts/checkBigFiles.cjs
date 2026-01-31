// scripts/checkBigFiles.cjs

"use strict";

const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const { scan, ok, fail, C, color } = require("./_ui.cjs");

const ARGS = process.argv.slice(2);
const DEFAULT_MAX_MB = 5;

function parseMaxMb() {
    const arg = ARGS.find((a) => a.startsWith("--max-mb="));
    if (!arg) return DEFAULT_MAX_MB;
    const v = Number(arg.split("=")[1]);
    return Number.isFinite(v) && v > 0 ? v : DEFAULT_MAX_MB;
}

function gitTrackedFiles() {
    const res = spawnSync("git", ["ls-files"], {
        shell: false,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    });

    if (res.status !== 0) {
        const err = String(res.stderr || "").trim();
        throw new Error(`git ls-files failed${err ? `: ${err}` : ""}`);
    }

    const out = String(res.stdout || "");
    return out
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((p) => p.replace(/\\/g, "/"));
}

function main() {
    const maxMb = parseMaxMb();
    const maxBytes = maxMb * 1024 * 1024;

    scan(`📦 Large Files Gate (max ${maxMb} MB per tracked file)...`);

    let files = [];
    try {
        files = gitTrackedFiles();
    } catch (e) {
        console.error(`\n${fail("CRITICAL")} Large Files Gate failed to read tracked files.`);
        console.error(color(C.red, String(e?.message || e)));
        process.exit(1);
    }

    const offenders = [];

    for (const f of files) {
        let st;
        try {
            st = fs.statSync(f);
        } catch {
            continue;
        }
        if (!st.isFile()) continue;

        if (st.size > maxBytes) offenders.push({ file: f, bytes: st.size });
    }

    if (offenders.length === 0) {
        console.log(ok("OK") + ` No tracked files over ${maxMb} MB.`);
        process.exit(0);
    }

    offenders.sort((a, b) => b.bytes - a.bytes);

    console.error(`\n${fail("CRITICAL")} Large tracked files detected (>${maxMb} MB).`);
    console.error(
        color(C.yellow, "Consider Git LFS, compression, or removing from history if accidental.") + "\n"
    );

    for (const o of offenders.slice(0, 50)) {
        const mb = (o.bytes / 1024 / 1024).toFixed(2);
        console.error(`   ${color(C.red, "-")} ${o.file}  (${mb} MB)`);
    }
    if (offenders.length > 50) {
        console.error(color(C.gray, `   ...and ${offenders.length - 50} more`));
    }

    process.exit(1);
}

main();
