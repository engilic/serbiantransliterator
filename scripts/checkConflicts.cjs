"use strict";

const { spawnSync } = require("child_process");

// Match real git merge conflict markers at start of line (incl diff3 style):
// <<<<<<< branch
// ||||||| base
// =======
// >>>>>>> branch
const PATTERN = "^(<{7}|={7}|\\|{7}|>{7})( |$)";

const res = spawnSync("git", ["grep", "-nE", PATTERN], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
});

if (res.status === 1) {
    // No matches found => OK
    process.exit(0);
}

if (res.status === 0) {
    const out = String(res.stdout ?? "").trim();
    console.error("ERROR: Merge conflict markers found:");
    if (out) console.error(out);
    process.exit(1);
}

// Any other status => git error
const err = String(res.stderr ?? res.stdout ?? "").trim();
console.error("ERROR: Failed to run git grep for conflict markers.");
if (err) console.error(err);
process.exit(typeof res.status === "number" ? res.status : 2);
