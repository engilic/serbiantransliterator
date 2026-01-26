const { spawnSync } = require("child_process");
const readline = require("readline");

// Konfiguracija
const SAFE_BRANCHES = ["master", "main", "HEAD"]; // Grane koje se nikad ne brišu

// ANSI boje
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    bold: "\x1b[1m",
};

// Helper za komande
function run(cmd, args, ignoreError = false) {
    console.log(`${C.yellow}$ ${cmd} ${args.join(" ")}${C.reset}`);
    const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });
    if (result.status !== 0 && !ignoreError) {
        console.error(`${C.red}❌ Komanda nije uspela.${C.reset}`);
        process.exit(1);
    }
}

// Helper za hvatanje outputa
function getOutput(cmd, args) {
    const result = spawnSync(cmd, args, { encoding: "utf8", shell: true });
    if (result.status !== 0) return [];
    return result.stdout
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
}

// Glavna logika
async function main() {
    console.log(`${C.bold}${C.red}⚠️  OPREZ: OVO JE DESTRUKTIVNA SKRIPTA ⚠️${C.reset}`);
    console.log(`Ova skripta će:`);
    console.log(`1. Resetovati master na origin/master`);
    console.log(`2. Obrisati SVE lokalne grane osim mastera`);
    console.log(`3. Obrisati SVE remote grane osim mastera (ako potvrdiš)`);
    console.log(`4. Uraditi 'git clean -fdx' (brisanje node_modules, dist, itd.)`);
    console.log(`---------------------------------------------------`);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

    const answer = await ask(`${C.bold}Da li ste sigurni da želite da nastavite? (yes/NO): ${C.reset}`);
    if (answer.toLowerCase() !== "yes") {
        console.log("Prekinuto.");
        process.exit(0);
    }

    console.log(`\n${C.green}>>> 1. Resetujem master...${C.reset}`);
    run("git", ["checkout", "master"]);
    run("git", ["fetch", "origin"]);
    run("git", ["reset", "--hard", "origin/master"]);

    console.log(`\n${C.green}>>> 2. Brišem lokalne grane...${C.reset}`);
    const localBranches = getOutput("git", ["branch"]);
    for (const b of localBranches) {
        // Ukloni * marker ako postoji
        const branchName = b.replace("*", "").trim();
        if (!SAFE_BRANCHES.includes(branchName)) {
            run("git", ["branch", "-D", branchName], true);
        }
    }

    console.log(`\n${C.green}>>> 3. Remote grane...${C.reset}`);
    const deleteRemote = await ask(`${C.bold}Da li želite da obrišete i REMOTE grane? (yes/NO): ${C.reset}`);

    if (deleteRemote.toLowerCase() === "yes") {
        const remoteBranches = getOutput("git", ["branch", "-r"]);
        for (const rb of remoteBranches) {
            // rb izgleda kao "origin/feature-x"
            if (rb.includes("->")) continue; // preskoči HEAD pokazivač

            const parts = rb.split("/");
            // parts[0] je remote (origin), ostatak je ime grane
            const remoteName = parts[0];
            const branchName = parts.slice(1).join("/");

            if (!SAFE_BRANCHES.includes(branchName)) {
                console.log(`${C.red}Brišem remote: ${branchName}${C.reset}`);
                run("git", ["push", remoteName, "--delete", branchName], true);
            }
        }
    } else {
        console.log("Preskačem remote grane.");
    }

    console.log(`\n${C.green}>>> 4. Git Clean & NPM CI...${C.reset}`);
    const doClean = await ask(
        `${C.bold}Da li želite da obrišete node_modules i build artefakte (git clean)? (yes/NO): ${C.reset}`
    );

    if (doClean.toLowerCase() === "yes") {
        run("git", ["clean", "-fdx"]);
        console.log(`${C.green}Instaliram zavisnosti (npm ci)...${C.reset}`);
        run("npm", ["ci"]);
    }

    console.log(`\n${C.green}✅ GOTOVO!${C.reset}`);
    rl.close();
}

main();
