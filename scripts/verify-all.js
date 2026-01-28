// scripts/verify-all.js
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");

// --- KONFIGURACIJA ---
const MAX_WASM_SIZE_MB = 2.0; // Alarm ako je WASM veći od ovoga
const TIMINGS = []; // Za praćenje vremena svakog koraka

// ANSI boje
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    red: "\x1b[31m",
    bold: "\x1b[1m",
    gray: "\x1b[90m",
};

/**
 * Glavna funkcija za izvršavanje koraka
 */
function run(stepName, cmd, args, cwd = ROOT, env = {}) {
    console.log(`\n${C.blue}${C.bold}>>> KORAK: ${stepName}${C.reset}`);
    console.log(`${C.gray}$ ${cmd} ${args.join(" ")}${C.reset}`);

    const start = Date.now();
    const procEnv = { ...process.env, ...env, CI: "true" };

    const result = spawnSync(cmd, args, {
        cwd,
        stdio: "inherit",
        shell: true,
        env: procEnv,
    });

    const end = Date.now();
    const duration = ((end - start) / 1000).toFixed(2);
    TIMINGS.push({ step: stepName, time: duration });

    if (result.status !== 0) {
        console.error(`\n${C.red}${C.bold}❌ GREŠKA u koraku: ${stepName}${C.reset}`);
        process.exit(1);
    }

    console.log(`${C.green}✅ Uspešno (${duration}s)${C.reset}`);
}

// --- PAMETNE PROVERE (CUSTOM CHECKS) ---

function checkGitClean() {
    // Proverava da li je git status čist nakon formatiranja
    const result = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
    if (result.stdout.trim().length > 0) {
        console.error(`\n${C.red}${C.bold}⛔ CRITICAL: Detektovane su nekomitovane izmene!${C.reset}`);
        console.error(`${C.yellow}Skripta je automatski formatirala kod (Step 1).`);
        console.error(`Molim te komituj ove izmene pre nego što nastaviš, da bi CI bio čist.${C.reset}`);
        console.log(result.stdout);
        process.exit(1);
    }
}

function checkVersionSync() {
    console.log(`\n${C.blue}${C.bold}>>> KORAK: Version Check (Sync)${C.reset}`);
    const pkg = require(path.join(ROOT, "package.json"));
    const manifestPath = path.join(ROOT, "src", "static", "manifest.webmanifest"); // ili manifest.xml

    if (!fs.existsSync(manifestPath)) {
        console.log(`${C.yellow}⚠️  Manifest fajl nije nađen, preskačem proveru verzije.${C.reset}`);
        return;
    }

    const manifestContent = fs.readFileSync(manifestPath, "utf8");
    // Jednostavna provera da li manifest sadrži verziju iz package.json
    // Ovo možeš prilagoditi zavisno od formata tvog manifesta
    if (!manifestContent.includes(pkg.version)) {
        console.error(`${C.red}❌ VERZJE SE NE POKLAPAJU!${C.reset}`);
        console.error(`Package.json: ${pkg.version}`);
        console.error(`Manifest fajl nema tu verziju.`);
        process.exit(1);
    }
    console.log(`${C.green}✅ Verzije su usklađene: ${pkg.version}${C.reset}`);
}

function checkWasmSize() {
    console.log(`\n${C.blue}${C.bold}>>> KORAK: Performance Budget (WASM)${C.reset}`);
    // Putanja do kompajliranog wasm fajla (prilagodi ako je drugačija)
    const wasmPath = path.join(ROOT, "src", "wasm-core", "pkg", "serbian_transliterator_wasm_bg.wasm");

    if (fs.existsSync(wasmPath)) {
        const stats = fs.statSync(wasmPath);
        const sizeMB = stats.size / (1024 * 1024);
        console.log(`${C.gray}WASM Veličina: ${sizeMB.toFixed(2)} MB${C.reset}`);

        if (sizeMB > MAX_WASM_SIZE_MB) {
            console.error(
                `${C.red}❌ PREVELIKI FAJL! WASM je veći od limita (${MAX_WASM_SIZE_MB}MB)${C.reset}`
            );
            process.exit(1);
        }
        console.log(`${C.green}✅ Veličina je u granicama normale.${C.reset}`);
    } else {
        console.log(`${C.yellow}⚠️  WASM fajl nije nađen (možda još nije bildovan).${C.reset}`);
    }
}

// --- MAIN EXECUTION ---

console.log(`${C.magenta}${C.bold}
╔════════════════════════════════════════════╗
║    🚀 ULTIMATE VERIFICATION WORKFLOW 🚀    ║
║       Zero Tolerance • Auto-Fixing         ║
╚════════════════════════════════════════════╝
${C.reset}`);

const totalStart = Date.now();

// 1. System Info
console.log(`${C.gray}Node: ${process.version} | Platform: ${process.platform}${C.reset}`);

// 0. Clean
run("0. Clean Environment", "npm", ["run", "clean"]);

// 1. Format FIX & Check Dirty
run("1. Auto-Format Code", "npm", ["run", "format:fix"]);
checkGitClean(); // <--- OVO JE KLJUČNO! Pada ako je format:fix nešto promenio.

// 2. Static Analysis
run("2.1 Strict Linting", "npx", ["eslint", "src/**/*.ts", "--max-warnings=0"]);
run("2.2 Typecheck", "npm", ["run", "typecheck"]);
checkVersionSync(); // <--- Provera verzija

// 3. Rust Core
run("3. Rust Core Strict Test", "cargo", ["test"], WASM_DIR, { RUSTFLAGS: "-D warnings" });

// 4. Security
run("4. Security Audit", "npm", ["audit"]);

// 5. Build
run("5. Production Build", "npm", ["run", "build"]);
checkWasmSize(); // <--- Provera veličine fajla

// 6. Verification
const requiredFiles = [path.join(ROOT, "dist", "taskpane.html")];
requiredFiles.forEach((f) => {
    if (!fs.existsSync(f)) {
        console.error(`${C.red}❌ Nedostaje fajl: ${f}${C.reset}`);
        process.exit(1);
    }
});

// 7. Testing
run("7. JS Unit Tests", "npm", ["run", "test:coverage"]);
run("8. Integrity Guards", "npm", ["run", "check:i18n"]);
run("9. E2E Tests", "npm", ["run", "test:e2e"]);

// --- SUMMARY ---
const totalEnd = Date.now();
const totalDuration = ((totalEnd - totalStart) / 1000).toFixed(2);

console.log(`\n${C.cyan}📊 IZVEŠTAJ IZVRŠENJA:${C.reset}`);
TIMINGS.forEach((t) => {
    console.log(`   • ${t.step.padEnd(25)} : ${t.time}s`);
});
console.log(`   --------------------------------`);
console.log(`   ${C.bold}UKUPNO                    : ${totalDuration}s${C.reset}`);

console.log(`\n${C.green}${C.bold}🏆 SAVRŠENO! SPREMNO ZA RELEASE.${C.reset}\n`);
