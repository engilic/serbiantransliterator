// @ts-nocheck
// scripts/checkConflicts.cjs

"use strict";

const { spawnSync } = require("child_process");

// --- CONFIG ---
// Tražimo standardne git markere: <<<<<<<, =======, >>>>>>>, |||||||
const PATTERN = "^(<{7}|={7}|\\|{7}|>{7})( |$)";

// --- ANSI COLORS ---
const C = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
};

function main() {
    console.log(`${C.blue}🔍 Scanning for merge conflicts...${C.reset}`);

    const res = spawnSync("git", ["grep", "-nE", PATTERN], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"], // Hvatamo output
        shell: false,
    });

    // Git grep exit codes:
    // 0 = Matches found (Konflikti postoje!) -> ERROR
    // 1 = No matches found (Sve čisto) -> OK
    // >1 = Error executing command

    if (res.status === 1) {
        console.log(`${C.green}✅ No conflict markers found.${C.reset}`);
        process.exit(0);
    }

    if (res.status === 0) {
        const output = String(res.stdout ?? "").trim();
        console.error(`\n${C.red}${C.bold}💥 CRITICAL: MERGE CONFLICTS DETECTED!${C.reset}`);
        console.error(`${C.yellow}You must resolve these markers before committing:${C.reset}\n`);

        // Parsiranje izlaza (format: file:line:content)
        const lines = output.split("\n");
        lines.forEach((line) => {
            // Pazimo jer i sam sadržaj može imati dvotačke (npr. u kodu)
            // git grep format: "filename:linenumber:match_content"
            const parts = line.split(":");

            if (parts.length >= 3) {
                const file = parts[0];
                const lineNum = parts[1];
                // Spojimo ostatak u slučaju da kod sadrži ':'
                const content = parts.slice(2).join(":").trim();

                console.error(`  📄 ${C.bold}${file}${C.reset}:${lineNum}  ${C.red}${content}${C.reset}`);
            } else {
                // Fallback ako format nije očekivan
                console.error(`  ${C.red}${line}${C.reset}`);
            }
        });

        process.exit(1);
    }

    // Sistemska greška
    const err = String(res.stderr ?? res.stdout ?? "").trim();
    console.error(`\n${C.red}❌ Failed to run git grep check.${C.reset}`);
    if (err) console.error(`${C.gray}${err}${C.reset}`);
    process.exit(2);
}

main();
