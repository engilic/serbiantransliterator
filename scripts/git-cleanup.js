// scripts/git-cleanup.js
const { spawnSync } = require("child_process");
const readline = require("readline");
const path = require("path");

// --- KONFIGURACIJA ---
// Grane koje NIKAD ne brišemo
const SAFE_BRANCHES = ["master", "main", "dev", "HEAD"];
// Fajlovi koje ne želimo da brišemo tokom čišćenja (npr. lokalne tajne, VS podešavanja)
const KEEP_FILES = [".vs", ".env", ".vscode"];

// Argumenti
const args = process.argv.slice(2);
const FORCE = args.includes("--yes") || args.includes("-y");

// ANSI boje
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
};

/**
 * Pomoćna funkcija za izvršavanje komandi
 */
function run(cmd, args, ignoreError = false) {
    console.log(`${C.gray}$ ${cmd} ${args.join(" ")}${C.reset}`);
    const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });
    if (result.status !== 0 && !ignoreError) {
        console.error(`${C.red}❌ Komanda nije uspela: ${cmd} ${args.join(" ")}${C.reset}`);
        process.exit(1);
    }
}

/**
 * Pomoćna funkcija za hvatanje output-a komande
 */
function getOutput(cmd, args) {
    const result = spawnSync(cmd, args, { encoding: "utf8", shell: true });
    if (result.status !== 0) return [];
    return result.stdout
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
}

async function main() {
    console.clear();
    console.log(`${C.blue}${C.bold}🧹 PROJECT DEEP CLEAN UTILITY${C.reset}\n`);

    // --- 1. POTVRDA ---
    if (!FORCE) {
        console.log(`${C.red}${C.bold}⚠️  UPOZORENJE: OVO JE DESTRUKTIVNA AKCIJA! ⚠️${C.reset}`);
        console.log(`${C.yellow}Ova skripta će:`);
        console.log(` 1. Obrisati SVE tvoje lokalne izmene (uključujući one koje nisi komitovao!)`);
        console.log(` 2. Resetovati master na stanje sa GitHub-a`);
        console.log(` 3. Obrisati node_modules, dist, build foldere`);
        console.log(` 4. Obrisati lokalne grane koje nisu master${C.reset}`);
        console.log(`---------------------------------------------------`);

        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

        const answer = await ask(`${C.bold}Da li ste sigurni da želite reset na nulu? (yes/NO): ${C.reset}`);

        let deleteRemote = "no";
        if (answer.toLowerCase() === "yes") {
            // Dodatna provera za remote brisanje jer je to opasno za tim
            deleteRemote = await ask(
                `${C.red}Da li želite da obrišete i REMOTE grane na GitHub-u? (yes/NO): ${C.reset}`
            );
        }

        rl.close();

        if (answer.toLowerCase() !== "yes") {
            console.log("❌ Prekinuto.");
            process.exit(0);
        }

        global.deleteRemoteInteractive = deleteRemote.toLowerCase() === "yes";
    } else {
        console.log(`${C.red}${C.bold}⚡ FORCE MODE: Izvršavam bez pitanja.${C.reset}`);
    }

    // --- 2. RESET MASTER ---
    console.log(`\n${C.green}>>> 1. Osvežavam Master...${C.reset}`);
    run("git", ["checkout", "master"]);
    run("git", ["fetch", "origin"]);
    run("git", ["reset", "--hard", "origin/master"]);

    // [NOVO] Prune briše lokalne reference na grane koje više ne postoje na remote-u
    run("git", ["remote", "prune", "origin"]);

    // --- 3. BRISANJE LOKALNIH GRANA ---
    console.log(`\n${C.green}>>> 2. Čistim lokalne grane...${C.reset}`);
    const localBranches = getOutput("git", ["branch"]);
    for (const b of localBranches) {
        const branchName = b.replace(/\*/g, "").trim();
        // Preskačemo safe branches i trenutnu granu (iako smo na masteru)
        if (!SAFE_BRANCHES.includes(branchName)) {
            run("git", ["branch", "-D", branchName], true); // -D force delete
        }
    }

    // --- 4. BRISANJE REMOTE GRANA (OPCIONO) ---
    const shouldDeleteRemote = FORCE || global.deleteRemoteInteractive;
    if (shouldDeleteRemote) {
        console.log(`\n${C.red}${C.bold}>>> 3. Čistim REMOTE grane na GitHub-u...${C.reset}`);
        const remoteBranches = getOutput("git", ["branch", "-r"]);

        for (const rb of remoteBranches) {
            if (rb.includes("->")) continue; // Preskoči HEAD pointere

            const parts = rb.split("/");
            // obično: origin/ime-grane. Ali može biti origin/feat/ime
            const remoteName = parts[0];
            const branchName = parts.slice(1).join("/");

            if (!SAFE_BRANCHES.includes(branchName)) {
                console.log(`${C.yellow}Brišem remote granu: ${branchName}${C.reset}`);
                run("git", ["push", remoteName, "--delete", branchName], true);
            }
        }
    } else {
        console.log(`\n${C.gray}>>> 3. Preskačem brisanje remote grana.${C.reset}`);
    }

    // --- 5. CLEAN FAJLOVA (Nuclear Clean) ---
    console.log(`\n${C.green}>>> 4. Fizičko čišćenje fajlova (Git Clean & NPM)...${C.reset}`);

    // Konstruišemo argumente za git clean
    // -f: force, -d: directories, -x: ignored files too
    const cleanArgs = ["clean", "-ffdx"];

    // [BITNO] Dodajemo exceptione da ne brišemo .env i .vs
    KEEP_FILES.forEach((file) => {
        cleanArgs.push("-e", file);
    });

    run("git", cleanArgs);

    // --- 6. REINSTALL ---
    console.log(`\n${C.green}>>> 5. Instalacija zavisnosti (npm ci)...${C.reset}`);
    // npm ci je brži i striktniji od npm install (poštuje lock file 100%)
    run("npm", ["ci"]);

    console.log(`\n${C.green}${C.bold}✅ PROJECT RESET COMPLETE!${C.reset}`);
    console.log(`${C.gray}Sada si na čistom masteru, sinhronizovan sa origin/master.${C.reset}\n`);
}

main();
