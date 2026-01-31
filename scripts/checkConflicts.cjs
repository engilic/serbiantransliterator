// scripts/checkConflicts.cjs

"use strict";

const { spawnSync } = require("child_process");

const PATTERN = "^(<{7}|={7}|\\|{7}|>{7})( |$)";

const C = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
};

const COLOR_ENABLED = !!process.stdout.isTTY && !process.env.NO_COLOR;
function c(code, text) {
    return COLOR_ENABLED ? `${code}${text}${C.reset}` : text;
}
function ok(text) {
    return c(C.green, `✔ ${text}`);
}
function fail(text) {
    return c(C.red, `✖ ${text}`);
}

function main() {
    console.log(c(C.blue, "🔍 Scanning for merge conflicts..."));

    const res = spawnSync("git", ["grep", "-nE", PATTERN], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
    });

    if (res.status === 1) {
        console.log(ok("No conflict markers found."));
        process.exit(0);
    }

    if (res.status === 0) {
        const output = String(res.stdout ?? "").trim();

        console.error(`\n${fail("CRITICAL:")} MERGE CONFLICTS DETECTED!`);
        console.error(c(C.yellow, "You must resolve these markers before committing:") + "\n");

        const lines = output ? output.split("\n") : [];
        for (const line of lines) {
            const parts = line.split(":");
            if (parts.length >= 3) {
                const file = parts[0];
                const lineNum = parts[1];
                const content = parts.slice(2).join(":").trim();
                console.error(`  📄 ${c(C.bold, file)}:${lineNum}  ${c(C.red, content)}`);
            } else {
                console.error(`  ${c(C.red, line)}`);
            }
        }

        process.exit(1);
    }

    const err = String(res.stderr ?? res.stdout ?? "").trim();
    console.error(`\n${fail("ERROR:")} Failed to run git grep check.`);
    if (err) console.error(c(C.gray, err));
    process.exit(2);
}

main();
