// scripts/release.js
const { spawnSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// --- KONFIGURACIJA ---
const EXTENSION_NAME = "Serbian Transliterator";
const FILES_TO_UPDATE = [
    "package.json",
    "src/wasm-core/Cargo.toml", // Rust
    "manifest.xml", // Dev manifest
    "manifest.prod.xml", // Prod manifest (Removed src/manifest.xml)
];

// --- ANSI COLORS ---
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
    white: "\x1b[97m",
};

function beep() {
    process.stdout.write("\x07");
}

function printBanner() {
    console.clear();
    console.log(`${C.cyan}${C.bold}
    ____  ________    _______  __________
   / __ \\/ ____/ /   / ____/ |/ /_  __/ /
  / /_/ / __/ / /   / __/ /    / / / / / 
 / _, _/ /___/ /___/ /___/_/| | / / /_/  
/_/ |_/_____/_____/_____/_/ |_|/_/ (_)   
                                         
   🚀 RELEASE COMMANDER • INTELLIGENT SYNC
${C.reset}`);
}

async function askSelection(opts) {
    return new Promise((resolve) => {
        let idx = 0;
        const render = () => {
            console.clear();
            printBanner();
            console.log(`\n${C.yellow}❓ Select new version:${C.reset}\n`);
            opts.forEach((o, i) => {
                const prefix = i === idx ? `${C.green}👉` : "  ";
                const style = i === idx ? C.bold + C.green : C.gray;
                console.log(
                    `${prefix} ${style}[${o.type.toUpperCase().padEnd(6)}] ${o.ver.padEnd(10)} ${C.gray}(${o.desc})${C.reset}`
                );
            });
            console.log(`\n${C.gray}Use ↑/↓ and Enter${C.reset}`);
        };

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        render();

        process.stdin.on("data", (key) => {
            if (key === "\u0003") {
                process.exit(0);
            } // Ctrl+C
            if (key === "\u001b[A") {
                idx = idx > 0 ? idx - 1 : opts.length - 1;
                render();
            } // Up
            else if (key === "\u001b[B") {
                idx = idx < opts.length - 1 ? idx + 1 : 0;
                render();
            } // Down
            else if (key === "\r") {
                // Enter
                process.stdin.setRawMode(false);
                process.stdin.pause();
                resolve(opts[idx]);
            }
        });
    });
}

// --- IZMENJENE KONTROLE ---
async function askYesNo(q) {
    return new Promise((r) => {
        console.log(`\n${C.magenta}❓ ${q} ${C.gray}(Y/n)${C.reset}`);
        console.log(
            `   ${C.white}[${C.green}BACKSPACE / ⬅ / Enter${C.white}] = DA   |   [${C.red}DEL / ➔ / Esc${C.white}] = NE${C.reset}`
        );

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        const l = (k) => {
            if (k === "\u0003") process.exit(1);

            // DA: y, Y, Enter, Backspace, Levo
            if (
                k === "y" ||
                k === "Y" ||
                k === "\r" ||
                k === "\u007f" ||
                k === "\u0008" ||
                k === "\u001b[D"
            ) {
                process.stdout.write(`${C.green}DA${C.reset}\n`);
                cleanup(true);
            }
            // NE: n, N, Esc, Delete, Desno
            else if (k === "n" || k === "N" || k === "\u001b" || k === "\u001b[3~" || k === "\u001b[C") {
                process.stdout.write(`${C.red}NE${C.reset}\n`);
                cleanup(false);
            }
        };
        const cleanup = (res) => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener("data", l);
            r(res);
        };
        process.stdin.on("data", l);
    });
}

// --- LOGIC ---

function updateFiles(newVer) {
    FILES_TO_UPDATE.forEach((f) => {
        const p = path.join(process.cwd(), f);
        if (!fs.existsSync(p)) return;

        let content = fs.readFileSync(p, "utf8");
        const name = path.basename(f);
        let updated = false;

        if (name === "package.json") {
            const json = JSON.parse(content);
            json.version = newVer;
            content = JSON.stringify(json, null, 2) + "\n";
            updated = true;
        } else if (name === "Cargo.toml") {
            content = content.replace(/^version\s*=\s*".*"/m, `version = "${newVer}"`);
            updated = true;
        } else if (name.endsWith(".xml")) {
            const officeVer = newVer.split(".").length === 3 ? `${newVer}.0` : newVer;
            const dispName = `${EXTENSION_NAME} (v${newVer})`;

            if (content.includes("<Version>")) {
                content = content.replace(/<Version>.*?<\/Version>/, `<Version>${officeVer}</Version>`);
                updated = true;
            }
            if (content.includes("<DisplayName")) {
                content = content.replace(
                    /<DisplayName DefaultValue=".*?"\/>/,
                    `<DisplayName DefaultValue="${dispName}"/>`
                );
                updated = true;
            }
            if (content.includes('id="GetStarted.Title"')) {
                content = content.replace(
                    /(<bt:String id="GetStarted.Title" DefaultValue=").*?("\/>)/,
                    `$1${dispName}$2`
                );
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(p, content);
            console.log(`   ${C.green}✔ Updated ${name}${C.reset}`);
        }
    });
}

function updateChangelog(newVer) {
    let lastTag = "";
    try {
        lastTag = execSync("git describe --tags --abbrev=0 2>/dev/null").toString().trim();
    } catch (e) {}
    const range = lastTag ? `${lastTag}..HEAD` : "HEAD";

    let logs = "";
    try {
        logs = execSync(`git log ${range} --pretty=format:"- %s (%h)"`).toString();
    } catch (e) {
        logs = "- Initial release";
    }

    const p = path.join(process.cwd(), "CHANGELOG.md");
    const old = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
    const entry = `\n## [${newVer}] - ${new Date().toISOString().split("T")[0]}\n${logs}\n`;

    fs.writeFileSync(p, entry + old);
    console.log(`   ${C.green}✔ Updated CHANGELOG.md${C.reset}`);
}

async function main() {
    if (execSync("git status --porcelain").toString().trim()) {
        console.error(`${C.red}⛔ ERROR: Git dirty! Commit changes first.${C.reset}`);
        process.exit(1);
    }

    const currVer = require(path.join(process.cwd(), "package.json")).version;
    const [ma, mi, pa] = currVer.split(".").map(Number);
    const opts = [
        { type: "patch", ver: `${ma}.${mi}.${pa + 1}`, desc: "Bug fixes" },
        { type: "minor", ver: `${ma}.${mi + 1}.0`, desc: "New features" },
        { type: "major", ver: `${ma + 1}.0.0`, desc: "Breaking changes" },
    ];

    const sel = await askSelection(opts);

    console.log(`\n${C.blue}🚀 Bumping: ${C.bold}${currVer} -> ${sel.ver}${C.reset}`);

    if (!(await askYesNo("Apply changes?"))) process.exit(0);

    updateFiles(sel.ver);
    updateChangelog(sel.ver);

    console.log(`\n${C.yellow}👀 Review changes.${C.reset}`);
    if (!(await askYesNo("Commit and Tag?"))) {
        console.log(`${C.red}↺ Reverting...${C.reset}`);
        execSync("git checkout .");
        process.exit(0);
    }

    try {
        console.log(`\n${C.blue}💾 Git Commit & Tag...${C.reset}`);
        execSync("git add .");
        execSync(`git commit -m "chore(release): v${sel.ver}"`);
        execSync(`git tag -a v${sel.ver} -m "Release v${sel.ver}"`);

        beep();
        console.log(`\n${C.green}${C.bold}✅ RELEASE v${sel.ver} DONE!${C.reset}`);
        console.log(`${C.gray}Run 'git push --follow-tags'${C.reset}\n`);
    } catch (e) {
        console.error(`${C.red}❌ Git Error: ${e.message}${C.reset}`);
        process.exit(1);
    }
}

main();
