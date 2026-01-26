const { spawnSync } = require("child_process");
const path = require("path");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");

// ANSI boje za lepši ispis
const C = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    red: "\x1b[31m",
    bold: "\x1b[1m",
};

function run(stepName, cmd, args, cwd = ROOT) {
    console.log(`\n${C.blue}${C.bold}>>> KORAK: ${stepName}${C.reset}`);
    console.log(`${C.yellow}$ ${cmd} ${args.join(" ")}${C.reset}`);

    const start = Date.now();
    const result = spawnSync(cmd, args, {
        cwd,
        stdio: "inherit",
        shell: true,
    });
    const end = Date.now();

    if (result.status !== 0) {
        console.error(`\n${C.red}${C.bold}❌ GREŠKA u koraku: ${stepName}${C.reset}`);
        process.exit(1);
    }

    console.log(`${C.green}✅ Uspešno (${((end - start) / 1000).toFixed(2)}s)${C.reset}`);
}

console.log(`${C.bold}🚀 STARTING FULL VERIFICATION WORKFLOW${C.reset}`);
const totalStart = Date.now();

// 0. Format Fix
run("0. Format Fix", "npm", ["run", "format:fix"]);

// 1. Linting & Types
run("1.1 Lint Fix", "npm", ["run", "lint:fix"]);
run("1.2 Typecheck", "npm", ["run", "typecheck"]);

// 2. Rust Core Logic
run("2. Rust Core Tests", "cargo", ["test"], WASM_DIR);

// 3. Security Audit
run("3. Security Audit", "npm", ["audit"]);

// 4. Build (Clean + Build)
run("4.1 Clean", "npm", ["run", "clean"]);
run("4.2 Build (Production)", "npm", ["run", "build"]);

// 5. JS Unit & Fuzz Tests
run("5. JS Tests (Coverage)", "npm", ["run", "test:coverage"]);

// 6. Manifest Validation
run("6. Manifest Validation", "npm", ["run", "validate:prod"]);

// 7. Internal Security Checks
run("7.1 i18n Guard", "npm", ["run", "check:i18n"]);
run("7.2 Conflict Guard", "npm", ["run", "check:conflicts"]);

// 8. E2E Tests (Playwright)
// Ovo ide na kraj jer je najsporije i zahteva prethodni build
run("8. E2E Tests", "npm", ["run", "test:e2e"]);

const totalEnd = Date.now();
const duration = ((totalEnd - totalStart) / 1000 / 60).toFixed(2);

console.log(
    `\n${C.green}${C.bold}🎉 SVI TESTOVI PROŠLI! SPREMNO ZA RELEASE. (Ukupno: ${duration} min)${C.reset}\n`
);
