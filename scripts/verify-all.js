// scripts/verify-all.js
const { spawnSync } = require("child_process");
const path = require("path");

const ROOT = process.cwd();
const WASM_DIR = path.join(ROOT, "src", "wasm-core");

// ANSI boje
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

// 0. Clean (Simulacija CI okruženja)
run("0. Clean Environment", "npm", ["run", "clean"]);

// 1. Format Fix
run("1. Format Fix", "npm", ["run", "format:fix"]);

// 2. Linting & Types
run("2.1 Lint Fix", "npm", ["run", "lint:fix"]);
run("2.2 Typecheck", "npm", ["run", "typecheck"]);

// 3. Rust Core Logic
run("3. Rust Core Tests", "cargo", ["test"], WASM_DIR);

// 4. Security Audit
run("4. Security Audit", "npm", ["audit"]);

// 5. Build (Production)
run("5. Build (Production)", "npm", ["run", "build"]);

// 6. JS Unit & Fuzz Tests
run("6. JS Tests (Coverage)", "npm", ["run", "test:coverage"]);

// 7. Manifest Validation
run("7. Manifest Validation", "npm", ["run", "validate:prod"]);

// 8. Internal Security & Integrity Guards
run("8.1 i18n Guard (Hardcoded & Missing Keys)", "npm", ["run", "check:i18n"]);
run("8.2 Conflict Guard", "npm", ["run", "check:conflicts"]);

// 9. E2E Tests (Playwright)
run("9. E2E Tests", "npm", ["run", "test:e2e"]);

const totalEnd = Date.now();
const duration = ((totalEnd - totalStart) / 1000 / 60).toFixed(2);

console.log(
    `\n${C.green}${C.bold}🎉 SVI TESTOVI PROŠLI! SPREMNO ZA RELEASE. (Ukupno: ${duration} min)${C.reset}\n`
);
