const { spawnSync } = require("child_process");
const readline = require("readline");

// Konfiguracija
const SAFE_BRANCHES = ["master", "main", "HEAD"]; // Grane koje se nikad ne brišu

// Argumenti
const args = process.argv.slice(2);
const FORCE = args.includes("--yes") || args.includes("-y");

// ANSI boje
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    bold: "\x1b[1m",
};

function run(cmd, args, ignoreError = false) {
    console.log(`${C.yellow}$ ${cmd} ${args.join(" ")}${C.reset}`);
    const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });
    if (result.status !== 0 && !ignoreError) {
        console.error(`${C.red}❌ Komanda nije uspela.${C.reset}`);
        process.exit(1);
    }
}

function getOutput(cmd, args) {
    const result = spawnSync(cmd, args, { encoding: "utf8", shell: true });
    if (result.status !== 0) return [];
    return result.stdout
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
}

async function main() {
    // --- 1. POTVRDA (Samo ako nije FORCE) ---
    if (!FORCE) {
        console.log(`${C.bold}${C.red}⚠️  OPREZ: OVO JE DESTRUKTIVNA SKRIPTA ⚠️${C.reset}`);
        console.log(`1. Reset master na origin/master`);
        console.log(`2. BRISANJE SVIH lokalnih grana (osim master)`);
        console.log(`3. BRISANJE SVIH remote grana (osim master)`);
        console.log(`4. Git clean -fdx (node_modules, dist...)`);
        console.log(`---------------------------------------------------`);

        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
        const answer = await ask(`${C.bold}Da li ste sigurni? (yes/NO): ${C.reset}`);

        // Pitanje za remote (samo u interaktivnom modu)
        let deleteRemote = "no";
        if (answer.toLowerCase() === "yes") {
            deleteRemote = await ask(
                `${C.bold}Da li želite da obrišete i REMOTE grane? (yes/NO): ${C.reset}`
            );
        }

        rl.close();

        if (answer.toLowerCase() !== "yes") {
            console.log("Prekinuto.");
            process.exit(0);
        }

        // Cuvamo odluku u promenljivoj za kasnije
        global.deleteRemoteInteractive = deleteRemote.toLowerCase() === "yes";
    } else {
        console.log(
            `${C.red}${C.bold}⚡ FORCE MODE AKTIVIRAN: Nema milosti. Brišem sve bez pitanja.${C.reset}`
        );
    }

    // --- 2. RESET MASTER ---
    console.log(`\n${C.green}>>> 1. Resetujem master...${C.reset}`);
    run("git", ["checkout", "master"]);
    run("git", ["fetch", "origin"]);
    run("git", ["reset", "--hard", "origin/master"]);

    // --- 3. LOKALNE GRANE ---
    console.log(`\n${C.green}>>> 2. Brišem lokalne grane...${C.reset}`);
    const localBranches = getOutput("git", ["branch"]);
    for (const b of localBranches) {
        const branchName = b.replace(/\*/g, "").trim();
        if (!SAFE_BRANCHES.includes(branchName)) {
            run("git", ["branch", "-D", branchName], true);
        }
    }

    // --- 4. REMOTE GRANE ---
    console.log(`\n${C.green}>>> 3. Brišem REMOTE grane...${C.reset}`);
    // U FORCE modu uvek brišemo. U interaktivnom samo ako je korisnik rekao "yes".
    const shouldDeleteRemote = FORCE || global.deleteRemoteInteractive;

    if (shouldDeleteRemote) {
        const remoteBranches = getOutput("git", ["branch", "-r"]);
        for (const rb of remoteBranches) {
            if (rb.includes("->")) continue;

            const parts = rb.split("/");
            const remoteName = parts[0];
            const branchName = parts.slice(1).join("/");

            if (!SAFE_BRANCHES.includes(branchName)) {
                console.log(`${C.red}Brišem remote: ${branchName}${C.reset}`);
                run("git", ["push", remoteName, "--delete", branchName], true);
            }
        }
    } else {
        console.log("Preskačem remote grane (koristi --yes za brisanje).");
    }

    // --- 5. CLEAN ---
    console.log(`\n${C.green}>>> 4. Git Clean & NPM CI...${C.reset}`);

    // [FIX] -e .vs da ne dira Visual Studio fajlove
    // -ffdx za agresivno brisanje svega ostalog
    run("git", ["clean", "-ffdx", "-e", ".vs"]);

    console.log(`${C.green}Instaliram zavisnosti (npm ci)...${C.reset}`);
    run("npm", ["ci"]);

    console.log(`\n${C.green}✅ CLEANUP COMPLETE! Projekat je kao nov.${C.reset}`);
}

main();
