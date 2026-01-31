// scripts/checkConflicts.cjs

"use strict";

const { spawnSync } = require("child_process");
const { C, color, ok, fail, scan } = require("./_ui.cjs");

// Tražimo standardne git markere: <<<<<<<, =======, >>>>>>>, |||||||
const PATTERN = "^(<{7}|={7}|\\|{7}|>{7})( |$)";

function main() {
    scan("🔍 Scanning for merge conflicts...");

    const res = spawnSync("git", ["grep", "-nE", PATTERN], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
    });

    // 0 = matches found (conflicts exist) -> error
    // 1 = no matches -> ok
    // >1 = command error

    if (res.status === 1) {
        console.log(ok("No conflict markers found."));
        process.exit(0);
    }

    if (res.status === 0) {
        const output = String(res.stdout ?? "").trim();

        console.error(`\n${fail("CRITICAL:")} MERGE CONFLICTS DETECTED!`);
        console.error(color(C.yellow, "You must resolve these markers before committing:") + "\n");

        const lines = output ? output.split("\n") : [];
        for (const line of lines) {
            const parts = line.split(":");
            if (parts.length >= 3) {
                const file = parts[0];
                const lineNum = parts[1];
                const content = parts.slice(2).join(":").trim();
                console.error(`  📄 ${color(C.bold, file)}:${lineNum}  ${color(C.red, content)}`);
            } else {
                console.error(`  ${color(C.red, line)}`);
            }
        }

        process.exit(1);
    }

    const err = String(res.stderr ?? res.stdout ?? "").trim();
    console.error(`\n${fail("ERROR:")} Failed to run git grep check.`);
    if (err) console.error(color(C.gray, err));
    process.exit(2);
}

main();
